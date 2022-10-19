---
title: 【IT技術の知見】Authorization（認可）＠認証/認可
description: Authorization（認可）＠認証/認可の知見を記録しています。
---

# Authorization（認可）＠認証/認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 認可とは

認証済みのユーザーに対して、アクセス可能な権限範囲（認可スコープ）を付与する。

<br>

## 02. SSO：Single Sign On

### SSOとは

Webサイトごとに認証フェーズと認可フェーズを行うのではなく、認証フェーズは他のWebサイトに統一的に委譲し、認可フェーズだけはWebサイトごとに実施する。セキュリティ強度の向上というよりは、利便性の向上のために使用することが多い。そのため別途、二要素認証などと組み合わせて、セキュリティ強度を向上させた方が良い。二要素認証とSSOを組み合わせる場合、委譲先の外部の認証フェーズに二要素認証を追加することになる（例：GitHubアカウントを用いたSSO時に、ワンタイムパスワードの入力も要求される）。

> ℹ️ 参考：https://www.idnetworks.co.jp/wP/2014/04/04/sso-with-2fa/

<br>

### 認証フェーズと認可フェーズ

#### ▼ 仕組み

1. クライアントが、HTTPリクエストにIDとパスワードを設定してリクエスト。
2. IdP：Identity Providerが、IDを『認証』し、クライアント側にアクセストークンを発行。
3. クライアントが、HTTPリクエストのヘッダーにアクセストークンを設定してリクエスト。
4. アクセストークンが『認可』されれば、API側がデータをレスポンスする。

![sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/sso.jpg)

SSOには、認証フェーズと認可フェーズがあり、```3```個の役割が定義されている。

> ℹ️ 参考：https://japan.zdnet.com/article/35126144/

| 役割              | 説明                                                         | 例                                          |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------- |
| APIクライアント   | APIに対して、リクエストを送信したいサーバーのこと。          | Ouath認証の仕組みにおけるクライアント。     |
| Identity Provider | トークンを作成するサーバーのこと。                           | Ouath認証の仕組みにおける認可サーバー。     |
| APIサーバー       | クライアントに対して、リソースのレスポンスを送信するサーバーのこと。 | Ouath認証の仕組みにおけるリソースサーバー。 |

#### ▼ ステータスコード

認証フェーズにて、誤ったトークンが発行されたことを表現したい場合、```401```ステータスを使用する。認可フェーズにて、正しいトークンが発行されたが、トークンの所有者に参照権限がないことを表現したい場合、```403```ステータスを使用する。ステータスコードについては、以下のリンクを参考にせよ。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

#### ▼ 共通認証フェーズとして使用できるサービス

（例）

- Auth0
- Facebook
- GitHub
- GitLab
- Facebook

> ℹ️ 参考：https://speakerdeck.com/lmi/ginzarails-vol35-presentation?slide=25

![auth0_sso](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/auth0_sso.png)

<br>

## 02-02. SSOの種類

### OAuth

#### ▼ OAuthとは

![oauth_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/oauth_architecture.png)

認証/認可フェーズ全体の中で、認可フェーズにOAuthプロトコルを使用したクライアントの照合方法を『OAuth』と呼ぶ。クライアントアプリで認証フェーズのみでログインし、連携先のアプリには認可フェーズのみでログインする。OAuthは認可フェーズのみで構成されているため、間違っても『OAuth認証』とは言わない。認証フェーズと認可フェーズでは、```3```個の役割が定義されていることを説明したが、OAuthプロトコル```2.0```では、より具体的に```4```個の役割が定義されている。

> ℹ️ 参考：https://ssaits.jp/promapedia/technology/oauth.html#

| 要素               | フェーズ | 説明                                             | 補足                                                         |
| ------------------ | -------- | ------------------------------------------------ | ------------------------------------------------------------ |
| クライアントアプリ | 認証     | 連携元アカウントを提供するアプリのこと。         | OAuthの文脈では、ブラウザがクライアントと呼ばれないことに注意する。また、クライアントアプリとリソース間のデータ通信は、ブラウザを介したリダイレクトによって実現することに注意する。 |
| リソースオーナー   | 認証     | クライアントアプリを使用しているユーザーである。 |                                                              |
| 認可サーバー       | 認可     | アクセストークンを発行するサーバーのことoauth))  | 認可サーバーがリダイレクト先のクライアントアプリケーションのURLをレスポンスに割り当てられるように、クライアントアプリケーションの開発者がURLを事前登録しておく必要がある。認可サーバーを利用する開発者用に、コンソール画面が用意されていることが多い。<br>ℹ️ 参考：https://qiita.com/TakahikoKawasaki/items/8567c80528da43c7e844 |
| リソースサーバー   | 認可     | 連携先アカウントを提供するサーバーのこと。       |                                                              |

#### ▼ OAuthの種類

OAuthには、仕組み別に『認可コードフロー』『インプリシットフロー』『リソースオーナー・パスワード・クレデンシャルズフロー』などがある。

#### ▼ 認可コードフロー

![oauth_authorization-code](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/oauth_authorization-code.png)

最も基本的な認可コードフローを説明する。

> ℹ️ 参考：
>
> - https://kb.authlete.com/ja/s/oauth-and-openid-connect/a/how-to-choose-the-appropriate-oauth-2-flow
> - https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f

![oauth_authorization-code_facebook](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/oauth_authorization-code_facebook.png)

Facebookで認証フェーズのみでログインし、連携先の免許証作成サイトには認可フェーズのみでログインする。

> ℹ️ 参考：https://contents.saitolab.org/oauth/

（１）ブラウザは、免許証作成サイトにログインしようとする。免許証作成サイトは、Facebookアカウントを使用するかどうかをレスポンスする。

（２）ブラウザは、Facebookアカウントを使用することをリクエストする。免許証作成サイトはFacebookの認可サーバーに認可リクエストを送信する。

> ℹ️ 参考：https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#11-%E8%AA%8D%E5%8F%AF%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%B8%E3%81%AE%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88

```yaml
GET https://www.facebook.com/auth?<下表で説明>
---
HOST: authorization-server.com # 認可サーバーのホスト
```

| クエリストリングの種類 | 値              | 必須/任意      |
| ---------------------- | --------------- | -------------- |
| ```response_type```          | code            | 必須           |
| ```client_id```              | クライアントID  | 必須           |
| ```redirect_uri```           | リダイレクトURL | 条件により必須 |
| ```state```                  | 任意の文字列    | 推奨           |
| ```scope```                  | 認可スコープ    | 任意           |
| ```code_challenge```         | チャレンジ      | 任意           |
| ```code_challege_method```   | メソッド        | 任意           |

（３）ブラウザに認可画面（Facebookが権限を求めています画面）をレスポンスする。

（４）ブラウザで、認可画面に情報を入力し、Facebookに送信する。

（５）Facebookの認可サーバーは、認可コードを発行する。```Location```ヘッダーにリダイレクト先のURL（免許証作成サイトURL）とパラメーターを割り当て、認可レスポンスをブラウザに送信する。

> ℹ️ 参考：https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#12-%E8%AA%8D%E5%8F%AF%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%8B%E3%82%89%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9

```yaml
302 Found
---
Location: https://www.免許証作成サイト.com/login?<下表で説明>
```

| クエリストリングのキーの種類 | 値           | 必須/任意                                                    |
| ---------------------------- | ------------ | ------------------------------------------------------------ |
| ```code```                   | 認可コード   | 必須                                                         |
| ```state```                  | 任意の文字列 | 認可リクエストのクエリストリングで、```state```キーが使用されていれば必須 |

（６）ブラウザでリダイレクトが発生し、免許証作成サイトに認可コードを送信する。

（７）免許証作成サイトは、Facebookの認可サーバーに認可コードを送信する。

> ℹ️ 参考：https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#13-%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%B8%E3%81%AE%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88

```yaml
POST https://www.facebook.com/auth?
---
Host: authorization-server.com # 認可サーバーのホスト
Content-Type: application/x-www-form-urlencoded
---
# ボディ
# 下表で説明
```

| ボディのキーの種類  | 値                 | 必須/任意                                                    |
| ------------------- | ------------------ | ------------------------------------------------------------ |
| ```grant_type```    | authorization_code | 必須                                                         |
| ```code```          | 認可コード         | 必須                                                         |
| ```redirect_uri```  | リダイレクトURL    | 認可リクエストのクエリストリングで、```redirect_uri```キーが使用されていれば必須 |
| ```code_verifier``` | ベリファイア       | 認可リクエストのクエリストリングで、```code_verifier```キーが使用されていれば必須 |
| ```client_id```     | クライアントID     | 条件により必須                                               |
| ```client_secret``` | シークレット値     | 条件により必須                                               |

（８）Facebookの認可サーバーは、アクセストークンを免許証作成サイトに送信する。

（９）免許証作成サイトは、Facebookの認可サーバーにアクセストークンをそのまま送信する。

> ℹ️ 参考：https://qiita.com/TakahikoKawasaki/items/200951e5b5929f840a1f#14-%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%A8%E3%83%B3%E3%83%89%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%8B%E3%82%89%E3%81%AE%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9

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
  "access_token": "<アクセストークン>",       # 必須
  "token_type": " <トークンタイプ>",          # 必須
  "expires_in": <有効秒数>,                 # 任意
  "refresh_token": "<リフレッシュトークン>",  # 任意
  "scope": "<認可スコープ>"                  # 要求したスコープ群と差異があれば必須
}
```

（１０）Facebookは、免許証作成サイトを認可し、アカウント情報を送信する。

#### ▼ 使用される認証スキーム

OAuthでは、認証スキーマとしてBearer認証が選択されることが多く、AWSやGitHubは、独自の認証スキームを使用している。注意点として、認可サーバーによって発行されたBearerトークンは、```Authorization```ヘッダー、リクエストボディ、クエリパラメーターのいずれかに割り当てて送信できる。

#### ▼ 付与タイプ

認可サーバーによるOAuthのトークンの付与方法には種類がある。

> ℹ️ 参考：https://oauth.net/2/grant-types/

| 付与タイプ名             | 説明                                                         | 使用例                                                       |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Authorization Code Grant | アプリケーションが他のAPIにアクセスする場合に使用する。推奨されている。<br>ℹ️ 参考：https://oauth.net/2/grant-types/authorization-code/ | 他のSNSアプリとのアカウント連携                              |
| Client Credentials Grant | 推奨されている。<br>ℹ️ 参考：https://oauth.net/2/grant-types/client-credentials/ |                                                              |
| Device Code              | 推奨されている。<br>ℹ️ 参考：https://oauth.net/2/grant-types/device-code/ |                                                              |
| Implicit Grant           | 非推奨されている。<br>ℹ️ 参考：https://oauth.net/2/grant-types/implicit/ |                                                              |
| Password Grant           | ユーザー名とパスワードを照合し、トークンを付与する。非推奨されている。<br>ℹ️ 参考：<br>・https://oauth.net/2/grant-types/password/<br>・https://developer.okta.com/blog/2018/06/29/what-is-the-oauth2-password-grant#the-oauth-20-password-grant | LaravelのPassword Grant Token機能は、Password Grantタイプを使用している。<br>ℹ️ 参考：https://readouble.com/laravel/8.x/ja/passport.html#password-grant-tokens |

<br>

### SAML：Security Assertion Markup Language

#### ▼ SAMLとは

OAuthとは異なる仕組みで認証/認可の両方を実現する。

<br>

### OIDC：OpenID Connect（外部ID連携）

#### ▼ OIDCとは

OAuthをベースとして、認証フェーズを追加し、認証/認可を実現する。

> ℹ️ 参考：
> 
> - https://baasinfo.net/?p=4418
> - https://tech.yyh-gl.dev/blog/id_token_and_access_token/

#### ▼ OAuthとの違い

OIDCでは、OAuthとは異なり、アクセストークンではなく、IDトークンを使用する。

> ℹ️ 参考：https://qiita.com/TakahikoKawasaki/items/498ca08bbfcc341691fe

![oidc_vs_oauth](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/oidc_vs_oauth.png)

#### ▼ OIDCの種類

ベースになっているOAuthと同様にして、OIDCには仕組み別に『認可コードフロー』『インプリシットフロー』『リソースオーナー・パスワード・クレデンシャルズフロー』などがある。

#### ▼ 認可コードフロー

Facebookには認証フェーズと認可フェーズでログインする点はOAuthと同じであるが、免許証作成サイトには認証フェーズと認可フェーズでログインする。

<br>

## 03. JWT：JSON Web Token

### JWTとは

『ヘッダー』『ペイロード』『署名』のそれぞれのJSONデータを```base64```方式によってエンコードし、ドットでつないだトークン。Bear認証やOAuthのトークンとして使用できる。ランダムな文字列をこれら認証のトークンとするより、JWTを使用した方がより安全である。

> ℹ️ 参考：
>
> - https://meetup-jp.toast.com/3511
> - https://dev.classmethod.jp/articles/json-signing-jws-jwt-usecase/

<br>

### 認証での利用

#### ▼ Bearer認証の場合

```yaml
GET https://example.com/bar.php
---
authorization: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

<br>

### JWTの作成

#### ▼ JWT作成の全体像

JWTは以下のサイトから取得できる。

> ℹ️ 参考：https://jwt.io/

JWTの作成時に、例えばJavaScriptであれば、以下のような処理が実行されている。

```javascript
// <ヘッダーエンコード値>.<ペイロードエンコード値>.<署名エンコード値>
const token = base64urlEncoding(header) + "." +
      base64urlEncoding(payload) + "." +
      base64urlEncoding(signature)
```

#### ▼ ヘッダーのJSONデータの作成

ヘッダーは以下のJSONデータで定義される。署名のための暗号化アルゴリズムは、『```HS256```』『```RS256```』『```ES256```』『```none```』から選択できる。

```javascript
const header = {
    "typ" : "JWT",   // JWTの使用
    "alg" : "HS256", // 署名のための暗号化アルゴリズム
}
```

#### ▼ ペイロードのJSONデータの作成

ペイロードは以下のJSONデータで定義される。ペイロードには、実際に送信したいJSONを設定する。必ず設定しなければならない『予約済みクレーム』と、ユーザー側が自由に定義できる『プライベートクレーム』がある。

| 予約済みクレーム名         | 役割                      | 例         |
| -------------------------- | ------------------------- | ---------- |
| ```sub```：Subject         | 一意な識別子を設定する。  | ユーザーID |
| ```iss```：Issuer          |                           |            |
| ```aud```：Audience        |                           |            |
| ```exp```：Expiration Time | JWTの有効期限を設定する。 |            |
| ```jti```：JWT ID          |                           |            |

```javascript
const payload = {
    "sub": "foo",
    "aud": "foo",
    "iss": "https://example.com",
    "exp": 1452565628,
    "iat": 1452565568
}
```

#### ▼ 署名のJSONデータの作成

例えばJavaScriptであれば、以下のような処理が実行されている。

```javascript
const signature = HMACSHA256(
    base64urlEncoding(header) + "." + base64urlEncoding(payload),
    secret
)
```

<br>

### JWTのクライアント保持

#### ▼ 保持方法と安全度の比較

> ℹ️ 参考：
>
> - https://qiita.com/Hiro-mi/items/18e00060a0f8654f49d6#%E6%97%A9%E8%A6%8B%E8%A1%A8
> - https://blog.flatt.tech/entry/auth0_access_token_poc

| クライアント保持方法                                         | 組み合わせ                | おすすめ度 | コメント                                                     |
| ----------------------------------------------------------- |----------------------| :--------: | ------------------------------------------------------------ |
| インメモリ、```Cookie```ヘッダー、ローカルストレージ、セッションストレージ | なし                   |   △ 〜 ×   | いずれの方法でも、XSSによってJWTが盗まれる可能性がある。     |
| ```Cookie```ヘッダー                                         | プリフライトリクエスト          |     △      | Access-Control-Max-Ageの期間内だとCSRFでJWTが盗まれる可能性がある。 |
| ```Cookie```ヘッダー                                         | CSRFトークン             |     ⭕      |                                                              |
| SameSiteCookie                                              |                      |     ⭕      | SPAとAPIが同一オリジンの必要がある。                         |

<br>

