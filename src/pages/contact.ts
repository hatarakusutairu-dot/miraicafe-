import { renderLayout } from '../components/layout'

export const renderContactPage = () => {
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
          <i class="fas fa-envelope mr-2"></i>CONTACT
        </span>
        <h1 class="text-5xl font-bold text-future-text mb-4">お問い合わせ</h1>
        <p class="text-future-textLight text-lg max-w-xl mx-auto">
          ご質問・ご相談はお気軽にどうぞ
        </p>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-12 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Contact Info & FAQ -->
          <div class="lg:col-span-1 space-y-6">
            
            <!-- Contact Methods Section -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <i class="fas fa-info-circle gradient-ai-text mr-2"></i>その他のお問い合わせ方法
              </h2>
              
              <div class="space-y-4">
                <div class="flex items-start glass rounded-2xl p-4">
                  <div class="w-12 h-12 gradient-ai rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow">
                    <i class="fas fa-envelope text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-future-text">Email</h3>
                    <p class="gradient-ai-text text-sm font-medium">info@miraicafe.com</p>
                    <p class="text-future-textLight text-xs mt-1">24時間受付</p>
                  </div>
                </div>
                
                <div class="flex items-start glass rounded-2xl p-4">
                  <div class="w-12 h-12 gradient-ai rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow">
                    <i class="fas fa-clock text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-future-text">受付時間</h3>
                    <p class="text-future-textLight text-sm">平日 10:00〜18:00</p>
                    <p class="text-future-textLight text-xs mt-1">土日祝は翌営業日に対応</p>
                  </div>
                </div>
                
                <div class="flex items-start glass rounded-2xl p-4">
                  <div class="w-12 h-12 gradient-ai rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow">
                    <i class="fas fa-reply text-white"></i>
                  </div>
                  <div>
                    <h3 class="font-medium text-future-text">返信目安</h3>
                    <p class="text-future-textLight text-sm">2営業日以内</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- FAQ Section -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <i class="fas fa-question-circle gradient-ai-text mr-2"></i>よくある質問
              </h2>
              
              <div class="space-y-3">
                <details class="group glass rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4 hover:bg-ai-blue/5 transition-colors">
                    <span class="font-medium text-future-text text-sm">講座の受講に必要な準備は？</span>
                    <i class="fas fa-chevron-down text-ai-blue group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-future-textLight text-sm">PCとインターネット環境があれば参加できます。Google Meetを使用しますが、リンクをクリックするだけで参加できます（アカウント不要）。</p>
                  </div>
                </details>
                
                <details class="group glass rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4 hover:bg-ai-blue/5 transition-colors">
                    <span class="font-medium text-future-text text-sm">支払い方法を教えてください</span>
                    <i class="fas fa-chevron-down text-ai-blue group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-future-textLight text-sm">クレジットカード（Visa, Mastercard, JCB, AMEX）でのお支払いに対応しています。</p>
                  </div>
                </details>
                
                <details class="group glass rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4 hover:bg-ai-blue/5 transition-colors">
                    <span class="font-medium text-future-text text-sm">キャンセルは可能ですか？</span>
                    <i class="fas fa-chevron-down text-ai-blue group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-future-textLight text-sm">講座開始の3日前までキャンセル可能です。全額返金いたします。</p>
                  </div>
                </details>

                <details class="group glass rounded-2xl overflow-hidden">
                  <summary class="flex justify-between items-center cursor-pointer p-4 hover:bg-ai-blue/5 transition-colors">
                    <span class="font-medium text-future-text text-sm">法人での研修は対応していますか？</span>
                    <i class="fas fa-chevron-down text-ai-blue group-open:rotate-180 transition-transform"></i>
                  </summary>
                  <div class="px-4 pb-4">
                    <p class="text-future-textLight text-sm">はい、法人研修も承っております。下記フォームの「法人研修のご相談」を選択してお問い合わせください。</p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-3xl p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-2xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-12 h-12 gradient-ai rounded-xl flex items-center justify-center mr-4 shadow">
                  <i class="fas fa-paper-plane text-white"></i>
                </span>
                お問い合わせフォーム
              </h2>
              
              <form id="contact-form" class="space-y-6" novalidate>
                <!-- Name and Email Row -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-future-text text-sm font-medium mb-2">
                      お名前 <span class="text-red-500">*</span>
                      <span class="text-future-textLight text-xs ml-1">(50文字以内)</span>
                    </label>
                    <input type="text" id="contact-name" maxlength="50"
                      class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light"
                      placeholder="山田 太郎">
                    <p id="name-error" class="text-red-500 text-sm mt-1 hidden"></p>
                    <p id="name-count" class="text-future-textLight text-xs mt-1 text-right">0/50</p>
                  </div>
                  <div>
                    <label class="block text-future-text text-sm font-medium mb-2">
                      メールアドレス <span class="text-red-500">*</span>
                    </label>
                    <input type="email" id="contact-email"
                      class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light"
                      placeholder="example@email.com">
                    <p id="email-error" class="text-red-500 text-sm mt-1 hidden"></p>
                  </div>
                </div>

                <!-- Phone (Optional) -->
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">
                    電話番号 <span class="text-future-textLight text-xs">(任意)</span>
                  </label>
                  <input type="tel" id="contact-phone"
                    class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light"
                    placeholder="090-1234-5678">
                  <p id="phone-error" class="text-red-500 text-sm mt-1 hidden"></p>
                </div>

                <!-- Inquiry Type -->
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">
                    お問い合わせ種別 <span class="text-red-500">*</span>
                  </label>
                  <select id="contact-type" 
                    class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light">
                    <option value="">選択してください</option>
                    <option value="講座について">講座について</option>
                    <option value="予約について">予約について</option>
                    <option value="法人研修のご相談">法人研修のご相談</option>
                    <option value="その他">その他</option>
                  </select>
                  <p id="type-error" class="text-red-500 text-sm mt-1 hidden"></p>
                </div>

                <!-- Subject -->
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">
                    件名 <span class="text-red-500">*</span>
                    <span class="text-future-textLight text-xs ml-1">(100文字以内)</span>
                  </label>
                  <input type="text" id="contact-subject" maxlength="100"
                    class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light"
                    placeholder="お問い合わせの件名">
                  <p id="subject-error" class="text-red-500 text-sm mt-1 hidden"></p>
                  <p id="subject-count" class="text-future-textLight text-xs mt-1 text-right">0/100</p>
                </div>

                <!-- Message -->
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">
                    お問い合わせ内容 <span class="text-red-500">*</span>
                    <span class="text-future-textLight text-xs ml-1">(1000文字以内)</span>
                    <span class="text-future-textLight text-xs ml-2"><i class="fas fa-microphone text-ai-blue"></i> 音声入力対応（Chrome/Edge推奨）</span>
                  </label>
                  <div class="relative">
                    <textarea id="contact-message" rows="6" maxlength="1000"
                      class="w-full p-4 pr-14 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors resize-none bg-future-light"
                      placeholder="お問い合わせ内容をご記入ください..."></textarea>
                    <!-- 音声入力ボタン -->
                    <button type="button" id="voice-input-btn" 
                      class="absolute right-3 top-3 w-10 h-10 rounded-full bg-gradient-to-r from-ai-blue to-ai-purple text-white flex items-center justify-center hover:opacity-80 transition-all shadow-md"
                      title="音声入力">
                      <i class="fas fa-microphone"></i>
                    </button>
                    <!-- 音声認識中インジケーター -->
                    <div id="voice-indicator" class="hidden absolute right-3 top-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center animate-pulse shadow-md">
                      <i class="fas fa-microphone"></i>
                    </div>
                  </div>
                  <div class="flex justify-between items-center mt-1">
                    <p id="message-error" class="text-red-500 text-sm hidden"></p>
                    <p id="voice-status" class="text-future-textLight text-xs hidden">
                      <i class="fas fa-circle text-red-500 animate-pulse mr-1"></i>音声認識中...
                    </p>
                    <p id="message-count" class="text-future-textLight text-xs">0/1000</p>
                  </div>
                </div>

                <!-- Privacy Policy Agreement -->
                <div class="flex items-start glass rounded-2xl p-4">
                  <input type="checkbox" id="privacy-agree"
                    class="mt-1 mr-3 w-5 h-5 accent-ai-blue rounded">
                  <label for="privacy-agree" class="text-future-textLight text-sm">
                    <a href="#" class="gradient-ai-text hover:underline font-medium">プライバシーポリシー</a>に同意します <span class="text-red-500">*</span>
                  </label>
                </div>
                <p id="privacy-error" class="text-red-500 text-sm mt-1 hidden"></p>

                <!-- Submit Button -->
                <button type="submit" id="submit-btn"
                  class="btn-ai w-full gradient-ai text-white py-4 rounded-full font-bold shadow-lg flex items-center justify-center text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                  <i class="fas fa-paper-plane mr-2"></i>送信する
                </button>
              </form>

              <!-- Success Message -->
              <div id="success-message" class="hidden text-center py-12">
                <div class="w-24 h-24 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <i class="fas fa-check text-white text-4xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-future-text mb-4">送信完了</h3>
                <p class="text-future-textLight text-lg mb-8">
                  お問い合わせありがとうございます。<br>
                  <span class="font-medium text-future-text">2営業日以内に返信いたします。</span>
                </p>
                <button id="reset-btn" 
                  class="btn-ai gradient-ai text-white px-8 py-3 rounded-full font-medium shadow-lg hover:opacity-90 transition-opacity">
                  <i class="fas fa-redo mr-2"></i>新しいお問い合わせを送る
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Online Info -->
    <section class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="glass rounded-3xl p-8 text-center border border-ai-blue/20">
          <div class="w-16 h-16 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg pulse-glow">
            <i class="fas fa-globe text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-future-text mb-2">完全オンライン</h2>
          <p class="text-future-textLight max-w-lg mx-auto">
            mirAIcafeは完全オンラインで運営しています。<br>
            日本全国どこからでもご参加いただけます。
          </p>
        </div>
      </div>
    </section>

    <script>
    (function() {
      // Form elements
      const form = document.getElementById('contact-form');
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      const phoneInput = document.getElementById('contact-phone');
      const typeSelect = document.getElementById('contact-type');
      const subjectInput = document.getElementById('contact-subject');
      const messageInput = document.getElementById('contact-message');
      const privacyCheckbox = document.getElementById('privacy-agree');
      const submitBtn = document.getElementById('submit-btn');
      const successMessage = document.getElementById('success-message');
      const resetBtn = document.getElementById('reset-btn');

      // Error elements
      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const phoneError = document.getElementById('phone-error');
      const typeError = document.getElementById('type-error');
      const subjectError = document.getElementById('subject-error');
      const messageError = document.getElementById('message-error');
      const privacyError = document.getElementById('privacy-error');

      // Count elements
      const nameCount = document.getElementById('name-count');
      const subjectCount = document.getElementById('subject-count');
      const messageCount = document.getElementById('message-count');

      // Validation functions
      function showError(element, message) {
        element.textContent = message;
        element.classList.remove('hidden');
      }

      function hideError(element) {
        element.textContent = '';
        element.classList.add('hidden');
      }

      function setInputError(input, hasError) {
        if (hasError) {
          input.classList.remove('border-future-sky', 'border-green-400');
          input.classList.add('border-red-400');
        } else {
          input.classList.remove('border-red-400');
          input.classList.add('border-future-sky');
        }
      }

      function setInputValid(input) {
        input.classList.remove('border-red-400', 'border-future-sky');
        input.classList.add('border-green-400');
      }

      // Email validation regex
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      const phoneRegex = /^[0-9\\-+()\\s]+$/;

      // Real-time validation for Name
      nameInput.addEventListener('input', function() {
        const value = this.value;
        nameCount.textContent = value.length + '/50';
        
        if (value.length === 0) {
          hideError(nameError);
          setInputError(this, false);
        } else if (value.length > 50) {
          showError(nameError, 'お名前は50文字以内で入力してください');
          setInputError(this, true);
        } else {
          hideError(nameError);
          setInputValid(this);
        }
      });

      // Real-time validation for Email
      emailInput.addEventListener('input', function() {
        const value = this.value;
        
        if (value.length === 0) {
          hideError(emailError);
          setInputError(this, false);
        } else if (!emailRegex.test(value)) {
          showError(emailError, '有効なメールアドレスを入力してください');
          setInputError(this, true);
        } else {
          hideError(emailError);
          setInputValid(this);
        }
      });

      // Real-time validation for Phone (optional)
      phoneInput.addEventListener('input', function() {
        const value = this.value;
        
        if (value.length === 0) {
          hideError(phoneError);
          setInputError(this, false);
        } else if (!phoneRegex.test(value)) {
          showError(phoneError, '有効な電話番号を入力してください');
          setInputError(this, true);
        } else {
          hideError(phoneError);
          setInputValid(this);
        }
      });

      // Real-time validation for Type
      typeSelect.addEventListener('change', function() {
        const value = this.value;
        
        if (value === '') {
          hideError(typeError);
          setInputError(this, false);
        } else {
          hideError(typeError);
          setInputValid(this);
        }
      });

      // Real-time validation for Subject
      subjectInput.addEventListener('input', function() {
        const value = this.value;
        subjectCount.textContent = value.length + '/100';
        
        if (value.length === 0) {
          hideError(subjectError);
          setInputError(this, false);
        } else if (value.length > 100) {
          showError(subjectError, '件名は100文字以内で入力してください');
          setInputError(this, true);
        } else {
          hideError(subjectError);
          setInputValid(this);
        }
      });

      // Real-time validation for Message
      messageInput.addEventListener('input', function() {
        const value = this.value;
        messageCount.textContent = value.length + '/1000';
        
        if (value.length === 0) {
          hideError(messageError);
          setInputError(this, false);
        } else if (value.length > 1000) {
          showError(messageError, 'お問い合わせ内容は1000文字以内で入力してください');
          setInputError(this, true);
        } else {
          hideError(messageError);
          setInputValid(this);
        }
      });

      // Privacy checkbox change
      privacyCheckbox.addEventListener('change', function() {
        if (this.checked) {
          hideError(privacyError);
        }
      });

      // Form validation on submit
      function validateForm() {
        let isValid = true;

        // Name validation
        if (!nameInput.value.trim()) {
          showError(nameError, 'お名前は必須です');
          setInputError(nameInput, true);
          isValid = false;
        } else if (nameInput.value.length > 50) {
          showError(nameError, 'お名前は50文字以内で入力してください');
          setInputError(nameInput, true);
          isValid = false;
        }

        // Email validation
        if (!emailInput.value.trim()) {
          showError(emailError, 'メールアドレスは必須です');
          setInputError(emailInput, true);
          isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
          showError(emailError, '有効なメールアドレスを入力してください');
          setInputError(emailInput, true);
          isValid = false;
        }

        // Phone validation (optional, but check format if provided)
        if (phoneInput.value.trim() && !phoneRegex.test(phoneInput.value)) {
          showError(phoneError, '有効な電話番号を入力してください');
          setInputError(phoneInput, true);
          isValid = false;
        }

        // Type validation
        if (!typeSelect.value) {
          showError(typeError, 'お問い合わせ種別を選択してください');
          setInputError(typeSelect, true);
          isValid = false;
        }

        // Subject validation
        if (!subjectInput.value.trim()) {
          showError(subjectError, '件名は必須です');
          setInputError(subjectInput, true);
          isValid = false;
        } else if (subjectInput.value.length > 100) {
          showError(subjectError, '件名は100文字以内で入力してください');
          setInputError(subjectInput, true);
          isValid = false;
        }

        // Message validation
        if (!messageInput.value.trim()) {
          showError(messageError, 'お問い合わせ内容は必須です');
          setInputError(messageInput, true);
          isValid = false;
        } else if (messageInput.value.length > 1000) {
          showError(messageError, 'お問い合わせ内容は1000文字以内で入力してください');
          setInputError(messageInput, true);
          isValid = false;
        }

        // Privacy agreement validation
        if (!privacyCheckbox.checked) {
          showError(privacyError, 'プライバシーポリシーに同意してください');
          isValid = false;
        }

        return isValid;
      }

      // Form submission
      form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear all errors first
        hideError(nameError);
        hideError(emailError);
        hideError(phoneError);
        hideError(typeError);
        hideError(subjectError);
        hideError(messageError);
        hideError(privacyError);

        // Validate form
        if (!validateForm()) {
          return;
        }

        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';

        const data = {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim() || null,
          type: typeSelect.value,
          subject: subjectInput.value.trim(),
          message: messageInput.value.trim()
        };

        try {
          const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Show success message
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');
          } else {
            // Handle server validation errors
            if (result.errors) {
              if (result.errors.name) {
                showError(nameError, result.errors.name);
                setInputError(nameInput, true);
              }
              if (result.errors.email) {
                showError(emailError, result.errors.email);
                setInputError(emailInput, true);
              }
              if (result.errors.phone) {
                showError(phoneError, result.errors.phone);
                setInputError(phoneInput, true);
              }
              if (result.errors.type) {
                showError(typeError, result.errors.type);
                setInputError(typeSelect, true);
              }
              if (result.errors.subject) {
                showError(subjectError, result.errors.subject);
                setInputError(subjectInput, true);
              }
              if (result.errors.message) {
                showError(messageError, result.errors.message);
                setInputError(messageInput, true);
              }
            } else {
              throw new Error(result.error || '送信に失敗しました');
            }
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信する';
          }
        } catch (error) {
          alert('エラー: ' + error.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信する';
        }
      });

      // 音声入力機能
      const voiceBtn = document.getElementById('voice-input-btn');
      const voiceIndicator = document.getElementById('voice-indicator');
      const voiceStatus = document.getElementById('voice-status');
      let recognition = null;
      let isRecording = false;

      // Web Speech API対応チェック
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ja-JP';
        recognition.continuous = true;
        recognition.interimResults = true;

        let finalTranscript = '';

        recognition.onstart = function() {
          isRecording = true;
          voiceBtn.classList.add('hidden');
          voiceIndicator.classList.remove('hidden');
          voiceStatus.classList.remove('hidden');
          finalTranscript = messageInput.value;
        };

        recognition.onresult = function(event) {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          messageInput.value = finalTranscript + interimTranscript;
          messageCount.textContent = messageInput.value.length + '/1000';
          
          // バリデーション更新
          if (messageInput.value.length > 0 && messageInput.value.length <= 1000) {
            hideError(messageError);
            setInputValid(messageInput);
          }
        };

        recognition.onerror = function(event) {
          console.error('Speech recognition error:', event.error);
          stopRecording();
          if (event.error === 'not-allowed') {
            alert('マイクへのアクセスが許可されていません。ブラウザの設定でマイクを許可してください。');
          }
        };

        recognition.onend = function() {
          stopRecording();
        };

        function stopRecording() {
          isRecording = false;
          voiceBtn.classList.remove('hidden');
          voiceIndicator.classList.add('hidden');
          voiceStatus.classList.add('hidden');
        }

        voiceBtn.addEventListener('click', function() {
          if (!isRecording) {
            recognition.start();
          }
        });

        voiceIndicator.addEventListener('click', function() {
          if (isRecording) {
            recognition.stop();
          }
        });
      } else {
        // Web Speech API非対応ブラウザ
        voiceBtn.style.display = 'none';
        console.log('このブラウザは音声認識に対応していません');
      }

      // Reset form button
      resetBtn.addEventListener('click', function() {
        // Reset form
        form.reset();
        
        // Reset character counts
        nameCount.textContent = '0/50';
        subjectCount.textContent = '0/100';
        messageCount.textContent = '0/1000';

        // Reset all input styles
        [nameInput, emailInput, phoneInput, typeSelect, subjectInput, messageInput].forEach(input => {
          input.classList.remove('border-red-400', 'border-green-400');
          input.classList.add('border-future-sky');
        });

        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>送信する';

        // Show form, hide success message
        successMessage.classList.add('hidden');
        form.classList.remove('hidden');
      });
    })();
    </script>
  `

  return renderLayout('お問い合わせ', content, 'contact')
}
