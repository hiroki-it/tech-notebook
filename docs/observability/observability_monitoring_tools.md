---
title: 【IT技術の知見】監視ツール＠可観測性
description: 監視ツール＠可観測性の知見を記録しています。
---

# 監視ツール＠可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 監視ツールの比較

### メトリクスの場合

#### ▼ 種類

データポイント収集ツールを比較した。

プル型またはプッシュ型でメトリクスの元になるデータポイントを収集するツールに分類できる。

プッシュ型の場合、メトリクスを送信できるエージェントが必要である。

|                                                                    |        Amazon CloudWatch ベース        |     Datadog ベース     |      Istio ベース<br>連携しない状態      |        Istio ベース<br>ビルトイン Prometheus と連携した状態         |  OpenTelemetry ベース   |   Prometheus ベース    |
| :----------------------------------------------------------------: | :------------------------------------: | :--------------------: | :--------------------------------------: | :-----------------------------------------------------------------: | :---------------------: | :--------------------: |
|              メトリクスの元になるデータポイントの作成              |        cloudwatch エージェント         |  datadog エージェント  | Envoy によるリクエスト系メトリクスの作成 |              Envoy によるリクエスト系メトリクスの作成               | クライアントパッケージ  |        Exporter        |
|                                 ⬇️                                 |                   ⬇️                   |           ⬇️           |                    ⬇️                    |                                 ⬇️                                  |           ⬇️            |           ⬇️           |
| メトリクスの元になるデータポイントを収集<br>プル型またはプッシュ型 |        cloudwatch エージェント         |  datadog エージェント  |  Istiod コントロールプレーンによる収集   |                Istiod コントロールプレーンによる収集                | OpenTelemetry Collector |        Exporter        |
|                                 ⬇️                                 |                   ⬇️                   |           ⬇️           |                    ⬇️                    |                                 ⬇️                                  |           ⬇️            |           ⬇️           |
|     監視バックエンドによるビルトインローカルストレージへの保管     |       Amazon CloudWatch Metrics        | Datadog ダッシュボード |                    -                     | Istiod コントロールプレーンを経由した prometheus サーバーによる収集 |            -            |  prometheus サーバー   |
|                                 ⬇️                                 |                   ⬇️                   |           ⬇️           |                    ⬇️                    |                                 ⬇️                                  |           ⬇️            |           ⬇️           |
|                   監視フロントエンドによる可視化                   |       Amazon CloudWatch Metrics        | Datadog ダッシュボード |                    -                     |                       Grafana ダッシュボード                        |            -            | Grafana ダッシュボード |
|                                 ⬇️                                 |                   ⬇️                   |           ⬇️           |                    ⬇️                    |                                 ⬇️                                  |           ⬇️            |           ⬇️           |
|                        分析とレポートの作成                        | Amazon CloudWatch Contributor Insights | Datadog ダッシュボード |                    -                     |                                  -                                  |            -            |           -            |
|                                 ⬇️                                 |                   ⬇️                   |           ⬇️           |                    ⬇️                    |                                 ⬇️                                  |           ⬇️            |           ⬇️           |
|                           アラートの作成                           |       Amazon CloudWatch アラーム       | Datadog ダッシュボード |                    -                     |                         prometheus サーバー                         |            -            |  prometheus サーバー   |

> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

|                                                                      |    Amazon CloudWatch ベース    |     Datadog ベース     |                        Istio ベース                        |   Prometheus ベース    |
| -------------------------------------------------------------------- | :----------------------------: | :--------------------: | :--------------------------------------------------------: | :--------------------: |
| メトリクスの元になるデータポイントの作成                             | Amazon CloudWatch エージェント |  datadog エージェント  | Exporter<br>+ <br>Envoy によるリクエスト系メトリクスの作成 |        Exporter        |
| ⬇️                                                                   |               ⬇️               |           ⬇️           |                             ⬇️                             |           ⬇️           |
| メトリクスの元になるデータポイントを収集<br>(プル型またはプッシュ型) | Amazon CloudWatch エージェント |  datadog エージェント  |  Exporter<br>+ <br>Istiod コントロールプレーンによる収集   |        Exporter        |
| ⬇️                                                                   |               ⬇️               |           ⬇️           |                             ⬇️                             |           ⬇️           |
| 監視バックエンドによるビルトインローカルストレージへの保管           |   Amazon CloudWatch Metrics    | Datadog ダッシュボード |                    prometheus サーバー                     |  prometheus サーバー   |
| ⬇️                                                                   |               ⬇️               |           ⬇️           |                             ⬇️                             |           ⬇️           |
| 監視フロントエンドによる可視化                                       |   Amazon CloudWatch Metrics    | Datadog ダッシュボード |                   Grafana ダッシュボード                   | Grafana ダッシュボード |
| ⬇️                                                                   |               ⬇️               |           ⬇️           |                             ⬇️                             |           ⬇️           |
| 分析とレポートの作成                                                 |   Amazon CloudWatch Metrics    | Datadog ダッシュボード |                             -                              |           -            |
| ⬇️                                                                   |               ⬇️               |           ⬇️           |                             ⬇️                             |           ⬇️           |
| アラートの作成                                                       |   Amazon CloudWatch アラーム   | Datadog ダッシュボード |                    prometheus サーバー                     |  prometheus サーバー   |

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

いずれもプッシュ型でログを収集し、ログを監視バックエンドに送信できるエージェントが必要である。

|                                                            |         Amazon CloudWatch ベース         |     Elasticsearch ベース     | Fluentd／Fluentbit<br>ベース | Grafana Loki ベース | Istio ベース<br>(連携しない状態) | Istio ベース<br>(ビルトイン OpenTelemetry と連携した状態) |   OpenTelemetry ベース    |
| ---------------------------------------------------------- | :--------------------------------------: | :--------------------------: | :--------------------------: | :-----------------: | :------------------------------: | :-------------------------------------------------------: | :-----------------------: |
| 実行ログの作成                                             |                    -                     |              -               |              -               |          -          |                -                 |                             -                             |             -             |
| アクセスログの作成                                         |                    -                     |              -               |              -               |          -          |  (Envoy によるアクセスログ作成)  |              (Envoy によるアクセスログ作成)               |             -             |
| ⬇️                                                         |                    ⬇️                    |              ⬇️              |              ⬇️              |         ⬇️          |                ⬇️                |                            ⬇️                             |            ⬇️             |
| ログの収集<br>(いずれもプッシュ型による送信方式)           |        (cloudwatch エージェント)         |          (Logstach)          |      Fluentd／Fluentbit      |   (Grafana Alloy)   |                -                 |       (Envoy から OpenTelemetry Collector への送信)       | (OpenTelemetry Collector) |
| ⬇️                                                         |                    ⬇️                    |              ⬇️              |              ⬇️              |         ⬇️          |                ⬇️                |                            ⬇️                             |            ⬇️             |
| 監視バックエンドによるビルトインローカルストレージへの保管 |         (Amazon CloudWatch Logs)         |              -               |              -               |      (BoltDB)       |                -                 |                             -                             |             -             |
| ⬇️                                                         |                    ⬇️                    |              ⬇️              |              ⬇️              |         ⬇️          |                ⬇️                |                             -                             |            ⬇️             |
| 監視フロントエンドによる可視化                             | (Amazon CloudWatch Logs ダッシュボード)  | Elasticsearch ダッシュボード |              -               |          -          |                -                 |                             -                             |             -             |
| ⬇️                                                         |                    ⬇️                    |              ⬇️              |              ⬇️              |
| 分析とレポートの作成                                       | (Amazon CloudWatch Contributor Insights) |              -               |              -               |          -          |                -                 |                             -                             |             -             |
| ⬇️                                                         |                    ⬇️                    |              ⬇️              |              ⬇️              |         ⬇️          |                ⬇️                |                            ⬇️                             |            ⬇️             |
| アラートの作成                                             |       (Amazon CloudWatch アラーム)       |              -               |              -               |          -          |                -                 |                             -                             |             -             |

> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

|                                                            |       Amazon CloudWatch ベース        |     Datadog ベース     |                       Istio ベース                       |   Prometheus ベース    |
| ---------------------------------------------------------- | :-----------------------------------: | :--------------------: | :------------------------------------------------------: | :--------------------: |
| 実行ログの作成                                             |                   -                   |           -            |                            -                             |           -            |
| アクセスログの作成                                         |                   -                   |           -            |               Envoy によるアクセスログ作成               |           -            |
| ⬇️                                                         |                  ⬇️                   |           ⬇️           |                            ⬇️                            |           ⬇️           |
| ログの収集<br>(いずれもプッシュ型による送信方式)           |         Fluentd<br>Fluentbit          |  Fluentd<br>Fluentbit  | Fluentd<br>Fluentbit<br>(OpenTelemetry Collector でも可) |     Grafana Alloy      |
| ⬇️                                                         |                  ⬇️                   |           ⬇️           |                            ⬇️                            |           ⬇️           |
| 監視バックエンドによるビルトインローカルストレージへの保管 |        Amazon CloudWatch Logs         | Datadog ダッシュボード |                       Grafana Loki                       |      Grafana Loki      |
| ⬇️                                                         |                  ⬇️                   |           ⬇️           |                            ⬇️                            |           ⬇️           |
| 監視フロントエンドによる可視化                             | Amazon CloudWatch Logs ダッシュボード | Datadog ダッシュボード |                  Grafana ダッシュボード                  | Grafana ダッシュボード |
| ⬇️                                                         |                  ⬇️                   |           ⬇️           |                            ⬇️                            |
| 分析とレポートの作成                                       |   Amazon CloudWatch Logs インサイト   | Datadog ダッシュボード |                  Grafana ダッシュボード                  | Grafana ダッシュボード |
| ⬇️                                                         |                  ⬇️                   |           ⬇️           |                            ⬇️                            |           ⬇️           |
| アラートの作成                                             |      Amazon CloudWatch アラーム       | Datadog ダッシュボード |                   prometheus サーバー                    |  prometheus サーバー   |

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

いずれもプッシュ型で分散トレースを収集し、分散トレースを監視バックエンドに送信できるエージェントが必要である。

|                                                            |          AWS X-Ray           |            Datadog             |  Istio<br>連携しない状態   |       Istio<br>ビルトイン Jaeger と連携した状態       |             Jaeger              |        OpenTelemetry        |      Zipkin      |
| ---------------------------------------------------------- | :--------------------------: | :----------------------------: | :------------------------: | :---------------------------------------------------: | :-----------------------------: | :-------------------------: | :--------------: |
| トレース ID とスパン ID の作成                             | x-ray クライアントパッケージ | datadog クライアントパッケージ | Envoy による各種 ID の作成 |              Envoy による各種 ID の作成               |       jaeger エージェント       | otel クライアントパッケージ |        -         |
| 各種 ID のアプリ間の伝播                                   |              -               |               -                |             -              |                           -                           |                -                |              -              |        -         |
| ⬇️                                                         |              ⬇️              |               ⬇️               |             ⬇️             |                          ⬇️                           |               ⬇️                |             ⬇️              |        ⬇️        |
| 分散トレースの収集<br>いずれもプッシュ型による送信方式     |      x-ray エージェント      |      datadog エージェント      |             -              |         Envoy から Jaeger Collector への送信          |        Jaeger Collector         |   OpenTelemetry Collector   | zipkin collector |
| ⬇️                                                         |              ⬇️              |               ⬇️               |             ⬇️             |                          ⬇️                           |               ⬇️                |             ⬇️              |        ⬇️        |
| 監視バックエンドによるビルトインローカルストレージへの保管 |   AWS X-Ray ダッシュボード   |     Datadog ダッシュボード     |             -              | Jaeger のビルトインの Apache Cassandra、Elasticsearch | Apache Cassandra、Elasticsearch |              -              |        -         |
| ⬇️                                                         |              ⬇️              |               ⬇️               |             ⬇️             |                          ⬇️                           |               ⬇️                |             ⬇️              |        ⬇️        |
| 監視フロントエンドによる可視化                             |   AWS X-Ray ダッシュボード   |     Datadog ダッシュボード     |   Grafana ダッシュボード   |                          ✅                           |               ✅                |              -              |        ✅        |
| ⬇️                                                         |              ⬇️              |               ⬇️               |
| 分析とレポートの作成                                       |              -               |               -                |             -              |                           -                           |                -                |              -              |        -         |
| ⬇️                                                         |              ⬇️              |               ⬇️               |             ⬇️             |                          ⬇️                           |               ⬇️                |             ⬇️              |        ⬇️        |
| アラートの作成                                             |              -               |               -                |             -              |                           -                           |                -                |              -              |        -         |

> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#022
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

|                                                            |     Datadog ベース     |                     Istio ベース                      |       OpenTelemetry ベース       |
| ---------------------------------------------------------- | :--------------------: | :---------------------------------------------------: | :------------------------------: |
| トレース ID とスパン ID の作成                             | クライアントパッケージ |              Envoy による各種 ID の作成               |      クライアントパッケージ      |
| 各種 ID のアプリ間の伝播                                   |           -            |                           -                           |                -                 |
| ⬇️                                                         |           ⬇️           |                          ⬇️                           |                ⬇️                |
| 分散トレースの収集<br>(いずれもプッシュ型による送信方式)   |  datadog エージェント  |         Envoy から Jaeger Collector への送信          | OpenTelemetry Collector への送信 |
| ⬇️                                                         |           ⬇️           |                          ⬇️                           |                ⬇️                |
| 監視バックエンドによるビルトインローカルストレージへの保管 | Datadog ダッシュボード | Jaeger のビルトインの Apache Cassandra、Elasticsearch |                -                 |
| ⬇️                                                         |           ⬇️           |                          ⬇️                           |                ⬇️                |
| 監視フロントエンドによる可視化                             | Datadog ダッシュボード |                        Jaeger                         |          Grafana Tempo           |
| ⬇️                                                         |           ⬇️           |                          ⬇️                           |                ⬇️                |
| 分析とレポートの作成                                       | Datadog ダッシュボード |                        Jaeger                         |          Grafana Tempo           |
| ⬇️                                                         |           ⬇️           |                          ⬇️                           |                ⬇️                |
| アラートの作成                                             |           -            |                           -                           |                -                 |

<br>

### テレメトリー間の紐付け

テレメトリー間の紐付けツールを比較した。

トレース ID とスパン ID を付与したログ、スパンメトリクス、分散トレースの間を紐付けられる。

各種ツールで、テレメトリーを保管しておく場所 (データソース) に制限がある。

| アクション                         |                  Amazon CloudWatch                  |          Datadog          |              Grafana               |
| ---------------------------------- | :-------------------------------------------------: | :-----------------------: | :--------------------------------: |
| ログと分散トレース間の紐付け       |      (ログは Amazon CloudWatch Logs に要保管)       | (ログは Datadog に要保管) | (ログの保管ツールの種類に制限あり) |
| メトリクスと分散トレース間の紐付け | (一部の言語の x-ray クライアントパッケージのみ対応) | (ログは Datadog に要保管) | (ログの保管ツールの種類に制限あり) |

> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#03
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#04
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_logintegration.html
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_segments.html

<br>

## 02. テレメトリーを利用したデバッグ

### 前提

マイクロサービスシステムで、RED メトリクスに問題があったとする。

ここでいう RED メトリクスとは、Rate (秒当たりのリクエスト数)、Errors (リクエストの失敗数)、Duration (レイテンシー)のことである。

このとき、可観測性を使用してデバッグしていく。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#01

<br>

### 原因の場所の切り分け

#### `(1)` メッシュトポロジー

メッシュトポロジー (例：Kiali) を使用して、いずれのマイクロサービス間の通信がボトルネックになっているのかを見つける。

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#021

#### `(2)` メトリクス

メトリクス (例：Prometheus と Grafana) を使用して、いずれのコンポーネント (例：Node、Deployment、Pod、コンテナ) がボトルネックになっているのかを見つける。

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

#### `(7)` Pod のハードウェアリソース不足

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#061

#### `(8)` Node のハードウェアリソース不足

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#062

#### `(9)` ミドルウェア/アプリケーションのロジックの問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#063

#### `(10)` Node の障害

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#064

#### `(11)` Resource Quota の問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#065

#### `(12)` Eviction の発生 (Pod の予期せぬ退避)

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#066

#### `(13)` コンテナイメージの Pull エラー

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#067

#### `(14)` Liveness Probe の失敗

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#068

#### `(15)` ミドルウェア/アプリケーションに関するその他の問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#069

<br>
