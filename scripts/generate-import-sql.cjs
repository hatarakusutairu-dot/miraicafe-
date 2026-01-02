const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// SQL文を生成
let sql = '-- Data import from local database\n\n';

// エスケープ関数
function escapeValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    return "'" + value.replace(/'/g, "''") + "'";
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// テーブルごとにINSERT文を生成
const tablesToImport = [
  'blog_posts',
  'portfolios', 
  'courses',
  'ai_news',
  'survey_questions',
  'policies',
  'site_stats',
  'schedules'
];

for (const table of tablesToImport) {
  const rows = data[table] || [];
  if (rows.length === 0) continue;
  
  sql += `-- ${table}\n`;
  
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = columns.map(col => escapeValue(row[col]));
    sql += `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
  }
  sql += '\n';
}

const outputPath = path.join(__dirname, '../data-import.sql');
fs.writeFileSync(outputPath, sql);
console.log(`SQL file generated: ${outputPath}`);
console.log(`Total lines: ${sql.split('\n').length}`);
