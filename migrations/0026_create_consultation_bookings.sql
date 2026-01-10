-- 個別相談予約テーブル
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,  -- 'ai' or 'mental'
  duration INTEGER NOT NULL,  -- 30 or 60 minutes
  date TEXT NOT NULL,  -- YYYY-MM-DD
  time TEXT NOT NULL,  -- HH:MM
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  message TEXT,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, confirmed, cancelled, completed
  payment_status TEXT DEFAULT 'pending',  -- pending, paid, refunded
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  meet_url TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_date ON consultation_bookings(date);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_email ON consultation_bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
