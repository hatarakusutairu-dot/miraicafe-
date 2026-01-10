-- シリーズ予約用のカラムを追加
ALTER TABLE bookings ADD COLUMN payment_type TEXT DEFAULT 'single';
ALTER TABLE bookings ADD COLUMN series_booking_id TEXT;
ALTER TABLE bookings ADD COLUMN series_id TEXT;
ALTER TABLE bookings ADD COLUMN term_id TEXT;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_bookings_series_booking_id ON bookings(series_booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_series_id ON bookings(series_id);
CREATE INDEX IF NOT EXISTS idx_bookings_term_id ON bookings(term_id);
