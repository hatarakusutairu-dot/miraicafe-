import { renderLayout } from '../components/layout'

// 簡易Markdown→HTML変換
function markdownToHtml(markdown: string): string {
  if (!markdown) return ''
  
  let html = markdown
    // エスケープ処理
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // 見出し
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-cafe-text mt-6 mb-3">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-cafe-text mt-8 mb-4 flex items-center"><i class="fas fa-chevron-right text-amber-500 mr-2 text-sm"></i>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-cafe-text mt-8 mb-4">$1</h1>')
  
  // 太字・斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-cafe-text">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  
  // リスト（箇条書き）
  html = html.replace(/^[-*] (.+)$/gm, '<li class="flex items-start gap-2 mb-2"><i class="fas fa-check text-amber-500 mt-1 text-sm"></i><span>$1</span></li>')
  
  // 連続するliをulでラップ
  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, (match) => {
    return `<ul class="space-y-1 my-4">${match}</ul>`
  })
  
  // コードブロック
  html = html.replace(/```([^`]+)```/g, '<pre class="bg-gray-800 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto text-sm"><code>$1</code></pre>')
  
  // インラインコード
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-amber-700 px-1.5 py-0.5 rounded text-sm">$1</code>')
  
  // リンク
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-600 hover:text-amber-700 underline" target="_blank" rel="noopener">$1</a>')
  
  // 段落（空行で区切られたテキスト）
  const lines = html.split('\n')
  let result = ''
  let inParagraph = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 見出し、ul、pre、空行はそのまま
    if (line.startsWith('<h') || line.startsWith('<ul') || line.startsWith('</ul') || 
        line.startsWith('<pre') || line.startsWith('</pre') || line.startsWith('<li') ||
        line === '') {
      if (inParagraph) {
        result += '</p>'
        inParagraph = false
      }
      result += line + '\n'
    } else {
      if (!inParagraph) {
        result += '<p class="mb-4 leading-relaxed">'
        inParagraph = true
      } else {
        result += '<br>'
      }
      result += line
    }
  }
  
  if (inParagraph) {
    result += '</p>'
  }
  
  return result
}

interface Portfolio {
  id: number
  title: string
  slug: string
  description: string | null
  category: string
  thumbnail: string | null
  demo_type: string
  demo_url: string | null
  github_url: string | null
  live_url: string | null
  video_url: string | null
  images: string
  technologies: string
  content: string | null
  duration: string | null
  client: string | null
  role: string | null
  status: string
  meta_description: string | null
  keywords: string | null
  created_at: string
}

// ポートフォリオ一覧ページ
export const renderPortfolioListPage = (portfolios: Portfolio[]) => {
  const content = `
    <!-- Custom Styles for Portfolio Page -->
    <style>
      @keyframes float-gentle {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(3deg); }
      }
      @keyframes pulse-soft {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.05); }
      }
      @keyframes slide-up {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .portfolio-float-1 { animation: float-gentle 8s ease-in-out infinite; }
      .portfolio-float-2 { animation: float-gentle 10s ease-in-out infinite 1s; }
      .portfolio-float-3 { animation: float-gentle 12s ease-in-out infinite 2s; }
      .portfolio-pulse { animation: pulse-soft 4s ease-in-out infinite; }
      .portfolio-card {
        animation: slide-up 0.6s ease-out forwards;
        opacity: 0;
      }
      .portfolio-card:nth-child(1) { animation-delay: 0.1s; }
      .portfolio-card:nth-child(2) { animation-delay: 0.2s; }
      .portfolio-card:nth-child(3) { animation-delay: 0.3s; }
      .portfolio-card:nth-child(4) { animation-delay: 0.4s; }
      .portfolio-card:nth-child(5) { animation-delay: 0.5s; }
      .portfolio-card:nth-child(6) { animation-delay: 0.6s; }
    </style>

    <!-- Hero Section -->
    <section class="relative py-24 bg-gradient-to-br from-cafe-cream via-cafe-ivory to-white overflow-hidden">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute w-72 h-72 bg-amber-200/30 rounded-full blur-3xl portfolio-float-1" style="top: 10%; left: 5%;"></div>
        <div class="absolute w-96 h-96 bg-purple-200/20 rounded-full blur-3xl portfolio-float-2" style="top: 50%; right: 10%;"></div>
        <div class="absolute w-64 h-64 bg-blue-200/25 rounded-full blur-3xl portfolio-float-3" style="bottom: 10%; left: 30%;"></div>
        
        <!-- Decorative shapes -->
        <div class="absolute w-4 h-4 bg-amber-400/40 rounded-full portfolio-pulse" style="top: 20%; left: 15%;"></div>
        <div class="absolute w-3 h-3 bg-purple-400/40 rounded-full portfolio-pulse" style="top: 40%; right: 20%;"></div>
        <div class="absolute w-5 h-5 bg-blue-400/30 rounded-full portfolio-pulse" style="bottom: 30%; left: 40%;"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-semibold px-5 py-2.5 rounded-full text-sm mb-6 shadow-sm">
          <i class="fas fa-briefcase mr-2"></i>PORTFOLIO
        </span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-cafe-text mb-6">
          実績・<span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">ポートフォリオ</span>
        </h1>
        <p class="text-lg md:text-xl text-cafe-textLight max-w-2xl mx-auto leading-relaxed">
          AIツールを活用して制作したプロジェクトや作品をご紹介します
        </p>
      </div>
    </section>
    
    <!-- Portfolio Grid -->
    <section class="py-20 bg-white relative">
      <!-- Subtle background pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${portfolios.length > 0 ? `
          <!-- Category Filter (future enhancement) -->
          <div class="flex justify-center mb-12">
            <div class="inline-flex items-center gap-2 text-sm text-cafe-textLight">
              <i class="fas fa-layer-group"></i>
              <span>${portfolios.length}件のプロジェクト</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${portfolios.map((portfolio, index) => {
              const technologies = JSON.parse(portfolio.technologies || '[]') as string[]
              const demoTypeIcon = portfolio.demo_type === 'video' ? 'fa-play-circle' : 
                                   portfolio.demo_type === 'slides' ? 'fa-images' : 
                                   portfolio.demo_type === 'image' ? 'fa-image' : 'fa-external-link-alt'
              const demoTypeLabel = portfolio.demo_type === 'video' ? '動画' : 
                                    portfolio.demo_type === 'slides' ? 'スライド' : 
                                    portfolio.demo_type === 'image' ? '画像' : 'リンク'
              
              return `
                <a href="/portfolio/${portfolio.slug}" class="portfolio-card group block">
                  <div class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100/80">
                    <!-- Image Container -->
                    <div class="aspect-[16/10] overflow-hidden relative bg-gray-100">
                      ${portfolio.thumbnail ? `
                        <img src="${portfolio.thumbnail}" alt="${portfolio.title}" 
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
                      ` : `
                        <div class="w-full h-full bg-gradient-to-br from-amber-50 via-orange-50 to-purple-50 flex items-center justify-center">
                          <i class="fas fa-briefcase text-5xl text-amber-300/60"></i>
                        </div>
                      `}
                      
                      <!-- Overlay on hover -->
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span class="text-white font-medium text-sm">
                          <i class="fas fa-arrow-right mr-2"></i>詳細を見る
                        </span>
                      </div>
                      
                      <!-- Demo Type Badge -->
                      ${portfolio.demo_type ? `
                        <div class="absolute top-3 right-3">
                          <span class="bg-white/95 backdrop-blur-sm text-xs font-medium text-gray-700 px-3 py-1.5 rounded-full shadow-sm">
                            <i class="fas ${demoTypeIcon} mr-1 text-amber-500"></i>${demoTypeLabel}
                          </span>
                        </div>
                      ` : ''}
                    </div>
                    
                    <!-- Content -->
                    <div class="p-6">
                      <div class="flex items-center gap-2 mb-3">
                        <span class="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">${portfolio.category}</span>
                      </div>
                      
                      <h3 class="text-lg font-bold text-cafe-text mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">${portfolio.title}</h3>
                      <p class="text-cafe-textLight text-sm mb-4 line-clamp-2 leading-relaxed">${portfolio.description || 'プロジェクトの詳細はクリックしてご確認ください'}</p>
                      
                      <!-- Technologies -->
                      <div class="flex flex-wrap gap-1.5">
                        ${technologies.slice(0, 3).map(tech => `
                          <span class="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">${tech}</span>
                        `).join('')}
                        ${technologies.length > 3 ? `<span class="text-gray-400 text-xs flex items-center">+${technologies.length - 3}</span>` : ''}
                      </div>
                    </div>
                  </div>
                </a>
              `
            }).join('')}
          </div>
        ` : `
          <!-- Empty State -->
          <div class="text-center py-24">
            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i class="fas fa-folder-open text-4xl text-gray-300"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-600 mb-2">ポートフォリオはまだありません</h3>
            <p class="text-gray-400">制作物が追加されるまでお待ちください</p>
          </div>
        `}
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-br from-cafe-cream/80 via-amber-50/50 to-orange-50/30 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div class="absolute w-64 h-64 bg-amber-200/20 rounded-full blur-3xl portfolio-float-2" style="top: -20%; right: 10%;"></div>
        <div class="absolute w-48 h-48 bg-orange-200/20 rounded-full blur-3xl portfolio-float-3" style="bottom: -10%; left: 20%;"></div>
      </div>
      
      <div class="relative max-w-4xl mx-auto px-4 text-center">
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-white/50">
          <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i class="fas fa-comments text-2xl text-white"></i>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-cafe-text mb-4">プロジェクトのご相談</h2>
          <p class="text-cafe-textLight mb-8 max-w-lg mx-auto">
            AIツールを活用したプロジェクトや業務改善について、<br class="hidden md:inline">お気軽にご相談ください
          </p>
          <a href="/contact" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold hover:from-amber-600 hover:to-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
            <i class="fas fa-envelope mr-2"></i>お問い合わせはこちら
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  `
  
  return renderLayout('実績・ポートフォリオ', content, '')
}

interface Course {
  id: string
  title: string
  description: string
  price: number
  duration: string
  level: string
  category: string
  image: string
}

// ポートフォリオ詳細ページ
export const renderPortfolioDetailPage = (portfolio: Portfolio, relatedPortfolios: Portfolio[], courses: Course[] = []) => {
  const technologies = JSON.parse(portfolio.technologies || '[]') as string[]
  const images = JSON.parse(portfolio.images || '[]') as string[]
  
  // YouTube埋め込み用のID抽出
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }
  
  const youtubeId = portfolio.video_url ? getYouTubeId(portfolio.video_url) : null
  
  const content = `
    <!-- Custom Styles -->
    <style>
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fade-in-up 0.6s ease-out forwards; }
    </style>

    <!-- Hero Section -->
    <section class="relative py-16 bg-gradient-to-br from-cafe-cream via-cafe-ivory to-white overflow-hidden">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" style="top: 10%; right: 10%;"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href="/portfolio" class="inline-flex items-center text-cafe-textLight hover:text-amber-600 transition mb-8 group">
          <i class="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>ポートフォリオ一覧に戻る
        </a>
        
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <span class="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-semibold px-4 py-1.5 rounded-full text-sm">
            ${portfolio.category}
          </span>
          ${portfolio.demo_type ? `
            <span class="bg-blue-50 text-blue-600 font-medium px-4 py-1.5 rounded-full text-sm">
              <i class="fas fa-${portfolio.demo_type === 'video' ? 'video' : portfolio.demo_type === 'slides' ? 'images' : portfolio.demo_type === 'image' ? 'image' : 'link'} mr-1"></i>
              ${portfolio.demo_type === 'video' ? '動画あり' : portfolio.demo_type === 'slides' ? 'スライドあり' : portfolio.demo_type === 'image' ? '画像あり' : 'デモあり'}
            </span>
          ` : ''}
        </div>
        
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-cafe-text mb-6">${portfolio.title}</h1>
        <p class="text-lg text-cafe-textLight max-w-3xl leading-relaxed">${portfolio.description || ''}</p>
      </div>
    </section>
    
    <!-- Main Content -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <!-- メインコンテンツ -->
          <div class="lg:col-span-2 space-y-8">
            
            <!-- メディア表示 -->
            ${portfolio.demo_type === 'video' && youtubeId ? `
              <div class="aspect-video rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                <iframe src="https://www.youtube.com/embed/${youtubeId}" 
                  class="w-full h-full" frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen></iframe>
              </div>
            ` : portfolio.thumbnail ? `
              <div class="rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                <img src="${portfolio.thumbnail}" alt="${portfolio.title}" class="w-full">
              </div>
            ` : ''}
            
            ${images.length > 0 ? `
              <!-- 画像ギャラリー -->
              <div class="animate-fade-in" style="animation-delay: 0.1s;">
                <h2 class="text-xl font-bold text-cafe-text mb-4 flex items-center">
                  <i class="fas fa-images text-amber-500 mr-2"></i>ギャラリー
                </h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  ${images.map((img, i) => `
                    <div class="aspect-video rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition shadow-md hover:shadow-lg" onclick="openLightbox('${img}')">
                      <img src="${img}" alt="画像 ${i + 1}" class="w-full h-full object-cover">
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            ${portfolio.content ? `
              <!-- 詳細説明 -->
              <div class="animate-fade-in" style="animation-delay: 0.2s;">
                <h2 class="text-xl font-bold text-cafe-text mb-4 flex items-center">
                  <i class="fas fa-file-alt text-green-500 mr-2"></i>プロジェクト詳細
                </h2>
                <div class="prose prose-lg max-w-none text-cafe-textLight bg-gray-50 rounded-xl p-6">
                  ${markdownToHtml(portfolio.content)}
                </div>
              </div>
            ` : ''}
          </div>
          
          <!-- サイドバー -->
          <div class="space-y-6">
            
            <!-- プロジェクト情報 -->
            <div class="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-100">
              <h3 class="text-lg font-bold text-cafe-text mb-4">プロジェクト情報</h3>
              <dl class="space-y-4">
                ${portfolio.client ? `
                  <div class="flex items-start gap-3">
                    <i class="fas fa-building text-gray-400 mt-1"></i>
                    <div>
                      <dt class="text-xs text-gray-500">クライアント</dt>
                      <dd class="font-medium text-cafe-text">${portfolio.client}</dd>
                    </div>
                  </div>
                ` : ''}
                ${portfolio.role ? `
                  <div class="flex items-start gap-3">
                    <i class="fas fa-user-tag text-gray-400 mt-1"></i>
                    <div>
                      <dt class="text-xs text-gray-500">担当</dt>
                      <dd class="font-medium text-cafe-text">${portfolio.role}</dd>
                    </div>
                  </div>
                ` : ''}
                ${portfolio.duration ? `
                  <div class="flex items-start gap-3">
                    <i class="fas fa-clock text-gray-400 mt-1"></i>
                    <div>
                      <dt class="text-xs text-gray-500">制作期間</dt>
                      <dd class="font-medium text-cafe-text">${portfolio.duration}</dd>
                    </div>
                  </div>
                ` : ''}
                <div class="flex items-start gap-3">
                  <i class="fas fa-folder text-gray-400 mt-1"></i>
                  <div>
                    <dt class="text-xs text-gray-500">カテゴリ</dt>
                    <dd class="font-medium text-cafe-text">${portfolio.category}</dd>
                  </div>
                </div>
              </dl>
            </div>
            
            <!-- 使用ツール -->
            ${technologies.length > 0 ? `
              <div class="bg-gradient-to-br from-purple-50 to-blue-50/50 rounded-2xl p-6 border border-purple-100/50">
                <h3 class="text-lg font-bold text-cafe-text mb-4 flex items-center">
                  <i class="fas fa-tools text-purple-500 mr-2"></i>使用ツール
                </h3>
                <div class="flex flex-wrap gap-2">
                  ${technologies.map(tech => `
                    <span class="bg-white text-gray-700 text-sm px-3 py-1.5 rounded-lg font-medium shadow-sm border border-gray-100">${tech}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- リンク -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 class="text-lg font-bold text-cafe-text mb-4">リンク</h3>
              <div class="space-y-3">
                ${portfolio.live_url ? `
                  <a href="${portfolio.live_url}" target="_blank" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition group">
                    <span class="flex items-center text-cafe-text">
                      <i class="fas fa-globe text-blue-500 mr-3"></i>公開サイト
                    </span>
                    <i class="fas fa-external-link-alt text-gray-400 group-hover:text-blue-500 transition"></i>
                  </a>
                ` : ''}
                ${portfolio.demo_url ? `
                  <a href="${portfolio.demo_url}" target="_blank" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition group">
                    <span class="flex items-center text-cafe-text">
                      <i class="fas fa-play-circle text-green-500 mr-3"></i>デモを見る
                    </span>
                    <i class="fas fa-external-link-alt text-gray-400 group-hover:text-green-500 transition"></i>
                  </a>
                ` : ''}
                ${portfolio.github_url ? `
                  <a href="${portfolio.github_url}" target="_blank" class="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                    <span class="flex items-center text-cafe-text">
                      <i class="fab fa-github text-gray-800 mr-3"></i>GitHub
                    </span>
                    <i class="fas fa-external-link-alt text-gray-400 group-hover:text-gray-800 transition"></i>
                  </a>
                ` : ''}
                ${!portfolio.live_url && !portfolio.demo_url && !portfolio.github_url ? `
                  <p class="text-gray-400 text-sm text-center py-2">リンクはありません</p>
                ` : ''}
              </div>
            </div>
            
            <!-- お問い合わせ -->
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
              <h3 class="text-lg font-bold text-cafe-text mb-2">同じようなプロジェクトを<br>作りたい方へ</h3>
              <p class="text-sm text-cafe-textLight mb-4">お気軽にご相談ください</p>
              <a href="/contact" class="block text-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-3 rounded-xl transition shadow-md hover:shadow-lg">
                <i class="fas fa-envelope mr-2"></i>お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    ${relatedPortfolios.length > 0 ? `
      <!-- 関連ポートフォリオ -->
      <section class="py-16 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-2xl font-bold text-cafe-text mb-8">その他のポートフォリオ</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${relatedPortfolios.slice(0, 3).map(p => {
              const techs = JSON.parse(p.technologies || '[]') as string[]
              return `
                <a href="/portfolio/${p.slug}" class="group">
                  <div class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div class="aspect-video overflow-hidden">
                      ${p.thumbnail ? `
                        <img src="${p.thumbnail}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                      ` : `
                        <div class="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                          <i class="fas fa-briefcase text-3xl text-amber-300"></i>
                        </div>
                      `}
                    </div>
                    <div class="p-5">
                      <span class="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">${p.category}</span>
                      <h3 class="font-bold text-cafe-text mt-2 group-hover:text-amber-600 transition">${p.title}</h3>
                      <div class="flex flex-wrap gap-1 mt-3">
                        ${techs.slice(0, 2).map(t => `<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">${t}</span>`).join('')}
                      </div>
                    </div>
                  </div>
                </a>
              `
            }).join('')}
          </div>
        </div>
      </section>
    ` : ''}
    
    <!-- 関連講座紹介 -->
    ${courses.length > 0 ? `
    <section class="py-16 bg-gradient-to-br from-cafe-cream/80 via-amber-50/50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <span class="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 font-semibold px-5 py-2.5 rounded-full text-sm mb-4">
            <i class="fas fa-graduation-cap mr-2"></i>COURSES
          </span>
          <h2 class="text-2xl md:text-3xl font-bold text-cafe-text">AIを学んでみませんか？</h2>
          <p class="text-cafe-textLight mt-3 max-w-lg mx-auto">
            mirAIcafeの講座で、AIツールの使い方を<br class="hidden sm:inline">基礎から学べます
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${courses.map(course => `
            <a href="/courses/${course.id}" class="group block">
              <div class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div class="aspect-video overflow-hidden relative">
                  <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                  <div class="absolute top-3 left-3">
                    <span class="bg-white/95 backdrop-blur-sm text-xs font-semibold text-amber-700 px-3 py-1 rounded-full">${course.category}</span>
                  </div>
                </div>
                <div class="p-5">
                  <h3 class="font-bold text-cafe-text group-hover:text-amber-600 transition-colors line-clamp-1">${course.title}</h3>
                  <p class="text-sm text-cafe-textLight mt-2 line-clamp-2">${course.description}</p>
                  <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                      <span><i class="fas fa-clock mr-1"></i>${course.duration}</span>
                      <span><i class="fas fa-signal mr-1"></i>${course.level}</span>
                    </div>
                    <span class="text-amber-600 font-bold">${course.price === 0 ? '無料' : '¥' + course.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
        
        <div class="text-center mt-10">
          <a href="/courses" class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-bold hover:from-amber-600 hover:to-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl">
            <i class="fas fa-th-list mr-2"></i>すべての講座を見る
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
    ` : ''}
    
    <!-- Lightbox -->
    <div id="lightbox" class="fixed inset-0 bg-black/95 z-50 hidden items-center justify-center p-4" onclick="closeLightbox()">
      <button class="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition" onclick="closeLightbox()">
        <i class="fas fa-times"></i>
      </button>
      <img id="lightbox-img" src="" class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onclick="event.stopPropagation()">
    </div>
    
    <script>
      function openLightbox(src) {
        document.getElementById('lightbox-img').src = src;
        document.getElementById('lightbox').classList.remove('hidden');
        document.getElementById('lightbox').classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
      
      function closeLightbox() {
        document.getElementById('lightbox').classList.add('hidden');
        document.getElementById('lightbox').classList.remove('flex');
        document.body.style.overflow = '';
      }
      
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
      });
    </script>
  `
  
  return renderLayout(portfolio.title, content, '')
}
