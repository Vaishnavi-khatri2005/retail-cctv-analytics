# Retail CCTV Analytics

An AI-powered CCTV Analytics system that processes retail video footage using OpenCV and presents insights on a modern Next.js dashboard. 

## Features
- **Computer Vision**: Utilizes OpenCV `cv2.createBackgroundSubtractorMOG2` to detect and track motion.
- **Annotated Output**: Automatically draws bounding boxes around detected motion and saves annotated `.mp4` files.
- **Zone Tracking**: Define geographical zones (e.g., Zone A, Staff Area) and generate high-priority database alerts when a zone is breached.
- **Live Dashboard**: A responsive Next.js dashboard featuring Recharts (for Hourly Footfall and Zone Activity) and a searchable timeline of events.
- **Video Streaming**: Directly stream the processed and annotated videos via a FastAPI endpoint.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Recharts, Lucide React
- **Backend**: FastAPI, SQLite, SQLAlchemy, OpenCV (python-headless)

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the dashboard!

## Deployment
For deployment, it is recommended to deploy the Next.js frontend to **Vercel** and containerize the FastAPI backend to be deployed on **Google Cloud Run** to support the heavy video processing requirements without timing out.
