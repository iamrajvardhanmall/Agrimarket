# Backend and API

## Django project

- `backend/manage.py`: Django command entry point.
- `backend/config/settings.py`: installed apps, middleware, PostgreSQL connection, CORS, and REST settings.
- `backend/config/urls.py`: mounts API routes under `/api/`.
- `backend/market_api/models.py`: domain models.
- `backend/market_api/serializers.py`: DRF validation and model serializer definitions.
- `backend/market_api/services.py`: reusable recommendation ranking logic.
- `backend/market_api/views.py`: current API views and recommendation calculation.
- `backend/market_api/urls.py`: endpoint routes.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health/` | Service health check |
| GET | `/api/markets/` | Current market comparison data |
| POST | `/api/recommendations/` | Rank selling options by net realization |
| GET | `/api/lots/` | List demo/current farmer lots |
| POST | `/api/lots/` | Create a lot payload |
| GET | `/api/buyers/` | Return buyer matches |
| GET | `/api/offers/` | Return recent offers |
| POST | `/api/buyers/` | Validate a buyer requirement payload |
| POST | `/api/offers/` | Validate an offer payload |

## Recommendation request

```json
{
  "commodity": "Tomato",
  "quantity_kg": 5000,
  "quality": "Grade A",
  "transport_rate": 38,
  "storage_days": 0,
  "storage_rate": 4.5
}
```

## Recommendation response shape

```json
{
  "recommendation": {
    "market": "Lasalgaon Market",
    "window": "22-24 September",
    "confidence": 78,
    "reason": "Best expected net realization after transport and storage."
  },
  "options": []
}
```

Each option includes market details, price, demand, distance, transport cost, storage cost, and net realization.

## Current model entities

- `MarketPrice`
- `Lot`
- `BuyerRequirement`
- `Offer`
- `Grievance`

The models, initial migration, serializers, and recommendation service are implemented. Several views still use demo responses, so persistence-backed queries, viewsets, authentication, permissions, pagination, and full CRUD remain production work.

`grievances()` currently exists as a view helper but is not mounted in `backend/market_api/urls.py`; add and test a route before exposing grievance creation through the API.

## API hardening roadmap

- Use the existing DRF serializers for all create and update flows.
- Add JWT authentication and role permissions.
- Add object-level authorization for lots, offers, grievances, and transactions.
- Move settings and secrets to environment variables.
- Add API tests and OpenAPI documentation.
- Add structured error responses and request validation.
