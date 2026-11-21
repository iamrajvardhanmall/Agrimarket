# 🌾 AgriMarket AI: Comprehensive Project Overview

### **Intelligent Mandi Market Analytics, Machine Learning Price Forecasting & Net-Profit Optimization Platform**

> **SIH 2026 — Problem Statement SIH26132**  
> **Theme:** Agriculture, FoodTech & Rural Development  
> **Organization:** Government of Maharashtra  
> **Category:** Software (Agricultural Economics, Decision Support Systems & Machine Learning)  
> **Live Production Application:** [https://agrimarket-gold.vercel.app/](https://agrimarket-gold.vercel.app/)  

---

## 📑 Executive Summary

**AgriMarket AI** is an open-access, end-to-end agricultural market intelligence and decision support platform engineered to maximize the take-home income of Indian smallholder farmers.

In traditional agricultural marketing, digital advisories report headline spot prices. However, they routinely ignore downstream physical costs: freight tariffs, handling expenses, transit shrinkage, and warehouse storage fees. Consequently, farmers frequently travel to distant wholesale yards (*mandis*) chasing higher gross rates, only to realize **negative net margins** after logistics are settled.

AgriMarket AI resolves this fundamental market failure by evaluating markets strictly through an objective **Net Realization ($\mathcal{R}_{\text{net}}$)** optimization function. Powered by an interpretable machine learning ensemble trained on **141,247+ national mandi transactions**, the platform provides:
1. **Intraday Market Discovery**: Real-time modal, minimum, and maximum price spreads across 6,600+ APMC mandis.
2. **7-Day Price Trajectory Forecasting**: Upper and lower confidence-bounded projections combining Ordinary Least Squares (OLS) regression and depth-regularized Decision Trees.
3. **Tri-Choice Decision Optimization**: Deterministic evaluation of **Sell Now**, **Store & Sell Later** (holding arbitrage), and **Alternate Mandi Logistics**.
4. **Accessible Farmer Delivery**: A zero-authentication, bilingual (English and Hindi), progressive web application delivering sub-15ms inference with integrated WhatsApp advisory sharing.

---

## 🎯 Problem Analysis: The Three Agricultural Friction Points

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INDIAN SMALLHOLDER MARKETING FRICTIONS                          │
├──────────────────────────────┬─────────────────────────────┬───────────────────────────┤
│    1. Spatial Asymmetry      │    2. Temporal Asymmetry    │   3. Interface Friction   │
│                              │                             │                           │
│ - Headline prices mislead    │ - Post-harvest arrival gluts│ - Dense, unranked tables  │
│ - Transport cost overlooked  │ - Distress selling at troughs│ - English-only complexity │
│ - 26.4% loss risk on travel  │ - No holding cost math      │ - Authentication barriers │
└──────────────────────────────┴─────────────────────────────┴───────────────────────────┘
```

### 1. Spatial Price Asymmetry (The Gross-vs-Net Margin Trap)
Wholesale prices across neighboring APMC mandis within a 60–80 km radius frequently diverge by 15% to 35% due to local supply gluts and buyer concentration. Uninformed farmers pursuing higher advertised rates often suffer financial losses because commercial freight tariffs (averaging ₹35–₹45/quintal/km) exceed the price differential.

### 2. Temporal Price Asymmetry (Post-Harvest Distress Selling)
Biological crop perishability and urgent liquidity demands force farmers to liquidate produce immediately following harvest. During the primary arrival window (first 10–14 days), prices temporarily depress due to market oversupply. Without reliable multi-day price trajectory forecasts, farmers cannot determine whether a 3–7 day storage period will yield a premium that outweighs warehouse holding fees.

### 3. Informational & Technological Friction
Government open-data portals (e.g., data.gov.in, AGMARKNET) publish raw tabular data that lacks ranking, logistics integration, or mobile optimization. Low digital literacy and language barriers prevent rural smallholders from translating raw data into operational decisions.

---

## 💡 The AgriMarket AI Solution Architecture

AgriMarket AI converts raw market data into an actionable, localized selling strategy:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  INPUT FARMER PROFILE                                   │
│  - Commodity & Variety (100+ Crops)           - Harvest Volume (Q in quintals / kg)     │
│  - Farm Origin (State & District)             - Quality Grade Multiplier (γ_g)          │
│  - Transport Tariff (₹/km)                    - Holding Duration & Storage Rate (₹/day) │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           CORE DECISION SUPPORT ENGINE                                  │
│                                                                                         │
│  [1] Machine Learning Forecasting       [2] Spatial Freight & Storage Ledger            │
│      - OLS Regression (Modal Baseline)      - Transit Distance (D_i via road network)   │
│      - Decision Tree Regressor (d=8)        - Freight Expense: (D_i × C_trans × Q)/100  │
│      - Quality Scalar: γ_g ∈ [0.88, 1.08]   - Storage Decay: t_store × C_store × Q      │
│                                                                                         │
│  [3] Net Realization Objective Function:                                                │
│      R_net = [(P_hat × Q) / 100] - Freight_Cost - Storage_Cost                          │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  ACTIONABLE OUTPUT                                      │
│  - Primary Recommendation: Sell Now | Store & Sell Later | Alternate Market             │
│  - Expected Net Realization (Take-home profit in INR)                                   │
│  - Model Confidence Score (%) & Visual Cost-Deduction Explanation                       │
│  - One-Click WhatsApp Advisory with Verified Production Web App URL                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Machine Learning Engine & Empirical Formulations

The machine learning architecture (`ml/ml_models.py`) balances high predictive accuracy with low-latency execution, deploying a scikit-learn pipeline optimized for sub-15ms API response times.

### 1. Multiple Linear Regression Formulation (OLS Modal Baseline)
Wholesale auction clearing prices reflect intraday auction boundaries. The linear component models modal clearing price ($\hat{y}_{\text{LR}}$) as:

$$\hat{y}_{\text{LR}} = \beta_0 + \beta_1 \cdot P_{\min} + \beta_2 \cdot P_{\max}$$

* **Fitted Empirical Equation (Trained on 141,247+ records)**:
  $$\text{Modal Price} = 28.10 + 0.5242 \cdot P_{\min} + 0.4829 \cdot P_{\max}$$
* **Convex Combination Proof**:
  $$\beta_1 + \beta_2 = 0.5242 + 0.4829 = 1.0071 \approx 1.0$$
  This mathematically demonstrates that mandi modal prices operate as a weighted convex combination of morning auction extremes, providing an intuitive, transparent baseline for farmers.

### 2. Dual-Model Synthesis & Quality Grade Multipliers
To account for non-linear arrival shocks, day-of-year seasonality, and bid-ask spreads ($P_{\max} - P_{\min}$), the linear prediction is blended with a depth-constrained Decision Tree Regressor ($d_{\max}=8$):

$$\hat{P}_i = \left( \frac{\hat{y}_{\text{LR}, i} + \hat{y}_{\text{DT}, i}}{2} \right) \times \gamma_g$$

where $\gamma_g$ is the empirical quality grade adjustment factor:
* **Grade A (Premium)**: $\gamma_g = 1.08$ (+8% quality premium)
* **FAQ (Fair Average Quality)**: $\gamma_g = 1.00$ (Standard market baseline)
* **Grade B / Medium**: $\gamma_g = 0.95$ (-5% standard discount)
* **Grade C / Local**: $\gamma_g = 0.88$ (-12% moisture/impurity discount)

### 3. Empirical Model Performance Benchmarks

Evaluated across **141,247 validated national records**:

| Model Architecture | $R^2$ Score | MAE (₹/quintal) | RMSE (₹/quintal) | MAPE (%) |
|---|:---:|:---:|:---:|:---:|
| **Multiple Linear Regression (OLS)** | **0.9955** | **₹118.55** | ₹368.19 | **2.66%** |
| **Decision Tree Regressor ($d=8$)** | **0.9947** | **₹139.72** | ₹397.11 | **3.43%** |

> **Analytical Note on Metric Selection**: In distressed commodity markets where distress-sale produce trades at low price points (₹150–₹300/qtl), percentage metrics (MAPE) suffer from denominator inflation. Mean Absolute Error (**MAE = ₹118.55/qtl**) serves as the primary welfare metric representing real-world rupee deviation.

### 4. Unsupervised K-Means Market Profiling ($k=3$)
Using normalized price levels and transaction density, an unsupervised K-Means clustering algorithm ($k=3$, **Silhouette Score = `0.7371`**) categorizes trading yards into three operational tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                    K-MEANS MARKET SEGMENTATION (k=3)                   │
├───────────┬──────────────────────┬───────────────┬─────────────────────┤
│ Cluster   │ Tier Name            │ Record Share  │ Centroid Price (₹)  │
├───────────┼──────────────────────┼───────────────┼─────────────────────┤
│ Cluster 0 │ Local Rural Yards    │ 91.4% (129,110)│ Min: 3,994 | Max: 4,608 │
│ Cluster 1 │ Regional APMCs       │  0.2% (313)   │ Min: 15,052| Max: 17,601│
│ Cluster 2 │ Terminal Mega-Hubs   │  8.4% (11,824)│ Min: 89,072| Max:106,194│
└───────────┴──────────────────────┴───────────────┴─────────────────────┘
```
This market profiling prevents smallholders from routing heavy commercial volumes to local rural yards with insufficient liquidity.

### 5. Prediction Confidence Metric ($\mathcal{C}_i$)
To establish trust with farmers, every recommendation includes a deterministic confidence score:

$$\mathcal{C}_i = \text{round}\left( \max\left(0, 100 - \frac{|\hat{y}_{\text{LR}, i} - \hat{y}_{\text{DT}, i}|}{\hat{P}_i} \times 100 \right) \right)$$

When linear and decision tree predictions converge, confidence approaches 95%–100%. Wide divergence due to extreme market volatility lowers the rating and flags caution.

---

## 💰 Economic Impact Simulation

To validate whether predictive accuracy translates into tangible financial gains, a Monte Carlo simulation was executed across **2,500 synthetic harvest profiles** sampling smallholder parameters:
* Produce Volume: $Q \sim \mathcal{U}(5, 100)\text{ quintals}$ (500 to 10,000 kg)
* Transit Distance: $D \sim \mathcal{U}(5, 80)\text{ km}$
* Freight Tariff: $C_{\text{trans}} \sim \mathcal{N}(38, 5)\text{ ₹/quintal/km}$
* Storage Duration: $t_{\text{store}} \in \{0, 3, 7, 14\}\text{ days}$

### Comparative Policies
1. **Policy 1: Local Default (Baseline)**: Farmer sells immediately at nearest yard regardless of clearing price.
2. **Policy 2: Nominal Maximum (Uninformed)**: Farmer chases highest advertised regional price without logistics accounting.
3. **Policy 3: AgriMarket AI (Cost-Aware Optimization)**: Farmer follows the optimal $\mathcal{R}_{\text{net}}$ recommendation.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       ECONOMIC SIMULATION OUTCOMES (2,500 HARVEST PROFILES)                            │
├──────────────────────────────────┬─────────────────┬─────────────────┬─────────────────┬───────────────┤
│ Metric                           │ Policy 1: Local │ Policy 2: Max   │ Policy 3: Ours  │ Net Benefit   │
├──────────────────────────────────┼─────────────────┼─────────────────┼─────────────────┼───────────────┤
│ Mean Net Realization (R_net)     │ ₹84,250         │ ₹87,790         │ ₹96,720         │ +14.8% vs. P1 │
│ Average Freight Incurred         │ ₹1,420          │ ₹5,860          │ ₹2,840          │ -51.5% vs. P2 │
│ Loss Incidence vs. Local Base    │ 0.0% (Baseline) │ 26.4% (660 tr.) │ 0.0% (0 trials) │ Losses Cleared│
├──────────────────────────────────┴─────────────────┴─────────────────┴─────────────────┴───────────────┤
│ AgriMarket AI Decision Allocation:                                                                     │
│ • Sell Now (S_now)      : 58.2% (1,455 trials) — Local APMC price is already optimal                   │
│ • Store Later (S_store) : 24.6% (615 trials)   — 3–7 day price trajectory offsets warehouse fees       │
│ • Alternate Mandi (S_alt): 17.2% (430 trials)   — Distant price premium convincingly outweighs freight  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ System Architecture & Technology Stack

```
                                    [ Rural Smallholder / User ]
                                                 │
                                                 ▼
                              ┌──────────────────────────────────────┐
                              │        Frontend: Vercel Cloud        │
                              │   React 19 + Vite (SPA / PWA)        │
                              │   Tailwind Token Utility CSS         │
                              │   Bilingual Engine (English / हिंदी) │
                              │   https://agrimarket-gold.vercel.app │
                              └──────────────────┬───────────────────┘
                                                 │  HTTPS REST (<15ms)
                                                 ▼
                              ┌──────────────────────────────────────┐
                              │        Backend: Render Cloud         │
                              │      Python 3.11 + Django 5.0 DRF    │
                              │      scikit-learn + NumPy Engine     │
                              │      In-Memory Data Engine Cache     │
                              └──────────┬───────────────────┬───────┘
                                         │                   │
                      PyMongo Driver     │                   │  Automated 12-Hour Sync
                                         ▼                   ▼
         ┌─────────────────────────────────┐   ┌────────────────────────────────┐
         │     MongoDB Atlas (Cloud M0)    │   │    Government Mandi Portal     │
         │     - Produce Lots & Inventory  │   │    - data.gov.in / AGMARKNET   │
         │     - Buyer Bids & Grievances   │   │    - 141,247+ Dataset.csv      │
         └─────────────────────────────────┘   └────────────────────────────────┘
```

### Full-Stack Components
* **Frontend**: React 19, Vite, Progressive Web App (PWA) manifest, Service Workers, Utility CSS.
* **Backend**: Python 3.11, Django 5.0, Django REST Framework (DRF), django-cors-headers.
* **Machine Learning**: scikit-learn 1.5, NumPy, pandas, Matplotlib, Seaborn.
* **Database & Persistence**: MongoDB Atlas (M0 Free Tier) via PyMongo; in-memory CSV cache with lazy-loaded metadata.
* **Cloud Infrastructure**: Vercel (Global Edge CDN for frontend), Render (Serverless Linux PaaS for API).
* **CI/CD & Automation**: GitHub Actions 12-hour cron workflow with pip caching and keepalive commits.

---

## 🖥️ UI Modules & Features

The user interface is designed with high contrast, large touch targets, and zero jargon:

### 1. 🌾 About / Overview Tab (`AboutTab.jsx`)
* **Real-Time National Counter**: Displays live records dynamically fetched from `/api/health/` (e.g., **1.4L+ Mandi Records**).
* **Before vs. After Comparison**: Contrasts traditional middleman reliance with data-backed net realization optimization.
* **Core Benefit Grid**: Real net profit, 7-day outlook, ranked mandis, and sell vs. wait decision trees.

### 2. 📈 Selling Plan Tab (`SellingPlanTab.jsx`)
* **Hero Recommendation Banner**: Immediate display of the highest-profit mandi, expected net rupees, and confidence badge.
* **Sell Now vs. Store Later Grid**: Visual comparison cards contrasting immediate local sale, multi-day storage arbitrage, and alternate regional yards.
* **100+ Dynamic Crop Catalog**: Dropdown populated live from `Dataset.csv` arrivals rather than static lists.
* **Cost Factor Controls**: Sliders and number inputs for crop quality (Grade A to C), transport freight rate (₹/km), and storage days/fees.
* **One-Click WhatsApp Dispatch**: Generates clean advisory text linking to `https://agrimarket-gold.vercel.app`.

### 3. 🏪 Markets Tab (`MarketsTab.jsx`)
* **Cascading Hierarchical Filter**: State &rarr; District &rarr; Mandi &rarr; Commodity &rarr; Variety &rarr; Grade.
* **Four Enhanced Market Charts**:
  - **Price Range Chart**: Horizontal range bar per market with modal price dot, net-earn tick, and best-market benchmark dashed line.
  - **Earnings Compare Chart**: Explicit cards showing modal price vs. net take-home, with transparent cost-deduction explanations.
  - **Market Volume Chart**: Radial price bubble with supply share bar and automated oversupply alerts.
  - **Net Realization Ranking**: Horizontal bar chart ordering mandis strictly by take-home revenue.

### 4. ❓ Help & User Manual Tab (`HelpTab.jsx`)
* **Bilingual FAQ**: Common farmer queries regarding quality assaying, transport estimations, and dispute resolution.
* **Operational Health Monitor**: Live latency probe verifying backend connectivity and database health.

---

## 🔌 API Endpoints Reference

Base URL: `https://agrimarket-backend-nx69.onrender.com/api`

| Method | Endpoint | Description | Request / Query Parameters |
|---|---|---|---|
| `GET` | `/health/` | Service health, MongoDB status, and live dataset row count | None |
| `GET` | `/locations/` | Hierarchical mapping of states and districts | None |
| `GET` | `/markets/` | Filtered list of live mandis and arrival prices | `?state=Karnataka&district=Kolar&commodity=Tomato` |
| `POST` | `/recommendations/` | Computes ranked net-profit selling plan | `{"commodity": "Tomato", "state": "Karnataka", "quantity_kg": 5000, "transport_rate_per_km": 38, "storage_days": 0}` |
| `GET` | `/forecasts/` | 7-day price forecasting trajectory | `?commodity=Tomato` |
| `GET` | `/forecast/metadata/` | Available crops (100+), grades, and districts | None |
| `GET` | `/forecast/conditioned/` | Targeted prediction for specific mandi and variety | `?commodity=Onion&market=Lasalgaon Market` |
| `GET` / `POST` | `/lots/` | Retrieve and record farmer produce lots | `{"commodity": "Paddy", "quantity_kg": 3000, "expected_price": 2200}` |
| `GET` / `POST` | `/offers/` | Retrieve and submit buyer bids | `{"lot_id": "...", "bid_price": 2250}` |

---

## 📁 Repository Organization

```text
Agrimarket/
├── backend/                        # Django REST Microservice
│   ├── config/                     # Django project settings & ASGI/WSGI
│   ├── market_api/                 # API app: endpoints, serializers, services
│   │   ├── market_data.py          # Data ingestion, normalization, fallback cache
│   │   ├── services.py             # Net realization optimizer & price forecasting
│   │   ├── views.py                # DRF REST view handlers
│   │   ├── urls.py                 # Endpoint routing table
│   │   └── tests.py                # Automated backend test suite (14 tests)
│   ├── Dockerfile                  # Production container definition
│   ├── requirements.txt            # Python dependencies (scikit-learn, django, pymongo)
│   └── manage.py                   # Django CLI utility
│
├── frontend/                       # React 19 Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/             # Charts.jsx (Price Range, Volume, Net Ranking)
│   │   │   ├── common/             # Icons, Toast, StatCard, ConfBar
│   │   │   └── tabs/               # AboutTab, SellingPlanTab, MarketsTab, HelpTab
│   │   ├── constants/              # marketData.js, translations.js, config.js
│   │   ├── utils/                  # formatters.js, share.js (WhatsApp dispatch)
│   │   ├── hooks/                  # useApi.js
│   │   ├── App.jsx                 # Central application state & tab orchestration
│   │   └── main.jsx                # Application root mount
│   ├── Dockerfile                  # Multi-stage production build (node -> nginx)
│   └── package.json                # Frontend dependencies
│
├── data_engine/                    # Mandi Data Engine
│   ├── Dataset.csv                 # 141,247+ verified APMC mandi records
│   └── fetch_daily_market_data.py  # Ingestion script with WAF fallback & deduplication
│
├── ml/                             # Machine Learning Analytics
│   ├── ml_models.py                # Complete scikit-learn training & evaluation engine
│   └── correlation_heatmap.png     # Saved Pearson correlation visualization
│
├── .github/workflows/
│   └── fetch-market-data.yml       # 12-hour automated ingestion CI/CD pipeline
│
├── docker-compose.yml              # Local MongoDB & service orchestration
├── PROJECT_OVERVIEW.md             # Detailed architectural specification
└── README.md                       # Repository overview & setup guide
```

---

## ⏰ Automated Ingestion & Failover Architecture

Market arrival data is kept perpetually synchronized via GitHub Actions:
* **Workflow**: `.github/workflows/fetch-market-data.yml`
* **Trigger**: Scheduled every 12 hours (`17 6,18 * * *` UTC) and on manual dispatch.
* **Process**:
  1. Sets up Python 3.11 with pip caching.
  2. Runs `data_engine/fetch_daily_market_data.py --max-records 5000`.
  3. Merges incoming records into `Dataset.csv` using unique composite keys (`State + District + Market + Commodity + Variety + Grade + Date`).
  4. If upstream servers are reachable, commits updated data with row counts.
  5. If upstream government servers trigger firewall/geo-blocks, generates a keepalive commit (`.github/keepalive/last_run.txt`) ensuring GitHub never terminates the cron schedule due to inactivity.

---

## 🔮 Future Roadmap

1. **Regional Dialect Voice Assistants**: Integration of multilingual Automatic Speech Recognition (ASR) tuned to rural Bhojpuri, Marathi, and Punjabi dialects for voice-directed selling plans.
2. **Satellite Remote Sensing Integration**: Ingestion of Sentinel-2 Normalized Difference Vegetation Index (NDVI) time-series data to forecast localized arrival volumes before harvesting begins.
3. **FPO Lot Aggregation & Direct Dispatch**: Collaborative lot-pooling allowing marginal farmers within the same village to aggregate loads and secure institutional bulk transport rates.

---

## 📄 License & Intellectual Property

Distributed under the **MIT License**. Free for academic, non-commercial, and open-source public use.

---

<div align="center">

**AgriMarket AI** — *Empowering Indian Agriculture through Transparent Data Science and Net Realization Economics.* 🌾🇮🇳

</div>
