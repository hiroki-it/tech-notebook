---
title: 【IT技術の知見】JSクライアントパッケージ＠Keycloak
description: JSクライアントパッケージ＠Keycloakの知見を記録しています。
---

# JSクライアントパッケージ＠Keycloak

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. keycloak

### onAuthSuccess

ログイン処理が成功した場合に、事後処理を挿入する。

```javascript
const keycloak = new Keycloak({
  url: "http://127.0.0.1:8080",
  realm: "foo-realm",
  clientId: "frontend",
});

keycloak.onAuthSuccess = function () {
  console.log("ログイン成功");
};
```

<br>

### onAuthLogout

ログアウト処理が成功した場合に、事後処理を挿入する。

```javascript
const keycloak = new Keycloak({
  url: "http://127.0.0.1:8080",
  realm: "foo-realm",
  clientId: "frontend",
});

keycloak.onAuthLogout = function () {
  console.log("ログアウト成功!");
};
```

<br>
