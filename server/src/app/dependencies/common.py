import asyncio
import ipaddress
import logging
import os
import socket
import tempfile
from typing import Any, Dict, Optional
from urllib.parse import urlparse

from fastapi import HTTPException

logger = logging.getLogger("kiln")


class UtilityResponse:
    """Standard response format for utilities"""

    @staticmethod
    def success(
        data: Any, message: str = "Operation completed successfully"
    ) -> Dict[str, Any]:
        return {"success": True, "message": message, "data": data}

    @staticmethod
    def error(message: str, error_code: str = "UTILITY_ERROR") -> Dict[str, Any]:
        return {"success": False, "message": message, "error_code": error_code}


class FileHandler:
    """Common file handling utilities"""

    @staticmethod
    async def cleanup_temp_files(*file_paths: str) -> None:
        """Clean up temporary files after a short delay"""
        await asyncio.sleep(1)  # Give time for response to be sent
        for file_path in file_paths:
            try:
                if file_path and os.path.exists(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error cleaning up temp file {file_path}: {e}")

    @staticmethod
    def create_temp_file(suffix: str = "", prefix: str = "temp_") -> str:
        """Create a temporary file and return its path"""
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, suffix=suffix, prefix=prefix
        )
        temp_file.close()
        return temp_file.name


class ValidationError(HTTPException):
    """Custom validation error for utilities"""

    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(
            status_code=400,
            detail={
                "message": message,
                "field": field,
                "error_type": "validation_error",
            },
        )


class ProcessingError(HTTPException):
    """Custom processing error for utilities.

    The detailed message is logged server-side only; the client receives a
    generic message so internal paths and library internals are never leaked.
    """

    def __init__(self, message: str, error_code: str = "PROCESSING_ERROR"):
        logger.error("ProcessingError [%s]: %s", error_code, message)
        super().__init__(
            status_code=500,
            detail={
                "message": "An error occurred while processing your request.",
                "error_code": error_code,
                "error_type": "processing_error",
            },
        )


def validate_public_url(url: str) -> None:
    """Guard against SSRF: allow only http(s) URLs that resolve to public IPs.

    Rejects loopback, private, link-local (incl. cloud metadata 169.254.169.254),
    reserved, and multicast addresses. Raises ValidationError if disallowed.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValidationError("URL must use http or https.", "image_url")
    host = parsed.hostname
    if not host:
        raise ValidationError("URL has no host.", "image_url")

    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        raise ValidationError("Could not resolve URL host.", "image_url")

    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or ip.is_unspecified
        ):
            raise ValidationError(
                "URL resolves to a disallowed (non-public) address.", "image_url"
            )
