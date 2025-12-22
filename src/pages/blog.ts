import { renderLayout } from '../components/layout'
import { BlogPost, blogCategories, BlogCategory } from '../data'

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
        <h1 class="text-4xl md:text-5xl font-bold text-future-text mb-4">AI学習ブログ</h1>
        <p class="text-future-textLight text-lg max-w-xl mx-auto">
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
                  <i class="fas fa-tags mr-2" style="color: #8B5CF6;"></i>タグ
                </h3>
                <div class="flex flex-wrap gap-2">
                  ${allTags.map(tag => `
                    <a href="/blog?tag=${encodeURIComponent(tag.name)}" 
                       class="tag-link inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer"
                       data-tag="${tag.name}"
                       style="background: rgba(59, 130, 246, 0.1); color: #3B82F6;">
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
                      <img src="${posts[0].image}" alt="${posts[0].title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700">
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
                    <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
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
        <div class="rounded-3xl p-8 border" style="background: rgba(255,255,255,0.9); border-color: rgba(59, 130, 246, 0.2);">
          <div class="text-center">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg pulse-glow" style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);">
              <i class="fas fa-envelope text-white text-xl"></i>
            </div>
            <h2 class="text-xl font-bold mb-2" style="color: #1E293B;">最新情報をお届け</h2>
            <p class="text-sm mb-4" style="color: #64748B;">メールマガジンに登録して、AI学習の最新情報を受け取りましょう</p>
            <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="メールアドレス" class="flex-1 p-3 border-2 rounded-xl focus:outline-none transition-colors bg-white text-sm" style="border-color: #E2E8F0;">
              <button type="submit" class="btn-ai text-white px-5 py-3 rounded-xl font-medium shadow-lg text-sm" style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);">
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

export const renderBlogPostPage = (post: BlogPost, allPosts: BlogPost[]) => {
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
    <!-- Article Header -->
    <section class="relative">
      <div class="aspect-[3/1] max-h-80 overflow-hidden">
        <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-future-text/80 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <a href="/blog?category=${encodeURIComponent(post.category)}" 
               class="${getCategoryColor(post.category).bgColor} ${getCategoryColor(post.category).color} text-sm font-medium px-3 py-1 rounded-full hover:opacity-80 transition-opacity">
              ${post.category}
            </a>
            <span class="text-white/80 text-sm"><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
            <span class="text-white/80 text-sm"><i class="fas fa-calendar mr-1"></i>${post.date}</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-bold text-white leading-tight">${post.title}</h1>
        </div>
      </div>
    </section>

    <!-- Article Content -->
    <section class="py-10 bg-future-light">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-3xl shadow-lg overflow-hidden border border-future-sky/50">
          <div class="p-5 border-b border-future-sky flex items-center justify-between glass">
            <div class="flex items-center">
              <div class="w-10 h-10 gradient-ai rounded-full flex items-center justify-center mr-3 shadow">
                <i class="fas fa-user text-white text-sm"></i>
              </div>
              <div>
                <p class="font-bold text-future-text text-sm">${post.author}</p>
                <p class="text-future-textLight text-xs">${post.date}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="w-9 h-9 rounded-full glass hover:bg-ai-blue/10 flex items-center justify-center text-future-textLight hover:text-ai-blue transition-all">
                <i class="fab fa-twitter"></i>
              </button>
              <button class="w-9 h-9 rounded-full glass hover:bg-ai-blue/10 flex items-center justify-center text-future-textLight hover:text-ai-blue transition-all">
                <i class="fab fa-facebook-f"></i>
              </button>
              <button class="w-9 h-9 rounded-full glass hover:bg-ai-blue/10 flex items-center justify-center text-future-textLight hover:text-ai-blue transition-all">
                <i class="fas fa-link"></i>
              </button>
            </div>
          </div>

          <article class="p-6 md:p-8 prose prose-lg max-w-none">
            <style>
              .prose h2 { color: #1E293B; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 3px solid #3B82F6; }
              .prose p { color: #64748B; line-height: 1.9; margin-bottom: 1.5rem; }
              .prose ul, .prose ol { color: #64748B; margin-bottom: 1.5rem; }
              .prose li { margin-bottom: 0.5rem; }
              .prose strong { color: #3B82F6; }
            </style>
            ${post.content}
          </article>

          <!-- タグ表示 -->
          <div class="p-5 border-t border-future-sky glass">
            <div class="flex flex-wrap gap-2">
              ${(post.tags || []).map(tag => `
                <a href="/blog?tag=${encodeURIComponent(tag)}" 
                   class="bg-ai-blue/10 text-ai-blue hover:bg-ai-blue hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all">
                  #${tag}
                </a>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mt-8">
          <a href="/blog" class="inline-flex items-center text-ai-blue hover:text-ai-purple font-medium transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>ブログ一覧に戻る
          </a>
        </div>
      </div>
    </section>

    ${relatedPosts.length > 0 ? `
    <!-- Related Posts -->
    <section class="py-10 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
          <i class="fas fa-newspaper text-ai-blue mr-2"></i>関連記事
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${relatedPosts.map(related => `
            <a href="/blog/${related.id}" class="card-hover bg-future-light rounded-xl overflow-hidden border border-future-sky/50 block">
              <div class="aspect-video overflow-hidden">
                <img src="${related.image}" alt="${related.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500">
              </div>
              <div class="p-4">
                <span class="${getCategoryColor(related.category).bgColor} ${getCategoryColor(related.category).color} text-xs font-medium px-2 py-1 rounded">${related.category}</span>
                <h3 class="text-sm font-bold text-future-text mt-2 line-clamp-2">${related.title}</h3>
                <p class="text-xs text-future-textLight mt-1">${related.date}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- Related CTA -->
    <section class="py-10 bg-future-light">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="glass rounded-3xl p-8 text-center border border-ai-blue/20">
          <h2 class="text-xl font-bold text-future-text mb-4">もっと深く学びたいですか？</h2>
          <p class="text-future-textLight mb-6 text-sm">mirAIcafeの講座で、実践的なAIスキルを身につけましょう</p>
          <a href="/courses" class="btn-ai inline-flex items-center justify-center gradient-ai text-white px-8 py-4 rounded-full font-bold shadow-lg">
            <i class="fas fa-book-open mr-2"></i>講座を見る
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout(post.title, content, 'blog')
}
