import { renderAdminLayout } from './layout'

interface Review {
  id: number
  course_id: string
  reviewer_name: string
  reviewer_email: string
  rating: number
  comment: string
  status: string
  created_at: string
}

// 口コミ一覧ページ
export const renderReviewsList = (reviews: Review[], activeTab: string = 'pending') => {
  const pendingReviews = reviews.filter(r => r.status === 'pending')
  const approvedReviews = reviews.filter(r => r.status === 'approved')
  const rejectedReviews = reviews.filter(r => r.status === 'rejected')

  const tabs = [
    { id: 'pending', label: '承認待ち', count: pendingReviews.length, color: 'amber' },
    { id: 'approved', label: '承認済み', count: approvedReviews.length, color: 'green' },
    { id: 'rejected', label: '却下', count: rejectedReviews.length, color: 'red' },
  ]

  const currentReviews = 
    activeTab === 'pending' ? pendingReviews :
    activeTab === 'approved' ? approvedReviews :
    rejectedReviews

  const content = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">口コミ管理</h1>
      <p class="text-gray-500 mt-1">ユーザーからの口コミを管理します</p>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-xl shadow-sm mb-6">
      <div class="flex border-b border-gray-200">
        ${tabs.map(tab => `
          <a href="/admin/reviews?tab=${tab.id}" 
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

    <!-- Reviews List -->
    <div class="space-y-4">
      ${currentReviews.length > 0 ? currentReviews.map(review => `
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-4 mb-2">
                <div class="flex text-amber-400">
                  ${Array(5).fill(0).map((_, i) => `
                    <i class="fas fa-star ${i < review.rating ? '' : 'text-gray-300'}"></i>
                  `).join('')}
                </div>
                <span class="text-sm font-medium text-gray-700">${review.reviewer_name}</span>
                <span class="text-sm text-gray-400">${review.reviewer_email}</span>
              </div>
              
              <p class="text-gray-700 mb-3">${escapeHtml(review.comment)}</p>
              
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span><i class="fas fa-book-open mr-1"></i>${review.course_id}</span>
                <span><i class="fas fa-calendar mr-1"></i>${formatDate(review.created_at)}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-2 ml-4">
              ${activeTab === 'pending' ? `
                <form action="/admin/reviews/${review.id}/approve" method="POST" class="inline">
                  <button type="submit" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm">
                    <i class="fas fa-check mr-1"></i>承認
                  </button>
                </form>
                <form action="/admin/reviews/${review.id}/reject" method="POST" class="inline">
                  <button type="submit" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm">
                    <i class="fas fa-times mr-1"></i>却下
                  </button>
                </form>
              ` : activeTab === 'approved' ? `
                <form action="/admin/reviews/${review.id}/reject" method="POST" class="inline">
                  <button type="submit" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm">
                    <i class="fas fa-times mr-1"></i>却下に変更
                  </button>
                </form>
              ` : `
                <form action="/admin/reviews/${review.id}/approve" method="POST" class="inline">
                  <button type="submit" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm">
                    <i class="fas fa-check mr-1"></i>承認に変更
                  </button>
                </form>
              `}
              <button onclick="confirmDelete(${review.id})" class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm">
                <i class="fas fa-trash mr-1"></i>削除
              </button>
            </div>
          </div>
        </div>
      `).join('') : `
        <div class="bg-white rounded-xl shadow-sm p-12 text-center">
          <i class="fas fa-star text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">
            ${activeTab === 'pending' ? '承認待ちの口コミはありません' :
              activeTab === 'approved' ? '承認済みの口コミはありません' :
              '却下された口コミはありません'}
          </p>
        </div>
      `}
    </div>

    <!-- Delete Confirmation Modal -->
    <div id="delete-modal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2">口コミを削除</h3>
        <p class="text-gray-600 mb-4">この口コミを削除しますか？この操作は取り消せません。</p>
        <div class="flex gap-3">
          <form id="delete-form" method="POST" class="flex-1">
            <button type="submit" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
              削除する
            </button>
          </form>
          <button onclick="closeDeleteModal()" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition">
            キャンセル
          </button>
        </div>
      </div>
    </div>

    <script>
      function confirmDelete(id) {
        document.getElementById('delete-form').action = '/admin/reviews/' + id + '/delete';
        document.getElementById('delete-modal').classList.remove('hidden');
        document.getElementById('delete-modal').classList.add('flex');
      }

      function closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        document.getElementById('delete-modal').classList.remove('flex');
      }

      document.getElementById('delete-modal').addEventListener('click', function(e) {
        if (e.target === this) closeDeleteModal();
      });
    </script>
  `

  return renderAdminLayout('口コミ管理', content, 'reviews')
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
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}
