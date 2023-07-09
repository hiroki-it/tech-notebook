---
title: 【IT技術の知見】ジョブ管理＠Linuxカーネル
description: ジョブ管理＠Linuxカーネルの知見を記録しています。
---

# ジョブ管理＠Linuxカーネル

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ジョブ

### ジョブとは

定期的に実行するように設定されたバッチ処理を、特に『ジョブ』という。

> - https://strategicppm.wordpress.com/2010/01/20/batch-vs-job-processes-becoming-more-efficient/
> - https://www.quora.com/What-is-the-difference-between-cron-job-and-batch-job

<br>

## 02 ジョブ管理

### ジョブ管理とは

ジョブ管理では、複数のジョブを管理でき、各ジョブを独立して実行する。

Unixでは`at`や`cron`に、またWindowsではタスクスケジューラーがジョブ管理機能を持つ。

> - https://ja.wikipedia.org/wiki/%E3%82%B8%E3%83%A7%E3%83%96%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0
> - https://japan.zdnet.com/glossary/exp/%E3%82%B8%E3%83%A7%E3%83%96%E3%82%B9%E3%82%B1%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%A9/?s=4

<br>

### ジョブ管理の仕組み

ジョブ管理は、マスタスケジューラー、ジョブスケジューラーから構成される。

![ジョブ管理とタスク管理の概要](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ジョブ管理とタスク管理の概要.jpg)

<br>

### マスタースケジューラー

#### ▼ マスタースケジューラーとは

ジョブスケジューラーにジョブの実行を命令する。

データをコンピュータに入力し、複数の処理が実行され、結果が出力されるまでの一連の処理のこと。

『Task』と『Job』の定義は曖昧なため、『process』と『set of processes』を使用する必要があるとのこと。

複数のジョブ (定期的に実行するように設定されたバッチ処理) の起動と終了を制御したり、ジョブの実行と終了を監視報告するソフトウェア。

ややこしいことに、タスクスケジューラーとも呼ぶ。

> - https://stackoverflow.com/questions/3073948/job-task-and-process-whats-the-difference/31212568

<br>

### ジョブスケジューラー

#### ▼ ジョブスケジューラーとは

マスタースケジューラーから命令を受け、実際にジョブを実行する。

#### ▼ リーダー

ジョブを待ち行列に登録する。

#### ▼ イニシエーター

ジョブをジョブステップに分解する。

![ジョブからジョブステップへの分解](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/ジョブからジョブステップへの分解.png)

#### ▼ ターミネーター

ジョブを出力待ち行列に登録する。

#### ▼ ライター

優先度順に、ジョブの結果を出力する。

<br>
