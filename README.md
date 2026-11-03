# AgriMarket AI

AgriMarket AI is a farmer-only, syllabus-driven machine-learning platform for agricultural market data. It demonstrates PySpark, Spark MLlib, supervised and unsupervised learning, Linear Regression, Logistic Regression, Decision Tree, K-means, SVM, Naive Bayes, confusion matrices, R², RMSE, MAE, and correlation heat maps while supporting farmer selling decisions.

## Documentation

The complete documentation is organized in [docs/README.md](docs/README.md). It covers:

- Product requirements and the farmer user journey
- System architecture and technology boundaries
- Local setup and MongoDB troubleshooting
- React frontend dashboard
- Django REST API and domain models
- MongoDB data design and security
- PySpark data engineering
- Batch data processing
- Machine learning and evaluation
- Market visualization with Matplotlib and Seaborn
- User workflows, roadmap, and known limitations

## MVP status

The repository now includes a runnable first vertical slice:

- `frontend/`: React dashboard using Tailwind CSS and native SVG visualization.
- `backend/`: Django REST Framework API backed by MongoDB.
- `data_engine/`: PySpark SQL and RDD-ready processing boundaries.
- `ml/`: scikit-learn experimentation boundary.
- `docker-compose.yml`: MongoDB development service.

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
The Django command is `runserver` (not `runser`).

Start MongoDB with `docker compose up -d` from the repository root. The API stores domain data in the `agrimarket` MongoDB database. Market prices are loaded from the data.gov.in mandi API when `MARKET_DATA_API_KEY` is configured, and bundled sample data is used when the API is unavailable. Alternatively, configure an existing local MongoDB instance:

```powershell
$env:MONGO_DB = "agrimarket"
$env:MONGO_USER = "agrimarket"
$env:MONGO_PASSWORD = "your-local-password"
$env:MONGO_HOST = "localhost"
$env:MONGO_PORT = "27017"
$env:MARKET_DATA_API_KEY = "your-data-gov-in-api-key"
python manage.py runserver
```

`backend/.env.example` lists the supported environment variables. Run backend commands from the `backend/` directory.

The API is available at `http://localhost:8000/api/`. Useful endpoints are `/health/`, `/markets/`, `/recommendations/`, `/forecasts/`, `/lots/`, and `/offers/`.

ML evaluation is available at `/api/ml/insights/` and is shown in the dashboard's Machine learning panel. Run `python ml/train_models.py` to train the local models and generate a correlation heatmap. Run `python ml/train_spark_models.py --dataset data_engine/Dataset.csv` for the Spark MLlib pipeline.

### Daily mandi CSV export

Set your data.gov.in API key locally, then run the exporter from the repository root:

```powershell
$env:MARKET_DATA_API_KEY = "your-data-gov-in-api-key"
python data_engine/fetch_daily_market_data.py
```

Optional filters are available with `--state`, `--district`, and `--commodity`.
The default target is `data_engine/Dataset.csv`; each run merges only new
records, keyed by state, district, market, commodity, variety, grade, and
arrival date, so running it again is safe and duplicate records are removed.
Schedule this command once per day using Windows Task Scheduler, cron, or CI.
To use another file, pass `--output`.

See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for the complete product requirements, architecture, proposed data sources, workflows, and future modules.

## Verification

```powershell
cd backend
python manage.py test
cd ../frontend
npm run build
```

## Product direction

The MVP supports a public/no-login farmer workflow:

`Farmer enters produce details -> system compares markets -> forecast and recommendation rank net realization -> farmer records a lot -> farmer tracks offers and delivery/payment status`

Farmers can filter market data by state, district, market, commodity group,
commodity, and variety. The decision engine then ranks the filtered markets by
expected net realization after configurable transport and storage costs, so the
recommended route is based on estimated profit rather than price alone.

Login/signup, payment processing, production ML training, and deployment infrastructure remain outside the current MVP. The product scope is limited to farmer decision support and farmer-owned records. Domain records are persisted in MongoDB, with fallback demo data available when the database is unavailable.
