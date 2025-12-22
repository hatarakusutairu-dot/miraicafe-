// Course data

// カリキュラム項目
export interface CurriculumItem {
  title: string
  duration: string
  contents: string[]
}

// FAQ項目
export interface FAQItem {
  question: string
  answer: string
}

// 講師情報
export interface InstructorInfo {
  name: string
  title: string
  bio: string
  specialties: string[]
  image?: string
}

// ギャラリー画像
export interface GalleryImage {
  url: string
  caption: string
}

export interface Course {
  id: string
  title: string
  description: string
  longDescription: string
  catchphrase?: string  // キャッチコピー
  price: number
  duration: string
  level: string
  category: string
  image: string
  features: string[]
  instructor: string
  // 拡張フィールド
  targetAudience?: string[]  // こんな方におすすめ
  curriculum?: CurriculumItem[]  // カリキュラム
  instructorInfo?: InstructorInfo  // 講師詳細
  gallery?: GalleryImage[]  // 開催の様子
  faq?: FAQItem[]  // よくある質問
  maxCapacity?: number  // 定員
  includes?: string[]  // 含まれるもの
  cancellationPolicy?: string  // キャンセルポリシー
}

export const courses: Course[] = [
  {
    id: 'ai-basics',
    title: 'AI基礎講座',
    description: 'AIの基本概念から実践的な活用方法まで学べる入門コース',
    catchphrase: 'AIの世界への第一歩を、わかりやすく丁寧にサポート',
    longDescription: 'この講座では、人工知能（AI）の基本的な概念、機械学習の仕組み、そして日常業務での活用方法を学びます。プログラミング経験がなくても理解できる内容で構成されています。ChatGPTなどの生成AIの効果的な使い方も習得できます。',
    price: 15000,
    duration: '3時間',
    level: '初級',
    category: 'AI基礎',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    features: ['AIの基本概念理解', '機械学習の仕組み', 'ChatGPT活用法', '実践ワークショップ'],
    instructor: '田中 花子',
    maxCapacity: 10,
    targetAudience: [
      'AIに興味があるが何から始めればいいかわからない方',
      '業務でAIを活用したいと考えている方',
      'ChatGPTを使い始めたがもっと効果的に使いたい方',
      'IT知識がなくてもAIを理解したい方',
      '教育現場でAIを取り入れたい先生方'
    ],
    curriculum: [
      {
        title: '第1部：AIの基礎知識',
        duration: '45分',
        contents: [
          'AIとは何か？ - 人工知能の定義と歴史',
          '機械学習・ディープラーニングの仕組み',
          '生成AIの登場と社会への影響',
          'AIができること・できないこと'
        ]
      },
      {
        title: '第2部：ChatGPTの使い方',
        duration: '60分',
        contents: [
          'ChatGPTアカウントの作成と基本操作',
          '効果的なプロンプトの書き方',
          '実践：文章作成・要約・翻訳を体験',
          'よくある失敗と対処法'
        ]
      },
      {
        title: '第3部：実践ワークショップ',
        duration: '60分',
        contents: [
          '業務での活用シーン紹介',
          'グループワーク：自分の業務に活かすアイデア出し',
          '質疑応答・個別相談',
          '今後の学習ロードマップ'
        ]
      }
    ],
    instructorInfo: {
      name: '田中 花子',
      title: 'AI活用コンサルタント / mirAIcafe認定講師',
      bio: '大手IT企業でAIプロジェクトのマネージャーを10年経験後、AI教育の普及を目指しmirAIcafeの講師に。「難しいことをわかりやすく」をモットーに、これまで500名以上の受講生にAIの基礎を指導。初心者目線での丁寧な解説に定評があります。',
      specialties: ['AI基礎教育', 'ChatGPT活用', '業務効率化', 'DX推進'],
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60', caption: 'オンライン講座の様子' },
      { url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60', caption: 'グループワークの様子' },
      { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60', caption: '実践演習中' },
      { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60', caption: '質疑応答タイム' }
    ],
    faq: [
      { question: 'オンラインですか？対面ですか？', answer: 'オンライン（Zoom）で実施します。ご自宅やオフィスなど、インターネット環境があればどこからでも参加可能です。' },
      { question: '録画はありますか？', answer: 'はい、受講後1ヶ月間は録画を視聴いただけます。復習や見逃し時にご活用ください。' },
      { question: '初心者でも大丈夫ですか？', answer: 'もちろんです！この講座は完全初心者向けに設計されています。パソコンの基本操作ができれば問題ありません。' },
      { question: 'ChatGPTの有料版は必要ですか？', answer: '無料版でも受講いただけます。有料版をお持ちの方はより高度な機能も体験いただけます。' },
      { question: '受講に必要なものは？', answer: 'パソコン（またはタブレット）、安定したインターネット環境、ChatGPTアカウント（無料でOK）をご用意ください。' },
      { question: '領収書は発行できますか？', answer: 'はい、ご希望の方には領収書を発行いたします。法人名義での発行も可能です。' }
    ],
    includes: [
      '講座テキスト（PDF）',
      '実践ワークシート',
      '録画視聴（1ヶ月間）',
      'プロンプト集（特典）',
      '修了証発行'
    ],
    cancellationPolicy: '7日前まで：全額返金 / 3日前まで：50%返金 / それ以降：返金不可'
  },
  {
    id: 'prompt-engineering',
    title: 'プロンプトエンジニアリング実践',
    description: 'ChatGPTを最大限活用するためのプロンプト設計術',
    catchphrase: 'AIの力を120%引き出すプロンプト設計のプロになる',
    longDescription: '生成AIから最高の出力を引き出すためのプロンプト設計技術を学びます。ビジネス文書作成、データ分析、クリエイティブ作業など、様々なシーンで使えるテクニックを習得します。',
    price: 25000,
    duration: '4時間',
    level: '中級',
    category: 'プロンプト',
    image: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&auto=format&fit=crop&q=60',
    features: ['プロンプト設計の基礎', 'ビジネス活用例', 'チェーンプロンプト', 'ベストプラクティス'],
    instructor: '鈴木 太郎',
    maxCapacity: 8,
    targetAudience: [
      'ChatGPTを使っているがより効果的に使いたい方',
      'ビジネスでAIを本格活用したい方',
      'プロンプト設計のスキルを身につけたい方',
      'AI活用の業務効率化を目指す方'
    ],
    curriculum: [
      { title: '第1部：プロンプト設計の原則', duration: '60分', contents: ['プロンプトの構造と要素', '明確な指示の書き方', 'コンテキストの与え方', '出力形式の指定方法'] },
      { title: '第2部：高度なテクニック', duration: '90分', contents: ['Few-shotプロンプト', 'Chain of Thought', 'ロールプレイング', 'プロンプトテンプレート作成'] },
      { title: '第3部：実践演習', duration: '90分', contents: ['ビジネス文書作成', 'データ分析・要約', 'クリエイティブ作業', '自分専用プロンプト作成'] }
    ],
    instructorInfo: {
      name: '鈴木 太郎',
      title: 'プロンプトエンジニア / AI活用スペシャリスト',
      bio: 'スタートアップでCTOを務めた後、AI活用コンサルタントとして独立。プロンプトエンジニアリングの第一人者として、企業向け研修や個人向け講座を多数開催。',
      specialties: ['プロンプト設計', 'AIシステム構築', 'ChatGPT/Claude活用'],
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=60'
    },
    gallery: [
      { url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60', caption: '講座の様子' },
      { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60', caption: '実践演習' }
    ],
    faq: [
      { question: 'AI基礎講座を受けていなくても大丈夫？', answer: 'ChatGPTの基本操作ができる方であれば問題ありません。不安な方はAI基礎講座との同時受講をおすすめします。' },
      { question: 'どのAIツールを使いますか？', answer: '主にChatGPTを使用しますが、Claude等他のツールにも応用可能な汎用的なスキルを学びます。' },
      { question: '業務に活かせますか？', answer: 'はい。講座で作成したプロンプトテンプレートは、そのまま業務でご活用いただけます。' }
    ],
    includes: ['講座テキスト（PDF）', 'プロンプトテンプレート50選', '録画視聴（1ヶ月間）', '修了証発行'],
    cancellationPolicy: '7日前まで：全額返金 / 3日前まで：50%返金 / それ以降：返金不可'
  },
  {
    id: 'ai-business',
    title: 'AI業務効率化マスター',
    description: 'AIツールを活用して業務を劇的に効率化する方法',
    catchphrase: '毎日の業務を半分の時間で終わらせる',
    longDescription: '複数のAIツールを組み合わせて、日常業務を効率化する実践的なスキルを身につけます。メール処理、レポート作成、データ分析など、具体的な業務シーンに沿って学習します。',
    price: 35000,
    duration: '6時間',
    level: '中級',
    category: '業務効率化',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    features: ['複数AIツール連携', 'ワークフロー自動化', 'レポート作成術', '業務改善事例'],
    instructor: '山田 明美',
    maxCapacity: 12,
    targetAudience: [
      '業務の効率化を本気で目指している方',
      '複数のAIツールを使いこなしたい方',
      'チームの生産性を向上させたいリーダー',
      'ルーティンワークを自動化したい方'
    ],
    curriculum: [
      { title: '第1部：AI効率化の全体像', duration: '60分', contents: ['業務別AIツールマップ', '効率化の優先順位付け', '導入ステップ'] },
      { title: '第2部：メール・文書作成', duration: '90分', contents: ['メール自動作成', '議事録・レポート', 'テンプレート化'] },
      { title: '第3部：データ分析・可視化', duration: '90分', contents: ['Excelとの連携', 'グラフ自動生成', 'レポート自動化'] },
      { title: '第4部：ワークフロー構築', duration: '60分', contents: ['ツール連携', '自動化設計', '実践プラン作成'] }
    ],
    instructorInfo: {
      name: '山田 明美',
      title: '業務改善コンサルタント / DXアドバイザー',
      bio: '大手コンサルティングファームで業務改善プロジェクトを多数手がけた後、AI活用に特化したコンサルタントとして独立。実践重視のわかりやすい指導が好評。',
      specialties: ['業務効率化', 'DX推進', 'AI導入支援'],
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60'
    },
    faq: [
      { question: '具体的にどんなツールを使いますか？', answer: 'ChatGPT、Claude、Notion AI、Microsoft Copilotなど、業務に直結するツールを扱います。' },
      { question: '自社のツールに応用できますか？', answer: 'はい。汎用的な考え方を学ぶので、様々なツールに応用可能です。' }
    ],
    includes: ['講座テキスト（PDF）', '業務別テンプレート集', '効率化チェックリスト', '録画視聴（1ヶ月間）', '修了証発行'],
    cancellationPolicy: '7日前まで：全額返金 / 3日前まで：50%返金 / それ以降：返金不可'
  },
  {
    id: 'ai-creative',
    title: 'AIクリエイティブ講座',
    description: '画像生成AIを使ったクリエイティブ制作を学ぶ',
    catchphrase: 'アイデアを一瞬でビジュアルに変える',
    longDescription: 'Midjourney、DALL-E、Stable Diffusionなどの画像生成AIを使って、プロレベルのビジュアルコンテンツを制作する方法を学びます。',
    price: 28000,
    duration: '5時間',
    level: '初級〜中級',
    category: 'クリエイティブ',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    features: ['画像生成AI入門', 'プロンプト作成術', 'スタイル制御', 'ビジネス活用'],
    instructor: '佐藤 健一',
    maxCapacity: 10,
    targetAudience: [
      'デザインスキルがなくても画像を作りたい方',
      'SNS・ブログ用の画像を簡単に作りたい方',
      'クリエイティブ業務を効率化したいデザイナー',
      '新しい表現方法を探しているクリエイター'
    ],
    curriculum: [
      { title: '第1部：画像生成AIの基礎', duration: '60分', contents: ['各ツールの特徴と選び方', 'アカウント作成と基本操作'] },
      { title: '第2部：プロンプト作成術', duration: '90分', contents: ['効果的なプロンプトの書き方', 'スタイル・構図の指定', '修正・調整テクニック'] },
      { title: '第3部：実践制作', duration: '120分', contents: ['SNS用画像制作', 'プレゼン資料用素材', 'ブランドイメージ作成'] }
    ],
    instructorInfo: {
      name: '佐藤 健一',
      title: 'クリエイティブディレクター / AIアーティスト',
      bio: '広告代理店でクリエイティブディレクターを経験後、AI画像生成の可能性に着目。AIを活用したクリエイティブ制作の第一人者として活動中。',
      specialties: ['画像生成AI', 'クリエイティブ制作', 'ブランディング'],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60'
    },
    faq: [
      { question: 'デザイン経験がなくても大丈夫？', answer: 'はい！デザイン経験がなくても素敵な画像が作れるのがAI画像生成の魅力です。' },
      { question: '商用利用できますか？', answer: '各ツールの利用規約に沿った商用利用方法も講座内でご説明します。' }
    ],
    includes: ['講座テキスト（PDF）', 'プロンプト集100選', '作例サンプル集', '録画視聴（1ヶ月間）', '修了証発行'],
    cancellationPolicy: '7日前まで：全額返金 / 3日前まで：50%返金 / それ以降：返金不可'
  },
  {
    id: 'ai-data-analysis',
    title: 'AIデータ分析入門',
    description: 'AIを活用したデータ分析の基礎を学ぶ',
    catchphrase: 'Excelデータをビジネス価値に変える',
    longDescription: 'Excelやスプレッドシートのデータを、AIツールを使って効率的に分析する方法を学びます。グラフ作成、トレンド分析、レポート生成まで一連の流れを習得します。',
    price: 32000,
    duration: '5時間',
    level: '中級',
    category: 'データ分析',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    features: ['データ整理・前処理', 'AI分析ツール活用', 'ビジュアライゼーション', 'レポート自動生成'],
    instructor: '高橋 真理',
    maxCapacity: 8,
    targetAudience: [
      'Excelデータの分析を効率化したい方',
      'データに基づいた意思決定をしたい方',
      'レポート作成を自動化したい方',
      '統計の知識がなくても分析したい方'
    ],
    curriculum: [
      { title: '第1部：データ分析の基礎', duration: '60分', contents: ['分析の目的設定', 'データの整理・クレンジング'] },
      { title: '第2部：AI分析ツール活用', duration: '120分', contents: ['ChatGPTでの分析', 'パターン発見・予測', 'グラフ・チャート作成'] },
      { title: '第3部：レポート作成', duration: '90分', contents: ['分析結果のまとめ方', '自動レポート生成', 'プレゼン資料作成'] }
    ],
    instructorInfo: {
      name: '高橋 真理',
      title: 'データアナリスト / 統計スペシャリスト',
      bio: 'マーケティングリサーチ企業でデータ分析を10年以上担当。「数字が苦手な人にもわかるデータ分析」をテーマに講座を展開中。',
      specialties: ['データ分析', 'ビジュアライゼーション', '統計解析'],
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&auto=format&fit=crop&q=60'
    },
    faq: [
      { question: '統計の知識は必要ですか？', answer: '不要です。難しい数式は使わず、AIを活用した直感的な分析方法を学びます。' },
      { question: 'どんなデータでも分析できますか？', answer: '売上データ、アンケート結果、顧客データなど、様々なビジネスデータに対応した分析方法を学びます。' }
    ],
    includes: ['講座テキスト（PDF）', '分析テンプレート', 'サンプルデータ', '録画視聴（1ヶ月間）', '修了証発行'],
    cancellationPolicy: '7日前まで：全額返金 / 3日前まで：50%返金 / それ以降：返金不可'
  },
  {
    id: 'ai-writing',
    title: 'AIライティング講座',
    description: 'AIを活用した文章作成テクニック',
    catchphrase: '文章作成のスピードと質を同時に高める',
    longDescription: 'ブログ記事、マーケティングコピー、技術文書など、様々な文章をAIと協力して効率的に作成する方法を学びます。',
    price: 22000,
    duration: '4時間',
    level: '初級',
    category: 'ライティング',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60',
    features: ['AIライティング基礎', 'ジャンル別テクニック', '編集・校正術', 'SEO対策'],
    instructor: '中村 美咲',
    maxCapacity: 10,
    targetAudience: [
      '文章作成に時間がかかる方',
      'ブログやSNSの発信を続けたい方',
      'ビジネス文書を効率的に作成したい方',
      'ライティングスキルを向上させたい方'
    ],
    curriculum: [
      { title: '第1部：AIライティングの基礎', duration: '60分', contents: ['AI活用の原則', '下書き・アウトライン作成', '構成の立て方'] },
      { title: '第2部：ジャンル別テクニック', duration: '90分', contents: ['ブログ記事', 'ビジネスメール', 'SNS投稿', 'プレスリリース'] },
      { title: '第3部：編集・仕上げ', duration: '90分', contents: ['校正・推敲術', 'オリジナリティの出し方', 'SEO対策'] }
    ],
    instructorInfo: {
      name: '中村 美咲',
      title: 'コンテンツディレクター / ライティングコーチ',
      bio: 'Webメディアの編集長を経て、AIを活用したライティング講座を開講。「伝わる文章」の書き方を、AI時代のアプローチで指導。',
      specialties: ['コンテンツ制作', 'SEOライティング', 'コピーライティング'],
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=60'
    },
    faq: [
      { question: '文章が苦手でも大丈夫？', answer: 'はい！AIがサポートしてくれるので、文章が苦手な方でも質の高い文章が作れるようになります。' },
      { question: 'AIで書いた文章は問題ない？', answer: '適切な編集・加工方法を学ぶことで、オリジナリティのある文章に仕上げる方法をお伝えします。' }
    ],
    includes: ['講座テキスト（PDF）', 'ライティングテンプレート集', '校正チェックリスト', '録画視聴（1ヶ月間）', '修了証発行'],
    cancellationPolicy: '7日前まで：全額返金 / 3日前まで：50%返金 / それ以降：返金不可'
  }
]

// Schedule data
export interface Schedule {
  id: string
  courseId: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  enrolled: number
  location: string
}

export const schedules: Schedule[] = [
  { id: 'sch001', courseId: 'ai-basics', date: '2025-01-08', startTime: '10:00', endTime: '13:00', capacity: 10, enrolled: 3, location: 'オンライン' },
  { id: 'sch002', courseId: 'ai-basics', date: '2025-01-15', startTime: '14:00', endTime: '17:00', capacity: 10, enrolled: 5, location: 'オンライン' },
  { id: 'sch003', courseId: 'prompt-engineering', date: '2025-01-10', startTime: '10:00', endTime: '14:00', capacity: 8, enrolled: 2, location: 'オンライン' },
  { id: 'sch004', courseId: 'prompt-engineering', date: '2025-01-17', startTime: '13:00', endTime: '17:00', capacity: 8, enrolled: 6, location: 'オンライン' },
  { id: 'sch005', courseId: 'ai-business', date: '2025-01-12', startTime: '09:00', endTime: '15:00', capacity: 12, enrolled: 4, location: 'オンライン' },
  { id: 'sch006', courseId: 'ai-business', date: '2025-01-20', startTime: '10:00', endTime: '16:00', capacity: 12, enrolled: 8, location: 'オンライン' },
  { id: 'sch007', courseId: 'ai-creative', date: '2025-01-14', startTime: '10:00', endTime: '15:00', capacity: 10, enrolled: 3, location: 'オンライン' },
  { id: 'sch008', courseId: 'ai-data-analysis', date: '2025-01-16', startTime: '10:00', endTime: '15:00', capacity: 8, enrolled: 2, location: 'オンライン' },
  { id: 'sch009', courseId: 'ai-writing', date: '2025-01-18', startTime: '13:00', endTime: '17:00', capacity: 10, enrolled: 4, location: 'オンライン' },
  { id: 'sch010', courseId: 'ai-basics', date: '2025-01-22', startTime: '10:00', endTime: '13:00', capacity: 10, enrolled: 1, location: 'オンライン' },
  { id: 'sch011', courseId: 'prompt-engineering', date: '2025-01-24', startTime: '14:00', endTime: '18:00', capacity: 8, enrolled: 0, location: 'オンライン' },
  { id: 'sch012', courseId: 'ai-business', date: '2025-01-26', startTime: '10:00', endTime: '16:00', capacity: 12, enrolled: 2, location: 'オンライン' }
]

// Blog data
// カテゴリ定義: '開発日誌' | 'AI情報・ニュース' | 'お役立ち情報' | 'お知らせ'
export type BlogCategory = '開発日誌' | 'AI情報・ニュース' | 'お役立ち情報' | 'お知らせ'

export const blogCategories: { name: BlogCategory; color: string; bgColor: string }[] = [
  { name: '開発日誌', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { name: 'AI情報・ニュース', color: 'text-green-600', bgColor: 'bg-green-100' },
  { name: 'お役立ち情報', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { name: 'お知らせ', color: 'text-orange-600', bgColor: 'bg-orange-100' }
]

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  category: BlogCategory
  tags: string[]
  image: string
  readTime: string
}

export const blogPosts: BlogPost[] = [
  {
    id: 'chatgpt-tips',
    title: 'ChatGPTを10倍活用するための7つのコツ',
    excerpt: 'ChatGPTをより効果的に使うためのテクニックを紹介します。初心者から上級者まで役立つヒントが満載です。',
    content: `
      <p>ChatGPTは今や多くの人々の生活に欠かせないツールとなっています。しかし、その真の力を引き出せている人は少ないかもしれません。今回は、ChatGPTをより効果的に活用するための7つのコツをご紹介します。</p>
      
      <h2>1. 具体的な指示を出す</h2>
      <p>「記事を書いて」よりも「500文字程度で、初心者向けにAIの基礎を説明する記事を書いて」の方が、より良い結果が得られます。</p>
      
      <h2>2. 役割を与える</h2>
      <p>「あなたは経験豊富なマーケティング専門家です」のように役割を与えると、その視点からの回答が得られます。</p>
      
      <h2>3. フォーマットを指定する</h2>
      <p>箇条書き、表形式、ステップバイステップなど、出力形式を指定しましょう。</p>
      
      <h2>4. 例を示す</h2>
      <p>望む出力の例を示すことで、より精度の高い回答を得られます。</p>
      
      <h2>5. 段階的に質問する</h2>
      <p>複雑なタスクは、複数のステップに分けて質問しましょう。</p>
      
      <h2>6. フィードバックを与える</h2>
      <p>「もっと詳しく」「もう少し簡潔に」などのフィードバックで、出力を改善できます。</p>
      
      <h2>7. 新しい会話を活用する</h2>
      <p>話題が変わったら新しい会話を始めると、より適切な回答が得られます。</p>
    `,
    author: '田中 花子',
    date: '2024-12-20',
    category: 'お役立ち情報',
    tags: ['ChatGPT', 'プロンプト', '活用術', '初心者向け'],
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    readTime: '5分'
  },
  {
    id: 'ai-business-trends',
    title: '2025年のAIビジネストレンド予測',
    excerpt: '2025年に注目すべきAIビジネストレンドを解説。企業がどのようにAIを活用していくのか予測します。',
    content: `
      <p>2025年、AIはさらにビジネスの中核に浸透していくと予測されます。今回は、注目すべきトレンドをご紹介します。</p>
      
      <h2>1. AIエージェントの台頭</h2>
      <p>単なるチャットボットではなく、複雑なタスクを自律的にこなすAIエージェントが普及します。</p>
      
      <h2>2. マルチモーダルAIの進化</h2>
      <p>テキスト、画像、音声を統合的に処理するAIが、より高度なサービスを提供します。</p>
      
      <h2>3. AIガバナンスの重要性</h2>
      <p>AI活用が進むにつれ、適切なガバナンス体制の構築が不可欠になります。</p>
      
      <h2>4. パーソナライズドラーニング</h2>
      <p>AIが個人の学習スタイルに合わせた教育を提供するようになります。</p>
    `,
    author: '鈴木 太郎',
    date: '2024-12-18',
    category: 'AI情報・ニュース',
    tags: ['AIトレンド', 'ビジネス', '2025年予測'],
    image: 'https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&auto=format&fit=crop&q=60',
    readTime: '7分'
  },
  {
    id: 'prompt-basics',
    title: 'プロンプトエンジニアリング入門ガイド',
    excerpt: 'プロンプトエンジニアリングの基礎から応用まで、体系的に学べる入門ガイドです。',
    content: `
      <p>プロンプトエンジニアリングは、AIから望む出力を得るための技術です。この入門ガイドでは、基礎から応用まで解説します。</p>
      
      <h2>プロンプトとは？</h2>
      <p>プロンプトとは、AIに与える指示や質問のことです。良いプロンプトは、良い結果につながります。</p>
      
      <h2>基本構造</h2>
      <p>効果的なプロンプトは通常、以下の要素で構成されます：</p>
      <ul>
        <li>コンテキスト（背景情報）</li>
        <li>指示（何をしてほしいか）</li>
        <li>フォーマット（出力形式）</li>
        <li>制約条件（避けてほしいことなど）</li>
      </ul>
      
      <h2>実践例</h2>
      <p>「プロのコピーライターとして、20代女性向けの化粧品広告文を、感情に訴えかける表現で100文字以内で書いてください。」</p>
    `,
    author: '山田 明美',
    date: '2024-12-15',
    category: 'お役立ち情報',
    tags: ['プロンプト', '入門', '学習'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    readTime: '8分'
  },
  {
    id: 'ai-tools-comparison',
    title: '2024年最新AIツール比較ガイド',
    excerpt: 'ChatGPT、Claude、Geminiなど、主要なAIツールを徹底比較。用途別のおすすめも紹介します。',
    content: `
      <p>様々なAIツールが登場している今、どれを使えばいいか迷う方も多いでしょう。今回は主要なAIツールを比較します。</p>
      
      <h2>ChatGPT</h2>
      <p>最も広く使われているAI。汎用性が高く、日本語対応も優秀です。</p>
      
      <h2>Claude</h2>
      <p>長文処理が得意で、より自然な会話が可能。倫理面での配慮も特徴です。</p>
      
      <h2>Gemini</h2>
      <p>Googleのサービスとの連携が強み。検索との統合が便利です。</p>
      
      <h2>用途別おすすめ</h2>
      <ul>
        <li>文章作成：ChatGPT、Claude</li>
        <li>コード生成：ChatGPT、Claude</li>
        <li>調べもの：Gemini</li>
        <li>長文分析：Claude</li>
      </ul>
    `,
    author: '佐藤 健一',
    date: '2024-12-10',
    category: 'AI情報・ニュース',
    tags: ['ChatGPT', 'Claude', 'Gemini', 'AIツール比較'],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    readTime: '6分'
  }
]
