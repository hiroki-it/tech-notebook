---
title: 【知見を記録するサイト】メモリ管理＠基本ソフトウェア
description: メモリ管理＠基本ソフトウェアの知見をまとめました。
---

# メモリ管理＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. プロセス

### プロセスとは

プログラムは、メモリ上の仮想アドレスの領域に割り当てられている。プログラム自体を『プロセス』という。プロセスの代わりに『タスク』ということもある。プロセスとして割り当てられたプログラムはCPUに参照され、CPUのコア上で処理が実行される。

参考：https://jpazamu.com/thread_process/#index_id5

<br>

### 親/子プロセス

#### ▼ 親/子プロセスとは

プロセスが新しいプロセスを生成する場合、プロセス間には親子関係がある。例えば、ターミナルの親プロセスは```shell```や```bash```であり、任意のユーティリティを実行すると、これの子プロセスが生成されることになる。プロセスIDが```1```のプロセスが、全てのプロセスの親である。

参考：

- https://atmarkit.itmedia.co.jp/ait/articles/1706/23/news010_2.html
- https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_utility_shell.html

```bash
# MacOSの場合
$ ps -p 1

PID  TTY  TIME     CMD
  1  ??   9:23.33  /sbin/launchd
```

#### ▼ 同時処理できるリクエスト数

メモリ上には親の通信プロセスが割り当てられており、また1つのリクエストを処理するために、1つの子プロセスが割り当てられる。そのため、子プロセスの最大数は、同時に処理できるリクエストの最大数に相当する。

<br>

### プロセシングの種類

#### ▼ シングルプロセシング

単一のメモリ上で、単一のプロセスがアドレスに割り当てられる仕組みのこと。

#### ▼ マルチプロセシング

単一のメモリ上で、複数のプロセスがアドレスに割り当てられる仕組みのこと。優先度の低いプロセスからCPUを切り離し、優先度の高いプロセスにCPUを割り当てる、といった仕組みを持つ。現代のハードウェアのほとんどがマルチプロセシングの機能を持つ。

参考：https://linuxjf.osdn.jp/JFdocs/The-Linux-Kernel-5.html

![process](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/process.png)

<br>

### OOMキラー

#### ▼ OOMキラーとは

プログラムが、実メモリやスワップの全ての領域に割り当てられ、これ以上使用できるアドレス領域がなくなってしまった場合に実行される。最も使用領域の大きいプログラムを強制的に終了する。

参考：https://www.mk-mode.com/blog/2016/03/15/linux-control-oomkiller/

#### ▼ 確認方法

もしOOMキラーが実行された場合は、```/var/log/messages```ファイルにログが出力される。

参考：https://aegif.jp/alfresco/tech-info/-/20201119-alfresco/1.3

```bash
$ cat /var/log/messages | grep Kill

Jan  1 00:00:00 localhost kernel: Out of memory: Kill process 17143 (java) score 468 or sacrifice child
Jan  1 00:00:00 localhost kernel: Killed process 17143 (java), UID 1001, total-vm:7790724kB, anon-rss:4108910kB, file-rss:6822kB, shmem-rss:0kB
```

<br>

## 01-02. スレッド

### スレッドとは

メモリ上ではプログラムがプロセスとして割り当てられており、プログラムはCPUのコア上で実行される。CPUのコアと紐付くプロセスの実行単位を『スレッド』という。

参考：https://atmarkit.itmedia.co.jp/ait/articles/0503/12/news025.html

![thread](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/thread.png)

<br>

### スレッディングの種類

#### ▼ シングルスレッディング

メモリ上の特定のプロセスで、単一のスレッドを実行できる仕組みのこと。

#### ▼ マルチスレッディング

メモリ上の特定のプロセスで、複数のスレッドを実行できる仕組みのこと。各スレッドがプロセスに割り当てられているアドレスを共有して使用する。

![multi-thread](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/multi-thread.png)

<br>

### マルチスレッディングについて

#### ▼ 通常のマルチスレッド

CPUのコアが単一のスレッドが紐付くようなマルチスレッドのこと。

参考：https://milestone-of-se.nesuke.com/sv-basic/architecture/hyper-threading-smt/

![multithreading](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/multithreading.png)

#### ▼ 同時マルチスレッド

CPUのコアが複数のスレッドが紐付くようなマルチスレッドのこと。

参考：https://milestone-of-se.nesuke.com/sv-basic/architecture/hyper-threading-smt/

![simultaneous-multithreading](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/simultaneous-multithreading.png)

<br>



## 03. アドレス空間管理

### 前置き

言葉の使い方を、以下に統一する。

主記憶 ⇒ 物理メモリ（メインメモリ＋キャッシュメモリ）

補助記憶 ⇒ ストレージ

仮想記憶 ⇒ 仮想メモリ

![アドレス空間管理の種類](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/アドレス空間管理の種類.png)

<br>

### 管理方法の種類

#### ▼ 実メモリ管理

物理メモリの領域をプロセスに適切に割り当てること。

#### ▼ 仮想メモリ管理

仮想メモリの領域をプロセスに適切に割り当てること。

<br>

## 03-02. 実メモリ管理

### 固定区画方式（同じ大きさの区画に分割する方式）

#### ▼ 単一区画方式とは

物理メモリの領域を、1つの区画として扱い、プログラムに割り当てる方式。単一のプログラムしか読み込めず、余りのメモリ領域は利用できない。

![単一区画方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/単一区画方式.png)

#### ▼ 多重区画方式とは

物理メモリの領域を、複数の同じ大きさの区画に分割し、各区画にプログラムに割り当てる方式。複数のプログラムを読み込めるが、単一区画方式と同様に、余ったメモリ領域は利用できない。

![多重区画方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/多重区画方式.png)

<br>

### 可変区画方式（様々な大きさの区画に分割する方式）

#### ▼ 可変区画方式とは

物理メモリの領域を、プログラムの大きさに応じて、区画を様々な大きさの区画に分割し、プログラムに割り当てる方式。固定区画方式とは異なり、メモリ領域を有効に利用できる。

![可変区画方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/可変区画方式.png)

<br>

### スワッピング方式

#### ▼ スワッピング方式とは

![スワッピング方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スワッピング方式.png)

物理メモリの領域を、優先度の高いプログラムに割り当て、反対に優先度が低いプログラムはストレージに退避させる方式。

<br>

### オーバーレイ方式

#### ▼ オーバーレイ方式とは

<br>

### GC：ガベージコレクション

#### ▼ ガベージコレクションとは
確保された物理メモリのうち、解放できるメモリをプログラムから解放する。物理メモリを使用しているオブジェクトが何かしらから参照されているかどうかを元に、解放するかどうかを判定する。

#### ▼ アルゴリズム

ガベージコレクションには様々なアルゴリズムがあり、採用されているアルゴリズムは言語ごとに異なる。Goのガベージコレクションについては、以下のリンクを参考にせよ。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_application_language_go_logic_method_data.html

<br>

## 03-03. 仮想メモリ管理

### ページング方式

#### ▼ ページング方式とは

仮想メモリの実装方法の一種。仮想メモリのアドレス空間を『固定長』の領域（ページ）、また物理メモリのアドレス空間を『固定長』の領域（ページフレーム）に分割し、管理する方式。

![ページの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ページの構造.png)

#### ▼ ページイン/ページアウト

仮想メモリは、CPUの処理によって稼働したプログラムの要求を、物理メモリの代理として受け付ける。ストレージから物理メモリのページフレームにページを読み込むことを『Page-in』という。また、物理メモリのページフレームからストレージにページを追い出すことを『Page-out』という。

![ページインとページアウト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ページインとページアウト.png)

#### ▼ 仮想メモリとのマッピングによる大容量アドレス空間の実現

仮想メモリのアドレス空間を、物理メモリのアドレス空間とストレージにマッピングすることによって、物理メモリのアドレス空間を疑似的に大きく見せかけられる。

![仮想メモリとのマッピングによる大容量アドレス空間の再現_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想メモリとのマッピングによる大容量アドレス空間の再現_1.png)

ちなみに、富士通の仮想メモリのサイズは、以下の通り。

![仮想メモリのアドレス空間の容量設定](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想メモリのアドレス空間の容量設定.png)

<br>

### セグメント方式

#### ▼ セグメント方式とは

仮想メモリの実装方法の一種。仮想メモリのアドレス空間を『可変長』の領域（セグメント）、また物理メモリのアドレス空間を『可変長』の領域（セグメント）に分割し、管理する方式。

<br>

### MMU：Memory Management Unit（メモリ管理ユニット）

#### ▼ MMUにおける動的アドレス変換機構

MMUによって、仮想メモリのアドレスは、物理メモリのアドレスに変換される。この仕組みを、『動的アドレス変換機構』と呼ぶ。

![メモリ管理ユニット](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/メモリ管理ユニット.png)

#### ▼ アドレス変換の仕組み（ページング方式型/セグメント方式型）

1. 仮想メモリにおけるページの仮想アドレスを、ページ番号とページオフセットに分割する。

![ページの構造](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ページの構造.png)

2. ページテーブルを使用して、仮想アドレスのページ番号に対応する物理アドレスのページ番号を探す。
3. 物理ページ番号にページオフセットを再結合し、物理メモリのページフレームの物理アドレスとする。

![仮想メモリとのマッピングによる大容量アドレス空間の再現_3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想メモリとのマッピングによる大容量アドレス空間の再現_3.png)

#### ▼ ページテーブルにおける仮想ページ番号と物理ページ番号の対応づけ

![仮想メモリとのマッピングによる大容量アドレス空間の再現_4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/仮想メモリとのマッピングによる大容量アドレス空間の再現_4.png)

<br>

## 04. アドレス空間のページフォールト

### ページフォールトとは

ストレージから物理メモリのアドレス空間への割り込み処理のこと。CPUによって稼働したプログラムが、仮想メモリのアドレス空間のページにアクセスし、そのページが物理メモリのアドレス空間にマッピングされていなかった場合、ストレージから物理メモリのアドレス空間に『ページイン』が起こる。

![ページフォールト](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ページフォールト.png)

<br>

### Page Replacementアルゴリズム

ページアウトのアルゴリズムのこと。方式ごとに、物理メモリのページフレームからストレージにページアウトするページが異なる。

#### ▼ 『FIFO方式：First In First Out』と『LIFO方式：Last In First Out』

参考：https://www.amazon.co.jp/dp/4297124513

![p261-2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p261-2.png)

![p261-3](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p261-3.png)

#### ▼ 『LRU方式：Least Recently Used』と『LFU方式：Least Frequently Used』

参考：https://www.amazon.co.jp/dp/4297124513

![p261-1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p261-1.png)

![p261-4](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/p261-4.png)

<br>

## 05. アドレス空間管理におけるプログラムの種類

### Reusable（再使用可能プログラム）

一度実行すれば、再び、ストレージから物理メモリにページインを行わずに、実行を繰り返せるプログラムのこと。

![再使用可能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/再使用可能.gif)

<br>

### Reentrant（再入可能プログラム）

再使用可能の性質をもち、また複数のプログラムから呼び出されても、互いの呼び出しが干渉せず、同時に実行できるプログラムのこと。

![再入可能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/再入可能.gif)

<br>

### Relocatable（再配置可能プログラム）

ストレージから物理メモリにページインを行う時に、アドレス空間上のどこに配置されても実行できるプログラムのこと。

![再配置可能](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/再配置可能.gif)

<br>

