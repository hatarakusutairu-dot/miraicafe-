-- Add image columns to ai_news table
-- For hybrid image acquisition: OGP -> Unsplash -> Gradient fallback

ALTER TABLE ai_news ADD COLUMN image_url TEXT;
ALTER TABLE ai_news ADD COLUMN image_source TEXT;

-- Create index for image_source queries
CREATE INDEX IF NOT EXISTS idx_ai_news_image_source ON ai_news(image_source);
