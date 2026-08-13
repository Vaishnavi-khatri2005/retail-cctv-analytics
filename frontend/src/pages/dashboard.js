import Head from 'next/head';
import { useState, useEffect } from 'react';
import UploadModal from '../components/UploadModal';
import AnalyticsChart from '../components/AnalyticsChart';
import VideoPlayer from '../components/VideoPlayer';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch('https://retail-cctv-analytics-backend.onrender.com/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events');
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch('https://retail-cctv-analytics-backend.onrender.com/api/videos');
      if (res.ok) {
        const data = await res.json();
        setVideos(data);
        const completedVideos = data.filter(v => v.status === 'completed');
        if (completedVideos.length > 0 && !selectedVideo) {
          setSelectedVideo(completedVideos[0]);
        } else if (selectedVideo) {
           const updated = data.find(v => v.id === selectedVideo.id);
           if (updated) setSelectedVideo(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch videos');
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchVideos();
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchEvents();
      fetchVideos();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleModalClose = () => {
    setIsUploadOpen(false);
    fetchEvents();
    fetchVideos();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-blue-500/30">
      <Head>
        <title>Dashboard - Retail CCTV Analytics</title>
      </Head>
      
      <UploadModal isOpen={isUploadOpen} onClose={handleModalClose} />

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col relative z-20 shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">VisionAI</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide uppercase ml-11">Retail Analytics</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {['overview', 'cameras', 'analytics', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl capitalize transition-all duration-300 font-medium ${
                activeTab === tab
                  ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeTab === tab ? 'bg-blue-400' : 'bg-transparent'}`}></div>
              {tab}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-slate-800 shadow-md"></div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Admin User</p>
              <p className="text-xs text-slate-500">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>

        {/* Header */}
        <header className="h-24 flex items-center justify-between px-10 relative z-10">
          <h1 className="text-2xl font-semibold capitalize tracking-tight text-white">{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition border border-slate-700">
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
              Upload Footage
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 px-10 pb-10 overflow-y-auto relative z-10 custom-scrollbar">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-slate-900/80 backdrop-blur p-6 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
              <h3 className="text-white font-semibold mb-2">Footfall Analytics (Today)</h3>
              <AnalyticsChart />
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-slate-900/80 backdrop-blur p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Active Alerts</h3>
                <p className="text-4xl font-bold text-white tracking-tight">{events.filter(e => e.type === 'alert').length}</p>
                <div className="mt-4 flex items-center gap-2 text-rose-400 text-sm font-medium bg-rose-400/10 w-fit px-2.5 py-1 rounded-lg">
                  Requires attention
                </div>
              </div>

              <div className="bg-slate-900/80 backdrop-blur p-6 rounded-2xl border border-slate-800 shadow-xl flex-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                <h3 className="text-slate-400 text-sm font-medium mb-1">Camera Status</h3>
                <p className="text-4xl font-bold text-white tracking-tight">8<span className="text-2xl text-slate-500">/8</span></p>
                <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-400/10 w-fit px-2.5 py-1 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  All systems online
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 shadow-xl p-6 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Live Camera Feed</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium cursor-pointer">Cam 1</span>
                </div>
              </div>
              <VideoPlayer 
                src={selectedVideo && selectedVideo.status === 'completed' ? `https://retail-cctv-analytics-backend.onrender.com/api/videos/${selectedVideo.id}/stream` : null} 
                title={selectedVideo ? selectedVideo.filename : "Live Camera Feed"}
              />
              {selectedVideo && selectedVideo.status === 'processing' && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                    <span className="text-sm font-medium text-blue-400">Processing video... ({selectedVideo.filename})</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 shadow-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Events</h3>
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition">View All</button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {events.length > 0 ? events.map((event, i) => (
                  <div key={event.id || i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-950/50 hover:bg-slate-800 transition cursor-pointer border border-slate-800/50 hover:border-slate-700 group">
                    <div className={`mt-1.5 p-1.5 rounded-full ${
                      event.type === 'alert' ? 'bg-rose-500/20 text-rose-400' :
                      event.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                      event.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition">{event.description}</p>
                      <p className="text-xs text-slate-500 mt-1.5 font-medium">{new Date(event.timestamp).toLocaleTimeString()} • {event.camera_name}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-500 py-10">
                    <p className="text-sm">No recent events.</p>
                    <p className="text-xs mt-1">Upload a video to simulate processing.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
