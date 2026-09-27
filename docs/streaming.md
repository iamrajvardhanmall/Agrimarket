# Streaming

## Purpose

Streaming provides near-real-time market updates without requiring physical IoT devices. Historical or API records can be replayed as events for demonstrations and testing.

## Current files

- `streaming/producers/replay_market_data.py`: reads sample JSON and emits newline-delimited market events.
- `streaming/spark_streaming_job.py`: Spark Structured Streaming boundary for Kafka input.

## Event shape

```json
{
  "event_type": "market.price.updated",
  "market": "Nashik APMC",
  "commodity": "Tomato",
  "modal_price": 2850,
  "arrival_quantity": 4210,
  "timestamp": "2026-09-18T10:30:00+05:30"
}
```

## Kafka topic plan

| Topic | Producer | Consumers |
| --- | --- | --- |
| `market-prices` | Mandi/API ingestion | Spark streaming, API cache |
| `buyer-requirements` | Buyer API | Matching service |
| `offers` | Offer API | Notifications, transaction service |
| `transactions` | Transaction service | Analytics, audit pipeline |

## Reliability requirements

- Include event IDs and source timestamps.
- Make consumers idempotent.
- Keep schema versions in event metadata.
- Use dead-letter handling for invalid events.
- Monitor consumer lag and processing failures.
- Define retention and replay policy per topic.

## Local development

Start Kafka with:

```powershell
docker compose up -d kafka
```

Replay sample events:

```powershell
python -m streaming.producers.replay_market_data
```

The current replay producer writes to stdout. Kafka producer wiring and API consumption are the next implementation steps; starting the Kafka container alone does not connect the Django API to a topic.

## Current status

- Kafka and PostgreSQL are available through `docker-compose.yml`.
- The replay producer and Spark Structured Streaming job are source-level boundaries.
- No consumer currently persists streamed events into the Django models.
- A production flow still needs topic creation, serialization, retries, idempotency, monitoring, and a persistence sink.
