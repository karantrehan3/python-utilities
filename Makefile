# Python Utilities API (Unified Server)
start:
	docker-compose down && \
	docker-compose build && \
	docker-compose up

# Development mode (run locally without Docker)
dev:
	pip install -r requirements.txt && \
	PYTHONPATH=src python -m src.app.server

# Development mode with auto-reload
dev-reload:
	pip install -r requirements.txt && \
	PYTHONPATH=src uvicorn src.app.server:app --host 0.0.0.0 --port 4001 --reload

# Stop the services
stop:
	docker-compose down

# Run tests
test:
	PYTHONPATH=src python -m pytest src/tests/ -v

install:
	pip install -r requirements.txt

# Install development dependencies
install-dev:
	pip install -r requirements-dev.txt
	pre-commit install

# Clean up
clean:
	docker-compose down
	docker system prune -f

# Legacy command for backward compatibility
unlock-pdf: start