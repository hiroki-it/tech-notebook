---
title: 【IT技術の知見】ユーティリティパッケージ@TypeScript
description: ユーティリティパッケージ@TypeScriptの知見を記録しています。
---

# ユーティリティパッケージ@TypeScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. axios

### axiosとは

JavaScript Promiseを使用したHTTPクライアントパッケージである。

**＊実装例＊**

非道処理としてGETでリクエストを送信している。

```javascript
// axiosオブジェクトのメソッドはPromiseオブジェクトを返却する。
const asyncFunc = async () => {
  axios.get("/some/path").then((res) => {
    console.log(response.data); // "some data"
  });
};
```

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function

### axios-retry

#### ▼ axios-retryとは

axiosパッケージによる非同期処理をリトライする。

```java

import axios from 'axios';
import axiosRetry from 'axios-retry';

// axiosオブジェクトをあらかじめ渡しておく
axiosRetry(axios, {
  retries: 1,
  retryCondition: () => true,
  retryDelay: function(retryCount, error) {
    return 2;
  }
})

// axiosでリクエストを非同期処理する
const response = await axios.get('http://example.com/rea')

console.log(response);
```

> - https://blog.symdon.info/posts/1638831647/
> - https://qiita.com/fyuneru0830/items/3410b37cd6a004223092
> - https://github.com/softonic/axios-retry?tab=readme-ov-file#options

<br>

## Nodeamon

### Nodeamonとは

Goのソースコードに変更があれば、ホットリロードし、コンパイルし直す。

> - https://ashitaka-blog.com/node-js%E3%81%AE%E3%83%9B%E3%83%83%E3%83%88%E3%83%AA%E3%83%AD%E3%83%BC%E3%83%89%E8%A8%AD%E5%AE%9A/

<br>
