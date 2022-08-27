---
title: 【IT技術の知見】Authenticate（認証）＠認証/認可
description: Authenticate（認証）＠認証/認可の知見を記録しています。
---

# Authenticate（認証）＠認証/認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 認証とは

通信しているユーザーが誰であるかを特定する方法。

<br>

## 02. 認証の種類

### HTTP認証

HTTP通信の中で認証を行う認証スキームのこと。リクエストの```authorization```ヘッダーとレスポンスの```WWW-Authenticate```ヘッダーで認証スキームを指定する。認証スキームの種類には、『Basic認証』、『Digest認証』、『Bearer認証』などがある。認証情報の一時的な保存は、ブラウザのWebStoregeで行うため、認証解除（ログアウト）をサーバー側で完全に制御できない。

ℹ️ 参考：

- https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml
- https://architecting.hateblo.jp/entry/2020/03/27/130535
- https://developer.mozilla.org/ja/docs/Web/HTTP/Authentication#authentication_schemes

<br>

### Form認証（Cookieベースの認証）

#### ▼ Form認証とは

認証時に、```Cookie```ヘッダーの値を使用する認証スキームのこと。『Cookieベースの認証』ともいう。ステートフル化を行うため、HTTP認証には属していない。認証情報の一時的な保存は、サーバーのセッションデータで行うため、認証解除（ログアウト）をサーバー側で制御できる。```Cookie```ヘッダーによる送受信では、CSRFの危険性がある。

ℹ️ 参考：

- https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf
- https://auth0.com/docs/sessions/cookies#cookie-based-authentication

#### ▼ セッションIDを使用したForm認証の場合（セッションベース）

セッションIDを```Cookie```ヘッダーに割り当て、リクエストを送信する。

最初、ユーザー作成の段階で、クライアントが認証情報をサーバーに送信する。サーバーは、認証情報をDBに保存する。

```yaml
POST https://example.com/users

{
    "email_address": "foo@gmail.com",
    "password": "foo"
}
```

次回の認証時に、再びユーザーが認証情報を送信する。

```yaml
POST https://example.com/foo-form

{
    "email_address": "foo@gmail.com",
    "password": "foo"
}
```

サーバーは、DBの認証情報を照合し、ログインを許可する。サーバーは、セッションIDを作成し、セッションデータに書き込む。

```yaml
# セッションデータ
{ sessionid: ***** }
```

レスポンスの```Set-Cookie```ヘッダーを使用して、セッションIDをクライアントに送信する。

```yaml
200 OK

Set-Cookie: sessionid=<セッションID>
```

サーバーは、セッションIDとユーザーIDを紐付けてサーバー内に保存する。加えて次回のログイン時、クライアントは、リクエストの```Cookie```ヘッダーを使用して、セッションIDをクライアントに送信する。サーバーは、保存されたセッションIDに紐付くユーザーIDから、ユーザーを特定し、ログインを許可する。これにより、改めて認証情報を送信せずに、素早くログインできるようになる。

```yaml
POST https://example.com/foo-form

cookie: sessionid=<セッションID>
```

認証解除時、サーバーでセッションデータを削除する。

ℹ️ 参考：https://blog.tokumaru.org/2013/02/purpose-and-implementation-of-the-logout-function.html

#### ▼ トークンを使用したForm認証の場合（トークンベース）

トークンを```Cookie```ヘッダーに割り当て、リクエストを送信する。この時のトークンの選択肢として、単なるランダムな文字列やJWTがある。

ℹ️ 参考：https://scrapbox.io/fendo181/JWT(JSON_Web_Token)%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B%E3%80%82

![JWT](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/JWT.png)

#### ▼ ```Cookie```ヘッダーの値のクライアント保持

再利用のため、```Cookie```ヘッダーに割り当てるための値（セッションID、トークン）は、ブラウザを通して、ローカルマシンに有効期限に応じた間だけ保持できる。またはブラウザの設定によって、ブラウザのWebストレージでも保持できる。Chromeの場合は、Cookieストレージに保持される。確認方法については、以下のリンクを参考にせよ。

ℹ️ 参考：

- https://developer.chrome.com/docs/devtools/storage/cookies/
- https://qiita.com/cobachan/items/05fa537a4ffcb189d001

<br>

### APIキー認証

#### ▼ APIキー認証とは

事前にAPIキーとなる文字列を配布し、認証フェースは行わずに認可フェーズのみでユーザーを照合する認証スキームのこと。

#### ▼ 照合情報の送信方法

独自ヘッダーとして、```x-api-key```ヘッダーを定義する。これにAPIキーを割り当て、リクエストを送信する。リクエストヘッダへのパラメータの割り当てについては、以下のリンクを参考にせよ。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_collaboration_api_restful.html

```yaml
GET https://example.com/bar.php

x-api-key: <APIキー>
```

<br>

### PAT：Personal Access Tokenによる認証

#### ▼ PATによる認証

クライアントがPersonal Access Token（個人用アクセストークン）の付与をリクエストし、認証フェースは行わずに認可フェーズのみでユーザーを照合する。```Authorization```ヘッダーにPATを割りあてて、リクエストを送信する。作成時以降、アクセストークンを確認できなくなるため、クライアントがアクセストークンを管理する必要がある。

ℹ️ 参考：https://www.contentful.com/help/personal-access-tokens/

```yaml
GET https://example.com/bar.php

authorization: <Personal Acccess Token>
```

| サービス例 | トークン名            | 説明                                                         |
| ---------- | --------------------- | ------------------------------------------------------------ |
| GitHub     | Personal access Token | HTTPSを使用して、プライベートリポジトリにリクエストを送信するために必要。HTTPSを使用する場面として、アプリケーションの拡張機能のGitHub連携、リポジトリのパッケージ化、などがある。<br>ℹ️ 参考：https://docs.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token |

<br>

## 02. HTTP認証の種類

### Basic認証

#### ▼ Basic認証とは

認証時に、平文のIDとパスワードを使用する認証スキームのこと。

#### ▼ 仕組み

![Basic認証](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Basic認証.png)


| 役割         | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| クライアント | リクエスト送信元のアプリケーションのこと。文脈によっては、ブラウザがクライアントである場合とそうでない場合（例：OAuth）がある。 |
| ユーザー       | クライアントを使用している人物のこと。                       |
| サーバー       | クライアントからリクエストを受信し、レスポンスを送信するアプリケーションのこと。 |

最初、クライアントは、認証後にアクセスできるWebページのリクエストをサーバーに送信する。

```yaml
GET https://example.com/foo-form
```

サーバーは、これ拒否し、```401```ステータスで認証領域を設定し、レスポンスを送信する。これにより、認証領域の値をユーザーに示して、ユーザー名とパスワードの入力を求められる。ユーザーに表示するための認証領域には、任意の値を持たせられ、サイト名が設定されることが多い。

```yaml
401 Unauthorized

WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

『```<ユーザー名>:<パスワード>```』をbase64方式でエンコードした値を```authorization```ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo-form

authorization: Basic bG9naW46cGFzc3dvcmQ=
```

サーバーは、ユーザー名とパスワードを照合し、合致していれば、認証後のWebページを返信する。また、認証情報をブラウザのWebストレージに保存する。

```yaml
200 OK

WWW-Authenticate: Basic realm=""
```

認証の解除時は、誤った認証情報をブラウザに意図的に送信させて認証を失敗させるようにする。

ℹ️ 参考：https://stackoverflow.com/questions/4163122/http-basic-authentication-log-out

```yaml
POST https://example.com/foo-form/logout

authorization: Basic <誤った認証情報>
```

サーバーは、```401```ステータスでレスポンスを返信し、認証が解除される。

```yaml
401 Unauthorized

WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

<br>


### Digest認証

#### ▼ Digest認証とは

認証時に、ハッシュ化されたIDとパスワードを使用する認証スキームのこと。

#### ▼ Digest認証の仕組み

```yaml
200 OK

WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

```yaml
POST https://example.com/foo-form

authorization: Digest realm="<認証領域>" nonce="<サーバー側が作成した任意の文字列>" algorithm="<ハッシュ関数名>" qoq="auth"
```

<br>

### Bearer認証

#### ▼ Bearer認証とは

認証時に、Bearerトークンを使用する認証スキームのこと。

#### ▼ Bearerトークン（署名なしトークン）とは

単なる文字列で定義されたアクセストークン。Bearer認証にて、トークンとして使用する。署名なしトークンとも呼ばれ、実際に認証された本人か否かを判定する機能は無く、トークンを持っていればそれを本人として認可する。そのため、トークンの文字列が流出してしまわないよう、厳重に管理する必要がある。

ℹ️ 参考：https://openid-foundation-japan.github.io/rfc6750.ja.html#anchor3

#### ▼ Bearer認証の仕組み

指定されたエンドポイントに対して、```POST```リクエストを送信する。この時、```Content-Type```ヘッダーを```application/x-www-form-urlencoded```とする。必要なボディパラメーターはAPIの提供元によって異なる。クライアントID、付与タイプ、などが必要なことが多い。

ℹ️ 参考：

- https://developer.amazon.com/ja/docs/adm/request-access-token.html#request-format
- https://ja.developer.box.com/reference/post-oauth2-token/#request

```yaml
POST https://example.com/foo

Content-Type: application/x-www-form-urlencoded    

# ボディ
client_id=*****&grant_type=client_credentials&scope=messaging:push
```

レスポンスボディにBearerトークンを含むレスポンスが返信される。他に、有効期限、権限のスコープ、指定できる認証スキーマ、などが提供されることが多い。

ℹ️ 参考：

- https://developer.amazon.com/ja/docs/adm/request-access-token.html#request-format
- https://ja.developer.box.com/reference/resources/access-token/

```yaml
200 OK

X-Amzn-RequestId: d917ceac-2245-11e2-a270-0bc161cb589d
Content-Type: application/json

{
  "access_token": "*****",
  "expires_in":3600,
  "scope": "messaging:push",
  "token_type": "Bearer"
}
```

発行されたBearerトークンを指定された認証スキーマで```Authorization```ヘッダーに割り当て、リクエストを送信する。ここでは詳しく言及しないが、BearerトークンをForm認証のように```Cookie```ヘッダーに割り当てることもある。

ℹ️ 参考：

- https://stackoverflow.com/questions/34817617/should-jwt-be-stored-in-localstorage-or-cookie
- https://ja.developer.box.com/reference/post-oauth2-token/#response

```yaml
POST https://example.com/foo

authorization: Bearer <Bearerトークン>
```

サーバーは、Bearerトークンを照合し、合致していれば、認証後のWebページを返信する。無効なBearerトークンをブラックリストとしてRedis/DBで管理しておく。DBでブラックリストを管理すると、リクエストの度にDBアクセス処理が実行されることなってしまうため、Redisでこれを管理した方が良い。

```yaml
200 OK

WWW-Authenticate: Bearer realm=""
```

認証の解除時は、Redis/DBでBearerトークンの状態を無効化する。またサーバーは、```401```ステータスでレスポンスを返信し、認証が解除される。

ℹ️ 参考：

- https://stackoverflow.com/questions/21978658/invalidating-json-web-tokens
- https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6

```yaml
401 Unauthorized

WWW-Authenticate: Basic realm="<認証領域>", charaset="UTF-8"
```

#### ▼ 正常系/異常系レスポンス

ℹ️ 参考：https://qiita.com/h_tyokinuhata/items/ab8e0337085997be04b1

成功の場合は、realm属性を空にしたレスポンスを返信する。

```yaml
200 OK

WWW-Authenticate: Bearer realm=""
```

失敗の場合は、error属性にエラメッセージを割り当てたレスポンスを返信する。

```yaml
400 Bad Request

WWW-Authenticate: Bearer error="invalid_request"
```

```yaml
401 Unauthorized

WWW-Authenticate: Bearer realm="token_required"
```

```yaml
403 Forbidden

WWW-Authenticate: Bearer error="insufficient_scope"
```

#### ▼ ```Authorization```ヘッダーのトークンのクライアント保持

不便ではあるが、```Authorization```ヘッダーは```Cookie```ヘッダーとは異なり、ローカルマシンに保存できない。その代わり、ブラウザの設定によって、ブラウザのWebStorageでも保持できる。Chromeでは、ローカルストレージあるいはセッションストレージに保持される。ローカルストレージはセッションストレージと比べて保存期間が長いため、XSSの危険性がより高い。これらの確認方法については、以下のリンクを参考にせよ

ℹ️ 参考：

- https://developer.chrome.com/docs/devtools/storage/localstorage/
- https://developer.chrome.com/docs/devtools/storage/sessionstorage/
- https://stackoverflow.com/questions/5523140/html5-local-storage-vs-session-storage

<br>

### OAuth

ノート内の[こちら](#02. 認可フェーズ)を参考にせよ。

<br>

### SAML

ノート内の[こちら](#02. 認可フェーズ)を参考にせよ。

<br>

## 03. 複数の認証の組み合わせ

### TSV：Two Step Verification（二段階認証）

#### ▼ 二段階認証とは

認証時に、段階的に```2```個の方法を設定し、クライアントを照合する。

| 一段階目の認証例 | 二段階目の認証例 | 説明                                                         | 備考                                         |
| ---------------- | ---------------- | ------------------------------------------------------------ | -------------------------------------------- |
| IDとパスワード   | IDとパスワード   | IDとパスワードによる方法の後、別のIDとパスワードによる方法を設定する。 |                                              |
|                  | 秘密の質問       | IDとパスワードによる方法の後、質問に対してあらかじめ設定した回答による方法を設定する。 |                                              |
|                  | SMS              | IDとパスワードによる方法の後、SMS宛に送信した認証コードによる方法を設定する。 | 異なる要素のため、これは二要素認証でもある。 |
|                  | 指紋             | IDとパスワードによる方法の後、指紋の解析結果による方法を設定する。 | 異なる要素のため、これは二要素認証でもある。 |

<br>

### TFA：Two Factor Authorization（二要素認証）

#### ▼ 二要素認証とは

二段階認証のうちで特に、認証時に異なる要素の方法を使用して、段階的にクライアントを照合すること方法のこと。

| 一要素目の認証例       | 二要素目の認証例                                             |
| ---------------------- | ------------------------------------------------------------ |
| IDとパスワード（知識） | 事前に連携登録されたQRコード読込アプリで発行したワンタイムパスワード（所持） |
|                        | 事前登録された電話番号のSMSで受信したワンタイムパスワード（所持） |
|                        | 事前登録された電話番号のSMSで受信した認証コード（所持）      |
|                        | OAuth（所持）                                            |
|                        | 指紋（生体）                                                 |
| 暗証番号（知識）       | キャッシュカード（所持）                                     |

<br>

### MFA：Multiple Factor Authorization（多要素認証）

#### ▼ 多要素認証とは

<br>

