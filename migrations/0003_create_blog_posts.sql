-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,  -- JSON array stored as text
  image TEXT,
  read_time TEXT DEFAULT '5分',
  status TEXT DEFAULT 'published',  -- 'published', 'draft'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(date DESC);
