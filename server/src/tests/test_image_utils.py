import io

from fastapi.testclient import TestClient
from PIL import Image

from src.app.server import app

client = TestClient(app)


class TestImageUtils:
    """Test cases for image utilities"""

    def test_image_utils_info(self):
        """Test image utilities info endpoint"""
        response = client.get("/api/v1/image/")
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
            "/api/v1/image/resize",
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
            "/api/v1/image/convert",
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

        response = client.post("/api/v1/image/info", json={"image_data": test_image})
        assert response.status_code == 200
        data = response.json()
        assert "format" in data
        assert "size" in data
        assert "dimensions" in data

    def test_empty_image_data_validation(self):
        """Test validation for empty image data"""
        response = client.post(
            "/api/v1/image/resize",
            json={"image_data": "", "format": "PNG", "width": 100, "height": 100},
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_invalid_dimensions_validation(self):
        """Test validation for invalid dimensions"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_data": test_image,
                "format": "PNG",
                "width": -1,
                "height": 100,
            },
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_invalid_format_validation(self):
        """Test validation for invalid target format"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image/convert",
            json={
                "image_data": test_image,
                "format": "PNG",
                "target_format": "INVALID",
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_resize_with_aspect_ratio(self):
        """Test image resize with aspect ratio maintained"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_data": test_image,
                "format": "PNG",
                "width": 200,
                "height": 100,
                "maintain_aspect_ratio": True,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["format"] == "PNG"
        # The result should be different from input due to actual resizing
        assert data["result"] != test_image

    def test_resize_without_aspect_ratio(self):
        """Test image resize without maintaining aspect ratio"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_data": test_image,
                "format": "PNG",
                "width": 200,
                "height": 100,
                "maintain_aspect_ratio": False,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["format"] == "PNG"
        # The result should be different from input due to actual resizing
        assert data["result"] != test_image

    def test_image_info_actual_data(self):
        """Test image info with actual image data analysis"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post("/api/v1/image/info", json={"image_data": test_image})
        assert response.status_code == 200
        data = response.json()
        assert "format" in data
        assert "size" in data
        assert "dimensions" in data
        assert "width" in data
        assert "height" in data
        # Should return actual image dimensions (1x1 for this test image)
        assert data["width"] == 1
        assert data["height"] == 1
        assert data["dimensions"] == "1x1"

    def test_convert_actual_conversion(self):
        """Test actual image format conversion"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

        response = client.post(
            "/api/v1/image/convert",
            json={"image_data": test_image, "format": "PNG", "target_format": "JPEG"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["format"] == "JPEG"
        # The result should be different from input due to actual conversion
        assert data["result"] != test_image

    def test_supported_formats(self):
        """Test getting supported formats"""
        response = client.get("/api/v1/image/formats")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert "PNG" in data
        assert "JPEG" in data
        assert "GIF" in data
        assert "BMP" in data
        assert "WEBP" in data

    # URL-based tests
    def test_resize_with_url(self):
        """Test image resize with URL input"""
        # Using a publicly available test image URL
        test_url = "https://via.placeholder.com/100x100.png"

        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_url": test_url,
                "format": "PNG",
                "width": 50,
                "height": 50,
                "maintain_aspect_ratio": True,
            },
        )
        # URL might not be accessible in test environment, so expect 400
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "result" in data
            assert data["format"] == "PNG"

    def test_convert_with_url(self):
        """Test image convert with URL input"""
        test_url = "https://via.placeholder.com/100x100.png"

        response = client.post(
            "/api/v1/image/convert",
            json={
                "image_url": test_url,
                "format": "PNG",
                "target_format": "JPEG",
            },
        )
        # URL might not be accessible in test environment, so expect 400
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "result" in data
            assert data["format"] == "JPEG"

    def test_info_with_url(self):
        """Test image info with URL input"""
        test_url = "https://via.placeholder.com/100x100.png"

        response = client.post("/api/v1/image/info", json={"image_url": test_url})
        # URL might not be accessible in test environment, so expect 400
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            data = response.json()
            assert "format" in data
            assert "size" in data
            assert "dimensions" in data
            assert "width" in data
            assert "height" in data

    def test_invalid_url(self):
        """Test validation for invalid URL"""
        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_url": "not-a-valid-url",
                "format": "PNG",
                "width": 100,
                "height": 100,
            },
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_nonexistent_url(self):
        """Test validation for non-existent URL"""
        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_url": "https://example.com/nonexistent-image.png",
                "format": "PNG",
                "width": 100,
                "height": 100,
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    # File upload tests
    def test_resize_with_file_upload(self):
        """Test image resize with file upload"""
        # Create a test image
        test_image = Image.new("RGB", (100, 100), color="red")
        image_buffer = io.BytesIO()
        test_image.save(image_buffer, format="PNG")
        image_buffer.seek(0)

        response = client.post(
            "/api/v1/image/resize/file",
            files={"file": ("test.png", image_buffer, "image/png")},
            data={
                "width": 50,
                "height": 50,
                "maintain_aspect_ratio": True,
                "format": "PNG",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["format"] == "PNG"

    def test_convert_with_file_upload(self):
        """Test image convert with file upload"""
        # Create a test image
        test_image = Image.new("RGB", (100, 100), color="blue")
        image_buffer = io.BytesIO()
        test_image.save(image_buffer, format="PNG")
        image_buffer.seek(0)

        response = client.post(
            "/api/v1/image/convert/file",
            files={"file": ("test.png", image_buffer, "image/png")},
            data={"target_format": "JPEG", "format": "PNG"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "result" in data
        assert data["format"] == "JPEG"

    def test_info_with_file_upload(self):
        """Test image info with file upload"""
        # Create a test image
        test_image = Image.new("RGB", (150, 200), color="green")
        image_buffer = io.BytesIO()
        test_image.save(image_buffer, format="PNG")
        image_buffer.seek(0)

        response = client.post(
            "/api/v1/image/info/file",
            files={"file": ("test.png", image_buffer, "image/png")},
            data={"format": "PNG"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "format" in data
        assert "size" in data
        assert "dimensions" in data
        assert "width" in data
        assert "height" in data
        assert data["width"] == 150
        assert data["height"] == 200
        assert data["dimensions"] == "150x200"

    def test_invalid_file_upload(self):
        """Test validation for invalid file upload"""
        # Create a text file instead of image
        text_buffer = io.BytesIO(b"This is not an image")

        response = client.post(
            "/api/v1/image/resize/file",
            files={"file": ("test.txt", text_buffer, "text/plain")},
            data={"width": 100, "height": 100, "format": "PNG"},
        )
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    def test_missing_file_upload(self):
        """Test validation for missing file upload"""
        response = client.post(
            "/api/v1/image/resize/file",
            data={"width": 100, "height": 100, "format": "PNG"},
        )
        assert response.status_code == 422  # Validation error

    # Mixed input validation tests
    def test_both_inputs_provided(self):
        """Test when both base64 and URL are provided"""
        test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        test_url = "https://via.placeholder.com/100x100.png"

        response = client.post(
            "/api/v1/image/resize",
            json={
                "image_data": test_image,
                "image_url": test_url,
                "format": "PNG",
                "width": 100,
                "height": 100,
            },
        )
        # Should work with either input
        assert response.status_code == 200

    def test_no_input_provided(self):
        """Test when neither base64 nor URL is provided"""
        response = client.post(
            "/api/v1/image/resize",
            json={
                "format": "PNG",
                "width": 100,
                "height": 100,
            },
        )
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
