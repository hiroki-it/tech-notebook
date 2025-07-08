---
title: 【IT技術の知見】JWT＠認証アーティファクトによる分類
description: JWT＠認証アーティファクトによる分類の知見を記録しています。
---

# JWT＠認証アーティファクトによる分類

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. JWT：JSON Web Token

### JWTとは

『ヘッダー』『ペイロード』『署名』のそれぞれのJSON型データを`base64`方式によってエンコードし、ドットでつないだトークン。

JWTでエンコードされたトークンは、JWTトークンという。

Bear認証やOAuthのトークンとして使用できる。

ランダムな文字列をこれら認証のトークンとするより、JWTを使用した方がより安全である。

> - https://meetup-jp.toast.com/3511
> - https://dev.classmethod.jp/articles/json-signing-jws-jwt-usecase/

<br>

## 04. JWTトークンの構造

### JWTトークンの作成

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

### JWTトークンの構造

#### ▼ ヘッダー

ヘッダーは以下のJSON型データで定義される。

署名のための暗号アルゴリズムは、『`HS256` (共通鍵方式) 』『`RS256` (公開鍵方式) 』『`ES256`』『`none` (署名なし) 』から選択できる。

```javascript
const header = {
  typ: "JWT", // JWTトークンの使用
  alg: "HS256", // 署名のための暗号アルゴリズム
};
```

> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#%E3%83%98%E3%83%83%E3%83%80

#### ▼ ペイロード

ペイロードは以下のJSON型データで定義される。

ペイロードには、実際に送信したいJSONを設定する。

必ず設定しなければならない『予約済みクレーム』と、ユーザー側が自由に定義できる『プライベートクレーム』がある。

| クレーム名 | 説明            | ユーザーが設定する | 役割                                      | 例         |
| ---------- | --------------- | ------------------ | ----------------------------------------- | ---------- |
| `aud`      | Audience        | ✅                 |                                           |            |
| `exp`      | Expiration Time |                    | JWTトークンの有効期限を表す。             |            |
| `iat`      | Issuer At       |                    | 発行時刻を表す                            |            |
| `iss`      | Issuer          | ✅                 | JWTトークンの発行元IDプロバイダーを表す。 |            |
| `jti`      | JWT ID          | ✅                 |                                           |            |
| `sub`      | Subject         | ✅                 | 一意な識別子を表す。                      | ユーザーID |

```javascript
const payload = {
  aud: "foo",
  exp: 1452565628,
  iat: 1452565568,
  iss: "https://example.com",
  jti: "foo",
  sub: "foo",
};
```

> - https://kamichidu.github.io/post/2017/01/24-about-json-web-token/
> - https://zenn.dev/mikakane/articles/tutorial_for_jwt#%E3%83%9A%E3%82%A4%E3%83%AD%E3%83%BC%E3%83%89
> - https://qiita.com/TakahikoKawasaki/items/8f0e422c7edd2d220e06#64-jwt-%E3%82%AF%E3%83%AC%E3%83%BC%E3%83%A0

#### ▼ 署名

ヘッダーとペイロードをbase64方式でエンコードし、公開鍵と秘密鍵のペア (暗号化アルゴリズムによる) と暗号化アルゴリズムで暗号化した文字列である。

例えばJavaScriptであれば、以下のような処理が実行されている。

JWTを検証する場合、この署名の値を使用する。

```javascript
const signature = HMACSHA256(
  base64urlEncoding(header) + "." + base64urlEncoding(payload),
  secret,
);
```

<br>

### JWTトークンの種類

JWTトークンには以下の種類がある。

| トークンの種類   | トークンの情報タイプ                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| アクセストークン | IDプロバイダーのツールによってはJWT仕様 (例：Keycloak) なためSelf-containedトークン |
| IDトークン       | 必ずJWT仕様であり、Self-containedトークン                                           |

> - https://qiita.com/TakahikoKawasaki/items/1c1bcf24b46ebd2030f5#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3jwtid%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E5%8C%85%E5%90%AB%E9%96%A2%E4%BF%82
> - https://zenn.dev/mikakane/articles/tutorial_for_openid#oidc-%E5%88%A9%E7%94%A8%E3%81%95%E3%82%8C%E3%82%8B-id-token-%E3%81%AE%E8%A6%8F%E7%B4%84

<br>

## 02. JWTトークンの検証の仕組み

### 検証とは

JWTトークン (例：IDトークン) の情報 (署名部分、有効期限、発行元など) から、JWTトークンの署名を検証できる。

> - https://qiita.com/nokonoko_1203/items/966dc356c3763136c368#%E6%A4%9C%E8%A8%BC%E3%81%A3%E3%81%A6%E3%81%AA%E3%81%AB%E3%82%92%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E3%81%AE

<br>

### 検証方法の種類

JWTの署名の検証方法には以下があり、公開鍵による検証が一般的である。

以下のいずれかの方法で検証できる。

- 認可サーバーから取得した公開鍵のセット (JWKセット)
- 認可サーバーから取得した共通鍵
- 認可サーバーのイントロスペクションエンドポイント

> - https://qiita.com/nokonoko_1203/items/966dc356c3763136c368#%E3%81%A1%E3%81%AA%E3%81%BF%E3%81%ABrs256%E3%81%AE%E5%A0%B4%E5%90%88
> - https://zenn.dev/ringo_to/articles/5cf471e5e48b9a#%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B9%E3%83%88%E3%83%BC%E3%82%AF%E3%83%B3%E3%81%AE%E6%A4%9C%E8%A8%BC%E6%96%B9%E6%B3%95%E3%81%AB%E3%81%AF%E4%BA%8C%E3%81%A4%E3%81%AE%E6%96%B9%E6%B3%95%E3%81%8C%E3%81%82%E3%82%8B

<br>

### 署名が公開鍵方式の場合

#### ▼ 公開鍵方式の特徴

共通鍵方式では、秘密鍵を使用してJWT作成 (初回認証時) 、公開鍵を使用してJWT検証 (次回認証時) を実施する。

例えば、SSOでは、JWTトークンの署名が公開鍵方式である。

クライアント側に秘密鍵、IDプロバイダー側に公開鍵を配置する。

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%AC%E9%96%8B%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

#### ▼ 初回認証時

初回認証時は、JWTを作成する。

1. ユーザーは、IDプロバイダーのログインフォームにユーザーIDとパスワードを入力する。
2. IDプロバイダーは、フォームの入力情報を含むリクエストを受信し、認証処理を実行する。また、DBのユーザー情報と照合して認証処理を実行する。
3. 認証が成功すれば、IDプロバイダーは秘密鍵を使用してJWTを作成する。
4. IDプロバイダーは、JWTをレスポンスに含め、ユーザーに返信する。
5. ブラウザは、JWTをLocalStorageやCookieに保管する。

![jwt_public_generate_token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jwt_public_generate_token.png)

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%AC%E9%96%8B%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

#### ▼ 次回認証時

認証の成功状態を維持するため、初回認証時にブラウザの保管したJWTを再利用する。

1. ユーザーは、ブラウザの保管したJWTをリクエストヘッダーに含め、アプリケーションに送信する。
2. アプリケーションは、IDプロバイダーに公開鍵をリクエストする。
3. IDプロバイダーは、アプリケーションに公開鍵をレスポンスする。
4. アプリケーションは、IDプロバイダーから取得した公開鍵を使用してJWTの情報 (署名部分、有効期限、発行元など) から、JWTトークンの署名を検証する。
5. JWTが有効であれば、アプリケーションの認証処理は成功とし、ユーザーにレスポンスを返信する

![jwt_public_verify_token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jwt_public_verify_token.png)

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%AC%E9%96%8B%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88
> - https://qiita.com/nokonoko_1203/items/966dc356c3763136c368#%E6%A4%9C%E8%A8%BC%E3%81%A3%E3%81%A6%E3%81%AA%E3%81%AB%E3%82%92%E3%81%A9%E3%81%86%E3%81%99%E3%82%8B%E3%81%AE

<br>

### 署名が共通鍵方式の場合

#### ▼ 共通鍵方式の特徴

共通鍵方式では、秘密鍵を使用してJWT作成 (初回認証時) とJWT検証 (次回認証時) の両方を実施する。

例えば、SSOではない認証では、JWTトークンの署名が公開鍵方式である。

ユーザー側とアプリケーション側に秘密鍵を配置する。

#### ▼ 初回認証時

初回認証時は、JWTを作成する。

1. ユーザーは、ログインフォームにユーザーIDとパスワードを入力する。
2. アプリケーションは、フォームの入力情報を含むリクエストを受信する。また、DBのユーザー情報と照合して認証処理を実行する。
3. 認証が成功すれば、アプリケーションは秘密鍵を使用してJWTを作成する。
4. アプリケーションは、JWTをレスポンスに含め、ユーザーに返信する。
5. ブラウザは、JWTをLocalStorageやCookieに保管する。

![jwt_common_generate_token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jwt_common_generate_token.png)

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%B1%E9%80%9A%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

#### ▼ 次回認証時

認証の成功状態を維持するため、初回認証時にブラウザの保管したJWTを再利用する。

1. ユーザーは、ブラウザの保管したJWTをリクエストヘッダーに含め、アプリケーションに送信する。
2. アプリケーションは、秘密鍵を使用してJWTの署名を検証する。
3. JWTが有効であれば、認証成功とし、ユーザーにレスポンスを返信する。

![jwt_common_verify_token](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jwt_common_verify_token.png)

> - https://qiita.com/asagohan2301/items/cef8bcb969fef9064a5c#%E5%85%B1%E9%80%9A%E9%8D%B5%E6%96%B9%E5%BC%8F%E3%81%AE%E5%A0%B4%E5%90%88

<br>

## 03. JWTトークンの運搬方法

### HTTP認証の場合

#### ▼ Bearer認証

アクセストークンを`Authorization`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
authorization: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

`Authorization`ヘッダーは`Cookie`ヘッダーとは異なり、ローカルマシンに保管できない。

なお、APIではリクエストの送受信時に`Cookie`ヘッダーよりも`Authorization`ヘッダーの方が扱いやすいため、`Authorization`ヘッダーでアクセストークンを運搬することになる。

また、スマホアプリも`Cookie`ヘッダーより`Authorization`ヘッダーがいいらしい。

> - https://qiita.com/hirohero/items/d74bc04e16e6d05d2a4a
> - https://softwareengineering.stackexchange.com/a/141434
> - https://www.bokukoko.info/entry/2015/12/20/%E8%AA%8D%E8%A8%BC%E3%82%92%E5%90%AB%E3%82%80_API_%E9%96%8B%E7%99%BA%E3%81%A7%E6%A4%9C%E8%A8%8E%E3%81%99%E3%81%B9%E3%81%8D%E3%81%93%E3%81%A8
> - https://stackoverflow.com/questions/72180420/is-there-any-reason-to-use-http-header-authorization-to-send-jwt-token-instead-o/72182434#72182434
> - https://qiita.com/ledmonster/items/0ee1e757af231aa927b1#%E8%AA%8D%E8%A8%BC%E3%81%AE%E5%9F%BA%E6%9C%AC%E6%96%B9%E9%87%9D

<br>

### フォーム認証の場合

アクセストークンを`Cookie`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
cookie: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

<br>

## 04. JWTトークンの保持方法と安全度の比較

| クライアント保持方法                                           | 組み合わせ             | おすすめ度 | コメント                                                            |
| -------------------------------------------------------------- | ---------------------- | :--------: | ------------------------------------------------------------------- |
| `Cookie`ヘッダー (ローカルマシンのディレクトリ) 、LocalStorage | JWTトークンのみ        |   △ 〜 ×   | いずれの方法でも、XSSによってJWTが盗まれる可能性がある。            |
| `Cookie`ヘッダー                                               | プリフライトリクエスト |     △      | Access-Control-Max-Ageの期間内だとCSRFでJWTが盗まれる可能性がある。 |
| `Cookie`ヘッダー                                               | CSRFトークン           |     ⭕     |                                                                     |
| SameSiteCookie                                                 |                        |     ⭕     | SPAとAPIが同一オリジンの必要がある。                                |

> - https://qiita.com/Hiro-mi/items/18e00060a0f8654f49d6#%E6%97%A9%E8%A6%8B%E8%A1%A8
> - https://blog.flatt.tech/entry/auth0_access_token_poc

<br>

## 05. JWTトークンの代替

- fernet token
- branca-token
- PASETO

> - https://qiita.com/take4s5i/items/009b0b6797b752921a78#paseto

<br>
