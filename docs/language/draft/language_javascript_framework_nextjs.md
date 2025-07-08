---
title: 【IT技術の知見】Next.js＠フレームワーク
description: Next.js＠フレームワークの知見を記録しています。
---

# Next.js＠フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Next.jsとは

Reactパッケージを使用したフレームワークである。

<br>

## 02. セットアップ

### レンダリング手法

#### ▼ CSRモード

以下の時にCSRモードになり、SPAをレンダリングする。

- ファイルの先頭に`"use client"`を指定している。

```jsx
"use client";

import React, {useEffect, useState} from "react";

type Product = {
  id: string;
  title: string;
};

const CsrPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();

    setProducts(data.products);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h3>Built with CSR</h3>
      <br />
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CsrPage;
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6

#### ▼ SSRモード

以下の時にSSRモードになる。

- `fetch`関数の第二引数に、`{ cache: "no-store" }`を指定している
- `useEffect`、`useState`、`onClick`などのブラウザ依存の機能を使用していない

```jsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const SsrPage = async () => {
  const response = await fetch("https://dummyjson.com/products", {
    cache: "no-store",
  });
  const data = await response.json();

  return (
    <>
      <h3>Built with SSR</h3>
      <br />
      <ul>
        {data.products.map((product: Product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default SsrPage;
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6-1

#### ▼ SSGモード

以下の時にSSGモードになる。

- `fetch`関数の第二引数に、`{ cache: "force-cache" }`を指定しているか、または何も指定していない
- `useEffect`、`useState`、`onClick`などのブラウザ依存の機能を使用していない

```jsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const SsgPage = async () => {
  const response = await fetch("https://dummyjson.com/products");
  const data = await response.json();

  return (
    <>
      <h3>Built with SSG</h3>
      <br />
      <ul>
        {data.products.map((product: Product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default SsgPage;
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6-2

#### ▼ ISRモード

以下の時にISRモードになる。

- `fetch`関数の第二引数に、`{ next: { revalidate: <任意の値> } }`を指定している
- `useEffect`、`useState`、`onClick`などのブラウザ依存の機能を使用していない

```jsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const IsrPage = async () => {
  const response = await fetch("https://dummyjson.com/products", {
    next: {
      revalidate: 30,
    },
  });
  const data = await response.json();

  return (
    <>
      <h3>Built with ISR</h3>
      <br />
      <ul>
        {data.products.map((product: Product) => (
          <li key={product.id}>
            {product.id}: {product.title}
          </li>
        ))}
      </ul>
    </>
  );
};

export default IsrPage;
```

> - https://qiita.com/whopper1962/items/1d1a7179845b3e1d3084#%E6%9D%A1%E4%BB%B6-3

<br>

## 03. 環境変数

### 言語の実行環境

- `export`コマンドで出力する
- コンテナの環境変数として出力する

<br>

### プレフィクス

| 環境変数名                 | バックエンド (SSR、SSG、API) | フロントエンド (CSR) |
| -------------------------- | :--------------------------: | :------------------: |
| `NEXT_PUBLIC_****`         |         ✅ 使用可能          |     ✅ 使用可能      |
| `****` (`NEXT_PUBLIC`なし) |         ✅ 使用可能          |     ❌ 使用不可      |

<br>

### `.env`ファイル

#### ▼ 仕組み

`.env`ファイルを自動的に読み込み、また名前に応じて処理が変わる。

dotenvパッケージは不要である。

#### ▼ `.env`ファイル

全ての`yarn`コマンドで自動的に読み込まれる。

#### ▼ `.env.local`ファイル

全ての`yarn`コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.development`ファイル

`yarn dev`コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.development.local`ファイル

`yarn dev`コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.production`ファイル

`yarn start`コマンドと`next build`コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

#### ▼ `.env.production.local`ファイル

`yarn start`コマンドと`next build`コマンドで自動的に読み込まれる。

> - https://qiita.com/ktanoooo/items/64cad61096cf45f18c24#env%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%81%AE%E7%A8%AE%E9%A1%9E

<br>
