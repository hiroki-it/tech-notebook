---
title: 【IT技術の知見】メトリクス＠Prometheus
description: メトリクス＠Prometheus
---

# メトリクス＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. メトリクス

### メトリクスの種類

#### ▼ Counter

数を単位とするメトリクス (例：`go_gc_duration_seconds_count`) が属する。

> - https://prometheus.io/docs/tutorials/understanding_metric_types/#counter

#### ▼ Gauge

動的に増減するメトリクス (例：`go_memstats_heap_alloc_bytes`) が属する。

> - https://prometheus.io/docs/tutorials/understanding_metric_types/#gauge

#### ▼ Histogram

時間の範囲を単位とするメトリクス (例：`prometheus_http_request_duration_seconds_bucket`) が属する。

> ↪️：
>
> - https://prometheus.io/docs/tutorials/understanding_metric_types/#histogram
> - https://prometheus.io/docs/practices/histograms/

#### ▼ Summary

統計的な分位数を単位とするメトリクス

> ↪️：
>
> - https://prometheus.io/docs/tutorials/understanding_metric_types/#summary
> - https://prometheus.io/docs/practices/histograms/

<br>

## 02. Prometheus自身のメトリクス

### 命名規則

```bash
# Prometheusサーバー
prometheus_notifications_total
```

```bash
# process-exporter
process_cpu_seconds_total
```

```bash
# HTTPリクエスト
http_request_duration_seconds
```

> - https://prometheus.io/docs/practices/naming/#metric-names

<br>

### ローカルストレージ (`prometheus_tsdb_*`)

#### ▼ prometheus_tsdb_head_samples_appended_total

Prometheusが収集したデータポイントの合計数を表す。

```bash
prometheus_tsdb_head_samples_appended_total
```

> ↪️：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

#### ▼ prometheus_tsdb_compaction_chunk_size_bytes_sum

Prometheusが作成したチャンクの合計サイズ (KB) を表す。

```bash
prometheus_tsdb_compaction_chunk_size_bytes_sum
```

> ↪️：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

#### ▼ prometheus_tsdb_compaction_chunk_samples_sum

Prometheusが作成したチャンクの合計数を表す。

```bash
prometheus_tsdb_compaction_chunk_samples_sum
```

> ↪️：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

<br>

## 02-02. 外部から収集したメトリクス

### kubeletから収集したメトリクス

#### ▼ container_cpu_usage_seconds_total

CPUの使用時間を表す。

```bash
container_cpu_usage_seconds_total
```

> - https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part5.html

<br>

## 03. ディメンション

### 指定方法

メトリクス名の後に`{<ディメンション名>}`を設定することにより、ディメンションを単位としてデータポイントを集計する。

<br>

### ディメンションの種類

#### ▼ container

コンテナ名を表す。

#### ▼ service

KubernetesのService名を表す。

#### ▼ instance

NodeのIPアドレスとポート番号を表す。

#### ▼ job

`scrape_configs`キー配下の`job_name`キー名を表す。

<br>
