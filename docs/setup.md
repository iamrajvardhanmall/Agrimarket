# Local Setup

## Prerequisites

- Python 3.11 or newer
- Node.js and npm
- PostgreSQL 16 or newer, or Docker Desktop
- Docker Compose for PostgreSQL and Kafka services
- Git
- Java and Apache Spark only when running Spark jobs

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

Production build:

```powershell
npm run build
```

## Backend

Create the backend environment file from the repository root when custom settings are needed:

```powershell
Copy-Item backend/.env.example backend/.env
```

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py test
python manage.py runserver
```

The backend loads `backend/.env` through `python-dotenv`. PowerShell variables override values from the backend `.env` file when both are present.

The API runs at `http://localhost:8000/api/`.

## PostgreSQL and Kafka with Docker

From the repository root:

```powershell
docker compose up -d
docker compose ps
```

The development services expose PostgreSQL on `5432` and Kafka on `9092`.

Stop services:

```powershell
docker compose down
```

The database volume is persistent. To recreate it and reset local data, use `docker compose down -v` only when data loss is acceptable.

## Existing local PostgreSQL

If another PostgreSQL service already owns port `5432`, configure Django for that server:

```powershell
$env:POSTGRES_DB = "agrimarket"
$env:POSTGRES_USER = "agrimarket"
$env:POSTGRES_PASSWORD = "your-local-password"
$env:POSTGRES_HOST = "localhost"
$env:POSTGRES_PORT = "5432"
python manage.py runserver
```

The supported variables are listed in [backend/.env.example](../backend/.env.example). Django reads process environment variables; PowerShell variables must be set in the same terminal used to start Django.

The initial migration creates `MarketPrice`, `Lot`, `BuyerRequirement`, `Offer`, and `Grievance` tables. Several API views still return demo market, buyer, lot, and offer payloads, so migration success does not imply that every endpoint is persistence-backed.

## Sample utilities

Replay sample market events:

```powershell
python -m streaming.producers.replay_market_data
```

Run Python validation:

```powershell
python -m compileall backend data_engine ml streaming
```

## Troubleshooting

- **Password authentication failed:** the PostgreSQL role password does not match the environment variable. Update the role password or set `POSTGRES_PASSWORD` to the existing password.
- **Connection refused:** PostgreSQL is not running, Docker is stopped, or port `5432` is occupied by another service.
- **Frontend dependency missing:** run `npm install` inside `frontend`, not the repository root.
- **CORS error:** run the frontend on `http://localhost:5173`, which is allowed by the development settings.
