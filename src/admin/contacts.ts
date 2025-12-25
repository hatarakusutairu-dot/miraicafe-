import { renderAdminLayout } from './layout'

interface Contact {
  id: number
  name: string
  email: string
  phone: string | null
  type: string
  subject: string
  message: string
  status: string
  created_at: string
}

// お問い合わせ一覧ページ
export const renderContactsList = (contacts: Contact[], activeTab: string = 'new') => {
  const newContacts = contacts.filter(c => c.status === 'new')
  const handledContacts = contacts.filter(c => c.status === 'handled')

  const tabs = [
    { id: 'new', label: '未対応', count: newContacts.length, color: 'red' },
    { id: 'handled', label: '対応済み', count: handledContacts.length, color: 'green' },
    { id: 'all', label: 'すべて', count: contacts.length, color: 'gray' },
  ]

  const currentContacts = 
    activeTab === 'new' ? newContacts :
    activeTab === 'handled' ? handledContacts :
    contacts

  const content = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">お問い合わせ管理</h1>
      <p class="text-gray-500 mt-1">ユーザーからのお問い合わせを管理します</p>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm mb-6">
      <div class="flex border-b border-gray-200">
        ${tabs.map(tab => `
          <a href="/admin/contacts?tab=${tab.id}" 
             class="px-6 py-4 text-sm font-medium transition ${activeTab === tab.id 
               ? `text-${tab.color}-600 border-b-2 border-${tab.color}-600` 
               : 'text-gray-500 hover:text-gray-700'}">
            ${tab.label}
            <span class="ml-2 px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id 
              ? `bg-${tab.color}-100 text-${tab.color}-700` 
              : 'bg-gray-100 text-gray-600'}">${tab.count}</span>
          </a>
        `).join('')}
      </div>
    </div>

    <!-- Contacts List -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">お名前</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">種別</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">件名</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
            <th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${currentContacts.length > 0 ? currentContacts.map(contact => `
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                ${formatDate(contact.created_at)}
              </td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-gray-800">${escapeHtml(contact.name)}</p>
                  <p class="text-sm text-gray-500">${escapeHtml(contact.email)}</p>
                </div>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <span class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                  ${escapeHtml(contact.type)}
                </span>
              </td>
              <td class="px-6 py-4">
                <p class="text-gray-800 line-clamp-1 max-w-xs">${escapeHtml(contact.subject)}</p>
              </td>
              <td class="px-6 py-4">
                <span class="inline-block px-2 py-1 text-xs rounded ${contact.status === 'new' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'}">
                  ${contact.status === 'new' ? '未対応' : '対応済み'}
                </span>
              </td>
              <td class="px-6 py-4">
                <a href="/admin/contacts/${contact.id}" class="text-blue-600 hover:text-blue-800 text-sm">
                  <i class="fas fa-eye mr-1"></i>詳細
                </a>
              </td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                <i class="fas fa-envelope text-gray-300 text-4xl mb-4 block"></i>
                ${activeTab === 'new' ? '未対応のお問い合わせはありません' :
                  activeTab === 'handled' ? '対応済みのお問い合わせはありません' :
                  'お問い合わせはありません'}
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `

  return renderAdminLayout('お問い合わせ管理', content, 'contacts')
}

// お問い合わせ詳細ページ
export const renderContactDetail = (contact: Contact, senderEmail?: string) => {
  const fromEmail = senderEmail || 'info@miraicafe.com'
  
  const content = `
    <div class="mb-6">
      <a href="/admin/contacts" class="text-gray-500 hover:text-gray-700 text-sm">
        <i class="fas fa-arrow-left mr-1"></i>お問い合わせ一覧に戻る
      </a>
      <h1 class="text-2xl font-bold text-gray-800 mt-2">お問い合わせ詳細</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-800">件名</h2>
            <span class="inline-block px-3 py-1 text-sm rounded ${contact.status === 'new' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'}">
              ${contact.status === 'new' ? '未対応' : '対応済み'}
            </span>
          </div>
          <p class="text-xl text-gray-800">${escapeHtml(contact.subject)}</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">お問い合わせ内容</h2>
          <div class="prose max-w-none">
            <p class="text-gray-700 whitespace-pre-wrap">${escapeHtml(contact.message)}</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">送信者情報</h2>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">お名前</p>
              <p class="font-medium text-gray-800">${escapeHtml(contact.name)}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">メールアドレス</p>
              <p class="font-medium text-gray-800">
                <a href="mailto:${escapeHtml(contact.email)}" class="text-blue-600 hover:text-blue-800">
                  ${escapeHtml(contact.email)}
                </a>
              </p>
            </div>
            ${contact.phone ? `
              <div>
                <p class="text-sm text-gray-500">電話番号</p>
                <p class="font-medium text-gray-800">${escapeHtml(contact.phone)}</p>
              </div>
            ` : ''}
            <div>
              <p class="text-sm text-gray-500">種別</p>
              <span class="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                ${escapeHtml(contact.type)}
              </span>
            </div>
            <div>
              <p class="text-sm text-gray-500">送信日時</p>
              <p class="font-medium text-gray-800">${formatDateTime(contact.created_at)}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-800 mb-4">アクション</h2>
          <div class="space-y-3">
            ${contact.status === 'new' ? `
              <form action="/admin/contacts/${contact.id}/status" method="POST">
                <input type="hidden" name="status" value="handled">
                <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition flex items-center justify-center">
                  <i class="fas fa-check mr-2"></i>対応済みにする
                </button>
              </form>
            ` : `
              <form action="/admin/contacts/${contact.id}/status" method="POST">
                <input type="hidden" name="status" value="new">
                <button type="submit" class="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg transition flex items-center justify-center">
                  <i class="fas fa-undo mr-2"></i>未対応に戻す
                </button>
              </form>
            `}
            <button onclick="openEmailModal()" 
               class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition flex items-center justify-center">
              <i class="fas fa-envelope mr-2"></i>メールで返信
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- メール送信モーダル -->
    <div id="email-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- ヘッダー -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h3 class="text-lg font-bold text-white flex items-center">
            <i class="fas fa-envelope mr-2"></i>返信メールを作成
          </h3>
          <button onclick="closeEmailModal()" class="text-white/80 hover:text-white transition p-1">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- コンテンツ -->
        <div class="p-6 overflow-y-auto flex-1">
          <!-- 送信元・送信先情報 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <div class="flex items-center text-sm">
              <span class="text-gray-500 w-20">送信元:</span>
              <span class="font-medium text-gray-800">${escapeHtml(fromEmail)}</span>
            </div>
            <div class="flex items-center text-sm">
              <span class="text-gray-500 w-20">送信先:</span>
              <span class="font-medium text-blue-600">${escapeHtml(contact.email)}</span>
              <span class="text-gray-500 ml-2">(${escapeHtml(contact.name)} 様)</span>
            </div>
          </div>
          
          <!-- 件名 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">件名</label>
            <input type="text" id="email-subject" 
              value="Re: ${escapeHtml(contact.subject)}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          </div>
          
          <!-- 本文 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <label class="block text-sm font-medium text-gray-700">本文</label>
              <button onclick="generateEmailBody()" id="ai-generate-btn"
                class="text-sm bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-1 rounded-lg transition flex items-center">
                <i class="fas fa-magic mr-1"></i>AIで自動生成
              </button>
            </div>
            <textarea id="email-body" rows="12"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-sans"
              placeholder="返信内容を入力してください..."></textarea>
          </div>
          
          <!-- 元のお問い合わせ内容（参考表示） -->
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p class="text-xs font-medium text-amber-700 mb-2">
              <i class="fas fa-quote-left mr-1"></i>元のお問い合わせ内容（参考）
            </p>
            <p class="text-sm text-amber-800 whitespace-pre-wrap">${escapeHtml(contact.message)}</p>
          </div>
        </div>
        
        <!-- フッター -->
        <div class="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <button onclick="closeEmailModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
            キャンセル
          </button>
          <button onclick="sendEmail()" id="send-email-btn"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition flex items-center">
            <i class="fas fa-paper-plane mr-2"></i>送信する
          </button>
        </div>
      </div>
    </div>

    <script>
      // 問い合わせ情報をJavaScriptで保持
      const contactData = {
        id: ${contact.id},
        name: "${escapeHtml(contact.name).replace(/"/g, '\\"')}",
        email: "${escapeHtml(contact.email).replace(/"/g, '\\"')}",
        subject: "${escapeHtml(contact.subject).replace(/"/g, '\\"')}",
        message: ${JSON.stringify(contact.message)},
        type: "${escapeHtml(contact.type).replace(/"/g, '\\"')}"
      };
      
      // モーダルを開く
      function openEmailModal() {
        document.getElementById('email-modal').classList.remove('hidden');
        document.getElementById('email-modal').classList.add('flex');
        document.body.style.overflow = 'hidden';
        
        // 本文が空の場合は自動生成を実行
        const bodyInput = document.getElementById('email-body');
        if (!bodyInput.value.trim()) {
          generateEmailBody();
        }
      }
      
      // モーダルを閉じる
      function closeEmailModal() {
        document.getElementById('email-modal').classList.add('hidden');
        document.getElementById('email-modal').classList.remove('flex');
        document.body.style.overflow = '';
      }
      
      // 背景クリックで閉じる
      document.getElementById('email-modal').addEventListener('click', function(e) {
        if (e.target === this) closeEmailModal();
      });
      
      // ESCキーで閉じる
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeEmailModal();
      });
      
      // AIで本文を自動生成
      async function generateEmailBody() {
        const btn = document.getElementById('ai-generate-btn');
        const bodyInput = document.getElementById('email-body');
        const originalHtml = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>生成中...';
        
        try {
          const response = await fetch('/admin/api/ai/generate-email-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: contactData.name,
              subject: contactData.subject,
              message: contactData.message,
              type: contactData.type
            })
          });
          
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          if (data.body) {
            bodyInput.value = data.body;
            showToast('返信文を生成しました', 'success');
          }
        } catch (error) {
          console.error('AI生成エラー:', error);
          showToast('返信文の生成に失敗しました', 'error');
          // フォールバック
          bodyInput.value = contactData.name + ' 様\\n\\nお問い合わせいただきありがとうございます。\\nmirAIcafeの運営事務局です。\\n\\nご連絡いただいた件について、下記の通りご回答申し上げます。\\n\\n\\n\\n何かご不明な点がございましたら、お気軽にお問い合わせください。\\n\\n今後ともmirAIcafeをよろしくお願いいたします。\\n\\n--\\nmirAIcafe 運営事務局';
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      }
      
      // メール送信
      async function sendEmail() {
        const subject = document.getElementById('email-subject').value.trim();
        const body = document.getElementById('email-body').value.trim();
        const btn = document.getElementById('send-email-btn');
        
        if (!body) {
          showToast('本文を入力してください', 'error');
          return;
        }
        
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
        
        try {
          const response = await fetch('/admin/api/contacts/' + contactData.id + '/reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: contactData.email,
              subject: subject,
              body: body
            })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || '送信に失敗しました');
          }
          
          showToast('メールを送信しました', 'success');
          closeEmailModal();
          
          // 対応済みに自動更新
          setTimeout(() => {
            if (confirm('このお問い合わせを対応済みにしますか？')) {
              location.href = '/admin/contacts/' + contactData.id + '/status?auto=handled';
            }
          }, 500);
          
        } catch (error) {
          console.error('送信エラー:', error);
          showToast(error.message || 'メールの送信に失敗しました', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = originalHtml;
        }
      }
      
      // トースト通知
      function showToast(message, type = 'success') {
        const colors = { success: '#10b981', warning: '#f59e0b', error: '#ef4444' };
        const icons = { success: 'check-circle', warning: 'exclamation-triangle', error: 'times-circle' };
        const toast = document.createElement('div');
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: ' + (colors[type] || colors.success) + '; color: white; padding: 12px 20px; border-radius: 8px; z-index: 10001; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
        toast.innerHTML = '<i class="fas fa-' + (icons[type] || icons.success) + ' mr-2"></i>' + message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    </script>
  `

  return renderAdminLayout('お問い合わせ詳細', content, 'contacts')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
