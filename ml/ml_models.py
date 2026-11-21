
from __future__ import annotations

import csv
import os
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor


# Features used for regression (arrival_quantity excluded — not in CSV)
NUMERIC_FEATURES     = ("min_price", "max_price", "month", "day_of_year")
CATEGORICAL_FEATURES = ("state", "commodity", "variety", "grade")
FEATURES             = NUMERIC_FEATURES + CATEGORICAL_FEATURES


# ─────────────────────────────────────────────────────────────────────────────
# 1. DATA LOADING  (no row cap — trains on full dataset)
# ─────────────────────────────────────────────────────────────────────────────

def load_market_records(path: str | Path, max_records: int | None = None) -> list[dict[str, Any]]:
    """
    Load all APMC mandi records from the CSV.
    max_records=None (default) loads the entire dataset.
    arrival_quantity is intentionally excluded — the government CSV does not
    provide it, so hardcoding 0 would corrupt the correlation matrix with NaNs.
    """
    records: list[dict[str, Any]] = []
    with Path(path).open(encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            try:
                date_value = datetime.strptime(
                    row["Arrival_Date"].replace("/", "-"), "%d-%m-%Y"
                )
                min_p   = float(row["Min_x0020_Price"].replace(",", ""))
                max_p   = float(row["Max_x0020_Price"].replace(",", ""))
                modal_p = float(row["Modal_x0020_Price"].replace(",", ""))
                if min_p <= 0 or max_p <= 0 or modal_p <= 0:
                    continue
                records.append({
                    "state":       row["State"].strip(),
                    "commodity":   row["Commodity"].strip(),
                    "variety":     row["Variety"].strip(),
                    "grade":       row["Grade"].strip(),
                    "min_price":   min_p,
                    "max_price":   max_p,
                    "modal_price": modal_p,
                    "month":       date_value.month,
                    "day_of_year": date_value.timetuple().tm_yday,
                })
                if max_records and len(records) >= max_records:
                    break
            except (KeyError, TypeError, ValueError):
                continue
    if len(records) < 20:
        raise ValueError("At least 20 valid market records are required for ML training.")
    return records


def _features(records: list[dict[str, Any]]) -> tuple[pd.DataFrame, list[float]]:
    return (
        pd.DataFrame([{k: r[k] for k in FEATURES} for r in records]),
        [r["modal_price"] for r in records],
    )


def _preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("numeric",     StandardScaler(),                       list(NUMERIC_FEATURES)),
        ("categorical", OneHotEncoder(handle_unknown="ignore"), list(CATEGORICAL_FEATURES)),
    ])


# ─────────────────────────────────────────────────────────────────────────────
# 2. TRAINING ENGINE
# ─────────────────────────────────────────────────────────────────────────────

def train_models(records: list[dict[str, Any]], random_state: int = 42) -> dict[str, Any]:
    """Train Linear Regression, Decision Tree, K-Means, and compute correlations."""

    features, prices = _features(records)
    x_train, x_test, y_train, y_test = train_test_split(
        features, prices, test_size=0.2, random_state=random_state
    )

    # ── Regression ────────────────────────────────────────────────────────────
    regressors = {
        "linear_regression":        LinearRegression(),
        "decision_tree_regression": DecisionTreeRegressor(max_depth=8, random_state=random_state),
    }
    regression_metrics: dict[str, dict[str, float]] = {}
    for name, estimator in regressors.items():
        pipeline = Pipeline([("preprocessor", _preprocessor()), ("model", estimator)])
        pipeline.fit(x_train, y_train)
        preds  = pipeline.predict(x_test)
        y_arr  = np.array(y_test, dtype=float)
        # Clip MAPE: exclude rows where actual price < ₹50 to avoid division explosion
        mask   = y_arr >= 50
        mape   = float(np.mean(np.abs((y_arr[mask] - preds[mask]) / y_arr[mask])) * 100) if mask.any() else 0.0
        regression_metrics[name] = {
            "mae":      round(float(mean_absolute_error(y_arr, preds)), 2),
            "rmse":     round(float(np.sqrt(mean_squared_error(y_arr, preds))), 2),
            "r2":       round(float(r2_score(y_arr, preds)), 4),
            "mape_pct": round(mape, 2),
        }

    # ── K-Means clustering ────────────────────────────────────────────────────
    cluster_arr = StandardScaler().fit_transform(np.array([
        [r["min_price"], r["max_price"], r["modal_price"]]
        for r in records
    ]))
    km = KMeans(n_clusters=3, random_state=random_state, n_init=10).fit(cluster_arr)

    # ── Pearson correlation (only columns that actually vary) ─────────────────
    corr_df = pd.DataFrame({
        "Min Price":    [r["min_price"]   for r in records],
        "Max Price":    [r["max_price"]   for r in records],
        "Modal Price":  [r["modal_price"] for r in records],
        "Month":        [r["month"]       for r in records],
        "Day of Year":  [r["day_of_year"] for r in records],
    })
    # Drop constant columns (std == 0) before computing correlation to avoid NaN
    corr_df = corr_df.loc[:, corr_df.std() > 0]
    correlation = corr_df.corr().round(4).to_dict()

    return {
        "engine":        "Scikit-Learn ML Pipeline",
        "trained_on":    len(records),
        "features":      list(FEATURES),
        "regression":    regression_metrics,
        "clustering": {
            "algorithm":     "k_means",
            "k":             3,
            "cluster_sizes": np.bincount(km.labels_, minlength=3).tolist(),
        },
        "correlation":   correlation,
        "models_retained": [
            "Linear Regression (Price Baseline)",
            "Decision Tree Regressor (Spread Volatility)",
            "K-Means Clustering (Market Profiling)",
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# 3. CORRELATION HEATMAP
# ─────────────────────────────────────────────────────────────────────────────

def write_correlation_heatmap(records: list[dict[str, Any]], output_path: str | Path) -> None:
    """Save a Pearson correlation heatmap PNG."""
    os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import seaborn as sns

    df = pd.DataFrame({
        "Min Price":   [r["min_price"]   for r in records],
        "Max Price":   [r["max_price"]   for r in records],
        "Modal Price": [r["modal_price"] for r in records],
        "Month":       [r["month"]       for r in records],
        "Day of Year": [r["day_of_year"] for r in records],
    })
    df = df.loc[:, df.std() > 0]   # drop constant columns

    fig, ax = plt.subplots(figsize=(8, 6), dpi=150)
    sns.heatmap(
        df.corr(), annot=True, fmt=".3f", cmap="coolwarm",
        vmin=-1, vmax=1, linewidths=0.8, linecolor="white",
        cbar_kws={"label": "Pearson Correlation Coefficient"}, ax=ax,
    )
    ax.set_title(
        "AgriMarket AI: Inter-Feature Pearson Correlation Heatmap",
        fontsize=12, pad=12, fontweight="bold",
    )
    plt.tight_layout()
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(str(out))
    plt.close(fig)


# ─────────────────────────────────────────────────────────────────────────────
# 4. UNIFIED ENTRY POINT (used by backend/views.py)
# ─────────────────────────────────────────────────────────────────────────────

def train_dataset(path: str | Path, heatmap_path: str | Path | None = None) -> dict[str, Any]:
    """Load full dataset, train all models, optionally write heatmap."""
    records = load_market_records(path)
    payload = train_models(records)
    if heatmap_path:
        write_correlation_heatmap(records, heatmap_path)
        payload["correlation_heatmap"] = str(Path(heatmap_path).resolve())
    return payload


# ─────────────────────────────────────────────────────────────────────────────
# 5. READABLE TERMINAL REPORT
# ─────────────────────────────────────────────────────────────────────────────

def print_report(results: dict[str, Any]) -> None:
    """Print a human-readable training report to the terminal."""
    W = 80
    reg     = results["regression"]
    cluster = results["clustering"]
    corr    = results["correlation"]
    lr      = reg["linear_regression"]
    dt      = reg["decision_tree_regression"]

    print("\n" + "=" * W)
    print("  AGRIMARKET AI — MACHINE LEARNING TRAINING REPORT")
    print("=" * W)
    print(f"  Engine          : {results['engine']}")
    print(f"  Records Trained : {results['trained_on']:,}")
    print(f"  Features Used   : {', '.join(results['features'])}")
    print("-" * W)

    # Regression
    print("\n  [1] SUPERVISED LEARNING — PRICE REGRESSION MODELS")
    print(f"  {'Model':<30} {'R²':>8}  {'MAE (₹/qtl)':>13}  {'RMSE (₹/qtl)':>13}  {'MAPE %':>8}")
    print("  " + "-" * (W - 2))
    print(f"  {'Linear Regression':<30} {lr['r2']:>8.4f}  ₹{lr['mae']:>12.2f}  ₹{lr['rmse']:>12.2f}  {lr['mape_pct']:>7.2f}%")
    print(f"  {'Decision Tree (d=8)':<30} {dt['r2']:>8.4f}  ₹{dt['mae']:>12.2f}  ₹{dt['rmse']:>12.2f}  {dt['mape_pct']:>7.2f}%")

    # K-Means
    print("\n" + "-" * W)
    print(f"  [2] UNSUPERVISED LEARNING — K-MEANS MARKET SEGMENTATION (k={cluster['k']})")
    labels = ["Local Rural Yards", "Regional APMCs", "Terminal Mega-Hubs"]
    sizes  = cluster["cluster_sizes"]
    total  = sum(sizes)
    for i, (label, size) in enumerate(zip(labels, sizes)):
        pct = size / total * 100 if total else 0
        print(f"      Cluster {i}  {label:<22} : {size:>6,} records  ({pct:.1f}%)")

    # Correlation
    print("\n" + "-" * W)
    print("  [3] PEARSON CORRELATION MATRIX")
    cols = list(corr.keys())
    col_w = 13
    header = f"  {'Feature':<18}" + "".join(f"{c[:col_w]:>{col_w}}" for c in cols)
    print(header)
    print("  " + "-" * (len(header) - 2))
    for row_name, row_vals in corr.items():
        vals = "".join(f"{row_vals.get(c, float('nan')):>{col_w}.4f}" for c in cols)
        print(f"  {row_name:<18}{vals}")

    # Heatmap
    if results.get("correlation_heatmap"):
        print(f"\n  Heatmap saved → {results['correlation_heatmap']}")

    print("=" * W + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    root    = Path(__file__).resolve().parents[1]
    dataset = root / "data_engine" / "Dataset.csv"
    heatmap = root / "ml" / "correlation_heatmap.png"

    if not dataset.exists():
        print(f"Error: Dataset not found at {dataset}", file=sys.stderr)
        sys.exit(1)

    results = train_dataset(dataset, heatmap)
    print_report(results)
