-- 年齢・職業・業種のプルダウン質問を追加
-- まずprofileカテゴリの既存質問を確認して重複しないようにする

-- 年齢質問
INSERT OR IGNORE INTO survey_questions (question_type, question_text, question_category, options, is_required, sort_order, is_active)
VALUES (
  'dropdown', 
  'ご年齢', 
  'profile', 
  '["20代前半", "20代後半", "30代", "40代", "50代", "60代以上"]', 
  0, 
  0, 
  1
);

-- 職業質問（自由記述も可能な複数選択）
INSERT OR IGNORE INTO survey_questions (question_type, question_text, question_category, options, is_required, sort_order, is_active)
VALUES (
  'dropdown', 
  'ご職業', 
  'profile', 
  '["会社員", "経営者・役員", "公務員", "教育関係", "フリーランス", "学生", "主婦・主夫", "その他"]', 
  0, 
  1, 
  1
);

-- 業種質問
INSERT OR IGNORE INTO survey_questions (question_type, question_text, question_category, options, is_required, sort_order, is_active)
VALUES (
  'dropdown', 
  'ご業種', 
  'profile', 
  '["IT・通信", "製造業", "金融・保険", "不動産", "小売・卸売", "サービス業", "医療・福祉", "教育", "官公庁", "その他"]', 
  0, 
  2, 
  1
);
