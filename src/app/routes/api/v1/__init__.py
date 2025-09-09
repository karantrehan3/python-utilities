from fastapi import APIRouter

from src.app.routes.api.v1.image import router as image_router
from src.app.routes.api.v1.pdf import router as pdf_router
from src.app.routes.api.v1.text import router as text_router

# Create the v1 router
router = APIRouter()

# Include all utility routers with their respective prefixes
router.include_router(pdf_router, prefix="/pdf", tags=["PDF Utilities"])
router.include_router(text_router, prefix="/text", tags=["Text Utilities"])
router.include_router(image_router, prefix="/image", tags=["Image Utilities"])
