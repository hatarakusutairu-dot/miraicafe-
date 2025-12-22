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
    
    /* Character positions - moved more inward */
    .char-green {
      width: 110px;
      height: 130px;
      left: 8%;
      top: 30%;
      animation: float-char1 6s ease-in-out infinite;
    }
    
    .char-rabbit {
      width: 120px;
      height: 130px;
      right: 8%;
      top: 22%;
      animation: float-char2 7s ease-in-out infinite;
    }
    
    .char-pink {
      width: 95px;
      height: 120px;
      right: 10%;
      bottom: 28%;
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
      .char-green { width: 85px; height: 100px; left: 5%; }
      .char-rabbit { width: 95px; height: 105px; right: 5%; }
      .char-pink { width: 75px; height: 95px; right: 6%; }
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
    
    /* ========== Hero Section Animations ========== */
    
    /* Background zoom effect */
    .hero-bg-zoom {
      animation: hero-zoom 20s ease-out forwards;
    }
    @keyframes hero-zoom {
      0% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    /* Fade in animation */
    .hero-fade-in {
      opacity: 0;
      animation: hero-fade 0.8s ease-out forwards;
    }
    @keyframes hero-fade {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    /* Slide up animation */
    .hero-slide-up {
      opacity: 0;
      display: inline-block;
      animation: hero-slide 0.8s ease-out forwards;
    }
    @keyframes hero-slide {
      0% { opacity: 0; transform: translateY(40px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    /* Button glow effect */
    .hero-btn-glow {
      animation: btn-glow 2s ease-in-out infinite;
    }
    @keyframes btn-glow {
      0%, 100% { box-shadow: 0 4px 15px rgba(184, 149, 106, 0.4); }
      50% { box-shadow: 0 8px 30px rgba(184, 149, 106, 0.6); }
    }
    
    /* Stat counter animation */
    .hero-stat {
      animation: stat-pop 0.5s ease-out forwards;
      opacity: 0;
      transform: scale(0.8);
    }
    @keyframes stat-pop {
      0% { opacity: 0; transform: scale(0.8); }
      50% { transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    /* AI Holographic ring effect */
    .hero-holo-ring {
      position: absolute;
      width: 120px;
      height: 120px;
      border: 2px solid transparent;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(184, 149, 106, 0.1), rgba(143, 181, 133, 0.1)) padding-box,
                  linear-gradient(135deg, rgba(184, 149, 106, 0.4), rgba(143, 181, 133, 0.4)) border-box;
      animation: holo-rotate 8s linear infinite, holo-pulse 4s ease-in-out infinite;
    }
    .hero-holo-ring::before {
      content: '';
      position: absolute;
      inset: 15px;
      border: 1px solid rgba(184, 149, 106, 0.3);
      border-radius: 50%;
      animation: holo-rotate 6s linear infinite reverse;
    }
    .hero-holo-ring::after {
      content: '';
      position: absolute;
      inset: 35px;
      border: 1px solid rgba(143, 181, 133, 0.3);
      border-radius: 50%;
      animation: holo-rotate 4s linear infinite;
    }
    @keyframes holo-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes holo-pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    /* Floating data points */
    .hero-data-point {
      position: absolute;
      width: 10px;
      height: 10px;
      background: linear-gradient(135deg, #B8956A, #8FB585);
      border-radius: 50%;
      animation: data-point-float 5s ease-in-out infinite;
      box-shadow: 0 0 20px rgba(184, 149, 106, 0.5);
    }
    .hero-data-point::before {
      content: '';
      position: absolute;
      inset: -8px;
      border: 1px solid rgba(184, 149, 106, 0.4);
      border-radius: 50%;
      animation: data-ring-expand 2s ease-out infinite;
    }
    @keyframes data-point-float {
      0%, 100% { transform: translateY(0); opacity: 0.7; }
      50% { transform: translateY(-20px); opacity: 1; }
    }
    @keyframes data-ring-expand {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    
    /* Binary stream effect */
    .hero-binary-stream {
      position: absolute;
      font-family: monospace;
      font-size: 11px;
      color: rgba(184, 149, 106, 0.35);
      writing-mode: vertical-rl;
      animation: binary-fall 8s linear infinite;
      letter-spacing: 2px;
    }
    .hero-binary-stream::before {
      content: '1011001010110';
    }
    @keyframes binary-fall {
      0% { transform: translateY(-100px); opacity: 0; }
      10% { opacity: 0.35; }
      90% { opacity: 0.35; }
      100% { transform: translateY(calc(100vh - 100px)); opacity: 0; }
    }
    
    /* ========== Background Animations - AI Tech Style ========== */
    
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
    
    /* Neural network grid lines */
    .neural-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(184, 149, 106, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(184, 149, 106, 0.06) 1px, transparent 1px);
      background-size: 60px 60px;
      animation: grid-move 30s linear infinite;
    }
    @keyframes grid-move {
      0% { transform: translate(0, 0); }
      100% { transform: translate(60px, 60px); }
    }
    
    /* Floating data nodes */
    .data-node {
      position: absolute;
      width: 8px;
      height: 8px;
      background: linear-gradient(135deg, #B8956A, #8FB585);
      border-radius: 50%;
      opacity: 0.7;
      animation: node-pulse 4s ease-in-out infinite;
    }
    .data-node::before {
      content: '';
      position: absolute;
      inset: -4px;
      border: 1px solid rgba(184, 149, 106, 0.3);
      border-radius: 50%;
      animation: node-ring 4s ease-in-out infinite;
    }
    @keyframes node-pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.5); opacity: 1; }
    }
    @keyframes node-ring {
      0%, 100% { transform: scale(1); opacity: 0; }
      50% { transform: scale(2.5); opacity: 0.6; }
    }
    
    /* Connection lines between nodes */
    .connection-line {
      position: absolute;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(143, 181, 133, 0.5), transparent);
      animation: line-flow 3s ease-in-out infinite;
      transform-origin: left center;
    }
    @keyframes line-flow {
      0% { opacity: 0; transform: scaleX(0); }
      50% { opacity: 1; transform: scaleX(1); }
      100% { opacity: 0; transform: scaleX(0); }
    }
    
    /* Hexagon patterns */
    .hex-pattern {
      position: absolute;
      width: 100px;
      height: 115px;
      opacity: 0;
      animation: hex-appear 8s ease-in-out infinite;
    }
    .hex-pattern svg {
      width: 100%;
      height: 100%;
    }
    @keyframes hex-appear {
      0%, 100% { opacity: 0; transform: scale(0.8) rotate(0deg); }
      50% { opacity: 0.15; transform: scale(1) rotate(30deg); }
    }
    
    /* Floating orbs - softer */
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.5;
      animation: orb-float 20s ease-in-out infinite;
    }
    .bg-orb-1 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(212, 229, 208, 0.8) 0%, transparent 70%);
      top: -100px;
      left: -50px;
    }
    .bg-orb-2 {
      width: 350px;
      height: 350px;
      background: radial-gradient(circle, rgba(212, 232, 232, 0.8) 0%, transparent 70%);
      top: 40%;
      right: -80px;
      animation-delay: -7s;
    }
    .bg-orb-3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(232, 220, 200, 0.8) 0%, transparent 70%);
      bottom: 10%;
      left: 30%;
      animation-delay: -14s;
    }
    @keyframes orb-float {
      0%, 100% { transform: translate(0, 0); }
      33% { transform: translate(40px, -30px); }
      66% { transform: translate(-30px, 40px); }
    }
    
    /* Circuit paths */
    .circuit-path {
      position: absolute;
      stroke: rgba(184, 149, 106, 0.2);
      stroke-width: 1;
      fill: none;
      stroke-dasharray: 10 5;
      animation: circuit-flow 8s linear infinite;
    }
    @keyframes circuit-flow {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -100; }
    }
    
    /* Scanning line effect */
    .scan-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(143, 181, 133, 0.4), rgba(184, 149, 106, 0.4), transparent);
      animation: scan-move 8s ease-in-out infinite;
      opacity: 0.6;
    }
    @keyframes scan-move {
      0%, 100% { top: -2px; opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      100% { top: 100%; opacity: 0; }
    }
  </style>
</head>
<body class="bg-cafe-ivory min-h-screen flex flex-col overflow-x-hidden">
  <!-- Animated Background - AI Tech Style -->
  <div class="bg-animated">
    <!-- Neural network grid -->
    <div class="neural-grid"></div>
    
    <!-- Soft floating orbs -->
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>
    
    <!-- Data nodes with pulse effect -->
    <div class="data-node" style="top: 15%; left: 20%; animation-delay: 0s;"></div>
    <div class="data-node" style="top: 25%; left: 80%; animation-delay: -1s;"></div>
    <div class="data-node" style="top: 45%; left: 10%; animation-delay: -2s;"></div>
    <div class="data-node" style="top: 55%; left: 90%; animation-delay: -1.5s;"></div>
    <div class="data-node" style="top: 75%; left: 30%; animation-delay: -2.5s;"></div>
    <div class="data-node" style="top: 85%; left: 70%; animation-delay: -0.5s;"></div>
    <div class="data-node" style="top: 35%; left: 50%; animation-delay: -3s;"></div>
    <div class="data-node" style="top: 65%; left: 60%; animation-delay: -3.5s;"></div>
    
    <!-- Connection lines -->
    <div class="connection-line" style="top: 20%; left: 20%; width: 200px; transform: rotate(25deg); animation-delay: 0s;"></div>
    <div class="connection-line" style="top: 40%; left: 60%; width: 180px; transform: rotate(-15deg); animation-delay: -1.5s;"></div>
    <div class="connection-line" style="top: 60%; left: 25%; width: 220px; transform: rotate(10deg); animation-delay: -3s;"></div>
    <div class="connection-line" style="top: 80%; left: 55%; width: 160px; transform: rotate(-30deg); animation-delay: -4.5s;"></div>
    
    <!-- Hexagon patterns -->
    <div class="hex-pattern" style="top: 10%; right: 15%; animation-delay: 0s;">
      <svg viewBox="0 0 100 115"><polygon points="50,0 100,28 100,86 50,115 0,86 0,28" stroke="#B8956A" stroke-width="1" fill="none"/></svg>
    </div>
    <div class="hex-pattern" style="top: 50%; left: 5%; animation-delay: -2.5s;">
      <svg viewBox="0 0 100 115"><polygon points="50,0 100,28 100,86 50,115 0,86 0,28" stroke="#8FB585" stroke-width="1" fill="none"/></svg>
    </div>
    <div class="hex-pattern" style="bottom: 20%; right: 10%; animation-delay: -5s;">
      <svg viewBox="0 0 100 115"><polygon points="50,0 100,28 100,86 50,115 0,86 0,28" stroke="#B8D8D8" stroke-width="1" fill="none"/></svg>
    </div>
    
    <!-- Circuit SVG paths -->
    <svg class="absolute inset-0 w-full h-full" style="opacity: 0.3;">
      <path class="circuit-path" d="M0,200 Q200,180 400,200 T800,200" />
      <path class="circuit-path" d="M100,400 Q300,380 500,420 T900,400" style="animation-delay: -2s;" />
      <path class="circuit-path" d="M50,600 Q250,580 450,620 T850,600" style="animation-delay: -4s;" />
    </svg>
    
    <!-- Scanning line -->
    <div class="scan-line" style="animation-delay: 0s;"></div>
    <div class="scan-line" style="animation-delay: -4s;"></div>
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
