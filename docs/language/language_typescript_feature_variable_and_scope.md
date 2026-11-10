---
title: 【IT技術の知見】変数・スコープ＠TypeScript
description: 変数・スコープ＠TypeScriptの知見を記録しています。
---

# 変数・スコープ＠TypeScript

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 変数の宣言

### let

let で宣言した変数は、ブロックスコープを持ち、再代入できる。

<br>

### const

#### ▼ const アサーション

const で宣言／代入された変数には、再代入できないようにする。

型がより複雑な配列やオブジェクトリテラルで使用すると便利である。

```typescript
const obj = {
  name: "pikachu",
  no: 25,
  genre: "mouse pokémon",
  height: 0.4,
  weight: 6.0,
} as const;
```

> - [constアサーション「as const」 (const assertion) \| TypeScript入門『サバイバルTypeScript』](https://typescriptbook.jp/reference/values-types-variables/const-assertion)

<br>

## 02. 環境変数の定義

### 出力

#### ▼ 言語の実行環境

- `export` コマンドで出力する
- コンテナの環境変数として出力する

#### ▼ dotenv パッケージ

`dotenv` パッケージ

なお、依存パッケージが増えてしまうため、代替の方法があるならそちらのほうがよい。

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

