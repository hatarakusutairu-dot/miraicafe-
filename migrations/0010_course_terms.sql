-- コースシリーズの「開催期」テーブル
-- 例：「第1期（2026年2月〜3月）」「第2期（2026年5月〜6月）」
CREATE TABLE IF NOT EXISTS course_terms (
  id TEXT PRIMARY KEY,
  series_id TEXT NOT NULL,
  name TEXT NOT NULL,  -- 「第1期」「2026年春期」など
  start_date DATE,     -- 開始日（第1回の日程）
  end_date DATE,       -- 終了日（最終回の日程）
  status TEXT DEFAULT 'upcoming',  -- upcoming, ongoing, completed, cancelled
  max_capacity INTEGER DEFAULT 10,
  enrolled INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (series_id) REFERENCES course_series(id)
);

-- 日程テーブルに「期」を紐づけるカラムを追加
ALTER TABLE schedules ADD COLUMN term_id TEXT REFERENCES course_terms(id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_course_terms_series ON course_terms(series_id);
CREATE INDEX IF NOT EXISTS idx_course_terms_status ON course_terms(status);
CREATE INDEX IF NOT EXISTS idx_schedules_term ON schedules(term_id);
