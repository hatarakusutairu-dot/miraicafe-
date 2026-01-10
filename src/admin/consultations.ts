import { renderAdminLayout } from './layout'

// 個別相談予約の型定義
interface ConsultationBooking {
  id: string
  type: 'ai' | 'mental'
  duration: number
  date: string
  time: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  message: string | null
  amount: number
  status: 'pending_approval' | 'approved' | 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  meet_url: string | null
  notes: string | null
  calendar_event_id: string | null
  created_at: string
  updated_at: string
}

// 固定のGoogle Meet URL
const DEFAULT_MEET_URL = 'https://meet.google.com/hsd-xuri-hiu'

function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    return `${year}年${month}月${day}日(${weekdays[date.getDay()]})`
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

function getTypeLabel(type: string): string {
  return type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談'
}

function getTypeColor(type: string): string {
  return type === 'ai' 
    ? 'bg-blue-100 text-blue-800' 
    : 'bg-purple-100 text-purple-800'
}

function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    pending_approval: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">承認待ち</span>',
    approved: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">承認済（決済待ち）</span>',
    pending: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">決済待ち</span>',
    confirmed: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">確定</span>',
    cancelled: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">キャンセル</span>',
    completed: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">完了</span>'
  }
  return badges[status] || status
}

function getPaymentBadge(status: string): string {
  const badges: Record<string, string> = {
    pending: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">未払い</span>',
    paid: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800">支払済</span>',
    refunded: '<span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">返金済</span>'
  }
  return badges[status] || status
}

// 個別相談管理ページ
export function renderConsultationAdmin(bookings: ConsultationBooking[]): string {
  // 統計
  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length
  const pendingApprovalBookings = bookings.filter(b => b.status === 'pending_approval').length
  const approvedBookings = bookings.filter(b => b.status === 'approved').length
  const pendingPaymentBookings = bookings.filter(b => b.status === 'pending' || b.status === 'approved').length
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.amount, 0)

  // 承認待ちの予約
  const awaitingApproval = bookings
    .filter(b => b.status === 'pending_approval')
    .sort((a, b) => a.created_at.localeCompare(b.created_at))

  // 承認済み・決済待ちの予約
  const awaitingPayment = bookings
    .filter(b => b.status === 'approved')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  // 今後の予約（確定済み）
  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings
    .filter(b => b.date >= today && (b.status === 'confirmed'))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const content = `
    <div class="space-y-6">
      <!-- ヘッダー -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center">
            <span class="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <i class="fas fa-comments text-white"></i>
            </span>
            個別相談管理
          </h1>
          <p class="text-gray-500 mt-1">1対1の個別相談の予約を管理</p>
        </div>
        <a href="${DEFAULT_MEET_URL}" target="_blank" rel="noopener noreferrer" 
           class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
          <i class="fas fa-video mr-2"></i>
          Google Meet を開く
        </a>
      </div>

      <!-- 統計カード -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-sm text-gray-500 mb-1">総予約数</div>
          <div class="text-2xl font-bold text-gray-800">${totalBookings}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border-2 border-orange-200 ${pendingApprovalBookings > 0 ? 'bg-orange-50' : ''}">
          <div class="text-sm text-orange-600 mb-1">承認待ち</div>
          <div class="text-2xl font-bold text-orange-600">${pendingApprovalBookings}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-sm text-gray-500 mb-1">決済待ち</div>
          <div class="text-2xl font-bold text-yellow-600">${pendingPaymentBookings}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-sm text-gray-500 mb-1">確定済み</div>
          <div class="text-2xl font-bold text-green-600">${confirmedBookings}</div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div class="text-sm text-gray-500 mb-1">売上</div>
          <div class="text-2xl font-bold text-emerald-600">¥${totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      ${awaitingApproval.length > 0 ? `
      <!-- 承認待ちの予約（要対応） -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-300">
        <div class="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
          <h2 class="text-lg font-bold text-white flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            承認待ちの予約（${awaitingApproval.length}件）- 要対応
          </h2>
        </div>
        <div class="divide-y divide-orange-100">
          ${awaitingApproval.map(b => `
            <div class="p-4 bg-orange-50 hover:bg-orange-100 transition-colors">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg font-bold text-gray-800">${formatDate(b.date)}</span>
                    <span class="text-lg font-bold text-orange-600">${escapeHtml(b.time)}〜</span>
                    <span class="px-2 py-0.5 text-xs rounded-full ${getTypeColor(b.type)}">${getTypeLabel(b.type)}</span>
                    <span class="text-sm text-gray-500">${b.duration}分</span>
                    <span class="text-sm font-bold text-emerald-600">¥${b.amount.toLocaleString()}</span>
                  </div>
                  <div class="text-gray-600">
                    <i class="fas fa-user mr-1"></i>${escapeHtml(b.customer_name)}
                    <span class="mx-2 text-gray-300">|</span>
                    <i class="fas fa-envelope mr-1"></i>${escapeHtml(b.customer_email)}
                  </div>
                  ${b.message ? `<div class="mt-1 text-sm text-gray-500"><i class="fas fa-comment mr-1"></i>${escapeHtml(b.message)}</div>` : ''}
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="approveAndSendPayment('${b.id}')" 
                          class="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                    <i class="fas fa-check-circle mr-1"></i>承認＋決済URL送信
                  </button>
                  <button onclick="addToCalendar('${b.id}')" 
                          class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                    <i class="fas fa-calendar-plus mr-1"></i>カレンダー
                  </button>
                  <button onclick="updateStatus('${b.id}', 'cancelled')" 
                          class="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">
                    <i class="fas fa-times mr-1"></i>却下
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${awaitingPayment.length > 0 ? `
      <!-- 承認済み・決済待ちの予約 -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-blue-200">
        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <h2 class="text-lg font-bold text-white flex items-center">
            <i class="fas fa-credit-card mr-2"></i>
            承認済み・決済待ち（${awaitingPayment.length}件）
          </h2>
        </div>
        <div class="divide-y divide-blue-100">
          ${awaitingPayment.map(b => `
            <div class="p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg font-bold text-gray-800">${formatDate(b.date)}</span>
                    <span class="text-lg font-bold text-blue-600">${escapeHtml(b.time)}〜</span>
                    <span class="px-2 py-0.5 text-xs rounded-full ${getTypeColor(b.type)}">${getTypeLabel(b.type)}</span>
                    <span class="text-sm text-gray-500">${b.duration}分</span>
                    <span class="text-sm font-bold text-emerald-600">¥${b.amount.toLocaleString()}</span>
                  </div>
                  <div class="text-gray-600">
                    <i class="fas fa-user mr-1"></i>${escapeHtml(b.customer_name)}
                    <span class="mx-2 text-gray-300">|</span>
                    <i class="fas fa-envelope mr-1"></i>${escapeHtml(b.customer_email)}
                  </div>
                  <div class="mt-1 text-sm text-blue-600">
                    <i class="fas fa-info-circle mr-1"></i>お客様に決済URLを送信済み。決済完了待ち。
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="resendPaymentEmail('${b.id}')" 
                          class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                    <i class="fas fa-paper-plane mr-1"></i>決済URL再送
                  </button>
                  <button onclick="addToCalendar('${b.id}')" 
                          class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                    <i class="fas fa-calendar-plus mr-1"></i>カレンダー
                  </button>
                  <button onclick="updateStatus('${b.id}', 'cancelled')" 
                          class="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors">
                    <i class="fas fa-times mr-1"></i>キャンセル
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      <!-- Google Meet URL -->
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="fas fa-video text-green-600 text-xl mr-3"></i>
            <div>
              <div class="font-medium text-gray-800">固定Google Meet URL</div>
              <div class="text-sm text-gray-600">${DEFAULT_MEET_URL}</div>
            </div>
          </div>
          <button onclick="copyMeetUrl()" class="px-4 py-2 bg-white text-green-600 rounded-lg border border-green-300 hover:bg-green-50 transition-colors">
            <i class="fas fa-copy mr-1"></i>コピー
          </button>
        </div>
      </div>

      <!-- 今後の予約 -->
      ${upcomingBookings.length > 0 ? `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div class="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
            <h2 class="text-lg font-bold text-white flex items-center">
              <i class="fas fa-calendar-check mr-2"></i>
              今後の予約（${upcomingBookings.length}件）
            </h2>
          </div>
          <div class="divide-y divide-gray-100">
            ${upcomingBookings.map(b => `
              <div class="p-4 hover:bg-gray-50 transition-colors">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-lg font-bold text-gray-800">${formatDate(b.date)}</span>
                      <span class="text-lg font-bold text-pink-600">${escapeHtml(b.time)}〜</span>
                      <span class="px-2 py-0.5 text-xs rounded-full ${getTypeColor(b.type)}">${getTypeLabel(b.type)}</span>
                      <span class="text-sm text-gray-500">${b.duration}分</span>
                    </div>
                    <div class="text-gray-600">
                      <i class="fas fa-user mr-1"></i>${escapeHtml(b.customer_name)}
                      <span class="mx-2 text-gray-300">|</span>
                      <i class="fas fa-envelope mr-1"></i>${escapeHtml(b.customer_email)}
                    </div>
                    ${b.message ? `<div class="mt-1 text-sm text-gray-500"><i class="fas fa-comment mr-1"></i>${escapeHtml(b.message)}</div>` : ''}
                  </div>
                  <div class="flex items-center gap-2">
                    ${getStatusBadge(b.status)}
                    ${getPaymentBadge(b.payment_status)}
                    <a href="${DEFAULT_MEET_URL}" target="_blank" rel="noopener noreferrer" 
                       class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                      <i class="fas fa-video mr-1"></i>Meet
                    </a>
                    <button onclick="openDetailModal('${b.id}')" 
                            class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      <i class="fas fa-eye mr-1"></i>詳細
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 全予約一覧 -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fas fa-list mr-2 text-gray-500"></i>
            全予約一覧
          </h2>
        </div>
        
        ${bookings.length === 0 ? `
          <div class="text-center py-12">
            <i class="fas fa-comments text-6xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">まだ予約がありません</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイプ</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">お客様</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支払</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${bookings.map(b => `
                  <tr class="hover:bg-gray-50" id="row-${b.id}">
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="font-medium text-gray-800">${formatDate(b.date)}</div>
                      <div class="text-sm text-gray-500">${escapeHtml(b.time)}〜 (${b.duration}分)</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="px-2 py-1 text-xs rounded-full ${getTypeColor(b.type)}">${getTypeLabel(b.type)}</span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="font-medium text-gray-800">${escapeHtml(b.customer_name)}</div>
                      <div class="text-sm text-gray-500">${escapeHtml(b.customer_email)}</div>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap font-medium text-gray-800">
                      ¥${b.amount.toLocaleString()}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      ${getStatusBadge(b.status)}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      ${getPaymentBadge(b.payment_status)}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <div class="flex items-center gap-1">
                        <button onclick="openDetailModal('${b.id}')" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="詳細">
                          <i class="fas fa-eye"></i>
                        </button>
                        ${b.status === 'pending_approval' ? `
                          <button onclick="approveAndSendPayment('${b.id}')" class="p-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg" title="承認＋決済URL送信">
                            <i class="fas fa-check-circle"></i>
                          </button>
                          <button onclick="addToCalendar('${b.id}')" class="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg" title="カレンダー登録">
                            <i class="fas fa-calendar-plus"></i>
                          </button>
                        ` : ''}
                        ${b.status === 'pending' ? `
                          <button onclick="resendPaymentEmail('${b.id}')" class="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg" title="決済URL再送信">
                            <i class="fas fa-redo"></i>
                          </button>
                        ` : ''}
                        ${b.status === 'confirmed' ? `
                          <button onclick="updateStatus('${b.id}', 'completed')" class="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg" title="完了">
                            <i class="fas fa-check-double"></i>
                          </button>
                          <button onclick="sendReminderEmail('${b.id}')" class="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg" title="リマインドメール">
                            <i class="fas fa-paper-plane"></i>
                          </button>
                        ` : ''}
                        <button onclick="updateStatus('${b.id}', 'cancelled')" class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg" title="キャンセル">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>

    <!-- 詳細モーダル -->
    <div id="detailModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex justify-between items-center">
          <h3 class="text-lg font-bold text-white">予約詳細</h3>
          <button onclick="closeDetailModal()" class="text-white hover:text-pink-200">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        <div id="detailContent" class="p-6">
          <!-- 動的に挿入 -->
        </div>
      </div>
    </div>

    <script>
      const MEET_URL = '${DEFAULT_MEET_URL}';
      
      // 予約データ（JavaScript用）
      const bookings = ${JSON.stringify(bookings.map(b => ({
        id: b.id,
        type: b.type,
        duration: b.duration,
        date: b.date,
        time: b.time,
        customer_name: b.customer_name,
        customer_email: b.customer_email,
        customer_phone: b.customer_phone,
        message: b.message,
        amount: b.amount,
        status: b.status,
        payment_status: b.payment_status,
        notes: b.notes,
        calendar_event_id: b.calendar_event_id,
        created_at: b.created_at
      })))};

      function copyMeetUrl() {
        navigator.clipboard.writeText(MEET_URL).then(() => {
          alert('Google Meet URLをコピーしました');
        });
      }

      function openDetailModal(id) {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        const typeLabel = booking.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
        const [year, month, day] = booking.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const dateStr = year + '年' + month + '月' + day + '日(' + weekdays[date.getDay()] + ')';

        document.getElementById('detailContent').innerHTML = \`
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-500">日時</label>
                <div class="font-bold text-lg">\${dateStr} \${booking.time}〜</div>
              </div>
              <div>
                <label class="text-sm text-gray-500">タイプ</label>
                <div class="font-bold text-lg">\${typeLabel}（\${booking.duration}分）</div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-500">お名前</label>
                <div class="font-medium">\${booking.customer_name}</div>
              </div>
              <div>
                <label class="text-sm text-gray-500">金額</label>
                <div class="font-bold text-emerald-600">¥\${booking.amount.toLocaleString()}</div>
              </div>
            </div>
            
            <div>
              <label class="text-sm text-gray-500">メールアドレス</label>
              <div class="font-medium">
                <a href="mailto:\${booking.customer_email}" class="text-blue-600 hover:underline">\${booking.customer_email}</a>
              </div>
            </div>
            
            \${booking.customer_phone ? \`
              <div>
                <label class="text-sm text-gray-500">電話番号</label>
                <div class="font-medium">\${booking.customer_phone}</div>
              </div>
            \` : ''}
            
            \${booking.message ? \`
              <div>
                <label class="text-sm text-gray-500">メッセージ</label>
                <div class="bg-gray-50 p-3 rounded-lg text-gray-700">\${booking.message}</div>
              </div>
            \` : ''}
            
            <div class="bg-green-50 p-4 rounded-xl">
              <label class="text-sm text-green-700 font-medium">Google Meet URL</label>
              <div class="flex items-center gap-2 mt-1">
                <input type="text" value="\${MEET_URL}" readonly class="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-sm">
                <a href="\${MEET_URL}" target="_blank" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <i class="fas fa-external-link-alt mr-1"></i>開く
                </a>
              </div>
            </div>
            
            <div class="flex gap-2 pt-4 border-t">
              <button onclick="updateStatus('\${booking.id}', 'confirmed')" class="flex-1 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <i class="fas fa-check mr-1"></i>確定
              </button>
              <button onclick="updateStatus('\${booking.id}', 'completed')" class="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <i class="fas fa-check-double mr-1"></i>完了
              </button>
              <button onclick="updateStatus('\${booking.id}', 'cancelled')" class="flex-1 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                <i class="fas fa-times mr-1"></i>キャンセル
              </button>
            </div>
            
            <div class="flex gap-2">
              <button onclick="sendReminderEmail('\${booking.id}')" class="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
                <i class="fas fa-paper-plane mr-1"></i>リマインドメール送信
              </button>
              <button onclick="addToCalendar('\${booking.id}')" class="flex-1 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
                <i class="fas fa-calendar-plus mr-1"></i>カレンダー登録
              </button>
            </div>
          </div>
        \`;

        document.getElementById('detailModal').classList.remove('hidden');
      }

      function closeDetailModal() {
        document.getElementById('detailModal').classList.add('hidden');
      }

      async function updateStatus(id, status) {
        if (!confirm(\`ステータスを「\${status === 'confirmed' ? '確定' : status === 'completed' ? '完了' : 'キャンセル'}」に変更しますか？\`)) {
          return;
        }

        try {
          const res = await fetch('/admin/api/consultations/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          
          if (res.ok) {
            alert('ステータスを更新しました');
            location.reload();
          } else {
            const data = await res.json();
            alert(data.error || '更新に失敗しました');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('更新に失敗しました');
        }
      }

      async function sendReminderEmail(id) {
        if (!confirm('リマインドメールを送信しますか？')) {
          return;
        }

        try {
          const res = await fetch('/admin/api/consultations/' + id + '/reminder', {
            method: 'POST'
          });
          
          if (res.ok) {
            alert('リマインドメールを送信しました');
          } else {
            const data = await res.json();
            alert(data.error || 'メール送信に失敗しました');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('メール送信に失敗しました');
        }
      }

      async function addToCalendar(id) {
        try {
          const res = await fetch('/admin/api/consultations/' + id + '/calendar', {
            method: 'POST'
          });
          
          const data = await res.json();
          
          if (res.ok && data.calendarUrl) {
            // 新しいタブでGoogleカレンダーを開く
            window.open(data.calendarUrl, '_blank');
          } else {
            alert(data.error || 'カレンダー登録に失敗しました');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('カレンダー登録に失敗しました');
        }
      }

      async function approveAndSendPayment(id) {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        const typeLabel = booking.type === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
        const [year, month, day] = booking.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const dateStr = year + '年' + month + '月' + day + '日(' + weekdays[date.getDay()] + ')';

        if (!confirm(\`以下の予約を承認し、決済URLをお客様に送信しますか？\\n\\n\${booking.customer_name}様\\n\${dateStr} \${booking.time}〜\\n\${typeLabel} (\${booking.duration}分)\\n¥\${booking.amount.toLocaleString()}\\n\\n※ 先にカレンダー登録を行うことをお勧めします\`)) {
          return;
        }

        try {
          const res = await fetch('/admin/api/consultations/' + id + '/approve', {
            method: 'POST'
          });
          
          const data = await res.json();
          
          if (res.ok) {
            alert('承認しました。お客様に決済URLを送信しました。');
            location.reload();
          } else {
            alert(data.error || '承認に失敗しました');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('承認に失敗しました');
        }
      }

      async function resendPaymentEmail(id) {
        if (!confirm('決済URLを再送信しますか？')) {
          return;
        }

        try {
          const res = await fetch('/admin/api/consultations/' + id + '/resend-payment', {
            method: 'POST'
          });
          
          if (res.ok) {
            alert('決済URLを再送信しました');
          } else {
            const data = await res.json();
            alert(data.error || '送信に失敗しました');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('送信に失敗しました');
        }
      }

      // モーダル外クリックで閉じる
      document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) closeDetailModal();
      });
    </script>
  `

  return renderAdminLayout('個別相談管理', content, 'consultations')
}
