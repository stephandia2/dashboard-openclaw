# Dockerfile pour OpenClaw Dashboard
# Le frontend est déjà buildé en local (frontend/dist/)

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app.py .
COPY database/ ./database/

# Copy pre-built frontend from local
COPY frontend/dist ./frontend/dist

# Create instance directory
RUN mkdir -p /app/instance

# Expose port
EXPOSE 5000

# Start command
CMD ["python", "app.py"]
