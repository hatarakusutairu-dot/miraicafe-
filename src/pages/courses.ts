import { renderLayout } from '../components/layout'
import { Course, Schedule } from '../data'

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
          <div class="flex items-center gap-4 mb-3">
            <!-- Search Bar -->
            <div class="relative w-80 flex-shrink-0">
              <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-future-textLight"></i>
              <input type="text" id="search-input" 
                class="w-full pl-11 pr-10 py-2.5 border border-future-sky rounded-xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light"
                placeholder="講座名で検索...">
              <button id="search-clear" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-future-textLight hover:text-future-text hidden">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Category Filter - Inline -->
            <div class="flex items-center gap-3 flex-wrap" id="category-filters">
              <span class="text-future-textLight font-medium">カテゴリ:</span>
              <button class="filter-btn category-btn active bg-ai-blue text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:bg-ai-blue/90" data-category="all">すべて</button>
              <button class="filter-btn category-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-category="AI基礎">AI基礎</button>
              <button class="filter-btn category-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-category="プログラミング">プログラミング</button>
              <button class="filter-btn category-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-category="データ分析">データ分析</button>
              <button class="filter-btn category-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-category="資格対策">資格対策</button>
              <button class="filter-btn category-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-category="教育者向け">教育者向け</button>
            </div>
          </div>

          <!-- Row 2: Price + Sort + Results -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-6">
              <!-- Price Filter - Inline -->
              <div class="flex items-center gap-3" id="price-filters">
                <span class="text-future-textLight font-medium">価格:</span>
                <button class="filter-btn price-btn active bg-ai-blue text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:bg-ai-blue/90" data-price="all">すべて</button>
                <button class="filter-btn price-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-price="free">無料</button>
                <button class="filter-btn price-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-price="under5000">〜5千円</button>
                <button class="filter-btn price-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-price="under10000">〜1万円</button>
                <button class="filter-btn price-btn bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-medium hover:bg-ai-blue/20 transition-all" data-price="over10000">1万円〜</button>
              </div>

              <!-- Sort Dropdown -->
              <div class="flex items-center gap-2">
                <span class="text-future-textLight font-medium">並び替え:</span>
                <select id="sort-select" class="px-4 py-2 border border-future-sky rounded-xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light text-future-text">
                  <option value="newest">新着順</option>
                  <option value="popular">人気順</option>
                  <option value="price-asc">安い順</option>
                  <option value="price-desc">高い順</option>
                  <option value="rating">評価順</option>
                </select>
              </div>

              <!-- Reset Filters -->
              <button id="reset-filters" class="text-ai-blue font-medium hover:text-ai-purple transition-colors hidden">
                <i class="fas fa-redo mr-1"></i>リセット
              </button>
            </div>

            <!-- Results Count -->
            <p class="text-future-textLight">
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
            <div class="card-hover bg-white overflow-hidden shadow-lg border border-future-sky/50 course-card cursor-pointer rounded-2xl transition-all duration-300 hover:shadow-2xl hover:border-ai-blue/50 hover:-translate-y-1" 
                 data-level="${course.level}" 
                 data-category="${course.category}"
                 data-price="${course.price}"
                 data-title="${course.title}"
                 data-description="${course.description}"
                 data-index="${index}"
                 data-course-id="${course.id}"
                 onclick="window.location.href='/courses/${course.id}'">
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
                    <span class="btn-ai glass text-future-text px-4 py-2 rounded-full text-sm font-medium border border-ai-blue/30 hover:border-ai-blue course-detail-btn" onclick="event.stopPropagation(); window.location.href='/courses/${course.id}'">
                      詳細
                    </span>
                    <a href="/reservation?course=${course.id}" class="btn-ai gradient-ai text-white px-4 py-2 rounded-full text-sm font-medium course-reserve-btn" onclick="event.stopPropagation();">
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
            b.classList.remove('active', 'bg-ai-blue', 'text-white', 'shadow-sm');
            b.classList.add('bg-gray-100', 'text-gray-700');
          });
          this.classList.remove('bg-gray-100', 'text-gray-700');
          this.classList.add('active', 'bg-ai-blue', 'text-white', 'shadow-sm');
          
          currentFilters.category = this.dataset.category;
          applyFilters();
        });
      });

      // Price filter
      priceBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          priceBtns.forEach(function(b) {
            b.classList.remove('active', 'bg-ai-blue', 'text-white', 'shadow-sm');
            b.classList.add('bg-gray-100', 'text-gray-700');
          });
          this.classList.remove('bg-gray-100', 'text-gray-700');
          this.classList.add('active', 'bg-ai-blue', 'text-white', 'shadow-sm');
          
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
          b.classList.remove('active', 'bg-ai-blue', 'text-white', 'shadow-sm', 'bg-gray-100', 'text-gray-700');
          if (i === 0) {
            b.classList.add('active', 'bg-ai-blue', 'text-white', 'shadow-sm');
          } else {
            b.classList.add('bg-gray-100', 'text-gray-700');
          }
        });
        
        priceBtns.forEach(function(b, i) {
          b.classList.remove('active', 'bg-ai-blue', 'text-white', 'shadow-sm', 'bg-gray-100', 'text-gray-700');
          if (i === 0) {
            b.classList.add('active', 'bg-ai-blue', 'text-white', 'shadow-sm');
          } else {
            b.classList.add('bg-gray-100', 'text-gray-700');
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

// 講座詳細ページ（完全リニューアル版）
export const renderCourseDetailPage = (course: Course, schedules: Schedule[], allCourses: Course[]) => {
  // 関連講座（同じカテゴリで自分以外、最大3件）
  const relatedCourses = allCourses
    .filter(c => c.id !== course.id && c.category === course.category)
    .slice(0, 3)
  
  // この講座の日程を取得
  const courseSchedules = schedules.filter(s => s.courseId === course.id)
  
  const content = `
    <!-- Hero Section -->
    <section class="relative">
      <div class="aspect-[3/1] max-h-96 overflow-hidden">
        <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-future-text/90 via-future-text/50 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="gradient-ai text-white text-sm font-bold px-4 py-1.5 rounded-full shadow">${course.level}</span>
            <span class="glass text-future-text text-sm font-bold px-4 py-1.5 rounded-full">${course.category}</span>
            <span class="glass text-future-text text-sm font-bold px-4 py-1.5 rounded-full">
              <i class="fas fa-clock mr-1"></i>${course.duration}
            </span>
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">${course.title}</h1>
          ${course.catchphrase ? `<p class="text-white/80 text-lg">${course.catchphrase}</p>` : ''}
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-10 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Left Column: Main Content -->
          <div class="flex-1 min-w-0 space-y-8">
            
            <!-- 講座概要 -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-info text-white"></i>
                </span>
                この講座について
              </h2>
              <p class="text-future-textLight leading-relaxed">${course.longDescription}</p>
            </div>

            <!-- こんな方におすすめ -->
            ${course.targetAudience && course.targetAudience.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-user-check text-white"></i>
                </span>
                こんな方におすすめ
              </h2>
              <div class="space-y-3">
                ${course.targetAudience.map(item => `
                  <div class="flex items-start">
                    <div class="w-6 h-6 bg-nature-mint rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <i class="fas fa-check text-nature-forest text-xs"></i>
                    </div>
                    <span class="text-future-text">${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- カリキュラム -->
            ${course.curriculum && course.curriculum.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-list-ol text-white"></i>
                </span>
                カリキュラム
              </h2>
              <div class="space-y-4" id="curriculum-accordion">
                ${course.curriculum.map((item, index) => `
                  <div class="curriculum-item border border-future-sky rounded-xl overflow-hidden">
                    <button class="curriculum-toggle w-full flex items-center justify-between p-4 bg-future-light hover:bg-ai-blue/5 transition-colors text-left" data-index="${index}">
                      <div class="flex items-center">
                        <span class="w-8 h-8 gradient-ai rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">${index + 1}</span>
                        <div>
                          <h3 class="font-bold text-future-text">${item.title}</h3>
                          <span class="text-sm text-future-textLight"><i class="fas fa-clock mr-1"></i>${item.duration}</span>
                        </div>
                      </div>
                      <i class="fas fa-chevron-down text-ai-blue transition-transform curriculum-icon"></i>
                    </button>
                    <div class="curriculum-content hidden p-4 pt-0 bg-white">
                      <ul class="space-y-2 ml-11">
                        ${item.contents.map(content => `
                          <li class="flex items-start text-future-textLight">
                            <i class="fas fa-circle text-ai-blue text-xs mr-2 mt-1.5"></i>
                            ${content}
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- 講師紹介 -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-chalkboard-teacher text-white"></i>
                </span>
                講師紹介
              </h2>
              <div class="flex flex-col md:flex-row gap-6">
                <div class="flex-shrink-0">
                  ${course.instructorInfo?.image ? `
                    <img src="${course.instructorInfo.image}" alt="${course.instructor}" class="w-32 h-32 rounded-full object-cover border-4 border-ai-blue/20 shadow-lg mx-auto md:mx-0">
                  ` : `
                    <div class="w-32 h-32 gradient-ai rounded-full flex items-center justify-center shadow-lg mx-auto md:mx-0">
                      <i class="fas fa-user text-white text-4xl"></i>
                    </div>
                  `}
                </div>
                <div class="flex-1 text-center md:text-left">
                  <h3 class="text-xl font-bold text-future-text">${course.instructor}</h3>
                  ${course.instructorInfo?.title ? `<p class="gradient-ai-text font-medium mb-2">${course.instructorInfo.title}</p>` : `<p class="gradient-ai-text font-medium mb-2">mirAIcafe認定講師</p>`}
                  ${course.instructorInfo?.bio ? `<p class="text-future-textLight text-sm leading-relaxed mb-4">${course.instructorInfo.bio}</p>` : ''}
                  ${course.instructorInfo?.specialties && course.instructorInfo.specialties.length > 0 ? `
                    <div class="flex flex-wrap justify-center md:justify-start gap-2">
                      ${course.instructorInfo.specialties.map(s => `<span class="bg-ai-blue/10 text-ai-blue text-xs px-3 py-1 rounded-full">${s}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- これまでの開催の様子（ギャラリー） -->
            ${course.gallery && course.gallery.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-images text-white"></i>
                </span>
                これまでの開催の様子
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${course.gallery.map((img, index) => `
                  <div class="gallery-item cursor-pointer group" data-index="${index}">
                    <div class="aspect-square rounded-xl overflow-hidden">
                      <img src="${img.url}" alt="${img.caption}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">
                    </div>
                    <p class="text-xs text-future-textLight mt-2 text-center">${img.caption}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- 画像モーダル -->
            <div id="gallery-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/90 p-4">
              <button id="modal-close" class="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors">
                <i class="fas fa-times"></i>
              </button>
              <button id="modal-prev" class="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors">
                <i class="fas fa-chevron-left"></i>
              </button>
              <button id="modal-next" class="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors">
                <i class="fas fa-chevron-right"></i>
              </button>
              <div class="max-w-4xl max-h-[80vh]">
                <img id="modal-image" src="" alt="" class="max-w-full max-h-[75vh] object-contain mx-auto">
                <p id="modal-caption" class="text-white text-center mt-4"></p>
              </div>
            </div>
            ` : ''}

            <!-- 受講者の声（レビュー）セクション -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50" id="reviews-section">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-star text-white"></i>
                </span>
                受講者の声・レビュー
              </h2>

              <!-- Review Summary -->
              <div class="mb-6 p-5 bg-future-light rounded-xl">
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <div class="text-center">
                    <div class="text-4xl font-bold gradient-ai-text" id="avg-rating">-</div>
                    <div class="flex justify-center mt-1" id="avg-stars">
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                    </div>
                    <div class="text-future-textLight text-sm mt-1"><span id="total-reviews">0</span>件</div>
                  </div>
                  <div class="flex-1 w-full">
                    <div class="space-y-1">
                      ${[5,4,3,2,1].map(star => `
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-future-textLight w-8">${star}つ星</span>
                          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-${star}" style="width: 0%"></div>
                          </div>
                          <span class="text-xs text-future-textLight w-8 text-right" id="count-${star}">0</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Review List -->
              <div id="reviews-list" class="space-y-4 mb-6">
                <div class="text-center py-6 text-future-textLight">
                  <i class="fas fa-spinner fa-spin text-xl mb-2"></i>
                  <p class="text-sm">レビューを読み込み中...</p>
                </div>
              </div>

              <!-- Pagination -->
              <div id="reviews-pagination" class="flex justify-center gap-2 mb-6 hidden"></div>

              <!-- Write Review Button -->
              <div class="text-center">
                <button id="btn-write-review" class="btn-ai gradient-ai text-white px-6 py-3 rounded-full font-medium shadow-lg">
                  <i class="fas fa-pen mr-2"></i>レビューを書く
                </button>
              </div>

              <!-- Review Form -->
              <div id="review-form-container" class="hidden mt-6 p-5 bg-future-light rounded-xl">
                <h3 class="text-lg font-bold text-future-text mb-4 flex items-center">
                  <i class="fas fa-edit text-ai-blue mr-2"></i>レビューを投稿
                </h3>
                <form id="review-form" class="space-y-4">
                  <input type="hidden" name="courseId" value="${course.id}">
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-future-text text-sm font-medium mb-1">お名前（ニックネーム可）<span class="text-red-500">*</span></label>
                      <input type="text" name="reviewerName" required maxlength="50"
                        class="w-full px-4 py-2.5 rounded-xl border border-future-sky focus:border-ai-blue focus:ring-2 focus:ring-ai-blue/20 outline-none transition-all"
                        placeholder="山田 太郎">
                    </div>
                    <div>
                      <label class="block text-future-text text-sm font-medium mb-1">メールアドレス（非公開）<span class="text-red-500">*</span></label>
                      <input type="email" name="reviewerEmail" required
                        class="w-full px-4 py-2.5 rounded-xl border border-future-sky focus:border-ai-blue focus:ring-2 focus:ring-ai-blue/20 outline-none transition-all"
                        placeholder="example@email.com">
                    </div>
                  </div>

                  <div>
                    <label class="block text-future-text text-sm font-medium mb-1">評価<span class="text-red-500">*</span></label>
                    <div class="flex gap-1" id="star-rating">
                      ${[1,2,3,4,5].map(i => `<button type="button" class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${i}"><i class="fas fa-star"></i></button>`).join('')}
                    </div>
                    <input type="hidden" name="rating" id="rating-input" required>
                  </div>

                  <div>
                    <label class="block text-future-text text-sm font-medium mb-1">コメント<span class="text-red-500">*</span></label>
                    <textarea name="comment" required maxlength="500" rows="4"
                      class="w-full px-4 py-2.5 rounded-xl border border-future-sky focus:border-ai-blue focus:ring-2 focus:ring-ai-blue/20 outline-none transition-all resize-none"
                      placeholder="講座の感想をお聞かせください..."></textarea>
                    <div class="text-right text-xs text-future-textLight mt-1"><span id="char-count">0</span>/500</div>
                  </div>

                  <div class="flex gap-3">
                    <button type="submit" class="btn-ai gradient-ai text-white flex-1 py-2.5 rounded-xl font-medium">
                      <i class="fas fa-paper-plane mr-2"></i>投稿する
                    </button>
                    <button type="button" id="btn-cancel-review" class="glass text-future-text flex-1 py-2.5 rounded-xl font-medium border border-future-sky hover:bg-gray-50">
                      キャンセル
                    </button>
                  </div>
                </form>

                <div id="review-success" class="hidden text-center py-6">
                  <div class="w-14 h-14 bg-nature-mint rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-check text-nature-forest text-xl"></i>
                  </div>
                  <h4 class="text-lg font-bold text-future-text mb-1">ありがとうございます！</h4>
                  <p class="text-future-textLight text-sm">レビューは承認後に表示されます。</p>
                </div>
              </div>
            </div>

            <!-- よくある質問（FAQ） -->
            ${course.faq && course.faq.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-question text-white"></i>
                </span>
                よくある質問
              </h2>
              <div class="space-y-3" id="faq-accordion">
                ${course.faq.map((item, index) => `
                  <div class="faq-item border border-future-sky rounded-xl overflow-hidden">
                    <button class="faq-toggle w-full flex items-center justify-between p-4 hover:bg-future-light transition-colors text-left" data-index="${index}">
                      <div class="flex items-start">
                        <span class="w-7 h-7 bg-ai-blue/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-ai-blue font-bold text-sm">Q</span>
                        <span class="font-medium text-future-text">${item.question}</span>
                      </div>
                      <i class="fas fa-chevron-down text-ai-blue transition-transform faq-icon ml-2 flex-shrink-0"></i>
                    </button>
                    <div class="faq-content hidden p-4 pt-0 bg-white">
                      <div class="flex items-start ml-10">
                        <span class="w-7 h-7 bg-nature-mint rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-nature-forest font-bold text-sm">A</span>
                        <p class="text-future-textLight">${item.answer}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- 開催日程 -->
            ${courseSchedules.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50" id="schedule-section">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-calendar-alt text-white"></i>
                </span>
                開催日程
              </h2>
              <div class="space-y-3">
                ${courseSchedules.map(schedule => {
                  const date = new Date(schedule.date)
                  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
                  const remaining = schedule.capacity - schedule.enrolled
                  const isFull = remaining <= 0
                  const isAlmostFull = remaining <= 3 && remaining > 0
                  
                  return `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-future-sky rounded-xl ${isFull ? 'bg-gray-50' : 'hover:border-ai-blue/50'} transition-colors">
                      <div class="flex items-center mb-3 sm:mb-0">
                        <div class="w-14 h-14 bg-future-light rounded-xl flex flex-col items-center justify-center mr-4">
                          <span class="text-lg font-bold text-future-text">${date.getDate()}</span>
                          <span class="text-xs text-future-textLight">${date.getMonth() + 1}月</span>
                        </div>
                        <div>
                          <p class="font-bold text-future-text">${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${dayOfWeek}）</p>
                          <p class="text-sm text-future-textLight">
                            <i class="fas fa-clock mr-1"></i>${schedule.startTime} - ${schedule.endTime}
                            <span class="ml-2"><i class="fas fa-map-marker-alt mr-1"></i>${schedule.location}</span>
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 sm:ml-4">
                        ${isFull ? `
                          <span class="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">満席</span>
                        ` : `
                          <span class="text-sm ${isAlmostFull ? 'text-red-500 font-medium' : 'text-future-textLight'}">
                            残席 ${remaining}名
                          </span>
                          <a href="/reservation?course=${course.id}&schedule=${schedule.id}" 
                             class="btn-ai gradient-ai text-white px-5 py-2 rounded-full text-sm font-medium shadow">
                            予約する
                          </a>
                        `}
                      </div>
                    </div>
                  `
                }).join('')}
              </div>
            </div>
            ` : ''}

            <!-- 関連講座 -->
            ${relatedCourses.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-th-large text-white"></i>
                </span>
                関連講座
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${relatedCourses.map(related => `
                  <a href="/courses/${related.id}" class="card-hover block bg-future-light rounded-xl overflow-hidden border border-future-sky/50">
                    <div class="aspect-video overflow-hidden">
                      <img src="${related.image}" alt="${related.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy">
                    </div>
                    <div class="p-4">
                      <span class="text-xs text-ai-blue font-medium">${related.category}</span>
                      <h3 class="font-bold text-future-text mt-1 line-clamp-2">${related.title}</h3>
                      <p class="text-sm gradient-ai-text font-bold mt-2">¥${related.price.toLocaleString()}</p>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Right Column: Sidebar (Sticky) -->
          <div class="w-full lg:w-80 flex-shrink-0">
            <div class="bg-white rounded-2xl p-6 shadow-lg sticky top-24 border border-future-sky/50">
              
              <!-- 評価サマリー -->
              <div class="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-future-sky">
                <div class="flex text-yellow-400" id="sidebar-stars">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star text-gray-300"></i>
                </div>
                <span class="font-bold text-future-text" id="sidebar-rating">-</span>
                <span class="text-future-textLight text-sm">(<span id="sidebar-reviews">0</span>件)</span>
              </div>

              <!-- 価格 -->
              <div class="text-center mb-6">
                <span class="text-sm text-future-textLight">受講料</span>
                <p class="text-4xl font-bold gradient-ai-text">¥${course.price.toLocaleString()}</p>
                <span class="text-sm text-future-textLight">（税込）</span>
              </div>

              <!-- 講座情報 -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-clock w-8 text-ai-cyan"></i>
                  <span class="text-sm">${course.duration}</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-laptop w-8 text-ai-blue"></i>
                  <span class="text-sm">オンライン開催（Zoom）</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-users w-8 text-ai-purple"></i>
                  <span class="text-sm">少人数制（最大${course.maxCapacity || 10}名）</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-certificate w-8 text-ai-pink"></i>
                  <span class="text-sm">修了証発行あり</span>
                </div>
              </div>

              <!-- 含まれるもの -->
              ${course.includes && course.includes.length > 0 ? `
              <div class="mb-6 pb-6 border-b border-future-sky">
                <p class="text-sm font-medium text-future-text mb-2">受講に含まれるもの</p>
                <ul class="space-y-1.5">
                  ${course.includes.map(item => `
                    <li class="flex items-start text-sm text-future-textLight">
                      <i class="fas fa-check text-nature-forest mr-2 mt-0.5"></i>
                      ${item}
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              <!-- CTAボタン -->
              <a href="/reservation?course=${course.id}" class="btn-ai block w-full gradient-ai text-white text-center py-4 rounded-full font-bold shadow-lg mb-3">
                <i class="fas fa-calendar-check mr-2"></i>日程を選んで予約
              </a>

              <!-- 日程セクションへスクロール -->
              ${courseSchedules.length > 0 ? `
              <button onclick="document.getElementById('schedule-section').scrollIntoView({behavior:'smooth'})" class="block w-full glass text-future-text text-center py-3 rounded-full font-medium border border-future-sky hover:border-ai-blue transition-colors mb-4">
                <i class="fas fa-calendar mr-2"></i>開催日程を見る
              </button>
              ` : ''}

              <!-- キャンセルポリシー -->
              ${course.cancellationPolicy ? `
              <div class="p-4 bg-future-light rounded-xl mb-4">
                <p class="text-xs font-medium text-future-text mb-1">キャンセルポリシー</p>
                <p class="text-xs text-future-textLight">${course.cancellationPolicy}</p>
              </div>
              ` : ''}

              <!-- お問い合わせリンク -->
              <div class="text-center">
                <a href="/contact" class="text-ai-blue hover:text-ai-purple text-sm transition-colors">
                  <i class="fas fa-question-circle mr-1"></i>ご質問はこちら
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="glass rounded-3xl p-8 border border-ai-blue/20">
          <h2 class="text-2xl font-bold text-future-text mb-4">今すぐ学び始めませんか？</h2>
          <p class="text-future-textLight mb-6">${course.catchphrase || course.description}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/reservation?course=${course.id}" class="btn-ai gradient-ai text-white px-8 py-4 rounded-full font-bold shadow-lg">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約する
            </a>
            <a href="/contact" class="glass text-future-text px-8 py-4 rounded-full font-bold border border-future-sky hover:border-ai-blue transition-colors">
              <i class="fas fa-envelope mr-2"></i>まずは相談する
            </a>
          </div>
        </div>
      </div>
    </section>

    <style>
      .star-btn.active { color: #FBBF24; }
      .curriculum-item.open .curriculum-icon { transform: rotate(180deg); }
      .faq-item.open .faq-icon { transform: rotate(180deg); }
    </style>

    <script>
      (function() {
        var courseId = '${course.id}';
        var galleryImages = ${JSON.stringify(course.gallery || [])};
        var currentImageIndex = 0;

        // ===== カリキュラムアコーディオン =====
        document.querySelectorAll('.curriculum-toggle').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var item = this.closest('.curriculum-item');
            var content = item.querySelector('.curriculum-content');
            var isOpen = item.classList.contains('open');
            
            // 他を閉じる
            document.querySelectorAll('.curriculum-item').forEach(function(i) {
              i.classList.remove('open');
              i.querySelector('.curriculum-content').classList.add('hidden');
            });
            
            if (!isOpen) {
              item.classList.add('open');
              content.classList.remove('hidden');
            }
          });
        });
        // 最初のカリキュラムを開く
        var firstCurriculum = document.querySelector('.curriculum-item');
        if (firstCurriculum) {
          firstCurriculum.classList.add('open');
          firstCurriculum.querySelector('.curriculum-content').classList.remove('hidden');
        }

        // ===== FAQアコーディオン =====
        document.querySelectorAll('.faq-toggle').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var item = this.closest('.faq-item');
            var content = item.querySelector('.faq-content');
            var isOpen = item.classList.contains('open');
            
            if (isOpen) {
              item.classList.remove('open');
              content.classList.add('hidden');
            } else {
              item.classList.add('open');
              content.classList.remove('hidden');
            }
          });
        });

        // ===== ギャラリーモーダル =====
        var modal = document.getElementById('gallery-modal');
        var modalImage = document.getElementById('modal-image');
        var modalCaption = document.getElementById('modal-caption');
        
        if (modal && galleryImages.length > 0) {
          document.querySelectorAll('.gallery-item').forEach(function(item) {
            item.addEventListener('click', function() {
              currentImageIndex = parseInt(this.dataset.index);
              showModalImage();
              modal.classList.remove('hidden');
              modal.classList.add('flex');
            });
          });

          document.getElementById('modal-close').addEventListener('click', closeModal);
          modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
          });

          document.getElementById('modal-prev').addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            showModalImage();
          });

          document.getElementById('modal-next').addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            showModalImage();
          });

          function showModalImage() {
            modalImage.src = galleryImages[currentImageIndex].url;
            modalCaption.textContent = galleryImages[currentImageIndex].caption;
          }

          function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }

          // キーボード操作
          document.addEventListener('keydown', function(e) {
            if (!modal.classList.contains('hidden')) {
              if (e.key === 'Escape') closeModal();
              if (e.key === 'ArrowLeft') document.getElementById('modal-prev').click();
              if (e.key === 'ArrowRight') document.getElementById('modal-next').click();
            }
          });
        }

        // ===== レビュー機能 =====
        var currentPage = 1;

        function loadReviews(page) {
          page = page || 1;
          currentPage = page;
          fetch('/api/reviews/' + courseId + '?page=' + page)
            .then(function(res) { return res.json(); })
            .then(function(data) {
              renderSummary(data.stats);
              renderReviews(data.reviews);
              renderPagination(data.pagination);
              updateSidebarRating(data.stats);
            })
            .catch(function(err) {
              console.error('Failed to load reviews:', err);
              document.getElementById('reviews-list').innerHTML = 
                '<p class="text-center text-future-textLight py-6 text-sm">レビューの読み込みに失敗しました</p>';
            });
        }

        function renderSummary(stats) {
          document.getElementById('avg-rating').textContent = stats.average || '-';
          document.getElementById('total-reviews').textContent = stats.total;
          
          var avgStars = document.getElementById('avg-stars');
          avgStars.innerHTML = '';
          for (var i = 1; i <= 5; i++) {
            var star = document.createElement('i');
            star.className = i <= Math.floor(stats.average) ? 'fas fa-star text-yellow-400' :
                           i - 0.5 <= stats.average ? 'fas fa-star-half-alt text-yellow-400' :
                           'fas fa-star text-gray-300';
            avgStars.appendChild(star);
          }

          var total = stats.total || 1;
          [5,4,3,2,1].forEach(function(star) {
            var count = stats.distribution[star] || 0;
            var percent = (count / total) * 100;
            document.getElementById('bar-' + star).style.width = percent + '%';
            document.getElementById('count-' + star).textContent = count;
          });
        }

        function updateSidebarRating(stats) {
          document.getElementById('sidebar-rating').textContent = stats.average || '-';
          document.getElementById('sidebar-reviews').textContent = stats.total;
          
          var sidebarStars = document.getElementById('sidebar-stars');
          sidebarStars.innerHTML = '';
          for (var i = 1; i <= 5; i++) {
            var star = document.createElement('i');
            star.className = i <= Math.floor(stats.average) ? 'fas fa-star' :
                           i - 0.5 <= stats.average ? 'fas fa-star-half-alt' :
                           'fas fa-star text-gray-300';
            if (i <= Math.ceil(stats.average)) star.classList.add('text-yellow-400');
            sidebarStars.appendChild(star);
          }
        }

        function renderReviews(reviews) {
          var container = document.getElementById('reviews-list');
          if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="text-center text-future-textLight py-6 text-sm">まだレビューがありません。最初のレビューを投稿してみませんか？</p>';
            return;
          }

          container.innerHTML = reviews.map(function(review) {
            return '<div class="bg-future-light rounded-xl p-4">' +
              '<div class="flex items-start justify-between mb-2">' +
              '<div>' +
              '<h4 class="font-bold text-future-text text-sm">' + escapeHtml(review.reviewer_name) + '</h4>' +
              '<div class="flex items-center gap-2 mt-0.5">' +
              '<div class="flex text-sm">' + renderStars(review.rating) + '</div>' +
              '<span class="text-xs text-future-textLight">' + formatDate(review.created_at) + '</span>' +
              '</div></div></div>' +
              '<p class="text-future-textLight text-sm">' + escapeHtml(review.comment) + '</p>' +
              '</div>';
          }).join('');
        }

        function renderPagination(pagination) {
          var container = document.getElementById('reviews-pagination');
          if (pagination.totalPages <= 1) {
            container.classList.add('hidden');
            return;
          }
          container.classList.remove('hidden');

          var html = '';
          if (pagination.hasPrev) {
            html += '<button onclick="window.reviewsLoadPage(' + (pagination.page - 1) + ')" class="px-3 py-1.5 rounded-lg bg-future-light hover:bg-ai-blue/10 transition-colors text-sm"><i class="fas fa-chevron-left"></i></button>';
          }
          for (var i = 1; i <= pagination.totalPages; i++) {
            var active = i === pagination.page ? 'gradient-ai text-white' : 'bg-future-light hover:bg-ai-blue/10';
            html += '<button onclick="window.reviewsLoadPage(' + i + ')" class="px-3 py-1.5 rounded-lg ' + active + ' transition-colors text-sm">' + i + '</button>';
          }
          if (pagination.hasNext) {
            html += '<button onclick="window.reviewsLoadPage(' + (pagination.page + 1) + ')" class="px-3 py-1.5 rounded-lg bg-future-light hover:bg-ai-blue/10 transition-colors text-sm"><i class="fas fa-chevron-right"></i></button>';
          }
          container.innerHTML = html;
        }

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

        // Review form handling
        var formContainer = document.getElementById('review-form-container');
        var form = document.getElementById('review-form');
        var successMsg = document.getElementById('review-success');
        var starBtns = document.querySelectorAll('.star-btn');
        var ratingInput = document.getElementById('rating-input');
        var commentInput = form.querySelector('textarea[name="comment"]');
        var charCount = document.getElementById('char-count');

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

        commentInput.addEventListener('input', function() {
          charCount.textContent = commentInput.value.length;
        });

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

        window.reviewsLoadPage = loadReviews;
        loadReviews();
      })();
    </script>
  `

  return renderLayout(course.title, content, 'courses')
}
