-- コースバンドル（セット販売）システム
-- 複数のコースシリーズを組み合わせて割引価格で販売するための機能

-- 1. バンドル定義テーブル
CREATE TABLE IF NOT EXISTS course_bundles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                    -- 「基礎+キャリコン8回セット」など
  description TEXT,                      -- セットの説明
  bundle_price INTEGER NOT NULL,         -- セット価格（税込、円）例: 39600
  discount_type TEXT DEFAULT 'fixed',    -- 'fixed'（固定価格）or 'percentage'（割引率）
  discount_value REAL,                   -- 割引率の場合の値（例: 0.25 = 25%OFF）
  min_series_count INTEGER DEFAULT 2,    -- 最低組み合わせ数（自動バンドル用）
  is_auto_bundle INTEGER DEFAULT 0,      -- 1: 条件を満たせば自動適用、0: 明示的に選択
  valid_from DATETIME,                   -- 有効開始日（NULLなら即時有効）
  valid_until DATETIME,                  -- 有効終了日（NULLなら無期限）
  stripe_product_id TEXT,                -- Stripe商品ID
  stripe_price_id TEXT,                  -- Stripe価格ID
  image TEXT,                            -- バンドル用画像URL
  is_featured INTEGER DEFAULT 0,         -- おすすめ表示
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. バンドルに含まれるシリーズの紐付け
CREATE TABLE IF NOT EXISTS bundle_series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id TEXT NOT NULL,
  series_id TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,       -- 表示順
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bundle_id) REFERENCES course_bundles(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES course_series(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, series_id)
);

-- 3. バンドル購入履歴
CREATE TABLE IF NOT EXISTS bundle_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id TEXT NOT NULL,
  member_id INTEGER,                     -- 会員ID（あれば）
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  original_price INTEGER NOT NULL,       -- 定価合計
  bundle_price INTEGER NOT NULL,         -- 実際の支払額
  discount_amount INTEGER NOT NULL,      -- 割引額
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending',         -- pending/paid/cancelled/refunded
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bundle_id) REFERENCES course_bundles(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 4. 動的割引ルール（将来拡張用：N個以上で○%OFFなど）
CREATE TABLE IF NOT EXISTS bundle_discount_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 「2コース以上で25%OFF」
  min_series_count INTEGER NOT NULL,     -- 最低コース数
  max_series_count INTEGER,              -- 最大コース数（NULLなら上限なし）
  discount_type TEXT NOT NULL,           -- 'percentage' or 'fixed_per_series'
  discount_value REAL NOT NULL,          -- 割引率 or 1コースあたりの割引額
  is_active INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,            -- 複数ルールがある場合の優先度（高い方を適用）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ: 基本的な割引ルール
INSERT OR IGNORE INTO bundle_discount_rules (name, min_series_count, max_series_count, discount_type, discount_value, priority) VALUES
  ('2コースセット割引', 2, 2, 'percentage', 0.25, 10),      -- 2コースで25%OFF
  ('3コース以上セット割引', 3, NULL, 'percentage', 0.30, 20); -- 3コース以上で30%OFF

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bundle_series_bundle ON bundle_series(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_series_series ON bundle_series(series_id);
CREATE INDEX IF NOT EXISTS idx_bundle_purchases_email ON bundle_purchases(customer_email);
CREATE INDEX IF NOT EXISTS idx_bundle_purchases_member ON bundle_purchases(member_id);
CREATE INDEX IF NOT EXISTS idx_course_bundles_active ON course_bundles(is_active);
