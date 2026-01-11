import { renderLayout } from '../components/layout'
import { Course, Schedule } from '../data'

// 開催期の型定義
interface TermSchedule {
  id: number
  course_id: string
  course_title: string
  session_number: number
  date: string
  start_time: string
  end_time?: string
}

interface CourseTerm {
  id: string
  series_id: string
  name: string
  start_date: string
  end_date: string
  status: string
  max_capacity: number
  enrolled: number
  schedule_count: number
  schedules: TermSchedule[]
}

// コースシリーズ情報の型定義
interface SeriesInfo {
  id: string
  title: string
  total_sessions: number
  calc_single_price_incl: number
  calc_course_price_incl: number
  calc_early_price_incl: number
  calc_monthly_price_incl: number
  calc_savings_course: number
  calc_savings_early: number
  early_bird_deadline?: string
  course_discount_rate?: number
  early_bird_discount_rate?: number
  has_monthly_option?: number
  linkedCourses?: { id: string; title: string; session_number: number }[]
  terms?: CourseTerm[]
}

export const renderReservationPage = (
  courses: Course[], 
  schedules: Schedule[], 
  selectedCourse: Course | null,
  seriesInfo?: SeriesInfo | null,
  pricingType?: string
) => {
  // 価格タイプに応じた金額を計算
  const getPriceForType = (type: string, course: Course | null, series: SeriesInfo | null): number => {
    if (!series) return course?.price || 0
    switch (type) {
      case 'course': return series.calc_course_price_incl
      case 'early': return series.calc_early_price_incl
      case 'monthly': return series.calc_monthly_price_incl
      default: return series.calc_single_price_incl
    }
  }
  
  const getPriceLabel = (type: string, series: SeriesInfo | null): string => {
    if (!series) return '単発受講'
    switch (type) {
      case 'course': return `コース一括（全${series.total_sessions}回）`
      case 'early': return `早期申込（全${series.total_sessions}回）`
      case 'monthly': return `月額払い（${series.total_sessions}回分割）`
      default: return '単発受講'
    }
  }
  
  const selectedPrice = getPriceForType(pricingType || 'single', selectedCourse, seriesInfo || null)
  const priceLabel = getPriceLabel(pricingType || 'single', seriesInfo || null)
  const content = `
    <!-- Page Header -->
    <section class="relative py-12 sm:py-20 overflow-hidden">
      <div class="absolute inset-0 gradient-ai-light"></div>
      <div class="absolute inset-0">
        <div class="orb orb-1 opacity-30"></div>
        <div class="orb orb-2 opacity-20"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 戻るボタン -->
        <a href="/courses" class="inline-flex items-center text-future-textLight hover:text-ai-blue transition-colors mb-4 sm:mb-6 py-2">
          <i class="fas fa-arrow-left mr-2"></i>
          <span class="text-sm sm:text-base">講座一覧に戻る</span>
        </a>
        <div class="text-center">
          <span class="inline-flex items-center gradient-ai text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-calendar-alt mr-2"></i>RESERVATION
          </span>
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-future-text mb-3 sm:mb-4">講座予約</h1>
          <p class="text-future-textLight text-base sm:text-lg max-w-xl mx-auto">
            ご希望の講座と日程を選択して予約してください
          </p>
        </div>
      </div>
    </section>

    <!-- Reservation Section -->
    <section class="py-12 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Calendar & Course Selection -->
          <div class="lg:col-span-2 space-y-8">
            ${seriesInfo && pricingType !== 'single' ? `
            <!-- シリーズ一括予約の場合: 開催期選択 -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-ai-purple/30">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 bg-ai-purple rounded-xl flex items-center justify-center text-white text-sm font-bold mr-3 shadow">1</span>
                開催期を選択
              </h2>
              
              <div class="bg-gradient-to-r from-ai-purple/10 to-ai-blue/10 rounded-2xl p-4 mb-4">
                <h3 class="font-bold text-future-text mb-2">${seriesInfo.title}</h3>
                <div class="flex flex-wrap gap-3 text-sm text-future-textLight">
                  <span><i class="fas fa-layer-group mr-1 text-ai-purple"></i>全${seriesInfo.total_sessions}回</span>
                  <span><i class="fas fa-tag mr-1 text-ai-blue"></i>${priceLabel}</span>
                  <span class="font-bold text-ai-purple">¥${selectedPrice.toLocaleString()}(税込)</span>
                </div>
              </div>
              
              ${seriesInfo.terms && seriesInfo.terms.length > 0 ? `
              <!-- 開催期選択 -->
              <div class="space-y-4 mb-6">
                ${seriesInfo.terms.map((term, termIdx) => {
                  const isAvailable = term.enrolled < term.max_capacity
                  const remainingSeats = term.max_capacity - term.enrolled
                  
                  return `
                  <label class="block cursor-pointer term-option" data-term-id="${term.id}">
                    <input type="radio" name="selected_term" value="${term.id}" class="hidden" ${termIdx === 0 ? 'checked' : ''} ${!isAvailable ? 'disabled' : ''}>
                    <div class="border-2 ${termIdx === 0 ? 'border-ai-purple bg-ai-purple/5' : 'border-future-sky'} rounded-2xl p-4 hover:border-ai-purple transition ${!isAvailable ? 'opacity-50' : ''}">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center">
                          <div class="w-5 h-5 border-2 ${termIdx === 0 ? 'border-ai-purple' : 'border-future-sky'} rounded-full mr-3 flex items-center justify-center term-radio">
                            <div class="w-2.5 h-2.5 bg-ai-purple rounded-full ${termIdx === 0 ? '' : 'opacity-0'} term-dot"></div>
                          </div>
                          <span class="font-bold text-future-text">${term.name}</span>
                        </div>
                        ${isAvailable ? `
                          <span class="text-xs ${remainingSeats <= 3 ? 'text-red-500' : 'text-nature-forest'} font-medium">
                            <i class="fas fa-user-friends mr-1"></i>残り${remainingSeats}席
                          </span>
                        ` : `
                          <span class="text-xs text-red-500 font-medium">
                            <i class="fas fa-ban mr-1"></i>満席
                          </span>
                        `}
                      </div>
                      
                      <!-- この期の全日程 -->
                      <div class="space-y-2 max-h-80 overflow-y-auto">
                        ${term.schedules.map((sch, idx) => {
                          return `
                          <div class="p-3 bg-future-light/50 rounded-lg text-sm">
                            <div class="flex items-start">
                              <span class="w-6 h-6 bg-ai-blue/80 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                ${sch.session_number}
                              </span>
                              <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                  <div>
                                    <span class="text-future-text font-medium">
                                      ${new Date(sch.date).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric', weekday: 'short'})}
                                    </span>
                                    <span class="text-ai-blue ml-2">${sch.start_time}〜</span>
                                  </div>
                                </div>
                                <p class="text-xs text-future-textLight truncate">${sch.course_title || ''}</p>
                              </div>
                            </div>
                          </div>
                          `
                        }).join('')}
                      </div>
                    </div>
                  </label>
                  `
                }).join('')}
              </div>
              ` : `
              <div class="text-center py-8 bg-future-light rounded-2xl">
                <i class="fas fa-calendar-times text-4xl text-future-textLight mb-3"></i>
                <p class="text-future-textLight">現在予約可能な開催期がありません</p>
                <a href="/contact" class="text-ai-blue hover:text-ai-purple mt-2 inline-block">
                  <i class="fas fa-bell mr-1"></i>次回開催の通知を受け取る
                </a>
              </div>
              `}
              
              <input type="hidden" id="course-select" value="${seriesInfo.linkedCourses?.[0]?.id || ''}">
              <input type="hidden" id="series-id" value="${seriesInfo.id}">
              <input type="hidden" id="pricing-type" value="${pricingType}">
              <input type="hidden" id="selected-term-id" value="${seriesInfo.terms?.[0]?.id || ''}">
            </div>
            ` : seriesInfo && pricingType === 'single' ? `
            <!-- シリーズ単発参加: 全セッション一覧から選択 -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-ai-purple/30">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 bg-ai-purple rounded-xl flex items-center justify-center text-white text-sm font-bold mr-3 shadow">1</span>
                受講する回を選択
              </h2>
              
              <div class="bg-gradient-to-r from-ai-purple/10 to-ai-blue/10 rounded-2xl p-4 mb-4">
                <h3 class="font-bold text-future-text mb-2">${seriesInfo.title}</h3>
                <div class="flex flex-wrap gap-3 text-sm text-future-textLight">
                  <span><i class="fas fa-layer-group mr-1 text-ai-purple"></i>全${seriesInfo.total_sessions}回シリーズ</span>
                  <span><i class="fas fa-ticket-alt mr-1 text-ai-blue"></i>単発参加</span>
                </div>
                <p class="text-xs text-future-textLight mt-2">
                  <i class="fas fa-info-circle mr-1"></i>受講したい回を選択してください。各回単独でのご参加が可能です。
                </p>
              </div>
              
              ${seriesInfo.terms && seriesInfo.terms.length > 0 ? `
              <!-- 開催期選択（1つの場合は非表示） -->
              ${seriesInfo.terms.length > 1 ? `
              <div class="mb-4">
                <label class="block text-sm font-medium text-future-text mb-2">
                  <i class="fas fa-calendar-alt mr-1 text-ai-blue"></i>開催期を選択
                </label>
                <select id="single-term-select" class="w-full p-3 border-2 border-future-sky rounded-xl focus:border-ai-blue focus:outline-none transition-colors bg-future-light">
                  ${seriesInfo.terms.map((term: CourseTerm, idx: number) => `
                    <option value="${term.id}" ${idx === 0 ? 'selected' : ''}>${term.name}</option>
                  `).join('')}
                </select>
              </div>
              ` : `
              <input type="hidden" id="single-term-select" value="${seriesInfo.terms[0]?.id || ''}">
              `}
              
              <!-- セッション一覧 -->
              <div class="space-y-3" id="session-list">
                ${seriesInfo.terms[0]?.schedules?.map((sch: TermSchedule, idx: number) => {
                  const sessionCourse = courses.find((c: Course) => c.id === sch.course_id)
                  const sessionPrice = sessionCourse?.price || seriesInfo.calc_single_price_incl || 0
                  const scheduleDate = sch.date ? new Date(sch.date) : null
                  const dateStr = scheduleDate ? scheduleDate.toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric', weekday: 'short'}) : '日程未定'
                  
                  return `
                  <div class="session-item p-4 border-2 border-future-sky rounded-2xl cursor-pointer hover:border-ai-purple hover:bg-ai-purple/5 transition-all" 
                       data-course-id="${sch.course_id}" 
                       data-schedule-id="${sch.id}"
                       data-session-number="${sch.session_number}"
                       data-price="${sessionPrice}">
                    <div class="flex items-start gap-3">
                      <div class="w-10 h-10 bg-ai-blue/80 text-white text-sm font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        ${sch.session_number}
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-future-text text-sm mb-1 line-clamp-2">${sch.course_title || `第${sch.session_number}回`}</h4>
                        <div class="flex flex-wrap gap-2 text-xs text-future-textLight">
                          <span class="flex items-center">
                            <i class="fas fa-calendar-day mr-1 text-ai-blue"></i>${dateStr}
                          </span>
                          <span class="flex items-center">
                            <i class="fas fa-clock mr-1 text-ai-purple"></i>${sch.start_time}〜${sch.end_time || ''}
                          </span>
                        </div>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <span class="text-ai-purple font-bold">¥${sessionPrice.toLocaleString()}</span>
                        <div class="w-5 h-5 border-2 border-future-sky rounded-full mt-2 flex items-center justify-center session-radio">
                          <div class="w-2.5 h-2.5 bg-ai-purple rounded-full opacity-0 session-dot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  `
                }).join('') || '<p class="text-center text-future-textLight py-4">日程情報がありません</p>'}
              </div>
              ` : `
              <div class="text-center py-8 bg-future-light rounded-2xl">
                <i class="fas fa-calendar-times text-4xl text-future-textLight mb-3"></i>
                <p class="text-future-textLight">現在予約可能な開催期がありません</p>
              </div>
              `}
              
              <input type="hidden" id="course-select" value="">
              <input type="hidden" id="series-id" value="${seriesInfo.id}">
              <input type="hidden" id="pricing-type" value="single">
              <input type="hidden" id="selected-term-id" value="${seriesInfo.terms?.[0]?.id || ''}">
              <input type="hidden" id="selected-schedule-id" value="">
              <input type="hidden" id="selected-price" value="${seriesInfo.calc_single_price_incl || 0}">
            </div>
            ` : `
            <!-- 通常の単発予約の場合: 講座選択 -->
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
            `}

            ${seriesInfo && pricingType !== 'single' ? `
            <!-- シリーズ予約: 日程は上で確認済み、Step 2は入力へ -->
            ` : seriesInfo && pricingType === 'single' ? `
            <!-- シリーズ単発参加: セッション選択で日程も選択済み -->
            ` : `
            <!-- 通常の単発予約: 日程選択 -->
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
            `}

            <!-- お客様情報入力 -->
            <div class="bg-white rounded-3xl p-6 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center text-white text-sm font-bold mr-3 shadow">${seriesInfo ? '2' : '3'}</span>
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
              
              ${seriesInfo && pricingType !== 'single' ? `
              <!-- シリーズ一括予約の場合のサマリー -->
              <div class="mb-4 p-3 bg-ai-purple/10 rounded-xl border border-ai-purple/20">
                <div class="flex items-center text-ai-purple text-sm font-medium">
                  <i class="fas fa-layer-group mr-2"></i>
                  <span>${seriesInfo.title}</span>
                </div>
                <p class="text-xs text-future-textLight mt-1">全${seriesInfo.total_sessions}回コース</p>
              </div>
              
              <div id="booking-summary" class="space-y-4 mb-6">
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-tag mr-2 text-ai-purple"></i>プラン:</span>
                  <span id="summary-plan" class="font-medium text-future-text">${priceLabel}</span>
                </div>
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-calendar-alt mr-2 text-ai-blue"></i>開催期:</span>
                  <span id="summary-term" class="font-medium text-future-text">${seriesInfo.terms?.[0]?.name || '未選択'}</span>
                </div>
                <div class="bg-future-light rounded-xl p-3">
                  <div class="flex items-center text-future-textLight text-sm mb-2">
                    <i class="fas fa-list-ol mr-2 text-ai-blue"></i>全${seriesInfo.total_sessions}回の日程:
                  </div>
                  <div id="summary-schedules" class="space-y-1 text-xs max-h-32 overflow-y-auto">
                    ${seriesInfo.terms?.[0]?.schedules?.map((sch, idx) => `
                      <div class="flex justify-between py-1 border-b border-future-sky/30 last:border-0">
                        <span class="text-ai-blue">第${sch.session_number}回</span>
                        <span class="text-future-text">${new Date(sch.date).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric', weekday: 'short'})} ${sch.start_time}〜</span>
                      </div>
                    `).join('') || '<div class="text-future-textLight">日程情報なし</div>'}
                  </div>
                </div>
              ` : `
              ${seriesInfo ? `
              <!-- シリーズ単発参加の場合 -->
              <div class="mb-4 p-3 bg-ai-purple/10 rounded-xl border border-ai-purple/20">
                <div class="flex items-center text-ai-purple text-sm font-medium">
                  <i class="fas fa-layer-group mr-2"></i>
                  <span>${seriesInfo.title}</span>
                </div>
                <p class="text-xs text-future-textLight mt-1">単発参加</p>
              </div>
              ` : ''}
              
              <div id="booking-summary" class="space-y-4 mb-6">
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-book mr-2 text-ai-cyan"></i>講座:</span>
                  <span id="summary-course" class="font-medium text-future-text text-right text-sm max-w-[60%] truncate">${selectedCourse ? selectedCourse.title : '未選択'}</span>
                </div>
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-calendar mr-2 text-ai-blue"></i>日程:</span>
                  <span id="summary-date" class="font-medium text-future-text">未選択</span>
                </div>
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-clock mr-2 text-ai-purple"></i>時間:</span>
                  <span id="summary-time" class="font-medium text-future-text">--:-- 〜 --:--</span>
                </div>
              `}
                <div class="flex justify-between text-future-textLight bg-future-light rounded-xl p-3">
                  <span><i class="fas fa-laptop mr-2 text-ai-pink"></i>形式:</span>
                  <span class="font-medium text-future-text">オンライン</span>
                </div>
                <hr class="border-future-sky">
                <div class="flex justify-between items-center gradient-ai-light rounded-xl p-4">
                  <span class="text-future-text font-medium">合計金額:</span>
                  <div class="text-right">
                    <span id="summary-price" class="text-3xl font-bold gradient-ai-text">¥${selectedPrice.toLocaleString()}</span>
                    ${seriesInfo && (pricingType === 'course' || pricingType === 'early') ? `
                    <p class="text-xs text-nature-forest">¥${pricingType === 'early' ? seriesInfo.calc_savings_early.toLocaleString() : seriesInfo.calc_savings_course.toLocaleString()}お得</p>
                    ` : ''}
                    <!-- 月額払いは現在無効化 -->
                  </div>
                </div>
              </div>
              
              <!-- Hidden fields for form submission -->
              <input type="hidden" id="series-id" value="${seriesInfo?.id || ''}">
              <input type="hidden" id="pricing-type" value="${pricingType || 'single'}">
              <input type="hidden" id="selected-price" value="${selectedPrice}">

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
                <i id="checkout-btn-icon" class="fas fa-credit-card mr-2"></i><span id="checkout-btn-text">決済に進む</span>
              </button>

              <p id="payment-notice" class="text-xs text-future-textLight text-center mt-4 flex items-center justify-center">
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
      <div class="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="text-center">
          <div class="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i class="fas fa-check text-white text-3xl"></i>
          </div>
          <h3 class="text-2xl font-bold text-future-text mb-2">予約完了！</h3>
          <p class="text-future-textLight mb-4">ご予約ありがとうございます。<br>確認メールをお送りしました。</p>
          
          <!-- カレンダー追加ページへの案内 -->
          <div class="mb-6 p-4 bg-future-light rounded-2xl border border-ai-blue/30">
            <p class="text-sm text-future-textLight mb-3">
              <i class="fas fa-calendar-plus mr-1 text-ai-blue"></i>講座の日程をGoogleカレンダーに追加できます
            </p>
            <a id="calendar-page-link" href="#" 
               class="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-ai-blue text-white rounded-xl hover:bg-ai-blue/90 transition-all shadow-sm">
              <i class="fas fa-calendar-alt"></i>
              <span class="font-medium">カレンダー追加ページへ</span>
            </a>
            <p class="text-xs text-future-textLight mt-2">
              ※このページでオンライン参加URLも確認できます
            </p>
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
      
      // URLパラメータをチェック
      const urlParams = new URLSearchParams(window.location.search);
      
      // URLパラメータからschedule_idを取得（講座ページからの遷移時）
      const urlScheduleId = urlParams.get('schedule');
      if (urlScheduleId) {
        selectedScheduleId = urlScheduleId;
        // スケジュールに対応する講座IDも設定
        const matchingSchedule = schedules.find(s => s.id === urlScheduleId);
        if (matchingSchedule && !selectedCourseId) {
          selectedCourseId = matchingSchedule.courseId;
        }
      }
      
      // カレンダーの初期月を選択されたスケジュールまたは最初のスケジュールの日付に合わせる
      let currentMonth;
      const selectedSchedule = selectedScheduleId ? schedules.find(s => s.id === selectedScheduleId) : null;
      if (selectedSchedule) {
        const selectedDate = new Date(selectedSchedule.date);
        currentMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      } else if (schedules.length > 0) {
        const firstScheduleDate = new Date(schedules[0].date);
        currentMonth = new Date(firstScheduleDate.getFullYear(), firstScheduleDate.getMonth(), 1);
      } else {
        currentMonth = new Date();
        currentMonth.setDate(1);
      }
      
      // 決済完了後の処理
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

      // Custom Select Logic (単発予約の場合のみ)
      const customSelect = document.getElementById('custom-course-select');
      if (customSelect) {
        const customTrigger = customSelect.querySelector('.custom-select-trigger');
        const customOptions = customSelect.querySelectorAll('.custom-option');
        
        if (customTrigger) {
          customTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            customSelect.classList.toggle('open');
          });
        }
        
        customOptions.forEach(option => {
          option.addEventListener('click', function() {
            const value = this.dataset.value;
            const text = this.textContent.trim();
            
            // Update display
            if (customTrigger) customTrigger.querySelector('span').textContent = text;
            
            // Update selected state
            customOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update native select
            if (courseSelect) courseSelect.value = value;
            
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
      }

      if (selectedCourseId) updateScheduleList();
      renderCalendar();

      // 開催期選択ロジック（シリーズ一括予約の場合）
      const termOptions = document.querySelectorAll('.term-option');
      const selectedTermIdInput = document.getElementById('selected-term-id');
      
      termOptions.forEach(option => {
        option.addEventListener('click', function() {
          const radio = this.querySelector('input[type="radio"]');
          if (radio.disabled) return;
          
          // 全ての選択をリセット
          termOptions.forEach(opt => {
            opt.querySelector('input[type="radio"]').checked = false;
            opt.querySelector('.term-radio').classList.remove('border-ai-purple');
            opt.querySelector('.term-radio').classList.add('border-future-sky');
            opt.querySelector('.term-dot').classList.add('opacity-0');
            opt.closest('label').querySelector('div').classList.remove('border-ai-purple', 'bg-ai-purple/5');
            opt.closest('label').querySelector('div').classList.add('border-future-sky');
          });
          
          // この選択を有効化
          radio.checked = true;
          this.querySelector('.term-radio').classList.add('border-ai-purple');
          this.querySelector('.term-radio').classList.remove('border-future-sky');
          this.querySelector('.term-dot').classList.remove('opacity-0');
          this.querySelector('div').classList.add('border-ai-purple', 'bg-ai-purple/5');
          this.querySelector('div').classList.remove('border-future-sky');
          
          // hidden inputを更新
          if (selectedTermIdInput) {
            selectedTermIdInput.value = this.dataset.termId;
          }
          
          // サマリーを更新
          updateSummary();
        });
      });

      // シリーズ単発参加: セッション選択ロジック
      const sessionItems = document.querySelectorAll('.session-item');
      const selectedScheduleIdInput = document.getElementById('selected-schedule-id');
      let selectedSessionNumber = null;
      
      sessionItems.forEach(item => {
        item.addEventListener('click', function() {
          // 全ての選択をリセット
          sessionItems.forEach(si => {
            si.classList.remove('border-ai-purple', 'bg-ai-purple/5');
            si.classList.add('border-future-sky');
            const dot = si.querySelector('.session-dot');
            if (dot) dot.classList.add('opacity-0');
            const radio = si.querySelector('.session-radio');
            if (radio) radio.classList.remove('border-ai-purple');
          });
          
          // この選択を有効化
          this.classList.add('border-ai-purple', 'bg-ai-purple/5');
          this.classList.remove('border-future-sky');
          const dot = this.querySelector('.session-dot');
          if (dot) dot.classList.remove('opacity-0');
          const radio = this.querySelector('.session-radio');
          if (radio) radio.classList.add('border-ai-purple');
          
          // 選択値を更新
          selectedCourseId = this.dataset.courseId;
          selectedScheduleId = this.dataset.scheduleId;
          selectedSessionNumber = this.dataset.sessionNumber;
          const sessionPrice = parseInt(this.dataset.price) || 0;
          
          // hidden inputsを更新
          const courseSelectEl = document.getElementById('course-select');
          if (courseSelectEl) courseSelectEl.value = selectedCourseId;
          if (selectedScheduleIdInput) selectedScheduleIdInput.value = selectedScheduleId;
          
          // 価格も更新
          const selectedPriceEl = document.getElementById('selected-price');
          if (selectedPriceEl) selectedPriceEl.value = sessionPrice.toString();
          
          // サマリーを更新
          updateSummary();
        });
      });

      // 全ての同意チェックボックスをチェック
      function areAllPoliciesAgreed() {
        return (termsAgree && termsAgree.checked) && (cancellationAgree && cancellationAgree.checked);
      }

      // 規約同意チェックボックスの監視
      [termsAgree, cancellationAgree].forEach(checkbox => {
        if (checkbox) {
          checkbox.addEventListener('change', function() {
            if (policyError) policyError.classList.add('hidden');
            updateSummary();
          });
        }
      });

      if (courseSelect) {
        courseSelect.addEventListener('change', function() {
          selectedCourseId = this.value;
          selectedScheduleId = null;
          updateScheduleList();
          updateSummary();
          renderCalendar();
        });
      }

      const prevMonthBtn = document.getElementById('prev-month');
      const nextMonthBtn = document.getElementById('next-month');
      if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() - 1); renderCalendar(); });
      if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() + 1); renderCalendar(); });

      // 初期化時にサマリー更新（シリーズ予約の場合はボタンを有効化）
      updateSummary();

      if (checkoutBtn) checkoutBtn.addEventListener('click', async function() {
        const name = document.getElementById('customer-name').value;
        const email = document.getElementById('customer-email').value;
        const phone = document.getElementById('customer-phone').value;
        const course = courses.find(c => c.id === selectedCourseId);
        
        // 全ての規約への同意チェック
        if (!areAllPoliciesAgreed()) {
          if (policyError) policyError.classList.remove('hidden');
          if (termsAgree) termsAgree.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        
        if (!name || !email) { alert('お名前とメールアドレスは必須です'); return; }
        
        // 重複予約チェック
        var seriesIdEl = document.getElementById('series-id');
        var pricingTypeEl = document.getElementById('pricing-type');
        var selectedTermIdEl = document.getElementById('selected-term-id');
        var seriesId = seriesIdEl ? seriesIdEl.value : '';
        var pricingType = pricingTypeEl ? pricingTypeEl.value : 'single';
        var termId = selectedTermIdEl ? selectedTermIdEl.value : '';
        
        try {
          const dupCheckResponse = await fetch('/api/check-duplicate-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              seriesId: seriesId,
              termId: termId,
              courseId: selectedCourseId,
              scheduleId: selectedScheduleId,
              pricingType: pricingType
            })
          });
          const dupCheckData = await dupCheckResponse.json();
          
          if (dupCheckData.isDuplicate) {
            const confirmProceed = confirm(
              '⚠️ 重複予約の可能性があります\\n\\n' +
              dupCheckData.existingBooking.message + '\\n\\n' +
              '既に予約済みの場合、再度決済すると二重課金になります。\\n' +
              '本当に続行しますか？'
            );
            if (!confirmProceed) {
              return;
            }
          }
        } catch (dupError) {
          console.error('Duplicate check error:', dupError);
          // エラーが発生しても続行を許可（ユーザー体験を損なわないため）
        }
        
        document.getElementById('payment-modal').classList.remove('hidden');
        
        // 無料講座の場合はモーダルテキストを変更
        if (course && course.price === 0) {
          document.querySelector('#payment-modal h3').textContent = '予約処理中';
          document.querySelector('#payment-modal p').textContent = '予約を確定しています...';
        }
        
        try {
          // シリーズ一括予約かどうかを判定（変数は重複チェック時に既に取得済み）
          var selectedPriceEl = document.getElementById('selected-price');
          var isSeriesBooking = seriesId && termId && pricingType !== 'single';
          var paymentPrice = selectedPriceEl ? parseInt(selectedPriceEl.value) : (course ? course.price : 0);
          
          // 無料講座の場合のみ予約を直接作成
          var effectivePrice = isSeriesBooking ? paymentPrice : (course ? course.price : 0);
          if (effectivePrice === 0) {
            // 無料の場合は予約を作成
            const resResponse = await fetch('/api/reservations', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ 
                courseId: selectedCourseId, 
                scheduleId: selectedScheduleId, 
                seriesId: seriesId,
                termId: termId,
                pricingType: pricingType,
                name, 
                email, 
                phone 
              }) 
            });
            const reservation = await resResponse.json();
            
            if (!reservation.success) {
              throw new Error(reservation.error || '予約の作成に失敗しました');
            }
            
            document.getElementById('payment-modal').classList.add('hidden'); 
            document.getElementById('success-modal').classList.remove('hidden');
            // カレンダー追加ページへのリンクを設定
            var calendarPageLink = document.getElementById('calendar-page-link');
            if (calendarPageLink) {
              var bookingId = reservation.reservation.id;
              calendarPageLink.href = '/calendar/' + encodeURIComponent(bookingId);
            }
            return;
          }
          
          // 有料の場合はStripe決済セッションを作成（予約はWebhookで作成）
          const checkoutResponse = await fetch('/api/create-checkout-session', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
              courseId: selectedCourseId,
              scheduleId: selectedScheduleId,
              price: paymentPrice,
              seriesId: seriesId,
              pricingType: pricingType,
              termId: termId,
              customerEmail: email,
              customerName: name,
              customerPhone: phone,
              successUrl: window.location.origin + '/payment-complete?session_id={CHECKOUT_SESSION_ID}' + (seriesId ? '&series_id=' + encodeURIComponent(seriesId) + '&term_id=' + encodeURIComponent(termId) : ''), 
              cancelUrl: window.location.origin + '/reservation?canceled=true' + (seriesId ? '&series=' + encodeURIComponent(seriesId) + '&pricing=' + encodeURIComponent(pricingType) : '')
            }) 
          });
          const checkoutData = await checkoutResponse.json();
          
          if (checkoutData.url) {
            // Stripe決済画面にリダイレクト
            window.location.href = checkoutData.url;
          } else if (checkoutData.demo) {
            // デモモード（Stripeキー未設定時）- この場合も予約を作成
            const resResponse = await fetch('/api/reservations', { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' }, 
              body: JSON.stringify({ 
                courseId: selectedCourseId, 
                scheduleId: selectedScheduleId, 
                seriesId: seriesId,
                termId: termId,
                pricingType: pricingType,
                name, 
                email, 
                phone 
              }) 
            });
            const reservation = await resResponse.json();
            document.getElementById('payment-modal').classList.add('hidden'); 
            document.getElementById('success-modal').classList.remove('hidden');
            var calendarPageLink = document.getElementById('calendar-page-link');
            if (calendarPageLink && reservation.reservation) {
              calendarPageLink.href = '/calendar/' + encodeURIComponent(reservation.reservation.id);
            }
          } else {
            throw new Error(checkoutData.error || '決済セッションの作成に失敗しました');
          }
        } catch (error) { 
          console.error('Checkout error:', error);
          document.getElementById('payment-modal').classList.add('hidden'); 
          alert('エラーが発生しました: ' + (error.message || '予約処理中にエラーが発生しました')); 
        }
      });

      function renderCalendar() {
        if (!calendarGrid) return; // シリーズ予約の場合はカレンダーがない
        const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
        const calendarMonthEl = document.getElementById('calendar-month');
        if (calendarMonthEl) calendarMonthEl.textContent = year + '年' + (month + 1) + '月';
        const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0), startDay = firstDay.getDay();
        let html = '';
        for (let i = 0; i < startDay; i++) html += '<div class="p-2"></div>';
        const availableDates = schedules.filter(s => !selectedCourseId || s.courseId === selectedCourseId).map(s => s.date);
        // 選択されたスケジュールの日付を取得
        const selectedSchedule = selectedScheduleId ? schedules.find(s => s.id === selectedScheduleId) : null;
        const selectedDate = selectedSchedule ? selectedSchedule.date : null;
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
          const hasSchedule = availableDates.includes(dateStr);
          const isSelected = dateStr === selectedDate;
          let classes = 'p-2 text-center rounded-xl transition-all text-sm ';
          if (isSelected) {
            classes += 'bg-ai-purple text-white cursor-pointer font-bold shadow ring-2 ring-ai-blue';
          } else if (hasSchedule) {
            classes += 'gradient-ai text-white cursor-pointer hover:opacity-80 font-bold shadow';
          } else {
            classes += 'text-future-textLight/50';
          }
          html += '<div class="' + classes + '" data-date="' + dateStr + '">' + day + '</div>';
        }
        calendarGrid.innerHTML = html;
        calendarGrid.querySelectorAll('[data-date]').forEach(el => { if (availableDates.includes(el.dataset.date)) el.addEventListener('click', function() { highlightSchedulesForDate(this.dataset.date); }); });
      }

      function updateScheduleList() {
        if (!scheduleList) return; // シリーズ予約の場合はスケジュールリストがない
        const filtered = schedules.filter(s => !selectedCourseId || s.courseId === selectedCourseId);
        if (filtered.length === 0) { scheduleList.innerHTML = '<p class="text-future-textLight text-center py-8 bg-future-light rounded-2xl">利用可能な日程がありません</p>'; return; }
        scheduleList.innerHTML = filtered.map(schedule => {
          const course = courses.find(c => c.id === schedule.courseId);
          const remaining = schedule.capacity - schedule.enrolled;
          const isFull = remaining <= 0;
          return '<div class="schedule-item p-4 border-2 border-future-sky rounded-2xl cursor-pointer hover:border-ai-blue hover:bg-ai-blue/5 transition-all ' + (isFull ? 'opacity-50 cursor-not-allowed' : '') + '" data-schedule="' + schedule.id + '" data-course="' + schedule.courseId + '"><div class="flex justify-between items-start"><div><p class="font-bold text-future-text"><i class="fas fa-calendar-day mr-2 text-ai-blue"></i>' + schedule.date + '</p><p class="text-future-textLight text-sm"><i class="fas fa-clock mr-2 text-ai-purple"></i>' + schedule.startTime + ' 〜 ' + schedule.endTime + '</p><p class="gradient-ai-text text-sm mt-1 font-medium">' + course.title + '</p></div><div class="text-right"><span class="' + (isFull ? 'bg-gray-200 text-gray-500' : 'gradient-ai text-white') + ' text-xs font-bold px-3 py-1 rounded-full">' + (isFull ? '満席' : '残り' + remaining + '席') + '</span></div></div></div>';
        }).join('');
        scheduleList.querySelectorAll('.schedule-item').forEach(el => {
          // URLパラメータから取得したスケジュールIDと一致する場合、選択状態にする
          if (selectedScheduleId && el.dataset.schedule === selectedScheduleId) {
            el.classList.add('border-ai-blue', 'bg-ai-blue/10');
            // 選択された日程が見えるようにスクロール
            setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
          }
          
          el.addEventListener('click', function() {
            if (this.classList.contains('opacity-50')) return;
            scheduleList.querySelectorAll('.schedule-item').forEach(item => item.classList.remove('border-ai-blue', 'bg-ai-blue/10'));
            this.classList.add('border-ai-blue', 'bg-ai-blue/10');
            selectedScheduleId = this.dataset.schedule;
            if (!selectedCourseId) { selectedCourseId = this.dataset.course; courseSelect.value = selectedCourseId; }
            updateSummary();
          });
        });
        
        // URLパラメータからスケジュールが選択されている場合、サマリーを更新
        if (selectedScheduleId) {
          updateSummary();
        }
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
        
        // シリーズ一括予約かどうかを判定
        var seriesIdEl = document.getElementById('series-id');
        var pricingTypeEl = document.getElementById('pricing-type');
        var selectedTermIdEl = document.getElementById('selected-term-id');
        var seriesId = seriesIdEl ? seriesIdEl.value : '';
        var pricingType = pricingTypeEl ? pricingTypeEl.value : 'single';
        var termId = selectedTermIdEl ? selectedTermIdEl.value : '';
        var isSeriesBooking = seriesId && termId && pricingType !== 'single';
        var isSeriesSingleBooking = seriesId && pricingType === 'single';
        
        // シリーズ単発参加の場合
        if (isSeriesSingleBooking) {
          // 選択したセッションの情報を取得
          const selectedSession = document.querySelector('.session-item.border-ai-purple');
          if (selectedSession) {
            const courseTitle = selectedSession.querySelector('h4')?.textContent || '未選択';
            const dateEl = selectedSession.querySelector('.fa-calendar-day')?.parentElement;
            const timeEl = selectedSession.querySelector('.fa-clock')?.parentElement;
            const sessionDate = dateEl ? dateEl.textContent.trim() : '未選択';
            const sessionTime = timeEl ? timeEl.textContent.trim() : '--:--';
            
            if (summaryCourse) summaryCourse.textContent = courseTitle;
            if (summaryDate) summaryDate.textContent = sessionDate;
            if (summaryTime) summaryTime.textContent = sessionTime;
          } else {
            if (summaryCourse) summaryCourse.textContent = '未選択';
            if (summaryDate) summaryDate.textContent = '未選択';
            if (summaryTime) summaryTime.textContent = '--:-- 〜 --:--';
          }
        } else if (!isSeriesBooking) {
          // 通常の単発予約の場合
          if (summaryCourse) summaryCourse.textContent = course ? course.title : '未選択';
          if (summaryDate) summaryDate.textContent = schedule ? schedule.date : '未選択';
          if (summaryTime) summaryTime.textContent = schedule ? schedule.startTime + ' 〜 ' + schedule.endTime : '--:-- 〜 --:--';
        }
        
        // シリーズ講座の場合は選択したプランの価格を使用
        var selectedPriceEl = document.getElementById('selected-price');
        var displayPrice = selectedPriceEl ? parseInt(selectedPriceEl.value) : (course ? course.price : 0);
        summaryPrice.textContent = '¥' + displayPrice.toLocaleString();
        
        // 無料講座の場合はボタンテキストを変更
        const btnIcon = document.getElementById('checkout-btn-icon');
        const btnText = document.getElementById('checkout-btn-text');
        const paymentNotice = document.getElementById('payment-notice');
        if (displayPrice === 0) {
          btnIcon.className = 'fas fa-calendar-check mr-2';
          btnText.textContent = '予約する（無料）';
          paymentNotice.innerHTML = '<i class="fas fa-gift mr-1 text-green-500"></i>この講座は無料です';
        } else {
          btnIcon.className = 'fas fa-credit-card mr-2';
          btnText.textContent = '決済に進む';
          paymentNotice.innerHTML = '<i class="fas fa-lock mr-1 text-ai-blue"></i>Stripeによる安全な決済';
        }
        
        // ボタンの有効化条件
        // シリーズ一括予約: 開催期が選択されている + 規約同意
        // シリーズ単発参加: セッションが選択されている + 規約同意
        // 通常の単発予約: 講座・日程が選択されている + 規約同意
        if (isSeriesBooking) {
          checkoutBtn.disabled = !termId || !areAllPoliciesAgreed();
        } else if (isSeriesSingleBooking) {
          checkoutBtn.disabled = !selectedCourseId || !selectedScheduleId || !areAllPoliciesAgreed();
        } else {
          checkoutBtn.disabled = !course || !schedule || !areAllPoliciesAgreed();
        }
      }

      // Googleカレンダー追加用URL生成関数
      function generateGoogleCalendarUrl(title, description, date, startTime, endTime, location) {
        // 日付と時刻をローカル形式で直接フォーマット（タイムゾーン変換なし）
        // Format: YYYYMMDDTHHMMSS
        const formatLocalDateTime = (dateStr, timeStr) => {
          return dateStr.replace(/-/g, '') + 'T' + timeStr.replace(':', '') + '00';
        };
        
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: title,
          dates: formatLocalDateTime(date, startTime) + '/' + formatLocalDateTime(date, endTime),
          details: description,
          location: location || 'オンライン',
          ctz: 'Asia/Tokyo'
        });
        return 'https://calendar.google.com/calendar/render?' + params.toString();
      }

      function updateGoogleCalendarLink() {
        // シリーズ予約かどうかを判定
        var seriesIdEl = document.getElementById('series-id');
        var pricingTypeEl = document.getElementById('pricing-type');
        var selectedTermIdEl = document.getElementById('selected-term-id');
        var seriesId = seriesIdEl ? seriesIdEl.value : '';
        var pricingType = pricingTypeEl ? pricingTypeEl.value : 'single';
        var termId = selectedTermIdEl ? selectedTermIdEl.value : '';
        var isSeriesBooking = seriesId && termId && pricingType !== 'single';
        
        const singleSection = document.getElementById('single-calendar-section');
        const seriesSection = document.getElementById('series-calendar-section');
        
        if (isSeriesBooking) {
          // シリーズ予約の場合
          if (singleSection) singleSection.classList.add('hidden');
          if (seriesSection) seriesSection.classList.remove('hidden');
          updateSeriesCalendarLinks();
          return;
        }
        
        // 単発予約の場合
        if (singleSection) singleSection.classList.remove('hidden');
        if (seriesSection) seriesSection.classList.add('hidden');
        
        const course = courses.find(c => c.id === selectedCourseId);
        const schedule = schedules.find(s => s.id === selectedScheduleId);
        const linkEl = document.getElementById('google-calendar-link');
        
        console.log('updateGoogleCalendarLink called:', { selectedCourseId, selectedScheduleId, course: !!course, schedule: !!schedule });
        
        if (!course || !schedule) {
          // 講座情報が見つからない場合でも基本的なリンクを設定
          if (linkEl) linkEl.href = 'https://calendar.google.com/calendar/render';
          return;
        }
        
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
        const calendarUrl = generateGoogleCalendarUrl(title, description, schedule.date, schedule.startTime, schedule.endTime, location);
        if (linkEl) linkEl.href = calendarUrl;
        console.log('Calendar URL set:', calendarUrl);
      }
      
      // シリーズ予約のカレンダーリンクを更新
      const seriesScheduleData = ${seriesInfo && seriesInfo.terms?.[0]?.schedules ? JSON.stringify(seriesInfo.terms[0].schedules) : '[]'};
      const seriesTitle = ${seriesInfo ? JSON.stringify(seriesInfo.title) : "''"};
      
      function updateSeriesCalendarLinks() {
        const linksContainer = document.getElementById('series-calendar-links');
        if (!linksContainer || !seriesScheduleData.length) return;
        
        linksContainer.innerHTML = seriesScheduleData.map((sch, idx) => {
          const gcalUrl = generateSeriesCalendarUrl(sch, idx);
          const dateStr = new Date(sch.date).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric', weekday: 'short'});
          return '<div class="flex items-center justify-between py-2 border-b border-future-sky/30 last:border-0">' +
            '<div class="flex items-center">' +
              '<span class="w-6 h-6 bg-ai-blue text-white text-xs font-bold rounded-full flex items-center justify-center mr-2">' + sch.session_number + '</span>' +
              '<span class="text-sm text-future-text">' + dateStr + ' ' + sch.start_time + '〜</span>' +
            '</div>' +
            '<a href="' + gcalUrl + '" target="_blank" class="text-xs text-nature-forest hover:text-nature-leaf px-2 py-1 rounded hover:bg-nature-mint/20">' +
              '<i class="fab fa-google mr-1"></i>追加' +
            '</a>' +
          '</div>';
        }).join('');
      }
      
      function generateSeriesCalendarUrl(sch, idx) {
        const formatLocalDateTime = (dateStr, timeStr) => {
          return dateStr.replace(/-/g, '') + 'T' + timeStr.replace(':', '') + '00';
        };
        const title = '【mirAIcafe】' + (sch.course_title || '第' + (idx + 1) + '回');
        const endTime = sch.end_time || (() => {
          const [h, m] = sch.start_time.split(':');
          return String(parseInt(h) + 2).padStart(2, '0') + ':' + m;
        })();
        const description = '📚 mirAIcafe AI講座\\n\\n第' + sch.session_number + '回/' + seriesScheduleData.length + '回\\nコース: ' + seriesTitle + '\\n\\n主催: mirAIcafe\\nhttps://miraicafe.work';
        const params = new URLSearchParams({
          action: 'TEMPLATE',
          text: title,
          dates: formatLocalDateTime(sch.date, sch.start_time) + '/' + formatLocalDateTime(sch.date, endTime),
          details: description,
          location: 'Google Meet',
          ctz: 'Asia/Tokyo'
        });
        return 'https://calendar.google.com/calendar/render?' + params.toString();
      }
      
      // 全日程をまとめてカレンダーに追加
      function addAllSeriesToCalendar() {
        seriesScheduleData.forEach((sch, idx) => {
          setTimeout(() => {
            window.open(generateSeriesCalendarUrl(sch, idx), '_blank');
          }, idx * 500); // 500ms間隔で開く
        });
      }

      if (new URLSearchParams(window.location.search).get('session_id')) {
        document.getElementById('success-modal').classList.remove('hidden');
        updateGoogleCalendarLink();
      }
    </script>
  `

  return renderLayout('講座予約', content, 'reservation')
}
