# ADMIN ROUTES — team console: submissions, statuses, quotes, admins, sales, stats.
import asyncio
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Request

from auth import get_admin_user
from config import ADMIN_EMAILS, STATUS_FLOWS
from database import db
from mailer import notify_status
from models import AdminEmailIn, SaleIn, StatusUpdate
from security import hash_password, validate_password_strength
from utils import now_iso, sale_window_query

router = APIRouter()


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
