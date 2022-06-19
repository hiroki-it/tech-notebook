---
title: 【知見を記録するサイト】可観測性ツール
description: 可観測性ツールの知見をまとめました。
---

# 可観測性ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 可観測性ツールの比較

### メトリクス

参考：

- https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
- https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6

| アクション                 | cAdvisor | Grafana | Kiali | kube-state-metrics | Prometheus |
| -------------------------- | -------- | ------- | ----- | ------------------ | ---------- |
| メトリクスの収集           | ✅        |         | ✅     | ✅                  | ✅          |
| ↓                          |          |         |       |                    |            |
| 組み込みローカルストレージへの保管 |          |         |       |                    |            |
| 分析                       | ✅        |         | ✅     | ✅                  | ✅          |
| 可視化                     | ✅        | ✅       |       |                    |            |
| レポートの作成             |          |         |       |                    |            |
| ↓                          |          |         |       |                    |            |
| アラート                   |          |         |       |                    |            |

<br>

### ログ

参考：https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars

| アクション                 | Elasticsearch | Grafana loki | Logstash |
| -------------------------- | ------------- | ------------ | -------- |
| ログの収集                 |               |              |          |
| ↓                          |               |              |          |
| 組み込みローカルストレージへの保管 | ✅             | ✅（BoltDB）    |         |
| 分析                       | ✅             | ✅            | ✅        |
| 可視化                     |               |              |          |
| レポートの作成             |               |              |          |
| ↓                          |               |              |          |
| アラート                   |               |              |          |

<br>

### 分散トレース

参考：https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars

| アクション                 | Jaeger | Zipkin | Pinpoint | OpenTelemetry |
| -------------------------- | ------ | ------ | -------- | ------------- |
| 分散トレースの収集         | ✅      | ✅      | ✅        | ✅             |
| ↓                          |        |        |          |               |
| 組み込みローカルストレージへの保管 | ✅（Badger） |        |          |               |
| 分析                       | ✅      | ✅      | ✅        | ✅             |
| 可視化                     | ✅      | ✅      | ✅        |               |
| レポートの作成             |        |        |          |               |
| ↓                          |        |        |          |               |
| アラート                   |        |        |          |               |

<br>

## 02. Grafana

### Grafanaの仕組み

#### ▼ 構造

Grafanaは、ダッシュボードとストレージから構成されている。PromQLに基づいて、収集されたメトリクスを可視化する。

参考：https://community.grafana.com/t/architecture-of-grafana/50090

![grafana_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images//grafana_architecture.png)

<br>

## 03. Jaeger

### 仕組み

#### ▼ 構造

Kubernetesリソースの分散トレースを収集し、これの分析と可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>

## 04. Kiali

### Kialiの仕組み

#### ▼ 構造

Prometheusで収集されたメトリクスを再収集し、Istioの可視化を拡張する。現状は、Istioのコンポーネントに依存している。

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>

## 05. Prometheus

### Prometheusの仕組み

Prometheusは、Retrieval、TSDB、HTTPサーバー、から構成されている。EKubernetesリソースのメトリクスを収集し、分析する。また設定された条件下でアラートを生成し、Alertmanagerに送信する。

参考：

- https://prometheus.io/docs/introduction/overview/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

### Prometheus server

#### ▼ Prometheus serverとは

メトリクスを収集し、管理する。またPromQLに基づいて、メトリクスを分析できるようにする。

参考：https://knowledge.sakura.ad.jp/27501/#Prometheus_Server

#### ▼ ローカルストレージ

Prometheusは、自身が持つストレージにメトリクスを保管する。Prometeusは、収集したメトリクスをデフォルトで```2```時間ごとにブロック化し、```data```ディレクトリ以下に配置する。現在処理中のブロックはメモリ上に保持されており、同時に```/data/wal```ディレクトリにもバックアップとして保存される（ちなみにRDBMSでは、これをジャーナルファイルという）。これにより、Prometheusで障害が起こり、メモリ上のブロックが削除されてしまっても、ブロックを復元できる。

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

Prometheusは、ローカルストレージにメトリクスを保管する代わりに、時系列データに対応できる外部ストレージ（AWS Timestream、Google Bigquery、VictoriaMetrics、...）に保管できる。エンドポイントは、『```https://<IPアドレス>/api/v1/write```』になる。

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

PrometheusがPull型通信でメトリクスを収集するためのエンドポイントとして機能する。収集したいメトリクスに合わせて、Exporterを選ぶ必要がある。また、各Exporterは待ち受けているエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各ワーカーNodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

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
| [node-exporter](https://github.com/prometheus/node_exporter) | DaemonSet型  | ```9100``` | ```/metrics``` | ノードのメトリクスを収集する。                               |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) | Deplyoment型 | ```8080``` | 同上           | Kubernetesのリソース単位でメトリクスを収集する。<br>参考：https://tech-blog.abeja.asia/entry/2016/12/20/202631 |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter) | Sidecar型    | ```9113``` | 同上           | Nginxのメトリクスを収集する。                                |
| [apache-exporter](https://github.com/Lusitaniae/apache_exporter) | Sidecar型    | ```9117``` | 同上           | Apacheのメトリクスを収集する。                               |
| [black box expoter](https://github.com/prometheus/blackbox_exporter) | Deplyoment型 | ```9115``` | 同上           | 各種通信プロトコルの状況をメトリクスとして収集する。         |
| [mysqld-exporter](https://github.com/prometheus/mysqld_exporter) | Sidecar型    | ```9104``` | 同上           | MySQL/MariaDBのメトリクスを収集する。                        |
| [postgres-exporter](https://github.com/prometheus-community/postgres_exporter) | Sidecar型    | ```9187``` | 同上           | PostgreSQLのメトリクスを収集する。                           |
| [oracledb-exporter](https://github.com/iamseth/oracledb_exporter) | Sidecar型    | ```9121``` | 同上           | Oracleのメトリクスを収集する。                               |
| [elasticsearch-exporter](https://github.com/prometheus-community/elasticsearch_exporter) | Deployment型 | ```9114``` | 同上           | ElasticSearchのメトリクスを収集する。                        |
| [redis-exporter](https://github.com/oliver006/redis_exporter) | Sidecar型    | ```9121``` | 同上           | Redisのメトリクスを収集する。                                |

#### ▼ PushGateway

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして機能する。

参考：https://prometheus.io/docs/practices/pushing/

<br>

## 06. VictoriaMetrics

### VictoriaMetricsの仕組み

#### ▼ 構造

リモートストレージとして、Prometheusで収集したメトリクスを保管する。Prometheusで書き込みエンドポイントを指定すれば、冗長化されたストレージにメトリクスを書き込める。また、Grafanaで読み出しエンドポイントを指定すれば、ストレージからメトリクスを読み込める。

参考：https://docs.victoriametrics.com/Cluster-VictoriaMetrics.html#architecture-overview

![victoria-metrics_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/victoria-metrics_architecture.png)

#### ▼ ディレクトリ構造

```yaml
/var/lib/victoriametrics/
├── data/
│   ├── big/ # メトリクスが保管されている。
│   ├── flock.lock
│   └── small/ # キャッシュとして保存される。時々、bigディレクトリにマージされる。
│
├── flock.lock/
├── indexdb/
├── metadata/
├── snapshots/
└── tmp/
```

<br>

