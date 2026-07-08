import { renderLayout } from '../components/layout'
import { Course, BlogPost, Portfolio } from '../data'

// HTMLタグを除去してテキストを切り詰める
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  // HTMLタグを除去
  const plain = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
  if (plain.length <= maxLength) return plain
  return plain.substring(0, maxLength) + '...'
}

export const renderHomePage = (featuredCourses: Course[], recentPosts: BlogPost[], portfolios?: Portfolio[]) => {
  const content = `
    <!-- Hero Section - Warm Greenhouse Cafe Style -->
    <section class="relative min-h-[90vh] flex items-center overflow-hidden">
      <!-- Background Image with Warm Overlay -->
      <div class="absolute inset-0">
        <img loading="eager" fetchpriority="high" decoding="async" src="/static/greenhouse-bg.jpg" alt="温室カフェ" class="w-full h-full object-cover hero-zoom">
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
            <span class="text-cafe-text text-sm font-medium">初心者大歓迎・少人数制で安心サポート</span>
          </div>
          
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-cafe-text mb-4 sm:mb-6 leading-tight sm:leading-snug">
            <span class="block hero-slide-up mb-1 sm:mb-2" style="animation-delay: 0.4s;">温かな空間で、</span>
            <span class="block text-wood-gradient hero-slide-up hero-text-glow" style="animation-delay: 0.6s;">AIを学ぼう。</span>
          </h1>
          
          <p class="text-base sm:text-lg md:text-xl text-cafe-textLight mb-6 sm:mb-8 leading-relaxed hero-fade-in" style="animation-delay: 0.8s;">
            mirAIcafeは、カフェのようなリラックスした空間で<br class="hidden sm:inline">
            AIスキルを楽しく学べるオンラインプラットフォームです。
          </p>
          
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 hero-fade-in" style="animation-delay: 1s;">
            <a href="/courses" class="btn-warm inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-bold shadow-lg hero-btn-shine text-sm sm:text-base">
              <i class="fas fa-book-open mr-2"></i>講座を探す
            </a>
            <a href="/reservation" class="btn-outline inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 font-bold text-sm sm:text-base">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約
            </a>
          </div>
          
          <!-- 実績（APIから動的取得、非表示対応） -->
          <div id="hero-stats" class="hidden flex-wrap gap-8 mt-12 pt-8 border-t border-cafe-beige hero-fade-in" style="animation-delay: 1.2s;">
            <div>
              <div class="text-3xl font-bold text-cafe-wood" id="stat-students">-</div>
              <div class="text-sm text-cafe-textLight">受講生</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-cafe-wood" id="stat-courses">-</div>
              <div class="text-sm text-cafe-textLight">講座数</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-cafe-wood" id="stat-satisfaction">-</div>
              <div class="text-sm text-cafe-textLight">満足度</div>
            </div>
          </div>
          
          <script>
            // 実績を取得して表示
            (async function() {
              try {
                const res = await fetch('/api/site-stats');
                const data = await res.json();
                
                if (data.show) {
                  document.getElementById('stat-students').textContent = data.students.count + data.students.suffix;
                  document.getElementById('stat-courses').textContent = data.courses;
                  document.getElementById('stat-satisfaction').textContent = data.satisfaction + '%';
                  document.getElementById('hero-stats').classList.remove('hidden');
                  document.getElementById('hero-stats').classList.add('flex');
                }
              } catch (e) {
                // 取得失敗時は非表示のまま
              }
            })();
          </script>
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
        
        <!-- 外部記事注意書き -->
        <div class="text-center mt-4 text-xs text-gray-500">
          <i class="fas fa-external-link-alt mr-1"></i>
          ニュースは外部サイトの記事へリンクしています
        </div>
        
        <div class="text-center mt-4">
          <a href="/ai-news" class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition">
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
                  <div class="relative h-36 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                    <img loading="lazy" decoding="async" 
                      src="\${item.image_url || ''}" 
                      alt="\${escapeHtml(item.title)}"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                    />
                    <div class="absolute inset-0 hidden items-center justify-center bg-gradient-to-br \${getCategoryGradient(item.category)}">
                      <span class="text-4xl">\${getCategoryIcon(item.category)}</span>
                    </div>
                    <div class="absolute top-2 left-2 flex gap-1">
                      <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-medium rounded-full shadow-sm \${getCategoryBadgeColor(item.category)}">
                        \${getCategoryLabel(item.category)}
                      </span>
                      \${item.is_translated ? '<span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full shadow-sm">翻訳</span>' : ''}
                    </div>
                    <div class="absolute top-2 right-2">
                      <span class="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full">
                        <i class="fas fa-external-link-alt mr-1"></i>外部
                      </span>
                    </div>
                  </div>
                  <div class="p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs text-gray-400">\${formatNewsDate(item.published_at)}</span>
                    </div>
                    <h3 class="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition mb-2">\${escapeHtml(item.title)}</h3>
                    <p class="text-xs text-gray-600 line-clamp-2 mb-3">\${escapeHtml(item.summary || '')}</p>
                    <div class="flex items-center justify-between text-xs text-gray-400">
                      <span><i class="fas fa-newspaper mr-1"></i>\${escapeHtml(item.source || '不明')}</span>
                      <span class="group-hover:text-blue-500 transition"><i class="fas fa-external-link-alt mr-1"></i>外部記事を読む</span>
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
          
          function getCategoryLabel(category) {
            const labels = {
              'official_announcement': '公式発表',
              'tool_update': 'ツール更新',
              'how_to': '使い方',
              'other': 'その他'
            };
            return labels[category] || 'AI';
          }
          
          function getCategoryIcon(category) {
            const icons = {
              'official_announcement': '📢',
              'tool_update': '🔧',
              'how_to': '📚',
              'other': '📰'
            };
            return icons[category] || '📰';
          }
          
          function getCategoryBadgeColor(category) {
            const colors = {
              'official_announcement': 'bg-blue-100 text-blue-700',
              'tool_update': 'bg-green-100 text-green-700',
              'how_to': 'bg-orange-100 text-orange-700',
              'other': 'bg-gray-100 text-gray-700'
            };
            return colors[category] || 'bg-blue-100 text-blue-600';
          }
          
          function getCategoryGradient(category) {
            const gradients = {
              'official_announcement': 'from-blue-500 to-purple-600',
              'tool_update': 'from-green-500 to-emerald-600',
              'how_to': 'from-orange-400 to-red-500',
              'other': 'from-gray-400 to-gray-600'
            };
            return gradients[category] || 'from-blue-400 to-purple-500';
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
                <img loading="lazy" decoding="async" src="${post.image}" alt="${post.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
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
        
        <div class="flex flex-col lg:flex-row gap-10 items-center relative">
          <!-- 左側: プロフィール画像 -->
          <div class="lg:w-72 flex-shrink-0 mx-auto lg:mx-0 relative">
            <img loading="lazy" decoding="async" src="/static/mion-profile.png" alt="mion(ミオン)" class="w-full max-w-xs mx-auto rounded-2xl shadow-xl">
            
            <!-- 個別相談バナー（ふわふわアニメーション） - 直接予約ページへ -->
            <a href="/consultation" class="consultation-banner-wrapper absolute -bottom-12 -left-8 lg:-left-20 z-20 cursor-pointer block">
              <img loading="lazy" decoding="async" src="/static/consultation-btn.png?v=2" alt="個別相談はこちらから" class="consultation-banner w-44 md:w-52 lg:w-56 drop-shadow-lg hover:scale-110 transition-transform duration-300">
            </a>
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
          
          <!-- ワークスペースへの入り口（カフェカップ） -->
          <div class="absolute -right-4 top-0 lg:right-0 lg:top-4 z-10">
            <div id="cafe-cup-wrapper" class="cafe-cup-container cursor-pointer" onclick="openWorkspaceModal()">
              <!-- ふわふわ湯気のSVG -->
              <svg class="steam-svg" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 左の湯気（ふわふわ雲形） -->
                <ellipse class="steam-cloud steam-1" cx="25" cy="55" rx="12" ry="8" fill="#f5d6a8" opacity="0.6"/>
                <ellipse class="steam-cloud steam-1" cx="30" cy="40" rx="10" ry="7" fill="#f5d6a8" opacity="0.5"/>
                <ellipse class="steam-cloud steam-1" cx="22" cy="25" rx="8" ry="6" fill="#f5d6a8" opacity="0.4"/>
                <!-- 中央の湯気 -->
                <ellipse class="steam-cloud steam-2" cx="60" cy="50" rx="14" ry="10" fill="#f5d6a8" opacity="0.6"/>
                <ellipse class="steam-cloud steam-2" cx="55" cy="32" rx="11" ry="8" fill="#f5d6a8" opacity="0.5"/>
                <ellipse class="steam-cloud steam-2" cx="62" cy="15" rx="9" ry="6" fill="#f5d6a8" opacity="0.4"/>
                <!-- 右の湯気 -->
                <ellipse class="steam-cloud steam-3" cx="95" cy="52" rx="11" ry="9" fill="#f5d6a8" opacity="0.6"/>
                <ellipse class="steam-cloud steam-3" cx="90" cy="35" rx="9" ry="7" fill="#f5d6a8" opacity="0.5"/>
                <ellipse class="steam-cloud steam-3" cx="98" cy="20" rx="7" ry="5" fill="#f5d6a8" opacity="0.4"/>
              </svg>
              <!-- カフェカップ画像 -->
              <img loading="lazy" decoding="async" src="/static/miraicafe-cup.png" alt="mirAIcafe ワークスペース" class="cafe-cup-image w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg">
              <!-- ホバー時のツールチップ -->
              <div class="cafe-tooltip">
                <span class="text-sm font-medium">☕ ワークスペース</span>
                <span class="text-xs opacity-80">みんなでAI触ろう！</span>
              </div>
            </div>
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
          ${(portfolios || []).slice(0, 6).map((item: any) => {
            // デモタイプに応じたアイコン
            const demoTypeIcon = item.demo_type === 'video' ? 'fa-play-circle' : 
                                 item.demo_type === 'slides' ? 'fa-images' : 
                                 item.demo_type === 'image' ? 'fa-image' : 'fa-external-link-alt'
            const demoLabel = item.demo_type === 'video' ? '動画を見る' : 
                              item.demo_type === 'slides' ? 'スライドを見る' : 
                              item.demo_type === 'image' ? '画像を見る' : 'デモを見る'
            
            // 技術タグの処理（配列または文字列に対応）
            const techs = Array.isArray(item.technologies) ? item.technologies : 
                         (typeof item.technologies === 'string' ? JSON.parse(item.technologies || '[]') : [])
            
            return `
            <div class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group">
              <div class="aspect-video overflow-hidden relative">
                <img loading="lazy" decoding="async" src="${item.image}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                ${item.demo_type === 'video' ? `
                  <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-play-circle text-white text-5xl"></i>
                  </div>
                ` : ''}
              </div>
              <div class="p-6">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-xs font-medium text-cafe-wood bg-cafe-latte/50 px-2 py-1 rounded">${item.category}</span>
                  ${item.demo_type ? `
                    <span class="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      <i class="fas ${demoTypeIcon} mr-1"></i>${item.demo_type === 'video' ? '動画' : item.demo_type === 'slides' ? 'スライド' : item.demo_type === 'image' ? '画像' : 'リンク'}
                    </span>
                  ` : ''}
                </div>
                <h3 class="text-xl font-bold text-cafe-text mb-2">${item.title}</h3>
                <p class="text-cafe-textLight text-sm mb-4 line-clamp-2">${item.description}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                  ${techs.slice(0, 4).map((tech: string) => `
                    <span class="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full">${tech}</span>
                  `).join('')}
                  ${techs.length > 4 ? `<span class="text-gray-400 text-xs">+${techs.length - 4}</span>` : ''}
                </div>
                <div class="flex gap-2 flex-wrap">
                  <!-- 詳細を見るボタン（DBからのデータにはslugがある） -->
                  ${item.slug ? `
                    <a href="/portfolio/${item.slug}" class="inline-flex items-center px-4 py-2 bg-cafe-wood text-white rounded-lg text-sm hover:bg-cafe-brown transition">
                      <i class="fas fa-info-circle mr-2"></i>詳細を見る
                    </a>
                  ` : ''}
                  ${item.demoUrl || item.video_url ? `
                    <a href="${item.video_url || item.demoUrl}" target="_blank" class="inline-flex items-center px-4 py-2 ${item.slug ? 'bg-blue-600 hover:bg-blue-700' : 'bg-cafe-wood hover:bg-cafe-brown'} text-white rounded-lg text-sm transition">
                      <i class="fas ${demoTypeIcon} mr-2"></i>${demoLabel}
                    </a>
                  ` : ''}
                  ${item.githubUrl ? `
                    <a href="${item.githubUrl}" target="_blank" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition">
                      <i class="fab fa-github mr-2"></i>GitHub
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
          `}).join('')}
        </div>
        
        <div class="text-center mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/portfolio" class="inline-flex items-center px-8 py-4 bg-cafe-wood text-white rounded-full font-bold hover:bg-cafe-brown hover:-translate-y-1 transition-all shadow-lg">
            <i class="fas fa-briefcase mr-2"></i>すべてのポートフォリオを見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
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
            <img loading="lazy" decoding="async" src="/static/companion-green.png" alt="リーフ" class="relative w-28 md:w-36 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char1 6s ease-in-out infinite;">
            <img loading="lazy" decoding="async" src="/static/companion-rabbit.png" alt="ロボうさぎ" class="relative w-32 md:w-40 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char2 7s ease-in-out infinite;">
            <img loading="lazy" decoding="async" src="/static/companion-pink.png" alt="ピンク" class="relative w-24 md:w-32 drop-shadow-xl hover:scale-110 transition-transform duration-500" style="animation: float-char3 5s ease-in-out infinite;">
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
              <i class="fas fa-hand-holding-heart text-nature-forest text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">初心者でも安心の丁寧な指導</h3>
            <p class="text-cafe-textLight">
              「AIって何？」からスタートでOK。一人ひとりのペースに合わせて丁寧にサポート
            </p>
          </div>
          
          <div class="card-hover bg-white p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-nature-sky rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-user-tie text-nature-blue text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">キャリアコンサルタントが<br>寄り添う</h3>
            <p class="text-cafe-textLight">
              AI技術だけでなく、あなたの仕事・学習スタイルに合わせた活用法を一緒に考えます
            </p>
          </div>
          
          <div class="card-hover bg-white p-8 text-center border border-cafe-beige shadow-md">
            <div class="w-20 h-20 bg-cafe-latte rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <i class="fas fa-users text-cafe-brown text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-cafe-text mb-3">少人数制でリラックスして学習</h3>
            <p class="text-cafe-textLight">
              最大10名の少人数制。質問しやすい雰囲気で、じっくり理解しながら進められます
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
                <img loading="lazy" decoding="async" src="${course.image}" alt="${course.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-700">
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
                <h3 class="text-lg font-bold text-cafe-text mb-2 line-clamp-2">${truncateText(course.title, 40)}</h3>
                <p class="text-cafe-textLight text-sm mb-4 line-clamp-2">${truncateText(course.description, 60)}</p>
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

    <!-- 8.5 お客様の声（口コミ）セクション -->
    <section class="py-20 bg-white relative overflow-hidden">
      <!-- 装飾 -->
      <div class="absolute top-0 left-0 w-64 h-64 bg-nature-mint rounded-full opacity-10 blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-80 h-80 bg-cafe-latte rounded-full opacity-10 blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-flex items-center bg-yellow-100 text-yellow-700 font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-star mr-2"></i>VOICE
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold text-cafe-text mb-3">お客様の声</h2>
          <p class="text-cafe-textLight">実際に受講された方々からのご感想</p>
        </div>
        
        <!-- 口コミ一覧（動的読み込み） -->
        <div id="reviews-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- ローディング -->
          <div class="col-span-full py-8 text-center text-cafe-textLight">
            <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>読み込み中...</p>
          </div>
        </div>
        
        <!-- もっと見るボタン -->
        <div id="reviews-more" class="hidden text-center mt-8">
          <a href="/courses" class="btn-outline inline-flex items-center px-6 py-3 font-medium">
            講座ページで全ての口コミを見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
      
      <script>
        // 口コミを取得して表示
        (async function() {
          try {
            const res = await fetch('/api/reviews/all?limit=10');
            const data = await res.json();
            const reviews = data.reviews || [];
            
            const container = document.getElementById('reviews-container');
            const moreBtn = document.getElementById('reviews-more');
            
            if (reviews.length === 0) {
              container.innerHTML = '<p class="col-span-full text-center text-cafe-textLight py-12">まだ口コミがありません</p>';
              return;
            }
            
            // 最大10件まで表示
            const displayReviews = reviews.slice(0, 10);
            
            container.innerHTML = displayReviews.map(review => {
              // 星評価を生成
              const stars = Array(5).fill(0).map((_, i) => 
                i < review.rating 
                  ? '<i class="fas fa-star text-yellow-400"></i>'
                  : '<i class="far fa-star text-gray-300"></i>'
              ).join('');
              
              // 日付フォーマット
              const date = review.created_at ? new Date(review.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }) : '';
              
              // コメントを短縮（100文字）
              const shortComment = review.comment && review.comment.length > 100 
                ? review.comment.substring(0, 100) + '...' 
                : review.comment || '';
              
              return \`
                <div class="bg-cafe-cream/50 rounded-xl p-6 border border-cafe-beige hover:shadow-lg transition-shadow">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-cafe-wood/20 flex items-center justify-center">
                        <i class="fas fa-user text-cafe-wood"></i>
                      </div>
                      <div>
                        <div class="font-medium text-cafe-text">\${review.reviewer_name || '匿名'}</div>
                        <div class="text-xs text-cafe-textLight">\${date}</div>
                      </div>
                    </div>
                    <div class="flex gap-0.5 text-sm">
                      \${stars}
                    </div>
                  </div>
                  <p class="text-cafe-textLight text-sm leading-relaxed">\${shortComment}</p>
                </div>
              \`;
            }).join('');
            
            // 口コミがあればもっと見るボタンを表示
            if (reviews.length > 0) {
              moreBtn.classList.remove('hidden');
            }
          } catch (error) {
            console.error('口コミ読み込みエラー:', error);
            document.getElementById('reviews-container').innerHTML = 
              '<p class="col-span-full text-center text-red-500 py-8">読み込みに失敗しました</p>';
          }
        })();
      </script>
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
    
    <!-- ワークスペース予約モーダル -->
    <div id="workspace-modal" class="workspace-modal-overlay" style="display:none;" onclick="if(event.target === this) closeWorkspaceModal()">
      <div class="workspace-modal cafe-door-frame">
        <!-- 閉じるボタン（タップしやすい大きさ） -->
        <button onclick="closeWorkspaceModal()" class="absolute top-2 right-2 sm:top-3 sm:right-3 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center bg-amber-900/80 hover:bg-amber-900 text-white rounded-full z-10 transition-colors shadow-lg" aria-label="閉じる">
          <i class="fas fa-times text-lg"></i>
        </button>
        <div class="cafe-door-header pt-12 sm:pt-8">
          <img loading="lazy" decoding="async" src="/static/miraicafe-cup.png" alt="mirAIcafe" class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 sm:mb-3 drop-shadow-md">
          <h2 class="text-xl sm:text-2xl font-bold text-amber-900">mirAIcafe ワークスペース</h2>
          <p class="text-amber-700 mt-1 sm:mt-2 text-sm sm:text-base">みんなでAIツールを触る時間☕</p>
        </div>
        <div class="cafe-door-content">
          <div class="mb-4">
            <p class="text-gray-600 text-sm leading-relaxed">
              講座のアフターフォローとして、受講者の皆様と一緒にAIツールを触る時間です。
              「ここどうやるの？」「こんな使い方あるよ！」など気軽に交流しましょう☕
            </p>
          </div>
          
          <!-- 注意書き -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p class="text-blue-800 text-xs leading-relaxed">
              <i class="fas fa-info-circle mr-1"></i>
              <strong>ご注意：</strong>こちらは気軽にAIを楽しむ交流の場です。<br>
              じっくり相談されたい方は<a href="/consultation" class="text-blue-600 underline font-medium hover:text-blue-800">個別相談</a>をご利用ください。
            </p>
          </div>
          
          <div class="bg-amber-50 rounded-xl p-4 mb-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-amber-800"><i class="fas fa-clock mr-2"></i>約1時間</span>
              <span class="text-amber-800"><i class="fas fa-users mr-2"></i>定員6名</span>
              <span class="text-amber-800 font-bold"><i class="fas fa-yen-sign mr-1"></i>500円</span>
            </div>
          </div>
          
          <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-calendar-alt mr-2 text-amber-600"></i>開催日程</h3>
          <div id="workspace-schedules" class="space-y-3 mb-6 max-h-64 overflow-y-auto">
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
              <p>読み込み中...</p>
            </div>
          </div>
          
          <div id="workspace-booking-form" class="hidden">
            <div class="border-t pt-4 mb-4">
              <h4 class="font-bold text-gray-800 mb-3"><i class="fas fa-user mr-2 text-amber-600"></i>お客様情報</h4>
              <div class="space-y-3">
                <input type="text" id="ws-name" placeholder="お名前" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <input type="email" id="ws-email" placeholder="メールアドレス" required class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
                <input type="tel" id="ws-phone" placeholder="電話番号（任意）" class="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
              </div>
            </div>
            
            <!-- 利用規約等のチェックボックス -->
            <div class="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ws-agree-terms" class="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" onchange="checkWsAgreements()">
                <span class="text-xs text-gray-700">
                  <a href="/terms" target="_blank" class="text-amber-600 underline">利用規約</a>に同意する
                </span>
              </label>
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ws-agree-cancellation" class="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" onchange="checkWsAgreements()">
                <span class="text-xs text-gray-700">
                  <a href="/cancellation-policy" target="_blank" class="text-amber-600 underline">キャンセルポリシー</a>に同意する
                </span>
              </label>
              <label class="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" id="ws-agree-commerce" class="mt-1 w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" onchange="checkWsAgreements()">
                <span class="text-xs text-gray-700">
                  <a href="/commerce" target="_blank" class="text-amber-600 underline">特定商取引法に基づく表記</a>を確認しました
                </span>
              </label>
            </div>
            
            <button onclick="processWorkspaceBooking()" id="ws-submit-btn" class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-credit-card mr-2"></i>500円で予約する
            </button>
            <p class="text-xs text-gray-400 text-center mt-2">決済はStripeで安全に処理されます</p>
          </div>
          
          <button onclick="closeWorkspaceModal()" class="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <i class="fas fa-times mr-2"></i>閉じる
          </button>
        </div>
      </div>
    </div>
    
    <script>
      let selectedWorkspaceSchedule = null;
      
      function openWorkspaceModal() {
        const modal = document.getElementById('workspace-modal');
        modal.style.display = 'flex';
        // 少し遅らせてクラス追加（アニメーション用）
        requestAnimationFrame(() => {
          modal.classList.add('active');
        });
        document.body.style.overflow = 'hidden';
        loadWorkspaceSchedules();
      }
      
      function closeWorkspaceModal() {
        const modal = document.getElementById('workspace-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        selectedWorkspaceSchedule = null;
        document.getElementById('workspace-booking-form').classList.add('hidden');
        // アニメーション完了後に非表示
        setTimeout(() => {
          modal.style.display = 'none';
        }, 300);
      }
      
      async function loadWorkspaceSchedules() {
        try {
          const res = await fetch('/api/workspace/schedules');
          const data = await res.json();
          const container = document.getElementById('workspace-schedules');
          
          if (!data.schedules || data.schedules.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500"><i class="fas fa-calendar-times text-3xl mb-2 opacity-50"></i><p>現在予約可能な日程はありません</p></div>';
            return;
          }
          
          container.innerHTML = data.schedules.map(s => {
            const remaining = s.capacity - s.enrolled;
            const isFull = remaining <= 0;
            const dateObj = new Date(s.date);
            const dateStr = dateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' });
            
            return '<div class="schedule-option border-2 rounded-xl p-4 cursor-pointer transition-all ' + (isFull ? 'opacity-50 cursor-not-allowed border-gray-200' : 'border-amber-200 hover:border-amber-500 hover:bg-amber-50') + '" data-id="' + s.id + '" onclick="' + (isFull ? '' : 'selectWorkspaceSchedule(this, \\'' + s.id + '\\')') + '">' +
              '<div class="flex justify-between items-center">' +
                '<div>' +
                  '<p class="font-bold text-gray-800">' + dateStr + '</p>' +
                  '<p class="text-sm text-gray-500">' + s.start_time + ' 〜 ' + s.end_time + '</p>' +
                '</div>' +
                '<span class="px-3 py-1 rounded-full text-sm font-medium ' + (isFull ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-600') + '">' +
                  (isFull ? '満席' : '残り' + remaining + '席') +
                '</span>' +
              '</div>' +
            '</div>';
          }).join('');
        } catch (error) {
          console.error('ワークスペーススケジュール取得エラー:', error);
          document.getElementById('workspace-schedules').innerHTML = '<div class="text-center py-8 text-red-500"><p>読み込みに失敗しました</p></div>';
        }
      }
      
      function selectWorkspaceSchedule(el, scheduleId) {
        // 選択状態をリセット
        document.querySelectorAll('.schedule-option').forEach(opt => {
          opt.classList.remove('border-amber-500', 'bg-amber-50', 'ring-2', 'ring-amber-500');
        });
        
        // 選択状態を設定
        el.classList.add('border-amber-500', 'bg-amber-50', 'ring-2', 'ring-amber-500');
        selectedWorkspaceSchedule = scheduleId;
        
        // 予約フォームを表示
        document.getElementById('workspace-booking-form').classList.remove('hidden');
        
        // チェックボックスをリセット
        document.getElementById('ws-agree-terms').checked = false;
        document.getElementById('ws-agree-cancellation').checked = false;
        document.getElementById('ws-agree-commerce').checked = false;
        document.getElementById('ws-submit-btn').disabled = true;
      }
      
      function checkWsAgreements() {
        const terms = document.getElementById('ws-agree-terms').checked;
        const cancellation = document.getElementById('ws-agree-cancellation').checked;
        const commerce = document.getElementById('ws-agree-commerce').checked;
        document.getElementById('ws-submit-btn').disabled = !(terms && cancellation && commerce);
      }
      
      async function processWorkspaceBooking() {
        if (!selectedWorkspaceSchedule) {
          alert('日程を選択してください');
          return;
        }
        
        const name = document.getElementById('ws-name').value.trim();
        const email = document.getElementById('ws-email').value.trim();
        const phone = document.getElementById('ws-phone').value.trim();
        
        if (!name || !email) {
          alert('お名前とメールアドレスは必須です');
          return;
        }
        
        const agreeTerms = document.getElementById('ws-agree-terms').checked;
        const agreeCancellation = document.getElementById('ws-agree-cancellation').checked;
        const agreeCommerce = document.getElementById('ws-agree-commerce').checked;
        
        if (!agreeTerms || !agreeCancellation || !agreeCommerce) {
          alert('利用規約、キャンセルポリシー、特定商取引法に基づく表記への同意が必要です');
          return;
        }
        
        try {
          const res = await fetch('/api/workspace/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              scheduleId: selectedWorkspaceSchedule,
              customerName: name,
              customerEmail: email,
              customerPhone: phone
            })
          });
          
          const data = await res.json();
          
          if (data.url) {
            window.location.href = data.url;
          } else {
            alert(data.error || '予約処理に失敗しました');
          }
        } catch (error) {
          console.error('予約エラー:', error);
          alert('予約処理中にエラーが発生しました');
        }
      }
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
      
      /* 個別相談バナーふわふわアニメーション */
      .consultation-banner-wrapper {
        animation: consultation-float 4s ease-in-out infinite;
      }
      
      .consultation-banner {
        filter: drop-shadow(0 4px 12px rgba(236, 72, 153, 0.3));
        transition: all 0.3s ease;
      }
      
      .consultation-banner-wrapper:hover .consultation-banner {
        filter: drop-shadow(0 8px 20px rgba(236, 72, 153, 0.5));
      }
      
      @keyframes consultation-float {
        0%, 100% { 
          transform: translateY(0px) rotate(-3deg); 
        }
        25% {
          transform: translateY(-8px) rotate(-1deg);
        }
        50% { 
          transform: translateY(-4px) rotate(2deg); 
        }
        75% {
          transform: translateY(-12px) rotate(0deg);
        }
      }
      
      /* カフェカップアニメーション */
      .cafe-cup-container {
        position: relative;
        display: inline-block;
        transition: transform 0.3s ease;
      }
      
      .cafe-cup-image {
        animation: float 3s ease-in-out infinite;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(-2deg); }
        50% { transform: translateY(-10px) rotate(2deg); }
      }
      
      .cafe-cup-container:hover .cafe-cup-image {
        animation: float-excited 0.5s ease-in-out infinite;
      }
      
      @keyframes float-excited {
        0%, 100% { transform: translateY(0px) rotate(-3deg) scale(1.05); }
        50% { transform: translateY(-5px) rotate(3deg) scale(1.05); }
      }
      
      /* ふわふわ湯気アニメーション */
      .steam-svg {
        position: absolute;
        top: -55px;
        left: 50%;
        transform: translateX(-50%);
        width: 110px;
        height: 70px;
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      
      .cafe-cup-container:hover .steam-svg {
        opacity: 1;
      }
      
      .steam-cloud {
        transform-origin: center;
      }
      
      .cafe-cup-container:hover .steam-1 {
        animation: steam-rise-1 2.5s ease-in-out infinite;
      }
      .cafe-cup-container:hover .steam-2 {
        animation: steam-rise-2 2.8s ease-in-out infinite;
      }
      .cafe-cup-container:hover .steam-3 {
        animation: steam-rise-3 2.3s ease-in-out infinite;
      }
      
      @keyframes steam-rise-1 {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
        50% { transform: translateY(-8px) scale(1.1); opacity: 0.8; }
      }
      @keyframes steam-rise-2 {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
        50% { transform: translateY(-10px) scale(1.15); opacity: 0.85; }
      }
      @keyframes steam-rise-3 {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
        50% { transform: translateY(-6px) scale(1.08); opacity: 0.75; }
      }
      
      /* ツールチップ */
      .cafe-tooltip {
        position: absolute;
        bottom: -50px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #92400e, #b45309);
        color: white;
        padding: 8px 12px;
        border-radius: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 4px 15px rgba(146, 64, 14, 0.3);
      }
      
      .cafe-tooltip::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 6px 6px 6px;
        border-style: solid;
        border-color: transparent transparent #92400e transparent;
      }
      
      .cafe-cup-container:hover .cafe-tooltip {
        opacity: 1;
        visibility: visible;
        bottom: -55px;
      }
      
      /* ワークスペースモーダル */
      .workspace-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        /* モバイルで枠外タップしやすいように大きめの余白 */
        padding: 1rem;
        overflow: hidden;
      }
      
      .workspace-modal-overlay.active {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
      }
      
      .workspace-modal {
        background: #fefce8;
        border-radius: 20px;
        max-width: 420px;
        width: calc(100% - 1rem);
        max-height: 85vh;
        overflow-y: auto;
        overscroll-behavior: contain;
        transform: scale(0.95) translateY(10px);
        transition: transform 0.3s ease;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        position: relative;
        -webkit-overflow-scrolling: touch;
        margin: auto;
      }
      
      .workspace-modal-overlay.active .workspace-modal {
        transform: scale(1) translateY(0);
      }
      
      /* カフェ扉風デザイン */
      .cafe-door-frame {
        border: 6px solid #92400e;
        border-radius: 16px;
        position: relative;
        overflow-x: hidden;
        overflow-y: auto;
      }
      
      .cafe-door-frame::before {
        content: '☕ OPEN ☕';
        position: absolute;
        top: -1px;
        left: 50%;
        transform: translateX(-50%);
        background: #92400e;
        color: #fef3c7;
        padding: 4px 16px;
        font-size: 11px;
        font-weight: bold;
        border-radius: 0 0 10px 10px;
        letter-spacing: 1px;
      }
      
      .cafe-door-header {
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        padding: 1.5rem 1rem 1rem;
        text-align: center;
        border-bottom: 2px dashed #d97706;
      }
      
      .cafe-door-content {
        padding: 1rem;
        background: white;
      }
      
      /* モバイル用追加スタイル */
      @media (max-width: 639px) {
        .workspace-modal {
          max-height: 90vh;
          margin: 0.5rem;
        }
        .cafe-door-content {
          padding-bottom: 2rem;
        }
      }
      
      @media (min-width: 640px) {
        .workspace-modal-overlay {
          padding: 2rem;
        }
        .workspace-modal {
          max-width: 480px;
          max-height: 90vh;
          border-radius: 24px;
        }
        .cafe-door-frame {
          border-width: 8px;
          border-radius: 20px;
        }
        .cafe-door-frame::before {
          padding: 4px 20px;
          font-size: 12px;
          letter-spacing: 2px;
        }
        .cafe-door-header {
          padding: 2rem 1.5rem 1.5rem;
        }
        .cafe-door-content {
          padding: 1.5rem;
        }
      }
      
      /* Modal scrollbar */
      .workspace-modal::-webkit-scrollbar {
        width: 6px;
      }
      .workspace-modal::-webkit-scrollbar-track {
        background: #fef3c7;
      }
      .workspace-modal::-webkit-scrollbar-thumb {
        background: #d97706;
        border-radius: 3px;
      }
    </style>
  `

  return renderLayout('ホーム', content, 'home')
}
