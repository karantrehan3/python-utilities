from typing import List, Optional

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


class CropFileRequest(ImageFileRequest):
    """Request model for image crop operations with file upload"""

    left: int = Field(..., description="Left pixel coordinate of crop box", ge=0)
    top: int = Field(..., description="Top pixel coordinate of crop box", ge=0)
    right: int = Field(..., description="Right pixel coordinate of crop box", gt=0)
    bottom: int = Field(..., description="Bottom pixel coordinate of crop box", gt=0)

    @model_validator(mode="after")
    def validate_crop_box(self):
        """Ensure crop box coordinates are valid"""
        if self.right <= self.left:
            raise ValueError("right must be greater than left")
        if self.bottom <= self.top:
            raise ValueError("bottom must be greater than top")
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
                "left": 10,
                "top": 10,
                "right": 200,
                "bottom": 200,
            }
        }
    }


class RotateFileRequest(ImageFileRequest):
    """Request model for image rotate operations with file upload"""

    angle: int = Field(..., description="Rotation angle in degrees")
    flip_horizontal: bool = Field(
        False, description="Flip image horizontally after rotation"
    )
    flip_vertical: bool = Field(
        False, description="Flip image vertically after rotation"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
                "angle": 90,
                "flip_horizontal": False,
                "flip_vertical": False,
            }
        }
    }


COMPRESS_FORMATS: List[str] = ["JPEG", "WEBP"]


class CompressFileRequest(ImageFileRequest):
    """Request model for image compress operations with file upload"""

    quality: int = Field(
        80,
        description="Compression quality (1-100)",
        ge=1,
        le=100,
    )
    format: str = Field("JPEG", description="Output format (JPEG or WEBP)")

    @field_validator("format")
    @classmethod
    def validate_compress_format(cls, v: str) -> str:
        """Only JPEG and WEBP support quality-based compression"""
        if v.upper() not in COMPRESS_FORMATS:
            raise ValueError(f"Compress format must be one of {COMPRESS_FORMATS}")
        return v.upper()

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "JPEG",
                "quality": 80,
            }
        }
    }


class ImageCompressResponse(ImageResponse):
    """Response model for image compress operations"""

    original_size: int = Field(..., description="Original file size in bytes")
    compressed_size: int = Field(..., description="Compressed file size in bytes")

    model_config = {
        "json_schema_extra": {
            "example": {
                "result": "base64_encoded_image_data",
                "format": "JPEG",
                "size": 512,
                "original_size": 2048,
                "compressed_size": 512,
            }
        }
    }


class AdjustFileRequest(ImageFileRequest):
    """Request model for image adjustment operations with file upload"""

    brightness: float = Field(
        1.0,
        description="Brightness factor (1.0 = no change)",
        gt=0,
    )
    contrast: float = Field(
        1.0,
        description="Contrast factor (1.0 = no change)",
        gt=0,
    )
    saturation: float = Field(
        1.0,
        description="Saturation factor (1.0 = no change)",
        gt=0,
    )
    sharpness: float = Field(
        1.0,
        description="Sharpness factor (1.0 = no change)",
        gt=0,
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "format": "PNG",
                "brightness": 1.2,
                "contrast": 1.1,
                "saturation": 1.0,
                "sharpness": 1.0,
            }
        }
    }
