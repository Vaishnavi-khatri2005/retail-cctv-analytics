"use client";

import { useState, useEffect } from "react";
import { Upload, Database, CheckCircle2, Play, RefreshCw, Layers, Film } from "lucide-react";
import { BACKEND_URL } from "@/data/cctvData";

export default function UploadModal({ isOpen, onClose, onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState("dataset"); // 'dataset' or 'upload'
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSample, setSelectedSample] = useState("dataset_sample_main_aisle.mp4");
  const [samplesList, setSamplesList] = useState([
    { filename: "dataset_sample_main_aisle.mp4", title: "Main Aisle Customer Traffic", size_kb: 305 },
    { filename: "dataset_sample_checkout.mp4", title: "Cashier Checkout Queue", size_kb: 296 },
    { filename: "dataset_sample_restricted_backroom.mp4", title: "Restricted Backroom Intrusion", size_kb: 344 },
    { filename: "dataset_sample_jewelry_shelf.mp4", title: "Jewelry Showcase Dwell & Loitering", size_kb: 292 }
  ]);

  useEffect(() => {
    if (isOpen) {
      fetch(`${BACKEND_URL}/api/dataset/samples`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.samples && data.samples.length > 0) {
            setSamplesList(data.samples);
            setSelectedSample(data.samples[0].filename);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadFile = async () => {
    if (!file) return;
    setUploading(true);
    
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? 85 : prev + 15));
    }, 200);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/videos/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(100);
        setTimeout(() => {
          if (onAnalysisComplete) onAnalysisComplete(data);
          onClose();
          setFile(null);
          setProgress(0);
          setUploading(false);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  const handleRunOnDataset = async () => {
    setUploading(true);
    setProgress(25);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 20));
    }, 300);

    try {
      const res = await fetch(`${BACKEND_URL}/api/dataset/run-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sample_filename: selectedSample }),
      });

      if (res.ok) {
        const result = await res.json();
        setProgress(100);
        setTimeout(() => {
          if (onAnalysisComplete) onAnalysisComplete(result);
          onClose();
          setProgress(0);
          setUploading(false);
        }, 800);
      } else {
        setUploading(false);
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative text-white space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        <div>
          <h2 className="text-xl font-bold tracking-tight">Run CCTV Vision AI Pipeline</h2>
          <p className="text-xs text-slate-400 mt-1">Select an integrated dataset sample or upload custom CCTV footage.</p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("dataset")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "dataset" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Database size={14} />
            <span>Use Sample Dataset</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "upload" 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload size={14} />
            <span>Upload CCTV Video</span>
          </button>
        </div>

        {activeTab === "dataset" ? (
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-300">Choose integrated dataset footage for pipeline execution:</p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {samplesList.map((sample) => {
                const isSelected = selectedSample === sample.filename;
                return (
                  <button
                    key={sample.filename}
                    type="button"
                    onClick={() => setSelectedSample(sample.filename)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected 
                        ? "border-blue-500 bg-blue-600/20 text-white ring-1 ring-blue-500/50" 
                        : "border-slate-700/80 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Film size={18} className={isSelected ? "text-blue-400" : "text-slate-500"} />
                      <div>
                        <p className="text-xs font-semibold text-white">{sample.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sample.filename}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center bg-slate-800/40 hover:bg-slate-800/70 transition relative">
            <input 
              type="file" 
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            {file ? (
              <p className="text-xs font-semibold text-blue-400 truncate">{file.name}</p>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-200">Drag & drop video or click to browse</p>
                <p className="text-[11px] text-slate-400 mt-1">Supports MP4, AVI, MOV formats</p>
              </div>
            )}
          </div>
        )}

        {/* Progress indicator */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw size={12} className="animate-spin text-blue-400" />
                Executing Computer Vision Pipeline...
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={activeTab === "dataset" ? handleRunOnDataset : handleUploadFile}
            disabled={uploading || (activeTab === "upload" && !file)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            {uploading ? (
              <span>Analyzing Video...</span>
            ) : activeTab === "dataset" ? (
              <>
                <Play size={14} />
                <span>Run Analysis on Dataset</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload & Process Video</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
