CREATE TABLE IF NOT EXISTS lottery_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,           -- 'super_lotto' 或 'ssq'
  period TEXT NOT NULL,
  date TEXT NOT NULL,
  main_balls TEXT NOT NULL,     -- JSON: [1,2,3,4,5]
  special_balls TEXT NOT NULL,  -- JSON: [1,2] 或 [1]
  UNIQUE(type, period)
);

CREATE INDEX IF NOT EXISTS idx_type_date ON lottery_records(type, date DESC);
