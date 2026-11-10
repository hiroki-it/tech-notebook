---
title: 【IT技術の知見】データ・型＠JavaScript
---

# データ・型＠JavaScript

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. データ型

### undefined、null

#### ▼ undefined

データを代入しないときに適用されるデータ型である。

```javascript
// 変数b: 初期化されていない (値が代入されていない)
let b;

// 変数bの出力
console.log(b); // undefined
```

#### ▼ null

`null` は、undefined とは異なり、意図して代入しなければ適用されないデータ型である。

```javascript
// 変数a: 意図をもってnullを入れている
const a = null;

console.log(a); // null
```

#### ▼ undefined の返却

undefined を返却する場合、`return` のみを記述する。

```javascript
function foo() {
  return; // 空の『return文』。空なので『undefined』を返す。
}

const result = foo(); // 変数『result』には関数『foo』から返ってきた『undefined』が代入される。

console.log(result); // 『undefined』が出力される。
```

<br>

## 02. Array

### ▼ `Array.prototype.entries()` 関数

配列から key と value を取得する。

```javascript
const array = ["foo", "bar", "baz"];

// key、valueを取得できる。
const iterator = array.entries();

// for-ofで展開
for (const value of iterator) {
  console.log(value);
}

// [ 0, 'foo' ]
// [ 1, 'bar' ]
// [ 2, 'baz' ]
```

### ▼ `Array.prototype.map()` 関数

```javascript
// ここに実装例
```

### ▼ `Array.prototype.filter()` 関数

```javascript
// ここに実装例
```

### ▼ `Array.length`

要素数を出力する。

```javascript
const param = ["foo", "bar", "baz", "qux"];

console.log(param.length);

// 4
```

<br>

## 03. JSON

### ▼ `JSON.parse()` 関数

JavaScript から JSON にシリアライズする。

```javascript
console.log(
  JSON.stringify({
    x: 1,
    y: 5,
    z: "test",
  }),
);

// json形式オブジェクト
// "{"x":5, "y":5 "z":"test"}"
```

### ▼ `stringify()` 関数

JSON から JavaScript にデシリアライズする。

```javascript
console.log(
  JSON.parse({
    x: 1,
    y: 5,
    z: "test",
  }),
);

// JavaScriptオブジェクト
// {x:5, y:5 z:"test"}
```

<br>

## 04. スプレッド構文 (`...`)

### ▼ スプレッド構文とは

ドット `3` 個で記載する。

順序を保ったまま配列を走査し、値を取得する。

オブジェクトは捜査できない。

```javascript
const array = ["foo", "bar", "baz"];

console.log(...array);

// foo
// baz
// baz
```

<br>

