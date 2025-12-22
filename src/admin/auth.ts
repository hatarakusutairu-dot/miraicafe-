// 管理画面認証機能
import { Context } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { renderLoginPage } from './layout'

// セッションの有効期限（24時間）
const SESSION_DURATION = 24 * 60 * 60 * 1000

// 簡易的なセッション管理（本番環境ではKVストアを使用推奨）
const sessions = new Map<string, { email: string; expiresAt: number }>()

// ランダムなセッションID生成
function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// セッションの検証
export function validateSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false
  
  const session = sessions.get(sessionId)
  if (!session) return false
  
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId)
    return false
  }
  
  return true
}

// セッションの作成
export function createSession(email: string): string {
  const sessionId = generateSessionId()
  sessions.set(sessionId, {
    email,
    expiresAt: Date.now() + SESSION_DURATION
  })
  return sessionId
}

// セッションの削除
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

// 認証ミドルウェア
export async function authMiddleware(c: Context, next: () => Promise<void>) {
  const path = new URL(c.req.url).pathname
  
  // ログインページは認証不要
  if (path === '/admin/login') {
    return next()
  }
  
  const sessionId = getCookie(c, 'admin_session')
  
  if (!validateSession(sessionId)) {
    // 未認証の場合はログインページへリダイレクト
    return c.redirect('/admin/login')
  }
  
  return next()
}

// ログイン処理
export async function handleLogin(c: Context): Promise<Response> {
  const body = await c.req.parseBody()
  const email = body.email as string
  const password = body.password as string
  
  // 環境変数から認証情報を取得（デフォルト値あり）
  const adminEmail = (c.env as any)?.ADMIN_EMAIL || 'ai.career@miraicafe.work'
  const adminPassword = (c.env as any)?.ADMIN_PASSWORD || 'admin123'
  
  // 認証チェック
  if (email === adminEmail && password === adminPassword) {
    const sessionId = createSession(email)
    
    // セッションクッキーを設定
    setCookie(c, 'admin_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/admin',
      maxAge: SESSION_DURATION / 1000
    })
    
    return c.redirect('/admin')
  }
  
  // 認証失敗
  return c.html(renderLoginPage('メールアドレスまたはパスワードが違います'))
}

// ログアウト処理
export async function handleLogout(c: Context): Promise<Response> {
  const sessionId = getCookie(c, 'admin_session')
  
  if (sessionId) {
    deleteSession(sessionId)
    deleteCookie(c, 'admin_session', { path: '/admin' })
  }
  
  return c.redirect('/admin/login')
}
