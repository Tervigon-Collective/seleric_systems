"""
build_geo_opportunity_mart.py
─────────────────────────────
Scores every (city × product × campaign) combination and writes the result to
gold.mart_geo_product_opportunity (ReplacingMergeTree — idempotent on re-run).

Data sources (all direct ClickHouse SQL against gold.*):
  mart_city_product_sales         — sales velocity per city + product
  mart_city_campaign_attributed   — attributed ROAS per city + campaign + product
  dim_th_sku_seasonal_map         — season, stock_status per product_name
  dim_adset_geo                   — Broad Advantage flag + included_cities per adset

Rules are loaded from config/geo_campaign_rules.yaml (no code change needed to
tweak thresholds).

Usage
─────
  python backend/scripts/build_geo_opportunity_mart.py
  python backend/scripts/build_geo_opportunity_mart.py --date 2026-06-23
  python backend/scripts/build_geo_opportunity_mart.py --dry-run
  python backend/scripts/build_geo_opportunity_mart.py --date 2026-06-23 --dry-run
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import requests
import yaml

# ── ClickHouse connection (same pattern as build_pnl_workbook.py) ────────────

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB   = os.environ.get("CLICKHOUSE_DATABASE", "gold")

REPO_ROOT   = Path(__file__).resolve().parents[2]
CONFIG_PATH = REPO_ROOT / "config" / "geo_campaign_rules.yaml"

# Maps mart/order city name variants → canonical weather city keys stored in fct_city_weather_day
WEATHER_CITY_VARIANTS: dict[str, str] = {
    "mumbai suburban": "Mumbai", "mumbai subueban": "Mumbai",
    "navi mumbai": "Mumbai", "thane": "Mumbai",
    "bengaluru": "Bangalore", "bengaluru urban": "Bangalore", "bangalore urban": "Bangalore",
    "gurugram": "Gurgaon",
    "noida": "Delhi", "ghaziabad": "Delhi", "faridabad": "Delhi", "new delhi": "Delhi",
    "secunderabad": "Hyderabad",
    "howrah": "Kolkata", "north 24 parganas": "Kolkata",
    "vadodara": "Vadodara",
}


def _ch_url() -> str:
    return f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"


def run_query(sql: str) -> pd.DataFrame:
    resp = requests.post(
        _ch_url(),
        data=(sql + "\nFORMAT TSVWithNames").encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=120,
    )
    resp.raise_for_status()
    return pd.read_csv(
        io.StringIO(resp.text),
        sep="\t",
        low_memory=False,
        na_values=["\\N"],
        keep_default_na=True,
    )


def execute_ddl(sql: str) -> None:
    resp = requests.post(
        _ch_url(),
        data=sql.encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=60,
    )
    resp.raise_for_status()


def insert_rows(df: pd.DataFrame, table: str) -> None:
    """Bulk-insert a DataFrame into ClickHouse via JSONEachRow."""
    records = df.to_dict(orient="records")
    ndjson  = "\n".join(json.dumps(r, default=str) for r in records)
    resp = requests.post(
        f"{_ch_url()}&query=INSERT+INTO+{table}+FORMAT+JSONEachRow",
        data=ndjson.encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=120,
    )
    resp.raise_for_status()


# ── Config loader ────────────────────────────────────────────────────────────

def load_config() -> dict:
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)


# ── DDL ──────────────────────────────────────────────────────────────────────

CREATE_MART = """
CREATE TABLE IF NOT EXISTS gold.mart_geo_product_opportunity (
    report_date          Date,
    brand_id             Int32,
    city                 String,
    state                String,
    season               String,
    product_name         String,
    campaign_id          String,
    campaign_name        String,
    adset_id             String,
    adset_name           String,
    orders_7d            Int32,
    attributed_revenue   Float32,
    effective_city_spend Float32,
    roas                 Float32,
    sales_velocity_score Float32,
    campaign_roas_score  Float32,
    season_match_score   Float32,
    inventory_score      Float32,
    broad_discovery_flag UInt8,
    weather_stage        String,
    weather_score        Float32,
    opportunity_score    Float32,
    recommended_action   String,
    budget_modifier      Float32,
    reason               String
) ENGINE = ReplacingMergeTree()
ORDER BY (report_date, brand_id, city, product_name, campaign_id)
"""

# Idempotent migrations for existing tables that predate Phase 2
ALTER_MART_ADD_WEATHER = [
    "ALTER TABLE gold.mart_geo_product_opportunity ADD COLUMN IF NOT EXISTS weather_stage String DEFAULT ''",
    "ALTER TABLE gold.mart_geo_product_opportunity ADD COLUMN IF NOT EXISTS weather_score Float32 DEFAULT 0",
]


# ── Data fetch ───────────────────────────────────────────────────────────────

def fetch_sales_velocity(brand_id: int, report_date: date, lookback_v: int, lookback_b: int) -> pd.DataFrame:
    """7-day and 30-day order totals per (city, product_name).
    Uses sumIf on the pre-aggregated orders column — avoids nested-aggregation issue."""
    d7_start  = report_date - timedelta(days=lookback_v)
    d30_start = report_date - timedelta(days=lookback_b)
    sql = f"""
    SELECT
        city,
        any(state) AS state,
        product_name,
        sumIf(orders, order_date >= '{d7_start}'  AND order_date <= '{report_date}') AS orders_7d,
        sumIf(orders, order_date >= '{d30_start}' AND order_date <= '{report_date}') AS orders_30d
    FROM gold.mart_city_product_sales
    WHERE brand_id = {brand_id}
      AND order_date >= '{d30_start}'
      AND order_date <= '{report_date}'
      AND city IS NOT NULL AND city != ''
    GROUP BY city, product_name
    HAVING orders_7d > 0
    """
    return run_query(sql)


def fetch_campaign_perf(brand_id: int, report_date: date, lookback_v: int) -> pd.DataFrame:
    """Raw per-day rows from mart_city_campaign_attributed for the 7-day window.
    We fetch without outer aggregation because effective_city_spend is itself an
    aggregate expression in the view — re-aggregating it causes ILLEGAL_AGGREGATION
    in ClickHouse. Python aggregates across order_date instead."""
    d7_start = report_date - timedelta(days=lookback_v)
    sql = f"""
    SELECT
        order_date,
        city,
        state,
        product_name,
        campaign_id,
        campaign_name,
        adset_id,
        adset_name,
        attributed_orders,
        attributed_revenue,
        effective_city_spend
    FROM gold.mart_city_campaign_attributed
    WHERE brand_id = {brand_id}
      AND order_date >= '{d7_start}'
      AND order_date <= '{report_date}'
      AND city IS NOT NULL AND city != ''
      AND attributed_orders > 0
    """
    df = run_query(sql)
    if df.empty:
        return df
    # Aggregate across order_date in Python (avoids ClickHouse nested-aggregation error)
    df["attributed_orders"]    = pd.to_numeric(df["attributed_orders"],    errors="coerce").fillna(0)
    df["attributed_revenue"]   = pd.to_numeric(df["attributed_revenue"],   errors="coerce").fillna(0)
    df["effective_city_spend"] = pd.to_numeric(df["effective_city_spend"], errors="coerce").fillna(0)
    agg = (
        df.groupby(
            ["city", "state", "product_name", "campaign_id", "campaign_name", "adset_id", "adset_name"],
            as_index=False,
        ).agg(
            attributed_orders    = ("attributed_orders",    "sum"),
            attributed_revenue   = ("attributed_revenue",   "sum"),
            effective_city_spend = ("effective_city_spend", "sum"),
        )
    )
    agg["roas"] = agg.apply(
        lambda r: r["attributed_revenue"] / r["effective_city_spend"]
        if r["effective_city_spend"] > 0 else 0.0,
        axis=1,
    )
    return agg[agg["attributed_orders"] > 0].reset_index(drop=True)


def resolve_canonical_name(full_title: str, canonical_names: list[str]) -> str:
    """Map a full Shopify product title to the canonical short name in dim_th_sku_seasonal_map.
    Tries prefix match first, then substring match. Falls back to the original title."""
    if not full_title:
        return full_title
    best = ""
    for name in canonical_names:
        if full_title.startswith(name) and len(name) > len(best):
            best = name
    if not best:
        for name in canonical_names:
            if name in full_title and len(name) > len(best):
                best = name
    return best if best else full_title


def fetch_season_map(brand_id_unused: int) -> pd.DataFrame:
    """Product → primary_season, stock_status (deduplicated to product level)."""
    sql = """
    SELECT
        product_name,
        any(season)        AS primary_season,
        any(stock_status)  AS stock_status
    FROM gold.dim_th_sku_seasonal_map
    WHERE product_name != ''
    GROUP BY product_name
    """
    return run_query(sql)


def fetch_adset_geo() -> pd.DataFrame:
    """is_broad_advantage + included_cities per adset (latest parsed snapshot)."""
    sql = """
    SELECT
        adset_id,
        any(is_broad_advantage)  AS is_broad_advantage,
        any(included_cities)     AS included_cities_raw
    FROM gold.dim_adset_geo
    GROUP BY adset_id
    """
    return run_query(sql)


def _weather_city_key(city: str) -> str:
    """Normalise a mart city name to the canonical key used in fct_city_weather_day."""
    low = city.strip().lower()
    return WEATHER_CITY_VARIANTS.get(low, city.strip().title())


def fetch_weather(report_date: date) -> dict[str, str]:
    """Return {canonical_city: weather_stage} for report_date (falls back to yesterday)."""
    for d in [report_date, report_date - timedelta(days=1)]:
        sql = f"""
        SELECT city, weather_stage
        FROM gold.fct_city_weather_day
        WHERE date = '{d}'
          AND city != ''
        """
        df = run_query(sql)
        if not df.empty:
            return dict(zip(df["city"].str.strip(), df["weather_stage"].fillna("UNKNOWN")))
    return {}


# ── Scoring helpers ───────────────────────────────────────────────────────────

def _norm(value: float, cap: float) -> float:
    """Normalise 0..cap → 0..100."""
    if cap <= 0:
        return 0.0
    return min(float(value) / cap, 1.0) * 100.0


def score_row(
    row: dict,
    season_map: dict,           # product_name → {primary_season, stock_status}
    adset_geo: dict,            # adset_id → {is_broad, included_cities: set}
    weather_lookup: dict,       # canonical_city → weather_stage
    current_season: str,
    cfg: dict,
) -> dict:
    product  = row["product_name"]
    city     = row["city"]
    adset_id = str(row.get("adset_id", ""))

    product_meta = season_map.get(product, {})
    primary_season = product_meta.get("primary_season", "")
    stock_status   = product_meta.get("stock_status", "OK")

    # --- Sales velocity score ---
    orders_7d  = float(row.get("orders_7d", 0))
    orders_30d = float(row.get("orders_30d", 0))
    baseline   = max(orders_30d / (cfg["global"]["lookback_days_baseline"] / cfg["global"]["lookback_days_velocity"]), 1.0)
    velocity_ratio = orders_7d / baseline
    vel_score  = _norm(velocity_ratio, cfg["velocity_norm_cap"])

    # --- Campaign ROAS score ---
    roas       = float(row.get("roas", 0))
    roas_score = _norm(roas, cfg["roas_norm_cap"])

    # --- Season match score ---
    ss = cfg["season_scores"]
    if primary_season == current_season:
        season_score = float(ss["exact_match"])
    elif primary_season in ("All Seasons", "all_seasons"):
        season_score = float(ss["all_seasons"])
    else:
        season_score = float(ss["no_match"])

    # --- Inventory score ---
    block_statuses = [s.upper() for s in cfg["inventory"]["block_statuses"]]
    inventory_score = float(cfg["inventory"]["block_score"]) if stock_status.upper() in block_statuses \
                      else float(cfg["inventory"]["ok_score"])
    inventory_ok = inventory_score > 0

    # --- Broad discovery flag ---
    geo_info = adset_geo.get(adset_id, {})
    is_broad = bool(geo_info.get("is_broad", False))
    included_cities: set = geo_info.get("included_cities", set())
    city_norm = city.strip().lower()
    city_in_explicit = any(c.strip().lower() == city_norm for c in included_cities)
    broad_flag = 1 if (is_broad and not city_in_explicit) else 0
    broad_score = float(cfg["broad_discovery"]["bonus_score"]) if broad_flag else 0.0

    # --- Weather score ---
    weather_city = _weather_city_key(city)
    weather_stage = weather_lookup.get(weather_city, "UNKNOWN")
    ws_map = cfg.get("weather_scores", {})
    weather_score = float(ws_map.get(weather_stage, ws_map.get("UNKNOWN", 20)))

    # --- Composite score ---
    w = cfg["scoring_weights"]
    opportunity_score = round(
        w["sales_velocity"]  * vel_score      +
        w["campaign_roas"]   * roas_score     +
        w["season_match"]    * season_score   +
        w["inventory"]       * inventory_score +
        w["broad_discovery"] * broad_score    +
        w.get("weather", 0)  * weather_score,
        2,
    )

    # --- Decision logic (first match wins) ---
    spend_7d    = float(row.get("effective_city_spend", 0))
    r_scale     = cfg["scale"]
    r_launch    = cfg["launch"]
    r_pause     = cfg["pause"]
    r_switch    = cfg.get("switch_product", {})
    target_roas = float(cfg["global"]["target_roas"])
    min_orders  = int(cfg["global"]["min_orders_signal"])

    signal_orders = max(float(row.get("orders_7d", 0)), float(row.get("attributed_orders", 0)))

    if (
        opportunity_score >= float(r_scale["opportunity_score_gte"])
        and roas >= float(r_scale["campaign_roas_gte"])
        and inventory_ok
        and signal_orders >= min_orders
    ):
        action   = r_scale["label"]
        modifier = float(r_scale["budget_modifier"])
        reason   = (
            f"Opportunity score {opportunity_score:.0f}, ROAS {roas:.2f}x "
            f"(target {target_roas}x), {signal_orders:.0f} orders last 7d, "
            f"stock OK, season={primary_season}, weather={weather_stage}."
        )

    elif (
        r_switch
        and weather_stage == r_switch.get("trigger_weather_stage", "RAIN_DECLINING")
        and product in (r_switch.get("from_products") or [])
    ):
        action   = "SWITCH_PRODUCT"
        modifier = 0.0
        to_list  = ", ".join(r_switch.get("to_products") or [])
        reason   = (
            f"Rain declining in {city} (weather={weather_stage}). "
            f"Shift budget from {product} to: {to_list}."
        )

    elif (
        opportunity_score >= float(r_launch["opportunity_score_gte"])
        and spend_7d == 0
        and inventory_ok
    ):
        action   = r_launch["label"]
        modifier = float(r_launch["budget_modifier"])
        reason   = (
            f"Opportunity score {opportunity_score:.0f}, no recent spend in {city} "
            f"for {product}. Season={primary_season}, weather={weather_stage}, stock OK."
        )

    elif (
        opportunity_score <= float(r_pause["opportunity_score_lte"])
        and roas <= float(r_pause["campaign_roas_lte"])
    ):
        action   = r_pause["label"]
        modifier = float(r_pause["budget_modifier"])
        reason   = (
            f"Opportunity score {opportunity_score:.0f}, ROAS {roas:.2f}x "
            f"below {r_pause['campaign_roas_lte']}x threshold. Weather={weather_stage}."
        )

    else:
        r_hold   = cfg["hold"]
        action   = r_hold["label"]
        modifier = float(r_hold["budget_modifier"])
        reason   = (
            f"Opportunity score {opportunity_score:.0f}, ROAS {roas:.2f}x — "
            f"no decisive signal. Weather={weather_stage}. Maintain current budget."
        )

    return {
        "sales_velocity_score": round(vel_score, 2),
        "campaign_roas_score":  round(roas_score, 2),
        "season_match_score":   round(season_score, 2),
        "inventory_score":      round(inventory_score, 2),
        "broad_discovery_flag": broad_flag,
        "weather_stage":        weather_stage,
        "weather_score":        round(weather_score, 2),
        "opportunity_score":    opportunity_score,
        "recommended_action":   action,
        "budget_modifier":      modifier,
        "reason":               reason,
    }


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Build geo opportunity scoring mart")
    parser.add_argument("--date",     default=str(date.today()), help="Report date (YYYY-MM-DD)")
    parser.add_argument("--dry-run",  action="store_true",       help="Score but don't write to CH")
    parser.add_argument("--brand-id", type=int, default=None,    help="Override brand_id from config")
    args = parser.parse_args()

    cfg        = load_config()
    report_date = date.fromisoformat(args.date)
    brand_id    = args.brand_id or int(cfg["global"]["brand_id"])
    current_season = cfg["global"]["current_season"]
    lv = int(cfg["global"]["lookback_days_velocity"])
    lb = int(cfg["global"]["lookback_days_baseline"])

    print(f"[config] season={current_season}, brand={brand_id}, date={report_date}")

    # ── Fetch ──
    print("[fetch] sales velocity ...")
    df_sales = fetch_sales_velocity(brand_id, report_date, lv, lb)
    print(f"        {len(df_sales):,} city×product rows")

    print("[fetch] campaign performance ...")
    df_camp  = fetch_campaign_perf(brand_id, report_date, lv)
    print(f"        {len(df_camp):,} city×campaign×product rows")

    print("[fetch] season map ...")
    df_season = fetch_season_map(brand_id)
    canonical_names = list(df_season["product_name"].dropna().unique())
    season_map = {
        row["product_name"]: {
            "primary_season": row["primary_season"],
            "stock_status":   str(row["stock_status"]) if pd.notna(row["stock_status"]) else "OK",
        }
        for _, row in df_season.iterrows()
    }
    print(f"        {len(season_map):,} products mapped")

    print("[fetch] adset geo ...")
    df_geo = fetch_adset_geo()
    adset_geo: dict = {}
    for _, row in df_geo.iterrows():
        raw = row.get("included_cities_raw", "[]") or "[]"
        # ClickHouse TSV returns Array as ['a','b'] string — parse it
        try:
            cities = json.loads(raw.replace("'", '"')) if isinstance(raw, str) else list(raw)
        except Exception:
            cities = []
        adset_geo[str(row["adset_id"])] = {
            "is_broad":       bool(int(row.get("is_broad_advantage", 0))),
            "included_cities": set(cities),
        }
    print(f"        {len(adset_geo):,} adsets with geo data")

    print("[fetch] weather ...")
    weather_lookup = fetch_weather(report_date)
    covered = len(weather_lookup)
    print(f"        {covered} cities with weather data for {report_date}")

    # ── Resolve full Shopify titles → canonical short names ──
    # mart views carry full product titles; dim_th_sku_seasonal_map uses short names.
    # Map each full title to the best-matching canonical name via prefix/substring.
    for df_ref in [df_sales, df_camp]:
        df_ref["product_name"] = df_ref["product_name"].apply(
            lambda t: resolve_canonical_name(str(t), canonical_names)
        )

    # ── Join sales velocity into campaign perf ──
    df = df_camp.merge(
        df_sales[["city", "product_name", "orders_7d", "orders_30d"]],
        on=["city", "product_name"],
        how="left",
    )
    df["orders_7d"]  = df["orders_7d"].fillna(0).astype(int)
    df["orders_30d"] = df["orders_30d"].fillna(0).astype(int)
    df["roas"]       = df["roas"].fillna(0.0)

    # ── Score ──
    print(f"[score] Scoring {len(df):,} rows ...")
    scored_rows = []
    for _, row in df.iterrows():
        scores = score_row(row.to_dict(), season_map, adset_geo, weather_lookup, current_season, cfg)
        product_meta = season_map.get(row["product_name"], {})
        scored_rows.append({
            "report_date":          str(report_date),
            "brand_id":             brand_id,
            "city":                 str(row["city"]),
            "state":                str(row.get("state", "")),
            "season":               product_meta.get("primary_season", ""),
            "product_name":         str(row["product_name"]),
            "campaign_id":          str(row.get("campaign_id", "")),
            "campaign_name":        str(row.get("campaign_name", "")),
            "adset_id":             str(row.get("adset_id", "")),
            "adset_name":           str(row.get("adset_name", "")),
            "orders_7d":            int(row["orders_7d"]),
            "attributed_revenue":   round(float(row.get("attributed_revenue", 0)), 2),
            "effective_city_spend": round(float(row.get("effective_city_spend", 0)), 2),
            "roas":                 round(float(row.get("roas", 0)), 4),
            **scores,
        })

    result_df = pd.DataFrame(scored_rows)
    action_counts = result_df["recommended_action"].value_counts().to_dict()
    print(f"[score] Done. Actions: {action_counts}")

    if args.dry_run:
        print("\n[dry-run] Sample output (top 10 by opportunity_score):")
        cols = ["city", "product_name", "campaign_name", "roas",
                "opportunity_score", "recommended_action", "reason"]
        print(result_df.nlargest(10, "opportunity_score")[cols].to_string(index=False))
        print("\n[dry-run] No data written to ClickHouse.")
        return 0

    # ── Create table if needed + apply Phase 2 column migrations ──
    print("[ddl] Ensuring mart_geo_product_opportunity exists ...")
    execute_ddl(CREATE_MART)
    for alter_sql in ALTER_MART_ADD_WEATHER:
        try:
            execute_ddl(alter_sql)
        except Exception as e:
            print(f"[ddl] ALTER skipped (likely already exists): {e}")

    # ── Write ──
    print(f"[insert] Writing {len(result_df):,} rows to gold.mart_geo_product_opportunity ...")
    insert_rows(result_df, "gold.mart_geo_product_opportunity")
    print(f"[done] {len(result_df):,} rows written for {report_date}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
