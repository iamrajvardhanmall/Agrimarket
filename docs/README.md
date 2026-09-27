# AgriMarket AI Documentation

AgriMarket AI is an agricultural market-intelligence and farmer-buyer linkage platform. It helps farmers and Farmer Producer Organisations compare selling options using market prices, demand, distance, transport cost, storage cost, forecasts, and buyer matches.

## Documentation map

| Document | Purpose |
| --- | --- |
| [Product and requirements](product-requirements.md) | Problem, users, features, and product scope |
| [Architecture](architecture.md) | System boundaries and data flow |
| [Local setup](setup.md) | Install, configure, run, and troubleshoot the project |
| [Frontend](frontend.md) | React, Tailwind CSS, Plotly.js, and dashboard behavior |
| [Backend and API](backend-api.md) | Django REST Framework, models, and endpoints |
| [Database and security](database-security.md) | PostgreSQL schema direction and security requirements |
| [Data engineering](data-engineering.md) | PySpark SQL, RDD, and batch processing |
| [Streaming](streaming.md) | Kafka events and Spark Structured Streaming |
| [Machine learning](machine-learning.md) | Forecasting, matching, evaluation, and model roadmap |
| [Graph analytics](graph-analytics.md) | NetworkX buyer-market analysis, SVG dashboard graph, and GraphX scale-up path |
| [Workflows and roadmap](workflows-roadmap.md) | User journeys, delivery phases, and known gaps |

## Current implementation status

### Implemented

- React farmer dashboard with responsive layout
- Tailwind CSS styling
- Plotly.js market-price trend chart
- SVG buyer-market network visualization in the dashboard
- Django REST API endpoints for health, markets, recommendations, lots, buyers, and offers
- Django domain models for market prices, lots, buyer requirements, offers, and grievances
- Django serializers and initial PostgreSQL migration
- Net-realization recommendation utility
- Unit tests for recommendation logic
- Moving-average forecasting baseline
- Sample market data and replayable event producer
- PostgreSQL and Kafka Docker Compose development services

### Extension points

- Persistence-backed CRUD and production query flows
- Authentication and role-based authorization
- Live mandi data ingestion
- Kafka topic producer and Spark streaming sink
- Spark MLlib model training and registry
- Buyer matching persistence and negotiation workflow
- Payment, logistics, grievance, and notification services
- Matplotlib and Seaborn chart generation for price and trend analysis

The original broad requirements brief remains available in [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md).
