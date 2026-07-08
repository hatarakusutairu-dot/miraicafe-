// Claude (Anthropic) API 連携サービス
// Cloudflare Workers から生HTTPで呼び出す（SDK不要）

export interface ClaudeEnv {
  ANTHROPIC_API_KEY?: string
}

export interface ClaudeOptions {
  model?: string
  maxTokens?: number
  system?: string
}

// 用途別に使い分けるモデルID（コスト/品質のバランスで選択）
// - haiku : 安く速い。要約・分類・短い定型出力（AIニュース収集・メタ生成など）
// - sonnet: 品質とコストの最適点。対話・メール返信・SEO提案など
// - opus  : 最高品質。ブログ記事・講座生成など長尺で品質が効くもの
export const CLAUDE_MODELS = {
  haiku: 'claude-haiku-4-5',
  sonnet: 'claude-sonnet-5',
  opus: 'claude-opus-4-8',
} as const

const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages'

/**
 * Claude Messages API を呼び出してテキストを生成する。
 * 429/5xx は指数バックオフで最大3回リトライする。
 */
export async function generateWithClaude(
  env: ClaudeEnv,
  prompt: string,
  options: ClaudeOptions = {}
): Promise<string> {
  const apiKey = env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const model = options.model || CLAUDE_MODELS.sonnet
  const maxTokens = options.maxTokens ?? 4096

  const body: Record<string, any> = {
    model,
    max_tokens: maxTokens,
    // 注意: Opus 4.8 / Sonnet 5 では temperature は指定不可（400になる）ため送らない
    messages: [{ role: 'user', content: prompt }],
  }
  if (options.system) {
    body.system = options.system
  }

  let lastError: Error | null = null
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(ANTHROPIC_ENDPOINT, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = (await response.json()) as {
          content?: Array<{ type: string; text?: string }>
          stop_reason?: string
        }
        const text = (data.content || [])
          .filter((b) => b.type === 'text' && typeof b.text === 'string')
          .map((b) => b.text as string)
          .join('')
        return text
      }

      // リトライ可能なステータスならバックオフして再試行
      if ([429, 500, 502, 503, 529].includes(response.status) && attempt < 2) {
        const wait = 1000 * Math.pow(2, attempt)
        console.log(`[Claude] ${model}: HTTP ${response.status}, retrying in ${wait}ms`)
        await new Promise((r) => setTimeout(r, wait))
        continue
      }

      const errText = await response.text().catch(() => '')
      throw new Error(`Claude API error ${response.status}: ${errText.slice(0, 500)}`)
    } catch (e: any) {
      lastError = e as Error
      // ネットワークエラー等はリトライ
      if (attempt < 2) {
        const wait = 1000 * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
    }
  }

  throw lastError || new Error('Claude API request failed')
}

/**
 * Claude の応答テキストから JSON オブジェクトを1つ抽出してパースする。
 * 制御文字の除去と文字列内改行のエスケープを試みる。失敗時は null。
 */
export function extractJson<T = any>(text: string): T | null {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0]) as T
  } catch {
    // クリーンアップして再試行
    const clean = match[0]
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/("(?:[^"\\]|\\.)*")/g, (m) =>
        m.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      )
    try {
      return JSON.parse(clean) as T
    } catch {
      return null
    }
  }
}
