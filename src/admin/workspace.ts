import { renderAdminLayout } from './layout'

// ワークスペーススケジュールの型定義
interface WorkspaceSchedule {
  id: string
  title: string
  description: string | null
  date: string
  start_time: string
  end_time: string
  capacity: number
  enrolled: number
  price: number
  meet_url: string | null
  status: 'active' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

// ワークスペース予約の型定義
interface WorkspaceBooking {
  id: number
  workspace_schedule_id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  amount: number
  stripe_session_id: string | null
  created_at: string
  updated_at: string
  // JOIN結果
  schedule_date?: string
  schedule_time?: string
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  } catch {
    return dateStr
  }
}

// ワークスペース管理ページ
export function renderWorkspaceAdmin(schedules: WorkspaceSchedule[], bookings: WorkspaceBooking[]): string {
  const content = `
    <div class="space-y-6">
      <!-- ヘッダー -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center">
            <span class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <i class="fas fa-coffee text-white"></i>
            </span>
            ワークスペース管理
          </h1>
          <p class="text-gray-500 mt-1">mirAIcafe ワークスペースのスケジュールと予約を管理</p>
        </div>
        <button onclick="openScheduleModal()" class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
          <i class="fas fa-plus mr-2"></i>
          新しい日程を追加
        </button>
      </div>

      <!-- タブ -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="border-b border-gray-200">
          <nav class="flex">
            <button onclick="showTab('schedules')" id="tab-schedules" class="tab-btn active flex-1 py-4 px-6 text-center font-medium border-b-2 border-amber-500 text-amber-600">
              <i class="fas fa-calendar-alt mr-2"></i>スケジュール
            </button>
            <button onclick="showTab('bookings')" id="tab-bookings" class="tab-btn flex-1 py-4 px-6 text-center font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
              <i class="fas fa-users mr-2"></i>予約一覧
            </button>
          </nav>
        </div>

        <!-- スケジュール一覧 -->
        <div id="panel-schedules" class="tab-panel p-6">
          ${schedules.length === 0 ? `
            <div class="text-center py-12">
              <i class="fas fa-coffee text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">まだスケジュールがありません</p>
              <button onclick="openScheduleModal()" class="mt-4 text-amber-600 hover:text-amber-700 font-medium">
                <i class="fas fa-plus mr-1"></i>最初のスケジュールを追加
              </button>
            </div>
          ` : `
            <div class="grid gap-4">
              ${schedules.map(schedule => {
                const remaining = schedule.capacity - schedule.enrolled
                const isFull = remaining <= 0
                const isPast = new Date(schedule.date) < new Date(new Date().toDateString())
                return `
                  <div class="border rounded-xl p-4 ${isPast ? 'bg-gray-50 opacity-70' : 'bg-white'} hover:shadow-md transition-all">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <span class="text-2xl">☕</span>
                          <h3 class="font-bold text-gray-800">${escapeHtml(schedule.title)}</h3>
                          ${schedule.status === 'cancelled' ? '<span class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">キャンセル</span>' : ''}
                          ${isPast ? '<span class="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">終了</span>' : ''}
                        </div>
                        <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span><i class="fas fa-calendar-day text-amber-500 mr-1"></i>${formatDate(schedule.date)}</span>
                          <span><i class="fas fa-clock text-amber-500 mr-1"></i>${schedule.start_time} 〜 ${schedule.end_time}</span>
                          <span><i class="fas fa-users text-amber-500 mr-1"></i>${schedule.enrolled}/${schedule.capacity}名</span>
                          <span><i class="fas fa-yen-sign text-amber-500 mr-1"></i>${schedule.price.toLocaleString()}円</span>
                        </div>
                        ${schedule.description ? `<p class="text-sm text-gray-500 mt-2">${escapeHtml(schedule.description)}</p>` : ''}
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="px-3 py-1 rounded-full text-sm font-medium ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">
                          ${isFull ? '満席' : `残り${remaining}席`}
                        </span>
                        <button onclick="editSchedule('${schedule.id}')" class="p-2 text-gray-400 hover:text-amber-500 transition-colors">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteSchedule('${schedule.id}')" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          `}
        </div>

        <!-- 予約一覧 -->
        <div id="panel-bookings" class="tab-panel p-6 hidden">
          <!-- 日程フィルター -->
          <div class="mb-6 flex flex-wrap items-center gap-3">
            <label class="text-sm font-medium text-gray-600"><i class="fas fa-filter mr-1"></i>日程で絞り込み:</label>
            <select id="schedule-filter" onchange="filterBookings()" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm">
              <option value="">すべての日程</option>
              ${schedules.map(s => `<option value="${s.id}">${s.date} ${s.start_time}〜${s.end_time}</option>`).join('')}
            </select>
            <span id="booking-count" class="text-sm text-gray-500 ml-auto"></span>
          </div>
          
          ${bookings.length === 0 ? `
            <div class="text-center py-12">
              <i class="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">まだ予約がありません</p>
            </div>
          ` : `
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b">
                    <th class="text-left py-3 px-4 font-medium text-gray-600">予約者</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-600">日程</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-600">ステータス</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-600">決済</th>
                    <th class="text-left py-3 px-4 font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody id="bookings-tbody">
                  ${bookings.map(booking => `
                    <tr class="border-b hover:bg-gray-50 booking-row" data-schedule-id="${booking.workspace_schedule_id}">
                      <td class="py-3 px-4">
                        <div class="font-medium text-gray-800">${escapeHtml(booking.customer_name)}</div>
                        <div class="text-sm text-gray-500">${escapeHtml(booking.customer_email)}</div>
                      </td>
                      <td class="py-3 px-4">
                        <div class="text-sm">${formatDate(booking.schedule_date || '')}</div>
                        <div class="text-xs text-gray-500">${booking.schedule_time || ''}</div>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }">${
                          booking.status === 'confirmed' ? '確定' :
                          booking.status === 'cancelled' ? 'キャンセル' :
                          booking.status === 'completed' ? '完了' : '保留'
                        }</span>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${
                          booking.payment_status === 'paid' ? 'bg-blue-100 text-blue-600' :
                          booking.payment_status === 'refunded' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-gray-100 text-gray-600'
                        }">${
                          booking.payment_status === 'paid' ? '支払済' :
                          booking.payment_status === 'refunded' ? '返金済' : '未払い'
                        }</span>
                      </td>
                      <td class="py-3 px-4">
                        <button onclick="viewBooking(${booking.id})" class="text-amber-500 hover:text-amber-600">
                          <i class="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div id="no-results" class="text-center py-12 hidden">
              <i class="fas fa-search text-4xl text-gray-300 mb-3"></i>
              <p class="text-gray-500">選択した日程の予約はありません</p>
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- スケジュール追加/編集モーダル -->
    <div id="schedule-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b">
          <h2 id="modal-title" class="text-xl font-bold text-gray-800">新しいスケジュールを追加</h2>
        </div>
        <form id="schedule-form" class="p-6 space-y-4">
          <input type="hidden" id="schedule-id" value="">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input type="text" id="schedule-title" value="mirAIcafe ワークスペース" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea id="schedule-description" rows="2" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="みんなでAIツールを触る朝活タイム"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">日付</label>
              <input type="date" id="schedule-date" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">定員</label>
              <input type="number" id="schedule-capacity" value="6" min="1" max="20" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">開始時間</label>
              <input type="time" id="schedule-start" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">終了時間</label>
              <input type="time" id="schedule-end" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">料金（円）</label>
            <input type="number" id="schedule-price" value="500" min="0" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meet URL（任意）</label>
            <input type="url" id="schedule-meet-url" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500" placeholder="https://meet.google.com/xxx-xxxx-xxx">
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="button" onclick="closeScheduleModal()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              キャンセル
            </button>
            <button type="submit" class="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      const schedulesData = ${JSON.stringify(schedules)};
      
      function showTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
          btn.classList.remove('active', 'border-amber-500', 'text-amber-600');
          btn.classList.add('border-transparent', 'text-gray-500');
        });
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.add('hidden'));
        
        document.getElementById('tab-' + tabName).classList.add('active', 'border-amber-500', 'text-amber-600');
        document.getElementById('tab-' + tabName).classList.remove('border-transparent', 'text-gray-500');
        document.getElementById('panel-' + tabName).classList.remove('hidden');
      }
      
      function openScheduleModal(scheduleId = null) {
        const modal = document.getElementById('schedule-modal');
        const title = document.getElementById('modal-title');
        
        if (scheduleId) {
          const schedule = schedulesData.find(s => s.id === scheduleId);
          if (schedule) {
            title.textContent = 'スケジュールを編集';
            document.getElementById('schedule-id').value = schedule.id;
            document.getElementById('schedule-title').value = schedule.title;
            document.getElementById('schedule-description').value = schedule.description || '';
            document.getElementById('schedule-date').value = schedule.date;
            document.getElementById('schedule-capacity').value = schedule.capacity;
            document.getElementById('schedule-start').value = schedule.start_time;
            document.getElementById('schedule-end').value = schedule.end_time;
            document.getElementById('schedule-price').value = schedule.price;
            document.getElementById('schedule-meet-url').value = schedule.meet_url || '';
          }
        } else {
          title.textContent = '新しいスケジュールを追加';
          document.getElementById('schedule-form').reset();
          document.getElementById('schedule-id').value = '';
          document.getElementById('schedule-title').value = 'mirAIcafe ワークスペース';
          document.getElementById('schedule-capacity').value = '6';
          document.getElementById('schedule-price').value = '500';
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      
      function closeScheduleModal() {
        const modal = document.getElementById('schedule-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      
      // 予約フィルター機能
      function filterBookings() {
        const filterValue = document.getElementById('schedule-filter').value;
        const rows = document.querySelectorAll('.booking-row');
        const noResults = document.getElementById('no-results');
        const countEl = document.getElementById('booking-count');
        let visibleCount = 0;
        
        rows.forEach(row => {
          const scheduleId = row.getAttribute('data-schedule-id');
          if (!filterValue || scheduleId === filterValue) {
            row.style.display = '';
            visibleCount++;
          } else {
            row.style.display = 'none';
          }
        });
        
        // 結果なしメッセージの表示/非表示
        if (noResults) {
          if (visibleCount === 0 && rows.length > 0) {
            noResults.classList.remove('hidden');
          } else {
            noResults.classList.add('hidden');
          }
        }
        
        // 件数表示
        if (countEl) {
          countEl.textContent = filterValue ? visibleCount + '件表示中' : '全' + rows.length + '件';
        }
      }
      
      // 初期表示時にカウント更新
      document.addEventListener('DOMContentLoaded', function() {
        filterBookings();
      });
      
      function editSchedule(id) {
        openScheduleModal(id);
      }
      
      async function deleteSchedule(id) {
        if (!confirm('このスケジュールを削除しますか？')) return;
        
        try {
          const res = await fetch('/admin/api/workspace/schedules/' + id, { method: 'DELETE' });
          if (res.ok) {
            location.reload();
          } else {
            alert('削除に失敗しました');
          }
        } catch (e) {
          alert('エラーが発生しました');
        }
      }
      
      document.getElementById('schedule-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('schedule-id').value;
        const data = {
          title: document.getElementById('schedule-title').value,
          description: document.getElementById('schedule-description').value,
          date: document.getElementById('schedule-date').value,
          capacity: parseInt(document.getElementById('schedule-capacity').value),
          start_time: document.getElementById('schedule-start').value,
          end_time: document.getElementById('schedule-end').value,
          price: parseInt(document.getElementById('schedule-price').value),
          meet_url: document.getElementById('schedule-meet-url').value
        };
        
        try {
          const url = id ? '/admin/api/workspace/schedules/' + id : '/admin/api/workspace/schedules';
          const method = id ? 'PUT' : 'POST';
          
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (res.ok) {
            location.reload();
          } else {
            const err = await res.json();
            alert(err.error || '保存に失敗しました');
          }
        } catch (e) {
          alert('エラーが発生しました');
        }
      });
      
      function viewBooking(id) {
        alert('予約詳細: ID ' + id);
      }
      
      // モーダル外クリックで閉じる
      document.getElementById('schedule-modal').addEventListener('click', function(e) {
        if (e.target === this) closeScheduleModal();
      });
    </script>
  `

  return renderAdminLayout('ワークスペース管理', content, 'workspace')
}
