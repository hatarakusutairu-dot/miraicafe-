import { renderLayout } from '../components/layout'
import { Course, Schedule } from '../data'

export const renderReservationPage = (courses: Course[], schedules: Schedule[], selectedCourse: Course | null) => {
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
          <i class="fas fa-calendar-alt mr-2"></i>RESERVATION
        </span>
        <h1 class="text-5xl font-bold text-future-text mb-4">講座予約</h1>
        <p class="text-future-textLight text-lg max-w-xl mx-auto">
          ご希望の講座と日程を選択して予約してください
        </p>
      </div>
    </section>

    <!-- Reservation Section -->
    <section class="py-12 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Calendar & Course Selection -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Step 1 -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center text-white text-sm font-bold mr-3 shadow">1</span>
                講座を選択
              </h2>
              <!-- Hidden native select for form submission -->
              <select id="course-select" class="native-select">
                <option value="">講座を選択してください</option>
                ${courses.map(course => `
                  <option value="${course.id}" ${selectedCourse?.id === course.id ? 'selected' : ''} data-price="${course.price}">
                    ${course.title} - ¥${course.price.toLocaleString()}
                  </option>
                `).join('')}
              </select>
              
              <!-- Custom styled select -->
              <div class="custom-select" id="custom-course-select">
                <div class="custom-select-trigger">
                  <span>${selectedCourse ? `${selectedCourse.title} - ¥${selectedCourse.price.toLocaleString()}` : '講座を選択してください'}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                <div class="custom-options">
                  <div class="custom-option ${!selectedCourse ? 'selected' : ''}" data-value="">講座を選択してください</div>
                  ${courses.map(course => `
                    <div class="custom-option ${selectedCourse?.id === course.id ? 'selected' : ''}" data-value="${course.id}" data-price="${course.price}">
                      ${course.title} - ¥${course.price.toLocaleString()}
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center text-white text-sm font-bold mr-3 shadow">2</span>
                日程を選択
              </h2>
              
              <div class="flex justify-between items-center mb-4 bg-future-light rounded-xl p-3">
                <button id="prev-month" class="p-2 text-future-textLight hover:text-ai-blue transition-colors rounded-lg hover:bg-white">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <h3 id="calendar-month" class="text-xl font-bold text-future-text">2025年1月</h3>
                <button id="next-month" class="p-2 text-future-textLight hover:text-ai-blue transition-colors rounded-lg hover:bg-white">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              <div class="grid grid-cols-7 gap-1 mb-4">
                <div class="text-center py-2 text-red-400 text-sm font-medium">日</div>
                <div class="text-center py-2 text-future-textLight text-sm font-medium">月</div>
                <div class="text-center py-2 text-future-textLight text-sm font-medium">火</div>
                <div class="text-center py-2 text-future-textLight text-sm font-medium">水</div>
                <div class="text-center py-2 text-future-textLight text-sm font-medium">木</div>
                <div class="text-center py-2 text-future-textLight text-sm font-medium">金</div>
                <div class="text-center py-2 text-blue-400 text-sm font-medium">土</div>
              </div>
              <div id="calendar-grid" class="grid grid-cols-7 gap-1"></div>

              <div id="schedule-list" class="mt-6 space-y-3">
                <p class="text-future-textLight text-center py-8 bg-future-light rounded-2xl">
                  <i class="fas fa-calendar-alt text-3xl mb-2 block text-ai-blue/50"></i>
                  講座を選択すると、利用可能な日程が表示されます
                </p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center text-white text-sm font-bold mr-3 shadow">3</span>
                お客様情報
              </h2>
              <form id="reservation-form" class="space-y-4">
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">お名前 <span class="text-red-500">*</span></label>
                  <input type="text" id="customer-name" required class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light" placeholder="山田 太郎">
                </div>
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">メールアドレス <span class="text-red-500">*</span></label>
                  <input type="email" id="customer-email" required class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light" placeholder="example@email.com">
                </div>
                <div>
                  <label class="block text-future-text text-sm font-medium mb-2">電話番号</label>
                  <input type="tel" id="customer-phone" class="w-full p-4 border-2 border-future-sky rounded-2xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light" placeholder="090-1234-5678">
                </div>
              </form>
            </div>
          </div>

          <!-- Booking Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl p-6 shadow-lg sticky top-24 border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <i class="fas fa-receipt gradient-ai-text mr-2"></i>予約内容
              </h2>
              
              <div id="booking-summary" class="space-y-4 mb-6">
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-book mr-2 text-ai-cyan"></i>講座:</span>
                  <span id="summary-course" class="font-medium text-future-text">未選択</span>
                </div>
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-calendar mr-2 text-ai-blue"></i>日程:</span>
                  <span id="summary-date" class="font-medium text-future-text">未選択</span>
                </div>
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-clock mr-2 text-ai-purple"></i>時間:</span>
                  <span id="summary-time" class="font-medium text-future-text">--:-- 〜 --:--</span>
                </div>
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-laptop mr-2 text-ai-pink"></i>形式:</span>
                  <span class="font-medium text-future-text">オンライン</span>
                </div>
                <hr class="border-future-sky">
                <div class="flex justify-between items-center gradient-ai-light rounded-xl p-4">
                  <span class="text-future-text font-medium">合計金額:</span>
                  <span id="summary-price" class="text-3xl font-bold gradient-ai-text">¥0</span>
                </div>
              </div>

              <!-- 利用規約・キャンセルポリシー同意 -->
              <div class="mb-4 p-4 bg-future-light rounded-xl border border-future-sky space-y-3">
                <p class="text-sm font-medium text-future-text mb-2">
                  <i class="fas fa-file-signature mr-2 text-ai-blue"></i>ご予約にあたっての同意事項
                </p>
                
                <!-- 利用規約 -->
                <label class="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" id="terms-agree" class="mt-1 w-5 h-5 min-w-5 min-h-5 rounded border-2 border-future-sky text-ai-blue focus:ring-ai-blue cursor-pointer flex-shrink-0">
                  <span class="text-sm text-future-textLight leading-relaxed">
                    <a href="/terms" target="_blank" class="text-ai-blue hover:text-ai-purple underline font-medium transition-colors">
                      利用規約
                    </a>
                    に同意します <span class="text-red-500">*</span>
                  </span>
                </label>
                
                <!-- キャンセル・返金ポリシー -->
                <label class="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" id="cancellation-agree" class="mt-1 w-5 h-5 min-w-5 min-h-5 rounded border-2 border-future-sky text-ai-blue focus:ring-ai-blue cursor-pointer flex-shrink-0">
                  <span class="text-sm text-future-textLight leading-relaxed">
                    <a href="/cancellation-policy" target="_blank" class="text-ai-blue hover:text-ai-purple underline font-medium transition-colors">
                      キャンセル・返金ポリシー
                    </a>
                    <span class="text-future-textLight">（返金不可、日程変更は当所判断）</span>を確認し、同意します <span class="text-red-500">*</span>
                  </span>
                </label>
                
                <p id="policy-error" class="text-red-500 text-xs mt-2 hidden">
                  <i class="fas fa-exclamation-circle mr-1"></i>すべての規約への同意が必要です
                </p>
              </div>

              <button id="checkout-btn" disabled class="btn-ai w-full text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);">
                <i class="fas fa-credit-card mr-2"></i>決済に進む
              </button>

              <p class="text-xs text-future-textLight text-center mt-4 flex items-center justify-center">
                <i class="fas fa-lock mr-1 text-ai-blue"></i>Stripeによる安全な決済
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <div id="payment-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div class="text-center">
          <div class="w-20 h-20 gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg pulse-glow">
            <i class="fas fa-credit-card text-white text-2xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-future-text mb-2">決済処理中</h3>
          <p class="text-future-textLight mb-6">Stripe決済ページに移動します...</p>
          <div class="flex justify-center">
            <div class="w-12 h-12 border-4 border-ai-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="success-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div class="text-center">
          <div class="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-check text-white text-3xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-future-text mb-2">予約完了！</h3>
          <p class="text-future-textLight mb-4">ご予約ありがとうございます。<br>確認メールをお送りしました。</p>
          
          <!-- Googleカレンダー追加ボタン -->
          <div class="mb-6 p-4 bg-future-light rounded-2xl border border-future-sky">
            <p class="text-sm text-future-textLight mb-3">
              <i class="fas fa-calendar-plus mr-1 text-ai-blue"></i>予定をカレンダーに追加しましょう
            </p>
            <a id="google-calendar-link" href="#" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-ai-blue transition-all shadow-sm group">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#fff" stroke="#4285F4" stroke-width="1.5"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#4285F4" stroke-width="1.5" stroke-linecap="round"/>
                <rect x="7" y="13" width="4" height="4" rx="0.5" fill="#34A853"/>
                <rect x="13" y="13" width="4" height="4" rx="0.5" fill="#EA4335"/>
              </svg>
              <span class="font-medium text-gray-700 group-hover:text-ai-blue transition-colors">Googleカレンダーに追加</span>
            </a>
          </div>
          
          <a href="/" class="btn-ai inline-flex items-center justify-center gradient-ai text-white px-6 py-3 rounded-full font-bold shadow-lg">
            <i class="fas fa-home mr-2"></i>トップに戻る
          </a>
        </div>
      </div>
    </div>

    <script>
      const schedules = ${JSON.stringify(schedules)};
      const courses = ${JSON.stringify(courses)};
      let selectedCourseId = '${selectedCourse?.id || ''}';
      let selectedScheduleId = null;
      
      // カレンダーの初期月を最初のスケジュールの日付に合わせる
      let currentMonth;
      if (schedules.length > 0) {
        const firstScheduleDate = new Date(schedules[0].date);
        currentMonth = new Date(firstScheduleDate.getFullYear(), firstScheduleDate.getMonth(), 1);
      } else {
        currentMonth = new Date();
        currentMonth.setDate(1);
      }
      
      // URLパラメータをチェックして決済完了後の処理
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        // 決済成功 - 成功モーダルを表示
        // URLパラメータから予約情報を復元
        const returnCourseId = urlParams.get('course_id');
        const returnScheduleId = urlParams.get('schedule_id');
        if (returnCourseId) selectedCourseId = returnCourseId;
        if (returnScheduleId) selectedScheduleId = returnScheduleId;
        
        setTimeout(() => {
          document.getElementById('success-modal').classList.remove('hidden');
          // Googleカレンダーリンクを更新
          updateGoogleCalendarLink();
        }, 500);
        // URLからパラメータを削除
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('canceled') === 'true') {
        // 決済キャンセル
        alert('決済がキャンセルされました。再度お試しください。');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const courseSelect = document.getElementById('course-select');
      const calendarGrid = document.getElementById('calendar-grid');
      const scheduleList = document.getElementById('schedule-list');
      const checkoutBtn = document.getElementById('checkout-btn');
      const summaryCourse = document.getElementById('summary-course');
      const summaryDate = document.getElementById('summary-date');
      const summaryTime = document.getElementById('summary-time');
      const summaryPrice = document.getElementById('summary-price');
      const termsAgree = document.getElementById('terms-agree');
      const cancellationAgree = document.getElementById('cancellation-agree');
      const policyError = document.getElementById('policy-error');

      // Custom Select Logic
      const customSelect = document.getElementById('custom-course-select');
      const customTrigger = customSelect.querySelector('.custom-select-trigger');
      const customOptions = customSelect.querySelectorAll('.custom-option');
      
      customTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        customSelect.classList.toggle('open');
      });
      
      customOptions.forEach(option => {
        option.addEventListener('click', function() {
          const value = this.dataset.value;
          const text = this.textContent.trim();
          
          // Update display
          customTrigger.querySelector('span').textContent = text;
          
          // Update selected state
          customOptions.forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');
          
          // Update native select
          courseSelect.value = value;
          
          // Close dropdown
          customSelect.classList.remove('open');
          
          // Trigger change
          selectedCourseId = value;
          selectedScheduleId = null;
          updateScheduleList();
          updateSummary();
          renderCalendar();
        });
      });
      
      // Close on outside click
      document.addEventListener('click', function(e) {
        if (!customSelect.contains(e.target)) {
          customSelect.classList.remove('open');
        }
      });

      if (selectedCourseId) updateScheduleList();
      renderCalendar();

      // 全ての同意チェックボックスをチェック
      function areAllPoliciesAgreed() {
        return termsAgree.checked && cancellationAgree.checked;
      }

      // 規約同意チェックボックスの監視
      [termsAgree, cancellationAgree].forEach(checkbox => {
        checkbox.addEventListener('change', function() {
          policyError.classList.add('hidden');
          updateSummary();
        });
      });

      courseSelect.addEventListener('change', function() {
        selectedCourseId = this.value;
        selectedScheduleId = null;
        updateScheduleList();
        updateSummary();
        renderCalendar();
      });

      document.getElementById('prev-month').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() - 1); renderCalendar(); });
      document.getElementById('next-month').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() + 1); renderCalendar(); });

      checkoutBtn.addEventListener('click', async function() {
        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const phone = document.getElementById('customer-phone').value;
        
        // 全ての規約への同意チェック
        if (!areAllPoliciesAgreed()) {
          policyError.classList.remove('hidden');
          termsAgree.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        
        if (!name || !email) { alert('お名前とメールアドレスは必須です'); return; }
        document.getElementById('payment-modal').classList.remove('hidden');
        try {
          // 予約を作成
          const resResponse = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: selectedCourseId, scheduleId: selectedScheduleId, name, email, phone }) });
          const reservation = await resResponse.json();
          
          if (!reservation.success) {
            throw new Error(reservation.error || '予約の作成に失敗しました');
          }
          
          // Stripe Checkout Sessionを作成
          const checkoutResponse = await fetch('/api/create-checkout-session', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
              courseId: selectedCourseId, 
              reservationId: reservation.reservation.id,
              customerEmail: email,
              customerName: name,
              successUrl: window.location.origin + '/reservation?success=true&course_id=' + encodeURIComponent(selectedCourseId) + '&schedule_id=' + encodeURIComponent(selectedScheduleId), 
              cancelUrl: window.location.origin + '/reservation?canceled=true' 
            }) 
          });
          const checkoutData = await checkoutResponse.json();
          
          if (checkoutData.url) {
            // Stripe決済画面にリダイレクト
            window.location.href = checkoutData.url;
          } else if (checkoutData.demo) {
            // デモモード（Stripeキー未設定時）
            document.getElementById('payment-modal').classList.add('hidden'); 
            document.getElementById('success-modal').classList.remove('hidden');
            updateGoogleCalendarLink();
          } else {
            throw new Error('決済セッションの作成に失敗しました');
          }
        } catch (error) { 
          console.error('Checkout error:', error);
          document.getElementById('payment-modal').classList.add('hidden'); 
          alert('エラーが発生しました: ' + (error.message || '予約処理中にエラーが発生しました')); 
        }
      });

      function renderCalendar() {
        const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
        document.getElementById('calendar-month').textContent = year + '年' + (month + 1) + '月';
        const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0), startDay = firstDay.getDay();
        let html = '';
        for (let i = 0; i < startDay; i++) html += '<div class="p-2"></div>';
        const availableDates = schedules.filter(s => !selectedCourseId || s.courseId === selectedCourseId).map(s => s.date);
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
          const hasSchedule = availableDates.includes(dateStr);
          let classes = 'p-2 text-center rounded-xl transition-all text-sm ';
          classes += hasSchedule ? 'gradient-ai text-white cursor-pointer hover:opacity-80 font-bold shadow' : 'text-future-textLight/50';
          html += '<div class="' + classes + '" data-date="' + dateStr + '">' + day + '</div>';
        }
        calendarGrid.innerHTML = html;
        calendarGrid.querySelectorAll('[data-date]').forEach(el => { if (availableDates.includes(el.dataset.date)) el.addEventListener('click', function() { highlightSchedulesForDate(this.dataset.date); }); });
      }

      function updateScheduleList() {
        const filtered = schedules.filter(s => !selectedCourseId || s.courseId === selectedCourseId);
        if (filtered.length === 0) { scheduleList.innerHTML = '<p class="text-future-textLight text-center py-8 bg-future-light rounded-2xl">利用可能な日程がありません</p>'; return; }
        scheduleList.innerHTML = filtered.map(schedule => {
          const course = courses.find(c => c.id === schedule.courseId);
          const remaining = schedule.capacity - schedule.enrolled;
          const isFull = remaining <= 0;
          return '<div class="schedule-item p-4 border-2 border-future-sky rounded-2xl cursor-pointer hover:border-ai-blue hover:bg-ai-blue/5 transition-all ' + (isFull ? 'opacity-50 cursor-not-allowed' : '') + '" data-schedule="' + schedule.id + '" data-course="' + schedule.courseId + '"><div class="flex justify-between items-start"><div><p class="font-bold text-future-text"><i class="fas fa-calendar-day mr-2 text-ai-blue"></i>' + schedule.date + '</p><p class="text-future-textLight text-sm"><i class="fas fa-clock mr-2 text-ai-purple"></i>' + schedule.startTime + ' 〜 ' + schedule.endTime + '</p><p class="gradient-ai-text text-sm mt-1 font-medium">' + course.title + '</p></div><div class="text-right"><span class="' + (isFull ? 'bg-gray-200 text-gray-500' : 'gradient-ai text-white') + ' text-xs font-bold px-3 py-1 rounded-full">' + (isFull ? '満席' : '残り' + remaining + '席') + '</span></div></div></div>';
        }).join('');
        scheduleList.querySelectorAll('.schedule-item').forEach(el => {
          el.addEventListener('click', function() {
            if (this.classList.contains('opacity-50')) return;
            scheduleList.querySelectorAll('.schedule-item').forEach(item => item.classList.remove('border-ai-blue', 'bg-ai-blue/10'));
            this.classList.add('border-ai-blue', 'bg-ai-blue/10');
            selectedScheduleId = this.dataset.schedule;
            if (!selectedCourseId) { selectedCourseId = this.dataset.course; courseSelect.value = selectedCourseId; }
            updateSummary();
          });
        });
      }

      function highlightSchedulesForDate(date) {
        scheduleList.querySelectorAll('.schedule-item').forEach(el => {
          const schedule = schedules.find(s => s.id === el.dataset.schedule);
          if (schedule && schedule.date === date) { el.classList.add('ring-2', 'ring-ai-purple'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
          else el.classList.remove('ring-2', 'ring-ai-purple');
        });
      }

      function updateSummary() {
        const course = courses.find(c => c.id === selectedCourseId);
        const schedule = schedules.find(s => s.id === selectedScheduleId);
        summaryCourse.textContent = course ? course.title : '未選択';
        summaryDate.textContent = schedule ? schedule.date : '未選択';
        summaryTime.textContent = schedule ? schedule.startTime + ' 〜 ' + schedule.endTime : '--:-- 〜 --:--';
        summaryPrice.textContent = course ? '¥' + course.price.toLocaleString() : '¥0';
        // 講座・日程・全ての規約への同意が揃った場合のみ決済ボタンを有効化
        checkoutBtn.disabled = !course || !schedule || !areAllPoliciesAgreed();
      }

      // Googleカレンダー追加用URL生成関数
      function generateGoogleCalendarUrl(title, description, startDateTime, endDateTime, location) {
        const formatDateTime = (dateTime) => {
          return new Date(dateTime).toISOString().replace(/[-:]/g, '').replace(/\\.\\d{3}/, '');
        };
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: title,
          dates: formatDateTime(startDateTime) + '/' + formatDateTime(endDateTime),
          details: description,
          location: location || 'オンライン',
          trp: 'false'
        });
        return 'https://calendar.google.com/calendar/render?' + params.toString();
      }

      function updateGoogleCalendarLink() {
        const course = courses.find(c => c.id === selectedCourseId);
        const schedule = schedules.find(s => s.id === selectedScheduleId);
        const linkEl = document.getElementById('google-calendar-link');
        
        console.log('updateGoogleCalendarLink called:', { selectedCourseId, selectedScheduleId, course: !!course, schedule: !!schedule });
        
        if (!course || !schedule) {
          // 講座情報が見つからない場合でも基本的なリンクを設定
          if (linkEl) linkEl.href = 'https://calendar.google.com/calendar/render';
          return;
        }
        
        const startDateTime = schedule.date + 'T' + schedule.startTime + ':00+09:00';
        const endDateTime = schedule.date + 'T' + schedule.endTime + ':00+09:00';
        const title = '【mirAIcafe】' + course.title;
        
        // オンラインURLを含める（講座から取得）
        const onlineUrl = course.online_url || course.onlineUrl || '';
        let description = '📚 mirAIcafe AI講座\\n\\n';
        description += '講座名: ' + course.title + '\\n';
        description += '日時: ' + schedule.date + ' ' + schedule.startTime + '〜' + schedule.endTime + '\\n';
        if (onlineUrl) {
          description += '\\n🔗 参加URL: ' + onlineUrl + '\\n';
        }
        description += '\\n主催: mirAIcafe\\nhttps://miraicafe.work';
        
        const location = onlineUrl || 'オンライン';
        const calendarUrl = generateGoogleCalendarUrl(title, description, startDateTime, endDateTime, location);
        if (linkEl) linkEl.href = calendarUrl;
        console.log('Calendar URL set:', calendarUrl);
      }

      if (new URLSearchParams(window.location.search).get('session_id')) {
        document.getElementById('success-modal').classList.remove('hidden');
        updateGoogleCalendarLink();
      }
    </script>
  `

  return renderLayout('講座予約', content, 'reservation')
}
