-- 会員・ポイント・紹介システム
-- mirAIcafe 会員特典機能

-- 1. 会員テーブル（メールアドレスで識別）
CREATE TABLE IF NOT EXISTS members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE NOT NULL,  -- この会員の紹介コード（自動生成）
  referred_by TEXT,                      -- 紹介者の紹介コード（NULL=直接登録）
  total_points INTEGER DEFAULT 0,        -- 累計獲得ポイント
  current_points INTEGER DEFAULT 0,      -- 現在保有ポイント
  total_bookings INTEGER DEFAULT 0,      -- 累計予約回数
  membership_tier TEXT DEFAULT 'standard', -- standard/silver/gold/platinum
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ポイント履歴テーブル
CREATE TABLE IF NOT EXISTS point_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  points INTEGER NOT NULL,               -- プラス=獲得、マイナス=使用
  balance_after INTEGER NOT NULL,        -- 取引後の残高
  type TEXT NOT NULL,                    -- booking(予約)/referral(紹介)/coupon_use(使用)/admin(管理者付与)/expire(期限切れ)
  description TEXT,
  related_booking_id INTEGER,            -- 関連する予約ID
  related_coupon_id INTEGER,             -- 関連するクーポンID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 3. クーポンテーブル
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,             -- クーポンコード
  member_id INTEGER,                     -- NULLなら全員利用可、指定なら特定会員専用
  type TEXT NOT NULL,                    -- percentage(割引率)/fixed(固定金額)/points(ポイント変換)
  value INTEGER NOT NULL,                -- 割引率(%)または金額(円)
  min_amount INTEGER DEFAULT 0,          -- 最低利用金額
  max_uses INTEGER DEFAULT 1,            -- 最大使用回数（NULLなら無制限）
  used_count INTEGER DEFAULT 0,          -- 使用回数
  valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
  valid_until DATETIME,                  -- NULLなら無期限
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 4. クーポン使用履歴
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coupon_id INTEGER NOT NULL,
  member_id INTEGER NOT NULL,
  booking_id INTEGER,
  discount_amount INTEGER NOT NULL,      -- 実際の割引額
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

-- 5. 紹介実績テーブル
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL,          -- 紹介した会員
  referred_id INTEGER NOT NULL,          -- 紹介された会員
  status TEXT DEFAULT 'pending',         -- pending/completed/rewarded
  referrer_reward_points INTEGER DEFAULT 0, -- 紹介者への報酬ポイント
  referred_reward_points INTEGER DEFAULT 0, -- 被紹介者への報酬ポイント
  first_booking_id INTEGER,              -- 紹介された人の最初の予約
  rewarded_at DATETIME,                  -- 報酬付与日時
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES members(id),
  FOREIGN KEY (referred_id) REFERENCES members(id)
);

-- 6. 会員ランク設定テーブル
CREATE TABLE IF NOT EXISTS membership_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tier_name TEXT UNIQUE NOT NULL,        -- standard/silver/gold/platinum
  min_bookings INTEGER DEFAULT 0,        -- このランクに必要な予約回数
  points_multiplier REAL DEFAULT 1.0,    -- ポイント倍率
  discount_rate INTEGER DEFAULT 0,       -- 常時割引率(%)
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ: 会員ランク設定
INSERT OR IGNORE INTO membership_tiers (tier_name, min_bookings, points_multiplier, discount_rate, description) VALUES
  ('standard', 0, 1.0, 0, '一般会員'),
  ('silver', 3, 1.2, 3, 'シルバー会員（3回以上受講）'),
  ('gold', 5, 1.5, 5, 'ゴールド会員（5回以上受講）'),
  ('platinum', 10, 2.0, 10, 'プラチナ会員（10回以上受講）');

-- 7. 特典設定テーブル（管理画面から設定可能）
CREATE TABLE IF NOT EXISTS reward_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ: 特典設定
INSERT OR IGNORE INTO reward_settings (setting_key, setting_value, description) VALUES
  ('points_per_booking', '100', '1回の予約で獲得できる基本ポイント'),
  ('points_per_yen', '0.01', '支払い金額1円あたりのポイント（1%）'),
  ('referral_bonus_referrer', '500', '紹介者が受け取るポイント'),
  ('referral_bonus_referred', '300', '紹介された人が受け取るポイント'),
  ('points_to_yen', '1', '1ポイント=1円として利用可能'),
  ('welcome_bonus', '100', '新規会員登録時のウェルカムポイント'),
  ('milestone_5_bookings', '500', '5回受講達成ボーナスポイント'),
  ('milestone_10_bookings', '1000', '10回受講達成ボーナスポイント');

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_referral_code ON members(referral_code);
CREATE INDEX IF NOT EXISTS idx_point_history_member ON point_history(member_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_member ON coupons(member_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
