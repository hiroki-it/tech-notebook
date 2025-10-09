---
title: 【IT技術の知見】HTTP＠L5 ~ L7
description: HTTP＠L5 ` L7の知見を記録しています。
---

# HTTP＠L5 ~ L7

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. HTTPメッセージ

### HTTPメッセージとは

アプリケーション層で作成されるデータをHTTPメッセージという。

クライアント側で作成されるメッセージをリクエスト、リクエストの宛先で作成されるメッセージをレスポンスという。

<br>

### HTTPコンテキスト

#### ▼ HTTPコンテキスト

特定のリクエスト−レスポンスに関するあらゆる情報 (例：リクエストパラメーター、セッション、その他フレームワーク固有の情報など) を扱うための仕組みのこと。

特にフレームワークやパッケージでよく使われる用語である。

#### ▼ .NET Frameworkの場合

.NETのフレームワーク。

コンテキストクラスが用意されている。

> - https://docs.microsoft.com/en-us/dotnet/api/system.web.routing.requestcontext?view=netframework-4.8

#### ▼ Ginの場合

Goのフレームワーク。

コンテキスト構造体が用意されている。

> - https://pkg.go.dev/github.com/gin-gonic/gin#Context

#### ▼ Nuxt.jsの場合

JavaScriptのフレームワーク。

コンテキストオブジェクトが用意されている。

> - https://nuxtjs.org/ja/docs/internals-glossary/context/

#### ▼ Lambdaの場合

フレームワークでなはいが、Lambdaの場合にパラメーターとしてcontextオブジェクトが用意されている。

<br>

### HTTP KeepAlive

HTTPリクエストのたびに、送信元と宛先間でTCPスリーウェイハンドシェイクとTCP接続を実施し直すのは非効率である。

そこで、宛先がレスポンスの`Connection`ヘッダーで`keep-alive`を送信元に返信し、一つのTCP接続中に複数のHTTPリクエストを送受信できるようにする。

![http-keepalive](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/http-keepalive.png)

> - https://server-setting.info/centos/nginx-keepalive-setting.html
> - https://milestone-of-se.nesuke.com/nw-basic/as-nw-engineer/keepalive-tcp-http/#toc7

<br>

## 02. リクエスト

### GETリクエストの場合

#### ▼ GETリクエストとは

クエリパラメーターに送信するデータを記述する。

リクエストは、以下の要素に分類できる。

#### ▼ Host

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# リクエストされたドメイン名
Host: example.com
```

#### ▼ RemoteAddr

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# 送信元IPアドレス
RemoteAddr: *.*.*.*
```

#### ▼ Upgrade-Insecure-Requests

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
Upgrade-Insecure-Requests: 1
```

#### ▼ Origin

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# オリジン (デフォルトではプロトコル + ドメイン + ポート番号)
Origin: https://example.com
```

> - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin#examples

#### ▼ Cache-Control

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# クライアントサイドキャッシュの最大有効期限 (リクエストヘッダーとレスポンスヘッダーの両方で定義可能)
Cache-Control: max-age=31536000
```

#### ▼ User-Agent

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# ブラウザのバージョン情報等
User-Agent: Mozzila/5.0 (Windows NT 10.0; Win64; x64) Ch
```

#### ▼ Accept

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# レスポンス返信してほしいMIMEタイプ
Accept: text/html, application/xhtml+xml, application/xml; q=0
```

#### ▼ Accept-Encondig

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# レスポンスで返信してほしいエンコーディング形式
Accept-Encondig: gzip, deflate, br
```

#### ▼ Accept-Language

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# レスポンスで返信してほしい言語
Accept-Language: ja, en-US; q=0.9, en; q=0.8
```

#### ▼ Referer

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# 遷移元のページ
Referer: https://foo.co.jp/
```

#### ▼ X-Forwarded-For

送信元や経由したリバースプロキシサーバーのIPアドレスを持つ。

```yaml
# リクエストライン
GET https://example.com/bar-form.php?text1=a&text2=b
---
# 送信元IPアドレス
# ※ リバースプロキシサーバー (AWS ALBやAWS CloudFrontなども含む) を経由している場合、それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

<br>

### POSTリクエストの場合

#### ▼ POSTリクエストとは

クエリパラメーターを、URLに記述せず、メッセージボディに記述してリクエストを送信する方法。

以下では、Web APIのうち、特にRESTfulAPIに対して送信するためのリクエストの構造を説明する。

メッセージボディに情報が記述されるため、履歴では確認できない。

また、SSLによって暗号化されるため、傍受できない。

#### ▼ Host

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# リクエストされたドメイン名
Host: example.com
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ RemoteAddr

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# 送信元IPアドレス
RemoteAddr: *.*.*.*
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Content-Length

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
Content-Length: 15
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Cache-Control

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# クライアントサイドキャッシュの最大有効期限 (リクエストヘッダーとレスポンスヘッダーの両方で定義可能)
Cache-Control: no-store
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Origin

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# オリジン (デフォルトではプロトコル + ドメイン + ポート番号)
Origin: https://example.com
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

> - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin#examples

#### ▼ Upgrade-Insecure-Requests

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
Upgrade-Insecure-Requests: 1
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Content-Type

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# リクエストで送信するMIMEタイプ
Content-Type: application/x-www-firm-urlencoded
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ User-Agent

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# ブラウザのバージョン情報等
User-Agent: Mozzila/5.0 (Windows NT 10.0; Win64; x64) Ap
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Accept

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# レスポンス返信してほしいMIMEタイプ
Accept: text/html, application/xhtml+xml, application/xml; q=0
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Accept-Encondig

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# レスポンスで返信してほしいエンコーディング形式
Accept-Encondig: gzip, deflate, br
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Accept-Language

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# レスポンスで返信してほしい言語
Accept-Language: ja, en-US; q=0.9, en; q=0.8
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Referer

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# 遷移元のページ
Referer: https://foo.co.jp/
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ Cookie

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# 各Cookieの値 (二回目のリクエスト時に設定される)
Cookie: sessionid=<セッションID>; csrftoken=<トークン>; _gat=1
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ X-Forwarded-For

送信元や経由したリバースプロキシサーバーのIPアドレスを持つ。

```yaml
# リクエストライン
POST https://example.com/bar-form.php
---
# 送信元IPアドレス
# ※ リバースプロキシサーバー (AWS ALBやAWS CloudFrontなども含む) を経由している場合、それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ 例外として、ボディを持つGETリクエストの場合

GETリクエストではあるが、ボディにクエリパラメーターを記述して送信する方法がある。

> - https://github.com/postmanlabs/postman-app-support/issues/131

<br>

### 送信例

#### ▼ PHPの場合

```php
<?php

define("URL", "https://example.com");

// curlセッションを初期化する
$curl = curl_init();

// オプションの設定
curl_setopt_array(
    $curl,
    [
        // URL
        CURLOPT_URL            => URL,
        // HTTPメソッド
        CURLOPT_CUSTOMREQUEST  => "GET",
        // サーバー証明書の検証
        CURLOPT_SSL_VERIFYPEER => false,
        // string型で受信
        CURLOPT_RETURNTRANSFER => true
    ]
);

// リクエストの実行
$messageBody = (curl_exec($curl))
    ? curl_exec($curl)
    : [];

// curlセッションを閉じる
curl_close($curl);
```

<br>

## 03. レスポンス

### レスポンスの構造

**＊例＊**

```yaml
200 OK
---
# レスポンスで送信するMIMEタイプ
Content-Type: text/html;charset=UTF-8
Transfer-Encoding: chunked
Connection: close
# Webサーバー (nginx、apache、AmazonS3などが表示される)
Server: nginx
Date: Sat, 26 Sep 2020 04:25:08 GMT
# リファラポリシー (nginx、apacheなどで実装可能)
Referrer-Policy: no-referrer-when-downgrade
x-amz-rid:	*****
# セッションIDを含むCookie情報
Set-Cookie: session-id=*****; Domain=.amazon.co.jp; Expires=Sun, 26-Sep-2021 04:25:08 GMT; Path=/
Set-Cookie: session-id-time=*****; Domain=.amazon.co.jp; Expires=Sun, 26-Sep-2021 04:25:08 GMT; Path=/
Set-Cookie: i18n-prefs=JPY; Domain=.amazon.co.jp; Expires=Sun, 26-Sep-2021 04:25:08 GMT; Path=/
Set-Cookie: skin=noskin; path=/; domain=.amazon.co.jp
Accept-CH: ect,rtt,downlink
Accept-CH-Lifetime:	86400
X-UA-Compatible: IE=edge
Content-Language: ja-JP
# クライアントサイドキャッシュの最大有効期限 (リクエストヘッダーとレスポンスヘッダーの両方で定義可能)
Cache-Control: no-cache
# クライアントサイドキャッシュの最大有効期限 (レスポンスヘッダーのみで定義可能)
Expires: Wed, 21 Oct 2015 07:28:00 GMT
Pragma:	no-cache
X-XSS-Protection: 1;
X-Content-Type-Options:	nosniff
Vary: Accept-Encoding,User-Agent,Content-Type,Accept-Encoding,X-Amzn-CDN-Cache,X-Amzn-AX-Treatment,User-Agent
Strict-Transport-Security: max-age=*****; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
# AWS CloudFrontのキャッシュにヒットしたか否か
X-Cache: Miss from cloudfront
Via: 1.1 <発行されたランダム文字列>.cloudfront.net (AWS CloudFront)
X-Amz-Cf-Pop: SEA19-C2
X-Amz-Cf-Id: *****==
# 言語のバージョン (※ php.ini にて、expose_php = Off と設定することにより非表示にできる)
X-Powered-By: PHP/7.3.22
---
# ボディ
返信されるWebサイトのHTMLコード
```

#### ▼ Connection

HTTP KeepAliveを実施するかどうか

(リクエストにも`Connection`ヘッダーがある？)

```yaml
200 OK
---
Connection: keep-alive
---
# ボディ
返信されるWebサイトのHTMLコード
```

<br>

### ステータスコード

#### ▼ ステータスコードとは

クライアントに対して、概要がわかるステータスコードをレスポンスとして返信する。

`200`ステータス以外に関して、セキュリティ上の理由のため、エラーの具体的な内容はバックエンドのtry-catchやフロントエンドのポップアップで別の言葉に置き換える。

#### ▼ `200` (成功)

正しいリクエストである。

#### ▼ `401` (認証エラー)

誤ったリクエストである。

認証プロセスで正しいトークンが発行されず、認可プロセスのリクエストでこの誤ったトークンを送信したことを表す。

認可の失敗ではなく、認証の失敗であることに注意する。

#### ▼ `403` (認可エラーによるトークン所有者の認可スコープ外)

誤ったリクエストである。

APIに認証プロセスが存在し、トークンの発行が必要だとする。

認証プロセスにて正しいトークンが発行された。

しかし、認可プロセスにてトークンの所有者の認可スコープ外と判定されたことを表す。

#### ▼ `403` (送信元IPアドレスの参照禁止)

誤ったリクエストである。

APIに認証/認可プロセスが存在せず、トークン発行と参照権限検証が不要だとする。

送信元IPアドレスに参照権限がないと判定されてことを表す。

#### ▼ `404` (Webページが見つからない)

誤ったリクエストである。

存在しないWebページをリクエストしていることを表す。

もし、Webページの存在しないURLにリクエストがあった場合、検索エンジンが`404`ステータスを自動的に返信してくれる。

しかし、ユーザー定義の`404`ページを用意した場合は、そのままでは検索エンジンは`200`レスポンスを返信してしまう。

そのため、アプリ側で明示的に`404`レスポンスを返信する必要がある。

アプリケーションは`404`ステータスの処理を実行しているのにもかかわらず、検索エンジンがこれを`200`ステータスと扱ってしまう (ブラウザでは`200`ステータスが返信される) 現象を『ソフト`404`』という。

> - https://www.sakurasaku-labo.jp/blogs/soft-404-error

#### ▼ `405` (許可されていないHTTPメソッド)

誤ったリクエストである。

エンドポイントのパスは正しい。

しかし、HTTPメソッドは誤っていることを表す。

#### ▼ `408` (意図的な接続切断エラー)

誤ったリクエストである。

リクエストによる処理が想定以上に長時間になった場合、適切な時間内に処理が終了しなかったと判断され、接続を切断したことを表す。

> - https://lists.cs.columbia.edu/pipermail/sip-implementors/2012-June/028493.html

#### ▼ `409` (競合エラー)

誤ったリクエストである。

`CREATE`処理や`UPDATE`処理によって、新しいデータと現在のDBレコードの間で競合が起こっていることを表す。

一意な識別子として使用しているデータの重複や、楽観的ロックによる排他制御が起こる場合に使用する。

> - https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms.html

#### ▼ `412` (リソースアクセスエラー)

誤ったリクエストである。

リソースへのアクセスに失敗したことを表す。

#### ▼ `422` (バリデーションエラー)

誤ったリクエストである。

送信されたパラメーターが誤っていることを表す。

#### ▼ `499` (接続切断エラー)

誤ったリクエストである。

リバースプロキシサーバー (例：Nginx) が持つ非標準のステータスコードであり、一般的には使用されない。

プロキシの宛先のシステムからのレスポンスの返信が遅く (またはレスポンスがなく) 、途中でプロキシが接続を切断してしまったことを表す。

Gateway Timeout (`504`ステータス) である。とやや似ている。

> - https://secure.netowl.jp/bbs/detail.cgi?td=4200

#### ▼ `500` (サーバーエラー)

誤ったリクエストである。

サーバーの処理でランタイムエラーが起こっていることを表す。

#### ▼ `502` (プロキシの宛先からのエラーレスポンス)

誤ったリクエストである。

リクエストがプロキシを経由して他のシステムにリダイレクトされる場合、プロキシとその先のシステムまではリクエストが送信されている。

しかし、`504`ステータスとは異なり、何らかのエラーのレスポンスが返信されていることを表す。

> - https://e-words.jp/w/502%E3%82%A8%E3%83%A9%E3%83%BC.html

#### ▼ `503` (ビジネスロジックエラー)

誤ったリクエストである。

エラーは起こらない。

しかし、ビジネス上ありえないデータをリクエストしていることを表す。

#### ▼ `504` (プロキシの宛先からのレスポンス返信がタイムアウト)

誤ったリクエストである。

読み取りタイムアウト (Read timeout) が起こっており、リクエストがプロキシを経由して他のシステムにリダイレクトされる場合、プロキシまではリクエストが送信されている。

しかし、`502`ステータスとは異なり、その先のシステムからレスポンスが全く返信されないことを表す。

![status-code_504](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/status-code_504.png)

> - https://dotnetblog.asphostportal.com/steps-to-fix-504-bad-gateway-timeout-error/

<br>

### リトライすべきステータスコード

宛先に通信が届いておらず、リトライすると問題が解決する可能性があるステータスコードは、リトライしてもよい。

- リトライすると解決する可能性がある
- リクエストを繰り返しても状態が変わらずに冪等性がある (二重処理にならない) がある

具体的には、以下のようなステータスコードである。

- `408`
- `429`
- `500`
- `502` (システムによってはリトライによって、冪等性のない二重処理が起こる)
- `503` (同上)
- `504` (同上)

> - https://cloud.google.com/storage/docs/retry-strategy?hl=ja

<br>

### 似たレスポンスの違い

#### ▼ リダイレクトとリライトの違い

リダイレクトでは、リクエストされたURLをサーバー側で新しいURLに書き換えてブラウザに返信し、ブラウザがリクエストを再送信する。

そのため、クライアント側は新しいURLで改めてリクエストを送信することになる。

一方で、リライトでは、リクエストされたURLをサーバー側で異なるURLに書き換え、サーバーがそのままリクエストを送信する。

そのため、クライアント側は古いURLのままリクエストを送信することになる。

その他の違いについては、以下のリンクを参考にせよ。

> - https://blogs.iis.net/owscott/url-rewrite-vs-redirect-what-s-the-difference

#### ▼ リライトとフォワードの違い

リライトでは異なるサーバーにリクエストを送信できるが、フォワードでは同一サーバー内の異なるファイルにアクセスすることしかできない。

<br>

## 04. オブジェクトデータ

### オブジェクトデータ

#### ▼ オブジェクトデータとは

リクエスト (POST) /レスポンスにて、メッセージボディに割り当てて送信/返信するデータのこと。

<br>

### MIME type (Content type)

#### ▼ MIME typeとは

POST/PUT送信で、ボディパラメーターのデータ形式を表す識別子のこと。

リクエストヘッダー/レスポンスヘッダーの`Content-Type`ヘッダーに割り当てると、オブジェクトデータのデータ型を定義できる。

GETリクエストには不要である。

> - https://stackoverflow.com/questions/5661596/do-i-need-a-content-type-header-for-http-get-requests

| トップレベルタイプ | サブレベルタイプ      | 意味                                |
| ------------------ | --------------------- | ----------------------------------- |
| application        | octet-stream          | 任意のMIME type (指定なし) を示す。 |
|                    | javascript            | jsファイル                          |
|                    | json                  | jsonファイル                        |
|                    | x-www-form-urlencoded | POSTリクエストの送信データ          |
|                    | zip                   | `.zip`ファイル                      |
| text               | html                  | `html`ファイル                      |
|                    | css                   | `.css`ファイル                      |
|                    | plane                 | プレーンテキスト                    |
| image              | png                   | pngファイル                         |
|                    | jpeg                  | jpegファイル                        |
|                    | gif                   | gifファイル                         |

> - https://stackoverflow.com/questions/5661596/do-i-need-a-content-type-header-for-http-get-requests

#### ▼ データ型の指定方法

最も良い方法は、リクエストの`Content-Type`ヘッダーに、『`application/json`』を設定することによりある。

```yaml
POST https://example.com/users/12345
---
# ヘッダー
Content-Type: application/json
```

他に、URIでデータ型を記述する方法がある。

```yaml
POST https://example.com/users/12345?format=json
```

<br>

## 05. HTTP/HTTPSプロトコルの擬似ステートフル化

### Cookie、Cookie情報 (キー名/値)

#### ▼ Cookie、Cookie情報とは

クライアントからの次回のリクエスト時でも、Cookie情報 (キー名/値のセット) を使用して、同一クライアントと認識できる仕組みをCookieという。

HTTPはステートレスなプロトコルであるが、Cookie情報により擬似的にステートフルな通信を行える。

> - https://www.engilaboo.com/definitely-understand-cookie-session/

#### ▼ Cookie情報に関わるヘッダー

最初、サーバーからのレスポンス時に`Set-Cookie`ヘッダーに割り当てて送信される。

反対に、クライアントからのリクエスト時、Cookie情報は、`Cookie`ヘッダーに割り当てて送信される。

| HTTPメッセージの種類 | ヘッダー名 | 属性     | 内容                                                                                                  |
| -------------------- | ---------- | -------- | ----------------------------------------------------------------------------------------------------- |
| レスポンス           | Set-Cookie | Name     | Cookie名と値                                                                                          |
|                      |            | Expires  | Cookieの有効期限 (日数)                                                                               |
|                      |            | Max-Age  | Cookieの有効期限 (秒数)                                                                               |
|                      |            | Domain   | クライアントがリクエストする時のCookie宛先ドメイン名。                                                |
|                      |            | Path     | クライアントがリクエストする時のCookie宛先ディレクトリ                                                |
|                      |            | Secure   | クライアントからのリクエストでSSLプロトコルが使用されている時のみ、リクエストを送信できるようにする。 |
|                      |            | HttpOnly | クライアント側で、JavaScriptがCookieを使用できないようにする。XSS攻撃の対策になる。                   |
| リクエスト           | Cookie     |          | セッションIDなどのCookie情報                                                                          |

クライアントから受信したリクエストの`Cookie`ヘッダーの内容は、グローバル変数に格納されている。

```php
<?php

$_COOKIE = ["Cookie名" => "値"]
```

#### ▼ 擬似ステートフル化の仕組み

![cookie](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cookie.png)

`(1)`

: 最初、ブラウザはリクエストを送信する。

`(2)`

: サーバーは、レスポンスヘッダーの`Set-Cookie`ヘッダーにCookie情報を埋め込んで送信する。

```php
<?php

setcookie(
    <Cookie名>,
    <Cookie値>,
    <有効日時>,
    <パス>,
    <ドメイン>,
    <HTTPSリクエストのみ>,
    <JavaScript無効>
    )
```

`(3)`

: ブラウザは、そのCookie情報を保管する。

`(4)`

: 2回目以降のリクエストでは、ブラウザは、リクエストヘッダーの`Cookie`ヘッダーにCookie情報を埋め込んでサーバーに送信する。

     サーバーは、Cookie情報に紐付くクライアントのデータをReadする。

<br>

## 05-02. セッション

### セッションとは

![session-id_page-transition](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/session-id_page-transition.png)

特定のサイトを訪問してから、離脱するまでの一連のユーザー操作を『セッション』という。

この時、セッションIDを使用すると、セッションの各クライアント側を同一クライアントとして識別できる。

HTTPはステートレスなプロトコルであるが、セッションIDにより擬似的にステートフルな通信を行える。

例えばセッションIDにより、ログイン後にページ遷移を行っても、ログイン情報を保持でき、同一ユーザーからのリクエストとして認識できる。

セッションIDはCookie情報の1つであり、`Cookie`ヘッダーと`Set-Cookie`ヘッダーに割り当てて送受信される。

```yaml
# リクエストヘッダーの場合
Cookie: sessionid=<セッションID>; csrftoken=u32t4o3tb3gg43; _gat=1
```

```yaml
# レスポンスヘッダーの場合
Set-Cookie: sessionId=<セッションID>
```

セッション数はGoogleコンソールで確認できる。

GoogleConsoleにおけるセッションについては、以下のリンクを参考にせよ。

> - https://support.google.com/analytics/answer/6086069?hl=ja

<br>

### セッションIDとは

サーバー側のセッションデータに紐づくIDである。

セッションは、`session_start`関数を使用することにより開始される。

また同時に、クライアントにセッションIDを発行する。

グローバル変数にセッションIDを代入することによって、セッションIDの記載されたセッションデータを作成する。

セッションIDに紐付くその他のデータはこのセッションデータに書き込まれていく。

セッションデータの名前は、`sess_*****`ファイルとなっており、セッションデータ名を元にしてセッションIDに紐付くデータを参照する。

もしクライアントに既にセッションIDが発行されている場合、セッションデータを参照するようになる。

**＊実装例＊**

```php
<?php

// セッションの開始。セッションIDを発行する。
session_start();

// セッションデータを作成
$_SESSION["セッション名"] = "値";
```

<br>

### セッションデータの保管場所

#### ▼ サーバーファイル

サーバーにて、ファイル形式で保管する。

**実装例**

PHPの場合、セッションデータの保管場所は`/etc/php.ini`ファイルで定義できる。

```ini
# /etc/php.iniファイル

## ファイル形式
session.save_handler = files
## 保管場所
session.save_path = "/tmp"
```

PHP-FPMを採用している場合は、`/etc/php.ini`ファイルではなく、`/etc/php-fpm.d/www.conf`ファイルで保管場所を設定する必要がある。

```bash
# /etc/php-fpm.d/www.confファイル

## Redis形式
php_value[session.save_handler] = redis
## AWS RedisのOrigin
php_value[session.save_path] = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"
```

> - https://github.com/phpredis/phpredis/issues/1097
> - https://qiita.com/supertaihei02/items/53e36252afa3ea157d38
> - https://blog.frevo-works.co.jp/entry/2019/09/24/112603

#### ▼ サーバーメモリ

サーバーにて、メモリ上で保管する。

> - https://blog.frevo-works.co.jp/entry/2019/09/24/112603

#### ▼ ストレージ

SessionStorage (例：Redis、ElastiCacheなど) やDB (例：MySQL) にて、レコード形式で保管する。

> - https://blog.frevo-works.co.jp/entry/2019/09/24/112603

### セッションデータの有効期限と初期化確率

セッションの有効期限を設定できる。

これにより、画面遷移時にログイン情報を保持できる秒数を定義できる。

**実装例**

PHPの場合、セッションデータの有効期限は`/etc/php.ini`ファイルで定義できる。

```ini
# 24時間
session.gc_maxlifetime = 86400
```

ただし、有効期限が切れた後にセッションデータを初期化するか否かは確率によって定められている。

確率は、 『`gc_probability`÷`gc_divisor`』 で計算される。

```ini
# 有効期限後に100%初期化されるようにする。
session.gc_probability = 1
session.gc_divisor = 1
```

> - https://www.php.net/manual/ja/session.configuration.php#ini.session.gc-divisor

<br>

### セッションの仕組み

![session-id](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/session-id.png)

`(1)`

: 最初、ブラウザはリクエストを送信する。

     セッションIDを発行し、セッションIDごとに`sess_*****`ファイルを作成。

`(2)`

: サーバーは、レスポンスヘッダー情報の`Cookie`ヘッダーにセッションIDを割り当て送信する。

`(3)`

: ブラウザは、そのセッションIDを保管する。

`(4)`

: 2回目以降のリクエストでは、ブラウザは、リクエストヘッダー情報の`Cookie`ヘッダーにセッションIDを割り当て、サーバーに送信する。

     サーバーは、セッションIDに紐付くクライアントのデータをReadする。

<br>

## 06. `L7`ロードバランサー

### `L7`ロードバランサーとは

通信の`L7`プロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3など) のヘッダー情報に基づいて、通信をロードバランシングする。

一方で、`L7`プロトコルのヘッダー情報をもたない通信をロードバランシングできない。

`L4`のヘッダー情報を失うわけではなく、あくまでパケットの`L7`プロトコルの情報をロードバランシングに使用するだけである。

`L7`プロトコルは、ヘッダーに宛先の情報 (例：完全修飾ドメイン名、パス) をもっている。

`L7`ロードバランサーは、これらの情報に基づいて通信を待ち受けるサーバーに、通信をロードバランシングする。

> - https://medium.com/@crazy_nuclei/l4-vs-l7-load-balancers-64e47610e2ef
> - https://www.infraexpert.com/study/tcpip16.html
> - https://hakobe932.hatenablog.com/entry/2018/04/11/123000

<br>

### 負荷分散方式

#### ▼ 静的方式

宛先の負荷を考慮せずに、ロードバランシングする。

- ラウンドロビン
- 重み付きラウンドロビン
- IPハッシュ

> - https://www.cloudflare.com/ja-jp/learning/performance/types-of-load-balancing-algorithms/
> - https://aws.amazon.com/jp/what-is/load-balancing/

#### ▼ 動的方式

宛先の負荷をリアルタイムに考慮して、ロードバランシングする。

静的方式よりもこちらの方が良い。

- 最小接続数 (最小未処理接続数、Least Connection)
- 重み付き接続数
- 最小レスポンス時間

> - https://www.cloudflare.com/ja-jp/learning/performance/types-of-load-balancing-algorithms/
> - https://aws.amazon.com/jp/what-is/load-balancing/

<br>

### 宛先の変更と保持

`L7`ロードバランサーは、元々のリクエストの情報を保持しつつ、宛先を変更しなければならない。

`L7`プロトコル (例：HTTP、HTTPS、SMTP、DNS、POP3など) のヘッダーを保持し、NATの仕組みで`L4`ヘッダーに含まれる宛先IPアドレスやポート番号を変更している。

> - https://atmarkit.itmedia.co.jp/ait/articles/0302/05/news001.html

<br>
