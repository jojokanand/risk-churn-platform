FROM python:3.11-slim

WORKDIR /app

# Install system dependencies with retry mechanism for transient package issues
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    for i in 1 2 3; do \
        apt-get update && \
        apt-get install -y --no-install-recommends gcc g++ && \
        break || \
        (echo "Attempt $i failed, retrying in 10 seconds..." && sleep 10 && apt-get clean && rm -rf /var/lib/apt/lists/*); \
    done && \
    rm -rf /var/lib/apt/lists/*

# Copy dependency files and source code
COPY pyproject.toml uv.lock README.md ./
COPY src/ ./src/
COPY config/ ./config/

# Install uv for faster dependency installation
RUN pip install --no-cache-dir uv

# Install dependencies
RUN uv sync --locked --no-dev
ENV PATH="/app/.venv/bin:$PATH"

# Create models directory
RUN mkdir -p models/v1 models/v2

# Expose ports
EXPOSE 8080 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8080/health')"

# Run application
CMD ["uvicorn", "src.risk_churn_platform.api.rest_api:app", "--host", "0.0.0.0", "--port", "8080"]
