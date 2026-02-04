// コースバンドル（セット販売）管理画面
import { renderAdminLayout } from './layout'

interface CourseBundle {
  id: string
  name: string
  description: string | null
  bundle_price: number
  discount_type: string
  discount_value: number | null
  min_series_count: number
  is_auto_bundle: number
  valid_from: string | null
  valid_until: string | null
  stripe_product_id: string | null
  stripe_price_id: string | null
  image: string | null
  is_featured: number
  display_order: number
  is_active: number
  created_at: string
  // 計算フィールド
  original_price?: number
  discount_amount?: number
  series_count?: number
  series_titles?: string[]
}

interface CourseSeries {
  id: string
  title: string
  total_sessions: number
  calc_course_price_incl: number
  status: string
}

interface DiscountRule {
  id: number
  name: string
  min_series_count: number
  max_series_count: number | null
  discount_type: string
  discount_value: number
  is_active: number
  priority: number
}

// バンドル一覧ページ
export function renderBundlesList(
  bundles: CourseBundle[],
  series: CourseSeries[],
  rules: DiscountRule[]
): string {
  const content = `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">
        <i class="fas fa-box-open mr-2 text-orange-600"></i>
        コースセット管理
      </h1>
      <button onclick="openCreateModal()" class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
        <i class="fas fa-plus mr-2"></i>新規セット作成
      </button>
    </div>
    
    <!-- 説明 -->
    <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
      <h3 class="font-bold text-orange-800 mb-2">
        <i class="fas fa-info-circle mr-2"></i>コースセット機能について
      </h3>
      <p class="text-sm text-orange-700">
        複数のコースシリーズを組み合わせて、セット割引価格で販売できます。<br>
        例：基礎コース（4回）+ キャリコン特化コース（4回）= 8回セット ¥39,600（25%OFF）
      </p>
    </div>
    
    <!-- 自動割引ルール -->
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <h2 class="font-bold text-gray-800 mb-3">
        <i class="fas fa-magic text-purple-500 mr-2"></i>自動割引ルール
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-2 text-left">ルール名</th>
              <th class="px-3 py-2 text-center">コース数</th>
              <th class="px-3 py-2 text-center">割引</th>
              <th class="px-3 py-2 text-center">優先度</th>
              <th class="px-3 py-2 text-center">状態</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${rules.map(r => `
              <tr>
                <td class="px-3 py-2">${r.name}</td>
                <td class="px-3 py-2 text-center">
                  ${r.min_series_count}${r.max_series_count ? `〜${r.max_series_count}` : '以上'}
                </td>
                <td class="px-3 py-2 text-center font-bold text-green-600">
                  ${r.discount_type === 'percentage' ? `${Math.round(r.discount_value * 100)}%OFF` : `¥${r.discount_value.toLocaleString()}引き`}
                </td>
                <td class="px-3 py-2 text-center">${r.priority}</td>
                <td class="px-3 py-2 text-center">
                  ${r.is_active ? '<span class="text-green-600">有効</span>' : '<span class="text-gray-400">無効</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <p class="text-xs text-gray-500 mt-2">
        ※ 自動割引は、お客様がコース選択時に条件を満たすと自動適用されます
      </p>
    </div>
    
    <!-- 固定セット一覧 -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="px-4 py-3 border-b bg-gray-50">
        <h2 class="font-bold text-gray-800">
          <i class="fas fa-tags text-orange-500 mr-2"></i>固定セット商品
        </h2>
      </div>
      
      ${bundles.length === 0 ? `
        <div class="p-8 text-center text-gray-500">
          <i class="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
          <p>セット商品がまだありません</p>
          <p class="text-sm">「新規セット作成」ボタンから作成してください</p>
        </div>
      ` : `
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">セット名</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">含まれるコース</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">定価</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">セット価格</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">割引</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状態</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            ${bundles.map(b => `
              <tr class="hover:bg-gray-50 ${!b.is_active ? 'opacity-50' : ''}">
                <td class="px-4 py-3">
                  <div class="font-medium text-gray-900">${b.name}</div>
                  ${b.description ? `<div class="text-xs text-gray-500 mt-1">${b.description.substring(0, 50)}...</div>` : ''}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                    ${b.series_count || 0}コース
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-gray-500 line-through">
                  ¥${(b.original_price || 0).toLocaleString()}
                </td>
                <td class="px-4 py-3 text-right font-bold text-orange-600">
                  ¥${b.bundle_price.toLocaleString()}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">
                    ${b.original_price ? Math.round((1 - b.bundle_price / b.original_price) * 100) : 0}%OFF
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  ${b.is_active ? 
                    '<span class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">公開中</span>' :
                    '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">非公開</span>'
                  }
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex justify-center gap-2">
                    <button onclick="editBundle('${b.id}')" class="text-blue-600 hover:text-blue-800" title="編集">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleBundle('${b.id}', ${b.is_active})" class="text-yellow-600 hover:text-yellow-800" title="${b.is_active ? '非公開' : '公開'}">
                      <i class="fas fa-${b.is_active ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button onclick="deleteBundle('${b.id}')" class="text-red-600 hover:text-red-800" title="削除">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    </div>
    
    <!-- 作成/編集モーダル -->
    <div id="bundle-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
          <h3 class="text-lg font-bold" id="modal-title">
            <i class="fas fa-box-open text-orange-600 mr-2"></i>
            新規セット作成
          </h3>
        </div>
        
        <form id="bundle-form" class="p-6 space-y-4">
          <input type="hidden" name="id" id="bundle-id">
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">セット名 <span class="text-red-500">*</span></label>
            <input type="text" name="name" id="bundle-name" required
              placeholder="例: 基礎+キャリコン8回セット"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea name="description" id="bundle-description" rows="2"
              placeholder="セットの説明（任意）"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"></textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">含めるコースシリーズ <span class="text-red-500">*</span></label>
            <div class="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50" id="series-checkboxes">
              ${series.filter(s => s.status === 'published').map(s => `
                <label class="flex items-center gap-3 p-2 bg-white rounded border hover:border-orange-300 cursor-pointer">
                  <input type="checkbox" name="series_ids" value="${s.id}" 
                    class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    data-price="${s.calc_course_price_incl}" data-sessions="${s.total_sessions}"
                    onchange="updatePricePreview()">
                  <div class="flex-1">
                    <div class="font-medium text-sm">${s.title}</div>
                    <div class="text-xs text-gray-500">全${s.total_sessions}回 / ¥${s.calc_course_price_incl.toLocaleString()}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
          
          <!-- 価格プレビュー -->
          <div class="bg-orange-50 rounded-lg p-4" id="price-preview">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">選択コース定価合計:</span>
              <span class="font-medium" id="original-price-display">¥0</span>
            </div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">自動割引適用後:</span>
              <span class="font-medium text-green-600" id="auto-discount-display">¥0</span>
            </div>
            <hr class="my-2 border-orange-200">
            <div class="flex justify-between items-center">
              <span class="font-bold text-gray-800">セット販売価格:</span>
              <div class="flex items-center gap-2">
                <span class="text-gray-400">¥</span>
                <input type="number" name="bundle_price" id="bundle-price" required min="0" step="100"
                  class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-right font-bold text-lg"
                  onchange="updateDiscountDisplay()">
              </div>
            </div>
            <div class="text-right mt-1">
              <span class="text-sm text-green-600 font-bold" id="discount-percent-display"></span>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">有効開始日</label>
              <input type="date" name="valid_from" id="bundle-valid-from"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">有効終了日</label>
              <input type="date" name="valid_until" id="bundle-valid-until"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_featured" id="bundle-featured"
                class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500">
              <span class="text-sm">おすすめ表示</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" id="bundle-active" checked
                class="w-5 h-5 text-orange-500 rounded focus:ring-orange-500">
              <span class="text-sm">公開する</span>
            </label>
          </div>
          
          <div class="flex gap-2 justify-end pt-4 border-t">
            <button type="button" onclick="closeModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              キャンセル
            </button>
            <button type="submit" class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      // 割引ルールをJSに渡す
      const discountRules = ${JSON.stringify(rules)};
      
      function openCreateModal() {
        document.getElementById('modal-title').innerHTML = '<i class="fas fa-box-open text-orange-600 mr-2"></i>新規セット作成';
        document.getElementById('bundle-form').reset();
        document.getElementById('bundle-id').value = '';
        document.querySelectorAll('input[name="series_ids"]').forEach(cb => cb.checked = false);
        updatePricePreview();
        document.getElementById('bundle-modal').classList.remove('hidden');
      }
      
      function closeModal() {
        document.getElementById('bundle-modal').classList.add('hidden');
      }
      
      function updatePricePreview() {
        const checkboxes = document.querySelectorAll('input[name="series_ids"]:checked');
        let totalPrice = 0;
        let seriesCount = 0;
        
        checkboxes.forEach(cb => {
          totalPrice += parseInt(cb.dataset.price) || 0;
          seriesCount++;
        });
        
        document.getElementById('original-price-display').textContent = '¥' + totalPrice.toLocaleString();
        
        // 自動割引を計算
        let discountedPrice = totalPrice;
        let appliedRule = null;
        
        for (const rule of discountRules.filter(r => r.is_active)) {
          if (seriesCount >= rule.min_series_count && 
              (!rule.max_series_count || seriesCount <= rule.max_series_count)) {
            if (!appliedRule || rule.priority > appliedRule.priority) {
              appliedRule = rule;
            }
          }
        }
        
        if (appliedRule) {
          if (appliedRule.discount_type === 'percentage') {
            discountedPrice = Math.round(totalPrice * (1 - appliedRule.discount_value));
          } else {
            discountedPrice = totalPrice - appliedRule.discount_value * seriesCount;
          }
          document.getElementById('auto-discount-display').textContent = 
            '¥' + discountedPrice.toLocaleString() + ' (' + appliedRule.name + ')';
        } else {
          document.getElementById('auto-discount-display').textContent = '¥' + totalPrice.toLocaleString() + ' (割引なし)';
        }
        
        // 提案価格をセット
        if (!document.getElementById('bundle-price').value || document.getElementById('bundle-price').value === '0') {
          document.getElementById('bundle-price').value = discountedPrice;
        }
        
        updateDiscountDisplay();
      }
      
      function updateDiscountDisplay() {
        const originalPrice = parseInt(document.getElementById('original-price-display').textContent.replace(/[¥,]/g, '')) || 0;
        const bundlePrice = parseInt(document.getElementById('bundle-price').value) || 0;
        
        if (originalPrice > 0 && bundlePrice > 0) {
          const discountPercent = Math.round((1 - bundlePrice / originalPrice) * 100);
          document.getElementById('discount-percent-display').textContent = discountPercent + '%OFF';
        } else {
          document.getElementById('discount-percent-display').textContent = '';
        }
      }
      
      async function editBundle(id) {
        try {
          const res = await fetch('/admin/api/bundles/' + id);
          const data = await res.json();
          
          if (data.error) {
            alert('エラー: ' + data.error);
            return;
          }
          
          document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit text-orange-600 mr-2"></i>セット編集';
          document.getElementById('bundle-id').value = data.bundle.id;
          document.getElementById('bundle-name').value = data.bundle.name;
          document.getElementById('bundle-description').value = data.bundle.description || '';
          document.getElementById('bundle-price').value = data.bundle.bundle_price;
          document.getElementById('bundle-valid-from').value = data.bundle.valid_from ? data.bundle.valid_from.split('T')[0] : '';
          document.getElementById('bundle-valid-until').value = data.bundle.valid_until ? data.bundle.valid_until.split('T')[0] : '';
          document.getElementById('bundle-featured').checked = data.bundle.is_featured === 1;
          document.getElementById('bundle-active').checked = data.bundle.is_active === 1;
          
          // シリーズのチェックボックスを設定
          document.querySelectorAll('input[name="series_ids"]').forEach(cb => {
            cb.checked = data.series_ids.includes(cb.value);
          });
          
          updatePricePreview();
          document.getElementById('bundle-modal').classList.remove('hidden');
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      }
      
      async function toggleBundle(id, currentActive) {
        if (!confirm(currentActive ? 'このセットを非公開にしますか？' : 'このセットを公開しますか？')) return;
        
        try {
          const res = await fetch('/admin/api/bundles/' + id + '/toggle', { method: 'POST' });
          const result = await res.json();
          if (result.success) {
            location.reload();
          } else {
            alert('エラー: ' + result.error);
          }
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      }
      
      async function deleteBundle(id) {
        if (!confirm('このセットを削除しますか？この操作は取り消せません。')) return;
        
        try {
          const res = await fetch('/admin/api/bundles/' + id, { method: 'DELETE' });
          const result = await res.json();
          if (result.success) {
            location.reload();
          } else {
            alert('エラー: ' + result.error);
          }
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      }
      
      document.getElementById('bundle-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const seriesIds = Array.from(document.querySelectorAll('input[name="series_ids"]:checked')).map(cb => cb.value);
        
        if (seriesIds.length < 2) {
          alert('2つ以上のコースを選択してください');
          return;
        }
        
        const data = {
          id: formData.get('id') || null,
          name: formData.get('name'),
          description: formData.get('description') || null,
          bundle_price: parseInt(formData.get('bundle_price')),
          series_ids: seriesIds,
          valid_from: formData.get('valid_from') || null,
          valid_until: formData.get('valid_until') || null,
          is_featured: formData.get('is_featured') ? 1 : 0,
          is_active: formData.get('is_active') ? 1 : 0
        };
        
        try {
          const res = await fetch('/admin/api/bundles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await res.json();
          if (result.success) {
            alert(data.id ? 'セットを更新しました' : 'セットを作成しました');
            location.reload();
          } else {
            alert('エラー: ' + result.error);
          }
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      });
      
      // ESCキーでモーダルを閉じる
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
      });
    </script>
  `

  return renderAdminLayout('コースセット管理', content, 'bundles')
}
