---
title: 【IT技術の知見】可観測性
description: 可観測性の知見を記録しています。
---

# 可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 可観測性

### 可観測性とは

![observality_and_monitoring](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/observality_and_monitoring.png)

『収集されたデータから、システムと想定内と想定外 (想定できない) の両方の不具合を、どれだけ正確に推測できるか』を表す程度のこと。

システムの想定内の不具合は『監視』や『テスト (ホワイトボックステスト、ブラックボックステスト) 』によって検知できるが、想定外のものを検知できない。

可観測性は、監視やテストも含むスーパーセットであり、想定内の不具合のみでなく、想定外の不具合も表面化する。

想定外の不具合はインシデントの原因になるため、想定外の不具合の表面化はインシデントの予防につながる。

> - https://blog.thundra.io/observability-driven-development-for-serverless
> - https://sookocheff.com/post/architecture/testing-in-production/
> - https://www.sentinelone.com/blog/observability-production-systems-why-how/
> - https://kakakakakku.hatenablog.com/entry/2020/05/25/064548

<br>

### 可観測性を高める方法

#### ▼ マイクロサービスアーキテクチャの場合

テレメトリーを十分に収集し、これらを紐付けて可視化する必要がある。

#### ▼ モノリシックアーキテクチャにおける可観測性

可観測性は、基本的にマイクロサービスアーキテクチャの文脈で語られる。

モノリシックでどのようにして可観測性を高めるのかを記入中... (情報が全然見つからない)

<br>

## 01-02. テレメトリー

### テレメトリーとは

可観測性を実現するために収集する必要のあるデータ要素 (『メトリクス』『ログ』『分散トレース』) のこと。

NewRelicやDatadogはテレメトリーの要素を全て持つ。

また、AWSではCloudWatch (メトリクス+ログ) とX-Ray (分散トレース) を両方利用すると、これらの要素を満たせたことになり、可観測性を実現できる。

> - https://www.forbes.com/sites/andythurai/2021/02/02/aiops-vs-observability-vs-monitoringwhat-is-the-difference-are-you-using-the-right-one-for-your-enterprise/
> - https://knowledge.sakura.ad.jp/26395/

<br>

### 計装 (インスツルメント化)

システムを、テレメトリーを収集できるような状態にすること。

計装するためには、メトリクス収集用のツール、ロギングパッケージ、分散トレースのためのリクエストIDの付与、などを用意する必要がある。

多くの場合、各テレメトリーの収集ツールは別々に用意する必要があるが、OpenTelemetryではこれらの収集機能をフレームワークとして提供しようとしている。

> - https://syu-m-5151.hatenablog.com/entry/2022/07/12/115434
> - https://www.splunk.com/en_us/data-insider/what-is-opentelemetry.html

<br>

## 01-03. 可観測性を高める方法

### メトリクスの設計

#### ▼ メトリクスの種類

どのような種類のメトリクスのデータポイントを収集するかについては、監視の種類ごとに異なる。

> - https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring.html

<br>

### ログの設計

#### ▼ ログの種類

どのような種類のログを収集するかについては、監視の種類ごとに異なる。

> - https://hiroki-it.github.io/tech-notebook/observability/observability_monitoring.html

#### ▼ ログの持つ情報

| 領域           | 内容           | 値                                                                                                    |
| -------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| フロントエンド | イベントの内容 | タイムスタンプ、 ログメッセージ、リクエストの各ヘッダー値、など                                       |
|                | ラベル         | 実行環境名、など                                                                                      |
| バックエンド   | イベントの内容 | タイムスタンプ、 ログステータス、ログメッセージ、エラーコード、トレースID、スパンID、親スパンID、など |
|                | ラベル         | 実行環境名、リージョン名、Cluster名、Node名、Namespace名、Pod名、マイクロサービス名、コンテナ名、など |
| インフラ       | イベントの内容 | タイムスタンプ、OSイベント、ミドルウェアイベント、セキュリティイベント、など                          |
|                | ラベル         | 実行環境名、リージョン名、Cluster名、Node名、Namespace名、Pod名、マイクロサービス名、コンテナ名、など |

<br>

### 分散トレースの基になるスパンの設計

#### ▼ スパンの持つ情報

> - https://speakerdeck.com/hiroki_hasegawa/ke-guan-ce-xing-niru-men-siyou?slide=17

| 領域         | 内容           | 値                                                                                                                                         |
| ------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| バックエンド | イベントの内容 | トレースID、スパンID、親スパンID、処理の開始時間、処理の所要時間、エラーの有無、マイクロサービスの役割名、コールされたエンドポイント、など |
|              | ラベル         | マイクロサービス名、など                                                                                                                   |

<br>

### テレメトリー間の紐付け

#### ▼ メトリクスと分散トレースの紐付け

記入中...

#### ▼ ログと分散トレースの紐付け

記入中...

<br>

## 02. メトリクス

### メトリクスとは

とある分析にて、一定期間に発生した同じ種類のデータポイントの集計値 (例：CPU使用率、メモリ使用率、など) のこと。

メトリクスは、データポイントの形式にあわせていくつかの形式 (例：パーセンテージ系、時分秒系、カウント系、バイト数系、など) がある。

またメトリクスは、特定の方式 (平均、最大最小、合計、再カウント数) で再集計できる。

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/metrics_namespace_dimension.png)

> - https://www.slideshare.net/AmazonWebServicesJapan/20190326-aws-black-belt-online-seminar-amazon-cloudwatch#18
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Metric

<br>

### メトリクスの種類

#### ▼ パーセンテージ系

値をパーセンテージで表す。

パーセンテージ系データポイントの集計値である。

#### ▼ 時分秒系

値を時分秒で表す。

時分秒系データポイントの集計値である。

#### ▼ カウント系

値を`0`か`1`で表す。

カウント系データポイントの集計値である。

#### ▼ バイト数系

値をバイト数で表す。

バイト数系データポイントの集計値である。

<br>

### データポイント

#### ▼ データポイントとは

分析対象から得られる最小単位の数値データのこと。

データポイントにはいくつかの形式 (例：パーセンテージ系、時分秒系、カウント系、など) がある。

データポイントは、分析ごとに存在している。

例えば、とある分析で`1`分ごとに対象が測定される場合、`1`分ごとに得られる数値データがデータポイントとなる。

一方で、`1`時間ごとの測定の場合、`1`時間ごとに得られる数値データがデータポイントである。

分析の対象 (スケーリングで増えるインスタンスも含む) が増えるほど、データポイントは増える。

メトリクスのデータポイントを保管する場合、分析対象の増加に注意する必要がある。

> - https://whatis.techtarget.com/definition/data-point
> - https://aws.amazon.com/jp/about-aws/whats-new/2017/12/amazon-cloudwatch-alarms-now-alerts-you-when-any-m-out-of-n-metric-datapoints-in-an-interval-are-above-your-threshold/

#### ▼ 収集間隔の縮小/拡大

データポイントを収集する間隔を調節することにより、データポイント全体のデータサイズが変化する。

収集間隔を縮小した場合、データポイント数が多くなるため、データサイズは大きくなる。

反対に収集間隔を拡大した場合、データポイント数が少なくなるなるため、データサイズは小さくなる。

注意点として、収集間隔を拡大した場合はより飛び飛びのメトリクスを描画してしまうため、欠損があったとしてもそれを検出できない可能性がある (例：3分間隔だとしたら、3分に満たない間で起こった欠損は描画できない)。

#### ▼ データポイントのダウンサンプリング

期間内に様々なタイムスタンプのデータポイントがある場合に、期間を区画に分け、区画内のタイプスタンプを数学的に集約し、単一の値に変換する。

これにより、解像度を下げる代わりにデータポイント数を減らし、データポイントの合計データサイズを小さくする。

ストレージの空きサイズが増え、長期間のデータポイントを保管できるようになる

> - http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html

#### ▼ データポイントの重複排除

冗長化されたメトリクス収集ツールのインスタンスが、単一の監視バックエンドやストレージツールにメトリクスを送信する場合、特定の期間には冗長化されたインスタンスが送信した同じデータポイントが存在することになる。

この重複を排除するために、期間内で最新のタイムスタンプを持つデータポイントのみを残す。

これにより、データポイント数を減らし、データポイントの合計データサイズを小さくする。

重複排除のタイミングは、収集ツールの収集間隔と同じ値にすると良い。

> - https://percona.community/blog/2022/06/02/long-time-keeping-metrics-victoriametrics/

<br>

### メトリクスの集約

#### ▼ メトリクスの集約とは

同じ種類のメトリクスを特定のグループ (例：AWS CloudWatchならば、ディメンション、名前空間) に集約する。

> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Aggregation

#### ▼ 集計との違い

集計は、特定の方式 (平均、最大最小、合計、再カウント数) で計算することを指す。

<br>

## 02-02. 監視するべきメトリクスの種類

### ゴールデンシグナル (４大シグナル)

#### ▼ ゴールデンシグナルとは

特に重要なメトリクス (トラフィック、レイテンシー、エラー、サチュレーション) のこと。

> - https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals

#### ▼ トラフィック

サーバー監視対象のメトリクスに所属する。

#### ▼ レイテンシー

サーバー監視対象のメトリクスに所属する。

#### ▼ エラー

サーバー監視対象のメトリクスに所属する。

| エラー名     | 説明                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| 明示的エラー | `400`/`500`系のレスポンス                                               |
| 暗黙的エラー | SLOに満たない`200`/`300`系のレスポンス、API仕様に合っていないレスポンス |

#### ▼ サチュレーション

システム利用率 (CPU利用率、メモリ理容室、ストレージ利用率、など) の飽和度のこと。

例えば、以下の飽和度がある。

`60`～`70`%で、警告ラインを設けておく必要がある。

サーバー監視対象のメトリクスに所属する。

> - https://codezine.jp/article/detail/11472
> - https://www.scsk.jp/sp/sysdig/blog/container_monitoring/kubernetes4.html

<br>

### USEメトリクス

`USE`は、Utilization (使用率)、Saturation (サチュレーション)、Errors (エラー数) のメトリクスの頭文字である。

CPU、メモリ、ストレージ、ネットワーク、などに関する`USE`メトリクス (例：CPU使用率、CPUサチュレーション、など) を含む。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#common-observability-strategies
> - https://blog.gitnux.com/resource-utilization-metrics/

<br>

### REDメトリクス

`RED`は、Rate (秒あたりのリクエスト数)、Errors (リクエストの失敗数)、Duration (レイテンシー) のメトリクスの頭文字である。

SLIによく使用されるメトリクスである。

> - https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/#common-observability-strategies

<br>

## 03. ログ

### ログとは

特定の瞬間に発生したイベントが記載されたデータのこと。

> - https://newrelic.com/jp/blog/how-to-relic/metrics-events-logs-and-traces

<br>

### 構造からみた種類

#### ▼ 非構造化ログ

構造が無く、イベントの値だけが表示されたログのこと。

```log
192.168.0.1 [2021-01-01 12:00:00] GET /foo/1 200
```

#### ▼ 構造化ログ

イベントの項目名と値の対応関係を持つログのこと。

JSON型で表すが、拡張子が`json`であるというわけでないことに注意する。

```yaml
{
  "client_ip": "192.168.0.1",
  "timestamp": "2021-01-01 12:00:00",
  "method": "GET",
  "url": "/foo/1",
  "status_code": 200,
}
```

<br>

### ロギング

#### ▼ Distributed logging (分散ロギング)

マイクロサービスアーキテクチャの各サービスから収集されたログを、バラバラに分析/管理する。

> - https://www.splunk.com/en_us/data-insider/what-is-distributed-tracing.html#centralized-logging

#### ▼ Centralized logging (集中ロギング)

マイクロサービスアーキテクチャの各サービスから収集されたログを、一元的に分析/管理する。

各コンテナ (例：アプリコンテナ、サービスメッシュサイドカー) が作成するログに一意なIDを割り当て、人繋ぎに紐付ける必要がある。

例えば、ログ監視バックエンドでこのログをクエリしさえすれば、リクエストの経路がわかる。

```bash
# CloudLoggingでログをクエリする
jsonPayload.traceId="<トレースID>"
```

> - https://www.splunk.com/en_us/data-insider/what-is-distributed-tracing.html#centralized-logging

<br>

## 04. 分散トレース

### 分散トレースとは

マイクロサービスから収集されたスパンのセットのこと。

スパンをトレースIDで紐付けることによって、`1`個のリクエストで発生したマイクロサービスを横断する処理を、一繋ぎに表現できるようになる。

![distributed-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace.png)

> - https://www.dynatrace.com/news/blog/open-observability-part-1-distributed-tracing-and-observability/
> - https://docs.newrelic.com/jp/docs/distributed-tracing/concepts/introduction-distributed-tracing/
> - https://medium.com/nikeengineering/hit-the-ground-running-with-distributed-tracing-core-concepts-ff5ad47c7058
> - https://www.aspecto.io/blog/jaeger-tracing-the-ultimate-guide/

<br>

### 分散トレースの用途

#### ▼ レスポンスタイムの最適化

分散トレースを収集すると、マイクロサービス間のレスポンスタイムを可視化できる。

例えば、性能テストでシステム全体の性能劣化があったとする。

分散トレースで特定のマイクロサービス間でレスポンスタイムを可視化できるため、いずれのマイクロサービス間の通信がボトルネックになっているかがわかる。

そのダウンストリーム側マイクロサービスのリクエストまたはアップストリーム側マイクロサービスのレスポンスに関して、性能に問題がないかを調査する必要がある。

![distributed-trace_connection-time](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_connection-time.png)

> - https://jimmysong.io/blog/distributed-tracing-with-skywalking-in-istio/#bookinfo-tracing

#### ▼ 悪意のあるリクエストの検出

分散トレースを収集すると、悪意のあるリクエストを検出できる。

例えば、特定のマイクロサービスへのリクエストが異常に多ければ、そのマイクロサービスに悪意のあるリクエストが送信されている可能性がある。

<br>

### 分散トレースの読み方

上から下に読むと、ダウンストリーム側マイクロサービス (上位スパン) がアップストリーム側マイクロサービス (下位スパン) を処理をコールしていることを確認できる。

下から上に読むと、アップストリーム側マイクロサービス (下位スパン) からダウンストリーム側マイクロサービス (上位スパン) に結果を返却していることを確認できる。

![distributed-trace_reading](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_reading.png)

> - https://cloud.google.com/architecture/using-distributed-tracing-to-observe-microservice-latency-with-opencensus-and-stackdriver-trace

<br>

### モノリシックアーキテクチャにおける分散トレース

モノリシックアーキテクチャなアプリケーションでは、システムが分散していないため、単なるトレースとなる。

> - https://deepsource.io/blog/distributed-tracing/#monolithic-observability

**＊例＊**

`(1)`

: `a1`：クライアントがリクエストを送信する。

`(2)`

: `a1`：リクエストがロードバランサ－に到達する。

`(3)`

: `a1`～`a2`：ロードバランサ－で処理が実行される。

`(4)`

: `a2`：ロードバランサ－がリクエストをアプリケーションにルーティングする。

`(5)`

: `a2`：リクエストがアプリケーションに到達する。

`(6)`

: `a2`～`a3`：アプリケーションで処理が実行される。

`(7)`

: `a3`：アプリケーションがレスポンスをクライアントに返信する。

![monolith-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/monolith-trace.png)

<br>

## 04-02. コンテキスト

### コンテキストとは

各スパンに含まれる情報のこと。

- 各種ID
- マイクロサービスの属性情報

<br>

### コンテキスト作成の仕組み

ロードバランサー (例：Istio IngressGateway、AWS ALB) やAPI Gateway (例：AWS API Gateway) が最初にコンテキストを作成する。

これらは、コンテキストがIDが持っているかを検証する。

もしIDがなければ、スパンにIDを新しく割り当てる。

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-tracing.png)

> - https://zenn.dev/lempiji/articles/b752b644d22a59#%E3%81%A9%E3%81%86%E3%82%84%E3%81%A3%E3%81%A6id%E3%82%92%E5%8F%97%E3%81%91%E6%B8%A1%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B
> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html

#### ▼ IDの種類

コンテキストには、以下のIDが含まれている。

| ID         | 説明                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| トレースID | リクエストIDである。全てのマイクロサービスで同じになる。                                         |
| スパンID   | 各マイクロサービス固有の処理IDである。 全てのマイクロサービスで異なっている。                    |
| 親スパンID | クライアントのマイクロサービスの処理IDである。クライアントが同じマイクロサービス間で同じになる。 |

> - https://docs.lightstep.com/docs/understand-distributed-tracing#context
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=5

#### ▼ コンテキスト伝播 (分散コンテキスト伝播)

マイクロサービスで、受信した通信のヘッダーから分散トレースのコンテキストを取得し、アウトバウンド通信のヘッダーにコンテキストを渡すような、実装が必要である。

分散トレースの監視バックエンド (例：OpenTelemetry、LightStep、Jaeger、Zipkin、Datadog、AWS X-Ray) ごとに、ヘッダーからコンテキストを簡単に取り出せるパッケージを使用すると良い。

インバウンド通信がHTTPプロコトルでアウトバウンド通信が、gRPCによるHTTPリクエストである場合も、ヘッダー間での受け渡しが必要である。

> - https://cloud.google.com/architecture/microservices-architecture-distributed-tracing#distributed_tracing
> - https://zenn.dev/lempiji/articles/b752b644d22a59#%E5%AE%9F%E8%A3%85%E4%BE%8B
> - https://medium.com/@the.real.yushuf/propagate-trace-headers-with-istio-grpc-http-1-1-go-73e7f5382643

#### ▼ 異なる言語間での受け渡し

- 異なる言語の各アプリで、計装パッケージによるTracerProviderのセットアップやスパンの作成は必要 
- 言語間で計装パッケージの仕様は標準化されているため、言語が違ってもリクエストからコンテキストの中身 (スパンID、トレースIDなど) を抽出したり注入したりできる

<br>

### コンテキスト仕様の種類

#### ▼ 一覧

コンテキストにはいくつかの仕様があり、仕様ごとにCarrierやデータ形式が異なる。

- W3C Trace Context
- W3C Baggage
- B3 (Zipkin)
- Jaeger
- 独自仕様 (AWS X-Ray、Datadog、LightStep、など)

> - https://opentelemetry.io/docs/specs/otel/context/api-propagators/#propagators-distribution
> - https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry
> - https://medium.com/@danielbcorreia/context-propagation-in-opentelemetry-3f53ab31bcf5

#### ▼ W3C Trace Context

```yaml
GET /my-service HTTP/1.1
---
Host: foo.com
# バージョン、トレースID、親スパンID、トレースフラグ、をリスト形式で運ぶ
traceparent: 00–0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331–01
# セッションID、特定のリクエストにのみ付与されたデータ、などをリスト形式で運ぶ
tracestate: abc=00f067aa0ba902b7,xyz=99f067aa0ba902b7
```

> - https://www.w3.org/TR/trace-context/

#### ▼ B3 (Zipkin)

```yaml
GET /my-service HTTP/1.1
---
Host: foo.com
X-B3-TraceId: f102024f34f30692b676c13f47cbcf03
X-B3-SpanId: e2695f90dfd76b09
X-B3-Sampled: 1
```

<br>

### ツールごとのCarrier

#### ▼ Carrierとは

![distributed-trace_propagated](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_propagated.png)

コンテキストをアップストリーム側マイクロサービスに伝播させる処理を持つ。

伝播に使用する媒体 (例：HTTPヘッダー、メッセージボディ、など) を『Carrier』という。

#### ▼ 標準ヘッダー

| ヘッダー名       | 説明                                                      |
| ---------------- | --------------------------------------------------------- |
| `X-REQUEST-ID`   | トレースIDが割り当てられている。                          |
| `GRPC-TRACE-BIN` | RPCによるリクエストにて、トレースIDが割り当てられている。 |

#### ▼ zipkin系ヘッダー

Zipkinが使用するヘッダーを追加する。

| ヘッダー名          | 説明                                                                               | 値の例                             |
| ------------------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| `X-B3-SAMPLED`      |                                                                                    | `1`                                |
| `X-B3-SPANID`       | スパンIDが割り当てられている。                                                     | `a2fb4a1d1a96d312`                 |
| `X-B3-TRACEID`      | トレースIDが割り当てられている。                                                   | `463ac35c9f6413ad48485a3953bb6124` |
| `X-B3-PARENTSPANId` | 親のスパンIDが割り当てられている。ルートスパンの場合、このヘッダーは追加されない。 | `0020000000000001`                 |

> - https://github.com/openzipkin/b3-propagation#multiple-headers

#### ▼ AWS X-Ray系ヘッダー

AWS X-Rayが使用するヘッダーを追加する。

| ヘッダー名        | 説明                                                        | 値の例                                |
| ----------------- | ----------------------------------------------------------- | ------------------------------------- |
| `X-AMZN-TRACE-ID` | トレースIDが割り当てられている。トレースIDはALBで作られる。 | `1-5759e988-bd862e3fe1be46a994272793` |

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html
> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html

<br>


## 04-03. スパン

### スパンとは

マイクロサービスアーキテクチャの特定のサービスにて、1つのリクエストで発生したデータのセットのこと。

スパンには親子関係があり、最上位の親スパンを『ルートスパン』ともいう。

JSON型で定義されることが多い。

SaaSツールによってJSON型の構造が異なる。

> - https://opentracing.io/docs/overview/spans/
> - https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/#%E3%83%A2%E3%83%87%E3%83%AB
> - https://docs.newrelic.com/jp/docs/distributed-tracing/trace-api/report-new-relic-format-traces-trace-api/#new-relic-guidelines

<br>

### スパン名

スパンが作成されたクラス (構造体) やメソッド (関数) が判別しやすいようにする。

例えば、ユーザー情報を取得するマイクロサービスのスパン名として、以下の候補がある。

区切り記号は、ドット (`.`) や スラッシュ(`/`) が良い。

| スパン名                | 構成                                      | 良し悪し | 補足                                         |
| ----------------------- | ----------------------------------------- | :------: | -------------------------------------------- |
| `get`                   | `<HTTPメソッド名>`                        |    ×     |                                              |
| `get_account.42`        | `<アプリのメソッド名>.<ID>`               |    ×     |                                              |
| `get_account`           | `<アプリのメソッド名>`                    |    ⭕️    | スパンの属性にアカウントIDを設定するとよい。 |
| `get_account.accountId` | `<アプリのメソッド名>.<エンドポイント名>` |    ⭕️    |                                              |

> - https://github.com/open-telemetry/opentelemetry-specification//blob/main/specification/trace/api.md#span
> - https://opentelemetry.io/docs/specs/semconv/http/http-spans/#name
> - https://opentelemetry.io/docs/specs/semconv/http/http-spans/#http-server-semantic-conventions

<br>

### スパンの粒度

スパンの適切な粒度は、マイクロサービスの粒度による。

| マイクロサービスの粒度     | スパンの粒度                     |
| -------------------------- | -------------------------------- |
| 境界付けられたコンテキスト | マイクロサービスごと、関数ごとに |
| ルートエンティティ         | マイクロサービスごと             |

<br>


### データポイント化

スパンが持つデータをデータポイントとして集計することにより、メトリクスのデータポイントを収集できる。



<br>



## 05. プロファイル

### プロファイルとは

分散トレースのスパンにハードウェアリソース消費量の情報を加えたもの。

> - https://zenn.dev/k6s4i53rx/articles/021a1d65af9e95
> - https://github.com/google/pprof

<br>

### プロファイルの用途

分散トレースだけではマイクロサービス間のレスポンスタイムしかわからない。

プロファイルを導入すると、各マイクロサービスのハードウェアリソース消費量もわかるようになる。

これにより、性能劣化のボトルネックを特定しやすくなる。

<br>

## 06. その他のテレメトリー

メトリクス/ログ/分散トレース/プロファイルに加えて、新しいテレメトリーがいくつか提唱されている。

- Events (ドメインイベントのようなユーザー定義の処理イベント)
- Exception

> - https://medium.com/@YuriShkuro/temple-six-pillars-of-observability-4ac3e3deb402
> - https://www.appdynamics.com/ja_jp/topics/what-is-open-telemetry#~1-what-is-opentelemetry

<br>
