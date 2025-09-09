import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .routers import image_utils, pdf_unlock, text_utils


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""

    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
        docs_url=settings.docs_url,
        redoc_url=settings.redoc_url,
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )

    # Include utility routers
    app.include_router(
        pdf_unlock.router, prefix=settings.api_prefix, tags=["PDF Unlock"]
    )
    app.include_router(
        text_utils.router, prefix=settings.api_prefix, tags=["Text Utilities"]
    )
    app.include_router(
        image_utils.router, prefix=settings.api_prefix, tags=["Image Utilities"]
    )

    # Root endpoint
    @app.get("/", summary="API Information", tags=["General"])
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
                    "name": "PDF Unlock",
                    "endpoint": f"{settings.api_prefix}/pdf/unlock",
                    "description": "Unlock password-protected PDF files",
                },
                {
                    "name": "Text Utilities",
                    "endpoint": f"{settings.api_prefix}/text-utils",
                    "description": "Various text processing utilities (hashing, encoding, etc.)",
                },
                {
                    "name": "Image Utilities",
                    "endpoint": f"{settings.api_prefix}/image-utils",
                    "description": "Various image processing utilities (resize, convert, etc.)",
                },
            ],
        }

    # Health check endpoint
    @app.get("/health", summary="Health Check", tags=["General"])
    async def health_check():
        return {
            "status": "healthy",
            "version": settings.app_version,
            "service": settings.app_name,
        }

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request, exc):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "An unexpected error occurred",
                "error_type": "internal_server_error",
            },
        )

    return app


# Create the app instance
app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "src.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
