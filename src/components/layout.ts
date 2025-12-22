// Layout component with warm cafe design
export const renderLayout = (title: string, content: string, activeNav: string = '') => `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | mirAIcafe</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            cafe: {
              cream: '#FDF6E3',
              latte: '#F5E6D3',
              brown: '#8B4513',
              darkBrown: '#5D3A1A',
              caramel: '#C68E17',
              mocha: '#6B4423',
              espresso: '#3C2415',
              milk: '#FFFEF7'
            }
          },
          fontFamily: {
            display: ['Georgia', 'serif'],
            body: ['Noto Sans JP', 'sans-serif']
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; }
    .font-display { font-family: Georgia, serif; }
    .gradient-cafe { background: linear-gradient(135deg, #8B4513 0%, #C68E17 100%); }
    .coffee-pattern {
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B4513' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .nav-link { position: relative; }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: #C68E17;
      transition: width 0.3s ease;
    }
    .nav-link:hover::after,
    .nav-link.active::after { width: 100%; }
    .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(139, 69, 19, 0.15); }
    .btn-cafe { transition: all 0.3s ease; }
    .btn-cafe:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(139, 69, 19, 0.3); }
  </style>
</head>
<body class="bg-cafe-cream coffee-pattern min-h-screen flex flex-col">
  <!-- Header -->
  <header class="bg-cafe-milk/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <a href="/" class="flex items-center space-x-3 group">
          <div class="w-12 h-12 gradient-cafe rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <i class="fas fa-mug-hot text-white text-xl"></i>
          </div>
          <div>
            <span class="font-display text-2xl font-bold text-cafe-darkBrown">mirAI<span class="text-cafe-caramel">cafe</span></span>
            <p class="text-xs text-cafe-mocha -mt-1">AIを、もっと身近に。</p>
          </div>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a href="/" class="nav-link text-cafe-darkBrown hover:text-cafe-caramel font-medium ${activeNav === 'home' ? 'active' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="nav-link text-cafe-darkBrown hover:text-cafe-caramel font-medium ${activeNav === 'courses' ? 'active' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="nav-link text-cafe-darkBrown hover:text-cafe-caramel font-medium ${activeNav === 'reservation' ? 'active' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="nav-link text-cafe-darkBrown hover:text-cafe-caramel font-medium ${activeNav === 'blog' ? 'active' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="nav-link text-cafe-darkBrown hover:text-cafe-caramel font-medium ${activeNav === 'contact' ? 'active' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button id="mobile-menu-btn" class="md:hidden text-cafe-darkBrown p-2">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      <nav id="mobile-menu" class="hidden md:hidden pb-4">
        <div class="flex flex-col space-y-3">
          <a href="/" class="text-cafe-darkBrown hover:text-cafe-caramel font-medium py-2 ${activeNav === 'home' ? 'text-cafe-caramel' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="text-cafe-darkBrown hover:text-cafe-caramel font-medium py-2 ${activeNav === 'courses' ? 'text-cafe-caramel' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="text-cafe-darkBrown hover:text-cafe-caramel font-medium py-2 ${activeNav === 'reservation' ? 'text-cafe-caramel' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="text-cafe-darkBrown hover:text-cafe-caramel font-medium py-2 ${activeNav === 'blog' ? 'text-cafe-caramel' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="text-cafe-darkBrown hover:text-cafe-caramel font-medium py-2 ${activeNav === 'contact' ? 'text-cafe-caramel' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </div>
      </nav>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-grow">
    ${content}
  </main>

  <!-- Footer -->
  <footer class="bg-cafe-espresso text-cafe-cream mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-cafe-caramel rounded-full flex items-center justify-center">
              <i class="fas fa-mug-hot text-white"></i>
            </div>
            <span class="font-display text-xl font-bold">mirAI<span class="text-cafe-caramel">cafe</span></span>
          </div>
          <p class="text-cafe-latte/80 text-sm leading-relaxed">
            mirAIcafeは、AIスキルを気軽に学べるオンライン学習プラットフォームです。<br>
            温かいカフェのような雰囲気で、楽しみながらスキルアップしましょう。
          </p>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="font-bold text-cafe-caramel mb-4">クイックリンク</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="/courses" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors">講座一覧</a></li>
            <li><a href="/reservation" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors">予約</a></li>
            <li><a href="/blog" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors">ブログ</a></li>
            <li><a href="/contact" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors">お問い合わせ</a></li>
          </ul>
        </div>
        
        <!-- Contact Info -->
        <div>
          <h3 class="font-bold text-cafe-caramel mb-4">お問い合わせ</h3>
          <ul class="space-y-2 text-sm text-cafe-latte/80">
            <li><i class="fas fa-envelope mr-2"></i>info@miraicafe.jp</li>
            <li><i class="fas fa-clock mr-2"></i>平日 9:00 - 18:00</li>
          </ul>
          <div class="flex space-x-4 mt-4">
            <a href="#" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors"><i class="fab fa-twitter text-lg"></i></a>
            <a href="#" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors"><i class="fab fa-instagram text-lg"></i></a>
            <a href="#" class="text-cafe-latte/80 hover:text-cafe-caramel transition-colors"><i class="fab fa-youtube text-lg"></i></a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-cafe-mocha/30 mt-8 pt-8 text-center text-sm text-cafe-latte/60">
        <p>&copy; 2024 mirAIcafe. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', function() {
      const menu = document.getElementById('mobile-menu');
      menu?.classList.toggle('hidden');
    });
  </script>
</body>
</html>
`
