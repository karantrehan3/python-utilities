from fastapi.testclient import TestClient

from src.app.server import app

client = TestClient(app)


class TestTextUtils:
    """Test cases for text utilities"""

    def test_text_utils_info(self):
        """Test text utilities info endpoint"""
        response = client.get("/api/v1/text/")
        assert response.status_code == 200
        data = response.json()
        assert data["utility"] == "Text Utilities"
        assert "description" in data
        assert "endpoints" in data

    def test_md5_hash(self):
        """Test MD5 hashing"""
        response = client.post(
            "/api/v1/text/hash", json={"text": "Hello, World!", "algorithm": "md5"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert "algorithm" in data
        assert data["algorithm"] == "MD5"
        assert len(data["result"]) == 32  # MD5 hash length

    def test_sha256_hash(self):
        """Test SHA256 hashing"""
        response = client.post(
            "/api/v1/text/hash", json={"text": "Hello, World!", "algorithm": "sha256"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert "algorithm" in data
        assert data["algorithm"] == "SHA256"
        assert len(data["result"]) == 64  # SHA256 hash length

    def test_base64_encode(self):
        """Test base64 encoding"""
        response = client.post(
            "/api/v1/text/encode", json={"text": "Hello, World!", "encoding": "base64"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert "encoding" in data
        assert data["encoding"] == "BASE64"

    def test_base64_decode(self):
        """Test base64 decoding"""
        # First encode
        encode_response = client.post(
            "/api/v1/text/encode", json={"text": "Hello, World!", "encoding": "base64"}
        )
        encoded_text = encode_response.json()["result"]

        # Then decode
        decode_response = client.post(
            "/api/v1/text/decode", json={"text": encoded_text, "encoding": "base64"}
        )
        assert decode_response.status_code == 200
        data = decode_response.json()
        assert data["result"] == "Hello, World!"
        assert data["encoding"] == "BASE64"

    def test_empty_text_validation(self):
        """Test validation for empty text"""
        response = client.post(
            "/api/v1/text/hash", json={"text": "", "algorithm": "md5"}
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
