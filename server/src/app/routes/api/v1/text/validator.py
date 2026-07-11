from typing import List, Literal, Optional

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


# --- Diff models ---


class DiffRequest(BaseModel):
    """Request model for text diff operations"""

    text1: str = Field(..., description="First text to compare")
    text2: str = Field(..., description="Second text to compare")

    model_config = {
        "json_schema_extra": {
            "example": {
                "text1": "hello\nworld",
                "text2": "hello\nplanet",
            }
        }
    }


class DiffResponse(BaseModel):
    """Response model for text diff operations"""

    text1: str = Field(..., description="First text")
    text2: str = Field(..., description="Second text")
    diff: str = Field(..., description="Unified diff output")
    additions: int = Field(..., description="Number of added lines")
    deletions: int = Field(..., description="Number of deleted lines")

    model_config = {
        "json_schema_extra": {
            "example": {
                "text1": "hello\nworld",
                "text2": "hello\nplanet",
                "diff": "--- text1\n+++ text2\n...",
                "additions": 1,
                "deletions": 1,
            }
        }
    }


# --- Regex models ---


class RegexRequest(BaseModel):
    """Request model for regex matching operations"""

    text: str = Field(..., description="Text to search in", min_length=1)
    pattern: str = Field(..., description="Regex pattern to match")
    flags: str = Field(
        "",
        description=("Optional regex flags: " "i=IGNORECASE, m=MULTILINE, s=DOTALL"),
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "Hello World hello",
                "pattern": "hello",
                "flags": "i",
            }
        }
    }


class RegexMatch(BaseModel):
    """A single regex match result"""

    match: str = Field(..., description="The matched text")
    start: int = Field(..., description="Start index of match")
    end: int = Field(..., description="End index of match")
    groups: List[str] = Field(
        default_factory=list,
        description="Captured groups",
    )


class RegexResponse(BaseModel):
    """Response model for regex matching operations"""

    pattern: str = Field(..., description="The regex pattern used")
    text: str = Field(..., description="The input text")
    matches: List[RegexMatch] = Field(
        default_factory=list, description="List of matches"
    )
    count: int = Field(..., description="Number of matches found")

    model_config = {
        "json_schema_extra": {
            "example": {
                "pattern": "hello",
                "text": "Hello World hello",
                "matches": [
                    {
                        "match": "Hello",
                        "start": 0,
                        "end": 5,
                        "groups": [],
                    }
                ],
                "count": 1,
            }
        }
    }


# --- JSON format / minify models ---


class JsonFormatRequest(BaseModel):
    """Request model for JSON formatting"""

    text: str = Field(..., description="JSON string to format", min_length=1)
    indent: int = Field(2, description="Indentation level", ge=1, le=8)
    sort_keys: bool = Field(False, description="Whether to sort keys alphabetically")

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": '{"b":2,"a":1}',
                "indent": 2,
                "sort_keys": True,
            }
        }
    }


class JsonFormatResponse(BaseModel):
    """Response model for JSON formatting"""

    original: str = Field(..., description="Original JSON string")
    formatted: str = Field(..., description="Formatted JSON string")
    valid: bool = Field(..., description="Whether the input was valid JSON")
    error: Optional[str] = Field(None, description="Error message if JSON is invalid")

    model_config = {
        "json_schema_extra": {
            "example": {
                "original": '{"b":2,"a":1}',
                "formatted": '{\n  "a": 1,\n  "b": 2\n}',
                "valid": True,
                "error": None,
            }
        }
    }


class JsonMinifyRequest(BaseModel):
    """Request model for JSON minification"""

    text: str = Field(..., description="JSON string to minify", min_length=1)

    model_config = {
        "json_schema_extra": {"example": {"text": '{\n  "a": 1,\n  "b": 2\n}'}}
    }


class JsonMinifyResponse(BaseModel):
    """Response model for JSON minification"""

    original: str = Field(..., description="Original JSON string")
    minified: str = Field(..., description="Minified JSON string")
    valid: bool = Field(..., description="Whether the input was valid JSON")
    error: Optional[str] = Field(None, description="Error message if JSON is invalid")

    model_config = {
        "json_schema_extra": {
            "example": {
                "original": '{\n  "a": 1,\n  "b": 2\n}',
                "minified": '{"a":1,"b":2}',
                "valid": True,
                "error": None,
            }
        }
    }


# --- CSV / JSON conversion models ---


class CsvJsonRequest(BaseModel):
    """Request model for CSV/JSON conversion"""

    text: str = Field(..., description="Text to convert", min_length=1)
    direction: Literal["csv_to_json", "json_to_csv"] = Field(
        ..., description="Conversion direction"
    )
    delimiter: str = Field(
        ",", description="CSV delimiter character", min_length=1, max_length=1
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "name,age\nAlice,30\nBob,25",
                "direction": "csv_to_json",
                "delimiter": ",",
            }
        }
    }


class CsvJsonResponse(BaseModel):
    """Response model for CSV/JSON conversion"""

    original: str = Field(..., description="Original text")
    result: str = Field(..., description="Converted text")
    direction: str = Field(..., description="Conversion direction used")
    rows: int = Field(..., description="Number of data rows processed")

    model_config = {
        "json_schema_extra": {
            "example": {
                "original": "name,age\nAlice,30\nBob,25",
                "result": '[{"name":"Alice","age":"30"}]',
                "direction": "csv_to_json",
                "rows": 2,
            }
        }
    }


# --- Generate models ---


class GenerateRequest(BaseModel):
    """Request model for text generation (UUID / lorem ipsum)"""

    type: Literal["uuid", "lorem"] = Field(..., description="Type of text to generate")
    count: int = Field(1, description="Number of items to generate", ge=1)
    lorem_type: Literal["words", "sentences", "paragraphs"] = Field(
        "paragraphs",
        description="Type of lorem ipsum text to generate",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "uuid",
                "count": 3,
            }
        }
    }


class GenerateResponse(BaseModel):
    """Response model for text generation"""

    type: str = Field(..., description="Type of generated text")
    count: int = Field(..., description="Number of items generated")
    result: str = Field(..., description="Generated text")

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "uuid",
                "count": 1,
                "result": "550e8400-e29b-41d4-a716-446655440000",
            }
        }
    }
