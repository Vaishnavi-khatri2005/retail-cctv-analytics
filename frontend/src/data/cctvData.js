// Video URLs are dynamically resolved from the backend API video_id
export const BACKEND_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL !== undefined 
    ? process.env.NEXT_PUBLIC_BACKEND_URL 
    : (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" 
        ? "" 
        : "http://127.0.0.1:8000");


export const initialFootfallData = [];
export const zoneData = [];
// Retained as empty collections for pages that load API data after mount.
export const defaultPrerecordedCams = [];
export const staticEvents = [];
export const quickSearchSuggestions = [];
