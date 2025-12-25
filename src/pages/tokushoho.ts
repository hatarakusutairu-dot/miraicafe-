// 特定商取引法に基づく表記ページ
import { renderLayout } from '../components/layout'

export const renderTokushohoPage = () => {
  const content = `
    <main class="min-h-screen py-12 px-4" style="background: linear-gradient(180deg, #FAF8F3 0%, #F5F0E6 100%);">
      <div class="max-w-3xl mx-auto">
        <!-- ヘッダー -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold mb-4" style="color: #3D3428;">
            <i class="fas fa-file-contract mr-3" style="color: #B8956A;"></i>
            特定商取引法に基づく表記
          </h1>
          <p style="color: #7A7265;">mirAIcafe サービス提供に関する法定表示</p>
        </div>

        <!-- コンテンツカード -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden" style="border: 1px solid #E8DCC8;">
          
          <div class="p-8 space-y-8">
            
            <!-- 販売事業者 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-building mr-2" style="color: #B8956A;"></i>販売事業者名
              </h2>
              <p style="color: #4A4035;">【事業者名または個人名】</p>
              <p class="text-sm mt-1" style="color: #7A7265; font-style: italic;">※ 確定後に記入</p>
            </section>

            <!-- 運営責任者 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-user-tie mr-2" style="color: #B8956A;"></i>運営責任者
              </h2>
              <p style="color: #4A4035;">mion（ミオン）</p>
            </section>

            <!-- 所在地 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-map-marker-alt mr-2" style="color: #B8956A;"></i>所在地
              </h2>
              <p style="color: #4A4035;">【住所】</p>
              <p class="text-sm mt-1" style="color: #7A7265; font-style: italic;">※ 請求があった場合は遅滞なく開示いたします。</p>
            </section>

            <!-- 電話番号 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-phone mr-2" style="color: #B8956A;"></i>電話番号
              </h2>
              <p style="color: #4A4035;">【電話番号】</p>
              <p class="text-sm mt-1" style="color: #7A7265; font-style: italic;">※ お問い合わせは<a href="/contact" class="underline" style="color: #B8956A;">お問い合わせフォーム</a>からお願いします。</p>
            </section>

            <!-- メールアドレス -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-envelope mr-2" style="color: #B8956A;"></i>メールアドレス
              </h2>
              <p style="color: #4A4035;">
                <a href="mailto:ai.career@miraicafe.work" class="underline" style="color: #B8956A;">ai.career@miraicafe.work</a>
              </p>
            </section>

            <!-- 販売価格 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-yen-sign mr-2" style="color: #B8956A;"></i>販売価格
              </h2>
              <p style="color: #4A4035;">各講座の販売ページに記載された価格（税込）</p>
            </section>

            <!-- 商品代金以外の必要料金 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-receipt mr-2" style="color: #B8956A;"></i>商品代金以外の必要料金
              </h2>
              <p style="color: #4A4035;">なし</p>
            </section>

            <!-- お支払い方法 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-credit-card mr-2" style="color: #B8956A;"></i>お支払い方法
              </h2>
              <p style="color: #4A4035;">クレジットカード決済（Stripe）</p>
              <p class="text-sm mt-2" style="color: #7A7265;">
                <i class="fab fa-cc-visa mr-1"></i>
                <i class="fab fa-cc-mastercard mr-1"></i>
                <i class="fab fa-cc-amex mr-1"></i>
                <i class="fab fa-cc-jcb mr-1"></i>
                VISA、MasterCard、American Express、JCB、Diners Club、Discover
              </p>
            </section>

            <!-- お支払い時期 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-clock mr-2" style="color: #B8956A;"></i>お支払い時期
              </h2>
              <p style="color: #4A4035;">お申し込み時に決済が確定します。</p>
            </section>

            <!-- 商品の引渡し時期 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-truck mr-2" style="color: #B8956A;"></i>商品の引渡し時期
              </h2>
              <p style="color: #4A4035;">決済完了後、メールにて受講方法をご案内いたします。</p>
            </section>

            <!-- 返品・キャンセル -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-undo mr-2" style="color: #B8956A;"></i>返品・キャンセルについて
              </h2>
              <p style="color: #4A4035;" class="mb-3">デジタルコンテンツの性質上、原則として返品・返金はお受けできません。</p>
              <p style="color: #4A4035;" class="mb-2">ただし、以下の場合は返金対応いたします:</p>
              <ul class="list-disc list-inside space-y-1 ml-4" style="color: #4A4035;">
                <li>講座が開催されなかった場合</li>
                <li>システムトラブル等により受講できなかった場合</li>
                <li>開催日の7日前までにキャンセルのご連絡をいただいた場合（手数料を除く全額返金）</li>
              </ul>
            </section>

            <!-- サービス提供の中止 -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-exclamation-triangle mr-2" style="color: #B8956A;"></i>サービス提供の中止について
              </h2>
              <p style="color: #4A4035;" class="mb-2">以下の場合、サービス提供を中止することがあります:</p>
              <ul class="list-disc list-inside space-y-1 ml-4 mb-3" style="color: #4A4035;">
                <li>講師の病気・怪我等、やむを得ない事情が発生した場合</li>
                <li>天災・システム障害等により提供が困難になった場合</li>
              </ul>
              <p class="text-sm" style="color: #7A7265; font-style: italic;">※ 中止の場合は、受講料を全額返金いたします。</p>
            </section>

            <!-- 表現・商品に関する注意書き -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-info-circle mr-2" style="color: #B8956A;"></i>表現・商品に関する注意書き
              </h2>
              <p style="color: #4A4035;">本講座は、受講者のスキル向上を目的としたものであり、特定の成果を保証するものではありません。</p>
            </section>

            <!-- 個人情報の取り扱い -->
            <section>
              <h2 class="text-lg font-bold mb-3 pb-2 border-b-2" style="color: #5D4E3A; border-color: #D4C4A8;">
                <i class="fas fa-shield-alt mr-2" style="color: #B8956A;"></i>個人情報の取り扱い
              </h2>
              <p style="color: #4A4035;">
                お客様の個人情報は、<a href="/privacy-policy" class="underline" style="color: #B8956A;">プライバシーポリシー</a>に基づき、適切に管理いたします。
              </p>
            </section>

          </div>

          <!-- フッター -->
          <div class="px-8 py-6" style="background: #FAF8F3; border-top: 1px solid #E8DCC8;">
            <p class="text-center text-sm" style="color: #7A7265;">
              最終更新日: 2025年12月25日
            </p>
          </div>

        </div>

        <!-- 戻るリンク -->
        <div class="text-center mt-8">
          <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:shadow-lg" style="background: #B8956A; color: white;">
            <i class="fas fa-arrow-left"></i>
            トップページに戻る
          </a>
        </div>

      </div>
    </main>
  `

  return renderLayout('特定商取引法に基づく表記', content, '')
}
