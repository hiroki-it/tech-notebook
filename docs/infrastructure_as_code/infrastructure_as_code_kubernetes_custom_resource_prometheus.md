---
title: 【IT技術の知見】Prometheus＠Kubernetes
description: Prometheus＠Kubernetes
---

# Prometheus＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Prometheusの仕組み

### アーキテクチャ

Prometheusは、prometheusサーバー/コンテナ（Retrieval、ローカルの時系列ストレージ、HTTPサーバー）から構成されている。Kubernetesリソースに関するメトリクスのデータポイントを収集し、分析する。また設定された条件下でアラートを作成し、Alertmanagerに送信する。

> ℹ️ 参考：
>
> - https://danielfm.me/prometheus-for-developers/
> - https://prometheus.io/docs/introduction/overview/
> - https://knowledge.sakura.ad.jp/11635/#Prometheus-3

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_architecture.png)

<br>

## 01-02. prometheusサーバー/コンテナ

### prometheusサーバー/コンテナとは

メトリクスのデータポイントを収集し、管理する。

またPromQLに基づいて、データポイントからメトリクスを分析できるようにする。

```9090```番ポートで、メトリクスのデータポイントをプルし、加えてGrafanaのPromQLによるアクセスを待ち受ける。

例えば、prometheus-operatorを使用した場合は、各コンポーネントのデフォルト値は、```/etc/prometheus/prometheus.yml```ファイルで定義する。



> ℹ️ 参考：
>
> - https://knowledge.sakura.ad.jp/27501/#Prometheus_Server
> - https://www.techscore.com/blog/2017/12/07/prometheus-monitoring-setting/

<br>

### Retrieval

#### ▼ Retrievalとは

定義されたPromQLのルールに基づいて、監視対象のデータポイントを定期的に収集する。



#### ▼ Retrievalのルール

ルールの種類によって、収集後の処理が異なる。



> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

| ルール名      | 説明                                                                  |
|------------|---------------------------------------------------------------------|
| アラートルール    | 収集されたデータポイントがアラート条件に合致する場合、アラートを作成し、Alertmanagerにこれを送信する。 |
| レコーディングルール | 収集されたデータポイントをローカルストレージに保管する。                                      |

#### ▼ 設定ファイル

設定ファイルは```.yaml```ファイルで定義する。

セットアップ方法によって設定ファイルが配置されるディレクトリは異なる。

例えば、prometheus-operatorを使用した場合は、prometheusコンテナの```/etc/prometheus/rules```ディレクトリ配下に配置される。



> ℹ️ 参考：
>
> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
> - https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

```bash
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

...

prometheus-prometheus-kube-prometheus-node.rules.yaml
prometheus-prometheus-kube-prometheus-prometheus-operator.yaml
prometheus-prometheus-kube-prometheus-prometheus.yaml
```

<br>

### HTTP server

#### ▼ HTTP serverとは

メトリクスを参照するためのエンドポイントを公開する。

PromQLをリクエストとして受信し、ローカルストレージからデータを返却する。



<br>

### ローカルストレージ

#### ▼ ローカルストレージ

Prometheusは、```data```ディレクトリ配下をTSDBとして、収集した全てのメトリクスを保管する。収集したメトリクスをデフォルトで```2```時間ごとにブロック化し、```data```ディレクトリ配下に配置する。現在処理中のブロックはメモリ上に保持されており、同時にストレージの```/data/wal```ディレクトリにもバックアップとして保存される（ちなみにRDBMSでは、これをジャーナルファイルという）。これにより、Prometheusで障害が発生し、メモリ上のブロックが削除されてしまっても、ストレージからブロックを復元できる。

> ℹ️ 参考：https://prometheus.io/docs/prometheus/latest/storage/#local-storage

```yaml
data/
├── 01BKGV7JC0RY8A6MACW02A2PJD/ # ブロック
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

Prometheusの稼働するコンテナやNodeに接続すれば、```data```ディレクトリを確認できる。



```bash
$ kubectl exec -it prometheus -n prometheus -- sh

/data $ ls -la
drwxrwsr-x    3 1000     2000          4096 Jul  6 05:00 01BKGV7JC0RY8A6MACW02A2PJD # ブロック
drwxrwsr-x    3 1000     2000          4096 Jul  8 11:00 01BKTKF4VE33MYEEQF0M7YERFA
...
```

TSDBのディレクトリはNodeにマウントされるため、Nodeのストレージサイズに注意する必要がある。

データポイント数を減らし、データポイント全体のデータサイズを小さくすると良い。



> ℹ️ 参考：https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

```bash
# Node内（EKS EC2 Nodeの場合）
$ ls -la /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****/prometheus-db/

-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:07 00004931
-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:09 00004932
-rw-r--r--  1 ec2-user 2000         0 Jun 24 17:12 00004933

...

drwxrwsr-x  2 ec2-user 2000      4096 Jun 20 18:00 checkpoint.00002873.tmp
drwxrwsr-x  2 ec2-user 2000      4096 Jun 21 02:00 checkpoint.00002898
drwxrwsr-x  2 ec2-user 2000      4096 Jun 21 04:00 checkpoint.00002911.tmp
```

#### ▼ 独自TSDB

Prometheusでは、独自のTSDB（```data```ディレクトリ配下）を採用している。データソース型モデルとメトリクス型モデルがあり、Prometheusではいずれを採用しているのかの記載が見つかっていないため、データソース型モデルと仮定してテーブル例を示す。

| timestamp        | cluster           | namespace           | ... | cpu      | memory   |
|------------------|-------------------|---------------------|-----|----------|----------|
| ```2022-01-01``` | ```foo-cluster``` | ```foo-namespace``` | ... | ```10``` | ```10``` |
| ```2022-01-02``` | ```foo-cluster``` | ```foo-namespace``` | ... | ```20``` | ```30``` |

> ℹ️ 参考：
>
> - https://db-engines.com/en/system/InfluxDB%3BLevelDB%3BPrometheus
> - https://www.alibabacloud.com/blog/key-concepts-and-features-of-time-series-databases_594734

<br>

### リモートストレージ

#### ▼ リモートストレージとは

![prometheus_remote-storage](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_remote-storage.png)

Prometheusは、ローカルストレージにメトリクスを保管する代わりに、TSDBとして動作するリモートストレージ（AWS Timestream、Google Bigquery、VictoriaMetrics、...）に保管できる。remote-write-receiverを有効化すると、リモートストレージの種類によらず、エンドポイントが『```https://<IPアドレス>/api/v1/write```』になる（ポート番号はリモートストレージごとに異なる）。Prometheusと外部のTSDBの両方を冗長化する場合、冗長化されたPrometheusでは、片方のデータベースのみに送信しないと、メトリクスが重複してしまうGrafanaのようにリアルタイムにデータを取得し続けることはできない。リモート読み出しを使用する場合、Prometheusのダッシュボード上でPromQLを使うことなく、Grafanaのようにリアルタイムにデータを取得できるようになる。

> ℹ️ 参考：
>
> - https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations
> - https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage
> - https://prometheus.io/blog/2021/11/16/agent/#history-of-the-forwarding-use-case

#### ▼ ダイナミックキュー

リモートストレージにメトリクスを送信する場合、送信されたメトリクスをキューイングする。

ダイナミックキューは、メトリクスのスループットの高さに応じて、キューイングの実行単位であるシャードを増減させる。



> ℹ️ 参考：https://speakerdeck.com/inletorder/monitoring-platform-with-victoria-metrics?slide=52

![prometheus_dynamic-queues_shard](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/prometheus_dynamic-queues_shard.png)

<br>

## 02. Alertmanager

### Alertmanagerとは

Prometheusのアラートを受信し、特定の条件下で通知する。

受信したアラートは、AlertmanagerのUI上に表示される。



> ℹ️ 参考：
>
> - https://prometheus.io/docs/alerting/latest/alertmanager/
> - https://www.designet.co.jp/ossinfo/alertmanager/
> - https://knowledge.sakura.ad.jp/11635/#Prometheus-3
> - https://amateur-engineer-blog.com/alertmanager-silence/

![alertmanager](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/alertmanager.png)

<br>

### Silence

受信したアラートの通知を一時的に無効化する。

Silenceされている期間、無効化されたアラートはAlertmanagerのUI上から削除され、通知されなくなる。



> ℹ️ 参考：https://amateur-engineer-blog.com/alertmanager-silence/

<br>

## 03. Exporter

### Exporterとは

PrometheusがPull型通信でメトリクスのデータポイントを収集するためのエンドポイントとして動作する。基本的にはデータポイントを収集したいNode内で稼働させるが、一部のExporter（例：外形監視のblack-exporter）は、Node外で稼働させる。Pull型通信により、アプリケーションはPrometheusの存在を知る必要がなく、関心を分離できる。収集したいメトリクスに合わせて、ExporterをKubernetesのNodeに導入する必要がある。また、各Exporterは待ち受けるエンドポイントやポート番号が異なっており、Prometheusが各Exporterにリクエストを送信できるように、各Nodeでエンドポイントやポート番号へのインバウンド通信を許可する必要がある。

> ℹ️ 参考：
>
> - https://openstandia.jp/oss_info/prometheus
> - https://danielfm.me/prometheus-for-developers/

<br>


### Exporterタイプ

#### ▼ Exporterタイプの種類

| タイプ          | 設置方法                         |
|--------------|-------------------------------|
| DaemonSet型  | 各Node内に、1つずつ設置する。            |
| Deployment型 | 各Node内のDeploymentに、1つずつ設置する。 |
| Sidecar型    | 各Node内のPodに、1つずつ設置する。        |
| 埋め込み型     | ライブラリとして、アプリケーション内に埋め込む。      |

#### ▼ Exporterの具体例

```exporter```という接尾辞がついていないExporterもある。



**＊例＊**

> ℹ️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2205/31/news011.html#072
> - https://prometheus.io/docs/instrumenting/exporters/

| Exporter名                                                                               | 説明                                                                                                                                                                                                                                                                      | Exportタイプ    | 待ち受けポート番号 | 待ち受けエンドポイント  | メトリクス名              |
|:-----------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|---------------|----------------|----------------------|
| [node-exporter](https://github.com/prometheus/node_exporter)                             | Nodeに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                            | DaemonSet型  | ```9100```    | ```/metrics``` | ```node_*```         |
| [kube-state-metrics](https://github.com/kubernetes/kube-state-metrics)                   | Kubernetesのリソース単位でメトリクスのデータポイントを収集する。似た名前のツールにmetrics-serverがあるが、こちらはNodeとPodのみを対象としており、またapiserverとして稼働する。<br>ℹ️ 参考：<br>・https://tech-blog.abeja.asia/entry/2016/12/20/202631 <br>・https://amateur-engineer-blog.com/kube-state-metrics-and-metrics-server/ | Deployment型 | ```8080```    | 同上           | ```kube_*```         |
| [process-exporter](https://github.com/ncabatoff/process-exporter)                        | 任意のプロセスに関するメトリクスのデータポイントを収集する。収集対象のプロセス名は```config.yaml```ファイルで設定できる。 <br>ℹ️ 参考：https://qiita.com/kkentaro/items/c01b8cf332da893791bb                                                                                                                       | DaemonSet型  | ```9256```    | 同上           | ```namedprocess_*``` |
| [nginx-vts-exporter](https://github.com/hnlq715/nginx-vts-exporter)                      | Nginxに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                           | Sidecar型    | ```9113```    | 同上           |                      |
| [apache-exporter](https://github.com/Lusitaniae/apache_exporter)                         | Apacheに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                          | Sidecar型    | ```9117```    | 同上           |                      |
| [black box expoter](https://github.com/prometheus/blackbox_exporter)                     | 各種通信プロトコルの状況をメトリクスとして収集する。                                                                                                                                                                                                                                        | Deployment型 | ```9115```    | 同上           |                      |
| [mysqld-exporter](https://github.com/prometheus/mysqld_exporter)                         | MySQL/MariaDBに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                   | Sidecar型    | ```9104```    | 同上           |                      |
| [postgres-exporter](https://github.com/prometheus-community/postgres_exporter)           | PostgreSQLに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                      | Sidecar型    | ```9187```    | 同上           |                      |
| [oracledb-exporter](https://github.com/iamseth/oracledb_exporter)                        | Oracleに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                          | Sidecar型    | ```9121```    | 同上           |                      |
| [elasticsearch-exporter](https://github.com/prometheus-community/elasticsearch_exporter) | ElasticSearchに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                   | Deployment型 | ```9114```    | 同上           |                      |
| [redis-exporter](https://github.com/oliver006/redis_exporter)                            | Redisに関するメトリクスのデータポイントを収集する。                                                                                                                                                                                                                                           | Sidecar型    | ```9121```    | 同上           |                      |
| open-telemetryのSDK                                                                       |                                                                                                                                                                                                                                                                           | 埋め込み型     |               |                |                      |

<br>

## 04. PushGateway

### PushGatewayとは

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして動作する。



> ℹ️ 参考：https://prometheus.io/docs/practices/pushing/

<br>

## 05. ServiceDiscovery

### ServiceDiscoveryとは

Pull型通信の宛先のIPアドレスが動的に変化する場合（例：スケーリングなど）、宛先を動的に検出し、データポイントを収集し続けられるようにする。

> ℹ️ 参考：https://christina04.hatenablog.com/entry/prometheus-service-discovery

<br>
