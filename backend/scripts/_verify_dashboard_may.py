"""Verify the direct-CH dashboard fetcher reproduces the May SQL output.

Re-implements the JS-side logic from
  apps/web/src/lib/dashboard/queries/pnl-clickhouse.ts -> buildCubeRow
in Python and compares each line to the user's reference table.
Throwaway diagnostic; safe to delete.
"""
from __future__ import annotations

import os
import sys
from textwrap import indent

import requests

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB = os.environ.get("CLICKHOUSE_DATABASE", "gold")

EXPECTED = [
    ("Gross sales", 3_891_863.91, 4_592_399.41),
    ("  Cancelled revenue (audit)", 111_014.29, 130_996.80),
    ("  - Discounts", 59_233.97, 69_896.08),
    ("  - Returns", 379_818.06, 448_185.00),
    ("  - Adjustments", 2_710.17, 3_198.00),
    ("= Net sales", 3_450_101.71, 4_071_120.33),
    ("  - Product COGS", 1_069_573.75, 1_069_573.75),
    ("= Gross profit", 2_380_527.96, 3_001_546.58),
    ("    Meta ad spend", 1_735_501.79, 1_735_501.79),
    ("    Google ad spend", 522_445.17, 522_445.17),
    ("  - Total ad spend", 2_258_648.35, 2_258_648.35),
    ("  - Shipping cost", 275_418.00, 275_418.00),
    ("  - Packaging cost", 21_140.00, 21_140.00),
    ("  - Gateway fees", 104_969.68, 104_969.68),
    ("  - RTO logistics", 22_113.00, 22_113.00),
    ("= Net profit", -301_761.06, 319_257.56),
]

TAX_RATE = 0.18

SQL = """
SELECT
  toFloat64(sum(gross_sales_excl_tax))                AS gross_sales,
  toFloat64(sum(total_discounts_excl_tax))            AS discounts,
  toFloat64(sum(notes_return_refund_excl_gst))        AS returns_excl,
  toFloat64(sum(notes_return_refund_incl_gst))        AS returns_incl,
  toFloat64(sum(notes_adjustment_refund_excl_gst))    AS adjustments_excl,
  toFloat64(sum(notes_adjustment_refund_incl_gst))    AS adjustments_incl,
  toFloat64(sum(notes_cancellation_refund_excl_gst))  AS cancellations_excl,
  toFloat64(sum(notes_cancellation_refund_incl_gst))  AS cancellations_incl,
  toFloat64(sum(product_cost))                        AS product_cost,
  toFloat64(sum(shipping_cost))                       AS shipping_cost,
  toFloat64(sum(packaging_cost))                      AS packaging_cost,
  toFloat64(sum(payment_gateway_fees))                AS gateway_fees,
  toFloat64(sum(rto_cost))                            AS rto_cost,
  toFloat64(sum(meta_spend))                          AS meta_spend,
  toFloat64(sum(google_spend))                        AS google_spend,
  toFloat64(sum(total_ad_spend))                      AS total_ad_spend
FROM gold.fct_daily_pnl
WHERE brand_id = 20
  AND report_date BETWEEN toDate('2026-05-01') AND toDate('2026-05-31')
"""


def fetch_row() -> dict[str, float]:
    url = f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"
    resp = requests.post(
        url,
        data=(SQL.strip() + "\nFORMAT JSONEachRow").encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=120,
    )
    resp.raise_for_status()
    line = next(iter(l for l in resp.text.splitlines() if l.strip()))
    import json
    return {k: float(v) for k, v in json.loads(line).items()}


def main() -> None:
    raw = fetch_row()

    gross_sales = raw["gross_sales"]
    discounts = raw["discounts"]
    returns_excl = raw["returns_excl"]
    adjustments_excl = raw["adjustments_excl"]
    cancellations_excl = raw["cancellations_excl"]
    product_cost = raw["product_cost"]
    shipping_cost = raw["shipping_cost"]
    packaging_cost = raw["packaging_cost"]
    gateway_fees = raw["gateway_fees"]
    rto_cost = raw["rto_cost"]
    meta_spend = raw["meta_spend"]
    google_spend = raw["google_spend"]
    total_ad_spend = raw["total_ad_spend"]

    returns_combined = returns_excl + adjustments_excl
    net_sales_excl = gross_sales - discounts - returns_combined
    gross_profit_excl = net_sales_excl - product_cost
    net_profit_excl = (
        gross_profit_excl - total_ad_spend - shipping_cost - packaging_cost - gateway_fees - rto_cost
    )

    # Incl-GST values: taxable revenue × 1.18; costs unchanged; profit = excl + net_sales_excl × 0.18
    incl_lookup: dict[str, float] = {}
    incl_lookup["Gross sales"] = gross_sales * (1 + TAX_RATE)
    incl_lookup["  Cancelled revenue (audit)"] = cancellations_excl * (1 + TAX_RATE)
    incl_lookup["  - Discounts"] = discounts * (1 + TAX_RATE)
    incl_lookup["  - Returns"] = returns_excl * (1 + TAX_RATE)
    incl_lookup["  - Adjustments"] = adjustments_excl * (1 + TAX_RATE)
    incl_lookup["= Net sales"] = net_sales_excl * (1 + TAX_RATE)
    incl_lookup["  - Product COGS"] = product_cost
    incl_lookup["= Gross profit"] = gross_profit_excl + net_sales_excl * TAX_RATE
    incl_lookup["    Meta ad spend"] = meta_spend
    incl_lookup["    Google ad spend"] = google_spend
    incl_lookup["  - Total ad spend"] = total_ad_spend
    incl_lookup["  - Shipping cost"] = shipping_cost
    incl_lookup["  - Packaging cost"] = packaging_cost
    incl_lookup["  - Gateway fees"] = gateway_fees
    incl_lookup["  - RTO logistics"] = rto_cost
    incl_lookup["= Net profit"] = net_profit_excl + net_sales_excl * TAX_RATE

    excl_lookup: dict[str, float] = {
        "Gross sales": gross_sales,
        "  Cancelled revenue (audit)": cancellations_excl,
        "  - Discounts": discounts,
        "  - Returns": returns_excl,
        "  - Adjustments": adjustments_excl,
        "= Net sales": net_sales_excl,
        "  - Product COGS": product_cost,
        "= Gross profit": gross_profit_excl,
        "    Meta ad spend": meta_spend,
        "    Google ad spend": google_spend,
        "  - Total ad spend": total_ad_spend,
        "  - Shipping cost": shipping_cost,
        "  - Packaging cost": packaging_cost,
        "  - Gateway fees": gateway_fees,
        "  - RTO logistics": rto_cost,
        "= Net profit": net_profit_excl,
    }

    print(f"{'line':<30}  {'excl (dash)':>14}  {'excl (sql)':>14}  {'incl (dash)':>14}  {'incl (sql)':>14}  status")
    print("-" * 100)
    all_ok = True
    for label, exp_excl, exp_incl in EXPECTED:
        got_excl = excl_lookup[label]
        got_incl = incl_lookup[label]
        ok_excl = abs(got_excl - exp_excl) <= 0.5
        ok_incl = abs(got_incl - exp_incl) <= 0.5
        status = "MATCH" if (ok_excl and ok_incl) else "CHECK"
        if not (ok_excl and ok_incl):
            all_ok = False
        print(
            f"{label:<30}  {got_excl:>14,.2f}  {exp_excl:>14,.2f}  {got_incl:>14,.2f}  {exp_incl:>14,.2f}  {status}"
        )

    print()
    print("OVERALL:", "ALL MATCH" if all_ok else "DISCREPANCIES FOUND")
    if not all_ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
