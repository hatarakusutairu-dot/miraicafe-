-- =====================================================
-- 料金パターン・コースシステム
-- =====================================================

-- 料金パターンテーブル（割引率などのテンプレート）
CREATE TABLE IF NOT EXISTS pricing_patterns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                              -- パターン名（例：標準コース）
  description TEXT,                                -- 説明
  
  -- 割引率（小数で保存: 0.10 = 10%）
  course_discount_rate REAL DEFAULT 0.10,          -- コース一括割引率
  early_bird_discount_rate REAL DEFAULT 0.17,      -- 早期割引率
  early_bird_days INTEGER DEFAULT 21,              -- 早期割引の締切日数（開始何日前まで）
  
  -- 月額払いオプション
  has_monthly_option INTEGER DEFAULT 1,            -- 月額払いあり: 1, なし: 0
  -- 月額は一括価格÷回数で計算（同額分割）
  
  -- 税率
  tax_rate REAL DEFAULT 0.10,                      -- 消費税率
  
  -- メタ情報
  is_default INTEGER DEFAULT 0,                    -- デフォルトパターン
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- コースシリーズテーブル（複数回の講座をまとめたコース）
CREATE TABLE IF NOT EXISTS course_series (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,                             -- コース名
  subtitle TEXT,                                   -- サブタイトル
  description TEXT,                                -- コース説明
  target_audience TEXT,                            -- 対象者（JSON配列）
  benefits TEXT,                                   -- 受講メリット（JSON配列）
  
  -- 回数・時間
  total_sessions INTEGER NOT NULL,                 -- 全回数（4〜10回）
  duration_minutes INTEGER DEFAULT 180,            -- 1回あたりの時間（分）
  
  -- 価格設定（税抜・基準値）
  base_price_per_session INTEGER NOT NULL,         -- 単発価格/回（税抜）
  
  -- 料金パターン参照
  pricing_pattern_id TEXT REFERENCES pricing_patterns(id),
  
  -- 計算済み価格（税込・キャッシュ用）
  calc_single_price_incl INTEGER,                  -- 単発1回税込
  calc_single_total_incl INTEGER,                  -- 単発×回数の合計税込
  calc_course_price_incl INTEGER,                  -- コース一括税込
  calc_early_price_incl INTEGER,                   -- 早期一括税込
  calc_monthly_price_incl INTEGER,                 -- 月額1回分税込
  calc_savings_course INTEGER,                     -- 一括購入時のお得額
  calc_savings_early INTEGER,                      -- 早期購入時のお得額
  
  -- Stripe連携
  stripe_product_id TEXT,                          -- Stripe Product ID
  stripe_price_id_course TEXT,                     -- 一括払い用 Price ID
  stripe_price_id_early TEXT,                      -- 早期一括用 Price ID
  stripe_price_id_monthly TEXT,                    -- 月額払い用 Price ID（サブスク）
  
  -- 早期割引締切日（初回講座日程から自動計算、または手動設定）
  early_bird_deadline DATE,
  
  -- 表示設定
  image TEXT,                                      -- コース画像
  is_featured INTEGER DEFAULT 0,                   -- おすすめ表示
  display_order INTEGER DEFAULT 0,                 -- 表示順
  
  -- ステータス
  status TEXT DEFAULT 'draft',                     -- draft, published, archived
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- coursesテーブルにコース関連カラムを追加
ALTER TABLE courses ADD COLUMN series_id TEXT REFERENCES course_series(id);
ALTER TABLE courses ADD COLUMN session_number INTEGER;                    -- コース内の回数（第1回、第2回...）
ALTER TABLE courses ADD COLUMN is_standalone_allowed INTEGER DEFAULT 1;   -- 単発参加可能か
ALTER TABLE courses ADD COLUMN standalone_price INTEGER;                  -- 単発価格（税抜）※series参照時は継承も可
ALTER TABLE courses ADD COLUMN stripe_price_id_single TEXT;               -- 単発用 Stripe Price ID

-- bookingsテーブルに支払いタイプ追加
ALTER TABLE courses ADD COLUMN price_tax_excluded INTEGER;                -- 税抜価格
ALTER TABLE courses ADD COLUMN tax_rate REAL DEFAULT 0.10;                -- 消費税率

-- 予約に支払い方法を追加
ALTER TABLE bookings ADD COLUMN payment_type TEXT DEFAULT 'single';       -- single, course, course_early, monthly
ALTER TABLE bookings ADD COLUMN series_id TEXT;                           -- コース申込の場合

-- インデックス
CREATE INDEX IF NOT EXISTS idx_pricing_patterns_default ON pricing_patterns(is_default);
CREATE INDEX IF NOT EXISTS idx_course_series_status ON course_series(status);
CREATE INDEX IF NOT EXISTS idx_course_series_featured ON course_series(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_series_id ON courses(series_id);
CREATE INDEX IF NOT EXISTS idx_bookings_series_id ON bookings(series_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_type ON bookings(payment_type);

-- 初期データ: 料金パターン
INSERT INTO pricing_patterns (id, name, description, course_discount_rate, early_bird_discount_rate, early_bird_days, has_monthly_option, is_default, sort_order)
VALUES 
  ('pattern-standard', '標準コース', '一般的な講座向けの料金パターン（単発¥5,000〜8,000程度）', 0.10, 0.17, 21, 1, 1, 1),
  ('pattern-premium', '標準コース（高単価）', '高単価講座向けの料金パターン（単発¥10,000〜15,000程度）', 0.10, 0.17, 21, 1, 0, 2);
