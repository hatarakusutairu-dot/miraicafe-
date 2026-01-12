-- 予約テーブルに流入サイト（source）カラムを追加
-- mirAIcafe / こくちーず / Peatix / その他

ALTER TABLE bookings ADD COLUMN source TEXT DEFAULT 'mirAIcafe';

-- 既存のレコードで admin_note に【こくちーず】【Peatix】が含まれていれば source を更新
-- (SQLiteでは UPDATE ... FROM ... が使えないのでシンプルに)
