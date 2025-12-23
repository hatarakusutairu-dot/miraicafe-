-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER DEFAULT 10,
  enrolled INTEGER DEFAULT 0,
  location TEXT DEFAULT 'オンライン',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schedules_course_id ON schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
