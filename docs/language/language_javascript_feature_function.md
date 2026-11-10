---
title: 【IT技術の知見】関数
tags:
  - "言語"
  - "JavaScript"
  - "言語機能"
---

# 関数

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Function

関数を作成するオブジェクト。

<br>

## 02. 関数

### 関数オブジェクト

#### ▼ 関数オブジェクトとは

オブジェクトでもあり、関数である。

#### ▼ リテラル表記による関数オブジェクト

```javascript
// 定義
const object = {
  foo: "FOO",
  age: 42,
  baz: {myProp: 12},
};
```

#### ▼ コンストラクタ関数

関数宣言方式の `Function` コンストラクタを使用して、オブジェクトを定義する。

```javascript
// 関数宣言による定義
function car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}

// コール
const mycar = new car("Eagle", "Talon TSi", 1993);
```

<br>

### function 命令

#### ▼ function 命令とは

オブジェクトではない関数である。

```javascript
// 定義 (コールする場所が前後しても無関係)
function foo() {
  return "foo";
}
```

```javascript
// コール
methodA();
```

#### ▼ 名前がドルマークのもの

JavaScript でよく見かけるドルマーク。

これは、関数の名前としてドルマークを使用しているのみである。

```javascript
// 定義
function $() {
  return "foo";
}
```

jQuery では、パッケージの読み出し宣言時に、『Jquery』という名前の代わりにドルマークを使用する仕様になってる。

これと混乱しないように注意する。

```javascript
// jQuery.get() と同じ
$.get();
```

#### ▼ コールバック関数

```javascript
const asyncFunc = (param, callback) => {
  setTimeout(() => {
    // getData関数は、数値を渡すとdataを取得してくれると仮定する
    const data = getData(param);
    const err = data.getError();

    // 第二引数のコールバック関数は、getData関数とgetError関数の後に実行される。
    callback(err, data);
  }, 0);
};

const testParam = 1;

// asyFunc関数の第一引数が、第二引数で設定したコールバック関数に渡される。
// 渡されたコールバック関数は、getData関数とgetError関数の後に実行されるため、errやdataを受け取れる
asyncFunc(testParam, (err, data) => {
  if (err) {
    throw err;
  }
  console.info(data);
});
```

