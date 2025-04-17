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

#### ▼ ログ構造

```yaml
{
  "level": 30,
  "time": 1744725534278,
  "pid": 1,
  "hostname": "foo-65d4ffdcfc-6sf99",
  "trace_id": "514bc006c3350c34be840a0dfe289492",
  "msg": "Do something successfully",
}
```

#### ▼ info、error

指定のログレベルのメッセージを出力する。

```javascript
import pino from "pino";
import https from "https";

let logger = pino();

const server = http.createServer((req, res) => {
  // リクエストヘッダーの取得
  const headers = req.headers;

  // クエリパラメータの取得
  const queryParam = url.parse(req.url, true).query;

  logger.info("Do something successfully");

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

#### ▼ フィールドの追加

```javascript
import pino from "pino";
import https from "https";

let logger = pino();

const server = http.createServer((req, res) => {
  // リクエストヘッダーの取得
  const headers = req.headers;

  // クエリパラメータの取得
  const queryParam = url.parse(req.url, true).query;

  logger.info({trace_id: getTraceId(req.header)}, "Do something successfully");

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

> - https://zenn.dev/itte/articles/ce93b081048691#%E7%8B%AC%E8%87%AA%E3%81%AE%E3%83%97%E3%83%AD%E3%83%91%E3%83%86%E3%82%A3%E3%82%92%E5%87%BA%E5%8A%9B%E3%81%99%E3%82%8B
> - https://wiblok.com/ja/nodejs/index/nodejs-request-info-processing-method/

<br>

## 02. プロセスの操作

### child_process

```javascript
import spawn from "child_process";

const script = `
  process.stdin.on('data', (data) => {
    process.stdout.write(data.toString().toUpperCase());
  });
`;

// 実行する子プロセスを設定する
const child = spawn(
    // Nodeコマンドを実行する
    "node",
    // eオプションでスクリプトを実行する
    ["-e", script],
    {
      stdio: ["pipe", "pipe", "inherit"],
      detached: true,
    }
);

await new Promise((resolve, reject) => {

  const child = spawn()

  child.unref()

  let stdout = ''
  let stderr = ''

  // 子プロセスの標準出力からデータを取得する
  child.stdout.on('data', (data) => {
    stdout += data.toString()
    resolve("SUCCESS");
    reject("FAILED");
  })

  // 子プロセスの標準エラー出力からデータを取得する
  child.stderr.on('data', (data) => {
    stderr += data.toString()
    resolve("SUCCESS");
    reject("FAILED");
  })

  // 子プロセスが終了した時の処理
  child.on('exit', (code, signal) => {
    resolve("SUCCESS");
    reject("FAILED");
  })

  // 子プロセスの作成中や実行中にエラーが発生した時の処理
  child.on('error', (err) => {
    resolve("SUCCESS");
    reject("FAILED");
  })
}
```

> - https://nodejs.org/api/child_process.html
> - https://qiita.com/k96mz/items/43444cedbfc2a11a01ea#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB%E3%82%B3%E3%83%BC%E3%83%89

<br>
