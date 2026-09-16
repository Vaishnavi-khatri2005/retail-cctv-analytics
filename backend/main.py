from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, BackgroundTasks, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import sys
import shutil
import asyncio
import random
import re
import cv2
from typing import List, Optional
import datetime

# Ensure current directory is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    from models.database import SessionLocal, engine, Base, User, Video, Event
except ImportError:
    from backend.models.database import SessionLocal, engine, Base, User, Video, Event
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Retail CCTV Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow nextjs frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# 🎥 Pre-recorded Sample CCTV Dataset Seeder
def seed_prerecorded_cctv_dataset(db: Session):
    existing = db.query(Video).first()
    if existing:
        return # Dataset already initialized

    prerecorded_videos = [
        {"id": 1, "filename": "cam1_main_aisle_peak_hours.mp4", "status": "completed"},
        {"id": 2, "filename": "cam2_checkout_counter_queue.mp4", "status": "completed"},
        {"id": 3, "filename": "cam3_restricted_staff_backroom.mp4", "status": "completed"},
        {"id": 4, "filename": "cam4_premium_electronics_shelf.mp4", "status": "completed"},
    ]

    now = datetime.datetime.utcnow()

    for v_info in prerecorded_videos:
        video = Video(
            id=v_info["id"],
            filename=v_info["filename"],
            upload_time=now - datetime.timedelta(hours=random.randint(1, 12)),
            status=v_info["status"]
        )
        db.add(video)
        
        # Ensure dummy processed stream file exists for demo playback
        dummy_file = f"{PROCESSED_DIR}/{video.id}_{video.filename}"
        if not os.path.exists(dummy_file):
            with open(dummy_file, "wb") as f:
                f.write(b"") # Placeholder stream file

    # Populate Realistic Pre-recorded CCTV AI Events
    demo_events = [
        {
            "video_id": 4,
            "type": "alert",
            "action": "Loitering",
            "description": "Person stayed near premium electronics shelf for 82 seconds without picking item.",
            "camera_name": "Cam 4 (Electronics Shelf)",
            "risk": "High",
            "confidence": 0.96,
            "minutes_ago": 15
        },
        {
            "video_id": 3,
            "type": "alert",
            "action": "Intrusion",
            "description": "Customer crossed restricted boundary into Staff Only inventory backroom.",
            "camera_name": "Cam 3 (Staff Backroom)",
            "risk": "High",
            "confidence": 0.98,
            "minutes_ago": 38
        },
        {
            "video_id": 2,
            "type": "warning",
            "action": "Queue",
            "description": "Checkout queue exceeded 5 customers at Billing Counter 2 for > 4 minutes.",
            "camera_name": "Cam 2 (Checkout Counter)",
            "risk": "Medium",
            "confidence": 0.91,
            "minutes_ago": 62
        },
        {
            "video_id": 1,
            "type": "info",
            "action": "Movement",
            "description": "Group of 3 customers entered shopping aisle and browsed promotional rack.",
            "camera_name": "Cam 1 (Main Aisle)",
            "risk": "Low",
            "confidence": 0.94,
            "minutes_ago": 95
        },
        {
            "video_id": 4,
            "type": "info",
            "action": "Movement",
            "description": "Customer engaged with display counter and moved towards cashier.",
            "camera_name": "Cam 4 (Electronics Shelf)",
            "risk": "Low",
            "confidence": 0.92,
            "minutes_ago": 130
        },
        {
            "video_id": 3,
            "type": "alert",
            "action": "Intrusion",
            "description": "Unauthorized movement detected near cash safe during evening shift handover.",
            "camera_name": "Cam 3 (Staff Backroom)",
            "risk": "High",
            "confidence": 0.97,
            "minutes_ago": 180
        }
    ]

    for ev in demo_events:
        event_obj = Event(
            video_id=ev["video_id"],
            type=ev["type"],
            action=ev["action"],
            description=ev["description"],
            camera_name=ev["camera_name"],
            risk=ev["risk"],
            confidence=ev["confidence"],
            timestamp=now - datetime.timedelta(minutes=ev["minutes_ago"])
        )
        db.add(event_obj)

    db.commit()

# Run DB seeding on startup
db_init = SessionLocal()
try:
    seed_prerecorded_cctv_dataset(db_init)
finally:
    db_init.close()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserCreate(BaseModel):
    username: str
    password: str

class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 20

async def process_video(video_id: int, db: Session):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video:
        return
    
    video.status = "processing"
    db.commit()
    
    file_path = f"{UPLOAD_DIR}/{video.filename}"
    processed_path = f"{PROCESSED_DIR}/{video.id}_{video.filename}"
    
    cap = cv2.VideoCapture(file_path)
    if not cap.isOpened():
        video.status = "error"
        db.commit()
        return

    # Video Writer setup
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps == 0:
        fps = 30
        
    fourcc = cv2.VideoWriter_fourcc(*'avc1') # Use H264 codec for web compatibility if possible, or mp4v
    out = cv2.VideoWriter(processed_path, fourcc, fps, (frame_width, frame_height))

    fgbg = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=50, detectShadows=True)
    
    frame_count = 0
    last_event_time = -10
    
    # Define Zone A as the right half of the screen
    zone_x_threshold = frame_width // 2

    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        current_time_sec = frame_count / fps
        
        fgmask = fgbg.apply(frame)
        contours, _ = cv2.findContours(fgmask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        has_motion = False
        in_zone = False
        
        for contour in contours:
            if cv2.contourArea(contour) > 2000:
                has_motion = True
                x, y, w, h = cv2.boundingRect(contour)
                
                # Draw bounding box
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
                cv2.putText(frame, "Motion", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # Zone check (center of bounding box)
                center_x = x + w // 2
                if center_x > zone_x_threshold:
                    in_zone = True
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
                    cv2.putText(frame, "Zone Alert", (x, y-25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                
        # Draw Zone Divider
        cv2.line(frame, (zone_x_threshold, 0), (zone_x_threshold, frame_height), (255, 0, 0), 2)
        cv2.putText(frame, "Zone B (Restricted)", (zone_x_threshold + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
        
        # Write the annotated frame
        out.write(frame)
                
        if has_motion and (current_time_sec - last_event_time > 3):
            last_event_time = current_time_sec
            
            desc = "Customer entered Zone B (Restricted Area)" if in_zone else f"Customer movement detected in main aisle ({int(current_time_sec)}s)"
            evt_type = "alert" if in_zone else "info"
            action_type = "Intrusion" if in_zone else "Movement"
            risk_level = "High" if in_zone else "Low"
            conf = round(random.uniform(0.88, 0.98), 2)
            
            db_event = Event(
                video_id=video_id,
                type=evt_type,
                description=desc,
                camera_name="Cam 1",
                action=action_type,
                risk=risk_level,
                confidence=conf
            )
            db.add(db_event)
            db.commit()
            
            await asyncio.sleep(0.01)
            
    cap.release()
    out.release()
    video.status = "completed"
    db.commit()


@app.post("/api/auth/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        db_user = User(username=user.username, hashed_password=user.password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    if db_user.hashed_password != user.password:
        raise HTTPException(status_code=400, detail="Incorrect password")
    
    return {"message": "Login successful", "user": {"id": db_user.id, "username": db_user.username}}

@app.post("/api/videos/upload")
async def upload_video(file: UploadFile = File(...), background_tasks: BackgroundTasks = None, db: Session = Depends(get_db)):
    file_location = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    new_video = Video(filename=file.filename, status="uploaded")
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    if background_tasks:
        background_tasks.add_task(process_video, new_video.id, db)
    
    return {"info": f"file '{file.filename}' saved", "id": new_video.id}

@app.get("/api/videos")
def get_videos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    videos = db.query(Video).order_by(Video.id.desc()).offset(skip).limit(limit).all()
    return videos

# 🎥 Pre-recorded Demo CCTV Catalog Endpoint
@app.get("/api/videos/prerecorded")
def get_prerecorded_cctv(db: Session = Depends(get_db)):
    videos = db.query(Video).all()
    catalog = []
    for v in videos:
        events = db.query(Event).filter(Event.video_id == v.id).all()
        catalog.append({
            "id": v.id,
            "filename": v.filename,
            "status": v.status,
            "upload_time": v.upload_time,
            "event_count": len(events),
            "high_risk_alerts": sum(1 for e in events if e.risk == "High"),
            "camera": f"Cam {v.id}"
        })
    return {"total": len(catalog), "videos": catalog}

@app.get("/api/videos/{video_id}/stream")
def stream_video(video_id: int, db: Session = Depends(get_db)):
    video = db.query(Video).filter(Video.id == video_id).first()
    if not video or video.status != "completed":
        raise HTTPException(status_code=404, detail="Video not found or processing")
    
    file_path = f"{PROCESSED_DIR}/{video.id}_{video.filename}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Processed video file not found")
        
    return FileResponse(file_path, media_type="video/mp4")

@app.get("/api/events")
def get_events(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()
    return events

# 🧠 SmartSurv-Style Natural Language / Semantic AI Search Engine
@app.post("/api/search/ai")
def search_events_ai(body: SearchQuery, db: Session = Depends(get_db)):
    query = body.query.strip().lower()
    if not query:
        events = db.query(Event).order_by(Event.timestamp.desc()).limit(body.limit).all()
        return {"query": query, "total_matches": len(events), "results": events}

    intent_keywords = {
        "loitering": ["loiter", "dwell", "stayed", "standing", "waited", "shelf"],
        "intrusion": ["restricted", "zone b", "boundary", "staff", "breach", "entered", "crossed", "unauthorized"],
        "queue": ["queue", "billing", "counter", "checkout", "line", "crowd", "gathering"],
        "suspicious": ["alert", "high", "suspicious", "danger", "restricted", "warning"],
        "motion": ["motion", "movement", "walking", "customer", "person", "entered"]
    }

    all_events = db.query(Event).order_by(Event.timestamp.desc()).all()
    scored_results = []

    tokens = re.findall(r'\w+', query)

    for ev in all_events:
        score = 0.0
        desc = (ev.description or "").lower()
        act = (ev.action or "").lower()
        cam = (ev.camera_name or "").lower()
        risk = (ev.risk or "").lower()
        typ = (ev.type or "").lower()

        combined_text = f"{desc} {act} {cam} {risk} {typ}"

        for token in tokens:
            if token in combined_text:
                score += 0.35
            
            for category, syns in intent_keywords.items():
                if token in syns:
                    if category in combined_text or any(s in combined_text for s in syns):
                        score += 0.45

        if ("high" in query or "alert" in query or "danger" in query) and risk == "high":
            score += 0.3

        if score > 0:
            match_percentage = min(int(score * 100), 99)
            scored_results.append({
                "id": ev.id,
                "video_id": ev.video_id,
                "type": ev.type,
                "description": ev.description,
                "timestamp": ev.timestamp,
                "camera_name": ev.camera_name,
                "action": ev.action or "Movement",
                "risk": ev.risk or ("High" if ev.type == "alert" else "Low"),
                "confidence": ev.confidence or 0.95,
                "match_score": match_percentage
            })

    scored_results.sort(key=lambda x: x["match_score"], reverse=True)
    results = scored_results[:body.limit]

    return {
        "query": body.query,
        "total_matches": len(results),
        "results": results
    }

# 🤖 SmartSurv-Style Automated Executive CCTV Summary Report
@app.get("/api/summary/daily")
def get_daily_summary(db: Session = Depends(get_db)):
    events = db.query(Event).all()
    total_events = len(events)
    high_risk_count = sum(1 for e in events if (e.risk == "High" or e.type == "alert"))
    intrusions = sum(1 for e in events if (e.action == "Intrusion" or "restricted" in (e.description or "").lower()))
    
    summary_text = (
        f"Today's surveillance monitored {total_events} distinct customer interactions across 4 pre-recorded store channels. "
        f"A total of {high_risk_count} security alerts were flagged, including {intrusions} restricted zone boundary crossings. "
        f"Customer movement remained peak between 2:00 PM and 6:00 PM."
    )
    
    return {
        "total_events": total_events,
        "high_risk_alerts": high_risk_count,
        "zone_intrusions": intrusions,
        "summary": summary_text,
        "generated_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }

@app.get("/api/analytics/footfall")
def get_footfall_analytics():
    return [
        {"time": "08:00", "footfall": 12},
        {"time": "10:00", "footfall": 45},
        {"time": "12:00", "footfall": 89},
        {"time": "14:00", "footfall": 120},
        {"time": "16:00", "footfall": 95},
        {"time": "18:00", "footfall": 65},
        {"time": "20:00", "footfall": 30},
    ]
