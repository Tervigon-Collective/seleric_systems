-- Daily per-product P&L for full-year 2026 YTD (brand 20) across 21 selected products.
-- Net profit = (gross_revenue / 1.18) - placed product/ship/pkg costs - gateway fee
--              - rto cost - allocated Meta ad spend.

WITH
  -- Map a SKU prefix to the canonical product_base + product_number + product_name
  product_map AS (
    SELECT *
    FROM (
      SELECT 1  AS product_number, 'FluffMist Pet Brush'        AS product_name, 'TH-037-MISTBRU'         AS product_base UNION ALL
      SELECT 2,  'AvoCool Gel Mat (L/XL)',                              'TH-368-AVOCOOLMAT'             UNION ALL
      SELECT 3,  'SnugSole Boots',                                      'TH-012-SNUGBOO'                UNION ALL
      SELECT 4,  'FurEase Click Brush',                                 'TH-008-CLIBRU'                 UNION ALL
      SELECT 5,  'FusionGrip Harness',                                  'TH-348-FUSIONHARNESS'          UNION ALL
      SELECT 6,  'NapDen Donut Bed',                                    'TH-075-NAPDEN'                 UNION ALL
      SELECT 7,  'CalmFrost Puffer Jacket',                             'TH-211-PUFFERJACKET'           UNION ALL
      SELECT 8,  'PocketPup Tote Bag',                                  'TH-054-TOTE'                   UNION ALL
      SELECT 9,  'Meow Scratch Lounge',                                 'TH-149-SCRATCHLOUNGE'          UNION ALL
      SELECT 10, 'TenderTrek Silicone Boots',                           'TH-063-SILBOO'                 UNION ALL
      SELECT 11, 'PawTech Cleaner',                                     'TH-336-PAWTECH'                UNION ALL
      SELECT 12, 'Moonbeam Nap Pod',                                    'TH-182-MOONBEAMNAPPOD'         UNION ALL
      SELECT 13, 'K9 Harness',                                          'TH-103-K'                      UNION ALL
      SELECT 14, 'Luxe Car Seat Cover',                                 'TH-121-LUXESEAT'               UNION ALL
      SELECT 15, 'BlueJay Sneaks',                                      'TH-229-BLUEJAY'                UNION ALL
      SELECT 16, 'SnugBug Hut',                                         'TH-104-SNUGBUG'                UNION ALL
      SELECT 17, 'MistCalm Brush',                                      'TH-287-MISTCALMBRUSH'          UNION ALL
      SELECT 18, 'Wovyn Cat Hammock',                                   'TH-097-WCATHAM'                UNION ALL
      SELECT 19, 'FetchNova UFO Ball',                                  'TH-198-UFOBALL'                UNION ALL
      SELECT 20, 'ChillSip Bowl',                                       'TH-209-CHILLBOWL'              UNION ALL
      SELECT 21, 'TangleGuard Leash',                                   'TH-152-TANGLELEASH'
    )
  ),

  -- Daily per-product order economics (placement totals)
  orders_daily AS (
    SELECT
      order_date,
      multiIf(
        startsWith(sku, 'TH-037-MISTBRU'),         'TH-037-MISTBRU',
        startsWith(sku, 'TH-368-AVOCOOLMAT'),      'TH-368-AVOCOOLMAT',
        startsWith(sku, 'TH-012-SNUGBOO'),         'TH-012-SNUGBOO',
        startsWith(sku, 'TH-008-CLIBRU'),          'TH-008-CLIBRU',
        startsWith(sku, 'TH-348-FUSIONHARNESS'),   'TH-348-FUSIONHARNESS',
        startsWith(sku, 'TH-075-NAPDEN'),          'TH-075-NAPDEN',
        startsWith(sku, 'TH-211-PUFFERJACKET'),    'TH-211-PUFFERJACKET',
        startsWith(sku, 'TH-054-TOTE'),            'TH-054-TOTE',
        startsWith(sku, 'TH-149-SCRATCHLOUNGE'),   'TH-149-SCRATCHLOUNGE',
        startsWith(sku, 'TH-063-SILBOO'),          'TH-063-SILBOO',
        startsWith(sku, 'TH-336-PAWTECH'),         'TH-336-PAWTECH',
        startsWith(sku, 'TH-182-MOONBEAMNAPPOD'),  'TH-182-MOONBEAMNAPPOD',
        startsWith(sku, 'TH-103-K'),               'TH-103-K',
        startsWith(sku, 'TH-121-LUXESEAT'),        'TH-121-LUXESEAT',
        startsWith(sku, 'TH-229-BLUEJAY'),         'TH-229-BLUEJAY',
        startsWith(sku, 'TH-104-SNUGBUG'),         'TH-104-SNUGBUG',
        startsWith(sku, 'TH-287-MISTCALMBRUSH'),   'TH-287-MISTCALMBRUSH',
        startsWith(sku, 'TH-097-WCATHAM'),         'TH-097-WCATHAM',
        startsWith(sku, 'TH-198-UFOBALL'),         'TH-198-UFOBALL',
        startsWith(sku, 'TH-209-CHILLBOWL'),       'TH-209-CHILLBOWL',
        startsWith(sku, 'TH-152-TANGLELEASH'),     'TH-152-TANGLELEASH',
        ''
      ) AS product_base,
      toInt64(sum(quantity))                            AS units,
      toFloat64(sum(total_price))                       AS gross_revenue_incl_gst,
      toFloat64(sum(total_price) / 1.18)                AS net_revenue_ex_gst,
      toFloat64(sum(total_cost))                        AS placed_product_cost,
      toFloat64(sum(placed_shipping_cost))              AS placed_shipping,
      toFloat64(sum(placed_packaging_cost))             AS placed_packaging,
      toFloat64(sum(placed_gateway_fee))                AS placed_gateway_fee,
      toFloat64(sum(coalesce(rto_cost, toDecimal64(0, 4)))) AS rto_cost
    FROM gold.fct_order_items
    WHERE brand_id = 20
      AND order_date >= '2026-01-01'
      AND order_date <= '2026-12-31'
      AND sku IS NOT NULL
    GROUP BY order_date, product_base
    HAVING product_base != ''
  ),

  -- Daily per-product Meta spend (matches campaign name on product_base prefix)
  ads_daily AS (
    SELECT
      report_date AS order_date,
      multiIf(
        positionCaseInsensitive(campaign_name, 'TH-037-MISTBRU')        > 0, 'TH-037-MISTBRU',
        positionCaseInsensitive(campaign_name, 'TH-368-AVOCOOLMAT')     > 0, 'TH-368-AVOCOOLMAT',
        positionCaseInsensitive(campaign_name, 'TH-012-SNUGBOO')        > 0, 'TH-012-SNUGBOO',
        positionCaseInsensitive(campaign_name, 'TH-008-CLIBRU')         > 0, 'TH-008-CLIBRU',
        positionCaseInsensitive(campaign_name, 'TH-348-FUSIONHARNESS')  > 0, 'TH-348-FUSIONHARNESS',
        positionCaseInsensitive(campaign_name, 'TH-075-NAPDEN')         > 0, 'TH-075-NAPDEN',
        positionCaseInsensitive(campaign_name, 'TH-211-PUFFERJACKET')   > 0, 'TH-211-PUFFERJACKET',
        positionCaseInsensitive(campaign_name, 'TH-054-TOTE')           > 0, 'TH-054-TOTE',
        positionCaseInsensitive(campaign_name, 'TH-149-SCRATCHLOUNGE')  > 0, 'TH-149-SCRATCHLOUNGE',
        positionCaseInsensitive(campaign_name, 'TH-063-SILBOO')         > 0, 'TH-063-SILBOO',
        positionCaseInsensitive(campaign_name, 'TH-336-PAWTECH')        > 0, 'TH-336-PAWTECH',
        positionCaseInsensitive(campaign_name, 'TH-182-MOONBEAMNAPPOD') > 0, 'TH-182-MOONBEAMNAPPOD',
        positionCaseInsensitive(campaign_name, 'TH-103-K')              > 0, 'TH-103-K',
        positionCaseInsensitive(campaign_name, 'TH-121-LUXESEAT')       > 0, 'TH-121-LUXESEAT',
        positionCaseInsensitive(campaign_name, 'TH-229-BLUEJAY')        > 0, 'TH-229-BLUEJAY',
        positionCaseInsensitive(campaign_name, 'TH-104-SNUGBUG')        > 0, 'TH-104-SNUGBUG',
        positionCaseInsensitive(campaign_name, 'TH-287-MISTCALMBRUSH')  > 0, 'TH-287-MISTCALMBRUSH',
        positionCaseInsensitive(campaign_name, 'TH-097-WCATHAM')        > 0, 'TH-097-WCATHAM',
        positionCaseInsensitive(campaign_name, 'TH-198-UFOBALL')        > 0, 'TH-198-UFOBALL',
        positionCaseInsensitive(campaign_name, 'TH-209-CHILLBOWL')      > 0, 'TH-209-CHILLBOWL',
        positionCaseInsensitive(campaign_name, 'TH-152-TANGLELEASH')    > 0, 'TH-152-TANGLELEASH',
        ''
      ) AS product_base,
      toFloat64(sum(coalesce(spend, 0)))   AS meta_spend,
      toInt64(sum(coalesce(purchases, 0))) AS meta_purchases
    FROM gold.fct_meta_ads_daily
    WHERE brand_id = 20
      AND report_date >= '2026-01-01'
      AND report_date <= '2026-12-31'
    GROUP BY order_date, product_base
    HAVING product_base != ''
  ),

  merged_long AS (
    SELECT
      order_date,
      product_base,
      units,
      gross_revenue_incl_gst,
      net_revenue_ex_gst,
      placed_product_cost,
      placed_shipping,
      placed_packaging,
      placed_gateway_fee,
      rto_cost,
      toFloat64(0) AS meta_spend,
      toInt64(0)   AS meta_purchases
    FROM orders_daily
    UNION ALL
    SELECT
      order_date,
      product_base,
      toInt64(0)   AS units,
      toFloat64(0) AS gross_revenue_incl_gst,
      toFloat64(0) AS net_revenue_ex_gst,
      toFloat64(0) AS placed_product_cost,
      toFloat64(0) AS placed_shipping,
      toFloat64(0) AS placed_packaging,
      toFloat64(0) AS placed_gateway_fee,
      toFloat64(0) AS rto_cost,
      meta_spend,
      meta_purchases
    FROM ads_daily
  ),
  merged AS (
    SELECT
      order_date,
      product_base,
      sum(units)                  AS units,
      sum(gross_revenue_incl_gst) AS gross_revenue_incl_gst,
      sum(net_revenue_ex_gst)     AS net_revenue_ex_gst,
      sum(placed_product_cost)    AS placed_product_cost,
      sum(placed_shipping)        AS placed_shipping,
      sum(placed_packaging)       AS placed_packaging,
      sum(placed_gateway_fee)     AS placed_gateway_fee,
      sum(rto_cost)               AS rto_cost,
      sum(meta_spend)             AS meta_spend,
      sum(meta_purchases)         AS meta_purchases
    FROM merged_long
    GROUP BY order_date, product_base
  )

SELECT
  pm.product_number                                AS product_number,
  pm.product_name                                  AS product_name,
  m.product_base                                   AS product_base,
  toString(m.order_date)                           AS order_date,
  m.units                                          AS units,
  round(m.gross_revenue_incl_gst, 2)               AS gross_revenue_incl_gst,
  round(m.net_revenue_ex_gst, 2)                   AS net_revenue_ex_gst,
  round(m.placed_product_cost
        + m.placed_shipping
        + m.placed_packaging, 2)                   AS effective_cogs,
  round(m.placed_gateway_fee, 2)                   AS gateway_fee,
  round(m.rto_cost, 2)                             AS rto_cost,
  round(m.meta_spend, 2)                           AS meta_spend,
  m.meta_purchases                                 AS meta_purchases,
  round(
    m.net_revenue_ex_gst
    - m.placed_product_cost
    - m.placed_shipping
    - m.placed_packaging
    - m.placed_gateway_fee
    - m.rto_cost
    - m.meta_spend
  , 2)                                             AS net_profit,
  multiIf(
    round(
      m.net_revenue_ex_gst
      - m.placed_product_cost
      - m.placed_shipping
      - m.placed_packaging
      - m.placed_gateway_fee
      - m.rto_cost
      - m.meta_spend
    , 2) > 0, 'PROFIT',
    round(
      m.net_revenue_ex_gst
      - m.placed_product_cost
      - m.placed_shipping
      - m.placed_packaging
      - m.placed_gateway_fee
      - m.rto_cost
      - m.meta_spend
    , 2) < 0, 'LOSS',
    'BREAKEVEN'
  )                                                AS status
FROM merged m
INNER JOIN product_map pm
  ON m.product_base = pm.product_base
ORDER BY pm.product_number ASC, m.order_date ASC
FORMAT CSVWithNames
