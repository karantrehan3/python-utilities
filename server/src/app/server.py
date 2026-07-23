import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from src.app.core.config import settings
from src.app.routes import router as api_router


def _client_ip(request: Request) -> str:
    """Rate-limit key: the originating client IP. Behind Render/nginx the real
    IP is the left-most entry of X-Forwarded-For; fall back to the socket peer."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(
    key_func=_client_ip,
    default_limits=[settings.rate_limit],
    enabled=settings.rate_limit_enabled,
    headers_enabled=True,
)


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

    # Per-IP rate limiting. SlowAPIMiddleware applies the default limit to every
    # endpoint; since only server-side tools hit the API, client-side tools are
    # unaffected.
    app.state.limiter = limiter

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={
                "detail": {
                    "message": "Too many requests. Please slow down and try again shortly.",
                    "error_type": "rate_limited",
                }
            },
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

    # Rate-limit middleware (inner). Added before CORS so its 429 responses
    # still pass back out through CORS and get the cross-origin headers.
    app.add_middleware(SlowAPIMiddleware)

    # CORS middleware — added last so it is the outermost layer.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_allow_methods_list,
        allow_headers=settings.cors_allow_headers_list,
        expose_headers=settings.cors_expose_headers_list,
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
