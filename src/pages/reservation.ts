import { renderLayout } from '../components/layout'
import { Course, Schedule } from '../data'

export const renderReservationPage = (courses: Course[], schedules: Schedule[], selectedCourse: Course | null) => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-cafe py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl font-bold text-white mb-4">講座予約</h1>
        <p class="text-cafe-cream/90">ご希望の講座と日程を選択して予約してください</p>
      </div>
    </section>

    <!-- Reservation Section -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Calendar & Course Selection -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Step 1: Course Selection -->
            <div class="bg-white rounded-2xl p-6 shadow-md">
              <h2 class="text-xl font-bold text-cafe-darkBrown mb-4 flex items-center">
                <span class="w-8 h-8 gradient-cafe rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</span>
                講座を選択
              </h2>
              <select id="course-select" class="w-full p-4 border-2 border-cafe-cream rounded-xl text-cafe-darkBrown focus:border-cafe-caramel focus:outline-none">
                <option value="">講座を選択してください</option>
                ${courses.map(course => `
                  <option value="${course.id}" ${selectedCourse?.id === course.id ? 'selected' : ''} data-price="${course.price}">
                    ${course.title} - ¥${course.price.toLocaleString()}
                  </option>
                `).join('')}
              </select>
            </div>

            <!-- Step 2: Calendar -->
            <div class="bg-white rounded-2xl p-6 shadow-md">
              <h2 class="text-xl font-bold text-cafe-darkBrown mb-4 flex items-center">
                <span class="w-8 h-8 gradient-cafe rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</span>
                日程を選択
              </h2>
              
              <!-- Calendar Navigation -->
              <div class="flex justify-between items-center mb-4">
                <button id="prev-month" class="p-2 text-cafe-mocha hover:text-cafe-caramel">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <h3 id="calendar-month" class="text-xl font-bold text-cafe-darkBrown">2025年1月</h3>
                <button id="next-month" class="p-2 text-cafe-mocha hover:text-cafe-caramel">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              <!-- Calendar Grid -->
              <div class="grid grid-cols-7 gap-1 mb-4">
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">日</div>
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">月</div>
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">火</div>
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">水</div>
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">木</div>
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">金</div>
                <div class="text-center py-2 text-cafe-mocha text-sm font-medium">土</div>
              </div>
              <div id="calendar-grid" class="grid grid-cols-7 gap-1">
                <!-- Calendar days will be rendered by JS -->
              </div>

              <!-- Schedule List -->
              <div id="schedule-list" class="mt-6 space-y-3">
                <p class="text-cafe-mocha text-center py-4">講座を選択すると、利用可能な日程が表示されます</p>
              </div>
            </div>

            <!-- Step 3: Customer Info -->
            <div class="bg-white rounded-2xl p-6 shadow-md">
              <h2 class="text-xl font-bold text-cafe-darkBrown mb-4 flex items-center">
                <span class="w-8 h-8 gradient-cafe rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</span>
                お客様情報
              </h2>
              <form id="reservation-form" class="space-y-4">
                <div>
                  <label class="block text-cafe-mocha text-sm font-medium mb-2">お名前 <span class="text-red-500">*</span></label>
                  <input type="text" id="customer-name" required class="w-full p-3 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none" placeholder="山田 太郎">
                </div>
                <div>
                  <label class="block text-cafe-mocha text-sm font-medium mb-2">メールアドレス <span class="text-red-500">*</span></label>
                  <input type="email" id="customer-email" required class="w-full p-3 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none" placeholder="example@email.com">
                </div>
                <div>
                  <label class="block text-cafe-mocha text-sm font-medium mb-2">電話番号</label>
                  <input type="tel" id="customer-phone" class="w-full p-3 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none" placeholder="090-1234-5678">
                </div>
              </form>
            </div>
          </div>

          <!-- Booking Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-2xl p-6 shadow-md sticky top-24">
              <h2 class="text-xl font-bold text-cafe-darkBrown mb-4">
                <i class="fas fa-receipt text-cafe-caramel mr-2"></i>予約内容
              </h2>
              
              <div id="booking-summary" class="space-y-4 mb-6">
                <div class="flex justify-between text-cafe-mocha">
                  <span>講座:</span>
                  <span id="summary-course" class="font-medium text-cafe-darkBrown">未選択</span>
                </div>
                <div class="flex justify-between text-cafe-mocha">
                  <span>日程:</span>
                  <span id="summary-date" class="font-medium text-cafe-darkBrown">未選択</span>
                </div>
                <div class="flex justify-between text-cafe-mocha">
                  <span>時間:</span>
                  <span id="summary-time" class="font-medium text-cafe-darkBrown">--:-- 〜 --:--</span>
                </div>
                <div class="flex justify-between text-cafe-mocha">
                  <span>開催形式:</span>
                  <span class="font-medium text-cafe-darkBrown">オンライン</span>
                </div>
                <hr class="border-cafe-cream">
                <div class="flex justify-between">
                  <span class="text-cafe-mocha">合計金額:</span>
                  <span id="summary-price" class="text-2xl font-bold text-cafe-brown">¥0</span>
                </div>
              </div>

              <button id="checkout-btn" disabled class="btn-cafe w-full gradient-cafe text-white py-4 rounded-full font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-credit-card mr-2"></i>決済に進む
              </button>

              <p class="text-xs text-cafe-mocha text-center mt-4">
                <i class="fas fa-lock mr-1"></i>Stripeによる安全な決済
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Payment Modal -->
    <div id="payment-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div class="text-center">
          <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-credit-card text-white text-2xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-cafe-darkBrown mb-2">決済処理中</h3>
          <p class="text-cafe-mocha mb-6">Stripe決済ページに移動します...</p>
          <div class="animate-spin w-8 h-8 border-4 border-cafe-caramel border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div id="success-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
        <div class="text-center">
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-check text-white text-2xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-cafe-darkBrown mb-2">予約完了！</h3>
          <p class="text-cafe-mocha mb-6">
            ご予約ありがとうございます。<br>
            確認メールをお送りしました。
          </p>
          <a href="/" class="btn-cafe inline-flex items-center justify-center gradient-cafe text-white px-6 py-3 rounded-full font-bold">
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
      let currentMonth = new Date(2025, 0, 1); // January 2025

      // Elements
      const courseSelect = document.getElementById('course-select');
      const calendarGrid = document.getElementById('calendar-grid');
      const scheduleList = document.getElementById('schedule-list');
      const checkoutBtn = document.getElementById('checkout-btn');
      
      // Summary elements
      const summaryCourse = document.getElementById('summary-course');
      const summaryDate = document.getElementById('summary-date');
      const summaryTime = document.getElementById('summary-time');
      const summaryPrice = document.getElementById('summary-price');

      // Initialize
      if (selectedCourseId) {
        updateScheduleList();
      }
      renderCalendar();

      // Event listeners
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

        // Show payment modal
        document.getElementById('payment-modal').classList.remove('hidden');

        try {
          // Create reservation
          const resResponse = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: selectedCourseId,
              scheduleId: selectedScheduleId,
              name, email, phone
            })
          });
          const reservation = await resResponse.json();

          // Create checkout session
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
          const session = await checkoutResponse.json();

          // Simulate payment success (in production, redirect to Stripe)
          setTimeout(() => {
            document.getElementById('payment-modal').classList.add('hidden');
            document.getElementById('success-modal').classList.remove('hidden');
          }, 2000);

        } catch (error) {
          document.getElementById('payment-modal').classList.add('hidden');
          alert('エラーが発生しました: ' + error.message);
        }
      });

      // Functions
      function renderCalendar() {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        document.getElementById('calendar-month').textContent = 
          year + '年' + (month + 1) + '月';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        
        let html = '';
        
        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
          html += '<div class="p-2"></div>';
        }
        
        // Days of month
        const availableDates = getAvailableDates();
        
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
          const hasSchedule = availableDates.includes(dateStr);
          const isToday = new Date().toISOString().split('T')[0] === dateStr;
          
          let classes = 'p-2 text-center rounded-lg transition-all ';
          if (hasSchedule) {
            classes += 'bg-cafe-caramel/20 text-cafe-brown cursor-pointer hover:bg-cafe-caramel hover:text-white font-medium';
          } else {
            classes += 'text-cafe-mocha/50';
          }
          if (isToday) {
            classes += ' ring-2 ring-cafe-caramel';
          }
          
          html += '<div class="' + classes + '" data-date="' + dateStr + '">' + day + '</div>';
        }
        
        calendarGrid.innerHTML = html;

        // Add click handlers for days with schedules
        calendarGrid.querySelectorAll('[data-date]').forEach(el => {
          if (getAvailableDates().includes(el.dataset.date)) {
            el.addEventListener('click', function() {
              const date = this.dataset.date;
              highlightSchedulesForDate(date);
            });
          }
        });
      }

      function getAvailableDates() {
        return schedules
          .filter(s => !selectedCourseId || s.courseId === selectedCourseId)
          .map(s => s.date);
      }

      function updateScheduleList() {
        const filtered = schedules.filter(s => 
          !selectedCourseId || s.courseId === selectedCourseId
        );
        
        if (filtered.length === 0) {
          scheduleList.innerHTML = '<p class="text-cafe-mocha text-center py-4">利用可能な日程がありません</p>';
          return;
        }

        scheduleList.innerHTML = filtered.map(schedule => {
          const course = courses.find(c => c.id === schedule.courseId);
          const remaining = schedule.capacity - schedule.enrolled;
          const isFull = remaining <= 0;
          
          return '<div class="schedule-item p-4 border-2 border-cafe-cream rounded-xl cursor-pointer hover:border-cafe-caramel transition-all ' + 
            (isFull ? 'opacity-50 cursor-not-allowed' : '') + '" data-schedule="' + schedule.id + '" data-course="' + schedule.courseId + '">' +
            '<div class="flex justify-between items-start">' +
              '<div>' +
                '<p class="font-bold text-cafe-darkBrown">' + schedule.date + '</p>' +
                '<p class="text-cafe-mocha text-sm">' + schedule.startTime + ' 〜 ' + schedule.endTime + '</p>' +
                '<p class="text-cafe-caramel text-sm mt-1">' + course.title + '</p>' +
              '</div>' +
              '<div class="text-right">' +
                '<span class="' + (isFull ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700') + ' text-xs font-medium px-2 py-1 rounded">' +
                  (isFull ? '満席' : '残り' + remaining + '席') +
                '</span>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');

        // Add click handlers
        scheduleList.querySelectorAll('.schedule-item').forEach(el => {
          el.addEventListener('click', function() {
            if (this.classList.contains('opacity-50')) return;
            
            // Remove previous selection
            scheduleList.querySelectorAll('.schedule-item').forEach(item => {
              item.classList.remove('border-cafe-caramel', 'bg-cafe-cream/50');
            });
            
            // Select this one
            this.classList.add('border-cafe-caramel', 'bg-cafe-cream/50');
            selectedScheduleId = this.dataset.schedule;
            
            // Update course selection if needed
            if (!selectedCourseId) {
              selectedCourseId = this.dataset.course;
              courseSelect.value = selectedCourseId;
            }
            
            updateSummary();
          });
        });
      }

      function highlightSchedulesForDate(date) {
        const filtered = schedules.filter(s => s.date === date && 
          (!selectedCourseId || s.courseId === selectedCourseId));
        
        if (filtered.length > 0) {
          // Scroll to schedule list and highlight matching schedules
          scheduleList.querySelectorAll('.schedule-item').forEach(el => {
            const schedule = schedules.find(s => s.id === el.dataset.schedule);
            if (schedule && schedule.date === date) {
              el.classList.add('ring-2', 'ring-cafe-caramel');
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
              el.classList.remove('ring-2', 'ring-cafe-caramel');
            }
          });
        }
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

      // Check for success redirect
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_id')) {
        document.getElementById('success-modal').classList.remove('hidden');
      }
    </script>
  `

  return renderLayout('講座予約', content, 'reservation')
}
