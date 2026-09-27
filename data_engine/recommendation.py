from dataclasses import dataclass


@dataclass(frozen=True)
class SellingOption:
    market: str
    modal_price: float
    distance_km: float
    demand: str
    transport_rate_per_quintal_km: float = 0.38
    storage_cost: float = 0.0

    def evaluate(self, quantity_kg: float) -> dict:
        quantity_quintals = quantity_kg / 100
        revenue = self.modal_price * quantity_quintals
        transport_cost = self.distance_km * self.transport_rate_per_quintal_km * quantity_quintals
        net_realization = revenue - transport_cost - self.storage_cost
        return {
            "market": self.market,
            "revenue": round(revenue, 2),
            "transport_cost": round(transport_cost, 2),
            "storage_cost": round(self.storage_cost, 2),
            "net_realization": round(net_realization, 2),
            "demand": self.demand,
        }


def rank_selling_options(quantity_kg: float, options: list[SellingOption]) -> list[dict]:
    if quantity_kg <= 0:
        raise ValueError("quantity_kg must be greater than zero")
    return sorted((option.evaluate(quantity_kg) for option in options), key=lambda item: item["net_realization"], reverse=True)
