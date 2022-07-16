---
title: 【IT技術の知見】テレメトリー収集ツール
description: テレメトリー収集ツールの知見を記録しています。
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

| アクション              | cAdvisor | Grafana | Kiali | kube-state-metrics | Prometheus | OpenTelemetry |
|--------------------| -------- | ------- | ----- | ------------------ | ---------- | ---------- |
| メトリクスのデータポイントを収集（プル型またはプッシュ型） | ✅        |         | ✅     | ✅                  | ✅          | ✅（2022/07/13時点で開発中） |
| ↓                  |          |         |       |                    |            |            |
| 組み込みローカルストレージへの保管  |          |         |       |                    |            |            |
| 分析                 | ✅        |         | ✅     | ✅                  | ✅          |           |
| 可視化                | ✅        | ✅       |       |                    |            |            |
| レポートの作成            |          |         |       |                    |            |            |
| ↓                  |          |         |       |                    |            |            |
| アラート               |          |         |       |                    |            |            |

<br>

### ログ

参考：https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars

| アクション                 | Fluentd/Fluentbit | Protail | Elasticsearch | Grafana loki | Logstash | OpenTelemetry |
| -------------------------- | -------------------------- | -------------------------- | ------------- | ------------ | -------- | -------- |
| ログの収集（いずれもプッシュ型） | ✅ | ✅ |               |              |          | ✅（2022/07/13時点で開発中） |
| ↓                          |  |  |               |              |          |          |
| 組み込みローカルストレージへの保管 |  |  | ✅             | ✅（BoltDB）    |         |         |
| 分析                       |  |  | ✅             | ✅            | ✅        |         |
| 可視化                     |  |  |               |              |          |          |
| レポートの作成             |  |  |               |              |          |          |
| ↓                          |  |  |               |              |          |          |
| アラート                   |  |  |               |              |          |          |

<br>

### 分散トレース

参考：

- https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
- https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection

| アクション                 | Jaeger | Zipkin | Pinpoint | OpenTelemetry |
| -------------------------- | ------ | ------ | -------- | ------------- |
| 分散トレースの収集（プル型またはプッシュ型） | ✅      | ✅      | ✅        | ✅             |
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

#### ▼ アーキテクチャ

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

#### ▼ アーキテクチャ

Jaegerは、jaegerクライアントパッケージ（2022/07/16時点で、OTelクライアントパッケージの使用が推奨）、jaegerエージェント、jaegerコレクター、ローカルストレージまたはリモートストレージ、jaegerクエリ、ダッシュボード（UI）、から構成されている。

参考：https://www.jaegertracing.io/docs/latest/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

#### ▼ jaegerクライアントパッケージ（非推奨）

2022/07/16時点で、OTelクライアントパッケージを使用することが推奨されている。参考程度に、jaegerクライアントパッケージの仕組みを記載する。アプリケーションにて、jaegerクライアントパッケージはスパンを作成し、またリクエストメッセージにコンテキスト情報（トレースID、スパンID、OpenTracingバゲージ）を付与する。jaegerクライアントパッケージは、コンテナ内でデーモンとして稼働するjaegerエージェントにスパンを渡す。

参考：https://www.jaegertracing.io/docs/latest/architecture/#jaeger-client-libraries-deprecated

#### ▼ jaegerエージェント

コンテナにて、デーモンとして稼働し、スパンの受信をリッスンする。

参考：https://www.jaegertracing.io/docs/latest/architecture/#agent

#### ▼ jaegerコレクター

jaegerコレクターは、プッシュ型でjaegerエージェントからコンテキスト情報を収集し、ローカルストレージに保存する。

参考：https://www.jaegertracing.io/docs/latest/architecture/#collector

#### ▼ ローカルストレージまたはリモートストレージ

リモートストレージとして、Cassandra、Elasticsearch、Kafka、を使用できる。

参考：https://www.jaegertracing.io/docs/latest/architecture/#query

#### ▼ ダッシュボード（UI）

ダッシュボード（UI）は、jaegerクエリを使用して、ストレージ内のコンテキスト情報を分散トレースとして可視化する。

<br>

## 04. Kiali

### Kialiの仕組み

#### ▼ アーキテクチャ

Kialiは、フロントエンドアプリケーションとバックエンドアプリケーションから構成されている。バックエンドアプリケーションは、Prometheusで収集されたメトリクスを再収集し、Istioの可視化を拡張する。フロントエンドアプリケーションは、ダッシュボードとして機能する。現状は、Istioのコンポーネントに依存している。

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>

## 05. OpenTelemetry

### OpenTelemetryの仕組み

#### ▼ アーキテクチャ

![open-telemetry_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-telemetry_architecture.png)

OpenTelemetryは、サードパーティパッケージ、OTelクライアントパッケージ、OTelコレクター、から構成されている。OpenTelemetryを導入することで、テレメトリーごとに異なるインスツルメント化ツール（テレメトリーを収集できる状態にするツール）を使用せずに、一括してインスツルメント化できるようになる。

参考：

- https://opentelemetry.io/docs/
- https://dzone.com/refcardz/getting-started-with-opentelemetry

#### ▼ サードパーティパッケージ

OpenTelemetry用パッケージは、OTelクライアントパッケージの一つであるAPIパッケージをコールし、テレメトリーデータを作成する。

#### ▼ OTelクライアントパッケージ

![open-telemetry_client-package](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-telemetry_client-package.png)

OTelクライアントパッケージは、APIパッケージ、SDKパッケージ、セマンティック変換パッケージ、プラグイン、から構成されている。アプリケーションをインスツルメント化する。OpenTelemetry用パッケージからのテレメトリーデータを、APIパッケージで受け取り、最終的にOTelコレクターにこれを渡す。

参考：https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/library-guidelines.md#opentelemetry-client-generic-design

#### ▼ OTelコレクター

OTelコレクターは、レシーバー、プロセッサー、エクスポーター、から構成されている。OTelクライアントパッケージからのテレメトリーデータを、レシーバーで受け取り、最終的にテレメトリーデーターの可視化ツールにこれを渡す。

参考：https://www.logicmonitor.com/blog/what-is-an-otel-collector

![open-telemetry_collector](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-telemetry_collector.png)
