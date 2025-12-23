-- AI News table for Latest AI News section
CREATE TABLE IF NOT EXISTS ai_news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  published_at TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ai_news_status ON ai_news(status);
CREATE INDEX IF NOT EXISTS idx_ai_news_published_at ON ai_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_news_created_at ON ai_news(created_at DESC);
