import os
import re
import ipaddress
import logging
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Emergent managed email proxy. CONSTANT — never read from os.environ.
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {e}")
        raise


def _rows_html(rows: list[tuple[str, str]]) -> str:
    cells = "".join(
        f'<tr><td style="padding:8px 12px;font-size:13px;color:#86868B;white-space:nowrap;vertical-align:top">{escape(k)}</td>'
        f'<td style="padding:8px 12px;font-size:13px;color:#1D1D1F;font-weight:600">{escape(v or "—")}</td></tr>'
        for k, v in rows
    )
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
        'style="border:1px solid #eee;border-radius:12px;background:#FAFAFB">' + cells + "</table>"
    )


def _shell(title: str, body: str) -> str:
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F7;padding:32px 12px">'
        '<tr><td align="center"><table role="presentation" width="560" cellpadding="0" cellspacing="0" '
        'style="background:#FFFFFF;border-radius:16px;padding:32px;font-family:Arial,sans-serif">'
        f'<tr><td><p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#FF7A00;font-weight:700">{escape(EMAIL_FROM_NAME)}</p>'
        f'<h1 style="margin:12px 0 20px;font-size:22px;color:#1D1D1F">{escape(title)}</h1>'
        f"{body}"
        f'<p style="margin:28px 0 0;font-size:11px;color:#86868B">Sent by the {escape(EMAIL_FROM_NAME)} website. '
        "We never ask for passwords or card details by email.</p>"
        "</td></tr></table></td></tr></table>"
    )


async def notify_team(subject: str, rows: list[tuple[str, str]]) -> None:
    to = os.environ.get("TEAM_NOTIFY_EMAIL")
    if not to:
        logger.warning("TEAM_NOTIFY_EMAIL not set; skipping team notification")
        return
    try:
        await send_email(to=to, subject=subject, html=_shell(subject, _rows_html(rows)))
    except Exception:
        logger.exception("Team notification failed")


async def notify_customer(to_email: str, name: str, subject: str, reference: str, summary_rows: list[tuple[str, str]]) -> None:
    first = escape((name or "").split(" ")[0] or "there")
    body = (
        f'<p style="font-size:14px;color:#1D1D1F;line-height:1.6">Hi {first}, thanks for reaching out to '
        f"{escape(EMAIL_FROM_NAME)}. Your request has been received and the team will get back to you shortly.</p>"
        f'<p style="margin:18px 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#86868B">Your reference</p>'
        f'<p style="margin:0 0 18px;font-size:20px;font-weight:700;color:#FF7A00;letter-spacing:2px">{escape(reference)}</p>'
        + _rows_html(summary_rows)
    )
    try:
        await send_email(to=to_email, subject=subject, html=_shell(subject, body))
    except Exception:
        logger.exception("Customer confirmation failed")
