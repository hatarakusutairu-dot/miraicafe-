/**
 * AIニュース管理画面（一括操作対応版）
 */

import { renderAdminLayout } from './layout'

// カテゴリ定義
type NewsCategory = 'official_announcement' | 'tool_update' | 'how_to' | 'other';

// AIニュースの型定義（拡張版）
export interface AINews {
  id: number
  title: string
  url: string
  summary: string | null
  source: string | null
  published_at: string | null
  status: 'pending' | 'approved' | 'rejected'
  ai_relevance_score: number | null
  category: NewsCategory | null
  original_language: string | null
  is_translated: number | null
  image_url: string | null
  image_source: 'ogp' | 'unsplash' | 'gradient' | null
  created_at: string
  updated_at: string | null
}

// カテゴリ表示名
const categoryLabels: Record<NewsCategory | 'all', { label: string; icon: string; color: string }> = {
  all: { label: '全カテゴリ', icon: 'fas fa-list', color: 'gray' },
  official_announcement: { label: '公式発表', icon: 'fas fa-bullhorn', color: 'red' },
  tool_update: { label: 'ツール更新', icon: 'fas fa-sync-alt', color: 'blue' },
  how_to: { label: '使い方', icon: 'fas fa-book', color: 'green' },
  other: { label: 'その他', icon: 'fas fa-ellipsis-h', color: 'gray' },
};

/**
 * AIニュース一覧ページ
 */
export const renderAINewsList = (news: AINews[], counts: { all: number; pending: number; approved: number; rejected: number }) => {
  // カテゴリ別カウント
  const categoryCounts = {
    official_announcement: news.filter(n => n.category === 'official_announcement').length,
    tool_update: news.filter(n => n.category === 'tool_update').length,
    how_to: news.filter(n => n.category === 'how_to').length,
  };

  const content = `
    <div class="space-y-6">
      <!-- ヘッダー -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-robot mr-2 text-blue-500"></i>AIニュース管理
          </h1>
          <p class="text-gray-600 mt-1">RSS/APIからAI関連ニュースを自動収集・管理します（厳格フィルタ版）</p>
        </div>
        <button onclick="triggerCollection()" id="collectBtn" class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition flex items-center gap-2 font-medium">
          <i class="fas fa-bolt"></i>今すぐ収集実行
        </button>
      </div>

      <!-- 統計カード -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-gray-400">
          <div id="count-all" class="text-2xl font-bold text-gray-800">${counts.all}</div>
          <div class="text-sm text-gray-500">全て</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-400">
          <div id="count-pending" class="text-2xl font-bold text-yellow-600">${counts.pending}</div>
          <div class="text-sm text-gray-500">新規（未承認）</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-green-400">
          <div id="count-approved" class="text-2xl font-bold text-green-600">${counts.approved}</div>
          <div class="text-sm text-gray-500">承認済み</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-red-400">
          <div id="count-rejected" class="text-2xl font-bold text-red-600">${counts.rejected}</div>
          <div class="text-sm text-gray-500">却下</div>
        </div>
      </div>

      <!-- カテゴリ別統計 -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-red-50 rounded-lg p-3 border border-red-200">
          <div class="flex items-center gap-2">
            <i class="fas fa-bullhorn text-red-500"></i>
            <span class="font-medium text-red-700">公式発表</span>
          </div>
          <div class="text-xl font-bold text-red-600 mt-1">${categoryCounts.official_announcement}</div>
        </div>
        <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div class="flex items-center gap-2">
            <i class="fas fa-sync-alt text-blue-500"></i>
            <span class="font-medium text-blue-700">ツール更新</span>
          </div>
          <div class="text-xl font-bold text-blue-600 mt-1">${categoryCounts.tool_update}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3 border border-green-200">
          <div class="flex items-center gap-2">
            <i class="fas fa-book text-green-500"></i>
            <span class="font-medium text-green-700">使い方</span>
          </div>
          <div class="text-xl font-bold text-green-600 mt-1">${categoryCounts.how_to}</div>
        </div>
      </div>

      <!-- フィルター -->
      <div class="bg-white rounded-lg shadow">
        <!-- ステータスフィルター -->
        <div class="border-b flex overflow-x-auto">
          <button onclick="filterNews('all')" data-status="all" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 hover:text-blue-600 hover:border-blue-300 transition whitespace-nowrap">
            全て (<span id="tab-count-all">${counts.all}</span>)
          </button>
          <button onclick="filterNews('pending')" data-status="pending" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-yellow-600 hover:border-yellow-300 transition whitespace-nowrap">
            <i class="fas fa-clock mr-1"></i>新規 (<span id="tab-count-pending">${counts.pending}</span>)
          </button>
          <button onclick="filterNews('approved')" data-status="approved" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-green-600 hover:border-green-300 transition whitespace-nowrap">
            <i class="fas fa-check mr-1"></i>承認済み (<span id="tab-count-approved">${counts.approved}</span>)
          </button>
          <button onclick="filterNews('rejected')" data-status="rejected" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-red-600 hover:border-red-300 transition whitespace-nowrap">
            <i class="fas fa-times mr-1"></i>却下 (<span id="tab-count-rejected">${counts.rejected}</span>)
          </button>
        </div>

        <!-- カテゴリフィルター -->
        <div class="p-4 bg-gray-50 border-b flex flex-wrap gap-2">
          <span class="text-sm text-gray-500 mr-2 self-center">カテゴリ:</span>
          <button onclick="filterByCategory('all')" data-category="all" class="cat-filter px-3 py-1.5 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium">
            全て
          </button>
          <button onclick="filterByCategory('official_announcement')" data-category="official_announcement" class="cat-filter px-3 py-1.5 text-sm rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition">
            <i class="fas fa-bullhorn mr-1"></i>公式発表
          </button>
          <button onclick="filterByCategory('tool_update')" data-category="tool_update" class="cat-filter px-3 py-1.5 text-sm rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition">
            <i class="fas fa-sync-alt mr-1"></i>ツール更新
          </button>
          <button onclick="filterByCategory('how_to')" data-category="how_to" class="cat-filter px-3 py-1.5 text-sm rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition">
            <i class="fas fa-book mr-1"></i>使い方
          </button>
        </div>

        <!-- 一括操作バー -->
        <div id="bulkActionBar" class="p-3 bg-blue-50 border-b hidden">
          <div class="flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
              <input type="checkbox" id="selectAll" onchange="toggleSelectAll()" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
              <label for="selectAll" class="text-sm font-medium text-gray-700">全選択</label>
              <span id="selectedCount" class="text-sm text-blue-600 font-bold">(0件選択中)</span>
            </div>
            <div class="flex-1"></div>
            <div class="flex flex-wrap gap-2">
              <button onclick="bulkAction('approved')" class="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed" id="bulkApproveBtn" disabled>
                <i class="fas fa-check mr-1"></i>一括承認
              </button>
              <button onclick="bulkAction('rejected')" class="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed" id="bulkRejectBtn" disabled>
                <i class="fas fa-times mr-1"></i>一括却下
              </button>
              <button onclick="bulkAction('pending')" class="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed" id="bulkPendingBtn" disabled>
                <i class="fas fa-undo mr-1"></i>一括保留
              </button>
              <button onclick="bulkDelete()" class="px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed" id="bulkDeleteBtn" disabled>
                <i class="fas fa-trash mr-1"></i>一括削除
              </button>
            </div>
          </div>
        </div>

        <!-- ニュース一覧 -->
        <div id="newsList" class="divide-y">
          ${news.length === 0 ? `
            <div class="p-12 text-center text-gray-500">
              <i class="fas fa-inbox text-4xl mb-4"></i>
              <p>ニュースがありません</p>
              <p class="text-sm mt-2">「今すぐ収集実行」ボタンでニュースを収集してください</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <style>
      .cat-filter.active {
        ring: 2px;
        ring-offset: 2px;
        font-weight: bold;
      }
      .cat-filter[data-category="all"].active { background-color: #374151; color: white; }
      .cat-filter[data-category="official_announcement"].active { background-color: #DC2626; color: white; }
      .cat-filter[data-category="tool_update"].active { background-color: #2563EB; color: white; }
      .cat-filter[data-category="how_to"].active { background-color: #16A34A; color: white; }
    </style>

    <script>
      let currentFilter = 'all';
      let currentCategory = 'all';
      let allNews = ${JSON.stringify(news)};
      let selectedIds = new Set();

      // 初期表示
      renderNewsList();
      document.querySelector('.cat-filter[data-category="all"]').classList.add('active');
      showBulkActionBar();

      // ステータスフィルター切り替え
      function filterNews(status) {
        currentFilter = status;
        
        document.querySelectorAll('.tab-filter').forEach(tab => {
          const isActive = tab.dataset.status === status;
          tab.classList.toggle('border-blue-500', isActive);
          tab.classList.toggle('text-blue-600', isActive);
          tab.classList.toggle('border-transparent', !isActive);
        });

        renderNewsList();
      }

      // カテゴリフィルター切り替え
      function filterByCategory(category) {
        currentCategory = category;
        
        document.querySelectorAll('.cat-filter').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.category === category);
        });

        renderNewsList();
      }

      // カウントを更新する関数
      function updateCounts() {
        const allCount = allNews.length;
        const pendingCount = allNews.filter(n => n.status === 'pending').length;
        const approvedCount = allNews.filter(n => n.status === 'approved').length;
        const rejectedCount = allNews.filter(n => n.status === 'rejected').length;
        
        // 統計カード更新
        document.getElementById('count-all').textContent = allCount;
        document.getElementById('count-pending').textContent = pendingCount;
        document.getElementById('count-approved').textContent = approvedCount;
        document.getElementById('count-rejected').textContent = rejectedCount;
        
        // フィルタータブ更新
        document.getElementById('tab-count-all').textContent = allCount;
        document.getElementById('tab-count-pending').textContent = pendingCount;
        document.getElementById('tab-count-approved').textContent = approvedCount;
        document.getElementById('tab-count-rejected').textContent = rejectedCount;
      }
      
      // ニュース一覧を描画
      function renderNewsList() {
        // カウントを更新
        updateCounts();
        
        let filtered = allNews;
        
        // ステータスフィルター
        if (currentFilter !== 'all') {
          filtered = filtered.filter(n => n.status === currentFilter);
        }
        
        // カテゴリフィルター
        if (currentCategory !== 'all') {
          filtered = filtered.filter(n => n.category === currentCategory);
        }

        const container = document.getElementById('newsList');
        
        if (filtered.length === 0) {
          container.innerHTML = \`
            <div class="p-12 text-center text-gray-500">
              <i class="fas fa-inbox text-4xl mb-4"></i>
              <p>該当するニュースがありません</p>
            </div>
          \`;
          return;
        }

        container.innerHTML = filtered.map(item => \`
          <div class="p-4 hover:bg-gray-50 transition news-item" id="news-\${item.id}" data-id="\${item.id}">
            <div class="flex flex-col md:flex-row md:items-start gap-4">
              <!-- チェックボックス -->
              <div class="flex-shrink-0 flex items-center">
                <input type="checkbox" class="news-checkbox w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" data-id="\${item.id}" onchange="updateSelection()">
              </div>
              <!-- サムネイル画像 -->
              <div class="flex-shrink-0 w-full md:w-32 h-24 rounded-lg overflow-hidden bg-gray-100">
                \${item.image_url ? \`
                  <img 
                    src="\${item.image_url}" 
                    alt="\${escapeHtml(item.title)}"
                    class="w-full h-full object-cover"
                    onerror="this.parentElement.innerHTML='<div class=\\'w-full h-full flex items-center justify-center text-gray-400\\'><i class=\\'fas fa-image text-2xl\\'></i></div>'"
                  />
                \` : \`
                  <div class="w-full h-full flex items-center justify-center text-gray-400">
                    <i class="fas fa-image text-2xl"></i>
                  </div>
                \`}
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  \${getStatusBadge(item.status)}
                  \${getCategoryBadge(item.category)}
                  \${item.is_translated ? '<span class="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"><i class="fas fa-globe mr-1"></i>翻訳済</span>' : ''}
                  \${getImageSourceBadge(item.image_source)}
                  <span class="text-xs text-gray-500">
                    <i class="fas fa-chart-line mr-1"></i>関連度: \${item.ai_relevance_score ? Math.round(item.ai_relevance_score * 100) : 50}%
                  </span>
                </div>
                <h3 class="font-medium text-gray-800 mb-1">\${escapeHtml(item.title)}</h3>
                <p class="text-sm text-gray-600 mb-2">\${escapeHtml(item.summary || '')}</p>
                <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span><i class="fas fa-newspaper mr-1"></i>\${escapeHtml(item.source || '不明')}</span>
                  <span><i class="fas fa-calendar mr-1"></i>\${formatDate(item.published_at)}</span>
                  \${item.original_language ? \`<span><i class="fas fa-language mr-1"></i>\${item.original_language.toUpperCase()}</span>\` : ''}
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <a href="\${item.url}" target="_blank" class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition">
                  <i class="fas fa-external-link-alt mr-1"></i>記事を見る
                </a>
                \${item.status === 'pending' ? \`
                  <button onclick="updateStatus(\${item.id}, 'approved')" class="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition">
                    <i class="fas fa-check mr-1"></i>承認
                  </button>
                  <button onclick="updateStatus(\${item.id}, 'rejected')" class="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition">
                    <i class="fas fa-times mr-1"></i>却下
                  </button>
                \` : \`
                  <button onclick="updateStatus(\${item.id}, 'pending')" class="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition">
                    <i class="fas fa-undo mr-1"></i>保留に戻す
                  </button>
                \`}
                <button onclick="deleteNews(\${item.id})" class="px-3 py-1.5 bg-gray-200 text-gray-600 rounded text-sm hover:bg-gray-300 transition">
                  <i class="fas fa-trash mr-1"></i>削除
                </button>
              </div>
            </div>
          </div>
        \`).join('');
      }

      // ステータスバッジ
      function getStatusBadge(status) {
        const badges = {
          pending: '<span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"><i class="fas fa-clock mr-1"></i>新規</span>',
          approved: '<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"><i class="fas fa-check mr-1"></i>承認済み</span>',
          rejected: '<span class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium"><i class="fas fa-times mr-1"></i>却下</span>'
        };
        return badges[status] || '';
      }

      // カテゴリバッジ
      function getCategoryBadge(category) {
        const badges = {
          official_announcement: '<span class="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-medium"><i class="fas fa-bullhorn mr-1"></i>公式発表</span>',
          tool_update: '<span class="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-medium"><i class="fas fa-sync-alt mr-1"></i>ツール更新</span>',
          how_to: '<span class="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-medium"><i class="fas fa-book mr-1"></i>使い方</span>',
          other: '<span class="px-2 py-0.5 bg-gray-400 text-white rounded text-xs font-medium">その他</span>'
        };
        return badges[category] || '';
      }

      // 画像ソースバッジ
      function getImageSourceBadge(imageSource) {
        const badges = {
          ogp: '<span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"><i class="fas fa-share-alt mr-1"></i>OGP</span>',
          unsplash: '<span class="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"><i class="fas fa-camera mr-1"></i>Unsplash</span>',
          gradient: '<span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium"><i class="fas fa-palette mr-1"></i>グラデーション</span>'
        };
        return badges[imageSource] || '';
      }

      // 日付フォーマット
      function formatDate(dateStr) {
        if (!dateStr) return '不明';
        try {
          const date = new Date(dateStr);
          return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return dateStr;
        }
      }

      // HTMLエスケープ
      function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      // ステータス更新
      async function updateStatus(id, status) {
        try {
          const response = await fetch(\`/admin/api/ai-news/\${id}\`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });

          if (response.ok) {
            const newsItem = allNews.find(n => n.id === id);
            if (newsItem) {
              newsItem.status = status;
            }
            renderNewsList();
            showToast(\`ステータスを「\${status === 'approved' ? '承認' : status === 'rejected' ? '却下' : '保留'}」に更新しました\`, 'success');
          } else {
            throw new Error('更新に失敗しました');
          }
        } catch (error) {
          console.error('Status update error:', error);
          showToast('ステータスの更新に失敗しました', 'error');
        }
      }

      // ニュース削除
      async function deleteNews(id) {
        if (!confirm('このニュースを削除しますか？')) return;

        try {
          const response = await fetch(\`/admin/api/ai-news/\${id}\`, {
            method: 'DELETE'
          });

          if (response.ok) {
            allNews = allNews.filter(n => n.id !== id);
            renderNewsList();
            showToast('ニュースを削除しました', 'success');
          } else {
            throw new Error('削除に失敗しました');
          }
        } catch (error) {
          console.error('Delete error:', error);
          showToast('削除に失敗しました', 'error');
        }
      }

      // 収集実行
      async function triggerCollection() {
        const btn = document.getElementById('collectBtn');
        const originalText = btn.innerHTML;
        
        if (!confirm('AIニュースの収集を実行しますか？\\n（厳格フィルタ版: 数分かかる場合があります）')) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>収集中...';

        try {
          const response = await fetch('/admin/api/ai-news/collect', {
            method: 'POST'
          });

          const result = await response.json();
          
          if (response.ok) {
            showToast(\`収集完了！ 取得:\${result.collected}件 / 保存:\${result.saved}件 / フィルタ除外:\${result.filtered}件\`, 'success');
            setTimeout(() => location.reload(), 1500);
          } else {
            throw new Error(result.error || '収集に失敗しました');
          }
        } catch (error) {
          console.error('Collection error:', error);
          showToast('収集に失敗しました: ' + error.message, 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalText;
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

      // 一括操作バー表示
      function showBulkActionBar() {
        document.getElementById('bulkActionBar').classList.remove('hidden');
      }

      // 選択状態更新
      function updateSelection() {
        selectedIds = new Set();
        document.querySelectorAll('.news-checkbox:checked').forEach(cb => {
          selectedIds.add(parseInt(cb.dataset.id));
        });
        
        const count = selectedIds.size;
        document.getElementById('selectedCount').textContent = \`(\${count}件選択中)\`;
        
        // ボタンの有効/無効
        const hasSelection = count > 0;
        document.getElementById('bulkApproveBtn').disabled = !hasSelection;
        document.getElementById('bulkRejectBtn').disabled = !hasSelection;
        document.getElementById('bulkPendingBtn').disabled = !hasSelection;
        document.getElementById('bulkDeleteBtn').disabled = !hasSelection;
        
        // 全選択チェックボックスの状態
        const allCheckboxes = document.querySelectorAll('.news-checkbox');
        const allChecked = allCheckboxes.length > 0 && count === allCheckboxes.length;
        document.getElementById('selectAll').checked = allChecked;
        document.getElementById('selectAll').indeterminate = count > 0 && !allChecked;
      }

      // 全選択/解除
      function toggleSelectAll() {
        const selectAll = document.getElementById('selectAll').checked;
        document.querySelectorAll('.news-checkbox').forEach(cb => {
          cb.checked = selectAll;
        });
        updateSelection();
      }

      // 一括ステータス変更
      async function bulkAction(status) {
        const count = selectedIds.size;
        const statusLabel = status === 'approved' ? '承認' : status === 'rejected' ? '却下' : '保留';
        
        if (!confirm(\`選択した\${count}件のニュースを「\${statusLabel}」に変更しますか？\`)) return;

        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
          try {
            const response = await fetch(\`/admin/api/ai-news/\${id}\`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
            });

            if (response.ok) {
              const newsItem = allNews.find(n => n.id === id);
              if (newsItem) newsItem.status = status;
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        selectedIds.clear();
        renderNewsList();
        updateSelection();

        if (errorCount === 0) {
          showToast(\`\${successCount}件を「\${statusLabel}」に変更しました\`, 'success');
        } else {
          showToast(\`\${successCount}件成功、\${errorCount}件失敗\`, errorCount > 0 ? 'error' : 'success');
        }
      }

      // 一括削除
      async function bulkDelete() {
        const count = selectedIds.size;
        
        if (!confirm(\`選択した\${count}件のニュースを削除しますか？\\nこの操作は元に戻せません。\`)) return;

        let successCount = 0;
        let errorCount = 0;

        for (const id of selectedIds) {
          try {
            const response = await fetch(\`/admin/api/ai-news/\${id}\`, {
              method: 'DELETE'
            });

            if (response.ok) {
              allNews = allNews.filter(n => n.id !== id);
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }

        selectedIds.clear();
        renderNewsList();
        updateSelection();

        if (errorCount === 0) {
          showToast(\`\${successCount}件を削除しました\`, 'success');
        } else {
          showToast(\`\${successCount}件削除成功、\${errorCount}件失敗\`, errorCount > 0 ? 'error' : 'success');
        }
      }
    </script>
  `;

  return renderAdminLayout('AIニュース管理', content, 'ai-news');
};
