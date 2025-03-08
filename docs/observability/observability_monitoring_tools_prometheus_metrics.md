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

数を単位とするメトリクス (例：`go_gc_duration_seconds_count`) が所属する。

> - https://prometheus.io/docs/tutorials/understanding_metric_types/#counter

#### ▼ Gauge

動的に増減するメトリクス (例：`go_memstats_heap_alloc_bytes`) が所属する。

> - https://prometheus.io/docs/tutorials/understanding_metric_types/#gauge

#### ▼ Histogram

時間の範囲を単位とするメトリクス (例：`prometheus_http_request_duration_seconds_bucket`) が所属する。

> - https://prometheus.io/docs/tutorials/understanding_metric_types/#histogram
> - https://prometheus.io/docs/practices/histograms/

#### ▼ Summary

統計的な分位数を単位とするメトリクス

> - https://prometheus.io/docs/tutorials/understanding_metric_types/#summary
> - https://prometheus.io/docs/practices/histograms/

<br>

### メタデータ

Prometheusのメトリクスには、メタデータとして『ラベル』を付与できる。

> - https://docs.logz.io/docs/user-guide/infrastructure-monitoring/introduction-to-prometheus/explore-metrics-prometheus/#prometheus-metrics-metadata-labels

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
# HTTPのリクエスト
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

> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

#### ▼ prometheus_tsdb_compaction_chunk_size_bytes_sum

Prometheusが作成したチャンクの合計サイズ (KB) を表す。

```bash
prometheus_tsdb_compaction_chunk_size_bytes_sum
```

> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

#### ▼ prometheus_tsdb_compaction_chunk_samples_sum

Prometheusが作成したチャンクの合計数を表す。

```bash
prometheus_tsdb_compaction_chunk_samples_sum
```

> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

<br>

## 02-02. 外部から収集したデータポイント

### AWS EKSから収集したデータポイント

AWS EKSで利用できるAPI名を表す。

```bash
aggregator_unavailable_apiservice{job="apiserver", name="<API名>"}

aggregator_unavailable_apiservice{job="apiserver", name="v1.metrics.eks.amazonaws.com"}
```

> - https://docs.aws.amazon.com/grafana/latest/userguide/solution-eks.html#solution-eks-metrics

<br>

### kubeletから収集したデータポイント

#### ▼ container_cpu_usage_seconds_total

コンテナのCPUの使用時間を表す。

インターネットではこれをCPU使用率と言っている記事が多くあるが、このメトリクスだけではコンテナのCPU使用率の分子を表すだけである。

```bash
container_cpu_usage_seconds_total
```

`kube_pod_container_resource_requests`メトリクスや`kube_pod_container_resource_limits`を使用して、CPU使用率を算出できる。

```bash
# Pod単位のCPU使用率
# メモリ実際値 / 下限値 (.spec.containers[*].resources.requestsキー)
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (pod) / sum(kube_pod_container_resource_requests{resouce="cpu"}) by (pod) * 100
```

```bash
# Pod単位のCPU使用率
# メモリ実際値 / 下限値 (.spec.containers[*].resources.limitsキー)
sum(rate(container_cpu_usage_seconds_total{container!=""}[5m])) by (pod) / sum(kube_pod_container_resource_limits{resouce="cpu"}) by (pod) * 100
```

> - https://aws.amazon.com/jp/blogs/news/monitoring-amazon-eks-on-aws-fargate-using-prometheus-and-grafana/
> - https://signoz.io/guides/prometheus-queries-to-get-cpu-and-memory-usage-in-kubernetes-pods/#how-to-query-cpu-usage-in-kubernetes-pods-with-prometheus

#### ▼ container_memory_working_set_bytes

`kube_pod_container_resource_requests`メトリクスや`kube_pod_container_resource_limits`を使用して、CPU使用率を算出できる。

```bash
# Pod単位のメモリ使用率
# メモリ実際値 / メモリ下限値 (.spec.containers[*].resources.requestsキー)
sum(container_memory_working_set_bytes) by (pod) / sum(kube_pod_container_resource_requests{resource="memory"}) by (pod)  * 100
```

```bash
# Pod単位のメモリ使用率
# メモリ実際値 / メモリ上限値 (.spec.containers[*].resources.limitsキー)
sum(container_memory_working_set_bytes) by (pod) / sum(kube_pod_container_resource_limits{resource="memory"}) by (pod) * 100
```

> - https://aws.amazon.com/jp/blogs/news/monitoring-amazon-eks-on-aws-fargate-using-prometheus-and-grafana/
> - https://signoz.io/guides/prometheus-queries-to-get-cpu-and-memory-usage-in-kubernetes-pods/#how-to-query-cpu-usage-in-kubernetes-pods-with-prometheus

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

## 04. プラクティス

### container!="POD"

一時的に停止しているコンテナを除ける。

```bash
sum (rate (container_cpu_usage_seconds_total{image!="",container!="POD",pod=~"^$Deployment.*$"}[1m])) by (container, pod) / sum(kube_pod_container_resource_limits{resource="cpu",container!="POD",pod=~"^$Deployment.*$"}) by (container, pod) * 100
```

> - https://stackoverflow.com/a/68744740/12771072

<br>
