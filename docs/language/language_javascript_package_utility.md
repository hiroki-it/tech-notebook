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

非同期処理としてGETリクエストを送信する。

```javascript
// axiosオブジェクトのメソッドはPromiseオブジェクトを返却する。
const asyncFunc = async () => {
  axios.get("https://example.com").then((response) => {
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

**＊実装例＊**

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("https://example.com", {
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

**＊実装例＊**

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("https://example.com", {
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

#### ▼ httpsAgent

`https`パッケージを使用して、`axios`パッケージを拡張する。

**＊実装例＊**

クライアント証明書を使用して、HTTPSリクエストを送信する。

```javascript
import axios from "axios";
import https from 'https';

const asyncFunc = async () => {
  axios
    .get("https://example.com", {
      headers: {
        "Content-Type": "application/json",
      },
      httpAgent: new https.Agent({
        cert: "<クライアント証明書のファイル>",
        key: "<クライアント証明書とペアになる秘密鍵のファイル>",
        rejectUnauthorized: false,
        keepAlive: true
      });
    })
    .then((response) => {
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config
> - https://github.com/axios/axios/issues/3835#issuecomment-860993251

#### ▼ withCredential

`Cookie`ヘッダーをリクエストに設定する。

**＊実装例＊**

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("https://example.com", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
    .then((response) => {
      console.log(response.data);
    });
};
```

> - https://axios-http.com/docs/req_config
> - https://apidog.com/jp/blog/axios-send-cookie/#axios%E3%81%A7cookie%E3%82%92%E9%80%81%E4%BF%A1%E3%81%99%E3%82%8B%E3%81%AB%E3%81%AF%EF%BC%9F

#### ▼ xsrfCookieName

**＊実装例＊**

```javascript
import axios from "axios";

const asyncFunc = async () => {
  axios
    .get("https://example.com", {
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

httpClientのインスタンスを渡す必要がある。

```javascript
import axios from "axios";
import axiosRetry from "axios-retry";

// httpClientのインスタンスを作成する
const httpClient = axios.create({timeout: 10000});

// httpClientのインスタンスを渡す
axiosRetry(httpClient, {
  retries: 1,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
});

// axiosでリクエストを非同期処理する
const response = await httpClient.get("http://example.com");

console.log(response.data);
```

即時関数を使用すると、`axios`によるhttpクライアント作成と`axios-retry`によるリトライ設定を一括で行いつつ、httpクライアントのインスタンスを作成する処理を実装できる。

```typescript
// httpClientのインスタンスを作成する
const httpClient = (() => {
  // httpClientを作成する
  const httpClient = axios.create({timeout: 10000});

  // httpClientのインスタンスを渡す
  axiosRetry(httpClient, {
    retries: 1,
    retryDelay: axiosRetry.exponentialDelay,
    shouldResetTimeout: true,
  });

  return httpClient;
})();

// axiosでリクエストを非同期処理する
const response = await httpClient.get("http://example.com");

console.log(response.data);
```

> - https://blog.symdon.info/posts/1638831647/
> - https://qiita.com/fyuneru0830/items/3410b37cd6a004223092
> - https://github.com/softonic/axios-retry?tab=readme-ov-file#options

<br>

### メモリリーク対策

メモリリークにつながるため、アプリケーションの実行中に一回だけグローバルに`axios-retry`を設定する必要がある。

> - https://tech.andpad.co.jp/entry/2020/03/19/080036
> - https://github.com/axios/axios/issues/4763

<br>

### 設定

<br>

## 02. Nodemon

### Nodemonとは

JavaScriptのソースコードに変更があれば、Node.js上のプロセスを再起動する。

> - https://qiita.com/ckoshien/items/1a8b15fe5cc3bfc15199
> - https://ashitaka-blog.com/node-js%E3%81%AE%E3%83%9B%E3%83%83%E3%83%88%E3%83%AA%E3%83%AD%E3%83%BC%E3%83%89%E8%A8%AD%E5%AE%9A/

<br>

## 03. ts-node

### ts-nodeとは

Node.js上で、TypeScriptをJavaScriptにコンパイルせずにそのまま実行する。

> - https://qiita.com/ckoshien/items/1a8b15fe5cc3bfc15199

<br>

### tsconfig-paths/register

`tsconfig`ファイルで定義しているパスのエイリアスを適用する。

```bash
$ yarn ts-node --require tsconfig-paths/register dbseed.ts"
```

<br>

## 04. typescript-call-graph

TypeScriptのコールグラフを作成する。

ブラウザ上で確認できる。

`tsx`ファイルは解析できない。

```bash
$ npm install -g typescript-call-graph

$ tcg app/**/*

╭───────────────────────────╮
│      Graph visible @      │
│   http://localhost:3000   │
│      Ctrl + C to quit     │
╰───────────────────────────╯
```

> - https://github.com/whyboris/TypeScript-Call-Graph

<br>
