from __future__ import annotations

from statistics import mean
from datetime import date, timedelta


def recommendation_window(today: date | None = None) -> dict[str, str]:
    start = today or date.today()
    end = start + timedelta(days=3)
    return {
        "today": start.isoformat(),
        "window_start": start.isoformat(),
        "window_end": end.isoformat(),
        "window": f"{start.strftime('%d %b')} - {end.strftime('%d %b %Y')}",
    }


def calculate_recommendation(markets, quantity_kg, transport_rate=38, storage_days=0, storage_rate=4.5):
    """Return ranked market recommendations by expected net realization."""
    if quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than zero")
    if not markets:
        raise ValueError("At least one market is required")

    options = []
    for market in markets:
        transport = market["distance"] * transport_rate
        storage = storage_days * storage_rate * quantity_kg
        revenue = market["price"] * quantity_kg / 100
        net = revenue - transport * quantity_kg / 100 - storage
        options.append({
            **market,
            "transport_cost": round(transport * quantity_kg / 100),
            "storage_cost": round(storage),
            "net_realization": round(net),
        })

    ranked = sorted(options, key=lambda option: option["net_realization"], reverse=True)
    best = ranked[0]

    return {
        "recommendation": {
            "market": best["name"],
            **recommendation_window(),
            "confidence": best["confidence"],
            "reason": "Best expected net realization after transport and storage.",
        },
        "options": ranked,
    }


def forecast_prices(prices: list[float], horizons: tuple[int, ...] = (1, 2, 3)) -> dict:
    if not prices:
        raise ValueError("prices must contain at least one value")
    forecasts = {}
    for horizon in horizons:
        sample = prices[-horizon:]
        forecasts[f"{horizon}_day"] = round(mean(sample), 2)
    return {
        "forecasts": forecasts,
        "method": "moving_average",
        "observations": len(prices),
        "confidence": min(95, round(50 + len(prices) * 2)),
    }


def match_buyers(lot: dict, buyers: list[dict]) -> list[dict]:
    matches = []
    for buyer in buyers:
        if buyer.get("commodity", "").casefold() != lot.get("commodity", "").casefold():
            continue
        quantity = float(lot.get("quantity_kg", 0))
        minimum = float(buyer.get("min_quantity_kg", 0))
        maximum = float(buyer.get("max_quantity_kg", 0))
        if not minimum <= quantity <= maximum:
            continue
        score = 60
        if buyer.get("quality", "").casefold() == lot.get("quality", "").casefold():
            score += 20
        if buyer.get("verified"):
            score += 20
        matches.append({**buyer, "match": score})
    return sorted(matches, key=lambda buyer: buyer["match"], reverse=True)


def calculate_logistics(quantity_kg: float, distance_km: float, transport_rate: float = 38,
                        storage_days: float = 0, storage_rate: float = 4.5) -> dict:
    if quantity_kg <= 0 or distance_km < 0:
        raise ValueError("Quantity must be positive and distance cannot be negative.")
    transport_cost = distance_km * transport_rate * quantity_kg / 100
    storage_cost = storage_days * storage_rate * quantity_kg
    return {
        "quantity_kg": quantity_kg,
        "distance_km": distance_km,
        "transport_cost": round(transport_cost, 2),
        "storage_cost": round(storage_cost, 2),
        "total_cost": round(transport_cost + storage_cost, 2),
        "suitable": distance_km <= 100 and storage_days <= 30,
    }


def summarize_analytics(documents: dict[str, list[dict]]) -> dict:
    lots = documents.get("lots", [])
    offers = documents.get("offers", [])
    grievances = documents.get("grievances", [])
    return {
        "lots": len(lots),
        "open_lots": sum(lot.get("status", "OPEN") == "OPEN" for lot in lots),
        "offers": len(offers),
        "pending_offers": sum(offer.get("status", "PENDING") == "PENDING" for offer in offers),
        "grievances": len(grievances),
        "open_grievances": sum(item.get("status", "OPEN") == "OPEN" for item in grievances),
    }
