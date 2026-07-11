import base64
import csv
import difflib
import hashlib
import io
import json
import re
import uuid
from typing import Dict, List

from src.app.dependencies.common import ProcessingError, ValidationError
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
    RegexMatch,
    RegexRequest,
    RegexResponse,
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

    # --- Diff ---

    @staticmethod
    async def diff_text(request: DiffRequest) -> DiffResponse:
        """
        Compute a unified diff between two texts.

        Args:
            request: Diff request containing text1 and text2

        Returns:
            DiffResponse with the unified diff and line counts
        """
        try:
            lines1 = request.text1.splitlines(keepends=True)
            lines2 = request.text2.splitlines(keepends=True)

            diff_lines = list(
                difflib.unified_diff(
                    lines1,
                    lines2,
                    fromfile="text1",
                    tofile="text2",
                )
            )

            additions = sum(
                1
                for line in diff_lines
                if line.startswith("+") and not line.startswith("+++")
            )
            deletions = sum(
                1
                for line in diff_lines
                if line.startswith("-") and not line.startswith("---")
            )

            return DiffResponse(
                text1=request.text1,
                text2=request.text2,
                diff="".join(diff_lines),
                additions=additions,
                deletions=deletions,
            )

        except Exception as e:
            raise ProcessingError(f"Error computing diff: {str(e)}")

    # --- Regex ---

    FLAG_MAP = {
        "i": re.IGNORECASE,
        "m": re.MULTILINE,
        "s": re.DOTALL,
    }

    @staticmethod
    async def regex_match(request: RegexRequest) -> RegexResponse:
        """
        Find all regex matches in the input text.

        Args:
            request: Regex request with text, pattern, and flags

        Returns:
            RegexResponse with all matches and count
        """
        try:
            combined_flags = 0
            for char in request.flags:
                flag = TextController.FLAG_MAP.get(char)
                if flag is None:
                    raise ValidationError(
                        f"Unsupported flag '{char}'. "
                        f"Supported: {list(TextController.FLAG_MAP.keys())}",
                        "flags",
                    )
                combined_flags |= flag

            try:
                compiled = re.compile(request.pattern, combined_flags)
            except re.error as e:
                raise ValidationError(f"Invalid regex pattern: {str(e)}", "pattern")

            matches: List[RegexMatch] = []
            for m in compiled.finditer(request.text):
                groups = [g if g is not None else "" for g in m.groups()]
                matches.append(
                    RegexMatch(
                        match=m.group(),
                        start=m.start(),
                        end=m.end(),
                        groups=groups,
                    )
                )

            return RegexResponse(
                pattern=request.pattern,
                text=request.text,
                matches=matches,
                count=len(matches),
            )

        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error performing regex match: {str(e)}")

    # --- JSON format ---

    @staticmethod
    async def json_format(
        request: JsonFormatRequest,
    ) -> JsonFormatResponse:
        """
        Parse and pretty-print a JSON string.

        Args:
            request: JSON format request with text, indent, sort_keys

        Returns:
            JsonFormatResponse with formatted output
        """
        try:
            parsed = json.loads(request.text)
            formatted = json.dumps(
                parsed,
                indent=request.indent,
                sort_keys=request.sort_keys,
                ensure_ascii=False,
            )
            return JsonFormatResponse(
                original=request.text,
                formatted=formatted,
                valid=True,
                error=None,
            )
        except json.JSONDecodeError as e:
            return JsonFormatResponse(
                original=request.text,
                formatted="",
                valid=False,
                error=str(e),
            )
        except Exception as e:
            raise ProcessingError(f"Error formatting JSON: {str(e)}")

    # --- JSON minify ---

    @staticmethod
    async def json_minify(
        request: JsonMinifyRequest,
    ) -> JsonMinifyResponse:
        """
        Parse and minify a JSON string.

        Args:
            request: JSON minify request with text

        Returns:
            JsonMinifyResponse with minified output
        """
        try:
            parsed = json.loads(request.text)
            minified = json.dumps(
                parsed,
                separators=(",", ":"),
                ensure_ascii=False,
            )
            return JsonMinifyResponse(
                original=request.text,
                minified=minified,
                valid=True,
                error=None,
            )
        except json.JSONDecodeError as e:
            return JsonMinifyResponse(
                original=request.text,
                minified="",
                valid=False,
                error=str(e),
            )
        except Exception as e:
            raise ProcessingError(f"Error minifying JSON: {str(e)}")

    # --- CSV / JSON conversion ---

    @staticmethod
    async def csv_json_convert(
        request: CsvJsonRequest,
    ) -> CsvJsonResponse:
        """
        Convert between CSV and JSON formats.

        Args:
            request: Conversion request with text, direction, delimiter

        Returns:
            CsvJsonResponse with converted text
        """
        try:
            if request.direction == "csv_to_json":
                return TextController._csv_to_json(request)
            return TextController._json_to_csv(request)
        except ValidationError:
            raise
        except Exception as e:
            raise ProcessingError(f"Error converting {request.direction}: {str(e)}")

    @staticmethod
    def _csv_to_json(request: CsvJsonRequest) -> CsvJsonResponse:
        reader = csv.DictReader(
            io.StringIO(request.text),
            delimiter=request.delimiter,
        )
        rows = list(reader)
        result = json.dumps(rows, ensure_ascii=False, indent=2)
        return CsvJsonResponse(
            original=request.text,
            result=result,
            direction=request.direction,
            rows=len(rows),
        )

    @staticmethod
    def _json_to_csv(request: CsvJsonRequest) -> CsvJsonResponse:
        try:
            data = json.loads(request.text)
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON: {str(e)}", "text")

        if not isinstance(data, list) or not data:
            raise ValidationError("JSON must be a non-empty array of objects", "text")

        if not isinstance(data[0], dict):
            raise ValidationError("JSON array items must be objects", "text")

        output = io.StringIO()
        fieldnames = list(data[0].keys())
        writer = csv.DictWriter(
            output,
            fieldnames=fieldnames,
            delimiter=request.delimiter,
        )
        writer.writeheader()
        writer.writerows(data)

        return CsvJsonResponse(
            original=request.text,
            result=output.getvalue(),
            direction=request.direction,
            rows=len(data),
        )

    # --- Generate (UUID / Lorem Ipsum) ---

    LOREM_PARAGRAPH = (
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, "
        "sed do eiusmod tempor incididunt ut labore et dolore magna "
        "aliqua. Ut enim ad minim veniam, quis nostrud exercitation "
        "ullamco laboris nisi ut aliquip ex ea commodo consequat. "
        "Duis aute irure dolor in reprehenderit in voluptate velit "
        "esse cillum dolore eu fugiat nulla pariatur. Excepteur sint "
        "occaecat cupidatat non proident, sunt in culpa qui officia "
        "deserunt mollit anim id est laborum."
    )

    LOREM_WORDS = LOREM_PARAGRAPH.replace(",", "").replace(".", "").split()

    LOREM_SENTENCES = [s.strip() + "." for s in LOREM_PARAGRAPH.split(".") if s.strip()]

    @staticmethod
    async def generate_text(
        request: GenerateRequest,
    ) -> GenerateResponse:
        """
        Generate UUIDs or lorem ipsum text.

        Args:
            request: Generate request with type, count, lorem_type

        Returns:
            GenerateResponse with generated text
        """
        try:
            if request.type == "uuid":
                items = [str(uuid.uuid4()) for _ in range(request.count)]
                result = "\n".join(items)
            else:
                result = TextController._generate_lorem(
                    request.count, request.lorem_type
                )

            return GenerateResponse(
                type=request.type,
                count=request.count,
                result=result,
            )

        except Exception as e:
            raise ProcessingError(f"Error generating text: {str(e)}")

    @staticmethod
    def _generate_lorem(count: int, lorem_type: str) -> str:
        words = TextController.LOREM_WORDS
        sentences = TextController.LOREM_SENTENCES
        paragraph = TextController.LOREM_PARAGRAPH

        if lorem_type == "words":
            selected: List[str] = []
            while len(selected) < count:
                selected.extend(words)
            return " ".join(selected[:count])

        if lorem_type == "sentences":
            selected_s: List[str] = []
            while len(selected_s) < count:
                selected_s.extend(sentences)
            return " ".join(selected_s[:count])

        # paragraphs
        return "\n\n".join(paragraph for _ in range(count))
