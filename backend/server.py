# BACKEND ENTRYPOINT — builds the FastAPI app, mounts the routers, CORS, startup/shutdown.
# Code map for the whole project: /app/README.md
#
# Files:
#   server.py    this entrypoint
#   database.py  env config + MongoDB + admin check
#   models.py    request/response shapes
#   auth.py      sessions, Google OAuth, email/password, password rules
#   routes.py    all endpoints (public, quotes, contact, admin)
#   mailer.py    outgoing email   ·   pdfgen.py   quote PDFs   ·   utils.py   small helpers
import logging
import os

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

import database  # noqa: F401  (loads .env first)
from database import client, db
from auth import router as auth_router
from routes import router as api_router

app = FastAPI()

app.include_router(api_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

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
