from typing import Any, Dict

from pydantic import BaseModel

from ..dependencies.common import ProcessingError, ValidationError
from .base import BaseUtilityRouter, UtilityInfo


class ImageRequest(BaseModel):
    """Request model for image operations"""

    image_data: str  # Base64 encoded image
    format: str = "PNG"  # Output format

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

    result: str  # Base64 encoded result
    format: str
    size: int  # Size in bytes

    model_config = {
        "json_schema_extra": {
            "example": {
                "result": "base64_encoded_image_data",
                "format": "PNG",
                "size": 1024,
            }
        }
    }


class ImageUtilsRouter(BaseUtilityRouter):
    """Image utilities router"""

    def __init__(self):
        super().__init__(prefix="/image-utils", tags=["Image Utilities"])

    def get_utility_info(self) -> Dict[str, Any]:
        """Return information about the image utilities"""
        info = UtilityInfo(
            name="Image Utilities",
            description="Various image processing utilities (resize, convert, etc.)",
            version="1.0.0",
            endpoints=[
                {
                    "name": "resize",
                    "description": "POST /resize - Resize image to specified dimensions",
                },
                {
                    "name": "convert",
                    "description": "POST /convert - Convert image to different format",
                },
                {"name": "info", "description": "POST /info - Get image information"},
            ],
        )
        return info.to_dict()

    def _setup_routes(self) -> None:
        """Setup the routes for image utilities"""
        self._add_info_route()
        self._add_resize_route()
        self._add_convert_route()
        self._add_image_info_route()

    def _add_resize_route(self) -> None:
        """Add image resize route"""

        class ResizeRequest(ImageRequest):
            width: int
            height: int

            model_config = {
                "json_schema_extra": {
                    "example": {
                        "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                        "format": "PNG",
                        "width": 100,
                        "height": 100,
                    }
                }
            }

        @self.router.post(
            "/resize",
            response_model=ImageResponse,
            summary="Resize Image",
            description="Resize image to specified dimensions",
        )
        async def resize_image(request: ResizeRequest):
            """Resize image to specified dimensions"""
            try:
                if not request.image_data.strip():
                    raise ValidationError("Image data cannot be empty", "image_data")

                if request.width <= 0 or request.height <= 0:
                    raise ValidationError("Width and height must be positive", "width")

                # For demo purposes, just return the original image with metadata
                # In a real implementation, you would use PIL or similar
                return ImageResponse(
                    result=request.image_data,
                    format=request.format,
                    size=len(request.image_data),
                )
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error resizing image: {str(e)}")

    def _add_convert_route(self) -> None:
        """Add image convert route"""

        class ConvertRequest(ImageRequest):
            target_format: str

            model_config = {
                "json_schema_extra": {
                    "example": {
                        "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
                        "format": "PNG",
                        "target_format": "JPEG",
                    }
                }
            }

        @self.router.post(
            "/convert",
            response_model=ImageResponse,
            summary="Convert Image",
            description="Convert image to different format",
        )
        async def convert_image(request: ConvertRequest):
            """Convert image to different format"""
            try:
                if not request.image_data.strip():
                    raise ValidationError("Image data cannot be empty", "image_data")

                valid_formats = ["PNG", "JPEG", "GIF", "BMP"]
                if request.target_format.upper() not in valid_formats:
                    raise ValidationError(
                        f"Target format must be one of: {valid_formats}",
                        "target_format",
                    )

                # For demo purposes, just return the original image with new format
                # In a real implementation, you would use PIL or similar
                return ImageResponse(
                    result=request.image_data,
                    format=request.target_format.upper(),
                    size=len(request.image_data),
                )
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error converting image: {str(e)}")

    def _add_image_info_route(self) -> None:
        """Add image info route"""

        class ImageInfoRequest(BaseModel):
            image_data: str

            model_config = {
                "json_schema_extra": {
                    "example": {
                        "image_data": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                    }
                }
            }

        class ImageInfoResponse(BaseModel):
            format: str
            size: int
            dimensions: str  # "width x height"

            model_config = {
                "json_schema_extra": {
                    "example": {"format": "PNG", "size": 1024, "dimensions": "100x100"}
                }
            }

        @self.router.post(
            "/info",
            response_model=ImageInfoResponse,
            summary="Image Info",
            description="Get image information",
        )
        async def get_image_info(request: ImageInfoRequest):
            """Get image information"""
            try:
                if not request.image_data.strip():
                    raise ValidationError("Image data cannot be empty", "image_data")

                # For demo purposes, return mock data
                # In a real implementation, you would analyze the actual image
                return ImageInfoResponse(
                    format="PNG", size=len(request.image_data), dimensions="100x100"
                )
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error getting image info: {str(e)}")


# Create the router instance
image_utils_router = ImageUtilsRouter()
router = image_utils_router.router
