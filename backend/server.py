# BACKEND ENTRYPOINT — builds the FastAPI app, mounts the route modules, CORS, startup/shutdown.
# Code map for the whole project: /app/README.md
#
# Layout:
#   config.py        environment + constants
#   database.py      MongoDB connection + admin check
#   models.py        request/response shapes
#   security.py      password hashing, strength rules, lockout
#   auth.py          sessions + sign-in routes + access guards
#   routes/          public, quotes, contact, admin endpoints
#   mailer.py        outgoing email   ·   pdfgen.py   quote PDFs
import logging
import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

import config  # noqa: F401  (loads .env first)
from database import client, db
from auth import router as auth_router
from routes.admin import router as admin_router
from routes.contact import router as contact_router
from routes.public import router as public_router
from routes.quotes import router as quotes_router

app = FastAPI()

for module_router in (public_router, quotes_router, contact_router, auth_router, admin_router):
    app.include_router(module_router, prefix="/api")

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
