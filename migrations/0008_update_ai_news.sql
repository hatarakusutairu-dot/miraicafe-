-- Add missing columns to ai_news table for auto-collection feature
-- ai_relevance_score: AI relevance score from Gemini (0.0-1.0)
-- updated_at: Track when record was last modified

ALTER TABLE ai_news ADD COLUMN ai_relevance_score REAL DEFAULT 0.5;
ALTER TABLE ai_news ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create unique index on URL to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_news_url ON ai_news(url);
