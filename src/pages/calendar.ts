// カレンダー追加専用ページ（決済完了者のみ）
import { renderLayout } from '../components/layout'

// HTMLエスケープ
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface ScheduleItem {
  session_number: number
  course_title: string
  date: string
  start_time: string
  end_time: string
  online_url?: string
}

interface CalendarPageData {
  success: boolean
  bookingId: string
  isSeriesBooking: boolean
  customerName: string
  courseName: string
  seriesTitle?: string
  termName?: string
  schedules: ScheduleItem[]
  error?: string
}

const generateGoogleCalendarUrl = (
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  onlineUrl?: string,
  description?: string
) => {
  // 日本時間でそのまま使用（UTCに変換しない）
  // 例: date='2026-01-20', startTime='10:00' → '20260120T100000'
  const formatDateTime = (dateStr: string, timeStr: string) => {
    // 日付: 2026-01-20 → 20260120
    const datePart = dateStr.replace(/-/g, '')
    // 時間: 10:00 → 100000
    const timePart = timeStr.replace(/:/g, '') + '00'
    return datePart + 'T' + timePart
  }
  
  const startDateTime = formatDateTime(date, startTime)
  // endTimeがない場合は開始から2時間後
  let endDateTime: string
  if (endTime) {
    endDateTime = formatDateTime(date, endTime)
  } else {
    // startTimeから2時間後を計算
    const [startHour, startMin] = startTime.split(':').map(Number)
    const endHour = (startHour + 2) % 24
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`
    endDateTime = formatDateTime(date, endTimeStr)
  }
  
  const details = description || ''
  const location = onlineUrl || 'Google Meet（オンライン）'
  
  // タイムゾーンを日本時間（Asia/Tokyo）に指定
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&ctz=Asia/Tokyo&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
}

export const renderCalendarPage = (data: CalendarPageData) => {
  const content = data.success ? `
    <!-- Calendar Add Page -->
    <section class="relative min-h-screen py-12 px-4">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"></div>
      
      <div class="relative max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-calendar-plus text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-800 mb-2">カレンダーに追加</h1>
          <p class="text-gray-600">
            ${escapeHtml(data.customerName)} 様の予約講座
          </p>
        </div>
        
        <!-- Course Info -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 class="font-bold text-lg text-gray-800 mb-2">
            ${data.isSeriesBooking ? `
              <i class="fas fa-layer-group text-purple-500 mr-2"></i>${escapeHtml(data.seriesTitle || data.courseName)}
            ` : `
              <i class="fas fa-book text-blue-500 mr-2"></i>${escapeHtml(data.courseName)}
            `}
          </h2>
          ${data.termName ? `<p class="text-sm text-gray-500">${escapeHtml(data.termName)}</p>` : ''}
        </div>
        
        <!-- Schedule List -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-list-ul text-blue-500 mr-2"></i>
            ${data.isSeriesBooking ? `全${data.schedules.length}回の日程` : '講座日程'}
          </h3>
          
          <div class="space-y-4">
            ${data.schedules.map((sch, idx) => {
              // 日付がない場合はスキップ用のフラグ
              const hasDate = sch.date && sch.start_time
              // URLかどうかをチェック（http://またはhttps://で始まる場合のみURLとして扱う）
              const isUrl = sch.online_url && (sch.online_url.startsWith('http://') || sch.online_url.startsWith('https://'))
              // 場所欄にはMeet URLを直接入れる
              const locationText = isUrl ? sch.online_url : 'オンライン開催'
              // 説明文を改善
              const description = isUrl 
                ? `📚 mirAIcafe AI講座\n\n【参加方法】\n上記「Google Meet」のリンクをクリックして参加してください。\n\n【講座詳細】\nhttps://miraicafe.work\n\n【お問い合わせ】\nhttps://miraicafe.work/contact`
                : `📚 mirAIcafe AI講座\n\n【参加方法】\n参加URLは開催前にメールでお知らせします。\n\n【講座詳細】\nhttps://miraicafe.work\n\n【お問い合わせ】\nhttps://miraicafe.work/contact`
              
              const gcalUrl = hasDate ? generateGoogleCalendarUrl(
                '【mirAIcafe】' + sch.course_title,
                sch.date,
                sch.start_time,
                sch.end_time || sch.start_time,
                locationText,
                description
              ) : ''
              
              // 日付のフォーマット
              const dateStr = sch.date 
                ? new Date(sch.date + 'T00:00:00').toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
                : '日程未定'
              
              return `
              <div class="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                <div class="flex-shrink-0">
                  <span class="w-10 h-10 bg-blue-500 text-white font-bold rounded-full flex items-center justify-center">
                    ${sch.session_number || (idx + 1)}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-800 mb-1">${escapeHtml(sch.course_title || '講座名未設定')}</p>
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-calendar mr-1"></i>
                    ${dateStr}
                  </p>
                  ${sch.start_time ? `
                  <p class="text-sm text-gray-600">
                    <i class="fas fa-clock mr-1"></i>
                    ${sch.start_time} 〜 ${sch.end_time || ''}
                  </p>
                  ` : ''}
                  ${isUrl ? `
                  <p class="text-sm text-blue-600 mt-1">
                    <i class="fas fa-video mr-1"></i>
                    <a href="${escapeHtml(sch.online_url)}" target="_blank" class="hover:underline">参加URLを開く</a>
                  </p>
                  ` : `
                  <p class="text-sm text-gray-500 mt-1">
                    <i class="fas fa-video mr-1"></i>
                    オンライン開催（参加URLは開催前にメールでお知らせします）
                  </p>
                  `}
                </div>
                <div class="flex-shrink-0">
                  ${hasDate ? `
                  <a href="${gcalUrl}" target="_blank" 
                     class="inline-flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm">
                    <i class="fab fa-google text-blue-500"></i>
                    <span class="text-gray-700">追加</span>
                  </a>
                  ` : `
                  <span class="text-xs text-gray-400">日程確定後に追加可能</span>
                  `}
                </div>
              </div>
              `
            }).join('')}
          </div>
        </div>
        
        <!-- Notice about adding all -->
        ${data.isSeriesBooking && data.schedules.length > 1 ? `
        <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p class="text-sm text-yellow-800">
            <i class="fas fa-info-circle mr-2"></i>
            <strong>全日程を追加するには：</strong>各日程の「追加」ボタンを順番にクリックしてください。
            Googleカレンダーは一度に複数のイベントを追加できないため、1つずつ追加する必要があります。
          </p>
        </div>
        
        ` : ''}
        
        <!-- Back Links -->
        <div class="flex gap-3">
          <a href="/" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow font-medium">
            <i class="fas fa-home"></i>
            トップへ
          </a>
          <a href="/courses" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all shadow font-medium">
            <i class="fas fa-book"></i>
            講座一覧
          </a>
        </div>
      </div>
    </section>
  ` : `
    <!-- Error / Not Found -->
    <section class="relative min-h-screen flex items-center justify-center py-12 px-4">
      <div class="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div class="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <i class="fas fa-lock text-white text-3xl"></i>
        </div>
        
        <h1 class="text-2xl font-bold text-gray-800 mb-4">アクセスできません</h1>
        <p class="text-gray-600 mb-6">
          ${escapeHtml(data.error || 'この予約情報にアクセスする権限がないか、予約が見つかりませんでした。')}
        </p>
        
        <div class="flex gap-3">
          <a href="/reservation" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium">
            <i class="fas fa-calendar-plus"></i>
            予約する
          </a>
          <a href="/contact" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">
            <i class="fas fa-envelope"></i>
            お問い合わせ
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout(
    data.success ? 'カレンダーに追加 | mirAIcafe' : 'エラー | mirAIcafe',
    content,
    { metaDescription: 'Googleカレンダーに講座の予定を追加できます。' }
  )
}
