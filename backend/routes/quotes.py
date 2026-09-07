# QUOTE ROUTES — product & repair quote submission, repair status, customer accept/decline, PDFs.
import asyncio
import uuid

from fastapi import APIRouter, HTTPException, Request, Response

from auth import get_current_user, get_optional_user, owns_quote
from database import db
from mailer import notify_customer, notify_team
from models import ProductQuote, RepairQuote
from pdfgen import build_quote_pdf
from utils import now_iso, ref_code

router = APIRouter()


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
