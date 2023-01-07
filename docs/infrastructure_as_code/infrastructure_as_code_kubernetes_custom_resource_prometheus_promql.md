---
title: 【IT技術の知見】PromQL＠Prometheus
description: PromQL＠Prometheus
---

# PromQL＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. 要素

### データ型

#### ▼ Instant vector

特定の時点の時系列データのこと。



> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Range vector

特定の期間の時系列データのこと。



> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Scalar

浮動小数点の数値型データのこと。



> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ String

文字列型データのこと。



> ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

<br>

### 関数

#### ▼ by

同じ種類のデータポイントをラベル単位で集約する。



> ℹ️ 参考：https://qiita.com/t_nakayama0714/items/1231751e72804d52c20a#2-3-%E3%83%87%E3%83%BC%E3%82%BF%E3%82%92%E9%9B%86%E8%A8%88%E3%81%99%E3%82%8B

```bash
# 直近1時間に関して、Istioのistio-proxyコンテナが受信した総リクエストのデータポイントを、コンテナの種類ごとに集約する。
sum(rate(istio_requests_total{destination_app=~".*-gateway"}[1h])) by (destination_app)
```

#### ▼ count

期間内の合計数を算出する。



> ℹ️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

#### ▼ increase

rate関数のラッパーであり、rate関数の結果（平均増加率）に、期間を自動的に掛けた数値（期間あたりの増加数）を算出する。



> ℹ️ 参考：https://promlabs.com/blog/2021/01/29/how-exactly-does-promql-calculate-rates

```bash
# rate関数に期間（今回は5m）を自動的に掛けた数値を算出する。
increase(foo_metrics[5m])
# foo_metricsの平均増加率（%/秒）を集計する。
= rate(foo_metrics[1h]) * 5 * 60
```

#### ▼ rate

平均増加率（%/秒）を算出する。

常に同じ割合で増加していく場合、横一直線のグラフになる。



> ℹ️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

```bash
# 直近1時間に関して、foo_metricsの平均増加率（%/秒）を集計する。
rate(foo_metrics[1h])
```

#### ▼ ```[]```（ウィンドウ）

直近、何時間（分、秒）のデータポイントを集計するかを設定する。数値を大きくするほど、なだらかになる。

```bash
# 直近5分に関して、foo_metricsの平均増加率（%/秒）を集計する。
rate(foo_metrics[5m])
```

> ℹ️ 参考：
> 
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/promql_1.html
> - https://christina04.hatenablog.com/entry/prometheus-rate
> - https://qiita.com/t_nakayama0714/items/1231751e72804d52c20a#3-0-range-vector%E3%81%A8instant-vector> 
> - https://gavin-zhou.medium.com/victoriametrics%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%A6%E3%82%88%E3%82%8A%E3%82%88%E3%81%84prometheus-rate-%E9%96%A2%E6%95%B0-6a69c36cee8f

<br>

### ディメンション

#### ▼ 指定方法

メトリクス名の後に```{<ディメンション名>}```を設定することで、ディメンションを単位としてデータポイントを集計する。

#### ▼ ディメンションの種類

各メトリクスに共通するディメンションを示す。



| 名前      | 説明                                          |
|-----------|----------------------------------------------|
| container | コンテナ名                                        |
| service   | Service名                                     |
| instance  | NodeのIPアドレスとポート番号                           |
| job       | ```scrape_configs```キー配下の```job_name```キー名 |


<br>

## 02. 標準メトリクス

### ローカルストレージのメトリクス（```prometheus_tsdb_*```）

#### ▼ prometheus_tsdb_head_samples_appended_total

Prometheusが収集したデータポイントの合計数を表す。



> ℹ️ 参考：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter


#### ▼ prometheus_tsdb_compaction_chunk_size_bytes_sum

Prometheusが作成したチャンクの合計サイズ（KB）を表す。



> ℹ️ 参考：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

#### ▼ prometheus_tsdb_compaction_chunk_samples_sum

Prometheusが作成したチャンクの合計数を表す。



> ℹ️ 参考：
>
> - https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
> - https://christina04.hatenablog.com/entry/prometheus-node-exporter

<br>

## 02-02. 標準メトリクスを使用したクエリ

### データポイントの各種数値の算出

#### ▼ データポイントの平均サイズ（KB/秒）の増加率

Prometheusで収集されたデータポイントの平均サイズ（KB/秒）の増加率を分析する。



```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h])
```

#### ▼ データポイントの合計数（個/秒）の増加率

Prometheusで収集されたデータポイントの合計数（個/秒）の増加率を分析する。



```bash
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

#### ▼ データポイントの合計サイズ（KB/秒）の増加率

Prometheusで収集されたデータポイントの合計サイズ（KB/秒）の増加率を分析する。

計算式からもわかるように、データポイントの収集の間隔を長くすることにより、データポイント数が減るため、合計のサイズを小さくできる。



> ℹ️ 参考：https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

#### ▼ データポイントの合計サイズ（KB/日）の推移

Prometheusで収集されたデータポイントの合計サイズ（KB/日）の推移を分析する。



```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24
```

<br>

### ストレージの各種数値の算出

#### ▼ ローカルストレージの必要サイズ（KB/日）

データポイントの合計サイズ（KB/日）とローカルストレージの部品ファイルの合計を分析する。

ローカルストレージの部品ファイル分で、```20```%のサイズが必要になる。

この結果から、ローカルストレージの必要サイズを推測できる。



```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24 *
1.2
```

> ℹ️ 参考：
>
> - https://www.robustperception.io/how-much-disk-space-do-prometheus-blocks-use/
> - https://www.robustperception.io/how-much-space-does-the-wal-take-up/
> - https://discuss.prometheus.io/t/prometheus-storage-requirements/268/4
> - https://gist.github.com/mikejoh/c172b2400909d33c37199c9114df61ef

#### ▼ リモートストレージの必要サイズ（KB/日）

Prometheusで収集されたデータポイントの全サイズうち、リモートストレージに実際に送信しているサイズ（KB/日）を分析する。

この結果から、リモートストレージの必要サイズを推測できる。

なお、リモートストレージが送信された全てのデータを保管できるとは限らないため、リモートストレージ側で必要サイズを確認する方がより正確である。



```bash
rate(prometheus_remote_storage_bytes_total[1h]) *
60 * 60 * 24
```

<br>

## 03. node-exporter

### node-exporterのメトリクス

node-exporterの場合は、Nodeの```127.0.0.1:9100/metrics```』をコールすると、PromQLで使用できるメトリクスを取得できる。

> ℹ️ 参考：https://prometheus.io/docs/guides/node-exporter/#node-exporter-metrics

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9100/metrics

# HELP go_gc_duration_seconds A summary of the pause duration of garbage collection cycles.
# TYPE go_gc_duration_seconds summary

go_gc_duration_seconds{quantile="0"} 4.1869e-05
go_gc_duration_seconds{quantile="0.25"} 6.52e-05
go_gc_duration_seconds{quantile="0.5"} 9.7895e-05
go_gc_duration_seconds{quantile="0.75"} 0.000174561
go_gc_duration_seconds{quantile="1"} 0.006224318
go_gc_duration_seconds_sum 29.83657924
...
```

<br>

### node-exporterのメトリクスを使用したクエリ

#### ▼ CPU使用率

NodeのCPU使用率を取得する。



> ℹ️ 参考：https://qiita.com/Esfahan/items/01833c1592910fb11858#cpu%E4%BD%BF%E7%94%A8%E7%8E%87

```bash
rate(node_cpu_seconds_total[1m])
```

#### ▼ メモリ使用率

Nodeのメモリ使用率を取得する。



> ℹ️ 参考：https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%A1%E3%83%A2%E3%83%AA%E4%BD%BF%E7%94%A8%E7%8E%87

```bash
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

#### ▼ ディスク使用率

Nodeのディスク使用率を取得する。



> ℹ️ 参考：https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E5%AE%B9%E9%87%8F

```bash
100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
```

```mountpoint```ディメンションを使用して、マウントポイント別のディスク使用率を取得する。


A
```bash
100 - (node_filesystem_avail_bytes{mountpoint="/var/lib/data"} / node_filesystem_size_bytes{mountpoint="/var/lib/data"} ) * 100
```

```job```ディメンションを使用して、収集対象別にのディスク使用率を取得する。



```bash
100 - (node_filesystem_avail_bytes{job="foo-node"} / node_filesystem_size_bytes{job="foo-node"} ) * 100
```

#### ▼ ディスクのI/OによるCPU使用率

ディスクのI/OによるCPU使用率（ディスクのI/OがNodeのCPUをどの程度使用しているか）を取得する。

```iostat```コマンドの```%util```指標と同じである。



```bash
rate(node_disk_io_time_seconds_total[1m])
```

> ℹ️ 参考：
> 
> - https://brian-candler.medium.com/interpreting-prometheus-metrics-for-linux-disk-i-o-utilization-4db53dfedcfc
> - https://christina04.hatenablog.com/entry/prometheus-node-monitoring
> - https://www.qoosky.io/techs/42affa2c4b

#### ▼ ディスクのI/Oレイテンシー

```bash
# 読み出しレイテンシー
rate(node_disk_read_time_seconds_total[1m]) / rate(node_disk_reads_completed_total[1m])
```

```bash
# 書き込みレイテンシー
rate(node_disk_write_time_seconds_total[1m]) / rate(node_disk_writes_completed_total[1m])
```

> ℹ️ 参考：https://christina04.hatenablog.com/entry/prometheus-node-monitoring


#### ▼ パケットの受信サイズ

Nodeのパケットの受信サイズを取得する。



> ℹ️ 参考：https://stackoverflow.com/questions/72947434/how-to-alert-anomalies-on-network-traffic-jump-with-prometheus

```bash
node_network_receive_packets_total
```

これを使用して、DDOS攻撃のアラートを作成することもできる。



```bash
(rate(node_network_receive_packets_total[5m]) / rate(node_network_receive_packets_total[5m] offset 5m)) > 10
```

<br>
