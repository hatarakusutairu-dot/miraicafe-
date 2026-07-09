// 質問の型定義
interface SurveyQuestion {
  id: number
  question_type: 'rating' | 'text' | 'choice' | 'single_choice' | 'multi_choice' | 'multiple_choice' | 'dropdown'
  question_text: string
  question_category: string
  options: string | null
  is_required: number
  sort_order: number
}

interface SurveySettings {
  thank_you_video_url?: string
  logo_url?: string
}

export const renderSurveyPage = (
  questions: SurveyQuestion[], 
  bookingId?: string, 
  courseName?: string,
  settings?: SurveySettings
) => {
  const thankYouVideoUrl = settings?.thank_you_video_url || ''
  const logoUrl = settings?.logo_url || ''
  
  const categoryLabels: Record<string, { label: string; icon: string }> = {
    course: { label: '受講講座', icon: 'fa-graduation-cap' },
    profile: { label: 'あなたについて', icon: 'fa-user' },
    satisfaction: { label: '総合評価', icon: 'fa-star' },
    difficulty: { label: '講座の難易度', icon: 'fa-signal' },
    content: { label: '講座内容について', icon: 'fa-book-open' },
    instructor: { label: '講師について', icon: 'fa-chalkboard-teacher' },
    exercise: { label: '演習・ワークについて', icon: 'fa-tasks' },
    feedback_positive: { label: '良かった点', icon: 'fa-thumbs-up' },
    feedback_improve: { label: '改善点', icon: 'fa-lightbulb' },
    online_feedback: { label: 'オンライン受講について', icon: 'fa-laptop' },
    confidence: { label: '学びの効果', icon: 'fa-graduation-cap' },
    action: { label: '実践について', icon: 'fa-rocket' },
    concerns: { label: '不安・疑問点', icon: 'fa-question-circle' },
    recommend: { label: 'おすすめ度', icon: 'fa-heart' },
    future_topics: { label: '今後の講座について', icon: 'fa-calendar-plus' },
    review_permission: { label: '公開許可', icon: 'fa-share-alt' },
    environment: { label: '受講環境について', icon: 'fa-laptop' },
    other: { label: 'その他', icon: 'fa-comment-dots' },
    general: { label: 'その他', icon: 'fa-comment-dots' }
  }

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>受講後アンケート | mirAIcafe</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      font-family: 'Zen Maru Gothic', sans-serif;
    }
    
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #faf5f0 0%, #f5efe8 50%, #f0e8e0 100%);
      color: #5a5a6e;
      overflow-x: hidden;
    }
    
    /* 背景キャンバス */
    #bg-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }
    
    /* メインカード - 3D立体感 */
    .survey-card {
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 248, 255, 0.95) 100%);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-bottom: 3px solid rgba(180, 160, 200, 0.25);
      box-shadow: 
        0 2px 4px rgba(180, 160, 200, 0.08),
        0 8px 16px rgba(180, 160, 200, 0.12),
        0 16px 32px rgba(180, 160, 200, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      position: relative;
      overflow: visible;
      transform: translateZ(0);
    }
    .survey-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, transparent 100%);
      border-radius: inherit;
      pointer-events: none;
    }
    
    /* 星評価 - 3D立体感 */
    .star-rating {
      display: flex;
      flex-direction: row-reverse;
      justify-content: center;
      gap: 12px;
      padding: 15px 20px;
      background: linear-gradient(145deg, #f8f5fc 0%, #f0eaf8 100%);
      border-radius: 20px;
      box-shadow: 
        inset 0 2px 8px rgba(180, 160, 200, 0.15),
        0 4px 12px rgba(180, 160, 200, 0.1);
    }
    .star-rating input { display: none; }
    .star-rating label {
      cursor: pointer;
      font-size: 2.8rem;
      color: #d8d0e5;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.1),
        0 4px 8px rgba(180, 160, 200, 0.2);
      filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.15));
    }
    .star-rating label:hover,
    .star-rating label:hover ~ label,
    .star-rating input:checked ~ label {
      color: #f0d88a;
      transform: scale(1.2) translateY(-3px);
      text-shadow: 
        0 0 20px rgba(240, 216, 138, 0.5),
        0 0 40px rgba(240, 216, 138, 0.3),
        0 4px 8px rgba(0, 0, 0, 0.15);
      filter: drop-shadow(0 6px 8px rgba(240, 216, 138, 0.25));
    }
    
    /* 選択肢 - 3D立体感 */
    .choice-option {
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .choice-option .choice-label {
      background: linear-gradient(145deg, #ffffff 0%, #f8f6fa 100%);
      border: 2px solid #e8e0f0;
      box-shadow: 
        0 2px 4px rgba(180, 160, 200, 0.1),
        0 4px 8px rgba(180, 160, 200, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    .choice-option:hover {
      transform: translateY(-4px);
    }
    .choice-option:hover .choice-label {
      box-shadow: 
        0 6px 12px rgba(180, 160, 200, 0.2),
        0 12px 24px rgba(180, 160, 200, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    .choice-option input:checked + .choice-label {
      background: linear-gradient(145deg, #f0e6fa 0%, #fce4ec 100%);
      border-color: #c9a8e0;
      box-shadow: 
        0 4px 12px rgba(184, 165, 211, 0.35),
        0 8px 20px rgba(184, 165, 211, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        inset 0 -2px 4px rgba(184, 165, 211, 0.1);
      transform: translateY(-2px);
    }
    
    /* 入力フィールド - 3D立体感 */
    .survey-input {
      background: linear-gradient(145deg, #ffffff 0%, #faf8fc 100%);
      border: 2px solid #e8e0f0;
      transition: all 0.3s ease;
      box-shadow: 
        inset 0 2px 6px rgba(180, 160, 200, 0.1),
        0 2px 4px rgba(180, 160, 200, 0.05);
    }
    .survey-input:focus {
      border-color: #c9a8e0;
      background: #ffffff;
      box-shadow: 
        0 0 0 4px rgba(184, 165, 211, 0.15),
        0 4px 12px rgba(184, 165, 211, 0.2),
        inset 0 1px 2px rgba(255, 255, 255, 0.9);
      outline: none;
    }
    
    /* カスタムドロップダウン - かわいい丸みのあるデザイン */
    .custom-dropdown {
      position: relative;
      z-index: 10;
    }
    .custom-dropdown.active {
      z-index: 1000;
    }
    .dropdown-trigger {
      background: linear-gradient(145deg, #ffffff 0%, #f8f6fa 100%);
      border: 2px solid #e8e0f0;
      border-radius: 20px;
      padding: 12px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 
        0 2px 4px rgba(180, 160, 200, 0.1),
        0 4px 8px rgba(180, 160, 200, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    .custom-dropdown:hover .dropdown-trigger {
      transform: translateY(-4px);
      box-shadow: 
        0 6px 12px rgba(180, 160, 200, 0.2),
        0 12px 24px rgba(180, 160, 200, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border-color: #d4c4e8;
    }
    .dropdown-trigger.active {
      border-color: #c9a8e0;
      background: linear-gradient(145deg, #f0e6fa 0%, #fce4ec 100%);
      box-shadow: 
        0 4px 12px rgba(184, 165, 211, 0.35),
        0 8px 20px rgba(184, 165, 211, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }
    .dropdown-trigger .fa-chevron-down {
      transition: transform 0.3s ease;
      color: #c9a8e0;
    }
    .dropdown-trigger.active .fa-chevron-down {
      transform: rotate(180deg);
    }
    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: linear-gradient(145deg, #ffffff 0%, #faf8fc 100%);
      border: 2px solid #e8e0f0;
      border-radius: 20px;
      padding: 8px;
      box-shadow: 
        0 8px 24px rgba(180, 160, 200, 0.25),
        0 16px 48px rgba(180, 160, 200, 0.15);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px) scale(0.95);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
    .dropdown-option {
      padding: 12px 16px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #5a5a6e;
      font-size: 0.95rem;
    }
    .dropdown-option:hover {
      background: linear-gradient(145deg, #f5f0fa 0%, #fce8f0 100%);
      transform: translateX(4px);
    }
    .dropdown-option.selected {
      background: linear-gradient(145deg, #e8d8f5 0%, #f8e0eb 100%);
      color: #7c5a9e;
      font-weight: 500;
    }
    .dropdown-option.selected::before {
      content: '✓ ';
      color: #c9a8e0;
    }
    .dropdown-placeholder {
      color: #a0a0b0;
    }
    
    /* 非表示のselect（フォーム送信用） */
    .dropdown-select-hidden {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      width: 0;
      height: 0;
    }
    
    /* 送信ボタン - 3D立体感 */
    .submit-btn {
      background: linear-gradient(145deg, #d4b3e8 0%, #c9a8e0 50%, #b898d4 100%);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 
        0 4px 0 #a088c0,
        0 6px 12px rgba(184, 165, 211, 0.4),
        0 12px 24px rgba(184, 165, 211, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -2px 4px rgba(0, 0, 0, 0.1);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      border: none;
      position: relative;
    }
    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 50%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
      border-radius: inherit;
      pointer-events: none;
    }
    .submit-btn:hover:not(:disabled) {
      transform: translateY(-4px);
      box-shadow: 
        0 6px 0 #a088c0,
        0 10px 20px rgba(184, 165, 211, 0.5),
        0 20px 40px rgba(184, 165, 211, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -2px 4px rgba(0, 0, 0, 0.1);
    }
    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 
        0 2px 0 #a088c0,
        0 4px 8px rgba(184, 165, 211, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4),
        inset 0 -2px 4px rgba(0, 0, 0, 0.1);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      box-shadow: 
        0 2px 0 #b8a0c8,
        0 4px 8px rgba(184, 165, 211, 0.2);
    }
    
    /* 固定コーヒーカップ進捗 - 3D立体感 */
    .coffee-cup-fixed {
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 100;
      background: linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.95) 100%);
      padding: 15px;
      border-radius: 24px;
      box-shadow: 
        0 4px 8px rgba(180, 160, 200, 0.15),
        0 8px 16px rgba(180, 160, 200, 0.12),
        0 16px 32px rgba(180, 160, 200, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-bottom: 3px solid rgba(180, 160, 200, 0.2);
    }
    @media (max-width: 1000px) {
      .coffee-cup-fixed {
        right: 10px;
        padding: 8px;
        transform: translateY(-50%) scale(0.85);
      }
    }
    @media (max-width: 700px) {
      .coffee-cup-fixed {
        position: fixed;
        right: 10px;
        left: auto;
        top: auto;
        bottom: 12px;
        transform: scale(0.7);
        flex-direction: row;
        padding: 6px 10px;
        gap: 8px;
      }
    }
    
    /* 進捗カップ（画像ベース） */
    .progress-cup-wrapper {
      position: relative;
      width: 60px;
      height: 80px;
    }
    .progress-cup-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .progress-cup-fill {
      position: absolute;
      bottom: 8px;
      left: 12px;
      width: 36px;
      height: 48px;
      overflow: hidden;
      border-radius: 0 0 4px 4px;
      z-index: -1;
    }
    .progress-cup-fill-inner {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(180deg, #d4a574 0%, #6b4423 100%);
      transition: height 0.5s ease;
    }
    
    /* キャラクターバナー - 画像のラインに合わせた背景枠 */
    .character-banner-wrapper {
      position: relative;
      display: inline-block;
      padding: 0;
      background: linear-gradient(180deg, 
        #a8e6f0 0%, 
        #f8e8f0 40%, 
        #fce4ec 70%, 
        #f8e0e8 100%);
      border-radius: 24px;
      box-shadow: 
        0 8px 24px rgba(180, 160, 200, 0.35),
        0 16px 48px rgba(180, 160, 200, 0.2),
        inset 0 2px 4px rgba(255, 255, 255, 0.8);
    }
    .character-banner {
      display: block;
      border-radius: 20px;
      filter: drop-shadow(0 4px 12px rgba(180, 160, 200, 0.3));
    }
    
    /* ヘッダータイトル - 3D立体感 */
    .title-3d {
      text-shadow: 
        0 2px 4px rgba(90, 90, 110, 0.2),
        0 4px 8px rgba(180, 160, 200, 0.15);
    }
    
    /* カテゴリアイコン - 3D立体感 */
    .category-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(145deg, #f0e6fa 0%, #e8d8f5 100%);
      border-radius: 12px;
      box-shadow: 
        0 2px 6px rgba(180, 160, 200, 0.2),
        0 4px 12px rgba(180, 160, 200, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }
    .category-icon i {
      filter: drop-shadow(0 2px 3px rgba(180, 160, 200, 0.4));
    }
    
    /* 進捗カップ画像 - 3D立体感 */
    .progress-cup-img {
      filter: drop-shadow(0 4px 8px rgba(139, 107, 74, 0.3))
              drop-shadow(0 8px 16px rgba(139, 107, 74, 0.15));
    }
    .cup-sleeve {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 44px;
      height: 26px;
      background: #f5f0e8;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      font-size: 14px;
    }
    .cup-fill-container {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 44px;
      height: 56px;
      overflow: hidden;
      border-radius: 2px 2px 8px 8px;
      z-index: 0;
    }
    .cup-fill-inner {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(180deg, #d4a574 0%, #6b4423 100%);
      transition: height 0.5s ease;
    }
    
    /* 紙吹雪 */
    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      top: -10px;
      pointer-events: none;
      z-index: 1000;
      border-radius: 2px;
      animation: confetti-fall 3s ease-out forwards;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    /* モーダル */
    .modal-content {
      animation: modal-appear 0.4s ease-out;
    }
    @keyframes modal-appear {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    
    /* レスポンシブ：モバイル時のサイズ調整 */
    @media (max-width: 700px) {
      .survey-card {
        padding: 16px !important;
        border-radius: 20px !important;
      }
      .survey-card .space-y-6 {
        gap: 16px;
      }
      .star-rating {
        padding: 10px 12px;
        gap: 8px;
      }
      .star-rating label {
        font-size: 2.2rem;
      }
      .choice-label {
        padding: 12px 14px !important;
        font-size: 0.95rem !important;
      }
      .survey-input {
        padding: 12px 14px !important;
        font-size: 0.95rem !important;
      }
      .category-icon {
        width: 32px;
        height: 32px;
        border-radius: 10px;
      }
      .category-icon i {
        font-size: 0.9rem;
      }
      .title-3d {
        font-size: 1.1rem;
      }
      .character-banner-wrapper {
        border-radius: 16px;
      }
      .character-banner {
        border-radius: 14px;
      }
      .submit-btn {
        padding: 14px 20px !important;
        font-size: 1.1rem !important;
      }
    }
  </style>
  <link rel="stylesheet" href="/static/tailwind.css">
</head>
<body class="antialiased">
  <!-- 背景キャンバス -->
  <canvas id="bg-canvas"></canvas>
  
  <!-- 固定コーヒーカップ進捗 -->
  <div class="coffee-cup-fixed flex flex-col items-center gap-1">
    <div class="progress-cup-wrapper">
      <img loading="lazy" decoding="async" src="/static/coffee-cup.png" alt="進捗" class="progress-cup-img">
      <div class="progress-cup-fill">
        <div class="progress-cup-fill-inner" id="coffee-fill" style="height: 100%;"></div>
      </div>
    </div>
    <div class="text-center">
      <p class="text-lg font-bold" style="color: #8b6b4a;" id="progress-text">0%</p>
      <p class="text-xs" style="color: #a0a0b0;">完了</p>
    </div>
  </div>
  
  <!-- メインコンテンツ -->
  <div class="relative z-10 min-h-screen py-6 sm:py-8 px-3 sm:px-4 pb-20 sm:pb-8">
    <div class="max-w-lg mx-auto relative">
      
      <!-- ヘッダー with キャラクターバナー -->
      <header class="text-center mb-5 sm:mb-8">
        <!-- キャラクターバナー -->
        <div class="mb-4 sm:mb-6">
          <div class="character-banner-wrapper mx-auto max-w-sm">
            <img loading="lazy" decoding="async" src="/static/characters-banner.png" 
                 alt="mirAIcafe キャラクター" 
                 class="character-banner w-full">
          </div>
        </div>
        
        <h1 class="title-3d text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3" style="color: #5a5a6e;">受講後アンケート</h1>
        
        ${logoUrl ? `
          <img loading="lazy" decoding="async" src="${logoUrl}" alt="Logo" class="h-12 mx-auto mb-3">
        ` : ''}
        
        <p class="text-base sm:text-lg" style="color: #8b8b9e;">AI学習の体験について教えてください</p>
        ${courseName ? `
          <div class="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full" style="background: rgba(200, 180, 220, 0.2);">
            <i class="fas fa-book" style="color: #c9a8e0;"></i>
            <span style="color: #7a7a8e;">${escapeHtml(courseName)}</span>
          </div>
        ` : ''}
      </header>

      <!-- アンケートフォーム -->
      <form id="survey-form" class="space-y-4 sm:space-y-6 relative">
        <input type="hidden" name="booking_id" value="${bookingId || ''}">
        <input type="hidden" name="course_name" value="${courseName || ''}">
        
        ${renderQuestionsByCategory(questions, categoryLabels)}
        
        <!-- 回答者情報（任意） -->
        <div class="survey-card rounded-3xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="category-icon">
              <i class="fas fa-user-circle text-lg" style="color: #c9a8e0;"></i>
            </div>
            <span class="text-lg font-medium" style="color: #5a5a6e;">回答者情報</span>
            <span class="text-sm" style="color: #a0a0b0;">（任意）</span>
          </div>
          <div class="space-y-4">
            <input type="text" name="respondent_name" 
                   class="survey-input w-full px-5 py-4 rounded-xl text-lg"
                   placeholder="✏️ お名前">
            <input type="email" name="respondent_email"
                   class="survey-input w-full px-5 py-4 rounded-xl text-lg"
                   placeholder="📧 メールアドレス">
          </div>
        </div>
        
        <!-- 公開同意 -->
        <div class="survey-card rounded-3xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="category-icon">
              <i class="fas fa-bullhorn text-lg" style="color: #e8b4d8;"></i>
            </div>
            <span class="text-lg font-medium" style="color: #5a5a6e;">ご回答の公開について</span>
          </div>
          <div class="space-y-3">
            <label class="choice-option flex items-center cursor-pointer">
              <input type="radio" name="publish_consent" value="yes" class="hidden">
              <span class="choice-label flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 transition text-lg">
                <i class="fas fa-check-circle text-xl text-green-400"></i>
                <span>お名前付きで公開OK</span>
              </span>
            </label>
            <label class="choice-option flex items-center cursor-pointer">
              <input type="radio" name="publish_consent" value="anonymous" class="hidden">
              <span class="choice-label flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 transition text-lg">
                <i class="fas fa-user-secret text-xl" style="color: #c9a8e0;"></i>
                <span>匿名なら公開OK</span>
              </span>
            </label>
            <label class="choice-option flex items-center cursor-pointer">
              <input type="radio" name="publish_consent" value="no" checked class="hidden">
              <span class="choice-label flex-1 flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 transition text-lg">
                <i class="fas fa-lock text-xl text-gray-400"></i>
                <span>公開不可</span>
              </span>
            </label>
          </div>
        </div>
        
        <!-- 送信ボタン -->
        <div class="pt-6 pb-8">
          <button type="submit" id="submit-btn" class="submit-btn w-full text-white text-xl font-bold py-5 rounded-full flex items-center justify-center gap-3">
            送信
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </form>
      
      <!-- フッター -->
      <footer class="text-center py-6">
        <p class="text-sm" style="color: #a0a0b0;">
          mirAIcafe - AI Learning in a Relaxed Atmosphere<br>
          © 2024. All rights reserved.
        </p>
      </footer>
    </div>
  </div>

  <!-- お礼モーダル -->
  <div id="thank-you-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden items-center justify-center p-4">
    <div class="modal-content survey-card rounded-3xl max-w-md w-full overflow-hidden">
      <div class="relative aspect-video flex items-center justify-center" style="background: linear-gradient(135deg, #f0e6fa 0%, #fce4ec 100%);">
        <div id="video-placeholder" class="text-center p-8 ${thankYouVideoUrl ? 'hidden' : ''}">
          <div class="text-6xl mb-4">🎉</div>
          <p class="text-2xl font-bold" style="color: #8b7aa8;">Thank You!</p>
        </div>
        ${thankYouVideoUrl ? `
          <video id="thank-you-video" class="absolute inset-0 w-full h-full object-cover" controls playsinline autoplay>
            <source src="${thankYouVideoUrl}" type="video/mp4">
          </video>
        ` : `
          <video id="thank-you-video" class="absolute inset-0 w-full h-full object-cover hidden" controls playsinline>
            <source src="" type="video/mp4">
          </video>
        `}
      </div>
      
      <div class="p-6 text-center">
        <h3 class="text-2xl font-bold mb-3" style="color: #5a5a6e;">ありがとうございました！</h3>
        <p class="text-lg mb-6" style="color: #8b8b9e;">
          貴重なご意見をいただきありがとうございます。
        </p>
        
        <div id="review-prompt" class="hidden rounded-2xl p-4 mb-4" style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);">
          <div class="flex items-center justify-center gap-1 mb-2" style="color: #ffc107;">
            <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
          </div>
          <p class="font-medium mb-3" style="color: #5a5a6e;">高評価ありがとうございます！</p>
          <a href="/courses" class="inline-flex items-center gap-2 px-5 py-2 rounded-full font-medium text-white" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);">
            <i class="fas fa-edit"></i>口コミを書く
          </a>
        </div>
        
        <button onclick="closeModal()" class="px-8 py-3 rounded-full text-lg font-medium transition" style="background: #f0e6fa; color: #8b7aa8;">
          閉じる
        </button>
      </div>
    </div>
  </div>

  <script>
    // 背景アニメーション - コーヒーカップ + シャボン玉
    let floatingItems = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    
    function initFloatingItems() {
      // 既存の要素を削除
      document.querySelectorAll('.floating-item').forEach(el => el.remove());
      floatingItems = [];
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cupCount = Math.floor((width * height) / 100000) + 6;
      const bubbleCount = Math.floor((width * height) / 80000) + 10;
      
      // 画面を5つのゾーンに分けて配置
      const zones = [
        { minX: 0, maxX: 0.15 },
        { minX: 0.15, maxX: 0.35 },
        { minX: 0.35, maxX: 0.65 },
        { minX: 0.65, maxX: 0.85 },
        { minX: 0.85, maxX: 1.0 }
      ];
      
      // コーヒーカップを追加
      for (let i = 0; i < cupCount; i++) {
        const zone = zones[i % zones.length];
        const x = (zone.minX + Math.random() * (zone.maxX - zone.minX)) * width;
        const y = Math.random() * height;
        const size = Math.random() * 35 + 45;
        const rotation = (Math.random() - 0.5) * 50;
        
        const cup = document.createElement('img');
        cup.src = '/static/coffee-cup.png';
        cup.className = 'floating-item floating-cup';
        cup.style.cssText = \`
          position: fixed;
          pointer-events: none;
          z-index: 1;
          width: \${size}px;
          opacity: \${Math.random() * 0.25 + 0.15};
          transform: rotate(\${rotation}deg);
          filter: drop-shadow(0 4px 8px rgba(139, 107, 74, 0.15));
          left: \${x}px;
          top: \${y}px;
        \`;
        
        floatingItems.push({
          element: cup,
          type: 'cup',
          x, y,
          baseX: x,
          baseY: y,
          rotation,
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeedY: Math.random() * 0.002 + 0.001,
          floatSpeedX: Math.random() * 0.0015 + 0.0008,
          floatAmplitudeY: Math.random() * 20 + 12,
          floatAmplitudeX: Math.random() * 15 + 8
        });
        
        document.body.appendChild(cup);
      }
      
      // シャボン玉を追加
      const bubbleColors = [
        'rgba(200, 220, 255, 0.35)',
        'rgba(255, 200, 220, 0.35)',
        'rgba(220, 200, 255, 0.35)',
        'rgba(200, 255, 230, 0.3)',
        'rgba(255, 230, 200, 0.3)'
      ];
      
      for (let i = 0; i < bubbleCount; i++) {
        const zone = zones[i % zones.length];
        const x = (zone.minX + Math.random() * (zone.maxX - zone.minX)) * width;
        const y = Math.random() * height;
        const size = Math.random() * 25 + 12;
        const color = bubbleColors[Math.floor(Math.random() * bubbleColors.length)];
        
        const bubble = document.createElement('div');
        bubble.className = 'floating-item floating-bubble';
        bubble.style.cssText = \`
          position: fixed;
          pointer-events: none;
          z-index: 1;
          width: \${size}px;
          height: \${size}px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, 
            rgba(255, 255, 255, 0.9) 0%, 
            \${color} 40%, 
            rgba(255, 255, 255, 0.15) 100%);
          box-shadow: 
            inset -2px -2px 6px rgba(255, 255, 255, 0.5),
            inset 2px 2px 6px rgba(0, 0, 0, 0.03),
            0 2px 6px rgba(180, 160, 200, 0.1);
          left: \${x}px;
          top: \${y}px;
        \`;
        
        floatingItems.push({
          element: bubble,
          type: 'bubble',
          x, y,
          baseX: x,
          baseY: y,
          floatOffset: Math.random() * Math.PI * 2,
          floatSpeedY: Math.random() * 0.003 + 0.001,
          floatSpeedX: Math.random() * 0.002 + 0.001,
          floatAmplitudeY: Math.random() * 25 + 15,
          floatAmplitudeX: Math.random() * 18 + 10
        });
        
        document.body.appendChild(bubble);
      }
    }
    
    function draw() {
      const time = Date.now() * 0.001;
      
      // マウス位置を滑らかに追従
      targetMouseX += (mouseX - targetMouseX) * 0.08;
      targetMouseY += (mouseY - targetMouseY) * 0.08;
      
      floatingItems.forEach(item => {
        // フワフワとした浮遊アニメーション
        const floatY = Math.sin(time * item.floatSpeedY + item.floatOffset) * item.floatAmplitudeY;
        const floatX = Math.cos(time * item.floatSpeedX + item.floatOffset * 1.3) * item.floatAmplitudeX;
        
        // マウスへの程よい反応
        const dx = targetMouseX - item.baseX;
        const dy = targetMouseY - item.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let attractX = 0, attractY = 0;
        if (dist < 400 && dist > 0) {
          const force = (400 - dist) / 400 * (item.type === 'bubble' ? 0.35 : 0.25);
          attractX = dx * force;
          attractY = dy * force;
        }
        
        // 現在位置を程よく更新
        const smoothing = item.type === 'bubble' ? 0.04 : 0.05;
        item.x += (item.baseX + floatX + attractX - item.x) * smoothing;
        item.y += (item.baseY + floatY + attractY - item.y) * smoothing;
        
        // DOM要素の位置を更新
        item.element.style.left = item.x + 'px';
        item.element.style.top = item.y + 'px';
      });
      
      requestAnimationFrame(draw);
    }
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    });
    
    // 初期化
    initFloatingItems();
    window.addEventListener('resize', initFloatingItems);
    draw();
    
    // カスタムドロップダウン処理
    let activeDropdown = null;
    
    window.toggleDropdown = function(id) {
      const menu = document.getElementById('dropdown-menu-' + id);
      const trigger = menu.previousElementSibling;
      const dropdown = document.querySelector('[data-dropdown-id="' + id + '"]');
      
      // 他のドロップダウンを閉じる
      document.querySelectorAll('.dropdown-menu.show').forEach(m => {
        if (m.id !== 'dropdown-menu-' + id) {
          m.classList.remove('show');
          m.previousElementSibling.classList.remove('active');
          m.closest('.custom-dropdown').classList.remove('active');
        }
      });
      
      // トグル
      const isOpening = !menu.classList.contains('show');
      menu.classList.toggle('show');
      trigger.classList.toggle('active');
      dropdown.classList.toggle('active', isOpening);
      activeDropdown = isOpening ? id : null;
    }
    
    window.selectOption = function(id, value) {
      const dropdown = document.querySelector('[data-dropdown-id="' + id + '"]');
      const select = dropdown.querySelector('select');
      const valueSpan = dropdown.querySelector('.dropdown-value');
      const menu = document.getElementById('dropdown-menu-' + id);
      const trigger = menu.previousElementSibling;
      
      // hidden selectの値を更新
      select.value = value;
      
      // 表示を更新
      valueSpan.textContent = value;
      valueSpan.classList.remove('dropdown-placeholder');
      
      // 選択状態を更新
      menu.querySelectorAll('.dropdown-option').forEach(opt => {
        opt.classList.toggle('selected', opt.textContent.trim() === value);
      });
      
      // メニューを閉じる
      menu.classList.remove('show');
      trigger.classList.remove('active');
      dropdown.classList.remove('active');
      activeDropdown = null;
      
      // 進捗更新をトリガー
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 外側クリックで閉じる
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(m => {
          m.classList.remove('show');
          m.previousElementSibling.classList.remove('active');
          m.closest('.custom-dropdown').classList.remove('active');
        });
        activeDropdown = null;
      }
    });
    
    // フォーム処理
    const form = document.getElementById('survey-form');
    const coffeeFill = document.getElementById('coffee-fill');
    const progressText = document.getElementById('progress-text');
    const requiredQuestions = document.querySelectorAll('[data-required="true"]');
    const totalRequired = requiredQuestions.length || 1;
    
    function updateProgress() {
      let answered = 0;
      requiredQuestions.forEach(q => {
        const qId = q.dataset.questionId;
        const type = q.dataset.type;
        
        if (type === 'rating') {
          if (document.querySelector('input[name="q_' + qId + '"]:checked')) answered++;
        } else if (type === 'choice') {
          if (document.querySelector('input[name="q_' + qId + '"]:checked')) answered++;
        } else if (type === 'dropdown') {
          const select = document.querySelector('select[name="q_' + qId + '"]');
          if (select && select.value) answered++;
        } else if (type === 'text') {
          const textarea = document.querySelector('textarea[name="q_' + qId + '"]');
          if (textarea && textarea.value.trim()) answered++;
        }
      });
      
      const percent = Math.round((answered / totalRequired) * 100);
      const remaining = 100 - percent;
      coffeeFill.style.height = remaining + '%';
      progressText.textContent = percent + '%';
    }
    
    form.addEventListener('change', updateProgress);
    form.addEventListener('input', updateProgress);
    
    function createConfetti() {
      const colors = ['#c9a8e0', '#e8b4d8', '#f0e6fa', '#fce4ec', '#b8a5d3', '#8B4513', '#D2691E'];
      for (let i = 0; i < 80; i++) {
        setTimeout(() => {
          const el = document.createElement('div');
          el.className = 'confetti';
          el.style.left = Math.random() * 100 + 'vw';
          el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          el.style.animationDuration = (Math.random() * 2 + 2) + 's';
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 4000);
        }, i * 25);
      }
    }
    
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>送信中...';
      
      const formData = new FormData(form);
      const answers = {};
      let overallRating = 0;
      
      document.querySelectorAll('[data-question-id]').forEach(q => {
        const qId = q.dataset.questionId;
        const type = q.dataset.type;
        
        if (type === 'rating') {
          const checked = document.querySelector('input[name="q_' + qId + '"]:checked');
          if (checked) {
            answers[qId] = parseInt(checked.value);
            if (q.dataset.category === 'satisfaction' && !overallRating) {
              overallRating = parseInt(checked.value);
            }
          }
        } else if (type === 'choice' || type === 'multi_choice' || type === 'multiple_choice') {
          const checked = document.querySelectorAll('input[name="q_' + qId + '"]:checked');
          answers[qId] = Array.from(checked).map(c => c.value);
        } else if (type === 'single_choice') {
          const checked = document.querySelector('input[name="q_' + qId + '"]:checked');
          if (checked) answers[qId] = [checked.value];
        } else if (type === 'text') {
          const textarea = document.querySelector('textarea[name="q_' + qId + '"]');
          if (textarea) answers[qId] = textarea.value;
        } else if (type === 'dropdown') {
          const select = document.querySelector('select[name="q_' + qId + '"]');
          if (select && select.value) answers[qId] = select.value;
        }
      });
      
      const data = {
        booking_id: formData.get('booking_id') || null,
        respondent_name: formData.get('respondent_name') || null,
        respondent_email: formData.get('respondent_email') || null,
        course_name: formData.get('course_name') || null,
        answers: answers,
        overall_rating: overallRating,
        publish_consent: formData.get('publish_consent') || 'no'
      };
      
      try {
        const res = await fetch('/api/survey/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (result.success) {
          createConfetti();
          
          const modal = document.getElementById('thank-you-modal');
          modal.classList.remove('hidden');
          modal.classList.add('flex');
          
          if (overallRating >= 4) {
            document.getElementById('review-prompt').classList.remove('hidden');
          }
          
          const video = document.getElementById('thank-you-video');
          if (video.src || result.thankYouVideoUrl) {
            if (result.thankYouVideoUrl) video.src = result.thankYouVideoUrl;
            video.classList.remove('hidden');
            document.getElementById('video-placeholder').classList.add('hidden');
            video.play().catch(() => {});
          }
        } else {
          alert('送信に失敗しました: ' + (result.error || '不明なエラー'));
          submitBtn.disabled = false;
          submitBtn.innerHTML = '送信<i class="fas fa-paper-plane ml-2"></i>';
        }
      } catch (error) {
        alert('通信エラーが発生しました');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '送信<i class="fas fa-paper-plane ml-2"></i>';
      }
    });
    
    function closeModal() {
      const modal = document.getElementById('thank-you-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      const video = document.getElementById('thank-you-video');
      video.pause();
    }
    
    updateProgress();
  </script>
</body>
</html>
  `
}

function renderQuestionsByCategory(
  questions: SurveyQuestion[], 
  categoryLabels: Record<string, { label: string; icon: string }>
): string {
  const grouped: Record<string, SurveyQuestion[]> = {}
  
  questions.forEach(q => {
    const cat = q.question_category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(q)
  })
  
  // プロフィール（年齢、職業、業種）は1つのカードにまとめる
  const profileQuestions = grouped['profile'] || []
  
  // 評価系は1つのカードにまとめる（satisfaction, instructor, exercise）
  const ratingCategories = ['satisfaction', 'instructor', 'exercise']
  const ratingQuestions: SurveyQuestion[] = []
  ratingCategories.forEach(cat => {
    if (grouped[cat]) ratingQuestions.push(...grouped[cat])
  })
  
  // 残りのカテゴリ順序
  const otherCategoryOrder = [
    'difficulty', 'confidence', 'recommend',
    'feedback_positive', 'feedback_improve', 'online_feedback',
    'action', 'concerns', 
    'future_topics', 'other', 'review_permission',
    'content', 'environment', 'general'
  ]
  
  let html = ''
  
  // 受講講座セクション（最初に表示）
  const courseQuestions = grouped['course'] || []
  if (courseQuestions.length > 0) {
    const info = categoryLabels['course'] || { label: '受講講座', icon: 'fa-graduation-cap' }
    html += `
      <div class="survey-card rounded-3xl p-4 sm:p-6" style="overflow: visible; position: relative; z-index: 60;">
        <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <div class="category-icon">
            <i class="fas ${info.icon} text-base sm:text-lg" style="color: #c9a8e0;"></i>
          </div>
          <span class="text-base sm:text-lg font-medium title-3d" style="color: #5a5a6e;">${info.label}</span>
        </div>
        <div class="space-y-4 sm:space-y-6" style="overflow: visible;">
          ${courseQuestions.map((q, idx) => renderQuestion(q, idx)).join('')}
        </div>
      </div>
    `
  }
  
  // プロフィールセクション（横並びドロップダウン）
  if (profileQuestions.length > 0) {
    html += `
      <div class="survey-card rounded-3xl p-4 sm:p-6" style="overflow: visible; position: relative; z-index: 50;">
        <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <div class="category-icon">
            <i class="fas fa-user text-base sm:text-lg" style="color: #c9a8e0;"></i>
          </div>
          <span class="text-base sm:text-lg font-medium title-3d" style="color: #5a5a6e;">あなたについて</span>
          <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-500">任意</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" style="overflow: visible;">
          ${profileQuestions.map((q, idx) => renderCompactDropdown(q)).join('')}
        </div>
      </div>
    `
  }
  
  // 評価セクション（まとめて表示）
  if (ratingQuestions.length > 0) {
    html += `
      <div class="survey-card rounded-3xl p-4 sm:p-6" style="position: relative; z-index: 10;">
        <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <div class="category-icon">
            <i class="fas fa-star text-base sm:text-lg" style="color: #c9a8e0;"></i>
          </div>
          <span class="text-base sm:text-lg font-medium title-3d" style="color: #5a5a6e;">講座の評価</span>
        </div>
        <div class="space-y-4 sm:space-y-5">
          ${ratingQuestions.map((q, idx) => renderQuestion(q, idx)).join('')}
        </div>
      </div>
    `
  }
  
  // その他のカテゴリ
  html += otherCategoryOrder
    .filter(cat => grouped[cat] && grouped[cat].length > 0 && !ratingCategories.includes(cat))
    .map(cat => {
      const info = categoryLabels[cat] || categoryLabels.general
      const qs = grouped[cat]
      
      return `
        <div class="survey-card rounded-3xl p-4 sm:p-6">
          <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
            <div class="category-icon">
              <i class="fas ${info.icon} text-base sm:text-lg" style="color: #c9a8e0;"></i>
            </div>
            <span class="text-base sm:text-lg font-medium title-3d" style="color: #5a5a6e;">${info.label}</span>
          </div>
          <div class="space-y-4 sm:space-y-6">
            ${qs.map((q, idx) => renderQuestion(q, idx)).join('')}
          </div>
        </div>
      `
    }).join('')
  
  return html
}

// コンパクトなドロップダウン（プロフィール用）- カスタムUI
function renderCompactDropdown(q: SurveyQuestion): string {
  const options = q.options ? JSON.parse(q.options) : []
  const isRequired = q.is_required === 1
  
  return `
    <div class="question-item" data-question-id="${q.id}" data-type="dropdown" data-required="${isRequired}" data-category="${q.question_category}">
      <label class="block text-sm sm:text-base mb-2" style="color: #5a5a6e;">
        ${escapeHtml(q.question_text)}
        ${isRequired ? '<span style="color: #e8b4d8;"> *</span>' : ''}
      </label>
      <div class="custom-dropdown" data-dropdown-id="${q.id}">
        <select name="q_${q.id}" class="dropdown-select-hidden">
          <option value="">選択してください</option>
          ${options.map((opt: string) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
        </select>
        <div class="dropdown-trigger" onclick="toggleDropdown(${q.id})">
          <span class="dropdown-value dropdown-placeholder" data-default="選択">選択</span>
          <i class="fas fa-chevron-down"></i>
        </div>
        <div class="dropdown-menu" id="dropdown-menu-${q.id}">
          ${options.map((opt: string) => `
            <div class="dropdown-option" onclick="selectOption(${q.id}, '${escapeHtml(opt).replace(/'/g, "\\'")}')">
              ${escapeHtml(opt)}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `
}

function renderQuestion(q: SurveyQuestion, idx: number): string {
  const isRequired = q.is_required === 1
  
  if (q.question_type === 'rating') {
    return `
      <div class="question-item text-center" data-question-id="${q.id}" data-type="rating" data-required="${isRequired}" data-category="${q.question_category}">
        <label class="block text-base sm:text-lg mb-3 sm:mb-4" style="color: #5a5a6e;">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span style="color: #e8b4d8;"> *</span>' : ''}
        </label>
        <div class="star-rating justify-center">
          ${[5,4,3,2,1].map(n => `
            <input type="radio" name="q_${q.id}" id="q_${q.id}_${n}" value="${n}">
            <label for="q_${q.id}_${n}" title="${n}点">
              <i class="fas fa-star"></i>
            </label>
          `).join('')}
        </div>
      </div>
    `
  }
  
  if (q.question_type === 'dropdown') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div class="question-item" data-question-id="${q.id}" data-type="dropdown" data-required="${isRequired}" data-category="${q.question_category}">
        <label class="block text-base sm:text-lg mb-3 sm:mb-4" style="color: #5a5a6e;">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span style="color: #e8b4d8;"> *</span>' : ''}
        </label>
        <div class="custom-dropdown" data-dropdown-id="${q.id}">
          <select name="q_${q.id}" class="dropdown-select-hidden">
            <option value="">選択してください</option>
            ${options.map((opt: string) => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
          </select>
          <div class="dropdown-trigger" onclick="toggleDropdown(${q.id})">
            <span class="dropdown-value dropdown-placeholder" data-default="選択してください">選択してください</span>
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="dropdown-menu" id="dropdown-menu-${q.id}">
            ${options.map((opt: string) => `
              <div class="dropdown-option" onclick="selectOption(${q.id}, '${escapeHtml(opt).replace(/'/g, "\\'")}')">
                ${escapeHtml(opt)}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }
  
  if (q.question_type === 'choice' || q.question_type === 'single_choice') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div class="question-item" data-question-id="${q.id}" data-type="choice" data-required="${isRequired}" data-category="${q.question_category}">
        <label class="block text-base sm:text-lg mb-3 sm:mb-4" style="color: #5a5a6e;">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span style="color: #e8b4d8;"> *</span>' : ''}
        </label>
        <div class="space-y-2 sm:space-y-3">
          ${options.map((opt: string, i: number) => `
            <label class="choice-option flex items-center cursor-pointer">
              <input type="radio" name="q_${q.id}" value="${escapeHtml(opt)}" class="hidden">
              <span class="choice-label flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-gray-100 transition text-base sm:text-lg" style="color: #5a5a6e;">
                ${escapeHtml(opt)}
              </span>
            </label>
          `).join('')}
        </div>
      </div>
    `
  }
  
  if (q.question_type === 'multiple_choice') {
    const options = q.options ? JSON.parse(q.options) : []
    return `
      <div class="question-item" data-question-id="${q.id}" data-type="multiple_choice" data-required="${isRequired}" data-category="${q.question_category}">
        <label class="block text-base sm:text-lg mb-3 sm:mb-4" style="color: #5a5a6e;">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span style="color: #e8b4d8;"> *</span>' : '<span style="color: #a0a0b0;">（複数選択可）</span>'}
        </label>
        <div class="space-y-2 sm:space-y-3">
          ${options.map((opt: string, i: number) => `
            <label class="choice-option flex items-center cursor-pointer">
              <input type="checkbox" name="q_${q.id}" value="${escapeHtml(opt)}" class="hidden">
              <span class="choice-label flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-gray-100 transition text-base sm:text-lg" style="color: #5a5a6e;">
                ${escapeHtml(opt)}
              </span>
            </label>
          `).join('')}
        </div>
      </div>
    `
  }
  
  if (q.question_type === 'text') {
    return `
      <div class="question-item" data-question-id="${q.id}" data-type="text" data-required="${isRequired}" data-category="${q.question_category}">
        <label class="block text-base sm:text-lg mb-3 sm:mb-4" style="color: #5a5a6e;">
          ${escapeHtml(q.question_text)}
          ${isRequired ? '<span style="color: #e8b4d8;"> *</span>' : '<span style="color: #a0a0b0;">（任意）</span>'}
        </label>
        <textarea name="q_${q.id}" rows="3" 
                  class="survey-input w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl resize-none text-base sm:text-lg"
                  placeholder="ご自由にお書きください..."></textarea>
      </div>
    `
  }
  
  return ''
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
