---
title: 【IT技術の知見】メモリ＠ハードウェア
description: メモリ＠ハードウェアの知見を記録しています。
---

# メモリ＠ハードウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. メインメモリ（主記憶装置）

### DRAM：Dynamic RAM

#### ▼ DRAMとは

メインメモリとして使用される。データを保管できる揮発的な記憶装置のこと。

![Dynamic RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Dynamic_RAM.jpg)


<br>

### Mask ROM

#### ▼ Mask ROMとは

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p164-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p164-1.png)

<br>

### Programmable ROM

#### ▼ Programmable ROMとは

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p164-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p164-2.png)

<br>

### ガベージコレクション

#### ▼ ガベージコレクションとは

プログラムが確保したメモリ領域のうち、不要になった領域を自動的に解放する機能。

#### ▼ Javaの場合

Javaでは、JVM：Java Virtual Machine（Java仮想マシン）が、メモリ領域をオブジェクトに自動的に割り当て、また一方で、不要になったメモリ領域の解放を行う。一方で自動的に行う。

<br>

## 02. キャッシュメモリ

### キャッシュメモリとは

#### ▼ 一次キャッシュメモリと二次キャッシュメモリ

CPUとメインメモリの間に、キャッシュメモリを何段階か設置し、CPUとメインメモリの間の読み出しと書き込みの処理速度の差を緩和させる。

![メモリキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリキャッシュ.gif)

実際に、タスクマネージャのパフォーマンスタブで、n次キャッシュメモリがどのくらい使われているのかを確認できる。

![キャッシュメモリの実例](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/キャッシュメモリの実例.png)

<br>

### キャッシュメモリの仕組み

#### ▼ 一度目

ユーザー ➔ メインメモリ ➔ 二次キャッシュメモリ ➔ 一次キャッシュメモリの順で、データがやり取りされる。

（１）ユーザーが、パソコンに対して命令を与える。

（２）CPUは、命令をメインメモリに書き込む。

（３）CPUは、メインメモリから命令を読み出す。

（４）CPUは、二次キャッシュメモリに書き込む。

（５）CPUは、一次キャッシュメモリに書き込む。

（６）CPUは、命令を実行する。

![メモリとキャッシュメモリ_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリとキャッシュメモリ_1.jpg)

#### ▼ 二度目

![メモリとキャッシュメモリ_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリとキャッシュメモリ_2.jpg)

<br>

### キャッシュメモリへの書き込み方式の種類

#### ▼ Write-throught方式

CPUは、命令をメインメモリとキャッシュメモリの両方に書き込む。常にメインメモリとキャッシュメモリの内容が一致している状態を確保できるが、メモリへの書き込みが頻繁に行われるので遅い。

![Write-through方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Write-through方式.jpg)

#### ▼ Write-back方式

CPUは、キャッシュメモリのみに書き込む。次に、キャッシュメモリがメインメモリに書き込む。メインメモリとキャッシュメモリの内容が一致している状態を必ずしも確保できないが、メインメモリへの書き込み回数が少ないため速い

![Write-back方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Write-back方式.jpg)

<br>

### 実効アクセス時間

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p171-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p171-1.png)

<br>

### SRAM：Static RAM

#### ▼ SRAMとは

キャッシュメモリとして使用される。

![Static RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Static_RAM.jpg)

<br>

## 03. ディスクメモリ

### ディスクメモリとは

メインメモリとストレージの間に設置される。読み出しと書き込みの処理速度の差を緩和させる。

![ディスクキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ディスクキャッシュ.gif)

<br>

## 04. GPUとVRAM

GPUとVRAMのサイズによって、扱うことのできる解像度と色数が決まる。

![VRAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VRAM.jpg)

富士通PCのGPUとVRAMのサイズは、以下の通り。

![本パソコンのVRAMスペック](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/本パソコンのVRAMスペック.jpg)

色数によって、１ドット当たり何ビットを要するが異なる。

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

![p204](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p204.jpg)

<br>
