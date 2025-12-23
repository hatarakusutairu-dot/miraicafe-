-- Add SEO columns to blog_posts table
ALTER TABLE blog_posts ADD COLUMN meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN keywords TEXT;
ALTER TABLE blog_posts ADD COLUMN seo_score INTEGER DEFAULT 0;

-- Add SEO columns to courses table
ALTER TABLE courses ADD COLUMN meta_description TEXT;
ALTER TABLE courses ADD COLUMN keywords TEXT;
ALTER TABLE courses ADD COLUMN seo_score INTEGER DEFAULT 0;

-- Create index for SEO score filtering/sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_score ON blog_posts(seo_score);
CREATE INDEX IF NOT EXISTS idx_courses_seo_score ON courses(seo_score);
