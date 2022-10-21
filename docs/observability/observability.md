---
title: 【IT技術の知見】可観測性
description: 可観測性の知見を記録しています。
---

# 可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 可観測性

### 可観測性とは

![observality_and_monitoring](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/observality_and_monitoring.png)

『収集されたデータから、システムと想定内と想定外（想定できない）の両方の不具合を、どれだけ正確に推測できるか』を表す程度のこと。システムの想定内の不具合は『監視』や『テスト（ホワイトボックステスト、ブラックボックステスト）』によって検知できるが、想定外のものを検知できない。可観測性は、監視やテストも含むスーパーセットであり、想定内の不具合だけでなく、想定外の不具合も表面化する。想定外の不具合はインシデントの原因になるため、想定外の不具合の表面化はインシデントの予防につながる。

> ℹ️ 参考：
>
> - https://blog.thundra.io/observability-driven-development-for-serverless
> - https://sookocheff.com/post/architecture/testing-in-production/
> - https://www.sentinelone.com/blog/observability-production-systems-why-how/
> - https://kakakakakku.hatenablog.com/entry/2020/05/25/064548

<br>

### 可観測性を高める方法

#### ▼ マイクロサービスアーキテクチャの場合

テレメトリーを十分に収集し、これらを紐付けて可視化する必要がある。

#### ▼ モノリシックアーキテクチャにおける可観測性

可観測性は、基本的にマイクロサービスアーキテクチャの文脈で語られる。モノリシックでどのようにして可観測性を高めるのかを調査中...（情報が全然見つからない）

<br>

## 01-02. テレメトリー

### テレメトリーとは

可観測性を実現するために収集する必要のあるデータ要素（『メトリクス』『ログ』『分散トレース』）のこと。NewRelicやDatadogはテレメトリーの要素を全て持つ。また、AWSではCloudWatch（メトリクス+ログ）とX-Ray（分散トレース）を両方利用すると、これらの要素を満たせたことになり、可観測性を実現できる。

> ℹ️ 参考：
>
> - https://www.forbes.com/sites/andythurai/2021/02/02/aiops-vs-observability-vs-monitoringwhat-is-the-difference-are-you-using-the-right-one-for-your-enterprise/
> - https://knowledge.sakura.ad.jp/26395/

<br>

### 計装（インスツルメント化）

システムを、テレメトリーを収集できるような状態にすること。計装するためには、メトリクス収集用のツール、ロギングパッケージ、分散トレースのためのリクエストIDの付与、などを用意する必要がある。多くの場合、各テレメトリーの収集ツールは別々に用意する必要があるが、OpenTelemetryではこれらの収集機能をフレームワークとして提供しようとしている。

> ℹ️ 参考：
>
> - https://syu-m-5151.hatenablog.com/entry/2022/07/12/115434
> - https://www.splunk.com/en_us/data-insider/what-is-opentelemetry.html

<br>

## 01-03. 可観測性を高める方法

### メトリクスの設計

#### ▼ メトリクスの種類

どのような種類のメトリクスを収集するかについては、監視の種類ごとに異なる。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability/observability_monitoring.html

<br>

### ログの設計

#### ▼ ログの種類

どのような種類のログを収集するかについては、監視の種類ごとに異なる。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/observability/observability_monitoring.html

#### ▼ ログの持つ情報

| 領域      | 内容      | 値                                                           |
|---------|---------|-------------------------------------------------------------|
| フロントエンド | イベントの内容 | タイムスタンプ、 ログメッセージ、リクエストの各ヘッダーの値、など                              |
|         | ラベル     | 実行環境名、など                                                       |
| バックエンド  | イベントの内容 | タイムスタンプ、 ログステータス、ログメッセージ、エラーコード、トレースID、など                      |
|         | ラベル     | 実行環境名、リージョン名、Cluster名、Node名、Namespace名、Pod名、マイクロサービス名、コンテナ名、など |
| インフラ    | イベントの内容 | タイムスタンプ、OSイベント、ミドルウェアイベント、セキュリティイベント、など                        |
|         | ラベル     | 実行環境名、リージョン名、Cluster名、Node名、Namespace名、Pod名、マイクロサービス名、コンテナ名、など |

<br>

### 分散トレースの基になるスパンの設計

#### ▼ スパンの持つ情報

> ℹ️ 参考：https://speakerdeck.com/hiroki_hasegawa/ke-guan-ce-xing-niru-men-siyou?slide=17

| 領域      | 内容      | 値                                                                       |
|---------|---------|-------------------------------------------------------------------------|
| バックエンド  | イベントの内容 | トレースID、スパンID（自身、親）、処理の開始時間、処理の所要時間、エラーの有無、マイクロサービスの役割名、コールされたエンドポイント、など |
|         | ラベル     | マイクロサービス名、など                                                            |

<br>

### テレメトリー間の紐付け

<br>

## 02. メトリクス 

### メトリクスとは

とある分析にて、一定期間に発生した複数のデータポイントの集計値のこと。メトリクスは、特定の単位（平均、最大最小、合計）で再集計できる。

> ℹ️ 参考：
>
> - https://www.slideshare.net/AmazonWebServicesJapan/20190326-aws-black-belt-online-seminar-amazon-cloudwatch
> - https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Metric

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/metrics_namespace_dimension.png)

<br>

### データポイント

#### ▼ データポイントとは

分析対象から得られる最小単位の数値データのこと。データポイントにはいくつかの形式（割合系、時間系、カウント系）がある。データポイントは、分析ごとに存在している。例えば、とある分析で```1```分ごとに対象が測定される場合、```1```分ごとに得られる数値データがデータポイントとなる。一方で、```1```時間ごとの測定の場合、```1```時間ごとに得られる数値データがデータポイントである。

> ℹ️ 参考：
>
> - https://whatis.techtarget.com/definition/data-point
> - https://aws.amazon.com/jp/about-aws/whats-new/2017/12/amazon-cloudwatch-alarms-now-alerts-you-when-any-m-out-of-n-metric-datapoints-in-an-interval-are-above-your-threshold/

#### ▼ データポイント数

分析の対象（スケーリングで増えるインスタンスも含む）が増えるほど、データポイントは増える。メトリクスのデータポイントを保管する場合、分析対象の増加に注意する必要がある。

#### ▼ ダウンサンプリング

旧いデータポイントを時間単位で数学的に集約することにより、解像度を下げる代わりに、データサイズを小さくする。ストレージの空きサイズが増え、長期間のデータポイントを保管できるようになる

> ℹ️ 参考：http://opentsdb.net/docs/build/html/user_guide/query/downsampling.html

<br>

### ４大シグナル

#### ▼ ４大シグナルとは

特に重要なメトリクス（トラフィック、レイテンシー、エラー、サチュレーション）のこと。

#### ▼ トラフィック

サーバー監視対象のメトリクスに属する。

#### ▼ レイテンシー

サーバー監視対象のメトリクスに属する。

#### ▼ エラー

サーバー監視対象のメトリクスに属する。

| エラー名         | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| 明示的エラー | ```400```/```500```系のレスポンス                                        |
| 暗黙的エラー | SLOに満たない```200```/```300```系のレスポンス、API仕様に合っていないレスポンス |

#### ▼ サチュレーション

システム利用率（CPU利用率、メモリ理容室、ストレージ利用率、など）の飽和度のこと。例えば、以下の飽和度がある。```60```～```70```%で、警告ラインを設けておく必要がある。サーバー監視対象のメトリクスに属する。

<br>

## 03. ログ

### ログとは 

特定の瞬間に発生したイベントが記載されたデータのこと。

> ℹ️ 参考：https://newrelic.com/jp/blog/how-to-relic/metrics-events-logs-and-traces

<br>

### 構造からみた種類

#### ▼ 非構造化ログ

構造が無く、イベントの値だけが表示されたログのこと。

```log
192.168.0.1 [2021-01-01 12:00:00] GET /foo/1 200 
```

#### ▼ 構造化ログ

イベントの項目名と値の対応関係を持つログのこと。JSON型で表すが、拡張子が```json```であるというわけでないことに注意する。

```yaml
{
    "client_ip": "192.168.0.1",
    "timestamp": "2021-01-01 12:00:00",
    "method": "GET",
    "url": "/foo/1",
    "status_code": 200
}
```

<br>

### ロギング

#### ▼ Distributed logging（分散ロギング）

マイクロサービスアーキテクチャの各サービスから収集されたログを、バラバラに分析/管理する。

> ℹ️ 参考：https://www.splunk.com/en_us/data-insider/what-is-distributed-tracing.html#centralized-logging

#### ▼ Centralized logging（集中ロギング）

マイクロサービスアーキテクチャの各サービスから収集されたログを、一元的に分析/管理する。各ログに一意なIDを割り当て、人繋ぎに紐付ける必要がある。

> ℹ️ 参考：https://www.splunk.com/en_us/data-insider/what-is-distributed-tracing.html#centralized-logging

<br>

## 04. 分散トレース

### 分散トレースとは

![distributed-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-trace.png)

マイクロサービスから収集されたスパンのセットのこと。スパンをトレースIDで紐付けることによって、```1```個のリクエストで発生したマイクロサービスを横断する処理を、一繋ぎに表現できるようになる。

> ℹ️ 参考：
>
> - https://www.dynatrace.com/news/blog/open-observability-part-1-distributed-tracing-and-observability/
> - https://docs.newrelic.com/jp/docs/distributed-tracing/concepts/introduction-distributed-tracing/
> - https://medium.com/nikeengineering/hit-the-ground-running-with-distributed-tracing-core-concepts-ff5ad47c7058
> - https://www.aspecto.io/blog/jaeger-tracing-the-ultimate-guide/

<br>

### 分散トレースID

#### ▼ IDの種類

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-tracing.png)

サービスメッシュでは、リバースプロキシ（例：Envoy、Linkerd2-proxy）、ロードバランサー（Istio IngressGateway、AWS ALB）、API Gateway（AWS API Gateway）で、インバウンド通信のHTTPヘッダーやRPCヘッダーに分散トレースIDが割り当てられているか（メッセージボディにIDを追加するツールもある）を確認し、もしなければ作成したトレースIDを新しく割り当てるようにする。

| HTTPヘッダー名  | 説明                                                         |
|------------| ------------------------------------------------------------ |
| スパンIDヘッダー  | スパンIDが割り当てられている。                               |
| トレースIDヘッダー | トレースIDが割り当てられている。                             |
| 親スパンIDヘッダー | 親のスパンIDが割り当てられている。ルートスパンの場合、このヘッダーは追加されない。 |


> ℹ️ 参考：
>
> - https://zenn.dev/lempiji/articles/b752b644d22a59#%E3%81%A9%E3%81%86%E3%82%84%E3%81%A3%E3%81%A6id%E3%82%92%E5%8F%97%E3%81%91%E6%B8%A1%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B
> - https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/observability/tracing#arch-overview-tracing-context-propagation
> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html


#### ▼ 通信の伝播

サービスメッシュのリバースプロキシは分散トレースのためのIDを生成するが、マイクロサービスに対するインバウンド通信とそれのアウトバウンド通信を紐づける機能を持たない。そのためマイクロサービス（クリーンアーキテクチャを採用している場合は、アプリのインフラストラクチャ層）で、受信したインバウンド通信のヘッダーから分散トレースのIDを取得し、アウトバウンド通信のヘッダーにこのIDを割り当て直すような、実装が必要である。各分散トレースの収集ツール（例：LightStep、Zipkin、Datadog、AWS X-Ray）ごとに、ヘッダーからIDを簡単に取り出せるパッケージを使用すると良い。インバウンド通信がHTTPプロコトルでアウトバウンド通信がRPC通信である場合も、ヘッダー間での受け渡しが必要である。

> ℹ️ 参考：
> 
> - https://zenn.dev/lempiji/articles/b752b644d22a59#%E5%AE%9F%E8%A3%85%E4%BE%8B
> - https://medium.com/@the.real.yushuf/propagate-trace-headers-with-istio-grpc-http-1-1-go-73e7f5382643
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/productpage/productpage.py#L180-L237
> - https://github.com/istio/istio/blob/a9f4988c313b7df36f5d1da6b3b87cbe698935ae/samples/bookinfo/src/details/details.rb#L130-L187

<br>

### スパン

#### ▼ スパンとは

マイクロサービスアーキテクチャの特定のサービスにて、1つのリクエストで発生したデータのセットのこと。スパンには親子関係があり、最上位の親スパンを『ルートスパン』ともいう。JSON型で定義されることが多い。SaaSツールによってJSON型の構造が異なる。

> ℹ️ 参考：
>
> - https://opentracing.io/docs/overview/spans/
> - https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/#%E3%83%A2%E3%83%87%E3%83%AB
> - https://docs.newrelic.com/jp/docs/distributed-tracing/trace-api/report-new-relic-format-traces-trace-api/#new-relic-guidelines


#### ▼ データポイント化

スパンが持つデータをデータポイントとして集計することにより、メトリクスのデータポイントを収集できる。

<br>

### 分散トレースの読み方

![distributed-trace_reading](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-trace_reading.png)

上から下に読むと、上流サービス（上位スパン）が下流サービス（下位スパン）を処理をコールしていることを確認できる。下から上に読むと、下流サービス（下位スパン）から上流サービス（上位スパン）に結果を返却していることを確認できる。

> ℹ️ 参考：https://cloud.google.com/architecture/using-distributed-tracing-to-observe-microservice-latency-with-opencensus-and-stackdriver-trace

<br>

### モノリシックアーキテクチャにおける分散トレース

モノリシックアーキテクチャなアプリケーションでは、システムが分散していないため、単なるトレースとなる。

> ℹ️ 参考：https://deepsource.io/blog/distributed-tracing/#monolithic-observability

**＊例＊**

![monolith-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/monolith-trace.png)


（１）```a1```：クライアントがリクエストを送信する。

（２）```a1```：リクエストがロードバランサ－に到達する。

（３）```a1```～```a2```：ロードバランサ－で処理が実行される。

（４）```a2```：ロードバランサ－がリクエストをアプリケーションにルーティングする。

（５）```a2```：リクエストがアプリケーションに到達する。

（６）```a2```～```a3```：アプリケーションで処理が実行される。

（７）```a3```：アプリケーションがレスポンスをクライアントに返信する。

<br>




