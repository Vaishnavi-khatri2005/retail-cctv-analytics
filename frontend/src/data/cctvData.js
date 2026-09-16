export const BACKEND_URL = "https://retail-cctv-analytics-backend.onrender.com";

export const initialFootfallData = [
  { time: "10 AM", visitors: 12 },
  { time: "12 PM", visitors: 28 },
  { time: "2 PM", visitors: 22 },
  { time: "4 PM", visitors: 35 },
  { time: "6 PM", visitors: 54 },
  { time: "8 PM", visitors: 41 },
  { time: "10 PM", visitors: 16 },
];

export const zoneData = [
  { zone: "Entry", value: 86, color: "#2563eb" },
  { zone: "Billing", value: 64, color: "#059669" },
  { zone: "Shelf A", value: 48, color: "#d97706" },
  { zone: "Exit", value: 38, color: "#7c3aed" },
];

export const defaultPrerecordedCams = [
  { 
    id: 1, 
    name: "Cam 1: Main Aisle", 
    file: "cam1_main_aisle_peak_hours.mp4", 
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    tag: "Footfall", 
    color: "border-blue-200 bg-blue-50/50",
    resolution: "1080p",
    fps: 30,
    bitrate: "4.2 Mbps",
    status: "Active Tracking",
    description: "Main entrance corridor tracking customer flow and promotional rack interactions."
  },
  { 
    id: 2, 
    name: "Cam 2: Checkout Queue", 
    file: "cam2_checkout_counter_queue.mp4", 
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    tag: "Queue", 
    color: "border-amber-200 bg-amber-50/50",
    resolution: "1080p",
    fps: 30,
    bitrate: "3.8 Mbps",
    status: "Active Tracking",
    description: "Billing counter overhead camera monitoring queue length and cashier throughput."
  },
  { 
    id: 3, 
    name: "Cam 3: Staff Backroom", 
    file: "cam3_restricted_staff_backroom.mp4", 
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    tag: "Restricted Zone", 
    color: "border-red-200 bg-red-50/50",
    resolution: "1080p",
    fps: 25,
    bitrate: "3.5 Mbps",
    status: "Perimeter Armed",
    description: "High-security inventory storage and cash safe corridor with restricted access trigger."
  },
  { 
    id: 4, 
    name: "Cam 4: Premium Shelf", 
    file: "cam4_premium_electronics_shelf.mp4", 
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    tag: "Loitering", 
    color: "border-purple-200 bg-purple-50/50",
    resolution: "1080p",
    fps: 30,
    bitrate: "4.5 Mbps",
    status: "Dwell Trigger Armed",
    description: "High-value display aisle tracking customer dwell time and shrinkage prevention."
  },
];

export const staticEvents = [
  {
    id: 101,
    video_id: 4,
    type: "Loitering",
    zone: "Cam 4 (Electronics Shelf)",
    time: "08:42 PM",
    risk: "High",
    note: "Person stayed near premium electronics shelf for 82 seconds without picking item.",
    match_score: 96,
  },
  {
    id: 102,
    video_id: 3,
    type: "Intrusion",
    zone: "Cam 3 (Staff Backroom)",
    time: "08:19 PM",
    risk: "High",
    note: "Customer crossed restricted boundary into Staff Only inventory backroom.",
    match_score: 98,
  },
  {
    id: 103,
    video_id: 2,
    type: "Queue",
    zone: "Cam 2 (Checkout Counter)",
    time: "07:55 PM",
    risk: "Medium",
    note: "Checkout queue exceeded 5 customers at Billing Counter 2 for > 4 minutes.",
    match_score: 91,
  },
  {
    id: 104,
    video_id: 1,
    type: "Movement",
    zone: "Cam 1 (Main Aisle)",
    time: "07:22 PM",
    risk: "Low",
    note: "Group of 3 customers entered shopping aisle and browsed promotional rack.",
    match_score: 94,
  },
  {
    id: 105,
    video_id: 3,
    type: "Intrusion",
    zone: "Cam 3 (Staff Backroom)",
    time: "06:45 PM",
    risk: "High",
    note: "Unauthorized motion detected near cash safe during evening shift transition.",
    match_score: 97,
  },
  {
    id: 106,
    video_id: 4,
    type: "Loitering",
    zone: "Cam 4 (Electronics Shelf)",
    time: "05:12 PM",
    risk: "Medium",
    note: "Suspicious continuous loitering near unlocked accessory cabinet.",
    match_score: 89,
  }
];

export const quickSearchSuggestions = [
  "Loitering near shelf",
  "Intrusion in staff backroom",
  "Queue forming at billing",
  "High risk alerts",
  "Customer movement"
];
