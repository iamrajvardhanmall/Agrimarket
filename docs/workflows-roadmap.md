# Workflows and Roadmap

## Farmer workflow

1. Sign in.
2. Select commodity.
3. Enter quantity, quality, location, and harvest date.
4. Review current prices and arrivals.
5. Compare markets and predicted prices.
6. Review transport and storage assumptions.
7. Receive a ranked selling recommendation.
8. Review matched buyers.
9. Create a lot.
10. Receive, negotiate, and accept an offer.
11. Plan logistics.
12. Track delivery and payment.

## Buyer workflow

1. Register and submit verification details.
2. Publish a commodity, quantity, quality, location, and delivery requirement.
3. Discover compatible lots.
4. Submit and negotiate offers.
5. Confirm order and logistics.
6. Track delivery and payment.

## Admin workflow

- Manage users, roles, markets, and data sources.
- Monitor price feeds and pipeline health.
- Review buyers and verification records.
- Monitor offers, transactions, and payments.
- Resolve grievances.
- Review platform analytics and KPIs.

## Delivery phases

### Phase 1: MVP foundation

- Farmer dashboard
- Demo/API market data
- Net-realization recommendation
- Basic buyer matches and offers
- PostgreSQL development configuration
- Responsive dashboard with Plotly price trend and SVG buyer-market graph
- Initial Django migration, serializers, recommendation service, and unit tests

### Phase 2: Persistence and identity

- Persistence-backed Django CRUD using the existing models and serializers
- JWT authentication
- Role permissions
- Real lot, buyer, offer, and grievance CRUD
- Audit history

### Phase 3: Intelligence pipeline

- Public mandi ingestion
- Spark SQL processing
- Kafka market events
- Spark Structured Streaming
- Forecasting and evaluation pipelines

### Phase 4: Market network and operations

- FPO aggregation
- Storage and transport providers
- Matplotlib and Seaborn analytics
- Notifications
- Payment and logistics integrations
- Docker deployment and monitoring

## Known limitations

- Current market, buyer, and offer responses include demo data.
- The recommendation endpoint does not yet persist requests or use trained forecasts.
- Authentication and authorization are not implemented.
- PostgreSQL models have an initial migration and serializers; production CRUD still needs persistence-backed views and ownership rules.
- Kafka and Spark files are integration boundaries, not deployed pipelines.
- The frontend contains a fallback mode for offline API development.
