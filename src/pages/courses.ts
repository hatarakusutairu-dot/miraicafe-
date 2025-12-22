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

    <!-- Filter Section -->
    <section class="py-4 bg-white/80 backdrop-blur-sm sticky top-20 z-40 border-b border-future-sky">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-future-textLight font-medium">絞り込み:</span>
          <button class="filter-btn active gradient-ai text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm" data-filter="all">
            すべて
          </button>
          <button class="filter-btn glass text-future-text px-5 py-2 rounded-full text-sm font-medium hover:bg-ai-cyan/10 transition-all border border-transparent hover:border-ai-cyan/30" data-filter="初級">
            <i class="fas fa-seedling mr-1 text-ai-cyan"></i>初級
          </button>
          <button class="filter-btn glass text-future-text px-5 py-2 rounded-full text-sm font-medium hover:bg-ai-blue/10 transition-all border border-transparent hover:border-ai-blue/30" data-filter="中級">
            <i class="fas fa-leaf mr-1 text-ai-blue"></i>中級
          </button>
        </div>
      </div>
    </section>

    <!-- Courses Grid -->
    <section class="py-16 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="courses-grid">
          ${courses.map((course, index) => `
            <div class="card-hover bg-white overflow-hidden shadow-lg border border-future-sky/50 course-card" data-level="${course.level}">
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
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active', 'gradient-ai', 'text-white', 'shadow-sm');
            b.classList.add('glass', 'text-future-text');
          });
          this.classList.remove('glass', 'text-future-text');
          this.classList.add('active', 'gradient-ai', 'text-white', 'shadow-sm');
          
          const filter = this.dataset.filter;
          document.querySelectorAll('.course-card').forEach(card => {
            if (filter === 'all' || card.dataset.level.includes(filter)) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
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
  `

  return renderLayout(course.title, content, 'courses')
}
