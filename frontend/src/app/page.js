"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Camera,
  Clock3,
  Download,
  Eye,
  Filter,
  MapPin,
  Play,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Upload,
  Users,
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
import { useState, useEffect } from "react";
import UploadModal from "../components/UploadModal";
import VideoPlayer from "../components/VideoPlayer";

const initialFootfallData = [
  { time: "10 AM", visitors: 12 },
  { time: "12 PM", visitors: 28 },
  { time: "2 PM", visitors: 22 },
  { time: "4 PM", visitors: 35 },
  { time: "6 PM", visitors: 54 },
  { time: "8 PM", visitors: 41 },
  { time: "10 PM", visitors: 16 },
];

const zoneData = [
  { zone: "Entry", value: 86, color: "#2563eb" },
  { zone: "Billing", value: 64, color: "#059669" },
  { zone: "Shelf A", value: 48, color: "#d97706" },
  { zone: "Exit", value: 38, color: "#7c3aed" },
];

const staticEvents = [
  {
    type: "Loitering",
    zone: "Shelf A",
    time: "08:42 PM",
    risk: "High",
    note: "Person stayed near premium shelf for 74 seconds.",
  },
  {
    type: "Queue formed",
    zone: "Billing",
    time: "07:18 PM",
    risk: "Medium",
    note: "Queue crossed 5 people for more than 4 minutes.",
  }
];

const stats = [
  { label: "Visitors Today", value: "186", delta: "+18%", icon: Users },
  { label: "Suspicious Events", value: "07", delta: "3 high risk", icon: AlertTriangle },
  { label: "Saved Clips", value: "24", delta: "ready to review", icon: Play },
  { label: "Active Cameras", value: "04", delta: "all online", icon: Camera },
];

const rules = [
  "Alert if a person stays near shelf for more than 60 seconds",
  "Flag staff-only zone entry during business hours",
  "Create clip when queue exceeds 5 people",
  "Summarize all entry and exit activity hourly",
];

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

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [eventsData, setEventsData] = useState(staticEvents);
  const [footfallData, setFootfallData] = useState(initialFootfallData);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchData = async () => {
    try {
      const [eventsRes, videosRes, analyticsRes] = await Promise.all([
        fetch('https://retail-cctv-analytics-backend.onrender.com/api/events'),
        fetch('https://retail-cctv-analytics-backend.onrender.com/api/videos'),
        fetch('https://retail-cctv-analytics-backend.onrender.com/api/analytics/footfall').catch(() => null)
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        if (data.length > 0) {
          // Map backend events to UI format
          const mappedEvents = data.map(ev => ({
            id: ev.id,
            type: ev.type === 'alert' ? 'Zone Alert' : 'Motion Detected',
            zone: ev.camera_name || 'Cam 1',
            time: new Date(ev.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            risk: ev.type === 'alert' ? 'High' : 'Low',
            note: ev.description
          }));
          setEventsData(mappedEvents);
        }
      }

      if (videosRes.ok) {
        const data = await videosRes.json();
        setVideos(data);
        const completedVideos = data.filter(v => v.status === 'completed');
        if (completedVideos.length > 0) {
          // Update selected video if it's new or not set
          setSelectedVideo(prev => {
            if (!prev) return completedVideos[0];
            const updated = data.find(v => v.id === prev.id);
            return updated || prev;
          });
        }
      }

      if (analyticsRes && analyticsRes.ok) {
         const data = await analyticsRes.json();
         // map 'footfall' to 'visitors'
         const mappedAnalytics = data.map(d => ({
           time: d.time,
           visitors: d.footfall
         }));
         setFootfallData(mappedAnalytics);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleModalClose = () => {
    setIsUploadOpen(false);
    fetchData();
  };

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-slate-950">
      <UploadModal isOpen={isUploadOpen} onClose={handleModalClose} />

      <aside className="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center border-r border-slate-200 bg-white py-5 lg:flex z-20">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white shadow-md">
          <Eye size={22} />
        </div>
        <nav className="mt-10 flex flex-1 flex-col gap-3">
          {[Activity, Search, Bell, MapPin, Settings].map((Icon, index) => (
            <button
              key={index}
              className={`flex h-11 w-11 items-center justify-center rounded-lg transition ${
                index === 0 ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-slate-500 hover:bg-slate-100"
              }`}
              title={Icon.name}
            >
              <Icon size={20} />
            </button>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-20">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-sm font-medium text-blue-700">RetailVision AI</p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
                CCTV Search and Analytics Dashboard
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Filter size={17} />
                Filters
              </button>
              <button 
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-md"
              >
                <Upload size={17} />
                Upload Video
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-5 px-5 py-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(({ label, value, delta, icon: Icon }) => (
                <article key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon size={20} />
                    </div>
                    <ArrowUpRight size={18} className="text-slate-400" />
                  </div>
                  <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <strong className="text-3xl font-semibold">{value}</strong>
                    <span className="text-sm font-medium text-slate-500">{delta}</span>
                  </div>
                </article>
              ))}
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
                        <linearGradient id="footfall" x1="0" x2="0" y1="0" y2="1">
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

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Searchable Event Timeline</h2>
                  <p className="text-sm text-slate-500">AI-tagged clips from uploaded CCTV footage.</p>
                </div>
                <div className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:w-72">
                  <Search size={17} className="shrink-0 text-slate-400" />
                  <span className="truncate text-sm text-slate-500">Search shelf, billing, risk...</span>
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-100">
                {eventsData.map((event, i) => (
                  <div key={event.id || i} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      {event.risk === "High" ? <AlertTriangle size={21} className="text-red-600"/> : <Clock3 size={21} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{event.type}</h3>
                        <RiskBadge risk={event.risk} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{event.note}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <span>{event.zone}</span>
                      <span>{event.time}</span>
                      <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white hover:bg-blue-600 transition" title="Play clip">
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <aside className="space-y-5">
            <article className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-lg overflow-hidden relative">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-sm text-slate-300">Live Processed Feed</p>
                  <h2 className="mt-1 text-xl font-semibold">
                     {selectedVideo ? selectedVideo.filename : "Shop Floor Camera 01"}
                  </h2>
                </div>
                <ShieldCheck className="text-emerald-400" size={26} />
              </div>
              
              <div className="mt-5 relative z-10 w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                <VideoPlayer 
                  src={selectedVideo && selectedVideo.status === 'completed' ? `https://retail-cctv-analytics-backend.onrender.com/api/videos/${selectedVideo.id}/stream` : null} 
                  title={selectedVideo ? selectedVideo.filename : "Upload a video..."}
                />
              </div>

              {selectedVideo && selectedVideo.status === 'processing' && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center gap-3 relative z-10">
                  <svg className="animate-spin w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                  <span className="text-sm font-medium text-blue-400">Processing video...</span>
                </div>
              )}

              <button className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-slate-950 hover:bg-slate-100 transition relative z-10">
                <Download size={17} />
                Export Daily Report
              </button>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Active Rules</h2>
              <div className="mt-4 space-y-3">
                {rules.map((rule) => (
                  <div key={rule} className="flex gap-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
                    <ShoppingBag size={18} className="mt-0.5 shrink-0 text-slate-500" />
                    <p className="text-sm leading-6 text-slate-600">{rule}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Build Roadmap</h2>
              <div className="mt-4 space-y-4">
                {["Video upload", "Person tracking", "Zone events", "Search and reports"].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${index < 3 ? "bg-emerald-500" : "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"}`} />
                    <span className="text-sm font-medium text-slate-600">{step}</span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
