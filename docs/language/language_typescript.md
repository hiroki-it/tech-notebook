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

## 02. 型定義

### プリミティブ

#### ▼ 変数

```typescript
let str: string = "hello";
// Type 'number' is not assignable to type 'string'.
str = 0;
```

```typescript
let num: number = 0;
// Type 'string' is not assignable to type 'number'.
num = "0";
```

```typescript
let big: bigint = 10n;
// Type 'number' is not assignable to type 'bigint'.
big = 0;
```

```typescript
let bool: boolean = true;
// Type 'number' is not assignable to type 'boolean'.
bool = 1;
```

```typescript
let n: null = null;
// Type 'undefined' is not assignable to type 'null'.
n = undefined;
```

```typescript
let u: undefined = undefined;
// Type 'null' is not assignable to type 'undefined'.
u = null;
```

```typescript
let sym: symbol = Symbol();
// Type 'string' is not assignable to type 'symbol'.
sym = "";
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E3%83%97%E3%83%AA%E3%83%9F%E3%83%86%E3%82%A3%E3%83%96%E5%80%A4%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9

<br>

### オブジェクト

#### ▼ 変数

```typescript
const object: {name: string; age: number} = {name: "taro", age: 20};

// Type 'number' is not assignable to type 'string'.
object.name = 20;

// Type 'string' is not assignable to type 'number'.
object.age = "taro";

// Property 'gender' does not exist on type '{ name: string; age: number; }'.
object.gender = "male";
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#object-%E5%9E%8B%E5%AE%9A%E7%BE%A9

<br>

### 配列

#### ▼ 変数

```typescript
const strArray: string[] = ["a", "b", "c"];

// Argument of type 'number' is not assignable to parameter of type 'string'.
strArray.push(0);
```

```typescript
const numArray: number[] = [1, 2, 3];

// Argument of type 'string' is not assignable to parameter of type 'number'.
numArray.push("a");
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%85%8D%E5%88%97%E5%9E%8B%E5%AE%9A%E7%BE%A9

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

#### ▼ 型変数

型変数では、定義した時点で型が決まっていない。

コール時に型変数に任意の型を代入すると、それに合わせた引数と返却値の型の関数を定義できる。

```typescript
// この時点では、型変数 (T、U) の型は決まっていない
const addKeys = <T, U>(key1: T, key2: U): Array<T | U> => {
  return [key1, key2];
};

// 型変数に型を代入すると、それに合わせた処理になる
addKeys<string, string>("a", "b");

addKeys<number, number>(1, 2);

addKeys<boolean, boolean>(true, false);

addKeys<string, number>("a", 1);
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

## 04. 環境変数の定義

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

### エラーハンドリング

#### ▼ 独自エラーオブジェクトの定義

ステータスコードに応じたエラーを継承すると、`try-catch`句で扱いやすくなる。

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

<br>
