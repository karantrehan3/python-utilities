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
