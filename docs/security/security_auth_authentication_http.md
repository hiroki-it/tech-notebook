---
title: 【IT技術の知見】HTTP認証＠認証
description: HTTP認証＠認証の知見を記録しています。
---

# HTTP認証＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. HTTP認証とは

HTTPプロトコルの中で認証を行う認証スキームのこと。

リクエストの`authorization`ヘッダーとレスポンスの`WWW-Authenticate`ヘッダーで認証スキームを指定する。

認証スキームの種類には、『Basic認証』、『Digest認証』、『Bearer認証』などがある。

認証情報の一時的な保存は、ブラウザのWebStoregeで行うため、認証解除 (ログアウト) をサーバー側で完全に制御できない。

> ↪️ 参考：
>
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
| クライアント | リクエスト送信元のアプリケーションのこと。文脈によっては、ブラウザがクライアントである場合とそうでない場合 (例：OAuth) がある。 |
| ユーザー     | クライアントを使用している人物のこと。                                                                                          |
| サーバー     | クライアントからリクエストを受信し、レスポンスを返信するアプリケーションのこと。                                                |

`【１】`

: 最初、クライアントは、認証後にアクセスできるWebページのリクエストをサーバーに送信する。

```yaml
GET https://example.com/foo-form
```

`【２】`

: サーバーは、これ拒否し、`401`ステータスで認証領域を設定し、レスポンスを返信する。

     これにより、認証領域の値をユーザーに示して、ユーザー名とパスワードの入力を求められる。

     ユーザーに表示するための認証領域には、任意の値を持たせられ、サイト名が設定されることが多い。

```yaml
401 Unauthorized
---
WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

`【３】`

: 『`<ユーザー名>:<パスワード>`』をbase64方式でエンコードした値を`authorization`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo-form
---
authorization: Basic bG9naW46cGFzc3dvcmQ=
```

`【４】`

: サーバーは、ユーザー名とパスワードを照合し、合致していれば、認証後のWebページを返信する。

     また、認証情報をブラウザのWebストレージに保存する。

```yaml
200 OK
---
WWW-Authenticate: Basic realm=""
```

`【５】`

: 認証の解除時は、誤った認証情報をブラウザに意図的に送信させて認証を失敗させるようにする。

> ↪️ 参考：https://stackoverflow.com/questions/4163122/http-basic-authentication-log-out

```yaml
POST https://example.com/foo-form/logout
---
authorization: Basic <誤った認証情報>
```

`【６】`

: サーバーは、`401`ステータスでレスポンスを返信し、認証が解除される。

```yaml
401 Unauthorized
---
WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
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
WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

```yaml
POST https://example.com/foo-form
---
authorization: Digest realm="<認証領域>" nonce="<サーバー側が作成した任意の文字列>" algorithm="<ハッシュ関数名>" qoq="auth"
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

> ↪️ 参考：https://openid-foundation-japan.github.io/rfc6750.ja.html#anchor3

<br>

### Bearer認証の仕組み

`【１】`

: 指定されたエンドポイントに対して、`POST`リクエストを送信する。

     この時、`Content-Type`ヘッダーを`application/x-www-form-urlencoded`とする。

     必要なボディパラメーターはAPIの提供元によって異なる。クライアントID、付与タイプ、などが必要なことが多い。

> ↪️ 参考：
>
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

`【２】`

: レスポンスボディにBearerトークンを含むレスポンスが返信される。

     他に、有効期限、権限のスコープ、指定できる認証スキーマ、などが提供されることが多い。

> ↪️ 参考：
>
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

`【３】`

: 発行されたBearerトークンを指定された認証スキーマで`Authorization`ヘッダーに割り当て、リクエストを送信する。

     ここでは詳しく言及しないが、BearerトークンをForm認証のように```Cookie```ヘッダーに割り当てることもある。

> ↪️ 参考：
>
> - https://stackoverflow.com/questions/34817617/should-jwt-be-stored-in-localstorage-or-cookie
> - https://ja.developer.box.com/reference/post-oauth2-token/#response

```yaml
POST https://example.com/foo
---
authorization: Bearer <Bearerトークン>
```

`【４】`

: サーバーは、Bearerトークンを照合し、合致していれば、認証後のWebページを返信する。

     無効なBearerトークンをブラックリストとしてRedis/DBで管理しておく。

     DBでブラックリストを管理すると、リクエストの度にDBアクセス処理が実行されることなってしまうため、Redisでこれを管理した方が良い。

```yaml
200 OK
---
WWW-Authenticate: Bearer realm=""
```

`【５】`

: 認証の解除時は、Redis/DBでBearerトークンの状態を無効化する。

     またサーバーは、```401```ステータスでレスポンスを返信し、認証が解除される。

> ↪️ 参考：
>
> - https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
> - https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6

```yaml
401 Unauthorized
---
WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

<br>

### 正常系/異常系レスポンス

> ↪️ 参考：https://qiita.com/h_tyokinuhata/items/ab8e0337085997be04b1

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

### `Authorization`ヘッダーのトークンのクライアント保持

不便ではあるが、`Authorization`ヘッダーは`Cookie`ヘッダーとは異なり、ローカルマシンに保存できない。

その代わり、ブラウザの設定によって、ブラウザのWebストレージでも保持できる。

Chromeでは、ローカルストレージあるいはセッションストレージに保持される。

ローカルストレージはセッションストレージと比べて保管期間が長いため、XSSの危険性がより高い。

これらの場所の確認方法については、以下のリンクを参考にせよ

> ↪️ 参考：
>
> - https://developer.chrome.com/docs/devtools/storage/localstorage/
> - https://developer.chrome.com/docs/devtools/storage/sessionstorage/
> - https://stackoverflow.com/questions/5523140/html5-local-storage-vs-session-storage

<br>
