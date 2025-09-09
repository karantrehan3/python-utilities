from fastapi import APIRouter

from src.app.routes.api.v1 import router as v1_router

# Create the API router
router = APIRouter()

# Include v1 router with /v1 prefix
router.include_router(v1_router, prefix="/v1")
