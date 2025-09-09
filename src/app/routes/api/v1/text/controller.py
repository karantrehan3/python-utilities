import base64
import hashlib
from typing import Dict

from src.app.dependencies.common import ProcessingError, ValidationError
from src.app.routes.api.v1.text.validator import (
    EncodeRequest,
    EncodeResponse,
    HashRequest,
    HashResponse,
)


class TextController:
    """Controller for text utility operations"""

    SUPPORTED_HASH_ALGORITHMS = {
        "md5": hashlib.md5,
        "sha1": hashlib.sha1,
        "sha256": hashlib.sha256,
        "sha512": hashlib.sha512,
    }

    SUPPORTED_ENCODINGS = {
        "base64": {"encode": base64.b64encode, "decode": base64.b64decode},
        "base32": {"encode": base64.b32encode, "decode": base64.b32decode},
        "base16": {"encode": base64.b16encode, "decode": base64.b16decode},
    }

    @staticmethod
    async def hash_text(request: HashRequest) -> HashResponse:
        """
        Generate hash of the input text.

        Args:
            request: Hash request containing text and algorithm

        Returns:
            Hash response with the generated hash
        """
        try:
            if not request.text.strip():
                raise ValidationError("Text cannot be empty", "text")

            algorithm = request.algorithm.lower()
            if algorithm not in TextController.SUPPORTED_HASH_ALGORITHMS:
                raise ValidationError(
                    f"Unsupported hash algorithm. Supported: {list(TextController.SUPPORTED_HASH_ALGORITHMS.keys())}",
                    "algorithm",
                )

            hash_func = TextController.SUPPORTED_HASH_ALGORITHMS[algorithm]
            hash_result = hash_func(request.text.encode()).hexdigest()

            return HashResponse(result=hash_result, algorithm=algorithm.upper())

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(
                f"Error generating {request.algorithm} hash: {str(e)}"
            )

    @staticmethod
    async def encode_text(request: EncodeRequest) -> EncodeResponse:
        """
        Encode the input text.

        Args:
            request: Encode request containing text and encoding type

        Returns:
            Encode response with the encoded text
        """
        try:
            if not request.text.strip():
                raise ValidationError("Text cannot be empty", "text")

            encoding = request.encoding.lower()
            if encoding not in TextController.SUPPORTED_ENCODINGS:
                raise ValidationError(
                    f"Unsupported encoding type. Supported: {list(TextController.SUPPORTED_ENCODINGS.keys())}",
                    "encoding",
                )

            encode_func = TextController.SUPPORTED_ENCODINGS[encoding]["encode"]
            encoded = encode_func(request.text.encode()).decode()

            return EncodeResponse(result=encoded, encoding=encoding.upper())

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(
                f"Error encoding text with {request.encoding}: {str(e)}"
            )

    @staticmethod
    async def decode_text(request: EncodeRequest) -> EncodeResponse:
        """
        Decode the input text.

        Args:
            request: Decode request containing encoded text and encoding type

        Returns:
            Decode response with the decoded text
        """
        try:
            if not request.text.strip():
                raise ValidationError("Text cannot be empty", "text")

            encoding = request.encoding.lower()
            if encoding not in TextController.SUPPORTED_ENCODINGS:
                raise ValidationError(
                    f"Unsupported encoding type. Supported: {list(TextController.SUPPORTED_ENCODINGS.keys())}",
                    "encoding",
                )

            try:
                decode_func = TextController.SUPPORTED_ENCODINGS[encoding]["decode"]
                decoded = decode_func(request.text.encode()).decode()

                return EncodeResponse(result=decoded, encoding=encoding.upper())
            except Exception:
                raise ValidationError(f"Invalid {encoding} encoded text", "text")

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(
                f"Error decoding text with {request.encoding}: {str(e)}"
            )

    @staticmethod
    def get_supported_algorithms() -> Dict[str, str]:
        """Get list of supported hash algorithms"""
        return {
            name: name.upper()
            for name in TextController.SUPPORTED_HASH_ALGORITHMS.keys()
        }

    @staticmethod
    def get_supported_encodings() -> Dict[str, str]:
        """Get list of supported encoding types"""
        return {
            name: name.upper() for name in TextController.SUPPORTED_ENCODINGS.keys()
        }
