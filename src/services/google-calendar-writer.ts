// Google Calendar 書き込みサービス（Service Account認証）

export interface CalendarEventInput {
  summary: string
  description: string
  startDate: string  // YYYY-MM-DD
  startTime: string  // HH:MM
  duration: number   // minutes
  location?: string
  colorId?: string   // カレンダーの色 (1-11)
}

export interface CalendarEventResult {
  success: boolean
  eventId?: string
  htmlLink?: string
  error?: string
}

// Service Accountの認証情報からJWTを生成
async function createJWT(
  serviceAccountKey: { client_email: string; private_key: string },
  scopes: string[]
): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: serviceAccountKey.client_email,
    sub: serviceAccountKey.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600, // 1時間
    scope: scopes.join(' ')
  }

  const encoder = new TextEncoder()

  // Base64URL encode
  const base64UrlEncode = (data: string): string => {
    return btoa(data)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const message = `${headerB64}.${payloadB64}`

  // RSA署名（private_keyをPEM形式からCryptoKeyに変換）
  const pemContents = serviceAccountKey.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '')
    .replace(/\r/g, '')

  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(message)
  )

  const signatureB64 = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  )

  return `${message}.${signatureB64}`
}

// アクセストークンを取得
async function getAccessToken(serviceAccountKey: { client_email: string; private_key: string }): Promise<string> {
  const jwt = await createJWT(serviceAccountKey, [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ])

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Token request failed:', error)
    throw new Error(`Failed to get access token: ${response.status}`)
  }

  const data = await response.json() as { access_token: string }
  return data.access_token
}

/**
 * Google Calendarにイベントを作成
 */
export async function createCalendarEvent(
  serviceAccountKeyJson: string,
  calendarId: string,
  event: CalendarEventInput
): Promise<CalendarEventResult> {
  try {
    const serviceAccountKey = JSON.parse(serviceAccountKeyJson)
    const accessToken = await getAccessToken(serviceAccountKey)

    // 日時をRFC3339形式に変換（JST）
    const [year, month, day] = event.startDate.split('-').map(Number)
    const [hour, minute] = event.startTime.split(':').map(Number)

    const startDateTime = new Date(year, month - 1, day, hour, minute)
    const endDateTime = new Date(startDateTime.getTime() + event.duration * 60 * 1000)

    // RFC3339形式（タイムゾーン付き）
    const formatRFC3339 = (d: Date): string => {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const hh = String(d.getHours()).padStart(2, '0')
      const min = String(d.getMinutes()).padStart(2, '0')
      const ss = String(d.getSeconds()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}+09:00`
    }

    const eventBody = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: formatRFC3339(startDateTime),
        timeZone: 'Asia/Tokyo'
      },
      end: {
        dateTime: formatRFC3339(endDateTime),
        timeZone: 'Asia/Tokyo'
      },
      location: event.location || '',
      colorId: event.colorId || '5', // 黄色（仮予約を示す）
      // 仮予約として透明度を設定
      transparency: 'transparent', // 「予定あり」ではなく「空き時間」として表示
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },   // 1時間前
          { method: 'popup', minutes: 1440 }  // 1日前
        ]
      }
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventBody)
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Calendar API error:', error)
      return {
        success: false,
        error: `カレンダー登録に失敗しました: ${response.status}`
      }
    }

    const data = await response.json() as { id: string; htmlLink: string }
    console.log('Calendar event created:', data.id)

    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink
    }
  } catch (error: any) {
    console.error('createCalendarEvent error:', error)
    return {
      success: false,
      error: error.message || 'カレンダー登録中にエラーが発生しました'
    }
  }
}

/**
 * カレンダーイベントを更新（確定時に色を変更など）
 */
export async function updateCalendarEvent(
  serviceAccountKeyJson: string,
  calendarId: string,
  eventId: string,
  updates: Partial<{
    summary: string
    description: string
    colorId: string
    transparency: 'opaque' | 'transparent'
  }>
): Promise<CalendarEventResult> {
  try {
    const serviceAccountKey = JSON.parse(serviceAccountKeyJson)
    const accessToken = await getAccessToken(serviceAccountKey)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Calendar update error:', error)
      return {
        success: false,
        error: `カレンダー更新に失敗しました: ${response.status}`
      }
    }

    const data = await response.json() as { id: string; htmlLink: string }
    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink
    }
  } catch (error: any) {
    console.error('updateCalendarEvent error:', error)
    return {
      success: false,
      error: error.message || 'カレンダー更新中にエラーが発生しました'
    }
  }
}

/**
 * カレンダーイベントを削除
 */
export async function deleteCalendarEvent(
  serviceAccountKeyJson: string,
  calendarId: string,
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceAccountKey = JSON.parse(serviceAccountKeyJson)
    const accessToken = await getAccessToken(serviceAccountKey)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!response.ok && response.status !== 404) {
      const error = await response.text()
      console.error('Calendar delete error:', error)
      return {
        success: false,
        error: `カレンダー削除に失敗しました: ${response.status}`
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('deleteCalendarEvent error:', error)
    return {
      success: false,
      error: error.message || 'カレンダー削除中にエラーが発生しました'
    }
  }
}

/**
 * イベント確定時に仮予約を正式予約に変更
 */
export async function confirmCalendarEvent(
  serviceAccountKeyJson: string,
  calendarId: string,
  eventId: string,
  customerName: string
): Promise<CalendarEventResult> {
  return updateCalendarEvent(
    serviceAccountKeyJson,
    calendarId,
    eventId,
    {
      colorId: '10', // 緑色（確定済み）
      transparency: 'opaque', // 「予定あり」として表示
      summary: `【確定】${customerName}様 個別相談`
    }
  )
}

// ========== Calendar Read Functions (Service Account) ==========

interface CalendarEventRead {
  id: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  summary?: string
  status?: string
  transparency?: string
}

interface BusySlot {
  start: number
  end: number
  summary?: string
}

const BUSINESS_HOURS = {
  weekdays: { start: 10, end: 18 },  // 10:00-18:00
  saturday: { start: 10, end: 18 },  // 10:00-18:00
}

const BUFFER_MINUTES = 60

export async function getCalendarEventsWithServiceAccount(
  serviceAccountKeyJson: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEventRead[]> {
  const serviceAccountKey = JSON.parse(serviceAccountKeyJson)
  const accessToken = await getAccessToken(serviceAccountKey)

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calendarId) + '/events')
  url.searchParams.set('timeMin', timeMin.toISOString())
  url.searchParams.set('timeMax', timeMax.toISOString())
  url.searchParams.set('singleEvents', 'true')
  url.searchParams.set('orderBy', 'startTime')
  url.searchParams.set('maxResults', '500')

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Google Calendar API error:', error)
    throw new Error('Calendar fetch failed: ' + response.status)
  }

  const data = await response.json() as { items?: CalendarEventRead[] }
  console.log('Fetched ' + (data.items?.length || 0) + ' events (Service Account)')
  return data.items || []
}

function getBusySlotsFromEvents(events: CalendarEventRead[]): BusySlot[] {
  const slots: BusySlot[] = []

  for (const event of events) {
    if (event.status === 'cancelled') continue
    // すべての予定を予約不可として扱う（transparencyに関わらず）

    const startStr = event.start.dateTime || event.start.date
    const endStr = event.end.dateTime || event.end.date
    if (!startStr || !endStr) continue

    let startMs: number
    let endMs: number

    if (event.start.date && !event.start.dateTime) {
      const parts = event.start.date.split('-').map(Number)
      startMs = Date.UTC(parts[0], parts[1] - 1, parts[2], -9, 0, 0)
      const endParts = event.end.date.split('-').map(Number)
      endMs = Date.UTC(endParts[0], endParts[1] - 1, endParts[2], -9, 0, 0)
      console.log('All-day: ' + (event.summary || 'No title'))
    } else {
      startMs = new Date(startStr).getTime()
      endMs = new Date(endStr).getTime()
      console.log('Timed: ' + (event.summary || 'No title'))
    }

    const isAllDay = event.start.date && !event.start.dateTime
    const bufferedStart = isAllDay ? startMs : startMs - BUFFER_MINUTES * 60 * 1000
    const bufferedEnd = isAllDay ? endMs : endMs + BUFFER_MINUTES * 60 * 1000

    slots.push({ start: bufferedStart, end: bufferedEnd, summary: event.summary })
  }

  console.log('Total busy slots: ' + slots.length)
  return slots
}

function getTodayJSTForRead(): { year: number; month: number; day: number; dateStr: string } {
  const now = new Date()
  const jstTime = now.getTime() + 9 * 60 * 60 * 1000
  const jstDate = new Date(jstTime)
  const year = jstDate.getUTCFullYear()
  const month = jstDate.getUTCMonth() + 1
  const day = jstDate.getUTCDate()
  const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')
  return { year, month, day, dateStr }
}

function addDaysToDateForRead(dateStr: string, days: number): { year: number; month: number; day: number; dateStr: string } {
  const parts = dateStr.split('-').map(Number)
  const date = new Date(parts[0], parts[1] - 1, parts[2])
  date.setDate(date.getDate() + days)
  const newYear = date.getFullYear()
  const newMonth = date.getMonth() + 1
  const newDay = date.getDate()
  const newDateStr = newYear + '-' + String(newMonth).padStart(2, '0') + '-' + String(newDay).padStart(2, '0')
  return { year: newYear, month: newMonth, day: newDay, dateStr: newDateStr }
}

function getAvailableSlotsForDate(
  dateStr: string,
  busySlots: BusySlot[],
  duration: number
): { time: string; available: boolean }[] {
  const parts = dateStr.split('-').map(Number)
  const year = parts[0], month = parts[1], day = parts[2]
  const dayOfWeek = new Date(year, month - 1, day).getDay()
  const slots: { time: string; available: boolean }[] = []

  if (dayOfWeek === 0) return []

  const hours = dayOfWeek === 6 ? BUSINESS_HOURS.saturday : BUSINESS_HOURS.weekdays
  const today = getTodayJSTForRead()
  const isToday = dateStr === today.dateStr
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const currentHourJST = nowJST.getUTCHours()
  const currentMinuteJST = nowJST.getUTCMinutes()

  for (let hour = hours.start; hour < hours.end; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotEndHour = hour + Math.floor((minute + duration) / 60)
      const slotEndMinute = (minute + duration) % 60
      if (slotEndHour > hours.end || (slotEndHour === hours.end && slotEndMinute > 0)) continue
      if (isToday && (hour < currentHourJST || (hour === currentHourJST && minute <= currentMinuteJST))) continue

      const slotStartMs = Date.UTC(year, month - 1, day, hour - 9, minute, 0)
      const slotEndMs = slotStartMs + duration * 60 * 1000

      // イベント側にバッファが含まれているので、スロットがその範囲と重なるかチェック
      const isAvailable = !busySlots.some(busy => slotStartMs < busy.end && slotEndMs > busy.start)
      const timeStr = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0')
      slots.push({ time: timeStr, available: isAvailable })
    }
  }

  return slots
}

export async function getAvailableDatesWithServiceAccount(
  serviceAccountKeyJson: string,
  calendarId: string,
  days: number = 60,
  duration: number = 30
): Promise<{ date: string; dayOfWeek: number; hasSlots: boolean; slots: { time: string; available: boolean }[] }[]> {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + days)

  const events = await getCalendarEventsWithServiceAccount(serviceAccountKeyJson, calendarId, startDate, endDate)
  const busySlots = getBusySlotsFromEvents(events)

  const result: { date: string; dayOfWeek: number; hasSlots: boolean; slots: { time: string; available: boolean }[] }[] = []
  const today = getTodayJSTForRead()

  for (let i = 3; i < days; i++) { // 3日前までの予約制限（承認・決済の猶予）
    const targetDate = addDaysToDateForRead(today.dateStr, i)
    const dayOfWeek = new Date(targetDate.year, targetDate.month - 1, targetDate.day).getDay()

    if (dayOfWeek === 0) continue

    const slots = getAvailableSlotsForDate(targetDate.dateStr, busySlots, duration)
    const availableSlots = slots.filter(s => s.available)

    result.push({ date: targetDate.dateStr, dayOfWeek, hasSlots: availableSlots.length > 0, slots })
  }

  return result
}
