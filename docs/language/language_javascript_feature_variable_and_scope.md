---
title: 【IT技術の知見】変数・スコープ
tags:
  - "言語"
  - "JavaScript"
  - "言語機能"
---

# 変数・スコープ

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 変数

### 変数の種類

#### ▼ 一覧表

<table>
  <thead>
    <tr>
      <th style="text-align:left">項目</th>
      <th style="text-align:left">var</th>
      <th style="text-align:left">let</th>
      <th>const</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">再宣言</td>
      <td style="text-align:left">可能</td>
      <td style="text-align:left">不可能</td>
      <td>不可能</td>
    </tr>
    <tr>
      <td style="text-align:left">再代入</td>
      <td style="text-align:left">可能</td>
      <td style="text-align:left">可能</td>
      <td>不可能</td>
    </tr>
    <tr>
      <td style="text-align:left">初期化 (<code>undefined</code> 化)</td>
      <td style="text-align:left">可能</td>
      <td style="text-align:left">可能</td>
      <td>不可能</td>
    </tr>
    <tr>
      <td style="text-align:left">スコープ</td>
      <td style="text-align:left">関数スコープ</td>
      <td style="text-align:left">ブロックスコープ</td>
      <td>ブロックスコープ</td>
    </tr>
  </tbody>
</table>

#### ▼ `const`

基本的には、宣言に `const` を使用する

```javascript
if (true) {
  // ブロック外からアクセス不可
  const foo = "foo";

  // 再宣言不可
  const foo = "bar"; // ERROR

  // 再代入不可
  foo = "baz"; // ERROR
}

// ブロック内のconstにアクセス不可
console.log(foo); // ERROR
```

#### ▼ `let`

繰り返し処理で再代入が必要であれば、`const` ではなく `let` を使用する。

```javascript
if (true) {
  // ブロック外からアクセス不可
  let foo = "foo";

  // 再宣言不可
  let foo = "bar"; // ERROR

  // 再代入可能
  foo = "baz";
}

// ブロック内のletにアクセス不可
console.log(foo); // ERROR
```

また、`try-catch` では変数への代入が保証されていないため、`let` を使用して、あらかじめ初期化しておく必要がある。

```javascript
const asyncFunc = async () => {
  // 初期化するとundefinedになる。
  let response;

  try {
    response = await axios.get("https://example.com");
    console.info(response.data);
  } catch (error) {
    console.error(error);
  }

  return response;
};
```

#### ▼ `var`

```javascript
if (true) {
  // ブロック外からアクセス可
  var foo = "foo";

  // 再宣言
  var foo = "bar";

  // 再代入可能
  foo = "foo";
}

// ブロック内のvarにアクセスできる。
console.log(foo); // foo
```

<br>

### 変数の巻き上げ (ホイスト)

#### ▼ 巻き上げとは

巻き上げは、`var` を使用して変数を宣言したときや、関数で発生し得る。

確認のため `console.log()` 関数を実行した場合、`foo` を宣言していないため、『x is not defined 』エラーになりそうである。

しかし実際は、宣言がすでに済んでおり、`foo` に値が代入されていないことを示す『undefined』となる。

```javascript
console.log(foo); // undefined

var foo = "foo"; // 宣言と代入
```

これは、スコープの範囲内で宣言と代入した変数で、宣言処理はスコープの最初で行ったことになるという仕様のためである。

```javascript
// 内部的には、最初に宣言処理したことになる
// var foo

console.log(foo); // undefined

var foo = "foo"; // 宣言と代入により、実際は宣言処理を実装していなくとも、行なったことになる。
```

これは関数の代入時にも起こる。

> - [関数とスコープ · JavaScript Primer #jsprimer](https://jsprimer.net/basic/function-scope/#function-declaration-hoisting)

```javascript
// 内部的には、最初に宣言処理したことになる
// var foo

foo(); // foo is not a function

var foo = function () {
  return "foo";
};
```

#### ▼ `var` 使用時の対策

意図しない挙動を防ぐため、変数の宣言と代入はスコープの最初で行うようにする。

```javascript
var foo = "foo"; // スコープの最初に宣言する。

console.log(foo); // foo
```

これは関数の代入時も同じである。

```javascript
var foo = function () {
  return "foo";
};

foo(); // foo
```

#### ▼ `let`,`const` 使用時の対策

宣言に `let`、`const` を使用した場合、巻き上げは起こらないため、宣言と代入の場所を気にしなくともよくなる。

```javascript
console.log(foo); // foo is not defined

let foo = "foo";
```

<br>

### 分割代入

#### ▼ 配列

配列の値を、任意の名前の変数に代入する。

```javascript
const array = [1, 2, 3];

// fooに1、barに2、bazに3を代入
const [foo, bar, baz] = array;

console.log(foo); // 1
console.log(bar); // 2
console.log(baz); // 3
```

#### ▼ オブジェクト

オブジェクトの値を、プロパティ名と同じ名前の変数に代入する。

```javascript
const obj = {
  foo: 1,
  bar: 2,
  baz: 3,
};

// プロパティ名と同じ名前の変数に代入
const {foo, baz} = obj;

console.log(foo); // 1
console.log(baz); // 3
```

<br>

