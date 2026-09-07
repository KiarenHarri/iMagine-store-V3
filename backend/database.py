# DATABASE — MongoDB connection and the admin-membership check used across the app.
import os

from motor.motor_asyncio import AsyncIOMotorClient

from config import ADMIN_EMAILS  # noqa: F401  (re-exported)

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


async def is_admin_email(email: str) -> bool:
    e = email.lower().strip()
    removed = await db.admin_removals.find_one({"email": e}, {"_id": 0})
    if removed:
        return False
    if e in ADMIN_EMAILS:
        return True
    doc = await db.admins.find_one({"email": e}, {"_id": 0})
    return doc is not None
