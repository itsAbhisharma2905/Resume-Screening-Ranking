import hashlib
import json
from typing import Any

import redis

from app.core.config import get_settings


def resume_hash(text: str) -> str:
    normalized = " ".join(text.lower().split())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


class Cache:
    def __init__(self) -> None:
        self.client = redis.from_url(get_settings().redis_url, decode_responses=True)

    def get_json(self, key: str) -> dict[str, Any] | None:
        value = self.client.get(key)
        return json.loads(value) if value else None

    def set_json(self, key: str, value: dict[str, Any], ttl_seconds: int = 86400) -> None:
        self.client.setex(key, ttl_seconds, json.dumps(value))
