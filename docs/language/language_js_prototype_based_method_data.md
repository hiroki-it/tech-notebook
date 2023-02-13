---
title: 【IT技術の知見】メソッド/データ＠JavaScript
---

# メソッド/データ＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 関数

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
}
```

#### ▼ コンストラクタ関数

関数宣言方式の```Function```コンストラクタを使用して、オブジェクトを定義する。



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

### function命令

#### ▼ function命令とは

オブジェクトではない関数である。



**＊実装例＊**

```javascript
// 定義（コールする場所が前後しても無関係）
function foo(){
    return "foo";
}
```

```javascript
// コール
methodA();
```

#### ▼ 名前がドルマークのもの

JavaScriptでよく見かけるドルマーク。

これは、関数の名前としてドルマークを使用しているのみである。



**＊実装例＊**

```javascript
// 定義
function $(){
    return "foo";
}
```

jQueryでは、パッケージの読み出し宣言時に、『Jquery』という名前の代わりにドルマークを使用する仕様になってる。

これと混乱しないように注意する。



**＊実装例＊**

```javascript
// jQuery.get() と同じ
$.get()
```

#### ▼ コールバック関数

```javascript
const asyncFunc = (param, callback) => {
  setTimeout(() => {
    
    // getDataメソッドは、数値を渡すとdataを取得してくれると仮定します。
    const  data = getData(param);
    const  err = data.getError();
      
    // 第二引数のコールバック関数は、getDataメソッドとgetErrorメソッドの後に実行される。
    callback(err, data);
  }, 0);
}

const test = 1

// asyFuncメソッドの第一引数が、第二引数で設定したコールバック関数に渡される。
// 渡されたコールバック関数は、getDataメソッドとgetErrorメソッドの後に実行されるため、errやdataを受け取れる
asyncFunc(test, (err, data) => {
  if (err) {
      throw err;
  }
    console.log(data);
});
```

#### ▼ ファイル外で読み込む

関数の前で```export```を宣言する。



**＊実装例＊**

関数の定義と```export```の宣言を同時に行う。



```javascript
export function foo(){
    return "foo";
}
```

あるいは、別々に行う。



```javascript
const foo = () => {
    return "foo";
}

export default foo
```



<br>

## 02. データ型

### undefined、null

#### ▼ undefined

データを代入しない時に適用されるデータ型である。



**＊実装例＊**


```javascript
// 変数b: 初期化されていない（値が代入されていない）
const b;

// 変数bの出力
console.log(b);  // undefied
```


#### ▼ null

nullは、undefinedとは異なり、意図して代入しなければ適用されないデータ型である。



**＊実装例＊**

```javascript
// 変数a: 意図をもってnullを入れている
const a = null;

console.log(a); // null
```

#### ▼ undefinedの返却

undefinedを返却する場合、```return```のみを記述する。



**＊実装例＊**

```javascript
function foo(){
    return; // 空の『return文』。空なので『undefined』を返す。
}

const foo = foo(); // 変数『foo』には関数『foo』から返ってきた『undefined』が代入される。
 
console.log(foo); // 『undefined』が出力される。
```

<br>

## 03. 変数

### 変数の種類

#### ▼ 一覧表

| 項目                      | var      | let      | const    |
|:--------------------------|:---------|:---------|----------|
| 再宣言                    | 可能     | 不可能   | 不可能   |
| 再代入                    | 可能     | 可能     | 不可能   |
| 初期化（```undefined```化） | 可能     | 可能     | 不可能   |
| スコープ                      | 関数スコープ | ブロックスコープ | ブロックスコープ |

#### ▼ ```const```

基本的には、宣言に```const```を使用する

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

#### ▼ ```let```

繰り返し処理で再代入が必要であれば、```const```ではなく```let```を使用する。




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

また、```try-catch```構文では変数への代入が保証されていないため、```let```を使用して、あらかじめ初期化しておく必要がある。

```javascript
const asyncFunc = async () => {
    
    // 初期化するとundefinedになる。
    let response;
    
    try {
        
        response = await axios.get("/some/path1")
        console.info(response);
        
    } catch (error) {
        
        console.error(error);
        
    }
    
    return response;
}
```

#### ▼ ```var```


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

### 変数の巻き上げ（ホイスト）

#### ▼ 巻き上げとは

巻き上げは、```var```を使用して変数を宣言した時や、関数で発生し得る。

確認のため```console.log```メソッドを実行した場合、```foo```を宣言していないため、『x is not defined 』エラーになりそうである。

しかし実際は、宣言が既に済んでおり、```foo```に値が代入されていないことを示す『undefined』となる。



```javascript
console.log(foo); // undefined

var foo = "foo"; // 宣言と代入
```

これは、スコープの範囲内で宣言と代入を実行した変数で、宣言処理がスコープの最初に行ったことになるという仕様のためである。



```javascript
// 内部的には、最初に宣言処理したことになる
// var foo

console.log(foo); // undefined

var foo = "foo"; // 宣言と代入により、実際は宣言処理を実装していなくとも、行なったことになる。
```

これは関数の代入時にも起こる。



> ↪️ 参考：https://jsprimer.net/basic/function-scope/#function-declaration-hoisting

```javascript
// 内部的には、最初に宣言処理したことになる
// var foo

foo(); // foo is not a function

var foo = function(){
    return "foo";
}
```

#### ▼ ```var```使用時の対策

意図しない挙動を防ぐため、変数の宣言と代入はスコープの最初に行うようにする。



```javascript
var foo = "foo"; // スコープの最初に宣言する。

console.log(foo); // foo
```
これは関数の代入時も同じである。



```javascript
var foo = function(){
    return "foo";
}

foo(); // foo
```

#### ▼ ```let```,```const```使用時の対策

宣言に```let```、```const```を使用した場合、巻き上げは起こらないため、宣言と代入の場所を気にしなくともよくなる。



```javascript
console.log(foo); // foo is not defined

let foo = "foo";
```

<br>

### 分割代入

#### ▼ 配列

配列の値を、任意の名前の変数に代入する。



**＊実装例＊**

```javascript
const array = [1, 2, 3];

// fooに1、barに2、bazに3、を代入
const [foo, bar, baz] = array;

console.log(foo); // 1
console.log(bar); // 2
console.log(baz); // 3
```

#### ▼ オブジェクト

オブジェクトの値を、プロパティ名と同じ名前の変数に代入する。



**＊実装例＊**

```javascript
const obj = {
    foo: 1,
    bar: 2,
    baz: 3
};

// プロパティ名と同じ名前の変数に代入
const {foo, baz} = obj;

console.log(foo); // 1
console.log(baz); // 3
```

<br>

## 04. 反復

### ```for  of```

#### ▼ ```for  of```とは

順序を保ったまま配列を走査し、値を取得する。

オブジェクトに対して```entires```メソッドを使用して、一度配列に変換すれば、オブジェクトでも```for  of```を使用できる。

```for  in```を使用するより、こちらを使用した方が良い。



#### ▼ 配列の場合

```javascript
const  array = ["foo", "bar", "baz"];

for (const value of array) {
  console.log(value);
}

// foo
// bar
// baz
```

配列の```entires```メソッドを使用すれば、インデックス番号を取得もできる。



```javascript
const  array = ["foo", "bar", "baz"];

for (const [key, value] of array.entries()) {
  console.log(key);
}

// 0
// 1
// 2
```

#### ▼ オブジェクトの場合

オブジェクトに対して```entires```メソッドを実行し、一度連想配列に変換すれば、オブジェクトでも```for ... of```を使用できる。



```javascript
const object = {
  "x": "foo",
  "y": "bar",
  "z": "baz"
};

for (const [property, value] of Object.entries(object)) {
  console.log(value);
}

// foo
// bar
// baz
```

<br>

### スプレッド構文（```...```）

#### ▼ スプレッド構文とは

ドット```3```個で記載する。

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

### continue

### ```for  in```

#### ▼ ```for  in```とは

配列/オブジェクト（連想配列）を順序を保たずに走査し、オブジェクトのプロパティ名や配列のキー名を取得する。



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
  "x": "foo",
  "y": "bar",
  "z": "baz"
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

<br>

#### ▼ continueとは

反復処理の現在のループをスキップし、次のループを開始する。



```php
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

#### ▼ ```forEach```関数を使用した代替法

反復処理のループを```continue```でスキップと同じ動作を、配列を処理する関数のコールバック関数で早期リターンで実現できる。

```continue```を使用するより、こちらの方が良い。



> ↪️ 参考：https://www.deep-rain.com/programming/javascript/778#continue

PHPにも、```forEach```関数と同様に配列に対してコールバック関数を適用する関数（```find```、```fliter```、```map```、```reduce```、```some```）があり、用途に合わせて使い分ける。



> ↪️ 参考：https://qiita.com/diescake/items/70d9b0cbd4e3d5cc6fce

補足としてPHPにも、```forEach```関数と同じような使い方をする```array_walk```関数がある。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/language/language_php_logic_iteration.html

```javascript
const array = ["foo", "bar", "baz"];

array.forEach((value, key) => {
    
    // キーが偶数の組をスキップする。
    if(!(key % 2 == 0)){
        return;
    }
    
    console.log(value);
})

// foo
// baz
```



