import { renderLayout } from '../components/layout'
import { BlogPost } from '../data'

export const renderBlogPage = (posts: BlogPost[]) => {
  const content = `
    <!-- Page Header -->
    <section class="gradient-cafe py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl font-bold text-white mb-4">AI学習ブログ</h1>
        <p class="text-cafe-cream/90">最新のAI情報、学習のコツ、活用事例をお届けします</p>
      </div>
    </section>

    <!-- Blog Grid -->
    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Featured Post -->
        ${posts.length > 0 ? `
          <a href="/blog/${posts[0].id}" class="card-hover block bg-white rounded-2xl overflow-hidden shadow-md mb-12">
            <div class="grid grid-cols-1 md:grid-cols-2">
              <div class="aspect-video md:aspect-auto overflow-hidden">
                <img src="${posts[0].image}" alt="${posts[0].title}" class="w-full h-full object-cover">
              </div>
              <div class="p-8 flex flex-col justify-center">
                <div class="flex items-center gap-4 text-sm text-cafe-mocha mb-3">
                  <span class="bg-cafe-caramel text-white font-medium px-3 py-1 rounded-full">${posts[0].category}</span>
                  <span><i class="fas fa-clock mr-1"></i>${posts[0].readTime}</span>
                  <span><i class="fas fa-calendar mr-1"></i>${posts[0].date}</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-bold text-cafe-darkBrown mb-3">${posts[0].title}</h2>
                <p class="text-cafe-mocha mb-4 line-clamp-3">${posts[0].excerpt}</p>
                <div class="flex items-center">
                  <div class="w-10 h-10 gradient-cafe rounded-full flex items-center justify-center mr-3">
                    <i class="fas fa-user text-white text-sm"></i>
                  </div>
                  <span class="text-cafe-darkBrown font-medium">${posts[0].author}</span>
                </div>
              </div>
            </div>
          </a>
        ` : ''}

        <!-- Category Filter -->
        <div class="flex flex-wrap items-center gap-4 mb-8">
          <span class="text-cafe-mocha font-medium">カテゴリ:</span>
          <button class="category-btn active bg-cafe-caramel text-white px-4 py-2 rounded-full text-sm font-medium transition-all" data-category="all">
            すべて
          </button>
          ${[...new Set(posts.map(p => p.category))].map(cat => `
            <button class="category-btn bg-cafe-cream text-cafe-brown px-4 py-2 rounded-full text-sm font-medium hover:bg-cafe-caramel hover:text-white transition-all" data-category="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <!-- Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="blog-grid">
          ${posts.slice(1).map(post => `
            <a href="/blog/${post.id}" class="card-hover bg-white rounded-2xl overflow-hidden shadow-md block blog-card" data-category="${post.category}">
              <div class="aspect-video bg-cafe-latte overflow-hidden">
                <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover">
              </div>
              <div class="p-6">
                <div class="flex items-center gap-3 text-sm text-cafe-mocha mb-2">
                  <span class="bg-cafe-cream text-cafe-brown font-medium px-2 py-1 rounded">${post.category}</span>
                  <span><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
                </div>
                <h3 class="text-lg font-bold text-cafe-darkBrown mb-2 line-clamp-2">${post.title}</h3>
                <p class="text-cafe-mocha text-sm line-clamp-2 mb-4">${post.excerpt}</p>
                <div class="flex items-center justify-between text-sm">
                  <div class="flex items-center text-cafe-mocha">
                    <div class="w-6 h-6 gradient-cafe rounded-full flex items-center justify-center mr-2">
                      <i class="fas fa-user text-white text-xs"></i>
                    </div>
                    ${post.author}
                  </div>
                  <span class="text-cafe-mocha">${post.date}</span>
                </div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="py-12 bg-cafe-latte">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="bg-white rounded-2xl p-8 shadow-md">
          <div class="w-16 h-16 gradient-cafe rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-envelope text-white text-2xl"></i>
          </div>
          <h2 class="text-2xl font-bold text-cafe-darkBrown mb-2">最新情報をお届け</h2>
          <p class="text-cafe-mocha mb-6">メールマガジンに登録して、AI学習の最新情報を受け取りましょう</p>
          <form class="flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="メールアドレス" class="flex-1 p-3 border-2 border-cafe-cream rounded-xl focus:border-cafe-caramel focus:outline-none">
            <button type="submit" class="btn-cafe gradient-cafe text-white px-6 py-3 rounded-xl font-medium">
              登録する
            </button>
          </form>
        </div>
      </div>
    </section>

    <script>
      // Category filter
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          // Update active state
          document.querySelectorAll('.category-btn').forEach(b => {
            b.classList.remove('active', 'bg-cafe-caramel', 'text-white');
            b.classList.add('bg-cafe-cream', 'text-cafe-brown');
          });
          this.classList.remove('bg-cafe-cream', 'text-cafe-brown');
          this.classList.add('active', 'bg-cafe-caramel', 'text-white');
          
          // Filter posts
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
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      <div class="absolute bottom-0 left-0 right-0">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div class="flex items-center gap-3 mb-3">
            <span class="bg-cafe-caramel text-white text-sm font-medium px-3 py-1 rounded-full">${post.category}</span>
            <span class="text-cafe-cream text-sm"><i class="fas fa-clock mr-1"></i>${post.readTime}</span>
          </div>
          <h1 class="font-display text-3xl md:text-4xl font-bold text-white leading-tight">${post.title}</h1>
        </div>
      </div>
    </section>

    <!-- Article Content -->
    <section class="py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl shadow-md overflow-hidden">
          <!-- Author Info -->
          <div class="p-6 border-b border-cafe-cream flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-12 h-12 gradient-cafe rounded-full flex items-center justify-center mr-4">
                <i class="fas fa-user text-white"></i>
              </div>
              <div>
                <p class="font-bold text-cafe-darkBrown">${post.author}</p>
                <p class="text-cafe-mocha text-sm">${post.date}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="p-2 text-cafe-mocha hover:text-cafe-caramel transition-colors" title="シェア">
                <i class="fab fa-twitter text-xl"></i>
              </button>
              <button class="p-2 text-cafe-mocha hover:text-cafe-caramel transition-colors" title="シェア">
                <i class="fab fa-facebook text-xl"></i>
              </button>
              <button class="p-2 text-cafe-mocha hover:text-cafe-caramel transition-colors" title="コピー">
                <i class="fas fa-link text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Article Body -->
          <article class="p-8 prose prose-lg max-w-none">
            <style>
              .prose h2 {
                color: #5D3A1A;
                font-weight: 700;
                margin-top: 2rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 2px solid #F5E6D3;
              }
              .prose p {
                color: #6B4423;
                line-height: 1.8;
                margin-bottom: 1.5rem;
              }
              .prose ul, .prose ol {
                color: #6B4423;
                margin-bottom: 1.5rem;
              }
              .prose li {
                margin-bottom: 0.5rem;
              }
              .prose strong {
                color: #5D3A1A;
              }
            </style>
            ${post.content}
          </article>

          <!-- Tags -->
          <div class="p-6 border-t border-cafe-cream">
            <div class="flex flex-wrap gap-2">
              <span class="bg-cafe-cream text-cafe-brown px-3 py-1 rounded-full text-sm">#AI</span>
              <span class="bg-cafe-cream text-cafe-brown px-3 py-1 rounded-full text-sm">#${post.category}</span>
              <span class="bg-cafe-cream text-cafe-brown px-3 py-1 rounded-full text-sm">#学習</span>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center mt-8">
          <a href="/blog" class="inline-flex items-center text-cafe-caramel hover:text-cafe-brown font-medium">
            <i class="fas fa-arrow-left mr-2"></i>ブログ一覧に戻る
          </a>
        </div>
      </div>
    </section>

    <!-- Related CTA -->
    <section class="py-12 bg-cafe-latte">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-2xl font-bold text-cafe-darkBrown mb-4">
          もっと深く学びたいですか？
        </h2>
        <p class="text-cafe-mocha mb-6">
          mirAIcafeの講座で、実践的なAIスキルを身につけましょう
        </p>
        <a href="/courses" class="btn-cafe inline-flex items-center justify-center gradient-cafe text-white px-8 py-4 rounded-full font-bold shadow-lg">
          <i class="fas fa-book-open mr-2"></i>講座を見る
        </a>
      </div>
    </section>
  `

  return renderLayout(post.title, content, 'blog')
}
