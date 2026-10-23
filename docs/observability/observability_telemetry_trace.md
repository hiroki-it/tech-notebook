---
title: 【IT技術の知見】分散トレース＠テレメトリー
description: 分散トレース＠テレメトリーの知見を記録しています。
---

# 分散トレース＠テレメトリー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. 分散トレース

### 分散トレースとは

マイクロサービスから収集したスパンのセットのこと。

スパンをトレース ID で紐付けると、`1` 個のリクエストで発生したマイクロサービスを横断する処理を一繋ぎで表現できるようになる。

![distributed-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace.png)

> - https://www.dynatrace.com/news/blog/open-observability-part-1-distributed-tracing-and-observability/
> - [ディストリビューティッド（分散）トレーシング：マイクロサービス全体でリクエストを追跡 \| New Relic Documentation](https://docs.newrelic.com/jp/docs/distributed-tracing/concepts/introduction-distributed-tracing/)
> - [Medium](https://medium.com/nikeengineering/hit-the-ground-running-with-distributed-tracing-core-concepts-ff5ad47c7058)
> - https://www.aspecto.io/blog/jaeger-tracing-the-ultimate-guide/

<br>

### 分散トレースの用途

#### ▼ レスポンスタイムの最適化

分散トレースを収集すると、マイクロサービス間のレスポンスタイムを可視化できる。

例えば、性能テストでシステム全体の性能のデグレーションがあったとする。

分散トレースで特定のマイクロサービス間でレスポンスタイムを可視化できるため、いずれのマイクロサービス間の通信がボトルネックになっているかがわかる。

その送信元マイクロサービスのリクエストまたは宛先マイクロサービスのレスポンスについて、性能に問題がないかを調査する必要がある。

![distributed-trace_connection-time](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_connection-time.png)

> - [How to Use SkyWalking for Distributed Tracing in Istio? \| …](https://jimmysong.io/blog/distributed-tracing-with-skywalking-in-istio/#bookinfo-tracing)

#### ▼ 悪意のあるリクエストの検出

分散トレースを収集すると、悪意のあるリクエストを検出できる。

例えば、特定のマイクロサービスへのリクエストが異常に多ければ、そのマイクロサービスに悪意のあるリクエストが送信されている可能性がある。

<br>

### 分散トレースの読み方

上から下に読むと、送信元マイクロサービス (上位スパン) が宛先マイクロサービス (下位スパン) の処理をコールしていることを確認できる。

下から上に読むと、宛先マイクロサービス (下位スパン) から送信元マイクロサービス (上位スパン) に結果を返却していることを確認できる。

![distributed-trace_reading](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_reading.png)

> - https://cloud.google.com/architecture/using-distributed-tracing-to-observe-microservice-latency-with-opencensus-and-stackdriver-trace

<br>

### モノリシックアーキテクチャにおける分散トレース

モノリシックアーキテクチャなアプリケーションでは、システムが分散していないため、単なるトレースとなる。

> - [What is Distributed Tracing? • DeepSource](https://deepsource.io/blog/distributed-tracing/#monolithic-observability)

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

スパン群を紐付けるために、コンポーネント間で運搬する情報のこと。

- 各種 ID
- マイクロサービスの属性情報

<br>

### トレースコンテキスト作成の仕組み

リクエストを最初に処理するコンポーネントが、ルートスパンとトレースコンテキストを作成する。例えば、フロントエンドアプリケーションやロードバランサー (例：Istio Ingress Gateway、AWS ALB) 、API ゲートウェイ (例：Amazon API Gateway) が該当する。

これらは、トレースコンテキストが ID を持っているかを検証する。

もし ID がなければ、スパンに ID を新しく割り当てる。

![distributed-tracing](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-tracing.png)

> - [分散トレーシングの仕組み 「ログの対応付け」と「受け渡すHTTPヘッダー」を大体5分で理解する](https://zenn.dev/lempiji/articles/b752b644d22a59#%E3%81%A9%E3%81%86%E3%82%84%E3%81%A3%E3%81%A6id%E3%82%92%E5%8F%97%E3%81%91%E6%B8%A1%E3%81%97%E3%81%A6%E3%81%84%E3%82%8B%E3%81%8B)
> - [Request tracing for your Application Load Balancer - Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html)

#### ▼ ID の種類

トレースコンテキストには、以下の ID が含まれている。

<table>
  <thead>
    <tr>
      <th>ID</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>トレース ID</td>
      <td>一つのトレースを構成するスパン群で共通する ID である。</td>
    </tr>
    <tr>
      <td>スパン ID</td>
      <td>各スパンを識別する ID である。</td>
    </tr>
    <tr>
      <td>親スパン ID</td>
      <td>親スパンを識別する ID である。ルートスパンには親スパン ID が存在しない。</td>
    </tr>
  </tbody>
</table>

> - [Understand distributed tracing](https://docs.lightstep.com/docs/understand-distributed-tracing#context)
> - [分散トレーシングとOpenTelemetryのススメ / Getting started distributed tracing and OpenTelemetry - Speaker Deck](https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=5)

#### ▼ トレースコンテキスト伝播 (分散トレースコンテキスト伝播)

マイクロサービスで、受信した通信のヘッダーから分散トレースのトレースコンテキストを取得し、アウトバウンド通信のヘッダーにトレースコンテキストを渡すような、実装が必要である。

分散トレースの監視バックエンド (例：OpenTelemetry、LightStep、Jaeger、Zipkin、Datadog、AWS X-Ray) ごとに、ヘッダーからトレースコンテキストを簡単に取り出せるパッケージを使用するとよい。

インバウンド通信が HTTP プロコトルでアウトバウンド通信が、gRPC による HTTP リクエストである場合も、ヘッダー間での受け渡しが必要である。

> - https://cloud.google.com/architecture/microservices-architecture-distributed-tracing#distributed_tracing
> - [分散トレーシングの仕組み 「ログの対応付け」と「受け渡すHTTPヘッダー」を大体5分で理解する](https://zenn.dev/lempiji/articles/b752b644d22a59#%E5%AE%9F%E8%A3%85%E4%BE%8B)
> - [Medium](https://medium.com/@the.real.yushuf/propagate-trace-headers-with-istio-grpc-http-1-1-go-73e7f5382643)

#### ▼ 異なる言語間での受け渡し

- 異なる言語の各アプリで、計装パッケージによる TracerProvider のセットアップやスパンの作成は必要
- 言語間で計装パッケージのトレースコンテキスト仕様は標準化されているため、言語が違っても Carrier からトレースコンテキストの情報 (スパン ID、トレース ID など) を抽出したり注入したりできる

<br>

### トレースコンテキスト仕様の種類

#### ▼ 一覧

トレースコンテキストにはいくつかの仕様があり、仕様ごとに Carrier やデータ形式が異なる。

- W3C Trace Context
- W3C Baggage
- B3 (Zipkin)
- Jaeger
- 独自仕様 (AWS X-Ray、Datadog、LightStep など)

> - [Propagators API \| OpenTelemetry](https://opentelemetry.io/docs/specs/otel/context/api-propagators/#propagators-distribution)
> - [OpenTelemetryで分散トレーシング - Carpe Diem](https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry)
> - [Medium](https://medium.com/@danielbcorreia/context-propagation-in-opentelemetry-3f53ab31bcf5)

#### ▼ W3C Trace Context

W3C Trace Context 仕様の ID は以下の通りである。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>trace-id</td>
      <td>16 進数 (<code>32</code> 文字)</td>
    </tr>
    <tr>
      <td>parent-id</td>
      <td>16 進数 (<code>16</code> 文字)</td>
    </tr>
    <tr>
      <td>trace-flags</td>
      <td>16 進数 (<code>2</code> 文字)</td>
    </tr>
  </tbody>
</table>

これらの値によってトレースコンテキストが決まる。

```yaml
GET /foo-service HTTP/1.1
---
Host: example.com
# バージョン、トレース ID、親スパン ID、トレースフラグをリスト形式で運搬する
traceparent: 00–0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331–01
# セッション ID、特定のリクエストにのみ付与されたデータなどをリスト形式で運搬する
tracestate: abc=00f067aa0ba902b7,xyz=99f067aa0ba902b7
```

> - [Trace Context](https://www.w3.org/TR/trace-context/)

#### ▼ B3 (Zipkin)

B3 仕様の ID は以下の通りである。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>trace-id</td>
      <td>16 進数 (<code>16</code> 文字または <code>32</code> 文字)</td>
    </tr>
    <tr>
      <td>span-id</td>
      <td>16 進数 (<code>16</code> 文字)</td>
    </tr>
    <tr>
      <td>parent-span-id</td>
      <td>16 進数 (<code>16</code> 文字)</td>
    </tr>
    <tr>
      <td>sampling-state</td>
      <td>サンプリング無効なら <code>0</code>、有効なら <code>1</code></td>
    </tr>
  </tbody>
</table>

これらの値によってトレースコンテキストが決まる。

```yaml
GET /foo-service HTTP/1.1
---
Host: example.com
# トレース ID、スパン ID、サンプリングステート、親スパン ID をエンコードして運
b3: 80f198ee56343ba864fe8b2a57d3eff7-e457b5a2e4d86bd1-1-05e3ac9a4f6e3b90
```

> - [GitHub - openzipkin/b3-propagation: Repository that describes and sometimes implements B3 propagation · GitHub](https://github.com/openzipkin/b3-propagation?tab=readme-ov-file#single-header)

#### ▼ X-Ray

X-Ray 仕様の ID は以下の通りである。

<table>
  <thead>
    <tr>
      <th>項目</th>
      <th>値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>trace-id</td>
      <td>version (<code>1</code>) + タイムスタンプ (<code>16</code> 進数) + ユニーク ID (<code>16</code> 進数)</td>
    </tr>
    <tr>
      <td>span-id</td>
      <td></td>
    </tr>
  </tbody>
</table>

```yaml
GET /foo-service HTTP/1.1
---
# <バージョン>-<ルートセグメントのタイプスタンプ>-<サブセグメントごとのユニーク ID>
trace_id: 1-58406520-a006649127e371903a2de979
```

> - [Sending trace data to AWS X-Ray - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-api-sendingdata.html#xray-api-traceids)

<br>

### ツールごとの Carrier

#### ▼ Carrier とは

トレースコンテキストを宛先マイクロサービスに伝播させる処理を持つ。

伝播に使用する媒体 (例：HTTP ヘッダー、メッセージボディ、gRPC メタデータなど) を『Carrier』という。

![distributed-trace_propagated](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_propagated.png)

#### ▼ 標準ヘッダー

<table>
  <thead>
    <tr>
      <th>ヘッダー名</th>
      <th>説明</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>X-REQUEST-ID</code></td>
      <td>トレース ID が割り当てられている。</td>
    </tr>
    <tr>
      <td><code>GRPC-TRACE-BIN</code></td>
      <td>RPC によるリクエストにて、トレース ID が割り当てられている。</td>
    </tr>
  </tbody>
</table>

#### ▼ zipkin 系ヘッダー

Zipkin が使用するヘッダーを追加する。

<table>
  <thead>
    <tr>
      <th>ヘッダー名</th>
      <th>説明</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>X-B3-SAMPLED</code></td>
      <td></td>
      <td><code>1</code></td>
    </tr>
    <tr>
      <td><code>X-B3-SPANID</code></td>
      <td>スパン ID が割り当てられている。</td>
      <td><code>a2fb4a1d1a96d312</code></td>
    </tr>
    <tr>
      <td><code>X-B3-TRACEID</code></td>
      <td>トレース ID が割り当てられている。</td>
      <td><code>463ac35c9f6413ad48485a3953bb6124</code></td>
    </tr>
    <tr>
      <td><code>X-B3-PARENTSPANId</code></td>
      <td>親のスパン ID が割り当てられている。ルートスパンの場合、このヘッダーは追加されない。</td>
      <td><code>0020000000000001</code></td>
    </tr>
  </tbody>
</table>

> - [GitHub - openzipkin/b3-propagation: Repository that describes and sometimes implements B3 propagation · GitHub](https://github.com/openzipkin/b3-propagation#multiple-headers)

#### ▼ AWS X-Ray 系ヘッダー

AWS X-Ray が使用するヘッダーを追加する。

<table>
  <thead>
    <tr>
      <th>ヘッダー名</th>
      <th>説明</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>X-AMZN-TRACE-ID</code></td>
      <td>トレース ID が割り当てられている。トレース ID は AWS ALB で作られる。</td>
      <td><code>1-5759e988-bd862e3fe1be46a994272793</code></td>
    </tr>
  </tbody>
</table>

> - [AWS X-Ray concepts - AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html)
> - [Request tracing for your Application Load Balancer - Elastic Load Balancing](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-request-tracing.html)

#### ▼ OpenTelemetry 系ヘッダー

<table>
  <thead>
    <tr>
      <th>ヘッダー名</th>
      <th>説明</th>
      <th>値の例</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>traceparent</code></td>
      <td>トレース ID やスパン ID などが割り当てられている。</td>
      <td><code>00-d34ea2aa01d34d0fda79c6d09b097a83-fd0eae41e95a263c-01</code></td>
    </tr>
    <tr>
      <td><code>tracestate</code></td>
      <td>監視バックエンドのベンダー固有の値が割り当てられている。</td>
      <td>記入中...</td>
    </tr>
  </tbody>
</table>

<br>

## 03. スパン

### スパンとは

マイクロサービスアーキテクチャの特定のサービスにて、1 つのリクエストで発生したデータのセットのこと。

スパンには親子関係があり、最上位の親スパンを『ルートスパン』ともいう。

JSON 型で定義されることが多い。

SaaS ツールによって JSON 型の構造が異なる。

> - [Spans](https://opentracing.io/docs/overview/spans/)
> - https://docs.datadoghq.com/tracing/guide/send_traces_to_agent_by_api/#%E3%83%A2%E3%83%87%E3%83%AB
> - [Trace API（New Relicフォーマット）によるトレースの報告 \| New Relic Documentation](https://docs.newrelic.com/jp/docs/distributed-tracing/trace-api/report-new-relic-format-traces-trace-api/#new-relic-guidelines)

<br>

### スパン名

#### ▼ スパン名について

スパンが作成されたクラス (構造体) やメソッド (関数) が判別しやすいようにする。

区切り記号は、ドット (`.`) や スラッシュ(`/`) がよい。

#### ▼ サーバー側の場合

サーバー側では、例えば以下のスパン名をとする。

<table>
  <thead>
    <tr>
      <th>サーバー側のスパン名</th>
      <th>構成</th>
      <th style="text-align:center">良し悪し</th>
      <th>補足</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>get</code></td>
      <td><code>&lt;HTTPメソッド名&gt;</code></td>
      <td style="text-align:center">×</td>
      <td>具体的すぎると、データを集計しにくくなる。</td>
    </tr>
    <tr>
      <td><code>get_account/42</code></td>
      <td><code>&lt;アプリケーションの関数名&gt;/&lt;ID&gt;</code></td>
      <td style="text-align:center">×</td>
      <td>具体的すぎると、データを集計しにくくなる。</td>
    </tr>
    <tr>
      <td><code>get_account</code></td>
      <td><code>&lt;アプリケーションの関数名&gt;</code></td>
      <td style="text-align:center">⭕️</td>
      <td>スパン名に ID を命名しない代わりに、スパンの属性に設定するとよい。</td>
    </tr>
    <tr>
      <td><code>get_account/{accountId}</code></td>
      <td><code>&lt;アプリケーションの関数名&gt;/&lt;パラメーター名 (具体的なIDではなく)&gt;</code></td>
      <td style="text-align:center">⭕️</td>
      <td>スパン名に ID を命名しない代わりに、スパンの属性に設定するとよい。い。</td>
    </tr>
  </tbody>
</table>

> - [opentelemetry-specification/specification/trace/api.md at main · open-telemetry/opentelemetry-specification · GitHub](https://github.com/open-telemetry/opentelemetry-specification//blob/main/specification/trace/api.md#span)
> - [Semantic conventions for HTTP spans \| OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/http/http-spans/#name)
> - [Semantic conventions for HTTP spans \| OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/http/http-spans/#http-server-semantic-conventions)
> - https://www.oreilly.com/library/view/distributed-tracing-in/9781492056621/ch04.html

#### ▼ クライアント側の場合

クライアント側では、例えば以下のスパン名をとする。

<table>
  <thead>
    <tr>
      <th>スパン名</th>
      <th>構成</th>
      <th style="text-align:center">良し悪し</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>foo-server get_account/{accountId}</code></td>
      <td><code>&lt;サーバー名&gt; &lt;アプリケーションの関数名&gt;/&lt;パラメーター名 (具体的なIDではなく)&gt;</code></td>
      <td style="text-align:center">⭕️</td>
    </tr>
    <tr>
      <td><code>foo-server GET get_account/{accountId}</code></td>
      <td><code>&lt;サーバー名&gt; &lt;HTTPメソッド名&gt; &lt;アプリケーションの関数名&gt;/&lt;パラメーター名 (具体的なIDではなく)&gt;</code></td>
      <td style="text-align:center">⭕️</td>
    </tr>
    <tr>
      <td><code>foo-db foo-table</code></td>
      <td><code>&lt;DB名&gt; &lt;テーブル名&gt;</code></td>
      <td style="text-align:center">⭕️</td>
    </tr>
  </tbody>
</table>

> - [Medium](https://medium.com/@emmanuel.courreges/jaeger-tracing-and-opentelemetry-usage-guidelines-cdc1fcf48415)
> - https://www.oreilly.com/library/view/distributed-tracing-in/9781492056621/ch04.html

<br>

### スパンの属性

<table>
  <thead>
    <tr>
      <th>領域</th>
      <th>内容</th>
      <th>値</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">バックエンド</td>
      <td>イベントの内容</td>
      <td>トレース ID、スパン ID、親スパン ID、処理の開始時間、処理の所要時間、エラーの有無、マイクロサービスの役割名、コールされたエンドポイントなど</td>
    </tr>
    <tr>
      <td>ラベル</td>
      <td>マイクロサービス名など</td>
    </tr>
  </tbody>
</table>

> - [🔍 可観測性に入門しよう - Speaker Deck](https://speakerdeck.com/hiroki_hasegawa/ke-guan-ce-xing-niru-men-siyou?slide=17)

<br>

### スパンの粒度

スパンの適切な粒度は、マイクロサービスの粒度による。

<table>
  <thead>
    <tr>
      <th>マイクロサービスの粒度</th>
      <th>スパンの粒度</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>境界づけられたコンテキスト</td>
      <td>マイクロサービスごと、関数ごとに</td>
    </tr>
    <tr>
      <td>ルートエンティティ</td>
      <td>マイクロサービスごと</td>
    </tr>
  </tbody>
</table>

<br>

### データポイント化

スパンが持つデータをデータポイントとして集計することにより、メトリクスの元になるデータポイントを収集できる。

<br>

## 04. プロファイル

### プロファイルとは

分散トレースのスパンにハードウェアリソース消費量の情報を加えたもの。

> - [Grafana Pyroscope を用いて Go のアプリケーションで継続的プロファイルしてみた](https://zenn.dev/k6s4i53rx/articles/021a1d65af9e95)
> - [GitHub - google/pprof: pprof is a tool for visualization and analysis of profiling data · GitHub](https://github.com/google/pprof)

<br>
