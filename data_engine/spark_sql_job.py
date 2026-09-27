"""PySpark SQL entry point for daily mandi data."""

from pyspark.sql import SparkSession
from pyspark.sql.functions import avg, col, max as spark_max, min as spark_min


def build_market_summary(input_path: str):
    spark = SparkSession.builder.appName("AgriMarketDailySummary").getOrCreate()
    prices = spark.read.json(input_path)
    summary = prices.groupBy("commodity", "market").agg(
        avg("modal_price").alias("average_price"),
        spark_min("modal_price").alias("minimum_price"),
        spark_max("modal_price").alias("maximum_price"),
        avg("arrival_quantity").alias("average_arrival"),
    ).orderBy(col("commodity"), col("average_price").desc())
    return summary


if __name__ == "__main__":
    build_market_summary("data_engine/sample_market_data.json").show()
