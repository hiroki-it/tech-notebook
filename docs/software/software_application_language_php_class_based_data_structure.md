---
title: 【IT技術の知見】データ構造＠PHP
---

# データ構造＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/index.html

<br>

## 01. データ構造の実装方法

ハードウェアが処理を行う時に、データの集合を効率的に扱うためのデータ格納形式をデータ構造という。データ構造のPHPによる実装方法を以下に示す。

### 配列型

同じデータ型のデータを並べたデータ格納様式のこと。

#### ▼ インデックス配列

番号キーごとに値が格納された配列型のこと。

```bash
Array
(
  [0] => A
  [1] => B
  [2] => C
)
```

#### ▼ 多次元配列

配列の中に配列を持つ配列型のこと。配列の入れ子構造が２段の場合、『二次元配列』と呼ぶ。

```bash
( 
  [0] => Array
         (
            [0] => リンゴ
            [1] => イチゴ
            [2] => トマト
         )

  [1] => Array
         (
            [0] => メロン
            [1] => キュウリ
            [2] => ピーマン
         )
)
```

#### ▼ 連想配列

キー名（赤、緑、黄、果物、野菜）ごとに値が格納された配列型のこと。下の例は、二次元配列かつ連想配列である。

```bash
Array
(
    [赤] => Array
        (
            [果物] => リンゴ
            [果物] => イチゴ
            [野菜] => トマト
        )

    [緑] => Array
        (
            [果物] => メロン
            [野菜] => キュウリ
            [野菜] => ピーマン
        )
)
```

<br>

### LinkedList型

PHPで使用することは個人的にはないデータ格納様式。詳しくは、JavaにおけるLinkedList型を参考にせよ。

#### ▼ PHPの```list```メソッドとは何なのか

PHPの```list```メソッドは、List型とは意味合いが異なる。配列の個々の要素を変数に格納したい場合、List型を使わなければ、冗長ではあるが、以下の様に実装する必要がある。

**＊実装例＊**

```php
<?php
    
$array = array("あ", "い", "う");
$a = $array[0];
$i = $array[1];
$u = $array[2];

echo $a.$i.$u; // あいう
```

しかし、以下の様に、```list```メソッドを使用することによって、複数の変数への格納を一行で実装できる。

**＊実装例＊**

```php
<?php
    
list($a, $i, $u) = array("あ", "い", "う");

echo $a.$i.$u; // あいう
```

<br>

### Queue型

![Queue1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Queue1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

 

![Queue2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Queue2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

 

![Queue3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Queue3.gif)

PHPでは、```array_push```メソッドと```array_shift```メソッドを組み合わせることにより、実装できる。

**＊実装例＊**

```php
<?php
$array = array("Blue", "Green");

// 引数を、配列の最後に、要素として追加する。
array_push($array, "Red");
print_r($array);

// 出力結果

//	Array
//	(
//		[0] => Blue
//		[1] => Green
//		[2] => Red
//	)

// 配列の最初の要素を取り出す。
$theFirst= array_shift($array);
print_r($array);

// 出力結果

//	Array
//	(
//    [0] => Green
//    [1] => Red
//	)

// 取り出された値の確認
echo $theFirst; // Blue
```

#### ▼ メッセージQueue

送信側の好きなタイミングでファイル（メッセージ）をメッセージQueueに追加できる。また、受信側の好きなタイミングでメッセージを取り出せる。

![メッセージキュー](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メッセージキュー.jpg)

<br>

### Stack型

PHPでは、```array_push```メソッドと```array_pop```メソッドで実装可能。

![Stack1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Stack1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

 

![Stack2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Stack2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

 

![Stack3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Stack3.gif)

<br>

### Tree型

#### ▼ 二分探索木

  各ノードにデータが格納されている。

![二分探索木](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索木1.gif)

#### ▼ ヒープ

  Priority Queueを実現する時に使用される。各ノードにデータが格納されている。

![ヒープ1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ヒープ1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ヒープ1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ヒープ2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ヒープ2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ヒープ3.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![. ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ヒープ4.gif)

<br>

## 01-02. Javaにおけるデータ構造の実装方法

データ構造のJavaによる実装方法を以下に示す。

### 配列型

#### ▼ ArrayList

ArrayListクラスによって実装される配列型。PHPのインデックス配列に相当する。

#### ▼ HashMap

HashMapクラスによって実装される配列型。PHPの連想配列に相当する。

<br>

### LinkedList型

値をポインタによって順序通り並べたデータ格納形式のこと。

#### ▼ 単方向List

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p555-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p555-1.gif)

#### ▼ 双方向List

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p555-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p555-2.gif)

#### ▼ 循環List

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p555-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p555-3.gif)

<br>

### Queue型

<br>

### Stack型

<br>

### Tree型

<br>

## 02. プリミティブデータ型

### プリミティブ型

#### ▼ プリミティブ型とは

スカラー型、複合型、その他、に分類できる。以下のリンクを参考にせよ。

> ℹ️ 参考：https://www.php.net/manual/ja/language.types.intro.php

<br>

### スカラー型

#### ▼ bool

|    T/F     | データの種類 | 説明                     |
| :---------: | ------------ | ------------------------ |
| ```FALSE``` | ```$var =``` | 何も格納されていない変数 |
|             | ```False```  | 文字としてのFalse        |
|             | ```0```      | 数字、文字列             |
|             | ```""```     | 空文字                   |
|             | array()      | 要素数が```0```個の配列        |
|             | NULL         | NULL値                   |
| ```TRUE```  | 上記以外の値 |                          |


#### ▼ float

#### ▼ int

#### ▼ string

<br>

### 複合型

#### ▼ array

#### ▼ callable

#### ▼ iterable

#### ▼ object

```php
<?php

class A 
{
    private $name = "Hiroki";
    
    public function HelloWorld()
    {
        return sprintf(
            "%s, %s",
            $this->name,
            "Hello World!"
            );
    }
}

$a = new A;

var_dump($a);

// object(A)#1 (1) {
//  ["name":"A":private]=>
//  string(6) "Hiroki"
//}

print_r($a);

// A Object
// (
//     [name:A:private] => Hiroki
// )
```

<br>

### その他のデータ型

#### ▼ date

厳密にはデータ型ではないが、便宜上、データ型とする。タイムスタンプとは、協定世界時(UTC)を基準にした1970年1月1日の0時0分0秒からの経過秒数を表したもの。

| フォーマット         | 実装方法            | 備考                                                         |
| -------------------- | ------------------- | ------------------------------------------------------------ |
| 日付                 | 2019-07-07          | 区切り記号なし、ドット、スラッシュなども可能                 |
| 時間                 | 19:07:07            | 区切り記号なし、も可能                                       |
| 日付と時間           | 2019-07-07 19:07:07 | 同上                                                         |
| タイムスタンプ（秒） | 1562494027          | 1970年1月1日の0時0分0秒から2019-07-07 19:07:07 までの経過秒数 |

#### ▼ null

#### ▼ resource

<br>

### 02-02. データ型の判定/変換

### 判定関数

#### ▼ ```is_scalar```

スカラー型（bool、float、int、string）を判定する。



<br>

### キャスト演算子

#### ▼ ```(string)```

```php
<?php
    
$var = 10; // $varはinteger型。

// キャスト演算子でデータ型を変換
$var = (string) $var; // $varはstring型
```

#### ▼ ```(int)```

```php
<?php
    
$var = 1;

// integer型
$var = (int) $var;

// 1
```

#### ▼ ```(bool)```

```php
<?php
    
$var = 1;

// boolean型
$var = (bool) $var;

// true
```

#### ▼ ```(float)```

```php
<?php
    
$var = "1.0";

// Float型
$var = (float) $var;

// 1.0
```

#### ▼ ```(array)```

```php
<?php
    
// 配列型
$var = (array) $var;
```

#### ▼ ```(object)```

```php
<?php
    
// Object型
$var = (object) $var;
```
