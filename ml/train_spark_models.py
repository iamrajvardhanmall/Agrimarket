from __future__ import annotations
import argpars
from pyspark.ml import Pipeline
from pyspark.ml.classification import (
    DecisionTreeClassifier,
    LinearSVC,
    LogisticRegression,
    NaiveBayes,
)
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import MulticlassClassificationEvaluator, RegressionEvaluator
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.regression import DecisionTreeRegressor, LinearRegression
from pyspark.sql import SparkSession
from pyspark.sql.functions import col


def train(dataset: str) -> None:
    spark = SparkSession.builder.appName("AgriMarketSparkML").getOrCreate()
    frame = (
        spark.read.option("header", True).option("inferSchema", True).csv(dataset)
        .select(
            col("Min_x0020_Price").cast("double").alias("min_price"),
            col("Max_x0020_Price").cast("double").alias("max_price"),
            col("Modal_x0020_Price").cast("double").alias("label"),
        )
        .na.drop()
    )
    assembler = VectorAssembler(inputCols=["min_price", "max_price"], outputCol="features")
    train_frame, test_frame = frame.randomSplit([0.8, 0.2], seed=42)
    regression_metrics = {}
    for name, estimator in (
        ("linear_regression", LinearRegression()),
        ("decision_tree_regression", DecisionTreeRegressor(maxDepth=8)),
    ):
        model = Pipeline(stages=[assembler, estimator]).fit(train_frame)
        predictions = model.transform(test_frame)
        rmse = RegressionEvaluator(metricName="rmse").evaluate(predictions)
        mae = RegressionEvaluator(metricName="mae").evaluate(predictions)
        r2 = RegressionEvaluator(metricName="r2").evaluate(predictions)
        regression_metrics[name] = {"mae": mae, "rmse": rmse, "r2": r2}
        print(f"{name}: MAE={mae:.2f}, RMSE={rmse:.2f}, R2={r2:.4f}")

    classified = frame.withColumn("class_label", (col("label") > frame.approxQuantile("label", [0.5], 0.0)[0]).cast("double"))
    classification_train, classification_test = classified.randomSplit([0.8, 0.2], seed=42)
    classification_metrics = {}
    for name, estimator in (
        ("logistic_regression", LogisticRegression(featuresCol="features", labelCol="class_label", maxIter=50)),
        ("decision_tree", DecisionTreeClassifier(featuresCol="features", labelCol="class_label", maxDepth=8)),
        ("svm", LinearSVC(featuresCol="features", labelCol="class_label", maxIter=50)),
        ("naive_bayes", NaiveBayes(featuresCol="features", labelCol="class_label")),
    ):
        model = Pipeline(stages=[
            VectorAssembler(inputCols=["min_price", "max_price"], outputCol="features"),
            estimator,
        ]).fit(classification_train)
        predictions = model.transform(classification_test)
        accuracy = MulticlassClassificationEvaluator(
            labelCol="class_label", predictionCol="prediction", metricName="accuracy"
        ).evaluate(predictions)
        f1 = MulticlassClassificationEvaluator(
            labelCol="class_label", predictionCol="prediction", metricName="f1"
        ).evaluate(predictions)
        confusion = {
            f"{int(row.class_label)}_{int(row.prediction)}": row.count
            for row in predictions.groupBy("class_label", "prediction").count().collect()
        }
        classification_metrics[name] = {"accuracy": accuracy, "f1": f1, "confusion_matrix": confusion}
        print(f"{name}: accuracy={accuracy:.4f}, F1={f1:.4f}")
        print(f"{name}: confusion_matrix={confusion}")

    assembled_frame = assembler.transform(frame)
    clustered = KMeans(k=3, seed=42).fit(assembled_frame).transform(assembled_frame)
    cluster_sizes = {
        str(row.prediction): row["count"]
        for row in clustered.groupBy("prediction").count().collect()
    }
    print(f"k_means: clusters=3, cluster_sizes={cluster_sizes}")
    print({
        "regression": regression_metrics,
        "classification": classification_metrics,
        "clustering": {"algorithm": "k_means", "clusters": 3, "cluster_sizes": cluster_sizes},
    })
    spark.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Spark ML models on mandi data.")
    parser.add_argument("--dataset", default="data_engine/Dataset.csv")
