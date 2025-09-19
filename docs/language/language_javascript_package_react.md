---
title: 【IT技術の知見】Reactパッケージ＠JavaScript
description: Reactパッケージ＠JavaScriptの知見を記録しています。
---

# Reactパッケージ＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Reactパッケージとは

フロントエンドのパッケージ群である。

以下のパッケージを組み合わせて、最低限アプリケーションを作成できる。

- react
- react-dom
- react-scripts (webpack、babelからなる)

> - https://tokuty.com/2023/02/17/react%E3%82%92%E6%9C%80%E4%BD%8E%E9%99%90%E3%81%AE%E6%A7%8B%E6%88%90%E3%81%A7%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B/#toc7
> - https://qiita.com/7280ayubihs/items/12c2e18b1d2460111051

<br>

## 02. セットアップ

### レンダリングパターン

#### ▼ CSRモード

エントリーポイント (`main`ファイル) でDOMツリーのルートによる`render`関数の実行が必要である。

```jsx
import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {App} from "./App.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

ワンラインで実装する場合、以下となる。

```jsx
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
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

## 04. reactコンポーネント

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

非同期関数を`useEffect`関数に渡したうえで、これをreactコンポーネントにする必要がある。

> - https://stackoverflow.com/a/78877882/12771072
> - https://stackoverflow.com/a/75689915/12771072

<br>

## 05. フック

### useEffect

#### ▼ useEffectとは

reactコンポーネント内で非同期処理を使用できるようにする。

フロントエンドの文脈では、レンダリング後のデータ変更処理を非同期処理とするとよく、レンダリング後にこの処理を`useEffect`関数で実行する。

```jsx
// useEffect関数内でsetFooState関数を実行し、state変数を動的に変更する
const [fooState setFooState] = useState("<初期値>");

useEffect(
  // 実行したい無名な非同期関数
  () => {

      // state変数に値を設定する
      setFooState(response.data);

      return () => {
          // 事後処理
    };
  },
  // useEffectを再度実行したい場合に、[state]を設定する
  // 省略すると、1回だけ実行する
  [state],
);
```

`return`のみを使用すると、`useEffect`で早期リターンも実装できる。

```jsx
const [fooState setFooState] = useState("<初期値>");

useEffect(
    () => {
        const data = response.data
        if(data){
            // state変数に値を設定する
            setFooState(response.data);
            return;
        }
        // state変数に値を設定する
        setFooState(null);
    },
    [state],
);
```

#### ▼ 第一引数

**＊実装例＊**

```jsx
import {useEffect, useState} from "react";

export const MyComponent = () => {
    // useEffect関数内でsetFooState関数を実行し、state変数を動的に変更する
    const [fooState setFooState] = useState("");

    useEffect(
    // 実行したい無名な非同期関数
    () => {
        const fetchData = async () => {
        const response = await axios.get("https://example.com");
        // state変数に値を設定する
        setFooState(response.data);
      };
      // 非同期処理を実行する
      fetchData();
    },
    [],
  );

  // stateを出力する
  // state変数はJS型オブジェクトであり、ドットでアクセスできる
  return <pre>{state.fooKey}</pre>;
};
```

> - https://qiita.com/Akihiro0711/items/dae74e3e73063a80b249
> - https://qiita.com/apollo_program/items/01fa3c4621155f64f930#useeffect%E3%81%AE%E7%AC%AC%E4%BA%8C%E5%BC%95%E6%95%B0%E3%82%92%E8%AA%A4%E3%82%8B%E3%81%A8%E7%84%A1%E9%99%90%E3%83%AB%E3%83%BC%E3%83%97%E3%81%8C%E7%99%BA%E7%94%9F%E3%81%99%E3%82%8B

#### ▼ 第二引数

**＊実装例＊**

```jsx
import React, {useState, useEffect} from "react";
import "./App.css";

export const App = () => {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  useEffect(
    () => {
      console.log("useEffectが実行されました");
    },
    // Stateのcount変数の値が変わるたびに、useEffectが実行される。
    [count],
  );

  return (
    <div className="App">
      <h1>Learn useEffect</h1>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
      <h2>Count2: {count2}</h2>
      <button onClick={() => setCount2((prevCount) => prevCount + 1)}>+</button>
    </div>
  );
};
```

> - https://zenn.dev/kimura141899/articles/4f33b899cb0bca#%E5%89%AF%E4%BD%9C%E7%94%A8%E3%82%92%E5%88%B6%E5%BE%A1%E3%81%99%E3%82%8B-%E7%AC%AC2%E5%BC%95%E6%95%B0%E3%81%AE%E5%87%BA%E7%95%AA

#### ▼ 実行の順番

`useEffect`関数はレンダリング後に実行される。

そのため、`useEffect`関数の後の関数が`useEffect`関数よりも先に実行される。

```jsx
import React, { useState, useEffect } from 'react';
import './App.css';

export App = () => {
  const [count, setCount] = useState(0);

  // 実行 (1)
  console.log('useEffect実行前です');

  useEffect(
      // 実行したい無名な非同期関数
      () => {
          // 実行 (3)
          console.log('useEffectが実行されました');
  });

  // 実行 (2)
  console.log('useEffect実行後です');

  return (
    <div className='App'>
      <h1>Learn useEffect</h1>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </div>
  );
}
```

> - https://zenn.dev/kimura141899/articles/4f33b899cb0bca#useeffect%E3%81%A8%E3%82%8A%E3%81%82%E3%81%88%E3%81%9A%E4%BD%BF%E3%81%A3%E3%81%A6%E3%81%BF%E3%81%9F

<br>

### useState

reactコンポーネント内で状態を操作できるようにする。

`state`変数と`setState`関数を返却するため、これを任意の名前の変数に格納する。

```jsx
import {useEffect, useState} from "react";

// state変数をfooState変数とし、setState関数をsetFooState変数とする
const [fooState setFooState] = useState("<初期値>");

// state変数はJS型オブジェクトであり、ドットでアクセスできる
console.log(state.fooKey);

// state変数はJS型オブジェクトであり、JSONを確認したい場合はJSON.stringify関数で変換する
console.log(JSON.stringify(state));
```

> - https://ja.react.dev/reference/react/useState

<br>

## 06 イベント

### SyntheticEventを拡張したChangeEvent

```typescript
import React from "react";

export const DateTimePicker = () => {

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // input属性で表示される画面で選択した値がevent変数に入る
    console.log("event:", event);
    console.log("event.target:", event.target);
    console.log("event.target.value:", event.target.value);
  };

  return (
    // クリックすると、handleChangeが発火する
    <input
      type="datetime-local"
      onChange={handleChange}
    />
  );
};
```

<br>
