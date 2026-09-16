"use client";

import { Play, Pause, Maximize, Volume2, VolumeX, Shield, Scan, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function VideoPlayer({ 
  src, 
  title = "Live Camera Feed",
  tag = "AI Monitored",
  showAiBoxes = true 
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [aiOverlay, setAiOverlay] = useState(showAiBoxes);
  const [timestamp, setTimestamp] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString() + " • " + now.toLocaleDateString());
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className="w-full flex-1 min-h-[320px] bg-slate-950 rounded-2xl flex flex-col justify-center border border-slate-800 relative overflow-hidden group shadow-2xl">
      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5">
        <div className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold px-3 py-1 rounded-md animate-pulse flex items-center gap-1.5 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-red-500"></div> LIVE STREAM
        </div>
        <div className="bg-slate-900/80 text-blue-400 border border-slate-700/60 text-xs font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm">
          {tag}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 font-mono text-[11px] text-slate-300 bg-black/60 px-2.5 py-1 rounded border border-white/10 backdrop-blur-sm">
        {timestamp}
      </div>

      {/* Simulated AI Detection Bounding Boxes Overlay */}
      {aiOverlay && isPlaying && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Box 1: Person Detection */}
          <div className="absolute top-[28%] left-[34%] w-[18%] h-[42%] border-2 border-emerald-400 bg-emerald-500/10 rounded-sm animate-pulse">
            <span className="absolute -top-5 left-0 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-t">
              Person 96%
            </span>
          </div>
          {/* Box 2: Retail Object / Zone Tracking */}
          <div className="absolute top-[45%] right-[26%] w-[22%] h-[35%] border border-blue-400 border-dashed bg-blue-500/5 rounded-sm">
            <span className="absolute -top-5 left-0 bg-blue-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-t">
              Zone: Shelf A (Active)
            </span>
          </div>
        </div>
      )}

      {/* Video Element */}
      {src ? (
        <video 
          ref={videoRef}
          src={src} 
          className="w-full h-full object-cover min-h-[320px]"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-slate-950/80">
          <Shield size={36} className="text-slate-600 mb-3 animate-pulse" />
          <p className="text-slate-400 font-medium text-sm">Waiting for live surveillance feed...</p>
          <p className="text-xs text-slate-600 mt-1">Select a pre-recorded camera channel or connect your shop's RTSP IP camera.</p>
        </div>
      )}

      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-90 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={togglePlay} 
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-blue-400 transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button 
              onClick={toggleMute} 
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-blue-400 transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-xs text-slate-200 font-medium truncate max-w-[200px]">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiOverlay(!aiOverlay)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition font-medium ${
                aiOverlay 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
              }`}
              title="Toggle AI Detection Bounding Boxes"
            >
              <Scan size={14} />
              <span>AI Bounding Box: {aiOverlay ? "ON" : "OFF"}</span>
            </button>
            <button 
              onClick={toggleFullscreen} 
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white hover:text-blue-400 transition"
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
