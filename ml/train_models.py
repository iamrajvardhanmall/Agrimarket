"""Command-line entry point for the AgriMarket ML training pipeline."""

from pathlib import Path

from market_models import train_dataset


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    print(train_dataset(root / "data_engine" / "Dataset.csv", root / "ml" / "correlation_heatmap.png"))
