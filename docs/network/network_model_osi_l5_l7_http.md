---
title: 【IT技術の知見】HTTP＠L5 ~ L7
description: HTTP＠L5 ` L7の知見を記録しています。
---

# HTTP＠`L5` ~ `L7`

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. HTTPメッセージ

### HTTPメッセージとは

アプリケーション層で作成されるデータを、HTTPメッセージという。

リクエスト時にクライアント側で作成されるメッセージをリクエスト、レスポンス時にサーバー側で作成されるメッセージをレスポンスという。

<br>

### HTTPコンテキスト

#### ▼ HTTPコンテキスト

特定のリクエスト/レスポンスに関するあらゆる情報 (例：リクエストパラメーター、セッション、その他フレームワーク固有の情報など) を扱うための仕組みのこと。

特にフレームワークやパッケージでよく使われる用語である。

#### ▼ .NET Frameworkの場合

.NETのフレームワーク。

コンテキストクラスが用意されている。

> ↪️：https://docs.microsoft.com/en-us/dotnet/api/system.web.routing.requestcontext?view=netframework-4.8

#### ▼ Ginの場合

Goのフレームワーク。

コンテキスト構造体が用意されている。

> ↪️：https://pkg.go.dev/github.com/gin-gonic/gin#Context

#### ▼ Nuxt.jsの場合

JavaScriptのフレームワーク。

コンテキストオブジェクトが用意されている。

> ↪️：https://nuxtjs.org/ja/docs/internals-glossary/context/

#### ▼ Lambdaの場合

フレームワークでなはいが、Lambdaの場合にパラメーターとしてcontextオブジェクトが用意されている。

<br>

## 02. リクエスト

### リクエストの構造

#### ▼ GET送信の場合

クエリパラメーターに送信するデータを記述する。

リクエストは、以下の要素に分類できる。

以下では、Web APIのうち、特にRESTfulAPIに対して送信するためのリクエストの構造を説明する。

```yaml
GET https://example.com/bar-form.php?text1=a&text2=b
---
# リクエストされたドメイン名
Host: example.com
# 送信元IPアドレス
RemoteAddr: *.*.*.*
Connection: keep-alive
Upgrade-Insecure-Requests: 1
# クライアントサイドキャッシュの最大有効期限 (リクエストヘッダーとレスポンスヘッダーの両方で定義可能)
Cache-Control: max-age=31536000
# ブラウザのバージョン情報等
User-Agent: Mozzila/5.0 (Windows NT 10.0; Win64; x64) Ch
# レスポンス返信してほしいMIMEタイプ
Accept: text/html, application/xhtml+xml, application/xml; q=0
# レスポンスで返信してほしいエンコーディング形式
Accept-Encondig: gzip, deflate, br
# レスポンスで返信してほしい言語
Accept-Language: ja, en-US; q=0.9, en; q=0.8
# 遷移元のページ
Referer: https://foo.co.jp/
# 送信元IPアドレス
# ※ リバースプロキシサーバー (ALBやCloudFrontなども含む) を経由している場合、それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

#### ▼ POST送信の場合

クエリパラメーターを、URLに記述せず、メッセージボディに記述してリクエストを送る方法。

以下では、Web APIのうち、特にRESTfulAPIに対して送信するためのリクエストの構造を説明する。

メッセージボディに情報が記述されるため、履歴では確認できない。

また、SSLによって暗号化されるため、傍受できない。

リクエストは、以下の要素に分類できる。

```yaml
POST https://example.com/bar-form.php
---
# リクエストされたドメイン名
Host: example.com
# 送信元IPアドレス
RemoteAddr: *.*.*.*
Connection: keep-alive
Content-Length: 15
# クライアントサイドキャッシュの最大有効期限 (リクエストヘッダーとレスポンスヘッダーの両方で定義可能)
Cache-Control: no-store
# オリジン (プロトコル+ドメイン+ポート番号)
Origin: https://example.com
Upgrade-Insecure-Requests: 1
# リクエストで送信するMIMEタイプ
Content-Type: application/x-www-firm-urlencoded
# ブラウザのバージョン情報等
User-Agent: Mozzila/5.0 (Windows NT 10.0; Win64; x64) Ap
# レスポンス返信してほしいMIMEタイプ
Accept: text/html, application/xhtml+xml, application/xml; q=0
# レスポンスで返信してほしいエンコーディング形式
Accept-Encondig: gzip, deflate, br
# レスポンスで返信してほしい言語
Accept-Language: ja, en-US; q=0.9, en; q=0.8
# 遷移元のページ
Referer: https://foo.co.jp/
# 各Cookieの値 (二回目のリクエスト時に設定される)
Cookie: sessionid=<セッションID>; csrftoken=<トークン>; _gat=1
# 送信元IPアドレス
# ※ リバースプロキシサーバー (ALBやCloudFrontなども含む) を経由している場合、それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
---
# ボディ (SSLによって暗号化される)
text=a&text2=b
```

#### ▼ 例外として、ボディを持つGET送信の場合

GET送信ではあるが、ボディにクエリパラメーターを記述して送信する方法がある。

> ↪️：https://github.com/postmanlabs/postman-app-support/issues/131

<br>

### 送信例

#### ▼ PHPの場合

```php
<?php

define("URL", "https://foo.com");

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
        // SSL証明書の検証
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
# webサーバー (nginx、apache、AmazonS3などが表示される)
Server: nginx
Date: Sat, 26 Sep 2020 04:25:08 GMT
# リファラポリシー (nginx、apache、などで実装可能)
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
# CloudFrontのキャッシュにヒットしたか否か
X-Cache: Miss from cloudfront
Via: 1.1 *****.cloudfront.net (CloudFront)
X-Amz-Cf-Pop: SEA19-C2
X-Amz-Cf-Id: *****==
# 言語のバージョン (※ php.ini にて、expose_php = Off と設定することにより非表示にできる)
X-Powered-By: PHP/7.3.22
---
# ボディ
ここにサイトのHTMLのコード
```

<br>

### ステータスコード

クライアントに対して、概要がわかるステータスコードをレスポンスとして返信する。

`200`ステータスコード以外に関して、セキュリティ上の理由のため、エラーの具体的な内容はバックエンドのtry-catchやフロントエンドのポップアップで別の言葉に置き換える。

| コード | 概要                                           | 説明                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `200`  | 成功                                           | 正しいリクエストである。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `401`  | 認証エラー                                     | 誤ったリクエストである。認証プロセスで正しいトークンが発行されず、認可プロセスのリクエストでこの誤ったトークンを送信したことを表す。認可の失敗ではなく、認証の失敗であることに注意する。                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `403`  | 認可エラーによるトークン所有者の認可スコープ外 | 誤ったリクエストである。APIに認証プロセスが存在し、トークンの発行が必要だとする。認証プロセスにて正しいトークンが発行されたが、認可プロセスにてトークンの所有者の認可スコープ外と判定されたことを表す。                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 同上   | 送信元IPアドレスの参照禁止                     | 誤ったリクエストである。APIに認証/認可プロセスが存在せず、トークン発行と参照権限検証が不要だとする。送信元IPアドレスに参照権限がないと判定されてことを表す。                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `404`  | Webページが見つからない                        | 誤ったリクエストである。存在しないWebページをリクエストしていることを表す。もし、Webページの存在しないURLにリクエストがあった場合、検索エンジンが`404`ステータスを自動的に返信してくれるが、ユーザー定義の`404`ページを用意した場合は、そのままでは検索エンジンは`200`ステータスを返信してしまうため、アプリケーション側で明示的に`404`ステータスを返信する必要がある。アプリケーションは`404`ステータスの処理を実行しているのにもかかわらず、検索エンジンがこれを`200`ステータスと扱ってしまう (ブラウザでは`200`ステータスが返信される) 現象を『ソフト`404`』という。<br>↪️：https://www.sakurasaku-labo.jp/blogs/soft-404-error |
| `405`  | 許可されていないHTTPメソッド                   | 誤ったリクエストである。エンドポイントのパスは正しいが、HTTPメソッドは誤っていることを表す。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `409`  | 競合エラー                                     | 誤ったリクエストである。CREATE処理やUPDATE処理によって、新しいデータと現在のDBのデータの間で競合が起こっていることを表す。一意な識別子として使用しているデータの重複や、楽観的ロックによる排他制御が起こる場合に使用する。<br>↪️：https://hiroki-it.github.io/tech-notebook/software/software_middleware_database_rdb_rdbms.html                                                                                                                                                                                                                                                                                                   |
| `412`  | リソースアクセスエラー                         | 誤ったリクエストである。リソースへのアクセスに失敗したことを表す。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `422`  | バリデーションエラー                           | 誤ったリクエストである。送信されたパラメーターが誤っていることを表す。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `499`  | 接続切断エラー                                 | 誤ったリクエストである。リバースプロキシサーバー (例：Nginx) が持つ非標準のステータスコードであり、一般的には使用されない。プロキシの先のシステムからのレスポンスの返信が遅く (またはレスポンスがなく) 、途中でプロキシが接続を切断してしまったことを表す。`504`とやや似ている。<br>↪️：https://secure.netowl.jp/bbs/detail.cgi?td=4200                                                                                                                                                                                                                                                                                            |
| `500`  | サーバーエラー                                 | サーバーの処理でランタイムエラーが起こっていることを表す。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `502`  | プロキシ先からのエラーレスポンス               | 誤ったリクエストである。リクエストがプロキシを介して他のシステムにリダイレクトされる場合に、プロキシとその先のシステムまではリクエストが送信されているが、`504`ステータスとは異なり、何らかのエラーのレスポンスが返信されていることを表す。<br>↪️：https://e-words.jp/w/502%E3%82%A8%E3%83%A9%E3%83%BC.html                                                                                                                                                                                                                                                                                                                        |
| `503`  | ビジネスロジックエラー                         | エラーは起こらないが、ビジネス上ありえないデータをリクエストしていることを表す。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `504`  | プロキシ先からのレスポンス返信なし             | 誤ったリクエストである。リクエストがプロキシを介して他のシステムにリダイレクトされる場合に、プロキシまではリクエストが送信されているが、`502`ステータスとは異なり、その先のシステムからレスポンスが全く返信されないことを表す。                                                                                                                                                                                                                                                                                                                                                                                                    |

<br>

### 似たレスポンスの違い

> ↪️：https://qiita.com/unsoluble_sugar/items/b080a16701946fcfce70

#### ▼ リダイレクトとリライトの違い

リダイレクトでは、リクエストされたURLをサーバー側で新しいURLに書き換えてブラウザに返信し、ブラウザがリクエストを再送信する。

そのため、クライアント側は新しいURLで改めてリクエストを送信することになる。

一方で、リライトでは、リクエストされたURLをサーバー側で異なるURLに書き換え、サーバーがそのままリクエストを送信する。

そのため、クライアント側は古いURLのままリクエストを送信することになる。

その他の違いについては、以下のリンクを参考にせよ。

> ↪️：https://blogs.iis.net/owscott/url-rewrite-vs-redirect-what-s-the-difference

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

GET送信には不要である。

> ↪️：https://stackoverflow.com/questions/5661596/do-i-need-a-content-type-header-for-http-get-requests

| トップレベルタイプ | サブレベルタイプ      | 意味                                |
| ------------------ | --------------------- | ----------------------------------- |
| application        | octet-stream          | 任意のMIME type (指定なし) を示す。 |
|                    | javascript            | jsファイル                          |
|                    | json                  | jsonファイル                        |
|                    | x-www-form-urlencoded | POST送信のデータ                    |
|                    | zip                   | `.zip`ファイル                      |
| text               | html                  | `.html`ファイル                     |
|                    | css                   | `.css`ファイル                      |
|                    | plane                 | プレーンテキスト                    |
| image              | png                   | pngファイル                         |
|                    | jpeg                  | jpegファイル                        |
|                    | gif                   | gifファイル                         |

> ↪️：https://stackoverflow.com/questions/5661596/do-i-need-a-content-type-header-for-http-get-requests

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

#### ▼ Cookie情報に関わるヘッダー

最初、サーバーからのレスポンス時、`Set-Cookie`ヘッダーを使用して送信される。

反対に、クライアントからのリクエスト時、Cookie情報は、`Cookie`ヘッダーを使用して送信される。

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

#### ▼ 仕組み

![cookie](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cookie.png)

`【１】`

: 最初、ブラウザはリクエストを送信する。

`【２】`

: サーバーは、レスポンスヘッダーの`Set-Cookie`ヘッダーにCookie情報を埋め込んで送信する。

```php
<?php

setcookie(
    <Cookie名>,
    <Cookie値>,
    <有効日時>,
    <パス>,
    <ドメイン>,
    <HTTPS接続のみ>,
    <Javascript無効>
    )
```

`【３】`

: ブラウザは、そのCookie情報を保存する。

`【４】`

: `2`回目以降のリクエストでは、ブラウザは、リクエストヘッダーの`Cookie`ヘッダーにCookie情報を埋め込んでサーバーに送信する。

     サーバーは、Cookie情報に紐付くクライアントのデータをReadする。

<br>

### セッション

#### ▼ セッション、セッションIDとは

![session-id_page-transition](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/session-id_page-transition.png)

特定のサイトを訪問してから、離脱するまでの一連のユーザー操作を『セッション』という。

この時、セッションIDを使用すると、セッションの各リクエストの送信元を同一クライアントとして識別できる。

HTTPはステートレスなプロトコルであるが、セッションIDにより擬似的にステートフルな通信を行える。

例えばセッションIDにより、ログイン後にページ遷移を行っても、ログイン情報を保持でき、同一ユーザーからのリクエストとして認識できる。

セッションIDは、Cookie情報の1つとして、`Cookie`ヘッダーと`Set-Cookie`ヘッダーを使用して送受信される。

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

> ↪️：https://support.google.com/analytics/answer/6086069?hl=ja

#### ▼ セッションIDの発行、セッションデータの作成

セッションは、`session_start`メソッドを使用することにより開始される。

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

#### ▼ セッションデータの保存場所

サーバー内に保存する場合は、セッションはファイル形式である一方で、サーバー外のセッションDB (例：PHP Redis、ElastiCache Redisなど) に保存する場合は、レコード形式になる。

セッションデータの保存場所は`/etc/php.ini`ファイルで定義できる。

```ini
# /etc/php.iniファイル

## ファイル形式
session.save_handler = files
## 保存場所
session.save_path = "/tmp"
```

補足として、PHP-FPMを採用している場合は、`/etc/php.ini`ファイルではなく、`/etc/php-fpm.d/www.conf`ファイルで保存場所を設定する必要がある。

```bash
# /etc/php-fpm.d/www.confファイル

## Redis形式
php_value[session.save_handler] = redis
## AWS RedisのOrigin
php_value[session.save_path] = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"
```

> ↪️：
>
> - https://github.com/phpredis/phpredis/issues/1097
> - https://qiita.com/supertaihei02/items/53e36252afa3ea157d38

#### ▼ セッションの有効期限と初期化確率

セッションの有効期限を設定できる。

これにより、画面遷移時にログイン情報を保持できる秒数を定義できる。

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

> ↪️：https://www.php.net/manual/ja/session.configuration.php#ini.session.gc-divisor

#### ▼ 仕組み

![session-id](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/session-id.png)

`【１】`

: 最初、ブラウザはリクエストを送信する。

     セッションIDを発行し、セッションIDごとに```sess_*****```ファイルを作成。

`【２】`

: サーバーは、レスポンスヘッダー情報の`Cookie`ヘッダーを使用して、セッションIDを送信する。

`【３】`

: ブラウザは、そのセッションIDを保存する。

`【４】`

: 2回目以降のリクエストでは、ブラウザは、リクエストヘッダー情報の`Cookie`ヘッダーを使用して、セッションIDをサーバーに送信する。

     サーバーは、セッションIDに紐付くクライアントのデータをReadする。

<br>

## 06. フォワード/リバースプロキシサーバー

### フォワード/リバースプロキシサーバーとは

クライアントとアプリケーションの間にあり、代理ルーティングやキャッシュ作成を担う。

<br>

### 処理

#### ▼ 代理ルーティング

![フォワードプロキシサーバーとリバースプロキシサーバー](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/フォワードプロキシサーバーとリバースプロキシサーバー.png)

| サーバー名                 | 処理                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| フォワードプロキシサーバー | 特定のクライアントのアウトバウンド通信を、不特定多数のサーバーに代理でルーティングする。                                               |
| リバースプロキシサーバー   | 不特定のクライアントからのインバウンド通信を、特定のサーバーに代理でルーティングする。また、ロードバランサーのように負荷分散もできる。 |

> ↪️：https://qiita.com/att55/items/162950627dc593c72f23

#### ▼ キャッシュ

![プロキシサーバーのキャッシュ能力](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/プロキシサーバーのキャッシュ能力.png)

| サーバー名                 | 処理                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| フォワードプロキシサーバー | クライアント側にて、代理ルーティングのレスポンスのキャッシュを作成する。 |
| リバースプロキシサーバー   | サーバー側にて、代理ルーティングのレスポンスのキャッシュを作成する。     |

> ↪️：https://software.fujitsu.com/jp/manual/manualfiles/M100003/B1WN9491/07Z201/ihs02/ihs00016.htm

<br>

### 配置場所

#### ▼ 物理サーバーの場合

フォワードプロキシサーバーはプロバイダの会社に、リバースプロキシサーバーはリクエスト先の社内ネットワークに配置されている。

![proxy-server](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/proxy-server.png)

#### ▼ クラウド上の場合

クラウドの場合も、仮想環境が作成されるのみで、配置場所は同じである。

- Akamai
- AWS CloudFront
- CDNetworks
- Cloudflare
- Fastly

> ↪️：https://www.underworks.co.jp/dmj/2023/01/23/content-delivery-network-service/

<br>

### 07. `L7`ロードバランサー

`L7`のプロトコルの通信をロードバランシングする。

- `L7`のプロトコル
- ポート番号
- HTTPリクエスト (パス、`Host`ヘッダー)

> ↪️：https://www.infraexpert.com/study/tcpip8.html

<br>
