// カスタム404エラーページ
import { renderLayout } from '../components/layout'

export const render404Page = () => {
  const content = `
    <main class="min-h-screen flex items-center justify-content" style="background: linear-gradient(180deg, #FAF8F3 0%, #F5F0E6 100%);">
      <div class="w-full max-w-2xl mx-auto px-4 py-16 text-center">
        
        <!-- イラスト部分 -->
        <div class="mb-8">
          <div class="text-9xl font-bold mb-4" style="background: linear-gradient(135deg, #B8956A 0%, #C4A574 50%, #8B7355 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            404
          </div>
          <div class="text-5xl mb-4">☕️💫</div>
        </div>

        <!-- テキスト -->
        <h1 class="text-2xl sm:text-3xl font-bold mb-4" style="color: #3D3428;">
          ページが見つかりません
        </h1>
        <p class="text-lg mb-8" style="color: #7A7265;">
          お探しのページは存在しないか、<br class="sm:hidden">移動した可能性があります。
        </p>

        <!-- ボタン -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <a href="/" class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-white transition-all hover:shadow-lg hover:-translate-y-1" style="background: linear-gradient(135deg, #B8956A 0%, #C4A574 100%);">
            <i class="fas fa-home"></i>
            トップページに戻る
          </a>
          <a href="/courses" class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all hover:shadow-lg hover:-translate-y-1" style="background: white; color: #B8956A; border: 2px solid #B8956A;">
            <i class="fas fa-book"></i>
            講座一覧を見る
          </a>
        </div>

        <!-- ヘルプリンク -->
        <div class="pt-8 border-t" style="border-color: #E8DCC8;">
          <p style="color: #7A7265;">
            お探しの情報が見つからない場合は、<a href="/contact" class="underline font-medium" style="color: #B8956A;">お問い合わせ</a>ください。
          </p>
        </div>

        <!-- 人気ページへのリンク -->
        <div class="mt-12 p-6 rounded-2xl" style="background: rgba(184, 149, 106, 0.1);">
          <h2 class="text-lg font-bold mb-4" style="color: #5D4E3A;">
            <i class="fas fa-lightbulb mr-2" style="color: #B8956A;"></i>
            よくアクセスされるページ
          </h2>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="/courses" class="px-4 py-2 rounded-full text-sm transition-all hover:shadow" style="background: white; color: #5D4E3A;">
              <i class="fas fa-graduation-cap mr-1" style="color: #B8956A;"></i>講座一覧
            </a>
            <a href="/blog" class="px-4 py-2 rounded-full text-sm transition-all hover:shadow" style="background: white; color: #5D4E3A;">
              <i class="fas fa-blog mr-1" style="color: #B8956A;"></i>ブログ
            </a>
            <a href="/reservation" class="px-4 py-2 rounded-full text-sm transition-all hover:shadow" style="background: white; color: #5D4E3A;">
              <i class="fas fa-calendar mr-1" style="color: #B8956A;"></i>予約
            </a>
            <a href="/contact" class="px-4 py-2 rounded-full text-sm transition-all hover:shadow" style="background: white; color: #5D4E3A;">
              <i class="fas fa-envelope mr-1" style="color: #B8956A;"></i>お問い合わせ
            </a>
          </div>
        </div>

      </div>
    </main>
  `

  return renderLayout('ページが見つかりません', content, '')
}
