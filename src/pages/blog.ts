import { renderLayout } from '../components/layout'
import { BlogPost } from '../data'

export const renderBlogPage = (posts: BlogPost[]) => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-hero relative overflow-hidden py-16">
      <div class="wave-bg opacity-50"></div>
      <div class="wave-bg wave-bg-2 opacity-30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="inline-block bg-white/70 backdrop-blur-sm text-blue-600 font-medium px-4 py-2 rounded-full text-sm mb-4">
          <i class="fas fa-newspaper mr-2"></i>最新情報
        </span>
        <h1 class="font-display text-4xl font-bold text-greenhouse-text mb-4">AI学習ブログ</h1>
        <p class="text-greenhouse-textLight max-w-xl mx-auto">最新のAI情報、学習のコツ、活用事例をお届けします</p>
      </div>
    </section>

    <!-- Blog Grid -->
    <section class="py-12 gradient-soft">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Featured Post -->
        ${posts.length > 0 ? `
          <a href="/blog/${posts[0].id}" class="card-hover block bg-white overflow-hidden shadow-md mb-12">
            <div class="grid grid-cols-1 md:grid-cols-2">
              <div class="aspect-video md:aspect-auto overflow-hidden">
                <img src="${posts[0].image}" alt="${posts[0].title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-8 flex flex-col justify-center">
                <div class="flex items-center gap-4 text-sm text-greenhouse-textLight mb-3">
                  <span class="bg-character-green text-white font-medium px-3 py-1 rounded-full">${posts[0].category}</span>
                  <span><i class="fas fa-clock mr-1 text-character-orange"></i>${posts[0].readTime}</span>
                  <span><i class="fas fa-calendar mr-1 text-character-pink"></i>${posts[0].date}</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-bold text-greenhouse-text mb-3">${posts[0].title}</h2>
                <p class="text-greenhouse-textLight mb-4 line-clamp-3">${posts[0].excerpt}</p>
                <div class="flex items-center">
                  <div class="w-10 h-10 gradient-button rounded-full flex items-center justify-center mr-3 shadow">
                    <i class="fas fa-user text-white text-sm"></i>
                  </div>
                  <span class="text-greenhouse-text font-medium">${posts[0].author}</span>
                </div>
              </div>
            </div>
          </a>
        ` : ''}

        <!-- Category Filter -->
        <div class="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm">
          <span class="text-greenhouse-textLight font-medium">カテゴリ:</span>
          <button class="category-btn active gradient-button text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm" data-category="all">
            すべて
          </button>
          ${[...new Set(posts.map(p => p.category))].map((cat, index) => `
            <button class="category-btn bg-greenhouse-beige text-greenhouse-text px-5 py-2 rounded-full text-sm font-medium hover:bg-character-${index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'pink'} hover:text-white transition-all" data-category="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blog-grid">
          ${posts.slice(1).map((post, index) => `
            <a href="/blog/${post.id}" class="card-hover bg-white overflow-hidden shadow-md block blog-card" data-category="${post.category}">
              <div class="aspect-video bg-greenhouse-beige overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-greenhouse-textLight mb-2">
                  <span class="bg-character-${index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'pink'}/20 text-character-${index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'pink'} font-medium px-2 py-1 rounded">${post.category}</span>
                  <span><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
                </div>
                <h3 class="text-lg font-bold text-greenhouse-text mb-2 line-clamp-2">${post.title}</h3>
                <p class="text-greenhouse-textLight text-sm line-clamp-2 mb-4">${post.excerpt}</p>
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center text-greenhouse-textLight">
                    <div class="w-6 h-6 gradient-button rounded-full flex items-center justify-center mr-2">
                      <i class="fas fa-user text-white text-xs"></i>
                    </div>
                    ${post.author}
                  </div>
                  <span class="text-greenhouse-textLight">${post.date}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-12 bg-white">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-br from-character-green/10 to-greenhouse-sky/20 rounded-3xl p-8 border border-character-green/20">
          <div class="text-center">
            <div class="w-16 h-16 gradient-button rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i class="fas fa-envelope text-white text-2xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-greenhouse-text mb-2">最新情報をお届け</h2>
            <p class="text-greenhouse-textLight mb-6">メールマガジンに登録して、AI学習の最新情報を受け取りましょう</p>
            <form class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="メールアドレス" class="flex-1 p-4 border-2 border-greenhouse-beige rounded-xl focus:border-character-green focus:outline-none transition-colors bg-white">
              <button type="submit" class="btn-primary gradient-button text-white px-6 py-4 rounded-xl font-medium shadow-lg">
                登録する
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <script>
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('active', 'gradient-button', 'text-white', 'shadow-sm');
            b.classList.add('bg-greenhouse-beige', 'text-greenhouse-text');
          });
          this.classList.remove('bg-greenhouse-beige', 'text-greenhouse-text');
          this.classList.add('active', 'gradient-button', 'text-white', 'shadow-sm');
          const category = this.dataset.category;
          document.querySelectorAll('.blog-card').forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });
    </script>
  `

  return renderLayout('ブログ', content, 'blog')
}

export const renderBlogPostPage = (post: BlogPost) => {
  const content = `
    <!-- Article Header -->
    <section class="relative">
      <div class="aspect-[3/1] max-h-96 overflow-hidden">
        <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-greenhouse-text/80 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex items-center gap-3 mb-3">
            <span class="bg-character-green text-white text-sm font-medium px-3 py-1 rounded-full">${post.category}</span>
            <span class="text-greenhouse-cream text-sm"><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
          </div>
          <h1 class="font-display text-3xl md:text-4xl font-bold text-white leading-tight">${post.title}</h1>
        </div>
      </div>
    </section>

    <!-- Article Content -->
    <section class="py-12 gradient-soft">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-3xl shadow-md overflow-hidden border border-greenhouse-beige">
          <!-- Author Info -->
          <div class="p-6 border-b border-greenhouse-beige flex items-center justify-between bg-greenhouse-cream/50">
            <div class="flex items-center">
              <div class="w-12 h-12 gradient-button rounded-full flex items-center justify-center mr-4 shadow">
                <i class="fas fa-user text-white"></i>
              </div>
              <div>
                <p class="font-bold text-greenhouse-text">${post.author}</p>
                <p class="text-greenhouse-textLight text-sm">${post.date}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="w-10 h-10 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center" title="Twitter">
                <i class="fab fa-twitter"></i>
              </button>
              <button class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-700 hover:text-white transition-all flex items-center justify-center" title="Facebook">
                <i class="fab fa-facebook-f"></i>
              </button>
              <button class="w-10 h-10 rounded-full bg-greenhouse-beige text-greenhouse-text hover:bg-character-green hover:text-white transition-all flex items-center justify-center" title="リンクをコピー">
                <i class="fas fa-link"></i>
              </button>
            </div>
          </div>

          <!-- Article Body -->
          <article class="p-8 prose prose-lg max-w-none">
            <style>
              .prose h2 {
                color: #4A4A4A;
                font-weight: 700;
                margin-top: 2rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 3px solid #C7E1B1;
              }
              .prose p {
                color: #6B6B6B;
                line-height: 1.9;
                margin-bottom: 1.5rem;
              }
              .prose ul, .prose ol {
                color: #6B6B6B;
                margin-bottom: 1.5rem;
              }
              .prose li {
                margin-bottom: 0.5rem;
              }
              .prose strong {
                color: #3ABD6F;
              }
            </style>
            ${post.content}
          </article>

          <!-- Tags -->
          <div class="p-6 border-t border-greenhouse-beige bg-greenhouse-cream/30">
            <div class="flex flex-wrap gap-2">
              <span class="bg-character-green/10 text-character-green px-4 py-2 rounded-full text-sm font-medium">#AI</span>
              <span class="bg-character-orange/10 text-character-orange px-4 py-2 rounded-full text-sm font-medium">#${post.category}</span>
              <span class="bg-character-pink/10 text-character-pink px-4 py-2 rounded-full text-sm font-medium">#学習</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center mt-8">
          <a href="/blog" class="inline-flex items-center text-character-green hover:text-green-600 font-medium transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>ブログ一覧に戻る
          </a>
        </div>
      </div>
    </section>

    <!-- Related CTA -->
    <section class="py-12 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-br from-character-green/10 to-greenhouse-sky/20 rounded-3xl p-8 text-center border border-character-green/20">
          <h2 class="text-2xl font-bold text-greenhouse-text mb-4">
            もっと深く学びたいですか？
          </h2>
          <p class="text-greenhouse-textLight mb-6">
            mirAIcafeの講座で、実践的なAIスキルを身につけましょう
          </p>
          <a href="/courses" class="btn-primary inline-flex items-center justify-center gradient-button text-white px-8 py-4 rounded-full font-bold shadow-lg">
            <i class="fas fa-book-open mr-2"></i>講座を見る
          </a>
        </div>
      </div>
    </section>
  `

  return renderLayout(post.title, content, 'blog')
}
