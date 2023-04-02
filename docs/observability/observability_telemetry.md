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

| アクション                                                   |               AWS CloudWatch                |           Datadog            |         Istio<br>(連携なしの状態)         |         OpenTelemetry          |         Prometheus         |
| :----------------------------------------------------------: | :-----------------------------------------: | :--------------------------: | :--------------------------: | :----------------------------: | -------------------------: |
| メトリクスのデータポイントの作成                             |       ✅<br> (cloudwatchエージェント)       | ✅<br> (datadogエージェント) |      ✅<br>(Envoyによるリクエスト系メトリクスの作成)      | ✅<br>(クライアントパッケージ) |      ✅<br>(Exporter)      |
| ⬇︎                       | ⬇︎ |        ⬇︎        |          ⬇︎          |        ⬇︎        |            ⬇︎            |           ⬇︎           |
| メトリクスのデータポイントを収集<br>(プル型またはプッシュ型) |       ✅<br> (cloudwatchエージェント)       | ✅<br> (datadogエージェント) | ✅<br>(IstiodコントロールプレーンによるEnvoyのメトリクスの収集) |    ✅<br> (OTelコレクター)     | ✅<br>(prometheusサーバー) |
| ⬇︎                                                           |                     ⬇︎                      |              ⬇︎              |             ⬇︎             |               ⬇︎               |             ⬇︎             |
| 監視バックエンドとして可視化                                 |      ✅<br>(AWS CloudWatchメトリクス)       |              ✅              |             -             |               -                |             -              |
| ビルトインローカルストレージへの保管                         |      ✅<br>(AWS CloudWatchメトリクス)       |              ✅              |             -             |               -                |             -              |
| 分析                                                         |      ✅<br>(AWS CloudWatchメトリクス)       |              ✅              |             -             |               -                |             -              |
| レポートの作成                                               | ✅<br>(AWS CloudWatch Contributor Insights) |              ✅              |             -             |               -                |             -              |
| ⬇︎                                                           |                     ⬇︎                      |              ⬇︎              |             ⬇︎             |               ⬇︎               |             ⬇︎             |
| アラートの作成                                               |       ✅<br>(AWS CloudWatchアラーム)        |              ✅              |             -             |               -                |             ✅             |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

| アクション                             |            例2             |            例1             |         例3         |
|-----------------------------------| :------------------------: | :------------------------: | :-----------------: |
| メトリクスのデータポイントの作成                  |  AWS CloudWatchエージェント  | Exporter<br>またはcAdvisor |       datadogエージェント       |
| ⬇︎                                |             ⬇︎             |             ⬇︎             |         ⬇︎          |
| メトリクスのデータポイントを収集<br>(プル型またはプッシュ型) | AWS CloudWatchエージェント | Exporter<br>またはcAdvisor | datadogエージェント |
| ⬇︎                                |             ⬇︎             |             ⬇︎             |         ⬇︎          |
| 監視バックエンドとして可視化                    |  AWS CloudWatchメトリクス  |          Grafana           |       Datadog       |
| ビルトインローカルストレージへの保管                |  AWS CloudWatchメトリクス  |         Prometheus         |       Datadog       |
| 分析                                |  AWS CloudWatchメトリクス  |         Prometheus         |       Datadog       |
| レポートの作成                           |             -              |             -              |       Datadog       |
| ⬇︎                                |             ⬇︎             |             ⬇︎             |         ⬇︎          |
| アラートの作成                           |   AWS CloudWatchアラーム   |         Prometheus         |       Datadog       |

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

いずれもプッシュ型で、ログ収集のためのエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション                    |               AWS CloudWatch               |     Elasticsearch     |    Fluentd<br>Fluentbit    |     Grafana loki      |    Istio<br>(連携なしの状態)    |        OpenTelemetry        |
|--------------------------|:------------------------------------------:|:---------------------:|:--------------------------:|:---------------------:|:------------------------:|:---------------------------:|
| 実行ログの作成     |                  -                   |        -        |          -           |        -        |             -             |           -           |
| アクセスログの作成 |                      -                      |           -            |              -              |           -            | ✅<br>(Envoyによるアクセスログ作成) |              -               |
| ⬇︎                       |                     ⬇︎                     |          ⬇︎           |             ⬇︎             |          ⬇︎           |            ⬇︎            |             ⬇︎              |
| ログの収集<br>(いずれもプッシュ型)     |          ✅<br>(cloudwatchエージェント)           |    ✅<br>(Logstach)    |             ✅              |    ✅<br>(Promtail)    |            -             |      ✅<br>(OTelコレクター)       |
| ⬇︎                       |                     ⬇︎                     |          ⬇︎           |             ⬇︎             |          ⬇︎           |            ⬇︎            |             ⬇︎              |
| 監視バックエンドとして可視化           |          ✅<br>(AWS CloudWatchログ)           |           ✅           |             -              |           ✅           |            -             |              -              |
| ビルトインローカルストレージへの保管       |          ✅<br>(AWS CloudWatchログ)           |           -           |             -              |    ✅<br> (BoltDB)     |            -             |              -              |
| 分析                       |     ✅<br>(AWS CloudWatchメトリクスのログメトリクス)     |           ✅           |             -              |           ✅           |            -             |              -              |
| レポートの作成                  | ✅<br>(AWS CloudWatch Contributor Insights) |           -           |             -              |           -           |            -             |              -              |
| ⬇︎                       |                     ⬇︎                     |          ⬇︎           |             ⬇︎             |          ⬇︎           |            ⬇︎            |             ⬇︎              |
| アラートの作成                  |         ✅<br>(AWS CloudWatchアラーム)          |           -           |             -              |           -           |            -             |              -              |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

| アクション                    |              例1               |      例2      |          例3          |
|--------------------------|:-----------------------------:|:------------:|:--------------------:|
| 実行ログの作成   |               -               |      -       |          -           |
| アクセスログの作成 |               -               |      -      |          -          |
| ⬇︎                       |              ⬇︎               |      ⬇︎      |          ⬇︎          |
| ログの収集<br>(いずれもプッシュ型)     |     Fluentd<br>Fluentbit      |   Promtail   | Fluentd<br>Fluentbit |
| ⬇︎                       |              ⬇︎               |      ⬇︎      |          ⬇︎          |
| 監視バックエンドとして可視化           | AWS CloudWatchメトリクスによるログメトリクス |   Grafana    |       Datadog        |
| ビルトインローカルストレージへの保管       |       AWS CloudWatchログ        | Grafana loki |       Datadog        |
| 分析                       |     AWS CloudWatchログインサイト     | Grafana loki |       Datadog        |
| レポートの作成                  |               -               |      -       |       Datadog        |
| ⬇︎                       |              ⬇︎               |      ⬇︎      |          ⬇︎          |
| アラートの作成                  |      AWS CloudWatchアラーム       |  Prometheus  |       Datadog        |

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

いずれもプッシュ型で、分散トレース収集のためのエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション                           |         AWS X-Ray         |            Datadog             | Grafana Tempo |              Istio<br>(連携なしの状態)              |              Jaeger              |         OpenTelemetry          |          Zipkin          |
| ------------------------------------ | :-----------------------: | :----------------------------: | :-----------: | :-------------------------------: | :----------------------------: | :----------------------: | :----------------------: |
| トレースIDとスパンIDの作成             |  ✅<br>(x-rayパッケージ)  | ✅<br>(クライアントパッケージ) |       -       | ✅<br>(Envoyによる各種IDの作成) |    ✅<br>(jaegerエージェント)     | ✅<br>(クライアントパッケージ) |            -             |
| ⬇︎                       | ⬇︎ |        ⬇︎        |          ⬇︎          |        ⬇︎        |            ⬇︎            |           ⬇︎           |
| 分散トレースの収集<br>(プッシュ型)   | ✅<br>(x-rayエージェント) |  ✅<br>(datadogエージェント)   |       -       |     -     |     ✅<br>(jaegerコレクター)      |     ✅<br>(OTelコレクター)     | ✅<br>(zipkinコレクター) |
| ⬇︎                                   |            ⬇︎             |               ⬇︎               |      ⬇︎       |                ⬇︎               |                ⬇︎                 |               ⬇︎               |            ⬇︎            |
| 監視バックエンドとして可視化 ()      |            ✅             |               ✅               |      ✅       |                -                |                ✅                 |               -                |            ✅            |
| ビルトインローカルストレージへの保管 |            ✅             |               ✅               |       -       | - | ✅<br> (Cassandra、Elasticsearch) |               -                |            -             |
| 分析                                 |            ✅             |               ✅               |      ✅       |                -                |                ✅                 |               -                |            ✅            |
| レポートの作成                       |             -             |               -                |       -       |                 -                 |                 -                 |               -                |            -             |
| ⬇︎                                   |            ⬇︎             |               ⬇︎               |      ⬇︎       |                ⬇︎               |                ⬇︎                 |               ⬇︎               |            ⬇︎            |
| アラートの作成                       |             -             |               -                |       -       |                 -                 |                 -                 |               -                |            -             |

> ↪️ 参考：
>
> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#022
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

<br>

### テレメトリー間の紐付け

テレメトリー間の紐付けツールを比較した。

トレースIDとスパンIDを付与したログ、スパンメトリクス、分散トレース、の間を紐付けられる。

`()`内では、そのツールでのセットアップ方法を表す。

| アクション                         |               AWS CloudWatch                | Datadog | Grafana |
| ---------------------------------- | :-----------------------------------------: | :-----: | :-----: |
| ログと分散トレース間の紐付け       |    ✅<br>(x-rayプラグインの有効化が必要)    |   ✅    |   ✅    |
| メトリクスと分散トレース間の紐付け | ✅<br>(一部の言語のx-rayパッケージのみ対応) |   ✅    |   ✅    |

> ↪️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#03
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#04
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_logintegration.html
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_segments.html

<br>
