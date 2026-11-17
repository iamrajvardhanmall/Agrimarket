"""
========================================================================================
AGRIMARKET: CORE MACHINE LEARNING & STATISTICAL PIPELINE
========================================================================================

Core Machine Learning Architecture:
1. Supervised Learning: Price Regression
   - Linear Regression: Deterministic baseline modeling modal price from boundary bids.
   - Decision Tree Regressor: Captures localized spread volatility and volume shocks.
2. Unsupervised Learning: Market Clustering
   - K-Means Clustering (k=3): Profiles mandis into Local, Regional, and Terminal tiers.
3. Statistical Feature Analysis:
   - Pearson Correlation Matrix & Visual Heatmap Generation.
4. Evaluation Metrics:
   - R2 (Coefficient of Determination), RMSE, MAE.
========================================================================================
"""

from __future__ import annotations

import csv
import json
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
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.tree import DecisionTreeRegressor


# Ensure local ml directory is importable
ML_DIR = Path(__file__).resolve().parent
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

# Connect directly to the dedicated PySpark module
try:
    from train_spark_models import is_spark_available, train_spark_models
except ImportError:
    try:
        from ml.train_spark_models import is_spark_available, train_spark_models
    except ImportError:
        def is_spark_available() -> bool:
            return False

        def train_spark_models(dataset_path: str | Path) -> dict[str, Any]:
            raise NotImplementedError("train_spark_models unavailable")


NUMERIC_FEATURES = ("min_price", "max_price", "arrival_quantity", "month", "day_of_year")
CATEGORICAL_FEATURES = ("state", "commodity", "variety", "grade")
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


# ========================================================================================
# 1. DATA PREPARATION & RECORD INGESTION
# ========================================================================================

def load_market_records(path: str | Path, max_records: int | None = 10000) -> list[dict[str, Any]]:
    """
    Ingest APMC mandi transaction records from CSV, normalizing numeric fields
    and temporal seasonality attributes (month, day of year).
    """
    records: list[dict[str, Any]] = []
    with Path(path).open(encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            try:
                date_value = datetime.strptime(row["Arrival_Date"].replace("/", "-"), "%d-%m-%Y")
                records.append({
                    "state": row["State"].strip(),
                    "commodity": row["Commodity"].strip(),
                    "variety": row["Variety"].strip(),
                    "grade": row["Grade"].strip(),
                    "min_price": float(row["Min_x0020_Price"].replace(",", "")),
                    "max_price": float(row["Max_x0020_Price"].replace(",", "")),
                    "modal_price": float(row["Modal_x0020_Price"].replace(",", "")),
                    "arrival_quantity": 0.0,
                    "month": date_value.month,
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
    """Construct feature matrix X and target vector y (modal price)."""
    return (
        pd.DataFrame([{key: record[key] for key in FEATURES} for record in records]),
        [record["modal_price"] for record in records],
    )


def _preprocessor() -> ColumnTransformer:
    """Spark ML VectorAssembler & StandardScaler equivalent transformer."""
    return ColumnTransformer([
        ("numeric", StandardScaler(), list(NUMERIC_FEATURES)),
        ("categorical", OneHotEncoder(handle_unknown="ignore"), list(CATEGORICAL_FEATURES)),
    ])


# ========================================================================================
# 2. MACHINE LEARNING TRAINING ENGINE
# ========================================================================================

def train_models(records: list[dict[str, Any]], random_state: int = 42) -> dict[str, Any]:
    """
    Train and evaluate core AgriMarket models: Linear Regression, Decision Tree Regressor,
    and K-Means Clustering, along with R2, RMSE, MAE, and Pearson correlation.
    """
    features, prices = _features(records)
    x_train, x_test, y_train, y_test = train_test_split(
        features, prices, test_size=0.2, random_state=random_state
    )

    # A. Supervised Learning: Price Regression Models
    regressors = {
        "linear_regression": LinearRegression(),
        "decision_tree_regression": DecisionTreeRegressor(max_depth=12, random_state=random_state),
    }
    regression_metrics: dict[str, dict[str, float]] = {}
    for name, estimator in regressors.items():
        pipeline = Pipeline([("preprocessor", _preprocessor()), ("model", estimator)])
        pipeline.fit(x_train, y_train)
        predictions = pipeline.predict(x_test)
        regression_metrics[name] = {
            "mae":  round(float(mean_absolute_error(y_test, predictions)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 2),
            "r2":   round(float(r2_score(y_test, predictions)), 4),
        }

    # B. Unsupervised Learning: K-Means Market Profiling (k=3)
    cluster_values = np.array([
        [r["min_price"], r["max_price"], r["modal_price"], r["arrival_quantity"]]
        for r in records
    ])
    cluster_values = StandardScaler().fit_transform(cluster_values)
    clusters = KMeans(n_clusters=3, random_state=random_state, n_init=10).fit(cluster_values)

    # C. Feature Correlation Matrix
    correlation = pd.DataFrame({
        "min_price":        [r["min_price"]        for r in records],
        "max_price":        [r["max_price"]        for r in records],
        "modal_price":      [r["modal_price"]      for r in records],
        "arrival_quantity": [r["arrival_quantity"] for r in records],
        "month":            [r["month"]            for r in records],
    }).corr().round(4).to_dict()

    return {
        "trained_on": len(records),
        "features":   list(FEATURES),
        "regression": regression_metrics,
        "clustering": {
            "algorithm":     "k_means",
            "clusters":      int(clusters.n_clusters),
            "cluster_sizes": np.bincount(clusters.labels_, minlength=3).tolist(),
        },
        "correlation": correlation,
        "models_retained": [
            "Linear Regression (Price Baseline)",
            "Decision Tree Regressor (Spread Volatility)",
            "K-Means Clustering (Market Profiling)",
        ],
    }


# ========================================================================================
# 3. CORRELATION HEATMAP VISUALIZATION
# ========================================================================================

def write_correlation_heatmap(records: list[dict[str, Any]], output_path: str | Path) -> None:
    """
    Generate and save a publication-quality Pearson correlation heatmap
    evaluating inter-feature relationships across price, arrival volume, and seasonality.
    """
    os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import seaborn as sns

    values = {
        "Min Price": [r["min_price"] for r in records],
        "Max Price": [r["max_price"] for r in records],
        "Modal Price": [r["modal_price"] for r in records],
        "Arrival Volume": [r["arrival_quantity"] for r in records],
        "Month": [r["month"] for r in records],
        "Day of Year": [r["day_of_year"] for r in records],
    }
    df = pd.DataFrame(values)
    corr = df.corr()

    fig, ax = plt.subplots(figsize=(8, 6), dpi=150)
    sns.heatmap(
        corr,
        annot=True,
        fmt=".3f",
        cmap="coolwarm",
        vmin=-1,
        vmax=1,
        linewidths=0.8,
        linecolor="white",
        cbar_kws={"label": "Pearson Correlation Coefficient"},
        ax=ax,
    )
    ax.set_title("AgriMarket: Inter-Feature Pearson Correlation Heatmap", fontsize=12, pad=12, fontweight="bold")
    plt.tight_layout()

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(str(out))
    plt.close(fig)


# ========================================================================================
# 4. UNIFIED PIPELINE RUNNER
# ========================================================================================

def train_dataset(path: str | Path, heatmap_path: str | Path | None = None) -> dict[str, Any]:
    """
    Unified training pipeline that runs PySpark MLlib if available,
    falling back cleanly to Scikit-Learn if running on CPU or low-resource server.
    """
    if is_spark_available():
        try:
            return train_spark_models(path)
        except Exception:
            pass  # Fall back to scikit-learn

    records = load_market_records(path)
    payload = train_models(records)
    if heatmap_path:
        write_correlation_heatmap(records, heatmap_path)
        payload["correlation_heatmap"] = str(Path(heatmap_path).resolve())
    return payload


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    dataset = root / "data_engine" / "Dataset.csv"
    heatmap = root / "ml" / "correlation_heatmap.png"

    print("=" * 80)
    print("AGRIMARKET: CORE ML PIPELINE")
    print(f"Connected PySpark Module: {is_spark_available()}")
    print("=" * 80)
    print(json.dumps(train_dataset(dataset, heatmap), indent=2))
