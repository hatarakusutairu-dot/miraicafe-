/**
 * AI記事生成ページ（改善版）
 * - Markdown→HTML変換
 * - 概要(excerpt)自動生成
 * - SEO一括設定
 */

import { renderAdminLayout } from './layout'

export const renderAIWriterPage = () => {
  const content = `
    <style>
      /* Markdown変換後のHTML用CSS */
      .markdown-content h1 { font-size: 1.8rem; font-weight: bold; color: #1e293b; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; }
      .markdown-content h2 { font-size: 1.5rem; font-weight: bold; color: #1e293b; margin: 20px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
      .markdown-content h3 { font-size: 1.25rem; font-weight: bold; color: #334155; margin: 16px 0 8px; }
      .markdown-content p { font-size: 1rem; line-height: 1.8; color: #374151; margin-bottom: 12px; }
      .markdown-content ul, .markdown-content ol { margin: 12px 0; padding-left: 24px; }
      .markdown-content li { margin-bottom: 6px; line-height: 1.7; }
      .markdown-content strong { font-weight: bold; color: #1e293b; }
      .markdown-content em { font-style: italic; color: #64748b; }
      .markdown-content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
      .markdown-content pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
      .markdown-content pre code { background: none; color: inherit; padding: 0; }
      .markdown-content blockquote { border-left: 4px solid #3b82f6; padding-left: 16px; margin: 12px 0; color: #64748b; font-style: italic; }
    </style>
    
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- ヘッダー -->
      <div>
        <h1 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-magic mr-2 text-purple-500"></i>AI記事生成
        </h1>
        <p class="text-gray-600 mt-1">キーワードやテーマを入力するだけで、AIが完全な記事を生成します</p>
      </div>

      <!-- 生成フォーム -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
              記事のテーマ・キーワード <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              id="topic" 
              placeholder="例: ChatGPTの基本的な使い方、AIで業務効率化する方法"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
            >
            <p class="text-xs text-gray-500 mt-1">この内容を元に記事を生成します</p>
          </div>
          
          <div class="grid md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-file-alt text-blue-500 mr-1"></i>記事の種類
              </label>
              <select id="articleType" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition">
                <option value="how-to">使い方ガイド</option>
                <option value="tutorial">チュートリアル</option>
                <option value="case-study">事例紹介</option>
                <option value="news">ニュース解説</option>
                <option value="opinion">コラム・意見</option>
                <option value="comparison">比較記事</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-ruler text-green-500 mr-1"></i>記事の長さ
              </label>
              <select id="articleLength" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition">
                <option value="short">短め (1000〜1500文字)</option>
                <option value="medium" selected>標準 (2000〜2500文字)</option>
                <option value="long">長め (3000〜4000文字)</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-comment text-orange-500 mr-1"></i>トーン
              </label>
              <select id="tone" class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition">
                <option value="friendly" selected>親しみやすい</option>
                <option value="professional">プロフェッショナル</option>
                <option value="casual">カジュアル</option>
                <option value="educational">教育的</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-plus-circle text-purple-500 mr-1"></i>追加の指示（任意）
            </label>
            <textarea 
              id="additionalInstructions" 
              placeholder="例: 初心者向けに、具体例を多く含めてください。箇条書きを多用してください。"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition h-24 resize-none"
            ></textarea>
          </div>
          
          <button 
            onclick="generateArticle()" 
            id="generateBtn"
            class="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition transform hover:-translate-y-0.5 shadow-lg"
          >
            <i class="fas fa-magic mr-2"></i>記事を生成する
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
              <i class="fas fa-heading text-blue-500 mr-1"></i>タイトル
            </label>
            <div id="generatedTitle" class="p-4 bg-gray-50 rounded-lg font-bold text-lg text-gray-800"></div>
          </div>
          
          <!-- 概要 -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-align-left text-teal-500 mr-1"></i>概要（Excerpt）
            </label>
            <div id="generatedExcerpt" class="p-4 bg-gray-50 rounded-lg text-gray-700"></div>
          </div>
          
          <!-- カテゴリ -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-folder text-yellow-500 mr-1"></i>カテゴリ提案（選択してください）
            </label>
            <div id="categorySuggestions" class="flex flex-wrap gap-2"></div>
          </div>
          
          <!-- タグ -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-tags text-purple-500 mr-1"></i>自動生成タグ
            </label>
            <div id="generatedTags" class="flex flex-wrap gap-2"></div>
          </div>
          
          <!-- 本文 -->
          <div class="border-b pb-5">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-semibold text-gray-700">
                <i class="fas fa-file-alt text-green-500 mr-1"></i>本文
              </label>
              <button onclick="togglePreview()" class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition">
                <i class="fas fa-eye mr-1"></i><span id="previewBtnText">プレビュー</span>
              </button>
            </div>
            <!-- Markdownソース -->
            <textarea id="generatedContentMarkdown" class="w-full p-4 bg-gray-50 rounded-lg text-gray-700 font-mono text-sm" style="min-height: 400px; display: block;"></textarea>
            <!-- HTMLプレビュー -->
            <div id="generatedContentPreview" class="p-4 bg-gray-50 rounded-lg markdown-content" style="min-height: 400px; display: none;"></div>
          </div>
          
          <!-- メタディスクリプション -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-search text-blue-500 mr-1"></i>メタディスクリプション
            </label>
            <div id="generatedMeta" class="p-4 bg-gray-50 rounded-lg text-gray-600 text-sm"></div>
          </div>
          
          <!-- SEO一括設定 -->
          <div class="border-b pb-5">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              <i class="fas fa-bullseye text-red-500 mr-1"></i>SEO一括設定
            </label>
            <button onclick="applyAllSEO()" class="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition">
              <i class="fas fa-check-double mr-2"></i>カテゴリ・メタディスクリプション・キーワードを一括設定
            </button>
            <div id="seoStatus" class="mt-2 text-green-600 font-medium hidden"></div>
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
            <button onclick="saveArticle()" class="flex-1 min-w-[140px] py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition">
              <i class="fas fa-save mr-2"></i>下書き保存
            </button>
            <button onclick="editAndSave()" class="flex-1 min-w-[140px] py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition">
              <i class="fas fa-edit mr-2"></i>編集してから保存
            </button>
            <button onclick="regenerateArticle()" class="flex-1 min-w-[140px] py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition">
              <i class="fas fa-redo mr-2"></i>再生成
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ローディングオーバーレイ -->
    <div id="loadingOverlay" class="fixed inset-0 bg-black/70 hidden items-center justify-center z-50">
      <div class="bg-white p-8 rounded-2xl text-center max-w-sm mx-4">
        <div class="w-16 h-16 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-lg font-bold text-gray-800">AIが記事を生成中...</p>
        <p class="text-sm text-gray-500 mt-2">30秒〜1分ほどお待ちください</p>
      </div>
    </div>

    <!-- Marked.js for Markdown parsing -->
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    
    <script>
      let generatedData = {};
      let selectedCategory = null;
      let selectedImage = null;
      let isPreviewMode = false;

      // Markdown → HTML変換
      function markdownToHtml(markdown) {
        if (typeof marked !== 'undefined') {
          return marked.parse(markdown);
        }
        // フォールバック: 簡易変換
        return markdown
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
          .replace(/^- (.+)$/gm, '<li>$1</li>')
          .replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>')
          .replace(/\\n\\n/g, '</p><p>')
          .replace(/^(.+)$/gm, '<p>$1</p>');
      }

      // プレビュー切り替え
      function togglePreview() {
        isPreviewMode = !isPreviewMode;
        const markdown = document.getElementById('generatedContentMarkdown');
        const preview = document.getElementById('generatedContentPreview');
        const btnText = document.getElementById('previewBtnText');
        
        if (isPreviewMode) {
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

      // 記事生成
      async function generateArticle() {
        const topic = document.getElementById('topic').value.trim();
        if (!topic) {
          showToast('テーマ・キーワードを入力してください', 'error');
          return;
        }
        
        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        document.getElementById('loadingOverlay').classList.remove('hidden');
        document.getElementById('loadingOverlay').classList.add('flex');
        
        try {
          const response = await fetch('/admin/api/ai/generate-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic,
              articleType: document.getElementById('articleType').value,
              articleLength: document.getElementById('articleLength').value,
              tone: document.getElementById('tone').value,
              additionalInstructions: document.getElementById('additionalInstructions').value
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || '生成に失敗しました');
          }
          
          generatedData = data;
          displayResults(data);
          showToast('記事を生成しました！', 'success');
          
        } catch (error) {
          console.error('生成エラー:', error);
          showToast(error.message || '記事の生成に失敗しました', 'error');
        } finally {
          btn.disabled = false;
          document.getElementById('loadingOverlay').classList.add('hidden');
          document.getElementById('loadingOverlay').classList.remove('flex');
        }
      }

      // 結果表示
      function displayResults(data) {
        document.getElementById('generatedTitle').textContent = data.title || '';
        document.getElementById('generatedExcerpt').textContent = data.excerpt || data.metaDescription || '';
        document.getElementById('generatedContentMarkdown').value = data.content || '';
        document.getElementById('generatedMeta').textContent = data.metaDescription || '';
        
        // プレビューもリセット
        isPreviewMode = false;
        document.getElementById('generatedContentMarkdown').style.display = 'block';
        document.getElementById('generatedContentPreview').style.display = 'none';
        document.getElementById('previewBtnText').textContent = 'プレビュー';
        
        // カテゴリ提案
        const categoryContainer = document.getElementById('categorySuggestions');
        categoryContainer.innerHTML = (data.categories || []).map(cat => 
          \`<button onclick="selectCategory('\${cat}')" class="category-chip px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition">\${cat}</button>\`
        ).join('');
        
        // デフォルトで最初のカテゴリを選択
        if (data.categories && data.categories.length > 0) {
          selectCategory(data.categories[0]);
        }
        
        // タグ
        const tagsContainer = document.getElementById('generatedTags');
        tagsContainer.innerHTML = (data.tags || []).map(tag => 
          \`<span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">\${tag}</span>\`
        ).join('');
        
        // 画像候補
        const imageContainer = document.getElementById('imageSuggestions');
        if (data.images && data.images.length > 0) {
          imageContainer.innerHTML = data.images.map((img, index) => 
            \`<div class="image-option cursor-pointer rounded-lg overflow-hidden border-3 border-transparent hover:border-blue-400 transition" onclick="selectImage(\${index}, '\${img}')">
              <img src="\${img}" alt="候補\${index + 1}" class="w-full h-32 object-cover">
            </div>\`
          ).join('');
          // デフォルトで最初の画像を選択
          selectImage(0, data.images[0]);
        } else {
          imageContainer.innerHTML = '<p class="text-gray-500 text-sm col-span-full">画像候補がありません</p>';
        }
        
        // SEOステータスをリセット
        document.getElementById('seoStatus').classList.add('hidden');
        
        // 結果セクション表示
        document.getElementById('resultSection').classList.remove('hidden');
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
      }

      // カテゴリ選択
      function selectCategory(category) {
        selectedCategory = category;
        document.querySelectorAll('.category-chip').forEach(chip => {
          if (chip.textContent === category) {
            chip.classList.remove('bg-blue-100', 'text-blue-700');
            chip.classList.add('bg-green-500', 'text-white');
          } else {
            chip.classList.remove('bg-green-500', 'text-white');
            chip.classList.add('bg-blue-100', 'text-blue-700');
          }
        });
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

      // SEO一括設定
      function applyAllSEO() {
        if (!selectedCategory) {
          showToast('カテゴリを選択してください', 'error');
          return;
        }
        
        generatedData.seoApplied = true;
        const seoStatus = document.getElementById('seoStatus');
        seoStatus.innerHTML = \`<i class="fas fa-check-circle mr-1"></i>SEO設定完了: カテゴリ「\${selectedCategory}」、メタディスクリプション、キーワード(\${(generatedData.tags || []).join(', ')})\`;
        seoStatus.classList.remove('hidden');
        showToast('SEO設定を適用しました', 'success');
      }

      // 記事保存
      async function saveArticle() {
        if (!selectedCategory) {
          showToast('カテゴリを選択してください', 'error');
          return;
        }
        
        // Markdown → HTML変換
        const contentMarkdown = document.getElementById('generatedContentMarkdown').value;
        const contentHtml = markdownToHtml(contentMarkdown);
        
        try {
          const response = await fetch('/admin/api/blog-posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: generatedData.title,
              content: contentHtml,
              excerpt: generatedData.excerpt || generatedData.metaDescription,
              category: selectedCategory,
              tags: (generatedData.tags || []).join(','),
              meta_description: generatedData.metaDescription,
              featured_image: selectedImage || '',
              status: 'draft'
            })
          });
          
          if (response.ok) {
            showToast('記事を下書きとして保存しました！', 'success');
            setTimeout(() => location.href = '/admin/blog', 1500);
          } else {
            throw new Error('保存に失敗しました');
          }
        } catch (error) {
          console.error('保存エラー:', error);
          showToast('記事の保存に失敗しました', 'error');
        }
      }

      // 編集してから保存
      function editAndSave() {
        if (!selectedCategory) {
          showToast('カテゴリを選択してください', 'error');
          return;
        }
        
        const contentMarkdown = document.getElementById('generatedContentMarkdown').value;
        const contentHtml = markdownToHtml(contentMarkdown);
        
        sessionStorage.setItem('aiGeneratedArticle', JSON.stringify({
          title: generatedData.title,
          content: contentHtml,
          excerpt: generatedData.excerpt || generatedData.metaDescription || '',
          category: selectedCategory,
          tags: (generatedData.tags || []).join(','),
          meta_description: generatedData.metaDescription,
          keywords: (generatedData.tags || []).join(', '),
          featured_image: selectedImage || ''
        }));
        
        location.href = '/admin/blog/new';
      }

      // 再生成
      function regenerateArticle() {
        if (confirm('現在の内容を破棄して再生成しますか？')) {
          generateArticle();
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

  return renderAdminLayout('AI記事生成', content, 'ai-writer')
}
