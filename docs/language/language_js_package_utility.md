---
title: 【IT技術の知見】ユーティリティパッケージ＠JavaScript
description: ユーティリティパッケージ＠JavaScriptの知見を記録しています。
---

# ユーティリティパッケージ＠JavaScript

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

非同期処理としてGETでリクエストを送信する。

```javascript
// axiosオブジェクトのメソッドはPromiseオブジェクトを返却する。
const asyncFunc = async () => {
  axios.get("/some/path").then((response) => {
    console.log(response.data);
  });
};
```

> - https://axios-http.com/docs/api_intro

<br>

### デフォルト設定

```javascript
import axios from "axios";

axios.defaults.baseURL = "https://api.example.com";
axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;
axios.defaults.headers.post["Content-Type"] = "application/json";
```

> - https://axios-http.com/docs/config_defaults

<br>

### リクエスト設定

#### ▼ data

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("/some/path", {
      data: {
        id: "1",
      },
    })
    .then((response) => {
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config

#### ▼ headers

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("/some/path", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config

#### ▼ withCredential

`Cookie`ヘッダーをリクエストに設定する。

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("/some/path", {
      headers: {
        "Content-Type": "application/json",
      },
      // CSRFトークンのためのヘッダーを設定する
      xsrfCookieName: "XSRF-TOKEN",
    })
    .then((response) => {
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config
> - https://apidog.com/jp/blog/axios-send-cookie/#axios%E3%81%A7cookie%E3%82%92%E9%80%81%E4%BF%A1%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%EF%BC%9F

#### ▼ xsrfCookieName

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("/some/path", {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config

<br>

### レスポンスのJSON構造

#### ▼ レスポンスの出力

```javascript
import axios from "axios";

axios.get("/user/12345").then(function (response) {
  console.log(response.data);
  console.log(response.status);
  console.log(response.statusText);
  console.log(response.headers);
  console.log(response.config);
});
```

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

console.log(response.data);
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
