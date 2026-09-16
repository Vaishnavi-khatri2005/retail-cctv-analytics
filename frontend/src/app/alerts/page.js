"use client";

import { AlertTriangle, ShieldAlert, CheckCircle2, Clock3, Filter, Play } from "lucide-react";
import Link from "next/link";
import { staticEvents } from "@/data/cctvData";

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

export default function AlertsPage() {
  const highRiskEvents = staticEvents.filter(e => e.risk === "High");
  const mediumRiskEvents = staticEvents.filter(e => e.risk === "Medium");

  return (
    <div className="px-5 py-8 lg:px-10 max-w-6xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-red-600 mb-1 font-semibold text-sm">
          <ShieldAlert size={18} />
          <span>Security & Loss Prevention Command</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Security Alerts & Incident Log
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review high-priority boundary intrusions, loitering alerts, and store perimeter security triggers.
        </p>
      </header>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-red-50/70 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Critical Alerts</span>
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-red-950 mt-3">{highRiskEvents.length}</p>
          <p className="text-xs text-red-700 mt-1 font-medium">Immediate perimeter & safe breaches</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Warnings</span>
            <Clock3 className="text-amber-600" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-amber-950 mt-3">{mediumRiskEvents.length}</p>
          <p className="text-xs text-amber-700 mt-1 font-medium">Queue & prolonged dwell alerts</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Perimeter Status</span>
            <CheckCircle2 className="text-emerald-600" size={20} />
          </div>
          <p className="text-4xl font-extrabold text-emerald-950 mt-3">Armed</p>
          <p className="text-xs text-emerald-700 mt-1 font-medium">4 active cameras monitoring zones</p>
        </div>
      </div>

      {/* Incident Log */}
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Incident Feed</h2>
            <p className="text-xs text-slate-500">Filtered for High & Medium risk store events</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {staticEvents.length} Total Incidents
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {staticEvents.map((event, i) => (
            <div key={event.id || i} className="flex flex-col gap-4 py-5 md:flex-row md:items-center hover:bg-slate-50/80 p-4 rounded-xl transition">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100">
                <AlertTriangle size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 text-base">{event.type}</span>
                  <RiskBadge risk={event.risk} />
                  <span className="text-xs text-slate-400 font-medium">• {event.zone}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1.5">{event.note}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 font-medium">{event.time}</span>
                <Link 
                  href={`/?cam=${event.video_id || 1}`}
                  className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Play size={12} /> Inspect Feed
                </Link>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
