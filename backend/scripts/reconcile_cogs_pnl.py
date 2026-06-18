"""Compare COGS simulation aggregates vs daily_pnl and channel_pnl for a date range."""
import json
import re
import urllib.request

BASE = "http://localhost:3000"
FROM, TO, BRAND = "2026-05-08", "2026-06-07", "20"


def post_cube(query: dict) -> tuple[list[dict], str | None]:
    req = urllib.request.Request(
        f"{BASE}/api/debug/cube",
        data=json.dumps({"query": query}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.load(r)
    preview = d.get("preview")
    if isinstance(preview, str):
        return [], preview[:300]
    rows = preview.get("data", []) if isinstance(preview, dict) else []
    return rows, None


def sum_measure(rows: list[dict], key: str) -> float:
    return sum(float(r.get(key, 0) or 0) for r in rows)


def fetch_cogs() -> dict:
    url = f"{BASE}/api/tools/cogs-data?dateFrom={FROM}&dateTo={TO}&brand={BRAND}"
    with urllib.request.urlopen(url, timeout=120) as r:
        return json.load(r)


PRODUCT_BASE_RE = re.compile(r"^([A-Z]{2,3}-\d{2,5}-[A-Z]+)", re.I)
NUMERIC_PREFIX_RE = re.compile(r"\b([A-Z]{2,3}-\d{2,5})\b", re.I)


def main() -> None:
    queries = {
        "daily_pnl": {
            "measures": [
                "daily_pnl.net_profit",
                "daily_pnl.total_sales_ex_gst",
                "daily_pnl.total_cogs",
                "daily_pnl.total_ad_spend",
                "daily_pnl.gross_profit",
            ],
            "timeDimensions": [{"dimension": "daily_pnl.report_date", "dateRange": [FROM, TO]}],
            "filters": [{"member": "daily_pnl.brand_id", "operator": "equals", "values": [BRAND]}],
            "timezone": "Asia/Kolkata",
        },
        "channel_pnl": {
            "measures": [
                "channel_pnl.meta_net_profit",
                "channel_pnl.google_net_profit",
                "channel_pnl.organic_net_profit",
                "channel_pnl.meta_attributed_revenue_ex_gst",
                "channel_pnl.meta_ad_spend",
                "channel_pnl.meta_attributed_cogs",
                "channel_pnl.google_ad_spend",
            ],
            "timeDimensions": [{"dimension": "channel_pnl.date_start", "dateRange": [FROM, TO]}],
            "filters": [{"member": "channel_pnl.brand_id", "operator": "equals", "values": [BRAND]}],
            "timezone": "Asia/Kolkata",
        },
        "dw_meta_attr": {
            "measures": [
                "dw_meta_ads_attribution.attributed_revenue",
                "dw_meta_ads_attribution.attributed_orders",
                "dw_meta_ads_attribution.attributed_cogs",
                "dw_meta_ads_attribution.attributed_gross_profit",
                "dw_meta_ads_attribution.ad_spend",
            ],
            "timeDimensions": [
                {"dimension": "dw_meta_ads_attribution.report_date", "dateRange": [FROM, TO]}
            ],
            "filters": [
                {"member": "dw_meta_ads_attribution.brand_id", "operator": "equals", "values": [BRAND]}
            ],
            "timezone": "Asia/Kolkata",
        },
    }

    results: dict[str, dict] = {}
    for name, q in queries.items():
        rows, err = post_cube(q)
        results[name] = {"rows": rows, "err": err}

    data = fetch_cogs()
    skus = data.get("skus", [])
    campaigns = data.get("campaigns", [])

    def extract_base(sku: str) -> str:
        m = PRODUCT_BASE_RE.match(sku)
        return m.group(1).upper() if m else sku.upper()

    groups: dict[str, list] = {}
    for s in skus:
        base = extract_base(s["sku"])
        groups.setdefault(base, []).append(s)

    products = []
    for base, rows in groups.items():
        tq = sum(r["qty"] for r in rows)
        products.append(
            {
                "base": base,
                "totalQty": tq,
                "grossRevenue": sum(r["grossRevenue"] for r in rows),
                "netRevenueExGst": sum(r["netRevenueExGst"] for r in rows),
                "totalEffectiveCogs": sum(r.get("totalEffectiveCogs", 0) for r in rows),
            }
        )

    prefix_map: dict[str, dict] = {}
    for p in products:
        m = re.match(r"^([A-Z]{2,3}-\d{2,5})", p["base"], re.I)
        if m:
            prefix_map[m.group(1).upper()] = p

    buckets: dict[str, dict] = {}
    for c in campaigns:
        cn = c["campaignName"]
        upper = cn.upper()
        best = None
        best_len = 0
        for p in products:
            if p["base"] in upper and len(p["base"]) > best_len:
                best = p
                best_len = len(p["base"])
        if not best:
            m = NUMERIC_PREFIX_RE.search(cn)
            if m:
                best = prefix_map.get(m.group(1).upper())
        if not best:
            continue
        b = buckets.setdefault(best["base"], {"spend": 0.0, "purchases": 0.0})
        b["spend"] += c["spend"]
        b["purchases"] += c["purchases"]

    total_qty = sum(s["qty"] for s in skus)
    total_gross = sum(s["grossRevenue"] for s in skus)
    total_net_ex_gst = sum(s["netRevenueExGst"] for s in skus)
    total_product_cost = sum(s.get("placedProductCost", 0) for s in skus)
    total_ship = sum(s.get("placedShippingCost", 0) for s in skus)
    total_pkg = sum(s.get("placedPackagingCost", 0) for s in skus)
    total_pgw = sum(s.get("placedGatewayFee", 0) for s in skus)
    matched_spend = sum(b["spend"] for b in buckets.values())
    total_campaign_spend = sum(c["spend"] for c in campaigns)

    var_agg = matched_spend + total_ship + total_pkg + total_pgw
    net_profit_agg_doc = total_net_ex_gst - total_product_cost - var_agg

    tax_rate = 18
    net_profit_sim_sum = 0.0
    for p in products:
        rows = groups[p["base"]]
        tq = p["totalQty"]
        if tq <= 0:
            continue
        b = buckets.get(p["base"], {"spend": 0.0, "purchases": 0.0})
        ad_spend = b["spend"]
        if ad_spend > 0 and b["purchases"] > 0:
            cac = b["spend"] / b["purchases"]
        elif ad_spend > 0:
            cac = ad_spend / tq
        else:
            cac = 0.0
        asp = p["grossRevenue"] / tq
        pc = sum(r.get("placedProductCost", 0) for r in rows) / tq
        ship = sum(r.get("placedShippingCost", 0) for r in rows) / tq
        pkg = sum(r.get("placedPackagingCost", 0) for r in rows) / tq
        gr = sum(r["grossRevenue"] for r in rows)
        gw_fee = sum(r.get("placedGatewayFee", 0) for r in rows)
        pgw_pct = (gw_fee / gr * 100) if gr else 0
        ret_pct = sum(r.get("returnRatePct", 0) * r["qty"] for r in rows) / tq
        net_rev = asp / (1 + tax_rate / 100)
        pgw_cost = asp * pgw_pct / 100
        rto_cost = net_rev * ret_pct / 100
        eff_cogs = pc + ship + pkg
        net_profit_u = net_rev - eff_cogs - cac - pgw_cost - rto_cost
        net_profit_sim_sum += net_profit_u * tq

    print(f"=== {FROM} to {TO} | brand {BRAND} ===\n")

    for name, q in queries.items():
        rows = results[name]["rows"]
        err = results[name]["err"]
        if err:
            print(f"{name} ERROR: {err}\n")
            continue
        print(f"--- {name} ---")
        keys = [k for k in (rows[0].keys() if rows else []) if "." in k]
        for k in keys:
            print(f"  {k}: {sum_measure(rows, k):,.2f}")
        print()

    print("--- COGS simulation (SKU order economics + campaign match) ---")
    print(f"  SKUs: {len(skus)} · products: {len(products)} · campaigns: {len(campaigns)}")
    print(f"  Units: {total_qty:,}")
    print(f"  Gross revenue (incl GST): {total_gross:,.0f}")
    print(f"  Net revenue ex-GST:       {total_net_ex_gst:,.0f}")
    print(f"  Product cost:             {total_product_cost:,.0f}")
    print(f"  Ship + pkg + gateway:     {total_ship + total_pkg + total_pgw:,.0f}")
    print(f"  All Meta campaign spend:  {total_campaign_spend:,.0f}")
    print(f"  SKU-matched ad spend:     {matched_spend:,.0f}")
    print(f"  Doc NET_PROFIT_AGG:       {net_profit_agg_doc:,.0f}")
    print(f"  Portfolio sim sum(pi*qty): {net_profit_sim_sum:,.0f}")
    print()

    dp = results["daily_pnl"]["rows"]
    cp = results["channel_pnl"]["rows"]
    da = results["dw_meta_attr"]["rows"]
    if dp and cp:
        company_net = sum_measure(dp, "daily_pnl.net_profit")
        meta_np = sum_measure(cp, "channel_pnl.meta_net_profit")
        google_np = sum_measure(cp, "channel_pnl.google_net_profit")
        organic_np = sum_measure(cp, "channel_pnl.organic_net_profit")
        channel_sum = meta_np + google_np + organic_np
        meta_spend = sum_measure(cp, "channel_pnl.meta_ad_spend")
        meta_rev = sum_measure(cp, "channel_pnl.meta_attributed_revenue_ex_gst")
        meta_cogs = sum_measure(cp, "channel_pnl.meta_attributed_cogs")

        print("--- Alignment check ---")
        print(f"  Company net profit (daily_pnl):     {company_net:,.0f}")
        print(f"  Meta channel net profit:            {meta_np:,.0f}")
        print(f"  Meta+Google+Organic (channels):     {channel_sum:,.0f}")
        print(f"  Unattributed & ops (recon bucket):  {company_net - channel_sum:,.0f}")
        print()
        print(f"  COGS portfolio net profit:          {net_profit_sim_sum:,.0f}")
        print(f"  vs company net profit:              {net_profit_sim_sum - company_net:,.0f} gap")
        print(f"  vs Meta channel net profit:         {net_profit_sim_sum - meta_np:,.0f} gap")
        print()
        print(f"  Meta rev - Meta COGS - Meta spend:  {meta_rev - meta_cogs - meta_spend:,.0f} (approx meta_np)")
        print(f"  Meta ad spend (channel_pnl):        {meta_spend:,.0f}")
        print(f"  SKU-matched spend (COGS):           {matched_spend:,.0f}")

    if da:
        attr_gp = sum_measure(da, "dw_meta_ads_attribution.attributed_gross_profit")
        attr_rev = sum_measure(da, "dw_meta_ads_attribution.attributed_revenue")
        attr_spend = sum_measure(da, "dw_meta_ads_attribution.ad_spend")
        print()
        print(f"  DW attribution gross profit:        {attr_gp:,.0f}")
        print(f"  DW attribution revenue:             {attr_rev:,.0f}")
        print(f"  DW attribution ad spend:            {attr_spend:,.0f}")
        print(f"  attr_gp - attr_spend (rough):         {attr_gp - attr_spend:,.0f}")


if __name__ == "__main__":
    main()
