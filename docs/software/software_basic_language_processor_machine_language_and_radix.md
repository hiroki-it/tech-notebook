---
title: 【IT技術の知見】機械語と進数
description: 機械語と進数の知見を記録しています。
tags:
  - "OS"
  - "言語プロセッサ"
---

# 機械語と進数

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. 機械語と 2 進数の関係

### 機械語とは

あらゆる情報を『0』と『1』の 2 進数を機械語として、CPU に対して、命令が実行される。

![binary_cpu](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/binary_cpu.jpg)

<br>

### さまざまな進数と bit の関係

しかし、人間が扱ううえでは `8` 進数あるいは `16` 進数に変換して表すことが適している。

`2` 進数 1 ケタが『`1`bit』と定義されている。

`8` 進数の 1 ケタは `2` 進数の 3 ケタ (=`3`bit) に相当し、`16` 進数の 1 ケタは `2` 進数の 4 ケタ (`4`bit) に相当する。

![bit_byte](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/bit_byte.png)

![radix_table](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/radix_table.png)

<br>

### なぜ８bit を 1Byte とするのか？ (半角英数字と bit の関係)

`8`bit を一区切りとして、`1`Byte と表す。

これは、半角英数字一文字が８bit のデータサイズを持つからである。

![one-byte-per-alphanumeric](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/one-byte-per-alphanumeric.png)

<br>

### Byte 単位

1000 Byte = 1k Byte

> - https://www.amazon.co.jp/dp/4297124513

![p106](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p106.png)

<br>

### 一般的な CPU が扱える情報の種数

CPU では、各データは 2 進法によって区別されている。CPU は 4 、8、16、32-bit バージョンと進歩し、2008 年の後半からは 64-bit バージョンの CPU が普及し始めた。1-bit は 2 種類の情報を表せるため、32-bit の CPU では 2^32、64-bit では 2^64 の種類の情報を扱える。

<br>

## 01-02. 機械語命令の種類

### 設定命令

#### ▼ 実効アドレスをレジスタに設定する場合

実効アドレスの値そのものがレジスタの内容になり、メモリの番地は参照しない。

![addressing_effective-address-to-register](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/addressing_effective-address-to-register.jpg)

#### ▼ 実効アドレスが指す語の内容をレジスタに設定する場合

実効アドレスをメモリの番地として扱い、その番地に格納された語の内容がレジスタに設定される。

![addressing_effective-address-word-to-register](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/addressing_effective-address-word-to-register.jpg)

#### ▼ レジスタの内容を実効アドレスに格納する場合

設定命令とは逆向きに、レジスタの内容が実効アドレスの指す番地に書き込まれる。

![addressing_register-content-to-effective-address](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/addressing_register-content-to-effective-address.jpg)

<br>

### シフト命令

<br>

### 計算命令

レジスタから取り出した値を別の値と足し、その結果を元のレジスタに設定すること。

<br>

### 論理演算命令

<br>

## 01-03. シフト命令

### 論理左シフト

最上位に正負を表す『符号 bit』を設定せずに、シフトを実行する。

２進数の場合…

左に `1`bit シフトすると『2 倍』

左に `1`bit シフトし、元の値を足すと『3 倍』

左に `2`bit シフトすると『4 倍』

左に `2`bit シフトし、元の値を足すと『5 倍』

左に `2`bit シフトし、元の値を足して『5 倍』。

加えて `2`bit シフトすると『10 倍』

左に `3`bit シフトすると『8 倍』

#### ▼ 正の数の場合

00011100

![shift_positive_logical-left](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_positive_logical-left.jpg)

#### ▼ 負の数の場合

11100100

![shift_negative_logical-left](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_negative_logical-left.png)

<br>

### 論理右シフト

最上位に正負を表す『符号 bit』を設定せずに、シフトを実行する。

２進数の場合…

右に `1`bit シフトすると『1/2』

右に `2`bit シフトすると『1/4』

右に `3`bit シフトすると『1/8』

#### ▼ 正の数の場合

00011100

![shift_positive_logical-right](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_positive_logical-right.jpg)

#### ▼ 負の数の場合 (計算はできない)

11100100

負の数で論理右シフトを実行する場合、間違った計算が行われてしまう。

こういう場合、算術シフトが使用される。

![shift_negative_logical-right](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_negative_logical-right.png)

### 算術左シフト

最上位に正負を表す『符号 bit』を設定し、シフトを実行する。

２進数の場合…

左に `1`bit シフトすると『2 倍』

左に `1`bit シフトし、元の値を足すと『3 倍』

左に `2`bit シフトすると『4 倍』

左に `2`bit シフトし、元の値を足すと『5 倍』

左に `2`bit シフトし、元の値を足して『5 倍』。

加えて `2`bit シフトすると『10 倍』

左に `3`bit シフトすると『8 倍』

#### ▼ 正の数の場合

00011100

![shift_positive_arithmetic-left](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_positive_arithmetic-left.png)

#### ▼ 負の数の場合

00011100

![shift_negative_arithmetic-left](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_negative_arithmetic-left.png)

<br>

### 算術右シフト

２進数の場合…

最上位に正負を表す『符号 bit』を設定し、シフトを実行する。

右に `1`bit シフトすると『1/2』

右に `2`bit シフトすると『1/4』

右に `3`bit シフトすると『1/8』

#### ▼ 正の数の場合

00011100

![shift_positive_arithmetic-right](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_positive_arithmetic-right.png)

#### ▼ 負の数の場合

符号 bit をシフトせずに残し、空いた bit に符号 bit と同じ `1` を入れるため、負の数でも `-28` が `-14` になり、正しく『1/2』を計算できる。

![shift_negative_arithmetic-right](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/shift_negative_arithmetic-right.png)

<br>

## 01-04. 機械語命令の実行手順

### 実行手順

![machine-instruction_execution](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/machine-instruction_execution.jpg)

1. 16 進数が 2 進数に変換され、記号へ値が割り当てられる。 (ビット分割)

2. 記号の値を基に、実効アドレスの計算方法が選択され、実行される。 (実効アドレスの計算)

3. 実効アドレスを基に、機械語命令が実行され、値がレジスタやメモリに書き留められる。 (機械語命令のトレース)

<br>

### `(1)`

: ビット分割

命令：20B3h

#### ▼ 16 進数の 2 進数への変換

命令の `20B3h` を 2 進数の `0010 0000 1011 0011` に変換すると、左から区切った bit の並びが命令の種類やレジスタの番号を表す。

![machine-instruction_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/machine-instruction_structure.gif)

#### ▼ 記号への値の割り当て

2 進数にした命令を命令語の形式に沿って OP、R、X、F、I の記号に割り当てることで、実効アドレスの計算方法を選ぶための値が決まる。

![machine-instruction_fetch](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/machine-instruction_fetch.gif)

<br>

### `(2)`

: 実効アドレスの計算

#### ▼ 実効アドレスの計算方法の選択

『X=2』、『I = 1』より、表の網掛けの計算式を選択。

![effective-address_formula](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/effective-address_formula.gif)

#### ▼ 実効アドレスの計算の実行

ここに、レジスタ番号と内容の表を張る。

(実効アドレス) = [adr + [X] ]

= [1000h + [レジスタ 2] ] (※配列のように、レジスタ 2 の値を参照)

= [1000h + 0002h]

= [1002h]

= 1003h

<br>

### `(3)`

: 機械語命令のトレース

<br>

## 01-05. 構文解析における数式の認識方法

### 逆ポーランド表記法 (後置表記法)

演算子 (例：`+`、`-`、`×`、`÷` など) を被演算子 (数値や変数、また計算の結果) の後ろに書くことにより、数式を表す方法。

補足として、人間が使用している表記方法は、『中置記法』という。

`Y = ( A + B ) × ( C － ( D ÷ E ) )`

1. 括弧は先に計算するので塊と見なす。

    `( A + B )` ⇒ `AB+`

2. 括弧は先に計算するので塊と見なす。

    `( D ÷ E )` ⇒ `DE ÷`

3. 括弧は先に計算するので塊と見なす。

    `( AB + ) × ( C - DE ÷ )` ⇒ `(AB +) (CDE÷-) ×`

4. 括弧を外しても、塊はそのまま。

    `(AB+) (CDE÷-) ×` ⇒ `AB+CDE÷－×`

5. 左辺と右辺をそれぞれ塊と見なす。

Y = `AB+CDE÷-×` ⇒ `YAB+CDE÷-×=`

<br>

## 01-06. CPU における小数の処理方法

### 固定小数点数

『この位置に小数点がある』な前提で数字を扱うことによって、小数点を含む数値を表す方法。

CPU は、数値に対し、特定の位置に小数点を打つ。

### 浮動小数点数

指数表記を使用することによって、小数点を含む数値を表す方法。

#### ▼ 正規化した数式から浮動小数点数への変換

正規化した数式の符号、指数、仮数をそれぞれ決まったルールで変換し、32 bit の符号部、指数部、仮数部に順に並べると浮動小数点数になる。

![floating-point_normalized-formula-to-floating-point](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/floating-point_normalized-formula-to-floating-point.png)

#### ▼ 浮動小数点数から正規化した数式への変換

指数部と仮数部を調節し、できるだけ仮数部の上位桁へ 0 が入らないようにして、誤差を少なくすること。例えば、ある計算の結果が `0.012345×10^-3` だった場合、仮数部を 0.1～1 の範囲に収めるため、`0.12345×10^-4` に変更する。

![floating-point_floating-point-to-normalized-formula](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/floating-point_floating-point-to-normalized-formula.png)

<br>

## 01-07. 誤差

『誤差』：実際の数値と CPU が表現できる数値の間に生じるズレのこと。

### 無限小数

10 進数の `0.1` のように 2 進数で割り切れない無限小数は、限られた bit 数に収まらない分だけ実際の数値とズレが生じる。

> - https://www.amazon.co.jp/dp/4297124513

![p067-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p067-1.png)

<br>

### 桁溢れ誤差

初代ドラクエ

初代ドラゴンクエストにおける経験値の上限は『`65535`』だった。

これは、経験値が 16bit (2 Byte) で表されており、桁溢れが起きることを防ぐために `65535` 以上は計算しないようになっていた。

> - https://www.amazon.co.jp/dp/4297124513

![p068](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p068.png)

<br>

### 情報落ち

絶対値の大きい数と小さい数を足し引きすると、指数をそろえる時に小さい数の桁が仮数部からはみ出し、計算結果に反映されなくなる。

> - https://www.amazon.co.jp/dp/4297124513

![p069](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p069.png)

<br>

### 打切り誤差

円周率は、途中で計算を打ち切る。

> - https://www.amazon.co.jp/dp/4297124513

![p070-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p070-1.png)

<br>

### 桁落ち

値の近い数どうしで引き算すると有効桁数が減り、正規化で補われた `0` の桁が元の数値として信用できなくなる。

> - https://www.amazon.co.jp/dp/4297124513

![p070-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p070-2.png)

<br>

### 丸め誤差

仮数部に入りきらない桁を切り捨てなどで丸めると、捨てた桁の分だけ実際の数値とズレが生じる。

> - https://www.amazon.co.jp/dp/4297124513

![p071](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/p071.png)

<br>

## 02. N 進数 ➔ 10 進数 (重み掛けを実行する)

### 16 進数 ➔ 10 進数

#### ▼ 整数

**＊例＊**『CA125』

1. 『`(16^0 × 5) + (16^1 × 2) + (16^2 × 1) + (16^3 × A) + (16^4 × C)`』というように、下の位から、順に 16^N をかけていく。 (A と C は、10 進数に変換して『10』と『12』)

2. `(1×5) + (16×2) + (256×1) + (4096×10) + (65536×12) = 827685`

#### ▼ 小数

<br>

### 2 進数 ➔ 10 進数

#### ▼ 整数

『`1101101`』

1. 『`(2^0 × 1) + (2^1 × 0) + (2^2 × 1) + (2^3 × 1) + (2^4 × 0) + (2^5 × 1) + (2^6 × 1)`』というように、下の位から、順に 2^N をかけていく。

#### ▼ 小数

<br>

## 02-02. 10 進数 ➔ N 進数 (N で割り続ける)

### 10 進数 ➔ 16 進数

#### ▼ 整数

**＊例＊**『27』

1. `27` を `16` で割り続ける。

2. 16 進数で 10～15 は、A～F で表記されるため、`11` を B で表記。

3. 余りを並べ、答えは『1B』

    ![radix_decimal-to-hexadecimal](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/radix_decimal-to-hexadecimal.gif)

#### ▼ 小数

**＊例＊**『0.1015625』

1. 『`0.1015625`』に `16` をかけ、整数部分を取り出す。 (`0.1015625 × 16 = 1.625`。『`1`』を取り出し、16 進数に変換して『`1`』)

2. 計算結果の小数部分に 16 を加えてかける。小数部分が 0 になるまで、これを繰り返す。 (`0.625 × 16 = 10.0` より、『`10`』を取り出し、16 進数に変換して『A』)

3. 小数部分が 0 になったため、取り出した数を順に並べ、答えは『0.1A』

<br>

### 10 進数 ➔ 2 進数

#### ▼ 整数

**＊例＊**『109』

![radix_decimal-to-binary](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/radix_decimal-to-binary.gif)

#### ▼ 小数

  <br>

## 02-03. X 進数 ➔ 10 進数 ➔ Y 進数

一度、10 進数に変換してから、任意の進数に変換する。

### 16 進数 ➔ 2 進数

#### ▼ 整数

**＊例＊**『`20B3`』

1. 2、0、B、3 を 10 進数に変換して、『`(16^0 × 3) + (16^1 × 11)  + (16^2 × 0) + (16^3 × 2) = 8371`』

2. 10 と 15 を 2 進数に変換して、『`0010`』、『`0000`』、『`1011`』、『`0011`』

3. よって、AF は 10 進法に変換して『`0010000010110011`』

<br>

## 02-04. X 進数 ➔ 10 進数 ➔ Y 進数 ➔ 10 進数

### 16 進数 ➔ 2 進数

#### ▼ 小数

`2A.4C`

1. 整数部分の `2A` を 10 進数に変換して、

2. 42 を 2 進数に変換して、『`101010`』。また、余り計算のとき、余り１を `2^N` に直しておく。

3. 整数の場合、下位の桁から、『`(2^0 × 0) + (2^1 × 1) + (2^2 × 0) + (2^3 × 1) + (2^4 × 0) + (2^5 × 1) + (2^6 × 0) + (2^7 × 0) + (2^8 × 0)`』

    =『`2^5+2^3+2^1`』

    (※16進数からの変換の場合、101010は、00101010として扱うことに注意)

4. 76 を 2 進数に変換して、『1001100』。また、余り計算のとき、余り１を 2^N に直しておく。

5. 小数部分の場合、上位の桁から、『`(2^－1 × 0) + (2^－2 × 1) + (2^－3 × 0) + (2^－4 × 0) + (2^－5 × 1) + (2^－6 × 1)  + (2^－7 × 0) + (2^－8 × 0)`』

    =『`2^-2+2^－5+2^-6`』

    (※16進数からの変換の場合、1001100は、01001100として扱うことに注意)

6. したがって、『`2^5+2^3+2^1+2^-2+2^-5+2^-6`』

<br>

## 03. 論理回路

### 論理式

![logic-operation_list](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-operation_list.png)

以下のベン図では、集合 A と集合 B は入力が『`1`』の場合、外側は入力が『`0`』の場合を表している。

演算方法を思い出すときには、ベン図を思い出せ。

<br>

### 否定回路 (NOT 回路) 、NOT 演算、ベン図

丸い記号が否定を表す。

![logic-circuit_not_bit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_not_bit.png)

![logic-circuit_not](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_not.png)

<br>

### 論理積回路 (AND 回路) 、AND 演算、ベン図

`2` 個の bit を比較して、どちらも『`1`』なら『`1`』を出力。

![logic-circuit_and_bit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_and_bit.png)

![logic-circuit_and](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_and.png)

<br>

### 否定論理積回路 (NAND 回路) 、NAND 演算、ベン図

`2` 個の bit を比較して、どちらも『`1`』なら『`0`』を出力。

ベン図では両方が『`1`』以外の場合を指しているが、回路の出力をうまく説明できない…。

![logic-circuit_nand_bit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_nand_bit.png)

![logic-circuit_nand](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_nand.png)

<br>

### 論理和回路 (OR 回路) 、OR 演算、ベン図

`2` 個の bit を比較して、どちらかが『`1`』なら『`1`』を出力。

![logic-circuit_or_bit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_or_bit.png)

![logic-circuit_or](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_or.png)

<br>

### 排他的論理和回路 (EOR 回路/XOR 回路) 、EOR 演算、ベン図

`2` 個の bit を比較して、どちらかだけが『`1`』なら『`1`』を出力。

![logic-circuit_xor_bit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_xor_bit.png)

![logic-circuit_xor](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_xor.png)

<br>

### 否定論理和回路 (NOR 回路) 、NOR 演算、ベン図

`2` 個の bit を比較して、どちらも『`0`』なら『`1`』を出力。

![logic-circuit_nor_bit](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_nor_bit.png)

![logic-circuit_nor](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-circuit_nor.png)

<br>

### フリップフロップ回路

わかりやすい動画解説：https://www.youtube.com/watch?v=4vAGaWyGanU

SRAM の電子回路に使用している (6 章を参照) 。

Set 側に初期値『`1`』が入力される。

入力を『`0`』に変えても、両方の出力結果は変わらず、安定している。

![flip-flop-circuit_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/flip-flop-circuit_2.png)

Reset 側に『1』を入力すると、両方の出力結果は変化する。

![flip-flop-circuit_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/flip-flop-circuit_3.png)

<br>

## 03-02. 論理演算命令

### 論理積

**＊例題＊**

16 進数の『F』は、2 進数で『`0000 0000 0000 1111`』で表す。

よって、000F を使用して AND 演算した場合、下位 4 桁を変化させずに取り出せる。

```
1100 1101 1111 1000
0000 0000 0000 1111
ーーーーーーーーーーー
0000 0000 0000 1000
```

> - [過去問解説：シフト演算と論理演算＜基本情報技術者試験＞ \| 独学で合格できる☆基本情報技術者試験](https://ameblo.jp/kou05/entry-10883110086.html)

**＊例題＊**

16 進数の『7F』は、2 進数で『`0000 0000 0111 1111`』で表す。

よって、7F を使用して AND 演算した場合、下位 7 桁を変化させずに取り出せる。

```
1100 1101 1111 1000
0000 0000 0111 1111
ーーーーーーーーーーー
0000 0000 0111 1000
```

**＊例題＊**

![logic-operation_and](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-operation_and.jpg)

<br>

### 否定論理積

<br>

### 論理和

実効アドレスの値とレジスタの内容を bit ごとに OR 演算し、どちらかが `1` の bit を `1` とした結果がレジスタに格納される。

![logic-operation_or](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-operation_or.jpg)

<br>

### 排他的論理和

実効アドレスの値とレジスタの内容を bit ごとに EOR 演算し、値が異なる bit だけを `1` とした結果がレジスタに格納される。

![logic-operation_xor](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/software/logic-operation_xor.jpg)

<br>

### 否定論理和

**＊例題＊**

X と Y の否定論理積 X NAND Y は、NOT(X AND Y)として定義される。

X OR Y を NAND のみを使用して表した論理式はどれか。

`X=0`、`Y=0` のときに X OR Y が『`0`』になることから、『`0`』になる選択肢を探す。

#### ▼ ((X NAND Y) NAND X) NAND Y

```mathematica
((0 NAND 0)NAND 0)NAND 0
=(1 NAND 0) NAND 0
=1 NAND 0
=1
```

#### ▼ (X NAND X) NAND (Y NAND Y)

```mathematica
(0 NAND 0)NAND(0 NAND 0)
=1 NAND 1
=0
```

#### ▼ (X NAND Y) NAND (X NAND Y)

```mathematica
(0 NAND 0)NAND(0 NAND 0)
=1 NAND 1
=0
```

#### ▼ X NAND (Y NAND (X NAND Y))

```mathematica
0 NAND(0 NAND(0 NAND 0))
=0 NAND (0 NAND 1)
=0 NAND 1
=1
```

<br>
