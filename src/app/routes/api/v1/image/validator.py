from pydantic import BaseModel, Field


class ImageRequest(BaseModel):
    """Request model for image operations"""

    image_data: str = Field(..., description="Base64 encoded image data", min_length=1)
    format: str = Field("PNG", description="Image format")

    model_config = {
        "json_schema_extra": {
            "example": {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
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


class ImageInfoRequest(BaseModel):
    """Request model for image info operations"""

    image_data: str = Field(..., description="Base64 encoded image data", min_length=1)

    model_config = {
        "json_schema_extra": {
            "example": {
                "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            }
        }
    }


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
