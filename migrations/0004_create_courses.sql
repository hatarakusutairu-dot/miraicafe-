-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  catchphrase TEXT,
  description TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  instructor TEXT,
  instructor_title TEXT,
  instructor_bio TEXT,
  instructor_image TEXT,
  target_audience TEXT,  -- JSON array stored as text
  curriculum TEXT,       -- JSON array stored as text
  faq TEXT,              -- JSON array stored as text
  gallery TEXT,          -- JSON array stored as text
  features TEXT,         -- JSON array stored as text
  includes TEXT,         -- JSON array stored as text
  max_capacity INTEGER,
  cancellation_policy TEXT,
  status TEXT DEFAULT 'published',  -- 'published', 'draft'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_price ON courses(price);
