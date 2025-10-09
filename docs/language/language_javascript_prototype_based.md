---
title: 【IT技術の知見】プロトタイプ＠JavaScript
---

# プロトタイプ＠JavaScript

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 標準ビルトインオブジェクト

### 標準ビルトインオブジェクトとは

JavaScriptの実行環境にあらかじめ組み込まれたオブジェクト。

<br>

### Object

オブジェクトを作成するオブジェクト。

他の全ての標準ビルトインオブジェクトの継承元になっているため、標準ビルトインオブジェクトは、Objectが持つ振る舞いと状態を使用できる。

**＊実装例＊**

```javascript
// new演算子を使用してインスタンスを作成する。
const obj = new Object();
```

<br>

### Function

記入中...

<br>

### Array

#### ▼ `Array.prototype.entries`関数

配列からkeyとvalueを取得する。

**＊実装例＊**

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

#### ▼ `Array.prototype.map`関数

**＊実装例＊**

```javascript
// ここに実装例
```

#### ▼ `Array.prototype.filter`関数

**＊実装例＊**

```javascript
// ここに実装例
```

#### ▼ `Array.length`

要素数を出力する。

**＊実装例＊**

```javascript
const param = ["foo", "bar", "baz", "qux"];

console.log(param.length);

// 4
```

<br>

### JSON

#### ▼ `JSON.parse`関数

JavaScriptからJSONにシリアライズする。

**＊実装例＊**

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

#### ▼ `stringify`関数

JSONからJavaScriptにデシリアライズする。

**＊実装例＊**

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

## 02. オブジェクトの作成、初期化

### リテラル表記法

変数の宣言と代入を同時に定義する方法である。

オブジェクトをリテラル表記で作成する。

ローワーキャメルケースを使用する。

> - https://zenn.dev/hyung8/articles/16bfc28d110bef#%E3%83%AA%E3%83%86%E3%83%A9%E3%83%AB%E8%A1%A8%E8%A8%98%E6%B3%95%E3%81%A8%E3%81%AF%E4%BD%95%E3%81%A7%E3%81%99%E3%81%8B%EF%BC%9F

#### ▼ 非省略形

**＊実装例＊**

```javascript
// リテラル表記
const foo = {
  // 慣習的にアンダースコアでprivateを表す。
  _property: 0,

  alertValue: (value) => {
    alert(value);
  },

  setValue(value) {
    this._property = value;
  },

  getValue() {
    return this._property;
  },
};
```

#### ▼ 省略形

リテラル表記で、`methodA(): fucntion{}`とするところを、`methodA() {}`と記述できる。

```javascript
// リテラル表記
const foo = {

 ...

  alertValue(value) {
      alert(value);
  },

  ...
}
```

<br>

### コンストラクタ関数の使用

#### ▼ `Object`コンストラクタ関数

ローワーキャメルケースを使用する。

プロパティを作成するためには、値を格納する必要がある。

関数宣言あるいは関数式で記述する。

パスカルケース (大文字から始める記法) を使用する。

補足として、オブジェクトのプロパティ値として作成された関数を、関数と呼ぶ。

**＊実装例＊**

```javascript
const foo = new Object({
  // 慣習的にアンダースコアでprivateを表す。
  _property: 0,

  setValue(value) {
    this._property = value;
  },

  getValue() {
    return this._property;
  },
});
```

#### ▼ `Function`コンストラクタ関数

**＊実装例＊**

```javascript
const Foo = new Function();
```

ただし、公式からこのような記法は、非推奨とされている。

以下の関数宣言、関数式、アロー関数による関数式省略、の記法が推奨される。

特にアロー関数では、`this`が宣言されたオブジェクト自身を指すため、保守性が高くおすすめである。

**＊実装例＊**

```javascript
// 関数宣言
function Foo() {
  // 慣習的にアンダースコアでprivateを表す。
  _property = 0;

  // プロパティ値として宣言した関数を、関数という。
  this.setValue = (value) => {
    this._property = value;
  };

  this.getValue = () => {
    return this._property;
  };
}

// コール
const Foo = new Foo();
```

```javascript
// 関数式
const Foo = (value) => {
  // 慣習的にアンダースコアでprivateを表す。
  _property = 0;

  this.setValue = (value) => {
    this._property = value;
  };

  this.getValue = () => {
    return this._property;
  };
};

// アロー関数による関数式の省略記法
const Foo = (value) => {
  // 慣習的にアンダースコアでprivateを表す。
  _property = 0;

  this.setValue = (value) => {
    this._property = value;
  };

  this.getValue = () => {
    return this._property;
  };
};
```

リテラル表記と`Object`コンストラクタ関数による作成とは異なり、コンストラクタ関数によって宣言されたオブジェクトは、暗示的に`prototype`プロパティを持つ。

**＊実装例＊**

```javascript
// リテラル表記による作成
const object1 = {};

// Objectコンストラクタ関数による作成
const object2 = new Object({});

// ユーザー宣言Functionコンストラクタ関数による作成
const Object3 = () => {};

// 出力結果
console.log(
  object1.prototype, // undefined
  object2.prototype, // undefined
  object3.prototype, // Object3 {}
);
```

<br>

### 糖衣構文の`class`の使用

#### ▼ JavaScriptのクラスとは

ES6から、糖衣構文の`class`によって、オブジェクトを宣言できるようになった。

クラス宣言あるいはクラス式で記述する。

オブジェクトの作成時、`constructor`関数でオブジェクトの初期化を行う。

パスカルケース (大文字から始める記法) を使用する。

#### ▼ クラス宣言記法

**＊実装例＊**

```javascript
// named exportによる出力
export class Foo {
  // classでしか使用できない。
  // Setterの代わりにコンストラクタでイミュータブルを実現。
  // 状態の宣言と格納が同時に行われる。
  constructor(value) {
    this.property = value;
  }

  getValue() {
    return this.property;
  }
}
```

```javascript
// ファイルの読み出し
import {Foo} from "./foo.js";

// 作成、初期化
const foo = new Foo(1);

// 関数のコール
foo.getValue();
```

#### ▼ クラス式記法

```javascript
// named exportによる出力
export const Foo = class {
  // classでしか使用できない。
  // Setterの代わりにコンストラクタでイミュータブルを実現。
  // 状態の宣言と格納が同時に行われる。
  constructor(value) {
    this._property = value;
  }

  getValue() {
    return this._property;
  }
};
```

```javascript
// ファイルの読み出し
import {Foo} from "./foo.js";

// 作成、初期化
const foo = new Foo(1);

// 関数のコール
foo.getValue();
```

<br>

## 02-02. オブジェクトの操作

### プロトタイプチェーンによる継承

#### ▼ プロトタイプチェーンとは

オブジェクトが暗示的に持つ`prototype`プロパティに、別のオブジェクトのメンバを追加することによって、そのオブジェクトのプロトタイプを継承できる。

オブジェクトからプロパティや関数をコールした時、そのオブジェクトにこれらが存在しなければ、継承元まで辿る仕組みを『プロトタイプチェーン』という。

クラスベースのオブジェクト指向で使用されるクラスチェーンについては、別ノートを参照せよ。

#### ▼ `new Obejct`関数を使用した継承

**＊実装例＊**

```javascript
// 大元となるオブジェクトは個別ファイルで管理しておくのがベター。
// コンストラクタ関数の関数式による宣言。
const Foo = (value) => {
  // 慣習的にアンダースコアでprivateを表す。
  _property = 0;

  this.setValue = (value) => {
    this._property = value;
  };

  this.getValue = () => {
    return this._property;
  };
};
```

別クラスで、以下の様に継承する。

**＊実装例＊**

```javascript
// 継承元のオブジェクトのファイルを読み込むことも忘れずに。
// prototypeプロパティの継承先のオブジェクトを宣言。
const SubFoo = (subValue) => {
  // 慣習的にアンダースコアでprivateを表す。
  this.subProperty = subValue;

  this.setSubValue = (subValue) => {
    this.subProperty = subValue;
  };

  this.getSubValue = () => {
    return this.subProperty;
  };
};

// new Foo()を使用した継承。
SubFoo.prototype = new Foo();

// SubFooクラスにはgetValue()は無い。
// 継承元まで辿り、Examlpeクラスから関数がコールされる (プロトタイプチェーン) 。
const result = SubFoo.getValue();
console.log(result);
```

#### ▼ `Object.create`関数を使用した継承とメンバ追加

**＊実装例＊**

```javascript
// 継承元のオブジェクトのファイルを読み込むことも忘れずに。
// prototypeプロパティの継承先のオブジェクトを宣言。
const SubFoo = () => {
  // 慣習的にアンダースコアでprivateを表す。
  _property = 0;

  this.setSubValue = (subValue) => {
    this.subProperty = subValue;
  };

  this.getSubValue = () => {
    return this.subProperty;
  };
};

// Object.create()を使用した継承。
SubFoo.prototype = Object.create(Foo.prototype);

// SubFooクラスにはgetValue()は無い。
// 継承元まで辿り、Examlpeクラスから関数がコールされる (プロトタイプチェーン) 。
const result = SubFoo.getValue();
console.log(result);
```

また、`Object.create`関数を使用する場合、継承のみでなく、メンバを新しく追加もできる。

**＊実装例＊**

```javascript
// Object.create()による継承。
SubFoo.prototype = Object.create(Foo.prototype, {
  // 状態を定義
  subProperty: "テスト",

  // 関数を定義
  printSubValue: () => {
    return "これは" + this.subProperty + "です。";
  },
});

// SubFooクラスにはprintSubValue()が追加された。
const result = SubFoo.printSubValue();
console.log(result);
```

<br>

## 02-03. `this`の参照先

### 関数としてコールする場合

関数内の`this`は、fooオブジェクトを指す。

**＊実装例＊**

```javascript
const foo = {
  // 慣習的にアンダースコアでprivateを表す。
  _property: 0,

  setValue(value) {
    this._property = value;
  },

  getValue() {
    return this._property;
  },
};
```

```javascript
// 関数内のthisは、fooオブジェクトを指す。
foo.setValue(1);
foo.getValue(); // 1
```

<br>

### コンストラクタ関数としてコールする場合

#### ▼ 関数宣言と関数式によるコンストラクタ関数内の`this`の場合

コンストラクタ関数内のthisは、自身がコールされたオブジェクトを指す。

**＊実装例＊**

```javascript
// 一番外側はWindowオブジェクト
param = "global param";

// 関数宣言
function printParam() {
  console.log(this.param);
}

// オブジェクト1
const object1 = {
  param: "object1 param",
  func: printParam,
};

// オブジェクト2
const object2 = {
  param: "object2 param",
  func: printParam,
};
```

```javascript
// コンストラクタ関数内のthisの場合
// コンストラクタ関数内のthisは、自身がコールされたオブジェクトを指す。
// ここでは、object1とobject2

object1.printParam; // object1 param
object2.printParam; // object2 param
```

#### ▼ アロー関数によるコンストラクタ関数内の`this`の場合

アロー関数内の`this`の参照先には、十分な注意が必要である。

今まで、JavaScriptでは、`this`の参照先が文脈によって変わることに批判が集まっていた。

そこで、参照先が文脈によって変わらない機能が追加された。

`this`は、自身が宣言されたオブジェクトを指す。

**＊実装例＊**

```javascript
// 一番外側はWindowオブジェクト
param = "global param";

// アロー関数による省略記法
const printParam = () => {
  console.log(this.param);
};

// オブジェクト1
const object1 = {
  param: "object1 param",
  func: printParam,
};

// オブジェクト2
const object2 = {
  param: "object2 param",
  func: printParam,
};
```

```javascript
// アロー関数内のthisの場合
// thisは、自身が宣言されたオブジェクトを指す。
// ここでは、一番外側のWindowオブジェクトであり、object1とobject2ではない。
// 参照先は文脈によって変わらない。

object1.printParam; // global param
object2.printParam; // global param
```

また、アロー関数がコールバック関数の引数となっている場合は、記入中...
