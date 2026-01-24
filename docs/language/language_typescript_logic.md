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
  private _name: string;
  private _age: string;

  // オブジェクトの状態を設定する
  constructor(name: string, age: number) {
    this._name = name;
    this._age = age;
  }

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

### メソッド

#### ▼ setter

プロパティを直接操作するように値を変更できる。

```typescript
class User {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  set name(newName: string) {
    if (newName.trim() === "") {
      throw new Error("名前は空にできません");
    }
    this._name = newName;
  }
}

// 最初の名前
const user = new User("Tom");

// プロパティを直接操作するように値を変更できる
// 名前を変更する
user.name = "Bob";
```

#### ▼ update系、change系

ドメインを意識したメソッドを使用して値を変更できる。

```typescript
class User {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  changeName(newName: string): void {
    if (newName.trim() === "") {
      throw new Error("名前は空にできません");
    }
    this._name = newName;
  }
}

// 最初の名前
const user = new User("Tom");

// ドメインを意識したメソッドを使用して値を変更できる
// 名前を変更する
user.changeName("Bob");
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

## 04. 返却値

### 返却値の型

TypeScriptでは、 `return`の型のみを指定すれば良い。

```typescript
// Error型は返却値の型に指定しなくても良い
function foo(): string {
  try {
    // 何らかの処理

    return "success";
  } catch (e) {
    // 何らかの処理

    throw new Error("failed");
  }
}

// string型または例外を返却する
foo();
```

<br>

### 返却方法

#### ▼ return

呼び出し元に成功を返却する。

```typescript
// string型のみを指定する
function foo(): string {
  try {
    // 何らかの処理

    return "success";
  } catch (e) {
    // 何らかの処理

    return "failed";
  }
}

// string型を返却する
foo();
```

#### ▼ throw

呼び出し元に失敗をエラーとして返却する。

どんな型でも返却できる。

```typescript
// string型のみを指定し、Error型は返却値の型に指定しなくても良い
function foo(): string {
  try {
    // 何らかの処理

    return "success";
  } catch (e) {
    // 何らかの処理

    throw new Error("failed");
  }
}

// string型またはError型を返却する
foo();
```

<br>

## 05. エラーハンドリング

### エラーハンドリングとは

Typescriptでは`throw`は、Errorオブジェクトだけでなく、どんな型でも返却できる。

ちなみに、よくある型はErrorオブジェクト型、object型、string型である。

これを`catch`する場合、さまざまな型を考慮する必要がある。

<br>

### まずは緩い型で`catch`する

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

### `catch`した型に応じた処理

#### ▼ `catch`した型に応じた処理とは

TypeScriptの`try-catch`で捕捉したエラーの型に応じて処理を実行し分ける場合、`catch`ブロックを複数書くのではなく、`if`文を使用する必要がある。

```typescript
import axios, {AxiosError} from "axios";

export async function fetchUser(id: string) {
  try {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  } catch (error: unknown) {
    // axiosが投げたエラーの場合
    if (axios.isAxiosError(e)) {
      throw new Error(
        `通信エラーが発生しました (${error.response?.status ?? "unknown"})`,
      );
    }

    // 通常のErrorオブジェクトの場合
    if (e instanceof Error) {
      throw new Error(`予期しないエラー: ${error.message}`);
    }

    // その他（string, object, nullなど）の場合
    throw new Error("不明なエラーが発生しました");
  }
}
```

#### ▼ エラーメッセージの取得

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

#### ▼ ステータスコードの取得

```typescript
/**
 * エラーの構造に応じてHTTPステータスコードを取得する
 */
export function getErrorStatusCode(error: unknown): number {
  // RemixのResponseオブジェクトの場合
  // 例：スローしたjson関数によるエラーを捕捉した場合
  if (error instanceof Response) {
    return error.status;
  }

  // ZodによるエラーやJSONパースエラーを補足した場合
  if (error instanceof z.ZodError || error instanceof SyntaxError) {
    return 400;
  }

  // どのようなエラーの型が来るかわからないため、よくある構造で決め打ちする
  const errorObject = error as {
    response?: {status?: unknown};
    status?: unknown;
  };

  // AxiosErrorなどのエラーを補足した場合
  if (typeof errorObject.response?.status === "number") {
    return errorObject.response.status;
  }

  // 独自Errorなどのエラーを補足した場合
  if (typeof errorObject.status === "number") {
    return errorObject.status;
  }

  // 想定外のエラーを補足した場合
  return 500;
}
```

<br>

## 06. コピー

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

## 07. 条件式

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

## 08. さまざまなプラクティスのまとめ

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
