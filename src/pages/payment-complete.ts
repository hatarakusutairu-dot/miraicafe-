// 決済完了ページ
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

interface PaymentCompleteData {
  success: boolean
  bookingId?: string
  seriesBookingId?: string
  isSeriesBooking?: boolean
  customerName?: string
  customerEmail?: string
  courseName?: string
  totalPrice?: number
  error?: string
}

export const renderPaymentCompletePage = (data: PaymentCompleteData) => {
  const content = data.success ? `
    <!-- Success Content -->
    <section class="relative min-h-screen flex items-center justify-center py-12 px-4">
      <div class="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <i class="fas fa-check text-white text-4xl"></i>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-800 mb-4">予約完了！</h1>
        <p class="text-gray-600 mb-6">
          ご予約ありがとうございます。<br>
          確認メールを <strong>${escapeHtml(data.customerEmail || '')}</strong> にお送りしました。
        </p>
        
        ${data.courseName ? `
        <div class="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p class="text-sm text-gray-500 mb-1">予約内容</p>
          <p class="font-bold text-gray-800">${escapeHtml(data.courseName)}</p>
          ${data.totalPrice ? `<p class="text-lg font-bold text-ai-blue">¥${data.totalPrice.toLocaleString()}</p>` : ''}
        </div>
        ` : ''}
        
        <!-- カレンダー追加への案内 -->
        <div class="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-200">
          <div class="flex items-center justify-center mb-3">
            <i class="fas fa-calendar-plus text-2xl text-blue-500 mr-2"></i>
            <p class="text-gray-700 font-medium">講座の日程をカレンダーに追加</p>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            オンライン参加URL付きで全日程をGoogleカレンダーに追加できます
          </p>
          <a href="/calendar/${escapeHtml(data.seriesBookingId || data.bookingId || '')}" 
             class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow font-medium">
            <i class="fas fa-calendar-alt"></i>
            カレンダー追加ページへ
          </a>
        </div>
        
        <div class="flex gap-3">
          <a href="/" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium">
            <i class="fas fa-home"></i>
            トップへ
          </a>
          <a href="/courses" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium">
            <i class="fas fa-book"></i>
            講座一覧
          </a>
        </div>
      </div>
    </section>
  ` : `
    <!-- Error Content -->
    <section class="relative min-h-screen flex items-center justify-center py-12 px-4">
      <div class="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <i class="fas fa-times text-white text-4xl"></i>
        </div>
        
        <h1 class="text-3xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
        <p class="text-gray-600 mb-6">
          ${escapeHtml(data.error || '決済処理中にエラーが発生しました。')}
        </p>
        
        <div class="bg-yellow-50 rounded-xl p-4 mb-6 text-left">
          <p class="text-sm text-yellow-800">
            <i class="fas fa-info-circle mr-2"></i>
            決済が完了している場合、確認メールが届いていないか確認してください。
            問題が解決しない場合は、お問い合わせください。
          </p>
        </div>
        
        <div class="flex gap-3">
          <a href="/reservation" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium">
            <i class="fas fa-redo"></i>
            再予約
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
    data.success ? '予約完了 | mirAIcafe' : 'エラー | mirAIcafe',
    content,
    { metaDescription: data.success ? 'ご予約ありがとうございます。' : 'エラーが発生しました。' }
  )
}
