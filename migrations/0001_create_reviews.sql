-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Insert sample approved reviews for demo
INSERT INTO reviews (course_id, reviewer_name, reviewer_email, rating, comment, status, created_at) VALUES
('ai-basics', '山田 太郎', 'yamada@example.com', 5, 'AIの基礎から丁寧に教えていただき、とても分かりやすかったです。実践的な内容も多く、すぐに業務に活かせそうです。講師の方の説明も丁寧で、質問にも親切に答えていただけました。', 'approved', '2024-12-10 10:30:00'),
('ai-basics', '佐藤 花子', 'sato@example.com', 5, '全くの初心者でしたが、この講座のおかげでAIの基本概念がしっかり理解できました。特にハンズオン形式の演習が良かったです。', 'approved', '2024-12-08 15:20:00'),
('ai-basics', '鈴木 一郎', 'suzuki@example.com', 4, '内容は充実していましたが、もう少し時間が欲しかったです。それでも基礎固めには最適な講座だと思います。', 'approved', '2024-12-05 09:15:00'),
('ai-basics', '田中 美咲', 'tanaka@example.com', 5, '少人数制なので質問しやすく、自分のペースで学べました。資料も充実していて復習にも役立っています。', 'approved', '2024-12-01 14:00:00'),
('ai-basics', '高橋 健太', 'takahashi@example.com', 4, 'オンラインでも対面と変わらない質の高い講座でした。次は中級コースも受講したいです。', 'approved', '2024-11-28 11:45:00'),

('chatgpt-master', '伊藤 真理', 'ito@example.com', 5, 'ChatGPTの活用法が劇的に変わりました！プロンプトエンジニアリングの技術は本当に役立ちます。業務効率が3倍になりました。', 'approved', '2024-12-12 16:30:00'),
('chatgpt-master', '渡辺 大輔', 'watanabe@example.com', 5, '実務で使えるテクニックが満載でした。特にビジネス文書の作成が格段に楽になりました。投資対効果は抜群です。', 'approved', '2024-12-09 13:20:00'),
('chatgpt-master', '小林 さくら', 'kobayashi@example.com', 4, 'プロンプトの書き方一つでこんなに結果が変わるとは驚きでした。もっと早く知りたかったです。', 'approved', '2024-12-06 10:00:00'),

('image-generation', '中村 翔太', 'nakamura@example.com', 5, 'Midjourneyの使い方から応用まで、体系的に学べました。今では自分でクオリティの高い画像が作れるようになりました。', 'approved', '2024-12-11 14:15:00'),
('image-generation', '加藤 愛', 'kato@example.com', 5, 'デザインの知識がなくても、プロ並みの画像が作れるようになりました。仕事の幅が広がりそうです。', 'approved', '2024-12-07 17:30:00'),
('image-generation', '吉田 隆', 'yoshida@example.com', 4, '画像生成AIの可能性を実感できる講座でした。まだまだ奥が深いので、引き続き学んでいきたいです。', 'approved', '2024-12-03 09:45:00');
