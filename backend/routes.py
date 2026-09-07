# ROUTES — all HTTP endpoints: public, quotes, contact, admin.
import asyncio
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Request, Response

from auth import (
    get_admin_user,
    get_current_user,
    get_optional_user,
    hash_password,
    owns_quote,
    validate_password_strength,
)
from database import ADMIN_EMAILS, STATUS_FLOWS, db
from mailer import notify_customer, notify_status, notify_team
from models import AdminEmailIn, ContactMessage, ProductQuote, RepairQuote, SaleIn, StatusUpdate
from pdfgen import build_quote_pdf
from utils import now_iso, ref_code, sale_window_query

router = APIRouter()


# ----------------------------- Public -----------------------------

@router.get("/")
async def root():
    return {"message": "iMagine Store API"}


@router.get("/sales")
async def list_sales():
    return await db.sales.find(sale_window_query(), {"_id": 0}).sort("created_at", -1).to_list(50)


# ----------------------------- Quotes -----------------------------

@router.post("/quotes/product")
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
        ("Condition", q.condition or "—"),
        ("Colour", q.color or "—"),
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
        [("Model", q.model or q.category)]
        + ([("Condition", q.condition)] if q.condition else [])
        + ([("Colour", q.color)] if q.color else [])
        + [("Storage", q.storage)]
        + ([("Sale deal", f"{q.sale_price} (was {q.sale_was_price})")] if q.is_sale else [])
        + [("Trade-in", "Yes" if q.trade_in else "No")],
    ))
    return {"reference": doc["reference"], "message": "Product quote request received"}


@router.post("/quotes/repair")
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


@router.get("/quotes/repair/{reference}")
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


@router.get("/quotes/mine")
async def my_quotes(request: Request):
    user = await get_current_user(request)
    docs = await db.quotes.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


@router.post("/quotes/{reference}/accept")
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


@router.post("/quotes/{reference}/decline")
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


@router.get("/quotes/{reference}/pdf")
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


# ----------------------------- Contact -----------------------------

@router.post("/contact")
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


# ----------------------------- Admin: submissions -----------------------------

@router.get("/admin/submissions")
async def admin_submissions(request: Request):
    await get_admin_user(request)
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"quotes": quotes, "messages": messages}


@router.patch("/admin/quotes/{reference}")
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


@router.delete("/admin/quotes/{reference}")
async def admin_delete_quote(reference: str, request: Request):
    await get_admin_user(request)
    res = await db.quotes.delete_one({"reference": reference.strip().upper()})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quote not found")
    return {"message": "Quote deleted", "reference": reference.strip().upper()}


# ----------------------------- Admin: team -----------------------------

@router.get("/admin/admins")
async def list_admins(request: Request):
    await get_admin_user(request)
    removed = {r["email"] async for r in db.admin_removals.find({}, {"_id": 0, "email": 1})}
    extra = await db.admins.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    builtin = [{"email": e, "builtin": True, "added_by": None, "created_at": None} for e in sorted(ADMIN_EMAILS) if e not in removed]
    return {"admins": builtin + [{**a, "builtin": False} for a in extra if a["email"] not in ADMIN_EMAILS]}


@router.post("/admin/admins")
async def add_admin(payload: AdminEmailIn, request: Request):
    user = await get_admin_user(request)
    email = payload.email.lower().strip()

    # Optional: create/update an email+password login so this admin doesn't need Google
    if payload.password:
        validate_password_strength(payload.password)
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        if existing_user:
            await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(payload.password)}})
        else:
            await db.users.insert_one({
                "user_id": f"user_{uuid.uuid4().hex[:12]}",
                "email": email,
                "name": payload.name.strip() or email.split("@")[0],
                "picture": "",
                "password_hash": hash_password(payload.password),
                "auth_provider": "password",
                "created_at": now_iso(),
            })

    if email in ADMIN_EMAILS:
        # Re-adding a built-in admin clears any previous removal
        res = await db.admin_removals.delete_many({"email": email})
        if res.deleted_count:
            return {"email": email, "added_by": user["email"], "created_at": now_iso(), "builtin": True}
        if not payload.password:
            raise HTTPException(status_code=400, detail="This email is already an admin")
        return {"email": email, "added_by": user["email"], "created_at": now_iso(), "builtin": True}
    existing_admin = await db.admins.find_one({"email": email}, {"_id": 0})
    if existing_admin and not payload.password:
        raise HTTPException(status_code=400, detail="This email is already an admin")
    if not existing_admin:
        doc = {"id": str(uuid.uuid4()), "email": email, "added_by": user["email"], "created_at": now_iso()}
        await db.admins.insert_one(doc)
    return {"email": email, "added_by": user["email"], "created_at": now_iso(), "builtin": False}


@router.delete("/admin/admins/{email}")
async def remove_admin(email: str, request: Request):
    user = await get_admin_user(request)
    e = email.lower().strip()
    if e == user["email"].lower():
        raise HTTPException(status_code=400, detail="You cannot remove your own admin access")
    if e in ADMIN_EMAILS:
        await db.admin_removals.update_one(
            {"email": e},
            {"$set": {"email": e, "removed_by": user["email"], "created_at": now_iso()}},
            upsert=True,
        )
        await db.admins.delete_many({"email": e})
        return {"message": "Admin removed", "email": e}
    res = await db.admins.delete_one({"email": e})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin removed", "email": e}


# ----------------------------- Admin: sales & stats -----------------------------

@router.get("/admin/sales/all")
async def list_all_sales(request: Request):
    await get_admin_user(request)
    return await db.sales.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)


@router.post("/admin/sales")
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


@router.delete("/admin/sales/{sale_id}")
async def delete_sale(sale_id: str, request: Request):
    await get_admin_user(request)
    res = await db.sales.delete_one({"id": sale_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sale not found")
    return {"message": "Sale removed"}


@router.get("/admin/stats")
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
