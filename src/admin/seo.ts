// SEO管理画面コンポーネント
import { renderAdminLayout } from './layout'

// HTMLエスケープ関数
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char)
}

// SEOダッシュボード
export function renderSEODashboard(pages: any[]): string {
  const content = `
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">SEO管理</h1>
          <p class="text-slate-500 mt-1">ページのSEO設定とAI最適化提案</p>
        </div>
        <button onclick="analyzeAllPages()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
          <i class="fas fa-robot mr-2"></i>全ページを分析
        </button>
      </div>

      <!-- SEOスコアサマリー -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">平均SEOスコア</p>
              <p class="text-3xl font-bold text-slate-800" id="avg-score">--</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-chart-line text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">分析済みページ</p>
              <p class="text-3xl font-bold text-slate-800" id="analyzed-count">${pages.length}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-file-alt text-green-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">警告</p>
              <p class="text-3xl font-bold text-yellow-600" id="warning-count">--</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-yellow-500 text-xl"></i>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-500">エラー</p>
              <p class="text-3xl font-bold text-red-600" id="error-count">--</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <i class="fas fa-times-circle text-red-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- ページ一覧 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="p-4 border-b border-slate-200">
          <h2 class="text-lg font-semibold text-slate-800">
            <i class="fas fa-list mr-2 text-blue-500"></i>ページ一覧
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">ページ</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">タイプ</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">SEOスコア</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">問題</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200" id="pages-table">
              ${pages.map(page => `
                <tr class="hover:bg-slate-50" data-page-id="${escapeHtml(page.id)}">
                  <td class="px-4 py-3">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-${getPageIcon(page.type)} text-slate-500"></i>
                      </div>
                      <div>
                        <div class="font-medium text-slate-800">${escapeHtml(page.title)}</div>
                        <div class="text-xs text-slate-500">${escapeHtml(page.url)}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(page.type)}">
                      ${escapeHtml(page.type)}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="seo-score" data-page-id="${escapeHtml(page.id)}">
                      <span class="text-slate-400">--</span>
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span class="issue-count" data-page-id="${escapeHtml(page.id)}">
                      <span class="text-slate-400">--</span>
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button onclick="analyzePage('${escapeHtml(page.id)}')" 
                            class="text-blue-500 hover:text-blue-700 mr-2" title="AI分析">
                      <i class="fas fa-robot"></i>
                    </button>
                    <button onclick="editSEO('${escapeHtml(page.id)}')" 
                            class="text-slate-500 hover:text-slate-700" title="編集">
                      <i class="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 分析結果モーダル -->
      <div id="analysis-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
        <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
          <div class="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-800">
              <i class="fas fa-search text-blue-500 mr-2"></i>SEO分析結果
            </h3>
            <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="p-6 overflow-y-auto max-h-[70vh]" id="modal-content">
            <div class="flex items-center justify-center py-12">
              <i class="fas fa-spinner fa-spin text-3xl text-blue-500"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
    (function() {
      // ページ分析
      window.analyzePage = async function(pageId) {
        showModal();
        document.getElementById('modal-content').innerHTML = 
          '<div class="flex items-center justify-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-blue-500 mr-3"></i><span class="text-slate-600">AIが分析中...</span></div>';
        
        try {
          const response = await fetch('/admin/api/seo/analyze/' + pageId, {
            method: 'POST'
          });
          const result = await response.json();
          
          if (result.error) {
            document.getElementById('modal-content').innerHTML = 
              '<div class="text-center py-12 text-red-500"><i class="fas fa-exclamation-circle text-3xl mb-3"></i><p>' + result.error + '</p></div>';
            return;
          }
          
          renderAnalysisResult(result, pageId);
          updatePageScore(pageId, result.score, result.issues.length);
        } catch (error) {
          document.getElementById('modal-content').innerHTML = 
            '<div class="text-center py-12 text-red-500"><i class="fas fa-exclamation-circle text-3xl mb-3"></i><p>分析に失敗しました</p></div>';
        }
      };
      
      // 分析結果を表示
      function renderAnalysisResult(result, pageId) {
        const scoreColor = result.score >= 80 ? 'text-green-500' : result.score >= 60 ? 'text-yellow-500' : 'text-red-500';
        const scoreBg = result.score >= 80 ? 'bg-green-100' : result.score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
        
        let html = '<div class="space-y-6">';
        
        // スコア
        html += '<div class="flex items-center justify-center">';
        html += '<div class="' + scoreBg + ' rounded-full w-32 h-32 flex items-center justify-center">';
        html += '<div class="text-center"><span class="text-4xl font-bold ' + scoreColor + '">' + result.score + '</span><span class="text-slate-500 block text-sm">/ 100</span></div>';
        html += '</div></div>';
        
        // 問題点
        if (result.issues && result.issues.length > 0) {
          html += '<div><h4 class="font-semibold text-slate-800 mb-3"><i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>問題点</h4>';
          html += '<div class="space-y-2">';
          result.issues.forEach(function(issue) {
            var icon = issue.type === 'error' ? 'times-circle text-red-500' : issue.type === 'warning' ? 'exclamation-triangle text-yellow-500' : 'info-circle text-blue-500';
            html += '<div class="flex items-start p-3 bg-slate-50 rounded-lg">';
            html += '<i class="fas fa-' + icon + ' mt-0.5 mr-3"></i>';
            html += '<div><span class="font-medium text-slate-700">' + escapeHtml(issue.field) + '</span><p class="text-sm text-slate-600">' + escapeHtml(issue.message) + '</p></div>';
            html += '</div>';
          });
          html += '</div></div>';
        }
        
        // 提案
        if (result.suggestions && result.suggestions.length > 0) {
          html += '<div><h4 class="font-semibold text-slate-800 mb-3"><i class="fas fa-lightbulb text-yellow-500 mr-2"></i>改善提案</h4>';
          html += '<div class="space-y-3">';
          result.suggestions.forEach(function(suggestion) {
            html += '<div class="p-4 bg-blue-50 rounded-lg border border-blue-100">';
            html += '<div class="font-medium text-blue-800 mb-2">' + escapeHtml(suggestion.field) + '</div>';
            html += '<div class="grid grid-cols-2 gap-4 text-sm">';
            html += '<div><span class="text-slate-500 block">現在:</span><span class="text-slate-700">' + escapeHtml(suggestion.current || '(未設定)') + '</span></div>';
            html += '<div><span class="text-slate-500 block">提案:</span><span class="text-green-700 font-medium">' + escapeHtml(suggestion.suggested) + '</span></div>';
            html += '</div>';
            html += '<p class="text-xs text-slate-500 mt-2"><i class="fas fa-info-circle mr-1"></i>' + escapeHtml(suggestion.reason) + '</p>';
            html += '</div>';
          });
          html += '</div></div>';
        }
        
        // 最適化メタデータ
        if (result.optimizedMeta) {
          html += '<div><h4 class="font-semibold text-slate-800 mb-3"><i class="fas fa-code text-green-500 mr-2"></i>最適化されたメタデータ</h4>';
          html += '<div class="bg-slate-900 rounded-lg p-4 text-sm">';
          html += '<pre class="text-green-400 whitespace-pre-wrap"><code>';
          html += '&lt;title&gt;' + escapeHtml(result.optimizedMeta.title) + '&lt;/title&gt;\\n';
          html += '&lt;meta name="description" content="' + escapeHtml(result.optimizedMeta.description) + '"&gt;\\n';
          if (result.optimizedMeta.keywords) {
            html += '&lt;meta name="keywords" content="' + escapeHtml(result.optimizedMeta.keywords.join(', ')) + '"&gt;';
          }
          html += '</code></pre>';
          html += '</div>';
          html += '<button onclick="applySEO(\\'' + pageId + '\\')" class="mt-3 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors">';
          html += '<i class="fas fa-check mr-2"></i>この最適化を適用</button>';
          html += '</div>';
        }
        
        html += '</div>';
        document.getElementById('modal-content').innerHTML = html;
      }
      
      // ページスコアを更新
      function updatePageScore(pageId, score, issueCount) {
        var scoreEl = document.querySelector('.seo-score[data-page-id="' + pageId + '"]');
        var issueEl = document.querySelector('.issue-count[data-page-id="' + pageId + '"]');
        
        if (scoreEl) {
          var scoreColor = score >= 80 ? 'bg-green-100 text-green-700' : score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
          scoreEl.innerHTML = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ' + scoreColor + '">' + score + '</span>';
        }
        
        if (issueEl) {
          issueEl.innerHTML = issueCount > 0 
            ? '<span class="text-yellow-600 font-medium">' + issueCount + '</span>'
            : '<span class="text-green-500"><i class="fas fa-check"></i></span>';
        }
      }
      
      // モーダル表示
      function showModal() {
        var modal = document.getElementById('analysis-modal');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      
      window.closeModal = function() {
        var modal = document.getElementById('analysis-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      };
      
      // SEO編集
      window.editSEO = function(pageId) {
        window.location.href = '/admin/seo/edit/' + pageId;
      };
      
      // 全ページ分析
      window.analyzeAllPages = async function() {
        var rows = document.querySelectorAll('#pages-table tr');
        for (var i = 0; i < rows.length; i++) {
          var pageId = rows[i].dataset.pageId;
          if (pageId) {
            await analyzePage(pageId);
            await new Promise(r => setTimeout(r, 1000)); // Rate limit
          }
        }
      };
      
      // SEO適用
      window.applySEO = async function(pageId) {
        alert('この機能は今後実装予定です。現在はメタデータをコピーして手動で適用してください。');
      };
      
      // HTMLエスケープ
      function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    })();
    </script>
  `
  
  return renderAdminLayout('SEO管理', content, 'seo')
}

// SEO編集フォーム
export function renderSEOEditForm(page: any, seoData: any): string {
  const content = `
    <div class="p-6">
      <div class="mb-6">
        <a href="/admin/seo" class="text-blue-500 hover:text-blue-700">
          <i class="fas fa-arrow-left mr-2"></i>SEO管理に戻る
        </a>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 max-w-4xl">
        <div class="p-4 border-b border-slate-200">
          <h1 class="text-xl font-semibold text-slate-800">
            <i class="fas fa-edit text-blue-500 mr-2"></i>SEO設定: ${escapeHtml(page.title)}
          </h1>
          <p class="text-sm text-slate-500 mt-1">${escapeHtml(page.url)}</p>
        </div>
        
        <form action="/admin/seo/update/${escapeHtml(page.id)}" method="POST" class="p-6 space-y-6">
          <!-- タイトル -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              ページタイトル
              <span class="text-slate-400 font-normal">(推奨: 30-60文字)</span>
            </label>
            <input type="text" name="title" value="${escapeHtml(seoData.title || '')}"
                   class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                   maxlength="70">
            <div class="text-xs text-slate-500 mt-1">
              現在: <span id="title-count">${(seoData.title || '').length}</span>文字
            </div>
          </div>
          
          <!-- メタディスクリプション -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              メタディスクリプション
              <span class="text-slate-400 font-normal">(推奨: 80-160文字)</span>
            </label>
            <textarea name="description" rows="3"
                      class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxlength="200">${escapeHtml(seoData.description || '')}</textarea>
            <div class="text-xs text-slate-500 mt-1">
              現在: <span id="desc-count">${(seoData.description || '').length}</span>文字
            </div>
          </div>
          
          <!-- キーワード -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              キーワード
              <span class="text-slate-400 font-normal">(カンマ区切り)</span>
            </label>
            <input type="text" name="keywords" value="${escapeHtml((seoData.keywords || []).join(', '))}"
                   class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          
          <!-- OGP設定 -->
          <div class="border-t border-slate-200 pt-6">
            <h3 class="text-lg font-medium text-slate-800 mb-4">
              <i class="fas fa-share-alt text-blue-500 mr-2"></i>OGP設定（SNSシェア用）
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">OGタイトル</label>
                <input type="text" name="ogTitle" value="${escapeHtml(seoData.ogTitle || '')}"
                       class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">OG説明文</label>
                <textarea name="ogDescription" rows="2"
                          class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${escapeHtml(seoData.ogDescription || '')}</textarea>
              </div>
            </div>
          </div>
          
          <!-- 送信ボタン -->
          <div class="flex gap-3 pt-4">
            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
              <i class="fas fa-save mr-2"></i>保存
            </button>
            <button type="button" onclick="window.analyzePage && analyzePage('${escapeHtml(page.id)}')" 
                    class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg transition-colors">
              <i class="fas fa-robot mr-2"></i>AI分析
            </button>
            <a href="/admin/seo" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg transition-colors">
              キャンセル
            </a>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      document.querySelector('input[name="title"]').addEventListener('input', function() {
        document.getElementById('title-count').textContent = this.value.length;
      });
      document.querySelector('textarea[name="description"]').addEventListener('input', function() {
        document.getElementById('desc-count').textContent = this.value.length;
      });
    </script>
  `
  
  return renderAdminLayout('SEO編集', content, 'seo')
}

// ヘルパー関数
function getPageIcon(type: string): string {
  switch (type) {
    case 'home': return 'home'
    case 'course': return 'book'
    case 'blog': return 'newspaper'
    case 'contact': return 'envelope'
    default: return 'file'
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'home': return 'bg-blue-100 text-blue-700'
    case 'course': return 'bg-green-100 text-green-700'
    case 'blog': return 'bg-purple-100 text-purple-700'
    case 'contact': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}
