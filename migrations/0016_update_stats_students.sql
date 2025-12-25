-- 受講生数を自動+手動合計方式に変更
ALTER TABLE site_stats ADD COLUMN student_count_extra INTEGER DEFAULT 0;

-- 既存のstudent_countをstudent_count_extraに移行
UPDATE site_stats SET student_count_extra = student_count WHERE student_count IS NOT NULL;
