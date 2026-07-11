from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class ImageRequest(BaseModel):
    """Request model for image operations with multiple input types"""

    # Base64 encoded image data
    image_data: Optional[str] = Field(
        None, description="Base64 encoded image data", min_length=1
    )

    # Image URL
    image_url: Optional[str] = Field(None, description="URL to image file")

    # Image format
    format: str = Field("PNG", description="Image format")

    @field_validator("image_url")
    @classmethod
    def validate_url(cls, v):
        """Validate URL format"""
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v

    @model_validator(mode="after")
    def validate_input_sources(self):
        """Ensure at least one input source is provided"""
        if not self.image_data and not self.image_url:
            raise ValueError("Either image_data or image_url must be provided")
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                "format": "PNG",
            }
        }
    }


class ImageFileRequest(BaseModel):
    """Request model for file upload operations"""

    format: str = Field("PNG", description="Image format")

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
            }
        }
    }


class ImageResponse(BaseModel):
    """Response model for image operations"""

    result: str = Field(..., description="Base64 encoded result image")
    format: str = Field(..., description="Image format")
    size: int = Field(..., description="Size in bytes")

    model_config = {
        "json_schema_extra": {
            "example": {
                "result": "base64_encoded_image_data",
                "format": "PNG",
                "size": 1024,
            }
        }
    }


class ResizeRequest(ImageRequest):
    """Request model for image resize operations"""

    width: int = Field(..., description="Target width in pixels", gt=0)
    height: int = Field(..., description="Target height in pixels", gt=0)
    maintain_aspect_ratio: bool = Field(
        True, description="Whether to maintain aspect ratio"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                "format": "PNG",
                "width": 100,
                "height": 100,
                "maintain_aspect_ratio": True,
            }
        }
    }


class ResizeFileRequest(ImageFileRequest):
    """Request model for image resize operations with file upload"""

    width: int = Field(..., description="Target width in pixels", gt=0)
    height: int = Field(..., description="Target height in pixels", gt=0)
    maintain_aspect_ratio: bool = Field(
        True, description="Whether to maintain aspect ratio"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
                "width": 100,
                "height": 100,
                "maintain_aspect_ratio": True,
            }
        }
    }


class ConvertRequest(ImageRequest):
    """Request model for image convert operations"""

    target_format: str = Field(..., description="Target image format")

    model_config = {
        "json_schema_extra": {
            "example": {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                "format": "PNG",
                "target_format": "JPEG",
            }
        }
    }


class ConvertFileRequest(ImageFileRequest):
    """Request model for image convert operations with file upload"""

    target_format: str = Field(..., description="Target image format")

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
                "target_format": "JPEG",
            }
        }
    }


class ImageInfoRequest(ImageRequest):
    """Request model for image info operations"""

    model_config = {
        "json_schema_extra": {
            "example": {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            }
        }
    }


class ImageInfoFileRequest(ImageFileRequest):
    """Request model for image info operations with file upload"""

    model_config = {"json_schema_extra": {"example": {}}}


class ImageInfoResponse(BaseModel):
    """Response model for image info operations"""

    format: str = Field(..., description="Image format")
    size: int = Field(..., description="File size in bytes")
    dimensions: str = Field(..., description="Image dimensions as 'width x height'")
    width: int = Field(..., description="Image width in pixels")
    height: int = Field(..., description="Image height in pixels")

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
                "size": 1024,
                "dimensions": "100x100",
                "width": 100,
                "height": 100,
            }
        }
    }
