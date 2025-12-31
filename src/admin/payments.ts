import { renderAdminLayout } from './layout'
import { formatAmount, getPaymentStatusLabel } from '../stripe'

export interface Payment {
  id: number
  booking_id?: number
  stripe_payment_intent_id?: string
  stripe_checkout_session_id?: string
  amount: number
  currency: string
  status: string
  payment_method?: string
  receipt_url?: string
  customer_email?: string
  customer_name?: string
  course_id?: string
  course_title?: string
  schedule_date?: string
  metadata?: string
  created_at: string
  updated_at: string
}

function escapeHtml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function renderPaymentsList(payments: Payment[], stats: { total: number; succeeded: number; pending: number; failed: number; totalAmount: number }): string {
  const content = `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">決済履歴</h1>
          <p class="text-gray-600 mt-1">Stripe決済の履歴を管理</p>
        </div>
        <div class="flex gap-3">
          <a href="/admin/payments/export" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2">
            <i class="fas fa-download"></i>
            CSVエクスポート
          </a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fas fa-credit-card text-blue-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">総件数</p>
              <p class="text-xl font-bold text-gray-800">${stats.total}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">成功</p>
              <p class="text-xl font-bold text-green-600">${stats.succeeded}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <i class="fas fa-clock text-yellow-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">処理中</p>
              <p class="text-xl font-bold text-yellow-600">${stats.pending}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i class="fas fa-times-circle text-red-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">失敗</p>
              <p class="text-xl font-bold text-red-600">${stats.failed}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <i class="fas fa-yen-sign text-purple-600"></i>
            </div>
            <div>
              <p class="text-sm text-gray-500">売上合計</p>
              <p class="text-xl font-bold text-purple-600">${formatAmount(stats.totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stripe Config Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <i class="fas fa-info-circle text-blue-600 mt-1"></i>
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">Stripe設定について</p>
            <p>本番環境でStripeを利用するには、以下の環境変数を設定してください：</p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li><code class="bg-blue-100 px-1 rounded">STRIPE_SECRET_KEY</code> - Stripeのシークレットキー（sk_live_xxx または sk_test_xxx）</li>
              <li><code class="bg-blue-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> - WebhookのEndpoint Secret（whsec_xxx）</li>
            </ul>
            <p class="mt-2">
              <a href="https://dashboard.stripe.com/apikeys" target="_blank" class="text-blue-600 hover:underline">
                Stripeダッシュボード <i class="fas fa-external-link-alt text-xs"></i>
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        ${payments.length === 0 ? `
          <div class="p-12 text-center">
            <div class="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <i class="fas fa-credit-card text-2xl text-gray-400"></i>
            </div>
            <h3 class="text-lg font-medium text-gray-600 mb-2">決済履歴がありません</h3>
            <p class="text-gray-500">講座の予約・決済が行われると、ここに表示されます。</p>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客情報</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">講座</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${payments.map(payment => {
                  const status = getPaymentStatusLabel(payment.status)
                  return `
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${formatDate(payment.created_at)}
                      </td>
                      <td class="px-4 py-4">
                        <div class="text-sm font-medium text-gray-900">${escapeHtml(payment.customer_name || '-')}</div>
                        <div class="text-sm text-gray-500">${escapeHtml(payment.customer_email || '-')}</div>
                      </td>
                      <td class="px-4 py-4">
                        <div class="text-sm text-gray-900">${escapeHtml(payment.course_title || '-')}</div>
                        ${payment.schedule_date ? `<div class="text-xs text-gray-500">${escapeHtml(payment.schedule_date)}</div>` : ''}
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <span class="text-sm font-medium text-gray-900">${formatAmount(payment.amount, payment.currency)}</span>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.color}">
                          ${status.label}
                        </span>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap text-sm">
                        <div class="flex gap-2">
                          ${payment.receipt_url ? `
                            <a href="${payment.receipt_url}" target="_blank" class="text-blue-600 hover:text-blue-800" title="領収書">
                              <i class="fas fa-receipt"></i>
                            </a>
                          ` : ''}
                          ${payment.stripe_payment_intent_id ? `
                            <a href="https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}" target="_blank" class="text-purple-600 hover:text-purple-800" title="Stripeで確認">
                              <i class="fab fa-stripe-s"></i>
                            </a>
                          ` : ''}
                          ${payment.booking_id ? `
                            <a href="/admin/bookings/${payment.booking_id}" class="text-gray-600 hover:text-gray-800" title="予約詳細">
                              <i class="fas fa-calendar-check"></i>
                            </a>
                          ` : ''}
                        </div>
                      </td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `

  return renderAdminLayout('決済履歴', content, 'payments')
}
