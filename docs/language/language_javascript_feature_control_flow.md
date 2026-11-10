---
title: 【IT技術の知見】制御構文
tags:
  - "言語"
  - "JavaScript"
  - "言語機能"
---

# 制御構文

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 反復

### `for  of`

#### ▼ `for  of` とは

順序を保ったまま配列を走査し、値を取得する。

オブジェクトに対して `entires()` 関数を使用して、一度配列に変換すれば、オブジェクトでも `for  of` を使用できる。

`for  in` を使用するより、こちらを使用したほうがよい。

#### ▼ 配列の場合

```javascript
const array = ["foo", "bar", "baz"];

for (const value of array) {
  console.log(value);
}

// foo
// bar
// baz
```

配列の `entires()` 関数を使用すれば、インデックス番号を取得もできる。

```javascript
const array = ["foo", "bar", "baz"];

for (const [key, value] of array.entries()) {
  console.log(key);
}

// 0
// 1
// 2
```

#### ▼ オブジェクトの場合

オブジェクトに対して `entires()` 関数を実行し、一度連想配列に変換すれば、オブジェクトでも `for ... of` を使用できる。

```javascript
const object = {
  x: "foo",
  y: "bar",
  z: "baz",
};

for (const [property, value] of Object.entries(object)) {
  console.log(value);
}

// foo
// bar
// baz
```

<br>

### continue

### `for  in`

#### ▼ `for  in` とは

配列/オブジェクト (連想配列) を順序を保たずに走査し、オブジェクトのプロパティ名や配列のキー名を取得する。

#### ▼ 配列の場合

```javascript
const array = ["foo", "bar", "baz"];

for (const key in array) {
  console.log(key);
}

// 0
// 1
// 2
```

#### ▼ オブジェクトの場合

```javascript
const object = {
  x: "foo",
  y: "bar",
  z: "baz",
};

for (const property in object) {
  console.log(property);
  console.log(object[property]);
}

// x
// y
// z
// foo
// bar
// baz
```

#### ▼ continue とは

反復処理の現在のループをスキップし、次のループを開始する。

```javascript
const array = ["foo", "bar", "baz"];

for (const [key, value] of array.entries()) {

    // キー名が偶数の組をスキップする。
    if(!(key % 2 == 0)){
        continue;
    }

    console.log(value);
}

// foo
// baz
```

#### ▼ `forEach()` 関数を使用した代替法

反復処理のループを `continue` でスキップと同じ動作を、配列を処理する関数のコールバック関数の早期リターンで実現できる。

`continue` を使用するより、こちらのほうがよい。

> - https://www.deep-rain.com/programming/javascript/778#continue

PHP にも、`forEach()` 関数と同様に配列に対してコールバック関数を適用する関数 (`find`、`fliter`、`map`、`reduce`、`some`) があり、用途に合わせて使い分ける。

> - [JavaScript で forEach を使うのは最終手段 #es2015 - Qiita](https://qiita.com/diescake/items/70d9b0cbd4e3d5cc6fce)

補足として PHP にも、`forEach()` 関数と同じような使い方をする `array_walk()` 関数がある。

```javascript
const array = ["foo", "bar", "baz"];

array.forEach((value, key) => {
  // キーが偶数の組をスキップする。
  if (!(key % 2 == 0)) {
    return;
  }

  console.log(value);
});

// foo
// baz
```
