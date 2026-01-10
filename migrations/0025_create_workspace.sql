-- ワークスペース（カフェタイム）スケジュール管理テーブル
CREATE TABLE IF NOT EXISTS workspace_schedules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'mirAIcafe ワークスペース',
  description TEXT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 6,
  enrolled INTEGER NOT NULL DEFAULT 0,
  price INTEGER NOT NULL DEFAULT 500,
  meet_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ワークスペース予約テーブル
CREATE TABLE IF NOT EXISTS workspace_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_schedule_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  amount INTEGER NOT NULL DEFAULT 500,
  stripe_session_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (workspace_schedule_id) REFERENCES workspace_schedules(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_workspace_schedules_date ON workspace_schedules(date);
CREATE INDEX IF NOT EXISTS idx_workspace_schedules_status ON workspace_schedules(status);
CREATE INDEX IF NOT EXISTS idx_workspace_bookings_schedule ON workspace_bookings(workspace_schedule_id);
CREATE INDEX IF NOT EXISTS idx_workspace_bookings_email ON workspace_bookings(customer_email);
