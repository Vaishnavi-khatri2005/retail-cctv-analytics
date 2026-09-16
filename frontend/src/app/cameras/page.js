"use client";

import { Video, Camera, Play, CheckCircle2, Shield, Activity, Radio } from "lucide-react";
import Link from "next/link";
import { defaultPrerecordedCams } from "@/data/cctvData";

export default function CamerasPage() {
  return (
    <div className="px-5 py-8 lg:px-10 max-w-6xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-blue-600 mb-1 font-semibold text-sm">
          <Radio size={18} className="animate-pulse text-emerald-500" />
          <span>Multi-Channel CCTV Network</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Camera Channel & Feed Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor RTSP stream endpoints, frame rates, and active detection boundaries across all 4 store zones.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultPrerecordedCams.map((cam) => (
          <div 
            key={cam.id} 
            className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-lg">{cam.name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{cam.file}</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {cam.tag}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-5 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {cam.description}
              </p>

              <div className="grid grid-cols-3 gap-3 text-center mb-6">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">Resolution</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{cam.resolution}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">Frame Rate</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{cam.fps} FPS</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">Stream Bitrate</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{cam.bitrate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> {cam.status}
              </span>
              <Link 
                href={`/?cam=${cam.id}`}
                className="px-4 py-2 bg-slate-950 text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition flex items-center gap-1.5 shadow-sm"
              >
                <Play size={12} /> Launch Live Stream
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
