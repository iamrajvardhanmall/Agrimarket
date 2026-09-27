# System Architecture

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React, JavaScript, Tailwind CSS, Plotly.js |
| API | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Batch data | Apache Spark, PySpark, Spark SQL, RDD |
| Streaming | Apache Kafka, Spark Structured Streaming |
| ML | Spark MLlib, PySpark ML, scikit-learn for experiments |
| Visualization | Plotly.js, SVG graph view, Matplotlib, Seaborn |
| Operations | Docker, Docker Compose, Git, GitHub |

## Logical flow

```text
Public mandi/API data     Buyer and platform data
          |                         |
          +-----------+-------------+
                      v
              Ingestion and validation
                      |
          +-----------+-------------+
          |                         |
       Kafka                     Spark
   live events       batch, SQL, RDD, streaming
          |                         |
          +-----------+-------------+
                      v
           Feature engineering and ML
                      |
                      v
              Decision engine
          market ranking and windows
                      |
                      v
              Django REST API
                      |
                      v
                 React UI
```

## Repository boundaries

- `frontend/`: browser application and farmer dashboard.
- `backend/`: Django project and `market_api` application.
- `data_engine/`: recommendation utility, sample data, and PySpark SQL entry point.
- `ml/`: forecasting baseline and future training modules.
- `streaming/`: replay producer and Spark streaming entry point.
- `graph/`: NetworkX market-buyer graph analysis and visualization boundary; GraphX is the distributed scale-up option.
- `docker-compose.yml`: local PostgreSQL and Kafka services.

## Design principles

1. Keep the decision engine independent from the UI and API.
2. Preserve data provenance for every market observation and prediction.
3. Return assumptions and confidence with recommendations.
4. Keep demo data available when external services are offline.
5. Separate user-entered claims from verified data.
6. Treat financial, quality, and payment state changes as auditable events.

## Current vertical slice

The working path is:

```text
React dashboard
        |
        v
Django API -> recommendation service -> ranked market options
        |
        +-> demo market and buyer payloads when persistence is not used
        +-> PostgreSQL models and migration boundary
        +-> buyer-market graph dataset rendered as SVG in the UI
```

Kafka, Spark, and trained forecasting models are integration boundaries in the current development build rather than continuously deployed services.
