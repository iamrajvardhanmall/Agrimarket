# 🌾 AgriMarket AI

### AI-Powered Agricultural Market Intelligence, Price Discovery & Farmer–Buyer Linkage Platform

> **SIH 2026 — Problem Statement SIH26132**
> **Strengthening Market Linkages and Price Discovery for Farmers**
> **Theme:** Agriculture, FoodTech & Rural Development
> **Organization:** Government of Maharashtra
> **Category:** Software

---

## 📌 Overview

**AgriMarket AI** is an end-to-end **AI-powered agricultural market intelligence and transaction-enablement platform** designed to help farmers and Farmer Producer Organisations (FPOs) make better selling decisions.

The platform combines:

* 📊 Agricultural market data
* 🤖 Machine Learning
* ⚡ Big Data processing
* 🔄 Real-time data pipelines
* 📈 Price forecasting
* 🏪 Market comparison
* 👨‍🌾 Farmer–buyer matching
* 🚚 Logistics intelligence
* 🏬 Storage-cost analysis
* 🔐 Buyer verification
* 💰 Digital offers and transaction tracking
* 📱 Farmer-friendly web interfaces

The system analyzes historical and current market information to answer a practical question:

> **"Where, when, and to whom should a farmer sell their produce to maximize expected net realization?"**

The solution is designed around the requirements of **SIH26132**, which calls for aggregation of mandi prices, buyer demand, quality requirements, arrival volumes, transport/storage options, localized price trends, sale-window recommendations, verified buyer matching, lot creation, digital offers, logistics coordination, payment tracking, and grievance handling.

---

# 🎯 Problem Statement

Small and marginal farmers often have limited visibility into:

* Current prices across nearby markets
* Expected price trends
* Buyer demand
* Quality requirements
* Market arrivals
* Transportation costs
* Storage availability
* Buyer reliability
* Alternative selling opportunities

As a result, farmers may make selling decisions based primarily on the nearest available market or immediate liquidity requirements.

At the same time, buyers and processors face difficulties in:

* Discovering suitable farmer lots
* Finding consistent quantities
* Verifying quality
* Finding reliable suppliers
* Coordinating logistics
* Tracking transactions

The SIH problem statement identifies this fragmented market information and weak farm-to-buyer linkage as the core challenge.

---

# 💡 Our Solution

AgriMarket AI creates a unified intelligence layer over agricultural market data.

Instead of simply displaying:

> "Tomato price = ₹2,800/quintal"

the system answers:

> "Given your crop, quantity, location, quality, transport cost, storage cost, current market prices and predicted price trend, which market/buyer provides the highest expected net realization?"

### Example

A farmer enters:

```text
Crop:          Tomato
Quantity:      5,000 kg
Location:      Nashik
Quality:       Grade A
Harvest Date:  20 September
```

The system analyzes:

```text
Historical Prices
       +
Current Mandi Prices
       +
Market Arrivals
       +
Price Trends
       +
Buyer Demand
       +
Transport Cost
       +
Storage Cost
       +
Market Distance
```

and produces:

```text
┌─────────────────────────────────────────┐
│          AI MARKET RECOMMENDATION       │
├─────────────────────────────────────────┤
│ Best Market: Market A                   │
│                                         │
│ Expected Price: ₹2,850 / quintal        │
│ Transport Cost: ₹4,200                  │
│ Storage Cost: ₹1,500                    │
│ Expected Net Realization: ₹138,300      │
│                                         │
│ Recommended Selling Window:             │
│ 22–24 September                         │
│                                         │
│ Confidence: 82%                         │
└─────────────────────────────────────────┘
```

The recommendation is a **decision-support estimate**, not a guaranteed future price.

---

# 🚀 Core Features

## 1. 📊 AI Price Discovery

Compare commodity prices across markets.

### Features

* Current modal price
* Minimum price
* Maximum price
* Historical price trend
* Market-to-market comparison
* Commodity-wise analysis
* State/district/market filtering
* Price volatility analysis

---

# 2. 🤖 Price Forecasting

Use Machine Learning to estimate future market prices.

### Input Features

```text
Commodity
Market
State
District
Date
Season
Month
Historical Price
Arrival Quantity
Market Trend
Price Volatility
```

### Output

```text
Current Price
        ↓
ML Forecast
        ↓
1-Day Forecast
3-Day Forecast
7-Day Forecast
```

### Evaluation Metrics

* MAE
* RMSE
* R²

These metrics also align directly with the INT315 Spark ML syllabus.

---

# 3. 🧠 Smart Selling Decision Engine

The core intelligence layer calculates expected net realization.

### Concept

```text
Expected Revenue
        -
Transportation Cost
        -
Storage Cost
        -
Other Estimated Costs
        =
Expected Net Realization
```

The system compares:

### Option A

```text
Sell Now
```

### Option B

```text
Store → Sell Later
```

### Option C

```text
Sell to Alternative Market
```

### Option D

```text
Sell to Matched Buyer
```

The system presents the assumptions behind the recommendation so the user can understand how the result was calculated.

---

# 4. 🏪 Market Recommendation

Instead of simply recommending the market with the highest price, AgriMarket AI considers:

* Price
* Distance
* Transport cost
* Storage cost
* Expected demand
* Arrival volume
* Price trend
* Quality suitability

Example:

```text
Market A
Price = ₹3,000
Transport = ₹8,000
Net = ₹142,000

Market B
Price = ₹2,850
Transport = ₹3,000
Net = ₹139,500
```

The platform can therefore compare **net realization**, rather than price alone.

---

# 5. 👨‍🌾 Farmer / FPO Lot Creation

Farmers and FPOs can create produce lots.

```text
Lot ID:       AGRI-10245
Commodity:    Wheat
Quantity:     20 tonnes
Quality:      Grade A
Location:     Punjab
Available:    25 September
Expected Price: ₹2,600/quintal
```

The lot becomes discoverable to eligible buyers.

---

# 6. 🏢 Buyer Matching

Buyers can publish requirements:

```text
Commodity: Wheat
Quantity: 10–30 tonnes
Quality: Grade A
Location: Punjab
Delivery: Within 7 days
```

The matching engine calculates compatibility.

```text
Buyer A → 94% Match
Buyer B → 87% Match
Buyer C → 74% Match
```

Matching factors can include:

* Commodity
* Quantity
* Quality
* Location
* Price
* Delivery requirements
* Buyer reliability
* Historical transaction behavior

---

# 7. 🤝 FPO Aggregation

Small farmer lots can be aggregated.

```text
Farmer A → 4 tonnes
Farmer B → 7 tonnes
Farmer C → 9 tonnes
                 ↓
            FPO Pool
                 ↓
             20 tonnes
                 ↓
          Bulk Buyer
```

This helps address the problem of inconsistent quantities faced by buyers.

---

# 8. 🏬 Storage Intelligence

The platform can maintain storage-facility information.

Example:

```text
Storage Facility A
Distance: 12 km
Capacity: 500 tonnes
Cost: ₹X / tonne / day
Commodity: Compatible

Storage Facility B
Distance: 31 km
Capacity: 1,000 tonnes
Cost: ₹Y / tonne / day
Commodity: Compatible
```

Storage cost becomes an input to the Smart Selling Decision Engine.

---

# 9. 🚚 Transportation Intelligence

Estimate transportation cost using:

```text
Farm Location
Market Location
Distance
Vehicle Type
Quantity
Transport Rate
```

Example:

```text
Distance: 72 km
Quantity: 5 tonnes
Vehicle: Truck

Estimated Transport Cost:
₹X,XXX
```

---

# 10. 💰 Digital Offers

Buyers can submit offers for farmer lots.

```text
Lot #10245
────────────────────
Farmer Asking Price: ₹2,600

Buyer A Offer: ₹2,720
Buyer B Offer: ₹2,680
Buyer C Offer: ₹2,750

Best Current Offer:
₹2,750
```

Farmers/FPOs can:

* Accept
* Reject
* Negotiate
* Counter-offer

---

# 11. 🔐 Buyer Verification & Trust

Buyer profiles can contain:

```text
✓ Identity Verified
✓ Business Verified
✓ Contact Verified
✓ Payment History
✓ Transaction History
✓ Completed Orders
✓ Dispute History
```

The platform should distinguish **verified information** from user-provided claims.

---

# 12. 📦 Transaction Tracking

Transaction lifecycle:

```text
LOT CREATED
     ↓
BUYER MATCHED
     ↓
OFFER RECEIVED
     ↓
OFFER ACCEPTED
     ↓
LOGISTICS PLANNED
     ↓
PRODUCE DISPATCHED
     ↓
DELIVERED
     ↓
PAYMENT CONFIRMED
     ↓
COMPLETED
```

---

# 13. ⚖️ Grievance Management

Users can raise disputes related to:

* Payment
* Quantity
* Quality
* Delivery
* Buyer behavior
* Seller behavior
* Logistics

Admin dashboard:

```text
Open Complaints
Pending Review
Resolved
Escalated
```

This addresses the grievance-support component described in the SIH statement.

---

# 14. 📈 Market Analytics Dashboard

Admin/FPO users can analyze:

```text
Commodity Trends
Market Trends
Price Volatility
Arrival Volumes
Demand
Regional Price Differences
Buyer Activity
Transaction Volume
```

---

# 🧠 Machine Learning Architecture

AgriMarket AI contains multiple intelligence modules.

```text
                 AGRICULTURAL DATA
                         │
                         ▼
                DATA PREPROCESSING
                         │
                         ▼
                 FEATURE ENGINEERING
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    PRICE FORECAST   DEMAND MODEL   MARKET MODEL
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                 DECISION ENGINE
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       MARKET RANKING          SELLING WINDOW
              │                     │
              └──────────┬──────────┘
                         ▼
                FARMER RECOMMENDATION
```

---

# 📊 ML Models

## Price Prediction

Potential models:

* Linear Regression
* Decision Tree Regression
* Additional models can be evaluated during development

Metrics:

```text
MAE
RMSE
R²
```

---

## Market Classification

Classify market conditions:

```text
High Opportunity
Medium Opportunity
Low Opportunity
```

Potential models:

* Logistic Regression
* Decision Tree
* SVM
* Naive Bayes

---

## Market Clustering

Use K-Means to identify market groups:

```text
Cluster 1 → High Price / High Demand
Cluster 2 → Moderate Price / High Volume
Cluster 3 → Low Price / High Arrival
```

This can help identify different market behavior patterns.

---

# ⚡ Big Data Architecture

The system is designed to scale beyond a small CSV dataset.

```text
                 DATA SOURCES
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
   Mandi Data     Buyer Data     Market Data
       │              │              │
       └──────────────┼──────────────┘
                      ▼
               DATA INGESTION
                      │
                      ▼
                    KAFKA
                      │
             ┌────────┴────────┐
             ▼                 ▼
       Batch Processing   Stream Processing
             │                 │
             ▼                 ▼
           SPARK        SPARK STREAMING
             │                 │
             └────────┬────────┘
                      ▼
               DATA PROCESSING
                      │
            ┌─────────┼─────────┐
            ▼         ▼         ▼
        Spark SQL   PySpark   Matplotlib
            │         │         │
            └─────────┼─────────┘
                      ▼
                  ML ENGINE
                      │
                      ▼
                DECISION ENGINE
                      │
                      ▼
                DJANGO REST API
                      │
                      ▼
                 REACT FRONTEND
```

---

# 🔄 Kafka & Real-Time Processing

No physical IoT device is required.

Market data can be obtained from available datasets/APIs and converted into streaming events.

```text
Market Dataset / API
         ↓
  Python Kafka Producer
         ↓
     Kafka Topic
         ↓
  Spark Streaming
         ↓
   Data Processing
         ↓
  ML / Analytics
         ↓
    Django API
         ↓
 React Dashboard
```

Example Kafka event:

```json
{
  "market": "Nashik APMC",
  "commodity": "Tomato",
  "modal_price": 2850,
  "arrival_quantity": 4210,
  "timestamp": "2026-09-18T10:30:00"
}
```

The system can replay historical records as a simulated stream for demonstration purposes.

---

# 🗄️ Data Sources

The primary data foundation can use public agricultural-market data.

The Government of India's Open Government Data platform provides a **Current Daily Price of Various Commodities from Various Markets (Mandi)** dataset. It is daily-granularity data sourced through the Department of Agriculture and Farmers Welfare / Directorate of Marketing and Inspection, and the resource was updated in September 2026.

Potential data categories:

```text
Mandi Prices
Market Arrivals
Commodity
Variety
State
District
APMC
Date
Minimum Price
Maximum Price
Modal Price
```

Additional datasets/APIs can be incorporated for:

* Weather
* Market geography
* Road distance
* Storage facilities
* Transport rates
* Buyer information
* Commodity characteristics

**Important:** SIH26132 itself does not publish a dedicated dataset link in the problem-statement record, so every external data source used in the implementation should be documented with its provenance and access method.

---

# � Data Visualization and Analysis

The platform can visualize agricultural market trends in a simple, business-friendly way using Python plotting libraries.

```text
Market prices
      ↓
  Matplotlib charts
      ↓
  Seaborn visuals
      ↓
  Trend comparison
      ↓
  Selling decision support
```

### Common analysis views

* Commodity price trends over time
* Market-to-market comparison of modal price
* Arrival and demand changes by market
* Forecast comparison against observed values
* Distribution of price range and volatility

### Suggested visualization stack

* Matplotlib for static line charts and bar charts
* Seaborn for cleaner exploratory market plots

These visual tools help farmers and stakeholders understand patterns without depending on graph-based network analytics.

---

# 🏗️ Full-Stack Architecture

## Frontend

**React.js**

Responsibilities:

* Farmer dashboard
* Buyer dashboard
* Admin dashboard
* Market charts
* Price trends
* Recommendations
* Lot management
* Offers
* Transactions
* Grievances

---

## Backend

**Django + Django REST Framework**

Responsibilities:

* Authentication
* Authorization
* User management
* Farmer/FPO management
* Buyer management
* Market APIs
* Lot management
* Offer management
* Transaction management
* ML API integration
* Notifications
* Grievance management

---

## Database

**PostgreSQL**

Suggested entities:

```text
User
Farmer
FPO
Buyer
Commodity
Market
MarketPrice
MarketArrival
Lot
QualityGrade
BuyerRequirement
Offer
TransportOption
StorageFacility
Transaction
Payment
Grievance
Prediction
Recommendation
```

---

# 📁 Proposed Project Structure

```text
agrimarket-ai/
│
├── README.md
│
├── frontend/
│   └── react-app/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── layouts/
│       │   ├── services/
│       │   ├── hooks/
│       │   ├── charts/
│       │   └── utils/
│       └── package.json
│
├── backend/
│   ├── manage.py
│   ├── config/
│   ├── apps/
│   │   ├── users/
│   │   ├── farmers/
│   │   ├── buyers/
│   │   ├── markets/
│   │   ├── lots/
│   │   ├── offers/
│   │   ├── transactions/
│   │   ├── grievances/
│   │   └── analytics/
│   └── requirements.txt
│
├── data-engine/
│   ├── ingestion/
│   ├── preprocessing/
│   ├── feature_engineering/
│   ├── spark_sql/
│   ├── rdd/
│   └── pyspark/
│
├── ml/
│   ├── price_forecasting/
│   ├── demand_prediction/
│   ├── market_classification/
│   ├── market_clustering/
│   ├── evaluation/
│   └── models/
│
├── streaming/
│   ├── producers/
│   ├── consumers/
│   ├── kafka/
│   └── spark_streaming/
│
├── graph/
│   └── visualization/
│
├── datasets/
│   ├── raw/
│   ├── processed/
│   └── sample/
│
├── notebooks/
│   ├── eda/
│   ├── feature_analysis/
│   └── model_experiments/
│
├── infrastructure/
│   ├── docker/
│   └── deployment/
│
└── docs/
    ├── architecture/
    ├── api/
    ├── ml/
    └── diagrams/
```

---

# 🔐 Security

Security is a core part of the platform.

### Authentication

* JWT authentication
* Role-based access control

### Roles

```text
FARMER
FPO
BUYER
ADMIN
```

### Security controls

* Password hashing
* API authorization
* Input validation
* Rate limiting
* Audit logging
* Secure file upload
* Transaction authorization
* Sensitive-data protection

---

# 📱 User Experience

The platform should support users with different levels of digital literacy.

### Farmer-first design

* Simple navigation
* Large actionable buttons
* Localized terminology
* Mobile-first interface
* Visual price comparison
* Simple recommendations
* Minimal technical jargon

Potential language support:

```text
English
Hindi
Marathi
Punjabi
```

Language support should be implemented based on the target deployment requirements rather than assumed to be available in every region.

---

# 📊 Example Farmer Workflow

```text
1. Farmer Login
       ↓
2. Select Crop
       ↓
3. Enter Quantity & Quality
       ↓
4. View Current Market Prices
       ↓
5. Compare Nearby Markets
       ↓
6. View Price Forecast
       ↓
7. Calculate Transport & Storage
       ↓
8. Receive Market Recommendation
       ↓
9. View Matched Buyers
       ↓
10. Create Lot
       ↓
11. Receive Offers
       ↓
12. Accept / Negotiate
       ↓
13. Arrange Logistics
       ↓
14. Track Transaction
       ↓
15. Confirm Payment
```

---

# 🏢 Buyer Workflow

```text
1. Buyer Registration
       ↓
2. Verification
       ↓
3. Publish Requirement
       ↓
4. Discover Farmer/FPO Lots
       ↓
5. Filter by Quality/Quantity/Location
       ↓
6. Submit Offer
       ↓
7. Negotiate
       ↓
8. Confirm Order
       ↓
9. Arrange Logistics
       ↓
10. Track Delivery
       ↓
11. Complete Payment
```

---

# 📊 Admin Workflow

```text
Admin Dashboard
      │
      ├── Users
      ├── Buyers
      ├── FPOs
      ├── Markets
      ├── Data Sources
      ├── Price Feeds
      ├── Transactions
      ├── Payments
      ├── Grievances
      └── Analytics
```

---

# 🧪 Model Evaluation

## Regression

For price prediction:

```text
MAE
RMSE
R²
```

Example evaluation table:

| Model             | MAE | RMSE | R² |
| ----------------- | --: | ---: | -: |
| Linear Regression |   — |    — |  — |
| Decision Tree     |   — |    — |  — |
| Model X           |   — |    — |  — |

Actual values should be filled using the project's validation results.

---

## Classification

Evaluate using:

```text
Confusion Matrix
Accuracy
Precision
Recall
F1-Score
```

Example:

```text
                 Predicted
              Positive Negative

Actual Positive    TP       FN
Actual Negative    FP       TN
```

---

# 📈 Key Performance Indicators

The platform can track:

### Farmer-level

* Expected price improvement
* Net realization
* Transport savings
* Storage savings
* Time to sell
* Buyer response rate

### Market-level

* Price volatility
* Arrival volume
* Demand
* Market spread
* Commodity trends

### Platform-level

* Active farmers
* Active FPOs
* Verified buyers
* Listed lots
* Offers
* Completed transactions
* Transaction value
* Grievances resolved

These are **proposed system KPIs**, not claims of achieved impact until measured using actual deployment/pilot data.

---

# 🎯 Expected Impact

The SIH problem statement identifies the intended outcomes as:

* Improved farmer price realization
* Reduced information asymmetry
* Lower transaction costs
* Stronger FPO aggregation
* Reduced post-harvest loss
* More reliable buyer sourcing
* Transparent transaction records

AgriMarket AI addresses these through:

```text
Better Data
     ↓
Better Analysis
     ↓
Better Prediction
     ↓
Better Market Discovery
     ↓
Better Selling Decisions
     ↓
More Transparent Transactions
```

---

# 🆚 Differentiation

India already has digital agricultural-market infrastructure. For example, e-NAM provides electronic trading and market integration, and the Government reported 1.89 crore registered farmers and 2.78 lakh registered traders on e-NAM as of June 30, 2026.

Therefore, AgriMarket AI should **not** position itself simply as another marketplace.

### Our differentiation

| Existing digital market function | AgriMarket AI intelligence layer         |
| -------------------------------- | ---------------------------------------- |
| Display prices                   | Forecast price trends                    |
| Display markets                  | Rank markets by expected net realization |
| List buyers                      | Match buyers to farmer lots              |
| Show market information          | Combine price + logistics + storage      |
| Digital trading                  | Explain selling alternatives             |
| Transaction records              | Analytics and decision support           |
| Historical data                  | ML-based forecasting                     |
| Market data                      | Distributed big-data processing          |

The objective is to create an **AI decision-support layer**, rather than duplicate an existing marketplace.

---

# 🔬 Research & Innovation Areas

Potential research contributions include:

### 1. Net Realization Prediction

Instead of predicting price alone:

```text
Net Realization =
Expected Revenue
- Transport
- Storage
- Transaction Costs
```

### 2. Market Ranking

Rank markets based on multiple measurable factors.

### 3. Sale-Window Intelligence

Estimate potential selling windows from historical market behavior.

### 4. FPO Aggregation

Automatically identify compatible farmer lots.

### 5. Explainable Recommendations

Every recommendation should show:

```text
Why this market?
Why this buyer?
Why this time?
What assumptions were used?
```

This is particularly important for farmer-facing AI.

---

# 🧱 Technology Stack

## Frontend

* React.js
* Tailwind CSS
* JavaScript
* Plotly
* Map-based visualization

## Backend

* Python
* Django
* Django REST Framework

## Data Engineering

* Apache Spark
* PySpark
* Spark SQL
* RDD
* Spark Streaming

## Streaming

* Apache Kafka

## Machine Learning

* Spark MLlib
* PySpark ML
* Scikit-learn for experimentation/comparison where appropriate

## Database

* PostgreSQL

## Visualization

* Matplotlib
* Seaborn

## DevOps

* Docker
* Git
* GitHub

---

# ☁️ Deployment Architecture

```text
                     INTERNET
                         │
                         ▼
                  ┌────────────┐
                  │   NGINX    │
                  └─────┬──────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
        React Frontend       Django Backend
                                    │
                     ┌──────────────┼──────────────┐
                     ▼              ▼              ▼
                PostgreSQL        Kafka          ML Service
                                    │              │
                                    ▼              │
                             Spark Streaming       │
                                    │              │
                                    └──────┬───────┘
                                           ▼
                                     Spark Cluster
```

---

# 🐳 Docker Architecture

Potential containers:

```text
frontend
backend
postgres
kafka
zookeeper / kafka controller
spark-master
spark-worker
ml-service
nginx
```

The exact Kafka deployment topology can be chosen based on the development environment.

---

# 🛣️ Development Roadmap

## Phase 1 — Research

* Understand SIH26132
* Study existing agricultural market systems
* Identify data sources
* Define target users
* Define measurable KPIs

---

## Phase 2 — Data Engineering

* Collect market data
* Clean data
* Handle missing values
* Standardize commodity names
* Standardize market names
* Build geographic mappings
* Store processed data

---

## Phase 3 — Exploratory Data Analysis

Analyze:

* Commodity trends
* Market differences
* Seasonal behavior
* Price volatility
* Arrival-price relationships

---

## Phase 4 — ML

Implement:

```text
Price Forecasting
       ↓
Demand Prediction
       ↓
Market Classification
       ↓
Market Clustering
```

Evaluate models.

---

## Phase 5 — Spark

Move large-scale processing to:

```text
PySpark
Spark SQL
RDD
Spark MLlib
```

---

## Phase 6 — Kafka

Implement:

```text
Producer
   ↓
Kafka Topic
   ↓
Consumer
   ↓
Spark Streaming
```

Use historical market records as simulated real-time events.

---

## Phase 7 — Backend

Develop:

* Authentication
* Farmer APIs
* Buyer APIs
* Market APIs
* Prediction APIs
* Recommendation APIs
* Lot APIs
* Offer APIs
* Transaction APIs
* Grievance APIs

---

## Phase 8 — Frontend

Build:

* Farmer portal
* FPO portal
* Buyer portal
* Admin dashboard
* Market analytics
* Prediction visualization
* Recommendation interface

---

## Phase 9 — Integration

```text
React
  ↓
Django
  ↓
ML + Spark
  ↓
Kafka
  ↓
Database
```

---

## Phase 10 — Testing

### Backend

* Unit tests
* API tests
* Authentication tests

### ML

* Cross-validation
* Model comparison
* Error analysis

### System

* Load testing
* Streaming tests
* Failure handling

### Security

* Authentication
* Authorization
* Input validation
* API security

---

# 🧪 Demo Scenario

For the SIH presentation, demonstrate one complete farmer journey.

### Step 1

Farmer selects:

```text
Commodity: Tomato
Location: Nashik
Quantity: 5,000 kg
Quality: Grade A
```

### Step 2

System displays:

```text
10 Nearby Markets
```

### Step 3

AI analyzes:

```text
Price
Arrival
Demand
Transport
Storage
Forecast
```

### Step 4

System generates:

```text
Top Market
Expected Price
Expected Net Realization
Recommended Selling Window
Matched Buyers
```

### Step 5

Farmer creates a lot.

### Step 6

Buyers submit offers.

### Step 7

Farmer accepts an offer.

### Step 8

System tracks:

```text
Logistics → Delivery → Payment
```

### Step 9

Admin dashboard shows the transaction lifecycle.

---

# 🏆 Why This Project Fits Your Profile

This project combines your major technical areas:

```text
                 AGRIMARKET AI
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   DATA SCIENCE      ML          FULL STACK
        │             │             │
      Pandas       PySpark        React
      NumPy        MLlib          Django
      EDA          Models         REST API
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                  BIG DATA
                      │
             ┌────────┼────────┐
             ▼        ▼        ▼
           Spark    Kafka    Matplotlib
```

It therefore demonstrates:

* Data Science
* Machine Learning
* Big Data
* Distributed Computing
* Data Engineering
* Real-Time Processing
* Backend Engineering
* Frontend Engineering
* Database Engineering
* Data Visualization
* System Architecture
* DevOps

---

# 🔮 Future Scope

Potential future extensions:

* Multilingual voice interface
* WhatsApp/SMS notifications
* Explainable AI recommendations
* Better demand forecasting
* Advanced time-series models
* Geospatial optimization
* More FPO integrations
* Additional market sources
* Digital quality certificates
* Advanced logistics optimization
* Government procurement integration
* Mobile application
* Offline-first farmer interface

---

# ⚠️ Data & AI Disclaimer

AgriMarket AI is a decision-support platform.

Price forecasts and market recommendations are estimates based on available data and model assumptions. They do not guarantee future prices, buyer behavior, or farmer income.

Production deployment should include:

* Data provenance
* Model monitoring
* Forecast confidence
* Human review for important decisions
* Privacy protection
* Secure transaction handling
* Clear explanation of recommendations

---

# 📜 SIH Alignment

**Problem Statement:** SIH26132
**Title:** Strengthening Market Linkages and Price Discovery for Farmers
**Organization:** Government of Maharashtra
**Department:** Maharashtra State Innovation Society
**Category:** Software
**Theme:** Agriculture, FoodTech & Rural Development

The solution architecture is designed to address the problem statement's requested capabilities around market intelligence, price discovery, farmer/FPO–buyer matching, lots, quality, logistics, payments and grievances.

---

# ⭐ Project Vision

> **From price information to intelligent selling decisions.**

AgriMarket AI aims to transform fragmented agricultural market information into an integrated intelligence platform that helps farmers and FPOs make more informed market, timing, buyer and transaction decisions.

---

## 🔗 References

* SIH 2026 — SIH26132 problem statement: [SIH26132 official problem statement record](https://github.com/jeevansai-hub/SIH-2026-/blob/main/ps_2026/SIH26132.md?utm_source=chatgpt.com)
* Government of India Open Government Data — Mandi price dataset: [Current Daily Price of Various Commodities from Various Markets (Mandi)](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi?utm_source=chatgpt.com)
* e-NAM / AGMARKNET market dashboard: [e-NAM AGMARKNET Dashboard](https://www.enam.gov.in/web/dashboard/agmarknet?utm_source=chatgpt.com)
* Government of India agricultural marketing information: [PIB — Strengthening of Agricultural Marketing](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2290633&lang=2&reg=48&utm_source=chatgpt.com)

---

# 📌 Current Repository Status

**🚧 MVP vertical slice in development**

The repository now contains a runnable React dashboard, Django REST API, PostgreSQL domain models with an initial migration, recommendation service tests, a NetworkX graph-analysis module, and an SVG buyer-market graph in the frontend. Demo market, buyer, lot, and offer payloads remain in use in several API views.

```text
[ ] Problem research
[ ] Dataset collection
[ ] Data pipeline
[ ] EDA
[ ] ML models
[ ] Spark processing
[ ] Kafka streaming
[ ] Visualization analysis
[x] Django APIs
[x] React frontend
[x] Recommendation tests
[x] PostgreSQL migration boundary
[x] Buyer-market graph visualization
[ ] Integration
[ ] Testing
[ ] Deployment
[ ] SIH Demo
```

---

## Run the current slice

Use [docs/setup.md](docs/setup.md) for the complete Windows setup. The shortest local verification is:

```powershell
cd backend
python manage.py test
cd ../frontend
npm run build
```

## Made for SIH 2026 🇮🇳

**AgriMarket AI — Turning Agricultural Market Data into Actionable Intelligence.**
