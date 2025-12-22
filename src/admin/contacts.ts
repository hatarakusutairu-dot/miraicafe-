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
export const renderContactDetail = (contact: Contact) => {
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
            <a href="mailto:${escapeHtml(contact.email)}?subject=Re: ${encodeURIComponent(contact.subject)}" 
               class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition flex items-center justify-center">
              <i class="fas fa-envelope mr-2"></i>メールで返信
            </a>
          </div>
        </div>
      </div>
    </div>
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
