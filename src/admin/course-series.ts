// コース（シリーズ）管理画面
import { renderAdminLayout } from './layout'

interface PricingPattern {
  id: string
  name: string
  course_discount_rate: number
  early_bird_discount_rate: number
  early_bird_days: number
  has_monthly_option: number
  tax_rate: number
}

interface CourseSeries {
  id: string
  title: string
  subtitle: string
  description: string
  target_audience: string
  benefits: string
  total_sessions: number
  duration_minutes: number
  base_price_per_session: number
  pricing_pattern_id: string
  calc_single_price_incl: number
  calc_single_total_incl: number
  calc_course_price_incl: number
  calc_early_price_incl: number
  calc_monthly_price_incl: number
  calc_savings_course: number
  calc_savings_early: number
  early_bird_deadline: string
  image: string
  is_featured: number
  status: string
  created_at: string
}

interface Course {
  id: string
  title: string
  session_number: number
  series_id: string
}

interface CourseTerm {
  id: string
  series_id: string
  name: string
  start_date: string
  end_date: string
  status: string
}

// コース一覧
export const renderCourseSeriesList = (series: CourseSeries[], patterns: PricingPattern[]) => {
  const patternMap = new Map(patterns.map(p => [p.id, p]))
  
  const content = `
    <div class="space-y-6">
      <!-- ヘッダー -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-layer-group mr-2 text-purple-500"></i>コース管理
          </h1>
          <p class="text-gray-600 mt-1">複数回の講座をまとめたコースを管理します</p>
        </div>
        <a href="/admin/course-series/new" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <i class="fas fa-plus"></i>
          新規コース作成
        </a>
      </div>

      <!-- 説明カード -->
      <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <i class="fas fa-info-circle text-purple-500 mt-1"></i>
          <div>
            <h3 class="font-semibold text-purple-800">コースとは？</h3>
            <p class="text-purple-700 text-sm mt-1">
              複数回の講座をまとめて販売する仕組みです。<br>
              単発参加・コース一括・早期申込・月額払いの4つの支払い方法を提供できます。
            </p>
          </div>
        </div>
      </div>

      <!-- コース一覧 -->
      <div class="grid gap-4">
        ${series.length === 0 ? `
          <div class="bg-white rounded-xl shadow-sm border p-8 text-center">
            <i class="fas fa-layer-group text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">コースがありません</p>
            <a href="/admin/course-series/new" class="text-purple-500 hover:underline mt-2 inline-block">
              新しいコースを作成
            </a>
          </div>
        ` : series.map(s => {
          const pattern = patternMap.get(s.pricing_pattern_id)
          return `
          <div class="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
            <div class="flex">
              <!-- サムネイル -->
              <div class="w-48 h-36 bg-gray-100 flex-shrink-0">
                ${s.image ? `<img src="${s.image}" alt="" class="w-full h-full object-cover">` : `
                  <div class="w-full h-full flex items-center justify-center">
                    <i class="fas fa-image text-3xl text-gray-300"></i>
                  </div>
                `}
              </div>
              
              <!-- 内容 -->
              <div class="flex-1 p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="text-lg font-bold text-gray-800">${escapeHtml(s.title)}</h3>
                      <span class="px-2 py-0.5 rounded text-xs ${s.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                        ${s.status === 'published' ? '公開中' : '下書き'}
                      </span>
                      ${s.is_featured ? '<span class="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">おすすめ</span>' : ''}
                    </div>
                    ${s.subtitle ? `<p class="text-gray-600 text-sm mt-1">${escapeHtml(s.subtitle)}</p>` : ''}
                  </div>
                  
                  <div class="flex gap-2">
                    <a href="/admin/course-series/${s.id}/edit" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                      <i class="fas fa-edit"></i>
                    </a>
                    <button onclick="deleteSeries('${s.id}')" class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                
                <!-- 情報 -->
                <div class="flex flex-wrap gap-4 mt-3 text-sm">
                  <div class="flex items-center gap-1 text-gray-600">
                    <i class="fas fa-list-ol"></i>
                    <span>全${s.total_sessions}回</span>
                  </div>
                  <div class="flex items-center gap-1 text-gray-600">
                    <i class="fas fa-clock"></i>
                    <span>${s.duration_minutes}分/回</span>
                  </div>
                  ${pattern ? `
                    <div class="flex items-center gap-1 text-gray-600">
                      <i class="fas fa-tags"></i>
                      <span>${escapeHtml(pattern.name)}</span>
                    </div>
                  ` : ''}
                </div>
                
                <!-- 価格 -->
                <div class="flex flex-wrap gap-3 mt-3">
                  <div class="bg-gray-100 px-3 py-1 rounded">
                    <span class="text-xs text-gray-500">単発</span>
                    <span class="ml-1 font-bold">¥${(s.calc_single_price_incl || 0).toLocaleString()}</span>
                  </div>
                  <div class="bg-purple-100 px-3 py-1 rounded">
                    <span class="text-xs text-purple-600">一括</span>
                    <span class="ml-1 font-bold text-purple-700">¥${(s.calc_course_price_incl || 0).toLocaleString()}</span>
                  </div>
                  <div class="bg-orange-100 px-3 py-1 rounded">
                    <span class="text-xs text-orange-600">早期</span>
                    <span class="ml-1 font-bold text-orange-700">¥${(s.calc_early_price_incl || 0).toLocaleString()}</span>
                  </div>
                  ${pattern?.has_monthly_option ? `
                    <div class="bg-blue-100 px-3 py-1 rounded">
                      <span class="text-xs text-blue-600">月額</span>
                      <span class="ml-1 font-bold text-blue-700">¥${(s.calc_monthly_price_incl || 0).toLocaleString()}/回</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    </div>

    <script>
      async function deleteSeries(id) {
        if (!confirm('このコースを削除しますか？\\n※紐付けられた講座は単発講座に戻ります。')) return;
        
        try {
          const res = await fetch('/admin/api/course-series/' + id, {
            method: 'DELETE'
          });
          const data = await res.json();
          
          if (data.success) {
            location.reload();
          } else {
            alert(data.error || '削除に失敗しました');
          }
        } catch (e) {
          alert('エラーが発生しました');
        }
      }
    </script>
  `
  
  return renderAdminLayout('コース管理', content, 'course-series')
}

// コース作成/編集フォーム
export const renderCourseSeriesForm = (
  patterns: PricingPattern[],
  courses: Course[],
  series?: CourseSeries,
  linkedCourses?: Course[],
  terms?: CourseTerm[]
) => {
  const isEdit = !!series
  
  const content = `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- ヘッダー -->
      <div class="flex items-center gap-4">
        <a href="/admin/course-series" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h1 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-layer-group mr-2 text-purple-500"></i>
          ${isEdit ? 'コース編集' : '新規コース作成'}
        </h1>
      </div>

      <form id="seriesForm" class="space-y-6">
        <!-- 基本情報 -->
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-info-circle mr-2 text-blue-500"></i>基本情報
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">コース名 <span class="text-red-500">*</span></label>
              <input type="text" name="title" value="${escapeHtml(series?.title || '')}" required
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="例: AI時代のキャリア支援講座">
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">サブタイトル</label>
              <input type="text" name="subtitle" value="${escapeHtml(series?.subtitle || '')}"
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="例: 全6回で学ぶAIキャリアコンサルティング">
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
              <textarea name="description" rows="3"
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="コースの概要を入力">${escapeHtml(series?.description || '')}</textarea>
            </div>
            
            <!-- コース画像 -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">コース画像</label>
              <div class="flex items-start gap-4">
                <div id="image-preview" class="w-32 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  ${series?.image ? `<img src="${series.image}" alt="" class="w-full h-full object-cover">` : `<i class="fas fa-image text-2xl text-gray-300"></i>`}
                </div>
                <div class="flex-1">
                  <input type="hidden" name="image" id="image-url" value="${escapeHtml(series?.image || '')}">
                  <div class="flex gap-2">
                    <label class="cursor-pointer px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm">
                      <i class="fas fa-upload mr-1"></i>画像をアップロード
                      <input type="file" id="image-upload" accept="image/*" class="hidden">
                    </label>
                    <button type="button" id="remove-image" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm ${series?.image ? '' : 'hidden'}">
                      <i class="fas fa-times mr-1"></i>削除
                    </button>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">推奨サイズ: 800×500px、最大10MB</p>
                  <div id="upload-progress" class="hidden mt-2">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div id="progress-bar" class="bg-purple-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">全回数 <span class="text-red-500">*</span></label>
              <input type="number" name="total_sessions" value="${series?.total_sessions || 6}" required
                min="2" max="20" step="1"
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">1回あたりの時間（分） <span class="text-red-500">*</span></label>
              <input type="number" name="duration_minutes" value="${series?.duration_minutes || 180}" required
                min="30" max="480" step="30"
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            </div>
          </div>
        </div>

        <!-- 料金設定 -->
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-yen-sign mr-2 text-green-500"></i>料金設定
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">単発価格（税抜） <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                <input type="number" name="base_price_per_session" value="${series?.base_price_per_session || 8000}" required
                  min="0" step="100"
                  class="w-full border rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              </div>
              <p class="text-xs text-gray-500 mt-1">1回あたりの税抜価格</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">料金パターン <span class="text-red-500">*</span></label>
              <select name="pricing_pattern_id" required
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                ${patterns.map(p => `
                  <option value="${p.id}" ${series?.pricing_pattern_id === p.id ? 'selected' : ''}>
                    ${escapeHtml(p.name)}（一括${Math.round(p.course_discount_rate * 100)}%OFF / 早期${Math.round(p.early_bird_discount_rate * 100)}%OFF）
                  </option>
                `).join('')}
              </select>
            </div>
          </div>
          
          <!-- 自動計算結果 -->
          <div id="pricePreview" class="bg-gray-50 rounded-lg p-4 mt-4">
            <h4 class="font-bold text-gray-700 mb-3">
              <i class="fas fa-calculator mr-2"></i>自動計算結果
            </h4>
            <div id="pricePreviewContent"></div>
          </div>
        </div>

        <!-- 早期申込設定 -->
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-clock mr-2 text-orange-500"></i>早期申込設定
          </h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">早期申込締切日</label>
            <input type="date" name="early_bird_deadline" value="${series?.early_bird_deadline || ''}"
              class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
            <p class="text-xs text-gray-500 mt-1">この日までの申込に早期割引を適用（空欄の場合は料金パターンの日数で自動計算）</p>
          </div>
        </div>

        <!-- 開催期設定 -->
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-calendar-alt mr-2 text-green-500"></i>開催期設定
          </h3>
          
          <p class="text-sm text-gray-600">
            コース予約を受け付けるには開催期を設定してください。開催期ごとに受講生を募集できます。
          </p>
          
          <div id="termsList" class="space-y-3">
            ${(terms || []).map((t, i) => `
              <div class="p-3 bg-gray-50 rounded-lg term-item" data-term-id="${t.id}">
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span class="bg-green-500 text-white px-2 py-1 rounded text-sm">${t.name}</span>
                  <span class="text-sm text-gray-600">${t.start_date} 〜 ${t.end_date}</span>
                  <span class="text-xs px-2 py-1 rounded ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}">${t.status === 'active' ? '募集中' : '終了'}</span>
                  ${t.early_bird_deadline ? `
                    <span class="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">
                      <i class="fas fa-clock mr-1"></i>早期〆${t.early_bird_deadline}
                    </span>
                  ` : `
                    <span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-500">
                      <i class="fas fa-clock mr-1"></i>早期締切未設定
                    </span>
                  `}
                  <div class="ml-auto flex items-center gap-2">
                    <button type="button" onclick="editTerm('${t.id}', '${t.name}', '${t.start_date}', '${t.end_date}', '${t.early_bird_deadline || ''}')" class="text-blue-500 hover:text-blue-700" title="編集">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" onclick="deleteTerm('${t.id}')" class="text-red-500 hover:text-red-700" title="削除">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
            ${(!terms || terms.length === 0) ? `
              <div class="text-center py-4 text-gray-500 bg-yellow-50 rounded-lg border border-yellow-200">
                <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                開催期が設定されていません。コース予約を受け付けるには開催期を追加してください。
              </div>
            ` : ''}
          </div>
          
          <div class="border-t pt-4 mt-4">
            <h4 class="text-sm font-medium text-gray-700 mb-3">新しい開催期を追加</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">開催期名</label>
                <input type="text" id="newTermName" placeholder="例: 第1期"
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">開始日</label>
                <input type="date" id="newTermStartDate"
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">終了日</label>
                <input type="date" id="newTermEndDate"
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500">
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">早期締切日 <span class="text-orange-500">*</span></label>
                <input type="date" id="newTermEarlyDeadline"
                  class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500">
              </div>
              <div class="flex items-end">
                <button type="button" onclick="addTerm()" class="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm">
                  <i class="fas fa-plus mr-1"></i>追加
                </button>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">
              <i class="fas fa-info-circle mr-1"></i>
              早期締切日: この日までの申込で早期割引が適用されます（通常は開始日の21日前）
            </p>
          </div>
        </div>

        <!-- 開催期編集モーダル -->
        <div id="editTermModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4" onclick="if(event.target === this) closeEditTermModal()">
          <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-lg text-gray-800">
                <i class="fas fa-edit mr-2 text-blue-500"></i>開催期を編集
              </h3>
              <button onclick="closeEditTermModal()" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <input type="hidden" id="editTermId">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">開催期名</label>
                <input type="text" id="editTermName" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                  <input type="date" id="editTermStartDate" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                  <input type="date" id="editTermEndDate" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <i class="fas fa-clock text-orange-500 mr-1"></i>早期締切日
                </label>
                <input type="date" id="editTermEarlyDeadline" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500">
                <p class="text-xs text-gray-500 mt-1">この日までの申込で早期割引が適用されます</p>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button onclick="closeEditTermModal()" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
                キャンセル
              </button>
              <button onclick="saveTermEdit()" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                <i class="fas fa-save mr-1"></i>保存
              </button>
            </div>
          </div>
        </div>

        <!-- 講座の紐付け -->
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-link mr-2 text-blue-500"></i>講座の紐付け
          </h3>
          
          <p class="text-sm text-gray-600">
            このコースに含める講座を選択してください。講座管理で作成した講座を紐付けることができます。
          </p>
          
          <div id="linkedCourses" class="space-y-2">
            ${(linkedCourses || []).map((c, i) => `
              <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg linked-course" data-course-id="${c.id}">
                <span class="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">${i + 1}</span>
                <span class="flex-1">${escapeHtml(c.title)}</span>
                <button type="button" onclick="unlinkCourse('${c.id}')" class="text-red-500 hover:text-red-700">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            `).join('')}
          </div>
          
          <div class="flex gap-2">
            <select id="courseToLink" class="flex-1 border rounded-lg px-4 py-2">
              <option value="">講座を選択...</option>
              ${courses.filter(c => !c.series_id || c.series_id === series?.id).map(c => `
                <option value="${c.id}" ${linkedCourses?.find(lc => lc.id === c.id) ? 'disabled' : ''}>
                  ${escapeHtml(c.title)}
                </option>
              `).join('')}
            </select>
            <button type="button" onclick="linkCourse()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              <i class="fas fa-plus mr-1"></i>追加
            </button>
          </div>
        </div>

        <!-- 表示設定 -->
        <div class="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-cog mr-2 text-gray-500"></i>表示設定
          </h3>
          
          <div class="flex items-center gap-6">
            <label class="flex items-center gap-2">
              <input type="checkbox" name="is_featured" ${series?.is_featured ? 'checked' : ''}
                class="w-5 h-5 text-purple-500 rounded focus:ring-purple-500">
              <span>おすすめに表示</span>
            </label>
            
            <label class="flex items-center gap-2">
              <input type="radio" name="status" value="published" ${!series || series.status === 'published' ? 'checked' : ''}
                class="w-5 h-5 text-purple-500 focus:ring-purple-500">
              <span>公開</span>
            </label>
            
            <label class="flex items-center gap-2">
              <input type="radio" name="status" value="draft" ${series?.status === 'draft' ? 'checked' : ''}
                class="w-5 h-5 text-purple-500 focus:ring-purple-500">
              <span>下書き</span>
            </label>
          </div>
        </div>

        <!-- ボタン -->
        <div class="flex justify-end gap-3">
          <a href="/admin/course-series" class="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
            キャンセル
          </a>
          <button type="submit" class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
            <i class="fas fa-save mr-2"></i>${isEdit ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>

    <script>
      const form = document.getElementById('seriesForm');
      const patterns = ${JSON.stringify(patterns)};
      let linkedCourseIds = ${JSON.stringify((linkedCourses || []).map(c => c.id))};
      
      // 価格プレビュー更新
      function updatePricePreview() {
        const basePrice = parseInt(form.base_price_per_session.value) || 0;
        const sessions = parseInt(form.total_sessions.value) || 1;
        const patternId = form.pricing_pattern_id.value;
        const pattern = patterns.find(p => p.id === patternId);
        
        if (!pattern) return;
        
        const taxRate = pattern.tax_rate;
        const singlePriceIncl = Math.round(basePrice * (1 + taxRate));
        const singleTotal = basePrice * sessions;
        const singleTotalIncl = Math.round(singleTotal * (1 + taxRate));
        const coursePrice = Math.round(singleTotal * (1 - pattern.course_discount_rate));
        const coursePriceIncl = Math.round(coursePrice * (1 + taxRate));
        const earlyPrice = Math.round(singleTotal * (1 - pattern.early_bird_discount_rate));
        const earlyPriceIncl = Math.round(earlyPrice * (1 + taxRate));
        const monthlyPrice = Math.round(coursePrice / sessions);
        const monthlyPriceIncl = Math.round(monthlyPrice * (1 + taxRate));
        const savingsCourse = singleTotalIncl - coursePriceIncl;
        const savingsEarly = singleTotalIncl - earlyPriceIncl;
        
        const format = (n) => '¥' + n.toLocaleString();
        
        document.getElementById('pricePreviewContent').innerHTML = \`
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-3 rounded-lg border">
              <div class="text-xs text-gray-500">単発（1回・税込）</div>
              <div class="text-lg font-bold">\${format(singlePriceIncl)}</div>
            </div>
            <div class="bg-white p-3 rounded-lg border">
              <div class="text-xs text-gray-500">単発×\${sessions}回（定価）</div>
              <div class="text-lg font-bold">\${format(singleTotalIncl)}</div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div class="text-xs text-purple-600">コース一括（\${Math.round(pattern.course_discount_rate * 100)}%OFF）</div>
              <div class="text-lg font-bold text-purple-700">\${format(coursePriceIncl)}</div>
              <div class="text-xs text-purple-500">\${format(savingsCourse)}お得</div>
            </div>
            <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
              <div class="text-xs text-orange-600">早期申込（\${Math.round(pattern.early_bird_discount_rate * 100)}%OFF）</div>
              <div class="text-lg font-bold text-orange-700">\${format(earlyPriceIncl)}</div>
              <div class="text-xs text-orange-500">\${format(savingsEarly)}お得</div>
            </div>
          </div>
          \${pattern.has_monthly_option ? \`
            <div class="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div class="text-xs text-blue-600">月額払い（一括価格÷\${sessions}回）</div>
              <div class="text-lg font-bold text-blue-700">\${format(monthlyPriceIncl)} × \${sessions}回 = \${format(monthlyPriceIncl * sessions)}</div>
            </div>
          \` : ''}
          <div class="mt-2 text-xs text-gray-500">
            ※税込価格（消費税\${Math.round(taxRate * 100)}%）
          </div>
        \`;
      }
      
      // イベントリスナー
      ['base_price_per_session', 'total_sessions', 'pricing_pattern_id'].forEach(name => {
        form[name].addEventListener('input', updatePricePreview);
        form[name].addEventListener('change', updatePricePreview);
      });
      
      // 初期表示
      updatePricePreview();
      
      // 画像アップロード処理
      const imageUpload = document.getElementById('image-upload');
      const imageUrl = document.getElementById('image-url');
      const imagePreview = document.getElementById('image-preview');
      const removeImageBtn = document.getElementById('remove-image');
      const uploadProgress = document.getElementById('upload-progress');
      const progressBar = document.getElementById('progress-bar');
      
      imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // バリデーション
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          alert('対応していないファイル形式です。JPG, PNG, GIF, WebPのみ対応しています。');
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          alert('ファイルサイズは10MB以下にしてください。');
          return;
        }
        
        // アップロード開始
        uploadProgress.classList.remove('hidden');
        progressBar.style.width = '30%';
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          progressBar.style.width = '60%';
          const res = await fetch('/admin/api/upload', {
            method: 'POST',
            body: formData
          });
          
          progressBar.style.width = '90%';
          const result = await res.json();
          
          if (result.success && result.url) {
            progressBar.style.width = '100%';
            imageUrl.value = result.url;
            imagePreview.innerHTML = '<img src="' + result.url + '" alt="" class="w-full h-full object-cover">';
            removeImageBtn.classList.remove('hidden');
            setTimeout(() => uploadProgress.classList.add('hidden'), 500);
          } else {
            throw new Error(result.error || 'アップロードに失敗しました');
          }
        } catch (err) {
          console.error(err);
          alert('画像のアップロードに失敗しました: ' + err.message);
          uploadProgress.classList.add('hidden');
        }
        
        imageUpload.value = '';
      });
      
      removeImageBtn.addEventListener('click', () => {
        imageUrl.value = '';
        imagePreview.innerHTML = '<i class="fas fa-image text-2xl text-gray-300"></i>';
        removeImageBtn.classList.add('hidden');
      });
      
      // 開催期管理
      let pendingTerms = []; // 新規追加予定の開催期
      let deletedTermIds = []; // 削除予定の開催期ID
      
      async function addTerm() {
        const name = document.getElementById('newTermName').value.trim();
        const startDate = document.getElementById('newTermStartDate').value;
        const endDate = document.getElementById('newTermEndDate').value;
        const earlyDeadline = document.getElementById('newTermEarlyDeadline').value;
        
        if (!name || !startDate || !endDate) {
          alert('開催期名、開始日、終了日をすべて入力してください。');
          return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
          alert('開始日は終了日より前の日付を指定してください。');
          return;
        }
        
        // 早期締切日が開始日より後の場合は警告
        if (earlyDeadline && new Date(earlyDeadline) >= new Date(startDate)) {
          alert('早期締切日は開始日より前の日付を指定してください。');
          return;
        }
        
        const seriesId = '${isEdit ? series?.id : ''}';
        
        if (seriesId) {
          // 編集モード：即座にAPIで保存
          try {
            const res = await fetch('/admin/api/course-terms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                series_id: seriesId,
                name: name,
                start_date: startDate,
                end_date: endDate,
                early_bird_deadline: earlyDeadline || null,
                status: 'active'
              })
            });
            
            const result = await res.json();
            if (result.success) {
              // UIに追加
              const container = document.getElementById('termsList');
              const warningEl = container.querySelector('.bg-yellow-50');
              if (warningEl) warningEl.remove();
              
              container.innerHTML += \`
                <div class="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg term-item" data-term-id="\${result.term.id}">
                  <span class="bg-green-500 text-white px-2 py-1 rounded text-sm">\${name}</span>
                  <span class="text-sm text-gray-600">\${startDate} 〜 \${endDate}</span>
                  <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">募集中</span>
                  \${earlyDeadline ? \`<span class="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700"><i class="fas fa-clock mr-1"></i>早期〆\${earlyDeadline}</span>\` : ''}
                  <button type="button" onclick="deleteTerm('\${result.term.id}')" class="ml-auto text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              \`;
              
              // フォームをクリア
              document.getElementById('newTermName').value = '';
              document.getElementById('newTermStartDate').value = '';
              document.getElementById('newTermEndDate').value = '';
            } else {
              alert('開催期の追加に失敗しました: ' + (result.error || '不明なエラー'));
            }
          } catch (err) {
            console.error(err);
            alert('開催期の追加に失敗しました');
          }
        } else {
          // 新規作成モード：保留してフォーム送信時に一緒に保存
          const tempId = 'temp_' + Date.now();
          pendingTerms.push({ id: tempId, name, start_date: startDate, end_date: endDate, status: 'active' });
          
          const container = document.getElementById('termsList');
          const warningEl = container.querySelector('.bg-yellow-50');
          if (warningEl) warningEl.remove();
          
          container.innerHTML += \`
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg term-item" data-term-id="\${tempId}">
              <span class="bg-green-500 text-white px-2 py-1 rounded text-sm">\${name}</span>
              <span class="text-sm text-gray-600">\${startDate} 〜 \${endDate}</span>
              <span class="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">保存待ち</span>
              <button type="button" onclick="deleteTerm('\${tempId}')" class="ml-auto text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          \`;
          
          document.getElementById('newTermName').value = '';
          document.getElementById('newTermStartDate').value = '';
          document.getElementById('newTermEndDate').value = '';
        }
      }
      
      async function deleteTerm(termId) {
        if (!confirm('この開催期を削除しますか？')) return;
        
        if (termId.startsWith('temp_')) {
          // 保留中の開催期を削除
          pendingTerms = pendingTerms.filter(t => t.id !== termId);
        } else {
          // 既存の開催期を削除
          try {
            const res = await fetch('/admin/api/course-terms/' + termId, {
              method: 'DELETE'
            });
            
            const result = await res.json();
            if (!result.success) {
              alert('開催期の削除に失敗しました: ' + (result.error || '不明なエラー'));
              return;
            }
          } catch (err) {
            console.error(err);
            alert('開催期の削除に失敗しました');
            return;
          }
        }
        
        const el = document.querySelector('.term-item[data-term-id="' + termId + '"]');
        if (el) el.remove();
        
        // 空の場合は警告を表示
        const container = document.getElementById('termsList');
        if (container.querySelectorAll('.term-item').length === 0) {
          container.innerHTML = \`
            <div class="text-center py-4 text-gray-500 bg-yellow-50 rounded-lg border border-yellow-200">
              <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              開催期が設定されていません。コース予約を受け付けるには開催期を追加してください。
            </div>
          \`;
        }
      }
      
      // 開催期の編集
      function editTerm(termId, name, startDate, endDate, earlyDeadline) {
        document.getElementById('editTermId').value = termId;
        document.getElementById('editTermName').value = name;
        document.getElementById('editTermStartDate').value = startDate;
        document.getElementById('editTermEndDate').value = endDate;
        document.getElementById('editTermEarlyDeadline').value = earlyDeadline || '';
        
        const modal = document.getElementById('editTermModal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      
      function closeEditTermModal() {
        const modal = document.getElementById('editTermModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      
      async function saveTermEdit() {
        const termId = document.getElementById('editTermId').value;
        const name = document.getElementById('editTermName').value.trim();
        const startDate = document.getElementById('editTermStartDate').value;
        const endDate = document.getElementById('editTermEndDate').value;
        const earlyDeadline = document.getElementById('editTermEarlyDeadline').value;
        
        if (!name || !startDate || !endDate) {
          alert('開催期名、開始日、終了日をすべて入力してください。');
          return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
          alert('開始日は終了日より前の日付を指定してください。');
          return;
        }
        
        // 早期締切日が開始日より後の場合は警告
        if (earlyDeadline && new Date(earlyDeadline) >= new Date(startDate)) {
          alert('早期締切日は開始日より前の日付を指定してください。');
          return;
        }
        
        try {
          const res = await fetch('/admin/api/course-terms/' + termId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name,
              start_date: startDate,
              end_date: endDate,
              early_bird_deadline: earlyDeadline || null
            })
          });
          
          const result = await res.json();
          if (result.success) {
            // UIを更新
            const termEl = document.querySelector('.term-item[data-term-id="' + termId + '"]');
            if (termEl) {
              const earlyBadge = earlyDeadline 
                ? '<span class="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700"><i class="fas fa-clock mr-1"></i>早期〆' + earlyDeadline + '</span>'
                : '<span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-500"><i class="fas fa-clock mr-1"></i>早期締切未設定</span>';
              
              termEl.innerHTML = \`
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span class="bg-green-500 text-white px-2 py-1 rounded text-sm">\${name}</span>
                  <span class="text-sm text-gray-600">\${startDate} 〜 \${endDate}</span>
                  <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">募集中</span>
                  \${earlyBadge}
                  <div class="ml-auto flex items-center gap-2">
                    <button type="button" onclick="editTerm('\${termId}', '\${name}', '\${startDate}', '\${endDate}', '\${earlyDeadline || ''}')" class="text-blue-500 hover:text-blue-700" title="編集">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" onclick="deleteTerm('\${termId}')" class="text-red-500 hover:text-red-700" title="削除">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              \`;
            }
            
            closeEditTermModal();
          } else {
            alert('開催期の更新に失敗しました: ' + (result.error || '不明なエラー'));
          }
        } catch (err) {
          console.error(err);
          alert('開催期の更新に失敗しました');
        }
      }
      
      // グローバルスコープに登録
      window.addTerm = addTerm;
      window.deleteTerm = deleteTerm;
      window.editTerm = editTerm;
      window.closeEditTermModal = closeEditTermModal;
      window.saveTermEdit = saveTermEdit;
      
      // 講座の紐付け
      function linkCourse() {
        const select = document.getElementById('courseToLink');
        const courseId = select.value;
        if (!courseId) return;
        
        const option = select.querySelector('option[value="' + courseId + '"]');
        const courseTitle = option.textContent.trim();
        
        linkedCourseIds.push(courseId);
        option.disabled = true;
        select.value = '';
        
        const container = document.getElementById('linkedCourses');
        const index = linkedCourseIds.length;
        container.innerHTML += \`
          <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg linked-course" data-course-id="\${courseId}">
            <span class="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">\${index}</span>
            <span class="flex-1">\${courseTitle}</span>
            <button type="button" onclick="unlinkCourse('\${courseId}')" class="text-red-500 hover:text-red-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
        \`;
        
        updateSessionNumbers();
      }
      
      function unlinkCourse(courseId) {
        linkedCourseIds = linkedCourseIds.filter(id => id !== courseId);
        
        const el = document.querySelector('.linked-course[data-course-id="' + courseId + '"]');
        if (el) el.remove();
        
        const option = document.querySelector('#courseToLink option[value="' + courseId + '"]');
        if (option) option.disabled = false;
        
        updateSessionNumbers();
      }
      
      function updateSessionNumbers() {
        document.querySelectorAll('.linked-course').forEach((el, i) => {
          const badge = el.querySelector('span:first-child');
          if (badge) badge.textContent = i + 1;
        });
      }
      
      // フォーム送信
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const patternId = form.pricing_pattern_id.value;
        const pattern = patterns.find(p => p.id === patternId);
        const basePrice = parseInt(form.base_price_per_session.value);
        const sessions = parseInt(form.total_sessions.value);
        const taxRate = pattern.tax_rate;
        
        // 価格計算
        const singleTotal = basePrice * sessions;
        const coursePrice = Math.round(singleTotal * (1 - pattern.course_discount_rate));
        const earlyPrice = Math.round(singleTotal * (1 - pattern.early_bird_discount_rate));
        const monthlyPrice = Math.round(coursePrice / sessions);
        
        const data = {
          title: form.title.value,
          subtitle: form.subtitle.value,
          description: form.description.value,
          image: document.getElementById('image-url').value || null,
          total_sessions: sessions,
          duration_minutes: parseInt(form.duration_minutes.value),
          base_price_per_session: basePrice,
          pricing_pattern_id: patternId,
          calc_single_price_incl: Math.round(basePrice * (1 + taxRate)),
          calc_single_total_incl: Math.round(singleTotal * (1 + taxRate)),
          calc_course_price_incl: Math.round(coursePrice * (1 + taxRate)),
          calc_early_price_incl: Math.round(earlyPrice * (1 + taxRate)),
          calc_monthly_price_incl: Math.round(monthlyPrice * (1 + taxRate)),
          calc_savings_course: Math.round(singleTotal * (1 + taxRate)) - Math.round(coursePrice * (1 + taxRate)),
          calc_savings_early: Math.round(singleTotal * (1 + taxRate)) - Math.round(earlyPrice * (1 + taxRate)),
          early_bird_deadline: form.early_bird_deadline.value || null,
          is_featured: form.is_featured.checked ? 1 : 0,
          status: form.querySelector('input[name="status"]:checked').value,
          linked_courses: linkedCourseIds,
          pending_terms: pendingTerms
        };
        
        try {
          const res = await fetch('/admin/api/course-series${isEdit ? `/${series.id}` : ''}', {
            method: '${isEdit ? 'PUT' : 'POST'}',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await res.json();
          
          if (result.success) {
            location.href = '/admin/course-series';
          } else {
            alert(result.error || '保存に失敗しました');
          }
        } catch (e) {
          console.error(e);
          alert('エラーが発生しました');
        }
      });
    </script>
  `
  
  return renderAdminLayout(isEdit ? 'コース編集' : '新規コース作成', content, 'course-series')
}

// HTML エスケープ
function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
