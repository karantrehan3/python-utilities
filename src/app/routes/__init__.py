from fastapi import APIRouter

from src.app.core.config import settings
from src.app.routes.api import router as api_router

# Create the main router
router = APIRouter()

# Include API router with /api prefix
router.include_router(api_router, prefix="/api")


# Root endpoint
@router.get("/", summary="API Information", tags=["General"])
async def root():
    return {
        "message": f"{settings.app_name} is running",
        "version": settings.app_version,
        "api_prefix": settings.api_prefix,
        "documentation": {
            "swagger_ui": f"{settings.docs_url}",
            "redoc": f"{settings.redoc_url}",
        },
        "available_utilities": [
            {
                "name": "PDF Utilities",
                "endpoint": "/api/v1/pdf",
                "description": "Various PDF processing utilities (unlock, info, etc.)",
            },
            {
                "name": "Text Utilities",
                "endpoint": "/api/v1/text",
                "description": "Various text processing utilities (hashing, encoding, etc.)",
            },
            {
                "name": "Image Utilities",
                "endpoint": "/api/v1/image",
                "description": "Various image processing utilities (resize, convert, etc.)",
            },
        ],
    }


# Health check endpoint
@router.get("/health", summary="Health Check", tags=["General"])
async def health_check():
    return {
        "status": "healthy",
        "version": settings.app_version,
        "service": settings.app_name,
    }
