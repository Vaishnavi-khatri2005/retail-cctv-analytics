# 🎥 RetailVision AI — Smart Retail CCTV Search & Video Analytics

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://retail-cctv-analytics.vercel.app)
[![API Backend](https://img.shields.io/badge/API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://retail-cctv-analytics-backend.onrender.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenCV](https://img.shields.io/badge/CV-OpenCV-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org/)

An intelligent computer vision platform that turns passive CCTV footage into actionable business intelligence for retail spaces. By processing surveillance video in real time, **RetailVision AI** analyzes foot traffic patterns, flags high-risk security events, and delivers an intuitive, interactive management dashboard.

---

## 🌟 Key Highlights

- ⚡ **Real-Time Motion & Person Detection**: Leverages OpenCV background subtraction (`cv2.createBackgroundSubtractorMOG2`) and contour bounding box tracking to trace customer movement.
- 🎯 **Configurable Zone & Intrusion Monitoring**: Automatically flags dwell time, restricted-area entries (e.g., Staff-Only zones, Shelves, Checkout aisles), and triggers risk-level alerts.
- 📊 **Interactive Retail Analytics**: Beautiful Recharts visualizations displaying hourly visitor volume, peak traffic hours, and heat/zone occupancy breakdowns.
- 🎞️ **Annotated Video Streaming**: Automatically processes, overlays bounding boxes, and streams annotated MP4 video feeds directly through a high-performance FastAPI streaming endpoint.
- 🔍 **Searchable Event Timeline**: Filter and inspect suspicious activity, dwell events, and high/low risk alerts with micro-timestamps.
- ☁️ **Full-Stack Cloud Architecture**: Modern Next.js frontend deployed on Vercel with an asynchronous FastAPI engine hosted on Render.

---

## 🚀 Live Demos & Links

| Service | Link | Status |
| :--- | :--- | :--- |
| **🌐 Interactive Dashboard** | [retail-cctv-analytics.vercel.app](https://retail-cctv-analytics.vercel.app) | `Live Production` |
| **⚙️ REST & Streaming API** | [retail-cctv-analytics-backend.onrender.com](https://retail-cctv-analytics-backend.onrender.com) | `Active` |
| **📖 API Documentation** | [Swagger / OpenAPI Docs](https://retail-cctv-analytics-backend.onrender.com/docs) | `Interactive` |

---

## 🛠️ Architecture & Tech Stack

```mermaid
graph LR
    A[CCTV Footage / Upload] --> B[FastAPI Backend]
    B --> C[OpenCV Processing Engine]
    C --> D[(SQLite Event Store)]
    C --> E[Annotated MP4 Stream]
    B --> F[Next.js Dashboard]
    E --> F
    D --> F
```

### **Frontend**
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS & Lucide Icons
- **Data Visualizations**: Recharts (Dynamic Area & Bar Charts)
- **Deployment**: Vercel

### **Backend & Computer Vision**
- **API Framework**: FastAPI & Uvicorn (Asynchronous REST API)
- **Vision Engine**: OpenCV (`opencv-python-headless`) for frame-by-frame analysis
- **Database / ORM**: SQLite & SQLAlchemy
- **Deployment**: Render (Docker / Python Container)

---

## 💻 Local Quickstart

### 1. Clone the Repository
```bash
git clone https://github.com/Vaishnavi-khatri2005/retail-cctv-analytics.git
cd retail-cctv-analytics
```

### 2. Launch Backend (FastAPI + OpenCV)
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 3. Launch Frontend (Next.js)
```bash
cd ../frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to view the dashboard!

---

## 📸 Core Capabilities

1. **Upload Video Footage**: Feed `.mp4` or `.avi` surveillance clips into the system.
2. **Background Processing**: The computer vision model processes frames, records footfall statistics, and identifies zone violations.
3. **Stream Annotated Output**: View the processed video directly within the dashboard with active detection boxes and zone overlays.
4. **Export & Audit**: Monitor real-time logs and security events with categorized risk scoring.

---

## 📄 License & Attribution

Distributed under the MIT License. Developed for intelligent retail space surveillance and customer behavior analytics.
