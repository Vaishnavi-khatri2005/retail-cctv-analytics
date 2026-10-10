"use client";

import { useState } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Layers, 
  Eye, 
  Sliders, 
  BellRing, 
  Radio, 
  CheckCircle2, 
  X, 
  Video,
  Lock,
  Clock,
  Sparkles
} from "lucide-react";

export default function LossPreventionPage() {
  const [selectedCamera, setSelectedCamera] = useState("cam1");
  const [activeTab, setActiveTab] = useState("geofence"); // 'geofence' | 'behavior' | 'dispatch'
  
  // Geofence Zones
  const [zones, setZones] = useState([
    {
      id: "z1",
      name: "Restricted Staff Backroom",
      type: "Polygon Geofence",
      risk: "High",
      color: "rgba(239, 68, 68, 0.35)",
      borderColor: "#ef4444",
      enabled: true,
      camera: "cam1",
      dwellThreshold: 5,
      points: [
        { x: 15, y: 20 },
        { x: 45, y: 20 },
        { x: 45, y: 65 },
        { x: 15, y: 65 }
      ]
    },
    {
      id: "z2",
      name: "Jewelry Showcase Dwell Perimeter",
      type: "Loitering Dwell Zone",
      risk: "Medium",
      color: "rgba(245, 158, 11, 0.35)",
      borderColor: "#f59e0b",
      enabled: true,
      camera: "cam1",
      dwellThreshold: 30,
      points: [
        { x: 55, y: 30 },
        { x: 88, y: 30 },
        { x: 88, y: 75 },
        { x: 55, y: 75 }
      ]
    },
    {
      id: "z3",
      name: "Cash Drawer Operator Box",
      type: "Staff-Only Tripwire",
      risk: "High",
      color: "rgba(168, 85, 247, 0.35)",
      borderColor: "#a855f7",
      enabled: false,
      camera: "cam2",
      dwellThreshold: 0,
      points: [
        { x: 25, y: 40 },
        { x: 65, y: 40 },
        { x: 65, y: 80 },
        { x: 25, y: 80 }
      ]
    }
  ]);

  // Behavioral AI Rules
  const [behaviorRules, setBehaviorRules] = useState([
    {
      id: "b1",
      title: "Concealment & Rapid Bag Stowing",
      desc: "Triggers when YOLO pose detects arm reaching into bag/coat immediately following shelf item interaction.",
      enabled: true,
      sensitivity: "High (0.82)",
      action: "Instant Alert & 10s Clip Crop"
    },
    {
      id: "b2",
      title: "Display Case Loitering & Scouting",
      desc: "Alerts security if an individual remains stationary in front of high-value merchandise for over 45 seconds.",
      enabled: true,
      sensitivity: "Medium (45s)",
      action: "Floor Staff Telegram Push"
    },
    {
      id: "b3",
      title: "Unattended Object / Abandoned Bag",
      desc: "Flags parcels, backpacks, or boxes left stationary in public aisles with no owner in 2m proximity.",
      enabled: true,
      sensitivity: "Strict (3 mins)",
      action: "Store PA Audio Chime"
    },
    {
      id: "b4",
      title: "Shelf Sweeping / Bulk Item Removal",
      desc: "Flags rapid depletion of SKU count within a 5-second window to prevent organized retail theft.",
      enabled: false,
      sensitivity: "Medium",
      action: "Manager SMS"
    }
  ]);

  // Live Security Violations Log
  const [securityEvents] = useState([
    {
      id: "sec-101",
      timestamp: "Just now (12:34 PM)",
      zone: "Restricted Staff Backroom",
      type: "Geofence Boundary Cross",
      risk: "High",
      personId: "#104",
      confidence: "94.2%",
      note: "Unregistered customer crossed into backroom corridor"
    },
    {
      id: "sec-102",
      timestamp: "4 mins ago",
      zone: "Jewelry Showcase Dwell Perimeter",
      type: "Loitering Threshold Exceeded",
      risk: "Medium",
      personId: "#89",
      confidence: "88.7%",
      note: "Continuous dwell time of 52 seconds in high-value zone"
    },
    {
      id: "sec-103",
      timestamp: "18 mins ago",
      zone: "Main Entrance",
      type: "Directional Flow Check",
      risk: "Low",
      personId: "#76",
      confidence: "91.0%",
      note: "Standard customer entry sequence logged"
    }
  ]);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneRisk, setNewZoneRisk] = useState("High");
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleZone = (id) => {
    setZones(zones.map(z => z.id === id ? { ...z, enabled: !z.enabled } : z));
  };

  const deleteZone = (id) => {
    setZones(zones.filter(z => z.id !== id));
  };

  const handleCreateZone = (e) => {
    e.preventDefault();
    if (!newZoneName) return;
    const newZ = {
      id: `z-${Date.now()}`,
      name: newZoneName,
      type: "Custom Polygon",
      risk: newZoneRisk,
      color: newZoneRisk === "High" ? "rgba(239, 68, 68, 0.35)" : "rgba(245, 158, 11, 0.35)",
      borderColor: newZoneRisk === "High" ? "#ef4444" : "#f59e0b",
      enabled: true,
      camera: selectedCamera,
      dwellThreshold: 10,
      points: [
        { x: 30, y: 30 },
        { x: 70, y: 30 },
        { x: 70, y: 70 },
        { x: 30, y: 70 }
      ]
    };
    setZones([...zones, newZ]);
    setNewZoneName("");
    setShowAddModal(false);
  };

  return (
    <div className="px-5 py-8 lg:px-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <header className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1 font-semibold text-sm">
            <ShieldAlert size={18} className="animate-pulse" />
            <span>AI Loss Prevention & Surveillance Shield</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Advanced Loss Prevention & Geofencing
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Draw virtual polygon boundaries, configure shoplifting heuristics, and manage automated dispatch triggers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus size={16} />
            <span>Draw New Geofence Zone</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("geofence")}
          className={`pb-3 font-semibold text-sm transition relative cursor-pointer flex items-center gap-2 ${
            activeTab === "geofence" ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers size={17} />
          <span>Virtual Geofence Zones ({zones.length})</span>
          {activeTab === "geofence" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("behavior")}
          className={`pb-3 font-semibold text-sm transition relative cursor-pointer flex items-center gap-2 ${
            activeTab === "behavior" ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles size={17} />
          <span>Shoplifting & Behavioral AI ({behaviorRules.length})</span>
          {activeTab === "behavior" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("dispatch")}
          className={`pb-3 font-semibold text-sm transition relative cursor-pointer flex items-center gap-2 ${
            activeTab === "dispatch" ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <BellRing size={17} />
          <span>Incident Dispatch Rules</span>
          {activeTab === "dispatch" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: GEOFENCING ZONE EDITOR */}
      {activeTab === "geofence" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Visual Canvas / Zone Editor Overlay */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-blue-600" />
                  <h2 className="font-bold text-slate-900 text-base">Live Camera Boundary Overlay</h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-500">Camera Feed:</span>
                  <select 
                    value={selectedCamera} 
                    onChange={(e) => setSelectedCamera(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold bg-slate-50 text-slate-800"
                  >
                    <option value="cam1">Cam 1: Main Retail Floor</option>
                    <option value="cam2">Cam 2: Checkout & Cash Drawer</option>
                    <option value="cam3">Cam 3: Staff Backroom Entrance</option>
                    <option value="cam4">Cam 4: Jewelry & Premium Display</option>
                  </select>
                </div>
              </div>

              {/* Video Preview Frame with Canvas Geofence Overlay */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 shadow-inner group">
                {/* Fallback CCTV simulated background view */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
                  <div className="text-center p-6 space-y-2 opacity-80">
                    <Radio size={32} className="mx-auto text-emerald-400 animate-pulse" />
                    <p className="text-xs font-mono text-slate-300">
                      LIVE SURVEILLANCE FEED — CHANNEL {selectedCamera.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Click anywhere on the stream to drop polygon anchor points
                    </p>
                  </div>
                </div>

                {/* SVG Overlay representing defined polygon zones */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {zones.filter(z => z.enabled).map(z => {
                    const pointsStr = z.points.map(p => `${p.x}%,${p.y}%`).join(" ");
                    return (
                      <g key={z.id}>
                        <polygon
                          points={pointsStr}
                          fill={z.color}
                          stroke={z.borderColor}
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                        />
                        {/* Zone Label Pin */}
                        <text
                          x={`${z.points[0].x + 2}%`}
                          y={`${z.points[0].y + 5}%`}
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          className="drop-shadow"
                        >
                          {z.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Status Bar */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Real-time Geofence Monitor: ACTIVE</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    Active Polygons: {zones.filter(z => z.enabled).length} / {zones.length}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Sliders size={14} className="text-slate-400" />
                  Polygon coordinates automatically update on backend YOLO tracker
                </span>
                <span className="font-medium text-blue-600">
                  Precision: 100% Hardware-Accelerated
                </span>
              </div>
            </div>

            {/* Live Security Violations Log */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  Recent Geofence Trigger Events
                </h3>
                <span className="text-xs text-slate-500 font-medium">Auto-refreshing</span>
              </div>

              <div className="divide-y divide-slate-100">
                {securityEvents.map(ev => (
                  <div key={ev.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        ev.risk === "High" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-xs">{ev.zone}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            ev.risk === "High" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {ev.risk} Risk
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">{ev.note}</p>
                        <span className="text-[11px] text-slate-400">{ev.timestamp} • Tracker ID {ev.personId} ({ev.confidence})</span>
                      </div>
                    </div>

                    <button 
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition shrink-0 cursor-pointer"
                      onClick={() => alert(`Reviewing clip for incident ${ev.id}`)}
                    >
                      View Clip
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Zone Configuration Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Configured Zones</h3>
                <span className="text-xs font-medium text-slate-500">{zones.length} Total</span>
              </div>

              <div className="space-y-3">
                {zones.map(z => (
                  <div 
                    key={z.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 ${
                      z.enabled ? "border-slate-300 bg-slate-50/50" : "border-slate-100 bg-white opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: z.borderColor }} 
                        />
                        <span className="font-semibold text-slate-900 text-xs truncate">
                          {z.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleZone(z.id)}
                          className={`w-8 h-4.5 rounded-full transition relative cursor-pointer ${
                            z.enabled ? "bg-blue-600" : "bg-slate-300"
                          }`}
                          aria-label={`Toggle zone ${z.name}`}
                        >
                          <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition shadow-sm ${
                            z.enabled ? "right-0.5" : "left-0.5"
                          }`} />
                        </button>

                        <button
                          onClick={() => deleteZone(z.id)}
                          className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                          aria-label="Delete zone"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Type: {z.type}</span>
                      <span className={`font-semibold ${z.risk === "High" ? "text-red-600" : "text-amber-600"}`}>
                        {z.risk} Severity
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Security Summary Box */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <ShieldCheck size={18} className="text-blue-600" />
                <span>Geofencing Protection Active</span>
              </div>
              <p className="text-xs text-blue-950/80 leading-relaxed">
                YOLO tracks coordinates across all polygon zones every 60ms. Unlawful entry automatically logs event proof clips and alerts store floor staff.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BEHAVIORAL AI RULES */}
      {activeTab === "behavior" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {behaviorRules.map(rule => (
              <div 
                key={rule.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      {rule.title}
                    </h3>
                    <button
                      onClick={() => setBehaviorRules(behaviorRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                      className={`w-9 h-5 rounded-full transition relative cursor-pointer ${
                        rule.enabled ? "bg-blue-600" : "bg-slate-300"
                      }`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition shadow-sm ${
                        rule.enabled ? "right-0.5" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Sensitivity: <strong className="text-slate-800">{rule.sensitivity}</strong></span>
                  <span>Action: <strong className="text-blue-600">{rule.action}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISPATCH RULES */}
      {activeTab === "dispatch" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Security Notification Channels</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure where automated alerts and 10s video evidence clips are pushed.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Telegram Bot Push</span>
                <span className="text-xs text-slate-500">Sends video snippet to store manager channel</span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Slack Security Webhook</span>
                <span className="text-xs text-slate-500">Pushes incident card to #loss-prevention</span>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-900 text-sm block">Store Speaker Chime</span>
                <span className="text-xs text-slate-500">Plays subtle audio reminder when restricted door opens</span>
              </div>
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
            </label>
          </div>
        </div>
      )}

      {/* MODAL: ADD GEOFENCE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                Create Virtual Geofence
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Zone Name
                </label>
                <input 
                  type="text" 
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Designer Handbag Showcase"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Risk Level
                </label>
                <select 
                  value={newZoneRisk}
                  onChange={(e) => setNewZoneRisk(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High Risk (Instant Alarm)</option>
                  <option value="Medium">Medium Risk (Loitering Alert)</option>
                  <option value="Low">Low Risk (Visitor Count Only)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                >
                  Save Geofence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
