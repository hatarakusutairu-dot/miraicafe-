-- 開催期ごとに早期締切日を設定できるようにする
-- pricing_patternsのearly_bird_daysを使って自動計算する仕組み

-- course_termsテーブルに早期締切日カラムを追加
ALTER TABLE course_terms ADD COLUMN early_bird_deadline DATE;

-- 既存の開催期に対して、start_dateとearly_bird_daysから自動計算して設定
-- (start_date - early_bird_days = early_bird_deadline)
-- 注: これは初期値として設定、後から個別に変更可能
