---
title: 【IT技術の知見】パッケージ＠Node.js
description: パッケージ＠Node.jsの知見を記録しています。
---

# パッケージ＠Node.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 構造化ログ

### pino

#### ▼ info、error

指定のログレベルのメッセージを出力する。

```javascript
const pino = require("pino");
const https = require("https");

let logger = pino();

const server = http.createServer((req, res) => {
  // リクエストヘッダーの取得
  const headers = req.headers;

  // クエリパラメータの取得
  const queryParam = url.parse(req.url, true).query;

  logger.info("Do something successfully.");

  const response = {
    headers: headers,
    queryParam: queryParam,
  };

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response));
});
```

> - https://wiblok.com/ja/nodejs/index/nodejs-request-info-processing-method/

<br>

#### ▼ 属性の追加

```javascript
const pino = require("pino");
const https = require("https");

let logger = pino();

const server = http.createServer((req, res) => {
  // リクエストヘッダーの取得
  const headers = req.headers;

  // クエリパラメータの取得
  const queryParam = url.parse(req.url, true).query;

  logger.info({trace_id: getTraceId(req.header)}, "Do something successfully.");

  const response = {
    headers: headers,
    queryParam: queryParam,
  };

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response));
});

function getTraceId(headers) {
  // 受信したリクエストのtraceparent値を取得する
  const traceparent = headers?.["traceparent"];
  if (traceparent) {
    // W3C Trace Context
    // traceparent: 00-<trace_id>-<span_id>-01
    const parts = traceparent.split("-");
    if (parts.length >= 2) {
      return parts[1];
    }
  }
  return "unknown";
}
```

> - https://wiblok.com/ja/nodejs/index/nodejs-request-info-processing-method/

<br>
