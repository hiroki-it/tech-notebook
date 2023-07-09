---
title: 【IT技術の知見】Prometheus＠CNCFプロジェクト
description: Prometheus＠CNCFプロジェクト
---

# Prometheus＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Prometheusの仕組み

### アーキテクチャ

Prometheusは、prometheusサーバー (Retrieval、ローカルの時系列ストレージ、HTTPサーバー) から構成されている。

Kubernetesリソースに関するメトリクスのデータポイントを収集し、分析する。

また設定された条件下でアラートを作成し、Alertmanagerに送信する。

![prometheus_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/prometheus_architecture.png)

> ↪️：
>
> - https://danielfm.me/prometheus-for-developers/
> - https://prometheus.io/docs/introduction/overview/
> - https://knowledge.sakura.ad.jp/11635/#Prometheus-3

<br>

## 01-02. prometheusサーバー

### prometheusサーバーとは

メトリクスのデータポイントを収集し、管理する。またPromQLに基づいて、データポイントからメトリクスを分析できるようにする。

`9090`番ポートで、メトリクスのデータポイントをプルし、加えてGrafanaのPromQLによるアクセスを待ち受ける。

例えば、prometheus-operatorを使用した場合は、各コンポーネントのデフォルト値は、`/etc/prometheus/prometheus.yml`ファイルで定義する。

> ↪️：
>
> - https://knowledge.sakura.ad.jp/27501/#Prometheus_Server
> - https://www.techscore.com/blog/2017/12/07/prometheus-monitoring-setting/

<br>

### エンドポイント

#### ▼ `/metrics`

Prometheusで使用できるメトリクスの一覧を取得できる。

```bash
$ curl http://localhost:3000/metrics
```

> ↪️：
>
> - https://www.redhat.com/sysadmin/introduction-prometheus-metrics-and-performance-monitoring
> - https://itnext.io/prometheus-for-beginners-5f20c2e89b6c

<br>

### Retrieval

#### ▼ Retrievalとは

定義されたPromQLのルールに基づいて、監視対象のデータポイントを定期的に収集する。

#### ▼ Retrievalのルール

ルールの種類によって、収集後の処理が異なる。

| ルール名             | 説明                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| アラートルール       | 収集されたデータポイントがアラート条件に合致する場合、アラートを作成し、Alertmanagerにこれを送信する。 |
| レコーディングルール | 収集されたデータポイントをローカルストレージに保管する。                                               |

> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/

#### ▼ 設定ファイル

設定ファイルは`.yaml`ファイルで定義する。セットアップ方法によって設定ファイルが配置されるディレクトリは異なる。

例えば、prometheus-operatorを使用した場合は、prometheusコンテナの`/etc/prometheus/rules`ディレクトリ配下に配置される。

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

> ↪️：
>
> - https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/
> - https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/

<br>

### HTTP server

#### ▼ HTTP serverとは

メトリクスを参照するためのエンドポイントを公開する。

PromQLをリクエストとして受信し、ローカルストレージからデータを返却する。

<br>

### ローカルストレージ

#### ▼ ローカルストレージ

Prometheusは、`data`ディレクトリ配下をTSDBとして、収集した全てのメトリクスを保管する。

収集したメトリクスをデフォルトで`2`時間ごとにブロック化し、`data`ディレクトリ配下に配置する。

現在処理中のブロックはメモリ上に保持されており、同時にストレージの`/data/wal`ディレクトリにもバックアップとして保存される (補足としてRDBMSでは、これをジャーナルファイルという) 。

これにより、Prometheusで障害が発生し、メモリ上のブロックが削除されてしまっても、ストレージからブロックを復元できる。

> - https://prometheus.io/docs/prometheus/latest/storage/#local-storage

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

Prometheusの稼働するコンテナやNodeに接続すれば、`data`ディレクトリを確認できる。

```bash
$ kubectl exec -it prometheus -n prometheus -- sh

/data $ ls -la
drwxrwsr-x    3 1000     2000          4096 Jul  6 05:00 01BKGV7JC0RY8A6MACW02A2PJD # ブロック
drwxrwsr-x    3 1000     2000          4096 Jul  8 11:00 01BKTKF4VE33MYEEQF0M7YERFA
...
```

TSDBのディレクトリはNodeにマウントされるため、Nodeのストレージサイズに注意する必要がある。

ストレージサイズが大きすぎると、Prometheusのコンテナが起動できなくなることがあり、その場合はNode側でメトリクスのブロックを削除する必要がある。

> - https://github.com/prometheus/prometheus/issues/8298#issuecomment-747603392

対処方法として、データポイント数を減らし、データポイント全体のデータサイズを小さくすると良い。

> - https://engineering.linecorp.com/en/blog/prometheus-container-kubernetes-cluster/

#### ▼ 独自TSDB

Prometheusでは、TSDB (`data`ディレクトリ配下) を採用している。

データソース型モデルとメトリクス型モデルがあり、Prometheusではいずれを採用しているのかの記載が見つかっていない。

そのため、データソース型モデルと仮定してテーブル例を示す。

| timestamp    | cluster       | namespace       | ... | cpu  | memory |
| ------------ | ------------- | --------------- | --- | ---- | ------ |
| `2022-01-01` | `foo-cluster` | `foo-namespace` | ... | `10` | `10`   |
| `2022-01-02` | `foo-cluster` | `foo-namespace` | ... | `20` | `30`   |

> ↪️：
>
> - https://db-engines.com/en/system/InfluxDB%3BLevelDB%3BPrometheus
> - https://www.alibabacloud.com/blog/key-concepts-and-features-of-time-series-databases_594734

<br>

### リモートストレージ

#### ▼ リモートストレージとは

Prometheusは、ローカルストレージにメトリクスを保管する代わりに、TSDBとして動作するリモートストレージ (AWS Timestream、Google Bigquery、VictoriaMetrics、...) に保管できる。

remote-write-receiverを有効化すると、リモートストレージの種類によらず、エンドポイントが『`https://<IPアドレス>/api/v1/write`』になる (ポート番号はリモートストレージごとに異なる) 。

Prometheusと外部のTSDBの両方を冗長化する場合、冗長化されたPrometheusでは、片方のデータベースのみに送信しないと、メトリクスが重複してしまうGrafanaのようにリアルタイムにデータを取得し続けることはできない。

リモート読み出しを使用する場合、Prometheusのダッシュボード上でPromQLを使うことなく、Grafanaのようにリアルタイムにデータを取得できるようになる。

![prometheus_remote-storage](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/prometheus_remote-storage.png)

> ↪️：
>
> - https://prometheus.io/docs/prometheus/latest/storage/#remote-storage-integrations
> - https://prometheus.io/docs/operating/integrations/#remote-endpoints-and-storage
> - https://prometheus.io/blog/2021/11/16/agent/#history-of-the-forwarding-use-case

#### ▼ ダイナミックキュー

リモートストレージにメトリクスを送信する場合、送信されたメトリクスをキューイングする。

ダイナミックキューは、メトリクスのスループットの高さに応じて、キューイングの実行単位であるシャードを増減させる。

![prometheus_dynamic-queues_shard](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/prometheus_dynamic-queues_shard.png)

> - https://speakerdeck.com/inletorder/monitoring-platform-with-victoria-metrics?slide=52

<br>

## 02. Alertmanager

### Alertmanagerとは

Prometheusのアラートを受信し、特定の条件下で通知する。

受信したアラートは、AlertmanagerのUI上に表示される。

![alertmanager](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/alertmanager.png)

> ↪️：
>
> - https://prometheus.io/docs/alerting/latest/alertmanager/
> - https://www.designet.co.jp/ossinfo/alertmanager/
> - https://knowledge.sakura.ad.jp/11635/#Prometheus-3
> - https://amateur-engineer-blog.com/alertmanager-silence/

### Storage

Alertmanagerのデータを永続化する。

```bash
# Node内 (AWS EKSのEC2ワーカーNodeの場合)
$ ls -la /var/lib/kubelet/plugins/kubernetes.io/aws-ebs/mounts/aws/ap-northeast-1a/vol-*****/alertmanager-db/
```

<br>

### Silence

受信したアラートの通知を一時的に無効化する。

Silenceされている期間、無効化されたアラートはAlertmanagerのUI上から削除され、通知されなくなる。

> - https://amateur-engineer-blog.com/alertmanager-silence/

<br>

## 03. PushGateway

### PushGatewayとは

PrometheusがPush型メトリクスを対象から収集するためのエンドポイントとして動作する。

> - https://prometheus.io/docs/practices/pushing/

<br>

## 04. ServiceDiscovery

### ServiceDiscoveryとは

Pull型通信の宛先のIPアドレスが動的に変化する (例：スケーリングなど) 場合、宛先を動的に検出し、データポイントを収集し続けられるようにする。

> - https://christina04.hatenablog.com/entry/prometheus-service-discovery

<br>

## 04. マネージドPrometheus

Prometheusのコンポーネントを部分的にマネージドにしたサービス。

執筆時点 (2023/05/16時点) では、リモートストレージ、Alertmanager、をマネージドにしてくれる。

> - https://www.infoq.com/jp/news/2021/01/aws-grafana-prometheus/

<br>
