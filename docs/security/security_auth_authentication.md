---
title: 【IT技術の知見】認証＠認証/認可
description: 認証＠認証/認可の知見を記録しています。
---

# 認証＠認証/認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 認証とは

通信しているユーザーが誰であるかを特定する。

基本的に、認証の実装は認可に依存しない。

<br>

## 02. 認証の種類

### HTTP認証

> - https://architecting.hateblo.jp/entry/2020/03/27/033758
> - https://hiroki-it.github.io/tech-notebook/security/security_auth_authentication_http.html

<br>

### Form認証

> - https://architecting.hateblo.jp/entry/2020/03/27/033758
> - https://hiroki-it.github.io/tech-notebook/security/security_auth_authentication_form.html

<br>

### APIキー認証

#### ▼ APIキー認証とは

事前にAPIキーとなる文字列を配布し、認証フェーズは行わずに認可フェーズのみでユーザーを照合する認証スキームのこと。

> - https://architecting.hateblo.jp/entry/2020/03/27/033758

#### ▼ 照合情報の送信方法

自前ヘッダーとして、`x-api-key`ヘッダーを定義する。これにAPIキーを割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
x-api-key: <APIキー>
```

<br>

### PAT：パーソナルアクセストークンによる認証

#### ▼ PATによる認証

クライアントがパーソナルアクセストークン (個人用アクセストークン) の付与をリクエストし、認証フェーズは行わずに認可フェーズのみでユーザーを照合する。

`Authorization`ヘッダーにPATを割りあてて、リクエストを送信する。

作成時以降、アクセストークンを確認できなくなるため、クライアントがアクセストークンを管理する必要がある。

```yaml
POST https://example.com/foo
---
authorization: <パーソナルアクセストークン>
```

| サービス例 | トークン名                 | 説明                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub     | パーソナルアクセストークン | HTTPSプロトコルを使用して、プライベートリポジトリにリクエストを送信するために必要。HTTPSプロトコルを使用する場面として、アプリケーションの拡張機能のGitHub連携、リポジトリのパッケージ化、などがある。<br>- https://docs.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token |

> - https://www.contentful.com/help/personal-access-tokens/
> - https://architecting.hateblo.jp/entry/2020/03/27/033758

<br>

## 03. 認証情報の伝播方法の種類

### セッションベースの伝播

#### ▼ セッションベースの伝播とは

セッションデータで認証情報を伝播する認証方法 (例：Form認証、など) である。

システムの各コンポーネントがセッションデータを持つ必要がある。

セッションは有効期限が短く、漏洩した場合に脆弱性が高くなる。

作成と削除が頻繁に起こるコンテナでは、セッションデータが消失する可能性があるため、セッションベースとコンテナの相性は悪い。

いずれかのコンポーネントでセッションデータが消失しても復元できるように、SessionStorageを使用する必要がある。

> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

<br>

### トークンベースの伝播

#### ▼ トークンベースの伝播とは

トークン (例：アクセストークン、IDトークン、など) で認証情報を伝播する認証方法 (例：APIキー認証、PAT、OIDC、など) である。

システムの各コンポーネントはトークンを持つ必要がない。

作成と削除が頻繁に起こるコンテナでは、トークンの消失を考慮する必要がなく、トークンベースとコンテナの相性は良い。

一方で、トークンは無効化が難しく漏洩した場合に脆弱性が高くなる、有効期限を短く設定する必要がある。

> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

#### ▼ トークンの種類

トークンには以下の種類がある。

- アクセストークン
- JWT仕様のアクセストークン
- IDトークン (必ずJWT仕様)

> - https://qiita.com/TakahikoKawasaki/items/1c1bcf24b46ebd2030f5#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3jwtid%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E5%8C%85%E5%90%AB%E9%96%A2%E4%BF%82

<br>

## 04. 認証情報の運搬方法の種類

### `Cookie`ヘッダーによる運搬

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

### クエリストリングによる運搬

> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf

<br>

## 05. 認証情報の保管の種類

### SessionStorage

セッションIDで認証情報を伝播した場合に、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、SessionStorageにセッションIDを保管する。

ブラウザを閉じると、ブラウザはSessionStorageのセッションIDを破棄し、認証はやり直しになる。

> - https://zenn.dev/simsim/articles/3f3e043dd750e8
> - https://magazine.techacademy.jp/magazine/32870

<br>

### LocalStorage

トークンで認証情報を伝播した場合に、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、LocalStorageにトークンを保管する。

ブラウザを閉じても、ブラウザはLocalStorageのトークンを破棄せず、認証の成功状態を維持できる。

> - https://zenn.dev/simsim/articles/3f3e043dd750e8
> - https://magazine.techacademy.jp/magazine/32870

<br>

### ローカルマシンのディレクトリ (`Cookie`ディレクトリ)

トークン (例：アクセストークン、IDトークン、など) で認証情報を伝播した場合に、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、ローカルマシンのディレクトリ (`Cookie`ディレクトリ) にトークンを保管する。

ブラウザを閉じても、ブラウザはローカルマシンのディレクトリのトークンを破棄せず、認証の成功状態を維持できる。

**＊例＊**

ローカルマシンがMacOSであれば、Chromeは`/Users/<ユーザー名>/Library/Application Support/Google/Chrome/Default/Cookies`ディレクトリに`Cookie`ヘッダーの値を保管する。

> - https://developer.chrome.com/docs/devtools/storage/cookies/
> - https://qiita.com/EasyCoder/items/8ce7dfd75d05079be9d7#cookie%E3%81%AF%E3%81%A9%E3%81%93%E3%81%AB%E4%BF%9D%E5%AD%98%E3%81%95%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>

## 06. 複数の認証の組み合わせ

### TSV：Two Step Verification (二段階認証)

#### ▼ 二段階認証とは

`2`個の認証方法を設定し、クライアントを照合する。

| 一段階目の認証例 | 二段階目の認証例 | 説明                                                                                   | 備考                                         |
| ---------------- | ---------------- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| IDとパスワード   | IDとパスワード   | IDとパスワードによる方法の後、別のIDとパスワードによる方法を設定する。                 |                                              |
|                  | 秘密の質問       | IDとパスワードによる方法の後、質問に対してあらかじめ設定した回答による方法を設定する。 |                                              |
|                  | SMS              | IDとパスワードによる方法の後、SMS宛に送信した認証コードによる方法を設定する。          | 異なる要素のため、これは二要素認証でもある。 |
|                  | 指紋             | IDとパスワードによる方法の後、指紋の解析結果による方法を設定する。                     | 異なる要素のため、これは二要素認証でもある。 |

<br>

### TFA：Two Factor Authorization (二要素認証)

#### ▼ 二要素認証とは

二段階認証のうちで特に、認証時に異なる要素の方法を使用して、段階的にクライアントを照合すること方法のこと。

| 一要素目の認証例      | 二要素目の認証例                                                                        |
| --------------------- | --------------------------------------------------------------------------------------- |
| IDとパスワード (知識) | 事前に連携登録されたPC端末のQRコード読込アプリで発行したワンタイムパスワード (所持)     |
|                       | 事前に連携登録されたスマホ端末のQRコード読込アプリで発行したワンタイムパスワード (所持) |
|                       | 事前登録されたスマホ端末の電話番号のSMSで受信したワンタイムパスワード (所持)            |
|                       | 事前登録されたスマホ端末の電話番号のSMSで受信した認証コード (所持)                      |
|                       | OAuth (所持)                                                                            |
|                       | 指紋 (生体)                                                                             |
| 暗証番号 (知識)       | キャッシュカード (所持)                                                                 |

> - https://www.quix.jp/quix/two-factor-authentication/

<br>

### MFA：Multiple Factor Authorization (多要素認証)

#### ▼ 多要素認証とは

記入中...

<br>
