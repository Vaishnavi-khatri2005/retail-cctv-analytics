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
  Target,
  Video as VideoIcon
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
  const [duration, setDuration] = useState(30);
  const [timestamp, setTimestamp] = useState("");
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const simTimeRef = useRef(0);

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
    if (activeEvidenceEvent) {
      const startTime = activeEvidenceEvent.start_time !== undefined ? activeEvidenceEvent.start_time : 0;
      simTimeRef.current = startTime;
      setCurrentTime(startTime);
      if (videoRef.current && videoLoaded && !hasVideoError) {
        videoRef.current.currentTime = startTime;
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
    }
  }, [activeEvidenceEvent, videoLoaded, hasVideoError]);

  // Reset video status when source changes
  useEffect(() => {
    setVideoLoaded(false);
    setHasVideoError(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [src]);

  // Handle timeupdate for HTML5 video
  const handleTimeUpdate = () => {
    if (!videoRef.current || hasVideoError) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    if (activeEvidenceEvent && activeEvidenceEvent.end_time) {
      if (curr >= activeEvidenceEvent.end_time) {
        videoRef.current.currentTime = activeEvidenceEvent.start_time || 0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 30);
      setVideoLoaded(true);
      setHasVideoError(false);
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleVideoError = () => {
    setHasVideoError(true);
    setVideoLoaded(false);
  };

  // 🎥 High-Performance Live CCTV Surveillance Simulation Canvas Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = Date.now();
    let isNight = title.toLowerCase().includes("night") || tag.toLowerCase().includes("night");
    let isVault = title.toLowerCase().includes("backroom") || title.toLowerCase().includes("safe");
    let isCheckout = title.toLowerCase().includes("cashier") || title.toLowerCase().includes("queue");

    const renderFrame = () => {
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Update simulated time if video is playing in canvas fallback mode
      if (isPlaying) {
        simTimeRef.current = (simTimeRef.current + 0.033) % 40;
        if (activeEvidenceEvent && activeEvidenceEvent.end_time) {
          if (simTimeRef.current >= activeEvidenceEvent.end_time || simTimeRef.current < (activeEvidenceEvent.start_time || 0)) {
            simTimeRef.current = activeEvidenceEvent.start_time || 0;
          }
        }
        if (hasVideoError || !videoLoaded) {
          setCurrentTime(simTimeRef.current);
        }
      }

      // 1. Background Store Floor & Walls
      if (isNight) {
        ctx.fillStyle = "#051510"; // Night Vision Dark Emerald
      } else if (isVault) {
        ctx.fillStyle = "#0b0f19"; // Security Vault Dark Blue
      } else {
        ctx.fillStyle = "#0f172a"; // Standard Supermarket Floor
      }
      ctx.fillRect(0, 0, w, h);

      // Floor Perspective Tiles
      ctx.strokeStyle = isNight ? "rgba(34, 197, 94, 0.15)" : "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, h * 0.4);
        ctx.lineTo(i * 1.4 - 100, h);
        ctx.stroke();
      }
      for (let y = h * 0.4; y < h; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Store Fixtures & Aisles
      if (isCheckout) {
        // Cashier Desks
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(w * 0.1, h * 0.55, w * 0.25, h * 0.3);
        ctx.fillRect(w * 0.55, h * 0.55, w * 0.25, h * 0.3);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(w * 0.12, h * 0.52, 40, 15);
        ctx.fillRect(w * 0.57, h * 0.52, 40, 15);
      } else if (isVault) {
        // Restricted Vault Door & Red Boundary Tripwire
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(w * 0.7, h * 0.25, w * 0.25, h * 0.65);
        ctx.strokeStyle = "#ef4444";
        ctx.setLineDash([8, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.6, 0);
        ctx.lineTo(w * 0.6, h);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Supermarket Gondola Shelves Left & Right
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, h * 0.3, w * 0.22, h * 0.65);
        ctx.fillRect(w * 0.78, h * 0.3, w * 0.22, h * 0.65);

        // Product Color Blocks on Shelves
        const colors = ["#ef4444", "#3b82f6", "#eab308", "#10b981", "#8b5cf6"];
        for (let shelf = 0; shelf < 4; shelf++) {
          for (let item = 0; item < 5; item++) {
            ctx.fillStyle = colors[(shelf + item) % colors.length];
            ctx.fillRect(10 + item * 14, h * 0.38 + shelf * 38, 10, 18);
            ctx.fillRect(w - 75 + item * 14, h * 0.38 + shelf * 38, 10, 18);
          }
        }
      }

      // 2. Animated Pedestrians & Customers
      const t = simTimeRef.current;
      
      // Person 1 (Shopper / Main Subject)
      let p1X = (w * 0.35) + Math.sin(t * 0.4) * (w * 0.15);
      let p1Y = (h * 0.48) + Math.cos(t * 0.3) * (h * 0.12);
      
      if (activeEvidenceEvent && activeEvidenceEvent.bbox_x) {
        p1X = activeEvidenceEvent.bbox_x * w;
        p1Y = activeEvidenceEvent.bbox_y * h;
      }

      // Draw Person 1 Body
      ctx.fillStyle = isNight ? "#22c55e" : "#3b82f6";
      ctx.beginPath();
      ctx.arc(p1X + 20, p1Y + 12, 12, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(p1X + 8, p1Y + 24, 24, 45); // Torso & Legs

      // Person 2 (Secondary customer / Cashier)
      let p2X = (w * 0.2) + Math.cos(t * 0.5) * 20;
      let p2Y = (h * 0.55);
      ctx.fillStyle = isNight ? "#16a34a" : "#64748b";
      ctx.beginPath();
      ctx.arc(p2X + 15, p2Y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(p2X + 5, p2Y + 20, 20, 40);

      // 3. CCTV Camera Lens Scanlines & Noise Grain
      ctx.fillStyle = isNight ? "rgba(34, 197, 94, 0.04)" : "rgba(255, 255, 255, 0.02)";
      for (let sl = 0; sl < h; sl += 4) {
        ctx.fillRect(0, sl, w, 1.5);
      }

      // Camera Crosshair Overlay in center
      ctx.strokeStyle = isNight ? "rgba(34, 197, 94, 0.3)" : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 20, h / 2);
      ctx.lineTo(w / 2 + 20, h / 2);
      ctx.moveTo(w / 2, h / 2 - 20);
      ctx.lineTo(w / 2, h / 2 + 20);
      ctx.stroke();

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, title, tag, activeEvidenceEvent, hasVideoError, videoLoaded]);

  const togglePlay = () => {
    if (videoRef.current && videoLoaded && !hasVideoError) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const el = canvasRef.current?.parentElement || videoRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen();
    }
  };

  const replayEvidenceWindow = () => {
    const startTime = activeEvidenceEvent?.start_time || 0;
    simTimeRef.current = startTime;
    setCurrentTime(startTime);
    if (videoRef.current && videoLoaded && !hasVideoError) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(true);
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
              width: `${Math.max(14, Math.min(45, (activeEvidenceEvent.bbox_w || 0.2) * 100))}%`,
              height: `${Math.max(20, Math.min(55, (activeEvidenceEvent.bbox_h || 0.45) * 100))}%`,
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

      {/* 🎥 Video Container with Dynamic Canvas Fallback */}
      <div className="relative w-full h-full min-h-[340px] flex items-center justify-center bg-slate-950">
        {src && !hasVideoError && (
          <video 
            ref={videoRef}
            src={src} 
            className={`w-full h-full object-cover min-h-[340px] ${videoLoaded ? "block" : "hidden"}`}
            autoPlay
            loop={!activeEvidenceEvent}
            muted={isMuted}
            defaultMuted
            playsInline
            crossOrigin="anonymous"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleVideoError}
          />
        )}
        
        {/* Animated CCTV Surveillance Simulation Canvas (renders active feed immediately) */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className={`w-full h-full object-cover min-h-[340px] ${videoLoaded && !hasVideoError ? "hidden" : "block"}`}
        />
      </div>

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


