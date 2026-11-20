---
title: 【IT技術の知見】アルゴリズム
description: アルゴリズムの知見を記録しています。
tags:
  - "言語"
  - "PHP"
  - "言語機能"
---

# アルゴリズム

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 並び替えのアルゴリズム

例えば、次のような表では、どのような仕組みで『昇順』『降順』に並び替えるのだろうか。

![sort_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/sort_architecture.gif)

<br>

### 基本選択法 (選択ソート)

#### ▼ 最小選択法

1. 比較基準値を決める。

2. 最初の数値を比較基準値とし、`n` 個のなかからもっとも小さい数字を探し、それと入れ替える。

3. 次に、残りの `n-1` 個のなかからもっとも小さい数字を探し、それを 2 番目の数字と入れ替える。

4. この処理を `n-1` 回繰り返す。

   ```injectablephp
   <?php
   function minSelectSort(array $array): array
   {

       // 比較基準値を固定し、それ以外の数値と比べていく。
       for($i = 0; $i < count($array)-1; $i++){

           // 比較基準値を仮の最小値として定義。
           $min = $array[$i];

           // 比較基準値の位置を定義
           $position = $i;

           // 比較基準値の位置以降で、数値を固定し、順番に評価していく。
           for($j = $position + 1; $j < count($array); $j++){

               // 比較基準値の位置以降に小さい数値があれば、比較基準値と最小値を更新。
               if($min > $array[$j]){
                   $position = $j;
                   $min = $array[$j];
               }
           }

           // 比較基準値の位置が更新されていなかった場合、次の比較基準値に進む。
           if($i == $position){
               continue;
           }

           // 親のfor文の最小値を更新。
           $array[$position] = $array[$i];
           $array[$i] = $min;

           // 次に2番目を比較基準値とし、同じ処理を繰り返していく。
       }
       return $array;
   }
   ```

   ```injectablephp
   <?php
   // 実際に使用してみる。
   $array = array(10,2,12,7,16,8,13);
   $result = minSelectSort($array);
   var_dump($result);

   // 昇順に並び替えられている。
   // 2, 7, 8, 10, 12, 13, 16
   ```

**＊アルゴリズム解説＊**

データ中の最小値を求め、次にそれを除いた部分のなかから最小値を求める。

この操作を繰り返していく。

![selection-sort_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/selection-sort_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![selection-sort_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/selection-sort_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![selection-sort_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/selection-sort_3.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![selection-sort_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/selection-sort_4.gif)

<br>

### クイックソート

1. 適当な値を基準値 (Pivot) とする (※できれば中央値が望ましい)

2. Pivot より小さい数を前方、大きい数を後方に分割する。

3. 二分割された各々のデータを、それぞれ並び替える。

4. ソートを繰り返し実行する。

   ```injectablephp
   <?php
   function quickSort(array $array): array
   {
       // 配列の要素数が1つしかない場合、クイックソートする必要がないため、返却する。
       if (count($array) <= 1) {
           return $array;
       }

       // 一番最初の値をPivotとする。
       $pivot = array_shift($array);

       // グループを定義
       $left = $right = [];

       foreach ($array as $value) {

           if ($value < $pivot) {

               // Pivotより小さい数は左グループに格納
               $left[] = $value;

           } else {

               // Pivotより大きい数は右グループに格納
               $right[] = $value;

               }

       }

       // 処理の周回ごとに、結果の配列を結合。
       return array_merge
       (
           // 左のグループを再帰的にクイックソート。
           quickSort($left),

           // Pivotを結果に組み込む。
           array($pivot),

           // 左のグループを再帰的にクイックソート。
           quickSort($right)
       );

   }
   ```

   ```injectablephp
   <?php
   // 実際に使用してみる。
   $array = array(6, 4, 3, 7, 8, 5, 2, 9, 1);
   $result = quickSort($array);
   var_dump($result);

   // 昇順に並び替えられている。
   // 1, 2, 3, 4, 5, 6, 7, 8
   ```

**＊アルゴリズム解説＊**

適当な値を基準値 (Pivot) とし、それより小さな値のグループと大きな値のグループに分割する。

同様にして、両グループのなかで Pivot を選択し、`2` 個のグループに分割する。

グループ内の値が 1 つになるまで、この処理を繰り返していく。

![quick-sort_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_1.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_2.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_3.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_4.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_5](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_5.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_6](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_6.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_7](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_7.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_8](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_8.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_9](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_9.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_10](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_10.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_11](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_11.jpg)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![quick-sort_12](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/quick-sort_12.jpg)

### 基本交換法 (バブルソート)

隣り合ったデータの比較と入替えを繰り返すことによって、小さな値のデータを次第に端のほうに移していく。

![bubble-sort_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/bubble-sort_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![bubble-sort_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/bubble-sort_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![bubble-sort_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/bubble-sort_3.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![bubble-sort_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/bubble-sort_4.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![bubble-sort_5](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/bubble-sort_5.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![bubble-sort_6](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/bubble-sort_6.gif)

<br>

### 基本挿入法 (挿入ソート)

すでに整列済みのデータ列の正しい位置に、データを追加する操作を繰り返していく。

<br>

### ヒープソート

<br>

### シェルソート

<br>

## 02. 配列内探索のアルゴリズム

### 線形探索法

今回は、配列内で『６』を探す。

![linear-search_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/linear-search_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![linear-search_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/linear-search_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![linear-search_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/linear-search_3.gif)

### 二分探索法

前提として、ソートによって、すでにデータが整列させられているとする。

今回は、配列内で『`6`』を探す。

![binary-search_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/binary-search_1.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![binary-search_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/binary-search_2.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![binary-search_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/binary-search_3.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![binary-search_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/binary-search_4.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![binary-search_5](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/binary-search_5.gif)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![binary-search_6](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/binary-search_6.gif)

<br>

## 03. グラフ探索のアルゴリズム (難し過ぎで記入途中)

### ダイクストラ法による最良優先探索

![route-map](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/route-map.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

地点間の距離を表で表す。ただし、同地点間の距離は『0』、隣り合わない地点間の距離は『-1』とする。

![dijkstra_distance-table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_distance-table.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

```injectablephp
<?php
// 各地点間の距離を二次元の連想配列で定義
$matrix = array(
    "P0" => array(0, 2, 8, 4, -1, -1, -1),
    "P1" => array(2, 0, -1, -1, 3, -1, -1),
    "P2" => array(8, -1, 0, -1, 2, 3, -1),
    "P3" => array(4, -1, -1, 0, -1, 8, -1),
    "P4" => array(-1, 3, 2, -1, 0, -1, 9),
    "P5" => array(-1, -1, 3, 8, -1, 0, 3),
    "P6" => array(-1, -1, -1, -1, 9, 3, 0)
);
```

```injectablephp
<?php
// 各地点間の距離、出発地点、開始地点を引数にとる。
function bestFirstSearchByDijkstra(
    array $matrix,
    int $startPoint,
    int $goalPoint
): void
{
    // 地点数を定数で定義
    define("POINT_NUMBER", count($matrix));

    if($startPoint < POINT_NUMBER
        || POINT_NUMBER < $goalPoint){
            throw new Exception("存在しない地点番号は設定できません。");
    }

    // 出発地点を定数で定義
    define("START_POINT", $startPoint);

    // 到着地点を定数で定義
    define("GOAL_POINT", $goalPoint);

    // 無限大の定数のINFを使いたいが、定数は上書きできないため、代わりに-1を使用。
    // 各頂点に対して、最短ルート地点番号、地点間距離のゼロ値、最短距離確定フラグを設定。
    for($i = 0; $i < POINT_NUMBER; $i ++){
        $route[$i] = -1;
        $distance[$i] = -1;
        $fixFlg[$i] = false;
        }

    // ＊別の書き方＊
    // $cost = array_fill(0, POINT_NUMBER, -1);
    // $distance = array_fill(0, POINT_NUMBER, -1);
    // $fix = array_fill(0, POINT_NUMBER, false);

    // 出発地点から出発地点への距離をゼロとする。
    $distance[START_POINT] = 0;

    //
    while(true){
        $i = 0;

        while($i < POINT_NUMBER){
            if(!$fixFlg[$i]){
                break 1;
            }
            $i += 1;
        }

        if($i === POINT_NUMBER){
            break 1;
        }

        for($j = $i + 1; $j < POINT_NUMBER; $j ++){
            if(!$fixFlg[$i] && $distance[$j] < $distance[$i]){
                $i = $j;
            }
        }

        // 今の自分には、これ以上は難しい…
        // 未来の俺、頑張ってくれ…

    }
}
```

**＊最短経路探索処理の解説＊**

$startPoint = 0

$goalPoint = 6

としたとき、出発地点 (0) から 1 ステップ行ける地点までの距離 (pDist) を取得し、確定させる。

![shortest-path_loop_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/shortest-path_loop_1.png)

![shortest-path_loop_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/shortest-path_loop_2.png)

![shortest-path_loop_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/shortest-path_loop_3.png)

![shortest-path_loop_4-6](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/shortest-path_loop_4-6.png)

![shortest-path_loop_7](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/shortest-path_loop_7.png)

**＊アルゴリズム解説＊**

正のコストを持つ経路のみの場合、使用される方法。

![dijkstra_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_1.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_2.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_3.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_4.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_5](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_5.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_6](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_6.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_7](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_7.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_8](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_8.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_10](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_10.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_11](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_11.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_12](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_12.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_14](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_14.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_16](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_16.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_17](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_17.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_18](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_18.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_19](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_19.png)

![arrow_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/arrow_80x82.jpg)

![dijkstra_20](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/dijkstra_20.png)

<br>

## 04. 誤り検出と訂正のアルゴリズム

### Check Digit Check

バーコードやクレジットカードなどの読み取りチェックで使われている誤り検出方法。

1. Check Digit を算出する。

2. 算出された Check Digit が正しいかを検証する。

   ![check-digit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/language/check-digit.gif)

<br>

### Parity Check

<br>

### CRC：Cyclic Redundancy Check (巡回冗長検査)
