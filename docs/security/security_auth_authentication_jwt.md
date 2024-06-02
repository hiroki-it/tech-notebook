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

## 02. JWTの運搬方法

### Form認証の場合

トークンを`Cookie`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
cookie: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

<br>

### Bearer認証の場合

トークンを`authorization`ヘッダーに割り当て、リクエストを送信する。

```yaml
POST https://example.com/foo
---
authorization: Bearer <ヘッダーJSONエンコード値>.<ペイロードJSONエンコード値>.<署名JSONエンコード値>
```

<br>

## 03. JWTの作成

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

署名のための暗号アルゴリズムは、『`HS256`』『`RS256`』『`ES256`』『`none`』から選択できる。

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

## 04. JWTの保持方法と安全度の比較

| クライアント保持方法                                           | 組み合わせ             | おすすめ度 | コメント                                                            |
| -------------------------------------------------------------- | ---------------------- | :--------: | ------------------------------------------------------------------- |
| `Cookie`ヘッダー (ローカルマシンのディレクトリ) 、LocalStorage | JWTのみ                |   △ 〜 ×   | いずれの方法でも、XSSによってJWTが盗まれる可能性がある。            |
| `Cookie`ヘッダー                                               | プリフライトリクエスト |     △      | Access-Control-Max-Ageの期間内だとCSRFでJWTが盗まれる可能性がある。 |
| `Cookie`ヘッダー                                               | CSRFトークン           |     ⭕     |                                                                     |
| SameSiteCookie                                                 |                        |     ⭕     | SPAとAPIが同一オリジンの必要がある。                                |

> - https://qiita.com/Hiro-mi/items/18e00060a0f8654f49d6#%E6%97%A9%E8%A6%8B%E8%A1%A8
> - https://blog.flatt.tech/entry/auth0_access_token_poc

<br>

## 05. JWTの代替

- fernet token
- branca-token
- PASETO

> - https://qiita.com/take4s5i/items/009b0b6797b752921a78#paseto

<br>
