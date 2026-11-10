---
title: 【IT技術の知見】制御構文
description: 制御構文の知見を記録しています。
tags:
  - "言語"
  - "PHP"
  - "言語機能"
---

# 制御構文

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 条件式

### if-elseif-else 、switch-case-break

曜日をバリデーションし、文字列を出力する。

#### ▼ if-elseif-else

```injectablephp
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

定数ごとに処理が変わるときは、こちらのほうが読みやすい。

```injectablephp
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

### if-else の回避方法

#### ▼ if-else を使用した場合

可読性が悪いため、避けるべき。

```injectablephp
<?php

class Example
{
    /**
     * マジックナンバー
     */
    const noOptionItem = 0;

    private Entity $routeEntity;

    public function example(array $result): array
    {

        // RouteEntityからoptionsオブジェクトに格納されるoptionオブジェクト配列を取り出す。
        if (!empty($this->routeEntity->options)) {
            foreach ($this->routeEntity->options as $option) {

                // if文を通過した場合、関数の返却値が格納される。
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

```injectablephp
<?php

class Example
{
    /**
     * マジックナンバー
     */
    const noOptionItem = 0;

    private Entity $routeEntity;

    public function example(array $result): array
    {
        // RouteEntityからoptionsオブジェクトに格納されるoptionオブジェクト配列を取り出す。
        if (!empty($this->routeEntity->options)) {
            foreach ($this->routeEntity->options as $option) {

                // if文を通過した場合、関数の返却値が格納される。
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

```injectablephp
<?php

class Example
{
    /**
     * マジックナンバー
     */
    const noOptionItem = 0;

    private Entity $routeEntity;

    public function example(array $result): array
    {
        // 初期値0を設定
        $result["optionItemA"] = self::noOptionItem;
        $result["optionItemB"] = self::noOptionItem;
        $result["optionItemC"] = self::noOptionItem;

        // RouteEntityからoptionsオブジェクトに格納されるoptionオブジェクト配列を取り出す。
        if(!empty($this->routeEntity->options)) {
            foreach ($this->routeEntity->options as $option) {

                // if文を通過した場合、関数の返却値によって初期値0が上書きされる。
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

### if-elseif-else の回避方法

#### ▼ 決定表を使用した条件分岐の整理

うるう年であるかをバリデーションし、文字列を出力する。

以下の手順で設計と実装をする。

1. 条件分岐の処理順序の概要を日本で記述する。

2. 記述内容を、条件部と動作部に分解し、決定表で表す。

3. 決定表を、流れ図で表す。

    ![決定表](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/決定表.png)

#### ▼ if-elseif-else は使用しない

可読性が悪いため、避けるべき。

```injectablephp
<?php
// 西暦を格納する。
$year = N;
```

```injectablephp
<?php

function leapYear(int $year): string
{
    // (5)
    if ($year <= 0) {
        throw new Exception("負の数はバリデーションできません。");

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

#### ▼ if と return を使用した早期リターン

各 if 文で `return` を使用することで、`if` が入れ子状になることを防げる。

これを、早期リターンともいう。

```injectablephp
<?php

// 西暦を格納する。
$year = N;

function leapYear(int $year): string
{
    // (5)
    if($year <= 0){
        throw new Exception("負の数はバリデーションできません。");
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

#### ▼ switch-case-break を使用した早期リターン

if 文の代わりに、`switch-case-break` によって、実装に、『◯◯の場合に切り換える』という意味合いを持たせられる。

ここでは、関数に実装することを想定して、`break` ではなく `return` を使用している。

```injectablephp
<?php

function leapYear(int $year): string
{
    switch(true) {

    // (5)
    case($year <= 0):
        throw new Exception("負の数はバリデーションできません。");

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
    default:
        return "うるう年";
    }

}
```

#### ▼ ガード節を使用した早期リターン

早期リターンの if 文の波括弧を省略した記法を、ガード節という。

```injectablephp
<?php

function leapYear(int $year): string
{
    // (5)
    if($year <= 0) throw new Exception("負の数はバリデーションできません。");

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

## 02. 反復対象のデータ

### 配列

#### ▼ 走査 (スキャン)

配列内の要素を順に調べていくことを『走査 (スキャン) 』という。

例えば、`foreach` は、配列内のすべての要素を走査する処理である。

下図では、連想配列が表現されている。

![配列の走査](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/配列の走査.png)

#### ▼ 内部ポインタと配列の関係

『内部ポインタ』とは、PHP の配列で、参照したい要素を位置で指定するためのカーソルのこと。

```injectablephp
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

## 03. foreach

### 文法

#### ▼ 基本

配列を走査する。

```injectablephp
<?php

$array = [1, 2, 3, 4];
foreach ($array as &$value) {
    $value = $value * 2;
    echo $value;
}
```

#### ▼ 制御文

![流れ図_foreach文](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/流れ図_foreach文.png)

```injectablephp
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

複雑な走査をするために、ビルトイン関数が用意されている。

> - [PHP: 配列 関数 - Manual](https://www.php.net/manual/ja/ref.array.php)

#### ▼ 配列の値へのアクセス

単に配列を作るのみでなく、要素にアクセスするためにも使われる。

```injectablephp
<?php

class Foo
{
     /**
     * オプションを調べて、文字列を返却します。
     */
    public function printOption(array $options): string
    {
        $result = '何も設定されていません。';

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

```injectablephp
<?php

// 以下の引数が渡されると想定
// ($K, $A) = (4, [1, 2, 3, 4, 1, 1, 3])

function iteration(int $K, array $A): void
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

```injectablephp
<?php

// 以下の引数が渡されると想定
// ($M, $A) = (6, [3, 4, 5, 5, 2])

function iteration(int $M, array $A): int {

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

`call_user_func_array()` 関数の第一引数に、コールバック関数の `array_merge()` 関数の文字列を渡し、第二引数に 2 次元配列を渡す。

その結果、平坦になって 1 次元配列になる。

例えば、不要なインデックス (0) で入れ子になっている場合に役に立つ。

```injectablephp
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

例えば、以下のような多次元配列があったとする。

配列の score キーから値を取り出し、1 次元配列を作成する。

```injectablephp
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

## 04. while

### 文法

#### ▼ 基本

配列の走査を含む反復処理を実行する。

ただし、配列の走査は、`while` ではなく `foreach` を使用する。

また、`for` とは異なり、反復回数が決まっていない場合に使用する。

```injectablephp
<?php

$count = 0;
// 反復回数が決まっていないため、満たせたらbreakで停止する。
while(true) {

    if($count == 10){
        break;
    }

    $count++;
}

echo $count;
```

#### ▼ 制御文

![流れ図_while文](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/流れ図_while文.png)

```injectablephp
<?php

$a = [1, -1, 2];
$sum = 0;

$i = 0;
while (true) {

    // 全て走査したら停止
    if($i == count($a)) {
        break;
    }

    $foo = $a[$i];

    if($foo > 0) {
        $sum += $foo;
    }

    // 代入加算
    $i ++;
}
```

<br>

### 無限ループ

#### ▼ 無限ループとは

反復処理では、何らかの状態になったときは反復処理を終えなければならない。

しかし、終えられないと、無限ループが発生してしまう。

<br>

## 05. for

### 文法

#### ▼ 基本

配列の走査を含む反復処理を実行する。

ただし、配列の走査は、`for` ではなく `foreach` を使用する。

また、`while` とは異なり、反復回数が決まっている場合に使用する。

```injectablephp
<?php

// 10回反復することが決まっている。
for($i = 1; $i <= 10; $i++){
    $count++;
}

echo $count;
```

#### ▼ 制御文

![流れ図_for文](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/流れ図_for文.png)

```injectablephp
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

## 06. 反復回数の変更

### continue

#### ▼ continue とは

反復処理の現在のループをスキップし、次のループを開始する。

```injectablephp
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

#### ▼ array_walk を使用した代替法

反復処理のループを `continue` でスキップするときと同じ動作を、配列を処理する関数のコールバック関数の早期リターンで実現できる。

`continue` を使用するより、こちらのほうがよい。

```injectablephp
<?php

$array = [1, 2, 3, 4, 5];

array_walk($array, function (int $value, int $key): void {

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

#### ▼ break とは

反復処理の現在のループを停止し、以降のループも実行しない。

```injectablephp
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
