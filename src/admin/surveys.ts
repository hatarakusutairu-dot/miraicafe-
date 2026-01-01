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
  use_for_review: number
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
  published_as_review: number
  review_id: number | null
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

// プレビュー用の質問レンダリング（実際のアンケートページと同じ構成）
function renderPreviewQuestions(questions: SurveyQuestion[], categoryLabels: Record<string, string>): string {
  const grouped: Record<string, SurveyQuestion[]> = {}
  
  questions.filter(q => q.is_active).forEach(q => {
    const cat = q.question_category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(q)
  })
  
  // 実際のアンケートページと同じカテゴリ順序
  const categoryOrder = [
    'profile', 'satisfaction', 'difficulty', 'instructor', 'exercise',
    'feedback_positive', 'feedback_improve', 'online_feedback',
    'confidence', 'action', 'concerns', 
    'recommend', 'future_topics', 'other', 'review_permission',
    'content', 'environment', 'general'
  ]
  
  // 全カテゴリのラベルとアイコン
  const allCategoryLabels: Record<string, string> = {
    profile: 'あなたについて',
    satisfaction: '総合評価',
    difficulty: '講座の難易度',
    content: '講座内容について',
    instructor: '講師について',
    exercise: '演習・ワークについて',
    feedback_positive: '良かった点',
    feedback_improve: '改善点',
    online_feedback: 'オンライン受講について',
    confidence: '学びの効果',
    action: '実践について',
    concerns: '不安・疑問点',
    recommend: 'おすすめ度',
    future_topics: '今後の講座について',
    review_permission: '公開許可',
    environment: '受講環境について',
    other: 'その他',
    general: 'その他'
  }
  
  const categoryIcons: Record<string, string> = {
    profile: 'fa-user',
    satisfaction: 'fa-star',
    difficulty: 'fa-signal',
    content: 'fa-book-open',
    instructor: 'fa-chalkboard-teacher',
    exercise: 'fa-tasks',
    feedback_positive: 'fa-thumbs-up',
    feedback_improve: 'fa-lightbulb',
    online_feedback: 'fa-laptop',
    confidence: 'fa-graduation-cap',
    action: 'fa-rocket',
    concerns: 'fa-question-circle',
    recommend: 'fa-heart',
    future_topics: 'fa-calendar-plus',
    review_permission: 'fa-share-alt',
    environment: 'fa-laptop',
    other: 'fa-comment-dots',
    general: 'fa-comment-dots'
  }
  
  // プロフィールセクション（年齢、職業、業種）は横並びで表示
  const profileQuestions = grouped['profile'] || []
  
  // 評価系は1つのカードにまとめる
  const ratingCategories = ['satisfaction', 'instructor', 'exercise']
  const ratingQuestions: SurveyQuestion[] = []
  ratingCategories.forEach(cat => {
    if (grouped[cat]) ratingQuestions.push(...grouped[cat])
  })
  
  let html = ''
  
  // プロフィールセクション
  if (profileQuestions.length > 0) {
    html += `
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-user text-purple-500 text-sm"></i>
          </div>
          <span class="font-medium text-gray-700">あなたについて</span>
          <span class="text-xs text-gray-400">（任意）</span>
        </div>
        <div class="grid grid-cols-3 gap-3">
          ${profileQuestions.map(q => `
            <div>
              <p class="text-sm text-gray-600 mb-2">${escapeHtml(q.question_text)}</p>
              <div class="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-400 text-sm">
                選択 <i class="fas fa-chevron-down ml-2 text-xs"></i>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }
  
  // 評価セクション
  if (ratingQuestions.length > 0) {
    html += `
      <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-star text-purple-500 text-sm"></i>
          </div>
          <span class="font-medium text-gray-700">講座の評価</span>
        </div>
        <div class="space-y-4">
          ${ratingQuestions.map(q => renderPreviewQuestion(q)).join('')}
        </div>
      </div>
    `
  }
  
  // その他のカテゴリ
  html += categoryOrder
    .filter(cat => grouped[cat] && grouped[cat].length > 0 && cat !== 'profile' && !ratingCategories.includes(cat))
    .map(cat => {
      const label = allCategoryLabels[cat] || 'その他'
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
  
  return html
}

// 個別質問のプレビューレンダリング
function renderPreviewQuestion(q: SurveyQuestion): string {
  const isRequired = q.is_required === 1
  
  // 5段階評価
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
  
  // ドロップダウン（プルダウン）
  if (q.question_type === 'dropdown') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div>
        <p class="text-gray-700 mb-2">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : '<span class="text-gray-400 text-sm">（任意）</span>'}
        </p>
        <div class="px-4 py-3 bg-gradient-to-r from-white to-purple-50 rounded-2xl border-2 border-purple-100 text-gray-400 text-sm flex items-center justify-between shadow-sm">
          <span>選択してください</span>
          <i class="fas fa-chevron-down text-purple-300"></i>
        </div>
      </div>
    `
  }
  
  // 単一選択（ラジオボタン）
  if (q.question_type === 'choice' || q.question_type === 'single_choice') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div>
        <p class="text-gray-700 mb-3">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : ''}
        </p>
        <div class="space-y-2">
          ${options.map((opt: string, i: number) => `
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all">
              <i class="far fa-circle text-gray-400"></i>
              <span class="text-gray-600">${escapeHtml(opt)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }
  
  // 複数選択（チェックボックス）
  if (q.question_type === 'multi_choice' || q.question_type === 'multiple_choice') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div>
        <p class="text-gray-700 mb-3">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : ''}
        </p>
        <div class="space-y-2">
          ${options.map((opt: string, i: number) => `
            <div class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all">
              <i class="far fa-square text-gray-400"></i>
              <span class="text-gray-600">${escapeHtml(opt)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }
  
  // 自由記述
  if (q.question_type === 'text') {
    return `
      <div>
        <p class="text-gray-700 mb-3">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span class="text-pink-400"> *</span>' : '<span class="text-gray-400 text-sm">（任意）</span>'}
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
    profile: 'プロフィール',
    satisfaction: '総合評価',
    difficulty: '難易度',
    content: '講座内容',
    instructor: '講師',
    exercise: '演習・ワーク',
    feedback_positive: '良かった点',
    feedback_improve: '改善点',
    online_feedback: 'オンライン受講',
    confidence: '学びの効果',
    action: '実践',
    concerns: '不安・疑問',
    recommend: 'おすすめ度',
    future_topics: '今後の講座',
    review_permission: '公開許可',
    environment: '受講環境',
    other: 'その他',
    general: 'その他'
  }

  const typeLabels: Record<string, string> = {
    rating: '⭐ 5段階評価',
    text: '📝 自由記述',
    single_choice: '🔘 単一選択',
    choice: '🔘 単一選択',
    multiple_choice: '☑️ 複数選択',
    multi_choice: '☑️ 複数選択',
    dropdown: '▼ ドロップダウン'
  }
  
  // カテゴリでグループ化
  const groupedByCategory: Record<string, SurveyQuestion[]> = {}
  questions.forEach(q => {
    const cat = q.question_category || 'general'
    if (!groupedByCategory[cat]) groupedByCategory[cat] = []
    groupedByCategory[cat].push(q)
  })
  
  const categoryOrder = [
    'profile', 'satisfaction', 'difficulty', 'instructor', 'exercise',
    'feedback_positive', 'feedback_improve', 'online_feedback',
    'confidence', 'action', 'concerns', 
    'recommend', 'future_topics', 'review_permission', 'other', 'general'
  ]

  const content = `
    <style>
      .question-card {
        transition: all 0.2s ease;
        border-left: 4px solid transparent;
        cursor: grab;
      }
      .question-card:hover {
        border-left-color: #a78bfa;
        transform: translateX(2px);
      }
      .question-card.editing {
        border-left-color: #8b5cf6;
        background: #f5f3ff;
      }
      .question-card.dragging {
        opacity: 0.5;
        cursor: grabbing;
        border-left-color: #8b5cf6;
        background: #ede9fe;
      }
      .question-card.drag-over {
        border-top: 3px solid #8b5cf6;
        margin-top: -3px;
      }
      .drag-handle {
        cursor: grab;
        padding: 8px;
        color: #9ca3af;
        transition: color 0.2s;
      }
      .drag-handle:hover {
        color: #6b7280;
      }
      .drag-handle:active {
        cursor: grabbing;
      }
      .inline-edit {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 4px 8px;
        transition: all 0.2s;
      }
      .inline-edit:hover {
        background: #f3f4f6;
        border-color: #e5e7eb;
      }
      .inline-edit:focus {
        background: white;
        border-color: #a78bfa;
        outline: none;
        box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
      }
      .category-section {
        border-radius: 16px;
        background: white;
        margin-bottom: 16px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .category-header {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        padding: 12px 20px;
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: between;
      }
      .category-header:hover {
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      }
      .category-content {
        padding: 0;
      }
      .option-tag {
        display: inline-flex;
        align-items: center;
        padding: 2px 10px;
        background: #f3f4f6;
        border-radius: 20px;
        font-size: 12px;
        color: #4b5563;
        margin: 2px;
      }
      .option-tag-edit {
        cursor: pointer;
      }
      .option-tag-edit:hover {
        background: #e5e7eb;
      }
      .quick-action-btn {
        opacity: 0;
        transition: opacity 0.2s;
      }
      .question-card:hover .quick-action-btn {
        opacity: 1;
      }
    </style>

    <div class="mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <a href="/admin/surveys" class="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center gap-1">
            <i class="fas fa-arrow-left"></i>分析に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-edit text-purple-500"></i>
            質問の編集
          </h1>
          <p class="text-sm text-gray-500 mt-1">質問をクリックして直接編集できます</p>
        </div>
        <div class="flex gap-2">
          <button onclick="expandAllCategories()" class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm">
            <i class="fas fa-expand-alt mr-1"></i>すべて展開
          </button>
          <button onclick="collapseAllCategories()" class="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm">
            <i class="fas fa-compress-alt mr-1"></i>すべて折りたたむ
          </button>
          <button onclick="showAddQuestionModal()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center gap-2">
            <i class="fas fa-plus"></i>質問を追加
          </button>
        </div>
      </div>
    </div>
    
    <!-- クイック統計 -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="text-2xl font-bold text-purple-600">${questions.length}</div>
        <div class="text-sm text-gray-500">質問数</div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="text-2xl font-bold text-green-600">${questions.filter(q => q.is_active).length}</div>
        <div class="text-sm text-gray-500">有効</div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="text-2xl font-bold text-amber-600">${questions.filter(q => q.is_required).length}</div>
        <div class="text-sm text-gray-500">必須</div>
      </div>
      <div class="bg-white rounded-xl p-4 border border-gray-100">
        <div class="text-2xl font-bold text-blue-600">${questions.filter(q => q.use_for_review).length}</div>
        <div class="text-sm text-gray-500">口コミ用</div>
      </div>
    </div>

    <!-- カテゴリ別質問一覧 -->
    <div id="questions-container">
      ${categoryOrder.filter(cat => groupedByCategory[cat]?.length > 0).map(cat => {
        const catQuestions = groupedByCategory[cat] || []
        return `
          <div class="category-section" data-category="${cat}">
            <div class="category-header" onclick="toggleCategory('${cat}')">
              <div class="flex items-center gap-3 flex-1">
                <i class="fas fa-chevron-down text-gray-400 transition-transform" id="chevron-${cat}"></i>
                <span class="font-medium text-gray-700">${categoryLabels[cat] || cat}</span>
                <span class="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">${catQuestions.length}件</span>
              </div>
              <button onclick="event.stopPropagation(); addQuestionToCategory('${cat}')" 
                      class="text-sm text-purple-600 hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50">
                <i class="fas fa-plus mr-1"></i>追加
              </button>
            </div>
            <div class="category-content" id="content-${cat}" data-category="${cat}">
              ${catQuestions.map(q => `
                <div class="question-card p-4 border-b border-gray-50 hover:bg-gray-50" 
                     data-id="${q.id}" 
                     data-sort="${q.sort_order}"
                     draggable="true"
                     ondragstart="handleDragStart(event, ${q.id})"
                     ondragend="handleDragEnd(event)"
                     ondragover="handleDragOver(event)"
                     ondragleave="handleDragLeave(event)"
                     ondrop="handleDrop(event, ${q.id})">
                  <div class="flex items-start gap-3">
                    <!-- ドラッグハンドル -->
                    <div class="drag-handle flex flex-col items-center justify-center" title="ドラッグして並び替え">
                      <i class="fas fa-grip-vertical text-lg"></i>
                    </div>
                    
                    <!-- 順序表示 -->
                    <div class="flex flex-col items-center gap-1">
                      <span class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm font-medium sort-order-display">
                        ${q.sort_order}
                      </span>
                    </div>
                    
                    <!-- メイン情報 -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        ${q.is_required ? '<span class="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">必須</span>' : '<span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">任意</span>'}
                        ${q.use_for_review ? '<span class="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full"><i class="fas fa-bullhorn mr-1"></i>口コミ用</span>' : ''}
                        <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">${typeLabels[q.question_type] || q.question_type}</span>
                        ${!q.is_active ? '<span class="text-xs px-2 py-0.5 bg-gray-300 text-gray-600 rounded-full">無効</span>' : ''}
                      </div>
                      
                      <!-- 質問文（クリックで編集） -->
                      <div class="mb-2">
                        <input type="text" value="${escapeHtml(q.question_text)}" 
                               class="inline-edit w-full text-gray-800 font-medium"
                               onchange="updateQuestionText(${q.id}, this.value)"
                               placeholder="質問文を入力...">
                      </div>
                      
                      <!-- 選択肢（あれば） -->
                      ${q.options ? `
                        <div class="flex flex-wrap gap-1 mb-2">
                          ${JSON.parse(q.options).map((opt: string, i: number) => `
                            <span class="option-tag option-tag-edit" onclick="editOptions(${q.id})" title="クリックで選択肢を編集">
                              ${escapeHtml(opt)}
                            </span>
                          `).join('')}
                          <button onclick="editOptions(${q.id})" class="option-tag text-purple-600 hover:bg-purple-100">
                            <i class="fas fa-edit"></i>
                          </button>
                        </div>
                      ` : ''}
                    </div>
                    
                    <!-- アクション -->
                    <div class="flex items-center gap-1">
                      <button onclick="toggleRequired(${q.id}, ${q.is_required})" 
                              class="quick-action-btn p-2 rounded-lg transition ${q.is_required ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-100'}"
                              title="${q.is_required ? '必須を解除' : '必須にする'}">
                        <i class="fas fa-asterisk"></i>
                      </button>
                      <button onclick="toggleQuestionActive(${q.id}, ${q.is_active})" 
                              class="quick-action-btn p-2 rounded-lg transition ${q.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}"
                              title="${q.is_active ? '無効にする' : '有効にする'}">
                        <i class="fas fa-${q.is_active ? 'eye' : 'eye-slash'}"></i>
                      </button>
                      <button onclick="editQuestion(${q.id})" 
                              class="quick-action-btn p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                              title="詳細編集">
                        <i class="fas fa-cog"></i>
                      </button>
                      <button onclick="deleteQuestion(${q.id})" 
                              class="quick-action-btn p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="削除">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `
      }).join('')}
    </div>

    <!-- 質問追加/編集モーダル -->
    <div id="question-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-6">
          <h3 id="modal-title" class="text-xl font-bold text-gray-800">質問を追加</h3>
          <button onclick="closeQuestionModal()" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <i class="fas fa-times text-gray-500"></i>
          </button>
        </div>
        <form id="question-form" class="space-y-4">
          <input type="hidden" name="id" id="question-id">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">質問文 <span class="text-red-500">*</span></label>
            <textarea name="question_text" id="question-text" rows="2" required
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      placeholder="例: 講座全体の満足度を教えてください"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">種類 <span class="text-red-500">*</span></label>
              <select name="question_type" id="question-type" required onchange="toggleOptionsField()"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="rating">⭐ 5段階評価</option>
                <option value="text">📝 自由記述</option>
                <option value="single_choice">🔘 単一選択</option>
                <option value="multiple_choice">☑️ 複数選択</option>
                <option value="dropdown">▼ ドロップダウン</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <select name="question_category" id="question-category"
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
                <option value="profile">👤 プロフィール</option>
                <option value="satisfaction">⭐ 総合評価</option>
                <option value="difficulty">📊 難易度</option>
                <option value="instructor">👨‍🏫 講師</option>
                <option value="exercise">💪 演習・ワーク</option>
                <option value="feedback_positive">👍 良かった点</option>
                <option value="feedback_improve">💡 改善点</option>
                <option value="online_feedback">💻 オンライン受講</option>
                <option value="confidence">📈 学びの効果</option>
                <option value="action">🚀 実践</option>
                <option value="concerns">❓ 不安・疑問</option>
                <option value="recommend">❤️ おすすめ度</option>
                <option value="future_topics">📅 今後の講座</option>
                <option value="review_permission">📢 公開許可</option>
                <option value="other">💬 その他</option>
              </select>
            </div>
          </div>
          <div id="options-field" class="hidden">
            <label class="block text-sm font-medium text-gray-700 mb-2">選択肢</label>
            <textarea name="options" id="question-options" rows="4"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                   placeholder="選択肢1&#10;選択肢2&#10;選択肢3"></textarea>
            <p class="text-xs text-gray-500 mt-1">改行または「/」で区切って入力してください</p>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">表示順</label>
              <input type="number" name="sort_order" id="question-sort" value="0" min="0"
                     class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">
            </div>
            <div class="flex items-end pb-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="is_required" id="question-required"
                       class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500">
                <span class="text-gray-700 text-sm">必須</span>
              </label>
            </div>
            <div class="flex items-end pb-2">
              <label class="flex items-center gap-2 cursor-pointer" id="review-label">
                <input type="checkbox" name="use_for_review" id="question-use-review"
                       class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                <span class="text-gray-700 text-sm">口コミ用</span>
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
    
    <!-- 選択肢編集モーダル -->
    <div id="options-modal" class="fixed inset-0 bg-black/50 z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-800">選択肢を編集</h3>
          <button onclick="closeOptionsModal()" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <i class="fas fa-times text-gray-500"></i>
          </button>
        </div>
        <input type="hidden" id="edit-options-id">
        <textarea id="edit-options-text" rows="6" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-4"
                  placeholder="選択肢1&#10;選択肢2&#10;選択肢3"></textarea>
        <p class="text-xs text-gray-500 mb-4">1行に1つの選択肢を入力してください</p>
        <div class="flex justify-end gap-3">
          <button onclick="closeOptionsModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
            キャンセル
          </button>
          <button onclick="saveOptions()" class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
            保存
          </button>
        </div>
      </div>
    </div>

    <script>
      // カテゴリの展開/折りたたみ
      function toggleCategory(cat) {
        const content = document.getElementById('content-' + cat);
        const chevron = document.getElementById('chevron-' + cat);
        if (content.style.display === 'none') {
          content.style.display = 'block';
          chevron.style.transform = 'rotate(0deg)';
        } else {
          content.style.display = 'none';
          chevron.style.transform = 'rotate(-90deg)';
        }
      }
      
      function expandAllCategories() {
        document.querySelectorAll('.category-content').forEach(el => el.style.display = 'block');
        document.querySelectorAll('[id^="chevron-"]').forEach(el => el.style.transform = 'rotate(0deg)');
      }
      
      function collapseAllCategories() {
        document.querySelectorAll('.category-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('[id^="chevron-"]').forEach(el => el.style.transform = 'rotate(-90deg)');
      }
      
      // カテゴリ指定で質問追加
      function addQuestionToCategory(cat) {
        showAddQuestionModal();
        document.getElementById('question-category').value = cat;
      }
      
      // ドラッグ&ドロップ処理
      let draggedId = null;
      let draggedElement = null;
      
      function handleDragStart(e, id) {
        draggedId = id;
        draggedElement = e.target.closest('.question-card');
        draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
      }
      
      function handleDragEnd(e) {
        if (draggedElement) {
          draggedElement.classList.remove('dragging');
        }
        document.querySelectorAll('.question-card').forEach(card => {
          card.classList.remove('drag-over');
        });
        draggedId = null;
        draggedElement = null;
      }
      
      function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const card = e.target.closest('.question-card');
        if (card && card !== draggedElement) {
          // 他のカードのdrag-overを削除
          document.querySelectorAll('.question-card').forEach(c => {
            if (c !== card) c.classList.remove('drag-over');
          });
          card.classList.add('drag-over');
        }
      }
      
      function handleDragLeave(e) {
        const card = e.target.closest('.question-card');
        if (card && !card.contains(e.relatedTarget)) {
          card.classList.remove('drag-over');
        }
      }
      
      async function handleDrop(e, targetId) {
        e.preventDefault();
        const card = e.target.closest('.question-card');
        if (card) card.classList.remove('drag-over');
        
        if (draggedId === null || draggedId === targetId) return;
        
        // 同じカテゴリ内でのみ移動可能
        const draggedCard = document.querySelector('[data-id="' + draggedId + '"]');
        const targetCard = document.querySelector('[data-id="' + targetId + '"]');
        
        if (!draggedCard || !targetCard) return;
        
        const draggedCategory = draggedCard.closest('.category-content');
        const targetCategory = targetCard.closest('.category-content');
        
        if (draggedCategory !== targetCategory) {
          alert('異なるカテゴリ間の移動はできません。カテゴリを変更するには編集ボタンを使用してください。');
          return;
        }
        
        // 現在のカテゴリ内の全質問を取得
        const categoryContent = targetCategory;
        const cards = Array.from(categoryContent.querySelectorAll('.question-card'));
        const draggedIndex = cards.indexOf(draggedCard);
        const targetIndex = cards.indexOf(targetCard);
        
        // DOM上で並び替え
        if (draggedIndex < targetIndex) {
          targetCard.parentNode.insertBefore(draggedCard, targetCard.nextSibling);
        } else {
          targetCard.parentNode.insertBefore(draggedCard, targetCard);
        }
        
        // 新しい順序でsort_orderを更新
        const updatedCards = Array.from(categoryContent.querySelectorAll('.question-card'));
        const updates = [];
        
        updatedCards.forEach((card, index) => {
          const id = parseInt(card.dataset.id);
          const newOrder = index + 1;
          const orderDisplay = card.querySelector('.sort-order-display');
          if (orderDisplay) orderDisplay.textContent = newOrder;
          updates.push({ id, sort_order: newOrder });
        });
        
        // サーバーに一括更新
        try {
          for (const update of updates) {
            const res = await fetch('/admin/api/surveys/questions/' + update.id);
            const q = await res.json();
            q.sort_order = update.sort_order;
            q.options = q.options ? JSON.parse(q.options) : null;
            
            await fetch('/admin/api/surveys/questions/' + update.id, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(q)
            });
          }
          
          // 成功メッセージ（小さなトースト）
          showToast('並び順を更新しました');
        } catch (e) {
          alert('順序の更新に失敗しました');
          location.reload();
        }
      }
      
      function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          toast.style.transition = 'opacity 0.3s';
          setTimeout(() => toast.remove(), 300);
        }, 2000);
      }

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
        const reviewLabel = document.getElementById('review-label');
        const needsOptions = ['choice', 'single_choice', 'multiple_choice', 'multi_choice', 'dropdown'].includes(type);
        optionsField.classList.toggle('hidden', !needsOptions);
        // 口コミ用は自由記述のみ
        if (reviewLabel) {
          reviewLabel.style.opacity = type === 'text' ? '1' : '0.5';
          if (type !== 'text') {
            document.getElementById('question-use-review').checked = false;
          }
        }
      }
      
      // インライン編集: 質問文
      async function updateQuestionText(id, text) {
        if (!text.trim()) {
          alert('質問文は必須です');
          location.reload();
          return;
        }
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id);
          const q = await res.json();
          q.question_text = text;
          q.options = q.options ? JSON.parse(q.options) : null;
          
          await fetch('/admin/api/surveys/questions/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
          });
        } catch (e) {
          alert('更新に失敗しました');
          location.reload();
        }
      }
      
      // インライン編集: 表示順
      async function updateSortOrder(id, order) {
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id);
          const q = await res.json();
          q.sort_order = parseInt(order) || 0;
          q.options = q.options ? JSON.parse(q.options) : null;
          
          await fetch('/admin/api/surveys/questions/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
          });
          
          // 順序変更後はリロードしてソート順を反映
          location.reload();
        } catch (e) {
          alert('更新に失敗しました');
        }
      }
      
      // 必須フラグのトグル
      async function toggleRequired(id, currentState) {
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id);
          const q = await res.json();
          q.is_required = currentState ? 0 : 1;
          q.options = q.options ? JSON.parse(q.options) : null;
          
          await fetch('/admin/api/surveys/questions/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
          });
          location.reload();
        } catch (e) {
          alert('更新に失敗しました');
        }
      }
      
      // 選択肢編集モーダル
      async function editOptions(id) {
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id);
          const q = await res.json();
          document.getElementById('edit-options-id').value = id;
          document.getElementById('edit-options-text').value = q.options ? JSON.parse(q.options).join('\\n') : '';
          document.getElementById('options-modal').classList.remove('hidden');
        } catch (e) {
          alert('取得に失敗しました');
        }
      }
      
      function closeOptionsModal() {
        document.getElementById('options-modal').classList.add('hidden');
      }
      
      async function saveOptions() {
        const id = document.getElementById('edit-options-id').value;
        const text = document.getElementById('edit-options-text').value;
        const options = text.split('\\n').map(s => s.trim()).filter(s => s);
        
        try {
          const res = await fetch('/admin/api/surveys/questions/' + id);
          const q = await res.json();
          q.options = options.length > 0 ? options : null;
          
          await fetch('/admin/api/surveys/questions/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(q)
          });
          location.reload();
        } catch (e) {
          alert('更新に失敗しました');
        }
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
          // 選択肢を改行区切りで表示
          document.getElementById('question-options').value = q.options ? JSON.parse(q.options).join('\\n') : '';
          document.getElementById('question-sort').value = q.sort_order;
          document.getElementById('question-required').checked = q.is_required === 1;
          document.getElementById('question-use-review').checked = q.use_for_review === 1;
          
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
        const optionsRaw = formData.get('options') || '';
        // 改行または「/」で区切る
        const optionsParsed = optionsRaw.split(/[\\n\\/]/).map(s => s.trim()).filter(s => s);
        
        const data = {
          question_text: formData.get('question_text'),
          question_type: formData.get('question_type'),
          question_category: formData.get('question_category'),
          options: optionsParsed.length > 0 ? optionsParsed : null,
          sort_order: parseInt(formData.get('sort_order')) || 0,
          is_required: formData.get('is_required') ? 1 : 0,
          use_for_review: formData.get('use_for_review') ? 1 : 0
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
  // 公開可能な回答（公開OKまたは匿名OK、かつ未公開）
  const publishableResponses = responses.filter(r => 
    (r.publish_consent === 'yes' || r.publish_consent === 'anonymous') && !r.published_as_review
  )
  
  // 口コミ用の質問（自由記述で use_for_review が有効）
  const reviewQuestions = questions.filter(q => q.use_for_review && q.question_type === 'text')
  
  const content = `
    <div class="mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <a href="/admin/surveys" class="text-gray-500 hover:text-gray-700 text-sm mb-2 inline-flex items-center gap-1">
            <i class="fas fa-arrow-left"></i>分析に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-list text-purple-500"></i>
            回答一覧
          </h1>
        </div>
        <div class="flex gap-3">
          <button onclick="openPublishModal()" class="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg transition flex items-center gap-2 shadow-sm ${publishableResponses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${publishableResponses.length === 0 ? 'disabled' : ''}>
            <i class="fas fa-bullhorn"></i>口コミ公開 (${publishableResponses.length})
          </button>
          <button onclick="exportResponses()" class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
            <i class="fas fa-download"></i>CSVエクスポート
          </button>
        </div>
      </div>
    </div>
    
    <!-- 口コミ公開設定の案内 -->
    ${reviewQuestions.length === 0 ? `
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div class="flex items-start gap-3">
          <i class="fas fa-info-circle text-amber-500 mt-0.5"></i>
          <div>
            <p class="text-amber-800 font-medium">口コミ公開用の質問が設定されていません</p>
            <p class="text-amber-600 text-sm mt-1">
              <a href="/admin/surveys/questions" class="underline hover:no-underline">質問の編集</a>で、自由記述の質問に「口コミ用」を設定すると、その回答が口コミとして公開できます。
            </p>
          </div>
        </div>
      </div>
    ` : ''}

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      ${responses.length > 0 ? `
        <div class="divide-y divide-gray-100">
          ${responses.map(r => {
            const answers = JSON.parse(r.answers || '{}')
            const canPublish = (r.publish_consent === 'yes' || r.publish_consent === 'anonymous') && !r.published_as_review
            return `
              <div class="p-6 hover:bg-gray-50 transition ${r.published_as_review ? 'bg-green-50/50' : ''}">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-4">
                    ${canPublish ? `
                      <label class="flex items-center">
                        <input type="checkbox" class="publish-checkbox w-5 h-5 text-green-600 rounded focus:ring-green-500" 
                               data-id="${r.id}" 
                               data-name="${escapeHtml(r.respondent_name) || ''}"
                               data-consent="${r.publish_consent}"
                               data-rating="${r.overall_rating || 0}"
                               data-course="${escapeHtml(r.course_name) || ''}"
                               data-answers='${escapeHtml(JSON.stringify(answers))}'>
                      </label>
                    ` : ''}
                    <div class="flex text-yellow-400 text-lg">
                      ${renderStars(r.overall_rating || 0)}
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">${escapeHtml(r.respondent_name) || '匿名'}</p>
                      ${r.respondent_email ? `<p class="text-sm text-gray-500">${escapeHtml(r.respondent_email)}</p>` : ''}
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    ${r.published_as_review ? `
                      <span class="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <i class="fas fa-check"></i>公開済み
                      </span>
                    ` : `
                      <span class="text-xs px-3 py-1 rounded-full ${
                        r.publish_consent === 'yes' ? 'bg-green-100 text-green-700' :
                        r.publish_consent === 'anonymous' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }">
                        ${r.publish_consent === 'yes' ? '公開OK' : r.publish_consent === 'anonymous' ? '匿名OK' : '非公開'}
                      </span>
                    `}
                    <span class="text-sm text-gray-400">${formatDate(r.created_at)}</span>
                    ${canPublish ? `
                      <button onclick="openSinglePublishModal(${r.id})" class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="この回答を口コミとして公開">
                        <i class="fas fa-bullhorn"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
                
                ${r.course_name ? `
                  <p class="text-sm text-purple-600 mb-3">
                    <i class="fas fa-book mr-1"></i>${escapeHtml(r.course_name)}
                  </p>
                ` : ''}
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${questions.filter(q => answers[q.id] !== undefined).map(q => `
                    <div class="rounded-lg p-3 ${q.use_for_review ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}">
                      <p class="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        ${q.use_for_review ? '<i class="fas fa-bullhorn text-green-500" title="口コミ用"></i>' : ''}
                        ${escapeHtml(q.question_text)}
                      </p>
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
    
    <!-- 一括公開モーダル -->
    <div id="publish-modal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 overflow-auto">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div class="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="fas fa-bullhorn text-lg"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">口コミとして公開</h3>
                <p class="text-white/70 text-sm">選択した回答を口コミページに公開します</p>
              </div>
            </div>
            <button onclick="closePublishModal()" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div id="publish-list" class="space-y-4">
            <!-- 選択された回答がここに表示される -->
          </div>
        </div>
        
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p class="text-sm text-gray-500">
            <i class="fas fa-info-circle mr-1"></i>
            公開後も口コミ管理画面で編集できます
          </p>
          <div class="flex gap-3">
            <button onclick="closePublishModal()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition">
              キャンセル
            </button>
            <button onclick="publishSelectedReviews()" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2">
              <i class="fas fa-check"></i>公開する
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 個別公開モーダル -->
    <div id="single-publish-modal" class="fixed inset-0 bg-black/60 z-50 hidden flex items-center justify-center p-4 overflow-auto">
      <div class="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div class="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="fas fa-edit text-lg"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">口コミを編集して公開</h3>
                <p class="text-white/70 text-sm">内容を確認・編集してから公開</p>
              </div>
            </div>
            <button onclick="closeSinglePublishModal()" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <form id="single-publish-form" class="p-6 space-y-4">
          <input type="hidden" name="response_id" id="edit-response-id">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">表示名</label>
            <input type="text" name="reviewer_name" id="edit-reviewer-name"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none">
            <p class="text-xs text-gray-400 mt-1">匿名希望の場合は「匿名」と表示されます</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">評価</label>
            <div class="flex gap-2" id="edit-rating-stars">
              ${[1,2,3,4,5].map(n => `
                <button type="button" onclick="setEditRating(${n})" class="text-3xl text-gray-300 hover:text-yellow-400 transition edit-star" data-rating="${n}">
                  <i class="fas fa-star"></i>
                </button>
              `).join('')}
            </div>
            <input type="hidden" name="rating" id="edit-rating" value="5">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">講座名</label>
            <input type="text" name="course_name" id="edit-course-name"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                   placeholder="講座名（任意）">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">口コミ内容 <span class="text-red-500">*</span></label>
            <textarea name="comment" id="edit-comment" rows="5" required
                      class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                      placeholder="口コミ内容を入力してください"></textarea>
          </div>
        </form>
        
        <div class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button onclick="closeSinglePublishModal()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition">
            キャンセル
          </button>
          <button onclick="submitSinglePublish()" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2">
            <i class="fas fa-check"></i>公開する
          </button>
        </div>
      </div>
    </div>

    <script>
      // 口コミ用の質問ID
      const reviewQuestionIds = [${reviewQuestions.map(q => q.id).join(',')}];
      
      function exportResponses() {
        window.location.href = '/admin/api/surveys/export';
      }
      
      function openPublishModal() {
        const checkboxes = document.querySelectorAll('.publish-checkbox:checked');
        if (checkboxes.length === 0) {
          alert('公開する回答を選択してください');
          return;
        }
        
        const list = document.getElementById('publish-list');
        list.innerHTML = '';
        
        checkboxes.forEach(cb => {
          const answers = JSON.parse(cb.dataset.answers || '{}');
          const consent = cb.dataset.consent;
          const name = consent === 'yes' ? (cb.dataset.name || '匿名') : '匿名';
          const rating = parseInt(cb.dataset.rating) || 0;
          const course = cb.dataset.course;
          
          // 口コミ用の回答を取得
          let comment = '';
          reviewQuestionIds.forEach(qId => {
            if (answers[qId]) {
              comment += (comment ? '\\n\\n' : '') + answers[qId];
            }
          });
          
          list.innerHTML += \`
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-200" data-id="\${cb.dataset.id}">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span class="font-medium text-gray-800">\${name}</span>
                  <div class="flex text-yellow-400">
                    \${'<i class="fas fa-star"></i>'.repeat(rating)}
                    \${'<i class="far fa-star text-gray-300"></i>'.repeat(5 - rating)}
                  </div>
                </div>
                \${course ? \`<span class="text-sm text-purple-600"><i class="fas fa-book mr-1"></i>\${course}</span>\` : ''}
              </div>
              <p class="text-gray-700 whitespace-pre-wrap">\${comment || '（コメントなし）'}</p>
              <input type="hidden" class="publish-data" 
                     data-id="\${cb.dataset.id}"
                     data-name="\${name}"
                     data-rating="\${rating}"
                     data-course="\${course}"
                     data-comment="\${comment}">
            </div>
          \`;
        });
        
        document.getElementById('publish-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
      
      function closePublishModal() {
        document.getElementById('publish-modal').classList.add('hidden');
        document.body.style.overflow = '';
      }
      
      async function publishSelectedReviews() {
        const items = document.querySelectorAll('#publish-list .publish-data');
        const reviews = [];
        
        items.forEach(item => {
          reviews.push({
            response_id: parseInt(item.dataset.id),
            reviewer_name: item.dataset.name,
            rating: parseInt(item.dataset.rating),
            course_name: item.dataset.course,
            comment: item.dataset.comment
          });
        });
        
        if (reviews.length === 0) return;
        
        try {
          const res = await fetch('/admin/api/surveys/publish-reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviews })
          });
          
          const result = await res.json();
          if (result.success) {
            alert(\`\${result.count}件の口コミを公開しました\`);
            location.reload();
          } else {
            alert('エラー: ' + (result.error || '公開に失敗しました'));
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }
      
      // 個別公開
      function openSinglePublishModal(responseId) {
        const checkbox = document.querySelector(\`.publish-checkbox[data-id="\${responseId}"]\`);
        if (!checkbox) return;
        
        const answers = JSON.parse(checkbox.dataset.answers || '{}');
        const consent = checkbox.dataset.consent;
        const name = consent === 'yes' ? (checkbox.dataset.name || '') : '匿名';
        const rating = parseInt(checkbox.dataset.rating) || 5;
        const course = checkbox.dataset.course;
        
        // 口コミ用の回答を取得
        let comment = '';
        reviewQuestionIds.forEach(qId => {
          if (answers[qId]) {
            comment += (comment ? '\\n\\n' : '') + answers[qId];
          }
        });
        
        document.getElementById('edit-response-id').value = responseId;
        document.getElementById('edit-reviewer-name').value = name;
        document.getElementById('edit-rating').value = rating;
        document.getElementById('edit-course-name').value = course;
        document.getElementById('edit-comment').value = comment;
        
        setEditRating(rating);
        
        document.getElementById('single-publish-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      }
      
      function closeSinglePublishModal() {
        document.getElementById('single-publish-modal').classList.add('hidden');
        document.body.style.overflow = '';
      }
      
      function setEditRating(rating) {
        document.getElementById('edit-rating').value = rating;
        document.querySelectorAll('.edit-star').forEach(star => {
          const starRating = parseInt(star.dataset.rating);
          star.classList.toggle('text-yellow-400', starRating <= rating);
          star.classList.toggle('text-gray-300', starRating > rating);
        });
      }
      
      async function submitSinglePublish() {
        const form = document.getElementById('single-publish-form');
        const formData = new FormData(form);
        
        const comment = formData.get('comment');
        if (!comment || !comment.trim()) {
          alert('口コミ内容を入力してください');
          return;
        }
        
        const review = {
          response_id: parseInt(formData.get('response_id')),
          reviewer_name: formData.get('reviewer_name') || '匿名',
          rating: parseInt(formData.get('rating')) || 5,
          course_name: formData.get('course_name') || '',
          comment: comment.trim()
        };
        
        try {
          const res = await fetch('/admin/api/surveys/publish-reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviews: [review] })
          });
          
          const result = await res.json();
          if (result.success) {
            alert('口コミを公開しました');
            location.reload();
          } else {
            alert('エラー: ' + (result.error || '公開に失敗しました'));
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }
      
      // ESCキーでモーダルを閉じる
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closePublishModal();
          closeSinglePublishModal();
        }
      });
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
