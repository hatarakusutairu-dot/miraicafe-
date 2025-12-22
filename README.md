# mirAIcafe - AI学習サイト

## Project Overview
- **Name**: mirAIcafe
- **Goal**: 個人向けAIオンライン研修の予約と決済ができる学習プラットフォーム
- **Features**: 講座一覧・詳細、予約システム（カレンダー）、Stripe決済、ブログ、お問い合わせ

## URLs
- **Preview**: https://3000-iwbcof3j1z0l4fktflyjb-2b54fc91.sandbox.novita.ai
- **Production**: (Cloudflare Pagesにデプロイ後)

## 機能一覧

### ✅ 実装済み機能

#### 1. トップページ (`/`)
- ヒーローセクション（CTA付き）
- 特徴紹介（少人数制、完全オンライン、修了証明）
- 人気講座プレビュー（3件）
- 利用の流れ（3ステップ）
- 最新ブログ記事プレビュー
- CTAセクション

#### 2. 講座一覧 (`/courses`)
- 全講座の一覧表示
- レベル別フィルタリング（初級/中級）
- カード形式での講座表示
- 講座詳細への遷移

#### 3. 講座詳細 (`/courses/:id`)
- 講座の詳細情報表示
- 学習内容一覧
- 講師紹介
- 予約ボタン
- 価格表示

#### 4. 予約システム (`/reservation`)
- 講座選択ドロップダウン
- カレンダーによる日程確認
- 利用可能な日程の一覧表示
- 残席数表示
- 顧客情報入力フォーム
- 予約サマリー表示

#### 5. Stripe決済
- 予約情報の作成API (`POST /api/reservations`)
- チェックアウトセッション作成API (`POST /api/create-checkout-session`)
- 決済モーダル
- 成功画面表示
- ※本番環境ではStripe APIキーの設定が必要

#### 6. ブログ (`/blog`)
- 記事一覧表示
- フィーチャー記事表示
- カテゴリフィルター
- メールマガジン登録フォーム

#### 7. ブログ詳細 (`/blog/:id`)
- 記事全文表示
- 著者情報
- SNSシェアボタン
- 関連CTAセクション

#### 8. お問い合わせ (`/contact`)
- 問い合わせフォーム
- よくある質問（FAQ）
- 問い合わせ種別選択
- 送信完了メッセージ

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | 講座一覧取得 |
| GET | `/api/schedules` | スケジュール取得（?course=idでフィルタ可） |
| POST | `/api/reservations` | 予約作成 |
| POST | `/api/create-checkout-session` | Stripe決済セッション作成 |
| POST | `/api/contact` | お問い合わせ送信 |
| GET | `/api/blog` | ブログ記事一覧取得 |

## Data Models

### Course（講座）
```typescript
{
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
```

### Schedule（スケジュール）
```typescript
{
  id: string
  courseId: string
  date: string
  startTime: string
  endTime: string
  capacity: number
  enrolled: number
  location: string
}
```

### BlogPost（ブログ記事）
```typescript
{
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  date: string
  category: string
  image: string
  readTime: string
}
```

## Tech Stack
- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Build**: Vite
- **CSS**: Tailwind CSS (CDN)
- **Icons**: Font Awesome (CDN)
- **Payment**: Stripe (API連携)

## デザインコンセプト
- **カラーパレット**: 温かみのあるカフェをイメージした茶系カラー
  - Cream: #FDF6E3
  - Latte: #F5E6D3
  - Brown: #8B4513
  - Dark Brown: #5D3A1A
  - Caramel: #C68E17
  - Mocha: #6B4423
  - Espresso: #3C2415
- **フォント**: Noto Sans JP（本文）、Georgia（見出し）
- **背景パターン**: コーヒーカップをイメージしたSVGパターン

## Development

```bash
# 依存関係インストール
npm install

# ビルド
npm run build

# 開発サーバー起動（PM2使用）
pm2 start ecosystem.config.cjs

# ログ確認
pm2 logs --nostream
```

## Deployment

```bash
# Cloudflare Pagesにデプロイ
npm run deploy:prod
```

## 今後の実装予定
- [ ] Stripe本番APIキー設定
- [ ] D1データベース連携（講座・予約データの永続化）
- [ ] ユーザー認証機能
- [ ] マイページ（予約履歴）
- [ ] メール通知機能
- [ ] 決済完了後のZoomリンク自動送信

## License
MIT
