import { renderLayout } from '../components/layout'

interface ConsultationPageProps {
  type?: 'ai' | 'mental';
}

export const renderConsultationPage = (props: ConsultationPageProps = {}) => {
  const { type } = props;
  
  const content = `
    <div class="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      <!-- ヘッダー -->
      <div class="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-12">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h1 class="text-3xl md:text-4xl font-bold">
            <i class="fas fa-comments mr-3"></i>個別相談予約
          </h1>
        </div>
      </div>

      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- ステップインジケーター -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center">
            <div id="step1-indicator" class="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">1</div>
            <span class="ml-2 text-sm font-medium text-pink-600">相談タイプ</span>
          </div>
          <div class="w-12 h-1 bg-gray-200 mx-2"><div id="step1-progress" class="h-full bg-pink-500 w-0 transition-all"></div></div>
          <div class="flex items-center">
            <div id="step2-indicator" class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
            <span class="ml-2 text-sm font-medium text-gray-400">日時選択</span>
          </div>
          <div class="w-12 h-1 bg-gray-200 mx-2"><div id="step2-progress" class="h-full bg-pink-500 w-0 transition-all"></div></div>
          <div class="flex items-center">
            <div id="step3-indicator" class="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
            <span class="ml-2 text-sm font-medium text-gray-400">情報入力</span>
          </div>
        </div>

        <!-- Step 1: 相談タイプ選択 -->
        <div id="step1" class="step-content">
          <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">
              <i class="fas fa-hand-pointer mr-2 text-pink-500"></i>相談タイプを選択
            </h2>
            
            <div class="grid md:grid-cols-2 gap-4 mb-6">
              <!-- AI活用相談 -->
              <div class="consultation-type-option ${type === 'ai' ? 'selected' : ''}" data-type="ai" onclick="selectType('ai')">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-robot text-3xl text-blue-500"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-lg text-gray-800">AI活用相談</h3>
                    <p class="text-sm text-gray-500">ChatGPT、Gemini、画像生成AIなど<br>AIの使い方・活用方法のご相談</p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <p class="text-sm text-gray-600"><i class="fas fa-check text-green-500 mr-2"></i>初心者の方も大歓迎</p>
                  <p class="text-sm text-gray-600"><i class="fas fa-check text-green-500 mr-2"></i>具体的な使い方をレクチャー</p>
                </div>
              </div>
              
              <!-- メンタル・キャリア相談 -->
              <div class="consultation-type-option ${type === 'mental' ? 'selected' : ''}" data-type="mental" onclick="selectType('mental')">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-heart text-3xl text-pink-500"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-bold text-lg text-gray-800">キャリア・メンタル相談</h3>
                    <p class="text-sm text-gray-500">キャリアのお悩み、メンタルケア<br>国家資格キャリコン・産業カウンセラーが対応</p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-100">
                  <p class="text-sm text-gray-600"><i class="fas fa-check text-green-500 mr-2"></i>秘密厳守</p>
                  <p class="text-sm text-gray-600"><i class="fas fa-check text-green-500 mr-2"></i>じっくりお話を伺います</p>
                </div>
              </div>
            </div>
            
            <!-- 時間選択 -->
            <h3 class="font-bold text-gray-800 mb-4 text-center">
              <i class="fas fa-clock mr-2 text-pink-500"></i>相談時間を選択
            </h3>
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="duration-option selected" data-duration="30" onclick="selectDuration(30)">
                <div class="text-2xl font-bold text-pink-600">30分</div>
                <div class="text-lg font-bold text-gray-800">¥3,000</div>
                <p class="text-xs text-gray-500 mt-1">ピンポイントでご相談</p>
              </div>
              <div class="duration-option" data-duration="60" onclick="selectDuration(60)">
                <div class="text-2xl font-bold text-pink-600">60分</div>
                <div class="text-lg font-bold text-gray-800">¥5,000</div>
                <p class="text-xs text-gray-500 mt-1">じっくりご相談</p>
              </div>
            </div>
            
            <button id="nextToStep2" onclick="goToStep2()" disabled class="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              次へ：日時を選択 <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 2: 日時選択 -->
        <div id="step2" class="step-content hidden">
          <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div class="flex items-center justify-between mb-6">
              <button onclick="goToStep1()" class="text-gray-500 hover:text-pink-500">
                <i class="fas fa-arrow-left mr-2"></i>戻る
              </button>
              <h2 class="text-xl font-bold text-gray-800">
                <i class="fas fa-calendar-alt mr-2 text-pink-500"></i>日時を選択
              </h2>
              <div class="w-16"></div>
            </div>
            
            <!-- 選択中の内容 -->
            <div id="selectedSummary" class="bg-pink-50 rounded-xl p-4 mb-6">
              <div class="flex items-center justify-between text-sm">
                <span id="summaryType" class="text-pink-700 font-medium"></span>
                <span id="summaryDuration" class="text-pink-700 font-bold"></span>
              </div>
            </div>
            
            <!-- カレンダー -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <button onclick="prevMonth()" class="p-2 hover:bg-gray-100 rounded-lg">
                  <i class="fas fa-chevron-left text-gray-600"></i>
                </button>
                <h3 id="currentMonth" class="text-lg font-bold text-gray-800"></h3>
                <button onclick="nextMonth()" class="p-2 hover:bg-gray-100 rounded-lg">
                  <i class="fas fa-chevron-right text-gray-600"></i>
                </button>
              </div>
              
              <!-- 曜日ヘッダー -->
              <div class="grid grid-cols-7 gap-1 mb-2">
                <div class="text-center text-sm font-medium text-red-400 py-2">日</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">月</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">火</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">水</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">木</div>
                <div class="text-center text-sm font-medium text-gray-500 py-2">金</div>
                <div class="text-center text-sm font-medium text-blue-400 py-2">土</div>
              </div>
              
              <!-- カレンダー本体 -->
              <div id="calendarGrid" class="grid grid-cols-7 gap-1">
                <!-- JavaScriptで生成 -->
              </div>
              
              <div id="calendarLoading" class="text-center py-8">
                <i class="fas fa-spinner fa-spin text-3xl text-pink-500 mb-2"></i>
                <p class="text-gray-500">空き状況を取得中...</p>
              </div>
            </div>
            
            <!-- 時間帯選択 -->
            <div id="timeSlotSection" class="hidden">
              <h3 class="font-bold text-gray-800 mb-4">
                <i class="fas fa-clock mr-2 text-pink-500"></i>
                <span id="selectedDateLabel"></span> の空き時間
              </h3>
              <div id="timeSlots" class="grid grid-cols-4 md:grid-cols-6 gap-2 mb-6">
                <!-- JavaScriptで生成 -->
              </div>
            </div>
            
            <button id="nextToStep3" onclick="goToStep3()" disabled class="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              次へ：情報入力 <i class="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Step 3: 情報入力 -->
        <div id="step3" class="step-content hidden">
          <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div class="flex items-center justify-between mb-6">
              <button onclick="goToStep2()" class="text-gray-500 hover:text-pink-500">
                <i class="fas fa-arrow-left mr-2"></i>戻る
              </button>
              <h2 class="text-xl font-bold text-gray-800">
                <i class="fas fa-user mr-2 text-pink-500"></i>お客様情報
              </h2>
              <div class="w-16"></div>
            </div>
            
            <!-- 予約内容確認 -->
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 mb-6">
              <h3 class="font-bold text-gray-800 mb-3"><i class="fas fa-clipboard-check mr-2 text-pink-500"></i>予約内容</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">相談タイプ</span>
                  <span id="confirmType" class="font-medium text-gray-800"></span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">日時</span>
                  <span id="confirmDateTime" class="font-medium text-gray-800"></span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">時間</span>
                  <span id="confirmDuration" class="font-medium text-gray-800"></span>
                </div>
                <div class="flex justify-between border-t border-pink-200 pt-2 mt-2">
                  <span class="text-gray-800 font-bold">料金</span>
                  <span id="confirmPrice" class="font-bold text-pink-600 text-lg"></span>
                </div>
              </div>
            </div>
            
            <!-- 入力フォーム -->
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">お名前 <span class="text-red-500">*</span></label>
                <input type="text" id="customerName" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="山田 花子">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span class="text-red-500">*</span></label>
                <input type="email" id="customerEmail" required class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="example@email.com">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">電話番号（任意）</label>
                <input type="tel" id="customerPhone" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="090-1234-5678">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ご相談内容（任意）</label>
                <textarea id="customerMessage" rows="3" class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500" placeholder="相談したい内容があればご記入ください"></textarea>
              </div>
            </div>
            
            <!-- 利用規約等のチェックボックス -->
            <div class="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" id="agreeTerms" class="mt-1 w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500">
                <span class="text-sm text-gray-700">
                  <a href="/terms" target="_blank" class="text-pink-600 underline hover:text-pink-700">利用規約</a>に同意する
                </span>
              </label>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" id="agreeCancellation" class="mt-1 w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500">
                <span class="text-sm text-gray-700">
                  <a href="/cancellation-policy" target="_blank" class="text-pink-600 underline hover:text-pink-700">キャンセルポリシー</a>に同意する
                </span>
              </label>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" id="agreeCommerce" class="mt-1 w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500">
                <span class="text-sm text-gray-700">
                  <a href="/commerce" target="_blank" class="text-pink-600 underline hover:text-pink-700">特定商取引法に基づく表記</a>を確認しました
                </span>
              </label>
            </div>
            
            <div class="bg-amber-50 rounded-xl p-4 mb-6">
              <p class="text-sm text-amber-800">
                <i class="fas fa-info-circle mr-2"></i>
                <strong>承認制について：</strong>予約申請後、担当者が確認し承認いたします。承認後に決済用URLをメールでお送りします。
              </p>
            </div>
            
            <button onclick="submitBooking()" id="submitBtn" class="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <i class="fas fa-paper-plane mr-2"></i>予約を申請する
            </button>
            <p class="text-xs text-gray-400 text-center mt-3">承認後に決済URLをメールでお送りします</p>
          </div>
        </div>
      </div>
    </div>

    <style>
      .step-content {
        animation: fadeIn 0.3s ease;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .consultation-type-option {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .consultation-type-option:hover {
        border-color: #ec4899;
        box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
      }
      
      .consultation-type-option.selected {
        border-color: #ec4899;
        background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
        box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
      }
      
      .duration-option {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .duration-option:hover {
        border-color: #ec4899;
      }
      
      .duration-option.selected {
        border-color: #ec4899;
        background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
      }
      
      .calendar-day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .calendar-day.available {
        background: #fdf2f8;
        color: #be185d;
        font-weight: 600;
      }
      
      .calendar-day.available:hover {
        background: #ec4899;
        color: white;
      }
      
      .calendar-day.selected {
        background: #ec4899;
        color: white;
      }
      
      .calendar-day.unavailable {
        color: #d1d5db;
        cursor: not-allowed;
      }
      
      .calendar-day.past {
        color: #e5e7eb;
        cursor: not-allowed;
      }
      
      .calendar-day.sunday {
        color: #fca5a5;
      }
      
      .calendar-day.saturday {
        color: #93c5fd;
      }
      
      .time-slot {
        padding: 10px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        text-align: center;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .time-slot.available {
        background: white;
        color: #374151;
      }
      
      .time-slot.available:hover {
        border-color: #ec4899;
        background: #fdf2f8;
      }
      
      .time-slot.selected {
        border-color: #ec4899;
        background: #ec4899;
        color: white;
      }
      
      .time-slot.unavailable {
        background: #f3f4f6;
        color: #d1d5db;
        cursor: not-allowed;
        text-decoration: line-through;
      }
    </style>

    <script>
      // 状態管理
      let selectedType = '${type ? type : ''}';
      let selectedDuration = 30;
      let selectedDate = null;
      let selectedTime = null;
      let calendarData = {};
      let currentYear = new Date().getFullYear();
      let currentMonth = new Date().getMonth();

      // 初期化
      document.addEventListener('DOMContentLoaded', function() {
        if (selectedType) {
          document.querySelector(\`.consultation-type-option[data-type="\${selectedType}"]\`)?.classList.add('selected');
          updateNextButton();
        }
      });

      // タイプ選択
      function selectType(type) {
        selectedType = type;
        document.querySelectorAll('.consultation-type-option').forEach(el => el.classList.remove('selected'));
        document.querySelector(\`.consultation-type-option[data-type="\${type}"]\`).classList.add('selected');
        updateNextButton();
      }

      // 時間選択
      function selectDuration(duration) {
        selectedDuration = duration;
        document.querySelectorAll('.duration-option').forEach(el => el.classList.remove('selected'));
        document.querySelector(\`.duration-option[data-duration="\${duration}"]\`).classList.add('selected');
        // 日時をリセット（時間が変わると空きも変わる可能性）
        selectedDate = null;
        selectedTime = null;
      }

      // 次へボタンの有効/無効
      function updateNextButton() {
        document.getElementById('nextToStep2').disabled = !selectedType;
      }

      // Step 2へ
      async function goToStep2() {
        if (!selectedType) return;
        
        document.getElementById('step1').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');
        
        // インジケーター更新
        document.getElementById('step1-progress').style.width = '100%';
        document.getElementById('step2-indicator').classList.remove('bg-gray-200', 'text-gray-500');
        document.getElementById('step2-indicator').classList.add('bg-pink-500', 'text-white');
        
        // サマリー更新
        const typeLabel = selectedType === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
        document.getElementById('summaryType').textContent = typeLabel;
        document.getElementById('summaryDuration').textContent = \`\${selectedDuration}分 / ¥\${selectedDuration === 30 ? '3,000' : '5,000'}\`;
        
        // カレンダー読み込み
        await loadCalendar();
      }

      // Step 1へ戻る
      function goToStep1() {
        document.getElementById('step2').classList.add('hidden');
        document.getElementById('step1').classList.remove('hidden');
        
        document.getElementById('step1-progress').style.width = '0%';
        document.getElementById('step2-indicator').classList.remove('bg-pink-500', 'text-white');
        document.getElementById('step2-indicator').classList.add('bg-gray-200', 'text-gray-500');
      }

      // Step 3へ
      function goToStep3() {
        if (!selectedDate || !selectedTime) return;
        
        document.getElementById('step2').classList.add('hidden');
        document.getElementById('step3').classList.remove('hidden');
        
        document.getElementById('step2-progress').style.width = '100%';
        document.getElementById('step3-indicator').classList.remove('bg-gray-200', 'text-gray-500');
        document.getElementById('step3-indicator').classList.add('bg-pink-500', 'text-white');
        
        // 確認内容更新
        const typeLabel = selectedType === 'ai' ? 'AI活用相談' : 'キャリア・メンタル相談';
        document.getElementById('confirmType').textContent = typeLabel;
        document.getElementById('confirmDateTime').textContent = \`\${formatDateJa(selectedDate)} \${selectedTime}〜\`;
        document.getElementById('confirmDuration').textContent = \`\${selectedDuration}分\`;
        document.getElementById('confirmPrice').textContent = \`¥\${selectedDuration === 30 ? '3,000' : '5,000'}\`;
      }

      // Step 2へ戻る
      function goToStep2Back() {
        document.getElementById('step3').classList.add('hidden');
        document.getElementById('step2').classList.remove('hidden');
        
        document.getElementById('step2-progress').style.width = '0%';
        document.getElementById('step3-indicator').classList.remove('bg-pink-500', 'text-white');
        document.getElementById('step3-indicator').classList.add('bg-gray-200', 'text-gray-500');
      }

      // カレンダー読み込み
      async function loadCalendar() {
        document.getElementById('calendarLoading').classList.remove('hidden');
        document.getElementById('calendarGrid').innerHTML = '';
        
        try {
          const res = await fetch(\`/api/consultation/available-dates?duration=\${selectedDuration}\`);
          const data = await res.json();
          
          if (data.error) throw new Error(data.error);
          
          // データを日付でマップ
          calendarData = {};
          data.dates.forEach(d => {
            calendarData[d.date] = d;
          });
          
          renderCalendar();
        } catch (error) {
          console.error('カレンダー取得エラー:', error);
          document.getElementById('calendarGrid').innerHTML = '<div class="col-span-7 text-center py-8 text-red-500">カレンダーの取得に失敗しました</div>';
        } finally {
          document.getElementById('calendarLoading').classList.add('hidden');
        }
      }

      // カレンダー描画
      function renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '';
        
        // 月ラベル更新
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        document.getElementById('currentMonth').textContent = \`\${currentYear}年 \${monthNames[currentMonth]}\`;
        
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 前月の空白
        for (let i = 0; i < startDayOfWeek; i++) {
          const emptyDiv = document.createElement('div');
          emptyDiv.className = 'calendar-day';
          grid.appendChild(emptyDiv);
        }
        
        // 日付
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const date = new Date(currentYear, currentMonth, day);
          // ローカル時間で日付文字列を生成（toISOStringはUTC変換されるため使わない）
          const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
          const dayOfWeek = date.getDay();
          const isPast = date < today;
          const isSunday = dayOfWeek === 0;
          const data = calendarData[dateStr];
          
          const dayDiv = document.createElement('div');
          dayDiv.textContent = day;
          dayDiv.className = 'calendar-day';
          
          if (isPast) {
            dayDiv.classList.add('past');
          } else if (isSunday) {
            dayDiv.classList.add('unavailable', 'sunday');
          } else if (data && data.hasSlots) {
            dayDiv.classList.add('available');
            if (dayOfWeek === 6) dayDiv.classList.add('saturday');
            dayDiv.onclick = () => selectDate(dateStr);
          } else {
            dayDiv.classList.add('unavailable');
            if (dayOfWeek === 6) dayDiv.classList.add('saturday');
          }
          
          if (selectedDate === dateStr) {
            dayDiv.classList.add('selected');
          }
          
          grid.appendChild(dayDiv);
        }
      }

      // 前月
      function prevMonth() {
        if (currentMonth === 0) {
          currentMonth = 11;
          currentYear--;
        } else {
          currentMonth--;
        }
        renderCalendar();
      }

      // 次月
      function nextMonth() {
        if (currentMonth === 11) {
          currentMonth = 0;
          currentYear++;
        } else {
          currentMonth++;
        }
        renderCalendar();
      }

      // 日付選択
      function selectDate(dateStr) {
        selectedDate = dateStr;
        selectedTime = null;
        
        // カレンダーの選択状態を更新
        document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
        
        // 時間帯を表示
        const data = calendarData[dateStr];
        if (data) {
          showTimeSlots(dateStr, data.slots);
        }
        
        document.getElementById('nextToStep3').disabled = true;
      }

      // 時間帯表示
      function showTimeSlots(dateStr, slots) {
        const section = document.getElementById('timeSlotSection');
        const container = document.getElementById('timeSlots');
        
        document.getElementById('selectedDateLabel').textContent = formatDateJa(dateStr);
        
        container.innerHTML = slots.map(slot => {
          const classes = ['time-slot', slot.available ? 'available' : 'unavailable'];
          const onclick = slot.available ? \`selectTime('\${slot.time}')\` : '';
          return \`<div class="\${classes.join(' ')}" onclick="\${onclick}">\${slot.time}</div>\`;
        }).join('');
        
        section.classList.remove('hidden');
      }

      // 時間選択
      function selectTime(time) {
        selectedTime = time;
        
        document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
        
        document.getElementById('nextToStep3').disabled = false;
      }

      // 日付フォーマット
      function formatDateJa(dateStr) {
        const date = new Date(dateStr);
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        return \`\${date.getMonth() + 1}月\${date.getDate()}日(\${weekdays[date.getDay()]})\`;
      }

      // チェックボックスの監視
      function checkAgreements() {
        const terms = document.getElementById('agreeTerms').checked;
        const cancellation = document.getElementById('agreeCancellation').checked;
        const commerce = document.getElementById('agreeCommerce').checked;
        const submitBtn = document.getElementById('submitBtn');
        
        submitBtn.disabled = !(terms && cancellation && commerce);
      }
      
      // チェックボックスにイベントリスナーを追加
      document.getElementById('agreeTerms').addEventListener('change', checkAgreements);
      document.getElementById('agreeCancellation').addEventListener('change', checkAgreements);
      document.getElementById('agreeCommerce').addEventListener('change', checkAgreements);

      // 予約申請送信
      async function submitBooking() {
        const name = document.getElementById('customerName').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const message = document.getElementById('customerMessage').value.trim();
        
        const agreeTerms = document.getElementById('agreeTerms').checked;
        const agreeCancellation = document.getElementById('agreeCancellation').checked;
        const agreeCommerce = document.getElementById('agreeCommerce').checked;
        
        if (!name || !email) {
          alert('お名前とメールアドレスは必須です');
          return;
        }
        
        if (!selectedDate || !selectedTime) {
          alert('日時を選択してください');
          return;
        }
        
        if (!agreeTerms || !agreeCancellation || !agreeCommerce) {
          alert('利用規約、キャンセルポリシー、特定商取引法に基づく表記への同意が必要です');
          return;
        }
        
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
        
        try {
          const res = await fetch('/api/consultation/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: selectedType,
              duration: selectedDuration,
              date: selectedDate,
              time: selectedTime,
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
              message: message,
              agreedToTerms: true
            })
          });
          
          const data = await res.json();
          
          if (data.success) {
            // 申請完了ページへリダイレクト
            window.location.href = '/consultation/applied?id=' + data.consultationId;
          } else {
            alert(data.error || '予約申請に失敗しました');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>予約を申請する';
          }
        } catch (error) {
          console.error('予約エラー:', error);
          alert('予約申請中にエラーが発生しました');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>予約を申請する';
        }
      }
    </script>
  `;

  return renderLayout('個別相談予約', content, '');
};
