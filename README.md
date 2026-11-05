<div align="center">

# 🌱 AgriMarket AI

**Sell Smarter. Earn More.**

An AI-powered agricultural decision-support platform empowering farmers with real-time mandi intelligence, 7-day price forecasting, and net-profit optimization.

[![Live App](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://agrimarket-gold.vercel.app/)
[![API Status](https://img.shields.io/badge/API-Render-informational?style=for-the-badge&logo=render)](https://agrimarket-backend-nx69.onrender.com/api/health/)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Django REST Framework](https://img.shields.io/badge/Django-DRF-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[**Explore Live Application »**](https://agrimarket-gold.vercel.app/) · [API Health Check](https://agrimarket-backend-nx69.onrender.com/api/health/) · [Deployment Guide](docs/free-development-guide.md)

</div>

---

## 📌 Problem & Motivation

Smallholder farmers across India face severe **price information asymmetry**:
1. **Raw Mandi Prices are Deceptive**: A mandi 60 km away offering ₹200/quintal more may actually yield *lower* profit once diesel, loading, and transit perishability costs are deducted.
2. **Timing Uncertainty**: Farmers often sell immediately post-harvest due to fear of price crashes, losing substantial margins that storage for even 3–5 days could capture.
3. **Complex Data Fragmentation**: Mandi arrival and pricing records from Agmarknet / OGD India are vast and technical, rarely presented in an accessible, actionable manner for farmers.

**AgriMarket AI solves this** by translating raw agricultural market data into an **actionable selling plan**: calculating net-realized profit (price minus transport and storage decay) and delivering machine-learning price forecasts with **English & Hindi (हिंदी)** localization.

---

## 🚀 Key Features

* **🌾 Smart Selling Recommendation Engine**: Compares multiple regional mandis and ranks them by **Net Expected Realization** (accounting for distance, ₹/quintal/km transport, and storage costs) rather than gross prices.
* **📈 7-Day ML Price Forecasting**: Employs Linear Regression & Decision Tree models trained on historical mandi arrivals to project next-week modal price trajectories with confidence bands.
* **🔍 Cascading 6-Filter Market Explorer**: Real-time filtering across Commodity Group, Commodity, Variety, State, District, and Mandi with daily arrivals and modal/min/max spreads.
* **📦 Lot & Inventory Management**: Farmers can record harvested produce lots with target reserve prices, grade classification, and delivery preferences without mandatory account creation.
* **🤝 Transparent Transaction Tracker**: Real-time lifecycle tracking of buyer bids, offers, dispatch logistics, and payment settlements.
* **🌐 Bilingual Interface**: Instant, zero-reload switching between **English** and **Hindi (हिंदी)**.
* **🛡️ Zero-Crash Offline Resilience**: Graceful hierarchical CSV fallbacks ensure the application functions smoothly even during upstream government API downtime or rate-limiting.

---

## 🏗️ System Architecture

```
                                  [ Farmer / User ]
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │      Frontend: Vercel Cloud          │
                      │  React 19 + Vite + Tailwind CSS      │
                      │  https://agrimarket-gold.vercel.app  │
                      └──────────────────┬───────────────────┘
                                         │  HTTPS / JSON
                                         ▼
                      ┌──────────────────────────────────────┐
                      │       Backend: Render Cloud          │
                      │    Django 5.0 + Django REST (DRF)    │
                      │    Scikit-Learn ML Analytics         │
                      └─────────┬───────────────────┬────────┘
                                │                   │
             PyMongo Driver     │                   │  API Fetch / Fallback
                                ▼                   ▼
┌─────────────────────────────────┐   ┌────────────────────────────────┐
│   MongoDB Atlas (M0 Shared)     │   │   Government Mandi Portal      │
│   - Produce Lots & Inventory    │   │   - OGD Platform / Agmarknet   │
│   - Offers & Ledger Status      │   │   - 10,000+ Record Dataset.csv │
└─────────────────────────────────┘   └────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Domain | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS | High-performance SPA with responsive mobile-first UI and native SVG charts |
| **Backend** | Python 3.11, Django 5, DRF | RESTful architecture with CORS isolation and modular service layer |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy | Linear Regression, Decision Trees, K-Means clustering, and time-series projection |
| **Big Data Pipeline** | PySpark, Spark MLlib | RDD & DataFrame batch processing for large-scale multi-mandi aggregations |
| **Database** | MongoDB Atlas (Cloud) | Flexible document store for lots, offers, and market analytics |
| **Containerization** | Docker, Docker Compose, Nginx | Multi-stage production frontend (Nginx), Python 3.12-slim backend, and Mongo 8 container |
| **Deployment** | Vercel (UI) + Render (API) | 100% zero-cost cloud architecture ($0/month) |

---

## 📊 Machine Learning & Analytics

AgriMarket AI incorporates multiple ML techniques to assist agricultural commerce:

1. **Time-Series Modal Price Forecasting**:
   - Computes weighted linear trend vectors and non-linear seasonal decision splits over date-grouped mandi records.
   - Evaluated with $R^2$, Mean Absolute Error (MAE), and Root Mean Squared Error (RMSE).
2. **Net Realization Ranking Algorithm**:
   $$\text{Net Realization} = \text{Forecasted Price} - (\text{Distance} \times \text{Transport Cost per KM}) - (\text{Storage Days} \times \text{Holding Cost})$$
3. **Market Clustering**:
   - K-Means grouping of mandis based on arrival volume volatility and price dispersion to identify low-risk selling hubs.

---

## 🔌 API Endpoints Reference

Base URL: `https://agrimarket-backend-nx69.onrender.com/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health/` | Service health & MongoDB connectivity status |
| `GET` | `/locations/` | Hierarchical State &rarr; District mapping |
| `GET` | `/markets/?state=...&district=...` | Live mandi prices, commodity varieties, and min/max ranges |
| `POST` | `/recommendations/` | Computes ranked net-profit selling plan with transport/storage |
| `GET` | `/forecasts/?crop=...` | 7-day modal price forecast and day-by-day trends |
| `GET` | `/forecast/metadata/` | Available crops, states, and market varieties for conditional analysis |
| `GET` | `/forecast/conditioned/?crop=...&market=...` | Highly targeted ML prediction for specific market and grade |
| `GET` / `POST` | `/lots/` | List and create farmer inventory lots |
| `GET` / `POST` | `/offers/` | Retrieve and record trade bids and dispatch stages |

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js** (v18+)
* **Python** (v3.10 or v3.11)
* **MongoDB** (Local instance or free MongoDB Atlas URI)

### 1. Clone Repository
```bash
git clone https://github.com/iamrajvardhanmall/Agrimarket.git
cd Agrimarket
git checkout Raj
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py test market_api
python manage.py runserver
```
Backend API will start at: `http://localhost:8000/api/`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🐳 Containerization & Docker Setup

AgriMarket AI provides complete containerization support for local testing, development isolation, and production deployments.

### 1. Run MongoDB with Docker Compose
Spin up a local MongoDB 8 instance with persistent storage in one command:
```bash
docker compose up -d
```
* **Port**: `27017`
* **Volume**: `mongodb_data` (persists data across restarts)
* To stop: `docker compose down`

### 2. Backend Container (`backend/Dockerfile`)
The backend uses a lightweight `python:3.12-slim` container:
```bash
cd backend

# Build Docker image
docker build -t agrimarket-backend .

# Run container (injecting environment variables)
docker run -d -p 8000:8000 --env-file .env --name agrimarket-api agrimarket-backend
```
The Django REST API will be accessible at `http://localhost:8000/api/health/`.

### 3. Frontend Container (`frontend/Dockerfile`)
The frontend uses a **multi-stage build**:
1. **Build Stage (`node:22-alpine`)**: Compiles the Vite React bundle.
2. **Production Stage (`nginx:alpine`)**: Serves optimized static assets with high-performance Nginx.

```bash
cd frontend

# Build Docker image
docker build -t agrimarket-frontend .

# Run container
docker run -d -p 80:80 --name agrimarket-web agrimarket-frontend
```
Open `http://localhost` in your browser.

---

## 🚢 Free Cloud Deployment ($0 / ₹0)

The entire AgriMarket AI platform is configured for **permanent $0 deployment**:
* **Frontend**: Hosted on [Vercel](https://vercel.com) (React/Vite static build).
* **Backend**: Hosted on [Render.com](https://render.com) (Python Web Service).
* **Database**: Hosted on [MongoDB Atlas](https://cloud.mongodb.com) (Free 512MB M0 Cluster).

For the complete, step-by-step walkthrough, see our [**Zero-Cost Deployment Guide**](docs/free-development-guide.md).

---

## 🧪 Testing & Verification

Run the comprehensive unit test suite:
```bash
# Backend unit tests
cd backend
python manage.py test market_api

# Frontend production build verification
cd ../frontend
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Built with dedication for farmers across India 🇮🇳
</div>
