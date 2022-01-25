---
title: 【知見を記録するサイト】JSON＠アプリケーション連携
---

# JSON＠アプリケーション連携

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. データ記述言語

### データ記述言語の種類

#### ・JSON：JavaScript Object Notation

一番外側を波括弧で囲う．

```json
{
  "account": 200,
  "fruit": [
    "banana",
    "apple"
  ]
}
```

#### ・YAML：YAML Ain"t a Markup Language

```yaml
account: 200  
fruit:
  - "banana"
  - "apple"
```

#### ・マークアップ言語

詳しくは以下のノートを参考にせよ．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_object_oriented_language_js_browser_rendering.html

#### ・CSV：Comma Separated Vector

データ解析の入力ファイルとしてよく用いるやつ．

<br>

## 02-01. JS型オブジェクト，JSON，PHP型オブジェクト

### JS型オブジェクト

#### ・定義方法

キーはクオーテーションで囲う必要が無い．

**＊実装例＊**

```javascript
const object = {
  "account": 200,
  "fruit": [
    "banana",
    "apple"
  ]
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

### JSON

#### ・定義方法

キーを，シングルクオーテーションではなく，クオーテーションで囲う必要がある．

**＊実装例＊**

```javascript
const json = {
  "account": 200,
  "fruit": [
    "banana",
    "apple"
  ]
};
```

#### ・キーと値の変更方法

**＊実装例＊**

```javascript
// どんなデータを含むJSONなのかわかりやすい方法
const json = {
  "age": null,
  "name": null,
  "tel": null
}

json.age = 30;
json.name = "taro";
json.tel = "090-0123-4567";
```

**＊実装例＊**

```javascript
const json = {}

// areaというキーの値を追加
json.prefecture = "Tokyo";

// もしくは，
json["prefecture"] = "Tokyo";

// 以下は．undefined になる．二段階の定義はできない．
//// json.prefecture.area = "Shibuya";
```

**＊実装例＊**

```javascript
const json = {
  "age": 30,
  "name": "taro",
  "tel": "090-0123-4567"
}

// areaというキーの値を追加
json.prefecture = "Tokyo";

// もしくは，
json["prefecture"] = "Tokyo";
```

#### ・キーの並び順

キーはアルファベット順に並べると良い．以下のサイトで並び替えられる．

参考：https://r37r0m0d3l.github.io/json_sort/

<br>

### PHP型オブジェクト

#### ・定義方法

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

## 02-02. 相互パース（シリアライズ＋デシリアライズ）

### シリアライズ，デシリアライズとは

#### ・バックエンドとフロントエンド間

データ送信のためにオブジェクト（JS型，PHP型）をJSONに変換する処理はシリアライズである．一方で，送信のためにJSONをオブジェクト（JS型，PHP型）に変換する処理はデシリアライズである．

![シリアライズとデシリアライズ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/シリアライズとデシリアライズ.png)

#### ・バックエンドとデータベース間

データ送信のためにオブジェクト（PHP型）をJSONに変換する処理はシリアライズである．一方で，送信のためにJSONをオブジェクト（PHP型）に変換する処理はデシリアライズである．

<br>

### フロントエンド

#### ・シリアライズ：JS型からJSON

JS型オブジェクトからJSONへの変換には，```JSON.stringfy```メソッドを用いる．

**＊実装例＊**

```javascript
const object = {
  fruit: ["banana", "apple"],
  account: 200
};

// シリアライズ
const json = JSON.stringify(object);

console.log(json);
// {"fruit":["banana","apple"],"account":200}
```

#### ・デシリアライズ：JSONからJS型

JSONからJS型オブジェクトへの変換には，```JSON.parse```メソッドを用いる．レスポンスされたJSONはエスケープされていることに注意する．

**＊実装例＊**

```javascript
const escapedJson = "{\"fruit\":[\"banana\",\"apple\"],\"account\":200}"

console.log(escapedJson); // {"fruit":["banana","apple"],"account":200}

// デシリアライズ
const object = JSON.parse(escapedJson);

console.log(object);
// { fruit: [ 'banana', 'apple' ], account: 200 }
```

#### ・相互パースメソッドを持つクラス

**＊実装例＊**

シリアライズとデシリアライズを行うクラスを以下に示す．

```javascript
class StaffParser {

  // デシリアライズによるJS型データを自身に設定
  constructor(properties) {
    this.id   = properties.id;
    this.name = properties.name;
  }


  //-- デシリアライズ（JSONからJavaScriptへ） --//
  static deserializeStaff(json) {

    // JS型オブジェクトの定義方法
    return new StaffParser({
      id: json.id,
      name: json.name
    });
  }


  //-- シリアライズ（JavaScriptからJSONへ） --//
  static serializeCriteria(criteria) {

    // JSONの定義
    const json = {
      "id" : null,
      "name" : null
    }

    // ID
    if (criteria.id) {
      // JSONが生成される．
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

### バックエンド

#### ・デシリアライズ：JSONからPHP型

JSONからPHP型オブジェクトの変換には．```json_decode```メソッドを用いる．第二引数が```false```の場合，object形式オブジェクトに変換する．リクエストで送信するJSONはエスケープする必要があることに注意する．

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

第二引数が```true```の場合，連想配列形式に変換する．

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

#### ・シリアライズ：PHP型からJSON

```php
<?php

$object = '{"fruit":["banana","apple"],"account":200}';

// JSONに変換
$json = json_encode($object);

var_dump($json);
// ""{\"fruit\":[\"banana\",\"apple\"],\"account\":200}""
```

<br>

## 03. JSONのクエリ言語

### クエリ言語の種類

#### ・JMESPath

**＊実装例＊**

```javascript
// ここに実装例
```

