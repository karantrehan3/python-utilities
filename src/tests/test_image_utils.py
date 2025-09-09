from fastapi.testclient import TestClient

from src.app.main import app

client = TestClient(app)


class TestImageUtils:
    """Test cases for image utilities"""

    def test_image_utils_info(self):
        """Test image utilities info endpoint"""
        response = client.get("/api/v1/image-utils/")
        assert response.status_code == 200
        data = response.json()
        assert data["utility"] == "Image Utilities"
        assert "description" in data
        assert "endpoints" in data

    def test_image_resize(self):
        """Test image resize endpoint"""
        # Using a minimal 1x1 PNG image in base64
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image-utils/resize",
            json={
                "image_data": test_image,
                "format": "PNG",
                "width": 100,
                "height": 100,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert "format" in data
        assert "size" in data
        assert data["format"] == "PNG"

    def test_image_convert(self):
        """Test image convert endpoint"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image-utils/convert",
            json={"image_data": test_image, "format": "PNG", "target_format": "JPEG"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert "format" in data
        assert "size" in data
        assert data["format"] == "JPEG"

    def test_image_info(self):
        """Test image info endpoint"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image-utils/info", json={"image_data": test_image}
        )
        assert response.status_code == 200
        data = response.json()
        assert "format" in data
        assert "size" in data
        assert "dimensions" in data

    def test_empty_image_data_validation(self):
        """Test validation for empty image data"""
        response = client.post(
            "/api/v1/image-utils/resize",
            json={"image_data": "", "format": "PNG", "width": 100, "height": 100},
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_invalid_dimensions_validation(self):
        """Test validation for invalid dimensions"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image-utils/resize",
            json={
                "image_data": test_image,
                "format": "PNG",
                "width": -1,
                "height": 100,
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_invalid_format_validation(self):
        """Test validation for invalid target format"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image-utils/convert",
            json={
                "image_data": test_image,
                "format": "PNG",
                "target_format": "INVALID",
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
