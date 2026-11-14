<div align="center">

# 🌱 AgriMarket AI
### **Intelligent Mandi Market Analytics, PySpark MLlib Price Forecasting & Net-Profit Optimization**

*Empowering Indian Farmers with Real-Time Mandi Intelligence, 7-Day Machine Learning Price Trajectories, and Cost-Optimized Selling Plans.*

[![Live App](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://agrimarket-gold.vercel.app/)
[![API Status](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://agrimarket-backend-nx69.onrender.com/api/health/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![PySpark](https://img.shields.io/badge/Apache%20Spark-PySpark%20MLlib-E25A1C?style=for-the-badge&logo=apachespark&logoColor=white)](https://spark.apache.org/)
[![Django](https://img.shields.io/badge/Django-5.0%20%7C%20DRF-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge&logo=open-source-initiative&logoColor=black)](LICENSE)

[**🌐 Live Application**](https://agrimarket-gold.vercel.app/) • [**📡 Backend API**](https://agrimarket-backend-nx69.onrender.com/api/health/) • [**📓 ML Evaluation Notebook**](ml/model_evaluation_and_metrics.ipynb) • [**📘 Zero-Cost Deployment Guide**](docs/free-development-guide.md)

</div>

---

## 📑 Table of Contents

- [📌 Problem Statement \& Mission](#-problem-statement--mission)
- [✨ Key System Highlights](#-key-system-highlights)
- [🧠 Machine Learning \& PySpark MLlib Architecture](#-machine-learning--pyspark-mllib-architecture)
  - [1. Multiple Linear Regression Formulation](#1-multiple-linear-regression-formulation)
  - [2. Model Evaluation Metrics (MAE, RMSE, MAPE, $R^2$)](#2-model-evaluation-metrics)
  - [3. Multi-Class Demand Classification \& Confusion Matrices](#3-multi-class-demand-classification--confusion-matrices)
  - [4. Unsupervised K-Means Market Clustering](#4-unsupervised-k-means-market-clustering)
  - [5. Standalone Evaluation Notebook (`.ipynb`)](#5-standalone-evaluation-notebook)
- [🏛️ System Architecture](#️-system-architecture)
- [🖥️ UI Modules \& Clean Farmer Experience](#️-ui-modules--clean-farmer-experience)
- [🔌 API Endpoints Reference](#-api-endpoints-reference)
- [⏰ Automated 12-Hour Mandi Data Pipeline](#-automated-12-hour-mandi-data-pipeline)
- [💻 Local Installation \& Quickstart](#-local-installation--quickstart)
- [🐳 Containerization \& Docker Compose](#-containerization--docker-compose)
- [🧪 Testing \& Validation](#-testing--validation)
- [🌐 Zero-Cost Cloud Deployment ($0/month)](#-zero-cost-cloud-deployment-0month)
- [🤝 Contributing \& License](#-contributing--license)

---

## 📌 Problem Statement & Mission

Smallholder farmers across India face critical **price information asymmetry** and high logistical overheads:

1. **Deceptive Gross Mandi Prices**: A distant APMC market quoting ₹200/quintal more often results in a net loss once diesel transport, loading, and holding decay are subtracted.
2. **Post-Harvest Distress Selling**: Lack of reliable short-term price trend forecasts forces growers to sell immediately at bottom rates instead of storing for 3–5 days to capture peak profit.
3. **Fragmented & Dense Data**: Official government portals (e.g. Agmarknet / data.gov.in) publish raw tabular data that is difficult for farmers to interpret on mobile devices in local languages.

### 🎯 The AgriMarket AI Solution
AgriMarket AI translates millions of raw government mandi price records into an **actionable, net-profit-optimized selling plan**. It evaluates transport costs, storage fees, commodity grade premiums, and 7-day ML price forecasts in both **English and Hindi (हिंदी)** to ensure growers receive the highest possible take-home revenue.

---

## ✨ Key System Highlights

- 🌾 **AI-Driven Selling Decision Plan**: Ranks regional mandis strictly by **Net Expected Realization** (Gross Revenue minus Route Transport and Warehouse Storage Costs).
- 📈 **7-Day Price Trajectory Forecasts**: Time-series projection using Linear Regression and non-linear Decision Tree models with upper/lower confidence bounds.
- ⚡ **PySpark & Spark MLlib Integration**: Distributed machine learning pipeline (`train_spark_models.py`, `market_models.py`) with automatic fallback to scikit-learn when running in low-resource environments.
- 🔍 **Dynamic 6-Tier Cascading Filter**: Real-time filtering across Commodity Group, Commodity, Variety, State, District, and Mandi with zero stale options.
- 🌐 **Instant Bilingual Localization**: Seamless, zero-latency toggle between **English** and **Hindi (हिंदी)** for all charts, cards, inputs, and recommendations.
- 🛡️ **Zero-Downtime Resilience**: 3-tier fallback architecture (Live OGD API &rarr; Bundled 100,000+ Record `Dataset.csv` &rarr; In-Memory APMC Cache) guarantees the UI never crashes during third-party API outages.
- ⏰ **Automated 12-Hour Data Engine**: Scheduled GitHub Actions workflow and local background daemon keep mandi prices perpetually synchronized with national arrivals.

---

## 🧠 Machine Learning & PySpark MLlib Architecture

AgriMarket AI is designed with a **PySpark-centric and Spark MLlib** analytical backbone, enabling distributed big-data model training alongside standard scikit-learn runtime inference.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AGRIMARKET ML PIPELINE                          │
├───────────────────────────────┬────────────────────────────────────────┤
│ PySpark MLlib Core (`ml/`)    │ Scikit-Learn Runtime (`market_api/`)   │
│ - Spark VectorAssembler       │ - Low-latency HTTP inference           │
│ - LinearRegressionModel       │ - DecisionTreeRegressor ensemble       │
│ - LogisticRegressionModel     │ - LinearSVC & GaussianNB               │
│ - DecisionTreeClassifier      │ - Standard Scaler feature pipelines    │
│ - KMeans (k=3) Clusterer      │ - Time-series trend extrapolation      │
└───────────────────────────────┴────────────────────────────────────────┘
```

### 1. Multiple Linear Regression Formulation

The price estimation engine models modal mandi prices ($\hat{y}$) as a linear combination of recorded daily price bounds:

$$\hat{y} = \beta_0 + \beta_1 \cdot (\text{Min Price}) + \beta_2 \cdot (\text{Max Price})$$

* **Intercept ($\beta_0$)**: Base adjustment factor reflecting market entry spread.
* **Coefficients ($\beta_1, \beta_2$)**: Weights allocated to minimum and maximum price movements.

**Empirical Parameters (Trained on 94,000+ national records):**
* **Intercept ($\beta_0$)**: `16.6661`
* **$\beta_1$ (Min Price)**: `0.5233`
* **$\beta_2$ (Max Price)**: `0.4802`
* **Fitted Model**: $\text{Modal Price} = 16.6661 + 0.5233 \cdot (\text{Min Price}) + 0.4802 \cdot (\text{Max Price})$

---

### 2. Model Evaluation Metrics

Regression performance is validated using industry-standard statistical indicators:

| Metric | Mathematical Definition | Value | Unit |
|---|---|---|---|
| **$R^2$ Score** | $1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$ | **`0.9918`** | Scale $0 - 1$ |
| **MAE** | $\frac{1}{N} \sum_{i=1}^{N} \|y_i - \hat{y}_i\|$ | **`83.80`** | ₹ / quintal |
| **RMSE** | $\sqrt{\frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2}$ | **`492.76`** | ₹ / quintal |
| **MAPE** | $\frac{100\%}{N} \sum_{i=1}^{N} \left\|\frac{y_i - \hat{y}_i}{y_i}\right\|$ | **`45.78%`** | Percentage (%) |

---

### 3. Multi-Class Demand Classification & Confusion Matrices

Markets are classified into 3 operational demand tiers (**Low**, **Medium**, **High**) based on market spread and volume. Evaluated using 4 diverse learning algorithms:

1. **Logistic Regression** (Multinomial with L2 regularization)
2. **Decision Tree Classifier** (Max depth = 5, Gini impurity)
3. **Linear Support Vector Machine (LinearSVC)** (Sub-second primal convergence)
4. **Gaussian Naive Bayes** (Probabilistic baseline)

```
        CONFUSION MATRIX (DECISION TREE CLASSIFIER)
                  Predicted Low   Predicted Med   Predicted High
    Actual Low    [    5,892            412              18     ]
    Actual Med    [      320          5,610             384     ]
    Actual High   [       14            289           5,960     ]
```

---

### 4. Unsupervised K-Means Market Clustering

Segmenting mandis into distinct liquidity profiles to recommend optimal selling hubs:
- **Cluster 0 (High Volume / Tight Spread)**: High-turnover terminal mandis (e.g. Nashik, Azadpur) suitable for bulk selling.
- **Cluster 1 (Moderate Volume / Medium Spread)**: Regional APMC mandis suitable for standard FAQ quality lots.
- **Cluster 2 (Low Volume / High Volatility)**: Local seasonal sub-yards where timing storage is critical.

---

### 5. Standalone Evaluation Notebook

A dedicated, comprehensive Jupyter Notebook is provided strictly for model evaluation, error calculations, and presentation:
* 📂 **File**: [`ml/model_evaluation_and_metrics.ipynb`](ml/model_evaluation_and_metrics.ipynb)
* **Contents**:
  - Full dataset ingestion & cleaning pipeline
  - Mathematical derivation of $\beta_0, \beta_1, \beta_2$
  - Complete error tables (MAE, RMSE, MAPE, $R^2$)
  - Residual distributions & Actual vs. Predicted scatter plots
  - Confusion matrices with Seaborn heatmaps
  - K-Means cluster scatter visualization & Pearson correlation heatmaps
* *Note: This notebook is completely decoupled from the production UI to ensure zero overhead on user requests.*

---

## 🏛️ System Architecture

```
                                  [ Farmer / User ]
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │      Frontend: Vercel Cloud          │
                      │  React 19 + Vite + Tailwind CSS      │
                      │  Bilingual (EN / HI) State Engine    │
                      │  https://agrimarket-gold.vercel.app  │
                      └──────────────────┬───────────────────┘
                                         │  HTTPS / JSON
                                         ▼
                      ┌──────────────────────────────────────┐
                      │       Backend: Render Cloud          │
                      │    Django 5.0 + Django REST (DRF)    │
                      │    Scikit-Learn ML Analytics         │
                      │    PySpark ML Data Integration       │
                      └─────────┬───────────────────┬────────┘
                                │                   │
             PyMongo Driver     │                   │  API Fetch / Fallback
                                ▼                   ▼
┌─────────────────────────────────┐   ┌────────────────────────────────┐
│   MongoDB Atlas (M0 Shared)     │   │   Government Mandi Portal      │
│   - Produce Lots & Inventory    │   │   - OGD Platform / Agmarknet   │
│   - Buyer Offers & Status       │   │   - 100,000+ Record Dataset.csv│
└─────────────────────────────────┘   └────────────────────────────────┘
```

---

## 🖥️ UI Modules & Clean Farmer Experience

The web platform features a modern, accessible interface structured into four specialized tabs:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [🌾 About & Overview] [📈 Selling Plan] [🏪 Markets] [❓ User Guide]   │
└────────────────────────────────────────────────────────────────────────┘
```

1. **🌾 About / Overview Tab (`AboutTab.jsx`)**:
   - Executive mission, benefits for marginal farmers, and platform capabilities.
   - Transparent step-by-step guidance on how net-realization calculations protect farmers against hidden transit costs.
2. **📈 Selling Plan Tab (`SellingPlanTab.jsx`)**:
   - **Hero Recommendation Banner**: Immediate display of the highest-profit mandi route with AI confidence rating.
   - **Sell Now vs. Store Later Decision**: Evaluates current price vs. 7-day projected price minus daily warehouse storage fees.
   - **Cost Breakdown**: Explicit transparency for transport rate (₹/km) and storage costs.
   - **One-Click WhatsApp Share**: Farmers can send the generated selling summary directly to family or transport operators.
3. **🏪 Markets Tab (`MarketsTab.jsx`)**:
   - 6-level interactive cascading selector: Commodity Group &rarr; Commodity &rarr; Variety &rarr; Grade &rarr; State &rarr; District &rarr; Mandi.
   - Modal, Minimum, and Maximum price spreads with real-time arrival quantities and trend velocity badges.
4. **❓ Help & Guide Tab (`HelpTab.jsx`)**:
   - Bilingual FAQ and step-by-step user manual with operational health monitoring for the backend connection.

---

## 🔌 API Endpoints Reference

Base URL: `https://agrimarket-backend-nx69.onrender.com/api`

| Method | Endpoint | Description | Sample Query / Payload |
|---|---|---|---|
| `GET` | `/health/` | Service health & MongoDB connection status | None |
| `GET` | `/locations/` | Hierarchical State &rarr; District metadata | None |
| `GET` | `/markets/` | Filtered list of live mandis and arrival prices | `?state=Uttar Pradesh&district=Gorakhpur&commodity=Wheat` |
| `POST` | `/recommendations/` | Computes ranked net-profit selling plan | `{"commodity": "Onion", "state": "Maharashtra", "district": "Nashik", "quantity_kg": 5000, "transport_rate_per_km": 38, "storage_days": 0}` |
| `GET` | `/forecasts/` | 7-day price forecasting trajectory | `?commodity=Tomato` |
| `GET` | `/forecast/metadata/` | Available crops, states, and market varieties | None |
| `GET` | `/forecast/conditioned/` | Targeted prediction for specific mandi and grade | `?crop=Potato&market=Agra APMC` |
| `GET` / `POST` | `/lots/` | Retrieve and create farmer produce lots | `{"commodity": "Paddy", "quantity_kg": 3000, "expected_price": 2200}` |
| `GET` / `POST` | `/offers/` | Retrieve and record buyer bids and dispatch status | `{"lot_id": "...", "bid_price": 2250}` |

---

## ⏰ Automated 12-Hour Mandi Data Pipeline

To guarantee that farmers always view accurate daily prices without manual data entry, AgriMarket AI includes an automated data synchronization engine:

### 1. GitHub Actions (Automated Cloud Sync)
* **Workflow**: [`.github/workflows/fetch-market-data.yml`](.github/workflows/fetch-market-data.yml)
* **Schedule**: Automatically runs every 12 hours via cron (`0 0,12 * * *`) and on manual `workflow_dispatch`.
* **Execution**: Fetches records from data.gov.in, updates `data_engine/Dataset.csv`, commits, and pushes back to GitHub.

### 2. Local Python Scheduler
```bash
# Continuous background execution (every 12 hours)
python scripts/auto_fetch_scheduler.py

# Single test run
python scripts/auto_fetch_scheduler.py --once
```

### 3. Windows One-Click Task Scheduler
```powershell
# Register automated background task
.\scripts\schedule_market_fetch.ps1 -RegisterTask

# Unregister when needed
.\scripts\schedule_market_fetch.ps1 -UnregisterTask
```

---

## 💻 Local Installation & Quickstart

### Prerequisites
* **Python**: 3.10 or 3.11
* **Node.js**: v18 or later
* **Git**

### Step 1: Clone Repository
```bash
git clone https://github.com/iamrajvardhanmall/Agrimarket.git
cd Agrimarket
git checkout Raj
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv .venv

# Activate Virtual Environment:
# On Windows:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py test market_api
python manage.py runserver
```
*Backend API will run at `http://localhost:8000/api/`.*

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend will run at `http://localhost:5173`.*

---

## 🐳 Containerization & Docker Compose

AgriMarket AI provides full production-ready Docker containers:

### 1. Run MongoDB with Docker Compose
```bash
docker compose up -d
```
*Spins up a local MongoDB 8 container on port `27017` with persistent volume storage.*

### 2. Backend Container (`backend/Dockerfile`)
```bash
cd backend
docker build -t agrimarket-backend .
docker run -d -p 8000:8000 --env-file .env --name agrimarket-api agrimarket-backend
```

### 3. Frontend Container (`frontend/Dockerfile`)
Uses a high-performance **multi-stage build** (`node:22-alpine` build &rarr; `nginx:alpine` static serving):
```bash
cd frontend
docker build -t agrimarket-frontend .
docker run -d -p 80:80 --name agrimarket-web agrimarket-frontend
```

---

## 🧪 Testing & Validation

AgriMarket AI includes an automated test suite across backend services and frontend builds:

```bash
# 1. Run Backend DRF & ML Integration Tests (14/14 Tests)
cd backend
python manage.py test market_api

# 2. Verify Frontend Production Build (Vite)
cd ../frontend
npm run build
```

---

## 🌐 Zero-Cost Cloud Deployment ($0/month)

The entire production stack is deployed on permanent free tiers:

| Component | Platform | Configuration | Cost |
|---|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | React 19 / Vite Static Output | **$0.00** |
| **Backend** | [Render](https://render.com) | Python 3.11 Web Service | **$0.00** |
| **Database** | [MongoDB Atlas](https://mongodb.com/atlas) | M0 Shared Sandbox (512 MB) | **$0.00** |
| **Automation** | [GitHub Actions](https://github.com/features/actions) | 2,000 Free CI/CD Mins/Month | **$0.00** |

Detailed configuration instructions are documented in the [**Zero-Cost Deployment Guide**](docs/free-development-guide.md).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

---

<div align="center">

**AgriMarket AI** — *Empowering Indian Agriculture through Distributed Machine Learning and Transparent Mandi Intelligence.* 🇮🇳

</div>
