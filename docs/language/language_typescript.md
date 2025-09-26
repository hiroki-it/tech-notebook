---
title: 【IT技術の知見】TypeScript
description: TypeScriptの知見を記録しています。
---

# TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. TypeScriptとは

静的型付けのフロントエンド言語である。

`tsconfig.json`ファイルに基づいて、TypeScriptファイルをコンパイルし、JavaScriptファイルを作成する。

拡張子として、`ts`と`tsx` (TypeScript内にJSXを実装できる) を使用できる。

> - https://ugo.tokyo/ts-config/#outline__1

<br>

## 02. 変数の宣言

### let

記入中...

<br>

### const

#### ▼ constアサーション

constで宣言／代入された変数に関して、再代入できないようにする。

型がより複雑な配列やオブジェクトリテラルで使用すると便利である。

```typescript
const obj = {
  const obj: {
    readonly name: "pikachu";
    readonly no: 25;
    readonly genre: "mouse pokémon";
    readonly height: 0.4;
    readonly weight: 6;
  }
  name: "pikachu",
  no: 25,
  genre: "mouse pokémon",
  height: 0.4,
  weight: 6.0,
} as const;
```

> - https://typescriptbook.jp/reference/values-types-variables/const-assertion

<br>

## 02-02. 変数の代入

### プリミティブ

#### ▼ 変数

```typescript
let str: string = "hello";
str = 0;
```

```typescript
let num: number = 0;
num = "0";
```

```typescript
let big: bigNumber = 10n;
big = 0;
```

```typescript
let bool: boolean = true;
bool = 1;
```

```typescript
let n: null = null;
n = undefined;
```

```typescript
let u: undefined = undefined;
u = null;
```

```typescript
let sym: symbol = Symbol();
sym = "";
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9

<br>

### オブジェクト

#### ▼ 変数

```typescript
const object: {
  name: string;
  age: number;
} = {
  name: "taro",
  age: 20,
};
```

#### ▼ 参照記法

```typescript
const obj = {
  foo: 123,
  bar: 456,
  "baz-qux": 789,
};

const key = "bar";

// ドット記法
// キー名が静的で変わらない場合に適している
const value1 = obj.foo; // 123

// ブラケット記法
// キー名が動的な場合や記号を含む場合に適している
const value2 = obj[key]; // 456
const value3 = obj["baz-qux"]; // 789
```

<br>

### レコード

#### ▼ 変数

```typescript
type ProfileKeys = "name" | "age";

const object: Record<ProfileKeys, string> = {
  name: "taro",
  age: "20",
};
```

<br>

### 配列

#### ▼ 配列とは

可変的な要素数、順序は自由、型は全て同じデータ型である。

#### ▼ 変数

```typescript
const strArray: string[] = ["a", "b", "c"];

strArray.push(0);
```

```typescript
const numArray: number[] = [1, 2, 3];

numArray.push("a");
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%85%8D%E5%88%97%E5%9E%8B%E5%AE%9A%E7%BE%A9

#### ▼ 配列の走査

```typescript
const numbers = [10, 20, 30];

const total = numbers.reduce<number>(
  (result, value) => {
    // 現在の合計値（result）に、現在の要素（value）を加算する
    return result + value;
  },
  // 合計の初期値を0に設定する
  0,
);

console.log(total); // 60
```

<br>

### タプル

#### ▼ タプルとは

配列の一種である。

固定の要素数、順序は固定、型は自由なデータ型である。

#### ▼ 返却値

```typescript
const foo = (a: number, b: string): [number, string] => {
  return [a, b];
};

const result = foo(1, "Alice");
```

<br>

### ジェネリクス

#### ▼ 変数

```typescript
// string[] と同じ
const str: Array<string> = ["a", "b", "c"];
```

```typescript
// (string|number)[] と同じ
const strOrNum: Array<string | number> = ["a", "b", 1, 2];
```

```typescript
// string{} と同じ
const str: Map<string> = {a: "a", b: "b", c: "c"};
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AA%E3%82%AF%E3%82%B9%E5%9E%8B%E5%AE%9A%E7%BE%A9

#### ▼ 返却値

```typescript
// Promise<型>
async function asyncFn(): Promise<string> {
  // 非同期処理
  return "executed";
}

console.log(await asyncFn());
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%9D%9E%E5%90%8C%E6%9C%9F%E5%87%A6%E7%90%86%E3%81%AE-promise-%E3%81%AE%E6%88%BB%E3%82%8A%E5%80%A4

#### ▼ 型変数（ジェネリクス）

安全なany型ともいえる。

型変数では、定義した時点で型が決まっていない。

コール時に型変数に任意の型を推論で代入し、それに合わせた引数型と返却型の関数を定義できる。

```typescript
// 最初の<T>    型変数を定義
// (value: T)  引数型で型変数を使用
// : T         返却値型で型変数を使用

const foo = <T>(value: T): T {
  // ...
}
```

```typescript
// この時点では、引数型と返却値型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T>(value: T): T {
  return value;
}

// 型変数に文字を代入すると、これを推論し、string型の引数型と返却値型を定義していたことになる
foo("a");

// number型の引数型と返却値型を定義していたことになる
foo(1);
```

```typescript
// この時点では、引数型と返却値型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T>(value: T): Promise<T> => {
  return value;
};

// 型変数に文字を代入すると、これを推論し、Promise<string>型の引数型と返却値型を定義していたことになる
foo("a");

// Promise<string>型の引数型と返却値型を定義していたことになる
foo(1);
```

```typescript
// この時点では、型変数 (T、U) の型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T, U>(key1: T, key2: U): Array<T | U> => {
  return [key1, key2];
};

// 型変数に文字を代入すると、これを推論し、string型の引数型と返却値型を定義していたことになる
foo<string, string>("a", "b");

// number型の引数型と返却値型を定義していたことになる
foo<number, number>(1, 2);

// boolean型の引数型と返却値型を定義していたことになる
foo<boolean, boolean>(true, false);

// 複数の型を組み合わせることもできる
foo<string, number>("a", 1);
```

```typescript
// 処理時間を計測する関数
// この時点では、型変数 (T) の型は決まっていない
// 変数名はなんでもよく、単語でもいい
const measureFunctionExecutionTime = async <T>(
  fn: () => Promise<T>,
): Promise<{result: T; executionTime: number}> => {
  const startAt = performance.now();
  try {
    const result = await fn();
    // Date.nowよりもperformance.now()の方がマイクロ秒まで計測できる
    const executionTime = performance.now() - startAt;
    // 関数の処理結果と実行時間を返却する
    return {result: result, executionTime: executionTime};
  } catch (error) {
    const executionTime = performance.now() - startAt;
    throw {result: error, executionTime: executionTime};
  }
};

// この時点では、引数型と返却値型は決まっていない
// 変数名はなんでもよく、単語でもいい
const foo = <T>(value: T): Promise<T> => {
  return value;
};

// 型変数に文字を代入すると、これを推論し、fn: () => Promise<T> のTが決まる
measureFunctionExecutionTime(foo);
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%82%B8%E3%82%A7%E3%83%8D%E3%83%AA%E3%82%AF%E3%82%B9%E5%9E%8B%E5%AE%9A%E7%BE%A9

<br>

### 数値

#### ▼ 引数

```typescript
const sum = (x: number, y: number) => {
  return x + y;
};

console.log(sum(1, 2));

console.log(sum(1, "2")); // Argument of type 'string' is not assignable to parameter of type 'number'.

console.log(sum(1)); // Expected 2 arguments, but got 1.
```

#### ▼ 返却値

```typescript
const sum = (x: number, y: number): number => {
  return x + y;
};
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%96%A2%E6%95%B0%E3%81%AE%E5%BC%95%E6%95%B0%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9
> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%96%A2%E6%95%B0%E3%81%AE%E5%BC%95%E6%95%B0%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9

<br>

### 返却値なし

```typescript
// 返却値がないという型
const logger = (): void => {
  console.log("log");
};
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E6%88%BB%E3%82%8A%E5%80%A4%E3%81%8C%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88%E3%81%AE-void

<br>

## 03. 型推論

### 暗黙的

```typescript
let name = "John"; // 変数nameは文字列として推論されます
let age = 30; // 変数ageは数値として推論されます
let isProgrammer = true; // 変数isProgrammerはブール値として推論されます
```

> - https://recursionist.io/learn/languages/typescript/introduction/type-inference

<br>

### 明示的

```typescript
let name: string = "John";
let age: number = 30;
let isProgrammer: boolean = true;
```

> - https://recursionist.io/learn/languages/typescript/introduction/type-inference

<br>

### 型アサーション

#### ▼ 型アサーション

型を上書きする。

キャストではないらしい。

> - https://typescript-jp.gitbook.io/deep-dive/type-system/type-assertion

#### ▼ as構文

```typescript
const value: string | number = "this is a string";
const strLength: number = (value as string).length;
```

> - https://typescriptbook.jp/reference/values-types-variables/type-assertion-as#%E5%9E%8B%E3%82%A2%E3%82%B5%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%9B%B8%E3%81%8D%E6%96%B9

#### ▼ アングルブラケット構文

```typescript
const value: string | number = "this is a string";
const strLength: number = (<string>value).length;
```

> - https://typescriptbook.jp/reference/values-types-variables/type-assertion-as#%E5%9E%8B%E3%82%A2%E3%82%B5%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E6%9B%B8%E3%81%8D%E6%96%B9

#### ▼ 非nullアサーション

変数の値が`undefined`だった場合に、例外をスローする。

```typescript
const foo: string = process.env.FOO!;
```

<br>

## 04. 独自の型宣言

### typeエイリアス宣言

オブジェクト以外の型を宣言する場合、typeエイリアス宣言を使用する。

ただ、オブジェクトでtypeエイリアス宣言を使用してもよい。

```typescript
type Foo = {
  bar: number;
  baz: Date;
  qux: string;
};
```

<br>

### interface宣言

オブジェクトの型を宣言する場合、interface宣言を使用する。

ただ、オブジェクトでtypeエイリアス宣言を使用してもよい。

<br>

## 05. 環境変数の定義

### 出力

#### ▼ 言語の実行環境

- `export`コマンドで出力する
- コンテナの環境変数として出力する

#### ▼ dotenvパッケージ

`dotenv`パッケージ

なお、依存パッケージが増えてしまうため、代替の方法があるならそちらの方が良い。

```typescript
import dotenv from "dotenv";

// .envファイルを読み込む
dotenv.config();

// なんらかの実装
```

> - https://www.basedash.com/blog/environment-variables-in-typescript
> - https://medium.com/@sushantkadam15/using-environment-variables-in-typescript-with-dotenv-dc0c35939059

<br>

### 型の定義

```typescript
interface Env {
  DATABASE_NAME: string;
  DATABASE_PORT?: number;
}

const myEnv: Env = {
  DATABASE_NAME: process.env.DATABASE_NAME || "",
  DATABASE_PORT: process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT)
    : undefined,
};
```

> - https://www.basedash.com/blog/environment-variables-in-typescript

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

## 07. コピー

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

## 08. エラーハンドリング

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

## 09. 実装スタイル

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

## 10. パッケージ

### import

#### ▼ importとは

```typescript
import {logger} from "./logger";
```

<br>

### export

#### ▼ exportとは

```typescript
export {logger} from "./logger";
```

#### ▼ index.ts

各ディレクトリのエントリポイントとして使える。

`index.ts`ファイルで`export`しておくと、コールする側がディレクトリ単位でインポートできるようになる。

```typescript
// utils/index.ts
export {logger} from "./logger";
export {logger} from "./errorHandler";
```

アスタリスクで一括でエクスポートしてもよい。

```typescript
// utils/index.ts
export * from "./logger";
export * from "./errorHandler";
```

```typescript
// ファイルを個別に指定する必要がなくなる
import {fooLogger, fooErrorHandler} from "~/utils";
```

> - https://qiita.com/stin_dev/items/8bc6281dcebb289887be

<br>

## 11. まとめ

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
  // テストビリティ: 依存性注入により、モックに差し替え可能に
  di: DI,
): Promise<Result<Map<string, string>, UserFetchError>> {
  // 信頼性: リトライ機構により、一時的な障害に対応
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // 信頼性: タイムアウトにより、ネットワーク遅延からアプリケーションを保護
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await di.fetchClient(
        // スケーラビリティ: バッチ処理でリクエスト回数を最小化
        // 保守性: URLのベタ書きを排除
        `${di.apiBaseUrl}/users/batch`,
        {
          method: "POST",
          headers: {
            // 認証・認可: JWTでAPIを保護
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
      // 可観測性: 構造化されたログ
      di.logger.error("Failed to fetch users", {
        userIds,
        attempt,
        error,
      });
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
