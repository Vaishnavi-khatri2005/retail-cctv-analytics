"use client";

import { useState } from "react";
import { Search, Sparkles, AlertTriangle, Clock3, Play, X } from "lucide-react";
import Link from "next/link";
import { BACKEND_URL, staticEvents, quickSearchSuggestions } from "@/data/cctvData";

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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchTotal, setSearchTotal] = useState(null);
  const [eventsData, setEventsData] = useState(staticEvents);

  const handleAISearch = async (queryText) => {
    const q = queryText !== undefined ? queryText : searchQuery;
    if (!q.trim()) {
      setSearchTotal(null);
      setEventsData(staticEvents);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/search/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, limit: 30 })
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setSearchTotal(data.total_matches);
        const mapped = (data.results || []).map(ev => ({
          id: ev.id,
          video_id: ev.video_id,
          type: ev.action || (ev.type === 'alert' ? 'Zone Alert' : 'Motion Detected'),
          zone: ev.camera_name || 'Cam 1',
          time: new Date(ev.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          risk: ev.risk || (ev.type === 'alert' ? 'High' : 'Low'),
          note: ev.description,
          match_score: ev.match_score || 90
        }));
        setEventsData(mapped);
      } else {
        const lowerQ = q.toLowerCase();
        const filtered = staticEvents.filter(e => 
          e.note.toLowerCase().includes(lowerQ) ||
          e.type.toLowerCase().includes(lowerQ) ||
          e.zone.toLowerCase().includes(lowerQ) ||
          e.risk.toLowerCase().includes(lowerQ) ||
          (lowerQ.includes("shelf") && e.note.toLowerCase().includes("shelf")) ||
          (lowerQ.includes("backroom") && e.zone.toLowerCase().includes("backroom")) ||
          (lowerQ.includes("alert") && e.risk.toLowerCase().includes("high")) ||
          (lowerQ.includes("queue") && e.type.toLowerCase().includes("queue")) ||
          (lowerQ.includes("loiter") && e.type.toLowerCase().includes("loiter"))
        );
        setSearchTotal(filtered.length);
        setEventsData(filtered);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-10 max-w-6xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-blue-600 mb-1 font-semibold text-sm">
          <Sparkles size={18} />
          <span>Multimodal Intelligence</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Natural Language CCTV Search Engine
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search multi-camera surveillance archives by describing activities, zones, or security violations in plain conversational English.
        </p>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAISearch(); }} 
          className="flex h-14 items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-5 focus-within:ring-4 focus-within:ring-blue-500/15 focus-within:border-blue-500 transition shadow-inner"
        >
          <Search size={22} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a query, e.g., 'show me loitering near shelf' or 'intrusion in staff backroom'..."
            className="w-full bg-transparent text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(""); handleAISearch(""); }}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-sm shrink-0 cursor-pointer"
          >
            Search CCTV
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Suggested Queries:</span>
          {quickSearchSuggestions.map((query) => (
            <button
              key={query}
              onClick={() => {
                setSearchQuery(query);
                handleAISearch(query);
              }}
              className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition border border-transparent cursor-pointer"
            >
              {query}
            </button>
          ))}
        </div>

        {searchTotal !== null && (
          <div className="mt-5 flex items-center justify-between text-xs text-slate-600 bg-blue-50/80 p-3 rounded-xl border border-blue-200">
            <span>Showing results matching <strong>&quot;{searchQuery}&quot;</strong></span>
            <span className="font-bold text-blue-700">{searchTotal} event(s) found</span>
          </div>
        )}

        <div className="mt-8 divide-y divide-slate-100">
          {isSearching ? (
            <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2.5">
              <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
              Matching visual vectors and semantic event tags...
            </div>
          ) : eventsData.length > 0 ? (
            eventsData.map((event, i) => (
              <div key={event.id || i} className="flex flex-col gap-4 py-5 md:flex-row md:items-center hover:bg-slate-50/80 p-4 rounded-xl transition">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  {event.risk === "High" ? <AlertTriangle size={24} className="text-red-600"/> : <Clock3 size={24} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 text-base">{event.type}</h3>
                    <RiskBadge risk={event.risk} />
                    {event.match_score && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/90 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {event.match_score}% Match
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">{event.note}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="font-medium bg-slate-100 px-3 py-1 rounded-lg text-xs">{event.zone}</span>
                  <span className="text-xs">{event.time}</span>
                  <Link 
                    href={`/?cam=${event.video_id || 1}`}
                    className="inline-flex h-9 px-3.5 items-center gap-1.5 rounded-xl bg-slate-950 text-white hover:bg-blue-600 transition shadow-sm text-xs font-semibold" 
                  >
                    <Play size={14} /> Play in Feed
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 text-sm">
              No matching CCTV recordings found. Try another query like &quot;loitering&quot; or &quot;backroom&quot;.
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
