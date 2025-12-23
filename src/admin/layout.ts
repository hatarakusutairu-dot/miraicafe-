// 管理画面共通レイアウト

export const renderAdminLayout = (title: string, content: string, activePage: string = 'dashboard') => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-home', label: 'ダッシュボード', href: '/admin' },
    { id: 'ai-news', icon: 'fas fa-robot', label: 'AIニュース', href: '/admin/ai-news' },
    { id: 'blog', icon: 'fas fa-newspaper', label: 'ブログ管理', href: '/admin/blog' },
    { id: 'courses', icon: 'fas fa-book-open', label: '講座管理', href: '/admin/courses' },
    { id: 'bookings', icon: 'fas fa-calendar-check', label: '予約管理', href: '/admin/bookings' },
    { id: 'reviews', icon: 'fas fa-star', label: '口コミ管理', href: '/admin/reviews' },
    { id: 'contacts', icon: 'fas fa-envelope', label: 'お問い合わせ', href: '/admin/contacts' },
    { id: 'seo', icon: 'fas fa-search', label: 'SEO管理', href: '/admin/seo' },
  ]

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | mirAIcafe管理画面</title>
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    * { font-family: 'Noto Sans JP', sans-serif; }
    .sidebar-link { transition: all 0.2s ease; }
    .sidebar-link:hover { background: rgba(255,255,255,0.1); }
    .sidebar-link.active { background: rgba(59, 130, 246, 0.8); }
    .card-stat { transition: transform 0.2s ease; }
    .card-stat:hover { transform: translateY(-2px); }
    
    /* 画像アップロードコンポーネント */
    .image-upload-zone {
      border: 2px dashed #d1d5db;
      border-radius: 0.75rem;
      padding: 2rem;
      text-align: center;
      transition: all 0.2s ease;
      cursor: pointer;
      background: #f9fafb;
    }
    .image-upload-zone:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .image-upload-zone.dragover {
      border-color: #3b82f6;
      background: #dbeafe;
      transform: scale(1.01);
    }
    .image-upload-zone.uploading {
      opacity: 0.7;
      pointer-events: none;
    }
    .image-preview-item {
      position: relative;
      display: inline-block;
    }
    .image-preview-item .remove-btn {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: transform 0.2s;
    }
    .image-preview-item .remove-btn:hover {
      transform: scale(1.1);
    }
    .upload-progress {
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .upload-progress-bar {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s ease;
    }
    .tab-btn {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem 0.5rem 0 0;
      transition: all 0.2s ease;
    }
    .tab-btn.active {
      background: white;
      border-color: #d1d5db;
      border-bottom-color: white;
    }
    .tab-btn:not(.active) {
      background: #f3f4f6;
      color: #6b7280;
    }
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

    // ===== 画像アップロード共通機能 =====
    
    // 単一画像アップロードコンポーネントを初期化
    function initImageUpload(containerId, inputName, currentUrl) {
      currentUrl = currentUrl || '';
      const container = document.getElementById(containerId);
      if (!container) return;

      const html = '<div class="image-upload-tabs mb-2">' +
        '<button type="button" class="tab-btn active" data-tab="upload" onclick="switchImageTab(\\'' + containerId + '\\', \\'upload\\')">' +
          '<i class="fas fa-upload mr-1"></i>アップロード</button>' +
        '<button type="button" class="tab-btn" data-tab="url" onclick="switchImageTab(\\'' + containerId + '\\', \\'url\\')">' +
          '<i class="fas fa-link mr-1"></i>URL入力</button>' +
        '</div>' +
        '<div class="tab-content upload-tab">' +
          '<div class="image-upload-zone" id="' + containerId + '-dropzone">' +
            '<div class="upload-placeholder" id="' + containerId + '-placeholder">' +
              '<i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>' +
              '<p class="text-gray-600 mb-2">ドラッグ&ドロップ</p>' +
              '<p class="text-gray-400 text-sm mb-3">または</p>' +
              '<label class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition">' +
                '<i class="fas fa-folder-open mr-1"></i>ファイルを選択' +
                '<input type="file" class="hidden" accept="image/jpeg,image/png,image/gif,image/webp" ' +
                  'onchange="handleFileSelect(\\'' + containerId + '\\', \\'' + inputName + '\\', this.files[0])">' +
              '</label>' +
              '<p class="text-xs text-gray-400 mt-3">JPG, PNG, GIF, WebP（最大5MB）</p>' +
            '</div>' +
            '<div class="upload-progress hidden" id="' + containerId + '-progress">' +
              '<div class="upload-progress-bar" style="width: 0%"></div>' +
            '</div>' +
            '<div class="image-preview hidden" id="' + containerId + '-preview">' +
              '<div class="image-preview-item">' +
                '<img src="" alt="プレビュー" class="w-32 h-32 object-cover rounded-lg border">' +
                '<button type="button" class="remove-btn" onclick="removeImage(\\'' + containerId + '\\', \\'' + inputName + '\\')">' +
                  '<i class="fas fa-times"></i>' +
                '</button>' +
              '</div>' +
              '<p class="text-sm text-green-600 mt-2"><i class="fas fa-check mr-1"></i>アップロード完了</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tab-content url-tab hidden">' +
          '<input type="url" name="' + inputName + '_url_input" value="' + currentUrl + '" placeholder="https://example.com/image.jpg" ' +
            'class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" ' +
            'onchange="handleUrlInput(\\'' + containerId + '\\', \\'' + inputName + '\\', this.value)">' +
          '<p class="text-xs text-gray-400 mt-1">外部URLを直接入力できます</p>' +
        '</div>' +
        '<input type="hidden" name="' + inputName + '" id="' + containerId + '-hidden" value="' + currentUrl + '">';
      
      container.innerHTML = html;
      
      // 既存の画像があればプレビュー表示
      if (currentUrl) {
        showPreview(containerId, currentUrl);
      }
      
      // ドラッグ&ドロップイベント設定
      setupDropzone(containerId, inputName);
    }
    
    // タブ切り替え
    function switchImageTab(containerId, tab) {
      const container = document.getElementById(containerId);
      const tabs = container.querySelectorAll('.tab-btn');
      const uploadContent = container.querySelector('.upload-tab');
      const urlContent = container.querySelector('.url-tab');
      
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
      });
      
      if (tab === 'upload') {
        uploadContent.classList.remove('hidden');
        urlContent.classList.add('hidden');
      } else {
        uploadContent.classList.add('hidden');
        urlContent.classList.remove('hidden');
      }
    }
    
    // ドロップゾーンの設定
    function setupDropzone(containerId, inputName) {
      const dropzone = document.getElementById(containerId + '-dropzone');
      if (!dropzone) return;
      
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });
      
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.add('dragover');
        });
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.remove('dragover');
        });
      });
      
      dropzone.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileSelect(containerId, inputName, file);
        }
      });
    }
    
    // ファイル選択処理
    async function handleFileSelect(containerId, inputName, file) {
      if (!file) return;
      
      // バリデーション
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('対応していないファイル形式です。JPG, PNG, GIF, WebPのみ対応しています。');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズが大きすぎます（最大5MB）');
        return;
      }
      
      const dropzone = document.getElementById(containerId + '-dropzone');
      const placeholder = document.getElementById(containerId + '-placeholder');
      const progress = document.getElementById(containerId + '-progress');
      const progressBar = progress.querySelector('.upload-progress-bar');
      
      // アップロード中の表示
      dropzone.classList.add('uploading');
      placeholder.classList.add('hidden');
      progress.classList.remove('hidden');
      progressBar.style.width = '30%';
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        progressBar.style.width = '60%';
        
        const response = await fetch('/admin/api/upload', {
          method: 'POST',
          body: formData
        });
        
        progressBar.style.width = '90%';
        
        const result = await response.json();
        
        if (result.success) {
          progressBar.style.width = '100%';
          setTimeout(() => {
            progress.classList.add('hidden');
            showPreview(containerId, result.url);
            document.getElementById(containerId + '-hidden').value = result.url;
          }, 300);
        } else {
          throw new Error(result.error || 'アップロードに失敗しました');
        }
      } catch (error) {
        alert(error.message);
        progress.classList.add('hidden');
        placeholder.classList.remove('hidden');
      } finally {
        dropzone.classList.remove('uploading');
      }
    }
    
    // URL入力処理
    function handleUrlInput(containerId, inputName, url) {
      document.getElementById(containerId + '-hidden').value = url;
      if (url) {
        // URL入力時もプレビュー表示（アップロードタブで）
        showPreview(containerId, url);
      }
    }
    
    // プレビュー表示
    function showPreview(containerId, url) {
      const placeholder = document.getElementById(containerId + '-placeholder');
      const preview = document.getElementById(containerId + '-preview');
      const img = preview.querySelector('img');
      
      if (placeholder) placeholder.classList.add('hidden');
      if (preview) {
        preview.classList.remove('hidden');
        img.src = url;
      }
    }
    
    // 画像削除
    function removeImage(containerId, inputName) {
      const placeholder = document.getElementById(containerId + '-placeholder');
      const preview = document.getElementById(containerId + '-preview');
      const hiddenInput = document.getElementById(containerId + '-hidden');
      const urlInput = document.querySelector('[name="' + inputName + '_url_input"]');
      
      if (placeholder) placeholder.classList.remove('hidden');
      if (preview) preview.classList.add('hidden');
      if (hiddenInput) hiddenInput.value = '';
      if (urlInput) urlInput.value = '';
    }
    
    // ===== 複数画像アップロード機能 =====
    
    function initMultiImageUpload(containerId, inputName, currentUrls) {
      currentUrls = currentUrls || [];
      const container = document.getElementById(containerId);
      if (!container) return;

      const html = '<div class="multi-image-upload">' +
        '<div class="flex flex-wrap gap-3 mb-3" id="' + containerId + '-previews"></div>' +
        '<div class="image-upload-zone" id="' + containerId + '-dropzone" style="padding: 1rem;">' +
          '<div class="flex items-center justify-center">' +
            '<i class="fas fa-plus text-gray-400 mr-2"></i>' +
            '<span class="text-gray-600 text-sm">画像を追加</span>' +
            '<label class="ml-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer text-sm transition">' +
              '選択' +
              '<input type="file" class="hidden" accept="image/jpeg,image/png,image/gif,image/webp" multiple ' +
                'onchange="handleMultiFileSelect(\\'' + containerId + '\\', \\'' + inputName + '\\', this.files)">' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<input type="hidden" name="' + inputName + '" id="' + containerId + '-hidden" value="">' +
        '<p class="text-xs text-gray-400 mt-2">複数画像をドラッグ&ドロップまたは選択できます（各最大5MB）</p>' +
      '</div>';
      
      container.innerHTML = html;
      
      // 既存の画像があればプレビュー表示
      if (currentUrls.length > 0) {
        currentUrls.forEach(function(url, index) {
          addMultiImagePreview(containerId, inputName, url, index);
        });
        updateMultiImageHidden(containerId, inputName);
      }
      
      // ドラッグ&ドロップイベント設定
      setupMultiDropzone(containerId, inputName);
    }
    
    function setupMultiDropzone(containerId, inputName) {
      const dropzone = document.getElementById(containerId + '-dropzone');
      if (!dropzone) return;
      
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });
      
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.add('dragover');
        });
      });
      
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
          dropzone.classList.remove('dragover');
        });
      });
      
      dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          handleMultiFileSelect(containerId, inputName, files);
        }
      });
    }
    
    async function handleMultiFileSelect(containerId, inputName, files) {
      if (!files || files.length === 0) return;
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (!allowedTypes.includes(file.type)) {
          alert(file.name + ': 対応していないファイル形式です');
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert(file.name + ': ファイルサイズが大きすぎます（最大5MB）');
          continue;
        }
        
        try {
          var formData = new FormData();
          formData.append('file', file);
          
          var response = await fetch('/admin/api/upload', {
            method: 'POST',
            body: formData
          });
          
          var result = await response.json();
          
          if (result.success) {
            var previews = document.getElementById(containerId + '-previews');
            var index = previews.children.length;
            addMultiImagePreview(containerId, inputName, result.url, index);
            updateMultiImageHidden(containerId, inputName);
          } else {
            alert(file.name + ': ' + result.error);
          }
        } catch (error) {
          alert(file.name + ': アップロードに失敗しました');
        }
      }
    }
    
    function addMultiImagePreview(containerId, inputName, url, index) {
      const previews = document.getElementById(containerId + '-previews');
      const div = document.createElement('div');
      div.className = 'image-preview-item';
      div.dataset.url = url;
      div.innerHTML = '<img src="' + url + '" alt="画像" class="w-24 h-24 object-cover rounded-lg border">' +
        '<button type="button" class="remove-btn" onclick="removeMultiImage(\\'' + containerId + '\\', \\'' + inputName + '\\', this)">' +
          '<i class="fas fa-times"></i>' +
        '</button>';
      previews.appendChild(div);
    }
    
    function removeMultiImage(containerId, inputName, btn) {
      const item = btn.closest('.image-preview-item');
      item.remove();
      updateMultiImageHidden(containerId, inputName);
    }
    
    function updateMultiImageHidden(containerId, inputName) {
      const previews = document.getElementById(containerId + '-previews');
      const hidden = document.getElementById(containerId + '-hidden');
      const urls = Array.from(previews.querySelectorAll('.image-preview-item')).map(item => item.dataset.url);
      hidden.value = urls.join('\\n');
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
  <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
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
