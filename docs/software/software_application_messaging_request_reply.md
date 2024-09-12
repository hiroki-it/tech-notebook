---
title: 【IT技術の知見】リクエスト/レスポンス方式＠メッセージング方式
description: リクエスト/レスポンス方式＠メッセージング方式の知見を記録しています。
---

# リクエスト/レスポンス方式＠メッセージング方式

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. リクエスト/レスポンス方式

### 処理の種類

#### ▼ 同期通信

アプリ間で同期的に双方向で通信を実行する。

リクエスト処理の完了 (レスポンス) を待ってから、後続の処理が開始する。

#### ▼ 非同期通信

アプリ間で非同期的に双方向で通信を実行する。

リクエスト処理の完了 (レスポンス) を待たずに、後続の処理が開始する。

後続の全処理が非同期通信と無関係であれば、そのままで問題は起こらない。

しかし、後続の処理に非同期通信の結果を使用するものが含まれている場合、この処理だけは非同期通信の後に実行されるように定義する必要がある。

<br>

### 通信仲介コンポーネントの種類

#### ▼ ポイントツーポイントの場合

アプリ間で直接的に通信する。

送信側のアプリはリクエスト送信し、受信側のアプリは同期的にリクエストを受信する。

送信側のアプリは、受信側のアプリの障害を受けてしまう。

> - https://www.linkedin.com/pulse/microservice-integration-patterns-point-to-point-vs-message-rhodes-7sfoc/

#### ▼ メッセージキューを経由する場合

メッセージキュー (例：AWS SQSなど) を経由して、アプリ間で通信する。

#### ▼ メッセージブローカーを経由する場合

通信仲介コンポーネントにメッセージブローカー (例：Apache Kafka、RabbitMQなど) を経由して、アプリ間で通信する。

送信側のアプリはこれらにリクエストを送信する。

受信側のアプリは、リクエストを非同期的に (任意のタイミングで) 受信する。

送信側のアプリは、受信側のアプリの障害を受けない。

> - https://www.linkedin.com/pulse/microservice-integration-patterns-point-to-point-vs-message-rhodes-7sfoc/

<br>

### 通信方向の種類

#### ▼ 一方向

クライアントからサーバーにリクエストを送信する。

サーバーからクライアントにリクエストを送信することはない。

#### ▼ 双方向

クライアントとサーバー間が双方向でリクエストを送信し合う。

- gRPCの双方向ストリーミングRPC
- Websocket

> - https://qiita.com/namusyaka/items/71cf27fd3242adbf348c

<br>

## 02. Ajaxによる非同期通信

### Ajaxとは：Asynchronous JavaScript + XML

JavaScriptで非同期通信を実装する手法のこと。

JavaScript、HTML、XHTML、CSS、DOM、XML、XSLT、を組み合わせる。

<br>

### Ajaxの仕組み

![AJAXの処理フロー](https://user-images.githubusercontent.com/42175286/58467340-6741cb80-8176-11e9-9692-26e6401f1de9.png)

`(1)`

: urlに接続することにより、サーバーからデータがレスポンスされる。

`(2)`

: DOMのマークアップ言語の解析により、Webページが構成される。

`(3)`

: ページ上で任意のイベント (例：ページング操作、フォーム入力など) が発火し、紐付くハンドラ関数が実行される。

`(4)`

: JavaScript型オブジェクトがJSONに変換される。

`(5)`

: 非同期通信により、バックエンドにリクエストを送信する。

`(6)`

: コントローラーは、JSON型データを受信し、加えてそれを元にDBからオブジェクトをReadする。

`(7)`

: コントローラーは、PHP型オブジェクトをJSONに変換し、レスポンスを返信する。

`(8)`

: 非同期通信メソッドがバックエンドからレスポンスを受信する。

`(9)`

: JSONがJavaScript型オブジェクトに変換される。

`(10)`

: オブジェクトがマークアップ言語に出力される。

`(11)`

: DOMを使用して、Webページを再び構成する。

<br>

### 実装方法の種類

歴史的に、Ajaxを実装するための方法がいくつかある。

#### ▼ xhrオブジェクト

JavaScriptのビルトインオブジェクトである。

今では使用することは少ないが、Ajaxが登場した初期の頃によく使われた。

> - https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

#### ▼ `fetch`メソッド

JavaScriptのビルトイン関数である。

> - https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch

#### ▼ JQueryオブジェクト

JQueryパッケージである。

> - https://api.jquery.com/category/ajax/shorthand-methods/
> - https://api.jquery.com/jquery.ajax

#### ▼ axiosオブジェクト

Axiosパッケージである。

> - https://github.com/axios/axios#request-method-aliases

<br>

## 02-02. Ajaxの実装

### xhrオブジェクトの場合

#### ▼ GET送信

**＊実装例＊**

```javascript
// URL
const url = "https://example.com/";

const xhr = new XMLHttpRequest();

// HTTPメソッドを指定
xhr.open("GET", url);

// レスポンス受信後の処理
xhr.onload = () => {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};

// 最後に送信を実行
xhr.send();
```

> - https://blog.capilano-fw.com/?p=6920#Ajax

#### ▼ POST送信

**＊実装例＊**

```javascript
// URL
const url = "https://example.com/";

// メッセージボディ
const body = {
  name: "Hiroki",
  email: "example@gmail.com",
  password: "password",
};

const queries = [];

for (const key in body) {
  const query = key + "=" + encodeURIComponent(params[key]);
  queries.push(query);
}

const queryString = queries.join("&");

const xhr = new XMLHttpRequest();

// HTTPメソッドを指定
xhr.open("POST", url);

// 送信するデータ型
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

// レスポンス受信後の処理
xhr.onload = () => {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};

// 最後に送信を実行
xhr.send(queryString);
```

> - https://blog.capilano-fw.com/?p=6920#Ajax

<br>

### JQueryオブジェクトの場合

#### ▼ GET送信

**＊実装例＊**

```javascript
const url = "https://example.com/";

$.get(url);
```

#### ▼ POST送信

**＊実装例＊**

```javascript
const url = "https://example.com/";

const body = {
  name: "Hiroki",
  email: "example@gmail.com",
  password: "password",
};

$.post(url, params);
```

#### ▼ 任意のHTTPメソッド

任意のHTTPメソッド、URL、ヘッダー、メッセージボディなどを設定し、非同期的にパケットを送受信する。

Promiseオブジェクトを返却する。

> - https://api.jquery.com/jquery.ajax

**＊実装例＊**

```javascript
const id = 1;

$.ajax({
  // ###################
  //  リクエスト
  // ###################

  // HTTPメソッド
  type: "POST",

  // URL
  url: "/xxx/xxx/" + id + "/",

  // 送信するデータ型
  contentType: "application/json",

  // メッセージボディ
  data: {
    name: "Hiroki",
    email: "example@gmail.com",
    password: "password",
  },

  // ###################
  //  レスポンス
  // ###################

  // 受信するデータ型
  dataType: "json",
});
```

<br>

### Axiosオブジェクトの場合

#### ▼ GET送信

**＊実装例＊**

```javascript
import axios from "axios";

const url = "https://example.com/";

axios.get(url);
```

**＊実装例＊**

ここでは、バックエンドにポーリングを実行する。

ポーリングの完了を待たずに後続の処理を実行するため、非同期処理である。

```javascript
import axios from "axios";

async function pollBackend() {
  try {
    const response = await axios.get("/api/endpoint");
    // responseを処理する

    // 再帰的に呼び出す
    setTimeout(() => {
      pollBackend();
    }, 1000);
  } catch (error) {
    // エラー処理
  }
}
```

```javascript
// ポーリングを実行する
pollBackend();
```

#### ▼ POST送信

**＊実装例＊**

```javascript
import axios from "axios";

const url = "https://example.com/";

const body = {
  name: "Hiroki",
  email: "example@gmail.com",
  password: "password",
};

axios.post(url, params);
```

<br>
