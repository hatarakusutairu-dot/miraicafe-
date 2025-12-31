// Google Calendar integration service

export interface CalendarEvent {
  title: string
  description: string
  startDate: string  // YYYY-MM-DD
  startTime: string  // HH:MM
  endTime: string    // HH:MM
  location?: string  // オンラインURL or 会場
  timezone?: string
}

/**
 * Generate Google Calendar event URL (no auth required)
 * Opens Google Calendar with pre-filled event details
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const timezone = event.timezone || 'Asia/Tokyo'
  
  // Format dates for Google Calendar
  // Format: YYYYMMDDTHHMMSS
  const startDateTime = formatDateTimeForGoogle(event.startDate, event.startTime)
  const endDateTime = formatDateTimeForGoogle(event.startDate, event.endTime)
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    details: event.description,
    location: event.location || '',
    ctz: timezone,
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate iCal (.ics) file content
 * Works with Apple Calendar, Outlook, etc.
 */
export function generateICalContent(event: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).substring(7)}@miraicafe.work`
  const now = formatDateTimeForICal(new Date())
  const startDateTime = formatDateTimeForICal(new Date(`${event.startDate}T${event.startTime}:00`))
  const endDateTime = formatDateTimeForICal(new Date(`${event.startDate}T${event.endTime}:00`))
  
  const description = event.description.replace(/\n/g, '\\n')
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//mirAIcafe//Course Booking//JP
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART;TZID=Asia/Tokyo:${startDateTime}
DTEND;TZID=Asia/Tokyo:${endDateTime}
SUMMARY:${event.title}
DESCRIPTION:${description}
LOCATION:${event.location || ''}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}

/**
 * Generate Yahoo Calendar URL
 */
export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const startDateTime = `${event.startDate.replace(/-/g, '')}T${event.startTime.replace(':', '')}00`
  
  // Calculate duration in hours and minutes
  const [startH, startM] = event.startTime.split(':').map(Number)
  const [endH, endM] = event.endTime.split(':').map(Number)
  const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  const durationHours = Math.floor(durationMinutes / 60)
  const durationMins = durationMinutes % 60
  const duration = `${String(durationHours).padStart(2, '0')}${String(durationMins).padStart(2, '0')}`
  
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: startDateTime,
    dur: duration,
    desc: event.description,
    in_loc: event.location || '',
  })
  
  return `https://calendar.yahoo.co.jp/?${params.toString()}`
}

/**
 * Generate Outlook.com Calendar URL
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const startDateTime = `${event.startDate}T${event.startTime}:00`
  const endDateTime = `${event.startDate}T${event.endTime}:00`
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startDateTime,
    enddt: endDateTime,
    body: event.description,
    location: event.location || '',
  })
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

// Helper functions
function formatDateTimeForGoogle(date: string, time: string): string {
  // Input: 2025-01-15, 10:00
  // Output: 20250115T100000
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00`
}

function formatDateTimeForICal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Generate calendar description with online meeting URL
 */
export function generateEventDescription(params: {
  courseName: string
  instructorName?: string
  onlineUrl?: string
  notes?: string
}): string {
  let description = `【講座名】${params.courseName}\n`
  
  if (params.instructorName) {
    description += `【講師】${params.instructorName}\n`
  }
  
  if (params.onlineUrl) {
    description += `\n【オンライン参加URL】\n${params.onlineUrl}\n`
  }
  
  description += `\n【主催】mirAIcafe\n`
  description += `https://miraicafe.work\n`
  
  if (params.notes) {
    description += `\n【備考】\n${params.notes}\n`
  }
  
  return description
}

/**
 * Generate all calendar links for an event
 */
export function generateAllCalendarLinks(event: CalendarEvent): {
  google: string
  yahoo: string
  outlook: string
  ical: string
} {
  return {
    google: generateGoogleCalendarUrl(event),
    yahoo: generateYahooCalendarUrl(event),
    outlook: generateOutlookCalendarUrl(event),
    ical: `data:text/calendar;charset=utf-8,${encodeURIComponent(generateICalContent(event))}`,
  }
}
