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

`oidc-client-ts`パッケージをReact用にラップした認証パッケージである。

> - https://github.com/authts/react-oidc-context

<br>

## 02. セットアップ

```tsx
import React from "react";
import {createRoot} from "react-dom/client";
import {AuthProvider, useAuth} from "../src/.";

// 認可リクエスト時に必要になる情報
const oidcConfig = {
  authority: "<IDプロバイダーのIssuer値>",
  // クライアントを表す名前を設定する
  // 例：frontend
  client_id: "<クライアントID>",
  // IDプロバイダー側で設定したコールバックURLを設定する。ホスト名は window.location.origin とする。
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

<br>
