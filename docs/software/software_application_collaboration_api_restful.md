---
title: 【知見を記録するサイト】RESTful-API
---

# RESTful-API

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. RESTとRESTfulとは

### REST

#### ・RESTとは

分散型アプリケーションを構築する時に，それぞれアプリケーションを連携させるのに適したアーキテクチャスタイルをRESTという．RESTは，以下の特徴を持つ．

![REST](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/REST.jpg)

#### ・RESTfulとRESTful-APIとは

RESTに基づいた設計をRESTfulという．RESTful設計が用いられたWebAPIをRESTful-APIという．例えば，RESTful-APIの場合，DBにおけるUserInfoのCRUDに対して，1つの『/UserInfo』というURIを対応づけている．

![RESTfulAPIを用いたリクエスト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/RESTfulAPIを用いたリクエスト.png)

<br>

### RESTの４原則

#### ・Statelessであること

クライアントに対してレスポンスを返信した後に，クライアントの情報を保持せずに破棄する仕組みのこと．擬似的にステートフルな通信を行う時は，キャッシュ，Cookie，セッションIDを用いて，クライアントの情報を保持する．

| プロトコル         | ステートレス/ステートフル |
| ------------------ | --------- |
| HTTP，HTTPS        | ステートレス |
| SSH，TLS/SSL，SFTP | ステートフル  |

#### ・Connectabilityであること
#### ・Uniform Interfaceであること

HTTPプロトコルを用いたリクエストを，『リソースに対する操作』とらえ，リクエストにHTTPメソッドを対応づけるようにする．

#### ・Addressabilityであること

エンドポイントによって，特定のリソースを操作できること．

<br>

## 02. エンドポイント

### エンドポイントとは

特定のリソースを操作するための固有のURIのこと．エンドポイント は，リソース1つごと，あるいはまとまりごとに割り振られる．

<br>

### HTTPメソッド，エンドポイント，ユースケースの関係

RESTfulAPIでは，全てのHTTPメソッドの内，主に以下の4つを用いて，データ処理の方法をリクエストする．それぞれが，APIのユースケースに対応する．ユースケースごとのメソッド名については，Laravelを参考にする．

参考：https://noumenon-th.net/programming/2020/01/30/laravel-crud/

| HTTPメソッド | エンドポイント                         | ユースケース                                                 | メソッド名の例  |
| ------------ | -------------------------------------- | ------------------------------------------------------------ | --------------- |
| GET          | ```https://example.com/users```      | ・全データのインデックス取得<br>・条件に基づくデータの取得   | index           |
|              | ```https://example.com/users/{id}``` | IDに基づくデータの取得                                       | show            |
| POST         | ```https://example.com/users```      | ・データの作成<br>・PDFの作成<br>・ファイルデータの送信<br>・ログイン/ログアウト | create，store   |
| PUT`         | ```https://example.com/users/{id}``` | データの更新（置換）                                         | update          |
| DELETE       | ```https://example.com/users/{id}``` | データの削除                                                 | delete，destroy |

POST送信とPUT送信の重要な違いについてまとめる．データを作成するユースケースの時はPOST送信，または更新する時はPUT送信を用いる．ただしもっと正確には，ユースケースが『作成』or『更新』ではなく，『非冪等』or『冪等』で判断したほうが良い．

参考：

- https://stackoverflow.com/a/2691891/12771072
- https://restfulapi.net/rest-put-vs-post/

|                            | POST送信                                           | PUT送信                                                      |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| データ作成の冪等性         | リクエスト1つにつき，1つのデータを作成（非冪等的） | リクエスト数に限らず，1つのデータを作成する（冪等的）．古いデータを新しいデータに置換する行為に近い． |
| リクエストパラメータの場所 | メッセージボディにJSONデータなどを割り当てる．     | パスパラメータにidなど，またメッセージボディにJSONデータなどを割り当てる． |

<br>

### エンドポイントの命名

#### ・動詞を用いないこと

すでにHTTPメソッド自体に動詞の意味合いが含まれるため，エンドポイントに動詞を含めないようにする．この時，アクセスするリソース名がわかりやすいような名詞を用いる．

参考：

- https://cloud.google.com/blog/products/api-management/restful-api-design-nouns-are-good-verbs-are-bad
- https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-use-nouns-instead-of-verbs-in-endpoint-paths

ただし慣例として，認証のエンドポイントが動詞（```login```，```logout```，```register```）になることは許容されている．

参考：

- https://stackoverflow.com/questions/7140074/restfully-design-login-or-register-resources
- https://www.developer.com/web-services/best-practices-restful-api

**＊悪い実装例＊**

```http
GET https://example.com/show-user/12345
```

**＊良い実装例＊**

```http
GET https://example.com/users/12345
```

```http
GET https://example.com/users/hiroki_hasegawa
```

**＊認証の場合＊**

動詞を許容するのであれば```login```や```logout```とし，名詞を採用するのであれば```session```とする．

```http
GET https://example.com/login
```

```http
GET https://example.com/session
```

#### ・短くすること

**＊悪い実装例＊**

ここで，```service```，```api```，といったキーワードは，なくても問題ない．


```http
GET https://example.com/service/api/users/12345
```

**＊良い実装例＊**


```http
GET https://example.com/users/12345
```

#### ・略称を使わないこと

**＊悪い実装例＊**

ここで，Usersを意味する『```u```』といった略称は，当時の設計者しかわからないため，不要である．

```http
GET https://example.com/u/12345
```

**＊良い実装例＊**

略称を使わずに，『users』とする．

```http
GET https://example.com/users/12345
```

#### ・小文字を使うこと

**＊悪い実装例＊**

```http
GET https://example.com/Users/12345
```

**＊良い実装例＊**

```http
GET https://example.com/users/12345
```

#### ・ケバブケースを使うこと

**＊悪い実装例＊**

```http
GET https://example.com/users_id/12345
```

**＊良い実装例＊**

スネークケースやキャメケースを使わずに，ケバブケースを用いる．

```http
GET https://example.com/users-id/12345
```

ただ，そもそもケバブ方式も利用せずに，スラッシュで区切ってしまうのも手である

```http
GET https://example.com/users/id/12345
```

#### ・複数形を用いること

**＊悪い実装例＊**

Usersという集合の中に，Idが存在しているため，単数形は使わない．

```http
GET https://example.com/user/12345
```

**＊良い実装例＊**

```http
GET https://example.com/users/12345
```

#### ・システムの設計方法がバレないURIにすること

**＊悪い実装例＊**

悪意のあるユーザーに，脆弱性を狙われる可能性があるため，ソフトウェアの設計方法がばれないアーキテクチャにすること．ミドルウェアにCGIプログラムが使用されていることや，phpを用いていることがばれてしまう．

```http
GET https://example.com/cgi-bin/get_users.php
```

**＊良い実装例＊**

```http
GET https://example.com/users/12345
```

#### ・HTTPメソッドの名前を用いないこと

**＊悪い実装例＊**

メソッドから，処理の目的はわかるので，URIに対応する動詞名を実装する必要はない．

```http
GET https://example.com/users/get/12345
```

```http
POST https://example.com/users/create/12345
```


```http
PUT https://example.com/users/update/12345
```

```http
DELETE https://example.com/users/delete/12345
```

**＊良い実装例＊**

```http
GET https://example.com/users/{id}
```

```http
POST https://example.com/users
```

```http
PUT https://example.com/users/{id}
```

```http
DELETE https://example.com/users/{id}
```

#### ・数字，バージョン番号を可能な限り使用しないこと

**＊悪い実装例＊**

ここで，```alpha```，```v2```，といったキーワードは，当時の設計者しかわからないため，あまり良くない．ただし，利便上，使う場合もある．

```http
GET https://example.com/v2/users/12345
```

**＊良い実装例＊**

```http
GET https://example.com/users/12345
```

URLにバージョンを表記しない代わりに，リクエストヘッダーの```X-api-Version```にバージョン情報を格納する方法がより良い．

```http
X-Api-Version: 1
```

#### ・異なるHTTPメソッドの間でルールを統一すること

**＊悪い実装例＊**

GET送信とPOST送信の間で，IDパラメータのHTTPメソッドが統一されていない．

```http
GET https://example.com/users/?id=12345
```

```http
POST https://example.com/users/12345/messages
```

**＊良い実装例＊**

以下のように，異なるHTTPメソッドの間でも統一する．


```http
GET https://example.com/users/12345
```

```http
POST https://example.com/users/12345/messages
```

<br>


### エンドポイントのパラメータ

#### ・パス，クエリストリングへの割り当て

URIの構造のうち，パスまたはクエリストリングにパラメータを割り当てて送信する．それぞれ，パスパラメータまたはクエリパラメータという．

```http
GET https://example.com:80/users/777?text1=a&text2=b
```

| 完全修飾ドメイン名          | 送信先のポート番号（```80```の場合は省略可） | ルート      | パスパラメータ | ？      | クエリパラメータ（GET送信時のみ） |
| --------------------------- | -------------------------------------------- | ----------- | -------------- | ------- | --------------------------------- |
| ```https://example.com``` | ```80```                                     | ```users``` | ```{id}```     | ```?``` | ```text1=a&text2=b```             |

#### ・使い分け（再掲）

| データの送信対象         | パスパラメータ | クエリパラメータ |
| ------------------------ | :------------: | :--------------: |
| 単一条件で決まる検索処理 |       ◯        |        △         |
| 複数条件で決まる検索処理 |       ✕        |        ◯         |
| フィルタリング処理       |       ✕        |        ◯         |
| ソーティング処理         |       ✕        |        ◯         |

#### ・メッセージボディへの割り当て

JSON型データ内に定義し，メッセージボディにパラメータを割り当てて送信する．

```http
POST https://example.com

# メッセージボディ
{
  "id": 1,
  "name": "foo",
}
```

#### ・リクエストヘッダーへの割り当て

リクエストヘッダーにパラメータを割り当てて送信する．送信時のヘッダー名は大文字でも小文字でもいずれでも問題ないが，内部的に小文字に変換されるため，小文字が推奨である．APIキーのヘッダー名の頭文字に『```X```』を付けるのは，独自ヘッダーの頭文字に『```X```』を付ける慣習があったためである．ただし，現在は非推奨である．

参考：https://developer.mozilla.org/ja/docs/Web/HTTP/Headers

```http
POST https://example.com
# Authorizationヘッダー
authorization: Bearer ${Token}
# APIキーヘッダー
x-api-key: *****
```

<br>

### エンドポイントのレスポンス形式

#### ・ステータスコード

クライアントに対して，概要がわかるステータスコードをレスポンスとして返信する．```200```ステータスコード以外に関して，セキュリティ上の理由のため，エラーの具体的な内容はバックエンドのtry-catchやフロントエンドのポップアップで別の言葉に置き換える．

参考：https://qiita.com/unsoluble_sugar/items/b080a16701946fcfce70

| コード | 概要                                           | 説明                                                         |
| ------ | ---------------------------------------------- | ------------------------------------------------------------ |
| 200    | 成功                                           | 正しいリクエストである．                                     |
| 401    | 認証エラー                                     | 誤ったリクエストである．認証プロセスで正しいトークンが発行されず，認可プロセスのリクエストでこの誤ったトークンを送信したことを表す．認可の失敗ではなく，認証の失敗であることに注意する． |
| 403    | 認可エラーによるトークン所有者の認可スコープ外 | 誤ったリクエストである．APIに認証プロセスが存在し，トークンの発行が必要だとする．認証プロセスにて正しいトークンが発行されたが，認可プロセスにてトークンの所有者の認可スコープ外と判定されたことを表す． |
| 〃     | 送信元IPアドレスの閲覧禁止                     | 誤ったリクエストである．APIに認証/認可プロセスが存在せず，トークン発行と閲覧権限検証が不要だとする．送信元IPアドレスに閲覧権限がないと判定されてことを表す． |
| 404    | Webページが見つからない                           | 誤ったリクエストである．存在しないデータをリクエストしていることを表す． |
| 405    | 許可されていないHTTPメソッド                   | 誤ったリクエストである．エンドポイントのパスは正しいが，HTTPメソッドは誤っていることを表す． |
| 409    | 競合エラー                                     | 誤ったリクエストである．CREATE処理やUPDATE処理によって，新しいデータと現在のDBのデータの間で競合が起こっていることを表す．一意な識別子として用いているデータの重複や，楽観的ロックによる排他制御が起こる場合に用いる．<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_middleware_database.html |
| 412    | リソースアクセスエラー                         | 誤ったリクエストである．リソースへのアクセスに失敗したことを表す． |
| 422    | バリデーションエラー                           | 誤ったリクエストである．送信されたパラメータが誤っていることを表す． |
| 500    | サーバーエラー                                   | サーバーの処理でランタイムエラーが起こっていることを表す．エラーの種類については，以下のリンク先を参考にせよ．<br>参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_authentication_authorization.html |
| 503    | ビジネスロジックエラー                         | エラーは起こらないが，ビジネス上ありえないデータをリクエストしていることを表す． |

#### ・リダイレクトとリライトの違い

リダイレクトでは，リクエストされたURLをサーバー側で新しいURLに書き換えてブラウザに返信し，ブラウザがリクエストを再送信する．そのため，クライアント側は新しいURLで改めてリクエストを送信することになる．一方で，リライトでは，リクエストされたURLをサーバー側で異なるURLに書き換え，サーバーがそのままリクエストを送信する．そのため，クライアント側は古いURLのままリクエストを送信することになる．その他の違いについては，以下を参考にせよ．

参考：https://blogs.iis.net/owscott/url-rewrite-vs-redirect-what-s-the-difference

#### ・リライトとフォワードの違い

リライトでは異なるサーバーにリクエストを送信できるが，フォワードでは同一サーバー内の異なるファイルにアクセスすることしかできない．

<br>

## 03. メッセージ

### メッセージとは

アプリケーション層で生成されるデータを，メッセージという．リクエスト時にクライアント側で生成されるメッセージをリクエストメッセージ，レスポンス時にサーバー側で生成されるメッセージをレスポンスメッセージという．

<br>

### HTTPコンテキスト

#### ・HTTPコンテキスト

特定のリクエストメッセージ/レスポンスメッセージに関するあらゆる情報（リクエストパラメータ，セッション，その他フレームワーク固有の情報など）を扱うための仕組みのこと．特にフレームワークやパッケージでよく使われる用語である．

#### ・.NET Frameworkの場合

.NETのフレームワーク．コンテキストクラスが用意されている．

参考：https://docs.microsoft.com/en-us/dotnet/api/system.web.routing.requestcontext?view=netframework-4.8

#### ・Ginの場合

Goのフレームワーク．コンテキスト構造体が用意されている．

参考：https://pkg.go.dev/github.com/gin-gonic/gin#Context

#### ・Nuxt.jsの場合

JavaScriptのフレームワーク．コンテキストオブジェクトが用意されている．

参考：https://nuxtjs.org/ja/docs/internals-glossary/context/

#### ・Lambdaの場合

フレームワークでなはいが，Lambdaの場合にパラメータとしてcontextオブジェクトが用意されている．

<br>

## 03-02. リクエストメッセージ

### 構造

#### ・GET送信の場合

クエリパラメータに送信するデータを記述する方法．リクエストメッセージは，以下の要素に分類できる．以下では，Web APIのうち，特にRESTfulAPIに対して送信するためのリクエストメッセージの構造を説明する．

```http
GET https://example.com/bar-form.php?text1=a&text2=b
# リクエストされたドメイン名
Host: example.com
Connection: keep-alive
Upgrade-Insecure-Requests: 1
# ブラウザキャッシュの最大有効期限（リクエストヘッダーとレスポンスヘッダーの両方で定義可能）
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
# ※ リバースプロキシサーバー（ALBやCloudFrontなども含む）を経由している場合，それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>
```

#### ・POST送信の場合


クエリパラメータを，URLに記述せず，メッセージボディに記述してリクエストメッセージを送る方法．以下では，Web APIのうち，特にRESTfulAPIに対して送信するためのリクエストメッセージの構造を説明する．メッセージボディに情報が記述されるため，履歴では確認できない．また，SSLによって暗号化されるため，傍受できない．リクエストメッセージは，以下の要素に分類できる．

```http
POST https://example.com/bar-form.php
# リクエストされたドメイン名
Host: example.com
Connection: keep-alive
Content-Length: 15
# ブラウザキャッシュの最大有効期限（リクエストヘッダーとレスポンスヘッダーの両方で定義可能）
Cache-Control: no-store
# オリジン（プロトコル＋ドメイン＋ポート番号）
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
# 各Cookieの値（二回目のリクエスト時に設定される）
Cookie: sessionid=<セッションID>; csrftoken=<トークン>; _gat=1
# 送信元IPアドレス
# ※ リバースプロキシサーバー（ALBやCloudFrontなども含む）を経由している場合，それら全てのIPアドレスも順に設定される
X-Forwarded-For: <client>, <proxy1>, <proxy2>

# ボディ．（SSLによって暗号化されるため閲覧不可）
text=a&text2=b 
```

#### ・例外として，ボディを持つGET送信の場合

GET送信ではあるが，ボディにクエリパラメータを記述して送信する方法がある．

POSTMANで，GET送信にメッセージボディを含めることについて：
https://github.com/postmanlabs/postman-app-support/issues/131

<br>

### 送信例

#### ・PHPの場合

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
        // 文字列型で受信
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

## 03-03. レスポンスメッセージ

### 構造

**＊例＊**

```http
200 OK
# レスポンスで送信するMIMEタイプ
Content-Type: text/html;charset=UTF-8
Transfer-Encoding: chunked
Connection: close
# Webサーバー（nginx，apache，AmazonS3などが表示される）
Server: nginx
Date: Sat, 26 Sep 2020 04:25:08 GMT
# リファラポリシー（nginx，apache，などで実装可能）
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
# ブラウザキャッシュの最大有効期限（リクエストヘッダーとレスポンスヘッダーの両方で定義可能）
Cache-Control: no-cache
# ブラウザキャッシュの最大有効期限（レスポンスヘッダーのみで定義可能）
Expires: Wed, 21 Oct 2015 07:28:00 GMT
Pragma:	no-cache
X-XSS-Protection: 1;
X-Content-Type-Options:	nosniff
Vary: Accept-Encoding,User-Agent,Content-Type,Accept-Encoding,X-Amzn-CDN-Cache,X-Amzn-AX-Treatment,User-Agent
Strict-Transport-Security: max-age=*****; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
# CloudFrontのキャッシュにヒットしたかどうか
X-Cache: Miss from cloudfront
Via: 1.1 *****.cloudfront.net (CloudFront)
X-Amz-Cf-Pop: SEA19-C2
X-Amz-Cf-Id: *****==
# 言語のバージョン（※ php.ini にて，expose_php = Off と設定することで非表示にできる）
X-Powered-By: PHP/7.3.22

# ボディ
ここにサイトのHTMLのコード
```

<br>

### 正常系レスポンスの場合

#### ・POST/PUTでは処理後データをレスポンス

POST/PUTメソッドでは，処理後のデータを200レスポンスとして返信する．もし処理後のデータを返信しない場合，改めてGETリクエストを送信する必要があり，余分なAPIコールが必要になってしまう．

参考：

- https://developer.ntt.com/ja/blog/741a176b-372f-4666-b649-b677dd23e3f3
- https://qiita.com/wim/items/dbb6def4e207f6048735

#### ・DELETEではメッセージのみをレスポンス

DELETEメソッドでは，メッセージのみを200レスポンスとして返信する．空ボディ204レスポンスとして返信してもよい．

参考：

- https://stackoverflow.com/questions/25970523/restful-what-should-a-delete-response-body-contain/50792918
- https://qiita.com/fukuma_biz/items/a9e8d18467fe3e04068e#4-delete---%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E5%89%8A%E9%99%A4

#### ・ステータスコードは不要

正常系レスポンスの場合，オブジェクトデータへのステータスコードの割り当ては不要である．

```bash
{
  "name": "Taro Yamada"
}
```

#### ・フラットなデータ構造にすること

JSONの場合，階層構造にすると，データ容量が増えてしまう．

**＊例＊**

```bash
{
  "name": "Taro Yamada",
  "age": 10,
  "interest": {
    "sports":["soccer", "baseball"],
    "subjects": "math"
  }
}
```

そこで，できるだけデータ構造をフラットにする．ただし，見やすさによっては階層構造も許容される．

参考：https://www.amazon.co.jp/Web-API-The-Good-Parts/dp/4873116864

**＊例＊**

```bash
{
  "name": "Taro Yamada",
  "age": 10,
  "sports":["soccer", "baseball"],
  "subjects": "math"
}
```

あるいは，Content-Typeヘッダーに『```application/hal+json```』『```application/vnd.api+json```』『```application/vnd.collection+json```』といったよりJSONベースの強い制約のフォーマットを利用する．

#### ・日付データの形式に気をつけること

RFC3339（W3C-DTF）形式でオブジェクトデータに含めて送受信すること．

**＊例＊**

````
2020-07-07T12:00:00+09:00
````

ただし，日付をリクエストパラメータで送受信する時，RFC3339（W3C-DTF）形式を正規表現で設定する必要があるので注意．

**＊例＊**

```http
GET https://example.com/users/12345?date=2020-07-07T12:00:00%2B09:00
```

<br>

### 異常系レスポンスの場合

| 項目名                       | 必要性 | データ型 | 説明                                                         |
| -------------------------- | ------ | -------- | ------------------------------------------------------------ |
| エラーメッセージ           | 必須   | 文字列型 | 複数のエラーメッセージを返信できるように，配列として定義する． |
| ステータスコード           | 任意   | 整数型   | エラーの種類がわかるステータスコードを割り当てる．           |
| エラーコード（例外コード） | 任意   | 文字列型 | APIドキュメントのエラーの識別子として，エラコード（例外コード）を割り当てる． |
| APIドキュメントのURL       | 任意   | 文字列型 | 外部に公開するAPIの場合，エラーの解決策がわかるAPIドキュメントのURLを割り当てる． |

```bash
{
  "code": 400
  "errors": [
    "〇〇は必ず入力してください．",
    "□□は必ず入力してください．"
  ]
  "url" : "https://foo-api-doc.co.jp"
}
```

参考：https://qiita.com/suin/items/f7ac4de914e9f3f35884#%E3%82%A8%E3%83%A9%E3%83%BC%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%81%A7%E8%80%83%E6%85%AE%E3%81%97%E3%81%9F%E3%81%84%E3%81%93%E3%81%A8

<br>

## 04. オブジェクトデータ

### オブジェクトデータ

#### ・オブジェクトデータとは

リクエスト（POST）/レスポンスにて，メッセージボディに割り当てて送信/返信するデータのこと．

<br>

### MIME type（Content type）

#### ・MIME typeとは

POST/PUT送信で，ボディパラメータのデータ形式を表現する識別子のこと．リクエストヘッダー/レスポンスヘッダーのContent-Typeヘッダーに割り当てると，オブジェクトデータのデータ型を定義できる．GET送信には不要である．

参考：https://stackoverflow.com/questions/5661596/do-i-need-a-content-type-header-for-http-get-requests

| トップレベルタイプ | サブレベルタイプ      | 意味                                |
| ------------------ | --------------------- | ----------------------------------- |
| application        | octet-stream          | 任意のMIME type（指定なし）を示す． |
|                    | javascript            |                                     |
|                    | json                  |                                     |
|                    | x-www-form-urlencoded | POST送信のデータ                    |
|                    | zip                   |                                     |
| text               | html                  | HTMLテキスト                        |
|                    | css                   | CSSテキスト                         |
|                    | plane                 | プレーンテキスト                    |
| image              | png                   |                                     |
|                    | jpeg                  |                                     |
|                    | gif                   |                                     |

#### ・データ型の指定方法

最も良い方法は，リクエストのContent-Typeヘッダーに，『```application/json```』を設定することである．

```http
POST https://example.com/users/12345
# ヘッダー
Content-Type: application/json
```

他に，URIでデータ型を記述する方法がある．

```http
POST https://example.com/users/12345?format=json
```

<br>

## 05. HTTP/HTTPSプロトコルの擬似ステートフル化

### Cookie，Cookie情報（キー名/値）

#### ・Cookie，Cookie情報とは

クライアントからの次回のリクエスト時でも，Cookie情報（キー名/値のセット）を用いて，同一クライアントと認識できる仕組みをCookieという．HTTPはステートレスなプロトコルであるが，Cookie情報により擬似的にステートフルな通信を行える．

#### ・Cookie情報に関わるヘッダー

最初，サーバーからのレスポンス時，Set-Cookieヘッダーを用いて送信される．反対に，クライアントからのリクエスト時，Cookie情報は，Cookieヘッダーを用いて送信される．


| HTTPメッセージの種類 | ヘッダー名 | 属性     | 内容                                                         |
| -------------------- | ---------- | -------- | ------------------------------------------------------------ |
| レスポンスメッセージ | Set-Cookie | Name     | Cookie名と値                                                 |
|                      |            | Expires  | Cookieの有効期限（日数）                                     |
|                      |            | Max-Age  | Cookieの有効期限（秒数）                                     |
|                      |            | Domain   | クライアントがリクエストする時のCookie送信先ドメイン名．      |
|                      |            | Path     | クライアントがリクエストする時のCookie送信先ディレクトリ     |
|                      |            | Secure   | クライアントからのリクエストでSSLプロトコルが使用されている時のみ，リクエストを送信できるようにする． |
|                      |            | HttpOnly | クライアント側で，JavaScriptがCookieを使用できないようにする．XSS攻撃の対策になる． |
| リクエストメッセージ | Cookie     |          | セッションIDなどのCookie情報                                 |

クライアントから送信されてきたリクエストメッセージのCookieヘッダーの内容は，グローバル変数に格納されている．

```php
<?php
    
$_COOKIE = ["Cookie名" => "値"]
```

#### ・仕組み

1. 最初，ブラウザはリクエストでデータを送信する．
2. サーバーは，レスポンスヘッダーのSet-CookieヘッダーにCookie情報を埋め込んで送信する．

```php
<?php

setcookie(
    Cookie名,
    Cookie値,
    有効日時,
    パス,
    ドメイン,
    HTTPS接続のみ,
    Javascript無効
    ）
```

3. ブラウザは，そのCookie情報を保存する．
4. 2回目以降のリクエストでは，ブラウザは，リクエストヘッダーのCookieヘッダーにCookie情報を埋め込んでサーバーに送信する．サーバーは，Cookie情報に紐付くクライアントのデータをReadする．

![cookie](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/cookie.png)

<br>

### セッション

#### ・セッション，セッションIDとは

![session-id_page-transition](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/session-id_page-transition.png)

特定のサイトを訪問してから，離脱するまでの一連のユーザー操作を『セッション』という．この時，セッションIDを用いると，セッションの各リクエストの送信元を同一クライアントとして識別できる．HTTPはステートレスなプロトコルであるが，セッションIDにより擬似的にステートフルな通信を行える．例えばセッションIDにより，ログイン後にページ遷移を行っても，ログイン情報を保持でき，同一ユーザーからのリクエストとして認識できる．セッションIDは，Cookie情報の1つとして，CookieヘッダーとSet-Cookieヘッダーを用いて送受信される．

```http
# リクエストヘッダーの場合
Cookie: sessionid=<セッションID>; csrftoken=u32t4o3tb3gg43; _gat=1
```


```http
# レスポンスヘッダーの場合
Set-Cookie: sessionId=<セッションID>
```

セッション数はGoogleコンソールで確認できる．GoogleConsoleにおけるセッションについては，以下のリンク先を参考にせよ．

参考：https://support.google.com/analytics/answer/6086069?hl=ja

#### ・セッションIDの発行，セッションファイルの生成

セッションは，```session_start```メソッドを用いることで開始される．また同時に，クライアントにセッションIDを発行する．グローバル変数にセッションIDを代入することによって，セッションIDの記載されたセッションファイルを作成する．セッションIDに紐付くその他のデータはこのセッションファイルに書き込まれていく．セッションファイルの名前は，```sess_*****```ファイルとなっており，セッションファイル名を元にしてセッションIDに紐付くデータを参照する．もしクライアントに既にセッションIDが発行されている場合，セッションファイルを参照するようになる．

**＊実装例＊**

```php
<?php

// セッションの開始．セッションIDを発行する．
session_start();

// セッションファイルを作成
$_SESSION["セッション名"] = "値"; 
```

#### ・セッションファイルの保存場所

セッションファイルの保存場所は```/etc/php.ini```ファイルで定義できる．

```ini
# /etc/php.ini

### ファイル形式
session.save_handler = files
### 保存場所
session.save_path = "/tmp"
```

セッションファイルは，サーバー外（PHP Redis，ElastiCache Redisなど）に保存することもできる．```/etc/php-fpm.d/www.conf```ファイルではなく，```/etc/php.ini```ファイルにて保存先の指定が必要である．ElastiCache Redisについては，以下のリンク先を参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/cloud_computing/cloud_computing_aws.html

```bash
# /etc/php.ini

## Redis形式
session.save_handler = redis
## Amazon RedisのOrigin
session.save_path = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"
```

なお，PHP-FPMを用いている場合は，```/etc/php-fpm.d/www.conf```ファイルにて，セッションファイルの保存先を指定する必要がある．

```bash
# /etc/php-fpm.d/www.conf

## Redis形式
php_value[session.save_handler] = redis
## Amazon RedisのOrigin
php_value[session.save_path] = "tcp://foo-redis.*****.ng.0001.apne1.cache.amazonaws.com:6379"
```

#### ・セッションの有効期限と初期化確率

セッションの有効期限を設定できる．これにより，画面遷移時にログイン情報を保持できる秒数を定義できる．

```ini
# 24時間
session.gc_maxlifetime = 86400
```

ただし，有効期限が切れた後にセッションファイルを初期化するかどうかは確率によって定められている．確率は， 『```gc_probability```÷```gc_divisor```』 で計算される．

参考：https://www.php.net/manual/ja/session.configuration.php#ini.session.gc-divisor

```ini
# 有効期限後に100%初期化されるようにする．
session.gc_probability = 1
session.gc_divisor = 1
```

#### ・仕組み

1. 最初，ブラウザはリクエストでデータを送信する．セッションIDを発行し，セッションIDごとに```sess_*****```ファイルを生成．
2. サーバーは，レスポンスヘッダ情報のCookieヘッダーを用いて，セッションIDを送信する．
3. ブラウザは，そのセッションIDを保存する．
4. 2回目以降のリクエストでは，ブラウザは，リクエストヘッダ情報のCookieヘッダーを用いて，セッションIDをサーバーに送信する．サーバーは，セッションIDに紐付くクライアントのデータをReadする．

![session-id](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/session-id.png)
