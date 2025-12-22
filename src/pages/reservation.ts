import { renderLayout } from '../components/layout'
import { Course, Schedule } from '../data'

export const renderReservationPage = (courses: Course[], schedules: Schedule[], selectedCourse: Course | null) => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-hero relative overflow-hidden py-16">
      <div class="wave-bg opacity-50"></div>
      <div class="wave-bg wave-bg-2 opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block bg-white/70 backdrop-blur-sm text-character-orange font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas fa-calendar-alt mr-2"></i>簡単予約
        </span>
        <h1 class="font-display text-4xl font-bold text-greenhouse-text mb-4">講座予約</h1>
        <p class="text-greenhouse-textLight max-w-xl mx-auto">ご希望の講座と日程を選択して予約してください</p>
      </div>
    </section>

    <!-- Reservation Section -->
    <section class="py-12 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Calendar & Course Selection -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Step 1: Course Selection -->
            <div class="bg-white rounded-3xl p-6 shadow-md border border-greenhouse-beige">
              <h2 class="text-xl font-bold text-greenhouse-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-button rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow">1</span>
                講座を選択
              </h2>
              <select id="course-select" class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl text-greenhouse-text focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream">
                <option value="">講座を選択してください</option>
                ${courses.map(course => `
                  <option value="${course.id}" ${selectedCourse?.id === course.id ? 'selected' : ''} data-price="${course.price}">
                    ${course.title} - ¥${course.price.toLocaleString()}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Step 2: Calendar -->
            <div class="bg-white rounded-3xl p-6 shadow-md border border-greenhouse-beige">
              <h2 class="text-xl font-bold text-greenhouse-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-button-warm rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow">2</span>
                日程を選択
              </h2>
              
              <!-- Calendar Navigation -->
              <div class="flex justify-between items-center mb-4 bg-greenhouse-cream rounded-xl p-3">
                <button id="prev-month" class="p-2 text-greenhouse-textLight hover:text-character-green transition-colors rounded-lg hover:bg-white">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <h3 id="calendar-month" class="text-xl font-bold text-greenhouse-text">2025年1月</h3>
                <button id="next-month" class="p-2 text-greenhouse-textLight hover:text-character-green transition-colors rounded-lg hover:bg-white">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              <!-- Calendar Grid -->
              <div class="grid grid-cols-7 gap-1 mb-4">
                <div class="text-center py-2 text-red-400 text-sm font-medium">日</div>
                <div class="text-center py-2 text-greenhouse-textLight text-sm font-medium">月</div>
                <div class="text-center py-2 text-greenhouse-textLight text-sm font-medium">火</div>
                <div class="text-center py-2 text-greenhouse-textLight text-sm font-medium">水</div>
                <div class="text-center py-2 text-greenhouse-textLight text-sm font-medium">木</div>
                <div class="text-center py-2 text-greenhouse-textLight text-sm font-medium">金</div>
                <div class="text-center py-2 text-blue-400 text-sm font-medium">土</div>
              </div>
              <div id="calendar-grid" class="grid grid-cols-7 gap-1">
                <!-- Calendar days will be rendered by JS -->
              </div>

              <!-- Schedule List -->
              <div id="schedule-list" class="mt-6 space-y-3">
                <p class="text-greenhouse-textLight text-center py-8 bg-greenhouse-cream rounded-2xl">
                  <i class="fas fa-calendar-alt text-3xl mb-2 block text-character-green/50"></i>
                  講座を選択すると、利用可能な日程が表示されます
                </p>
              </div>
            </div>

            <!-- Step 3: Customer Info -->
            <div class="bg-white rounded-3xl p-6 shadow-md border border-greenhouse-beige">
              <h2 class="text-xl font-bold text-greenhouse-text mb-4 flex items-center">
                <span class="w-10 h-10 bg-gradient-to-br from-character-pink to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow">3</span>
                お客様情報
              </h2>
              <form id="reservation-form" class="space-y-4">
                <div>
                  <label class="block text-greenhouse-text text-sm font-medium mb-2">お名前 <span class="text-red-500">*</span></label>
                  <input type="text" id="customer-name" required class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream" placeholder="山田 太郎">
                </div>
                <div>
                  <label class="block text-greenhouse-text text-sm font-medium mb-2">メールアドレス <span class="text-red-500">*</span></label>
                  <input type="email" id="customer-email" required class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream" placeholder="example@email.com">
                </div>
                <div>
                  <label class="block text-greenhouse-text text-sm font-medium mb-2">電話番号</label>
                  <input type="tel" id="customer-phone" class="w-full p-4 border-2 border-greenhouse-beige rounded-2xl focus:border-character-green focus:outline-none transition-colors bg-greenhouse-cream" placeholder="090-1234-5678">
                </div>
              </form>
            </div>
          </div>

          <!-- Booking Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl p-6 shadow-md sticky top-24 border border-greenhouse-beige">
              <h2 class="text-xl font-bold text-greenhouse-text mb-4 flex items-center">
                <i class="fas fa-receipt text-character-green mr-2"></i>予約内容
              </h2>
              
              <div id="booking-summary" class="space-y-4 mb-6">
                <div class="flex justify-between text-greenhouse-textLight bg-greenhouse-cream rounded-xl p-3">
                  <span><i class="fas fa-book mr-2 text-character-green"></i>講座:</span>
                  <span id="summary-course" class="font-medium text-greenhouse-text">未選択</span>
                </div>
                <div class="flex justify-between text-greenhouse-textLight bg-greenhouse-cream rounded-xl p-3">
                  <span><i class="fas fa-calendar mr-2 text-character-orange"></i>日程:</span>
                  <span id="summary-date" class="font-medium text-greenhouse-text">未選択</span>
                </div>
                <div class="flex justify-between text-greenhouse-textLight bg-greenhouse-cream rounded-xl p-3">
                  <span><i class="fas fa-clock mr-2 text-character-pink"></i>時間:</span>
                  <span id="summary-time" class="font-medium text-greenhouse-text">--:-- 〜 --:--</span>
                </div>
                <div class="flex justify-between text-greenhouse-textLight bg-greenhouse-cream rounded-xl p-3">
                  <span><i class="fas fa-laptop mr-2 text-character-green"></i>形式:</span>
                  <span class="font-medium text-greenhouse-text">オンライン</span>
                </div>
                <hr class="border-greenhouse-beige">
                <div class="flex justify-between items-center bg-character-green/10 rounded-xl p-4">
                  <span class="text-greenhouse-text font-medium">合計金額:</span>
                  <span id="summary-price" class="text-3xl font-bold text-character-green">¥0</span>
                </div>
              </div>

              <button id="checkout-btn" disabled class="btn-primary w-full gradient-button text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                <i class="fas fa-credit-card mr-2"></i>決済に進む
              </button>

              <p class="text-xs text-greenhouse-textLight text-center mt-4 flex items-center justify-center">
                <i class="fas fa-lock mr-1 text-character-green"></i>Stripeによる安全な決済
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Payment Modal -->
    <div id="payment-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div class="text-center">
          <div class="w-20 h-20 gradient-button rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-credit-card text-white text-2xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-greenhouse-text mb-2">決済処理中</h3>
          <p class="text-greenhouse-textLight mb-6">Stripe決済ページに移動します...</p>
          <div class="flex justify-center">
            <div class="w-12 h-12 border-4 border-character-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div id="success-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
        <div class="text-center">
          <div class="w-20 h-20 bg-character-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-check text-white text-3xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-greenhouse-text mb-2">予約完了！</h3>
          <p class="text-greenhouse-textLight mb-6">
            ご予約ありがとうございます。<br>
            確認メールをお送りしました。
          </p>
          <a href="/" class="btn-primary inline-flex items-center justify-center gradient-button text-white px-6 py-3 rounded-full font-bold shadow-lg">
            <i class="fas fa-home mr-2"></i>トップに戻る
          </a>
        </div>
      </div>
    </div>

    <script>
      // Data
      const schedules = ${JSON.stringify(schedules)};
      const courses = ${JSON.stringify(courses)};
      
      let selectedCourseId = '${selectedCourse?.id || ''}';
      let selectedScheduleId = null;
      let currentMonth = new Date(2025, 0, 1);

      // Elements
      const courseSelect = document.getElementById('course-select');
      const calendarGrid = document.getElementById('calendar-grid');
      const scheduleList = document.getElementById('schedule-list');
      const checkoutBtn = document.getElementById('checkout-btn');
      
      const summaryCourse = document.getElementById('summary-course');
      const summaryDate = document.getElementById('summary-date');
      const summaryTime = document.getElementById('summary-time');
      const summaryPrice = document.getElementById('summary-price');

      if (selectedCourseId) {
        updateScheduleList();
      }
      renderCalendar();

      courseSelect.addEventListener('change', function() {
        selectedCourseId = this.value;
        selectedScheduleId = null;
        updateScheduleList();
        updateSummary();
        renderCalendar();
      });

      document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
      });

      document.getElementById('next-month').addEventListener('click', function() {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
      });

      checkoutBtn.addEventListener('click', async function() {
        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const phone = document.getElementById('customer-phone').value;

        if (!name || !email) {
          alert('お名前とメールアドレスは必須です');
          return;
        }

        document.getElementById('payment-modal').classList.remove('hidden');

        try {
          const resResponse = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: selectedCourseId, scheduleId: selectedScheduleId, name, email, phone })
          });
          const reservation = await resResponse.json();

          const checkoutResponse = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: selectedCourseId,
              reservationId: reservation.reservation.id,
              successUrl: window.location.origin + '/reservation',
              cancelUrl: window.location.origin + '/reservation'
            })
          });

          setTimeout(() => {
            document.getElementById('payment-modal').classList.add('hidden');
            document.getElementById('success-modal').classList.remove('hidden');
          }, 2000);
        } catch (error) {
          document.getElementById('payment-modal').classList.add('hidden');
          alert('エラーが発生しました: ' + error.message);
        }
      });

      function renderCalendar() {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        document.getElementById('calendar-month').textContent = year + '年' + (month + 1) + '月';
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        let html = '';
        for (let i = 0; i < startDay; i++) { html += '<div class="p-2"></div>'; }
        const availableDates = getAvailableDates();
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
          const hasSchedule = availableDates.includes(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          let classes = 'p-2 text-center rounded-xl transition-all text-sm ';
          if (hasSchedule) {
            classes += 'bg-character-green/20 text-character-green cursor-pointer hover:bg-character-green hover:text-white font-bold';
          } else {
            classes += 'text-greenhouse-textLight/50';
          }
          if (isToday) { classes += ' ring-2 ring-character-orange'; }
          html += '<div class="' + classes + '" data-date="' + dateStr + '">' + day + '</div>';
        }
        calendarGrid.innerHTML = html;
        calendarGrid.querySelectorAll('[data-date]').forEach(el => {
          if (getAvailableDates().includes(el.dataset.date)) {
            el.addEventListener('click', function() { highlightSchedulesForDate(this.dataset.date); });
          }
        });
      }

      function getAvailableDates() {
        return schedules.filter(s => !selectedCourseId || s.courseId === selectedCourseId).map(s => s.date);
      }

      function updateScheduleList() {
        const filtered = schedules.filter(s => !selectedCourseId || s.courseId === selectedCourseId);
        if (filtered.length === 0) {
          scheduleList.innerHTML = '<p class="text-greenhouse-textLight text-center py-8 bg-greenhouse-cream rounded-2xl">利用可能な日程がありません</p>';
          return;
        }
        scheduleList.innerHTML = filtered.map(schedule => {
          const course = courses.find(c => c.id === schedule.courseId);
          const remaining = schedule.capacity - schedule.enrolled;
          const isFull = remaining <= 0;
          return '<div class="schedule-item p-4 border-2 border-greenhouse-beige rounded-2xl cursor-pointer hover:border-character-green hover:bg-character-green/5 transition-all ' + (isFull ? 'opacity-50 cursor-not-allowed' : '') + '" data-schedule="' + schedule.id + '" data-course="' + schedule.courseId + '">' +
            '<div class="flex justify-between items-start">' +
              '<div>' +
                '<p class="font-bold text-greenhouse-text"><i class="fas fa-calendar-day mr-2 text-character-green"></i>' + schedule.date + '</p>' +
                '<p class="text-greenhouse-textLight text-sm"><i class="fas fa-clock mr-2 text-character-orange"></i>' + schedule.startTime + ' 〜 ' + schedule.endTime + '</p>' +
                '<p class="text-character-green text-sm mt-1 font-medium">' + course.title + '</p>' +
              '</div>' +
              '<div class="text-right">' +
                '<span class="' + (isFull ? 'bg-gray-200 text-gray-500' : 'bg-character-green/20 text-character-green') + ' text-xs font-bold px-3 py-1 rounded-full">' + (isFull ? '満席' : '残り' + remaining + '席') + '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
        scheduleList.querySelectorAll('.schedule-item').forEach(el => {
          el.addEventListener('click', function() {
            if (this.classList.contains('opacity-50')) return;
            scheduleList.querySelectorAll('.schedule-item').forEach(item => {
              item.classList.remove('border-character-green', 'bg-character-green/10');
            });
            this.classList.add('border-character-green', 'bg-character-green/10');
            selectedScheduleId = this.dataset.schedule;
            if (!selectedCourseId) {
              selectedCourseId = this.dataset.course;
              courseSelect.value = selectedCourseId;
            }
            updateSummary();
          });
        });
      }

      function highlightSchedulesForDate(date) {
        scheduleList.querySelectorAll('.schedule-item').forEach(el => {
          const schedule = schedules.find(s => s.id === el.dataset.schedule);
          if (schedule && schedule.date === date) {
            el.classList.add('ring-2', 'ring-character-orange');
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            el.classList.remove('ring-2', 'ring-character-orange');
          }
        });
      }

      function updateSummary() {
        const course = courses.find(c => c.id === selectedCourseId);
        const schedule = schedules.find(s => s.id === selectedScheduleId);
        summaryCourse.textContent = course ? course.title : '未選択';
        summaryDate.textContent = schedule ? schedule.date : '未選択';
        summaryTime.textContent = schedule ? schedule.startTime + ' 〜 ' + schedule.endTime : '--:-- 〜 --:--';
        summaryPrice.textContent = course ? '¥' + course.price.toLocaleString() : '¥0';
        checkoutBtn.disabled = !course || !schedule;
      }

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_id')) {
        document.getElementById('success-modal').classList.remove('hidden');
      }
    </script>
  `

  return renderLayout('講座予約', content, 'reservation')
}
