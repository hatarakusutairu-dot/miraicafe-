import { renderLayout } from '../components/layout'

export const renderContactPage = () => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-cafe py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl font-bold text-white mb-4">お問い合わせ</h1>
        <p class="text-cafe-cream/90">ご質問・ご相談はお気軽にどうぞ</p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Contact Info -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-2xl p-6 shadow-md">
              <h2 class="text-xl font-bold text-cafe-darkBrown mb-4">
                <i class="fas fa-info-circle text-cafe-caramel mr-2"></i>お問い合わせ方法
              </h2>
              
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="w-10 h-10 gradient-cafe rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i class="fas fa-envelope text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-cafe-darkBrown">メール</h3>
                    <p class="text-cafe-mocha text-sm">info@miraicafe.jp</p>
                    <p class="text-cafe-mocha text-xs mt-1">24時間受付</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="w-10 h-10 gradient-cafe rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i class="fas fa-clock text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-cafe-darkBrown">対応時間</h3>
                    <p class="text-cafe-mocha text-sm">平日 9:00 - 18:00</p>
                    <p class="text-cafe-mocha text-xs mt-1">土日祝は翌営業日に対応</p>
                  </div>
                </div>
                
                <div class="flex items-start">
                  <div class="w-10 h-10 gradient-cafe rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <i class="fas fa-reply text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-cafe-darkBrown">返信目安</h3>
                    <p class="text-cafe-mocha text-sm">1〜2営業日以内</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- FAQ Section -->
            <div class="bg-white rounded-2xl p-6 shadow-md">
              <h2 class="text-xl font-bold text-cafe-darkBrown mb-4">
                <i class="fas fa-question-circle text-cafe-caramel mr-2"></i>よくある質問
              </h2>
              
              <div class="space-y-4">
                <details class="group">
                  <summary class="flex justify-between items-center cursor-pointer p-3 bg-cafe-cream rounded-lg">
                    <span class="font-medium text-cafe-darkBrown text-sm">支払い方法は？</span>
                    <i class="fas fa-chevron-down text-cafe-caramel group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <p class="text-cafe-mocha text-sm p-3">クレジットカード（Visa, Mastercard, JCB, AMEX）でのお支払いに対応しています。Stripe決済を利用しています。</p>
                </details>
                
                <details class="group">
                  <summary class="flex justify-between items-center cursor-pointer p-3 bg-cafe-cream rounded-lg">
                    <span class="font-medium text-cafe-darkBrown text-sm">キャンセルは可能？</span>
                    <i class="fas fa-chevron-down text-cafe-caramel group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <p class="text-cafe-mocha text-sm p-3">講座開始の3日前までキャンセル可能です。全額返金いたします。それ以降のキャンセルは返金対象外となります。</p>
                </details>
                
                <details class="group">
                  <summary class="flex justify-between items-center cursor-pointer p-3 bg-cafe-cream rounded-lg">
                    <span class="font-medium text-cafe-darkBrown text-sm">必要な準備は？</span>
                    <i class="fas fa-chevron-down text-cafe-caramel group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <p class="text-cafe-mocha text-sm p-3">PCとインターネット環境があれば参加できます。Zoomを使用しますので、事前にインストールをお願いします。</p>
                </details>
                
                <details class="group">
                  <summary class="flex justify-between items-center cursor-pointer p-3 bg-cafe-cream rounded-lg">
                    <span class="font-medium text-cafe-darkBrown text-sm">領収書は発行可能？</span>
                    <i class="fas fa-chevron-down text-cafe-caramel group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <p class="text-cafe-mocha text-sm p-3">はい、PDF形式の領収書を発行いたします。ご予約確認メールに記載のリンクからダウンロードできます。</p>
                </details>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl p-8 shadow-md">
              <h2 class="text-2xl font-bold text-cafe-darkBrown mb-6">
                <i class="fas fa-paper-plane text-cafe-caramel mr-2"></i>メッセージを送る
              </h2>
              
              <form id="contact-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-cafe-mocha text-sm font-medium mb-2">
                      お名前 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="contact-name" required 
                      class="w-full p-4 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none transition-colors"
                      placeholder="山田 太郎">
                  </div>
                  <div>
                    <label class="block text-cafe-mocha text-sm font-medium mb-2">
                      メールアドレス <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="contact-email" required 
                      class="w-full p-4 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none transition-colors"
                      placeholder="example@email.com">
                  </div>
                </div>

                <div>
                  <label class="block text-cafe-mocha text-sm font-medium mb-2">
                    お問い合わせ種別
                  </label>
                  <select id="contact-subject" 
                    class="w-full p-4 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none transition-colors">
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="course">講座について</option>
                    <option value="reservation">予約について</option>
                    <option value="payment">お支払いについて</option>
                    <option value="corporate">法人・団体のお申し込み</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label class="block text-cafe-mocha text-sm font-medium mb-2">
                    メッセージ <span class="text-red-500">*</span>
                  </label>
                  <textarea id="contact-message" required rows="6"
                    class="w-full p-4 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none transition-colors resize-none"
                    placeholder="お問い合わせ内容をご記入ください..."></textarea>
                </div>

                <div class="flex items-start">
                  <input type="checkbox" id="privacy-agree" required 
                    class="mt-1 mr-3 w-5 h-5 accent-cafe-caramel">
                  <label for="privacy-agree" class="text-cafe-mocha text-sm">
                    <a href="#" class="text-cafe-caramel hover:underline">プライバシーポリシー</a>に同意します
                  </label>
                </div>

                <button type="submit" id="submit-btn"
                  class="btn-cafe w-full gradient-cafe text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center">
                  <i class="fas fa-paper-plane mr-2"></i>送信する
                </button>
              </form>

              <!-- Success Message (hidden by default) -->
              <div id="success-message" class="hidden text-center py-8">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i class="fas fa-check text-white text-2xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-cafe-darkBrown mb-2">送信完了</h3>
                <p class="text-cafe-mocha">
                  お問い合わせありがとうございます。<br>
                  1〜2営業日以内にご返信いたします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section (Placeholder) -->
    <section class="py-12 bg-cafe-latte">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl p-8 shadow-md text-center">
          <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-globe text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-cafe-darkBrown mb-2">完全オンライン</h2>
          <p class="text-cafe-mocha">
            mirAIcafeは完全オンラインで運営しています。<br>
            日本全国どこからでもご参加いただけます。
          </p>
        </div>
      </div>
    </section>

    <script>
      document.getElementById('contact-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
        
        const data = {
          name: document.getElementById('contact-name').value,
          email: document.getElementById('contact-email').value,
          subject: document.getElementById('contact-subject').value,
          message: document.getElementById('contact-message').value
        };
        
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            document.getElementById('contact-form').classList.add('hidden');
            document.getElementById('success-message').classList.remove('hidden');
          } else {
            throw new Error('送信に失敗しました');
          }
        } catch (error) {
          alert('エラー: ' + error.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信する';
        }
      });
    </script>
  `

  return renderLayout('お問い合わせ', content, 'contact')
}
