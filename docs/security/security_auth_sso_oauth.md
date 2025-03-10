---
title: 【IT技術の知見】OAuth＠SSO
description: OAuth＠SSOの知見を記録しています。
---

# OAuth＠SSO

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OAuth

### OAuthとは

![oauth_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth_architecture.png)

SSOの一種であり、バージョンによって『OAuth 1.0』と『OAuth 2.0』がある。

認証/認可フェーズ全体の中で、認可フェーズにOAuthプロトコルを使用したクライアントの照合方法を『OAuth』と呼ぶ。

クライアントアプリで認証フェーズのみでログインし、連携先のアプリには認可フェーズのみでログインする。

OAuthは認可フェーズのみで構成されているため、間違っても『OAuth認証』とは言わない。

認証フェーズと認可フェーズでは、`3`個の役割が定義されていることを説明したが、OAuthでは、より具体的に`4`個の役割が定義されている。

| 要素               | フェーズ | 説明                                                                 | 補足                                                                                                                                                                                                                                                                                                                    |
| ------------------ | -------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| クライアントアプリ | 認証     | 連携元アカウントを提供するアプリケーションのこと。                   | OAuthの文脈では、ブラウザがクライアントと呼ばれないことに注意する。また、クライアントアプリとリソース間のデータ通信は、ブラウザを経由したリダイレクトによって実装することに注意する。                                                                                                                                   |
| リソースオーナー   | 認証     | クライアントアプリケーションを使用しているユーザーである。           |                                                                                                                                                                                                                                                                                                                         |
| 認可サーバー       | 認可     | リフレッシュトークンを含むアクセストークンを発行するサーバーのこと。 | 認可サーバーがリダイレクト先のクライアントアプリケーションのURLをレスポンスに割り当てられるように、クライアントアプリケーションの開発者がURLを事前登録しておく必要がある。認可サーバーを利用する開発者用に、コンソール画面が用意されていることが多い。<br>https://qiita.com/TakahikoKawasaki/items/8567c80528da43c7e844 |
| リソースサーバー   | 認可     | 連携先アカウントを提供するサーバーのこと。                           |                                                                                                                                                                                                                                                                                                                         |

> - https://ssaits.jp/promapedia/technology/oauth.html

<br>

### OAuthの種類

OAuthには、仕組み別に『認可コードフロー』『暗黙的フロー』『リソースオーナー・パスワード・クレデンシャルズフロー (ダイレクト・アクセス・グラント) 』などがある。

<br>

## 02. トークンの署名検証

### アクセストークンの署名検証

#### ▼JWT仕様の場合

アクセストークンの情報 (署名部分、有効期限、発行元認証局など) から、アクセストークンの有効性を検証できる。

> - https://qiita.com/nokonoko_1203/items/966dc356c3763136c368#%E6%A4%9C%E8%A8%BC%E3%81%A3%E3%81%A6%E3%81%AA%E3%81%AB%E3%82%92%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E3%81%AE

<br>

## 03. OIDCとの違い

### トークンの違い

OIDCはOAuthの拡張であるため、仕組みは非常に似ている。

OAuthでは、OIDCとは異なり、アクセストークン (JWT仕様かどうかはツール次第) のみを使用する。

OAuthには脆弱性があるが、OIDCであればこれに対処できる。

![oidc_vs_oauth](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oidc_vs_oauth.png)

> - https://qiita.com/TakahikoKawasaki/items/498ca08bbfcc341691fe
> - https://dev.classmethod.jp/articles/auth0-access-token-id-token-difference/#toc-2
> - https://zenn.dev/uma002/articles/152fcef798730b#%E3%81%AA%E3%81%9C%E8%84%86%E5%BC%B1%E6%80%A7%E3%81%8C%E7%94%9F%E3%81%BE%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>

## 04. 使用される認証スキーム

OAuthでは、認証スキーマとしてBearer認証が選択されることが多く、AWSやGitHubは、独自の認証スキームを使用している。

注意点として、認可サーバーによって発行されたBearerトークンは、`Authorization`ヘッダー、リクエストボディ、クエリパラメーターのいずれかに割り当てて送信できる。

<br>

## 05. 付与タイプ

### 付与タイプの種類

認可サーバーによるOAuthのアクセストークンの付与方法には種類がある。

| 付与タイプ名             | 説明                                                                                                                                                                                                                                    | 使用例                                                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorization Code Grant | アプリケーションが他のAPIに接続する場合に使用する。推奨である。<br>https://oauth.net/2/grant-types/authorization-code/                                                                                                                  | 他のSNSアプリとのアカウント連携                                                                                                                       |
| Client Credentials Grant | 推奨である。<br>https://oauth.net/2/grant-types/client-credentials/                                                                                                                                                                     |                                                                                                                                                       |
| Device Code              | 推奨である。<br>https://oauth.net/2/grant-types/device-code/                                                                                                                                                                            |                                                                                                                                                       |
| Implicit Grant           | 非推奨である。<br>https://oauth.net/2/grant-types/implicit/                                                                                                                                                                             |                                                                                                                                                       |
| Password Grant           | ユーザー名とパスワードを照合し、アクセストークンを付与する。非推奨である。<br>・https://oauth.net/2/grant-types/password/<br>・https://developer.okta.com/blog/2018/06/29/what-is-the-oauth2-password-grant#the-oauth-20-password-grant | LaravelのPassword Grant Token機能は、Password Grantタイプを使用している。<br>https://readouble.com/laravel/8.x/ja/passport.html#password-grant-tokens |

> - https://oauth.net/2/grant-types/

<br>

## 06. 認可コードフロー

### 認可コードフローとは

リフレッシュトークンを含むアクセストークンを発行するために、短命な認可コードを発行する。

![oauth_authorization-code](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth_authorization-code.png)

> - https://cloudentity.com/developers/basics/oauth-grant-types/authorization-code-flow/
> - https://kb.authlete.com/ja/s/oauth-and-openid-connect/a/how-to-choose-the-appropriate-oauth-2-flow
> - https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f

<br>

### 例

#### ▼ 全体像

Facebookで認証フェーズのみでログインし、連携先の免許証作成サイトには認可フェーズのみでログインする。

OIDCではなくOAuthのため、IDトークンではなく、リフレッシュトークンを含むアクセストークンであることに注意する。

![oauth_authorization-code_facebook](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/oauth_authorization-code_facebook.png)

> - https://contents.saitolab.org/oauth/

#### ▼ ブラウザ ⇄ SSOでログインしたいWebサイト

`(1)`

: ブラウザは、免許証作成サイトにログインしようとする。

     免許証作成サイトは、Facebookアカウントを使用するかどうかをレスポンスする。

`(2)`

: ブラウザは、Facebookアカウントを使用することをリクエストする。

     免許証作成サイトは、Facebookの認可サーバーの認可エンドポイントに、認可リクエストを送信する。

```yaml
# 認可エンドポイントに認可リクエストを送信する
GET https://www.facebook.com/auth?<下表で説明>
---
HOST: authorization-server.com # 認可サーバーのホスト
```

| クエリストリングの種類 | 値                   | 例                              | 認可リクエスト時に必須/任意 |
| ---------------------- | -------------------- | ------------------------------- | --------------------------- |
| `response_type`        | 認可レスポンスの種類 | `code` (認可コードフローの場合) | 必須                        |
| `client_id`            | クライアントID       | `foo-client`                    | 必須                        |
| `redirect_uri`         | リダイレクトURL      | `https://example.com/callback`  | 条件により必須              |
| `state`                | 任意の文字列         |                                 | 推奨                        |
| `scope`                | クレームグループ     | `openid profile email`          | 任意                        |
| `code_challenge`       | チャレンジ           |                                 | 任意                        |
| `code_challege_method` | メソッド             |                                 | 任意                        |

> - https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#11-%E8%AA%8D%E5%8F%AF%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%B8%E3%81%AE%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88

`(3)`

: ブラウザにアカウント連携画面 (認可画面) をレスポンスする。

#### ▼ ブラウザ ⇄ 認証フェーズの委譲先のWebサイト

`(4)`

: ブラウザで、アカウント連携画面 (認可画面) に情報を入力し、Facebookに送信する。

`(5)`

: Facebookの認可サーバーは、短命な認可コードを発行する。

     `Location`ヘッダーにリダイレクト先のURL (免許証作成サイトURL) とパラメーターを割り当て、認可レスポンスをブラウザに送信する。

     認可レスポンスにより、リダイレクトが起こる。

     リダイレクト先として指定するURLは、『コールバックURL』ともいう。

```yaml
302 Found
---
Location: https://www.免許証作成サイト.com/callback?code=<認可コード>&state=<任意の文字列>
```

| クエリストリングのキーの種類 | 値           | 例  | 必須/任意                                                             |
| ---------------------------- | ------------ | --- | --------------------------------------------------------------------- |
| `code`                       | 認可コード   |     | 必須                                                                  |
| `state`                      | 任意の文字列 |     | 認可リクエストのクエリストリングで、`state`キーが使用されていれば必須 |

> - https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#12-%E8%AA%8D%E5%8F%AF%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%8B%E3%82%89%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9

#### ▼ ブラウザ ⇄ SSOでログインしたいWebサイト ⇄ 認証フェーズの委譲先のWebサイト

`(6)`

: ブラウザでリダイレクトが発生し、免許証作成サイトに短命な認可コードを送信する。

`(7)`

: 免許証作成サイトは、Facebookの認可サーバーのトークンエンドポイントにトークンリクエストを送信する。

```yaml
# トークンエンドポイントにトークンリクエストを送信する
POST https://www.facebook.com/auth?
---
Host: authorization-server.com # 認可サーバーのホスト
Content-Type: application/x-www-form-urlencoded
---
# ボディ
# 下表で説明
```

| ボディのキーの種類 | 値                       | 例                             | トークンリクエスト時に必須/任意                                                         |
| ------------------ | ------------------------ | ------------------------------ | --------------------------------------------------------------------------------------- |
| `grant_type`       | 認証方法の種類           | `authorization_code`           | 必須                                                                                    |
| `code`             | 認可コード               | `*****`                        | 必須                                                                                    |
| `redirect_uri`     | リダイレクトURL          | `https://example.com/callback` | 認可リクエストのクエリストリングで、`redirect_uri`キーが使用されていれば、必須である。  |
| `code_verifier`    | ベリファイア             |                                | 認可リクエストのクエリストリングで、`code_verifier`キーが使用されていれば、必須である。 |
| `client_id`        | クライアントID           | `foo-client`                   | 条件により必須                                                                          |
| `client_secret`    | クライアントシークレット | `*****`                        | 条件により必須                                                                          |

> - https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#13-%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%B8%E3%81%AE%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88

`(8)`

: Facebookの認可サーバーは、アクセストークンを含むトークンレスポンスを免許証作成サイトに返信する。

`(9)`

: 免許証作成サイトはアクセストークンを受信し、Facebookの認可サーバーにアクセストークンを再度送信する。

```yaml
HTTP/1.1 200 OK
---
# ヘッダー
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache
---
# ボディ
{
  "access_token": "<アクセストークン>", # 必須
  "token_type": " <トークンタイプ>", # 必須
  "expires_in": <失効秒数>, # 任意
  "refresh_token": "<リフレッシュトークン>", # 任意
  "scope": "<認可スコープ>", # 要求したスコープ群と差異があれば必須
}
```

> - https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#14-%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%8B%E3%82%89%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9

`(10)`

: Facebookは認証を完了させ、Facebookの認証情報を送信する。

`(11)`

: 免許証作成サイトは認可を実施し、Facebookの認証情報の権限に応じた処理をクライアントに提供する。

<br>

## 07. 暗黙的フロー (インプリシットフロー)

### 暗黙的フローとは

アクセストークンを直接的に発行する。

また、リフレッシュトークンを発行しない。

> - https://cloudentity.com/developers/basics/oauth-grant-types/implicit-flow/
> - https://www.authlete.com/ja/kb/oauth-and-openid-connect/grant-type/how-to-choose-the-appropriate-oauth-2-flow/

<br>

## 08. リフレッシュトークンフロー

### リフレッシュトークンフローとは

アクセストークンの失効期限をリフレッシュトークンで管理する方法である。

> - https://cloudentity.com/developers/basics/oauth-grant-types/refresh-token-flow/
> - https://qiita.com/TakahikoKawasaki/items/185d34814eb9f7ac7ef3#1-oauth-20-rfc-6749

<br>
