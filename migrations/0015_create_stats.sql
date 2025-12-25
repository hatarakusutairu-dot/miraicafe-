-- 実績表示設定テーブル
CREATE TABLE IF NOT EXISTS site_stats (
  id TEXT PRIMARY KEY DEFAULT 'main',
  -- 表示ON/OFF
  show_stats INTEGER DEFAULT 0,           -- 0: 非表示, 1: 表示
  
  -- 受講生数（自動+手動の合計）
  student_count_extra INTEGER DEFAULT 0,  -- 手動追加分（予約以外の受講生）
  student_count_suffix TEXT DEFAULT '+',  -- 例: "+" や "名以上"
  
  -- 講座数（自動計算 or 手動）
  course_count_auto INTEGER DEFAULT 1,    -- 1: 自動計算, 0: 手動入力
  course_count_manual INTEGER DEFAULT 0,
  
  -- 満足度（口コミ平均 or 手動）
  satisfaction_auto INTEGER DEFAULT 1,    -- 1: 自動計算, 0: 手動入力
  satisfaction_manual INTEGER DEFAULT 98, -- パーセント
  
  -- 更新日時
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ挿入
INSERT OR IGNORE INTO site_stats (id, show_stats, student_count_extra, student_count_suffix)
VALUES ('main', 0, 0, '+');
