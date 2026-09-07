# MODELS — request/response shapes (Pydantic) for every API endpoint.
from typing import List

from pydantic import BaseModel, EmailStr


class ProductQuote(BaseModel):
    category: str
    model: str = ""
    storage: str = ""
    color: str = ""
    condition: str = ""
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


class SessionExchange(BaseModel):
    session_id: str


class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str


class StatusUpdate(BaseModel):
    status: str
    price: str = ""
    note: str = ""


class AdminEmailIn(BaseModel):
    email: EmailStr
    password: str = ""
    name: str = ""


class SaleIn(BaseModel):
    name: str
    price: str
    was_price: str = ""
    description: str = ""
    image: str = ""
    starts_at: str = ""
    ends_at: str = ""
