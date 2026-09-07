# SECURITY — password hashing, strength rules, and brute-force lockout.
import re
from datetime import datetime, timezone, timedelta

import bcrypt
from fastapi import HTTPException

from database import db
from utils import now_iso


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))


def validate_password_strength(password: str) -> None:
    problems = []
    if len(password) < 8:
        problems.append("at least 8 characters")
    if not re.search(r"[A-Z]", password):
        problems.append("an uppercase letter")
    if not re.search(r"[a-z]", password):
        problems.append("a lowercase letter")
    if not re.search(r"\d", password):
        problems.append("a number")
    if not re.search(r"[^A-Za-z0-9]", password):
        problems.append("a special character")
    if len(password.encode("utf-8")) > 72:
        problems.append("at most 72 characters")
    if problems:
        raise HTTPException(status_code=400, detail="Password needs " + ", ".join(problems))


async def check_lockout(identifier: str) -> None:
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if not doc or doc.get("count", 0) < 5:
        return
    locked = doc.get("locked_until")
    if isinstance(locked, str):
        locked = datetime.fromisoformat(locked)
    if locked and locked.tzinfo is None:
        locked = locked.replace(tzinfo=timezone.utc)
    if locked and locked > datetime.now(timezone.utc):
        raise HTTPException(status_code=429, detail="Too many failed attempts — try again in 15 minutes")


async def record_failed_login(identifier: str) -> None:
    doc = await db.login_attempts.find_one_and_update(
        {"identifier": identifier},
        {"$inc": {"count": 1}, "$setOnInsert": {"first_attempt": now_iso()}},
        upsert=True,
        return_document=True,
    )
    if doc and doc.get("count", 0) >= 5:
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$set": {"locked_until": datetime.now(timezone.utc) + timedelta(minutes=15)}},
        )
