from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient


_client: MongoClient | None = None
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def get_database():
    global _client
    if _client is None:
        user = quote_plus(os.getenv("MONGO_USER", "agrimarket"))
        password = quote_plus(os.getenv("MONGO_PASSWORD", "#07072005Raj"))
        host = os.getenv("MONGO_HOST", "localhost")
        port = os.getenv("MONGO_PORT", "27017")
        database = os.getenv("MONGO_DB", "agrimarket")
        uri = os.getenv(
            "MONGO_URI",
            f"mongodb://{user}:{password}@{host}:{port}/{database}?authSource=admin",
        )
        _client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    return _client[os.getenv("MONGO_DB", "agrimarket")]


def check_connection() -> None:
    get_database().command("ping")


def insert_document(collection: str, document: dict) -> dict:
    result = get_database()[collection].insert_one(document)
    return {**document, "id": str(result.inserted_id)}
