---
title: 【IT技術の知見】Exporter＠Prometheus
description: Exporter＠Prometheus
---

# Exporter＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Exporter

### Exporterとは

PrometheusがPull型通信でメトリクスのデータポイントを収集するためのエンドポイントとして動作する。

基本的にはデータポイントを収集したいNode内で稼働させるが、一部のExporter (例：外形監視のblack-exporter) は、Node外で稼働させる。

Pull型通信により、アプリケーションはPrometheusの存在を知る必要がなく、関心を分離できる。収集したいメトリクスに合わせて、ExporterをKubernetesのNodeに導入する必要がある。

また、各Exporterは待ち受けるエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各Nodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

> ↪️ 参考：
>
> - https://openstandia.jp/oss_info/prometheus
> - https://danielfm.me/prometheus-for-developers/

<br>

### Exporterの種類

#### ▼ タイプ

Exporterには、KubernetesのNode上でどう稼働させるかに応じて、タイプがある。

| タイプ          | 設置方法                                         |
| --------------- | ------------------------------------------------ |
| DaemonSet       | 各Node上にDaemonSetとして設置する。              |
| Deployment      | 各Node上にDeploymentとして設置する。             |
| Pod内サイドカー | Pod内にサイドカーとして設置する。                |
| 埋め込み型      | ライブラリとして、アプリケーション内に埋め込む。 |

> ↪️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072
> - https://prometheus.io/docs/instrumenting/exporters/
> - https://grafana.com/oss/prometheus/exporters/

#### ▼ DaemonSet

| Exporter名                                                        | 説明                                                                                                                                                                                     | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名     |
| :---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ---------------- |
| [node-exporter](https://github.com/prometheus/node_exporter)      | Nodeに関するメトリクスのデータポイントを収集する。                                                                                                                                       | `9100`             | `/metrics`             | `node_*`         |
| [process-exporter](https://github.com/ncabatoff/process-exporter) | 任意のプロセスに関するメトリクスのデータポイントを収集する。収集対象のプロセス名は`config.yaml`ファイルで設定できる。 <br>↪️ 参考：https://qiita.com/kkentaro/items/c01b8cf332da893791bb | `9256`             | 同上                   | `namedprocess_*` |

#### ▼ Deployment

| Exporter名                                                                               | 説明                                                                                                                                                                                                                                                                                                                                 | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :--------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ---------------------- | ------------ |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)                   | Kubernetesのリソース単位でメトリクスのデータポイントを収集する。似た名前のツールにmetrics-serverがあるが、こちらはNodeとPodのみを対象としており、またapiserverとして稼働する。<br>↪️ 参考：<br>・https://tech-blog.abeja.asia/entry/2016/12/20/202631 <br>・https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/ | `8080`             | 同上                   | `kube_*`     |
| [black box expoter](https://github.com/prometheus/blackbox_exporter)                     | 各種通信プロトコルの状況をメトリクスとして収集する。                                                                                                                                                                                                                                                                                 | `9115`             | 同上                   |              |
| [elasticsearch-exporter](https://github.com/prometheus-community/elasticsearch_exporter) | ElasticSearchに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                                                          | `9114`             | 同上                   |              |

#### ▼ Pod内サイドカー

| Exporter名                                                                     | 説明                                                                                                                                               | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ------------ |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter)            | Nginxに関するメトリクスのデータポイントを収集する。                                                                                                | `9113`             | 同上                   |              |
| [apache-exporter](https://github.com/Lusitaniae/apache_exporter)               | Apacheに関するメトリクスのデータポイントを収集する。                                                                                               | `9117`             | 同上                   |              |
| [mysqld-exporter](https://github.com/prometheus/mysqld_exporter)               | MySQL/MariaDBに関するメトリクスのデータポイントを収集する。                                                                                        | `9104`             | 同上                   |              |
| [postgres-exporter](https://github.com/prometheus-community/postgres_exporter) | PostgreSQLに関するメトリクスのデータポイントを収集する。<br>↪️ 参考：https://grafana.com/oss/prometheus/exporters/postgres-exporter/#metrics-usage | `9187`             | 同上                   |              |
| [oracledb-exporter](https://github.com/iamseth/oracledb_exporter)              | Oracleに関するメトリクスのデータポイントを収集する。                                                                                               | `9121`             | 同上                   |              |
| [redis-exporter](https://github.com/oliver006/redis_exporter)                  | Redisに関するメトリクスのデータポイントを収集する。                                                                                                | `9121`             | 同上                   |              |

### ▼ 埋め込み型

| Exporter名          | 説明 | Exportタイプ | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :------------------ | ---- | ------------ | ------------------ | ---------------------- | ------------ |
| open-telemetryのSDK |      | 埋め込み型   |                    |                        |              |

<br>

## 02. Node exporter

### メトリクスの種類

Node exporterの場合は、Nodeの`127.0.0.1:9100/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9100/metrics

...

node_exporter_build_info{branch="HEAD",goversion="go1.15.8",revision="4e837d4da79cc59ee3ed1471ba9a0d9547e95540",version="1.1.1"} 1

...
```

> ↪️ 参考：
>
> - https://prometheus.io/docs/guides/node-exporter/#node-exporter-metrics
> - https://grafana.com/oss/prometheus/exporters/node-exporter/assets/node_exporter_sample_scrape.txt

<br>

### PromQLを使用したメトリクス分析

#### ▼ CPU使用率

NodeのCPU使用率を取得する。

```bash
rate(node_cpu_seconds_total[1m])
```

> ↪️ 参考：https://qiita.com/Esfahan/items/01833c1592910fb11858#cpu%E4%BD%BF%E7%94%A8%E7%8E%87

#### ▼ メモリ使用率

Nodeのメモリ使用率を取得する。

```bash
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

> ↪️ 参考：https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%A1%E3%83%A2%E3%83%AA%E4%BD%BF%E7%94%A8%E7%8E%87

#### ▼ ディスク使用率

Nodeのディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100
```

`mountpoint`ディメンションを使用して、マウントポイント別のディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes{mountpoint="/var/lib/data"} / node_filesystem_size_bytes{mountpoint="/var/lib/data"} ) * 100
```

`job`ディメンションを使用して、収集対象別にのディスク使用率を取得する。

```bash
100 - (node_filesystem_avail_bytes{job="foo-node"} / node_filesystem_size_bytes{job="foo-node"} ) * 100
```

> ↪️ 参考：https://qiita.com/Esfahan/items/01833c1592910fb11858#%E3%83%87%E3%82%A3%E3%82%B9%E3%82%AF%E5%AE%B9%E9%87%8F

#### ▼ ディスクのI/OによるCPU使用率

ディスクのI/OによるCPU使用率 (ディスクのI/OがNodeのCPUをどの程度使用しているか) を取得する。

`iostat`コマンドの`%util`指標と同じである。

```bash
rate(node_disk_io_time_seconds_total[1m])
```

> ↪️ 参考：
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

> ↪️ 参考：https://christina04.hatenablog.com/entry/prometheus-node-monitoring

#### ▼ パケットの受信サイズ

Nodeのパケットの受信サイズを取得する。

```bash
node_network_receive_packets_total
```

これを使用して、DDOS攻撃のアラートを作成することもできる。

```bash
(rate(node_network_receive_packets_total[5m]) / rate(node_network_receive_packets_total[5m] offset 5m)) > 10
```

> ↪️ 参考：https://stackoverflow.com/questions/72947434/how-to-alert-anomalies-on-network-traffic-jump-with-prometheus

<br>

## 03. MySQL exporter

### メトリクスの種類

PostgreSQL exporterの場合は、Nodeの`127.0.0.1:9104/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://localhost:9104/metrics

...

postgres_exporter_build_info{branch="",goversion="go1.15.8",revision="",version="0.0.1"} 1

...
```

> ↪️ 参考：
>
> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/
> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/assets/postgres_metrics_scrape.txt

<br>

## 04. PostgreSQL exporter

### メトリクスの種類

PostgreSQL exporterの場合は、Nodeの`127.0.0.1:9187/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://localhost:9187/metrics

...

mysqld_exporter_build_info{branch="HEAD",goversion="go1.12.7",revision="48667bf7c3b438b5e93b259f3d17b70a7c9aff96",version="0.12.1"} 1

...
```

> ↪️ 参考：
>
> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/
> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/assets/mysql_metrics_scrape.txt

<br>

### PromQLを使用したメトリクス分析

#### ▼ PostgreSQLのプロセスのステータス

PostgreSQLのプロセスのステータスを分析する。

`pg_up`は、PostgreSQLのプロセスのステータスを表す。

正常な場合に`1`、異常な場合に`0`となる。

```bash
pg_up == 0
```

> ↪️ 参考：https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html

#### ▼ PostgreSQLの連続稼働時間

`pg_postmaster_start_time_seconds`は、PostgreSQLのマスタープロセス (postmasterプロセス) の連続稼働時間を表す。

```bash
time() - pg_postmaster_start_time_seconds
```

> ↪️ 参考：
>
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html
> - https://www.oreilly.com/library/view/postgresql-9-administration/9781849519069/ch02s03.html
> - https://www.ashisuto.co.jp/db_blog/article/20151221_pg_monitoring.html

#### ▼ DBインスタンス間のデータ同期の遅延

PostgreSQLで、RepmgrによるDBクラスターを採用している場合に、DBインスタンス間のデータ同期の遅延を分析する。

`pg_replication_lag`は、DBインスタンス間のデータ同期にかかる時間を表す。

```bash
pg_replication_lag > 10
```

> ↪️ 参考：https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html

<br>

## 05. Redis exporter

### メトリクスの種類

Redis exporterの場合は、Nodeの`127.0.0.1:9121/metrics`』をコールすると、PromQLで使用できるメトリクスを取得できる。

```bash
# Node内でコールする。
$ curl http://localhost:9121/metrics

...

redis_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> ↪️ 参考：
>
> - https://grafana.com/oss/prometheus/exporters/redis-exporter/
> - https://grafana.com/oss/prometheus/exporters/redis-exporter/assets/sample_scrape.out.txt

<br>
