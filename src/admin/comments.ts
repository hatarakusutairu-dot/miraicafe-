import { renderAdminLayout } from './layout'

export interface Comment {
  id: number
  post_id: string
  author_name: string
  content: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  approved_at?: string
  admin_reply?: string
  admin_reply_at?: string
}

export const renderCommentsList = (comments: Comment[], filter: string = 'all') => {
  const pendingCount = comments.filter(c => c.status === 'pending').length
  const approvedCount = comments.filter(c => c.status === 'approved').length
  const rejectedCount = comments.filter(c => c.status === 'rejected').length

  const filteredComments = filter === 'all' 
    ? comments 
    : comments.filter(c => c.status === filter)

  const content = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">コメント管理</h1>
          <p class="text-gray-500 mt-1">ブログ記事へのコメントを承認・管理します</p>
        </div>
        ${pendingCount > 0 ? `
          <div class="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl">
            <i class="fas fa-clock text-yellow-500"></i>
            <span class="text-yellow-700 font-medium">${pendingCount}件の承認待ち</span>
          </div>
        ` : ''}
      </div>

      <!-- Filter Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <a href="/admin/comments" 
           class="px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}">
          すべて <span class="ml-1 text-sm">(${comments.length})</span>
        </a>
        <a href="/admin/comments?filter=pending" 
           class="px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'}">
          <i class="fas fa-clock mr-1"></i>承認待ち <span class="ml-1 text-sm">(${pendingCount})</span>
        </a>
        <a href="/admin/comments?filter=approved" 
           class="px-4 py-2 rounded-lg font-medium transition-all ${filter === 'approved' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}">
          <i class="fas fa-check mr-1"></i>承認済み <span class="ml-1 text-sm">(${approvedCount})</span>
        </a>
        <a href="/admin/comments?filter=rejected" 
           class="px-4 py-2 rounded-lg font-medium transition-all ${filter === 'rejected' ? 'bg-red-100 text-red-700' : 'text-gray-600 hover:bg-gray-100'}">
          <i class="fas fa-ban mr-1"></i>却下 <span class="ml-1 text-sm">(${rejectedCount})</span>
        </a>
      </div>

      <!-- Comments List -->
      <div class="space-y-4">
        ${filteredComments.length > 0 ? filteredComments.map(comment => `
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" id="comment-${comment.id}">
            <div class="p-5">
              <!-- Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <i class="fas fa-user text-white text-sm"></i>
                  </div>
                  <div>
                    <span class="font-semibold text-gray-800">${comment.author_name}</span>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <span>${new Date(comment.created_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</span>
                      <span>•</span>
                      <a href="/blog/${comment.post_id}" target="_blank" class="text-blue-500 hover:underline">
                        <i class="fas fa-external-link-alt mr-1"></i>${comment.post_id}
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  ${comment.status === 'pending' ? `
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <i class="fas fa-clock mr-1"></i>承認待ち
                    </span>
                  ` : comment.status === 'approved' ? `
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <i class="fas fa-check mr-1"></i>承認済み
                    </span>
                  ` : `
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <i class="fas fa-ban mr-1"></i>却下
                    </span>
                  `}
                </div>
              </div>
              
              <!-- Content -->
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <p class="text-gray-700 whitespace-pre-wrap">${comment.content}</p>
              </div>
              
              <!-- Admin Reply (if exists) -->
              ${comment.admin_reply ? `
                <div class="mb-4 pl-4 border-l-4 border-emerald-400 bg-emerald-50 rounded-r-lg p-4">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-semibold text-emerald-600">
                      <i class="fas fa-reply mr-1"></i>返信済み
                    </span>
                    ${comment.admin_reply_at ? `<span class="text-xs text-gray-400">${new Date(comment.admin_reply_at).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</span>` : ''}
                  </div>
                  <p class="text-gray-700 text-sm whitespace-pre-wrap">${comment.admin_reply}</p>
                </div>
              ` : ''}
              
              <!-- Actions -->
              <div class="flex flex-wrap gap-2">
                ${comment.status === 'pending' ? `
                  <button onclick="updateCommentStatus(${comment.id}, 'approved')" 
                          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i class="fas fa-check mr-1"></i>承認する
                  </button>
                  <button onclick="updateCommentStatus(${comment.id}, 'rejected')" 
                          class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i class="fas fa-ban mr-1"></i>却下する
                  </button>
                ` : comment.status === 'approved' ? `
                  <button onclick="updateCommentStatus(${comment.id}, 'rejected')" 
                          class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i class="fas fa-ban mr-1"></i>非公開にする
                  </button>
                ` : `
                  <button onclick="updateCommentStatus(${comment.id}, 'approved')" 
                          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i class="fas fa-check mr-1"></i>承認する
                  </button>
                `}
                <button onclick="toggleReplyForm(${comment.id})" 
                        class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors">
                  <i class="fas fa-reply mr-1"></i>${comment.admin_reply ? '返信を編集' : '返信する'}
                </button>
                <button onclick="deleteComment(${comment.id})" 
                        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                  <i class="fas fa-trash mr-1"></i>削除
                </button>
              </div>
              
              <!-- Reply Form (hidden by default) -->
              <div id="reply-form-${comment.id}" class="hidden mt-4 pt-4 border-t border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-2">管理者からの返信</label>
                <textarea 
                  id="reply-text-${comment.id}" 
                  rows="3" 
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                  placeholder="返信を入力..."
                >${comment.admin_reply || ''}</textarea>
                <div class="flex gap-2 mt-3">
                  <button onclick="submitReply(${comment.id})" 
                          class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors">
                    <i class="fas fa-paper-plane mr-1"></i>返信を保存
                  </button>
                  <button onclick="toggleReplyForm(${comment.id})" 
                          class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('') : `
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-comment-slash text-4xl text-gray-300 mb-4"></i>
            <p>コメントはありません</p>
          </div>
        `}
      </div>
    </div>

    <script>
      async function updateCommentStatus(id, status) {
        if (!confirm(status === 'approved' ? 'このコメントを承認しますか？' : 'このコメントを' + (status === 'rejected' ? '却下' : '更新') + 'しますか？')) return;
        
        try {
          const response = await fetch('/admin/api/comments/' + id + '/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
          
          const result = await response.json();
          if (result.success) {
            location.reload();
          } else {
            alert('エラー: ' + (result.error || '更新に失敗しました'));
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }

      function toggleReplyForm(id) {
        const form = document.getElementById('reply-form-' + id);
        form.classList.toggle('hidden');
      }

      async function submitReply(id) {
        const textarea = document.getElementById('reply-text-' + id);
        const reply = textarea.value.trim();
        
        try {
          const response = await fetch('/admin/api/comments/' + id + '/reply', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply })
          });
          
          const result = await response.json();
          if (result.success) {
            location.reload();
          } else {
            alert('エラー: ' + (result.error || '返信の保存に失敗しました'));
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }

      async function deleteComment(id) {
        if (!confirm('このコメントを完全に削除しますか？この操作は取り消せません。')) return;
        
        try {
          const response = await fetch('/admin/api/comments/' + id, {
            method: 'DELETE'
          });
          
          const result = await response.json();
          if (result.success) {
            document.getElementById('comment-' + id).remove();
          } else {
            alert('エラー: ' + (result.error || '削除に失敗しました'));
          }
        } catch (e) {
          alert('通信エラーが発生しました');
        }
      }
    </script>
  `

  return renderAdminLayout('コメント管理', content, 'comments')
}
