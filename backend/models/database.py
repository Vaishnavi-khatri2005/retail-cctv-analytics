from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def auto_migrate_schema():
    Base.metadata.create_all(bind=engine)
    try:
        with engine.begin() as conn:
            res = conn.execute(text("PRAGMA table_info(events)"))
            cols = [row[1] for row in res.fetchall()]
            if cols:
                migration_cols = {
                    "action": "VARCHAR DEFAULT 'Movement'",
                    "risk": "VARCHAR DEFAULT 'Low'",
                    "confidence": "FLOAT DEFAULT 0.95",
                    "video_time_seconds": "FLOAT DEFAULT 0.0",
                    "start_time": "FLOAT DEFAULT 0.0",
                    "end_time": "FLOAT DEFAULT 0.0",
                    "track_id": "INTEGER DEFAULT 1",
                    "bbox_x": "FLOAT DEFAULT 0.3",
                    "bbox_y": "FLOAT DEFAULT 0.3",
                    "bbox_w": "FLOAT DEFAULT 0.2",
                    "bbox_h": "FLOAT DEFAULT 0.4",
                    "class_name": "VARCHAR DEFAULT 'person'",
                    "frame_number": "INTEGER DEFAULT 0"
                }
                for col_name, col_def in migration_cols.items():
                    if col_name not in cols:
                        conn.execute(text(f"ALTER TABLE events ADD COLUMN {col_name} {col_def}"))
    except Exception as e:
        print("Schema migration notice:", e)

auto_migrate_schema()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="pending") # pending, processing, completed
    events = relationship("Event", back_populates="video")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"))
    type = Column(String) # info, warning, alert, success
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    camera_name = Column(String)
    action = Column(String, default="Movement") # Loitering, Intrusion, Movement, Queue, Theft
    risk = Column(String, default="Low") # Low, Medium, High
    confidence = Column(Float, default=0.95) # 0.0 to 1.0 confidence score
    
    # ⏱️ Precision Event Playback & Evidence Coordinates
    video_time_seconds = Column(Float, default=0.0) # Exact event second in video
    start_time = Column(Float, default=0.0) # Evidence playback start (video_time_seconds - 10s)
    end_time = Column(Float, default=0.0) # Evidence playback end (video_time_seconds + 10s)
    track_id = Column(Integer, default=1) # Object tracker ID
    bbox_x = Column(Float, default=0.3) # Bounding box X (0.0 to 1.0)
    bbox_y = Column(Float, default=0.3) # Bounding box Y (0.0 to 1.0)
    bbox_w = Column(Float, default=0.2) # Bounding box Width (0.0 to 1.0)
    bbox_h = Column(Float, default=0.4) # Bounding box Height (0.0 to 1.0)
    class_name = Column(String, default="person") # Detected object class
    frame_number = Column(Integer, default=0) # Specific frame number
    
    video = relationship("Video", back_populates="events")
