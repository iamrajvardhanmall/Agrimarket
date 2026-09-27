# Machine Learning

## Intelligence modules

1. **Price forecasting:** estimate future modal prices for a commodity and market.
2. **Demand prediction:** estimate buyer or market demand by commodity, quality, quantity, and time.
3. **Market classification:** classify conditions as high, medium, or low opportunity.
4. **Market clustering:** identify market groups such as high-price/high-demand or high-arrival/low-price.
5. **Buyer matching:** score lot and requirement compatibility with trust and fulfillment history.

## Current baseline

`ml/price_forecasting/baseline.py` provides a dependency-free moving-average forecast for 1-day, 3-day, and 7-day horizons. It is a development baseline, not a production model.

The current recommendation endpoint ranks markets using price, distance, demand, transport rate, and storage assumptions. It does not yet call the forecasting baseline, so forecast-driven sale-window recommendations remain a planned integration.

## Candidate features

- Commodity and variety
- Market, state, and district
- Date, month, season, and holidays
- Historical modal, minimum, and maximum prices
- Arrival quantity
- Price volatility and market spread
- Weather and geography
- Buyer demand and quality requirements
- Transport and storage costs

## Model evaluation

Regression:

- MAE
- RMSE
- R-squared

Classification:

- Accuracy
- Precision
- Recall
- F1 score
- Confusion matrix

Evaluation must use time-aware validation to avoid leaking future prices into training data.

## Recommended model path

1. Establish a reproducible moving-average baseline.
2. Build a Spark MLlib/PySpark ML feature pipeline.
3. Compare linear regression, tree-based regression, and other suitable models.
4. Track metrics by commodity, market, and forecast horizon.
5. Store model version, training data window, features, and metrics.
6. Expose predictions with confidence and freshness metadata.
7. Monitor drift and retrain on a documented schedule.

Recommendations must show uncertainty and assumptions. They should never be presented as guaranteed prices.

## Reproducibility requirement

Every trained model or forecast artifact should record its input window, commodity, market, feature version, evaluation split, metrics, and generation timestamp. Until that metadata exists, the moving-average result should be treated as an exploratory signal only.
