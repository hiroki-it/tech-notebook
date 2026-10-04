---
title: 【IT技術の知見】Linuxカーネル (制御プログラム) ＠基本ソフトウェア
description: Linuxカーネル (制御プログラム) ＠基本ソフトウェアの知見を記録しています。
---

# Linux カーネル (制御プログラム) ＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Linux カーネルとは

狭義の OS であり、ソフトウェア全体に関するさまざまな管理機能を持つ。

広義の OS は、ユーティリティや言語プロセッサーも含む基本ソフトウェア全体である。

> - [カーネル - Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%AB)

<br>

## 02. Linux カーネルの仕組み

### アーキテクチャ

#### ▼ モノリシックカーネルの場合

モノリシックカーネルアーキテクチャの Linux カーネルは、システムコール、各種管理コンポーネント、デバイスドライバー、といったコンポーネントから構成される。

![linux_kernel_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/linux_kernel_architecture.png)

> - [第2章 組み込みLinuxシステムとは](https://manual.atmark-techno.com/armadillo-guide/armadillo-guide-1_ja-2.0.0/ch02.html)

#### ▼ マイクロカーネルの場合

記入中...

<br>

### システムコール

#### ▼ システムコールとは

カーネルを操作できる関数 (例：read、write など) である。

> - [システムコールを理解する \| UNIX world](http://curtaincall.weblike.jp/portfolio-unix/api.html)
> - [【図解】Windows/Linuxのカーネルとシェルの違いと役割~一般ユーザとシステムユーザ(サービスユーザ)からの見え方~ \| SEの道標](https://milestone-of-se.nesuke.com/sv-basic/architecture/windows-linux-kernel-and-shell/)

#### ▼ システムコールの仕組み

上位のソフトウェア (アプリケーションソフトウェア、ミドルウェア) のプロセスは、システムコールにパラメーターを渡し、システムコールを実行する。

システムコールはパラメーターに応じてカーネルを操作し、上位のソフトウェアのプロセスにカーネルの処理結果を返却する。

![linux_kernel_system-call](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/linux_kernel_system-call.png)

> - [【図解】Windows/Linuxのカーネルとシェルの違いと役割~一般ユーザとシステムユーザ(サービスユーザ)からの見え方~ \| SEの道標](https://milestone-of-se.nesuke.com/sv-basic/architecture/windows-linux-kernel-and-shell/)

<br>

### 管理コンポーネント

#### ▼ プロセス管理

> - [【IT技術の知見】プロセス管理＠基本ソフトウェア - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_process_management.html)

#### ▼ メモリ管理

> - [【IT技術の知見】メモリ管理＠Linuxカーネル - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_memory_management.html)

#### ▼ ストレージ管理

> - [【IT技術の知見】ストレージ管理＠Linuxカーネル - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_storage_management.html)

#### ▼ I/O (入出力) 管理

> - [【IT技術の知見】I/O (入出力) 管理＠Linuxカーネル - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_io_management.html)

#### ▼ ジョブ管理

> - [【IT技術の知見】ジョブ管理＠Linuxカーネル - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_job_management.html)

#### ▼ 通信管理

デバイスドライバーとミドルウェア間で実行されるデータ通信処理を管理する。

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

#### ▼ 運用管理

ミドルウェアやアプリケーションの運用処理 (データポイント収集、障害対応、記憶情報の保護) を管理する。

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

#### ▼ 障害管理

ソフトウェアに障害が発生したときの障害修復を管理する。

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>
