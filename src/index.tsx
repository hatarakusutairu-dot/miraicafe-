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

// Admin Pages
import { renderAdminLayout, renderLoginPage } from './admin/layout'
import { renderDashboard } from './admin/dashboard'
import { renderBlogList, renderBlogForm } from './admin/blog'
import { renderCoursesList, renderCourseForm } from './admin/courses'
import { renderReviewsList } from './admin/reviews'
import { renderContactsList, renderContactDetail } from './admin/contacts'
import { renderSEODashboard, renderSEOEditForm } from './admin/seo'
import { renderBookingsList, renderBookingDetail, type Booking } from './admin/bookings'

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

// Data
import { courses, blogPosts, schedules } from './data'

// Types
type Bindings = {
  DB: D1Database
  R2_BUCKET: R2Bucket
  RESEND_API_KEY?: string
  GEMINI_API_KEY?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS for API
app.use('/api/*', cors())
app.use('/admin/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== Pages =====

// Home（DBと静的データをマージ）
app.get('/', async (c) => {
  const allCourses = await getAllCoursesForFront(c.env.DB)
  const allPosts = await getAllBlogPosts(c.env.DB)
  return c.html(renderHomePage(allCourses.slice(0, 3), allPosts.slice(0, 3)))
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
  return c.html(renderBlogPostPage(post, allPosts))
})

// Contact
app.get('/contact', (c) => {
  return c.html(renderContactPage())
})

// ===== API Endpoints =====

// Get courses
app.get('/api/courses', (c) => {
  return c.json(courses)
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
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM reviews
    `).first()
    
    const contactsResult = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new
      FROM contacts
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
    
    const stats = {
      courses: courses.length,
      blogs: blogPosts.length,
      reviews: {
        total: (reviewsResult as any)?.total || 0,
        pending: (reviewsResult as any)?.pending || 0
      },
      contacts: {
        total: (contactsResult as any)?.total || 0,
        new: (contactsResult as any)?.new || 0
      }
    }
    
    const recent = {
      contacts: recentContacts.results as any[],
      reviews: pendingReviews.results as any[]
    }
    
    return c.html(renderDashboard(stats, recent))
  } catch (error) {
    console.error('Dashboard error:', error)
    // データベースエラー時はデフォルト値で表示
    const stats = {
      courses: courses.length,
      blogs: blogPosts.length,
      reviews: { total: 0, pending: 0 },
      contacts: { total: 0, new: 0 }
    }
    const recent = { contacts: [], reviews: [] }
    return c.html(renderDashboard(stats, recent))
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
             max_capacity, cancellation_policy, status
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
      status: course.status
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
             max_capacity, cancellation_policy, status
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
        status: (course as any).status
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
    
    return c.redirect('/admin/courses')
  } catch (error) {
    console.error('Error updating course:', error)
    const course = await getCourseById(c.env.DB, id)
    return c.html(renderCourseForm(course, '講座の更新に失敗しました。もう一度お試しください。'))
  }
})

// 講座削除
app.post('/admin/courses/delete/:id', async (c) => {
  const id = c.req.param('id')
  try {
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
    await c.env.DB.prepare(`
      UPDATE contacts SET status = ? WHERE id = ?
    `).bind(status, id).run()
  } catch (error) {
    console.error('Update status error:', error)
  }
  
  return c.redirect(`/admin/contacts/${id}`)
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
    
    const prompt = `あなたはSEO専門家です。以下の${type === 'blog' ? 'ブログ記事' : '講座'}のタイトルと内容を分析し、SEOを改善する提案をしてください。

【現在のタイトル】
${title || '未設定'}

【内容の一部】
${(content || '').substring(0, 500)}...

【出力形式】※必ずこの形式で
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
• [ポイント3]`

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
    const pointsMatch = generatedText.match(/## 改善ポイント\n([\s\S]+?)(?=\n##|\n\n|$)/)
    
    return c.json({
      suggested_titles: titleMatch ? [titleMatch[1], titleMatch[2], titleMatch[3]] : [],
      meta_description: metaMatch ? metaMatch[1] : '',
      keywords: keywordsMatch ? keywordsMatch[1].split(',').map((k: string) => k.trim()) : [],
      improvement_points: pointsMatch ? 
        pointsMatch[1].split('\n').filter((p: string) => p.trim().startsWith('•')).map((p: string) => p.replace('•', '').trim()) 
        : [],
      raw_response: generatedText
    })
  } catch (error) {
    console.error('SEO suggest error:', error)
    return c.json({ error: 'AI提案の取得に失敗しました' }, 500)
  }
})

export default app
