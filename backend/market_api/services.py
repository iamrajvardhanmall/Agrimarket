from __future__ import annotations

import base64
import math
from io import BytesIO
from statistics import mean
from datetime import date, timedelta

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor


SELLING_OPPORTUNITIES = [
    {
        "id": "nashik-direct-auction",
        "name": "Nashik APMC direct auction",
        "commodity": "Onion",
        "quantity_min_kg": 1000,
        "quantity_max_kg": 20000,
        "quality": "Grade A",
        "state": "Maharashtra",
        "district": "Nashik",
        "delivery": "Farmer delivers",
        "price_per_quintal": 2920,
        "trust_score": 92,
        "verified": True,
    },
    {
        "id": "lasalgaon-scheduled-sale",
        "name": "Lasalgaon scheduled sale",
        "commodity": "Onion",
        "quantity_min_kg": 3000,
        "quantity_max_kg": 15000,
        "quality": "Grade A",
        "state": "Maharashtra",
        "district": "Nashik",
        "delivery": "Scheduled pickup",
        "price_per_quintal": 3000,
        "trust_score": 88,
        "verified": True,
    },
    {
        "id": "pune-grain-yard",
        "name": "Pune grain yard",
        "commodity": "Wheat",
        "quantity_min_kg": 1000,
        "quantity_max_kg": 10000,
        "quality": "FAQ",
        "state": "Maharashtra",
        "district": "Pune",
        "delivery": "Farmer delivers",
        "price_per_quintal": 2450,
        "trust_score": 79,
        "verified": False,
    },
]


def discover_selling_opportunities(
    commodity: str | None,
    quantity_kg: float,
    quality: str | None,
    state: str | None,
    district: str | None,
    delivery: str | None = None,
) -> list[dict]:
    if quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than zero")
    opportunities = []
    for opportunity in SELLING_OPPORTUNITIES:
        if commodity and opportunity["commodity"].casefold() != commodity.casefold():
            continue
        if not opportunity["quantity_min_kg"] <= quantity_kg <= opportunity["quantity_max_kg"]:
            continue
        score = 45
        if quality and opportunity["quality"].casefold() == quality.casefold():
            score += 20
        if state and opportunity["state"].casefold() == state.casefold():
            score += 15
        if district and opportunity["district"].casefold() == district.casefold():
            score += 10
        if delivery and opportunity["delivery"].casefold() == delivery.casefold():
            score += 5
        score += round(opportunity["trust_score"] / 20)
        opportunities.append({**opportunity, "match_score": min(score, 100)})
    return sorted(opportunities, key=lambda item: (item["match_score"], item["price_per_quintal"]), reverse=True)


def recommendation_window(today: date | None = None) -> dict[str, str]:
    start = today or date.today()
    end = start + timedelta(days=3)
    return {
        "today": start.isoformat(),
        "window_start": start.isoformat(),
        "window_end": end.isoformat(),
        "window": f"{start.strftime('%d %b')} - {end.strftime('%d %b %Y')}",
    }


def _ml_price_models(markets):
    features = np.array([
        [
            float(market.get("min_price") or market["price"]),
            float(market.get("max_price") or market["price"]),
            float(market.get("arrival_quantity") or market.get("arrival") or 0),
            float(market.get("distance") or 0),
            float(market.get("trend") or 0),
        ]
        for market in markets
    ])
    targets = np.array([float(market["price"]) for market in markets])
    models = (
        LinearRegression(),
        DecisionTreeRegressor(max_depth=8, random_state=42),
    )
    for model in models:
        model.fit(features, targets)
    return models, features


def _ml_price_prediction(models, features):
    predictions = [float(model.predict([features])[0]) for model in models]
    prediction = mean(predictions)
    if not math.isfinite(prediction) or prediction <= 0:
        raise ValueError("ML price prediction was invalid.")
    return round(prediction), predictions


def calculate_recommendation(markets, quantity_kg, transport_rate=38, storage_days=0, storage_rate=4.5):
    """Return ML-ranked markets and ML-selected farmer selling scenarios."""
    if quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than zero")
    if not markets:
        raise ValueError("At least one market is required")

    models, feature_matrix = _ml_price_models(markets)
    options = []
    for market, features in zip(markets, feature_matrix):
        predicted_price, model_predictions = _ml_price_prediction(models, features)
        transport = market["distance"] * transport_rate
        storage = storage_days * storage_rate * quantity_kg
        revenue = predicted_price * quantity_kg / 100
        net = revenue - transport * quantity_kg / 100 - storage
        options.append({
            **market,
            "ml_predicted_price": predicted_price,
            "ml_model_predictions": {
                "linear_regression": round(model_predictions[0], 2),
                "decision_tree": round(model_predictions[1], 2),
            },
            "transport_cost": round(transport * quantity_kg / 100),
            "storage_cost": round(storage),
            "net_realization": round(net),
            "logistics_suitable": market["distance"] <= 100 and storage_days <= 30,
            "logistics_note": (
                "Suitable for the configured route and storage period."
                if market["distance"] <= 100 and storage_days <= 30
                else "Review route distance or storage duration before selling."
            ),
        })

    ranked = [
        {**option, "rank": rank}
        for rank, option in enumerate(
            sorted(options, key=lambda option: option["net_realization"], reverse=True),
            start=1,
        )
    ]
    best = ranked[0]
    alternate = ranked[1] if len(ranked) > 1 else None
    holding_days = max(storage_days, 3)
    stored_features = np.array([
        best.get("min_price") or best["price"],
        best.get("max_price") or best["price"],
        best.get("arrival_quantity") or best.get("arrival") or 0,
        best.get("distance") or 0,
        (best.get("trend") or 0) * holding_days / 7,
    ], dtype=float)
    projected_price, store_predictions = _ml_price_prediction(models, stored_features)
    store_revenue = projected_price * quantity_kg / 100
    store_transport = best["distance"] * transport_rate * quantity_kg / 100
    store_cost = holding_days * storage_rate * quantity_kg
    store_option = {
        "type": "store_and_sell_later",
        "label": "Store and sell later",
        "market": best["name"],
        "price": projected_price,
        "ml_model_predictions": {
            "linear_regression": round(store_predictions[0], 2),
            "decision_tree": round(store_predictions[1], 2),
        },
        "holding_days": holding_days,
        "net_realization": round(store_revenue - store_transport - store_cost),
    }
    scenarios = [
        {
            "type": "sell_now",
            "label": "Sell now",
            "market": best["name"],
            "price": best["ml_predicted_price"],
            "ml_predicted_price": best["ml_predicted_price"],
            "ml_model_predictions": best["ml_model_predictions"],
            "net_realization": best["net_realization"],
        },
        store_option,
    ]
    if alternate:
        scenarios.append({
            "type": "alternate_market",
            "label": "Use alternate market",
            "market": alternate["name"],
            "price": alternate["ml_predicted_price"],
            "ml_predicted_price": alternate["ml_predicted_price"],
            "ml_model_predictions": alternate["ml_model_predictions"],
            "net_realization": alternate["net_realization"],
        })
    recommended_scenario = max(scenarios, key=lambda option: option["net_realization"])

    return {
        "recommendation": {
            "type": recommended_scenario["type"],
            "label": recommended_scenario["label"],
            "market": recommended_scenario["market"],
            **recommendation_window(),
            "confidence": round(max(0, 100 - abs(
                recommended_scenario["ml_model_predictions"]["linear_regression"]
                - recommended_scenario["ml_model_predictions"]["decision_tree"]
            ) / recommended_scenario["price"] * 100)),
            "reason": f"{recommended_scenario['label']} was selected by the ML price ensemble using predicted price and expected net realization.",
            "decision_model": "Linear Regression + Decision Tree Regressor ensemble",
        },
        "options": ranked,
        "ranking": {
            "basis": "expected_net_realization",
            "quantity_kg": quantity_kg,
            "transport_rate": transport_rate,
            "storage_days": storage_days,
            "storage_rate": storage_rate,
            "highest_profit_route": {
                "rank": best["rank"],
                "market": best["name"],
                "net_realization": best["net_realization"],
                "decision_model": "Linear Regression + Decision Tree Regressor ensemble",
            },
        },
        "decision_options": scenarios,
        "decision_model": {
            "algorithms": ["linear_regression", "decision_tree"],
            "target": "predicted_modal_price",
            "features": ["min_price", "max_price", "arrival_quantity", "distance", "trend"],
        },
    }


def _forecast_evaluation(prices: list[float], horizon: int) -> dict[str, float | int]:
    predictions: list[float] = []
    actuals: list[float] = []
    for index in range(horizon, len(prices)):
        predictions.append(mean(prices[max(0, index - horizon):index]))
        actuals.append(prices[index])
    if not actuals:
        return {"mae": 0.0, "rmse": 0.0, "observations": 0}
    errors = [actual - prediction for actual, prediction in zip(actuals, predictions)]
    return {
        "mae": round(mean(abs(error) for error in errors), 2),
        "rmse": round((mean(error ** 2 for error in errors)) ** 0.5, 2),
        "observations": len(actuals),
    }


def _forecast_chart(prices: list[float], forecasts: dict[str, float]) -> str:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import seaborn as sns

    sns.set_theme(style="whitegrid", palette="deep")
    figure, axis = plt.subplots(figsize=(8, 3.5))
    history_days = list(range(1, len(prices) + 1))
    axis.plot(history_days, prices, marker="o", linewidth=2, label="Observed modal price")
    forecast_horizons = sorted(int(key.removesuffix("_day")) for key in forecasts)
    forecast_days = [len(prices) + horizon for horizon in forecast_horizons]
    forecast_values = [forecasts[f"{horizon}_day"] for horizon in forecast_horizons]
    axis.plot(forecast_days, forecast_values, marker="D", linestyle="--", linewidth=2, label="Moving-average forecast")
    axis.set_xlabel("Observation / forecast day")
    axis.set_ylabel("Price per quintal (₹)")
    axis.set_title("Market price forecast")
    axis.legend(loc="best")
    figure.tight_layout()
    output = BytesIO()
    figure.savefig(output, format="png", dpi=140)
    plt.close(figure)
    return f"data:image/png;base64,{base64.b64encode(output.getvalue()).decode('ascii')}"


def forecast_prices(prices: list[float], horizons: tuple[int, ...] = tuple(range(1, 8))) -> dict:
    if not prices:
        raise ValueError("prices must contain at least one value")
    forecasts = {}
    for horizon in horizons:
        sample = prices[-horizon:]
        forecasts[f"{horizon}_day"] = round(mean(sample), 2)
    result = {
        "forecasts": forecasts,
        "method": "moving_average",
        "observations": len(prices),
        "confidence": min(95, round(50 + len(prices) * 2)),
        "evaluation": {
            f"{horizon}_day": _forecast_evaluation(prices, horizon)
            for horizon in horizons
        },
    }
    result["chart"] = _forecast_chart(prices, forecasts)
    return result


def calculate_logistics(quantity_kg: float, distance_km: float, transport_rate: float = 38,
                        storage_days: float = 0, storage_rate: float = 4.5) -> dict:
    if quantity_kg <= 0 or distance_km < 0:
        raise ValueError("Quantity must be positive and distance cannot be negative.")
    transport_cost = distance_km * transport_rate * quantity_kg / 100
    storage_cost = storage_days * storage_rate * quantity_kg
    suitable = distance_km <= 100 and storage_days <= 30
    suitability_reasons = []
    if distance_km > 100:
        suitability_reasons.append("Distance exceeds the recommended 100 km range.")
    if storage_days > 30:
        suitability_reasons.append("Storage period exceeds the recommended 30-day limit.")
    if suitable:
        suitability_reasons.append("Suitable for the configured transport distance and storage period.")
    return {
        "quantity_kg": quantity_kg,
        "distance_km": distance_km,
        "transport_cost": round(transport_cost, 2),
        "storage_cost": round(storage_cost, 2),
        "total_cost": round(transport_cost + storage_cost, 2),
        "suitable": suitable,
        "suitability_reasons": suitability_reasons,
    }


def summarize_analytics(documents: dict[str, list[dict]]) -> dict:
    lots = documents.get("lots", [])
    offers = documents.get("offers", [])
    grievances = documents.get("grievances", [])
    transactions = documents.get("transactions", [])
    delivered = sum(item.get("delivery_status") == "DELIVERED" for item in transactions)
    paid = sum(item.get("payment_status") == "PAID" for item in transactions)
    total_sales = sum(float(item.get("amount", 0) or 0) for item in transactions)
    return {
        "lots": len(lots),
        "open_lots": sum(lot.get("status", "OPEN") == "OPEN" for lot in lots),
        "offers": len(offers),
        "pending_offers": sum(offer.get("status", "PENDING") == "PENDING" for offer in offers),
        "grievances": len(grievances),
        "open_grievances": sum(item.get("status", "OPEN") == "OPEN" for item in grievances),
        "transactions": len(transactions),
        "delivered_transactions": delivered,
        "paid_transactions": paid,
        "total_sales_amount": round(total_sales, 2),
    }
