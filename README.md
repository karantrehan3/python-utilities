# [Kiln](https://karantrehan3.github.io/kiln/)

<p align="center">
  <img alt="python" src="https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white" />
  <img alt="fastapi" src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" />
  <img alt="react" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="typescript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="docker" src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" />
  <img alt="license" src="https://img.shields.io/badge/license-MIT-green" />
</p>

Full-stack utility toolkit — a React frontend with a FastAPI backend for PDF, image, and text processing. One `make dev` and you're running both with hot reload.

## Project structure

```
kiln/
├── client/                 # React + Vite + Mantine UI
│   ├── src/
│   │   ├── components/     # PDF, Image, Text operation pages
│   │   ├── api/            # API client wrappers
│   │   └── hooks/          # Shared React hooks
│   ├── Dockerfile          # Multi-stage (dev + prod)
│   └── package.json
├── server/                 # FastAPI backend
│   ├── src/app/
│   │   ├── routes/api/v1/  # pdf/, image/, text/ controllers
│   │   ├── core/           # Config and settings
│   │   └── server.py       # App factory
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml      # Orchestrates client + server
├── Makefile                # Dev, build, test, format commands
└── index.html              # GitHub Pages landing page
```

## Quick start

### Local development (recommended)

```bash
make install        # install server venv + client node_modules
make dev            # runs both with HMR (server :4001, client :3000)
```

### Docker

```bash
make start          # build & run both services
make stop           # tear down
```

## API endpoints

### PDF (`/api/v1/pdf`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/unlock` | POST | Unlock a password-protected PDF |
| `/info` | POST | Get page count, encryption status, metadata |
| `/subset` | POST | Extract a page range into a new PDF |
| `/merge` | POST | Merge multiple PDFs into one |
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

## Usage examples

```bash
# Unlock a PDF
curl -X POST http://localhost:4001/api/v1/pdf/unlock \
  -F "file=@protected.pdf" -F "password=secret" \
  -o unlocked.pdf

# Merge PDFs
curl -X POST http://localhost:4001/api/v1/pdf/merge \
  -F "files=@doc1.pdf" -F "files=@doc2.pdf" \
  -o merged.pdf

# Hash text
curl -X POST http://localhost:4001/api/v1/text/hash \
  -H "Content-Type: application/json" \
  -d '{"text": "hello", "algorithm": "sha256"}'
```

## Make targets

| Target | Description |
|--------|-------------|
| `make dev` | Run server + client locally with HMR |
| `make start` | Docker Compose build and up |
| `make stop` | Docker Compose down |
| `make test` | Run server + client tests |
| `make format` | Prettier (client) + Black/isort (server) |
| `make lint` | ESLint (client) + Flake8 (server) |
| `make install` | Install all dependencies |

## API docs

- **Swagger UI** — [localhost:4001/docs](http://localhost:4001/docs)
- **ReDoc** — [localhost:4001/redoc](http://localhost:4001/redoc)

## Tech stack

**Frontend:** React 19 · TypeScript · Vite · Mantine v7 · React Router

**Backend:** Python 3.13 · FastAPI · PyMuPDF (fitz) · Pillow · Pydantic v2

**Infra:** Docker · Docker Compose · Nginx (prod)

## License

[MIT](LICENSE)
