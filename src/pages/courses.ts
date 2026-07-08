import { renderLayout } from '../components/layout'
import { Course, Schedule } from '../data'

// HTMLタグを除去してプレーンテキストにする関数
function stripHtml(html: string | undefined | null): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')  // HTMLタグを空白に置換
    .replace(/&nbsp;/g, ' ')   // &nbsp;を空白に
    .replace(/&lt;/g, '<')     // HTMLエンティティを元に戻す
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')      // 連続する空白を1つに
    .trim()
}

// HTML属性値用のエスケープ関数
function escapeAttr(text: string | undefined | null): string {
  if (!text) return ''
  return stripHtml(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// テキストを指定文字数で切り詰める関数
function truncateText(text: string | undefined | null, maxLength: number): string {
  const plainText = stripHtml(text)
  if (plainText.length <= maxLength) return plainText
  return plainText.substring(0, maxLength) + '...'
}

// コースシリーズ情報の型定義
interface SeriesInfo {
  id: string
  title: string
  subtitle?: string
  description?: string
  total_sessions: number
  duration_minutes?: number
  base_price_per_session: number
  pricing_pattern_id?: string
  calc_single_price_incl: number
  calc_single_total_incl: number
  calc_course_price_incl: number
  calc_early_price_incl: number
  calc_monthly_price_incl: number
  calc_savings_course: number
  calc_savings_early: number
  early_bird_deadline?: string
  pattern_name?: string
  course_discount_rate?: number
  early_bird_discount_rate?: number
  early_bird_days?: number
  has_monthly_option?: number
  tax_rate?: number
  currentSessionNumber?: number
  linkedCourses?: { id: string; title: string; session_number: number }[]
}

// シリーズマップの型
interface SeriesMapEntry {
  seriesId: string
  seriesTitle: string
  totalSessions: number
  sessionNumber: number
}

// コースシリーズの型
interface CourseSeries {
  id: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  total_sessions: number
  duration_minutes: number
  base_price_per_session: number
  calc_single_price_incl: number
  calc_course_price_incl: number
  calc_early_price_incl: number
  calc_monthly_price_incl: number
  calc_savings_course: number
  calc_savings_early: number
  early_bird_deadline?: string
  course_discount_rate?: number
  early_bird_discount_rate?: number
  is_featured?: number
  status: string
}

export const renderCoursesPage = (courses: Course[], seriesMap?: Record<string, SeriesMapEntry>, courseSeriesList?: CourseSeries[]) => {
  // シリーズ情報を保持（表示用）
  const seriesCourseIds = new Set(Object.keys(seriesMap || {}))
  
  const content = `
    <!-- ふわふわアニメーション用CSS -->
    <style>
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(-1deg); }
        50% { transform: translateY(-8px) rotate(1deg); }
      }
      .float-animation {
        animation: float 3s ease-in-out infinite;
      }
      @keyframes sparkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      .sparkle {
        animation: sparkle 2s ease-in-out infinite;
      }
    </style>

    <!-- Page Header -->
    <section class="relative py-12 sm:py-16 overflow-hidden">
      <div class="absolute inset-0 gradient-ai-light"></div>
      <div class="absolute inset-0">
        <div class="orb orb-1 opacity-30"></div>
        <div class="orb orb-2 opacity-20"></div>
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 中央揃えのヘッダー -->
        <div class="text-center mb-8">
          <span class="inline-flex items-center gradient-ai text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-book-open mr-2"></i>ALL COURSES
          </span>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-future-text mb-3">講座一覧</h1>
          <p class="text-future-textLight text-sm sm:text-base max-w-lg mx-auto mb-5">
            目的やレベルに合わせて、最適な講座をお選びください
          </p>
          
          <!-- 特徴バッジ（中央揃え） -->
          <div class="flex flex-wrap justify-center gap-2 mb-6">
            <span class="inline-flex items-center bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
              <i class="fas fa-check-circle mr-1.5"></i>1回から受講OK
            </span>
            <span class="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium">
              <i class="fas fa-layer-group mr-1.5"></i>お得なコースあり
            </span>
            <span class="inline-flex items-center bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium">
              <i class="fas fa-gift mr-1.5"></i>無料講座も開催中
            </span>
          </div>
          
          <!-- ふわふわ吹き出し（中央） -->
          <div class="inline-block float-animation mb-6">
            <div class="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 rounded-[40px] px-6 py-4 shadow-lg border-2 border-orange-200/50" style="border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;">
              <span class="absolute -top-2 -left-2 text-yellow-400 sparkle">✦</span>
              <span class="absolute -top-1 right-4 text-pink-300 sparkle" style="animation-delay: 0.5s;">♡</span>
              <span class="absolute -bottom-1 -right-2 text-green-400 sparkle" style="animation-delay: 1s;">✦</span>
              <span class="absolute bottom-2 -left-3 text-orange-300 sparkle" style="animation-delay: 0.3s;">☆</span>
              <p class="text-center font-bold text-amber-800 text-sm sm:text-base leading-relaxed">
                1回のみでもコースでも<br>予約できます！
              </p>
            </div>
          </div>
          
          <!-- AI相談ボタン（中央） -->
          <div class="flex justify-center">
            <button id="ai-advisor-btn" 
                    class="group relative inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-sm sm:text-base">
              <span class="absolute -top-1 -right-1 text-yellow-300 text-xs">✨</span>
              <span class="absolute -bottom-1 -left-1 text-yellow-300 text-xs">✨</span>
              <span class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i class="fas fa-robot"></i>
              </span>
              <span>AIに講座を相談する</span>
              <i class="fas fa-chevron-down text-xs transition-transform group-hover:translate-y-1" id="ai-btn-icon"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- AI講座アドバイザー チャットボット（折りたたみ式） -->
    <section id="chatbot-section" class="hidden bg-gradient-to-br from-cafe-cream via-cafe-latte/30 to-nature-mint/20 border-y border-cafe-beige">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden border border-cafe-beige">
          <!-- チャットボットヘッダー -->
          <div class="bg-gradient-to-r from-cafe-wood to-cafe-caramel p-4 text-white">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <i class="fas fa-robot text-lg"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-base font-bold">☕ mionのAI講座アドバイザー</h3>
                <p class="text-white/80 text-xs">あなたにぴったりの講座を一緒に探します</p>
              </div>
              <button id="chatbot-close" class="text-white/80 hover:text-white transition p-2">
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
          
          <!-- チャットボット本体 -->
          <div id="chatbot-body" class="transition-all duration-300">
            <!-- チャット履歴 -->
            <div id="chat-messages" class="p-4 max-h-72 overflow-y-auto space-y-3 bg-cafe-ivory/30">
              <!-- 初期メッセージ -->
              <div class="chat-message bot flex gap-3">
                <div class="w-8 h-8 bg-cafe-wood rounded-full flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-robot text-white text-xs"></i>
                </div>
                <div class="flex-1">
                  <div class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-cafe-beige/50 max-w-lg">
                    <p class="text-cafe-text text-sm">こんにちは！講座アドバイザーのmionです😊</p>
                    <p class="text-cafe-text text-sm mt-1">どんな目的で学びたいですか？</p>
                  </div>
                  <!-- 初期選択肢 -->
                  <div class="flex flex-wrap gap-2 mt-2" id="initial-options">
                    <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="仕事でAIを活用して効率化したい">
                      💼 仕事で効率化
                    </button>
                    <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="資格取得や勉強に役立てたい">
                      📚 勉強・資格
                    </button>
                    <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="教育現場でAIを活用したい">
                      🏫 教育現場
                    </button>
                    <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="趣味や興味でAIを学びたい">
                      🎨 趣味・興味
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 入力エリア -->
            <div class="p-3 border-t border-cafe-beige bg-white">
              <div class="flex gap-2">
                <input type="text" id="chat-input" 
                       class="flex-1 px-3 py-2 border border-cafe-beige rounded-full focus:border-cafe-wood focus:outline-none transition-colors bg-cafe-ivory/50 text-sm"
                       placeholder="自由に入力もできます...">
                <button id="chat-send" class="px-4 py-2 bg-cafe-wood hover:bg-cafe-caramel text-white rounded-full font-medium transition-all flex items-center gap-1 text-sm">
                  <i class="fas fa-paper-plane text-xs"></i>
                  <span class="hidden sm:inline">送信</span>
                </button>
              </div>
              <p class="text-xs text-cafe-textLight mt-2 text-center">
                <i class="fas fa-lightbulb mr-1"></i>ボタンを選ぶか、自由に入力して質問できます
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 検索バー（シンプル版） -->
    <section class="py-4 bg-white/95 backdrop-blur-sm sticky top-16 z-40 border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <!-- 検索入力 -->
          <div class="relative flex-1 w-full sm:max-w-md">
            <i class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input type="text" id="search-input" 
              class="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all bg-gray-50 text-base"
              placeholder="講座名やキーワードで検索...">
            <button id="search-clear" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hidden p-2">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <!-- 件数表示 -->
          <div class="text-sm text-gray-500">
            全<span class="font-bold text-gray-800">${courses.length}</span>件
          </div>
        </div>
      </div>
    </section>

    <!-- カテゴリ別講座セクション（横スクロール） -->
    <section class="py-8 bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- セクションヘッダー -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            <i class="fas fa-layer-group mr-2 text-amber-600"></i>カテゴリから講座を探す
          </h2>
          <p class="text-gray-500 text-sm">あなたの目的に合わせて、最適な講座をお選びください</p>
        </div>
        
        <!-- カテゴリナビゲーション（件数バッジ付き） -->
        <div class="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide" id="category-nav">
          <button class="category-nav-btn active whitespace-nowrap px-4 py-2.5 rounded-full font-medium transition-all text-sm border-2 flex items-center gap-2" data-category="all">
            <i class="fas fa-th-large"></i>すべて
          </button>
          <button class="category-nav-btn whitespace-nowrap px-4 py-2.5 rounded-full font-medium transition-all text-sm border-2 flex items-center gap-2" data-category="trial">
            <i class="fas fa-gift"></i>体験版
            <span id="count-trial" class="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">0</span>
          </button>
          <button class="category-nav-btn whitespace-nowrap px-4 py-2.5 rounded-full font-medium transition-all text-sm border-2 flex items-center gap-2" data-category="career">
            <i class="fas fa-user-tie"></i>キャリコン向け
            <span id="count-career" class="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">0</span>
          </button>
          <button class="category-nav-btn whitespace-nowrap px-4 py-2.5 rounded-full font-medium transition-all text-sm border-2 flex items-center gap-2" data-category="learning">
            <i class="fas fa-graduation-cap"></i>AI基礎・学習効率化
            <span id="count-learning" class="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">0</span>
          </button>
          <button class="category-nav-btn whitespace-nowrap px-4 py-2.5 rounded-full font-medium transition-all text-sm border-2 flex items-center gap-2" data-category="teacher">
            <i class="fas fa-chalkboard-teacher"></i>教育者向け
            <span id="count-teacher" class="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">0</span>
          </button>
          <button class="category-nav-btn whitespace-nowrap px-4 py-2.5 rounded-full font-medium transition-all text-sm border-2 flex items-center gap-2" data-category="tools">
            <i class="fas fa-tools"></i>各ツール
            <span id="count-tools" class="bg-gray-400 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">0</span>
          </button>
        </div>
        
        <style>
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .category-nav-btn {
            background: white;
            border-color: #e5e7eb;
            color: #6b7280;
          }
          .category-nav-btn:hover {
            border-color: #8B6914;
            color: #8B6914;
            background: #fef3c7;
          }
          .category-nav-btn.active {
            background: linear-gradient(135deg, #8B6914 0%, #B8956A 100%);
            border-color: #8B6914;
            color: white;
          }
          .category-nav-btn.active span {
            background: rgba(255,255,255,0.3);
          }
          .course-section {
            scroll-margin-top: 120px;
          }
          .course-scroll-container {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding-bottom: 1rem;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .course-scroll-container::-webkit-scrollbar {
            height: 6px;
          }
          .course-scroll-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .course-scroll-container::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
          }
          .course-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #999;
          }
          .course-scroll-card {
            flex: 0 0 280px;
            scroll-snap-align: start;
          }
          @media (min-width: 640px) {
            .course-scroll-card {
              flex: 0 0 300px;
            }
          }
          @media (min-width: 1024px) {
            .course-scroll-card {
              flex: 0 0 320px;
            }
          }
        </style>
      </div>
    </section>

    <!-- 体験版（無料・低価格）セクション -->
    <section class="course-section py-10 bg-gradient-to-r from-green-50 to-emerald-50" id="section-trial" data-category="trial">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                <i class="fas fa-gift mr-1"></i>体験版
              </span>
              <span class="text-green-600 text-sm font-medium">まずはここから！</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800">無料・低価格で始める</h3>
            <p class="text-sm text-gray-600">AIに興味がある方、まずは気軽に体験してみましょう</p>
          </div>
          <a href="#" class="text-green-600 hover:text-green-700 font-medium text-sm whitespace-nowrap">
            もっと見る <i class="fas fa-chevron-right ml-1"></i>
          </a>
        </div>
        <div class="course-scroll-container" id="trial-courses">
          <!-- JSで動的に挿入 -->
        </div>
      </div>
    </section>

    <!-- キャリコン向けセクション -->
    <section class="course-section py-10 bg-gradient-to-r from-purple-50 to-indigo-50" id="section-career" data-category="career">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                <i class="fas fa-user-tie mr-1"></i>キャリコン向け
              </span>
            </div>
            <h3 class="text-xl font-bold text-gray-800">キャリアコンサルタントのためのAI講座</h3>
            <p class="text-sm text-gray-600">AI時代に選ばれるキャリコンになるための実践講座</p>
          </div>
          <a href="#" class="text-purple-600 hover:text-purple-700 font-medium text-sm whitespace-nowrap">
            もっと見る <i class="fas fa-chevron-right ml-1"></i>
          </a>
        </div>
        <div class="course-scroll-container" id="career-courses">
          <!-- JSで動的に挿入 -->
        </div>
      </div>
    </section>

    <!-- 学習効率化セクション -->
    <section class="course-section py-10 bg-gradient-to-r from-blue-50 to-cyan-50" id="section-learning" data-category="learning">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                <i class="fas fa-graduation-cap mr-1"></i>学習効率化
              </span>
            </div>
            <h3 class="text-xl font-bold text-gray-800">資格学習・自己学習をAIで加速</h3>
            <p class="text-sm text-gray-600">AIを活用して学習効率を劇的に向上させる</p>
          </div>
          <a href="#" class="text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap">
            もっと見る <i class="fas fa-chevron-right ml-1"></i>
          </a>
        </div>
        <div class="course-scroll-container" id="learning-courses">
          <!-- JSで動的に挿入 -->
        </div>
      </div>
    </section>

    <!-- 教育者向けセクション -->
    <section class="course-section py-10 bg-gradient-to-r from-orange-50 to-amber-50" id="section-teacher" data-category="teacher">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                <i class="fas fa-chalkboard-teacher mr-1"></i>教育者向け
              </span>
            </div>
            <h3 class="text-xl font-bold text-gray-800">先生のためのAI講座</h3>
            <p class="text-sm text-gray-600">教育現場でAIを活用するための実践講座</p>
          </div>
          <a href="#" class="text-orange-600 hover:text-orange-700 font-medium text-sm whitespace-nowrap">
            もっと見る <i class="fas fa-chevron-right ml-1"></i>
          </a>
        </div>
        <div class="course-scroll-container" id="teacher-courses">
          <!-- JSで動的に挿入 -->
        </div>
      </div>
    </section>

    <!-- 各ツールセクション（準備中） -->
    <section class="course-section py-10 bg-gradient-to-r from-gray-50 to-slate-50" id="section-tools" data-category="tools">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                <i class="fas fa-tools mr-1"></i>各ツール
              </span>
              <span class="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">準備中</span>
            </div>
            <h3 class="text-xl font-bold text-gray-800">AIツール別講座</h3>
            <p class="text-sm text-gray-600">ChatGPT、Claude、NotebookLMなど各ツールの使い方</p>
          </div>
        </div>
        <div class="bg-white rounded-xl p-8 border-2 border-dashed border-gray-300 text-center">
          <i class="fas fa-hammer text-4xl text-gray-300 mb-3"></i>
          <p class="text-gray-500 font-medium">現在準備中です</p>
          <p class="text-gray-400 text-sm mt-1">近日公開予定！お楽しみに</p>
        </div>
      </div>
    </section>

    <!-- カテゴリ別講座の動的生成スクリプト -->
    <script>
      (function() {
        // 全講座データ
        const allCourses = ${JSON.stringify(courses.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description ? c.description.replace(/<[^>]*>/g, '').substring(0, 80) : '',
          price: c.price,
          duration: c.duration,
          level: c.level,
          category: c.category,
          image: c.image
        })))};
        
        // カテゴリ分類ロジック（改善版）
        function categorize(course) {
          const title = (course.title || '').toLowerCase();
          const titleOriginal = course.title || '';
          const category = (course.category || '').toLowerCase();
          
          // 体験版（無料・1000円以下）
          if (course.price <= 1000) return 'trial';
          
          // キャリコン向け（キャリアコンサルタント関連）
          if (title.includes('キャリア') || title.includes('キャリコン') || 
              titleOriginal.includes('キャリア') || titleOriginal.includes('キャリコン')) return 'career';
          
          // 教育者向け（先生、教師、教育現場向け）
          if (title.includes('先生') || title.includes('教師') || title.includes('教育') ||
              titleOriginal.includes('先生') || titleOriginal.includes('教師') || titleOriginal.includes('教育')) return 'teacher';
          
          // 学習効率化（資格学習、自己学習、勉強効率化）
          if (title.includes('資格') || title.includes('学習') || title.includes('勉強') ||
              titleOriginal.includes('資格') || titleOriginal.includes('学習') || titleOriginal.includes('勉強')) return 'learning';
          
          // AI基礎（入門、基礎、AIって何？など）
          if (category.includes('ai基礎') || title.includes('入門') || title.includes('基礎') ||
              titleOriginal.includes('入門') || titleOriginal.includes('基礎') || 
              titleOriginal.includes('AIって何')) return 'learning';
          
          // ビジネス活用もlearningに
          if (category.includes('ビジネス') || title.includes('効率') || title.includes('活用') ||
              titleOriginal.includes('効率') || titleOriginal.includes('活用')) return 'learning';
          
          return 'learning'; // デフォルト
        }
        
        // カード生成（改善版デザイン）
        function createCard(course) {
          const priceLabel = course.price === 0 ? '無料' : '¥' + course.price.toLocaleString();
          const priceClass = course.price === 0 ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-800';
          const levelColors = {
            '初級': 'bg-blue-100 text-blue-700',
            '中級': 'bg-orange-100 text-orange-700',
            '上級': 'bg-red-100 text-red-700',
            '全レベル': 'bg-purple-100 text-purple-700'
          };
          const levelClass = levelColors[course.level] || 'bg-gray-100 text-gray-700';
          
          return \`
            <a href="/courses/\${course.id}" class="course-scroll-card bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all block group">
              <div class="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                \${course.image ? \`<img loading="lazy" decoding="async" src="\${course.image}" alt="\${course.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">\` : \`<div class="w-full h-full flex items-center justify-center"><i class="fas fa-book-open text-5xl text-gray-200"></i></div>\`}
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div class="absolute top-3 left-3 flex gap-2">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full shadow-sm \${priceClass}">\${priceLabel}</span>
                </div>
                <div class="absolute top-3 right-3">
                  <span class="text-xs font-medium px-2.5 py-1 rounded-full shadow-sm \${levelClass}">\${course.level || '初級'}</span>
                </div>
                <div class="absolute bottom-3 right-3">
                  <span class="bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1 rounded-full text-gray-600">
                    <i class="fas fa-clock mr-1"></i>\${course.duration || '120分'}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h4 class="font-bold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors min-h-[2.5rem]">\${course.title}</h4>
                <p class="text-gray-500 text-xs line-clamp-2 mb-3 min-h-[2rem]">\${course.description || ''}</p>
                <div class="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
                  <span class="text-gray-400"><i class="fas fa-tag mr-1"></i>\${course.category || 'AI基礎'}</span>
                  <span class="text-amber-600 font-bold group-hover:text-amber-700">
                    詳細を見る <i class="fas fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </div>
              </div>
            </a>
          \`;
        }
        
        // 空の場合のメッセージ
        function createEmptyMessage(text) {
          return \`
            <div class="w-full py-12 text-center">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <i class="fas fa-inbox text-2xl text-gray-300"></i>
              </div>
              <p class="text-gray-400 text-sm">\${text}</p>
            </div>
          \`;
        }
        
        // 各カテゴリに講座を配置
        const categories = {
          trial: [],
          career: [],
          learning: [],
          teacher: [],
          tools: []
        };
        
        allCourses.forEach(course => {
          const cat = categorize(course);
          if (categories[cat]) {
            categories[cat].push(course);
          }
        });
        
        // カテゴリごとの件数を更新
        const countBadges = {
          trial: document.getElementById('count-trial'),
          career: document.getElementById('count-career'),
          learning: document.getElementById('count-learning'),
          teacher: document.getElementById('count-teacher'),
          tools: document.getElementById('count-tools')
        };
        
        Object.keys(countBadges).forEach(key => {
          const badge = countBadges[key];
          if (badge) {
            badge.textContent = categories[key].length;
            badge.style.display = categories[key].length > 0 ? 'inline' : 'none';
          }
        });
        
        // 各コンテナに挿入
        const trialContainer = document.getElementById('trial-courses');
        if (trialContainer) {
          trialContainer.innerHTML = categories.trial.length > 0 
            ? categories.trial.map(createCard).join('')
            : createEmptyMessage('現在、体験版講座はありません');
        }
        
        const careerContainer = document.getElementById('career-courses');
        if (careerContainer) {
          careerContainer.innerHTML = categories.career.length > 0 
            ? categories.career.map(createCard).join('')
            : createEmptyMessage('現在、キャリコン向け講座はありません');
        }
        
        const learningContainer = document.getElementById('learning-courses');
        if (learningContainer) {
          learningContainer.innerHTML = categories.learning.length > 0 
            ? categories.learning.map(createCard).join('')
            : createEmptyMessage('現在、学習効率化講座はありません');
        }
        
        const teacherContainer = document.getElementById('teacher-courses');
        if (teacherContainer) {
          teacherContainer.innerHTML = categories.teacher.length > 0 
            ? categories.teacher.map(createCard).join('')
            : createEmptyMessage('現在、教育者向け講座はありません');
        }
        
        // カテゴリナビゲーション
        document.querySelectorAll('.category-nav-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // ボタンのアクティブ状態更新
            document.querySelectorAll('.category-nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // セクションの表示/非表示
            document.querySelectorAll('.course-section').forEach(section => {
              if (category === 'all' || section.dataset.category === category) {
                section.style.display = 'block';
              } else {
                section.style.display = 'none';
              }
            });
            
            // スクロール（すべて以外の場合）
            if (category !== 'all') {
              const targetSection = document.getElementById('section-' + category);
              if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          });
        });
        
        // 検索機能
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        
        if (searchInput) {
          let searchTimeout;
          searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const value = this.value.trim().toLowerCase();
            
            // クリアボタン表示
            if (searchClear) {
              searchClear.classList.toggle('hidden', !value);
            }
            
            searchTimeout = setTimeout(function() {
              // 全カテゴリの講座カードを検索でフィルタリング
              document.querySelectorAll('.course-scroll-card').forEach(card => {
                const title = (card.querySelector('h4')?.textContent || '').toLowerCase();
                const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
                
                if (!value || title.includes(value) || desc.includes(value)) {
                  card.style.display = 'block';
                } else {
                  card.style.display = 'none';
                }
              });
              
              // 各セクションの空状態チェック
              document.querySelectorAll('.course-scroll-container').forEach(container => {
                const visibleCards = container.querySelectorAll('.course-scroll-card:not([style*="display: none"])');
                const emptyMsg = container.querySelector('.empty-search-message');
                
                if (value && visibleCards.length === 0) {
                  if (!emptyMsg) {
                    const msg = document.createElement('div');
                    msg.className = 'empty-search-message w-full py-8 text-center text-gray-400';
                    msg.innerHTML = '<i class="fas fa-search text-2xl mb-2"></i><p class="text-sm">「' + searchInput.value + '」に一致する講座はありません</p>';
                    container.appendChild(msg);
                  }
                } else if (emptyMsg) {
                  emptyMsg.remove();
                }
              });
            }, 300);
          });
        }
        
        if (searchClear) {
          searchClear.addEventListener('click', function() {
            if (searchInput) {
              searchInput.value = '';
              searchInput.dispatchEvent(new Event('input'));
            }
          });
        }
      })();
    </script>

    <!-- 全講座グリッド（検索結果用・通常は非表示） -->
    <section class="hidden py-16 bg-future-light" id="search-results-section">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-800">検索結果</h2>
          <p class="text-gray-500 text-sm" id="search-results-count"></p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="search-results-grid">
        </div>
      </div>
    </section>

    <!-- Course Series Section（コース - 一番下に配置） -->
    ${courseSeriesList && courseSeriesList.length > 0 ? `
    <section class="py-16 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="inline-flex items-center bg-gradient-to-r from-ai-purple to-ai-blue text-white font-medium px-4 py-2 rounded-full text-sm mb-4">
            <i class="fas fa-layer-group mr-2"></i>COURSE SERIES
          </span>
          <h2 class="text-3xl font-bold text-future-text mb-4">コースで体系的に学ぶ</h2>
          <p class="text-future-textLight max-w-2xl mx-auto">
            複数回の講座を通じて、スキルを段階的に習得できるコースプログラムです。<br>
            単発参加・コース一括（早期割引あり）から選べます。
          </p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          ${courseSeriesList.map(series => `
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-future-sky/50 hover:shadow-2xl transition-all duration-300 group">
              <!-- ヘッダー画像 -->
              <div class="aspect-[21/9] relative overflow-hidden bg-gradient-to-br from-ai-purple/20 to-ai-blue/20">
                ${series.image ? `
                  <img loading="lazy" decoding="async" src="${series.image}" alt="${series.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                ` : `
                  <div class="w-full h-full flex items-center justify-center">
                    <i class="fas fa-layer-group text-6xl text-ai-purple/30"></i>
                  </div>
                `}
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div class="absolute top-4 left-4 flex gap-2">
                  <span class="bg-ai-purple text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    <i class="fas fa-layer-group mr-1"></i>全${series.total_sessions}回コース
                  </span>
                  ${series.is_featured ? `
                    <span class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      <i class="fas fa-star mr-1"></i>おすすめ
                    </span>
                  ` : ''}
                </div>
                <div class="absolute bottom-4 left-4 right-4">
                  <h3 class="text-xl font-bold text-white mb-1 line-clamp-2">${series.title}</h3>
                  ${series.subtitle ? `<p class="text-white/80 text-sm line-clamp-1">${series.subtitle}</p>` : ''}
                </div>
              </div>
              
              <!-- コンテンツ -->
              <div class="p-6">
                <div class="flex items-center gap-4 text-sm text-future-textLight mb-4">
                  <span><i class="fas fa-clock mr-1 text-ai-blue"></i>${series.duration_minutes}分/回</span>
                  <span><i class="fas fa-calendar-alt mr-1 text-ai-purple"></i>全${series.total_sessions}回</span>
                </div>
                
                ${series.description ? `<p class="text-future-textLight text-sm mb-4 line-clamp-2">${truncateText(series.description, 100)}</p>` : ''}
                
                <!-- 価格情報 -->
                <div class="bg-future-light rounded-xl p-4 mb-4">
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span class="text-future-textLight">単発参加</span>
                      <div class="font-bold text-future-text">¥${series.calc_single_price_incl.toLocaleString()}<span class="text-xs font-normal text-future-textLight">/回(税込)</span></div>
                    </div>
                    <div>
                      <span class="text-future-textLight">コース一括</span>
                      <div class="font-bold text-ai-blue">¥${series.calc_course_price_incl.toLocaleString()}<span class="text-xs font-normal text-future-textLight">(税込)</span></div>
                      <span class="text-xs text-nature-forest">¥${series.calc_savings_course.toLocaleString()}お得</span>
                    </div>
                    ${series.early_bird_deadline && new Date(series.early_bird_deadline) > new Date() ? `
                    <div class="col-span-2 border-t border-future-sky pt-3 mt-1">
                      <span class="text-orange-600 text-xs font-medium">
                        <i class="fas fa-clock mr-1"></i>早期申込 〜${new Date(series.early_bird_deadline).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})}まで
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="font-bold text-ai-purple text-lg">¥${series.calc_early_price_incl.toLocaleString()}<span class="text-xs font-normal text-future-textLight">(税込)</span></span>
                        <span class="text-xs text-nature-forest">¥${series.calc_savings_early.toLocaleString()}お得</span>
                      </div>
                    </div>
                    ` : ''}
                  </div>
                </div>
                
                <!-- アクション -->
                <div class="flex gap-3">
                  <a href="/series/${series.id}" class="flex-1 btn-ai gradient-ai text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition">
                    <i class="fas fa-list-ul mr-2"></i>全${series.total_sessions}回の内容を見る
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}

    <!-- CTA Section -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="rounded-3xl p-8 border" style="background: rgba(255,255,255,0.9); border-color: rgba(107, 155, 98, 0.2);">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
            <i class="fas fa-question text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold mb-4" style="color: #1E293B;">
            どの講座を選べばいいかわからない？
          </h2>
          <p class="mb-6" style="color: #64748B;">
            お気軽にお問い合わせください。あなたに最適な講座をご提案いたします。
          </p>
          <a href="/contact" class="btn-ai inline-flex items-center justify-center text-white px-6 py-3 rounded-full font-bold shadow-lg" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
            <i class="fas fa-envelope mr-2"></i>相談する
          </a>
        </div>
      </div>
    </section>

    <!-- ===== 講座推薦チャットボット ===== -->
    <script>
    (function() {
      const chatMessages = document.getElementById('chat-messages');
      const chatInput = document.getElementById('chat-input');
      const chatSend = document.getElementById('chat-send');
      const chatbotSection = document.getElementById('chatbot-section');
      const aiAdvisorBtn = document.getElementById('ai-advisor-btn');
      const aiBtnIcon = document.getElementById('ai-btn-icon');
      const chatbotClose = document.getElementById('chatbot-close');
      
      let conversationHistory = [];
      let isLoading = false;
      let isChatbotOpen = false;
      
      // AI相談ボタンでチャットボット開閉
      if (aiAdvisorBtn && chatbotSection) {
        aiAdvisorBtn.addEventListener('click', function() {
          isChatbotOpen = !isChatbotOpen;
          if (isChatbotOpen) {
            chatbotSection.classList.remove('hidden');
            aiBtnIcon.classList.add('rotate-180');
            // スムーズスクロール
            chatbotSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            chatbotSection.classList.add('hidden');
            aiBtnIcon.classList.remove('rotate-180');
          }
        });
      }
      
      // 閉じるボタン
      if (chatbotClose && chatbotSection) {
        chatbotClose.addEventListener('click', function() {
          chatbotSection.classList.add('hidden');
          aiBtnIcon.classList.remove('rotate-180');
          isChatbotOpen = false;
        });
      }
      
      // 選択肢ボタンのイベント（初期 + 動的生成分）
      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('chat-option')) {
          const value = e.target.dataset.value;
          if (value && !isLoading) {
            // 「最初からやり直す」の場合はリセット
            if (value === '最初からやり直す') {
              resetChat();
              return;
            }
            
            sendMessage(value);
            // 選択肢を非表示
            const optionsContainer = e.target.parentElement;
            if (optionsContainer) {
              optionsContainer.style.display = 'none';
            }
          }
        }
      });
      
      // チャットをリセット
      function resetChat() {
        conversationHistory = [];
        chatMessages.innerHTML = \`
          <div class="chat-message bot flex gap-3">
            <div class="w-8 h-8 bg-cafe-wood rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-robot text-white text-xs"></i>
            </div>
            <div class="flex-1">
              <div class="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm border border-cafe-beige/50 max-w-lg">
                <p class="text-cafe-text text-sm">こんにちは！講座アドバイザーのmionです😊</p>
                <p class="text-cafe-text text-sm mt-1">どんな目的で学びたいですか？</p>
              </div>
              <div class="flex flex-wrap gap-2 mt-2" id="initial-options">
                <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="仕事でAIを活用して効率化したい">
                  💼 仕事で効率化
                </button>
                <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="資格取得や勉強に役立てたい">
                  📚 勉強・資格
                </button>
                <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="教育現場でAIを活用したい">
                  🏫 教育現場
                </button>
                <button class="chat-option px-3 py-1.5 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-xs font-medium transition-all border border-cafe-beige" data-value="趣味や興味でAIを学びたい">
                  🎨 趣味・興味
                </button>
              </div>
            </div>
          </div>
        \`;
      }
      
      // 送信ボタン
      if (chatSend) {
        chatSend.addEventListener('click', function() {
          const message = chatInput.value.trim();
          if (message && !isLoading) {
            sendMessage(message);
            chatInput.value = '';
          }
        });
      }
      
      // Enterキーで送信
      if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter' && !isLoading) {
            const message = chatInput.value.trim();
            if (message) {
              sendMessage(message);
              chatInput.value = '';
            }
          }
        });
      }
      
      // メッセージ送信
      async function sendMessage(message) {
        if (isLoading) return;
        isLoading = true;
        
        // ユーザーメッセージを表示
        addMessage(message, 'user');
        
        // 初期選択肢を非表示
        const initialOptions = document.getElementById('initial-options');
        if (initialOptions) {
          initialOptions.style.display = 'none';
        }
        
        // ローディング表示
        const loadingId = addLoadingMessage();
        
        try {
          const response = await fetch('/api/chat/course-recommendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: message,
              conversation_history: conversationHistory
            })
          });
          
          const data = await response.json();
          
          // ローディング削除
          removeLoadingMessage(loadingId);
          
          if (data.success && data.response) {
            conversationHistory = data.conversation_history || [];
            
            // ボットの応答を表示
            addBotMessage(data.response);
          } else {
            addMessage('申し訳ございません、エラーが発生しました。もう一度お試しください。', 'bot');
          }
        } catch (error) {
          console.error('Chat error:', error);
          removeLoadingMessage(loadingId);
          addMessage('通信エラーが発生しました。もう一度お試しください。', 'bot');
        }
        
        isLoading = false;
      }
      
      // メッセージ追加（ユーザー）
      function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message ' + type + ' flex gap-3 ' + (type === 'user' ? 'justify-end' : '');
        
        if (type === 'user') {
          messageDiv.innerHTML = \`
            <div class="flex-1 flex justify-end">
              <div class="bg-cafe-wood text-white rounded-2xl rounded-tr-sm p-4 shadow-sm max-w-lg">
                <p>\${escapeHtml(text)}</p>
              </div>
            </div>
            <div class="w-10 h-10 bg-cafe-caramel rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-user text-white text-sm"></i>
            </div>
          \`;
        } else {
          messageDiv.innerHTML = \`
            <div class="w-10 h-10 bg-cafe-wood rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="flex-1">
              <div class="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-cafe-beige/50 max-w-lg">
                <p class="text-cafe-text">\${escapeHtml(text)}</p>
              </div>
            </div>
          \`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      
      // ボットメッセージ追加（選択肢・講座提案含む）
      function addBotMessage(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot flex gap-3';
        
        let optionsHtml = '';
        let coursesHtml = '';
        let followUpHtml = '';
        
        // 選択肢がある場合
        if (response.options && response.options.length > 0) {
          optionsHtml = '<div class="flex flex-wrap gap-2 mt-3">';
          response.options.forEach(function(opt) {
            optionsHtml += '<button class="chat-option px-4 py-2 bg-cafe-latte/50 hover:bg-cafe-wood hover:text-white text-cafe-text rounded-full text-sm font-medium transition-all border border-cafe-beige" data-value="' + escapeHtml(opt) + '">' + escapeHtml(opt) + '</button>';
          });
          optionsHtml += '</div>';
        }
        
        // 講座提案がある場合
        if (response.recommended_courses && response.recommended_courses.length > 0) {
          coursesHtml = '<div class="mt-4 space-y-3">';
          coursesHtml += '<p class="text-sm text-cafe-textLight font-medium">🎯 おすすめ講座:</p>';
          response.recommended_courses.forEach(function(course) {
            coursesHtml += \`
              <a href="/courses/\${course.id}" class="block bg-cafe-ivory hover:bg-cafe-latte/50 rounded-xl p-4 border border-cafe-beige transition-all group">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-cafe-wood rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-cafe-caramel transition-colors">
                    <i class="fas fa-book-open text-white"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-cafe-text group-hover:text-cafe-wood transition-colors">\${escapeHtml(course.title)}</h4>
                    <p class="text-sm text-cafe-textLight mt-1">\${escapeHtml(course.reason)}</p>
                    <span class="inline-flex items-center text-xs text-cafe-wood mt-2 font-medium">
                      詳細を見る <i class="fas fa-arrow-right ml-1"></i>
                    </span>
                  </div>
                </div>
              </a>
            \`;
          });
          coursesHtml += '</div>';
          
          // 講座提案後のフォローアップボタン
          if (response.has_more_options) {
            // さらに絞り込み可能な場合
            followUpHtml = \`
              <div class="flex flex-wrap gap-2 mt-3">
                <button class="chat-option px-4 py-2 bg-cafe-wood hover:bg-cafe-caramel text-white rounded-full text-sm font-medium transition-all" data-value="もっと詳しく絞り込みたい">
                  <i class="fas fa-filter mr-1"></i>もっと詳しく絞り込む
                </button>
                <button class="chat-option chat-option-secondary px-4 py-2 bg-transparent hover:bg-cafe-beige text-cafe-textLight rounded-full text-sm font-medium transition-all border border-cafe-beige" data-value="これで十分です、ありがとう">
                  <i class="fas fa-check mr-1"></i>これで十分です
                </button>
              </div>
            \`;
          } else {
            // 最終推薦の場合
            followUpHtml = \`
              <div class="flex flex-wrap gap-2 mt-3">
                <button class="chat-option chat-option-secondary px-4 py-2 bg-transparent hover:bg-cafe-beige text-cafe-textLight rounded-full text-sm font-medium transition-all border border-cafe-beige" data-value="最初からやり直す">
                  <i class="fas fa-redo mr-1"></i>最初からやり直す
                </button>
              </div>
            \`;
          }
        }
        
        messageDiv.innerHTML = \`
          <div class="w-10 h-10 bg-cafe-wood rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-robot text-white text-sm"></i>
          </div>
          <div class="flex-1">
            <div class="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-cafe-beige/50 max-w-lg">
              <p class="text-cafe-text whitespace-pre-wrap">\${escapeHtml(response.message || '')}</p>
              \${coursesHtml}
            </div>
            \${optionsHtml}
            \${followUpHtml}
          </div>
        \`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      
      // ローディングメッセージ
      function addLoadingMessage() {
        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.id = id;
        messageDiv.className = 'chat-message bot flex gap-3';
        messageDiv.innerHTML = \`
          <div class="w-10 h-10 bg-cafe-wood rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-robot text-white text-sm"></i>
          </div>
          <div class="flex-1">
            <div class="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border border-cafe-beige/50 max-w-lg">
              <div class="flex items-center gap-2 text-cafe-textLight">
                <i class="fas fa-circle-notch fa-spin"></i>
                <span>考え中...</span>
              </div>
            </div>
          </div>
        \`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
      }
      
      function removeLoadingMessage(id) {
        const loadingMsg = document.getElementById(id);
        if (loadingMsg) {
          loadingMsg.remove();
        }
      }
      
      function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
    })();
    </script>
  `

  return renderLayout('講座一覧', content, 'courses')
}

// 講座詳細ページ（完全リニューアル版）
export const renderCourseDetailPage = (course: Course, schedules: Schedule[], allCourses: Course[], seriesInfo?: SeriesInfo | null) => {
  // 関連講座（同じカテゴリで自分以外、最大3件）
  const relatedCourses = allCourses
    .filter(c => c.id !== course.id && c.category === course.category)
    .slice(0, 3)
  
  // この講座の日程を取得
  const courseSchedules = schedules.filter(s => s.courseId === course.id)
  
  const content = `
    <!-- Hero Section -->
    <section class="relative">
      <!-- 戻るボタン（画像の上に固定） -->
      <a href="/courses" class="absolute top-4 left-4 z-10 inline-flex items-center bg-white/90 backdrop-blur-sm text-future-textLight hover:text-ai-blue hover:bg-white transition-all px-4 py-2 rounded-full shadow-md min-h-[44px]">
        <i class="fas fa-arrow-left mr-2"></i>
        <span class="text-sm font-medium">講座一覧に戻る</span>
      </a>
      
      <div class="aspect-[3/1] max-h-96 overflow-hidden">
        <img loading="lazy" decoding="async" src="${course.image}" alt="${course.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-future-text/90 via-future-text/50 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="gradient-ai text-white text-sm font-bold px-4 py-1.5 rounded-full shadow">${course.level}</span>
            <span class="glass text-future-text text-sm font-bold px-4 py-1.5 rounded-full">${course.category}</span>
            <span class="glass text-future-text text-sm font-bold px-4 py-1.5 rounded-full">
              <i class="fas fa-clock mr-1"></i>${course.duration}
            </span>
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">${course.title}</h1>
          ${course.catchphrase ? `<p class="text-white/80 text-lg">${course.catchphrase}</p>` : ''}
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-10 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row gap-8">
          
          <!-- Left Column: Main Content -->
          <div class="flex-1 min-w-0 space-y-8">
            
            <!-- 講座概要 -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-info text-white"></i>
                </span>
                この講座について
              </h2>
              <div class="text-future-textLight leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1">${course.longDescription}</div>
            </div>

            <!-- こんな方におすすめ -->
            ${course.targetAudience && course.targetAudience.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-4 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-user-check text-white"></i>
                </span>
                こんな方におすすめ
              </h2>
              <div class="space-y-3">
                ${course.targetAudience.map(item => `
                  <div class="flex items-start">
                    <div class="w-6 h-6 bg-nature-mint rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <i class="fas fa-check text-nature-forest text-xs"></i>
                    </div>
                    <span class="text-future-text">${item}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- カリキュラム -->
            ${course.curriculum && course.curriculum.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-list-ol text-white"></i>
                </span>
                カリキュラム
              </h2>
              <div class="space-y-4" id="curriculum-accordion">
                ${course.curriculum.map((item, index) => `
                  <div class="curriculum-item border border-future-sky rounded-xl overflow-hidden">
                    <button class="curriculum-toggle w-full flex items-center justify-between p-4 bg-future-light hover:bg-ai-blue/5 transition-colors text-left" data-index="${index}">
                      <div class="flex items-center">
                        <span class="w-8 h-8 gradient-ai rounded-lg flex items-center justify-center mr-3 text-white text-sm font-bold">${index + 1}</span>
                        <div>
                          <h3 class="font-bold text-future-text">${item.title}</h3>
                          <span class="text-sm text-future-textLight"><i class="fas fa-clock mr-1"></i>${item.duration}</span>
                        </div>
                      </div>
                      <i class="fas fa-chevron-down text-ai-blue transition-transform curriculum-icon"></i>
                    </button>
                    <div class="curriculum-content hidden p-4 pt-0 bg-white">
                      <ul class="space-y-2 ml-11">
                        ${item.contents.map(content => `
                          <li class="flex items-start text-future-textLight">
                            <i class="fas fa-circle text-ai-blue text-xs mr-2 mt-1.5"></i>
                            ${content}
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}



            <!-- これまでの開催の様子（ギャラリー） -->
            ${course.gallery && course.gallery.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-images text-white"></i>
                </span>
                これまでの開催の様子
              </h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                ${course.gallery.map((img, index) => `
                  <div class="gallery-item cursor-pointer group" data-index="${index}">
                    <div class="aspect-square rounded-xl overflow-hidden">
                      <img src="${img.url}" alt="${img.caption}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">
                    </div>
                    <p class="text-xs text-future-textLight mt-2 text-center">${img.caption}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- 画像モーダル -->
            <div id="gallery-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/95 p-2 sm:p-4" onclick="if(event.target === this) closeModal()">
              <!-- 閉じるボタン（大きく、タップしやすく） -->
              <button id="modal-close" class="absolute top-3 right-3 sm:top-4 sm:right-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all z-10" aria-label="閉じる">
                <i class="fas fa-times text-xl sm:text-2xl"></i>
              </button>
              <!-- 前へボタン -->
              <button id="modal-prev" class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all z-10" aria-label="前の画像">
                <i class="fas fa-chevron-left text-lg sm:text-xl"></i>
              </button>
              <!-- 次へボタン -->
              <button id="modal-next" class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all z-10" aria-label="次の画像">
                <i class="fas fa-chevron-right text-lg sm:text-xl"></i>
              </button>
              <div class="max-w-4xl max-h-[85vh] sm:max-h-[80vh] px-12 sm:px-16">
                <img loading="lazy" decoding="async" id="modal-image" src="" alt="" class="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain mx-auto rounded-lg">
                <p id="modal-caption" class="text-white text-center mt-3 sm:mt-4 text-sm sm:text-base px-4"></p>
              </div>
            </div>
            ` : ''}

            <!-- 受講者の声（レビュー）セクション -->
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50" id="reviews-section">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-star text-white"></i>
                </span>
                受講者の声・レビュー
              </h2>

              <!-- Review Summary -->
              <div class="mb-6 p-5 bg-future-light rounded-xl">
                <div class="flex flex-col sm:flex-row items-center gap-6">
                  <div class="text-center">
                    <div class="text-4xl font-bold gradient-ai-text" id="avg-rating">-</div>
                    <div class="flex justify-center mt-1" id="avg-stars">
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                      <i class="fas fa-star text-gray-300"></i>
                    </div>
                    <div class="text-future-textLight text-sm mt-1"><span id="total-reviews">0</span>件</div>
                  </div>
                  <div class="flex-1 w-full">
                    <div class="space-y-1">
                      ${[5,4,3,2,1].map(star => `
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-future-textLight w-8">${star}つ星</span>
                          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-400 rounded-full transition-all duration-500" id="bar-${star}" style="width: 0%"></div>
                          </div>
                          <span class="text-xs text-future-textLight w-8 text-right" id="count-${star}">0</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Review List -->
              <div id="reviews-list" class="space-y-4 mb-6">
                <div class="text-center py-6 text-future-textLight">
                  <i class="fas fa-spinner fa-spin text-xl mb-2"></i>
                  <p class="text-sm">レビューを読み込み中...</p>
                </div>
              </div>

              <!-- Pagination -->
              <div id="reviews-pagination" class="flex justify-center gap-2 mb-6 hidden"></div>

              <!-- Write Review Button -->
              <div class="text-center">
                <button id="btn-write-review" class="btn-ai text-white px-6 py-3 rounded-full font-medium shadow-lg" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
                  <i class="fas fa-pen mr-2"></i>レビューを書く
                </button>
              </div>

              <!-- Review Form -->
              <div id="review-form-container" class="hidden mt-6 p-5 bg-future-light rounded-xl">
                <h3 class="text-lg font-bold text-future-text mb-4 flex items-center">
                  <i class="fas fa-edit text-ai-blue mr-2"></i>レビューを投稿
                </h3>
                <form id="review-form" class="space-y-4">
                  <input type="hidden" name="courseId" value="${course.id}">
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-future-text text-sm font-medium mb-1">お名前（ニックネーム可）<span class="text-red-500">*</span></label>
                      <input type="text" name="reviewerName" required maxlength="50"
                        class="w-full px-4 py-2.5 rounded-xl border border-future-sky focus:border-ai-blue focus:ring-2 focus:ring-ai-blue/20 outline-none transition-all"
                        placeholder="山田 太郎">
                    </div>
                    <div>
                      <label class="block text-future-text text-sm font-medium mb-1">メールアドレス（非公開）<span class="text-red-500">*</span></label>
                      <input type="email" name="reviewerEmail" required
                        class="w-full px-4 py-2.5 rounded-xl border border-future-sky focus:border-ai-blue focus:ring-2 focus:ring-ai-blue/20 outline-none transition-all"
                        placeholder="example@email.com">
                    </div>
                  </div>

                  <div>
                    <label class="block text-future-text text-sm font-medium mb-1">評価<span class="text-red-500">*</span></label>
                    <div class="flex gap-1" id="star-rating">
                      ${[1,2,3,4,5].map(i => `<button type="button" class="star-btn text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${i}"><i class="fas fa-star"></i></button>`).join('')}
                    </div>
                    <input type="hidden" name="rating" id="rating-input" required>
                  </div>

                  <div>
                    <label class="block text-future-text text-sm font-medium mb-1">コメント<span class="text-red-500">*</span></label>
                    <textarea name="comment" required maxlength="500" rows="4"
                      class="w-full px-4 py-2.5 rounded-xl border border-future-sky focus:border-ai-blue focus:ring-2 focus:ring-ai-blue/20 outline-none transition-all resize-none"
                      placeholder="講座の感想をお聞かせください..."></textarea>
                    <div class="text-right text-xs text-future-textLight mt-1"><span id="char-count">0</span>/500</div>
                  </div>

                  <div class="flex gap-3">
                    <button type="submit" class="btn-ai text-white flex-1 py-2.5 rounded-xl font-medium" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
                      <i class="fas fa-paper-plane mr-2"></i>投稿する
                    </button>
                    <button type="button" id="btn-cancel-review" class="flex-1 py-2.5 rounded-xl font-medium border hover:bg-gray-50" style="background: rgba(255,255,255,0.9); color: #1E293B; border-color: #E2E8F0;">
                      キャンセル
                    </button>
                  </div>
                </form>

                <div id="review-success" class="hidden text-center py-6">
                  <div class="w-14 h-14 bg-nature-mint rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-check text-nature-forest text-xl"></i>
                  </div>
                  <h4 class="text-lg font-bold text-future-text mb-1">ありがとうございます！</h4>
                  <p class="text-future-textLight text-sm">レビューは承認後に表示されます。</p>
                </div>
              </div>
            </div>

            <!-- よくある質問（FAQ） -->
            ${course.faq && course.faq.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-question text-white"></i>
                </span>
                よくある質問
              </h2>
              <div class="space-y-3" id="faq-accordion">
                ${course.faq.map((item, index) => `
                  <div class="faq-item border border-future-sky rounded-xl overflow-hidden">
                    <button class="faq-toggle w-full flex items-center justify-between p-4 hover:bg-future-light transition-colors text-left" data-index="${index}">
                      <div class="flex items-start">
                        <span class="w-7 h-7 bg-ai-blue/10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-ai-blue font-bold text-sm">Q</span>
                        <span class="font-medium text-future-text">${item.question}</span>
                      </div>
                      <i class="fas fa-chevron-down text-ai-blue transition-transform faq-icon ml-2 flex-shrink-0"></i>
                    </button>
                    <div class="faq-content hidden p-4 pt-0 bg-white">
                      <div class="flex items-start ml-10">
                        <span class="w-7 h-7 bg-nature-mint rounded-lg flex items-center justify-center mr-3 flex-shrink-0 text-nature-forest font-bold text-sm">A</span>
                        <p class="text-future-textLight">${item.answer}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

            <!-- 開催日程 -->
            ${courseSchedules.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50" id="schedule-section">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-calendar-alt text-white"></i>
                </span>
                開催日程
              </h2>
              <div class="space-y-3">
                ${courseSchedules.map(schedule => {
                  const date = new Date(schedule.date)
                  const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
                  const remaining = schedule.capacity - schedule.enrolled
                  const isFull = remaining <= 0
                  const isAlmostFull = remaining <= 3 && remaining > 0
                  
                  return `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-future-sky rounded-xl ${isFull ? 'bg-gray-50' : 'hover:border-ai-blue/50'} transition-colors">
                      <div class="flex items-center mb-3 sm:mb-0">
                        <div class="w-14 h-14 bg-future-light rounded-xl flex flex-col items-center justify-center mr-4">
                          <span class="text-lg font-bold text-future-text">${date.getDate()}</span>
                          <span class="text-xs text-future-textLight">${date.getMonth() + 1}月</span>
                        </div>
                        <div>
                          <p class="font-bold text-future-text">${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${dayOfWeek}）</p>
                          <p class="text-sm text-future-textLight">
                            <i class="fas fa-clock mr-1"></i>${schedule.startTime} - ${schedule.endTime}
                            <span class="ml-2"><i class="fas fa-map-marker-alt mr-1"></i>${schedule.location}</span>
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 sm:ml-4">
                        ${isFull ? `
                          <span class="text-sm text-gray-500 bg-gray-200 px-3 py-1 rounded-full">満席</span>
                        ` : `
                          <span class="text-sm ${isAlmostFull ? 'text-red-500 font-medium' : 'text-future-textLight'}">
                            残席 ${remaining}名
                          </span>
                          <a href="/reservation?course=${course.id}&schedule=${schedule.id}" 
                             class="btn-ai text-white px-5 py-2 rounded-full text-sm font-medium shadow" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
                            予約する
                          </a>
                        `}
                      </div>
                    </div>
                  `
                }).join('')}
              </div>
            </div>
            ` : ''}

            <!-- 関連講座 -->
            ${relatedCourses.length > 0 ? `
            <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-future-sky/50">
              <h2 class="text-xl font-bold text-future-text mb-6 flex items-center">
                <span class="w-10 h-10 gradient-ai rounded-xl flex items-center justify-center mr-3 shadow">
                  <i class="fas fa-th-large text-white"></i>
                </span>
                関連講座
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${relatedCourses.map(related => `
                  <a href="/courses/${related.id}" class="card-hover block bg-future-light rounded-xl overflow-hidden border border-future-sky/50">
                    <div class="aspect-video overflow-hidden">
                      <img src="${related.image}" alt="${related.title}" class="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy">
                    </div>
                    <div class="p-4">
                      <span class="text-xs text-ai-blue font-medium">${related.category}</span>
                      <h3 class="font-bold text-future-text mt-1 line-clamp-2">${related.title}</h3>
                      <p class="text-sm gradient-ai-text font-bold mt-2">¥${related.price.toLocaleString()}<span class="text-xs font-normal text-future-textLight">(税込)</span></p>
                    </div>
                  </a>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Right Column: Sidebar (Sticky) -->
          <div class="w-full lg:w-80 flex-shrink-0">
            <div class="bg-white rounded-2xl p-6 shadow-lg sticky top-24 border border-future-sky/50">
              
              <!-- 評価サマリー -->
              <div class="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-future-sky">
                <div class="flex text-yellow-400" id="sidebar-stars">
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star"></i>
                  <i class="fas fa-star text-gray-300"></i>
                </div>
                <span class="font-bold text-future-text" id="sidebar-rating">-</span>
                <span class="text-future-textLight text-sm">(<span id="sidebar-reviews">0</span>件)</span>
              </div>

              <!-- 価格 -->
              ${seriesInfo ? `
              <!-- シリーズ講座：価格選択UI -->
              <div class="mb-6" id="pricing-selector">
                <div class="text-center mb-4">
                  <span class="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-ai-purple/10 text-ai-purple">
                    <i class="fas fa-layer-group mr-1"></i>全${seriesInfo.total_sessions}回コース
                  </span>
                  <p class="text-sm text-future-textLight mt-1">${seriesInfo.title}</p>
                </div>
                
                <!-- 価格オプション -->
                <div class="space-y-2">
                  <!-- 単発受講 -->
                  <label class="pricing-option block cursor-pointer">
                    <input type="radio" name="pricing_type" value="single" class="hidden" checked>
                    <div class="border-2 border-future-sky rounded-xl p-3 hover:border-ai-blue transition-all pricing-card">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <div class="w-5 h-5 border-2 border-future-sky rounded-full mr-3 flex items-center justify-center pricing-radio">
                            <div class="w-2.5 h-2.5 bg-ai-blue rounded-full opacity-0 pricing-dot"></div>
                          </div>
                          <div>
                            <span class="font-medium text-future-text text-sm">単発受講</span>
                            <span class="text-xs text-future-textLight ml-1">（第${seriesInfo.currentSessionNumber || 1}回のみ）</span>
                          </div>
                        </div>
                        <span class="font-bold text-future-text">¥${seriesInfo.calc_single_price_incl.toLocaleString()}</span>
                      </div>
                    </div>
                  </label>
                  
                  <!-- コース一括 -->
                  <label class="pricing-option block cursor-pointer">
                    <input type="radio" name="pricing_type" value="course" class="hidden">
                    <div class="border-2 border-future-sky rounded-xl p-3 hover:border-ai-blue transition-all pricing-card relative">
                      <div class="absolute -top-2 -right-2 bg-ai-blue text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        ${Math.round((seriesInfo.course_discount_rate || 0.1) * 100)}%OFF
                      </div>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <div class="w-5 h-5 border-2 border-future-sky rounded-full mr-3 flex items-center justify-center pricing-radio">
                            <div class="w-2.5 h-2.5 bg-ai-blue rounded-full opacity-0 pricing-dot"></div>
                          </div>
                          <div>
                            <span class="font-medium text-future-text text-sm">コース一括</span>
                            <span class="text-xs text-future-textLight ml-1">（全${seriesInfo.total_sessions}回）</span>
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="font-bold text-ai-blue">¥${seriesInfo.calc_course_price_incl.toLocaleString()}</span>
                          <p class="text-xs text-nature-forest">¥${seriesInfo.calc_savings_course.toLocaleString()}お得</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  
                  <!-- 早期申込（期限内のみ表示） -->
                  ${seriesInfo.early_bird_deadline && new Date(seriesInfo.early_bird_deadline) > new Date() ? `
                  <label class="pricing-option block cursor-pointer">
                    <input type="radio" name="pricing_type" value="early" class="hidden">
                    <div class="border-2 border-future-sky rounded-xl p-3 hover:border-ai-blue transition-all pricing-card relative">
                      <div class="absolute -top-2 -right-2 bg-gradient-to-r from-ai-purple to-ai-pink text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        ${Math.round((seriesInfo.early_bird_discount_rate || 0.17) * 100)}%OFF
                      </div>
                      <div class="flex items-center justify-between">
                        <div class="flex items-center">
                          <div class="w-5 h-5 border-2 border-future-sky rounded-full mr-3 flex items-center justify-center pricing-radio">
                            <div class="w-2.5 h-2.5 bg-ai-blue rounded-full opacity-0 pricing-dot"></div>
                          </div>
                          <div>
                            <span class="font-medium text-future-text text-sm">早期申込</span>
                            <span class="text-xs text-red-500 ml-1">〜${new Date(seriesInfo.early_bird_deadline).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})}まで</span>
                          </div>
                        </div>
                        <div class="text-right">
                          <span class="font-bold text-ai-purple">¥${seriesInfo.calc_early_price_incl.toLocaleString()}</span>
                          <p class="text-xs text-nature-forest">¥${seriesInfo.calc_savings_early.toLocaleString()}お得</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  ` : ''}
                  
                  <!-- 月額払い（現在は無効化 - Subscription実装が必要） -->
                  <!-- 月額払いは一括決済ではなく定期課金（Subscription）の実装が必要なため、現在は非表示 -->
                </div>
                
                <p class="text-xs text-future-textLight text-center mt-3">※すべて税込価格です</p>
              </div>
              
              <style>
                .pricing-option input:checked + .pricing-card {
                  border-color: #6B9B62;
                  background: rgba(107, 155, 98, 0.05);
                }
                .pricing-option input:checked + .pricing-card .pricing-radio {
                  border-color: #6B9B62;
                }
                .pricing-option input:checked + .pricing-card .pricing-dot {
                  opacity: 1;
                }
              </style>
              ` : `
              <!-- 単発講座：通常の価格表示 -->
              <div class="text-center mb-6">
                <span class="text-sm text-future-textLight">受講料</span>
                <p class="text-4xl font-bold gradient-ai-text">¥${course.price.toLocaleString()}</p>
                <span class="text-sm text-future-textLight">（税込）</span>
              </div>
              `}

              <!-- 講座情報 -->
              <div class="space-y-3 mb-6">
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-clock w-8 text-ai-cyan"></i>
                  <span class="text-sm">${course.duration}</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-laptop w-8 text-ai-blue"></i>
                  <span class="text-sm">オンライン開催（Google Meet）</span>
                </div>
                <div class="flex items-center text-future-text bg-future-light rounded-xl p-3">
                  <i class="fas fa-users w-8 text-ai-purple"></i>
                  <span class="text-sm">少人数制（最大${course.maxCapacity || 10}名）</span>
                </div>

              </div>

              <!-- 含まれるもの -->
              ${course.includes && course.includes.length > 0 ? `
              <div class="mb-6 pb-6 border-b border-future-sky">
                <p class="text-sm font-medium text-future-text mb-2">受講に含まれるもの</p>
                <ul class="space-y-1.5">
                  ${course.includes.map(item => `
                    <li class="flex items-start text-sm text-future-textLight">
                      <i class="fas fa-check text-nature-forest mr-2 mt-0.5"></i>
                      ${item}
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              <!-- CTAボタン -->
              ${seriesInfo ? `
              <button id="reserve-btn" onclick="goToReservation()" class="btn-ai block w-full text-white text-center py-4 rounded-full font-bold shadow-lg mb-3" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
                <i class="fas fa-calendar-check mr-2"></i>日程を選んで予約
              </button>
              <script>
                function goToReservation() {
                  var pricingType = document.querySelector('input[name="pricing_type"]:checked');
                  var type = pricingType ? pricingType.value : 'single';
                  // 単発の場合はシリーズのセッション選択へ、それ以外はシリーズ予約へ
                  window.location.href = '/reservation?series=${seriesInfo.id}&pricing=' + type;
                }
              </script>
              ` : `
              <a href="/reservation?course=${course.id}" class="btn-ai block w-full text-white text-center py-4 rounded-full font-bold shadow-lg mb-3" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
                <i class="fas fa-calendar-check mr-2"></i>日程を選んで予約
              </a>
              `}

              <!-- 日程セクションへスクロール -->
              ${courseSchedules.length > 0 ? `
              <button onclick="document.getElementById('schedule-section').scrollIntoView({behavior:'smooth'})" class="block w-full text-center py-3 rounded-full font-medium border transition-colors mb-4" style="background: rgba(255,255,255,0.9); color: #1E293B; border-color: #E2E8F0;">
                <i class="fas fa-calendar mr-2"></i>開催日程を見る
              </button>
              ` : ''}

              <!-- キャンセルポリシー -->
              ${course.cancellationPolicy ? `
              <div class="p-4 bg-future-light rounded-xl mb-4">
                <p class="text-xs font-medium text-future-text mb-1">キャンセルポリシー</p>
                <p class="text-xs text-future-textLight">${course.cancellationPolicy}</p>
              </div>
              ` : ''}

              <!-- お問い合わせリンク -->
              <div class="text-center">
                <a href="/contact" class="text-ai-blue hover:text-ai-purple text-sm transition-colors">
                  <i class="fas fa-question-circle mr-1"></i>ご質問はこちら
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="glass rounded-3xl p-8 border border-ai-blue/20">
          <h2 class="text-2xl font-bold text-future-text mb-4">今すぐ学び始めませんか？</h2>
          <p class="text-future-textLight mb-6">${truncateText(course.catchphrase || course.description, 150)}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/reservation?course=${course.id}" class="btn-ai text-white px-8 py-4 rounded-full font-bold shadow-lg" style="background: linear-gradient(135deg, #6B9B62 0%, #B8956A 100%);">
              <i class="fas fa-calendar-check mr-2"></i>今すぐ予約する
            </a>
            <a href="/contact" class="px-8 py-4 rounded-full font-bold border transition-colors" style="background: rgba(255,255,255,0.9); color: #1E293B; border-color: #E2E8F0;">
              <i class="fas fa-envelope mr-2"></i>まずは相談する
            </a>
          </div>
        </div>
      </div>
    </section>

    <style>
      .star-btn.active { color: #FBBF24; }
      .curriculum-item.open .curriculum-icon { transform: rotate(180deg); }
      .faq-item.open .faq-icon { transform: rotate(180deg); }
    </style>

    <script>
      (function() {
        var courseId = '${course.id}';
        var galleryImages = ${JSON.stringify(course.gallery || [])};
        var currentImageIndex = 0;

        // ===== カリキュラムアコーディオン =====
        document.querySelectorAll('.curriculum-toggle').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var item = this.closest('.curriculum-item');
            var content = item.querySelector('.curriculum-content');
            var isOpen = item.classList.contains('open');
            
            // 他を閉じる
            document.querySelectorAll('.curriculum-item').forEach(function(i) {
              i.classList.remove('open');
              i.querySelector('.curriculum-content').classList.add('hidden');
            });
            
            if (!isOpen) {
              item.classList.add('open');
              content.classList.remove('hidden');
            }
          });
        });
        // 最初のカリキュラムを開く
        var firstCurriculum = document.querySelector('.curriculum-item');
        if (firstCurriculum) {
          firstCurriculum.classList.add('open');
          firstCurriculum.querySelector('.curriculum-content').classList.remove('hidden');
        }

        // ===== FAQアコーディオン =====
        document.querySelectorAll('.faq-toggle').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var item = this.closest('.faq-item');
            var content = item.querySelector('.faq-content');
            var isOpen = item.classList.contains('open');
            
            if (isOpen) {
              item.classList.remove('open');
              content.classList.add('hidden');
            } else {
              item.classList.add('open');
              content.classList.remove('hidden');
            }
          });
        });

        // ===== ギャラリーモーダル =====
        var modal = document.getElementById('gallery-modal');
        var modalImage = document.getElementById('modal-image');
        var modalCaption = document.getElementById('modal-caption');
        
        if (modal && galleryImages.length > 0) {
          document.querySelectorAll('.gallery-item').forEach(function(item) {
            item.addEventListener('click', function() {
              currentImageIndex = parseInt(this.dataset.index);
              showModalImage();
              modal.classList.remove('hidden');
              modal.classList.add('flex');
            });
          });

          document.getElementById('modal-close').addEventListener('click', closeModal);
          modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
          });

          document.getElementById('modal-prev').addEventListener('click', function() {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            showModalImage();
          });

          document.getElementById('modal-next').addEventListener('click', function() {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            showModalImage();
          });

          function showModalImage() {
            modalImage.src = galleryImages[currentImageIndex].url;
            modalCaption.textContent = galleryImages[currentImageIndex].caption;
          }

          function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
          }

          // キーボード操作
          document.addEventListener('keydown', function(e) {
            if (!modal.classList.contains('hidden')) {
              if (e.key === 'Escape') closeModal();
              if (e.key === 'ArrowLeft') document.getElementById('modal-prev').click();
              if (e.key === 'ArrowRight') document.getElementById('modal-next').click();
            }
          });
        }

        // ===== レビュー機能 =====
        var currentPage = 1;

        function loadReviews(page) {
          page = page || 1;
          currentPage = page;
          fetch('/api/reviews/' + courseId + '?page=' + page)
            .then(function(res) { return res.json(); })
            .then(function(data) {
              renderSummary(data.stats);
              renderReviews(data.reviews);
              renderPagination(data.pagination);
              updateSidebarRating(data.stats);
            })
            .catch(function(err) {
              console.error('Failed to load reviews:', err);
              document.getElementById('reviews-list').innerHTML = 
                '<p class="text-center text-future-textLight py-6 text-sm">レビューの読み込みに失敗しました</p>';
            });
        }

        function renderSummary(stats) {
          document.getElementById('avg-rating').textContent = stats.average || '-';
          document.getElementById('total-reviews').textContent = stats.total;
          
          var avgStars = document.getElementById('avg-stars');
          avgStars.innerHTML = '';
          for (var i = 1; i <= 5; i++) {
            var star = document.createElement('i');
            star.className = i <= Math.floor(stats.average) ? 'fas fa-star text-yellow-400' :
                           i - 0.5 <= stats.average ? 'fas fa-star-half-alt text-yellow-400' :
                           'fas fa-star text-gray-300';
            avgStars.appendChild(star);
          }

          var total = stats.total || 1;
          [5,4,3,2,1].forEach(function(star) {
            var count = stats.distribution[star] || 0;
            var percent = (count / total) * 100;
            document.getElementById('bar-' + star).style.width = percent + '%';
            document.getElementById('count-' + star).textContent = count;
          });
        }

        function updateSidebarRating(stats) {
          document.getElementById('sidebar-rating').textContent = stats.average || '-';
          document.getElementById('sidebar-reviews').textContent = stats.total;
          
          var sidebarStars = document.getElementById('sidebar-stars');
          sidebarStars.innerHTML = '';
          for (var i = 1; i <= 5; i++) {
            var star = document.createElement('i');
            star.className = i <= Math.floor(stats.average) ? 'fas fa-star' :
                           i - 0.5 <= stats.average ? 'fas fa-star-half-alt' :
                           'fas fa-star text-gray-300';
            if (i <= Math.ceil(stats.average)) star.classList.add('text-yellow-400');
            sidebarStars.appendChild(star);
          }
        }

        function renderReviews(reviews) {
          var container = document.getElementById('reviews-list');
          if (!reviews || reviews.length === 0) {
            container.innerHTML = '<p class="text-center text-future-textLight py-6 text-sm">まだレビューがありません。最初のレビューを投稿してみませんか？</p>';
            return;
          }
          
          // コメントを整形（【質問】を見出しとして強調、改行を反映）
          function formatComment(comment) {
            if (!comment) return '';
            // 【】で囲まれた部分を強調表示
            var formatted = escapeHtml(comment)
              .replace(/【([^】]+)】/g, '</p><p class="font-medium text-future-text mt-3 mb-1 text-sm">$1</p><p class="text-future-textLight text-sm">')
              .replace(/\\n\\n/g, '</p><p class="text-future-textLight text-sm mt-2">')
              .replace(/\\n/g, '<br>');
            return '<p class="text-future-textLight text-sm">' + formatted + '</p>';
          }

          container.innerHTML = reviews.map(function(review) {
            return '<div class="bg-future-light rounded-xl p-4">' +
              '<div class="flex items-start justify-between mb-3">' +
              '<div>' +
              '<h4 class="font-bold text-future-text text-sm">' + escapeHtml(review.reviewer_name) + '</h4>' +
              '<div class="flex items-center gap-2 mt-0.5">' +
              '<div class="flex text-sm">' + renderStars(review.rating) + '</div>' +
              '<span class="text-xs text-future-textLight">' + formatDate(review.created_at) + '</span>' +
              '</div></div></div>' +
              '<div class="space-y-1">' + formatComment(review.comment) + '</div>' +
              '</div>';
          }).join('');
        }

        function renderPagination(pagination) {
          var container = document.getElementById('reviews-pagination');
          if (pagination.totalPages <= 1) {
            container.classList.add('hidden');
            return;
          }
          container.classList.remove('hidden');

          var html = '';
          if (pagination.hasPrev) {
            html += '<button onclick="window.reviewsLoadPage(' + (pagination.page - 1) + ')" class="px-3 py-1.5 rounded-lg bg-future-light hover:bg-ai-blue/10 transition-colors text-sm"><i class="fas fa-chevron-left"></i></button>';
          }
          for (var i = 1; i <= pagination.totalPages; i++) {
            var active = i === pagination.page ? 'gradient-ai text-white' : 'bg-future-light hover:bg-ai-blue/10';
            html += '<button onclick="window.reviewsLoadPage(' + i + ')" class="px-3 py-1.5 rounded-lg ' + active + ' transition-colors text-sm">' + i + '</button>';
          }
          if (pagination.hasNext) {
            html += '<button onclick="window.reviewsLoadPage(' + (pagination.page + 1) + ')" class="px-3 py-1.5 rounded-lg bg-future-light hover:bg-ai-blue/10 transition-colors text-sm"><i class="fas fa-chevron-right"></i></button>';
          }
          container.innerHTML = html;
        }

        function renderStars(rating) {
          var html = '';
          for (var i = 0; i < 5; i++) {
            html += '<i class="fas fa-star ' + (i < rating ? 'text-yellow-400' : 'text-gray-300') + '"></i>';
          }
          return html;
        }

        function formatDate(dateStr) {
          var date = new Date(dateStr);
          return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        function escapeHtml(text) {
          var div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        }

        // Review form handling
        var formContainer = document.getElementById('review-form-container');
        var form = document.getElementById('review-form');
        var successMsg = document.getElementById('review-success');
        var starBtns = document.querySelectorAll('.star-btn');
        var ratingInput = document.getElementById('rating-input');
        var commentInput = form.querySelector('textarea[name="comment"]');
        var charCount = document.getElementById('char-count');

        document.getElementById('btn-write-review').addEventListener('click', function() {
          formContainer.classList.remove('hidden');
          form.classList.remove('hidden');
          successMsg.classList.add('hidden');
          formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        document.getElementById('btn-cancel-review').addEventListener('click', function() {
          formContainer.classList.add('hidden');
          form.reset();
          resetStars();
          charCount.textContent = '0';
        });

        starBtns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            var rating = parseInt(btn.dataset.rating);
            ratingInput.value = rating;
            starBtns.forEach(function(b, i) {
              b.classList.toggle('active', i < rating);
            });
          });
        });

        function resetStars() {
          ratingInput.value = '';
          starBtns.forEach(function(b) { b.classList.remove('active'); });
        }

        commentInput.addEventListener('input', function() {
          charCount.textContent = commentInput.value.length;
        });

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (!ratingInput.value) {
            alert('評価を選択してください');
            return;
          }

          var formData = new FormData(form);
          var data = {
            courseId: formData.get('courseId'),
            reviewerName: formData.get('reviewerName'),
            reviewerEmail: formData.get('reviewerEmail'),
            rating: parseInt(formData.get('rating')),
            comment: formData.get('comment')
          };

          fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          .then(function(res) {
            return res.json().then(function(result) {
              if (res.ok) {
                form.classList.add('hidden');
                successMsg.classList.remove('hidden');
                form.reset();
                resetStars();
                charCount.textContent = '0';
              } else {
                alert(result.error || 'エラーが発生しました');
              }
            });
          })
          .catch(function(err) {
            alert('送信に失敗しました。もう一度お試しください。');
          });
        });

        window.reviewsLoadPage = loadReviews;
        loadReviews();
      })();
    </script>
  `

  return renderLayout(course.title, content, 'courses')
}

// コースシリーズ詳細ページ
interface SeriesDetail {
  id: string
  title: string
  subtitle?: string
  description?: string
  image?: string
  total_sessions: number
  duration_minutes: number
  calc_single_price_incl: number
  calc_course_price_incl: number
  calc_early_price_incl: number
  calc_monthly_price_incl: number
  calc_savings_course: number
  calc_savings_early: number
  early_bird_deadline?: string
  course_discount_rate?: number
  early_bird_discount_rate?: number
}

interface LinkedCourse {
  id: string
  title: string
  description?: string
  image?: string
  session_number: number
  next_schedule_date?: string
  start_time?: string
  end_time?: string
}

export const renderSeriesDetailPage = (
  series: SeriesDetail, 
  linkedCourses: LinkedCourse[], 
  isInProgress: boolean,
  currentSession: number
) => {
  const now = new Date()
  const earlyBirdActive = series.early_bird_deadline && new Date(series.early_bird_deadline) > now
  
  const content = `
    <!-- Hero Section -->
    <section class="relative py-12 sm:py-16 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-ai-purple/10 via-ai-blue/5 to-nature-mint/10"></div>
      ${series.image ? `
        <div class="absolute inset-0">
          <img loading="lazy" decoding="async" src="${series.image}" alt="" class="w-full h-full object-cover opacity-20">
          <div class="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/60"></div>
        </div>
      ` : ''}
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 戻るボタン -->
        <a href="/courses" class="inline-flex items-center text-future-textLight hover:text-ai-blue transition-colors mb-4 sm:mb-6 py-2">
          <i class="fas fa-arrow-left mr-2"></i>
          <span class="text-sm sm:text-base">講座一覧に戻る</span>
        </a>
        
        <div class="flex flex-col lg:flex-row gap-8 items-start">
          <!-- 左側: コース情報 -->
          <div class="flex-1">
            <div class="flex flex-wrap gap-2 mb-4">
              <span class="bg-ai-purple text-white text-sm font-bold px-4 py-1 rounded-full">
                <i class="fas fa-layer-group mr-1"></i>全${series.total_sessions}回コース
              </span>
              ${isInProgress ? `
                <span class="bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                  <i class="fas fa-play-circle mr-1"></i>開講中（第${currentSession}回〜）
                </span>
              ` : `
                <span class="bg-nature-forest text-white text-sm font-bold px-4 py-1 rounded-full">
                  <i class="fas fa-calendar-check mr-1"></i>次回開講予定
                </span>
              `}
            </div>
            
            <h1 class="text-3xl lg:text-4xl font-bold text-future-text mb-4 leading-tight">${series.title}</h1>
            ${series.subtitle ? `<p class="text-lg text-future-textLight mb-4">${series.subtitle}</p>` : ''}
            ${series.description ? `<div class="text-future-textLight leading-relaxed prose prose-sm max-w-none">${series.description}</div>` : ''}
            
            <div class="flex flex-wrap items-center gap-6 mt-6 text-sm text-future-textLight">
              <span><i class="fas fa-clock text-ai-blue mr-2"></i>${series.duration_minutes}分/回</span>
              <span><i class="fas fa-calendar-alt text-ai-purple mr-2"></i>全${series.total_sessions}回</span>
              <span><i class="fas fa-video text-nature-forest mr-2"></i>オンライン（Google Meet）</span>
            </div>
          </div>
          
          <!-- 右側: 価格・申込カード -->
          <div class="w-full lg:w-96 bg-white rounded-2xl shadow-xl border border-future-sky/50 overflow-hidden">
            <div class="bg-gradient-to-r from-ai-purple to-ai-blue p-4 text-white text-center">
              <span class="text-sm font-medium">受講プランを選択</span>
            </div>
            <div class="p-6 space-y-4">
              <!-- 単発参加 -->
              <div class="border border-future-sky rounded-xl p-4 hover:border-ai-blue transition cursor-pointer" onclick="selectPlan('single')">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-future-text">単発参加</span>
                    <p class="text-xs text-future-textLight">1回ずつ参加</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xl font-bold text-future-text">¥${series.calc_single_price_incl.toLocaleString()}</span>
                    <span class="text-sm text-future-textLight">/回(税込)</span>
                  </div>
                </div>
              </div>
              
              <!-- コース一括 -->
              <div class="border-2 border-ai-blue rounded-xl p-4 bg-ai-blue/5 hover:bg-ai-blue/10 transition cursor-pointer relative" onclick="selectPlan('course')">
                <span class="absolute -top-3 left-4 bg-ai-blue text-white text-xs font-bold px-2 py-1 rounded">おすすめ</span>
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-ai-blue">コース一括</span>
                    <p class="text-xs text-future-textLight">全${series.total_sessions}回セット</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xl font-bold text-ai-blue">¥${series.calc_course_price_incl.toLocaleString()}<span class="text-sm font-normal text-future-textLight">(税込)</span></span>
                    <p class="text-xs text-nature-forest font-medium">¥${series.calc_savings_course.toLocaleString()}お得</p>
                  </div>
                </div>
              </div>
              
              ${earlyBirdActive ? `
              <!-- 早期申込 -->
              <div class="border-2 border-ai-purple rounded-xl p-4 bg-ai-purple/5 hover:bg-ai-purple/10 transition cursor-pointer relative" onclick="selectPlan('early')">
                <span class="absolute -top-3 left-4 bg-gradient-to-r from-orange-400 to-red-400 text-white text-xs font-bold px-2 py-1 rounded">
                  <i class="fas fa-clock mr-1"></i>〜${new Date(series.early_bird_deadline!).toLocaleDateString('ja-JP', {month: 'numeric', day: 'numeric'})}
                </span>
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold text-ai-purple">早期申込</span>
                    <p class="text-xs text-future-textLight">全${series.total_sessions}回セット</p>
                  </div>
                  <div class="text-right">
                    <span class="text-xl font-bold text-ai-purple">¥${series.calc_early_price_incl.toLocaleString()}<span class="text-sm font-normal text-future-textLight">(税込)</span></span>
                    <p class="text-xs text-nature-forest font-medium">¥${series.calc_savings_early.toLocaleString()}お得</p>
                  </div>
                </div>
              </div>
              ` : ''}
              
              <!-- 月額払い（現在は無効化 - Subscription実装が必要なため非表示） -->
              
              ${isInProgress ? `
              <!-- 途中参加の注意 -->
              <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm">
                <p class="text-orange-700 font-medium mb-2">
                  <i class="fas fa-info-circle mr-1"></i>現在第${currentSession}回目以降の参加となります
                </p>
                <p class="text-orange-600 text-xs">
                  途中からの参加は<strong>単発参加</strong>のみとなります。<br>
                  コース一括・早期割引をご希望の方は、次回コース開催をお待ちください。
                </p>
                <a href="/contact?subject=次回コース開催通知希望" class="inline-block mt-3 text-ai-blue hover:text-ai-purple font-medium text-xs">
                  <i class="fas fa-bell mr-1"></i>次回開催の通知を受け取る →
                </a>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 全回の日程一覧 -->
    <section class="py-16 bg-future-light">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl font-bold text-future-text mb-4">
            <i class="fas fa-calendar-alt text-ai-purple mr-2"></i>全${series.total_sessions}回の日程
          </h2>
          <p class="text-future-textLight">各回の日程と内容をご確認ください</p>
        </div>
        
        <!-- 日程サマリー -->
        <div class="bg-white rounded-2xl shadow-lg border border-future-sky/50 overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-ai-purple to-ai-blue p-4 text-white">
            <div class="flex items-center">
              <span class="font-bold"><i class="fas fa-list-check mr-2"></i>講座スケジュール</span>
            </div>
          </div>
          
          <div class="divide-y divide-future-sky/30">
            ${linkedCourses.map((course, index) => {
              const isPast = course.next_schedule_date && new Date(course.next_schedule_date) < now
              const isCurrent = index + 1 === currentSession && isInProgress
              const hasSchedule = course.next_schedule_date && course.start_time
              
              const bgClass = isPast ? 'bg-gray-50 opacity-60' : isCurrent ? 'bg-ai-purple/5' : 'hover:bg-future-light'
              const badgeClass = isPast ? 'bg-gray-400' : isCurrent ? 'bg-ai-purple' : 'bg-ai-blue'
              const dateStr = hasSchedule ? new Date(course.next_schedule_date!).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'}) : ''
              const timeStr = hasSchedule ? (course.start_time + (course.end_time ? ' - ' + course.end_time : '')) : ''
              
              return `
              <div class="flex items-center p-4 ${bgClass} transition">
                <!-- 回数 -->
                <div class="w-16 flex-shrink-0">
                  <span class="${badgeClass} text-white text-sm font-bold px-3 py-1 rounded-full">
                    第${index + 1}回
                  </span>
                </div>
                
                <!-- 日時 -->
                <div class="flex-1 min-w-0 px-4">
                  <div class="flex flex-wrap items-center gap-2">
                    ${hasSchedule ? `
                      <span class="font-bold text-future-text">${dateStr}</span>
                      <span class="text-ai-blue font-medium">${timeStr}</span>
                    ` : `
                      <span class="text-future-textLight">日程調整中</span>
                    `}
                    ${isPast ? '<span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">終了</span>' : ''}
                    ${isCurrent ? '<span class="text-xs bg-ai-purple text-white px-2 py-0.5 rounded">次回</span>' : ''}
                  </div>
                  <p class="text-sm text-future-textLight mt-1 truncate">${course.title}</p>
                </div>
                
                <!-- アクション -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a href="/courses/${course.id}" class="text-sm text-ai-blue hover:text-ai-purple font-medium px-3 py-2 rounded-lg hover:bg-ai-blue/10 transition">
                    詳細 <i class="fas fa-chevron-right ml-1"></i>
                  </a>
                </div>
              </div>
            `}).join('')}
          </div>
        </div>
        
        <!-- 講座内容カード -->
        <h3 class="text-xl font-bold text-future-text mb-6 text-center">
          <i class="fas fa-book-open text-ai-blue mr-2"></i>各回の学習内容
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${linkedCourses.map((course, index) => {
            const isPast = course.next_schedule_date && new Date(course.next_schedule_date) < now
            const isCurrent = index + 1 === currentSession && isInProgress
            const borderClass = isCurrent ? 'border-ai-purple border-2' : 'border-future-sky/50'
            const badgeClass = isPast ? 'bg-gray-400' : isCurrent ? 'bg-ai-purple' : 'bg-ai-blue'
            
            return `
            <a href="/courses/${course.id}" class="bg-white rounded-xl shadow-sm border ${borderClass} overflow-hidden hover:shadow-lg transition group">
              <div class="flex">
                <!-- サムネイル -->
                <div class="w-24 sm:w-32 flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-ai-purple/10 to-ai-blue/10">
                  ${course.image ? `
                    <img loading="lazy" decoding="async" src="${course.image}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                  ` : `
                    <div class="w-full h-full flex items-center justify-center min-h-[100px]">
                      <span class="text-3xl font-bold text-ai-purple/30">${index + 1}</span>
                    </div>
                  `}
                  <div class="absolute top-2 left-2">
                    <span class="${badgeClass} text-white text-xs font-bold px-2 py-1 rounded">
                      第${index + 1}回
                    </span>
                  </div>
                  ${isPast ? `
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span class="text-white text-xs font-bold">終了</span>
                    </div>
                  ` : ''}
                </div>
                
                <!-- コンテンツ -->
                <div class="flex-1 p-4">
                  <h4 class="font-bold text-future-text mb-2 group-hover:text-ai-blue transition line-clamp-2 text-sm">${course.title}</h4>
                  ${course.description ? `<p class="text-xs text-future-textLight line-clamp-2">${truncateText(course.description, 80)}</p>` : ''}
                </div>
              </div>
            </a>
          `}).join('')}
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-br from-ai-purple/10 via-ai-blue/5 to-nature-mint/10">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl font-bold text-future-text mb-4">このコースで学びを始めましょう</h2>
        <p class="text-future-textLight mb-8">
          ${isInProgress 
            ? `現在開講中のため、第${currentSession}回目からの単発参加が可能です。` 
            : 'コース一括申込なら、単発参加よりもお得に全回受講できます。'}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          ${isInProgress ? `
            <a href="/courses/${linkedCourses[currentSession - 1]?.id || linkedCourses[0].id}" class="btn-ai gradient-ai text-white px-8 py-4 rounded-xl font-bold text-lg">
              <i class="fas fa-play-circle mr-2"></i>第${currentSession}回から参加する
            </a>
          ` : `
            <a href="/reservation?series=${series.id}&pricing=course" class="btn-ai gradient-ai text-white px-8 py-4 rounded-xl font-bold text-lg">
              <i class="fas fa-shopping-cart mr-2"></i>コース一括で申し込む
            </a>
          `}
          <a href="/contact" class="border-2 border-ai-blue text-ai-blue px-8 py-4 rounded-xl font-bold text-lg hover:bg-ai-blue hover:text-white transition">
            <i class="fas fa-question-circle mr-2"></i>質問・相談する
          </a>
        </div>
      </div>
    </section>
    
    <script>
      function selectPlan(planType) {
        const isInProgress = ${isInProgress ? 'true' : 'false'};
        const currentSession = ${currentSession};
        const seriesId = '${series.id}';
        const firstCourseId = '${linkedCourses[0]?.id || ''}';
        const currentCourseId = '${linkedCourses[currentSession - 1]?.id || linkedCourses[0]?.id || ''}';
        
        if (isInProgress && planType !== 'single') {
          alert('現在開講中のため、途中参加は単発のみとなります。\\nコース一括・早期割引は次回開催をお待ちください。');
          return;
        }
        
        if (planType === 'single') {
          // 単発もシリーズの予約ページから選択
          window.location.href = '/reservation?series=' + seriesId + '&pricing=single';
        } else {
          // コース/早期/月額はシリーズとして予約
          window.location.href = '/reservation?series=' + seriesId + '&pricing=' + planType;
        }
      }
      
      // 全日程をGoogleカレンダーに追加
      function addAllToCalendar() {
        const schedules = ${JSON.stringify(linkedCourses.filter(c => c.next_schedule_date && c.start_time).map((c, i) => ({
          title: c.title,
          date: c.next_schedule_date,
          start: c.start_time,
          end: c.end_time,
          index: i + 1,
          id: c.id
        })))};
        
        if (schedules.length === 0) {
          alert('追加できる日程がありません');
          return;
        }
        
        const seriesTitle = '${series.title.replace(/'/g, "\\'")}';
        const totalSessions = ${series.total_sessions};
        const durationMinutes = ${series.duration_minutes};
        
        // 各日程のカレンダーリンクを開く
        schedules.forEach((s, i) => {
          setTimeout(() => {
            const startDate = new Date(s.date + 'T' + s.start + ':00');
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const title = encodeURIComponent('【mirAIcafe】' + s.title);
            const details = encodeURIComponent('第' + s.index + '回/全' + totalSessions + '回\\n\\nコース: ' + seriesTitle + '\\n\\n詳細: https://miraicafe.work/courses/' + s.id);
            const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + formatDate(startDate) + '/' + formatDate(endDate) + '&details=' + details + '&location=Google+Meet';
            window.open(url, '_blank');
          }, i * 500); // 500ms間隔で開く
        });
        
        alert(schedules.length + '件の日程をカレンダーに追加します。\\nポップアップブロックが有効な場合は許可してください。');
      }
    </script>
  `
  
  return renderLayout(series.title, content, 'courses')
}
