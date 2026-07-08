import { renderLayout } from '../components/layout'
import { BlogPost, blogCategories, BlogCategory } from '../data'

// 動画URLからプレビューHTMLを生成
function getVideoEmbedHtml(url: string): string {
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
  return `<video src="${url}" class="w-full h-full object-contain" controls preload="metadata" playsinline></video>`
}

// カテゴリの色を取得するヘルパー関数
const getCategoryColor = (categoryName: string): { color: string; bgColor: string } => {
  const found = blogCategories.find(c => c.name === categoryName)
  return found || { color: 'text-gray-600', bgColor: 'bg-gray-100' }
}

// すべてのタグを抽出してカウント
const getAllTags = (posts: BlogPost[]): { name: string; count: number }[] => {
  const tagCount: Record<string, number> = {}
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

// カテゴリごとの記事数をカウント
const getCategoryCounts = (posts: BlogPost[]): Record<string, number> => {
  const counts: Record<string, number> = {}
  posts.forEach(post => {
    counts[post.category] = (counts[post.category] || 0) + 1
  })
  return counts
}

export const renderBlogPage = (posts: BlogPost[]) => {
  const allTags = getAllTags(posts)
  const categoryCounts = getCategoryCounts(posts)
  
  const content = `
    <!-- Page Header -->
    <section class="relative py-16 overflow-hidden">
      <div class="absolute inset-0 gradient-ai-light"></div>
      <div class="absolute inset-0">
        <div class="orb orb-1 opacity-30"></div>
        <div class="orb orb-2 opacity-20"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center gradient-ai text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas fa-newspaper mr-2"></i>BLOG
        </span>
        <h1 class="text-4xl md:text-3xl sm:text-4xl md:text-5xl font-bold text-future-text mb-3 sm:mb-4">AI学習ブログ</h1>
        <p class="text-future-textLight text-base sm:text-lg max-w-xl mx-auto">
          最新のAI情報、学習のコツ、活用事例をお届けします
        </p>
      </div>
    </section>

    <!-- Blog Content -->
    <section class="py-10 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Mobile Filter Toggle -->
        <div class="lg:hidden mb-4">
          <button id="filter-toggle" class="w-full flex items-center justify-between glass rounded-xl p-4 border border-white/50">
            <span class="flex items-center text-future-text font-medium">
              <i class="fas fa-filter mr-2 text-ai-blue"></i>カテゴリ・タグで絞り込み
            </span>
            <i class="fas fa-chevron-down text-ai-blue transition-transform" id="filter-icon"></i>
          </button>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Sidebar (カテゴリ・タグ) -->
          <aside class="w-full lg:w-72 shrink-0">
            <div id="filter-sidebar" class="hidden lg:block space-y-6">
              
              <!-- カテゴリ一覧 -->
              <div class="glass rounded-2xl p-5 border border-white/50">
                <h3 class="text-lg font-bold text-future-text mb-4 flex items-center">
                  <i class="fas fa-folder mr-2 text-ai-blue"></i>カテゴリ
                </h3>
                <div class="space-y-2">
                  <a href="/blog" 
                     class="category-link flex items-center justify-between p-3 rounded-xl transition-all hover:bg-ai-blue/10 cursor-pointer ${!posts.length ? 'bg-ai-blue/10' : ''}"
                     data-category="all">
                    <span class="text-future-text font-medium">すべて</span>
                    <span class="text-sm text-future-textLight bg-gray-100 px-2 py-1 rounded-full">${posts.length}</span>
                  </a>
                  ${blogCategories.map(cat => `
                    <a href="/blog?category=${encodeURIComponent(cat.name)}" 
                       class="category-link flex items-center justify-between p-3 rounded-xl transition-all hover:bg-ai-blue/10 cursor-pointer"
                       data-category="${cat.name}">
                      <span class="flex items-center">
                        <span class="w-3 h-3 rounded-full ${cat.bgColor} mr-2"></span>
                        <span class="text-future-text">${cat.name}</span>
                      </span>
                      <span class="text-sm text-future-textLight bg-gray-100 px-2 py-1 rounded-full">${categoryCounts[cat.name] || 0}</span>
                    </a>
                  `).join('')}
                </div>
              </div>

              <!-- タグクラウド -->
              <div class="rounded-2xl p-5 border" style="background: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.5);">
                <h3 class="text-lg font-bold mb-4 flex items-center" style="color: #1E293B;">
                  <i class="fas fa-tags mr-2" style="color: #B8956A;"></i>タグ
                </h3>
                <div class="flex flex-wrap gap-2">
                  ${allTags.map(tag => `
                    <a href="/blog?tag=${encodeURIComponent(tag.name)}" 
                       class="tag-link inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer"
                       data-tag="${tag.name}"
                       style="background: rgba(107, 155, 98, 0.1); color: #6B9B62;">
                      #${tag.name}
                      <span class="ml-1 text-xs opacity-70">${tag.count}</span>
                    </a>
                  `).join('')}
                </div>
              </div>

              <!-- 現在のフィルター表示 -->
              <div id="current-filter" class="hidden glass rounded-2xl p-4 border border-ai-blue/30">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-future-textLight">フィルター中:</span>
                  <button id="clear-filter" class="text-sm text-ai-blue hover:text-ai-purple transition-colors">
                    <i class="fas fa-times mr-1"></i>クリア
                  </button>
                </div>
                <div id="filter-badges" class="flex flex-wrap gap-2 mt-2"></div>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <div class="flex-1 min-w-0">
            
            <!-- 検索結果カウント -->
            <div class="flex items-center justify-between mb-6">
              <p class="text-future-textLight">
                <span id="result-count">${posts.length}</span>件の記事
              </p>
            </div>

            <!-- Featured Post (最初の記事) -->
            ${posts.length > 0 ? `
              <div id="featured-post" data-category="${posts[0].category}" data-tags="${posts[0].tags?.join(',') || ''}">
                <a href="/blog/${posts[0].id}" class="card-hover block bg-white overflow-hidden shadow-lg border border-future-sky/50 mb-8 rounded-2xl blog-card" data-category="${posts[0].category}" data-tags="${posts[0].tags?.join(',') || ''}">
                  <div class="grid grid-cols-1 md:grid-cols-2">
                    <div class="aspect-video md:aspect-auto md:h-64 overflow-hidden">
                      <img loading="lazy" decoding="async" src="${posts[0].image}" alt="${posts[0].title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700">
                    </div>
                    <div class="p-6 flex flex-col justify-center">
                      <div class="flex flex-wrap items-center gap-2 text-sm mb-3">
                        <span class="${getCategoryColor(posts[0].category).bgColor} ${getCategoryColor(posts[0].category).color} font-medium px-3 py-1 rounded-full">${posts[0].category}</span>
                        <span class="text-future-textLight"><i class="fas fa-clock mr-1 text-ai-blue"></i>${posts[0].readTime}</span>
                        <span class="text-future-textLight"><i class="fas fa-calendar mr-1 text-ai-purple"></i>${posts[0].date}</span>
                      </div>
                      <h2 class="text-xl md:text-2xl font-bold text-future-text mb-2 line-clamp-2">${posts[0].title}</h2>
                      <p class="text-future-textLight text-sm mb-3 line-clamp-2">${posts[0].excerpt}</p>
                      <div class="flex flex-wrap gap-1 mb-3">
                        ${(posts[0].tags || []).slice(0, 3).map(tag => `
                          <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#${tag}</span>
                        `).join('')}
                      </div>
                      <div class="flex items-center">
                        <div class="w-8 h-8 gradient-ai rounded-full flex items-center justify-center mr-2 shadow">
                          <i class="fas fa-user text-white text-xs"></i>
                        </div>
                        <span class="text-future-text text-sm font-medium">${posts[0].author}</span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ` : ''}

            <!-- Posts Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="blog-grid">
              ${posts.slice(1).map(post => `
                <a href="/blog/${post.id}" class="card-hover bg-white overflow-hidden shadow-lg border border-future-sky/50 block blog-card rounded-2xl" data-category="${post.category}" data-tags="${post.tags?.join(',') || ''}">
                  <div class="aspect-video overflow-hidden">
                    <img loading="lazy" decoding="async" src="${post.image}" alt="${post.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
                  </div>
                  <div class="p-5">
                    <div class="flex flex-wrap items-center gap-2 text-sm mb-2">
                      <span class="${getCategoryColor(post.category).bgColor} ${getCategoryColor(post.category).color} font-medium px-2 py-1 rounded text-xs">${post.category}</span>
                      <span class="text-future-textLight text-xs"><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
                    </div>
                    <h3 class="text-lg font-bold text-future-text mb-2 line-clamp-2">${post.title}</h3>
                    <p class="text-future-textLight text-sm line-clamp-2 mb-3">${post.excerpt}</p>
                    <div class="flex flex-wrap gap-1 mb-3">
                      ${(post.tags || []).slice(0, 3).map(tag => `
                        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#${tag}</span>
                      `).join('')}
                    </div>
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center text-future-textLight">
                        <div class="w-6 h-6 gradient-ai rounded-full flex items-center justify-center mr-2">
                          <i class="fas fa-user text-white text-xs"></i>
                        </div>
                        ${post.author}
                      </div>
                      <span class="text-future-textLight text-xs">${post.date}</span>
                    </div>
                  </div>
                </a>
              `).join('')}
            </div>

            <!-- No Results Message -->
            <div id="no-results" class="hidden text-center py-12">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-search text-gray-400 text-2xl"></i>
              </div>
              <p class="text-future-textLight text-lg mb-4">該当する記事が見つかりませんでした</p>
              <button id="reset-filter-btn" class="text-ai-blue hover:text-ai-purple font-medium transition-colors">
                <i class="fas fa-undo mr-2"></i>フィルターをリセット
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-10 bg-white">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl p-8 border" style="background: rgba(255,255,255,0.9); border-color: rgba(107, 155, 98, 0.2);">
          <div class="text-center">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg pulse-glow" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
              <i class="fas fa-envelope text-white text-xl"></i>
            </div>
            <h2 class="text-xl font-bold mb-2" style="color: #1E293B;">最新情報をお届け</h2>
            <p class="text-sm mb-4" style="color: #64748B;">メールマガジンに登録して、AI学習の最新情報を受け取りましょう</p>
            <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="メールアドレス" class="flex-1 p-3 border-2 rounded-xl focus:outline-none transition-colors bg-white text-sm" style="border-color: #E2E8F0;">
              <button type="submit" class="btn-ai text-white px-5 py-3 rounded-xl font-medium shadow-lg text-sm" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
                登録する
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <script>
      (function() {
        // 状態管理
        const state = {
          category: null,
          tag: null
        };

        // DOM要素
        const filterToggle = document.getElementById('filter-toggle');
        const filterSidebar = document.getElementById('filter-sidebar');
        const filterIcon = document.getElementById('filter-icon');
        const blogGrid = document.getElementById('blog-grid');
        const featuredPost = document.getElementById('featured-post');
        const resultCount = document.getElementById('result-count');
        const currentFilter = document.getElementById('current-filter');
        const filterBadges = document.getElementById('filter-badges');
        const noResults = document.getElementById('no-results');
        const clearFilterBtn = document.getElementById('clear-filter');
        const resetFilterBtn = document.getElementById('reset-filter-btn');

        // URLパラメータから初期状態を取得
        const urlParams = new URLSearchParams(window.location.search);
        state.category = urlParams.get('category');
        state.tag = urlParams.get('tag');

        // モバイルフィルタートグル
        if (filterToggle) {
          filterToggle.addEventListener('click', () => {
            filterSidebar.classList.toggle('hidden');
            filterIcon.classList.toggle('rotate-180');
          });
        }

        // カテゴリリンククリック
        document.querySelectorAll('.category-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;
            state.category = category === 'all' ? null : category;
            state.tag = null; // カテゴリ選択時はタグをクリア
            updateURL();
            applyFilters();
            updateActiveStates();
          });
        });

        // タグリンククリック
        document.querySelectorAll('.tag-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.dataset.tag;
            state.tag = state.tag === tag ? null : tag;
            updateURL();
            applyFilters();
            updateActiveStates();
          });
        });

        // フィルタークリア
        if (clearFilterBtn) {
          clearFilterBtn.addEventListener('click', clearFilters);
        }
        if (resetFilterBtn) {
          resetFilterBtn.addEventListener('click', clearFilters);
        }

        function clearFilters() {
          state.category = null;
          state.tag = null;
          updateURL();
          applyFilters();
          updateActiveStates();
        }

        // URLを更新
        function updateURL() {
          const params = new URLSearchParams();
          if (state.category) params.set('category', state.category);
          if (state.tag) params.set('tag', state.tag);
          const newURL = params.toString() ? '/blog?' + params.toString() : '/blog';
          history.pushState(null, '', newURL);
        }

        // フィルター適用
        function applyFilters() {
          const blogCards = document.querySelectorAll('.blog-card');
          let visibleCount = 0;

          blogCards.forEach(card => {
            const cardCategory = card.dataset.category;
            const cardTags = (card.dataset.tags || '').split(',').filter(t => t);
            
            let show = true;
            
            // カテゴリフィルター
            if (state.category && cardCategory !== state.category) {
              show = false;
            }
            
            // タグフィルター
            if (state.tag && !cardTags.includes(state.tag)) {
              show = false;
            }

            card.style.display = show ? '' : 'none';
            if (show) visibleCount++;
          });

          // 結果カウント更新
          if (resultCount) resultCount.textContent = visibleCount;

          // 結果なしメッセージ
          if (noResults) {
            noResults.classList.toggle('hidden', visibleCount > 0);
          }
          if (blogGrid) {
            blogGrid.classList.toggle('hidden', visibleCount === 0);
          }

          // フィルター表示更新
          updateFilterBadges();
        }

        // アクティブ状態更新
        function updateActiveStates() {
          // カテゴリボタン
          document.querySelectorAll('.category-link').forEach(link => {
            const isActive = (state.category === null && link.dataset.category === 'all') ||
                           (state.category === link.dataset.category);
            link.classList.toggle('bg-ai-blue/10', isActive);
            link.classList.toggle('font-bold', isActive);
          });

          // タグボタン
          document.querySelectorAll('.tag-link').forEach(link => {
            const isActive = state.tag === link.dataset.tag;
            link.classList.toggle('bg-ai-blue', isActive);
            link.classList.toggle('text-white', isActive);
            link.classList.toggle('bg-ai-blue/10', !isActive);
            link.classList.toggle('text-ai-blue', !isActive);
          });
        }

        // フィルターバッジ更新
        function updateFilterBadges() {
          if (!currentFilter || !filterBadges) return;

          const badges = [];
          if (state.category) {
            badges.push('<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600">' +
                       '<i class="fas fa-folder mr-1"></i>' + state.category + '</span>');
          }
          if (state.tag) {
            badges.push('<span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-600">' +
                       '#' + state.tag + '</span>');
          }

          if (badges.length > 0) {
            filterBadges.innerHTML = badges.join('');
            currentFilter.classList.remove('hidden');
          } else {
            currentFilter.classList.add('hidden');
          }
        }

        // ブラウザの戻る/進むに対応
        window.addEventListener('popstate', () => {
          const urlParams = new URLSearchParams(window.location.search);
          state.category = urlParams.get('category');
          state.tag = urlParams.get('tag');
          applyFilters();
          updateActiveStates();
        });

        // 初期化
        applyFilters();
        updateActiveStates();
      })();
    </script>
  `

  return renderLayout('ブログ', content, 'blog')
}

// コメント型定義
interface Comment {
  id: number
  author_name: string
  content: string
  created_at: string
  admin_reply?: string
  admin_reply_at?: string
}

export const renderBlogPostPage = (post: BlogPost, allPosts: BlogPost[], courses: any[] = [], comments: Comment[] = []) => {
  // 関連記事を取得（同じカテゴリまたはタグ、最大6件）
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id)
    .filter(p => {
      // 同じカテゴリ
      if (p.category === post.category) return true
      // 同じタグを含む
      if (post.tags && p.tags) {
        return post.tags.some(tag => p.tags?.includes(tag))
      }
      return false
    })
    .slice(0, 3)

  const content = `
    <!-- AI Blog Post Styles - 強化版 -->
    <style>
      /* ===== メインアニメーション ===== */
      
      /* マトリックス風コード流れ - はっきり見える */
      @keyframes matrix-fall {
        0% { 
          transform: translateY(-100%);
          opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { 
          transform: translateY(100vh);
          opacity: 0;
        }
      }
      
      /* 横に流れるデータライン */
      @keyframes data-flow-horizontal {
        0% { 
          transform: translateX(-100%);
          opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { 
          transform: translateX(100vw);
          opacity: 0;
        }
      }
      
      /* パルス波 - 中心から広がる */
      @keyframes pulse-wave {
        0% {
          transform: scale(0.8);
          opacity: 0.8;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.4;
        }
        100% {
          transform: scale(0.8);
          opacity: 0.8;
        }
      }
      
      /* スキャンライン */
      @keyframes scan-line {
        0% { top: -5%; }
        100% { top: 105%; }
      }
      
      /* 輝くグリッド */
      @keyframes grid-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }
      
      /* 浮遊する光の玉 */
      @keyframes float-orb {
        0%, 100% { 
          transform: translateY(0) translateX(0) scale(1);
          opacity: 0.6;
        }
        25% { 
          transform: translateY(-40px) translateX(20px) scale(1.2);
          opacity: 0.9;
        }
        50% { 
          transform: translateY(-20px) translateX(-30px) scale(0.9);
          opacity: 0.7;
        }
        75% { 
          transform: translateY(-60px) translateX(10px) scale(1.1);
          opacity: 0.85;
        }
      }
      
      /* 回転するリング */
      @keyframes spin-ring {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* 背景グラデーション - 速いサイクル */
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      /* ===== コンテナスタイル - 優しいパステルカラー ===== */
      
      .ai-blog-bg {
        background: linear-gradient(135deg, #F0F4FF 0%, #F5F3FF 25%, #FDF2F8 50%, #FEF9C3 75%, #ECFDF5 100%);
        background-size: 400% 400%;
        animation: gradient-shift 10s ease infinite;
        position: relative;
        overflow: hidden;
      }
      
      /* マトリックスコード - 優しいラベンダー */
      .matrix-code {
        position: absolute;
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 15px;
        font-weight: 500;
        color: #A5B4FC;
        opacity: 0.6;
        white-space: nowrap;
        pointer-events: none;
        animation: matrix-fall 10s linear infinite;
        text-shadow: 0 0 15px rgba(165, 180, 252, 0.5);
      }
      
      /* 横データライン - 優しいグラデーション */
      .data-line {
        position: absolute;
        height: 3px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(184, 149, 106, 0.7) 20%, 
          rgba(251, 207, 232, 0.8) 40%,
          rgba(186, 230, 253, 0.8) 60%,
          rgba(184, 149, 106, 0.7) 80%,
          transparent 100%);
        border-radius: 3px;
        animation: data-flow-horizontal 4s ease-in-out infinite;
        box-shadow: 0 0 12px rgba(184, 149, 106, 0.4);
      }
      
      /* スキャンライン - 優しいピンク */
      .scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, 
          transparent 0%, 
          rgba(251, 207, 232, 0.4) 20%,
          rgba(251, 207, 232, 0.7) 50%,
          rgba(251, 207, 232, 0.4) 80%,
          transparent 100%);
        animation: scan-line 5s linear infinite;
        box-shadow: 0 0 15px rgba(251, 207, 232, 0.5);
      }
      
      /* 光の玉 - 優しいパステル */
      .glow-orb {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle, 
          rgba(184, 149, 106, 0.5) 0%, 
          rgba(251, 207, 232, 0.3) 40%,
          transparent 70%);
        animation: float-orb 6s ease-in-out infinite;
        filter: blur(3px);
      }
      
      /* パルス波 - 優しいラベンダー */
      .pulse-ring {
        position: absolute;
        border-radius: 50%;
        border: 2px solid rgba(184, 149, 106, 0.35);
        animation: pulse-wave 4s ease-in-out infinite;
      }
      
      /* グリッドオーバーレイ - より薄く */
      .grid-overlay {
        position: absolute;
        inset: 0;
        background-image: 
          linear-gradient(rgba(184, 149, 106, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(184, 149, 106, 0.08) 1px, transparent 1px);
        background-size: 50px 50px;
        animation: grid-pulse 5s ease-in-out infinite;
      }
      
      /* 回転リング - 優しいパープル */
      .spin-ring {
        position: absolute;
        border-radius: 50%;
        border: 2px dashed rgba(184, 149, 106, 0.25);
        animation: spin-ring 25s linear infinite;
      }
      
      .blog-content h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1E293B;
        margin: 2.5rem 0 1rem;
        padding: 0.75rem 1rem;
        background: linear-gradient(90deg, rgba(107, 155, 98, 0.1) 0%, transparent 100%);
        border-left: 4px solid #6B9B62;
        border-radius: 0 8px 8px 0;
      }
      .blog-content h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #6B9B62;
        margin: 2rem 0 0.75rem;
      }
      .blog-content p {
        font-size: 1.1rem;
        line-height: 2;
        color: #475569;
        margin-bottom: 1.5rem;
      }
      .blog-content ul, .blog-content ol {
        margin: 1.5rem 0;
        padding-left: 1.5rem;
      }
      .blog-content li {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #475569;
        margin-bottom: 0.75rem;
        position: relative;
      }
      .blog-content ul li::marker {
        color: #B8956A;
      }
      .blog-content strong {
        color: #7C3AED;
        font-weight: 600;
      }
      .blog-content a {
        color: #6B9B62;
        text-decoration: underline;
        text-decoration-color: rgba(107, 155, 98, 0.3);
        transition: all 0.2s;
      }
      .blog-content a:hover {
        color: #B8956A;
        text-decoration-color: #B8956A;
      }
      .blog-content blockquote {
        background: linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%);
        border-left: 4px solid #B8956A;
        padding: 1.5rem;
        margin: 2rem 0;
        border-radius: 0 16px 16px 0;
        font-style: italic;
      }
      .blog-content img {
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        margin: 2rem auto;
      }
      .blog-content code {
        background: linear-gradient(135deg, #EEF2FF 0%, #F0FDFA 100%);
        color: #7C3AED;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.9em;
      }
      .blog-content pre {
        background: linear-gradient(135deg, #1E293B 0%, #312E81 100%);
        border-radius: 16px;
        padding: 1.5rem;
        margin: 2rem 0;
        overflow-x: auto;
      }
      .blog-content pre code {
        background: transparent;
        color: #E2E8F0;
        padding: 0;
      }
    </style>

    <!-- ヘッダー：アイキャッチ画像 + タイトル -->
    <section class="relative">
      <!-- アイキャッチ画像（大きく表示） -->
      <div class="relative h-[300px] md:h-[400px] overflow-hidden">
        <img loading="lazy" decoding="async" src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
        <!-- オーバーレイグラデーション -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        <!-- タイトル・メタ情報（画像の上に配置） -->
        <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div class="max-w-4xl mx-auto">
            <!-- Category & Meta -->
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <a href="/blog?category=${encodeURIComponent(post.category)}" 
                 class="inline-flex items-center bg-white/90 backdrop-blur ${getCategoryColor(post.category).color} text-sm font-semibold px-4 py-2 rounded-full hover:bg-white transition-all shadow-md">
                <i class="fas fa-folder-open mr-2"></i>${post.category}
              </a>
              <span class="inline-flex items-center bg-white/80 backdrop-blur text-gray-700 text-sm px-3 py-1.5 rounded-full">
                <i class="fas fa-clock mr-1.5 text-blue-500"></i>${post.readTime}
              </span>
              <span class="inline-flex items-center bg-white/80 backdrop-blur text-gray-700 text-sm px-3 py-1.5 rounded-full">
                <i class="fas fa-calendar mr-1.5 text-purple-500"></i>${post.date}
              </span>
            </div>
            
            <!-- Title -->
            <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              ${post.title}
            </h1>
          </div>
        </div>
      </div>
    </section>

    <!-- 記事コンテンツ - 優しいアニメーション背景 -->
    <section class="py-16 md:py-20 ai-blog-bg min-h-screen relative">
      
      <!-- グリッドオーバーレイ - 薄め -->
      <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(rgba(184, 149, 106, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(184, 149, 106, 0.06) 1px, transparent 1px); background-size: 60px 60px;"></div>
      
      <!-- 両端の流れるコード -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="matrix-code" style="left: 2%; animation-delay: 0s; animation-duration: 12s; opacity: 0.4;">while(learning) { improve(); }</div>
        <div class="matrix-code" style="left: 2%; animation-delay: -6s; animation-duration: 14s; opacity: 0.4;">neural.train(dataset);</div>
        <div class="matrix-code" style="right: 2%; left: auto; animation-delay: -3s; animation-duration: 13s; opacity: 0.4;">const model = new AI();</div>
        <div class="matrix-code" style="right: 2%; left: auto; animation-delay: -9s; animation-duration: 11s; opacity: 0.4;">return prediction;</div>
      </div>
      
      <!-- 横に流れるデータライン（記事エリア外側） -->
      <div class="data-line" style="top: 15%; width: 200px; animation-delay: 0s; animation-duration: 5s; opacity: 0.4;"></div>
      <div class="data-line" style="top: 45%; width: 180px; animation-delay: -2s; animation-duration: 6s; opacity: 0.4;"></div>
      <div class="data-line" style="top: 75%; width: 220px; animation-delay: -4s; animation-duration: 5.5s; opacity: 0.4;"></div>
      
      <!-- 浮遊する光の玉（記事エリア外側） -->
      <div class="glow-orb" style="width: 60px; height: 60px; left: 3%; top: 30%; animation-delay: 0s; opacity: 0.4;"></div>
      <div class="glow-orb" style="width: 80px; height: 80px; right: 3%; top: 50%; animation-delay: -2s; opacity: 0.4;"></div>
      <div class="glow-orb" style="width: 50px; height: 50px; left: 5%; bottom: 20%; animation-delay: -4s; opacity: 0.4;"></div>
      
      <!-- スキャンライン -->
      <div class="scan-line" style="animation-duration: 8s; opacity: 0.3;"></div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Main Article Card - 白の半透明ベース -->
        <div class="bg-white/85 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-white/60 relative z-10">
          
          ${post.video_url ? `
          <!-- 動画セクション -->
          <div class="p-6 md:p-10 border-b border-gray-100">
            <div class="flex items-center gap-2 mb-4">
              <i class="fas fa-video text-purple-500"></i>
              <span class="font-medium text-gray-700">関連動画</span>
            </div>
            <div class="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
              ${getVideoEmbedHtml(post.video_url)}
            </div>
          </div>
          ` : ''}
          
          <!-- Article Body -->
          <article class="p-6 md:p-10 blog-content">
            ${post.content}
          </article>

          <!-- タグ表示 -->
          <div class="p-6 md:px-10 border-t border-gray-100">
            <div class="flex items-center gap-2 mb-3">
              <i class="fas fa-tags text-purple-500"></i>
              <span class="text-sm font-medium text-gray-600">タグ</span>
            </div>
            <div class="flex flex-wrap gap-2">
              ${(post.tags || []).map(tag => `
                <a href="/blog?tag=${encodeURIComponent(tag)}" 
                   class="inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105">
                  <i class="fas fa-hashtag mr-1 text-xs"></i>${tag}
                </a>
              `).join('')}
            </div>
          </div>
          
          <!-- Back to Blog -->
          <div class="p-6 md:px-10 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <a href="/blog" class="inline-flex items-center text-blue-600 hover:text-purple-600 font-medium transition-colors group">
              <i class="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
              ブログ一覧に戻る
            </a>
          </div>
        </div>
      </div>
    </section>

    ${relatedPosts.length > 0 ? `
    <!-- Related Posts -->
    <section class="py-12" style="background: linear-gradient(180deg, #F5F3FF 0%, #EEF2FF 100%);">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <i class="fas fa-robot text-white"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-800">AIがおすすめする関連記事</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${relatedPosts.map(related => `
            <a href="/blog/${related.id}" class="group bg-white rounded-2xl overflow-hidden border border-purple-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="aspect-video overflow-hidden">
                <img loading="lazy" decoding="async" src="${related.image}" alt="${related.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              </div>
              <div class="p-4">
                <span class="${getCategoryColor(related.category).bgColor} ${getCategoryColor(related.category).color} text-xs font-medium px-2 py-1 rounded-full">${related.category}</span>
                <h3 class="text-sm font-bold text-gray-800 mt-2 line-clamp-2 group-hover:text-purple-600 transition-colors">${related.title}</h3>
                <p class="text-xs text-gray-500 mt-2 flex items-center">
                  <i class="fas fa-calendar mr-1"></i>${related.date}
                </p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- おすすめ講座 -->
    ${courses.length > 0 ? `
    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <i class="fas fa-graduation-cap text-white"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-800">おすすめ講座</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${courses.map((course: any) => `
            <a href="/courses/${course.id}" class="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="aspect-video overflow-hidden">
                <img loading="lazy" decoding="async" src="${course.image}" alt="${course.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
              </div>
              <div class="p-4">
                <span class="inline-block text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700 mb-2">${course.category || 'AI講座'}</span>
                <h3 class="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-amber-600 transition-colors">${course.title}</h3>
                <p class="text-xs text-gray-500 mt-2">${course.duration || '60分'}</p>
              </div>
            </a>
          `).join('')}
        </div>
        <div class="text-center mt-8">
          <a href="/courses" class="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors">
            すべての講座を見る
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
    ` : ''}

    <!-- コメントセクション -->
    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- セクションタイトル -->
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <i class="fas fa-comments text-white"></i>
          </div>
          <h2 class="text-xl font-bold text-gray-800">コメント</h2>
          <span class="text-sm text-gray-500">(${comments.length}件)</span>
        </div>

        <!-- 承認済みコメント一覧 -->
        <div class="space-y-6 mb-10">
          ${comments.length > 0 ? comments.map(comment => `
            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-user text-white text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-semibold text-gray-800">${comment.author_name}</span>
                    <span class="text-xs text-gray-400">${new Date(comment.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <p class="text-gray-700 whitespace-pre-wrap">${comment.content}</p>
                  
                  ${comment.admin_reply ? `
                    <div class="mt-4 pl-4 border-l-4 border-emerald-400 bg-emerald-50 rounded-r-xl p-4">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                          <i class="fas fa-check-circle mr-1"></i>管理者からの返信
                        </span>
                        ${comment.admin_reply_at ? `<span class="text-xs text-gray-400">${new Date(comment.admin_reply_at).toLocaleDateString('ja-JP')}</span>` : ''}
                      </div>
                      <p class="text-gray-700 text-sm whitespace-pre-wrap">${comment.admin_reply}</p>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('') : `
            <div class="text-center py-8 text-gray-500">
              <i class="fas fa-comment-dots text-4xl text-gray-300 mb-3"></i>
              <p>まだコメントはありません。<br>最初のコメントを投稿してみましょう！</p>
            </div>
          `}
        </div>

        <!-- コメント投稿フォーム -->
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-pen mr-2 text-purple-500"></i>コメントを投稿する
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            <i class="fas fa-info-circle mr-1 text-blue-400"></i>
            コメントは承認後に表示されます。お名前は公開されます。
          </p>
          
          <form id="comment-form" class="space-y-4">
            <input type="hidden" name="post_id" value="${post.id}">
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="author_name" 
                required
                maxlength="50"
                placeholder="ニックネームでもOK"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                コメント <span class="text-red-500">*</span>
              </label>
              <textarea 
                name="content" 
                required
                maxlength="2000"
                rows="4"
                placeholder="記事の感想やご質問など、お気軽にどうぞ！"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
              ></textarea>
              <p class="text-xs text-gray-400 mt-1 text-right"><span id="char-count">0</span>/2000</p>
            </div>
            
            <button 
              type="submit" 
              class="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <i class="fas fa-paper-plane mr-2"></i>コメントを送信
            </button>
          </form>
          
          <!-- 送信結果メッセージ -->
          <div id="comment-result" class="hidden mt-4 p-4 rounded-xl"></div>
        </div>
      </div>
    </section>

    <!-- コメント送信スクリプト -->
    <script>
      (function() {
        const form = document.getElementById('comment-form');
        const result = document.getElementById('comment-result');
        const charCount = document.getElementById('char-count');
        const textarea = form.querySelector('textarea[name="content"]');
        
        // 文字数カウント
        textarea.addEventListener('input', () => {
          charCount.textContent = textarea.value.length;
        });
        
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
          
          try {
            const formData = new FormData(form);
            const data = {
              post_id: formData.get('post_id'),
              author_name: formData.get('author_name'),
              content: formData.get('content')
            };
            
            const response = await fetch('/api/comments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            const json = await response.json();
            
            if (json.success) {
              result.className = 'mt-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700';
              result.innerHTML = '<i class="fas fa-check-circle mr-2"></i>' + json.message;
              form.reset();
              charCount.textContent = '0';
            } else {
              result.className = 'mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700';
              result.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>' + (json.error || 'エラーが発生しました');
            }
            result.classList.remove('hidden');
          } catch (error) {
            result.className = 'mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700';
            result.innerHTML = '<i class="fas fa-exclamation-circle mr-2"></i>通信エラーが発生しました';
            result.classList.remove('hidden');
          } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        });
      })();
    </script>

    <!-- Courses CTA -->
    <section class="py-16" style="background: linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 50%, #F5F3FF 100%);">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white/80 backdrop-blur rounded-3xl p-8 md:p-12 text-center shadow-xl border border-white/50">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg ai-glow">
            <i class="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            🚀 もっとAIを学びたい？
          </h2>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            mirAIcafeの講座で、楽しみながら実践的なAIスキルを身につけましょう！
          </p>
          <a href="/courses" class="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <i class="fas fa-sparkles mr-2"></i>講座を見てみる
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout(post.title, content, 'blog')
}
