-- アンケート設定（お礼動画URL等）をsite_statsに追加
ALTER TABLE site_stats ADD COLUMN survey_thank_you_video_url TEXT DEFAULT '';
ALTER TABLE site_stats ADD COLUMN survey_logo_url TEXT DEFAULT '';
