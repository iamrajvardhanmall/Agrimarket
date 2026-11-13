"""
========================================================================================
AGRIMARKET: DEDICATED PYSPARK & SPARK MLLIB MACHINE LEARNING SUITE
========================================================================================

Topic & Curriculum:
- Spark ML Programming and PySpark:
  * Introduction to Machine Learning and PySpark
  * Techniques of Machine Learning (Supervised & Unsupervised)
  * Introduction to Spark MLlib (DataFrame-based distributed ML)
  * Key Concepts of Spark ML:
      1. DataFrame: Distributed dataset with named columns
      2. Transformer: Feature transformers (VectorAssembler, StandardScaler)
      3. Estimator: Algorithms that fit on DataFrames to produce Models
      4. Pipeline: End-to-end chained ML DAG
      5. Evaluator: Quantitative evaluators (RegressionEvaluator, MulticlassClassificationEvaluator)
  * Spark ML Algorithms using PySpark:
      - Linear Regression
      - Logistic Regression
      - Decision Tree (Regressor & Classifier)
      - K-Means (Clustering)
      - Support Vector Machine (LinearSVC)
      - Naive Bayes
  * Evaluation and Performance Matrix:
      - Confusion Matrix
      - R2, RMSE, MAE
      - Correlation Matrix / Heatmap
========================================================================================
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any


def is_spark_available() -> bool:
    """Check if pyspark is installed and can be imported."""
    try:
        import pyspark  # noqa: F401
        return True
    except (ImportError, Exception):
        return False


def train_spark_models(dataset_path: str | Path) -> dict[str, Any]:
    """
    Train and evaluate all syllabus algorithms using native Apache Spark MLlib (PySpark).
    Returns a standardized dictionary of metrics, confusion matrices, and model evaluations.
    """
    try:
        from pyspark.sql import SparkSession
        from pyspark.sql.functions import col
        from pyspark.ml import Pipeline as SparkPipeline
        from pyspark.ml.feature import VectorAssembler, StandardScaler as SparkScaler
        from pyspark.ml.regression import (
            LinearRegression as SparkLinearRegression,
            DecisionTreeRegressor as SparkDecisionTreeRegressor,
        )
        from pyspark.ml.classification import (
            LogisticRegression as SparkLogisticRegression,
            DecisionTreeClassifier as SparkDecisionTreeClassifier,
            LinearSVC as SparkLinearSVC,
            NaiveBayes as SparkNaiveBayes,
        )
        from pyspark.ml.clustering import KMeans as SparkKMeans
        from pyspark.ml.evaluation import RegressionEvaluator, MulticlassClassificationEvaluator
        from pyspark.ml.stat import Correlation
    except ImportError as exc:
        raise ImportError(
            f"PySpark is not installed or unavailable: {exc}. "
            "Please run: pip install pyspark>=3.5.0"
        ) from exc

    # 1. Initialize local SparkSession
    spark = (
        SparkSession.builder
        .appName("AgriMarket-SparkML-Pipeline")
        .master("local[*]")
        .config("spark.driver.memory", "2g")
        .config("spark.sql.shuffle.partitions", "4")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("ERROR")

    try:
        # 2. Ingest Dataset into Spark DataFrame
        df = (
            spark.read.option("header", True).option("inferSchema", True).csv(str(dataset_path))
            .select(
                col("Min_x0020_Price").cast("double").alias("min_price"),
                col("Max_x0020_Price").cast("double").alias("max_price"),
                col("Modal_x0020_Price").cast("double").alias("label"),
            )
            .na.drop()
        )
        total_records = df.count()

        # 3. Feature Assembly & Scaling Transformers
        assembler = VectorAssembler(inputCols=["min_price", "max_price"], outputCol="raw_features")
        scaler = SparkScaler(inputCol="raw_features", outputCol="features", withStd=True, withMean=True)

        # 4. Correlation Matrix
        assembled_all = assembler.transform(df)
        corr_matrix = Correlation.corr(assembled_all, "raw_features", "pearson").head()[0].toArray().tolist()

        train_df, test_df = df.randomSplit([0.8, 0.2], seed=42)

        # 5. Supervised Learning: Regression (Linear Regression & Decision Tree)
        reg_metrics: dict[str, dict[str, float]] = {}
        for name, estimator in (
            ("linear_regression", SparkLinearRegression(featuresCol="features", labelCol="label")),
            ("decision_tree_regression", SparkDecisionTreeRegressor(featuresCol="features", labelCol="label", maxDepth=8)),
        ):
            pipeline = SparkPipeline(stages=[assembler, scaler, estimator]).fit(train_df)
            predictions = pipeline.transform(test_df)
            r2 = RegressionEvaluator(metricName="r2").evaluate(predictions)
            rmse = RegressionEvaluator(metricName="rmse").evaluate(predictions)
            mae = RegressionEvaluator(metricName="mae").evaluate(predictions)
            reg_metrics[name] = {
                "r2": round(float(r2), 4),
                "rmse": round(float(rmse), 2),
                "mae": round(float(mae), 2),
            }

        # 6. Supervised Learning: Classification (Logistic Regression, Decision Tree, SVM, Naive Bayes)
        median_val = df.approxQuantile("label", [0.5], 0.01)[0]
        clf_df = df.withColumn("class_label", (col("label") >= median_val).cast("double"))
        c_train, c_test = clf_df.randomSplit([0.8, 0.2], seed=42)

        classes = ["standard", "high"]
        clf_metrics: dict[str, dict[str, Any]] = {}
        for name, estimator in (
            ("logistic_regression", SparkLogisticRegression(featuresCol="features", labelCol="class_label", maxIter=100)),
            ("decision_tree", SparkDecisionTreeClassifier(featuresCol="features", labelCol="class_label", maxDepth=8)),
            ("svm", SparkLinearSVC(featuresCol="features", labelCol="class_label", maxIter=50)),
            ("naive_bayes", SparkNaiveBayes(featuresCol="raw_features", labelCol="class_label")),
        ):
            stages = [assembler, estimator] if name == "naive_bayes" else [assembler, scaler, estimator]
            pipeline = SparkPipeline(stages=stages).fit(c_train)
            predictions = pipeline.transform(c_test)

            acc = MulticlassClassificationEvaluator(labelCol="class_label", predictionCol="prediction", metricName="accuracy").evaluate(predictions)
            f1 = MulticlassClassificationEvaluator(labelCol="class_label", predictionCol="prediction", metricName="f1").evaluate(predictions)

            counts = predictions.groupBy("class_label", "prediction").count().collect()
            cm_dict = {f"{int(r.class_label)}_{int(r.prediction)}": r["count"] for r in counts}
            confusion_matrix = [
                [cm_dict.get("0_0", 0), cm_dict.get("0_1", 0)],
                [cm_dict.get("1_0", 0), cm_dict.get("1_1", 0)],
            ]

            clf_metrics[name] = {
                "accuracy": round(float(acc), 4),
                "f1": round(float(f1), 4),
                "confusion_matrix": confusion_matrix,
            }

        # 7. Unsupervised Learning: K-Means Clustering
        kmeans = SparkKMeans(k=3, seed=42, featuresCol="features")
        km_pipe = SparkPipeline(stages=[assembler, scaler, kmeans]).fit(df)
        clustered = km_pipe.transform(df)
        k_sizes = {str(r.prediction): r["count"] for r in clustered.groupBy("prediction").count().collect()}
        cluster_sizes = [k_sizes.get("0", 0), k_sizes.get("1", 0), k_sizes.get("2", 0)]

        return {
            "engine": "Apache Spark MLlib (PySpark Native)",
            "trained_on": total_records,
            "regression": reg_metrics,
            "classification": {
                "target": "price_opportunity",
                "classes": classes,
                "models": clf_metrics,
            },
            "clustering": {
                "algorithm": "k_means",
                "clusters": 3,
                "cluster_sizes": cluster_sizes,
            },
            "correlation": {
                "min_price": {"min_price": corr_matrix[0][0], "max_price": corr_matrix[0][1]},
                "max_price": {"min_price": corr_matrix[1][0], "max_price": corr_matrix[1][1]},
            },
            "syllabus": {
                "topic": "Spark ML Programming and PySpark",
                "framework": "Apache Spark MLlib (pyspark.ml)",
                "key_concepts": {
                    "DataFrame": "Distributed dataset with Catalyst query optimization",
                    "Transformer": "VectorAssembler & StandardScaler",
                    "Estimator": "LinearRegression, LogisticRegression, KMeans, LinearSVC, NaiveBayes",
                    "Pipeline": "Spark ML Pipeline chaining transformers & estimators",
                    "Evaluator": "RegressionEvaluator (R2/RMSE/MAE) & MulticlassClassificationEvaluator",
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
        }
    finally:
        spark.stop()


def main() -> None:
    parser = argparse.ArgumentParser(description="AgriMarket PySpark MLlib Pipeline Runner")
    parser.add_argument(
        "--dataset",
        default=str(Path(__file__).resolve().parents[1] / "data_engine" / "Dataset.csv"),
        help="Path to Mandi CSV dataset",
    )
    args = parser.parse_args()

    print("=" * 80)
    print("RUNNING PYSPARK MLLIB TRAINING PIPELINE")
    print(f"Dataset: {args.dataset}")
    print("=" * 80)

    try:
        results = train_spark_models(args.dataset)
        import json
        print(json.dumps(results, indent=2))
    except Exception as exc:
        print(f"PySpark Execution Note: {exc}", file=sys.stderr)
        print("Falling back to hybrid market_models runner...", file=sys.stderr)
        from market_models import train_dataset
        fallback_results = train_dataset(args.dataset)
        import json
        print(json.dumps(fallback_results, indent=2))


if __name__ == "__main__":
    main()
