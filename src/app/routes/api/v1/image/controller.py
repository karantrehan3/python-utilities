import base64
import io
from typing import Dict, Union

import httpx
from PIL import Image

from src.app.dependencies.common import ProcessingError, ValidationError
from src.app.routes.api.v1.image.validator import (
    ConvertFileRequest,
    ConvertRequest,
    ImageFileRequest,
    ImageInfoFileRequest,
    ImageInfoRequest,
    ImageInfoResponse,
    ImageRequest,
    ImageResponse,
    ResizeFileRequest,
    ResizeRequest,
)


class ImageController:
    """Controller for image utility operations"""

    SUPPORTED_FORMATS = ["PNG", "JPEG", "JPG", "GIF", "BMP", "WEBP"]

    @staticmethod
    async def _download_image_from_url(url: str) -> bytes:
        """
        Download image from URL.

        Args:
            url: Image URL

        Returns:
            Image bytes

        Raises:
            ValidationError: If URL is invalid or download fails
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url)
                response.raise_for_status()

                # Check content type
                content_type = response.headers.get("content-type", "").lower()
                if not content_type.startswith("image/"):
                    raise ValidationError(
                        f"URL does not point to an image. Content-Type: {content_type}",
                        "image_url",
                    )

                # Check file size (10MB limit)
                if len(response.content) > 10 * 1024 * 1024:
                    raise ValidationError(
                        "Image file too large. Maximum size: 10MB", "image_url"
                    )

                return response.content
        except httpx.HTTPError as e:
            raise ValidationError(
                f"Failed to download image from URL: {str(e)}", "image_url"
            )
        except Exception as e:
            raise ValidationError(
                f"Invalid URL or network error: {str(e)}", "image_url"
            )

    @staticmethod
    def _get_image_from_request(
        request: Union[ImageRequest, ImageFileRequest], file_data: bytes = None
    ) -> Image.Image:
        """
        Get PIL Image from request (handles base64, URL, or file data).

        Args:
            request: Image request object
            file_data: File data if from file upload

        Returns:
            PIL Image object

        Raises:
            ValidationError: If image data is invalid
        """
        if file_data:
            # Handle file upload
            try:
                image = Image.open(io.BytesIO(file_data))
                return image
            except Exception as e:
                raise ValidationError(f"Invalid image file: {str(e)}", "file")

        if hasattr(request, "image_data") and request.image_data:
            # Handle base64 data
            return ImageController._decode_base64_image(request.image_data)

        if hasattr(request, "image_url") and request.image_url:
            # Handle URL - this should be called with await in async context
            raise ValidationError(
                "URL download must be handled in async context", "image_url"
            )

        raise ValidationError("No valid image source provided", "image_data")

    @staticmethod
    async def _get_image_from_request_async(
        request: Union[ImageRequest, ImageFileRequest], file_data: bytes = None
    ) -> Image.Image:
        """
        Get PIL Image from request (handles base64, URL, or file data) in async context.

        Args:
            request: Image request object
            file_data: File data if from file upload

        Returns:
            PIL Image object

        Raises:
            ValidationError: If image data is invalid
        """
        if file_data:
            # Handle file upload
            try:
                image = Image.open(io.BytesIO(file_data))
                return image
            except Exception as e:
                raise ValidationError(f"Invalid image file: {str(e)}", "file")

        if hasattr(request, "image_data") and request.image_data:
            # Handle base64 data
            return ImageController._decode_base64_image(request.image_data)

        if hasattr(request, "image_url") and request.image_url:
            # Handle URL download
            image_bytes = await ImageController._download_image_from_url(
                request.image_url
            )
            try:
                image = Image.open(io.BytesIO(image_bytes))
                return image
            except Exception as e:
                raise ValidationError(f"Invalid image from URL: {str(e)}", "image_url")

        raise ValidationError("No valid image source provided", "image_data")

    @staticmethod
    def _decode_base64_image(image_data: str) -> Image.Image:
        """
        Decode base64 image data to PIL Image object.

        Args:
            image_data: Base64 encoded image data

        Returns:
            PIL Image object

        Raises:
            ValidationError: If image data is invalid
        """
        try:
            # Decode base64 data
            image_bytes = base64.b64decode(image_data)

            # Create PIL Image from bytes
            image = Image.open(io.BytesIO(image_bytes))

            # Convert to RGB if necessary (for JPEG compatibility)
            if image.mode in ("RGBA", "LA", "P"):
                # Create a white background for transparent images
                background = Image.new("RGB", image.size, (255, 255, 255))
                if image.mode == "P":
                    image = image.convert("RGBA")
                background.paste(
                    image, mask=image.split()[-1] if image.mode == "RGBA" else None
                )
                image = background
            elif image.mode != "RGB":
                image = image.convert("RGB")

            return image
        except Exception as e:
            raise ValidationError(f"Invalid image data: {str(e)}", "image_data")

    @staticmethod
    def _encode_image_to_base64(image: Image.Image, format: str) -> str:
        """
        Encode PIL Image object to base64 string.

        Args:
            image: PIL Image object
            format: Target image format

        Returns:
            Base64 encoded image data
        """
        buffer = io.BytesIO()

        # Map format names to PIL format names
        format_map = {
            "JPEG": "JPEG",
            "JPG": "JPEG",
            "PNG": "PNG",
            "GIF": "GIF",
            "BMP": "BMP",
            "WEBP": "WEBP",
        }

        pil_format = format_map.get(format.upper(), "PNG")

        # Save image to buffer
        image.save(buffer, format=pil_format, optimize=True)
        buffer.seek(0)

        # Encode to base64
        return base64.b64encode(buffer.getvalue()).decode("utf-8")

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
            # Validate input sources
            if not request.image_data and not request.image_url:
                raise ValidationError(
                    "Either image_data or image_url must be provided", "image_data"
                )

            if request.width <= 0 or request.height <= 0:
                raise ValidationError("Width and height must be positive", "width")

            # Validate format
            if request.format.upper() not in ImageController.SUPPORTED_FORMATS:
                raise ValidationError(
                    f"Unsupported image format. Supported: {ImageController.SUPPORTED_FORMATS}",
                    "format",
                )

            # Get image from request (handles base64, URL, or file)
            image = await ImageController._get_image_from_request_async(request)

            # Calculate new dimensions
            if request.maintain_aspect_ratio:
                # Calculate aspect ratio preserving dimensions
                original_width, original_height = image.size
                aspect_ratio = original_width / original_height

                if request.width / request.height > aspect_ratio:
                    # Height is the limiting factor
                    new_width = int(request.height * aspect_ratio)
                    new_height = request.height
                else:
                    # Width is the limiting factor
                    new_width = request.width
                    new_height = int(request.width / aspect_ratio)
            else:
                new_width = request.width
                new_height = request.height

            # Resize the image
            resized_image = image.resize(
                (new_width, new_height), Image.Resampling.LANCZOS
            )

            # Encode back to base64
            result_data = ImageController._encode_image_to_base64(
                resized_image, request.format
            )

            return ImageResponse(
                result=result_data,
                format=request.format.upper(),
                size=len(result_data),
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
            # Validate input sources
            if not request.image_data and not request.image_url:
                raise ValidationError(
                    "Either image_data or image_url must be provided", "image_data"
                )

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

            # Get image from request (handles base64, URL, or file)
            image = await ImageController._get_image_from_request_async(request)

            # Convert to target format
            result_data = ImageController._encode_image_to_base64(
                image, request.target_format
            )

            return ImageResponse(
                result=result_data,
                format=request.target_format.upper(),
                size=len(result_data),
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
            # Validate input sources
            if not request.image_data and not request.image_url:
                raise ValidationError(
                    "Either image_data or image_url must be provided", "image_data"
                )

            # Get image from request (handles base64, URL, or file)
            image = await ImageController._get_image_from_request_async(request)

            # Get image information
            width, height = image.size
            format_name = image.format or "Unknown"

            # Calculate file size
            if request.image_data:
                file_size = len(request.image_data)
            elif request.image_url:
                # For URL, we can't easily get the original file size without re-downloading
                # So we'll estimate based on the image data
                buffer = io.BytesIO()
                image.save(buffer, format=image.format or "PNG")
                file_size = len(buffer.getvalue())
            else:
                file_size = 0

            return ImageInfoResponse(
                format=format_name,
                size=file_size,
                dimensions=f"{width}x{height}",
                width=width,
                height=height,
            )

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error getting image info: {str(e)}")

    @staticmethod
    async def resize_image_file(
        request: ResizeFileRequest, file_data: bytes
    ) -> ImageResponse:
        """
        Resize image from file upload.

        Args:
            request: Resize request containing dimensions
            file_data: Uploaded file data

        Returns:
            Resize response with the resized image
        """
        try:
            if request.width <= 0 or request.height <= 0:
                raise ValidationError("Width and height must be positive", "width")

            # Validate format
            if request.format.upper() not in ImageController.SUPPORTED_FORMATS:
                raise ValidationError(
                    f"Unsupported image format. Supported: {ImageController.SUPPORTED_FORMATS}",
                    "format",
                )

            # Get image from file data
            image = await ImageController._get_image_from_request_async(
                request, file_data
            )

            # Calculate new dimensions
            if request.maintain_aspect_ratio:
                # Calculate aspect ratio preserving dimensions
                original_width, original_height = image.size
                aspect_ratio = original_width / original_height

                if request.width / request.height > aspect_ratio:
                    # Height is the limiting factor
                    new_width = int(request.height * aspect_ratio)
                    new_height = request.height
                else:
                    # Width is the limiting factor
                    new_width = request.width
                    new_height = int(request.width / aspect_ratio)
            else:
                new_width = request.width
                new_height = request.height

            # Resize the image
            resized_image = image.resize(
                (new_width, new_height), Image.Resampling.LANCZOS
            )

            # Encode back to base64
            result_data = ImageController._encode_image_to_base64(
                resized_image, request.format
            )

            return ImageResponse(
                result=result_data,
                format=request.format.upper(),
                size=len(result_data),
            )

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error resizing image: {str(e)}")

    @staticmethod
    async def convert_image_file(
        request: ConvertFileRequest, file_data: bytes
    ) -> ImageResponse:
        """
        Convert image from file upload.

        Args:
            request: Convert request containing target format
            file_data: Uploaded file data

        Returns:
            Convert response with the converted image
        """
        try:
            # Validate format
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

            # Get image from file data
            image = await ImageController._get_image_from_request_async(
                request, file_data
            )

            # Convert to target format
            result_data = ImageController._encode_image_to_base64(
                image, request.target_format
            )

            return ImageResponse(
                result=result_data,
                format=request.target_format.upper(),
                size=len(result_data),
            )

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error converting image: {str(e)}")

    @staticmethod
    async def get_image_info_file(
        request: ImageInfoFileRequest, file_data: bytes
    ) -> ImageInfoResponse:
        """
        Get information about an image from file upload.

        Args:
            request: Image info request
            file_data: Uploaded file data

        Returns:
            Image info response with image details
        """
        try:
            # Get image from file data
            image = await ImageController._get_image_from_request_async(
                request, file_data
            )

            # Get image information
            width, height = image.size
            format_name = image.format or "Unknown"

            # Calculate file size from uploaded data
            file_size = len(file_data)

            return ImageInfoResponse(
                format=format_name,
                size=file_size,
                dimensions=f"{width}x{height}",
                width=width,
                height=height,
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
            # Try to decode the base64 data
            decoded = base64.b64decode(image_data)
            # Check if it's a reasonable size (not empty, not too large)
            if len(decoded) == 0 or len(decoded) > 10 * 1024 * 1024:  # 10MB limit
                return False

            # Try to open as PIL Image to validate it's actually an image
            image = Image.open(io.BytesIO(decoded))
            image.verify()  # Verify the image data
            return True
        except Exception:
            return False
