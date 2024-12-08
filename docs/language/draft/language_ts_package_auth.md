---
title: 【IT技術の知見】認証パッケージ＠JavaScript
description: 認証パッケージ＠JavaScriptの知見を記録しています。
---

# 認証パッケージ＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. oidc-client-ts

```javascript
import {OidcClient, UserManager} from "oidc-client-ts";

const client = new OidcClient({
  authority: "<IDプロバイダーの認可エンドポイント>",
  client_id: "<クライアントID>",
  redirect_uri: "<コールバックURL>",
});

const userManager = new UserManager(client);

// ログインする
// 認可リクエストを送信する
userManager
  .signinRedirect()
  .then(function () {
    // ログイン成功時の処理
  })
  .catch(function (error) {
    // ログイン失敗時の処理
  });

userManager.getUser().then(function (user) {
  // 認証済みユーザーを取得する
});

// ログアウトする
userManager.signoutRedirect();
```

> - https://authts.github.io/oidc-client-ts/interfaces/OidcClientSettings.html
> - https://authts.github.io/oidc-client-ts/classes/OidcClient.html

<br>
