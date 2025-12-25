import { renderAdminLayout } from './layout'

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

export const renderAIPortfolioGeneratorPage = () => {
  const content = `
    <div class="mb-6">
      <a href="/admin/portfolios" class="text-gray-500 hover:text-gray-700 text-sm">
        <i class="fas fa-arrow-left mr-1"></i>ポートフォリオ一覧に戻る
      </a>
      <h1 class="text-2xl font-bold text-gray-800 mt-2 flex items-center">
        <span class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-lg mr-3 text-sm">AI</span>
        ポートフォリオジェネレーター
      </h1>
      <p class="text-gray-500 mt-1">プロジェクトの概要からAIがポートフォリオを自動生成します</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- 入力パネル -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-edit text-purple-500 mr-2"></i>プロジェクト情報を入力
        </h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">プロジェクト名 / テーマ <span class="text-red-500">*</span></label>
            <input type="text" id="project-topic"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="例: ECサイトの開発、AIチャットボット、社内管理システム">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select id="project-category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none">
              ${portfolioCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">使用技術（複数選択可）</label>
            <div class="flex flex-wrap gap-2 mb-2" id="selected-techs"></div>
            <div class="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <div class="flex flex-wrap gap-2">
                ${techSuggestions.map(tech => `
                  <button type="button" onclick="toggleTech('${tech}')" class="tech-btn px-3 py-1 text-sm rounded-full border border-gray-300 hover:bg-purple-100 hover:border-purple-300 transition" data-tech="${tech}">
                    ${tech}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">プロジェクトの概要・目的</label>
            <textarea id="project-description" rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="どんなプロジェクトか、何を解決するものか、主な機能など"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">制作期間</label>
              <input type="text" id="project-duration"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="例: 2週間">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">担当役割</label>
              <input type="text" id="project-role"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="例: フルスタック開発">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">追加の指示（任意）</label>
            <textarea id="additional-instructions" rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="強調したいポイント、含めたい内容など"></textarea>
          </div>
          
          <button onclick="generatePortfolio()" id="generate-btn"
            class="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center">
            <i class="fas fa-magic mr-2"></i>AIで生成
          </button>
        </div>
      </div>
      
      <!-- 結果パネル -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <i class="fas fa-sparkles text-amber-500 mr-2"></i>生成結果
        </h2>
        
        <div id="result-placeholder" class="text-center py-16">
          <i class="fas fa-briefcase text-gray-300 text-6xl mb-4"></i>
          <p class="text-gray-500">左側のフォームに入力して<br>「AIで生成」をクリックしてください</p>
        </div>
        
        <div id="result-loading" class="hidden text-center py-16">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p class="text-gray-600">AIがポートフォリオを生成中...</p>
          <p class="text-sm text-gray-400 mt-2">30秒ほどお待ちください</p>
        </div>
        
        <div id="result-content" class="hidden space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">タイトル</label>
            <input type="text" id="result-title" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">概要説明</label>
            <textarea id="result-description" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">詳細説明</label>
            <textarea id="result-content-text" rows="8" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">使用技術</label>
            <div id="result-technologies" class="flex flex-wrap gap-2"></div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">メタディスクリプション</label>
              <textarea id="result-meta" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 mb-1">キーワード</label>
              <input type="text" id="result-keywords" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">おすすめ画像</label>
            <div id="result-images" class="grid grid-cols-3 gap-2"></div>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button onclick="savePortfolio()" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">
              <i class="fas fa-save mr-2"></i>ポートフォリオとして保存
            </button>
            <button onclick="regenerate()" class="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <script>
      const selectedTechs = new Set();
      let generatedData = null;
      
      function toggleTech(tech) {
        const btn = document.querySelector(\`.tech-btn[data-tech="\${tech}"]\`);
        if (selectedTechs.has(tech)) {
          selectedTechs.delete(tech);
          btn.classList.remove('bg-purple-500', 'text-white', 'border-purple-500');
          btn.classList.add('border-gray-300');
        } else {
          selectedTechs.add(tech);
          btn.classList.add('bg-purple-500', 'text-white', 'border-purple-500');
          btn.classList.remove('border-gray-300');
        }
        updateSelectedTechsDisplay();
      }
      
      function updateSelectedTechsDisplay() {
        const container = document.getElementById('selected-techs');
        container.innerHTML = Array.from(selectedTechs).map(tech => 
          '<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">' + tech + '</span>'
        ).join('');
      }
      
      async function generatePortfolio() {
        const topic = document.getElementById('project-topic').value.trim();
        if (!topic) {
          alert('プロジェクト名を入力してください');
          return;
        }
        
        const btn = document.getElementById('generate-btn');
        btn.disabled = true;
        
        document.getElementById('result-placeholder').classList.add('hidden');
        document.getElementById('result-content').classList.add('hidden');
        document.getElementById('result-loading').classList.remove('hidden');
        
        try {
          const response = await fetch('/admin/api/ai/generate-portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              topic: topic,
              category: document.getElementById('project-category').value,
              technologies: Array.from(selectedTechs),
              description: document.getElementById('project-description').value,
              duration: document.getElementById('project-duration').value,
              role: document.getElementById('project-role').value,
              additionalInstructions: document.getElementById('additional-instructions').value
            })
          });
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          generatedData = data;
          displayResults(data);
          
        } catch (error) {
          console.error('Generate error:', error);
          alert('生成に失敗しました: ' + error.message);
          document.getElementById('result-placeholder').classList.remove('hidden');
        } finally {
          btn.disabled = false;
          document.getElementById('result-loading').classList.add('hidden');
        }
      }
      
      function displayResults(data) {
        document.getElementById('result-title').value = data.title || '';
        document.getElementById('result-description').value = data.description || '';
        document.getElementById('result-content-text').value = data.content || '';
        document.getElementById('result-meta').value = data.meta_description || '';
        document.getElementById('result-keywords').value = data.keywords || '';
        
        // 技術タグ
        const techContainer = document.getElementById('result-technologies');
        techContainer.innerHTML = (data.technologies || []).map(tech =>
          '<span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">' + tech + '</span>'
        ).join('');
        
        // 画像候補
        const imgContainer = document.getElementById('result-images');
        imgContainer.innerHTML = (data.image_suggestions || []).slice(0, 6).map((img, i) =>
          '<div class="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500" onclick="selectImage(' + i + ')">' +
          '<img src="' + img.url + '" alt="' + (img.alt || '') + '" class="w-full h-full object-cover">' +
          '</div>'
        ).join('');
        
        document.getElementById('result-content').classList.remove('hidden');
      }
      
      let selectedImageIndex = 0;
      function selectImage(index) {
        selectedImageIndex = index;
        document.querySelectorAll('#result-images > div').forEach((el, i) => {
          el.classList.toggle('ring-2', i === index);
          el.classList.toggle('ring-purple-500', i === index);
        });
      }
      
      function regenerate() {
        generatePortfolio();
      }
      
      function savePortfolio() {
        if (!generatedData) return;
        
        // sessionStorageに保存して編集ページへ
        const portfolioData = {
          title: document.getElementById('result-title').value,
          description: document.getElementById('result-description').value,
          content: document.getElementById('result-content-text').value,
          category: document.getElementById('project-category').value,
          technologies: generatedData.technologies || Array.from(selectedTechs),
          duration: document.getElementById('project-duration').value,
          role: document.getElementById('project-role').value,
          meta_description: document.getElementById('result-meta').value,
          keywords: document.getElementById('result-keywords').value,
          thumbnail: generatedData.image_suggestions?.[selectedImageIndex]?.url || ''
        };
        
        sessionStorage.setItem('aiGeneratedPortfolio', JSON.stringify(portfolioData));
        window.location.href = '/admin/portfolios/new';
      }
    </script>
  `

  return renderAdminLayout('AIポートフォリオジェネレーター', content, 'portfolios')
}
