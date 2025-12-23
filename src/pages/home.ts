import { renderLayout } from '../components/layout'
import { Course, BlogPost, Portfolio } from '../data'

export const renderHomePage = (featuredCourses: Course[], recentPosts: BlogPost[], portfolios?: Portfolio[]) => {
  const content = `
    <!-- Hero Section - Warm Greenhouse Cafe Style -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Background Image with Warm Overlay -->
      <div class="absolute inset-0">
        <img src="/static/greenhouse-bg.jpg" alt="温室カフェ" class="w-full h-full object-cover hero-zoom">
        <div class="absolute inset-0 bg-gradient-to-r from-cafe-ivory/95 via-cafe-ivory/80 to-cafe-ivory/40"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-cafe-ivory via-transparent to-transparent"></div>
      </div>
      
      <!-- Hero Decorative Animations -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="hero-glow-orb hero-glow-1"></div>
        <div class="hero-glow-orb hero-glow-2"></div>
        <div class="hero-glow-orb hero-glow-3"></div>
        <div class="hero-ai-ring" style="top: 15%; right: 18%;"></div>
        <div class="hero-ai-ring hero-ai-ring-sm" style="top: 55%; right: 8%;"></div>
        <div class="hero-diamond" style="top: 25%; right: 35%; animation-delay: 0s;"></div>
        <div class="hero-diamond" style="top: 45%; right: 15%; animation-delay: -2s;"></div>
        <div class="hero-diamond" style="top: 70%; right: 28%; animation-delay: -4s;"></div>
        <div class="hero-light-beam" style="top: 0; right: 25%; animation-delay: 0s;"></div>
        <div class="hero-light-beam" style="top: 0; right: 45%; animation-delay: -3s;"></div>
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
          <div class="inline-flex items-center bg-nature-mint/80 rounded-full px-4 py-2 mb-6 border border-nature-sage/50 hero-fade-in" style="animation-delay: 0.2s;">
            <span class="relative flex h-2 w-2 mr-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-nature-forest opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-nature-forest"></span>
            </span>
            <span class="text-cafe-text text-sm font-medium">新規登録で初回10%OFF</span>
          </div>
          
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-bold text-cafe-text mb-6 leading-tight">
            <span class="block hero-slide-up" style="animation-delay: 0.4s;">温かな空間で、</span>
            <span class="text-wood-gradient hero-slide-up hero-text-glow" style="animation-delay: 0.6s;">AIを学ぼう。</span>
          </h1>
          
          <p class="text-xl text-cafe-textLight mb-8 leading-relaxed hero-fade-in" style="animation-delay: 0.8s;">
            mirAIcafeは、カフェのようなリラックスした空間で<br class="hidden md:inline">
            AIスキルを楽しく学べるオンラインプラットフォームです。
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 hero-fade-in" style="animation-delay: 1s;">
            <a href="/courses" class="btn-warm inline-flex items-center justify-center px-8 py-4 font-bold shadow-lg hero-btn-shine">
              <i class="fas fa-book-open mr-2"></i>講座を探す
            </a>
            <a href="/reservation" class="btn-outline inline-flex items-center justify-center px-8 py-4 font-bold">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約
            </a>
          </div>
          
          <div class="flex flex-wrap gap-8 mt-12 pt-8 border-t border-cafe-beige hero-fade-in" style="animation-delay: 1.2s;">
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
      
      <div class="absolute bottom-28 left-1/2 -translate-x-1/2 animate-bounce hero-fade-in" style="animation-delay: 1.5s;">
        <div class="w-8 h-12 rounded-full border-2 border-cafe-wood/50 flex items-start justify-center p-2">
          <div class="w-1 h-3 bg-cafe-wood rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>

    <!-- 1. AI News Section (白背景、アニメーションなし、ウェーブライン付き) -->
    <section id="ai-news" class="py-16 bg-white relative">
      <!-- Wave Top (from Hero) -->
      <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden transform rotate-180">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,30L80,25C160,20,320,10,480,15C640,20,800,40,960,45C1120,50,1280,40,1360,35L1440,30L1440,60L0,60Z"></path>
        </svg>
      </div>
      
      <!-- Wave Bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,30L80,35C160,40,320,50,480,50C640,50,800,40,960,35C1120,30,1280,30,1360,30L1440,30L1440,60L0,60Z"></path>
        </svg>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <span class="inline-flex items-center bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-robot mr-2"></i>AI NEWS
          </span>
          <h2 class="text-3xl font-bold text-cafe-text">最新AIニュース</h2>
          <p class="text-cafe-textLight mt-2">AI業界の最新トピックスをチェック</p>
        </div>
        
        <div class="news-scroll-container flex gap-5 overflow-x-auto pb-4 scroll-smooth" id="newsContainer" style="scrollbar-width: thin;">
          <!-- ニュースはJavaScriptで動的に読み込み -->
          <div class="w-full py-8 text-center text-cafe-textLight">
            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>読み込み中...</p>
          </div>
        </div>
        
        <div class="text-center mt-6">
          <a href="/blog" class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition">
            もっと見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <script>
          // AIニュースを動的に読み込み
          (async function loadAINews() {
            const container = document.getElementById('newsContainer');
            
            try {
              const response = await fetch('/api/ai-news?limit=10&status=approved');
              const news = await response.json();
              
              if (news.length === 0) {
                container.innerHTML = '<p class="text-center text-cafe-textLight w-full py-8">準備中です。近日公開予定!</p>';
                return;
              }
              
              container.innerHTML = news.map(item => \`
                <a href="\${item.url}" target="_blank" rel="noopener" 
                   class="flex-none w-72 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden group">
                  <div class="p-5">
                    <div class="flex items-center gap-2 mb-3">
                      <span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                        <i class="fas fa-robot mr-1"></i>AI
                      </span>
                      <span class="text-xs text-gray-400">\${formatNewsDate(item.published_at)}</span>
                    </div>
                    <h3 class="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition mb-2">\${escapeHtml(item.title)}</h3>
                    <p class="text-xs text-gray-600 line-clamp-2 mb-3">\${escapeHtml(item.summary || '')}</p>
                    <div class="flex items-center justify-between text-xs text-gray-400">
                      <span><i class="fas fa-newspaper mr-1"></i>\${escapeHtml(item.source || '不明')}</span>
                      <span class="group-hover:text-blue-500 transition">詳細 <i class="fas fa-arrow-right ml-1"></i></span>
                    </div>
                  </div>
                </a>
              \`).join('');
              
            } catch (error) {
              console.error('AI News load error:', error);
              container.innerHTML = '<p class="text-center text-cafe-textLight w-full py-8">ニュースの読み込みに失敗しました</p>';
            }
          })();
          
          function formatNewsDate(dateStr) {
            if (!dateStr) return '';
            try {
              const date = new Date(dateStr);
              const now = new Date();
              const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
              if (diffDays === 0) return '今日';
              if (diffDays === 1) return '昨日';
              if (diffDays < 7) return diffDays + '日前';
              return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
            } catch {
              return '';
            }
          }
          
          function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }
        </script>
      </div>
    </section>

    <!-- 2. Blog Section (葉っぱアニメーション見える) -->
    <section id="blog" class="py-20 bg-cafe-cream/70 relative overflow-hidden">
      <!-- 葉っぱアニメーション背景 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="hero-glow-orb hero-glow-1"></div>
        <div class="hero-glow-orb hero-glow-2"></div>
        <div class="hero-diamond" style="top: 15%; left: 10%; animation-delay: 0s;"></div>
        <div class="hero-diamond" style="top: 60%; right: 15%; animation-delay: -3s;"></div>
        <div class="hero-diamond" style="bottom: 20%; left: 20%; animation-delay: -5s;"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-purple-100 text-purple-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-pen-nib mr-2"></i>BLOG
            </span>
            <h2 class="text-4xl font-bold text-cafe-text">開発日記・AI活用ブログ</h2>
          </div>
          <a href="/blog" class="btn-outline inline-flex items-center px-6 py-3 font-medium">
            すべて見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blogGrid">
          ${recentPosts.slice(0, 3).map(post => `
            <a href="/blog/${post.id}" class="group bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div class="aspect-video overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
              </div>
              <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-cafe-textLight mb-3">
                  <span class="bg-nature-mint text-nature-forest font-medium px-3 py-1 rounded-full">${post.category}</span>
                  <span><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
                </div>
                <h3 class="text-xl font-bold text-cafe-text mb-3 line-clamp-2 group-hover:text-cafe-wood transition">${post.title}</h3>
                <p class="text-cafe-textLight text-sm line-clamp-2">${post.excerpt}</p>
                <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                  <span><i class="fas fa-user mr-1"></i>${post.author}</span>
                  <span>${post.date}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
        
        <div class="text-center mt-10">
          <a href="/blog" class="inline-flex items-center px-8 py-4 bg-cafe-wood text-white rounded-full font-bold hover:bg-cafe-brown hover:-translate-y-1 transition-all shadow-lg">
            <i class="fas fa-newspaper mr-2"></i>ブログをもっと見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- 3. Profile Section (白背景、アニメーションなし、ウェーブライン付き) -->
    <section id="profile" class="py-20 bg-white relative">
      <!-- Wave Top -->
      <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden transform rotate-180">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,20L80,25C160,30,320,40,480,45C640,50,800,45,960,40C1120,35,1280,25,1360,20L1440,15L1440,60L0,60Z"></path>
        </svg>
      </div>
      
      <!-- Wave Bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,40L80,35C160,30,320,20,480,15C640,10,800,15,960,20C1120,25,1280,35,1360,40L1440,45L1440,60L0,60Z"></path>
        </svg>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-flex items-center bg-pink-100 text-pink-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-user-circle mr-2"></i>INSTRUCTOR
          </span>
          <h2 class="text-4xl font-bold text-cafe-text">講師紹介</h2>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-10 items-center">
          <!-- 左側: プロフィール画像 -->
          <div class="lg:w-72 flex-shrink-0 mx-auto lg:mx-0">
            <img src="/static/mion-profile.png" alt="mion(ミオン)" class="w-full max-w-xs mx-auto rounded-2xl shadow-xl">
          </div>
          
          <!-- 右側: プロフィール本文（短縮版） -->
          <div class="flex-1 text-center lg:text-left">
            <h3 class="text-3xl font-bold text-cafe-text mb-2">mion(ミオン)</h3>
            <p class="text-lg text-cafe-textLight mb-6">現役AI講師 / AIキャリア教育コンサルタント</p>
            
            <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm mb-8">
              <p class="text-lg leading-relaxed">「AIをカフェで学ぶように、気軽に・楽しく・実践的に。」<br>
              そんな想いで、mirAIcafeを運営しています。</p>
            </div>
            
            <h4 class="text-xl font-bold text-cafe-text mb-4 pb-2 border-b-2 border-blue-500 inline-block">毎日、AIと共に働いています。</h4>
            
            <div class="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-400 mb-8 mt-4">
              <p class="text-lg leading-relaxed">
                AIは「難しい技術」ではなく、<strong>「使い方次第で人生を豊かにする相棒」</strong>です。<br>
                私自身、<strong>AIは人の生き方を広げる相棒</strong>だと信じています。
              </p>
            </div>
            
            <a href="https://hatarakustyle.jp/" target="_blank" class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
              <i class="fas fa-external-link-alt mr-2"></i>メンタルヘルス・キャリアコンサルタントとしての活動はこちら
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Portfolio Section (アニメーション見える) -->
    <section id="portfolio" class="py-20 bg-cafe-cream/70 relative overflow-hidden">
      <!-- アニメーション背景 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="hero-glow-orb hero-glow-2"></div>
        <div class="hero-glow-orb hero-glow-3"></div>
        <div class="hero-diamond" style="top: 20%; right: 10%; animation-delay: -1s;"></div>
        <div class="hero-diamond" style="bottom: 30%; left: 15%; animation-delay: -4s;"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-amber-100 text-amber-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-briefcase mr-2"></i>PORTFOLIO
            </span>
            <h2 class="text-4xl font-bold text-cafe-text">実績・ポートフォリオ</h2>
          </div>
          <a href="/contact" class="btn-outline inline-flex items-center px-6 py-3 font-medium">
            お問い合わせ <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolioGrid">
          ${(portfolios || []).slice(0, 3).map(item => `
            <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div class="aspect-video overflow-hidden">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-6">
                <span class="text-xs font-medium text-cafe-wood bg-cafe-latte/50 px-2 py-1 rounded">${item.category}</span>
                <h3 class="text-xl font-bold text-cafe-text mt-3 mb-2">${item.title}</h3>
                <p class="text-cafe-textLight text-sm mb-4">${item.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  ${item.technologies.map(tech => `
                    <span class="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">${tech}</span>
                  `).join('')}
                </div>
                ${item.demoUrl ? `
                  <div class="flex gap-3">
                    <a href="${item.demoUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-cafe-wood text-white rounded-lg text-sm hover:bg-cafe-brown transition">
                      <i class="fas fa-external-link-alt mr-2"></i>デモを見る
                    </a>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="text-center mt-10">
          <a href="/contact" class="inline-flex items-center px-8 py-4 bg-amber-500 text-white rounded-full font-bold hover:bg-amber-600 hover:-translate-y-1 transition-all shadow-lg">
            <i class="fas fa-envelope mr-2"></i>制作のご相談はこちら <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- 5. Characters Section - AI COMPANIONS (白背景、アニメーションなし、ウェーブライン付き) -->
    <section class="py-20 bg-white relative">
      <!-- Wave Top -->
      <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden transform rotate-180">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,25L80,30C160,35,320,45,480,50C640,55,800,50,960,45C1120,40,1280,30,1360,25L1440,20L1440,60L0,60Z"></path>
        </svg>
      </div>
      
      <!-- Wave Bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,35L80,30C160,25,320,15,480,10C640,5,800,10,960,15C1120,20,1280,30,1360,35L1440,40L1440,60L0,60Z"></path>
        </svg>
      </div>
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
            <img src="/static/companion-green.png" alt="リーフ" class="relative w-28 md:w-36 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char1 6s ease-in-out infinite;">
            <img src="/static/companion-rabbit.png" alt="ロボうさぎ" class="relative w-32 md:w-40 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char2 7s ease-in-out infinite;">
            <img src="/static/companion-pink.png" alt="ピンク" class="relative w-24 md:w-32 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char3 5s ease-in-out infinite;">
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Features Section - WHY mirAIcafe? (アニメーション見える) -->
    <section class="py-24 relative overflow-hidden bg-cafe-cream/70">
      <!-- アニメーション背景 -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="hero-glow-orb hero-glow-1"></div>
        <div class="hero-glow-orb hero-glow-3"></div>
        <div class="hero-diamond" style="top: 10%; left: 5%; animation-delay: 0s;"></div>
        <div class="hero-diamond" style="top: 50%; right: 10%; animation-delay: -2s;"></div>
        <div class="hero-diamond" style="bottom: 15%; left: 25%; animation-delay: -4s;"></div>
      </div>
      
      <!-- Wood Wave Top -->
      <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden transform rotate-180">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#FFFFFF" d="M0,30L80,35C160,40,320,50,480,50C640,50,800,40,960,35C1120,30,1280,30,1360,30L1440,30L1440,60L0,60Z"></path>
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
          <div class="card-hover bg-white p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-nature-mint rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-users text-nature-forest text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">少人数制</h3>
            <p class="text-cafe-textLight">
              最大10名の少人数制で、一人ひとりに合わせた丁寧な指導を実現
            </p>
          </div>
          
          <div class="card-hover bg-white p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-nature-sky rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-globe text-nature-blue text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">完全オンライン</h3>
            <p class="text-cafe-textLight">
              どこからでも参加可能。自宅やカフェから快適に学習できます
            </p>
          </div>
          
          <div class="card-hover bg-white p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-cafe-latte rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-headset text-cafe-brown text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">個別サポート</h3>
            <p class="text-cafe-textLight">
              質問・相談いつでもOK。あなたの学習を全力でサポートします
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. How It Works Section - 3ステップで始める (白背景、アニメーションなし、ウェーブライン付き) -->
    <section class="py-24 bg-white relative">
      <!-- Wave Top -->
      <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden transform rotate-180">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,30L80,25C160,20,320,10,480,5C640,0,800,5,960,10C1120,15,1280,25,1360,30L1440,35L1440,60L0,60Z"></path>
        </svg>
      </div>
      
      <!-- Wave Bottom -->
      <div class="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        <svg viewBox="0 0 1440 60" class="w-full h-full" preserveAspectRatio="none">
          <path fill="#E8DCC8" fill-opacity="0.7" d="M0,20L80,25C160,30,320,40,480,45C640,50,800,45,960,40C1120,35,1280,25,1360,20L1440,15L1440,60L0,60Z"></path>
        </svg>
      </div>
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
            <div class="card-hover bg-gray-50 p-8 text-center border border-cafe-beige shadow-md">
              <div class="w-16 h-16 bg-cafe-wood rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">1</div>
              <h3 class="text-xl font-bold text-cafe-text mb-3">講座を選ぶ</h3>
              <p class="text-cafe-textLight">目的やレベルに合わせて最適な講座を選択</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="card-hover bg-gray-50 p-8 text-center border border-cafe-beige shadow-md">
              <div class="w-16 h-16 bg-cafe-wood rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg relative z-10">2</div>
              <h3 class="text-xl font-bold text-cafe-text mb-3">日程を予約</h3>
              <p class="text-cafe-textLight">カレンダーから都合の良い日程を選択</p>
            </div>
          </div>
          
          <div class="relative">
            <div class="card-hover bg-gray-50 p-8 text-center border border-cafe-beige shadow-md">
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

    <!-- 8. Course Introduction Section - 人気の講座 (そのまま) -->
    <section class="py-20 bg-cafe-cream/70 relative overflow-hidden">
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
          ${featuredCourses.map(course => `
            <div class="card-hover bg-white overflow-hidden shadow-lg border border-cafe-beige">
              <div class="aspect-video relative overflow-hidden">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-cafe-espresso/50 to-transparent"></div>
                <div class="absolute top-4 left-4">
                  <span class="bg-cafe-wood text-white text-xs font-bold px-3 py-1 rounded-full shadow">${course.level}</span>
                </div>
                <div class="absolute bottom-4 right-4">
                  <span class="bg-white/90 text-cafe-text text-xs font-bold px-3 py-1 rounded-full">
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

    <!-- 9. Contact CTA Section (そのまま) -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-cafe-wood via-cafe-caramel to-cafe-brown"></div>
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

    <!-- AI News Loading Script -->
    <script>
      document.addEventListener('DOMContentLoaded', async function() {
        try {
          const response = await fetch('/api/ai-news?limit=5&status=approved');
          const news = await response.json();
          
          const container = document.getElementById('newsContainer');
          
          if (news.length === 0) {
            container.innerHTML = '<p class="text-center text-cafe-textLight w-full py-8">準備中です。近日公開予定!</p>';
            return;
          }
          
          container.innerHTML = news.map(item => \`
            <div class="flex-shrink-0 w-72 bg-gray-50 p-5 rounded-xl border-l-4 border-blue-500 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all" onclick="window.open('\${item.url}', '_blank')">
              <h3 class="font-bold text-cafe-text mb-2 line-clamp-2">\${item.title}</h3>
              <p class="text-sm text-cafe-textLight line-clamp-2 mb-3">\${item.summary || ''}</p>
              <div class="flex justify-between text-xs text-gray-400">
                <span>\${item.source || 'AI News'}</span>
                <span>\${item.published_at ? new Date(item.published_at).toLocaleDateString('ja-JP') : ''}</span>
              </div>
            </div>
          \`).join('');
        } catch (error) {
          console.error('AIニュース読み込みエラー:', error);
          document.getElementById('newsContainer').innerHTML = '<p class="text-center text-red-500 w-full py-8">読み込みに失敗しました</p>';
        }
      });
    </script>

    <style>
      .news-scroll-container::-webkit-scrollbar {
        height: 8px;
      }
      .news-scroll-container::-webkit-scrollbar-thumb {
        background: #3498db;
        border-radius: 4px;
      }
      .news-scroll-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }
    </style>
  `

  return renderLayout('ホーム', content, 'home')
}
