"""Automated 12-hour scheduler for AgriMarket mandi dataset update & git push.

Can be run locally:
    python scripts/auto_fetch_scheduler.py
Options:
    --interval-hours 12   (default: 12)
    --once                (run once immediately and exit)
"""

from __future__ import annotations

import argparse
import datetime
import os
import subprocess
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"
DATA_ENGINE_DIR = REPO_ROOT / "data_engine"
DATASET_CSV = DATA_ENGINE_DIR / "Dataset.csv"
FETCH_SCRIPT = DATA_ENGINE_DIR / "fetch_daily_market_data.py"

# Load environment variables (.env from backend or root)
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(REPO_ROOT / ".env")


def run_command(cmd: list[str], cwd: Path = REPO_ROOT) -> subprocess.CompletedProcess:
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Executing: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    if result.stdout:
        print(result.stdout.strip())
    if result.stderr:
        print(result.stderr.strip(), file=sys.stderr)
    return result


def fetch_and_push() -> bool:
    api_key = os.getenv("MARKET_DATA_API_KEY")
    if not api_key:
        print(
            "ERROR: MARKET_DATA_API_KEY is not configured.\n"
            "Please set MARKET_DATA_API_KEY in backend/.env or your environment.",
            file=sys.stderr,
        )
        return False

    # 1. Run data fetch script
    print("\n" + "=" * 60)
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting mandi data fetch...")
    fetch_result = run_command([sys.executable, str(FETCH_SCRIPT)])
    if fetch_result.returncode != 0:
        print(f"Fetch script failed with exit code {fetch_result.returncode}.", file=sys.stderr)
        return False

    # 2. Check if Dataset.csv has modified or new data
    diff_result = run_command(["git", "status", "--porcelain", str(DATASET_CSV)])
    if not diff_result.stdout.strip():
        print("Dataset.csv is unchanged. Nothing to commit or push.")
        return True

    # 3. Git add, commit, and push
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Changes detected in Dataset.csv. Pushing to GitHub...")
    run_command(["git", "add", str(DATASET_CSV)])
    commit_msg = f"chore(data): auto-update mandi dataset [{datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}]"
    commit_res = run_command(["git", "commit", "-m", commit_msg])
    if commit_res.returncode != 0:
        print("Git commit failed.", file=sys.stderr)
        return False

    push_res = run_command(["git", "push"])
    if push_res.returncode == 0:
        print("Successfully pushed updated dataset to GitHub!")
        return True
    else:
        print("Git push failed. Please check your git credentials/remote.", file=sys.stderr)
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--interval-hours",
        type=float,
        default=12.0,
        help="Interval between runs in hours (default: 12)",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run once immediately and exit",
    )
    args = parser.parse_args()

    print(f"AgriMarket Data Scheduler initialized.")
    print(f"Target script: {FETCH_SCRIPT}")
    print(f"Interval: {args.interval_hours} hours ({args.interval_hours * 3600} seconds)")

    if args.once:
        fetch_and_push()
        return

    interval_seconds = int(args.interval_hours * 3600)
    while True:
        try:
            fetch_and_push()
        except Exception as exc:
            print(f"Unhandled error during scheduled run: {exc}", file=sys.stderr)

        next_run = datetime.datetime.now() + datetime.timedelta(seconds=interval_seconds)
        print(f"Next run scheduled at: {next_run.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Sleeping for {args.interval_hours} hours...\n")
        time.sleep(interval_seconds)


if __name__ == "__main__":
    main()

