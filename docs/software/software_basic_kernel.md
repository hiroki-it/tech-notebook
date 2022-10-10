---
title: 【IT技術の知見】カーネル（制御プログラム）＠基本ソフトウェア
description: カーネル（制御プログラム）＠基本ソフトウェアの知見を記録しています。
---

# カーネル（制御プログラム）＠基本ソフトウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. カーネルとは

狭義のOSであり、ソフトウェア全体に関する様々な管理機能を持つ。広義のOSは、ユーティリティや言語プロセッサーも含む基本ソフトウェア全体である。

<br>

## 02. メモリ管理

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_memory_management.html

<br>

## 03. ストレージ管理

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_storage_management.html

<br>

## 04. I/O（入出力）管理

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_io_management.html

<br>

## 05. ジョブ管理

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_job_management.html


<br>

## 06. タスク管理

### タスク管理とは

![task_management](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/task_management.png)

タスク管理によって、イニシエーターによるジョブステップからタスクが作成される。タスクが作成されると実行可能状態になる。ディスパッチャによって実行可能状態から実行状態になる。

> ℹ️ 参考：https://www.amazon.co.jp/dp/4297124513

<br>

### タスク管理方式の種類

#### ▼ 優先順方式

各タスクに優先度を設定し、優先度の高いタスクから順に、ディスパッチしていく方式。

#### ▼ 到着順方式

待ち行列に登録されたタスクから順に、ディスパッチしていく方式。

![到着順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_1.png)

**＊例＊**

以下の様に、タスクがCPUに割り当てられていく。

![到着順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/到着順方式_2.png)

#### ▼ ラウンドロビン方式

ラウンドロビンは、『総当たり』の意味。一定時間（タイムクウォンタム）ごとに、実行状態にあるタスクが強制的に待ち行列に登録される。交代するように、他のタスクがディスパッチされる。

![ラウンドロビン方式](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ラウンドロビン方式.png)

**＊例＊**

作成されたタスクの到着時刻と処理時間は以下のとおりである。強制的なディスパッチは、『20秒』ごとに起こるとする。

![優先順方式_1](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_1.png)

1. タスクAが0秒に待ち行列へ登録される。
2. 20秒間、タスクAは実行状態へ割り当てられる。
3. 20秒時点で、タスクAは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるタスクBは、実行可能状態から実行状態にディスパッチされる。
4. 40秒時点で、タスクCは実行状態から待ち行列に追加される。同時に、待ち行列の先頭にいるタスクAは、実行可能状態から実行状態にディスパッチされる。

![優先順方式_2](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/優先順方式_2.png)

<br>

## 07. 通信管理

### 通信管理とは

デバイスドライバーとミドルウェア間で実行されるデータ通信処理を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

## 08. 運用管理

### 運用管理とは

ミドルウェアやアプリケーションの運用処理（メトリクス収集、障害対応、記憶情報の保護）を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

## 09. 障害管理

### 障害管理とは

ソフトウェアに障害が発生した時の障害修復を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>
