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
  source: string | null  // 流入サイト（mirAIcafe / こくちーず / Peatix / その他）
  created_at: string
  updated_at: string
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
    // 明示的にJST（日本標準時）で表示
    return date.toLocaleString('ja-JP', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Tokyo'
    })
  } catch {
    return dateStr
  }
}

// 講座の型定義
interface Course {
  id: string
  title: string
}

// 予約一覧ページ（API動的読み込み版）
export function renderBookingsList(bookings: Booking[], currentTab: string = 'all', courses: Course[] = []): string {
  // 初期データをJSONとして埋め込む
  const initialData = JSON.stringify(bookings)
  const coursesData = JSON.stringify(courses)

  const content = `
    <div class="bookings-container">
      <!-- ヘッダー -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i class="fas fa-calendar-check text-indigo-500"></i>
            予約管理
          </h1>
          <p class="text-slate-500 mt-1">講座予約の確認・管理</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button onclick="openCsvImportModal()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <i class="fas fa-file-csv"></i>
            <span>CSVインポート</span>
          </button>
          <button onclick="openManualBookingModal()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2">
            <i class="fas fa-plus"></i>
            <span>手入力</span>
          </button>
          <button onclick="exportBookings()" class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition flex items-center gap-2">
            <i class="fas fa-download"></i>
            <span>エクスポート</span>
          </button>
        </div>
      </div>

      <!-- タブ -->
      <div class="tabs flex gap-2 mb-5 border-b-2 border-slate-200">
        <button class="tab active" data-status="all">
          すべて <span class="badge" id="count-all">0</span>
        </button>
        <button class="tab" data-status="pending">
          新規 <span class="badge badge-pending" id="count-pending">0</span>
        </button>
        <button class="tab" data-status="confirmed">
          確定済み <span class="badge badge-confirmed" id="count-confirmed">0</span>
        </button>
        <button class="tab" data-status="completed">
          完了 <span class="badge badge-completed" id="count-completed">0</span>
        </button>
        <button class="tab" data-status="cancelled">
          キャンセル <span class="badge badge-cancelled" id="count-cancelled">0</span>
        </button>
      </div>

      <!-- 検索・フィルター -->
      <div class="search-bar flex gap-3 mb-5">
        <input 
          type="text" 
          class="search-input flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
          placeholder="🔍 予約者名、メール、講座名で検索..."
          id="search-input"
        />
        <select class="filter-select px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[150px]" id="course-filter">
          <option value="">すべての講座</option>
        </select>
        <select class="filter-select px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[150px]" id="date-filter">
          <option value="">すべての期間</option>
          <option value="today">今日</option>
          <option value="week">今週</option>
          <option value="month">今月</option>
        </select>
      </div>

      <!-- 予約一覧テーブル -->
      <div class="bookings-table bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <table class="w-full">
          <thead class="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th class="px-4 py-4 text-left font-bold text-slate-700">予約ID</th>
              <th class="px-4 py-4 text-left font-bold text-slate-700">講座名</th>
              <th class="px-4 py-4 text-left font-bold text-slate-700">予約者</th>
              <th class="px-4 py-4 text-left font-bold text-slate-700 hidden md:table-cell">連絡先</th>
              <th class="px-4 py-4 text-left font-bold text-slate-700 hidden lg:table-cell">希望日時</th>
              <th class="px-4 py-4 text-left font-bold text-slate-700 hidden md:table-cell">金額</th>
              <th class="px-4 py-4 text-center font-bold text-slate-700 hidden sm:table-cell">流入</th>
              <th class="px-4 py-4 text-center font-bold text-slate-700">ステータス</th>
              <th class="px-4 py-4 text-left font-bold text-slate-700 hidden lg:table-cell">予約日</th>
              <th class="px-4 py-4 text-center font-bold text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody id="bookings-tbody" class="divide-y divide-slate-100">
            <!-- 動的に生成 -->
          </tbody>
        </table>
        
        <!-- 空状態 -->
        <div id="empty-state" class="hidden p-12 text-center">
          <i class="fas fa-calendar-times text-slate-300 text-5xl mb-4"></i>
          <p class="text-slate-500">該当する予約がありません</p>
        </div>
      </div>
    </div>

    <!-- 手入力モーダル -->
    <div id="manual-booking-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4" onclick="if(event.target === this) closeManualBookingModal()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
            <i class="fas fa-plus-circle text-indigo-500"></i>
            予約を手入力で追加
          </h3>
          <button onclick="closeManualBookingModal()" class="text-slate-400 hover:text-slate-600 transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <form id="manual-booking-form" class="p-6 space-y-4">
          <!-- 申込元 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              申込元 <span class="text-red-500">*</span>
            </label>
            <select id="mb-source" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">選択してください</option>
              <option value="こくちーず">こくちーず</option>
              <option value="Peatix">Peatix</option>
              <option value="直接申込">直接申込（メール等）</option>
              <option value="その他">その他</option>
            </select>
          </div>
          
          <!-- 講座選択 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              講座 <span class="text-red-500">*</span>
            </label>
            <select id="mb-course" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">選択してください</option>
            </select>
          </div>
          
          <!-- 予約者名 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              予約者名 <span class="text-red-500">*</span>
            </label>
            <input type="text" id="mb-name" required
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="山田 太郎">
          </div>
          
          <!-- メールアドレス -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              メールアドレス <span class="text-red-500">*</span>
            </label>
            <input type="email" id="mb-email" required
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="example@email.com">
          </div>
          
          <!-- 電話番号 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              電話番号 <span class="text-slate-400 text-xs">（任意）</span>
            </label>
            <input type="tel" id="mb-phone"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="090-1234-5678">
          </div>
          
          <!-- 受講日 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              受講日 <span class="text-slate-400 text-xs">（任意）</span>
            </label>
            <input type="date" id="mb-date"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          
          <!-- 金額 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              金額 <span class="text-slate-400 text-xs">（任意・0で無料）</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
              <input type="number" id="mb-amount" value="0" min="0"
                class="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0">
            </div>
          </div>
          
          <!-- 支払い状態 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              支払い状態
            </label>
            <select id="mb-payment-status" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="paid">支払い済み</option>
              <option value="unpaid">未払い</option>
            </select>
          </div>
          
          <!-- 備考 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              備考・メモ <span class="text-slate-400 text-xs">（任意）</span>
            </label>
            <textarea id="mb-note" rows="3"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="こくちーず申込No.123 など"></textarea>
          </div>
          
          <!-- 送信ボタン -->
          <div class="flex gap-3 pt-4">
            <button type="button" onclick="closeManualBookingModal()" 
              class="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium">
              キャンセル
            </button>
            <button type="submit" id="mb-submit-btn"
              class="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2">
              <i class="fas fa-save"></i>
              登録する
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- CSVインポートモーダル -->
    <div id="csv-import-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4" onclick="if(event.target === this) closeCsvImportModal()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 class="font-bold text-lg text-slate-800 flex items-center gap-2">
            <i class="fas fa-file-csv text-green-500"></i>
            CSVインポート
          </h3>
          <button onclick="closeCsvImportModal()" class="text-slate-400 hover:text-slate-600 transition">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <!-- ステップ1: ファイル選択 -->
          <div id="csv-step1">
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                申込元 <span class="text-red-500">*</span>
              </label>
              <select id="csv-source" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="こくちーず">こくちーず</option>
                <option value="Peatix">Peatix</option>
                <option value="その他">その他</option>
              </select>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                登録先の講座 <span class="text-red-500">*</span>
              </label>
              <select id="csv-course" class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <option value="">選択してください</option>
              </select>
            </div>
            
            <div class="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-green-400 transition cursor-pointer" id="csv-dropzone">
              <input type="file" id="csv-file-input" accept=".csv" class="hidden">
              <i class="fas fa-cloud-upload-alt text-4xl text-slate-300 mb-3"></i>
              <p class="text-slate-600 font-medium">CSVファイルをドラッグ&ドロップ</p>
              <p class="text-slate-400 text-sm mt-1">または<span class="text-green-600 underline">クリックして選択</span></p>
              <p class="text-slate-400 text-xs mt-3">こくちーず・Peatixからエクスポートしたファイルに対応</p>
            </div>
            
            <div id="csv-file-info" class="hidden mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <i class="fas fa-file-csv text-green-500 text-xl"></i>
              <div class="flex-1">
                <p class="font-medium text-green-800" id="csv-file-name"></p>
                <p class="text-sm text-green-600" id="csv-file-size"></p>
              </div>
              <button onclick="clearCsvFile()" class="text-slate-400 hover:text-red-500">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <button onclick="parseCsvFile()" id="csv-parse-btn" disabled
              class="w-full mt-4 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg transition font-medium flex items-center justify-center gap-2">
              <i class="fas fa-arrow-right"></i>
              次へ：列のマッピング
            </button>
          </div>
          
          <!-- ステップ2: 列マッピング -->
          <div id="csv-step2" class="hidden">
            <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p class="text-sm text-blue-800">
                <i class="fas fa-info-circle mr-1"></i>
                CSVの列を予約データの項目に紐付けてください
              </p>
            </div>
            
            <div class="space-y-3" id="csv-mapping-fields">
              <!-- 動的に生成 -->
            </div>
            
            <div class="flex gap-3 mt-6">
              <button onclick="backToStep1()" class="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium">
                <i class="fas fa-arrow-left mr-1"></i> 戻る
              </button>
              <button onclick="previewCsvData()" class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">
                次へ：プレビュー <i class="fas fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>
          
          <!-- ステップ3: プレビュー -->
          <div id="csv-step3" class="hidden">
            <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-800">
                <i class="fas fa-check-circle mr-1"></i>
                <span id="csv-preview-count">0</span>件のデータをインポートします
              </p>
            </div>
            
            <div class="overflow-x-auto border rounded-lg max-h-64">
              <table class="w-full text-sm">
                <thead class="bg-slate-50 sticky top-0">
                  <tr id="csv-preview-header">
                    <!-- 動的に生成 -->
                  </tr>
                </thead>
                <tbody id="csv-preview-body" class="divide-y">
                  <!-- 動的に生成 -->
                </tbody>
              </table>
            </div>
            
            <div class="flex gap-3 mt-6">
              <button onclick="backToStep2()" class="flex-1 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition font-medium">
                <i class="fas fa-arrow-left mr-1"></i> 戻る
              </button>
              <button onclick="importCsvData()" id="csv-import-btn" class="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2">
                <i class="fas fa-upload"></i>
                インポート実行
              </button>
            </div>
          </div>
          
          <!-- 完了 -->
          <div id="csv-step4" class="hidden text-center py-8">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-check text-green-500 text-2xl"></i>
            </div>
            <h4 class="text-xl font-bold text-slate-800 mb-2">インポート完了！</h4>
            <p class="text-slate-600 mb-6"><span id="csv-imported-count">0</span>件の予約を登録しました</p>
            <button onclick="closeCsvImportModal(); location.reload();" class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .bookings-container {
        max-width: 1400px;
        margin: 0 auto;
      }
      
      .tabs {
        display: flex;
        gap: 8px;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 0;
      }
      
      .tab {
        padding: 12px 20px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #64748b;
        transition: all 0.2s;
        position: relative;
        border-radius: 8px 8px 0 0;
      }
      
      .tab:hover {
        color: #475569;
        background: #f1f5f9;
      }
      
      .tab.active {
        color: #667eea;
        font-weight: 600;
        background: white;
      }
      
      .tab.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      }
      
      .tab .badge {
        display: inline-block;
        background: #94a3b8;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        margin-left: 6px;
        font-weight: 600;
      }
      
      .tab .badge-pending {
        background: #f59e0b;
      }
      
      .tab .badge-confirmed {
        background: #3b82f6;
      }
      
      .tab .badge-completed {
        background: #10b981;
      }
      
      .tab .badge-cancelled {
        background: #ef4444;
      }
      
      .tab.active .badge {
        background: #667eea;
      }
      
      .bookings-table tr:hover {
        background: #fafbfc;
      }
      
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .status-pending {
        background: #fef3c7;
        color: #92400e;
      }
      
      .status-confirmed {
        background: #dbeafe;
        color: #1e40af;
      }
      
      .status-completed {
        background: #d1fae5;
        color: #065f46;
      }
      
      .status-cancelled {
        background: #fee2e2;
        color: #991b1b;
      }
      
      .action-buttons {
        display: flex;
        gap: 6px;
        justify-content: center;
      }
      
      .btn {
        padding: 6px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
      }
      
      .btn-view {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .btn-confirm {
        background: #10b981;
        color: white;
      }
      
      .btn-cancel {
        background: #ef4444;
        color: white;
      }
      
      .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
    </style>

    <script>
      // 初期データ
      let allBookings = ${initialData};
      const coursesData = ${coursesData};
      let currentStatus = '${currentTab}';
      let searchQuery = '';
      let courseFilter = '';
      let dateFilter = '';

      // ページ読み込み時
      document.addEventListener('DOMContentLoaded', function() {
        // 講座フィルターを設定
        const courseSelect = document.getElementById('course-filter');
        coursesData.forEach(function(course) {
          const option = document.createElement('option');
          option.value = course.id;
          option.textContent = course.title;
          courseSelect.appendChild(option);
        });

        updateCounts();
        renderBookings();
        setupEventListeners();
      });

      // イベントリスナー設定
      function setupEventListeners() {
        // タブ切り替え
        document.querySelectorAll('.tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentStatus = tab.dataset.status;
            renderBookings();
          });
        });

        // 検索
        document.getElementById('search-input').addEventListener('input', function(e) {
          searchQuery = e.target.value.toLowerCase();
          renderBookings();
        });

        // 講座フィルター
        document.getElementById('course-filter').addEventListener('change', function(e) {
          courseFilter = e.target.value;
          renderBookings();
        });

        // 日付フィルター
        document.getElementById('date-filter').addEventListener('change', function(e) {
          dateFilter = e.target.value;
          renderBookings();
        });
      }

      // カウント更新
      function updateCounts() {
        document.getElementById('count-all').textContent = allBookings.length;
        document.getElementById('count-pending').textContent = 
          allBookings.filter(function(b) { return b.status === 'pending'; }).length;
        document.getElementById('count-confirmed').textContent = 
          allBookings.filter(function(b) { return b.status === 'confirmed'; }).length;
        document.getElementById('count-completed').textContent = 
          allBookings.filter(function(b) { return b.status === 'completed'; }).length;
        document.getElementById('count-cancelled').textContent = 
          allBookings.filter(function(b) { return b.status === 'cancelled'; }).length;
      }

      // フィルタリング
      function filterBookings() {
        let filtered = allBookings;

        // ステータスフィルター
        if (currentStatus !== 'all') {
          filtered = filtered.filter(function(b) { return b.status === currentStatus; });
        }

        // 検索フィルター
        if (searchQuery) {
          filtered = filtered.filter(function(b) {
            return (b.customer_name && b.customer_name.toLowerCase().includes(searchQuery)) ||
                   (b.customer_email && b.customer_email.toLowerCase().includes(searchQuery)) ||
                   (b.course_name && b.course_name.toLowerCase().includes(searchQuery));
          });
        }

        // 講座フィルター
        if (courseFilter) {
          filtered = filtered.filter(function(b) { return b.course_id === courseFilter; });
        }

        // 日付フィルター
        if (dateFilter) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          filtered = filtered.filter(function(b) {
            if (!b.created_at) return false;
            const bookingDate = new Date(b.created_at);
            
            if (dateFilter === 'today') {
              return bookingDate >= today;
            } else if (dateFilter === 'week') {
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return bookingDate >= weekAgo;
            } else if (dateFilter === 'month') {
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return bookingDate >= monthAgo;
            }
            return true;
          });
        }

        return filtered;
      }

      // 予約一覧を描画
      function renderBookings() {
        const filtered = filterBookings();
        const tbody = document.getElementById('bookings-tbody');
        const emptyState = document.getElementById('empty-state');

        if (filtered.length === 0) {
          tbody.innerHTML = '';
          emptyState.classList.remove('hidden');
          return;
        }

        emptyState.classList.add('hidden');
        tbody.innerHTML = filtered.map(function(booking) {
          return '<tr class="hover:bg-slate-50">' +
            '<td class="px-4 py-4 font-medium text-slate-600">#' + booking.id + '</td>' +
            '<td class="px-4 py-4"><strong class="text-slate-800">' + escapeHtml(booking.course_name || '不明') + '</strong></td>' +
            '<td class="px-4 py-4 text-slate-700">' + escapeHtml(booking.customer_name) + '</td>' +
            '<td class="px-4 py-4 hidden md:table-cell">' +
              '<div class="text-sm text-slate-600">' + escapeHtml(booking.customer_email) + '</div>' +
              '<div class="text-xs text-slate-400">' + escapeHtml(booking.customer_phone || '-') + '</div>' +
            '</td>' +
            '<td class="px-4 py-4 hidden lg:table-cell">' +
              '<div class="text-sm text-slate-700">' + (booking.preferred_date || '-') + '</div>' +
              '<div class="text-xs text-slate-400">' + escapeHtml(booking.preferred_time || '-') + '</div>' +
            '</td>' +
            '<td class="px-4 py-4 hidden md:table-cell text-slate-700">¥' + (booking.amount || 0).toLocaleString() + '</td>' +
            '<td class="px-4 py-4 text-center hidden sm:table-cell">' + getSourceBadge(booking.source) + '</td>' +
            '<td class="px-4 py-4 text-center">' +
              '<span class="status-badge status-' + booking.status + '">' +
                '<i class="fas ' + getStatusIcon(booking.status) + '"></i>' +
                getStatusLabel(booking.status) +
              '</span>' +
            '</td>' +
            '<td class="px-4 py-4 hidden lg:table-cell text-sm text-slate-500">' + formatDate(booking.created_at) + '</td>' +
            '<td class="px-4 py-4">' +
              '<div class="action-buttons">' +
                '<button class="btn btn-view" onclick="viewBooking(' + booking.id + ')">詳細</button>' +
                (booking.status === 'pending' ? 
                  '<button class="btn btn-confirm" onclick="updateStatus(' + booking.id + ', \\'confirmed\\')">確定</button>' : '') +
                (booking.status !== 'cancelled' && booking.status !== 'completed' ? 
                  '<button class="btn btn-cancel" onclick="updateStatus(' + booking.id + ', \\'cancelled\\')">キャンセル</button>' : '') +
              '</div>' +
            '</td>' +
          '</tr>';
        }).join('');
      }

      // ステータス更新
      async function updateStatus(id, status) {
        if (!confirm('この予約を「' + getStatusLabel(status) + '」に変更しますか？')) return;

        try {
          const res = await fetch('/admin/api/bookings/' + id + '/status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: status })
          });

          if (res.ok) {
            // ローカルデータを更新
            const booking = allBookings.find(function(b) { return b.id === id; });
            if (booking) {
              booking.status = status;
              booking.updated_at = new Date().toISOString();
            }
            updateCounts();
            renderBookings();
            showToast('ステータスを更新しました', 'success');
          } else {
            showToast('更新に失敗しました', 'error');
          }
        } catch (error) {
          showToast('エラーが発生しました', 'error');
        }
      }

      // 詳細表示
      function viewBooking(id) {
        window.location.href = '/admin/bookings/' + id;
      }

      // エクスポート
      function exportBookings() {
        window.location.href = '/admin/bookings/export';
      }

      // ヘルパー関数
      function getStatusLabel(status) {
        var labels = {
          pending: '新規',
          confirmed: '確定済み',
          completed: '完了',
          cancelled: 'キャンセル'
        };
        return labels[status] || status;
      }

      function getStatusIcon(status) {
        var icons = {
          pending: 'fa-clock',
          confirmed: 'fa-check-circle',
          completed: 'fa-check-double',
          cancelled: 'fa-times-circle'
        };
        return icons[status] || 'fa-question';
      }
      
      function getSourceBadge(source) {
        if (!source) return '<span class="text-slate-300">-</span>';
        var config = {
          'mirAIcafe': { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: 'fa-home', label: 'mirAI' },
          'こくちーず': { bg: 'bg-green-100', text: 'text-green-700', icon: 'fa-users', label: 'こくち' },
          'Peatix': { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'fa-ticket-alt', label: 'Peatix' }
        };
        var c = config[source] || { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'fa-globe', label: source.substring(0, 4) };
        return '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ' + c.bg + ' ' + c.text + '">' +
          '<i class="fas ' + c.icon + '"></i>' + c.label + '</span>';
      }

      function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
          var date = new Date(dateStr);
          return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Tokyo'
          });
        } catch (e) {
          return dateStr;
        }
      }

      function escapeHtml(text) {
        if (!text) return '';
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function showToast(message, type) {
        var toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ' + 
          (type === 'success' ? 'bg-green-500' : 'bg-red-500') + ' text-white';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 3000);
      }

      // ===== 手入力モーダル =====
      var manualBookingModal = document.getElementById('manual-booking-modal');
      var manualBookingForm = document.getElementById('manual-booking-form');
      var mbCourseSelect = document.getElementById('mb-course');
      
      // モーダルを開く
      window.openManualBookingModal = function() {
        // 講座リストを設定
        mbCourseSelect.innerHTML = '<option value="">選択してください</option>';
        coursesData.forEach(function(course) {
          var option = document.createElement('option');
          option.value = course.id;
          option.textContent = course.title;
          mbCourseSelect.appendChild(option);
        });
        
        manualBookingModal.classList.remove('hidden');
        manualBookingModal.classList.add('flex');
      };
      
      // モーダルを閉じる
      window.closeManualBookingModal = function() {
        manualBookingModal.classList.add('hidden');
        manualBookingModal.classList.remove('flex');
        manualBookingForm.reset();
      };
      
      // フォーム送信
      manualBookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        var submitBtn = document.getElementById('mb-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登録中...';
        
        var courseId = document.getElementById('mb-course').value;
        var courseOption = mbCourseSelect.querySelector('option[value="' + courseId + '"]');
        var courseName = courseOption ? courseOption.textContent : '';
        
        var data = {
          source: document.getElementById('mb-source').value,
          course_id: courseId,
          course_name: courseName,
          customer_name: document.getElementById('mb-name').value,
          customer_email: document.getElementById('mb-email').value,
          customer_phone: document.getElementById('mb-phone').value || null,
          preferred_date: document.getElementById('mb-date').value || null,
          amount: parseInt(document.getElementById('mb-amount').value) || 0,
          payment_status: document.getElementById('mb-payment-status').value,
          admin_note: document.getElementById('mb-note').value || null
        };
        
        try {
          var res = await fetch('/admin/api/bookings/manual', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          var result = await res.json();
          
          if (result.success) {
            showToast('予約を登録しました', 'success');
            closeManualBookingModal();
            // ページをリロードして新しい予約を表示
            setTimeout(function() { location.reload(); }, 500);
          } else {
            showToast(result.error || '登録に失敗しました', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('登録に失敗しました', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-save"></i> 登録する';
        }
      });
      
      // ===== CSVインポート機能 =====
      var csvImportModal = document.getElementById('csv-import-modal');
      var csvFileInput = document.getElementById('csv-file-input');
      var csvDropzone = document.getElementById('csv-dropzone');
      var csvFileInfo = document.getElementById('csv-file-info');
      var csvParseBtn = document.getElementById('csv-parse-btn');
      var csvCourseSelect = document.getElementById('csv-course');
      
      // CSVデータ格納用
      var csvHeaders = [];
      var csvRows = [];
      var columnMapping = {};
      
      // モーダルを開く
      window.openCsvImportModal = function() {
        // 講座リストを設定
        csvCourseSelect.innerHTML = '<option value="">選択してください</option>';
        coursesData.forEach(function(course) {
          var option = document.createElement('option');
          option.value = course.id;
          option.textContent = course.title;
          csvCourseSelect.appendChild(option);
        });
        
        resetCsvImport();
        csvImportModal.classList.remove('hidden');
        csvImportModal.classList.add('flex');
      };
      
      // モーダルを閉じる
      window.closeCsvImportModal = function() {
        csvImportModal.classList.add('hidden');
        csvImportModal.classList.remove('flex');
        resetCsvImport();
      };
      
      // リセット
      function resetCsvImport() {
        document.getElementById('csv-step1').classList.remove('hidden');
        document.getElementById('csv-step2').classList.add('hidden');
        document.getElementById('csv-step3').classList.add('hidden');
        document.getElementById('csv-step4').classList.add('hidden');
        csvFileInfo.classList.add('hidden');
        csvParseBtn.disabled = true;
        csvFileInput.value = '';
        csvHeaders = [];
        csvRows = [];
        columnMapping = {};
      }
      
      // ファイル選択
      csvDropzone.addEventListener('click', function() {
        csvFileInput.click();
      });
      
      csvDropzone.addEventListener('dragover', function(e) {
        e.preventDefault();
        csvDropzone.classList.add('border-green-400', 'bg-green-50');
      });
      
      csvDropzone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        csvDropzone.classList.remove('border-green-400', 'bg-green-50');
      });
      
      csvDropzone.addEventListener('drop', function(e) {
        e.preventDefault();
        csvDropzone.classList.remove('border-green-400', 'bg-green-50');
        if (e.dataTransfer.files.length > 0) {
          handleCsvFile(e.dataTransfer.files[0]);
        }
      });
      
      csvFileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
          handleCsvFile(e.target.files[0]);
        }
      });
      
      function handleCsvFile(file) {
        if (!file.name.endsWith('.csv')) {
          showToast('CSVファイルを選択してください', 'error');
          return;
        }
        
        document.getElementById('csv-file-name').textContent = file.name;
        document.getElementById('csv-file-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
        csvFileInfo.classList.remove('hidden');
        csvParseBtn.disabled = false;
        
        // ファイルを読み込む
        var reader = new FileReader();
        reader.onload = function(e) {
          parseCSV(e.target.result);
        };
        reader.readAsText(file, 'UTF-8');
      }
      
      window.clearCsvFile = function() {
        csvFileInput.value = '';
        csvFileInfo.classList.add('hidden');
        csvParseBtn.disabled = true;
        csvHeaders = [];
        csvRows = [];
      };
      
      // CSVパース
      function parseCSV(text) {
        var lines = text.split(/\\r?\\n/).filter(function(line) { return line.trim(); });
        if (lines.length < 2) {
          showToast('CSVにデータがありません', 'error');
          return;
        }
        
        // ヘッダー取得（カンマまたはタブ区切りを自動検出）
        var delimiter = lines[0].includes('\\t') ? '\\t' : ',';
        csvHeaders = parseCSVLine(lines[0], delimiter);
        
        // データ行を取得
        csvRows = [];
        for (var i = 1; i < lines.length; i++) {
          var row = parseCSVLine(lines[i], delimiter);
          if (row.length === csvHeaders.length) {
            csvRows.push(row);
          }
        }
        
        console.log('CSVパース完了:', csvHeaders.length + '列, ' + csvRows.length + '行');
      }
      
      // CSV行をパース（引用符対応）
      function parseCSVLine(line, delimiter) {
        var result = [];
        var current = '';
        var inQuotes = false;
        
        for (var i = 0; i < line.length; i++) {
          var char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if ((char === ',' || char === '\\t') && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        
        return result;
      }
      
      // ステップ2へ
      window.parseCsvFile = function() {
        if (csvHeaders.length === 0) {
          showToast('CSVファイルを読み込んでください', 'error');
          return;
        }
        
        if (!csvCourseSelect.value) {
          showToast('講座を選択してください', 'error');
          return;
        }
        
        document.getElementById('csv-step1').classList.add('hidden');
        document.getElementById('csv-step2').classList.remove('hidden');
        
        // マッピングフィールドを生成
        var mappingFields = document.getElementById('csv-mapping-fields');
        var targetFields = [
          { key: 'name', label: '予約者名', required: true, keywords: ['名前', '氏名', 'お名前', 'name', 'Name', '参加者', 'ニックネーム'] },
          { key: 'email', label: 'メールアドレス', required: true, keywords: ['メール', 'email', 'mail', 'Email', 'E-mail', 'Eメール', 'メールアドレス'] },
          { key: 'phone', label: '電話番号', required: false, keywords: ['電話', 'tel', 'phone', 'Tel', '携帯'] },
          { key: 'date', label: '申込日/受講日', required: false, keywords: ['日付', '日時', '申込日', '注文日', 'date', 'Date', '申込み日'] },
          { key: 'amount', label: '金額', required: false, keywords: ['金額', '価格', '料金', '合計', 'price', 'amount', '単価'] },
          { key: 'ticket', label: 'チケット情報', required: false, keywords: ['チケット', 'ticket', 'Ticket', 'チケット名', 'チケット種類'] },
          { key: 'note', label: '備考/その他', required: false, keywords: ['備考', 'メモ', 'note', 'アンケート', '回答'] }
        ];
        
        mappingFields.innerHTML = targetFields.map(function(field) {
          // 自動マッピング候補を探す
          var autoMatch = '';
          for (var i = 0; i < csvHeaders.length; i++) {
            var header = csvHeaders[i].toLowerCase();
            for (var j = 0; j < field.keywords.length; j++) {
              if (header.includes(field.keywords[j].toLowerCase())) {
                autoMatch = i.toString();
                break;
              }
            }
            if (autoMatch) break;
          }
          
          return '<div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">' +
            '<div class="w-32 flex-shrink-0">' +
              '<span class="font-medium text-slate-700">' + field.label + '</span>' +
              (field.required ? '<span class="text-red-500 ml-1">*</span>' : '') +
            '</div>' +
            '<i class="fas fa-arrow-right text-slate-300"></i>' +
            '<select class="flex-1 px-3 py-2 border border-slate-300 rounded-lg" data-target="' + field.key + '">' +
              '<option value="">-- 対応なし --</option>' +
              csvHeaders.map(function(h, idx) {
                return '<option value="' + idx + '"' + (autoMatch === idx.toString() ? ' selected' : '') + '>' + escapeHtml(h) + '</option>';
              }).join('') +
            '</select>' +
          '</div>';
        }).join('');
      };
      
      window.backToStep1 = function() {
        document.getElementById('csv-step1').classList.remove('hidden');
        document.getElementById('csv-step2').classList.add('hidden');
      };
      
      // ステップ3へ（プレビュー）
      window.previewCsvData = function() {
        // マッピングを収集
        columnMapping = {};
        var mappingSelects = document.querySelectorAll('#csv-mapping-fields select');
        mappingSelects.forEach(function(select) {
          var target = select.dataset.target;
          var value = select.value;
          if (value !== '') {
            columnMapping[target] = parseInt(value);
          }
        });
        
        // 必須フィールドチェック
        if (columnMapping.name === undefined || columnMapping.email === undefined) {
          showToast('予約者名とメールアドレスは必須です', 'error');
          return;
        }
        
        document.getElementById('csv-step2').classList.add('hidden');
        document.getElementById('csv-step3').classList.remove('hidden');
        
        // プレビュー表示
        document.getElementById('csv-preview-count').textContent = csvRows.length;
        
        var previewHeader = document.getElementById('csv-preview-header');
        previewHeader.innerHTML = '<th class="px-3 py-2 text-left">予約者名</th>' +
          '<th class="px-3 py-2 text-left">メール</th>' +
          '<th class="px-3 py-2 text-left">電話</th>' +
          '<th class="px-3 py-2 text-left">日付</th>' +
          '<th class="px-3 py-2 text-left">金額</th>';
        
        var previewBody = document.getElementById('csv-preview-body');
        previewBody.innerHTML = csvRows.slice(0, 10).map(function(row) {
          return '<tr class="border-b">' +
            '<td class="px-3 py-2">' + escapeHtml(row[columnMapping.name] || '-') + '</td>' +
            '<td class="px-3 py-2">' + escapeHtml(row[columnMapping.email] || '-') + '</td>' +
            '<td class="px-3 py-2">' + escapeHtml(columnMapping.phone !== undefined ? row[columnMapping.phone] : '-') + '</td>' +
            '<td class="px-3 py-2">' + escapeHtml(columnMapping.date !== undefined ? row[columnMapping.date] : '-') + '</td>' +
            '<td class="px-3 py-2">' + escapeHtml(columnMapping.amount !== undefined ? row[columnMapping.amount] : '-') + '</td>' +
          '</tr>';
        }).join('');
        
        if (csvRows.length > 10) {
          previewBody.innerHTML += '<tr><td colspan="5" class="px-3 py-2 text-center text-slate-400">...他 ' + (csvRows.length - 10) + '件</td></tr>';
        }
      };
      
      window.backToStep2 = function() {
        document.getElementById('csv-step2').classList.remove('hidden');
        document.getElementById('csv-step3').classList.add('hidden');
      };
      
      // インポート実行
      window.importCsvData = async function() {
        var importBtn = document.getElementById('csv-import-btn');
        importBtn.disabled = true;
        importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> インポート中...';
        
        var source = document.getElementById('csv-source').value;
        var courseId = csvCourseSelect.value;
        var courseOption = csvCourseSelect.querySelector('option[value="' + courseId + '"]');
        var courseName = courseOption ? courseOption.textContent : '';
        
        // インポートデータを構築
        var importData = csvRows.map(function(row) {
          return {
            source: source,
            course_id: courseId,
            course_name: courseName,
            customer_name: row[columnMapping.name] || '',
            customer_email: row[columnMapping.email] || '',
            customer_phone: columnMapping.phone !== undefined ? row[columnMapping.phone] : null,
            preferred_date: columnMapping.date !== undefined ? row[columnMapping.date] : null,
            amount: columnMapping.amount !== undefined ? parseInt(row[columnMapping.amount].replace(/[^0-9]/g, '')) || 0 : 0,
            ticket_info: columnMapping.ticket !== undefined ? row[columnMapping.ticket] : null,
            admin_note: columnMapping.note !== undefined ? row[columnMapping.note] : null
          };
        }).filter(function(item) {
          return item.customer_name && item.customer_email;
        });
        
        try {
          var res = await fetch('/admin/api/bookings/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookings: importData })
          });
          
          var result = await res.json();
          
          if (result.success) {
            document.getElementById('csv-step3').classList.add('hidden');
            document.getElementById('csv-step4').classList.remove('hidden');
            document.getElementById('csv-imported-count').textContent = result.count || importData.length;
          } else {
            showToast(result.error || 'インポートに失敗しました', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('インポートに失敗しました', 'error');
        } finally {
          importBtn.disabled = false;
          importBtn.innerHTML = '<i class="fas fa-upload"></i> インポート実行';
        }
      };
    </script>
  `

  return renderAdminLayout('予約管理', content, 'bookings')
}

// 予約詳細ページ
export function renderBookingDetail(booking: Booking): string {
  const statusConfig: Record<string, { label: string; bgColor: string; textColor: string; icon: string }> = {
    pending: { label: '新規', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: 'fa-clock' },
    confirmed: { label: '確定済み', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: 'fa-check-circle' },
    completed: { label: '完了', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: 'fa-check-double' },
    cancelled: { label: 'キャンセル', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: 'fa-times-circle' }
  }

  const paymentStatusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
    unpaid: { label: '未払い', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
    paid: { label: '支払済', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    refunded: { label: '返金済', bgColor: 'bg-orange-100', textColor: 'text-orange-700' }
  }

  const status = statusConfig[booking.status] || statusConfig.pending
  const paymentStatus = paymentStatusConfig[booking.payment_status] || paymentStatusConfig.unpaid

  const content = `
    <div class="max-w-5xl mx-auto">
      <!-- ヘッダー -->
      <div class="mb-6">
        <a href="/admin/bookings" class="text-slate-500 hover:text-slate-700 text-sm mb-2 inline-flex items-center gap-1">
          <i class="fas fa-arrow-left"></i>予約一覧に戻る
        </a>
        <div class="flex items-center justify-between mt-2">
          <div>
            <h1 class="text-2xl font-bold text-slate-800">予約詳細 #${booking.id}</h1>
            <p class="text-slate-500 mt-1">受付日時: ${formatDateTime(booking.created_at)}</p>
          </div>
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.bgColor} ${status.textColor}">
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
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i class="fas fa-user text-blue-500"></i>顧客情報
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-slate-500 mb-1">お名前</p>
                <p class="font-medium text-slate-800">${escapeHtml(booking.customer_name)}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">メールアドレス</p>
                <p class="font-medium">
                  <a href="mailto:${escapeHtml(booking.customer_email)}" class="text-blue-600 hover:underline">
                    ${escapeHtml(booking.customer_email)}
                  </a>
                </p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">電話番号</p>
                <p class="font-medium text-slate-800">${escapeHtml(booking.customer_phone) || '-'}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">流入サイト</p>
                <p class="font-medium">
                  ${booking.source ? `
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      booking.source === 'mirAIcafe' ? 'bg-indigo-100 text-indigo-700' :
                      booking.source === 'こくちーず' ? 'bg-green-100 text-green-700' :
                      booking.source === 'Peatix' ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-700'
                    }">
                      <i class="fas ${
                        booking.source === 'mirAIcafe' ? 'fa-home' :
                        booking.source === 'こくちーず' ? 'fa-users' :
                        booking.source === 'Peatix' ? 'fa-ticket-alt' :
                        'fa-globe'
                      }"></i>
                      ${escapeHtml(booking.source)}
                    </span>
                  ` : '<span class="text-slate-400">-</span>'}
                </p>
              </div>
            </div>
          </div>

          <!-- 講座情報 -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i class="fas fa-book text-green-500"></i>講座情報
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
                <p class="font-bold text-slate-800 text-xl">¥${(booking.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 mb-1">支払い状況</p>
                <span class="inline-flex px-3 py-1 rounded-full text-sm font-medium ${paymentStatus.bgColor} ${paymentStatus.textColor}">
                  ${paymentStatus.label}
                </span>
              </div>
            </div>
            
            <!-- Googleカレンダー追加ボタン -->
            ${booking.preferred_date ? `
              <div class="mt-6 pt-4 border-t border-slate-200">
                <p class="text-sm text-slate-500 mb-3">
                  <i class="fas fa-calendar-plus mr-1"></i>予定をカレンダーに追加
                </p>
                <button onclick="addToGoogleCalendar()" 
                        class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all group">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#fff" stroke="#4285F4" stroke-width="1.5"/>
                    <path d="M16 2v4M8 2v4M3 10h18" stroke="#4285F4" stroke-width="1.5" stroke-linecap="round"/>
                    <rect x="7" y="13" width="4" height="4" rx="0.5" fill="#34A853"/>
                    <rect x="13" y="13" width="4" height="4" rx="0.5" fill="#EA4335"/>
                  </svg>
                  <span class="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">Googleカレンダーに追加</span>
                </button>
              </div>
              <script>
                function addToGoogleCalendar() {
                  const formatDateTime = (date, time) => {
                    const dt = new Date(date + 'T' + (time || '10:00') + ':00+09:00');
                    return dt.toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}/, '');
                  };
                  
                  const date = '${booking.preferred_date || ''}';
                  const time = '${booking.preferred_time || '10:00'}';
                  const endTime = time ? (parseInt(time.split(':')[0]) + 2).toString().padStart(2, '0') + ':00' : '12:00';
                  const courseName = '${escapeHtml(booking.course_name) || '講座'}';
                  const customerName = '${escapeHtml(booking.customer_name)}';
                  
                  const title = '【講座】' + courseName + ' - ' + customerName + '様';
                  const description = 'AI講座\\n\\n講座名: ' + courseName + '\\n受講者: ' + customerName + '\\n日時: ' + date + ' ' + time;
                  
                  const startDT = formatDateTime(date, time);
                  const endDT = formatDateTime(date, endTime);
                  
                  const params = new URLSearchParams({
                    action: 'TEMPLATE',
                    text: title,
                    dates: startDT + '/' + endDT,
                    details: description,
                    location: 'オンライン',
                    trp: 'false'
                  });
                  
                  window.open('https://calendar.google.com/calendar/render?' + params.toString(), '_blank');
                }
              </script>
            ` : ''}
          </div>

          <!-- メッセージ -->
          ${booking.message ? `
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i class="fas fa-comment text-purple-500"></i>お客様からのメッセージ
              </h2>
              <div class="bg-slate-50 rounded-lg p-4">
                <p class="text-slate-700 whitespace-pre-wrap">${escapeHtml(booking.message)}</p>
              </div>
            </div>
          ` : ''}

          <!-- 管理者メモ -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i class="fas fa-sticky-note text-amber-500"></i>管理者メモ
            </h2>
            <form method="POST" action="/admin/bookings/${booking.id}/note">
              <textarea name="admin_note" rows="4" 
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="内部用のメモを入力...">${escapeHtml(booking.admin_note)}</textarea>
              <div class="mt-3 text-right">
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 ml-auto">
                  <i class="fas fa-save"></i>メモを保存
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
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.status === 'pending' ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}">
                <input type="radio" name="status" value="pending" ${booking.status === 'pending' ? 'checked' : ''} class="text-yellow-500">
                <span class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <i class="fas fa-clock text-yellow-600"></i>
                </span>
                <span class="font-medium">新規</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.status === 'confirmed' ? 'ring-2 ring-blue-400 bg-blue-50' : ''}">
                <input type="radio" name="status" value="confirmed" ${booking.status === 'confirmed' ? 'checked' : ''} class="text-blue-500">
                <span class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i class="fas fa-check-circle text-blue-600"></i>
                </span>
                <span class="font-medium">確定済み</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.status === 'completed' ? 'ring-2 ring-green-400 bg-green-50' : ''}">
                <input type="radio" name="status" value="completed" ${booking.status === 'completed' ? 'checked' : ''} class="text-green-500">
                <span class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <i class="fas fa-check-double text-green-600"></i>
                </span>
                <span class="font-medium">完了</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.status === 'cancelled' ? 'ring-2 ring-red-400 bg-red-50' : ''}">
                <input type="radio" name="status" value="cancelled" ${booking.status === 'cancelled' ? 'checked' : ''} class="text-red-500">
                <span class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <i class="fas fa-times-circle text-red-600"></i>
                </span>
                <span class="font-medium">キャンセル</span>
              </label>
              <button type="submit" class="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 rounded-lg transition font-medium mt-4">
                ステータスを更新
              </button>
            </form>
          </div>

          <!-- 支払いステータス -->
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 class="text-lg font-bold text-slate-800 mb-4">支払いステータス</h2>
            <form method="POST" action="/admin/bookings/${booking.id}/payment" class="space-y-3">
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.payment_status === 'unpaid' ? 'ring-2 ring-gray-400 bg-gray-50' : ''}">
                <input type="radio" name="payment_status" value="unpaid" ${booking.payment_status === 'unpaid' ? 'checked' : ''}>
                <span class="font-medium">未払い</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.payment_status === 'paid' ? 'ring-2 ring-green-400 bg-green-50' : ''}">
                <input type="radio" name="payment_status" value="paid" ${booking.payment_status === 'paid' ? 'checked' : ''}>
                <span class="font-medium">支払済</span>
              </label>
              <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition ${booking.payment_status === 'refunded' ? 'ring-2 ring-orange-400 bg-orange-50' : ''}">
                <input type="radio" name="payment_status" value="refunded" ${booking.payment_status === 'refunded' ? 'checked' : ''}>
                <span class="font-medium">返金済</span>
              </label>
              <button type="submit" class="w-full bg-slate-600 hover:bg-slate-700 text-white py-2.5 rounded-lg transition font-medium mt-4">
                支払いステータスを更新
              </button>
            </form>
          </div>

          <!-- 削除 -->
          <div class="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <h2 class="text-lg font-bold text-red-600 mb-4">危険な操作</h2>
            <p class="text-sm text-slate-500 mb-4">この予約を削除すると元に戻せません。</p>
            <form method="POST" action="/admin/bookings/${booking.id}/delete" onsubmit="return confirm('本当に削除しますか？この操作は取り消せません。');">
              <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2">
                <i class="fas fa-trash"></i>予約を削除
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `

  return renderAdminLayout(`予約詳細 #${booking.id}`, content, 'bookings')
}
