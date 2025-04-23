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

ブラウザのウィンドウ (ブラウザタブ) を表すオブジェクトである。

> - https://developer.mozilla.org/ja/docs/Web/API/Window

<br>

### clearInterval

#### ▼ clearIntervalとは

`setInterval`関数によって定期実行中の関数を停止する関数を返却する。

```javascript
function setIntervalFunction(
  func: () => void,
  interval: number
): () => void {
  const intervalId = setInterval(func, interval);

  // 停止するための関数を返す
  return () => clearInterval(intervalId);
}

// 使用例
const stop = setIntervalFunction(() => {
  console.log("定期実行中");
}, 1000);

// 5秒後に停止
setTimeout(() => {
  // 返却された関数を実行すると、ループを停止できる
  stop();
  console.log("停止しました");
}, 5000);
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/clearInterval

<br>

### setTimeout

#### ▼ setTimeoutとは

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

#### ▼ setIntervalとは

指定した秒数ごとに処理を実行する。

`clearInterval`関数の返却値の関数で処理を停止できる。

```javascript
function setIntervalFunction(
    func: () => void,
    interval: number
): () => void {
  const intervalId = setInterval(func, interval);

  // 停止するための関数を返す
  return () => clearInterval(intervalId);
}

// 使用例
const stop = setIntervalFunction(() => {
  console.log("定期実行中");
}, 1000);

// 5秒後に停止
setTimeout(() => {
  // 返却された関数を実行すると、ループを停止できる
  stop();
  console.log("停止しました");
}, 5000);
```

> - https://developer.mozilla.org/ja/docs/Web/API/Window/setInterval

<br>
