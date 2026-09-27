# Product Requirements

## Vision

AgriMarket AI is an intelligence layer over agricultural market data. It should answer:

> Where, when, and to whom should a farmer sell produce to maximize expected net realization?

The product is decision support. Forecasts and recommendations are estimates, not guaranteed prices.

## Problem

Farmers often lack a practical comparison of current prices, price trends, arrival volumes, transport costs, storage costs, buyer demand, quality requirements, and buyer reliability. Buyers have the opposite problem: finding suitable, consistent, and verifiable farmer or FPO lots.

## Users

- **Farmer:** compares markets, creates lots, reviews recommendations, receives offers, and tracks sales.
- **FPO:** aggregates farmer lots, manages pooled inventory, and negotiates with bulk buyers.
- **Buyer:** publishes requirements, discovers lots, submits offers, and tracks delivery.
- **Administrator:** manages users, data sources, markets, disputes, and platform analytics.

## Core features

1. Market price discovery: modal, minimum, maximum, arrivals, trends, and comparisons.
2. Price forecasting: 1-day, 3-day, and 7-day estimates with evaluation metrics.
3. Selling decision engine: sell now, store and sell later, alternate market, or matched buyer.
4. Market ranking: rank expected net realization after logistics and storage costs.
5. Lot creation: commodity, quantity, quality, origin, availability, and asking price.
6. Buyer matching: match commodity, quantity, quality, location, delivery, price, and trust.
7. FPO aggregation: combine small lots into buyer-ready pools.
8. Storage and transport intelligence: estimate cost and suitability.
9. Offers and negotiation: accept, reject, counter, and track offers.
10. Verification and trust: distinguish verified information from user claims.
11. Transactions and grievances: track delivery, payment, disputes, and resolution.
12. Analytics: commodity, market, buyer, transaction, and impact metrics.

## Recommendation calculation

The central calculation is:

```text
Expected revenue
- transport cost
- storage cost
- other estimated costs
= expected net realization
```

The UI should display the assumptions behind every recommendation so users can review the reasoning.

## Non-functional requirements

- Mobile-first and usable by people with varied digital literacy
- Clear language and localized terminology
- Role-based access control
- Auditable recommendations and transactions
- Documented data provenance
- Graceful behavior when live data or the API is unavailable
- Responsive interfaces for farmer, buyer, FPO, and administrator workflows

## MVP acceptance slice

The current repository demonstrates the farmer decision slice: enter commodity, quantity, and quality; compare demo markets; calculate ranked net realization; inspect buyer matches; view offers; and inspect the buyer-market network. Authentication, live data, payment, and complete transaction workflows are intentionally outside the current MVP boundary.
