import { renderLayout } from '../components/layout'
import { Course } from '../data'

export const renderCoursesPage = (courses: Course[]) => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-cafe py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl font-bold text-white mb-4">講座一覧</h1>
        <p class="text-cafe-cream/90">目的やレベルに合わせて、最適な講座をお選びください</p>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="py-8 bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-cafe-mocha font-medium">絞り込み:</span>
          <button class="filter-btn active bg-cafe-caramel text-white px-4 py-2 rounded-full text-sm font-medium transition-all" data-filter="all">
            すべて
          </button>
          <button class="filter-btn bg-cafe-cream text-cafe-brown px-4 py-2 rounded-full text-sm font-medium hover:bg-cafe-caramel hover:text-white transition-all" data-filter="初級">
            初級
          </button>
          <button class="filter-btn bg-cafe-cream text-cafe-brown px-4 py-2 rounded-full text-sm font-medium hover:bg-cafe-caramel hover:text-white transition-all" data-filter="中級">
            中級
          </button>
        </div>
      </div>
    </section>

    <!-- Courses Grid -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="courses-grid">
          ${courses.map(course => `
            <div class="card-hover bg-white rounded-2xl overflow-hidden shadow-md course-card" data-level="${course.level}">
              <div class="aspect-video bg-cafe-latte relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="bg-cafe-caramel text-white text-xs font-bold px-3 py-1 rounded-full">${course.level}</span>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="bg-white/90 text-cafe-brown text-xs font-bold px-3 py-1 rounded-full">
                    <i class="fas fa-clock mr-1"></i>${course.duration}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-cafe-mocha mb-2">
                  <i class="fas fa-tag mr-2"></i>${course.category}
                  <span class="mx-2">•</span>
                  <i class="fas fa-user mr-2"></i>${course.instructor}
                </div>
                <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">${course.title}</h3>
                <p class="text-cafe-mocha text-sm mb-4 line-clamp-2">${course.description}</p>
                
                <!-- Features Preview -->
                <div class="flex flex-wrap gap-2 mb-4">
                  ${course.features.slice(0, 2).map(feature => `
                    <span class="bg-cafe-cream text-cafe-brown text-xs px-2 py-1 rounded">${feature}</span>
                  `).join('')}
                  ${course.features.length > 2 ? `<span class="text-cafe-mocha text-xs">+${course.features.length - 2}</span>` : ''}
                </div>
                
                <div class="flex items-center justify-between pt-4 border-t border-cafe-cream">
                  <span class="text-2xl font-bold text-cafe-brown">¥${course.price.toLocaleString()}</span>
                  <div class="flex gap-2">
                    <a href="/courses/${course.id}" class="btn-cafe bg-cafe-cream text-cafe-brown px-4 py-2 rounded-full text-sm font-medium hover:bg-cafe-latte">
                      詳細
                    </a>
                    <a href="/reservation?course=${course.id}" class="btn-cafe bg-cafe-caramel text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-cafe-brown">
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
    <section class="py-12 bg-cafe-latte">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="font-display text-2xl font-bold text-cafe-darkBrown mb-4">
          どの講座を選べばいいかわからない？
        </h2>
        <p class="text-cafe-mocha mb-6">
          お気軽にお問い合わせください。あなたに最適な講座をご提案いたします。
        </p>
        <a href="/contact" class="btn-cafe inline-flex items-center justify-center gradient-cafe text-white px-6 py-3 rounded-full font-bold shadow-lg">
          <i class="fas fa-envelope mr-2"></i>相談する
        </a>
      </div>
    </section>

    <script>
      // Filter functionality
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          // Update active state
          document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active', 'bg-cafe-caramel', 'text-white');
            b.classList.add('bg-cafe-cream', 'text-cafe-brown');
          });
          this.classList.remove('bg-cafe-cream', 'text-cafe-brown');
          this.classList.add('active', 'bg-cafe-caramel', 'text-white');
          
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
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex items-center gap-2 mb-2">
            <span class="bg-cafe-caramel text-white text-sm font-bold px-3 py-1 rounded-full">${course.level}</span>
            <span class="bg-white/90 text-cafe-brown text-sm font-bold px-3 py-1 rounded-full">${course.category}</span>
          </div>
          <h1 class="font-display text-3xl md:text-4xl font-bold text-white">${course.title}</h1>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Description -->
            <div class="bg-white rounded-2xl p-8 shadow-md">
              <h2 class="text-2xl font-bold text-cafe-darkBrown mb-4">
                <i class="fas fa-info-circle text-cafe-caramel mr-2"></i>講座概要
              </h2>
              <p class="text-cafe-mocha leading-relaxed">${course.longDescription}</p>
            </div>

            <!-- Features -->
            <div class="bg-white rounded-2xl p-8 shadow-md">
              <h2 class="text-2xl font-bold text-cafe-darkBrown mb-4">
                <i class="fas fa-check-circle text-cafe-caramel mr-2"></i>学べる内容
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${course.features.map(feature => `
                  <div class="flex items-start">
                    <div class="w-8 h-8 gradient-cafe rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <i class="fas fa-check text-white text-sm"></i>
                    </div>
                    <span class="text-cafe-mocha">${feature}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Instructor -->
            <div class="bg-white rounded-2xl p-8 shadow-md">
              <h2 class="text-2xl font-bold text-cafe-darkBrown mb-4">
                <i class="fas fa-user text-cafe-caramel mr-2"></i>講師紹介
              </h2>
              <div class="flex items-center">
                <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mr-4">
                  <i class="fas fa-user text-white text-2xl"></i>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-cafe-darkBrown">${course.instructor}</h3>
                  <p class="text-cafe-mocha text-sm">mirAIcafe認定講師</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl p-6 shadow-md sticky top-24">
              <div class="text-center mb-6">
                <span class="text-sm text-cafe-mocha">受講料</span>
                <p class="text-4xl font-bold text-cafe-brown">¥${course.price.toLocaleString()}</p>
                <span class="text-sm text-cafe-mocha">（税込）</span>
              </div>

              <div class="space-y-4 mb-6">
                <div class="flex items-center text-cafe-mocha">
                  <i class="fas fa-clock w-8 text-cafe-caramel"></i>
                  <span>${course.duration}</span>
                </div>
                <div class="flex items-center text-cafe-mocha">
                  <i class="fas fa-laptop w-8 text-cafe-caramel"></i>
                  <span>オンライン開催</span>
                </div>
                <div class="flex items-center text-cafe-mocha">
                  <i class="fas fa-users w-8 text-cafe-caramel"></i>
                  <span>少人数制（最大10名）</span>
                </div>
                <div class="flex items-center text-cafe-mocha">
                  <i class="fas fa-certificate w-8 text-cafe-caramel"></i>
                  <span>修了証発行あり</span>
                </div>
              </div>

              <a href="/reservation?course=${course.id}" class="btn-cafe block w-full gradient-cafe text-white text-center py-4 rounded-full font-bold shadow-lg">
                <i class="fas fa-calendar-check mr-2"></i>日程を選んで予約
              </a>

              <div class="mt-4 text-center">
                <a href="/contact" class="text-cafe-caramel hover:text-cafe-brown text-sm">
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
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-2xl font-bold text-cafe-darkBrown mb-6">他の講座を見る</h2>
        <div class="text-center">
          <a href="/courses" class="btn-cafe inline-flex items-center justify-center bg-cafe-cream text-cafe-brown px-6 py-3 rounded-full font-medium hover:bg-cafe-latte">
            <i class="fas fa-book-open mr-2"></i>講座一覧へ
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout(course.title, content, 'courses')
}
