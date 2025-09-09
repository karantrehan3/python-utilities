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
│   │   ├── routers/      # API routers for each utility
│   │   │   ├── __init__.py
│   │   │   ├── base.py   # Base router class
│   │   │   ├── pdf_unlock.py
│   │   │   └── text_utils.py
│   │   ├── __init__.py
│   │   └── main.py       # Main FastAPI application
│   └── tests/            # Test modules
│       ├── __init__.py
│       └── test_text_utils.py
├── requirements.txt      # Unified dependencies
├── setup.py             # Package configuration
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── Makefile            # Build and run commands
```

## Features

### Current Utilities

1. **PDF Unlock** (`/api/v1/pdf/unlock`)

   - Unlock password-protected PDF files
   - Endpoint: `POST /api/v1/pdf/unlock`
   - Parameters: `file` (PDF file), `password` (string)

2. **Text Utilities** (`/api/v1/text-utils`)
   - MD5 hashing: `POST /api/v1/text-utils/hash/md5`
   - SHA256 hashing: `POST /api/v1/text-utils/hash/sha256`
   - Base64 encoding: `POST /api/v1/text-utils/encode/base64`
   - Base64 decoding: `POST /api/v1/text-utils/decode/base64`

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
# MD5 Hash
curl -X POST "http://localhost:4001/api/v1/text-utils/hash/md5" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!"}'

# SHA256 Hash
curl -X POST "http://localhost:4001/api/v1/text-utils/hash/sha256" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!"}'

# Base64 Encode
curl -X POST "http://localhost:4001/api/v1/text-utils/encode/base64" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!"}'

# Base64 Decode
curl -X POST "http://localhost:4001/api/v1/text-utils/decode/base64" \
  -H "Content-Type: application/json" \
  -d '{"text": "SGVsbG8sIFdvcmxkIQ=="}'
```

### Python Examples

```python
import requests

# Text utilities
base_url = "http://localhost:4001/api/v1/text-utils"

# MD5 hash
response = requests.post(f"{base_url}/hash/md5", json={"text": "Hello, World!"})
print(response.json())  # {"result": "65a8e27d8879283831b664bd8b7f0ad4"}

# Base64 encode
response = requests.post(f"{base_url}/encode/base64", json={"text": "Hello, World!"})
encoded = response.json()["result"]

# Base64 decode
response = requests.post(f"{base_url}/decode/base64", json={"text": encoded})
print(response.json())  # {"result": "Hello, World!"}
```

## Adding New Utilities

To add a new utility:

1. **Create a new router file** in `src/app/routers/`:

   ```python
   # src/app/routers/new_utility.py
   from .base import BaseUtilityRouter, UtilityInfo
   from ..dependencies.common import UtilityResponse, ValidationError

   class NewUtilityRouter(BaseUtilityRouter):
       def __init__(self):
           super().__init__(
               prefix="/new-utility",
               tags=["New Utility"]
           )

       def get_utility_info(self):
           info = UtilityInfo(
               name="New Utility",
               description="Description of your utility",
               version="1.0.0",
               endpoints=[
                   {"name": "process", "description": "POST /process - Process data"}
               ]
           )
           return info.to_dict()

       def _setup_routes(self):
           self._add_info_route()

           @self.router.post("/process")
           async def process():
               # Your utility logic here
               return UtilityResponse.success({"result": "processed"})

   # Create the router instance
   new_utility_router = NewUtilityRouter()
   router = new_utility_router.router
   ```

2. **Add the router** to `src/app/main.py`:

   ```python
   from .routers import new_utility

   app.include_router(
       new_utility.router,
       prefix=settings.api_prefix,
       tags=["New Utility"]
   )
   ```

3. **Update dependencies** in `requirements.txt` if needed

4. **Add tests** in `src/tests/test_new_utility.py`

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

# Test PDF unlock
curl -X POST "http://localhost:4001/unlock-pdf/unlock" \
  -F "file=@test.pdf" \
  -F "password=test"
```

## License

See [LICENSE](LICENSE) file for details.
