---
title: 【IT技術の知見】React.js＠フレームワーク
description: React.js＠フレームワークの知見を記録しています。
---

# React.js＠フレームワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. React.jsとは

パッケージ群である。

<br>

## 02. セットアップ

### レンダリング手法

#### ▼ CSRモード

エントリーポイント (`main`ファイル) で`createRoot`関数を実行する。

```jsx
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {App} from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App/>
    </StrictMode>,
)
```

> - https://react.dev/reference/react-dom/client
> - https://react.dev/reference/react-dom/client/createRoot

#### ▼ SSRモード

記入中...

> - https://react.dev/reference/react-dom/server

#### ▼ SSGモード

記入中...

> - https://react.dev/reference/react-dom/static

<br>

## 03. エクスポート

### デフォルトエクスポート

記入中...

> - https://zenn.dev/cocomina/articles/recommended-export

<br>

### 名前付きエクスポート

名前付きエクスポートの場合、インポート側は定義した名前以外でインポートできない。

```jsx
// App.tsxファイル

const Hello = () => {
  return (
    <p>
      Hello, <b>React!</b>
    </p>
  );
};

// 名前付きエクスポート
export const App = () => {
  return (
    <div className="App">
      <Hello />
    </div>
  );
};
```

```jsx
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";

// App.tsxファイルから名前付きエクポート (App) をインポートする
import {App} from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

> - https://zenn.dev/cocomina/articles/recommended-export

<br>

## 04. コンポーネント

### クラスコンポーネント

#### ▼ クラスコンポーネントとは

他ファイルで使用できる汎用的なクラスを定義する。

クラスコンポーネントより関数コンポーネントがより推奨である。

```jsx
import React, {Component} from "react";

export class MyComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
      </div>
    );
  }
}
```

> - https://qiita.com/omo_taku/items/18da0c020672a368f166#%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88
> - https://zenn.dev/swata_dev/articles/7f8ef4333057d7

<br>

### 関数コンポーネント

#### ▼ 関数コンポーネントとは

他ファイルで使用できる汎用的な関数を定義する。

クラスコンポーネントより関数コンポーネントがより推奨である。

```jsx
import React from "react";

export const MyComponent = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
    </div>
  );
};
```

> - https://qiita.com/omo_taku/items/18da0c020672a368f166#%E9%96%A2%E6%95%B0%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88
> - https://zenn.dev/swata_dev/articles/7f8ef4333057d7

#### ▼ `async`宣言不可

Reactでは、関数コンポーネントで`async`宣言は使用できない仕様になっている。

非同期関数を`useEffect`関数に渡したうえで、これをコンポーネントにする必要がある。

> - https://stackoverflow.com/a/78877882/12771072
> - https://stackoverflow.com/a/75689915/12771072

<br>

## 05. フック

### useEffect

コンポーネントで非同期処理を使用できるようにする。

```jsx
useEffect(
  // 実行したい非同期関数を定義する
  () => {
    return () => {
      // 事後処理を定義する
    };
  },
  // useEffectを再度実行したい場合に、その条件を定義する
  // 省略すると、1回だけ実行する
  [],
);
```

**＊実装例＊**

```jsx
import {useEffect, useState} from "react";

export const MyComponent = () => {
  const [state, setState] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      response = await axios.get("https://example.com");
      // stateに設定する
      setState(response.data);
    };
    // 非同期処理を実行する
    fetchData();
  }, []);

  // stateを出力する
  return <pre>{state.toString()}</pre>;
};
```

> - https://qiita.com/Akihiro0711/items/dae74e3e73063a80b249
> - https://qiita.com/apollo_program/items/01fa3c4621155f64f930#useeffect%E3%81%AE%E7%AC%AC%E4%BA%8C%E5%BC%95%E6%95%B0%E3%82%92%E8%AA%A4%E3%82%8B%E3%81%A8%E7%84%A1%E9%99%90%E3%83%AB%E3%83%BC%E3%83%97%E3%81%8C%E7%99%BA%E7%94%9F%E3%81%99%E3%82%8B

<br>
