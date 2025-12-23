// SEO Optimization Service using Gemini API
// Provides AI-powered SEO suggestions for pages

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  canonicalUrl?: string
  structuredData?: object
}

export interface SEOAnalysis {
  score: number // 0-100
  issues: SEOIssue[]
  suggestions: SEOSuggestion[]
  optimizedMeta: SEOData
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  field: string
}

export interface SEOSuggestion {
  field: string
  current: string
  suggested: string
  reason: string
}

export interface PageContent {
  url: string
  title: string
  description?: string
  content: string
  pageType: 'home' | 'course' | 'blog' | 'contact' | 'other'
}

export interface Env {
  GEMINI_API_KEY?: string
}

// Gemini APIを使用してSEO最適化提案を生成
export async function generateSEOSuggestions(
  env: Env,
  pageContent: PageContent
): Promise<SEOAnalysis> {
  const apiKey = env.GEMINI_API_KEY
  
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured')
    return getDefaultAnalysis(pageContent)
  }

  try {
    const prompt = buildSEOPrompt(pageContent)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json'
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      return getDefaultAnalysis(pageContent)
    }

    const result = await response.json() as any
    const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!textContent) {
      console.error('Empty response from Gemini API')
      return getDefaultAnalysis(pageContent)
    }

    // JSONをパース
    const analysis = JSON.parse(textContent) as SEOAnalysis
    return analysis
  } catch (error) {
    console.error('Error generating SEO suggestions:', error)
    return getDefaultAnalysis(pageContent)
  }
}

// SEOプロンプトを構築
function buildSEOPrompt(pageContent: PageContent): string {
  return `あなたはSEO専門家です。以下のWebページのSEO分析と最適化提案を行ってください。

【ページ情報】
URL: ${pageContent.url}
ページタイプ: ${pageContent.pageType}
現在のタイトル: ${pageContent.title}
現在の説明: ${pageContent.description || '(未設定)'}

【ページコンテンツ】
${pageContent.content.substring(0, 2000)}

【分析要件】
1. SEOスコア（0-100）を算出
2. 問題点を特定（error/warning/info）
3. 改善提案を具体的に提示
4. 最適化されたメタデータを生成

【出力形式】
以下のJSON形式で出力してください：

{
  "score": 75,
  "issues": [
    {
      "type": "warning",
      "message": "タイトルが長すぎます（60文字以内推奨）",
      "field": "title"
    }
  ],
  "suggestions": [
    {
      "field": "title",
      "current": "現在のタイトル",
      "suggested": "最適化されたタイトル",
      "reason": "キーワードを含め、60文字以内に調整"
    }
  ],
  "optimizedMeta": {
    "title": "最適化されたタイトル | mirAIcafe",
    "description": "最適化された説明文（120-160文字）",
    "keywords": ["AI", "プログラミング", "講座"],
    "ogTitle": "OGP用タイトル",
    "ogDescription": "OGP用説明文"
  }
}

【重要な考慮事項】
- mirAIcafeはAI学習カフェで、AI・プログラミング講座を提供
- ターゲット：AI学習に興味のある社会人・学生
- 日本語SEOに最適化
- E-E-A-T（経験・専門性・権威性・信頼性）を意識`
}

// デフォルトの分析結果を返す
function getDefaultAnalysis(pageContent: PageContent): SEOAnalysis {
  const issues: SEOIssue[] = []
  const suggestions: SEOSuggestion[] = []
  let score = 70

  // タイトルチェック
  if (!pageContent.title) {
    issues.push({
      type: 'error',
      message: 'タイトルが設定されていません',
      field: 'title'
    })
    score -= 20
  } else if (pageContent.title.length > 60) {
    issues.push({
      type: 'warning',
      message: `タイトルが長すぎます（現在${pageContent.title.length}文字、推奨60文字以内）`,
      field: 'title'
    })
    score -= 10
  }

  // 説明チェック
  if (!pageContent.description) {
    issues.push({
      type: 'error',
      message: 'メタディスクリプションが設定されていません',
      field: 'description'
    })
    score -= 15
  } else if (pageContent.description.length < 80 || pageContent.description.length > 160) {
    issues.push({
      type: 'warning',
      message: `メタディスクリプションの長さが最適ではありません（現在${pageContent.description.length}文字、推奨80-160文字）`,
      field: 'description'
    })
    score -= 5
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
    optimizedMeta: {
      title: pageContent.title || 'mirAIcafe - カフェで学ぶAI',
      description: pageContent.description || 'mirAIcafeは、リラックスした雰囲気でAI・プログラミングを学べる新しいスタイルの学習カフェです。',
      keywords: ['AI', 'プログラミング', '講座', 'mirAIcafe', '学習']
    }
  }
}

// ページタイプ別のデフォルトSEOデータ
export function getDefaultSEOData(pageType: string, pageData?: any): SEOData {
  const baseUrl = 'https://miraicafe.work'
  
  switch (pageType) {
    case 'home':
      return {
        title: 'mirAIcafe - カフェで学ぶAI | AI・プログラミング講座',
        description: 'mirAIcafeは、リラックスした雰囲気でAI・プログラミングを学べる新しいスタイルの学習カフェです。初心者から上級者まで、あなたのレベルに合った講座をご用意しています。',
        keywords: ['AI', 'プログラミング', '講座', 'mirAIcafe', 'AIカフェ', '学習', 'ChatGPT', 'Python'],
        ogTitle: 'mirAIcafe - カフェで学ぶAI',
        ogDescription: 'リラックスした雰囲気でAI・プログラミングを学ぼう。初心者歓迎！',
        canonicalUrl: baseUrl
      }
    
    case 'course':
      if (pageData) {
        return {
          title: `${pageData.title} | mirAIcafe`,
          description: pageData.description?.substring(0, 160) || `${pageData.title}の詳細ページです。mirAIcafeで学ぶAI講座。`,
          keywords: ['AI講座', pageData.category, pageData.level, 'mirAIcafe', pageData.title],
          ogTitle: pageData.title,
          ogDescription: pageData.catchphrase || pageData.description?.substring(0, 100),
          canonicalUrl: `${baseUrl}/courses/${pageData.id}`
        }
      }
      return {
        title: '講座一覧 | mirAIcafe',
        description: 'mirAIcafeの全講座一覧です。AI基礎からプログラミング実践まで、あなたに最適な講座が見つかります。',
        keywords: ['AI講座', 'プログラミング講座', 'mirAIcafe', '一覧'],
        canonicalUrl: `${baseUrl}/courses`
      }
    
    case 'blog':
      if (pageData) {
        return {
          title: `${pageData.title} | mirAIcafeブログ`,
          description: pageData.excerpt?.substring(0, 160) || `${pageData.title} - mirAIcafeブログ`,
          keywords: pageData.tags || ['AI', 'ブログ', 'mirAIcafe'],
          ogTitle: pageData.title,
          ogDescription: pageData.excerpt?.substring(0, 100),
          canonicalUrl: `${baseUrl}/blog/${pageData.id}`
        }
      }
      return {
        title: 'ブログ | mirAIcafe',
        description: 'AI・プログラミングに関する最新情報やTips、学習方法をお届けするmirAIcafeの公式ブログです。',
        keywords: ['AIブログ', 'プログラミング', 'Tips', 'mirAIcafe'],
        canonicalUrl: `${baseUrl}/blog`
      }
    
    case 'contact':
      return {
        title: 'お問い合わせ | mirAIcafe',
        description: 'mirAIcafeへのお問い合わせはこちら。講座に関するご質問、法人研修のご相談など、お気軽にお問い合わせください。',
        keywords: ['お問い合わせ', 'mirAIcafe', '講座', '相談'],
        canonicalUrl: `${baseUrl}/contact`
      }
    
    default:
      return {
        title: 'mirAIcafe - カフェで学ぶAI',
        description: 'mirAIcafeは、AI・プログラミングを学べる新しいスタイルの学習カフェです。',
        keywords: ['AI', 'プログラミング', 'mirAIcafe'],
        canonicalUrl: baseUrl
      }
  }
}

// 構造化データを生成
export function generateStructuredData(pageType: string, pageData?: any): object {
  const baseUrl = 'https://miraicafe.work'
  
  // 組織の基本情報
  const organization = {
    '@type': 'Organization',
    name: 'mirAIcafe',
    url: baseUrl,
    logo: `${baseUrl}/static/logo.png`,
    sameAs: [
      'https://twitter.com/miraicafe',
      'https://www.instagram.com/miraicafe'
    ]
  }

  switch (pageType) {
    case 'home':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'mirAIcafe',
        url: baseUrl,
        description: 'AI・プログラミングを学べる新しいスタイルの学習カフェ',
        publisher: organization
      }
    
    case 'course':
      if (pageData) {
        return {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: pageData.title,
          description: pageData.description,
          provider: organization,
          offers: {
            '@type': 'Offer',
            price: pageData.price,
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock'
          },
          courseMode: 'online',
          educationalLevel: pageData.level
        }
      }
      return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '講座一覧',
        itemListElement: []
      }
    
    case 'blog':
      if (pageData) {
        return {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: pageData.title,
          description: pageData.excerpt,
          author: {
            '@type': 'Person',
            name: pageData.author || 'mirAIcafe'
          },
          publisher: organization,
          datePublished: pageData.date,
          image: pageData.image
        }
      }
      return {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'mirAIcafeブログ',
        description: 'AI・プログラミングに関する情報を発信',
        publisher: organization
      }
    
    default:
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'mirAIcafe',
        url: baseUrl
      }
  }
}

// メタタグHTMLを生成
export function generateMetaTags(seoData: SEOData, structuredData?: object): string {
  const tags: string[] = []
  
  // 基本メタタグ
  tags.push(`<meta name="description" content="${escapeHtml(seoData.description)}">`)
  
  if (seoData.keywords && seoData.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${escapeHtml(seoData.keywords.join(', '))}">`)
  }
  
  // OGPタグ
  tags.push(`<meta property="og:title" content="${escapeHtml(seoData.ogTitle || seoData.title)}">`)
  tags.push(`<meta property="og:description" content="${escapeHtml(seoData.ogDescription || seoData.description)}">`)
  tags.push(`<meta property="og:type" content="website">`)
  tags.push(`<meta property="og:site_name" content="mirAIcafe">`)
  
  if (seoData.canonicalUrl) {
    tags.push(`<meta property="og:url" content="${escapeHtml(seoData.canonicalUrl)}">`)
    tags.push(`<link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}">`)
  }
  
  // Twitterカード
  tags.push(`<meta name="twitter:card" content="summary_large_image">`)
  tags.push(`<meta name="twitter:title" content="${escapeHtml(seoData.ogTitle || seoData.title)}">`)
  tags.push(`<meta name="twitter:description" content="${escapeHtml(seoData.ogDescription || seoData.description)}">`)
  
  // 構造化データ
  if (structuredData) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`)
  }
  
  return tags.join('\n  ')
}

// HTMLエスケープ
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
