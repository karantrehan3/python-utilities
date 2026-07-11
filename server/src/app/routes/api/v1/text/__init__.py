from fastapi import APIRouter

from src.app.routes.api.v1.text.controller import TextController
from src.app.routes.api.v1.text.validator import (
    EncodeRequest,
    EncodeResponse,
    HashRequest,
    HashResponse,
)

# Create the router
router = APIRouter()


@router.post(
    "/hash",
    response_model=HashResponse,
    summary="Generate Hash",
    description="Generate hash of the input text using specified algorithm",
)
async def hash_text(request: HashRequest):
    """
    Generate hash of the input text.

    Args:
        request: Hash request containing text and algorithm

    Returns:
        Hash response with the generated hash
    """
    return await TextController.hash_text(request)


@router.post(
    "/encode",
    response_model=EncodeResponse,
    summary="Encode Text",
    description="Encode the input text using specified encoding",
)
async def encode_text(request: EncodeRequest):
    """
    Encode the input text.

    Args:
        request: Encode request containing text and encoding type

    Returns:
        Encode response with the encoded text
    """
    return await TextController.encode_text(request)


@router.post(
    "/decode",
    response_model=EncodeResponse,
    summary="Decode Text",
    description="Decode the input text using specified encoding",
)
async def decode_text(request: EncodeRequest):
    """
    Decode the input text.

    Args:
        request: Decode request containing encoded text and encoding type

    Returns:
        Decode response with the decoded text
    """
    return await TextController.decode_text(request)


@router.get(
    "/algorithms",
    summary="Get Supported Hash Algorithms",
    description="Get list of supported hash algorithms",
)
async def get_supported_algorithms():
    """
    Get list of supported hash algorithms.

    Returns:
        Dictionary of supported hash algorithms
    """
    return TextController.get_supported_algorithms()


@router.get(
    "/encodings",
    summary="Get Supported Encodings",
    description="Get list of supported encoding types",
)
async def get_supported_encodings():
    """
    Get list of supported encoding types.

    Returns:
        Dictionary of supported encoding types
    """
    return TextController.get_supported_encodings()


@router.get(
    "/",
    summary="Text Utilities Info",
    description="Get information about available text utilities",
)
async def get_text_utilities_info():
    """
    Get information about available text utilities.

    Returns:
        Information about text utilities and their endpoints
    """
    return {
        "utility": "Text Utilities",
        "description": "Various text processing utilities (hashing, encoding, etc.)",
        "version": "1.0.0",
        "endpoints": {
            "hash": "POST /hash - Generate hash of text using specified algorithm",
            "encode": "POST /encode - Encode text using specified encoding",
            "decode": "POST /decode - Decode text using specified encoding",
            "algorithms": "GET /algorithms - Get supported hash algorithms",
            "encodings": "GET /encodings - Get supported encoding types",
        },
    }
