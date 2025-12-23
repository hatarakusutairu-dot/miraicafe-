/**
 * AIニュース管理画面
 */

import { renderAdminLayout } from './layout'

// AIニュースの型定義
export interface AINews {
  id: number
  title: string
  url: string
  summary: string | null
  source: string | null
  published_at: string | null
  status: 'pending' | 'approved' | 'rejected'
  ai_relevance_score: number | null
  created_at: string
  updated_at: string | null
}

/**
 * AIニュース一覧ページ
 */
export const renderAINewsList = (news: AINews[], counts: { all: number; pending: number; approved: number; rejected: number }) => {
  const content = `
    <div class="space-y-6">
      <!-- ヘッダー -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-robot mr-2 text-blue-500"></i>AIニュース管理
          </h1>
          <p class="text-gray-600 mt-1">RSS/APIからAI関連ニュースを自動収集・管理します</p>
        </div>
        <button onclick="triggerCollection()" id="collectBtn" class="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition flex items-center gap-2 font-medium">
          <i class="fas fa-bolt"></i>今すぐ収集実行
        </button>
      </div>

      <!-- 統計カード -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-gray-400">
          <div class="text-2xl font-bold text-gray-800">${counts.all}</div>
          <div class="text-sm text-gray-500">全て</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-yellow-400">
          <div class="text-2xl font-bold text-yellow-600">${counts.pending}</div>
          <div class="text-sm text-gray-500">新規（未承認）</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-green-400">
          <div class="text-2xl font-bold text-green-600">${counts.approved}</div>
          <div class="text-sm text-gray-500">承認済み</div>
        </div>
        <div class="bg-white rounded-lg p-4 shadow border-l-4 border-red-400">
          <div class="text-2xl font-bold text-red-600">${counts.rejected}</div>
          <div class="text-sm text-gray-500">却下</div>
        </div>
      </div>

      <!-- フィルタータブ -->
      <div class="bg-white rounded-lg shadow">
        <div class="border-b flex overflow-x-auto">
          <button onclick="filterNews('all')" data-status="all" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-blue-600 hover:border-blue-300 transition whitespace-nowrap active">
            全て (${counts.all})
          </button>
          <button onclick="filterNews('pending')" data-status="pending" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-yellow-600 hover:border-yellow-300 transition whitespace-nowrap">
            <i class="fas fa-clock mr-1"></i>新規 (${counts.pending})
          </button>
          <button onclick="filterNews('approved')" data-status="approved" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-green-600 hover:border-green-300 transition whitespace-nowrap">
            <i class="fas fa-check mr-1"></i>承認済み (${counts.approved})
          </button>
          <button onclick="filterNews('rejected')" data-status="rejected" class="tab-filter px-6 py-3 text-sm font-medium border-b-2 border-transparent hover:text-red-600 hover:border-red-300 transition whitespace-nowrap">
            <i class="fas fa-times mr-1"></i>却下 (${counts.rejected})
          </button>
        </div>

        <!-- ニュース一覧 -->
        <div id="newsList" class="divide-y">
          ${news.length === 0 ? `
            <div class="p-12 text-center text-gray-500">
              <i class="fas fa-inbox text-4xl mb-4"></i>
              <p>ニュースがありません</p>
              <p class="text-sm mt-2">「今すぐ収集実行」ボタンでニュースを収集してください</p>
            </div>
          ` : news.map(item => renderNewsItem(item)).join('')}
        </div>
      </div>
    </div>

    <script>
      let currentFilter = 'all';
      let allNews = ${JSON.stringify(news)};

      // フィルター切り替え
      function filterNews(status) {
        currentFilter = status;
        
        // タブのアクティブ状態を更新
        document.querySelectorAll('.tab-filter').forEach(tab => {
          const isActive = tab.dataset.status === status;
          tab.classList.toggle('active', isActive);
          tab.classList.toggle('border-blue-500', isActive);
          tab.classList.toggle('text-blue-600', isActive);
          tab.classList.toggle('border-transparent', !isActive);
        });

        // ニュース表示を更新
        renderNewsList();
      }

      // ニュース一覧を描画
      function renderNewsList() {
        const filtered = currentFilter === 'all' 
          ? allNews 
          : allNews.filter(n => n.status === currentFilter);

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
          <div class="p-4 hover:bg-gray-50 transition" id="news-\${item.id}">
            <div class="flex flex-col md:flex-row md:items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  \${getStatusBadge(item.status)}
                  <span class="text-xs text-gray-500">
                    <i class="fas fa-chart-line mr-1"></i>AI関連度: \${item.ai_relevance_score ? Math.round(item.ai_relevance_score * 100) : 50}%
                  </span>
                </div>
                <h3 class="font-medium text-gray-800 mb-1">\${escapeHtml(item.title)}</h3>
                <p class="text-sm text-gray-600 mb-2">\${escapeHtml(item.summary || '')}</p>
                <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span><i class="fas fa-newspaper mr-1"></i>\${escapeHtml(item.source || '不明')}</span>
                  <span><i class="fas fa-calendar mr-1"></i>\${formatDate(item.published_at)}</span>
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
            // ローカルデータを更新
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
        
        if (!confirm('AIニュースの収集を実行しますか？\\n（数分かかる場合があります）')) return;

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>収集中...';

        try {
          const response = await fetch('/admin/api/ai-news/collect', {
            method: 'POST'
          });

          const result = await response.json();
          
          if (response.ok) {
            showToast(\`収集完了！ 取得:\${result.collected}件 / 保存:\${result.saved}件\`, 'success');
            // ページをリロードして最新データを表示
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
        }, 3000);
      }

      // 初期表示時にアクティブタブを設定
      document.querySelector('.tab-filter[data-status="all"]').classList.add('border-blue-500', 'text-blue-600');
    </script>
  `;

  return renderAdminLayout('AIニュース管理', content, 'ai-news');
};

/**
 * 単一ニュースアイテムのHTML
 */
function renderNewsItem(item: AINews): string {
  const statusBadges: Record<string, string> = {
    pending: '<span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"><i class="fas fa-clock mr-1"></i>新規</span>',
    approved: '<span class="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium"><i class="fas fa-check mr-1"></i>承認済み</span>',
    rejected: '<span class="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium"><i class="fas fa-times mr-1"></i>却下</span>',
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '不明';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const escapeHtml = (text: string | null) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  return `
    <div class="p-4 hover:bg-gray-50 transition" id="news-${item.id}">
      <div class="flex flex-col md:flex-row md:items-start gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            ${statusBadges[item.status] || ''}
            <span class="text-xs text-gray-500">
              <i class="fas fa-chart-line mr-1"></i>AI関連度: ${item.ai_relevance_score ? Math.round(item.ai_relevance_score * 100) : 50}%
            </span>
          </div>
          <h3 class="font-medium text-gray-800 mb-1">${escapeHtml(item.title)}</h3>
          <p class="text-sm text-gray-600 mb-2">${escapeHtml(item.summary)}</p>
          <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span><i class="fas fa-newspaper mr-1"></i>${escapeHtml(item.source)}</span>
            <span><i class="fas fa-calendar mr-1"></i>${formatDate(item.published_at)}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <a href="${item.url}" target="_blank" class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition">
            <i class="fas fa-external-link-alt mr-1"></i>記事を見る
          </a>
          ${item.status === 'pending' ? `
            <button onclick="updateStatus(${item.id}, 'approved')" class="px-3 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition">
              <i class="fas fa-check mr-1"></i>承認
            </button>
            <button onclick="updateStatus(${item.id}, 'rejected')" class="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition">
              <i class="fas fa-times mr-1"></i>却下
            </button>
          ` : `
            <button onclick="updateStatus(${item.id}, 'pending')" class="px-3 py-1.5 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition">
              <i class="fas fa-undo mr-1"></i>保留に戻す
            </button>
          `}
          <button onclick="deleteNews(${item.id})" class="px-3 py-1.5 bg-gray-200 text-gray-600 rounded text-sm hover:bg-gray-300 transition">
            <i class="fas fa-trash mr-1"></i>削除
          </button>
        </div>
      </div>
    </div>
  `;
}
