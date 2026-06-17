"""
Test script — verify the Cube.js REST connection and fetch today's P&L.

Run from services/orchestrator/:
    python scripts/test_cube_rest.py
"""

import asyncio
import json
import os
import sys
from datetime import date
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore

root = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv(root / ".env.local", override=False)
load_dotenv(root / ".env", override=False)


async def test_meta():
    from src.memory.cube_client import _cube_api_url, _auth_headers
    import httpx

    base = _cube_api_url()
    headers = _auth_headers()

    print(f"\n{'='*60}")
    print(f"CUBE_API_URL : {base}")
    print(f"Auth         : {'Bearer key/JWT' if headers else 'none'}")
    print(f"{'='*60}")

    print("\n[1/3] GET /cubejs-api/v1/meta ...")
    async with httpx.AsyncClient(headers=headers, timeout=15) as client:
        resp = await client.get(f"{base}/cubejs-api/v1/meta")
        resp.raise_for_status()
        meta = resp.json()
        cube_names = [c["name"] for c in meta.get("cubes", [])]
        print(f"  Cubes available: {cube_names}")
        return cube_names


async def test_today_pnl():
    from src.memory.cube_client import get_today_spend

    today = date.today().isoformat()
    print(f"\n[2/3] Fetching today's P&L (start_date={today}) via REST ...")
    result = await get_today_spend()
    rows = result.get("today_pnl", [])
    if rows:
        print(f"  Rows returned: {len(rows)}")
        print(f"  First row:\n{json.dumps(rows[0], indent=4)}")
    else:
        print("  No rows returned.")
    return rows


async def test_entity_metrics():
    from src.memory.cube_client import get_entity_metrics

    print("\n[3/3] Fetching entity metrics (7d + 30d + today) ...")
    metrics = await get_entity_metrics("test-entity", entity_type="campaign")
    print(f"  Metrics:\n{json.dumps(metrics, indent=4, default=str)}")
    return metrics


async def main():
    try:
        await test_meta()
        await test_today_pnl()
        await test_entity_metrics()
        print("\nOK: Cube REST connection successful\n")
    except Exception as exc:
        print(f"\nFAILED: {exc}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
