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

`loader` ---> `component` ---> `action` の順に処理が実行される。

1. `loader`は、レンダリング前にAPIからデータを取得する。
2. `component`は、レンダリング処理を実行する。
3. `action`は、APIリクエストやブラウザ操作に応じて、データを変更する。`action`は、バックエンドのコントローラーと同様にクエリストリングやリクエストのコンテキストを受信する。

> - https://www.ey-office.com/blog_archive/2022/07/06/is-remix-ruby-on-rails-in-react/

<br>

## 02. Remixの仕組み

### loader

#### ▼ loaderとは

`loader` (ユーザーが`loader`と命名した関数) は、レンダリング前にAPIからデータを取得する。

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

`component`は、レンダリング処理を実行する。

<br>

### action

`action`は、APIリクエストやブラウザ操作に応じて、データを変更する。

バックエンドのコントローラーと同様にクエリストリングやリクエストのコンテキストを受信する。

componentを同じファイルに実装する以外に、`.server`ディレクトリに切り分ける方法もある。

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

// componentで、レンダリング処理を実行する
export default function Todos() {

  // useLoaderDataでloaderによる取得データを出力する
  const data = useLoaderData<typeof loader>();

  // Todoリストを出力する
  return (
    <div>
      <TodoList todos={data} />
      <Form method="post">
        <input type="text" name="title" />
        {/*
          Create Todoボタンを設置する
          同一ファイルのactionをコールする。
        */}
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
> - https://blog.tomoya.dev/posts/my-best-remix-directory-structure/#%e3%81%84%e3%81%84%e6%84%9f%e3%81%98%e3%81%ae%e3%83%87%e3%82%a3%e3%83%ac%e3%82%af%e3%83%88%e3%83%aa%e6%a7%8b%e6%88%90

<br>

## 03. ディレクトリ構成

### 構成

```yaml
.
├── app/
│  ├── components/ # ユーザー定義のRemix component
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

`RemixServer`で設定を変更できる。

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

> - https://zenn.dev/heysya_onsya/articles/5aae742104b32a#%E5%8B%95%E7%9A%84%E3%82%BB%E3%82%B0%E3%83%A1%E3%83%B3%E3%83%88%EF%BC%88dynamic-segments%EF%BC%89

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

#### ▼ 子の`_<ルート以降のパス>.tsx`

子のファイル名にプレフィクスとして `_` (パスレスルート) をつける。

これにより、親からレイアウトを引き継ぎつつ、パスは引き継がない。

**＊実装例＊**

`_home.auth.tsx`ファイルは、親の`home.tsx`ファイルのレイアウトを引き継いでいる。

しかし、`/home/auth`パスではなく、`/auth`パスになる。

```yaml
app/                       #  URLパス                   引き継ぐレイアウト
├── routes/
│   ├── _index.tsx         #  /                        root.tsx
│   ├── home.tsx           #                           root.tsx
│   ├── home._index.tsx    #  /home                    home.tsx
│   ├── home.contents.tsx  #  /home/contents           home.tsx
│   ├── home_.mine.tsx     #  /home/mine               root.tsx
│   ├── _home.auth.tsx     #  /auth                    home.tsx # 親からパスを引き継がない
│   ├── user.$id.tsx       #  /user/{任意の値}          root.tsx
│   ...
│
└── root.tsx
```

> - https://zenn.dev/heysya_onsya/articles/5aae742104b32a#%E3%83%91%E3%82%B9%E3%83%AC%E3%82%B9%E3%83%AB%E3%83%BC%E3%83%88%EF%BC%88nested-layouts-without-nested-urls%EF%BC%89

#### ▼ 親の`_<ルート以降のパス>.tsx` (親がパスレスルート)

親のファイル名にプレフィクスとして `_` (パスレスルート) をつける。

**＊実装例＊**

`_auth.<任意の名前>.tsx`ファイルは、親の`_auth.tsx`ファイルのレイアウトを引き継いでいる。

しかし、全てのファイルのURLに`auth`が含まれない。

```yaml
app/                               # URLパス
├── routes                         #
│   ├── _auth.tsx                  #
│   ├── _auth.login.tsx            # /login
│   ├── _auth.password.reset.tsx   # /password/reset
│   ├── _auth.register.tsx         # /register
...
```

```jsx
// _auth.tsxファイル
import {Outlet} from "@remix-run/react";

import {SiteFooter, SiteHeader} from "~/components";

export default function AuthCommon() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-dvh">
      <SiteHeader />
      {/* Outletに子 (login、password.reset、register) を出力する */}
      <Outlet />
      <SiteFooter />
    </div>
  );
}
```

> - https://zenn.dev/tor_inc/articles/0b5960a7cee2c5#_%E6%8E%A5%E9%A0%AD%E8%BE%9E%E4%BB%98%E3%81%8D%E5%85%B1%E9%80%9A%E3%83%95%E3%82%A9%E3%83%AB%E3%83%80

<br>

### ディレクトリ分割

ディレクトリ名がパスとして認識される。

<br>

## 05. componentの種類

### ユーザー定義

Remixがcomponentであることを認識するために、名前の先頭を大文字する。

> - https://dev.classmethod.jp/articles/make-user-defined-component-name-capitalized-in-react/

<br>

### Form

`form`タグをレンダリングする。

`action`値を省略した場合、フォームの入力データは他に送信されず、そのコンポーネント内のみで処理される。

`action`値を`/foos?index`パスとした場合、`routes/foos/index.jsx`ファイルにデータを送信する。

一方で、`action`値を`/foos`パスとした場合、`routes/foos.jsx`ファイルにデータを送信する。

**＊実装例＊**

ここでは`action`値を省略している。

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
> - https://www.chadtaylor.dev/blog/submitting-a-form-to-an-index-route-in-remix/
> - https://remix.run/docs/en/main/components/form#index

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

## 06. Cookieを使用した認証

### LocalStorageやSessionStorageではなくCookie

RemixはSSRアプリケーションを作成する。

SSRでは、ブラウザのLocalStorageやSessionStorageを操作できない。

代わりに、ブラウザのCookie、サーバーのメモリ、サーバー上のファイルなどに認証情報を保存することになる。

> - https://github.com/vercel/next.js/discussions/39915#discussioncomment-3467720

<br>

### Cookieの作成と保存

#### ▼ ブラウザのCookieに保存する場合

ブラウザのCookieに認証情報を保存する。

```jsx
export const cookieSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
  },
});
```

> - https://remix.run/docs/en/main/utils/sessions#createcookiesessionstorage

#### ▼ サーバーのメモリに保存する場合

サーバーのメモリに認証情報を保存する。

```jsx
export const memorySessionStorage = createMemorySessionStorage({
  cookie: sessionCookie,
});
```

> - https://remix.run/docs/en/main/utils/sessions#creatememorysessionstorage

#### ▼ サーバー上のファイルに保存する場合

サーバー上のファイルに認証情報を保存する。

```jsx
export const memorySessionStorage = createFileSessionStorage({
  dir: "/app/sessions",
  cookie: sessionCookie,
});
```

> - https://remix.run/docs/en/main/utils/sessions#creatememorysessionstorage

<br>

## 07. エラー

| データ名   | 説明                               | 例                   |
| ---------- | ---------------------------------- | -------------------- |
| state      | ステータスコード                   | `405`                |
| statusText | ステータスコードのエラーメッセージ | `Method Not Allowed` |
| data       | 詳細なエラー                       | `Error: *****`       |

> - https://remix.run/docs/zh/main/route/error-boundary

<br>
