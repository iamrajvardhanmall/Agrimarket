# Data Engineering

## Data inputs

The platform can ingest:

- Mandi prices: market, commodity, variety, state, district, date, minimum, maximum, and modal price
- Arrival quantities
- Buyer requirements and offers
- Weather and seasonal context
- Market geography and road distance
- Storage facilities and transport rates

Every external dataset should document its source, access method, update frequency, license, and transformation history.

## Current files

- `data_engine/sample_market_data.json`: small sample input for development.
- `data_engine/recommendation.py`: dependency-free net-realization ranking utility.
- `data_engine/spark_sql_job.py`: PySpark SQL summary job boundary.
- `graph/market_graph.py`: NetworkX buyer-market graph construction and summary boundary.

## Spark SQL job

The Spark SQL job groups market events by commodity and market and calculates:

- Average price
- Minimum price
- Maximum price
- Average arrival quantity

It is an entry point, not yet a scheduled production pipeline.

The current recommendation API uses the dependency-light ranking service in `backend/market_api/services.py`; it does not yet consume a scheduled Spark output table.

## RDD usage

RDDs are appropriate for low-level transformations or graph preparation where DataFrame APIs are insufficient. Prefer DataFrames and Spark SQL for structured market data because they provide query optimization and clearer schemas.

## Processing stages

1. Land raw source records without mutation.
2. Validate required fields and data types.
3. Normalize commodity, market, district, and date values.
4. Remove or quarantine invalid prices and quantities.
5. Deduplicate records by source and observation identity.
6. Build features for price, arrivals, seasonality, distance, and demand.
7. Publish processed tables or events for API and ML consumers.

## Scale-up needs

- Schema contracts and data-quality checks
- Partitioning by observed date and commodity
- Idempotent ingestion jobs
- Object storage or data lake layout
- Batch scheduling and monitoring
- Data lineage and provenance catalog

## Validation commands

From the repository root, Python modules can be syntax-checked with:

```powershell
python -m compileall backend data_engine graph ml streaming
```
