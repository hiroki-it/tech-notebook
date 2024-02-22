---
title: 【IT技術の知見】非同期処理ロジック＠JavaScript
---

# 非同期処理ロジック＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 非同期処理

### 非同期処理

#### ▼ 非同期処理とは

> - https://hiroki-it.github.io/tech-notebook/language/language_process_mode.html

#### ▼ 非同期処理化

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

### Promiseオブジェクト

#### ▼ Promiseオブジェクトとは

JavaScriptで、非同期処理の成否を管理し、後続する処理を定義できるオブジェクトのこと。

Promiseオブジェクトの実装の仕様は取り決められており、以下のリンクを参考にせよ。

> - https://promisesaplus.com/

#### ▼ Promiseオブジェクトの種類

ネイティブなJavaScriptのPromiseオブジェクト、JQueryのPromiseオブジェクト、がある。

ネイティブの方が、Promiseオブジェクトの仕様により則った機能を持つ。

| リリース日 | 提供                                 | 種類                | 説明                                                                                                            | 補足                                                                                       |
| ---------- | ------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 2012       | JQueryパッケージのDeferredモジュール | Promiseオブジェクト | バージョン1.5でPromiseオブジェクトが導入された。<br>・https://api.jquery.com/category/version/1.5/              | ・https://api.jquery.com/category/deferred-object/                                         |
| 2015       | ビルトインオブジェクト               | Promiseオブジェクト | JQueryのPromiseオブジェクトを参考にして、ES2015から新しく使用できるようになった。                               | ・https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise    |
| 2017       | ビルトインオブジェクト               | async/await宣言     | ES2017から新しく使用できるようになった。ビルトインオブジェクトのPromiseオブジェクトをより使用しやすくしたもの。 | ・https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function |

> - https://stackoverflow.com/questions/32831143/javascript-promise-vs-jquery-deferred

<br>

## 02. ネイティブなJavaScript

### Promiseオブジェクト

Promiseオブジェクトのコンストラクタに、非同期処理を持つ関数を渡すことにより、Promiseオブジェクトはこの関数内の非同期処理の成否を管理する。

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise

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

```yaml
UnhandledPromiseRejectionWarning: FAILED
(Use `node --trace-warnings ...` to show where the warning was created)
UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
[DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

補足として、NodeのHTTPパッケージの関数は、Promiseインスタンスのコールバック関数として使用しないと、正しく挙動しない。

> - https://stackoverflow.com/questions/38533580/nodejs-how-to-promisify-http-request-reject-got-called-two-times

<br>

### `then`メソッド、`catch`メソッド、`finally`メソッド

#### ▼ コンストラクタを使用する場合

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise#instance_methods

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

<br>

## 02-02. async/await宣言

### async宣言

#### ▼ async宣言とは

Promiseオブジェクトを明示的に使用する場合、Promiseオブジェクトのコンストラクタに非同期処理を持つ関数を渡す必要がある。

一方で、async宣言された関数内の非同期処理は、Promiseオブジェクトに渡すための関数内に暗黙的に定義される。

Promiseや、これのコントラクタに渡す関数を実装する必要が無いため、可読性が高まる。

また、仮にPromiseオブジェクトをコールし、PromiseオブジェクトがPromiseオブジェクトに渡されてしまっても、結果的に入れ子にならないようによしなに処理してくれる。

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function

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

また、axiosオブジェクトのようにPromiseオブジェクトをデフォルトで返却するメソッドを使用しても良い。

**＊実装例＊**

非道処理としてGETでリクエストを送信している。

```javascript
// axiosオブジェクトのメソッドはPromiseオブジェクトを返却する。
const asyncFunc = async () => {
  axios.get("/some/path").then((res) => {
    console.log(res.data); // "some data"
  });
};
```

<br>

### await宣言とは

#### ▼ await宣言

以降の全処理を`then`メソッドに渡す。

Promiseオブジェクトの`then`メソッドに相当するが、`then`メソッドのようにメソッドチェーンする必要はなくなるため、可読性が高い。

時間のかかる非同期処理でこれを宣言すると、予期せず処理が流れてしまうことを防げる。

**＊実装例＊**

```javascript
// Promiseオブジェクトのthenメソッドを使用した場合
const asyncFunc = async () => {
  axios.get("/some/path").then((res) => {
    console.log(res.data); // "some data"
  });
};

// awaitを使用した場合
const asyncFunc = async () => {
  // 以降の全処理がthenメソッドに渡される。
  const res = await axios.get("/some/path");

  console.log(res.data); // "some data"
};
```

await宣言により、コールバック地獄のコードが分かりやすくなる。

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

<br>

### エラーハンドリング

#### ▼ try-catch

Promiseオブジェクトの`then`メソッド、`catch`メソッド、`finally`メソッドを使用してエラーハンドリングを実装できるが、try-catch文とawait宣言を組み合わせて、より可読性高く実装できる。

> - https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise#instance_methods

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
  let response;

  try {
    response = await axios.get("/some/path1");
    console.info(response);
  } catch (error) {
    console.error(error);
  }

  return response;
};
```

<br>

### スリープ

#### ▼ setTimeout

指定した秒数だけ処理を待機する。

```javascript
// 5秒待機する。
await new Promise((resolve) => {
  setTimeout(resolve, 5000);
});
```

<br>

## 03. JQuery

### Promiseオブジェクト

#### ▼ `done`メソッド、`fail`メソッド、`always`メソッド

Promiseオブジェクトが持つメソッド。

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

#### ▼ `then`メソッド

Promiseオブジェクトが持つメソッド。

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
