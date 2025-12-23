/**
 * AI News Image Fetcher
 * ハイブリッド方式で画像を取得:
 * 1. OGP画像（記事の公式サムネイル）
 * 2. Unsplash API（キーワード検索）
 * 3. カテゴリ別グラデーション画像（フォールバック）
 */

/**
 * OGP画像を取得
 */
export async function fetchOGPImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`[OGP] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();

    // og:image を抽出（複数パターン対応）
    const patterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
      /<meta[^>]*property=["']og:image:url["'][^>]*content=["']([^"']+)["']/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        let imageUrl = match[1];
        
        // 相対URLを絶対URLに変換
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          const urlObj = new URL(url);
          imageUrl = urlObj.origin + imageUrl;
        }
        
        // 画像URLの基本的な検証
        if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)/i) || 
            imageUrl.includes('image') || 
            imageUrl.includes('img') ||
            imageUrl.includes('photo')) {
          return imageUrl;
        }
        
        // 拡張子がなくても返す（CDN画像など）
        return imageUrl;
      }
    }

    return null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`[OGP] タイムアウト: ${url}`);
    } else {
      console.error(`[OGP] エラー (${url}):`, error.message);
    }
    return null;
  }
}

/**
 * Unsplash画像を検索
 */
export async function fetchUnsplashImage(
  keyword: string,
  apiKey: string
): Promise<string | null> {
  try {
    // キーワードを英語に変換（よく使われるAI関連用語）
    const keywordMap: Record<string, string> = {
      'ChatGPT': 'artificial intelligence chat',
      'GPT': 'artificial intelligence',
      'Gemini': 'google ai technology',
      'Claude': 'ai assistant technology',
      'AI': 'artificial intelligence',
      'OpenAI': 'ai technology innovation',
      'Google': 'google technology',
      'Microsoft': 'microsoft technology',
      'Apple': 'apple technology',
      'Meta': 'meta technology',
      '生成AI': 'generative ai art',
      '機械学習': 'machine learning',
      'ツール': 'digital tools',
      '機能': 'technology feature',
      '更新': 'software update',
      'アップデート': 'software update',
      '発表': 'announcement presentation',
      'リリース': 'product launch',
      'ロボット': 'robot technology',
      '自動化': 'automation technology',
      'プログラミング': 'programming code',
      'データ': 'data analytics',
    };

    let searchQuery = 'artificial intelligence technology'; // デフォルト

    // キーワードマッチング
    for (const [key, value] of Object.entries(keywordMap)) {
      if (keyword.toLowerCase().includes(key.toLowerCase())) {
        searchQuery = value;
        break;
      }
    }

    const encoded = encodeURIComponent(searchQuery);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encoded}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      console.log(`[Unsplash] API エラー: ${response.status}`);
      return null;
    }

    const data = await response.json() as any;

    if (data.results && data.results.length > 0) {
      // regular サイズ（1080px幅）を使用
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('[Unsplash] エラー:', error);
    return null;
  }
}

/**
 * カテゴリ別グラデーション画像を生成（SVG Data URL）
 */
export function generateGradientImage(category: string): string {
  const gradients: Record<string, { color1: string; color2: string; icon: string }> = {
    official_announcement: {
      color1: '#e74c3c',
      color2: '#c0392b',
      icon: '📢',
    },
    tool_update: {
      color1: '#3498db',
      color2: '#2980b9',
      icon: '🔄',
    },
    how_to: {
      color1: '#27ae60',
      color2: '#229954',
      icon: '📚',
    },
    research: {
      color1: '#9b59b6',
      color2: '#8e44ad',
      icon: '🔬',
    },
    business: {
      color1: '#f39c12',
      color2: '#d68910',
      icon: '💼',
    },
    other: {
      color1: '#667eea',
      color2: '#764ba2',
      icon: '🤖',
    },
  };

  const config = gradients[category] || gradients.other;

  // SVG生成
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${config.color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${config.color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="400" fill="url(#grad)"/>
    <text x="400" y="220" font-size="100" text-anchor="middle" fill="white" opacity="0.9">${config.icon}</text>
    <text x="400" y="300" font-size="24" text-anchor="middle" fill="white" opacity="0.7" font-family="Arial, sans-serif">AI NEWS</text>
  </svg>`;

  // Base64エンコード（ブラウザ互換性のため）
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

// カテゴリ型をエクスポート
export type NewsCategory = 'official_announcement' | 'tool_update' | 'how_to' | 'research' | 'business' | 'other';

// 画像ソース型
export type ImageSource = 'ogp' | 'unsplash' | 'gradient';

/**
 * ハイブリッド画像取得（メイン関数）
 */
export async function fetchNewsImage(
  url: string,
  title: string,
  category: NewsCategory | string = 'other',
  unsplashKey?: string
): Promise<{ imageUrl: string; imageSource: ImageSource }> {
  const titlePreview = title.length > 30 ? title.substring(0, 30) + '...' : title;
  console.log(`[画像取得] ${titlePreview}`);

  // 1. OGP画像を試す
  const ogpImage = await fetchOGPImage(url);
  if (ogpImage) {
    console.log(`  ✓ OGP: ${ogpImage.substring(0, 60)}...`);
    return { imageUrl: ogpImage, imageSource: 'ogp' };
  }

  // 2. Unsplashを試す
  if (unsplashKey) {
    // タイトルから最初の意味のある単語を抽出
    const keyword = extractKeyword(title);
    console.log(`  → Unsplash検索: "${keyword}"`);
    
    const unsplashImage = await fetchUnsplashImage(keyword, unsplashKey);
    if (unsplashImage) {
      console.log(`  ✓ Unsplash: ${unsplashImage.substring(0, 60)}...`);
      return { imageUrl: unsplashImage, imageSource: 'unsplash' };
    }
  }

  // 3. グラデーション画像にフォールバック
  const gradientImage = generateGradientImage(category);
  console.log(`  ✓ Gradient: カテゴリ=${category}`);
  return { imageUrl: gradientImage, imageSource: 'gradient' };
}

/**
 * タイトルからキーワードを抽出
 */
function extractKeyword(title: string): string {
  // AI関連の重要キーワードを優先
  const priorityKeywords = [
    'ChatGPT', 'GPT-4', 'GPT-5', 'Gemini', 'Claude', 'OpenAI', 
    'Google', 'Microsoft', 'Apple', 'Meta', 'Anthropic',
    '生成AI', 'AI', 'LLM', '機械学習', 'ディープラーニング',
  ];

  for (const kw of priorityKeywords) {
    if (title.includes(kw)) {
      return kw;
    }
  }

  // 最初の意味のある単語を抽出
  const words = title.split(/[\s、。「」『』【】\[\]（）()：:・]/);
  for (const word of words) {
    if (word.length >= 2 && !['の', 'は', 'が', 'を', 'に', 'で', 'と', 'や'].includes(word)) {
      return word;
    }
  }

  return 'AI';
}
