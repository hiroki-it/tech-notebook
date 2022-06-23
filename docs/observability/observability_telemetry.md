---
title: 【知見を記録するサイト】テレメトリー収集ツール
description: テレメトリー収集ツールの知見をまとめました。
---

# テレメトリー収集ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. テレメトリー収集ツールの比較

### メトリクス

参考：

- https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
- https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6

| アクション              | cAdvisor | Grafana | Kiali | kube-state-metrics | Prometheus |
|--------------------| -------- | ------- | ----- | ------------------ | ---------- |
| メトリクスのデータポイントを収集 | ✅        |         | ✅     | ✅                  | ✅          |
| ↓                  |          |         |       |                    |            |
| 組み込みローカルストレージへの保管  |          |         |       |                    |            |
| 分析                 | ✅        |         | ✅     | ✅                  | ✅          |
| 可視化                | ✅        | ✅       |       |                    |            |
| レポートの作成            |          |         |       |                    |            |
| ↓                  |          |         |       |                    |            |
| アラート               |          |         |       |                    |            |

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

#### ▼ データソース

参考：https://qiita.com/MetricFire/items/15e024aea40785be622c

| データソース名       | 例                                             |
| -------------------- | ---------------------------------------------- |
| 時系列データベース   | Prometheus、VictriaMetrics、Graphite、InfluxDB |
| RDB                  | MySQL、PostgreSQL                              |
| クラウドデータソース | AWS CloudWatch、Google Stackdriver             |

#### ▼ ダッシュボード

PromQLによるデータポイントの抽出をメトリクスとし、複数のメトリクスのセットをダッシュボードとして定義できる。

<br>

## 03. Jaeger

### Jaegerの仕組み

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

## 05. VictoriaMetrics

### VictoriaMetricsの仕組み

#### ▼ 構造

リモートストレージとして、Prometheusで収集したメトリクスを保管する。シングルNodeモードとクラスターNodeモードがあり、Clusterモードでは各コンポーネントが冗長化される。エンドポイントとしてロードバランサーがあり、書き込みエンドポイントを指定すれば、ストレージにメトリクスを書き込める。また読み出しエンドポイントを指定すれば、ストレージからメトリクスを読み込める。

参考：https://docs.victoriametrics.com/Cluster-VictoriaMetrics.html#architecture-overview

![victoria-metrics_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/victoria-metrics_architecture.png)

#### ▼ vmselect

クライアントから読み出しリクエストを受信し、vmstorageからデータを読み出す。

#### ▼ vmstorage

データをファイルシステムに保管する。保管時にデータを圧縮している。圧縮率は約```10%```らしい。

参考：https://qiita.com/nikita/items/482a77a829c81cd919f0#1%E5%9C%A7%E7%B8%AE%E7%8E%87%E3%81%8C%E9%AB%98%E3%81%84

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

#### ▼ vminsert

クライアントから書き込みリクエストを受信し、vmstorageにデータを書き込む。

<br>

### ストレージの必要サイズの見積もり

vmstorageの```/var/lib/victoriametrics/```ディレクトリ配下がどのくらい増加するかで、ストレージの必要サイズを見積もれる。

部品ファイルの```20```%のサイズを空けておく必要がある。

参考：https://docs.victoriametrics.com/#capacity-planning

<br>
