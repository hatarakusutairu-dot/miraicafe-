-- 個別相談予約テーブルにカレンダーイベントID列を追加
-- 仮予約としてGoogleカレンダーに自動登録されたイベントのIDを保存

ALTER TABLE consultation_bookings ADD COLUMN calendar_event_id TEXT;
