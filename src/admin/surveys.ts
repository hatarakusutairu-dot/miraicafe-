import { renderAdminLayout } from './layout'

// 型定義
interface SurveyQuestion {
  id: number
  question_type: string
  question_text: string
  question_category: string
  options: string | null
  is_required: number
  sort_order: number
  is_active: number
}

interface SurveyResponse {
  id: number
  booking_id: number | null
  respondent_name: string | null
  respondent_email: string | null
  course_name: string | null
  answers: string
  overall_rating: number | null
  publish_consent: string
  created_at: string
}

interface SurveyStats {
  totalResponses: number
  avgOverallRating: number
  ratingDistribution: Record<number, number>
  publishConsentStats: Record<string, number>
  questionStats: Record<number, { avg: number; count: number }>
  recentResponses: SurveyResponse[]
}

// エスケープ関数
function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// アンケート管理トップ（分析ダッシュボード）
export function renderSurveyDashboard(stats: SurveyStats, questions: SurveyQuestion[]): string {
  const categoryLabels: Record<string, string> = {
    satisfaction: '総合評価',
    content: '講座内容',
    instructor: '講師',
    environment: '受講環境',
    general: 'その他'
  }

  const content = `
    <style>
      .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .chart-bar {
        transition: all 0.3s ease;
      }
      .chart-bar:hover {
        filter: brightness(1.1);
      }
    </style>

    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-chart-pie text-purple-500"></i>
            アンケート分析
          </h1>
          <p class="text-gray-500 mt-1">受講後アンケートの回答を分析</p>
        </div>
        <div class="flex gap-3">
          <button onclick="openPreviewModal()" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition flex items-center gap-2 shadow-sm">
            <i class="fas fa-eye"></i>プレビュー
          </button>
          <a href="/admin/surveys/settings" class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition flex items-center gap-2">
            <i class="fas fa-cog"></i>設定
          </a>
          <a href="/admin/surveys/questions" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
            <i class="fas fa-edit"></i>質問を編集
          </a>
          <a href="/admin/surveys/responses" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
            <i class="fas fa-list"></i>回答一覧
          </a>
        </div>
      </div>
    </div>

    <!-- 統計カード -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="stat-card rounded-2xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white/70 text-sm">総回答数</p>
            <p class="text-4xl font-bold">${stats.totalResponses}</p>
          </div>
          <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <i class="fas fa-clipboard-list text-2xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">平均満足度</p>
            <p class="text-4xl font-bold text-gray-800">${stats.avgOverallRating.toFixed(1)}</p>
          </div>
          <div class="flex text-yellow-400 text-xl">
            ${renderStars(stats.avgOverallRating)}
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          5点満点
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">公開OK</p>
            <p class="text-4xl font-bold text-green-600">${(stats.publishConsentStats['yes'] || 0) + (stats.publishConsentStats['anonymous'] || 0)}</p>
          </div>
          <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-check-circle text-green-500 text-2xl"></i>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          口コミ転用可能
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">高評価率</p>
            <p class="text-4xl font-bold text-purple-600">
              ${stats.totalResponses > 0 ? Math.round(((stats.ratingDistribution[5] || 0) + (stats.ratingDistribution[4] || 0)) / stats.totalResponses * 100) : 0}%
            </p>
          </div>
          <div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-thumbs-up text-purple-500 text-2xl"></i>
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          4点以上の割合
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- 評価分布 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-chart-bar text-blue-500"></i>
          評価分布
        </h3>
        <div class="space-y-3">
          ${[5,4,3,2,1].map(rating => {
            const count = stats.ratingDistribution[rating] || 0
            const percent = stats.totalResponses > 0 ? (count / stats.totalResponses * 100) : 0
            const colors = ['bg-green-500', 'bg-green-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400']
            return `
              <div class="flex items-center gap-3">
                <span class="w-16 text-sm text-gray-600 flex items-center gap-1">
                  ${rating}<i class="fas fa-star text-yellow-400 text-xs"></i>
                </span>
                <div class="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div class="chart-bar h-full ${colors[5-rating]} rounded-full flex items-center justify-end pr-3" style="width: ${Math.max(percent, 2)}%">
                    ${percent > 10 ? `<span class="text-white text-xs font-medium">${count}</span>` : ''}
                  </div>
                </div>
                <span class="w-16 text-sm text-gray-500 text-right">${percent.toFixed(0)}%</span>
              </div>
            `
          }).join('')}
        </div>
      </div>

      <!-- 公開同意状況 -->
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-bullhorn text-purple-500"></i>
          公開同意状況
        </h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-check text-white"></i>
              </div>
              <div>
                <p class="font-medium text-gray-800">お名前付き公開OK</p>
                <p class="text-sm text-gray-500">口コミとして掲載可能</p>
              </div>
            </div>
            <span class="text-2xl font-bold text-green-600">${stats.publishConsentStats['yes'] || 0}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-user-secret text-white"></i>
              </div>
              <div>
                <p class="font-medium text-gray-800">匿名なら公開OK</p>
                <p class="text-sm text-gray-500">名前を伏せて掲載可能</p>
              </div>
            </div>
            <span class="text-2xl font-bold text-purple-600">${stats.publishConsentStats['anonymous'] || 0}</span>
          </div>
          <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center">
                <i class="fas fa-lock text-white"></i>
              </div>
              <div>
                <p class="font-medium text-gray-800">公開不可</p>
                <p class="text-sm text-gray-500">内部参考のみ</p>
              </div>
            </div>
            <span class="text-2xl font-bold text-gray-600">${stats.publishConsentStats['no'] || 0}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 質問別評価 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-tasks text-green-500"></i>
        質問別平均評価
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">カテゴリ</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">質問</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500">平均</th>
              <th class="text-center py-3 px-4 text-sm font-medium text-gray-500">回答数</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">評価</th>
            </tr>
          </thead>
          <tbody>
            ${questions.filter(q => q.question_type === 'rating' && q.is_active).map(q => {
              const qStats = stats.questionStats[q.id] || { avg: 0, count: 0 }
              const percent = (qStats.avg / 5) * 100
              return `
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="py-3 px-4">
                    <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      ${categoryLabels[q.question_category] || q.question_category}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-gray-800">${escapeHtml(q.question_text)}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="font-bold text-lg ${qStats.avg >= 4 ? 'text-green-600' : qStats.avg >= 3 ? 'text-yellow-600' : 'text-red-600'}">
                      ${qStats.avg.toFixed(1)}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center text-gray-500">${qStats.count}</td>
                  <td class="py-3 px-4">
                    <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full rounded-full ${qStats.avg >= 4 ? 'bg-green-500' : qStats.avg >= 3 ? 'bg-yellow-500' : 'bg-red-500'}" 
                           style="width: ${percent}%"></div>
                    </div>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 最近の回答 -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <i class="fas fa-clock text-orange-500"></i>
          最近の回答
        </h3>
        <a href="/admin/surveys/responses" class="text-purple-600 hover:text-purple-700 text-sm">
          すべて見る <i class="fas fa-arrow-right ml-1"></i>
        </a>
      </div>
      ${stats.recentResponses.length > 0 ? `
        <div class="space-y-3">
          ${stats.recentResponses.slice(0, 5).map(r => `
            <div class="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <div class="flex text-yellow-400">
                    ${renderStars(r.overall_rating || 0)}
                  </div>
                  <span class="text-gray-800 font-medium">${escapeHtml(r.respondent_name) || '匿名'}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded-full ${
                    r.publish_consent === 'yes' ? 'bg-green-100 text-green-700' :
                    r.publish_consent === 'anonymous' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-600'
                  }">
                    ${r.publish_consent === 'yes' ? '公開OK' : r.publish_consent === 'anonymous' ? '匿名OK' : '非公開'}
                  </span>
                  <span class="text-sm text-gray-400">${formatDate(r.created_at)}</span>
                </div>
              </div>
              ${r.course_name ? `<p class="text-sm text-gray-500"><i class="fas fa-book mr-1"></i>${escapeHtml(r.course_name)}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="text-gray-500 text-center py-8">まだ回答がありません</p>
      `}
    </div>

    <!-- プレビューモーダル -->
    <div id="preview-modal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 overflow-auto">
      <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div class="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="fas fa-eye text-lg"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">アンケートプレビュー</h3>
                <p class="text-white/70 text-sm">実際の表示イメージ</p>
              </div>
            </div>
            <button onclick="closePreviewModal()" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]" style="background: linear-gradient(135deg, #faf5f0 0%, #f5efe8 50%, #f0e8e0 100%);">
          <!-- ヘッダー -->
          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-gray-700 mb-2">受講後アンケート</h1>
            <p class="text-gray-500">AI学習の体験について教えてください</p>
          </div>
          
          <!-- 質問プレビュー -->
          <div class="space-y-4">
            ${renderPreviewQuestions(questions, categoryLabels)}
            
            <!-- 回答者情報 -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-user text-purple-500 text-sm"></i>
                </div>
                <span class="font-medium text-gray-700">回答者情報</span>
                <span class="text-xs text-gray-400">（任意）</span>
              </div>
              <div class="space-y-3">
                <input type="text" disabled class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-400" placeholder="✏️ お名前">
                <input type="email" disabled class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-400" placeholder="📧 メールアドレス">
              </div>
            </div>
            
            <!-- 公開同意 -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-bullhorn text-pink-500 text-sm"></i>
                </div>
                <span class="font-medium text-gray-700">ご回答の公開について</span>
              </div>
              <div class="space-y-2">
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <i class="fas fa-check-circle text-green-400"></i>
                  <span class="text-gray-600">お名前付きで公開OK</span>
                </div>
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <i class="fas fa-user-secret text-purple-400"></i>
                  <span class="text-gray-600">匿名なら公開OK</span>
                </div>
                <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border-2 border-purple-300">
                  <i class="fas fa-lock text-gray-400"></i>
                  <span class="text-gray-600">公開不可</span>
                  <i class="fas fa-check ml-auto text-purple-500"></i>
                </div>
              </div>
            </div>
            
            <!-- 送信ボタン -->
            <div class="pt-4">
              <button disabled class="w-full py-4 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold rounded-full shadow-lg opacity-80 cursor-not-allowed">
                送信 <i class="fas fa-paper-plane ml-2"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-white border-t border-gray-100 flex justify-between items-center">
          <a href="/survey" target="_blank" class="text-purple-600 hover:text-purple-700 flex items-center gap-2">
            <i class="fas fa-external-link-alt"></i>
            実際のページを開く
          </a>
          <button onclick="closePreviewModal()" class="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition">
            閉じる
          </button>
        </div>
      </div>
    </div>

    <script>
      function openPreviewModal() {
        document.getElementById('preview-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
      
      function closePreviewModal() {
        document.getElementById('preview-modal').classList.add('hidden');
        document.body.style.overflow = '';
      }
      
      // ESCキーでモーダルを閉じる
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closePreviewModal();
        }
      });
      
      // モーダル外クリックで閉じる
      document.getElementById('preview-modal').addEventListener('click', function(e) {
        if (e.target === this) {
          closePreviewModal();
        }
      });
    </script>
  `

  return renderAdminLayout('アンケート分析', content, 'surveys')
}

// プレビュー用の質問レンダリング
function renderPreviewQuestions(questions: SurveyQuestion[], categoryLabels: Record<string, string>): string {
  const grouped: Record<string, SurveyQuestion[]> = {}
  
  questions.filter(q => q.is_active).forEach(q => {
    const cat = q.question_category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(q)
  })
  
  const categoryOrder = ['satisfaction', 'content', 'instructor', 'environment', 'general']
  const categoryIcons: Record<string, string> = {
    satisfaction: 'fa-star',
    content: 'fa-book-open',
    instructor: 'fa-chalkboard-teacher',
    environment: 'fa-laptop',
    general: 'fa-comment-dots'
  }
  
  return categoryOrder
    .filter(cat => grouped[cat] && grouped[cat].length > 0)
    .map(cat => {
      const label = categoryLabels[cat] || 'その他'
      const icon = categoryIcons[cat] || 'fa-question'
      const qs = grouped[cat]
      
      return `
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas ${icon} text-purple-500 text-sm"></i>
            </div>
            <span class="font-medium text-gray-700">${label}</span>
          </div>
          <div class="space-y-4">
            ${qs.map(q => renderPreviewQuestion(q)).join('')}
          </div>
        </div>
      `
    }).join('')
}

// 個別質問のプレビューレンダリング
function renderPreviewQuestion(q: SurveyQuestion): string {
  const isRequired = q.is_required === 1
  
  if (q.question_type === 'rating') {
    return `
      <div class="text-center py-2">
        <p class="text-gray-700 mb-3">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : ''}
        </p>
        <div class="flex justify-center gap-2">
          ${[1,2,3,4,5].map(n => `
            <span class="text-2xl ${n <= 3 ? 'text-gray-300' : 'text-yellow-400'}">
              <i class="fas fa-star"></i>
            </span>
          `).join('')}
        </div>
      </div>
    `
  }
  
  if (q.question_type === 'choice' || q.question_type === 'multi_choice') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div>
        <p class="text-gray-700 mb-3">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : ''}
        </p>
        <div class="space-y-2">
          ${options.map((opt: string, i: number) => `
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <i class="${q.question_type === 'multi_choice' ? 'far fa-square' : 'far fa-circle'} text-gray-400"></i>
              <span class="text-gray-600">${escapeHtml(opt)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }
  
  if (q.question_type === 'text') {
    return `
      <div>
        <p class="text-gray-700 mb-3">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : '<span class="text-gray-400">（任意）</span>'}
        </p>
        <textarea disabled rows="2" 
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 resize-none"
                  placeholder="ご自由にお書きください..."></textarea>
      </div>
    `
  }
  
  return ''
}

// 質問編集ページ
export function renderSurveyQuestions(questions: SurveyQuestion[]): string {
  const categoryLabels: Record<string, string> = {
    satisfaction: '総合評価',
    content: '講座内容',
    instructor: '講師',
    environment: '受講環境',
    general: 'その他'
  }

  const typeLabels: Record<string, string> = {
    rating: '5段階評価',
    text: '自由記述',
    choice: '単一選択',
    multi_choice: '複数選択'
  }

  const content = `
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <a href="/admin/surveys" class="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center gap-1">
            <i class="fas fa-arrow-left"></i>分析に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-edit text-purple-500"></i>
            質問の編集
          </h1>
        </div>
        <button onclick="showAddQuestionModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2">
          <i class="fas fa-plus"></i>質問を追加
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500 w-16">順序</th>
            <th class="text-left py-4 px-6 text-sm font-medium text-gray-500">質問</th>
            <th class="text-center py-4 px-6 text-sm font-medium text-gray-500 w-28">種類</th>
            <th class="text-center py-4 px-6 text-sm font-medium text-gray-500 w-28">カテゴリ</th>
            <th class="text-center py-4 px-6 text-sm font-medium text-gray-500 w-20">必須</th>
            <th class="text-center py-4 px-6 text-sm font-medium text-gray-500 w-20">状態</th>
            <th class="text-center py-4 px-6 text-sm font-medium text-gray-500 w-32">操作</th>
          </tr>
        </thead>
        <tbody id="questions-list">
          ${questions.map(q => `
            <tr class="border-t border-gray-100 hover:bg-gray-50" data-id="${q.id}">
              <td class="py-4 px-6">
                <span class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-medium">
                  ${q.sort_order}
                </span>
              </td>
              <td class="py-4 px-6">
                <p class="text-gray-800 font-medium">${escapeHtml(q.question_text)}</p>
                ${q.options ? `<p class="text-sm text-gray-500 mt-1">選択肢: ${JSON.parse(q.options).join(', ')}</p>` : ''}
              </td>
              <td class="py-4 px-6 text-center">
                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  ${typeLabels[q.question_type] || q.question_type}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  ${categoryLabels[q.question_category] || q.question_category}
                </span>
              </td>
              <td class="py-4 px-6 text-center">
                ${q.is_required ? '<i class="fas fa-check text-green-500"></i>' : '<i class="fas fa-minus text-gray-300"></i>'}
              </td>
              <td class="py-4 px-6 text-center">
                <button onclick="toggleQuestionActive(${q.id}, ${q.is_active})" 
                        class="px-3 py-1 rounded-full text-xs font-medium transition ${q.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}">
                  ${q.is_active ? '有効' : '無効'}
                </button>
              </td>
              <td class="py-4 px-6 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button onclick="editQuestion(${q.id})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="編集">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button onclick="deleteQuestion(${q.id})" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="削除">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 質問追加/編集モーダル -->
    <div id="question-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <h3 id="modal-title" class="text-xl font-bold text-gray-800 mb-6">質問を追加</h3>
        <form id="question-form" class="space-y-4">
          <input type="hidden" name="id" id="question-id">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">質問文 <span class="text-red-500">*</span></label>
            <textarea name="question_text" id="question-text" rows="2" required
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">種類 <span class="text-red-500">*</span></label>
              <select name="question_type" id="question-type" required onchange="toggleOptionsField()"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="rating">5段階評価</option>
                <option value="text">自由記述</option>
                <option value="choice">単一選択</option>
                <option value="multi_choice">複数選択</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select name="question_category" id="question-category"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="satisfaction">総合評価</option>
                <option value="content">講座内容</option>
                <option value="instructor">講師</option>
                <option value="environment">受講環境</option>
                <option value="general">その他</option>
              </select>
            </div>
          </div>
          <div id="options-field" class="hidden">
            <label class="block text-sm font-medium text-gray-700 mb-2">選択肢（カンマ区切り）</label>
            <input type="text" name="options" id="question-options"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                   placeholder="選択肢1, 選択肢2, 選択肢3">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">表示順</label>
              <input type="number" name="sort_order" id="question-sort" value="0" min="0"
                     class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
            </div>
            <div class="flex items-end pb-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_required" id="question-required" checked
                       class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500">
                <span class="text-gray-700">必須項目</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onclick="closeQuestionModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              キャンセル
            </button>
            <button type="submit" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      function showAddQuestionModal() {
        document.getElementById('modal-title').textContent = '質問を追加';
        document.getElementById('question-form').reset();
        document.getElementById('question-id').value = '';
        toggleOptionsField();
        document.getElementById('question-modal').classList.remove('hidden');
      }

      function closeQuestionModal() {
        document.getElementById('question-modal').classList.add('hidden');
      }

      function toggleOptionsField() {
        const type = document.getElementById('question-type').value;
        const optionsField = document.getElementById('options-field');
        optionsField.classList.toggle('hidden', type !== 'choice' && type !== 'multi_choice');
      }

      async function editQuestion(id) {
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id);
          const q = await res.json();
          
          document.getElementById('modal-title').textContent = '質問を編集';
          document.getElementById('question-id').value = q.id;
          document.getElementById('question-text').value = q.question_text;
          document.getElementById('question-type').value = q.question_type;
          document.getElementById('question-category').value = q.question_category;
          document.getElementById('question-options').value = q.options ? JSON.parse(q.options).join(', ') : '';
          document.getElementById('question-sort').value = q.sort_order;
          document.getElementById('question-required').checked = q.is_required === 1;
          
          toggleOptionsField();
          document.getElementById('question-modal').classList.remove('hidden');
        } catch (e) {
          alert('質問の取得に失敗しました');
        }
      }

      async function deleteQuestion(id) {
        if (!confirm('この質問を削除しますか？')) return;
        
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id, { method: 'DELETE' });
          if (res.ok) {
            location.reload();
          } else {
            alert('削除に失敗しました');
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }

      async function toggleQuestionActive(id, currentState) {
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id + '/toggle', { method: 'POST' });
          if (res.ok) {
            location.reload();
          }
        } catch (e) {
          alert('更新に失敗しました');
        }
      }

      document.getElementById('question-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const id = formData.get('id');
        const data = {
          question_text: formData.get('question_text'),
          question_type: formData.get('question_type'),
          question_category: formData.get('question_category'),
          options: formData.get('options') ? formData.get('options').split(',').map(s => s.trim()).filter(s => s) : null,
          sort_order: parseInt(formData.get('sort_order')) || 0,
          is_required: formData.get('is_required') ? 1 : 0
        };
        
        try {
          const url = id ? '/admin/api/surveys/questions/' + id : '/admin/api/surveys/questions';
          const method = id ? 'PUT' : 'POST';
          
          const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (res.ok) {
            location.reload();
          } else {
            alert('保存に失敗しました');
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      });
    </script>
  `

  return renderAdminLayout('質問の編集', content, 'surveys')
}

// 回答一覧ページ
export function renderSurveyResponses(responses: SurveyResponse[], questions: SurveyQuestion[]): string {
  const content = `
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <a href="/admin/surveys" class="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center gap-1">
            <i class="fas fa-arrow-left"></i>分析に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-list text-purple-500"></i>
            回答一覧
          </h1>
        </div>
        <button onclick="exportResponses()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
          <i class="fas fa-download"></i>CSVエクスポート
        </button>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      ${responses.length > 0 ? `
        <div class="divide-y divide-gray-100">
          ${responses.map(r => {
            const answers = JSON.parse(r.answers || '{}')
            return `
              <div class="p-6 hover:bg-gray-50 transition">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-4">
                    <div class="flex text-yellow-400 text-lg">
                      ${renderStars(r.overall_rating || 0)}
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">${escapeHtml(r.respondent_name) || '匿名'}</p>
                      ${r.respondent_email ? `<p class="text-sm text-gray-500">${escapeHtml(r.respondent_email)}</p>` : ''}
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs px-3 py-1 rounded-full ${
                      r.publish_consent === 'yes' ? 'bg-green-100 text-green-700' :
                      r.publish_consent === 'anonymous' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }">
                      ${r.publish_consent === 'yes' ? '公開OK' : r.publish_consent === 'anonymous' ? '匿名OK' : '非公開'}
                    </span>
                    <span class="text-sm text-gray-400">${formatDate(r.created_at)}</span>
                  </div>
                </div>
                
                ${r.course_name ? `
                  <p class="text-sm text-purple-600 mb-3">
                    <i class="fas fa-book mr-1"></i>${escapeHtml(r.course_name)}
                  </p>
                ` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${questions.filter(q => answers[q.id] !== undefined).map(q => `
                    <div class="bg-gray-50 rounded-lg p-3">
                      <p class="text-xs text-gray-500 mb-1">${escapeHtml(q.question_text)}</p>
                      <p class="text-gray-800">
                        ${q.question_type === 'rating' 
                          ? `<span class="text-yellow-400">${'★'.repeat(answers[q.id])}${'☆'.repeat(5 - answers[q.id])}</span>`
                          : Array.isArray(answers[q.id]) 
                            ? answers[q.id].join(', ')
                            : escapeHtml(String(answers[q.id]))
                        }
                      </p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `
          }).join('')}
        </div>
      ` : `
        <p class="text-gray-500 text-center py-16">まだ回答がありません</p>
      `}
    </div>

    <script>
      function exportResponses() {
        window.location.href = '/admin/api/surveys/export';
      }
    </script>
  `

  return renderAdminLayout('回答一覧', content, 'surveys')
}

// ヘルパー関数
function renderStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5
  let html = ''
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += '<i class="fas fa-star"></i>'
    } else if (i === fullStars && hasHalf) {
      html += '<i class="fas fa-star-half-alt"></i>'
    } else {
      html += '<i class="far fa-star text-gray-300"></i>'
    }
  }
  return html
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// アンケート設定ページ
interface SurveySettingsData {
  thank_you_video_url: string
  logo_url: string
}

export function renderSurveySettings(settings: SurveySettingsData): string {
  const content = `
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-cog text-purple-500"></i>
            アンケート設定
          </h1>
          <p class="text-gray-500 mt-1">お礼動画やロゴなどの設定</p>
        </div>
        <a href="/admin/surveys" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
          <i class="fas fa-arrow-left"></i>分析に戻る
        </a>
      </div>
    </div>

    <form id="settings-form" class="space-y-6">
      <!-- お礼動画設定 -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center">
            <i class="fas fa-video text-white text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-800">お礼動画</h2>
            <p class="text-sm text-gray-500">アンケート送信後に再生される動画</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              動画URL
              <span class="text-gray-400 font-normal ml-2">（MP4形式推奨）</span>
            </label>
            <input type="url" name="thank_you_video_url" 
                   value="${escapeHtml(settings.thank_you_video_url)}"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                   placeholder="https://example.com/thank-you-video.mp4">
            <p class="text-xs text-gray-400 mt-2">
              <i class="fas fa-info-circle mr-1"></i>
              YouTube、Vimeo、または直接MP4ファイルのURLを入力してください
            </p>
          </div>
          
          <!-- 動画プレビュー -->
          <div id="video-preview-container" class="${settings.thank_you_video_url ? '' : 'hidden'}">
            <label class="block text-sm font-medium text-gray-700 mb-2">プレビュー</label>
            <div class="aspect-video bg-gray-100 rounded-xl overflow-hidden">
              <video id="video-preview" controls class="w-full h-full object-cover">
                <source src="${escapeHtml(settings.thank_you_video_url)}" type="video/mp4">
              </video>
            </div>
          </div>
        </div>
      </div>
      
      <!-- ロゴ設定 -->
      <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
            <i class="fas fa-image text-white text-lg"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-800">ロゴ画像</h2>
            <p class="text-sm text-gray-500">アンケートページのヘッダーに表示</p>
          </div>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ロゴURL
              <span class="text-gray-400 font-normal ml-2">（PNG/SVG推奨）</span>
            </label>
            <input type="url" name="logo_url" 
                   value="${escapeHtml(settings.logo_url)}"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                   placeholder="https://example.com/logo.png">
          </div>
          
          <!-- ロゴプレビュー -->
          <div id="logo-preview-container" class="${settings.logo_url ? '' : 'hidden'}">
            <label class="block text-sm font-medium text-gray-700 mb-2">プレビュー</label>
            <div class="bg-gray-100 rounded-xl p-8 flex items-center justify-center">
              <img id="logo-preview" src="${escapeHtml(settings.logo_url)}" alt="Logo preview" class="max-h-16 max-w-full">
            </div>
          </div>
        </div>
      </div>
      
      <!-- アンケートリンク -->
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-link text-purple-500"></i>
          </div>
          <h3 class="font-bold text-gray-800">アンケートURL</h3>
        </div>
        <div class="flex items-center gap-3">
          <input type="text" readonly value="${typeof window !== 'undefined' ? window.location.origin : ''}/survey" 
                 id="survey-url" 
                 class="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600">
          <button type="button" onclick="copySurveyUrl()" class="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition flex items-center gap-2">
            <i class="fas fa-copy"></i>
            コピー
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          <i class="fas fa-info-circle mr-1"></i>
          講座名を指定: <code class="bg-white px-2 py-0.5 rounded">/survey?course=講座名</code>
        </p>
      </div>
      
      <!-- 保存ボタン -->
      <div class="flex justify-end gap-3">
        <a href="/admin/surveys" class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition">
          キャンセル
        </a>
        <button type="submit" class="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition flex items-center gap-2">
          <i class="fas fa-save"></i>
          設定を保存
        </button>
      </div>
    </form>

    <script>
      // URLプレビュー更新
      document.querySelector('input[name="thank_you_video_url"]').addEventListener('input', function(e) {
        const url = e.target.value.trim();
        const container = document.getElementById('video-preview-container');
        const video = document.getElementById('video-preview');
        
        if (url) {
          video.querySelector('source').src = url;
          video.load();
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      });
      
      document.querySelector('input[name="logo_url"]').addEventListener('input', function(e) {
        const url = e.target.value.trim();
        const container = document.getElementById('logo-preview-container');
        const img = document.getElementById('logo-preview');
        
        if (url) {
          img.src = url;
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      });
      
      // URLコピー
      function copySurveyUrl() {
        const input = document.getElementById('survey-url');
        // 実際のホストを取得
        input.value = window.location.origin + '/survey';
        navigator.clipboard.writeText(input.value).then(() => {
          alert('URLをコピーしました！');
        });
      }
      
      // フォーム送信
      document.getElementById('settings-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {
          thank_you_video_url: formData.get('thank_you_video_url') || '',
          logo_url: formData.get('logo_url') || ''
        };
        
        try {
          const res = await fetch('/admin/api/survey/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await res.json();
          if (result.success) {
            alert('設定を保存しました！');
          } else {
            alert('エラー: ' + (result.error || '保存に失敗しました'));
          }
        } catch (error) {
          alert('通信エラーが発生しました');
        }
      });
    </script>
  `

  return renderAdminLayout('アンケート設定', content, 'surveys')
}
