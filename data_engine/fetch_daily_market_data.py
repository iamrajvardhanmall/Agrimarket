"""Merge the latest data.gov.in mandi records into the project dataset.

Set MARKET_DATA_API_KEY in the environment before running this script.
The output is intended to be run once per day by Windows Task Scheduler,
cron, or a CI scheduler.
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

BACKEND_PATH = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_PATH))

from market_api.market_data import MarketDataError, fetch_market_records


OUTPUT_FIELDS = ["State", "District", "Market", "Commodity", "Variety", "Grade",
                 "Arrival_Date", "Min_x0020_Price", "Max_x0020_Price", "Modal_x0020_Price"]
API_FIELDS = ["state", "district", "market", "commodity", "variety", "grade",
              "arrival_date", "min_price", "max_price", "modal_price"]
UNIQUE_KEY_FIELDS = ["State", "District", "Market", "Commodity", "Variety", "Grade", "Arrival_Date"]


def _row(record: dict) -> dict[str, str]:
    row = {
        output_field: str(record.get(api_field, "") or "").strip()
        for output_field, api_field in zip(OUTPUT_FIELDS, API_FIELDS)
    }
    row["Arrival_Date"] = row["Arrival_Date"].replace("/", "-")
    return row


def _unique_key(row: dict[str, str]) -> tuple[str, ...]:
    return tuple(row[field].strip().casefold() for field in UNIQUE_KEY_FIELDS)


def merge_csv(output_path: Path, records: list[dict]) -> int:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    existing: list[dict[str, str]] = []
    if output_path.exists():
        with output_path.open(newline="", encoding="utf-8-sig") as source:
            reader = csv.DictReader(source)
            existing = []
            for row in reader:
                normalized = {field: row.get(field, "") for field in OUTPUT_FIELDS}
                normalized["Arrival_Date"] = normalized["Arrival_Date"].replace("/", "-")
                existing.append(normalized)

    incoming = [_row(record) for record in records]
    existing_keys = {_unique_key(row) for row in existing}
    unique_rows = list({
        _unique_key(row): row
        for row in existing + incoming
    }.values())
    with output_path.open("w", newline="", encoding="utf-8") as output:
        writer = csv.DictWriter(output, fieldnames=OUTPUT_FIELDS)
        writer.writeheader()
        writer.writerows(unique_rows)
    added = sum(
        _unique_key(row) not in existing_keys
        for row in incoming
    )
    return added


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().with_name("Dataset.csv"),
    )
    parser.add_argument("--commodity")
    parser.add_argument("--district")
    parser.add_argument("--state")
    parser.add_argument("--max-records", type=int, default=5000)
    args = parser.parse_args()

    try:
        records = fetch_market_records(
            commodity=args.commodity,
            district=args.district,
            state=args.state,
            max_records=args.max_records,
        )
        if not records:
            raise MarketDataError("The data.gov.in API returned no records.")
        added = merge_csv(args.output, records)
    except (MarketDataError, OSError, ValueError) as exc:
        print(f"Market data export failed: {exc}", file=sys.stderr)
        return 1

    print(f"Fetched {len(records)} records; added {added} new rows to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
