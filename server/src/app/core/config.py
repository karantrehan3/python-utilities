from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # API Configuration
    app_name: str = "Python Utilities API"
    app_version: str = "1.0.0"
    app_description: str = "A unified API server for various Python utilities"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 4001
    debug: bool = False

    # CORS Configuration
    cors_origins: List[str] = ["*"]
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["*"]
    cors_allow_headers: List[str] = ["*"]

    # API Configuration
    api_prefix: str = "/api/v1"
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"

    model_config = {"env_file": ".env", "case_sensitive": False}


# Global settings instance
settings = Settings()
