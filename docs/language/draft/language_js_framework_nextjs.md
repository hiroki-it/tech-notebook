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

## セットアップ

### レンダリング手法

#### ▼ CSRモード

以下の時にCSRモードになり、SPAをレンダリングする。

- ファイルの先頭に`"use client"`を指定している。

```tsx
"use client";

import React, {useEffect, useState} from "react";

type Product = {
  id: string;
  title: string;
};

const CsrPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchData = async () => {
    const res = await fetch("https://dummyjson.com/products");
    const data = await res.json();

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

#### ▼ SSRモード

以下の時にSSRモードになる。

- `fetch`関数の第二引数に、`{ cache: "no-store" }`を指定している
- `useEffect`、`useState`、`onClick`などのブラウザ依存の機能を使用していない

```tsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const SsrPage = async () => {
  const res = await fetch("https://dummyjson.com/products", {
    cache: "no-store",
  });
  const data = await res.json();

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

#### ▼ SSGモード

以下の時にSSGモードになる。

- `fetch`関数の第二引数に、`{ cache: "force-cache" }`を指定している
- `useEffect`、`useState`、`onClick`などのブラウザ依存の機能を使用していない

```tsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const SsgPage = async () => {
  const res = await fetch("https://dummyjson.com/products");
  const data = await res.json();

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

#### ▼ ISRモード

以下の時にISRモードになる。

- `fetch`関数の第二引数に、`{ next: { revalidate: <任意の値> } }`を指定している
- `useEffect`、`useState`、`onClick`などのブラウザ依存の機能を使用していない

```tsx
import React from "react";

type Product = {
  id: string;
  title: string;
};

const IsrPage = async () => {
  const res = await fetch("https://dummyjson.com/products", {
    next: {
      revalidate: 30,
    },
  });
  const data = await res.json();

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

<br>
