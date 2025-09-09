import asyncio
import os
import tempfile
from typing import Any, Dict, Optional

from fastapi import HTTPException


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
    """Custom processing error for utilities"""

    def __init__(self, message: str, error_code: str = "PROCESSING_ERROR"):
        super().__init__(
            status_code=500,
            detail={
                "message": message,
                "error_code": error_code,
                "error_type": "processing_error",
            },
        )
