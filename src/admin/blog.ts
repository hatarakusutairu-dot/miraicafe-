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
            <textarea name="meta_description" rows="3" maxlength="160"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="この記事の内容を120文字程度で要約してください">${escapeHtmlForTextarea(post?.meta_description || '')}</textarea>
            <div class="flex justify-end mt-1">
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
      // 画像アップロードコンポーネントを初期化
      document.addEventListener('DOMContentLoaded', function() {
        initImageUpload('blog-image-upload', 'image', '${escapeAttr(post?.image || '')}');
        initSEOFeatures('blog');
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
              
              <button onclick="document.getElementById('ai-suggestion-modal').remove();" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">
                閉じる
              </button>
            </div>
          </div>
        \`;
        document.body.appendChild(modal);
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
      function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000; animation: fadeIn 0.3s;';
        toast.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      }
    </script>
  `

  return renderAdminLayout(title, content, 'blog')
}
