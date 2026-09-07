# UTILS — small shared helpers (reference codes, timestamps, sale visibility window).
import uuid
from datetime import datetime, timezone


def ref_code(prefix: str) -> str:
    return f"{prefix}-" + uuid.uuid4().hex[:6].upper()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def sale_window_query() -> dict:
    now = now_iso()
    return {"$and": [
        {"$or": [{"starts_at": ""}, {"starts_at": {"$lte": now}}, {"starts_at": {"$exists": False}}]},
        {"$or": [{"ends_at": ""}, {"ends_at": {"$gte": now}}, {"ends_at": {"$exists": False}}]},
    ]}
