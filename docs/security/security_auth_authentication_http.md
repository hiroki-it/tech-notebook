---
title: 【IT技術の知見】HTTP認証＠認証
description: HTTP認証＠認証の知見を記録しています。
---

# HTTP認証＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. HTTP認証とは

HTTPプロトコルの中で認証を行う認証スキームのこと。

リクエストの`Authorization`ヘッダーとレスポンスの`WWW-Authenticate`ヘッダーで認証スキームを指定する。

認証スキームの種類には、『Basic認証』、『Digest認証』、『Bearer認証』などがある。

認証情報の一時的な保管は、ブラウザのWebStoregeで行うため、認証解除 (ログアウト) をサーバー側で完全に制御できない。

> - https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
> - https://architecting.hateblo.jp/entry/2020/03/27/130535
> - https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication#authentication_schemes

<br>

## 02. Basic認証

### Basic認証とは

認証時に、平文のIDとパスワードを使用する認証スキームのこと。

<br>

### Basic認証の仕組み

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

     また、認証情報をブラウザのWebストレージに保管する。

```yaml
200 OK
---
WWW-Authenticate: Basic realm=""
```

`(5)`

: 認証の解除時は、誤った認証情報をブラウザに意図的に送信させて認証を失敗する。

```yaml
POST https://example.com/foo-form/logout
---
authorization: Basic <誤った認証情報>
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

## 03. Digest認証

### Digest認証とは

認証時に、ハッシュ化されたIDとパスワードを使用する認証スキームのこと。

<br>

### Digest認証の仕組み

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

## 04. Bearer認証

### Bearer認証とは

認証時に、Bearerトークンを使用する認証スキームのこと。

<br>

### Bearerトークン (署名なしトークン) とは

単なる文字列で定義されたアクセストークン。

Bearer認証にて、トークンとして使用する。

署名なしトークンとも呼ばれ、実際に認証済みの本人か否かを判定する機能は無く、トークンを持っていればそれを本人として認可する。

そのため、トークン文字列が流出してしまわないよう、厳重に管理する必要がある。

> - https://openid-foundation-japan.github.io/rfc6750.ja.html#anchor3

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
