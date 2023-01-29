---
title: 【IT技術の知見】プロセス管理＠基本ソフトウェア
description: プロセス管理＠基本ソフトウェアの知見を記録しています。
---

# プロセス管理＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. プロセス

### プロセスとは

プログラムは、メモリ上のアドレス空間の区画に割り当てられている。

この時のプログラム自体を『プロセス』という。

プロセスの代わりに『タスク』ということもある。

プロセスとして割り当てられたプログラムはCPUに参照され、CPUのコア上で処理が実行される。

何かのプロセスを正しく終了できないと、メモリ上に不要なプロセスが溜まっていき、メモリ使用率が高くなってしまう。



> ℹ️ 参考：https://jpazamu.com/thread_process/#index_id5

<br>

### デーモン（常駐プログラム）

OSが起動している間、メモリ上のアドレス空間の区画に恒常的に割り当てられているプロセスを、特に『デーモン（常駐プログラム）』という。



> ℹ️ 参考：https://e-words.jp/w/%E3%83%87%E3%83%BC%E3%83%A2%E3%83%B3.html

<br>

### 親/子プロセス

#### ▼ 親/子プロセスとは

プロセスが新しいプロセスを作成する場合、プロセス間には親子関係がある。

例えば、ターミナルの親プロセスは```shell```や```bash```であり、任意のユーティリティを実行すると、これの子プロセスが作成されることになる。

プロセスIDが```1```のプロセスが、全てのプロセスの親である。


```bash
# MacOSの場合
$ ps -p 1

PID  TTY  TIME     CMD
  1  ??   9:23.33  /sbin/launchd
```




> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/1706/23/news010_2.html
> - https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_utility_shell.html

#### ▼ 同時処理できるリクエスト数

メモリ上には親の通信プロセスが割り当てられており、また```1```個のリクエストを処理するために、```1```個の子プロセスが割り当てられる。

そのため、子プロセスの最大数は、同時に処理できるリクエストの最大数に相当する。



<br>

### プロセシングの種類

#### ▼ シングルプロセシング

単一のメモリ上で、単一のプロセスがアドレスに割り当てられる仕組みのこと。



#### ▼ マルチプロセシング

単一のメモリ上で、複数のプロセスがアドレスに割り当てられる仕組みのこと。

優先度の低いプロセスからCPUを切り離し、優先度の高いプロセスにCPUを割り当てる、といった仕組みを持つ。

現代のハードウェアのほとんどがマルチプロセシングの機能を持つ。



> ℹ️ 参考：
>
> - https://linuxjf.osdn.jp/JFdocs/The-Linux-Kernel-5.html
> - https://webpia.jp/thread_process/

![process](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/process.png)

<br>

### OOMキラー：Out Of Memory Killer

#### ▼ OOMキラーとは

物理メモリ、ストレージ上のスワップ領域、などプロセスが使用可能な全ての区画を使用し、プロセスを新しく割り当てる区画がなくなってしまった場合に実行される。

現在割り当てられているプロセスのうち、最も使用領域の大きいプロセスを強制的に終了する。



> ℹ️ 参考：https://www.mk-mode.com/blog/2016/03/15/linux-control-oomkiller/

#### ▼ 確認方法

もしOOMキラーが実行された場合は、```/var/log/messages```ファイルにログが出力される。



> ℹ️ 参考：https://aegif.jp/alfresco/tech-info/-/20201119-alfresco/1.3

```bash
$ cat /var/log/messages | grep Kill

Jan  1 00:00:00 localhost kernel: Out of memory: Kill process 17143 (java) score 468 or sacrifice child
Jan  1 00:00:00 localhost kernel: Killed process 17143 (java), UID 1001, total-vm:7790724kB, anon-rss:4108910kB, file-rss:6822kB, shmem-rss:0kB
```

<br>

## 02. スレッド

### スレッドとは

メモリ上ではプログラムがプロセスとして割り当てられており、プログラムはCPUのコア上で実行される。

CPUのコアと紐付くプロセスの実行単位を『スレッド』という。



> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/0503/12/news025.html
> - https://webpia.jp/thread_process/

![thread](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/thread.png)

<br>

### スレッディングの種類

#### ▼ シングルスレッディング

メモリ上の特定のプロセスで、単一のスレッドを実行できる仕組みのこと。



#### ▼ マルチスレッディング

メモリ上の特定のプロセスで、複数のスレッドを実行できる仕組みのこと。

各スレッドがプロセスに割り当てられているアドレスを共有して使用する。



> ℹ️ 参考：https://webpia.jp/thread_process/

![multi-thread](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/multi-thread.png)

<br>

### マルチスレッディングについて

#### ▼ 通常のマルチスレッド

CPUのコアが単一のスレッドが紐付くようなマルチスレッドのこと。

![multithreading](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/multithreading.png)


> ℹ️ 参考：https://milestone-of-se.nesuke.com/sv-basic/architecture/hyper-threading-smt/


#### ▼ 同時マルチスレッド

CPUのコアが複数のスレッドが紐付くようなマルチスレッドのこと。

![simultaneous-multithreading](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/simultaneous-multithreading.png)


> ℹ️ 参考：https://milestone-of-se.nesuke.com/sv-basic/architecture/hyper-threading-smt/


<br>

## 03. CPU上のプロセス管理方式

### 優先順方式

各プロセスに優先度を設定し、優先度の高いプロセスから順に、CPUをプロセスに割り当てる。



**＊例＊**

作成されたプロセスの到着時刻と処理時間は以下のとおりである。

CPUのプロセスへの割り当ては、『20秒』ごとに起こるとする。



![優先順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_1.png)

【１】プロセスAが```0```秒に待ち行列へ登録される。

【２】```20```秒間、プロセスAは実行状態へ割り当てられる。

【３】```20```秒時点で、プロセスAは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるプロセスBにCPUを割り当てる。

【４】```40```秒時点で、プロセスCは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるプロセスAにCPUを割り当てる。

![優先順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_2.png)


<br>

### 到着順方式

待ち行列に登録されたプロセスから順に、CPUをプロセスに割り当てる。



![到着順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_1.png)

**＊例＊**

以下の様に、プロセスがCPUに割り当てられていく。



![到着順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_2.png)

<br>

### ラウンドロビン方式

ラウンドロビンは、『総当たり』の意味。

一定時間（タイムクウォンタム）ごとに、実行状態にあるプロセスが強制的に待ち行列に登録される。

交代するように、CPUをプロセスに割り当てる。



![ラウンドロビン方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ラウンドロビン方式.png)

<br>
