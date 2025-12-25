// Googleカレンダー連携サービス（クライアントサイド用のヘルパー）

// カレンダーイベント用のデータ型
export interface CalendarEventData {
  title: string
  description: string
  startDateTime: string  // ISO 8601形式
  endDateTime: string    // ISO 8601形式
  location?: string
  meetingUrl?: string
}

// Googleカレンダー追加用URLを生成（Google Calendar公式のURL形式）
export function generateGoogleCalendarUrl(event: CalendarEventData): string {
  const formatDateTime = (dateTime: string) => {
    // ISO 8601形式の日時をGoogleカレンダー形式に変換（YYYYMMDDTHHmmssZ）
    return new Date(dateTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateTime(event.startDateTime)}/${formatDateTime(event.endDateTime)}`,
    details: event.description + (event.meetingUrl ? `\n\nオンラインURL: ${event.meetingUrl}` : ''),
    location: event.location || (event.meetingUrl ? 'オンライン' : ''),
    trp: 'false'  // 出欠確認を無効化
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// クライアントサイドでカレンダーに追加するボタン用のHTML生成
export function generateAddToCalendarButton(event: CalendarEventData, buttonText: string = 'Googleカレンダーに追加'): string {
  const googleUrl = generateGoogleCalendarUrl(event)
  
  return `
    <a href="${googleUrl}" target="_blank" rel="noopener noreferrer"
       class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z" fill="#fff" stroke="#4285F4" stroke-width="1.5"/>
        <path d="M16 2v4M8 2v4M3 10h18" stroke="#4285F4" stroke-width="1.5" stroke-linecap="round"/>
        <rect x="7" y="13" width="4" height="4" rx="0.5" fill="#34A853"/>
        <rect x="13" y="13" width="4" height="4" rx="0.5" fill="#EA4335"/>
      </svg>
      <span class="text-sm font-medium text-gray-700">${buttonText}</span>
    </a>
  `
}

// iCal形式のデータを生成（.icsファイル用）
export function generateICalData(event: CalendarEventData): string {
  const formatICalDate = (dateTime: string) => {
    return new Date(dateTime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@miraicafe`
  const now = formatICalDate(new Date().toISOString())
  
  let description = event.description.replace(/\n/g, '\\n')
  if (event.meetingUrl) {
    description += `\\n\\nオンラインURL: ${event.meetingUrl}`
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//mirAIcafe//Calendar//JP
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatICalDate(event.startDateTime)}
DTEND:${formatICalDate(event.endDateTime)}
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${event.location || (event.meetingUrl ? 'オンライン' : '')}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}

// 予約情報からカレンダーイベントデータを生成
export function createBookingCalendarEvent(booking: {
  courseName: string
  date: string
  startTime: string
  endTime: string
  customerName?: string
  meetingUrl?: string
}): CalendarEventData {
  // 日付と時刻を結合してISO形式に変換
  const startDateTime = `${booking.date}T${booking.startTime}:00+09:00`
  const endDateTime = `${booking.date}T${booking.endTime}:00+09:00`

  return {
    title: `【mirAIcafe】${booking.courseName}`,
    description: `mirAIcafe AI講座の予約です。\n\n講座名: ${booking.courseName}\n日時: ${booking.date} ${booking.startTime}〜${booking.endTime}${booking.customerName ? `\nお名前: ${booking.customerName}` : ''}`,
    startDateTime,
    endDateTime,
    meetingUrl: booking.meetingUrl
  }
}

// 講座情報からカレンダーイベントデータを生成（管理者用）
export function createCourseCalendarEvent(course: {
  title: string
  date: string
  startTime: string
  endTime: string
  description?: string
  meetingUrl?: string
  studentName?: string
}): CalendarEventData {
  const startDateTime = `${course.date}T${course.startTime}:00+09:00`
  const endDateTime = `${course.date}T${course.endTime}:00+09:00`

  let description = `AI講座\n\n講座名: ${course.title}\n日時: ${course.date} ${course.startTime}〜${course.endTime}`
  if (course.studentName) {
    description += `\n受講者: ${course.studentName}`
  }
  if (course.description) {
    description += `\n\n${course.description}`
  }

  return {
    title: `【講座】${course.title}${course.studentName ? ` - ${course.studentName}様` : ''}`,
    description,
    startDateTime,
    endDateTime,
    meetingUrl: course.meetingUrl
  }
}
