---
title: 【IT技術の知見】分散トレース＠テレメトリー
description: 分散トレース＠テレメトリーの知見を記録しています。
---

# 分散トレース＠テレメトリー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 分散トレース

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

## 02. トレースコンテキスト

### トレースコンテキストとは

各スパンに含まれる情報のこと。

- 各種ID
- マイクロサービスの属性情報

<br>

### トレースコンテキスト作成の仕組み

ロードバランサー (例：Istio IngressGateway、AWS ALB) やAPI Gateway (例：AWS API Gateway) が最初にトレースコンテキストを作成する。

これらは、トレースコンテキストがIDが持っているかを検証する。

もしIDがなければ、スパンにIDを新しく割り当てる。

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-tracing.png)

> - https://zenn.dev/lempiji/articles/b752b644d22a59#%E3%81%A9%E3%81%86%E3%82%84%E3%81%A3%E3%81%A6id%E3%82%92%E5%8F%97%E3%81%91%E6%B8%A1%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B
> - https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html

#### ▼ IDの種類

トレースコンテキストには、以下のIDが含まれている。

| ID         | 説明                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| トレースID | リクエストIDである。全てのマイクロサービスで同じになる。                                         |
| スパンID   | 各マイクロサービス固有の処理IDである。 全てのマイクロサービスで異なっている。                    |
| 親スパンID | クライアントのマイクロサービスの処理IDである。クライアントが同じマイクロサービス間で同じになる。 |

> - https://docs.lightstep.com/docs/understand-distributed-tracing#context
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=5

#### ▼ トレースコンテキスト伝播 (分散トレースコンテキスト伝播)

マイクロサービスで、受信した通信のヘッダーから分散トレースのトレースコンテキストを取得し、アウトバウンド通信のヘッダーにトレースコンテキストを渡すような、実装が必要である。

分散トレースの監視バックエンド (例：OpenTelemetry、LightStep、Jaeger、Zipkin、Datadog、AWS X-Ray) ごとに、ヘッダーからトレースコンテキストを簡単に取り出せるパッケージを使用すると良い。

インバウンド通信がHTTPプロコトルでアウトバウンド通信が、gRPCによるHTTPリクエストである場合も、ヘッダー間での受け渡しが必要である。

> - https://cloud.google.com/architecture/microservices-architecture-distributed-tracing#distributed_tracing
> - https://zenn.dev/lempiji/articles/b752b644d22a59#%E5%AE%9F%E8%A3%85%E4%BE%8B
> - https://medium.com/@the.real.yushuf/propagate-trace-headers-with-istio-grpc-http-1-1-go-73e7f5382643

#### ▼ 異なる言語間での受け渡し

- 異なる言語の各アプリで、計装パッケージによるTracerProviderのセットアップやスパンの作成は必要
- 言語間で計装パッケージのトレースコンテキスト仕様は標準化されているため、言語が違ってもリクエストからトレースコンテキストの情報 (スパンID、トレースIDなど) を抽出したり注入したりできる

<br>

### トレースコンテキスト仕様の種類

#### ▼ 一覧

トレースコンテキストにはいくつかの仕様があり、仕様ごとにCarrierやデータ形式が異なる。

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

トレースコンテキストをアップストリーム側マイクロサービスに伝播させる処理を持つ。

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

## 03. スパン

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

## 04. プロファイル

### プロファイルとは

分散トレースのスパンにハードウェアリソース消費量の情報を加えたもの。

> - https://zenn.dev/k6s4i53rx/articles/021a1d65af9e95
> - https://github.com/google/pprof

<br>
