// D1 数据库类型定义
export interface LotteryRecord {
  id: number;
  type: "super_lotto" | "ssq";
  period: string;
  date: string;
  main_balls: number[];
  special_balls: number[];
}

// 从 D1 原始记录转换
interface D1RawRecord {
  id: number;
  type: string;
  period: string;
  date: string;
  main_balls: string;
  special_balls: string;
}

function parseRecord(raw: D1RawRecord): LotteryRecord {
  return {
    id: raw.id,
    type: raw.type as "super_lotto" | "ssq",
    period: raw.period,
    date: raw.date,
    main_balls: JSON.parse(raw.main_balls),
    special_balls: JSON.parse(raw.special_balls),
  };
}

export async function getLotteryRecords(
  db: D1Database,
  type: "super_lotto" | "ssq",
  limit = 100
): Promise<LotteryRecord[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM lottery_records WHERE type = ? ORDER BY date DESC LIMIT ?"
    )
    .bind(type, limit)
    .all<D1RawRecord>();
  return results.map(parseRecord);
}

export async function getLatestRecord(
  db: D1Database,
  type: "super_lotto" | "ssq"
): Promise<LotteryRecord | null> {
  const result = await db
    .prepare(
      "SELECT * FROM lottery_records WHERE type = ? ORDER BY date DESC LIMIT 1"
    )
    .bind(type)
    .first<D1RawRecord>();
  return result ? parseRecord(result) : null;
}

export async function getRecordByPeriod(
  db: D1Database,
  type: "super_lotto" | "ssq",
  period: string
): Promise<LotteryRecord | null> {
  const result = await db
    .prepare(
      "SELECT * FROM lottery_records WHERE type = ? AND period = ?"
    )
    .bind(type, period)
    .first<D1RawRecord>();
  return result ? parseRecord(result) : null;
}

export async function getAllRecords(
  db: D1Database,
  type: "super_lotto" | "ssq"
): Promise<LotteryRecord[]> {
  const { results } = await db
    .prepare(
      "SELECT * FROM lottery_records WHERE type = ? ORDER BY date DESC"
    )
    .bind(type)
    .all<D1RawRecord>();
  return results.map(parseRecord);
}
