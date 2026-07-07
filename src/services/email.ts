// Email notification service using Resend API
// Resend: https://resend.com/

// 管理者メールアドレス（通知先）
// 環境変数 ADMIN_NOTIFICATION_EMAIL で上書き可能。未設定時は運営者のGmailに送信する
// ※ ADMIN_EMAIL は管理画面ログイン用に使われているため別名にしている
const DEFAULT_ADMIN_EMAIL = 'hatarakusutairu@gmail.com'
const FROM_EMAIL = 'mirAIcafe <noreply@miraicafe.work>'  // Resendで認証済みドメイン

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export interface Env {
  RESEND_API_KEY?: string
  ADMIN_NOTIFICATION_EMAIL?: string
}

// 管理者通知の宛先を取得（全メールで共通利用する）
export function getAdminEmail(env: Env): string {
  return env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL
}

// Resend APIを使用してメール送信
async function sendEmail(env: Env, options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = env.RESEND_API_KEY
  
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not configured. Email not sent.')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Resend API error:', errorData)
      return { success: false, error: `Failed to send email: ${response.status}` }
    }

    const result = await response.json()
    console.log('Email sent successfully:', result)
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: String(error) }
  }
}

// ======================
// お問い合わせ通知
// ======================

interface ContactData {
  name: string
  email: string
  phone?: string
  type: string
  subject: string
  message: string
}

// 管理者へのお問い合わせ通知メール
export async function sendContactNotificationToAdmin(env: Env, contact: ContactData): Promise<{ success: boolean; error?: string }> {
  const subject = `[mirAIcafe] 新しいお問い合わせ: ${contact.subject}`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .field-value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef; }
    .message-box { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #3B82F6; margin-top: 15px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">📩 新しいお問い合わせがありました</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">お名前</div>
        <div class="field-value">${escapeHtml(contact.name)} 様</div>
      </div>
      <div class="field">
        <div class="field-label">メールアドレス</div>
        <div class="field-value"><a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></div>
      </div>
      ${contact.phone ? `
      <div class="field">
        <div class="field-label">電話番号</div>
        <div class="field-value">${escapeHtml(contact.phone)}</div>
      </div>
      ` : ''}
      <div class="field">
        <div class="field-label">お問い合わせ種別</div>
        <div class="field-value">${escapeHtml(contact.type)}</div>
      </div>
      <div class="field">
        <div class="field-label">件名</div>
        <div class="field-value">${escapeHtml(contact.subject)}</div>
      </div>
      <div class="message-box">
        <div class="field-label">お問い合わせ内容</div>
        <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${escapeHtml(contact.message)}</p>
      </div>
      <div style="text-align: center;">
        <a href="https://miraicafe.work/admin/contacts" class="button">管理画面で確認する →</a>
      </div>
    </div>
    <div class="footer">
      <p>このメールはmirAIcafeのお問い合わせフォームから自動送信されています。</p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: getAdminEmail(env),
    subject,
    html,
    replyTo: contact.email
  })
}

// ======================
// 予約通知
// ======================

interface ReservationData {
  name: string
  email: string
  phone?: string
  courseName: string
  courseId: string
  scheduleDate: string
  scheduleTime: string
  location: string
  price: number
  reservationId: string
}

// 管理者への予約通知メール
export async function sendReservationNotificationToAdmin(env: Env, reservation: ReservationData): Promise<{ success: boolean; error?: string }> {
  const subject = `[mirAIcafe] 新しい予約: ${reservation.courseName}`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .field-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .field-value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef; }
    .highlight { background: #EFF6FF; border-color: #3B82F6; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">📅 新しい予約が入りました</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">講座名</div>
        <div class="field-value highlight">${escapeHtml(reservation.courseName)}</div>
      </div>
      <div class="field">
        <div class="field-label">開催日時</div>
        <div class="field-value">${escapeHtml(reservation.scheduleDate)} ${escapeHtml(reservation.scheduleTime)}</div>
      </div>
      <div class="field">
        <div class="field-label">開催場所</div>
        <div class="field-value">${escapeHtml(reservation.location)}</div>
      </div>
      <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
      <div class="field">
        <div class="field-label">予約者名</div>
        <div class="field-value">${escapeHtml(reservation.name)} 様</div>
      </div>
      <div class="field">
        <div class="field-label">メールアドレス</div>
        <div class="field-value"><a href="mailto:${escapeHtml(reservation.email)}">${escapeHtml(reservation.email)}</a></div>
      </div>
      ${reservation.phone ? `
      <div class="field">
        <div class="field-label">電話番号</div>
        <div class="field-value">${escapeHtml(reservation.phone)}</div>
      </div>
      ` : ''}
      <div class="field">
        <div class="field-label">予約ID</div>
        <div class="field-value" style="font-family: monospace;">${escapeHtml(reservation.reservationId)}</div>
      </div>
      <div class="field">
        <div class="field-label">料金</div>
        <div class="field-value">¥${reservation.price.toLocaleString()}</div>
      </div>
    </div>
    <div class="footer">
      <p>このメールはmirAIcafeの予約システムから自動送信されています。</p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: getAdminEmail(env),
    subject,
    html,
    replyTo: reservation.email
  })
}

// 予約者への確認メール
export async function sendReservationConfirmationToCustomer(env: Env, reservation: ReservationData): Promise<{ success: boolean; error?: string }> {
  const subject = `【mirAIcafe】ご予約ありがとうございます - ${reservation.courseName}`
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 30px 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e9ecef; border-top: none; }
    .info-box { background: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
    .field { margin-bottom: 12px; display: flex; }
    .field-label { font-weight: bold; color: #666; width: 120px; flex-shrink: 0; }
    .field-value { color: #333; }
    .notice { background: #FEF3C7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #F59E0B; }
    .footer { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0 0 10px 0; font-size: 24px;">🎉 ご予約ありがとうございます</h1>
      <p style="margin: 0; opacity: 0.9;">mirAIcafe AI学習講座</p>
    </div>
    <div class="content">
      <p>${escapeHtml(reservation.name)} 様</p>
      <p>この度は、mirAIcafeの講座をご予約いただきありがとうございます。<br>以下の内容でご予約を承りました。</p>
      
      <div class="info-box">
        <h3 style="margin: 0 0 15px 0; color: #3B82F6;">📚 ご予約内容</h3>
        <div class="field">
          <div class="field-label">講座名</div>
          <div class="field-value"><strong>${escapeHtml(reservation.courseName)}</strong></div>
        </div>
        <div class="field">
          <div class="field-label">開催日時</div>
          <div class="field-value">${escapeHtml(reservation.scheduleDate)} ${escapeHtml(reservation.scheduleTime)}</div>
        </div>
        <div class="field">
          <div class="field-label">開催場所</div>
          <div class="field-value">${escapeHtml(reservation.location)}</div>
        </div>
        <div class="field">
          <div class="field-label">料金</div>
          <div class="field-value">¥${reservation.price.toLocaleString()}（税込）</div>
        </div>
        <div class="field">
          <div class="field-label">予約番号</div>
          <div class="field-value" style="font-family: monospace;">${escapeHtml(reservation.reservationId)}</div>
        </div>
      </div>

      <div class="notice">
        <strong>⚠️ ご注意</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>開始10分前までにご参加ください</li>
          <li>キャンセルは開催3日前までにご連絡ください</li>
          <li>オンライン開催の場合、Zoomリンクを後日お送りします</li>
        </ul>
      </div>

      <p style="margin-top: 20px;">ご不明な点がございましたら、お気軽にお問い合わせください。<br>当日お会いできることを楽しみにしております！</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://miraicafe.work/courses/${escapeHtml(reservation.courseId)}" class="button">講座詳細を確認 →</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>mirAIcafe</strong> - カフェで学ぶAI</p>
      <p style="margin: 0;">〒XXX-XXXX 東京都○○区○○ X-X-X</p>
      <p style="margin: 5px 0 0 0;">📧 ai.career@miraicafe.work</p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: reservation.email,
    subject,
    html
  })
}

// ======================
// 口コミ通知
// ======================

interface ReviewData {
  courseId: string
  courseName: string
  reviewerName: string
  reviewerEmail: string
  rating: number
  comment: string
}

// 管理者への口コミ通知メール
export async function sendReviewNotificationToAdmin(env: Env, review: ReviewData): Promise<{ success: boolean; error?: string }> {
  const subject = `[mirAIcafe] 新しい口コミが投稿されました（承認待ち）`
  
  // 星評価を生成
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px; }
    .review-box { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; margin: 15px 0; }
    .stars { color: #F59E0B; font-size: 24px; letter-spacing: 2px; }
    .field { margin-bottom: 12px; }
    .field-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #999; }
    .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; }
    .button-secondary { background: #6B7280; }
    .pending-badge { display: inline-block; background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">⭐ 新しい口コミが投稿されました</h1>
      <span class="pending-badge" style="margin-top: 10px;">承認待ち</span>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">対象講座</div>
        <div style="font-size: 16px; font-weight: bold;">${escapeHtml(review.courseName)}</div>
      </div>
      
      <div class="review-box">
        <div class="stars">${stars}</div>
        <p style="font-size: 14px; color: #666; margin: 5px 0 15px 0;">${review.rating}/5 点</p>
        
        <div class="field">
          <div class="field-label">投稿者</div>
          <div>${escapeHtml(review.reviewerName)} 様</div>
        </div>
        <div class="field">
          <div class="field-label">メール</div>
          <div><a href="mailto:${escapeHtml(review.reviewerEmail)}">${escapeHtml(review.reviewerEmail)}</a></div>
        </div>
        <div class="field">
          <div class="field-label">コメント</div>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(review.comment)}</div>
        </div>
      </div>
      
      <div style="text-align: center;">
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">管理画面で承認または却下してください</p>
        <a href="https://miraicafe.work/admin/reviews?tab=pending" class="button">口コミを確認する →</a>
      </div>
    </div>
    <div class="footer">
      <p>このメールはmirAIcafeの口コミシステムから自動送信されています。</p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: getAdminEmail(env),
    subject,
    html
  })
}

// HTMLエスケープ関数
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char)
}

// ======================
// 予約完了メール（顧客向け）
// ======================

export interface BookingConfirmationData {
  customerName: string
  customerEmail: string
  courseName: string
  scheduleDate?: string
  scheduleTime?: string
  amount: number
  bookingId: string | number
  isSeriesBooking?: boolean
  seriesSchedules?: Array<{
    courseTitle: string
    date: string
    startTime: string
    endTime: string
  }>
  meetUrl?: string
  receiptUrl?: string
}

export async function sendBookingConfirmationEmail(
  env: Env,
  data: BookingConfirmationData
): Promise<{ success: boolean; error?: string }> {
  
  let scheduleHtml = ''
  if (data.isSeriesBooking && data.seriesSchedules && data.seriesSchedules.length > 0) {
    scheduleHtml = `
      <h3 style="color: #92400e; margin-top: 20px;">📅 講座スケジュール</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
        <tr style="background: #fef3c7;">
          <th style="padding: 10px; text-align: left; border: 1px solid #fcd34d;">講座名</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #fcd34d;">日程</th>
          <th style="padding: 10px; text-align: left; border: 1px solid #fcd34d;">時間</th>
        </tr>
        ${data.seriesSchedules.map(s => `
          <tr>
            <td style="padding: 10px; border: 1px solid #fcd34d;">${escapeHtml(s.courseTitle)}</td>
            <td style="padding: 10px; border: 1px solid #fcd34d;">${escapeHtml(s.date)}</td>
            <td style="padding: 10px; border: 1px solid #fcd34d;">${escapeHtml(s.startTime)}〜${escapeHtml(s.endTime)}</td>
          </tr>
        `).join('')}
      </table>
    `
  } else if (data.scheduleDate) {
    scheduleHtml = `<p><strong>日程:</strong> ${escapeHtml(data.scheduleDate)} ${escapeHtml(data.scheduleTime || '')}</p>`
  }

  const meetUrlSection = data.meetUrl 
    ? `<div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #065f46;"><strong>🎥 参加URL:</strong></p>
        <a href="${escapeHtml(data.meetUrl)}" style="color: #059669; word-break: break-all;">${escapeHtml(data.meetUrl)}</a>
      </div>`
    : `<p style="color: #6b7280; font-size: 14px; margin-top: 20px;">※参加URLは開催日までにメールでお送りします</p>`

  const receiptSection = data.receiptUrl 
    ? `<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p><strong>📄 領収書:</strong></p>
        <a href="${escapeHtml(data.receiptUrl)}" style="color: #3b82f6;">領収書をダウンロード</a>
      </div>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">☕ mirAIcafe</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">ご予約ありがとうございます</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <p>${escapeHtml(data.customerName)} 様</p>
    
    <p>この度はmirAIcafeの講座にお申し込みいただき、誠にありがとうございます。<br>以下の内容でご予約を承りました。</p>
    
    <div style="background: #fffbeb; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">📚 予約内容</h2>
      <p style="margin: 5px 0;"><strong>講座名:</strong> ${escapeHtml(data.courseName)}</p>
      ${scheduleHtml}
      <p style="margin: 15px 0 5px 0;"><strong>お支払い金額:</strong> ¥${data.amount.toLocaleString()}</p>
      <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">予約ID: ${data.bookingId}</p>
    </div>
    
    ${meetUrlSection}
    ${receiptSection}
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 14px; color: #6b7280;">
        ご不明な点がございましたら、お気軽にお問い合わせください。<br>当日お会いできることを楽しみにしております！
      </p>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>mirAIcafe - AIと学ぶ、新しい学びのカタチ</p>
      <p><a href="https://miraicafe.work" style="color: #f59e0b;">https://miraicafe.work</a></p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: data.customerEmail,
    subject: `【mirAIcafe】ご予約完了のお知らせ - ${data.courseName}`,
    html
  })
}

// ======================
// ワークスペース予約完了メール
// ======================

export interface WorkspaceConfirmationData {
  customerName: string
  customerEmail: string
  scheduleDate: string
  scheduleTime: string
  amount: number
  bookingId: number
  meetUrl?: string
}

export async function sendWorkspaceConfirmationEmail(
  env: Env,
  data: WorkspaceConfirmationData
): Promise<{ success: boolean; error?: string }> {

  const meetUrlSection = data.meetUrl 
    ? `<div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #065f46;"><strong>🎥 参加URL:</strong></p>
        <a href="${escapeHtml(data.meetUrl)}" style="color: #059669; word-break: break-all;">${escapeHtml(data.meetUrl)}</a>
      </div>`
    : `<p style="color: #6b7280; font-size: 14px; margin-top: 20px;">※参加URLは開催日までにメールでお送りします</p>`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">☕ mirAIcafe ワークスペース</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">ご予約ありがとうございます</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <p>${escapeHtml(data.customerName)} 様</p>
    
    <p>mirAIcafe ワークスペースへのご予約ありがとうございます！<br>みんなでAIツールを触る時間を楽しみましょう☕</p>
    
    <div style="background: #fffbeb; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px;">☕ ワークスペース予約内容</h2>
      <p style="margin: 5px 0;"><strong>日程:</strong> ${escapeHtml(data.scheduleDate)}</p>
      <p style="margin: 5px 0;"><strong>時間:</strong> ${escapeHtml(data.scheduleTime)}</p>
      <p style="margin: 15px 0 5px 0;"><strong>お支払い金額:</strong> ¥${data.amount.toLocaleString()}</p>
    </div>
    
    ${meetUrlSection}
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 14px; color: #6b7280;">
        当日は気軽にAIについて質問してくださいね！<br>お会いできることを楽しみにしております☕
      </p>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>mirAIcafe - AIと学ぶ、新しい学びのカタチ</p>
      <p><a href="https://miraicafe.work" style="color: #f59e0b;">https://miraicafe.work</a></p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: data.customerEmail,
    subject: `【mirAIcafe】ワークスペースご予約完了 - ${data.scheduleDate}`,
    html
  })
}

// ======================
// リマインドメール
// ======================

export interface ReminderData {
  customerName: string
  customerEmail: string
  courseName: string
  scheduleDate: string
  scheduleTime: string
  meetUrl?: string
  daysUntil: number
}

export async function sendReminderEmail(
  env: Env,
  data: ReminderData
): Promise<{ success: boolean; error?: string }> {

  const daysText = data.daysUntil === 0 ? '本日' : 
                   data.daysUntil === 1 ? '明日' : 
                   `${data.daysUntil}日後`

  const meetUrlSection = data.meetUrl 
    ? `<div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0; color: #065f46;"><strong>🎥 参加URL:</strong></p>
        <a href="${escapeHtml(data.meetUrl)}" style="color: #059669; word-break: break-all;">${escapeHtml(data.meetUrl)}</a>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">※開始5分前からお入りいただけます</p>
      </div>`
    : ''

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔔 リマインド</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${daysText}の講座のお知らせ</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
    <p>${escapeHtml(data.customerName)} 様</p>
    
    <p>ご予約いただいた講座が<strong>${daysText}</strong>に開催されます。<br>お忘れなくご参加ください！</p>
    
    <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">📚 講座情報</h2>
      <p style="margin: 5px 0;"><strong>講座名:</strong> ${escapeHtml(data.courseName)}</p>
      <p style="margin: 5px 0;"><strong>日程:</strong> ${escapeHtml(data.scheduleDate)}</p>
      <p style="margin: 5px 0;"><strong>時間:</strong> ${escapeHtml(data.scheduleTime)}</p>
    </div>
    
    ${meetUrlSection}
    
    <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
      <p>mirAIcafe - AIと学ぶ、新しい学びのカタチ</p>
      <p><a href="https://miraicafe.work" style="color: #f59e0b;">https://miraicafe.work</a></p>
    </div>
  </div>
</body>
</html>
  `

  return sendEmail(env, {
    to: data.customerEmail,
    subject: `【mirAIcafe】${daysText}の講座リマインド - ${data.courseName}`,
    html
  })
}

// 後方互換のためのエクスポート（新規コードでは getAdminEmail(env) を使用すること）
export { DEFAULT_ADMIN_EMAIL as ADMIN_EMAIL }
