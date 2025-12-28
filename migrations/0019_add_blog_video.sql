-- Add video_url column to blog_posts for embedding videos (Canva, Sora, Gemini, GenSpark, etc.)
ALTER TABLE blog_posts ADD COLUMN video_url TEXT;
