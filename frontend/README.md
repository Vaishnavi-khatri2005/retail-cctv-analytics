# RetailVision AI

RetailVision AI is a Next.js frontend prototype for an AI/ML-powered retail CCTV search and analytics system. It presents a dashboard for CCTV event monitoring, suspicious activity review, customer footfall analytics, zone activity, and report export.

## Project Idea

Most retail CCTV systems only record video. RetailVision AI is designed to convert CCTV footage into searchable events and useful shop insights such as:

- Visitor footfall
- Suspicious activity events
- Zone-based customer movement
- Queue activity
- Saved evidence clips
- Daily retail analytics

## Current Frontend Features

- Retail CCTV analytics dashboard
- Visitor, event, clip, and camera summary cards
- Hourly footfall chart
- Zone activity chart
- Searchable event timeline UI
- Suspicious activity risk badges
- Active rule list
- Daily report export button UI
- Responsive layout for desktop and mobile

## Planned Backend Features

- CCTV video upload
- RTSP/IP camera connection
- YOLO-based person and object detection
- Person tracking
- Zone-based event generation
- Loitering and restricted-zone alerts
- Searchable event database
- Snapshot and clip generation
- Daily/weekly report generation

## Tech Stack

- Next.js
- React
- Tailwind CSS
- Lucide React
- Recharts

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment

Recommended deployment platform:

- Vercel for the Next.js frontend
- GitHub for source code hosting

Typical deployment flow:

```bash
git add .
git commit -m "Build RetailVision AI dashboard"
git branch -M main
git remote add origin <your-github-repository-url>
git push -u origin main
```

After pushing to GitHub, import the repository into Vercel to get a live URL.

## Project Status

Frontend dashboard prototype is ready. Backend AI processing and live CCTV integration are planned next.
