"use client";

import { 
  Play, 
  Pause, 
  Maximize, 
  Volume2, 
  VolumeX, 
  Shield, 
  Scan, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Target
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

function formatSeconds(sec) {
  if (typeof sec !== "number" || isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ 
  src, 
  title = "Live Camera Feed",
  tag = "AI Monitored",
  showAiBoxes = true,
  activeEvidenceEvent = null,
  onClearEvidence = null,
  onReplayEvidence = null
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [aiOverlay, setAiOverlay] = useState(showAiBoxes);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timestamp, setTimestamp] = useState("");
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

  // When activeEvidenceEvent changes, seek to start_time and start playback
  useEffect(() => {
    if (activeEvidenceEvent && videoRef.current) {
      const startTime = activeEvidenceEvent.start_time !== undefined ? activeEvidenceEvent.start_time : 0;
      videoRef.current.currentTime = startTime;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [activeEvidenceEvent]);

  // Handle timeupdate to enforce evidence window clamping/looping if in evidence mode
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (activeEvidenceEvent && activeEvidenceEvent.end_time) {
      // If reached the end of the evidence window, loop back to start_time
      if (curr >= activeEvidenceEvent.end_time) {
        videoRef.current.currentTime = activeEvidenceEvent.start_time || 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      if (activeEvidenceEvent) {
        videoRef.current.currentTime = activeEvidenceEvent.start_time || 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
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
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const replayEvidenceWindow = () => {
    if (videoRef.current && activeEvidenceEvent) {
      videoRef.current.currentTime = activeEvidenceEvent.start_time || 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    if (onReplayEvidence) onReplayEvidence();
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
          <div className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-md animate-pulse flex items-center gap-1.5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500"></div> LIVE STREAM
          </div>
        )}
        <div className="bg-slate-900/80 text-blue-400 border border-slate-700/60 text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm">
          {tag}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 font-mono text-[11px] text-slate-300 bg-black/70 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm">
        {timestamp}
      </div>

      {/* 🎯 Real Dynamic AI Detection Bounding Box Overlay */}
      {aiOverlay && isPlaying && activeEvidenceEvent && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div 
            className={`absolute border-2 transition-all duration-150 ${
              activeEvidenceEvent.risk === "High" 
                ? "border-red-500 bg-red-500/15 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                : activeEvidenceEvent.risk === "Medium"
                ? "border-amber-400 bg-amber-400/15 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                : "border-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            } rounded-xs`}
            style={{
              left: `${Math.max(5, Math.min(80, (activeEvidenceEvent.bbox_x || 0.35) * 100))}%`,
              top: `${Math.max(8, Math.min(65, (activeEvidenceEvent.bbox_y || 0.3) * 100))}%`,
              width: `${Math.max(12, Math.min(50, (activeEvidenceEvent.bbox_w || 0.2) * 100))}%`,
              height: `${Math.max(15, Math.min(60, (activeEvidenceEvent.bbox_h || 0.45) * 100))}%`,
            }}
          >
            {/* Tag Badge */}
            <div className={`absolute -top-7 left-0 px-2 py-0.5 rounded-t text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap ${
              activeEvidenceEvent.risk === "High" 
                ? "bg-red-600 text-white" 
                : activeEvidenceEvent.risk === "Medium"
                ? "bg-amber-500 text-black"
                : "bg-emerald-500 text-black"
            }`}>
              <Target size={12} />
              <span>
                {activeEvidenceEvent.class_name ? activeEvidenceEvent.class_name.replace(/_/g, " ").toUpperCase() : (activeEvidenceEvent.type || "DETECTED OBJECT")}
              </span>
              <span className="opacity-90 font-mono text-[10px]">
                {activeEvidenceEvent.match_score || Math.round((activeEvidenceEvent.confidence || 0.95) * 100)}%
              </span>
              {activeEvidenceEvent.track_id && (
                <span className="opacity-75 font-mono text-[9px] border-l border-white/40 pl-1">
                  ID #{activeEvidenceEvent.track_id}
                </span>
              )}
            </div>

            {/* Target Crosshairs */}
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white/80"></div>
            <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-white/80"></div>
            <div className="absolute bottom-1 left-1 w-2 h-1 border-b-2 border-l-2 border-white/80"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white/80"></div>
          </div>
        </div>
      )}

      {/* Fallback Ambient Tracking Box when AI Overlay is ON and in live mode */}
      {aiOverlay && isPlaying && !activeEvidenceEvent && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div 
            className="absolute border border-emerald-400/80 bg-emerald-500/10 rounded-xs transition-all duration-700 animate-pulse"
            style={{ left: "32%", top: "28%", width: "22%", height: "46%" }}
          >
            <span className="absolute -top-5 left-0 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-t">
              Active Tracking • YOLOv8
            </span>
          </div>
        </div>
      )}

      {/* Video Element */}
      {src ? (
        <video 
          ref={videoRef}
          src={src} 
          className="w-full h-full object-cover min-h-[340px]"
          autoPlay
          loop={!activeEvidenceEvent}
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      ) : (
        <div className="min-h-[340px] flex flex-col items-center justify-center p-8 text-center bg-slate-950/80">
          <Shield size={36} className="text-slate-600 mb-3 animate-pulse" />
          <p className="text-slate-400 font-medium text-sm">Waiting for live surveillance feed...</p>
          <p className="text-xs text-slate-600 mt-1">Select a pre-recorded camera channel or connect your shop's RTSP IP camera.</p>
        </div>
      )}

      {/* 🚨 Evidence Verification HUD Banner */}
      {activeEvidenceEvent && (
        <div className="absolute top-14 left-4 right-4 z-20 bg-slate-900/90 border border-red-500/50 rounded-xl p-3 backdrop-blur-md text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 opacity-90 group-hover:opacity-100 transition-opacity duration-300 z-20">
        {/* Timeline Bar */}
        <div className="w-full flex items-center gap-2 mb-2 font-mono text-[11px] text-slate-300">
          <span>{formatSeconds(currentTime)}</span>
          <div className="relative flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
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
            <span className="text-xs text-slate-200 font-medium truncate max-w-[180px]">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOverlay(!aiOverlay)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                aiOverlay 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
              }`}
              title="Toggle AI Detection Bounding Boxes"
            >
              <Scan size={14} />
              <span>Bounding Boxes: {aiOverlay ? "ON" : "OFF"}</span>
            </button>
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
    </div>
  );
}

