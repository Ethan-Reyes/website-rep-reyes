import os
import requests
import csv
from datetime import datetime
from dotenv import load_dotenv

# Load variables from the .env file located in the same folder as this script
load_dotenv()

# ============================================================
# CONFIGURATION
# These are now pulled safely from your .env file
# ============================================================
NETLIFY_TOKEN = os.getenv("NETLIFY_TOKEN")
SITE_ID = os.getenv("SITE_ID")
STORE_NAME = "portfolio-stats"

# API Endpoints for Netlify Blobs
BASE_URL = f"https://api.netlify.com/api/v1/sites/{SITE_ID}/blobs/{STORE_NAME}"

headers = {
    "Authorization": f"Bearer {NETLIFY_TOKEN}",
    "Content-Type": "application/json"
}

def fetch_blob_data(key):
    try:
        response = requests.get(f"{BASE_URL}/{key}", headers=headers)
        if response.status_code == 200:
            # We assume the blob contains just the number as a string
            return response.text.strip()
        else:
            print(f"Notice: Could not find {key} (Status: {response.status_code})")
            return None
    except Exception as e:
        print(f"Connection Error: {e}")
        return None

def main():
    if not NETLIFY_TOKEN or not SITE_ID:
        print("ERROR: Credentials missing. Check your .env file in the tools folder.")
        return

    print("--- Extracting Data from Netlify Blobs ---")
    
    # 1. Fetch live data
    visitor_data = fetch_blob_data("visitor-count")
    resume_data = fetch_blob_data("resume-downloads")
    
    # 2. Prepare CSV
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    filename = "portfolio_metrics.csv"
    
    file_exists = os.path.isfile(filename)

    # 3. Write/Append Data
    with open(filename, mode='a', newline='') as file:
        writer = csv.writer(file)
        if not file_exists:
            writer.writerow(["Timestamp", "Metric", "Value"])
        
        # Only write if we actually got data back from the API
        if visitor_data:
            writer.writerow([timestamp, "Total Visits", visitor_data])
            print(f"Fetched Visits: {visitor_data}")
        
        if resume_data:
            writer.writerow([timestamp, "Resume Downloads", resume_data])
            print(f"Fetched Downloads: {resume_data}")

    print(f"--- Done! Data appended to {filename} ---")

if __name__ == "__main__":
    main()