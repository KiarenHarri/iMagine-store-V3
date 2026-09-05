import asyncio
import base64
import secrets
import bcrypt
import requests
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from mailer import notify_team, notify_customer, notify_status, send_password_reset
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
    is_sale: bool = False
    sale_price: str = ""
    sale_was_price: str = ""


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
        ("Sale enquiry", f"Yes — {q.sale_price} (was {q.sale_was_price})" if q.is_sale else "No"),
        ("Trade-in", "Yes" if q.trade_in else "No"),
        ("Accessories", ", ".join(q.accessories)),
        ("Name", q.name),
        ("Email", q.email),
        ("Phone", q.phone),
        ("Notes", q.notes),
    ]
    subject = f"{'SALE — ' if q.is_sale else ''}New product quote — {doc['reference']}"
    asyncio.create_task(notify_team(subject, rows))
    asyncio.create_task(notify_customer(
        q.email, q.name,
        f"Your iMagine Store quote request — {doc['reference']}",
        doc["reference"],
        [("Model", q.model or q.category), ("Storage", q.storage)]
        + ([("Sale deal", f"{q.sale_price} (was {q.sale_was_price})")] if q.is_sale else [])
        + [("Trade-in", "Yes" if q.trade_in else "No")],
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


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


async def create_session_for(user: dict, response: Response) -> dict:
    token = "sess_" + uuid.uuid4().hex
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600,
    )
    return {**user, "is_admin": user["email"].lower() in ADMIN_EMAILS}


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
    return {**user, "is_admin": email.lower() in ADMIN_EMAILS}


@api_router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    name = payload.name.strip()
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered — sign in instead")
    user = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": email,
        "name": name,
        "picture": "",
        "password_hash": hash_password(payload.password),
        "auth_provider": "password",
        "created_at": now_iso(),
    }
    await db.users.insert_one({**user})
    user.pop("password_hash", None)
    return await create_session_for(user, response)


@api_router.post("/auth/login")
async def password_login(payload: LoginIn, request: Request, response: Response):
    email = payload.email.lower().strip()
    identifier = email
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not user.get("password_hash"):
        await record_failed_login(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user["password_hash"]):
        await record_failed_login(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_many({"identifier": identifier})
    user.pop("password_hash", None)
    return await create_session_for(user, response)


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str


@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user and user.get("password_hash"):
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "email": email,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
            "created_at": now_iso(),
        })
        base = os.environ.get("CORS_ORIGINS", "").split(",")[0].strip().strip('"')
        asyncio.create_task(send_password_reset(email, user.get("name", ""), f"{base}/reset-password?token={token}"))
    return {"message": "If that email is registered, a reset link is on its way"}


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetIn):
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    doc = await db.password_reset_tokens.find_one({"token": payload.token})
    if not doc or doc.get("used"):
        raise HTTPException(status_code=400, detail="This reset link is invalid or has already been used")
    exp = doc["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired — request a new one")
    await db.users.update_one({"email": doc["email"]}, {"$set": {"password_hash": hash_password(payload.password)}})
    await db.password_reset_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    return {"message": "Password updated — you can sign in now"}


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


@api_router.delete("/admin/quotes/{reference}")
async def admin_delete_quote(reference: str, request: Request):
    await get_admin_user(request)
    res = await db.quotes.delete_one({"reference": reference.strip().upper()})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted", "reference": reference.strip().upper()}


class SaleIn(BaseModel):
    name: str
    price: str
    was_price: str = ""
    description: str = ""
    image: str = ""
    starts_at: str = ""
    ends_at: str = ""


def sale_window_query() -> dict:
    now = now_iso()
    return {"$and": [
        {"$or": [{"starts_at": ""}, {"starts_at": {"$lte": now}}, {"starts_at": {"$exists": False}}]},
        {"$or": [{"ends_at": ""}, {"ends_at": {"$gte": now}}, {"ends_at": {"$exists": False}}]},
    ]}


@api_router.get("/sales")
async def list_sales():
    return await db.sales.find(sale_window_query(), {"_id": 0}).sort("created_at", -1).to_list(50)


@api_router.get("/admin/sales/all")
async def list_all_sales(request: Request):
    await get_admin_user(request)
    return await db.sales.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)


@api_router.post("/admin/sales")
async def create_sale(payload: SaleIn, request: Request):
    user = await get_admin_user(request)
    if not payload.name.strip() or not payload.price.strip():
        raise HTTPException(status_code=400, detail="Name and sale price are required")
    if payload.image and (not payload.image.startswith("data:image/") or len(payload.image) > 4_500_000):
        raise HTTPException(status_code=400, detail="Image must be a photo under 3MB")
    doc = payload.model_dump()
    doc.update({
        "id": str(uuid.uuid4()),
        "active": True,
        "created_by": user["email"],
        "created_at": now_iso(),
    })
    await db.sales.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.delete("/admin/sales/{sale_id}")
async def delete_sale(sale_id: str, request: Request):
    await get_admin_user(request)
    res = await db.sales.delete_one({"id": sale_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sale not found")
    return {"message": "Sale removed"}


@api_router.get("/admin/stats")
async def admin_stats(request: Request):
    await get_admin_user(request)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    new_week = await db.quotes.count_documents({"created_at": {"$gte": week_ago}})
    pending_repairs = await db.quotes.count_documents({"type": "repair", "status": {"$nin": ["Completed", "Cancelled"]}})
    quoted = await db.quotes.count_documents({"status": {"$in": ["Quote sent", "Confirmed", "Approved — in repair", "Completed"]}})
    accepted = await db.quotes.count_documents({"status": {"$in": ["Confirmed", "Approved — in repair", "Completed"]}})
    active_sales = await db.sales.count_documents(sale_window_query())
    total = await db.quotes.count_documents({})
    return {
        "new_this_week": new_week,
        "pending_repairs": pending_repairs,
        "acceptance_rate": round(accepted / quoted * 100) if quoted else 0,
        "total_submissions": total,
        "active_sales": active_sales,
    }


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


@api_router.post("/quotes/{reference}/decline")
async def decline_quote(reference: str, request: Request):
    user = await get_current_user(request)
    doc = await db.quotes.find_one({"reference": reference.strip().upper()}, {"_id": 0})
    if not doc or not owns_quote(doc, user):
        raise HTTPException(status_code=404, detail="Quote not found")
    if doc["status"] != "Quote sent":
        raise HTTPException(status_code=400, detail="Only a sent quote can be declined")
    await db.quotes.update_one(
        {"reference": doc["reference"]},
        {"$set": {"status": "Cancelled", "declined_at": now_iso()}},
    )
    rows = [
        ("Reference", doc["reference"]),
        ("Customer", doc.get("name", "")),
        ("Email", doc.get("email", "")),
        ("Item", doc.get("model") or doc.get("device", "")),
        ("Quoted price", doc.get("quote_price", "")),
    ]
    asyncio.create_task(notify_team(f"Quote declined — {doc['reference']} — follow up", rows))
    return {"reference": doc["reference"], "status": "Cancelled"}


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


@app.on_event("startup")
async def create_indexes():
    try:
        await db.users.create_index("email", unique=True)
    except Exception:
        pass
    await db.login_attempts.create_index("identifier")
    try:
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    except Exception:
        pass


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
