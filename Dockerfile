# ==========================================
# Multi-Stage Production Dockerfile for GCP Cloud Run
# Builds Next.js frontend + FastAPI YOLO CV Backend
# ==========================================

# Stage 1: Build Next.js Static Export
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build Next.js with static export output to /app/frontend/out
RUN npm run build

# Stage 2: Python Backend & Unified Server
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=8080

WORKDIR /app

# Install system dependencies (FFmpeg, libglib for OpenCV headless)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Pre-download YOLOv8n weights into container image
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"

# Copy backend application code & dataset
COPY backend/ ./backend/
COPY yolov8n.pt* ./

# Copy built frontend static files to backend/out
COPY --from=frontend-builder /app/frontend/out ./backend/out

WORKDIR /app/backend

# Expose Cloud Run default port
EXPOSE 8080

# Run FastAPI with Uvicorn on Cloud Run $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
