import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.app.core.config import settings
from src.app.routes import router as api_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""

    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
        # Only expose interactive docs / schema when debugging.
        docs_url=settings.docs_url if settings.debug else None,
        redoc_url=settings.redoc_url if settings.debug else None,
        openapi_url="/openapi.json" if settings.debug else None,
    )

    # Reject oversized request bodies early (defense against memory-exhaustion
    # DoS). This complements the nginx client_max_body_size for setups where the
    # app is reachable directly.
    @app.middleware("http")
    async def limit_upload_size(request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.max_upload_bytes:
            return JSONResponse(
                status_code=413,
                content={
                    "detail": {
                        "message": (
                            "File too large. Maximum upload size is "
                            f"{settings.max_upload_bytes // (1024 * 1024)} MB."
                        ),
                        "error_type": "payload_too_large",
                    }
                },
            )
        return await call_next(request)

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods,
        allow_headers=settings.cors_allow_headers,
    )

    # Include API router
    app.include_router(api_router)

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
        "src.app.server:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
