#!/usr/bin/env bash
# ==============================================================================
# Google Cloud Run 1-Click Deployment Script
# Usage: ./deploy-gcp.sh [PROJECT_ID] [REGION]
# ==============================================================================

set -e

PROJECT_ID=${1:-$(gcloud config get-value project 2>/dev/null)}
REGION=${2:-"us-central1"}
SERVICE_NAME="retail-cctv-analytics"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: No GCP Project ID specified or found."
  echo "Usage: ./deploy-gcp.sh YOUR_PROJECT_ID [REGION]"
  exit 1
fi

echo "======================================================="
echo " Deploying Retail CCTV Analytics to Google Cloud Run"
echo " Project: $PROJECT_ID"
echo " Region:  $REGION"
echo " Service: $SERVICE_NAME"
echo "======================================================="

# Enable required Google Cloud APIs
echo "[1/4] Enabling required GCP APIs (Cloud Run, Cloud Build, Artifact Registry)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project="$PROJECT_ID"

# Build and Deploy to Cloud Run
echo "[2/4] Building container and deploying service to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --memory=2Gi \
  --cpu=2 \
  --timeout=300

echo "[3/4] Fetching service URL..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --project="$PROJECT_ID" --region="$REGION" --format='value(status.url)')

echo "======================================================="
echo " 🎉 Deployment Successful!"
echo " Live Application URL: $SERVICE_URL"
echo "======================================================="
