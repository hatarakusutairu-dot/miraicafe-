/**
 * AI News Image Fetcher - Hybrid Strategy
 * Priority: OGP Image → Unsplash API → Category Gradient
 */

export type NewsCategory = 'official_announcement' | 'tool_update' | 'how_to' | 'other';

export interface ImageFetchResult {
  imageUrl: string;
  imageSource: 'ogp' | 'unsplash' | 'gradient';
}

/**
 * Fetch OGP image from URL
 */
export async function fetchOGPImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'mirAIcafe/1.0 OGP Fetcher',
        'Accept': 'text/html',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`[OGP] HTTP ${response.status} for ${url}`);
      return null;
    }

    const html = await response.text();
    
    // Try og:image first
    let match = html.match(/<meta\s+(?:[^>]*?\s)?property=["']og:image["'][^>]*?\s+content=["']([^"']+)["']/i);
    if (!match) {
      match = html.match(/<meta\s+(?:[^>]*?\s)?content=["']([^"']+)["'][^>]*?\s+property=["']og:image["']/i);
    }
    
    // Try twitter:image as fallback
    if (!match) {
      match = html.match(/<meta\s+(?:[^>]*?\s)?name=["']twitter:image["'][^>]*?\s+content=["']([^"']+)["']/i);
    }
    if (!match) {
      match = html.match(/<meta\s+(?:[^>]*?\s)?content=["']([^"']+)["'][^>]*?\s+name=["']twitter:image["']/i);
    }

    if (match && match[1]) {
      let imageUrl = match[1];
      
      // Handle relative URLs
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = urlObj.origin + imageUrl;
      }
      
      // Validate URL
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log(`[OGP] Found image: ${imageUrl.substring(0, 80)}...`);
        return imageUrl;
      }
    }

    console.log(`[OGP] No image found for ${url}`);
    return null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log(`[OGP] Timeout for ${url}`);
    } else {
      console.log(`[OGP] Error for ${url}: ${error.message || error}`);
    }
    return null;
  }
}

/**
 * Fetch image from Unsplash API
 */
export async function fetchUnsplashImage(
  keyword: string,
  apiKey: string
): Promise<string | null> {
  if (!apiKey) {
    console.log('[Unsplash] API key not configured');
    return null;
  }

  try {
    // Create search query combining keyword with AI/tech context
    const searchQuery = encodeURIComponent(`${keyword} technology AI`.substring(0, 100));
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${apiKey}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.log('[Unsplash] Invalid API key');
      } else if (response.status === 403) {
        console.log('[Unsplash] Rate limit exceeded');
      } else {
        console.log(`[Unsplash] HTTP ${response.status}`);
      }
      return null;
    }

    const data = await response.json() as any;
    
    if (data.results && data.results.length > 0) {
      // Use regular size for performance
      const imageUrl = data.results[0].urls?.regular || data.results[0].urls?.small;
      if (imageUrl) {
        console.log(`[Unsplash] Found image for "${keyword}": ${imageUrl.substring(0, 60)}...`);
        return imageUrl;
      }
    }

    console.log(`[Unsplash] No results for "${keyword}"`);
    return null;
  } catch (error: any) {
    console.log(`[Unsplash] Error: ${error.message || error}`);
    return null;
  }
}

/**
 * Generate SVG gradient image as fallback
 */
export function generateGradientImage(category: NewsCategory): string {
  const gradients: Record<NewsCategory, { colors: string[]; icon: string; label: string }> = {
    official_announcement: {
      colors: ['#2563EB', '#7C3AED'], // Blue to Purple
      icon: '📢',
      label: '公式発表',
    },
    tool_update: {
      colors: ['#059669', '#10B981'], // Green shades
      icon: '🔧',
      label: 'ツール更新',
    },
    how_to: {
      colors: ['#F59E0B', '#EF4444'], // Orange to Red
      icon: '📚',
      label: '使い方',
    },
    other: {
      colors: ['#6B7280', '#9CA3AF'], // Gray shades
      icon: '📰',
      label: 'その他',
    },
  };

  const config = gradients[category] || gradients.other;
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.colors[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${config.colors[1]};stop-opacity:1" />
    </linearGradient>
    <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)" />
    </pattern>
  </defs>
  <rect width="400" height="225" fill="url(#grad)" />
  <rect width="400" height="225" fill="url(#dots)" />
  <text x="200" y="90" text-anchor="middle" font-size="48">${config.icon}</text>
  <text x="200" y="140" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="600" fill="white">${config.label}</text>
  <text x="200" y="165" text-anchor="middle" font-family="sans-serif" font-size="12" fill="rgba(255,255,255,0.8)">mirAIcafe AI News</text>
</svg>`.trim();

  // Convert to data URL
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Main function: Fetch news image using hybrid strategy
 * Priority: OGP → Unsplash → Gradient
 */
export async function fetchNewsImage(
  url: string,
  title: string,
  category: NewsCategory,
  unsplashKey?: string
): Promise<ImageFetchResult> {
  // 1. Try OGP image first
  const ogpImage = await fetchOGPImage(url);
  if (ogpImage) {
    return {
      imageUrl: ogpImage,
      imageSource: 'ogp',
    };
  }

  // 2. Try Unsplash API
  if (unsplashKey) {
    // Extract keywords from title for search
    const keywords = extractKeywords(title);
    const unsplashImage = await fetchUnsplashImage(keywords, unsplashKey);
    if (unsplashImage) {
      return {
        imageUrl: unsplashImage,
        imageSource: 'unsplash',
      };
    }
  }

  // 3. Fallback to gradient image
  return {
    imageUrl: generateGradientImage(category),
    imageSource: 'gradient',
  };
}

/**
 * Extract meaningful keywords from title for Unsplash search
 */
function extractKeywords(title: string): string {
  // Common AI-related keywords to look for
  const aiKeywords = [
    'ChatGPT', 'GPT', 'Claude', 'Gemini', 'AI', 'OpenAI', 'Google', 'Microsoft',
    'Anthropic', 'LLM', 'Copilot', '機械学習', '深層学習', 'ニューラル', 
    'プロンプト', 'チャットボット', '自動化', '生成AI', 'Gen AI'
  ];

  // Try to find AI-related keywords in title
  for (const keyword of aiKeywords) {
    if (title.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword;
    }
  }

  // Fallback: extract first meaningful words
  const words = title
    .replace(/[【】「」『』（）\[\]]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !/^\d+$/.test(w))
    .slice(0, 3);

  return words.join(' ') || 'AI technology';
}
