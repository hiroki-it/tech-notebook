---
title: 【IT技術の知見】コマンド＠VictoriaMetrics
description: コマンド＠VictoriaMetricsの知見を記録しています。
---

# コマンド＠VictoriaMetrics

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ```victoria-metrics-prod```コマンド

### -downsampling.period

特定の日数以前のデータポイントを重複排除する。ストレージ容量を節約できる。

> ℹ️ 参考：https://docs.victoriametrics.com/#downsampling

```bash
# 30日以前のデータは5分ごとに重複排除する。
$ victoria-metrics-prod -downsampling.period=30d:5m
```

<br>

### -dedup.minScrapeInterval

重複排除時の間隔を設定する。設定した期間の中で最新のデータポイントを残す。冗長化されたメトリクス収集ツールが単一のVictoriaMetricsにメトリクスを送信する場合、VictoriaMetricsで保管するメトリクスには重複が発生する。

> ℹ️ 参考：https://weseek.co.jp/tech/3236/

```bash
$ victoria-metrics-prod -dedup.minScrapeInterval=60s
```


<br>

### -httpListenAddr

インバウンド通信を待ち受けるIPアドレスとポート番号を設定する。

```bash
$ victoria-metrics-prod -httpListenAddr=0.0.0.0:8248
```

<br>

### -storageDataPath

メトリクスを保管するディレクトリを設定する。設定したディレクトリ配下に```data```ディレクトリを作成し、これの配下にメトリクスを保管する。

> ℹ️ 参考：https://docs.victoriametrics.com/#storage

```bash
$ victoria-metrics-prod -storageDataPath=/var/lib/victoriametrics
```

<br>

### -retentionPeriod

メトリクスの保管期間を設定する。```h(ours)```、```d(ays)```、```w(eeks)```、```y(ears)```、単位なし（```month```）で期間の単位を指定できる。

> ℹ️ 参考：https://docs.victoriametrics.com/#retention

```bash
$ victoria-metrics-prod -retentionPeriod=90d
```

<br>

### -storage.cacheSizeIndexDBDataBlocks

転置インデックスのデータブロックの上限キャッシュサイズを設定する。デフォルトでは、キャッシュを作成しない。

```bash
$ victoria-metrics-prod -storage.cacheSizeIndexDBDataBlocks=0
```

<br>

### -storage.cacheSizeIndexDBIndexBlocks

転置インデックスのインデックスブロックの上限キャッシュサイズを設定する。デフォルトでは、キャッシュを作成しない。

```bash
$ victoria-metrics-prod -storage.cacheSizeIndexDBIndexBlocks=0
```

<br>

### -storage.cacheSizeIndexDBTagFilters

転置インデックスのタグフィルターの上限キャッシュサイズを設定する。デフォルトでは、キャッシュを作成しない。

```bash
$ victoria-metrics-prod -storage.cacheSizeIndexDBTagFilters=0
```

<br>
