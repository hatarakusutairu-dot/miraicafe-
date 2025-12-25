/**
 * 講座AI生成ページ
 * - AIによる講座情報生成
 * - 説明、カリキュラム、対象者、特徴を自動生成
 * - Unsplashアイキャッチ画像検索
 * - 講師は「mion」固定
 */

import { renderAdminLayout } from './layout'

export const renderAICourseGeneratorPage = () => {
  const content = `
    <style>
      .markdown-content h1 { font-size: 1.5rem; font-weight: bold; color: #1e293b; margin: 20px 0 10px; }
      .markdown-content h2 { font-size: 1.25rem; font-weight: bold; color: #1e293b; margin: 16px 0 8px; }
      .markdown-content h3 { font-size: 1.1rem; font-weight: bold; color: #334155; margin: 12px 0 6px; }
      .markdown-content p { font-size: 1rem; line-height: 1.8; color: #374151; margin-bottom: 10px; }
      .markdown-content ul, .markdown-content ol { margin: 10px 0; padding-left: 24px; }
      .markdown-content li { margin-bottom: 6px; line-height: 1.7; }
      .markdown-content strong { font-weight: bold; color: #1e293b; }
      .markdown-content em { font-style: italic; color: #64748b; }
    </style>
    
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- ヘッダー -->
      <div class="flex items-center justify-between">
        <div>
          <a href="/admin/courses" class="text-gray-500 hover:text-gray-700 text-sm">
            <i class="fas fa-arrow-left mr-1"></i>講座一覧に戻る
          </a>
          <h1 class="text-2xl font-bold text-gray-800 mt-2">
            <i class="fas fa-robot mr-2 text-indigo-500"></i>AI講座生成
          </h1>
          <p class="text-gray-600 mt-1">講座テーマを入力するだけで、AIが講座情報を自動生成します</p>
        </div>
      </div>

      <!-- 生成フォーム -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
              講座テーマ・タイトル <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="courseTopic" 
              placeholder="例: ChatGPTビジネス活用入門、AI画像生成マスター講座"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition"
            >
            <p class="text-xs text-gray-500 mt-1">この内容を元に講座情報を生成します</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-tag text-blue-500 mr-1"></i>カテゴリ
              </label>
              <select id="courseCategory" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition">
                <option value="AI入門">AI入門</option>
                <option value="ビジネス活用">ビジネス活用</option>
                <option value="エンジニア向け">エンジニア向け</option>
                <option value="クリエイティブ">クリエイティブ</option>
                <option value="その他">その他</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-signal text-green-500 mr-1"></i>レベル
              </label>
              <select id="courseLevel" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition">
                <option value="初級">初級</option>
                <option value="中級">中級</option>
                <option value="上級">上級</option>
                <option value="全レベル">全レベル</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-yen-sign text-amber-500 mr-1"></i>価格帯
              </label>
              <select id="priceRange" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition">
                <option value="0">無料</option>
                <option value="0-5000">〜¥5,000</option>
                <option value="5000-10000" selected>¥5,000〜¥10,000</option>
                <option value="10000-15000">¥10,000〜¥15,000</option>
                <option value="15000-25000">¥15,000〜¥25,000</option>
                <option value="25000-50000">¥25,000〜¥50,000</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-plus-circle text-purple-500 mr-1"></i>追加の指示（任意）
            </label>
            <textarea 
              id="additionalInstructions" 
              placeholder="例: ハンズオン形式で、具体的なプロンプト例を多く含めてください。"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition h-24 resize-none"
            ></textarea>
          </div>
          
          <button 
            onclick="generateCourse()" 
            id="generateBtn"
            class="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition transform hover:-translate-y-0.5 shadow-lg"
          >
            <i class="fas fa-robot mr-2"></i>講座を生成する
          </button>
        </div>
      </div>

      <!-- 生成結果 -->
      <div id="resultSection" class="hidden">
        <div class="bg-white rounded-xl shadow-md p-6 space-y-6">
          <h2 class="text-xl font-bold text-gray-800 flex items-center">
            <i class="fas fa-check-circle text-green-500 mr-2"></i>生成結果
          </h2>
          
          <!-- タイトル -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-heading text-blue-500 mr-1"></i>講座タイトル
            </label>
            <input type="text" id="generatedTitle" class="w-full p-4 bg-gray-50 rounded-lg font-bold text-lg text-gray-800 border border-gray-200 focus:border-indigo-500 focus:outline-none">
          </div>
          
          <!-- キャッチフレーズ -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-quote-right text-teal-500 mr-1"></i>キャッチフレーズ
            </label>
            <input type="text" id="generatedCatchphrase" class="w-full p-4 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 focus:border-indigo-500 focus:outline-none">
          </div>
          
          <!-- 説明 -->
          <div class="border-b pb-5">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-semibold text-gray-700">
                <i class="fas fa-file-alt text-green-500 mr-1"></i>講座説明
              </label>
              <button onclick="toggleDescPreview()" class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition">
                <i class="fas fa-eye mr-1"></i><span id="descPreviewBtnText">プレビュー</span>
              </button>
            </div>
            <textarea id="generatedDescriptionMarkdown" class="w-full p-4 bg-gray-50 rounded-lg text-gray-700 font-mono text-sm border border-gray-200 focus:border-indigo-500 focus:outline-none" style="min-height: 200px; display: block;"></textarea>
            <div id="generatedDescriptionPreview" class="p-4 bg-gray-50 rounded-lg markdown-content border border-gray-200" style="min-height: 200px; display: none;"></div>
          </div>
          
          <!-- こんな方におすすめ -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-users text-blue-500 mr-1"></i>こんな方におすすめ
            </label>
            <textarea id="generatedTargetAudience" class="w-full p-4 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 focus:border-indigo-500 focus:outline-none" style="min-height: 120px;"></textarea>
          </div>
          
          <!-- 特徴 -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-star text-amber-500 mr-1"></i>講座の特徴
            </label>
            <textarea id="generatedFeatures" class="w-full p-4 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 focus:border-indigo-500 focus:outline-none" style="min-height: 120px;"></textarea>
          </div>
          
          <!-- カリキュラム -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-list-ol text-purple-500 mr-1"></i>カリキュラム
            </label>
            <div id="generatedCurriculum" class="space-y-2"></div>
          </div>
          
          <!-- 価格・時間 -->
          <div class="border-b pb-5">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-yen-sign text-green-500 mr-1"></i>受講料
                </label>
                <input type="number" id="generatedPrice" class="w-full p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 focus:border-indigo-500 focus:outline-none">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <i class="fas fa-clock text-blue-500 mr-1"></i>開催時間
                </label>
                <input type="text" id="generatedDuration" class="w-full p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 focus:border-indigo-500 focus:outline-none" placeholder="例: 120分">
              </div>
            </div>
          </div>
          
          <!-- 画像候補 -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-image text-pink-500 mr-1"></i>アイキャッチ画像候補（選択してください）
            </label>
            <div id="imageSuggestions" class="grid grid-cols-2 md:grid-cols-4 gap-3"></div>
            <p class="text-xs text-gray-500 mt-2">※画像はUnsplashから取得。商用利用可能です。</p>
          </div>
          
          <!-- アクションボタン -->
          <div class="flex flex-wrap gap-3">
            <button onclick="saveCourse()" class="flex-1 min-w-[140px] py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition">
              <i class="fas fa-save mr-2"></i>下書き保存
            </button>
            <button onclick="editAndSave()" class="flex-1 min-w-[140px] py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition">
              <i class="fas fa-edit mr-2"></i>編集画面へ
            </button>
            <button onclick="regenerateCourse()" class="flex-1 min-w-[140px] py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition">
              <i class="fas fa-redo mr-2"></i>再生成
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ローディングオーバーレイ -->
    <div id="loadingOverlay" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl text-center max-w-sm mx-4">
        <div class="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg font-bold text-gray-800">AIが講座を生成中...</p>
        <p class="text-sm text-gray-500 mt-2">30秒〜1分ほどお待ちください</p>
      </div>
    </div>

    <!-- Marked.js for Markdown parsing -->
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    
    <script>
      let generatedData = {};
      let selectedImage = null;
      let isDescPreviewMode = false;

      // Markdown → HTML変換
      function markdownToHtml(markdown) {
        if (typeof marked !== 'undefined') {
          return marked.parse(markdown);
        }
        // フォールバック
        return markdown
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
          .replace(/^- (.+)$/gm, '<li>$1</li>');
      }

      // プレビュー切り替え
      function toggleDescPreview() {
        isDescPreviewMode = !isDescPreviewMode;
        const markdown = document.getElementById('generatedDescriptionMarkdown');
        const preview = document.getElementById('generatedDescriptionPreview');
        const btnText = document.getElementById('descPreviewBtnText');
        
        if (isDescPreviewMode) {
          preview.innerHTML = markdownToHtml(markdown.value);
          markdown.style.display = 'none';
          preview.style.display = 'block';
          btnText.textContent = '編集';
        } else {
          markdown.style.display = 'block';
          preview.style.display = 'none';
          btnText.textContent = 'プレビュー';
        }
      }

      // 講座生成
      async function generateCourse() {
        const topic = document.getElementById('courseTopic').value.trim();
        if (!topic) {
          showToast('講座テーマを入力してください', 'error');
          return;
        }
        
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('loadingOverlay').classList.add('flex');
        
        try {
          const response = await fetch('/admin/api/ai/generate-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic,
              category: document.getElementById('courseCategory').value,
              level: document.getElementById('courseLevel').value,
              priceRange: document.getElementById('priceRange').value,
              additionalInstructions: document.getElementById('additionalInstructions').value
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || '生成に失敗しました');
          }
          
          generatedData = data;
          displayResults(data);
          showToast('講座を生成しました！', 'success');
          
        } catch (error) {
          console.error('生成エラー:', error);
          showToast(error.message || '講座の生成に失敗しました', 'error');
        } finally {
          btn.disabled = false;
          document.getElementById('loadingOverlay').classList.add('hidden');
          document.getElementById('loadingOverlay').classList.remove('flex');
        }
      }

      // 結果表示
      function displayResults(data) {
        document.getElementById('generatedTitle').value = data.title || '';
        document.getElementById('generatedCatchphrase').value = data.catchphrase || '';
        document.getElementById('generatedDescriptionMarkdown').value = data.description || '';
        document.getElementById('generatedTargetAudience').value = (data.targetAudience || []).join('\\n');
        document.getElementById('generatedFeatures').value = (data.features || []).join('\\n');
        document.getElementById('generatedPrice').value = data.price || 0;
        document.getElementById('generatedDuration').value = data.duration || '120分';
        
        // プレビューをリセット
        isDescPreviewMode = false;
        document.getElementById('generatedDescriptionMarkdown').style.display = 'block';
        document.getElementById('generatedDescriptionPreview').style.display = 'none';
        document.getElementById('descPreviewBtnText').textContent = 'プレビュー';
        
        // カリキュラム
        const curriculumContainer = document.getElementById('generatedCurriculum');
        const curriculum = data.curriculum || [];
        curriculumContainer.innerHTML = curriculum.map((item, i) => \`
          <div class="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-indigo-500 text-white text-sm flex items-center justify-center flex-shrink-0">\${i + 1}</span>
              <div class="flex-1">
                <input type="text" value="\${item.title || ''}" class="curriculum-title w-full font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none py-1" placeholder="タイトル">
                <textarea class="curriculum-desc w-full text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none mt-1 resize-none" rows="2" placeholder="説明">\${item.description || ''}</textarea>
              </div>
            </div>
          </div>
        \`).join('');
        
        // 画像候補
        const imageContainer = document.getElementById('imageSuggestions');
        if (data.images && data.images.length > 0) {
          imageContainer.innerHTML = data.images.map((img, index) => 
            \`<div class="image-option cursor-pointer rounded-lg overflow-hidden border-3 border-transparent hover:border-blue-400 transition" onclick="selectImage(\${index}, '\${img}')">
              <img src="\${img}" alt="候補\${index + 1}" class="w-full h-32 object-cover">
            </div>\`
          ).join('');
          selectImage(0, data.images[0]);
        } else {
          imageContainer.innerHTML = '<p class="text-gray-500 text-sm col-span-full">画像候補がありません</p>';
        }
        
        // 結果セクション表示
        document.getElementById('resultSection').classList.remove('hidden');
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
      }

      // 画像選択
      function selectImage(index, url) {
        selectedImage = url;
        document.querySelectorAll('.image-option').forEach((option, i) => {
          if (i === index) {
            option.classList.remove('border-transparent');
            option.classList.add('border-green-500', 'border-4');
          } else {
            option.classList.remove('border-green-500', 'border-4');
            option.classList.add('border-transparent');
          }
        });
      }

      // カリキュラムデータ取得
      function getCurriculumData() {
        const curriculum = [];
        const titles = document.querySelectorAll('.curriculum-title');
        const descs = document.querySelectorAll('.curriculum-desc');
        
        titles.forEach((title, i) => {
          if (title.value.trim()) {
            curriculum.push({
              title: title.value.trim(),
              description: descs[i]?.value?.trim() || '',
              duration: ''
            });
          }
        });
        
        return curriculum;
      }

      // 講座保存
      async function saveCourse() {
        const title = document.getElementById('generatedTitle').value.trim();
        if (!title) {
          showToast('講座タイトルを入力してください', 'error');
          return;
        }
        
        const targetAudienceText = document.getElementById('generatedTargetAudience').value;
        const featuresText = document.getElementById('generatedFeatures').value;
        
        const courseData = {
          title: title,
          catchphrase: document.getElementById('generatedCatchphrase').value.trim(),
          description: document.getElementById('generatedDescriptionMarkdown').value.trim(),
          category: document.getElementById('courseCategory').value,
          level: document.getElementById('courseLevel').value,
          price: parseInt(document.getElementById('generatedPrice').value) || 0,
          duration: document.getElementById('generatedDuration').value.trim() || '120分',
          image: selectedImage || '',
          targetAudience: targetAudienceText.split('\\n').filter(s => s.trim()),
          features: featuresText.split('\\n').filter(s => s.trim()),
          curriculum: getCurriculumData(),
          instructor: 'mion',
          status: 'draft'
        };
        
        try {
          const response = await fetch('/admin/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData)
          });
          
          if (response.ok) {
            showToast('講座を下書きとして保存しました！', 'success');
            setTimeout(() => location.href = '/admin/courses', 1500);
          } else {
            throw new Error('保存に失敗しました');
          }
        } catch (error) {
          console.error('保存エラー:', error);
          showToast('講座の保存に失敗しました', 'error');
        }
      }

      // 編集画面へ
      function editAndSave() {
        const title = document.getElementById('generatedTitle').value.trim();
        if (!title) {
          showToast('講座タイトルを入力してください', 'error');
          return;
        }
        
        const targetAudienceText = document.getElementById('generatedTargetAudience').value;
        const featuresText = document.getElementById('generatedFeatures').value;
        
        const courseData = {
          title: title,
          catchphrase: document.getElementById('generatedCatchphrase').value.trim(),
          description: document.getElementById('generatedDescriptionMarkdown').value.trim(),
          category: document.getElementById('courseCategory').value,
          level: document.getElementById('courseLevel').value,
          price: parseInt(document.getElementById('generatedPrice').value) || 0,
          duration: document.getElementById('generatedDuration').value.trim() || '120分',
          image: selectedImage || '',
          targetAudience: targetAudienceText.split('\\n').filter(s => s.trim()),
          features: featuresText.split('\\n').filter(s => s.trim()),
          curriculum: getCurriculumData(),
          instructor: 'mion'
        };
        
        sessionStorage.setItem('aiGeneratedCourse', JSON.stringify(courseData));
        location.href = '/admin/courses/new';
      }

      // 再生成
      function regenerateCourse() {
        if (confirm('現在の内容を破棄して再生成しますか？')) {
          generateCourse();
        }
      }

      // トースト通知
      function showToast(message, type = 'info') {
        const colors = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          info: 'bg-blue-500'
        };
        
        const toast = document.createElement('div');
        toast.className = \`fixed bottom-4 right-4 \${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300\`;
        toast.innerHTML = \`<i class="fas fa-\${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle mr-2"></i>\${message}\`;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 300);
        }, 4000);
      }
    </script>
  `

  return renderAdminLayout('AI講座生成', content, 'ai-course-generator')
}
