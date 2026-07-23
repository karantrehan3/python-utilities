from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # API Configuration
    app_name: str = "Kiln API"
    app_version: str = "1.0.0"
    app_description: str = "A full-stack file and text processing toolkit API"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 4001
    debug: bool = False

    # CORS Configuration.
    # No credentials are used (no cookies/auth), so a wildcard origin is safe;
    # set CORS_ORIGINS (comma-separated) to lock this down to your domains.
    cors_origins: List[str] = ["*"]
    cors_allow_credentials: bool = False
    cors_allow_methods: List[str] = ["GET", "POST", "OPTIONS"]
    cors_allow_headers: List[str] = ["*"]

    # Limits (defense against resource-exhaustion DoS)
    max_upload_bytes: int = 50 * 1024 * 1024  # 50 MB, mirrors the nginx cap
    max_pdf_pages: int = 2000  # cap fan-out operations (split, to-images)
    max_image_pixels: int = 64_000_000  # ~64 MP, Pillow decompression-bomb guard

    # API Configuration
    api_prefix: str = "/api/v1"
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"

    model_config = {"env_file": ".env", "case_sensitive": False}


# Global settings instance
settings = Settings()
