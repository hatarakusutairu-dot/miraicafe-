import { renderLayout } from '../components/layout'
import { Course } from '../data'

export const renderCoursesPage = (courses: Course[]) => {
  const content = `
    <!-- Page Header -->
    <section class="relative py-20 overflow-hidden">
      <div class="absolute inset-0 gradient-ai-light"></div>
      <div class="absolute inset-0">
        <div class="orb orb-1 opacity-30"></div>
        <div class="orb orb-2 opacity-20"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center gradient-ai text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas fa-book-open mr-2"></i>ALL COURSES
        </span>
        <h1 class="text-5xl font-bold text-future-text mb-4">講座一覧</h1>
        <p class="text-future-textLight text-lg max-w-xl mx-auto">
          目的やレベルに合わせて、最適な講座をお選びください
        </p>
      </div>
    </section>

    <!-- Filter Section - Compact Layout -->
    <section class="py-3 bg-white/95 backdrop-blur-sm sticky top-20 z-40 border-b border-future-sky shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Mobile Filter Toggle -->
        <div class="lg:hidden">
          <button id="filter-toggle" class="w-full flex items-center justify-between glass text-future-text px-4 py-2 rounded-xl font-medium text-sm">
            <span class="flex items-center">
              <i class="fas fa-filter mr-2 text-ai-blue"></i>
              フィルター・検索
              <span id="active-filters-count" class="ml-2 text-ai-blue hidden">
                (<span id="filter-count">0</span>)
              </span>
            </span>
            <i class="fas fa-chevron-down transition-transform text-sm" id="filter-toggle-icon"></i>
          </button>
        </div>

        <!-- Filter Content - Desktop: Compact 2-row layout -->
        <div id="filter-content" class="hidden lg:block">
          <!-- Row 1: Search + Categories -->
          <div class="flex items-center gap-4 mb-2">
            <!-- Search Bar - Compact -->
            <div class="relative w-64 flex-shrink-0">
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-future-textLight text-sm"></i>
              <input type="text" id="search-input" 
                class="w-full pl-9 pr-8 py-2 border border-future-sky rounded-xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light text-sm"
                placeholder="講座名で検索...">
              <button id="search-clear" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-future-textLight hover:text-future-text hidden">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>

            <!-- Category Filter - Inline -->
            <div class="flex items-center gap-2 flex-wrap" id="category-filters">
              <span class="text-future-textLight text-xs font-medium">カテゴリ:</span>
              <button class="filter-btn category-btn active gradient-ai text-white px-3 py-1 rounded-full text-xs font-medium transition-all shadow-sm" data-category="all">すべて</button>
              <button class="filter-btn category-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-cyan/10 transition-all" data-category="AI基礎">AI基礎</button>
              <button class="filter-btn category-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-blue/10 transition-all" data-category="プログラミング">プログラミング</button>
              <button class="filter-btn category-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-purple/10 transition-all" data-category="データ分析">データ分析</button>
              <button class="filter-btn category-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-pink/10 transition-all" data-category="資格対策">資格対策</button>
              <button class="filter-btn category-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-nature-forest/10 transition-all" data-category="教育者向け">教育者向け</button>
            </div>
          </div>

          <!-- Row 2: Price + Sort + Results -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <!-- Price Filter - Inline -->
              <div class="flex items-center gap-2" id="price-filters">
                <span class="text-future-textLight text-xs font-medium">価格:</span>
                <button class="filter-btn price-btn active gradient-ai text-white px-3 py-1 rounded-full text-xs font-medium transition-all shadow-sm" data-price="all">すべて</button>
                <button class="filter-btn price-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-green-500/10 transition-all" data-price="free">無料</button>
                <button class="filter-btn price-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-cyan/10 transition-all" data-price="under5000">〜5千円</button>
                <button class="filter-btn price-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-blue/10 transition-all" data-price="under10000">〜1万円</button>
                <button class="filter-btn price-btn glass text-future-text px-3 py-1 rounded-full text-xs font-medium hover:bg-ai-purple/10 transition-all" data-price="over10000">1万円〜</button>
              </div>

              <!-- Sort Dropdown -->
              <div class="flex items-center gap-2">
                <span class="text-future-textLight text-xs font-medium">並び替え:</span>
                <select id="sort-select" class="px-3 py-1 border border-future-sky rounded-lg focus:border-ai-blue focus:outline-none transition-colors bg-future-light text-future-text text-xs">
                  <option value="newest">新着順</option>
                  <option value="popular">人気順</option>
                  <option value="price-asc">安い順</option>
                  <option value="price-desc">高い順</option>
                  <option value="rating">評価順</option>
                </select>
              </div>

              <!-- Reset Filters -->
              <button id="reset-filters" class="text-ai-blue text-xs font-medium hover:text-ai-purple transition-colors hidden">
                <i class="fas fa-redo mr-1"></i>リセット
              </button>
            </div>

            <!-- Results Count -->
            <p class="text-future-textLight text-xs">
              全<span class="font-bold text-future-text">${courses.length}</span>件中<span class="font-bold text-future-text" id="filtered-count">${courses.length}</span>件
            </p>
          </div>
        </div>

        <!-- Mobile: Results Count -->
        <div class="lg:hidden mt-2 text-center">
          <p class="text-future-textLight text-xs">
            全<span class="font-bold text-future-text">${courses.length}</span>件中<span class="font-bold text-future-text" id="filtered-count-mobile">${courses.length}</span>件を表示
          </p>
        </div>
      </div>
    </section>

    <!-- Courses Grid -->
    <section class="py-16 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- No Results Message -->
        <div id="no-results" class="hidden text-center py-16">
          <div class="w-20 h-20 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-50">
            <i class="fas fa-search text-white text-3xl"></i>
          </div>
          <h3 class="text-xl font-bold text-future-text mb-2">条件に合う講座が見つかりませんでした</h3>
          <p class="text-future-textLight mb-6">検索条件を変更してお試しください</p>
          <button id="reset-from-empty" class="btn-ai gradient-ai text-white px-6 py-3 rounded-full font-medium">
            <i class="fas fa-redo mr-2"></i>フィルターをリセット
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="courses-grid">
          ${courses.map((course, index) => `
            <div class="card-hover bg-white overflow-hidden shadow-lg border border-future-sky/50 course-card" 
                 data-level="${course.level}" 
                 data-category="${course.category}"
                 data-price="${course.price}"
                 data-title="${course.title}"
                 data-description="${course.description}"
                 data-index="${index}">
              <div class="aspect-video relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="gradient-ai text-white text-xs font-bold px-3 py-1 rounded-full shadow">${course.level}</span>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="glass text-future-text text-xs font-bold px-3 py-1 rounded-full">
                    <i class="fas fa-clock mr-1"></i>${course.duration}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-future-textLight mb-2">
                  <i class="fas fa-tag mr-2 text-ai-blue"></i>${course.category}
                  <span class="mx-2">•</span>
                  <i class="fas fa-user mr-2 text-ai-purple"></i>${course.instructor}
                </div>
                <h3 class="text-xl font-bold text-future-text mb-2">${course.title}</h3>
                <p class="text-future-textLight text-sm mb-4 line-clamp-2">${course.description}</p>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  ${course.features.slice(0, 2).map(feature => `
                    <span class="bg-ai-cyan/10 text-ai-cyan text-xs px-2 py-1 rounded">${feature}</span>
                  `).join('')}
                  ${course.features.length > 2 ? `<span class="text-future-textLight text-xs">+${course.features.length - 2}</span>` : ''}
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-future-sky">
                  <span class="text-2xl font-bold gradient-ai-text">¥${course.price.toLocaleString()}</span>
                  <div class="flex gap-2">
                    <a href="/courses/${course.id}" class="btn-ai glass text-future-text px-4 py-2 rounded-full text-sm font-medium border border-ai-blue/30 hover:border-ai-blue">
                      詳細
                    </a>
                    <a href="/reservation?course=${course.id}" class="btn-ai gradient-ai text-white px-4 py-2 rounded-full text-sm font-medium">
                      予約
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="glass rounded-3xl p-8 border border-ai-blue/20">
          <div class="w-16 h-16 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i class="fas fa-question text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-future-text mb-4">
            どの講座を選べばいいかわからない？
          </h2>
          <p class="text-future-textLight mb-6">
            お気軽にお問い合わせください。あなたに最適な講座をご提案いたします。
          </p>
          <a href="/contact" class="btn-ai inline-flex items-center justify-center gradient-ai text-white px-6 py-3 rounded-full font-bold shadow-lg">
            <i class="fas fa-envelope mr-2"></i>相談する
          </a>
        </div>
      </div>
    </section>

    <script>
    (function() {
      // Elements
      const searchInput = document.getElementById('search-input');
      const searchClear = document.getElementById('search-clear');
      const categoryBtns = document.querySelectorAll('.category-btn');
      const priceBtns = document.querySelectorAll('.price-btn');
      const sortSelect = document.getElementById('sort-select');
      const resetFilters = document.getElementById('reset-filters');
      const resetFromEmpty = document.getElementById('reset-from-empty');
      const coursesGrid = document.getElementById('courses-grid');
      const noResults = document.getElementById('no-results');
      const filteredCountEl = document.getElementById('filtered-count');
      const filterToggle = document.getElementById('filter-toggle');
      const filterContent = document.getElementById('filter-content');
      const filterToggleIcon = document.getElementById('filter-toggle-icon');
      const activeFiltersCount = document.getElementById('active-filters-count');
      const filterCountEl = document.getElementById('filter-count');
      
      // Course cards
      const courseCards = Array.from(document.querySelectorAll('.course-card'));
      const totalCourses = ${courses.length};
      
      // Current filter state
      let currentFilters = {
        search: '',
        category: 'all',
        price: 'all',
        sort: 'newest'
      };

      // Mobile filter toggle
      if (filterToggle) {
        filterToggle.addEventListener('click', function() {
          const isHidden = filterContent.classList.contains('hidden');
          filterContent.classList.toggle('hidden');
          filterToggleIcon.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });
      }

      // Search functionality with debounce
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const value = this.value.trim();
        
        // Show/hide clear button
        searchClear.classList.toggle('hidden', !value);
        
        searchTimeout = setTimeout(function() {
          currentFilters.search = value.toLowerCase();
          applyFilters();
        }, 300);
      });

      searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchClear.classList.add('hidden');
        currentFilters.search = '';
        applyFilters();
      });

      // Category filter
      categoryBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          categoryBtns.forEach(function(b) {
            b.classList.remove('active', 'gradient-ai', 'text-white', 'shadow-sm');
            b.classList.add('glass', 'text-future-text');
          });
          this.classList.remove('glass', 'text-future-text');
          this.classList.add('active', 'gradient-ai', 'text-white', 'shadow-sm');
          
          currentFilters.category = this.dataset.category;
          applyFilters();
        });
      });

      // Price filter
      priceBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          priceBtns.forEach(function(b) {
            b.classList.remove('active', 'gradient-ai', 'text-white', 'shadow-sm');
            b.classList.add('glass', 'text-future-text');
          });
          this.classList.remove('glass', 'text-future-text');
          this.classList.add('active', 'gradient-ai', 'text-white', 'shadow-sm');
          
          currentFilters.price = this.dataset.price;
          applyFilters();
        });
      });

      // Sort functionality
      sortSelect.addEventListener('change', function() {
        currentFilters.sort = this.value;
        applyFilters();
      });

      // Reset filters
      function resetAllFilters() {
        searchInput.value = '';
        searchClear.classList.add('hidden');
        currentFilters = {
          search: '',
          category: 'all',
          price: 'all',
          sort: 'newest'
        };
        
        // Reset button styles
        categoryBtns.forEach(function(b, i) {
          b.classList.remove('active', 'gradient-ai', 'text-white', 'shadow-sm', 'glass', 'text-future-text');
          if (i === 0) {
            b.classList.add('active', 'gradient-ai', 'text-white', 'shadow-sm');
          } else {
            b.classList.add('glass', 'text-future-text');
          }
        });
        
        priceBtns.forEach(function(b, i) {
          b.classList.remove('active', 'gradient-ai', 'text-white', 'shadow-sm', 'glass', 'text-future-text');
          if (i === 0) {
            b.classList.add('active', 'gradient-ai', 'text-white', 'shadow-sm');
          } else {
            b.classList.add('glass', 'text-future-text');
          }
        });
        
        sortSelect.value = 'newest';
        applyFilters();
      }

      resetFilters.addEventListener('click', resetAllFilters);
      resetFromEmpty.addEventListener('click', resetAllFilters);

      // Apply filters
      function applyFilters() {
        let visibleCount = 0;
        let activeFilterCount = 0;
        
        // Count active filters
        if (currentFilters.search) activeFilterCount++;
        if (currentFilters.category !== 'all') activeFilterCount++;
        if (currentFilters.price !== 'all') activeFilterCount++;
        if (currentFilters.sort !== 'newest') activeFilterCount++;
        
        // Show/hide reset button and active filter count
        resetFilters.classList.toggle('hidden', activeFilterCount === 0);
        if (activeFiltersCount) {
          activeFiltersCount.classList.toggle('hidden', activeFilterCount === 0);
          filterCountEl.textContent = activeFilterCount;
        }

        // Filter and sort cards
        let filteredCards = courseCards.filter(function(card) {
          const title = card.dataset.title.toLowerCase();
          const description = card.dataset.description.toLowerCase();
          const category = card.dataset.category;
          const price = parseInt(card.dataset.price);
          
          // Search filter
          if (currentFilters.search) {
            const searchTerm = currentFilters.search;
            if (!title.includes(searchTerm) && !description.includes(searchTerm)) {
              return false;
            }
          }
          
          // Category filter
          if (currentFilters.category !== 'all') {
            if (category !== currentFilters.category) {
              return false;
            }
          }
          
          // Price filter
          if (currentFilters.price !== 'all') {
            switch (currentFilters.price) {
              case 'free':
                if (price !== 0) return false;
                break;
              case 'under5000':
                if (price > 5000) return false;
                break;
              case 'under10000':
                if (price > 10000) return false;
                break;
              case 'over10000':
                if (price <= 10000) return false;
                break;
            }
          }
          
          return true;
        });

        // Sort cards
        filteredCards.sort(function(a, b) {
          const priceA = parseInt(a.dataset.price);
          const priceB = parseInt(b.dataset.price);
          const indexA = parseInt(a.dataset.index);
          const indexB = parseInt(b.dataset.index);
          
          switch (currentFilters.sort) {
            case 'newest':
              return indexA - indexB; // Original order (assuming newest first)
            case 'popular':
              return indexA - indexB; // Placeholder - would use review count
            case 'price-asc':
              return priceA - priceB;
            case 'price-desc':
              return priceB - priceA;
            case 'rating':
              return indexA - indexB; // Placeholder - would use rating
            default:
              return 0;
          }
        });

        // Hide all cards first
        courseCards.forEach(function(card) {
          card.style.display = 'none';
          card.style.order = '';
        });

        // Show and reorder filtered cards
        filteredCards.forEach(function(card, index) {
          card.style.display = 'block';
          card.style.order = index;
          visibleCount++;
        });

        // Update count display
        filteredCountEl.textContent = visibleCount;
        const filteredCountMobile = document.getElementById('filtered-count-mobile');
        if (filteredCountMobile) filteredCountMobile.textContent = visibleCount;
        
        // Show/hide no results message
        noResults.classList.toggle('hidden', visibleCount > 0);
        coursesGrid.classList.toggle('hidden', visibleCount === 0);
      }

      // Initial application
      applyFilters();
    })();
    </script>
  `

  return renderLayout('講座一覧', content, 'courses')
}

export const renderCourseDetailPage = (course: Course) => {
  const content = `
    <!-- Hero Section -->
    <section class="relative">
      <div class="aspect-[3/1] max-h-80 overflow-hidden">
        <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-future-text/80 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="gradient-ai text-white text-sm font-bold px-3 py-1 rounded-full">${course.level}</span>
            <span class="glass text-future-text text-sm font-bold px-3 py-1 rounded-full">${course.category}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-white">${course.title}</h1>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-12 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-3xl p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-2xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3">
                  <i class="fas fa-info text-white"></i>
                </span>
                講座概要
              </h2>
              <p class="text-future-textLight leading-relaxed">${course.longDescription}</p>
            </div>

            <div class="bg-white rounded-3xl p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-2xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3">
                  <i class="fas fa-check text-white"></i>
                </span>
                学べる内容
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${course.features.map((feature, index) => `
                  <div class="flex items-start bg-future-light rounded-xl p-4">
                    <div class="w-8 h-8 gradient-ai rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <i class="fas fa-check text-white text-sm"></i>
                    </div>
                    <span class="text-future-text">${feature}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="bg-white rounded-3xl p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-2xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3">
                  <i class="fas fa-user text-white"></i>
                </span>
                講師紹介
              </h2>
              <div class="flex items-center bg-future-light rounded-2xl p-6">
                <div class="w-20 h-20 gradient-ai rounded-full flex items-center justify-center mr-6 shadow-lg">
                  <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-future-text">${course.instructor}</h3>
                  <p class="gradient-ai-text text-sm font-medium">mirAIcafe認定講師</p>
                  <p class="text-future-textLight text-sm mt-2">AI分野の専門家として、多くの受講生を指導してきた経験豊富な講師です。</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl p-6 shadow-lg sticky top-24 border border-future-sky/50">
              <div class="text-center mb-6 pb-6 border-b border-future-sky">
                <span class="text-sm text-future-textLight">受講料</span>
                <p class="text-4xl font-bold gradient-ai-text">¥${course.price.toLocaleString()}</p>
                <span class="text-sm text-future-textLight">（税込）</span>
              </div>

              <div class="space-y-4 mb-6">
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-clock w-8 text-ai-cyan"></i>
                  <span>${course.duration}</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-laptop w-8 text-ai-blue"></i>
                  <span>オンライン開催</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-users w-8 text-ai-purple"></i>
                  <span>少人数制（最大10名）</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-certificate w-8 text-ai-pink"></i>
                  <span>修了証発行あり</span>
                </div>
              </div>

              <a href="/reservation?course=${course.id}" class="btn-ai block w-full gradient-ai text-white text-center py-4 rounded-full font-bold shadow-lg">
                <i class="fas fa-calendar-check mr-2"></i>日程を選んで予約
              </a>

              <div class="mt-4 text-center">
                <a href="/contact" class="text-ai-blue hover:text-ai-purple text-sm transition-colors">
                  <i class="fas fa-question-circle mr-1"></i>ご質問はこちら
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Reviews Section -->
    <section class="py-16 bg-white" id="reviews-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-cafe-cream rounded-3xl p-8 shadow-lg border border-cafe-beige">
          <h2 class="text-2xl font-bold text-cafe-text mb-8 flex items-center">
            <span class="w-10 h-10 bg-cafe-wood rounded-xl flex items-center justify-center mr-3">
              <i class="fas fa-star text-white"></i>
            </span>
            受講者の声・レビュー
          </h2>

          <!-- Review Summary -->
          <div id="review-summary" class="mb-8 p-6 bg-cafe-ivory rounded-2xl border border-cafe-beige">
            <div class="flex flex-col md:flex-row items-center gap-8">
              <div class="text-center">
                <div class="text-5xl font-bold text-cafe-wood" id="avg-rating">-</div>
                <div class="flex justify-center mt-2" id="avg-stars">
                  <i class="fas fa-star text-gray-300"></i>
                  <i class="fas fa-star text-gray-300"></i>
                  <i class="fas fa-star text-gray-300"></i>
                  <i class="fas fa-star text-gray-300"></i>
                  <i class="fas fa-star text-gray-300"></i>
                </div>
                <div class="text-cafe-textLight text-sm mt-1"><span id="total-reviews">0</span>件のレビュー</div>
              </div>
              <div class="flex-1 w-full">
                <div class="space-y-2" id="rating-distribution">
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-cafe-textLight w-16">5つ星</span>
                    <div class="flex-1 h-3 bg-cafe-beige rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-5" style="width: 0%"></div>
                    </div>
                    <span class="text-sm text-cafe-textLight w-12 text-right" id="count-5">0件</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-cafe-textLight w-16">4つ星</span>
                    <div class="flex-1 h-3 bg-cafe-beige rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-4" style="width: 0%"></div>
                    </div>
                    <span class="text-sm text-cafe-textLight w-12 text-right" id="count-4">0件</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-cafe-textLight w-16">3つ星</span>
                    <div class="flex-1 h-3 bg-cafe-beige rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-3" style="width: 0%"></div>
                    </div>
                    <span class="text-sm text-cafe-textLight w-12 text-right" id="count-3">0件</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-cafe-textLight w-16">2つ星</span>
                    <div class="flex-1 h-3 bg-cafe-beige rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-2" style="width: 0%"></div>
                    </div>
                    <span class="text-sm text-cafe-textLight w-12 text-right" id="count-2">0件</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-cafe-textLight w-16">1つ星</span>
                    <div class="flex-1 h-3 bg-cafe-beige rounded-full overflow-hidden">
                      <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-1" style="width: 0%"></div>
                    </div>
                    <span class="text-sm text-cafe-textLight w-12 text-right" id="count-1">0件</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Review List -->
          <div id="reviews-list" class="space-y-4 mb-8">
            <div class="text-center py-8 text-cafe-textLight">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>レビューを読み込み中...</p>
            </div>
          </div>

          <!-- Pagination -->
          <div id="reviews-pagination" class="flex justify-center gap-2 mb-8 hidden">
          </div>

          <!-- Write Review Button -->
          <div class="text-center">
            <button id="btn-write-review" class="btn-warm inline-flex items-center justify-center px-8 py-4 font-bold shadow-lg">
              <i class="fas fa-pen mr-2"></i>レビューを書く
            </button>
          </div>

          <!-- Review Form (Hidden by default) -->
          <div id="review-form-container" class="hidden mt-8 p-6 bg-cafe-ivory rounded-2xl border border-cafe-beige">
            <h3 class="text-xl font-bold text-cafe-text mb-6 flex items-center">
              <i class="fas fa-edit text-cafe-wood mr-2"></i>レビューを投稿
            </h3>
            <form id="review-form" class="space-y-6">
              <input type="hidden" name="courseId" value="${course.id}">
              
              <div>
                <label class="block text-cafe-text font-medium mb-2">お名前（ニックネーム可）<span class="text-red-500">*</span></label>
                <input type="text" name="reviewerName" required maxlength="50"
                  class="w-full px-4 py-3 rounded-xl border border-cafe-beige focus:border-cafe-wood focus:ring-2 focus:ring-cafe-wood/20 outline-none transition-all"
                  placeholder="山田 太郎">
              </div>

              <div>
                <label class="block text-cafe-text font-medium mb-2">メールアドレス（非公開）<span class="text-red-500">*</span></label>
                <input type="email" name="reviewerEmail" required
                  class="w-full px-4 py-3 rounded-xl border border-cafe-beige focus:border-cafe-wood focus:ring-2 focus:ring-cafe-wood/20 outline-none transition-all"
                  placeholder="example@email.com">
              </div>

              <div>
                <label class="block text-cafe-text font-medium mb-2">評価<span class="text-red-500">*</span></label>
                <div class="flex gap-2" id="star-rating">
                  <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="1"><i class="fas fa-star"></i></button>
                  <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="2"><i class="fas fa-star"></i></button>
                  <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="3"><i class="fas fa-star"></i></button>
                  <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="4"><i class="fas fa-star"></i></button>
                  <button type="button" class="star-btn text-3xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="5"><i class="fas fa-star"></i></button>
                </div>
                <input type="hidden" name="rating" id="rating-input" required>
              </div>

              <div>
                <label class="block text-cafe-text font-medium mb-2">コメント（500文字まで）<span class="text-red-500">*</span></label>
                <textarea name="comment" required maxlength="500" rows="5"
                  class="w-full px-4 py-3 rounded-xl border border-cafe-beige focus:border-cafe-wood focus:ring-2 focus:ring-cafe-wood/20 outline-none transition-all resize-none"
                  placeholder="講座の感想をお聞かせください..."></textarea>
                <div class="text-right text-sm text-cafe-textLight mt-1">
                  <span id="char-count">0</span>/500
                </div>
              </div>

              <div class="flex gap-4">
                <button type="submit" class="btn-warm flex-1 py-3 font-bold">
                  <i class="fas fa-paper-plane mr-2"></i>投稿する
                </button>
                <button type="button" id="btn-cancel-review" class="btn-outline flex-1 py-3 font-bold">
                  キャンセル
                </button>
              </div>
            </form>

            <!-- Success Message -->
            <div id="review-success" class="hidden text-center py-8">
              <div class="w-16 h-16 bg-nature-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check text-nature-forest text-2xl"></i>
              </div>
              <h4 class="text-xl font-bold text-cafe-text mb-2">ありがとうございます！</h4>
              <p class="text-cafe-textLight">レビューを投稿いただきありがとうございます。<br>承認後に表示されます。</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <style>
      .star-btn.active { color: #FBBF24; }
      .review-card { transition: transform 0.2s; }
      .review-card:hover { transform: translateY(-2px); }
    </style>

    <script>
      (function() {
        var courseId = '${course.id}';
        var currentPage = 1;

        // Load reviews
        function loadReviews(page) {
          page = page || 1;
          currentPage = page;
          fetch('/api/reviews/' + courseId + '?page=' + page)
            .then(function(res) { return res.json(); })
            .then(function(data) {
              renderSummary(data.stats);
              renderReviews(data.reviews);
              renderPagination(data.pagination);
            })
            .catch(function(err) {
              console.error('Failed to load reviews:', err);
              document.getElementById('reviews-list').innerHTML = 
                '<p class="text-center text-cafe-textLight py-8">レビューの読み込みに失敗しました</p>';
            });
        }

        // Render summary
        function renderSummary(stats) {
          document.getElementById('avg-rating').textContent = stats.average || '-';
          document.getElementById('total-reviews').textContent = stats.total;
          
          // Render average stars
          var avgStars = document.getElementById('avg-stars');
          avgStars.innerHTML = '';
          for (var i = 1; i <= 5; i++) {
            var star = document.createElement('i');
            if (i <= Math.floor(stats.average)) {
              star.className = 'fas fa-star text-yellow-400';
            } else if (i - 0.5 <= stats.average) {
              star.className = 'fas fa-star-half-alt text-yellow-400';
            } else {
              star.className = 'fas fa-star text-gray-300';
            }
            avgStars.appendChild(star);
          }

          // Render distribution bars
          var total = stats.total || 1;
          [5,4,3,2,1].forEach(function(star) {
            var count = stats.distribution[star] || 0;
            var percent = (count / total) * 100;
            document.getElementById('bar-' + star).style.width = percent + '%';
            document.getElementById('count-' + star).textContent = count + '件';
          });
        }

        // Render review cards
        function renderReviews(reviews) {
          var container = document.getElementById('reviews-list');
          if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="text-center text-cafe-textLight py-8">まだレビューがありません。最初のレビューを投稿してみませんか？</p>';
            return;
          }

          container.innerHTML = reviews.map(function(review) {
            return '<div class="review-card bg-cafe-ivory rounded-2xl p-6 border border-cafe-beige shadow-sm">' +
              '<div class="flex items-start justify-between mb-3">' +
              '<div>' +
              '<h4 class="font-bold text-cafe-text">' + escapeHtml(review.reviewer_name) + '</h4>' +
              '<div class="flex items-center gap-2 mt-1">' +
              '<div class="flex">' + renderStars(review.rating) + '</div>' +
              '<span class="text-sm text-cafe-textLight">' + formatDate(review.created_at) + '</span>' +
              '</div></div></div>' +
              '<p class="text-cafe-text leading-relaxed">' + escapeHtml(review.comment) + '</p>' +
              '</div>';
          }).join('');
        }

        // Render pagination
        function renderPagination(pagination) {
          var container = document.getElementById('reviews-pagination');
          if (pagination.totalPages <= 1) {
            container.classList.add('hidden');
            return;
          }
          container.classList.remove('hidden');

          var html = '';
          if (pagination.hasPrev) {
            html += '<button onclick="window.reviewsLoadPage(' + (pagination.page - 1) + ')" class="px-4 py-2 rounded-lg bg-cafe-beige hover:bg-cafe-latte transition-colors"><i class="fas fa-chevron-left"></i></button>';
          }
          
          for (var i = 1; i <= pagination.totalPages; i++) {
            var active = i === pagination.page ? 'bg-cafe-wood text-white' : 'bg-cafe-beige hover:bg-cafe-latte';
            html += '<button onclick="window.reviewsLoadPage(' + i + ')" class="px-4 py-2 rounded-lg ' + active + ' transition-colors">' + i + '</button>';
          }

          if (pagination.hasNext) {
            html += '<button onclick="window.reviewsLoadPage(' + (pagination.page + 1) + ')" class="px-4 py-2 rounded-lg bg-cafe-beige hover:bg-cafe-latte transition-colors"><i class="fas fa-chevron-right"></i></button>';
          }

          container.innerHTML = html;
        }

        // Helper functions
        function renderStars(rating) {
          var html = '';
          for (var i = 0; i < 5; i++) {
            html += '<i class="fas fa-star ' + (i < rating ? 'text-yellow-400' : 'text-gray-300') + '"></i>';
          }
          return html;
        }

        function formatDate(dateStr) {
          var date = new Date(dateStr);
          return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        function escapeHtml(text) {
          var div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        // Form handling
        var formContainer = document.getElementById('review-form-container');
        var form = document.getElementById('review-form');
        var successMsg = document.getElementById('review-success');
        var starBtns = document.querySelectorAll('.star-btn');
        var ratingInput = document.getElementById('rating-input');
        var commentInput = form.querySelector('textarea[name="comment"]');
        var charCount = document.getElementById('char-count');

        // Show/hide form
        document.getElementById('btn-write-review').addEventListener('click', function() {
          formContainer.classList.remove('hidden');
          form.classList.remove('hidden');
          successMsg.classList.add('hidden');
          formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        document.getElementById('btn-cancel-review').addEventListener('click', function() {
          formContainer.classList.add('hidden');
          form.reset();
          resetStars();
          charCount.textContent = '0';
        });

        // Star rating
        starBtns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            var rating = parseInt(btn.dataset.rating);
            ratingInput.value = rating;
            starBtns.forEach(function(b, i) {
              b.classList.toggle('active', i < rating);
            });
          });
        });

        function resetStars() {
          ratingInput.value = '';
          starBtns.forEach(function(b) { b.classList.remove('active'); });
        }

        // Character count
        commentInput.addEventListener('input', function() {
          charCount.textContent = commentInput.value.length;
        });

        // Form submit
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          if (!ratingInput.value) {
            alert('評価を選択してください');
            return;
          }

          var formData = new FormData(form);
          var data = {
            courseId: formData.get('courseId'),
            reviewerName: formData.get('reviewerName'),
            reviewerEmail: formData.get('reviewerEmail'),
            rating: parseInt(formData.get('rating')),
            comment: formData.get('comment')
          };

          fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          .then(function(res) {
            return res.json().then(function(result) {
              if (res.ok) {
                form.classList.add('hidden');
                successMsg.classList.remove('hidden');
                form.reset();
                resetStars();
                charCount.textContent = '0';
              } else {
                alert(result.error || 'エラーが発生しました');
              }
            });
          })
          .catch(function(err) {
            alert('送信に失敗しました。もう一度お試しください。');
          });
        });

        // Expose for pagination
        window.reviewsLoadPage = loadReviews;

        // Initial load
        loadReviews();
      })();
    </script>
  `

  return renderLayout(course.title, content, 'courses')
}
