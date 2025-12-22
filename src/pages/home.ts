import { renderLayout } from '../components/layout'
import { Course, BlogPost } from '../data'

export const renderHomePage = (featuredCourses: Course[], recentPosts: BlogPost[]) => {
  const content = `
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 gradient-cafe opacity-95"></div>
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div class="text-center">
          <div class="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <i class="fas fa-sparkles text-yellow-300 mr-2"></i>
            <span class="text-white text-sm">新規登録で初回10%OFF</span>
          </div>
          <h1 class="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            AIスキルを、<br class="md:hidden">カフェで学ぶように。
          </h1>
          <p class="text-lg md:text-xl text-cafe-cream/90 mb-8 max-w-2xl mx-auto">
            mirAIcafeは、リラックスした雰囲気でAIスキルを身につけられる<br class="hidden md:inline">
            オンライン学習プラットフォームです。
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/courses" class="btn-cafe inline-flex items-center justify-center bg-white text-cafe-brown px-8 py-4 rounded-full font-bold hover:bg-cafe-cream">
              <i class="fas fa-book-open mr-2"></i>講座を探す
            </a>
            <a href="/reservation" class="btn-cafe inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white/10">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約
            </a>
          </div>
        </div>
      </div>
      
      <!-- Decorative coffee cup -->
      <div class="absolute -bottom-10 -right-10 w-40 h-40 opacity-10">
        <i class="fas fa-mug-hot text-white" style="font-size: 10rem;"></i>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl font-bold text-cafe-darkBrown mb-4">mirAIcafeの特徴</h2>
          <p class="text-cafe-mocha">温かいカフェのような学習体験をお届けします</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="fas fa-user-friends text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">少人数制</h3>
            <p class="text-cafe-mocha text-sm">最大10名の少人数制で、一人ひとりに寄り添った丁寧な指導を行います。</p>
          </div>
          
          <div class="text-center p-6">
            <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="fas fa-laptop-house text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">完全オンライン</h3>
            <p class="text-cafe-mocha text-sm">自宅やカフェなど、お好きな場所から参加できます。移動時間ゼロで効率的。</p>
          </div>
          
          <div class="text-center p-6">
            <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="fas fa-certificate text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">修了証明</h3>
            <p class="text-cafe-mocha text-sm">講座修了時にデジタル修了証を発行。スキルの証明にご活用いただけます。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="font-display text-3xl font-bold text-cafe-darkBrown">人気の講座</h2>
            <p class="text-cafe-mocha mt-2">今月のおすすめ講座をご紹介</p>
          </div>
          <a href="/courses" class="hidden md:inline-flex items-center text-cafe-caramel hover:text-cafe-brown font-medium">
            すべての講座を見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${featuredCourses.map(course => `
            <div class="card-hover bg-white rounded-2xl overflow-hidden shadow-md">
              <div class="aspect-video bg-cafe-latte relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
                <div class="absolute top-4 left-4">
                  <span class="bg-cafe-caramel text-white text-xs font-bold px-3 py-1 rounded-full">${course.level}</span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-cafe-mocha mb-2">
                  <i class="fas fa-clock mr-2"></i>${course.duration}
                  <span class="mx-2">•</span>
                  <i class="fas fa-tag mr-2"></i>${course.category}
                </div>
                <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">${course.title}</h3>
                <p class="text-cafe-mocha text-sm mb-4 line-clamp-2">${course.description}</p>
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-cafe-brown">¥${course.price.toLocaleString()}</span>
                  <a href="/courses/${course.id}" class="btn-cafe bg-cafe-caramel text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-cafe-brown">
                    詳細を見る
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="text-center mt-8 md:hidden">
          <a href="/courses" class="inline-flex items-center text-cafe-caramel hover:text-cafe-brown font-medium">
            すべての講座を見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl font-bold text-cafe-darkBrown mb-4">ご利用の流れ</h2>
          <p class="text-cafe-mocha">簡単3ステップでAI学習をスタート</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="relative">
            <div class="bg-cafe-cream rounded-2xl p-8 text-center relative z-10">
              <div class="w-12 h-12 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">1</div>
              <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">講座を選ぶ</h3>
              <p class="text-cafe-mocha text-sm">目的やレベルに合わせて、お好みの講座を選択してください。</p>
            </div>
            <div class="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
              <i class="fas fa-chevron-right text-cafe-caramel text-2xl"></i>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-cafe-cream rounded-2xl p-8 text-center relative z-10">
              <div class="w-12 h-12 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">2</div>
              <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">日程を予約</h3>
              <p class="text-cafe-mocha text-sm">カレンダーから都合の良い日程を選んで予約します。</p>
            </div>
            <div class="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
              <i class="fas fa-chevron-right text-cafe-caramel text-2xl"></i>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-cafe-cream rounded-2xl p-8 text-center relative z-10">
              <div class="w-12 h-12 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">3</div>
              <h3 class="text-xl font-bold text-cafe-darkBrown mb-2">決済して参加</h3>
              <p class="text-cafe-mocha text-sm">安全なStripe決済後、オンラインで講座に参加できます。</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <a href="/reservation" class="btn-cafe inline-flex items-center justify-center gradient-cafe text-white px-8 py-4 rounded-full font-bold shadow-lg">
            <i class="fas fa-calendar-check mr-2"></i>今すぐ予約する
          </a>
        </div>
      </div>
    </section>

    <!-- Blog Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="font-display text-3xl font-bold text-cafe-darkBrown">AI学習ブログ</h2>
            <p class="text-cafe-mocha mt-2">最新のAI情報をお届け</p>
          </div>
          <a href="/blog" class="hidden md:inline-flex items-center text-cafe-caramel hover:text-cafe-brown font-medium">
            すべての記事を見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${recentPosts.map(post => `
            <a href="/blog/${post.id}" class="card-hover bg-white rounded-2xl overflow-hidden shadow-md block">
              <div class="aspect-video bg-cafe-latte overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-cafe-mocha mb-2">
                  <span class="bg-cafe-latte text-cafe-brown text-xs font-medium px-2 py-1 rounded">${post.category}</span>
                  <span class="mx-2">•</span>
                  <i class="fas fa-clock mr-1"></i>${post.readTime}
                </div>
                <h3 class="text-lg font-bold text-cafe-darkBrown mb-2 line-clamp-2">${post.title}</h3>
                <p class="text-cafe-mocha text-sm line-clamp-2">${post.excerpt}</p>
              </div>
            </a>
          `).join('')}
        </div>
        
        <div class="text-center mt-8 md:hidden">
          <a href="/blog" class="inline-flex items-center text-cafe-caramel hover:text-cafe-brown font-medium">
            すべての記事を見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-cafe-espresso">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center bg-cafe-caramel/20 rounded-full px-4 py-2 mb-6">
          <i class="fas fa-gift text-cafe-caramel mr-2"></i>
          <span class="text-cafe-cream text-sm">期間限定キャンペーン実施中</span>
        </div>
        <h2 class="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          AIスキルで、未来を切り拓こう
        </h2>
        <p class="text-cafe-latte/80 mb-8">
          まずは気軽に、入門講座から始めてみませんか？<br>
          あなたのAI学習を全力でサポートします。
        </p>
        <a href="/courses" class="btn-cafe inline-flex items-center justify-center bg-cafe-caramel text-white px-8 py-4 rounded-full font-bold hover:bg-cafe-brown">
          <i class="fas fa-rocket mr-2"></i>講座を探す
        </a>
      </div>
    </section>
  `

  return renderLayout('ホーム', content, 'home')
}
