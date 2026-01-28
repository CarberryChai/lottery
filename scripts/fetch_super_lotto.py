#!/usr/bin/env python3
"""大乐透数据抓取脚本"""

import json
import time
import random
import urllib.request
import urllib.parse
from pathlib import Path

API_URL = "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry"
DATA_FILE = Path(__file__).parent.parent / "data" / "super_lotto_data.json"

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

def fetch_page(page: int) -> list:
    """抓取单页数据"""
    params = {
        "gameNo": "85",
        "provinceId": "0",
        "pageSize": "30",
        "isVerify": "1",
        "pageNo": str(page)
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"

    req = urllib.request.Request(url, headers={
        "User-Agent": random.choice(USER_AGENTS),
        "Origin": "https://static.sporttery.cn",
        "Referer": "https://static.sporttery.cn/"
    })

    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    if data.get("errorCode") == "567":
        print(f"限流，等待重试...")
        time.sleep(random.uniform(3, 5))
        return fetch_page(page)

    return data.get("value", {}).get("list", [])

def parse_record(item: dict) -> dict:
    """解析单条记录"""
    numbers = item.get("lotteryDrawResult", "").split()
    front_balls = [int(n) for n in numbers[:5]] if len(numbers) >= 5 else []
    back_balls = [int(n) for n in numbers[5:7]] if len(numbers) >= 7 else []

    return {
        "period": item.get("lotteryDrawNum", ""),
        "date": item.get("lotteryDrawTime", "").split()[0],
        "front_balls": front_balls,
        "back_balls": back_balls,
        "first_prize_count": item.get("prizeLevelList", [{}])[0].get("stakeCount", 0) if item.get("prizeLevelList") else 0,
        "first_prize_amount": item.get("prizeLevelList", [{}])[0].get("stakeAmount", 0) if item.get("prizeLevelList") else 0,
        "second_prize_count": item.get("prizeLevelList", [{}])[1].get("stakeCount", 0) if len(item.get("prizeLevelList", [])) > 1 else 0,
        "second_prize_amount": item.get("prizeLevelList", [{}])[1].get("stakeAmount", 0) if len(item.get("prizeLevelList", [])) > 1 else 0,
        "sales_amount": item.get("totalSaleAmount", 0),
        "pool_amount": item.get("poolBalanceAfterdraw", "0")
    }

def main():
    # 读取现有数据
    existing = []
    existing_periods = set()
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            existing_periods = {r["period"] for r in existing}

    print(f"现有 {len(existing)} 条记录，最新: {existing[0]['period'] if existing else 'N/A'}")

    new_records = []
    page = 1

    while True:
        print(f"抓取第 {page} 页...")
        items = fetch_page(page)

        if not items:
            break

        found_existing = False
        for item in items:
            period = item.get("lotteryDrawNum", "")
            if period in existing_periods:
                found_existing = True
                break
            new_records.append(parse_record(item))

        if found_existing:
            print(f"遇到已有记录，停止抓取")
            break

        page += 1
        time.sleep(random.uniform(0.5, 1.5))

    if new_records:
        # 合并数据，新数据在前
        merged = new_records + existing
        merged.sort(key=lambda x: x["period"], reverse=True)

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)

        print(f"新增 {len(new_records)} 条，总计 {len(merged)} 条")
    else:
        print("无新数据")

if __name__ == "__main__":
    main()
