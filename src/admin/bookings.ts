// 予約管理画面コンポーネント
import { renderAdminLayout } from './layout'

// 予約の型定義
export interface Booking {
  id: number
  course_id: string
  course_name: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  preferred_date: string | null
  preferred_time: string | null
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  amount: number
  admin_note: string | null
  created_at: string
  updated_at: string
}

// ステータスの日本語表示とスタイル
const statusConfig = {
  pending: { label: '未確認', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: 'fa-clock' },
  confirmed: { label: '確定済み', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: 'fa-check-circle' },
  completed: { label: '完了', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: 'fa-check-double' },
  cancelled: { label: 'キャンセル', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: 'fa-times-circle' }
}

const paymentStatusConfig = {
  unpaid: { label: '未払い', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  paid: { label: '支払済', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  refunded: { label: '返金済', bgColor: 'bg-orange-100', textColor: 'text-orange-700' }
}

// HTMLエスケープ
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 日付フォーマット
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('ja-JP', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// 予約一覧ページ
export function renderBookingsList(bookings: Booking[], currentTab: string = 'all'): string {
  // ステータス別カウント
  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  }

  // 現在のタブでフィルタ
  const filteredBookings = currentTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === currentTab)

  const content = `
    <div class="p-6">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">予約管理</h1>
          <p class="text-slate-500 mt-1">講座予約の確認・管理</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="exportBookings()" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
            <i class="fas fa-download"></i>
            <span>エクスポート</span>
          </button>
        </div>
      </div>

      <!-- サマリーカード -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">全予約</p>
              <p class="text-2xl font-bold text-slate-800">${counts.all}</p>
            </div>
            <div class="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-calendar-alt text-slate-500"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">未確認</p>
              <p class="text-2xl font-bold text-yellow-600">${counts.pending}</p>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-yellow-600"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">確定済み</p>
              <p class="text-2xl font-bold text-blue-600">${counts.confirmed}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-circle text-blue-600"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">完了</p>
              <p class="text-2xl font-bold text-green-600">${counts.completed}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check-double text-green-600"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">キャンセル</p>
              <p class="text-2xl font-bold text-red-600">${counts.cancelled}</p>
            </div>
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-times-circle text-red-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- タブナビゲーション -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div class="flex border-b border-slate-200 overflow-x-auto">
          <a href="/admin/bookings?tab=all" class="px-6 py-3 text-sm font-medium whitespace-nowrap ${currentTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            すべて (${counts.all})
          </a>
          <a href="/admin/bookings?tab=pending" class="px-6 py-3 text-sm font-medium whitespace-nowrap ${currentTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            未確認 (${counts.pending})
          </a>
          <a href="/admin/bookings?tab=confirmed" class="px-6 py-3 text-sm font-medium whitespace-nowrap ${currentTab === 'confirmed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            確定済み (${counts.confirmed})
          </a>
          <a href="/admin/bookings?tab=completed" class="px-6 py-3 text-sm font-medium whitespace-nowrap ${currentTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            完了 (${counts.completed})
          </a>
          <a href="/admin/bookings?tab=cancelled" class="px-6 py-3 text-sm font-medium whitespace-nowrap ${currentTab === 'cancelled' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}">
            キャンセル (${counts.cancelled})
          </a>
        </div>
      </div>

      <!-- 予約リスト -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        ${filteredBookings.length === 0 ? `
          <div class="p-12 text-center">
            <i class="fas fa-calendar-times text-slate-300 text-5xl mb-4"></i>
            <p class="text-slate-500">該当する予約がありません</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">予約情報</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden md:table-cell">講座</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase hidden lg:table-cell">希望日時</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">ステータス</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase hidden md:table-cell">支払い</th>
                  <th class="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${filteredBookings.map(booking => {
                  const status = statusConfig[booking.status]
                  const paymentStatus = paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.unpaid
                  return `
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            ${escapeHtml(booking.customer_name.charAt(0))}
                          </div>
                          <div>
                            <p class="font-medium text-slate-800">${escapeHtml(booking.customer_name)}</p>
                            <p class="text-sm text-slate-500">${escapeHtml(booking.customer_email)}</p>
                            ${booking.customer_phone ? `<p class="text-xs text-slate-400">${escapeHtml(booking.customer_phone)}</p>` : ''}
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4 hidden md:table-cell">
                        <p class="text-sm text-slate-700 line-clamp-2">${escapeHtml(booking.course_name) || '講座名未設定'}</p>
                        <p class="text-xs text-slate-400">¥${(booking.amount || 0).toLocaleString()}</p>
                      </td>
                      <td class="px-4 py-4 hidden lg:table-cell">
                        <p class="text-sm text-slate-700">${formatDate(booking.preferred_date)}</p>
                        <p class="text-xs text-slate-500">${escapeHtml(booking.preferred_time) || '-'}</p>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.textColor}">
                          <i class="fas ${status.icon}"></i>
                          ${status.label}
                        </span>
                      </td>
                      <td class="px-4 py-4 text-center hidden md:table-cell">
                        <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${paymentStatus.bgColor} ${paymentStatus.textColor}">
                          ${paymentStatus.label}
                        </span>
                      </td>
                      <td class="px-4 py-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <a href="/admin/bookings/${booking.id}" class="text-blue-600 hover:text-blue-800 p-2" title="詳細">
                            <i class="fas fa-eye"></i>
                          </a>
                          <button onclick="showStatusModal(${booking.id}, '${booking.status}')" class="text-slate-600 hover:text-slate-800 p-2" title="ステータス変更">
                            <i class="fas fa-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>

    <!-- ステータス変更モーダル -->
    <div id="status-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 class="text-lg font-bold text-slate-800 mb-4">ステータス変更</h3>
        <form id="status-form" method="POST">
          <div class="space-y-3 mb-6">
            <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="status" value="pending" class="text-yellow-500">
              <span class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <i class="fas fa-clock text-yellow-600"></i>
                </span>
                <span>未確認</span>
              </span>
            </label>
            <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="status" value="confirmed" class="text-blue-500">
              <span class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-check-circle text-blue-600"></i>
                </span>
                <span>確定済み</span>
              </span>
            </label>
            <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="status" value="completed" class="text-green-500">
              <span class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <i class="fas fa-check-double text-green-600"></i>
                </span>
                <span>完了</span>
              </span>
            </label>
            <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="status" value="cancelled" class="text-red-500">
              <span class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <i class="fas fa-times-circle text-red-600"></i>
                </span>
                <span>キャンセル</span>
              </span>
            </label>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium">
              変更する
            </button>
            <button type="button" onclick="closeStatusModal()" class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg transition">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      function showStatusModal(bookingId, currentStatus) {
        const modal = document.getElementById('status-modal');
        const form = document.getElementById('status-form');
        form.action = '/admin/bookings/' + bookingId + '/status';
        
        // 現在のステータスを選択
        const radio = form.querySelector('input[value="' + currentStatus + '"]');
        if (radio) radio.checked = true;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }

      function closeStatusModal() {
        const modal = document.getElementById('status-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }

      document.getElementById('status-modal').addEventListener('click', function(e) {
        if (e.target === this) closeStatusModal();
      });

      function exportBookings() {
        window.location.href = '/admin/bookings/export';
      }
    </script>
  `

  return renderAdminLayout('予約管理', content, 'bookings')
}

// 予約詳細ページ
export function renderBookingDetail(booking: Booking): string {
  const status = statusConfig[booking.status]
  const paymentStatus = paymentStatusConfig[booking.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.unpaid

  const content = `
    <div class="p-6">
      <!-- ヘッダー -->
      <div class="mb-6">
        <a href="/admin/bookings" class="text-slate-500 hover:text-slate-700 text-sm mb-2 inline-block">
          <i class="fas fa-arrow-left mr-1"></i>予約一覧に戻る
        </a>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">予約詳細 #${booking.id}</h1>
            <p class="text-slate-500 mt-1">受付日時: ${formatDateTime(booking.created_at)}</p>
          </div>
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.textColor}">
            <i class="fas ${status.icon}"></i>
            ${status.label}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左側：顧客情報・講座情報 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 顧客情報 -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <i class="fas fa-user text-blue-500 mr-2"></i>顧客情報
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-500 mb-1">お名前</p>
                <p class="font-medium text-slate-800">${escapeHtml(booking.customer_name)}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">メールアドレス</p>
                <p class="font-medium text-slate-800">
                  <a href="mailto:${escapeHtml(booking.customer_email)}" class="text-blue-600 hover:underline">
                    ${escapeHtml(booking.customer_email)}
                  </a>
                </p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">電話番号</p>
                <p class="font-medium text-slate-800">${escapeHtml(booking.customer_phone) || '-'}</p>
              </div>
            </div>
          </div>

          <!-- 講座情報 -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <i class="fas fa-book text-green-500 mr-2"></i>講座情報
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <p class="text-sm text-slate-500 mb-1">講座名</p>
                <p class="font-medium text-slate-800">${escapeHtml(booking.course_name) || '講座名未設定'}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">希望日</p>
                <p class="font-medium text-slate-800">${formatDate(booking.preferred_date)}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">希望時間</p>
                <p class="font-medium text-slate-800">${escapeHtml(booking.preferred_time) || '-'}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">金額</p>
                <p class="font-medium text-slate-800 text-lg">¥${(booking.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">支払い状況</p>
                <span class="inline-flex px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.bgColor} ${paymentStatus.textColor}">
                  ${paymentStatus.label}
                </span>
              </div>
            </div>
          </div>

          <!-- メッセージ -->
          ${booking.message ? `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <i class="fas fa-comment text-purple-500 mr-2"></i>お客様からのメッセージ
              </h2>
              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-slate-700 whitespace-pre-wrap">${escapeHtml(booking.message)}</p>
              </div>
            </div>
          ` : ''}

          <!-- 管理者メモ -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <i class="fas fa-sticky-note text-amber-500 mr-2"></i>管理者メモ
            </h2>
            <form method="POST" action="/admin/bookings/${booking.id}/note">
              <textarea name="admin_note" rows="4" 
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="内部用のメモを入力...">${escapeHtml(booking.admin_note)}</textarea>
              <div class="mt-3 text-right">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                  <i class="fas fa-save mr-1"></i>メモを保存
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 右側：アクション -->
        <div class="space-y-6">
          <!-- ステータス変更 -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4">ステータス変更</h2>
            <form method="POST" action="/admin/bookings/${booking.id}/status" class="space-y-3">
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.status === 'pending' ? 'ring-2 ring-yellow-500' : ''}">
                <input type="radio" name="status" value="pending" ${booking.status === 'pending' ? 'checked' : ''}>
                <span class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <i class="fas fa-clock text-yellow-600"></i>
                </span>
                <span>未確認</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.status === 'confirmed' ? 'ring-2 ring-blue-500' : ''}">
                <input type="radio" name="status" value="confirmed" ${booking.status === 'confirmed' ? 'checked' : ''}>
                <span class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-check-circle text-blue-600"></i>
                </span>
                <span>確定済み</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.status === 'completed' ? 'ring-2 ring-green-500' : ''}">
                <input type="radio" name="status" value="completed" ${booking.status === 'completed' ? 'checked' : ''}>
                <span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <i class="fas fa-check-double text-green-600"></i>
                </span>
                <span>完了</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.status === 'cancelled' ? 'ring-2 ring-red-500' : ''}">
                <input type="radio" name="status" value="cancelled" ${booking.status === 'cancelled' ? 'checked' : ''}>
                <span class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <i class="fas fa-times-circle text-red-600"></i>
                </span>
                <span>キャンセル</span>
              </label>
              <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-medium mt-4">
                ステータスを更新
              </button>
            </form>
          </div>

          <!-- 支払いステータス -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4">支払いステータス</h2>
            <form method="POST" action="/admin/bookings/${booking.id}/payment" class="space-y-3">
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.payment_status === 'unpaid' ? 'ring-2 ring-gray-400' : ''}">
                <input type="radio" name="payment_status" value="unpaid" ${booking.payment_status === 'unpaid' ? 'checked' : ''}>
                <span>未払い</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.payment_status === 'paid' ? 'ring-2 ring-green-500' : ''}">
                <input type="radio" name="payment_status" value="paid" ${booking.payment_status === 'paid' ? 'checked' : ''}>
                <span>支払済</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 ${booking.payment_status === 'refunded' ? 'ring-2 ring-orange-500' : ''}">
                <input type="radio" name="payment_status" value="refunded" ${booking.payment_status === 'refunded' ? 'checked' : ''}>
                <span>返金済</span>
              </label>
              <button type="submit" class="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition font-medium mt-4">
                支払いステータスを更新
              </button>
            </form>
          </div>

          <!-- 削除 -->
          <div class="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 class="text-lg font-bold text-red-600 mb-4">危険な操作</h2>
            <p class="text-sm text-slate-500 mb-4">この予約を削除すると元に戻せません。</p>
            <form method="POST" action="/admin/bookings/${booking.id}/delete" onsubmit="return confirm('本当に削除しますか？');">
              <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition font-medium">
                <i class="fas fa-trash mr-1"></i>予約を削除
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

  return renderAdminLayout(`予約詳細 #${booking.id}`, content, 'bookings')
}
