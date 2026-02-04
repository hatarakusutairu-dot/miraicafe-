// 会員管理画面
import { renderAdminLayout } from './layout'

interface Member {
  id: number
  email: string
  name: string | null
  phone: string | null
  referral_code: string
  referred_by: string | null
  total_points: number
  current_points: number
  total_bookings: number
  membership_tier: string
  created_at: string
}

interface MembershipTier {
  tier_name: string
  min_bookings: number
  points_multiplier: number
  discount_rate: number
  description: string
}

interface RewardSettings {
  [key: string]: string
}

// 会員ランクのバッジ色
function getTierBadge(tier: string): string {
  const badges: Record<string, string> = {
    standard: 'bg-gray-100 text-gray-700',
    silver: 'bg-slate-200 text-slate-700',
    gold: 'bg-yellow-100 text-yellow-700',
    platinum: 'bg-purple-100 text-purple-700'
  }
  const labels: Record<string, string> = {
    standard: '一般',
    silver: 'シルバー',
    gold: 'ゴールド',
    platinum: 'プラチナ'
  }
  return `<span class="px-2 py-1 text-xs font-medium rounded-full ${badges[tier] || badges.standard}">${labels[tier] || tier}</span>`
}

// 会員一覧ページ
export function renderMembersList(
  members: Member[], 
  total: number, 
  page: number, 
  totalPages: number,
  tiers: MembershipTier[],
  settings: RewardSettings
): string {
  const content = `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">
        <i class="fas fa-users mr-2 text-green-600"></i>
        会員管理
      </h1>
      <div class="flex gap-2">
        <a href="/admin/members/coupons" class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
          <i class="fas fa-ticket-alt mr-2"></i>クーポン管理
        </a>
        <a href="/admin/members/settings" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">
          <i class="fas fa-cog mr-2"></i>特典設定
        </a>
      </div>
    </div>
    
    <!-- 統計カード -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">総会員数</p>
            <p class="text-2xl font-bold text-gray-800">${total}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <i class="fas fa-users text-green-600"></i>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">シルバー以上</p>
            <p class="text-2xl font-bold text-gray-800">${members.filter(m => m.membership_tier !== 'standard').length}</p>
          </div>
          <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <i class="fas fa-medal text-slate-600"></i>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">基本ポイント/予約</p>
            <p class="text-2xl font-bold text-gray-800">${settings.points_per_booking || '100'}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <i class="fas fa-coins text-yellow-600"></i>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">紹介ボーナス</p>
            <p class="text-2xl font-bold text-gray-800">${settings.referral_bonus_referrer || '500'}pt</p>
          </div>
          <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
            <i class="fas fa-gift text-pink-600"></i>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 検索・フィルター -->
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <form id="search-form" class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-64">
          <input type="text" name="search" placeholder="メールアドレスまたは名前で検索..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
        </div>
        <select name="tier" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          <option value="">全ランク</option>
          ${tiers.map(t => `<option value="${t.tier_name}">${t.description}</option>`).join('')}
        </select>
        <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
          <i class="fas fa-search mr-2"></i>検索
        </button>
      </form>
    </div>
    
    <!-- 会員一覧テーブル -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">会員</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">ランク</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">ポイント</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">予約回数</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">紹介コード</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">登録日</th>
            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${members.length === 0 ? `
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                会員がまだいません
              </td>
            </tr>
          ` : members.map(m => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3">
                <div>
                  <div class="font-medium text-gray-900">${m.name || '未設定'}</div>
                  <div class="text-sm text-gray-500">${m.email}</div>
                </div>
              </td>
              <td class="px-4 py-3">${getTierBadge(m.membership_tier)}</td>
              <td class="px-4 py-3 text-right">
                <span class="font-medium text-green-600">${m.current_points.toLocaleString()}</span>
                <span class="text-gray-400 text-sm">pt</span>
              </td>
              <td class="px-4 py-3 text-right font-medium">${m.total_bookings}回</td>
              <td class="px-4 py-3">
                <code class="bg-gray-100 px-2 py-1 rounded text-sm">${m.referral_code}</code>
                ${m.referred_by ? `<span class="text-xs text-gray-400 ml-1">(紹介)</span>` : ''}
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                ${new Date(m.created_at).toLocaleDateString('ja-JP')}
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex justify-center gap-2">
                  <button onclick="openMemberDetail(${m.id})" class="text-blue-600 hover:text-blue-800" title="詳細">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button onclick="openAddPoints(${m.id}, '${m.name || m.email}')" class="text-green-600 hover:text-green-800" title="ポイント付与">
                    <i class="fas fa-plus-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- ページネーション -->
      ${totalPages > 1 ? `
        <div class="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span class="text-sm text-gray-600">全${total}件中 ${(page-1)*20+1}〜${Math.min(page*20, total)}件</span>
          <div class="flex gap-2">
            ${page > 1 ? `<a href="?page=${page-1}" class="px-3 py-1 bg-white border rounded hover:bg-gray-50">前へ</a>` : ''}
            ${page < totalPages ? `<a href="?page=${page+1}" class="px-3 py-1 bg-white border rounded hover:bg-gray-50">次へ</a>` : ''}
          </div>
        </div>
      ` : ''}
    </div>
    
    <!-- ポイント付与モーダル -->
    <div id="add-points-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4">
          <i class="fas fa-plus-circle text-green-600 mr-2"></i>
          ポイント付与
        </h3>
        <form id="add-points-form">
          <input type="hidden" name="member_id" id="points-member-id">
          <p class="mb-4 text-gray-600">
            <span id="points-member-name" class="font-medium"></span>さんにポイントを付与します
          </p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">付与ポイント数</label>
            <input type="number" name="points" min="1" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">理由（任意）</label>
            <input type="text" name="description" placeholder="例: キャンペーン特典"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" onclick="closeAddPoints()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              キャンセル
            </button>
            <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              付与する
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      // 検索フォーム
      document.getElementById('search-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          if (value) params.set(key, value);
        }
        window.location.href = '/admin/members?' + params.toString();
      });
      
      // ポイント付与モーダル
      function openAddPoints(id, name) {
        document.getElementById('points-member-id').value = id;
        document.getElementById('points-member-name').textContent = name;
        document.getElementById('add-points-modal').classList.remove('hidden');
      }
      
      function closeAddPoints() {
        document.getElementById('add-points-modal').classList.add('hidden');
      }
      
      document.getElementById('add-points-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const memberId = formData.get('member_id');
        
        try {
          const res = await fetch('/admin/api/members/' + memberId + '/add-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              points: parseInt(formData.get('points')),
              description: formData.get('description')
            })
          });
          
          const result = await res.json();
          if (result.success) {
            alert('ポイントを付与しました');
            location.reload();
          } else {
            alert('エラー: ' + result.error);
          }
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      });
      
      // 会員詳細（別ページへ遷移）
      function openMemberDetail(id) {
        window.location.href = '/admin/members/' + id;
      }
    </script>
  `

  return renderAdminLayout('会員管理', content, 'members')
}

// クーポン管理ページ
export function renderCouponsList(coupons: any[]): string {
  const content = `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">
        <i class="fas fa-ticket-alt mr-2 text-purple-600"></i>
        クーポン管理
      </h1>
      <div class="flex gap-2">
        <a href="/admin/members" class="text-gray-600 hover:text-gray-800">
          <i class="fas fa-arrow-left mr-2"></i>会員一覧に戻る
        </a>
        <button onclick="openCreateCoupon()" class="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition">
          <i class="fas fa-plus mr-2"></i>新規クーポン
        </button>
      </div>
    </div>
    
    <!-- クーポン一覧 -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">コード</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">タイプ</th>
            <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">値</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">対象会員</th>
            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">使用状況</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">有効期限</th>
            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">状態</th>
            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${coupons.length === 0 ? `
            <tr>
              <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                クーポンがまだありません
              </td>
            </tr>
          ` : coupons.map(c => `
            <tr class="hover:bg-gray-50 ${!c.is_active ? 'opacity-50' : ''}">
              <td class="px-4 py-3">
                <code class="bg-purple-100 text-purple-700 px-2 py-1 rounded font-mono">${c.code}</code>
              </td>
              <td class="px-4 py-3">
                ${c.type === 'percentage' ? '割引率' : c.type === 'fixed' ? '固定額' : 'ポイント'}
              </td>
              <td class="px-4 py-3 text-right font-medium">
                ${c.type === 'percentage' ? c.value + '%' : '¥' + c.value.toLocaleString()}
              </td>
              <td class="px-4 py-3 text-sm">
                ${c.member_email ? `<span class="text-gray-600">${c.member_name || c.member_email}</span>` : '<span class="text-green-600">全員</span>'}
              </td>
              <td class="px-4 py-3 text-center">
                <span class="font-medium">${c.used_count}</span>
                <span class="text-gray-400">/${c.max_uses || '∞'}</span>
              </td>
              <td class="px-4 py-3 text-sm text-gray-500">
                ${c.valid_until ? new Date(c.valid_until).toLocaleDateString('ja-JP') : '無期限'}
              </td>
              <td class="px-4 py-3 text-center">
                ${c.is_active ? 
                  '<span class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">有効</span>' :
                  '<span class="px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full">無効</span>'
                }
              </td>
              <td class="px-4 py-3 text-center">
                ${c.is_active ? `
                  <button onclick="deleteCoupon(${c.id})" class="text-red-600 hover:text-red-800" title="無効化">
                    <i class="fas fa-ban"></i>
                  </button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <!-- クーポン作成モーダル -->
    <div id="create-coupon-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold mb-4">
          <i class="fas fa-plus text-purple-600 mr-2"></i>
          新規クーポン作成
        </h3>
        <form id="create-coupon-form">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">クーポンコード（空欄で自動生成）</label>
            <input type="text" name="code" placeholder="例: WELCOME2024"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 uppercase">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">タイプ</label>
            <select name="type" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="percentage">割引率（%）</option>
              <option value="fixed">固定割引（円）</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">値</label>
            <input type="number" name="value" min="1" required placeholder="例: 10（10%）または 500（500円）"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">最低利用金額（円）</label>
            <input type="number" name="min_amount" min="0" value="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">最大使用回数（空欄で無制限）</label>
            <input type="number" name="max_uses" min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">有効期間（日数、空欄で無期限）</label>
            <input type="number" name="valid_days" min="1" placeholder="例: 30"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
          </div>
          <div class="flex gap-2 justify-end">
            <button type="button" onclick="closeCreateCoupon()" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              キャンセル
            </button>
            <button type="submit" class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      function openCreateCoupon() {
        document.getElementById('create-coupon-modal').classList.remove('hidden');
      }
      
      function closeCreateCoupon() {
        document.getElementById('create-coupon-modal').classList.add('hidden');
      }
      
      document.getElementById('create-coupon-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        try {
          const res = await fetch('/admin/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: formData.get('code') || undefined,
              type: formData.get('type'),
              value: parseInt(formData.get('value')),
              min_amount: parseInt(formData.get('min_amount')) || 0,
              max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses')) : undefined,
              valid_days: formData.get('valid_days') ? parseInt(formData.get('valid_days')) : undefined
            })
          });
          
          const result = await res.json();
          if (result.success) {
            alert('クーポンを作成しました: ' + result.code);
            location.reload();
          } else {
            alert('エラー: ' + result.error);
          }
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      });
      
      async function deleteCoupon(id) {
        if (!confirm('このクーポンを無効化しますか？')) return;
        
        try {
          const res = await fetch('/admin/api/coupons/' + id, { method: 'DELETE' });
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
    </script>
  `

  return renderAdminLayout('クーポン管理', content, 'members')
}

// 特典設定ページ
export function renderRewardSettings(settings: RewardSettings, tiers: MembershipTier[]): string {
  const content = `
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">
        <i class="fas fa-cog mr-2 text-gray-600"></i>
        特典設定
      </h1>
      <a href="/admin/members" class="text-gray-600 hover:text-gray-800">
        <i class="fas fa-arrow-left mr-2"></i>会員一覧に戻る
      </a>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- ポイント設定 -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-bold mb-4">
          <i class="fas fa-coins text-yellow-500 mr-2"></i>
          ポイント設定
        </h2>
        <form id="points-settings-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">1予約あたりの基本ポイント</label>
            <input type="number" name="points_per_booking" value="${settings.points_per_booking || 100}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">金額1円あたりのポイント（例: 0.01 = 1%）</label>
            <input type="number" name="points_per_yen" step="0.001" value="${settings.points_per_yen || 0.01}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">新規会員ウェルカムポイント</label>
            <input type="number" name="welcome_bonus" value="${settings.welcome_bonus || 100}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">5回受講ボーナス</label>
            <input type="number" name="milestone_5_bookings" value="${settings.milestone_5_bookings || 500}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">10回受講ボーナス</label>
            <input type="number" name="milestone_10_bookings" value="${settings.milestone_10_bookings || 1000}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
          </div>
          <button type="submit" class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
            ポイント設定を保存
          </button>
        </form>
      </div>
      
      <!-- 紹介プログラム設定 -->
      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-bold mb-4">
          <i class="fas fa-gift text-pink-500 mr-2"></i>
          紹介プログラム設定
        </h2>
        <form id="referral-settings-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">紹介者へのボーナスポイント</label>
            <input type="number" name="referral_bonus_referrer" value="${settings.referral_bonus_referrer || 500}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
            <p class="text-xs text-gray-500 mt-1">紹介された人が初めて予約した時に付与</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">被紹介者へのボーナスポイント</label>
            <input type="number" name="referral_bonus_referred" value="${settings.referral_bonus_referred || 300}"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
            <p class="text-xs text-gray-500 mt-1">紹介コードを使って登録した人への特典</p>
          </div>
          <button type="submit" class="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition">
            紹介設定を保存
          </button>
        </form>
      </div>
    </div>
    
    <!-- 会員ランク一覧（参考） -->
    <div class="mt-6 bg-white rounded-xl shadow p-6">
      <h2 class="text-lg font-bold mb-4">
        <i class="fas fa-medal text-purple-500 mr-2"></i>
        会員ランク一覧
      </h2>
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left">ランク</th>
            <th class="px-4 py-2 text-right">必要予約回数</th>
            <th class="px-4 py-2 text-right">ポイント倍率</th>
            <th class="px-4 py-2 text-right">常時割引</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          ${tiers.map(t => `
            <tr>
              <td class="px-4 py-2">${t.description}</td>
              <td class="px-4 py-2 text-right">${t.min_bookings}回以上</td>
              <td class="px-4 py-2 text-right">${t.points_multiplier}倍</td>
              <td class="px-4 py-2 text-right">${t.discount_rate}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="text-sm text-gray-500 mt-2">※ランクの変更はDBを直接編集してください</p>
    </div>
    
    <script>
      async function saveSettings(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
          data[key] = value;
        }
        
        try {
          const res = await fetch('/admin/api/reward-settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          const result = await res.json();
          if (result.success) {
            alert('設定を保存しました');
          } else {
            alert('エラー: ' + result.error);
          }
        } catch (err) {
          alert('通信エラーが発生しました');
        }
      }
      
      document.getElementById('points-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings('points-settings-form');
      });
      
      document.getElementById('referral-settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings('referral-settings-form');
      });
    </script>
  `

  return renderAdminLayout('特典設定', content, 'members')
}
