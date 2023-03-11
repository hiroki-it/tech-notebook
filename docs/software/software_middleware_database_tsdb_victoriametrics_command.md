---
title: 【IT技術の知見】コマンド＠VictoriaMetrics
description: コマンド＠VictoriaMetricsの知見を記録しています。
---

# コマンド＠VictoriaMetrics

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `victoria-metrics-prod`コマンド

### -downsampling.period

特定の日数以前のデータポイントをダウンサンプリング (数学的に集約) し、単一の値に変換する。

データポイント数が少なくなるため、ストレージ容量を節約できる。

> ↪️ 参考：
>
> - https://docs.victoriametrics.com/#downsampling
> - http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html
> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

**＊例＊**

`30`日以前のデータを`5`分ごとダウンサンプリングにする。

```bash
$ victoria-metrics-prod -downsampling.period=30d:5m
```

<br>

### -dedup.minScrapeInterval

データポイントを重複排除することにより、特定の期間の中で最新のデータポイントを残す。

重複排除のタイミングは、収集ツールの収集間隔と同じ値にすると良い。

冗長化されたメトリクス収集ツールのインスタンスが単一のVictoriaMetricsにメトリクスを送信する場合、特定の期間には冗長化されたインスタンスが送信した同じデータポイントが存在することになる。

この重複を排除するために、期間内で最新のタイムスタンプを持つデータポイントのみを残す。

> ↪️ 参考：
>
> - https://docs.victoriametrics.com/Cluster-VictoriaMetrics.html#replication-and-data-safety
> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

**＊例＊**

```bash
$ victoria-metrics-prod -dedup.minScrapeInterval=60s
```

<br>

### -httpListenAddr

インバウンド通信を待ち受けるIPアドレスとポート番号を設定する。

**＊例＊**

```bash
$ victoria-metrics-prod -httpListenAddr=0.0.0.0:8248
```

<br>

### -storageDataPath

メトリクスを保管するディレクトリを設定する。

設定したディレクトリ配下に`data`ディレクトリを作成し、これの配下にメトリクスを保管する。

> ↪️ 参考：https://docs.victoriametrics.com/#storage

**＊例＊**

```bash
$ victoria-metrics-prod -storageDataPath=/var/lib/victoriametrics
```

<br>

### -retentionPeriod

メトリクスの保管期間を設定する。

`h(ours)`、`d(ays)`、`w(eeks)`、`y(ears)`、単位なし (`month`) で期間の単位を指定できる。

> ↪️ 参考：
>
> - https://docs.victoriametrics.com/#retention
> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

**＊例＊**

```bash
$ victoria-metrics-prod -retentionPeriod=90d
```

<br>

### -storage.cacheSizeIndexDBDataBlocks

転置インデックスのデータブロックの上限キャッシュサイズを設定する。

デフォルトでは、キャッシュを作成しない。

**＊例＊**

```bash
$ victoria-metrics-prod -storage.cacheSizeIndexDBDataBlocks=0
```

<br>

### -storage.cacheSizeIndexDBIndexBlocks

転置インデックスのインデックスブロックの上限キャッシュサイズを設定する。

デフォルトでは、キャッシュを作成しない。

```bash
$ victoria-metrics-prod -storage.cacheSizeIndexDBIndexBlocks=0
```

<br>

### -storage.cacheSizeIndexDBTagFilters

転置インデックスのタグフィルターの上限キャッシュサイズを設定する。

デフォルトでは、キャッシュを作成しない。

```bash
$ victoria-metrics-prod -storage.cacheSizeIndexDBTagFilters=0
```

<br>
