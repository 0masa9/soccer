# FOLD

サッカーのリーグ順位表とトーナメント管理を最短で形にするためのMVP実装ベース。

## Overview

- Next.js App Router + TypeScript + Tailwind CSS
- 仕様ドック: `docs/spec.html`
- ルート構成: `src/app` 配下に画面を追加していく
- Supabase schema/RLS: `supabase/schema.sql`
- UI: `src/components/ui` (shadcn/ui style components)

## Getting Started

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いて確認します。

## Supabase Setup

1. Supabaseでプロジェクト作成
2. SQL Editorで `supabase/schema.sql` を実行
3. `.env.local` を用意して環境変数を設定

```bash
cp .env.local.example .env.local
```

必要な環境変数:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Notes

次のフェーズで Zod / shadcn/ui を導入し、CRUDと順位表ロジックを実装します。
