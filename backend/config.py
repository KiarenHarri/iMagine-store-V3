# CONFIG — environment variables and shared constants.
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}

STATUS_FLOWS = {
    "product": ["Received", "Quoting", "Quote sent", "Confirmed", "Completed"],
    "repair": ["Received — awaiting assessment", "Assessing", "Quote sent", "Approved — in repair", "Ready for collection", "Completed"],
}
