import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-pages'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

// Layout
import { renderLayout } from './components/layout'

// Pages
import { renderHomePage } from './pages/home'
import { renderCoursesPage, renderCourseDetailPage, renderSeriesDetailPage } from './pages/courses'
import { renderReservationPage } from './pages/reservation'
import { renderBlogPage, renderBlogPostPage } from './pages/blog'
import { renderContactPage } from './pages/contact'
import { renderPolicyPage, type Policy } from './pages/policy'
import { renderAINewsPage } from './pages/ai-news'
import { renderPortfolioListPage, renderPortfolioDetailPage } from './pages/portfolio'
import { renderTokushohoPage } from './pages/tokushoho'
import { render404Page } from './pages/not-found'
import { renderPaymentCompletePage } from './pages/payment-complete'
import { renderCalendarPage } from './pages/calendar'
import { renderConsultationPage } from './pages/consultation'

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
import { renderPaymentsList, type Payment } from './admin/payments'
import { renderPricingPatternsList, renderPricingPatternForm } from './admin/pricing-patterns'
import { renderCourseSeriesList, renderCourseSeriesForm } from './admin/course-series'
import { renderWorkspaceAdmin } from './admin/workspace'
import { renderConsultationAdmin } from './admin/consultations'

// Services
import { 
  sendContactNotificationToAdmin,
  sendReservationNotificationToAdmin,
  sendReservationConfirmationToCustomer,
  sendReviewNotificationToAdmin,
  sendBookingConfirmationEmail,
  sendWorkspaceConfirmationEmail,
  sendReminderEmail
} from './services/email'
import { 
  generateSEOSuggestions, 
  getDefaultSEOData,
  type PageContent 
} from './services/seo'
import { collectAINews } from './services/ai-news-collector'
import { 
  createStripeClient, 
  createCheckoutSession, 
  formatAmount, 
  getPaymentStatusLabel,
  createCourseSeriesStripeProducts,
  updateStripeProduct,
  archiveStripeProduct
} from './stripe'
import { generateAllCalendarLinks, generateEventDescription, type CalendarEvent } from './services/calendar'
import { getAvailableDates, calculatePrice, formatDateJa } from './services/google-calendar'
import { uploadToSupabase, deleteFromSupabase, type SupabaseConfig } from './services/supabase-storage'

// Data
import { courses, blogPosts, schedules, portfolios } from './data'

// Types
type Bindings = {
  DB: D1Database
  R2_BUCKET: R2Bucket
  RESEND_API_KEY?: string
  GEMINI_API_KEY?: string
  UNSPLASH_ACCESS_KEY?: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  GOOGLE_CALENDAR_API_KEY?: string
  GOOGLE_CALENDAR_ID?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// グローバルエラーハンドラー - すべての未処理エラーをキャッチ
app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ 
    error: 'サーバーエラーが発生しました', 
    message: err.message || 'Unknown error'
  }, 500)
})

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
  
  // 各コースのシリーズ情報を取得
  let seriesMap: Record<string, any> = {}
  let courseSeriesList: any[] = []
  try {
    const seriesResult = await c.env.DB.prepare(`
      SELECT c.id as course_id, cs.id as series_id, cs.title as series_title, 
             cs.total_sessions, c.session_number
      FROM courses c
      INNER JOIN course_series cs ON c.series_id = cs.id
      WHERE cs.status = 'published'
    `).all()
    
    for (const row of seriesResult.results || []) {
      seriesMap[row.course_id as string] = {
        seriesId: row.series_id,
        seriesTitle: row.series_title,
        totalSessions: row.total_sessions,
        sessionNumber: row.session_number
      }
    }
    
    // 公開中のコースシリーズを取得
    const seriesListResult = await c.env.DB.prepare(`
      SELECT cs.*, pp.course_discount_rate, pp.early_bird_discount_rate
      FROM course_series cs
      LEFT JOIN pricing_patterns pp ON cs.pricing_pattern_id = pp.id
      WHERE cs.status = 'published'
      ORDER BY cs.is_featured DESC, cs.created_at DESC
    `).all()
    courseSeriesList = seriesListResult.results || []
  } catch (e) {
    console.error('Series map fetch error:', e)
  }
  
  return c.html(renderCoursesPage(allCourses, seriesMap, courseSeriesList))
})

app.get('/courses/:id', async (c) => {
  const id = c.req.param('id')
  const allCourses = await getAllCoursesForFront(c.env.DB)
  const course = allCourses.find((co: any) => co.id === id)
  if (!course) return c.notFound()
  
  // DBからスケジュールを取得
  let courseSchedules: any[] = []
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM schedules WHERE course_id = ? ORDER BY date ASC, start_time ASC
    `).bind(id).all()
    courseSchedules = (result.results || []).map((s: any) => ({
      id: s.id,
      courseId: s.course_id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      capacity: s.capacity,
      enrolled: s.enrolled || 0,
      location: s.location || 'オンライン'
    }))
  } catch (e) {
    console.error('Schedule fetch error:', e)
  }
  
  // コースシリーズ情報を取得（このコースがシリーズに属しているか確認）
  let seriesInfo: any = null
  try {
    // まずコースのseries_idを確認
    const courseResult = await c.env.DB.prepare(`
      SELECT series_id, session_number FROM courses WHERE id = ?
    `).bind(id).first()
    
    if (courseResult && courseResult.series_id) {
      // シリーズ情報を取得
      const seriesResult = await c.env.DB.prepare(`
        SELECT cs.*, pp.name as pattern_name, pp.course_discount_rate, pp.early_bird_discount_rate, 
               pp.early_bird_days, pp.has_monthly_option, pp.tax_rate
        FROM course_series cs
        LEFT JOIN pricing_patterns pp ON cs.pricing_pattern_id = pp.id
        WHERE cs.id = ? AND cs.status = 'published'
      `).bind(courseResult.series_id).first()
      
      if (seriesResult) {
        // シリーズに属する全講座を取得
        const linkedCourses = await c.env.DB.prepare(`
          SELECT id, title, session_number FROM courses 
          WHERE series_id = ? ORDER BY session_number ASC
        `).bind(courseResult.series_id).all()
        
        seriesInfo = {
          ...seriesResult,
          currentSessionNumber: courseResult.session_number,
          linkedCourses: linkedCourses.results || []
        }
      }
    }
  } catch (e) {
    console.error('Series info fetch error:', e)
  }
  
  return c.html(renderCourseDetailPage(course, courseSchedules, allCourses, seriesInfo))
})

// Course Series Detail Page
app.get('/series/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    // シリーズ情報を取得
    const seriesResult = await c.env.DB.prepare(`
      SELECT cs.*, pp.name as pattern_name, pp.course_discount_rate, pp.early_bird_discount_rate, 
             pp.early_bird_days, pp.has_monthly_option, pp.tax_rate
      FROM course_series cs
      LEFT JOIN pricing_patterns pp ON cs.pricing_pattern_id = pp.id
      WHERE cs.id = ? AND cs.status = 'published'
    `).bind(id).first()
    
    if (!seriesResult) {
      return c.notFound()
    }
    
    // シリーズに属する講座を取得
    const coursesResult = await c.env.DB.prepare(`
      SELECT c.*, s.date as next_schedule_date, s.start_time, s.end_time
      FROM courses c
      LEFT JOIN (
        SELECT course_id, date, start_time, end_time,
               ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY date ASC) as rn
        FROM schedules
        WHERE date >= date('now')
      ) s ON c.id = s.course_id AND s.rn = 1
      WHERE c.series_id = ?
      ORDER BY c.session_number ASC
    `).bind(id).all()
    
    const linkedCourses = coursesResult.results || []
    
    // 現在進行中かどうか判定（第1回のスケジュールが過去かどうか）
    const firstCourse = linkedCourses[0]
    let isInProgress = false
    let currentSession = 1
    
    if (firstCourse && firstCourse.next_schedule_date) {
      const firstDate = new Date(firstCourse.next_schedule_date as string)
      isInProgress = firstDate < new Date()
    }
    
    // 各講座の次回スケジュールを確認して現在のセッションを判定
    for (let i = 0; i < linkedCourses.length; i++) {
      const course = linkedCourses[i] as any
      if (course.next_schedule_date) {
        const scheduleDate = new Date(course.next_schedule_date)
        if (scheduleDate >= new Date()) {
          currentSession = i + 1
          break
        }
      }
    }
    
    return c.html(renderSeriesDetailPage(seriesResult as any, linkedCourses as any[], isInProgress, currentSession))
  } catch (e) {
    console.error('Series detail error:', e)
    return c.notFound()
  }
})

// Reservation（DBからデータを取得）
app.get('/reservation', async (c) => {
  const courseId = c.req.query('course')
  const seriesId = c.req.query('series')
  const pricingType = c.req.query('pricing') || 'single' // single, course, early, monthly
  
  const allCourses = await getAllCoursesForFront(c.env.DB)
  const course = courseId ? allCourses.find((co: any) => co.id === courseId) : null
  
  // DBからスケジュールを取得
  let allSchedules: any[] = []
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM schedules ORDER BY date ASC, start_time ASC
    `).all()
    allSchedules = (result.results || []).map((s: any) => ({
      id: s.id,
      courseId: s.course_id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      capacity: s.capacity,
      enrolled: s.enrolled || 0,
      location: s.location || 'オンライン'
    }))
  } catch (e) {
    console.error('Schedule fetch error:', e)
  }
  
  // シリーズ情報を取得
  let seriesInfo: any = null
  if (seriesId) {
    try {
      const seriesResult = await c.env.DB.prepare(`
        SELECT cs.*, pp.name as pattern_name, pp.course_discount_rate, pp.early_bird_discount_rate, 
               pp.early_bird_days, pp.has_monthly_option, pp.tax_rate
        FROM course_series cs
        LEFT JOIN pricing_patterns pp ON cs.pricing_pattern_id = pp.id
        WHERE cs.id = ? AND cs.status = 'published'
      `).bind(seriesId).first()
      
      if (seriesResult) {
        // リンクされた講座を取得
        const linkedCourses = await c.env.DB.prepare(`
          SELECT id, title, session_number FROM courses 
          WHERE series_id = ? ORDER BY session_number ASC
        `).bind(seriesId).all()
        
        // 開催期を取得
        const termsResult = await c.env.DB.prepare(`
          SELECT ct.*, 
            (SELECT COUNT(*) FROM schedules s 
             JOIN courses c ON s.course_id = c.id 
             WHERE c.series_id = ct.series_id AND s.term_id = ct.id) as schedule_count
          FROM course_terms ct
          WHERE ct.series_id = ? AND ct.status IN ('upcoming', 'ongoing', 'active')
          ORDER BY ct.start_date ASC
        `).bind(seriesId).all()
        
        // 各開催期の日程詳細を取得
        const terms = []
        for (const term of (termsResult.results || [])) {
          const termSchedules = await c.env.DB.prepare(`
            SELECT s.*, c.title as course_title, c.session_number
            FROM schedules s
            JOIN courses c ON s.course_id = c.id
            WHERE s.term_id = ? AND c.series_id = ?
            ORDER BY c.session_number ASC
          `).bind(term.id, seriesId).all()
          
          terms.push({
            ...term,
            schedules: termSchedules.results || []
          })
        }
        
        seriesInfo = {
          ...seriesResult,
          linkedCourses: linkedCourses.results || [],
          terms: terms
        }
      }
    } catch (e) {
      console.error('Series info fetch error:', e)
    }
  }
  
  return c.html(renderReservationPage(allCourses, allSchedules, course, seriesInfo, pricingType))
})

// 重複予約チェックAPI
app.post('/api/check-duplicate-booking', async (c) => {
  try {
    const body = await c.req.json()
    const { email, seriesId, termId, courseId, scheduleId, pricingType } = body
    
    if (!email) {
      return c.json({ error: 'email required' }, 400)
    }
    
    let existingBooking = null
    let message = ''
    
    if (pricingType === 'single' && courseId) {
      // 単発予約の重複チェック
      let scheduleDate = null
      if (scheduleId) {
        const schedule = await c.env.DB.prepare(`
          SELECT date FROM schedules WHERE id = ?
        `).bind(scheduleId).first() as any
        scheduleDate = schedule?.date
      }
      
      existingBooking = await c.env.DB.prepare(`
        SELECT id, course_name, preferred_date, created_at FROM bookings 
        WHERE course_id = ? AND customer_email = ? AND payment_status = 'paid'
        ${scheduleDate ? "AND preferred_date = ?" : ""}
        ORDER BY id DESC LIMIT 1
      `).bind(...(scheduleDate ? [courseId, email, scheduleDate] : [courseId, email])).first()
      
      if (existingBooking) {
        message = `この講座は既に予約済みです（予約日: ${existingBooking.preferred_date || '未定'}）`
      }
    } else if (seriesId && termId) {
      // シリーズ一括予約の重複チェック
      existingBooking = await c.env.DB.prepare(`
        SELECT series_booking_id, COUNT(*) as booking_count, MIN(created_at) as created_at
        FROM bookings 
        WHERE series_id = ? AND term_id = ? AND customer_email = ? AND payment_status = 'paid'
        GROUP BY series_booking_id
        LIMIT 1
      `).bind(seriesId, termId, email).first()
      
      if (existingBooking) {
        message = `このコースは既に全${existingBooking.booking_count}回分を予約済みです`
      }
    }
    
    return c.json({
      isDuplicate: !!existingBooking,
      existingBooking: existingBooking ? {
        id: existingBooking.id || existingBooking.series_booking_id,
        createdAt: existingBooking.created_at,
        message
      } : null
    })
  } catch (error: any) {
    console.error('Check duplicate booking error:', error)
    return c.json({ error: error.message || 'Unknown error' }, 500)
  }
})

// デバッグ用：Stripeセッション確認エンドポイント
app.get('/api/debug/stripe-session', async (c) => {
  const sessionId = c.req.query('session_id')
  if (!sessionId) {
    return c.json({ error: 'session_id required' })
  }
  
  try {
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe not configured' })
    }
    
    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    return c.json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      metadata: session.metadata,
      customer_email: session.customer_email,
      amount_total: session.amount_total
    })
  } catch (error: any) {
    return c.json({ error: error?.message || 'Unknown error' })
  }
})

// デバッグ用：決済完了処理テストエンドポイント
app.get('/api/debug/test-payment-complete', async (c) => {
  const sessionId = c.req.query('session_id')
  if (!sessionId) {
    return c.json({ error: 'session_id required' })
  }
  
  const debugInfo: any = {
    sessionId,
    steps: [],
    result: null
  }
  
  try {
    if (!c.env.STRIPE_SECRET_KEY) {
      debugInfo.steps.push({ step: 'stripe_check', error: 'Stripe not configured' })
      return c.json(debugInfo)
    }
    
    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
    let session: any
    
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
      debugInfo.steps.push({ step: 'stripe_retrieve', success: true, payment_status: session.payment_status })
    } catch (stripeError: any) {
      debugInfo.steps.push({ step: 'stripe_retrieve', error: stripeError?.message })
      return c.json(debugInfo)
    }
    
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required' && session.status !== 'complete') {
      debugInfo.steps.push({ step: 'payment_check', status: 'not_paid', payment_status: session.payment_status })
      return c.json(debugInfo)
    }
    
    const metadata = session.metadata || {}
    debugInfo.metadata = metadata
    
    const isSeriesBooking = metadata.series_id && metadata.term_id && metadata.pricing_type !== 'single'
    const isSeriesSingleBooking = metadata.series_id && metadata.pricing_type === 'single'
    
    debugInfo.steps.push({ 
      step: 'booking_type_check', 
      isSeriesBooking, 
      isSeriesSingleBooking,
      series_id: metadata.series_id,
      term_id: metadata.term_id,
      pricing_type: metadata.pricing_type
    })
    
    if (isSeriesSingleBooking && metadata.course_id) {
      debugInfo.steps.push({ step: 'series_single_booking_start' })
      
      // スケジュール情報を取得
      let scheduleResult: any = null
      if (metadata.schedule_id) {
        scheduleResult = await c.env.DB.prepare(`
          SELECT * FROM schedules WHERE id = ?
        `).bind(metadata.schedule_id).first()
        debugInfo.steps.push({ step: 'schedule_fetch', method: 'schedule_id', found: !!scheduleResult, schedule: scheduleResult })
      }
      
      if (!scheduleResult) {
        debugInfo.steps.push({ step: 'schedule_fetch', error: 'No schedule found' })
      }
      
      // 既存予約を確認
      const customerEmail = session.customer_email || metadata.customer_email || ''
      const existingBooking = await c.env.DB.prepare(`
        SELECT id, course_id, customer_email, preferred_date, payment_status FROM bookings 
        WHERE course_id = ? AND customer_email = ? AND payment_status = 'paid'
        AND preferred_date = ?
        ORDER BY id DESC LIMIT 1
      `).bind(metadata.course_id, customerEmail, scheduleResult?.date || null).first() as any
      
      debugInfo.steps.push({ 
        step: 'existing_booking_check', 
        query: {
          course_id: metadata.course_id,
          customer_email: customerEmail,
          preferred_date: scheduleResult?.date || null
        },
        found: !!existingBooking,
        existingBooking
      })
      
      if (existingBooking?.id) {
        debugInfo.result = { action: 'existing_booking_found', bookingId: existingBooking.id }
      } else {
        debugInfo.result = { action: 'new_booking_needed', scheduleResult }
      }
    } else {
      debugInfo.steps.push({ step: 'not_series_single_booking' })
      debugInfo.result = { action: 'not_series_single_booking', isSeriesBooking }
    }
    
    return c.json(debugInfo)
  } catch (error: any) {
    debugInfo.error = error?.message || 'Unknown error'
    return c.json(debugInfo)
  }
})

// 決済完了ページ
app.get('/payment-complete', async (c) => {
  const sessionId = c.req.query('session_id')
  
  if (!sessionId) {
    return c.html(renderPaymentCompletePage({
      success: false,
      error: 'セッション情報が見つかりません。'
    }))
  }
  
  try {
    // Stripe APIを使用して決済を取得（環境変数があれば）
    if (c.env.STRIPE_SECRET_KEY) {
      const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
      
      let session: any
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId)
      } catch (stripeError: any) {
        console.error('Stripe session retrieve error:', stripeError?.message || stripeError)
        
        // DBのpaymentsテーブルからセッション情報を探す
        const paymentRecord = await c.env.DB.prepare(`
          SELECT * FROM payments WHERE stripe_checkout_session_id = ?
        `).bind(sessionId).first() as any
        
        if (paymentRecord && paymentRecord.status === 'succeeded') {
          // 決済成功レコードがある場合
          const metadata = paymentRecord.metadata ? JSON.parse(paymentRecord.metadata) : {}
          const seriesBookingId = metadata.series_booking_id || `sb_${Date.now()}`
          const isSeriesBooking = metadata.series_id && metadata.term_id
          
          let courseName = paymentRecord.course_title || ''
          if (metadata.series_id) {
            const seriesResult = await c.env.DB.prepare(`
              SELECT title FROM course_series WHERE id = ?
            `).bind(metadata.series_id).first() as any
            courseName = seriesResult?.title || courseName
          }
          
          return c.html(renderPaymentCompletePage({
            success: true,
            bookingId: seriesBookingId,
            seriesBookingId: seriesBookingId,
            isSeriesBooking: isSeriesBooking,
            customerName: paymentRecord.customer_name || metadata.customer_name || '',
            customerEmail: paymentRecord.customer_email || '',
            courseName: courseName,
            totalPrice: paymentRecord.amount || 0
          }))
        }
        
        // セッションが見つからない場合でも、URLパラメータから復元を試みる
        const urlSeriesId = c.req.query('series_id')
        const urlTermId = c.req.query('term_id')
        
        if (urlSeriesId && urlTermId) {
          const seriesResult = await c.env.DB.prepare(`
            SELECT title FROM course_series WHERE id = ?
          `).bind(urlSeriesId).first() as any
          
          if (seriesResult) {
            // 最新の予約を探す
            const recentBooking = await c.env.DB.prepare(`
              SELECT series_booking_id, customer_name, customer_email 
              FROM bookings 
              WHERE series_id = ? AND term_id = ? AND payment_status = 'paid'
              ORDER BY id DESC LIMIT 1
            `).bind(urlSeriesId, urlTermId).first() as any
            
            return c.html(renderPaymentCompletePage({
              success: true,
              bookingId: recentBooking?.series_booking_id || `pending_${Date.now()}`,
              seriesBookingId: recentBooking?.series_booking_id || `pending_${Date.now()}`,
              isSeriesBooking: true,
              customerName: recentBooking?.customer_name || '',
              customerEmail: recentBooking?.customer_email || '',
              courseName: seriesResult.title,
              totalPrice: 0
            }))
          }
        }
        
        return c.html(renderPaymentCompletePage({
          success: false,
          error: 'セッション情報の取得に失敗しました。決済が完了している場合は確認メールをご確認ください。'
        }))
      }
      
      // payment_statusをチェック（'paid' または 'no_payment_required'）
      console.log('Session payment_status:', session.payment_status, 'status:', session.status)
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required' || session.status === 'complete') {
        const metadata = session.metadata || {}
        console.log('Payment complete - Session metadata:', JSON.stringify(metadata))
        console.log('Payment complete - pricing_type:', metadata.pricing_type, 'series_id:', metadata.series_id, 'course_id:', metadata.course_id)
        
        const isSeriesBooking = metadata.series_id && metadata.term_id && metadata.pricing_type !== 'single'
        const isSeriesSingleBooking = metadata.series_id && metadata.pricing_type === 'single'
        console.log('isSeriesBooking:', isSeriesBooking, 'isSeriesSingleBooking:', isSeriesSingleBooking)
        const customerEmail = session.customer_email || metadata.customer_email || ''
        const customerName = metadata.customer_name || ''
        const customerPhone = metadata.customer_phone || ''
        
        // シリーズ予約の場合、予約情報を取得
        let courseName = metadata.course_title || ''
        let seriesBookingId = `sb_${Date.now()}_${Math.random().toString(36).substring(7)}`
        let singleBookingId: number | null = null
        
        // シリーズ単発参加の場合（schedule_idがない場合でもcourse_idがあれば処理）
        console.log('Checking isSeriesSingleBooking:', isSeriesSingleBooking, 'course_id:', metadata.course_id)
        if (isSeriesSingleBooking && metadata.course_id) {
          console.log('Processing series single booking...')
          // シリーズタイトルを取得
          const seriesResult = await c.env.DB.prepare(`
            SELECT title FROM course_series WHERE id = ?
          `).bind(metadata.series_id).first() as any
          
          // コース情報を取得
          const courseResult = await c.env.DB.prepare(`
            SELECT * FROM courses WHERE id = ?
          `).bind(metadata.course_id).first() as any
          
          // スケジュール情報を取得（schedule_idがあれば使用、なければcourse_id + term_idで検索）
          let scheduleResult: any = null
          if (metadata.schedule_id) {
            scheduleResult = await c.env.DB.prepare(`
              SELECT * FROM schedules WHERE id = ?
            `).bind(metadata.schedule_id).first()
          } else if (metadata.term_id) {
            scheduleResult = await c.env.DB.prepare(`
              SELECT * FROM schedules WHERE course_id = ? AND term_id = ?
            `).bind(metadata.course_id, metadata.term_id).first()
          } else {
            // term_idがない場合は最初のスケジュールを取得
            scheduleResult = await c.env.DB.prepare(`
              SELECT * FROM schedules WHERE course_id = ? ORDER BY date ASC LIMIT 1
            `).bind(metadata.course_id).first()
          }
          
          courseName = courseResult?.title || metadata.course_title
          
          // 既存の予約を確認
          const existingBooking = await c.env.DB.prepare(`
            SELECT id FROM bookings 
            WHERE course_id = ? AND customer_email = ? AND payment_status = 'paid'
            AND preferred_date = ?
            ORDER BY id DESC LIMIT 1
          `).bind(metadata.course_id, customerEmail, scheduleResult?.date || null).first() as any
          
          if (existingBooking?.id) {
            singleBookingId = existingBooking.id
          } else {
            // 単発予約を作成
            console.log('Creating single booking from payment-complete page')
            
            try {
              const result = await c.env.DB.prepare(`
                INSERT INTO bookings (
                  course_id, course_name, customer_name, customer_email, customer_phone,
                  preferred_date, preferred_time, status, payment_status, amount,
                  payment_type, series_id, source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, 'single', ?, 'mirAIcafe')
              `).bind(
                metadata.course_id,
                courseResult?.title || metadata.course_title,
                customerName,
                customerEmail,
                customerPhone || null,
                scheduleResult?.date || null,
                scheduleResult ? `${scheduleResult.start_time} - ${scheduleResult.end_time || ''}` : null,
                session.amount_total || 0,
                metadata.series_id || null
              ).run()
              
              singleBookingId = result.meta.last_row_id as number
              console.log(`Created single booking with id: ${singleBookingId}`)
              
              // paymentsテーブルのステータスを更新
              await c.env.DB.prepare(`
                UPDATE payments SET status = 'succeeded', booking_id = ?, updated_at = datetime('now')
                WHERE stripe_checkout_session_id = ?
              `).bind(singleBookingId, sessionId).run()
              console.log('Updated payment status to succeeded')
            } catch (dbError: any) {
              console.error('Failed to create single booking:', dbError)
              // エラーをpaymentsテーブルに記録
              try {
                await c.env.DB.prepare(`
                  UPDATE payments SET error_message = ?, updated_at = datetime('now')
                  WHERE stripe_checkout_session_id = ?
                `).bind(`booking_error: ${dbError?.message || 'Unknown error'}`, sessionId).run()
              } catch (e) {
                console.error('Failed to log error:', e)
              }
            }
          }
          
          // 予約完了メール送信（単発講座）
          console.log('Sending booking confirmation email - singleBookingId:', singleBookingId, 'customerEmail:', customerEmail)
          if (singleBookingId && customerEmail) {
            try {
              await sendBookingConfirmationEmail(c.env, {
                customerName: customerName,
                customerEmail: customerEmail,
                courseName: courseName,
                scheduleDate: scheduleResult?.date || undefined,
                scheduleTime: scheduleResult ? `${scheduleResult.start_time} - ${scheduleResult.end_time || ''}` : undefined,
                amount: session.amount_total || 0,
                bookingId: singleBookingId,
                isSeriesBooking: false,
                meetUrl: courseResult?.online_url || undefined
              })
              console.log('Booking confirmation email sent successfully to:', customerEmail)
            } catch (emailErr) {
              console.error('Failed to send booking confirmation email:', emailErr)
            }
          } else {
            console.log('Skipping email - missing singleBookingId or customerEmail')
          }
          
          return c.html(renderPaymentCompletePage({
            success: true,
            bookingId: singleBookingId?.toString() || '',
            seriesBookingId: null,
            isSeriesBooking: false,
            customerName: customerName,
            customerEmail: customerEmail,
            courseName: courseName,
            totalPrice: session.amount_total || 0
          }))
        }
        
        if (isSeriesBooking && metadata.series_id && metadata.term_id) {
          // シリーズの詳細を取得
          const seriesResult = await c.env.DB.prepare(`
            SELECT title FROM course_series WHERE id = ?
          `).bind(metadata.series_id).first() as any
          
          courseName = seriesResult?.title || metadata.course_title
          
          // 既存の予約を確認（重複防止）
          const existingBooking = await c.env.DB.prepare(`
            SELECT series_booking_id FROM bookings 
            WHERE series_id = ? AND term_id = ? AND customer_email = ? AND payment_status = 'paid'
            ORDER BY id DESC LIMIT 1
          `).bind(metadata.series_id, metadata.term_id, customerEmail).first() as any
          
          if (existingBooking?.series_booking_id) {
            // 既存の予約がある場合はそれを使用
            seriesBookingId = existingBooking.series_booking_id
          } else {
            // Webhookが到着していない場合、ここで予約を作成
            console.log('Creating booking from payment-complete page (Webhook may be delayed)')
            
            // 該当開催期の全講座と日程を取得
            const linkedCoursesResult = await c.env.DB.prepare(`
              SELECT c.*, s.id as schedule_id, s.date, s.start_time, s.end_time
              FROM courses c
              LEFT JOIN schedules s ON c.id = s.course_id AND s.term_id = ?
              WHERE c.series_id = ?
              ORDER BY c.session_number ASC
            `).bind(metadata.term_id, metadata.series_id).all()
            
            const linkedCourses = linkedCoursesResult.results || []
            const totalSessions = linkedCourses.length
            const totalPrice = session.amount_total || 0
            
            // 全回分の予約を一括登録
            for (const lc of linkedCourses as any[]) {
              try {
                await c.env.DB.prepare(`
                  INSERT INTO bookings (
                    course_id, course_name, customer_name, customer_email, customer_phone,
                    preferred_date, preferred_time, status, payment_status, amount,
                    payment_type, series_booking_id, series_id, term_id, source
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?, ?, ?, ?, 'mirAIcafe')
                `).bind(
                  lc.id,
                  lc.title,
                  customerName,
                  customerEmail,
                  customerPhone || null,
                  lc.date || null,
                  lc.start_time && lc.end_time ? `${lc.start_time} - ${lc.end_time}` : null,
                  Math.round(totalPrice / totalSessions),
                  metadata.pricing_type || 'course',
                  seriesBookingId,
                  metadata.series_id,
                  metadata.term_id
                ).run()
              } catch (dbError) {
                console.error(`Failed to save booking for course ${lc.id}:`, dbError)
              }
            }
            
            console.log(`Created ${linkedCourses.length} bookings with series_booking_id: ${seriesBookingId}`)
            
            // paymentsテーブルも更新
            await c.env.DB.prepare(`
              UPDATE payments SET 
                status = 'succeeded',
                stripe_payment_intent_id = ?,
                metadata = ?
              WHERE stripe_checkout_session_id = ?
            `).bind(
              session.payment_intent || null,
              JSON.stringify({ ...metadata, series_booking_id: seriesBookingId }),
              sessionId
            ).run()
            
            // シリーズ予約完了メール送信
            console.log('Sending series booking confirmation email to:', customerEmail)
            if (customerEmail) {
              const seriesSchedules = (linkedCourses as any[]).map((lc: any) => ({
                courseTitle: lc.title,
                date: lc.date || '未定',
                startTime: lc.start_time || '--:--',
                endTime: lc.end_time || '--:--'
              }))
              
              try {
                await sendBookingConfirmationEmail(c.env, {
                  customerName,
                  customerEmail,
                  courseName,
                  amount: session.amount_total || 0,
                  bookingId: seriesBookingId,
                  isSeriesBooking: true,
                  seriesSchedules
                })
                console.log('Series booking confirmation email sent successfully')
              } catch (emailErr) {
                console.error('Failed to send series confirmation email:', emailErr)
              }
            }
          }
        }
        
        // シリーズに属さない単独講座の単発予約（course_idがあってseries_idがない場合）
        if (!isSeriesBooking && !isSeriesSingleBooking && metadata.course_id) {
          console.log('Processing standalone course single booking...')
          
          // スケジュール情報を取得
          let scheduleResult: any = null
          if (metadata.schedule_id) {
            scheduleResult = await c.env.DB.prepare(`
              SELECT * FROM schedules WHERE id = ?
            `).bind(metadata.schedule_id).first()
          } else {
            // schedule_idがない場合は最初のスケジュールを取得
            scheduleResult = await c.env.DB.prepare(`
              SELECT * FROM schedules WHERE course_id = ? ORDER BY date ASC LIMIT 1
            `).bind(metadata.course_id).first()
          }
          
          // コース情報を取得
          const courseResult = await c.env.DB.prepare(`
            SELECT * FROM courses WHERE id = ?
          `).bind(metadata.course_id).first() as any
          
          courseName = courseResult?.title || metadata.course_title
          
          // 既存の予約を確認
          const existingBooking = await c.env.DB.prepare(`
            SELECT id FROM bookings 
            WHERE course_id = ? AND customer_email = ? AND payment_status = 'paid'
            AND preferred_date = ?
            ORDER BY id DESC LIMIT 1
          `).bind(metadata.course_id, customerEmail, scheduleResult?.date || null).first() as any
          
          if (existingBooking?.id) {
            singleBookingId = existingBooking.id
          } else {
            // 単発予約を作成
            console.log('Creating standalone single booking from payment-complete page')
            
            try {
              const result = await c.env.DB.prepare(`
                INSERT INTO bookings (
                  course_id, course_name, customer_name, customer_email, customer_phone,
                  preferred_date, preferred_time, status, payment_status, amount,
                  payment_type, source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, 'single', 'mirAIcafe')
              `).bind(
                metadata.course_id,
                courseResult?.title || metadata.course_title,
                customerName,
                customerEmail,
                customerPhone || null,
                scheduleResult?.date || null,
                scheduleResult ? `${scheduleResult.start_time} - ${scheduleResult.end_time || ''}` : null,
                session.amount_total || 0
              ).run()
              
              singleBookingId = result.meta.last_row_id as number
              console.log(`Created standalone single booking with id: ${singleBookingId}`)
              
              // paymentsテーブルのステータスを更新
              await c.env.DB.prepare(`
                UPDATE payments SET status = 'succeeded', booking_id = ?, updated_at = datetime('now')
                WHERE stripe_checkout_session_id = ?
              `).bind(singleBookingId, sessionId).run()
              console.log('Updated payment status to succeeded')
              
              // 予約完了メール送信
              console.log('Sending standalone booking confirmation email to:', customerEmail)
              if (customerEmail) {
                try {
                  await sendBookingConfirmationEmail(c.env, {
                    customerName,
                    customerEmail,
                    courseName,
                    scheduleDate: scheduleResult?.date,
                    scheduleTime: scheduleResult ? `${scheduleResult.start_time}〜${scheduleResult.end_time || ''}` : undefined,
                    amount: session.amount_total || 0,
                    bookingId: singleBookingId,
                    isSeriesBooking: false,
                    meetUrl: scheduleResult?.online_url
                  })
                  console.log('Standalone booking confirmation email sent successfully')
                } catch (emailErr) {
                  console.error('Failed to send confirmation email:', emailErr)
                }
              }
            } catch (dbError: any) {
              console.error('Failed to create standalone single booking:', dbError)
            }
          }
          
          return c.html(renderPaymentCompletePage({
            success: true,
            bookingId: singleBookingId?.toString() || '',
            seriesBookingId: null,
            isSeriesBooking: false,
            customerName: customerName,
            customerEmail: customerEmail,
            courseName: courseName,
            totalPrice: session.amount_total || 0
          }))
        }
        
        return c.html(renderPaymentCompletePage({
          success: true,
          bookingId: seriesBookingId,
          seriesBookingId: seriesBookingId,
          isSeriesBooking: isSeriesBooking,
          customerName: customerName,
          customerEmail: customerEmail,
          courseName: courseName,
          totalPrice: session.amount_total || 0
        }))
      } else {
        return c.html(renderPaymentCompletePage({
          success: false,
          error: `決済が完了していません（状態: ${session.payment_status}）。お支払い状態をご確認ください。`
        }))
      }
    }
    
    // Stripe APIがない場合はエラー
    return c.html(renderPaymentCompletePage({
      success: false,
      error: '決済情報の確認に失敗しました（Stripe未設定）。'
    }))
  } catch (error: any) {
    console.error('Payment complete page error:', error?.message || error)
    return c.html(renderPaymentCompletePage({
      success: false,
      error: '決済情報の取得中にエラーが発生しました。決済が完了している場合は確認メールをご確認ください。'
    }))
  }
})

// カレンダー追加ページ（決済完了者のみ）
app.get('/calendar/:bookingId', async (c) => {
  const bookingId = c.req.param('bookingId')
  
  try {
    // シリーズ予約IDで検索
    const booking = await c.env.DB.prepare(`
      SELECT b.*, cs.title as series_title, ct.name as term_name
      FROM bookings b
      LEFT JOIN course_series cs ON b.series_id = cs.id
      LEFT JOIN course_terms ct ON b.term_id = ct.id
      WHERE b.series_booking_id = ? AND b.payment_status = 'paid'
      LIMIT 1
    `).bind(bookingId).first() as any
    
    if (!booking) {
      // 単発予約を検索
      const singleBooking = await c.env.DB.prepare(`
        SELECT * FROM bookings WHERE id = ? AND payment_status = 'paid'
      `).bind(bookingId).first() as any
      
      if (singleBooking) {
        // 単発予約のスケジュールを取得（courses.online_urlを含める）
        const schedule = await c.env.DB.prepare(`
          SELECT s.*, c.title as course_title, c.online_url
          FROM schedules s
          JOIN courses c ON s.course_id = c.id
          WHERE s.course_id = ? AND s.date = ?
        `).bind(singleBooking.course_id, singleBooking.preferred_date).first() as any
        
        return c.html(renderCalendarPage({
          success: true,
          bookingId: bookingId,
          isSeriesBooking: false,
          customerName: singleBooking.customer_name,
          courseName: singleBooking.course_name,
          schedules: schedule ? [{
            session_number: 1,
            course_title: schedule.course_title,
            date: schedule.date,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            online_url: schedule.online_url // courses.online_urlを使用
          }] : []
        }))
      }
      
      // 予約が見つからない場合
      return c.html(renderCalendarPage({
        success: false,
        bookingId: bookingId,
        isSeriesBooking: false,
        customerName: '',
        courseName: '',
        schedules: [],
        error: '予約情報が見つかりません。支払いが完了していない可能性があります。'
      }))
    }
    
    // シリーズ予約のスケジュール一覧を取得（courses.online_urlを含める）
    const schedulesResult = await c.env.DB.prepare(`
      SELECT c.title as course_title, c.session_number, c.online_url, s.date, s.start_time, s.end_time, s.location
      FROM courses c
      LEFT JOIN schedules s ON c.id = s.course_id AND s.term_id = ?
      WHERE c.series_id = ?
      ORDER BY c.session_number ASC
    `).bind(booking.term_id, booking.series_id).all()
    
    return c.html(renderCalendarPage({
      success: true,
      bookingId: bookingId,
      isSeriesBooking: true,
      customerName: booking.customer_name,
      courseName: booking.course_name,
      seriesTitle: booking.series_title,
      termName: booking.term_name,
      schedules: (schedulesResult.results || []).map((s: any) => ({
        session_number: s.session_number,
        course_title: s.course_title,
        date: s.date,
        start_time: s.start_time,
        end_time: s.end_time,
        online_url: s.online_url // courses.online_urlを使用
      }))
    }))
  } catch (error: any) {
    console.error('Calendar page error:', error?.message || error, error?.stack)
    return c.html(renderCalendarPage({
      success: false,
      bookingId: bookingId,
      isSeriesBooking: false,
      customerName: '',
      courseName: '',
      schedules: [],
      error: `カレンダー情報の取得中にエラーが発生しました: ${error?.message || 'Unknown error'}`
    }))
  }
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

// Consultation (個別相談予約)
app.get('/consultation', (c) => {
  const type = c.req.query('type') as 'ai' | 'mental' | undefined;
  return c.html(renderConsultationPage({ type }))
})

// API: 予約可能日時を取得
app.get('/api/consultation/available-dates', async (c) => {
  const { GOOGLE_CALENDAR_API_KEY, GOOGLE_CALENDAR_ID } = c.env;
  
  if (!GOOGLE_CALENDAR_API_KEY || !GOOGLE_CALENDAR_ID) {
    // デモモード（API設定なしの場合）
    const today = new Date();
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0) continue; // 日曜スキップ
      
      const dateStr = date.toISOString().split('T')[0];
      const slots = [];
      for (let hour = 10; hour < 20; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          slots.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            available: Math.random() > 0.3 // デモ用ランダム
          });
        }
      }
      dates.push({
        date: dateStr,
        dayOfWeek,
        hasSlots: slots.some(s => s.available),
        slots
      });
    }
    return c.json({ dates, demo: true });
  }
  
  try {
    const duration = parseInt(c.req.query('duration') || '30');
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const dates = await getAvailableDates(
      GOOGLE_CALENDAR_API_KEY,
      GOOGLE_CALENDAR_ID,
      startDate,
      60, // 60日分
      duration
    );
    
    return c.json({ dates });
  } catch (error) {
    console.error('Calendar API error:', error);
    return c.json({ error: 'カレンダーの取得に失敗しました' }, 500);
  }
})

// API: 個別相談の予約（Stripe決済へ）
// 個別相談の予約申請（承認制：決済は承認後）
app.post('/api/consultation/apply', async (c) => {
  const { DB, RESEND_API_KEY } = c.env;
  
  const body = await c.req.json();
  const { type, duration, date, time, customerName, customerEmail, customerPhone, message, agreedToTerms } = body;
  
  if (!type || !duration || !date || !time || !customerName || !customerEmail) {
    return c.json({ error: '必須項目が不足しています' }, 400);
  }
  
  if (!agreedToTerms) {
    return c.json({ error: '利用規約への同意が必要です' }, 400);
  }
  
  const price = calculatePrice(duration);
  const typeLabel = type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
  const dateLabel = formatDateJa(date);
  
  // 予約IDを生成
  const consultationId = `cons_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  try {
    // 予約申請をDBに保存（ステータス: pending_approval = 承認待ち）
    await DB.prepare(`
      INSERT INTO consultation_bookings (
        id, type, duration, date, time, customer_name, customer_email, customer_phone, message, 
        amount, status, payment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_approval', 'pending', datetime('now'))
    `).bind(
      consultationId, type, duration, date, time,
      customerName, customerEmail, customerPhone || null, message || null,
      price
    ).run();
    
    // 管理者に通知メール
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'mirAIcafe System <noreply@miraicafe.work>',
            to: 'hatarakusutairu@gmail.com',
            subject: `【要承認】個別相談の予約申請 - ${dateLabel} ${time}〜`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 20px;">⏳ 新しい予約申請があります</h1>
                </div>
                <div style="padding: 24px; background: #fff; border: 1px solid #fde68a; border-top: none;">
                  <div style="background: #fffbeb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-weight: bold;">承認が必要です</p>
                    <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">管理画面から承認すると、お客様に決済URLが送信されます。</p>
                  </div>
                  
                  <h2 style="color: #d97706; font-size: 16px; margin-bottom: 16px;">📋 申請内容</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #6b7280;">お客様</td><td style="padding: 8px 0; font-weight: bold;">${customerName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">メール</td><td style="padding: 8px 0;">${customerEmail}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">相談タイプ</td><td style="padding: 8px 0; font-weight: bold;">${typeLabel}</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">日時</td><td style="padding: 8px 0; font-weight: bold;">${dateLabel} ${time}〜</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">時間</td><td style="padding: 8px 0;">${duration}分</td></tr>
                    <tr><td style="padding: 8px 0; color: #6b7280;">金額</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">¥${price.toLocaleString()}</td></tr>
                    ${message ? `<tr><td style="padding: 8px 0; color: #6b7280;">メッセージ</td><td style="padding: 8px 0;">${message}</td></tr>` : ''}
                  </table>
                  
                  <div style="margin-top: 24px; text-align: center;">
                    <a href="https://miraicafe.work/admin/consultations" 
                       style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                      管理画面で確認・承認する
                    </a>
                  </div>
                </div>
              </div>
            `
          })
        });
      } catch (emailError) {
        console.error('Admin notification email error:', emailError);
      }
    }
    
    // お客様に申請受付メール
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'mirAIcafe <noreply@miraicafe.work>',
            to: customerEmail,
            subject: `【mirAIcafe】個別相談の予約申請を受け付けました`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">予約申請を受け付けました</h1>
                </div>
                <div style="padding: 24px; background: #fff; border: 1px solid #fce7f3; border-top: none;">
                  <p>${customerName} 様</p>
                  <p>個別相談の予約申請をいただきありがとうございます。</p>
                  
                  <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>⏳ 現在、承認待ちの状態です</strong><br>
                      担当者が確認後、決済用のリンクをお送りいたします。<br>
                      通常1〜2営業日以内にご連絡いたします。
                    </p>
                  </div>
                  
                  <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <h2 style="margin: 0 0 16px 0; color: #be185d; font-size: 18px;">📅 申請内容</h2>
                    <table style="width: 100%;">
                      <tr><td style="padding: 8px 0; color: #6b7280;">相談タイプ</td><td style="padding: 8px 0; font-weight: bold;">${typeLabel}</td></tr>
                      <tr><td style="padding: 8px 0; color: #6b7280;">希望日時</td><td style="padding: 8px 0; font-weight: bold;">${dateLabel} ${time}〜</td></tr>
                      <tr><td style="padding: 8px 0; color: #6b7280;">時間</td><td style="padding: 8px 0;">${duration}分</td></tr>
                      <tr><td style="padding: 8px 0; color: #6b7280;">料金</td><td style="padding: 8px 0; font-weight: bold; color: #ec4899;">¥${price.toLocaleString()}</td></tr>
                    </table>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">
                    ご不明な点がございましたら、お気軽にお問い合わせください。
                  </p>
                </div>
                <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
                  mirAIcafe - AI活用とキャリア支援<br>
                  <a href="https://miraicafe.work" style="color: #ec4899;">https://miraicafe.work</a>
                </div>
              </div>
            `
          })
        });
      } catch (emailError) {
        console.error('Customer notification email error:', emailError);
      }
    }
    
    return c.json({ 
      success: true, 
      consultationId,
      message: '予約申請を受け付けました。承認後に決済URLをお送りします。'
    });
  } catch (error) {
    console.error('Apply error:', error);
    return c.json({ error: '予約申請に失敗しました' }, 500);
  }
})

// 個別相談 申請完了ページ
app.get('/consultation/applied', (c) => {
  return c.html(renderLayout('申請完了', `
    <div class="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-clock text-4xl text-amber-500"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 mb-4">予約申請を受け付けました</h1>
        <p class="text-gray-600 mb-6">
          ご申請ありがとうございます。<br>
          担当者が確認後、承認いたします。
        </p>
        
        <div class="bg-amber-50 rounded-xl p-5 text-left mb-6">
          <h3 class="font-bold text-amber-800 mb-3"><i class="fas fa-info-circle mr-2"></i>今後の流れ</h3>
          <ol class="space-y-3 text-sm text-amber-700">
            <li class="flex items-start">
              <span class="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">1</span>
              <span>担当者が予約内容を確認します（通常1〜2営業日）</span>
            </li>
            <li class="flex items-start">
              <span class="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">2</span>
              <span>承認後、決済用URLをメールでお送りします</span>
            </li>
            <li class="flex items-start">
              <span class="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold">3</span>
              <span>決済完了で予約が確定します</span>
            </li>
          </ol>
        </div>
        
        <p class="text-sm text-gray-500 mb-6">
          確認メールをお送りしました。<br>
          届かない場合は迷惑メールフォルダをご確認ください。
        </p>
        
        <a href="/" class="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors">
          トップに戻る
        </a>
      </div>
    </div>
  `, ''));
})

// 個別相談 完了ページ
app.get('/consultation/complete', async (c) => {
  const sessionId = c.req.query('session_id');
  const demo = c.req.query('demo');
  
  if (demo) {
    return c.html(renderLayout('予約完了', `
        <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">予約完了（デモ）</h1>
            <p class="text-gray-600 mb-6">これはデモモードです。実際の予約は行われていません。</p>
            <a href="/" class="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600">
              トップに戻る
            </a>
          </div>
        </div>
      `, ''));
  }
  
  const { STRIPE_SECRET_KEY, DB, RESEND_API_KEY } = c.env;
  
  if (!sessionId || !STRIPE_SECRET_KEY) {
    return c.redirect('/consultation?error=true');
  }
  
  try {
    const stripe = createStripeClient(STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return c.redirect('/consultation?error=payment');
    }
    
    const metadata = session.metadata || {};
    const consultationId = metadata.consultation_id;
    
    // DBの予約ステータスを更新
    await DB.prepare(`
      UPDATE consultation_bookings 
      SET status = 'confirmed', payment_status = 'paid', stripe_payment_intent = ?
      WHERE id = ?
    `).bind(session.payment_intent, consultationId).run();
    
    // 確認メール送信（日程・Meet URL含む）
    const MEET_URL = 'https://meet.google.com/hsd-xuri-hiu';
    
    if (RESEND_API_KEY && metadata.customer_name) {
      try {
        const typeLabel = metadata.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
        const dateLabel = formatDateJa(metadata.date);
        
        // カレンダー登録用URL生成（メール用）
        const [emailYear, emailMonth, emailDay] = (metadata.date || '').split('-').map(Number);
        const [emailHour, emailMinute] = (metadata.time || '10:00').split(':').map(Number);
        const emailDuration = parseInt(metadata.duration || '30');
        const emailStartUTC = new Date(Date.UTC(emailYear, emailMonth - 1, emailDay, emailHour - 9, emailMinute));
        const emailEndUTC = new Date(emailStartUTC.getTime() + emailDuration * 60 * 1000);
        const emailFormatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const emailEventTitle = `【mirAIcafe】${typeLabel}`;
        const emailEventDetails = `mirAIcafe 個別相談

相談タイプ: ${typeLabel}
所要時間: ${emailDuration}分

【Google Meet URL】
${MEET_URL}

開始時刻の5分前にはお入りください。`;
        const emailGoogleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(emailEventTitle)}&dates=${emailFormatDate(emailStartUTC)}/${emailFormatDate(emailEndUTC)}&details=${encodeURIComponent(emailEventDetails)}&location=${encodeURIComponent(MEET_URL)}`;
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'mirAIcafe <noreply@miraicafe.work>',
            to: session.customer_email,
            subject: `【mirAIcafe】${dateLabel} ${metadata.time}〜 個別相談のご予約確認`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">✨ ご予約ありがとうございます</h1>
                </div>
                <div style="padding: 24px; background: #fff; border: 1px solid #fce7f3; border-top: none;">
                  <p style="font-size: 16px;">${metadata.customer_name} 様</p>
                  <p>個別相談のご予約を承りました。以下の内容をご確認ください。</p>
                  
                  <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                    <h2 style="margin: 0 0 16px 0; color: #be185d; font-size: 18px;">📅 ご予約内容</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #fbcfe8;">相談タイプ</td>
                        <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #fbcfe8;">${typeLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #fbcfe8;">日時</td>
                        <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #fbcfe8;">${dateLabel} ${metadata.time}〜</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #fbcfe8;">所要時間</td>
                        <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #fbcfe8;">${metadata.duration}分</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280;">お支払い金額</td>
                        <td style="padding: 10px 0; font-weight: bold; color: #ec4899; font-size: 18px;">¥${session.amount_total?.toLocaleString()}</td>
                      </tr>
                    </table>
                  </div>
                  
                  <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; color: #059669; font-size: 18px;">🎥 オンラインミーティング</h2>
                    <p style="margin: 0 0 16px 0; color: #374151;">当日は以下のリンクからご参加ください。</p>
                    <a href="${MEET_URL}" 
                       style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                      Google Meet に参加する
                    </a>
                    <p style="margin: 16px 0 0 0; font-size: 13px; color: #6b7280;">URL: ${MEET_URL}</p>
                  </div>
                  
                  <!-- カレンダー登録セクション -->
                  <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                    <h2 style="margin: 0 0 12px 0; color: #1d4ed8; font-size: 18px;">📆 カレンダーに登録</h2>
                    <p style="margin: 0 0 16px 0; color: #374151;">予定を忘れないようにカレンダーに追加しましょう！</p>
                    <a href="${emailGoogleCalUrl}" 
                       style="display: inline-block; background: #3b82f6; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                      📅 Googleカレンダーに追加
                    </a>
                  </div>
                  
                  <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>⏰ ご注意</strong><br>
                      開始時刻の5分前にはミーティングルームにお入りいただけます。<br>
                      万が一接続に問題がある場合は、お気軽にご連絡ください。
                    </p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">
                    ご不明な点がございましたら、お気軽にお問い合わせください。<br>
                    当日お会いできることを楽しみにしております！
                  </p>
                </div>
                <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
                  mirAIcafe - AI活用とキャリア支援<br>
                  <a href="https://miraicafe.work" style="color: #ec4899;">https://miraicafe.work</a>
                </div>
              </div>
            `
          })
        });
        console.log('Consultation confirmation email sent');
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }
    
    // 管理者にも通知
    if (RESEND_API_KEY) {
      try {
        const typeLabel = metadata.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
        const dateLabel = formatDateJa(metadata.date);
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'mirAIcafe System <noreply@miraicafe.work>',
            to: 'hatarakusutairu@gmail.com',
            subject: `【新規予約】${dateLabel} ${metadata.time}〜 ${typeLabel}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ec4899;">新しい個別相談の予約が入りました</h2>
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>お客様:</strong> ${metadata.customer_name}</p>
                  <p><strong>メール:</strong> ${session.customer_email}</p>
                  <p><strong>相談タイプ:</strong> ${typeLabel}</p>
                  <p><strong>日時:</strong> ${dateLabel} ${metadata.time}〜 (${metadata.duration}分)</p>
                  <p><strong>金額:</strong> ¥${session.amount_total?.toLocaleString()}</p>
                </div>
                <p>
                  <a href="https://miraicafe.work/admin/consultations" style="display: inline-block; background: #ec4899; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                    管理画面で確認
                  </a>
                </p>
                <p>
                  <a href="${MEET_URL}" style="color: #10b981;">Google Meet: ${MEET_URL}</a>
                </p>
              </div>
            `
          })
        });
        console.log('Admin notification email sent');
      } catch (emailError) {
        console.error('Admin email error:', emailError);
      }
    }
    
    const typeLabel = metadata.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
    const dateLabel = formatDateJa(metadata.date);
    
    // カレンダー登録用のURL生成
    const [year, month, day] = (metadata.date || '').split('-').map(Number);
    const [hour, minute] = (metadata.time || '10:00').split(':').map(Number);
    const durationMinutes = parseInt(metadata.duration || '30');
    
    // JST時刻をUTCに変換してGoogle Calendar形式に
    const startDateUTC = new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
    const endDateUTC = new Date(startDateUTC.getTime() + durationMinutes * 60 * 1000);
    
    const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    
    const eventTitle = `【mirAIcafe】${typeLabel}`;
    const eventDetails = `mirAIcafe 個別相談

相談タイプ: ${typeLabel}
所要時間: ${durationMinutes}分

【Google Meet URL】
${MEET_URL}

開始時刻の5分前にはお入りください。`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatGoogleDate(startDateUTC)}/${formatGoogleDate(endDateUTC)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(MEET_URL)}`;
    
    return c.html(renderLayout('予約完了', `
        <div class="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-check text-4xl text-green-500"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800 mb-4">予約完了！</h1>
            <p class="text-gray-600 mb-6">ご予約ありがとうございます。<br>確認メールをお送りしました。</p>
            
            <div class="bg-pink-50 rounded-xl p-5 text-left mb-6">
              <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-clipboard-check mr-2 text-pink-500"></i>予約内容</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">相談タイプ</span>
                  <span class="font-medium text-gray-800">${typeLabel}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">日時</span>
                  <span class="font-medium text-gray-800">${dateLabel} ${metadata.time}〜</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">時間</span>
                  <span class="font-medium text-gray-800">${metadata.duration}分</span>
                </div>
                <div class="flex justify-between border-t border-pink-200 pt-2 mt-2">
                  <span class="text-gray-800 font-bold">お支払い金額</span>
                  <span class="font-bold text-pink-600">¥${session.amount_total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-green-50 rounded-xl p-4 text-left mb-6">
              <h4 class="font-bold text-green-800 mb-2"><i class="fas fa-video mr-2"></i>オンラインミーティング</h4>
              <p class="text-sm text-green-700 mb-3">当日は以下のリンクからご参加ください。</p>
              <a href="${MEET_URL}" target="_blank" rel="noopener noreferrer"
                 class="block w-full text-center py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                Google Meet に参加
              </a>
              <p class="text-xs text-green-600 mt-2 text-center break-all">${MEET_URL}</p>
            </div>
            
            <!-- カレンダー登録セクション -->
            <div class="bg-blue-50 rounded-xl p-4 text-left mb-6">
              <h4 class="font-bold text-blue-800 mb-3"><i class="fas fa-calendar-plus mr-2"></i>カレンダーに追加</h4>
              <p class="text-sm text-blue-700 mb-3">予定を登録して忘れないようにしましょう！</p>
              <a href="${googleCalendarUrl}" target="_blank" rel="noopener noreferrer"
                 class="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-100 hover:border-blue-300 transition-colors">
                <i class="fas fa-calendar-plus"></i>
                Google カレンダーに追加
              </a>
            </div>
            
            <a href="/" class="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600">
              トップに戻る
            </a>
          </div>
        </div>
      `, ''));
  } catch (error) {
    console.error('Consultation complete error:', error);
    return c.redirect('/consultation?error=true');
  }
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

// 特定商取引法に基づく表記（DBから取得）
app.get('/tokushoho', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM policies WHERE id = ?').bind('tokushoho').first<Policy>()
    return c.html(renderTokushohoPage(result))
  } catch (error) {
    return c.html(renderTokushohoPage(null))
  }
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

// Get schedules (from DB)
app.get('/api/schedules', async (c) => {
  const courseId = c.req.query('course')
  try {
    let query = 'SELECT * FROM schedules ORDER BY date ASC, start_time ASC'
    let result
    if (courseId) {
      result = await c.env.DB.prepare('SELECT * FROM schedules WHERE course_id = ? ORDER BY date ASC, start_time ASC').bind(courseId).all()
    } else {
      result = await c.env.DB.prepare(query).all()
    }
    // Map DB fields to expected format
    const dbSchedules = (result.results || []).map((s: any) => ({
      id: s.id,
      courseId: s.course_id,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      capacity: s.capacity,
      enrolled: s.enrolled || 0,
      location: s.location || 'オンライン'
    }))
    return c.json(dbSchedules)
  } catch (error) {
    console.error('Schedules fetch error:', error)
    return c.json([])
  }
})

// Create reservation
app.post('/api/reservations', async (c) => {
  const body = await c.req.json()
  const { courseId, scheduleId, name, email, phone, seriesId, termId, pricingType } = body
  
  // Validate - シリーズ予約の場合はscheduleIdは不要
  const isSeriesBooking = seriesId && termId && pricingType !== 'single'
  if (!name || !email) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  if (!isSeriesBooking && !courseId) {
    return c.json({ error: 'Missing course ID' }, 400)
  }
  
  // シリーズ一括予約の場合
  if (isSeriesBooking) {
    // シリーズ情報を取得
    const seriesResult = await c.env.DB.prepare(`
      SELECT cs.*, pp.course_discount_rate, pp.early_bird_discount_rate, pp.tax_rate
      FROM course_series cs
      LEFT JOIN pricing_patterns pp ON cs.pricing_pattern_id = pp.id
      WHERE cs.id = ?
    `).bind(seriesId).first() as any
    
    if (!seriesResult) {
      return c.json({ error: 'コースが見つかりません' }, 404)
    }
    
    // 開催期情報を取得
    const termResult = await c.env.DB.prepare(`
      SELECT * FROM course_terms WHERE id = ?
    `).bind(termId).first() as any
    
    if (!termResult) {
      return c.json({ error: '開催期が見つかりません' }, 404)
    }
    
    // 該当開催期の全講座と日程を取得
    const linkedCoursesResult = await c.env.DB.prepare(`
      SELECT c.*, s.id as schedule_id, s.date, s.start_time, s.end_time
      FROM courses c
      LEFT JOIN schedules s ON c.id = s.course_id AND s.term_id = ?
      WHERE c.series_id = ?
      ORDER BY c.session_number ASC
    `).bind(termId, seriesId).all()
    
    const linkedCourses = linkedCoursesResult.results || []
    
    // 料金計算（事前計算済みの値を使用）
    const totalSessions = seriesResult.total_sessions || linkedCourses.length
    
    let totalPrice = 0
    let priceLabel = ''
    
    if (pricingType === 'early') {
      totalPrice = seriesResult.calc_early_price_incl || 0
      priceLabel = `早期申込（全${totalSessions}回）`
    } else if (pricingType === 'course') {
      totalPrice = seriesResult.calc_course_price_incl || 0
      priceLabel = `コース一括（全${totalSessions}回）`
    } else if (pricingType === 'monthly') {
      totalPrice = seriesResult.calc_monthly_price_incl || 0
      priceLabel = `月額払い（${totalSessions}回分割）`
    }
    
    console.log(`Series booking: pricingType=${pricingType}, totalPrice=${totalPrice}, totalSessions=${totalSessions}`)
    
    // 有料の場合は予約を登録せず、決済フローへ誘導
    // （予約はWebhookで決済完了後に登録される）
    if (totalPrice > 0) {
      return c.json({ 
        error: '有料講座は決済フローからお申し込みください',
        requiresPayment: true,
        totalPrice,
        priceLabel
      }, 400)
    }
    
    // 無料の場合のみ予約を登録
    // 予約IDを生成
    const seriesBookingId = `sb_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    // 全回分の予約を一括登録
    const bookingIds: number[] = []
    for (const lc of linkedCourses as any[]) {
      try {
        const result = await c.env.DB.prepare(`
          INSERT INTO bookings (
            course_id, course_name, customer_name, customer_email, customer_phone,
            preferred_date, preferred_time, status, payment_status, amount,
            payment_type, series_booking_id, series_id, term_id, source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', 0, ?, ?, ?, ?, 'mirAIcafe')
        `).bind(
          lc.id,
          lc.title,
          name,
          email,
          phone || null,
          lc.date || null,
          lc.start_time && lc.end_time ? `${lc.start_time} - ${lc.end_time}` : null,
          pricingType,
          seriesBookingId,
          seriesId,
          termId
        ).run()
        
        if (result.meta?.last_row_id) {
          bookingIds.push(result.meta.last_row_id as number)
        }
      } catch (dbError) {
        console.error(`Failed to save booking for course ${lc.id}:`, dbError)
      }
    }
    
    console.log(`Free series booking saved with ${bookingIds.length} courses, ID: ${seriesBookingId}`)
    
    // 日程一覧を作成
    const scheduleList = (linkedCourses as any[]).map((lc, idx) => ({
      session: idx + 1,
      title: lc.title,
      date: lc.date,
      time: lc.start_time && lc.end_time ? `${lc.start_time} - ${lc.end_time}` : null
    }))
    
    const reservation = {
      id: seriesBookingId,
      seriesId,
      termId,
      pricingType,
      totalSessions,
      totalPrice,
      priceLabel,
      name,
      email,
      phone,
      schedules: scheduleList,
      status: totalPrice === 0 ? 'confirmed' : 'pending_payment',
      createdAt: new Date().toISOString()
    }
    
    // シリーズ予約の通知メール
    const firstCourse = linkedCourses[0] as any
    const seriesEmailData = {
      name,
      email,
      phone,
      courseName: `${seriesResult.title}（${priceLabel}）`,
      courseId: seriesId,
      scheduleDate: termResult.name,
      scheduleTime: `全${totalSessions}回`,
      location: 'Google Meet（オンライン）',
      price: totalPrice,
      reservationId: seriesBookingId,
      isSeriesBooking: true,
      seriesTitle: seriesResult.title,
      termName: termResult.name,
      schedules: scheduleList
    }
    
    // 管理者への通知
    sendReservationNotificationToAdmin(c.env, seriesEmailData)
      .catch(err => console.error('Failed to send series reservation notification to admin:', err))
    
    // 予約者への確認メール
    sendReservationConfirmationToCustomer(c.env, seriesEmailData)
      .catch(err => console.error('Failed to send series reservation confirmation to customer:', err))
    
    return c.json({ success: true, reservation, isSeriesBooking: true })
  }
  
  // 単発予約の場合（従来の処理）
  // 講座情報をDBから取得
  const courseResult = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(courseId).first()
  const scheduleResult = await c.env.DB.prepare('SELECT * FROM schedules WHERE id = ?').bind(scheduleId).first()
  
  const course = courseResult as any
  const schedule = scheduleResult ? {
    id: (scheduleResult as any).id,
    date: (scheduleResult as any).date,
    startTime: (scheduleResult as any).start_time,
    endTime: (scheduleResult as any).end_time,
    location: (scheduleResult as any).location
  } : null
  
  if (!course) {
    return c.json({ error: '講座が見つかりません' }, 404)
  }
  
  // 有料の場合は予約を登録せず、決済フローへ誘導
  // （予約はWebhookで決済完了後に登録される）
  if (course.price > 0) {
    return c.json({ 
      error: '有料講座は決済フローからお申し込みください',
      requiresPayment: true,
      price: course.price
    }, 400)
  }
  
  // 無料の場合のみbookingsテーブルに保存
  let bookingId: number | null = null
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO bookings (
        course_id, course_name, customer_name, customer_email, customer_phone,
        preferred_date, preferred_time, status, payment_status, amount, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', 0, 'mirAIcafe')
    `).bind(
      courseId,
      course.title,
      name,
      email,
      phone || null,
      schedule?.date || null,
      schedule ? `${schedule.startTime} - ${schedule.endTime}` : null
    ).run()
    
    bookingId = result.meta?.last_row_id as number
    console.log('Free booking saved to DB with ID:', bookingId)
  } catch (dbError) {
    console.error('Failed to save booking to DB:', dbError)
    // DBエラーでも続行（メール通知は送る）
  }
  
  const reservation = {
    id: bookingId || `res_${Date.now()}`,
    courseId,
    scheduleId,
    name,
    email,
    phone,
    status: course.price === 0 ? 'confirmed' : 'pending_payment',
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

// ===== ワークスペースAPI =====
// ワークスペーススケジュール一覧取得
app.get('/api/workspace/schedules', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const schedules = await c.env.DB.prepare(`
      SELECT * FROM workspace_schedules 
      WHERE status = 'active' AND date >= ?
      ORDER BY date ASC, start_time ASC
    `).bind(today).all()
    
    return c.json({ schedules: schedules.results })
  } catch (error) {
    console.error('Workspace schedules error:', error)
    return c.json({ schedules: [] })
  }
})

// ワークスペース予約・Stripe決済
app.post('/api/workspace/checkout', async (c) => {
  try {
    const { scheduleId, customerName, customerEmail, customerPhone } = await c.req.json()
    
    if (!scheduleId || !customerName || !customerEmail) {
      return c.json({ error: '必須項目が入力されていません' }, 400)
    }
    
    // スケジュール情報を取得
    const schedule = await c.env.DB.prepare(`
      SELECT * FROM workspace_schedules WHERE id = ? AND status = 'active'
    `).bind(scheduleId).first() as any
    
    if (!schedule) {
      return c.json({ error: '指定された日程が見つかりません' }, 404)
    }
    
    // 満席チェック
    const remaining = schedule.capacity - schedule.enrolled
    if (remaining <= 0) {
      return c.json({ error: 'この日程は満席です' }, 400)
    }
    
    // 重複予約チェック
    const existingBooking = await c.env.DB.prepare(`
      SELECT id FROM workspace_bookings 
      WHERE workspace_schedule_id = ? AND customer_email = ? AND status != 'cancelled'
    `).bind(scheduleId, customerEmail).first()
    
    if (existingBooking) {
      return c.json({ error: 'この日程は既に予約済みです' }, 400)
    }
    
    // Stripe Checkout Session作成
    if (!c.env.STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe設定がありません' }, 500)
    }
    
    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
    const dateObj = new Date(schedule.date)
    const dateStr = dateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'jpy',
          unit_amount: schedule.price,
          product_data: {
            name: schedule.title || 'mirAIcafe ワークスペース',
            description: `${dateStr} ${schedule.start_time}〜${schedule.end_time}`
          }
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${c.req.header('origin')}/workspace/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.req.header('origin')}/?workspace_canceled=true`,
      customer_email: customerEmail,
      metadata: {
        type: 'workspace',
        schedule_id: scheduleId,
        customer_name: customerName,
        customer_phone: customerPhone || '',
        schedule_date: schedule.date,
        schedule_time: `${schedule.start_time}-${schedule.end_time}`
      },
      locale: 'ja'
    })
    
    return c.json({ url: session.url })
  } catch (error: any) {
    console.error('Workspace checkout error:', error)
    return c.json({ error: error?.message || '決済処理に失敗しました' }, 500)
  }
})

// ワークスペース予約完了ページ
app.get('/workspace/complete', async (c) => {
  const sessionId = c.req.query('session_id')
  
  if (!sessionId || !c.env.STRIPE_SECRET_KEY) {
    return c.redirect('/?workspace_error=true')
  }
  
  try {
    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return c.redirect('/?workspace_error=payment')
    }
    
    const metadata = session.metadata || {}
    
    // 予約を作成（まだ作成されていない場合）
    const existingBooking = await c.env.DB.prepare(`
      SELECT id FROM workspace_bookings WHERE stripe_session_id = ?
    `).bind(sessionId).first()
    
    let bookingId: number
    
    if (!existingBooking) {
      // 予約を作成
      const result = await c.env.DB.prepare(`
        INSERT INTO workspace_bookings (workspace_schedule_id, customer_name, customer_email, customer_phone, status, payment_status, amount, stripe_session_id)
        VALUES (?, ?, ?, ?, 'confirmed', 'paid', ?, ?)
      `).bind(
        metadata.schedule_id,
        metadata.customer_name,
        session.customer_email,
        metadata.customer_phone || null,
        session.amount_total || 500,
        sessionId
      ).run()
      
      bookingId = result.meta.last_row_id as number
      
      // enrolled数を更新
      await c.env.DB.prepare(`
        UPDATE workspace_schedules SET enrolled = enrolled + 1 WHERE id = ?
      `).bind(metadata.schedule_id).run()
      
      // スケジュール情報を取得してメール送信
      const scheduleForEmail = await c.env.DB.prepare(`
        SELECT * FROM workspace_schedules WHERE id = ?
      `).bind(metadata.schedule_id).first() as any
      
      // ワークスペース予約完了メール送信
      console.log('Sending workspace confirmation email to:', session.customer_email)
      if (session.customer_email) {
        const dateObj = scheduleForEmail ? new Date(scheduleForEmail.date) : new Date()
        const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
        
        try {
          await sendWorkspaceConfirmationEmail(c.env, {
            customerName: metadata.customer_name || '',
            customerEmail: session.customer_email,
            scheduleDate: dateStr,
            scheduleTime: `${scheduleForEmail?.start_time || ''}〜${scheduleForEmail?.end_time || ''}`,
            amount: session.amount_total || 500,
            bookingId,
            meetUrl: scheduleForEmail?.meet_url
          })
          console.log('Workspace confirmation email sent successfully')
        } catch (emailErr) {
          console.error('Failed to send workspace confirmation email:', emailErr)
        }
      }
    } else {
      bookingId = (existingBooking as any).id
    }
    
    // スケジュール情報を取得
    const schedule = await c.env.DB.prepare(`
      SELECT * FROM workspace_schedules WHERE id = ?
    `).bind(metadata.schedule_id).first() as any
    
    const dateObj = schedule ? new Date(schedule.date) : new Date()
    const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    
    // 完了ページを表示
    const meetUrlSection = schedule?.meet_url 
      ? `<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p class="text-sm text-green-800 mb-2"><i class="fas fa-video mr-2"></i>参加URL</p>
          <a href="${schedule.meet_url}" target="_blank" class="text-green-600 hover:text-green-700 font-medium break-all">${schedule.meet_url}</a>
        </div>`
      : `<div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p class="text-sm text-blue-800"><i class="fas fa-info-circle mr-2"></i>参加URLは開催日までにメールでお送りします</p>
        </div>`
    
    const content = `
      <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-16">
        <div class="max-w-lg mx-auto px-4">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center text-white">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-4xl"></i>
              </div>
              <h1 class="text-2xl font-bold">予約完了！</h1>
              <p class="opacity-90 mt-2">ワークスペースのご予約ありがとうございます</p>
            </div>
            
            <div class="p-8">
              <div class="bg-amber-50 rounded-xl p-6 mb-6">
                <h2 class="font-bold text-amber-900 mb-4 flex items-center">
                  <i class="fas fa-coffee mr-2"></i>予約内容
                </h2>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">日時</span>
                    <span class="font-medium">${dateStr} ${schedule?.start_time || ''} 〜 ${schedule?.end_time || ''}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">お名前</span>
                    <span class="font-medium">${metadata.customer_name}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">金額</span>
                    <span class="font-medium">¥${(session.amount_total || 500).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              ${meetUrlSection}
              
              <a href="/workspace/calendar/${bookingId}" class="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center rounded-xl font-bold hover:shadow-lg transition-all mb-3">
                <i class="fas fa-calendar-plus mr-2"></i>カレンダーに追加
              </a>
              <a href="/" class="block w-full py-3 border-2 border-amber-500 text-amber-600 text-center rounded-xl font-bold hover:bg-amber-50 transition-all">
                トップページに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    `
    
    return c.html(renderLayout('予約完了', content, 'workspace'))
  } catch (error: any) {
    console.error('Workspace complete error:', error)
    // エラーページを表示
    const content = `
      <div class="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 py-16">
        <div class="max-w-lg mx-auto px-4">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center text-white">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-times text-4xl"></i>
              </div>
              <h1 class="text-2xl font-bold">エラーが発生しました</h1>
              <p class="opacity-90 mt-2">セッション情報の取得に失敗しました。決済が完了している場合は確認メールをご確認ください。</p>
            </div>
            <div class="p-8">
              <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <p class="text-sm text-yellow-800"><i class="fas fa-info-circle mr-2"></i>決済が完了している場合、確認メールが届いていないか確認してください。問題が解決しない場合は、お問い合わせください。</p>
              </div>
              <div class="flex gap-4">
                <a href="/" class="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-center">
                  <i class="fas fa-redo mr-2"></i>再予約
                </a>
                <a href="/contact" class="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold text-center">
                  <i class="fas fa-envelope mr-2"></i>お問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    return c.html(renderLayout('エラー', content, 'workspace'))
  }
})

// ワークスペースカレンダーページ
app.get('/workspace/calendar/:bookingId', async (c) => {
  const bookingId = c.req.param('bookingId')
  
  try {
    const booking = await c.env.DB.prepare(`
      SELECT b.*, s.date, s.start_time, s.end_time, s.title as schedule_title, s.meet_url
      FROM workspace_bookings b
      JOIN workspace_schedules s ON b.workspace_schedule_id = s.id
      WHERE b.id = ? AND b.payment_status = 'paid'
    `).bind(bookingId).first() as any
    
    if (!booking) {
      return c.html(renderLayout('エラー', `
        <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-16">
          <div class="max-w-lg mx-auto px-4 text-center">
            <i class="fas fa-exclamation-circle text-6xl text-red-400 mb-4"></i>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">予約が見つかりません</h1>
            <p class="text-gray-600 mb-6">お支払いが完了していないか、予約IDが正しくありません。</p>
            <a href="/" class="text-amber-600 hover:text-amber-700 font-medium">トップページに戻る</a>
          </div>
        </div>
      `, 'workspace'))
    }
    
    const dateObj = new Date(booking.date)
    const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
    
    // Googleカレンダー用URL
    const startDateTime = new Date(`${booking.date}T${booking.start_time}:00`)
    const endDateTime = new Date(`${booking.date}T${booking.end_time}:00`)
    const detailsText = `参加URL: ${booking.meet_url || '後日メールでお知らせします'}`
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('mirAIcafe ワークスペース')}&dates=${startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(detailsText)}`
    
    const meetUrlSection = booking.meet_url 
      ? `<div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p class="text-sm text-green-800 mb-2"><i class="fas fa-video mr-2"></i>参加URL</p>
          <a href="${booking.meet_url}" target="_blank" class="text-green-600 hover:text-green-700 font-medium break-all">${booking.meet_url}</a>
        </div>`
      : `<div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p class="text-sm text-blue-800"><i class="fas fa-info-circle mr-2"></i>参加URLは開催日までにメールでお送りします</p>
        </div>`
    
    const content = `
      <div class="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-16">
        <div class="max-w-lg mx-auto px-4">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
              <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-calendar-check text-4xl"></i>
              </div>
              <h1 class="text-2xl font-bold">カレンダーに追加</h1>
              <p class="opacity-90 mt-2">ワークスペースの予定を忘れないように！</p>
            </div>
            
            <div class="p-8">
              <div class="bg-amber-50 rounded-xl p-6 mb-6">
                <h2 class="font-bold text-amber-900 mb-4 flex items-center">
                  <i class="fas fa-coffee mr-2"></i>mirAIcafe ワークスペース
                </h2>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600"><i class="fas fa-calendar mr-2"></i>日付</span>
                    <span class="font-medium">${dateStr}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600"><i class="fas fa-clock mr-2"></i>時間</span>
                    <span class="font-medium">${booking.start_time} 〜 ${booking.end_time}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600"><i class="fas fa-user mr-2"></i>お名前</span>
                    <span class="font-medium">${booking.customer_name}</span>
                  </div>
                </div>
              </div>
              
              ${meetUrlSection}
              
              <a href="${googleCalUrl}" target="_blank" class="flex items-center justify-center w-full py-4 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" class="w-6 h-6 mr-3">
                Googleカレンダーに追加
              </a>
              
              <a href="/" class="block w-full py-3 text-center text-amber-600 hover:text-amber-700 font-medium">
                トップページに戻る
              </a>
            </div>
          </div>
        </div>
      </div>
    `
    
    return c.html(renderLayout('カレンダー追加', content, 'workspace'))
  } catch (error) {
    console.error('Workspace calendar error:', error)
    return c.redirect('/?workspace_error=true')
  }
})

// Stripe Checkout Session
app.post('/api/create-checkout-session', async (c) => {
  try {
    const body = await c.req.json()
    let { courseId, courseTitle, price, customerEmail, customerName, customerPhone, scheduleId, scheduleDate, scheduleTime, successUrl, cancelUrl, bookingId, reservationId, seriesId, pricingType, termId } = body

    // シリーズ予約の場合
    const isSeriesBooking = seriesId && termId && pricingType !== 'single'
    
    if (isSeriesBooking) {
      // シリーズ情報を取得
      const seriesResult = await c.env.DB.prepare(`
        SELECT cs.*, pp.course_discount_rate, pp.early_bird_discount_rate, pp.tax_rate
        FROM course_series cs
        LEFT JOIN pricing_patterns pp ON cs.pricing_pattern_id = pp.id
        WHERE cs.id = ?
      `).bind(seriesId).first() as any
      
      if (seriesResult) {
        courseTitle = courseTitle || seriesResult.title
        // priceは既にフロントから渡されている
      }
      
      // 早期割の場合、開催期の早期締切日を確認
      if (pricingType === 'early' && termId) {
        const termResult = await c.env.DB.prepare(`
          SELECT early_bird_deadline FROM course_terms WHERE id = ?
        `).bind(termId).first() as { early_bird_deadline: string | null } | null
        
        if (termResult?.early_bird_deadline) {
          const deadline = new Date(termResult.early_bird_deadline)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          if (today > deadline) {
            return c.json({ 
              error: '早期申込の締切日を過ぎています。コース一括でお申し込みください。',
              earlyBirdExpired: true,
              deadline: termResult.early_bird_deadline
            }, 400)
          }
        }
      }
    } else {
      // courseIdから講座情報を取得（courseTitle/priceが未指定の場合）
      if (courseId && (!courseTitle || !price)) {
        const course = await getCourseById(c.env.DB, courseId)
        if (course) {
          courseTitle = courseTitle || course.title
          price = price || course.price
        }
      }
    }

    // Validate required fields
    // シリーズ予約の場合はcourseIdがなくてもOK
    if (!isSeriesBooking && !courseId) {
      return c.json({ error: '講座IDが必要です' }, 400)
    }
    if (!courseTitle || !price || !successUrl || !cancelUrl) {
      return c.json({ error: '必須項目が不足しています', details: { courseTitle: !!courseTitle, price: !!price, successUrl: !!successUrl, cancelUrl: !!cancelUrl } }, 400)
    }
    
    // bookingIdがなければreservationIdを使用
    bookingId = bookingId || reservationId

    // Check if Stripe is configured
    if (!c.env.STRIPE_SECRET_KEY) {
      // Demo mode - return mock session
      console.log('Stripe not configured, using demo mode')
      const demoSession = {
        id: `cs_demo_${Date.now()}`,
        url: `${successUrl}?session_id=demo_session_${Date.now()}&booking_id=${bookingId || ''}`,
        amount: price,
        currency: 'jpy',
        course: courseTitle,
        demo: true
      }
      return c.json(demoSession)
    }

    // Create real Stripe session
    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
    
    // successUrlにsession_idが既に含まれているかチェック
    const finalSuccessUrl = successUrl.includes('{CHECKOUT_SESSION_ID}') 
      ? successUrl 
      : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`
    
    const session = await createCheckoutSession(stripe, {
      courseId: courseId || undefined,
      courseTitle,
      price,
      customerEmail,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      scheduleId: scheduleId || undefined,
      scheduleDate,
      scheduleTime,
      successUrl: finalSuccessUrl,
      cancelUrl,
      bookingId,
      seriesId: seriesId || undefined,
      termId: termId || undefined,
      pricingType: pricingType || 'single'
    })

    // Save payment record to database (booking_idは使用しない - FK制約回避)
    try {
      await c.env.DB.prepare(`
        INSERT INTO payments (
          stripe_checkout_session_id, amount, currency, status,
          customer_email, customer_name, course_id, course_title, schedule_date, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        session.id,
        price,
        'jpy',
        'pending',
        customerEmail,
        customerName || null,
        courseId || null,
        courseTitle,
        scheduleDate || null,
        JSON.stringify({ 
          reservationId: bookingId,
          seriesId: seriesId || null,
          termId: termId || null,
          courseId: courseId || null,
          scheduleId: scheduleId || null,
          pricingType: pricingType || 'single'
        })
      ).run()
    } catch (dbError) {
      console.error('Failed to save payment record:', dbError)
      // Continue anyway - payment can still proceed
    }

    return c.json({
      id: session.id,
      url: session.url,
      amount: price,
      currency: 'jpy',
      course: courseTitle
    })
  } catch (error: any) {
    console.error('Checkout session creation error:', error)
    const errorMessage = error?.message || error?.toString() || '不明なエラー'
    const errorCode = error?.code || error?.type || 'unknown'
    return c.json({ 
      error: '決済セッションの作成に失敗しました',
      details: errorMessage,
      code: errorCode
    }, 500)
  }
})

// Stripe Webhook
app.post('/api/stripe/webhook', async (c) => {
  try {
    if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: 'Stripe not configured' }, 400)
    }

    const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
    const payload = await c.req.text()
    const signature = c.req.header('stripe-signature')

    if (!signature) {
      return c.json({ error: 'Missing signature' }, 400)
    }

    let event
    try {
      // Cloudflare Workers環境では非同期版を使用
      event = await stripe.webhooks.constructEventAsync(payload, signature, c.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return c.json({ error: 'Invalid signature' }, 400)
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        console.log('Webhook received: checkout.session.completed', session.id)
        console.log('Session metadata:', session.metadata)
        
        const metadata = session.metadata || {}
        const customerEmail = session.customer_email || metadata.customer_email
        const customerName = metadata.customer_name || ''
        const customerPhone = metadata.customer_phone || ''
        const seriesId = metadata.series_id
        const termId = metadata.term_id
        const pricingType = metadata.pricing_type || 'single'
        const courseId = metadata.course_id
        const scheduleId = metadata.schedule_id
        const consultationId = metadata.consultation_id  // 個別相談ID
        const isSeriesBooking = seriesId && termId && pricingType !== 'single'
        const isConsultationBooking = !!consultationId  // 個別相談の決済
        
        let seriesBookingId = null
        let bookingId = null
        
        // 個別相談の決済完了処理
        if (isConsultationBooking) {
          console.log('Processing consultation payment completion:', consultationId)
          
          const MEET_URL = 'https://meet.google.com/hsd-xuri-hiu'
          
          // consultation_bookingsテーブルを更新
          await c.env.DB.prepare(`
            UPDATE consultation_bookings 
            SET status = 'confirmed', payment_status = 'paid', stripe_payment_intent = ?, meet_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(session.payment_intent, MEET_URL, consultationId).run()
          
          console.log('Consultation booking confirmed:', consultationId)
          
          // 確認メール送信
          const RESEND_API_KEY = c.env.RESEND_API_KEY
          if (RESEND_API_KEY) {
            try {
              const typeLabel = metadata.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談'
              
              // 日付フォーマット
              const [year, month, day] = (metadata.date || '').split('-').map(Number)
              const weekdays = ['日', '月', '火', '水', '木', '金', '土']
              const dateObj = new Date(year, month - 1, day)
              const dateLabel = `${year}年${month}月${day}日(${weekdays[dateObj.getDay()]})`
              
              // お客様への確認メール
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'mirAIcafe <noreply@miraicafe.work>',
                  to: customerEmail,
                  subject: `【予約確定】${dateLabel} ${metadata.time}〜 ${typeLabel} | mirAIcafe`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                      <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">✨ ご予約が確定しました</h1>
                      </div>
                      <div style="padding: 24px; background: #fff; border: 1px solid #fce7f3; border-top: none;">
                        <p style="font-size: 16px;">${customerName} 様</p>
                        <p>お支払いが完了し、ご予約が確定しました。</p>
                        
                        <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                          <h2 style="margin: 0 0 16px 0; color: #be185d; font-size: 18px;">📅 ご予約内容</h2>
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 10px 0; color: #6b7280;">相談タイプ</td><td style="padding: 10px 0; font-weight: bold;">${typeLabel}</td></tr>
                            <tr><td style="padding: 10px 0; color: #6b7280;">日時</td><td style="padding: 10px 0; font-weight: bold;">${dateLabel} ${metadata.time}〜</td></tr>
                            <tr><td style="padding: 10px 0; color: #6b7280;">所要時間</td><td style="padding: 10px 0; font-weight: bold;">${metadata.duration}分</td></tr>
                          </table>
                        </div>
                        
                        <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                          <h2 style="margin: 0 0 12px 0; color: #059669; font-size: 18px;">🎥 オンラインミーティング</h2>
                          <p style="margin: 0 0 16px 0;">当日は下記のGoogle Meetからご参加ください。</p>
                          <a href="${MEET_URL}" style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                            Google Meet に参加
                          </a>
                          <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">${MEET_URL}</p>
                        </div>
                      </div>
                      <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px;">
                        mirAIcafe<br><a href="https://miraicafe.work" style="color: #ec4899;">https://miraicafe.work</a>
                      </div>
                    </div>
                  `
                })
              })
              
              // 管理者への通知メール
              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${RESEND_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'mirAIcafe <noreply@miraicafe.work>',
                  to: 'hatarakusutairu@gmail.com',
                  subject: `【決済完了】${customerName}様 ${typeLabel} 予約確定`,
                  html: `
                    <div style="font-family: sans-serif;">
                      <h2 style="color: #059669;">決済完了・予約確定</h2>
                      <p><strong>${customerName}</strong>様の個別相談予約が確定しました。</p>
                      <p><strong>日時:</strong> ${dateLabel} ${metadata.time}〜</p>
                      <p><strong>タイプ:</strong> ${typeLabel}（${metadata.duration}分）</p>
                      <p><strong>金額:</strong> ¥${session.amount_total?.toLocaleString()}</p>
                      <p><a href="https://miraicafe.work/admin/consultations">管理画面で確認</a></p>
                    </div>
                  `
                })
              })
              
              console.log('Consultation confirmation emails sent')
            } catch (emailError) {
              console.error('Failed to send consultation emails:', emailError)
            }
          }
          
          // paymentレコードも更新（あれば）
          await c.env.DB.prepare(`
            UPDATE payments SET
              stripe_payment_intent_id = ?,
              status = 'succeeded',
              updated_at = CURRENT_TIMESTAMP
            WHERE stripe_checkout_session_id = ?
          `).bind(session.payment_intent, session.id).run()
          
          break  // 個別相談の処理完了
        }
        
        // 予約を作成（決済完了後）- 講座予約
        if (isSeriesBooking) {
          // シリーズ一括予約
          console.log('Creating series booking from webhook:', { seriesId, termId, pricingType })
          
          const seriesResult = await c.env.DB.prepare(`
            SELECT * FROM course_series WHERE id = ?
          `).bind(seriesId).first() as any
          
          const termResult = await c.env.DB.prepare(`
            SELECT * FROM course_terms WHERE id = ?
          `).bind(termId).first() as any
          
          const linkedCoursesResult = await c.env.DB.prepare(`
            SELECT c.*, s.id as schedule_id, s.date, s.start_time, s.end_time
            FROM courses c
            LEFT JOIN schedules s ON c.id = s.course_id AND s.term_id = ?
            WHERE c.series_id = ?
            ORDER BY c.session_number ASC
          `).bind(termId, seriesId).all()
          
          const linkedCourses = linkedCoursesResult.results || []
          const totalSessions = linkedCourses.length
          const totalPrice = session.amount_total || 0
          
          seriesBookingId = `sb_${Date.now()}_${Math.random().toString(36).substring(7)}`
          
          // 全回分の予約を一括登録
          for (const lc of linkedCourses as any[]) {
            try {
              const result = await c.env.DB.prepare(`
                INSERT INTO bookings (
                  course_id, course_name, customer_name, customer_email, customer_phone,
                  preferred_date, preferred_time, status, payment_status, amount,
                  payment_type, series_booking_id, series_id, term_id, source
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?, ?, ?, ?, 'mirAIcafe')
              `).bind(
                lc.id,
                lc.title,
                customerName,
                customerEmail,
                customerPhone || null,
                lc.date || null,
                lc.start_time && lc.end_time ? `${lc.start_time} - ${lc.end_time}` : null,
                Math.round(totalPrice / totalSessions),
                pricingType,
                seriesBookingId,
                seriesId,
                termId
              ).run()
              
              if (!bookingId && result.meta?.last_row_id) {
                bookingId = result.meta.last_row_id
              }
            } catch (dbError) {
              console.error(`Failed to save booking for course ${lc.id}:`, dbError)
            }
          }
          
          console.log(`Series booking created: ${seriesBookingId} with ${linkedCourses.length} courses`)
          
          // メール通知
          const scheduleList = (linkedCourses as any[]).map((lc, idx) => ({
            session: idx + 1,
            title: lc.title,
            date: lc.date,
            time: lc.start_time && lc.end_time ? `${lc.start_time} - ${lc.end_time}` : null
          }))
          
          const priceLabel = pricingType === 'early' ? '早期申込' : pricingType === 'course' ? 'コース一括' : '月額払い'
          
          const seriesEmailData = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            courseName: `${seriesResult?.title || '講座'}（${priceLabel}）`,
            courseId: seriesId,
            scheduleDate: termResult?.name || '',
            scheduleTime: `全${totalSessions}回`,
            location: 'Google Meet（オンライン）',
            price: totalPrice,
            reservationId: seriesBookingId,
            isSeriesBooking: true,
            seriesTitle: seriesResult?.title,
            termName: termResult?.name,
            schedules: scheduleList
          }
          
          sendReservationNotificationToAdmin(c.env, seriesEmailData)
            .catch(err => console.error('Failed to send notification:', err))
          sendReservationConfirmationToCustomer(c.env, seriesEmailData)
            .catch(err => console.error('Failed to send confirmation:', err))
            
        } else if (courseId) {
          // 単発予約
          console.log('Creating single booking from webhook:', { courseId, scheduleId })
          
          const course = await c.env.DB.prepare('SELECT * FROM courses WHERE id = ?').bind(courseId).first() as any
          const schedule = scheduleId ? await c.env.DB.prepare('SELECT * FROM schedules WHERE id = ?').bind(scheduleId).first() as any : null
          
          if (course) {
            const result = await c.env.DB.prepare(`
              INSERT INTO bookings (
                course_id, course_name, customer_name, customer_email, customer_phone,
                preferred_date, preferred_time, status, payment_status, amount, source
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, 'mirAIcafe')
            `).bind(
              courseId,
              course.title,
              customerName,
              customerEmail,
              customerPhone || null,
              schedule?.date || null,
              schedule ? `${schedule.start_time} - ${schedule.end_time}` : null,
              session.amount_total || course.price
            ).run()
            
            bookingId = result.meta?.last_row_id
            console.log('Single booking created:', bookingId)
            
            // メール通知
            const emailData = {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              courseName: course.title,
              courseId: courseId,
              scheduleDate: schedule?.date,
              scheduleTime: schedule ? `${schedule.start_time} - ${schedule.end_time}` : null,
              location: schedule?.location || 'オンライン',
              price: session.amount_total || course.price,
              reservationId: bookingId
            }
            
            sendReservationNotificationToAdmin(c.env, emailData)
              .catch(err => console.error('Failed to send notification:', err))
            sendReservationConfirmationToCustomer(c.env, emailData)
              .catch(err => console.error('Failed to send confirmation:', err))
          }
        }
        
        // Update payment record with booking reference
        await c.env.DB.prepare(`
          UPDATE payments SET
            stripe_payment_intent_id = ?,
            status = 'succeeded',
            payment_method = 'card',
            metadata = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE stripe_checkout_session_id = ?
        `).bind(
          session.payment_intent,
          JSON.stringify({ 
            ...metadata,
            booking_id: bookingId,
            series_booking_id: seriesBookingId
          }),
          session.id
        ).run()

        console.log('Payment succeeded for session:', session.id)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any
        await c.env.DB.prepare(`
          UPDATE payments SET status = 'canceled', updated_at = CURRENT_TIMESTAMP
          WHERE stripe_checkout_session_id = ?
        `).bind(session.id).run()
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any
        await c.env.DB.prepare(`
          UPDATE payments SET status = 'failed', updated_at = CURRENT_TIMESTAMP
          WHERE stripe_payment_intent_id = ?
        `).bind(paymentIntent.id).run()
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as any
        await c.env.DB.prepare(`
          UPDATE payments SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
          WHERE stripe_payment_intent_id = ?
        `).bind(charge.payment_intent).run()
        break
      }
    }

    return c.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// Get payment status
app.get('/api/payments/:sessionId', async (c) => {
  try {
    const sessionId = c.req.param('sessionId')
    
    const result = await c.env.DB.prepare(`
      SELECT * FROM payments WHERE stripe_checkout_session_id = ?
    `).bind(sessionId).first()

    if (!result) {
      return c.json({ error: 'Payment not found' }, 404)
    }

    return c.json(result)
  } catch (error) {
    console.error('Get payment error:', error)
    return c.json({ error: 'Failed to get payment' }, 500)
  }
})

// Generate calendar links for booking
app.post('/api/calendar/generate', async (c) => {
  try {
    const body = await c.req.json()
    const { courseTitle, scheduleDate, startTime, endTime, onlineUrl, instructorName } = body

    if (!courseTitle || !scheduleDate || !startTime || !endTime) {
      return c.json({ error: '必須項目が不足しています' }, 400)
    }

    const description = generateEventDescription({
      courseName: courseTitle,
      instructorName: instructorName || undefined,
      onlineUrl: onlineUrl || undefined,
      notes: '講座開始の10分前にはアクセスをお願いします。'
    })

    const event: CalendarEvent = {
      title: `【mirAIcafe】${courseTitle}`,
      description,
      startDate: scheduleDate,
      startTime,
      endTime,
      location: onlineUrl || 'オンライン（URLは別途ご連絡）',
      timezone: 'Asia/Tokyo'
    }

    const links = generateAllCalendarLinks(event)

    return c.json({
      success: true,
      links,
      event
    })
  } catch (error) {
    console.error('Calendar link generation error:', error)
    return c.json({ error: 'カレンダーリンクの生成に失敗しました' }, 500)
  }
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

// セッション管理（署名付きCookie方式：Cloudflare Workers対応）
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24時間
const SESSION_SECRET = 'miraicafe-admin-secret-2026' // 本番では環境変数から取得推奨

// 署名付きトークンを生成
function generateSessionToken(email: string): string {
  const expiresAt = Date.now() + SESSION_DURATION
  const data = JSON.stringify({ email, expiresAt })
  const encoded = btoa(data)
  // 簡易署名（本番ではHMAC-SHA256を使用推奨）
  const signature = btoa(SESSION_SECRET + encoded).slice(0, 16)
  return `${encoded}.${signature}`
}

// トークンを検証
function validateSessionToken(token: string | undefined): { valid: boolean; email?: string } {
  if (!token) return { valid: false }
  
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return { valid: false }
    
    // 署名検証
    const expectedSignature = btoa(SESSION_SECRET + encoded).slice(0, 16)
    if (signature !== expectedSignature) return { valid: false }
    
    // データ復元
    const data = JSON.parse(atob(encoded))
    if (!data.email || !data.expiresAt) return { valid: false }
    
    // 有効期限チェック
    if (Date.now() > data.expiresAt) return { valid: false }
    
    return { valid: true, email: data.email }
  } catch {
    return { valid: false }
  }
}

// 認証ミドルウェア
app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  
  // ログインページは認証不要
  if (path === '/admin/login') {
    return next()
  }
  
  const sessionToken = getCookie(c, 'admin_session')
  const { valid } = validateSessionToken(sessionToken)
  
  if (!valid) {
    // API リクエストの場合は JSON エラーを返す
    if (path.includes('/admin/api/')) {
      return c.json({ error: 'Unauthorized', message: 'ログインが必要です' }, 401)
    }
    return c.redirect('/admin/login')
  }
  
  return next()
})

// ログインページ
app.get('/admin/login', (c) => {
  const sessionToken = getCookie(c, 'admin_session')
  const { valid } = validateSessionToken(sessionToken)
  if (valid) {
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
    // 署名付きトークンを生成
    const sessionToken = generateSessionToken(email)
    
    // 本番環境ではSecure、開発環境では無効
    const isProduction = c.req.url.startsWith('https://')
    setCookie(c, 'admin_session', sessionToken, {
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
  deleteCookie(c, 'admin_session', { path: '/admin' })
  return c.redirect('/admin/login')
})

// ダッシュボード
app.get('/admin', async (c) => {
  try {
    // 講座数をDBから取得
    const coursesCountResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM courses
    `).first()
    
    // ブログ記事数をDBから取得
    const blogCountResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM blog_posts
    `).first()
    
    // ポートフォリオ数をDBから取得
    const portfolioCountResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as total FROM portfolios
    `).first()
    
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
      courses: (coursesCountResult as any)?.total || 0,
      blogs: (blogCountResult as any)?.total || 0,
      portfolios: (portfolioCountResult as any)?.total || 0,
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
      courses: 0,
      blogs: 0,
      portfolios: 0,
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
      SELECT id, title, excerpt, content, author, date, category, tags, image, read_time as readTime, video_url, meta_description, keywords, seo_score
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
      SELECT id, title, excerpt, content, author, date, category, tags, image, read_time as readTime, video_url, meta_description, keywords, seo_score
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
      INSERT INTO blog_posts (id, title, excerpt, content, author, date, category, tags, image, read_time, meta_description, keywords, seo_score, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      seoScore,
      body.video_url || ''
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
        SET title = ?, excerpt = ?, content = ?, author = ?, date = ?, category = ?, tags = ?, image = ?, read_time = ?, meta_description = ?, keywords = ?, seo_score = ?, video_url = ?, updated_at = CURRENT_TIMESTAMP
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
        body.video_url || '',
        id
      ).run()
    } else {
      // 静的データからの編集 → D1に新規挿入
      await c.env.DB.prepare(`
        INSERT INTO blog_posts (id, title, excerpt, content, author, date, category, tags, image, read_time, meta_description, keywords, seo_score, video_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        seoScore,
        body.video_url || ''
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
    const { title, content, excerpt, category, tags, meta_description, featured_image, status, video_url } = body
    
    if (!title || !content || !category) {
      return c.json({ error: 'タイトル、本文、カテゴリは必須です' }, 400)
    }
    
    const id = generateBlogId(title)
    const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : []
    
    // SEOスコア計算
    const seoScore = calculateSEOScore(title, content)
    
    await c.env.DB.prepare(`
      INSERT INTO blog_posts (id, title, excerpt, content, author, date, category, tags, image, read_time, meta_description, keywords, seo_score, status, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      status || 'draft',
      video_url || ''
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
             meta_description, keywords, seo_score, online_url, meeting_type
      FROM courses
      ORDER BY created_at DESC
    `).all()
    
    const d1Courses = (dbCourses.results || []).map((course: any) => {
      // curriculumデータを変換（description を保持しつつ contents配列も追加）
      let parsedCurriculum: any[] = []
      if (course.curriculum) {
        try {
          const rawCurriculum = JSON.parse(course.curriculum)
          parsedCurriculum = rawCurriculum.map((item: any) => ({
            title: item.title || '',
            duration: item.duration || '',
            description: item.description || '', // 管理画面フォーム用に保持
            contents: item.contents || (item.description ? [item.description] : []) // フロント表示用
          }))
        } catch (e) {
          console.error('Error parsing curriculum:', e)
        }
      }
      
      return {
        id: course.id,
        title: course.title,
        catchphrase: course.catchphrase,
        description: course.description,
        longDescription: course.description, // フロント用にdescriptionをlongDescriptionとしても使用
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
        curriculum: parsedCurriculum,
        faq: course.faq ? JSON.parse(course.faq) : [],
        gallery: course.gallery ? JSON.parse(course.gallery) : [],
        features: course.features ? JSON.parse(course.features) : [],
        includes: course.includes && course.includes !== 'null' ? JSON.parse(course.includes) : [],
        maxCapacity: course.max_capacity,
        cancellationPolicy: course.cancellation_policy,
        status: course.status,
        meta_description: course.meta_description || '',
        keywords: course.keywords || '',
        online_url: course.online_url || '',
        meeting_type: course.meeting_type || 'online'
      }
    })
    
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
             meta_description, keywords, seo_score, online_url, meeting_type
      FROM courses WHERE id = ?
    `).bind(id).first()
    
    if (course) {
      // スケジュールも取得
      let courseSchedules: any[] = []
      try {
        const scheduleResult = await db.prepare(`
          SELECT * FROM schedules WHERE course_id = ? ORDER BY date ASC, start_time ASC
        `).bind(id).all()
        courseSchedules = (scheduleResult.results || []).map((s: any) => ({
          id: s.id,
          date: s.date,
          startTime: s.start_time,
          endTime: s.end_time,
          capacity: s.capacity,
          location: s.location || 'オンライン'
        }))
      } catch (e) {
        console.error('Schedule fetch error:', e)
      }
      
      // curriculumデータを変換（description を保持しつつ contents配列も追加）
      let parsedCurriculum: any[] = []
      if ((course as any).curriculum) {
        try {
          const rawCurriculum = JSON.parse((course as any).curriculum)
          parsedCurriculum = rawCurriculum.map((item: any) => ({
            title: item.title || '',
            duration: item.duration || '',
            description: item.description || '', // 管理画面フォーム用に保持
            contents: item.contents || (item.description ? [item.description] : []) // フロント表示用
          }))
        } catch (e) {
          console.error('Error parsing curriculum:', e)
        }
      }
      
      return {
        id: (course as any).id,
        title: (course as any).title,
        catchphrase: (course as any).catchphrase,
        description: (course as any).description,
        longDescription: (course as any).description, // フロント用にdescriptionをlongDescriptionとしても使用
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
        curriculum: parsedCurriculum,
        faq: (course as any).faq ? JSON.parse((course as any).faq) : [],
        gallery: (course as any).gallery ? JSON.parse((course as any).gallery) : [],
        features: (course as any).features ? JSON.parse((course as any).features) : [],
        includes: (course as any).includes && (course as any).includes !== 'null' ? JSON.parse((course as any).includes) : [],
        maxCapacity: (course as any).max_capacity,
        cancellationPolicy: (course as any).cancellation_policy,
        status: (course as any).status,
        meta_description: (course as any).meta_description || '',
        keywords: (course as any).keywords || '',
        online_url: (course as any).online_url || '',
        meeting_type: (course as any).meeting_type || 'online',
        schedules: courseSchedules
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
  const randomStr = Math.random().toString(36).substring(2, 8)
  // 英数字のみを残し、日本語は除外（URLエンコード問題を回避）
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')  // 英数字以外はハイフンに
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 20)
  // slugが空の場合（日本語のみのタイトル）はランダム文字列を使用
  return slug ? `${slug}-${randomStr}` : `course-${timestamp}-${randomStr}`
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
    
    // カリキュラムの処理（フォームのname属性は curriculum_title[] なので両方のキーをチェック）
    const rawCurriculumTitles = body['curriculum_title[]'] || body.curriculum_title
    const rawCurriculumDurations = body['curriculum_duration[]'] || body.curriculum_duration
    const rawCurriculumDescriptions = body['curriculum_description[]'] || body.curriculum_description
    const curriculumTitles = Array.isArray(rawCurriculumTitles) ? rawCurriculumTitles : [rawCurriculumTitles].filter(Boolean)
    const curriculumDurations = Array.isArray(rawCurriculumDurations) ? rawCurriculumDurations : [rawCurriculumDurations].filter(Boolean)
    const curriculumDescriptions = Array.isArray(rawCurriculumDescriptions) ? rawCurriculumDescriptions : [rawCurriculumDescriptions].filter(Boolean)
    const curriculum = curriculumTitles.map((title: string, i: number) => ({
      title: title || '',
      duration: curriculumDurations[i] || '',
      description: curriculumDescriptions[i] || ''
    })).filter((item: any) => item.title)
    
    // FAQの処理（フォームのname属性は faq_question[] なので両方のキーをチェック）
    const rawFaqQuestions = body['faq_question[]'] || body.faq_question
    const rawFaqAnswers = body['faq_answer[]'] || body.faq_answer
    const faqQuestions = Array.isArray(rawFaqQuestions) ? rawFaqQuestions : [rawFaqQuestions].filter(Boolean)
    const faqAnswers = Array.isArray(rawFaqAnswers) ? rawFaqAnswers : [rawFaqAnswers].filter(Boolean)
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
                          meta_description, keywords, seo_score, online_url, meeting_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      seoScore,
      body.online_url || '',
      body.meeting_type || 'online'
    ).run()
    
    // スケジュールの保存（フォームのname属性は schedule_date[] なので両方のキーをチェック）
    const rawScheduleDates = body['schedule_date[]'] || body.schedule_date
    const rawScheduleStarts = body['schedule_start[]'] || body.schedule_start
    const rawScheduleEnds = body['schedule_end[]'] || body.schedule_end
    const rawScheduleCapacities = body['schedule_capacity[]'] || body.schedule_capacity
    const rawScheduleLocations = body['schedule_location[]'] || body.schedule_location
    const scheduleDates = Array.isArray(rawScheduleDates) ? rawScheduleDates : [rawScheduleDates].filter(Boolean)
    const scheduleStarts = Array.isArray(rawScheduleStarts) ? rawScheduleStarts : [rawScheduleStarts].filter(Boolean)
    const scheduleEnds = Array.isArray(rawScheduleEnds) ? rawScheduleEnds : [rawScheduleEnds].filter(Boolean)
    const scheduleCapacities = Array.isArray(rawScheduleCapacities) ? rawScheduleCapacities : [rawScheduleCapacities].filter(Boolean)
    const scheduleLocations = Array.isArray(rawScheduleLocations) ? rawScheduleLocations : [rawScheduleLocations].filter(Boolean)
    
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
    
    // カリキュラムの処理（フォームのname属性は curriculum_title[] なので両方のキーをチェック）
    const rawCurriculumTitles = body['curriculum_title[]'] || body.curriculum_title
    const rawCurriculumDurations = body['curriculum_duration[]'] || body.curriculum_duration
    const rawCurriculumDescriptions = body['curriculum_description[]'] || body.curriculum_description
    const curriculumTitles = Array.isArray(rawCurriculumTitles) ? rawCurriculumTitles : [rawCurriculumTitles].filter(Boolean)
    const curriculumDurations = Array.isArray(rawCurriculumDurations) ? rawCurriculumDurations : [rawCurriculumDurations].filter(Boolean)
    const curriculumDescriptions = Array.isArray(rawCurriculumDescriptions) ? rawCurriculumDescriptions : [rawCurriculumDescriptions].filter(Boolean)
    const curriculum = curriculumTitles.map((title: string, i: number) => ({
      title: title || '',
      duration: curriculumDurations[i] || '',
      description: curriculumDescriptions[i] || ''
    })).filter((item: any) => item.title)
    
    // FAQの処理（フォームのname属性は faq_question[] なので両方のキーをチェック）
    const rawFaqQuestions = body['faq_question[]'] || body.faq_question
    const rawFaqAnswers = body['faq_answer[]'] || body.faq_answer
    const faqQuestions = Array.isArray(rawFaqQuestions) ? rawFaqQuestions : [rawFaqQuestions].filter(Boolean)
    const faqAnswers = Array.isArray(rawFaqAnswers) ? rawFaqAnswers : [rawFaqAnswers].filter(Boolean)
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
            max_capacity = ?, cancellation_policy = ?, meta_description = ?, keywords = ?, seo_score = ?,
            online_url = ?, meeting_type = ?, updated_at = CURRENT_TIMESTAMP
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
        body.online_url || '',
        body.meeting_type || 'online',
        id
      ).run()
    } else {
      // 静的データからの編集 → D1に新規挿入
      await c.env.DB.prepare(`
        INSERT INTO courses (id, title, catchphrase, description, price, duration, level, category, image,
                            instructor, instructor_title, instructor_bio, instructor_image,
                            target_audience, curriculum, faq, gallery, features, max_capacity, cancellation_policy,
                            meta_description, keywords, seo_score, online_url, meeting_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        seoScore,
        body.online_url || '',
        body.meeting_type || 'online'
      ).run()
    }
    
    // スケジュールの更新（既存を削除して新規追加）（フォームのname属性は schedule_date[] なので両方のキーをチェック）
    const rawScheduleDates2 = body['schedule_date[]'] || body.schedule_date
    const rawScheduleStarts2 = body['schedule_start[]'] || body.schedule_start
    const rawScheduleEnds2 = body['schedule_end[]'] || body.schedule_end
    const rawScheduleCapacities2 = body['schedule_capacity[]'] || body.schedule_capacity
    const rawScheduleLocations2 = body['schedule_location[]'] || body.schedule_location
    const scheduleDates = Array.isArray(rawScheduleDates2) ? rawScheduleDates2 : [rawScheduleDates2].filter(Boolean)
    const scheduleStarts = Array.isArray(rawScheduleStarts2) ? rawScheduleStarts2 : [rawScheduleStarts2].filter(Boolean)
    const scheduleEnds = Array.isArray(rawScheduleEnds2) ? rawScheduleEnds2 : [rawScheduleEnds2].filter(Boolean)
    const scheduleCapacities = Array.isArray(rawScheduleCapacities2) ? rawScheduleCapacities2 : [rawScheduleCapacities2].filter(Boolean)
    const scheduleLocations = Array.isArray(rawScheduleLocations2) ? rawScheduleLocations2 : [rawScheduleLocations2].filter(Boolean)
    
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

// 予約を手入力で追加
app.post('/admin/api/bookings/manual', async (c) => {
  try {
    const body = await c.req.json()
    const { 
      source, course_id, course_name, customer_name, customer_email, 
      customer_phone, preferred_date, amount, payment_status, admin_note 
    } = body
    
    if (!source || !course_id || !customer_name || !customer_email) {
      return c.json({ success: false, error: '必須項目が不足しています' }, 400)
    }
    
    await c.env.DB.prepare(`
      INSERT INTO bookings (
        course_id, course_name, customer_name, customer_email, customer_phone,
        preferred_date, status, payment_status, amount, admin_note, source
      ) VALUES (?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?, ?)
    `).bind(
      course_id,
      course_name,
      customer_name,
      customer_email,
      customer_phone || null,
      preferred_date || null,
      payment_status || 'paid',
      amount || 0,
      admin_note || null,
      source
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Manual booking error:', error)
    return c.json({ success: false, error: '予約の登録に失敗しました' }, 500)
  }
})

// CSV一括インポート
app.post('/admin/api/bookings/import', async (c) => {
  try {
    const body = await c.req.json()
    const { bookings } = body
    
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
      return c.json({ success: false, error: 'インポートデータがありません' }, 400)
    }
    
    let successCount = 0
    const errors: string[] = []
    
    for (const booking of bookings) {
      try {
        const { 
          source, course_id, course_name, customer_name, customer_email, 
          customer_phone, preferred_date, amount, ticket_info, admin_note 
        } = booking
        
        if (!customer_name || !customer_email) {
          errors.push(`${customer_name || '名前なし'}: 必須項目が不足`)
          continue
        }
        
        // 備考にチケット情報を追加
        let note = ticket_info ? `チケット: ${ticket_info}` : null
        if (admin_note) note = note ? `${note} / ${admin_note}` : admin_note
        
        // 日付を正規化（様々なフォーマットに対応）
        let normalizedDate = null
        if (preferred_date) {
          const dateStr = preferred_date.toString().trim()
          // 2024/1/15、2024-01-15、2024年1月15日 などに対応
          const match = dateStr.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/)
          if (match) {
            normalizedDate = `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
          }
        }
        
        await c.env.DB.prepare(`
          INSERT INTO bookings (
            course_id, course_name, customer_name, customer_email, customer_phone,
            preferred_date, status, payment_status, amount, admin_note, source
          ) VALUES (?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?, ?)
        `).bind(
          course_id || null,
          course_name || null,
          customer_name,
          customer_email,
          customer_phone || null,
          normalizedDate,
          amount || 0,
          note,
          source || 'CSV'
        ).run()
        
        successCount++
      } catch (err) {
        console.error('Import row error:', err)
        errors.push(`${booking.customer_name || '不明'}: 登録失敗`)
      }
    }
    
    return c.json({ 
      success: true, 
      count: successCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('CSV import error:', error)
    return c.json({ success: false, error: 'インポートに失敗しました' }, 500)
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

// ===== ワークスペース管理 =====
app.get('/admin/workspace', async (c) => {
  try {
    const schedules = await c.env.DB.prepare(`
      SELECT * FROM workspace_schedules ORDER BY date DESC, start_time DESC
    `).all()
    
    const bookings = await c.env.DB.prepare(`
      SELECT b.*, s.date as schedule_date, s.start_time || ' - ' || s.end_time as schedule_time
      FROM workspace_bookings b
      LEFT JOIN workspace_schedules s ON b.workspace_schedule_id = s.id
      ORDER BY b.created_at DESC
    `).all()
    
    return c.html(renderWorkspaceAdmin(schedules.results as any[], bookings.results as any[]))
  } catch (error) {
    console.error('Workspace admin error:', error)
    return c.html(renderWorkspaceAdmin([], []))
  }
})

// ワークスペーススケジュールAPI
app.post('/admin/api/workspace/schedules', async (c) => {
  try {
    const data = await c.req.json()
    const id = `ws_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    await c.env.DB.prepare(`
      INSERT INTO workspace_schedules (id, title, description, date, start_time, end_time, capacity, price, meet_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title || 'mirAIcafe ワークスペース',
      data.description || null,
      data.date,
      data.start_time,
      data.end_time,
      data.capacity || 6,
      data.price || 500,
      data.meet_url || null
    ).run()
    
    return c.json({ success: true, id })
  } catch (error: any) {
    console.error('Create workspace schedule error:', error)
    return c.json({ error: error?.message || 'Failed to create schedule' }, 500)
  }
})

app.put('/admin/api/workspace/schedules/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE workspace_schedules 
      SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, capacity = ?, price = ?, meet_url = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      data.title,
      data.description || null,
      data.date,
      data.start_time,
      data.end_time,
      data.capacity,
      data.price,
      data.meet_url || null,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Update workspace schedule error:', error)
    return c.json({ error: error?.message || 'Failed to update schedule' }, 500)
  }
})

app.delete('/admin/api/workspace/schedules/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // 予約がある場合は削除不可
    const bookings = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM workspace_bookings WHERE workspace_schedule_id = ? AND status != 'cancelled'
    `).bind(id).first() as any
    
    if (bookings?.count > 0) {
      return c.json({ error: '予約がある日程は削除できません' }, 400)
    }
    
    await c.env.DB.prepare('DELETE FROM workspace_schedules WHERE id = ?').bind(id).run()
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Delete workspace schedule error:', error)
    return c.json({ error: error?.message || 'Failed to delete schedule' }, 500)
  }
})

// ===== 個別相談管理 =====
const CONSULTATION_MEET_URL = 'https://meet.google.com/hsd-xuri-hiu'

app.get('/admin/consultations', async (c) => {
  try {
    const bookings = await c.env.DB.prepare(`
      SELECT * FROM consultation_bookings ORDER BY date DESC, time DESC
    `).all()
    
    return c.html(renderConsultationAdmin(bookings.results as any[]))
  } catch (error) {
    console.error('Consultation admin error:', error)
    return c.html(renderConsultationAdmin([]))
  }
})

// ステータス更新API
app.put('/admin/api/consultations/:id/status', async (c) => {
  try {
    const id = c.req.param('id')
    const { status } = await c.req.json()
    
    await c.env.DB.prepare(`
      UPDATE consultation_bookings 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, id).run()
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Update consultation status error:', error)
    return c.json({ error: error?.message || 'Failed to update status' }, 500)
  }
})

// リマインドメール送信API
app.post('/admin/api/consultations/:id/reminder', async (c) => {
  try {
    const id = c.req.param('id')
    const { RESEND_API_KEY } = c.env
    
    if (!RESEND_API_KEY) {
      return c.json({ error: 'メール設定がありません' }, 500)
    }
    
    const booking = await c.env.DB.prepare(`
      SELECT * FROM consultation_bookings WHERE id = ?
    `).bind(id).first() as any
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404)
    }
    
    const typeLabel = booking.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談'
    const [year, month, day] = booking.date.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const dateStr = `${year}年${month}月${day}日(${weekdays[date.getDay()]})`
    
    // Resend APIでメール送信
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'mirAIcafe <noreply@miraicafe.work>',
        to: booking.customer_email,
        subject: `【リマインド】${dateStr} ${booking.time}〜 ${typeLabel}のご案内`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">mirAIcafe 個別相談</h1>
            </div>
            <div style="padding: 24px; background: #fff;">
              <p>${booking.customer_name} 様</p>
              <p>ご予約いただいている個別相談のリマインドです。</p>
              
              <div style="background: #fdf2f8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h2 style="margin: 0 0 16px 0; color: #be185d; font-size: 18px;">📅 ご予約内容</h2>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">日時</td>
                    <td style="padding: 8px 0; font-weight: bold;">${dateStr} ${booking.time}〜</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">相談タイプ</td>
                    <td style="padding: 8px 0; font-weight: bold;">${typeLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">時間</td>
                    <td style="padding: 8px 0; font-weight: bold;">${booking.duration}分</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #ecfdf5; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <h2 style="margin: 0 0 12px 0; color: #059669; font-size: 18px;">🎥 オンラインミーティング</h2>
                <p style="margin: 0 0 16px 0;">開始時刻になりましたら、下記リンクからご参加ください。</p>
                <a href="${CONSULTATION_MEET_URL}" 
                   style="display: inline-block; background: #10b981; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Google Meet に参加
                </a>
                <p style="margin: 16px 0 0 0; font-size: 12px; color: #6b7280;">${CONSULTATION_MEET_URL}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                ご不明な点がございましたら、お気軽にご連絡ください。<br>
                当日お会いできることを楽しみにしております。
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
              mirAIcafe - AI活用とキャリア支援<br>
              <a href="https://miraicafe.work" style="color: #ec4899;">https://miraicafe.work</a>
            </div>
          </div>
        `
      })
    })
    
    if (!emailRes.ok) {
      const error = await emailRes.text()
      console.error('Email send error:', error)
      return c.json({ error: 'メール送信に失敗しました' }, 500)
    }
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Send reminder error:', error)
    return c.json({ error: error?.message || 'Failed to send reminder' }, 500)
  }
})

// カレンダー登録API（手動）
app.post('/admin/api/consultations/:id/calendar', async (c) => {
  try {
    const id = c.req.param('id')
    
    const booking = await c.env.DB.prepare(`
      SELECT * FROM consultation_bookings WHERE id = ?
    `).bind(id).first() as any
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404)
    }
    
    // Note: Google Calendar APIへの書き込みにはOAuth認証が必要
    // 現在の設定ではAPIキーのみなので、読み取り専用
    // 手動でカレンダーに追加するためのリンクを生成
    
    const typeLabel = booking.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談'
    const [year, month, day] = booking.date.split('-').map(Number)
    const [hour, minute] = booking.time.split(':').map(Number)
    
    // JST時刻をUTCに変換（JST = UTC+9）
    const startDateUTC = new Date(Date.UTC(year, month - 1, day, hour - 9, minute))
    const endDateUTC = new Date(startDateUTC.getTime() + booking.duration * 60 * 1000)
    
    // Google Calendar URL形式（YYYYMMDDTHHmmssZ）
    const formatGoogleDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    }
    
    const details = `お客様: ${booking.customer_name}
メール: ${booking.customer_email}
電話: ${booking.customer_phone || '-'}

Meet URL: ${CONSULTATION_MEET_URL}`
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`【個別相談】${booking.customer_name}様 - ${typeLabel}`)}&dates=${formatGoogleDate(startDateUTC)}/${formatGoogleDate(endDateUTC)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(CONSULTATION_MEET_URL)}`
    
    return c.json({ 
      success: true, 
      calendarUrl,
      message: 'カレンダーURLを生成しました。新しいタブで開いて登録してください。'
    })
  } catch (error: any) {
    console.error('Calendar registration error:', error)
    return c.json({ error: error?.message || 'Failed to register to calendar' }, 500)
  }
})

// 承認API（決済URLをお客様に送信）
app.post('/admin/api/consultations/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY
    const RESEND_API_KEY = c.env.RESEND_API_KEY
    
    if (!STRIPE_SECRET_KEY) {
      return c.json({ error: 'Stripe設定がありません' }, 500)
    }
    
    const booking = await c.env.DB.prepare(`
      SELECT * FROM consultation_bookings WHERE id = ?
    `).bind(id).first() as any
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404)
    }
    
    if (booking.status !== 'pending_approval') {
      return c.json({ error: 'この予約は既に処理済みです' }, 400)
    }
    
    const typeLabel = booking.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談'
    const [year, month, day] = booking.date.split('-').map(Number)
    const bookingDate = new Date(year, month - 1, day)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const dateLabel = `${year}年${month}月${day}日(${weekdays[bookingDate.getDay()]})`
    
    // 決済期限を予約日の前日23:59までに設定（JST）
    // 予約日の前日 23:59 JST = 予約日 -1日 + 14:59 UTC
    const deadlineDate = new Date(Date.UTC(year, month - 1, day - 1, 14, 59, 0))
    const now = new Date()
    
    // 既に予約日を過ぎている場合はエラー
    if (now >= bookingDate) {
      return c.json({ error: '予約日を過ぎているため承認できません' }, 400)
    }
    
    // 決済期限が既に過ぎている場合は警告
    const isDeadlinePassed = now >= deadlineDate
    
    // Stripeチェックアウトセッションを作成
    const stripe = createStripeClient(STRIPE_SECRET_KEY)
    
    const origin = c.req.header('origin') || 'https://miraicafe.work'
    
    // Stripeセッションの有効期限を設定（最大24時間、または予約前日23:59まで）
    // expires_at は Unix timestamp（秒）
    const maxExpiry = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24時間後
    const deadlineExpiry = Math.floor(deadlineDate.getTime() / 1000)
    const expiresAt = Math.min(maxExpiry, deadlineExpiry)
    
    // 最低30分の有効期限を確保
    const minExpiry = Math.floor(Date.now() / 1000) + (30 * 60)
    const finalExpiresAt = Math.max(expiresAt, minExpiry)
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `【${typeLabel}】${booking.duration}分`,
              description: `日時: ${dateLabel} ${booking.time}〜`,
            },
            unit_amount: booking.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/consultation/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/consultation?canceled=true`,
      customer_email: booking.customer_email,
      expires_at: finalExpiresAt,
      metadata: {
        consultation_id: booking.id,
        type: booking.type,
        duration: booking.duration.toString(),
        date: booking.date,
        time: booking.time,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone || '',
        message: booking.message || '',
      },
      locale: 'ja',
    })
    
    // DBを更新（approved状態に）
    await c.env.DB.prepare(`
      UPDATE consultation_bookings 
      SET status = 'approved', stripe_session_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(session.id, id).run()
    
    // お客様に決済URLメールを送信
    if (RESEND_API_KEY && session.url) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'mirAIcafe <noreply@miraicafe.work>',
            to: booking.customer_email,
            subject: `【予約承認】${typeLabel}のお支払いのご案内 | mirAIcafe`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ec4899;">mirAIcafe - 個別相談予約承認</h2>
                
                <p>${booking.customer_name}様</p>
                
                <p>この度は個別相談のご予約をいただき、誠にありがとうございます。<br>
                ご予約内容を確認し、承認いたしました。</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #333;">ご予約内容</h3>
                  <p><strong>相談タイプ:</strong> ${typeLabel}</p>
                  <p><strong>日時:</strong> ${dateLabel} ${booking.time}〜</p>
                  <p><strong>時間:</strong> ${booking.duration}分</p>
                  <p><strong>料金:</strong> ¥${booking.amount.toLocaleString()}</p>
                </div>
                
                <div style="background: #ec4899; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0 0 15px 0; font-weight: bold;">お支払いはこちらから</p>
                  <a href="${session.url}" style="display: inline-block; background: white; color: #ec4899; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    決済ページへ進む
                  </a>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">
                    <strong>⚠️ 重要：お支払い期限について</strong><br>
                    決済は<strong>予約日の前日23:59まで</strong>にお済ませください。<br>
                    期限を過ぎると決済リンクは無効となり、予約は自動キャンセルとなります。
                  </p>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  ※ 決済完了後、Google Meetの参加URLをお送りいたします。
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #666; font-size: 12px;">
                  mirAIcafe<br>
                  <a href="https://miraicafe.work">https://miraicafe.work</a>
                </p>
              </div>
            `,
          }),
        })
        
        // 管理者にも通知
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'mirAIcafe <noreply@miraicafe.work>',
            to: 'hatarakusutairu@gmail.com',
            subject: `【承認完了】${booking.customer_name}様に決済URLを送信しました`,
            html: `
              <div style="font-family: sans-serif;">
                <h2>承認・決済URL送信完了</h2>
                <p>${booking.customer_name}様(${booking.customer_email})に決済URLを送信しました。</p>
                <p><strong>予約内容:</strong> ${typeLabel} ${booking.duration}分</p>
                <p><strong>日時:</strong> ${dateLabel} ${booking.time}〜</p>
                <p><strong>金額:</strong> ¥${booking.amount.toLocaleString()}</p>
                <p><a href="https://miraicafe.work/admin/consultations">管理画面で確認</a></p>
              </div>
            `,
          }),
        })
      } catch (emailError) {
        console.error('Email error:', emailError)
      }
    }
    
    return c.json({ 
      success: true, 
      message: '承認しました。お客様に決済URLを送信しました。',
      paymentUrl: session.url
    })
  } catch (error: any) {
    console.error('Approve error:', error)
    return c.json({ error: error?.message || '承認処理に失敗しました' }, 500)
  }
})

// 決済URL再送信API
app.post('/admin/api/consultations/:id/resend-payment', async (c) => {
  try {
    const id = c.req.param('id')
    const STRIPE_SECRET_KEY = c.env.STRIPE_SECRET_KEY
    const RESEND_API_KEY = c.env.RESEND_API_KEY
    
    if (!STRIPE_SECRET_KEY || !RESEND_API_KEY) {
      return c.json({ error: '設定が不足しています' }, 500)
    }
    
    const booking = await c.env.DB.prepare(`
      SELECT * FROM consultation_bookings WHERE id = ?
    `).bind(id).first() as any
    
    if (!booking) {
      return c.json({ error: '予約が見つかりません' }, 404)
    }
    
    if (booking.status !== 'approved') {
      return c.json({ error: 'この予約は承認済みではありません' }, 400)
    }
    
    const typeLabel = booking.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談'
    const [year, month, day] = booking.date.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const dateLabel = `${year}年${month}月${day}日(${weekdays[date.getDay()]})`
    
    // 既存のセッションを取得するか、新しく作成
    const stripe = createStripeClient(STRIPE_SECRET_KEY)
    
    let paymentUrl: string | null = null
    
    // 既存セッションがあれば確認
    if (booking.stripe_session_id) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(booking.stripe_session_id)
        if (existingSession.status === 'open' && existingSession.url) {
          paymentUrl = existingSession.url
        }
      } catch (e) {
        // セッションが期限切れなど
      }
    }
    
    // 新しいセッションを作成
    if (!paymentUrl) {
      const origin = c.req.header('origin') || 'https://miraicafe.work'
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'jpy',
              product_data: {
                name: `【${typeLabel}】${booking.duration}分`,
                description: `日時: ${dateLabel} ${booking.time}〜`,
              },
              unit_amount: booking.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/consultation/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/consultation?canceled=true`,
        customer_email: booking.customer_email,
        metadata: {
          consultation_id: booking.id,
          type: booking.type,
          duration: booking.duration.toString(),
          date: booking.date,
          time: booking.time,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone || '',
          message: booking.message || '',
        },
        locale: 'ja',
      })
      
      paymentUrl = session.url
      
      // DBを更新
      await c.env.DB.prepare(`
        UPDATE consultation_bookings 
        SET stripe_session_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(session.id, id).run()
    }
    
    // メール送信
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'mirAIcafe <noreply@miraicafe.work>',
        to: booking.customer_email,
        subject: `【リマインド】${typeLabel}のお支払いのご案内 | mirAIcafe`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ec4899;">mirAIcafe - お支払いのご案内（リマインド）</h2>
            
            <p>${booking.customer_name}様</p>
            
            <p>個別相談のご予約について、お支払いがまだ完了していないようです。<br>
            お早めにお支払いをお願いいたします。</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">ご予約内容</h3>
              <p><strong>相談タイプ:</strong> ${typeLabel}</p>
              <p><strong>日時:</strong> ${dateLabel} ${booking.time}〜</p>
              <p><strong>時間:</strong> ${booking.duration}分</p>
              <p><strong>料金:</strong> ¥${booking.amount.toLocaleString()}</p>
            </div>
            
            <div style="background: #ec4899; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; font-weight: bold;">お支払いはこちらから</p>
              <a href="${paymentUrl}" style="display: inline-block; background: white; color: #ec4899; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                決済ページへ進む
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              ※ 決済完了後、Google Meetの参加URLをお送りいたします。<br>
              ※ 期日までにお支払いがない場合、予約がキャンセルとなる場合があります。
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px;">
              mirAIcafe<br>
              <a href="https://miraicafe.work">https://miraicafe.work</a>
            </p>
          </div>
        `,
      }),
    })
    
    return c.json({ success: true, message: '決済URLを再送信しました' })
  } catch (error: any) {
    console.error('Resend payment error:', error)
    return c.json({ error: error?.message || '送信に失敗しました' }, 500)
  }
})

// ===== 決済管理 =====
app.get('/admin/payments', async (c) => {
  try {
    // 決済一覧を取得
    const payments = await c.env.DB.prepare(`
      SELECT * FROM payments ORDER BY created_at DESC
    `).all()
    
    // 統計を計算
    const paymentsData = payments.results as Payment[]
    const stats = {
      total: paymentsData.length,
      succeeded: paymentsData.filter(p => p.status === 'succeeded').length,
      pending: paymentsData.filter(p => p.status === 'pending').length,
      failed: paymentsData.filter(p => p.status === 'failed' || p.status === 'canceled').length,
      totalAmount: paymentsData
        .filter(p => p.status === 'succeeded')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    }
    
    return c.html(renderPaymentsList(paymentsData, stats))
  } catch (error) {
    console.error('Payments error:', error)
    return c.html(renderPaymentsList([], { total: 0, succeeded: 0, pending: 0, failed: 0, totalAmount: 0 }))
  }
})

// 決済エクスポート（CSV）
app.get('/admin/payments/export', async (c) => {
  try {
    const payments = await c.env.DB.prepare(`
      SELECT * FROM payments ORDER BY created_at DESC
    `).all()
    
    // CSVヘッダー
    const headers = ['ID', '日時', '顧客名', 'メール', '講座', '金額', '通貨', 'ステータス', '決済方法', 'Stripe ID']
    
    // CSVデータ
    const rows = (payments.results as Payment[]).map(p => [
      p.id,
      p.created_at,
      p.customer_name || '',
      p.customer_email || '',
      p.course_title || '',
      p.amount,
      p.currency,
      p.status,
      p.payment_method || '',
      p.stripe_payment_intent_id || ''
    ])
    
    // CSV文字列生成
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    // BOMを付けてUTF-8で出力
    const bom = '\uFEFF'
    
    return new Response(bom + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Payment export error:', error)
    return c.redirect('/admin/payments')
  }
})

// ===== 料金パターン管理 =====
app.get('/admin/pricing-patterns', async (c) => {
  try {
    const patterns = await c.env.DB.prepare(`
      SELECT * FROM pricing_patterns ORDER BY sort_order ASC
    `).all()
    
    return c.html(renderPricingPatternsList(patterns.results as any[]))
  } catch (error) {
    console.error('Pricing patterns error:', error)
    return c.html(renderPricingPatternsList([]))
  }
})

app.get('/admin/pricing-patterns/new', async (c) => {
  return c.html(renderPricingPatternForm())
})

app.get('/admin/pricing-patterns/:id/edit', async (c) => {
  const id = c.req.param('id')
  
  try {
    const pattern = await c.env.DB.prepare(`
      SELECT * FROM pricing_patterns WHERE id = ?
    `).bind(id).first()
    
    if (!pattern) {
      return c.redirect('/admin/pricing-patterns')
    }
    
    return c.html(renderPricingPatternForm(pattern as any))
  } catch (error) {
    console.error('Pricing pattern edit error:', error)
    return c.redirect('/admin/pricing-patterns')
  }
})

// 料金パターンAPI
app.post('/admin/api/pricing-patterns', async (c) => {
  try {
    const data = await c.req.json()
    const id = `pattern-${Date.now()}`
    
    // デフォルト設定の場合、他のパターンのデフォルトを解除
    if (data.is_default) {
      await c.env.DB.prepare(`
        UPDATE pricing_patterns SET is_default = 0
      `).run()
    }
    
    await c.env.DB.prepare(`
      INSERT INTO pricing_patterns (id, name, description, course_discount_rate, early_bird_discount_rate, early_bird_days, has_monthly_option, tax_rate, is_default, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM pricing_patterns))
    `).bind(
      id,
      data.name,
      data.description || '',
      data.course_discount_rate,
      data.early_bird_discount_rate,
      data.early_bird_days,
      data.has_monthly_option,
      data.tax_rate,
      data.is_default
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Create pricing pattern error:', error)
    return c.json({ success: false, error: '作成に失敗しました' }, 500)
  }
})

app.put('/admin/api/pricing-patterns/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const data = await c.req.json()
    
    // デフォルト設定の場合、他のパターンのデフォルトを解除
    if (data.is_default) {
      await c.env.DB.prepare(`
        UPDATE pricing_patterns SET is_default = 0 WHERE id != ?
      `).bind(id).run()
    }
    
    await c.env.DB.prepare(`
      UPDATE pricing_patterns SET
        name = ?,
        description = ?,
        course_discount_rate = ?,
        early_bird_discount_rate = ?,
        early_bird_days = ?,
        has_monthly_option = ?,
        tax_rate = ?,
        is_default = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.name,
      data.description || '',
      data.course_discount_rate,
      data.early_bird_discount_rate,
      data.early_bird_days,
      data.has_monthly_option,
      data.tax_rate,
      data.is_default,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Update pricing pattern error:', error)
    return c.json({ success: false, error: '更新に失敗しました' }, 500)
  }
})

app.delete('/admin/api/pricing-patterns/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    // 使用中のコースがあるかチェック
    const usage = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM course_series WHERE pricing_pattern_id = ?
    `).bind(id).first()
    
    if (usage && (usage as any).count > 0) {
      return c.json({ success: false, error: 'このパターンを使用しているコースがあるため削除できません' }, 400)
    }
    
    await c.env.DB.prepare(`
      DELETE FROM pricing_patterns WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete pricing pattern error:', error)
    return c.json({ success: false, error: '削除に失敗しました' }, 500)
  }
})

// ===== コース（シリーズ）管理 =====
app.get('/admin/course-series', async (c) => {
  try {
    const series = await c.env.DB.prepare(`
      SELECT * FROM course_series ORDER BY display_order ASC, created_at DESC
    `).all()
    
    const patterns = await c.env.DB.prepare(`
      SELECT * FROM pricing_patterns ORDER BY sort_order ASC
    `).all()
    
    return c.html(renderCourseSeriesList(series.results as any[], patterns.results as any[]))
  } catch (error) {
    console.error('Course series error:', error)
    return c.html(renderCourseSeriesList([], []))
  }
})

app.get('/admin/course-series/new', async (c) => {
  try {
    const patterns = await c.env.DB.prepare(`
      SELECT * FROM pricing_patterns ORDER BY sort_order ASC
    `).all()
    
    const courses = await c.env.DB.prepare(`
      SELECT id, title, series_id, session_number FROM courses WHERE status = 'published' ORDER BY title ASC
    `).all()
    
    return c.html(renderCourseSeriesForm(patterns.results as any[], courses.results as any[]))
  } catch (error) {
    console.error('Course series new error:', error)
    return c.redirect('/admin/course-series')
  }
})

app.get('/admin/course-series/:id/edit', async (c) => {
  const id = c.req.param('id')
  
  try {
    const series = await c.env.DB.prepare(`
      SELECT * FROM course_series WHERE id = ?
    `).bind(id).first()
    
    if (!series) {
      return c.redirect('/admin/course-series')
    }
    
    const patterns = await c.env.DB.prepare(`
      SELECT * FROM pricing_patterns ORDER BY sort_order ASC
    `).all()
    
    const courses = await c.env.DB.prepare(`
      SELECT id, title, series_id, session_number FROM courses WHERE status = 'published' ORDER BY title ASC
    `).all()
    
    const linkedCourses = await c.env.DB.prepare(`
      SELECT id, title, session_number FROM courses WHERE series_id = ? ORDER BY session_number ASC
    `).bind(id).all()
    
    const terms = await c.env.DB.prepare(`
      SELECT id, series_id, name, start_date, end_date, early_bird_deadline, status FROM course_terms WHERE series_id = ? ORDER BY start_date ASC
    `).bind(id).all()
    
    return c.html(renderCourseSeriesForm(
      patterns.results as any[],
      courses.results as any[],
      series as any,
      linkedCourses.results as any[],
      terms.results as any[]
    ))
  } catch (error) {
    console.error('Course series edit error:', error)
    return c.redirect('/admin/course-series')
  }
})

// コースAPI
app.post('/admin/api/course-series', async (c) => {
  try {
    const data = await c.req.json()
    const id = `series-${Date.now()}`
    
    // Stripe商品・価格を自動作成（公開時のみ）
    let stripeProductId = null
    let stripePriceIdCourse = null
    let stripePriceIdEarly = null
    let stripePriceIdMonthly = null
    
    if (data.status === 'published' && c.env.STRIPE_SECRET_KEY) {
      try {
        // 料金パターン情報を取得
        const pattern = await c.env.DB.prepare(`
          SELECT has_monthly_option FROM pricing_patterns WHERE id = ?
        `).bind(data.pricing_pattern_id).first() as { has_monthly_option: number } | null
        
        const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
        const stripeResult = await createCourseSeriesStripeProducts(stripe, {
          seriesId: id,
          title: data.title,
          description: data.description,
          coursePriceIncl: data.calc_course_price_incl,
          earlyPriceIncl: data.calc_early_price_incl,
          monthlyPriceIncl: data.calc_monthly_price_incl,
          totalSessions: data.total_sessions,
          hasMonthlyOption: pattern?.has_monthly_option === 1
        })
        
        stripeProductId = stripeResult.productId
        stripePriceIdCourse = stripeResult.coursePriceId
        stripePriceIdEarly = stripeResult.earlyPriceId || null
        stripePriceIdMonthly = stripeResult.monthlyPriceId || null
        
        console.log('Stripe products created:', stripeResult)
      } catch (stripeError) {
        console.error('Stripe product creation failed:', stripeError)
        // Stripe作成失敗してもDB保存は続行
      }
    }
    
    await c.env.DB.prepare(`
      INSERT INTO course_series (
        id, title, subtitle, description, image, total_sessions, duration_minutes,
        base_price_per_session, pricing_pattern_id,
        calc_single_price_incl, calc_single_total_incl, calc_course_price_incl,
        calc_early_price_incl, calc_monthly_price_incl, calc_savings_course, calc_savings_early,
        early_bird_deadline, is_featured, status,
        stripe_product_id, stripe_price_id_course, stripe_price_id_early, stripe_price_id_monthly
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.title,
      data.subtitle || '',
      data.description || '',
      data.image || null,
      data.total_sessions,
      data.duration_minutes,
      data.base_price_per_session,
      data.pricing_pattern_id,
      data.calc_single_price_incl,
      data.calc_single_total_incl,
      data.calc_course_price_incl,
      data.calc_early_price_incl,
      data.calc_monthly_price_incl,
      data.calc_savings_course,
      data.calc_savings_early,
      data.early_bird_deadline,
      data.is_featured,
      data.status,
      stripeProductId,
      stripePriceIdCourse,
      stripePriceIdEarly,
      stripePriceIdMonthly
    ).run()
    
    // 講座の紐付け
    if (data.linked_courses && data.linked_courses.length > 0) {
      for (let i = 0; i < data.linked_courses.length; i++) {
        await c.env.DB.prepare(`
          UPDATE courses SET series_id = ?, session_number = ? WHERE id = ?
        `).bind(id, i + 1, data.linked_courses[i]).run()
      }
    }
    
    // 開催期の作成（新規作成時にpending_termsがある場合）
    if (data.pending_terms && data.pending_terms.length > 0) {
      for (const term of data.pending_terms) {
        const termId = `term-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        await c.env.DB.prepare(`
          INSERT INTO course_terms (id, series_id, name, start_date, end_date, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(termId, id, term.name, term.start_date, term.end_date, term.status || 'active').run()
      }
    }
    
    return c.json({ success: true, id, stripeProductId })
  } catch (error) {
    console.error('Create course series error:', error)
    return c.json({ success: false, error: '作成に失敗しました' }, 500)
  }
})

app.put('/admin/api/course-series/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const data = await c.req.json()
    
    // 既存のStripe情報を取得
    const existing = await c.env.DB.prepare(`
      SELECT stripe_product_id, stripe_price_id_course, stripe_price_id_early, stripe_price_id_monthly, status as old_status
      FROM course_series WHERE id = ?
    `).bind(id).first() as { 
      stripe_product_id: string | null
      stripe_price_id_course: string | null
      stripe_price_id_early: string | null
      stripe_price_id_monthly: string | null
      old_status: string 
    } | null
    
    let stripeProductId = existing?.stripe_product_id || null
    let stripePriceIdCourse = existing?.stripe_price_id_course || null
    let stripePriceIdEarly = existing?.stripe_price_id_early || null
    let stripePriceIdMonthly = existing?.stripe_price_id_monthly || null
    
    // Stripe商品の作成/更新
    if (c.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
        
        // 料金パターン情報を取得
        const pattern = await c.env.DB.prepare(`
          SELECT has_monthly_option FROM pricing_patterns WHERE id = ?
        `).bind(data.pricing_pattern_id).first() as { has_monthly_option: number } | null
        
        if (data.status === 'published') {
          if (!stripeProductId) {
            // 新規作成（下書き→公開時）
            const stripeResult = await createCourseSeriesStripeProducts(stripe, {
              seriesId: id,
              title: data.title,
              description: data.description,
              coursePriceIncl: data.calc_course_price_incl,
              earlyPriceIncl: data.calc_early_price_incl,
              monthlyPriceIncl: data.calc_monthly_price_incl,
              totalSessions: data.total_sessions,
              hasMonthlyOption: pattern?.has_monthly_option === 1
            })
            
            stripeProductId = stripeResult.productId
            stripePriceIdCourse = stripeResult.coursePriceId
            stripePriceIdEarly = stripeResult.earlyPriceId || null
            stripePriceIdMonthly = stripeResult.monthlyPriceId || null
            
            console.log('Stripe products created on publish:', stripeResult)
          } else {
            // 既存の商品名を更新
            await updateStripeProduct(stripe, stripeProductId, data.title, data.description)
            console.log('Stripe product updated:', stripeProductId)
          }
        } else if (data.status === 'draft' && existing?.old_status === 'published' && stripeProductId) {
          // 公開→下書きに変更時はアーカイブ
          await archiveStripeProduct(stripe, stripeProductId)
          console.log('Stripe product archived:', stripeProductId)
        }
      } catch (stripeError) {
        console.error('Stripe update failed:', stripeError)
      }
    }
    
    await c.env.DB.prepare(`
      UPDATE course_series SET
        title = ?,
        subtitle = ?,
        description = ?,
        image = ?,
        total_sessions = ?,
        duration_minutes = ?,
        base_price_per_session = ?,
        pricing_pattern_id = ?,
        calc_single_price_incl = ?,
        calc_single_total_incl = ?,
        calc_course_price_incl = ?,
        calc_early_price_incl = ?,
        calc_monthly_price_incl = ?,
        calc_savings_course = ?,
        calc_savings_early = ?,
        early_bird_deadline = ?,
        is_featured = ?,
        status = ?,
        stripe_product_id = ?,
        stripe_price_id_course = ?,
        stripe_price_id_early = ?,
        stripe_price_id_monthly = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      data.title,
      data.subtitle || '',
      data.description || '',
      data.image || null,
      data.total_sessions,
      data.duration_minutes,
      data.base_price_per_session,
      data.pricing_pattern_id,
      data.calc_single_price_incl,
      data.calc_single_total_incl,
      data.calc_course_price_incl,
      data.calc_early_price_incl,
      data.calc_monthly_price_incl,
      data.calc_savings_course,
      data.calc_savings_early,
      data.early_bird_deadline,
      data.is_featured,
      data.status,
      stripeProductId,
      stripePriceIdCourse,
      stripePriceIdEarly,
      stripePriceIdMonthly,
      id
    ).run()
    
    // 既存の紐付けを解除
    await c.env.DB.prepare(`
      UPDATE courses SET series_id = NULL, session_number = NULL WHERE series_id = ?
    `).bind(id).run()
    
    // 新しい紐付け
    if (data.linked_courses && data.linked_courses.length > 0) {
      for (let i = 0; i < data.linked_courses.length; i++) {
        await c.env.DB.prepare(`
          UPDATE courses SET series_id = ?, session_number = ? WHERE id = ?
        `).bind(id, i + 1, data.linked_courses[i]).run()
      }
    }
    
    return c.json({ success: true, stripeProductId })
  } catch (error) {
    console.error('Update course series error:', error)
    return c.json({ success: false, error: '更新に失敗しました' }, 500)
  }
})

app.delete('/admin/api/course-series/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    // 既存のStripe情報を取得してアーカイブ
    const existing = await c.env.DB.prepare(`
      SELECT stripe_product_id FROM course_series WHERE id = ?
    `).bind(id).first() as { stripe_product_id: string | null } | null
    
    if (existing?.stripe_product_id && c.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = createStripeClient(c.env.STRIPE_SECRET_KEY)
        await archiveStripeProduct(stripe, existing.stripe_product_id)
        console.log('Stripe product archived on delete:', existing.stripe_product_id)
      } catch (stripeError) {
        console.error('Stripe archive failed:', stripeError)
      }
    }
    
    // 紐付けを解除
    await c.env.DB.prepare(`
      UPDATE courses SET series_id = NULL, session_number = NULL WHERE series_id = ?
    `).bind(id).run()
    
    // コースを削除
    await c.env.DB.prepare(`
      DELETE FROM course_series WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete course series error:', error)
    return c.json({ success: false, error: '削除に失敗しました' }, 500)
  }
})

// ===== 開催期管理API =====
app.post('/admin/api/course-terms', async (c) => {
  try {
    const body = await c.req.json()
    const { series_id, name, start_date, end_date, early_bird_deadline, status } = body
    
    if (!series_id || !name || !start_date || !end_date) {
      return c.json({ success: false, error: '必須項目が不足しています' }, 400)
    }
    
    const termId = `term-${Date.now().toString(36).toUpperCase()}`
    
    await c.env.DB.prepare(`
      INSERT INTO course_terms (id, series_id, name, start_date, end_date, early_bird_deadline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(termId, series_id, name, start_date, end_date, early_bird_deadline || null, status || 'active').run()
    
    // このシリーズに紐づく講座のスケジュールをこの開催期に関連付け
    await c.env.DB.prepare(`
      UPDATE schedules SET term_id = ?
      WHERE course_id IN (SELECT id FROM courses WHERE series_id = ?)
      AND (term_id IS NULL OR term_id = '')
    `).bind(termId, series_id).run()
    
    return c.json({ 
      success: true, 
      term: { id: termId, series_id, name, start_date, end_date, early_bird_deadline, status: status || 'active' }
    })
  } catch (error) {
    console.error('Create course term error:', error)
    return c.json({ success: false, error: '開催期の作成に失敗しました' }, 500)
  }
})

// 開催期の更新
app.put('/admin/api/course-terms/:id', async (c) => {
  const termId = c.req.param('id')
  
  try {
    const body = await c.req.json()
    const { name, start_date, end_date, early_bird_deadline, status } = body
    
    if (!name || !start_date || !end_date) {
      return c.json({ success: false, error: '必須項目が不足しています' }, 400)
    }
    
    await c.env.DB.prepare(`
      UPDATE course_terms 
      SET name = ?, start_date = ?, end_date = ?, early_bird_deadline = ?, status = COALESCE(?, status)
      WHERE id = ?
    `).bind(name, start_date, end_date, early_bird_deadline || null, status || null, termId).run()
    
    return c.json({ 
      success: true, 
      term: { id: termId, name, start_date, end_date, early_bird_deadline, status } 
    })
  } catch (error) {
    console.error('Update course term error:', error)
    return c.json({ success: false, error: '開催期の更新に失敗しました' }, 500)
  }
})

app.delete('/admin/api/course-terms/:id', async (c) => {
  const termId = c.req.param('id')
  
  try {
    // この開催期に紐づく予約がないか確認
    const bookings = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM bookings WHERE term_id = ?
    `).bind(termId).first() as { count: number }
    
    if (bookings && bookings.count > 0) {
      return c.json({ 
        success: false, 
        error: `この開催期には${bookings.count}件の予約があるため削除できません` 
      }, 400)
    }
    
    // スケジュールの開催期紐づけを解除
    await c.env.DB.prepare(`
      UPDATE schedules SET term_id = NULL WHERE term_id = ?
    `).bind(termId).run()
    
    // 開催期を削除
    await c.env.DB.prepare(`
      DELETE FROM course_terms WHERE id = ?
    `).bind(termId).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete course term error:', error)
    return c.json({ success: false, error: '開催期の削除に失敗しました' }, 500)
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
  if (!sessionId || !validateSessionToken(sessionId).valid) {
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

// デバッグ用エンドポイント（一時的）
app.get('/admin/api/debug-env', async (c) => {
  return c.json({
    hasSupabaseUrl: !!c.env.SUPABASE_URL,
    hasSupabaseKey: !!c.env.SUPABASE_ANON_KEY,
    supabaseUrlPrefix: c.env.SUPABASE_URL ? c.env.SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET',
    envKeys: Object.keys(c.env)
  })
})

// 許可されるMIMEタイプ
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

// ファイル名を生成
function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${timestamp}_${random}.${ext}`
}

// 画像アップロードエンドポイント（Supabase Storage）
app.post('/admin/api/upload', async (c) => {
  try {
    // 認証チェック
    const sessionId = getCookie(c, 'admin_session')
    if (!sessionId || !validateSessionToken(sessionId).valid) {
      return c.json({ error: '認証が必要です' }, 401)
    }

    // Supabase設定チェック（先に確認）
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_ANON_KEY) {
      console.error('Supabase config missing:', { 
        hasUrl: !!c.env.SUPABASE_URL, 
        hasKey: !!c.env.SUPABASE_ANON_KEY 
      })
      return c.json({ error: 'ストレージが設定されていません。管理者に連絡してください。' }, 500)
    }

    // FormDataを取得
    let formData: FormData
    try {
      formData = await c.req.formData()
    } catch (formError) {
      console.error('FormData parse error:', formError)
      return c.json({ error: 'リクエストの解析に失敗しました' }, 400)
    }

    const file = formData.get('file') as File | null

    if (!file) {
      return c.json({ error: 'ファイルが選択されていません' }, 400)
    }

    console.log('File received:', { name: file.name, size: file.size, type: file.type })

    // MIMEタイプチェック
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return c.json({ error: '対応していないファイル形式です。JPG, PNG, GIF, WebPのみ対応しています。' }, 400)
    }

    // ファイルサイズチェック（Supabaseは50MBまで可能だが、10MBに制限）
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return c.json({ error: `ファイルサイズが大きすぎます（${sizeMB}MB）。最大10MBまでです。` }, 400)
    }

    const supabaseConfig: SupabaseConfig = {
      url: c.env.SUPABASE_URL,
      anonKey: c.env.SUPABASE_ANON_KEY
    }

    console.log('Uploading to Supabase:', { 
      fileName: file.name, 
      size: file.size, 
      type: file.type
    })

    // Supabase Storageにアップロード
    const result = await uploadToSupabase(supabaseConfig, file)

    if (!result.success) {
      console.error('Supabase upload failed:', result.error)
      return c.json({ error: result.error || 'アップロードに失敗しました' }, 500)
    }

    console.log('Upload success:', result.url)

    return c.json({ 
      success: true, 
      url: result.url,
      fileName: result.fileName,
      size: result.size,
      type: result.type
    })
  } catch (error) {
    console.error('Upload endpoint error:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return c.json({ error: `アップロードエラー: ${errorMsg}` }, 500)
  }
})

// 複数画像アップロードエンドポイント（Supabase Storage）
app.post('/admin/api/upload-multiple', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSessionToken(sessionId).valid) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const formData = await c.req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return c.json({ error: 'ファイルが選択されていません' }, 400)
    }

    // Supabase設定チェック
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_ANON_KEY) {
      return c.json({ error: 'ストレージが設定されていません' }, 500)
    }

    const supabaseConfig: SupabaseConfig = {
      url: c.env.SUPABASE_URL,
      anonKey: c.env.SUPABASE_ANON_KEY
    }

    const results: { url: string; fileName: string; size: number; type: string }[] = []
    const errors: string[] = []
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      // MIMEタイプチェック
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        errors.push(`${file.name}: 対応していないファイル形式です`)
        continue
      }

      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
        errors.push(`${file.name}: サイズ(${sizeMB}MB)が大きすぎます（最大10MB）`)
        continue
      }

      const result = await uploadToSupabase(supabaseConfig, file)
      
      if (result.success && result.url) {
        results.push({
          url: result.url,
          fileName: result.fileName || file.name,
          size: result.size || file.size,
          type: result.type || file.type
        })
      } else {
        errors.push(`${file.name}: ${result.error || 'アップロードに失敗しました'}`)
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

// 動画アップロードエンドポイント（Supabase Storage）
app.post('/admin/api/upload-video', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSessionToken(sessionId).valid) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return c.json({ error: 'ファイルが選択されていません' }, 400)
    }

    // MIMEタイプチェック
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return c.json({ error: '対応していないファイル形式です。MP4, WebM, MOVのみ対応しています。' }, 400)
    }

    // ファイルサイズチェック（50MBまで）
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      return c.json({ error: `ファイルサイズが大きすぎます（${sizeMB}MB）。最大50MBまでです。` }, 400)
    }

    // Supabase設定チェック
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_ANON_KEY) {
      return c.json({ error: 'ストレージが設定されていません' }, 500)
    }

    const supabaseConfig: SupabaseConfig = {
      url: c.env.SUPABASE_URL,
      anonKey: c.env.SUPABASE_ANON_KEY
    }

    // Supabase Storageにアップロード（videosフォルダ）
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const fileName = `${timestamp}_${random}.${ext}`
    const filePath = `videos/${fileName}`

    const response = await fetch(
      `${supabaseConfig.url}/storage/v1/object/media/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'apikey': supabaseConfig.anonKey,
          'Content-Type': file.type,
          'x-upsert': 'true'
        },
        body: file
      }
    )

    if (!response.ok) {
      console.error('Video upload error:', await response.text())
      return c.json({ error: '動画のアップロードに失敗しました' }, 500)
    }

    const publicUrl = `${supabaseConfig.url}/storage/v1/object/public/media/${filePath}`

    return c.json({ 
      success: true, 
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Video upload error:', error)
    return c.json({ error: 'アップロードに失敗しました' }, 500)
  }
})

// 画像削除エンドポイント
app.delete('/admin/api/upload/:fileIdOrName', async (c) => {
  // 認証チェック
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSessionToken(sessionId).valid) {
    return c.json({ error: '認証が必要です' }, 401)
  }

  try {
    const fileIdOrName = c.req.param('fileIdOrName')
    
    // media_filesテーブルから削除（IDまたはファイル名で検索）
    const result = await c.env.DB.prepare(`
      DELETE FROM media_files WHERE id = ? OR filename = ?
    `).bind(fileIdOrName, fileIdOrName).run()
    
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
  if (!sessionId || !validateSessionToken(sessionId).valid) {
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

// メディア配信エンドポイント（D1 Base64から配信）
app.get('/media/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const media = await c.env.DB.prepare(`
      SELECT filename, mime_type, data FROM media_files WHERE id = ?
    `).bind(id).first()
    
    if (!media) {
      return c.notFound()
    }
    
    // Base64デコード
    const binaryString = atob(media.data as string)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    const headers = new Headers()
    headers.set('Content-Type', media.mime_type as string)
    headers.set('Cache-Control', 'public, max-age=31536000')
    
    return new Response(bytes, { headers })
  } catch (error) {
    console.error('Media serve error:', error)
    return c.notFound()
  }
})

// 画像配信エンドポイント
// 本番環境: public/images/ から静的配信（Cloudflare Pagesが自動処理）
// 開発環境: R2エミュレータから配信
app.get('/images/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName')
    
    // R2が利用可能な場合（開発環境）
    if (c.env.R2_BUCKET) {
      const key = `uploads/${fileName}`
      const object = await c.env.R2_BUCKET.get(key)
      
      if (object) {
        const headers = new Headers()
        headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg')
        headers.set('Cache-Control', 'public, max-age=31536000')
        headers.set('ETag', object.etag)
        return new Response(object.body, { headers })
      }
    }
    
    // R2がない場合は404（本番ではpublic/images/から静的配信される）
    return c.notFound()
  } catch (error) {
    console.error('Image serve error:', error)
    return c.notFound()
  }
})

// 動画配信エンドポイント
// 本番環境: public/videos/ から静的配信（Cloudflare Pagesが自動処理）
// 開発環境: R2エミュレータから配信
app.get('/videos/:fileName', async (c) => {
  try {
    const fileName = c.req.param('fileName')
    
    // R2が利用可能な場合（開発環境）
    if (c.env.R2_BUCKET) {
      const key = `videos/${fileName}`
      const object = await c.env.R2_BUCKET.get(key)
      
      if (object) {
        const headers = new Headers()
        headers.set('Content-Type', object.httpMetadata?.contentType || 'video/mp4')
        headers.set('Cache-Control', 'public, max-age=31536000')
        headers.set('Accept-Ranges', 'bytes')
        
        // Range リクエスト対応（動画シーク用）
        const range = c.req.header('Range')
        if (range && object.size) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : object.size - 1
          const chunkSize = end - start + 1
          
          headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`)
          headers.set('Content-Length', String(chunkSize))
          
          const slicedObject = await c.env.R2_BUCKET.get(key, {
            range: { offset: start, length: chunkSize }
          })
          
          if (slicedObject) {
            return new Response(slicedObject.body, { status: 206, headers })
          }
        }
        
        return new Response(object.body, { headers })
      }
    }
    
    // R2がない場合は404（本番ではpublic/videos/から静的配信される）
    return c.notFound()
  } catch (error) {
    console.error('Video serve error:', error)
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
    // デフォルトのポリシーID（tokushohoを追加）
    const defaultPolicies = [
      { id: 'terms', title: '利用規約', content: '（内容準備中）' },
      { id: 'privacy', title: 'プライバシーポリシー', content: '（内容準備中）' },
      { id: 'cancellation', title: 'キャンセルポリシー', content: '（内容準備中）' },
      { id: 'tokushoho', title: '特定商取引法に基づく表記', content: '（内容準備中）' }
    ]
    
    // 存在しないポリシーを自動作成
    for (const policy of defaultPolicies) {
      const exists = await c.env.DB.prepare('SELECT id FROM policies WHERE id = ?').bind(policy.id).first()
      if (!exists) {
        await c.env.DB.prepare(
          'INSERT INTO policies (id, title, content) VALUES (?, ?, ?)'
        ).bind(policy.id, policy.title, policy.content).run()
      }
    }
    
    const result = await c.env.DB.prepare('SELECT * FROM policies ORDER BY CASE id WHEN \'terms\' THEN 1 WHEN \'privacy\' THEN 2 WHEN \'cancellation\' THEN 3 WHEN \'tokushoho\' THEN 4 ELSE 5 END').all<AdminPolicy>()
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

// ポリシー更新API（UPSERT対応）
app.put('/admin/api/policies/:id', async (c) => {
  const policyId = c.req.param('id')
  try {
    const body = await c.req.json<{ title: string; content: string }>()
    
    // まず存在確認
    const exists = await c.env.DB.prepare('SELECT id FROM policies WHERE id = ?').bind(policyId).first()
    
    if (exists) {
      // 存在する場合はUPDATE
      await c.env.DB.prepare(`
        UPDATE policies 
        SET title = ?, content = ?, last_updated = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(body.title, body.content, policyId).run()
    } else {
      // 存在しない場合はINSERT
      await c.env.DB.prepare(`
        INSERT INTO policies (id, title, content, last_updated) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(policyId, body.title, body.content).run()
    }
    
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
    
    // 講座リストを取得（講座選択質問用）
    const coursesResult = await c.env.DB.prepare(`
      SELECT title FROM courses ORDER BY created_at DESC
    `).all()
    const courseList = (coursesResult.results as any[]).map(c => c.title)
    
    // question_category === 'course' の質問の選択肢を講座リストで動的に置き換え
    const processedQuestions = (questions.results as any[]).map(q => {
      if (q.question_category === 'course' && q.question_type === 'dropdown') {
        return { ...q, options: JSON.stringify(courseList) }
      }
      return q
    })
    
    // 設定を取得
    const settings = await c.env.DB.prepare(`SELECT survey_thank_you_video_url, survey_logo_url FROM site_stats WHERE id = 'main'`).first()
    
    const surveySettings = {
      thank_you_video_url: (settings as any)?.survey_thank_you_video_url || '',
      logo_url: (settings as any)?.survey_logo_url || ''
    }
    
    return c.html(renderSurveyPage(processedQuestions, bookingId, courseName, surveySettings))
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
      use_for_review?: number
    }>()
    
    await c.env.DB.prepare(`
      INSERT INTO survey_questions (question_text, question_type, question_category, options, sort_order, is_required, is_active, use_for_review)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(
      body.question_text,
      body.question_type,
      body.question_category,
      body.options ? JSON.stringify(body.options) : null,
      body.sort_order,
      body.is_required,
      body.use_for_review || 0
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
      use_for_review?: number
    }>()
    
    await c.env.DB.prepare(`
      UPDATE survey_questions SET
        question_text = ?,
        question_type = ?,
        question_category = ?,
        options = ?,
        sort_order = ?,
        is_required = ?,
        use_for_review = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      body.question_text,
      body.question_type,
      body.question_category,
      body.options ? JSON.stringify(body.options) : null,
      body.sort_order,
      body.is_required,
      body.use_for_review || 0,
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

// アンケート回答を口コミとして公開するAPI
app.post('/admin/api/surveys/publish-reviews', async (c) => {
  try {
    const body = await c.req.json<{
      reviews: Array<{
        response_id: number
        reviewer_name: string
        rating: number
        course_name: string
        comment: string
      }>
    }>()
    
    if (!body.reviews || body.reviews.length === 0) {
      return c.json({ error: '公開するデータがありません' }, 400)
    }
    
    let successCount = 0
    
    for (const review of body.reviews) {
      // 回答の公開同意を確認
      const response = await c.env.DB.prepare(`
        SELECT * FROM survey_responses WHERE id = ? AND (publish_consent = 'yes' OR publish_consent = 'anonymous')
      `).bind(review.response_id).first()
      
      if (!response) continue
      
      // コメントがない場合はスキップ
      if (!review.comment || !review.comment.trim()) continue
      
      // 口コミを作成
      const result = await c.env.DB.prepare(`
        INSERT INTO reviews (course_id, reviewer_name, reviewer_email, rating, comment, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'approved', datetime('now'))
      `).bind(
        review.course_name || 'general',
        review.reviewer_name || '匿名',
        null, // メールアドレスは公開しない
        review.rating || 5,
        review.comment.trim()
      ).run()
      
      // survey_responsesを更新（公開済みフラグとreview_id）
      const reviewId = result.meta?.last_row_id
      await c.env.DB.prepare(`
        UPDATE survey_responses SET published_as_review = 1, review_id = ? WHERE id = ?
      `).bind(reviewId, review.response_id).run()
      
      successCount++
    }
    
    return c.json({ success: true, count: successCount })
  } catch (error) {
    console.error('Publish reviews error:', error)
    return c.json({ error: '口コミの公開に失敗しました' }, 500)
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

// ===== リマインドメール送信 =====

// リマインドメール送信API（Cron/手動実行用）
app.get('/api/cron/send-reminders', async (c) => {
  // セキュリティ: 特定のヘッダーまたはシークレットで保護
  const authHeader = c.req.header('X-Cron-Secret')
  const cronSecret = c.env.STRIPE_WEBHOOK_SECRET // 既存のシークレットを流用
  
  // 管理者セッションまたはCronシークレットで認証
  const sessionId = getCookie(c, 'admin_session')
  const isAdmin = sessionId && validateSessionToken(sessionId).valid
  const isCron = authHeader === cronSecret
  
  if (!isAdmin && !isCron) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  if (!c.env.RESEND_API_KEY) {
    return c.json({ error: 'RESEND_API_KEY not configured' }, 500)
  }
  
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }
  
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // 明日の日付
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    
    // 3日後の日付
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)
    const threeDaysStr = threeDaysLater.toISOString().split('T')[0]
    
    // 講座予約のリマインド（明日と3日後）
    const bookings = await c.env.DB.prepare(`
      SELECT b.*, c.online_url, s.start_time, s.end_time
      FROM bookings b
      LEFT JOIN courses c ON b.course_id = c.id
      LEFT JOIN schedules s ON b.course_id = s.course_id AND b.preferred_date = s.date
      WHERE b.payment_status = 'paid'
      AND b.status != 'cancelled'
      AND (b.preferred_date = ? OR b.preferred_date = ?)
    `).bind(tomorrowStr, threeDaysStr).all()
    
    for (const booking of (bookings.results || []) as any[]) {
      const daysUntil = booking.preferred_date === tomorrowStr ? 1 : 3
      const dateObj = new Date(booking.preferred_date)
      const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
      
      try {
        const result = await sendReminderEmail(c.env, {
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          courseName: booking.course_name,
          scheduleDate: dateStr,
          scheduleTime: booking.start_time && booking.end_time ? `${booking.start_time}〜${booking.end_time}` : booking.preferred_time || '',
          meetUrl: booking.online_url,
          daysUntil
        })
        
        if (result.success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`Booking ${booking.id}: ${result.error}`)
        }
      } catch (e) {
        results.failed++
        results.errors.push(`Booking ${booking.id}: ${String(e)}`)
      }
    }
    
    // ワークスペース予約のリマインド
    const workspaceBookings = await c.env.DB.prepare(`
      SELECT b.*, s.date, s.start_time, s.end_time, s.meet_url
      FROM workspace_bookings b
      JOIN workspace_schedules s ON b.workspace_schedule_id = s.id
      WHERE b.payment_status = 'paid'
      AND b.status != 'cancelled'
      AND (s.date = ? OR s.date = ?)
    `).bind(tomorrowStr, threeDaysStr).all()
    
    for (const booking of (workspaceBookings.results || []) as any[]) {
      const daysUntil = booking.date === tomorrowStr ? 1 : 3
      const dateObj = new Date(booking.date)
      const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
      
      try {
        const result = await sendReminderEmail(c.env, {
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          courseName: 'mirAIcafe ワークスペース',
          scheduleDate: dateStr,
          scheduleTime: `${booking.start_time}〜${booking.end_time}`,
          meetUrl: booking.meet_url,
          daysUntil
        })
        
        if (result.success) {
          results.sent++
        } else {
          results.failed++
          results.errors.push(`Workspace ${booking.id}: ${result.error}`)
        }
      } catch (e) {
        results.failed++
        results.errors.push(`Workspace ${booking.id}: ${String(e)}`)
      }
    }
    
    return c.json({
      success: true,
      message: `リマインドメール送信完了: ${results.sent}件成功, ${results.failed}件失敗`,
      ...results
    })
  } catch (error) {
    console.error('Reminder cron error:', error)
    return c.json({ error: 'リマインドメール送信処理でエラーが発生しました', detail: String(error) }, 500)
  }
})

// 管理画面からリマインドメール手動送信
app.post('/admin/api/send-reminder', async (c) => {
  const sessionId = getCookie(c, 'admin_session')
  if (!sessionId || !validateSessionToken(sessionId).valid) {
    return c.json({ error: '認証が必要です' }, 401)
  }
  
  if (!c.env.RESEND_API_KEY) {
    return c.json({ error: 'メール送信サービスが設定されていません' }, 500)
  }
  
  try {
    const { bookingId, type } = await c.req.json() // type: 'course' | 'workspace'
    
    if (type === 'workspace') {
      const booking = await c.env.DB.prepare(`
        SELECT b.*, s.date, s.start_time, s.end_time, s.meet_url
        FROM workspace_bookings b
        JOIN workspace_schedules s ON b.workspace_schedule_id = s.id
        WHERE b.id = ?
      `).bind(bookingId).first() as any
      
      if (!booking) {
        return c.json({ error: '予約が見つかりません' }, 404)
      }
      
      const dateObj = new Date(booking.date)
      const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
      const today = new Date()
      const diffDays = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      const result = await sendReminderEmail(c.env, {
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        courseName: 'mirAIcafe ワークスペース',
        scheduleDate: dateStr,
        scheduleTime: `${booking.start_time}〜${booking.end_time}`,
        meetUrl: booking.meet_url,
        daysUntil: diffDays
      })
      
      if (result.success) {
        return c.json({ success: true, message: 'リマインドメールを送信しました' })
      } else {
        return c.json({ error: result.error }, 500)
      }
    } else {
      const booking = await c.env.DB.prepare(`
        SELECT b.*, c.online_url, s.start_time, s.end_time
        FROM bookings b
        LEFT JOIN courses c ON b.course_id = c.id
        LEFT JOIN schedules s ON b.course_id = s.course_id AND b.preferred_date = s.date
        WHERE b.id = ?
      `).bind(bookingId).first() as any
      
      if (!booking) {
        return c.json({ error: '予約が見つかりません' }, 404)
      }
      
      const dateObj = new Date(booking.preferred_date)
      const dateStr = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
      const today = new Date()
      const diffDays = Math.ceil((dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      const result = await sendReminderEmail(c.env, {
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        courseName: booking.course_name,
        scheduleDate: dateStr,
        scheduleTime: booking.start_time && booking.end_time ? `${booking.start_time}〜${booking.end_time}` : booking.preferred_time || '',
        meetUrl: booking.online_url,
        daysUntil: diffDays
      })
      
      if (result.success) {
        return c.json({ success: true, message: 'リマインドメールを送信しました' })
      } else {
        return c.json({ error: result.error }, 500)
      }
    }
  } catch (error) {
    console.error('Send reminder error:', error)
    return c.json({ error: 'リマインドメール送信に失敗しました' }, 500)
  }
})

// 404 Not Found - キャッチオールルート
app.all('*', (c) => {
  return c.html(render404Page(), 404)
})

export default app
