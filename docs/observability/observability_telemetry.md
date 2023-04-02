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

プッシュ型の場合、メトリクス収集のためのエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション                          | AWS CloudWatch | Datadog |          OpenTelemetry          | Prometheus |
|--------------------------------| :------------------------------------: | :-----: | :-----------------------------: | :--------: |
| メトリクスのデータポイントの作成 | ✅<br> (cloudwatchエージェント) | ✅<br> (datadogエージェント) | ✅<br/>(クライアントパッケージ) | ✅<br>(Exporter) |
| メトリクスのデータポイントを収集<br>(プル型またはプッシュ型) | ✅<br> (cloudwatchエージェント) | ✅<br> (datadogエージェント) | ✅<br> (OTelコレクター) |     ✅<br>(prometheusサーバー)     |
| ⬇︎                              |⬇︎|    ⬇︎    |    ⬇︎     |   ⬇︎    |
| ビルトインローカルストレージへの保管             |                   ✅<br/>(AWS CloudWatchメトリクス)                   |   ✅    | - | - |
| 分析                             |                   ✅<br/>(AWS CloudWatchメトリクス)                   |   ✅    | - |     -     |
| ダッシュボードによる可視化                  |                   ✅<br/>(AWS CloudWatchメトリクス)                   |   ✅    | - |     -     |
| レポートの作成                        | ✅<br/>(AWS CloudWatch Contributor Insights) |   ✅    | - | - |
| ⬇︎                              |                   ⬇︎                    |    ⬇︎    |                ⬇︎                |     ⬇︎      |
| アラートの作成                        |                   ✅<br>(AWS CloudWatchアラーム)                   |   ✅    | - |     ✅     |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6

#### ▼ 組み合わせの例

| アクション                                                   |            例2             |            例1             |         例3         |
| ------------------------------------------------------------ | :------------------------: | :------------------------: | :-----------------: |
| メトリクスのデータポイントを収集<br>(プル型またはプッシュ型) | AWS CloudWatchエージェント | Exporter<br>またはcAdvisor | datadogエージェント |
| ⬇︎                                                            |             ⬇︎              |             ⬇︎              |          ⬇︎          |
| ビルトインローカルストレージへの保管                         |  AWS CloudWatchメトリクス  |         Prometheus         |       Datadog       |
| 分析                                                         |  AWS CloudWatchメトリクス  |         Prometheus         |       Datadog       |
| ダッシュボードによる可視化                                   |  AWS CloudWatchメトリクス  |          Grafana           |       Datadog       |
| レポートの作成                                               |             -              |             -              |       Datadog       |
| ⬇︎                                                            |             ⬇︎              |             ⬇︎              |          ⬇︎          |
| アラートの作成                                               |   AWS CloudWatchアラーム   |         Prometheus         |       Datadog       |

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

いずれもプッシュ型で、ログ収集のためのエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション              | AWS CloudWatch | Elasticsearch | Fluentd<br>Fluentbit | Grafana loki |          OpenTelemetry          |
|--------------------| :--------------------------: | :-----------: | :---------------: | :------: | :-----------------------------: |
| ログの作成<br>(アプリ側が実施する) | - | - | - | - | - |
| ログの収集<br>(いずれもプッシュ型) | ✅<br>(cloudwatchエージェント) | ✅<br>(Logstach) |        ✅         |    ✅<br>(Promtail)    | ✅<br/>(OTelコレクター) |
| ⬇︎                  |                              |       ⬇︎       |         ⬇︎         |    ⬇︎     |                ⬇︎                |
| ビルトインローカルストレージへの保管 |              ✅<br/>(AWS CloudWatchログ)              | - | - | ✅<br> (BoltDB) | - |
| 分析                 |              ✅<br>(AWS CloudWatchメトリクスのログメトリクス)              |      ✅       | - | ✅ | - |
| ダッシュボードによる可視化      |              ✅<br/>(AWS CloudWatchログ)              |      ✅       | - | ✅ | - |
| レポートの作成            | ✅<br/>(AWS CloudWatch Contributor Insights) | - | - | - | - |
| ⬇︎                  | ⬇︎ |       ⬇︎       |         ⬇︎         |    ⬇︎     |                ⬇︎                |
| アラートの作成            |              ✅<br/>(AWS CloudWatchアラーム)              | - | - | - | - |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3

#### ▼ 組み合わせの例

| アクション                           |                     例1                      |     例2      |          例3          |
| ------------------------------------ | :------------------------------------------: | :----------: | :-------------------: |
| ログの収集<br>(いずれもプッシュ型)   |             Fluentd<br>Fluentbit             |   Promtail   | Fluentd<br/>Fluentbit |
| ⬇︎                                    |                      ⬇︎                       |      ⬇︎       |           ⬇︎           |
| ビルトインローカルストレージへの保管 |              AWS CloudWatchログ              | Grafana loki |        Datadog        |
| 分析                                 |         AWS CloudWatchログインサイト         | Grafana loki |        Datadog        |
| ダッシュボードによる可視化           | AWS CloudWatchメトリクスによるログメトリクス |   Grafana    |        Datadog        |
| レポートの作成                       |                      -                       |      -       |        Datadog        |
| ⬇︎                                    |                      ⬇︎                       |      ⬇︎       |           ⬇︎           |
| アラートの作成                       |            AWS CloudWatchアラーム            |  Prometheus  |        Datadog        |

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

いずれもプッシュ型で、分散トレース収集のためのエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション                   | AWS X-Ray | Datadog |     Grafana Tempo     |     Jaeger     |          OpenTelemetry          | Zipkin |
|-------------------------| :-------: | :-----: |:--------------:|:-------------------------------:| :------: |:-----------------------:|
| スパンの作成 | ✅<br>(クライアントパッケージ) | ✅<br>(クライアントパッケージ) | - | ✅<br>(jaegerエージェント) | ✅<br>(クライアントパッケージ) | - |
| 分散トレースの収集<br>(プッシュ型) | ✅<br>(xrayエージェント) |   ✅<br>(datadogエージェント)   | - |       ✅<br>(jaegerコレクター)       |                ✅<br>(OTelコレクター)                |   ✅<br>(zipkinコレクター)   |
| ⬇︎                       |     ⬇︎     |    ⬇︎    | ⬇︎ |       ⬇︎        |                ⬇︎                |   ⬇︎    |
| ビルトインローカルストレージへの保管        |    ✅     |   ✅    | - | ✅<br> (Badger) | ✅<br> (Cassandra、Elasticsearch) | - |
| 分析                                        |    ✅     |   ✅    |       ✅       |       ✅        | - |   ✅   |
| ダッシュボードによる可視化                  |    ✅     |   ✅    |       ✅       |       ✅        | - |   ✅   |
| レポートの作成                              | - | - | - | - | - | - |
| ⬇︎                                           |     ⬇︎     |    ⬇︎    |       ⬇︎      |       ⬇︎        |                ⬇︎                |   ⬇︎    |
| アラートの作成                                 | - | - | - | - | - | - |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#022

<br>
