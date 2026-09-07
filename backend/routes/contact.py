# CONTACT ROUTE — contact form submissions.
import asyncio
import uuid

from fastapi import APIRouter

from database import db
from mailer import notify_customer, notify_team
from models import ContactMessage
from utils import now_iso, ref_code

router = APIRouter()


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
