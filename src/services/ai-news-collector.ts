/**
 * AI News Collector Service - Enhanced Filter Version
 * 厳格なフィルタリング + 日本語翻訳 + カテゴリ分類 + ハイブリッド画像取得
 */

import { XMLParser } from 'fast-xml-parser';
import { fetchNewsImage, type NewsCategory } from '../utils/image-fetcher';

// RSS フィード一覧（公式ブログ追加）
const RSS_FEEDS = [
  { url: 'https://ai-news.jp/feed/', name: 'AI新聞' },
  { url: 'https://ledge.ai/feed/', name: 'Ledge.ai' },
  { url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml', name: 'ITmedia AI+' },
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', name: 'TechCrunch' },
  { url: 'https://venturebeat.com/category/ai/feed/', name: 'VentureBeat' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', name: 'The Verge' },
  { url: 'https://openai.com/blog/rss.xml', name: 'OpenAI Blog' },
  { url: 'https://blog.google/technology/ai/rss/', name: 'Google AI Blog' },
];

// カテゴリ定義
type NewsCategory = 'official_announcement' | 'tool_update' | 'how_to' | 'other';

// ニュースアイテムの型定義
interface NewsItem {
  title: string;
  url: string;
  description: string;
  published: string;
  source: string;
}

// Gemini 分析結果の型定義（拡張版）
interface GeminiAnalysis {
  isRelevant: boolean;
  score: number;
  summary: string;
  category: NewsCategory;
  translatedTitle?: string;
  translatedSummary?: string;
  language: string;
}

/**
 * RSS/Atom フィードを取得・パース
 */
async function fetchRSS(feedUrl: string, feedName: string): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'mirAIcafe/1.0 RSS Reader',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`[RSS] ${feedName}: タイムアウト`);
    } else {
      console.error(`[RSS] ${feedName} エラー:`, error.message || error);
    }
    return [];
  }
}

/**
 * HTMLタグとエンティティを除去してテキストをクリーンアップ
 */
function cleanText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
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
 * 言語検出（簡易版）
 */
function detectLanguage(text: string): string {
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japanesePattern.test(text) ? 'ja' : 'en';
}

/**
 * Gemini API で厳格な分析 + 翻訳 + カテゴリ分類
 */
async function analyzeWithGemini(
  title: string,
  description: string,
  apiKey: string
): Promise<GeminiAnalysis> {
  const detectedLang = detectLanguage(title + description);
  
  const prompt = `
以下のニュース記事を厳格に評価してください。

【タイトル】
${title}

【本文】
${description.substring(0, 800)}

【評価基準(厳格)】
以下のいずれかに該当する場合のみ、高スコア(0.85以上)を付与:

✅ **公式発表(official_announcement)**: 
- OpenAI、Google、Microsoft、Anthropic、Meta等の公式リリース
- 新製品・新機能の正式発表
- 企業の公式声明

✅ **ツール更新(tool_update)**:
- ChatGPT、Gemini、Claude、Copilot等のアップデート情報
- 新機能追加、料金改定、API変更
- 具体的なバージョン情報

✅ **使い方・活用法(how_to)**:
- 実践的なAIツールの使い方ガイド
- プロンプト例、活用事例
- 業務効率化・学習支援の具体例

❌ **除外対象(スコア0.5以下)**:
- 一般的なAI議論、意見記事
- AI倫理・規制の抽象的な議論
- 投資・株価関連
- 広告・プロモーション記事
- 噂・未確認情報
- 単なるニュースまとめ

【出力形式】JSON のみ出力（コードブロック不要）
${detectedLang === 'en' ? `
※英語記事の場合、タイトルと要約を日本語に翻訳してください。
{"score": 0.90, "category": "tool_update", "summary": "50文字以内の要約(日本語)", "translatedTitle": "日本語に翻訳されたタイトル", "language": "en"}
` : `
{"score": 0.90, "category": "official_announcement", "summary": "50文字以内の要約", "language": "ja"}
`}
`;

  const models = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
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
              temperature: 0.2, // 厳格な評価のため低く設定
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          console.log(`[Gemini] ${model}: レート制限、次のモデルへ`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        continue;
      }

      const data = await response.json() as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // JSON を抽出してパース
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`[Gemini] ${model}: JSONパース失敗`);
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const category = parsed.category as NewsCategory;
      const validCategories: NewsCategory[] = ['official_announcement', 'tool_update', 'how_to'];
      
      // フィルタ強化: スコア0.85以上 かつ 有効なカテゴリのみ採用
      return {
        isRelevant: parsed.score >= 0.85 && validCategories.includes(category),
        score: parsed.score || 0.5,
        summary: parsed.summary || title.substring(0, 50),
        category: validCategories.includes(category) ? category : 'other',
        translatedTitle: parsed.translatedTitle,
        translatedSummary: parsed.summary,
        language: parsed.language || detectedLang,
      };
    } catch (error: any) {
      console.log(`[Gemini] ${model} エラー:`, error.message || error);
      continue;
    }
  }

  // 全モデル失敗時のフォールバック: 厳格化のため基本的に却下
  return {
    isRelevant: false,
    score: 0.3,
    summary: title.substring(0, 50),
    category: 'other',
    language: detectedLang,
  };
}

/**
 * メイン収集処理（厳格フィルタ版 + ハイブリッド画像取得）
 */
export async function collectAINews(env: { DB: D1Database; GEMINI_API_KEY: string; UNSPLASH_ACCESS_KEY?: string }) {
  console.log('[Cron] AIニュース収集開始（厳格フィルタ版）');
  
  if (!env.GEMINI_API_KEY) {
    console.error('[Cron] GEMINI_API_KEY が設定されていません');
    return { collected: 0, saved: 0, filtered: 0, error: 'GEMINI_API_KEY not configured' };
  }

  let totalCollected = 0;
  let totalSaved = 0;
  let totalFiltered = 0;
  let totalDuplicate = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const items = await fetchRSS(feed.url, feed.name);
      
      // 最新10件のみ処理（API呼び出し節約）
      const recentItems = items.slice(0, 10);
      
      for (const item of recentItems) {
        totalCollected++;
        
        // URL が空の場合はスキップ
        if (!item.url || !item.title) {
          totalFiltered++;
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
          // エラーは無視して続行
        }

        // Gemini で厳格分析
        const analysis = await analyzeWithGemini(
          item.title,
          item.description,
          env.GEMINI_API_KEY
        );

        if (!analysis.isRelevant) {
          totalFiltered++;
          console.log(`[フィルタ除外] ${item.title.substring(0, 40)}... (スコア: ${analysis.score}, カテゴリ: ${analysis.category})`);
          continue;
        }

        // 翻訳されたタイトルがあれば使用
        const finalTitle = analysis.translatedTitle || item.title;
        const finalSummary = analysis.translatedSummary || analysis.summary;
        const isTranslated = analysis.translatedTitle ? 1 : 0;

        // ハイブリッド画像取得 (OGP → Unsplash → Gradient)
        console.log(`[Image] 画像取得開始: ${item.url.substring(0, 50)}...`);
        const imageResult = await fetchNewsImage(
          item.url,
          finalTitle,
          analysis.category as NewsCategory,
          env.UNSPLASH_ACCESS_KEY
        );
        console.log(`[Image] 取得完了: ${imageResult.imageSource}`);

        // DB に保存
        try {
          await env.DB.prepare(`
            INSERT INTO ai_news (
              title, url, summary, source, published_at, status, 
              ai_relevance_score, category, original_language, is_translated,
              image_url, image_source
            )
            VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
          `).bind(
            finalTitle,
            item.url,
            finalSummary,
            item.source,
            item.published,
            analysis.score,
            analysis.category,
            analysis.language,
            isTranslated,
            imageResult.imageUrl,
            imageResult.imageSource
          ).run();

          totalSaved++;
          console.log(`[保存✅] ${finalTitle.substring(0, 40)}...`);
          console.log(`  カテゴリ: ${analysis.category} | スコア: ${analysis.score} | 言語: ${analysis.language}${isTranslated ? ' (翻訳済)' : ''} | 画像: ${imageResult.imageSource}`);
        } catch (dbError: any) {
          if (dbError.message?.includes('UNIQUE')) {
            totalDuplicate++;
          } else {
            console.error('[DB] 保存エラー:', dbError.message || dbError);
          }
        }

        // API レート制限対策: 少し待機
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (feedError: any) {
      console.error(`[Feed] ${feed.name} 処理エラー:`, feedError.message || feedError);
    }
  }

  const result = {
    collected: totalCollected,
    saved: totalSaved,
    filtered: totalFiltered,
    duplicate: totalDuplicate,
  };
  
  console.log(`[Cron完了] 収集:${totalCollected}件 / 保存:${totalSaved}件 / フィルタ除外:${totalFiltered}件 / 重複:${totalDuplicate}件`);
  
  return result;
}

/**
 * Cloudflare Cron Trigger ハンドラ
 */
export default {
  async scheduled(event: ScheduledEvent, env: { DB: D1Database; GEMINI_API_KEY: string; UNSPLASH_ACCESS_KEY?: string }, ctx: ExecutionContext) {
    ctx.waitUntil(collectAINews(env));
  },
};
