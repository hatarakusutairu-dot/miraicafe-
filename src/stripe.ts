import Stripe from 'stripe'

// Stripe client initialization for Cloudflare Workers
export function createStripeClient(apiKey: string): Stripe {
  return new Stripe(apiKey, {
    apiVersion: '2024-12-18.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  })
}

// Types
export interface CreateCheckoutSessionParams {
  courseId: string
  courseTitle: string
  price: number
  customerEmail: string
  customerName: string
  scheduleDate?: string
  scheduleTime?: string
  successUrl: string
  cancelUrl: string
  bookingId?: number
}

export interface PaymentRecord {
  id?: number
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
  created_at?: string
  updated_at?: string
}

// Create Checkout Session
export async function createCheckoutSession(
  stripe: Stripe,
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: params.courseTitle,
            description: params.scheduleDate 
              ? `開催日: ${params.scheduleDate}${params.scheduleTime ? ` ${params.scheduleTime}` : ''}`
              : 'mirAIcafe 講座',
          },
          unit_amount: params.price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: {
      course_id: params.courseId,
      course_title: params.courseTitle,
      customer_name: params.customerName,
      schedule_date: params.scheduleDate || '',
      schedule_time: params.scheduleTime || '',
      booking_id: params.bookingId?.toString() || '',
    },
    locale: 'ja',
    payment_intent_data: {
      metadata: {
        course_id: params.courseId,
        course_title: params.courseTitle,
        customer_name: params.customerName,
      },
    },
  })

  return session
}

// Verify Webhook Signature
export function verifyWebhookSignature(
  stripe: Stripe,
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}

// Format amount for display (JPY doesn't use decimals)
export function formatAmount(amount: number, currency: string = 'jpy'): string {
  if (currency.toLowerCase() === 'jpy') {
    return `¥${amount.toLocaleString()}`
  }
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`
}

// Get payment status label in Japanese
export function getPaymentStatusLabel(status: string): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'succeeded':
      return { label: '支払い完了', color: 'text-green-700', bgColor: 'bg-green-100' }
    case 'pending':
      return { label: '処理中', color: 'text-yellow-700', bgColor: 'bg-yellow-100' }
    case 'failed':
      return { label: '失敗', color: 'text-red-700', bgColor: 'bg-red-100' }
    case 'refunded':
      return { label: '返金済み', color: 'text-blue-700', bgColor: 'bg-blue-100' }
    case 'canceled':
      return { label: 'キャンセル', color: 'text-gray-700', bgColor: 'bg-gray-100' }
    default:
      return { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' }
  }
}
