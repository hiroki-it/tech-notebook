---
title: 【知見を記録するサイト】Prometheus＠テレメトリー収集ツール
description: Prometheus＠テレメトリー収集ツールの知見をまとめました。

---

# Prometheus＠テレメトリー収集ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Prometheusの仕組み

### 構造

Prometheusは、Retrieval、TSDB、HTTPサーバー、から構成されている。Kubernetesリソースのメトリクスのデータポイントを収集し、分析する。また設定された条件下でアラートを生成し、Alertmanagerに送信する。

参考：

- https://prometheus.io/docs/introduction/overview/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

### Prometheus server

#### ▼ Prometheus serverとは

メトリクスのデータポイントを収集し、管理する。またPromQLに基づいて、データポイントからメトリクスを分析できるようにする。```9090```番ポートで、メトリクスのデータポイントを待ち受ける。

参考：https://knowledge.sakura.ad.jp/27501/#Prometheus_Server

#### ▼ ローカルストレージ

Prometheusは、自身が持つストレージに、収集した全てのメトリクスを保管する。Prometheusは、収集したメトリクスをデフォルトで```2```時間ごとにブロック化し、```data```ディレクトリ以下に配置する。現在処理中のブロックはメモリ上に保持されており、同時に```/data/wal```ディレクトリにもバックアップとして保存される（ちなみにRDBMSでは、これをジャーナルファイルという）。これにより、Prometheusで障害が起こり、メモリ上のブロックが削除されてしまっても、ブロックを復元できる。

参考：https://prometheus.io/docs/prometheus/latest/storage/#local-storage

```yaml
data/
├── 01BKGV7JC0RY8A6MACW02A2PJD/
│   ├── chunks/
│   │   └── 000001
│   │
│   ├── tombstones
│   ├── index
│   └── meta.json
│
├── chunks_head/
│   └── 000001
│
└── wal # WALによるバックアップ
    ├── 000000002
    └── checkpoint.00000001/
        └── 00000000
```

#### ▼ リモートストレージ

![prometheus_remote-storage](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_remote-storage.png)

Prometheusは、ローカルストレージにメトリクスを保管する代わりに、TSDB（時系列データベース）として機能する外部ストレージ（AWS Timestream、Google Bigquery、VictoriaMetrics、...）に保管できる。エンドポイントは、『```https://<IPアドレス>/api/v1/write```』になる。

参考：

- https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations
- https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage

#### ▼ ダイナミックキュー

リモートストレージにメトリクスを送信する場合に、送信されたメトリクスをキューイングする。ダイナミックキューは、メトリクスのスループットの高さに応じて、キューイングの実行単位であるシャードを増減させる。

参考：https://speakerdeck.com/inletorder/monitoring-platform-with-victoria-metrics?slide=52

![prometheus_dynamic-queues_shard](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_dynamic-queues_shard.png)

<br>

### Alertmanager

#### ▼ Alertmanagerとは

Prometheusからアラートを受信し、特定の条件下でルーティングする。

参考：

- https://prometheus.io/docs/alerting/latest/alertmanager/
- https://www.designet.co.jp/ossinfo/alertmanager/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![alertmanager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alertmanager.png)

<br>

### Exporter

#### ▼ Exporterとは

PrometheusがPull型通信でメトリクスのデータポイントを収集するためのエンドポイントとして機能する。収集したいメトリクスに合わせて、Exporterを選ぶ必要がある。また、各Exporterは待ち受けているエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各ワーカーNodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

参考：https://openstandia.jp/oss_info/prometheus

#### ▼ Exporterタイプ

| タイプ       | 設置方法                                          |
| ------------ | ------------------------------------------------- |
| DaemonSet型  | 各ワーカーNode内に、1つずつ設置する。             |
| Deployment型 | 各ワーカーNode内のDeploymentに、1つずつ設置する。 |
| Sidecar型    | 各ワーカーNode内のPodに、1つずつ設置する。        |

**＊例＊**

参考：

- https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072
- https://prometheus.io/docs/instrumenting/exporters/

| Exporter名                                                   | Exportタイプ | ポート番号 | エンドポイント | 説明                                                         |
| :----------------------------------------------------------- | ------------ | ---------- | -------------- | ------------------------------------------------------------ |
| [node-exporter](https://github.com/prometheus/node_exporter) | DaemonSet型  | ```9100``` | ```/metrics``` | ノードのメトリクスのデータポイントを収集する。               |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) | Deplyoment型 | ```8080``` | 同上           | Kubernetesのリソース単位でメトリクスのデータポイントを収集する。<br>参考：https://tech-blog.abeja.asia/entry/2016/12/20/202631 |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter) | Sidecar型    | ```9113``` | 同上           | Nginxのメトリクスのデータポイントを収集する。                |
| [apache-exporter](https://github.com/Lusitaniae/apache_exporter) | Sidecar型    | ```9117``` | 同上           | Apacheのメトリクスのデータポイントを収集する。               |
| [black box expoter](https://github.com/prometheus/blackbox_exporter) | Deplyoment型 | ```9115``` | 同上           | 各種通信プロトコルの状況をメトリクスとして収集する。         |
| [mysqld-exporter](https://github.com/prometheus/mysqld_exporter) | Sidecar型    | ```9104``` | 同上           | MySQL/MariaDBのメトリクスのデータポイントを収集する。        |
| [postgres-exporter](https://github.com/prometheus-community/postgres_exporter) | Sidecar型    | ```9187``` | 同上           | PostgreSQLのメトリクスのデータポイントを収集する。           |
| [oracledb-exporter](https://github.com/iamseth/oracledb_exporter) | Sidecar型    | ```9121``` | 同上           | Oracleのメトリクスのデータポイントを収集する。               |
| [elasticsearch-exporter](https://github.com/prometheus-community/elasticsearch_exporter) | Deployment型 | ```9114``` | 同上           | ElasticSearchのメトリクスのデータポイントを収集する。        |
| [redis-exporter](https://github.com/oliver006/redis_exporter) | Sidecar型    | ```9121``` | 同上           | Redisのメトリクスのデータポイントを収集する。                |

#### ▼ PushGateway

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして機能する。

参考：https://prometheus.io/docs/practices/pushing/

<br>

## 02. PromQL

### PromQLとは

Prometheusで収集したメトリクスを抽出し、集計できる。

<br>

### メトリクス

#### ▼ 単位について

サイズに関するメトリクスでは、単位はデフォルトで```KB```になる。

#### ▼ prometheus_tsdb_head_samples_appended_total

データポイントの合計数を表す。

参考：

- https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
- https://christina04.hatenablog.com/entry/prometheus-node-exporter

```bash
prometheus_tsdb_head_samples_appended_total
```

#### ▼ prometheus_tsdb_compaction_chunk_size_bytes_sum

チャンクの合計サイズ（KB）を表す。

参考：

- https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
- https://christina04.hatenablog.com/entry/prometheus-node-exporter

```bash
prometheus_tsdb_compaction_chunk_size_bytes_sum
```

#### ▼ prometheus_tsdb_compaction_chunk_samples_sum

チャンクの合計数を表す。

参考：

- https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
- https://christina04.hatenablog.com/entry/prometheus-node-exporter

```bash
prometheus_tsdb_compaction_chunk_samples_sum
```

<br>

### 関数

#### ▼ count

時間範囲内の合計数を算出する。

参考：https://www.opsramp.com/prometheus-monitoring/promql/

```bash
count()
```

#### ▼ increase

```bash
increase()
```

#### ▼ rate

1秒当たりの平均増加率を算出する。常に同じ割合で増加していく場合、横一直線のグラフになる。

参考：https://www.opsramp.com/prometheus-monitoring/promql/

```bash
rate()
```

<br>

### Tips

#### ▼ 一秒当たりの平均サイズ（KB）の増加率

データポイントに関して、一秒当たりの平均サイズ（KB）の増加率を分析する。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h])
```

#### ▼ 一秒当たりの合計数の増加率

データポイントに関して、一秒当たりの合計数の増加率を分析する。

```bash
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

#### ▼ 一秒当たりの合計サイズ（KB）の増加率

データポイントに関して、一秒当たりの合計サイズ（KB）の増加率を分析する。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h])
```

#### ▼ 一日当たりの合計サイズ（KB）の増加率

データポイントに関して、一日当たりの合計サイズ（KB）の増加率を分析する。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24
```

#### ▼ 一日当たりに要するストレージの最低サイズ（KB）の増加率

データポイントに関して、一日当たりに要するストレージの最低サイズ（KB）の増加率を分析する。その他に必要な追加サイズも考慮すると、20%分のサイズが必要になる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24 *
1.2
```

参考：

- https://www.robustperception.io/how-much-disk-space-do-prometheus-blocks-use/
- https://www.robustperception.io/how-much-space-does-the-wal-take-up/
- https://discuss.prometheus.io/t/prometheus-storage-requirements/268/4
- https://gist.github.com/mikejoh/c172b2400909d33c37199c9114df61ef

<br>
