---
title: 【知見を記録するサイト】メソッド/データ@JavaScript
---

# メソッド/データ@JavaScript

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 関数

### 関数オブジェクト

#### ・関数オブジェクトとは

オブジェクトでもあり，関数である．

#### ・リテラル表記による関数オブジェクト

```javascript
// 定義
const object = {
  foo: "bar",
  age: 42,
  baz: {myProp: 12},
}
```

#### ・コンストラクタ関数

関数宣言方式の```Function```コンストラクタを用いて，オブジェクトを定義する．

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

#### ・function命令とは

オブジェクトではない関数である．

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

#### ・名前がドルマークのもの

JavaScriptでよく見かけるドルマーク．これは，関数の名前としてドルマークを用いているだけである．

**＊実装例＊**

```javascript
// 定義
function $(){
    return "foo";
}
```

jQueryでは，ライブラリの読み込み宣言時に，『Jquery』という名前の代わりにドルマークを用いる仕様になってる．これと混乱しないように注意する．

**＊実装例＊**

```javascript
// jQuery.get() と同じ
$.get()
```

#### ・コールバック関数

```javascript
const asyncFunc = (param, callback) => {
  setTimeout(() => {
    
    // getDataメソッドは，数値を渡すとdataを取得してくれると仮定します．
    const  data = getData(param);
    const  err = data.getError();
      
    // 第二引数のコールバック関数は，getDataメソッドとgetErrorメソッドの後に実行される．
    callback(err, data);
  }, 0);
}

const test = 1

// asyFuncメソッドの第一引数が，第二引数で設定したコールバック関数に渡される．
// 渡されたコールバック関数は，getDataメソッドとgetErrorメソッドの後に実行されるため，errやdataを受け取れる
asyncFunc(test, (err, data) => {
  if (err) {
      throw err;
  }
    console.log(data);
});
```

#### ・ファイル外で読み込む

関数の前で```export```を宣言する．

**＊実装例＊**

関数の定義と```export```宣言を同時に行う．

```javascript
export function foo(){
    return "foo";
}
```

あるいは，別々に行う．

```javascript
const foo = () => {
    return "foo";
}

export default foo
```



<br>

## 02. データ型

### undefined，null

#### ・undefined

データを代入しない時に適用されるデータ型である．

**＊実装例＊**


```javascript
// 変数b: 初期化されていない（値が代入されていない）
const b;

// 変数bの出力
console.log(b);  // undefied
```


#### ・null

nullは，undefinedとは異なり，意図して代入しなければ適用されないデータ型である．

**＊実装例＊**

```javascript
// 変数a: 意図をもってnullを入れている
const a = null;

console.log(a); // null
```

#### ・undefinedの返却

undefinedを返却する場合，```return```のみを記述する．

**＊実装例＊**

```javascript
function hoge(){
    return; // 空の『return文』．空なので『undefined』を返す．
}

const x = hoge(); // 変数『x』には関数『hoge』から返ってきた『undefined』が代入される．
 
console.log(x); // 『undefined』が出力される．
```

<br>

## 03. 変数

### 変数の種類

#### ・一覧表

| 項目                        | var          | let              | const            |
| :-------------------------- | :----------- | :--------------- | ---------------- |
| 再宣言                      | 可能         | 不可能           | 不可能           |
| 再代入                      | 可能         | 可能             | 不可能           |
| 初期化（```undefined```化） | 可能         | 可能             | 不可能           |
| スコープ                    | 関数スコープ | ブロックスコープ | ブロックスコープ |

#### ・```const```

基本的には，宣言に```const```を用いる

```javascript
if (true) {
  // ブロック外からアクセス不可
  const x = "foo";
    
  // 再宣言不可
  const x = "bar"; // ERROR
  
  // 再代入不可
  x = "baz"; // ERROR
}

// ブロック内のconstにアクセス不可
console.log(x); // ERROR
```

#### ・ ```let```

繰り返し処理で再代入が必要であれば，```const```ではなく```let```を用いる．


```javascript
if (true) {
  // ブロック外からアクセス不可
  let x = "foo";
    
  // 再宣言不可
  let x = "bar"; // ERROR
  
  // 再代入可能
  x = "baz";
}

// ブロック内のletにアクセス不可
console.log(x); // ERROR
```

また，```try-catch```構文では変数への代入が保証されていないため，```let```を用いて，あらかじめ初期化しておく必要がある．

```js
const asyncFunc = async () => {
    
    // 初期化するとundefinedになる．
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

#### ・ ```var```


```javascript
if (true) {
  // ブロック外からアクセス可
  var x = "hoge";
    
  // 再宣言
  var x = "fuga";
    
  // 再代入可能
  x = "fuga";
}

// ブロック内のvarにアクセス可能
console.log(x); // fuga
```

<br>

### 変数の巻き上げ

#### ・巻き上げの対策

意図しない挙動を防ぐため，javascriptで，変数の宣言と代入は，スコープの最初に行う．

#### ・```var```

確認のため```console.log```メソッドを実行した場合，```x```を宣言していないため，『x is not defined 』エラーになりそうである．しかし実際は，宣言が既に済んでおり，```x```に値が代入されていないことを示す『undefined』となる．

```javascript
console.log(x); // undefined

var x = "hoge"; // 宣言と代入
```

これは，スコープの範囲内で宣言と代入を実行した変数で，宣言処理がスコープの最初に行ったことになるという仕様のためである．

```javascript
// var x 宣言処理したことになる

console.log(x); // undefined

var x = "hoge"; // 宣言と代入により，実際は宣言処理を実装していなくとも，行なったことになる．
```

#### ・```let```,```const```

宣言に```let```，```const```を用いた場合，巻き上げは起こらない．

```javascript
console.log(x); // x is not defined

let x = "hoge";
```

<br>

### 分割代入

#### ・配列

配列の値を，任意の名前の変数に代入する．

**＊実装例＊**

```javascript
const array = [1, 2, 3];

// fooに1，barに2，bazに3，を代入
const [foo, bar, baz] = array;

console.log(foo); // 1
console.log(bar); // 2
console.log(baz); // 3
```

#### ・オブジェクト

オブジェクトの値を，プロパティ名と同じ名前の変数に代入する．

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
console.log(bar); // 3
```

<br>

## 04. 反復

### ```for  of```

#### ・```for  of```とは

順序を保ったまま配列を走査し，値を取得する．オブジェクトに対して```entires```メソッドを使用し，一度配列に変換すれば，オブジェクトでも```for  of```を使用できる．```for  in```を用いるより，こちらを用いた方が良い．

#### ・配列の場合

```javascript
const  array = ["foo", "bar", "baz"];

for (const value of array) {
  console.log(value);
}

// foo
// bar
// baz
```

配列の```entires```メソッドを用いれば，インデックス番号を取得することもできる．

```javascript
const  array = ["foo", "bar", "baz"];

for (const [key, value] of array.entries()) {
  console.log(key);
}

// 0
// 1
// 2
```

#### ・オブジェクトの場合

オブジェクトに対して```entires```メソッドを実行し，一度連想配列に変換すれば，オブジェクトでも```for ... of```を使用できる．

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

#### ・スプレッド構文とは

ドット3つで記載する．順序を保ったまま配列を走査し，値を取得する．オブジェクトは捜査できない．

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

#### ・```for  in```とは

配列/オブジェクト（連想配列）を順序を保たずに走査し，オブジェクトのプロパティ名や配列のキー名を取得する．

#### ・配列の場合

```javascript
const array = ["foo", "bar", "baz"];

for (const key in array) {
  console.log(key);
}

// 0
// 1
// 2
```

#### ・オブジェクトの場合

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

#### ・continueとは

反復処理の現在のループをスキップし，次のループを開始する．

```php
const array = ["foo", "bar", "baz"];

for (const [key, value] of array.entries()) {

    // キー名が偶数の組をスキップする．
    if(!(key % 2 == 0)){
        continue;
    }

    console.log(value);
}

// foo
// baz
```

#### ・```forEach```関数を用いた代替法

反復処理のループを```continue```でスキップと同じ動作を，配列を扱う関数のコールバック関数で早期リターンで実現できる．```continue```を用いるより，こちらの方が良い．

参考：https://www.deep-rain.com/programming/javascript/778#continue

PHPにも，```forEach```関数と同じように配列に対してコールバック関数を適用する関数（```find```，```fliter```，```map```，```reduce```，```some```）があり，用途に合わせて使い分ける．

参考：https://qiita.com/diescake/items/70d9b0cbd4e3d5cc6fce

ちなみにPHPにも，```forEach```関数と同じような使い方をする```array_walk```関数がある．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_php_logic_iteration.html

```javascript
const array = ["foo", "bar", "baz"];

array.forEach((value, key) => {
    
    // キーが偶数の組をスキップする．
    if(!(key % 2 == 0)){
        return;
    }
    
    console.log(value);
})

// foo
// baz
```



