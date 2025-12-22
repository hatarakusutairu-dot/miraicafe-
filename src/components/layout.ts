// Layout component - Warm greenhouse cafe aesthetic (Natural & Cozy)
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
              ivory: '#FAF8F3',
              cream: '#F5F0E6',
              beige: '#E8DCC8',
              sand: '#DED3C2',
              latte: '#D4C4A8',
              caramel: '#C4A574',
              wood: '#B8956A',
              brown: '#8B7355',
              espresso: '#5D4E3A',
              dark: '#3D3428',
              text: '#4A4035',
              textLight: '#7A7265'
            },
            nature: {
              mint: '#D4E5D0',
              sage: '#B8CDB0',
              green: '#8FB585',
              forest: '#6B9B62',
              sky: '#D4E8E8',
              aqua: '#B8D8D8',
              blue: '#8BBCBC'
            }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { font-family: 'Zen Maru Gothic', 'Noto Sans JP', sans-serif; }
    
    /* ===== Background Animations ===== */
    
    /* Floating Leaves */
    .bg-leaves {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }
    
    .leaf {
      position: absolute;
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #D4E5D0 0%, #B8CDB0 100%);
      border-radius: 0 70% 0 70%;
      opacity: 0.4;
      animation: fall-leaf linear infinite;
    }
    
    .leaf:nth-child(1) { left: 5%; width: 15px; height: 15px; animation-duration: 25s; animation-delay: 0s; }
    .leaf:nth-child(2) { left: 15%; width: 22px; height: 22px; animation-duration: 30s; animation-delay: -5s; }
    .leaf:nth-child(3) { left: 25%; width: 18px; height: 18px; animation-duration: 28s; animation-delay: -10s; }
    .leaf:nth-child(4) { left: 40%; width: 25px; height: 25px; animation-duration: 32s; animation-delay: -3s; }
    .leaf:nth-child(5) { left: 55%; width: 16px; height: 16px; animation-duration: 26s; animation-delay: -8s; }
    .leaf:nth-child(6) { left: 70%; width: 20px; height: 20px; animation-duration: 29s; animation-delay: -12s; }
    .leaf:nth-child(7) { left: 85%; width: 14px; height: 14px; animation-duration: 24s; animation-delay: -6s; }
    .leaf:nth-child(8) { left: 95%; width: 19px; height: 19px; animation-duration: 31s; animation-delay: -15s; }
    
    @keyframes fall-leaf {
      0% {
        transform: translateY(-100px) rotate(0deg) translateX(0);
        opacity: 0;
      }
      10% {
        opacity: 0.4;
      }
      90% {
        opacity: 0.4;
      }
      100% {
        transform: translateY(100vh) rotate(360deg) translateX(100px);
        opacity: 0;
      }
    }
    
    /* Floating Orbs - Soft gradient circles */
    .bg-orbs {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.3;
      animation: float-orb ease-in-out infinite;
    }
    
    .orb-1 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #D4E5D0, #B8CDB0);
      top: 10%;
      left: -5%;
      animation-duration: 20s;
    }
    
    .orb-2 {
      width: 250px;
      height: 250px;
      background: linear-gradient(135deg, #E8DCC8, #D4C4A8);
      top: 60%;
      right: -5%;
      animation-duration: 25s;
      animation-delay: -5s;
    }
    
    .orb-3 {
      width: 200px;
      height: 200px;
      background: linear-gradient(135deg, #D4E8E8, #B8D8D8);
      bottom: 20%;
      left: 30%;
      animation-duration: 22s;
      animation-delay: -10s;
    }
    
    @keyframes float-orb {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      25% {
        transform: translate(30px, -20px) scale(1.05);
      }
      50% {
        transform: translate(-20px, 30px) scale(0.95);
      }
      75% {
        transform: translate(20px, 20px) scale(1.02);
      }
    }
    
    /* Sparkles / Light particles */
    .bg-sparkles {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2;
      overflow: hidden;
    }
    
    .sparkle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #B8956A;
      border-radius: 50%;
      opacity: 0;
      animation: twinkle ease-in-out infinite;
    }
    
    .sparkle:nth-child(1) { left: 10%; top: 20%; animation-duration: 4s; animation-delay: 0s; }
    .sparkle:nth-child(2) { left: 25%; top: 40%; animation-duration: 5s; animation-delay: -1s; }
    .sparkle:nth-child(3) { left: 45%; top: 15%; animation-duration: 4.5s; animation-delay: -2s; }
    .sparkle:nth-child(4) { left: 60%; top: 55%; animation-duration: 5.5s; animation-delay: -0.5s; }
    .sparkle:nth-child(5) { left: 75%; top: 30%; animation-duration: 4s; animation-delay: -3s; }
    .sparkle:nth-child(6) { left: 90%; top: 65%; animation-duration: 5s; animation-delay: -1.5s; }
    .sparkle:nth-child(7) { left: 30%; top: 75%; animation-duration: 4.5s; animation-delay: -2.5s; }
    .sparkle:nth-child(8) { left: 80%; top: 85%; animation-duration: 5.5s; animation-delay: -3.5s; }
    .sparkle:nth-child(9) { left: 50%; top: 90%; animation-duration: 4s; animation-delay: -4s; }
    .sparkle:nth-child(10) { left: 15%; top: 60%; animation-duration: 5s; animation-delay: -0.8s; }
    
    @keyframes twinkle {
      0%, 100% {
        opacity: 0;
        transform: scale(0.5);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.2);
      }
    }
    
    /* Gentle wave at bottom */
    .bg-wave {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 200%;
      height: 100px;
      pointer-events: none;
      z-index: 1;
      animation: wave-move 15s linear infinite;
    }
    
    @keyframes wave-move {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    /* ===== End Background Animations ===== */
    
    /* Warm Natural Gradients */
    .gradient-warm { 
      background: linear-gradient(135deg, #B8956A 0%, #C4A574 50%, #D4C4A8 100%);
    }
    .gradient-nature {
      background: linear-gradient(135deg, #D4E5D0 0%, #B8CDB0 50%, #8FB585 100%);
    }
    .gradient-cream {
      background: linear-gradient(135deg, #FAF8F3 0%, #F5F0E6 50%, #E8DCC8 100%);
    }
    
    /* Wood accent text */
    .text-wood-gradient {
      background: linear-gradient(135deg, #B8956A 0%, #8B7355 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Soft glass effect */
    .glass-warm {
      background: rgba(250, 248, 243, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(232, 220, 200, 0.5);
    }
    
    /* Card hover effect */
    .card-hover {
      transition: all 0.3s ease;
      border-radius: 20px;
    }
    .card-hover:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(139, 115, 85, 0.15);
    }
    
    /* Button styles */
    .btn-warm {
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #B8956A 0%, #C4A574 100%);
      color: white;
      border-radius: 50px;
    }
    .btn-warm:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(184, 149, 106, 0.4);
    }
    
    .btn-outline {
      transition: all 0.3s ease;
      border: 2px solid #B8956A;
      color: #8B7355;
      border-radius: 50px;
      background: transparent;
    }
    .btn-outline:hover {
      background: #B8956A;
      color: white;
    }
    
    /* Navigation */
    .nav-link {
      position: relative;
      padding: 0.5rem 1rem;
      border-radius: 50px;
      transition: all 0.3s ease;
      color: #4A4035;
    }
    .nav-link:hover {
      background: rgba(212, 229, 208, 0.5);
      color: #6B9B62;
    }
    .nav-link.active {
      background: rgba(212, 229, 208, 0.7);
      color: #6B9B62;
    }
    
    /* Wave animation - Wood grain style */
    .wave-wood {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 200%;
      height: 80px;
      animation: wave-flow 20s linear infinite;
    }
    @keyframes wave-flow {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    
    /* Floating Characters */
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
    
    .floating-char {
      position: absolute;
      transition: transform 0.3s ease-out;
      filter: drop-shadow(0 8px 20px rgba(93, 78, 58, 0.2));
    }
    
    .floating-char img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    /* Character positions - individual images */
    .char-green {
      width: 100px;
      height: 120px;
      left: 20px;
      top: 28%;
      animation: float-char1 6s ease-in-out infinite;
    }
    
    .char-rabbit {
      width: 110px;
      height: 120px;
      right: 25px;
      top: 20%;
      animation: float-char2 7s ease-in-out infinite;
    }
    
    .char-pink {
      width: 85px;
      height: 110px;
      right: 35px;
      bottom: 25%;
      animation: float-char3 5s ease-in-out infinite;
      animation-delay: -4s;
    }
    .char-pink img {
      width: 350px;
      height: auto;
      left: -248px;
      top: 5px;
    }
    
    @keyframes float-char1 {
      0%, 100% { transform: translateY(0) rotate(-3deg); }
      25% { transform: translateY(-15px) rotate(0deg); }
      50% { transform: translateY(-25px) rotate(3deg); }
      75% { transform: translateY(-10px) rotate(0deg); }
    }
    
    @keyframes float-char2 {
      0%, 100% { transform: translateY(0) rotate(2deg); }
      33% { transform: translateY(-20px) rotate(-2deg); }
      66% { transform: translateY(-30px) rotate(3deg); }
    }
    
    @keyframes float-char3 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-12px) rotate(3deg); }
      50% { transform: translateY(-22px) rotate(-2deg); }
      75% { transform: translateY(-8px) rotate(2deg); }
    }
    
    @media (max-width: 1024px) {
      .char-green { width: 75px; height: 90px; left: 10px; }
      .char-rabbit { width: 85px; height: 95px; right: 10px; }
      .char-pink { width: 65px; height: 85px; right: 20px; }
    }
    
    @media (max-width: 768px) {
      .floating-characters { display: none; }
    }
    
    /* Smooth scroll */
    html { scroll-behavior: smooth; }
    
    /* Leaf decoration animation */
    @keyframes sway {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    .leaf-sway { animation: sway 4s ease-in-out infinite; }
    
    /* ========== Background Animations ========== */
    
    /* Animated background container */
    .bg-animated {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    
    /* Floating soft orbs - warm colors */
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;
      animation: orb-float 25s ease-in-out infinite;
    }
    
    .bg-orb-1 {
      width: 400px;
      height: 400px;
      background: linear-gradient(135deg, #D4E5D0, #B8CDB0);
      top: -150px;
      left: -100px;
      animation-delay: 0s;
    }
    
    .bg-orb-2 {
      width: 350px;
      height: 350px;
      background: linear-gradient(135deg, #E8DCC8, #D4C4A8);
      top: 40%;
      right: -100px;
      animation-delay: -8s;
    }
    
    .bg-orb-3 {
      width: 300px;
      height: 300px;
      background: linear-gradient(135deg, #D4E8E8, #B8D8D8);
      bottom: 10%;
      left: 20%;
      animation-delay: -15s;
    }
    
    .bg-orb-4 {
      width: 250px;
      height: 250px;
      background: linear-gradient(135deg, #D4E5D0, #8FB585);
      top: 60%;
      left: -50px;
      animation-delay: -5s;
    }
    
    @keyframes orb-float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(40px, -30px) scale(1.05); }
      50% { transform: translate(-30px, 40px) scale(0.95); }
      75% { transform: translate(20px, 20px) scale(1.02); }
    }
    
    /* Floating leaves */
    .bg-leaves {
      position: absolute;
      inset: 0;
    }
    
    .bg-leaf {
      position: absolute;
      font-size: 20px;
      opacity: 0.15;
      color: #8FB585;
      animation: leaf-fall 20s linear infinite;
    }
    
    @keyframes leaf-fall {
      0% {
        transform: translateY(-100px) rotate(0deg) translateX(0);
        opacity: 0;
      }
      10% { opacity: 0.15; }
      90% { opacity: 0.15; }
      100% {
        transform: translateY(100vh) rotate(360deg) translateX(100px);
        opacity: 0;
      }
    }
    
    /* Sparkle particles */
    .bg-sparkles {
      position: absolute;
      inset: 0;
    }
    
    .bg-sparkle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #D4C4A8;
      border-radius: 50%;
      animation: sparkle 8s ease-in-out infinite;
    }
    
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0); }
      50% { opacity: 0.6; transform: scale(1); }
    }
    
    /* Gentle wave at bottom */
    .bg-wave {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 200%;
      height: 150px;
      opacity: 0.1;
      animation: wave-move 30s linear infinite;
    }
    
    @keyframes wave-move {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  </style>
</head>
<body class="bg-cafe-ivory min-h-screen flex flex-col overflow-x-hidden">
  <!-- Animated Background -->
  <div class="bg-animated">
    <!-- Soft floating orbs -->
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
    <div class="bg-orb bg-orb-4"></div>
    
    <!-- Floating leaves -->
    <div class="bg-leaves">
      <i class="fas fa-leaf bg-leaf" style="left: 10%; animation-delay: 0s;"></i>
      <i class="fas fa-leaf bg-leaf" style="left: 20%; animation-delay: -3s;"></i>
      <i class="fas fa-leaf bg-leaf" style="left: 35%; animation-delay: -6s;"></i>
      <i class="fas fa-leaf bg-leaf" style="left: 50%; animation-delay: -9s;"></i>
      <i class="fas fa-leaf bg-leaf" style="left: 65%; animation-delay: -12s;"></i>
      <i class="fas fa-leaf bg-leaf" style="left: 80%; animation-delay: -15s;"></i>
      <i class="fas fa-leaf bg-leaf" style="left: 90%; animation-delay: -18s;"></i>
      <i class="fas fa-seedling bg-leaf" style="left: 25%; animation-delay: -4s; font-size: 16px;"></i>
      <i class="fas fa-seedling bg-leaf" style="left: 55%; animation-delay: -10s; font-size: 16px;"></i>
      <i class="fas fa-seedling bg-leaf" style="left: 75%; animation-delay: -16s; font-size: 16px;"></i>
    </div>
    
    <!-- Sparkle particles -->
    <div class="bg-sparkles">
      <div class="bg-sparkle" style="top: 15%; left: 10%; animation-delay: 0s;"></div>
      <div class="bg-sparkle" style="top: 25%; left: 30%; animation-delay: -1s;"></div>
      <div class="bg-sparkle" style="top: 40%; left: 70%; animation-delay: -2s;"></div>
      <div class="bg-sparkle" style="top: 55%; left: 20%; animation-delay: -3s;"></div>
      <div class="bg-sparkle" style="top: 65%; left: 85%; animation-delay: -4s;"></div>
      <div class="bg-sparkle" style="top: 75%; left: 45%; animation-delay: -5s;"></div>
      <div class="bg-sparkle" style="top: 85%; left: 60%; animation-delay: -6s;"></div>
      <div class="bg-sparkle" style="top: 30%; left: 90%; animation-delay: -7s;"></div>
      <div class="bg-sparkle" style="top: 50%; left: 5%; animation-delay: -3.5s;"></div>
      <div class="bg-sparkle" style="top: 70%; left: 35%; animation-delay: -5.5s;"></div>
    </div>
    
    <!-- Bottom wave -->
    <svg class="bg-wave" viewBox="0 0 1440 150" preserveAspectRatio="none">
      <path fill="#B8CDB0" d="M0,60L48,65C96,70,192,80,288,85C384,90,480,90,576,80C672,70,768,50,864,45C960,40,1056,50,1152,60C1248,70,1344,80,1392,85L1440,90L1440,150L0,150Z"></path>
    </svg>
  </div>

  <!-- Header -->
  <header class="glass-warm fixed top-0 left-0 right-0 z-50 border-b border-cafe-beige/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <a href="/" class="flex items-center space-x-3 group">
          <div class="relative">
            <img src="/static/logo.png" alt="mirAIcafe" class="w-11 h-11 object-contain group-hover:scale-110 transition-transform duration-300" onerror="this.style.display='none'">
          </div>
          <div>
            <span class="text-2xl font-bold">
              <span class="text-cafe-text">mir</span><span class="text-wood-gradient">AI</span><span class="text-cafe-text">cafe</span>
            </span>
            <p class="text-xs text-cafe-textLight -mt-0.5">AIを、もっと身近に。</p>
          </div>
        </a>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-1">
          <a href="/" class="nav-link font-medium ${activeNav === 'home' ? 'active' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="nav-link font-medium ${activeNav === 'courses' ? 'active' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="nav-link font-medium ${activeNav === 'reservation' ? 'active' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="nav-link font-medium ${activeNav === 'blog' ? 'active' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="nav-link font-medium ${activeNav === 'contact' ? 'active' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </nav>
        
        <!-- Mobile Menu Button -->
        <button id="mobile-menu-btn" class="md:hidden text-cafe-text p-2 hover:bg-cafe-cream rounded-xl transition-colors">
          <i class="fas fa-bars text-xl"></i>
        </button>
      </div>
      
      <!-- Mobile Navigation -->
      <nav id="mobile-menu" class="hidden md:hidden pb-4">
        <div class="flex flex-col space-y-2 bg-cafe-cream rounded-2xl p-4">
          <a href="/" class="nav-link font-medium py-2 ${activeNav === 'home' ? 'active' : ''}">
            <i class="fas fa-home mr-2"></i>ホーム
          </a>
          <a href="/courses" class="nav-link font-medium py-2 ${activeNav === 'courses' ? 'active' : ''}">
            <i class="fas fa-book-open mr-2"></i>講座一覧
          </a>
          <a href="/reservation" class="nav-link font-medium py-2 ${activeNav === 'reservation' ? 'active' : ''}">
            <i class="fas fa-calendar-alt mr-2"></i>予約
          </a>
          <a href="/blog" class="nav-link font-medium py-2 ${activeNav === 'blog' ? 'active' : ''}">
            <i class="fas fa-newspaper mr-2"></i>ブログ
          </a>
          <a href="/contact" class="nav-link font-medium py-2 ${activeNav === 'contact' ? 'active' : ''}">
            <i class="fas fa-envelope mr-2"></i>お問い合わせ
          </a>
        </div>
      </nav>
    </div>
  </header>

  <!-- Spacer for fixed header -->
  <div class="h-20"></div>
  
  <!-- Floating Characters -->
  <div class="floating-characters" id="floating-chars">
    <div class="floating-char char-green" id="char-green">
      <img src="/static/char-green.png" alt="AIアシスタント - リーフ" loading="lazy">
    </div>
    <div class="floating-char char-rabbit" id="char-rabbit">
      <img src="/static/char-rabbit.png" alt="AIアシスタント - ロボうさぎ" loading="lazy">
    </div>
    <div class="floating-char char-pink" id="char-pink">
      <img src="/static/char-pink.png" alt="AIアシスタント - ピンク" loading="lazy">
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-grow">
    ${content}
  </main>

  <!-- Footer -->
  <footer class="relative mt-20 overflow-hidden bg-cafe-espresso">
    <!-- Wave decoration -->
    <div class="absolute top-0 left-0 right-0 h-16 overflow-hidden">
      <svg viewBox="0 0 1440 100" class="w-full h-full" preserveAspectRatio="none">
        <path fill="#FAF8F3" d="M0,60L60,55C120,50,240,40,360,45C480,50,600,70,720,75C840,80,960,70,1080,60C1200,50,1320,40,1380,35L1440,30L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
      </svg>
    </div>
    
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-4">
            <span class="text-xl font-bold text-cafe-cream">mirAIcafe</span>
          </div>
          <p class="text-cafe-latte text-sm leading-relaxed max-w-md">
            mirAIcafeは、温かみのある空間でAIスキルを学べるプラットフォームです。
            カフェのようなリラックスした雰囲気で、楽しく学習しましょう。
          </p>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="font-bold text-cafe-cream mb-4">クイックリンク</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="/courses" class="text-cafe-latte hover:text-cafe-cream transition-colors">講座一覧</a></li>
            <li><a href="/reservation" class="text-cafe-latte hover:text-cafe-cream transition-colors">予約</a></li>
            <li><a href="/blog" class="text-cafe-latte hover:text-cafe-cream transition-colors">ブログ</a></li>
            <li><a href="/contact" class="text-cafe-latte hover:text-cafe-cream transition-colors">お問い合わせ</a></li>
          </ul>
        </div>
        
        <!-- Contact Info -->
        <div>
          <h3 class="font-bold text-cafe-cream mb-4">お問い合わせ</h3>
          <ul class="space-y-2 text-sm text-cafe-latte">
            <li><i class="fas fa-envelope mr-2"></i>info@miraicafe.jp</li>
            <li><i class="fas fa-clock mr-2"></i>平日 9:00 - 18:00</li>
          </ul>
          <div class="flex space-x-4 mt-4">
            <a href="#" class="w-10 h-10 rounded-full bg-cafe-brown/30 hover:bg-cafe-wood/50 flex items-center justify-center text-cafe-cream transition-colors">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-cafe-brown/30 hover:bg-cafe-wood/50 flex items-center justify-center text-cafe-cream transition-colors">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-cafe-brown/30 hover:bg-cafe-wood/50 flex items-center justify-center text-cafe-cream transition-colors">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-cafe-brown/30 mt-8 pt-8 text-center text-sm text-cafe-latte/70">
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
      const charGreen = document.getElementById('char-green');
      const charRabbit = document.getElementById('char-rabbit');
      const charPink = document.getElementById('char-pink');
      
      let ticking = false;
      
      function updateCharacterPositions() {
        const scrollY = window.scrollY;
        
        if (charGreen) {
          const greenY = 28 + (scrollY * 0.03);
          charGreen.style.top = Math.min(greenY, 50) + '%';
        }
        
        if (charRabbit) {
          const rabbitY = 20 + (scrollY * 0.04);
          charRabbit.style.top = Math.min(rabbitY, 55) + '%';
        }
        
        if (charPink) {
          charPink.style.bottom = Math.max(25 - (scrollY * 0.02), 12) + '%';
        }
        
        ticking = false;
      }
      
      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(updateCharacterPositions);
          ticking = true;
        }
      }, { passive: true });
      
      updateCharacterPositions();
    })();
  </script>
</body>
</html>
`
