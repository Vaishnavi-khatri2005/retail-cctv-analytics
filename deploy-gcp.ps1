<#
==============================================================================
 Google Cloud Run 1-Click Deployment Script (PowerShell)
 Usage: .\deploy-gcp.ps1 -ProjectId "your-gcp-project-id" -Region "us-central1"
==============================================================================
#>

param (
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1",

    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "retail-cctv-analytics"
)

if (-not $ProjectId) {
    $ProjectId = (gcloud config get-value project 2>$null)
}

if (-not $ProjectId) {
    Write-Host "Error: No GCP Project ID specified or found." -ForegroundColor Red
    Write-Host "Usage: .\deploy-gcp.ps1 -ProjectId YOUR_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Deploying Retail CCTV Analytics to Google Cloud Run" -ForegroundColor Cyan
Write-Host " Project: $ProjectId" -ForegroundColor Cyan
Write-Host " Region:  $Region" -ForegroundColor Cyan
Write-Host " Service: $ServiceName" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

Write-Host "[1/3] Enabling required GCP APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project=$ProjectId

Write-Host "[2/3] Building container and deploying service to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --project=$ProjectId `
  --region=$Region `
  --platform=managed `
  --allow-unauthenticated `
  --memory=2Gi `
  --cpu=2 `
  --timeout=300

Write-Host "[3/3] Fetching service URL..." -ForegroundColor Yellow
$ServiceUrl = (gcloud run services describe $ServiceName --project=$ProjectId --region=$Region --format='value(status.url)')

Write-Host "=======================================================" -ForegroundColor Green
Write-Host " 🎉 Deployment Successful!" -ForegroundColor Green
Write-Host " Live Application URL: $ServiceUrl" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
