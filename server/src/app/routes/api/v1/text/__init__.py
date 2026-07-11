from fastapi import APIRouter

from src.app.routes.api.v1.text.controller import TextController
from src.app.routes.api.v1.text.validator import (
    CsvJsonRequest,
    CsvJsonResponse,
    DiffRequest,
    DiffResponse,
    EncodeRequest,
    EncodeResponse,
    GenerateRequest,
    GenerateResponse,
    HashRequest,
    HashResponse,
    JsonFormatRequest,
    JsonFormatResponse,
    JsonMinifyRequest,
    JsonMinifyResponse,
    RegexRequest,
    RegexResponse,
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


@router.post(
    "/diff",
    response_model=DiffResponse,
    summary="Text Diff",
    description="Compute a unified diff between two texts",
)
async def diff_text(request: DiffRequest):
    """
    Compute a unified diff between two texts.

    Args:
        request: Diff request containing text1 and text2

    Returns:
        Diff response with unified diff and line counts
    """
    return await TextController.diff_text(request)


@router.post(
    "/regex",
    response_model=RegexResponse,
    summary="Regex Match",
    description="Find all regex matches in text",
)
async def regex_match(request: RegexRequest):
    """
    Find all regex matches in the input text.

    Args:
        request: Regex request with text, pattern, and flags

    Returns:
        Regex response with matches and count
    """
    return await TextController.regex_match(request)


@router.post(
    "/json/format",
    response_model=JsonFormatResponse,
    summary="Format JSON",
    description="Pretty-print a JSON string",
)
async def json_format(request: JsonFormatRequest):
    """
    Parse and pretty-print a JSON string.

    Args:
        request: JSON format request with text, indent, sort_keys

    Returns:
        JSON format response with formatted output
    """
    return await TextController.json_format(request)


@router.post(
    "/json/minify",
    response_model=JsonMinifyResponse,
    summary="Minify JSON",
    description="Minify a JSON string by removing whitespace",
)
async def json_minify(request: JsonMinifyRequest):
    """
    Parse and minify a JSON string.

    Args:
        request: JSON minify request with text

    Returns:
        JSON minify response with minified output
    """
    return await TextController.json_minify(request)


@router.post(
    "/csv-json",
    response_model=CsvJsonResponse,
    summary="CSV/JSON Conversion",
    description="Convert between CSV and JSON formats",
)
async def csv_json_convert(request: CsvJsonRequest):
    """
    Convert between CSV and JSON formats.

    Args:
        request: Conversion request with text, direction, delimiter

    Returns:
        Conversion response with converted text
    """
    return await TextController.csv_json_convert(request)


@router.post(
    "/generate",
    response_model=GenerateResponse,
    summary="Generate Text",
    description="Generate UUIDs or lorem ipsum text",
)
async def generate_text(request: GenerateRequest):
    """
    Generate UUIDs or lorem ipsum text.

    Args:
        request: Generate request with type, count, lorem_type

    Returns:
        Generate response with generated text
    """
    return await TextController.generate_text(request)


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
        "description": (
            "Various text processing utilities "
            "(hashing, encoding, diff, regex, JSON, CSV, generation)"
        ),
        "version": "1.1.0",
        "endpoints": {
            "hash": "POST /hash - Generate hash of text using specified algorithm",
            "encode": "POST /encode - Encode text using specified encoding",
            "decode": "POST /decode - Decode text using specified encoding",
            "algorithms": "GET /algorithms - Get supported hash algorithms",
            "encodings": "GET /encodings - Get supported encoding types",
            "diff": "POST /diff - Compute unified diff between two texts",
            "regex": "POST /regex - Find all regex matches in text",
            "json_format": "POST /json/format - Pretty-print a JSON string",
            "json_minify": "POST /json/minify - Minify a JSON string",
            "csv_json": "POST /csv-json - Convert between CSV and JSON",
            "generate": "POST /generate - Generate UUIDs or lorem ipsum text",
        },
    }
