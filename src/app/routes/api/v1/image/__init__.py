from fastapi import APIRouter

from src.app.routes.api.v1.image.controller import ImageController
from src.app.routes.api.v1.image.validator import (
    ConvertRequest,
    ImageInfoRequest,
    ImageInfoResponse,
    ImageResponse,
    ResizeRequest,
)

# Create the router
router = APIRouter()


@router.post(
    "/resize",
    response_model=ImageResponse,
    summary="Resize Image",
    description="Resize image to specified dimensions",
)
async def resize_image(request: ResizeRequest):
    """
    Resize image to specified dimensions.

    Args:
        request: Resize request containing image data and dimensions

    Returns:
        Resize response with the resized image
    """
    return await ImageController.resize_image(request)


@router.post(
    "/convert",
    response_model=ImageResponse,
    summary="Convert Image",
    description="Convert image to different format",
)
async def convert_image(request: ConvertRequest):
    """
    Convert image to different format.

    Args:
        request: Convert request containing image data and target format

    Returns:
        Convert response with the converted image
    """
    return await ImageController.convert_image(request)


@router.post(
    "/info",
    response_model=ImageInfoResponse,
    summary="Image Info",
    description="Get image information",
)
async def get_image_info(request: ImageInfoRequest):
    """
    Get image information.

    Args:
        request: Image info request containing image data

    Returns:
        Image info response with image details
    """
    return await ImageController.get_image_info(request)


@router.get(
    "/formats",
    summary="Get Supported Formats",
    description="Get list of supported image formats",
)
async def get_supported_formats():
    """
    Get list of supported image formats.

    Returns:
        Dictionary of supported image formats
    """
    return ImageController.get_supported_formats()


@router.get(
    "/",
    summary="Image Utilities Info",
    description="Get information about available image utilities",
)
async def get_image_utilities_info():
    """
    Get information about available image utilities.

    Returns:
        Information about image utilities and their endpoints
    """
    return {
        "utility": "Image Utilities",
        "description": "Various image processing utilities (resize, convert, etc.)",
        "version": "1.0.0",
        "endpoints": {
            "resize": "POST /resize - Resize image to specified dimensions",
            "convert": "POST /convert - Convert image to different format",
            "info": "POST /info - Get image information",
            "formats": "GET /formats - Get supported image formats",
        },
    }
