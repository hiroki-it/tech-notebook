# ハードウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. ハードウェア

### ハードウェアとは

システムのうちで、ソフトウェア（OS、ミドルウェア、アプリケーション）以外の要素のこと。

参考：https://thinkit.co.jp/article/11526

![software](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/software.png)

<br>

### 種類

参考：https://living-maou.com/computer-composition/

![hardware_computer_five-parts](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/hardware_computer_five-parts.png)

<br>

## 02. CPU：Central Processing Unit

### CPUとは

CPUは制御装置と演算装置からなる。CPUの制御部分は、プログラムの命令を解釈して、コンピュータ全体を制御。CPUの演算部分は、計算や演算処理を行う。特に、『**算術論理演算装置（ALU：Arithmetic and Logic Unit）**』とも呼ぶ。

<br>

### CPUの歴史（※2009年まで）

IntelとAMDにおけるCPUの歴史を以下に示す。

![IntelとAMDのCPUの歴史](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/IntelとAMDにおけるCPUの歴史.png)

<br>

### クロック周波数

#### ・クロック周波数とは

CPUの回路が処理と歩調を合わせるために用いる信号を、『クロック』と言う。一定時間ごとにクロックが起こる時、１秒間にクロックが何回起こるかを『クロック周波数』という。これは、Hzで表される。ちなみに、ワイのパソコンのクロック周波数は2.60GHzでした。

（例1）
```
3Hz
= 3 (クロック数/秒)
```
（例2）
```
2.6GHz
= 2.6×10^9  (クロック数/秒)
```
![クロック数比較](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/クロック数比較.png)

<br>

### MIPS：Million Instructions Per Second（×10^6 命令数/秒）

#### ・MIPSとは

CPUが1秒間に何回命令を実行するかを表す。

（例題）

```
(命令当たりの平均クロック数) 
= (4×0.3)＋(8×0.6)＋(10×0.1) = 7

(クロック周波数) ÷ (クロック当たりの命令数)
= 700Hz (×10^6 クロック数/秒) ÷ 7 (クロック数/命令) 
= 100 (×10^6 命令数/秒)
```

![MIPSの例題](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/MIPSの例題.png)

1命令当たりの実行時間 (秒/命令) の求め方は以下の通り。

```
1 ÷ 100 (×10^6 命令/秒) = 10n (秒/命令)
```

<br>

## 03. メインメモリ（主記憶装置）

### DRAM：Dynamic RAM

#### ・DRAMとは

  メインメモリとして用いられる。よく見るやつ。

![Dynamic RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Dynamic RAM.jpg)

<br>

### Mask ROM

#### ・Mask ROMとは

![p164-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p164-1.png)

<br>

### Programmable ROM

#### ・Programmable ROM

![p164-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p164-2.png)

<br>

### ガベージコレクション

#### ・ガベージコレクションとは

プログラムが確保したメモリ領域のうち、不要になった領域を自動的に解放する機能。

#### ・Javaの場合

Javaでは、JVM：Java Virtual Machine（Java仮想マシン）が、メモリ領域をオブジェクトに自動的に割り当て、また一方で、不要になったメモリ領域の解放を行う。一方で自動的に行う。

<br>

## 04. キャッシュメモリ

### キャッシュメモリとは

#### ・一次キャッシュメモリと二次キャッシュメモリ

  CPUとメインメモリの間に、キャッシュメモリを何段階か設置し、CPUとメインメモリの間の読み込みと書き出しの処理速度の差を緩和させる。

![メモリキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリキャッシュ.gif)

実際に、タスクマネージャのパフォーマンスタブで、n次キャッシュメモリがどのくらい使われているのかを確認できる。

![キャッシュメモリの実例](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/キャッシュメモリの実例.png)

<br>

### 仕組み

#### ・一度目

ユーザー ➔ メインメモリ ➔ 二次キャッシュメモリ ➔ 一次キャッシュメモリの順で、データがやり取りされる。

1. ユーザーが、パソコンに対して命令を与える。
2. CPUは、命令をメインメモリに書き込む。
3. CPUは、メインメモリから命令を読み出す。
4. CPUは、二次キャッシュメモリに書き込む。
5. CPUは、一次キャッシュメモリに書き込む。
6. CPUは、命令を実行する。

![メモリとキャッシュメモリ_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリとキャッシュメモリ_1.jpg)

#### ・二度目

![メモリとキャッシュメモリ_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリとキャッシュメモリ_2.jpg)

<br>

### キャッシュメモリへの書き込み方式の種類

#### ・Write-throught方式

  CPUは、命令をメインメモリとキャッシュメモリの両方に書き込む。常にメインメモリとキャッシュメモリの内容が一致している状態を確保できるが、メモリへの書き込みが頻繁に行われるので遅い。

![Write-through方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Write-through方式.jpg)

#### ・Write-back方式

  CPUは、キャッシュメモリのみに書き込む。次に、キャッシュメモリがメインメモリに書き込む。メインメモリとキャッシュメモリの内容が一致している状態を必ずしも確保できないが、メインメモリへの書き込み回数が少ないため速い

![Write-back方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Write-back方式.jpg)

<br>

### 実効アクセス時間

![p171-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p171-1.png)

<br>

### SRAM：Static RAM

#### ・SRAMとは

 キャッシュメモリとして用いられる。

![Static RAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/Static RAM.jpg)

<br>

## 05. ディスクメモリ

### ディスクメモリとは

メインメモリとストレージの間に設置される。読み込みと書き出しの処理速度の差を緩和させる。

![ディスクキャッシュ](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ディスクキャッシュ.gif)

## 06. 補助記憶装置

<br>

## 06-02. SSD

<br>

## 06-03. HDD：Hard Disk Drive

### デフラグメンテーション

断片化されたデータ領域を整理整頓する。

![p184-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p184-1.png)

![p184-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p184-2.png)

<br>

### RAID：Redundant Arrays of Inexpensive Disks

複数のHDDを仮想的に1つのHDDであるかのようにして、データを管理する技術。

#### ・RAID0（Striping）

  データを、複数のHDDに分割して書き込む。

#### ・RAID1（Mirroring）

  データを、複数のHDDに同じように書き込む。

#### ・RAID5（Striping with parity）

  データとパリティ（誤り訂正符号）を、3つ以上のHDDに書き込む。

![RAIDの種類](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/RAIDの種類.png)

<br>

## 07. GPUとVRAM

GPUとVRAMの容量によって、扱うことのできる解像度と色数が決まる。

![VRAM](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/VRAM.jpg)

富士通PCのGPUとVRAMの容量は、以下の通り。

![本パソコンのVRAMスペック](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/本パソコンのVRAMスペック.jpg)

色数によって、１ドット当たり何ビットを要するが異なる。

![p204](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p204.jpg)

