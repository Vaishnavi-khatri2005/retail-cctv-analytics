"use client";

import { 
  Play, 
  Pause, 
  Maximize, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  RotateCcw, 
  AlertTriangle, 
  X,
  Video as VideoIcon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

function formatSeconds(sec) {
  if (typeof sec !== "number" || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ 
  src, 
  title = "Live Camera Feed",
  tag = "CV Pipeline Processed",
  activeEvidenceEvent = null,
  onClearEvidence = null,
  onReplayEvidence = null
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timestamp, setTimestamp] = useState("");
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  // Live wall clock timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString() + " • " + now.toLocaleDateString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // When source or activeEvidenceEvent changes, auto play and seek
  useEffect(() => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      if (activeEvidenceEvent) {
        const startTime = activeEvidenceEvent.start_time !== undefined ? activeEvidenceEvent.start_time : 0;
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [src, activeEvidenceEvent]);

  // Handle video timeupdate and evidence looping
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (activeEvidenceEvent && activeEvidenceEvent.end_time) {
      if (curr >= activeEvidenceEvent.end_time || curr < (activeEvidenceEvent.start_time || 0)) {
        videoRef.current.currentTime = activeEvidenceEvent.start_time || 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      setHasError(false);
      videoRef.current.muted = true;
      if (activeEvidenceEvent) {
        videoRef.current.currentTime = activeEvidenceEvent.start_time || 0;
      }
      videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.parentElement) {
      if (videoRef.current.parentElement.requestFullscreen) {
        videoRef.current.parentElement.requestFullscreen();
      }
    }
  };

  const replayEvidenceWindow = () => {
    if (videoRef.current && activeEvidenceEvent) {
      const startTime = activeEvidenceEvent.start_time || 0;
      videoRef.current.currentTime = startTime;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    if (onReplayEvidence) onReplayEvidence();
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="w-full flex-1 min-h-[340px] bg-slate-950 rounded-2xl flex flex-col justify-center border border-slate-800 relative overflow-hidden group shadow-2xl">
      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 flex-wrap">
        {activeEvidenceEvent ? (
          <div className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-md shadow-lg flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>EVIDENCE PLAYBACK</span>
          </div>
        ) : (
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> REAL CCTV STREAM
          </div>
        )}
        <div className="bg-slate-900/80 text-blue-400 border border-slate-700/60 text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm">
          {tag}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 font-mono text-[11px] text-slate-300 bg-black/70 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm">
        {timestamp}
      </div>

      {/* 🎥 Native Real CCTV Video Player */}
      <div className="relative w-full h-full min-h-[340px] flex items-center justify-center bg-slate-950">
        {src && !hasError ? (
          <video 
            ref={videoRef}
            key={src}
            src={src}
            className="w-full h-full object-cover min-h-[340px]"
            autoPlay
            loop={!activeEvidenceEvent}
            muted={isMuted}
            playsInline
            crossOrigin="anonymous"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="min-h-[340px] flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <ShieldAlert size={36} className="text-slate-600 mb-3" />
            <p className="text-slate-300 font-semibold text-sm">Video unavailable</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Please select &quot;Use Sample Dataset → Run Analysis&quot; or upload CCTV footage to process with OpenCV.
            </p>
          </div>
        )}
      </div>

      {/* 🚨 Evidence Verification HUD Banner */}
      {activeEvidenceEvent && (
        <div className="absolute top-14 left-4 right-4 z-20 bg-slate-900/95 border border-red-500/50 rounded-xl p-3 backdrop-blur-md text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-red-400 uppercase tracking-wide">
                  {activeEvidenceEvent.type || "Evidence Clip"}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  • {activeEvidenceEvent.zone || title}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-0.5 truncate max-w-[340px]">
                Event at <span className="font-mono font-bold text-amber-300">{formatSeconds(activeEvidenceEvent.video_time_seconds || 0)}</span> (Window: {formatSeconds(activeEvidenceEvent.start_time || 0)} – {formatSeconds(activeEvidenceEvent.end_time || 0)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={replayEvidenceWindow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Replay from -10s"
            >
              <RotateCcw size={13} />
              <span>Replay Window</span>
            </button>
            {onClearEvidence && (
              <button
                onClick={onClearEvidence}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Return to Live Monitoring"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      {src && !hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-90 group-hover:opacity-100 transition-opacity duration-300 z-20">
          {/* Timeline Bar */}
          <div className="w-full flex items-center gap-2 mb-2 font-mono text-[11px] text-slate-300">
            <span>{formatSeconds(currentTime)}</span>
            <div 
              onClick={handleSeek}
              className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden cursor-pointer"
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              {activeEvidenceEvent && activeEvidenceEvent.video_time_seconds && duration > 0 && (
                <div 
                  className="absolute top-0 bottom-0 w-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]"
                  style={{ left: `${(activeEvidenceEvent.video_time_seconds / duration) * 100}%` }}
                  title={`Event Marker: ${formatSeconds(activeEvidenceEvent.video_time_seconds)}`}
                />
              )}
            </div>
            <span>{formatSeconds(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={togglePlay} 
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-blue-400 transition cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button 
                onClick={toggleMute} 
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-blue-400 transition cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <span className="text-xs text-slate-200 font-medium truncate max-w-[200px]">{title}</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFullscreen} 
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-blue-400 transition cursor-pointer"
                title="Fullscreen"
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




