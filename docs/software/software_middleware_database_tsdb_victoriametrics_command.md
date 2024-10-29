---
title: 【IT技術の知見】コマンド＠VictoriaMetrics
description: コマンド＠VictoriaMetricsの知見を記録しています。
---

# コマンド＠VictoriaMetrics

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `victoria-metrics-prod`コマンド

### -downsampling.period

特定の日数以前のデータポイントをダウンサンプリング (数学的に集約) し、単一の値に変換する。

データポイント数が少なくなるため、ストレージ容量を節約できる。

**＊例＊**

`30`日以前のデータを`5`分ごとダウンサンプリングにする。

```bash
$ victoria-metrics-prod -downsampling.period=30d:5m
```

> - https://docs.victoriametrics.com/#downsampling
> - http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html
> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

<br>

### -dedup.minScrapeInterval

データポイントを重複排除することにより、特定の期間の中で最新のデータポイントを残す。

重複排除のタイミングは、収集ツールの収集間隔と同じ値にすると良い。

冗長化されたメトリクス収集ツールのインスタンスが単一のVictoriaMetricsにメトリクスを送信する場合、特定の期間には冗長化されたインスタンスが送信した同じデータポイントが存在することになる。

この重複を排除するために、期間内で最新のタイムスタンプを持つデータポイントのみを残す。

**＊例＊**

```bash
$ victoria-metrics-prod -dedup.minScrapeInterval=60s
```

> - https://docs.victoriametrics.com/Cluster-VictoriaMetrics.html#replication-and-data-safety
> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

<br>

### -httpListenAddr

インバウンド通信を待ち受けるIPアドレスとポート番号を設定する。

**＊例＊**

```bash
$ victoria-metrics-prod -httpListenAddr=0.0.0.0:8248
```

<br>

### -insert.maxQueueDuration

DBへの書き込みの同時実行時に、キューで待機する最大時間を設定する。

**＊例＊**

```bash
$ victoria-metrics-prod -insert.maxQueueDuration=32
```

> - https://docs.victoriametrics.com/#list-of-command-line-flags

<br>

### -maxConcurrentInserts

DBへの書き込みの最大同時実行数を設定する。

各CPUで一つずつ実行するため、 設定値はホストマシン (仮想サーバー、コンテナなど) のCPUのコア数に応じて自動的に設定される。

最大同時実行数を制限することで、CPUやメモリのスパイクと、それに伴うクラッシュを防げる。

![victoria-metrics_ingestion-spike](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/victoria-metrics_ingestion-spike.png)

**＊例＊**

```bash
$ victoria-metrics-prod -maxConcurrentInserts=<ホストマシンのCPUのコア数に応じて自動的に設定される>
```

> - https://docs.victoriametrics.com/#list-of-command-line-flags
> - https://victoriametrics.com/blog/tsdb-performance-techniques-limiting-concurrency/
> - https://github.com/VictoriaMetrics/VictoriaMetrics/issues/946#issuecomment-740635526
> - https://github.com/VictoriaMetrics/VictoriaMetrics/blob/v1.103.0/lib/writeconcurrencylimiter/concurrencylimiter.go#L18

<br>

### -maxLabelsPerTimeseries

メトリクスに付与できるラベルの上限数を設定する。

VictoriaMetricsでは、デフォルトで`30`個しかラベルをつけられず、それ以上のラベルは切り捨てる。

**＊例＊**

```bash
$ victoria-metrics-prod -maxLabelsPerTimeseries=30
```

> - https://docs.victoriametrics.com/#list-of-command-line-flags

<br>

### -memory.allowedBytes

VictoriaMetricsが使用できるメモリサイズを設定する。

**＊例＊**

```bash
$ victoria-metrics-prod -memory.allowedBytes=100000
```

> - https://docs.victoriametrics.com/#resource-usage-limits

<br>

### -memory.allowedPercent

VictoriaMetricsが使用できるメモリサイズのうちで、許容するメモリ使用率を設定する。

これが小さいと、VictoriaMetricsがOOMキラーで停止してしまう。

**＊例＊**

```bash
$ victoria-metrics-prod -memory.allowedPercent=80
```

> - https://docs.victoriametrics.com/#resource-usage-limits

<br>

### -retentionPeriod

メトリクスの保管期間を設定する。

`h(ours)`、`d(ays)`、`w(eeks)`、`y(ears)`、単位なし (`month`) で期間の単位を指定できる。

**＊例＊**

```bash
$ victoria-metrics-prod -retentionPeriod=90d
```

> - https://docs.victoriametrics.com/#retention
> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

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

デフォルトでは、キャッシュを作成しない

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

### -storageDataPath

メトリクスを保管するディレクトリを設定する。

設定したディレクトリ配下に`data`ディレクトリを作成し、これの配下にメトリクスを保管する。

**＊例＊**

```bash
$ victoria-metrics-prod -storageDataPath=/var/lib/victoriametrics
```

> - https://docs.victoriametrics.com/#storage

<br>

### -tlsCertFile (-tlsKeyFileと一緒に使用する)

SSL証明書のパスを設定する。

ペアになる秘密鍵を`-tlsKeyFile`オプションで指定する必要がある。

**＊例＊**

```bash
$ victoria-metrics-prod -tlsCertFile=/etc/victoriametrics/server.crt -tlsKeyFile=/etc/victoriametrics/server.key
```

<br>

## 02. vmctl-prod

### vm-native

指定したURLのVictoriaMetricsのAPIからデータをエクスポートし、宛先のAPIにインポートする。

```bash
$ vmctl-prod vm-native \
    vm-native-filter-time-start \
    vm-native-src-addr \
    vm-native-dst-addr \
    > data.json
```

> - https://docs.victoriametrics.com/vmctl/

<br>

## 03. API

### /api/v1/export

エンドポイントからデータを取得し、データをエクスポートする。

JSON、CSV、バイナリ、Prometheusの形式を選べる。

```bash
$ curl http://<VictoriaMetricsのURL>:8428/api/v1/export \
    -d 'match[]=vm_http_request_errors_total' \
    > filename.json
```

> - https://docs.victoriametrics.com/#how-to-export-time-series

<br>

### /api/v1/import

エンドポイントにデータを送信し、データをインポートする。

JSON、CSV、バイナリ、Prometheusの形式を選べる。

```bash
$ curl -X POST http://<VictoriaMetricsのURL>:8428/api/v1/import \
    -H 'Content-Type: application/json' \
    --data-binary "@filename.json"
```

> - https://docs.victoriametrics.com/#how-to-export-time-series

<br>

### /api/v1/query

読み出しエンドポイントであり、ストレージに永続化されているメトリクスを取得できる。

PrometheusのHTTPサーバーとおおよそ同じ読み出しエンドポイントを持つ。

```bash
# 読み出しエンドポイントにリクエストを送信する。
$ curl \
    -X GET http://<VictoriaMetricsのURL>:8428/api/v1/query \
    -d 'query=vm_http_request_errors_total'
```

> - https://docs.victoriametrics.com/url-examples.html#apiv1query

<br>

### /api/v1/write

書き込みエンドポイントであり、ストレージにメトリクスを永続化できる。

PrometheusのHTTPサーバーとおおよそ同じ書き込みエンドポイントを持つ。

```bash
# 書き込みエンドポイントにリクエストを送信する。
$ curl -X POST http://<VictoriaMetricsのURL>:8428/api/v1/write
```

> - https://docs.victoriametrics.com/#high-availability

<br>
