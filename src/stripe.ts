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

// Create Stripe Product for Course Series
export async function createCourseSeriesProduct(
  stripe: Stripe,
  seriesId: string,
  title: string,
  description?: string
): Promise<Stripe.Product> {
  return await stripe.products.create({
    name: title,
    description: description || `mirAIcafe コース: ${title}`,
    metadata: {
      series_id: seriesId,
      type: 'course_series'
    }
  })
}

// Create Stripe Price (one-time payment)
export async function createOneTimePrice(
  stripe: Stripe,
  productId: string,
  amount: number,
  nickname: string
): Promise<Stripe.Price> {
  return await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: 'jpy',
    nickname: nickname,
  })
}

// Create Stripe Price (subscription/recurring)
export async function createSubscriptionPrice(
  stripe: Stripe,
  productId: string,
  amount: number,
  intervalCount: number,
  nickname: string
): Promise<Stripe.Price> {
  return await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: 'jpy',
    nickname: nickname,
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      total_payments: intervalCount.toString()
    }
  })
}

// Create all prices for a course series
export interface CourseSeriesPrices {
  productId: string
  coursePriceId: string  // 一括払い
  earlyPriceId?: string  // 早期一括（オプション）
  monthlyPriceId?: string // 月額払い（オプション）
}

export async function createCourseSeriesStripeProducts(
  stripe: Stripe,
  params: {
    seriesId: string
    title: string
    description?: string
    coursePriceIncl: number      // 一括価格（税込）
    earlyPriceIncl?: number      // 早期価格（税込）
    monthlyPriceIncl?: number    // 月額価格（税込）
    totalSessions?: number       // 月額の回数
    hasMonthlyOption: boolean
  }
): Promise<CourseSeriesPrices> {
  // 1. Product作成
  const product = await createCourseSeriesProduct(
    stripe,
    params.seriesId,
    params.title,
    params.description
  )
  
  // 2. 一括払い Price作成
  const coursePrice = await createOneTimePrice(
    stripe,
    product.id,
    params.coursePriceIncl,
    `${params.title} - コース一括`
  )
  
  const result: CourseSeriesPrices = {
    productId: product.id,
    coursePriceId: coursePrice.id,
  }
  
  // 3. 早期割引 Price作成（オプション）
  if (params.earlyPriceIncl && params.earlyPriceIncl < params.coursePriceIncl) {
    const earlyPrice = await createOneTimePrice(
      stripe,
      product.id,
      params.earlyPriceIncl,
      `${params.title} - 早期申込`
    )
    result.earlyPriceId = earlyPrice.id
  }
  
  // 4. 月額払い Price作成（オプション）
  if (params.hasMonthlyOption && params.monthlyPriceIncl && params.totalSessions) {
    const monthlyPrice = await createSubscriptionPrice(
      stripe,
      product.id,
      params.monthlyPriceIncl,
      params.totalSessions,
      `${params.title} - 月額払い`
    )
    result.monthlyPriceId = monthlyPrice.id
  }
  
  return result
}

// Update Stripe Product
export async function updateStripeProduct(
  stripe: Stripe,
  productId: string,
  title: string,
  description?: string
): Promise<Stripe.Product> {
  return await stripe.products.update(productId, {
    name: title,
    description: description || `mirAIcafe コース: ${title}`,
  })
}

// Archive Stripe Product (when deleting course)
export async function archiveStripeProduct(
  stripe: Stripe,
  productId: string
): Promise<Stripe.Product> {
  return await stripe.products.update(productId, {
    active: false,
  })
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
