---
title: 【IT技術の知見】RESTful-API＠アプリケーション連携
description: RESTful-API＠アプリケーション連携の知見を記録しています。
---

# RESTful-API＠アプリケーション連携

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. RESTとRESTfulとは

### REST

#### ▼ RESTとは

分散型アプリケーションを連携させるのに適したアーキテクチャスタイルをRESTという。

RESTは、以下の特徴を持つ。

![REST](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/REST.jpg)

#### ▼ RESTfulとRESTful-APIとは

RESTに基づいた設計をRESTfulという。

RESTful設計が使用されたWebAPIをRESTful-APIという。

例えば、RESTful-APIの場合、DBにおけるUserInfoのCRUDに対して、`1`個の『/UserInfo』というURIを対応づけている。

![RESTfulAPI](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/RESTfulAPI.png)

<br>

### RESTの４原則

#### ▼ Statelessであること

クライアントに対してレスポンスを返信した後に、クライアントの情報を保持せずに破棄する仕組みのこと。

擬似的にステートフルな通信を行う時は、キャッシュ、Cookie、セッションIDを使用して、クライアントの情報を保持する。

| プロトコル         | ステートレス/ステートフル |
| ------------------ | ------------------------- |
| HTTP、HTTPS        | ステートレス              |
| SSH、TLS/SSL、SFTP | ステートフル              |

#### ▼ Connectabilityであること

記入中...

#### ▼ Uniform Interfaceであること

HTTPプロトコルを使用したリクエストを、『リソースに対する操作』とらえ、リクエストにHTTPメソッドを対応づけるようにする。

#### ▼ Addressabilityであること

エンドポイントによって、特定のリソースを操作できること。

<br>

## 02. エンドポイント

### エンドポイントとは

特定のリソースを操作するための固有のURIのこと。

エンドポイント は、リソース1つごと、あるいはまとまりごとに割り振られる。

<br>

### HTTPメソッド、エンドポイント、ユースケースの関係

RESTfulAPIでは、全てのHTTPメソッドの内、主に以下の`4`個を使用して、データ処理の方法をリクエストする。

それぞれが、APIのユースケースに対応する。

ユースケースごとのメソッド名については、Laravelを参考にする。

| HTTPメソッド | エンドポイント                   | ユースケース                                                                     | メソッド名の例  |
| ------------ | -------------------------------- | -------------------------------------------------------------------------------- | --------------- |
| GET          | `https://example.com/users`      | ・全データのインデックス取得<br>・条件に基づくデータの取得                       | index           |
|              | `https://example.com/users/{id}` | IDに基づくデータの取得                                                           | show            |
| POST         | `https://example.com/users`      | ・データの作成<br>・PDFの作成<br>・ファイルデータの送信<br>・ログイン/ログアウト | create、store   |
| PUT`         | `https://example.com/users/{id}` | データの更新 (置換)                                                              | update          |
| DELETE       | `https://example.com/users/{id}` | データの削除                                                                     | delete、destroy |

> ↪️ 参考：https://noumenon-th.net/programming/2020/01/30/laravel-crud/

POST送信とPUT送信の重要な違いについてまとめる。

データを作成するユースケースの時はPOST送信、または更新する時はPUT送信を使用する。

ただしもっと正確には、ユースケースが『作成』or『更新』ではなく、『非冪等』or『冪等』で判断したほうが良い。

|                              | POST送信                                            | PUT送信                                                                                                 |
| ---------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| データ作成の冪等性           | リクエスト1つにつき、`1`個のデータを作成 (非冪等的) | リクエスト数に限らず、`1`個のデータを作成する (冪等的) 。古いデータを新しいデータに置換する行為に近い。 |
| リクエストパラメーターの場所 | メッセージボディにJSON型データなどを割り当てる。    | パスパラメーターにidなど、またメッセージボディにJSON型データなどを割り当てる。                          |

> ↪️ 参考：
>
> - https://stackoverflow.com/a/2691891/12771072
> - https://restfulapi.net/rest-put-vs-post/

<br>

### エンドポイントの命名

#### ▼ 動詞を使用しないこと

すでにHTTPメソッド自体に動詞の意味合いが含まれるため、エンドポイントに動詞を含めないようにする。

この時、アクセスするリソース名がわかりやすいような名詞を使用する。

> ↪️ 参考：
>
> - https://cloud.google.com/blog/products/api-management/restful-api-design-nouns-are-good-verbs-are-bad
> - https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-use-nouns-instead-of-verbs-in-endpoint-paths

ただし慣例として、認証のエンドポイントが動詞 (`login`、`logout`、`register`) になることは許容されている。

> ↪️ 参考：
>
> - https://stackoverflow.com/questions/7140074/restfully-design-login-or-register-resources
> - https://www.developer.com/web-services/best-practices-restful-api

**＊悪い実装例＊**

```yaml
GET https://example.com/show-user/12345
```

**＊良い実装例＊**

```yaml
GET https://example.com/users/12345
```

```yaml
GET https://example.com/users/foo
```

**＊認証の場合＊**

動詞を許容するのであれば`login`や`logout`とし、名詞を採用するのであれば`session`とする。

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

**＊良い実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ 略称を使用しないこと

**＊悪い実装例＊**

ここで、Usersを意味する『`u`』といった略称は、当時の設計者しかわからないため、不要である。

```yaml
GET https://example.com/u/12345
```

**＊良い実装例＊**

略称を使わずに、『users』とする。

```yaml
GET https://example.com/users/12345
```

#### ▼ 小文字を使用すること

**＊悪い実装例＊**

```yaml
GET https://example.com/Users/12345
```

**＊良い実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ ケバブケースを使用すること

**＊悪い実装例＊**

```yaml
GET https://example.com/users_id/12345
```

**＊良い実装例＊**

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

Usersという集合の中に、Idが存在しているため、単数形は使用しない。

```yaml
GET https://example.com/user/12345
```

**＊良い実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ システムの設計方法がバレないURIにすること

**＊悪い実装例＊**

悪意のあるユーザーに、脆弱性を狙われる可能性があるため、ソフトウェアの設計方法がばれないアーキテクチャにすること。

ミドルウェアにCGIプログラムが使用されていることや、phpを使用していることがばれてしまう。

```yaml
GET https://example.com/cgi-bin/get_users.php
```

**＊良い実装例＊**

```yaml
GET https://example.com/users/12345
```

#### ▼ HTTPメソッドの名前を使用しないこと

**＊悪い実装例＊**

メソッドから、処理の目的はわかるため、URIに対応する動詞名を実装する必要はない。

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

**＊良い実装例＊**

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

**＊良い実装例＊**

```yaml
GET https://example.com/users/12345
```

URLにバージョンを表記しない代わりとして、リクエストヘッダーの`X-api-Version`にバージョン情報を格納する方法がより良い。

```yaml
X-Api-Version: 1
```

#### ▼ 異なるHTTPメソッドの間でルールを統一すること

**＊悪い実装例＊**

GET送信とPOST送信の間で、IDパラメーターのHTTPメソッドが統一されていない。

```yaml
GET https://example.com/users/?id=12345
```

```yaml
POST https://example.com/users/12345/messages
```

**＊良い実装例＊**

以下の様に、異なるHTTPメソッドの間でも統一する。

```yaml
GET https://example.com/users/12345
```

```yaml
POST https://example.com/users/12345/messages
```

<br>

### エンドポイントのパラメーター

#### ▼ パス、クエリストリングへの割り当て

URIの構造のうち、パスまたはクエリストリングにパラメーターを割り当てて送信する。

それぞれ、パスパラメーターまたはクエリパラメーターという。

```yaml
GET https://example.com:80/users/777?text1=a&text2=b
```

| 完全修飾ドメイン名    | 宛先のポート番号 (`80`の場合は省略可) | ルート  | パスパラメーター | ？  | クエリパラメーター (GET送信時のみ) |
| --------------------- | ------------------------------------- | ------- | ---------------- | --- | ---------------------------------- |
| `https://example.com` | `80`                                  | `users` | `{id}`           | `?` | `text1=a&text2=b`                  |

#### ▼ 使い分け (再掲)

| データの宛先             | パスパラメーター | クエリパラメーター |
| ------------------------ | :--------------: | :----------------: |
| 単一条件で決まる検索処理 |        ⭕        |         △          |
| 複数条件で決まる検索処理 |        ✕         |         ⭕         |
| フィルタリング処理       |        ✕         |         ⭕         |
| ソーティング処理         |        ✕         |         ⭕         |

#### ▼ メッセージボディへの割り当て

JSON型データ内に定義し、メッセージボディにパラメーターを割り当てて送信する。

```yaml
POST https://example.com
---
# ボディ
{"id": 1, "name": "foo"}
```

#### ▼ リクエストヘッダーへの割り当て

リクエストヘッダーにパラメーターを割り当てて送信する。

送信時のヘッダー名は大文字でも小文字でもいずれでも問題ないが、内部的に小文字に変換されるため、小文字が推奨である。

APIキーのヘッダー名の頭文字に『`X`』を付けるのは、独自ヘッダーの頭文字に『`X`』を付ける慣習があったためである。

ただし、現在は非推奨である。

> ↪️ 参考：https://developer.mozilla.org/ja/docs/Web/HTTP/Headers

```yaml
POST https://example.com
---
# Authorizationヘッダー
authorization: Bearer ${Token}
# APIキーヘッダー
x-api-key: *****
```

<br>
