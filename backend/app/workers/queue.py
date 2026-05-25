from redis import Redis
from rq import Queue

from app.core.config import get_settings


def get_queue() -> Queue:
    redis_conn = Redis.from_url(get_settings().redis_url)
    return Queue("resume-ranking", connection=redis_conn, default_timeout=1800)
