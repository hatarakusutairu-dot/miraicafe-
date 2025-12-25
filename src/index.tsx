import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-pages'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

// Pages
import { renderHomePage } from './pages/home'
import { renderCoursesPage, renderCourseDetailPage } from './pages/courses'
import { renderReservationPage } from './pages/reservation'
import { renderBlogPage, renderBlogPostPage } from './pages/blog'
import { renderContactPage } from './pages/contact'
import { renderPolicyPage, type Policy } from './pages/policy'
import { renderAINewsPage } from './pages/ai-news'
import { renderPortfolioListPage, renderPortfolioDetailPage } from './pages/portfolio'
import { renderTokushohoPage } from './pages/tokushoho'
import { render404Page } from './pages/not-found'

// Admin Pages
import { renderAdminLayout, renderLoginPage } from './admin/layout'
import { renderDashboard } from './admin/dashboard'
import { renderBlogList, renderBlogForm } from './admin/blog'
import { renderCoursesList, renderCourseForm } from './admin/courses'
import { renderReviewsList } from './admin/reviews'
import { renderContactsList, renderContactDetail } from './admin/contacts'
import { renderSEODashboard, renderSEOEditForm } from './admin/seo'
import { renderBookingsList, renderBookingDetail, type Booking } from './admin/bookings'
import { renderAINewsList, type AINews } from './admin/ai-news'
import { renderAIWriterPage } from './admin/ai-writer'
import { renderAICourseGeneratorPage } from './admin/ai-course-generator'
import { renderPoliciesList, renderPolicyEditForm, type Policy as AdminPolicy } from './admin/policies'
import { renderPortfoliosList, renderPortfolioForm, type Portfolio } from './admin/portfolios'
import { renderAIPortfolioGeneratorPage } from './admin/ai-portfolio-generator'
import { renderCommentsList, type Comment } from './admin/comments'
import { renderSurveyDashboard, renderSurveyQuestions, renderSurveyResponses, renderSurveySettings } from './admin/surveys'
import { renderSurveyPage } from './pages/survey'

// Services
import { 
  sendContactNotificationToAdmin,
  sendReservationNotificationToAdmin,
  sendReservationConfirmationToCustomer,
  sendReviewNotificationToAdmin
} from './services/email'
import { 
  generateSEOSuggestions, 
  getDefaultSEOData,
  type PageContent 
} from './services/seo'
import { collectAINews } from './services/ai-news-collector'

// Data
import { courses, blogPosts, schedules, portfolios } from './data'

// Types
type Bindings = {
  DB: D1Database
  R2_BUCKET: R2Bucket
  RESEND_API_KEY?: string
  GEMINI_API_KEY?: string
  UNSPLASH_ACCESS_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API
app.use('/api/*', cors())
app.use('/admin/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// sitemap.xml and robots.txt (root level)
app.get('/sitemap.xml', (c) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://miraicafe.work/</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/courses</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/reservation</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/blog</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/portfolio</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/ai-news</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/contact</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/privacy-policy</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/terms</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://miraicafe.work/tokushoho</loc>
    <lastmod>2025-12-25</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`
  return c.text(sitemap, 200, { 'Content-Type': 'application/xml' })
})

app.get('/robots.txt', (c) => {
  const robots = `User-agent: *
Allow: /

# 管理画面はクロール禁止
Disallow: /admin/
Disallow: /admin

# APIはクロール禁止
Disallow: /api/

# サイトマップ
Sitemap: https://miraicafe.work/sitemap.xml`
  return c.text(robots, 200, { 'Content-Type': 'text/plain' })
})

// ===== Pages =====

// Home（DBと静的データをマージ）
app.get('/', async (c) => {
  const allCourses = await getAllCoursesForFront(c.env.DB)
  const allPosts = await getAllBlogPosts(c.env.DB)
  
  // DBからポートフォリオを取得（公開中のみ）
  let allPortfolios: any[] = [...portfolios] // 静的データをベースに
  try {
    const dbPortfolios = await c.env.DB.prepare(`
      SELECT * FROM portfolios WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC LIMIT 6
    `).all()
    
    if (dbPortfolios.results && dbPortfolios.results.length > 0) {
      // DBのデータを静的データの形式に変換
      const convertedPortfolios = dbPortfolios.results.map((p: any) => ({
        id: p.slug || `db-${p.id}`,
        title: p.title,
        description: p.description || '',
        image: p.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60',
        technologies: JSON.parse(p.technologies || '[]'),
        demoUrl: p.demo_url || p.live_url,
        githubUrl: p.github_url,
        category: p.category || 'Webアプリ',
        // DB専用フィールド
        demo_type: p.demo_type,
        video_url: p.video_url,
        images: p.images,
        content: p.content
      }))
      // DBデータと静的データを結合（DBデータを優先）
      allPortfolios = convertedPortfolios
    }
  } catch (e) {
    console.log('Portfolio fetch error, using static data:', e)
  }
  
  return c.html(renderHomePage(allCourses.slice(0, 3), allPosts.slice(0, 5), allPortfolios))
})

// Courses（DBと静的データをマージ）
app.get('/courses', async (c) => {
  const allCourses = await getAllCoursesForFront(c.env.DB)
  return c.html(renderCoursesPage(allCourses))
})

app.get('/courses/:id', async (c) => {
  const id = c.req.param('id')
  const allCourses = await getAllCoursesForFront(c.env.DB)
  const course = allCourses.find((c: any) => c.id === id)
  if (!course) return c.notFound()
  return c.html(renderCourseDetailPage(course, schedules, allCourses))
})

// Reservation（DBと静的データをマージ）
app.get('/reservation', async (c) => {
  const courseId = c.req.query('course')
  const allCourses = await getAllCoursesForFront(c.env.DB)
  const course = courseId ? allCourses.find((c: any) => c.id === courseId) : null
  return c.html(renderReservationPage(allCourses, schedules, course))
})

// Blog（DBと静的データをマージ）
app.get('/blog', async (c) => {
  const allPosts = await getAllBlogPosts(c.env.DB)
  return c.html(renderBlogPage(allPosts))
})

app.get('/blog/:id', async (c) => {
  const id = c.req.param('id')
  const post = await getBlogPostById(c.env.DB, id)
  if (!post) return c.notFound()
  const allPosts = await getAllBlogPosts(c.env.DB)
  const allCourses = await getAllCoursesForFront(c.env.DB)
  
  // 承認済みコメントを取得
  let comments: any[] = []
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM comments 
      WHERE post_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `).bind(id).all()
    comments = result.results || []
  } catch (e) {
    // テーブルがない場合はスキップ
  }
  
  return c.html(renderBlogPostPage(post, allPosts, allCourses.slice(0, 3), comments))
})

// Contact
app.get('/contact', (c) => {
  return c.html(renderContactPage())
})

// Policy Pages (Terms, Privacy, Cancellation)
app.get('/terms', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM policies WHERE id = ?').bind('terms').first<Policy>()
    return c.html(renderPolicyPage(result, 'terms'))
  } catch (error) {
    return c.html(renderPolicyPage(null, 'terms'))
  }
})

app.get('/privacy', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM policies WHERE id = ?').bind('privacy').first<Policy>()
    return c.html(renderPolicyPage(result, 'privacy'))
  } catch (error) {
    return c.html(renderPolicyPage(null, 'privacy'))
  }
})

app.get('/cancellation-policy', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM policies WHERE id = ?').bind('cancellation').first<Policy>()
    return c.html(renderPolicyPage(result, 'cancellation'))
  } catch (error) {
    return c.html(renderPolicyPage(null, 'cancellation'))
  }
})

// 特定商取引法に基づく表記
app.get('/tokushoho', (c) => {
  return c.html(renderTokushohoPage())
})

// AI News Page
app.get('/ai-news', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, title, url, summary, source, published_at, 
             category, original_language, is_translated, image_url, image_source
      FROM ai_news 
      WHERE status = 'approved'
      ORDER BY published_at DESC, created_at DESC
      LIMIT 100
    `).all()
    
    return c.html(renderAINewsPage(result.results || []))
  } catch (error) {
    console.error('AI News page error:', error)
    return c.html(renderAINewsPage([]))
  }
})

// Portfolio（ポートフォリオ一覧・詳細）
app.get('/portfolio', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM portfolios WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC
    `).all()
    
    // DBにデータがある場合はDBデータを使用、なければ静的データを使用
    if (result.results && result.results.length > 0) {
      return c.html(renderPortfolioListPage(result.results as any[]))
    } else {
      // 静的データをDB形式に変換
      const staticPortfolios = portfolios.map(p => ({
        id: 0,
        title: p.title,
        slug: p.id,
        description: p.description,
        category: p.category,
        thumbnail: p.image,
        demo_type: 'link',
        demo_url: p.demoUrl,
        github_url: p.githubUrl,
        live_url: null,
        video_url: null,
        images: '[]',
        technologies: JSON.stringify(p.technologies),
        content: null,
        duration: null,
        client: null,
        role: null,
        status: 'published',
        meta_description: null,
        keywords: null,
        created_at: new Date().toISOString()
      }))
      return c.html(renderPortfolioListPage(staticPortfolios))
    }
  } catch (error) {
    console.error('Portfolio page error:', error)
    // エラー時も静的データを使用
    const staticPortfolios = portfolios.map(p => ({
      id: 0,
      title: p.title,
      slug: p.id,
      description: p.description,
      category: p.category,
      thumbnail: p.image,
      demo_type: 'link',
      demo_url: p.demoUrl,
      github_url: p.githubUrl,
      live_url: null,
      video_url: null,
      images: '[]',
      technologies: JSON.stringify(p.technologies),
      content: null,
      duration: null,
      client: null,
      role: null,
      status: 'published',
      meta_description: null,
      keywords: null,
      created_at: new Date().toISOString()
    }))
    return c.html(renderPortfolioListPage(staticPortfolios))
  }
})

app.get('/portfolio/:slug', async (c) => {
  const slug = c.req.param('slug')
  try {
    // まずDBから検索
    const portfolio = await c.env.DB.prepare(`
      SELECT * FROM portfolios WHERE slug = ? AND status = 'published'
    `).bind(slug).first()
    
    if (portfolio) {
      // DBにある場合
      const related = await c.env.DB.prepare(`
        SELECT * FROM portfolios 
        WHERE status = 'published' AND id != ? 
        ORDER BY category = ? DESC, created_at DESC 
        LIMIT 3
      `).bind(portfolio.id, portfolio.category).all()
      
      const allCourses = await getAllCoursesForFront(c.env.DB)
      return c.html(renderPortfolioDetailPage(portfolio as any, related.results as any[] || [], allCourses.slice(0, 3)))
    }
    
    // 静的データから検索
    const staticPortfolio = portfolios.find(p => p.id === slug)
    if (!staticPortfolio) return c.notFound()
    
    // 静的データをDB形式に変換
    const convertedPortfolio = {
      id: 0,
      title: staticPortfolio.title,
      slug: staticPortfolio.id,
      description: staticPortfolio.description,
      category: staticPortfolio.category,
      thumbnail: staticPortfolio.image,
      demo_type: 'link',
      demo_url: staticPortfolio.demoUrl,
      github_url: staticPortfolio.githubUrl,
      live_url: null,
      video_url: null,
      images: '[]',
      technologies: JSON.stringify(staticPortfolio.technologies),
      content: null,
      duration: null,
      client: null,
      role: null,
      status: 'published',
      meta_description: null,
      keywords: null,
      created_at: new Date().toISOString()
    }
    
    // 関連ポートフォリオ（静的データから）
    const relatedStatic = portfolios
      .filter(p => p.id !== slug && p.category === staticPortfolio.category)
      .slice(0, 3)
      .map(p => ({
        id: 0,
        title: p.title,
        slug: p.id,
        description: p.description,
        category: p.category,
        thumbnail: p.image,
        demo_type: 'link',
        demo_url: p.demoUrl,
        github_url: p.githubUrl,
        live_url: null,
        video_url: null,
        images: '[]',
        technologies: JSON.stringify(p.technologies),
        content: null,
        duration: null,
        client: null,
        role: null,
        status: 'published',
        meta_description: null,
        keywords: null,
        created_at: new Date().toISOString()
      }))
    
    const allCourses = await getAllCoursesForFront(c.env.DB)
    return c.html(renderPortfolioDetailPage(convertedPortfolio, relatedStatic, allCourses.slice(0, 3)))
  } catch (error) {
    console.error('Portfolio detail error:', error)
    
    // エラー時も静的データで試行
    const staticPortfolio = portfolios.find(p => p.id === slug)
    if (!staticPortfolio) return c.notFound()
    
    const convertedPortfolio = {
      id: 0,
      title: staticPortfolio.title,
      slug: staticPortfolio.id,
      description: staticPortfolio.description,
      category: staticPortfolio.category,
      thumbnail: staticPortfolio.image,
      demo_type: 'link',
      demo_url: staticPortfolio.demoUrl,
      github_url: staticPortfolio.githubUrl,
      live_url: null,
      video_url: null,
      images: '[]',
      technologies: JSON.stringify(staticPortfolio.technologies),
      content: null,
      duration: null,
      client: null,
      role: null,
      status: 'published',
      meta_description: null,
      keywords: null,
      created_at: new Date().toISOString()
    }
    
    return c.html(renderPortfolioDetailPage(convertedPortfolio, [], []))
  }
})

// ===== API Endpoints =====

// Get courses
app.get('/api/courses', (c) => {
  return c.json(courses)
})

// ===== コメント API =====

// コメント投稿（承認待ち）
app.post('/api/comments', async (c) => {
  try {
    const { post_id, author_name, content } = await c.req.json<{
      post_id: string
      author_name: string
      content: string
    }>()

    // バリデーション
    if (!post_id || !author_name || !content) {
      return c.json({ success: false, error: '必須項目が入力されていません' }, 400)
    }

    if (author_name.length > 50) {
      return c.json({ success: false, error: 'お名前は50文字以内で入力してください' }, 400)
    }

    if (content.length > 2000) {
      return c.json({ success: false, error: 'コメントは2000文字以内で入力してください' }, 400)
    }

    // コメント保存（承認待ち状態）
    await c.env.DB.prepare(`
      INSERT INTO comments (post_id, author_name, content, status, created_at)
      VALUES (?, ?, ?, 'pending', datetime('now'))
    `).bind(post_id, author_name.trim(), content.trim()).run()

    return c.json({ 
      success: true, 
      message: 'コメントを送信しました。承認後に表示されます。' 
    })
  } catch (error) {
    console.error('Comment submission error:', error)
    return c.json({ success: false, error: 'コメントの送信に失敗しました' }, 500)
  }
})

// 承認済みコメント取得
app.get('/api/comments/:postId', async (c) => {
  try {
    const postId = c.req.param('postId')
    const result = await c.env.DB.prepare(`
      SELECT id, author_name, content, created_at, admin_reply, admin_reply_at
      FROM comments 
      WHERE post_id = ? AND status = 'approved'
      ORDER BY created_at DESC
    `).bind(postId).all()

    return c.json({ success: true, comments: result.results || [] })
  } catch (error) {
    return c.json({ success: true, comments: [] })
  }
})

// ===== 講座推薦チャットボットAPI =====
app.post('/api/chat/course-recommendation', async (c) => {
  const { message, conversation_history } = await c.req.json<{
    message: string
    conversation_history?: Array<{ role: string; parts: Array<{ text: string }> }>
  }>()

  if (!c.env.GEMINI_API_KEY) {
    return c.json({ success: false, error: 'GEMINI_API_KEY is not configured' }, 500)
  }

  try {
    // DBから公開中の講座を取得
    let dbCourses: any[] = []
    try {
      const result = await c.env.DB.prepare(`
        SELECT id, title, catchphrase, description, category, level, price, duration, image
        FROM courses
        WHERE status = 'published'
        ORDER BY created_at DESC
      `).all()
      dbCourses = result.results || []
    } catch (e) {
      console.error('DB courses fetch error:', e)
    }

    // 静的講座データとマージ
    const allCourses = [
      ...courses.map(c => ({
        id: c.id,
        title: c.title,
        catchphrase: c.catchphrase || '',
        description: c.description,
        category: c.category,
        level: c.level,
        price: c.price,
        duration: c.duration
      })),
      ...dbCourses
    ]

    // プロンプト設計（簡素化版: 2-3ステップで推薦）
    const systemPrompt = `
あなたはmirAIcafeのAI講座推薦アシスタント「mion」です。
できるだけ早く、ユーザーに最適な講座を推薦してください。

【会話の流れ（最大2-3ステップ）】

**ステップ1: 初回質問（1つの質問で複数情報を取得）**
- ユーザーの目的 + AIレベル + 興味のある内容を一度に聞く
- 例: 「どんな場面でAIを使いたいですか？また、AIを使ったことはありますか？」

**ステップ2: 仮おすすめを即座に提示**
- 初回の回答だけで、2-3件の講座を推薦
- 「とりあえずこの講座がおすすめです！もっと知りたければ教えてくださいね」というスタンス

**ステップ3（オプション）: 追加質問**
- ユーザーが「もっと絞り込みたい」と言った場合のみ、予算・期間などを確認
- ユーザーが満足していれば、ここで終了

【会話のトーン】
- 親しみやすく、カフェで話すような口調
- 専門用語は避け、わかりやすく
- 「〜ですね」「〜しましょう」など柔らかい表現
- 絵文字を適度に使用（😊、🎯、💡、☕など）

【利用可能な講座データ】
${JSON.stringify(allCourses, null, 2)}

【重要な応答ルール】
必ず以下のJSON形式で応答してください。

1. 初回質問（1つの質問で複数情報を取得）:
{
  "message": "質問内容",
  "options": ["選択肢1", "選択肢2"],
  "should_continue": true
}

2. 仮おすすめを即座に提示（2-3件）:
{
  "message": "あなたにはこの講座がおすすめです！気になるものがあれば、詳細をチェックしてみてくださいね☕️",
  "recommended_courses": [
    {"id": "講座ID", "title": "講座タイトル", "reason": "おすすめ理由（50文字程度）"}
  ],
  "has_more_options": true,
  "should_continue": false
}

3. 追加質問（ユーザーが絞り込み希望時のみ）:
{
  "message": "もっと詳しく教えてください！",
  "options": ["予算は1万円以内", "予算は1万円以上OK", "短期間で学びたい", "じっくり学びたい"],
  "should_continue": true
}

4. 最終推薦（追加条件で絞り込み後）:
{
  "message": "条件に合った講座はこちらです！",
  "recommended_courses": [...],
  "has_more_options": false,
  "should_continue": false
}

【重要な指示】
- 最優先: 早くおすすめを出す（初回の回答後、すぐに2-3件推薦）
- 質問は最小限（1つの質問で複数情報を取得）
- 選択肢は4つ以内
- 推薦理由は簡潔（50文字程度）
- 追加質問はオプション（ユーザーが満足していれば終了）
- 避けるべき: 目的→レベル→内容→予算→期間のような段階的な質問
- JSONのみを返す（説明文は含めない）
`

    // Gemini APIリクエスト
    const conversationHistoryText = (conversation_history || [])
      .map(h => `${h.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${h.parts[0].text}`)
      .join('\n')

    const fullPrompt = `${systemPrompt}

【これまでの会話】
${conversationHistoryText || 'なし（最初の会話）'}

【ユーザーの最新メッセージ】
${message}

【応答】
JSON形式で応答してください:`

    // Gemini API呼び出し
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro']
    let responseText = ''
    let success = false

    for (const modelName of models) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${c.env.GEMINI_API_KEY}`
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024
            }
          })
        })

        if (response.ok) {
          const data = await response.json() as any
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          if (responseText) {
            success = true
            break
          }
        }
      } catch (e) {
        console.error('[講座推薦チャット] ' + modelName + ' error:', e)
      }
    }

    if (!success) {
      return c.json({
        success: false,
        error: 'AI応答の生成に失敗しました'
      }, 500)
    }

    // JSONパース
    let parsedResponse: any
    try {
      // JSON部分を抽出
      let jsonStr = responseText
      const jsonBlockMatch = responseText.match(/```json\s*([\s\S]*?)```/)
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[1]
      } else {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          jsonStr = jsonMatch[0]
        }
      }
      parsedResponse = JSON.parse(jsonStr)
    } catch (e) {
      // JSONパースに失敗した場合は、テキストをそのまま返す
      parsedResponse = {
        message: responseText.replace(/```json|json```|```/g, '').trim(),
        should_continue: true
      }
    }

    // 会話履歴を更新
    const updatedHistory = [
      ...(conversation_history || []),
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: parsedResponse.message }] }
    ]

    return c.json({
      success: true,
      response: parsedResponse,
      conversation_history: updatedHistory
    })

  } catch (error: any) {
    console.error('[講座推薦チャット] エラー:', error)
    return c.json({
      success: false,
      error: error.message || 'チャット処理中にエラーが発生しました'
    }, 500)
  }
})

// Get schedules
app.get('/api/schedules', (c) => {
  const courseId = c.req.query('course')
  const filtered = courseId 
    ? schedules.filter(s => s.courseId === courseId)
    : schedules
  return c.json(filtered)
})

// Create reservation
app.post('/api/reservations', async (c) => {
  const body = await c.req.json()
  const { courseId, scheduleId, name, email, phone } = body
  
  // Validate
  if (!courseId || !scheduleId || !name || !email) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  // 講座情報を取得
  const course = courses.find(c => c.id === courseId)
  const schedule = schedules.find(s => s.id === scheduleId)
  
  const reservation = {
    id: `res_${Date.now()}`,
    courseId,
    scheduleId,
    name,
    email,
    phone,
    status: 'pending_payment',
    createdAt: new Date().toISOString()
  }
  
  // メール通知データを準備
  if (course && schedule) {
    const reservationEmailData = {
      name,
      email,
      phone,
      courseName: course.title,
      courseId: course.id,
      scheduleDate: schedule.date,
      scheduleTime: `${schedule.startTime} - ${schedule.endTime}`,
      location: schedule.location,
      price: course.price,
      reservationId: reservation.id
    }
    
    // 管理者への通知（非同期・ノンブロッキング）
    sendReservationNotificationToAdmin(c.env, reservationEmailData)
      .catch(err => console.error('Failed to send reservation notification to admin:', err))
    
    // 予約者への確認メール（非同期・ノンブロッキング）
    sendReservationConfirmationToCustomer(c.env, reservationEmailData)
      .catch(err => console.error('Failed to send reservation confirmation to customer:', err))
  }
  
  return c.json({ success: true, reservation })
})

// Stripe Checkout Session
app.post('/api/create-checkout-session', async (c) => {
  const body = await c.req.json()
  const { courseId, reservationId, successUrl, cancelUrl } = body
  
  const course = courses.find(c => c.id === courseId)
  if (!course) {
    return c.json({ error: 'Course not found' }, 404)
  }
  
  // In production, this would create a real Stripe checkout session
  // For demo, we return a mock session
  const checkoutSession = {
    id: `cs_demo_${Date.now()}`,
    url: `${successUrl}?session_id=demo_session&reservation_id=${reservationId}`,
    amount: course.price,
    currency: 'jpy',
    course: course.title
  }
  
  return c.json(checkoutSession)
})

// Contact form submission - Save to D1 database
app.post('/api/contacts', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, phone, type, subject, message } = body

    // Validation errors object
    const errors: Record<string, string> = {}

    // Name validation (required, max 50 chars)
    if (!name || name.trim() === '') {
      errors.name = 'お名前は必須です'
    } else if (name.length > 50) {
      errors.name = 'お名前は50文字以内で入力してください'
    }

    // Email validation (required, format check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || email.trim() === '') {
      errors.email = 'メールアドレスは必須です'
    } else if (!emailRegex.test(email)) {
      errors.email = '有効なメールアドレスを入力してください'
    }

    // Phone validation (optional, format check if provided)
    if (phone && phone.trim() !== '') {
      const phoneRegex = /^[0-9-+()\s]+$/
      if (!phoneRegex.test(phone)) {
        errors.phone = '有効な電話番号を入力してください'
      }
    }

    // Type validation (required, must be valid option)
    const validTypes = ['講座について', '予約について', '法人研修のご相談', 'その他']
    if (!type || type.trim() === '') {
      errors.type = 'お問い合わせ種別を選択してください'
    } else if (!validTypes.includes(type)) {
      errors.type = '有効なお問い合わせ種別を選択してください'
    }

    // Subject validation (required, max 100 chars)
    if (!subject || subject.trim() === '') {
      errors.subject = '件名は必須です'
    } else if (subject.length > 100) {
      errors.subject = '件名は100文字以内で入力してください'
    }

    // Message validation (required, max 1000 chars)
    if (!message || message.trim() === '') {
      errors.message = 'お問い合わせ内容は必須です'
    } else if (message.length > 1000) {
      errors.message = 'お問い合わせ内容は1000文字以内で入力してください'
    }

    // Return validation errors if any
    if (Object.keys(errors).length > 0) {
      return c.json({ error: 'バリデーションエラー', errors }, 400)
    }

    // Insert into database
    await c.env.DB.prepare(`
      INSERT INTO contacts (name, email, phone, type, subject, message, status)
      VALUES (?, ?, ?, ?, ?, ?, 'new')
    `).bind(
      name.trim(),
      email.trim(),
      phone ? phone.trim() : null,
      type.trim(),
      subject.trim(),
      message.trim()
    ).run()

    // Send email notification to admin (non-blocking)
    sendContactNotificationToAdmin(c.env, {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : undefined,
      type: type.trim(),
      subject: subject.trim(),
      message: message.trim()
    }).catch(err => console.error('Failed to send contact notification email:', err))

    return c.json({ 
      success: true, 
      message: 'お問い合わせありがとうございます。2営業日以内に返信いたします。' 
    })
  } catch (error) {
    console.error('Error saving contact:', error)
    return c.json({ error: 'お問い合わせの送信に失敗しました。もう一度お試しください。' }, 500)
  }
})

// Blog posts API
app.get('/api/blog', (c) => {
  return c.json(blogPosts)
})

// AI News API
app.get('/api/ai-news', async (c) => {
  const limit = parseInt(c.req.query('limit') || '5')
  const status = c.req.query('status') || 'approved'
  
  try {
    const news = await c.env.DB.prepare(`
      SELECT id, title, url, summary, source, published_at, status, created_at,
             category, original_language, is_translated, image_url, image_source
      FROM ai_news 
      WHERE status = ?
      ORDER BY published_at DESC, created_at DESC
      LIMIT ?
    `).bind(status, limit).all()
    
    return c.json(news.results || [])
  } catch (error) {
    console.error('Error fetching AI news:', error)
    return c.json([])
  }
})

// ===== Reviews API =====

// Get reviews for a course (only approved ones)
app.get('/api/reviews/:courseId', async (c) => {
  const courseId = c.req.param('courseId')
  const page = parseInt(c.req.query('page') || '1')
  const limit = 10
  const offset = (page - 1) * limit

  try {
    // Get approved reviews with pagination
    const reviews = await c.env.DB.prepare(`
      SELECT id, course_id, reviewer_name, rating, comment, created_at
      FROM reviews 
      WHERE course_id = ? AND status = 'approved'
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(courseId, limit, offset).all()

    // Get total count
    const countResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM reviews 
      WHERE course_id = ? AND status = 'approved'
    `).bind(courseId).first()

    // Get rating stats
    const statsResult = await c.env.DB.prepare(`
      SELECT 
        AVG(rating) as average,
        COUNT(*) as total,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as star5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as star4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as star3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as star2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as star1
      FROM reviews 
      WHERE course_id = ? AND status = 'approved'
    `).bind(courseId).first()

    const total = (countResult as any)?.total || 0
    const totalPages = Math.ceil(total / limit)

    return c.json({
      reviews: reviews.results,
      stats: {
        average: statsResult ? Math.round((statsResult as any).average * 10) / 10 : 0,
        total: (statsResult as any)?.total || 0,
        distribution: {
          5: (statsResult as any)?.star5 || 0,
          4: (statsResult as any)?.star4 || 0,
          3: (statsResult as any)?.star3 || 0,
          2: (statsResult as any)?.star2 || 0,
          1: (statsResult as any)?.star1 || 0
        }
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return c.json({ 
      reviews: [], 
      stats: { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false }
    })
  }
})

// Post a new review
app.post('/api/reviews', async (c) => {
  try {
    const body = await c.req.json()
    const { courseId, reviewerName, reviewerEmail, rating, comment } = body

    // Validation
    if (!courseId || !reviewerName || !reviewerEmail || !rating || !comment) {
      return c.json({ error: '必須項目を入力してください' }, 400)
    }

    if (rating < 1 || rating > 5) {
      return c.json({ error: '評価は1〜5で選択してください' }, 400)
    }

    if (comment.length > 500) {
      return c.json({ error: 'コメントは500文字以内で入力してください' }, 400)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(reviewerEmail)) {
      return c.json({ error: '有効なメールアドレスを入力してください' }, 400)
    }

    // Insert review (status defaults to 'pending')
    await c.env.DB.prepare(`
      INSERT INTO reviews (course_id, reviewer_name, reviewer_email, rating, comment, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).bind(courseId, reviewerName, reviewerEmail, rating, comment).run()

    // 講座名を取得
    const course = courses.find(c => c.id === courseId)
    const courseName = course ? course.title : courseId

    // 管理者への口コミ通知メール（非同期・ノンブロッキング）
    sendReviewNotificationToAdmin(c.env, {
      courseId,
      courseName,
      reviewerName,
      reviewerEmail,
      rating,
      comment
    }).catch(err => console.error('Failed to send review notification email:', err))

    return c.json({ 
      success: true, 
      message: 'レビューを投稿いただきありがとうございます。承認後に表示されます。' 
    })
  } catch (error) {
    console.error('Error posting review:', error)
    return c.json({ error: 'レビューの投稿に失敗しました。もう一度お試しください。' }, 500)
  }
})

// ===== Admin Routes =====

// セッション管理用（簡易実装：本番ではKV等を使用）
const adminSessions = new Map<string, { email: string; expiresAt: number }>()
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24時間

function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

function validateSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false
  const session = adminSessions.get(sessionId)
  if (!session) return false
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(sessionId)
    return false
  }
  return true
}

// 認証ミドルウェア
app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  
  // ログインページは認証不要
  if (path === '/admin/login') {
    return next()
  }
  
  const sessionId = getCookie(c, 'admin_session')
  
  if (!validateSession(sessionId)) {
    return c.redirect('/admin/login')
  }
  
  return next()
})

// ログインページ
app.get('/admin/login', (c) => {
  const sessionId = getCookie(c, 'admin_session')
  if (validateSession(sessionId)) {
    return c.redirect('/admin')
  }
  return c.html(renderLoginPage())
})

// ログイン処理
app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody()
  const email = body.email as string
  const password = body.password as string
  
  // 環境変数から認証情報を取得（デフォルト値あり）
  const adminEmail = (c.env as any)?.ADMIN_EMAIL || 'ai.career@miraicafe.work'
  const adminPassword = (c.env as any)?.ADMIN_PASSWORD || 'admin123'
  
  if (email === adminEmail && password === adminPassword) {
    const sessionId = generateSessionId()
    adminSessions.set(sessionId, {
      email,
      expiresAt: Date.now() + SESSION_DURATION
    })
    
    // 本番環境ではSecure、開発環境では無効
    const isProduction = c.req.url.startsWith('https://')
    setCookie(c, 'admin_session', sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Lax',
      path: '/admin',
      maxAge: SESSION_DURATION / 1000
    })
    
    return c.redirect('/admin')
  }
  
  return c.html(renderLoginPage('メールアドレスまたはパスワードが違います'))
})

// ログアウト処理
app.post('/admin/logout', (c) => {
  const sessionId = getCookie(c, 'admin_session')
  if (sessionId) {
    adminSessions.delete(sessionId)
    deleteCookie(c, 'admin_session', { path: '/admin' })
  }
  return c.redirect('/admin/login')
})

// ダッシュボード
app.get('/admin', async (c) => {
  try {
    // 統計データを取得
    const reviewsResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        AVG(rating) as avgRating
      FROM reviews
    `).first()
    
    const contactsResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new
      FROM contacts
    `).first()
    
    // 予約統計を取得
    const bookingsResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
      FROM bookings
    `).first()
    
    // 最近のお問い合わせ
    const recentContacts = await c.env.DB.prepare(`
      SELECT id, name, type, subject, status, created_at
      FROM contacts
      ORDER BY created_at DESC
      LIMIT 5
    `).all()
    
    // 承認待ち口コミ
    const pendingReviews = await c.env.DB.prepare(`
      SELECT id, course_id, reviewer_name, rating, comment, created_at
      FROM reviews
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 5
    `).all()
    
    // 最近の予約
    const recentBookings = await c.env.DB.prepare(`
      SELECT b.id, b.customer_name, c.title as course_name, b.preferred_date, b.status, b.created_at
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `).all()
    
    // サイト実績設定を取得
    let siteStats = null
    try {
      siteStats = await c.env.DB.prepare(`SELECT * FROM site_stats WHERE id = 'main'`).first()
    } catch (e) {
      // テーブルがなければスキップ
    }
    
    // 予約からの受講生数（ユニーク顧客数）を自動カウント
    let studentCountAuto = 0
    try {
      const uniqueCustomers = await c.env.DB.prepare(`
        SELECT COUNT(DISTINCT customer_email) as count 
        FROM bookings 
        WHERE status IN ('confirmed', 'completed')
      `).first()
      studentCountAuto = (uniqueCustomers as any)?.count || 0
    } catch (e) {
      // テーブルがなければスキップ
    }
    
    const stats = {
      courses: courses.length,
      blogs: blogPosts.length,
      reviews: {
        total: (reviewsResult as any)?.total || 0,
        pending: (reviewsResult as any)?.pending || 0,
        avgRating: (reviewsResult as any)?.avgRating || 0
      },
      contacts: {
        total: (contactsResult as any)?.total || 0,
        new: (contactsResult as any)?.new || 0
      },
      bookings: {
        total: (bookingsResult as any)?.total || 0,
        pending: (bookingsResult as any)?.pending || 0,
        confirmed: (bookingsResult as any)?.confirmed || 0
      }
    }
    
    const recent = {
      contacts: recentContacts.results as any[],
      reviews: pendingReviews.results as any[],
      bookings: recentBookings.results as any[]
    }
    
    return c.html(renderDashboard(stats, recent, siteStats as any, studentCountAuto))
  } catch (error) {
    console.error('Dashboard error:', error)
    // データベースエラー時はデフォルト値で表示
    const stats = {
      courses: courses.length,
      blogs: blogPosts.length,
      reviews: { total: 0, pending: 0, avgRating: 0 },
      contacts: { total: 0, new: 0 },
      bookings: { total: 0, pending: 0, confirmed: 0 }
    }
    const recent = { contacts: [], reviews: [], bookings: [] }
    return c.html(renderDashboard(stats, recent, null as any, 0))
  }
})

// ===== ブログ管理 =====

// D1とstaticデータを統合してブログ記事を取得
async function getAllBlogPosts(db: D1Database): Promise<any[]> {
  try {
    // D1からブログ記事を取得
    const dbPosts = await db.prepare(`
      SELECT id, title, excerpt, content, author, date, category, tags, image, read_time as readTime
      FROM blog_posts
      WHERE status = 'published'
      ORDER BY date DESC
    `).all()
    
    // D1のデータをBlogPost形式に変換
    const d1Posts = (dbPosts.results || []).map((post: any) => ({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : []
    }))
    
    // 静的データとD1データをマージ（D1のIDが優先）
    const d1Ids = new Set(d1Posts.map((p: any) => p.id))
    const staticPosts = blogPosts.filter(p => !d1Ids.has(p.id))
    
    return [...d1Posts, ...staticPosts]
  } catch (error) {
    console.error('Error fetching blog posts from D1:', error)
    return blogPosts
  }
}

// D1からブログ記事を取得（ID指定）
async function getBlogPostById(db: D1Database, id: string): Promise<any | null> {
  try {
    const post = await db.prepare(`
      SELECT id, title, excerpt, content, author, date, category, tags, image, read_time as readTime
      FROM blog_posts WHERE id = ?
    `).bind(id).first()
    
    if (post) {
      return {
        ...post,
        tags: (post as any).tags ? JSON.parse((post as any).tags) : []
      }
    }
    
    // D1にない場合は静的データから探す
    return blogPosts.find(p => p.id === id) || null
  } catch (error) {
    console.error('Error fetching blog post from D1:', error)
    return blogPosts.find(p => p.id === id) || null
  }
}

app.get('/admin/blog', async (c) => {
  const posts = await getAllBlogPosts(c.env.DB)
  return c.html(renderBlogList(posts))
})

app.get('/admin/blog/new', (c) => {
  return c.html(renderBlogForm())
})

app.get('/admin/blog/edit/:id', async (c) => {
  const id = c.req.param('id')
  const post = await getBlogPostById(c.env.DB, id)
  if (!post) return c.notFound()
  return c.html(renderBlogForm(post))
})

// AI記事生成ページ
app.get('/admin/blog/ai-writer', (c) => {
  return c.html(renderAIWriterPage())
})

// AI講座生成ページ
app.get('/admin/courses/ai-generator', (c) => {
  return c.html(renderAICourseGeneratorPage())
})

// SEOスコア計算ヘルパー関数
function calculateSEOScore(title: string, content: string): number {
  let score = 0
  
  // タイトル文字数チェック
  const titleLength = title?.length || 0
  if (titleLength >= 30 && titleLength <= 60) {
    score += 30
  }
  
  // 数字の有無
  if (/\d/.test(title || '')) {
    score += 15
  }
  
  // キーワード密度
  if ((title || '').includes('AI') || (title || '').includes('ChatGPT') || (title || '').includes('初心者')) {
    score += 20
  }
  
  // 疑問形・具体性
  if ((title || '').includes('？') || (title || '').includes('方法') || (title || '').includes('完全ガイド')) {
    score += 15
  }
  
  // コンテンツ文字数
  const contentLength = content?.length || 0
  if (contentLength >= 1500) {
    score += 20
  } else if (contentLength >= 800) {
    score += 10
  }
  
  return Math.min(score, 100)
}

// ブログ作成
app.post('/admin/blog/create', async (c) => {
  try {
    const body = await c.req.parseBody()
    const id = generateBlogId(body.title as string)
    const tags = (body.tags as string || '').split(',').map(t => t.trim()).filter(t => t)
    
    // SEOスコア計算
    const seoScore = calculateSEOScore(body.title as string, body.content as string)
    
    await c.env.DB.prepare(`
      INSERT INTO blog_posts (id, title, excerpt, content, author, date, category, tags, image, read_time, meta_description, keywords, seo_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.title,
      body.excerpt || '',
      body.content,
      body.author || '',
      body.date || new Date().toISOString().split('T')[0],
      body.category,
      JSON.stringify(tags),
      body.image || '',
      body.readTime || '5分',
      body.meta_description || '',
      body.keywords || '',
      seoScore
    ).run()
    
    return c.redirect('/admin/blog')
  } catch (error) {
    console.error('Error creating blog post:', error)
    return c.html(renderBlogForm(undefined, '記事の作成に失敗しました。もう一度お試しください。'))
  }
})

// ブログ更新
app.post('/admin/blog/update/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.parseBody()
    const tags = (body.tags as string || '').split(',').map(t => t.trim()).filter(t => t)
    
    // SEOスコア計算
    const seoScore = calculateSEOScore(body.title as string, body.content as string)
    
    // まずD1に存在するか確認
    const existing = await c.env.DB.prepare(`SELECT id FROM blog_posts WHERE id = ?`).bind(id).first()
    
    if (existing) {
      // D1のレコードを更新
      await c.env.DB.prepare(`
        UPDATE blog_posts 
        SET title = ?, excerpt = ?, content = ?, author = ?, date = ?, category = ?, tags = ?, image = ?, read_time = ?, meta_description = ?, keywords = ?, seo_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.title,
        body.excerpt || '',
        body.content,
        body.author || '',
        body.date || new Date().toISOString().split('T')[0],
        body.category,
        JSON.stringify(tags),
        body.image || '',
        body.readTime || '5分',
        body.meta_description || '',
        body.keywords || '',
        seoScore,
        id
      ).run()
    } else {
      // 静的データからの編集 → D1に新規挿入
      await c.env.DB.prepare(`
        INSERT INTO blog_posts (id, title, excerpt, content, author, date, category, tags, image, read_time, meta_description, keywords, seo_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        body.title,
        body.excerpt || '',
        body.content,
        body.author || '',
        body.date || new Date().toISOString().split('T')[0],
        body.category,
        JSON.stringify(tags),
        body.image || '',
        body.readTime || '5分',
        body.meta_description || '',
        body.keywords || '',
        seoScore
      ).run()
    }
    
    return c.redirect('/admin/blog')
  } catch (error) {
    console.error('Error updating blog post:', error)
    const post = await getBlogPostById(c.env.DB, id)
    return c.html(renderBlogForm(post, '記事の更新に失敗しました。もう一度お試しください。'))
  }
})

// ブログ削除
app.post('/admin/blog/delete/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`DELETE FROM blog_posts WHERE id = ?`).bind(id).run()
    return c.redirect('/admin/blog')
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return c.redirect('/admin/blog')
  }
})

// ブログ投稿API（JSON）- AI記事生成用
app.post('/admin/api/blog-posts', async (c) => {
  try {
    const body = await c.req.json()
    const { title, content, excerpt, category, tags, meta_description, featured_image, status } = body
    
    if (!title || !content || !category) {
      return c.json({ error: 'タイトル、本文、カテゴリは必須です' }, 400)
    }
    
    const id = generateBlogId(title)
    const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : []
    
    // SEOスコア計算
    const seoScore = calculateSEOScore(title, content)
    
    await c.env.DB.prepare(`
      INSERT INTO blog_posts (id, title, excerpt, content, author, date, category, tags, image, read_time, meta_description, keywords, seo_score, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      title,
      excerpt || '',
      content,
      'AI Writer',
      new Date().toISOString().split('T')[0],
      category,
      JSON.stringify(tagsArray),
      featured_image || '',
      '5分',
      meta_description || '',
      tagsArray.join(', '),
      seoScore,
      status || 'draft'
    ).run()
    
    return c.json({ success: true, id, message: '記事を保存しました' })
  } catch (error) {
    console.error('Blog API create error:', error)
    return c.json({ error: '記事の保存に失敗しました' }, 500)
  }
})

// ブログIDを生成（タイトルからスラッグ生成）
function generateBlogId(title: string): string {
  const timestamp = Date.now().toString(36)
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  return `${slug || 'post'}-${timestamp}`
}

// ===== 講座管理 =====

// D1から全講座を取得
async function getAllCourses(db: D1Database): Promise<any[]> {
  try {
    const dbCourses = await db.prepare(`
      SELECT id, title, catchphrase, description, price, duration, level, category, image,
             instructor, instructor_title, instructor_bio, instructor_image,
             target_audience, curriculum, faq, gallery, features, includes,
             max_capacity, cancellation_policy, status,
             meta_description, keywords, seo_score
      FROM courses
      ORDER BY created_at DESC
    `).all()
    
    const d1Courses = (dbCourses.results || []).map((course: any) => ({
      id: course.id,
      title: course.title,
      catchphrase: course.catchphrase,
      description: course.description,
      price: course.price,
      duration: course.duration,
      level: course.level,
      category: course.category,
      image: course.image,
      instructor: course.instructor,
      instructorInfo: course.instructor_title || course.instructor_bio || course.instructor_image ? {
        title: course.instructor_title,
        bio: course.instructor_bio,
        image: course.instructor_image
      } : undefined,
      targetAudience: course.target_audience ? JSON.parse(course.target_audience) : [],
      curriculum: course.curriculum ? JSON.parse(course.curriculum) : [],
      faq: course.faq ? JSON.parse(course.faq) : [],
      gallery: course.gallery ? JSON.parse(course.gallery) : [],
      features: course.features ? JSON.parse(course.features) : [],
      includes: course.includes ? JSON.parse(course.includes) : [],
      maxCapacity: course.max_capacity,
      cancellationPolicy: course.cancellation_policy,
      status: course.status,
      meta_description: course.meta_description || '',
      keywords: course.keywords || ''
    }))
    
    // 静的データとD1データをマージ（D1のIDが優先）
    const d1Ids = new Set(d1Courses.map((c: any) => c.id))
    const staticCourses = courses.filter(c => !d1Ids.has(c.id))
    
    return [...d1Courses, ...staticCourses]
  } catch (error) {
    console.error('Error fetching courses from D1:', error)
    return courses
  }
}

// フロント用：DBと静的データをマージして講座を取得（getAllCoursesと同じ）
async function getAllCoursesForFront(db: D1Database): Promise<any[]> {
  return getAllCourses(db)
}

// D1から講座を取得（ID指定）
async function getCourseById(db: D1Database, id: string): Promise<any | null> {
  try {
    const course = await db.prepare(`
      SELECT id, title, catchphrase, description, price, duration, level, category, image,
             instructor, instructor_title, instructor_bio, instructor_image,
             target_audience, curriculum, faq, gallery, features, includes,
             max_capacity, cancellation_policy, status,
             meta_description, keywords, seo_score
      FROM courses WHERE id = ?
    `).bind(id).first()
    
    if (course) {
      return {
        id: (course as any).id,
        title: (course as any).title,
        catchphrase: (course as any).catchphrase,
        description: (course as any).description,
        price: (course as any).price,
        duration: (course as any).duration,
        level: (course as any).level,
        category: (course as any).category,
        image: (course as any).image,
        instructor: (course as any).instructor,
        instructorInfo: (course as any).instructor_title || (course as any).instructor_bio || (course as any).instructor_image ? {
          title: (course as any).instructor_title,
          bio: (course as any).instructor_bio,
          image: (course as any).instructor_image
        } : undefined,
        targetAudience: (course as any).target_audience ? JSON.parse((course as any).target_audience) : [],
        curriculum: (course as any).curriculum ? JSON.parse((course as any).curriculum) : [],
        faq: (course as any).faq ? JSON.parse((course as any).faq) : [],
        gallery: (course as any).gallery ? JSON.parse((course as any).gallery) : [],
        features: (course as any).features ? JSON.parse((course as any).features) : [],
        includes: (course as any).includes ? JSON.parse((course as any).includes) : [],
        maxCapacity: (course as any).max_capacity,
        cancellationPolicy: (course as any).cancellation_policy,
        status: (course as any).status,
        meta_description: (course as any).meta_description || '',
        keywords: (course as any).keywords || ''
      }
    }
    
    // D1にない場合は静的データから探す
    return courses.find(c => c.id === id) || null
  } catch (error) {
    console.error('Error fetching course from D1:', error)
    return courses.find(c => c.id === id) || null
  }
}

// 講座IDを生成（タイトルからスラッグ生成）
function generateCourseId(title: string): string {
  const timestamp = Date.now().toString(36)
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  return `${slug || 'course'}-${timestamp}`
}

app.get('/admin/courses', async (c) => {
  const allCourses = await getAllCourses(c.env.DB)
  return c.html(renderCoursesList(allCourses))
})

app.get('/admin/courses/new', (c) => {
  return c.html(renderCourseForm())
})

app.get('/admin/courses/edit/:id', async (c) => {
  const id = c.req.param('id')
  const course = await getCourseById(c.env.DB, id)
  if (!course) return c.notFound()
  return c.html(renderCourseForm(course))
})

// 講座作成
app.post('/admin/courses/create', async (c) => {
  try {
    const body = await c.req.parseBody()
    const id = generateCourseId(body.title as string)
    
    // 配列データの処理
    const targetAudience = (body.targetAudience as string || '').split('\n').map(s => s.trim()).filter(s => s)
    const features = (body.features as string || '').split('\n').map(s => s.trim()).filter(s => s)
    const galleryUrls = (body.gallery as string || '').split('\n').map(s => s.trim()).filter(s => s)
    
    // カリキュラムの処理
    const curriculumTitles = Array.isArray(body.curriculum_title) ? body.curriculum_title : [body.curriculum_title].filter(Boolean)
    const curriculumDurations = Array.isArray(body.curriculum_duration) ? body.curriculum_duration : [body.curriculum_duration].filter(Boolean)
    const curriculumDescriptions = Array.isArray(body.curriculum_description) ? body.curriculum_description : [body.curriculum_description].filter(Boolean)
    const curriculum = curriculumTitles.map((title: string, i: number) => ({
      title: title || '',
      duration: curriculumDurations[i] || '',
      description: curriculumDescriptions[i] || ''
    })).filter((item: any) => item.title)
    
    // FAQの処理
    const faqQuestions = Array.isArray(body.faq_question) ? body.faq_question : [body.faq_question].filter(Boolean)
    const faqAnswers = Array.isArray(body.faq_answer) ? body.faq_answer : [body.faq_answer].filter(Boolean)
    const faq = faqQuestions.map((question: string, i: number) => ({
      question: question || '',
      answer: faqAnswers[i] || ''
    })).filter((item: any) => item.question)
    
    // SEOスコア計算
    const seoScore = calculateSEOScore(body.title as string, body.description as string)
    
    await c.env.DB.prepare(`
      INSERT INTO courses (id, title, catchphrase, description, price, duration, level, category, image,
                          instructor, instructor_title, instructor_bio, instructor_image,
                          target_audience, curriculum, faq, gallery, features, max_capacity, cancellation_policy,
                          meta_description, keywords, seo_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.title,
      body.catchphrase || '',
      body.description,
      parseInt(body.price as string) || 0,
      body.duration || '',
      body.level,
      body.category,
      body.image || '',
      body.instructor || '',
      body.instructor_title || '',
      body.instructor_bio || '',
      body.instructor_image || '',
      JSON.stringify(targetAudience),
      JSON.stringify(curriculum),
      JSON.stringify(faq),
      JSON.stringify(galleryUrls),
      JSON.stringify(features),
      parseInt(body.maxCapacity as string) || null,
      body.cancellationPolicy || '',
      body.meta_description || '',
      body.keywords || '',
      seoScore
    ).run()
    
    // スケジュールの保存
    const scheduleDates = Array.isArray(body.schedule_date) ? body.schedule_date : [body.schedule_date].filter(Boolean)
    const scheduleStarts = Array.isArray(body.schedule_start) ? body.schedule_start : [body.schedule_start].filter(Boolean)
    const scheduleEnds = Array.isArray(body.schedule_end) ? body.schedule_end : [body.schedule_end].filter(Boolean)
    const scheduleCapacities = Array.isArray(body.schedule_capacity) ? body.schedule_capacity : [body.schedule_capacity].filter(Boolean)
    const scheduleLocations = Array.isArray(body.schedule_location) ? body.schedule_location : [body.schedule_location].filter(Boolean)
    
    for (let i = 0; i < scheduleDates.length; i++) {
      if (scheduleDates[i] && scheduleStarts[i] && scheduleEnds[i]) {
        const scheduleId = `sch_${Date.now()}_${i}`
        await c.env.DB.prepare(`
          INSERT INTO schedules (id, course_id, date, start_time, end_time, capacity, location)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          scheduleId,
          id,
          scheduleDates[i],
          scheduleStarts[i],
          scheduleEnds[i],
          parseInt(scheduleCapacities[i] as string) || 10,
          scheduleLocations[i] || 'オンライン'
        ).run()
      }
    }
    
    return c.redirect('/admin/courses')
  } catch (error) {
    console.error('Error creating course:', error)
    return c.html(renderCourseForm(undefined, '講座の作成に失敗しました。もう一度お試しください。'))
  }
})

// 講座更新
app.post('/admin/courses/update/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.parseBody()
    
    // 配列データの処理
    const targetAudience = (body.targetAudience as string || '').split('\n').map(s => s.trim()).filter(s => s)
    const features = (body.features as string || '').split('\n').map(s => s.trim()).filter(s => s)
    const galleryUrls = (body.gallery as string || '').split('\n').map(s => s.trim()).filter(s => s)
    
    // カリキュラムの処理
    const curriculumTitles = Array.isArray(body.curriculum_title) ? body.curriculum_title : [body.curriculum_title].filter(Boolean)
    const curriculumDurations = Array.isArray(body.curriculum_duration) ? body.curriculum_duration : [body.curriculum_duration].filter(Boolean)
    const curriculumDescriptions = Array.isArray(body.curriculum_description) ? body.curriculum_description : [body.curriculum_description].filter(Boolean)
    const curriculum = curriculumTitles.map((title: string, i: number) => ({
      title: title || '',
      duration: curriculumDurations[i] || '',
      description: curriculumDescriptions[i] || ''
    })).filter((item: any) => item.title)
    
    // FAQの処理
    const faqQuestions = Array.isArray(body.faq_question) ? body.faq_question : [body.faq_question].filter(Boolean)
    const faqAnswers = Array.isArray(body.faq_answer) ? body.faq_answer : [body.faq_answer].filter(Boolean)
    const faq = faqQuestions.map((question: string, i: number) => ({
      question: question || '',
      answer: faqAnswers[i] || ''
    })).filter((item: any) => item.question)
    
    // SEOスコア計算
    const seoScore = calculateSEOScore(body.title as string, body.description as string)
    
    // まずD1に存在するか確認
    const existing = await c.env.DB.prepare(`SELECT id FROM courses WHERE id = ?`).bind(id).first()
    
    if (existing) {
      // D1のレコードを更新
      await c.env.DB.prepare(`
        UPDATE courses 
        SET title = ?, catchphrase = ?, description = ?, price = ?, duration = ?, level = ?, category = ?, image = ?,
            instructor = ?, instructor_title = ?, instructor_bio = ?, instructor_image = ?,
            target_audience = ?, curriculum = ?, faq = ?, gallery = ?, features = ?,
            max_capacity = ?, cancellation_policy = ?, meta_description = ?, keywords = ?, seo_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.title,
        body.catchphrase || '',
        body.description,
        parseInt(body.price as string) || 0,
        body.duration || '',
        body.level,
        body.category,
        body.image || '',
        body.instructor || '',
        body.instructor_title || '',
        body.instructor_bio || '',
        body.instructor_image || '',
        JSON.stringify(targetAudience),
        JSON.stringify(curriculum),
        JSON.stringify(faq),
        JSON.stringify(galleryUrls),
        JSON.stringify(features),
        parseInt(body.maxCapacity as string) || null,
        body.cancellationPolicy || '',
        body.meta_description || '',
        body.keywords || '',
        seoScore,
        id
      ).run()
    } else {
      // 静的データからの編集 → D1に新規挿入
      await c.env.DB.prepare(`
        INSERT INTO courses (id, title, catchphrase, description, price, duration, level, category, image,
                            instructor, instructor_title, instructor_bio, instructor_image,
                            target_audience, curriculum, faq, gallery, features, max_capacity, cancellation_policy,
                            meta_description, keywords, seo_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        body.title,
        body.catchphrase || '',
        body.description,
        parseInt(body.price as string) || 0,
        body.duration || '',
        body.level,
        body.category,
        body.image || '',
        body.instructor || '',
        body.instructor_title || '',
        body.instructor_bio || '',
        body.instructor_image || '',
        JSON.stringify(targetAudience),
        JSON.stringify(curriculum),
        JSON.stringify(faq),
        JSON.stringify(galleryUrls),
        JSON.stringify(features),
        parseInt(body.maxCapacity as string) || null,
        body.cancellationPolicy || '',
        body.meta_description || '',
        body.keywords || '',
        seoScore
      ).run()
    }
    
    // スケジュールの更新（既存を削除して新規追加）
    const scheduleDates = Array.isArray(body.schedule_date) ? body.schedule_date : [body.schedule_date].filter(Boolean)
    const scheduleStarts = Array.isArray(body.schedule_start) ? body.schedule_start : [body.schedule_start].filter(Boolean)
    const scheduleEnds = Array.isArray(body.schedule_end) ? body.schedule_end : [body.schedule_end].filter(Boolean)
    const scheduleCapacities = Array.isArray(body.schedule_capacity) ? body.schedule_capacity : [body.schedule_capacity].filter(Boolean)
    const scheduleLocations = Array.isArray(body.schedule_location) ? body.schedule_location : [body.schedule_location].filter(Boolean)
    
    // 新しいスケジュールがある場合のみ既存を削除
    if (scheduleDates.length > 0 && scheduleDates[0]) {
      await c.env.DB.prepare(`DELETE FROM schedules WHERE course_id = ?`).bind(id).run()
      
      for (let i = 0; i < scheduleDates.length; i++) {
        if (scheduleDates[i] && scheduleStarts[i] && scheduleEnds[i]) {
          const scheduleId = `sch_${Date.now()}_${i}`
          await c.env.DB.prepare(`
            INSERT INTO schedules (id, course_id, date, start_time, end_time, capacity, location)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            scheduleId,
            id,
            scheduleDates[i],
            scheduleStarts[i],
            scheduleEnds[i],
            parseInt(scheduleCapacities[i] as string) || 10,
            scheduleLocations[i] || 'オンライン'
          ).run()
        }
      }
    }
    
    return c.redirect('/admin/courses')
  } catch (error) {
    console.error('Error updating course:', error)
    const course = await getCourseById(c.env.DB, id)
    return c.html(renderCourseForm(course, '講座の更新に失敗しました。もう一度お試しください。'))
  }
})

// 講座削除（関連するスケジュールも削除）
app.post('/admin/courses/delete/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`DELETE FROM schedules WHERE course_id = ?`).bind(id).run()
    await c.env.DB.prepare(`DELETE FROM courses WHERE id = ?`).bind(id).run()
    return c.redirect('/admin/courses')
  } catch (error) {
    console.error('Error deleting course:', error)
    return c.redirect('/admin/courses')
  }
})

// ===== 口コミ管理 =====
app.get('/admin/reviews', async (c) => {
  const tab = c.req.query('tab') || 'pending'
  
  try {
    const reviews = await c.env.DB.prepare(`
      SELECT id, course_id, reviewer_name, reviewer_email, rating, comment, status, created_at
      FROM reviews
      ORDER BY created_at DESC
    `).all()
    
    return c.html(renderReviewsList(reviews.results as any[], tab))
  } catch (error) {
    console.error('Reviews error:', error)
    return c.html(renderReviewsList([], tab))
  }
})

app.post('/admin/reviews/:id/approve', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`
      UPDATE reviews SET status = 'approved' WHERE id = ?
    `).bind(id).run()
  } catch (error) {
    console.error('Approve error:', error)
  }
  return c.redirect('/admin/reviews')
})

app.post('/admin/reviews/:id/reject', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`
      UPDATE reviews SET status = 'rejected' WHERE id = ?
    `).bind(id).run()
  } catch (error) {
    console.error('Reject error:', error)
  }
  return c.redirect('/admin/reviews')
})

app.post('/admin/reviews/:id/delete', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`
      DELETE FROM reviews WHERE id = ?
    `).bind(id).run()
  } catch (error) {
    console.error('Delete error:', error)
  }
  return c.redirect('/admin/reviews')
})

// ===== AIニュース管理 =====
app.get('/admin/ai-news', async (c) => {
  try {
    // AIニュース一覧を取得
    const newsResult = await c.env.DB.prepare(`
      SELECT * FROM ai_news ORDER BY created_at DESC LIMIT 100
    `).all()
    const news = newsResult.results as AINews[]

    // ステータス別カウント
    const allCount = news.length
    const pendingCount = news.filter(n => n.status === 'pending').length
    const approvedCount = news.filter(n => n.status === 'approved').length
    const rejectedCount = news.filter(n => n.status === 'rejected').length

    return c.html(renderAINewsList(news, {
      all: allCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount
    }))
  } catch (error) {
    console.error('AI News list error:', error)
    return c.html(renderAINewsList([], { all: 0, pending: 0, approved: 0, rejected: 0 }))
  }
})

// ===== 予約管理 =====
app.get('/admin/bookings', async (c) => {
  const tab = c.req.query('tab') || 'all'
  
  try {
    // 予約一覧を取得
    const bookings = await c.env.DB.prepare(`
      SELECT b.*, c.title as course_name
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
    `).all()
    
    // 講座一覧を取得（フィルター用）
    const dbCourses = await c.env.DB.prepare(`
      SELECT id, title FROM courses WHERE status = 'published' ORDER BY title
    `).all()
    const coursesList = dbCourses.results as { id: string; title: string }[]
    
    return c.html(renderBookingsList(bookings.results as Booking[], tab, coursesList))
  } catch (error) {
    console.error('Bookings error:', error)
    return c.html(renderBookingsList([], tab, []))
  }
})

// 予約一覧API（JSON）
app.get('/admin/api/bookings', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT 
        b.*,
        c.title as course_name
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
    `).all()
    
    return c.json({ bookings: results })
  } catch (error: any) {
    console.error('Bookings API error:', error)
    return c.json({ error: error.message || 'Failed to fetch bookings' }, 500)
  }
})

// 予約詳細API（JSON）
app.get('/admin/api/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const booking = await c.env.DB.prepare(`
      SELECT 
        b.*,
        c.title as course_name,
        c.price as course_price,
        c.duration as course_duration
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE b.id = ?
    `).bind(id).first()
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404)
    }
    
    return c.json({ booking })
  } catch (error: any) {
    console.error('Booking detail API error:', error)
    return c.json({ error: error.message || 'Failed to fetch booking' }, 500)
  }
})

// 予約ステータス・メモ更新API（PATCH）
app.patch('/admin/api/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { status, admin_note } = await c.req.json()
    
    // ステータスのバリデーション
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (status && !validStatuses.includes(status)) {
      return c.json({ error: '無効なステータスです' }, 400)
    }
    
    // ステータスとメモの両方、またはどちらかを更新
    if (status && admin_note !== undefined) {
      await c.env.DB.prepare(`
        UPDATE bookings
        SET status = ?, admin_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(status, admin_note || null, id).run()
    } else if (status) {
      await c.env.DB.prepare(`
        UPDATE bookings
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(status, id).run()
    } else if (admin_note !== undefined) {
      await c.env.DB.prepare(`
        UPDATE bookings
        SET admin_note = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(admin_note || null, id).run()
    }
    
    return c.json({ success: true, message: 'ステータスを更新しました' })
  } catch (error: any) {
    console.error('Booking update API error:', error)
    return c.json({ error: error.message || 'Failed to update booking' }, 500)
  }
})

// 予約ステータス変更API（PATCH - 後方互換性）
app.patch('/admin/api/bookings/:id/status', async (c) => {
  const id = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const status = body.status as string
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return c.json({ error: '無効なステータスです' }, 400)
    }
    
    await c.env.DB.prepare(`
      UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(status, id).run()
    
    return c.json({ success: true, message: 'ステータスを更新しました' })
  } catch (error: any) {
    console.error('Status update API error:', error)
    return c.json({ error: error.message || 'Failed to update status' }, 500)
  }
})

// 予約詳細
app.get('/admin/bookings/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const booking = await c.env.DB.prepare(`
      SELECT b.*, c.title as course_name
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE b.id = ?
    `).bind(id).first()
    
    if (!booking) {
      return c.redirect('/admin/bookings')
    }
    
    return c.html(renderBookingDetail(booking as Booking))
  } catch (error) {
    console.error('Booking detail error:', error)
    return c.redirect('/admin/bookings')
  }
})

// 予約ステータス変更
app.post('/admin/bookings/:id/status', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const status = body.status as string
  
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    return c.redirect(`/admin/bookings/${id}`)
  }
  
  try {
    await c.env.DB.prepare(`
      UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(status, id).run()
  } catch (error) {
    console.error('Status update error:', error)
  }
  
  return c.redirect(`/admin/bookings/${id}`)
})

// 予約支払いステータス変更
app.post('/admin/bookings/:id/payment', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const paymentStatus = body.payment_status as string
  
  const validStatuses = ['unpaid', 'paid', 'refunded']
  if (!validStatuses.includes(paymentStatus)) {
    return c.redirect(`/admin/bookings/${id}`)
  }
  
  try {
    await c.env.DB.prepare(`
      UPDATE bookings SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(paymentStatus, id).run()
  } catch (error) {
    console.error('Payment status update error:', error)
  }
  
  return c.redirect(`/admin/bookings/${id}`)
})

// 予約メモ更新
app.post('/admin/bookings/:id/note', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const adminNote = body.admin_note as string
  
  try {
    await c.env.DB.prepare(`
      UPDATE bookings SET admin_note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(adminNote || '', id).run()
  } catch (error) {
    console.error('Note update error:', error)
  }
  
  return c.redirect(`/admin/bookings/${id}`)
})

// 予約削除
app.post('/admin/bookings/:id/delete', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.DB.prepare(`DELETE FROM bookings WHERE id = ?`).bind(id).run()
  } catch (error) {
    console.error('Delete booking error:', error)
  }
  
  return c.redirect('/admin/bookings')
})

// 予約エクスポート（CSV）
app.get('/admin/bookings/export', async (c) => {
  try {
    const bookings = await c.env.DB.prepare(`
      SELECT b.*, c.title as course_name
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
    `).all()
    
    // CSVヘッダー
    const headers = ['ID', '講座名', '顧客名', 'メール', '電話', '希望日', '希望時間', 'ステータス', '支払い', '金額', '作成日']
    
    // CSVデータ
    const rows = (bookings.results as Booking[]).map(b => [
      b.id,
      b.course_name || '',
      b.customer_name,
      b.customer_email,
      b.customer_phone || '',
      b.preferred_date || '',
      b.preferred_time || '',
      b.status,
      b.payment_status,
      b.amount,
      b.created_at
    ])
    
    // CSV文字列生成
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    // BOMを付けてUTF-8で出力（Excelで開けるように）
    const bom = '\uFEFF'
    
    return new Response(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bookings_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return c.redirect('/admin/bookings')
  }
})

// ===== お問い合わせ管理 =====
app.get('/admin/contacts', async (c) => {
  const tab = c.req.query('tab') || 'new'
  
  try {
    const contacts = await c.env.DB.prepare(`
      SELECT id, name, email, phone, type, subject, message, status, created_at
      FROM contacts
      ORDER BY created_at DESC
    `).all()
    
    return c.html(renderContactsList(contacts.results as any[], tab))
  } catch (error) {
    console.error('Contacts error:', error)
    return c.html(renderContactsList([], tab))
  }
})

app.get('/admin/contacts/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const contact = await c.env.DB.prepare(`
      SELECT id, name, email, phone, type, subject, message, status, created_at
      FROM contacts WHERE id = ?
    `).bind(id).first()
    
    if (!contact) return c.notFound()
    return c.html(renderContactDetail(contact as any))
  } catch (error) {
    console.error('Contact detail error:', error)
    return c.notFound()
  }
})

app.post('/admin/contacts/:id/status', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const status = body.status as string
  
  try {
    const result = await c.env.DB.prepare(`
      UPDATE contacts SET status = ? WHERE id = ?
    `).bind(status, id).run()
    console.log('Status update result:', result, 'id:', id, 'status:', status)
  } catch (error) {
    console.error('Update status error:', error)
  }
  
  // キャッシュ無効化ヘッダーを追加してリダイレクト
  return c.redirect(`/admin/contacts/${id}?t=${Date.now()}`, 302)
})

// メール送信API（Resend APIを使用）
app.post('/admin/api/contacts/:id/reply', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSession(sessionId)) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  
  const id = c.req.param('id')
  
  try {
    const { to, subject, body } = await c.req.json()
    
    if (!to || !subject || !body) {
      return c.json({ error: '宛先、件名、本文は必須です' }, 400)
    }
    
    // Resend APIキーの確認
    if (!c.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return c.json({ 
        error: 'メール送信サービスが設定されていません。管理者に連絡してください。',
        detail: 'RESEND_API_KEY not configured'
      }, 500)
    }
    
    // Resend APIでメール送信
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'mirAIcafe <info@miraicafe.com>',
        to: [to],
        subject: subject,
        text: body
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { message?: string; name?: string }
      console.error('Resend API error:', errorData)
      
      // Resend APIの検証エラー（テスト環境）
      if (errorData.name === 'validation_error') {
        return c.json({ 
          error: 'メール送信の設定に問題があります。ドメイン認証を確認してください。',
          detail: errorData.message
        }, 500)
      }
      
      return c.json({ 
        error: 'メール送信に失敗しました',
        detail: errorData.message || `HTTP ${response.status}`
      }, 500)
    }
    
    const result = await response.json()
    
    // 送信成功後、お問い合わせを対応済みに更新
    try {
      await c.env.DB.prepare(`
        UPDATE contacts SET status = 'handled' WHERE id = ?
      `).bind(id).run()
    } catch (dbError) {
      console.error('Update contact status error:', dbError)
      // メール送信は成功しているので続行
    }
    
    return c.json({ 
      success: true, 
      message: 'メールを送信しました',
      email_id: (result as { id?: string }).id
    })
    
  } catch (error) {
    console.error('Email send error:', error)
    return c.json({ 
      error: 'メール送信処理でエラーが発生しました',
      detail: String(error)
    }, 500)
  }
})

// ===== 画像アップロードAPI =====

// 許可されるMIMEタイプ
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// ファイル名を生成
function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}_${random}.${ext}`
}

// 画像アップロードエンドポイント
app.post('/admin/api/upload', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSession(sessionId)) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return c.json({ error: 'ファイルが選択されていません' }, 400)
    }

    // MIMEタイプチェック
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return c.json({ error: '対応していないファイル形式です。JPG, PNG, GIF, WebPのみ対応しています。' }, 400)
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: 'ファイルサイズが大きすぎます（最大5MB）' }, 400)
    }

    // ファイル名を生成
    const fileName = generateFileName(file.name)
    const key = `uploads/${fileName}`

    // R2にアップロード
    const arrayBuffer = await file.arrayBuffer()
    
    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    })

    // 公開URLを生成（R2パブリックバケットまたはWorker経由）
    const url = `/images/${fileName}`

    return c.json({ 
      success: true, 
      url,
      fileName,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'アップロードに失敗しました' }, 500)
  }
})

// 複数画像アップロードエンドポイント
app.post('/admin/api/upload-multiple', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSession(sessionId)) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const formData = await c.req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return c.json({ error: 'ファイルが選択されていません' }, 400)
    }

    const results: { url: string; fileName: string; size: number; type: string }[] = []
    const errors: string[] = []

    for (const file of files) {
      // MIMEタイプチェック
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`${file.name}: 対応していないファイル形式です`)
        continue
      }

      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: ファイルサイズが大きすぎます（最大5MB）`)
        continue
      }

      try {
        const fileName = generateFileName(file.name)
        const key = `uploads/${fileName}`
        const arrayBuffer = await file.arrayBuffer()
        
        await c.env.R2_BUCKET.put(key, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
        })

        results.push({
          url: `/images/${fileName}`,
          fileName,
          size: file.size,
          type: file.type
        })
      } catch (err) {
        errors.push(`${file.name}: アップロードに失敗しました`)
      }
    }

    return c.json({ 
      success: true, 
      uploaded: results,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'アップロードに失敗しました' }, 500)
  }
})

// 画像削除エンドポイント
app.delete('/admin/api/upload/:fileName', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSession(sessionId)) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const fileName = c.req.param('fileName')
    const key = `uploads/${fileName}`
    
    await c.env.R2_BUCKET.delete(key)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return c.json({ error: '削除に失敗しました' }, 500)
  }
})

// AI画像検索エンドポイント（Unsplash）
app.get('/admin/api/ai/search-images', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSession(sessionId)) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  const query = c.req.query('query')
  if (!query) {
    return c.json({ error: '検索キーワードが必要です' }, 400)
  }

  try {
    const UNSPLASH_ACCESS_KEY = c.env.UNSPLASH_ACCESS_KEY
    if (!UNSPLASH_ACCESS_KEY) {
      return c.json({ error: 'Unsplash APIキーが設定されていません' }, 500)
    }

    const searchQuery = encodeURIComponent(query)
    const url = `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=9&orientation=landscape`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    if (!response.ok) {
      console.error('Unsplash API error:', await response.text())
      return c.json({ error: '画像検索に失敗しました' }, 500)
    }

    const data = await response.json() as { results: { urls: { regular: string; small: string } }[] }
    
    const images = data.results.map(img => ({
      url: img.urls.regular,
      thumb: img.urls.small
    }))

    return c.json({ images })
  } catch (error) {
    console.error('Image search error:', error)
    return c.json({ error: '画像検索に失敗しました' }, 500)
  }
})

// 画像配信エンドポイント（R2から直接配信）
app.get('/images/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName')
    const key = `uploads/${fileName}`
    
    const object = await c.env.R2_BUCKET.get(key)
    
    if (!object) {
      return c.notFound()
    }

    const headers = new Headers()
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000') // 1年キャッシュ
    headers.set('ETag', object.etag)

    return new Response(object.body, { headers })
  } catch (error) {
    console.error('Image serve error:', error)
    return c.notFound()
  }
})

// ===== SEO管理 =====

// SEOページ一覧を生成
function getSEOPages() {
  const pages = [
    { id: 'home', title: 'トップページ', url: '/', type: 'home' },
    { id: 'courses', title: '講座一覧', url: '/courses', type: 'course' },
    { id: 'blog', title: 'ブログ一覧', url: '/blog', type: 'blog' },
    { id: 'contact', title: 'お問い合わせ', url: '/contact', type: 'contact' },
  ]
  
  // 講座ページを追加
  courses.forEach(course => {
    pages.push({
      id: `course-${course.id}`,
      title: course.title,
      url: `/courses/${course.id}`,
      type: 'course'
    })
  })
  
  // ブログ記事を追加
  blogPosts.forEach(post => {
    pages.push({
      id: `blog-${post.id}`,
      title: post.title,
      url: `/blog/${post.id}`,
      type: 'blog'
    })
  })
  
  return pages
}

// SEOダッシュボード
app.get('/admin/seo', (c) => {
  const pages = getSEOPages()
  return c.html(renderSEODashboard(pages))
})

// SEO編集ページ
app.get('/admin/seo/edit/:pageId', (c) => {
  const pageId = c.req.param('pageId')
  const pages = getSEOPages()
  const page = pages.find(p => p.id === pageId)
  
  if (!page) {
    return c.redirect('/admin/seo')
  }
  
  // ページタイプに応じたデフォルトSEOデータを取得
  let pageData = null
  if (pageId.startsWith('course-')) {
    const courseId = pageId.replace('course-', '')
    pageData = courses.find(c => c.id === courseId)
  } else if (pageId.startsWith('blog-')) {
    const blogId = pageId.replace('blog-', '')
    pageData = blogPosts.find(p => p.id === blogId)
  }
  
  const seoData = getDefaultSEOData(page.type, pageData)
  
  return c.html(renderSEOEditForm(page, seoData))
})

// SEO更新
app.post('/admin/seo/update/:pageId', async (c) => {
  const pageId = c.req.param('pageId')
  const body = await c.req.parseBody()
  
  // TODO: SEOデータをデータベースに保存
  // 現在は静的なデフォルト値を使用しているため、保存機能は将来実装
  
  return c.redirect('/admin/seo')
})

// ===== ポリシー管理 =====

// ===== ポートフォリオ管理 =====

// ポートフォリオ一覧
app.get('/admin/portfolios', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM portfolios ORDER BY sort_order ASC, created_at DESC
    `).all<Portfolio>()
    return c.html(renderPortfoliosList(result.results || []))
  } catch (error) {
    console.error('Portfolios list error:', error)
    return c.html(renderPortfoliosList([]))
  }
})

// AIポートフォリオジェネレーター
app.get('/admin/portfolios/ai-generator', (c) => {
  return c.html(renderAIPortfolioGeneratorPage())
})

// 新規ポートフォリオ作成
app.get('/admin/portfolios/new', (c) => {
  return c.html(renderPortfolioForm())
})

// ポートフォリオ編集
app.get('/admin/portfolios/:id/edit', async (c) => {
  const id = c.req.param('id')
  try {
    const portfolio = await c.env.DB.prepare('SELECT * FROM portfolios WHERE id = ?').bind(id).first<Portfolio>()
    if (!portfolio) return c.notFound()
    return c.html(renderPortfolioForm(portfolio))
  } catch (error) {
    console.error('Portfolio edit error:', error)
    return c.notFound()
  }
})

// ポートフォリオ作成（POST）
app.post('/admin/portfolios', async (c) => {
  try {
    const body = await c.req.parseBody()
    
    // スラッグ生成
    let slug = (body.slug as string)?.trim()
    if (!slug) {
      slug = (body.title as string).toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      slug = slug + '-' + Date.now().toString(36)
    }
    
    await c.env.DB.prepare(`
      INSERT INTO portfolios (
        title, slug, description, category, thumbnail, 
        demo_type, demo_url, github_url, live_url, video_url,
        images, technologies, content, duration, client, role,
        status, sort_order, meta_description, keywords
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.title,
      slug,
      body.description || null,
      body.category || 'Webアプリ',
      body.thumbnail || null,
      body.demo_type || 'image',
      body.demo_url || null,
      body.github_url || null,
      body.live_url || null,
      body.video_url || null,
      body.images || '[]',
      body.technologies || '[]',
      body.content || null,
      body.duration || null,
      body.client || null,
      body.role || null,
      body.status || 'draft',
      parseInt(body.sort_order as string) || 0,
      body.meta_description || null,
      body.keywords || null
    ).run()
    
    return c.redirect('/admin/portfolios')
  } catch (error) {
    console.error('Portfolio create error:', error)
    return c.redirect('/admin/portfolios?error=create')
  }
})

// ポートフォリオ更新（POST）
app.post('/admin/portfolios/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.parseBody()
    
    await c.env.DB.prepare(`
      UPDATE portfolios SET
        title = ?, description = ?, category = ?, thumbnail = ?,
        demo_type = ?, demo_url = ?, github_url = ?, live_url = ?, video_url = ?,
        images = ?, technologies = ?, content = ?, duration = ?, client = ?, role = ?,
        status = ?, sort_order = ?, meta_description = ?, keywords = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.title,
      body.description || null,
      body.category || 'Webアプリ',
      body.thumbnail || null,
      body.demo_type || 'image',
      body.demo_url || null,
      body.github_url || null,
      body.live_url || null,
      body.video_url || null,
      body.images || '[]',
      body.technologies || '[]',
      body.content || null,
      body.duration || null,
      body.client || null,
      body.role || null,
      body.status || 'draft',
      parseInt(body.sort_order as string) || 0,
      body.meta_description || null,
      body.keywords || null,
      id
    ).run()
    
    return c.redirect('/admin/portfolios')
  } catch (error) {
    console.error('Portfolio update error:', error)
    return c.redirect(`/admin/portfolios/${id}/edit?error=update`)
  }
})

// ポートフォリオ削除（POST）
app.post('/admin/portfolios/:id/delete', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare('DELETE FROM portfolios WHERE id = ?').bind(id).run()
    return c.redirect('/admin/portfolios')
  } catch (error) {
    console.error('Portfolio delete error:', error)
    return c.redirect('/admin/portfolios?error=delete')
  }
})

// ===== コメント管理 =====

// コメント一覧
app.get('/admin/comments', async (c) => {
  const filter = c.req.query('filter') || 'all'
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM comments ORDER BY created_at DESC
    `).all<Comment>()
    return c.html(renderCommentsList(result.results || [], filter))
  } catch (error) {
    console.error('Comments list error:', error)
    return c.html(renderCommentsList([], filter))
  }
})

// コメントステータス更新
app.put('/admin/api/comments/:id/status', async (c) => {
  const id = c.req.param('id')
  try {
    const { status } = await c.req.json<{ status: 'pending' | 'approved' | 'rejected' }>()
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return c.json({ success: false, error: '無効なステータスです' }, 400)
    }
    
    const approvedAt = status === 'approved' ? "datetime('now')" : 'NULL'
    await c.env.DB.prepare(`
      UPDATE comments 
      SET status = ?, approved_at = ${status === 'approved' ? "datetime('now')" : 'NULL'}
      WHERE id = ?
    `).bind(status, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Comment status update error:', error)
    return c.json({ success: false, error: 'ステータスの更新に失敗しました' }, 500)
  }
})

// コメント返信
app.put('/admin/api/comments/:id/reply', async (c) => {
  const id = c.req.param('id')
  try {
    const { reply } = await c.req.json<{ reply: string }>()
    
    if (reply && reply.trim()) {
      await c.env.DB.prepare(`
        UPDATE comments 
        SET admin_reply = ?, admin_reply_at = datetime('now')
        WHERE id = ?
      `).bind(reply.trim(), id).run()
    } else {
      await c.env.DB.prepare(`
        UPDATE comments 
        SET admin_reply = NULL, admin_reply_at = NULL
        WHERE id = ?
      `).bind(id).run()
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Comment reply error:', error)
    return c.json({ success: false, error: '返信の保存に失敗しました' }, 500)
  }
})

// コメント削除
app.delete('/admin/api/comments/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    console.error('Comment delete error:', error)
    return c.json({ success: false, error: '削除に失敗しました' }, 500)
  }
})

// ===== サイト実績設定 =====

// 実績設定更新
app.put('/admin/api/site-stats', async (c) => {
  try {
    const body = await c.req.json<{
      show_stats: number
      student_count_extra: number
      student_count_suffix: string
      course_count_auto: number
      course_count_manual: number
      satisfaction_auto: number
      satisfaction_manual: number
    }>()
    
    // まず既存レコードがあるか確認
    const existing = await c.env.DB.prepare(`SELECT id FROM site_stats WHERE id = 'main'`).first()
    
    if (existing) {
      await c.env.DB.prepare(`
        UPDATE site_stats SET
          show_stats = ?,
          student_count_extra = ?,
          student_count_suffix = ?,
          course_count_auto = ?,
          course_count_manual = ?,
          satisfaction_auto = ?,
          satisfaction_manual = ?,
          updated_at = datetime('now')
        WHERE id = 'main'
      `).bind(
        body.show_stats,
        body.student_count_extra,
        body.student_count_suffix,
        body.course_count_auto,
        body.course_count_manual,
        body.satisfaction_auto,
        body.satisfaction_manual
      ).run()
    } else {
      await c.env.DB.prepare(`
        INSERT INTO site_stats (id, show_stats, student_count_extra, student_count_suffix, course_count_auto, course_count_manual, satisfaction_auto, satisfaction_manual)
        VALUES ('main', ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        body.show_stats,
        body.student_count_extra,
        body.student_count_suffix,
        body.course_count_auto,
        body.course_count_manual,
        body.satisfaction_auto,
        body.satisfaction_manual
      ).run()
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Site stats update error:', error)
    return c.json({ success: false, error: '保存に失敗しました' }, 500)
  }
})

// 実績設定取得（公開API）
app.get('/api/site-stats', async (c) => {
  try {
    const stats = await c.env.DB.prepare(`SELECT * FROM site_stats WHERE id = 'main'`).first()
    
    // 講座数と満足度を計算
    let courseCount = 0
    let satisfactionRate = 0
    
    // 予約からの受講生数（ユニーク顧客数）を自動カウント
    let studentCountAuto = 0
    try {
      const uniqueCustomers = await c.env.DB.prepare(`
        SELECT COUNT(DISTINCT customer_email) as count 
        FROM bookings 
        WHERE status IN ('confirmed', 'completed')
      `).first()
      studentCountAuto = (uniqueCustomers as any)?.count || 0
    } catch (e) {
      // テーブルがなければスキップ
    }
    
    // 手動追加分
    const studentCountExtra = (stats as any)?.student_count_extra || 0
    // 合計
    const studentCountTotal = studentCountAuto + studentCountExtra
    
    if (stats) {
      // 講座数
      if ((stats as any).course_count_auto) {
        courseCount = courses.length
      } else {
        courseCount = (stats as any).course_count_manual || 0
      }
      
      // 満足度
      if ((stats as any).satisfaction_auto) {
        const avgResult = await c.env.DB.prepare(`SELECT AVG(rating) as avg FROM reviews WHERE status = 'approved'`).first()
        satisfactionRate = Math.round(((avgResult as any)?.avg || 0) * 20)
      } else {
        satisfactionRate = (stats as any).satisfaction_manual || 0
      }
    }
    
    return c.json({
      show: (stats as any)?.show_stats === 1,
      students: {
        auto: studentCountAuto,
        extra: studentCountExtra,
        count: studentCountTotal,
        suffix: (stats as any)?.student_count_suffix || '+'
      },
      courses: courseCount,
      satisfaction: satisfactionRate
    })
  } catch (error) {
    return c.json({ show: false, students: { auto: 0, extra: 0, count: 0, suffix: '+' }, courses: 0, satisfaction: 0 })
  }
})

// ポリシー一覧
app.get('/admin/policies', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM policies ORDER BY id').all<AdminPolicy>()
    return c.html(renderPoliciesList(result.results || []))
  } catch (error) {
    console.error('Policies list error:', error)
    return c.html(renderPoliciesList([]))
  }
})

// ポリシー編集ページ
app.get('/admin/policies/edit/:id', async (c) => {
  const policyId = c.req.param('id')
  try {
    const policy = await c.env.DB.prepare('SELECT * FROM policies WHERE id = ?').bind(policyId).first<AdminPolicy>()
    return c.html(renderPolicyEditForm(policy, policyId))
  } catch (error) {
    console.error('Policy edit error:', error)
    return c.html(renderPolicyEditForm(null, policyId))
  }
})

// ポリシー更新API
app.put('/admin/api/policies/:id', async (c) => {
  const policyId = c.req.param('id')
  try {
    const body = await c.req.json<{ title: string; content: string }>()
    
    await c.env.DB.prepare(`
      UPDATE policies 
      SET title = ?, content = ?, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).bind(body.title, body.content, policyId).run()
    
    return c.json({ success: true, message: '保存しました' })
  } catch (error) {
    console.error('Policy update error:', error)
    return c.json({ success: false, message: '保存に失敗しました' }, 500)
  }
})

// ポリシー取得API
app.get('/admin/api/policies/:id', async (c) => {
  const policyId = c.req.param('id')
  try {
    const policy = await c.env.DB.prepare('SELECT * FROM policies WHERE id = ?').bind(policyId).first<AdminPolicy>()
    if (!policy) {
      return c.json({ error: 'Not found' }, 404)
    }
    return c.json(policy)
  } catch (error) {
    console.error('Policy get error:', error)
    return c.json({ error: 'Internal error' }, 500)
  }
})

// SEO分析API
app.post('/admin/api/seo/analyze/:pageId', async (c) => {
  const pageId = c.req.param('pageId')
  const pages = getSEOPages()
  const page = pages.find(p => p.id === pageId)
  
  if (!page) {
    return c.json({ error: 'ページが見つかりません' }, 404)
  }
  
  // ページデータを取得
  let pageData = null
  let pageContent = ''
  
  if (pageId === 'home') {
    pageContent = 'mirAIcafe - カフェで学ぶAI。AI・プログラミング講座を提供する学習カフェ。初心者から上級者まで対応。'
  } else if (pageId === 'courses') {
    pageContent = '講座一覧。AI基礎、プログラミング、データ分析など様々な講座をご用意。'
    courses.forEach(c => {
      pageContent += ` ${c.title}: ${c.description}`
    })
  } else if (pageId === 'blog') {
    pageContent = 'mirAIcafeブログ。AI・プログラミングに関する情報を発信。'
    blogPosts.forEach(p => {
      pageContent += ` ${p.title}: ${p.excerpt}`
    })
  } else if (pageId === 'contact') {
    pageContent = 'お問い合わせ。講座に関するご質問、法人研修のご相談など。'
  } else if (pageId.startsWith('course-')) {
    const courseId = pageId.replace('course-', '')
    const course = courses.find(c => c.id === courseId)
    if (course) {
      pageData = course
      pageContent = `${course.title}。${course.description}。${course.longDescription || ''}`
    }
  } else if (pageId.startsWith('blog-')) {
    const blogId = pageId.replace('blog-', '')
    const post = blogPosts.find(p => p.id === blogId)
    if (post) {
      pageData = post
      pageContent = `${post.title}。${post.excerpt}。${post.content?.substring(0, 500) || ''}`
    }
  }
  
  const seoData = getDefaultSEOData(page.type, pageData)
  
  const contentData: PageContent = {
    url: page.url,
    title: seoData.title,
    description: seoData.description,
    content: pageContent,
    pageType: page.type as any
  }
  
  try {
    const analysis = await generateSEOSuggestions(c.env, contentData)
    return c.json(analysis)
  } catch (error) {
    console.error('SEO analysis error:', error)
    return c.json({ error: 'SEO分析に失敗しました' }, 500)
  }
})

// SEOスコア計算API
app.post('/admin/api/ai/analyze-seo', async (c) => {
  try {
    const { title, content } = await c.req.json()
    
    let score = 0
    const feedback: string[] = []
    
    // タイトル文字数チェック
    const titleLength = title?.length || 0
    if (titleLength >= 30 && titleLength <= 60) {
      score += 30
      feedback.push('✅ タイトル文字数が最適です')
    } else if (titleLength < 30) {
      feedback.push('⚠️ タイトルが短すぎます（30文字以上推奨）')
    } else {
      feedback.push('⚠️ タイトルが長すぎます（60文字以内推奨）')
    }
    
    // 数字の有無
    if (/\d/.test(title || '')) {
      score += 15
      feedback.push('✅ タイトルに数字が含まれています')
    } else {
      feedback.push('💡 タイトルに数字を入れると効果的です')
    }
    
    // キーワード密度
    if ((title || '').includes('AI') || (title || '').includes('ChatGPT') || (title || '').includes('初心者')) {
      score += 20
      feedback.push('✅ 重要キーワードが含まれています')
    } else {
      feedback.push('💡 メインキーワードを含めましょう')
    }
    
    // 疑問形・具体性
    if ((title || '').includes('？') || (title || '').includes('方法') || (title || '').includes('完全ガイド')) {
      score += 15
      feedback.push('✅ 読者の興味を引く表現です')
    }
    
    // コンテンツ文字数
    const contentLength = content?.length || 0
    if (contentLength >= 1500) {
      score += 20
      feedback.push('✅ 十分な文字数があります')
    } else if (contentLength >= 800) {
      score += 10
      feedback.push('⚠️ もう少し詳しく書くと良いです')
    } else {
      feedback.push('⚠️ 文字数が少なすぎます（1500文字以上推奨）')
    }
    
    return c.json({ 
      score: Math.min(score, 100),
      feedback,
      color: score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'
    })
  } catch (error) {
    console.error('SEO analyze error:', error)
    return c.json({ error: 'SEO分析に失敗しました' }, 500)
  }
})

// AI SEO提案API
app.post('/admin/api/ai/suggest-seo', async (c) => {
  try {
    const { title, content, type } = await c.req.json()
    
    const contentType = type === 'blog' ? 'ブログ記事' : '講座'
    const prompt = `あなたはSEO専門家かつ文章のプロ編集者です。以下の${contentType}のタイトルと内容を分析し、SEOと文章の改善提案をしてください。

【現在のタイトル】
${title || '未設定'}

【内容】
${(content || '').substring(0, 1500)}

【出力形式】※必ずこの形式で出力してください

## 改善タイトル案
1. [案1]
2. [案2]
3. [案3]

## メタディスクリプション
[120文字以内]

## 推奨キーワード
[5個、カンマ区切り]

## 改善ポイント
• [ポイント1]
• [ポイント2]
• [ポイント3]

## 本文の訂正提案
以下の形式で具体的な修正箇所を3〜5個提案してください。

【訂正1】
修正前: [現在の文章の一部をそのまま引用]
修正後: [改善した文章]
理由: [なぜこの修正が良いか]

【訂正2】
修正前: [現在の文章の一部をそのまま引用]
修正後: [改善した文章]
理由: [なぜこの修正が良いか]

【訂正3】
修正前: [現在の文章の一部をそのまま引用]
修正後: [改善した文章]
理由: [なぜこの修正が良いか]

※訂正提案のポイント:
- 読みやすさの向上（文の簡潔化、段落の整理）
- SEOキーワードの自然な追加
- 専門用語の平易な説明
- 誤字脱字や文法の修正
- より魅力的な表現への変更`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${c.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string, code?: number } }
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`
      
      // クォータ制限エラーの場合は分かりやすいメッセージ
      if (response.status === 429 || errorMessage.includes('quota')) {
        return c.json({ error: 'APIの利用制限に達しました。しばらく待ってから再度お試しください。' }, 429)
      }
      
      throw new Error(`Gemini API error: ${errorMessage}`)
    }
    
    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>
        }
      }>
      error?: { message?: string }
    }
    
    // API応答にエラーが含まれている場合
    if (data.error) {
      return c.json({ error: data.error.message || 'AI処理でエラーが発生しました' }, 500)
    }
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // パース処理
    const titleMatch = generatedText.match(/## 改善タイトル案\n1\. (.+)\n2\. (.+)\n3\. (.+)/)
    const metaMatch = generatedText.match(/## メタディスクリプション\n(.+)/)
    const keywordsMatch = generatedText.match(/## 推奨キーワード\n(.+)/)
    const pointsMatch = generatedText.match(/## 改善ポイント\n([\s\S]+?)(?=\n##|$)/)
    
    // 本文の訂正提案をパース
    const contentCorrectionsMatch = generatedText.match(/## 本文の訂正提案\n([\s\S]+?)(?=\n##|$)/)
    const contentCorrections: Array<{before: string, after: string, reason: string}> = []
    
    if (contentCorrectionsMatch) {
      const correctionText = contentCorrectionsMatch[1]
      // 【訂正N】のパターンで分割
      const correctionBlocks = correctionText.split(/【訂正\d+】/).filter(block => block.trim())
      
      correctionBlocks.forEach(block => {
        const beforeMatch = block.match(/修正前[:：]\s*(.+?)(?=\n修正後|$)/s)
        const afterMatch = block.match(/修正後[:：]\s*(.+?)(?=\n理由|$)/s)
        const reasonMatch = block.match(/理由[:：]\s*(.+?)(?=\n【|$)/s)
        
        if (beforeMatch && afterMatch) {
          contentCorrections.push({
            before: beforeMatch[1].trim(),
            after: afterMatch[1].trim(),
            reason: reasonMatch ? reasonMatch[1].trim() : ''
          })
        }
      })
    }
    
    return c.json({
      suggested_titles: titleMatch ? [titleMatch[1], titleMatch[2], titleMatch[3]] : [],
      meta_description: metaMatch ? metaMatch[1] : '',
      keywords: keywordsMatch ? keywordsMatch[1].split(',').map((k: string) => k.trim()) : [],
      improvement_points: pointsMatch ? 
        pointsMatch[1].split('\n').filter((p: string) => p.trim().startsWith('•')).map((p: string) => p.replace('•', '').trim()) 
        : [],
      content_corrections: contentCorrections,
      raw_response: generatedText
    })
  } catch (error) {
    console.error('SEO suggest error:', error)
    return c.json({ error: 'AI提案の取得に失敗しました' }, 500)
  }
})

// メタディスクリプション・キーワード自動生成API
app.post('/admin/api/ai/generate-meta', async (c) => {
  try {
    const { title, content } = await c.req.json()
    
    if (!content && !title) {
      return c.json({ error: 'タイトルまたは本文を入力してください' }, 400)
    }
    
    // Gemini APIキーの存在確認
    if (!c.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured')
      // APIキーがない場合はフォールバック
      const fallbackMeta = createFallbackMeta(title, content)
      const fallbackKeywords = createFallbackKeywords(title, content)
      return c.json({ 
        meta_description: fallbackMeta,
        keywords: fallbackKeywords,
        length: fallbackMeta.length,
        fallback: true
      })
    }
    
    // コンテンツを800文字に制限
    const truncatedContent = (content || '').substring(0, 800)
    
    const prompt = `あなたはSEOの専門家です。以下の記事のタイトルとコンテンツから、メタディスクリプションとSEOキーワードを作成してください。

【タイトル】
${title || '未設定'}

【コンテンツ】
${truncatedContent}

【出力形式】
必ず以下のJSON形式で出力してください：
{
  "meta_description": "120文字以内のメタディスクリプション",
  "keywords": "キーワード1, キーワード2, キーワード3, キーワード4, キーワード5"
}

【条件】
- meta_description: 120文字以内、記事の要点を簡潔に、読者の興味を引く
- keywords: 3〜5個のSEOキーワードをカンマ区切り、重要度の高い順
- JSON以外の説明文は不要`

    // 使用するモデルのリスト（フォールバック順）
    const models = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro'
    ]
    
    let metaDescription = ''
    let keywords = ''
    let lastError: Error | null = null
    
    // 各モデルを順番に試行
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${c.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 256
              }
            })
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
          const errorMessage = errorData.error?.message || `HTTP ${response.status}`
          
          if (response.status === 429 || errorMessage.includes('quota')) {
            // レート制限の場合は次のモデルを試行
            console.log(`Model ${model} rate limited, trying next...`)
            continue
          }
          
          throw new Error(`Gemini API error (${model}): ${errorMessage}`)
        }
        
        const data = await response.json() as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>
            }
          }>
          error?: { message?: string }
        }
        
        if (data.error) {
          throw new Error(data.error.message || 'AI処理でエラーが発生しました')
        }
        
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        
        if (generatedText) {
          // JSONを解析
          try {
            // JSONブロックを抽出（```json...```または{...}）
            let jsonStr = generatedText
            const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/)
            if (jsonMatch) {
              jsonStr = jsonMatch[1]
            } else {
              const objMatch = generatedText.match(/\{[\s\S]*\}/)
              if (objMatch) {
                jsonStr = objMatch[0]
              }
            }
            
            const parsed = JSON.parse(jsonStr) as { meta_description?: string; keywords?: string }
            metaDescription = parsed.meta_description || ''
            keywords = parsed.keywords || ''
            
            // メタディスクリプションを120文字に制限
            if (metaDescription.length > 120) {
              metaDescription = metaDescription.substring(0, 117) + '...'
            }
            
            // 成功したらループを抜ける
            break
          } catch (parseError) {
            // JSON解析失敗時はテキストをそのままメタディスクリプションとして使用
            metaDescription = generatedText.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            if (metaDescription.length > 120) {
              metaDescription = metaDescription.substring(0, 117) + '...'
            }
            // キーワードはフォールバックで生成
            keywords = createFallbackKeywords(title, content)
            break
          }
        }
      } catch (error) {
        lastError = error as Error
        console.error(`Model ${model} failed:`, error)
        // 次のモデルを試行
        continue
      }
    }
    
    // すべてのモデルが失敗した場合のフォールバック
    if (!metaDescription) {
      console.log('All models failed, using fallback')
      metaDescription = createFallbackMeta(title, content)
      keywords = createFallbackKeywords(title, content)
      return c.json({ 
        meta_description: metaDescription,
        keywords: keywords,
        length: metaDescription.length,
        fallback: true
      })
    }
    
    return c.json({ 
      meta_description: metaDescription,
      keywords: keywords,
      length: metaDescription.length
    })
  } catch (error) {
    console.error('Meta generation error:', error)
    // 一般エラー時もフォールバック
    const { title, content } = await c.req.json().catch(() => ({ title: '', content: '' }))
    const fallbackMeta = createFallbackMeta(title, content)
    const fallbackKeywords = createFallbackKeywords(title, content)
    return c.json({ 
      meta_description: fallbackMeta,
      keywords: fallbackKeywords,
      length: fallbackMeta.length,
      fallback: true
    })
  }
})

// フォールバックメタディスクリプション生成
function createFallbackMeta(title: string, content: string): string {
  // コンテンツがある場合は最初の文を使用
  if (content) {
    // 最初の文を取得（。！？.!?で終わる部分）
    const firstSentenceMatch = content.match(/^[^。！？.!?]*[。！？.!?]/)
    if (firstSentenceMatch) {
      const firstSentence = firstSentenceMatch[0].trim()
      if (firstSentence.length <= 120) {
        return firstSentence
      }
      // 120文字を超える場合は117文字 + '...'
      return firstSentence.substring(0, 117) + '...'
    }
    
    // 文の区切りがない場合はコンテンツの先頭を使用
    const cleanContent = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    if (cleanContent.length <= 120) {
      return cleanContent
    }
    return cleanContent.substring(0, 117) + '...'
  }
  
  // コンテンツがない場合はタイトルベース
  if (title) {
    const titleMeta = `${title}についての記事です。詳細はこちらをご覧ください。`
    if (titleMeta.length <= 120) {
      return titleMeta
    }
    return titleMeta.substring(0, 117) + '...'
  }
  
  return '記事の詳細については本文をご覧ください。'
}

// フォールバックキーワード生成
function createFallbackKeywords(title: string, content: string): string {
  const keywords: string[] = []
  
  // タイトルから主要な単語を抽出
  if (title) {
    // 一般的な単語を除外して、重要そうな単語を取得
    const titleWords = title.split(/[\s、。・]+/).filter(word => word.length >= 2)
    keywords.push(...titleWords.slice(0, 3))
  }
  
  // コンテンツから頻出キーワードを抽出
  if (content && keywords.length < 5) {
    // 括弧内のキーワード、引用符内のキーワードなどを取得
    const quotedMatch = content.match(/「([^」]+)」/g)
    if (quotedMatch) {
      quotedMatch.slice(0, 2).forEach(m => {
        const keyword = m.replace(/[「」]/g, '')
        if (keyword.length >= 2 && keyword.length <= 20 && !keywords.includes(keyword)) {
          keywords.push(keyword)
        }
      })
    }
  }
  
  // AI関連のデフォルトキーワードを追加
  const defaultKeywords = ['AI', '活用', '初心者向け']
  defaultKeywords.forEach(kw => {
    if (keywords.length < 5 && !keywords.includes(kw)) {
      keywords.push(kw)
    }
  })
  
  return keywords.slice(0, 5).join(', ')
}

// AI記事生成API
app.post('/admin/api/ai/generate-article', async (c) => {
  try {
    const { topic, articleType, articleLength, tone, additionalInstructions } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: 'テーマを入力してください' }, 400)
    }
    
    if (!c.env.GEMINI_API_KEY) {
      return c.json({ error: 'GEMINI_API_KEY が設定されていません' }, 500)
    }
    
    // 文字数マッピング
    const lengthMap: Record<string, string> = {
      short: '1000〜1500文字',
      medium: '2000〜2500文字',
      long: '3000〜4000文字'
    }
    
    // 記事タイプの説明
    const typeDescriptions: Record<string, string> = {
      'how-to': '使い方ガイド形式で、ステップバイステップで説明',
      'tutorial': 'チュートリアル形式で、実践的な内容',
      'case-study': '事例紹介形式で、具体的な活用例',
      'news': 'ニュース解説形式で、最新情報と背景',
      'opinion': 'コラム・意見形式で、個人的な見解',
      'comparison': '比較記事形式で、複数の選択肢を比較'
    }
    
    // トーンの説明
    const toneDescriptions: Record<string, string> = {
      friendly: '親しみやすく、読者に語りかけるような',
      professional: 'プロフェッショナルで信頼性の高い',
      casual: 'カジュアルで気軽に読める',
      educational: '教育的で分かりやすい'
    }
    
    const prompt = `以下の条件でブログ記事を生成してください。

【テーマ】
${topic}

【記事タイプ】
${typeDescriptions[articleType] || '使い方ガイド形式'}

【文字数】
${lengthMap[articleLength] || '2000〜2500文字'}

【トーン】
${toneDescriptions[tone] || '親しみやすく、読者に語りかけるような'}

${additionalInstructions ? `【追加の指示】\n${additionalInstructions}\n` : ''}

【出力形式】JSON のみ出力（マークダウンコードブロック不要）
{
  "title": "SEOに最適化された魅力的なタイトル(30〜40文字)",
  "content": "本文(Markdown形式、見出し・リスト・強調を含む)",
  "excerpt": "記事の概要・要約(80〜120文字、本文の冒頭をわかりやすく要約)",
  "metaDescription": "メタディスクリプション(120文字以内、SEO最適化)",
  "categories": ["カテゴリ1", "カテゴリ2", "カテゴリ3"],
  "tags": ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]
}

【カテゴリ候補】
- AI活用術
- ChatGPT
- AIツール
- 業務効率化
- 学習・教育
- 開発・技術
- AIニュース
- 初心者ガイド
- プロンプト

【重要】
- 内容は正確で実用的に
- 初心者にも分かりやすく
- 具体例を含める
- SEOキーワードを自然に含める
- 見出し(##)、リスト(-)、強調(**)を使用
`

    // Gemini API呼び出し
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro']
    
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${c.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8000
              }
            })
          }
        )
        
        if (!response.ok) {
          if (response.status === 429) {
            console.log(`[AI Writer] ${model}: Rate limit, trying next model`)
            await new Promise(r => setTimeout(r, 1000))
            continue
          }
          continue
        }
        
        const data = await response.json() as any
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        
        // JSONを抽出してパース
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.log(`[AI Writer] ${model}: JSON not found in response`)
          continue
        }
        
        // 制御文字を除去してJSONをクリーンアップ
        let cleanJson = jsonMatch[0]
          // 改行・タブ以外の制御文字を除去
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          // 文字列内の改行をエスケープ（JSONの文字列値内の改行をエスケープ）
          .replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
          })
        
        let parsed: any
        try {
          parsed = JSON.parse(cleanJson)
        } catch (parseError) {
          console.log(`[AI Writer] ${model}: JSON parse error, attempting repair`)
          // 最後の手段: 構造化データを手動抽出
          const titleMatch = text.match(/"title"\s*:\s*"([^"]*)"/)
          const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"metaDescription|"\s*,\s*"categories|"\s*})/)
          const metaMatch = text.match(/"metaDescription"\s*:\s*"([^"]*)"/)
          
          if (titleMatch) {
            parsed = {
              title: titleMatch[1],
              content: contentMatch ? contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '',
              metaDescription: metaMatch ? metaMatch[1] : '',
              categories: ['AI活用術'],
              tags: ['AI']
            }
          } else {
            console.log(`[AI Writer] ${model}: Could not extract data`)
            continue
          }
        }
        
        // Unsplash画像検索
        const images: string[] = []
        if (c.env.UNSPLASH_ACCESS_KEY) {
          try {
            const keyword = topic.split(/[\s、。]/)[0]
            const unsplashResponse = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword + ' technology AI')}&per_page=4&orientation=landscape`,
              {
                headers: { 'Authorization': `Client-ID ${c.env.UNSPLASH_ACCESS_KEY}` }
              }
            )
            
            if (unsplashResponse.ok) {
              const unsplashData = await unsplashResponse.json() as any
              images.push(...unsplashData.results.map((r: any) => r.urls.regular))
            }
          } catch (error) {
            console.error('[AI Writer] Unsplash image fetch error:', error)
          }
        }
        
        console.log(`[AI Writer] Article generated successfully with ${model}`)
        return c.json({
          title: parsed.title || topic,
          content: parsed.content || '',
          excerpt: parsed.excerpt || parsed.metaDescription || '',
          metaDescription: parsed.metaDescription || '',
          categories: parsed.categories || ['AI活用術'],
          tags: parsed.tags || [],
          images
        })
        
      } catch (error: any) {
        console.error(`[AI Writer] ${model} error:`, error.message || error)
        continue
      }
    }
    
    return c.json({ error: 'AI記事生成に失敗しました。しばらく待ってから再試行してください。' }, 500)
    
  } catch (error) {
    console.error('[AI Writer] Generate article error:', error)
    return c.json({ error: 'エラーが発生しました' }, 500)
  }
})

// AI講座生成API
app.post('/admin/api/ai/generate-course', async (c) => {
  try {
    const { topic, category, level, priceRange, additionalInstructions } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: '講座テーマを入力してください' }, 400)
    }
    
    if (!c.env.GEMINI_API_KEY) {
      return c.json({ error: 'GEMINI_API_KEY が設定されていません' }, 500)
    }
    
    // 価格範囲のマッピング
    const priceRangeMap: Record<string, { min: number; max: number }> = {
      '5000-10000': { min: 5000, max: 10000 },
      '10000-15000': { min: 10000, max: 15000 },
      '15000-25000': { min: 15000, max: 25000 },
      '25000-50000': { min: 25000, max: 50000 }
    }
    const priceInfo = priceRangeMap[priceRange] || { min: 10000, max: 15000 }
    
    const prompt = `以下の条件でAI講座の情報を生成してください。

【講座テーマ】
${topic}

【カテゴリ】
${category || 'AI入門'}

【レベル】
${level || '初級'}

【価格範囲】
${priceInfo.min}円〜${priceInfo.max}円

${additionalInstructions ? `【追加の指示】\n${additionalInstructions}\n` : ''}

【出力形式】JSON のみ出力（マークダウンコードブロック不要）
{
  "title": "魅力的な講座タイトル(20〜40文字)",
  "catchphrase": "キャッチフレーズ(30文字以内)",
  "description": "講座説明(Markdown形式、300〜500文字、特徴・メリットを含む)",
  "targetAudience": ["対象者1", "対象者2", "対象者3", "対象者4"],
  "features": ["特徴1", "特徴2", "特徴3", "特徴4"],
  "curriculum": [
    {"title": "セッション1タイトル", "description": "内容説明"},
    {"title": "セッション2タイトル", "description": "内容説明"},
    {"title": "セッション3タイトル", "description": "内容説明"},
    {"title": "セッション4タイトル", "description": "内容説明"}
  ],
  "duration": "所要時間（例: 120分）",
  "price": 価格（数値のみ）
}

【重要】
- 講座はmirAIcafe（AIカフェ）で開催
- 講師は「mion」固定
- 具体的で実践的な内容
- 初心者にも分かりやすい言葉で
- ハンズオン形式を推奨`

    // Gemini API呼び出し
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-pro']
    
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${c.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4000
              }
            })
          }
        )
        
        if (!response.ok) {
          if (response.status === 429) {
            console.log(`[AI Course Generator] ${model}: Rate limit, trying next model`)
            await new Promise(r => setTimeout(r, 1000))
            continue
          }
          continue
        }
        
        const data = await response.json() as any
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        
        // JSONを抽出
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          console.log(`[AI Course Generator] ${model}: JSON not found`)
          continue
        }
        
        // 制御文字を除去
        let cleanJson = jsonMatch[0]
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
          })
        
        let parsed: any
        try {
          parsed = JSON.parse(cleanJson)
        } catch (parseError) {
          console.log(`[AI Course Generator] ${model}: JSON parse error`)
          continue
        }
        
        // Unsplash画像検索
        const images: string[] = []
        if (c.env.UNSPLASH_ACCESS_KEY) {
          try {
            const keyword = topic.split(/[\s、。]/)[0]
            const unsplashResponse = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword + ' technology learning')}&per_page=4&orientation=landscape`,
              {
                headers: { 'Authorization': `Client-ID ${c.env.UNSPLASH_ACCESS_KEY}` }
              }
            )
            
            if (unsplashResponse.ok) {
              const unsplashData = await unsplashResponse.json() as any
              images.push(...unsplashData.results.map((r: any) => r.urls.regular))
            }
          } catch (error) {
            console.error('[AI Course Generator] Unsplash error:', error)
          }
        }
        
        console.log(`[AI Course Generator] Course generated successfully with ${model}`)
        return c.json({
          title: parsed.title || topic,
          catchphrase: parsed.catchphrase || '',
          description: parsed.description || '',
          targetAudience: parsed.targetAudience || [],
          features: parsed.features || [],
          curriculum: parsed.curriculum || [],
          duration: parsed.duration || '120分',
          price: parsed.price || priceInfo.min,
          images
        })
        
      } catch (error: any) {
        console.error(`[AI Course Generator] ${model} error:`, error.message || error)
        continue
      }
    }
    
    return c.json({ error: 'AI講座生成に失敗しました。しばらく待ってから再試行してください。' }, 500)
    
  } catch (error) {
    console.error('[AI Course Generator] Error:', error)
    return c.json({ error: 'エラーが発生しました' }, 500)
  }
})

// AIポートフォリオ生成API
app.post('/admin/api/ai/generate-portfolio', async (c) => {
  try {
    const { topic, category, technologies, description, duration, role, additionalInstructions } = await c.req.json()
    
    if (!topic) {
      return c.json({ error: 'プロジェクト名を入力してください' }, 400)
    }
    
    if (!c.env.GEMINI_API_KEY) {
      return c.json({ error: 'GEMINI_API_KEY is not configured' }, 500)
    }
    
    const techList = (technologies || []).join(', ')
    
    const prompt = `あなたはプロのポートフォリオライターです。以下の情報からポートフォリオの説明文を生成してください。

【プロジェクト名/テーマ】
${topic}

【カテゴリ】
${category || '一般'}

【使用技術】
${techList || '未指定'}

【概要・目的】
${description || '未指定'}

【制作期間】
${duration || '未指定'}

【担当役割】
${role || '未指定'}

【追加の指示】
${additionalInstructions || 'なし'}

【出力形式】
以下のJSON形式で出力してください：
{
  "title": "魅力的なプロジェクトタイトル",
  "description": "プロジェクトの概要説明（100〜150文字）",
  "content": "詳細な説明（Markdown形式、300〜500文字程度）。以下を含める：\\n## 概要\\n\\n## 主な機能\\n\\n## 技術的なポイント\\n\\n## 成果・学び",
  "technologies": ["技術1", "技術2", "技術3"],
  "meta_description": "SEO用メタディスクリプション（120文字以内）",
  "keywords": "キーワード1, キーワード2, キーワード3"
}

【注意事項】
- 説明は具体的かつ専門性が伝わるように
- 技術は入力されたものを優先しつつ、関連技術も追加可能
- Markdownのコンテンツは改行を\\nで表現
- JSON以外の説明は不要`

    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro']
    
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${c.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
          }
        )
        
        if (!response.ok) {
          if (response.status === 429) {
            await new Promise(r => setTimeout(r, 1000))
            continue
          }
          continue
        }
        
        const data = await response.json() as any
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
        
        // JSONを抽出
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) continue
        
        // 制御文字を除去
        let cleanJson = jsonMatch[0]
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
          .replace(/("(?:[^"\\]|\\.)*")/g, (match: string) => {
            return match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
          })
        
        let parsed: any
        try {
          parsed = JSON.parse(cleanJson)
        } catch (parseError) {
          continue
        }
        
        // Unsplash画像検索
        const images: { url: string; alt: string }[] = []
        if (c.env.UNSPLASH_ACCESS_KEY) {
          try {
            const keyword = topic.split(/[\s、。]/)[0]
            const unsplashResponse = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword + ' technology project')}&per_page=6&orientation=landscape`,
              {
                headers: { 'Authorization': `Client-ID ${c.env.UNSPLASH_ACCESS_KEY}` }
              }
            )
            
            if (unsplashResponse.ok) {
              const unsplashData = await unsplashResponse.json() as any
              images.push(...unsplashData.results.map((r: any) => ({
                url: r.urls.regular,
                alt: r.alt_description || keyword
              })))
            }
          } catch (error) {
            console.error('[AI Portfolio Generator] Unsplash error:', error)
          }
        }
        
        console.log(`[AI Portfolio Generator] Generated successfully with ${model}`)
        return c.json({
          title: parsed.title || topic,
          description: parsed.description || '',
          content: parsed.content || '',
          technologies: parsed.technologies || technologies || [],
          meta_description: parsed.meta_description || '',
          keywords: parsed.keywords || '',
          image_suggestions: images
        })
        
      } catch (error: any) {
        console.error(`[AI Portfolio Generator] ${model} error:`, error.message || error)
        continue
      }
    }
    
    return c.json({ error: 'AIポートフォリオ生成に失敗しました。しばらく待ってから再試行してください。' }, 500)
    
  } catch (error) {
    console.error('[AI Portfolio Generator] Error:', error)
    return c.json({ error: 'エラーが発生しました' }, 500)
  }
})

// 講座保存API（JSON）- AI講座生成用
app.post('/admin/api/courses', async (c) => {
  try {
    const body = await c.req.json()
    const { title, catchphrase, description, category, level, price, duration, image, targetAudience, features, curriculum, instructor, status } = body
    
    if (!title || !category || !level) {
      return c.json({ error: '必須項目が不足しています' }, 400)
    }
    
    const id = generateCourseId(title)
    
    await c.env.DB.prepare(`
      INSERT INTO courses (id, title, catchphrase, description, price, duration, level, category, image,
                          instructor, target_audience, curriculum, features, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      title,
      catchphrase || '',
      description || '',
      price || 0,
      duration || '',
      level,
      category,
      image || '',
      instructor || 'mion',
      JSON.stringify(targetAudience || []),
      JSON.stringify(curriculum || []),
      JSON.stringify(features || []),
      status || 'draft'
    ).run()
    
    return c.json({ success: true, id, message: '講座を保存しました' })
  } catch (error) {
    console.error('Course API create error:', error)
    return c.json({ error: '講座の保存に失敗しました' }, 500)
  }
})

// ===== AI News API (Frontend) =====

// 承認済みAIニュース取得（フロントエンド用）
app.get('/api/ai-news', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10')
  const status = c.req.query('status') || 'approved'
  
  try {
    const result = await c.env.DB.prepare(`
      SELECT id, title, url, summary, source, published_at, ai_relevance_score
      FROM ai_news
      WHERE status = ?
      ORDER BY published_at DESC
      LIMIT ?
    `).bind(status, limit).all()
    
    return c.json(result.results || [])
  } catch (error) {
    console.error('AI News API error:', error)
    return c.json([])
  }
})

// ===== Admin AI News API =====

// AIニュース一覧（管理画面用）
app.get('/admin/api/ai-news', async (c) => {
  const status = c.req.query('status')
  
  try {
    let query = 'SELECT * FROM ai_news'
    const params: any[] = []
    
    if (status && status !== 'all') {
      query += ' WHERE status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100'
    
    const stmt = params.length > 0 
      ? c.env.DB.prepare(query).bind(...params)
      : c.env.DB.prepare(query)
    
    const result = await stmt.all()
    return c.json(result.results || [])
  } catch (error) {
    console.error('Admin AI News list error:', error)
    return c.json([])
  }
})

// AIニュース詳細
app.get('/admin/api/ai-news/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const news = await c.env.DB.prepare(
      'SELECT * FROM ai_news WHERE id = ?'
    ).bind(id).first()
    
    if (!news) {
      return c.json({ error: 'Not found' }, 404)
    }
    return c.json(news)
  } catch (error) {
    console.error('Admin AI News detail error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// AIニュースステータス更新
app.patch('/admin/api/ai-news/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const { status } = await c.req.json()
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    
    await c.env.DB.prepare(
      'UPDATE ai_news SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(status, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Admin AI News update error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// AIニュース削除
app.delete('/admin/api/ai-news/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.DB.prepare(
      'DELETE FROM ai_news WHERE id = ?'
    ).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Admin AI News delete error:', error)
    return c.json({ error: 'Server error' }, 500)
  }
})

// AIニュース手動収集トリガー
app.post('/admin/api/ai-news/collect', async (c) => {
  try {
    console.log('[Manual] AIニュース収集開始')
    const result = await collectAINews({
      DB: c.env.DB,
      GEMINI_API_KEY: c.env.GEMINI_API_KEY || '',
      UNSPLASH_ACCESS_KEY: c.env.UNSPLASH_ACCESS_KEY,
    })
    console.log('[Manual] AIニュース収集完了:', result)
    return c.json(result)
  } catch (error) {
    console.error('AI News collection error:', error)
    return c.json({ error: 'Collection failed', message: String(error) }, 500)
  }
})

// お問い合わせ返信メールAI生成API
app.post('/admin/api/ai/generate-email-reply', async (c) => {
  try {
    const { name, subject, message, type } = await c.req.json()
    
    if (!message) {
      return c.json({ error: 'お問い合わせ内容が必要です' }, 400)
    }
    
    // Gemini APIキーの存在確認
    if (!c.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured')
      // APIキーがない場合はフォールバック
      const fallbackBody = createFallbackEmailReply(name, subject, message, type)
      return c.json({ 
        body: fallbackBody,
        fallback: true
      })
    }
    
    const prompt = `あなたはAI教育サービス「mirAIcafe」のカスタマーサポート担当です。
以下のお問い合わせに対する、丁寧で親しみやすい返信メールの本文を作成してください。

【お問い合わせ者】
${name || 'お客様'} 様

【件名】
${subject || '(件名なし)'}

【お問い合わせ種別】
${type || '一般的なお問い合わせ'}

【お問い合わせ内容】
${message}

【返信メール作成のガイドライン】
1. 冒頭は「${name || 'お客様'} 様」で始める
2. 最初にお問い合わせへの感謝を述べる
3. 「mirAIcafe」のカスタマーサポートからの返信であることを明記
4. お問い合わせの内容を確認し、適切な回答や対応を記載
5. 回答が具体的にできない場合は、追加情報が必要な旨を丁寧に説明
6. 最後に「何かご不明な点がございましたら、お気軽にお問い合わせください」という趣旨の文言を入れる
7. 署名として「mirAIcafe 運営事務局」で締める
8. 丁寧だが親しみやすいトーンで
9. メール本文のみを出力（件名や宛先などは不要）

返信メール本文のみを出力してください。`

    // 使用するモデルのリスト（フォールバック順）
    const models = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro'
    ]
    
    let generatedBody = ''
    let lastError: Error | null = null
    
    // 各モデルを順番に試行
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${c.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: prompt }]
              }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024
              }
            })
          }
        )
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
          const errorMessage = errorData.error?.message || `HTTP ${response.status}`
          
          if (response.status === 429 || errorMessage.includes('quota')) {
            console.log(`Model ${model} rate limited, trying next...`)
            continue
          }
          
          throw new Error(`Gemini API error (${model}): ${errorMessage}`)
        }
        
        const data = await response.json() as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ text?: string }>
            }
          }>
          error?: { message?: string }
        }
        
        if (data.error) {
          throw new Error(data.error.message || 'AI処理でエラーが発生しました')
        }
        
        generatedBody = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        
        if (generatedBody) {
          // 生成成功
          break
        }
      } catch (e) {
        lastError = e as Error
        console.error(`Model ${model} failed:`, e)
        continue
      }
    }
    
    // 生成結果があればそれを返す
    if (generatedBody) {
      return c.json({ 
        body: generatedBody.trim(),
        model_used: true
      })
    }
    
    // すべてのモデルが失敗した場合はフォールバック
    console.error('All models failed, using fallback')
    const fallbackBody = createFallbackEmailReply(name, subject, message, type)
    return c.json({ 
      body: fallbackBody,
      fallback: true
    })
    
  } catch (error) {
    console.error('Email reply generation error:', error)
    return c.json({ error: 'メール文面の生成に失敗しました' }, 500)
  }
})

// メール返信のフォールバック生成
function createFallbackEmailReply(name: string, subject: string, message: string, type: string): string {
  const customerName = name || 'お客様'
  return `${customerName} 様

お問い合わせいただきありがとうございます。
mirAIcafe 運営事務局です。

「${subject || 'ご連絡'}」についてお問い合わせをいただき、誠にありがとうございます。

お問い合わせの内容を確認させていただきました。
ご質問の件につきまして、下記の通りご回答申し上げます。

【ご回答】
（ここに回答内容を記載してください）

ご不明な点がございましたら、お気軽にお問い合わせください。
今後ともmirAIcafeをよろしくお願いいたします。

--
mirAIcafe 運営事務局
Email: info@miraicafe.com`
}

// ===== アンケート機能 =====

// アンケートフォーム（公開ページ）
app.get('/survey', async (c) => {
  const bookingId = c.req.query('booking_id')
  const courseName = c.req.query('course')
  
  try {
    const questions = await c.env.DB.prepare(`
      SELECT * FROM survey_questions WHERE is_active = 1 ORDER BY sort_order ASC
    `).all()
    
    // 設定を取得
    const settings = await c.env.DB.prepare(`SELECT survey_thank_you_video_url, survey_logo_url FROM site_stats WHERE id = 'main'`).first()
    
    const surveySettings = {
      thank_you_video_url: (settings as any)?.survey_thank_you_video_url || '',
      logo_url: (settings as any)?.survey_logo_url || ''
    }
    
    return c.html(renderSurveyPage(questions.results as any[], bookingId, courseName, surveySettings))
  } catch (error) {
    console.error('Survey page error:', error)
    return c.html(renderSurveyPage([], bookingId, courseName))
  }
})

// アンケート回答送信API
app.post('/api/survey/submit', async (c) => {
  try {
    const body = await c.req.json<{
      booking_id?: number | null
      respondent_name?: string | null
      respondent_email?: string | null
      course_name?: string | null
      answers: Record<string, any>
      overall_rating: number
      publish_consent: string
    }>()
    
    await c.env.DB.prepare(`
      INSERT INTO survey_responses (booking_id, respondent_name, respondent_email, course_name, answers, overall_rating, publish_consent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      body.booking_id || null,
      body.respondent_name || null,
      body.respondent_email || null,
      body.course_name || null,
      JSON.stringify(body.answers),
      body.overall_rating,
      body.publish_consent || 'no'
    ).run()
    
    // TODO: お礼動画URLを管理画面から設定可能に
    const thankYouVideoUrl = null
    
    return c.json({ success: true, thankYouVideoUrl })
  } catch (error) {
    console.error('Survey submit error:', error)
    return c.json({ success: false, error: '送信に失敗しました' }, 500)
  }
})

// ===== アンケート管理画面 =====

// アンケート分析ダッシュボード
app.get('/admin/surveys', async (c) => {
  try {
    // 質問一覧
    const questions = await c.env.DB.prepare(`
      SELECT * FROM survey_questions ORDER BY sort_order ASC
    `).all()
    
    // 統計データ
    const totalResult = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM survey_responses`).first()
    const avgResult = await c.env.DB.prepare(`SELECT AVG(overall_rating) as avg FROM survey_responses WHERE overall_rating IS NOT NULL`).first()
    
    // 評価分布
    const distribution: Record<number, number> = {}
    for (let i = 1; i <= 5; i++) {
      const count = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM survey_responses WHERE overall_rating = ?`).bind(i).first()
      distribution[i] = (count as any)?.count || 0
    }
    
    // 公開同意状況
    const consentStats: Record<string, number> = {}
    for (const consent of ['yes', 'anonymous', 'no']) {
      const count = await c.env.DB.prepare(`SELECT COUNT(*) as count FROM survey_responses WHERE publish_consent = ?`).bind(consent).first()
      consentStats[consent] = (count as any)?.count || 0
    }
    
    // 質問別統計（rating質問のみ）
    const questionStats: Record<number, { avg: number; count: number }> = {}
    const ratingQuestions = (questions.results || []).filter((q: any) => q.question_type === 'rating')
    
    for (const q of ratingQuestions as any[]) {
      const responses = await c.env.DB.prepare(`SELECT answers FROM survey_responses`).all()
      let sum = 0
      let count = 0
      for (const r of responses.results || []) {
        const answers = JSON.parse((r as any).answers || '{}')
        if (answers[q.id] !== undefined) {
          sum += Number(answers[q.id])
          count++
        }
      }
      questionStats[q.id] = { avg: count > 0 ? sum / count : 0, count }
    }
    
    // 最近の回答
    const recentResponses = await c.env.DB.prepare(`
      SELECT * FROM survey_responses ORDER BY created_at DESC LIMIT 10
    `).all()
    
    const stats = {
      totalResponses: (totalResult as any)?.count || 0,
      avgOverallRating: (avgResult as any)?.avg || 0,
      ratingDistribution: distribution,
      publishConsentStats: consentStats,
      questionStats,
      recentResponses: recentResponses.results || []
    }
    
    return c.html(renderSurveyDashboard(stats as any, questions.results as any[]))
  } catch (error) {
    console.error('Survey dashboard error:', error)
    const emptyStats = {
      totalResponses: 0,
      avgOverallRating: 0,
      ratingDistribution: {},
      publishConsentStats: {},
      questionStats: {},
      recentResponses: []
    }
    return c.html(renderSurveyDashboard(emptyStats as any, []))
  }
})

// 質問編集ページ
app.get('/admin/surveys/questions', async (c) => {
  try {
    const questions = await c.env.DB.prepare(`
      SELECT * FROM survey_questions ORDER BY sort_order ASC
    `).all()
    return c.html(renderSurveyQuestions(questions.results as any[]))
  } catch (error) {
    console.error('Survey questions error:', error)
    return c.html(renderSurveyQuestions([]))
  }
})

// 回答一覧ページ
app.get('/admin/surveys/responses', async (c) => {
  try {
    const responses = await c.env.DB.prepare(`
      SELECT * FROM survey_responses ORDER BY created_at DESC
    `).all()
    const questions = await c.env.DB.prepare(`
      SELECT * FROM survey_questions ORDER BY sort_order ASC
    `).all()
    return c.html(renderSurveyResponses(responses.results as any[], questions.results as any[]))
  } catch (error) {
    console.error('Survey responses error:', error)
    return c.html(renderSurveyResponses([], []))
  }
})

// アンケート設定ページ
app.get('/admin/surveys/settings', async (c) => {
  try {
    const settings = await c.env.DB.prepare(`
      SELECT survey_thank_you_video_url, survey_logo_url FROM site_stats WHERE id = 'main'
    `).first()
    
    return c.html(renderSurveySettings({
      thank_you_video_url: (settings as any)?.survey_thank_you_video_url || '',
      logo_url: (settings as any)?.survey_logo_url || ''
    }))
  } catch (error) {
    console.error('Survey settings error:', error)
    return c.html(renderSurveySettings({ thank_you_video_url: '', logo_url: '' }))
  }
})

// アンケート設定保存API
app.put('/admin/api/survey/settings', async (c) => {
  try {
    const body = await c.req.json<{
      thank_you_video_url: string
      logo_url: string
    }>()
    
    await c.env.DB.prepare(`
      UPDATE site_stats SET 
        survey_thank_you_video_url = ?,
        survey_logo_url = ?,
        updated_at = datetime('now')
      WHERE id = 'main'
    `).bind(
      body.thank_you_video_url || '',
      body.logo_url || ''
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Survey settings update error:', error)
    return c.json({ success: false, error: '保存に失敗しました' }, 500)
  }
})

// 質問取得API
app.get('/admin/api/surveys/questions/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const question = await c.env.DB.prepare(`SELECT * FROM survey_questions WHERE id = ?`).bind(id).first()
    return c.json(question)
  } catch (error) {
    return c.json({ error: '取得に失敗しました' }, 500)
  }
})

// 質問追加API
app.post('/admin/api/surveys/questions', async (c) => {
  try {
    const body = await c.req.json<{
      question_text: string
      question_type: string
      question_category: string
      options: string[] | null
      sort_order: number
      is_required: number
    }>()
    
    await c.env.DB.prepare(`
      INSERT INTO survey_questions (question_text, question_type, question_category, options, sort_order, is_required, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).bind(
      body.question_text,
      body.question_type,
      body.question_category,
      body.options ? JSON.stringify(body.options) : null,
      body.sort_order,
      body.is_required
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Question create error:', error)
    return c.json({ error: '作成に失敗しました' }, 500)
  }
})

// 質問更新API
app.put('/admin/api/surveys/questions/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json<{
      question_text: string
      question_type: string
      question_category: string
      options: string[] | null
      sort_order: number
      is_required: number
    }>()
    
    await c.env.DB.prepare(`
      UPDATE survey_questions SET
        question_text = ?,
        question_type = ?,
        question_category = ?,
        options = ?,
        sort_order = ?,
        is_required = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.question_text,
      body.question_type,
      body.question_category,
      body.options ? JSON.stringify(body.options) : null,
      body.sort_order,
      body.is_required,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Question update error:', error)
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

// 質問削除API
app.delete('/admin/api/surveys/questions/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`DELETE FROM survey_questions WHERE id = ?`).bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: '削除に失敗しました' }, 500)
  }
})

// 質問有効/無効切り替えAPI
app.post('/admin/api/surveys/questions/:id/toggle', async (c) => {
  const id = c.req.param('id')
  try {
    await c.env.DB.prepare(`
      UPDATE survey_questions SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?
    `).bind(id).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: '更新に失敗しました' }, 500)
  }
})

// 回答CSVエクスポートAPI
app.get('/admin/api/surveys/export', async (c) => {
  try {
    const responses = await c.env.DB.prepare(`
      SELECT * FROM survey_responses ORDER BY created_at DESC
    `).all()
    const questions = await c.env.DB.prepare(`
      SELECT * FROM survey_questions ORDER BY sort_order ASC
    `).all()
    
    // CSVヘッダー
    const headers = ['ID', '回答日時', '回答者名', 'メール', '講座名', '総合評価', '公開同意']
    const questionHeaders = (questions.results || []).map((q: any) => q.question_text.substring(0, 20))
    
    // CSV行
    const rows = (responses.results || []).map((r: any) => {
      const answers = JSON.parse(r.answers || '{}')
      const questionValues = (questions.results || []).map((q: any) => {
        const val = answers[q.id]
        if (val === undefined) return ''
        if (Array.isArray(val)) return val.join(';')
        return String(val)
      })
      
      return [
        r.id,
        r.created_at,
        r.respondent_name || '',
        r.respondent_email || '',
        r.course_name || '',
        r.overall_rating || '',
        r.publish_consent,
        ...questionValues
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    })
    
    const csv = [
      [...headers, ...questionHeaders].join(','),
      ...rows
    ].join('\n')
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="survey_responses_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    return c.json({ error: 'エクスポートに失敗しました' }, 500)
  }
})

// 404 Not Found - キャッチオールルート
app.all('*', (c) => {
  return c.html(render404Page(), 404)
})

export default app
