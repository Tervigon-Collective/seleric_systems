"""
ingest_weather.py
─────────────────
Fetch historical + forecast weather for top Indian cities from Open-Meteo
(free, no API key) and write to gold.fct_city_weather_day.

Fetches: past_days=7 + forecast_days=7  →  14-day window per run.
ReplacingMergeTree on (date, city) — idempotent, safe to re-run daily.

Weather stages written per row:
  RAIN_ACTIVE    rainfall_mm > 10
  RAIN_EMERGING  rainfall_mm > 2  OR  rain_probability > 60 %
  RAIN_DECLINING yesterday had rain > 5 mm AND today rain <= 2 mm
  HUMIDITY_HIGH  humidity_max > 80 %  (and no rain signal)
  HEAT_HIGH      temperature_max > 38 °C
  COLD_HIGH      temperature_max < 15 °C
  DRY            else

Usage
─────
  py backend/scripts/ingest_weather.py
  py backend/scripts/ingest_weather.py --past-days 30 --forecast-days 7
  py backend/scripts/ingest_weather.py --dry-run
  py backend/scripts/ingest_weather.py --cities Mumbai Pune Bengaluru
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pandas as pd
import requests

# ── ClickHouse connection ─────────────────────────────────────────────────────

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB   = os.environ.get("CLICKHOUSE_DATABASE", "gold")

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# ── City database ─────────────────────────────────────────────────────────────
# Covers all variants seen in mart_city_product_sales + mart_geo_product_opportunity.
# Variants map to a canonical city name with coordinates.

CITY_DB: list[dict] = [
    # Maharashtra
    {"canonical": "Mumbai",       "variants": ["Mumbai", "MUMBAI", "Mumbai Subueban", "Mumbai Suburban", "Bombay"], "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    {"canonical": "Pune",         "variants": ["Pune", "PUNE"],                "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567},
    {"canonical": "Thane",        "variants": ["Thane"],                        "state": "Maharashtra", "lat": 19.2183, "lon": 72.9781},
    {"canonical": "Nagpur",       "variants": ["Nagpur"],                       "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882},
    {"canonical": "Nanded",       "variants": ["Nanded"],                       "state": "Maharashtra", "lat": 19.1383, "lon": 77.3210},
    {"canonical": "Raigarh",      "variants": ["Raigarh MH", "Raigarh"],        "state": "Maharashtra", "lat": 18.6286, "lon": 73.1200},
    # Karnataka
    {"canonical": "Bengaluru",    "variants": ["Bengaluru", "Bangalore", "BANGALORE", "Bangaluru"], "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    # Delhi NCR
    {"canonical": "Delhi",        "variants": ["Delhi", "New Delhi", "South Delhi", "South West Delhi", "Central Delhi", "West Delhi", "North West Delhi", "North Delhi", "East Delhi"], "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    {"canonical": "Gurugram",     "variants": ["Gurugram", "Gurgaon"],           "state": "Haryana", "lat": 28.4595, "lon": 77.0266},
    {"canonical": "Faridabad",    "variants": ["Faridabad"],                     "state": "Haryana", "lat": 28.4089, "lon": 77.3178},
    {"canonical": "Noida",        "variants": ["Noida", "Gautam Buddha Nagar"], "state": "Uttar Pradesh", "lat": 28.5355, "lon": 77.3910},
    {"canonical": "Ghaziabad",    "variants": ["Ghaziabad"],                     "state": "Uttar Pradesh", "lat": 28.6692, "lon": 77.4538},
    # West Bengal
    {"canonical": "Kolkata",      "variants": ["Kolkata", "Calcutta", "South 24 Parganas", "North 24 Parganas"], "state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
    # Telangana / AP
    {"canonical": "Hyderabad",    "variants": ["Hyderabad", "HYDERABAD", "Rangareddy", "K V Rangareddy"], "state": "Telangana", "lat": 17.3850, "lon": 78.4867},
    # Tamil Nadu
    {"canonical": "Chennai",      "variants": ["Chennai", "Madras", "Kanchipuram"], "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
    # Gujarat
    {"canonical": "Ahmedabad",    "variants": ["Ahmedabad", "AHMEDABAD"],       "state": "Gujarat", "lat": 23.0225, "lon": 72.5714},
    {"canonical": "Vadodara",     "variants": ["Vadodara"],                     "state": "Gujarat", "lat": 22.3072, "lon": 73.1812},
    {"canonical": "Surat",        "variants": ["Surat"],                        "state": "Gujarat", "lat": 21.1702, "lon": 72.8311},
    # Madhya Pradesh
    {"canonical": "Indore",       "variants": ["Indore"],                       "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577},
    {"canonical": "Bhopal",       "variants": ["Bhopal"],                       "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126},
    # Uttar Pradesh
    {"canonical": "Lucknow",      "variants": ["Lucknow"],                      "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
    {"canonical": "Agra",         "variants": ["Agra"],                         "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081},
    # Rajasthan
    {"canonical": "Jaipur",       "variants": ["Jaipur"],                       "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873},
    # Goa
    {"canonical": "Panaji",       "variants": ["North Goa", "South Goa", "Goa", "Panaji"], "state": "Goa", "lat": 15.5523, "lon": 73.9175},
    # Odisha
    {"canonical": "Bhubaneswar",  "variants": ["Khorda", "Bhubaneswar"],        "state": "Odisha", "lat": 20.2961, "lon": 85.8245},
    # Punjab
    {"canonical": "Chandigarh",   "variants": ["Chandigarh"],                   "state": "Punjab", "lat": 30.7333, "lon": 76.7794},
    # Kerala
    {"canonical": "Kochi",        "variants": ["Kochi", "Cochin", "Ernakulam"], "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    # Andhra Pradesh
    {"canonical": "Visakhapatnam","variants": ["Visakhapatnam", "Vizag"],       "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185},
]

# Build variant → city_entry lookup
_VARIANT_MAP: dict[str, dict] = {}
for _entry in CITY_DB:
    for _v in _entry["variants"]:
        _VARIANT_MAP[_v.strip().lower()] = _entry


def lookup_city(name: str) -> dict | None:
    return _VARIANT_MAP.get(name.strip().lower())


# ── DDL ──────────────────────────────────────────────────────────────────────

CREATE_WEATHER_TABLE = """
CREATE TABLE IF NOT EXISTS gold.fct_city_weather_day (
    date              Date,
    city              String,
    state             String,
    latitude          Float32,
    longitude         Float32,
    rainfall_mm       Float32,
    rain_probability  Float32,
    humidity_max      Float32,
    temperature_max   Float32,
    temperature_min   Float32,
    weather_code      Int32,
    forecast_1d_rain  Float32,
    forecast_3d_rain  Float32,
    forecast_7d_rain  Float32,
    weather_stage     String,
    fetched_at        DateTime
) ENGINE = ReplacingMergeTree()
ORDER BY (date, city)
"""

# ── Weather stage logic ───────────────────────────────────────────────────────

def compute_weather_stage(
    rain_mm: float,
    rain_prob: float,
    prev_rain_mm: float,
    humidity: float,
    temp_max: float,
) -> str:
    if rain_mm > 10:
        return "RAIN_ACTIVE"
    if rain_mm > 2 or rain_prob > 60:
        return "RAIN_EMERGING"
    if prev_rain_mm > 5 and rain_mm <= 2:
        return "RAIN_DECLINING"
    if humidity > 80:
        return "HUMIDITY_HIGH"
    if temp_max > 38:
        return "HEAT_HIGH"
    if temp_max < 15:
        return "COLD_HIGH"
    return "DRY"


# ── Open-Meteo fetch ──────────────────────────────────────────────────────────

def fetch_open_meteo(lat: float, lon: float, past_days: int = 7, forecast_days: int = 7) -> dict:
    params = {
        "latitude":      lat,
        "longitude":     lon,
        "daily": ",".join([
            "precipitation_sum",
            "precipitation_probability_max",
            "temperature_2m_max",
            "temperature_2m_min",
            "weathercode",
            "rain_sum",
        ]),
        "hourly":        "relative_humidity_2m",
        "past_days":     past_days,
        "forecast_days": forecast_days,
        "timezone":      "Asia/Kolkata",
    }
    resp = requests.get(OPEN_METEO_URL, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()


def parse_city_weather(data: dict, city_entry: dict, fetched_at: datetime) -> list[dict]:
    """Parse Open-Meteo response into per-day records."""
    daily    = data.get("daily", {})
    hourly   = data.get("hourly", {})
    dates    = daily.get("time", [])

    precip   = daily.get("precipitation_sum", [])
    prob     = daily.get("precipitation_probability_max", [])
    temp_max = daily.get("temperature_2m_max", [])
    temp_min = daily.get("temperature_2m_min", [])
    wcode    = daily.get("weathercode", [])
    rain_sum = daily.get("rain_sum", [])

    # Daily avg humidity from hourly (24 values per day)
    hum_hourly = hourly.get("relative_humidity_2m", [])
    daily_humidity: list[float] = []
    for i in range(len(dates)):
        chunk = hum_hourly[i * 24: (i + 1) * 24]
        daily_humidity.append(max(chunk) if chunk else 0.0)

    def _f(lst: list, i: int, default: float = 0.0) -> float:
        try:
            v = lst[i]
            return float(v) if v is not None else default
        except (IndexError, TypeError):
            return default

    records = []
    for i, d in enumerate(dates):
        rain_mm   = _f(precip, i)
        rain_p    = _f(prob, i)
        prev_rain = _f(precip, i - 1) if i > 0 else 0.0
        humidity  = _f(daily_humidity, i)
        tmax      = _f(temp_max, i, 30.0)
        tmin      = _f(temp_min, i, 20.0)

        stage = compute_weather_stage(rain_mm, rain_p, prev_rain, humidity, tmax)

        # Forecast rain sums: D+1, D+3, D+7 relative to this row
        f1 = _f(precip, i + 1)
        f3 = sum(_f(precip, i + k) for k in range(1, 4))
        f7 = sum(_f(precip, i + k) for k in range(1, 8))

        records.append({
            "date":             d,
            "city":             city_entry["canonical"],
            "state":            city_entry["state"],
            "latitude":         city_entry["lat"],
            "longitude":        city_entry["lon"],
            "rainfall_mm":      round(rain_mm, 2),
            "rain_probability": round(rain_p, 1),
            "humidity_max":     round(humidity, 1),
            "temperature_max":  round(tmax, 1),
            "temperature_min":  round(tmin, 1),
            "weather_code":     int(_f(wcode, i, 0)),
            "forecast_1d_rain": round(f1, 2),
            "forecast_3d_rain": round(f3, 2),
            "forecast_7d_rain": round(f7, 2),
            "weather_stage":    stage,
            "fetched_at":       fetched_at.strftime("%Y-%m-%d %H:%M:%S"),
        })
    return records


# ── ClickHouse helpers ────────────────────────────────────────────────────────

def _ch_url() -> str:
    return f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"


def execute_ddl(sql: str) -> None:
    resp = requests.post(_ch_url(), data=sql.encode(), auth=(CH_USER, CH_PASS), timeout=60)
    resp.raise_for_status()


def insert_rows(records: list[dict]) -> None:
    ndjson = "\n".join(json.dumps(r) for r in records)
    resp = requests.post(
        f"{_ch_url()}&query=INSERT+INTO+gold.fct_city_weather_day+FORMAT+JSONEachRow",
        data=ndjson.encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=60,
    )
    resp.raise_for_status()


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest weather data for Indian cities → gold.fct_city_weather_day")
    parser.add_argument("--past-days",     type=int, default=7,  help="Days of historical data to fetch (default 7)")
    parser.add_argument("--forecast-days", type=int, default=7,  help="Days of forecast to fetch (default 7)")
    parser.add_argument("--cities",        nargs="*", default=None, help="Limit to specific city canonical names")
    parser.add_argument("--dry-run",       action="store_true",  help="Fetch and parse but don't write to ClickHouse")
    args = parser.parse_args()

    cities_to_fetch = CITY_DB
    if args.cities:
        cities_to_fetch = [c for c in CITY_DB if c["canonical"] in args.cities]
        if not cities_to_fetch:
            print(f"[warn] No matching cities for: {args.cities}")
            return 1

    fetched_at = datetime.now(tz=timezone.utc).replace(tzinfo=None)

    if not args.dry_run:
        print("[ddl] Ensuring fct_city_weather_day exists ...")
        execute_ddl(CREATE_WEATHER_TABLE)

    all_records: list[dict] = []
    errors: list[str] = []

    for entry in cities_to_fetch:
        city = entry["canonical"]
        try:
            data = fetch_open_meteo(entry["lat"], entry["lon"], args.past_days, args.forecast_days)
            records = parse_city_weather(data, entry, fetched_at)
            all_records.extend(records)
            today_rec = next((r for r in records if r["date"] == str(date.today())), None)
            stage = today_rec["weather_stage"] if today_rec else "?"
            rain  = today_rec["rainfall_mm"] if today_rec else 0
            print(f"  {city:<20} {len(records):>3} days  today: {stage:<18} rain={rain:.1f}mm")
            time.sleep(0.15)  # respect Open-Meteo rate limit (10 req/s)
        except Exception as e:
            errors.append(f"{city}: {e}")
            print(f"  {city:<20} ERROR: {e}")

    print(f"\n[parse] {len(all_records):,} total records across {len(cities_to_fetch)} cities")

    if errors:
        print(f"[warn]  {len(errors)} cities failed: {', '.join(e.split(':')[0] for e in errors)}")

    if args.dry_run:
        print("[dry-run] Sample (today's stage per city):")
        today = str(date.today())
        for r in all_records:
            if r["date"] == today:
                print(f"  {r['city']:<20} {r['weather_stage']:<18} rain={r['rainfall_mm']}mm  prob={r['rain_probability']}%  hum={r['humidity_max']}%  tmax={r['temperature_max']}C")
        print("[dry-run] No data written.")
        return 0

    print(f"[insert] Writing {len(all_records):,} rows to gold.fct_city_weather_day ...")
    insert_rows(all_records)
    print(f"[done]  {len(all_records):,} rows written.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
