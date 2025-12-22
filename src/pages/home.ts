import { renderLayout } from '../components/layout'
import { Course, BlogPost } from '../data'

export const renderHomePage = (featuredCourses: Course[], recentPosts: BlogPost[]) => {
  const content = `
    <!-- Hero Section - Futuristic Greenhouse Style -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0">
        <img src="https://www.genspark.ai/api/files/s/13WjWC6J" alt="Futuristic greenhouse" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-future-ivory via-transparent to-transparent"></div>
      </div>
      
      <!-- Animated Orbs -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      
      <!-- Floating Particles -->
      <div class="particles">
        ${Array.from({length: 20}, (_, i) => `
          <div class="particle" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 15}s; animation-duration: ${15 + Math.random() * 10}s;"></div>
        `).join('')}
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="max-w-2xl">
          <!-- Badge -->
          <div class="inline-flex items-center glass rounded-full px-4 py-2 mb-6 border border-ai-cyan/30">
            <span class="relative flex h-2 w-2 mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-cyan opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-ai-cyan"></span>
            </span>
            <span class="text-future-text text-sm font-medium">新規登録で初回10%OFF</span>
          </div>
          
          <!-- Main Heading -->
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-future-text mb-6 leading-tight">
            <span class="block">未来の学びを、</span>
            <span class="gradient-ai-text glow-text">AIと共に。</span>
          </h1>
          
          <p class="text-xl text-future-textLight mb-8 leading-relaxed">
            mirAIcafeは、最先端のAIスキルを<br class="hidden md:inline">
            明るく開放的な空間で学べるオンラインプラットフォームです。
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="/courses" class="btn-ai inline-flex items-center justify-center gradient-ai text-white px-8 py-4 rounded-full font-bold shadow-lg">
              <i class="fas fa-rocket mr-2"></i>講座を探す
            </a>
            <a href="/reservation" class="btn-ai inline-flex items-center justify-center glass text-future-text px-8 py-4 rounded-full font-bold border border-ai-blue/30 hover:border-ai-blue">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約
            </a>
          </div>
          
          <!-- Stats -->
          <div class="flex flex-wrap gap-8 mt-12 pt-8 border-t border-future-sky">
            <div>
              <div class="text-3xl font-bold gradient-ai-text">500+</div>
              <div class="text-sm text-future-textLight">受講生</div>
            </div>
            <div>
              <div class="text-3xl font-bold gradient-ai-text">6</div>
              <div class="text-sm text-future-textLight">講座数</div>
            </div>
            <div>
              <div class="text-3xl font-bold gradient-ai-text">98%</div>
              <div class="text-sm text-future-textLight">満足度</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div class="w-8 h-12 rounded-full border-2 border-ai-blue/50 flex items-start justify-center p-2">
          <div class="w-1 h-3 bg-ai-blue rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0 gradient-ai-light"></div>
      <div class="wave-organic"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center gradient-ai text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-sparkles mr-2"></i>WHY mirAIcafe?
          </span>
          <h2 class="text-4xl md:text-5xl font-bold text-future-text mb-4">
            学びを、もっと<span class="gradient-ai-text">スマート</span>に
          </h2>
          <p class="text-future-textLight max-w-2xl mx-auto text-lg">
            最新のAI技術と洗練された学習体験で、あなたのスキルアップをサポートします
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="card-hover glass p-8 text-center border border-white/50">
            <div class="w-20 h-20 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg pulse-glow">
              <i class="fas fa-users text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-future-text mb-3">少人数制</h3>
            <p class="text-future-textLight">
              最大10名の少人数制で、一人ひとりに合わせた丁寧な指導を実現
            </p>
          </div>
          
          <div class="card-hover glass p-8 text-center border border-white/50">
            <div class="w-20 h-20 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg pulse-glow" style="animation-delay: 1s;">
              <i class="fas fa-globe text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-future-text mb-3">完全オンライン</h3>
            <p class="text-future-textLight">
              どこからでも参加可能。自宅やカフェから快適に学習できます
            </p>
          </div>
          
          <div class="card-hover glass p-8 text-center border border-white/50">
            <div class="w-20 h-20 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg pulse-glow" style="animation-delay: 2s;">
              <i class="fas fa-award text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-future-text mb-3">修了証明</h3>
            <p class="text-future-textLight">
              講座修了時にデジタル証明書を発行。キャリアの証明に活用可能
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Characters Section -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span class="inline-flex items-center bg-ai-purple/10 text-ai-purple font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-robot mr-2"></i>AI COMPANIONS
            </span>
            <h2 class="text-4xl font-bold text-future-text mb-6">
              あなたの学習を<br><span class="gradient-ai-text">サポートする仲間たち</span>
            </h2>
            <p class="text-future-textLight text-lg mb-8 leading-relaxed">
              mirAIcafeのAIキャラクターたちが、あなたの学習をサポート。
              楽しみながら、着実にスキルアップできる環境を提供します。
            </p>
            <a href="/courses" class="btn-ai inline-flex items-center gradient-ai text-white px-6 py-3 rounded-full font-bold">
              <i class="fas fa-arrow-right mr-2"></i>講座を見る
            </a>
          </div>
          <div class="relative">
            <div class="absolute inset-0 gradient-ai rounded-3xl opacity-10 blur-3xl"></div>
            <img src="https://www.genspark.ai/api/files/s/c01SJapp" alt="AI Characters" class="relative w-full max-w-md mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500">
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Courses Section -->
    <section class="py-24 bg-future-light relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 gradient-ai rounded-full opacity-10 blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-ai-cyan/10 text-ai-cyan font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-fire mr-2"></i>POPULAR COURSES
            </span>
            <h2 class="text-4xl font-bold text-future-text">人気の講座</h2>
          </div>
          <a href="/courses" class="btn-ai inline-flex items-center glass text-future-text px-6 py-3 rounded-full font-medium border border-ai-blue/30">
            すべて見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${featuredCourses.map((course, index) => `
            <div class="card-hover bg-white overflow-hidden shadow-lg border border-future-sky/50">
              <div class="aspect-video relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="gradient-ai text-white text-xs font-bold px-3 py-1 rounded-full shadow">${course.level}</span>
                </div>
                <div class="absolute bottom-4 right-4">
                  <span class="glass text-future-text text-xs font-bold px-3 py-1 rounded-full">
                    <i class="fas fa-clock mr-1"></i>${course.duration}
                  </span>
                </div>
              </div>
              <div class="p-6">
                <div class="flex items-center text-sm text-future-textLight mb-2">
                  <i class="fas fa-tag mr-2 text-ai-blue"></i>${course.category}
                </div>
                <h3 class="text-xl font-bold text-future-text mb-2">${course.title}</h3>
                <p class="text-future-textLight text-sm mb-4 line-clamp-2">${course.description}</p>
                <div class="flex items-center justify-between pt-4 border-t border-future-sky">
                  <span class="text-2xl font-bold gradient-ai-text">¥${course.price.toLocaleString()}</span>
                  <a href="/courses/${course.id}" class="btn-ai gradient-ai text-white px-5 py-2 rounded-full text-sm font-medium">
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
    <section class="py-24 bg-white relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <span class="inline-flex items-center bg-ai-blue/10 text-ai-blue font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-route mr-2"></i>HOW IT WORKS
          </span>
          <h2 class="text-4xl font-bold text-future-text mb-4">
            <span class="gradient-ai-text">3ステップ</span>で始める
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connecting line -->
          <div class="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 gradient-ai"></div>
          
          <div class="relative">
            <div class="card-hover glass p-8 text-center border border-white/50">
              <div class="w-16 h-16 gradient-ai rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">1</div>
              <h3 class="text-xl font-bold text-future-text mb-3">講座を選ぶ</h3>
              <p class="text-future-textLight">目的やレベルに合わせて最適な講座を選択</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="card-hover glass p-8 text-center border border-white/50">
              <div class="w-16 h-16 gradient-ai rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">2</div>
              <h3 class="text-xl font-bold text-future-text mb-3">日程を予約</h3>
              <p class="text-future-textLight">カレンダーから都合の良い日程を選択</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="card-hover glass p-8 text-center border border-white/50">
              <div class="w-16 h-16 gradient-ai rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">3</div>
              <h3 class="text-xl font-bold text-future-text mb-3">決済して参加</h3>
              <p class="text-future-textLight">安全なStripe決済でオンライン受講</p>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-12">
          <a href="/reservation" class="btn-ai inline-flex items-center gradient-ai text-white px-8 py-4 rounded-full font-bold shadow-lg">
            <i class="fas fa-calendar-check mr-2"></i>今すぐ予約する
          </a>
        </div>
      </div>
    </section>

    <!-- Blog Section -->
    <section class="py-24 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-ai-purple/10 text-ai-purple font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-newspaper mr-2"></i>BLOG
            </span>
            <h2 class="text-4xl font-bold text-future-text">最新のAI情報</h2>
          </div>
          <a href="/blog" class="btn-ai inline-flex items-center glass text-future-text px-6 py-3 rounded-full font-medium border border-ai-purple/30">
            すべて見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          ${recentPosts.map(post => `
            <a href="/blog/${post.id}" class="card-hover bg-white overflow-hidden shadow-lg border border-future-sky/50 block">
              <div class="aspect-video overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
              </div>
              <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-future-textLight mb-2">
                  <span class="bg-ai-blue/10 text-ai-blue font-medium px-2 py-1 rounded">${post.category}</span>
                  <span><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
                </div>
                <h3 class="text-lg font-bold text-future-text mb-2 line-clamp-2">${post.title}</h3>
                <p class="text-future-textLight text-sm line-clamp-2">${post.excerpt}</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0 gradient-ai"></div>
      <div class="absolute inset-0">
        <div class="orb orb-1 opacity-30"></div>
        <div class="orb orb-2 opacity-30"></div>
        <div class="orb orb-3 opacity-30"></div>
      </div>
      <div class="particles">
        ${Array.from({length: 15}, (_, i) => `
          <div class="particle" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 15}s; background: white;"></div>
        `).join('')}
      </div>
      
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
          <a href="/courses" class="btn-ai inline-flex items-center justify-center bg-white text-ai-blue px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl">
            <i class="fas fa-rocket mr-2"></i>講座を探す
          </a>
          <a href="/contact" class="btn-ai inline-flex items-center justify-center bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 px-8 py-4 rounded-full font-bold hover:bg-white/30">
            <i class="fas fa-envelope mr-2"></i>相談する
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout('ホーム', content, 'home')
}
