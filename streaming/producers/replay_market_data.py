"""Replay sample market observations as newline-delimited events.

Replace the stdout sink with a Kafka producer when the streaming environment is ready.
"""

import json
import time
from pathlib import Path


DATA_FILE = Path(__file__).parents[2] / "data_engine" / "sample_market_data.json"


def replay(interval_seconds: float = 1.0) -> None:
    records = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for record in records:
        print(json.dumps({**record, "event_type": "market.price.updated"}), flush=True)
        time.sleep(interval_seconds)


if __name__ == "__main__":
    replay()
