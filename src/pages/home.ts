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

    <!-- AI News Section -->
    <section id="ai-news" class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <span class="inline-flex items-center bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-robot mr-2"></i>AI NEWS
          </span>
          <h2 class="text-3xl font-bold text-cafe-text">最新AIニュース</h2>
          <p class="text-cafe-textLight mt-2">AI業界の最新トピックスをチェック</p>
        </div>
        
        <div class="news-scroll-container flex gap-5 overflow-x-auto pb-4 scroll-smooth" id="newsContainer" style="scrollbar-width: thin;">
          <p class="text-center text-cafe-textLight w-full py-8">準備中です。近日公開予定!</p>
        </div>
        
        <div class="text-center mt-6">
          <a href="/blog" class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition">
            もっと見る <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- Blog Section (大きめ、5件表示) -->
    <section id="blog" class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          ${recentPosts.slice(0, 5).map(post => `
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
      </div>
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-flex items-center bg-amber-100 text-amber-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-briefcase mr-2"></i>PORTFOLIO
          </span>
          <h2 class="text-4xl font-bold text-cafe-text">実績・ポートフォリオ</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="portfolioGrid">
          ${(portfolios || []).map(item => `
            <div class="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
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
      </div>
    </section>

    <!-- Profile Section -->
    <section id="profile" class="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-flex items-center bg-pink-100 text-pink-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-user-circle mr-2"></i>INSTRUCTOR
          </span>
          <h2 class="text-4xl font-bold text-cafe-text">講師紹介</h2>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-10 items-start">
          <!-- 左側: プロフィール画像 -->
          <div class="lg:w-80 flex-shrink-0 mx-auto lg:mx-0">
            <img src="/static/mion-profile.png" alt="mion(ミオン)" class="w-full max-w-xs mx-auto rounded-2xl shadow-xl">
          </div>
          
          <!-- 右側: プロフィール本文 -->
          <div class="flex-1">
            <h3 class="text-3xl font-bold text-cafe-text mb-2">mion(ミオン)</h3>
            <p class="text-lg text-cafe-textLight mb-6">現役AI講師 / AIキャリア教育コンサルタント</p>
            
            <div class="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm mb-8">
              <p class="text-lg leading-relaxed">「AIをカフェで学ぶように、気軽に・楽しく・実践的に。」<br>
              そんな想いで、mirAIcafeを運営しています。</p>
            </div>
            
            <h4 class="text-xl font-bold text-cafe-text mb-4 pb-2 border-b-2 border-blue-500">毎日、AIと共に働いています。</h4>
            <ul class="space-y-3 mb-8">
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>企業研修の資料作成</strong> → ChatGPT・Geminiで下書き、Geminiで仕上げ、リサーチにはGensparkを活用</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>高校での授業準備</strong> → AIで教材アイデア出し、Gemini・Kahoot・Canvaで授業構成、AIをキャリア教育に統合</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>Webアプリ開発</strong> → 要件定義からAIと相談、コーディング支援、デバッグまでAIと二人三脚</span>
              </li>
            </ul>
            
            <div class="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-400 mb-8">
              <p class="text-lg leading-relaxed">
                AIは「難しい技術」ではなく、<strong>「使い方次第で人生を豊かにする相棒」</strong>です。<br>
                私自身、<strong>AIは人の生き方を広げる相棒</strong>だと信じています。
              </p>
            </div>
            
            <h4 class="text-xl font-bold text-cafe-text mb-4 pb-2 border-b-2 border-blue-500">私の経歴</h4>
            <ul class="space-y-3 mb-8">
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>現役通信制高校講師(5年)</strong> メンタルヘルス・キャリア教育担当</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>キャリアコンサルタント資格保持</strong>（企業内キャリア支援部署立ち上げ経験）</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>ジム運営・エリアマネージャー</strong>（人材育成・店舗運営）</span>
              </li>
              <li class="flex items-start">
                <span class="text-blue-500 font-bold mr-3">✓</span>
                <span><strong>現在</strong>: 企業向けAI研修講師、AIアプリ開発</span>
              </li>
            </ul>
            
            <h4 class="text-xl font-bold text-cafe-text mb-4 pb-2 border-b-2 border-blue-500">こんな方におすすめ</h4>
            <div class="space-y-4 mb-8">
              <div class="border-b border-gray-200 pb-4">
                <p class="flex items-start">
                  <span class="text-blue-500 font-bold mr-3">✓</span>
                  <span><strong>「AIってそもそも何だろう?」</strong><br>
                  私もそこからスタートしました。安心してお越しください。</span>
                </p>
              </div>
              <div class="border-b border-gray-200 pb-4">
                <p class="flex items-start">
                  <span class="text-blue-500 font-bold mr-3">✓</span>
                  <span><strong>「受験勉強・資格勉強を効率化したい」</strong><br>
                  AIがあれば、必要な情報を瞬時に検索し、学習進捗を整理できます。NotebookLM、音声認識、YouTube要約など、勉強が加速するツールをご紹介します。</span>
                </p>
              </div>
              <div class="border-b border-gray-200 pb-4">
                <p class="flex items-start">
                  <span class="text-blue-500 font-bold mr-3">✓</span>
                  <span><strong>「業務効率化で時間を削減したい」</strong><br>
                  メール送信、報告書作成、データ分析が劇的に楽になります。スプレッドシート1枚から資料を自動生成したり、Excelデータから瞬時にグラフや分析レポートを作成することも可能です。</span>
                </p>
              </div>
              <div class="pb-4">
                <p class="flex items-start">
                  <span class="text-blue-500 font-bold mr-3">✓</span>
                  <span><strong>「教育現場でAIをどう活かせばいいか知りたい（先生向け）」</strong><br>
                  先生自身の活用法、生徒への教え方、著作権・個人情報・教科書問題など、安全な使い方を丁寧にサポートします。</span>
                </p>
              </div>
            </div>
            
            <h4 class="text-xl font-bold text-cafe-text mb-4 pb-2 border-b-2 border-blue-500">サービス内容</h4>
            <p class="mb-6">少人数制のオンライン研修、個別相談、キャリア×AI支援など、柔軟に対応します。<br>
            まずは無料相談から、お気軽にどうぞ!</p>
            
            <a href="https://hatarakustyle.jp/" target="_blank" class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">
              <i class="fas fa-external-link-alt mr-2"></i>メンタルヘルス・キャリアコンサルタントとしての活動はこちら
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Course Introduction Section (簡素化、講師情報削除) -->
    <section class="py-20 bg-cafe-cream/70 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-96 h-96 bg-nature-mint rounded-full opacity-20 blur-3xl"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center mb-12">
          <div class="text-center md:text-left mb-6 md:mb-0">
            <span class="inline-flex items-center bg-cafe-wood/20 text-cafe-wood font-medium px-4 py-2 rounded-full text-sm mb-4">
              <i class="fas fa-graduation-cap mr-2"></i>COURSES
            </span>
            <h2 class="text-4xl font-bold text-cafe-text">講座紹介</h2>
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

    <!-- Contact CTA Section -->
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
