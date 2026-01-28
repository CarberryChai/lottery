#!/usr/bin/env python3
"""双色球数据抓取脚本 - 从500.com获取"""

import json
import re
import time
import random
import urllib.request
from pathlib import Path

API_URL = "https://datachart.500.com/ssq/history/newinc/history.php"
DATA_FILE = Path(__file__).parent.parent / "data" / "lottery_data.json"

def fetch_html(params: str) -> str:
    """抓取页面"""
    url = f"{API_URL}?{params}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("gb2312", errors="ignore")

def parse_rows(html: str) -> list:
    """用正则解析数据行"""
    # 匹配 <tr class="t_tr1">...</tr> 或 <tr class="t_tr2">...</tr>
    pattern = r'<tr class="t_tr[12]">(.*?)</tr>'
    rows = []
    for match in re.finditer(pattern, html, re.DOTALL):
        tr_content = match.group(1)
        # 去掉注释中的隐藏td <!--<td>2</td>-->
        tr_content = re.sub(r'<!--.*?-->', '', tr_content)
        # 提取所有td内容
        tds = re.findall(r'<td[^>]*>(.*?)</td>', tr_content)
        # 清理HTML实体和标签
        clean_tds = []
        for td in tds:
            td = re.sub(r'<[^>]+>', '', td)
            td = td.replace('&nbsp;', '').strip()
            clean_tds.append(td)
        if len(clean_tds) >= 15:
            rows.append(clean_tds)
    return rows

def normalize_period(period: str) -> str:
    """统一期号格式为 YYYYNNN"""
    if len(period) == 5:  # 26012 -> 2026012
        return "20" + period
    return period

def parse_row(row: list) -> dict:
    """解析单行数据为字典"""
    def parse_num(s):
        s = s.replace(",", "").replace("---", "0").replace("-", "0").strip()
        return int(s) if s and s.isdigit() else 0

    return {
        "period": normalize_period(row[0]),
        "date": row[-1],
        "red_balls": [int(row[i]) for i in range(1, 7)],
        "blue_ball": int(row[7]),
        "first_prize_count": parse_num(row[10]),
        "first_prize_amount": parse_num(row[11]),
        "second_prize_count": parse_num(row[12]),
        "second_prize_amount": parse_num(row[13]),
        "sales_amount": parse_num(row[14]),
        "pool_amount": parse_num(row[9])
    }

def to_short_period(period: str) -> str:
    """转换为短期号格式 YYNNN"""
    if len(period) == 7:  # 2026012 -> 26012
        return period[2:]
    return period

def main():
    # 读取现有数据
    existing = []
    existing_periods = set()
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            existing_periods = {r["period"] for r in existing}

    latest_period = existing[0]["period"] if existing else "2003001"
    print(f"现有 {len(existing)} 条记录，最新: {latest_period}")

    # 获取最新期号
    html = fetch_html("limit=1")
    rows = parse_rows(html)
    if not rows:
        print("无法获取最新期号")
        return

    newest_period = normalize_period(rows[0][0])
    print(f"服务器最新期号: {newest_period}")

    if newest_period <= latest_period:
        print("无新数据")
        return

    # 抓取新数据 (从现有最新期号到服务器最新，使用短期号格式)
    start = to_short_period(latest_period)
    end = to_short_period(newest_period)
    print(f"抓取 {start} 到 {end} ...")
    html = fetch_html(f"start={start}&end={end}")
    time.sleep(random.uniform(0.5, 1))

    rows = parse_rows(html)
    new_records = []
    for row in rows:
        period = row[0]
        if period not in existing_periods:
            try:
                new_records.append(parse_row(row))
            except Exception as e:
                print(f"解析失败 {period}: {e}")

    if new_records:
        merged = new_records + existing
        merged.sort(key=lambda x: x["period"], reverse=True)

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)

        print(f"新增 {len(new_records)} 条，总计 {len(merged)} 条")
    else:
        print("无新数据")

if __name__ == "__main__":
    main()
