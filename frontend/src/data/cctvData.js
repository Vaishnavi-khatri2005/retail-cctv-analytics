// Video URLs are dynamically resolved from the backend API video_id
export const BACKEND_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL !== undefined 
    ? process.env.NEXT_PUBLIC_BACKEND_URL 
    : (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" 
        ? "" 
        : "http://127.0.0.1:8000");


export const initialFootfallData = [
  { time: "10 AM", visitors: 18 },
  { time: "12 PM", visitors: 35 },
  { time: "02 PM", visitors: 29 },
  { time: "04 PM", visitors: 44 },
  { time: "06 PM", visitors: 62 },
  { time: "08 PM", visitors: 48 },
  { time: "10 PM", visitors: 22 },
];

export const zoneData = [
  { zone: "Main Aisle", value: 84, color: "#2563eb" },
  { zone: "Checkout", value: 62, color: "#059669" },
  { zone: "Showcase", value: 53, color: "#d97706" },
  { zone: "Backroom", value: 28, color: "#dc2626" },
];
// Retained as empty collections for pages that load API data after mount.
export const defaultPrerecordedCams = [];
export const staticEvents = [];
export const quickSearchSuggestions = [];
