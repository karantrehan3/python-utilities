import base64
import hashlib
from typing import Any, Dict

from pydantic import BaseModel

from ..dependencies.common import ProcessingError, ValidationError
from .base import BaseUtilityRouter, UtilityInfo


class TextRequest(BaseModel):
    """Request model for text operations"""

    text: str

    model_config = {"json_schema_extra": {"example": {"text": "Hello, World!"}}}


class TextResponse(BaseModel):
    """Response model for text operations"""

    result: str

    model_config = {
        "json_schema_extra": {"example": {"result": "encoded_or_hashed_text"}}
    }


class TextUtilsRouter(BaseUtilityRouter):
    """Text utilities router"""

    def __init__(self):
        super().__init__(prefix="/text-utils", tags=["Text Utilities"])

    def get_utility_info(self) -> Dict[str, Any]:
        """Return information about the text utilities"""
        info = UtilityInfo(
            name="Text Utilities",
            description="Various text processing utilities (hashing, encoding, etc.)",
            version="1.0.0",
            endpoints=[
                {
                    "name": "hash_md5",
                    "description": "POST /hash/md5 - Generate MD5 hash",
                },
                {
                    "name": "hash_sha256",
                    "description": "POST /hash/sha256 - Generate SHA256 hash",
                },
                {
                    "name": "encode_base64",
                    "description": "POST /encode/base64 - Base64 encode text",
                },
                {
                    "name": "decode_base64",
                    "description": "POST /decode/base64 - Base64 decode text",
                },
            ],
        )
        return info.to_dict()

    def _setup_routes(self) -> None:
        """Setup the routes for text utilities"""
        self._add_info_route()
        self._add_hash_routes()
        self._add_encoding_routes()

    def _add_hash_routes(self) -> None:
        """Add hashing routes"""

        @self.router.post(
            "/hash/md5",
            response_model=TextResponse,
            summary="Generate MD5 Hash",
            description="Generate MD5 hash of the input text",
        )
        async def hash_md5(request: TextRequest):
            """Generate MD5 hash of the input text"""
            try:
                if not request.text.strip():
                    raise ValidationError("Text cannot be empty", "text")

                hash_result = hashlib.md5(request.text.encode()).hexdigest()
                return TextResponse(result=hash_result)
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error generating MD5 hash: {str(e)}")

        @self.router.post(
            "/hash/sha256",
            response_model=TextResponse,
            summary="Generate SHA256 Hash",
            description="Generate SHA256 hash of the input text",
        )
        async def hash_sha256(request: TextRequest):
            """Generate SHA256 hash of the input text"""
            try:
                if not request.text.strip():
                    raise ValidationError("Text cannot be empty", "text")

                hash_result = hashlib.sha256(request.text.encode()).hexdigest()
                return TextResponse(result=hash_result)
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error generating SHA256 hash: {str(e)}")

    def _add_encoding_routes(self) -> None:
        """Add encoding/decoding routes"""

        @self.router.post(
            "/encode/base64",
            response_model=TextResponse,
            summary="Base64 Encode",
            description="Base64 encode the input text",
        )
        async def encode_base64(request: TextRequest):
            """Base64 encode the input text"""
            try:
                if not request.text.strip():
                    raise ValidationError("Text cannot be empty", "text")

                encoded = base64.b64encode(request.text.encode()).decode()
                return TextResponse(result=encoded)
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error encoding to base64: {str(e)}")

        @self.router.post(
            "/decode/base64",
            response_model=TextResponse,
            summary="Base64 Decode",
            description="Base64 decode the input text",
        )
        async def decode_base64(request: TextRequest):
            """Base64 decode the input text"""
            try:
                if not request.text.strip():
                    raise ValidationError("Text cannot be empty", "text")

                try:
                    decoded = base64.b64decode(request.text.encode()).decode()
                    return TextResponse(result=decoded)
                except Exception:
                    raise ValidationError("Invalid base64 encoded text", "text")
            except ValidationError:
                raise
            except Exception as e:
                raise ProcessingError(f"Error decoding from base64: {str(e)}")


# Create the router instance
text_utils_router = TextUtilsRouter()
router = text_utils_router.router
