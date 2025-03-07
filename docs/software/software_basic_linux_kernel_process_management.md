---
title: 【IT技術の知見】プロセス管理＠基本ソフトウェア
description: プロセス管理＠基本ソフトウェアの知見を記録しています。
---

# プロセス管理＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. プロセス

### プロセスとは

プログラムは、メモリ上のアドレス空間の区画に割り当てられている。

この時のプログラム自体を『プロセス』という。

プロセスの代わりに『タスク』ということもある。

プロセスとして割り当てられたプログラムはCPUに参照され、CPUのコア上で処理が実行される。

何かのプロセスを正しく終了できないと、メモリ上に不要なプロセスが溜まっていき、メモリ使用率が高くなってしまう。

> - https://jpazamu.com/thread_process/#index_id5

<br>

### デーモン (常駐プログラム)

OSが稼働している間、メモリ上のアドレス空間の区画に恒常的に割り当てられているプロセスを、特に『デーモン (常駐プログラム) 』という。

> - https://e-words.jp/w/%E3%83%87%E3%83%BC%E3%83%A2%E3%83%B3.html

<br>

### シグナル

#### ▼ シグナルとは

一方のプロセスから他方のプロセスへの命令である。

> - https://qiita.com/Kernel_OGSun/items/e96cef5487e25517a576#1-%E3%82%B7%E3%82%B0%E3%83%8A%E3%83%AB%E3%81%A8%E3%81%AF
> - https://ja.wikipedia.org/wiki/%E3%82%B7%E3%82%B0%E3%83%8A%E3%83%AB_(Unix)

#### ▼ シグナルの種類

| 代表的なシグナル | 説明                                     | 実行方法                         |
| ---------------- | ---------------------------------------- | -------------------------------- |
| `SIGINT`         | プロセスに割り込む。                     | キーボードで `Ctrl + C` を打つ。 |
| `SIGKILL`        | プロセスを強制終了する。                 | `kill`コマンドを実行する。       |
| `SIGTERM`        | プロセスを通常終了する。                 | 記入中...                        |
| `SIGTSTP`        | プロセスを一時中断する。                 | キーボードで `Ctrl + Z` を打つ。 |
| `SIGQUIT`        | プロセスを終了させつつ、コアダンプする。 | キーボードで `Ctrl + Q` を打つ。 |

> - https://atmarkit.itmedia.co.jp/ait/articles/1708/04/news015.html
> - https://ja.wikipedia.org/wiki/%E3%82%B7%E3%82%B0%E3%83%8A%E3%83%AB_(Unix)
> - https://qiita.com/Kernel_OGSun/items/e96cef5487e25517a576#2-%E3%82%B7%E3%82%B0%E3%83%8A%E3%83%AB%E5%88%A9%E7%94%A8%E4%BE%8B

<br>

### 親/子プロセス

#### ▼ 親/子プロセスとは

プロセスが新しいプロセスを作成する場合、プロセス間には親子関係がある。

例えば、ターミナルの親プロセスは`shell`プロセスや`bash`プロセスであり、任意のユーティリティを実行すると、これの子プロセスを作成することになる。

プロセスIDが`1`のプロセスが、全てのプロセスの親である。

```bash
# MacOSの場合
$ ps -p 1

PID  TTY  TIME     CMD
  1  ??   9:23.33  /sbin/launchd
```

> - https://atmarkit.itmedia.co.jp/ait/articles/1706/23/news010_2.html
> - https://hiroki-it.github.io/tech-notebook/software/software_basic_utility_shell.html

#### ▼ 同時処理できるリクエスト数

メモリ上には親の通信プロセスが割り当てられており、また`1`個のリクエストを処理するために、`1`個の子プロセスが割り当てられる。

そのため、子プロセスの最大数は、同時に処理できるリクエストの最大数に相当する。

<br>

### プロセシングの種類

#### ▼ シングルプロセシング

単一のメモリ上で、単一のプロセスがアドレスに割り当てられる仕組みのこと。

#### ▼ マルチプロセシング

単一のメモリ上で、複数のプロセスがアドレスに割り当てられる仕組みのこと。

優先度の低いプロセスからCPUを切り離し、優先度の高いプロセスにCPUを割り当てる、といった仕組みを持つ。

現代のハードウェアのほとんどがマルチプロセシングの機能を持つ。

![process](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/process.png)

> - https://linuxjf.osdn.jp/JFdocs/The-Linux-Kernel-5.html
> - https://webpia.jp/thread_process/

<br>

### OOMキラー：Out Of Memory Killer

#### ▼ OOMキラーとは

物理メモリ、ストレージ上のスワップ領域などプロセスが使用可能な全ての区画を使用し、プロセスを新しく割り当てる区画がなくなってしまった場合に実行される。

現在割り当てられているプロセスのうち、最も使用領域の大きいプロセスを強制的に終了する。

> - https://www.mk-mode.com/blog/2016/03/15/linux-control-oomkiller/

#### ▼ 確認方法

もしOOMキラーが実行された場合は、`/var/log/messages`ファイルにログが出力される。

```bash
$ cat /var/log/messages | grep Kill

Jan  1 00:00:00 localhost kernel: Out of memory: Kill process 17143 (java) score 468 or sacrifice child
Jan  1 00:00:00 localhost kernel: Killed process 17143 (java), UID 1001, total-vm:7790724kB, anon-rss:4108910kB, file-rss:6822kB, shmem-rss:0kB
```

> - https://aegif.jp/alfresco/tech-info/-/20201119-alfresco/1.3

<br>

## 02. スレッド

### スレッド (プロセスの処理実行単位) とは

メモリ上ではプログラムがプロセスとして割り当てられており、プログラムはCPUのコア上で実行される。

プロセス内には、CPUのコアと紐づく処理実行が複数個ある。

この処理実行単位を『スレッド』という。

![thread](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/thread.png)

> - https://atmarkit.itmedia.co.jp/ait/articles/0503/12/news025.html
> - https://webpia.jp/thread_process/

<br>

### スレッドの種類

#### ▼ シングルスレッド

メモリ上のプロセス内で、単一のスレッドを持つ仕組みのこと。

#### ▼ マルチスレッド

メモリ上のプロセス内で、複数のスレッドを持つ仕組みのこと。

これらのスレッドは、そのプロセスに割り当てられているアドレスを共有する。

![multi-thread](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/multi-thread.png)

> - https://webpia.jp/thread_process/

<br>

### マルチスレッドについて

#### ▼ 通常のマルチスレッド

CPUのコアは、メモリ上のプロセス内にある単一のスレッドが紐付く。

![multithreading](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/multithreading.png)

> - https://milestone-of-se.nesuke.com/sv-basic/architecture/hyper-threading-smt/

#### ▼ 同時マルチスレッド

CPUのコアは、メモリ上のプロセス内にある複数のスレッドと紐付く。

![simultaneous-multithreading](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/simultaneous-multithreading.png)

> - https://milestone-of-se.nesuke.com/sv-basic/architecture/hyper-threading-smt/

<br>

## 03. CPU上のプロセス管理方式

### 優先順方式

各プロセスに優先度を設定し、優先度の高いプロセスから順に、CPUをプロセスに割り当てる。

**＊例＊**

作成されたプロセスの到着時刻と処理時間は以下のとおりである。

CPUのプロセスへの割り当ては、『20秒』ごとに起こるとする。

![優先順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/優先順方式_1.png)

`(1)`

: プロセスAが`0`秒に待ち行列へ登録される。

`(2)`

: `20`秒間、プロセスAは実行状態へ割り当てられる。

`(3)`

: `20`秒時点で、プロセスAは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるプロセスBにCPUを割り当てる。

`(4)`

: `40`秒時点で、プロセスCは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるプロセスAにCPUを割り当てる。

![優先順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/優先順方式_2.png)

<br>

### 到着順方式

待ち行列に登録されたプロセスから順に、CPUをプロセスに割り当てる。

![到着順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/到着順方式_1.png)

**＊例＊**

以下の様に、プロセスがCPUに割り当てられていく。

![到着順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/到着順方式_2.png)

<br>

### ラウンドロビン方式

ラウンドロビンは、『総当たり』の意味。

一定時間 (タイムクウォンタム) ごとに、実行状態にあるプロセスが強制的に待ち行列に登録される。

交代するように、CPUをプロセスに割り当てる。

![ラウンドロビン方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ラウンドロビン方式.png)

<br>
