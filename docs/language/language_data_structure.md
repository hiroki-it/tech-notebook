---
title: 【IT技術の知見】データ構造
description: データ構造の知見を記録しています。
tags:
  - "言語"
---

# データ構造

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. データ構造の実装方法

ハードウェアが処理を行うときに、データの集合を効率的に扱うためのデータ格納形式をデータ構造という。

データ構造の実装方法を以下に示す。

### 配列型

同じデータ型のデータを並べたデータ格納様式のこと。

#### ▼ インデックス配列

番号キーごとに値が格納された配列型のこと。

=== "Go"

    ```go title="Go の場合の実装例"
    array := []string{"A", "B", "C"}

    fmt.Println(array)

    // [A B C]
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const array: string[] = ["A", "B", "C"];

    console.log(array);

    // [ 'A', 'B', 'C' ]
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $array = ["A", "B", "C"];

    print_r($array);

    // Array
    // (
    //     [0] => A
    //     [1] => B
    //     [2] => C
    // )
    ```

#### ▼ 多次元配列

配列のなかに配列を持つ配列型のこと。

配列の入れ子構造が２段の場合、『2 次元配列』と呼ぶ。

=== "Go"

    ```go title="Go の場合の実装例"
    array := [][]string{
    	{"リンゴ", "イチゴ", "トマト"},
    	{"メロン", "キュウリ", "ピーマン"},
    }

    fmt.Println(array)

    // [[リンゴ イチゴ トマト] [メロン キュウリ ピーマン]]
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const array: string[][] = [
      ["リンゴ", "イチゴ", "トマト"],
      ["メロン", "キュウリ", "ピーマン"],
    ];

    console.log(array);

    // [ [ 'リンゴ', 'イチゴ', 'トマト' ], [ 'メロン', 'キュウリ', 'ピーマン' ] ]
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $array = [
        ["リンゴ", "イチゴ", "トマト"],
        ["メロン", "キュウリ", "ピーマン"],
    ];

    print_r($array);

    // Array
    // (
    //     [0] => Array
    //         (
    //             [0] => リンゴ
    //             [1] => イチゴ
    //             [2] => トマト
    //         )
    //
    //     [1] => Array
    //         (
    //             [0] => メロン
    //             [1] => キュウリ
    //             [2] => ピーマン
    //         )
    //
    // )
    ```

#### ▼ 連想配列

キー名 (赤、緑、果物、野菜) ごとに値が格納された配列型のこと。

下の例は、2 次元配列かつ連想配列である。

=== "Go"

    ```go title="Go の場合の実装例"
    array := map[string]map[string][]string{
    	"赤": {
    		"果物": {"リンゴ", "イチゴ"},
    		"野菜": {"トマト"},
    	},
    	"緑": {
    		"果物": {"メロン"},
    		"野菜": {"キュウリ", "ピーマン"},
    	},
    }

    fmt.Println(array)

    // map[緑:map[果物:[メロン] 野菜:[キュウリ ピーマン]] 赤:map[果物:[リンゴ イチゴ] 野菜:[トマト]]]
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const array: Record<string, Record<string, string[]>> = {
      赤: {
        果物: ["リンゴ", "イチゴ"],
        野菜: ["トマト"],
      },
      緑: {
        果物: ["メロン"],
        野菜: ["キュウリ", "ピーマン"],
      },
    };

    console.log(array);

    // {
    //   '赤': { '果物': [ 'リンゴ', 'イチゴ' ], '野菜': [ 'トマト' ] },
    //   '緑': { '果物': [ 'メロン' ], '野菜': [ 'キュウリ', 'ピーマン' ] }
    // }
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
    <?php

    $array = [
        "赤" => [
            "果物" => ["リンゴ", "イチゴ"],
            "野菜" => ["トマト"],
        ],
        "緑" => [
            "果物" => ["メロン"],
            "野菜" => ["キュウリ", "ピーマン"],
        ],
    ];

    print_r($array);

    // Array
    // (
    //     [赤] => Array
    //         (
    //             [果物] => Array
    //                 (
    //                     [0] => リンゴ
    //                     [1] => イチゴ
    //                 )
    //
    //             [野菜] => Array
    //                 (
    //                     [0] => トマト
    //                 )
    //
    //         )
    //
    //     [緑] => Array
    //         (
    //             [果物] => Array
    //                 (
    //                     [0] => メロン
    //                 )
    //
    //             [野菜] => Array
    //                 (
    //                     [0] => キュウリ
    //                     [1] => ピーマン
    //                 )
    //
    //         )
    //
    // )
    ```

<br>

### LinkedList 型

値をポインタによって順序通り並べたデータ格納形式のこと。

#### ▼ 単方向リスト

単方向リストでは、各データが次のデータへのポインタのみを持つため、先頭から順にしかデータを辿れない。

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

![p555-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p555-1.gif)

#### ▼ 双方向リスト

双方向リストでは、各データが次のデータと前のデータの両方へのポインタを持つため、前後のどちらにもデータを辿れる。

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

![p555-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p555-2.gif)

#### ▼ 循環リスト

循環リストでは、最後尾のデータが先頭のデータへのポインタを持つため、リスト全体が環状につながり、最後尾から先頭に戻って辿り続けられる。

> - [キタミ式イラストIT塾 基本情報技術者 令和04年 \| きたみ りゅうじ \|本 \| 通販 \| Amazon](https://www.amazon.co.jp/dp/4297124513)

![p555-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p555-3.gif)

<br>

### キュー型

![queue_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/queue_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![queue_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/queue_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![queue_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/queue_3.gif)

配列の最後に要素を追加する処理と、配列の最初の要素を取り出す処理を組み合わせることにより、実装できる。

=== "Go"

    ```go title="Go の場合の実装例"
    array := []string{"Blue", "Green"}

    // 引数を、配列の最後に、要素として追加する。
    array = append(array, "Red")
    fmt.Println(array)

    // 出力結果

    // [Blue Green Red]

    // 配列の最初の要素を取り出す。
    theFirst := array[0]
    array = array[1:]
    fmt.Println(array)

    // 出力結果

    // [Green Red]

    // 取り出された値の確認
    fmt.Println(theFirst) // Blue
    ```

=== "TypeScript"

    ```typescript title="TypeScript の場合の実装例"
    const array: string[] = ["Blue", "Green"];

    // 引数を、配列の最後に、要素として追加する。
    array.push("Red");
    console.log(array);

    // 出力結果

    // [ 'Blue', 'Green', 'Red' ]

    // 配列の最初の要素を取り出す。
    const theFirst = array.shift();
    console.log(array);

    // 出力結果

    // [ 'Green', 'Red' ]

    // 取り出された値の確認
    console.log(theFirst); // Blue
    ```

=== "PHP"

    ```injectablephp title="PHP の場合の実装例"
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
    $theFirst = array_shift($array);
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

#### ▼ メッセージキュー

送信元の好きなタイミングでファイル (メッセージ) をメッセージキューに追加できる。

また、宛先の好きなタイミングでメッセージを取り出せる。

![message-queue](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/message-queue.jpg)

<br>

### Stack 型

配列の最後に要素を追加する処理と、配列の最後の要素を取り出す処理で実装可能。

![stack_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/stack_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![stack_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/stack_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![stack_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/stack_3.gif)

<br>

### Tree 型

#### ▼ 二分探索木

各ノードにデータが格納されている。

![binary-search-tree_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/binary-search-tree_1.gif)

#### ▼ ヒープ

プライオリティキューを実現するときに使用される。

各ノードにデータが格納されている。

![heap_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/heap_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![heap_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/heap_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![heap_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/heap_3.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/arrow_80x82.jpg)

![heap_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/heap_4.gif)

<br>
