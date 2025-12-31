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
  // オンライン設定
  online_url?: string  // Zoom/Google Meet URL
  meeting_type?: 'online' | 'offline' | 'hybrid'  // 開催形式
  // SEO
  meta_description?: string
  keywords?: string
}

// 講座カテゴリ
export const courseCategories = ['AI基礎', 'ビジネス活用', 'エンジニア向け', 'クリエイティブ', 'その他']

// 講座データはデータベースから取得
export const courses: Course[] = []

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

// スケジュールデータはデータベースから取得
export const schedules: Schedule[] = []

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
  video_url?: string
}

// ブログデータはデータベースから取得
export const blogPosts: BlogPost[] = []

// Portfolio data
export interface Portfolio {
  id: string
  title: string
  description: string
  image: string
  technologies: string[]
  demoUrl?: string
  githubUrl?: string
  category: string
}

// ポートフォリオデータはデータベースから取得
export const portfolios: Portfolio[] = []
