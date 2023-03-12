---
title: 【IT技術の知見】JSON：JavaScript Object Notation＠データ記述型言語
description: JSON：JavaScript Object Notation＠データ記述型言語の知見を記録しています。
---

# JSON：JavaScript Object Notation＠データ記述型言語

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 文法

### 配列

```yaml
{"account": 200, "fruit": ["banana", "apple"]}
```

<br>

### オブジェクト

```yaml
{"account": 200, "fruit": {"banana": "BANANA", "apple": "APPLE"}}
```

<br>

### コメントアウト

JSONにはコメントアウトを定義できない。

代わりに、`_comment`キーを定義する。

アプリ側で、JSONの`_comment`キーを無視するような処理を実装する。

```yaml
{
  "_comment": "金額",
  "account": 200,
  "_comment": "フルーツ",
  "fruit": {
    "banana": "BANANA",
    "apple": "APPLE"
  }
}
```

> ↪️ 参考：https://stackoverflow.com/a/244858

<br>

## 02. 相互パース (シリアライズ + デシリアライズ)

### バックエンドとフロントエンド間

フロントエンドにJavaScript、バックエンドにPHPを使用しているとする。

データ送信のためにオブジェクト (JS型、PHP型) をJSONに変換する処理はシリアライズである。

一方で、送信のためにJSONをオブジェクト (JS型、PHP型) に変換する処理はデシリアライズである。

![シリアライズとデシリアライズ](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/シリアライズとデシリアライズ.png)

<br>

### バックエンドとDB間

バックエンドにPHPを使用しているとする。

データ格納のためにオブジェクト (PHP型) をDBレコードに変換する処理はシリアライズである。

一方で、データ取得のためにJSONをオブジェクト (PHP型) に変換する処理はデシリアライズである。

<br>

## 02-02. オブジェクトデータ

### JSON

#### ▼ 定義方法

キーを、シングルクオーテーションではなく、クオーテーションで囲う必要がある。

**＊実装例＊**

```javascript
const json = {
  account: 200,
  fruit: ["banana", "apple"],
};
```

#### ▼ キーと値の変更方法

**＊実装例＊**

```javascript
// どんなデータを含むJSONなのかわかりやすい方法
const json = {
  age: null,
  name: null,
  tel: null,
};

json.age = 30;
json.name = "taro";
json.tel = "090-0123-4567";
```

**＊実装例＊**

```javascript
const json = {};

// areaというキーの値を追加
json.prefecture = "Tokyo";

// もしくは、
json["prefecture"] = "Tokyo";

// 以下は。undefined になる。二段階の定義はできない。
//// json.prefecture.area = "Shibuya";
```

**＊実装例＊**

```javascript
const json = {
  age: 30,
  name: "taro",
  tel: "090-0123-4567",
};

// areaというキーの値を追加
json.prefecture = "Tokyo";

// もしくは、
json["prefecture"] = "Tokyo";
```

#### ▼ キーの並び順

キーはアルファベット順に並べると良い。

以下のサイトで並び替えられる。

> ↪️ 参考：https://r37r0m0d3l.github.io/json_sort/

<br>

### フロントエンドの場合

#### ▼ 定義方法

キーはクオーテーションで囲う必要が無い。

**＊実装例＊**

```javascript
const object = {
  account: 200,
  fruit: ["banana", "apple"],
};
```

```javascript
class Foo {
  constructor(fruit, account) {
    this.fruit = fruit;
    this.account = account;
  }
}
```

<br>

### バックエンドの場合

#### ▼ 定義方法

**＊実装例＊**

```php
<?php

class Foo
{
    private $fruit;
    private $account;

    public function __construct($fruit, $account)
    {
        $this->fruit = $fruit;
        $this->account = $account;
    }
}
```

<br>

## 02-03. オブジェクトデータの変換

### フロントエンドの場合

#### ▼ シリアライズ：JS型からJSON

JS型オブジェクトからJSONへの変換には、`JSON.stringfy`メソッドを使用する。

**＊実装例＊**

```javascript
const object = {
  fruit: ["banana", "apple"],
  account: 200,
};

// シリアライズ
const json = JSON.stringify(object);

console.log(json);
// {"fruit":["banana","apple"],"account":200}
```

#### ▼ デシリアライズ：JSONからJS型

JSONからJS型オブジェクトへの変換には、`JSON.parse`メソッドを使用する。

レスポンスされたJSONはエスケープされていることに注意する。

**＊実装例＊**

```javascript
const escapedJson = '{"fruit":["banana","apple"],"account":200}';

console.log(escapedJson); // {"fruit":["banana","apple"],"account":200}

// デシリアライズ
const object = JSON.parse(escapedJson);

console.log(object);
// { fruit: [ 'banana', 'apple' ], account: 200 }
```

#### ▼ 相互パースメソッドを持つクラス

**＊実装例＊**

シリアライズとデシリアライズを行うクラスを以下に示す。

```javascript
class StaffParser {
  // デシリアライズによるJS型データを自身に設定
  constructor(properties) {
    this.id = properties.id;
    this.name = properties.name;
  }

  //-- デシリアライズ (JSONからJavaScriptへ)  --//
  static deserializeStaff(json) {
    // JS型オブジェクトの定義方法
    return new StaffParser({
      id: json.id,
      name: json.name,
    });
  }

  //-- シリアライズ (JavaScriptからJSONへ)  --//
  static serializeCriteria(criteria) {
    // JSONの定義
    const json = {
      id: null,
      name: null,
    };

    // ID
    if (criteria.id) {
      // JSONが作成される。
      json.id = _.trim(criteria.id);
    }

    // 氏名
    if (criteria.name) {
      json.name = _.trim(criteria.name);
    }
  }
}
```

<br>

### バックエンドの場合

#### ▼ デシリアライズ：JSONからPHP型

JSONからPHP型オブジェクトの変換には。

`json_decode`メソッドを使用する。

第二引数が`false`の場合、object形式オブジェクトに変換する。

リクエストで送信するJSONはエスケープする必要があることに注意する。

```php
<?php

// リクエストで取得したJSON
$escapedJson = '{\"fruit\":[\"banana\",\"apple\"],\"account\":200}';

// object形式オブジェクトに変換
$object = json_decode($escapedJson, false);

var_dump($object);
//  object(stdClass)#1 (2) {
//    ["fruit"]=>
//    array(2) {
//      [0]=>
//      string(9) "banana"
//      [1]=>
//      string(9) "apple"
//    }
//    ["account"]=>
//    int(200)
//  }
```

第二引数が`true`の場合、連想配列形式に変換する。

```php
<?php

// リクエストで取得したJSON
$escapedJson = '{\"fruit\":[\"banana\",\"apple\"],\"account\":200}';

// 連想配列形式オブジェクトに変換
$array = json_decode($escapedJson, true);

var_dump($array);
//  array(2) {
//    ["fruit"]=>
//    array(2) {
//      [0]=>
//      string(9) "banana"
//      [1]=>
//      string(9) "apple"
//    }
//    ["account"]=>
//    int(200)
//  }
```

#### ▼ シリアライズ：PHP型からJSON

```php
<?php

$object = '{"fruit":["banana","apple"],"account":200}';

// JSONに変換
$json = json_encode($object);

var_dump($json);
// ""{\"fruit\":[\"banana\",\"apple\"],\"account\":200}""
```

<br>
