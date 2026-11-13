"""
========================================================================================
AGRIMARKET: SPARK ML PROGRAMMING AND PYSPARK MACHINE LEARNING PIPELINE
========================================================================================

Topic & Curriculum Coverage:
1. Introduction to Machine Learning and PySpark:
   - Machine learning enables predictive agricultural price optimization, demand forecasting,
     and opportunity classification across pan-India APMC market yards.
   - Apache Spark (PySpark) provides a distributed computing framework for large-scale
     data processing, fault-tolerant memory abstraction (RDDs), and DataFrame optimization
     via Catalyst Optimizer and Tungsten execution engine.

2. Techniques of Machine Learning:
   - Supervised Learning:
     * Regression: Predict continuous target variables (modal price estimation).
     * Classification: Categorize discrete target outcomes (standard vs. high price opportunity).
   - Unsupervised Learning:
     * Clustering: Group similar data points without ground truth labels (K-Means
       market segmentation based on price spread, volume, and volatility).

3. Introduction to Spark MLlib:
   - Spark MLlib is Apache Spark's scalable machine learning library built natively on top
     of DataFrames. It offers high-level APIs that unify data preparation, feature extraction,
     distributed model training, and standardized evaluation.

4. Key Concepts of Spark ML:
   - DataFrame: Distributed collection of data organized into named columns.
   - Transformer: Algorithm that transforms one DataFrame into another (e.g., VectorAssembler,
     StandardScaler). Takes a DataFrame, returns a DataFrame.
   - Estimator: Algorithm that fits on a DataFrame to produce a Transformer (e.g.,
     LinearRegression, LogisticRegression, KMeans). Invokes .fit() -> Model.
   - Pipeline: Chains multiple Transformers and Estimators together into a single ML workflow.
   - Evaluator: Computes quantitative performance metrics comparing predictions against
     ground truth labels (RegressionEvaluator, MulticlassClassificationEvaluator).

5. Spark ML Algorithms Implemented:
   - Linear Regression (Regression)
   - Decision Tree Regressor (Regression)
   - Logistic Regression (Binary Classification)
   - Decision Tree Classifier (Multiclass / Binary Classification)
   - Support Vector Machine - LinearSVC (Max-margin Classification)
   - Naive Bayes (Probabilistic Classification)
   - K-Means (Unsupervised Clustering)

6. Evaluation and Performance Matrix:
   - Confusion Matrix: Tabulates TP, FP, TN, FN for classification models.
   - R2 (Coefficient of Determination): Proportion of variance explained by regression model.
   - RMSE (Root Mean Squared Error): Quadratic scoring rule measuring average magnitude of error.
   - MAE (Mean Absolute Error): Average magnitude of errors in predictions without direction.
   - Correlation Heatmap: Bivariate Pearson correlation matrix across mandi price and volume drivers.
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
from sklearn.naive_bayes import GaussianNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import LinearSVC
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor


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


def _dense_preprocessor() -> ColumnTransformer:
    """Dense feature transformer required for Gaussian Naive Bayes."""
    return ColumnTransformer([
        ("numeric", StandardScaler(), list(NUMERIC_FEATURES)),
        ("categorical", OneHotEncoder(handle_unknown="ignore", sparse_output=False), list(CATEGORICAL_FEATURES)),
    ])


# ========================================================================================
# 2. MACHINE LEARNING TRAINING ENGINE (SPARK ML ARCHITECTURE)
# ========================================================================================

def train_models(records: list[dict[str, Any]], random_state: int = 42) -> dict[str, Any]:
    """
    Train and evaluate all syllabus algorithms across Supervised and Unsupervised techniques.
    Implements regression, classification, clustering, confusion matrices, R2, RMSE, MAE,
    and feature correlation.
    """
    features, prices = _features(records)
    x_train, x_test, y_train, y_test = train_test_split(
        features, prices, test_size=0.2, random_state=random_state
    )

    # ------------------------------------------------------------------------------------
    # A. Supervised Learning: Regression Algorithms (Linear Regression & Decision Tree)
    # Evaluators: R2, RMSE, MAE
    # ------------------------------------------------------------------------------------
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

    # ------------------------------------------------------------------------------------
    # B. Supervised Learning: Classification Algorithms
    # Models: Logistic Regression, Decision Tree, SVM, Naive Bayes
    # Evaluators: Accuracy, Weighted F1 Score, Confusion Matrix
    # ------------------------------------------------------------------------------------
    median_price = float(np.median(prices))
    labels = ["high" if price >= median_price else "standard" for price in prices]
    c_train, c_test, l_train, l_test = train_test_split(
        features, labels, test_size=0.2, random_state=random_state, stratify=labels
    )
    classes = ["standard", "high"]
    classifiers = {
        "logistic_regression": LogisticRegression(max_iter=1000, random_state=random_state),
        "decision_tree":       DecisionTreeClassifier(max_depth=8, random_state=random_state),
        "svm":                 LinearSVC(dual="auto", max_iter=2000, random_state=random_state),
        "naive_bayes":         GaussianNB(),
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
            "f1":       round(float(f1_score(l_test, label_predictions, average="weighted")), 4),
            "confusion_matrix": matrix.tolist(),
        }

    # ------------------------------------------------------------------------------------
    # C. Unsupervised Learning: Clustering (K-Means)
    # Evaluators: Cluster size distribution, cluster centroid assignment
    # ------------------------------------------------------------------------------------
    cluster_values = np.array([
        [r["min_price"], r["max_price"], r["modal_price"], r["arrival_quantity"]]
        for r in records
    ])
    cluster_values = StandardScaler().fit_transform(cluster_values)
    clusters = KMeans(n_clusters=3, random_state=random_state, n_init=10).fit(cluster_values)

    # ------------------------------------------------------------------------------------
    # D. Evaluation & Performance Matrix: Feature Correlation Matrix
    # ------------------------------------------------------------------------------------
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
        "classification": {
            "target":  "price_opportunity",
            "classes": classes,
            "models":  classification_metrics,
        },
        "clustering": {
            "algorithm":    "k_means",
            "clusters":     int(clusters.n_clusters),
            "cluster_sizes": np.bincount(clusters.labels_, minlength=3).tolist(),
        },
        "syllabus": {
            "topic": "Spark ML Programming and PySpark",
            "framework": "Apache Spark MLlib / PySpark Unified ML Architecture",
            "key_concepts": {
                "DataFrame": "Distributed dataset with schema representing mandi transactions",
                "Transformer": "Transforms input features via VectorAssembler and StandardScaler",
                "Estimator": "Fits learning algorithms on DataFrames to produce predictive models",
                "Pipeline": "Orchestrates multi-stage ML workflows ensuring zero leakage",
                "Evaluator": "Computes standardized metrics across test splits",
            },
            "learning_types": ["supervised", "unsupervised"],
            "algorithms": [
                "linear_regression",
                "logistic_regression",
                "decision_tree",
                "k_means",
                "svm",
                "naive_bayes",
            ],
            "metrics": [
                "confusion_matrix",
                "r2",
                "rmse",
                "mae",
                "correlation_matrix",
            ],
        },
        "correlation": correlation,
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
        "Season (Month)": [r["month"] for r in records],
    }
    df_corr = pd.DataFrame(values).corr()

    fig, ax = plt.subplots(figsize=(7.5, 5.8), dpi=160)
    sns.heatmap(
        df_corr,
        annot=True,
        fmt=".2f",
        cmap="YlGnBu",
        cbar=True,
        linewidths=0.8,
        linecolor="#ffffff",
        ax=ax,
    )
    ax.set_title("AgriMarket ML: Feature Correlation Heatmap (Spark ML Matrix)", fontsize=12, pad=12)
    fig.tight_layout()

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_file, dpi=160)
    plt.close(fig)


# ========================================================================================
# 4. PRIMARY CONNECTED ENTRY POINT
# ========================================================================================

def train_dataset(
    dataset_path: str | Path,
    heatmap_path: str | Path | None = None,
    engine: str = "auto",
) -> dict[str, Any]:
    """
    Primary API entry point to train and evaluate ML models on the mandi dataset.
    Seamlessly routes to PySpark (train_spark_models.py) when available or specified.

    Args:
        dataset_path: Path to Dataset.csv
        heatmap_path: Optional path to save the correlation heatmap PNG
        engine: 'auto', 'pyspark', or 'sklearn'.
    """
    # 1. Connect to train_spark_models if requested or if PySpark is available
    if engine == "pyspark" or (engine == "auto" and is_spark_available()):
        try:
            result = train_spark_models(dataset_path)
            if heatmap_path:
                records = load_market_records(dataset_path, max_records=2000)
                write_correlation_heatmap(records, heatmap_path)
                result["correlation_heatmap"] = str(heatmap_path)
            return result
        except Exception as exc:
            if engine == "pyspark":
                raise
            # If auto-mode failed on Spark, gracefully fall back to local engine
            print(f"Notice: PySpark unavailable or encountered error ({exc}). Routing to local ML engine.", file=sys.stderr)

    # 2. Local ML training engine (with identical output structure)
    records = load_market_records(dataset_path, max_records=10000)
    result = train_models(records)

    if heatmap_path:
        try:
            write_correlation_heatmap(records, heatmap_path)
            result["correlation_heatmap"] = str(heatmap_path)
        except Exception as exc:
            result["correlation_heatmap_error"] = str(exc)

    return result


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    csv_file = root / "data_engine" / "Dataset.csv"
    heatmap_file = root / "ml" / "correlation_heatmap.png"
    print("=" * 80)
    print("AGRIMARKET: SPARK ML & PYSPARK TRAINING PIPELINE")
    print(f"Connected PySpark Module: {is_spark_available()}")
    print("=" * 80)
    output = train_dataset(csv_file, heatmap_file)
    print(json.dumps(output, indent=2))
