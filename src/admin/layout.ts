// 管理画面共通レイアウト

export const renderAdminLayout = (title: string, content: string, activePage: string = 'dashboard') => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'ダッシュボード', href: '/admin' },
    { id: 'blog', icon: 'fas fa-newspaper', label: 'ブログ管理', href: '/admin/blog' },
    { id: 'courses', icon: 'fas fa-book-open', label: '講座管理', href: '/admin/courses' },
    { id: 'reviews', icon: 'fas fa-star', label: '口コミ管理', href: '/admin/reviews' },
    { id: 'contacts', icon: 'fas fa-envelope', label: 'お問い合わせ', href: '/admin/contacts' },
  ]

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | mirAIcafe管理画面</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { font-family: 'Noto Sans JP', sans-serif; }
    .sidebar-link { transition: all 0.2s ease; }
    .sidebar-link:hover { background: rgba(255,255,255,0.1); }
    .sidebar-link.active { background: rgba(59, 130, 246, 0.8); }
    .card-stat { transition: transform 0.2s ease; }
    .card-stat:hover { transform: translateY(-2px); }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <!-- Mobile Header -->
  <div class="lg:hidden bg-slate-800 text-white p-4 flex items-center justify-between">
    <div class="flex items-center">
      <button id="mobile-menu-btn" class="mr-3 text-xl">
        <i class="fas fa-bars"></i>
      </button>
      <span class="font-bold">mirAIcafe管理画面</span>
    </div>
    <form action="/admin/logout" method="POST">
      <button type="submit" class="text-gray-300 hover:text-white">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    </form>
  </div>

  <div class="flex">
    <!-- Sidebar -->
    <aside id="sidebar" class="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform -translate-x-full lg:translate-x-0 transition-transform duration-200 ease-in-out">
      <div class="p-6 border-b border-slate-700">
        <h1 class="text-xl font-bold flex items-center">
          <i class="fas fa-coffee mr-2 text-amber-400"></i>
          mirAIcafe
        </h1>
        <p class="text-sm text-gray-400 mt-1">管理画面</p>
      </div>

      <nav class="p-4 space-y-1">
        ${menuItems.map(item => `
          <a href="${item.href}" class="sidebar-link flex items-center px-4 py-3 rounded-lg ${activePage === item.id ? 'active' : 'text-gray-300 hover:text-white'}">
            <i class="${item.icon} w-6"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <a href="/" target="_blank" class="sidebar-link flex items-center px-4 py-3 rounded-lg text-gray-300 hover:text-white">
          <i class="fas fa-external-link-alt w-6"></i>
          <span>サイトを表示</span>
        </a>
        <form action="/admin/logout" method="POST">
          <button type="submit" class="sidebar-link w-full flex items-center px-4 py-3 rounded-lg text-gray-300 hover:text-white">
            <i class="fas fa-sign-out-alt w-6"></i>
            <span>ログアウト</span>
          </button>
        </form>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 lg:hidden hidden"></div>

    <!-- Main Content -->
    <main class="flex-1 min-h-screen lg:ml-0">
      <div class="p-6 lg:p-8">
        ${content}
      </div>
    </main>
  </div>

  <script>
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
      });
    }
  </script>
</body>
</html>
  `
}

// ログインページのレイアウト（サイドバーなし）
export const renderLoginPage = (error?: string) => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ログイン | mirAIcafe管理画面</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-slate-900 min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-coffee text-amber-600 text-2xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">mirAIcafe</h1>
        <p class="text-gray-500 mt-1">管理画面ログイン</p>
      </div>

      ${error ? `
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <i class="fas fa-exclamation-circle mr-2"></i>
          <span>${error}</span>
        </div>
      ` : ''}

      <form method="POST" action="/admin/login" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <i class="fas fa-envelope"></i>
            </span>
            <input type="email" name="email" required autofocus
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="admin@example.com">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <i class="fas fa-lock"></i>
            </span>
            <input type="password" name="password" required
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••">
          </div>
        </div>

        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center">
          <i class="fas fa-sign-in-alt mr-2"></i>
          ログイン
        </button>
      </form>

      <div class="mt-6 text-center">
        <a href="/" class="text-sm text-gray-500 hover:text-gray-700">
          <i class="fas fa-arrow-left mr-1"></i>
          サイトに戻る
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `
}
