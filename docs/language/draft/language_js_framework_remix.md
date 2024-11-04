---
title: 【IT技術の知見】Remix＠React系フレームワーク
description: Remix＠React系フレームワークの知見を記録しています。
---

# Remix＠React系フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Remixとは

Reactパッケージを使用したフレームワークである。

<br>

## 02. 初期化

### loader

#### ▼ loaderとは

サーバーサイドレンダリング時に使用できる。

DBにクエリを送信し、データを取得できる。

```tsx
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";

export const loader = async () => {
  return json({
    posts: [
      {
        slug: "my-first-post",
        title: "My First Post",
      },
      {
        slug: "90s-mixtape",
        title: "A Mixtape I Made Just For You",
      },
    ],
  });
};
```

> - https://zenn.dev/ak/articles/cef68c1b67a314#loader
> - https://zenn.dev/link/comments/8945abe32ae53a

#### ▼ useLoaderData

`loader`関数で取得したデータを表示できる。

```tsx
import {json} from "@remix-run/node";
import {useLoaderData} from "@remix-run/react";

export const loader = async () => {
  return json({
    posts: [
      {
        slug: "my-first-post",
        title: "My First Post",
      },
      {
        slug: "90s-mixtape",
        title: "A Mixtape I Made Just For You",
      },
    ],
  });
};

export default function Posts() {
  const {posts} = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>Posts</h1>
    </main>
  );
}
```

> - https://zenn.dev/ak/articles/cef68c1b67a314#loader
> - https://zenn.dev/link/comments/8945abe32ae53a

<br>

## 03. ルーティング

### URLとのマッピング

#### ▼ 仕組み

ドット区切りファイル名またはディレクトリ名がURLになる。

#### ▼ `<ルート以降のパス>._index.tsx`

ルート以降のパスを設定する。

```tsx
// <ルート以降のパス>._index.tsx
export default function Foo() {
  // 返却するHTML要素
  return (
    <main>
      <h1>Foo</h1>
    </main>
  );
}
```

> - https://zenn.dev/link/comments/fabfb7fd3aee65

#### ▼ `<ルート以降のパス>.<変数>.tsx`

動的にURLを決定する。

URLに規則性があるようなページに適する。

> - https://zenn.dev/link/comments/ddd4650a1941e3

<br>

## 04. remixコマンド

### build

```bash
$ remix vite:build
```

> - https://remix-docs-ja.techtalk.jp/other-api/dev#remix-vitebuild

<br>

### dev

```bash
$ remix vite:dev
```

> - https://remix-docs-ja.techtalk.jp/other-api/dev#remix-vitedev

<br>
