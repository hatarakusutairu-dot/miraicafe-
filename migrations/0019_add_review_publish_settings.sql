-- survey_questionsテーブルに口コミ公開設定カラムを追加
ALTER TABLE survey_questions ADD COLUMN use_for_review INTEGER DEFAULT 0;

-- survey_responsesテーブルに口コミ公開済みフラグを追加
ALTER TABLE survey_responses ADD COLUMN published_as_review INTEGER DEFAULT 0;
ALTER TABLE survey_responses ADD COLUMN review_id INTEGER;
