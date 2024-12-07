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

<br>

### axios api

HTTPリクエストを送信する。

**＊実装例＊**

非同期処理としてGETでリクエストを送信している。

```javascript
// axiosオブジェクトのメソッドはPromiseオブジェクトを返却する。
const asyncFunc = async () => {
  axios.get("/some/path").then((res) => {
    // "some data"
    console.log(response.data);
  });
};
```

<br>

### リクエスト設定

#### ▼ data

```javascript
const asyncFunc = async () => {
  axios
    .get("/some/path", {
      data: {
        id: "1",
      },
    })
    .then((res) => {
      // "some data"
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config

#### ▼ headers

```javascript
const asyncFunc = async () => {
  axios
    .get("/some/path", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      // "some data"
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config

#### ▼ withCredential

```javascript
const asyncFunc = async () => {
  axios
    .get("/some/path", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
    .then((res) => {
      // "some data"
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config

<br>

### レスポンスのJSON構造

#### ▼ data

```json
{
  "data": {}
}
```

> - https://axios-http.com/docs/res_schema

#### ▼ status

```json
{
  "status": 200
}
```

> - https://axios-http.com/docs/res_schema

#### ▼ statusText

```json
{
  "statusText": "OK"
}
```

> - https://axios-http.com/docs/res_schema

#### ▼ headers

```json
{
  "headers": {}
}
```

> - https://axios-http.com/docs/res_schema

#### ▼ config

```json
{
  "config": {}
}
```

> - https://axios-http.com/docs/res_schema

#### ▼ request

```json
{
  "request": {}
}
```

> - https://axios-http.com/docs/res_schema

<br>

## 01-02. axios-retry

### axios-retryとは

axiosパッケージによる非同期処理をリトライする。

```javascript
import axios from "axios";
import axiosRetry from "axios-retry";

// axiosオブジェクトをあらかじめ渡しておく
axiosRetry(axios, {
  retries: 1,
  retryCondition: () => true,
  retryDelay: function (retryCount, error) {
    return 2;
  },
});

// axiosでリクエストを非同期処理する
const response = await axios.get("http://example.com/rea");

console.log(response);
```

> - https://blog.symdon.info/posts/1638831647/
> - https://qiita.com/fyuneru0830/items/3410b37cd6a004223092
> - https://github.com/softonic/axios-retry?tab=readme-ov-file#options

<br>

## 02. Nodeamon

### 02. Nodeamonとは

Goのソースコードに変更があれば、ホットリロードし、コンパイルし直す。

> - https://ashitaka-blog.com/node-js%E3%81%AE%E3%83%9B%E3%83%83%E3%83%88%E3%83%AA%E3%83%AD%E3%83%BC%E3%83%89%E8%A8%AD%E5%AE%9A/

<br>
