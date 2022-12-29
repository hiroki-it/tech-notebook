---
title: 【IT技術の知見】テレメトリー収集ツール＠可観測性
description: テレメトリー収集ツール＠可観測性の知見を記録しています。
---

# テレメトリー収集ツール＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. テレメトリー収集ツールの比較

### メトリクスの場合

メトリクス収集ツールを比較した。

> ℹ️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6

| アクション                             | cAdvisor | Grafana | kube-state-metrics | Prometheus |        OpenTelemetry         | Datadog |
|-----------------------------------|:--------:|:-------:|:------------------:|:----------:|:----------------------------:|:-------:|
| メトリクスのデータポイントを収集（プル型またはプッシュ型） |    ✅     |         |         ✅          |     ✅      | ✅<br>（2022/07/13時点で開発中） |    ✅    |
| ↓                                 |    ↓     |    ↓    |         ↓          |     ↓      |              ↓               |    ↓    |
| ビルトインローカルストレージへの保管              |          |         |                    |            |                              |    ✅    |
| 分析                              |    ✅     |         |         ✅          |     ✅      |                              |    ✅    |
| ダッシュボードによる可視化                  |    ✅     |    ✅    |                    |            |                              |    ✅    |
| レポートの作成                         |          |         |                    |            |                              |    ✅    |
| ↓                                 |    ↓     |    ↓    |         ↓          |     ↓      |              ↓               |    ↓    |
| アラート                              |          |         |                    |            |                              |    ✅    |

<br>

### ログの場合

ログ収集ツールを比較した。

> ℹ️ 参考：
> 
> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136

| アクション                | Fluentd/Fluentbit | Protail | Elasticsearch | Grafana loki  | Logstash |        OpenTelemetry         |
|----------------------|:-----------------:|:-------:|:-------------:|:-------------:|:--------:|:----------------------------:|
| ログの収集（いずれもプッシュ型）  |         ✅         |    ✅    |               |               |    ✅     | ✅<br>（2022/07/13時点で開発中） |
| ↓                    |         ↓         |    ↓    |       ↓       |       ↓       |    ↓     |              ↓               |
| ビルトインローカルストレージへの保管 |                   |         |       ✅       | ✅<br>（BoltDB） |          |                              |
| 分析                 |                   |         |       ✅       |       ✅       |    ✅     |                              |
| ダッシュボードによる可視化     |                   |         |               |               |          |                              |
| レポートの作成            |                   |         |               |               |          |                              |
| ↓                    |         ↓         |    ↓    |       ↓       |       ↓       |    ↓     |              ↓               |
| アラート                 |                   |         |               |               |          |                              |

<br>

### 分散トレースの場合

分散トレース収集ツールを比較した。

> ℹ️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection

| アクション                        | OpenTelemetry |    Jaeger     | Zipkin | Pinpoint | Datadog | AWS X-Ray |
|------------------------------|:-------------:|:-------------:|:------:|:--------:|:-------:|:---------:|
| 分散トレースの収集（プル型またはプッシュ型） |       ✅       |       ✅       |   ✅    |    ✅     |    ✅    |     ✅     |
| ↓                            |       ↓       |       ↓       |   ↓    |    ↓     |    ↓    |     ↓     |
| ビルトインローカルストレージへの保管         |               | ✅<br>（Badger） |        |          |    ✅    |     ✅     |
| 分析                         |       ✅       |       ✅       |   ✅    |    ✅     |    ✅    |     ✅     |
| ダッシュボードによる可視化             |               |       ✅       |   ✅    |    ✅     |    ✅    |     ✅     |
| レポートの作成                    |               |               |        |          |         |           |
| ↓                            |       ↓       |       ↓       |   ↓    |    ↓     |    ↓    |     ↓     |
| アラート                         |               |               |        |          |         |           |

<br>

