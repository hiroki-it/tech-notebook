---
title: 【IT技術の知見】非同期処理ロジック＠JavaScript
---

# 非同期処理ロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 非同期処理

### 非同期処理化

処理の実行を部分的に遅らせると、後続する処理が先に実行される。

これは非同期処理である。

**＊実装例＊**

非同期化する処理を`setTimeout`関数に渡し、処理を遅らせる。

```javascript
function asyncMethod() {
  // 1秒だけ実行を遅らせる
  setTimeout(function () {
    console.log("foo");
  }, 1000);

  console.log("bar");
}

asyncMethod();

// 先にbarが実行される
// bar
// foo
```

> - https://qiita.com/kiyodori/items/da434d169755cbb20447#%E9%9D%9E%E5%90%8C%E6%9C%9F%E5%87%A6%E7%90%86

<br>

## 02. JavaScript Promise

### JavaScript Promiseとは

JavaScriptで、非同期処理の成否を管理し、後続する処理を定義できるオブジェクトのこと。

Promiseオブジェクトのコンストラクタに、非同期処理を持つ関数を渡すことにより、Promiseオブジェクトはこの関数内の非同期処理の成否を管理する。

実装量を減らして同じことを実装する場合、`async`宣言を使用する。

Promiseオブジェクトの実装の仕様は取り決められており、以下のリンクを参考にせよ。

```javascript
const asyncFunc = () => {
  return new Promise(
    // 非同期処理を持つ関数を渡す
    (resolve, reject) => {
      // 関数内の非同期処理の成否が管理される
    },
  );
};
```

> - https://promisesaplus.com/
> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise

### Promiseオブジェクトの種類

ネイティブなJavaScriptのPromiseオブジェクト、JQueryのPromiseオブジェクト、がある。

ネイティブの方が、Promiseオブジェクトの仕様により則った機能を持つ。

| リリース日 | 提供                                 | 種類                | 説明                                                                                                            | 補足                                                                                       |
| ---------- | ------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 2012       | JQueryパッケージのDeferredモジュール | Promiseオブジェクト | バージョン1.5でPromiseオブジェクトが導入された。<br>・https://api.jquery.com/category/version/1.5/              | ・https://api.jquery.com/category/deferred-object/                                         |
| 2015       | ビルトインオブジェクト               | Promiseオブジェクト | JQueryのPromiseオブジェクトを参考にして、ES2015から新しく使用できるようになった。                               | ・https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise    |
| 2017       | ビルトインオブジェクト               | async/await宣言     | ES2017から新しく使用できるようになった。ビルトインオブジェクトのPromiseオブジェクトをより使用しやすくしたもの。 | ・https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function |

> - https://stackoverflow.com/questions/32831143/javascript-promise-vs-jquery-deferred

<br>

### `resolve`メソッド、`reject`メソッド

#### ▼ コンストラクタを使用する場合

Promiseオブジェクトのコンストラクタ内では、暗黙的に`try-catch`が実行されている。

そのため、結果のステータスが成功であれば`resolve`メソッドの結果を返却し、反対に失敗であれば`reject`メソッドを返却する。

両方を実装すると良しなに実行してくれる。

`resolve`メソッドと`resolve`メソッドのコール時に`return`を使用しないと、後続する処理も実行される。

1つ目の書き方として、Promiseインスタンスのコールバック関数に渡す方法がある。

```javascript
const asyncFunc = () => {
  return new Promise((resolve, reject) => {
    // ステータスが成功の場合に選択される。
    resolve("SUCCESS"); // Promise { "SUCCESS" }

    // ステータスが失敗の場合に選択される。
    reject("FAILED"); // Promise { "FAILED" }

    console.log("test");
  });
};

console.log(asyncFunc());
// 後続する処理も実行され、resolveメソッドの結果が返却される。
// test
// Promise { 'SUCCESS' }
```

一方で、`resolve`メソッドと`resolve`メソッドのコール時に`return`を使用すると、後続する処理は実行されない。

```javascript
const asyncFunc = () => {
  return new Promise((resolve, reject) => {
    return resolve("SUCCESS");

    reject("FAILED");

    console.log("test");
  });
};

console.log(asyncFunc());
// 後続する処理も実行されない。
// Promise { 'SUCCESS' }
```

#### ▼ コンストラクタを使用しない場合

別の書き方として、Promiseオブジェクトから直接的に`resolve`メソッドや`reject`メソッドをコールしても良い。

この場合、必ず`return`で返却する必要がある。

`return`を使用しないと、何も返却されない。

```javascript
const asyncFunc = () => {
  // ステータスが成功の場合に選択される。
  return Promise.resolve("SUCCESS"); // Promise { "SUCCESS" }
};

const asyncFunc = () => {
  // ステータスが失敗の場合に選択される。
  return Promise.reject("FAILED"); // Promise { "FAILED" }
};

console.log(asyncFunc()); // Promise { 'SUCCESS' }
```

```javascript
const asyncFunc = () => {
  return Promise.resolve("SUCCESS");
};

asyncFunc()
  // 失敗時に返却されたrejectをハンドリング
  .catch((reject) => {
    // rejectメソッドを実行
    reject;
  })
  .then((resolve) => {
    // resolveメソッドを実行
    resolve;
  });

console.log(asyncFunc()); // Promise { 'SUCCESS' }
```

非同期処理内で両方をコールするとエラーになってしまう。

```javascript
const asyncFunc = () => {
  Promise.resolve("SUCCESS");
  Promise.reject("FAILED");
};

console.log(asyncFunc()); // エラーになってしまう
```

```bash
UnhandledPromiseRejectionWarning: FAILED
(Use `node --trace-warnings ...` to show where the warning was created)
UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
[DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

補足として、NodeのHTTPパッケージの関数は、Promiseインスタンスのコールバック関数として使用しないと、正しく挙動しない。

> - https://stackoverflow.com/questions/38533580/nodejs-how-to-promisify-http-request-reject-got-called-two-times

<br>

### `then`メソッド

#### ▼ `then`メソッドとは

Promiseオブジェクトの`resolve`関数の結果を引数に受け取り、コールバック関数を実行する。

> - https://qiita.com/saka212/items/9b6cfe06b464580c2ee6#promise%E3%81%AE%E5%9F%BA%E6%9C%AC

#### ▼ コンストラクタを使用する場合

**＊実装例＊**

```javascript
const resolveFunc = new Promise((resolve, reject) => {
  return resolve("resolve!!");
});

resolveFunc.then((value) => {
  // resolveFuncがPromiseを返し、resolve!!がresolveされるため
  // thenメソッドが実行されコンソールにresolve!!が表示される
  console.log(value); // resolve!!
});
```

```javascript
const resolveFunc = () => {
  // resolveFuncはasync functionではないため、Promiseを返さない
  return "resolve!!";
};

resolveFunc.then((value) => {
  // resolveFuncはPromiseを返さないため、エラーが発生して動かない
  // Uncaught TypeError: resolveError(...).then is not a function
  console.log(value);
});
```

<br>

### `catch`メソッド

#### ▼ `catch`メソッドとは

Promiseオブジェクトの`reject`関数の結果を引数に受け取り、コールバック関数を実行する。

> - https://qiita.com/saka212/items/9b6cfe06b464580c2ee6#promise%E3%81%AE%E5%9F%BA%E6%9C%AC

#### ▼ コンストラクタを使用する場合

```javascript
const rejectFunc = new Promise((resolve, reject) => {
  reject(new Error("reject!!"));
});

rejectFunc.catch((err) => {
  // rejectFuncがPromiseを返し、reject!!がrejectされるため
  // catchメソッドが実行されコンソールにreject!!が表示される
  console.log(err); // reject!!
});
```

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise#instance_methods

<br>

### `finally`メソッド

#### ▼ `finally`メソッドとは

記入中...

<br>

### setTimeout

指定した秒数だけ処理を待機する。

```javascript
// 5秒待機する。
await new Promise((resolve) => {
  setTimeout(resolve, 5000);
});
```

<br>

## 02-02. async/await

### async宣言

#### ▼ async宣言とは

async宣言された関数内の非同期処理は、Promiseオブジェクトに渡すための関数内に暗黙的に定義される。

Promiseオブジェクトを明示的に使用する場合、Promiseオブジェクトのコンストラクタに非同期処理を持つ関数を渡す必要があるため、Promiseオブジェクトの使用が楽になる。

Promiseや、これのコントラクタに渡す関数を実装する必要が無いため、可読性が高まる。

また、仮にPromiseオブジェクトをコールし、PromiseオブジェクトがPromiseオブジェクトに渡されてしまっても、結果的に入れ子にならないようによしなに処理してくれる。

**＊実装例＊**

以下の全ては、同じ処理を定義している。

```javascript
const asyncFunc = async () => {
  // Promiseオブジェクトに渡すための関数内に暗黙的に定義される。
  return "SUCCESS";
};

// 単にreturnとしてもPromiseオブジェクトが返却される。
console.log(asyncFunc()); // Promise { "SUCCESS" }
```

```javascript
const asyncFunc = async () => {
  return new Promise((resolve, reject) => {
    return resolve("SUCCESS"); // Promise { "SUCCESS" }
  });
};

// Promiseオブジェクトを返却するようにしても、入れ子にはならない。
console.log(asyncFunc()); // Promise { "SUCCESS" }
```

```javascript
const asyncFunc = async () => {
  return Promise.resolve("SUCCESS"); // Promise { "SUCCESS" }
};

// Promiseオブジェクトを返却するようにしても、入れ子にはならない。
console.log(asyncFunc()); // Promise { "SUCCESS" }
```

<br>

### await宣言

#### ▼ await宣言とは

非同期処理の結果を`then`メソッドに渡す。

Promiseオブジェクトの`then`メソッドに相当するが、`then`メソッドのようにメソッドチェーンする必要はなくなるため、可読性が高い。

時間のかかる非同期処理でこれを宣言すると、予期せず処理が流れてしまうことを防げる。

また、await宣言により、コールバック地獄のコードが分かりやすくなる。

**＊実装例＊**

```javascript
// Promiseオブジェクトのthenメソッドを使用した場合
const asyncFunc = async () => {
  axios.get("/some/path").then((res) => {
    console.log(response.data); // "some data"
  });
};

// awaitを使用した場合
const asyncFunc = async () => {
  // 非同期処理の結果がthenメソッドに渡される。
  const response = await axios.get("/some/path");

  console.log(response.data); // "some data"
};
```

**＊実装例＊**

```javascript
// Promiseオブジェクトのthenメソッドを使用した場合
const asyncFunc = async () => {
  // コールバック関数地獄になっている。
  axios.get("/some/path1").then((res) => {
    const res1 = res;
    axios.get("/some/path1").then((res) => {
      const res2 = res;
      console.log(res1.data + res2.data); // "some data"
    });
  });
};

// awaitを使用した場合
const asyncFunc = async () => {
  const res1 = await axios.get("/some/path1");

  const res2 = await axios.get("/some/path2");

  console.log(res1.data + res2.data); // "some data"
};
```

#### ▼ そもそも非同期にしなければawait宣言は不要なのでは？

関数を非同期処理化しなければ、`await`宣言がそもそも不要なのではという疑問がある。

例えば、通信処理を非同期処理化し、後続の通信処理結果によらない他の処理 (例：UIの更新) を実行しておく。

一方で、ファイル操作であれば、後続の処理は先行の処理結果が必要になるため、同期処理が適している。

ただ、使用するパッケージの仕様が非同期処理になっている場合 (例：Node.jsは非同期処理の関数が多い) 、`await`宣言を使用せざるを得ない。

> - https://blog.honjala.net/entry/2018/08/08/022027
> - https://zenn.dev/h_tatsuru/articles/28149eac34d55c#%F0%9F%90%B2%E5%90%8C%E6%9C%9F%E5%87%A6%E7%90%86%E3%81%A8%E9%9D%9E%E5%90%8C%E6%9C%9F%E5%87%A6%E7%90%86%E3%81%AE%E6%A9%9F%E8%83%BD%E4%BE%8B

<br>

### try-catch

#### ▼ try-catchとは

Promiseオブジェクトの`then`メソッド、`catch`メソッド、`finally`メソッドを使用してエラーハンドリングを実装できるが、try-catch文とawait宣言を組み合わせて、より可読性高く実装できる。

**＊実装例＊**

```javascript
const asyncFunc = async () => {
  return axios
    .get("/some/path1")
    .catch((error) => {
      console.error(error);
    })
    .then((data) => {
      console.info(data);
    });
};
```

```javascript
const asyncFunc = async () => {
  // 初期化
  let res;

  try {
    response = await axios.get("/some/path1");
    console.info(res);
  } catch (error) {
    console.error(error);
  }

  return res;
};
```

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise#instance_methods

<br>

### async-retry

#### ▼ async-retryとは

`async`による非同期処理をリトライする。

`await`宣言した関数を`retry`関数に渡す。

```typescript
const response = await retry(
  // 非同期処理
  async (values) => {},
);
```

**＊実装例＊**

```typescript
// Packages
const retry = require("async-retry");
const fetch = require("node-fetch");

const response = await retry(
  // 対象の関数
  async (bail, num) => {
    const response = await fetch("https://google.com");

    if (403 === response.status) {
      // 403のときはリトライしない
      bail(new Error("Unauthorized"));
      return;
    }

    return await response.text();
  },
  // オプション
  {
    // 最大リトライ回数
    retries: 10,
    // 指数関数的バックオフのfactor
    factor: 2,
    // 初回の待ち時間
    minTimeout: 1000,
    // 最大の待ち時間
    maxTimeout: Infinity,
    // ランダム化時の係数(1~2)
    randomize: true,
    // リトライ時に呼ばれる関数
    onRetry: (err, num) => console.log(err, num),
  },
);

console.log(res);
```

> - https://www.memory-lovers.blog/entry/2022/06/16/100000
> - https://zenn.dev/ak2ie/articles/af0f1d31a185c0

<br>

## 03. axiosパッケージ

### axios

Javascript Promiseを使用したHTTPクライアントパッケージである。

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

## 04. JQuery Promise

### JQuery Promiseとは

JQueryパッケージの提供する独自のPromiseオブジェクトである。

> - https://qiita.com/fakefurcoronet/items/cb2d2eba1a2e39f6643d

<br>

### `done`メソッド、`fail`メソッド、`always`メソッド

JQuery Promiseオブジェクトが持つメソッド。

`ajax`メソッドによってレスポンスを受信した後、その結果を`done`、`fail`、`always`の`3`個に分類し、これに応じたコールバック処理を実行する。

**＊実装例＊**

JQueryパッケージの`get`メソッドや`post`メソッドを使用した場合。

```javascript
const url = "https://www.google.co.jp/";

$.get(url)
  .done((data) => {
    console.log(data);
  })
  .fail((error) => {
    console.log(error);
  });
```

```javascript
const url = "https://www.google.co.jp/";

const params = {
  name: "Hiroki",
};

$.post(url, params)
  .done((data) => {
    console.log(data);
  })
  .fail((error) => {
    console.log(error);
  });
```

JQueryパッケージの`ajax`メソッドを使用した場合。

```javascript
const id = 1;

$.ajax({
  type: "POST",
  url: "/xxx/xxx/" + id + "/",
  contentType: "application/json",
  data: {
    param1: "AAA",
    param2: "BBB",
  },
})
  // 非同期通信の成功時のコールバック処理
  .done((data) => {
    console.log(data);
  })

  // 非同期通信の失敗時のコールバック処理
  .fail((error) => {
    console.log(data);
    toastr.error("", "エラーが発生しました。");
  })

  // 非同期通信の成功失敗に関わらず常に実行する処理
  .always((data) => {
    this.isLoaded = false;
  });
```

<br>

### `then`メソッド

JQuery Promiseオブジェクトが持つメソッド。

`ajax`メソッドによってレスポンスを受信した後、その結果を`then`メソッドの引数の順番で分類し、これに応じたコールバック処理を実行する。

非同期処理の後に同期処理を行いたい場合に使用する。

**＊実装例＊**

JQueryパッケージの`ajax`メソッドを使用した場合。

```javascript
const id = 1;

$.ajax({
  type: "POST",
  url: "/xxx/xxx/" + id + "/",
  contentType: "application/json",
  data: {
    param1: "AAA",
    param2: "BBB",
  },
})
  // 最初のthen
  .then(
    // 引数1つめは通信成功時のコールバック処理
    (data) => {},
    // 引数2つめは通信失敗時のコールバック処理
    (data) => {},
  )
  // 次のthen
  .then(
    // 引数1つめは通信成功時のコールバック処理
    (data) => {},
  );
```

<br>
