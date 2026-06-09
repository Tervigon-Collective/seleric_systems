"""Reconcile ``gold.fct_daily_pnl`` against the line-level placement + refund axes.

Runs two ClickHouse queries:

1. **April-2026 audit** — for each P&L line (gross_sales, discounts, returns +
   adjustments, product/shipping/packaging/gateway/RTO costs), compares the
   row-by-row ``fct_daily_pnl`` aggregates to the equivalent
   ``int_finance_order_lines`` (placement) + ``fct_refund_line_items``
   (refunds) line-level computation. Every line should return MATCH.

2. **May-2026 monthly P&L** — full month brand-20 P&L from
   ``fct_daily_pnl`` with both excl-GST and incl-GST columns. The incl-GST
   bridge is the canonical one the web app's `inclGstValue()` helper now uses
   (``excl × 1.18`` for taxable revenue lines, native ``_incl_gst`` columns
   for return/adjustment refunds, unchanged for costs/ad spend).

Run from the repo root::

    py -3 scripts/reconcile_daily_pnl_audit.py
    py -3 scripts/reconcile_daily_pnl_audit.py --brand 20

Uses the same ClickHouse credentials as ``build_pnl_workbook.py``.
"""
from __future__ import annotations

import argparse
import os
import sys

import requests

CH_HOST = os.environ.get("CLICKHOUSE_HOST", "clickhouse.seleric.com")
CH_PORT = int(os.environ.get("CLICKHOUSE_PORT", "8123"))
CH_USER = os.environ.get("CLICKHOUSE_USER", "seleric_admin789")
CH_PASS = os.environ.get("CLICKHOUSE_PASSWORD", "SelericDB7890")
CH_DB = os.environ.get("CLICKHOUSE_DATABASE", "gold")


def run_query(sql: str, fmt: str = "PrettyCompactMonoBlock") -> str:
    url = f"http://{CH_HOST}:{CH_PORT}/?database={CH_DB}"
    resp = requests.post(
        url,
        data=(sql + f"\nFORMAT {fmt}").encode("utf-8"),
        auth=(CH_USER, CH_PASS),
        timeout=120,
    )
    if resp.status_code != 200:
        print(f"ERROR HTTP {resp.status_code}:\n{resp.text}", file=sys.stderr)
        resp.raise_for_status()
    return resp.text


def audit_sql(brand_id: int, start: str, end: str) -> str:
    return f"""
WITH
    placement AS (
        SELECT
            sumIf(toFloat64(net_pre_refund_excl_gst), is_gmv_eligible = 1)        AS gross_sales_excl,
            sumIf(toFloat64(discount_excl_gst),       is_gmv_eligible = 1)        AS discounts_excl,
            sumIf(toFloat64(total_cost),
                  ops_cost_placement_eligible = 1 AND is_gift_card = 0)           AS product_cost_placed,
            sumIf(toFloat64(placed_shipping_cost),
                  ops_cost_placement_eligible = 1 AND is_gift_card = 0)           AS shipping_cost_placed,
            sumIf(toFloat64(placed_packaging_cost),
                  ops_cost_placement_eligible = 1 AND is_gift_card = 0)           AS packaging_cost_placed,
            sumIf(toFloat64(placed_gateway_fee),
                  gateway_fee_placement_eligible = 1)                             AS gateway_fees_placed,
            sumIf(toFloat64(rto_cost),
                  ops_cost_placement_eligible = 1 AND is_gift_card = 0
                  AND return_status IN ('IN_PROGRESS','RETURNED')
                  AND coalesce(refunded_quantity, 0) = 0)                         AS rto_cost_placed
        FROM gold.int_finance_order_lines
        WHERE brand_id = {brand_id}
          AND order_date BETWEEN toDate('{start}') AND toDate('{end}')
    ),
    refunds AS (
        SELECT
            sumIf(toFloat64(refund_subtotal_amount) - toFloat64(refund_tax_amount),
                  pnl_refund_class = 'CANCELLATION')                              AS cancellations_excl,
            sumIf(toFloat64(refund_subtotal_amount) - toFloat64(refund_tax_amount),
                  pnl_refund_class IN ('RETURN','ADJUSTMENT'))                    AS returns_excl,
            sumIf(toFloat64(refunded_product_cost),
                  cost_refund_event_eligible = 1 AND refunded_quantity > 0)       AS product_cost_reversal,
            sumIf(toFloat64(refunded_packaging_cost),
                  cost_refund_event_eligible = 1 AND refunded_quantity > 0)       AS packaging_cost_reversal,
            sumIf(toFloat64(refunded_shipping_cost),
                  cost_refund_event_eligible = 1 AND refunded_quantity > 0)       AS shipping_cost_reversal,
            sumIf(toFloat64(refunded_gateway_fee),
                  cost_refund_event_eligible = 1 AND refunded_quantity > 0)       AS gateway_fees_reversal,
            sumIf(toFloat64(rto_cost_refund),
                  cost_refund_event_eligible = 1 AND refunded_quantity > 0)       AS rto_cost_refund_amt
        FROM gold.fct_refund_line_items
        WHERE brand_id = {brand_id}
          AND refund_date BETWEEN toDate('{start}') AND toDate('{end}')
          AND is_test = 0
    ),
    daily AS (
        SELECT
            sum(toFloat64(gross_sales_excl_tax))                                  AS gross_sales_excl,
            sum(toFloat64(total_discounts_excl_tax))                              AS discounts_excl,
            sum(toFloat64(notes_cancellation_refund_excl_gst))                    AS cancellations_excl,
            sum(toFloat64(notes_return_refund_excl_gst))
                + sum(toFloat64(notes_adjustment_refund_excl_gst))                AS returns_excl,
            sum(toFloat64(product_cost))                                          AS product_cost,
            sum(toFloat64(shipping_cost))                                         AS shipping_cost,
            sum(toFloat64(packaging_cost))                                        AS packaging_cost,
            sum(toFloat64(payment_gateway_fees))                                  AS gateway_fees,
            sum(toFloat64(rto_cost))                                              AS rto_cost
        FROM gold.fct_daily_pnl
        WHERE brand_id = {brand_id}
          AND report_date BETWEEN toDate('{start}') AND toDate('{end}')
    ),
    line_calc AS (
        SELECT
            p.gross_sales_excl                                                AS gross_sales_excl,
            p.discounts_excl                                                  AS discounts_excl,
            r.cancellations_excl                                              AS cancellations_excl,
            r.returns_excl                                                    AS returns_excl,
            p.gross_sales_excl - p.discounts_excl - r.returns_excl            AS net_sales_excl,
            p.product_cost_placed   - r.product_cost_reversal                 AS product_cost,
            p.shipping_cost_placed  - r.shipping_cost_reversal                AS shipping_cost,
            p.packaging_cost_placed - r.packaging_cost_reversal               AS packaging_cost,
            p.gateway_fees_placed   - r.gateway_fees_reversal                 AS gateway_fees,
            p.rto_cost_placed       + r.rto_cost_refund_amt                   AS rto_cost
        FROM placement p, refunds r
    )
SELECT *
FROM (
    SELECT  1 AS sort, 'Gross sales (ex-GST)'           AS line_item,
            round(l.gross_sales_excl, 2)                AS line_level,
            round(d.gross_sales_excl, 2)                AS daily_pnl,
            round(l.gross_sales_excl - d.gross_sales_excl, 2) AS delta,
            if(abs(l.gross_sales_excl - d.gross_sales_excl) <= 0.01, 'MATCH', 'CHECK') AS status
    FROM line_calc l, daily d
    UNION ALL SELECT  2, 'Cancelled revenue (audit, ex-GST)',
            round(l.cancellations_excl, 2), round(d.cancellations_excl, 2),
            round(l.cancellations_excl - d.cancellations_excl, 2),
            if(abs(l.cancellations_excl - d.cancellations_excl) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  3, '  - Discounts (ex-GST)',
            round(l.discounts_excl, 2), round(d.discounts_excl, 2),
            round(l.discounts_excl - d.discounts_excl, 2),
            if(abs(l.discounts_excl - d.discounts_excl) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  4, '  - Returns + Adjustments (ex-GST)',
            round(l.returns_excl, 2), round(d.returns_excl, 2),
            round(l.returns_excl - d.returns_excl, 2),
            if(abs(l.returns_excl - d.returns_excl) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  5, '= Net sales (ex-GST)',
            round(l.net_sales_excl, 2),
            round(d.gross_sales_excl - d.discounts_excl - d.returns_excl, 2),
            round(l.net_sales_excl - (d.gross_sales_excl - d.discounts_excl - d.returns_excl), 2),
            if(abs(l.net_sales_excl - (d.gross_sales_excl - d.discounts_excl - d.returns_excl)) <= 0.01,
               'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  6, '  - Product COGS',
            round(l.product_cost, 2), round(d.product_cost, 2),
            round(l.product_cost - d.product_cost, 2),
            if(abs(l.product_cost - d.product_cost) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  7, '= Gross profit',
            round(l.net_sales_excl - l.product_cost, 2),
            round((d.gross_sales_excl - d.discounts_excl - d.returns_excl) - d.product_cost, 2),
            round((l.net_sales_excl - l.product_cost)
                - ((d.gross_sales_excl - d.discounts_excl - d.returns_excl) - d.product_cost), 2),
            if(abs((l.net_sales_excl - l.product_cost)
                 - ((d.gross_sales_excl - d.discounts_excl - d.returns_excl) - d.product_cost)) <= 0.01,
               'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  8, '  - Shipping cost',
            round(l.shipping_cost, 2), round(d.shipping_cost, 2),
            round(l.shipping_cost - d.shipping_cost, 2),
            if(abs(l.shipping_cost - d.shipping_cost) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT  9, '  - Packaging cost',
            round(l.packaging_cost, 2), round(d.packaging_cost, 2),
            round(l.packaging_cost - d.packaging_cost, 2),
            if(abs(l.packaging_cost - d.packaging_cost) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT 10, '  - Gateway fees',
            round(l.gateway_fees, 2), round(d.gateway_fees, 2),
            round(l.gateway_fees - d.gateway_fees, 2),
            if(abs(l.gateway_fees - d.gateway_fees) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
    UNION ALL SELECT 11, '  - RTO logistics',
            round(l.rto_cost, 2), round(d.rto_cost, 2),
            round(l.rto_cost - d.rto_cost, 2),
            if(abs(l.rto_cost - d.rto_cost) <= 0.01, 'MATCH', 'CHECK') FROM line_calc l, daily d
) AS audit
ORDER BY sort
"""


def monthly_sql(brand_id: int, start: str, end: str) -> str:
    return f"""
WITH t AS (
    SELECT
        sum(toFloat64(gross_sales_excl_tax))                                                  AS gross_sales_excl,
        sum(toFloat64(notes_cancellation_refund_excl_gst))                                    AS cancel_audit_excl,
        sum(toFloat64(notes_cancellation_refund_incl_gst))                                    AS cancel_audit_incl,
        sum(toFloat64(total_discounts_excl_tax))                                              AS discounts_excl,
        sum(toFloat64(notes_return_refund_excl_gst))                                          AS returns_excl,
        sum(toFloat64(notes_return_refund_incl_gst))                                          AS returns_incl,
        sum(toFloat64(notes_adjustment_refund_excl_gst))                                      AS adjustments_excl,
        sum(toFloat64(notes_adjustment_refund_incl_gst))                                      AS adjustments_incl,
        sum(toFloat64(product_cost))                                                          AS product_cost,
        sum(toFloat64(meta_spend))                                                            AS meta_spend,
        sum(toFloat64(google_spend))                                                          AS google_spend,
        sum(toFloat64(total_ad_spend))                                                        AS total_ad_spend,
        sum(toFloat64(shipping_cost))                                                         AS shipping_cost,
        sum(toFloat64(packaging_cost))                                                        AS packaging_cost,
        sum(toFloat64(payment_gateway_fees))                                                  AS gateway_fees,
        sum(toFloat64(rto_cost))                                                              AS rto_cost
    FROM gold.fct_daily_pnl
    WHERE brand_id = {brand_id}
      AND report_date BETWEEN toDate('{start}') AND toDate('{end}')
),
calc AS (
    SELECT
        *,
        gross_sales_excl * 1.18                                                               AS gross_sales_incl,
        discounts_excl   * 1.18                                                               AS discounts_incl,
        gross_sales_excl - discounts_excl - returns_excl - adjustments_excl                   AS net_sales_excl,
        (gross_sales_excl * 1.18) - (discounts_excl * 1.18) - returns_incl - adjustments_incl AS net_sales_incl
    FROM t
)
SELECT *
FROM (
    SELECT  1 AS sort, 'Gross sales'                AS line_item, round(gross_sales_excl, 2) AS excl_gst, round(gross_sales_incl, 2) AS incl_gst FROM calc
    UNION ALL SELECT  2, '  Cancelled revenue (audit)',          round(cancel_audit_excl,  2), round(cancel_audit_incl,  2) FROM calc
    UNION ALL SELECT  3, '  - Discounts',                        round(discounts_excl,     2), round(discounts_incl,     2) FROM calc
    UNION ALL SELECT  4, '  - Returns',                          round(returns_excl,       2), round(returns_incl,       2) FROM calc
    UNION ALL SELECT  5, '  - Adjustments',                      round(adjustments_excl,   2), round(adjustments_incl,   2) FROM calc
    UNION ALL SELECT  6, '= Net sales',                          round(net_sales_excl,     2), round(net_sales_incl,     2) FROM calc
    UNION ALL SELECT  7, '  - Product COGS',                     round(product_cost,       2), round(product_cost,       2) FROM calc
    UNION ALL SELECT  8, '= Gross profit',                       round(net_sales_excl - product_cost, 2),
                                                                 round(net_sales_incl - product_cost, 2) FROM calc
    UNION ALL SELECT  9, '    Meta ad spend',                    round(meta_spend,         2), round(meta_spend,         2) FROM calc
    UNION ALL SELECT 10, '    Google ad spend',                  round(google_spend,       2), round(google_spend,       2) FROM calc
    UNION ALL SELECT 11, '  - Total ad spend',                   round(total_ad_spend,     2), round(total_ad_spend,     2) FROM calc
    UNION ALL SELECT 12, '  - Shipping cost',                    round(shipping_cost,      2), round(shipping_cost,      2) FROM calc
    UNION ALL SELECT 13, '  - Packaging cost',                   round(packaging_cost,     2), round(packaging_cost,     2) FROM calc
    UNION ALL SELECT 14, '  - Gateway fees',                     round(gateway_fees,       2), round(gateway_fees,       2) FROM calc
    UNION ALL SELECT 15, '  - RTO logistics',                    round(rto_cost,           2), round(rto_cost,           2) FROM calc
    UNION ALL SELECT 16, '= Net profit',
        round(net_sales_excl - product_cost - total_ad_spend - shipping_cost - packaging_cost - gateway_fees - rto_cost, 2),
        round(net_sales_incl - product_cost - total_ad_spend - shipping_cost - packaging_cost - gateway_fees - rto_cost, 2)
        FROM calc
) AS pnl
ORDER BY sort
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--brand", type=int, default=20, help="brand_id (default: 20)")
    parser.add_argument("--audit-start", default="2026-04-01")
    parser.add_argument("--audit-end", default="2026-04-30")
    parser.add_argument("--monthly-start", default="2026-05-01")
    parser.add_argument("--monthly-end", default="2026-05-31")
    args = parser.parse_args()

    print(f"ClickHouse {CH_HOST}:{CH_PORT}/{CH_DB} · brand_id = {args.brand}\n")

    print("=" * 100)
    print(
        f"QUERY 1 — {args.audit_start}..{args.audit_end} audit: "
        f"line_level (placement + refunds) vs fct_daily_pnl"
    )
    print("=" * 100)
    print(run_query(audit_sql(args.brand, args.audit_start, args.audit_end)))

    print("=" * 100)
    print(
        f"QUERY 2 — {args.monthly_start}..{args.monthly_end} full P&L (excl-GST + incl-GST)"
    )
    print("=" * 100)
    print(run_query(monthly_sql(args.brand, args.monthly_start, args.monthly_end)))


if __name__ == "__main__":
    main()
