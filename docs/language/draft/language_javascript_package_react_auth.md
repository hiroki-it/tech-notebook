---
title: 【IT技術の知見】認証パッケージ＠React
description: 認証パッケージ＠Reactの知見を記録しています。
---

# 認証パッケージ＠React

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. react-oidc-context

`oidc-client-ts` パッケージをReact用にラップした認証パッケージである。

> - https://github.com/authts/react-oidc-context

<br>

## 02. セットアップ

### 認証

#### ▼ 全体

```tsx
import React from "react";
import {createRoot} from "react-dom/client";
import {AuthProvider, useAuth} from "../src/.";

// 認可リクエスト時に必要になる情報
const oidcConfig = {
  // 例：https://<IDプロバイダーのドメイン>/realms/<realm名>
  authority: "<IDプロバイダーのIssuer値>",
  // クライアントを表す名前を設定する
  // 例：frontend
  client_id: "<クライアントID>",
  // ホスト名は window.location.origin とする。
  // 例：window.location.origin + "/authentication/callback"
  redirect_uri: "<コールバックURL>",
};

function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        Hello {auth.user?.profile.sub}{" "}
        <button onClick={() => void auth.removeUser()}>Log out</button>
      </div>
    );
  }

  // signinRedirect関数でログインする
  return <button onClick={() => void auth.signinRedirect()}>Log in</button>;
}

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

root.render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>,
);
```

> - https://github.com/authts/react-oidc-context/blob/main/example/index.tsx
> - https://dev.classmethod.jp/articles/openidconnect-devio2023/#P.24%2520React%25E5%2581%25B4%25E3%2581%25AE%25E8%25A8%25AD%25E5%25AE%259A%25E5%2586%2585%25E5%25AE%25B9%25E7%25A2%25BA%25E8%25AA%258D

#### ▼ 認証済みユーザーの取得

ログイン時に、Authorizationヘッダー上のアクセストークンをIDプロバイダーに送信し、ユーザーを取得する。

> - https://dev.classmethod.jp/articles/openidconnect-devio2023/#P.33%2520%25E3%2583%25AA%25E3%2582%25AF%25E3%2582%25A8%25E3%2582%25B9%25E3%2583%2588%25E3%2581%25AE%25E5%258B%2595%25E3%2581%258D%25E3%2582%2592%25E8%25A6%258B%25E3%2581%25A6%25E3%2581%25BF%25E3%2582%2588%25E3%2581%2586%25EF%25BC%2588UserInfo%25E3%2583%25AA%25E3%2582%25AF%25E3%2582%25A8%25E3%2582%25B9%25E3%2583%2588%25EF%25BC%2589

<br>
