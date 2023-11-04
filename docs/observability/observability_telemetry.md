---
title: 【IT技術の知見】テレメトリー収集ツール＠可観測性
description: テレメトリー収集ツール＠可観測性の知見を記録しています。
---

# テレメトリー収集ツール＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. テレメトリー収集ツールの比較

### メトリクスの場合

#### ▼ 種類

メトリクス収集ツールを比較した。

プル型またはプッシュ型でメトリクスのデータポイントを収集するツールに分類できる。

プッシュ型の場合、メトリクスを送信できるエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

|                          アクション                          |               AWS CloudWatch                |           Datadog           |            Istio<br>(連携しない状態)            |             Istio<br>(ビルトインPrometheusと連携した状態)              |         OpenTelemetry          |         Prometheus         |
| :----------------------------------------------------------: | :-----------------------------------------: | :-------------------------: | :---------------------------------------------: | :--------------------------------------------------------------------: | :----------------------------: | :------------------------: |
|               メトリクスのデータポイントの作成               |       ✅<br>(cloudwatchエージェント)        | ✅<br>(datadogエージェント) | ✅<br>(Envoyによるリクエスト系メトリクスの作成) |            ✅<br>(Envoyによるリクエスト系メトリクスの作成)             | ✅<br>(クライアントパッケージ) |      ✅<br>(Exporter)      |
|                             ⬇︎                              |                     ⬇︎                     |             ⬇︎             |                       ⬇︎                       |                                  ⬇︎                                   |              ⬇︎               |            ⬇︎             |
| メトリクスのデータポイントを収集<br>(プル型またはプッシュ型) |       ✅<br>(cloudwatchエージェント)        | ✅<br>(datadogエージェント) |  ✅<br>(Istiodコントロールプレーンによる収集)   |              ✅<br>(Istiodコントロールプレーンによる収集)              |     ✅<br>(otelコレクター)     |      ✅<br>(Exporter)      |
|                             ⬇︎                              |                     ⬇︎                     |             ⬇︎             |                       ⬇︎                       |                                  ⬇︎                                   |              ⬇︎               |            ⬇︎             |
|             ビルトインローカルストレージへの保管             |      ✅<br>(AWS CloudWatchメトリクス)       |             ✅              |                        -                        |                                   -                                    |               -                |             -              |
|                             ⬇︎                              |                     ⬇︎                     |             ⬇︎             |                       ⬇︎                       |                                  ⬇︎                                   |              ⬇︎               |            ⬇︎             |
|                 監視バックエンドとして可視化                 |      ✅<br>(AWS CloudWatchメトリクス)       |             ✅              |                        -                        | ✅<br>(Istiodコントロールプレーンを介したprometheusサーバーによる収集) |               -                | ✅<br>(prometheusサーバー) |
|                             分析                             |      ✅<br>(AWS CloudWatchメトリクス)       |             ✅              |                        -                        |                                   -                                    |               -                |             -              |
|                        レポートの作成                        | ✅<br>(AWS CloudWatch Contributor Insights) |             ✅              |                        -                        |                                   -                                    |               -                |             -              |
|                             ⬇︎                              |                     ⬇︎                     |             ⬇︎             |                       ⬇︎                       |                                  ⬇︎                                   |              ⬇︎               |            ⬇︎             |
|                        アラートの作成                        |       ✅<br>(AWS CloudWatchアラーム)        |             ✅              |                        -                        |                       ✅<br>(prometheusサーバー)                       |               -                | ✅<br>(prometheusサーバー) |

> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

| アクション                                                   |    AWS CloudWatchベース    |    Datadogベース    |                        Istioベース                        |  Prometheusベース  |
| ------------------------------------------------------------ | :------------------------: | :-----------------: | :-------------------------------------------------------: | :----------------: |
| メトリクスのデータポイントの作成                             | AWS CloudWatchエージェント | datadogエージェント | Exporter<br>+ <br>Envoyによるリクエスト系メトリクスの作成 |      Exporter      |
| ⬇︎                                                          |            ⬇︎             |         ⬇︎         |                            ⬇︎                            |        ⬇︎         |
| メトリクスのデータポイントを収集<br>(プル型またはプッシュ型) | AWS CloudWatchエージェント | datadogエージェント |  Exporter<br>+ <br>Istiodコントロールプレーンによる収集   |      Exporter      |
| ⬇︎                                                          |            ⬇︎             |         ⬇︎         |                            ⬇︎                            |        ⬇︎         |
| ビルトインローカルストレージへの保管                         |  AWS CloudWatchメトリクス  |       Datadog       |                             -                             |         -          |
| ⬇︎                                                          |            ⬇︎             |         ⬇︎         |                            ⬇︎                            |        ⬇︎         |
| 監視バックエンドとして可視化                                 |  AWS CloudWatchメトリクス  |       Datadog       |                    prometheusサーバー                     | prometheusサーバー |
| 分析                                                         |  AWS CloudWatchメトリクス  |       Datadog       |                             -                             |         -          |
| レポートの作成                                               |             -              |       Datadog       |                             -                             |         -          |
| ⬇︎                                                          |            ⬇︎             |         ⬇︎         |                            ⬇︎                            |        ⬇︎         |
| アラートの作成                                               |   AWS CloudWatchアラーム   |       Datadog       |                    prometheusサーバー                     | prometheusサーバー |

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

いずれもプッシュ型でログを収集し、ログを監視バックエンドに送信できるエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション                                       |                  AWS CloudWatch                  |  Elasticsearch   | Fluentd<br>Fluentbit |   Grafana Loki   |      Istio<br>(連携しない状態)      | Istio<br>(ビルトインOpenTelemetryと連携した状態) |     OpenTelemetry      |
| ------------------------------------------------ | :----------------------------------------------: | :--------------: | :------------------: | :--------------: | :---------------------------------: | :----------------------------------------------: | :--------------------: |
| 実行ログの作成                                   |                        -                         |        -         |          -           |        -         |                  -                  |                        -                         |           -            |
| アクセスログの作成                               |                        -                         |        -         |          -           |        -         | ✅<br>(Envoyによるアクセスログ作成) |       ✅<br>(Envoyによるアクセスログ作成)        |           -            |
| ⬇︎                                              |                       ⬇︎                        |       ⬇︎        |         ⬇︎          |       ⬇︎        |                 ⬇︎                 |                       ⬇︎                        |          ⬇︎           |
| ログの収集<br>(いずれもプッシュ型による送信方式) |          ✅<br>(cloudwatchエージェント)          | ✅<br>(Logstach) |          ✅          | ✅<br>(Promtail) |                  -                  |     ✅<br>(Envoyからotelコレクターへの送信)      | ✅<br>(otelコレクター) |
| ⬇︎                                              |                       ⬇︎                        |       ⬇︎        |         ⬇︎          |       ⬇︎        |                 ⬇︎                 |                       ⬇︎                        |          ⬇︎           |
| ビルトインローカルストレージへの保管             |            ✅<br>(AWS CloudWatchログ)            |        -         |          -           |  ✅<br>(BoltDB)  |                  -                  |                        -                         |           -            |
| ⬇︎                                              |                       ⬇︎                        |       ⬇︎        |         ⬇︎          |       ⬇︎        |                 ⬇︎                 |                        -                         |          ⬇︎           |
| 監視バックエンドとして可視化                     |            ✅<br>(AWS CloudWatchログ)            |        ✅        |          -           |        -         |                  -                  |                        -                         |           -            |
| 分析                                             | ✅<br>(AWS CloudWatchメトリクスのログメトリクス) |        ✅        |          -           |        -         |                  -                  |                        -                         |           -            |
| レポートの作成                                   |   ✅<br>(AWS CloudWatch Contributor Insights)    |        -         |          -           |        -         |                  -                  |                        -                         |           -            |
| ⬇︎                                              |                       ⬇︎                        |       ⬇︎        |         ⬇︎          |       ⬇︎        |                 ⬇︎                 |                       ⬇︎                        |          ⬇︎           |
| アラートの作成                                   |          ✅<br>(AWS CloudWatchアラーム)          |        -         |          -           |        -         |                  -                  |                        -                         |           -            |

> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

| アクション                                       |     AWS CloudWatchベース     |    Datadogベース     |                  Istioベース                   |  Prometheusベース  |
| ------------------------------------------------ | :--------------------------: | :------------------: | :--------------------------------------------: | :----------------: |
| 実行ログの作成                                   |              -               |          -           |                       -                        |         -          |
| アクセスログの作成                               |              -               |          -           |          Envoyによるアクセスログ作成           |         -          |
| ⬇︎                                              |             ⬇︎              |         ⬇︎          |                      ⬇︎                       |        ⬇︎         |
| ログの収集<br>(いずれもプッシュ型による送信方式) |     Fluentd<br>Fluentbit     | Fluentd<br>Fluentbit | Fluentd<br>Fluentbit<br>(otelコレクターでも可) |      Promtail      |
| ⬇︎                                              |             ⬇︎              |         ⬇︎          |                      ⬇︎                       |        ⬇︎         |
| ビルトインローカルストレージへの保管             |      AWS CloudWatchログ      |       Datadog        |                  Grafana Loki                  |    Grafana Loki    |
| ⬇︎                                              |             ⬇︎              |         ⬇︎          |                      ⬇︎                       |        ⬇︎         |
| 監視バックエンドとして可視化                     |      AWS CloudWatchログ      |       Datadog        |                    Grafana                     |      Grafana       |
| 分析                                             | AWS CloudWatchログインサイト |       Datadog        |                    Grafana                     |      Grafana       |
| レポートの作成                                   |              -               |       Datadog        |                       -                        |         -          |
| ⬇︎                                              |             ⬇︎              |         ⬇︎          |                      ⬇︎                       |        ⬇︎         |
| アラートの作成                                   |    AWS CloudWatchアラーム    |       Datadog        |               prometheusサーバー               | prometheusサーバー |

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

いずれもプッシュ型で分散トレースを収集し、分散トレースを監視バックエンドに送信できるエージェントが必要である。

`()`内では、各ツールのコンポーネント名を表す。

| アクション                                               |              AWS X-Ray              |                Datadog                | Grafana Tempo |    Istio<br>(連携しない状態)    |      Istio<br>(ビルトインJaegerと連携した状態)       |              Jaeger              |           OpenTelemetry            |          Zipkin          |
| -------------------------------------------------------- | :---------------------------------: | :-----------------------------------: | :-----------: | :-----------------------------: | :--------------------------------------------------: | :------------------------------: | :--------------------------------: | :----------------------: |
| トレースIDとスパンIDの作成                               | ✅<br>(x-rayクライアントパッケージ) | ✅<br>(datadogクライアントパッケージ) |       -       | ✅<br>(Envoyによる各種IDの作成) |           ✅<br>(Envoyによる各種IDの作成)            |    ✅<br>(jaegerエージェント)    | ✅<br>(otelクライアントパッケージ) |            -             |
| 各種IDのアプリ間の伝播                                   |                  -                  |                   -                   |       -       |                -                |                          -                           |                -                 |                 -                  |            -             |
| ⬇︎                                                      |                 ⬇︎                 |                  ⬇︎                  |      ⬇︎      |               ⬇︎               |                         ⬇︎                          |               ⬇︎                |                ⬇︎                 |           ⬇︎            |
| 分散トレースの収集<br>(いずれもプッシュ型による送信方式) |      ✅<br>(x-rayエージェント)      |      ✅<br>(datadogエージェント)      |       -       |                -                |      ✅<br>(Envoyからjaegerコレクターへの送信)       |     ✅<br>(jaegerコレクター)     |       ✅<br>(otelコレクター)       | ✅<br>(zipkinコレクター) |
| ⬇︎                                                      |                 ⬇︎                 |                  ⬇︎                  |      ⬇︎      |               ⬇︎               |                         ⬇︎                          |               ⬇︎                |                ⬇︎                 |           ⬇︎            |
| ビルトインローカルストレージへの保管                     |                 ✅                  |                  ✅                   |       -       |                -                | ✅<br>(JaegerのビルトインのCassandra、Elasticsearch) | ✅<br>(Cassandra、Elasticsearch) |                 -                  |            -             |
| ⬇︎                                                      |                 ⬇︎                 |                  ⬇︎                  |      ⬇︎      |               ⬇︎               |                         ⬇︎                          |               ⬇︎                |                ⬇︎                 |           ⬇︎            |
| 監視バックエンドとして可視化                             |                 ✅                  |                  ✅                   |      ✅       |                -                |                          ✅                          |                ✅                |                 -                  |            ✅            |
| 分析                                                     |                 ✅                  |                  ✅                   |      ✅       |                -                |                          ✅                          |                ✅                |                 -                  |            ✅            |
| レポートの作成                                           |                  -                  |                   -                   |       -       |                -                |                          -                           |                -                 |                 -                  |            -             |
| ⬇︎                                                      |                 ⬇︎                 |                  ⬇︎                  |      ⬇︎      |               ⬇︎               |                         ⬇︎                          |               ⬇︎                |                ⬇︎                 |           ⬇︎            |
| アラートの作成                                           |                  -                  |                   -                   |       -       |                -                |                          -                           |                -                 |                 -                  |            -             |

> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#022
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

| アクション                                               |     Datadogベース      |                 Istioベース                  |
| -------------------------------------------------------- | :--------------------: | :------------------------------------------: |
| トレースIDとスパンIDの作成                               | クライアントパッケージ |           Envoyによる各種IDの作成            |
| 各種IDのアプリ間の伝播                                   |           -            |                      -                       |
| ⬇︎                                                      |          ⬇︎           |                     ⬇︎                      |
| 分散トレースの収集<br>(いずれもプッシュ型による送信方式) |  datadogエージェント   |      Envoyからjaegerコレクターへの送信       |
| ⬇︎                                                      |          ⬇︎           |                     ⬇︎                      |
| ビルトインローカルストレージへの保管                     |        Datadog         | JaegerのビルトインのCassandra、Elasticsearch |
| ⬇︎                                                      |          ⬇︎           |                     ⬇︎                      |
| 監視バックエンドとして可視化                             |        Datadog         |                    Jaeger                    |
| 分析                                                     |        Datadog         |                    Jaeger                    |
| レポートの作成                                           |           -            |                      -                       |
| ⬇︎                                                      |          ⬇︎           |                     ⬇︎                      |
| アラートの作成                                           |           -            |                      -                       |

<br>

### テレメトリー間の紐付け

テレメトリー間の紐付けツールを比較した。

トレースIDとスパンIDを付与したログ、スパンメトリクス、分散トレース、の間を紐付けられる。

各種ツールで、テレメトリーを保管しておく場所 (データソース) に制限がある。

| アクション                         |                     AWS CloudWatch                      |            Datadog            |                 Grafana                  |
| ---------------------------------- | :-----------------------------------------------------: | :---------------------------: | :--------------------------------------: |
| ログと分散トレース間の紐付け       |        ✅<br>(ログはAWS CloudWatchログに要保管)         | ✅<br>(ログはDatadogに要保管) | ✅<br>(ログの保管ツールの種類に制限あり) |
| メトリクスと分散トレース間の紐付け | ✅<br>(一部の言語のx-rayクライアントパッケージのみ対応) | ✅<br>(ログはDatadogに要保管) | ✅<br>(ログの保管ツールの種類に制限あり) |

> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#03
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#04
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_logintegration.html
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_segments.html

<br>

## 02. テレメトリーを利用したデバッグ

### 前提

マイクロサービスなシステムにおいて、REDメトリクスに問題があったとする。

ここでいうREDメトリクスとは、Rate (秒あたりのリクエスト数)、Errors (リクエストの失敗数)、Duration (レイテンシー)、のことである。

この時、可観測性を使用してデバッグしていく。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#01

<br>

### 原因の場所の切り分け

#### `(1)` メッシュトポロジー

メッシュトポロジー (例：Kiali) を使用して、いずれのマイクロサービス間の通信がボトルネックになっているのかを見つける。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#021

#### `(2)` メトリクス

メトリクス (例：PrometheusとGrafana) を使用して、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

コンポーネント単位でフィルタリングできるようなメトリクスダッシュボードがあると、原因を特定しやすい。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#022

#### `(3)` ログ

ログ (例：Fluentd) を使用して、いずれのマイクロサービスがボトルネックになっているのかを見つける。

ログにレスポンスタイムやエラーメッセージを出力していると、原因を特定しやすい。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#023

<br>

### 原因の種類の切り分け

#### `(4)` ハードウェアリソース系メトリクス

ハードウェアリソース系のメトリクスから、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

ハードウェアリソース系のメトリクスを監視できるようなメトリクスダッシュボードがあると、原因を特定しやすい。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#042

#### `(5)` 状態系メトリクス

ステータス系のメトリクスから、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#043

#### `(6)` ネットワーク系メトリクス

ネットワーク系のメトリクスから、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

<br>

### 原因の特定

#### `(7)` Podのハードウェアリソース不足

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#061

#### `(8)` Nodeのハードウェアリソース不足

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#062

#### `(9)` ミドルウェア/アプリのロジックの問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#063

#### `(10)` Nodeの障害

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#064

#### `(11)` Resource Quotaの問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#065

#### `(12)` Evictionの発生 (Podの予期せぬ退避)

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#066

#### `(13)` コンテナイメージのPullエラー

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#067

#### `(14)` Liveness Probeの失敗

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#068

#### `(15)` ミドルウェア/アプリのその他の問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#069

<br>
