<div align="center">

# 🌱 AgriMarket AI
### **Intelligent Mandi Market Analytics, Machine Learning Price Forecasting & Net-Profit Optimization**

*Empowering Indian Smallholder Farmers with Transparent Market Intelligence, 7-Day ML Price Forecasts, and Cost-Aware Selling Plans.*

[![Live App](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://agrimarket-gold.vercel.app/)
[![API Status](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://agrimarket-backend-nx69.onrender.com/api/health/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Django](https://img.shields.io/badge/Django-5.0%20%7C%20DRF-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge&logo=open-source-initiative&logoColor=black)](LICENSE)

[**🌐 Live Application**](https://agrimarket-gold.vercel.app/) • [**📘 Project Overview**](PROJECT_OVERVIEW.md)

</div>

---

## 📑 Table of Contents

- [📌 Problem Statement & Mission](#-problem-statement--mission)
- [✨ Key System Highlights](#-key-system-highlights)
- [🧠 Machine Learning Architecture & Empirical Benchmarks](#-machine-learning-architecture--empirical-benchmarks)
  - [1. Mathematical Formulation: Multiple Linear Regression](#1-mathematical-formulation-multiple-linear-regression)
  - [2. Dual-Model Price Forecasting Ensemble](#2-dual-model-price-forecasting-ensemble)
  - [3. Unsupervised K-Means Market Segmentation](#3-unsupervised-k-means-market-segmentation-k3)
  - [4. Pearson Correlation Matrix Analysis](#4-pearson-correlation-matrix-analysis)
- [💰 Economic Simulation & Farmer Welfare](#-economic-simulation--farmer-welfare)
- [🏛️ System Architecture](#️-system-architecture)
- [🖥️ UI Modules & Farmer-Centric Experience](#️-ui-modules--farmer-centric-experience)
- [🔌 API Endpoints Reference](#-api-endpoints-reference)
- [⏰ Automated 12-Hour Mandi Ingestion Pipeline](#-automated-12-hour-mandi-ingestion-pipeline)
- [💻 Local Installation & Quickstart](#-local-installation--quickstart)
- [🐳 Containerization & Docker](#-containerization--docker)
- [🧪 Testing & Verification](#-testing--verification)
- [🌐 Zero-Cost Cloud Deployment Architecture](#-zero-cost-cloud-deployment-architecture)
- [🤝 Contributing & License](#-contributing--license)

---

## 📌 Problem Statement & Mission

India's primary agricultural marketing infrastructure encompasses over 6,600 regulated wholesale yards (mandis) governed by state Agricultural Produce Market Committee (APMC) acts. Despite the spread of mobile connectivity, smallholder farmers—who operate over 86% of India's agricultural holdings—frequently incur avoidable financial losses due to three structural market bottlenecks:

1. **The Nominal Price Illusion (Gross vs. Net Realization)**: Conventional digital portals display headline spot prices. A mandi 60 km away quoting ₹250/quintal more often leaves the farmer with *lower net income* once freight tariffs, loading fees, transit shrinkage, and toll expenses are subtracted.
2. **Post-Harvest Temporal Distress**: Lacking short-term price trend forecasts, farmers panic-sell immediately at harvest gluts instead of storing for 3–5 days to capture projected price recoveries.
3. **Information Friction & Digital Usability**: Official government portals publish dense, unranked tabular lists that fail to offer localized, cost-deducted recommendations on entry-level mobile devices.

### 🎯 The AgriMarket AI Solution
AgriMarket AI ingests live mandi price records and computes the farmer's **Net Realization ($\mathcal{R}_{\text{net}}$)**—the actual cash pocketed after subtracting freight tariffs, quality discounts, and holding expenses. The platform delivers sub-15ms recommendations in **English and Hindi (हिंदी)** with instant WhatsApp advisory sharing.

---

## ✨ Key System Highlights

- 🌾 **Cost-Aware Net Realization Optimizer ($\mathcal{R}_{\text{net}}$)**: Evaluates three marketing pathways: **Sell Now** at local yard, **Store & Sell Later** (arbitraging price velocity against storage fees), or **Ship to Alternate Mandi** (if premium offsets transport freight).
- 📈 **7-Day Price Trajectory Forecast**: Machine learning ensemble combining Ordinary Least Squares (OLS) regression and depth-constrained Decision Trees with upper/lower confidence bounds.
- ⚡ **Lightweight & High-Performance ML Engine**: Built with **scikit-learn**, **pandas**, and **NumPy** for sub-15ms live inference without requiring resource-heavy distributed clusters in production.
- 🔍 **Dynamic National Crop Catalog**: Automatically synchronizes 100+ commodities and varieties from national arrivals with dynamic cascading state/district filtering.
- 📊 **Enhanced Interactive Market Visualizations**:
  - **Price Range Chart**: Displays intraday min-max spreads, modal clearing points, and net-earn markers against the best market benchmark.
  - **Earnings Compare Chart**: Explicit breakdown showing exactly how much transport and storage costs deduct from the modal rate.
  - **Market Volume Chart**: Color-coded supply share with automated oversupply risk detection.
  - **Net Realization Ranking**: Clear bar chart ordering mandis strictly by take-home revenue.
- 💬 **Instant WhatsApp Advisory Dispatch**: One-click sharing that formats the exact selling recommendation, market name, net earnings, and live web app link.
- 🌐 **Zero-Auth, 100% Free Access**: Progressive Web Application (PWA) with offline capabilities, achieving a **98/100 Google Lighthouse performance score**.
- 🛡️ **Automated 12-Hour Sync & Failover**: Scheduled cloud ingestion from data.gov.in / AGMARKNET with proxy fallbacks and automated keepalive commits.

---

## 🧠 Machine Learning Architecture & Empirical Benchmarks

AgriMarket AI pairs deterministic parametric baselines with non-linear tree structures trained on **141,247+ verified wholesale transactions** across 10 major agricultural states.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      AGRIMARKET ML INFERENCE ENGINE                    │
├───────────────────────────────────┬────────────────────────────────────┤
│ Supervised Learning               │ Unsupervised & Statistical         │
│ - Multiple Linear Regression      │ - K-Means Clustering (k=3)         │
│ - Decision Tree Regressor (d=8)   │ - Pearson Correlation Analysis     │
│ - Quality Multipliers (γ_g)       │ - Dynamic Arrival Outlier Filter   │
│ - Confidence Metric (C_i)         │ - 7-Day Momentum Drift (T_7d)      │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 1. Mathematical Formulation: Multiple Linear Regression

Modal clearing prices ($\hat{y}$) reflect intraday auction clearing boundaries. The baseline models modal price as a linear combination of reported daily auction bounds:

$$\hat{y}_{\text{LR}} = \beta_0 + \beta_1 \cdot P_{\min} + \beta_2 \cdot P_{\max}$$

* **Fitted Equation (141,247+ records)**:
  $$\text{Modal Price} = 28.10 + 0.5242 \cdot P_{\min} + 0.4829 \cdot P_{\max}$$
* **Mathematical Reality**: $\beta_1 + \beta_2 = 0.5242 + 0.4829 = 1.0071 \approx 1.0$. This demonstrates that market clearing prices consistently settle as a **convex combination** of morning auction extremes.

---

### 2. Dual-Model Price Forecasting Ensemble

To capture non-linear arrival shocks and bid-ask spreads ($P_{\max} - P_{\min}$) that linear equations overlook, predictions are synthesized with a depth-regularized Decision Tree Regressor ($d_{\max}=8$):

$$\hat{P}_i = \frac{\hat{y}_{\text{LR}} + \hat{y}_{\text{DT}}}{2} \times \gamma_g$$

where $\gamma_g \in [0.88, 1.08]$ represents the empirical quality grade multiplier.

#### Empirical Performance Benchmarks (Full Dataset: 141,247 records)

| Model Architecture | $R^2$ Score | MAE (₹/quintal) | RMSE (₹/quintal) | MAPE (%) |
|---|:---:|:---:|:---:|:---:|
| **Multiple Linear Regression (OLS)** | **0.9955** | **₹118.55** | ₹368.19 | **2.66%** |
| **Decision Tree Regressor ($d=8$)** | **0.9947** | **₹139.72** | ₹397.11 | **3.43%** |

> **Note on Metric Selection**: In distressed commodity markets (e.g. seasonal vegetables trading at ₹150–₹300/qtl), minor absolute rupee deviations trigger extreme percentage spikes in MAPE. Absolute Mean Absolute Error (**MAE = ₹118.55/qtl**) provides the most statistically reliable and farmer-relevant welfare metric.

---

### 3. Unsupervised K-Means Market Segmentation ($k=3$)

Using normalized price levels and transaction density, an unsupervised K-Means model segments mandis into 3 operational tiers to prevent farmers from routing heavy volume to illiquid markets:

* **Silhouette Score**: **`0.7371`** (indicating distinct, well-separated cluster geometry)

| Cluster Tier | Classification | Profile & Liquidity | Record Share |
|:---:|:---|:---|:---:|
| **Cluster 0** | **Local Rural Yards** | Moderate price spread, lower volume, local consumption | **91.4%** (129,110 rows) |
| **Cluster 1** | **Regional APMCs** | Standardized commercial trading, balanced liquidity | **0.2%** (313 rows) |
| **Cluster 2** | **Terminal Mega-Hubs** | High-volume urban absorption, premium institutional buyers | **8.4%** (11,824 rows) |

---

### 4. Pearson Correlation Matrix Analysis

Statistical inter-feature relationships across national records:

```
Feature           Min Price   Max Price  Modal Price    Month   Day of Year
───────────────────────────────────────────────────────────────────────────
Min Price          1.0000      0.9595      0.9878      0.0024    -0.0006
Max Price          0.9595      1.0000      0.9862     -0.0050    -0.0034
Modal Price        0.9878      0.9862      1.0000     -0.0028    -0.0024
Month              0.0024     -0.0050     -0.0028      1.0000     0.4866
Day of Year       -0.0006     -0.0034     -0.0024      0.4866     1.0000
```

---

## 💰 Economic Simulation & Farmer Welfare

To measure real-world financial efficacy, a Monte Carlo simulation was executed across **2,500 synthetic smallholder harvest profiles** ($Q \in [5, 100]\text{ qtl}$, $D \in [5, 80]\text{ km}$, $C_{\text{trans}} \in [33, 43]\text{ ₹/qtl/km}$, $t_{\text{store}} \in \{0, 3, 7, 14\}\text{ days}$).

### Formulation: Net Realization Objective Function ($\mathcal{R}_{\text{net}}$)

$$\mathcal{R}_{\text{net}} = \left(\frac{\hat{P}_i \cdot Q}{100}\right) - \left(D_i \cdot C_{\text{trans}} \cdot \frac{Q}{100}\right) - \left(t_{\text{store}} \cdot C_{\text{store}} \cdot Q\right)$$

### Economic Simulation Outcomes (2,500 Scenarios)

| Evaluation Metric | Policy 1: Local Default | Policy 2: Nominal Max (Uninformed) | Policy 3: AgriMarket AI (Cost-Aware) | Net Impact |
|---|:---:|:---:|:---:|:---:|
| **Mean Net Realization ($\mathcal{R}_{\text{net}}$)** | ₹84,250 | ₹87,790 | **₹96,720** | **+14.8% vs. Local** |
| **Average Freight Incurred** | ₹1,420 | ₹5,860 | **₹2,840** | **-51.5% vs. Nominal** |
| **Loss Incidence vs. Local** | 0.0% (Baseline) | 26.4% (660 trials) | **0.0% (0 trials)** | **Losses Eliminated** |

* **Key Takeaway**: In **26.4% of cases**, chasing the highest advertised mandi price caused farmers to lose money due to transport costs. AgriMarket AI completely eliminates this trap while lifting net income by **14.8%**.

---

## 🏛️ System Architecture

```
                                   [ Indian Smallholder Farmer ]
                                                │
                                                ▼
                             ┌──────────────────────────────────────┐
                             │       Frontend: Vercel Cloud         │
                             │   React 19 + Vite (PWA Architecture) │
                             │   Bilingual (English / हिंदी) Engine  │
                             │   https://agrimarket-gold.vercel.app │
                             └──────────────────┬───────────────────┘
                                                │  HTTPS / JSON (<15ms)
                                                ▼
                             ┌──────────────────────────────────────┐
                             │        Backend: Render Cloud         │
                             │     Python 3.11 + Django 5.0 REST    │
                             │     scikit-learn Inference Engine    │
                             │     Dynamic CSV & Mongo In-Memory    │
                             └──────────┬───────────────────┬───────┘
                                        │                   │
                     PyMongo Atlas      │                   │  12-Hour Sync / Fallback
                                        ▼                   ▼
        ┌─────────────────────────────────┐   ┌────────────────────────────────┐
        │   MongoDB Atlas (Cloud M0)      │   │   data.gov.in / AGMARKNET      │
        │   - Produce Lots & Inventory    │   │   - 141,247+ Mandi Records     │
        │   - Buyer Offers & Grievances   │   │   - Resilient Failover Cache   │
        └─────────────────────────────────┘   └────────────────────────────────┘
```

---

## 🖥️ UI Modules & Farmer-Centric Experience

The user experience is built around four streamlined tabs accessible without registration:

```
┌────────────────────────────────────────────────────────────────────────┐
│  [🌾 About & Overview] [📈 Selling Plan] [🏪 Markets] [❓ User Guide]   │
└────────────────────────────────────────────────────────────────────────┘
```

1. **🌾 About / Overview Tab (`AboutTab.jsx`)**:
   - Executive overview, real-time national dataset counter (**1.4L+ Mandi Records**), and clear before-vs-after comparisons showing how cost-awareness saves money.
2. **📈 Selling Plan Tab (`SellingPlanTab.jsx`)**:
   - **Hero AI Decision Card**: Instant verdict on optimal mandi route, net take-home earnings, and AI model confidence score.
   - **Sell Now vs. Store Later Comparison**: Compares immediate sale against 3–7 day holding arbitrage minus storage fees.
   - **All-Crop Selector**: Dynamically populated dropdown with over 100+ commodities loaded directly from the national dataset.
   - **One-Click WhatsApp Dispatch**: Shares formatted selling advisories with verified web app links.
3. **🏪 Markets Tab (`MarketsTab.jsx`)**:
   - Interactive market exploration with cascading commodity/variety/location filters.
   - 4 readable charts (Price Range, Earnings Compare, Market Volume, and Net Realization).
4. **❓ Help & Guide Tab (`HelpTab.jsx`)**:
   - Bilingual FAQ and step-by-step assistance with backend connection status monitoring.

---

## 🔌 API Endpoints Reference

Base URL: `https://agrimarket-backend-nx69.onrender.com/api`

| Method | Endpoint | Description | Sample Query / Payload |
|---|---|---|---|
| `GET` | `/health/` | Service health, MongoDB status, and live dataset row count | None |
| `GET` | `/locations/` | Hierarchical State &rarr; District mapping | None |
| `GET` | `/markets/` | Filtered list of live mandis and prices | `?state=Karnataka&district=Kolar&commodity=Tomato` |
| `POST` | `/recommendations/` | Computes ranked net-profit selling plan | `{"commodity": "Tomato", "state": "Karnataka", "quantity_kg": 5000, "transport_rate_per_km": 38, "storage_days": 0}` |
| `GET` | `/forecasts/` | 7-day price forecasting trajectory | `?commodity=Tomato` |
| `GET` | `/forecast/metadata/` | Complete list of 100+ crops, grades, and districts | None |
| `GET` | `/forecast/conditioned/` | Targeted prediction for specific mandi and variety | `?commodity=Onion&market=Lasalgaon Market` |
| `GET` / `POST` | `/lots/` | Retrieve and record farmer produce lots | `{"commodity": "Wheat", "quantity_kg": 3000, "expected_price": 2400}` |
| `GET` / `POST` | `/offers/` | Retrieve and submit buyer bids | `{"lot_id": "...", "bid_price": 2450}` |

---

## ⏰ Automated 12-Hour Mandi Ingestion Pipeline

To ensure market intelligence stays up-to-date without human intervention, AgriMarket AI uses an automated synchronization engine:

* **GitHub Actions Workflow**: [`.github/workflows/fetch-market-data.yml`](.github/workflows/fetch-market-data.yml)
* **Schedule**: Runs automatically every 12 hours via cron (`17 6,18 * * *` UTC = 11:47 & 23:47 IST).
* **Fault-Tolerant Features**:
  - Validates `MARKET_DATA_API_KEY` presence.
  - Ingests new records via `data_engine/fetch_daily_market_data.py`.
  - Appends new records into `data_engine/Dataset.csv` while deduplicating existing rows.
  - Generates keepalive commits when upstream government portals are temporarily geo-blocked, ensuring GitHub never disables the cron schedule due to inactivity.
  - Publishes run telemetry directly into GitHub Action Step Summaries.

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
```

### Step 2: Backend Setup
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
*Backend API will run at `http://localhost:8000/api/`.*

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend will launch at `http://localhost:5173`.*

### Step 4: Run Machine Learning Pipeline Locally
```bash
cd ..
python ml/ml_models.py
```
*Trains Linear Regression, Decision Tree, and K-Means models on the full 141K+ dataset and prints a formatted terminal report.*

---

## 🐳 Containerization & Docker

AgriMarket AI provides containerized deployment setups:

### 1. MongoDB Service with Docker Compose
```bash
docker compose up -d
```
*Starts local MongoDB 8 container on port `27017` with persistent volumes.*

### 2. Backend Container
```bash
cd backend
docker build -t agrimarket-backend .
docker run -d -p 8000:8000 --env-file .env --name agrimarket-api agrimarket-backend
```

### 3. Frontend Container (Multi-Stage Build)
```bash
cd frontend
docker build -t agrimarket-frontend .
docker run -d -p 80:80 --name agrimarket-web agrimarket-frontend
```

---

## 🧪 Testing & Verification

Comprehensive test suites ensure data integrity and model stability:

```bash
# 1. Run Backend Django REST Tests (14 Tests passing)
cd backend
python manage.py test market_api

# 2. Verify Frontend Production Build
cd ../frontend
npm run build

# 3. Verify ML Pipeline Syntax & Execution
cd ..
python ml/ml_models.py
```

---

## 🌐 Zero-Cost Cloud Deployment Architecture

AgriMarket AI is designed to run entirely on sustainable zero-cost cloud tiers ($0/month):

| Infrastructure Tier | Service Provider | Deployment Specs | Monthly Cost |
|---|---|---|:---:|
| **Frontend CDN** | [Vercel](https://vercel.com) | React 19 / Vite Edge Network Distribution | **$0.00** |
| **Backend Web Service** | [Render](https://render.com) | Python 3.11 Linux Micro-Instance | **$0.00** |
| **Database Cluster** | [MongoDB Atlas](https://mongodb.com/atlas) | M0 Shared Free Tier (512 MB Storage) | **$0.00** |
| **CI/CD Automation** | [GitHub Actions](https://github.com/features/actions) | 2,000 Free Runner Minutes/Month | **$0.00** |

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

<div align="center">

**AgriMarket AI** — *Empowering Indian Agriculture through Transparent Data Science and Net Realization Economics.* 🌾🇮🇳

</div>
