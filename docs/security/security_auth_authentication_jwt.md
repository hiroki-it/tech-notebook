---
title: 【IT技術の知見】JWT＠認証
description: JWT＠認証の知見を記録しています。
---

# JWT＠認証

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. JWT：JSON Web Token

### JWTとは

『ヘッダー』『ペイロード』『署名』のそれぞれのJSON型データを`base64`方式によってエンコードし、ドットでつないだトークン。

Bear認証やOAuthのトークンとして使用できる。

ランダムな文字列をこれら認証のトークンとするより、JWTを使用した方がより安全である。

> - https://meetup-jp.toast.com/3511
> - https://dev.classmethod.jp/articles/json-signing-jws-jwt-usecase/

<br>

### JWT仕様のトークンの種類

JWT仕様のトークンには以下の種類がある。

- JWT仕様のアクセストークン
- IDトークン (必ずJWT仕様)

> - https://qiita.com/TakahikoKawasaki/items/1c1bcf24b46ebd2030f5

<br>

## 02. JWTによるトークンベース伝播による認証の仕組み

### 署名が共通鍵方式の場合

#### ▼ 共通鍵方式の特徴

共通鍵方式では、秘密鍵を使用してJWT作成 (初回認証時) とJWT検証 (次回認証時) の両方を実施する。

#### ▼ 初回認証時

ここでは、Form認証でJWTによるトークンベース伝播を採用する。

1. ユーザーは、ログインフォームにユーザーIDとパスワードを入力する (Form認証)
2. アプリケーションは、フォームの入力情報を含むリクエストを受信し、認証処理を実行する
3. 認証が成功すれば、アプリケーションは秘密鍵を使用してJWTを作成する
4. アプリケーションは、JWTをレスポンスに含め、ユーザーに返信する
5. ブラウザは、JWTをLocalStorageやローカルマシン (`Cookie`ディレクトリ) に保管する

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%B1%E9%80%9A%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

#### ▼ 次回認証時

認証の成功状態を維持するため、初回認証時にブラウザの保管したJWTを再利用する。

1. ユーザーは、ブラウザの保管したJWTをリクエストに含め、アプリケーションに送信する
2. アプリケーションは、秘密鍵を使用して、JWTが有効か否かを検証する
3. JWTが有効であれば、認証成功とし、ユーザーにレスポンスを返信する

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%B1%E9%80%9A%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

<br>

### 署名が公開鍵方式の場合

#### ▼ 公開鍵方式の特徴

共通鍵方式では、秘密鍵を使用してJWT作成 (初回認証時) 、公開鍵を使用してJWT検証 (次回認証時) を実施する。

#### ▼ 初回認証時

例えば、SSOはJWTの署名が公開鍵方式である。

1. ユーザーは、IDプロバイダーのログインフォームにユーザーIDとパスワードを入力する
2. IDプロバイダーは、フォームの入力情報を含むリクエストを受信し、認証処理を実行する
3. 認証が成功すれば、IDプロバイダーは秘密鍵を使用してJWTを作成する
4. IDプロバイダーは、JWTをレスポンスに含め、ユーザーに返信する
5. ブラウザは、JWTをLocalStorageやローカルマシン (`Cookie`ディレクトリ) に保管する

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%AC%E9%96%8B%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

#### ▼ 次回認証時

1. ユーザーは、ブラウザの保管したJWTをリクエストに含め、アプリケーションに送信する
2. アプリケーションは、IDプロバイダーに公開鍵をリクエストする
3. IDプロバイダーは、アプリケーションに公開鍵をレスポンスする
4. アプリケーションは、IDプロバイダーから取得した公開鍵を使用して、JWTが有効か否かを検証する
5. JWTが有効であれば、認証成功とし、ユーザーにレスポンスを返信する

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%AC%E9%96%8B%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

<br>

## 03. JWTの運搬方法

### HTTP認証の場合

#### ▼ Bearer認証

トークンを`authorization`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
authorization: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

<br>

### Form認証の場合

トークンを`Cookie`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
cookie: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

<br>

## 04. JWTの作成

### JWT作成の全体像

JWTは以下のサイトから取得できる。

> - https://jwt.io/

例えばJavaScriptであれば、以下のような処理を実行し、JWTを作成する。

```javascript
// <ヘッダーエンコード値>.<ペイロードエンコード値>.<署名エンコード値>
const token =
  base64urlEncoding(header) +
  "." +
  base64urlEncoding(payload) +
  "." +
  base64urlEncoding(signature);
```

> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#jwt-%E3%81%AE%E3%83%87%E3%83%BC%E3%82%BF%E6%A7%8B%E9%80%A0

<br>

### JWTの作成

#### ▼ ヘッダーの場合

ヘッダーは以下のJSON型データで定義される。

署名のための暗号アルゴリズムは、『`HS256` (共通鍵方式) 』『`RS256` (公開鍵方式) 』『`ES256`』『`none` (署名なし) 』から選択できる。

```javascript
const header = {
  typ: "JWT", // JWTの使用
  alg: "HS256", // 署名のための暗号アルゴリズム
};
```

> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#%E3%83%98%E3%83%83%E3%83%80

#### ▼ ペイロードの場合

ペイロードは以下のJSON型データで定義される。

ペイロードには、実際に送信したいJSONを設定する。

必ず設定しなければならない『予約済みクレーム』と、ユーザー側が自由に定義できる『プライベートクレーム』がある。

| パラメーター名 | 対応するクレーム | 役割                      | 例         |
| -------------- | ---------------- | ------------------------- | ---------- |
| `sub`          | Subject          | 一意な識別子を設定する。  | ユーザーID |
| `iss`          | Issuer           |                           |            |
| `aud`          | Audience         |                           |            |
| `exp`          | Expiration Time  | JWTの有効期限を設定する。 |            |
| `jti`          | JWT ID           |                           |            |

```javascript
const payload = {
  sub: "foo",
  aud: "foo",
  iss: "https://example.com",
  exp: 1452565628,
  iat: 1452565568,
};
```

> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#%E3%83%9A%E3%82%A4%E3%83%AD%E3%83%BC%E3%83%89
> - https://qiita.com/TakahikoKawasaki/items/8f0e422c7edd2d220e06#64-jwt-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0

#### ▼ 署名の場合

例えばJavaScriptであれば、以下のような処理が実行されている。

```javascript
const signature = HMACSHA256(
  base64urlEncoding(header) + "." + base64urlEncoding(payload),
  secret,
);
```

<br>

## 05. JWTの保持方法と安全度の比較

| クライアント保持方法                                           | 組み合わせ             | おすすめ度 | コメント                                                            |
| -------------------------------------------------------------- | ---------------------- | :--------: | ------------------------------------------------------------------- |
| `Cookie`ヘッダー (ローカルマシンのディレクトリ) 、LocalStorage | JWTのみ                |   △ 〜 ×   | いずれの方法でも、XSSによってJWTが盗まれる可能性がある。            |
| `Cookie`ヘッダー                                               | プリフライトリクエスト |     △      | Access-Control-Max-Ageの期間内だとCSRFでJWTが盗まれる可能性がある。 |
| `Cookie`ヘッダー                                               | CSRFトークン           |     ⭕     |                                                                     |
| SameSiteCookie                                                 |                        |     ⭕     | SPAとAPIが同一オリジンの必要がある。                                |

> - https://qiita.com/Hiro-mi/items/18e00060a0f8654f49d6#%E6%97%A9%E8%A6%8B%E8%A1%A8
> - https://blog.flatt.tech/entry/auth0_access_token_poc

<br>

## 06. JWTの代替

- fernet token
- branca-token
- PASETO

> - https://qiita.com/take4s5i/items/009b0b6797b752921a78#paseto

<br>
