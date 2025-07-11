---
title: 【IT技術の知見】メモリ管理＠Linuxカーネル
description: メモリ管理＠Linuxカーネルの知見を記録しています。
---

# メモリ管理＠Linuxカーネル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. メモリ管理の種類

メモリ管理は、物理メモリと仮想メモリで管理方式がある。

![アドレス空間管理の種類](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/アドレス空間管理の種類.png)

> - https://itmanabi.com/real-memory-mng/

<br>

## 01-02. 物理メモリの管理方式

### 固定区画方式 (同じ大きさの区画に分割する方式)

#### ▼ 単一区画方式とは

物理メモリのアドレス空間を`1`個の区画として扱い、プロセスに割り当てる。

単一のプロセスしか読み込めず、物理メモリの余ったアドレス空間は利用できない。

![単一区画方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/単一区画方式.png)

> - https://basics.k-labo.work/2017/10/20/%E8%A8%98%E6%86%B6%E7%AE%A1%E7%90%86/

#### ▼ 多重区画方式とは

物理メモリのアドレス空間を複数の同じ大きさの区画に分割し、各区画にプロセスに割り当てる。

複数のプロセスを読み込めるが、単一区画方式と同様に、物理メモリの余ったアドレス空間は利用できない。

![多重区画方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/多重区画方式.png)

> - https://basics.k-labo.work/2017/10/20/%E8%A8%98%E6%86%B6%E7%AE%A1%E7%90%86/

<br>

### 可変区画方式 (さまざまな大きさの区画に分割する方式)

#### ▼ 可変区画方式とは

物理メモリのアドレス空間を、プロセスの大きさに応じたさまざまな区画に分割し、プロセスに割り当てる。

固定区画方式とは異なり、物理メモリのアドレス空間を有効に利用できる。

![可変区画方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/可変区画方式.png)

> - https://basics.k-labo.work/2017/10/20/%E8%A8%98%E6%86%B6%E7%AE%A1%E7%90%86/

<br>

### スワッピング方式

#### ▼ スワッピング方式とは

物理メモリのアドレス空間の区画を優先度の高いプロセスに割り当て、反対に優先度が低いプロセスはストレージ上のスワップファイルに退避させる。

これにより、物理メモリのアドレス空間を確保できる。

![スワッピング方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/スワッピング方式.png)

> - https://itmanabi.com/real-memory-mng/
> - https://www.sophia-it.com/content/%E3%82%B9%E3%83%AF%E3%83%83%E3%83%97

#### ▼ スワップファイル

ストレージ上に作成された仮想的な領域であり、仮想メモリのように動作する。

<br>

### オーバーレイ方式

#### ▼ オーバーレイ方式とは

<br>

### GC：ガベージコレクション

#### ▼ ガベージコレクションとは

確保された物理メモリのうち、解放できるメモリをプロセスから解放する。

物理メモリを使用しているオブジェクトが何かしらから参照されているか否かを元に、解放するか否かを判定する。

> - https://geechs-job.com/tips/details/35

#### ▼ メモリリーク

ガベージコレクションが正しく機能しないと、メモリ上に解放忘れのプロセスが放置されていく。

不要になったプロセスがメモリを消費し続ける現象を『メモリリーク』という。

メトリクスを見ると、メモリ使用量が少しずつ増えていく現象が起こる。

> - https://geechs-job.com/tips/details/35

#### ▼ アルゴリズム

ガベージコレクションにはさまざまなアルゴリズムがあり、採用されているアルゴリズムは言語ごとに異なる。

#### ▼ Javaの場合

Javaでは、JVM：Java Virtual Machine (Java仮想マシン) が、メモリ領域をオブジェクトに自動的に割り当てる。

また一方で、不要になったメモリ領域の解放を自動的に実行する。

メトリクスを見ると、メモリ使用量が急に下がる現象が起こる。

<br>

## 01-03. 仮想メモリの管理方式

### ページング方式

#### ▼ ページング方式とは

仮想メモリのアドレス空間を『固定長』の区画 (ページ) 、また物理メモリのアドレス空間を『固定長』の区画 (ページフレーム) に分割し、管理する。

![ページの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ページの構造.png)

> - http://uralowl.my.coocan.jp/unix/job/UNIX/kernel/memory.html

#### ▼ ページイン/ページアウト

仮想メモリは、CPUの処理によって稼働したプロセスの要求を、物理メモリの代理として受け付ける。

ストレージから物理メモリのページフレームにページを読み込むことを『Page-in』という。

また、物理メモリのページフレームからストレージにページを追い出すことを『Page-out』という。

![ページインとページアウト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ページインとページアウト.png)

> - https://www.amazon.co.jp/dp/4297124513

#### ▼ 仮想メモリとのマッピングによる大容量アドレス空間の実現

仮想メモリのアドレス空間を、物理メモリのアドレス空間とストレージにマッピングすることによって、物理メモリのアドレス空間を疑似的に大きく見せかけられる。

> - https://www.amazon.co.jp/dp/4297124513

![仮想メモリとのマッピングによる大容量アドレス空間の再現_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/仮想メモリとのマッピングによる大容量アドレス空間の再現_1.png)

補足として、富士通の仮想メモリのサイズは、以下の通り。

![仮想メモリのアドレス空間の容量設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/仮想メモリのアドレス空間の容量設定.png)

<br>

### セグメント方式

#### ▼ セグメント方式とは

仮想メモリの実装方法の一種。

仮想メモリのアドレス空間を『可変長』の区画 (セグメント) 、また物理メモリのアドレス空間を『可変長』の区画 (セグメント) に分割し、管理する。

<br>

### MMU：Memory Management Unit (メモリ管理ユニット)

#### ▼ MMUにおける動的アドレス変換機構

MMUによって、仮想メモリのアドレスは、物理メモリのアドレスに変換される。

この仕組みを、『動的アドレス変換機構』と呼ぶ。

> - https://www.amazon.co.jp/dp/4297124513

![メモリ管理ユニット](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/メモリ管理ユニット.png)

#### ▼ アドレス変換の仕組み (ページング方式型/セグメント方式型)

`(1)`

: 仮想メモリにおけるページの仮想アドレスを、ページ番号とページオフセットに分割する。

![ページの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ページの構造.png)

`(2)`

: ページテーブルを使用して、仮想アドレスのページ番号に対応する物理アドレスのページ番号を探す。

`(3)`

: 物理ページ番号にページオフセットを再結合し、物理メモリのページフレームの物理アドレスとする。

![仮想メモリとのマッピングによる大容量アドレス空間の再現_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/仮想メモリとのマッピングによる大容量アドレス空間の再現_3.png)

#### ▼ ページテーブルにおける仮想ページ番号と物理ページ番号の対応づけ

> - https://www.amazon.co.jp/dp/4297124513

![仮想メモリとのマッピングによる大容量アドレス空間の再現_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/仮想メモリとのマッピングによる大容量アドレス空間の再現_4.png)

<br>

## 02. アドレス空間のページフォールト

### ページフォールトとは

ストレージから物理メモリのアドレス空間への割り込み処理のこと。

CPUによって稼働したプロセスが、仮想メモリのアドレス空間のページにアクセスし、そのページが物理メモリのアドレス空間にマッピングされていなかった場合、ストレージから物理メモリのアドレス空間に『ページイン』が起こる。

![ページフォールト](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ページフォールト.png)

<br>

### Page Replacementアルゴリズム

ページアウトのアルゴリズムのこと。

方式ごとに、物理メモリのページフレームからストレージにページアウトするページが異なる。

#### ▼ 『FIFO方式：First In First Out』と『LIFO方式：Last In First Out』

> - https://www.amazon.co.jp/dp/4297124513

![p261-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p261-2.png)

![p261-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p261-3.png)

#### ▼ 『LRU方式：Least Recently Used』と『LFU方式：Least Frequently Used』

> - https://www.amazon.co.jp/dp/4297124513

![p261-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p261-1.png)

![p261-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/p261-4.png)

<br>

## 03. アドレス空間管理におけるプログラムの種類

### Reusable (再使用可能プログラム)

一度実行すれば、再び、ストレージから物理メモリにページインを行わずに、実行を繰り返せるプログラムのこと。

![再使用可能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/再使用可能.gif)

<br>

### Reentrant (再入可能プログラム)

再使用可能の性質をもち、また複数のプログラムから呼び出されても、互いの呼び出しが干渉せず、同時に実行できるプログラムのこと。

![再入可能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/再入可能.gif)

<br>

### Relocatable (再配置可能プログラム)

ストレージから物理メモリにページインを行う時に、アドレス空間上のどこに配置されても実行できるプログラムのこと。

![再配置可能](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/再配置可能.gif)

<br>
