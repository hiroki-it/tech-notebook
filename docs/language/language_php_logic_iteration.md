---
title: 【IT技術の知見】反復ロジック＠PHP
description: 反復ロジック＠PHPの知見を記録しています。
---

# 反復ロジック＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 反復対象のデータ

### 配列

#### ▼ 走査 (スキャン)

配列内の要素を順に調べていくことを『走査 (スキャン) 』という。

例えば、`foreach`は、配列内の全ての要素を走査する処理である。

下図では、連想配列が表現されている。

![配列の走査](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/配列の走査.png)

#### ▼ 内部ポインタと配列の関係

『内部ポインタ』とは、PHPの配列で、参照したい要素を位置で指定するためのカーソルのこと。

**＊実装例＊**

```php
<?php

$array = ['あ', 'い', 'う'];

// 内部ポインタが現在指定している要素を出力。
echo current($array); // あ

// 内部ポインタを1つ進め、要素を出力。
echo next($array); // い

// 内部ポインタを1つ戻し、要素を出力。
echo prev($array); // あ

// 内部ポインタを最後まで進め、要素を出力。
echo end($array); // う

// 内部ポインタを最初まで戻し、要素を出力
echo reset($array); // あ
```

<br>

## 02. foreach

### 文法

#### ▼ 基本

配列を走査する。

```php
<?php

$array = [1, 2, 3, 4];
foreach ($array as &$value) {
    $value = $value * 2;
    echo $value
}
```

#### ▼ 制御文

![流れ図_foreach文](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/流れ図_foreach文.png)

```php
<?php

$a = [1, -1, 2];
$sum = 0;

foreach ($a as $foo) {
    if ($foo > 0) {
        $sum += $foo;
    }
}
```

<br>

### 一次元配列の走査

#### ▼ 配列関数

複雑な走査を行うために、ビルトイン関数が用意されている。

> - https://www.php.net/manual/ja/ref.array.php

#### ▼ 配列の値へのアクセス

単に配列を作るのみでなく、要素にアクセスするためにも使われる。

```php
<?php

class Foo
{
     /**
     * オプションを調べて、文字列を返却します。


     */
    public function printOption(array $options)
    {
        $result = '何も設定されていません。

'

        // $options配列には、OptionA,B,Cエンティティのいずれかが格納されていると想定
        foreach ($options as $option) {

            if ($option->name() == 'オプションA') {
                $result = 'オプションAが設定されています。';
            }

            if ($option->name() == 'オプションB') {
                $result = 'オプションBが設定されています。';
            }

            if ($option->name() == 'オプションC') {
                $result = 'オプションCが設定されています。';
            }

            return $result;
        }

        return $result;
    }
}
```

#### ▼ 配列の各値を加算代入

```php
<?php

// 以下の引数が渡されると想定
// ($K, $A) = (4, [1, 2, 3, 4, 1, 1, 3])

function iteration($K, $A)
{
    $topesNumber = 0;

    $currentLength = 0;

    for ($i = 0; $i < count($A); $i++) {

        // 前回の走査に今回のものを加算する。
        $currentLength += $A[$i];

        if ($currentLength >= $K) {
            // 加算代入
            $topesNumber++;

            // 長さを元に戻す。
            $currentLength = 0;
        }
    }
}

```

#### ▼ 配列の値を固定

```php
<?php

// 以下の引数が渡されると想定
// ($M, $A) = (6, [3, 4, 5, 5, 2])

function iteration($M, $A) {

    $count = 0;

    foreach ($A as $key => $value) {

        // vを固定して、以降のvと比較する。
        for ($i = $key; $i < count($A); $i++) {
            if($value <= $A[$i]){
                // 加算代入
                $count++;
            }
        }
    }

    return $count;
}
```

<br>

### 多次元配列の走査

#### ▼ 二次元配列を一次元配列に変換

コールバック関数の使用が必要になる。

`call_user_func_array`メソッドの第一引数に、コールバック関数の`array_merge`メソッドの文字列を渡し、第二引数に二次元配列を渡す。

その結果、平坦になって一次元配列になる。

例えば、不要なインデックス (0) で入れ子になっている場合に役に立つ。

```php
<?php

$twoDimension = [
  [
    'date'  => '2015/11/1',
    'score' => 100,
    'color' => 'red',
  ],
  [
    'date'  => '2015/11/2',
    'score' => 75,
    'color' => 'blue',
  ]
];

$oneDimension = call_user_func_array(
  'array_merge',
  // 二次元配列
  $twoDimension
);
```

#### ▼ 多次元配列でキー名から値を取得

**＊実装例＊**

例えば、以下のような多次元配列があったとする。

配列のscoreキーから値を取り出し、一次元配列を作成する。

```php
<?php

$twoDimension = [
  [
    'date'  => '2015/11/1',
    'score' => 100,
    'color' => 'red',
  ],
  [
    'date'  => '2015/11/2',
    'score' => 75,
    'color' => 'blue',
  ]
];

// この配列のscoreキーから値を取り出し、一次元配列を作成する。
$oneDimension = array_column($twoDimension, 'score');

// Array
// (
//     [0] => 100
//     [1] => 75
// )
```

<br>

## 03. while

### 文法

#### ▼ 基本

配列の走査を含む反復処理を行う。

ただし、配列の走査は、`while`ではなく`foreach`を使用する。

また、`for`とは異なり、反復回数が決まっていない場合に使用する。

```php
<?php

$count = 0
// 反復回数が決まっていないため、満たせたらbreakで停止する。
while(true) {

    if($count = 10){
        break;
    }

    $count++
}

echo $count
```

#### ▼ 制御文

![流れ図_while文](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/流れ図_while文.png)

```php
<?php

$a = [1, -1, 2];
$sum = 0;

$i = 0;
while (true) {

    // 全て走査したら停止
    if($count == count($a)) {
        break;
    }

    $foo = $a[$i];

    if($foo > 0) {
        $sum += $foo;
    }

    // 代入加算
    $count ++;
}
```

<br>

### 無限ループ

#### ▼ 無限ループとは

反復処理では、何らかの状態になった時に反復処理を終えなければならない。

しかし、終えられないと、無限ループが発生してしまう。

<br>

## 04. for

### 文法

#### ▼ 基本

配列の走査を含む反復処理を行う。

ただし、配列の走査は、`for`ではなく`foreach`を使用する。

また、`while`とは異なり、反復回数が決まっている場合に使用する。

```php
<?php

// 10回反復することが決まっている。
for($i = 1; $i <= 10; $i++){
    $count++
}

echo $count
```

#### ▼ 制御文

![流れ図_for文](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/流れ図_for文.png)

```php
<?php

$a = [1, -1, 2];
$sum = 0;

for ($i = 0; $i < 2; $i++) {
    $foo = $a[$i];
    if ($foo > 0) {
        $sum += $foo;
    }
}

echo $sum;

// 1
```

<br>

## 05. 反復回数の変更

### continue

#### ▼ continueとは

反復処理の現在のループをスキップし、次のループを開始する。

```php
<?php

$array = [1, 2, 3, 4, 5];

foreach ($array as $key => $value) {

    // キーが偶数の組をスキップする。
    if (!($key % 2 == 0)) {
        continue;
    }

    echo $value . 'は奇数です' . "\n";
}

// 1は奇数です
// 3は奇数です
// 5は奇数です
```

#### ▼ array_walkを使用した代替法

反復処理のループを`continue`でスキップと同じ動作を、配列を処理する関数のコールバック関数で早期リターンで実現できる。

`continue`を使用するより、こちらの方が良い。

```php
<?php

$array = [1, 2, 3, 4, 5];

array_walk($array, function ($value, $key) {

    // キーが偶数の組をスキップする。
    if (!($key % 2 == 0)) {
        return; // continueと同じ動作を早期リターンで実現する。
    }

    echo $value . 'は奇数です' . "\n";
});

// 1は奇数です
// 3は奇数です
// 5は奇数です
```

<br>

### break

#### ▼ breakとは

反復処理の現在のループを停止し、以降のループも実行しない。

```php
<?php

$array = [1, 2, 3, 4, '', 5];

foreach ($array as $value) {

    // 空の値で繰り返しを停止する。
    if (empty($value)) {
        break;
    }

    echo $value;
}
```

<br>
