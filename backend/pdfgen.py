from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

INK = (0.114, 0.114, 0.122)
ORANGE = (1.0, 0.478, 0.0)
MUTE = (0.525, 0.525, 0.545)
PAPER = (0.961, 0.961, 0.969)


def build_quote_pdf(doc: dict) -> bytes:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    w, h = A4

    c.setFillColorRGB(*INK)
    c.rect(0, h - 42 * mm, w, 42 * mm, fill=1, stroke=0)
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(20 * mm, h - 22 * mm, "iMagine Store")
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(20 * mm, h - 29 * mm, "OFFICIAL QUOTATION")
    c.setFillColorRGB(0.75, 0.75, 0.78)
    c.setFont("Helvetica", 9)
    c.drawString(20 * mm, h - 35 * mm, "Apple Reseller & Apple Service Centre - Westville, Durban, South Africa")
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 13)
    c.drawRightString(w - 20 * mm, h - 22 * mm, doc["reference"])

    y = h - 58 * mm
    c.setFillColorRGB(*MUTE)
    c.setFont("Helvetica", 8)
    c.drawString(20 * mm, y, "PREPARED FOR")
    c.drawString(110 * mm, y, "DATE")
    y -= 6 * mm
    c.setFillColorRGB(*INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(20 * mm, y, doc.get("name", ""))
    c.setFont("Helvetica", 10)
    date_str = (doc.get("updated_at") or doc.get("created_at") or "")[:10]
    c.drawString(110 * mm, y, date_str)
    y -= 5 * mm
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(*MUTE)
    c.drawString(20 * mm, y, doc.get("email", ""))

    y -= 14 * mm
    c.setFillColorRGB(*PAPER)
    c.roundRect(20 * mm, y - 52 * mm, w - 40 * mm, 52 * mm, 4 * mm, fill=1, stroke=0)
    ty = y - 10 * mm
    c.setFillColorRGB(*MUTE)
    c.setFont("Helvetica", 8)
    c.drawString(26 * mm, ty, "ITEM")
    ty -= 7 * mm
    c.setFillColorRGB(*INK)
    c.setFont("Helvetica-Bold", 14)
    if doc.get("type") == "repair":
        title = f"{doc.get('device', '')} repair"
        if doc.get("model"):
            title += f" - {doc['model']}"
    else:
        title = doc.get("model") or doc.get("category", "")
    c.drawString(26 * mm, ty, title[:60])
    ty -= 7 * mm
    c.setFont("Helvetica", 9)
    c.setFillColorRGB(*MUTE)
    details = []
    if doc.get("type") == "repair":
        details = [f"Issue: {doc.get('issue', '')}", f"Service: {doc.get('service_mode', '')}"]
    else:
        if doc.get("storage"):
            details.append(f"Storage: {doc['storage']}")
        details.append(f"Trade-in: {'Yes' if doc.get('trade_in') else 'No'}")
        if doc.get("accessories"):
            details.append("Extras: " + ", ".join(doc["accessories"]))
    for line in details:
        c.drawString(26 * mm, ty, line[:90])
        ty -= 5 * mm

    ty -= 6 * mm
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(26 * mm, ty, "QUOTED PRICE")
    ty -= 8 * mm
    c.setFont("Helvetica-Bold", 22)
    c.drawString(26 * mm, ty, doc.get("quote_price", ""))
    if doc.get("quote_note"):
        ty -= 7 * mm
        c.setFillColorRGB(*INK)
        c.setFont("Helvetica", 9)
        c.drawString(26 * mm, ty, doc["quote_note"][:95])

    y -= 62 * mm
    c.setFillColorRGB(*MUTE)
    c.setFont("Helvetica", 8)
    c.drawString(20 * mm, y, "Status: " + doc.get("status", ""))

    c.setFillColorRGB(*INK)
    c.rect(0, 0, w, 22 * mm, fill=1, stroke=0)
    c.setFillColorRGB(0.75, 0.75, 0.78)
    c.setFont("Helvetica", 7.5)
    c.drawString(20 * mm, 13 * mm, "This quotation was issued by iMagine Store (Pty) Ltd. Pricing as confirmed by the team; validity per the note above.")
    c.drawString(20 * mm, 8 * mm, "imaginestore.co.za - Educate. Innovate. Entertain.")
    c.setFillColorRGB(*ORANGE)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(w - 20 * mm, 10 * mm, doc["reference"])

    c.showPage()
    c.save()
    return buf.getvalue()
