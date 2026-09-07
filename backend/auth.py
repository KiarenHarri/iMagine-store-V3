# AUTH — sessions, Google OAuth 2.0, email/password login, password reset, access guards.
import asyncio
import os
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import RedirectResponse

from database import db, is_admin_email
from mailer import send_password_reset
from models import ForgotIn, LoginIn, RegisterIn, ResetIn
from security import (
    check_lockout,
    hash_password,
    record_failed_login,
    validate_password_strength,
    verify_password,
)
from utils import now_iso

router = APIRouter()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


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
    return {**user, "is_admin": await is_admin_email(user["email"])}


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


async def get_admin_user(request: Request):
    user = await get_current_user(request)
    if not await is_admin_email(user["email"]):
        raise HTTPException(status_code=403, detail="Team access only")
    return user


def owns_quote(doc: dict, user: dict) -> bool:
    return doc.get("user_id") == user["user_id"] or (doc.get("email") or "").lower() == user["email"].lower()


@router.get("/auth/google")
async def google_login():
    if not (GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI):
        return RedirectResponse(f"{FRONTEND_URL}/account?auth_error=google-not-configured")
    state = secrets.token_urlsafe(16)
    params = urlencode({
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "prompt": "select_account",
        "state": state,
    })
    resp = RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")
    resp.set_cookie("oauth_state", state, httponly=True, secure=True, samesite="lax", max_age=600, path="/")
    return resp


@router.get("/auth/google/callback")
async def google_callback(request: Request):
    if request.query_params.get("state") != request.cookies.get("oauth_state"):
        raise HTTPException(status_code=400, detail="Invalid sign-in state — please try again")
    code = request.query_params.get("code", "")
    token_res = await asyncio.to_thread(
        lambda: requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            timeout=15,
        )
    )
    tokens = token_res.json()
    if "access_token" not in tokens:
        raise HTTPException(status_code=401, detail="Google sign-in failed")
    info_res = await asyncio.to_thread(
        lambda: requests.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
            timeout=15,
        )
    )
    data = info_res.json()
    email = data["email"].lower().strip()
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
    token = "sess_" + uuid.uuid4().hex
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })
    resp = RedirectResponse(f"{FRONTEND_URL}/account")
    resp.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600,
    )
    resp.delete_cookie("oauth_state", path="/")
    return resp


@router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    name = payload.name.strip()
    validate_password_strength(payload.password)
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


@router.post("/auth/login")
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


@router.post("/auth/forgot-password")
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


@router.post("/auth/reset-password")
async def reset_password(payload: ResetIn):
    validate_password_strength(payload.password)
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


@router.get("/auth/me")
async def auth_me(request: Request):
    user = await get_current_user(request)
    return {**user, "is_admin": await is_admin_email(user["email"])}


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    auth = request.headers.get("Authorization")
    if not token and auth and auth.startswith("Bearer "):
        token = auth.split(" ", 1)[1]
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", secure=True, samesite="none")
    return {"message": "Logged out"}
