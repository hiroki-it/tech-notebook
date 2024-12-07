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
