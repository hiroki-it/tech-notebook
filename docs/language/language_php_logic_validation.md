---
title: 【IT技術の知見】検証ロジック＠PHP
description: 検証ロジック＠PHPの知見を記録しています。
---

# 検証ロジック＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 検証

### 検証の必要性の有無

#### ▼ 不要な場合

DBから取得した後に直接的に表示する値の場合、DBでNullにならないように制約をかけられる。

そのため、値が想定通りの状態になっているかを改めて検証する必要はない。

#### ▼ 必要な場合

DBからの値を直接的に表示する場合と異なり、新しく作られる値を使用する場合、その値が想定外の状態になっている可能性がある。

そのため、値が想定通りの状態になっているかを検証する必要がある。

<br>

### 検証パターンと検証メソッドの対応

✅：`TRUE`になる。

空欄：`FALSE`になる。

| 検証パターン      | `isset($var)`、`!is_null($var)` |       `if($var)`、`!empty($var)`        |
| :---------------- | :-----------------------------: | :-------------------------------------: |
| **`null`**        |                                 |                                         |
| **`0`**           |               ✅                |                                         |
| **`1`**           |               ✅                |                   ✅                    |
| **`""`** (空文字) |               ✅                |                                         |
| **`"あ"`**        |               ✅                |                   ✅                    |
| **`array(0)`**    |               ✅                |                                         |
| **`array(1)`**    |               ✅                |                   ✅                    |
| **使いどころ**    |   `null`のみを検証したい場合    | `null`、`0`、`""`、`[]`を検証したい場合 |

> ↪️ 参考：https://qiita.com/shinichi-takii/items/00aed26f96cf6bb3fe62

<br>

## 02. 条件式

### if-elseif-else 、switch-case-break

**＊実装例＊**

曜日を検証し、文字列を出力する。

#### ▼ if-elseif-else

**＊実装例＊**

```php
<?php
// 変数に Tue を格納
$weeks = "Tue";

// if文でTueに該当したら"火曜日"と表示する。
if ($weeks == "Mon") {
    echo "月曜日";
} elseif ($weeks == "Tue") {
    echo "火曜日";
} elseif ($weeks == "Wed") {
    echo "水曜日";
} elseif ($weeks == "Thu") {
    echo "木曜日";
} elseif ($weeks == "Fri") {
    echo "金曜日";
} elseif ($weeks == "Sat") {
    echo "土曜日";
} else {
    echo "日曜日";
}

// 実行結果
// 火曜日
```

#### ▼ switch-case-break

定数ごとに処理が変わる時、こちらの方が可読性が高い。

**＊実装例＊**

```php
<?php

// 変数に Tue を格納
$weeks = "Tue";

// 条件分岐でTueに該当したら"火曜日"と表示する。breakでif文を抜けなければ、全て実行されてしまう。
switch ($weeks) {
    case "Mon":
        echo "月曜日";
        break;
    case "Tue":
        echo "火曜日";
        break;
    case "Wed":
        echo "水曜日";
        break;
    case "Thu":
        echo "木曜日";
        break;
    case "Fri":
        echo "金曜日";
        break;
    case "Sat":
        echo "土曜日";
        break;
    case "Sun":
        echo "日曜日";
        break;
    default:
        echo "曜日がありません";
}

// 実行結果
// 火曜日
```

<br>

### if-elseの回避方法

#### ▼ if-elseを使用した場合

可読性が悪いため、避けるべき。

**＊実装例＊**

```php
<?php

class Example
{
    /**
     * マジックナンバー
     */
    const noOptionItem = 0;

    /**
     * @var Entity
     */
    private $routeEntity;

    public function example($result)
    {

        // RouteEntityからoptionsオブジェクトに格納されるoptionオブジェクト配列を取り出す。
        if (!empty($this->routeEntity->options)) {
            foreach ($this->routeEntity->options as $option) {

                // if文を通過した場合、メソッドの返却値が格納される。
                // 通過しない場合、定数が格納される。
                if ($option->isOptionItemA()) {
                    $result["optionItemA"] = $option->optionItemA();
                } else {
                    $result["optionItemA"] = self::noOptionItem;
                }

                if ($option->isOptionItemB()) {
                    $result["optionItemB"] = $option->optionItemB();
                } else {
                    $result["optionItemB"] = self::noOptionItem;
                }

                if ($option->isOptionItemC()) {
                    $result["optionItemC"] = $option->optionItemC();
                } else {
                    $result["optionItemC"] = self::noOptionItem;
                }
            }
        }

        return $result;
    }
}
```

#### ▼ 三項演算子を使用した場合

よりすっきりした書き方になる。

**＊実装例＊**

```php
<?php

class Example
{
    /**
     * マジックナンバー
     */
    const noOptionItem = 0;

    /**
     * @var Entity
     */
    private $routeEntity;

    public function example($result)
    {
        // RouteEntityからoptionsオブジェクトに格納されるoptionオブジェクト配列を取り出す。
        if (!empty($this->routeEntity->options)) {
            foreach ($this->routeEntity->options as $option) {

                // if文を通過した場合、メソッドの返却値が格納される。
                // 通過しない場合、定数が格納される。
                $result["optionItemA"] = ($option->isOptionItemA())
                  ? $option->optionItemA()
                  : self::noOptionItem;

                $result["optionItemB"] = ($option->isOptionItemB())
                  ? $option->optionItemB()
                  : self::noOptionItem;

                $result["optionItemC"] = ($option->isOptionItemC())
                  ? $option->optionItemC()
                  : self::noOptionItem;
            };
        }

        return $result;
    }
}
```

#### ▼ 初期値と上書きのロジックを使用した場合

よりすっきりした書き方になる。

**＊実装例＊**

```php
<?php

class Example
{
    /**
     * マジックナンバー
     */
    const noOptionItem = 0;

    /**
     * @var Entity
     */
    private $routeEntity;

    public function example($result)
    {
        // 初期値0を設定
        $result["optionItemA"] = self::noOptionItem;
        $result["optionItemB"] = self::noOptionItem;
        $result["optionItemC"] = self::noOptionItem;

        // RouteEntityからoptionsオブジェクトに格納されるoptionオブジェクト配列を取り出す。
        if(!empty($this->routeEntity->options)) {
            foreach ($this->routeEntity->options as $option) {

                // if文を通過した場合、メソッドの返却値によって初期値0が上書きされる。
                // 通過しない場合、初期値0が使用される。
                if ($option->isOptionItemA()) {
                    $result["optionItemA"] = $option->optionItemA();
                }

                if ($option->isOptionItemB()) {
                    $result["optionItemB"] = $option->optionItemB();
                }

                if ($option->isOptionItemC()) {
                    $result["optionItemC"] = $option->optionItemC();
                }
            };
        }

        return $result;
    }
}

```

<br>

### if-elseif-elseの回避方法

#### ▼ 決定表を使用した条件分岐の整理

**＊実装例＊**

うるう年であるかを検証し、文字列を出力する。

以下の手順で設計と実装を行う。

`【１】`

: 条件分岐の処理順序の概要を日本で記述する。

`【２】`

: 記述内容を、条件部と動作部に分解し、決定表で表す。

`【３】`

: 決定表を、流れ図で表す。

![決定表](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/決定表.png)

#### ▼ if-elseif-elseは使用しない

可読性が悪いため、避けるべき。

**＊実装例＊**

```php
<?php
// 西暦を格納する。
$year = N;
```

```php
<?php

function leapYear(int $year): string
{
    // (5)
    if ($year <= 0) {
        throw new Exception("負の数は検証できません。");

    // (4)
    } elseif ($year % 4 != 0) {
        return "平年";

    // (3)
    } elseif ($year % 100 != 0) {
        return "うるう年";

    // (2)
    } elseif ($year % 400 != 0) {
        return "平年";

    // (1)
    } else {
        return "うるう年";
    }
}
```

#### ▼ ifとreturnを使用した早期リターン

各if文で`return`を使用することにより、`if`が入れ子状になることを防げる。

これを、早期リターンともいう。

**＊実装例＊**

```php
<?php

// 西暦を格納する。
$year = N;

function leapYear(int $year): string
{
    // (5)
    if($year <= 0){
        throw new Exception("負の数は検証できません。");
    }

    // (4)
    if($year % 4 != 0 ){
        return "平年";
    }

    // (3)
    if($year % 100 != 0){
        return "うるう年";
    }

    // (2)
    if($year % 400 != 0){
        return "平年";
    }

    // (1)
    return "うるう年";

}
```

#### ▼ switch-case-breakを使用した早期リターン

if文の代わりに、`switch-case-break`によって、実装に、『◯◯の場合に切り換える』という意味合いを持たせられる。

ここでは、メソッドに実装することを想定して、`break`ではなく`return`を使用している。

**＊実装例＊**

```php
<?php

function leapYear(int $year): string
{
    switch(true) {

    // (5)
    case($year <= 0):
        throw new Exception("負の数は検証できません。");

    // (4)
        case($year % 4 != 0 ):
        return "平年";

    // (3)
    case($year % 100 != 0):
        return "うるう年";

    // (2)
    case($year % 400 != 0):
        return "平年";

    // (1)
    dafault:
        return "うるう年";
    }

}
```

#### ▼ ガード節を使用した早期リターン

早期リターンのif文の波括弧を省略した記法を、ガード節という。

**＊実装例＊**

```php
<?php

function leapYear(int $year): string
{
    // (5)
    if($year <= 0) throw new Exception("負の数は検証できません。");

    // (4)
    if($year % 4 != 0 ) return "平年";

    // (3)
    if($year % 100 != 0) return "うるう年";

    // (2)
    if($year % 400 != 0) return "平年";

    // (1)
    return "うるう年";

}
```

<br>

## 02-02. インスタンスの検証

### 等価演算子

#### ▼ イコールが`2`個の場合

同じオブジェクトから別々に作られたインスタンスであっても、『同じもの』として認識される。

**＊実装例＊**

```php
<?php

class Example {};

if(new Example == new Example){
    echo "同じです";
} else { echo "異なります"; }

// 実行結果
// 同じです
```

#### ▼ イコールが`3`個の場合

同じオブジェクトから別々に作られたインスタンスであっても、『異なるもの』として認識される。

**＊実装例＊**

```php
<?php

class Example {};

if (new Example === new Example) {
    echo "同じです";
} else {
    echo "異なります";
}

// 実行結果
// 異なります
```

同じインスタンスの場合のみ、『同じもの』として認識される。

**＊実装例＊**

```php
<?php

class Example {};

$a = $b = new Example;

if ($a === $b) {
    echo "同じです";
} else {
    echo "異なります";
}

// 実行結果
// 同じです
```

<br>
