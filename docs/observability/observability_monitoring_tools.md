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

メトリクス収集ツールを比較した。

プル型またはプッシュ型でメトリクスの元になるデータポイントを収集するツールに分類できる。

プッシュ型の場合、メトリクスを送信できるエージェントが必要である。

|                                                                    |        AWS CloudWatchベース         |     Datadogベース     |      Istioベース<br>連携しない状態      |        Istioベース<br>ビルトインPrometheusと連携した状態         |   OpenTelemetryベース   |   Prometheusベース    |
| :----------------------------------------------------------------: | :---------------------------------: | :-------------------: | :-------------------------------------: | :--------------------------------------------------------------: | :---------------------: | :-------------------: |
|              メトリクスの元になるデータポイントの作成              |       cloudwatchエージェント        |  datadogエージェント  | Envoyによるリクエスト系メトリクスの作成 |             Envoyによるリクエスト系メトリクスの作成              | クライアントパッケージ  |       Exporter        |
|                                 ⬇️                                 |                 ⬇️                  |          ⬇️           |                   ⬇️                    |                                ⬇️                                |           ⬇️            |          ⬇️           |
| メトリクスの元になるデータポイントを収集<br>プル型またはプッシュ型 |       cloudwatchエージェント        |  datadogエージェント  |  Istiodコントロールプレーンによる収集   |               Istiodコントロールプレーンによる収集               | OpenTelemetry Collector |       Exporter        |
|                                 ⬇️                                 |                 ⬇️                  |          ⬇️           |                   ⬇️                    |                                ⬇️                                |           ⬇️            |          ⬇️           |
|     監視バックエンドによるビルトインローカルストレージへの保管     |       AWS CloudWatch Metrics        | Datadogダッシュボード |                    -                    | Istiodコントロールプレーンを経由したprometheusサーバーによる収集 |            -            |  prometheusサーバー   |
|                                 ⬇️                                 |                 ⬇️                  |          ⬇️           |                   ⬇️                    |                                ⬇️                                |           ⬇️            |          ⬇️           |
|                   監視フロントエンドによる可視化                   |       AWS CloudWatch Metrics        | Datadogダッシュボード |                    -                    |                      Grafanaダッシュボード                       |            -            | Grafanaダッシュボード |
|                                 ⬇️                                 |                 ⬇️                  |          ⬇️           |                   ⬇️                    |                                ⬇️                                |           ⬇️            |          ⬇️           |
|                        分析とレポートの作成                        | AWS CloudWatch Contributor Insights | Datadogダッシュボード |                    -                    |                                -                                 |            -            |           -           |
|                                 ⬇️                                 |                 ⬇️                  |          ⬇️           |                   ⬇️                    |                                ⬇️                                |           ⬇️            |          ⬇️           |
|                           アラートの作成                           |       AWS CloudWatchアラーム        | Datadogダッシュボード |                    -                    |                        prometheusサーバー                        |            -            |  prometheusサーバー   |

> - https://landscape.cncf.io/card-mode?category=monitoring&grouping=category&sort=stars
> - https://speakerdeck.com/cybozuinsideout/monitoring-feat-victoriametrics?slide=6
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

|                                                                      |    AWS CloudWatchベース    |     Datadogベース     |                        Istioベース                        |   Prometheusベース    |
| -------------------------------------------------------------------- | :------------------------: | :-------------------: | :-------------------------------------------------------: | :-------------------: |
| メトリクスの元になるデータポイントの作成                             | AWS CloudWatchエージェント |  datadogエージェント  | Exporter<br>+ <br>Envoyによるリクエスト系メトリクスの作成 |       Exporter        |
| ⬇️                                                                   |             ⬇️             |          ⬇️           |                            ⬇️                             |          ⬇️           |
| メトリクスの元になるデータポイントを収集<br>(プル型またはプッシュ型) | AWS CloudWatchエージェント |  datadogエージェント  |  Exporter<br>+ <br>Istiodコントロールプレーンによる収集   |       Exporter        |
| ⬇️                                                                   |             ⬇️             |          ⬇️           |                            ⬇️                             |          ⬇️           |
| 監視バックエンドによるビルトインローカルストレージへの保管           |   AWS CloudWatch Metrics   | Datadogダッシュボード |                    prometheusサーバー                     |  prometheusサーバー   |
| ⬇️                                                                   |             ⬇️             |          ⬇️           |                            ⬇️                             |          ⬇️           |
| 監視フロントエンドによる可視化                                       |   AWS CloudWatch Metrics   | Datadogダッシュボード |                   Grafanaダッシュボード                   | Grafanaダッシュボード |
| ⬇️                                                                   |             ⬇️             |          ⬇️           |                            ⬇️                             |          ⬇️           |
| 分析とレポートの作成                                                 |   AWS CloudWatch Metrics   | Datadogダッシュボード |                             -                             |           -           |
| ⬇️                                                                   |             ⬇️             |          ⬇️           |                            ⬇️                             |          ⬇️           |
| アラートの作成                                                       |   AWS CloudWatchアラーム   | Datadogダッシュボード |                    prometheusサーバー                     |  prometheusサーバー   |

<br>

### ログの場合

#### ▼ 種類

ログ収集ツールを比較した。

いずれもプッシュ型でログを収集し、ログを監視バックエンドに送信できるエージェントが必要である。

|                                                            |         AWS CloudWatchベース          |     Elasticsearchベース     | Fluentd／Fluentbit<br>ベース | Grafana Lokiベース | Istioベース<br>(連携しない状態) | Istioベース<br>(ビルトインOpenTelemetryと連携した状態) |    OpenTelemetryベース    |
| ---------------------------------------------------------- | :-----------------------------------: | :-------------------------: | :--------------------------: | :----------------: | :-----------------------------: | :----------------------------------------------------: | :-----------------------: |
| 実行ログの作成                                             |                   -                   |              -              |              -               |         -          |                -                |                           -                            |             -             |
| アクセスログの作成                                         |                   -                   |              -              |              -               |         -          |  (Envoyによるアクセスログ作成)  |             (Envoyによるアクセスログ作成)              |             -             |
| ⬇️                                                         |                  ⬇️                   |             ⬇️              |              ⬇️              |         ⬇️         |               ⬇️                |                           ⬇️                           |            ⬇️             |
| ログの収集<br>(いずれもプッシュ型による送信方式)           |       (cloudwatchエージェント)        |         (Logstach)          |      Fluentd／Fluentbit      |  (Grafana Alloy)   |                -                |       (EnvoyからOpenTelemetry Collectorへの送信)       | (OpenTelemetry Collector) |
| ⬇️                                                         |                  ⬇️                   |             ⬇️              |              ⬇️              |         ⬇️         |               ⬇️                |                           ⬇️                           |            ⬇️             |
| 監視バックエンドによるビルトインローカルストレージへの保管 |         (AWS CloudWatch Logs)         |              -              |              -               |      (BoltDB)      |                -                |                           -                            |             -             |
| ⬇️                                                         |                  ⬇️                   |             ⬇️              |              ⬇️              |         ⬇️         |               ⬇️                |                           -                            |            ⬇️             |
| 監視フロントエンドによる可視化                             |  (AWS CloudWatch Logsダッシュボード)  | Elasticsearchダッシュボード |              -               |         -          |                -                |                           -                            |             -             |
| ⬇️                                                         |                  ⬇️                   |             ⬇️              |              ⬇️              |
| 分析とレポートの作成                                       | (AWS CloudWatch Contributor Insights) |              -              |              -               |         -          |                -                |                           -                            |             -             |
| ⬇️                                                         |                  ⬇️                   |             ⬇️              |              ⬇️              |         ⬇️         |               ⬇️                |                           ⬇️                           |            ⬇️             |
| アラートの作成                                             |       (AWS CloudWatchアラーム)        |              -              |              -               |         -          |                -                |                           -                            |             -             |

> - https://landscape.cncf.io/card-mode?category=logging&grouping=category&sort=stars
> - https://qiita.com/kazookie/items/eef3071a0667cb4d5136
> - https://www.reddit.com/r/kubernetes/comments/qv6qqx/comment/hkul7kb/?utm_source=share&utm_medium=web2x&context=3
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

|                                                            |       AWS CloudWatchベース        |     Datadogベース     |                       Istioベース                       |   Prometheusベース    |
| ---------------------------------------------------------- | :-------------------------------: | :-------------------: | :-----------------------------------------------------: | :-------------------: |
| 実行ログの作成                                             |                 -                 |           -           |                            -                            |           -           |
| アクセスログの作成                                         |                 -                 |           -           |               Envoyによるアクセスログ作成               |           -           |
| ⬇️                                                         |                ⬇️                 |          ⬇️           |                           ⬇️                            |          ⬇️           |
| ログの収集<br>(いずれもプッシュ型による送信方式)           |       Fluentd<br>Fluentbit        | Fluentd<br>Fluentbit  | Fluentd<br>Fluentbit<br>(OpenTelemetry Collectorでも可) |     Grafana Alloy     |
| ⬇️                                                         |                ⬇️                 |          ⬇️           |                           ⬇️                            |          ⬇️           |
| 監視バックエンドによるビルトインローカルストレージへの保管 |        AWS CloudWatch Logs        | Datadogダッシュボード |                      Grafana Loki                       |     Grafana Loki      |
| ⬇️                                                         |                ⬇️                 |          ⬇️           |                           ⬇️                            |          ⬇️           |
| 監視フロントエンドによる可視化                             | AWS CloudWatch Logsダッシュボード | Datadogダッシュボード |                  Grafanaダッシュボード                  | Grafanaダッシュボード |
| ⬇️                                                         |                ⬇️                 |          ⬇️           |                           ⬇️                            |
| 分析とレポートの作成                                       |   AWS CloudWatch Logsインサイト   | Datadogダッシュボード |                  Grafanaダッシュボード                  | Grafanaダッシュボード |
| ⬇️                                                         |                ⬇️                 |          ⬇️           |                           ⬇️                            |          ⬇️           |
| アラートの作成                                             |      AWS CloudWatchアラーム       | Datadogダッシュボード |                   prometheusサーバー                    |  prometheusサーバー   |

<br>

### 分散トレースの場合

#### ▼ 種類

分散トレース収集ツールを比較した。

いずれもプッシュ型で分散トレースを収集し、分散トレースを監視バックエンドに送信できるエージェントが必要である。

|                                                            |          AWS X-Ray          |            Datadog            | Istio<br>連携しない状態 |       Istio<br>ビルトインJaegerと連携した状態       |             Jaeger              |       OpenTelemetry        |      Zipkin      |
| ---------------------------------------------------------- | :-------------------------: | :---------------------------: | :---------------------: | :-------------------------------------------------: | :-----------------------------: | :------------------------: | :--------------: |
| トレースIDとスパンIDの作成                                 | x-rayクライアントパッケージ | datadogクライアントパッケージ | Envoyによる各種IDの作成 |               Envoyによる各種IDの作成               |       jaegerエージェント        | otelクライアントパッケージ |        -         |
| 各種IDのアプリ間の伝播                                     |              -              |               -               |            -            |                          -                          |                -                |             -              |        -         |
| ⬇️                                                         |             ⬇️              |              ⬇️               |           ⬇️            |                         ⬇️                          |               ⬇️                |             ⬇️             |        ⬇️        |
| 分散トレースの収集<br>いずれもプッシュ型による送信方式     |      x-rayエージェント      |      datadogエージェント      |            -            |          EnvoyからJaeger Collectorへの送信          |        Jaeger Collector         |  OpenTelemetry Collector   | zipkin collector |
| ⬇️                                                         |             ⬇️              |              ⬇️               |           ⬇️            |                         ⬇️                          |               ⬇️                |             ⬇️             |        ⬇️        |
| 監視バックエンドによるビルトインローカルストレージへの保管 |   AWS X-Rayダッシュボード   |     Datadogダッシュボード     |            -            | JaegerのビルトインのApache Cassandra、Elasticsearch | Apache Cassandra、Elasticsearch |             -              |        -         |
| ⬇️                                                         |             ⬇️              |              ⬇️               |           ⬇️            |                         ⬇️                          |               ⬇️                |             ⬇️             |        ⬇️        |
| 監視フロントエンドによる可視化                             |   AWS X-Rayダッシュボード   |     Datadogダッシュボード     |  Grafanaダッシュボード  |                         ✅                          |               ✅                |             -              |        ✅        |
| ⬇️                                                         |             ⬇️              |              ⬇️               |
| 分析とレポートの作成                                       |              -              |               -               |            -            |                          -                          |                -                |             -              |        -         |
| ⬇️                                                         |             ⬇️              |              ⬇️               |           ⬇️            |                         ⬇️                          |               ⬇️                |             ⬇️             |        ⬇️        |
| アラートの作成                                             |              -              |               -               |            -            |                          -                          |                -                |             -              |        -         |

> - https://landscape.cncf.io/card-mode?category=tracing&grouping=category&sort=stars
> - https://docs.openshift.com/container-platform/4.7/distr_tracing/distr_tracing_install/distr-tracing-deploying-otel.html#distr-tracing-config-otel-collector_deploying-distr-tracing-data-collection
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#022
> - https://speakerdeck.com/ido_kara_deru/constructing-and-operating-the-observability-platform-using-istio?slide=19

#### ▼ 組み合わせの例

|                                                            |     Datadogベース      |                     Istioベース                     |      OpenTelemetryベース       |
| ---------------------------------------------------------- | :--------------------: | :-------------------------------------------------: | :----------------------------: |
| トレースIDとスパンIDの作成                                 | クライアントパッケージ |               Envoyによる各種IDの作成               |     クライアントパッケージ     |
| 各種IDのアプリ間の伝播                                     |           -            |                          -                          |               -                |
| ⬇️                                                         |           ⬇️           |                         ⬇️                          |               ⬇️               |
| 分散トレースの収集<br>(いずれもプッシュ型による送信方式)   |  datadogエージェント   |          EnvoyからJaeger Collectorへの送信          | OpenTelemtry Collectorへの送信 |
| ⬇️                                                         |           ⬇️           |                         ⬇️                          |               ⬇️               |
| 監視バックエンドによるビルトインローカルストレージへの保管 | Datadogダッシュボード  | JaegerのビルトインのApache Cassandra、Elasticsearch |               -                |
| ⬇️                                                         |           ⬇️           |                         ⬇️                          |               ⬇️               |
| 監視フロントエンドによる可視化                             | Datadogダッシュボード  |                       Jaeger                        |         Grafana Tempo          |
| ⬇️                                                         |           ⬇️           |                         ⬇️                          |               ⬇️               |
| 分析とレポートの作成                                       | Datadogダッシュボード  |                       Jaeger                        |         Grafana Tempo          |
| ⬇️                                                         |           ⬇️           |                         ⬇️                          |               ⬇️               |
| アラートの作成                                             |           -            |                          -                          |               -                |

<br>

### テレメトリー間の紐付け

テレメトリー間の紐付けツールを比較した。

トレースIDとスパンIDを付与したログ、スパンメトリクス、分散トレースの間を紐付けられる。

各種ツールで、テレメトリーを保管しておく場所 (データソース) に制限がある。

| アクション                         |                  AWS CloudWatch                   |         Datadog         |              Grafana               |
| ---------------------------------- | :-----------------------------------------------: | :---------------------: | :--------------------------------: |
| ログと分散トレース間の紐付け       |        (ログはAWS CloudWatch Logsに要保管)        | (ログはDatadogに要保管) | (ログの保管ツールの種類に制限あり) |
| メトリクスと分散トレース間の紐付け | (一部の言語のx-rayクライアントパッケージのみ対応) | (ログはDatadogに要保管) | (ログの保管ツールの種類に制限あり) |

> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#03
> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html#04
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_logintegration.html
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/deploy_servicelens_CloudWatch_agent_segments.html

<br>

## 02. テレメトリーを利用したデバッグ

### 前提

マイクロサービスなシステムにおいて、REDメトリクスに問題があったとする。

ここでいうREDメトリクスとは、Rate (秒当たりのリクエスト数)、Errors (リクエストの失敗数)、Duration (レイテンシー)のことである。

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

#### `(9)` ミドルウェア/アプリケーションのロジックの問題

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

#### `(15)` ミドルウェア/アプリケーションのその他の問題

> - https://atmarkit.itmedia.co.jp/ait/articles/2204/14/news008.html#069

<br>
