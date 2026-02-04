# mirAIcafe - AI学習サイト

## Project Overview
- **Name**: mirAIcafe
- **Goal**: 個人向けAIオンライン研修の予約と決済ができる学習プラットフォーム
- **Features**: 講座一覧・詳細、予約システム（カレンダー）、Stripe決済、ブログ、お問い合わせ、アンケート、管理画面

## URLs
- **Preview**: https://3000-iwbcof3j1z0l4fktflyjb-2b54fc91.sandbox.novita.ai
- **Production**: https://miraicafe.work（Cloudflare Pagesデプロイ済み）
- **ドメイン管理**: ムームードメイン

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
- Webhook連携（`checkout.session.completed`イベント）
- 決済完了時の自動ステータス更新（bookings.payment_status）
- 成功画面表示

#### 6. アンケートシステム (`/survey`)
- **プロフィール質問**（年齢・職業・業種のドロップダウン形式）
  - 年齢: 20代前半/20代後半/30代/40代/50代/60代以上
  - 職業: 会社員/経営者・役員/公務員/教育関係/フリーランス/学生/主婦・主夫/その他
  - 業種: IT・通信/製造業/金融・保険/不動産/小売・卸売/サービス業/医療・福祉/教育/官公庁/その他
- **評価質問**（5段階星評価）
- **選択式質問**（単一選択/複数選択）
- **自由記述質問**
- 3D立体感のあるカスタムUI
- カスタムドロップダウン（z-index対応済み）

#### 7. 管理画面 (`/admin/*`)

##### 7.1 ダッシュボード (`/admin/dashboard`)
- 統計カード（予約数、売上、お問い合わせ数）
- 最新の予約・お問い合わせ一覧

##### 7.2 予約管理 (`/admin/bookings`)
- 予約一覧（ステータスフィルタ付き）
- 予約詳細・編集
- 支払いステータス管理（未払い/支払済/返金済）
- **日時表示のJST（日本標準時）対応**

##### 7.3 アンケート分析 (`/admin/surveys`)
- 回答統計（総回答数、平均評価、NPS）
- プレビュー機能（実際のアンケートと同じ表示）
- **質問編集機能** (`/admin/surveys/questions`)
  - ドラッグ&ドロップによる並べ替え
  - インライン編集（質問文のクリック編集）
  - 動的な質問追加/削除
  - カテゴリ別グルーピング
  - 必須/任意の切り替え
  - 有効/無効の切り替え
  - 口コミ用フラグ管理
  - 選択肢の編集モーダル
  - 対応タイプ: rating/text/single_choice/multiple_choice/dropdown

##### 7.4 AIニュース管理 (`/admin/ai-news`)
- ニュース収集（自動）
- 承認/却下ワークフロー
- **リアルタイムカウント更新**（ステータス変更時）
- カテゴリ別フィルタ

##### 7.5 その他管理機能
- 講座管理 (`/admin/courses`)
- スケジュール管理 (`/admin/schedules`)
- ブログ管理 (`/admin/blog`)
- お問い合わせ管理 (`/admin/contacts`)
- コメント管理 (`/admin/comments`)
- ポートフォリオ管理 (`/admin/portfolios`)
- 決済管理 (`/admin/payments`)
- サイト設定 (`/admin/settings`)

#### 8. ブログ (`/blog`)
- 記事一覧表示
- フィーチャー記事表示
- カテゴリフィルター
- メールマガジン登録フォーム

#### 9. ブログ詳細 (`/blog/:id`)
- 記事全文表示
- 著者情報
- SNSシェアボタン
- 関連CTAセクション

#### 10. お問い合わせ (`/contact`)
- 問い合わせフォーム
- よくある質問（FAQ）
- 問い合わせ種別選択
- 送信完了メッセージ

## API Endpoints

### 公開API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/courses` | 講座一覧取得 |
| GET | `/api/schedules` | スケジュール取得 |
| POST | `/api/reservations` | 予約作成 |
| POST | `/api/create-checkout-session` | Stripe決済セッション作成 |
| POST | `/api/stripe/webhook` | Stripe Webhook受信 |
| POST | `/api/contact` | お問い合わせ送信 |
| GET | `/api/blog` | ブログ記事一覧取得 |

### 管理API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/api/surveys/questions/:id` | アンケート質問取得 |
| POST | `/admin/api/surveys/questions` | アンケート質問作成 |
| PUT | `/admin/api/surveys/questions/:id` | アンケート質問更新 |
| DELETE | `/admin/api/surveys/questions/:id` | アンケート質問削除 |
| POST | `/admin/api/surveys/questions/:id/toggle` | アンケート質問有効/無効切替 |
| PATCH | `/admin/api/ai-news/:id` | AIニュースステータス更新 |
| DELETE | `/admin/api/ai-news/:id` | AIニュース削除 |

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
  online_url?: string
  meeting_type?: string
}
```

### Booking（予約）
```typescript
{
  id: number
  course_id: string
  course_name: string | null
  customer_name: string
  customer_email: string
  customer_phone: string | null
  preferred_date: string | null
  preferred_time: string | null
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  amount: number
  admin_note: string | null
  created_at: string  // JST表示対応
  updated_at: string
}
```

### SurveyQuestion（アンケート質問）
```typescript
{
  id: number
  question_type: 'rating' | 'text' | 'single_choice' | 'multiple_choice' | 'dropdown'
  question_text: string
  question_category: string
  options: string | null  // JSON配列
  is_required: number  // 0 or 1
  sort_order: number
  is_active: number  // 0 or 1
  use_for_review: number  // 0 or 1（口コミ用フラグ）
}
```

## Tech Stack
- **Framework**: Hono
- **Runtime**: Cloudflare Workers
- **Build**: Vite
- **CSS**: Tailwind CSS (CDN)
- **Icons**: Font Awesome (CDN)
- **Payment**: Stripe
- **Database**: Cloudflare D1 (SQLite)
- **Object Storage**: Cloudflare R2

## Stripe Webhook設定

### 必要なイベント
- `checkout.session.completed` - 決済完了時の予約ステータス更新

### 設定手順
1. Stripeダッシュボード > 開発者 > Webhook
2. エンドポイントを追加
   - **サンドボックス**: `https://3000-iwbcof3j1z0l4fktflyjb-2b54fc91.sandbox.novita.ai/api/stripe/webhook`
   - **本番**: `https://miraicafe.work/api/stripe/webhook`
3. 署名シークレット（`whsec_...`）を`.dev.vars`の`STRIPE_WEBHOOK_SECRET`に設定

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

# D1マイグレーション適用（ローカル）
npm run db:migrate:local
```

## Deployment

```bash
# Cloudflare Pagesにデプロイ
npm run deploy:prod

# D1マイグレーション適用（本番）
npm run db:migrate:prod
```

## バージョン情報

| バージョン | タグ | 日付 | 説明 |
|------------|------|------|------|
| v1.0.0 | `v1.0.0-stable` | 2026-02-04 | 会員システム追加前の安定版 |

### ロールバック手順

問題が発生した場合、以下の方法で安定版に戻せます：

**方法1: Gitタグから復元**
```bash
git checkout v1.0.0-stable
npm run build
npm run deploy:prod
```

**方法2: バックアップから復元**
- バックアップURL: https://www.genspark.ai/api/files/s/OsIYlzGD
- ダウンロードして展開後、デプロイ

## 最近の更新履歴

### 2026-02-04
- **アンケート公開機能修正**: LIKE検索パターンのSQLiteエラー対策
- **アンケート質問整理**: 重複質問の削除、21問に最適化
- **SEO生成機能改善**: Gemini 2.5思考機能無効化、HTMLタグ除去
- **AIニュース収集**: Geminiモデル名を最新版に更新
- **ホームページ**: 講座カードのタイトル・説明文を切り詰め

### 2026-01-02
- **日時表示のJST対応**: 予約管理・決済履歴等の全日時表示をAsia/TokyoタイムゾーンでJST表示
- **Stripe Webhook修正**: 
  - `constructEventAsync`（非同期版）への変更でCloudflare Workers対応
  - `customer_email`カラム名の修正
  - `bookings.payment_status`の自動更新
- **AIニュース管理改善**: ステータス変更時のリアルタイムカウント更新
- **アンケートドロップダウン修正**: z-index対応で選択肢が正しく表示
- **プロフィール質問追加**: 年齢・職業・業種のドロップダウン質問をマイグレーションで追加

## 会員・ポイント・割引システム（NEW 2026-02-04）

### 会員システム
- 予約・決済時にメールアドレスで自動登録
- 新規会員に100ポイントのウェルカムボーナス
- 会員ランク制度（一般→シルバー→ゴールド→プラチナ）

### ポイントシステム
- 1予約ごと 100pt + 支払金額の1%
- 5回受講達成で +500pt ボーナス
- 10回受講達成で +1,000pt ボーナス

### コースセット（バンドル）割引
- 複数コースを組み合わせたセット販売機能
- 例：基礎コース + キャリコンコース = 8回セット ¥39,600（25%OFF）
- 管理画面: `/admin/bundles` でセット商品を作成・管理
- 動的割引ルール：2コース25%OFF、3コース以上30%OFF

### 紹介プログラム
- 各会員に紹介コード発行（例: MC○○○○○○）
- 紹介者: 被紹介者の初回予約完了時に500pt
- 被紹介者: 初回予約時に500円割引

### クーポン機能
- パーセント割引/固定金額割引
- 有効期限・最低利用金額設定
- 管理画面: `/admin/members/coupons` でクーポン作成

### 割引API
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/validate-referral` | 紹介コード検証 |
| POST | `/api/validate-coupon` | クーポンコード検証 |
| POST | `/api/calculate-final-price` | 最終価格計算（全割引適用） |
| GET | `/api/bundles` | セット商品一覧取得 |
| POST | `/api/calculate-bundle-discount` | セット割引計算 |

### 管理画面
| Path | Description |
|------|-------------|
| `/admin/members` | 会員一覧・詳細 |
| `/admin/members/coupons` | クーポン管理 |
| `/admin/members/settings` | 特典設定（ポイント倍率など） |
| `/admin/bundles` | コースセット管理 |

## 今後の実装予定
- [x] 会員・ポイントシステム ✅ 完了
- [x] 紹介プログラム ✅ 完了
- [x] コースセット割引 ✅ 完了
- [ ] 予約フォームへの紹介コード入力欄追加（フロントエンド）
- [ ] ポイント/クーポン利用のUI（決済フロー）
- [ ] 会員マイページ（ポイント残高確認、紹介コード表示）
- [ ] 決済完了後のZoomリンク自動送信
- [ ] メール通知機能の強化

## License
MIT
