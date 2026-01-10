// 料金パターン管理画面
import { renderAdminLayout } from './layout'

interface PricingPattern {
  id: string
  name: string
  description: string
  course_discount_rate: number
  early_bird_discount_rate: number
  early_bird_days: number
  has_monthly_option: number
  tax_rate: number
  is_default: number
  sort_order: number
  created_at: string
  updated_at: string
}

// 料金パターン一覧
export const renderPricingPatternsList = (patterns: PricingPattern[]) => {
  const content = `
    <div class="space-y-6">
      <!-- ヘッダー -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">
            <i class="fas fa-tags mr-2 text-blue-500"></i>料金パターン管理
          </h1>
          <p class="text-gray-600 mt-1">講座・コースに適用する割引パターンを管理します</p>
        </div>
        <a href="/admin/pricing-patterns/new" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
          <i class="fas fa-plus"></i>
          新規作成
        </a>
      </div>

      <!-- 説明カード -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <i class="fas fa-info-circle text-blue-500 mt-1"></i>
          <div>
            <h3 class="font-semibold text-blue-800">料金パターンとは？</h3>
            <p class="text-blue-700 text-sm mt-1">
              コース（複数回講座）に適用する割引率のテンプレートです。<br>
              単発価格を基準に、コース一括・早期申込・月額払いの価格を自動計算します。
            </p>
          </div>
        </div>
      </div>

      <!-- パターン一覧 -->
      <div class="grid gap-4">
        ${patterns.length === 0 ? `
          <div class="bg-white rounded-xl shadow-sm border p-8 text-center">
            <i class="fas fa-tags text-4xl text-gray-300 mb-4"></i>
            <p class="text-gray-500">料金パターンがありません</p>
            <a href="/admin/pricing-patterns/new" class="text-blue-500 hover:underline mt-2 inline-block">
              新しいパターンを作成
            </a>
          </div>
        ` : patterns.map(p => `
          <div class="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-bold text-gray-800">${escapeHtml(p.name)}</h3>
                  ${p.is_default ? '<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">デフォルト</span>' : ''}
                </div>
                <p class="text-gray-600 text-sm mt-1">${escapeHtml(p.description || '')}</p>
                
                <!-- 割引率表示 -->
                <div class="flex flex-wrap gap-4 mt-4">
                  <div class="flex items-center gap-2">
                    <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                      <i class="fas fa-percentage mr-1"></i>コース一括
                    </span>
                    <span class="font-bold text-purple-700">${Math.round(p.course_discount_rate * 100)}% OFF</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">
                      <i class="fas fa-clock mr-1"></i>早期申込
                    </span>
                    <span class="font-bold text-orange-700">${Math.round(p.early_bird_discount_rate * 100)}% OFF</span>
                    <span class="text-gray-500 text-sm">(${p.early_bird_days}日前まで)</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                      <i class="fas fa-credit-card mr-1"></i>月額払い
                    </span>
                    <span class="font-bold text-blue-700">${p.has_monthly_option ? '対応' : '非対応'}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      <i class="fas fa-receipt mr-1"></i>消費税
                    </span>
                    <span class="font-bold text-gray-700">${Math.round(p.tax_rate * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <!-- アクションボタン -->
              <div class="flex gap-2">
                <a href="/admin/pricing-patterns/${p.id}/edit" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition">
                  <i class="fas fa-edit"></i>
                </a>
                <button onclick="deletePattern('${p.id}')" class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- 計算例カード -->
      <div class="bg-white rounded-xl shadow-sm border p-6">
        <h3 class="font-bold text-gray-800 mb-4">
          <i class="fas fa-calculator mr-2 text-green-500"></i>計算例（単発¥8,000 × 6回の場合）
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50">
                <th class="text-left py-2 px-4">支払い方法</th>
                <th class="text-right py-2 px-4">計算式</th>
                <th class="text-right py-2 px-4">税抜</th>
                <th class="text-right py-2 px-4">税込(10%)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t">
                <td class="py-2 px-4">単発（1回）</td>
                <td class="text-right py-2 px-4 text-gray-500">¥8,000</td>
                <td class="text-right py-2 px-4">¥8,000</td>
                <td class="text-right py-2 px-4 font-bold">¥8,800</td>
              </tr>
              <tr class="border-t bg-gray-50">
                <td class="py-2 px-4">単発 × 6回（定価）</td>
                <td class="text-right py-2 px-4 text-gray-500">¥8,000 × 6</td>
                <td class="text-right py-2 px-4">¥48,000</td>
                <td class="text-right py-2 px-4 font-bold">¥52,800</td>
              </tr>
              <tr class="border-t">
                <td class="py-2 px-4 text-purple-700"><i class="fas fa-check-circle mr-1"></i>コース一括（10% OFF）</td>
                <td class="text-right py-2 px-4 text-gray-500">¥48,000 × 0.90</td>
                <td class="text-right py-2 px-4">¥43,200</td>
                <td class="text-right py-2 px-4 font-bold text-purple-700">¥47,520</td>
              </tr>
              <tr class="border-t">
                <td class="py-2 px-4 text-orange-700"><i class="fas fa-star mr-1"></i>早期申込（17% OFF）</td>
                <td class="text-right py-2 px-4 text-gray-500">¥48,000 × 0.83</td>
                <td class="text-right py-2 px-4">¥39,840</td>
                <td class="text-right py-2 px-4 font-bold text-orange-700">¥43,824</td>
              </tr>
              <tr class="border-t">
                <td class="py-2 px-4 text-blue-700"><i class="fas fa-credit-card mr-1"></i>月額払い（一括÷6）</td>
                <td class="text-right py-2 px-4 text-gray-500">¥43,200 ÷ 6</td>
                <td class="text-right py-2 px-4">¥7,200/回</td>
                <td class="text-right py-2 px-4 font-bold text-blue-700">¥7,920 × 6回</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <script>
      async function deletePattern(id) {
        if (!confirm('この料金パターンを削除しますか？\\n※このパターンを使用しているコースがある場合、削除できません。')) return;
        
        try {
          const res = await fetch('/admin/api/pricing-patterns/' + id, {
            method: 'DELETE'
          });
          const data = await res.json();
          
          if (data.success) {
            location.reload();
          } else {
            alert(data.error || '削除に失敗しました');
          }
        } catch (e) {
          alert('エラーが発生しました');
        }
      }
    </script>
  `
  
  return renderAdminLayout('料金パターン管理', content, 'pricing-patterns')
}

// 料金パターン作成/編集フォーム
export const renderPricingPatternForm = (pattern?: PricingPattern) => {
  const isEdit = !!pattern
  
  const content = `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- ヘッダー -->
      <div class="flex items-center gap-4">
        <a href="/admin/pricing-patterns" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h1 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-tags mr-2 text-blue-500"></i>
          ${isEdit ? '料金パターン編集' : '料金パターン作成'}
        </h1>
      </div>

      <!-- フォーム -->
      <form id="patternForm" class="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <!-- 基本情報 -->
        <div class="space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-info-circle mr-2 text-blue-500"></i>基本情報
          </h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">パターン名 <span class="text-red-500">*</span></label>
            <input type="text" name="name" value="${escapeHtml(pattern?.name || '')}" required
              class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 標準コース">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea name="description" rows="2"
              class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例: 一般的な講座向けの料金パターン">${escapeHtml(pattern?.description || '')}</textarea>
          </div>
        </div>

        <!-- 割引設定 -->
        <div class="space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-percentage mr-2 text-purple-500"></i>割引設定
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                コース一括割引率 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input type="number" name="course_discount_rate" value="${pattern?.course_discount_rate ? Math.round(pattern.course_discount_rate * 100) : 10}" required
                  min="0" max="50" step="1"
                  class="w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">単発×回数の合計からの割引率</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                早期申込割引率 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input type="number" name="early_bird_discount_rate" value="${pattern?.early_bird_discount_rate ? Math.round(pattern.early_bird_discount_rate * 100) : 17}" required
                  min="0" max="50" step="1"
                  class="w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">早期申込時の割引率</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              早期申込締切 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input type="number" name="early_bird_days" value="${pattern?.early_bird_days || 14}" required
                min="1" max="90" step="1"
                class="w-full border rounded-lg px-4 py-2 pr-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">日前まで</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">コース開始日の何日前まで早期割引を適用するか</p>
          </div>
        </div>

        <!-- 月額払い設定 -->
        <div class="space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-credit-card mr-2 text-blue-500"></i>月額払い設定
          </h3>
          
          <div class="flex items-center gap-3">
            <input type="checkbox" name="has_monthly_option" id="has_monthly_option" 
              ${pattern?.has_monthly_option !== 0 ? 'checked' : ''}
              class="w-5 h-5 text-blue-500 rounded focus:ring-blue-500">
            <label for="has_monthly_option" class="text-gray-700">月額払いを有効にする</label>
          </div>
          <p class="text-sm text-gray-500 ml-8">
            有効にすると、コース一括価格を回数で割った金額で月額払いが可能になります。<br>
            （例: ¥43,200 ÷ 6回 = ¥7,200/月）
          </p>
        </div>

        <!-- 税率設定 -->
        <div class="space-y-4">
          <h3 class="font-bold text-gray-800 border-b pb-2">
            <i class="fas fa-receipt mr-2 text-green-500"></i>税率設定
          </h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">消費税率 <span class="text-red-500">*</span></label>
            <div class="relative">
              <input type="number" name="tax_rate" value="${pattern?.tax_rate ? Math.round(pattern.tax_rate * 100) : 10}" required
                min="0" max="20" step="1"
                class="w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>
        </div>

        <!-- デフォルト設定 -->
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input type="checkbox" name="is_default" id="is_default" 
            ${pattern?.is_default ? 'checked' : ''}
            class="w-5 h-5 text-blue-500 rounded focus:ring-blue-500">
          <label for="is_default" class="text-gray-700">デフォルトパターンに設定</label>
        </div>

        <!-- 計算プレビュー -->
        <div id="calcPreview" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-bold text-gray-700 mb-3">
            <i class="fas fa-calculator mr-2"></i>計算プレビュー（単発¥8,000 × 6回の場合）
          </h4>
          <div id="previewContent"></div>
        </div>

        <!-- ボタン -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <a href="/admin/pricing-patterns" class="px-6 py-2 border rounded-lg hover:bg-gray-50 transition">
            キャンセル
          </a>
          <button type="submit" class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            <i class="fas fa-save mr-2"></i>${isEdit ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>

    <script>
      const form = document.getElementById('patternForm');
      const previewContent = document.getElementById('previewContent');
      
      // 計算プレビュー更新
      function updatePreview() {
        const singlePrice = 8000;
        const sessions = 6;
        const courseDiscount = parseFloat(form.course_discount_rate.value) / 100;
        const earlyDiscount = parseFloat(form.early_bird_discount_rate.value) / 100;
        const taxRate = parseFloat(form.tax_rate.value) / 100;
        const hasMonthly = form.has_monthly_option.checked;
        
        const singleTotal = singlePrice * sessions;
        const coursePrice = Math.round(singleTotal * (1 - courseDiscount));
        const earlyPrice = Math.round(singleTotal * (1 - earlyDiscount));
        const monthlyPrice = hasMonthly ? Math.round(coursePrice / sessions) : null;
        
        const format = (n) => '¥' + n.toLocaleString();
        const formatTax = (n) => '¥' + Math.round(n * (1 + taxRate)).toLocaleString();
        
        previewContent.innerHTML = \`
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-gray-600">単発 × 6回（定価）:</div>
            <div class="text-right font-bold">\${formatTax(singleTotal)}</div>
            
            <div class="text-purple-700">コース一括（\${Math.round(courseDiscount * 100)}% OFF）:</div>
            <div class="text-right font-bold text-purple-700">\${formatTax(coursePrice)}</div>
            
            <div class="text-orange-700">早期申込（\${Math.round(earlyDiscount * 100)}% OFF）:</div>
            <div class="text-right font-bold text-orange-700">\${formatTax(earlyPrice)}</div>
            
            \${hasMonthly ? \`
              <div class="text-blue-700">月額払い:</div>
              <div class="text-right font-bold text-blue-700">\${formatTax(monthlyPrice)} × 6回</div>
            \` : ''}
          </div>
          <div class="mt-2 text-xs text-gray-500">
            ※税込価格（消費税\${Math.round(taxRate * 100)}%）
          </div>
        \`;
      }
      
      // イベントリスナー
      ['course_discount_rate', 'early_bird_discount_rate', 'tax_rate'].forEach(name => {
        form[name].addEventListener('input', updatePreview);
      });
      form.has_monthly_option.addEventListener('change', updatePreview);
      
      // 初期表示
      updatePreview();
      
      // フォーム送信
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
          name: form.name.value,
          description: form.description.value,
          course_discount_rate: parseFloat(form.course_discount_rate.value) / 100,
          early_bird_discount_rate: parseFloat(form.early_bird_discount_rate.value) / 100,
          early_bird_days: parseInt(form.early_bird_days.value),
          has_monthly_option: form.has_monthly_option.checked ? 1 : 0,
          tax_rate: parseFloat(form.tax_rate.value) / 100,
          is_default: form.is_default.checked ? 1 : 0
        };
        
        try {
          const res = await fetch('/admin/api/pricing-patterns${isEdit ? `/${pattern.id}` : ''}', {
            method: '${isEdit ? 'PUT' : 'POST'}',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await res.json();
          
          if (result.success) {
            location.href = '/admin/pricing-patterns';
          } else {
            alert(result.error || '保存に失敗しました');
          }
        } catch (e) {
          alert('エラーが発生しました');
        }
      });
    </script>
  `
  
  return renderAdminLayout(isEdit ? '料金パターン編集' : '料金パターン作成', content, 'pricing-patterns')
}

// HTML エスケープ
function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
