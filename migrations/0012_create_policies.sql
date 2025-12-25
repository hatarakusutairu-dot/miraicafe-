-- ポリシーページ（利用規約、プライバシーポリシー、キャンセルポリシー）テーブル
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ挿入
INSERT OR IGNORE INTO policies (id, title, content) VALUES 
  ('terms', '利用規約', '（内容準備中）'),
  ('privacy', 'プライバシーポリシー', '（内容準備中）'),
  ('cancellation', 'キャンセルポリシー', '（内容準備中）');
