---
title: 【IT技術の知見】モジュール
description: モジュールの知見を記録しています。
tags:
  - "言語"
  - "TypeScript"
  - "言語機能"
---

# モジュール

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. パッケージ

### import

#### ▼ import とは

```typescript
import {logger} from "./logger";
```

#### ▼ 型と関数が混在

型と関数が混在する場合、いくつかの記法（型と関数で `import` を分けるなど）があるが、次の実装方法が一番よい。

```typescript
import {
  foo1,
  foo2,
  foo3,
  type foo4,
  type foo5,
  type foo6,
} from "./foo";
```

#### ▼ 動的 import

一部のモジュールはサーダーレンダリング中に読み込むことができず、ファイルの上部で import するとエラーになることがある。

こういったモジュールは CSR モードのクライアントレンダリング

```typescript
useEffect(() => {
  // react-apexchartsは内部でブラウザのwindowを参照するため、本ファイルの上部でimportするとSSRモードのサーバーレンダリング中にwindowを参照できずにエラーになる
  // 動的importを使用することで、react-apexchartsの部分だけをCSRモードのクライアントレンダリング中に読み込むようにする
  // @see https://github.com/apexcharts/react-apexcharts/issues/526
  import("react-apexcharts").then((module) => {
    let Component = (module as any).default;

    // 検証したところ、動的importで出力されるreactコンポーネントの型や構造はビルド方法（yarn dev、yarn build）や実行環境（ローカルPC、CI、AWS）ごとに異なっている模様
    // 例えば、ローカルPCでyarn buildした場合と、yarn buildの結果をAWSにデプロイした場合の間で、動的importの返却値型や構造が異なる
    // そこで、動的importの返却値に含まれるfunction型のComponentを確実に使用できるように、型と構造を検証する

    // Componentの構造に関する対処
    if (typeof Component !== "function") {
      // function型のComponentを再代入できたことを期待する
      Component = (Component as any)?.default;
    }

    // Componentの型に関する対処
    if (typeof Component !== "function") {
      // 再代入したComponentがfunction型でない場合、コンポーネントが想定外の型であるため、コンポーネントを表示しない
      return;
    }

    setChart(() => Component);
  });
}, []);
```

<br>

### export

#### ▼ export とは

```typescript
export {logger} from "./logger";
```

#### ▼ index.ts

各ディレクトリのエントリポイントとして使える。

`index.ts` ファイルで `export` しておくと、コールする側がディレクトリ単位でインポートできるようになる。

```typescript title="TypeScript の場合の実装例"
export {logger} from "./logger";
export {logger} from "./errorHandler";
```

アスタリスクで一括エクスポートしてもよい。

```typescript title="TypeScript の場合の実装例"
export * from "./logger";
export * from "./errorHandler";
```

```typescript
// ファイルを個別に指定する必要がなくなる
import {fooLogger, fooErrorHandler} from "~/utils";
```

> - [【TypeScript】フォルダごとにindex.tsを配置して一括import #TypeScript - Qiita](https://qiita.com/stin_dev/items/8bc6281dcebb289887be)

<br>
