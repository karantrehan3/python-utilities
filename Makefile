# ───── Full Stack (Docker) ─────

start:
	docker compose down && \
	docker compose build && \
	docker compose up

stop:
	docker compose down

clean:
	docker compose down
	docker system prune -f

# ───── Development (local, with HMR) ─────

dev:
	$(MAKE) -j2 dev-server dev-client

dev-server:
	cd server && \
	. venv/bin/activate && \
	DEBUG=true PYTHONPATH=src uvicorn src.app.server:app --host 0.0.0.0 --port 4001 --reload

dev-client:
	cd client && npm run dev

# ───── Install ─────

install:
	$(MAKE) install-server install-client

install-server:
	cd server && \
	python -m venv venv && \
	. venv/bin/activate && \
	pip install -r requirements.txt

install-client:
	cd client && npm ci

install-dev:
	cd server && \
	. venv/bin/activate && \
	pip install -r requirements-dev.txt
	pre-commit install

# ───── Tests ─────

test:
	$(MAKE) test-server test-client

test-server:
	cd server && \
	. venv/bin/activate && \
	PYTHONPATH=src python -m pytest src/tests/ -v

test-client:
	cd client && npm test

# ───── Formatting ─────

format:
	cd client && npx prettier --write "src/**/*.{ts,tsx}"
	cd server && . venv/bin/activate && black src/ && isort src/

lint:
	cd client && npx prettier --check "src/**/*.{ts,tsx}" && npx eslint src/
	cd server && . venv/bin/activate && flake8 src/
