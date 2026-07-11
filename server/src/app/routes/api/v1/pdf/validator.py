from typing import Optional

from pydantic import BaseModel, Field


class PDFInfoResponse(BaseModel):
    """Response model for PDF info operation"""

    page_count: int = Field(..., description="Number of pages in the PDF")
    is_encrypted: bool = Field(..., description="Whether the PDF is password protected")
    file_size: int = Field(..., description="File size in bytes")
    metadata: Optional[dict] = Field(None, description="PDF metadata if requested")

    model_config = {
        "json_schema_extra": {
            "example": {
                "page_count": 10,
                "is_encrypted": True,
                "file_size": 1024000,
                "metadata": {
                    "title": "Sample Document",
                    "author": "John Doe",
                    "creator": "PDF Creator",
                },
            }
        }
    }


class PDFCompressResponse(BaseModel):
    """Response model for PDF compress operation"""

    original_size: int = Field(..., description="Original file size in bytes")
    compressed_size: int = Field(..., description="Compressed file size in bytes")
    reduction_percent: float = Field(..., description="Size reduction percentage")

    model_config = {
        "json_schema_extra": {
            "example": {
                "original_size": 5242880,
                "compressed_size": 2621440,
                "reduction_percent": 50.0,
            }
        }
    }
