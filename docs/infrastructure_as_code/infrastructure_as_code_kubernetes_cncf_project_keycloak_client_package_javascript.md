---
title: 【IT技術の知見】Javascript＠Keycloakクライアント
description: Javascript＠Keycloakクライアントの知見を記録しています。
---

# Javascript＠Keycloakクライアント

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Keycloak

### init

ログイン処理を実施する。

初回認証時の場合は、Keycloakに認可リクエストを送信する。

次回認証時は、任意の場所 (例：SessionStorage、LocalStorage、ローカルマシンの`Cookie`ディレクトリ) に保管している認証情報をリクエストに設定する。

例えば、トークンを`Authorization`ヘッダーで運搬する場合はSessionStorageやLocalStorageから取得し、`Cookie`ヘッダーの場合はローカルマシンの`Cookie`ディレクトリから取得する。

```javascript
import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://keycloak.example.com",
  realm: "foo-realm",
  clientId: "frontend",
});

keycloak.init({onLoad: "login-required"}).then((auth) => {
  if (!auth) {
    console.log("not Authenticated");
  } else {
    console.log("Authenticated");
    console.log(keycloak);
    // LocalStorageからトークンを取得する
    localStorage.setItem("token", keycloak.token);
  }
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
  url: "http://keycloak.example.com",
  realm: "foo-realm",
  clientId: "frontend",
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
  url: "http://keycloak.example.com",
  realm: "foo-realm",
  clientId: "frontend",
});

keycloak.onAuthLogout = () => {
  console.log("ログアウト成功!");
};
```

> - https://www.keycloak.org/docs/latest/securing_apps/#callback-events

<br>
