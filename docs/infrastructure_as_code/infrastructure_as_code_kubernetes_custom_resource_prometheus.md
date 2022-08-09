---
title: 【IT技術の知見】Prometheus＠Kubernetes
description: Prometheus＠Kubernetes

---

# Prometheus＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. Prometheusの仕組み

### アーキテクチャ

Prometheusは、Retrieval、ローカルの時系列ストレージ、HTTPサーバー、から構成されている。Kubernetesリソースに関するメトリクスのデータポイントを収集し、分析する。また設定された条件下でアラートを作成し、Alertmanagerに送信する。

ℹ️ 参考：

- https://danielfm.me/prometheus-for-developers/
- https://prometheus.io/docs/introduction/overview/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

## 01-02. Prometheus server

### Prometheus serverとは

メトリクスのデータポイントを収集し、管理する。またPromQLに基づいて、データポイントからメトリクスを分析できるようにする。```9090```番ポートで、メトリクスのデータポイントをプルし、またGrafanaのPromQLによるアクセスを待ち受ける。例えば、prometheus-operatorを使用した場合は、各コンポーネントのデフォルト値は、```/etc/prometheus/prometheus.yml```ファイルで定義する。

ℹ️ 参考：

- https://knowledge.sakura.ad.jp/27501/#Prometheus_Server
- https://www.techscore.com/blog/2017/12/07/prometheus-monitoring-setting/

```yaml
$ cat /etc/prometheus/prometheus.yml

global:
  scrape_interval:     15s
  evaluation_interval: 15s 

# 使用するAlertmanagerを設定する。
alerting:
  alertmanagers:
  - static_configs:
    - targets:
      # - alertmanager:9093

# Alertmanagerの通知先ルールを設定する。
rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

# Retrievalのルールを設定する。
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

<br>

### Retrieval

#### ▼ Retrievalとは

定義されたPromQLのルールに基づいて、監視対象のデータポイントを定期的に収集する。

#### ▼ Retrievalのルール

ルールの種類によって、収集後の処理が異なる。

ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

| ルール名             | 説明                                                         |
| -------------------- | ------------------------------------------------------------ |
| アラートルール       | 収集されたデータポイントがアラート条件に合致する場合、アラートを作成し、Alertmanagerにこれを送信する。 |
| レコーディングルール | 収集されたデータポイントをローカルストレージに保管する。     |

#### ▼ 設定ファイル

設定ファイルは```.yaml```ファイルで定義する。セットアップ方法によって設定ファイルが配置されるディレクトリは異なる。例えば、prometheus-operatorを使用した場合は、prometheusコンテナの```/etc/prometheus/rules```ディレクトリ配下に配置される。

ℹ️ 参考：

- https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
- https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

````bash
$ ls -1 /etc/prometheus

certs/
console_libraries/
consoles/
prometheus.yml # グローバルの設定ファイル
rules/         # ルールの設定ファイル


$ ls -1 /etc/prometheus/rules/prometheus-prometheus-kube-prometheus-prometheus-rulefiles-0

prometheus-eks-worker-rule.yaml
prometheus-prometheus-kube-prometheus-alertmanager.rules.yaml
prometheus-prometheus-kube-prometheus-general.rules.yaml

# 〜 中略 〜

prometheus-prometheus-kube-prometheus-node.rules.yaml
prometheus-prometheus-kube-prometheus-prometheus-operator.yaml
prometheus-prometheus-kube-prometheus-prometheus.yaml
````

<br>

### HTTP server

#### ▼ HTTP serverとは

メトリクスを参照するためのエンドポイントを公開する。PromQLをリクエストとして受信し、ローカルストレージからデータを返却する。

<br>

### ローカルストレージ

#### ▼ ローカルストレージ

Prometheusは、ローカルの時系列データベースに、収集した全てのメトリクスを保管する。また、収集したメトリクスをデフォルトで```2```時間ごとにブロック化し、```data```ディレクトリ配下に配置する。現在処理中のブロックはメモリ上に保持されており、同時にストレージの```/data/wal```ディレクトリにもバックアップとして保存される（ちなみにRDBMSでは、これをジャーナルファイルという）。これにより、Prometheusで障害が発生し、メモリ上のブロックが削除されてしまっても、ストレージからブロックを復元できる。

ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/storage/#local-storage

```yaml
prometheus/
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

また、時系列データベースはワーカーNodeにマウントされるため、ワーカーNodeのストレージサイズに注意する必要がある。収集されるデータポイントの合計サイズを小さくする方法として、収集間隔を長くする、不要なデータポイントの収集をやめる、といった方法がある。

ℹ️ 参考：https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

```bash
# ワーカーNode内（EKSワーカーNodeの場合）
$ ls -la /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****/prometheus-db/

-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:07 00004931
-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:09 00004932
-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:12 00004933

# 〜 中略 〜

drwxrwsr-x  2 ec2-user 2000      4096 Jun 20 18:00 checkpoint.00002873.tmp
drwxrwsr-x  2 ec2-user 2000      4096 Jun 21 02:00 checkpoint.00002898
drwxrwsr-x  2 ec2-user 2000      4096 Jun 21 04:00 checkpoint.00002911.tmp
```

<br>

### リモートストレージ

#### ▼ リモートストレージとは

![prometheus_remote-storage](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_remote-storage.png)

Prometheusは、ローカルストレージにメトリクスを保管する代わりに、時系列データベースとして機能するリモートストレージ（AWS Timestream、Google Bigquery、VictoriaMetrics、...）に保管できる。remote-write-receiverを有効化すると、リモートストレージの種類によらず、エンドポイントが『```https://<IPアドレス>/api/v1/write```』になる（ポート番号はリモートストレージごとに異なる）。Prometheusと外部の時系列データベースの両方を冗長化する場合、冗長化されたPrometheusでは、片方のデータベースのみに送信しないと、メトリクスが重複してしまうGrafanaのようにリアルタイムにデータを取得し続けることはできない。リモート読み出しを使用する場合、Prometheusのダッシュボード上でPromQLを使うことなく、Grafanaのようにリアルタイムにデータを取得できるようになる。

ℹ️ 参考：

- https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations
- https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage
- https://prometheus.io/blog/2021/11/16/agent/#history-of-the-forwarding-use-case

#### ▼ ダイナミックキュー

リモートストレージにメトリクスを送信する場合、送信されたメトリクスをキューイングする。ダイナミックキューは、メトリクスのスループットの高さに応じて、キューイングの実行単位であるシャードを増減させる。

ℹ️ 参考：https://speakerdeck.com/inletorder/monitoring-platform-with-victoria-metrics?slide=52

![prometheus_dynamic-queues_shard](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_dynamic-queues_shard.png)

<br>

## 01-03. Alertmanager

### Alertmanagerとは

Prometheusのアラートを受信し、特定の条件下で通知する。受信したアラートは、AlertmanagerのUI上に表示される。

ℹ️ 参考：

- https://prometheus.io/docs/alerting/latest/alertmanager/
- https://www.designet.co.jp/ossinfo/alertmanager/
- https://knowledge.sakura.ad.jp/11635/#Prometheus-3
- https://amateur-engineer-blog.com/alertmanager-silence/

![alertmanager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alertmanager.png)

<br>

### Silence

受信したアラートの通知を一時的に無効化する。Silenceされている期間、無効化されたアラートはAlertmanagerのUI上から削除され、通知されなくなる。

ℹ️ 参考：https://amateur-engineer-blog.com/alertmanager-silence/

<br>

## 01-04. Exporter

### Exporterとは

PrometheusがPull型通信でメトリクスのデータポイントを収集するためのエンドポイントとして機能する。Pull型通信により、アプリケーションはPrometheusの存在を知る必要がなく、関心を分離できる。収集したいメトリクスに合わせて、ExporterをKubernetesのNodeに導入する必要がある。また、各Exporterは待ち受けているエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各ワーカーNodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

ℹ️ 参考：

- https://openstandia.jp/oss_info/prometheus
- https://danielfm.me/prometheus-for-developers/

<br>

### セットアップ（ライブラリとして）

#### ▼ GitHubリポジトリから

サーバー内でライブラリとしてnode-exporterを動かす場合、GitHubリポジトリから直接インストールする。

```bash
# node-exporterの場合
# https://github.com/prometheus/node_exporter
$ curl -fsOL https://github.com/prometheus/node_exporter/releases/download/v1.0.0/node_exporter-1.0.0.linux-amd64.tar.gz
$ tar xvf node_exporter-1.0.0.linux-amd64.tar.gz
$ mv node_exporter-1.0.0.linux-amd64/node_exporter /usr/local/bin/node_exporter
```

<br>

### セットアップ（チャートとして）

#### ▼ GitHubリポジトリから

GitHubから目的に応じたチャートをインストールする。

```bash
$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
$ helm repo update

# 一括の場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack
$ helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack -n prometheus -f values.yaml

# node-exporterの場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-node-exporter
$ helm install prometheus-node-exporter prometheus-community/prometheus-node-exporter -n prometheus -f values.yaml

# kube-state-metricsの場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-state-metrics
$ helm install kube-state-metrics prometheus-community/kube-state-metrics -n prometheus -f values.yaml

# mysql-exporterの場合
# https://github.com/prometheus-community/helm-charts/tree/main/charts/prometheus-mysql-exporter
$ helm install prometheus-mysql-exporter prometheus-community/prometheus-mysql-exporter -n prometheus -f values.yaml
```

<br>

### Exporterタイプ

#### ▼ Exporterタイプの種類

| タイプ       | 設置方法                                          |
| ------------ | ------------------------------------------------- |
| DaemonSet型  | 各ワーカーNode内に、1つずつ設置する。             |
| Deployment型 | 各ワーカーNode内のDeploymentに、1つずつ設置する。 |
| Sidecar型    | 各ワーカーNode内のPodに、1つずつ設置する。        |

#### ▼ Exporterの具体例

**＊例＊**

ℹ️ 参考：

- https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072
- https://prometheus.io/docs/instrumenting/exporters/

| Exporter名                                                   | Exportタイプ | ポート番号 | エンドポイント | 説明                                                         |
| :----------------------------------------------------------- | ------------ | ---------- | -- | ------------------------------------------------------------ |
| [node-exporter](https://github.com/prometheus/node_exporter) | DaemonSet型  | ```9100``` | ```/metrics``` | ノードに関するメトリクスのデータポイントを収集する。         |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics) | Deplyoment型 | ```8080``` | 同上 | Exporterという名前ではないが、Exporterの一種である。<br>参考：https://kashionki38.hatenablog.com/entry/2020/08/06/011420<br>Kubernetesのリソース単位でメトリクスのデータポイントを収集する。<br>ℹ️ 参考：https://tech-blog.abeja.asia/entry/2016/12/20/202631 |
| [process-exporter](https://github.com/ncabatoff/process-exporter) | DaemonSet型  | ```9256``` | 同上 | 特定のプロセスに関するメトリクスのデータポイントを収集する。 |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter) | Sidecar型    | ```9113``` | 同上 | Nginxに関するメトリクスのデータポイントを収集する。          |
| [apache-exporter](https://github.com/Lusitaniae/apache_exporter) | Sidecar型    | ```9117``` | 同上 | Apacheに関するメトリクスのデータポイントを収集する。         |
| [black box expoter](https://github.com/prometheus/blackbox_exporter) | Deplyoment型 | ```9115``` | 同上 | 各種通信プロトコルの状況をメトリクスとして収集する。         |
| [mysqld-exporter](https://github.com/prometheus/mysqld_exporter) | Sidecar型    | ```9104``` | 同上 | MySQL/MariaDBに関するメトリクスのデータポイントを収集する。  |
| [postgres-exporter](https://github.com/prometheus-community/postgres_exporter) | Sidecar型    | ```9187``` | 同上 | PostgreSQLに関するメトリクスのデータポイントを収集する。     |
| [oracledb-exporter](https://github.com/iamseth/oracledb_exporter) | Sidecar型    | ```9121``` | 同上 | Oracleに関するメトリクスのデータポイントを収集する。         |
| [elasticsearch-exporter](https://github.com/prometheus-community/elasticsearch_exporter) | Deployment型 | ```9114``` | 同上 | ElasticSearchに関するメトリクスのデータポイントを収集する。  |
| [redis-exporter](https://github.com/oliver006/redis_exporter) | Sidecar型    | ```9121``` | 同上 | Redisに関するメトリクスのデータポイントを収集する。          |

#### ▼ PushGateway

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして機能する。

ℹ️ 参考：https://prometheus.io/docs/practices/pushing/

<br>

## 02. PromQL

### PromQLとは

Prometheusで収集したメトリクスを抽出し、集計できる。

<br>

### データ型

#### ▼ Instant vector

特定の時点の時系列データのこと。

ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Range vector

特定の期間の時系列データのこと。

ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ Scalar

浮動小数点の数値型データのこと。

ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

#### ▼ String

文字列型データのこと。

ℹ️ 参考：https://it-engineer.hateblo.jp/entry/2019/01/19/150849

<br>

### 関数

#### ▼ count

期間内の合計数を算出する。

ℹ️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

#### ▼ increase

rate関数のラッパーであり、rate関数の結果（1秒当たりの平均増加率）に、期間を自動的に掛けた数値（期間あたりの増加数）を算出する。

ℹ️ 参考：https://promlabs.com/blog/2021/01/29/how-exactly-does-promql-calculate-rates

```bash
# rate関数に期間（今回は5m）を自動的に掛けた数値を算出する。
increase(foo_metrics[5m])
= rate(foo_metrics[1h]) * 5 * 60
```

#### ▼ rate

平均増加率（%/秒）を算出する。常に同じ割合で増加していく場合、横一直線のグラフになる。

ℹ️ 参考：https://www.opsramp.com/prometheus-monitoring/promql/

<br>

## 02-02. メトリクス

### ```prometheus_tsdb_*```

#### ▼ prometheus_tsdb_head_samples_appended_total

Prometheusが収集したデータポイントの合計数を表す。

ℹ️ 参考：

- https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
- https://christina04.hatenablog.com/entry/prometheus-node-exporter


#### ▼ prometheus_tsdb_compaction_chunk_size_bytes_sum

Prometheusが作成したチャンクの合計サイズ（KB）を表す。

ℹ️ 参考：

- https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
- https://christina04.hatenablog.com/entry/prometheus-node-exporter



#### ▼ prometheus_tsdb_compaction_chunk_samples_sum

Prometheusが作成したチャンクの合計数を表す。

ℹ️ 参考：

- https://valyala.medium.com/prometheus-storage-technical-terms-for-humans-4ab4de6c3d48
- https://christina04.hatenablog.com/entry/prometheus-node-exporter

<br>

## 02-03. クエリのプラクティス

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

Prometheusで収集されたデータポイントの合計サイズ（KB/秒）の増加率を分析する。計算式からもわかるように、データポイントの収集の間隔を長くすることにより、データポイント数が減るため、合計のサイズを小さくできる。

ℹ️ 参考：https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

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

データポイントの合計サイズ（KB/日）とローカルストレージの部品ファイルの合計を分析する。ローカルストレージの部品ファイル分で、```20```%のサイズが必要になる。この結果から、ローカルストレージの必要サイズを推測できる。

```bash
rate(prometheus_tsdb_compaction_chunk_size_bytes_sum[1h]) /
rate(prometheus_tsdb_compaction_chunk_samples_sum[1h]) *
rate(prometheus_tsdb_head_samples_appended_total[1h]) *
60 * 60 * 24 *
1.2
```

ℹ️ 参考：

- https://www.robustperception.io/how-much-disk-space-do-prometheus-blocks-use/
- https://www.robustperception.io/how-much-space-does-the-wal-take-up/
- https://discuss.prometheus.io/t/prometheus-storage-requirements/268/4
- https://gist.github.com/mikejoh/c172b2400909d33c37199c9114df61ef

#### ▼ リモートストレージの必要サイズ（KB/日）

Prometheusで収集されたデータポイントの全サイズうち、リモートストレージに実際に送信しているサイズ（KB/日）を分析する。この結果から、リモートストレージの必要サイズを推測できる。なお、リモートストレージが送信された全てのデータを保管できるとは限らないため、リモートストレージ側で必要サイズを確認する方がより正確である。

```bash
rate(prometheus_remote_storage_bytes_total[1h]) *
60 * 60 * 24
```
