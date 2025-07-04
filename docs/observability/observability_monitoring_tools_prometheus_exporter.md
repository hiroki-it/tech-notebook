---
title: 【IT技術の知見】Exporter＠Prometheus
description: Exporter＠Prometheus
---

# Exporter＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Exporter

### Exporterとは

PrometheusがPull型収集でメトリクスの元になるデータポイントを収集するためのエンドポイントとして動作する。

Prometheusはデータポイントをメトリクスとして集約する。

基本的にはデータポイントを収集したいNode内で稼働させるが、一部のExporter (例：外形監視のblack-exporter) は、Node外で稼働させる。

Pull型収集により、アプリケーションはPrometheusの存在を知る必要がなく、関心を分離できる。収集したいメトリクスに合わせて、ExporterをKubernetesのNodeに導入する必要がある。

また、各Exporterは待ち受けるエンドポイントやポート番号が異なっており、Prometheusが各Exporterからメトリクスの元になるデータポイントを収集できるように、各Nodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

> - https://openstandia.jp/oss_info/prometheus
> - https://danielfm.me/prometheus-for-developers/

<br>

### 確認

Nodeで稼働しているExporterを確認する。

```bash
$ ps -aux | grep exporter
```

<br>

### Exporterのデザインパターン

#### ▼ デザインパターン

Exporterには、KubernetesのNode上でどう稼働させるかに応じて、デザインパターンがある。

| タイプ                  | 配置方法                                         |
| ----------------------- | ------------------------------------------------ |
| DaemonSetパターン       | 各Node上にDaemonSetとして配置する。              |
| Deploymentパターン      | 各Node上にDeploymentとして配置する。             |
| Pod内サイドカーパターン | Pod内にサイドカーとして配置する。                |
| 埋め込み型パターン      | ライブラリとして、アプリケーション内に埋め込む。 |

> - https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072
> - https://prometheus.io/docs/instrumenting/exporters/
> - https://grafana.com/oss/prometheus/exporters/

#### ▼ DaemonSetパターン

| Exporter名                                                        | 説明                                                                                                                                                                                                  | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名     |
| :---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ---------------- |
| [Node Exporter](https://github.com/prometheus/node_exporter)      | Nodeに関するメトリクスの元になるデータポイントを収集する。                                                                                                                                            | `9100`             | `/metrics`             | `node_*`         |
| [Process Exporter](https://github.com/ncabatoff/process-exporter) | Nodeの非コンテナのプロセスに関するメトリクスの元になるデータポイントを収集する。収集対象のプロセス名は`config.yaml`ファイルで設定できる。 <br>・https://qiita.com/kkentaro/items/c01b8cf332da893791bb | `9256`             | 同上                   | `namedprocess_*` |

#### ▼ Deploymentパターン

| Exporter名                                                                                                               | 説明                                                                                                                                                                                                                                                                                                                                                                         | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ------------ |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)                                                   | Kubernetesのソース単位でメトリクスの元になるデータポイントを収集する。似た名前のツールにmetrics-serverがあるが、metrics-serverはNodeとPodのみを対象としており、またapiserverとして稼働する。<br>・https://tech-blog.abeja.asia/entry/2016/12/20/202631 <br>・https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/                                        | `8080`             | 同上                   | `kube_*`     |
| [Blackbox Exporter](https://github.com/prometheus/blackbox_exporter)                                                     | 指定したプロトコルで外形監視を実施する。外形監視のため、リクエストは一度Cluster外に出る。リクエストの成否以外にも、各種メトリクス (レスポンスタイム、HTTPステータスなど) を収集できる。<br>・https://handon.hatenablog.jp/entry/2019/01/29/005935 <br>・https://medium.com/@lambdaEranga/monitor-kubernets-services-endpoints-with-prometheus-blackbox-exporter-a64e062c05d5 | `9115`             | 同上                   |              |
| [Elasticsearch Exporter](https://github.com/prometheus-community/elasticsearch_exporter)                                 | ElasticSearchに関するメトリクスの元になるデータポイントを収集する。                                                                                                                                                                                                                                                                                                          | `9114`             | 同上                   |              |
| [Kubernetes Event Exporter](https://github.com/opsgenie/kubernetes-event-exporter/blob/master/deploy/02-deployment.yaml) | Kubernetesリソースのイベントを収集する。Fluentd/FluentBitに似たことを実現できるkubernetes-eventsプラグインがある。                                                                                                                                                                                                                                                           |                    |                        |              |

#### ▼ Pod内サイドカーパターン

| Exporter名                                                                     | 説明                                                                                                                                                | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------- | ------------ |
| [Nginx Vts Exporter](https://github.com/hnlq715/nginx-vts-exporter)            | Nginxに関するメトリクスの元になるデータポイントを収集する。                                                                                         | `9113`             | 同上                   |              |
| [Apache Exporter](https://github.com/Lusitaniae/apache_exporter)               | Apacheに関するメトリクスの元になるデータポイントを収集する。                                                                                        | `9117`             | 同上                   |              |
| [Mysqld Exporter](https://github.com/prometheus/mysqld_exporter)               | MySQL/MariaDBに関するメトリクスの元になるデータポイントを収集する。                                                                                 | `9104`             | 同上                   |              |
| [Postgres Exporter](https://github.com/prometheus-community/postgres_exporter) | PostgreSQLに関するメトリクスの元になるデータポイントを収集する。<br>・https://grafana.com/oss/prometheus/exporters/postgres-exporter/#metrics-usage | `9187`             | 同上                   |              |
| [Oracledb Exporter](https://github.com/iamseth/oracledb_exporter)              | Oracleに関するメトリクスの元になるデータポイントを収集する。                                                                                        | `9121`             | 同上                   |              |
| [Redis Exporter](https://github.com/oliver006/redis_exporter)                  | Redisに関するメトリクスの元になるデータポイントを収集する。                                                                                         | `9121`             | 同上                   |              |

### ▼ 埋め込み型パターン

| Exporter名          | 説明 | 待ち受けポート番号 | 待ち受けエンドポイント | メトリクス名 |
| :------------------ | ---- | ------------------ | ---------------------- | ------------ |
| open-telemetryのSDK |      |                    |                        |              |

<br>

### セットアップ

#### ▼ チャートとして

チャートリポジトリから複数のチャートを一括でインストールし、Kubernetesリソースを作成する。

kube-prometheus-stackは、いくつかのExporterをサブチャートとしてインストールしてくれる。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack

<br>

## 02. MySQL Exporter (mysqld-exporter)

### MySQL Exporterとは

MySQLにクエリを実行し、メトリクスとして収集する。

<br>

### セットアップ

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-mysql-exporter -n prometheus --version <バージョンタグ>
```

> - https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mysql-exporter

<br>

### メトリクスの一覧

#### ▼ 確認方法

PostgreSQL Exporterの場合は、Nodeの『`127.0.0.1:9104/metrics`』をコールすると、PromQLで使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9104/metrics

...

postgres_exporter_build_info{branch="",goversion="go1.15.8",revision="",version="0.0.1"} 1

...
```

> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/
> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/assets/postgres_metrics_scrape.txt

<br>

## 03. PostgreSQL Exporter

### PostgreSQL Exporterとは

PostgreSQLにクエリを実行し、メトリクスとして収集する。

<br>

### メトリクスの一覧

#### ▼ 確認方法

PostgreSQL Exporterの場合は、Nodeの『`127.0.0.1:9187/metrics`』をコールすると、PromQLで使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9187/metrics

...

mysqld_exporter_build_info{branch="HEAD",goversion="go1.12.7",revision="48667bf7c3b438b5e93b259f3d17b70a7c9aff96",version="0.12.1"} 1

...
```

> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/
> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/assets/mysql_metrics_scrape.txt

<br>

### PromQLを使用したメトリクス分析

#### ▼ PostgreSQLのプロセスのステータス

PostgreSQLのプロセスのステータスを表す。

`pg_up`は、PostgreSQLのプロセスのステータスを表す。

正常な場合に`1`、異常な場合に`0`となる。

```bash
pg_up == 0
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html

#### ▼ PostgreSQLの連続稼働時間

`pg_postmaster_start_time_seconds`は、PostgreSQLのマスタープロセス (postmasterプロセス) の連続稼働時間を表す。

```bash
time() - pg_postmaster_start_time_seconds
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html
> - https://www.oreilly.com/library/view/postgresql-9-administration/9781849519069/ch02s03.html
> - https://www.ashisuto.co.jp/db_blog/article/20151221_pg_monitoring.html

#### ▼ DBインスタンス間のデータ同期の遅延

PostgreSQLで、RepmgrによるDBクラスターを採用している場合に、DBインスタンス間のデータ同期の遅延を表す。

`pg_replication_lag`は、DBインスタンス間のデータ同期にかかる時間を表す。

```bash
pg_replication_lag > 10
```

> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html

#### ▼ 残骸タプルサイズ

DBにたまっている残骸タプルのデータサイズを表す。

```bash
pg_stat_user_tables_n_dead_tup{datname="<DB名>"}
```

> - https://www.adyen.com/blog/postgresql-hot-updates-part2

<br>

## 04. Process Exporter

### セットアップ

#### ▼ バイナリとして

バイナリファイルをインストールする。

```bash
# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
# tmpディレクトリ配下にダウンロードする。
$ curl -L https://github.com/ncabatoff/process-exporter/releases/download/v0.7.10/process-exporter-0.7.10.linux-amd64.tar.gz -o /tmp/process-exporter-0.7.10.linux-amd64.tar.gz

$ tar -xvf /tmp/process-exporter-0.7.10.linux-amd64.tar.gz -C /tmp
```

#### ▼ チャートとして

執筆時点 (2023/03/26) 時点で、Process Exporterのチャートはない。

> - https://github.com/ncabatoff/process-exporter

<br>

### メトリクスの一覧

#### ▼ 確認方法

Process Exporterの場合は、Nodeの『`127.0.0.1:9256/metrics`』をコールすると、PromQLで使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9256/metrics

...

process_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> - https://github.com/ncabatoff/process-exporter#exposing-metrics-through-https

<br>

## 05. Redis Exporter

### メトリクスの一覧

#### ▼ 確認方法

Redis Exporterの場合は、Nodeの『`127.0.0.1:9121/metrics`』をコールすると、PromQLで使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9121/metrics

...

redis_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> - https://grafana.com/oss/prometheus/exporters/redis-exporter/
> - https://grafana.com/oss/prometheus/exporters/redis-exporter/assets/sample_scrape.out.txt

<br>
