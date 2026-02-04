-- bookingsテーブルにmember_id列を追加（会員との紐付け）
ALTER TABLE bookings ADD COLUMN member_id INTEGER REFERENCES members(id);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
