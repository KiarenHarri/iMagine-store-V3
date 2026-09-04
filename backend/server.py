from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class ProductQuote(BaseModel):
    category: str
    model: str = ""
    storage: str = ""
    trade_in: bool = False
    accessories: List[str] = []
    name: str
    email: EmailStr
    phone: str = ""
    notes: str = ""


class RepairQuote(BaseModel):
    device: str
    model: str = ""
    issue: str
    description: str = ""
    serial: str = ""
    service_mode: str = "walk-in"
    name: str
    email: EmailStr
    phone: str = ""


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str


def ref_code(prefix: str) -> str:
    return f"{prefix}-" + uuid.uuid4().hex[:6].upper()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@api_router.get("/")
async def root():
    return {"message": "iMagine Store API"}


@api_router.post("/quotes/product")
async def create_product_quote(q: ProductQuote):
    doc = q.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "reference": ref_code("IMQ"),
        "type": "product",
        "status": "Received",
        "created_at": now_iso(),
    })
    await db.quotes.insert_one(doc)
    return {"reference": doc["reference"], "message": "Product quote request received"}


@api_router.post("/quotes/repair")
async def create_repair_quote(q: RepairQuote):
    doc = q.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "reference": ref_code("IMR"),
        "type": "repair",
        "status": "Received — awaiting assessment",
        "created_at": now_iso(),
    })
    await db.quotes.insert_one(doc)
    return {"reference": doc["reference"], "message": "Repair quote request received"}


@api_router.get("/quotes/repair/{reference}")
async def repair_status(reference: str):
    doc = await db.quotes.find_one(
        {"reference": reference.strip().upper(), "type": "repair"}, {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="No repair found for that reference")
    return {
        "reference": doc["reference"],
        "device": doc["device"],
        "issue": doc["issue"],
        "status": doc.get("status", "Received"),
        "created_at": doc["created_at"],
    }


@api_router.post("/contact")
async def create_contact(msg: ContactMessage):
    doc = msg.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "reference": ref_code("IMC"),
        "created_at": now_iso(),
    })
    await db.contact_messages.insert_one(doc)
    return {"reference": doc["reference"], "message": "Message received"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
