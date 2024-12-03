---
title: 【IT技術の知見】Typescript
description: Typescriptの知見を記録しています。
---

# Typescript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Typescriptとは

静的型付けのフロントエンド言語である。

`tsconfig.json`ファイルに基づいて、TypeScriptファイルをコンパイルし、JavaScriptファイルを作成する。

拡張子として、`ts`と`tsx` (Typescript内にJSXを実装できる) を使用できる。

> - https://ugo.tokyo/ts-config/#outline__1

<br>

## 02. セットアップ

### tsconfig.json

#### ▼ exclude

```yaml
{"exclude": ["<ファイル名>"]}
```

> - https://qiita.com/ryokkkke/items/390647a7c26933940470#exclude

<br>

#### ▼ include

```yaml
{"include": ["<ファイル名>"]}
```

> - https://qiita.com/ryokkkke/items/390647a7c26933940470#include

<br>

#### ▼ compilerOptions

```yaml
{
  "compilerOptions": {
  "lib": [ "DOM", "DOM.Iterable", "ES2019" ],
  "types": [ "vitest/globals" ],
  "isolatedModules": true,
  "esModuleInterop": true,
  "jsx": "react-jsx",
  "module": "CommonJS",
  "moduleResolution": "node",
  "resolveJsonModule": true,
  "target": "ES2019",
  "strict": true,
  "allowJs": true,
  "forceConsistentCasingInFileNames": true,
  "baseUrl": ".",
  "paths": {
    "~/*": [ "./app/*" ]
  },
  "skipLibCheck": true,
  "noEmit": true
}
```

> - https://qiita.com/ryokkkke/items/390647a7c26933940470#compileroptions

<br>

## 03. 環境変数

### 出力

#### ▼ 言語の実行環境

- `export`コマンドで出力する
- コンテナの環境変数として出力する

#### ▼ dotenvパッケージ

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

## 04. 型

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
// Array<string>
const str: Array<string> = ["a", "b", "c"];
```

#### ▼ 戻り値

```typescript
// Promise<型>
async function asyncFn(): Promise<string> {
  // 非同期処理
  return "executed";
}

console.log(await asyncFn());
```

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

#### ▼ 戻り値

```typescript
const sum = (x: number, y: number): number => {
  return x + y;
};
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%96%A2%E6%95%B0%E3%81%AE%E5%BC%95%E6%95%B0%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9
> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E9%96%A2%E6%95%B0%E3%81%AE%E5%BC%95%E6%95%B0%E3%81%AE%E5%9E%8B%E5%AE%9A%E7%BE%A9

<br>

### 戻り値なし

```typescript
// 戻り値がないという型
const logger = (): void => {
  console.log("log");
};
```

> - https://zenn.dev/akkie1030/articles/9f2304544245b2#%E6%88%BB%E3%82%8A%E5%80%A4%E3%81%8C%E3%81%AA%E3%81%84%E5%A0%B4%E5%90%88%E3%81%AE-void

<br>
