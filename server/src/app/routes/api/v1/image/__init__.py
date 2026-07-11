from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse

from src.app.routes.api.v1.image.controller import ImageController
from src.app.routes.api.v1.image.validator import (
    AdjustFileRequest,
    CompressFileRequest,
    ConvertFileRequest,
    ConvertRequest,
    CropFileRequest,
    ImageCompressResponse,
    ImageInfoFileRequest,
    ImageInfoRequest,
    ImageInfoResponse,
    ImageResponse,
    ResizeFileRequest,
    ResizeRequest,
    RotateFileRequest,
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


# File upload routes
@router.post(
    "/resize/file",
    response_model=ImageResponse,
    summary="Resize Image (File Upload)",
    description="Resize image from file upload to specified dimensions",
)
async def resize_image_file(
    file: UploadFile = File(..., description="Image file to resize"),
    width: int = Form(..., description="Target width in pixels", gt=0),
    height: int = Form(..., description="Target height in pixels", gt=0),
    maintain_aspect_ratio: bool = Form(
        True, description="Whether to maintain aspect ratio"
    ),
    format: str = Form("PNG", description="Image format"),
):
    """
    Resize image from file upload to specified dimensions.

    Args:
        file: Uploaded image file
        width: Target width in pixels
        height: Target height in pixels
        maintain_aspect_ratio: Whether to maintain aspect ratio
        format: Image format

    Returns:
        Resize response with the resized image
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400, content={"detail": "File must be an image"}
            )

        # Read file data
        file_data = await file.read()

        # Create request object
        request = ResizeFileRequest(
            width=width,
            height=height,
            maintain_aspect_ratio=maintain_aspect_ratio,
            format=format,
        )

        return await ImageController.resize_image_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


@router.post(
    "/convert/file",
    response_model=ImageResponse,
    summary="Convert Image (File Upload)",
    description="Convert image from file upload to different format",
)
async def convert_image_file(
    file: UploadFile = File(..., description="Image file to convert"),
    target_format: str = Form(..., description="Target image format"),
    format: str = Form("PNG", description="Source image format"),
):
    """
    Convert image from file upload to different format.

    Args:
        file: Uploaded image file
        target_format: Target image format
        format: Source image format

    Returns:
        Convert response with the converted image
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400, content={"detail": "File must be an image"}
            )

        # Read file data
        file_data = await file.read()

        # Create request object
        request = ConvertFileRequest(target_format=target_format, format=format)

        return await ImageController.convert_image_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


@router.post(
    "/info/file",
    response_model=ImageInfoResponse,
    summary="Image Info (File Upload)",
    description="Get image information from file upload",
)
async def get_image_info_file(
    file: UploadFile = File(..., description="Image file to analyze"),
    format: str = Form("PNG", description="Image format"),
):
    """
    Get image information from file upload.

    Args:
        file: Uploaded image file
        format: Image format

    Returns:
        Image info response with image details
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400, content={"detail": "File must be an image"}
            )

        # Read file data
        file_data = await file.read()

        # Create request object
        request = ImageInfoFileRequest(format=format)

        return await ImageController.get_image_info_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


@router.post(
    "/crop/file",
    response_model=ImageResponse,
    summary="Crop Image (File Upload)",
    description="Crop image from file upload to specified rectangle",
)
async def crop_image_file(
    file: UploadFile = File(..., description="Image file to crop"),
    left: int = Form(..., description="Left pixel coordinate", ge=0),
    top: int = Form(..., description="Top pixel coordinate", ge=0),
    right: int = Form(..., description="Right pixel coordinate", gt=0),
    bottom: int = Form(..., description="Bottom pixel coordinate", gt=0),
    format: str = Form("PNG", description="Output image format"),
):
    """
    Crop image from file upload to the specified rectangle.

    Args:
        file: Uploaded image file
        left: Left pixel coordinate of crop box
        top: Top pixel coordinate of crop box
        right: Right pixel coordinate of crop box
        bottom: Bottom pixel coordinate of crop box
        format: Output image format

    Returns:
        ImageResponse with the cropped image
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400,
                content={"detail": "File must be an image"},
            )

        file_data = await file.read()

        request = CropFileRequest(
            left=left,
            top=top,
            right=right,
            bottom=bottom,
            format=format,
        )

        return await ImageController.crop_image_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


@router.post(
    "/rotate/file",
    response_model=ImageResponse,
    summary="Rotate Image (File Upload)",
    description="Rotate and optionally flip image from file upload",
)
async def rotate_image_file(
    file: UploadFile = File(..., description="Image file to rotate"),
    angle: int = Form(..., description="Rotation angle in degrees"),
    flip_horizontal: bool = Form(False, description="Flip horizontally after rotation"),
    flip_vertical: bool = Form(False, description="Flip vertically after rotation"),
    format: str = Form("PNG", description="Output image format"),
):
    """
    Rotate and optionally flip image from file upload.

    Args:
        file: Uploaded image file
        angle: Rotation angle in degrees
        flip_horizontal: Whether to flip horizontally
        flip_vertical: Whether to flip vertically
        format: Output image format

    Returns:
        ImageResponse with the rotated image
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400,
                content={"detail": "File must be an image"},
            )

        file_data = await file.read()

        request = RotateFileRequest(
            angle=angle,
            flip_horizontal=flip_horizontal,
            flip_vertical=flip_vertical,
            format=format,
        )

        return await ImageController.rotate_image_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


@router.post(
    "/compress/file",
    response_model=ImageCompressResponse,
    summary="Compress Image (File Upload)",
    description="Compress image from file upload at given quality",
)
async def compress_image_file(
    file: UploadFile = File(..., description="Image file to compress"),
    quality: int = Form(80, description="Compression quality (1-100)", ge=1, le=100),
    format: str = Form("JPEG", description="Output format (JPEG or WEBP)"),
):
    """
    Compress image from file upload at specified quality.

    Args:
        file: Uploaded image file
        quality: Compression quality (1-100)
        format: Output format (JPEG or WEBP)

    Returns:
        ImageCompressResponse with compressed image and size info
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400,
                content={"detail": "File must be an image"},
            )

        file_data = await file.read()

        request = CompressFileRequest(
            quality=quality,
            format=format,
        )

        return await ImageController.compress_image_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


@router.post(
    "/adjust/file",
    response_model=ImageResponse,
    summary="Adjust Image (File Upload)",
    description="Adjust image brightness, contrast, saturation, and sharpness",
)
async def adjust_image_file(
    file: UploadFile = File(..., description="Image file to adjust"),
    brightness: float = Form(
        1.0, description="Brightness factor (1.0 = no change)", gt=0
    ),
    contrast: float = Form(1.0, description="Contrast factor (1.0 = no change)", gt=0),
    saturation: float = Form(
        1.0, description="Saturation factor (1.0 = no change)", gt=0
    ),
    sharpness: float = Form(
        1.0, description="Sharpness factor (1.0 = no change)", gt=0
    ),
    format: str = Form("PNG", description="Output image format"),
):
    """
    Adjust image brightness, contrast, saturation, and sharpness.

    Args:
        file: Uploaded image file
        brightness: Brightness factor (1.0 = no change)
        contrast: Contrast factor (1.0 = no change)
        saturation: Saturation factor (1.0 = no change)
        sharpness: Sharpness factor (1.0 = no change)
        format: Output image format

    Returns:
        ImageResponse with the adjusted image
    """
    try:
        if not file.content_type or not file.content_type.startswith("image/"):
            return JSONResponse(
                status_code=400,
                content={"detail": "File must be an image"},
            )

        file_data = await file.read()

        request = AdjustFileRequest(
            brightness=brightness,
            contrast=contrast,
            saturation=saturation,
            sharpness=sharpness,
            format=format,
        )

        return await ImageController.adjust_image_file(request, file_data)
    except Exception as e:
        return JSONResponse(status_code=400, content={"detail": str(e)})


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
        "description": (
            "Various image processing utilities "
            "(resize, convert, crop, rotate, compress, adjust)"
        ),
        "version": "1.1.0",
        "endpoints": {
            "resize": ("POST /resize - Resize image " "(base64/URL)"),
            "resize_file": ("POST /resize/file - Resize image from file upload"),
            "convert": ("POST /convert - Convert image format " "(base64/URL)"),
            "convert_file": ("POST /convert/file - Convert image from " "file upload"),
            "info": ("POST /info - Get image information " "(base64/URL)"),
            "info_file": (
                "POST /info/file - Get image information " "from file upload"
            ),
            "crop_file": ("POST /crop/file - Crop image from file upload"),
            "rotate_file": (
                "POST /rotate/file - Rotate/flip image " "from file upload"
            ),
            "compress_file": (
                "POST /compress/file - Compress image " "from file upload"
            ),
            "adjust_file": (
                "POST /adjust/file - Adjust brightness, "
                "contrast, saturation, sharpness from file upload"
            ),
            "formats": ("GET /formats - Get supported image formats"),
        },
    }
