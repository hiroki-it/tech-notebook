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

狭義のOSである。広義のOSは、ユーティリティや言語プロセッサーも含む基本ソフトウェア全体である。

<br>

## 02. メモリ管理（記憶管理）

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/software/software_basic_kernel_memory_management.html

<br>

## 03. 入出力管理

### 入出力管理とは

アプリケーションから低速な周辺機器へデータを出力する時、まず、CPUはスプーラにデータを出力する。Spoolerは、全てのデータをまとめて出力するのではなく、一時的にストレージ（Spool）にためておきながら、少しずつ出力する（Spooling）。

![スプーリング](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/スプーリング.jpg)


<br>

## 04. ジョブ管理

### ジョブ管理とは

定期的に実行するように設定されたバッチ処理を、特に『ジョブ』という。ジョブ管理では、複数のジョブを管理でき、各ジョブを独立して実行する。UNIXでは```at```や```cron```に、またWindowsではタスクスケジューラーがジョブ管理機能を持つ。

> ℹ️ 参考：
>
> - https://ja.wikipedia.org/wiki/%E3%82%B8%E3%83%A7%E3%83%96%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0
> - https://strategicppm.wordpress.com/2010/01/20/batch-vs-job-processes-becoming-more-efficient/
> - https://www.quora.com/What-is-the-difference-between-cron-job-and-batch-job
> - https://japan.zdnet.com/glossary/exp/%E3%82%B8%E3%83%A7%E3%83%96%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%A9/?s=4

<br>

### ジョブ管理の仕組み

ジョブ管理は、マスタスケジューラー、ジョブスケジューラーから構成される。

![ジョブ管理とタスク管理の概要](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブ管理とタスク管理の概要.jpg)

<br>

###  マスタースケジューラー

#### ▼ マスタースケジューラーとは

ジョブスケジューラーにジョブの実行を命令する。データをコンピュータに入力し、複数の処理が実行され、結果が出力されるまでの一連の処理のこと。『Task』と『Job』の定義は曖昧なので、『process』と『set of processes』を使用するべきとのこと。複数のジョブ（定期的に実行するように設定されたバッチ処理）の起動と終了を制御したり、ジョブの実行と終了を監視報告するソフトウェア。ややこしいことに、タスクスケジューラーとも呼ぶ。

> ℹ️ 参考：https://stackoverflow.com/questions/3073948/job-task-and-process-whats-the-difference/31212568

<br>

### ジョブスケジューラー

#### ▼ ジョブスケジューラーとは

マスタースケジューラーから命令を受け、実際にジョブを実行する。

#### ▼ リーダー

ジョブを待ち行列に登録する。

#### ▼ イニシエーター

ジョブをジョブステップに分解する。

![ジョブからジョブステップへの分解](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/ジョブからジョブステップへの分解.png)

#### ▼ ターミネーター

ジョブを出力待ち行列に登録する。

#### ▼ ライター

優先度順に、ジョブの結果を出力する。

<br>

## 05. タスク管理

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

## 06. その他の管理

### 通信管理

#### ▼ 通信管理とは

デバイスドライバーとミドルウェア間で実行されるデータ通信処理を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

### 運用管理

#### ▼ 運用管理とは

ミドルウェアやアプリケーションの運用処理（メトリクス収集、障害対応、記憶情報の保護）を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>

### 障害管理

#### ▼ 障害管理とは

ソフトウェアに障害が発生した時の障害修復を管理する。

> ℹ️ 参考：http://kccn.konan-u.ac.jp/information/cs/cyber06/cy6_os.htm

<br>
