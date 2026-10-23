---
title: 【IT技術の知見】Exporter＠Prometheus
description: Exporter＠Prometheus
---

# Exporter＠Prometheus

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. Exporter

### Exporter とは

Prometheus がプル型収集でメトリクスの元になるデータポイントを収集するためのエンドポイントとして動作する。

Prometheus はデータポイントをメトリクスとして集約する。

基本的にはデータポイントを収集したい Node 内で稼働させるが、一部の Exporter (例：外形監視の black-exporter) は、Node 外で稼働させる。

プル型収集により、アプリケーションは Prometheus の存在を知る必要がなく、関心を分離できる。収集したいメトリクスに合わせて、Exporter を Kubernetes の Node に導入する必要がある。

また、各 Exporter は待ち受けるエンドポイントやポート番号が異なっており、Prometheus が各 Exporter からメトリクスの元になるデータポイントを収集できるように、各 Node でエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

> - [Prometheusとは？詳細情報を解説 \| OSSサポートのOpenStandia™【NRI】](https://openstandia.jp/oss_info/prometheus)
> - [https://danielfm.me/posts/prometheus-for-developers/](https://danielfm.me/prometheus-for-developers/)

<br>

### 確認

Node で稼働している Exporter を確認する。

```bash
$ ps -aux | grep exporter
```

<br>

### Exporter のデザインパターン

#### ▼ デザインパターン

Exporter には、Kubernetes の Node 上でどう稼働させるかに応じて、デザインパターンがある。

<table>
  <thead>
    <tr>
      <th>タイプ</th>
      <th>配置方法</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>DaemonSet パターン</td>
      <td>各 Node 上に DaemonSet として配置する。</td>
    </tr>
    <tr>
      <td>Deployment パターン</td>
      <td>各 Node 上に Deployment として配置する。</td>
    </tr>
    <tr>
      <td>Pod 内サイドカーパターン</td>
      <td>Pod 内にサイドカーとして配置する。</td>
    </tr>
    <tr>
      <td>埋め込み型パターン</td>
      <td>ライブラリとして、アプリケーション内に埋め込む。</td>
    </tr>
  </tbody>
</table>

> - [かゆいところに手が届く実践「Prometheus」「Grafana」――PromQL、スクレイプ、Exporter、運用のためのポイント：Cloud Nativeチートシート（15） - ＠IT](https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072)
> - [Exporters and integrations \| Prometheus](https://prometheus.io/docs/instrumenting/exporters/)
> - [Prometheus Exporter Quickstarts \| Grafana Labs](https://grafana.com/oss/prometheus/exporters/)

#### ▼ DaemonSet パターン

<table>
  <thead>
    <tr>
      <th style="text-align:left">Exporter 名</th>
      <th>説明</th>
      <th>待ち受けポート番号</th>
      <th>待ち受けエンドポイント</th>
      <th>メトリクス名</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><a href="https://github.com/prometheus/node_exporter">Node Exporter</a></td>
      <td>Node に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9100</code></td>
      <td rowspan="2"><code>/metrics</code></td>
      <td><code>node_*</code></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/ncabatoff/process-exporter">Process Exporter</a></td>
      <td>Node の非コンテナのプロセスに関するメトリクスの元になるデータポイントを収集する。収集対象のプロセス名は <code>config.yaml</code> ファイルで設定できる。 <br>・<a href="https://qiita.com/kkentaro/items/c01b8cf332da893791bb">https://qiita.com/kkentaro/items/c01b8cf332da893791bb</a></td>
      <td><code>9256</code></td>
      <td><code>namedprocess_*</code></td>
    </tr>
  </tbody>
</table>

#### ▼ Deployment パターン

<table>
  <thead>
    <tr>
      <th style="text-align:left">Exporter 名</th>
      <th>説明</th>
      <th>待ち受けポート番号</th>
      <th>待ち受けエンドポイント</th>
      <th>メトリクス名</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><a href="https://github.com/kubernetes/kube-state-metrics">kube-state-metrics</a></td>
      <td>Kubernetes のソース単位でメトリクスの元になるデータポイントを収集する。似た名前のツールに metrics-server があるが、metrics-server は Node と Pod のみを対象としており、また apiserver として稼働する。<br>・<a href="https://tech-blog.abeja.asia/entry/2016/12/20/202631">https://tech-blog.abeja.asia/entry/2016/12/20/202631</a> <br>・<a href="https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/">https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/</a></td>
      <td><code>8080</code></td>
      <td rowspan="3"><code>/metrics</code></td>
      <td><code>kube_*</code></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/prometheus/blackbox_exporter">Blackbox Exporter</a></td>
      <td>指定したプロトコルで外形監視する。外形監視のため、リクエストは一度 Cluster 外に出る。リクエストの成否以外にも、各種メトリクス (レスポンスタイム、HTTP ステータスなど) を収集できる。<br>・<a href="https://handon.hatenablog.jp/entry/2019/01/29/005935">https://handon.hatenablog.jp/entry/2019/01/29/005935</a> <br>・<a href="https://medium.com/@lambdaEranga/monitor-kubernets-services-endpoints-with-prometheus-blackbox-exporter-a64e062c05d5">https://medium.com/@lambdaEranga/monitor-kubernets-services-endpoints-with-prometheus-blackbox-exporter-a64e062c05d5</a></td>
      <td><code>9115</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/prometheus-community/elasticsearch_exporter">Elasticsearch Exporter</a></td>
      <td>ElasticSearch に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9114</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/opsgenie/kubernetes-event-exporter/blob/master/deploy/02-deployment.yaml">Kubernetes Event Exporter</a></td>
      <td>Kubernetes リソースのイベントを収集する。Fluentd/FluentBit に似たことを実現できる kubernetes-events プラグインがある。</td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

#### ▼ Pod 内サイドカーパターン

<table>
  <thead>
    <tr>
      <th style="text-align:left">Exporter 名</th>
      <th>説明</th>
      <th>待ち受けポート番号</th>
      <th>待ち受けエンドポイント</th>
      <th>メトリクス名</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left"><a href="https://github.com/hnlq715/nginx-vts-exporter">Nginx Vts Exporter</a></td>
      <td>Nginx に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9113</code></td>
      <td rowspan="6"><code>/metrics</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/Lusitaniae/apache_exporter">Apache Exporter</a></td>
      <td>Apache に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9117</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/prometheus/mysqld_exporter">Mysqld Exporter</a></td>
      <td>MySQL/MariaDB に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9104</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/prometheus-community/postgres_exporter">Postgres Exporter</a></td>
      <td>PostgreSQL に関するメトリクスの元になるデータポイントを収集する。<br>・<a href="https://grafana.com/oss/prometheus/exporters/postgres-exporter/#metrics-usage">https://grafana.com/oss/prometheus/exporters/postgres-exporter/#metrics-usage</a></td>
      <td><code>9187</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/iamseth/oracledb_exporter">Oracledb Exporter</a></td>
      <td>Oracle に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9121</code></td>
      <td></td>
    </tr>
    <tr>
      <td style="text-align:left"><a href="https://github.com/oliver006/redis_exporter">Redis Exporter</a></td>
      <td>Redis に関するメトリクスの元になるデータポイントを収集する。</td>
      <td><code>9121</code></td>
      <td></td>
    </tr>
  </tbody>
</table>

### ▼ 埋め込み型パターン

<table>
  <thead>
    <tr>
      <th style="text-align:left">Exporter 名</th>
      <th>説明</th>
      <th>待ち受けポート番号</th>
      <th>待ち受けエンドポイント</th>
      <th>メトリクス名</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">open-telemetry の SDK</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

<br>

### セットアップ

#### ▼ チャートとして

チャートリポジトリから複数のチャートを一括でインストールし、Kubernetes リソースを作成する。

kube-prometheus-stack は、いくつかの Exporter をサブチャートとしてインストールしてくれる。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/kube-prometheus-stack -n prometheus --version <バージョンタグ>
```

> - [helm-charts/charts/kube-prometheus-stack at main · prometheus-community/helm-charts · GitHub](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)

<br>

## 02. MySQL Exporter (mysqld-exporter)

### MySQL Exporter とは

MySQL にクエリを実行し、メトリクスとして収集する。

<br>

### セットアップ

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://prometheus-community.github.io/helm-charts

$ helm repo update

$ kubectl create namespace prometheus

$ helm install <Helmリリース名> <チャートリポジトリ名>/prometheus-mysql-exporter -n prometheus --version <バージョンタグ>
```

> - [helm-charts/charts/prometheus-mysql-exporter at main · prometheus-community/helm-charts · GitHub](https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mysql-exporter)

<br>

### メトリクスの一覧

#### ▼ 確認方法

PostgreSQL Exporter の場合は、Node の『`127.0.0.1:9104/metrics`』をコールすると、PromQL で使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9104/metrics

...

postgres_exporter_build_info{branch="",goversion="go1.15.8",revision="",version="0.0.1"} 1

...
```

> - [Prometheus OSS \| Postgres exporter](https://grafana.com/oss/prometheus/exporters/postgres-exporter/)
> - https://grafana.com/oss/prometheus/exporters/postgres-exporter/assets/postgres_metrics_scrape.txt

<br>

## 03. PostgreSQL Exporter

### PostgreSQL Exporter とは

PostgreSQL にクエリを実行し、メトリクスとして収集する。

<br>

### メトリクスの一覧

#### ▼ 確認方法

PostgreSQL Exporter の場合は、Node の『`127.0.0.1:9187/metrics`』をコールすると、PromQL で使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9187/metrics

...

mysqld_exporter_build_info{branch="HEAD",goversion="go1.12.7",revision="48667bf7c3b438b5e93b259f3d17b70a7c9aff96",version="0.12.1"} 1

...
```

> - [Prometheus OSS \| MySQL exporter](https://grafana.com/oss/prometheus/exporters/mysql-exporter/)
> - https://grafana.com/oss/prometheus/exporters/mysql-exporter/assets/mysql_metrics_scrape.txt

<br>

### PromQL を使用したメトリクス分析

#### ▼ PostgreSQL のプロセスのステータス

PostgreSQL のプロセスのステータスを表す。

`pg_up` は、PostgreSQL のプロセスのステータスを表す。

正常な場合に `1`、異常な場合に `0` となる。

```bash
pg_up == 0
```

> - [Prometheusを用いたPostgreSQLの監視におけるメトリクス Top10 \| ブログ \| Sysdig \| 株式会社SCSK](https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html)

#### ▼ PostgreSQL の連続稼働時間

`pg_postmaster_start_time_seconds` は、PostgreSQL のマスタープロセス (postmaster プロセス) の連続稼働時間を表す。

```bash
time() - pg_postmaster_start_time_seconds
```

> - [Prometheusを用いたPostgreSQLの監視におけるメトリクス Top10 \| ブログ \| Sysdig \| 株式会社SCSK](https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html)
> - https://www.oreilly.com/library/view/postgresql-9-administration/9781849519069/ch02s03.html
> - [PostgreSQLの監視で押さえておきたい3つの監視項目 \| アシスト](https://www.ashisuto.co.jp/db_blog/article/20151221_pg_monitoring.html)

#### ▼ DB インスタンス間のデータ同期の遅延

PostgreSQL で、Repmgr による DB クラスターを採用している場合に、DB インスタンス間のデータ同期の遅延を表す。

`pg_replication_lag` は、DB インスタンス間のデータ同期にかかる時間を表す。

```bash
pg_replication_lag > 10
```

> - [Prometheusを用いたPostgreSQLの監視におけるメトリクス Top10 \| ブログ \| Sysdig \| 株式会社SCSK](https://www.scsk.jp/sp/sysdig/blog/container_monitoring/prometheuspostgresql_top10.html)

#### ▼ 残骸タプルサイズ

DB にたまっている残骸タプルのデータサイズを表す。

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

執筆時点 (2023/03/26) 時点で、Process Exporter のチャートはない。

> - [GitHub - ncabatoff/process-exporter: Prometheus exporter that mines /proc to report on selected processes · GitHub](https://github.com/ncabatoff/process-exporter)

<br>

### メトリクスの一覧

#### ▼ 確認方法

Process Exporter の場合は、Node の『`127.0.0.1:9256/metrics`』をコールすると、PromQL で使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9256/metrics

...

process_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> - [GitHub - ncabatoff/process-exporter: Prometheus exporter that mines /proc to report on selected processes · GitHub](https://github.com/ncabatoff/process-exporter#exposing-metrics-through-https)

<br>

## 05. Redis Exporter

### メトリクスの一覧

#### ▼ 確認方法

Redis Exporter の場合は、Node の『`127.0.0.1:9121/metrics`』をコールすると、PromQL で使用できるメトリクスの元になるデータポイントを取得できる。

```bash
# Node内でコールする。
$ curl http://127.0.0.1:9121/metrics

...

redis_exporter_build_info{build_date="2021-03-11-03:26:58",commit_sha="d0597c841d2c9fa30ce8b6ded6251d1994822e27",golang_version="go1.16.1",version="v1.18.0"} 1

...
```

> - [Prometheus OSS \| Redis exporter](https://grafana.com/oss/prometheus/exporters/redis-exporter/)
> - https://grafana.com/oss/prometheus/exporters/redis-exporter/assets/sample_scrape.out.txt

<br>
