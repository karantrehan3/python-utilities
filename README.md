# [Python Utilities API](https://karantrehan3.github.io/python-utilities/)

<p align="center">
  <img alt="python" src="https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white" />
  <img alt="fastapi" src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" />
  <img alt="docker" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-green" />
</p>

A unified FastAPI server that bundles PDF, image, and text utilities behind a single API. One container, one port, all your processing needs.

## Utilities

### PDF (`/api/v1/pdf`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/unlock` | POST | Unlock a password-protected PDF |
| `/info` | POST | Get page count, encryption status, metadata |
| `/subset` | POST | Extract a page range into a new PDF |
| `/from-images` | POST | Combine multiple images into a single PDF |
| `/compress` | POST | Compress a PDF (returns the file) |
| `/compress/info` | POST | Compress a PDF (returns size-reduction stats) |

### Image (`/api/v1/image`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/resize` | POST | Resize via base64 or URL |
| `/convert` | POST | Convert format via base64 or URL |
| `/info` | POST | Dimensions, format, size via base64 or URL |
| `/resize/file` | POST | Resize from file upload |
| `/convert/file` | POST | Convert from file upload |
| `/info/file` | POST | Info from file upload |
| `/formats` | GET | List supported formats |

### Text (`/api/v1/text`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hash` | POST | Hash text (MD5, SHA-256, etc.) |
| `/encode` | POST | Base64 / hex encode |
| `/decode` | POST | Base64 / hex decode |
| `/algorithms` | GET | List supported hash algorithms |
| `/encodings` | GET | List supported encodings |

## Quick start

### Docker (recommended)

```bash
make start          # build & run on port 4001
make stop           # tear down
```

### Local development

```bash
make install-dev    # install deps + pre-commit hooks
make dev-reload     # uvicorn with auto-reload on :4001
make test           # pytest
```

## Usage examples

```bash
# Unlock a PDF
curl -X POST http://localhost:4001/api/v1/pdf/unlock \
  -F "file=@protected.pdf" -F "password=secret" \
  -o unlocked.pdf

# Combine images into a PDF
curl -X POST http://localhost:4001/api/v1/pdf/from-images \
  -F "files=@page1.png" -F "files=@page2.jpg" \
  -o combined.pdf

# Compress a PDF
curl -X POST http://localhost:4001/api/v1/pdf/compress \
  -F "file=@large.pdf" -F "image_quality=60" \
  -o compressed.pdf

# Compression stats (JSON)
curl -X POST http://localhost:4001/api/v1/pdf/compress/info \
  -F "file=@large.pdf" -F "image_quality=60"

# Hash text
curl -X POST http://localhost:4001/api/v1/text/hash \
  -H "Content-Type: application/json" \
  -d '{"text": "hello", "algorithm": "sha256"}'

# Resize an image
curl -X POST http://localhost:4001/api/v1/image/resize/file \
  -F "file=@photo.png" -F "width=200" -F "height=200"
```

## API docs

- **Swagger UI** — [localhost:4001/docs](http://localhost:4001/docs)
- **ReDoc** — [localhost:4001/redoc](http://localhost:4001/redoc)
- **Health** — [localhost:4001/health](http://localhost:4001/health)

## Project structure

```
src/app/
├── core/config.py          # Settings
├── dependencies/common.py  # FileHandler, error classes
├── routes/api/v1/
│   ├── pdf/                # unlock, info, subset, from-images, compress
│   ├── image/              # resize, convert, info (base64/URL/file)
│   └── text/               # hash, encode, decode
└── server.py               # FastAPI app factory
```

## Tech stack

Python 3.13 · FastAPI · PyMuPDF (fitz) · Pillow · Pydantic v2 · Docker

## License

[MIT](LICENSE)
