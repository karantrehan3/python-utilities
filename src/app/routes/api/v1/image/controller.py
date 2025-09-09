from typing import Dict

from src.app.dependencies.common import ProcessingError, ValidationError
from src.app.routes.api.v1.image.validator import (
    ConvertRequest,
    ImageInfoRequest,
    ImageInfoResponse,
    ImageResponse,
    ResizeRequest,
)


class ImageController:
    """Controller for image utility operations"""

    SUPPORTED_FORMATS = ["PNG", "JPEG", "JPG", "GIF", "BMP", "WEBP"]

    @staticmethod
    async def resize_image(request: ResizeRequest) -> ImageResponse:
        """
        Resize image to specified dimensions.

        Args:
            request: Resize request containing image data and dimensions

        Returns:
            Resize response with the resized image
        """
        try:
            if not request.image_data.strip():
                raise ValidationError("Image data cannot be empty", "image_data")

            if request.width <= 0 or request.height <= 0:
                raise ValidationError("Width and height must be positive", "width")

            # Validate format
            if request.format.upper() not in ImageController.SUPPORTED_FORMATS:
                raise ValidationError(
                    f"Unsupported image format. Supported: {ImageController.SUPPORTED_FORMATS}",
                    "format",
                )

            # For demo purposes, just return the original image with metadata
            # In a real implementation, you would use PIL or similar
            return ImageResponse(
                result=request.image_data,
                format=request.format.upper(),
                size=len(request.image_data),
            )

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error resizing image: {str(e)}")

    @staticmethod
    async def convert_image(request: ConvertRequest) -> ImageResponse:
        """
        Convert image to different format.

        Args:
            request: Convert request containing image data and target format

        Returns:
            Convert response with the converted image
        """
        try:
            if not request.image_data.strip():
                raise ValidationError("Image data cannot be empty", "image_data")

            # Validate formats
            if request.format.upper() not in ImageController.SUPPORTED_FORMATS:
                raise ValidationError(
                    f"Unsupported source format. Supported: {ImageController.SUPPORTED_FORMATS}",
                    "format",
                )

            if request.target_format.upper() not in ImageController.SUPPORTED_FORMATS:
                raise ValidationError(
                    f"Unsupported target format. Supported: {ImageController.SUPPORTED_FORMATS}",
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

    @staticmethod
    async def get_image_info(request: ImageInfoRequest) -> ImageInfoResponse:
        """
        Get information about an image.

        Args:
            request: Image info request containing image data

        Returns:
            Image info response with image details
        """
        try:
            if not request.image_data.strip():
                raise ValidationError("Image data cannot be empty", "image_data")

            # For demo purposes, return mock data
            # In a real implementation, you would analyze the actual image
            return ImageInfoResponse(
                format="PNG",
                size=len(request.image_data),
                dimensions="100x100",
                width=100,
                height=100,
            )

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error getting image info: {str(e)}")

    @staticmethod
    def get_supported_formats() -> Dict[str, str]:
        """Get list of supported image formats"""
        return {fmt: fmt.upper() for fmt in ImageController.SUPPORTED_FORMATS}

    @staticmethod
    def validate_image_data(image_data: str) -> bool:
        """
        Validate if the provided string is valid base64 image data.

        Args:
            image_data: Base64 encoded image data

        Returns:
            True if valid, False otherwise
        """
        try:
            import base64

            # Try to decode the base64 data
            decoded = base64.b64decode(image_data)
            # Check if it's a reasonable size (not empty, not too large)
            return len(decoded) > 0 and len(decoded) < 10 * 1024 * 1024  # 10MB limit
        except Exception:
            return False
