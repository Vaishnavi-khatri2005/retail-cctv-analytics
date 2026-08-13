import { useState } from 'react';

export default function UploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    
    // Simulate progress bar before making the actual request for better UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setProgress(100);
        setTimeout(() => {
          onClose();
          setFile(null);
          setProgress(0);
          setUploading(false);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setUploading(false);
    } finally {
      clearInterval(interval);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white z-10">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <h2 className="text-xl font-bold text-white mb-2">Upload CCTV Footage</h2>
        <p className="text-sm text-slate-400 mb-6">Upload a video file for AI analysis and event detection.</p>
        
        <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-800/50 hover:bg-slate-800 transition relative mb-6">
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <svg className="w-10 h-10 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          {file ? (
            <p className="text-sm font-medium text-blue-400">{file.name}</p>
          ) : (
            <p className="text-sm text-slate-300">Drag and drop or click to select</p>
          )}
        </div>

        {uploading && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        <button 
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition shadow-lg shadow-blue-500/20"
        >
          {uploading ? 'Processing...' : 'Upload Video'}
        </button>
      </div>
    </div>
  );
}
