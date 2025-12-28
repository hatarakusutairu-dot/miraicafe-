import { renderAdminLayout } from './layout'
import { BlogPost, blogCategories, BlogCategory } from '../data'

// HTMLエスケープ関数（textarea内のHTML出力用）
function escapeHtmlForTextarea(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 属性値用エスケープ関数
function escapeAttr(text: string): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 動画URLからプレビューHTMLを生成
function getVideoPreviewHtml(url: string): string {
  if (!url) return ''
  
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (youtubeMatch) {
    return `<iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  }
  
  // Vimeo
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch) {
    return `<iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" class="w-full h-full" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
  }
  
  // MP4直接リンク（Canva, Sora, Gemini, GenSparkなどで生成した動画）
  if (url.match(/\.(mp4|webm|ogg)(\?|$)/i) || url.includes('blob.') || url.includes('storage.') || url.includes('cdn.')) {
    return `<video src="${url}" class="w-full h-full object-contain" controls preload="metadata"></video>`
  }
  
  // その他はiframeで試行
  return `<video src="${url}" class="w-full h-full object-contain" controls preload="metadata"></video>`
}

// ブログ一覧ページ
export const renderBlogList = (posts: BlogPost[]) => {
  const content = `
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">ブログ管理</h1>
        <p class="text-gray-500 mt-1">全${posts.length}件の記事</p>
      </div>
      <a href="/admin/blog/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition">
        <i class="fas fa-plus mr-2"></i>
        新規作成
      </a>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" id="search-input" placeholder="タイトルで検索..." 
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
        </div>
        <select id="category-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          <option value="">すべてのカテゴリ</option>
          ${blogCategories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Blog List -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">カテゴリ</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">タグ</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">公開日</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200" id="blog-table-body">
          ${posts.map(post => `
            <tr class="blog-row hover:bg-gray-50" data-title="${post.title.toLowerCase()}" data-category="${post.category}">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
                  </div>
                  <div>
                    <a href="/blog/${post.id}" target="_blank" class="font-medium text-gray-800 hover:text-blue-600">${post.title}</a>
                    <p class="text-sm text-gray-500 line-clamp-1 md:hidden">${post.category}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">${post.category}</span>
              </td>
              <td class="px-6 py-4 hidden lg:table-cell">
                <div class="flex flex-wrap gap-1">
                  ${(post.tags || []).slice(0, 2).map(tag => `<span class="text-xs text-gray-500">#${tag}</span>`).join('')}
                  ${(post.tags || []).length > 2 ? `<span class="text-xs text-gray-400">+${post.tags.length - 2}</span>` : ''}
                </div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="text-sm text-gray-600">${post.date}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <a href="/admin/blog/edit/${post.id}" class="text-blue-600 hover:text-blue-800 p-2" title="編集">
                    <i class="fas fa-edit"></i>
                  </a>
                  <button onclick="confirmDelete('${post.id}', '${post.title.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800 p-2" title="削除">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${posts.length === 0 ? `
        <div class="text-center py-12">
          <i class="fas fa-newspaper text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">まだ記事がありません</p>
          <a href="/admin/blog/new" class="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            最初の記事を作成する
          </a>
        </div>
      ` : ''}
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2">記事を削除</h3>
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
      // Search and filter
      const searchInput = document.getElementById('search-input');
      const categoryFilter = document.getElementById('category-filter');
      const rows = document.querySelectorAll('.blog-row');

      function filterRows() {
        const search = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        rows.forEach(row => {
          const title = row.dataset.title;
          const rowCategory = row.dataset.category;
          const matchSearch = !search || title.includes(search);
          const matchCategory = !category || rowCategory === category;
          row.style.display = matchSearch && matchCategory ? '' : 'none';
        });
      }

      searchInput.addEventListener('input', filterRows);
      categoryFilter.addEventListener('change', filterRows);

      // Delete modal
      function confirmDelete(id, title) {
        document.getElementById('delete-title').textContent = title;
        document.getElementById('delete-form').action = '/admin/blog/delete/' + id;
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

  return renderAdminLayout('ブログ管理', content, 'blog')
}

// ブログ新規作成・編集ページ
export const renderBlogForm = (post?: BlogPost, error?: string) => {
  const isEdit = !!post
  const title = isEdit ? '記事を編集' : '新規記事作成'

  const content = `
    <div class="mb-6">
      <a href="/admin/blog" class="text-gray-500 hover:text-gray-700 text-sm">
        <i class="fas fa-arrow-left mr-1"></i>ブログ一覧に戻る
      </a>
      <h1 class="text-2xl font-bold text-gray-800 mt-2">${title}</h1>
    </div>

    ${error ? `
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
        <i class="fas fa-exclamation-circle mr-2"></i>
        <span>${error}</span>
      </div>
    ` : ''}

    <form method="POST" action="${isEdit ? '/admin/blog/update/' + post?.id : '/admin/blog/create'}" class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">基本情報</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">タイトル <span class="text-red-500">*</span></label>
            <input type="text" name="title" required value="${escapeAttr(post?.title || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="記事のタイトルを入力">
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
                  <p class="text-xs text-slate-500">タイトルと本文を入力すると自動計算</p>
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">カテゴリ <span class="text-red-500">*</span></label>
              <select name="category" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                <option value="">選択してください</option>
                ${blogCategories.map(cat => `<option value="${cat.name}" ${post?.category === cat.name ? 'selected' : ''}>${cat.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">タグ</label>
              <input type="text" name="tags" value="${escapeAttr(post?.tags?.join(', ') || '')}"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="AI, ChatGPT, 初心者向け">
              <p class="text-xs text-gray-500 mt-1">カンマ区切りで入力</p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">概要（抜粋）</label>
            <textarea name="excerpt" rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="記事の概要を入力（一覧表示用）">${escapeHtmlForTextarea(post?.excerpt || '')}</textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-image mr-1"></i>アイキャッチ画像
            </label>
            <div id="blog-image-upload"></div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-video mr-1"></i>動画（任意）
            </label>
            
            <!-- 動画アップロード -->
            <div class="mb-3">
              <div class="flex items-center gap-3">
                <label class="flex-1 cursor-pointer">
                  <div id="video-upload-area" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                    <i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                    <p class="text-sm text-gray-600">MP4ファイルをアップロード</p>
                    <p class="text-xs text-gray-400 mt-1">最大100MB（MP4, WebM, MOV）</p>
                  </div>
                  <input type="file" id="video-file-input" accept="video/mp4,video/webm,video/quicktime" class="hidden">
                </label>
              </div>
              <div id="video-upload-progress" class="hidden mt-2">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-gray-200 rounded-full h-2">
                    <div id="video-progress-bar" class="bg-blue-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                  </div>
                  <span id="video-progress-text" class="text-xs text-gray-500">0%</span>
                </div>
              </div>
            </div>
            
            <!-- または -->
            <div class="flex items-center gap-3 mb-3">
              <div class="flex-1 border-t border-gray-200"></div>
              <span class="text-xs text-gray-400">または URL を入力</span>
              <div class="flex-1 border-t border-gray-200"></div>
            </div>
            
            <!-- 動画URL入力 -->
            <input type="url" name="video_url" id="video_url" value="${escapeAttr(post?.video_url || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="YouTube, Vimeo, MP4ファイルのURLを入力">
            <p class="text-xs text-gray-500 mt-1">
              <i class="fas fa-info-circle mr-1"></i>
              対応: YouTube, Vimeo, MP4（Canva, Sora, Gemini, GenSparkなどで作成した動画）
            </p>
            
            <!-- プレビュー -->
            ${post?.video_url ? `
              <div class="mt-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm text-gray-600">プレビュー:</p>
                  <button type="button" onclick="clearVideo()" class="text-xs text-red-500 hover:text-red-700">
                    <i class="fas fa-times mr-1"></i>削除
                  </button>
                </div>
                <div id="video-preview" class="aspect-video bg-black rounded-lg overflow-hidden">
                  ${getVideoPreviewHtml(post.video_url)}
                </div>
              </div>
            ` : `
              <div id="video-preview-container" class="mt-3 hidden">
                <div class="p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-sm text-gray-600">プレビュー:</p>
                    <button type="button" onclick="clearVideo()" class="text-xs text-red-500 hover:text-red-700">
                      <i class="fas fa-times mr-1"></i>削除
                    </button>
                  </div>
                  <div id="video-preview" class="aspect-video bg-black rounded-lg overflow-hidden"></div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">本文 <span class="text-red-500">*</span></h2>
        <p class="text-sm text-gray-500 mb-2">HTML形式で入力できます（&lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;など）</p>
        <textarea name="content" rows="20" required
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
          placeholder="<p>記事の本文を入力...</p>">${escapeHtmlForTextarea(post?.content || '')}</textarea>
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
                placeholder="この記事の内容を120文字程度で要約してください">${escapeHtmlForTextarea(post?.meta_description || '')}</textarea>
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
            <input type="text" name="keywords" value="${escapeAttr(post?.keywords || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="例: ChatGPT, AI活用, 初心者向け">
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4">公開設定</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">著者名</label>
            <input type="text" name="author" value="${escapeAttr(post?.author || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="田中 花子">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公開日</label>
            <input type="date" name="date" value="${post?.date || new Date().toISOString().split('T')[0]}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">読了時間</label>
          <input type="text" name="readTime" value="${escapeAttr(post?.readTime || '5分')}"
            class="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="5分">
        </div>
      </div>

      <div class="flex items-center justify-between">
        <a href="/admin/blog" class="px-6 py-2 text-gray-600 hover:text-gray-800 transition">
          キャンセル
        </a>
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center">
          <i class="fas fa-save mr-2"></i>
          ${isEdit ? '更新する' : '保存する'}
        </button>
      </div>
    </form>
    
    <script>
      // 動画ファイルアップロード
      async function handleVideoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // ファイルサイズチェック（100MB）
        if (file.size > 100 * 1024 * 1024) {
          alert('ファイルサイズが大きすぎます（最大100MB）');
          return;
        }
        
        // MIMEタイプチェック
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
          alert('対応していないファイル形式です。MP4, WebM, MOVのみ対応しています。');
          return;
        }
        
        const progressContainer = document.getElementById('video-upload-progress');
        const progressBar = document.getElementById('video-progress-bar');
        const progressText = document.getElementById('video-progress-text');
        const uploadArea = document.getElementById('video-upload-area');
        
        // プログレス表示
        progressContainer.classList.remove('hidden');
        uploadArea.innerHTML = '<i class="fas fa-spinner fa-spin text-2xl text-blue-500 mb-2"></i><p class="text-sm text-blue-600">アップロード中...</p>';
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          // XMLHttpRequestでプログレス監視
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              progressBar.style.width = percent + '%';
              progressText.textContent = percent + '%';
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const data = JSON.parse(xhr.responseText);
              if (data.success && data.url) {
                // URLを入力欄にセット
                document.getElementById('video_url').value = data.url;
                updateVideoPreview();
                showToast('動画をアップロードしました');
              } else {
                throw new Error(data.error || 'アップロードに失敗しました');
              }
            } else {
              throw new Error('アップロードに失敗しました');
            }
            
            // UIをリセット
            progressContainer.classList.add('hidden');
            progressBar.style.width = '0%';
            uploadArea.innerHTML = '<i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i><p class="text-sm text-gray-600">MP4ファイルをアップロード</p><p class="text-xs text-gray-400 mt-1">最大100MB（MP4, WebM, MOV）</p>';
          });
          
          xhr.addEventListener('error', () => {
            alert('アップロードに失敗しました');
            progressContainer.classList.add('hidden');
            uploadArea.innerHTML = '<i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i><p class="text-sm text-gray-600">MP4ファイルをアップロード</p><p class="text-xs text-gray-400 mt-1">最大100MB（MP4, WebM, MOV）</p>';
          });
          
          xhr.open('POST', '/admin/api/upload-video');
          xhr.send(formData);
          
        } catch (err) {
          alert(err.message || 'アップロードに失敗しました');
          progressContainer.classList.add('hidden');
          uploadArea.innerHTML = '<i class="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i><p class="text-sm text-gray-600">MP4ファイルをアップロード</p><p class="text-xs text-gray-400 mt-1">最大100MB（MP4, WebM, MOV）</p>';
        }
      }
      
      // 動画クリア
      function clearVideo() {
        document.getElementById('video_url').value = '';
        const container = document.getElementById('video-preview-container');
        if (container) container.classList.add('hidden');
        const preview = document.getElementById('video-preview');
        if (preview) preview.innerHTML = '';
      }
      
      // 動画プレビュー更新関数
      function updateVideoPreview() {
        const url = document.getElementById('video_url').value.trim();
        const container = document.getElementById('video-preview-container');
        const preview = document.getElementById('video-preview');
        
        if (!url) {
          if (container) container.classList.add('hidden');
          return;
        }
        
        if (container) container.classList.remove('hidden');
        
        let html = '';
        
        // YouTube
        const youtubeMatch = url.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/|youtube\\.com\\/embed\\/)([a-zA-Z0-9_-]{11})/);
        if (youtubeMatch) {
          html = '<iframe src="https://www.youtube.com/embed/' + youtubeMatch[1] + '" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        }
        
        // Vimeo
        const vimeoMatch = url.match(/(?:vimeo\\.com\\/)([0-9]+)/);
        if (!html && vimeoMatch) {
          html = '<iframe src="https://player.vimeo.com/video/' + vimeoMatch[1] + '" class="w-full h-full" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
        }
        
        // MP4/その他
        if (!html) {
          html = '<video src="' + url + '" class="w-full h-full object-contain" controls preload="metadata"></video>';
        }
        
        if (preview) preview.innerHTML = html;
      }
      
      // 画像アップロードコンポーネントを初期化
      document.addEventListener('DOMContentLoaded', function() {
        initImageUpload('blog-image-upload', 'image', '${escapeAttr(post?.image || '')}');
        initSEOFeatures('blog');
        
        // 動画URLの入力監視
        const videoUrlInput = document.getElementById('video_url');
        if (videoUrlInput) {
          videoUrlInput.addEventListener('input', debounce(updateVideoPreview, 500));
          videoUrlInput.addEventListener('blur', updateVideoPreview);
        }
        
        // 動画ファイルアップロード
        const videoFileInput = document.getElementById('video-file-input');
        if (videoFileInput) {
          videoFileInput.addEventListener('change', handleVideoUpload);
        }
        
        // AI記事生成からのデータを受け取る
        const aiData = sessionStorage.getItem('aiGeneratedArticle');
        if (aiData) {
          try {
            const data = JSON.parse(aiData);
            // フォームに反映
            if (data.title) document.querySelector('input[name="title"]').value = data.title;
            if (data.content) document.querySelector('textarea[name="content"]').value = data.content;
            if (data.excerpt) document.querySelector('textarea[name="excerpt"]').value = data.excerpt;
            if (data.category) document.querySelector('select[name="category"]').value = data.category;
            if (data.tags) document.querySelector('input[name="tags"]').value = data.tags;
            if (data.meta_description) {
              document.querySelector('textarea[name="meta_description"]').value = data.meta_description;
              // 文字数カウント更新
              const metaCharCount = document.getElementById('meta-char-count');
              if (metaCharCount) metaCharCount.textContent = data.meta_description.length;
            }
            if (data.keywords) document.querySelector('input[name="keywords"]').value = data.keywords;
            if (data.featured_image) {
              document.getElementById('blog-image-upload-hidden').value = data.featured_image;
              showPreview('blog-image-upload', data.featured_image);
            }
            // 使用済みなので削除
            sessionStorage.removeItem('aiGeneratedArticle');
            showToast('AI生成データを読み込みました');
            
            // SEOスコアを自動更新
            setTimeout(() => {
              const titleInput = document.querySelector('input[name="title"]');
              if (titleInput) titleInput.dispatchEvent(new Event('input'));
            }, 500);
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
        const contentInput = document.querySelector('textarea[name="content"]');
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
              alert('タイトルと内容を入力してください');
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
        const contentInput = document.querySelector('textarea[name="content"]');
        
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
          showToast('タイトルを反映しました');
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
        const contentInput = document.querySelector('textarea[name="content"]');
        const charCountEl = document.getElementById('meta-char-count');
        
        const title = titleInput ? titleInput.value.trim() : '';
        const content = contentInput ? contentInput.value.trim() : '';
        
        if (!title || !content) {
          alert('タイトルと内容を入力してください');
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

  return renderAdminLayout(title, content, 'blog')
}
