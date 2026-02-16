---
title: 【IT技術の知見】認証アーティファクトの運搬＠認証アーティファクトによる分類
description: 認証アーティファクトの運搬＠認証アーティファクトによる分類の知見を記録しています。
---

# 認証アーティファクトの運搬＠認証アーティファクトによる分類

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 運搬方法の一覧

マイクロサービスアーキテクチャの文脈では、各認証アーティファクトにさまざまな運搬媒体があります。

セッションID、アクセストークンであるJWTトークンやOpaqueトークン、APIキーはHTTP/1.1リクエストの `Cookie` ヘッダーや `Authorization` ヘッダーで運搬できます。

HTTP/2では、ヘッダー名は小文字にする必要があります。

| HTTP/1.1                     | HTTP/2                       | **セッションID** | **JWTトークン** | Opaqueトークン | APIキー |
| ---------------------------- | ---------------------------- | :--------------: | :-------------: | :------------: | :-----: |
| **`Cookie` ヘッダー**        | **`cookie` ヘッダー**        |       ✔︎        |       ✔︎       |      ✔︎       |         |
| **`Authorization` ヘッダー** | **`authorization` ヘッダー** |        無        |       ✔︎       |      ✔︎       |   ✔︎   |
| **カスタムヘッダー**         | **カスタムヘッダー**         |                  |                 |                |   ✔︎   |
| **クエリパラメーター**       | `:path` ヘッダー             |                  |                 |                |         |

<br>

## 02. `Cookie` ヘッダーによる運搬

### 適するユースケース

フロントエンドアプリケーションが以下の場合に適する。

- CSR
- SSR

<br>

### セッションIDを運搬する場合

セッションベース認証の場合、セッションIDを `Cookie` ヘッダーで運搬する。

`(1)`

: セッションIDを `Cookie` ヘッダーに割り当て、リクエストを送信する。

`(2)`

: 最初、ユーザー作成の段階で、クライアントが資格情報をサーバーに送信する。サーバーは、資格情報をDBに保管する。

```yaml
POST https://example.com/users
---
# ボディ
{"email_address": "foo@gmail.com", "password": "foo"}
```

`(3)`

: 次回の認証時に、再びユーザーが資格情報を送信する。

```yaml
POST https://example.com/foo-form
---
# ボディ
{"email_address": "foo@gmail.com", "password": "foo"}
```

`(4)`

: サーバーは、DBの資格情報を照合し、ログインを許可する。サーバーは、セッションIDを作成し、セッションIDに書き込む。

```yaml
# セッションID
{ sessionid: ***** }
```

`(5)`

: レスポンスの `Set-Cookie` ヘッダーにセッションIDを割り当て、クライアントに送信する。`Set-Cookie` ヘッダーにより、クライアントは `Cookie` ヘッダーを設定しなければいけなくなる。

```yaml
200 OK
---
Set-Cookie: sessionid=<セッションID>
```

`(6)`

: サーバーは、セッションIDとユーザーIDを紐付けてサーバー内に保管する。

     加えて次回のログイン時、クライアントは、リクエストの`Cookie`ヘッダーにセッションIDを割り当て、クライアントに送信する。

     サーバーは、保管したセッションIDに紐付くユーザーIDから、ユーザーを特定し、ログインを許可する。

     これにより、改めて資格情報を送信せずに、素早くログインできるようになる。

```yaml
POST https://example.com/foo-form
---
cookie: sessionid=<セッションID>
```

`(7)`

: 認証解除時、サーバーでセッションIDを削除する。

> - https://blog.tokumaru.org/2013/02/purpose-and-implementation-of-the-logout-function.html

<br>

### アクセストークンを運搬する場合

トークンベース認証の場合、アクセストークンを `Cookie` ヘッダーで運搬する。

CSRFトークンと組み合わせるとさらに良くなる。

なお、APIではリクエストの送受信時に `Cookie` ヘッダーよりも `Authorization` ヘッダーの方が扱いやすいため、`Authorization` ヘッダーでアクセストークンを運搬することになる。

また、スマホアプリも `Cookie` ヘッダーより `Authorization` ヘッダーがいいらしい。

![JWT](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/JWT.png)

> - https://scrapbox.io/fendo181/JWT(JSON_Web_Token)%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B%E3%80%82
> - https://softwareengineering.stackexchange.com/a/141434
> - https://www.bokukoko.info/entry/2015/12/20/%E8%AA%8D%E8%A8%BC%E3%82%92%E5%90%AB%E3%82%80_API_%E9%96%8B%E7%99%BA%E3%81%A7%E6%A4%9C%E8%A8%8E%E3%81%99%E3%81%B9%E3%81%8D%E3%81%93%E3%81%A8
> - https://stackoverflow.com/a/72182434
> - https://qiita.com/ledmonster/items/0ee1e757af231aa927b1#%E8%AA%8D%E8%A8%BC%E3%81%AE%E5%9F%BA%E6%9C%AC%E6%96%B9%E9%87%9D

<br>

## 03. `Authorization` ヘッダーによる運搬

### 適するユースケース

フロントエンドアプリケーションが以下の場合に適する。

- CSR

<br>

### セッションIDを運搬する場合

セッションベース認証の場合は、セッションIDを `Authorization` ヘッダーで運搬することはない。

<br>

### アクセストークンを運搬する場合

トークンベース認証の場合、アクセストークンを `Authorization` ヘッダーで運搬する。

```yaml
POST https://example.com/foo
---
authorization: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

なお不便ではあるが、`Authorization` ヘッダーは `Cookie` ヘッダーとは異なり、ローカルマシンに保管できない。

その代わり、ブラウザの設定によって、ブラウザのWebストレージで保管できる (Chromeでは、LocalStorageあるいはSessionStorage) 。

なお、APIではリクエストの送受信時に `Cookie` ヘッダーよりも `Authorization` ヘッダーの方が扱いやすいため、`Authorization` ヘッダーでアクセストークンを運搬することになる。

また、スマホアプリも `Cookie` ヘッダーより `Authorization` ヘッダーがいいらしい。

> - https://qiita.com/hirohero/items/d74bc04e16e6d05d2a4a
> - https://softwareengineering.stackexchange.com/a/141434
> - https://www.bokukoko.info/entry/2015/12/20/%E8%AA%8D%E8%A8%BC%E3%82%92%E5%90%AB%E3%82%80_API_%E9%96%8B%E7%99%BA%E3%81%A7%E6%A4%9C%E8%A8%8E%E3%81%99%E3%81%B9%E3%81%8D%E3%81%93%E3%81%A8
> - https://stackoverflow.com/questions/72180420/is-there-any-reason-to-use-http-header-authorization-to-send-jwt-token-instead-o/72182434#72182434
> - https://qiita.com/ledmonster/items/0ee1e757af231aa927b1#%E8%AA%8D%E8%A8%BC%E3%81%AE%E5%9F%BA%E6%9C%AC%E6%96%B9%E9%87%9D

<br>

## 04. クエリストリングによる運搬

例えば、Google APIではAPIキーをクエリストリングに割り当てる。

> - https://qiita.com/sakuraya/items/6f1030279a747bcce648#%E8%AA%8D%E8%A8%BC
> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf

<br>
