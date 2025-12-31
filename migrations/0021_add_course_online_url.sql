-- Add online meeting URL and schedule fields to courses
ALTER TABLE courses ADD COLUMN online_url TEXT;
ALTER TABLE courses ADD COLUMN meeting_type TEXT DEFAULT 'online'; -- online, offline, hybrid

-- Add schedule table for course sessions
CREATE TABLE IF NOT EXISTS course_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  schedule_date TEXT NOT NULL,  -- YYYY-MM-DD
  start_time TEXT NOT NULL,     -- HH:MM
  end_time TEXT NOT NULL,       -- HH:MM
  capacity INTEGER DEFAULT 10,
  enrolled INTEGER DEFAULT 0,
  location TEXT,                -- 会場名 or オンライン
  online_url TEXT,              -- Zoom/Meet URL
  status TEXT DEFAULT 'active', -- active, cancelled, completed
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_schedules_course_id ON course_schedules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_schedules_date ON course_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_course_schedules_status ON course_schedules(status);
