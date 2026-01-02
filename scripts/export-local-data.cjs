const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// 旧データベースのパス
const oldDbPath = path.join(__dirname, '../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/cd45cc5264daa1c125545b5b4c0756df95d8b6ac5900ecf52323d90f61a47f2d.sqlite');

console.log('Opening database:', oldDbPath);
const db = new Database(oldDbPath, { readonly: true });

// データをエクスポート
const tables = ['blog_posts', 'portfolios', 'courses', 'reviews', 'contacts', 'ai_news', 'survey_questions', 'survey_responses', 'policies', 'comments', 'site_stats', 'bookings', 'schedules', 'payments'];

const exportData = {};

for (const table of tables) {
  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    exportData[table] = rows;
    console.log(`${table}: ${rows.length} rows`);
  } catch (e) {
    console.log(`${table}: table not found or error - ${e.message}`);
    exportData[table] = [];
  }
}

// JSONファイルに保存
const outputPath = path.join(__dirname, '../data-export.json');
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
console.log(`\nData exported to: ${outputPath}`);

db.close();
