---
title: 【IT技術の知見】アプリケーション間通信＠アプリケーション連携
description: アプリケーション間通信＠アプリケーション連携の知見を記録しています。
---

# アプリケーション間通信＠アプリケーション連携

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. アプリケーション間通信の種類

### 処理タイミングで見た種類

#### ▼ 同期通信

調査中...

#### ▼ 非同期通信とは

非同期処理の一種である。そのため、通信の完了を待たずに後続の処理が始まる。後続の全処理が非同期通信と無関係であれば、そのままで問題は起こらない。しかし、後続の処理に非同期通信の結果を使用するものが含まれている場合、この処理だけは非同期通信の後に実行されるように定義する必要がある。特定の処理が非同期通信の後に実行されるように定義する方法については、以下のリンクを参考にせよ。

- JavaScriptのAjax

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_js_logic_asynchronous_process.html

<br>

### 通信方向で見た種類

#### ▼ 一方向

クライアントからサーバーにリクエストを送信する。サーバーからクライアントにリクエストを送信することはない。

#### ▼ 双方向

クライアントとサーバー間が双方向でリクエストを送信し合う。

> ℹ️ 参考：https://qiita.com/namusyaka/items/71cf27fd3242adbf348c

- gRPCの双方向ストリーミングRPC
- Websocket

<br>

## 02. Ajaxによる非同期通信

### Ajaxとは：Asynchronous JavaScript + XML

JavaScriptで非同期通信を実現する手法のこと。JavaScript、HTML、XHTML、CSS、DOM、XML、XSLT、を組み合わせる。

<br>

### Ajaxの仕組み

![AJAXの処理フロー](https://user-images.githubusercontent.com/42175286/58467340-6741cb80-8176-11e9-9692-26e6401f1de9.png)

（１）urlにアクセスすることにより、サーバーからデータがレスポンスされる。

（２）DOMのマークアップ言語の解析により、Webページが構成される。

（３）ページ上で任意のイベント（例：ページング操作、フォーム入力など）が発火し、紐付くハンドラ関数が実行される。

（４）JavaScript型オブジェクトがJSONに変換される。

（５）非同期通信により、バックエンドにリクエストを送信する。

（６）コントローラーは、JSON型データを受信し、加えてそれを元にDBからオブジェクトをReadする。

（７）コントローラーは、PHP型オブジェクトをJSONに変換し、レスポンスを返信する。

（８）非同期通信メソッドがバックエンドからレスポンスを受信する。

（９）JSONがJavaScript型オブジェクトに変換される。

（１０）オブジェクトがマークアップ言語に出力される。

（１１）DOMを使用して、Webページを再び構成する。

<br>

### 実装方法の種類

歴史的に、Ajaxを実装するための方法がいくつかある。

#### ▼ xhrオブジェクト

JavaScriptのビルトインオブジェクトである。今では使用することは少ないが、Ajaxが登場した初期の頃によく使われた。

> ℹ️ 参考：https://developer.mozilla.org/ja/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest

#### ▼ ```fetch```メソッド

JavaScriptのビルトイン関数である。

> ℹ️ 参考：https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch

#### ▼ JQueryオブジェクト

JQueryパッケージである。

> ℹ️ 参考：
> 
> - https://api.jquery.com/category/ajax/shorthand-methods/
> - https://api.jquery.com/jquery.ajax
 
#### ▼ axiosオブジェクト

Axiosパッケージである。

> ℹ️ 参考：https://github.com/axios/axios#request-method-aliases

<br>

## 02-02. Ajaxの実装

### xhrオブジェクトの場合

#### ▼ GET送信

> ℹ️ 参考：https://blog.capilano-fw.com/?p=6920#Ajax

**＊実装例＊**

```javascript
// URL
const url = 'https://example.com/';

const xhr = new XMLHttpRequest();

// HTTPメソッドを指定
xhr.open('GET', url);

// レスポンス受信後の処理
xhr.onload = () => {
    if(xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
    }
};

// 最後に送信を実行
xhr.send();
```

#### ▼ POST送信

> ℹ️ 参考：https://blog.capilano-fw.com/?p=6920#Ajax

**＊実装例＊**

```javascript
// URL
const url = 'https://example.com/';

// メッセージボディ
const body = {
    name: 'Hiroki',
    email: 'example@gmail.com',
    password: 'password'
};

const queries = [];

for(const key in body) {
    const query = key +'='+ encodeURIComponent(params[key]);
    queries.push(query);
}

const queryString = queries.join('&');

const xhr = new XMLHttpRequest();

// HTTPメソッドを指定
xhr.open('POST', url);

// 送信するデータ型
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

// レスポンス受信後の処理
xhr.onload = () => {
    if(xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
    }
};

// 最後に送信を実行
xhr.send(queryString);
```

<br>

### JQueryオブジェクトの場合

#### ▼ GET送信

**＊実装例＊**

```javascript
const url = 'https://example.com/';

$.get(url);
```

#### ▼ POST送信

**＊実装例＊**

```javascript
const url = 'https://example.com/';

const body = {
    name: 'Hiroki',
    email: 'example@gmail.com',
    password: 'password'
};

$.post(url, params);
```

#### ▼ 任意のHTTPメソッド

任意のHTTPメソッド、URL、ヘッダー、メッセージボディなどを設定し、非同期的にデータを送受信する。Promiseオブジェクトを返却する。

> ℹ️ 参考：https://api.jquery.com/jquery.ajax

**＊実装例＊**

```javascript
const id = 1;

$.ajax({

    // ###################
    //  リクエスト
    // ###################

    // HTTPメソッド
    type: 'POST',

    // URL
    url: '/xxx/xxx/' + id + '/',

    // 送信するデータ型
    contentType: 'application/json',

    // メッセージボディ
    data: {
        name: 'Hiroki',
        email: 'example@gmail.com',
        password: 'password'
    },

    // ###################
    //  レスポンス
    // ###################

    // 受信するデータ型
    dataType: 'json',
})
```

<br>

### Axiosオブジェクトの場合

#### ▼ GET送信

**＊実装例＊**

```javascript
const url = 'https://example.com/';

axios.get(url);
```

#### ▼ POST送信

**＊実装例＊**

```javascript
const url = 'https://example.com/';

const body = {
    name: 'Hiroki',
    email: 'example@gmail.com',
    password: 'password'
};

axios.post(url, params);
```

<br>
