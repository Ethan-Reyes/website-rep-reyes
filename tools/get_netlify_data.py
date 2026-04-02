"""
================================================================
get_netlify_data.py
ETL Pipeline — Ethan Reyes Portfolio
Fetches live metrics from the Netlify get-stats function
and saves structured CSVs for Power BI and Unity.
================================================================
"""

import os
import json
import csv
import requests
from datetime import datetime
from dotenv import load_dotenv

# ── Load environment variables ────────────────────────────────
load_dotenv()

SITE_URL = os.getenv("NETLIFY_SITE_URL", "https://your-site.netlify.app")
STATS_ENDPOINT = f"{SITE_URL}/.netlify/functions/get-stats"

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
METRICS_CSV  = os.path.join(OUTPUT_DIR, "portfolio_metrics.csv")
COUNTRY_CSV  = os.path.join(OUTPUT_DIR, "portfolio_countries.csv")
VISITS_CSV   = os.path.join(OUTPUT_DIR, "portfolio_visits.csv")


def fetch_stats():
    """Fetch all portfolio stats from the Netlify function."""
    print(f"Fetching stats from {STATS_ENDPOINT}...")
    response = requests.get(STATS_ENDPOINT, timeout=10)
    response.raise_for_status()
    data = response.json()
    print(f"✓ Data received at {data.get('generatedAt', 'unknown time')}")
    return data


def save_metrics_csv(data):
    """
    Save high-level totals to portfolio_metrics.csv.
    This is the primary file for Power BI line/bar charts.
    """
    totals = data.get("totals", {})
    row = {
        "timestamp":       datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_visitors":  totals.get("visitors", 0),
        "resume_downloads":totals.get("resumeDownloads", 0),
        "top_country":     data.get("countrySummary", [{}])[0].get("country", "N/A")
                           if data.get("countrySummary") else "N/A"
    }

    # Append to existing CSV or create new one with headers
    file_exists = os.path.isfile(METRICS_CSV)
    with open(METRICS_CSV, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=row.keys())
        if not file_exists:
            writer.writeheader()
        writer.writerow(row)

    print(f"✓ Metrics saved → {METRICS_CSV}")
    print(f"  Visitors: {row['total_visitors']} | Downloads: {row['resume_downloads']}")


def save_country_csv(data):
    """
    Save per-country visit counts to portfolio_countries.csv.
    Used by Power BI map visuals and Unity globe pin placement.
    """
    countries = data.get("countrySummary", [])
    if not countries:
        print("  No country data available yet.")
        return

    with open(COUNTRY_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["country", "visits"])
        writer.writeheader()
        writer.writerows(countries)

    print(f"✓ Country data saved → {COUNTRY_CSV} ({len(countries)} countries)")


def save_visits_csv(data):
    """
    Save recent individual visit events to portfolio_visits.csv.
    Used by Power BI for time-series charts and Unity for city pins.
    """
    visits = data.get("recentVisits", [])
    if not visits:
        print("  No visit log available yet.")
        return

    fieldnames = [
        "visitNumber", "timestamp", "country",
        "city", "region", "timezone", "userAgent"
    ]

    with open(VISITS_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(visits)

    print(f"✓ Visit log saved → {VISITS_CSV} ({len(visits)} recent visits)")


def main():
    print("\n========================================")
    print("  Portfolio ETL Pipeline")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("========================================\n")

    try:
        data = fetch_stats()
        save_metrics_csv(data)
        save_country_csv(data)
        save_visits_csv(data)
        print("\n✓ ETL complete. Open Power BI and refresh your data source.")

    except requests.exceptions.ConnectionError:
        print("✗ Could not connect. Check your NETLIFY_SITE_URL in .env")
    except requests.exceptions.HTTPError as e:
        print(f"✗ HTTP error: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")


if __name__ == "__main__":
    main()