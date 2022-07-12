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
| メトリクスのデータポイントを収集 | ✅        |         | ✅     | ✅                  | ✅          |           |
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
| ログの収集（ルーティング）         | ✅ | ✅ |               |              |          |          |
| ↓                          |  |  |               |              |          |          |
| 組み込みローカルストレージへの保管 |  |  | ✅             | ✅（BoltDB）    |         |         |
| 分析                       |  |  | ✅             | ✅            | ✅        |         |
| 可視化                     |  |  |               |              |          |          |
| レポートの作成             |  |  |               |              |          |          |
| ↓                          |  |  |               |              |          |          |
| アラート                   |  |  |               |              |          |          |

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

Kubernetesリソースの分散トレースを収集し、これの分析と可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>

## 04. Kiali

### Kialiの仕組み

#### ▼ アーキテクチャ

Prometheusで収集されたメトリクスを再収集し、Istioの可視化を拡張する。現状は、Istioのコンポーネントに依存している。

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

<br>
