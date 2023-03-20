---
title: 【IT技術の知見】テレメトリー収集ツール＠可観測性
description: テレメトリー収集ツール＠可観測性の知見を記録しています。
---

# テレメトリー収集ツール＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. テレメトリー収集ツールの比較

### メトリクスの場合

#### ▼ 種類

メトリクス収集ツールを比較した。

| アクション                                                | cAdvisor | kube-state-metrics | Prometheus |          OpenTelemetry          | Datadog | CloudWatchメトリクスエージェント/Cloudモニタリングエージェント | CloudWatchメトリクス/Cloudモニタリング |
| --------------------------------------------------------- | :------: | :----------------: | :--------: | :-----------------------------: | :-----: | :------------------------------------------------------------: | :------------------------------------: |
| メトリクスのデータポイントを収集 (プル型またはプッシュ型) |    ✅    |         ✅         |     ✅     | ✅<br> (2022/07/13時点で開発中) |   ✅    |                               ✅                               |                                        |
| ↓                                                         |    ↓     |         ↓          |     ↓      |                ↓                |    ↓    |                                                                |                   ↓                    |
| ビルトインローカルストレージへの保管                      |          |                    |            |                                 |   ✅    |                                                                |                   ✅                   |
| 分析                                                      |    ✅    |         ✅         |     ✅     |                                 |   ✅    |                                                                |                   ✅                   |
| ダッシュボードによる可視化                                |    ✅    |                    |            |                                 |   ✅    |                                                                |                   ✅                   |
| レポートの作成                                            |          |                    |            |                                 |   ✅    |                                                                |                                        |
| ↓                                                         |    ↓     |         ↓          |     ↓      |                ↓                |    ↓    |                                                                |                   ↓                    |
| アラート                                                  |          |                    |     ✅     |                                 |   ✅    |                                                                |                   ✅                   |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6

#### ▼ 組み合わせの例

| アクション                                                |    例1     |                         例2                         |
| --------------------------------------------------------- | :--------: | :-------------------------------------------------: |
| メトリクスのデータポイントを収集 (プル型またはプッシュ型) | Prometheus | CloudWatchログエージェント/CloudLoggingエージェント |
| ↓                                                         |     ↓      |                          ↓                          |
| ビルトインローカルストレージへの保管                      | Prometheus |       CloudWatchメトリクス/Cloudモニタリング        |
| 分析                                                      | Prometheus |       CloudWatchメトリクス/Cloudモニタリング        |
| ダッシュボードによる可視化                                |  Grafana   |       CloudWatchメトリクス/Cloudモニタリング        |
| レポートの作成                                            |            |                                                     |
| ↓                                                         |     ↓      |                          ↓                          |
| アラート                                                  | Prometheus |       CloudWatchメトリクス/Cloudモニタリング        |

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

| アクション                           | Fluentd/Fluentbit | Promtail | Elasticsearch |  Grafana loki   | Logstash |          OpenTelemetry          | CloudWatchログエージェント/CloudLoggingエージェント | CloudWatchログ/Cloudロギング |
| ------------------------------------ | :---------------: | :------: | :-----------: | :-------------: | :------: | :-----------------------------: | :-------------------------------------------------: | :--------------------------: |
| ログの収集 (いずれもプッシュ型)      |        ✅         |    ✅    |               |                 |    ✅    | ✅<br> (2022/07/13時点で開発中) |                         ✅                          |                              |
| ↓                                    |         ↓         |    ↓     |       ↓       |        ↓        |    ↓     |                ↓                |                          ↓                          |                              |
| ビルトインローカルストレージへの保管 |                   |          |      ✅       | ✅<br> (BoltDB) |          |                                 |                                                     |              ✅              |
| 分析                                 |                   |          |      ✅       |       ✅        |    ✅    |                                 |                                                     |              ✅              |
| ダッシュボードによる可視化           |                   |          |               |                 |          |                                 |                                                     |              ✅              |
| レポートの作成                       |                   |          |               |                 |          |                                 |                                                     |                              |
| ↓                                    |         ↓         |    ↓     |       ↓       |        ↓        |    ↓     |                ↓                |                          ↓                          |                              |
| アラート                             |                   |          |               |                 |          |                                 |                                                     |              ✅              |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3

#### ▼ 組み合わせの例

| アクション                           |                 例1                 |      例2      |
| ------------------------------------ |:----------------------------------:|:------------:|
| ログの収集 (いずれもプッシュ型)      | Fluentd/Fluentbit、CloudWatchエージェント |   Promtail   |
| ↓                                    |                 ↓                  |      ↓       |
| ビルトインローカルストレージへの保管 |       CloudWatchログ/Cloudロギング       | Grafana loki |
| 分析                                 |         CloudWatchログインサイト          | Grafana loki |
| ダッシュボードによる可視化           |       CloudWatchログ/Cloudロギング       |   Grafana    |
| レポートの作成                       |                                    |              |
| ↓                                    |                 ↓                  |      ↓       |
| アラート                             |       CloudWatchログ/Cloudロギング       |  Prometheus  |

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

| アクション                                  |           OpenTelemetry           |     Jaeger      | Zipkin | Pinpoint | Datadog | AWS X-Ray |
| ------------------------------------------- | :-------------------------------: | :-------------: | :----: | :------: | :-----: | :-------: |
| 分散トレースの収集 (プル型またはプッシュ型) |                ✅                 |       ✅        |   ✅   |    ✅    |   ✅    |    ✅     |
| ↓                                           |                 ↓                 |        ↓        |   ↓    |    ↓     |    ↓    |     ↓     |
| ビルトインローカルストレージへの保管        | ✅<br> (Cassandra、Elasticsearch) | ✅<br> (Badger) |        |          |   ✅    |    ✅     |
| 分析                                        |                ✅                 |       ✅        |   ✅   |    ✅    |   ✅    |    ✅     |
| ダッシュボードによる可視化                  |                                   |       ✅        |   ✅   |    ✅    |   ✅    |    ✅     |
| レポートの作成                              |                                   |                 |        |          |         |           |
| ↓                                           |                 ↓                 |        ↓        |   ↓    |    ↓     |    ↓    |     ↓     |
| アラート                                    |                                   |                 |        |          |         |           |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection

<br>
