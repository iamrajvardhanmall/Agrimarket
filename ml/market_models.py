"""Train and evaluate market-price and opportunity models."""

from __future__ import annotations

import csv
import json
from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor


NUMERIC_FEATURES = ("min_price", "max_price", "arrival_quantity", "month", "day_of_year")
CATEGORICAL_FEATURES = ("state", "commodity", "variety", "grade")
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def load_market_records(path: str | Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with Path(path).open(encoding="utf-8-sig", newline="") as source:
        for row in csv.DictReader(source):
            try:
                date_value = datetime.strptime(row["Arrival_Date"], "%d-%m-%Y")
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
            except (KeyError, TypeError, ValueError):
                continue
    if len(records) < 20:
        raise ValueError("At least 20 valid market records are required for ML training.")
    return records


def _features(records: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[float]]:
    return (pd.DataFrame([{key: record[key] for key in FEATURES} for record in records]),
            [record["modal_price"] for record in records])


def _preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("numeric", StandardScaler(), list(NUMERIC_FEATURES)),
        ("categorical", OneHotEncoder(handle_unknown="ignore"), list(CATEGORICAL_FEATURES)),
    ])


def _dense_preprocessor() -> ColumnTransformer:
    return ColumnTransformer([
        ("numeric", StandardScaler(), list(NUMERIC_FEATURES)),
        ("categorical", OneHotEncoder(handle_unknown="ignore", sparse_output=False), list(CATEGORICAL_FEATURES)),
    ])


def train_models(records: list[dict[str, Any]], random_state: int = 42) -> dict[str, Any]:
    features, prices = _features(records)
    x_train, x_test, y_train, y_test = train_test_split(
        features, prices, test_size=0.2, random_state=random_state
    )

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
            "mae": round(float(mean_absolute_error(y_test, predictions)), 2),
            "rmse": round(float(np.sqrt(mean_squared_error(y_test, predictions))), 2),
            "r2": round(float(r2_score(y_test, predictions)), 4),
        }

    median_price = float(np.median(prices))
    labels = ["high" if price >= median_price else "standard" for price in prices]
    c_train, c_test, l_train, l_test = train_test_split(
        features, labels, test_size=0.2, random_state=random_state, stratify=labels
    )
    classes = ["standard", "high"]
    classifiers = {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=random_state),
        "decision_tree": DecisionTreeClassifier(max_depth=8, random_state=random_state),
        "svm": SVC(kernel="rbf", random_state=random_state),
        "naive_bayes": GaussianNB(),
    }
    classification_metrics: dict[str, dict[str, Any]] = {}
    for name, estimator in classifiers.items():
        preprocessor = _dense_preprocessor() if name == "naive_bayes" else _preprocessor()
        classifier = Pipeline([("preprocessor", preprocessor), ("model", estimator)])
        classifier.fit(c_train, l_train)
        label_predictions = classifier.predict(c_test)
        matrix = confusion_matrix(l_test, label_predictions, labels=classes)
        classification_metrics[name] = {
            "accuracy": round(float(accuracy_score(l_test, label_predictions)), 4),
            "f1": round(float(f1_score(l_test, label_predictions, average="weighted")), 4),
            "confusion_matrix": matrix.tolist(),
        }

    cluster_values = np.array([
        [record["min_price"], record["max_price"], record["modal_price"], record["arrival_quantity"]]
        for record in records
    ])
    cluster_values = StandardScaler().fit_transform(cluster_values)
    clusters = KMeans(n_clusters=3, random_state=random_state, n_init=10).fit(cluster_values)
    correlation = pd.DataFrame({
        "min_price": [record["min_price"] for record in records],
        "max_price": [record["max_price"] for record in records],
        "modal_price": [record["modal_price"] for record in records],
        "arrival_quantity": [record["arrival_quantity"] for record in records],
        "month": [record["month"] for record in records],
    }).corr().round(4).to_dict()

    return {
        "trained_on": len(records),
        "features": list(FEATURES),
        "regression": regression_metrics,
        "classification": {
            "target": "price_opportunity",
            "classes": classes,
            "models": classification_metrics,
        },
        "clustering": {
            "algorithm": "k_means",
            "clusters": int(clusters.n_clusters),
            "cluster_sizes": np.bincount(clusters.labels_, minlength=3).tolist(),
        },
        "syllabus": {
            "learning_types": ["supervised", "unsupervised"],
            "algorithms": [
                "linear_regression", "logistic_regression", "decision_tree",
                "k_means", "svm", "naive_bayes",
            ],
            "metrics": ["confusion_matrix", "r2", "rmse", "mae"],
        },
        "correlation": correlation,
    }


def write_correlation_heatmap(records: list[dict[str, Any]], output_path: str | Path) -> None:
    import matplotlib.pyplot as plt
    import seaborn as sns

    values = {
        "min_price": [record["min_price"] for record in records],
        "max_price": [record["max_price"] for record in records],
        "modal_price": [record["modal_price"] for record in records],
        "arrival_quantity": [record["arrival_quantity"] for record in records],
        "month": [record["month"] for record in records],
    }
    correlation = pd.DataFrame(values).corr()
    figure = plt.figure(figsize=(8, 6))
    sns.heatmap(correlation, annot=True, cmap="YlGnBu",
                xticklabels=values.keys(), yticklabels=values.keys())
    figure.tight_layout()
    figure.savefig(output_path, dpi=160)
    plt.close(figure)


def train_dataset(dataset_path: str | Path, heatmap_path: str | Path | None = None) -> dict[str, Any]:
    records = load_market_records(dataset_path)
    result = train_models(records)
    if heatmap_path:
        write_correlation_heatmap(records, heatmap_path)
        result["correlation_heatmap"] = str(heatmap_path)
    return result


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    output = train_dataset(root / "data_engine" / "Dataset.csv", root / "ml" / "correlation_heatmap.png")
    print(json.dumps(output, indent=2))
