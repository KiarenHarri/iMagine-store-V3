# DATABASE & CONFIG — environment variables, constants, MongoDB connection, admin check.
import os
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# --- Config ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}

STATUS_FLOWS = {
    "product": ["Received", "Quoting", "Quote sent", "Confirmed", "Completed"],
    "repair": ["Received — awaiting assessment", "Assessing", "Quote sent", "Approved — in repair", "Ready for collection", "Completed"],
}

# --- Database ---
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
