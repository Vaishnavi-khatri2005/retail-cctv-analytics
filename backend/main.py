from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil
import asyncio
import random
import cv2
from typing import List

from models.database import SessionLocal, engine, Base, User, Video, Event
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
        
        # We can process every frame or skip for speed, but writing needs every frame for smooth playback
        # We'll just run processing on every frame now since we write it out
        
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
        cv2.putText(frame, "Zone B", (zone_x_threshold + 10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        
        # Write the annotated frame
        out.write(frame)
                
        if has_motion and (current_time_sec - last_event_time > 3):
            last_event_time = current_time_sec
            
            desc = "Customer entered Zone B (Restricted)" if in_zone else f"Motion detected at {int(current_time_sec)}s mark"
            evt_type = "alert" if in_zone else "info"
            
            db_event = Event(
                video_id=video_id,
                type=evt_type,
                description=desc,
                camera_name="Cam 1"
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
    # Dummy authentication for MVP
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        # Create user if not exists for MVP simplicity
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
    
    # Save to db
    new_video = Video(filename=file.filename, status="uploaded")
    db.add(new_video)
    db.commit()
    db.refresh(new_video)
    
    # Start background processing task
    if background_tasks:
        background_tasks.add_task(process_video, new_video.id, db)
    
    return {"info": f"file '{file.filename}' saved", "id": new_video.id}

@app.get("/api/videos")
def get_videos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    videos = db.query(Video).order_by(Video.id.desc()).offset(skip).limit(limit).all()
    return videos

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
def get_events(limit: int = 20, db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()
    return events

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
