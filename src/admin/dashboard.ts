import { renderAdminLayout } from './layout'

interface DashboardStats {
  courses: number
  blogs: number
  reviews: { total: number; pending: number }
  contacts: { total: number; new: number }
  bookings: { total: number; pending: number; confirmed: number }
}

interface RecentActivity {
  contacts: Array<{ id: number; name: string; type: string; subject: string; created_at: string; status: string }>
  reviews: Array<{ id: number; course_id: string; reviewer_name: string; rating: number; comment: string; created_at: string }>
  bookings: Array<{ id: number; customer_name: string; course_name: string; preferred_date: string; status: string; created_at: string }>
}

export const renderDashboard = (stats: DashboardStats, recent: RecentActivity) => {
  const content = `
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">ダッシュボード</h1>
      <p class="text-gray-500 mt-1">mirAIcafe管理画面へようこそ</p>
    </div>

    <!-- Stats Cards - Row 1 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">講座数</p>
            <p class="text-3xl font-bold text-gray-800">${stats.courses}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i class="fas fa-book-open text-blue-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/courses" class="text-sm text-blue-500 hover:text-blue-700 mt-4 inline-block">
          詳細を見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">ブログ記事</p>
            <p class="text-3xl font-bold text-gray-800">${stats.blogs}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i class="fas fa-newspaper text-green-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/blog" class="text-sm text-green-500 hover:text-green-700 mt-4 inline-block">
          詳細を見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">口コミ</p>
            <p class="text-3xl font-bold text-gray-800">${stats.reviews.total}</p>
            ${stats.reviews.pending > 0 ? `<p class="text-xs text-amber-600 mt-1">${stats.reviews.pending}件承認待ち</p>` : ''}
          </div>
          <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <i class="fas fa-star text-amber-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/reviews" class="text-sm text-amber-500 hover:text-amber-700 mt-4 inline-block">
          詳細を見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">お問い合わせ</p>
            <p class="text-3xl font-bold text-gray-800">${stats.contacts.total}</p>
            ${stats.contacts.new > 0 ? `<p class="text-xs text-red-600 mt-1">${stats.contacts.new}件未対応</p>` : ''}
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i class="fas fa-envelope text-purple-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/contacts" class="text-sm text-purple-500 hover:text-purple-700 mt-4 inline-block">
          詳細を見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>
    </div>

    <!-- Stats Cards - Row 2: Bookings -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">総予約数</p>
            <p class="text-3xl font-bold text-gray-800" id="total-bookings-count">${stats.bookings?.total || 0}</p>
          </div>
          <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <i class="fas fa-calendar-alt text-indigo-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/bookings" class="text-sm text-indigo-500 hover:text-indigo-700 mt-4 inline-block">
          詳細を見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">新規予約</p>
            <p class="text-3xl font-bold text-yellow-600" id="pending-bookings-count">${stats.bookings?.pending || 0}</p>
            ${(stats.bookings?.pending || 0) > 0 ? `<p class="text-xs text-yellow-600 mt-1">確認待ち</p>` : ''}
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i class="fas fa-clock text-yellow-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/bookings?tab=pending" class="text-sm text-yellow-500 hover:text-yellow-700 mt-4 inline-block">
          確認する <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>

      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">確定済み予約</p>
            <p class="text-3xl font-bold text-teal-600" id="confirmed-bookings-count">${stats.bookings?.confirmed || 0}</p>
          </div>
          <div class="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            <i class="fas fa-check-circle text-teal-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/bookings?tab=confirmed" class="text-sm text-teal-500 hover:text-teal-700 mt-4 inline-block">
          詳細を見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Recent Bookings -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fas fa-calendar-check text-indigo-500 mr-2"></i>
            新着予約
          </h2>
          <a href="/admin/bookings" class="text-sm text-blue-500 hover:text-blue-700">すべて見る</a>
        </div>
        ${(recent.bookings?.length || 0) > 0 ? `
          <div class="space-y-3">
            ${recent.bookings.map(b => `
              <a href="/admin/bookings/${b.id}" class="block p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-user text-indigo-500 text-xs"></i>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800 text-sm">${escapeHtml(b.customer_name)}</p>
                      <p class="text-xs text-gray-500 truncate max-w-[150px]">${escapeHtml(b.course_name) || '講座名未設定'}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-block px-2 py-1 text-xs rounded ${getStatusStyle(b.status)}">
                      ${getStatusLabel(b.status)}
                    </span>
                    <p class="text-xs text-gray-400 mt-1">${formatDate(b.created_at)}</p>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        ` : `
          <p class="text-gray-500 text-sm text-center py-8">予約はありません</p>
        `}
      </div>

      <!-- Recent Contacts -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fas fa-envelope text-purple-500 mr-2"></i>
            新着お問い合わせ
          </h2>
          <a href="/admin/contacts" class="text-sm text-blue-500 hover:text-blue-700">すべて見る</a>
        </div>
        ${recent.contacts.length > 0 ? `
          <div class="space-y-3">
            ${recent.contacts.map(c => `
              <a href="/admin/contacts/${c.id}" class="block p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <i class="fas fa-user text-purple-500 text-xs"></i>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800 text-sm">${c.name}</p>
                      <p class="text-xs text-gray-500 truncate max-w-[150px]">${c.subject}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="inline-block px-2 py-1 text-xs rounded ${c.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
                      ${c.status === 'new' ? '未対応' : '対応済'}
                    </span>
                    <p class="text-xs text-gray-400 mt-1">${formatDate(c.created_at)}</p>
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        ` : `
          <p class="text-gray-500 text-sm text-center py-8">お問い合わせはありません</p>
        `}
      </div>

      <!-- Pending Reviews -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fas fa-star text-amber-500 mr-2"></i>
            承認待ち口コミ
          </h2>
          <a href="/admin/reviews" class="text-sm text-blue-500 hover:text-blue-700">すべて見る</a>
        </div>
        ${recent.reviews.length > 0 ? `
          <div class="space-y-3">
            ${recent.reviews.map(r => `
              <div class="p-3 rounded-lg border border-gray-100">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center">
                    <div class="flex text-amber-400 text-sm mr-2">
                      ${Array(5).fill(0).map((_, i) => `<i class="fas fa-star ${i < r.rating ? '' : 'text-gray-300'}"></i>`).join('')}
                    </div>
                    <span class="text-sm font-medium text-gray-700">${r.reviewer_name}</span>
                  </div>
                  <span class="text-xs text-gray-400">${formatDate(r.created_at)}</span>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2">${r.comment}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-blue-500">${r.course_id}</span>
                  <div class="flex gap-2">
                    <form action="/admin/reviews/${r.id}/approve" method="POST" class="inline">
                      <button type="submit" class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                        承認
                      </button>
                    </form>
                    <form action="/admin/reviews/${r.id}/reject" method="POST" class="inline">
                      <button type="submit" class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">
                        却下
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="text-gray-500 text-sm text-center py-8">承認待ちの口コミはありません</p>
        `}
      </div>
    </div>

    <script>
      // 予約数をリアルタイムで取得・更新
      async function loadBookingStats() {
        try {
          const res = await fetch('/admin/api/bookings');
          const data = await res.json();
          
          if (data.bookings) {
            const pending = data.bookings.filter(b => b.status === 'pending').length;
            const confirmed = data.bookings.filter(b => b.status === 'confirmed').length;
            
            document.getElementById('total-bookings-count').textContent = data.bookings.length;
            document.getElementById('pending-bookings-count').textContent = pending;
            document.getElementById('confirmed-bookings-count').textContent = confirmed;
          }
        } catch (error) {
          console.error('Failed to load booking stats:', error);
        }
      }
      
      // ページ読み込み時に予約統計を更新
      loadBookingStats();
    </script>
  `

  return renderAdminLayout('ダッシュボード', content, 'dashboard')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今日'
  if (days === 1) return '昨日'
  if (days < 7) return `${days}日前`
  
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '新規',
    confirmed: '確定済み',
    completed: '完了',
    cancelled: 'キャンセル'
  }
  return labels[status] || status
}

function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}
