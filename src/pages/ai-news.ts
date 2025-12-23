/**
 * AIニュース一覧ページ
 */

import { renderLayout } from '../components/layout'

interface AINewsItem {
  id: number
  title: string
  url: string
  summary: string | null
  source: string | null
  published_at: string | null
  category: string | null
  original_language: string | null
  is_translated: number | null
  image_url: string | null
  image_source: string | null
}

export const renderAINewsPage = (news: AINewsItem[]) => {
  const content = `
    <!-- Hero Section -->
    <section class="pt-24 pb-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div class="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      <div class="max-w-6xl mx-auto px-4 relative z-10">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4">
            <i class="fas fa-robot"></i>
            <span>AI業界の最新情報をお届け</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-4">
            最新AIニュース
          </h1>
          <p class="text-xl text-white/80 max-w-2xl mx-auto">
            ChatGPT、Gemini、Claudeなど主要AIツールの公式発表やアップデート情報を厳選してお届けします
          </p>
        </div>
      </div>
    </section>

    <!-- 注意書き -->
    <div class="bg-amber-50 border-b border-amber-200">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="flex items-center gap-2 text-amber-700 text-sm">
          <i class="fas fa-external-link-alt"></i>
          <span><strong>ご注意:</strong> 各ニュースは外部サイトの記事へリンクしています。リンク先のコンテンツはmirAIcafeが管理するものではありません。</span>
        </div>
      </div>
    </div>

    <!-- フィルター -->
    <section class="py-6 bg-white border-b sticky top-16 z-30">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm text-gray-500 font-medium">カテゴリ:</span>
          <button onclick="filterByCategory('all')" data-category="all" class="cat-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-800 text-white transition">
            すべて
          </button>
          <button onclick="filterByCategory('official_announcement')" data-category="official_announcement" class="cat-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700 transition">
            <i class="fas fa-bullhorn mr-1"></i>公式発表
          </button>
          <button onclick="filterByCategory('tool_update')" data-category="tool_update" class="cat-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition">
            <i class="fas fa-sync-alt mr-1"></i>ツール更新
          </button>
          <button onclick="filterByCategory('how_to')" data-category="how_to" class="cat-btn px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 transition">
            <i class="fas fa-book mr-1"></i>使い方
          </button>
        </div>
      </div>
    </section>

    <!-- ニュース一覧 -->
    <section class="py-12 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4">
        <div id="newsGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${news.length === 0 ? `
            <div class="col-span-full text-center py-16">
              <i class="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500 text-lg">現在、公開中のニュースはありません</p>
              <p class="text-gray-400 text-sm mt-2">近日公開予定です。お楽しみに！</p>
            </div>
          ` : ''}
        </div>
        
        <!-- もっと読み込むボタン -->
        <div id="loadMoreContainer" class="text-center mt-8 hidden">
          <button onclick="loadMore()" id="loadMoreBtn" class="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition">
            <i class="fas fa-plus mr-2"></i>もっと読み込む
          </button>
        </div>
      </div>
    </section>

    <style>
      .cat-btn.active {
        background-color: #1f2937 !important;
        color: white !important;
      }
      .cat-btn[data-category="official_announcement"].active {
        background-color: #DC2626 !important;
      }
      .cat-btn[data-category="tool_update"].active {
        background-color: #2563EB !important;
      }
      .cat-btn[data-category="how_to"].active {
        background-color: #16A34A !important;
      }
    </style>

    <script>
      let allNews = ${JSON.stringify(news)};
      let currentCategory = 'all';
      let displayCount = 12;

      // 初期表示
      renderNews();

      // カテゴリフィルター
      function filterByCategory(category) {
        currentCategory = category;
        displayCount = 12;
        
        document.querySelectorAll('.cat-btn').forEach(btn => {
          btn.classList.remove('active');
          if (btn.dataset.category === category) {
            btn.classList.add('active');
          }
        });
        
        renderNews();
      }

      // ニュース描画
      function renderNews() {
        let filtered = allNews;
        
        if (currentCategory !== 'all') {
          filtered = filtered.filter(n => n.category === currentCategory);
        }
        
        const toShow = filtered.slice(0, displayCount);
        const hasMore = filtered.length > displayCount;
        
        const grid = document.getElementById('newsGrid');
        
        if (toShow.length === 0) {
          grid.innerHTML = \`
            <div class="col-span-full text-center py-16">
              <i class="fas fa-filter text-6xl text-gray-300 mb-4"></i>
              <p class="text-gray-500 text-lg">該当するニュースがありません</p>
            </div>
          \`;
          document.getElementById('loadMoreContainer').classList.add('hidden');
          return;
        }
        
        grid.innerHTML = toShow.map(item => \`
          <a href="\${item.url}" target="_blank" rel="noopener noreferrer"
             class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
            <div class="relative h-44 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
              \${item.image_url ? \`
                <img 
                  src="\${item.image_url}" 
                  alt="\${escapeHtml(item.title)}"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                />
                <div class="absolute inset-0 hidden items-center justify-center \${getCategoryGradient(item.category)}">
                  <span class="text-4xl">\${getCategoryIcon(item.category)}</span>
                </div>
              \` : \`
                <div class="w-full h-full flex items-center justify-center \${getCategoryGradient(item.category)}">
                  <span class="text-4xl">\${getCategoryIcon(item.category)}</span>
                </div>
              \`}
              <div class="absolute top-3 left-3 flex gap-2">
                <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full shadow-sm \${getCategoryBadgeColor(item.category)}">
                  \${getCategoryLabel(item.category)}
                </span>
                \${item.is_translated ? '<span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full shadow-sm">翻訳</span>' : ''}
              </div>
              <div class="absolute top-3 right-3">
                <span class="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                  <i class="fas fa-external-link-alt mr-1"></i>外部サイト
                </span>
              </div>
            </div>
            <div class="p-5">
              <div class="flex items-center gap-2 mb-2 text-xs text-gray-500">
                <span><i class="fas fa-newspaper mr-1"></i>\${escapeHtml(item.source || '不明')}</span>
                <span>•</span>
                <span>\${formatDate(item.published_at)}</span>
              </div>
              <h3 class="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition mb-2">
                \${escapeHtml(item.title)}
              </h3>
              <p class="text-sm text-gray-600 line-clamp-2">\${escapeHtml(item.summary || '')}</p>
              <div class="mt-3 text-sm text-blue-500 font-medium group-hover:text-blue-600">
                記事を読む <i class="fas fa-arrow-right ml-1 transition-transform group-hover:translate-x-1"></i>
              </div>
            </div>
          </a>
        \`).join('');
        
        // もっと読み込むボタン
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (hasMore) {
          loadMoreContainer.classList.remove('hidden');
        } else {
          loadMoreContainer.classList.add('hidden');
        }
      }

      // もっと読み込む
      function loadMore() {
        displayCount += 12;
        renderNews();
      }

      // ヘルパー関数
      function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
          const date = new Date(dateStr);
          const now = new Date();
          const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
          if (diffDays === 0) return '今日';
          if (diffDays === 1) return '昨日';
          if (diffDays < 7) return diffDays + '日前';
          return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
        } catch {
          return '';
        }
      }

      function getCategoryLabel(category) {
        const labels = {
          'official_announcement': '公式発表',
          'tool_update': 'ツール更新',
          'how_to': '使い方',
          'other': 'その他'
        };
        return labels[category] || 'AI';
      }

      function getCategoryIcon(category) {
        const icons = {
          'official_announcement': '📢',
          'tool_update': '🔧',
          'how_to': '📚',
          'other': '📰'
        };
        return icons[category] || '📰';
      }

      function getCategoryBadgeColor(category) {
        const colors = {
          'official_announcement': 'bg-red-100 text-red-700',
          'tool_update': 'bg-blue-100 text-blue-700',
          'how_to': 'bg-green-100 text-green-700',
          'other': 'bg-gray-100 text-gray-700'
        };
        return colors[category] || 'bg-blue-100 text-blue-600';
      }

      function getCategoryGradient(category) {
        const gradients = {
          'official_announcement': 'bg-gradient-to-br from-red-500 to-purple-600',
          'tool_update': 'bg-gradient-to-br from-blue-500 to-cyan-600',
          'how_to': 'bg-gradient-to-br from-green-500 to-emerald-600',
          'other': 'bg-gradient-to-br from-gray-400 to-gray-600'
        };
        return gradients[category] || 'bg-gradient-to-br from-blue-400 to-purple-500';
      }
    </script>
  `

  return renderLayout('最新AIニュース', content, 'ai-news')
}
