# AIインタビュー

AIの聞き手がテーマごとに一人ひとりの話をうかがい、集まった声を公開するサービスです。政党チームみらいがオープンソースで公開している「みらい議会」（AGPL-3.0）をもとに、議会向けの機能を除いてインタビュー専用に作り直したものです。**これは政党チームみらいが運営しているものではありません。**

- `web/` 市民向け画面（インタビュー一覧・紹介ページ・チャット・公開された会話・回答履歴）
- `admin/` 管理画面（インタビューの作成・AI設定と質問・回答の確認と公開）
- `supabase/migrations/` DB定義（baseline 1本）

<!-- 以下は fork 元のバッジ -->

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/team-mirai-volunteer/mirai-gikai)
[![codecov](https://codecov.io/gh/team-mirai/mirai-gikai/branch/develop/graph/badge.svg)](https://codecov.io/gh/team-mirai/mirai-gikai)

## セットアップ

```bash
# Supabaseの起動
npx supabase start

# 環境変数の設定（必要に応じて.envの内容を変更してください）
cp .env.example .env

# パッケージインストール
pnpm install

# SupabaseのDB初期化, 開発用シードデータのセットアップ
pnpm db:reset

# サーバー起動
pnpm dev
```

## マイグレーション

```bash
# マイグレーションファイル生成
npx supabase migration new マイグレーション名

# マイグレーション実行 & 型ファイル更新
pnpm db:migrate
```

## Adminユーザーの作成

1. Supabase Studio上で Authentication > Add User からユーザーを作成
2. Supabase Studio上で以下のSQLを実行

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"roles": ["admin"]}'::jsonb
WHERE email = '<1で作成したユーザーのemail>';
```

> [!NOTE]
> ローカル開発環境では、`pnpm seed`（`pnpm db:reset` からも実行されます）によって `email: admin@example.com, password: admin123456` のAdminユーザーが作成されます。
> このAdminユーザーは `SUPABASE_URL` が localhost を指している場合のみ作成され、ホスト環境（staging・preview ブランチ等）には作成されません。
> メールアドレス・パスワードを変えたい場合は `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` を設定してください。

## ライセンスと改変について

このリポジトリは、政党チームみらいが公開している [team-mirai/mirai-gikai](https://github.com/team-mirai/mirai-gikai)（AGPL-3.0）を改変したものです。改変後のコードも同じ [GNU Affero General Public License v3.0](./LICENSE) で公開しています。元のコードの著作権はそれぞれの作者にあります。

- 改変の元にしたバージョン: コミット `fdd4daf7`（2026-10-23）
- 改変を始めた日: 2026-10-29（改変者: kosse）
- 主な改変: サービス名・ロゴ・色の変更、議会向け機能（法案・会期・党の賛否・トピック分析など）の削除、DB をインタビュー中心の構成に作り直し、選択肢の複数選択や質問の優先度・対象者条件の追加。個々の変更と日付はコミット履歴で確認できます。

本番で動いているサービスはこのリポジトリの `main` ブランチのコードです（AGPL-3.0 第13条によるソースコードの提供）。サービスの画面下部からもこのリポジトリへリンクしています。

[Fork ガイドライン](./FORK_GUIDELINES.md) は、fork 元が AGPL-3.0 第7条に基づいて定めた追加条件です。この fork もガイドラインに従っています。AGPL-3.0 のもとでも、「チームみらい」「みらい議会」の名称とロゴを使う権利は与えられません。

## Fork して独自サービスを運営する場合

本リポジトリを fork して独自にサービスを運営する場合は、[Fork ガイドライン](./FORK_GUIDELINES.md) を確認してください。本家サービスとの混同防止のため、ロゴ・カラー・サービス名称などの変更が必要です。
