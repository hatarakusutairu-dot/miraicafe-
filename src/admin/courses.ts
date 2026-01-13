import { renderAdminLayout } from './layout'
import { Course, courseCategories } from '../data'

// HTMLエスケープ関数
function escapeAttr(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 講座一覧ページ
export const renderCoursesList = (courses: Course[]) => {
  const content = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">講座管理</h1>
        <p class="text-gray-500 mt-1">全${courses.length}件の講座</p>
      </div>
      <a href="/admin/courses/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition">
        <i class="fas fa-plus mr-2"></i>
        新規作成
      </a>
    </div>

    <!-- Courses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${courses.map(course => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
          <div class="h-40 overflow-hidden relative">
            <img src="${course.image}" alt="${escapeAttr(course.title)}" class="w-full h-full object-cover">
            <div class="absolute top-3 right-3">
              <span class="px-2 py-1 text-xs rounded bg-white/90 text-gray-700">${course.category}</span>
            </div>
            <div class="absolute top-3 left-3">
              <button data-id="${course.id}" data-title="${escapeAttr(course.title)}" onclick="confirmDelete(this.dataset.id, this.dataset.title)" 
                class="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-sm shadow-lg transition">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div class="p-4">
            <h3 class="font-bold text-gray-800 mb-2 line-clamp-2">${course.title}</h3>
            <p class="text-sm text-gray-500 line-clamp-2 mb-3">${course.description}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span><i class="fas fa-clock mr-1"></i>${course.duration || '未設定'}</span>
              <span class="font-bold text-amber-600">¥${(course.price || 0).toLocaleString()}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <a href="/courses/${course.id}" target="_blank" class="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm">
                <i class="fas fa-eye mr-1"></i>表示
              </a>
              <a href="/admin/courses/edit/${course.id}" class="flex-1 text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm">
                <i class="fas fa-edit mr-1"></i>編集
              </a>
            </div>
          </div>
        </div>
      `).join('')}
      
      ${courses.length === 0 ? `
        <div class="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
          <i class="fas fa-book-open text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">まだ講座がありません</p>
          <a href="/admin/courses/new" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            最初の講座を作成する
          </a>
        </div>
      ` : ''}
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2">講座を削除</h3>
        <p class="text-gray-600 mb-4">「<span id="delete-title"></span>」を削除しますか？この操作は取り消せません。</p>
        <div class="flex gap-3">
          <form id="delete-form" method="POST" class="flex-1">
            <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
              削除する
            </button>
          </form>
          <button onclick="closeDeleteModal()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">
            キャンセル
          </button>
        </div>
      </div>
    </div>

    <script>
      // Delete modal
      function confirmDelete(id, title) {
        document.getElementById('delete-title').textContent = title;
        document.getElementById('delete-form').action = '/admin/courses/delete/' + id;
        document.getElementById('delete-modal').classList.remove('hidden');
        document.getElementById('delete-modal').classList.add('flex');
      }

      function closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        document.getElementById('delete-modal').classList.remove('flex');
      }

      document.getElementById('delete-modal').addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
      });
    </script>
  `

  return renderAdminLayout('講座管理', content, 'courses')
}

// 講座新規作成・編集ページ
export const renderCourseForm = (course?: Course, error?: string) => {
  const isEdit = !!course
  const title = isEdit ? '講座を編集' : '新規講座作成'

  const levelOptions = ['初級', '中級', '上級', '全レベル']
  const categories = courseCategories || ['AI入門', 'ビジネス活用', 'エンジニア向け', 'その他']
  
  // 新規作成時のデフォルトFAQ
  const defaultFaq = [
    { question: '初心者でも参加できますか？', answer: 'はい、初心者の方でも安心してご参加いただけます。基礎から丁寧に解説しますので、AIに触れたことがない方でも大丈夫です。' },
    { question: '受講に必要なものは何ですか？', answer: 'パソコン（Windows/Mac）とインターネット環境があればご参加いただけます。スマートフォンやタブレットでも視聴可能ですが、実践演習にはパソコンをお勧めします。' },
    { question: '質問はできますか？', answer: 'はい、講座中はいつでも質問していただけます。チャットでの質問に加え、質疑応答の時間も設けています。' },
    { question: '支払い方法を教えてください', answer: 'クレジットカード決済（Stripe）に対応しております。VISA、Mastercard、American Expressがご利用いただけます。※JCB、Diners Club、Discoverは現在ご利用いただけません。コース講座の場合は、一括払い（早期割引あり）・単発参加からお選びいただけます。' },
    { question: 'キャンセルや返金はできますか？', answer: 'デジタルコンテンツの性質上、お申込み・決済完了後の返金には原則として応じておりません。個別日程の講座については、開催日の3日前までにご連絡いただければ、1回に限り日程変更が可能です。詳細はキャンセルポリシーをご確認ください。' }
  ]

  const content = `
    <div class="mb-6">
      <a href="/admin/courses" class="text-gray-500 hover:text-gray-700 text-sm">
        <i class="fas fa-arrow-left mr-1"></i>講座一覧に戻る
      </a>
      <h1 class="text-2xl font-bold text-gray-800 mt-2">${title}</h1>
    </div>

    ${error ? `
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span>${error}</span>
      </div>
    ` : ''}

    <form method="POST" action="${isEdit ? '/admin/courses/update/' + course?.id : '/admin/courses/create'}" class="space-y-6">
      
      <!-- 基本情報 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-info-circle text-blue-500 mr-2"></i>基本情報
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">講座名 <span class="text-red-500">*</span></label>
            <input type="text" name="title" required value="${escapeAttr(course?.title || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: AI基礎講座〜ChatGPT入門〜">
          </div>

          <!-- SEOスコアパネル -->
          <div class="seo-panel mt-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                  <span id="seo-score" class="text-xl font-bold text-slate-400">--</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-700">SEOスコア</p>
                  <p class="text-xs text-slate-500">講座名と説明を入力すると自動計算</p>
                </div>
              </div>
              <button type="button" id="ai-suggest-btn" 
                class="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                <i class="fas fa-robot"></i>
                <span>AI提案を見る</span>
              </button>
            </div>
            <div id="seo-feedback" class="mt-3 text-sm space-y-1 hidden">
              <!-- フィードバックがここに表示 -->
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">キャッチフレーズ</label>
            <input type="text" name="catchphrase" value="${course?.catchphrase || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: AIの世界への第一歩を踏み出そう">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">カテゴリ <span class="text-red-500">*</span></label>
              <select name="category" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">選択してください</option>
                ${categories.map(cat => `<option value="${cat}" ${course?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">レベル <span class="text-red-500">*</span></label>
              <select name="level" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">選択してください</option>
                ${levelOptions.map(level => `<option value="${level}" ${course?.level === level ? 'selected' : ''}>${level}</option>`).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">講座説明 <span class="text-red-500">*</span></label>
            <textarea name="description" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="講座の内容を詳しく説明してください">${escapeAttr(course?.description || '')}</textarea>
          </div>
        </div>
      </div>

      <!-- SEO設定 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-search text-blue-500 mr-2"></i>SEO設定
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              メタディスクリプション
              <span class="text-xs text-gray-500 ml-1">（検索結果に表示される説明文）</span>
            </label>
            <div class="flex gap-2 items-start">
              <textarea name="meta_description" id="meta_description" rows="3" maxlength="160"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                placeholder="この講座の内容を120文字程度で要約してください">${escapeAttr(course?.meta_description || '')}</textarea>
              <button type="button" id="generate-meta-btn"
                class="px-4 py-2 text-white font-bold rounded-lg transition-all hover:opacity-90 hover:scale-105 whitespace-nowrap"
                style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); min-height: 80px;"
                onclick="generateMetaDescription()">
                <i class="fas fa-magic mr-1"></i><br>AI生成
              </button>
            </div>
            <div class="flex justify-between mt-1">
              <span class="text-xs text-gray-500">💡 内容から自動で要約を生成します</span>
              <span class="text-xs text-gray-500"><span id="meta-char-count">0</span>/160</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              キーワード
              <span class="text-xs text-gray-500 ml-1">（カンマ区切りで3〜5個）</span>
            </label>
            <input type="text" name="keywords" value="${escapeAttr(course?.keywords || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: AI講座, ChatGPT, 初心者向け">
          </div>
        </div>
      </div>

      <!-- 詳細設定 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-cog text-blue-500 mr-2"></i>詳細設定
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">開催時間</label>
            <input type="text" name="duration" value="${course?.duration || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: 90分">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">定員</label>
            <input type="number" name="maxCapacity" value="${course?.maxCapacity || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: 10">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">受講料（税込）<span class="text-red-500">*</span></label>
            <input type="number" name="price" required value="${course?.price || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: 9800">
          </div>
        </div>
      </div>

      <!-- 開催形式・オンラインURL -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-video text-blue-500 mr-2"></i>開催形式・オンライン設定
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">開催形式</label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input type="radio" name="meeting_type" value="online" ${(!course?.meeting_type || course?.meeting_type === 'online') ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700"><i class="fas fa-laptop mr-1"></i>オンライン</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" name="meeting_type" value="offline" ${course?.meeting_type === 'offline' ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700"><i class="fas fa-building mr-1"></i>対面</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" name="meeting_type" value="hybrid" ${course?.meeting_type === 'hybrid' ? 'checked' : ''}
                  class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700"><i class="fas fa-arrows-alt-h mr-1"></i>ハイブリッド</span>
              </label>
            </div>
          </div>

          <div id="online-url-section">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              オンラインURL（Google Meet）
              <span class="text-xs text-gray-500 ml-1">予約完了後に受講者に共有されます</span>
            </label>
            <input type="url" name="online_url" value="${escapeAttr(course?.online_url || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: https://meet.google.com/xxx-xxxx-xxx">
            <p class="mt-1 text-xs text-gray-500">
              <i class="fas fa-info-circle mr-1"></i>
              Google Meetのリンクを設定してください
            </p>
          </div>
        </div>
      </div>

      <!-- こんな方におすすめ -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-users text-blue-500 mr-2"></i>こんな方におすすめ
        </h2>
        <textarea name="targetAudience" rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="1行に1つずつ入力してください（改行区切り）&#10;例:&#10;AIに興味があるが何から始めていいかわからない方&#10;業務効率化を図りたいビジネスパーソン">${course?.targetAudience?.join('\n') || ''}</textarea>
      </div>

      <!-- カリキュラム -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-list-ol text-blue-500 mr-2"></i>カリキュラム
        </h2>
        <div id="curriculum-container" class="space-y-3">
          ${(course?.curriculum && course.curriculum.length > 0 ? course.curriculum : [{ title: '', duration: '', description: '' }]).map((item, index) => `
            <div class="curriculum-item p-4 border border-gray-200 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div class="md:col-span-5">
                  <input type="text" name="curriculum_title[]" value="${item.title || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="セッションタイトル（例: AIの基礎知識）">
                </div>
                <div class="md:col-span-2">
                  <input type="text" name="curriculum_duration[]" value="${item.duration || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="所要時間">
                </div>
                <div class="md:col-span-4">
                  <input type="text" name="curriculum_description[]" value="${item.description || ''}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    placeholder="説明（任意）">
                </div>
                <div class="md:col-span-1 flex items-center justify-end">
                  <button type="button" onclick="removeCurriculum(this)" class="text-red-500 hover:text-red-700 p-2">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <button type="button" onclick="addCurriculum()" class="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <i class="fas fa-plus mr-1"></i>カリキュラムを追加
        </button>
      </div>

      <!-- 講師情報（固定：mion） -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-user-tie text-blue-500 mr-2"></i>講師情報
        </h2>
        
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-center gap-4">
            <img src="/static/mion-profile.png" alt="mion" class="w-16 h-16 rounded-full object-cover border-2 border-amber-300">
            <div>
              <p class="font-bold text-gray-800 text-lg">mion（ミオン）</p>
              <p class="text-amber-700 text-sm">mirAIcafe 代表講師</p>
              <p class="text-gray-600 text-sm mt-1">全ての講座はmionが担当します</p>
            </div>
          </div>
        </div>
        <!-- 講師名をhiddenフィールドで固定 -->
        <input type="hidden" name="instructor" value="mion">
      </div>

      <!-- 画像設定 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-images text-blue-500 mr-2"></i>画像設定
        </h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-image mr-1"></i>メイン画像
            </label>
            <div id="course-main-image-upload"></div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-images mr-1"></i>ギャラリー画像（複数可）
            </label>
            <div id="course-gallery-upload"></div>
          </div>
        </div>
      </div>

      <!-- 開催日程 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-calendar-alt text-blue-500 mr-2"></i>開催日程
        </h2>
        <p class="text-sm text-gray-500 mb-4">講座の開催日時を設定できます。複数の日程を追加可能です。</p>
        
        <div id="schedule-container" class="space-y-3">
          ${(() => {
            if (!course?.schedules || course.schedules.length === 0) {
              return '<!-- 日程項目はJavaScriptで動的に追加 -->'
            }
            const today = new Date().toISOString().split('T')[0]
            const futureSchedules = course.schedules.filter((sch: any) => sch.date >= today)
            const pastSchedules = course.schedules.filter((sch: any) => sch.date < today)
            
            let html = ''
            // 未来の日程
            html += futureSchedules.map((sch: any) => `
              <div class="schedule-item p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">日付</label>
                    <input type="date" name="schedule_date[]" value="${sch.date || ''}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">開始時間</label>
                    <input type="time" name="schedule_start[]" value="${sch.startTime || ''}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">終了時間</label>
                    <input type="time" name="schedule_end[]" value="${sch.endTime || ''}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">定員</label>
                    <input type="number" name="schedule_capacity[]" min="1" max="100" value="${sch.capacity || 10}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 block mb-1">場所</label>
                    <input type="text" name="schedule_location[]" value="${escapeAttr(sch.location || 'オンライン')}"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                  </div>
                </div>
                <div class="flex justify-between items-center mt-3">
                  <a href="#" onclick="addToCalendar('${sch.date}', '${sch.startTime}', '${sch.endTime}', '${escapeAttr(course?.title || '')}', '${escapeAttr(course?.online_url || '')}', '${escapeAttr(sch.location || 'オンライン')}'); return false;" 
                     class="text-green-600 hover:text-green-800 text-sm flex items-center">
                    <i class="fab fa-google mr-1"></i>Googleカレンダーに追加
                  </a>
                  <button type="button" onclick="removeSchedule(this)" class="text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash mr-1"></i>削除
                  </button>
                </div>
              </div>
            `).join('')
            
            // 過去の日程（アーカイブ）
            if (pastSchedules.length > 0) {
              html += `
                <div class="mt-6 pt-4 border-t border-gray-200">
                  <button type="button" onclick="toggleArchive()" class="text-gray-500 hover:text-gray-700 text-sm flex items-center mb-3">
                    <i class="fas fa-archive mr-2"></i>過去の日程（${pastSchedules.length}件）
                    <i class="fas fa-chevron-down ml-2" id="archive-icon"></i>
                  </button>
                  <div id="archive-schedules" class="hidden space-y-2">
                    ${pastSchedules.map((sch: any) => `
                      <div class="p-3 border border-gray-200 rounded-lg bg-gray-100 opacity-60">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-4 text-sm text-gray-500">
                            <span><i class="fas fa-calendar mr-1"></i>${sch.date}</span>
                            <span><i class="fas fa-clock mr-1"></i>${sch.startTime} - ${sch.endTime}</span>
                            <span><i class="fas fa-map-marker-alt mr-1"></i>${sch.location || 'オンライン'}</span>
                            <span><i class="fas fa-users mr-1"></i>定員${sch.capacity}名</span>
                          </div>
                          <span class="text-xs bg-gray-300 text-gray-600 px-2 py-1 rounded">終了</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `
            }
            return html
          })()}
        </div>
        <button type="button" onclick="addSchedule()" class="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <i class="fas fa-plus mr-1"></i>日程を追加
        </button>
        <p class="text-xs text-gray-400 mt-2">
          <i class="fas fa-info-circle mr-1"></i>日程は講座保存後に管理できます。
        </p>
      </div>

      <!-- FAQ -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-question-circle text-blue-500 mr-2"></i>よくある質問（FAQ）
        </h2>
        <div id="faq-container" class="space-y-3">
          ${(course?.faq || (isEdit ? [{ question: '', answer: '' }] : defaultFaq)).map((item, index) => `
            <div class="faq-item p-4 border border-gray-200 rounded-lg">
              <div class="space-y-3">
                <input type="text" name="faq_question[]" value="${escapeAttr(item.question || '')}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="質問（例: 初心者でも参加できますか？）">
                <textarea name="faq_answer[]" rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                  placeholder="回答">${escapeAttr(item.answer || '')}</textarea>
                <div class="text-right">
                  <button type="button" onclick="removeFaq(this)" class="text-red-500 hover:text-red-700 text-sm">
                    <i class="fas fa-trash mr-1"></i>削除
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <button type="button" onclick="addFaq()" class="mt-4 text-blue-600 hover:text-blue-800 text-sm flex items-center">
          <i class="fas fa-plus mr-1"></i>FAQを追加
        </button>
      </div>

      <!-- キャンセルポリシーは別ページで管理しているため、ここでは非表示 -->

      <!-- 特徴・含まれるもの -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-check-circle text-blue-500 mr-2"></i>講座の特徴・含まれるもの
        </h2>
        <textarea name="features" rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="1行に1つずつ入力してください（改行区切り）&#10;例:&#10;講座テキスト（PDF）&#10;ハンズオン形式の実践演習&#10;質疑応答セッション">${course?.features?.join('\n') || ''}</textarea>
      </div>

      <!-- 送信ボタン -->
      <div class="flex items-center justify-between">
        <a href="/admin/courses" class="px-6 py-2 text-gray-600 hover:text-gray-800 transition">
          キャンセル
        </a>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center">
          <i class="fas fa-save mr-2"></i>
          ${isEdit ? '更新する' : '保存する'}
        </button>
      </div>
    </form>

    <script>
      function addCurriculum() {
        const container = document.getElementById('curriculum-container');
        const html = \`
          <div class="curriculum-item p-4 border border-gray-200 rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="md:col-span-5">
                <input type="text" name="curriculum_title[]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="セッションタイトル">
              </div>
              <div class="md:col-span-2">
                <input type="text" name="curriculum_duration[]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="所要時間">
              </div>
              <div class="md:col-span-4">
                <input type="text" name="curriculum_description[]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="説明">
              </div>
              <div class="md:col-span-1 flex items-center justify-end">
                <button type="button" onclick="removeCurriculum(this)" class="text-red-500 hover:text-red-700 p-2">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        \`;
        container.insertAdjacentHTML('beforeend', html);
      }

      function removeCurriculum(btn) {
        const items = document.querySelectorAll('.curriculum-item');
        if (items.length > 1) {
          btn.closest('.curriculum-item').remove();
        }
      }

      function addFaq() {
        const container = document.getElementById('faq-container');
        const html = \`
          <div class="faq-item p-4 border border-gray-200 rounded-lg">
            <div class="space-y-3">
              <input type="text" name="faq_question[]"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                placeholder="質問">
              <textarea name="faq_answer[]" rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                placeholder="回答"></textarea>
              <div class="text-right">
                <button type="button" onclick="removeFaq(this)" class="text-red-500 hover:text-red-700 text-sm">
                  <i class="fas fa-trash mr-1"></i>削除
                </button>
              </div>
            </div>
          </div>
        \`;
        container.insertAdjacentHTML('beforeend', html);
      }

      function removeFaq(btn) {
        const items = document.querySelectorAll('.faq-item');
        if (items.length > 1) {
          btn.closest('.faq-item').remove();
        }
      }
      
      // 日程追加
      function addSchedule() {
        const container = document.getElementById('schedule-container');
        const today = new Date().toISOString().split('T')[0];
        const html = \`
          <div class="schedule-item p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div class="md:col-span-3">
                <label class="block text-xs text-gray-500 mb-1">開催日</label>
                <input type="date" name="schedule_date[]" min="\${today}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  value="">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs text-gray-500 mb-1">開始時間</label>
                <input type="time" name="schedule_start[]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  value="10:00">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs text-gray-500 mb-1">終了時間</label>
                <input type="time" name="schedule_end[]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  value="12:00">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs text-gray-500 mb-1">定員</label>
                <input type="number" name="schedule_capacity[]" min="1" max="100"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  value="10">
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs text-gray-500 mb-1">開催場所</label>
                <input type="text" name="schedule_location[]"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  value="オンライン" placeholder="オンライン">
              </div>
              <div class="md:col-span-1 flex items-end justify-end pb-1">
                <button type="button" onclick="removeSchedule(this)" class="text-red-500 hover:text-red-700 p-2">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        \`;
        container.insertAdjacentHTML('beforeend', html);
      }

      function removeSchedule(btn) {
        btn.closest('.schedule-item').remove();
      }
      
      // アーカイブの表示切替
      function toggleArchive() {
        const archive = document.getElementById('archive-schedules');
        const icon = document.getElementById('archive-icon');
        if (archive.classList.contains('hidden')) {
          archive.classList.remove('hidden');
          icon.classList.remove('fa-chevron-down');
          icon.classList.add('fa-chevron-up');
        } else {
          archive.classList.add('hidden');
          icon.classList.remove('fa-chevron-up');
          icon.classList.add('fa-chevron-down');
        }
      }
      
      // Googleカレンダーに追加
      function addToCalendar(date, startTime, endTime, title, onlineUrl, location) {
        if (!date || !startTime || !endTime) {
          alert('日程情報が不足しています');
          return;
        }
        
        const startDateTime = date.replace(/-/g, '') + 'T' + startTime.replace(':', '') + '00';
        const endDateTime = date.replace(/-/g, '') + 'T' + endTime.replace(':', '') + '00';
        
        // 詳細（メモ）を構築
        let details = '📚 講座: ' + title + '\\n\\n';
        if (onlineUrl) {
          details += '🔗 参加URL: ' + onlineUrl + '\\n\\n';
        }
        details += '📍 場所: ' + (location || 'オンライン') + '\\n';
        details += '🕐 時間: ' + startTime + ' - ' + endTime + '\\n\\n';
        details += '━━━━━━━━━━━━━━━━━━━━\\n';
        details += '主催: mirAIcafe\\n';
        details += 'https://miraicafe.work';
        
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: '【mirAIcafe】' + title,
          dates: startDateTime + '/' + endDateTime,
          details: details,
          location: onlineUrl || location || 'オンライン',
          ctz: 'Asia/Tokyo'
        });
        
        window.open('https://calendar.google.com/calendar/render?' + params.toString(), '_blank');
      }
      
      // 画像アップロードコンポーネントを初期化
      document.addEventListener('DOMContentLoaded', function() {
        // メイン画像（単一）
        initImageUpload('course-main-image-upload', 'image', '${escapeAttr(course?.image || '')}');
        
        // ギャラリー画像（複数）
        const galleryUrls = ${JSON.stringify(course?.gallery || [])};
        initMultiImageUpload('course-gallery-upload', 'gallery', galleryUrls);
        
        // SEO機能初期化
        initSEOFeatures('course');
        
        // AI講座生成からのデータを受け取る
        const aiData = sessionStorage.getItem('aiGeneratedCourse');
        if (aiData) {
          try {
            const data = JSON.parse(aiData);
            // フォームに反映
            if (data.title) document.querySelector('input[name="title"]').value = data.title;
            if (data.catchphrase) document.querySelector('input[name="catchphrase"]').value = data.catchphrase;
            if (data.category) document.querySelector('select[name="category"]').value = data.category;
            if (data.level) document.querySelector('select[name="level"]').value = data.level;
            if (data.description) document.querySelector('textarea[name="description"]').value = data.description;
            if (data.price) document.querySelector('input[name="price"]').value = data.price;
            if (data.duration) document.querySelector('input[name="duration"]').value = data.duration;
            if (data.targetAudience && Array.isArray(data.targetAudience)) {
              document.querySelector('textarea[name="targetAudience"]').value = data.targetAudience.join('\\n');
            }
            if (data.features && Array.isArray(data.features)) {
              document.querySelector('textarea[name="features"]').value = data.features.join('\\n');
            }
            if (data.image) {
              document.getElementById('course-main-image-upload-hidden').value = data.image;
              showPreview('course-main-image-upload', data.image);
            }
            // カリキュラムの設定
            if (data.curriculum && Array.isArray(data.curriculum) && data.curriculum.length > 0) {
              const container = document.getElementById('curriculum-container');
              container.innerHTML = '';
              data.curriculum.forEach((item, i) => {
                const div = document.createElement('div');
                div.className = 'curriculum-item p-4 border border-gray-200 rounded-lg';
                // XSS対策のためエスケープ
                const escapeHtml = (str) => {
                  if (!str) return '';
                  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
                };
                div.innerHTML = \`
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div class="md:col-span-5">
                      <input type="text" name="curriculum_title[]" value="\${escapeHtml(item.title)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        placeholder="セッションタイトル">
                    </div>
                    <div class="md:col-span-2">
                      <input type="text" name="curriculum_duration[]" value="\${escapeHtml(item.duration)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        placeholder="所要時間">
                    </div>
                    <div class="md:col-span-4">
                      <input type="text" name="curriculum_description[]" value="\${escapeHtml(item.description)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        placeholder="説明">
                    </div>
                    <div class="md:col-span-1 flex items-center justify-end">
                      <button type="button" onclick="removeCurriculum(this)" class="text-red-500 hover:text-red-700 p-2">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                \`;
                container.appendChild(div);
              });
            }
            // 使用済みなので削除
            sessionStorage.removeItem('aiGeneratedCourse');
            showToast('AI生成データを読み込みました');
            
            // SEOスコアを自動更新（遅延実行で確実にイベントを発火）
            setTimeout(() => {
              const titleInput = document.querySelector('input[name="title"]');
              const descInput = document.querySelector('textarea[name="description"]');
              if (titleInput) {
                titleInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
              if (descInput) {
                descInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }, 800);
          } catch (e) {
            console.error('AI data parse error:', e);
          }
        }
      });
      
      // デバウンス関数
      function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
      
      // SEO機能初期化
      function initSEOFeatures(type) {
        const titleInput = document.querySelector('input[name="title"]');
        const contentInput = document.querySelector('textarea[name="description"]');
        const metaInput = document.querySelector('textarea[name="meta_description"]');
        const seoScoreEl = document.getElementById('seo-score');
        const seoFeedbackEl = document.getElementById('seo-feedback');
        const aiSuggestBtn = document.getElementById('ai-suggest-btn');
        const metaCharCount = document.getElementById('meta-char-count');
        
        // メタディスクリプション文字数カウント
        if (metaInput && metaCharCount) {
          metaCharCount.textContent = metaInput.value.length;
          metaInput.addEventListener('input', (e) => {
            metaCharCount.textContent = e.target.value.length;
          });
        }
        
        // SEOスコア更新
        async function updateSEOScore() {
          const title = titleInput?.value || '';
          const content = contentInput?.value || '';
          
          if (!title || !content) return;
          
          try {
            const res = await fetch('/admin/api/ai/analyze-seo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title, content })
            });
            
            if (!res.ok) return;
            
            const data = await res.json();
            
            if (seoScoreEl) {
              seoScoreEl.textContent = data.score;
              seoScoreEl.className = 'text-xl font-bold ' + 
                (data.color === 'green' ? 'text-emerald-500' : 
                 data.color === 'yellow' ? 'text-amber-500' : 'text-red-500');
            }
            
            if (seoFeedbackEl && data.feedback) {
              seoFeedbackEl.classList.remove('hidden');
              seoFeedbackEl.innerHTML = data.feedback.map(f => 
                '<div class="text-slate-600">' + f + '</div>'
              ).join('');
            }
          } catch (err) {
            console.error('SEO score error:', err);
          }
        }
        
        // デバウンス付きイベントリスナー
        if (titleInput) {
          titleInput.addEventListener('input', debounce(updateSEOScore, 500));
        }
        if (contentInput) {
          contentInput.addEventListener('input', debounce(updateSEOScore, 1000));
        }
        
        // 初回スコア計算
        if (titleInput?.value && contentInput?.value) {
          updateSEOScore();
        }
        
        // AI提案ボタン
        if (aiSuggestBtn) {
          aiSuggestBtn.addEventListener('click', async () => {
            const title = titleInput?.value || '';
            const content = contentInput?.value || '';
            
            if (!title || !content) {
              alert('講座名と説明を入力してください');
              return;
            }
            
            const btn = aiSuggestBtn;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>AI分析中...</span>';
            btn.disabled = true;
            
            try {
              const res = await fetch('/admin/api/ai/suggest-seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, type })
              });
              
              const data = await res.json();
              
              if (data.error) {
                alert(data.error);
                return;
              }
              
              showAISuggestionModal(data);
            } catch (error) {
              alert('AI提案の取得に失敗しました');
            } finally {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }
          });
        }
      }
      
      // AI提案モーダル
      function showAISuggestionModal(data) {
        const escapeHtml = (str) => {
          const div = document.createElement('div');
          div.textContent = str;
          return div.innerHTML;
        };
        
        const modal = document.createElement('div');
        modal.id = 'ai-suggestion-modal';
        modal.innerHTML = \`
          <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;">
            <div style="background: white; padding: 24px; border-radius: 16px; max-width: 600px; width: 100%; max-height: 85vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px; font-weight: bold; color: #1e293b;">🤖 SEO最適化のAI提案</h2>
                <button onclick="document.getElementById('ai-suggestion-modal').remove();" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b;">&times;</button>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px;">📌 改善タイトル案</h3>
                \${(data.suggested_titles || []).map((t, i) => \`
                  <div onclick="applyTitle(this)" data-value="\${escapeHtml(t)}" style="margin: 8px 0; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e2e8f0'">
                    <span style="color: #6366f1; font-weight: 500;">\${i+1}.</span> \${escapeHtml(t)}
                    <span style="float: right; color: #6366f1; font-size: 12px; font-weight: 600;">[採用]</span>
                  </div>
                \`).join('')}
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px;">📝 メタディスクリプション</h3>
                <div onclick="applyMeta(this)" data-value="\${escapeHtml(data.meta_description || '')}" style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e2e8f0'">
                  \${escapeHtml(data.meta_description || '提案なし')}
                  <span style="display: block; text-align: right; color: #6366f1; font-size: 12px; font-weight: 600; margin-top: 8px;">[採用]</span>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px;">🔑 推奨キーワード</h3>
                <div onclick="applyKeywords(this)" data-value="\${escapeHtml((data.keywords || []).join(', '))}" style="padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#6366f1'" onmouseout="this.style.borderColor='#e2e8f0'">
                  \${(data.keywords || []).map(k => \`<span style="display: inline-block; padding: 4px 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border-radius: 20px; margin: 4px 4px 4px 0; font-size: 13px;">\${escapeHtml(k)}</span>\`).join('')}
                  <span style="display: block; text-align: right; color: #6366f1; font-size: 12px; font-weight: 600; margin-top: 8px;">[採用]</span>
                </div>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px;">💡 改善ポイント</h3>
                <ul style="padding-left: 20px; margin: 0; color: #475569;">
                  \${(data.improvement_points || []).map(p => \`<li style="margin: 8px 0;">\${escapeHtml(p)}</li>\`).join('')}
                </ul>
              </div>
              
              \${(data.content_corrections && data.content_corrections.length > 0) ? \`
              <div style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 10px;">✏️ 本文の訂正提案</h3>
                <div style="space-y: 12px;">
                  \${data.content_corrections.map((c, i) => \`
                    <div style="margin-bottom: 12px; padding: 16px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 12px;">
                      <div style="font-size: 12px; font-weight: 600; color: #92400e; margin-bottom: 8px;">訂正 \${i + 1}</div>
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #dc2626; margin-bottom: 4px;">❌ 修正前</div>
                        <div style="padding: 8px 12px; background: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px; font-size: 13px; color: #7f1d1d;">\${escapeHtml(c.before)}</div>
                      </div>
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #16a34a; margin-bottom: 4px;">✅ 修正後</div>
                        <div onclick="applyContentCorrection(this)" data-before="\${escapeHtml(c.before)}" data-after="\${escapeHtml(c.after)}" style="padding: 8px 12px; background: #f0fdf4; border-left: 3px solid #16a34a; border-radius: 4px; font-size: 13px; color: #166534; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#dcfce7'" onmouseout="this.style.background='#f0fdf4'">
                          \${escapeHtml(c.after)}
                          <span style="display: block; text-align: right; color: #16a34a; font-size: 11px; font-weight: 600; margin-top: 4px;">[この修正を適用]</span>
                        </div>
                      </div>
                      \${c.reason ? \`<div style="font-size: 12px; color: #78716c; margin-top: 8px;"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 4px;"></i>\${escapeHtml(c.reason)}</div>\` : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
              \` : ''}
              
              <button onclick="document.getElementById('ai-suggestion-modal').remove();" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
                閉じる
              </button>
            </div>
          </div>
        \`;
        document.body.appendChild(modal);
      }
      
      // 本文訂正を適用
      function applyContentCorrection(el) {
        const before = el.dataset.before;
        const after = el.dataset.after;
        const contentInput = document.querySelector('textarea[name="description"]');
        
        if (contentInput && before && after) {
          const currentContent = contentInput.value;
          if (currentContent.includes(before)) {
            contentInput.value = currentContent.replace(before, after);
            contentInput.dispatchEvent(new Event('input'));
            showToast('本文を修正しました');
            el.style.background = '#bbf7d0';
            el.innerHTML = '<span style="color: #166534;">✅ 適用済み</span>';
            el.style.cursor = 'default';
            el.onclick = null;
          } else {
            showToast('該当する文章が見つかりませんでした', 'warning');
          }
        }
      }
      
      // タイトル適用
      function applyTitle(el) {
        const value = el.dataset.value;
        const input = document.querySelector('input[name="title"]');
        if (input && value) {
          input.value = value;
          input.dispatchEvent(new Event('input'));
          showToast('講座名を反映しました');
        }
      }
      
      // メタディスクリプション適用
      function applyMeta(el) {
        const value = el.dataset.value;
        const input = document.querySelector('textarea[name="meta_description"]');
        if (input && value) {
          input.value = value;
          input.dispatchEvent(new Event('input'));
          showToast('メタディスクリプションを反映しました');
        }
      }
      
      // メタディスクリプション自動生成
      async function generateMetaDescription() {
        const btn = document.getElementById('generate-meta-btn');
        const metaInput = document.getElementById('meta_description');
        const titleInput = document.querySelector('input[name="title"]');
        const descInput = document.querySelector('textarea[name="description"]');
        const charCountEl = document.getElementById('meta-char-count');
        
        const title = titleInput ? titleInput.value.trim() : '';
        const content = descInput ? descInput.value.trim() : '';
        
        if (!title || !content) {
          alert('講座名と説明を入力してください');
          return;
        }
        
        // ボタンをローディング状態に
        const originalHtml = btn.innerHTML;
        const originalBg = btn.style.background;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><br>⏳ 生成中...';
        btn.style.opacity = '0.7';
        
        try {
          const res = await fetch('/admin/api/ai/generate-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            throw new Error(data.error || '生成に失敗しました');
          }
          
          if (data.meta_description) {
            // メタディスクリプションに反映
            metaInput.value = data.meta_description;
            metaInput.dispatchEvent(new Event('input'));
            
            // 文字数カウント更新
            if (charCountEl) {
              charCountEl.textContent = data.length || data.meta_description.length;
            }
            
            // キーワードも反映
            const keywordsInput = document.querySelector('input[name="keywords"]');
            if (keywordsInput && data.keywords) {
              keywordsInput.value = data.keywords;
            }
            
            // フォーカスを当てる
            metaInput.focus();
            
            // フォールバック時の警告
            if (data.fallback) {
              alert('⚠️ AI生成に失敗したため、基本的な要約を生成しました。必要に応じて編集してください。');
              btn.innerHTML = originalHtml;
              btn.style.opacity = '1';
            } else {
              // 成功時：ボタンを緑色に変更
              btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
              btn.innerHTML = '<i class="fas fa-check"></i><br>✅ 生成完了';
              btn.style.opacity = '1';
              
              const keywordMsg = data.keywords ? ' + キーワード' : '';
              showToast('SEO設定を生成しました (' + (data.length || data.meta_description.length) + '文字' + keywordMsg + ')');
              
              // 2秒後に元に戻す
              setTimeout(() => {
                btn.innerHTML = originalHtml;
                btn.style.background = originalBg;
              }, 2000);
            }
          } else {
            throw new Error('メタディスクリプションを生成できませんでした');
          }
        } catch (error) {
          alert('ネットワークエラー: ' + (error.message || 'メタディスクリプションの生成に失敗しました'));
          btn.innerHTML = originalHtml;
          btn.style.opacity = '1';
        } finally {
          btn.disabled = false;
        }
      }
      
      // キーワード適用
      function applyKeywords(el) {
        const value = el.dataset.value;
        const input = document.querySelector('input[name="keywords"]');
        if (input && value) {
          input.value = value;
          showToast('キーワードを反映しました');
        }
      }
      
      // トースト通知
      function showToast(message, type = 'success') {
        const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
        const icons = { success: 'check-circle', warning: 'exclamation-triangle', error: 'times-circle' };
        const toast = document.createElement('div');
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: ' + (colors[type] || colors.success) + '; color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000; animation: fadeIn 0.3s;';
        toast.innerHTML = '<i class="fas fa-' + (icons[type] || icons.success) + ' mr-2"></i>' + message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    </script>
  `

  return renderAdminLayout(title, content, 'courses')
}
