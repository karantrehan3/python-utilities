# Use the latest Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PyMuPDF
RUN apt-get update && apt-get install -y \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Add src to Python path
ENV PYTHONPATH=/app/src

# Run as a non-root user (defense in depth)
RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 4001

# Run the application
CMD ["uvicorn", "src.app.server:app", "--host", "0.0.0.0", "--port", "4001"]
