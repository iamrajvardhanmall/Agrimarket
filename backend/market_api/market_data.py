from __future__ import annotations

import json
import csv
import logging
import os
import time
from datetime import date
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from dotenv import load_dotenv


LOGGER = logging.getLogger(__name__)
DATA_GOV_RESOURCE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
load_dotenv()
load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

FALLBACK_MARKETS = [
    {"id": "nashik", "name": "Nashik APMC", "district": "Nashik", "state": "Maharashtra", "commodity_group": "Other", "variety": "FAQ", "price": 2850, "min_price": 2700, "max_price": 3000, "trend": 6.8, "arrival": 4210, "arrival_quantity": 4210, "distance": 18, "demand": "High", "confidence": 82},
    {"id": "lasalgaon", "name": "Lasalgaon Market", "district": "Nashik", "state": "Maharashtra", "commodity_group": "Other", "variety": "FAQ", "price": 2920, "min_price": 2780, "max_price": 3050, "trend": 4.2, "arrival": 3650, "arrival_quantity": 3650, "distance": 34, "demand": "High", "confidence": 78},
    {"id": "pimpalgaon", "name": "Pimpalgaon Baswant", "district": "Nashik", "state": "Maharashtra", "commodity_group": "Other", "variety": "FAQ", "price": 2760, "min_price": 2600, "max_price": 2910, "trend": 8.9, "arrival": 2980, "arrival_quantity": 2980, "distance": 42, "demand": "Medium", "confidence": 74},
    {"id": "manmad", "name": "Manmad Yard", "district": "Nashik", "state": "Maharashtra", "commodity_group": "Other", "variety": "FAQ", "price": 2680, "min_price": 2500, "max_price": 2820, "trend": 2.1, "arrival": 5120, "arrival_quantity": 5120, "distance": 61, "demand": "Medium", "confidence": 69},
]

KNOWN_DISTANCES = {
    "Nashik APMC": 18,
    "Nashik": 18,
    "Lasalgaon": 34,
    "Pimpalgaon Baswant": 42,
    "Manmad": 61,
}

COMMODITY_GROUPS = {
    "Cereals": {"Bajra(Pearl Millet/Cumbu)", "Barley (Jau)", "Paddy(Common)", "Wheat"},
    "Fibre Crops": {"Cotton", "Jute"},
    "Oil Seeds": {"Groundnut", "Mustard", "Soyabean"},
    "Pulses": {"Bengal Gram(Gram)(Whole)", "Black Gram(Urd Beans)(Whole)", "Arhar (Tur/Red Gram)(Whole)"},
}
DATASET_PATH = Path(__file__).resolve().parents[2] / "data_engine" / "Dataset.csv"
_DATASET_METADATA_CACHE: dict | None = None


def load_dataset_metadata() -> dict:
    global _DATASET_METADATA_CACHE
    if _DATASET_METADATA_CACHE is not None:
        return _DATASET_METADATA_CACHE

    locations: dict[str, set[str]] = {}
    markets_by_district: dict[str, set[str]] = {}
    commodities: set[str] = set()
    grades: set[str] = set()
    varieties: set[str] = set()

    try:
        with DATASET_PATH.open(encoding="utf-8-sig", newline="") as source:
            for row in csv.DictReader(source):
                state = (row.get("State") or "").strip()
                district = (row.get("District") or "").strip()
                market = (row.get("Market") or "").strip()
                commodity = (row.get("Commodity") or "").strip()
                grade = (row.get("Grade") or "").strip()
                variety = (row.get("Variety") or "").strip()

                if state and district:
                    locations.setdefault(state, set()).add(district)
                if district and market:
                    markets_by_district.setdefault(district, set()).add(market)
                if commodity:
                    commodities.add(commodity)
                if grade:
                    grades.add(grade)
                if variety:
                    varieties.add(variety)
    except OSError as exc:
        LOGGER.warning("Could not read dataset metadata: %s", exc)

    standard_grades = ["Grade A", "Grade B", "Grade C", "FAQ", "Medium", "Large", "Small", "Local"]
    all_grades = sorted(list(grades.union(standard_grades)))

    _DATASET_METADATA_CACHE = {
        "locations": {state: sorted(districts) for state, districts in sorted(locations.items())},
        "markets_by_district": {dist: sorted(mkts) for dist, mkts in sorted(markets_by_district.items())},
        "commodities": sorted(list(commodities)),
        "grades": all_grades,
        "varieties": sorted(list(varieties))[:100],
    }
    return _DATASET_METADATA_CACHE


def load_locations() -> dict[str, list[str]]:
    """Return every state and district available in the synchronized dataset."""
    return load_dataset_metadata()["locations"]


def _csv_to_num(val: str, default: float = 0.0) -> float:
    try:
        return float(str(val or "").replace(",", "")) or default
    except (ValueError, TypeError):
        return default


def _demand_label(arrivals: float) -> str:
    if arrivals >= 3000:
        return "High"
    if arrivals >= 1000:
        return "Medium"
    return "Low"


def fallback_market_data(
    commodity: str | None = None,
    district: str | None = None,
    state: str | None = None,
    market: str | None = None,
    commodity_group: str | None = None,
    variety: str | None = None,
) -> list[dict]:
    """
    Build market list from Dataset.csv with hierarchical fallback:
      exact (commodity+state+district+market+variety)
      → state+commodity  → commodity  → static FALLBACK_MARKETS
    Returns at most 10 markets, each normalised for calculate_recommendation.
    """
    from collections import defaultdict
    from statistics import mean as _mean

    # ----- helpers -------------------------------------------------------
    def _clean(v: str | None) -> str:
        return (v or "").strip().lower()

    c_q = _clean(commodity)
    s_q = _clean(state)
    d_q = _clean(district)
    m_q = _clean(market)
    v_q = _clean(variety)
    cg_q = _clean(commodity_group)

    # ----- filter CSV rows -----------------------------------------------
    def _filter(rows, rc, rs, rd, rm, rv):
        out = []
        for r in rows:
            if rc and rc not in r.get("Commodity", "").lower():
                continue
            if rs and rs not in r.get("State", "").lower():
                continue
            if rd and rd not in r.get("District", "").lower():
                continue
            if rm and rm not in r.get("Market", "").lower():
                continue
            if rv and rv not in r.get("Variety", "").lower():
                continue
            out.append(r)
        return out

    # read CSV once (uses the same module-level cache as forecast)
    try:
        with DATASET_PATH.open(encoding="utf-8-sig", newline="") as fh:
            all_rows = list(csv.DictReader(fh))
    except OSError:
        all_rows = []

    # hierarchical attempts
    attempts = [
        (c_q, s_q, d_q, m_q, v_q),   # exact
        (c_q, s_q, d_q, "", ""),       # commodity + state + district
        (c_q, s_q, "", "", ""),         # commodity + state
        (c_q, "", "", "", ""),          # commodity only
        ("", s_q, "", "", ""),          # state only
    ]

    matched: list[dict] = []
    for rc, rs, rd, rm, rv in attempts:
        if not any([rc, rs, rd, rm, rv]):
            continue
        matched = _filter(all_rows, rc, rs, rd, rm, rv)
        if matched:
            break

    if not matched:
        # absolute last resort – static demo data
        records = [{**item, "commodity": commodity or "All commodities"} for item in FALLBACK_MARKETS]
        return records

    # ----- aggregate by Market, pick avg modal/min/max per market --------
    by_market: dict[str, list[dict]] = defaultdict(list)
    for r in matched:
        mkt_name = r.get("Market", "").strip()
        if not mkt_name:
            continue
        modal = _csv_to_num(r.get("Modal_x0020_Price"), 0)
        if modal <= 0:
            continue
        by_market[mkt_name].append({
            "modal": modal,
            "min":   _csv_to_num(r.get("Min_x0020_Price"), modal),
            "max":   _csv_to_num(r.get("Max_x0020_Price"), modal),
            "district": r.get("District", "").strip(),
            "state":    r.get("State", "").strip(),
            "commodity": r.get("Commodity", "").strip(),
            "variety":   r.get("Variety", "").strip(),
            "grade":     r.get("Grade", "").strip(),
        })

    # sort by avg modal price descending, pick top 10
    agg = []
    for idx, (mkt_name, ps) in enumerate(sorted(by_market.items(),
                                                 key=lambda kv: _mean(v["modal"] for v in kv[1]),
                                                 reverse=True)[:10]):
        avg_modal = _mean(v["modal"] for v in ps)
        avg_min   = _mean(v["min"]   for v in ps)
        avg_max   = _mean(v["max"]   for v in ps)
        sample    = ps[0]
        mkt_commodity = sample["commodity"]
        distance  = KNOWN_DISTANCES.get(mkt_name, max(20 + idx * 15, 10))
        trend_val = round(((avg_max - avg_min) / max(avg_modal, 1)) * 10, 1)

        # commodity_group lookup
        cg = next((g for g, vals in COMMODITY_GROUPS.items() if mkt_commodity in vals), "Other")
        if cg_q and cg_q not in cg.lower():
            continue

        agg.append({
            "id":               f"csv-{idx + 1}",
            "name":             mkt_name,
            "market":           mkt_name,
            "district":         sample["district"],
            "state":            sample["state"],
            "commodity":        mkt_commodity,
            "commodity_group":  cg,
            "variety":          sample["variety"],
            "grade":            sample["grade"],
            "price":            round(avg_modal),
            "modal_price":      round(avg_modal),
            "min_price":        round(avg_min),
            "max_price":        round(avg_max),
            "trend":            trend_val,
            "arrival":          len(ps) * 100,   # proxy: row count × 100 qtl
            "arrival_quantity": len(ps) * 100,
            "distance":         distance,
            "demand":           _demand_label(len(ps) * 100),
            "confidence":       75,
            "observed_on":      str(date.today()),
        })

    return agg if agg else [{**item, "commodity": commodity or "All commodities"} for item in FALLBACK_MARKETS]


class MarketDataError(RuntimeError):
    """Raised when an external market-data response cannot be consumed."""


def _number(record: dict, field: str, default: float = 0) -> float:
    value = record.get(field, default)
    if value in (None, ""):
        return default
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError) as exc:
        raise MarketDataError(f"Invalid {field} value in market-data response.") from exc


def normalize_market(record: dict, index: int) -> dict:
    name = str(record.get("market") or record.get("market_name") or "Unknown market").strip()
    district = str(record.get("district") or "Unknown").strip()
    commodity = str(record.get("commodity") or "Unknown").strip()
    state = str(record.get("state") or "Unknown").strip()
    variety = str(record.get("variety") or "Unknown").strip()
    modal_price = _number(record, "modal_price")
    if modal_price <= 0:
        raise MarketDataError("Market-data response contains a non-positive modal price.")

    distance = KNOWN_DISTANCES.get(name, 50)
    return {
        "id": f"market-{index + 1}",
        "name": name,
        "market": name,
        "district": district,
        "state": state,
        "commodity": commodity,
        "commodity_group": next((group for group, values in COMMODITY_GROUPS.items() if commodity in values), "Other"),
        "variety": variety,
        "price": modal_price,
        "modal_price": modal_price,
        "min_price": _number(record, "min_price"),
        "max_price": _number(record, "max_price"),
        "trend": 0,
        "arrival": _number(record, "arrival_quantity"),
        "arrival_quantity": _number(record, "arrival_quantity"),
        "distance": distance,
        "demand": "Medium",
        "confidence": 70,
        "observed_on": record.get("arrival_date") or str(date.today()),
    }


def fetch_market_data(
    commodity: str | None = None,
    district: str | None = None,
    state: str | None = None,
    market: str | None = None,
    commodity_group: str | None = None,
    variety: str | None = None,
) -> list[dict]:
    api_key = os.getenv("MARKET_DATA_API_KEY")
    if not api_key:
        LOGGER.warning("MARKET_DATA_API_KEY is not configured; using bundled market data.")
        return fallback_market_data(commodity, district, state, market, commodity_group, variety)

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": "1000",
    }
    for key, value in (("state", state), ("district", district), ("market", market), ("commodity", commodity), ("variety", variety)):
        if value and not value.lower().startswith("all "):
            params[key] = value
    request = Request(f"{DATA_GOV_RESOURCE}?{urlencode(params)}", headers={"Accept": "application/json"})
    try:
        with urlopen(request, timeout=5) as response:
            payload = json.load(response)
        records = payload.get("records", [])
        normalized = [normalize_market(record, index) for index, record in enumerate(records)]
        if commodity_group and not commodity_group.lower().startswith("all "):
            normalized = [market_data for market_data in normalized if market_data["commodity_group"] == commodity_group]
        if not normalized:
            raise MarketDataError("Market-data API returned no records.")
        return normalized
    except (OSError, ValueError, TypeError, json.JSONDecodeError, MarketDataError) as exc:
        LOGGER.warning("Market-data API unavailable: %s; using bundled market data.", exc)
        return fallback_market_data(commodity, district, state, market, commodity_group, variety)


def fetch_market_records(
    *,
    commodity: str | None = None,
    district: str | None = None,
    state: str | None = None,
    limit: int = 1000,
    max_records: int = 5000,
) -> list[dict]:
    """Fetch raw data.gov.in records for batch export with pagination and safety limits."""
    api_key = os.getenv("MARKET_DATA_API_KEY")
    if not api_key:
        raise MarketDataError("MARKET_DATA_API_KEY is required for a live CSV export.")
    if limit < 1:
        raise ValueError("limit must be greater than zero")

    records: list[dict] = []
    offset = 0
    while True:
        params = {
            "api-key": api_key,
            "format": "json",
            "limit": str(limit),
            "offset": str(offset),
        }
        if commodity:
            params["commodity"] = commodity
        if district:
            params["district"] = district
        if state:
            params["state"] = state
        request = Request(
            f"{DATA_GOV_RESOURCE}?{urlencode(params)}",
            headers={
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        )
        last_error: Exception | None = None
        page_limit = limit
        for attempt in range(3):
            try:
                with urlopen(request, timeout=30) as response:
                    payload = json.load(response)
                break
            except (HTTPError, OSError, ValueError, TypeError, json.JSONDecodeError) as exc:
                last_error = exc
                if attempt < 2:
                    time.sleep(min(10, 2**attempt))
                    if isinstance(exc, HTTPError) and exc.code in (429, 502, 503, 504):
                        page_limit = max(100, page_limit // 2)
                        params["limit"] = str(page_limit)
                        request = Request(
                            f"{DATA_GOV_RESOURCE}?{urlencode(params)}",
                            headers={
                                "Accept": "application/json",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                                "Accept-Language": "en-US,en;q=0.9",
                            },
                        )
        else:
            # If we already have some records fetched from earlier pages, use them instead of failing
            if records:
                LOGGER.warning("Encountered error on offset %d after fetching %d records: %s. Proceeding with fetched records.", offset, len(records), last_error)
                return records
            raise MarketDataError(
                f"Could not read the data.gov.in response after 3 attempts: {last_error}"
            ) from last_error

        page = payload.get("records", [])
        if not isinstance(page, list):
            if records:
                return records
            raise MarketDataError("The data.gov.in response has an invalid records field.")
        records.extend(page)
        if len(page) < page_limit or (max_records and len(records) >= max_records):
            return records[:max_records] if max_records else records
        offset += len(page)
