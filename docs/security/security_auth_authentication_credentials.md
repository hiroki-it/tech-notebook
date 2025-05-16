---
title: 【IT技術の知見】資格情報による分類＠認証
description: 資格情報による分類＠認証の知見を記録しています。
---

# 資格情報による分類＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 比較

| 認証                              | セッションベース                                                                                                                                  | トークンベース                                                                                                                                                                                                                                                                                 | ワンタイムコードベース                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `Cookie`ヘッダーによる運搬        | セッションデータを資格情報として、`Cookie`ヘッダーで運搬する。セッションデータは、再利用のためにブラウザのCookieに保存する。<br>(例) Form認証など | トークンを資格情報として、`Cookie`ヘッダーで運搬する。トークンは、再利用のためにブラウザのCookieに保存する。認証後にレスポンスのSet-`Cookie`ヘッダーにトークンを設定する必要があり、さまざまなフロントエンドアプリケーション (SST、CSR、SSRなど) で実装できる。<br>(例) OAuth2、OIDC、SAMLなど | なし                                                                  |
| `Authorization`ヘッダーによる運搬 | なし                                                                                                                                              | トークンを資格情報として、`Authorization`ヘッダーで運搬する。トークンは、再利用のためにブラウザのSessionStorageやLocalStorageに保存する。ブラウザのDOMを操作できるフロントエンドアプリケーション (CSRなど) で実装できる。<br>(例) OAuth2、OIDC、SAML、パーソナルアクセストークン認証など       | ワンタイムコードを資格情報として、`Authorization`ヘッダーで運搬する。 |

> - https://supertokens.com/blog/token-based-authentication-vs-session-based-authentication
> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

<br>

## 02. セッションベース認証

### セッションベース認証とは

セッションデータで資格情報を運搬する認証方法 (例：Form認証など) である。

システムの各コンポーネントがセッションデータを持つ必要がある。

セッションは有効期限が短く、漏洩した場合に脆弱性が高くなる。

作成と削除が頻繁に起こるコンテナでは、セッションデータが消失する可能性があるため、セッションベース認証とコンテナの相性は悪い。

いずれかのコンポーネントでセッションデータが消失しても復元できるように、SessionStorageを使用する必要がある。

> - https://supertokens.com/blog/token-based-authentication-vs-session-based-authentication
> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

<br>

### Form認証

セッションベース認証、かつ`Cookie`ヘッダーによる運搬の認証スキームのこと。

トークン (IDトークン、アクセストークン) を使用する場合、`Cookie`ヘッダーによる運搬であっても、Form認証とは言わない。

ステートフル化を行うため、HTTP認証には所属していない。

資格情報の一時的な保管は、サーバーのセッションデータで行うため、認証解除 (ログアウト) をサーバー側で制御できる。

`Cookie`ヘッダーによる送受信では、CSRFの危険性がある。

> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf
> - https://auth0.com/docs/sessions/cookies#cookie-based-authentication
> - https://qiita.com/toshiya/items/e7dcc7610b15884b167e#%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0%E3%81%AB%E3%82%88%E3%82%8B%E8%AA%8D%E8%A8%BC

<br>

### Basic認証

#### ▼ Basic認証とは

認証時に、平文のIDとパスワードを使用する認証スキームのこと。

<br>

#### ▼ Basic認証の仕組み

![Basic認証](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/Basic認証.png)

| 役割         | 説明                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| クライアント | リクエストの送信元アプリケーションのこと。文脈によっては、ブラウザがクライアントである場合とそうでない場合 (例：OAuth) がある。 |
| ユーザー     | クライアントを使用している人物のこと。                                                                                          |
| サーバー     | クライアントからリクエストを受信し、レスポンスを返信するアプリケーションのこと。                                                |

`(1)`

: 最初、クライアントは、認証後にリクエストを送信できるWebページのリクエストをサーバーに送信する。

```yaml
GET https://example.com/foo-form
```

`(2)`

: サーバーは、これ拒否し、`401`ステータスでrealm名を設定し、レスポンスを返信する。

     これにより、realm名の値をユーザーに示して、ユーザー名とパスワードの入力を求められる。

     ユーザーに表示するためのrealm名には、任意の値を持たせられ、サイト名が設定されることが多い。

```yaml
401 Unauthorized
---
WWW-Authenticate: Basic realm="<realm名>", charaset="UTF-8"
```

`(3)`

: 『`<ユーザー名>:<パスワード>`』をbase64方式でエンコードした値を`Authorization`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo-form
---
Authorization: Basic bG9naW46cGFzc3dvcmQ=
```

`(4)`

: サーバーは、ユーザー名とパスワードを照合し、合致していれば、認証後のWebページを返信する。

     また、資格情報をブラウザのWebストレージに保管する。

```yaml
200 OK
---
WWW-Authenticate: Basic realm=""
```

`(5)`

: 認証の解除時は、誤った資格情報をブラウザに意図的に送信させて認証を失敗する。

```yaml
POST https://example.com/foo-form/logout
---
authorization: Basic <誤った資格情報>
```

> - https://stackoverflow.com/questions/4163122/http-basic-authentication-log-out

`(6)`

: サーバーは、`401`ステータスでレスポンスを返信し、認証が解除される。

```yaml
401 Unauthorized
---
WWW-Authenticate: Basic realm="<realm名>", charaset="UTF-8"
```

<br>

### Digest認証

#### ▼ Digest認証とは

認証時に、ハッシュ化されたIDとパスワードを使用する認証スキームのこと。

<br>

#### ▼ Digest認証の仕組み

```yaml
200 OK
---
WWW-Authenticate: Basic realm="<realm名>", charaset="UTF-8"
```

```yaml
POST https://example.com/foo-form
---
authorization: Digest realm="<realm名>" nonce="<サーバー側が作成した任意の文字列>" algorithm="<ハッシュ関数名>" qoq="auth"
```

<br>

## 03. トークンベース認証

### トークンベース認証とは

トークン (例：JWT仕様あるいはそうではないアクセストークン、IDトークンなど) で資格情報を運搬する認証方法 (例：SSO、パーソナルアクセストークンなど) である。

システムの各コンポーネントはトークンを持つ必要がない。

作成と削除が頻繁に起こるコンテナでは、トークンの消失を考慮する必要がなく、トークンベースとコンテナの相性は良い。

一方で、トークンは無効化が難しく漏洩した場合に脆弱性が高くなる、有効期限を短く設定する必要がある。

> - https://supertokens.com/blog/token-based-authentication-vs-session-based-authentication
> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

<br>

### 認証方法の種類

- JWTトークンによる認証
- SSO

<br>

### トークン

#### ▼ 種類

トークンには以下の種類がある。

Self-containedトークンでは、トークン自体に署名と有効期限が含まれている。

Opaqueトークンでは、トークンはランダム値で、署名と有効期限はDBで管理されている。

| トークンの種類             | 認証                           | トークンの情報タイプ                                                                |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| アクセストークン           | OIDC                           | IDプロバイダーのツールによってはJWT仕様 (例：Keycloak) なためSelf-containedトークン |
| IDトークン                 | OIDC                           | 必ずJWT仕様であり、Self-containedトークン                                           |
| リフレッシュトークン       | OAuth2、OIDC                   | Self-containedトークン、Opaqueトークン                                              |
| パーソナルアクセストークン | パーソナルアクセストークン認証 | 記入中...                                                                           |
| XMLベースのトークン        | SAML                           | 記入中...<br>                                                                       |
| APIキー                    | APIキーベース認証              | 記入中...                                                                           |

> - https://qiita.com/TakahikoKawasaki/items/1c1bcf24b46ebd2030f5#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3jwtid%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E5%8C%85%E5%90%AB%E9%96%A2%E4%BF%82
> - https://zenn.dev/mikakane/articles/tutorial_for_openid#oidc-%E5%88%A9%E7%94%A8%E3%81%95%E3%82%8C%E3%82%8B-id-token-%E3%81%AE%E8%A6%8F%E7%B4%84
> - https://medium.com/@iamprovidence/token-gang-bearer-token-reference-token-opaque-token-self-contained-token-jwt-access-token-6e0191093cd0

#### ▼ アクセストークン

記入中...

#### ▼ IDトークン

記入中...

#### ▼ リフレッシュトークン

記入中...

#### ▼ パーソナルアクセストークン

クライアントがパーソナルアクセストークン (個人用アクセストークン) の付与をリクエストし、認証フェーズは行わずに認可フェーズのみでユーザーを照合する。

`Authorization`ヘッダーにPATを割りあてて、リクエストを送信する。

作成時以降、パーソナルアクセストークンを確認できなくなるため、クライアントがパーソナルアクセストークンを管理する必要がある。

```yaml
POST https://example.com/foo
---
Authorization: <パーソナルアクセストークン>
```

| サービス例 | トークン名                 | 説明                                                                                                                                                                                                                                                                                                  |
| ---------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub     | パーソナルアクセストークン | HTTPSプロトコルを使用して、プライベートリポジトリにリクエストを送信するために必要。HTTPSプロトコルを使用する場面として、アプリケーションの拡張機能のGitHub連携、リポジトリのパッケージ化などがある。<br>- https://docs.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token |

> - https://www.contentful.com/help/personal-access-tokens/
> - https://architecting.hateblo.jp/entry/2020/03/27/033758

#### ▼ APIキーベース認証

事前にAPIキーとなる文字列を配布し、認証フェーズは行わずに認可フェーズのみでユーザーを照合する認証スキームのこと。

信頼されたクライアントに発行することが前提のため、トークンよりも有効期限が長い (有効期限がない場合もある) 。

自前ヘッダーとして、`x-api-key`ヘッダーを定義する。これにAPIキーを割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
x-api-key: <APIキー>
```

> - https://architecting.hateblo.jp/entry/2020/03/27/033758
> - https://www.gomomento.com/blog/api-keys-vs-tokens-whats-the-difference

<br>

## 03-02. Bearer認証

### Bearer認証とは

認証時に、Bearerトークンを使用する認証スキームのこと。

<br>

### Bearerトークンとして使用できるトークン

#### ▼ Bearerトークン (署名なしトークン) とは

単なる文字列で定義したアクセストークン。

Bearer認証にて、トークンとして使用する。

署名なしトークンとも呼ばれ、実際に認証済みの本人か否かを判定する機能は無く、トークンを持っていればそれを本人として認可する。

そのため、トークン文字列が流出してしまわないよう、厳重に管理する必要がある。

> - https://openid-foundation-japan.github.io/rfc6750.ja.html#anchor3

#### ▼ JWT

> - https://tusharghosh09006.medium.com/bearer-token-jwt-bearer-token-oauth2-193d24574038

<br>

### Bearer認証の仕組み

`(1)`

: 指定されたエンドポイントに対して、`POST`リクエストを送信する。

     この時、`Content-Type`ヘッダーを`application/x-www-form-urlencoded`とする。

     必要なボディパラメーターはAPIの提供元によって異なる。クライアントID、付与タイプなどが必要なことが多い。

> - https://developer.amazon.com/ja/docs/adm/request-access-token.html#request-format
> - https://ja.developer.box.com/reference/post-oauth2-token/#request

```yaml
POST https://example.com/foo
---
Content-Type: application/x-www-form-urlencoded
---
# ボディ
client_id=*****&grant_type=client_credentials&scope=messaging:push
```

`(2)`

: レスポンスボディにBearerトークンを含むレスポンスが返信される。

     他に、有効期限、権限のスコープ、指定できる認証スキーマなどが提供されることが多い。

> - https://developer.amazon.com/ja/docs/adm/request-access-token.html#request-format
> - https://ja.developer.box.com/reference/resources/access-token/

```yaml
200 OK
---
X-Amzn-RequestId: d917ceac-2245-11e2-a270-0bc161cb589d
Content-Type: application/json
---
{
  "access_token": "*****",
  "expires_in": 3600,
  "scope": "messaging:push",
  "token_type": "Bearer",
}
```

`(3)`

: 発行されたBearerトークンを指定された認証スキーマで`Authorization`ヘッダーに割り当て、リクエストを送信する。

     ここでは詳しく言及しないが、BearerトークンをForm認証のように```Cookie```ヘッダーに割り当てることもある。

> - https://stackoverflow.com/questions/34817617/should-jwt-be-stored-in-localstorage-or-cookie
> - https://ja.developer.box.com/reference/post-oauth2-token/#response

```yaml
POST https://example.com/foo
---
authorization: Bearer <Bearerトークン>
```

`(4)`

: サーバーは、Bearerトークンを照合し、合致していれば、認証後のWebページを返信する。

     無効なBearerトークンをブラックリストとしてRedis/DBで管理しておく。

     DBでブラックリストを管理すると、リクエストの度にDBアクセス処理が実行されることなってしまうため、Redisでこれを管理した方が良い。

```yaml
200 OK
---
WWW-Authenticate: Bearer realm=""
```

`(5)`

: 認証の解除時は、Redis/DBでBearerトークンの状態を無効化する。

     またサーバーは、`401`ステータスでレスポンスを返信し、認証が解除される。

> - https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
> - https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6

```yaml
401 Unauthorized
---
WWW-Authenticate: Basic realm="<realm名>", charaset="UTF-8"
```

<br>

### 正常系/異常系レスポンス

> - https://qiita.com/h_tyokinuhata/items/ab8e0337085997be04b1

成功の場合は、realm属性を空にしたレスポンスを返信する。

```yaml
200 OK
---
WWW-Authenticate: Bearer realm=""
```

失敗の場合は、error属性にエラメッセージを割り当てたレスポンスを返信する。

```yaml
400 Bad Request
---
WWW-Authenticate: Bearer error="invalid_request"
```

```yaml
401 Unauthorized
---
WWW-Authenticate: Bearer realm="token_required"
```

```yaml
403 Forbidden
---
WWW-Authenticate: Bearer error="insufficient_scope"
```

<br>

## 04. 証明書ベース認証

クライアント認証、サーバー認証、相互TLS認証の仕組みの中で使用する。

<br>

## 05. チケットベース認証

- ケルベロス認証
- SAML

<br>

## 06. ワンタイムコードベース認証

所有を表すコードを一時的に発行する。
多要素認証の仕組みの中で使用する。

- メールOTP
- SMS OTP
- TOTP（Google Authenticator等）

<br>

## 07. ログアウト

### `Cookie`ヘッダーによる運搬の場合

#### ▼ ブラウザを閉じたタイミング

ブラウザを閉じた時に、ブラウザはCookieを削除する。

そのため、ログアウトが起こる。

> - https://qiita.com/kandalog/items/80d7574e6bd00afd5150

#### ▼ レスポンスの`Expires`ヘッダーで設定されたタイミング

レスポンスの`Expires`ヘッダーにはCookieの有効期限を設定できる。

ブラウザは有効期限に応じてCookieを削除する。

そのため、ログアウトが起こる。

有効期限がない場合、`Expires`ヘッダーの値は`Session`となり、このCookieを特に『Session Cookie』という。

> - https://qiita.com/kandalog/items/80d7574e6bd00afd5150
