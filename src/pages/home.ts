import { renderLayout } from '../components/layout'
import { Course, BlogPost } from '../data'

export const renderHomePage = (featuredCourses: Course[], recentPosts: BlogPost[]) => {
  const content = `
    <!-- Hero Section - Warm Greenhouse Cafe Style -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Background Image with Warm Overlay -->
      <div class="absolute inset-0">
        <img src="/static/greenhouse-bg.jpg" alt="温室カフェ" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-cafe-ivory/95 via-cafe-ivory/80 to-cafe-ivory/40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-cafe-ivory via-transparent to-transparent"></div>
      </div>
      
      <!-- Wood Wave Decoration -->
      <div class="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        <svg viewBox="0 0 1440 120" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.6" d="M0,40L60,45C120,50,240,60,360,65C480,70,600,70,720,60C840,50,960,30,1080,25C1200,20,1320,30,1380,35L1440,40L1440,120L0,120Z"></path>
          <path fill="#B8956A" fill-opacity="0.3" d="M0,70L60,65C120,60,240,50,360,50C480,50,600,60,720,70C840,80,960,80,1080,75C1200,70,1320,60,1380,55L1440,50L1440,120L0,120Z"></path>
        </svg>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="max-w-2xl">
          <!-- Badge -->
          <div class="inline-flex items-center bg-nature-mint/80 rounded-full px-4 py-2 mb-6 border border-nature-sage/50">
            <span class="relative flex h-2 w-2 mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-nature-forest opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-nature-forest"></span>
            </span>
            <span class="text-cafe-text text-sm font-medium">新規登録で初回10%OFF</span>
          </div>
          
          <!-- Main Heading -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-cafe-text mb-6 leading-tight">
            <span class="block">温かな空間で、</span>
            <span class="text-wood-gradient">AIを学ぼう。</span>
          </h1>
          
          <p class="text-xl text-cafe-textLight mb-8 leading-relaxed">
            mirAIcafeは、カフェのようなリラックスした空間で<br class="hidden md:inline">
            AIスキルを楽しく学べるオンラインプラットフォームです。
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="/courses" class="btn-warm inline-flex items-center justify-center px-8 py-4 font-bold shadow-lg">
              <i class="fas fa-book-open mr-2"></i>講座を探す
            </a>
            <a href="/reservation" class="btn-outline inline-flex items-center justify-center px-8 py-4 font-bold">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約
            </a>
          </div>
          
          <!-- Stats -->
          <div class="flex flex-wrap gap-8 mt-12 pt-8 border-t border-cafe-beige">
            <div>
              <div class="text-3xl font-bold text-cafe-wood">500+</div>
              <div class="text-sm text-cafe-textLight">受講生</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-cafe-wood">6</div>
              <div class="text-sm text-cafe-textLight">講座数</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-cafe-wood">98%</div>
              <div class="text-sm text-cafe-textLight">満足度</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-28 left-1/2 -translate-x-1/2 animate-bounce">
        <div class="w-8 h-12 rounded-full border-2 border-cafe-wood/50 flex items-start justify-center p-2">
          <div class="w-1 h-3 bg-cafe-wood rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 relative overflow-hidden bg-cafe-cream">
      <!-- Wood Wave Top -->
      <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden transform rotate-180">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#FAF8F3" d="M0,30L80,35C160,40,320,50,480,50C640,50,800,40,960,35C1120,30,1280,30,1360,30L1440,30L1440,60L0,60Z"></path>
        </svg>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center bg-nature-mint text-nature-forest font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-leaf mr-2"></i>WHY mirAIcafe?
          </span>
          <h2 class="text-4xl md:text-5xl font-bold text-cafe-text mb-4">
            学びを、もっと<span class="text-wood-gradient">心地よく</span>
          </h2>
          <p class="text-cafe-textLight max-w-2xl mx-auto text-lg">
            温かみのある空間で、あなたのペースでAIスキルを習得しましょう
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card-hover bg-cafe-ivory p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-nature-mint rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-users text-nature-forest text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">少人数制</h3>
            <p class="text-cafe-textLight">
              最大10名の少人数制で、一人ひとりに合わせた丁寧な指導を実現
            </p>
          </div>
          
          <div class="card-hover bg-cafe-ivory p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-nature-sky rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-globe text-nature-blue text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">完全オンライン</h3>
            <p class="text-cafe-textLight">
              どこからでも参加可能。自宅やカフェから快適に学習できます
            </p>
          </div>
          
          <div class="card-hover bg-cafe-ivory p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-cafe-latte rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-award text-cafe-brown text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">修了証明</h3>
            <p class="text-cafe-textLight">
              講座修了時にデジタル証明書を発行。キャリアの証明に活用可能
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Characters Section -->
    <section class="py-20 bg-cafe-ivory">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="inline-flex items-center bg-cafe-latte/50 text-cafe-brown font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-heart mr-2"></i>AI COMPANIONS
            </span>
            <h2 class="text-4xl font-bold text-cafe-text mb-6">
              あなたの学習を<br><span class="text-wood-gradient">サポートする仲間たち</span>
            </h2>
            <p class="text-cafe-textLight text-lg mb-8 leading-relaxed">
              mirAIcafeのかわいいキャラクターたちが、あなたの学習をサポート。
              楽しみながら、着実にスキルアップできる環境を提供します。
            </p>
            <a href="/courses" class="btn-warm inline-flex items-center px-6 py-3 font-bold">
              <i class="fas fa-arrow-right mr-2"></i>講座を見る
            </a>
          </div>
          <div class="relative flex justify-center items-end gap-4">
            <div class="absolute inset-0 bg-nature-mint rounded-3xl opacity-30 blur-2xl"></div>
            <img src="/static/char-green.png" alt="リーフ" class="relative w-28 md:w-36 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char1 6s ease-in-out infinite;">
            <img src="/static/char-rabbit.png" alt="ロボうさぎ" class="relative w-32 md:w-40 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char2 7s ease-in-out infinite;">
            <img src="/static/char-pink.png" alt="ピンク" class="relative w-24 md:w-32 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char3 5s ease-in-out infinite;">
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses Section -->
    <section class="py-24 bg-cafe-cream relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-nature-mint rounded-full opacity-20 blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-cafe-wood/20 text-cafe-wood font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-star mr-2"></i>POPULAR COURSES
            </span>
            <h2 class="text-4xl font-bold text-cafe-text">人気の講座</h2>
          </div>
          <a href="/courses" class="btn-outline inline-flex items-center px-6 py-3 font-medium">
            すべて見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${featuredCourses.map((course, index) => `
            <div class="card-hover bg-cafe-ivory overflow-hidden shadow-lg border border-cafe-beige">
              <div class="aspect-video relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-cafe-espresso/50 to-transparent"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="bg-cafe-wood text-white text-xs font-bold px-3 py-1 rounded-full shadow">${course.level}</span>
                </div>
                <div class="absolute bottom-4 right-4">
                  <span class="bg-cafe-ivory/90 text-cafe-text text-xs font-bold px-3 py-1 rounded-full">
                    <i class="fas fa-clock mr-1"></i>${course.duration}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-cafe-textLight mb-2">
                  <i class="fas fa-tag mr-2 text-nature-forest"></i>${course.category}
                </div>
                <h3 class="text-xl font-bold text-cafe-text mb-2">${course.title}</h3>
                <p class="text-cafe-textLight text-sm mb-4 line-clamp-2">${course.description}</p>
                <div class="flex items-center justify-between pt-4 border-t border-cafe-beige">
                  <span class="text-2xl font-bold text-cafe-wood">¥${course.price.toLocaleString()}</span>
                  <a href="/courses/${course.id}" class="btn-warm px-5 py-2 text-sm font-medium">
                    詳細を見る
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-24 bg-cafe-ivory relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center bg-nature-sage/50 text-nature-forest font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-route mr-2"></i>HOW IT WORKS
          </span>
          <h2 class="text-4xl font-bold text-cafe-text mb-4">
            <span class="text-wood-gradient">3ステップ</span>で始める
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connecting line -->
          <div class="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cafe-wood via-cafe-caramel to-cafe-wood"></div>
          
          <div class="relative">
            <div class="card-hover bg-cafe-cream p-8 text-center border border-cafe-beige shadow-md">
              <div class="w-16 h-16 bg-cafe-wood rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">1</div>
              <h3 class="text-xl font-bold text-cafe-text mb-3">講座を選ぶ</h3>
              <p class="text-cafe-textLight">目的やレベルに合わせて最適な講座を選択</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="card-hover bg-cafe-cream p-8 text-center border border-cafe-beige shadow-md">
              <div class="w-16 h-16 bg-cafe-wood rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">2</div>
              <h3 class="text-xl font-bold text-cafe-text mb-3">日程を予約</h3>
              <p class="text-cafe-textLight">カレンダーから都合の良い日程を選択</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="card-hover bg-cafe-cream p-8 text-center border border-cafe-beige shadow-md">
              <div class="w-16 h-16 bg-cafe-wood rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">3</div>
              <h3 class="text-xl font-bold text-cafe-text mb-3">決済して参加</h3>
              <p class="text-cafe-textLight">安全なStripe決済でオンライン受講</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <a href="/reservation" class="btn-warm inline-flex items-center px-8 py-4 font-bold shadow-lg">
            <i class="fas fa-calendar-check mr-2"></i>今すぐ予約する
          </a>
        </div>
      </div>
    </section>

    <!-- Blog Section -->
    <section class="py-24 bg-cafe-cream">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-nature-mint text-nature-forest font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-newspaper mr-2"></i>BLOG
            </span>
            <h2 class="text-4xl font-bold text-cafe-text">最新のAI情報</h2>
          </div>
          <a href="/blog" class="btn-outline inline-flex items-center px-6 py-3 font-medium">
            すべて見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${recentPosts.map(post => `
            <a href="/blog/${post.id}" class="card-hover bg-cafe-ivory overflow-hidden shadow-lg border border-cafe-beige block">
              <div class="aspect-video overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
              </div>
              <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-cafe-textLight mb-2">
                  <span class="bg-nature-mint text-nature-forest font-medium px-2 py-1 rounded">${post.category}</span>
                  <span><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
                </div>
                <h3 class="text-lg font-bold text-cafe-text mb-2 line-clamp-2">${post.title}</h3>
                <p class="text-cafe-textLight text-sm line-clamp-2">${post.excerpt}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 relative overflow-hidden">
      <!-- Warm gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-cafe-wood via-cafe-caramel to-cafe-brown"></div>
      
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-cafe-latte rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-nature-sage rounded-full opacity-20 blur-3xl"></div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <i class="fas fa-gift text-white mr-2"></i>
          <span class="text-white text-sm font-medium">期間限定キャンペーン実施中</span>
        </div>
        <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
          AIスキルで、<br>未来を切り拓こう
        </h2>
        <p class="text-white/90 mb-8 text-lg">
          まずは気軽に、入門講座から始めてみませんか？<br>
          あなたのAI学習を全力でサポートします。
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/courses" class="inline-flex items-center justify-center bg-white text-cafe-wood px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            <i class="fas fa-book-open mr-2"></i>講座を探す
          </a>
          <a href="/contact" class="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-full font-bold hover:bg-white/30 transition-all">
            <i class="fas fa-envelope mr-2"></i>相談する
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout('ホーム', content, 'home')
}
