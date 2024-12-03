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
