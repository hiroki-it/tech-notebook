---
title: 【IT技術の知見】CPU＠ハードウェア
description: CPU＠ハードウェアの知見を記録しています。
---

# CPU＠ハードウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. CPU：Central Processing Unit

### CPUとは

CPUは制御装置と演算装置からなる。

CPUの制御部分は、プログラムの命令を解釈して、コンピュータ全体を制御。

CPUの演算部分は、計算や演算処理を行う。

特に、『**算術論理演算装置 (ALU：Arithmetic and Logic Unit) **』とも呼ぶ。

<br>

### CPUの歴史 (※2009年まで)

IntelとAMDにおけるCPUの歴史を以下に示す。

![IntelとAMDのCPUの歴史](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/IntelとAMDにおけるCPUの歴史.png)

<br>

### クロック周波数

#### ▼ クロック周波数とは

CPUの回路が処理と歩調を合わせるために使用する信号を、『クロック』と言う。

一定時間ごとにクロックが起こる時、`1`秒間にクロックが何回起こるかを『クロック周波数』という。

これは、Hzで表す。

補足として、ワイのパソコンのクロック周波数は`2.60` (GHz) でした。

**＊例＊**

```
3Hz
= 3 (クロック数/秒)
```

**＊例＊**

```
2.6GHz
= 2.6×10^9 (クロック数/秒)
```

![クロック数比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/クロック数比較.png)

<br>

### MIPS：Million Instructions Per Second (×10^6 命令数/秒)

#### ▼ MIPSとは

CPUが1秒間に何回命令を実行するかを表す。

(例題)

```mathematica
(命令当たりの平均クロック数)
= (4×0.3) + (8×0.6) + (10×0.1) = 7

(クロック周波数) ÷ (クロック当たりの命令数)
= 700Hz (×10^6 クロック数/秒) ÷ 7 (クロック数/命令)
= 100 (×10^6 命令数/秒)
```

![MIPSの例題](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/MIPSの例題.png)

1命令当たりの実行時間 (秒/命令) の求め方は以下の通り。

```
1 ÷ 100 (×10^6 命令/秒) = 10n (秒/命令)
```

<br>
