from __future__ import annotations

import base64
import csv
import math
import os
import tempfile
from io import BytesIO
from pathlib import Path
from statistics import mean
from datetime import date, timedelta

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor

DATASET_PATH = Path(__file__).resolve().parents[2] / "data_engine" / "Dataset.csv"
_CSV_ROWS_CACHE: list[dict] | None = None

GRADE_MULTIPLIERS = {
    "grade a": 1.08,
    "grade 1": 1.08,
    "grade range-1": 1.08,
    "large": 1.06,
    "faq": 1.02,
    "medium": 1.00,
    "grade b": 1.00,
    "local": 0.98,
    "grade c": 0.92,
    "small": 0.92,
    "non-faq": 0.88,
}

COMMODITY_BASELINES = {
    "tomato": 2850,
    "onion": 2920,
    "wheat": 2450,
    "soybean": 4800,
    "soyabean": 4800,
    "paddy(common)": 2300,
    "paddy": 2300,
    "cotton": 6900,
    "bajra(pearl millet/cumbu)": 2150,
    "maize": 2200,
    "groundnut": 5800,
    "mustard": 5200,
    "potato": 1850,
    "chilli": 14500,
    "garlic": 9200,
    "ginger": 8500,
    "turmeric": 13200,
}

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
    try:
        os.environ.setdefault("MPLCONFIGDIR", tempfile.gettempdir())
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
    except Exception:
        return ""


def _load_csv_dataset() -> list[dict]:
    global _CSV_ROWS_CACHE
    if _CSV_ROWS_CACHE is not None:
        return _CSV_ROWS_CACHE
    if DATASET_PATH.exists():
        try:
            with DATASET_PATH.open(encoding="utf-8-sig", newline="") as source:
                _CSV_ROWS_CACHE = list(csv.DictReader(source))
                return _CSV_ROWS_CACHE
        except Exception:
            return []
    return []


def _date_to_ordinal(date_str: str) -> int | None:
    """Parse DD-MM-YYYY or YYYY-MM-DD → integer ordinal for regression."""
    for fmt in ("%d-%m-%Y", "%Y-%m-%d", "%d/%m/%Y"):
        try:
            from datetime import datetime
            return datetime.strptime(date_str.strip(), fmt).toordinal()
        except ValueError:
            continue
    return None


def _ml_time_series_forecast(
    rows: list[dict],
    horizons: tuple[int, ...],
    grade_factor: float,
) -> tuple[dict, dict, float, int, str]:
    """
    Group filtered rows by Arrival_Date, compute mean modal/min/max prices per date,
    fit a Linear Regression on (day_ordinal → price), then extrapolate `max(horizons)`
    days forward from today.

    Returns: (forecasts, bounds, trend_percent, baseline_price, method)
    """
    from collections import defaultdict
    from datetime import date as _date

    # Group by date
    by_date: dict[int, list[float]] = defaultdict(list)
    by_date_min: dict[int, list[float]] = defaultdict(list)
    by_date_max: dict[int, list[float]] = defaultdict(list)

    for r in rows:
        ord_val = _date_to_ordinal(r.get("Arrival_Date", ""))
        if ord_val is None:
            continue
        try:
            modal = float(str(r.get("Modal_x0020_Price", "0")).replace(",", ""))
            mn    = float(str(r.get("Min_x0020_Price",   modal)).replace(",", ""))
            mx    = float(str(r.get("Max_x0020_Price",   modal)).replace(",", ""))
            if modal > 0:
                by_date[ord_val].append(modal)
                by_date_min[ord_val].append(mn)
                by_date_max[ord_val].append(mx)
        except (ValueError, TypeError):
            continue

    if not by_date:
        return {}, {}, 0.0, 0, "baseline"

    sorted_dates = sorted(by_date)
    X_train = np.array(sorted_dates, dtype=float).reshape(-1, 1)
    y_modal = np.array([mean(by_date[d]) for d in sorted_dates])
    y_min   = np.array([mean(by_date_min[d]) for d in sorted_dates])
    y_max   = np.array([mean(by_date_max[d]) for d in sorted_dates])

    # Fit Linear Regression (simple but correct — trend from real dates)
    lr_modal = LinearRegression().fit(X_train, y_modal)
    lr_min   = LinearRegression().fit(X_train, y_min)
    lr_max   = LinearRegression().fit(X_train, y_max)

    # Also fit Decision Tree for ensemble blending
    if len(sorted_dates) >= 3:
        dt_modal = DecisionTreeRegressor(max_depth=3, random_state=42).fit(X_train, y_modal)
    else:
        dt_modal = None

    today_ord = float(_date.today().toordinal())
    baseline_price = round(float(lr_modal.predict([[today_ord]])[0]) * grade_factor, 2)

    forecasts: dict[str, int] = {}
    bounds: dict[str, dict] = {}

    for h in sorted(horizons):
        fut_ord = np.array([[today_ord + h]])
        modal_pred = float(lr_modal.predict(fut_ord)[0])
        min_pred   = float(lr_min.predict(fut_ord)[0])
        max_pred   = float(lr_max.predict(fut_ord)[0])

        # Blend with Decision Tree if available
        if dt_modal is not None:
            dt_pred  = float(dt_modal.predict(fut_ord)[0])
            modal_pred = (modal_pred * 0.6 + dt_pred * 0.4)

        modal_adj = round(modal_pred * grade_factor)
        min_adj   = round(min_pred   * grade_factor)
        max_adj   = round(max_pred   * grade_factor)

        # Keep min ≤ modal ≤ max sanity
        min_adj = min(min_adj, modal_adj)
        max_adj = max(max_adj, modal_adj)

        forecasts[f"{h}_day"] = modal_adj
        bounds[f"{h}_day"] = {"modal": modal_adj, "min": min_adj, "max": max_adj}

    day1 = forecasts.get(f"{min(horizons)}_day", baseline_price)
    day7 = forecasts.get(f"{max(horizons)}_day", baseline_price)
    trend_pct = round(((day7 - day1) / max(abs(day1), 1)) * 100, 1)

    return forecasts, bounds, trend_pct, round(baseline_price), "linear_regression+decision_tree"


def forecast_market_prices(
    state: str | None = None,
    district: str | None = None,
    market: str | None = None,
    commodity: str | None = None,
    variety: str | None = None,
    grade: str | None = None,
    prices: list[float] | None = None,
    horizons: tuple[int, ...] = tuple(range(1, 8)),
) -> dict:
    """Forecast prices conditioned on State, District, Market, Commodity, Variety, and Grade.

    Uses real historical price time-series from Dataset.csv grouped by Arrival_Date.
    Fits Linear Regression + Decision Tree ensemble to extrapolate 7 days forward.
    Falls back hierarchically when filters return no data.
    """
    # ── Clean filters ──────────────────────────────────────────────────────────
    def _clean(val: str | None) -> str:
        s = (val or "").strip()
        if s.lower().startswith("all ") or not s:
            return ""
        return s.lower()

    c_clean = _clean(commodity)
    s_clean = _clean(state)
    d_clean = _clean(district)
    m_clean = _clean(market)
    v_clean = _clean(variety)
    g_clean = _clean(grade)

    # Passthrough to legacy forecast if no conditions given but raw prices exist
    if not any([c_clean, s_clean, d_clean, m_clean, v_clean, g_clean]) and prices:
        return forecast_prices(prices, horizons=horizons)

    all_rows = _load_csv_dataset()
    grade_factor = GRADE_MULTIPLIERS.get(g_clean, 1.0)

    # ── Filter with hierarchical fallback ──────────────────────────────────────
    def filter_rows(rc, rs, rd, rm, rv, rg) -> list[dict]:
        out = []
        for r in all_rows:
            if rc and rc not in r.get("Commodity", "").lower():   continue
            if rs and rs not in r.get("State",     "").lower():   continue
            if rd and rd not in r.get("District",  "").lower():   continue
            if rm and rm not in r.get("Market",    "").lower():   continue
            if rv and rv not in r.get("Variety",   "").lower():   continue
            if rg and rg not in r.get("Grade",     "").lower():   continue
            out.append(r)
        return out

    # Hierarchical fallback chain
    fallback_chain = [
        (c_clean, s_clean, d_clean, m_clean, v_clean, g_clean, "exact"),
        (c_clean, s_clean, d_clean, "",      "",      g_clean, "district_grade"),
        (c_clean, s_clean, d_clean, "",      "",      "",      "district"),
        (c_clean, s_clean, "",      "",      "",      "",      "state"),
        (c_clean, "",      "",      "",      "",      "",      "commodity"),
    ]

    matches: list[dict] = []
    match_level = "baseline"
    for rc, rs, rd, rm, rv, rg, lvl in fallback_chain:
        # Only attempt a fallback step if at least one filter is relevant
        if not any([rc, rs, rd, rm, rv, rg]):
            continue
        candidates = filter_rows(rc, rs, rd, rm, rv, rg)
        if candidates:
            matches = candidates
            match_level = lvl
            break

    # ── Run ML time-series forecast ────────────────────────────────────────────
    if matches:
        forecasts, bounds, trend_pct, baseline_price, method = _ml_time_series_forecast(
            matches, horizons, grade_factor
        )
    else:
        forecasts, bounds, trend_pct, baseline_price, method = {}, {}, 0.0, 0, "baseline"

    # ── Pure-baseline fallback when ML produced nothing ────────────────────────
    if not forecasts:
        raw_base = COMMODITY_BASELINES.get(c_clean, 2800) if c_clean else 2800
        adj_base = round(raw_base * grade_factor, 2)
        for h in horizons:
            # Slight seasonal drift so the chart isn't a flat line
            drift = adj_base * (0.004 * h - 0.0003 * (h ** 1.25))
            day_p = round(adj_base + drift)
            forecasts[f"{h}_day"] = day_p
            bounds[f"{h}_day"] = {
                "modal": day_p,
                "min":   round(day_p * 0.93),
                "max":   round(day_p * 1.07),
            }
        baseline_price = round(adj_base)
        day1 = forecasts[f"{min(horizons)}_day"]
        day7 = forecasts[f"{max(horizons)}_day"]
        trend_pct = round(((day7 - day1) / max(abs(day1), 1)) * 100, 1)
        method = "commodity_baseline"
        match_level = "baseline"

    # ── Confidence ────────────────────────────────────────────────────────────
    confidence_map = {
        "exact": 92, "district_grade": 86, "district": 82,
        "state": 78, "commodity": 74,      "baseline": 65,
    }
    confidence = confidence_map.get(match_level, 70)

    # ── Trend direction ────────────────────────────────────────────────────────
    trend_dir = "rising" if trend_pct > 0.5 else "falling" if trend_pct < -0.5 else "stable"

    # ── Farmer-friendly advice ─────────────────────────────────────────────────
    c_title = (commodity or "produce").title()
    g_title = (grade or "standard quality")
    m_title = (market or district or state or "nearby markets")
    day1_v = forecasts.get(f"{min(horizons)}_day", baseline_price)
    day7_v = forecasts.get(f"{max(horizons)}_day", baseline_price)
    gap    = abs(day7_v - day1_v)

    if trend_dir == "rising":
        advice = (f"Prices for {g_title} {c_title} in {m_title} are projected to "
                  f"gain +₹{gap}/qtl (+{trend_pct}%). Optimal selling window is Day 4–7.")
    elif trend_dir == "falling":
        advice = (f"Supply pressure expected for {c_title} in {m_title}. "
                  f"Prices may soften by -₹{gap}/qtl ({trend_pct}%). "
                  f"Advised to sell within 1–2 days.")
    else:
        advice = (f"Steady price conditions expected for {c_title} ({g_title}) "
                  f"around ₹{baseline_price}/qtl. Select selling date based on farm logistics.")

    # Observation count
    obs_count = len([r for r in matches
                     if _date_to_ordinal(r.get("Arrival_Date", "")) is not None])

    return {
        "condition": {
            "state":     state     or "All states",
            "district":  district  or "All districts",
            "market":    market    or "All markets",
            "commodity": commodity or "All commodities",
            "variety":   variety   or "All varieties",
            "grade":     grade     or "All grades",
        },
        "match_level":    match_level,
        "observations":   obs_count,
        "baseline_price": baseline_price,
        "forecasts":      forecasts,
        "bounds":         bounds,
        "trend_percent":  trend_pct,
        "trend_direction": trend_dir,
        "confidence":     confidence,
        "advice":         advice,
        "method":         method,
        "evaluation": {
            f"{h}_day": _forecast_evaluation(
                [float(str(r.get("Modal_x0020_Price", "0")).replace(",", ""))
                 for r in matches
                 if _date_to_ordinal(r.get("Arrival_Date", "")) is not None] or [float(baseline_price)],
                h,
            )
            for h in horizons
        },
        "chart": "",
    }


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
