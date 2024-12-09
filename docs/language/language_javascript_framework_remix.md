---
title: 【IT技術の知見】Remix＠フレームワーク
description: Remix＠フレームワークの知見を記録しています。
---

# Remix＠フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Remixとは

Reactパッケージを使用したフレームワークである。

<br>

## 02. ディレクトリ構成

```yaml
.
├── app/
│  ├── components/ # ユーザー定義のRemixコンポーネント
│  │
│  ├── models/ # モデルのCRUD処理
│  │
│  ├── routes/ # ルーティングとレンダリングの処理
│  │
│  ├── utils/ # 汎用的な関数
│  │
│  ├── entry.client.tsx
│  ├── entry.server.tsx
│  └── root.tsx
│
├── prisma/ # モデルの定義
...
```

<br>

## 03. 初期化

### loader

#### ▼ loaderとは

サーバーサイドレンダリング時に使用できる。

DBにクエリを送信し、データを取得できる。

**＊実装例＊**

```jsx
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

`loader`関数で取得したデータを出力できる。

**＊実装例＊**

```jsx
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

## 04. ルートモジュール

### URLとのマッピング

#### ▼ 仕組み

ドット区切りファイル名またはディレクトリ名がURLになる。

#### ▼ `<ルート以降のパス>._index.tsx`

ルート以降のパスを設定する。

**＊実装例＊**

```jsx
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

**＊実装例＊**

```jsx
// posts.$postId.tsxファイル
export default function Post() {
  return (
    <div>
      <h1 className="font-bold text-3xl">投稿詳細</h1>
    </div>
  );
}
```

以下のURLでページをレンダリングできる。

- /posts/1
- /posts/2
- /posts/3

> - https://zenn.dev/ak/articles/cef68c1b67a314#dynamic-segments
> - https://zenn.dev/link/comments/ddd4650a1941e3

<br>

## 05. コンポーネント

### Form

`form`タグをレンダリングする。

```jsx
import {Form} from "@remix-run/react";

function NewEvent() {
  return (
    <Form action="/events" method="post">
      <input name="title" type="text" />
      <input name="description" type="text" />
    </Form>
  );
}
```

> - https://remix.run/docs/en/main/components/form

<br>

### Meta

Webページの`meta`タグ (Webサイト名、説明など) をレンダリングする。

```jsx
import {Meta} from "@remix-run/react";

export default function Root() {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body></body>
    </html>
  );
}
```

> - https://remix.run/docs/en/main/components/meta

<br>

### Outlet

親ページ内に子ページをレンダリングする。

```jsx
import {Outlet} from "@remix-run/react";

export default function SomeParent() {
  return (
    <div>
      <h1>Parent Content</h1>

      <Outlet />
    </div>
  );
}
```

> - https://remix.run/docs/en/main/components/outlet#outlet

<br>
