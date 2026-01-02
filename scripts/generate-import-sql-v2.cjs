const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// SQL文を生成
let sql = '-- Data import from local database v2\n\n';

// エスケープ関数
function escapeValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return "'" + value.replace(/'/g, "''") + "'";
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// 本番DBのスキーマに合わせたカラムマッピング
const columnMappings = {
  'site_stats': ['id', 'student_count_extra', 'course_count_auto', 'course_count_manual', 'satisfaction_auto', 'satisfaction_manual', 'updated_at', 'survey_thank_you_video_url', 'survey_logo_url']
};

// テーブルごとにINSERT文を生成
const tablesToImport = [
  'blog_posts',
  'portfolios', 
  'courses',
  'ai_news',
  'survey_questions',
  'policies',
  'schedules'
];

for (const table of tablesToImport) {
  const rows = data[table] || [];
  if (rows.length === 0) continue;
  
  sql += `-- ${table}\n`;
  
  for (const row of rows) {
    let columns = Object.keys(row);
    let values;
    
    // site_statsは特別処理（使わないが念のため残す）
    if (columnMappings[table]) {
      columns = columnMappings[table].filter(col => row[col] !== undefined);
      values = columns.map(col => escapeValue(row[col]));
    } else {
      values = columns.map(col => escapeValue(row[col]));
    }
    
    sql += `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  }
  sql += '\n';
}

const outputPath = path.join(__dirname, '../data-import-v2.sql');
fs.writeFileSync(outputPath, sql);
console.log(`SQL file generated: ${outputPath}`);
console.log(`Total lines: ${sql.split('\n').length}`);
