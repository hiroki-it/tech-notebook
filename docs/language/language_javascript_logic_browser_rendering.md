---
title: 【IT技術の知見】ブラウザレンダリングロジック＠JavaScript
description: ブラウザレンダリングロジック＠JavaScriptを記録しています。
---

# ブラウザレンダリングロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Window

### Windowとは

> - https://developer.mozilla.org/ja/docs/Web/API/Window

<br>

### setTimeout

指定した秒数だけ処理を待機する。

```javascript
// 5秒待機する。
await new Promise((resolve) => {
  setTimeout(resolve, 5000);
});
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/setTimeout

<br>

### setInterval

指定した秒数ごとに処理を実行する。

```javascript
// 5秒ごとに実行する。
await new Promise((resolve) => {
  setInterval(resolve, 5000);
});
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/setInterval
