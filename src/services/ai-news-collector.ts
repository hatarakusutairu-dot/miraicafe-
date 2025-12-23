/**
 * AI News Collector Service
 * RSS/Atom feeds から AI 関連ニュースを収集し、
 * Gemini API でフィルタリング・要約を行う
 */

import { XMLParser } from 'fast-xml-parser';

// RSS フィード一覧
const RSS_FEEDS = [
  { url: 'https://ai-news.jp/feed/', name: 'AI新聞' },
  { url: 'https://ledge.ai/feed/', name: 'Ledge.ai' },
  { url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml', name: 'ITmedia AI+' },
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', name: 'TechCrunch' },
  { url: 'https://venturebeat.com/category/ai/feed/', name: 'VentureBeat' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', name: 'The Verge' },
];

// ニュースアイテムの型定義
interface NewsItem {
  title: string;
  url: string;
  description: string;
  published: string;
  source: string;
}

// Gemini 分析結果の型定義
interface GeminiAnalysis {
  isRelevant: boolean;
  score: number;
  summary: string;
}

/**
 * RSS/Atom フィードを取得・パース
 */
async function fetchRSS(feedUrl: string, feedName: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'mirAIcafe/1.0 RSS Reader',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.log(`[RSS] ${feedName}: HTTP ${response.status}`);
      return [];
    }

    const xml = await response.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    
    const result = parser.parse(xml);
    const items: NewsItem[] = [];

    // RSS 2.0 形式
    if (result.rss?.channel?.item) {
      const rssItems = Array.isArray(result.rss.channel.item) 
        ? result.rss.channel.item 
        : [result.rss.channel.item];
      
      for (const item of rssItems) {
        items.push({
          title: cleanText(item.title || ''),
          url: item.link || '',
          description: cleanText(item.description || item['content:encoded'] || ''),
          published: item.pubDate || new Date().toISOString(),
          source: feedName,
        });
      }
    }
    
    // Atom 形式
    if (result.feed?.entry) {
      const atomItems = Array.isArray(result.feed.entry) 
        ? result.feed.entry 
        : [result.feed.entry];
      
      for (const entry of atomItems) {
        // Atom の link 処理
        let link = '';
        if (entry.link) {
          if (Array.isArray(entry.link)) {
            const htmlLink = entry.link.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate');
            link = htmlLink?.['@_href'] || entry.link[0]?.['@_href'] || '';
          } else {
            link = entry.link['@_href'] || entry.link || '';
          }
        }
        
        items.push({
          title: cleanText(typeof entry.title === 'object' ? entry.title['#text'] || '' : entry.title || ''),
          url: link,
          description: cleanText(
            typeof entry.summary === 'object' ? entry.summary['#text'] || '' : 
            typeof entry.content === 'object' ? entry.content['#text'] || '' :
            entry.summary || entry.content || ''
          ),
          published: entry.published || entry.updated || new Date().toISOString(),
          source: feedName,
        });
      }
    }

    console.log(`[RSS] ${feedName}: ${items.length}件取得`);
    return items;
  } catch (error) {
    console.error(`[RSS] ${feedName} エラー:`, error);
    return [];
  }
}

/**
 * HTMLタグとエンティティを除去してテキストをクリーンアップ
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // HTMLタグ除去
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Gemini API で AI 関連性をチェックし、要約を生成
 */
async function analyzeWithGemini(
  title: string,
  description: string,
  apiKey: string
): Promise<GeminiAnalysis> {
  const prompt = `
以下のニュース記事がAI技術に関連するか判定し、要約を生成してください。

【タイトル】
${title}

【本文】
${description.substring(0, 500)}

【指示】
1. AI技術との関連性を0.0〜1.0で評価(0.7以上が関連あり)
2. 不適切なコンテンツ(成人向け、暴力、詐欺、ギャンブル)は0.0
3. AI、機械学習、ChatGPT、LLM、生成AI、深層学習などに関連する記事は高スコア
4. 関連がある場合のみ、50文字以内で日本語要約を生成

【出力形式】JSON のみ出力（コードブロック不要）
{"score": 0.85, "summary": "ChatGPTの新機能が発表され、画像生成が可能に"}
`;

  const models = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-pro'
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 200,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.log(`[Gemini] ${model}: レート制限、次のモデルへ`);
          continue;
        }
        continue;
      }

      const data = await response.json() as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // JSON を抽出してパース
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        isRelevant: parsed.score >= 0.7,
        score: parsed.score || 0.5,
        summary: parsed.summary || title.substring(0, 50),
      };
    } catch (error) {
      console.log(`[Gemini] ${model} エラー:`, error);
      continue;
    }
  }

  // 全モデル失敗時のフォールバック
  // キーワードベースで簡易判定
  const aiKeywords = ['AI', 'ChatGPT', 'GPT', 'LLM', '生成AI', '機械学習', 'OpenAI', 'Claude', 'Gemini', '深層学習', 'ディープラーニング'];
  const titleLower = title.toLowerCase();
  const hasAIKeyword = aiKeywords.some(kw => 
    title.includes(kw) || titleLower.includes(kw.toLowerCase())
  );

  return {
    isRelevant: hasAIKeyword,
    score: hasAIKeyword ? 0.75 : 0.3,
    summary: title.substring(0, 50),
  };
}

/**
 * メイン収集処理
 */
export async function collectAINews(env: { DB: D1Database; GEMINI_API_KEY: string }) {
  console.log('[Cron] AIニュース収集開始');
  
  if (!env.GEMINI_API_KEY) {
    console.error('[Cron] GEMINI_API_KEY が設定されていません');
    return { collected: 0, saved: 0, error: 'GEMINI_API_KEY not configured' };
  }

  let totalCollected = 0;
  let totalSaved = 0;
  let totalSkipped = 0;
  let totalDuplicate = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const items = await fetchRSS(feed.url, feed.name);
      
      for (const item of items) {
        totalCollected++;
        
        // URL が空の場合はスキップ
        if (!item.url || !item.title) {
          totalSkipped++;
          continue;
        }

        // 重複チェック
        try {
          const existing = await env.DB.prepare(
            'SELECT id FROM ai_news WHERE url = ?'
          ).bind(item.url).first();

          if (existing) {
            totalDuplicate++;
            continue;
          }
        } catch (e) {
          // 重複エラーを無視して続行
        }

        // Gemini で分析
        const analysis = await analyzeWithGemini(
          item.title,
          item.description,
          env.GEMINI_API_KEY
        );

        if (!analysis.isRelevant) {
          console.log(`[スキップ] ${item.title.substring(0, 30)}... (スコア: ${analysis.score})`);
          totalSkipped++;
          continue;
        }

        // DB に保存
        try {
          await env.DB.prepare(`
            INSERT INTO ai_news (title, url, summary, source, published_at, status, ai_relevance_score)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
          `).bind(
            item.title,
            item.url,
            analysis.summary,
            item.source,
            item.published,
            analysis.score
          ).run();

          totalSaved++;
          console.log(`[保存] ${item.title.substring(0, 30)}... (スコア: ${analysis.score})`);
        } catch (dbError: any) {
          // UNIQUE constraint エラーは無視
          if (dbError.message?.includes('UNIQUE')) {
            totalDuplicate++;
          } else {
            console.error('[DB] 保存エラー:', dbError);
          }
        }

        // API レート制限対策: 少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (feedError) {
      console.error(`[Feed] ${feed.name} 処理エラー:`, feedError);
    }
  }

  const result = {
    collected: totalCollected,
    saved: totalSaved,
    skipped: totalSkipped,
    duplicate: totalDuplicate,
  };
  
  console.log(`[Cron完了] 収集:${totalCollected}件 / 保存:${totalSaved}件 / スキップ:${totalSkipped}件 / 重複:${totalDuplicate}件`);
  
  return result;
}

/**
 * Cloudflare Cron Trigger ハンドラ
 */
export default {
  async scheduled(event: ScheduledEvent, env: { DB: D1Database; GEMINI_API_KEY: string }, ctx: ExecutionContext) {
    ctx.waitUntil(collectAINews(env));
  },
};
