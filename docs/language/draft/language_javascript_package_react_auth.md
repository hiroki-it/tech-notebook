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

const oidcConfig = {
  authority: "<your authority>",
  client_id: "<your client id>",
  redirect_uri: "<your redirect uri>",
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

<br>
