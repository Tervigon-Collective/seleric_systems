"""
Builds an Excel workbook with two sheets covering the last 365 days for ALL
products in brand 20:

  Sheet 1 "Daily P&L" — one row per (product, date) with revenue, cost stack,
                       Meta spend, net profit, and a PROFIT/LOSS/BREAKEVEN flag.
  Sheet 2 "Product Summary" — one row per product with current cost stack and
                       the *desirable vendor cost per unit* required to hit
                       break-even and 10% / 20% / 30% net margin targets
                       (formulas from docs/cogs_simulation_calculation.md).

Match rules (mirror the in-app COGS simulator):
  - Each SKU groups under its "TH-XXX" numeric prefix (e.g. TH-348).
  - Each Meta campaign name is matched on the same TH-XXX prefix.
  - Variants of a prefix roll up into a single product row.

Output: scripts/products_pnl_last_365d.xlsx
"""

from __future__ import annotations

import io
import os
import sys
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import requests

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB = os.environ.get("CLICKHOUSE_DATABASE", "gold")
BRAND_ID = int(os.environ.get("BRAND_ID", "20"))

TAX_RATE = 0.18  # GST_INCL = true, tax_rate = 18%
MARGIN_TARGETS = [0.0, 0.10, 0.20, 0.30]  # BE + 10/20/30% net margin
SHIP_EXTRA_PER_UNIT = 0.0  # default in the simulator (outbound courier above inbound)

OUT_PATH = Path(__file__).parent / "products_pnl_last_365d.xlsx"

DATE_TO = date.today()
DATE_FROM = DATE_TO - timedelta(days=365)


def run_query(sql: str) -> pd.DataFrame:
    """Run a ClickHouse query and return the result as a DataFrame.

    ClickHouse writes NULL as the literal token ``\\N`` in TSV, which pandas
    would otherwise read as the string ``\\N``. We translate that to NaN.
    """
    url = f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"
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


DAILY_SQL = f"""
WITH
  orders_raw AS (
    SELECT
      order_date,
      assumeNotNull(sku)                                              AS sku,
      product_title,
      quantity, total_price, total_cost,
      placed_shipping_cost, placed_packaging_cost, placed_gateway_fee,
      coalesce(rto_cost, toDecimal64(0, 4))                           AS rto_cost,
      refunded_quantity,
      if(return_status IN ('RETURNED','IN_PROGRESS'), quantity, 0)    AS returned_units_strict
    FROM gold.fct_order_items
    WHERE brand_id = {BRAND_ID}
      AND order_date BETWEEN '{DATE_FROM.isoformat()}' AND '{DATE_TO.isoformat()}'
      AND sku IS NOT NULL
      AND match(assumeNotNull(sku), '^[A-Z]{{2,3}}-[0-9]{{2,5}}')
  ),
  orders_daily AS (
    SELECT
      order_date,
      extract(sku, '^([A-Z]{{2,3}}-[0-9]{{2,5}})')           AS product_prefix,
      any(if(product_title IS NOT NULL AND product_title != '',
              product_title, NULL))                          AS product_title,
      toInt64(sum(quantity))                                 AS units,
      toInt64(sum(coalesce(returned_units_strict, 0)))       AS returned_units,
      toFloat64(sum(total_price))                            AS gross_revenue_incl_gst,
      toFloat64(sum(total_price) / 1.18)                     AS net_revenue_ex_gst,
      toFloat64(sum(total_cost))                             AS placed_product_cost,
      toFloat64(sum(placed_shipping_cost))                   AS placed_shipping,
      toFloat64(sum(placed_packaging_cost))                  AS placed_packaging,
      toFloat64(sum(placed_gateway_fee))                     AS placed_gateway_fee,
      toFloat64(sum(rto_cost))                               AS rto_cost
    FROM orders_raw
    GROUP BY order_date, product_prefix
    HAVING product_prefix != ''
  ),
  ads_daily AS (
    SELECT
      report_date                                            AS order_date,
      extract(assumeNotNull(campaign_name),
              '([A-Z]{{2,3}}-[0-9]{{2,5}})')                 AS product_prefix,
      toFloat64(sum(coalesce(spend, 0)))                     AS meta_spend,
      toInt64(sum(coalesce(purchases, 0)))                   AS meta_purchases
    FROM gold.fct_meta_ads_daily
    WHERE brand_id = {BRAND_ID}
      AND report_date BETWEEN '{DATE_FROM.isoformat()}' AND '{DATE_TO.isoformat()}'
      AND campaign_name IS NOT NULL
      AND match(assumeNotNull(campaign_name), '([A-Z]{{2,3}}-[0-9]{{2,5}})')
    GROUP BY order_date, product_prefix
    HAVING product_prefix != ''
  ),
  merged_long AS (
    SELECT
      order_date, product_prefix, product_title,
      units, returned_units,
      gross_revenue_incl_gst, net_revenue_ex_gst,
      placed_product_cost, placed_shipping, placed_packaging,
      placed_gateway_fee, rto_cost,
      toFloat64(0) AS meta_spend, toInt64(0) AS meta_purchases
    FROM orders_daily
    UNION ALL
    SELECT
      order_date, product_prefix, ''::String AS product_title,
      toInt64(0)   AS units, toInt64(0) AS returned_units,
      toFloat64(0) AS gross_revenue_incl_gst,
      toFloat64(0) AS net_revenue_ex_gst,
      toFloat64(0) AS placed_product_cost,
      toFloat64(0) AS placed_shipping,
      toFloat64(0) AS placed_packaging,
      toFloat64(0) AS placed_gateway_fee,
      toFloat64(0) AS rto_cost,
      meta_spend, meta_purchases
    FROM ads_daily
  )
SELECT
  order_date,
  product_prefix,
  any(if(product_title IS NOT NULL AND product_title != '',
         product_title, NULL))                              AS product_title,
  sum(units)                                               AS units,
  sum(returned_units)                                      AS returned_units,
  round(sum(gross_revenue_incl_gst), 2)                    AS gross_revenue_incl_gst,
  round(sum(net_revenue_ex_gst), 2)                        AS net_revenue_ex_gst,
  round(sum(placed_product_cost), 2)                       AS placed_product_cost,
  round(sum(placed_shipping), 2)                           AS placed_shipping,
  round(sum(placed_packaging), 2)                          AS placed_packaging,
  round(sum(placed_gateway_fee), 2)                        AS placed_gateway_fee,
  round(sum(rto_cost), 2)                                  AS rto_cost,
  round(sum(meta_spend), 2)                                AS meta_spend,
  sum(meta_purchases)                                      AS meta_purchases
FROM merged_long
GROUP BY order_date, product_prefix
ORDER BY product_prefix, order_date
"""


def fmt_currency(n: float) -> str:
    return f"{n:.2f}"


NUMERIC_COLS = [
    "units", "returned_units",
    "gross_revenue_incl_gst", "net_revenue_ex_gst",
    "placed_product_cost", "placed_shipping", "placed_packaging",
    "placed_gateway_fee", "rto_cost",
    "meta_spend", "meta_purchases",
]


def build_daily_frame(raw: pd.DataFrame) -> pd.DataFrame:
    df = raw.copy()
    # ClickHouse may return '\N' for NULLs; force every numeric column to float.
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
    df["product_title"] = df["product_title"].fillna("").astype(str)
    df["effective_cogs"] = (
        df["placed_product_cost"] + df["placed_shipping"] + df["placed_packaging"]
    ).round(2)
    df["net_profit"] = (
        df["net_revenue_ex_gst"]
        - df["effective_cogs"]
        - df["placed_gateway_fee"]
        - df["rto_cost"]
        - df["meta_spend"]
    ).round(2)

    def label(v: float) -> str:
        if v > 0:
            return "PROFIT"
        if v < 0:
            return "LOSS"
        return "BREAKEVEN"

    df["status"] = df["net_profit"].apply(label)

    df = df.rename(columns={
        "order_date": "order_date",
        "product_prefix": "product_key",
        "product_title": "product_name",
        "placed_product_cost": "product_cost",
        "placed_shipping": "inbound_shipping",
        "placed_packaging": "packaging",
        "placed_gateway_fee": "gateway_fee",
    })

    # Pretty column order
    return df[[
        "order_date", "product_key", "product_name",
        "units", "returned_units",
        "gross_revenue_incl_gst", "net_revenue_ex_gst",
        "product_cost", "inbound_shipping", "packaging", "effective_cogs",
        "gateway_fee", "rto_cost",
        "meta_spend", "meta_purchases",
        "net_profit", "status",
    ]]


def build_summary_frame(daily: pd.DataFrame) -> pd.DataFrame:
    """Per-product aggregates + desirable COGS at multiple net-margin targets."""

    grouped = daily.groupby("product_key", dropna=False).agg(
        product_name=("product_name", lambda s: s.dropna().iloc[0] if s.dropna().size else ""),
        first_activity=("order_date", "min"),
        last_activity=("order_date", "max"),
        days_with_activity=("order_date", "nunique"),
        total_units=("units", "sum"),
        returned_units=("returned_units", "sum"),
        gross_revenue=("gross_revenue_incl_gst", "sum"),
        net_revenue_ex_gst=("net_revenue_ex_gst", "sum"),
        product_cost=("product_cost", "sum"),
        inbound_shipping=("inbound_shipping", "sum"),
        packaging=("packaging", "sum"),
        effective_cogs=("effective_cogs", "sum"),
        gateway_fee=("gateway_fee", "sum"),
        rto_cost=("rto_cost", "sum"),
        meta_spend=("meta_spend", "sum"),
        meta_purchases=("meta_purchases", "sum"),
        net_profit=("net_profit", "sum"),
        profit_days=("status", lambda s: int((s == "PROFIT").sum())),
        loss_days=("status", lambda s: int((s == "LOSS").sum())),
        breakeven_days=("status", lambda s: int((s == "BREAKEVEN").sum())),
    ).reset_index()

    qty = grouped["total_units"].clip(lower=0)
    safe_qty = qty.where(qty > 0, other=1)
    gross = grouped["gross_revenue"]
    net = grouped["net_revenue_ex_gst"]
    safe_gross = gross.where(gross > 0, other=1)

    asp_per_unit = (gross / safe_qty).where(qty > 0, other=0.0)
    net_rev_per_unit = (net / safe_qty).where(qty > 0, other=0.0)
    product_cost_per_unit = (grouped["product_cost"] / safe_qty).where(qty > 0, other=0.0)
    cogs_ship_per_unit = (grouped["inbound_shipping"] / safe_qty).where(qty > 0, other=0.0)
    packaging_per_unit = (grouped["packaging"] / safe_qty).where(qty > 0, other=0.0)
    effective_cogs_per_unit = product_cost_per_unit + cogs_ship_per_unit + packaging_per_unit

    pgw_pct = ((grouped["gateway_fee"] / safe_gross) * 100).where(gross > 0, other=0.0)
    rto_pct = ((grouped["returned_units"] / safe_qty) * 100).where(qty > 0, other=0.0)

    # CAC per unit follows the simulator: spend/purchases (fallback spend/qty).
    cac_per_unit = pd.Series(0.0, index=grouped.index)
    spend = grouped["meta_spend"]
    purchases = grouped["meta_purchases"]
    has_spend = spend > 0
    has_purch = purchases > 0
    cac_per_unit = cac_per_unit.where(
        ~(has_spend & has_purch), other=(spend / purchases.replace(0, 1)).round(0)
    )
    cac_per_unit = cac_per_unit.where(
        ~(has_spend & ~has_purch & (qty > 0)),
        other=(spend / safe_qty).round(0),
    )

    pgw_cost_per_unit = (asp_per_unit * pgw_pct / 100).round(2)  # engine uses gross ASP basis
    rto_cost_per_unit = (net_rev_per_unit * rto_pct / 100).round(2)
    total_var_per_unit = (cac_per_unit + SHIP_EXTRA_PER_UNIT + pgw_cost_per_unit + rto_cost_per_unit)

    contribution_per_unit = (net_rev_per_unit - effective_cogs_per_unit).round(2)
    cm_pct = (
        (contribution_per_unit / net_rev_per_unit.replace(0, pd.NA)) * 100
    ).fillna(0).round(2)
    net_profit_per_unit = (
        net_rev_per_unit - effective_cogs_per_unit - total_var_per_unit
    ).round(2)
    npm_pct = (
        (net_profit_per_unit / net_rev_per_unit.replace(0, pd.NA)) * 100
    ).fillna(0).round(2)

    # Status from total net profit
    def label_total(v: float) -> str:
        if v > 0:
            return "PROFIT"
        if v < 0:
            return "LOSS"
        return "BREAKEVEN"

    status = grouped["net_profit"].apply(label_total)

    summary = pd.DataFrame({
        "product_key": grouped["product_key"],
        "product_name": grouped["product_name"],
        "first_activity": grouped["first_activity"],
        "last_activity": grouped["last_activity"],
        "days_with_activity": grouped["days_with_activity"],
        "total_units": qty.astype(int),
        "returned_units": grouped["returned_units"].astype(int),
        "gross_revenue": grouped["gross_revenue"].round(2),
        "net_revenue_ex_gst": grouped["net_revenue_ex_gst"].round(2),
        "effective_cogs_total": grouped["effective_cogs"].round(2),
        "gateway_fee_total": grouped["gateway_fee"].round(2),
        "rto_cost_total": grouped["rto_cost"].round(2),
        "meta_spend_total": grouped["meta_spend"].round(2),
        "meta_purchases_total": grouped["meta_purchases"].astype(int),
        "net_profit_total": grouped["net_profit"].round(2),
        "net_margin_pct": (
            (grouped["net_profit"] / grouped["net_revenue_ex_gst"].replace(0, pd.NA)) * 100
        ).fillna(0).round(2),
        "profit_days": grouped["profit_days"],
        "loss_days": grouped["loss_days"],
        "breakeven_days": grouped["breakeven_days"],
        "status": status,

        # Per-unit economics
        "asp_per_unit": asp_per_unit.round(2),
        "net_rev_per_unit": net_rev_per_unit.round(2),
        "product_cost_per_unit": product_cost_per_unit.round(2),
        "inbound_ship_per_unit": cogs_ship_per_unit.round(2),
        "packaging_per_unit": packaging_per_unit.round(2),
        "effective_cogs_per_unit": effective_cogs_per_unit.round(2),
        "cac_per_unit": cac_per_unit.round(0),
        "pgw_pct": pgw_pct.round(2),
        "pgw_cost_per_unit": pgw_cost_per_unit,
        "rto_pct": rto_pct.round(2),
        "rto_cost_per_unit": rto_cost_per_unit,
        "total_var_per_unit": total_var_per_unit.round(2),
        "contribution_per_unit": contribution_per_unit,
        "contribution_margin_pct": cm_pct,
        "net_profit_per_unit": net_profit_per_unit,
        "net_margin_per_unit_pct": npm_pct,
    })

    # Desirable vendor cost per unit at each margin target.
    #   TARGET_VENDOR_COST = NET_REV × (1 - TARGET_MARGIN) - TOTAL_VAR - COGS_SHIP - PKG_CONST
    # At target 0% this is the *break-even* vendor cost.
    fixed_cogs_components = cogs_ship_per_unit + packaging_per_unit
    for tgt in MARGIN_TARGETS:
        label = "be" if tgt == 0.0 else f"{int(tgt*100)}pct"
        col_target = f"desired_product_cost_{label}"
        col_reduction = f"required_reduction_{label}"
        col_reduction_pct = f"required_reduction_pct_{label}"
        col_status = f"hits_target_at_current_cost_{label}"

        target_vendor_cost = (
            net_rev_per_unit * (1 - tgt) - total_var_per_unit - fixed_cogs_components
        ).round(2)
        required_reduction = (product_cost_per_unit - target_vendor_cost).round(2)
        required_reduction_pct = (
            (required_reduction / product_cost_per_unit.replace(0, pd.NA)) * 100
        ).fillna(0).round(2)

        summary[col_target] = target_vendor_cost
        summary[col_reduction] = required_reduction
        summary[col_reduction_pct] = required_reduction_pct
        summary[col_status] = (product_cost_per_unit <= target_vendor_cost).map(
            {True: "YES", False: "NO"}
        )

    # Sort by total net profit descending so winners surface first.
    return summary.sort_values("net_profit_total", ascending=False).reset_index(drop=True)


PRODUCT_NAME_LOOKUP_SQL = f"""
SELECT
  extract(assumeNotNull(sku), '^([A-Z]{{2,3}}-[0-9]{{2,5}})') AS product_prefix,
  argMax(product_title, _loaded_at)                           AS resolved_name
FROM gold.fct_order_items
WHERE brand_id = {BRAND_ID}
  AND sku IS NOT NULL
  AND product_title IS NOT NULL
  AND length(product_title) > 0
GROUP BY product_prefix
HAVING product_prefix != ''
"""


def main() -> None:
    print(f"Querying ClickHouse {CH_HOST}:{CH_PORT}/{CH_DB} for brand {BRAND_ID}")
    print(f"Date range: {DATE_FROM.isoformat()} to {DATE_TO.isoformat()}")

    raw_daily = run_query(DAILY_SQL)
    print(f"  pulled {len(raw_daily):,} daily rows across "
          f"{raw_daily['product_prefix'].nunique()} products")

    # Per-prefix name lookup across ALL history — fills prefixes where the
    # selected window had only ad-spend or NULL titles, AND acts as the
    # whitelist of "real" product prefixes (so spurious regex matches like
    # "SEL-05" or "CR-30" extracted from the middle of campaign names get
    # dropped before they pollute the report).
    name_map = run_query(PRODUCT_NAME_LOOKUP_SQL)
    name_lookup = dict(zip(name_map["product_prefix"], name_map["resolved_name"]))
    valid_prefixes = set(name_lookup.keys())

    before = len(raw_daily)
    raw_daily = raw_daily[raw_daily["product_prefix"].isin(valid_prefixes)].copy()
    dropped = before - len(raw_daily)
    if dropped:
        print(f"  dropped {dropped:,} rows for prefixes not present in orders "
              f"(spurious regex hits in campaign names)")

    raw_daily["product_title"] = raw_daily.apply(
        lambda r: r["product_title"]
        if isinstance(r["product_title"], str) and r["product_title"]
        else name_lookup.get(r["product_prefix"], ""),
        axis=1,
    )

    daily = build_daily_frame(raw_daily)
    summary = build_summary_frame(daily)

    daily_sorted = daily.sort_values(["product_key", "order_date"]).reset_index(drop=True)

    print(f"  building workbook: {len(daily_sorted):,} daily rows · "
          f"{len(summary):,} product summary rows")

    with pd.ExcelWriter(OUT_PATH, engine="openpyxl") as writer:
        daily_sorted.to_excel(writer, sheet_name="Daily P&L", index=False)
        summary.to_excel(writer, sheet_name="Product Summary", index=False)

        # Set sensible column widths and a frozen header row on each sheet.
        for sheet_name, df in [("Daily P&L", daily_sorted), ("Product Summary", summary)]:
            ws = writer.sheets[sheet_name]
            ws.freeze_panes = "A2"
            for idx, col in enumerate(df.columns, start=1):
                sample = df[col].astype(str).head(50)
                width = max(len(col), sample.map(len).max() if not sample.empty else 0) + 2
                ws.column_dimensions[ws.cell(row=1, column=idx).column_letter].width = min(width, 36)

    size_kb = OUT_PATH.stat().st_size / 1024
    print(f"Written {OUT_PATH} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    try:
        main()
    except requests.HTTPError as e:
        print(f"ClickHouse HTTP error: {e}\n{e.response.text}", file=sys.stderr)
        sys.exit(1)
