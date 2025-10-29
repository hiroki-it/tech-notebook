---
title: 【IT技術の知見】ロジック＠TypeScript
description: ロジック＠TypeScriptの知見を記録しています。
---

# ロジック＠TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 実装スタイル

### オブジェクト指向型

振る舞いは内部に状態を持つ。

副作用はあってもなくともよい（同じ入力の時に、出力は同じでも異なってもよい）。

状態と振る舞いが結合している。

ほかの型と共存できる。

```typescript
class User {
  // オブジェクトの状態を設定する
  constructor(
    public name: string,
    public age: number,
  ) {}

  // 振る舞い
  isAdult(): boolean {
    return this.age >= 18;
  }
}

const user = new User("Alice", 20);
console.log(user.isAdult()); // true
```

<br>

### 関数型

振る舞いは状態をもたず、外部から状態を注入する。

副作用をなくす必要がある（同じ入力であれば、出力も同じである）。

状態と振る舞いが分離している。

ほかの型と共存できる。

```typescript
type User = {
  name: string;
  age: number;
};

// 振る舞い
function isAdult(user: User): boolean {
  return user.age >= 18;
}

// オブジェクトの状態を設定する
const u: User = {name: "Alice", age: 20};
console.log(isAdult(u)); // true
```

<br>

### 手続型

振る舞いは存在せず、状態が変化していく。

実装例以外に、反復で数値が増加していく処理も手続型である。

ほかの型と共存できる。

```typescript
// オブジェクトの状態を設定する
let name = "Alice";
let age = 20;

// 手続き的に途中で状態を変更する
let isAdult = false;

if (age >= 18) {
  isAdult = true;
} else {
  isAdult = false;
}

console.log(isAdult); // true
```

<br>

## 02. 関数の種類

### 即時関数

無名関数の宣言と呼び出しを同時に行う。

```typescript
// 無名関数を即時実行し、message変数に代入する
const message = (() => {
  return `Hello, Hiroki`;
})();

console.log(message);
```

<br>

## 03. 引数

### 分割代入引数

#### ▼ 分割代入引数とは

関数の引数を定義するときに、オブジェクトから特定のプロパティを直接取り出する記法。

可読性が高くなる。

#### ▼ 分割代入引数しない場合

```typescript
function greet(
  // パラメーターからnameプロパティとuserプロパティを直接取り出さない
  user: {
    name: string;
    age: number;
  },
) {
  console.log(`Hello, ${user.name}. You are ${user.age} years old.`);
}

const user = {name: "Hiroki", age: 1};

// 引数を渡す
greet(user);
```

#### ▼ 分割代入引数する場合

```typescript
function greet(
  // パラメーターからnameプロパティとuserプロパティを直接取り出す
  {
    name,
    age,
  }: {
    name: string;
    age: number;
  },
) {
  console.log(`Hello, ${name}. You are ${age} years old.`);
}

const user = {name: "Hiroki", age: 1};

// 引数を渡す
greet(user);
```

<br>

## 04. エラーハンドリング

### エラーの型

#### ▼ unknown

`unknown`を使用した場合、それ以降の処理では型を無視して処理する。

```typescript
function foo(): string | unknown {
  try {
    // 何らかの処理

    return "success";
  } catch (error: unknown) {
    if (error instanceof Error) {
      // unknownを使用したため、Error型として暗黙的に処理される
      console.error(error.message);
    } else {
      // unknownを使用したため、Error型以外の型として暗黙的に処理される
      console.error("Unknown error:", error);
    }
    return error;
  }
}
```

> - https://qiita.com/frozenbonito/items/e708dfb3ab7c1fd3824d

#### ▼ any

`any`を使用した場合、それ以降の処理では型を無視して処理する。

```typescript
function foo(): string | any {
  try {
    // 何らかの処理

    return "success";
  } catch (error: any) {
    if (error instanceof Error) {
      // anyを使用したため、Error型ではなく型無しとして暗黙的に処理される
      console.error(error.message);
    } else {
      // anyを使用したため、型無しとして暗黙的に処理される
      console.error("Unknown error:", error);
    }
    return error;
  }
}
```

> - https://qiita.com/frozenbonito/items/e708dfb3ab7c1fd3824d

<br>

### 独自エラーオブジェクトの定義

ステータスコードに応じたエラーを継承すると、`try-catch`で扱いやすくなる。

```typescript
export class NotFoundError extends Error {
  status: number;

  constructor(message = "The Requested URL was not found on this server") {
    super(message);
    this.name = "NotFoundError";
    this.status = 404;
  }
}
```

<br>

### エラーメッセージの取得

TypeScriptでは、エラーの構造がさまざまある。

型安全のために、これらを条件分岐で処置する必要がある。

```typescript
// Remixの場合
import {Response} from "@remix-run/node";

/**
 * エラーの構造に応じてエラーメッセージを取得する
 */
export async function getErrorMessage(error: unknown): Promise<string> {
  // RemixのResponseオブジェクトの場合
  // 例：スローしたjson関数によるエラーを捕捉した場合
  if (error instanceof Response) {
    try {
      const body = await error.json();
      if (typeof body?.message === "string") {
        return body.message;
      }
      if (typeof body?.error === "string") {
        return body.error;
      }
      if (error.statusText) {
        return error.statusText;
      }
      return "An unexpected error occurred.";
    } catch {
      if (error.statusText) {
        return error.statusText;
      }
      return "An unexpected error occurred.";
    }
  }

  // Typescript組み込みのErrorオブジェクトの場合
  // 例：Remixの内部的なエラーを捕捉した場合
  if (error instanceof Error) {
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred.";
  }

  // その他の場合
  // 例：null、string、number、objectなどの想定外のエラーを捕捉した場合
  return String(error);
}
```

```typescript
// Remixの場合
export const action = async ({request, params}: ActionArgs) => {
  try {
    // リクエストハンドリング
  } catch (error) {
    const errorMessage = await getErrorMessage(error);
    console.error("An error occurred:", errorMessage);
  }
};
```

<br>

## 05. コピー

### 参照コピー

変数がオブジェクト型の場合に、メモリアドレスをコピーする。

変数がプリミティブ型の場合、ポインタコピーは存在しない。

```typescript
const original = {id: 1, name: "foo"};
const copy = original; // ポインタコピー
copy.name = "bar";

console.log(original.name); // "bar" となり、コピー前の状態が変わっている
```

<br>

### シャローコピー

変数がオブジェクト型の場合に、変数の階層の値のみをコピーする。

ただし、第一階層だオブジェクト型であると参照コピーの挙動になる。

```typescript
const original = {id: 1, fullname: {lastname: "foo", firstname: "foo"}};
const copy = {...original}; // シャローコピー
copy.fullname.firstname = "bar";

console.log(original.fullname.firstname); // "bar" となり、コピー前の状態が変わっている
```

<br>

### ディープコピー

変数がオブジェクト型の場合に、変数の階層の値のみをコピーする。

```typescript
const original = {id: 1, fullname: {lastname: "foo", firstname: "foo"}};
const copy = structuredClone(original);
copy.fullname.firstname = "bar";

console.log(original.fullname.firstname); // "foo" となり、コピー前の状態には影響がない
```

<br>

## 06. 条件式

### 二項演算子

与えられた変数の値がfalsyだった場合に、値を設定する。

デフォルト値を設定する場合に役立つ。

```typescript
// ""、0、null、undefined、falseなど
const flag = enableFoo || "false";
```

```typescript
// null、undefinedなど
const flag = enableFoo ?? "false";
```

<br>

### 三項演算子

```typescript
// fooの場合にfooを代入し、fooでない場合にbarを代入する
const fooOrBar = foo == "foo" ? foo : "bar";
```

<br>

## 07. さまざまなプラクティスのまとめ

```typescript
// エラーハンドリング: Result型で値を型として明示
type Result<T, E> = {ok: true; value: T} | {ok: false; error: E};
type UserFetchError = "UNAUTHORIZED" | "RATE_LIMITED" | "INTERNAL_ERROR";

// 保守性: TypeScriptでAPIレスポンスの型安全性を確保
type UserResponse = {
  id: string;
  name: string;
};

async function getUserNames(
  // パフォーマンス: 複数ユーザーIDをまとめて取得することで、N+1問題を回避
  userIds: string[],
  // テストビリティ: 依存性注入により、モックに差し替えできるようにする
  di: DI,
): Promise<Result<Map<string, string>, UserFetchError>> {
  // 信頼性: リトライ機構により、一時的な障害に対応
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 信頼性: タイムアウトにより、ネットワーク遅延からアプリケーションを保護
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      // 依存性注入された親オブジェクトから子オブジェクトを取り出す
      // 実環境では本物のfetchClientを使用し、テスト環境ではモック用のfakeFetchClientを使用する
      const response = await di.fetchClient(
        // スケーラビリティ: バッチ処理でリクエスト回数を最小化
        // 保守性: URLのベタ書きを排除
        `${di.apiBaseUrl}/users/batch`,
        {
          method: "POST",
          headers: {
            // 認証・認可: JWTでAPIを保護
            // 依存性注入された親オブジェクトから子オブジェクトを取り出す
            Authorization: `Bearer ${await di.jwtProvider()}`,
            "Content-Type": "application/json",
          },
          // パフォーマンス: 複数ユーザーIDをまとめて取得することで、N+1問題を回避
          // パフォーマンス: 必要なフィールドのみ取得してデータ転送量を最小化
          body: JSON.stringify({ids: userIds, fields: ["id", "name"]}),
          signal: controller.signal,
        },
      );

      // エラーハンドリング: HTTPステータスを適切にハンドリング
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          switch (response.status) {
            // 認証・認可: APIを保護
            case 403:
              throw new NonRetryableError("UNAUTHORIZED", response.status);
            // スケーラビリティ: レート制限対応
            case 429:
              throw new NonRetryableError("RATE_LIMITED", response.status);
            default:
              throw new NonRetryableError("INTERNAL_ERROR", response.status);
          }
        }
        throw response;
      }

      const users = await response.json();

      // セキュリティ: レスポンスを厳密に検証
      if (!isValidUsersResponse(users)) {
        throw new NonRetryableError("INTERNAL_ERROR");
      }

      const results = new Map(users.map((user) => [user.id, user.name]));
      return {ok: true, value: results};
    } catch (error) {
      // 依存性注入された親オブジェクトから子オブジェクトを取り出す
      // 可観測性: 構造化されたログ
      di.logger.error("Failed to fetch users", {
        userIds,
        attempt,
        error,
      });
      // 依存性注入された親オブジェクトから子オブジェクトを取り出す
      // 可観測性: メトリクス
      di.metrics.increment("user_fetch_error", {
        status:
          error instanceof Response || error instanceof NonRetryableError
            ? error.status
            : undefined,
      });

      if (error instanceof NonRetryableError) {
        return {ok: false, error: error.errorType};
      }

      if (attempt < maxRetries) {
        // 信頼性: 指数バックオフ（1秒→2秒→4秒）によるリトライで過負荷を防止
        const delay = 2 ** attempt * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {ok: false, error: "INTERNAL_ERROR"};
}
```

> - https://zenn.dev/coconala/articles/reasons-for-continuing-to-learn#%E3%82%82%E3%81%97%E3%80%81%E3%81%93%E3%81%93%E3%81%BE%E3%81%A7%E3%81%AE%E3%81%99%E3%81%B9%E3%81%A6%E3%82%92%E5%AD%A6%E3%82%93%E3%81%A0%E3%82%89

<br>
