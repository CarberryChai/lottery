import * as fs from "fs";

interface DltRecord {
  period: string;
  date: string;
  front_balls: number[];
  back_balls: number[];
  first_prize_count?: number;
  first_prize_amount?: number;
  second_prize_count?: number;
  second_prize_amount?: number;
  sales_amount?: number;
  pool_amount?: string | number;
}

interface SsqRecord {
  period: string;
  date: string;
  red_balls: number[];
  blue_ball: number;
  first_prize_count?: number;
  first_prize_amount?: number;
  second_prize_count?: number;
  second_prize_amount?: number;
  sales_amount?: number;
  pool_amount?: number;
}

const existingDlt: DltRecord[] = JSON.parse(
  fs.readFileSync("data/super_lotto_data.json", "utf-8")
);
const existingSsq: SsqRecord[] = JSON.parse(
  fs.readFileSync("data/lottery_data.json", "utf-8")
);

const existingDltPeriods = new Set(existingDlt.map((r) => r.period));
const existingSsqPeriods = new Set(existingSsq.map((r) => r.period));

async function fetchDlt(): Promise<DltRecord[]> {
  // 大乐透每周3期，8个月约100期
  const html = await fetch(
    "https://datachart.500.com/dlt/history/newinc/history.php?limit=150"
  ).then((r) => r.text());
  const rows = [
    ...html.matchAll(
      /<tr[^>]*>.*?<td[^>]*>(\d+)<\/td>.*?<td[^>]*>([\d-]+)<\/td>.*?class="red"[^>]*>([\d\s]+)<\/td>.*?class="blue"[^>]*>([\d\s]+)<\/td>/gs
    ),
  ];

  const newRecords: DltRecord[] = [];
  for (const [, period, date, frontStr, backStr] of rows) {
    if (!existingDltPeriods.has(period)) {
      newRecords.push({
        period,
        date,
        front_balls: frontStr.trim().split(/\s+/).map(Number),
        back_balls: backStr.trim().split(/\s+/).map(Number),
      });
    }
  }
  return newRecords;
}

async function fetchSsq(): Promise<SsqRecord[]> {
  // 双色球每周3期，3个月约40期
  const html = await fetch(
    "https://datachart.500.com/ssq/history/newinc/history.php?limit=50"
  ).then((r) => r.text());
  const rows = [
    ...html.matchAll(
      /<tr[^>]*>.*?<td[^>]*>(\d+)<\/td>.*?<td[^>]*>([\d-]+)<\/td>.*?class="red"[^>]*>([\d\s]+)<\/td>.*?class="blue"[^>]*>(\d+)<\/td>/gs
    ),
  ];

  const newRecords: SsqRecord[] = [];
  for (const [, period, date, redStr, blue] of rows) {
    if (!existingSsqPeriods.has(period)) {
      newRecords.push({
        period,
        date,
        red_balls: redStr.trim().split(/\s+/).map(Number),
        blue_ball: parseInt(blue),
      });
    }
  }
  return newRecords;
}

async function main() {
  const newDlt = await fetchDlt();
  const newSsq = await fetchSsq();

  console.log(`大乐透新增 ${newDlt.length} 期`);
  console.log(`双色球新增 ${newSsq.length} 期`);

  // 合并并更新 JSON 文件
  const allDlt = [...newDlt, ...existingDlt].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const allSsq = [...newSsq, ...existingSsq].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  fs.writeFileSync("data/super_lotto_data.json", JSON.stringify(allDlt, null, 2));
  fs.writeFileSync("data/lottery_data.json", JSON.stringify(allSsq, null, 2));

  // 生成 SQL
  const statements: string[] = [];
  for (const r of allDlt) {
    const mainBalls = JSON.stringify(r.front_balls);
    const specialBalls = JSON.stringify(r.back_balls);
    statements.push(
      `INSERT OR IGNORE INTO lottery_records (type, period, date, main_balls, special_balls) VALUES ('super_lotto', '${r.period}', '${r.date}', '${mainBalls}', '${specialBalls}');`
    );
  }
  for (const r of allSsq) {
    const mainBalls = JSON.stringify(r.red_balls);
    const specialBalls = JSON.stringify([r.blue_ball]);
    statements.push(
      `INSERT OR IGNORE INTO lottery_records (type, period, date, main_balls, special_balls) VALUES ('ssq', '${r.period}', '${r.date}', '${mainBalls}', '${specialBalls}');`
    );
  }
  fs.writeFileSync("db/seed.sql", statements.join("\n"));
  console.log(`生成 ${statements.length} 条 SQL`);
}

main();
