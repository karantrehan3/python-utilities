from pydantic import BaseModel, Field


class TextRequest(BaseModel):
    """Request model for text operations"""

    text: str = Field(..., description="The text to process", min_length=1)

    model_config = {"json_schema_extra": {"example": {"text": "Hello, World!"}}}


class TextResponse(BaseModel):
    """Response model for text operations"""

    result: str = Field(..., description="The processed text result")

    model_config = {
        "json_schema_extra": {"example": {"result": "encoded_or_hashed_text"}}
    }


class HashRequest(TextRequest):
    """Request model for hashing operations"""

    algorithm: str = Field("md5", description="Hash algorithm to use")

    model_config = {
        "json_schema_extra": {"example": {"text": "Hello, World!", "algorithm": "md5"}}
    }


class HashResponse(TextResponse):
    """Response model for hashing operations"""

    algorithm: str = Field(..., description="The hash algorithm used")

    model_config = {
        "json_schema_extra": {
            "example": {
                "result": "5d41402abc4b2a76b9719d911017c592",
                "algorithm": "md5",
            }
        }
    }


class EncodeRequest(TextRequest):
    """Request model for encoding operations"""

    encoding: str = Field("base64", description="Encoding type to use")

    model_config = {
        "json_schema_extra": {
            "example": {"text": "Hello, World!", "encoding": "base64"}
        }
    }


class EncodeResponse(TextResponse):
    """Response model for encoding operations"""

    encoding: str = Field(..., description="The encoding type used")

    model_config = {
        "json_schema_extra": {
            "example": {"result": "SGVsbG8sIFdvcmxkIQ==", "encoding": "base64"}
        }
    }
