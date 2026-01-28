import * as fs from "fs";

interface DltRecord {
  period: string;
  date: string;
  front_balls: number[];
  back_balls: number[];
}

interface SsqRecord {
  period: string;
  date: string;
  red_balls: number[];
  blue_ball: number;
}

const existingDlt: DltRecord[] = JSON.parse(
  fs.readFileSync("data/super_lotto_data.json", "utf-8")
);
const existingSsq: SsqRecord[] = JSON.parse(
  fs.readFileSync("data/lottery_data.json", "utf-8")
);

// 生成 SQL
const statements: string[] = [];
for (const r of existingDlt) {
  const mainBalls = JSON.stringify(r.front_balls);
  const specialBalls = JSON.stringify(r.back_balls);
  statements.push(
    `INSERT OR IGNORE INTO lottery_records (type, period, date, main_balls, special_balls) VALUES ('super_lotto', '${r.period}', '${r.date}', '${mainBalls}', '${specialBalls}');`
  );
}
for (const r of existingSsq) {
  const mainBalls = JSON.stringify(r.red_balls);
  const specialBalls = JSON.stringify([r.blue_ball]);
  statements.push(
    `INSERT OR IGNORE INTO lottery_records (type, period, date, main_balls, special_balls) VALUES ('ssq', '${r.period}', '${r.date}', '${mainBalls}', '${specialBalls}');`
  );
}
fs.writeFileSync("db/seed.sql", statements.join("\n"));
console.log(`生成 ${statements.length} 条 SQL`);
