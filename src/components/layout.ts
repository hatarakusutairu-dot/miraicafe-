// Layout component - Bright futuristic greenhouse + AI aesthetic
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
            future: {
              white: '#FFFFFF',
              ivory: '#FAFCFF',
              light: '#F0F7FF',
              sky: '#E8F4FD',
              aqua: '#B8E4F0',
              mint: '#C5EBE0',
              sage: '#A8D5BA',
              ocean: '#64B5C6',
              teal: '#2DD4BF',
              blue: '#3B82F6',
              indigo: '#6366F1',
              violet: '#8B5CF6',
              text: '#1E293B',
              textLight: '#64748B',
              glass: 'rgba(255, 255, 255, 0.7)'
            },
            ai: {
              cyan: '#22D3EE',
              blue: '#3B82F6',
              purple: '#A855F7',
              pink: '#EC4899',
              gradient1: '#06B6D4',
              gradient2: '#3B82F6',
              gradient3: '#8B5CF6'
            }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { font-family: 'Inter', 'Noto Sans JP', sans-serif; }
    
    /* AI Gradient */
    .gradient-ai { 
      background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%);
    }
    .gradient-ai-light {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%);
    }
    .gradient-ai-text {
      background: linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Glass morphism */
    .glass {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
    .glass-dark {
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    
    /* Animated background orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
      animation: float 20s ease-in-out infinite;
    }
    .orb-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #22D3EE, #3B82F6);
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }
    .orb-2 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #A855F7, #EC4899);
      top: 50%;
      right: -50px;
      animation-delay: -5s;
    }
    .orb-3 {
      width: 350px;
      height: 350px;
      background: linear-gradient(135deg, #2DD4BF, #22D3EE);
      bottom: -100px;
      left: 30%;
      animation-delay: -10s;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(30px, -30px) scale(1.05); }
      50% { transform: translate(-20px, 20px) scale(0.95); }
      75% { transform: translate(20px, 30px) scale(1.02); }
    }
    
    /* Particle animation */
    .particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: linear-gradient(135deg, #22D3EE, #3B82F6);
      border-radius: 50%;
      animation: rise 15s ease-in-out infinite;
    }
    @keyframes rise {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(-100vh) scale(1); opacity: 0; }
    }
    
    /* Glow effect */
    .glow {
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
    }
    .glow-text {
      text-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
    
    /* Hover effects */
    .card-hover {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 24px;
    }
    .card-hover:hover {
      transform: translateY(-8px);
      box-shadow: 0 25px 50px rgba(59, 130, 246, 0.15);
    }
    
    .btn-ai {
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .btn-ai::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .btn-ai:hover::before { opacity: 1; }
    .btn-ai:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
    }
    
    /* Navigation */
    .nav-link {
      position: relative;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      transition: all 0.3s ease;
    }
    .nav-link:hover, .nav-link.active {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    }
    .nav-link.active {
      color: #3B82F6;
    }
    
    /* Smooth scroll */
    html { scroll-behavior: smooth; }
    
    /* Animated border */
    .border-gradient {
      position: relative;
      background: white;
      border-radius: 24px;
    }
    .border-gradient::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(135deg, #06B6D4, #3B82F6, #8B5CF6);
      border-radius: 26px;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .border-gradient:hover::before { opacity: 1; }
    
    /* Pulse animation */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
    }
    .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
    
    /* Wave animation - organic curves like the greenhouse architecture */
    .wave-organic {
      position: absolute;
      width: 200%;
      height: 100%;
      left: -50%;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%2322D3EE' fill-opacity='0.1' d='M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") repeat-x;
      background-size: 50% 100%;
      animation: wave-flow 25s linear infinite;
    }
    @keyframes wave-flow {
      0% { transform: translateX(0); }
      100% { transform: translateX(50%); }
    }
    
    /* Floating Characters - Scroll Following */
    .floating-characters {
      position: fixed;
      z-index: 40;
      pointer-events: none;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
    }
    
    .floating-character {
      position: absolute;
      transition: transform 0.3s ease-out;
      filter: drop-shadow(0 10px 20px rgba(0,0,0,0.15));
      opacity: 0.95;
    }
    
    /* Character 1 - Green Alien (Left) */
    .char-alien {
      width: 100px;
      height: auto;
      left: 20px;
      top: 30%;
      animation: float-alien 6s ease-in-out infinite;
    }
    
    /* Character 2 - Robot Rabbit (Right Top) */
    .char-rabbit {
      width: 140px;
      height: auto;
      right: 30px;
      top: 20%;
      animation: float-rabbit 7s ease-in-out infinite;
    }
    
    /* Character 3 - Pink Girl (Right Bottom) */
    .char-pink {
      width: 90px;
      height: auto;
      right: 50px;
      bottom: 25%;
      animation: float-pink 5s ease-in-out infinite;
    }
    
    @keyframes float-alien {
      0%, 100% { 
        transform: translateY(0) rotate(-3deg) scale(1); 
      }
      25% {
        transform: translateY(-20px) rotate(2deg) scale(1.02);
      }
      50% { 
        transform: translateY(-35px) rotate(-2deg) scale(1.05); 
      }
      75% {
        transform: translateY(-15px) rotate(1deg) scale(1.02);
      }
    }
    
    @keyframes float-rabbit {
      0%, 100% { 
        transform: translateY(0) rotate(2deg) scale(1); 
      }
      33% { 
        transform: translateY(-25px) rotate(-3deg) scale(1.03); 
      }
      66% { 
        transform: translateY(-40px) rotate(3deg) scale(1.06); 
      }
    }
    
    @keyframes float-pink {
      0%, 100% { 
        transform: translateY(0) translateX(0) rotate(0deg); 
      }
      25% {
        transform: translateY(-15px) translateX(5px) rotate(3deg);
      }
      50% { 
        transform: translateY(-30px) translateX(-5px) rotate(-3deg); 
      }
      75% {
        transform: translateY(-20px) translateX(8px) rotate(2deg);
      }
    }
    
    /* Responsive adjustments */
    @media (max-width: 1024px) {
      .char-alien { width: 70px; left: 10px; }
      .char-rabbit { width: 100px; right: 10px; }
      .char-pink { width: 65px; right: 20px; }
    }
    
    @media (max-width: 768px) {
      .floating-characters { display: none; }
    }
    
    /* Parallax effect for characters */
    .floating-character.parallax {
      will-change: transform;
    }
  </style>
</head>
<body class="bg-future-ivory min-h-screen flex flex-col overflow-x-hidden">
  <!-- Header -->
  <header class="glass fixed top-0 left-0 right-0 z-50 border-b border-white/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <a href="/" class="flex items-center space-x-3 group">
          <div class="relative">
            <img src="https://www.genspark.ai/api/files/s/q2cgvRKQ" alt="mirAIcafe" class="w-11 h-11 object-contain group-hover:scale-110 transition-transform duration-300">
            <div class="absolute inset-0 bg-ai-cyan/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div>
            <span class="text-2xl font-bold">
              <span class="text-future-text">mir</span><span class="gradient-ai-text">AI</span><span class="text-future-text">cafe</span>
            </span>
            <p class="text-xs text-future-textLight -mt-0.5">AIを、もっと身近に。</p>
          </div>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-2">
          <a href="/" class="nav-link text-future-text hover:text-ai-blue font-medium ${activeNav === 'home' ? 'active' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="nav-link text-future-text hover:text-ai-blue font-medium ${activeNav === 'courses' ? 'active' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="nav-link text-future-text hover:text-ai-blue font-medium ${activeNav === 'reservation' ? 'active' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="nav-link text-future-text hover:text-ai-blue font-medium ${activeNav === 'blog' ? 'active' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="nav-link text-future-text hover:text-ai-blue font-medium ${activeNav === 'contact' ? 'active' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button id="mobile-menu-btn" class="md:hidden text-future-text p-2 hover:bg-future-light rounded-xl transition-colors">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      <nav id="mobile-menu" class="hidden md:hidden pb-4">
        <div class="flex flex-col space-y-2 glass rounded-2xl p-4">
          <a href="/" class="nav-link text-future-text hover:text-ai-blue font-medium py-2 ${activeNav === 'home' ? 'active' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="nav-link text-future-text hover:text-ai-blue font-medium py-2 ${activeNav === 'courses' ? 'active' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="nav-link text-future-text hover:text-ai-blue font-medium py-2 ${activeNav === 'reservation' ? 'active' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="nav-link text-future-text hover:text-ai-blue font-medium py-2 ${activeNav === 'blog' ? 'active' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="nav-link text-future-text hover:text-ai-blue font-medium py-2 ${activeNav === 'contact' ? 'active' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </div>
      </nav>
    </div>
  </header>

  <!-- Spacer for fixed header -->
  <div class="h-20"></div>
  
  <!-- Floating Characters (Scroll Following) -->
  <div class="floating-characters" id="floating-chars">
    <!-- Green Alien Character -->
    <img src="https://www.genspark.ai/api/files/s/E7KAqpsk" 
         alt="AIアシスタント - みどり" 
         class="floating-character char-alien parallax" 
         id="char-alien"
         loading="lazy">
    
    <!-- Robot Rabbit Character -->
    <img src="https://www.genspark.ai/api/files/s/8oe2UcPG" 
         alt="AIアシスタント - ロボうさぎ" 
         class="floating-character char-rabbit parallax" 
         id="char-rabbit"
         loading="lazy">
    
    <!-- Pink Girl Character -->
    <img src="https://www.genspark.ai/api/files/s/ArUAihXS" 
         alt="AIアシスタント - ピンク" 
         class="floating-character char-pink parallax" 
         id="char-pink"
         loading="lazy">
  </div>

  <!-- Main Content -->
  <main class="flex-grow">
    ${content}
  </main>

  <!-- Footer -->
  <footer class="relative mt-20 overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 gradient-ai opacity-95"></div>
    <div class="absolute inset-0">
      <div class="orb orb-1 opacity-20"></div>
      <div class="orb orb-2 opacity-20"></div>
    </div>
    
    <!-- Wave decoration -->
    <div class="absolute top-0 left-0 right-0 h-20 overflow-hidden">
      <svg viewBox="0 0 1440 100" class="w-full h-full" preserveAspectRatio="none">
        <path fill="#FAFCFF" d="M0,60L60,55C120,50,240,40,360,45C480,50,600,70,720,75C840,80,960,70,1080,60C1200,50,1320,40,1380,35L1440,30L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
      </svg>
    </div>
    
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-28">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <img src="https://www.genspark.ai/api/files/s/q2cgvRKQ" alt="mirAIcafe" class="w-10 h-10 object-contain">
            <span class="text-xl font-bold text-white">mirAIcafe</span>
          </div>
          <p class="text-white/80 text-sm leading-relaxed max-w-md">
            mirAIcafeは、未来の学びを提供するAIスキル学習プラットフォームです。
            明るく開放的な空間で、最先端のAI技術を楽しく学びましょう。
          </p>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="font-bold text-white mb-4">クイックリンク</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="/courses" class="text-white/80 hover:text-white transition-colors">講座一覧</a></li>
            <li><a href="/reservation" class="text-white/80 hover:text-white transition-colors">予約</a></li>
            <li><a href="/blog" class="text-white/80 hover:text-white transition-colors">ブログ</a></li>
            <li><a href="/contact" class="text-white/80 hover:text-white transition-colors">お問い合わせ</a></li>
          </ul>
        </div>
        
        <!-- Contact Info -->
        <div>
          <h3 class="font-bold text-white mb-4">お問い合わせ</h3>
          <ul class="space-y-2 text-sm text-white/80">
            <li><i class="fas fa-envelope mr-2"></i>info@miraicafe.jp</li>
            <li><i class="fas fa-clock mr-2"></i>平日 9:00 - 18:00</li>
          </ul>
          <div class="flex space-x-4 mt-4">
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
        <p>&copy; 2024 mirAIcafe. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn')?.addEventListener('click', function() {
      document.getElementById('mobile-menu')?.classList.toggle('hidden');
    });
    
    // Floating characters parallax scroll effect
    (function() {
      const charAlien = document.getElementById('char-alien');
      const charRabbit = document.getElementById('char-rabbit');
      const charPink = document.getElementById('char-pink');
      
      let ticking = false;
      let lastScrollY = 0;
      
      function updateCharacterPositions() {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollProgress = scrollY / (documentHeight - viewportHeight);
        
        // Alien - moves slower, stays in upper left area
        if (charAlien) {
          const alienY = 30 + (scrollY * 0.05);
          const alienX = Math.sin(scrollY * 0.002) * 10;
          charAlien.style.top = alienY + '%';
          charAlien.style.transform = 'translateX(' + alienX + 'px) rotate(' + (Math.sin(scrollY * 0.003) * 5) + 'deg)';
        }
        
        // Rabbit - moves medium speed, right side
        if (charRabbit) {
          const rabbitY = 20 + (scrollY * 0.08);
          const rabbitX = Math.cos(scrollY * 0.0025) * 15;
          charRabbit.style.top = Math.min(rabbitY, 60) + '%';
          charRabbit.style.transform = 'translateX(' + rabbitX + 'px) rotate(' + (Math.cos(scrollY * 0.002) * 4) + 'deg)';
        }
        
        // Pink - moves faster, bottom right
        if (charPink) {
          const pinkY = 25 + (scrollY * 0.1);
          const pinkX = Math.sin(scrollY * 0.003) * 12;
          charPink.style.bottom = Math.max(25 - (scrollY * 0.02), 10) + '%';
          charPink.style.transform = 'translateX(' + pinkX + 'px) rotate(' + (Math.sin(scrollY * 0.004) * 6) + 'deg)';
        }
        
        ticking = false;
      }
      
      function onScroll() {
        lastScrollY = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(updateCharacterPositions);
          ticking = true;
        }
      }
      
      window.addEventListener('scroll', onScroll, { passive: true });
      
      // Initial position
      updateCharacterPositions();
    })();
  </script>
</body>
</html>
`
