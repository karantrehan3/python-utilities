# PDF Unlock API

A FastAPI-based service to unlock password-protected PDF files using Docker.

## Features

- RESTful API for unlocking password-protected PDFs
- File upload support via multipart form data
- Docker containerization for easy deployment
- Automatic cleanup of temporary files
- Health check endpoint

## API Endpoints

### GET /

Health check endpoint that returns a simple message.

### POST /unlock

Unlocks a password-protected PDF file.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: PDF file (required)
  - `password`: Password string (required)

**Response:**

- Success: Returns the unlocked PDF file for download
- Error: Returns error message with appropriate HTTP status code

## Quick Start

### Using Docker Compose (Recommended)

1. Navigate to the unlock-pdf directory:

   ```bash
   cd utilities/unlock-pdf
   ```

2. Build and start the service:

   ```bash
   docker-compose up --build
   ```

3. The API will be available at `http://localhost:4000`

### Using Docker directly

1. Build the Docker image:

   ```bash
   docker build -t pdf-unlock-api .
   ```

2. Run the container:
   ```bash
   docker run -p 4000:4000 pdf-unlock-api
   ```

### Testing the API

You can test the API using curl:

```bash
curl -X POST "http://localhost:4000/unlock" \
  -F "file=@your_password_protected_file.pdf" \
  -F "password=your_password" \
  --output unlocked_file.pdf
```

Or using the FastAPI interactive docs at `http://localhost:4000/docs`

## API Documentation

Once the service is running, you can access:

- Interactive API docs: `http://localhost:4000/docs`
- ReDoc documentation: `http://localhost:4000/redoc`

## Environment

- Python 3.13 (slim image)
- FastAPI
- PyMuPDF (fitz)
- Uvicorn ASGI server

## Security Notes

- Temporary files are automatically cleaned up after processing
- The service runs in a containerized environment
- No persistent storage of uploaded files
