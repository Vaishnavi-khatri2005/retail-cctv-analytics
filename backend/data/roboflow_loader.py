import os
import urllib.request
import json

DATASET_DIR = os.path.join(os.path.dirname(__file__), "sample_cctv")
os.makedirs(DATASET_DIR, exist_ok=True)

def load_roboflow_dataset(workspace="roboflow-universe", project="retail-cctv", version=1):
    """
    Downloads or syncs dataset frames from Roboflow Universe using standard API.
    Uses ROBOFLOW_API_KEY environment variable.
    """
    api_key = os.getenv("ROBOFLOW_API_KEY")
    if not api_key:
        print("ROBOFLOW_API_KEY not set. Using local integrated sample CCTV dataset.")
        return False

    try:
        url = f"https://api.roboflow.com/{workspace}/{project}/{version}?api_key={api_key}"
        req = urllib.request.Request(url, headers={"User-Agent": "RetailVision-AI"})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print(f"Connected to Roboflow project: {data.get('name')}")
            return data
    except Exception as e:
        print("Roboflow sync notice:", e)
        return False
