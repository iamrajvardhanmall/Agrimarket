"""Optional Spark ML training job for the mandi dataset."""

from __future__ import annotations

import argparse

from pyspark.ml import Pipeline
from pyspark.ml.clustering import KMeans
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.feature import StringIndexer, VectorAssembler
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
    for name, estimator in (
        ("linear_regression", LinearRegression()),
        ("decision_tree_regression", DecisionTreeRegressor(maxDepth=8)),
    ):
        model = Pipeline(stages=[assembler, estimator]).fit(train_frame)
        predictions = model.transform(test_frame)
        rmse = RegressionEvaluator(metricName="rmse").evaluate(predictions)
        r2 = RegressionEvaluator(metricName="r2").evaluate(predictions)
        print(f"{name}: RMSE={rmse:.2f}, R2={r2:.4f}")

    clustered = assembler.transform(frame)
    KMeans(k=3, seed=42).fit(clustered).transform(clustered).groupBy("prediction").count().show()
    spark.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Spark ML models on mandi data.")
    parser.add_argument("--dataset", default="data_engine/Dataset.csv")
    train(parser.parse_args().dataset)
