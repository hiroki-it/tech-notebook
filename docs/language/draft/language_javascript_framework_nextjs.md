---
title: 【IT技術の知見】Next.js＠フレームワーク
description: Next.js＠フレームワークの知見を記録しています。
---

# Next.js＠フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Next.jsとは

Reactパッケージを使用したフレームワークである。

<br>

## 02. セットアップ

### UIレンダリングパターン

#### ▼ CSRモード

以下の時にCSRモードになり、SPAをレンダリングする。

- ファイルの先頭に `"use client"` を指定している。

```typescript
"use client";

import React, {useEffect, useState} from "react";

type Product = {
  id: string;
  title: string;
};

const CsrPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();

    setProducts(data.products);
  };

  useEffect(
      // 実行したい無名な非同期関数
      () => {
        fetchData();
  }, []);

  return (
    <>
      <h3>Built with CSR</h3>
      <br />
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CsrPage;
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6

#### ▼ SSRモード

以下の時にSSRモードになる。

- `fetch` 関数の第二引数に、`{ cache: "no-store" }` を指定している
- `useEffect`、`useState`、`onClick` などのブラウザ依存の機能を使用していない

```jsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const SsrPage = async () => {
  const response = await fetch("https://dummyjson.com/products", {
    cache: "no-store",
  });
  const data = await response.json();

  return (
    <>
      <h3>Built with SSR</h3>
      <br />
      <ul>
        {data.products.map((product: Product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default SsrPage;
```

または `'force-dynamic'` を宣言する。

```jsx
export const dynamic = "force-dynamic";
```

```bash
$ yarn build

Route (app)                              Size     First Load JS
┌ ƒ /                                    28 kB           122 kB
├ ƒ /api/foo             0 B                0 B
├ ƒ /api/bar             0 B                0 B
└ ƒ /api/baz             0 B                0 B
+ First Load JS shared by all            67.1 kB
  ├ chunks/23-b9ff729a154323c6.js        21.5 kB
  ├ chunks/fd9d1056-a2186e5cf4948962.js  43.6 kB
  └ other shared chunks (total)          1.96 kB

ƒ  (Dynamic)  server-rendered on demand
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB
> - https://zenn.dev/shouta0715/articles/6823ea33cd3778#2.-force-dynamic

#### ▼ SSGモード

以下の時にSSGモードになる。

- `fetch` 関数の第二引数に、`{ cache: "force-cache" }` を指定しているか、または何も指定していない
- `useEffect`、`useState`、`onClick` などのブラウザ依存の機能を使用していない

```jsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const SsgPage = async () => {
  const response = await fetch("https://dummyjson.com/products");
  const data = await response.json();

  return (
    <>
      <h3>Built with SSG</h3>
      <br />
      <ul>
        {data.products.map((product: Product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default SsgPage;
```

または `'auto'` を宣言する。

```jsx
export const dynamic = "auto";
```

```bash
$ yarn build

Route (app)                              Size     First Load JS
┌ ○ /                                    28 kB           122 kB
├ ○ /api/foo             0 B                0 B
├ ○ /api/bar             0 B                0 B
└ ○ /api/baz             0 B                0 B
+ First Load JS shared by all            67.1 kB
  ├ chunks/23-b9ff729a154323c6.js        21.5 kB
  ├ chunks/fd9d1056-a2186e5cf4948962.js  43.6 kB
  └ other shared chunks (total)          1.96 kB

○  (Static)  prerendered as static content
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6-2
> - https://zenn.dev/shouta0715/articles/6823ea33cd3778#1.-auto

#### ▼ ISRモード

以下の時にISRモードになる。

- `fetch` 関数の第二引数に、`{ next: { revalidate: <任意の値> } }` を指定している
- `useEffect`、`useState`、`onClick` などのブラウザ依存の機能を使用していない

```jsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const IsrPage = async () => {
  const response = await fetch("https://dummyjson.com/products", {
    next: {
      revalidate: 30,
    },
  });
  const data = await response.json();

  return (
    <>
      <h3>Built with ISR</h3>
      <br />
      <ul>
        {data.products.map((product: Product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default IsrPage;
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6-3

#### ▼ ハイブリッド

フロントエンド領域のロジックをCSRモード、バックエンド領域のロジックをSSRモードで実行する。

```jsx
// フロントエンド領域のファイル
"use client";
```

```jsx
// 　バックエンド領域のファイル
export const dynamic = "force-dynamic";
```

```bash
$ yarn build

Route (app)                              Size     First Load JS
┌ ○ /                                    28 kB           122 kB
├ ƒ /api/foo             0 B                0 B
├ ƒ /api/bar             0 B                0 B
└ ƒ /api/baz             0 B                0 B
+ First Load JS shared by all            67.1 kB
  ├ chunks/23-b9ff729a154323c6.js        21.5 kB
  ├ chunks/fd9d1056-a2186e5cf4948962.js  43.6 kB
  └ other shared chunks (total)          1.96 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

> - https://zenn.dev/sunnyheee/articles/df10b4ae614cfa#hybrid-web-app

<br>

### モード

#### ▼ CSRモード

記入中...

#### ▼ SSRモード

記入中...

#### ▼ SSGモード

記入中...

#### ▼ APIルートモード

`app/api/foo` ディレクトリに `route.ts` ファイルをおくと、`app/api/` がエンドポイントのAPIルートモードになる。

APIルートモードとほかのモード（CSR、SSR、SSG）はディレクトリを分けて共存させられるため、1つのアプリケーションでフロントエンドアプリケーションとBFFを兼ねることができる。

```typescript
// app/api/foo/route.tsファイル
import type {NextApiRequest, NextApiResponse} from "next";

export default (_: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ok: true});
};
```

<br>

## 03. 環境変数

### 言語の実行環境

- `export` コマンドで出力する
- コンテナの環境変数として出力する

<br>

### プレフィクス

| モード                                   | 出力タイミング             | `NEXT_PUBLIC_****` |      `****` (`NEXT_PUBLIC` なし)      |
| ---------------------------------------- | -------------------------- | :----------------: | :-----------------------------------: |
| SSRモード                                | サーバーへのリクエストごと |         ✅         |                  ✅                   |
| SSGモード                                | サーバーのビルド時         |         ✅         |                  ✅                   |
| CSRモード                                | ブラウザ上                 |         ✅         |                  ❌                   |
| APIルートモード (厳密にはモードではない) | サーバーへのリクエストごと |         ✅         | ✅ (`api` ディレクトリ配下で読み込む) |

<br>

### `.env` ファイル

#### ▼ 仕組み

`.env` ファイルを自動的に読み込み、また名前に応じて処理が変わる。

dotenvパッケージは不要である。

#### ▼ `.env` ファイル

全ての `yarn` コマンドで自動的に読み込まれる。

#### ▼ `.env.local` ファイル

全ての `yarn` コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.development` ファイル

`yarn dev` コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.development.local` ファイル

`yarn dev` コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.production` ファイル

`yarn start` コマンドと `next build` コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.production.local` ファイル

`yarn start` コマンドと `next build` コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

<br>

## 04. ルーティング

### UIとAPI

#### ▼ ディレクトリ

Next.jsでは、ブラウザルーティングとAPIエンドポイントを区別している。

```yaml
app/
├── layout.tsx                  # 共通レイアウトであり、全ページに適用される
├── page.tsx                    # example.com/ であり、そのパスのトップページとして機能する
├── about/
│   └── page.tsx                # example.com/about であり、そのパスのトップページとして機能する
│
├── api/                        # APIルート：example.com/api/
│   ├── user/
│   │   └── route.ts            # example.com/api/user （GET, POST など）
│   └── posts/
│       └── [id]/               # 動的ルート（例：/api/posts/123）
│           └── route.ts        # example.com/api/posts/:id
```

#### ▼ 動的ルート

ルーティングにおけるパスパラメーターの値を事前に定義せず、処理の中で決定する。

```typescript
import {NextRequest} from "next/server";
import {z} from "zod";

export const dynamic = "force-dynamic";

// 動的ルートのパスパラメーター
const allowedKeys = ["foo", "bar"] as const;

const ParamsSchema = z
  .object({
    // 空文字以外を許可する
    key: z.string().min(1).max(64),
  })
  // 存在するキーのみを許可する
  .refine(({key}) => (allowedKeys as readonly string[]).includes(key), {
    // Zodのエラーメッセージ
    message: "not allowed",
  });

export async function GET(
  _request: NextRequest,
  {params}: {params: {key: string}},
) {
  const parsed = ParamsSchema.safeParse(params);
  // 存在しないキーの場合はパスが存在しないため、NotFoundとする
  if (!parsed.success) return new Response(null, {status: 404});

  return Response.json({ok: true, key: parsed.data.key});
}
```

<br>

### ヘルスチェック

```yaml
app/
├── api/
│   └── healthz
```

```typescript
import {NextResponse} from "next/server";

export function GET() {
  return NextResponse.json({status: "ok"}, {status: 200});
}
```

<br>
