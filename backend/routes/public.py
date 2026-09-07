# PUBLIC ROUTES — health check and the currently-live sales shown on the site.
from fastapi import APIRouter

from database import db
from utils import sale_window_query

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "iMagine Store API"}


@router.get("/sales")
async def list_sales():
    return await db.sales.find(sale_window_query(), {"_id": 0}).sort("created_at", -1).to_list(50)
