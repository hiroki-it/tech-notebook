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

通信しているユーザーが誰であるかを識別する。

基本的に、認証の実装は認可に依存しない。

<br>

## 02. 認証の種類

### 分類

|                                 | セッションベースの認証情報                                                                                                                      | トークンベースの認証情報                                                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cookieヘッダーによる伝播        | セッションデータを認証情報として、Cookieヘッダーで伝播する。セッションデータは、再利用のためにブラウザのCookieに保存する。<br>(例) Form認証など | トークンを認証情報として、Cookieヘッダーで伝播する。トークンは、再利用のためにブラウザのCookieに保存する。<br>(例) SSOなど                                                         |
| Authorizationヘッダーによる伝播 | なし                                                                                                                                            | トークンを認証情報として、Authorizationヘッダーで伝播する。トークンは、再利用のためにブラウザのSessionStorageやLocalStorageに保存する。<br>(例) JWT仕様トークンによる認証、SSOなど |

<br>

### HTTP認証

> - https://architecting.hateblo.jp/entry/2020/03/27/033758
> - https://hiroki-it.github.io/tech-notebook/security/security_auth_authentication_http.html

<br>

### Form認証

> - https://architecting.hateblo.jp/entry/2020/03/27/033758
> - https://hiroki-it.github.io/tech-notebook/security/security_auth_authentication_form.html

<br>

## 03. 認証属性

### realm

#### ▼ realmとは

認証管理におけるテナントのようなもの。

realmごとに認証を管理する。

例えばKeycloakであれば、Adminユーザーの認証はmaster realmで、それ以外はユーザー定義のrealm、で管理する。

> - https://www.seil.jp/doc/index.html#fn/pppac/cmd/authentication_realm.html
> - https://keycloak-documentation.openstandia.jp/21.0/ja_JP/server_admin/index.html#the-master-realm

#### ▼ realmの粒度

マイクロサービスアーキテクチャでは、横断的なrealm (こちらがよさそう) 、または各マイクロサービスでrealmを作成するとよい。

> - https://github.com/vicjicaman/microservice-realm

<br>

### クライアントID

#### ▼ クライアントIDとは

IDプロバイダーのクライアントのIDを表す。

#### ▼ クライアントIDの粒度

マイクロサービスアーキテクチャでは、横断的なクライアントID 、またはマイクロサービスでクライアントID (こちらがよさそう) を作成するとよい。

<br>

## 04. 認証情報の種類

### セッションベースの認証情報

#### ▼ セッションベースの認証情報とは

セッションデータで認証情報を伝播する認証方法 (例：Form認証など) である。

システムの各コンポーネントがセッションデータを持つ必要がある。

セッションは有効期限が短く、漏洩した場合に脆弱性が高くなる。

作成と削除が頻繁に起こるコンテナでは、セッションデータが消失する可能性があるため、セッションベースの認証情報とコンテナの相性は悪い。

いずれかのコンポーネントでセッションデータが消失しても復元できるように、SessionStorageを使用する必要がある。

> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

#### ▼ トークンベースの認証情報を使用した認証方法

- JWT仕様トークンによる認証
- SSO

<br>

### トークンベースの認証情報

#### ▼ トークンベースの認証情報とは

トークン (例：JWT仕様あるいはそうではないアクセストークン、IDトークンなど) で認証情報を伝播する認証方法 (例：SSO、パーソナルアクセストークンなど) である。

システムの各コンポーネントはトークンを持つ必要がない。

作成と削除が頻繁に起こるコンテナでは、トークンの消失を考慮する必要がなく、トークンベースとコンテナの相性は良い。

一方で、トークンは無効化が難しく漏洩した場合に脆弱性が高くなる、有効期限を短く設定する必要がある。

> - https://zenn.dev/oreilly_ota/articles/31d66fab5c184e#%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%A8%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E8%AA%8D%E8%A8%BC%E3%81%AE%E9%81%95%E3%81%84

#### ▼ トークンベースの認証情報を使用した認証方法

- JWT仕様トークンによる認証
- SSO

#### ▼ トークンの種類

トークンには以下の種類がある。

Self-containedトークンでは、トークン自体に署名と有効期限が含まれている。

Opaqueトークンでは、トークンはランダム値で、署名と有効期限はDBで管理されている。

| トークンの種類                | トークンの情報タイプ                      |
| ----------------------------- | ----------------------------------------- |
| JWT仕様でないアクセストークン | Self-containedトークン、Opaqueトークン    |
| JWT仕様アクセストークン       | JWT仕様なためSelf-containedトークン       |
| IDトークン                    | 必ずJWT仕様であり、Self-containedトークン |
| リフレッシュトークン          | Self-containedトークン、Opaqueトークン    |
| パーソナルアクセストークン    | 記入中...                                 |

> - https://qiita.com/TakahikoKawasaki/items/1c1bcf24b46ebd2030f5#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3jwtid%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E5%8C%85%E5%90%AB%E9%96%A2%E4%BF%82
> - https://zenn.dev/mikakane/articles/tutorial_for_openid#oidc-%E5%88%A9%E7%94%A8%E3%81%95%E3%82%8C%E3%82%8B-id-token-%E3%81%AE%E8%A6%8F%E7%B4%84
> - https://medium.com/@iamprovidence/token-gang-bearer-token-reference-token-opaque-token-self-contained-token-jwt-access-token-6e0191093cd0

#### ▼ パーソナルアクセストークン

クライアントがパーソナルアクセストークン (個人用アクセストークン) の付与をリクエストし、認証フェーズは行わずに認可フェーズのみでユーザーを照合する。

`Authorization`ヘッダーにPATを割りあてて、リクエストを送信する。

作成時以降、パーソナルアクセストークンを確認できなくなるため、クライアントがパーソナルアクセストークンを管理する必要がある。

```yaml
POST https://example.com/foo
---
Authorization: <パーソナルアクセストークン>
```

| サービス例 | トークン名                 | 説明                                                                                                                                                                                                                                                                                                  |
| ---------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub     | パーソナルアクセストークン | HTTPSプロトコルを使用して、プライベートリポジトリにリクエストを送信するために必要。HTTPSプロトコルを使用する場面として、アプリケーションの拡張機能のGitHub連携、リポジトリのパッケージ化などがある。<br>- https://docs.github.com/ja/github/authenticating-to-github/creating-a-personal-access-token |

> - https://www.contentful.com/help/personal-access-tokens/
> - https://architecting.hateblo.jp/entry/2020/03/27/033758

<br>

### その他

#### ▼ APIキー認証

事前にAPIキーとなる文字列を配布し、認証フェーズは行わずに認可フェーズのみでユーザーを照合する認証スキームのこと。

信頼されたクライアントに発行することが前提のため、トークンよりも有効期限が長い (有効期限がない場合もある) 。

自前ヘッダーとして、`x-api-key`ヘッダーを定義する。これにAPIキーを割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
x-api-key: <APIキー>
```

> - https://architecting.hateblo.jp/entry/2020/03/27/033758
> - https://www.gomomento.com/blog/api-keys-vs-tokens-whats-the-difference

<br>

<br>

## 05. 認証情報の伝播方法の種類

### `Cookie`ヘッダーによる伝播

#### ▼ 適するユースケース

フロントエンドアプリケーションが以下の場合に適する。

- CSR
- SSR

#### ▼ セッションデータで認証情報を伝播する場合

セッションベースの認証情報の場合に、セッションデータを`Cookie`ヘッダーで伝播する。

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

: レスポンスの`Set-Cookie`ヘッダーにセッションIDを割り当て、クライアントに送信する。`Set-Cookie`ヘッダーにより、クライアントは`Cookie`ヘッダーを設定しなければいけなくなる。

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

#### ▼ トークンを認証情報とする場合

トークンベースの認証情報の場合に、トークン (例：アクセストークン、IDトークンなど) を`Cookie`ヘッダーで伝播する。

CSRFトークンと組み合わせるとさらに良くなる。

なお、APIではリクエストの送受信時に`Cookie`ヘッダーよりも`Authorization`ヘッダーの方が扱いやすいため、`Authorization`ヘッダーでトークンを運ぶことになる。

また、スマホアプリも`Cookie`ヘッダーより`Authorization`ヘッダーがいいらしい。

![JWT](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/JWT.png)

> - https://scrapbox.io/fendo181/JWT(JSON_Web_Token)%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B%E3%80%82
> - https://softwareengineering.stackexchange.com/a/141434
> - https://www.bokukoko.info/entry/2015/12/20/%E8%AA%8D%E8%A8%BC%E3%82%92%E5%90%AB%E3%82%80_API_%E9%96%8B%E7%99%BA%E3%81%A7%E6%A4%9C%E8%A8%8E%E3%81%99%E3%81%B9%E3%81%8D%E3%81%93%E3%81%A8
> - https://stackoverflow.com/a/72182434
> - https://qiita.com/ledmonster/items/0ee1e757af231aa927b1#%E8%AA%8D%E8%A8%BC%E3%81%AE%E5%9F%BA%E6%9C%AC%E6%96%B9%E9%87%9D

<br>

### `Authorization`ヘッダーによる伝播

#### ▼ 適するユースケース

フロントエンドアプリケーションが以下の場合に適する。

- CSR

#### ▼ セッションデータで認証情報を伝播する場合

セッションベースの認証情報の場合は、セッションデータを`Authorization`ヘッダーで伝播することはない。

#### ▼ トークンで認証情報を伝播する場合

トークンベースの認証情報の場合に、トークンを`Authorization`ヘッダーで伝播する。

```yaml
POST https://example.com/foo
---
authorization: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

なお不便ではあるが、`Authorization`ヘッダーは`Cookie`ヘッダーとは異なり、ローカルマシンに保管できない。

その代わり、ブラウザの設定によって、ブラウザのWebストレージで保管できる (Chromeでは、LocalStorageあるいはSessionStorage) 。

なお、APIではリクエストの送受信時に`Cookie`ヘッダーよりも`Authorization`ヘッダーの方が扱いやすいため、`Authorization`ヘッダーでトークンを運ぶことになる。

また、スマホアプリも`Cookie`ヘッダーより`Authorization`ヘッダーがいいらしい。

> - https://qiita.com/hirohero/items/d74bc04e16e6d05d2a4a
> - https://softwareengineering.stackexchange.com/a/141434
> - https://www.bokukoko.info/entry/2015/12/20/%E8%AA%8D%E8%A8%BC%E3%82%92%E5%90%AB%E3%82%80_API_%E9%96%8B%E7%99%BA%E3%81%A7%E6%A4%9C%E8%A8%8E%E3%81%99%E3%81%B9%E3%81%8D%E3%81%93%E3%81%A8
> - https://stackoverflow.com/questions/72180420/is-there-any-reason-to-use-http-header-authorization-to-send-jwt-token-instead-o/72182434#72182434
> - https://qiita.com/ledmonster/items/0ee1e757af231aa927b1#%E8%AA%8D%E8%A8%BC%E3%81%AE%E5%9F%BA%E6%9C%AC%E6%96%B9%E9%87%9D

<br>

### クエリストリングによる伝播

例えば、Google APIではAPIキーをクエリストリングに割り当てる。

> - https://qiita.com/sakuraya/items/6f1030279a747bcce648#%E8%AA%8D%E8%A8%BC
> - https://h50146.www5.hpe.com/products/software/security/icewall/iwsoftware/report/pdfs/certification.pdf

<br>

## 06. 認証情報の保管の種類

### ブラウザのSessionStorage

#### ▼ ブラウザのSessionStorageとは

ブラウザのストレージ機能であり、ブラウザを閉じると削除される。

#### ▼ セッションIDの保存

フロントエンドアーキテクチャがCSRの場合に採用できる。

SSRのアプリケーションはブラウザを操作できないため、ブラウザのLocalStorageをSSRのアプリケーションに渡せない。

セッションIDで認証情報を伝播した場合に、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、SessionStorageにセッションIDを保管する。

ブラウザを閉じると、ブラウザはSessionStorageのセッションIDを破棄し、認証はやり直しになる。

```html
<!-- string型で値を設定する必要がある -->
<script>
  window.sessionStorage.setItem("session_id", "*****");
</script>
```

```html
<script>
  const access_token = window.sessionStorage.getItem("session_id");
  const header = new Headers();
  header.set("Cookie", "session_id");
</script>
```

```html
<script>
  window.sessionStorage.removeItem("session_id");
</script>
```

```html
<script>
  window.sessionStorage.clear();
</script>
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage#%E4%BE%8B
> - https://zenn.dev/simsim/articles/3f3e043dd750e8
> - https://magazine.techacademy.jp/magazine/32870
> - https://mizumotok.hatenablog.jp/entry/2021/08/04/114431#%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A7%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E4%BF%9D%E5%AD%98%E3%81%A7%E3%81%8D%E3%82%8B%E5%A0%B4%E6%89%80

#### ▼ 場所

**＊例＊**

ローカルマシンがMacOSであれば、Chromeは`~/Library/Application Support/Google/Chrome/<Profile>/Local Storage/`ディレクトリに保管する。

> - https://stackoverflow.com/questions/8634058/where-the-sessionstorage-and-localstorage-stored

<br>

### ブラウザのLocalStorage

#### ▼ ブラウザのLocalStorageとは

ブラウザのストレージ機能であり、明示的に削除しない限りは保存し続ける。

#### ▼ トークンの保存

フロントエンドアーキテクチャがCSRの場合に採用できる。

CSRのアプリケーションはブラウザを操作できるため、ブラウザのLocalStorageにトークンを保存できる。

一方で、SSRのアプリケーションはこれを操作できないため、ブラウザのLocalStorageにトークンを保存できない。

トークン (例：アクセストークン、IDトークンなど) で認証情報を伝播した場合に、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、LocalStorageにトークンを保管する。

ブラウザを閉じても、ブラウザはLocalStorageのトークンを破棄せず、認証の成功状態を維持できる。

LocalStorageはSessionStorageと比べて保管期間が長いため、XSSの危険性がより高い。

```html
<script>
  window.localStorage.setItem("access_token", "*****");
</script>
```

```html
<script>
  const access_token = window.localStorage.getItem("access_token");
  const header = new Headers();
  header.set("Authorization", "Bearer " + access_token);
</script>
```

```html
<script>
  window.localStorage.removeItem("access_token");
</script>
```

```html
<script>
  window.localStorage.clear();
</script>
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage#%E4%BE%8B
> - https://qiita.com/masuda-sankosc/items/cff6131efd6e1b5138e6#%E6%A7%8B%E6%96%87

#### ▼ 認証後の閲覧履歴の保存

閲覧した情報をLocalStorageに保存しておく。

次回のログイン時に、最近閲覧した情報として表示する。

> - https://webliker.info/web-skill/how-to-use-localstrage/

#### ▼ 場所

> - https://developer.chrome.com/docs/devtools/storage/localstorage/
> - https://zenn.dev/simsim/articles/3f3e043dd750e8
> - https://magazine.techacademy.jp/magazine/32870
> - https://mizumotok.hatenablog.jp/entry/2021/08/04/114431#%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A7%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%82%92%E4%BF%9D%E5%AD%98%E3%81%A7%E3%81%8D%E3%82%8B%E5%A0%B4%E6%89%80

**＊例＊**

ローカルマシンがMacOSであれば、Chromeは`~/Library/Application Support/Google/Chrome/<Profile>/Local Storage/`ディレクトリに保管する。

> - https://stackoverflow.com/a/27612275/12771072

<br>

### ブラウザのCookie

#### ▼ ブラウザのCookieとは

ブラウザのストレージ機能であり、明示的に削除しない限りは保存し続ける。

> - https://developer.chrome.com/docs/devtools/storage/cookies/

#### ▼ トークンの保存

フロントエンドアプリケーションがCSRまたはSSRの場合に採用できる。

CSRまたはSSRのアプリケーションは、`Cookie`ヘッダーを介してブラウザのCookieにトークンを保存できる。

トークン (例：アクセストークン、IDトークンなど) で認証情報を伝播した場合に、初回認証以降に、認証の成功状態を維持する必要がある。

ブラウザは、Cookieにトークンを保管する。

ブラウザを閉じても、ブラウザはCookieのトークンを破棄せず、認証の成功状態を維持できる。

> - https://github.com/vercel/next.js/discussions/39915#discussioncomment-3467720
> - https://zenn.dev/link/comments/90928f69712b11
> - https://zenn.dev/marton/articles/67f7ec30cda716

#### ▼ 場所

**＊例＊**

クライアントPCがMacOSであれば、Chromeは`/Users/<ユーザー名>/Library/Application Support/Google/Chrome/Default/Cookies`ディレクトリに`Cookie`ヘッダーの値を保管する。

> - https://qiita.com/EasyCoder/items/8ce7dfd75d05079be9d7#cookie%E3%81%AF%E3%81%A9%E3%81%93%E3%81%AB%E4%BF%9D%E5%AD%98%E3%81%95%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B

<br>

### サーバー側のアプリケーションのセッション

フロントエンドアプリケーションがSSRの場合に採用できる。

アプリケーションのセッションファイル上で管理する。

<br>

### サーバー側のセッションストレージツール (例：Redis)

フロントエンドアプリケーションがSSRの場合に採用できる。

> - https://redis.io/solutions/authentication-token-storage/

<br>

## 07. 複数の認証の組み合わせ

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
