-- Add image columns to ai_news table for auto-fetched images
-- Note: These columns may already exist from previous manual migration
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so this is a documentation note

-- image_url: URL of the fetched image (OGP, Unsplash, or data URL for gradient)
-- image_source: Source of the image ('ogp', 'unsplash', 'gradient')

-- If columns don't exist, run:
-- ALTER TABLE ai_news ADD COLUMN image_url TEXT;
-- ALTER TABLE ai_news ADD COLUMN image_source TEXT;

SELECT 'Migration 0009: image columns already exist or will be added manually' AS status;
