# 🚀 Production Deployment Guide: Retail CCTV Analytics

This guide provides step-by-step instructions for deploying the **Retail CCTV Analytics** application to **Google Cloud Platform (GCP)** and alternative modern cloud platforms.

---

## ❓ Why Render and Vercel Failed Previously

| Platform | Reason for Failure | Solution in this Release |
| :--- | :--- | :--- |
| **Render (Free Plan)** | **512 MB RAM Out-Of-Memory (OOM)** limit: PyTorch + Ultralytics YOLOv8 + OpenCV require ~1–2 GB RAM during model loading. Also, missing Linux OpenGL libraries (`libGL.so.1`). | Switched to `opencv-python-headless` and migrated to **GCP Cloud Run** (2 GB RAM, 2 vCPUs) which never runs out of memory. |
| **Vercel** | **Serverless Limitations**: Vercel is designed for static / Node.js serverless functions (50 MB limit, 10s–60s timeout). It cannot host long-running Python OpenCV pipelines, FFmpeg video encoders, or background AI tasks. | Created a unified multi-stage container that hosts both Next.js UI and FastAPI YOLO backend on a single HTTPS Cloud Run endpoint. |

---

## 🌟 Method 1: Google Cloud Run (Recommended — Fast & Reliable)

Google Cloud Run is a fully managed serverless platform that automatically scales containers and provides **2 GB+ RAM, 2 vCPUs, and built-in HTTPS**.

### Option A: 1-Click Deployment via Google Cloud Console (No CLI needed)

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top navigation bar, select or create a project (e.g. `retail-cctv-analytics-prod`).
3. Search for **Cloud Run** in the search bar and click **"Create Service"**.
4. Choose **"Continuously deploy from a repository"** &rarr; click **"Set up Cloud Build"**.
5. Select **GitHub** as your provider and choose your repository: `Vaishnavi-khatri2005/retail-cctv-analytics`.
6. Set:
   - **Branch**: `^main$`
   - **Build Type**: `Dockerfile` (Source location: `/Dockerfile`)
7. Under **Authentication**, select **"Allow unauthenticated invocations"** (public access).
8. Expand **Container, Volumes, Networking, Security**:
   - **Memory**: `2 GiB` (or `4 GiB`)
   - **CPU**: `2`
   - **Request timeout**: `300 seconds`
9. Click **Create**.
10. Cloud Build will automatically build the container and deploy your live URL (e.g., `https://retail-cctv-analytics-xyz-uc.a.run.app`).

---

### Option B: Deploy via Google Cloud Shell / `gcloud` CLI (1 Command)

If you have the Google Cloud Shell (accessible via browser terminal at `shell.cloud.google.com`) or `gcloud` installed:

```bash
# 1. Clone or navigate to your repository
cd retail-cctv-analytics

# 2. Deploy to Cloud Run with 1 command:
gcloud run deploy retail-cctv-analytics \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300
```

Or run the automated helper script:
- **Linux / macOS / Cloud Shell**: `./deploy-gcp.sh YOUR_PROJECT_ID us-central1`
- **Windows PowerShell**: `.\deploy-gcp.ps1 -ProjectId YOUR_PROJECT_ID -Region us-central1`

---

## 🖥️ Method 2: Google Compute Engine (GCP Free Tier VM)

If you prefer a dedicated Virtual Machine (e.g., GCP e2-standard or free tier e2-micro):

```bash
# 1. SSH into your GCP VM instance
gcloud compute ssh my-cctv-vm --zone us-central1-a

# 2. Install Docker & Docker Compose
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# 3. Clone repository and run
git clone https://github.com/Vaishnavi-khatri2005/retail-cctv-analytics.git
cd retail-cctv-analytics
sudo docker-compose up -d --build
```
Your application will be live at `http://YOUR_VM_EXTERNAL_IP:8080`.

---

## ☁️ Method 3: Alternative Zero-Setup Cloud Hosts

If you want alternatives with free / generous CPU & RAM for AI workloads:

### 1. Hugging Face Spaces (Free 16 GB RAM + 2 vCPU Docker)
1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Select **Docker** as the SDK.
3. Connect your GitHub repository `Vaishnavi-khatri2005/retail-cctv-analytics`.
4. Hugging Face will automatically build `Dockerfile` and give you a free, public HTTPS URL with 16 GB RAM.

### 2. Railway / Koyeb
- Supports Docker containers with 1–2 GB RAM without OOM timeouts.
- Simply click **New Project** &rarr; **Deploy from GitHub repo**.

---

## 🔍 Verifying the Deployment
Once deployed, open your live URL to verify:
1. **Interactive Dashboard**: Loads with hourly footfall charts and camera selectors.
2. **Dataset Processing**: Click **"Use Sample Dataset" &rarr; "Run Analysis"** to verify that YOLOv8 processes the video frames and streams the annotated H.264 video.
3. **Event Evidence**: Click **"▶ View Evidence"** to seek directly to detected incidents.
