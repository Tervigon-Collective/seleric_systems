"""
setup_weather_lag_view.py
─────────────────────────
Creates gold.mart_city_weather_sales_lag — a ClickHouse view that joins
fct_city_weather_day with mart_city_product_sales at D-3..D+3 offsets.

Enables lead/lag queries like:
  SELECT weather_stage, day_offset, avg(orders)
  FROM gold.mart_city_weather_sales_lag
  GROUP BY weather_stage, day_offset
  ORDER BY weather_stage, day_offset

Usage
─────
  py backend/scripts/setup_weather_lag_view.py           # create view + verify
  py backend/scripts/setup_weather_lag_view.py --sample  # print lead/lag table
"""

from __future__ import annotations

import argparse
import io
import os
import sys

import pandas as pd
import requests

# ── ClickHouse connection ─────────────────────────────────────────────────────

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB   = os.environ.get("CLICKHOUSE_DATABASE", "gold")


def _url() -> str:
    return f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"


def run_ddl(sql: str) -> None:
    resp = requests.post(_url(), data=sql.encode("utf-8"), auth=(CH_USER, CH_PASS), timeout=120)
    resp.raise_for_status()


def run_query(sql: str) -> pd.DataFrame:
    resp = requests.post(
        _url(),
        data=(sql + "\nFORMAT TSVWithNames").encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=120,
    )
    resp.raise_for_status()
    return pd.read_csv(io.StringIO(resp.text), sep="\t", low_memory=False, na_values=["\\N"])


# ── View DDL ──────────────────────────────────────────────────────────────────

# City normalization: mart ship_city variants → canonical weather city names.
# Handled in SQL via lower(trim()) equality — covers case mismatches (MUMBAI → mumbai).
# Common city-area variants (Thane, Navi Mumbai) are excluded; analysts should
# cross-reference with mart_geo_product_opportunity for those.

CREATE_LAG_VIEW = """
CREATE OR REPLACE VIEW gold.mart_city_weather_sales_lag AS
SELECT
    w.date                                              AS weather_date,
    w.city                                              AS weather_city,
    w.weather_stage,
    w.rainfall_mm,
    w.rain_probability,
    w.humidity_max,
    w.temperature_max,
    w.forecast_1d_rain,
    w.forecast_3d_rain,
    s.product_name,
    s.order_date,
    dateDiff('day', w.date, s.order_date)               AS day_offset,
    s.orders,
    s.net_revenue
FROM gold.fct_city_weather_day AS w
INNER JOIN gold.mart_city_product_sales AS s
    ON lower(trim(s.city)) = lower(trim(w.city))
WHERE s.brand_id = 20
  AND s.city    != ''
  AND w.weather_stage != ''
  AND s.order_date >= addDays(w.date, -3)
  AND s.order_date <= addDays(w.date, 3)
"""


SAMPLE_QUERY = """
SELECT
    weather_stage,
    day_offset,
    count()               AS event_city_product_days,
    round(avg(orders), 2) AS avg_orders,
    round(avg(net_revenue), 0) AS avg_revenue
FROM gold.mart_city_weather_sales_lag
WHERE weather_stage IN ('RAIN_ACTIVE', 'RAIN_EMERGING', 'RAIN_DECLINING', 'HUMIDITY_HIGH', 'DRY')
GROUP BY weather_stage, day_offset
ORDER BY weather_stage, day_offset
"""

COVERAGE_QUERY = """
SELECT
    weather_stage,
    count()                                AS total_rows,
    countDistinct(weather_city)            AS cities,
    countDistinct(product_name)            AS products,
    min(weather_date)                      AS earliest_weather,
    max(weather_date)                      AS latest_weather
FROM gold.mart_city_weather_sales_lag
GROUP BY weather_stage
ORDER BY total_rows DESC
"""


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Create weather lead/lag view")
    parser.add_argument("--sample", action="store_true", help="Print lead/lag summary table")
    args = parser.parse_args()

    print("[ddl] Creating gold.mart_city_weather_sales_lag ...")
    run_ddl(CREATE_LAG_VIEW)
    print("[ok]  View created.")

    print("[verify] Coverage by weather stage ...")
    cov = run_query(COVERAGE_QUERY)
    if cov.empty:
        print("[warn] No rows in lag view — check that fct_city_weather_day and")
        print("       mart_city_product_sales have overlapping city names and date ranges.")
        return 1

    print(f"\n  {'Stage':<20} {'Rows':>8} {'Cities':>7} {'Products':>9}  Date range")
    print(f"  {'-'*20} {'-'*8} {'-'*7} {'-'*9}  {'-'*25}")
    for _, row in cov.iterrows():
        print(
            f"  {str(row['weather_stage']):<20} "
            f"{int(row['total_rows']):>8,} "
            f"{int(row['cities']):>7} "
            f"{int(row['products']):>9}  "
            f"{row['earliest_weather']} .. {row['latest_weather']}"
        )

    if args.sample:
        print("\n[sample] Lead/lag: avg orders by weather stage x day offset ...")
        df = run_query(SAMPLE_QUERY)
        if df.empty:
            print("[warn] No rows returned.")
            return 1
        print(f"\n  {'Stage':<20} {'D':>4}  {'Events':>8}  {'Avg Orders':>10}  {'Avg Revenue':>12}")
        print(f"  {'-'*20} {'-'*4}  {'-'*8}  {'-'*10}  {'-'*12}")
        prev_stage = None
        for _, row in df.iterrows():
            stage = str(row["weather_stage"])
            if stage != prev_stage and prev_stage is not None:
                print()
            prev_stage = stage
            offset = int(row["day_offset"])
            offset_str = f"D+{offset}" if offset > 0 else (f"D{offset}" if offset < 0 else "D0")
            print(
                f"  {stage:<20} {offset_str:>4}  "
                f"{int(row['event_city_product_days']):>8,}  "
                f"{float(row['avg_orders']):>10.2f}  "
                f"{float(row['avg_revenue']):>12,.0f}"
            )

    print("\n[done]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
