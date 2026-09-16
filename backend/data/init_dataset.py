import cv2
import numpy as np
import os
import json

DATASET_DIR = os.path.join(os.path.dirname(__file__), "sample_cctv")
os.makedirs(DATASET_DIR, exist_ok=True)

def generate_cctv_clip(filename, scenario_type, duration_sec=8, fps=25):
    filepath = os.path.join(DATASET_DIR, filename)
    width, height = 640, 360
    total_frames = duration_sec * fps
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, fps, (width, height))
    
    annotations = []
    
    for frame_idx in range(total_frames):
        # Create CCTV shop background (tiled store floor + shelves)
        frame = np.full((height, width, 3), 40, dtype=np.uint8)
        
        # Floor grid lines
        for y in range(120, height, 40):
            cv2.line(frame, (0, y), (width, y), (55, 55, 55), 1)
        for x in range(0, width, 60):
            cv2.line(frame, (x, 120), (x, height), (50, 50, 50), 1)
            
        # Top Header / Store Structure
        cv2.rectangle(frame, (0, 0), (width, 100), (30, 30, 35), -1)
        cv2.putText(frame, f"RETAIL VISION AI - {scenario_type.upper()}", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
        cv2.putText(frame, f"CCTV DATASET SAMPLE - FRAME {frame_idx:04d}", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (130, 130, 130), 1)
        
        # Draw Zones based on scenario
        if scenario_type == "Main Aisle":
            # Left shelf & Right shelf
            cv2.rectangle(frame, (20, 110), (160, 340), (70, 60, 50), -1)
            cv2.putText(frame, "SHELF A (PROMO)", (30, 135), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
            
            cv2.rectangle(frame, (480, 110), (620, 340), (70, 60, 50), -1)
            cv2.putText(frame, "SHELF B (BEVERAGES)", (485, 135), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)
            
            # Moving pedestrian 1 (Walking from left to right)
            progress = frame_idx / total_frames
            px = int(180 + progress * 260)
            py = int(220 + np.sin(progress * 6) * 15)
            
            cv2.circle(frame, (px, py - 35), 12, (180, 180, 220), -1) # head
            cv2.rectangle(frame, (px - 15, py - 20), (px + 15, py + 40), (120, 160, 220), -1) # torso
            cv2.line(frame, (px - 8, py + 40), (px - 12, py + 75), (80, 80, 120), 4) # legs
            cv2.line(frame, (px + 8, py + 40), (px + 12, py + 75), (80, 80, 120), 4)
            
            # Shopping cart
            cart_x = px + 25
            cv2.rectangle(frame, (cart_x, py), (cart_x + 30, py + 35), (200, 200, 200), 2)
            cv2.circle(frame, (cart_x + 5, py + 38), 4, (100, 100, 100), -1)
            cv2.circle(frame, (cart_x + 25, py + 38), 4, (100, 100, 100), -1)
            
            annotations.append({
                "frame": frame_idx,
                "bbox": [px - 20, py - 50, 80, 130],
                "label": "person_with_cart",
                "zone": "Aisle Corridor"
            })

        elif scenario_type == "Checkout Counter":
            # Billing Counter
            cv2.rectangle(frame, (280, 140), (360, 320), (80, 80, 90), -1)
            cv2.putText(frame, "POS COUNTER", (285, 165), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)
            
            # Cashier
            cv2.circle(frame, (320, 115), 12, (200, 220, 180), -1)
            cv2.rectangle(frame, (305, 128), (335, 180), (80, 180, 80), -1)
            
            # Queued customers
            for q_idx in range(3):
                qx = 220 - q_idx * 65
                qy = 220
                cv2.circle(frame, (qx, qy - 35), 12, (180, 180, 220), -1)
                cv2.rectangle(frame, (qx - 15, qy - 20), (qx + 15, qy + 40), (120, 120, 200), -1)
                annotations.append({
                    "frame": frame_idx,
                    "bbox": [qx - 20, qy - 50, 40, 110],
                    "label": f"queued_shopper_{q_idx+1}",
                    "zone": "Checkout Queue"
                })

        elif scenario_type == "Restricted Backroom":
            # Security tripwire line
            tripwire_x = 320
            cv2.line(frame, (tripwire_x, 100), (tripwire_x, height), (0, 0, 255), 2)
            cv2.putText(frame, "RESTRICTED BOUNDARY TRIPWIRE", (tripwire_x + 10, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
            
            # Inventory shelves
            cv2.rectangle(frame, (380, 140), (620, 330), (50, 50, 60), -1)
            cv2.putText(frame, "CASH SAFE & HIGH-VAL VAULT", (390, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 200, 200), 1)
            
            # Subject approaching and crossing tripwire
            progress = frame_idx / total_frames
            sx = int(140 + progress * 280)
            sy = 230
            
            color = (0, 0, 255) if sx > tripwire_x else (200, 180, 140)
            cv2.circle(frame, (sx, sy - 35), 12, color, -1)
            cv2.rectangle(frame, (sx - 15, sy - 20), (sx + 15, sy + 40), color, -1)
            
            annotations.append({
                "frame": frame_idx,
                "bbox": [sx - 20, sy - 50, 40, 110],
                "label": "unauthorized_subject" if sx > tripwire_x else "subject_in_hallway",
                "crossed_tripwire": bool(sx > tripwire_x)
            })

        else: # Jewelry Shelf Loitering
            cv2.rectangle(frame, (180, 130), (460, 220), (100, 90, 60), -1)
            cv2.putText(frame, "PREMIUM JEWELRY / LUXURY SHOWCASE", (190, 155), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 230, 150), 1)
            
            # Loitering subject lingering near showcase
            dwell_offset = int(np.sin(frame_idx * 0.1) * 8)
            lx = 320 + dwell_offset
            ly = 260
            
            cv2.circle(frame, (lx, ly - 35), 12, (220, 160, 160), -1)
            cv2.rectangle(frame, (lx - 15, ly - 20), (lx + 15, ly + 40), (180, 100, 100), -1)
            
            annotations.append({
                "frame": frame_idx,
                "bbox": [lx - 20, ly - 50, 40, 110],
                "label": "prolonged_loitering_subject",
                "dwell_frames": frame_idx
            })
            
        out.write(frame)
        
    out.release()
    return annotations

# Generate real dataset clips
all_dataset_meta = {}
scenarios = [
    ("dataset_sample_main_aisle.mp4", "Main Aisle"),
    ("dataset_sample_checkout.mp4", "Checkout Counter"),
    ("dataset_sample_restricted_backroom.mp4", "Restricted Backroom"),
    ("dataset_sample_jewelry_shelf.mp4", "Jewelry Shelf"),
]

for filename, name in scenarios:
    annos = generate_cctv_clip(filename, name)
    all_dataset_meta[filename] = {
        "scenario": name,
        "frames": len(annos),
        "annotations_sample_count": len(annos)
    }

with open(os.path.join(DATASET_DIR, "annotations.json"), "w") as f:
    json.dump(all_dataset_meta, f, indent=2)

print("Dataset generated successfully in:", DATASET_DIR)
