/**
 * AIニュース一覧ページ（軽量版）
 * - データはAPIから非同期読み込み
 * - アニメーション最小化
 */

import { renderLayout } from '../components/layout'

export const renderAINewsPage = (initialNews: any[] = []) => {
  const content = `
    <!-- Hero Section (軽量化) -->
    <section class="pt-24 pb-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
      <div class="max-w-6xl mx-auto px-4">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm mb-4">
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
    <section class="py-4 bg-white border-b sticky top-16 z-30">
      <div class="max-w-6xl mx-auto px-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-500 font-medium">カテゴリ:</span>
          <button onclick="filterByCategory('all')" data-category="all" class="cat-btn active px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-white">
            すべて
          </button>
          <button onclick="filterByCategory('official_announcement')" data-category="official_announcement" class="cat-btn px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            <i class="fas fa-bullhorn mr-1"></i>公式発表
          </button>
          <button onclick="filterByCategory('tool_update')" data-category="tool_update" class="cat-btn px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            <i class="fas fa-sync-alt mr-1"></i>ツール更新
          </button>
          <button onclick="filterByCategory('how_to')" data-category="how_to" class="cat-btn px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            <i class="fas fa-book mr-1"></i>使い方
          </button>
        </div>
      </div>
    </section>

    <!-- ニュース一覧 -->
    <section class="py-8 bg-gray-50 min-h-screen">
      <div class="max-w-6xl mx-auto px-4">
        <div id="newsGrid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div class="col-span-full text-center py-16">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-500">読み込み中...</p>
          </div>
        </div>
        
        <div id="loadMoreContainer" class="text-center mt-8 hidden">
          <button onclick="loadMore()" id="loadMoreBtn" class="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600">
            <i class="fas fa-plus mr-2"></i>もっと読み込む
          </button>
        </div>
      </div>
    </section>

    <style>
      /* カスタムカーソル - ミオン (動的に設定) */
      .custom-cursor { cursor: var(--mion-cursor, auto); }
      .custom-cursor-pointer { cursor: var(--mion-cursor-pointer, pointer); }
      
      .cat-btn.active { background-color: #1f2937 !important; color: white !important; }
      .cat-btn[data-category="official_announcement"].active { background-color: #DC2626 !important; }
      .cat-btn[data-category="tool_update"].active { background-color: #2563EB !important; }
      .cat-btn[data-category="how_to"].active { background-color: #16A34A !important; }
      .news-card { transition: transform 0.2s, box-shadow 0.2s; }
      .news-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
    </style>

    <script>
      let allNews = [];
      let currentCategory = 'all';
      let displayCount = 12;
      let isLoading = false;

      // カスタムカーソル設定
      async function setupCustomCursor() {
        const cursorUrl = 'https://www.genspark.ai/api/files/s/hgBLGFnl';
        try {
          const res = await fetch(cursorUrl);
          const blob = await res.blob();
          const reader = new FileReader();
          reader.onload = function() {
            const base64 = reader.result;
            document.documentElement.style.setProperty('--mion-cursor', 'url(' + base64 + '), auto');
            document.documentElement.style.setProperty('--mion-cursor-pointer', 'url(' + base64 + '), pointer');
            document.body.classList.add('custom-cursor');
            document.querySelectorAll('a, button, [onclick], input, select, textarea, label').forEach(el => {
              el.classList.add('custom-cursor-pointer');
            });
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          console.log('カーソル画像読み込みスキップ');
        }
      }

      // ページ読み込み時にAPIからデータ取得
      document.addEventListener('DOMContentLoaded', async () => {
        setupCustomCursor();
        await fetchNews();
      });

      async function fetchNews() {
        if (isLoading) return;
        isLoading = true;
        
        try {
          const res = await fetch('/api/ai-news?limit=100&status=approved');
          allNews = await res.json();
          renderNews();
        } catch (e) {
          document.getElementById('newsGrid').innerHTML = 
            '<div class="col-span-full text-center py-16 text-red-500"><i class="fas fa-exclamation-circle text-4xl mb-4"></i><p>読み込みに失敗しました</p></div>';
        } finally {
          isLoading = false;
        }
      }

      function filterByCategory(cat) {
        currentCategory = cat;
        displayCount = 12;
        document.querySelectorAll('.cat-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.category === cat);
        });
        renderNews();
      }

      function renderNews() {
        let filtered = currentCategory === 'all' ? allNews : allNews.filter(n => n.category === currentCategory);
        const toShow = filtered.slice(0, displayCount);
        const grid = document.getElementById('newsGrid');
        
        if (toShow.length === 0) {
          grid.innerHTML = '<div class="col-span-full text-center py-16"><i class="fas fa-inbox text-5xl text-gray-300 mb-4"></i><p class="text-gray-500">該当するニュースがありません</p></div>';
          document.getElementById('loadMoreContainer').classList.add('hidden');
          return;
        }
        
        grid.innerHTML = toShow.map(item => \`
          <a href="\${item.url}" target="_blank" rel="noopener noreferrer" class="news-card bg-white rounded-xl shadow-md overflow-hidden block">
            <div class="relative h-40 bg-gray-200">
              \${item.image_url ? \`<img src="\${item.image_url}" alt="" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none'">\` : ''}
              <div class="absolute top-2 left-2 flex gap-1">
                <span class="px-2 py-1 text-xs font-medium rounded-full \${getCatColor(item.category)}">\${getCatLabel(item.category)}</span>
              </div>
              <div class="absolute top-2 right-2">
                <span class="px-2 py-1 bg-black/60 text-white text-xs rounded-full"><i class="fas fa-external-link-alt mr-1"></i>外部</span>
              </div>
            </div>
            <div class="p-4">
              <div class="text-xs text-gray-500 mb-2">
                <span>\${item.source || ''}</span>
                <span class="mx-1">•</span>
                <span>\${fmtDate(item.published_at)}</span>
              </div>
              <h3 class="font-bold text-gray-800 text-sm line-clamp-2 mb-2">\${esc(item.title)}</h3>
              <p class="text-xs text-gray-600 line-clamp-2">\${esc(item.summary || '')}</p>
            </div>
          </a>
        \`).join('');
        
        document.getElementById('loadMoreContainer').classList.toggle('hidden', filtered.length <= displayCount);
      }

      function loadMore() {
        displayCount += 12;
        renderNews();
      }

      function esc(t) { 
        if (!t) return ''; 
        return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); 
      }
      
      function fmtDate(d) {
        if (!d) return '';
        try {
          const dt = new Date(d);
          const now = new Date();
          const diff = Math.floor((now - dt) / 86400000);
          if (diff === 0) return '今日';
          if (diff === 1) return '昨日';
          if (diff < 7) return diff + '日前';
          return (dt.getMonth()+1) + '/' + dt.getDate();
        } catch { return ''; }
      }
      
      function getCatLabel(c) {
        return {official_announcement:'公式発表',tool_update:'ツール更新',how_to:'使い方'}[c] || 'AI';
      }
      
      function getCatColor(c) {
        return {
          official_announcement:'bg-red-100 text-red-700',
          tool_update:'bg-blue-100 text-blue-700',
          how_to:'bg-green-100 text-green-700'
        }[c] || 'bg-gray-100 text-gray-700';
      }
    </script>
  `

  return renderLayout('最新AIニュース', content, 'ai-news')
}
