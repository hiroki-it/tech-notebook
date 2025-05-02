---
title: 【IT技術の知見】NoSQL＠DB系ミドルウェア
description: NoSQL＠DB系ミドルウェアの知見を記録しています。
---

# NoSQL＠DB系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. NoSQL (非関係DB) の仕組み

### アーキテクチャ

記入中...

<br>

### NoSQL

#### ▼ NoSQLとは

NoSQLは、データ同士が関係を持たないデータ格納形式である。

RDBとは異なり、データをメインメモリに保管する。

#### ▼ NoSQLの種類

代表的なものとして、以下がある。

- Memcached
- Redis
- AWS DynamoDB
- MongoDB
- Apache Cassandra

![NoSQLの分類](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/NoSQLの種類.jpg)

<br>

### イネーブラ型

#### ▼ インメモリDB

メモリ (例：DRAMなどの物理メモリ、仮想メモリ) 上にデータを保管するDBを、ストレージ上に保管することと比較して、インメモリDBという。

インメモリDBを採用する場合は、データ保管とプロセス割り当ての間でメモリ領域を奪い合うことになるため、メモリサイズを大きくする必要がある。

> - https://e-words.jp/w/%E3%82%A4%E3%83%B3%E3%83%A1%E3%83%A2%E3%83%AA.html
> - https://www.kingston.com/en/blog/pc-performance/difference-between-memory-storage
> - https://www.mydistributed.systems/2020/07/an-overview-of-storage-engines.html

<br>

## 02. リーダー選出 (分散排他制御、分散ロック)

『分散排他制御』『分散ロック』ともいう。

複数のレプリカのうち、いずれかのレプリカのみに処理を実行させたい場合、リーダーのレプリカを選出する必要がある。

先にキー名を作成したレプリカをリーダーとして、処理を実行させる。

> - https://kumagi.hatenablog.com/entry/distributed_lock
> - https://scrapbox.io/mopp/%E5%88%86%E6%95%A3%E3%83%AD%E3%83%83%E3%82%AF

<br>
