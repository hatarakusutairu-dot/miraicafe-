import { renderLayout } from '../components/layout'
import { Course } from '../data'

export const renderCoursesPage = (courses: Course[]) => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-hero relative overflow-hidden py-16">
      <div class="wave-bg opacity-50"></div>
      <div class="wave-bg wave-bg-2 opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block bg-white/70 backdrop-blur-sm text-character-green font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas fa-book-open mr-2"></i>全6講座
        </span>
        <h1 class="font-display text-4xl font-bold text-greenhouse-text mb-4">講座一覧</h1>
        <p class="text-greenhouse-textLight max-w-xl mx-auto">目的やレベルに合わせて、最適な講座をお選びください</p>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="py-6 bg-white border-b border-greenhouse-beige sticky top-16 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-greenhouse-textLight font-medium">絞り込み:</span>
          <button class="filter-btn active gradient-button text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm" data-filter="all">
            すべて
          </button>
          <button class="filter-btn bg-greenhouse-beige text-greenhouse-text px-5 py-2 rounded-full text-sm font-medium hover:bg-character-green hover:text-white transition-all" data-filter="初級">
            <i class="fas fa-seedling mr-1"></i>初級
          </button>
          <button class="filter-btn bg-greenhouse-beige text-greenhouse-text px-5 py-2 rounded-full text-sm font-medium hover:bg-character-orange hover:text-white transition-all" data-filter="中級">
            <i class="fas fa-leaf mr-1"></i>中級
          </button>
        </div>
      </div>
    </section>

    <!-- Courses Grid -->
    <section class="py-12 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="courses-grid">
          ${courses.map((course, index) => {
            const colorClass = index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'pink'
            return `
            <div class="card-hover bg-white overflow-hidden shadow-md course-card" data-level="${course.level}">
              <div class="aspect-video bg-greenhouse-beige relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="bg-character-${colorClass} text-white text-xs font-bold px-3 py-1 rounded-full shadow">${course.level}</span>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="bg-white/90 text-greenhouse-text text-xs font-bold px-3 py-1 rounded-full shadow">
                    <i class="fas fa-clock mr-1"></i>${course.duration}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-greenhouse-textLight mb-2">
                  <i class="fas fa-tag mr-2 text-character-${colorClass}"></i>${course.category}
                  <span class="mx-2">•</span>
                  <i class="fas fa-user mr-2 text-character-${colorClass}"></i>${course.instructor}
                </div>
                <h3 class="text-xl font-bold text-greenhouse-text mb-2">${course.title}</h3>
                <p class="text-greenhouse-textLight text-sm mb-4 line-clamp-2">${course.description}</p>
                
                <!-- Features Preview -->
                <div class="flex flex-wrap gap-2 mb-4">
                  ${course.features.slice(0, 2).map(feature => `
                    <span class="bg-greenhouse-sage/30 text-character-green text-xs px-2 py-1 rounded">${feature}</span>
                  `).join('')}
                  ${course.features.length > 2 ? `<span class="text-greenhouse-textLight text-xs">+${course.features.length - 2}</span>` : ''}
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-greenhouse-beige">
                  <span class="text-2xl font-bold text-character-green">¥${course.price.toLocaleString()}</span>
                  <div class="flex gap-2">
                    <a href="/courses/${course.id}" class="btn-primary bg-greenhouse-beige text-greenhouse-text px-4 py-2 rounded-full text-sm font-medium hover:bg-greenhouse-sage transition-colors">
                      詳細
                    </a>
                    <a href="/reservation?course=${course.id}" class="btn-primary gradient-button text-white px-4 py-2 rounded-full text-sm font-medium">
                      予約
                    </a>
                  </div>
                </div>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-gradient-to-br from-greenhouse-sage/20 to-greenhouse-sky/20 rounded-3xl p-8 border border-greenhouse-sage/30">
          <div class="w-16 h-16 gradient-button rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-question text-white text-2xl"></i>
          </div>
          <h2 class="font-display text-2xl font-bold text-greenhouse-text mb-4">
            どの講座を選べばいいかわからない？
          </h2>
          <p class="text-greenhouse-textLight mb-6">
            お気軽にお問い合わせください。あなたに最適な講座をご提案いたします。
          </p>
          <a href="/contact" class="btn-primary inline-flex items-center justify-center gradient-button text-white px-6 py-3 rounded-full font-bold shadow-lg">
            <i class="fas fa-envelope mr-2"></i>相談する
          </a>
        </div>
      </div>
    </section>

    <script>
      // Filter functionality
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          // Update active state
          document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active', 'gradient-button', 'text-white', 'shadow-sm');
            b.classList.add('bg-greenhouse-beige', 'text-greenhouse-text');
          });
          this.classList.remove('bg-greenhouse-beige', 'text-greenhouse-text');
          this.classList.add('active', 'gradient-button', 'text-white', 'shadow-sm');
          
          // Filter courses
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
        <div class="absolute inset-0 bg-gradient-to-t from-greenhouse-text/80 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-character-green text-white text-sm font-bold px-3 py-1 rounded-full">${course.level}</span>
            <span class="bg-white/90 text-greenhouse-text text-sm font-bold px-3 py-1 rounded-full">${course.category}</span>
          </div>
          <h1 class="font-display text-3xl md:text-4xl font-bold text-white">${course.title}</h1>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-12 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Description -->
            <div class="bg-white rounded-3xl p-8 shadow-md border border-greenhouse-beige">
              <h2 class="text-2xl font-bold text-greenhouse-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-button rounded-full flex items-center justify-center mr-3">
                  <i class="fas fa-info text-white"></i>
                </span>
                講座概要
              </h2>
              <p class="text-greenhouse-textLight leading-relaxed">${course.longDescription}</p>
            </div>

            <!-- Features -->
            <div class="bg-white rounded-3xl p-8 shadow-md border border-greenhouse-beige">
              <h2 class="text-2xl font-bold text-greenhouse-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-button-warm rounded-full flex items-center justify-center mr-3">
                  <i class="fas fa-check text-white"></i>
                </span>
                学べる内容
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${course.features.map((feature, index) => `
                  <div class="flex items-start bg-greenhouse-sage/10 rounded-xl p-4">
                    <div class="w-8 h-8 bg-character-${index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'pink'}/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i class="fas fa-check text-character-${index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'pink'} text-sm"></i>
                    </div>
                    <span class="text-greenhouse-text">${feature}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Instructor -->
            <div class="bg-white rounded-3xl p-8 shadow-md border border-greenhouse-beige">
              <h2 class="text-2xl font-bold text-greenhouse-text mb-4 flex items-center">
                <span class="w-10 h-10 bg-gradient-to-br from-character-pink to-pink-400 rounded-full flex items-center justify-center mr-3">
                  <i class="fas fa-user text-white"></i>
                </span>
                講師紹介
              </h2>
              <div class="flex items-center bg-greenhouse-cream rounded-2xl p-6">
                <div class="w-20 h-20 gradient-button rounded-full flex items-center justify-center mr-6 shadow-lg">
                  <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-greenhouse-text">${course.instructor}</h3>
                  <p class="text-character-green text-sm font-medium">mirAIcafe認定講師</p>
                  <p class="text-greenhouse-textLight text-sm mt-2">AI分野の専門家として、多くの受講生を指導してきた経験豊富な講師です。</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl p-6 shadow-md sticky top-24 border border-greenhouse-beige">
              <div class="text-center mb-6 pb-6 border-b border-greenhouse-beige">
                <span class="text-sm text-greenhouse-textLight">受講料</span>
                <p class="text-4xl font-bold text-character-green">¥${course.price.toLocaleString()}</p>
                <span class="text-sm text-greenhouse-textLight">（税込）</span>
              </div>

              <div class="space-y-4 mb-6">
                <div class="flex items-center text-greenhouse-text bg-greenhouse-cream rounded-xl p-3">
                  <i class="fas fa-clock w-8 text-character-green"></i>
                  <span>${course.duration}</span>
                </div>
                <div class="flex items-center text-greenhouse-text bg-greenhouse-cream rounded-xl p-3">
                  <i class="fas fa-laptop w-8 text-character-orange"></i>
                  <span>オンライン開催</span>
                </div>
                <div class="flex items-center text-greenhouse-text bg-greenhouse-cream rounded-xl p-3">
                  <i class="fas fa-users w-8 text-character-pink"></i>
                  <span>少人数制（最大10名）</span>
                </div>
                <div class="flex items-center text-greenhouse-text bg-greenhouse-cream rounded-xl p-3">
                  <i class="fas fa-certificate w-8 text-character-green"></i>
                  <span>修了証発行あり</span>
                </div>
              </div>

              <a href="/reservation?course=${course.id}" class="btn-primary block w-full gradient-button text-white text-center py-4 rounded-full font-bold shadow-lg">
                <i class="fas fa-calendar-check mr-2"></i>日程を選んで予約
              </a>

              <div class="mt-4 text-center">
                <a href="/contact" class="text-character-green hover:text-green-600 text-sm transition-colors">
                  <i class="fas fa-question-circle mr-1"></i>ご質問はこちら
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Courses -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="font-display text-2xl font-bold text-greenhouse-text mb-6">他の講座を見る</h2>
        <a href="/courses" class="btn-primary inline-flex items-center justify-center bg-greenhouse-beige text-greenhouse-text px-6 py-3 rounded-full font-medium hover:bg-greenhouse-sage transition-colors">
          <i class="fas fa-book-open mr-2"></i>講座一覧へ
        </a>
      </div>
    </section>
  `

  return renderLayout(course.title, content, 'courses')
}
