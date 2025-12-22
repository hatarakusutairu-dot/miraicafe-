import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-pages'

// Pages
import { renderHomePage } from './pages/home'
import { renderCoursesPage, renderCourseDetailPage } from './pages/courses'
import { renderReservationPage } from './pages/reservation'
import { renderBlogPage, renderBlogPostPage } from './pages/blog'
import { renderContactPage } from './pages/contact'

// Data
import { courses, blogPosts, schedules } from './data'

const app = new Hono()

// CORS for API
app.use('/api/*', cors())

// Static files
app.use('/static/*', serveStatic({ root: './public' }))

// ===== Pages =====

// Home
app.get('/', (c) => {
  return c.html(renderHomePage(courses.slice(0, 3), blogPosts.slice(0, 3)))
})

// Courses
app.get('/courses', (c) => {
  return c.html(renderCoursesPage(courses))
})

app.get('/courses/:id', (c) => {
  const id = c.req.param('id')
  const course = courses.find(c => c.id === id)
  if (!course) return c.notFound()
  return c.html(renderCourseDetailPage(course))
})

// Reservation
app.get('/reservation', (c) => {
  const courseId = c.req.query('course')
  const course = courseId ? courses.find(c => c.id === courseId) : null
  return c.html(renderReservationPage(courses, schedules, course))
})

// Blog
app.get('/blog', (c) => {
  return c.html(renderBlogPage(blogPosts))
})

app.get('/blog/:id', (c) => {
  const id = c.req.param('id')
  const post = blogPosts.find(p => p.id === id)
  if (!post) return c.notFound()
  return c.html(renderBlogPostPage(post))
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

// Contact form submission
app.post('/api/contact', async (c) => {
  const body = await c.req.json()
  const { name, email, subject, message } = body
  
  if (!name || !email || !message) {
    return c.json({ error: 'Missing required fields' }, 400)
  }
  
  // In production, this would send an email
  return c.json({ success: true, message: 'お問い合わせを受け付けました' })
})

// Blog posts API
app.get('/api/blog', (c) => {
  return c.json(blogPosts)
})

export default app
