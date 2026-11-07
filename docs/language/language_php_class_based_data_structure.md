---
title: 【IT技術の知見】データ型＠PHP
description: データ型＠PHPの知見を記録しています。
---

# データ型＠PHP

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. プリミティブデータ型

### プリミティブ型

#### ▼ プリミティブ型とは

スカラー型、複合型、その他、に分類できる。

以下のリンクを参考にせよ。

> - [PHP: はじめに - Manual](https://www.php.net/manual/ja/language.types.intro.php)

<br>

### スカラー型

#### ▼ bool

<table>
  <thead>
    <tr>
      <th style="text-align:center">T/F</th>
      <th>データの種類</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:center" rowspan="6"><code>FALSE</code></td>
      <td><code>$var =</code></td>
      <td>何も格納されていない変数</td>
    </tr>
    <tr>
      <td><code>False</code></td>
      <td>文字としての False</td>
    </tr>
    <tr>
      <td><code>0</code></td>
      <td>数字、文字列</td>
    </tr>
    <tr>
      <td><code>&quot;&quot;</code></td>
      <td>空文字</td>
    </tr>
    <tr>
      <td>array()</td>
      <td>要素数が <code>0</code> 個の配列</td>
    </tr>
    <tr>
      <td>NULL</td>
      <td>NULL 値</td>
    </tr>
    <tr>
      <td style="text-align:center"><code>TRUE</code></td>
      <td>上記以外の値</td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ float

#### ▼ int

#### ▼ string

<br>

### 複合型

#### ▼ array

#### ▼ callable

#### ▼ iterable

#### ▼ object

```injectablephp
<?php

class A
{
    private string $name = "Hiroki";

    public function HelloWorld(): string
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

厳密にはデータ型ではないが、便宜上、データ型とする。

タイムスタンプとは、協定世界時(UTC)を基準にした 1970 年 1 月 1 日の 0 時 0 分 0 秒からの経過秒数を表したもの。

<table>
  <thead>
    <tr>
      <th>フォーマット</th>
      <th>実装方法</th>
      <th>備考</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>日付</td>
      <td>2019-07-07</td>
      <td>区切り記号なし、ドット、スラッシュなども可能</td>
    </tr>
    <tr>
      <td>時間</td>
      <td>19:07:07</td>
      <td rowspan="2">区切り記号なし、も可能</td>
    </tr>
    <tr>
      <td>日付と時間</td>
      <td>2019-07-07 19:07:07</td>
    </tr>
    <tr>
      <td>タイムスタンプ (秒)</td>
      <td>1562494027</td>
      <td>1970 年 1 月 1 日の 0 時 0 分 0 秒から 2019-07-07 19:07:07 までの経過秒数</td>
    </tr>
  </tbody>
</table>

#### ▼ null

#### ▼ resource

<br>

## 02. データ型の判定/変換

### 判定関数

#### ▼ `is_scalar()`

スカラー型 (bool、float、int、string) を判定する。

<br>

### キャスト演算子

#### ▼ `(string)`

```injectablephp
<?php

$var = 10; // $varはinteger型。

// キャスト演算子でデータ型を変換
$var = (string) $var; // $varはstring型
```

#### ▼ `(int)`

```injectablephp
<?php

$var = 1;

// integer型
$var = (int) $var;

// 1
```

#### ▼ `(bool)`

```injectablephp
<?php

$var = 1;

// boolean型
$var = (bool) $var;

// true
```

#### ▼ `(float)`

```injectablephp
<?php

$var = "1.0";

// Float型
$var = (float) $var;

// 1.0
```

#### ▼ `(array)`

```injectablephp
<?php

// 配列型
$var = (array) $var;
```

#### ▼ `(object)`

```injectablephp
<?php

// Object型
$var = (object) $var;
```

<br>

## 03. `list()` 関数

### `list()` 関数とは

PHP の `list()` 関数は、List 型とは意味合いが異なる。

配列の個々の要素を変数に格納したい場合、List 型を使用しなければ、冗長ではあるが、以下のように実装する必要がある。

```injectablephp
<?php

$array = array("あ", "い", "う");
$a = $array[0];
$i = $array[1];
$u = $array[2];

echo $a.$i.$u; // あいう
```

しかし、以下のように、`list()` 関数を使用することによって、複数の変数への格納を１行で実装できる。

```injectablephp
<?php

list($a, $i, $u) = array("あ", "い", "う");

echo $a.$i.$u; // あいう
```

<br>
