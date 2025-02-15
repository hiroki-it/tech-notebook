---
title: 【IT技術の知見】Keycloak＠セキュリティ系ミドルウェア
description: Keycloak＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Keycloak＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたする。

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

### 認証処理サービス

IDプロバイダーとして、DBからセッションデータを取得し、認証処理を実施する。

<br>

### Infinispan

Keycloakからセッションデータを取得し、DBに永続化する。

<br>

### クラスタリング

Keycloakでは、クラスタリング構成を使用できる。

Keycloakクラスターでは、JGroupsはInfinispanインスタンス間でレプリケーション通信 (例：JDBC Ping) を実施する。

レプリケーション通信によって、Keycloakクラスター内のInfinispanインスタンス間でセッションデータを同期する。

![keycloak_clustering](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_clustering.png)

> - https://qiita.com/yoonis/items/4f4a9df0f6f8e858bd4a#keycloak%E5%86%97%E9%95%B7%E6%A7%8B%E6%88%90%E3%81%AE%E6%A6%82%E8%A6%81
> - https://qiita.com/yo-tabata/items/6d29795fc3afa72d1b08#keycloakx%E3%81%AE%E3%82%A4%E3%83%B3%E3%82%B9%E3%82%BF%E3%83%B3%E3%82%B9%E9%96%93%E9%80%9A%E4%BF%A1%E3%82%92tcp%E3%81%AB%E8%A8%AD%E5%AE%9A%E3%81%99%E3%82%8B

<br>

### RDBMS

セッションデータを保管する。

<br>

## 02. 認証認可

### Realm

Keycloakでは、Adminユーザーの認証はmaster realmで、それ以外はユーザー定義のrealm、で管理する。

master realmでログイン後、ユーザー定義のrealmを作成すると良い。

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

#### ▼ ディスカバリーエンドポイント

全ての設定を取得できる。

事前に作成したユーザー定義のrealmを設定する。

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

#### ▼ / (issuerエンドポイント)

JWTの発行元認証局を取得できる。

クライアント側では`authority`値として指定する。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>
```

> - https://dev.classmethod.jp/articles/openidconnect-devio2023/#P.24%2520React%25E5%2581%25B4%25E3%2581%25AE%25E8%25A8%25AD%25E5%25AE%259A%25E5%2586%2585%25E5%25AE%25B9%25E7%25A2%25BA%25E8%25AA%258D

#### ▼ /auth (認可エンドポイント)

アプリケーションがブラウザ経由で接続するエンドポイントである。

Keycloakの他のエンドポイントとは異なり、インターネットから接続できるように公開する必要がある。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/auth
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints

#### ▼ /certs (JWKsエンドポイント)

アクセストークンが署名されたものかどうかを検証する。

(イントロスペクションエンドポイントとの違いがややこしい)

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/certs
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints

#### ▼ /introspect (イントロスペクションエンドポイント)

署名されたアクセストークンの有効期限が失効しているかどうかを検証する。

(JWKsエンドポイントとの違いがややこしい)

```bash
POST https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/token/introspect
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints

#### ▼ /token

フローに応じたトークン (アクセストークン、IDトークン) や認可コードを取得できる。

また、Token Exchangeを使用すると新しいトークンに交換したり、別のIDプロバイダーのトークンに変換できる。

なお、KeycloakはJWT仕様のアクセストークンを採用している。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/token
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints
> - https://thinkit.co.jp/article/17621
> - https://www.keycloak.org/securing-apps/token-exchange

#### ▼ /userinfo

クレームを取得できる。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/userinfo
```

#### ▼ /logout

認証を意図的に無効化する。

フロントチャネルとバックチャネルのエンドポイントがある。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/logout?id_token_hint=<IDトークン>&post_logout_redirect_uri=<クライアントシークレット>

# state、ui_locakesが必要な場合もある
```

```bash
POST https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/logout?client_id=<クライアントID>&client_secret=<クライアントシークレット>&refresh_token=<リフレッシュトークン>
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints
> - https://gist.github.com/thomasdarimont/145dc9aa857b831ff2eff221b79d179a?permalink_comment_id=4884254#gistcomment-4884254
> - https://qiita.com/suke_masa/items/e04880c5cf7232b60004
> - https://qiita.com/i7a7467/items/b7eaa2deb0378fc3b2aa

<br>

## 04. SLO：シングルログアウト

### バックチャネル

#### ▼ IDプロバイダーへのリクエスト

アプリケーションは、IDプロバイダーのログアウトエンドポイント (`/logout`) にPOSTリクエストを送信する。

```yaml
# リクエスト
# IDプロバイダーのログアウトエンドポイント
POST /realms/<realm名>/protocol/openid-connect/logout HTTP/1.1
---
Host: <Keycloakのドメイン名>
Content-Type: application/x-www-form-urlencoded
Content-Length: 759
---
client_id=python-client&client_secret=a07f9...8213d1&refresh_token=eyJhbGci...twOA
```

| パラメーター    | 説明                     |
| --------------- | ------------------------ |
| `client_id`     | クライアントID           |
| `client_secret` | クライアントシークレット |
| `refresh_token` | リフレッシュトークン     |

> - https://qiita.com/KWS_0901/items/7ad9794b344823221710#%E3%83%95%E3%83%AD%E3%83%B3%E3%83%88%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB-%E3%83%AD%E3%82%B0%E3%82%A2%E3%82%A6%E3%83%88
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#%E5%90%84%E8%B5%B7%E7%82%B9%E3%81%94%E3%81%A8%E3%81%AEslo%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ アプリケーションへのリクエスト

IDプロバイダーは、バックエンドアプリケーションのバックチャネルログアウトエンドポイント (`/k_logout`) にPOSTリクエストを送信する。

全てのアプリケーションに対して、この処理を繰り返す。

```yaml
# リクエスト
# バックエンドアプリケーションのバックチャネルログアウトエンドポイント
POST /k_logout HTTP/1.1
---
Host: localhost:8000
Content-Type: application/x-www-form-urlencoded
Content-Length: 759
---
logout_token=eyJhbGciOiJSUzI1NiIs...zspo4weMQfU-1jL0DxSg
```

POSTリクエストには、JWT仕様のトークン (たぶんIDトークン) が含まれている。

IDトークンには、アプリケーション間で共有しているクライアントのセッションIDが含まれてする。

Keycloakは、このセッションIDでログアウトすべきクライアントを判定し、認証処理を実行する。

```yaml
{
  "id": "edfd2bf0-1f2d-4875-a4b1-2752caa07ee1-1606363972255",
  "expiration": 1606364002,
  "resource": "kc-tomcat",
  "action": "LOGOUT",
  # アプリケーション間で共有しているクライアントのセッションID
  "adapterSessionIds": ["FC60BED115518DFB043EDDB77F0E0A8E"],
  "notBefore": 0,
  "keycloakSessionIds": ["ac04ef9d-7793-481c-a5c7-5750560e3c14"],
}
```

> - https://qiita.com/KWS_0901/items/7ad9794b344823221710#%E3%81%9D%E3%81%AE%E4%BB%96
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#k_logout-%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ IDプロバイダーからのレスポンス

IDプロバイダーのログアウトエンドポイントは、アプリケーションにレスポンスを送信する。

```yaml
# レスポンス
HTTP/1.1 204 No Content
```

> - https://qiita.com/KWS_0901/items/7ad9794b344823221710#%E3%83%90%E3%83%83%E3%82%AF%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB-%E3%83%AD%E3%82%B0%E3%82%A2%E3%82%A6%E3%83%88
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#%E5%90%84%E8%B5%B7%E7%82%B9%E3%81%94%E3%81%A8%E3%81%AEslo%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

<br>

### フロントチャネル

#### ▼ IDプロバイダーへのリクエスト

ブラウザは、IDプロバイダーのログアウトエンドポイント (`/logout`) にGETリクエストを送信する。

```yaml
# リクエスト
# IDプロバイダーのログアウトエンドポイント
GET http://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/logout?id_token_hint=eyJhbGciOiJS...RE2AZmGgKJAj-HlHw&post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fauth%2Flogout%2Fcomplete&state=e18689b0503aab42574427fb575645aca0065bb758aa8463acf4506fe8a61e81
```

| パラメーター               | 説明                          |
| -------------------------- | ----------------------------- |
| `id_token_hint`            | IDトークン                    |
| `post_logout_redirect_uri` | ログアウト後のリダイレクトURL |
| `state`                    | CSRF対策の文字列              |

> - https://qiita.com/KWS_0901/items/7ad9794b344823221710#%E3%83%95%E3%83%AD%E3%83%B3%E3%83%88%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB-%E3%83%AD%E3%82%B0%E3%82%A2%E3%82%A6%E3%83%88
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#%E5%90%84%E8%B5%B7%E7%82%B9%E3%81%94%E3%81%A8%E3%81%AEslo%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

#### ▼ IDプロバイダーからのレスポンス

IDプロバイダーのログアウトエンドポイントは、ブラウザにレスポンスを送信する。

```yaml
# レスポンス
HTTP/1.1 307 Temporary Redirect
http://localhost:8000/logout/complete?state=e18689b0503aab42574427fb575645aca0065bb758aa8463acf4506fe8a61e81
```

| パラメーター | 説明                                  |
| ------------ | ------------------------------------- |
| `state`      | リクエスト時の`state`パラメーターの値 |

> - https://qiita.com/KWS_0901/items/7ad9794b344823221710#%E3%83%95%E3%83%AD%E3%83%B3%E3%83%88%E3%83%81%E3%83%A3%E3%83%8D%E3%83%AB-%E3%83%AD%E3%82%B0%E3%82%A2%E3%82%A6%E3%83%88
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#%E5%90%84%E8%B5%B7%E7%82%B9%E3%81%94%E3%81%A8%E3%81%AEslo%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

<br>
