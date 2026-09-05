import asyncio
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from mailer import notify_team, notify_customer, notify_status
from pdfgen import build_quote_pdf
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get("ADMIN_EMAILS", "").split(",") if e.strip()}

STATUS_FLOWS = {
    "product": ["Received", "Quoting", "Quote sent", "Confirmed", "Completed"],
    "repair": ["Received — awaiting assessment", "Assessing", "Quote sent", "Approved — in repair", "Ready for collection", "Completed"],
}

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
async def create_product_quote(q: ProductQuote, request: Request):
    user = await get_optional_user(request)
    doc = q.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "reference": ref_code("IMQ"),
        "type": "product",
        "status": "Received",
        "user_id": user["user_id"] if user else None,
        "created_at": now_iso(),
    })
    await db.quotes.insert_one(doc)
    rows = [
        ("Reference", doc["reference"]),
        ("Category", q.category),
        ("Model", q.model),
        ("Storage", q.storage),
        ("Trade-in", "Yes" if q.trade_in else "No"),
        ("Accessories", ", ".join(q.accessories)),
        ("Name", q.name),
        ("Email", q.email),
        ("Phone", q.phone),
        ("Notes", q.notes),
    ]
    asyncio.create_task(notify_team(f"New product quote — {doc['reference']}", rows))
    asyncio.create_task(notify_customer(
        q.email, q.name,
        f"Your iMagine Store quote request — {doc['reference']}",
        doc["reference"],
        [("Model", q.model or q.category), ("Storage", q.storage), ("Trade-in", "Yes" if q.trade_in else "No")],
    ))
    return {"reference": doc["reference"], "message": "Product quote request received"}


@api_router.post("/quotes/repair")
async def create_repair_quote(q: RepairQuote, request: Request):
    user = await get_optional_user(request)
    doc = q.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "reference": ref_code("IMR"),
        "type": "repair",
        "status": "Received — awaiting assessment",
        "user_id": user["user_id"] if user else None,
        "created_at": now_iso(),
    })
    await db.quotes.insert_one(doc)
    rows = [
        ("Reference", doc["reference"]),
        ("Device", q.device),
        ("Model", q.model),
        ("Issue", q.issue),
        ("Description", q.description),
        ("Serial / IMEI", q.serial),
        ("Service mode", q.service_mode),
        ("Name", q.name),
        ("Email", q.email),
        ("Phone", q.phone),
    ]
    asyncio.create_task(notify_team(f"New repair request — {doc['reference']}", rows))
    asyncio.create_task(notify_customer(
        q.email, q.name,
        f"Your iMagine Store repair ticket — {doc['reference']}",
        doc["reference"],
        [("Device", q.device), ("Issue", q.issue), ("Status", "Received — awaiting assessment")],
    ))
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
    rows = [
        ("Reference", doc["reference"]),
        ("Name", msg.name),
        ("Email", msg.email),
        ("Phone", msg.phone),
        ("Subject", msg.subject),
        ("Message", msg.message),
    ]
    asyncio.create_task(notify_team(f"New contact message — {doc['reference']}", rows))
    asyncio.create_task(notify_customer(
        msg.email, msg.name,
        f"We've received your message — {doc['reference']}",
        doc["reference"],
        [("Subject", msg.subject or "General enquiry")],
    ))
    return {"reference": doc["reference"], "message": "Message received"}


class SessionExchange(BaseModel):
    session_id: str


async def get_current_user(request: Request):
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization")
    if not token and auth and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_optional_user(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


@api_router.post("/auth/session")
async def exchange_session(payload: SessionExchange, response: Response):
    res = await asyncio.to_thread(
        lambda: requests.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": payload.session_id},
            timeout=15,
        )
    )
    data = res.json()
    if "session_token" not in data:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    email = data["email"]
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": data.get("name", ""),
            "picture": data.get("picture", ""),
            "created_at": now_iso(),
        }
        await db.users.insert_one({**user})
    else:
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": data.get("name", ""), "picture": data.get("picture", "")}},
        )
        user.update({"name": data.get("name", ""), "picture": data.get("picture", "")})
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": data["session_token"],
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    response.set_cookie(
        key="session_token",
        value=data["session_token"],
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600,
    )
    return user


@api_router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return {**user, "is_admin": user["email"].lower() in ADMIN_EMAILS}


async def get_admin_user(request: Request):
    user = await get_current_user(request)
    if user["email"].lower() not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Team access only")
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization")
    if not token and auth and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}


@api_router.get("/quotes/mine")
async def my_quotes(request: Request):
    user = await get_current_user(request)
    docs = await db.quotes.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


class StatusUpdate(BaseModel):
    status: str
    price: str = ""
    note: str = ""


@api_router.get("/admin/submissions")
async def admin_submissions(request: Request):
    await get_admin_user(request)
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"quotes": quotes, "messages": messages}


@api_router.patch("/admin/quotes/{reference}")
async def admin_update_status(reference: str, payload: StatusUpdate, request: Request):
    await get_admin_user(request)
    doc = await db.quotes.find_one({"reference": reference.strip().upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Quote not found")
    allowed = STATUS_FLOWS.get(doc["type"], []) + ["Cancelled"]
    if payload.status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status for this submission type")
    update = {"status": payload.status, "updated_at": now_iso()}
    price = payload.price.strip()
    note = payload.note.strip()
    if price:
        update["quote_price"] = price
    if note:
        update["quote_note"] = note
    await db.quotes.update_one({"reference": doc["reference"]}, {"$set": update})
    doc.update(update)
    asyncio.create_task(notify_status(
        doc.get("email", ""), doc.get("name", ""), doc["reference"], payload.status,
        price=price or None, note=note or None,
    ))
    return doc


def owns_quote(doc: dict, user: dict) -> bool:
    return doc.get("user_id") == user["user_id"] or (doc.get("email") or "").lower() == user["email"].lower()


@api_router.post("/quotes/{reference}/accept")
async def accept_quote(reference: str, request: Request):
    user = await get_current_user(request)
    doc = await db.quotes.find_one({"reference": reference.strip().upper()}, {"_id": 0})
    if not doc or not owns_quote(doc, user):
        raise HTTPException(status_code=404, detail="Quote not found")
    if doc["status"] != "Quote sent":
        raise HTTPException(status_code=400, detail="Only a sent quote can be accepted")
    new_status = "Confirmed" if doc["type"] == "product" else "Approved — in repair"
    await db.quotes.update_one(
        {"reference": doc["reference"]},
        {"$set": {"status": new_status, "accepted_at": now_iso()}},
    )
    rows = [
        ("Reference", doc["reference"]),
        ("Customer", doc.get("name", "")),
        ("Email", doc.get("email", "")),
        ("Item", doc.get("model") or doc.get("device", "")),
        ("Quoted price", doc.get("quote_price", "")),
        ("Note", doc.get("quote_note", "")),
    ]
    asyncio.create_task(notify_team(f"Quote accepted — {doc['reference']}", rows))
    asyncio.create_task(notify_customer(
        doc["email"], doc.get("name", ""),
        f"You accepted your quote — {doc['reference']}",
        doc["reference"],
        [("Status", new_status), ("Quoted price", doc.get("quote_price", ""))],
    ))
    return {"reference": doc["reference"], "status": new_status}


@api_router.get("/quotes/{reference}/pdf")
async def quote_pdf(reference: str, request: Request):
    user = await get_current_user(request)
    doc = await db.quotes.find_one({"reference": reference.strip().upper()}, {"_id": 0})
    if not doc or not owns_quote(doc, user):
        raise HTTPException(status_code=404, detail="Quote not found")
    if not doc.get("quote_price"):
        raise HTTPException(status_code=400, detail="PDF is available once a quote has been sent")
    pdf_bytes = build_quote_pdf(doc)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["reference"]}-quote.pdf"'},
    )


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
