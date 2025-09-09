# Python Utilities API

A unified FastAPI server that provides various Python utilities through a single API endpoint. This approach optimizes resource utilization by running all utilities on a single server instead of separate servers for each utility.

## Architecture

The project follows the `src` layout pattern for better organization and maintainability:

```
python-utilities/
├── src/                   # Source code directory
│   ├── app/              # Main application
│   │   ├── core/         # Core configuration and settings
│   │   │   ├── __init__.py
│   │   │   └── config.py # Application settings
│   │   ├── dependencies/ # Common dependencies and utilities
│   │   │   ├── __init__.py
│   │   │   └── common.py # Shared functionality
│   │   ├── routes/       # API routes for each utility
│   │   │   ├── __init__.py
│   │   │   └── api/      # API versioning
│   │   │       └── v1/   # API v1 routes
│   │   │           ├── pdf/    # PDF utilities
│   │   │           ├── text/   # Text utilities
│   │   │           └── image/  # Image utilities
│   │   ├── __init__.py
│   │   └── server.py     # Main FastAPI application
│   └── tests/            # Test modules
│       ├── __init__.py
│       ├── test_text_utils.py
│       └── test_image_utils.py
├── requirements.txt      # Unified dependencies
├── setup.py             # Package configuration
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── Makefile            # Build and run commands
```

## Features

### Current Utilities

1. **PDF Utilities** (`/api/v1/pdf`)

   - Unlock password-protected PDF files
   - Endpoint: `POST /api/v1/pdf/unlock`
   - Parameters: `file` (PDF file), `password` (string)

2. **Text Utilities** (`/api/v1/text`)

   - Hash generation: `POST /api/v1/text/hash`
   - Base64 encoding: `POST /api/v1/text/encode`
   - Base64 decoding: `POST /api/v1/text/decode`
   - Supported algorithms: `GET /api/v1/text/algorithms`
   - Supported encodings: `GET /api/v1/text/encodings`

3. **Image Utilities** (`/api/v1/image`)
   - Image resize: `POST /api/v1/image/resize`
   - Image convert: `POST /api/v1/image/convert`
   - Image info: `POST /api/v1/image/info`
   - File upload variants: `/resize/file`, `/convert/file`, `/info/file`
   - Supported formats: `GET /api/v1/image/formats`

### API Documentation

- **Swagger UI**: `http://localhost:4001/docs`
- **ReDoc**: `http://localhost:4001/redoc`
- **Health Check**: `http://localhost:4001/health`
- **API Root**: `http://localhost:4001/` - Server info and available utilities

## Quick Start

### Using Docker (Recommended)

1. **Start the server:**

   ```bash
   make start
   ```

2. **Stop the server:**
   ```bash
   make stop
   ```

### Development Mode

1. **Install dependencies:**

   ```bash
   make install-dev
   ```

2. **Run locally:**

   ```bash
   make dev
   ```

3. **Run with auto-reload:**

   ```bash
   make dev-reload
   ```

4. **Run tests:**
   ```bash
   make test
   ```

## Usage Examples

### PDF Unlock

```bash
# Using curl
curl -X POST "http://localhost:4001/api/v1/pdf/unlock" \
  -F "file=@protected.pdf" \
  -F "password=yourpassword" \
  --output unlocked.pdf

# Using Python requests
import requests

url = "http://localhost:4001/api/v1/pdf/unlock"
files = {"file": open("protected.pdf", "rb")}
data = {"password": "yourpassword"}

response = requests.post(url, files=files, data=data)
with open("unlocked.pdf", "wb") as f:
    f.write(response.content)
```

### Text Utilities

```bash
# Hash Generation
curl -X POST "http://localhost:4001/api/v1/text/hash" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!", "algorithm": "md5"}'

# Base64 Encode
curl -X POST "http://localhost:4001/api/v1/text/encode" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!", "encoding": "base64"}'

# Base64 Decode
curl -X POST "http://localhost:4001/api/v1/text/decode" \
  -H "Content-Type: application/json" \
  -d '{"text": "SGVsbG8sIFdvcmxkIQ==", "encoding": "base64"}'

# Get supported algorithms
curl -X GET "http://localhost:4001/api/v1/text/algorithms"

# Get supported encodings
curl -X GET "http://localhost:4001/api/v1/text/encodings"
```

### Image Utilities

```bash
# Resize Image
curl -X POST "http://localhost:4001/api/v1/image/resize" \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_encoded_image", "format": "PNG", "width": 100, "height": 100}'

# Convert Image
curl -X POST "http://localhost:4001/api/v1/image/convert" \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_encoded_image", "format": "PNG", "target_format": "JPEG"}'

# Get Image Info
curl -X POST "http://localhost:4001/api/v1/image/info" \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_encoded_image"}'

# Get supported formats
curl -X GET "http://localhost:4001/api/v1/image/formats"
```

### Python Examples

```python
import requests

# Text utilities
base_url = "http://localhost:4001/api/v1/text"

# Hash generation
response = requests.post(f"{base_url}/hash", json={"text": "Hello, World!", "algorithm": "md5"})
print(response.json())  # {"result": "65a8e27d8879283831b664bd8b7f0ad4"}

# Base64 encode
response = requests.post(f"{base_url}/encode", json={"text": "Hello, World!", "encoding": "base64"})
encoded = response.json()["result"]

# Base64 decode
response = requests.post(f"{base_url}/decode", json={"text": encoded, "encoding": "base64"})
print(response.json())  # {"result": "Hello, World!"}

# Image utilities
image_url = "http://localhost:4001/api/v1/image"

# Resize image
response = requests.post(f"{image_url}/resize", json={
    "image_data": "base64_encoded_image",
    "format": "PNG",
    "width": 100,
    "height": 100
})
print(response.json())  # {"result": "resized_image_base64", "format": "PNG", "size": "100x100"}
```

## Adding New Utilities

To add a new utility:

1. **Create a new utility directory** in `src/app/routes/api/v1/`:

   ```python
   # src/app/routes/api/v1/new_utility/__init__.py
   from fastapi import APIRouter
   from .controller import NewUtilityController
   from .validator import NewUtilityRequest, NewUtilityResponse

   # Create the router
   router = APIRouter()

   @router.post(
       "/process",
       response_model=NewUtilityResponse,
       summary="Process Data",
       description="Process data using the new utility",
   )
   async def process_data(request: NewUtilityRequest):
       return await NewUtilityController.process_data(request)

   @router.get(
       "/",
       summary="New Utility Info",
       description="Get information about the new utility",
   )
   async def get_utility_info():
       return {
           "utility": "New Utility",
           "description": "Description of your utility",
           "version": "1.0.0",
           "endpoints": {
               "process": "POST /process - Process data"
           }
       }
   ```

2. **Add the router** to `src/app/routes/api/v1/__init__.py`:

   ```python
   from src.app.routes.api.v1.new_utility import router as new_utility_router

   # Include the new utility router
   router.include_router(new_utility_router, prefix="/new-utility", tags=["New Utility"])
   ```

3. **Create controller and validator files** in the new utility directory

4. **Update dependencies** in `requirements.txt` if needed

5. **Add tests** in `src/tests/test_new_utility.py`

## Benefits of Unified Architecture

1. **Resource Efficiency**: Single server handles all utilities
2. **Simplified Deployment**: One container to manage
3. **Shared Dependencies**: Common libraries loaded once
4. **Unified API**: Consistent interface across all utilities
5. **Easy Scaling**: Scale the entire service as one unit
6. **Cost Effective**: Reduced infrastructure costs

## Configuration

### Environment Variables

- `PYTHONUNBUFFERED=1`: Ensures Python output is sent straight to terminal

### Port Configuration

- Default port: `4001`
- Change in `docker-compose.yml` or `main.py` as needed

## Development

### Project Structure

- Each utility is a separate module with its own router
- Common functionality can be shared through utility functions
- All utilities share the same FastAPI app instance

### Testing

```bash
# Test the API
curl http://localhost:4001/health

# Test text utilities
curl -X POST "http://localhost:4001/api/v1/text/hash" \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "algorithm": "md5"}'

# Test image utilities
curl -X GET "http://localhost:4001/api/v1/image/formats"

# Run all tests
make test
```

## License

See [LICENSE](LICENSE) file for details.
