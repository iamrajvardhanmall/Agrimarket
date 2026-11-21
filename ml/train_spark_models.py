from __future__ import annotations
import argparse
import json
import math
import os
import sys
from pathlib import Path
from typing import Any
import numpy as np
import pandas as pd

def is_spark_available() -> bool:
    try:
        import pyspark  # noqa: F401
        from pyspark.sql import SparkSession  # noqa: F401
        return True
    except (ImportError, Exception):
        return False

def train_spark_models(dataset_path: str | Path) -> dict[str, Any]:
    try:
        from pyspark.sql import SparkSession
        from pyspark.sql.functions import col
        from pyspark.ml import Pipeline as SparkPipeline
        from pyspark.ml.feature import VectorAssembler, StandardScaler as SparkScaler
        from pyspark.ml.regression import (
            LinearRegression as SparkLinearRegression,
            DecisionTreeRegressor as SparkDecisionTreeRegressor,
        )
        from pyspark.ml.clustering import KMeans as SparkKMeans
        from pyspark.ml.evaluation import RegressionEvaluator, ClusteringEvaluator
        from pyspark.ml.stat import Correlation
    except ImportError as exc:
        raise ImportError(
            f"PySpark is not installed or unavailable: {exc}. "
            "Please run: pip install pyspark>=3.5.0"
        ) from exc

    spark = (
        SparkSession.builder
        .appName("AgriMarket-SparkML-Pipeline")
        .master("local[*]")
        .config("spark.driver.memory", "2g")
        .config("spark.sql.shuffle.partitions", "4")
        .config("spark.ui.enabled", "false")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("ERROR")

    try:
        raw_df = (
            spark.read.option("header", True)
            .option("inferSchema", True)
            .csv(str(dataset_path))
        )

        df = (
            raw_df.select(
                col("Min_x0020_Price").cast("double").alias("min_price"),
                col("Max_x0020_Price").cast("double").alias("max_price"),
                col("Modal_x0020_Price").cast("double").alias("label"),
            )
            .filter((col("min_price") > 0) & (col("max_price") > 0) & (col("label") > 0))
            .withColumn("spread", col("max_price") - col("min_price"))
            .withColumn("price_ratio", col("max_price") / col("min_price"))
            .na.drop()
        )
        total_records = df.count()

        # 3. Feature Assembly & Scaling Transformers
        feature_cols = ["min_price", "max_price", "spread", "price_ratio"]
        assembler = VectorAssembler(inputCols=feature_cols, outputCol="raw_features")
        scaler = SparkScaler(inputCol="raw_features", outputCol="features", withStd=True, withMean=True)

        # 4. Correlation Matrix
        assembled_all = assembler.transform(df)
        corr_matrix_raw = Correlation.corr(assembled_all, "raw_features", "pearson").head()[0].toArray().tolist()
        corr_dict = {
            feature_cols[i]: {feature_cols[j]: round(corr_matrix_raw[i][j], 4) for j in range(len(feature_cols))}
            for i in range(len(feature_cols))
        }

        # Train / Test split (80% train, 20% test)
        train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

        # 5. Supervised Learning: Regression Models
        reg_metrics: dict[str, dict[str, Any]] = {}

        # 5a. Linear Regression
        lr_estimator = SparkLinearRegression(featuresCol="features", labelCol="label")
        lr_pipeline = SparkPipeline(stages=[assembler, scaler, lr_estimator]).fit(train_df)
        lr_model = lr_pipeline.stages[-1]
        lr_predictions = lr_pipeline.transform(test_df)

        lr_r2 = RegressionEvaluator(metricName="r2").evaluate(lr_predictions)
        lr_rmse = RegressionEvaluator(metricName="rmse").evaluate(lr_predictions)
        lr_mae = RegressionEvaluator(metricName="mae").evaluate(lr_predictions)

        mape_val = (
            lr_predictions.select(
                (col("label") - col("prediction")).alias("err"),
                col("label")
            )
            .select((col("err") / col("label")).alias("pct"))
            .select(col("pct") * 100)
            .toPandas()
            .abs()
            .mean()
            .iloc[0]
        )

        reg_metrics["linear_regression"] = {
            "r2": round(float(lr_r2), 4),
            "rmse": round(float(lr_rmse), 2),
            "mae": round(float(lr_mae), 2),
            "mape_pct": round(float(mape_val), 2),
            "intercept": round(float(lr_model.intercept), 4),
            "coefficients": [round(float(c), 4) for c in lr_model.coefficients],
            "formula": (
                f"Modal = {lr_model.intercept:.2f} + {lr_model.coefficients[0]:.3f}*(Min) "
                f"+ {lr_model.coefficients[1]:.3f}*(Max)"
            ),
        }

        # 5b. Decision Tree Regressor
        dt_estimator = SparkDecisionTreeRegressor(featuresCol="features", labelCol="label", maxDepth=8)
        dt_pipeline = SparkPipeline(stages=[assembler, scaler, dt_estimator]).fit(train_df)
        dt_predictions = dt_pipeline.transform(test_df)

        dt_r2 = RegressionEvaluator(metricName="r2").evaluate(dt_predictions)
        dt_rmse = RegressionEvaluator(metricName="rmse").evaluate(dt_predictions)
        dt_mae = RegressionEvaluator(metricName="mae").evaluate(dt_predictions)

        reg_metrics["decision_tree_regression"] = {
            "r2": round(float(dt_r2), 4),
            "rmse": round(float(dt_rmse), 2),
            "mae": round(float(dt_mae), 2),
            "mape_pct": round(float(dt_mae / (df.approxQuantile("label", [0.5], 0.01)[0]) * 100), 2),
            "max_depth": 8,
        }

        # 6. Unsupervised Learning: K-Means Clustering (k=3)
        kmeans = SparkKMeans(k=3, seed=42, featuresCol="features")
        km_pipe = SparkPipeline(stages=[assembler, scaler, kmeans]).fit(df)
        clustered = km_pipe.transform(df)

        evaluator_km = ClusteringEvaluator(featuresCol="features", predictionCol="prediction", metricName="silhouette")
        silhouette = evaluator_km.evaluate(clustered)

        km_model = km_pipe.stages[-1]
        cluster_centers = [[round(float(val), 2) for val in center] for center in km_model.clusterCenters()]
        k_counts = {str(r.prediction): r["count"] for r in clustered.groupBy("prediction").count().collect()}
        cluster_sizes = [k_counts.get("0", 0), k_counts.get("1", 0), k_counts.get("2", 0)]

        return {
            "engine": "Apache Spark MLlib (PySpark Native)",
            "status": "SUCCESS",
            "trained_on_records": total_records,
            "feature_set": feature_cols,
            "regression": reg_metrics,
            "clustering": {
                "algorithm": "k_means",
                "k": 3,
                "cluster_sizes": cluster_sizes,
                "silhouette_score": round(float(silhouette), 4),
                "cluster_centroids": cluster_centers,
            },
            "correlation_matrix": corr_dict,
            "models_retained": [
                "Linear Regression (Price Baseline)",
                "Decision Tree Regressor (Spread Volatility)",
                "K-Means Clustering (Market Segmentation)",
            ],
        }
    finally:
        spark.stop()


# --------------------------------------------------------------------------------------
# Engine 2: Resilient High-Performance Scikit-Learn Hybrid Fallback
# --------------------------------------------------------------------------------------
def train_fallback_models(dataset_path: str | Path) -> dict[str, Any]:
    from sklearn.linear_model import LinearRegression
    from sklearn.tree import DecisionTreeRegressor
    from sklearn.cluster import KMeans
    from sklearn.metrics import (
        mean_absolute_error,
        mean_squared_error,
        r2_score,
        silhouette_score,
    )
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler

    df = pd.read_csv(str(dataset_path))
    for col_name in ["Min_x0020_Price", "Max_x0020_Price", "Modal_x0020_Price"]:
        df[col_name] = pd.to_numeric(df[col_name].astype(str).str.replace(",", ""), errors="coerce")

    clean_df = df.dropna(subset=["Min_x0020_Price", "Max_x0020_Price", "Modal_x0020_Price"]).copy()
    clean_df = clean_df[
        (clean_df["Min_x0020_Price"] > 0)
        & (clean_df["Max_x0020_Price"] > 0)
        & (clean_df["Modal_x0020_Price"] > 0)
    ]

    clean_df["Spread"] = clean_df["Max_x0020_Price"] - clean_df["Min_x0020_Price"]
    clean_df["Price_Ratio"] = clean_df["Max_x0020_Price"] / clean_df["Min_x0020_Price"]

    features_list = ["Min_x0020_Price", "Max_x0020_Price", "Spread", "Price_Ratio"]
    X = clean_df[features_list].values
    y = clean_df["Modal_x0020_Price"].values

    total_records = len(clean_df)

    # Correlation Matrix
    corr_df = clean_df[["Min_x0020_Price", "Max_x0020_Price", "Modal_x0020_Price", "Spread", "Price_Ratio"]].corr()
    corr_dict = {
        col: {row: round(corr_df.loc[row, col], 4) for row in corr_df.index}
        for col in corr_df.columns
    }

    # Regression: Train / Test Split (80 / 20)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 1. Linear Regression
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    y_pred_lr = lr.predict(X_test)

    lr_mae = mean_absolute_error(y_test, y_pred_lr)
    lr_rmse = math.sqrt(mean_squared_error(y_test, y_pred_lr))
    lr_r2 = r2_score(y_test, y_pred_lr)
    lr_mape = np.mean(np.abs((y_test - y_pred_lr) / y_test)) * 100

    # 2. Decision Tree Regressor
    dt_reg = DecisionTreeRegressor(max_depth=8, random_state=42)
    dt_reg.fit(X_train_scaled, y_train)
    y_pred_dt = dt_reg.predict(X_test_scaled)

    dt_mae = mean_absolute_error(y_test, y_pred_dt)
    dt_rmse = math.sqrt(mean_squared_error(y_test, y_pred_dt))
    dt_r2 = r2_score(y_test, y_pred_dt)
    dt_mape = np.mean(np.abs((y_test - y_pred_dt) / y_test)) * 100

    reg_metrics = {
        "linear_regression": {
            "r2": round(float(lr_r2), 4),
            "rmse": round(float(lr_rmse), 2),
            "mae": round(float(lr_mae), 2),
            "mape_pct": round(float(lr_mape), 2),
            "intercept": round(float(lr.intercept_), 4),
            "coefficients": [round(float(c), 4) for c in lr.coef_],
            "formula": (
                f"Modal = {lr.intercept_:.2f} + {lr.coef_[0]:.3f}*(Min) + {lr.coef_[1]:.3f}*(Max)"
            ),
        },
        "decision_tree_regression": {
            "r2": round(float(dt_r2), 4),
            "rmse": round(float(dt_rmse), 2),
            "mae": round(float(dt_mae), 2),
            "mape_pct": round(float(dt_mape), 2),
            "max_depth": 8,
        },
    }

    # 3. K-Means Clustering (k=3)
    sample_size = min(10000, total_records)
    sub_sample = clean_df.sample(n=sample_size, random_state=42)[["Min_x0020_Price", "Max_x0020_Price"]]
    scaler_km = StandardScaler()
    scaled_sub = scaler_km.fit_transform(sub_sample)

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(scaled_sub)
    sil_score = silhouette_score(scaled_sub, clusters)
    centers = scaler_km.inverse_transform(kmeans.cluster_centers_)

    counts = pd.Series(clusters).value_counts().to_dict()
    cluster_sizes = [counts.get(i, 0) for i in range(3)]
    cluster_centers = [[round(float(val), 2) for val in center] for center in centers]

    return {
        "engine": "Scikit-Learn (High-Performance PySpark Fallback)",
        "status": "SUCCESS",
        "trained_on_records": total_records,
        "feature_set": features_list,
        "regression": reg_metrics,
        "clustering": {
            "algorithm": "k_means",
            "k": 3,
            "cluster_sizes": cluster_sizes,
            "silhouette_score": round(float(sil_score), 4),
            "cluster_centroids": cluster_centers,
        },
        "correlation_matrix": corr_dict,
        "models_retained": [
            "Linear Regression (Price Baseline)",
            "Decision Tree Regressor (Spread Volatility)",
            "K-Means Clustering (Market Segmentation)",
        ],
    }


# --------------------------------------------------------------------------------------
# Executive Terminal Visualizer
# --------------------------------------------------------------------------------------
def print_executive_report(results: dict[str, Any]) -> None:
    """Print a clean, beautifully formatted terminal report focused on core models."""
    reg = results["regression"]
    cluster = results["clustering"]

    print("\n" + "=" * 84)
    print(" AGRIMARKET: CORE MACHINE LEARNING & PRICE PREDICTION REPORT")
    print("=" * 84)
    print(f" Execution Engine:     {results['engine']}")
    print(f" Trained Records:      {results['trained_on_records']:,} rows")
    print(f" Active Features:      {', '.join(results['feature_set'])}")
    print("-" * 84)

    # 1. Regression Section
    print("\n[1] SUPERVISED LEARNING: PRICE REGRESSION MODELS")
    print(f"{'Model':<28} | {'R² Score':<10} | {'MAE (₹/qtl)':<12} | {'RMSE (₹/qtl)':<14}")
    print("-" * 84)
    lr = reg["linear_regression"]
    dt_r = reg["decision_tree_regression"]
    print(f"{'Linear Regression':<28} | {lr['r2']:<10.4f} | ₹{lr['mae']:<11.2f} | ₹{lr['rmse']:<13.2f}")
    print(f"{'Decision Tree Regressor':<28} | {dt_r['r2']:<10.4f} | ₹{dt_r['mae']:<11.2f} | ₹{dt_r['rmse']:<13.2f}")
    if "formula" in lr:
        print(f"\n>> Fitted Model Equation: {lr['formula']}")
        print(f">> Intercept (β₀): {lr['intercept']} | Min Coef (β₁): {lr['coefficients'][0]} | Max Coef (β₂): {lr['coefficients'][1]}")

    # 2. Clustering Section
    print("\n" + "-" * 84)
    print("[2] UNSUPERVISED LEARNING: K-MEANS MARKET PROFILING (k=3)")
    print(f">> Silhouette Score:  {cluster['silhouette_score']:.4f}")

    # 3. Correlation Section
    print("\n" + "-" * 84)
    print("[3] BIVARIATE PEARSON CORRELATION MATRIX")
    corr = results["correlation_matrix"]
    header = f"{'Feature':<16} | " + " | ".join(f"{k[:8]:<8}" for k in corr.keys())
    print(header)
    print("-" * len(header))
    for row_name, row_vals in corr.items():
        vals_str = " | ".join(f"{row_vals.get(col_name, 0.0):<8.3f}" for col_name in corr.keys())
        print(f"{row_name:<16} | {vals_str}")
    print("=" * 84 + "\n")


# --------------------------------------------------------------------------------------
# CLI Main Entrypoint
# --------------------------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(
        description="AgriMarket Core PySpark MLlib & Machine Learning Pipeline"
    )
    parser.add_argument(
        "--dataset",
        default=str(Path(__file__).resolve().parents[1] / "data_engine" / "Dataset.csv"),
        help="Path to Mandi CSV dataset (default: data_engine/Dataset.csv)",
    )
    parser.add_argument(
        "--engine",
        choices=["auto", "spark", "fallback"],
        default="auto",
        help="Execution engine: 'spark' (native PySpark), 'fallback' (scikit-learn), or 'auto'",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output raw JSON instead of the formatted terminal dashboard",
    )
    parser.add_argument(
        "--save-report",
        type=str,
        default="",
        help="Optional path to export evaluation report as JSON file",
    )
    args = parser.parse_args()

    dataset_path = Path(args.dataset)
    if not dataset_path.exists():
        print(f"Error: Dataset not found at {dataset_path}", file=sys.stderr)
        sys.exit(1)

    results: dict[str, Any]
    if args.engine == "spark":
        results = train_spark_models(dataset_path)
    elif args.engine == "fallback":
        results = train_fallback_models(dataset_path)
    else:  # auto
        if is_spark_available():
            try:
                results = train_spark_models(dataset_path)
            except Exception as exc:
                print(f"[Notice] PySpark initialization skipped: {exc}", file=sys.stderr)
                print("[Notice] Running high-performance ML fallback engine...", file=sys.stderr)
                results = train_fallback_models(dataset_path)
        else:
            results = train_fallback_models(dataset_path)

    if args.save_report:
        save_file = Path(args.save_report)
        save_file.parent.mkdir(parents=True, exist_ok=True)
        save_file.write_text(json.dumps(results, indent=2), encoding="utf-8")
        print(f">> Report successfully saved to: {save_file}")

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_executive_report(results)


if __name__ == "__main__":
    main()