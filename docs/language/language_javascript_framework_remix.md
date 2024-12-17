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

Loader ---> Component ---> Action の順に処理が実行される。

1. Loaderで、レンダリング前にAPIからデータを取得する。
2. Componentで、レンダリング処理を実行する。
3. Actionで、APIリクエストやブラウザ操作に応じた処理を実行する。Actionは、バックエンドのコントローラーと同様にクエリストリングやリクエストのコンテキストを受信する。

> - https://www.ey-office.com/blog_archive/2022/07/06/is-remix-ruby-on-rails-in-react/

<br>

## 02. Remixの仕組み

### loader

#### ▼ loaderとは

`loader`と命名した関数は、サーバーサイドレンダリング時に使用でき、初回にレンダリング時に実行される。

各エンドポイントごとに定義できる。

DBにクエリを送信し、データを取得できる。

認証処理がある場合、`loader`関数の前に実行する必要がある。

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
> - https://qiita.com/taisei-13046/items/9a35c8d969954211f0ed#loader

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

### component

<br>

### action

```jsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { TodoList } from "~/components/TodoList";
import { fakeCreateTodo, fakeGetTodos } from "~/utils/db";

// loaderでレンダリング前にデータを取得する
export async function loader() {
  return json(await fakeGetTodos());
}

// useLoaderDataでloaderによる取得データを出力する
export default function Todos() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <TodoList todos={data} />
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  );
}

// actionで、受信したリクエストに応じた処理を実行する
export async function action({request}: ActionFunctionArgs) {
  const body = await request.formData();
  const todo = await fakeCreateTodo({
    title: body.get("title"),
  });
  return redirect(`/todos/${todo.id}`);
}
```

> - https://remix.run/docs/en/main/route/action

<br>

## 03. ディレクトリ構成

### 構成

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

### root.tsx

アプリケーションのルートである。

`link`タグ、`meta`タグ、`script`タグを定義する。

> - https://remix.run/docs/en/main/file-conventions/root

<br>

### entry.client.tsx

マークアップファイルのハイドレーション処理のエントリーポイントである。

> - https://remix.run/docs/en/main/file-conventions/entry.client

<br>

### entry.server.tsx

レスポンス作成処理のエントリーポイントである。

> - https://remix.run/docs/en/main/file-conventions/entry.server

<br>

## 04. ルーティング

### UIとAPI

Rえmixでは、ブラウザまたはAPIへのルーティングが区別されず、両方を兼ねている。

ただし、ファイル名によって区別することもできる。

`app/routes/api.<任意のパス>`ファイルまたは`app/routes/api/<任意のパス>`ファイルを作成する。

このファイルの処理は、APIとして処理される。

> - https://zenn.dev/acompany/articles/123c29f46d213c#%E7%B5%B1%E4%B8%80%E7%9A%84%E3%81%AAapi%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%82%92%E4%BD%9C%E3%82%8B%E3%81%AE%E3%81%AB%E8%8B%A6%E5%8A%B4%E3%81%99%E3%82%8B%E3%80%82
> - https://remix.run/docs/en/1.19.3/guides/api-routes

<br>

### ドッド分割

#### ▼ `_index.tsx`

ルートパスになる。

```yaml
app/                        # URLパス
├── routes/
│   ├── _index.tsx          # /
└── root.tsx
```

> - https://zenn.dev/heysya_onsya/articles/5aae742104b32a#%E5%9F%BA%E6%9C%AC%E3%81%AE%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%EF%BC%88basic-routes%EF%BC%89

#### ▼ `<ルート以降のパス>.tsx`

ルート以降のパスを設定する。

```yaml
app/                        # URLパス
├── routes/
│   ├── _index.tsx          # /
│   ├── home.tsx            # /home
│   ├── home.contents.tsx   # /home/contents
└── root.tsx
```

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

> - https://zenn.dev/heysya_onsya/articles/5aae742104b32a#%E5%9F%BA%E6%9C%AC%E3%81%AE%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%EF%BC%88basic-routes%EF%BC%89

#### ▼ `<ルート以降のパス>.<変数>.tsx` (動的セグメント)

動的にURLを決定する。

URLに規則性があるようなページに適する。

```yaml
app/                        # URLパス
├── routes/
│   ├── _index.tsx          # /
│   ├── home.tsx            # /home
│   ├── home.contents.tsx   # /home/contents
│   ├── user.$id.tsx        # /user/{任意の値}
└── root.tsx
```

> - https://zenn.dev/heysya_onsya/articles/5aae742104b32a#%E5%9F%BA%E6%9C%AC%E3%81%AE%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%EF%BC%88basic-routes%EF%BC%89

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

### ディレクトリ分割

ディレクトリ名がパスとして認識される。

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
