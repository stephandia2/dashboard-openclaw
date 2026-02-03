# Dockerfile pour OpenClaw Dashboard (Multi-stage build)
# Fichier: Dockerfile

# Stage 1: Build frontend React
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install && npm run build

# Stage 2: Flask backend
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

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create instance directory
RUN mkdir -p /app/instance

# Expose port
EXPOSE 5000

# Start command
CMD ["python", "app.py"]
