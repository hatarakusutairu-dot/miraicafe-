-- スケジュール（日程）ごとにMeet URLを設定できるようにする
-- Peatixなど外部サービスで日程ごとに異なるURLを使用する場合に対応

-- schedulesテーブルにonline_url列を追加
ALTER TABLE schedules ADD COLUMN online_url TEXT;

-- 同一URLが複数の日程に使用されるのを防ぐためのユニークインデックス
-- NULLは除外（NULLは複数可）
CREATE UNIQUE INDEX IF NOT EXISTS idx_schedules_online_url 
ON schedules(online_url) WHERE online_url IS NOT NULL AND online_url != '';
