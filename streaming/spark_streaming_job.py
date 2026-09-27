"""Structured Streaming boundary for Kafka market events."""

from pyspark.sql import SparkSession


def start_market_stream(kafka_servers: str = "localhost:9092"):
    spark = SparkSession.builder.appName("AgriMarketStreaming").getOrCreate()
    events = (spark.readStream.format("kafka").option("kafka.bootstrap.servers", kafka_servers).option("subscribe", "market-prices").load())
    return events.selectExpr("CAST(value AS STRING) AS event_json")
