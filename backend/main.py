"""CCTV API. Processed playback is derived only from its recorded source file."""
import datetime, os, shutil, subprocess, sys
import cv2
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ultralytics import YOLO

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, CURRENT_DIR)
try: from models.database import Base, Event, SessionLocal, Video, engine
except ImportError: from backend.models.database import Base, Event, SessionLocal, Video, engine
Base.metadata.create_all(bind=engine)
app = FastAPI(title="Retail CCTV Analytics API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
UPLOAD_DIR, PROCESSED_DIR, DATASET_DIR = (os.path.join(CURRENT_DIR, x) for x in ("uploads", "processed", os.path.join("data", "sample_cctv")))
for folder in (UPLOAD_DIR, PROCESSED_DIR, DATASET_DIR): os.makedirs(folder, exist_ok=True)
MODEL_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "..", "yolov8n.pt"))
_detector = None

def abs_path(path): return os.path.abspath(os.path.realpath(path))
def db_session():
    db = SessionLocal()
    try: yield db
    finally: db.close()
def detector():
    global _detector
    if _detector is None:
        if os.path.isfile(MODEL_PATH):
            _detector = YOLO(MODEL_PATH)
        elif os.path.isfile(os.path.join(CURRENT_DIR, "yolov8n.pt")):
            _detector = YOLO(os.path.join(CURRENT_DIR, "yolov8n.pt"))
        else:
            _detector = YOLO("yolov8n.pt")
    return _detector
def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception: return shutil.which("ffmpeg") or "ffmpeg"
def transcode(source, target):
    subprocess.run([ffmpeg(), "-y", "-i", source, "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", target], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    return os.path.isfile(target) and os.path.getsize(target) > 0

def process_video(video_id, db):
    """Open the declared original with OpenCV and annotate that exact frame stream."""
    video = db.query(Video).filter(Video.id == video_id).first()
    source = abs_path(video.source_path or os.path.join(UPLOAD_DIR, video.filename))
    played = abs_path(os.path.join(PROCESSED_DIR, f"{video.id}_{video.filename}"))
    print(f"SOURCE VIDEO: {source}")
    print(f"PLAYED VIDEO: {played}")
    if not os.path.isfile(source):
        print("Dataset video not found"); video.status = "error"; db.commit(); return False
    video.status = "processing"; db.commit()
    cap = cv2.VideoCapture(source)
    if not cap.isOpened(): video.status = "error"; db.commit(); return False
    w, h, raw_fps = int(cap.get(3)), int(cap.get(4)), cap.get(cv2.CAP_PROP_FPS) or 25
    fps = raw_fps if raw_fps > 0 else 25
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    step = max(1, int(round(fps / 15))) if fps >= 30 else 1
    out_fps = max(1.0, float(fps / step))
    max_frames = 450 # Max ~30s of CCTV footage to guarantee response in <8s
    
    temp = abs_path(os.path.join(PROCESSED_DIR, f"temp_{video.id}_{video.filename}"))
    writer = cv2.VideoWriter(temp, cv2.VideoWriter_fourcc(*"mp4v"), out_fps, (w, h))
    if not writer.isOpened() or w <= 0 or h <= 0:
        cap.release(); writer.release(); video.status = "error"; db.commit(); return False
    try: model = detector()
    except Exception as exc:
        print(exc); cap.release(); writer.release(); video.status = "error"; db.commit(); return False
    db.query(Event).filter(Event.video_id == video_id).delete(); db.commit()
    frame_no = written = 0; last_event = -10
    while True:
        ok, frame = cap.read()
        if not ok: break
        frame_no += 1
        if step > 1 and (frame_no % step != 0):
            continue
        if written >= max_frames:
            break
        seconds = written / out_fps
        # Ultralytics real YOLO detections and tracking without triggering auto-install crashes
        try:
            results = model.track(frame, persist=True, imgsz=384, conf=0.35, verbose=False)
            result = results[0]
        except Exception:
            try:
                results = model(frame, imgsz=384, conf=0.35, verbose=False)
                result = results[0]
            except Exception as e:
                print(f"Frame {frame_no} inference error: {e}")
                writer.write(frame); written += 1
                continue

        writer.write(result.plot() if result.boxes is not None and len(result.boxes) else frame); written += 1
        if result.boxes is not None and len(result.boxes) and seconds - last_event >= 2.5:
            box = result.boxes[0]; x1,y1,x2,y2 = [float(x) for x in box.xyxy[0].tolist()]
            class_id = int(box.cls[0]); confidence = float(box.conf[0]); track_id = int(box.id[0]) if (box.id is not None and len(box.id)) else 0
            class_name = result.names[class_id]
            db.add(Event(video_id=video_id, type="info", action="Detection", description=f"YOLO detected {class_name} at {seconds:.1f}s", camera_name=f"Video {video_id}", risk="Low", confidence=confidence, video_time_seconds=seconds, start_time=max(0,seconds-5), end_time=seconds+5, track_id=track_id, bbox_x=x1/w, bbox_y=y1/h, bbox_w=(x2-x1)/w, bbox_h=(y2-y1)/h, class_name=class_name, frame_number=frame_no)); last_event=seconds
    cap.release(); writer.release(); db.commit()
    success = written > 0 and transcode(temp, played)
    if os.path.exists(temp): os.remove(temp)
    video.status = "completed" if success else "error"; db.commit(); return success

class DatasetRunRequest(BaseModel): sample_filename: str

@app.get("/api/dataset/samples")
def samples():
    names = sorted(n for n in os.listdir(DATASET_DIR) if n.lower().endswith((".mp4",".avi",".mov")))
    return {"total":len(names),"samples":[{"filename":n,"title":os.path.splitext(n)[0].replace("_"," ").title(),"size_kb":round(os.path.getsize(os.path.join(DATASET_DIR,n))/1024,1)} for n in names]}

@app.post("/api/dataset/run-analysis")
def run_analysis(req: DatasetRunRequest, db: Session = Depends(db_session)):
    name=os.path.basename(req.sample_filename); source=abs_path(os.path.join(DATASET_DIR,name))
    if not source.startswith(abs_path(DATASET_DIR)+os.sep) or not os.path.isfile(source): raise HTTPException(404,"Dataset video not found")
    video=Video(filename=name, source_path=source, status="processing"); db.add(video); db.commit(); db.refresh(video)
    process_video(video.id,db); db.refresh(video)
    if video.status != "completed": raise HTTPException(500,"Dataset video could not be processed")
    played=abs_path(os.path.join(PROCESSED_DIR,f"{video.id}_{video.filename}"))
    return {"video_id":video.id,"filename":name,"status":video.status,"stream_url":f"/api/videos/{video.id}/stream","source_path":source,"played_path":played}

@app.post("/api/videos/upload")
def upload(file: UploadFile=File(...), db: Session=Depends(db_session)):
    stored=f"upload_{datetime.datetime.utcnow().timestamp():.0f}_{os.path.basename(file.filename)}"; source=abs_path(os.path.join(UPLOAD_DIR,stored))
    with open(source,"wb") as out: shutil.copyfileobj(file.file,out)
    video=Video(filename=stored,source_path=source,status="processing"); db.add(video); db.commit(); db.refresh(video); process_video(video.id,db)
    return {"id":video.id,"video_id":video.id,"filename":file.filename,"status":video.status,"stream_url":f"/api/videos/{video.id}/stream"}

@app.get("/api/videos")
def videos(db: Session=Depends(db_session)): return db.query(Video).order_by(Video.id.desc()).all()
@app.get("/api/events")
def events(limit:int=50,db:Session=Depends(db_session)): return db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()
@app.get("/api/analytics/footfall")
def footfall(): return []
@app.get("/api/videos/{video_id}/stream")
def stream(video_id:int,db:Session=Depends(db_session)):
    video=db.query(Video).filter(Video.id==video_id).first()
    if not video: raise HTTPException(404,"Video not found")
    source=abs_path(video.source_path or ""); played=abs_path(os.path.join(PROCESSED_DIR,f"{video.id}_{video.filename}"))
    print(f"SOURCE VIDEO: {source}"); print(f"PLAYED VIDEO: {played}")
    if not os.path.isfile(played) or os.path.getsize(played)==0: raise HTTPException(404,"Dataset video not found")
    return FileResponse(played,media_type="video/mp4",headers={"Accept-Ranges":"bytes","Content-Disposition":"inline"})

# Mount static frontend build if present (for single-container GCP Cloud Run deployment)
from fastapi.staticfiles import StaticFiles
FRONTEND_OUT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "frontend", "out"))
if not os.path.isdir(FRONTEND_OUT):
    FRONTEND_OUT = os.path.abspath(os.path.join(CURRENT_DIR, "out"))
if os.path.isdir(FRONTEND_OUT):
    app.mount("/", StaticFiles(directory=FRONTEND_OUT, html=True), name="frontend")

