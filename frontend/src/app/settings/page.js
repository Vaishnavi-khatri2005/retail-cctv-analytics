"use client";

import { useState } from "react";
import { Sliders, Shield, Bell, CheckCircle2, Save, Cpu } from "lucide-react";

export default function SettingsPage() {
  const [detectionConfidence, setDetectionConfidence] = useState(85);
  const [loiteringThreshold, setLoiteringThreshold] = useState(60);
  const [queueThreshold, setQueueThreshold] = useState(5);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const handleSave = () => {
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3500);
  };

  return (
    <div className="px-5 py-8 lg:px-10 max-w-4xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-blue-600 mb-1 font-semibold text-sm">
          <Sliders size={18} />
          <span>System & Parameter Configuration</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          AI Detection & Surveillance Rules
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Tune background subtraction sensitivity, boundary intrusion thresholds, and notification rules.
        </p>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Cpu size={18} className="text-blue-600" />
            Computer Vision Hyperparameters
          </h2>
          <p className="text-xs text-slate-500 mb-6">Configures OpenCV contour filtering and confidence thresholds.</p>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
                <label>AI Detection Confidence Cutoff</label>
                <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {detectionConfidence}%
                </span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="99" 
                value={detectionConfidence} 
                onChange={(e) => setDetectionConfidence(e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-slate-400 mt-1.5">Lower values detect faint movements; higher values prevent shadow false-alarms.</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
                <label>Loitering Dwell Trigger</label>
                <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {loiteringThreshold} Seconds
                </span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="180" 
                value={loiteringThreshold} 
                onChange={(e) => setLoiteringThreshold(e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-slate-400 mt-1.5">Max allowable stationary time in premium display aisles before alert dispatch.</p>
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-800 mb-2">
                <label>Queue Congestion Threshold</label>
                <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                  {queueThreshold} People
                </span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="15" 
                value={queueThreshold} 
                onChange={(e) => setQueueThreshold(e.target.value)}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-slate-400 mt-1.5">Number of customers standing in billing zone before triggering cashier assistance alert.</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition cursor-pointer shadow-md flex items-center gap-2"
          >
            <Save size={16} /> Save Configuration
          </button>

          {saveSuccessMessage && (
            <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={18} /> Settings successfully synced with AI engine!
            </span>
          )}
        </div>
      </article>
    </div>
  );
}
