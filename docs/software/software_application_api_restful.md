---
title: 【IT技術の知見】RESTful-API＠API
description: RESTful-API＠APIの知見を記録しています。
---

# RESTful-API＠API

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. RESTとRESTfulとは

### REST

#### ▼ RESTとは

分散型アプリケーションを連携させるのに適したアーキテクチャスタイルを REST という。

REST は、以下の特徴を持つ。

![REST](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/REST.jpg)

#### ▼ RESTfulとRESTful-APIとは

REST に基づいた設計を RESTful という。

RESTful 設計が使用された WebAPI を RESTful-API という。

例えば、RESTful-API の場合、DB における UserInfo の CRUD に対して、`1` 個の『/UserInfo』という URI を対応づけている。

![RESTfulAPI](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/RESTfulAPI.png)

<br>

### RESTの４原則

#### ▼ Statelessであること

クライアントに対してレスポンスを返信した後に、クライアントの情報を保持せずに破棄する仕組みのこと。

擬似的にステートフルな通信をするときは、キャッシュ、Cookie、セッション ID を使用して、クライアントの情報を保持する。

| プロトコル         | ステートレス/ステートフル |
| ------------------ | ------------------------- |
| HTTP、HTTPS        | ステートレス              |
| SSH、TLS/SSL、SFTP | ステートフル              |

#### ▼ Connectabilityであること

記入中...

#### ▼ Uniform Interfaceであること

HTTP リクエストを、『リソースに対する操作』とらえ、リクエストに HTTP メソッドを対応づけるようにする。

#### ▼ Addressabilityであること

エンドポイントによって、特定のリソースを操作できること。

<br>

## 02. エンドポイント

### エンドポイントとは

特定のリソースを操作するための固有の URI のこと。

`<IPアドレス、ドメイン>:<ポート番号>` から構成される。

エンドポイント は、リソース 1 つごと、あるいはまとまりごとに割り振られる。

> - https://apidog.com/jp/blog/api-endpoint-and-its-testing/#%E2%91%A1api%E3%82%B5%E3%83%BC%E3%83%90%E3%83%BC

<br>

### HTTPメソッド、エンドポイント、ユースケースの関係

RESTfulAPI では、すべての HTTP メソッドのうち、主に以下の `4` 個を使用して、データ処理の方法をリクエストする。

- GET：閲覧系 API
- POST：登録系 API
- PUT：更新系 API
- DELETE：削除系 API

それぞれが、API のユースケースに対応する。

ユースケースごとのメソッド名については、Laravel を参考にする。

| HTTPメソッド | ユースケース                                                                | エンドポイント                   | メソッド名の例 |
| ------------ | --------------------------------------------------------------------------- | -------------------------------- | -------------- |
| GET          | 複数の閲覧系 (全データのインデックス取得、条件に基づくデータの取得)         | `https://example.com/users`      | list           |
|              | 単一の閲覧系 (IDに基づくデータの取得)                                       | `https://example.com/users/{id}` | get            |
| POST         | 登録系 (データの作成、PDFの作成、ファイルデータの送信、ログイン/ログアウト) | `https://example.com/users`      | register       |
| PUT          | 更新系 (データの更新)                                                       | `https://example.com/users/{id}` | change         |
| DELETE       | 削除系 (データの削除)                                                       | `https://example.com/users/{id}` | delete         |

> - https://noumenon-th.net/programming/2020/01/30/laravel-crud/
> - https://cloud.google.com/discover/what-is-rest-api?hl=ja

POST リクエストと PUT リクエストの重要な違いについてまとめる。

データを作成するユースケースのときは POST リクエスト、または更新するときは PUT リクエストを使用する。

ただしもっと正確には、ユースケースが『作成』or『更新』ではなく、『非冪等』or『冪等』で判断したほうがよい。

|                              | POSTリクエスト                                       | PUTリクエスト                                                                                            |
| ---------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| データ作成の冪等性           | リクエスト1つにつき、`1` 個のデータを作成 (非冪等的) | リクエスト数に限らず、`1` 個のデータを作成する (冪等的) 。古いデータを新しいデータに置換する行為に近い。 |
| リクエストパラメーターの場所 | メッセージボディにJSON型データなどを割り当てる。     | パスパラメーターにidなど、またメッセージボディにJSON型データなどを割り当てる。                           |

> - https://stackoverflow.com/a/2691891/12771072
> - https://restfulapi.net/rest-put-vs-post/

<br>

### エンドポイントの命名

#### ▼ 動詞を使用しないこと

すでに HTTP メソッド自体に動詞の意味合いが含まれるため、エンドポイントに動詞を含めないようにする。

このとき、操作するリソース名がわかりやすいような名詞を使用する。

> - https://cloud.google.com/blog/products/api-management/restful-api-design-nouns-are-good-verbs-are-bad
> - https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-use-nouns-instead-of-verbs-in-endpoint-paths

ただし慣例として、認証のエンドポイントが動詞 (`login`、`logout`、`register`) になることは許容されている。

> - https://stackoverflow.com/questions/7140074/restfully-design-login-or-register-resources
> - https://www.developer.com/web-services/best-practices-restful-api

**＊悪い実装例＊**

```yaml
GET https://example.com/show-user/12345
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/12345
```

```yaml
GET https://example.com/users/foo
```

**＊認証の場合＊**

動詞を許容するのであれば `login` や `logout` とし、名詞を採用するのであれば `session` とする。

```yaml
GET https://example.com/login
```

```yaml
GET https://example.com/session
```

#### ▼ 短くすること

**＊悪い実装例＊**

ここで、`service`、`api`、といったキーワードは、なくても問題ない。

```yaml
GET https://example.com/service/api/users/12345
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ 略称を使用しないこと

**＊悪い実装例＊**

ここで、Users を意味する『`u`』といった略称は、当時の設計者しかわからないため、不要である。

```yaml
GET https://example.com/u/12345
```

**＊よい実装例＊**

略称を使わずに、『users』とする。

```yaml
GET https://example.com/users/12345
```

#### ▼ 小文字を使用すること

**＊悪い実装例＊**

```yaml
GET https://example.com/Users/12345
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ ケバブケースを使用すること

**＊悪い実装例＊**

```yaml
GET https://example.com/users_id/12345
```

**＊よい実装例＊**

スネークケースやキャメケースを使わずに、ケバブケースを使用する。

```yaml
GET https://example.com/users-id/12345
```

ただし、そもそもケバブ方式も利用せずに、スラッシュで区切ってしまうのも手である

```yaml
GET https://example.com/users/id/12345
```

#### ▼ 複数形を使用すること

**＊悪い実装例＊**

Users という集合のなかに、Id が存在しているため、単数形は使用しない。

```yaml
GET https://example.com/user/12345
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ システムの設計方法がバレないURIにすること

**＊悪い実装例＊**

悪意のあるユーザーに、脆弱性を狙われる可能性があるため、ソフトウェアの設計方法がばれないアーキテクチャにすること。

ミドルウェアに CGI プログラムが使用されていることや、php を使用していることがばれてしまう。

```yaml
GET https://example.com/cgi-bin/get_users.php
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ HTTPメソッドの名前を使用しないこと

**＊悪い実装例＊**

メソッドから、処理の目的はわかるため、URI に対応する動詞名を実装する必要はない。

```yaml
GET https://example.com/users/get/12345
```

```yaml
POST https://example.com/users/create/12345
```

```yaml
PUT https://example.com/users/update/12345
```

```yaml
DELETE https://example.com/users/delete/12345
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/{id}
```

```yaml
POST https://example.com/users
```

```yaml
PUT https://example.com/users/{id}
```

```yaml
DELETE https://example.com/users/{id}
```

#### ▼ 数字、バージョン番号をできる限り使用しないこと

**＊悪い実装例＊**

ここで、`alpha`、`v2`、といったキーワードは、当時の設計者しかわからないため、適さない。

ただし、利便上、使用する場合もある。

```yaml
GET https://example.com/v2/users/12345
```

**＊よい実装例＊**

```yaml
GET https://example.com/users/12345
```

URL にバージョンを表記しない代わりに、リクエストヘッダーの `X-api-Version` にバージョン情報を格納する方法がよりよい。

```yaml
X-Api-Version: 1
```

#### ▼ 異なるHTTPメソッドの間でルールを統一すること

**＊悪い実装例＊**

GET リクエストと POST リクエストの間で、ID パラメーターの HTTP メソッドが統一されていない。

```yaml
GET https://example.com/users/?id=12345
```

```yaml
POST https://example.com/users/12345/messages
```

**＊よい実装例＊**

以下のように、異なる HTTP メソッドの間でも統一する。

```yaml
GET https://example.com/users/12345
```

```yaml
POST https://example.com/users/12345/messages
```

<br>

### エンドポイントのパラメーター

#### ▼ パス、クエリストリングへの割り当て

URI の構造のうち、パスまたはクエリストリングにパラメーターを割り当てて送信する。

それぞれ、パスパラメーターまたはクエリパラメーターという。

```yaml
GET https://example.com:80/users/777?text1=a&text2=b
```

| 完全修飾ドメイン名    | 宛先のポート番号 (`80` の場合は省略可) | ルート  | パスパラメーター | ？  | クエリパラメーター (GETリクエスト時のみ) |
| --------------------- | -------------------------------------- | ------- | ---------------- | --- | ---------------------------------------- |
| `https://example.com` | `80`                                   | `users` | `{id}`           | `?` | `text1=a&text2=b`                        |

#### ▼ 使い分け (再掲)

| データの宛先             | パスパラメーター | クエリパラメーター |
| ------------------------ | :--------------: | :----------------: |
| 単一条件で決まる検索処理 |        ⭕        |         △          |
| 複数条件で決まる検索処理 |        ✕         |         ⭕         |
| フィルタリング処理       |        ✕         |         ⭕         |
| ソーティング処理         |        ✕         |         ⭕         |

#### ▼ メッセージボディへの割り当て

JSON 型データ内に定義し、メッセージボディにパラメーターを割り当てて送信する。

```yaml
POST https://example.com
---
# ボディ
{"id": 1, "name": "foo"}
```

#### ▼ リクエストヘッダーへの割り当て

リクエストヘッダーにパラメーターを割り当てて送信する。

送信時のヘッダー名は大文字・小文字のどちらでも問題ない。ただし、内部的に小文字に変換されるため、小文字が推奨である。

API キーのヘッダー名の頭文字に『`X`』を付けるのは、自前ヘッダーの頭文字に『`X`』を付ける慣習があったためである。

ただし、現在は非推奨である。

> - https://developer.mozilla.org/ja/docs/Web/HTTP/Headers

```yaml
POST https://example.com
---
# Authorizationヘッダー
authorization: Bearer <Bearerトークン>
# APIキーヘッダー
x-api-key: *****
```

<br>

## 03. レスポンス

### 正常系レスポンスの場合

#### ▼ POST/PUTでは処理後データをレスポンス

POST/PUT メソッドでは、処理後のデータを 200 レスポンスとして返信する。

もし処理後のデータを返信しない場合、あらためて GET リクエストを送信する必要があり、余分な API コールが必要になってしまう。

> - https://developer.ntt.com/ja/blog/741a176b-372f-4666-b649-b677dd23e3f3
> - https://qiita.com/wim/items/dbb6def4e207f6048735

#### ▼ DELETEではメッセージのみをレスポンス

DELETE メソッドでは、メッセージのみを 200 レスポンスとして返信する。

空ボディ 204 レスポンスとして返信してもよい。

> - https://stackoverflow.com/questions/25970523/restful-what-should-a-delete-response-body-contain/50792918
> - https://qiita.com/fukuma_biz/items/a9e8d18467fe3e04068e#4-delete---%E3%83%AA%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%AE%E5%89%8A%E9%99%A4

#### ▼ ステータスコードは不要

正常系レスポンスの場合、オブジェクトデータへのステータスコードの割り当ては不要である。

```yaml
{"name": "Taro Yamada"}
```

#### ▼ フラットなデータ構造にすること

JSON の場合、階層構造にすると、データサイズが増えてしまう。

**＊例＊**

```yaml
{
  "name": "Taro Yamada",
  "age": 10,
  "interest": {"sports": ["soccer", "baseball"], "subjects": "math"},
}
```

そこで、できるだけデータ構造をフラットにする。

ただし、見やすさによっては階層構造も許容される。

> - https://www.amazon.co.jp/Web-API-The-Good-Parts/dp/4873116864

**＊例＊**

```yaml
{
  "name": "Taro Yamada",
  "age": 10,
  "sports": ["soccer", "baseball"],
  "subjects": "math",
}
```

代わりに、`Content-Type` ヘッダーに『`application/hal+json`』『`application/vnd.api+json`』『`application/vnd.collection+json`』といったより JSON ベースの強い制約のフォーマットを利用してもよい。

#### ▼ 日付データの形式に気をつけること

RFC3339 (W3C-DTF) 形式でオブジェクトデータに含めて送受信すること。

**＊例＊**

```
2020-07-07T12:00:00+09:00
```

ただし、日付をリクエストパラメーターで送受信するとき、RFC3339 (W3C-DTF) 形式を正規表現で設定する必要があるので注意。

**＊例＊**

```yaml
GET https://example.com/users/12345?date=2020-07-07T12:00:00%2B09:00
```

#### ▼ `text/csv` 形式

CSV ファイルダウンロード機能では、データを CSV ファイルとし、`Content-Type` は `text/csv; charset=utf-8` にする。

`Content-Disposition` は `attachment; filename="slo_report.csv"` にする。

これにより、ファイルレスポンスの受信と同時に CSV ファイルをダウンロードできる。

<br>

### 異常系レスポンスの場合

| 項目名                    | 必要性 | データ型  | 説明                                                                              |
| ------------------------- | ------ | --------- | --------------------------------------------------------------------------------- |
| エラーメッセージ          | 必須   | string型  | 複数のエラーメッセージを返信できるように、配列として定義する。                    |
| ステータスコード          | 任意   | integer型 | エラーの種類がわかるステータスコードを割り当てる。                                |
| エラーコード (例外コード) | 任意   | string型  | APIドキュメントのエラーの識別子として、エラコード (例外コード) を割り当てる。     |
| APIドキュメントのURL      | 任意   | string型  | 外部に公開するAPIの場合、エラーの解決策がわかるAPIドキュメントのURLを割り当てる。 |

```yaml
{
  "code": 400,
  "errors": ["〇〇は必ず入力してください。", "□□は必ず入力してください。"],
  "url": "https://foo-api-doc.co.jp",
}
```

> - https://qiita.com/suin/items/f7ac4de914e9f3f35884#%E3%82%A8%E3%83%A9%E3%83%BC%E3%83%AC%E3%82%B9%E3%83%9D%E3%83%B3%E3%82%B9%E3%81%A7%E8%80%83%E6%85%AE%E3%81%97%E3%81%9F%E3%81%84%E3%81%93%E3%81%A8

<br>
