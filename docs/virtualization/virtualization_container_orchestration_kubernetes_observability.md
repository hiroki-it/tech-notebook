---
title: 【知見を記録するサイト】可観測性リソース＠仮想化
description: 可観測性リソース＠仮想化の知見をまとめました。
---

# 可観測性リソース＠仮想化

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. よく使う可観測性リソース一覧

各リソースの責任領域を以下に示す。

参考：https://landscape.cncf.io/card-mode?category=observability-and-analysis&grouping=category&sort=stars

| アクション         | cAdvisor | Grafana | Jaeger | Kiali | kube-state-metrics | Prometheus |
| ------------------ | -------- | ------- | ------ | ----- | ------------------ | ---------- |
| メトリクスの収集   | ✅        |         |        | ✅     | ✅                  | ✅          |
| ログの収集         |          |         |        |       |                    |            |
| 分散トレースの収集 |          |         | ✅      |       |                    |            |
| ↓                  |          |         |        |       |                    |            |
| データの保管       |          |         |        |       |                    |            |
| データの分析       | ✅        |         | ✅      | ✅     | ✅                  | ✅          |
| データの可視化     | ✅        | ✅       |        |       |                    |            |
| レポートの作成     |          |         |        |       |                    |            |
| ↓                  |          |         |        |       |                    |            |
| アラート           |          |         |        |       |                    |            |

<br>

## 02. Grafana

### Grafanaの仕組み

#### ▼ 構造

Grafanaは、ダッシュボードを作るKuberneteリソースとPromQLから構成されている。Prometheusで収集されたメトリクスをPromQLを用いて取得し、可視化する。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

## 03. Kiali

### Kialiの仕組み

#### ▼ 構造

Prometheusで収集されたメトリクスを再収集し、Istioの可視化を拡張する。現状は、Istioのコンポーネントに依存している。

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>

## 04. Prometheus

### Prometheusの仕組み

Prometheusは、Retrieval、TSDB、HTTPサーバー、から構成されている。EKubernetesリソースのメトリクスを収集し、分析する。また設定された条件下でアラートを生成し、Alertmanagerに送信する。

参考：

- https://prometheus.io/docs/introduction/overview/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

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

PrometheusがPull型メトリクスを対象から収集するためのエンドポイントとして機能する。収集したいメトリクスに合わせて、Exporterを選ぶ必要がある。また、各Exporterは待ち受けているエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各ワーカーNodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

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

### VictoriaMetrics

#### ▼ VictoriaMetricsとは

Prometheusで収集したメトリクスを永続化する。Prometheusで書き込みエンドポイントを指定すれば、冗長化されたストレージにメトリクスを書き込める。また、Grafanaで読み込みエンドポイントを指定すれば、ストレージからメトリクスを読み込める。

![victoria-metrics_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/victoria-metrics_architecture.png)

<br>

## 05. Jaeger

### 仕組み

Kubernetesリソースの分散トレースを収集し、これの分析と可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>
