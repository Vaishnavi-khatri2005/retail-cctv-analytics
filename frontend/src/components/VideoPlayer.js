import { Play, Pause, Maximize, Volume2 } from 'lucide-react';
import { useState, useRef } from 'react';

export default function VideoPlayer({ src, title = "Live Camera Feed" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

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

  return (
    <div className="w-full flex-1 min-h-[300px] bg-slate-950 rounded-xl flex flex-col justify-center border border-slate-800 relative overflow-hidden group shadow-inner">
      <div className="absolute top-4 left-4 z-10 bg-red-500/20 text-red-500 border border-red-500/50 text-xs font-bold px-3 py-1 rounded-md animate-pulse flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> REC
      </div>
      
      {src ? (
        <video 
          ref={videoRef}
          src={src} 
          className="w-full h-full object-cover"
          onEnded={() => setIsPlaying(false)}
          loop
          muted
        />
      ) : (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay flex flex-col items-center justify-center">
          <div className="text-center mt-12">
             <p className="text-slate-500 font-medium">Waiting for video stream...</p>
             <p className="text-xs text-slate-600 mt-1">Upload a video to test processing.</p>
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-blue-400 transition">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="text-white hover:text-blue-400 transition">
              <Volume2 size={20} />
            </button>
            <span className="text-xs text-slate-300 font-medium">{title}</span>
          </div>
          <button className="text-white hover:text-blue-400 transition">
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
