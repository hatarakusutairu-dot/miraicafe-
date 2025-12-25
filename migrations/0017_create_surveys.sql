-- アンケート質問マスタ
CREATE TABLE IF NOT EXISTS survey_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_type TEXT NOT NULL,           -- 'rating', 'text', 'choice', 'multi_choice'
  question_text TEXT NOT NULL,           -- 質問文
  question_category TEXT DEFAULT 'general', -- 'satisfaction', 'content', 'instructor', 'environment', 'general'
  options TEXT,                          -- 選択肢（JSON配列）
  is_required INTEGER DEFAULT 1,         -- 必須かどうか
  sort_order INTEGER DEFAULT 0,          -- 表示順
  is_active INTEGER DEFAULT 1,           -- アクティブかどうか
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- アンケート回答
CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER,                    -- 予約ID（紐付け用、任意）
  respondent_name TEXT,                  -- 回答者名
  respondent_email TEXT,                 -- 回答者メール
  course_name TEXT,                      -- 受講した講座名
  answers TEXT NOT NULL,                 -- 回答データ（JSON）
  overall_rating INTEGER,                -- 総合評価（1-5）
  publish_consent TEXT DEFAULT 'no',     -- 公開同意: 'yes', 'anonymous', 'no'
  thank_you_watched INTEGER DEFAULT 0,   -- お礼動画視聴フラグ
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_survey_questions_active ON survey_questions(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created ON survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_rating ON survey_responses(overall_rating);
CREATE INDEX IF NOT EXISTS idx_survey_responses_consent ON survey_responses(publish_consent);

-- デフォルト質問データ投入
INSERT INTO survey_questions (question_type, question_text, question_category, options, is_required, sort_order) VALUES
-- 総合評価
('rating', '本日の講座の総合満足度を教えてください', 'satisfaction', NULL, 1, 1),

-- 講座内容について
('rating', '講座の内容は分かりやすかったですか？', 'content', NULL, 1, 2),
('rating', '講座の内容は実践的で役立ちそうですか？', 'content', NULL, 1, 3),
('rating', '講座の進行スピードは適切でしたか？', 'content', NULL, 1, 4),

-- 講師について
('rating', '講師の説明は分かりやすかったですか？', 'instructor', NULL, 1, 5),
('rating', '講師の対応は親切でしたか？', 'instructor', NULL, 1, 6),

-- 環境・サポートについて
('rating', 'オンライン環境（音声・画面共有等）は問題なかったですか？', 'environment', NULL, 1, 7),

-- 選択式質問
('choice', 'この講座を知人や同僚に勧めたいと思いますか？', 'general', '["ぜひ勧めたい", "勧めたい", "どちらでもない", "あまり勧めない", "勧めない"]', 1, 8),
('choice', '今後、他の講座も受講してみたいですか？', 'general', '["ぜひ受講したい", "機会があれば受講したい", "検討中", "あまり興味がない"]', 1, 9),

-- 自由記述
('text', '講座で特に良かった点があれば教えてください', 'general', NULL, 0, 10),
('text', '改善してほしい点やご要望があれば教えてください', 'general', NULL, 0, 11),
('text', 'その他、ご意見・ご感想がありましたらご自由にお書きください', 'general', NULL, 0, 12);
