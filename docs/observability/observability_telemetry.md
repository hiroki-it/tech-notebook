---
title: 【IT技術の知見】テレメトリー収集ツール＠可観測性
description: テレメトリー収集ツール＠可観測性の知見を記録しています。
---

# テレメトリー収集ツール＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. テレメトリー収集ツールの比較

### メトリクスのデータポイントの収集

> ℹ️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6

| アクション              | cAdvisor | Grafana | kube-state-metrics | Prometheus | OpenTelemetry |
|--------------------| -------- | ------- | ------------------ | ---------- | ---------- |
| メトリクスのデータポイントを収集（プル型またはプッシュ型） | ✅        |         | ✅                  | ✅          | ✅（2022/07/13時点で開発中） |
| ↓                  |          |         |                    |            |            |
| ビルトインローカルストレージへの保管  |          |         |                    |            |            |
| 分析                 | ✅        |         | ✅                  | ✅          |           |
| 可視化                | ✅        | ✅       |                    |            |            |
| レポートの作成            |          |         |                    |            |            |
| ↓                  |          |         |                    |            |            |
| アラート               |          |         |                    |            |            |

<br>

### ログの収集

> ℹ️ 参考：https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars

| アクション                 | Fluentd/Fluentbit | Protail | Elasticsearch | Grafana loki | Logstash | OpenTelemetry |
| -------------------------- | -------------------------- | -------------------------- | ------------- | ------------ | -------- | -------- |
| ログの収集（いずれもプッシュ型） | ✅ | ✅ |               |              |          | ✅（2022/07/13時点で開発中） |
| ↓                          |  |  |               |              |          |          |
| ビルトインローカルストレージへの保管 |  |  | ✅             | ✅（BoltDB）    |         |         |
| 分析                       |  |  | ✅             | ✅            | ✅        |         |
| 可視化                     |  |  |               |              |          |          |
| レポートの作成             |  |  |               |              |          |          |
| ↓                          |  |  |               |              |          |          |
| アラート                   |  |  |               |              |          |          |

<br>

### 分散トレースの収集

> ℹ️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection

| アクション                 | Jaeger | Zipkin | Pinpoint | AWS X-Ray |
| -------------------------- | ------ | ------ | -------- |-----------|
| 分散トレースの収集（プル型またはプッシュ型） | ✅      | ✅      | ✅        | ✅         |
| ↓                          |        |        |          |           |
| ビルトインローカルストレージへの保管 | ✅（Badger） |        |          |  ✅         |
| 分析                       | ✅      | ✅      | ✅        | ✅         |
| 可視化                     | ✅      | ✅      | ✅        |           |
| レポートの作成             |        |        |          |           |
| ↓                          |        |        |          |           |
| アラート                   |        |        |          |           |

<br>

