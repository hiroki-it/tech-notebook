---
title: 【IT技術の知見】OIDC＠SSO
description: OIDC＠SSOの知見を記録しています。
---

# OIDC＠SSO

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OIDC：OpenID Connect (外部ID連携)

### OIDCとは

SSOの一種である。

OAuthをベースとして、認証フェーズを追加し、認証/認可を実装する。

そのため、OAuthの一種ともいえる。

> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

<br>

## 02. OIDCの仕組み

### アーキテクチャ

認証フェーズの委譲先のIDプロバイダー、ログインしたいWebサイト、から構成される。

> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

<br>

### クレーム

クレームは認証情報の要素である。

委譲元のクライアントは、IDプロバイダーから取得したクレームを認証情報として扱い、認可処理を実行する。

| クレーム  | 説明                        |
| --------- | --------------------------- |
| `sub`     | アカウントの識別子          |
| `profile` | アカウントのプロフィールURL |
| `name`    | アカウントの氏名            |
| `email`   | アカウントのメールアドレス  |
| `phone`   | アカウントの電話番号        |
| `address` | アカウントの住所            |
| ...       | ...                         |

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim

<br>

### 認可リクエスト時のクレームの取得

#### ▼ `scope`パラメーター

認可リクエスト時に、`scope`パラメーターでクレームグループを指定し、IDプロバイダーからクレームを取得できる。

IDプロバイダーは、取得したクレームグループに対応したクレームをIDトークンに設定し、クライアントに返信する。

委譲元のクライアントは、取得したクレームを認証情報として扱い、認可処理を実行する。

| クレームグループ               | 取得できるクレーム (認証情報の要素)                                                                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openid`                       | これは、OIDCの場合に必須である。トークンエンドポイントから、アクセストークンに加えてIDトークンを発行できるようになる。                                                           |
| `profile`                      | `name`、`family_name`、`given_name`、`middle_name`、`nickname`、`preferred_username`、`profile`、`picture`、`website`、`gender`、`birthdate`、`zoneinfo`、`locale`、`updated_at` |
| `email`                        | `email`、`email_verified`                                                                                                                                                        |
| `phone`                        | `address`                                                                                                                                                                        |
| `address`                      | `phone_number`、`phone_number_verified`                                                                                                                                          |
| ユーザー定義のクレームグループ | 自由にクレームを設定できる                                                                                                                                                       |

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim
> - https://openid.net/specs/openid-connect-core-1_0.html#ScopeClaims

#### ▼ `claims`パラメーター

認可リクエスト時に、`claims`パラメーターで特定のクレームを指定し、クレームを取得できる。

クレームの指定の仕方が複雑らしい...

> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#15-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0-claim
> - https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter

<br>

## 03. トークンの検証

### IDトークン検証

アクセストークンの発行前に、IDトークンの有効期限や発行元認証局が正しいかどうかを検証する。

<br>

### アクセストークン検証

発行後のアクセストークンが有効期限や発行元認証局が正しいかどうかを定期的に検証する。

以下のいずれかの方法で検証できる。

- 認可サーバーのイントロスペクションエンドポイントにリクエストする
- 認可サーバーから取得した公開鍵を使用して、アクセストークンの署名を検証する

> - https://zenn.dev/ringo_to/articles/5cf471e5e48b9a#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E6%A4%9C%E8%A8%BC%E6%96%B9%E6%B3%95%E3%81%AB%E3%81%AF%E4%BA%8C%E3%81%A4%E3%81%AE%E6%96%B9%E6%B3%95%E3%81%8C%E3%81%82%E3%82%8B

<br>

## 04. OIDCの種類

ベースになっているOAuthと同様にして、OIDCには仕組み別に『認可コードフロー』『暗黙的フロー』『リソースオーナー・パスワード・クレデンシャルズフロー (ダイレクト・アクセス・グラント) 』などがある。

<br>

## 05. OAuthとの違い

### トークンの違い

OIDCはOAuthの拡張であるため、仕組みは非常に似ている。

OIDCでは、OAuthとは異なり、アクセストークン (JWT仕様かどうかはツール次第) だけでなくIDトークン (必ずJWT仕様) の使用する。

また、OAuthの脆弱性に対処できる。

![oidc_vs_oauth](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oidc_vs_oauth.png)

> - https://auth0.com/jp/intro-to-iam/what-is-oauth-2
> - https://qiita.com/TakahikoKawasaki/items/498ca08bbfcc341691fe
> - https://dev.classmethod.jp/articles/auth0-access-token-id-token-difference/#toc-3
> - https://zenn.dev/uma002/articles/152fcef798730b#%E3%81%AA%E3%81%9C%E8%84%86%E5%BC%B1%E6%80%A7%E3%81%8C%E7%94%9F%E3%81%BE%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>

## 06. 認可コードフロー

### 仕組み

OAuthの認可コードフローと仕組みが似ており、アクセストークンだけでなくIDトークンも使用する。

短命な認可コードを送信すると、IDプロバイダーからリフレッシュトークンを含むアクセストークンとIDトークンを取得できる。

![oidc_codeflow](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oidc_codeflow.jpeg)

> - https://wagby.com/wdn8/juser-oidc.html
> - https://qiita.com/nabeatsu/items/380058915629c0ce795e#authorization-code-%E3%83%95%E3%83%AD%E3%83%BC
> - https://ysyau.medium.com/spa-and-rest-api-application-friendly-oauth-2-0-oidc-login-flow-80ba927ff47d

<br>

### Keycloakの場合

#### ▼ 認可リクエスト送信

アプリからKeycloakに宛に認可リクエストを送信する。

```bash
$ curl http://<Keycloakのドメイン>/realms/oidc-sample/protocol/openid-connect/auth?response_type=code&client_id=rp1&redirect_uri=http://<アプリのドメイン>/oidc&scope=openid
```

> - https://qiita.com/t_okkan/items/3478191bbff888a54235#authorization-code-flow

#### ▼ 認可レスポンス受信

認可レスポンスを受信し、アプリに対してリダイレクトを送信する。

```bash
$ curl http://<アプリのドメイン>/oidc?session_state= ... &code=<認証コード>
```

> - https://qiita.com/t_okkan/items/3478191bbff888a54235#authorization-code-flow

#### ▼ トークンリクエスト送信

認可コードを使用して、Keycloakにトークンリクエストを送信する。

IDトークンとアクセストークンを取得できる。

```bash
$ curl -d "grant_type=authorization_code&code=<認証コード>&redirect_uri=http://<アプリのドメイン>/oidc&client_id=rp1&client_secret=<Client secret>" http://<Keycloakのドメイン>/realms/oidc-sample/protocol/openid-connect/token

{
  "access_token": <アクセストークン>,
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": <リフレッシュトークン>,
  "token_type": "Bearer",
  "id_token": <IDトークン>,
  "not-before-policy": 0,
  "session_state": "8468db1c-feb4-4803-bfeb-213149b560cf",
  "scope": "openid email profile"
}
```

> - https://qiita.com/t_okkan/items/3478191bbff888a54235#authorization-code-flow

#### ▼ ユーザー情報の取得

```bash
$ curl -H "Authorization: Bearer <アクセストークン>" http://<Keycloakのドメイン>/realms/oidc-sample/protocol/openid-connect/userinfo

{
  "sub": <User ID>,
  "email_verified": false,
  "preferred_username": "admin",
  "given_name": "",
  "family_name": ""
}
```

> - https://qiita.com/t_okkan/items/3478191bbff888a54235#authorization-code-flow

#### ▼ アクセストークンの再作成

リフレッシュトークンを使用して、アクセストークンを再作成する。

```bash
$ curl -X POST -d "client_id=rp1&client_secret=<Client Secret>&grant_type=refresh_token&refresh_token=<リフレッシュトークン>&scope=openid profile" http://<Keycloakのドメイン>/realms/oidc-sample/protocol/openid-connect/token
```

> - https://qiita.com/t_okkan/items/3478191bbff888a54235#authorization-code-flow

<br>

### 運搬

アクセストークンを`Authorization`ヘッダーで運べる。

> - https://github.com/oauth2-proxy/oauth2-proxy/issues/843

<br>

## 07. SLO：シングルログアウト

### シングルログアウトとは

SSOをログアウトする仕組みのこと。

複数の方式を組み合わせてSSOをログアウトする。

<br>

### RP-Initiated

#### ▼ シングル

> - https://zenn.dev/putcho/articles/61bd31a33f8441#rp-initiated-logout

#### ▼ グローバル

記入中...

<br>

### フロントチャネル

#### ▼ シングル

> - https://zenn.dev/putcho/articles/61bd31a33f8441#oidc-%E3%81%AE-%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E9%96%A2%E9%80%A3%E3%81%AE%E4%BB%95%E6%A7%98

#### ▼ グローバル

フロントエンドのブラウザが、IDプロバイダーのログアウトエンドポイント (`<IDプロバイダーのドメイン>/<IDプロバイダーによる>`) にPOSTリクエストを送信し、全てのアプリケーションからログアウトする。

> - https://auth0.com/blog/jp-the-not-so-easy-art-of-logging-out/#--------
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#%E5%90%84%E8%B5%B7%E7%82%B9%E3%81%94%E3%81%A8%E3%81%AEslo%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

<br>

### バックチャネル

#### ▼ シングル

> - https://zenn.dev/putcho/articles/61bd31a33f8441#oidc-%E3%81%AE-%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E9%96%A2%E9%80%A3%E3%81%AE%E4%BB%95%E6%A7%98

#### ▼ グローバル

IDプロバイダーが、バックエンドのいずれかのアプリケーションのログアウトエンドポイント (`<アプリケーションのドメイン>/<IDプロバイダーのクライアントパッケージによる>`) にPOSTリクエストを送信し、そのアプリケーションでログアウト処理を実行する。

セッションデータが失効し、バックエンドのアプリケーションが起点となってログアウト処理を始める場合、それはバックチャネルである。

また、フロントエンドのブラウザがバックエンドのアプリケーションにログアウトリクエストを送信し、これが起点となる場合もバックチャネルである。

> - https://auth0.com/blog/jp-the-not-so-easy-art-of-logging-out/#--------
> - https://qiita.com/yagiaoskywalker/items/2e73fdc3976190e8b7ad#%E5%90%84%E8%B5%B7%E7%82%B9%E3%81%94%E3%81%A8%E3%81%AEslo%E3%82%B7%E3%83%BC%E3%82%B1%E3%83%B3%E3%82%B9%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6

<br>
