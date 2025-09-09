from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


class TestTextUtils:
    """Test cases for text utilities"""

    def test_text_utils_info(self):
        """Test text utilities info endpoint"""
        response = client.get("/api/v1/text-utils/")
        assert response.status_code == 200
        data = response.json()
        assert data["utility"] == "Text Utilities"
        assert "description" in data
        assert "endpoints" in data

    def test_md5_hash(self):
        """Test MD5 hashing"""
        response = client.post(
            "/api/v1/text-utils/hash/md5", json={"text": "Hello, World!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert len(data["result"]) == 32  # MD5 hash length

    def test_sha256_hash(self):
        """Test SHA256 hashing"""
        response = client.post(
            "/api/v1/text-utils/hash/sha256", json={"text": "Hello, World!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert len(data["result"]) == 64  # SHA256 hash length

    def test_base64_encode(self):
        """Test base64 encoding"""
        response = client.post(
            "/api/v1/text-utils/encode/base64", json={"text": "Hello, World!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data

    def test_base64_decode(self):
        """Test base64 decoding"""
        # First encode
        encode_response = client.post(
            "/api/v1/text-utils/encode/base64", json={"text": "Hello, World!"}
        )
        encoded_text = encode_response.json()["result"]

        # Then decode
        decode_response = client.post(
            "/api/v1/text-utils/decode/base64", json={"text": encoded_text}
        )
        assert decode_response.status_code == 200
        data = decode_response.json()
        assert data["result"] == "Hello, World!"

    def test_empty_text_validation(self):
        """Test validation for empty text"""
        response = client.post("/api/v1/text-utils/hash/md5", json={"text": ""})
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
