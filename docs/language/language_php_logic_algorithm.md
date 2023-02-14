---
title: 【IT技術の知見】アルゴリズムロジック＠PHP
description: アルゴリズムロジック＠PHPの知見を記録しています。
---

# アルゴリズムロジック＠PHP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 並び替えのアルゴリズム

例えば、次のような表では、どのような仕組みで『昇順』『降順』への並び替えが行われるのだろうか。



![ソートの仕組み](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ソートの仕組み.gif)

<br>

### 基本選択法 (選択ソート) 

#### ▼ 最小選択法

**＊実装例＊**

```【１】```

:    比較基準値を決める。

```【２】```

:    最初の数値を比較基準値とし、```n```個の中から最も小さい数字を探し、それと入れ替える。

```【３】```

:    次に、残りの```n-1```個の中から最も小さい数字を探し、それを2番目の数字と入れ替える。

```【４】```

:    この処理を```n-1```回繰り返す。

```php
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
        
        // 比較基準値の位置が更新されていなかった場合、親のfor文から抜ける。
        if($i == $position){
            break;
        }

        // 親のfor文の最小値を更新。
        $array[$i] = $min;
        
        // 次に2番目を比較基準値とし、同じ処理を繰り返していく。
    }
    return $array;
}
```

```php
<?php
// 実際に使用してみる。
$array = array(10,2,12,7,16,8,13)
$result = selectSort($array);
var_dump($result); 

// 昇順に並び替えられている。
// 2, 7, 8, 10, 12, 13, 16
```

**＊アルゴリズム解説＊**

データ中の最小値を求め、次にそれを除いた部分の中から最小値を求める。

この操作を繰り返していく。



![選択ソート1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/選択ソート1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![選択ソート2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/選択ソート2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![選択ソート3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/選択ソート3.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![選択ソート4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/選択ソート4.gif)

<br>

### クイックソート

**＊実装例＊**

```【１】```

:    適当な値を基準値 (Pivot) とする  (※できれば中央値が望ましい) 

```【２】```

:    Pivotより小さい数を前方、大きい数を後方に分割する。

```【３】```

:    二分割された各々のデータを、それぞれソートする。

```【４】```

:    ソートを繰り返し実行する。

```php
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

```php
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

同様にして、両グループの中でPivotを選択し、```2```個のグループに分割する。

グループ内の値が1つになるまで、この処理を繰り返していく。



![クイックソート-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-1.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-2.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-3.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-4.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-5](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-5.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-6](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-6.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-7](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-7.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-8](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-8.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-9](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-9.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-10](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-10.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-11](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-11.jpg)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![クイックソート-12](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クイックソート-12.jpg)



### 基本交換法 (バブルソート) 

隣り合ったデータの比較と入替えを繰り返すことによって、小さな値のデータを次第に端のほうに移していく。



![バブルソート1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バブルソート1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![バブルソート2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バブルソート2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

 

![バブルソート3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バブルソート3.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![バブルソート4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バブルソート4.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![バブルソート5](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バブルソート5.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![バブルソート6](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/バブルソート6.gif)

<br>

### 基本挿入法 (挿入ソート) 

既に整列済みのデータ列の正しい位置に、データを追加する操作を繰り返していく。



<br>

### ヒープソート

<br>

### シェルソート

<br>

## 02. 配列内探索のアルゴリズム

### 線形探索法

今回は、配列内で『６』を探す。



![線形探索法1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/線形探索法1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![線形探索法2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/線形探索法2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![線形探索法3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/線形探索法3.gif)

### 二分探索法

前提として、ソートによって、すでにデータが整列させられているとする。

今回は、配列内で『```6```』を探す。



![二分探索法1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索法1.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![二分探索法2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索法2.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![二分探索法3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索法3.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![二分探索法4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索法4.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![二分探索法5](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索法5.gif)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![二分探索法6](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/二分探索法6.gif)

<br>

## 03. グラフ探索のアルゴリズム (難し過ぎで記入途中) 

### ダイクストラ法による最良優先探索

**＊実装例＊**

![経路図](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/経路図.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

地点間の距離を表で表す。ただし、同地点間の距離は『0』、隣り合わない地点間の距離は『-1』とする。

![ダイクストラ法_距離テーブル](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_距離テーブル.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)


```php
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

```php
<?php
// 各地点間の距離、出発地点、開始地点を引数にとる。
function bestFirstSearchByDijkstra(
    array $matrix,
    int $startPoint,
    int $goalPoint
)
{
    // 地点数を定数で定義
    define("POINT_NUMBER", count($matrix));
    
    if($startPoint < self::POINT_NUMBER
        || self::POINT_NUMBER < $goalPoint){
            throw new Exception("存在しない地点番号は設定できません。");
    }
    
    // 出発地点を定数で定義
    define("START_POINT", $startPoint);
    
    // 到着地点を定数で定義
    define("GOAL_POINT", $goalPoint));
    
    // 無限大の定数のINFを使いたいが、定数は上書きできないため、代わりに-1を使用。
    // 各頂点に対して、最短ルート地点番号、地点間距離の初期値、最短距離確定フラグを設定。
    for($i = 0; $i < self::POINT_NUMBER; $i ++){
        $route[$i] = -1;
        $distance[$i] = -1;
        $fixFlg[$i] = false;
        }
        
    // ＊別の書き方＊
    // $cost = array_fill(0, self::POINT_NUMBER, -1);
    // $distance = array_fill(0, self::POINT_NUMBER, -1);
    // $fix = array_fill(0, self::POINT_NUMBER, false);
    
    // 出発地点から出発地点への距離をゼロとする。
    $distance[self::START_POINT] = 0;
    
    // 
    while(true){
        $i = 0;
        
        while($i < self::POINT_NUMBER){
            if(!$fixFlg[$i]){
                break 1;
            }
            $i += 1;
        }
        
        if($i === self::POINT_NUMBER){
            break 1;
        }
        
        for($j = $i + 1; j < self::POINT_NUMBER; $j ++){
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

とした時、出発地点 (0) から1ステップ行ける地点までの距離 (pDist) を取得し、確定させる。



![最短経路探索処理ループ_1回目](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/最短経路探索処理ループ_1回目.png)

![最短経路探索処理ループ_2回目](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/最短経路探索処理ループ_2回目.png)

![最短経路探索処理ループ_3回目](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/最短経路探索処理ループ_3回目.png)

![最短経路探索処理ループ_4-6回目](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/最短経路探索処理ループ_4-6回目.png)

![最短経路探索処理ループ_7回目](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/最短経路探索処理ループ_7回目.png)

**＊アルゴリズム解説＊**

正のコストの経路のみの場合、使用される方法。



![ダイクストラ法_01](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_01.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_02](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_02.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_03](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_03.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_04](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_04.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_05](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_05.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_06](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_06.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_07](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_07.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_08](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_08.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_10](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_10.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_11](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_11.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_12](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_12.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_14](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_14.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_16](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_16.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_17](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_17.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_18](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_18.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_19](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_19.png)

![矢印_80x82](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/矢印_80x82.jpg)

![ダイクストラ法_20](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ダイクストラ法_20.png)

<br>

## 04. 誤り検出と訂正のアルゴリズム

### Check Digit Check

バーコードやクレジットカードなどの読み取りチェックで使われている誤り検出方法。



```【１】```

:    Check Digitを算出する。

```【２】```

:    算出されたCheck Digitが正しいかを検証する。

![チェックディジット](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/チェックディジット.gif)

<br>

### Parity Check

<br>

### CRC：Cyclic Redundancy Check (巡回冗長検査) 



