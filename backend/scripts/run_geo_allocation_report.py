"""
run_geo_allocation_report.py
────────────────────────────
Reads gold.mart_geo_product_opportunity for a given date and produces:
  1. JSON report  — spec section 12 format
  2. CSV          — flat file for spreadsheet hand-off
  3. Terminal table — human-readable summary

Run build_geo_opportunity_mart.py first to populate the mart for the target date.

Usage
─────
  python backend/scripts/run_geo_allocation_report.py
  python backend/scripts/run_geo_allocation_report.py --date 2026-06-23
  python backend/scripts/run_geo_allocation_report.py --date 2026-06-23 --out-dir /tmp/reports
  python backend/scripts/run_geo_allocation_report.py --date 2026-06-23 --no-csv
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sys
from datetime import date
from pathlib import Path

import pandas as pd
import requests

# ── ClickHouse connection ─────────────────────────────────────────────────────

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB   = os.environ.get("CLICKHOUSE_DATABASE", "gold")

ACTION_ORDER = ["SCALE", "LAUNCH", "PAUSE", "HOLD"]
ACTION_LABEL = {"SCALE": "[UP]", "LAUNCH": "[NEW]", "PAUSE": "[DOWN]", "HOLD": "[--]"}


def run_query(sql: str) -> pd.DataFrame:
    url  = f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"
    resp = requests.post(
        url,
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


# ── Fetch mart ────────────────────────────────────────────────────────────────

def fetch_mart(report_date: date, brand_id: int) -> pd.DataFrame:
    sql = f"""
    SELECT *
    FROM gold.mart_geo_product_opportunity
    WHERE report_date = '{report_date}'
      AND brand_id = {brand_id}
    ORDER BY opportunity_score DESC
    """
    return run_query(sql)


# ── Report builder ────────────────────────────────────────────────────────────

def build_report(df: pd.DataFrame, report_date: date) -> dict:
    """Build the JSON report structure."""
    summary: dict[str, int] = {}
    for action in ACTION_ORDER:
        summary[action.lower()] = int((df["recommended_action"] == action).sum())

    actions = []
    for _, row in df.iterrows():
        action = str(row["recommended_action"])
        if action == "HOLD":
            continue  # omit HOLDs from JSON actions list (too noisy)
        actions.append({
            "city":            str(row["city"]),
            "state":           str(row.get("state", "")),
            "product":         str(row["product_name"]),
            "campaign":        str(row.get("campaign_name", "")),
            "campaign_id":     str(row.get("campaign_id", "")),
            "adset_id":        str(row.get("adset_id", "")),
            "action":          action,
            "budget_modifier": float(row.get("budget_modifier", 1.0)),
            "roas":            round(float(row.get("roas", 0)), 2),
            "opportunity_score": round(float(row.get("opportunity_score", 0)), 1),
            "broad_discovery": bool(int(row.get("broad_discovery_flag", 0))),
            "reason":          str(row.get("reason", "")),
        })

    # Broad Advantage discoveries — cities found by Broad that weren't explicitly targeted
    broad = df[df["broad_discovery_flag"] == 1][
        ["city", "product_name", "campaign_name", "roas", "opportunity_score", "recommended_action"]
    ].drop_duplicates(subset=["city", "product_name"]).nlargest(20, "opportunity_score")
    broad_list = broad.rename(columns={"product_name": "product", "campaign_name": "campaign",
                                       "recommended_action": "suggested_action"}).to_dict(orient="records")

    return {
        "date":    str(report_date),
        "summary": summary,
        "actions": actions,
        "broad_advantage_discoveries": broad_list,
    }


# ── Terminal output ───────────────────────────────────────────────────────────

def print_terminal_report(df: pd.DataFrame, report_date: date) -> None:
    SEP = "=" * 120
    DIV = "-" * 120
    print(f"\n{SEP}")
    print(f"  Daily Seasonal Geo-Campaign Allocation Report  |  {report_date}")
    print(f"{SEP}\n")

    # Summary
    for action in ACTION_ORDER:
        count = int((df["recommended_action"] == action).sum())
        label = ACTION_LABEL[action]
        print(f"  {label:<7}  {action:<8} {count:>4} campaigns")
    print()

    # Sections
    for action in ["SCALE", "LAUNCH", "PAUSE"]:
        subset = df[df["recommended_action"] == action].head(20)
        if subset.empty:
            continue
        total = int((df["recommended_action"] == action).sum())
        label = ACTION_LABEL[action]
        print(f"\n{DIV}")
        print(f"  {label}  {action}  ({total} total)")
        print(f"{DIV}")
        print(f"  {'City':<22} {'Product':<28} {'Campaign':<35} {'ROAS':>7} {'Score':>6}  Reason")
        print(f"  {'-'*22} {'-'*28} {'-'*35} {'-'*7} {'-'*6}  {'-'*30}")
        for _, row in subset.iterrows():
            city     = str(row["city"])[:22]
            product  = str(row["product_name"])[:28]
            campaign = str(row.get("campaign_name", ""))[:35]
            roas     = f"{float(row.get('roas', 0)):.2f}x"
            score    = f"{float(row.get('opportunity_score', 0)):.0f}"
            reason   = str(row.get("reason", ""))[:60]
            print(f"  {city:<22} {product:<28} {campaign:<35} {roas:>7} {score:>6}  {reason}")

    # Broad Advantage discoveries
    broad = df[df["broad_discovery_flag"] == 1].drop_duplicates(subset=["city", "product_name"])
    if not broad.empty:
        print(f"\n{DIV}")
        print(f"  [BROAD]  BROAD ADVANTAGE DISCOVERIES ({len(broad)} city x product pairs)")
        print(f"{DIV}")
        print(f"  {'City':<22} {'Product':<28} {'Campaign':<35} {'ROAS':>7}  Action")
        print(f"  {'-'*22} {'-'*28} {'-'*35} {'-'*7}  {'-'*10}")
        for _, row in broad.head(20).iterrows():
            city     = str(row["city"])[:22]
            product  = str(row["product_name"])[:28]
            campaign = str(row.get("campaign_name", ""))[:35]
            roas     = f"{float(row.get('roas', 0)):.2f}x"
            action   = str(row.get("recommended_action", ""))
            print(f"  {city:<22} {product:<28} {campaign:<35} {roas:>7}  {action}")

    print(f"\n{SEP}\n")


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Daily Geo-Campaign Allocation Report")
    parser.add_argument("--date",     default=str(date.today()), help="Report date (YYYY-MM-DD)")
    parser.add_argument("--brand-id", type=int, default=20,      help="Brand ID (default 20)")
    parser.add_argument("--out-dir",  default=None,              help="Output directory for JSON + CSV")
    parser.add_argument("--no-csv",   action="store_true",       help="Skip CSV output")
    parser.add_argument("--no-json",  action="store_true",       help="Skip JSON output")
    args = parser.parse_args()

    report_date = date.fromisoformat(args.date)
    out_dir     = Path(args.out_dir) if args.out_dir else Path(__file__).parent / "reports"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"[fetch] Loading mart for {report_date}, brand {args.brand_id} ...")
    df = fetch_mart(report_date, args.brand_id)

    if df.empty:
        print(f"[warn] No rows found in mart_geo_product_opportunity for {report_date}.")
        print("       Run build_geo_opportunity_mart.py --date {report_date} first.")
        return 1

    print(f"[ok]   {len(df):,} rows loaded.")

    # Terminal
    print_terminal_report(df, report_date)

    # JSON
    if not args.no_json:
        report = build_report(df, report_date)
        json_path = out_dir / f"geo_allocation_{report_date}.json"
        with open(json_path, "w") as f:
            json.dump(report, f, indent=2, default=str)
        print(f"[json] Written -> {json_path}")

    # CSV
    if not args.no_csv:
        csv_cols = [
            "report_date", "city", "state", "season", "product_name",
            "campaign_name", "adset_name", "orders_7d",
            "attributed_revenue", "effective_city_spend", "roas",
            "opportunity_score", "recommended_action", "budget_modifier",
            "broad_discovery_flag", "reason",
        ]
        available = [c for c in csv_cols if c in df.columns]
        csv_path = out_dir / f"geo_allocation_{report_date}.csv"
        df[available].to_csv(csv_path, index=False)
        print(f"[csv]  Written -> {csv_path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
