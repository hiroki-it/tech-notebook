---
title: 【IT技術の知見】JavaScript＠Keycloakクライアント
description: JavaScript＠Keycloakクライアントの知見を記録しています。
---

# JavaScript＠Keycloakクライアント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Keycloakクライアント

KeycloakクライアントになりうるJavaScriptパッケージにはいくつかある。

ここでは、`keycloak-js`パッケージについて記載する。

- keycloak-js (Keycloak専用)
- oidc-client
- oidc-client-ts
- ...

<br>

## 02. Keycloak

### init

ログイン処理を実施する。

初回認証時の場合は、Keycloakに認可リクエストを送信する。

次回認証時は、任意の場所 (例：SessionStorage、LocalStorage、Cookie) に保管している資格情報をリクエストに設定する。

例えば、アクセストークンを`Authorization`ヘッダーで運搬する場合はSessionStorageやLocalStorageから取得し、`Cookie`ヘッダーの場合はCookieから取得する。

```javascript
import Keycloak from "keycloak-js";

// JavaScriptパッケージを初期化する
const keycloak = new Keycloak({
  url: "http://<KeycloakのWebのドメイン名>",
  realm: "<realm名>",
  clientId: "<クライアントID>",
});

// login-requiredを有効化すると、未認証の場合には認証を開始し、認証済みの場合はログインページをリクエストする
// @see https://www.keycloak.org/docs/23.0.7/securing_apps/#using-the-adapter
keycloak.init({onLoad: "login-required"}).then((auth) => {
  if (!auth) {
    console.log("not Authenticated");
  } else {
    console.log("Authenticated");
    console.log(keycloak);
    // LocalStorageにアクセストークンを設定する
    // もしすでにアクセストークンがある場合、上書きする
    localStorage.setItem("access_token", keycloak.token);
  }
});

const authLink = setContext((_, {headers}) => {
  // LocalStorageからアクセストークンを取得する
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      ...headers,
      // 取得したトークンをリクエストのAuthorizationヘッダーに設定する
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});
```

> - https://www.keycloak.org/docs/latest/securing_apps/#using-the-adapter
> - https://qiita.com/mamomamo/items/cdde95feffbb5e524fd4#keycloak%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E3%81%AE%E4%BD%9C%E6%88%90
> - https://gitlab.com/gihyo-ms-dev-book/showcase/all-in-one/application/frontend/-/blob/main/src/index.js?ref_type=heads#L49-68

<br>

### onAuthSuccess

ログイン処理が成功した場合に、事後処理を挿入する。

```javascript
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://<KeycloakのWebのドメイン名>",
  realm: "<realm名>",
  clientId: "<クライアントID>",
});

keycloak.onAuthSuccess = () => {
  console.log("ログイン成功");
};
```

> - https://www.keycloak.org/docs/latest/securing_apps/#callback-events

<br>

### onAuthLogout

ログアウト処理が成功した場合に、事後処理を挿入する。

```javascript
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://<KeycloakのWebのドメイン名>",
  realm: "<realm名>",
  clientId: "<クライアントID>",
});

keycloak.onAuthLogout = () => {
  console.log("ログアウト成功!");
};
```

> - https://www.keycloak.org/docs/latest/securing_apps/#callback-events

<br>
