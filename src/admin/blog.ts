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
            <label class="block text-sm font-medium text-gray-700 mb-1">アイキャッチ画像URL</label>
            <input type="url" name="image" value="${escapeAttr(post?.image || '')}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="https://example.com/image.jpg">
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
  `

  return renderAdminLayout(title, content, 'blog')
}
