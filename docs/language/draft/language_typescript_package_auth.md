---
title: 【IT技術の知見】認証パッケージ＠TypeScript
description: 認証パッケージ＠TypeScriptの知見を記録しています。
---

# 認証パッケージ＠TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. oidc-client-ts

TypeScriptでOIDCを実施するためのパッケージ。

フレームワークによっては、ラッパー (例：`react-oidc-context`) が提供されている。

```javascript
import {OidcClient, UserManager} from "oidc-client-ts";

const client = new OidcClient({
  authority: "<IDプロバイダーのIssuer値>",
  // クライアントを表す名前を設定する
  // 例：frontend
  client_id: "<クライアントID>",
  // IDプロバイダー側で設定したコールバックURLを設定する。ホスト名は window.location.origin とする。
  // 例：window.location.origin + "/authentication/callback"
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
> - https://dev.classmethod.jp/articles/openidconnect-devio2023/#P.24%2520React%25E5%2581%25B4%25E3%2581%25AE%25E8%25A8%25AD%25E5%25AE%259A%25E5%2586%2585%25E5%25AE%25B9%25E7%25A2%25BA%25E8%25AA%258D

<br>
