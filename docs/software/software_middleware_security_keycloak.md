---
title: 【IT技術の知見】Keycloak＠セキュリティ系ミドルウェア
description: Keycloak＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Keycloak＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Keycloakとは

アプリケーションに代わって、認証認可処理を実行する。

認証認可に関するAPIを公開し、認証時のアカウントのCRUDや、認可時のアカウントに対する権限スコープ付与、を実行できる。

> - https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html
> - https://blog.linkode.co.jp/entry/2023/08/23/000000

<br>

## 01-02. 仕組み

### アーキテクチャ

Keycloakは、認証処理サービス、Infinispan、アカウント管理用のRDBMS、といったコンポーネントから構成されている。

![keycloak_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_architecture.png)

> - https://blog.palark.com/ha-keycloak-infinispan-kubernetes/

<br>

### Infinispan

キャッシュを保管する。

<br>

### RDBMS

認証情報を保管する。

<br>

## 02. 認証認可

### Realm

Keycloakでは、Adminユーザーの認証はmaster realmで、それ以外はユーザー定義のrealm、で管理する。

> - https://keycloak-documentation.openstandia.jp/21.0/ja_JP/server_admin/index.html#the-master-realm

<br>

### 認証認可の種類

#### ▼ OIDCの場合

- 認可コードフロー (標準フロー)
- 暗黙的フロー

> - https://www.keycloak.org/docs/latest/securing_apps/index.html#supported-grant-types

<br>

### 認証情報の伝播方法

#### ▼ クライアントシークレットの場合

記入中...

#### ▼ X509証明書の場合

記入中...

#### ▼ JWTの場合

Keycloakクライアントは、『ヘッダー』『ペイロード』『署名』のそれぞれのJSON型データを`base64`方式によってエンコードし、ドットでつなぐ。

これらの処理によって、JWTを作成する。

その後、Keycloakの認可エンドポイントにJWTを送信する。

> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#jwt-%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0
> - https://qiita.com/t-mogi/items/2728586959f16849443f#%E3%82%AF%E3%83%A9%E3%82%A4%E3%82%A2%E3%83%B3%E3%83%88%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E5%81%B4%E3%81%A7%E3%81%AE%E5%AF%BE%E5%BF%9C

<br>

### JWTとクライアントシークレットの場合

記入中...

<br>

### ユースケース

#### ▼ 認証マイクロサービスとして

記入中...

<br>

## 03. エンドポイント

### OIDC

#### ▼ 全体

全ての設定を取得できる。

```bash
/realms/<realm名>/.well-known/openid-configuration
```

```bash
$ curl https://<Keycloakのドメイン名>/realms/<realm名>/.well-known/openid-configuration

{
  "issuer": "https://<Keycloakのドメイン名>/realms/<realm名>",
  "authorization_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/auth",
  "token_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/token",
  "introspection_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/token/introspect",
  "userinfo_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/userinfo",
  "end_session_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/logout",
  "frontchannel_logout_session_supported": true,
  "frontchannel_logout_supported": true,
  "jwks_uri": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/certs",
  "check_session_iframe": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/login-status-iframe.html",
  "registration_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/clients-registrations/openid-connect",
  "revocation_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/revoke",
  "device_authorization_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/auth/device",
  "backchannel_authentication_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/ext/ciba/auth",
  "pushed_authorization_request_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/ext/par/request",
  "mtls_endpoint_aliases": {
    "token_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/token",
    "revocation_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/revoke",
    "introspection_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/token/introspect",
    "device_authorization_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/auth/device",
    "registration_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/clients-registrations/openid-connect",
    "userinfo_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/userinfo",
    "pushed_authorization_request_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/ext/par/request",
    "backchannel_authentication_endpoint": "https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/ext/ciba/auth"
  },

  ...

}
```

#### ▼ トークン

フローに応じたトークン (アクセストークン、IDトークン) や認可コードを取得できる。

なお、KeycloakはJWT仕様のアクセストークンを採用している。

```bash
/realms/<realm名>/protocol/openid-connect/token
```

> - https://www.keycloak.org/docs/latest/securing_apps/index.html#token-endpoint
> - https://thinkit.co.jp/article/17621

#### ▼ ログアウト

認証を意図的に失効させられる。

```bash
/realms/<realm名>/protocol/openid-connect/logout
```

> - https://www.keycloak.org/docs/latest/securing_apps/index.html#logout-endpoint

#### ▼ 公開鍵

認証が失効していないか、また不正でないかを検証できる。

```bash
/realms/<realm名>/protocol/openid-connect/certs
```

> - https://www.keycloak.org/docs/latest/securing_apps/index.html#_certificate_endpoint

#### ▼ イントロスペクション

```bash
/realms/<realm名>/protocol/openid-connect/token/introspect
```

> - https://www.keycloak.org/docs/latest/securing_apps/index.html#_token_introspection_endpoint

<br>
