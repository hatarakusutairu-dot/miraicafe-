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
              <button onclick="confirmDelete('${course.id}', '${escapeAttr(course.title).replace(/'/g, "\\'")}')" 
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
            <input type="text" name="title" required value="${course?.title || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: AI基礎講座〜ChatGPT入門〜">
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
              placeholder="講座の内容を詳しく説明してください">${course?.description || ''}</textarea>
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
          ${(course?.curriculum || [{ title: '', duration: '', description: '' }]).map((item, index) => `
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

      <!-- 講師情報 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-user-tie text-blue-500 mr-2"></i>講師情報
        </h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">講師名</label>
              <input type="text" name="instructor" value="${course?.instructor || ''}"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="例: 田中 太郎">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">肩書き</label>
              <input type="text" name="instructor_title" value="${course?.instructorInfo?.title || ''}"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="例: AI研究者・データサイエンティスト">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">講師プロフィール</label>
            <textarea name="instructor_bio" rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="講師の経歴や専門分野について">${course?.instructorInfo?.bio || ''}</textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">講師画像URL</label>
            <input type="url" name="instructor_image" value="${course?.instructorInfo?.image || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="https://example.com/instructor.jpg">
          </div>
        </div>
      </div>

      <!-- 画像設定 -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-images text-blue-500 mr-2"></i>画像設定
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">メイン画像URL</label>
            <input type="url" name="image" value="${course?.image || ''}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="https://example.com/course-image.jpg">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ギャラリー画像（改行区切り）</label>
            <textarea name="gallery" rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="1行に1つのURLを入力&#10;https://example.com/gallery1.jpg&#10;https://example.com/gallery2.jpg">${course?.gallery?.join('\n') || ''}</textarea>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-question-circle text-blue-500 mr-2"></i>よくある質問（FAQ）
        </h2>
        <div id="faq-container" class="space-y-3">
          ${(course?.faq || [{ question: '', answer: '' }]).map((item, index) => `
            <div class="faq-item p-4 border border-gray-200 rounded-lg">
              <div class="space-y-3">
                <input type="text" name="faq_question[]" value="${item.question || ''}"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="質問（例: 初心者でも参加できますか？）">
                <textarea name="faq_answer[]" rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                  placeholder="回答">${item.answer || ''}</textarea>
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

      <!-- キャンセルポリシー -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-file-contract text-blue-500 mr-2"></i>キャンセルポリシー
        </h2>
        <textarea name="cancellationPolicy" rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          placeholder="キャンセルポリシーを入力&#10;例: 7日前まで：全額返金 / 3日前まで：50%返金 / 前日以降：返金不可">${course?.cancellationPolicy || ''}</textarea>
      </div>

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
    </script>
  `

  return renderAdminLayout(title, content, 'courses')
}
