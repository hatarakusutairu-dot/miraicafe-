import { renderLayout } from '../components/layout'
import { Course, BlogPost } from '../data'

export const renderHomePage = (featuredCourses: Course[], recentPosts: BlogPost[]) => {
  const content = `
    <!-- Hero Section with Wave Animation -->
    <section class="relative overflow-hidden min-h-[600px] gradient-hero">
      <!-- Wave animations -->
      <div class="wave-bg"></div>
      <div class="wave-bg wave-bg-2"></div>
      <div class="wave-bg wave-bg-3"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Text Content -->
          <div class="text-center lg:text-left z-10">
            <div class="inline-flex items-center bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-sm">
              <i class="fas fa-seedling text-character-green mr-2"></i>
              <span class="text-greenhouse-text text-sm font-medium">新規登録で初回10%OFF</span>
            </div>
            <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-greenhouse-text mb-6 leading-tight">
              温室カフェで、<br>
              <span class="text-character-green">AI</span>を学ぼう。
            </h1>
            <p class="text-lg md:text-xl text-greenhouse-textLight mb-8 max-w-xl">
              mirAIcafeは、明るく開放的な雰囲気で<br class="hidden md:inline">
              AIスキルを身につけられるオンライン学習プラットフォームです。
            </p>
            <div class="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <a href="/courses" class="btn-primary inline-flex items-center justify-center gradient-button text-white px-8 py-4 rounded-full font-bold shadow-lg">
                <i class="fas fa-book-open mr-2"></i>講座を探す
              </a>
              <a href="/reservation" class="btn-primary inline-flex items-center justify-center bg-white text-greenhouse-text px-8 py-4 rounded-full font-bold shadow-md hover:shadow-lg border-2 border-greenhouse-sage">
                <i class="fas fa-calendar-check mr-2"></i>今すぐ予約
              </a>
            </div>
          </div>
          
          <!-- Right: Characters -->
          <div class="relative flex justify-center items-end lg:justify-end z-10">
            <!-- Character images -->
            <div class="relative w-full max-w-lg h-80">
              <!-- Green Robot Character -->
              <div class="absolute left-0 bottom-0 float-animation">
                <img src="https://www.genspark.ai/api/files/s/c01SJapp" alt="AI Characters" class="w-full max-w-sm mx-auto drop-shadow-xl">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Greenhouse decoration -->
      <div class="absolute top-0 left-0 w-32 h-32 opacity-20">
        <i class="fas fa-leaf text-character-green" style="font-size: 8rem; transform: rotate(-30deg);"></i>
      </div>
      <div class="absolute top-20 right-10 w-20 h-20 opacity-15">
        <i class="fas fa-spa text-character-green" style="font-size: 5rem;"></i>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white relative overflow-hidden">
      <!-- Decorative elements -->
      <div class="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-greenhouse-cream/50 to-transparent"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block bg-greenhouse-sage/30 text-character-green font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-star mr-2"></i>mirAIcafeの特徴
          </span>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-greenhouse-text mb-4">
            温室カフェのような学習体験
          </h2>
          <p class="text-greenhouse-textLight max-w-2xl mx-auto">
            明るく開放的な雰囲気で、楽しみながらAIスキルを身につけましょう
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card-hover bg-gradient-to-br from-character-green/10 to-greenhouse-sage/20 p-8 text-center">
            <div class="w-20 h-20 gradient-button rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i class="fas fa-user-friends text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-greenhouse-text mb-3">少人数制</h3>
            <p class="text-greenhouse-textLight text-sm leading-relaxed">
              最大10名の少人数制で、一人ひとりに寄り添った丁寧な指導を行います。
            </p>
          </div>
          
          <div class="card-hover bg-gradient-to-br from-character-orange/10 to-greenhouse-wood/20 p-8 text-center">
            <div class="w-20 h-20 gradient-button-warm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i class="fas fa-laptop-house text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-greenhouse-text mb-3">完全オンライン</h3>
            <p class="text-greenhouse-textLight text-sm leading-relaxed">
              自宅やカフェなど、お好きな場所から参加できます。移動時間ゼロで効率的。
            </p>
          </div>
          
          <div class="card-hover bg-gradient-to-br from-character-pink/10 to-greenhouse-sky/20 p-8 text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-character-pink to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <i class="fas fa-certificate text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-greenhouse-text mb-3">修了証明</h3>
            <p class="text-greenhouse-textLight text-sm leading-relaxed">
              講座修了時にデジタル修了証を発行。スキルの証明にご活用いただけます。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses Section -->
    <section class="py-20 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-block bg-character-green/20 text-character-green font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-fire mr-2"></i>人気の講座
            </span>
            <h2 class="font-display text-3xl md:text-4xl font-bold text-greenhouse-text">今月のおすすめ</h2>
          </div>
          <a href="/courses" class="inline-flex items-center text-character-green hover:text-green-600 font-medium transition-colors">
            すべての講座を見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${featuredCourses.map((course, index) => `
            <div class="card-hover bg-white overflow-hidden shadow-md">
              <div class="aspect-video bg-greenhouse-beige relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="bg-character-${index === 0 ? 'green' : index === 1 ? 'orange' : 'pink'} text-white text-xs font-bold px-3 py-1 rounded-full shadow">${course.level}</span>
                </div>
                <div class="absolute top-4 right-4">
                  <span class="bg-white/90 text-greenhouse-text text-xs font-bold px-3 py-1 rounded-full shadow">
                    <i class="fas fa-clock mr-1"></i>${course.duration}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-greenhouse-textLight mb-2">
                  <i class="fas fa-tag mr-2 text-character-green"></i>${course.category}
                </div>
                <h3 class="text-xl font-bold text-greenhouse-text mb-2">${course.title}</h3>
                <p class="text-greenhouse-textLight text-sm mb-4 line-clamp-2">${course.description}</p>
                <div class="flex items-center justify-between pt-4 border-t border-greenhouse-beige">
                  <span class="text-2xl font-bold text-character-green">¥${course.price.toLocaleString()}</span>
                  <a href="/courses/${course.id}" class="btn-primary gradient-button text-white px-5 py-2 rounded-full text-sm font-medium">
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
    <section class="py-20 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-block bg-character-orange/20 text-character-orange font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-route mr-2"></i>ご利用の流れ
          </span>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-greenhouse-text mb-4">
            簡単3ステップでAI学習をスタート
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connecting line (desktop only) -->
          <div class="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-character-green via-character-orange to-character-pink rounded-full"></div>
          
          <div class="relative">
            <div class="bg-greenhouse-cream rounded-3xl p-8 text-center relative z-10 border-2 border-greenhouse-sage/30">
              <div class="w-14 h-14 gradient-button rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">1</div>
              <h3 class="text-xl font-bold text-greenhouse-text mb-3">講座を選ぶ</h3>
              <p class="text-greenhouse-textLight text-sm">目的やレベルに合わせて、お好みの講座を選択してください。</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-greenhouse-cream rounded-3xl p-8 text-center relative z-10 border-2 border-character-orange/30">
              <div class="w-14 h-14 gradient-button-warm rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">2</div>
              <h3 class="text-xl font-bold text-greenhouse-text mb-3">日程を予約</h3>
              <p class="text-greenhouse-textLight text-sm">カレンダーから都合の良い日程を選んで予約します。</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="bg-greenhouse-cream rounded-3xl p-8 text-center relative z-10 border-2 border-character-pink/30">
              <div class="w-14 h-14 bg-gradient-to-br from-character-pink to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">3</div>
              <h3 class="text-xl font-bold text-greenhouse-text mb-3">決済して参加</h3>
              <p class="text-greenhouse-textLight text-sm">安全なStripe決済後、オンラインで講座に参加できます。</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <a href="/reservation" class="btn-primary inline-flex items-center justify-center gradient-button text-white px-8 py-4 rounded-full font-bold shadow-lg">
            <i class="fas fa-calendar-check mr-2"></i>今すぐ予約する
          </a>
        </div>
      </div>
    </section>

    <!-- Blog Section -->
    <section class="py-20 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-block bg-greenhouse-sky/40 text-blue-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-newspaper mr-2"></i>AI学習ブログ
            </span>
            <h2 class="font-display text-3xl md:text-4xl font-bold text-greenhouse-text">最新のAI情報をお届け</h2>
          </div>
          <a href="/blog" class="inline-flex items-center text-character-green hover:text-green-600 font-medium transition-colors">
            すべての記事を見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${recentPosts.map(post => `
            <a href="/blog/${post.id}" class="card-hover bg-white overflow-hidden shadow-md block">
              <div class="aspect-video bg-greenhouse-beige overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-greenhouse-textLight mb-2">
                  <span class="bg-greenhouse-sage/30 text-character-green text-xs font-medium px-2 py-1 rounded">${post.category}</span>
                  <span class="mx-2">•</span>
                  <i class="fas fa-clock mr-1"></i>${post.readTime}
                </div>
                <h3 class="text-lg font-bold text-greenhouse-text mb-2 line-clamp-2">${post.title}</h3>
                <p class="text-greenhouse-textLight text-sm line-clamp-2">${post.excerpt}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 relative overflow-hidden">
      <!-- Background with greenhouse image overlay -->
      <div class="absolute inset-0">
        <img src="https://www.genspark.ai/api/files/s/DRjCjM32" alt="Greenhouse cafe" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-greenhouse-text/90 to-greenhouse-text/70"></div>
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center bg-character-green/30 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
          <i class="fas fa-gift text-character-green mr-2"></i>
          <span class="text-greenhouse-cream text-sm font-medium">期間限定キャンペーン実施中</span>
        </div>
        <h2 class="font-display text-3xl md:text-4xl font-bold text-white mb-4">
          AIスキルで、未来を切り拓こう
        </h2>
        <p class="text-greenhouse-cream/90 mb-8 text-lg">
          まずは気軽に、入門講座から始めてみませんか？<br>
          あなたのAI学習を全力でサポートします。
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/courses" class="btn-primary inline-flex items-center justify-center gradient-button text-white px-8 py-4 rounded-full font-bold shadow-lg">
            <i class="fas fa-rocket mr-2"></i>講座を探す
          </a>
          <a href="/contact" class="btn-primary inline-flex items-center justify-center bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-full font-bold hover:bg-white/30">
            <i class="fas fa-envelope mr-2"></i>相談する
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout('ホーム', content, 'home')
}
