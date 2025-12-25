import { renderAdminLayout } from './layout'

export interface Portfolio {
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
  sort_order: number
  meta_description: string | null
  keywords: string | null
  created_at: string
  updated_at: string
}

// カテゴリ一覧
const portfolioCategories = [
  'AI活用',
  '業務自動化',
  'Webサイト・LP',
  'SNS運用',
  'コンテンツ制作',
  'データ管理',
  'カスタマー対応',
  'その他'
]

// 技術スタック候補（AIツール・ノーコード中心）
const techSuggestions = [
  // AIアシスタント・チャット
  'ChatGPT', 'Claude', 'Gemini', 'Genspark', 'Perplexity', 'Manus', 'Copilot',
  // AIコーディング
  'Cursor', 'Windsurf', 'GitHub Copilot', 'Replit',
  // AI画像生成
  'Midjourney', 'DALL-E', 'Stable Diffusion', 'Leonardo.ai', 'Canva AI',
  // AI動画・音声
  'Runway', 'Pika', 'Suno', 'ElevenLabs', 'HeyGen', 'D-ID',
  // ノーコード・ローコード
  'NARCARD', 'Notion', 'Airtable', 'Bubble', 'Glide', 'AppSheet',
  'STUDIO', 'Wix', 'WordPress', 'Webflow',
  // 自動化・ワークフロー
  'Zapier', 'Make', 'Dify', 'n8n', 'Power Automate',
  'GAS（Google Apps Script）', 'Google スプレッドシート', 'Google フォーム',
  // データベース・バックエンド
  'Supabase', 'Firebase', 'Cloudflare', 'Vercel',
  'Genspark Sandbox', 'Replit DB', 'PlanetScale',
  // デザイン
  'Canva', 'Figma', 'Adobe Express',
  // コミュニケーション
  'Slack', 'Discord', 'LINE', 'Zoom',
  // 決済・EC
  'Stripe', 'PayPal', 'Square', 'STORES', 'BASE',
  // SNS・マーケティング
  'YouTube', 'Instagram', 'TikTok', 'X（Twitter）', 'LINE公式'
]

// ポートフォリオ一覧
export const renderPortfoliosList = (portfolios: Portfolio[]) => {
  const publishedCount = portfolios.filter(p => p.status === 'published').length
  const draftCount = portfolios.filter(p => p.status === 'draft').length

  const content = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">ポートフォリオ管理</h1>
        <p class="text-gray-500 mt-1">実績・制作物を管理します</p>
      </div>
      <div class="flex gap-3">
        <a href="/admin/portfolios/ai-generator" class="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg transition flex items-center shadow-lg">
          <i class="fas fa-magic mr-2"></i>AI生成
        </a>
        <a href="/admin/portfolios/new" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center">
          <i class="fas fa-plus mr-2"></i>新規作成
        </a>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
        <p class="text-gray-500 text-sm">合計</p>
        <p class="text-2xl font-bold text-gray-800">${portfolios.length}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-500">
        <p class="text-gray-500 text-sm">公開中</p>
        <p class="text-2xl font-bold text-green-600">${publishedCount}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
        <p class="text-gray-500 text-sm">下書き</p>
        <p class="text-2xl font-bold text-amber-600">${draftCount}</p>
      </div>
    </div>

    <!-- Portfolios Grid -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      ${portfolios.length > 0 ? `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          ${portfolios.map(portfolio => {
            const technologies = JSON.parse(portfolio.technologies || '[]') as string[]
            const demoTypeIcons: Record<string, string> = {
              video: 'fa-video',
              image: 'fa-image',
              slides: 'fa-images',
              link: 'fa-external-link-alt',
              multiple: 'fa-layer-group'
            }
            return `
              <div class="bg-gray-50 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
                <div class="aspect-video relative overflow-hidden bg-gray-200">
                  ${portfolio.thumbnail ? `
                    <img src="${portfolio.thumbnail}" alt="${portfolio.title}" class="w-full h-full object-cover">
                  ` : `
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <i class="fas fa-briefcase text-4xl text-blue-300"></i>
                    </div>
                  `}
                  <div class="absolute top-2 right-2 flex gap-1">
                    <span class="px-2 py-1 text-xs rounded ${portfolio.status === 'published' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}">
                      ${portfolio.status === 'published' ? '公開' : '下書き'}
                    </span>
                    <span class="px-2 py-1 text-xs rounded bg-gray-800/70 text-white">
                      <i class="fas ${demoTypeIcons[portfolio.demo_type] || 'fa-file'}"></i>
                    </span>
                  </div>
                </div>
                <div class="p-4">
                  <span class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 mb-2">${portfolio.category}</span>
                  <h3 class="font-bold text-gray-800 mb-2 line-clamp-1">${portfolio.title}</h3>
                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">${portfolio.description || '説明なし'}</p>
                  <div class="flex flex-wrap gap-1 mb-3">
                    ${technologies.slice(0, 3).map(tech => `
                      <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">${tech}</span>
                    `).join('')}
                    ${technologies.length > 3 ? `<span class="text-xs text-gray-400">+${technologies.length - 3}</span>` : ''}
                  </div>
                  <div class="flex gap-2">
                    <a href="/admin/portfolios/${portfolio.id}/edit" class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition">
                      <i class="fas fa-edit mr-1"></i>編集
                    </a>
                    <button onclick="openDeleteModal(${portfolio.id}, '${portfolio.title.replace(/'/g, "\\'")}')" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm transition">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            `
          }).join('')}
        </div>
      ` : `
        <div class="text-center py-16">
          <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
          <p class="text-gray-500 mb-4">ポートフォリオがありません</p>
          <div class="flex justify-center gap-3">
            <a href="/admin/portfolios/ai-generator" class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-lg transition">
              <i class="fas fa-magic mr-2"></i>AIで生成
            </a>
            <a href="/admin/portfolios/new" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition">
              <i class="fas fa-plus mr-2"></i>新規作成
            </a>
          </div>
        </div>
      `}
    </div>

    <!-- Delete Modal -->
    <div id="delete-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-xl p-6 max-w-md mx-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2">ポートフォリオを削除</h3>
        <p class="text-gray-600 mb-4">「<span id="delete-title"></span>」を削除しますか？この操作は取り消せません。</p>
        <div class="flex justify-end gap-3">
          <button onclick="closeDeleteModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">
            キャンセル
          </button>
          <form id="delete-form" method="POST">
            <button type="submit" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
              削除
            </button>
          </form>
        </div>
      </div>
    </div>

    <script>
      function openDeleteModal(id, title) {
        document.getElementById('delete-title').textContent = title;
        document.getElementById('delete-form').action = '/admin/portfolios/' + id + '/delete';
        document.getElementById('delete-modal').classList.remove('hidden');
        document.getElementById('delete-modal').classList.add('flex');
      }
      function closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        document.getElementById('delete-modal').classList.remove('flex');
      }
    </script>
  `

  return renderAdminLayout('ポートフォリオ管理', content, 'portfolios')
}

// ポートフォリオ作成・編集フォーム
export const renderPortfolioForm = (portfolio?: Portfolio) => {
  const isEdit = !!portfolio
  const technologies = portfolio ? JSON.parse(portfolio.technologies || '[]') as string[] : []
  const images = portfolio ? JSON.parse(portfolio.images || '[]') as string[] : []

  const content = `
    <div class="mb-6">
      <a href="/admin/portfolios" class="text-gray-500 hover:text-gray-700 text-sm">
        <i class="fas fa-arrow-left mr-1"></i>ポートフォリオ一覧に戻る
      </a>
      <h1 class="text-2xl font-bold text-gray-800 mt-2">${isEdit ? 'ポートフォリオを編集' : '新規ポートフォリオ作成'}</h1>
    </div>

    <form action="${isEdit ? `/admin/portfolios/${portfolio?.id}` : '/admin/portfolios'}" method="POST" id="portfolio-form">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- 基本情報 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-info-circle text-blue-500 mr-2"></i>基本情報
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">タイトル <span class="text-red-500">*</span></label>
                <input type="text" name="title" value="${portfolio?.title || ''}" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="プロジェクト名">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">スラッグ（URL用）</label>
                <input type="text" name="slug" value="${portfolio?.slug || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="project-name（空欄の場合は自動生成）">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">概要説明</label>
                <textarea name="description" rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="プロジェクトの簡単な説明">${portfolio?.description || ''}</textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                  <select name="category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                    ${portfolioCategories.map(cat => `
                      <option value="${cat}" ${portfolio?.category === cat ? 'selected' : ''}>${cat}</option>
                    `).join('')}
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">制作期間</label>
                  <input type="text" name="duration" value="${portfolio?.duration || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="例: 2週間, 1ヶ月">
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">クライアント</label>
                  <input type="text" name="client" value="${portfolio?.client || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="例: 株式会社〇〇">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">担当役割</label>
                  <input type="text" name="role" value="${portfolio?.role || ''}"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="例: フロントエンド開発">
                </div>
              </div>
            </div>
          </div>
          
          <!-- 詳細説明 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-file-alt text-green-500 mr-2"></i>詳細説明
            </h2>
            <textarea name="content" rows="10" id="content-editor"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
              placeholder="プロジェクトの詳細説明（Markdown対応）">${portfolio?.content || ''}</textarea>
            <p class="text-xs text-gray-500 mt-2">Markdown形式で記述できます</p>
          </div>
          
          <!-- 使用技術・ツール -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-tools text-purple-500 mr-2"></i>使用ツール・技術
            </h2>
            
            <!-- 選択済みタグ -->
            <div id="tech-container" class="flex flex-wrap gap-2 mb-4 min-h-[40px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              ${technologies.length > 0 ? technologies.map(tech => `
                <span class="tech-tag inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                  ${tech}
                  <button type="button" onclick="removeTech(this)" class="ml-2 text-purple-500 hover:text-purple-700">
                    <i class="fas fa-times"></i>
                  </button>
                </span>
              `).join('') : '<span class="text-gray-400 text-sm">下から選択または入力してください</span>'}
            </div>
            
            <!-- 手動入力 -->
            <div class="flex gap-2 mb-4">
              <input type="text" id="tech-input" 
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="ツール名を入力してEnter">
              <button type="button" onclick="addTech()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                追加
              </button>
            </div>
            
            <!-- 候補から選択 -->
            <div class="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto bg-white">
              <p class="text-xs text-gray-500 mb-3"><i class="fas fa-mouse-pointer mr-1"></i>クリックで追加</p>
              <div class="flex flex-wrap gap-2">
                ${techSuggestions.map(tech => `
                  <button type="button" onclick="addTechFromSuggestion('${tech}')" 
                    class="tech-suggestion px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-purple-100 hover:border-purple-300 hover:text-purple-700 transition">
                    ${tech}
                  </button>
                `).join('')}
              </div>
            </div>
            
            <input type="hidden" name="technologies" id="technologies-input" value='${JSON.stringify(technologies)}'>
          </div>
          
          <!-- デモ・メディア設定 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-play-circle text-red-500 mr-2"></i>デモ・メディア設定
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">デモタイプ</label>
                <div class="grid grid-cols-5 gap-2">
                  ${[
                    { value: 'image', icon: 'fa-image', label: '画像' },
                    { value: 'video', icon: 'fa-video', label: '動画' },
                    { value: 'slides', icon: 'fa-images', label: 'スライド' },
                    { value: 'link', icon: 'fa-external-link-alt', label: 'リンク' },
                    { value: 'multiple', icon: 'fa-layer-group', label: '複合' }
                  ].map(type => `
                    <label class="cursor-pointer">
                      <input type="radio" name="demo_type" value="${type.value}" ${(portfolio?.demo_type || 'image') === type.value ? 'checked' : ''} class="hidden peer">
                      <div class="flex flex-col items-center p-3 border-2 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:bg-gray-50 transition">
                        <i class="fas ${type.icon} text-xl mb-1"></i>
                        <span class="text-xs">${type.label}</span>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>
              
              <!-- サムネイル画像 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">サムネイル画像</label>
                <div id="thumbnail-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
                  ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleThumbnailDrop(event)" onclick="document.getElementById('thumbnail-file').click()">
                  <div id="thumbnail-preview" class="${portfolio?.thumbnail ? '' : 'hidden'}">
                    <img src="${portfolio?.thumbnail || ''}" class="max-h-32 mx-auto rounded-lg mb-2" id="thumbnail-preview-img">
                    <button type="button" onclick="event.stopPropagation(); clearThumbnail()" class="text-red-500 hover:text-red-700 text-sm">
                      <i class="fas fa-times mr-1"></i>削除
                    </button>
                  </div>
                  <div id="thumbnail-placeholder" class="${portfolio?.thumbnail ? 'hidden' : ''}">
                    <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                    <p class="text-sm text-gray-500">クリックまたはドラッグ＆ドロップ</p>
                    <p class="text-xs text-gray-400">PNG, JPG, GIF, WebP（最大5MB）</p>
                  </div>
                </div>
                <input type="file" id="thumbnail-file" class="hidden" accept="image/*" onchange="handleThumbnailSelect(event)">
                <input type="text" name="thumbnail" id="thumbnail-url" value="${portfolio?.thumbnail || ''}"
                  class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="または画像URLを直接入力">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">動画URL（YouTube, Vimeo等）</label>
                <input type="text" name="video_url" value="${portfolio?.video_url || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://youtube.com/watch?v=... または https://vimeo.com/...">
              </div>
              
              <!-- 画像/スライド（複数可） -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">画像/スライド（複数可）</label>
                
                <!-- ドラッグ＆ドロップエリア -->
                <div id="images-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-3 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer"
                  ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleImagesDrop(event)" onclick="document.getElementById('images-file').click()">
                  <i class="fas fa-images text-2xl text-gray-400 mb-2"></i>
                  <p class="text-sm text-gray-500">クリックまたはドラッグ＆ドロップで画像を追加</p>
                  <p class="text-xs text-gray-400">複数ファイル対応</p>
                </div>
                <input type="file" id="images-file" class="hidden" accept="image/*" multiple onchange="handleImagesSelect(event)">
                
                <!-- アップロード済み画像一覧 -->
                <div id="images-container" class="space-y-2 mb-2">
                  ${images.map((img, i) => `
                    <div class="flex gap-2 image-row items-center">
                      <img src="${img}" class="w-12 h-12 object-cover rounded" onerror="this.style.display='none'">
                      <input type="text" value="${img}" 
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none image-input text-sm"
                        placeholder="画像URL">
                      <button type="button" onclick="removeImage(this)" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  `).join('')}
                </div>
                <button type="button" onclick="addImage()" class="text-blue-600 hover:text-blue-800 text-sm">
                  <i class="fas fa-plus mr-1"></i>URL入力欄を追加
                </button>
                <input type="hidden" name="images" id="images-input" value='${JSON.stringify(images)}'>
              </div>
            </div>
          </div>
          
          <!-- リンク設定 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-link text-blue-500 mr-2"></i>リンク設定
            </h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">デモURL</label>
                <input type="text" name="demo_url" value="${portfolio?.demo_url || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://demo.example.com">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">公開サイトURL</label>
                <input type="text" name="live_url" value="${portfolio?.live_url || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://example.com">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">GitHubリポジトリ</label>
                <input type="text" name="github_url" value="${portfolio?.github_url || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://github.com/username/repo">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          
          <!-- 公開設定 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4">公開設定</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select name="status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                  <option value="draft" ${portfolio?.status === 'draft' ? 'selected' : ''}>下書き</option>
                  <option value="published" ${portfolio?.status === 'published' ? 'selected' : ''}>公開</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">表示順序</label>
                <input type="number" name="sort_order" value="${portfolio?.sort_order || 0}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0">
                <p class="text-xs text-gray-500 mt-1">数字が小さいほど先に表示</p>
              </div>
            </div>
          </div>
          
          <!-- SEO設定 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <i class="fas fa-search text-green-500 mr-2"></i>SEO設定
            </h2>
            
            <!-- SEOスコア表示 -->
            <div id="seo-score-container" class="mb-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">SEOスコア</span>
                <button type="button" onclick="analyzeSEO()" class="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full transition">
                  <i class="fas fa-sync-alt mr-1"></i>分析
                </button>
              </div>
              <div class="flex items-center gap-3">
                <div class="relative w-16 h-16">
                  <svg class="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="6" fill="none"/>
                    <circle id="seo-score-circle" cx="32" cy="32" r="28" stroke="#10b981" stroke-width="6" fill="none"
                      stroke-dasharray="176" stroke-dashoffset="176" stroke-linecap="round"/>
                  </svg>
                  <span id="seo-score-text" class="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-700">--</span>
                </div>
                <div id="seo-score-label" class="text-sm text-gray-500">分析ボタンを押してください</div>
              </div>
            </div>
            
            <!-- SEO提案 -->
            <div id="seo-suggestions" class="mb-4 hidden">
              <p class="text-sm font-medium text-gray-700 mb-2"><i class="fas fa-lightbulb text-yellow-500 mr-1"></i>改善提案</p>
              <ul id="seo-suggestions-list" class="text-xs space-y-1"></ul>
            </div>
            
            <!-- AI生成ボタン -->
            <button type="button" onclick="generateSEO()" class="w-full mb-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-2 rounded-lg transition text-sm">
              <i class="fas fa-magic mr-2"></i>AIでSEO情報を生成
            </button>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">メタディスクリプション</label>
                <textarea name="meta_description" id="meta-description" rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="検索結果に表示される説明文（120文字以内推奨）">${portfolio?.meta_description || ''}</textarea>
                <p class="text-xs text-gray-500 mt-1"><span id="meta-char-count">${(portfolio?.meta_description || '').length}</span>/120文字</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">キーワード</label>
                <input type="text" name="keywords" id="keywords-input" value="${portfolio?.keywords || ''}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  placeholder="キーワード1, キーワード2, ...">
              </div>
            </div>
          </div>
          
          <!-- 保存ボタン -->
          <div class="flex gap-3">
            <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-medium">
              <i class="fas fa-save mr-2"></i>${isEdit ? '更新' : '作成'}
            </button>
            <a href="/admin/portfolios" class="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition">
              キャンセル
            </a>
          </div>
        </div>
      </div>
    </form>

    <script>
      // 使用技術の管理
      function addTech() {
        const input = document.getElementById('tech-input');
        const value = input.value.trim();
        if (!value) return;
        addTechTag(value);
        input.value = '';
      }
      
      function addTechFromSuggestion(tech) {
        // 既に追加されているかチェック
        const tags = document.querySelectorAll('.tech-tag');
        const existing = Array.from(tags).map(tag => tag.textContent.trim());
        if (existing.includes(tech)) {
          alert('「' + tech + '」は既に追加されています');
          return;
        }
        addTechTag(tech);
      }
      
      function addTechTag(value) {
        const container = document.getElementById('tech-container');
        // プレースホルダーテキストを削除
        const placeholder = container.querySelector('.text-gray-400');
        if (placeholder) placeholder.remove();
        
        const tag = document.createElement('span');
        tag.className = 'tech-tag inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm';
        tag.innerHTML = value + '<button type="button" onclick="removeTech(this)" class="ml-2 text-purple-500 hover:text-purple-700"><i class="fas fa-times"></i></button>';
        container.appendChild(tag);
        updateTechnologies();
      }
      
      function removeTech(btn) {
        btn.parentElement.remove();
        updateTechnologies();
        // 全て削除されたらプレースホルダーを表示
        const container = document.getElementById('tech-container');
        if (container.querySelectorAll('.tech-tag').length === 0) {
          container.innerHTML = '<span class="text-gray-400 text-sm">下から選択または入力してください</span>';
        }
      }
      
      function updateTechnologies() {
        const tags = document.querySelectorAll('.tech-tag');
        const techs = Array.from(tags).map(tag => tag.textContent.trim());
        document.getElementById('technologies-input').value = JSON.stringify(techs);
      }
      
      document.getElementById('tech-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addTech();
        }
      });
      
      // 画像の管理
      function addImage() {
        const container = document.getElementById('images-container');
        const row = document.createElement('div');
        row.className = 'flex gap-2 image-row items-center';
        row.innerHTML = '<div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center"><i class="fas fa-image text-gray-400"></i></div><input type="text" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none image-input text-sm" placeholder="画像URL"><button type="button" onclick="removeImage(this)" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"><i class="fas fa-trash"></i></button>';
        container.appendChild(row);
      }
      
      function removeImage(btn) {
        btn.parentElement.remove();
        updateImages();
      }
      
      function updateImages() {
        const inputs = document.querySelectorAll('.image-input');
        const images = Array.from(inputs).map(input => input.value).filter(v => v.trim());
        document.getElementById('images-input').value = JSON.stringify(images);
      }
      
      // ドラッグ＆ドロップ関連
      function handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
      }
      
      function handleDragLeave(e) {
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
      }
      
      async function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const res = await fetch('/admin/api/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.url) return data.url;
          throw new Error(data.error || 'アップロードに失敗しました');
        } catch (err) {
          console.error('Upload error:', err);
          alert('画像のアップロードに失敗しました: ' + err.message);
          return null;
        }
      }
      
      async function handleThumbnailDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          const url = await uploadImage(file);
          if (url) setThumbnail(url);
        }
      }
      
      async function handleThumbnailSelect(e) {
        const file = e.target.files[0];
        if (file) {
          const url = await uploadImage(file);
          if (url) setThumbnail(url);
        }
      }
      
      function setThumbnail(url) {
        document.getElementById('thumbnail-url').value = url;
        document.getElementById('thumbnail-preview-img').src = url;
        document.getElementById('thumbnail-preview').classList.remove('hidden');
        document.getElementById('thumbnail-placeholder').classList.add('hidden');
      }
      
      function clearThumbnail() {
        document.getElementById('thumbnail-url').value = '';
        document.getElementById('thumbnail-preview').classList.add('hidden');
        document.getElementById('thumbnail-placeholder').classList.remove('hidden');
      }
      
      async function handleImagesDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        for (const file of files) {
          const url = await uploadImage(file);
          if (url) addImageRow(url);
        }
      }
      
      async function handleImagesSelect(e) {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const url = await uploadImage(file);
          if (url) addImageRow(url);
        }
        e.target.value = '';
      }
      
      function addImageRow(url) {
        const container = document.getElementById('images-container');
        const row = document.createElement('div');
        row.className = 'flex gap-2 image-row items-center';
        row.innerHTML = '<img src="' + url + '" class="w-12 h-12 object-cover rounded"><input type="text" value="' + url + '" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none image-input text-sm" placeholder="画像URL"><button type="button" onclick="removeImage(this)" class="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"><i class="fas fa-trash"></i></button>';
        container.appendChild(row);
        updateImages();
      }
      
      // SEO分析
      function analyzeSEO() {
        const title = document.querySelector('input[name="title"]').value;
        const description = document.querySelector('textarea[name="description"]').value;
        const metaDesc = document.getElementById('meta-description').value;
        const keywords = document.getElementById('keywords-input').value;
        const content = document.getElementById('content-editor')?.value || '';
        
        let score = 0;
        const suggestions = [];
        
        // タイトルチェック (25点)
        if (title.length >= 10 && title.length <= 60) {
          score += 25;
        } else if (title.length > 0) {
          score += 10;
          suggestions.push(title.length < 10 ? 'タイトルをもう少し長くしましょう（10文字以上推奨）' : 'タイトルが長すぎます（60文字以内推奨）');
        } else {
          suggestions.push('タイトルを入力してください');
        }
        
        // 説明文チェック (25点)
        if (description.length >= 50) {
          score += 25;
        } else if (description.length > 0) {
          score += 10;
          suggestions.push('説明文をもう少し詳しく書きましょう（50文字以上推奨）');
        } else {
          suggestions.push('説明文を入力してください');
        }
        
        // メタディスクリプションチェック (25点)
        if (metaDesc.length >= 50 && metaDesc.length <= 120) {
          score += 25;
        } else if (metaDesc.length > 0) {
          score += 10;
          suggestions.push(metaDesc.length < 50 ? 'メタディスクリプションをもう少し長くしましょう' : 'メタディスクリプションが長すぎます（120文字以内推奨）');
        } else {
          suggestions.push('メタディスクリプションを入力してください');
        }
        
        // キーワードチェック (25点)
        const keywordList = keywords.split(',').filter(k => k.trim());
        if (keywordList.length >= 3 && keywordList.length <= 5) {
          score += 25;
        } else if (keywordList.length > 0) {
          score += 15;
          suggestions.push('キーワードは3〜5個が最適です');
        } else {
          suggestions.push('キーワードを入力してください');
        }
        
        // スコア表示を更新
        updateSEOScore(score, suggestions);
      }
      
      function updateSEOScore(score, suggestions) {
        const circle = document.getElementById('seo-score-circle');
        const text = document.getElementById('seo-score-text');
        const label = document.getElementById('seo-score-label');
        const suggestionsContainer = document.getElementById('seo-suggestions');
        const suggestionsList = document.getElementById('seo-suggestions-list');
        
        // スコア円グラフ
        const offset = 176 - (176 * score / 100);
        circle.style.strokeDashoffset = offset;
        circle.style.stroke = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
        text.textContent = score;
        
        // ラベル
        label.textContent = score >= 80 ? '優秀！' : score >= 50 ? '改善の余地あり' : '要改善';
        label.className = 'text-sm ' + (score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600');
        
        // 提案
        if (suggestions.length > 0) {
          suggestionsContainer.classList.remove('hidden');
          suggestionsList.innerHTML = suggestions.map(s => '<li class="text-amber-700 bg-amber-50 px-2 py-1 rounded"><i class="fas fa-exclamation-circle mr-1"></i>' + s + '</li>').join('');
        } else {
          suggestionsContainer.classList.add('hidden');
        }
      }
      
      // AI SEO生成
      async function generateSEO() {
        const title = document.querySelector('input[name="title"]').value;
        const description = document.querySelector('textarea[name="description"]').value;
        
        if (!title) {
          alert('タイトルを入力してください');
          return;
        }
        
        const btn = event.target;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
        
        try {
          const res = await fetch('/admin/api/ai/generate-meta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content: description })
          });
          const data = await res.json();
          
          if (data.metaDescription) {
            document.getElementById('meta-description').value = data.metaDescription;
            document.getElementById('meta-char-count').textContent = data.metaDescription.length;
          }
          if (data.keywords) {
            document.getElementById('keywords-input').value = data.keywords.join(', ');
          }
          
          // 自動で分析
          analyzeSEO();
        } catch (err) {
          alert('SEO情報の生成に失敗しました');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-magic mr-2"></i>AIでSEO情報を生成';
        }
      }
      
      // メタディスクリプションの文字数カウント
      document.getElementById('meta-description')?.addEventListener('input', function() {
        document.getElementById('meta-char-count').textContent = this.value.length;
      });
      
      // フォーム送信前に画像を更新
      document.getElementById('portfolio-form').addEventListener('submit', function() {
        updateImages();
        updateTechnologies();
      });
      
      // AI生成データを読み込む
      (function() {
        const aiData = sessionStorage.getItem('aiGeneratedPortfolio');
        if (aiData) {
          try {
            const data = JSON.parse(aiData);
            
            // フィールドにデータを設定
            if (data.title) document.querySelector('input[name="title"]').value = data.title;
            if (data.description) document.querySelector('textarea[name="description"]').value = data.description;
            if (data.content) document.querySelector('textarea[name="content"]').value = data.content;
            if (data.category) document.querySelector('select[name="category"]').value = data.category;
            if (data.duration) document.querySelector('input[name="duration"]').value = data.duration;
            if (data.role) document.querySelector('input[name="role"]').value = data.role;
            if (data.meta_description) document.querySelector('textarea[name="meta_description"]').value = data.meta_description;
            if (data.keywords) document.querySelector('input[name="keywords"]').value = data.keywords;
            if (data.thumbnail) document.querySelector('input[name="thumbnail"]').value = data.thumbnail;
            
            // 使用技術を追加
            if (data.technologies && Array.isArray(data.technologies)) {
              const container = document.getElementById('tech-container');
              data.technologies.forEach(tech => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm';
                tag.innerHTML = tech + '<button type="button" onclick="removeTech(this)" class="ml-2 text-purple-500 hover:text-purple-700"><i class="fas fa-times"></i></button>';
                container.appendChild(tag);
              });
              updateTechnologies();
            }
            
            // セッションストレージをクリア
            sessionStorage.removeItem('aiGeneratedPortfolio');
            
            // 通知表示
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            toast.innerHTML = '<i class="fas fa-magic mr-2"></i>AI生成データを読み込みました';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            
          } catch (e) {
            console.error('AI data parse error:', e);
          }
        }
      })();
    </script>
  `

  return renderAdminLayout(isEdit ? 'ポートフォリオ編集' : '新規ポートフォリオ', content, 'portfolios')
}
