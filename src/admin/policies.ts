import { renderAdminLayout } from './layout'

export interface Policy {
  id: string
  title: string
  content: string
  last_updated?: string
  updated_by?: string
}

// ポリシー一覧ページ
export const renderPoliciesList = (policies: Policy[]) => {
  const policyInfo: Record<string, { icon: string; description: string; color: string }> = {
    terms: { 
      icon: 'fa-file-contract', 
      description: 'サービス利用に関する規約', 
      color: 'bg-blue-500'
    },
    privacy: { 
      icon: 'fa-shield-alt', 
      description: '個人情報の取り扱いについて', 
      color: 'bg-green-500'
    },
    cancellation: { 
      icon: 'fa-calendar-times', 
      description: '予約キャンセルに関するポリシー', 
      color: 'bg-orange-500'
    },
    tokushoho: { 
      icon: 'fa-store', 
      description: '特定商取引法に基づく表記', 
      color: 'bg-purple-500'
    }
  }

  const content = `
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">
        <i class="fas fa-file-alt mr-3 text-blue-500"></i>ポリシー管理
      </h1>
      <p class="text-gray-600">利用規約・プライバシーポリシー・キャンセルポリシー・特定商取引法を管理します</p>
    </div>

    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">
          <i class="fas fa-list mr-2"></i>ポリシー一覧
        </h2>
      </div>
      
      <div class="divide-y divide-gray-200">
        ${policies.map(policy => {
          const info = policyInfo[policy.id] || { icon: 'fa-file', description: '', color: 'bg-gray-500' }
          const hasContent = policy.content && policy.content !== '（内容準備中）'
          
          return `
            <div class="p-6 hover:bg-gray-50 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 ${info.color} rounded-xl flex items-center justify-center shadow">
                    <i class="fas ${info.icon} text-white text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-800">${policy.title}</h3>
                    <p class="text-sm text-gray-500">${info.description}</p>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${hasContent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                        <i class="fas ${hasContent ? 'fa-check-circle' : 'fa-clock'} mr-1"></i>
                        ${hasContent ? '公開中' : '準備中'}
                      </span>
                      ${policy.last_updated ? `
                        <span class="text-xs text-gray-400">
                          <i class="fas fa-clock mr-1"></i>
                          最終更新: ${new Date(policy.last_updated).toLocaleDateString('ja-JP')}
                        </span>
                      ` : ''}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <a href="/${policy.id === 'cancellation' ? 'cancellation-policy' : (policy.id === 'privacy' ? 'privacy' : policy.id)}" target="_blank" 
                     class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium">
                    <i class="fas fa-external-link-alt mr-2"></i>プレビュー
                  </a>
                  <a href="/admin/policies/edit/${policy.id}" 
                     class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
                    <i class="fas fa-edit mr-2"></i>編集
                  </a>
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>

    <div class="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
      <h3 class="text-lg font-bold text-blue-800 mb-3">
        <i class="fas fa-info-circle mr-2"></i>ポリシー編集のヒント
      </h3>
      <ul class="text-blue-700 space-y-2 text-sm">
        <li><i class="fas fa-check mr-2"></i>HTMLタグを使用して見出しやリストを作成できます</li>
        <li><i class="fas fa-check mr-2"></i>&lt;h2&gt;, &lt;h3&gt; で見出し、&lt;ul&gt;&lt;li&gt; でリストを作成</li>
        <li><i class="fas fa-check mr-2"></i>&lt;strong&gt; で太字、&lt;p&gt; で段落を作成</li>
        <li><i class="fas fa-check mr-2"></i>保存後すぐに公開ページに反映されます</li>
      </ul>
    </div>
  `

  return renderAdminLayout('ポリシー管理', content)
}

// ポリシー編集フォーム
export const renderPolicyEditForm = (policy: Policy | null, policyId: string) => {
  const titles: Record<string, string> = {
    terms: '利用規約',
    privacy: 'プライバシーポリシー',
    cancellation: 'キャンセルポリシー',
    tokushoho: '特定商取引法に基づく表記'
  }

  const icons: Record<string, string> = {
    terms: 'fa-file-contract',
    privacy: 'fa-shield-alt',
    cancellation: 'fa-calendar-times',
    tokushoho: 'fa-store'
  }

  const title = policy?.title || titles[policyId] || 'ポリシー'
  const content = policy?.content || ''
  const icon = icons[policyId] || 'fa-file'

  const pageContent = `
    <div class="mb-8">
      <a href="/admin/policies" class="text-blue-500 hover:text-blue-700 mb-4 inline-block">
        <i class="fas fa-arrow-left mr-2"></i>ポリシー一覧に戻る
      </a>
      <h1 class="text-3xl font-bold text-gray-800">
        <i class="fas ${icon} mr-3 text-blue-500"></i>${title}の編集
      </h1>
    </div>

    <form id="policy-form" class="space-y-6">
      <input type="hidden" id="policy-id" value="${policyId}">
      
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-6">
          <i class="fas fa-edit mr-2"></i>コンテンツ編集
        </h2>
        
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">
            タイトル <span class="text-red-500">*</span>
          </label>
          <input type="text" id="policy-title" value="${title}" required
                 class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">
            内容（HTML対応） <span class="text-red-500">*</span>
          </label>
          <div class="mb-2 flex gap-2">
            <button type="button" onclick="insertTag('h2')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              <i class="fas fa-heading mr-1"></i>見出し2
            </button>
            <button type="button" onclick="insertTag('h3')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              <i class="fas fa-heading mr-1"></i>見出し3
            </button>
            <button type="button" onclick="insertTag('p')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              <i class="fas fa-paragraph mr-1"></i>段落
            </button>
            <button type="button" onclick="insertTag('ul')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              <i class="fas fa-list-ul mr-1"></i>リスト
            </button>
            <button type="button" onclick="insertTag('strong')" class="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
              <i class="fas fa-bold mr-1"></i>太字
            </button>
          </div>
          <textarea id="policy-content" rows="20" required
                    class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="HTMLでポリシーの内容を記述してください...">${content === '（内容準備中）' ? '' : content}</textarea>
        </div>

        <!-- プレビュー -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-gray-700 font-medium">プレビュー</label>
            <button type="button" onclick="togglePreview()" class="text-blue-500 hover:text-blue-700 text-sm">
              <i class="fas fa-eye mr-1"></i>プレビュー更新
            </button>
          </div>
          <div id="preview-area" class="p-6 border border-gray-200 rounded-lg bg-gray-50 min-h-[200px] policy-preview">
            <p class="text-gray-400 text-center">内容を入力するとプレビューが表示されます</p>
          </div>
        </div>
        
        <div class="flex justify-between items-center pt-6 border-t border-gray-200">
          <div class="text-sm text-gray-500">
            ${policy?.last_updated ? `最終更新: ${new Date(policy.last_updated).toLocaleString('ja-JP')}` : ''}
          </div>
          <div class="flex gap-3">
            <a href="/admin/policies" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
              キャンセル
            </a>
            <button type="submit" class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">
              <i class="fas fa-save mr-2"></i>保存
            </button>
          </div>
        </div>
      </div>
    </form>

    <style>
      .policy-preview h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a2e;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e0e7ff;
      }
      .policy-preview h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a2e;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
      }
      .policy-preview p {
        color: #64748b;
        line-height: 1.8;
        margin-bottom: 1rem;
      }
      .policy-preview ul, .policy-preview ol {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
        color: #64748b;
      }
      .policy-preview li {
        margin-bottom: 0.5rem;
        line-height: 1.7;
      }
      .policy-preview strong {
        color: #1a1a2e;
        font-weight: 600;
      }
    </style>

    <script>
      const textarea = document.getElementById('policy-content');
      const previewArea = document.getElementById('preview-area');
      
      // 初期プレビュー表示
      togglePreview();
      
      // テキストエリアの変更を監視
      textarea.addEventListener('input', debounce(togglePreview, 500));
      
      function togglePreview() {
        const content = textarea.value;
        if (content.trim()) {
          previewArea.innerHTML = content;
        } else {
          previewArea.innerHTML = '<p class="text-gray-400 text-center">内容を入力するとプレビューが表示されます</p>';
        }
      }
      
      function insertTag(tag) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let insertion = '';
        
        switch(tag) {
          case 'h2':
            insertion = '<h2>' + (selectedText || '見出し') + '</h2>';
            break;
          case 'h3':
            insertion = '<h3>' + (selectedText || '小見出し') + '</h3>';
            break;
          case 'p':
            insertion = '<p>' + (selectedText || 'テキスト') + '</p>';
            break;
          case 'ul':
            insertion = '<ul>\\n  <li>' + (selectedText || '項目1') + '</li>\\n  <li>項目2</li>\\n</ul>';
            break;
          case 'strong':
            insertion = '<strong>' + (selectedText || '太字テキスト') + '</strong>';
            break;
        }
        
        textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
        textarea.focus();
        togglePreview();
      }
      
      function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
      
      document.getElementById('policy-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const policyId = document.getElementById('policy-id').value;
        const title = document.getElementById('policy-title').value;
        const content = textarea.value;
        
        if (!title || !content) {
          alert('タイトルと内容は必須です');
          return;
        }
        
        try {
          const response = await fetch('/admin/api/policies/' + policyId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content })
          });
          
          if (response.ok) {
            alert('保存しました');
            window.location.href = '/admin/policies';
          } else {
            const error = await response.json();
            alert('エラー: ' + (error.message || '保存に失敗しました'));
          }
        } catch (error) {
          alert('エラーが発生しました');
          console.error(error);
        }
      });
    </script>
  `

  return renderAdminLayout(`${title}の編集`, pageContent)
}
