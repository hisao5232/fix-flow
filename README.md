# FixFlow - 出張修理予約管理アプリ

修理エンジニアの現場目線で開発した、社内向けの出張修理予約管理システムです。

## 概要
事務スタッフや顧客からの修理依頼をWebフォームで受け付け、エンジニアがリアルタイムで現場状況や予定を確認できるツールです。

## 技術スタック
- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend/DB**: Supabase (PostgreSQL)
- **Language**: TypeScript

## 主な機能
- [x] 予約依頼フォーム（いつ・どこで・何が壊れたか）
- [x] 予約一覧ダッシュボード（管理者・エンジニア向け）
- [ ] ステータス更新機能（対応中・完了） ※実装予定
- [ ] 写真アップロード機能（故障箇所の共有） ※実装予定

## 開発環境のセットアップ

1. リポジトリをクローン
2. 依存関係のインストール: `npm install`
3. 環境変数の設定: `.env.local` を作成し、Supabaseの情報を入力
4. 開発サーバーの起動: npm run dev

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```


## 作者
hisao5232
