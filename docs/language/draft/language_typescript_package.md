---
title: 【IT技術の知見】パッケージ＠TypeScript
description: パッケージ＠TypeScriptの知見を記録しています。
---

# パッケージ＠TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. oidc-client-ts

### oidc-client-tsとは

TypeScriptでOIDCを実施するためのパッケージ。

フレームワークによっては、ラッパー (例：`react-oidc-context`) が提供されている。

<br>

### 認証

#### ▼ 全体

```javascript
import {OidcClient, UserManager} from "oidc-client-ts";

const client = new OidcClient({
  // 例：https://<IDプロバイダーのドメイン>/realms/<realm名>
  authority: "<IDプロバイダーのIssuer値>",
  // クライアントを表す名前を設定する
  // 例：frontend
  client_id: "<クライアントID>",
  // ホスト名は window.location.origin とする。
  // 例：window.location.origin + "/authentication/callback"
  redirect_uri: "<コールバックURL>",
});

const userManager = new UserManager(client);

// ログインする
// 認可リクエストを送信する
userManager
  .signinRedirect()
  .then(function () {
    // ログイン成功時の処理
  })
  .catch(function (error) {
    // ログイン失敗時の処理
  });

userManager.getUser().then(function (user) {
  // 認証済みユーザーを取得する
});

// ログアウトする
userManager.signoutRedirect();
```

> - https://authts.github.io/oidc-client-ts/interfaces/OidcClientSettings.html
> - https://authts.github.io/oidc-client-ts/classes/OidcClient.html
> - https://dev.classmethod.jp/articles/openidconnect-devio2023/#P.24%2520React%25E5%2581%25B4%25E3%2581%25AE%25E8%25A8%25AD%25E5%25AE%259A%25E5%2586%2585%25E5%25AE%25B9%25E7%25A2%25BA%25E8%25AA%258D

#### ▼ 認証済みユーザーの取得

ログイン時に、`Authorization`ヘッダー上のアクセストークンをIDプロバイダーに送信し、ユーザーを取得する。

> - https://dev.classmethod.jp/articles/openidconnect-devio2023/#P.33%2520%25E3%2583%25AA%25E3%2582%25AF%25E3%2582%25A8%25E3%2582%25B9%25E3%2583%2588%25E3%2581%25AE%25E5%258B%2595%25E3%2581%258D%25E3%2582%2592%25E8%25A6%258B%25E3%2581%25A6%25E3%2581%25BF%25E3%2582%2588%25E3%2581%2586%25EF%25BC%2588UserInfo%25E3%2583%25AA%25E3%2582%25AF%25E3%2582%25A8%25E3%2582%25B9%25E3%2583%2588%25EF%25BC%2589

<br>

## 02. zod

### zodとは

データ型のバリデーションを実行する。

<br>

### object

バリデーションのルールを設定する。

```typescript
// ユーザーオブジェクトのスキーマを定義する
const userRequest = z.object({
  // 数値型、整数、正の数を要求する
  id: z.number().int().positive(),
  // 文字列型、空文字列を許可しない
  name: z.string().min(1, "名前は必須です"),
  // 文字列型、メールアドレス形式を要求する
  email: z.string().email("有効なメールアドレス形式ではありません"),
  // 数値型、整数、正の数、オプショナルとする
  age: z.number().int().positive().optional(),
  // 文字列の配列とする
  roles: z.array(z.string()),
  // 真偽値型、デフォルト値はtrueとする
  isActive: z.boolean().default(true),
  // ISO8601形式の時刻
  doingTime: z.string().datetime("実施時刻はISO8601形式の必要があります"),
});
```

<br>

### parse、safeParse

#### ▼ parse、safeParseとは

`parse`関数は成功時は値を返し、失敗時はエラーをスローする。

一方で、`safeParse`関数はエラーをスローせず、成功/失敗を示すオブジェクトを返す。

#### ▼ 成功する場合

```typescript
// Zodライブラリをインポートする
import {z} from "zod";

// ユーザーオブジェクトのスキーマを定義する
const userRequest = z.object({
  // 数値型、整数、正の数を要求する
  id: z.number().int().positive(),
  // 文字列型、空文字列を許可しない
  name: z.string().min(1, "名前は必須である"),
  // 文字列型、メールアドレス形式を要求する
  email: z.string().email("有効なメールアドレス形式ではない"),
  // 数値型、整数、正の数、オプショナルとする
  age: z.number().int().positive().optional(),
  // 文字列の配列とする
  roles: z.array(z.string()),
  // 真偽値型、デフォルト値はtrueとする
  isActive: z.boolean().default(true),
  // ISO 8601形式の時刻
  doingTime: z
    .string()
    .datetime("StartAtTimestamp must be a valid ISO 8601 datetime"),
});

// スキーマからTypeScriptの型を自動生成する
type User = z.infer<typeof userRequest>;

// バリデーションに成功するデータを用意する
const successfulUserData = {
  id: 123,
  name: "Alice",
  email: "alice@example.com",
  age: 30,
  roles: ["user", "admin"],
  isActive: true,
};

// parseを使ったバリデーション (成功時は値を返し、失敗時はエラーをスローする)
try {
  // parse関数はバリデーションに成功した場合、バリデーション済みのデータを返す。
  // 失敗した場合はエラーをスローする。
  const parsedUser = userRequest.parse(successfulUserData);
  console.log("parse バリデーション成功:", parsedUser);
  // parsedUserはUser型として扱える。
  const user: User = parsedUser;
  console.log("型安全なデータ (parse):", user.name);
} catch (error: any) {
  // 成功するのでこのブロックは実行されない
  console.error("parse バリデーション失敗 (予期しない):", error.errors);
}

// safeParseを使ったバリデーション (成功/失敗を示すオブジェクトを返す)
// safeParse関数はエラーをスローせず、成功/失敗を示すオブジェクトを返す。
const safeParseResultSuccess = userRequest.safeParse(successfulUserData);

// successプロパティで成功・失敗を判定する
if (safeParseResultSuccess.success) {
  console.log("safeParse バリデーション成功:", safeParseResultSuccess.data);
  // 成功した場合、dataプロパティにバリデーション済みのデータが含まれる。
  const user: User = safeParseResultSuccess.data; // こちらも型安全
  console.log("型安全なデータ (safeParse):", user.email);
} else {
  // 成功するのでこのブロックは実行されない
  console.error(
    "safeParse バリデーション失敗 (予期しない):",
    safeParseResultSuccess.error.errors,
  );
}
```

#### ▼ 失敗する場合

```typescript
// Zodライブラリをインポートする
import {z} from "zod";

// ユーザーオブジェクトのスキーマを定義する
const userRequest = z.object({
  // 数値型、整数、正の数を要求する
  id: z.number().int().positive(),
  // 文字列型、空文字列を許可しない
  name: z.string().min(1, "名前は必須である"),
  // 文字列型、メールアドレス形式を要求する
  email: z.string().email("有効なメールアドレス形式ではない"),
  // 数値型、整数、正の数、オプショナルとする
  age: z.number().int().positive().optional(),
  // 文字列の配列とする
  roles: z.array(z.string()),
  // 真偽値型、デフォルト値はtrueとする
  isActive: z.boolean().default(true),
});

// スキーマからTypeScriptの型を自動生成する
type User = z.infer<typeof userRequest>;

// バリデーションに成功するデータを用意する
const successfulUserData = {
  id: 123,
  name: "Alice",
  email: "alice@example.com",
  age: 30,
  roles: ["user", "admin"],
  isActive: true,
};

// バリデーションに失敗する可能性があるデータを用意する
const failedUserData = {
  // 負の数 (positive()に違反する)
  id: -5,
  // 空文字列 (min(1)に違反する)
  name: "",
  // 不正なメールアドレス形式 (email()に違反する)
  email: "bob@",
  // ageがない (optionalなのでOKである)
  // 配列内に数値がある (array(z.string())に違反する)
  roles: ["editor", 123],
  // isActiveがない (default(true)が適用されるのでOKである)
};

// parseを使ったバリデーション (成功時は値を返し、失敗時はエラーをスローする)
try {
  // parse関数はバリデーションに成功した場合、バリデーション済みのデータを返す。
  // 失敗した場合はエラーをスローする。
  // バリデーションに失敗するため、ここでZodErrorがスローされる。
  const parsedUser = userRequest.parse(failedUserData);
  // エラーがスローされるため、この行は実行されない。
  console.log("parse バリデーション成功 (予期しない):", parsedUser);
} catch (error: any) {
  console.error("parse バリデーション失敗:");
  // ZodErrorの場合は、詳細なエラー情報が含まれる
  if (error instanceof z.ZodError) {
    console.error("エラー詳細:", error.errors);
    /* エラー詳細の例 (一部) ：
    [
      {
        "code": "too_small",
        "minimum": 0,
        "type": "number",
        "inclusive": false,
        "exact": false,
        "fatal": false,
        "message": "Number must be greater than 0",
        "path": [ "id" ]
      },
      // ...他のエラー
    ]
    */
  } else {
    console.error("不明なエラー:", error);
  }
}

// safeParseを使ったバリデーション (成功/失敗を示すオブジェクトを返す)
// safeParse関数はエラーをスローせず、成功/失敗を示すオブジェクトを返す。
const safeParseResultFailure = userRequest.safeParse(failedUserData);

// successプロパティで成功・失敗を判定する
// バリデーションに失敗するため、successはfalseとなる。
if (safeParseResultFailure.success) {
  // 失敗するのでこのブロックは実行されない
  console.log(
    "safeParse バリデーション成功 (予期しない):",
    safeParseResultFailure.data,
  );
} else {
  console.error("safeParse バリデーション失敗:");
  // 失敗した場合、errorプロパティにZodErrorオブジェクトが含まれる。
  console.error("エラー詳細:", safeParseResultFailure.error.errors);
}
```

<br>
