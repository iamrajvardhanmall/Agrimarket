# AgriMarket AI

AgriMarket AI is an agricultural market-intelligence platform that helps farmers and FPOs choose the best selling option using market prices, demand, distance, transport cost, storage cost, and buyer matches. The repository currently provides a runnable vertical slice with demo-data fallback, a Django API, a React dashboard, a recommendation service, and a buyer-market graph view.

## Documentation

The complete documentation is organized in [docs/README.md](docs/README.md). It covers:

- Product requirements and user roles
- System architecture and technology boundaries
- Local setup and PostgreSQL troubleshooting
- React frontend and Plotly.js dashboard
- Django REST API and domain models
- PostgreSQL data design and security
- PySpark data engineering
- Kafka and Spark Streaming
- Machine learning and evaluation
- Market visualization with Matplotlib and Seaborn
- User workflows, roadmap, and known limitations

## MVP status

The repository now includes a runnable first vertical slice:

- `frontend/`: React dashboard using Tailwind CSS and Plotly.js.
- `backend/`: Django REST Framework API backed by PostgreSQL.
- `data_engine/`: PySpark SQL and RDD-ready processing boundaries.
- `ml/`: PySpark ML/MLlib and scikit-learn experimentation boundary.
- `streaming/`: Kafka producer and Spark Structured Streaming boundary.
- `graph/`: NetworkX market-buyer analysis boundary, with GraphX identified as the distributed scale-up path.
- `docker-compose.yml`: PostgreSQL and Apache Kafka development services.

## Run locally

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dashboard works with demo data when the API is offline.

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python manage.py runserver
```

Run the final command from `backend/`, or use `cd backend` before it.

Start PostgreSQL and Kafka first with `docker compose up -d` from the repository root.

If port `5432` is already occupied by a locally installed PostgreSQL server, either stop that service and start Docker, or create/update the matching local role and database:

```sql
CREATE USER agrimarket WITH PASSWORD 'agrimarket-dev';
CREATE DATABASE agrimarket OWNER agrimarket;
```

For an existing role, use `ALTER USER agrimarket WITH PASSWORD 'agrimarket-dev';`. Alternatively, set the connection values in PowerShell before starting Django:

```powershell
$env:POSTGRES_DB = "agrimarket"
$env:POSTGRES_USER = "agrimarket"
$env:POSTGRES_PASSWORD = "your-local-password"
$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5432"
python manage.py runserver
```

`backend/.env.example` lists the supported environment variables. Run backend commands from the `backend/` directory.

The API is available at `http://localhost:8000/api/`. Useful endpoints are `/health/`, `/markets/`, `/recommendations/`, `/lots/`, `/buyers/`, and `/offers/`.

### Data and forecasting utilities

```powershell
python -m streaming.producers.replay_market_data
```

See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for the complete product requirements, architecture, proposed data sources, workflows, and future modules.

## Verification

```powershell
cd backend
python manage.py test
cd ../frontend
npm run build
```

## Product direction

The MVP intentionally focuses on one complete farmer workflow:

`Farmer inputs lot -> system compares markets -> recommendation ranks net realization -> farmer explores matched buyers`

Authentication, production ML training, live Kafka publishing, payments, and deployment infrastructure remain the next implementation layers. The current lot, buyer, and offer endpoints still use demo responses while serializers and migrations establish the persistence boundary.
