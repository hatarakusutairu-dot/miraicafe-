import { renderAdminLayout } from './layout'

interface DashboardStats {
  courses: number
  blogs: number
  portfolios?: number
  reviews: { total: number; pending: number; avgRating: number }
  contacts: { total: number; new: number }
  bookings: { total: number; pending: number; confirmed: number }
  surveyAvgRating?: number  // アンケートの平均満足度（5段階）
}

interface SiteStats {
  show_stats: number
  student_count_extra: number  // 手動追加分
  student_count_suffix: string
  course_count_auto: number
  course_count_manual: number
  satisfaction_auto: number
  satisfaction_manual: number
}

interface BookingStudentCount {
  auto: number  // 予約からの自動カウント
}

interface RecentActivity {
  contacts: Array<{ id: number; name: string; type: string; subject: string; created_at: string; status: string }>
  reviews: Array<{ id: number; course_id: string; reviewer_name: string; rating: number; comment: string; created_at: string }>
  bookings: Array<{ id: number; customer_name: string; course_name: string; preferred_date: string; status: string; created_at: string }>
}

export const renderDashboard = (stats: DashboardStats, recent: RecentActivity, siteStats?: SiteStats, studentCountAuto: number = 0) => {
  // 計算値
  const courseCount = siteStats?.course_count_auto ? stats.courses : (siteStats?.course_count_manual || 0)
  // アンケートの平均満足度を使用（5段階評価 → パーセント変換）
  const surveyRating = stats.surveyAvgRating || 0
  const satisfactionRate = siteStats?.satisfaction_auto ? Math.round(surveyRating * 20) : (siteStats?.satisfaction_manual || 0)
  const studentCountExtra = siteStats?.student_count_extra || 0
  const studentCountTotal = studentCountAuto + studentCountExtra
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

      <div class="card-stat bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">ポートフォリオ</p>
            <p class="text-3xl font-bold text-gray-800">${stats.portfolios || 0}</p>
          </div>
          <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <i class="fas fa-images text-pink-500 text-xl"></i>
          </div>
        </div>
        <a href="/admin/portfolios" class="text-sm text-pink-500 hover:text-pink-700 mt-4 inline-block">
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

    <!-- サイト実績設定 -->
    <div class="bg-white rounded-xl shadow-sm p-6 mt-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fas fa-chart-line text-indigo-500 mr-2"></i>
            サイト実績表示
          </h2>
          <p class="text-sm text-gray-500 mt-1">トップページに表示する実績数値を設定します</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="show-stats-toggle" class="sr-only peer" ${siteStats?.show_stats ? 'checked' : ''}>
          <div class="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-700" id="show-stats-label">${siteStats?.show_stats ? '表示中' : '非表示'}</span>
        </label>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 受講生数 -->
        <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-blue-500"></i>
            </div>
            <span class="font-medium text-gray-700">受講生数</span>
          </div>
          
          <!-- 計算式表示 -->
          <div class="flex items-center gap-2 mb-4">
            <!-- 自動カウント -->
            <div class="flex-1 p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <div class="text-xs text-blue-600 mb-1">
                <i class="fas fa-robot mr-1"></i>自動
              </div>
              <div class="text-2xl font-bold text-blue-700" id="student-auto">${studentCountAuto}</div>
              <div class="text-xs text-blue-500">予約から</div>
            </div>
            
            <!-- プラス記号 -->
            <div class="text-xl font-bold text-gray-400">+</div>
            
            <!-- 手動入力 -->
            <div class="flex-1 p-3 bg-gray-100 rounded-lg border border-gray-200 text-center">
              <div class="text-xs text-gray-600 mb-1">
                <i class="fas fa-edit mr-1"></i>手動
              </div>
              <input type="number" id="student-extra" value="${studentCountExtra}" min="0" 
                     class="w-16 text-2xl font-bold text-center bg-white border border-gray-300 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none mx-auto block">
              <div class="text-xs text-gray-500 mt-1">追加分</div>
            </div>
            
            <!-- イコール記号 -->
            <div class="text-xl font-bold text-gray-400">=</div>
            
            <!-- 合計表示 -->
            <div class="flex-1 p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-center">
              <div class="text-xs text-indigo-600 mb-1">
                <i class="fas fa-calculator mr-1"></i>合計
              </div>
              <div class="flex items-center justify-center gap-1">
                <span class="text-2xl font-bold text-indigo-700" id="student-total">${studentCountTotal}</span>
                <input type="text" id="student-suffix" value="${siteStats?.student_count_suffix || '+'}" 
                       class="w-8 text-lg font-bold text-indigo-600 bg-transparent border-b border-indigo-300 text-center outline-none" placeholder="+">
              </div>
              <div class="text-xs text-indigo-500">表示値</div>
            </div>
          </div>
          
          <p class="text-xs text-gray-400 text-center">
            <i class="fas fa-info-circle mr-1"></i>
            自動: 確定予約のユニーク顧客数 ｜ 手動: オフライン受講生など
          </p>
        </div>
        
        <!-- 講座数 -->
        <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-book-open text-green-500"></i>
              </div>
              <span class="font-medium text-gray-700">講座数</span>
            </div>
            <label class="flex items-center gap-2 text-xs">
              <input type="checkbox" id="course-auto" ${siteStats?.course_count_auto ? 'checked' : ''} class="rounded text-indigo-500 focus:ring-indigo-400">
              <span class="text-gray-500">自動</span>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input type="number" id="course-count-manual" value="${siteStats?.course_count_manual || stats.courses}" min="0" 
                   class="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                   ${siteStats?.course_count_auto ? 'disabled' : ''}>
            <span class="text-gray-500 text-sm" id="course-auto-value">${siteStats?.course_count_auto ? `(自動: ${stats.courses})` : ''}</span>
          </div>
        </div>
        
        <!-- 満足度 -->
        <div class="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-smile text-amber-500"></i>
              </div>
              <span class="font-medium text-gray-700">満足度</span>
            </div>
            <label class="flex items-center gap-2 text-xs">
              <input type="checkbox" id="satisfaction-auto" ${siteStats?.satisfaction_auto ? 'checked' : ''} class="rounded text-indigo-500 focus:ring-indigo-400">
              <span class="text-gray-500">自動</span>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input type="number" id="satisfaction-manual" value="${siteStats?.satisfaction_manual || 98}" min="0" max="100"
                   class="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                   ${siteStats?.satisfaction_auto ? 'disabled' : ''}>
            <span class="text-gray-700">%</span>
            <span class="text-gray-500 text-sm" id="satisfaction-auto-value">${siteStats?.satisfaction_auto ? `(自動: ${satisfactionRate}%)` : ''}</span>
          </div>
          <p class="text-xs text-gray-400 mt-2">自動: アンケート平均満足度×20%</p>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
        <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <i class="fas fa-eye"></i>
          <span>プレビュー:</span>
          <div class="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
            <span class="font-bold text-indigo-600" id="preview-students">${studentCountTotal}${siteStats?.student_count_suffix || '+'}</span>
            <span class="text-gray-500">受講生</span>
          </div>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded" id="preview-students-calc">${studentCountAuto}+${studentCountExtra}</span>
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
            <span class="font-bold text-green-600" id="preview-courses">${courseCount}</span>
            <span class="text-gray-500">講座</span>
          </div>
          <span class="text-gray-300">|</span>
          <div class="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
            <span class="font-bold text-amber-600" id="preview-satisfaction">${satisfactionRate}%</span>
            <span class="text-gray-500">満足度</span>
          </div>
        </div>
        <button onclick="saveSiteStats()" class="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow">
          <i class="fas fa-save mr-2"></i>保存
        </button>
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
      
      // ===== サイト実績設定 =====
      
      // 表示/非表示トグル
      document.getElementById('show-stats-toggle').addEventListener('change', function() {
        document.getElementById('show-stats-label').textContent = this.checked ? '表示中' : '非表示';
      });
      
      // 講座数自動チェック
      document.getElementById('course-auto').addEventListener('change', function() {
        const input = document.getElementById('course-count-manual');
        const autoValue = document.getElementById('course-auto-value');
        input.disabled = this.checked;
        autoValue.textContent = this.checked ? '(自動: ${stats.courses})' : '';
        updatePreview();
      });
      
      // 満足度自動チェック
      document.getElementById('satisfaction-auto').addEventListener('change', function() {
        const input = document.getElementById('satisfaction-manual');
        const autoValue = document.getElementById('satisfaction-auto-value');
        input.disabled = this.checked;
        autoValue.textContent = this.checked ? '(自動: ${satisfactionRate}%)' : '';
        updatePreview();
      });
      
      // プレビュー更新
      function updatePreview() {
        const studentAuto = parseInt(document.getElementById('student-auto').textContent) || 0;
        const studentExtra = parseInt(document.getElementById('student-extra').value) || 0;
        const studentTotal = studentAuto + studentExtra;
        const studentSuffix = document.getElementById('student-suffix').value;
        const courseAuto = document.getElementById('course-auto').checked;
        const courseManual = document.getElementById('course-count-manual').value;
        const satisfactionAuto = document.getElementById('satisfaction-auto').checked;
        const satisfactionManual = document.getElementById('satisfaction-manual').value;
        
        // 受講生合計更新
        document.getElementById('student-total').textContent = studentTotal;
        document.getElementById('preview-students').textContent = studentTotal + studentSuffix;
        document.getElementById('preview-students-calc').textContent = studentAuto + '+' + studentExtra;
        document.getElementById('preview-courses').textContent = courseAuto ? '${stats.courses}' : courseManual;
        document.getElementById('preview-satisfaction').textContent = (satisfactionAuto ? '${satisfactionRate}' : satisfactionManual) + '%';
      }
      
      // 入力時にプレビュー更新
      ['student-extra', 'student-suffix', 'course-count-manual', 'satisfaction-manual'].forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
      });
      
      // 保存
      async function saveSiteStats() {
        const data = {
          show_stats: document.getElementById('show-stats-toggle').checked ? 1 : 0,
          student_count_extra: parseInt(document.getElementById('student-extra').value) || 0,
          student_count_suffix: document.getElementById('student-suffix').value || '+',
          course_count_auto: document.getElementById('course-auto').checked ? 1 : 0,
          course_count_manual: parseInt(document.getElementById('course-count-manual').value) || 0,
          satisfaction_auto: document.getElementById('satisfaction-auto').checked ? 1 : 0,
          satisfaction_manual: parseInt(document.getElementById('satisfaction-manual').value) || 0
        };
        
        try {
          const res = await fetch('/admin/api/site-stats', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await res.json();
          if (result.success) {
            alert('実績設定を保存しました');
          } else {
            alert('エラー: ' + (result.error || '保存に失敗しました'));
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }
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
