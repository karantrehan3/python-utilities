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

    # CORS Configuration. These are plain comma-separated strings so they are
    # trivial to set/update via a single env var on any host (e.g. Render):
    #   CORS_ORIGINS=https://kiln-5r16.onrender.com,https://your-new-name.com
    # No credentials are used (no cookies/auth), so the "*" default is safe.
    cors_origins: str = "*"
    cors_allow_credentials: bool = False
    cors_allow_methods: str = "GET,POST,OPTIONS"
    cors_allow_headers: str = "*"
    # Response headers the browser is allowed to read cross-origin (needed so
    # download filenames and compression stats work when UI and API differ).
    cors_expose_headers: str = "Content-Disposition,X-Original-Size,X-Compressed-Size"

    # Limits (defense against resource-exhaustion DoS)
    max_upload_bytes: int = 50 * 1024 * 1024  # 50 MB, mirrors the nginx cap
    max_pdf_pages: int = 2000  # cap fan-out operations (split, to-images)
    max_image_pixels: int = 64_000_000  # ~64 MP, Pillow decompression-bomb guard

    # API Configuration
    api_prefix: str = "/api/v1"
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"

    model_config = {"env_file": ".env", "case_sensitive": False}

    @staticmethod
    def _csv(raw: str) -> List[str]:
        return [item.strip() for item in raw.split(",") if item.strip()]

    @property
    def cors_origins_list(self) -> List[str]:
        return self._csv(self.cors_origins)

    @property
    def cors_allow_methods_list(self) -> List[str]:
        return self._csv(self.cors_allow_methods)

    @property
    def cors_allow_headers_list(self) -> List[str]:
        return self._csv(self.cors_allow_headers)

    @property
    def cors_expose_headers_list(self) -> List[str]:
        return self._csv(self.cors_expose_headers)


# Global settings instance
settings = Settings()
