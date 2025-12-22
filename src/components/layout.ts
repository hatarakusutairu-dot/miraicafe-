// Layout component with greenhouse cafe design - bright and warm atmosphere
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
            greenhouse: {
              ivory: '#FFFEF7',
              cream: '#FDF8F0',
              beige: '#F5EDE4',
              sand: '#E8DFD5',
              sage: '#C7E1B1',
              mint: '#BDDCB0',
              leaf: '#3ABD6F',
              sky: '#BDDCFA',
              wood: '#D2A679',
              warmwood: '#C8956C',
              text: '#4A4A4A',
              textLight: '#6B6B6B'
            },
            character: {
              green: '#3ABD6F',
              orange: '#FFB74C',
              pink: '#F7A1CB'
            }
          },
          fontFamily: {
            display: ['Rounded Mplus 1c', 'sans-serif'],
            body: ['Noto Sans JP', 'sans-serif']
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans JP', sans-serif; }
    .font-display { font-family: 'M PLUS Rounded 1c', sans-serif; }
    
    /* Gradient backgrounds */
    .gradient-hero { 
      background: linear-gradient(135deg, #FDF8F0 0%, #E8F5E9 50%, #BDDCFA 100%); 
    }
    .gradient-soft {
      background: linear-gradient(180deg, #FFFEF7 0%, #F5EDE4 100%);
    }
    .gradient-button {
      background: linear-gradient(135deg, #3ABD6F 0%, #2CA05A 100%);
    }
    .gradient-button-warm {
      background: linear-gradient(135deg, #FFB74C 0%, #FFA726 100%);
    }
    
    /* Wave animation */
    .wave-bg {
      position: absolute;
      width: 200%;
      height: 100%;
      left: -50%;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23C7E1B1' fill-opacity='0.4' d='M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
      background-size: 50% 100%;
      animation: wave 20s linear infinite;
    }
    .wave-bg-2 {
      animation-delay: -5s;
      opacity: 0.6;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23BDDCFA' fill-opacity='0.5' d='M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,128C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
      background-size: 50% 100%;
    }
    .wave-bg-3 {
      animation-delay: -10s;
      opacity: 0.4;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23D2A679' fill-opacity='0.3' d='M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,224C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
      background-size: 50% 100%;
    }
    @keyframes wave {
      0% { transform: translateX(0); }
      100% { transform: translateX(50%); }
    }
    
    /* Floating animation for characters */
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .float-animation {
      animation: float 3s ease-in-out infinite;
    }
    .float-animation-delay-1 {
      animation: float 3s ease-in-out infinite;
      animation-delay: 0.5s;
    }
    .float-animation-delay-2 {
      animation: float 3s ease-in-out infinite;
      animation-delay: 1s;
    }
    
    /* Card effects */
    .card-hover { 
      transition: transform 0.3s ease, box-shadow 0.3s ease; 
      border-radius: 1.5rem;
    }
    .card-hover:hover { 
      transform: translateY(-8px); 
      box-shadow: 0 20px 40px rgba(58, 189, 111, 0.15); 
    }
    
    /* Button effects */
    .btn-primary { 
      transition: all 0.3s ease; 
    }
    .btn-primary:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 20px rgba(58, 189, 111, 0.3); 
    }
    
    /* Navigation */
    .nav-link { position: relative; }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, #3ABD6F, #FFB74C);
      transition: width 0.3s ease;
      border-radius: 2px;
    }
    .nav-link:hover::after,
    .nav-link.active::after { width: 100%; }
    
    /* Glass effect */
    .glass {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    
    /* Leaf pattern background */
    .leaf-pattern {
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233ABD6F' fill-opacity='0.05'%3E%3Cpath d='M30 30c0-11 9-20 20-20s20 9 20 20-9 20-20 20-20-9-20-20zM10 10c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
  </style>
</head>
<body class="bg-greenhouse-ivory leaf-pattern min-h-screen flex flex-col">
  <!-- Header -->
  <header class="glass sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-3">
        <!-- Logo -->
        <a href="/" class="flex items-center space-x-3 group">
          <div class="relative">
            <img src="https://www.genspark.ai/api/files/s/q2cgvRKQ" alt="mirAIcafe" class="w-12 h-12 object-contain group-hover:scale-110 transition-transform">
          </div>
          <div>
            <span class="font-display text-2xl font-bold text-greenhouse-text">mir<span class="text-character-green">AI</span><span class="text-character-orange">cafe</span></span>
            <p class="text-xs text-greenhouse-textLight -mt-1">AIを、もっと身近に。</p>
          </div>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <a href="/" class="nav-link text-greenhouse-text hover:text-character-green font-medium ${activeNav === 'home' ? 'active' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="nav-link text-greenhouse-text hover:text-character-green font-medium ${activeNav === 'courses' ? 'active' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="nav-link text-greenhouse-text hover:text-character-green font-medium ${activeNav === 'reservation' ? 'active' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="nav-link text-greenhouse-text hover:text-character-green font-medium ${activeNav === 'blog' ? 'active' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="nav-link text-greenhouse-text hover:text-character-green font-medium ${activeNav === 'contact' ? 'active' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button id="mobile-menu-btn" class="md:hidden text-greenhouse-text p-2 hover:bg-greenhouse-beige rounded-lg transition-colors">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      <nav id="mobile-menu" class="hidden md:hidden pb-4">
        <div class="flex flex-col space-y-3 bg-white/50 rounded-2xl p-4">
          <a href="/" class="text-greenhouse-text hover:text-character-green font-medium py-2 px-4 rounded-lg hover:bg-greenhouse-sage/20 ${activeNav === 'home' ? 'bg-greenhouse-sage/30 text-character-green' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="text-greenhouse-text hover:text-character-green font-medium py-2 px-4 rounded-lg hover:bg-greenhouse-sage/20 ${activeNav === 'courses' ? 'bg-greenhouse-sage/30 text-character-green' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="text-greenhouse-text hover:text-character-green font-medium py-2 px-4 rounded-lg hover:bg-greenhouse-sage/20 ${activeNav === 'reservation' ? 'bg-greenhouse-sage/30 text-character-green' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="text-greenhouse-text hover:text-character-green font-medium py-2 px-4 rounded-lg hover:bg-greenhouse-sage/20 ${activeNav === 'blog' ? 'bg-greenhouse-sage/30 text-character-green' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="text-greenhouse-text hover:text-character-green font-medium py-2 px-4 rounded-lg hover:bg-greenhouse-sage/20 ${activeNav === 'contact' ? 'bg-greenhouse-sage/30 text-character-green' : ''}">
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
  <footer class="bg-gradient-to-br from-greenhouse-text to-gray-800 text-greenhouse-cream mt-16 relative overflow-hidden">
    <!-- Decorative wave -->
    <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden">
      <svg viewBox="0 0 1440 100" class="w-full h-full" preserveAspectRatio="none">
        <path fill="#FFFEF7" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
      </svg>
    </div>
    
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <img src="https://www.genspark.ai/api/files/s/q2cgvRKQ" alt="mirAIcafe" class="w-10 h-10 object-contain">
            <span class="font-display text-xl font-bold">mir<span class="text-character-green">AI</span><span class="text-character-orange">cafe</span></span>
          </div>
          <p class="text-greenhouse-beige/80 text-sm leading-relaxed">
            mirAIcafeは、AIスキルを気軽に学べるオンライン学習プラットフォームです。<br>
            温室カフェのような明るく開放的な雰囲気で、楽しみながらスキルアップしましょう。
          </p>
          <!-- Characters in footer -->
          <div class="flex gap-2 mt-4 opacity-80">
            <div class="w-8 h-8 rounded-full bg-character-green/20 flex items-center justify-center">
              <i class="fas fa-robot text-character-green text-xs"></i>
            </div>
            <div class="w-8 h-8 rounded-full bg-character-orange/20 flex items-center justify-center">
              <i class="fas fa-cat text-character-orange text-xs"></i>
            </div>
            <div class="w-8 h-8 rounded-full bg-character-pink/20 flex items-center justify-center">
              <i class="fas fa-star text-character-pink text-xs"></i>
            </div>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="font-bold text-character-green mb-4">クイックリンク</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="/courses" class="text-greenhouse-beige/80 hover:text-character-green transition-colors">講座一覧</a></li>
            <li><a href="/reservation" class="text-greenhouse-beige/80 hover:text-character-green transition-colors">予約</a></li>
            <li><a href="/blog" class="text-greenhouse-beige/80 hover:text-character-green transition-colors">ブログ</a></li>
            <li><a href="/contact" class="text-greenhouse-beige/80 hover:text-character-green transition-colors">お問い合わせ</a></li>
          </ul>
        </div>
        
        <!-- Contact Info -->
        <div>
          <h3 class="font-bold text-character-orange mb-4">お問い合わせ</h3>
          <ul class="space-y-2 text-sm text-greenhouse-beige/80">
            <li><i class="fas fa-envelope mr-2 text-character-orange"></i>info@miraicafe.jp</li>
            <li><i class="fas fa-clock mr-2 text-character-orange"></i>平日 9:00 - 18:00</li>
          </ul>
          <div class="flex space-x-4 mt-4">
            <a href="#" class="text-greenhouse-beige/80 hover:text-character-green transition-colors"><i class="fab fa-twitter text-lg"></i></a>
            <a href="#" class="text-greenhouse-beige/80 hover:text-character-pink transition-colors"><i class="fab fa-instagram text-lg"></i></a>
            <a href="#" class="text-greenhouse-beige/80 hover:text-character-orange transition-colors"><i class="fab fa-youtube text-lg"></i></a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-greenhouse-beige/60">
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
