-- Add category, language, and translation columns to ai_news table
-- category: official_announcement, tool_update, how_to, other
-- original_language: ja, en, etc.
-- is_translated: 0 or 1

ALTER TABLE ai_news ADD COLUMN category TEXT;
ALTER TABLE ai_news ADD COLUMN original_language TEXT;
ALTER TABLE ai_news ADD COLUMN is_translated INTEGER DEFAULT 0;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_ai_news_category ON ai_news(category);
