-- ポートフォリオテーブル
CREATE TABLE IF NOT EXISTS portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT '一般',
  
  -- メイン画像（サムネイル）
  thumbnail TEXT,
  
  -- デモタイプ: 'video', 'image', 'slides', 'link', 'multiple'
  demo_type TEXT DEFAULT 'image',
  
  -- デモURL（外部リンク用）
  demo_url TEXT,
  
  -- GitHubリポジトリURL
  github_url TEXT,
  
  -- 公開サイトURL
  live_url TEXT,
  
  -- 動画URL（YouTube, Vimeoなど）
  video_url TEXT,
  
  -- 画像/スライド（JSON配列形式で複数画像を保存）
  -- 例: ["https://...image1.jpg", "https://...image2.jpg"]
  images TEXT DEFAULT '[]',
  
  -- 使用技術（JSON配列形式）
  -- 例: ["React", "TypeScript", "Tailwind"]
  technologies TEXT DEFAULT '[]',
  
  -- 詳細な説明（Markdown対応）
  content TEXT,
  
  -- 制作期間
  duration TEXT,
  
  -- クライアント名（任意）
  client TEXT,
  
  -- 担当した役割
  role TEXT,
  
  -- 公開ステータス: 'draft', 'published'
  status TEXT DEFAULT 'draft',
  
  -- 表示順序
  sort_order INTEGER DEFAULT 0,
  
  -- SEO用
  meta_description TEXT,
  keywords TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);
CREATE INDEX IF NOT EXISTS idx_portfolios_category ON portfolios(category);
CREATE INDEX IF NOT EXISTS idx_portfolios_sort_order ON portfolios(sort_order);
