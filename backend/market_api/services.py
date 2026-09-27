from __future__ import annotations


def calculate_recommendation(markets, quantity_kg, transport_rate=38, storage_days=0, storage_rate=4.5):
    """Return ranked market recommendations by expected net realization."""
    if quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than zero")

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
            "window": "22-24 September",
            "confidence": best["confidence"],
            "reason": "Best expected net realization after transport and storage.",
        },
        "options": ranked,
    }
