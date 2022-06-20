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

<br>

## 03. Jaeger

### 仕組み

#### ▼ 構造

Kubernetesリソースの分散トレースを収集し、これの分析と可視化を行う。

参考：https://www.jaegertracing.io/docs/1.31/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>

## 05. Kiali

### Kialiの仕組み

#### ▼ 構造

Prometheusで収集されたメトリクスを再収集し、Istioの可視化を拡張する。現状は、Istioのコンポーネントに依存している。

参考：https://kiali.io/docs/architecture/architecture/

![kiali_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kiali_architecture.png)

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

