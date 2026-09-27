"""Small, dependency-free baseline for a first market-price forecast."""

from statistics import mean


def moving_average_forecast(prices: list[float], window: int = 7) -> float:
    if not prices:
        raise ValueError("prices must contain at least one value")
    if window < 1:
        raise ValueError("window must be at least one")
    sample = prices[-window:]
    return round(mean(sample), 2)


def forecast_horizon(prices: list[float], horizons: tuple[int, ...] = (1, 3, 7)) -> dict[str, float]:
    return {f"{days}_day": moving_average_forecast(prices, days) for days in horizons}
