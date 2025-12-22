// Course data
export interface Course {
  id: string
  title: string
  description: string
  longDescription: string
  price: number
  duration: string
  level: string
  category: string
  image: string
  features: string[]
  instructor: string
}

export const courses: Course[] = [
  {
    id: 'ai-basics',
    title: 'AI基礎講座',
    description: 'AIの基本概念から実践的な活用方法まで学べる入門コース',
    longDescription: 'この講座では、人工知能（AI）の基本的な概念、機械学習の仕組み、そして日常業務での活用方法を学びます。プログラミング経験がなくても理解できる内容で構成されています。ChatGPTなどの生成AIの効果的な使い方も習得できます。',
    price: 15000,
    duration: '3時間',
    level: '初級',
    category: 'AI基礎',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60',
    features: ['AIの基本概念理解', '機械学習の仕組み', 'ChatGPT活用法', '実践ワークショップ'],
    instructor: '田中 花子'
  },
  {
    id: 'prompt-engineering',
    title: 'プロンプトエンジニアリング実践',
    description: 'ChatGPTを最大限活用するためのプロンプト設計術',
    longDescription: '生成AIから最高の出力を引き出すためのプロンプト設計技術を学びます。ビジネス文書作成、データ分析、クリエイティブ作業など、様々なシーンで使えるテクニックを習得します。',
    price: 25000,
    duration: '4時間',
    level: '中級',
    category: 'プロンプト',
    image: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&auto=format&fit=crop&q=60',
    features: ['プロンプト設計の基礎', 'ビジネス活用例', 'チェーンプロンプト', 'ベストプラクティス'],
    instructor: '鈴木 太郎'
  },
  {
    id: 'ai-business',
    title: 'AI業務効率化マスター',
    description: 'AIツールを活用して業務を劇的に効率化する方法',
    longDescription: '複数のAIツールを組み合わせて、日常業務を効率化する実践的なスキルを身につけます。メール処理、レポート作成、データ分析など、具体的な業務シーンに沿って学習します。',
    price: 35000,
    duration: '6時間',
    level: '中級',
    category: '業務効率化',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    features: ['複数AIツール連携', 'ワークフロー自動化', 'レポート作成術', '業務改善事例'],
    instructor: '山田 明美'
  },
  {
    id: 'ai-creative',
    title: 'AIクリエイティブ講座',
    description: '画像生成AIを使ったクリエイティブ制作を学ぶ',
    longDescription: 'Midjourney、DALL-E、Stable Diffusionなどの画像生成AIを使って、プロレベルのビジュアルコンテンツを制作する方法を学びます。',
    price: 28000,
    duration: '5時間',
    level: '初級〜中級',
    category: 'クリエイティブ',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    features: ['画像生成AI入門', 'プロンプト作成術', 'スタイル制御', 'ビジネス活用'],
    instructor: '佐藤 健一'
  },
  {
    id: 'ai-data-analysis',
    title: 'AIデータ分析入門',
    description: 'AIを活用したデータ分析の基礎を学ぶ',
    longDescription: 'Excelやスプレッドシートのデータを、AIツールを使って効率的に分析する方法を学びます。グラフ作成、トレンド分析、レポート生成まで一連の流れを習得します。',
    price: 32000,
    duration: '5時間',
    level: '中級',
    category: 'データ分析',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    features: ['データ整理・前処理', 'AI分析ツール活用', 'ビジュアライゼーション', 'レポート自動生成'],
    instructor: '高橋 真理'
  },
  {
    id: 'ai-writing',
    title: 'AIライティング講座',
    description: 'AIを活用した文章作成テクニック',
    longDescription: 'ブログ記事、マーケティングコピー、技術文書など、様々な文章をAIと協力して効率的に作成する方法を学びます。',
    price: 22000,
    duration: '4時間',
    level: '初級',
    category: 'ライティング',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60',
    features: ['AIライティング基礎', 'ジャンル別テクニック', '編集・校正術', 'SEO対策'],
    instructor: '中村 美咲'
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
