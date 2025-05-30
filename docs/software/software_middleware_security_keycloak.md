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

アプリケーションに代わって、認証／認可処理を実行する。

認証／認可に関するAPIを公開し、認証時のアカウントのCRUDや、認可時のアカウントに対する権限スコープ付与を実行できる。

> - https://www.keycloak.org/docs-api/22.0.1/rest-api/index.html
> - https://blog.linkode.co.jp/entry/2023/08/23/000000

<br>

## 01-02. Keycloakの仕組み

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

### RDBMS

セッションデータを保管する。

<br>

## 01-03. Keycloakの拡張性設計

### クラスタリング設計

Keycloakでは、クラスタリング構成を使用できる。

Keycloakクラスターでは、JGroupsはInfinispanクラスターインスタンス間でレプリケーション通信 (例：PING、TCPPING、JDBC_PING、DNS_PING、KUBE_PINGなど) を実施する。

レプリケーション通信によって、Keycloakクラスター内のInfinispanクラスターインスタンス間でセッションデータを同期する。

![keycloak_clustering](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_clustering.png)

> - https://www.keycloak.org/2019/05/keycloak-cluster-setup
> - https://qiita.com/yoonis/items/4f4a9df0f6f8e858bd4a#keycloak%E5%86%97%E9%95%B7%E6%A7%8B%E6%88%90%E3%81%AE%E6%A6%82%E8%A6%81
> - https://qiita.com/t-mogi/items/ba38a614c1637a8aef93#jgroups-%E3%81%AE-discovery-%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB

<br>

### クラスターインスタンス検出方法

#### ▼ TCPPING

固定されたIPとポート番号を宛先情報として使用する。

`7800`番ポート (以前は`7600`番だった) を使用し、TCPプロトコルのレプリケーション通信を実施する。

> - https://www.keycloak.org/2019/05/keycloak-cluster-setup
> - https://qiita.com/t-mogi/items/ba38a614c1637a8aef93#jgroups-%E3%81%AE-discovery-%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB

#### ▼ JDBC_PING

動的なIPアドレスとポート番号を宛先情報として使用する。

クラスターインスタンスは自身の宛先情報をサービスレジストリに登録する (セルフ登録パターン) 。

`7800`番 (以前は`7600`番だった) と`57800`番のポートを使用し、TCPプロトコルのレプリケーション通信を実施する。

> - https://www.keycloak.org/2019/05/keycloak-cluster-setup
> - https://qiita.com/t-mogi/items/ba38a614c1637a8aef93#jgroups-%E3%81%AE-discovery-%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB
> - https://www.keycloak.org/server/caching#_network_ports

#### ▼ DNS_PING

ドメインレジストラ (例：CoreDNS) 内のAレコードやSVCレコードを宛先情報として使用する。

ドメインレジストラはクラスターインスタンスの宛先情報をサービスレジストリに登録する (サードパーティ登録パターン) 。

`7800`番ポート (以前は`7600`番だった) を使用し、TCPプロトコルのレプリケーション通信を実施する。

- Kubernetes環境でHeadless Serviceを作成する
- Keycloakの環境変数を設定する
  - KC_CACHE_STACK=kubernetes
  - JAVA_OPTS_APPEND=-Djgroups.dns.query=<Headless ServiceのDNS名>

> - https://openstandia.jp/tech/column/ac_keycloak20231216/
> - https://qiita.com/t-mogi/items/ba38a614c1637a8aef93#jgroups-%E3%81%AE-discovery-%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB

#### ▼ KUBE_PING

サービスレジストリ (例：Etcd) 内の宛先情報として使用する。

> - https://qiita.com/t-mogi/items/ba38a614c1637a8aef93#jgroups-%E3%81%AE-discovery-%E3%83%97%E3%83%AD%E3%83%88%E3%82%B3%E3%83%AB
> - https://github.com/jgroups-extras/jgroups-kubernetes

<br>

### パフォーマンス設計

#### ▼ パフォーマンス設計

KeycloakはCPUとメモリを使用する。

> - https://docs.redhat.com/en/documentation/red_hat_build_of_keycloak/24.0/html/high_availability_guide/concepts-memory-and-cpu-sizing-#concepts-memory-and-cpu-sizing-calculation-example
> - https://qiita.com/takashyan/items/16b9277daeba5fcdca33#%E3%82%B5%E3%82%A4%E3%82%B8%E3%83%B3%E3%82%B0%E5%9F%BA%E7%A4%8E%E5%80%A4%E3%81%AE%E9%A0%85%E7%9B%AE

#### ▼ CPU

最大リクエスト数 (1秒間にどのくらいのリクエストを処理できるのか) に影響する。

**設定例**

- 1秒あたり24回のログインリクエスト ➡️ 3 vCPU
- 1秒あたり450回のクライアント資格情報の付与処理 ➡️ 1 vCPU
- 350回のリクエストのリフレッシュトークン ➡️ 1 vCPU

> - https://docs.redhat.com/en/documentation/red_hat_build_of_keycloak/24.0/html/high_availability_guide/concepts-memory-and-cpu-sizing-#concepts-memory-and-cpu-sizing-calculation-example
> - https://qiita.com/takashyan/items/16b9277daeba5fcdca33#%E3%82%B5%E3%82%A4%E3%82%B8%E3%83%B3%E3%82%B0%E5%9F%BA%E7%A4%8E%E5%80%A4%E3%81%AE%E9%A0%85%E7%9B%AE

#### ▼ メモリ

最大セッション数 (最大何人が同時にログイン状態になれるのか) に影響する。

**設定例**

1000 MBを設定し、余剰分を増設する。

- 50000のアクティブセッション用 ➡️ 余剰 250 MB

> - https://docs.redhat.com/en/documentation/red_hat_build_of_keycloak/24.0/html/high_availability_guide/concepts-memory-and-cpu-sizing-#concepts-memory-and-cpu-sizing-calculation-example
> - https://qiita.com/takashyan/items/16b9277daeba5fcdca33#%E3%82%B5%E3%82%A4%E3%82%B8%E3%83%B3%E3%82%B0%E5%9F%BA%E7%A4%8E%E5%80%A4%E3%81%AE%E9%A0%85%E7%9B%AE

<br>

## 02. SSO

### SSOの種類

#### ▼ OIDCの場合

- 認可コードフロー (標準フロー)
- 暗黙的フロー

> - https://www.keycloak.org/docs/latest/securing_apps/index.html#supported-grant-types

<br>

## 02-02. 認証

### Realm

Keycloakでは、Adminアカウントの認証はmaster realmで、それ以外はユーザー定義のrealm、で管理する。

master realmでログイン後、ユーザー定義のrealmを作成すると良い。

> - https://keycloak-documentation.openstandia.jp/21.0/ja_JP/server_admin/index.html#the-master-realm

<br>

### 認証アーティファクトの伝播方法

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

### セッション、Cookie、アクセストークンの有効期限

#### ▼ OIDCの場合

| 項目                           | 説明                                                               |
| ------------------------------ | ------------------------------------------------------------------ |
| SSOのセッションアイドル        | ブラウザを操作しなかった場合に、再認証が必要になる有効期限を表す、 |
| アクセストークンのライフスパン | OIDCのアクセストークンの有効期限を表す。                           |

> - https://docs.redhat.com/en/documentation/red_hat_build_of_keycloak/24.0/html/server_administration_guide/managing_user_sessions#timeouts

<br>

## 02-03. 認可

### リソース

認可スコープの適用するエンドポイントを設定する。

![keycloak_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_authorization.png)

> - https://atmarkit.itmedia.co.jp/ait/articles/1904/03/news003.html
> - https://qiita.com/m-masataka/items/e99cb38fc995d40b680b#%E8%AA%8D%E5%8F%AF%E8%A8%AD%E5%AE%9A

<br>

### パーミッション

リソースとポリシーの紐付けを設定する。

![keycloak_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_authorization.png)

> - https://atmarkit.itmedia.co.jp/ait/articles/1904/03/news003.html
> - https://qiita.com/m-masataka/items/e99cb38fc995d40b680b#%E3%83%91%E3%83%BC%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E5%AE%9A%E7%BE%A9

<br>

### ポリシー

認可スコープを設定する。

![keycloak_authorization](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/keycloak_authorization.png)

> - https://atmarkit.itmedia.co.jp/ait/articles/1904/03/news003.html
> - https://qiita.com/m-masataka/items/e99cb38fc995d40b680b#%E3%83%9D%E3%83%AA%E3%82%B7%E3%83%BC%E3%81%AE%E5%AE%9A%E7%BE%A9

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

JWTトークンの発行元IDプロバイダーの識別子である。

クライアント側では`authority`値として指定する。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>
```

> - https://datatracker.ietf.org/doc/html/rfc8414#section-2

#### ▼ /auth (認可エンドポイント)

アプリケーションがブラウザ経由で接続するエンドポイントである。

Keycloakの他のエンドポイントとは異なり、インターネットから接続できるように公開する必要がある。

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/auth
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints

#### ▼ /certs (JWKsエンドポイント)

アクセストークンの署名を検証する。

(イントロスペクションエンドポイントとの違いがややこしい)

```bash
GET https://<Keycloakのドメイン名>/realms/<realm名>/protocol/openid-connect/certs
```

> - https://www.keycloak.org/securing-apps/oidc-layers#_endpoints

#### ▼ /introspect (イントロスペクションエンドポイント)

アクセストークンの有効期限が失効しているかどうかを検証する。

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

POSTリクエストには、JWTトークン (たぶんIDトークン) が含まれている。

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
