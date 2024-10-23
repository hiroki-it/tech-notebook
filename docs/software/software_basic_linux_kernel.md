---
title: 【IT技術の知見】Linuxカーネル (制御プログラム) ＠基本ソフトウェア
description: Linuxカーネル (制御プログラム) ＠基本ソフトウェアの知見を記録しています。
---

# Linuxカーネル (制御プログラム) ＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Linuxカーネルとは

狭義のOSであり、ソフトウェア全体に関する様々な管理機能を持つ。

広義のOSは、ユーティリティや言語プロセッサーも含む基本ソフトウェア全体である。

> - https://ja.wikipedia.org/wiki/%E3%82%AB%E3%83%BC%E3%83%8D%E3%83%AB

<br>

## 02. Linuxカーネルの仕組み

### アーキテクチャ

#### ▼ モノリシックカーネルの場合

モノリシックカーネルアーキテクチャのLinuxカーネルは、システムコール、各種管理コンポーネント、デバイスドライバー、といったコンポーネントから構成される。

![linux_kernel_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/linux_kernel_architecture.png)

> - https://manual.atmark-techno.com/armadillo-guide/armadillo-guide-1_ja-2.0.0/ch02.html

#### ▼ マイクロカーネルの場合

記入中...

<br>

### システムコール

#### ▼ システムコールとは

カーネルを操作できる関数 (例：read、writeなど) である。

> - http://curtaincall.weblike.jp/portfolio-unix/api.html
> - https://milestone-of-se.nesuke.com/sv-basic/architecture/windows-linux-kernel-and-shell/

#### ▼ システムコールの仕組み

上位のソフトウェア (アプリケーションソフトウェア、ミドルウェア) のプロセスは、システムコールにパラメーターを渡し、システムコールを実行する。

システムコールはパラメーターに応じてカーネルを操作し、上位のソフトウェアのプロセスにカーネルの処理結果を返却する。

![linux_kernel_system-call](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/linux_kernel_system-call.png)

> - https://milestone-of-se.nesuke.com/sv-basic/architecture/windows-linux-kernel-and-shell/

<br>

### 管理コンポーネント

#### ▼ プロセス管理

> - https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_process_management.html

#### ▼ メモリ管理

> - https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_memory_management.html

#### ▼ ストレージ管理

> - https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_storage_management.html

#### ▼ I/O (入出力) 管理

> - https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_io_management.html

#### ▼ ジョブ管理

> - https://hiroki-it.github.io/tech-notebook/software/software_basic_linux_kernel_job_management.html

#### ▼ 通信管理

デバイスドライバーとミドルウェア間で実行されるデータ通信処理を管理する。

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

#### ▼ 運用管理

ミドルウェアやアプリケーションの運用処理 (メトリクス収集、障害対応、記憶情報の保護) を管理する。

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

#### ▼ 障害管理

ソフトウェアに障害が発生した時の障害修復を管理する。

> - http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>
