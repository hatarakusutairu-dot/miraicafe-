import { renderLayout } from '../components/layout'

// ポリシーの型定義
export interface Policy {
  id: string
  title: string
  content: string
  last_updated?: string
  updated_by?: string
}

// アイコンとサブタイトルの設定
const policyConfig: Record<string, { icon: string; subtitle: string; badge: string }> = {
  terms: {
    icon: 'fa-file-contract',
    subtitle: 'サービスご利用前にご確認ください',
    badge: 'TERMS OF SERVICE'
  },
  privacy: {
    icon: 'fa-shield-alt',
    subtitle: '個人情報の取り扱いについて',
    badge: 'PRIVACY POLICY'
  },
  cancellation: {
    icon: 'fa-calendar-times',
    subtitle: 'ご予約前に必ずご確認ください',
    badge: 'CANCELLATION POLICY'
  }
}

// デフォルトのプレースホルダーコンテンツ
const defaultContent: Record<string, string> = {
  terms: `
    <div class="text-center py-12">
      <div class="w-24 h-24 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <i class="fas fa-clock text-white text-4xl"></i>
      </div>
      <h2 class="text-2xl font-bold text-future-text mb-4">準備中</h2>
      <p class="text-future-textLight text-lg mb-8">
        利用規約の内容は現在準備中です。<br>
        近日中に公開予定ですので、しばらくお待ちください。
      </p>
    </div>
  `,
  privacy: `
    <div class="text-left max-w-3xl mx-auto">
      <section class="mb-8">
        <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
          <i class="fas fa-shield-alt text-ai-blue mr-3"></i>個人情報の取り扱いについて
        </h2>
        <p class="text-future-textLight leading-relaxed mb-4">
          mirAIcafe（以下、「当サービス」）は、お客様の個人情報の保護を重要な責務と考え、適切な管理・利用を行います。
        </p>
      </section>
      
      <section class="mb-8">
        <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
          <i class="fas fa-chart-line text-ai-purple mr-3"></i>アクセス解析ツールについて
        </h2>
        <p class="text-future-textLight leading-relaxed mb-4">
          当サイトでは、Googleによるアクセス解析ツール「Google Analytics」を使用しています。
          このGoogle Analyticsはデータの収集のためにCookieを使用しています。
          このデータは匿名で収集されており、個人を特定するものではありません。
        </p>
        <p class="text-future-textLight leading-relaxed mb-4">
          この機能はCookieを無効にすることで収集を拒否することが出来ますので、
          お使いのブラウザの設定をご確認ください。
        </p>
        <p class="text-future-textLight leading-relaxed">
          この規約に関しての詳細は
          <a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer" class="text-ai-blue hover:text-ai-purple underline">Googleアナリティクスサービス利用規約</a>
          および
          <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" class="text-ai-blue hover:text-ai-purple underline">Googleポリシーと規約</a>
          をご覧ください。
        </p>
      </section>
      
      <section class="mb-8">
        <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
          <i class="fas fa-envelope text-ai-cyan mr-3"></i>お問い合わせ
        </h2>
        <p class="text-future-textLight leading-relaxed">
          個人情報の取り扱いに関するお問い合わせは、<a href="/contact" class="text-ai-blue hover:text-ai-purple underline">お問い合わせページ</a>よりご連絡ください。
        </p>
      </section>
      
      <div class="text-center text-future-textLight text-sm mt-12 pt-6 border-t border-future-sky">
        ※ 詳細なプライバシーポリシーは準備中です。近日中に公開予定です。
      </div>
    </div>
  `,
  cancellation: `
    <div class="text-center py-12">
      <div class="w-24 h-24 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <i class="fas fa-clock text-white text-4xl"></i>
      </div>
      <h2 class="text-2xl font-bold text-future-text mb-4">準備中</h2>
      <p class="text-future-textLight text-lg mb-8">
        キャンセルポリシーの内容は現在準備中です。<br>
        近日中に公開予定ですので、しばらくお待ちください。
      </p>
    </div>
  `
}

export const renderPolicyPage = (policy: Policy | null, policyType: string) => {
  const config = policyConfig[policyType] || policyConfig.terms
  const title = policy?.title || (policyType === 'terms' ? '利用規約' : policyType === 'privacy' ? 'プライバシーポリシー' : 'キャンセルポリシー')
  
  // コンテンツが「（内容準備中）」または空の場合はデフォルトを表示
  const isContentEmpty = !policy?.content || policy.content === '（内容準備中）' || policy.content.trim() === ''
  const contentHtml = isContentEmpty ? defaultContent[policyType] : `
    <div class="policy-content prose prose-lg max-w-none">
      ${policy?.content}
    </div>
    ${policy?.last_updated ? `
      <div class="mt-8 pt-6 border-t border-future-sky text-sm text-future-textLight text-right">
        最終更新日: ${new Date(policy.last_updated).toLocaleDateString('ja-JP')}
      </div>
    ` : ''}
  `

  const content = `
    <!-- Page Header -->
    <section class="relative py-20 overflow-hidden">
      <div class="absolute inset-0 gradient-ai-light"></div>
      <div class="absolute inset-0">
        <div class="orb orb-1 opacity-30"></div>
        <div class="orb orb-2 opacity-20"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-flex items-center gradient-ai text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas ${config.icon} mr-2"></i>${config.badge}
        </span>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-future-text mb-3 sm:mb-4">${title}</h1>
        <p class="text-future-textLight text-base sm:text-lg max-w-xl mx-auto">
          ${config.subtitle}
        </p>
      </div>
    </section>

    <!-- Policy Content -->
    <section class="py-16 bg-future-light">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-future-sky/50">
          ${contentHtml}
          
          <!-- Contact Info -->
          <div class="mt-8 pt-8 border-t border-future-sky text-center">
            <p class="text-future-textLight mb-4">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
            <a href="/contact" class="inline-flex items-center px-6 py-3 gradient-ai text-white rounded-full font-bold shadow-lg hover:opacity-90 transition-opacity">
              <i class="fas fa-envelope mr-2"></i>お問い合わせ
            </a>
          </div>
        </div>
      </div>
    </section>

    <style>
      .policy-content h2 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a1a2e;
        margin-top: 2rem;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e0e7ff;
      }
      .policy-content h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a1a2e;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
      }
      .policy-content p {
        color: #64748b;
        line-height: 1.8;
        margin-bottom: 1rem;
      }
      .policy-content ul, .policy-content ol {
        margin-left: 1.5rem;
        margin-bottom: 1rem;
        color: #64748b;
      }
      .policy-content li {
        margin-bottom: 0.5rem;
        line-height: 1.7;
      }
      .policy-content strong {
        color: #1a1a2e;
        font-weight: 600;
      }
    </style>
  `

  return renderLayout(title, content, 'policy')
}
