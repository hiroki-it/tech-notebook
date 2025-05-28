---
title: 【IT技術の知見】パッケージ＠Node.js
description: パッケージ＠Node.jsの知見を記録しています。
---

# パッケージ＠Node.js

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ロギング

### pino

#### ▼ pinoとは

Node.jsのロガーである。

Node.jsのロガーは通常バックエンドでしか使用できないが、Pino内の`pino/browser`モジュールはブラウザで使用できる。

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

#### ▼ browserモジュール

```javascript
import pino from "pino/browser";

// prettyPrint: true で見やすい出力（開発用）
const logger = pino({
  browser: {
    asObject: true, // ログをオブジェクト形式で出力
  },
  level: "info",
});

logger.info("Hello from browser!");
logger.error({err: new Error("error!")}, "エラー発生");
```

<br>

### winston

#### ▼ winstonとは

Node.jsのロガーである。

バックエンドのみで使用でき、Node.jsのレンダリングに関わる処理でコールしても何も起こらない。

```javascript
import * as winston from "winston";

/**
 * ログの出力先（トランスポート）を設定する
 */
const transports = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL,
    // 環境変数をbool型に変換する
    quiet: process.env.LOG_QUIET === "true",
  }),
];

/**
 * ログのフォーマットを設定する
 */
const format = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DDTHH:mm:ss.SSSZ",
  }),
  winston.format((info) => {
    // タイムスタンプにtimeキーを使用するため、元のtimestampキーを削除する
    if (info.timestamp) {
      info.time = info.timestamp;
      delete info.timestamp;
    }
    // スタックトレースにstacktraceキーを使用するため、元のstackキーを削除する
    if (info.stack) {
      info.stacktrace = info.stack;
      delete info.stack;
    }
    return info;
  })(),
  winston.format.errors({stack: true}),
  winston.format.splat(),
  // 開発環境：prettyPrintで出力を整形する
  // AWS環境：JSON形式で出力する
  process.env.LOG_PRETTY_PRINT === "true"
    ? winston.format.prettyPrint()
    : winston.format.json(),
);

/**
 * Winstonロガーを作成する
 */
export const logger = winston.createLogger({
  transports,
  format,
});
```

|             |                                                                      |
| ----------- | -------------------------------------------------------------------- |
| `LOG_LEVEL` | ログレベルを設定する。                                               |
| `LOG_QUIET` | ログ出力の有無を設定する。場合によっては、CI環境でログを無効化する。 |

<br>

## 02. node.jsのプロセスの操作

### 新しいプロセスの実行

#### ▼ child_process

子のnode.jsプロセスを実行する。

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

### プロセスのステータス

#### ▼ process.on

Node.jsのプロセスのステータスに応じて、処理を実行する。

```javascript
// プロセスの終了前にクリーンアップ処理を実行する
process.on("beforeExit", (code) => {
  console.log("Process beforeExit event with code: ", code);
});

// プロセス終了時のステータスコードを設定する
process.on("exit", (code) => {
  console.log("Process exit event with code: ", code);
});

console.log("This message is displayed first.");
```

<br>

## 03. ファイルの操作

### ファイル書き込み

#### ▼ writeFileSync

ファイルにテキストを書き込む。

同期処理のため、完了を待って後続の処理を実行する。

```javascript
import fs from "fs";

// ファイルを書き込む
fs.writeFileSync("output.txt", "書き込む内容");

// 後続の処理
```

> - https://nodejs.org/api/fs.html#fswritefilesyncfile-data-options
> - https://photo-tea.com/p/17/fs-write-nodejs/

#### ▼ writeFile

ファイルにテキストを書き込む。

非同期処理のため、完了を待たずに後続の処理を実行する。

```javascript
import fs from "fs";

// ファイルを書き込む
fs.writeFile("output.txt", "書き込む内容", (err) => {
  // 書き出しに失敗した場合
  if (err) {
    console.log("エラーが発生しました。" + err);
    throw err;
  }
  // 書き出しに成功した場合
  else {
    console.log("ファイルが正常に書き出しされました");
  }
});

// 後続の処理
```

> - https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback
> - https://photo-tea.com/p/17/fs-write-nodejs/

<br>

## 04. メモリの操作

### キャッシュの作成

外部のインメモリDBではなく、コンテナやサーバーのメモリ上にオブジェクトのキャッシュを作成する。

```javascript
import NodeCache from "node-cache";

// メモリ上にキャッシュを作成する (TTL 無制限、チェック間隔 600 秒)
const fooNodeCache = new NodeCache();

// キャッシュにデータを保存する
const key = "myObject";
const objToCache = {name: "太郎", age: 30};
const ttlInSeconds = 3600; // 1時間

fooNodeCache.set(key, objToCache, ttlInSeconds);
console.log(`"${key}" をキャッシュに保存しました。`);

// キャッシュからデータを取得する
const cachedObj = fooNodeCache.get(key);
if (cachedObj) {
  console.log(`キャッシュから "${key}" を取得しました:`, cachedObj);
} else {
  console.log(`キャッシュに "${key}" は見つかりませんでした。`);
}

// キャッシュにキーが存在するか確認する
const hasKey = fooNodeCache.has(key);
console.log(`キャッシュに "${key}" は存在しますか？:`, hasKey);

// キャッシュからデータを削除する
fooNodeCache.del(key);
console.log(`"${key}" をキャッシュから削除しました。`);

// 再度キャッシュからデータを取得する
const deletedObj = fooNodeCache.get(key);
if (deletedObj) {
  console.log(`キャッシュから "${key}" を取得しました:`, deletedObj);
} else {
  console.log(`キャッシュに "${key}" は見つかりませんでした。`);
}
```

> - https://sunday-morning.app/posts/2020-03-18-node-cache

<br>
