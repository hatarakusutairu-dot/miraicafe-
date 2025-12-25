-- コメントテーブル（承認制）
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id TEXT NOT NULL,              -- ブログ記事のID（slug）
  author_name TEXT NOT NULL,          -- 投稿者名
  content TEXT NOT NULL,              -- コメント内容
  status TEXT DEFAULT 'pending',      -- pending, approved, rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,               -- 承認日時
  admin_reply TEXT,                   -- 管理者の返信（任意）
  admin_reply_at DATETIME             -- 返信日時
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
