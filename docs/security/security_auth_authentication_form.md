---
title: 【IT技術の知見】Form認証＠認証
description: Form認証＠認証の知見を記録しています。
---

# Form認証＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Form認証とは

認証時に、`Cookie`ヘッダー値を使用する認証スキームのこと。

『Cookieベースの認証』ともいう。

ステートフル化を行うため、HTTP認証には所属していない。

認証情報の一時的な保管は、サーバーのセッションデータで行うため、認証解除 (ログアウト) をサーバー側で制御できる。

`Cookie`ヘッダーによる送受信では、CSRFの危険性がある。

> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf
> - https://auth0.com/docs/sessions/cookies#cookie-based-authentication

<br>

## 02. 認証情報の運搬

### 運搬方法が`Cookie`ヘッダーの場合

#### ▼ セッションIDで認証情報を伝播する場合

`(1)`

: セッションIDを`Cookie`ヘッダーに割り当て、リクエストを送信する。

`(2)`

: 最初、ユーザー作成の段階で、クライアントが認証情報をサーバーに送信する。サーバーは、認証情報をDBに保管する。

```yaml
POST https://example.com/users
---
# ボディ
{"email_address": "foo@gmail.com", "password": "foo"}
```

`(3)`

: 次回の認証時に、再びユーザーが認証情報を送信する。

```yaml
POST https://example.com/foo-form
---
# ボディ
{"email_address": "foo@gmail.com", "password": "foo"}
```

`(4)`

: サーバーは、DBの認証情報を照合し、ログインを許可する。サーバーは、セッションIDを作成し、セッションデータに書き込む。

```yaml
# セッションデータ
{ sessionid: ***** }
```

`(5)`

: レスポンスの`Set-Cookie`ヘッダーにセッションIDを割り当て、クライアントに送信する。

```yaml
200 OK
---
Set-Cookie: sessionid=<セッションID>
```

`(6)`

: サーバーは、セッションIDとユーザーIDを紐付けてサーバー内に保管する。

     加えて次回のログイン時、クライアントは、リクエストの`Cookie`ヘッダーにセッションIDを割り当て、クライアントに送信する。

     サーバーは、保管されたセッションIDに紐付くユーザーIDから、ユーザーを特定し、ログインを許可する。

     これにより、改めて認証情報を送信せずに、素早くログインできるようになる。

```yaml
POST https://example.com/foo-form
---
cookie: sessionid=<セッションID>
```

`(7)`

: 認証解除時、サーバーでセッションデータを削除する。

> - https://blog.tokumaru.org/2013/02/purpose-and-implementation-of-the-logout-function.html

#### ▼ トークンで認証情報を伝播する場合

トークン (例：アクセストークン、IDトークン、など) を`Cookie`ヘッダーに割り当て、リクエストを送信する。

この時のトークンの選択肢として、単なるランダムな文字列やJWTがある。

![JWT](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/JWT.png)

> - https://scrapbox.io/fendo181/JWT(JSON_Web_Token)%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B%E3%80%82

<br>

### 運搬方法がクエリストリングの場合

> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf

<br>

## 03. 認証情報の保管

### 運搬方法がCookieの場合

初回認証以降に、認証の成功状態を維持する必要がある。

`Cookie`ヘッダーで認証情報を運搬した場合、ブラウザは、クライアントに有効期限に応じた間だけ保持できる。

またはブラウザの設定によって、ブラウザのWebストレージでも保持できる。

**＊例＊**

Chromeの場合は、Cookieストレージ (MacOSであれば`/Users/<ユーザー名>/Library/Application Support/Google/Chrome/Default/Cookies`にある) に保持する。

> - https://developer.chrome.com/docs/devtools/storage/cookies/
> - https://qiita.com/EasyCoder/items/8ce7dfd75d05079be9d7#cookie%E3%81%AF%E3%81%A9%E3%81%93%E3%81%AB%E4%BF%9D%E5%AD%98%E3%81%95%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>
