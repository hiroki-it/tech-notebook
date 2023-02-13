---
title: 【IT技術の知見】Authenticate（認証）＠認証/認可
description: Authenticate（認証）＠認証/認可の知見を記録しています。
---

# Authenticate（認証）＠認証/認可

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 認証とは

通信しているユーザーが誰であるかを特定する。



<br>

## 02. 認証の種類

### HTTP認証

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/security/security_auth_authentication_http.html

<br>

### Form認証（Cookieベースの認証）

#### ▼ Form認証とは

認証時に、```Cookie```ヘッダーの値を使用する認証スキームのこと。

『Cookieベースの認証』ともいう。

ステートフル化を行うため、HTTP認証には属していない。

認証情報の一時的な保存は、サーバーのセッションデータで行うため、認証解除（ログアウト）をサーバー側で制御できる。

```Cookie```ヘッダーによる送受信では、CSRFの危険性がある。



> ↪️ 参考：
>
> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf
> - https://auth0.com/docs/sessions/cookies#cookie-based-authentication

#### ▼ セッションIDを使用したForm認証の場合

```【１】```

:    セッションIDを```Cookie```ヘッダーに割り当て、リクエストを送信する。

```【２】```

:    最初、ユーザー作成の段階で、クライアントが認証情報をサーバーに送信する。サーバーは、認証情報をDBに保存する。

```yaml
POST https://example.com/users
---
# ボディ
{
    "email_address": "foo@gmail.com",
    "password": "foo"
}
```

```【３】```

:    次回の認証時に、再びユーザーが認証情報を送信する。

```yaml
POST https://example.com/foo-form
---
# ボディ
{
    "email_address": "foo@gmail.com",
    "password": "foo"
}
```

```【４】```

:    サーバーは、DBの認証情報を照合し、ログインを許可する。サーバーは、セッションIDを作成し、セッションデータに書き込む。

```yaml
# セッションデータ
{ sessionid: ***** }
```

```【５】```

:    レスポンスの```Set-Cookie```ヘッダーを使用して、セッションIDをクライアントに送信する。

```yaml
200 OK
---
Set-Cookie: sessionid=<セッションID>
```

```【６】```

:    サーバーは、セッションIDとユーザーIDを紐付けてサーバー内に保存する。加えて次回のログイン時、クライアントは、リクエストの```Cookie```ヘッダーを使用して、セッションIDをクライアントに送信する。サーバーは、保存されたセッションIDに紐付くユーザーIDから、ユーザーを特定し、ログインを許可する。これにより、改めて認証情報を送信せずに、素早くログインできるようになる。

```yaml
POST https://example.com/foo-form
---
cookie: sessionid=<セッションID>
```

```【７】```

:    認証解除時、サーバーでセッションデータを削除する。

> ↪️ 参考：https://blog.tokumaru.org/2013/02/purpose-and-implementation-of-the-logout-function.html

#### ▼ トークンを使用したForm認証の場合

トークンを```Cookie```ヘッダーに割り当て、リクエストを送信する。

この時のトークンの選択肢として、単なるランダムな文字列やJWTがある。

![JWT](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/JWT.png)


> ↪️ 参考：https://scrapbox.io/fendo181/JWT(JSON_Web_Token)%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B%E3%80%82


#### ▼ ```Cookie```ヘッダーの値のクライアント保持

再利用のため、```Cookie```ヘッダーに割り当てるための値（セッションID、トークン）は、ブラウザを通して、ローカルマシンに有効期限に応じた間だけ保持できる。

またはブラウザの設定によって、ブラウザのWebストレージでも保持できる。

Chromeの場合は、Cookieストレージに保持される。

確認方法については、以下のリンクを参考にせよ。



> ↪️ 参考：
>
> - https://developer.chrome.com/docs/devtools/storage/cookies/
> - https://qiita.com/cobachan/items/05fa537a4ffcb189d001

<br>

### APIキー認証

#### ▼ APIキー認証とは

事前にAPIキーとなる文字列を配布し、認証フェースは行わずに認可フェーズのみでユーザーを照合する認証スキームのこと。



#### ▼ 照合情報の送信方法

独自ヘッダーとして、```x-api-key```ヘッダーを定義する。これにAPIキーを割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
x-api-key: <APIキー>
```

<br>

### PAT：Personal Access Tokenによる認証

#### ▼ PATによる認証

クライアントがPersonal Access Token（個人用アクセストークン）の付与をリクエストし、認証フェースは行わずに認可フェーズのみでユーザーを照合する。

```Authorization```ヘッダーにPATを割りあてて、リクエストを送信する。

作成時以降、アクセストークンを確認できなくなるため、クライアントがアクセストークンを管理する必要がある。

```yaml
POST https://example.com/foo
---
authorization: <Personal Acccess Token>
```

| サービス例 | トークン名                | 説明                                                                                                                                                                                                                      |
|--------|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| GitHub | Personal access Token | HTTPSを使用して、プライベートリポジトリにリクエストを送信するために必要。HTTPSを使用する場面として、アプリケーションの拡張機能のGitHub連携、リポジトリのパッケージ化、などがある。<br>↪️ 参考：https://docs.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token |

> ↪️ 参考：https://www.contentful.com/help/personal-access-tokens/


<br>


## 03. 複数の認証の組み合わせ

### TSV：Two Step Verification（二段階認証）

#### ▼ 二段階認証とは

```2```個の認証方法を設定し、クライアントを照合する。



| 一段階目の認証例 | 二段階目の認証例 | 説明                                                       | 備考                           |
|-----------------|-----------------|----------------------------------------------------------|--------------------------------|
| IDとパスワード        | IDとパスワード        | IDとパスワードによる方法の後、別のIDとパスワードによる方法を設定する。              |                                |
|                 | 秘密の質問       | IDとパスワードによる方法の後、質問に対してあらかじめ設定した回答による方法を設定する。 |                                |
|                 | SMS             | IDとパスワードによる方法の後、SMS宛に送信した認証コードによる方法を設定する。      | 異なる要素のため、これは二要素認証でもある。 |
|                 | 指紋            | IDとパスワードによる方法の後、指紋の解析結果による方法を設定する。            | 異なる要素のため、これは二要素認証でもある。 |

<br>

### TFA：Two Factor Authorization（二要素認証）

#### ▼ 二要素認証とは

二段階認証のうちで特に、認証時に異なる要素の方法を使用して、段階的にクライアントを照合すること方法のこと。



| 一要素目の認証例 | 二要素目の認証例                                     |
|-----------------|---------------------------------------------------|
| IDとパスワード（知識）  | 事前に連携登録されたQRコード読込アプリで発行したワンタイムパスワード（所持） |
|                 | 事前登録された電話番号のSMSで受信したワンタイムパスワード（所持）      |
|                 | 事前登録された電話番号のSMSで受信した認証コード（所持）         |
|                 | OAuth（所持）                                         |
|                 | 指紋（生体）                                          |
| 暗証番号（知識）  | キャッシュカード（所持）                                      |

<br>

### MFA：Multiple Factor Authorization（多要素認証）

#### ▼ 多要素認証とは

調査中...

<br>

