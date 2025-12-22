import { renderLayout } from '../components/layout'

export const renderContactPage = () => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-hero relative overflow-hidden py-16">
      <div class="wave-bg opacity-50"></div>
      <div class="wave-bg wave-bg-2 opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block bg-white/70 backdrop-blur-sm text-character-pink font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas fa-envelope mr-2"></i>お気軽にどうぞ
        </span>
        <h1 class="font-display text-4xl font-bold text-greenhouse-text mb-4">お問い合わせ</h1>
        <p class="text-greenhouse-textLight max-w-xl mx-auto">ご質問・ご相談はお気軽にどうぞ</p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-12 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Contact Info -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-3xl p-6 shadow-md border border-greenhouse-beige">
              <h2 class="text-xl font-bold text-greenhouse-text mb-4 flex items-center">
                <i class="fas fa-info-circle text-character-green mr-2"></i>お問い合わせ方法
              </h2>
              
              <div class="space-y-4">
                <div class="flex items-start bg-greenhouse-cream rounded-2xl p-4">
                  <div class="w-12 h-12 gradient-button rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow">
                    <i class="fas fa-envelope text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-greenhouse-text">メール</h3>
                    <p class="text-character-green text-sm font-medium">info@miraicafe.jp</p>
                    <p class="text-greenhouse-textLight text-xs mt-1">24時間受付</p>
                  </div>
                </div>
                
                <div class="flex items-start bg-greenhouse-cream rounded-2xl p-4">
                  <div class="w-12 h-12 gradient-button-warm rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow">
                    <i class="fas fa-clock text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-greenhouse-text">対応時間</h3>
                    <p class="text-greenhouse-textLight text-sm">平日 9:00 - 18:00</p>
                    <p class="text-greenhouse-textLight text-xs mt-1">土日祝は翌営業日に対応</p>
                  </div>
                </div>
                
                <div class="flex items-start bg-greenhouse-cream rounded-2xl p-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-character-pink to-pink-400 rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow">
                    <i class="fas fa-reply text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-greenhouse-text">返信目安</h3>
                    <p class="text-greenhouse-textLight text-sm">1〜2営業日以内</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- FAQ Section -->
            <div class="bg-white rounded-3xl p-6 shadow-md border border-greenhouse-beige">
              <h2 class="text-xl font-bold text-greenhouse-text mb-4 flex items-center">
                <i class="fas fa-question-circle text-character-orange mr-2"></i>よくある質問
              </h2>
              
              <div class="space-y-3">
                <details class="group bg-greenhouse-cream rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4">
                    <span class="font-medium text-greenhouse-text text-sm">支払い方法は？</span>
                    <i class="fas fa-chevron-down text-character-green group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-greenhouse-textLight text-sm">クレジットカード（Visa, Mastercard, JCB, AMEX）でのお支払いに対応しています。</p>
                  </div>
                </details>
                
                <details class="group bg-greenhouse-cream rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4">
                    <span class="font-medium text-greenhouse-text text-sm">キャンセルは可能？</span>
                    <i class="fas fa-chevron-down text-character-green group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-greenhouse-textLight text-sm">講座開始の3日前までキャンセル可能です。全額返金いたします。</p>
                  </div>
                </details>
                
                <details class="group bg-greenhouse-cream rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4">
                    <span class="font-medium text-greenhouse-text text-sm">必要な準備は？</span>
                    <i class="fas fa-chevron-down text-character-green group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-greenhouse-textLight text-sm">PCとインターネット環境があれば参加できます。Zoomを事前にインストールしてください。</p>
                  </div>
                </details>
                
                <details class="group bg-greenhouse-cream rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4">
                    <span class="font-medium text-greenhouse-text text-sm">領収書は発行可能？</span>
                    <i class="fas fa-chevron-down text-character-green group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-greenhouse-textLight text-sm">はい、PDF形式の領収書を発行いたします。</p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-3xl p-8 shadow-md border border-greenhouse-beige">
              <h2 class="text-2xl font-bold text-greenhouse-text mb-6 flex items-center">
                <span class="w-12 h-12 gradient-button rounded-full flex items-center justify-center mr-4 shadow">
                  <i class="fas fa-paper-plane text-white"></i>
                </span>
                メッセージを送る
              </h2>
              
              <form id="contact-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-greenhouse-text text-sm font-medium mb-2">
                      お名前 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="contact-name" required 
                      class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream"
                      placeholder="山田 太郎">
                  </div>
                  <div>
                    <label class="block text-greenhouse-text text-sm font-medium mb-2">
                      メールアドレス <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="contact-email" required 
                      class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream"
                      placeholder="example@email.com">
                  </div>
                </div>

                <div>
                  <label class="block text-greenhouse-text text-sm font-medium mb-2">
                    お問い合わせ種別
                  </label>
                  <select id="contact-subject" 
                    class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream">
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="course">講座について</option>
                    <option value="reservation">予約について</option>
                    <option value="payment">お支払いについて</option>
                    <option value="corporate">法人・団体のお申し込み</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label class="block text-greenhouse-text text-sm font-medium mb-2">
                    メッセージ <span class="text-red-500">*</span>
                  </label>
                  <textarea id="contact-message" required rows="6"
                    class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors resize-none bg-greenhouse-cream"
                    placeholder="お問い合わせ内容をご記入ください..."></textarea>
                </div>

                <div class="flex items-start bg-greenhouse-cream rounded-2xl p-4">
                  <input type="checkbox" id="privacy-agree" required 
                    class="mt-1 mr-3 w-5 h-5 accent-character-green rounded">
                  <label for="privacy-agree" class="text-greenhouse-textLight text-sm">
                    <a href="#" class="text-character-green hover:underline font-medium">プライバシーポリシー</a>に同意します
                  </label>
                </div>

                <button type="submit" id="submit-btn"
                  class="btn-primary w-full gradient-button text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center">
                  <i class="fas fa-paper-plane mr-2"></i>送信する
                </button>
              </form>

              <!-- Success Message -->
              <div id="success-message" class="hidden text-center py-12">
                <div class="w-20 h-20 bg-character-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <i class="fas fa-check text-white text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-greenhouse-text mb-2">送信完了</h3>
                <p class="text-greenhouse-textLight">
                  お問い合わせありがとうございます。<br>
                  1〜2営業日以内にご返信いたします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Online Info -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-br from-greenhouse-sage/20 to-greenhouse-sky/20 rounded-3xl p-8 text-center border border-greenhouse-sage/30">
          <div class="w-16 h-16 gradient-button rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-globe text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-greenhouse-text mb-2">完全オンライン</h2>
          <p class="text-greenhouse-textLight max-w-lg mx-auto">
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
