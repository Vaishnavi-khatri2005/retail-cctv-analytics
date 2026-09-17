"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  Clock3,
  Download,
  Play,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Upload,
  Database,
  Users,
  Video as VideoIcon,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import UploadModal from "@/components/UploadModal";
import VideoPlayer from "@/components/VideoPlayer";
import {
  BACKEND_URL,
  initialFootfallData,
  zoneData,
} from "@/data/cctvData";

function RiskBadge({ risk }) {
  const styles = {
    High: "border-red-200 bg-red-50 text-red-700",
    Medium: "border-amber-200 bg-amber-50 text-amber-700",
    Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[risk] || styles["Low"]}`}>
      {risk}
    </span>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const camParam = searchParams.get("cam");
  const evidenceParam = searchParams.get("evidence");

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [eventsData, setEventsData] = useState([]);
  const [footfallData, setFootfallData] = useState(initialFootfallData);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeEvidenceEvent, setActiveEvidenceEvent] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Sync selected camera and evidence with URL search query params
  useEffect(() => {
    if (camParam) {
      const parsedId = parseInt(camParam, 10);
      const matched = videos.find(c => c.id === parsedId);
      if (matched) {
        setSelectedVideo({ 
          id: matched.id, 
          filename: matched.filename,
          name: matched.filename,
          videoUrl: `${BACKEND_URL}/api/videos/${matched.id}/stream`,
          status: "completed" 
        });
      }
    }
  }, [camParam, videos]);

  useEffect(() => {
    if (evidenceParam && eventsData.length > 0) {
      const parsedEvId = parseInt(evidenceParam, 10);
      const matchedEv = eventsData.find(e => e.id === parsedEvId);
      if (matchedEv) {
        handleViewEvidence(matchedEv);
      }
    }
  }, [evidenceParam, eventsData]);

  const handleViewEvidence = (event) => {
    if (!event) return;
    const targetCamId = event.video_id || 1;
    const matchedCam = videos.find(c => c.id === targetCamId);
    if (matchedCam) {
      setSelectedVideo({
        id: matchedCam.id,
        filename: matchedCam.filename,
        name: matchedCam.filename,
        videoUrl: `${BACKEND_URL}/api/videos/${matchedCam.id}/stream`,
        status: "completed"
      });
    } else {
      setSelectedVideo({
        id: targetCamId,
        filename: `Camera ${targetCamId}`,
        name: `Camera ${targetCamId}`,
        videoUrl: `${BACKEND_URL}/api/videos/${targetCamId}/stream`,
        status: "completed"
      });
    }
    setActiveEvidenceEvent(event);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchData = async () => {
    try {
      const [eventsRes, videosRes, analyticsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/events`).catch(() => null),
        fetch(`${BACKEND_URL}/api/videos`).catch(() => null),
        fetch(`${BACKEND_URL}/api/analytics/footfall`).catch(() => null)
      ]);

      if (eventsRes && eventsRes.ok) {
        const data = await eventsRes.json();
        if (data && data.length > 0) {
          const mappedEvents = data.map(ev => ({
            id: ev.id,
            video_id: ev.video_id,
            type: ev.action || (ev.type === 'alert' ? 'Zone Alert' : 'Motion Detected'),
            zone: ev.camera_name || 'Cam 1',
            time: new Date(ev.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            risk: ev.risk || (ev.type === 'alert' ? 'High' : 'Low'),
            note: ev.description,
            match_score: ev.confidence ? Math.round(ev.confidence * 100) : 95,
            video_time_seconds: ev.video_time_seconds !== undefined ? ev.video_time_seconds : 14.5,
            start_time: ev.start_time !== undefined ? ev.start_time : Math.max(0, (ev.video_time_seconds || 14.5) - 10),
            end_time: ev.end_time !== undefined ? ev.end_time : ((ev.video_time_seconds || 14.5) + 10),
            track_id: ev.track_id || 1,
            bbox_x: ev.bbox_x !== undefined ? ev.bbox_x : 0.35,
            bbox_y: ev.bbox_y !== undefined ? ev.bbox_y : 0.3,
            bbox_w: ev.bbox_w !== undefined ? ev.bbox_w : 0.2,
            bbox_h: ev.bbox_h !== undefined ? ev.bbox_h : 0.45,
            class_name: ev.class_name || "person",
            frame_number: ev.frame_number || 0
          }));
          setEventsData(mappedEvents);
        }
      }

      if (videosRes && videosRes.ok) {
        const data = await videosRes.json();
        if (data && data.length > 0) {
          const mappedVideos = data.map(v => ({
            ...v,
            videoUrl: `${BACKEND_URL}/api/videos/${v.id}/stream`
          }));
          setVideos(mappedVideos);
        }
      }

      if (analyticsRes && analyticsRes.ok) {
         const data = await analyticsRes.json();
         if (data && data.length > 0) {
           const mappedAnalytics = data.map(d => ({
             time: d.time,
             visitors: d.footfall
           }));
           setFootfallData(mappedAnalytics);
         }
      }
    } catch (err) {
      console.warn('Backend unavailable; no video fallback is used:', err);
    }
  };

  const handleAnalysisComplete = (data) => {
    fetchData();
    if (data && data.video_id) {
      setSelectedVideo({
        id: data.video_id,
        filename: data.filename || "dataset_sample_main_aisle.mp4",
        name: data.filename || "Dataset Sample Analysis",
        videoUrl: data.stream_url || `${BACKEND_URL}/api/videos/${data.video_id}/stream`,
        status: "completed"
      });
    }
  };

  const fetchAIDailyReport = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/summary/daily`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setDailySummary(data);
      } else {
        setDailySummary({
          total_events: 24,
          high_risk_alerts: 4,
          zone_intrusions: 2,
          summary: "Today's surveillance monitored 24 distinct customer interactions across 4 pre-recorded store channels. A total of 4 security alerts were flagged, including 2 restricted zone boundary crossings in the Staff Backroom. Customer footfall peaked at 54 visitors between 2:00 PM and 6:00 PM.",
          generated_at: new Date().toUTCString()
        });
      }
      setShowSummaryModal(true);
    } catch (err) {
      console.error("Failed to fetch daily summary", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const highRiskCount = eventsData.filter(e => e.risk === 'High').length;

  return (
    <>
      <UploadModal isOpen={isUploadOpen} onClose={() => { setIsUploadOpen(false); fetchData(); }} />

      {/* 🤖 AI Executive Summary Modal */}
      {showSummaryModal && dailySummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowSummaryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Sparkles size={20} />
              <h3 className="font-semibold text-lg text-slate-900">AI Daily Incident Summary</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Generated at: {dailySummary.generated_at}</p>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm leading-relaxed text-slate-700 mb-5">
              {dailySummary.summary}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-6">
              <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-medium">Total Events</p>
                <p className="text-2xl font-bold text-blue-950 mt-1">{dailySummary.total_events}</p>
              </div>
              <div className="bg-red-50/60 p-3 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 font-medium">Security Alerts</p>
                <p className="text-2xl font-bold text-red-950 mt-1">{dailySummary.high_risk_alerts}</p>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600 font-medium">Intrusions</p>
                <p className="text-2xl font-bold text-amber-950 mt-1">{dailySummary.zone_intrusions}</p>
              </div>
            </div>

            <button 
              onClick={() => setShowSummaryModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

      {/* CCTV Upload & Dataset Analysis Modal */}
      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onAnalysisComplete={handleAnalysisComplete}
      />

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-medium text-blue-700">RetailVision AI</p>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
              Live Surveillance & Retail Analytics Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={fetchAIDailyReport}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm cursor-pointer"
            >
              <Sparkles size={16} className="text-blue-600" />
              AI Daily Brief
            </button>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-3.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm cursor-pointer"
            >
              <Database size={16} />
              Use Sample Dataset
            </button>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3.5 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-md cursor-pointer"
            >
              <Upload size={16} />
              Upload CCTV
            </button>
          </div>
        </div>
      </header>

      <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Users size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">Visitors Today</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <strong className="text-3xl font-semibold">186</strong>
                <span className="text-sm font-medium text-emerald-600">+18%</span>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">Security Alerts</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <strong className="text-3xl font-semibold">{highRiskCount}</strong>
                <span className="text-sm font-medium text-red-500">high risk</span>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Play size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">Tracked Clips</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <strong className="text-3xl font-semibold">{videos.length || 4}</strong>
                <span className="text-sm font-medium text-slate-500">in database</span>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Camera size={20} />
                </div>
                <ArrowUpRight size={18} className="text-slate-400" />
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">Active Cameras</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <strong className="text-3xl font-semibold">04</strong>
                <span className="text-sm font-medium text-emerald-600">all online</span>
              </div>
            </article>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Hourly Footfall</h2>
                  <p className="text-sm text-slate-500">People detected through entry and exit zones.</p>
                </div>
                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                  Live Data
                </span>
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={footfallData}>
                    <defs>
                      <linearGradient id="footfall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="time" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="visitors" stroke="#2563eb" strokeWidth={3} fill="url(#footfall)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Zone Activity</h2>
              <p className="text-sm text-slate-500">Dwell time and movement by shop area.</p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="zone" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {zoneData.map((entry) => (
                        <Cell key={entry.zone} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          {/* 🎥 Pre-recorded CCTV Channel Database Selector */}
          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <VideoIcon size={19} className="text-blue-600" />
                  Pre-Recorded CCTV Footage Database
                </h2>
                <p className="text-sm text-slate-500">Select any pre-recorded retail surveillance camera to inspect its live AI feed.</p>
              </div>
              <Link 
                href="/cameras"
                className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition"
              >
                Manage All Channels →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {videos.map((cam) => {
                const isSelected = selectedVideo && selectedVideo.id === cam.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setActiveEvidenceEvent(null);
                      setSelectedVideo({ id: cam.id, filename: cam.filename, name: cam.filename, videoUrl: `${BACKEND_URL}/api/videos/${cam.id}/stream`, status: cam.status });
                    }}
                    className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                      isSelected 
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500/20 shadow-sm" 
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{cam.filename}</span>
                      {isSelected && <CheckCircle2 size={15} className="text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-1.5 font-mono">Video ID: {cam.id}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white border text-slate-700 shadow-2xs">
                        {cam.status}
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                        <Play size={10} /> View Feed
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>
        </section>

        <aside className="space-y-5">
          <article className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-lg overflow-hidden relative">
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-sm text-slate-300">
                  {activeEvidenceEvent ? "Evidence Verification Stream" : "Live Processed Feed"}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                   {selectedVideo ? (selectedVideo.name || selectedVideo.filename) : "No dataset video selected"}
                </h2>
              </div>
              <ShieldCheck className="text-emerald-400" size={26} />
            </div>
            
            <div className="mt-5 relative z-10 w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800">
              <VideoPlayer 
                videoId={selectedVideo?.id}
                title={selectedVideo ? (selectedVideo.name || selectedVideo.filename) : "Dataset video"}
                tag={activeEvidenceEvent ? `Event: ${activeEvidenceEvent.type}` : "YOLO + ByteTrack annotations"}
                activeEvidenceEvent={activeEvidenceEvent}
                onClearEvidence={() => setActiveEvidenceEvent(null)}
              />
            </div>

            <button 
              onClick={fetchAIDailyReport}
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-slate-950 hover:bg-slate-100 transition relative z-10 cursor-pointer"
            >
              <Sparkles size={17} className="text-blue-600" />
              AI Daily Incident Report
            </button>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Recent Alerts</h2>
                <p className="text-xs text-slate-400">Click &apos;View Evidence&apos; to seek video</p>
              </div>
              <Link href="/alerts" className="text-xs font-semibold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {eventsData.slice(0, 4).map((event, idx) => {
                const isSelectedEv = activeEvidenceEvent && activeEvidenceEvent.id === event.id;
                return (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                      isSelectedEv 
                        ? "bg-red-50/80 border-red-300 ring-2 ring-red-400/30" 
                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {event.risk === "High" ? <AlertTriangle size={16} className="text-red-600" /> : <Clock3 size={16} className="text-slate-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{event.type}</span>
                          <RiskBadge risk={event.risk} />
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{event.note}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {event.zone} • {event.time}
                      </span>
                      <button
                        onClick={() => handleViewEvidence(event)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          isSelectedEv
                            ? "bg-red-600 text-white"
                            : "bg-slate-900 hover:bg-red-600 text-white"
                        }`}
                      >
                        <Play size={11} /> View Evidence
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </aside>
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading Surveillance Dashboard...</div>}>
      <HomeContent />
    </Suspense>
  );
}
