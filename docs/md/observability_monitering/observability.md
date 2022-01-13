# 可観測性

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/md/about.html

<br>

## 01. 可観測性

### 可観測性とは

![observality_and_monitoring](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/observality_and_monitoring.png)

『収集されたデータから、システムにおける想定外の不具合をどれだけ正確に推測できるか』を表す程度のこと。システムの想定内の不具合は『監視』や『テスト』によって検知できるが、想定外のものを検知できない。しかし、可観測性を高めることにより、想定外の不具合を表面化できる。想定外の不具合はインシデントの原因になるため、想定外の不具合の表面化はインシデントの予防につながる。

参考：

- https://blog.thundra.io/observability-driven-development-for-serverless
- https://sookocheff.com/post/architecture/testing-in-production/
- https://www.sentinelone.com/blog/observability-production-systems-why-how/

<br>

### 可観測性を高める方法

#### ・マイクロサービスアーキテクチャの場合

テレメトリーを十分に収集し、これらを紐付けて可視化する必要がある。

#### ・モノリスにおける可観測性

可観測性は、基本的にマイクロサービスアーキテクチャの文脈で語られる。モノリシックでどのようにして可観測性を高めるのかを調査中...（情報が全然見つからない）

<br>

### 発表スライド

<iframe class="speakerdeck-iframe" frameborder="0" src="https://speakerdeck.com/player/bedd6f12302d434886650000ceeba517" title="可観測性に入門しよう" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" style="border: 0px; background: padding-box padding-box rgba(0, 0, 0, 0.1); margin: 0px; padding: 0px; border-radius: 6px; box-shadow: rgba(0, 0, 0, 0.2) 0px 5px 40px; width: 560px; height: 314px;"></iframe>

<br>

## 01-02. テレメトリー

### テレメトリーとは

可観測性を実現するために収集する必要のある3つのデータ要素（『メトリクス』『ログ』『分散トレース』）のこと。NewRelicやDatadogはテレメトリーの要素を全て持つ。また、AWSではCloudWatch（メトリクス＋ログ）とX-Ray（分散トレース）を両方利用すると、これらの要素を満たせたことになり、可観測性を実現できる。

参考：

- https://www.forbes.com/sites/andythurai/2021/02/02/aiops-vs-observability-vs-monitoringwhat-is-the-difference-are-you-using-the-right-one-for-your-enterprise/
- https://knowledge.sakura.ad.jp/26395/

<br>

## 02. メトリクス 

### メトリクスとは

とある分析にて、一定期間に発生した複数のデータポイントの集計値のこと。『平均』『合計』『最小/最大』『平方根』などを用いて、データポイントを集計する。

参考：https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Metric

![metrics_namespace_dimension](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/metrics_namespace_dimension.png)

<br>

### データポイント

#### ・データポイントとは

分析対象から得られる最小単位の数値データのこと。データポイントは、分析ごとに存在している。例えば、とある分析で一分ごとに対象が測定される場合、一分ごとに得られる数値データがデータポイントとなる。一方で、一時間ごとの測定の場合、一時間ごとに得られる数値データがデータポイントである。

参考：

- https://whatis.techtarget.com/definition/data-point
- https://aws.amazon.com/jp/about-aws/whats-new/2017/12/amazon-cloudwatch-alarms-now-alerts-you-when-any-m-out-of-n-metric-datapoints-in-an-interval-are-above-your-threshold/

<br>

### ４大シグナル

#### ・４大シグナルとは

特に重要なメトリクス（トラフィック、レイテンシー、エラー、サチュレーション）のこと。

#### ・トラフィック

サーバー監視対象のメトリクスに属する。

#### ・レイテンシー

サーバー監視対象のメトリクスに属する。

#### ・エラー

サーバー監視対象のメトリクスに属する。

| エラー名         | 説明                                                         |
| ------------ | ------------------------------------------------------------ |
| 明示的エラー | 400/500系のレスポンス                                        |
| 暗黙的エラー | SLOに満たない200/300系のレスポンス、API仕様に合っていないレスポンス |

#### ・サチュレーション

システム利用率（CPU利用率、メモリ理容室、ストレージ利用率、など）の飽和度のこと。例えば、以下の飽和度がある。60～70%で、警告ラインを設けておく必要がある。サーバー監視対象のメトリクスに属する。

<br>

## 03. ログ

### ログとは 

特定の瞬間に発生したイベントが記載されたデータのこと。

参考：https://newrelic.com/jp/blog/how-to-relic/metrics-events-logs-and-traces

<br>

### 構造からみた種類

#### ・非構造化ログ

構造が無く、イベントの値だけが表示されたログのこと。

```log
192.168.0.1 [2021-01-01 12:00:00] GET /foos/1 200 
```

#### ・構造化ログ

イベントの項目名と値の対応関係を持つログのこと。JSON型で表現されるが、拡張子が```json```であるというわけでないことに注意する。

```bash
{
    "client_ip": "192.168.0.1",
    "timestamp": "2021-01-01 12:00:00",
    "method": "GET",
    "url": "/foos/1",
    "status_code": 200
}
```

<br>

### ロギング

#### ・Distributed logging（分散ロギング）

マイクロサービスアーキテクチャの各サービスから収集されたログを、バラバラに分析/管理する方法のこと。

参考：https://www.splunk.com/ja_jp/data-insider/what-is-distributed-tracing.html#centralized-logging

#### ・Centralized logging（集中ロギング）

マイクロサービスアーキテクチャの各サービスから収集されたログを、一元的に分析/管理する方法のこと。

参考：https://www.splunk.com/ja_jp/data-insider/what-is-distributed-tracing.html#centralized-logging

<br>

## 04. 分散トレース

### 分散トレースとは

![distributed-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-trace.png)

マイクロサービスアーキテクチャの複数のサービスから収集されたスパンのセットのこと。スパンを紐付けることによって、異なるサービスを横断する処理を、一繋ぎなものとして認識できるようになる。

参考：

- https://www.dynatrace.com/news/blog/open-observability-part-1-distributed-tracing-and-observability/
- https://docs.newrelic.com/jp/docs/distributed-tracing/concepts/introduction-distributed-tracing/
- https://medium.com/nikeengineering/hit-the-ground-running-with-distributed-tracing-core-concepts-ff5ad47c7058

<br>

### 分散トレースの読み方

![distributed-trace_reading](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/distributed-trace_reading.png)

上から下に読むと、上流サービス（上位スパン）が下流サービス（下位スパン）を処理をコールしていることを確認できる。下から上に読むと、下流サービス（下位スパン）から上流サービス（上位スパン）に結果を返却していることを確認できる。

参考：https://cloud.google.com/architecture/using-distributed-tracing-to-observe-microservice-latency-with-opencensus-and-stackdriver-trace

<br>

### モノリスにおける分散トレース

モノリスなアプリケーションでは、システムが分散していないため、単なるトレースとなる。

参考：https://deepsource.io/blog/distributed-tracing/#monolithic-observability

**＊例＊**

（１）a1：クライアントがリクエストを送信する。

（２）a1：リクエストがロードバランサ－に到達する。

（３）a1～a2：ロードバランサ－で処理が実行される。

（４）a2：ロードバランサ－がリクエストをアプリケーションに転送する。

（５）a2：リクエストがアプリケーションに到達する。

（６）a2～a3：アプリケーションで処理が実行される。

（７）a3：アプリケーションがレスポンスをクライアントに返信する。

![monolith-trace](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/monolith-trace.png)

<br>

### スパン

#### ・スパンとは

マイクロサービスアーキテクチャの特定のサービスで発生したデータのセットのこと。JSON型で定義されることが多い。SaaSツールによってJSON型の構造が異なる。

参考：

- https://opentracing.io/docs/overview/spans/
- https://docs.datadoghq.com/ja/tracing/guide/send_traces_to_agent_by_api/#%E3%83%A2%E3%83%87%E3%83%AB
- https://docs.newrelic.com/jp/docs/distributed-tracing/trace-api/report-new-relic-format-traces-trace-api/#new-relic-guidelines


#### ・スパン間の紐付け

リクエストヘッダーやボディにIDを割り当て、異なるサービスのスパン間を紐付ける。AWSを用いている場合、例えばALBが```X-Amzn-Trace-Id```ヘッダーにリクエストIDを付与してくれるため、アプリケーションでリクエストIDを実装せずに分散トレースを実現できる。

参考：https://docs.aws.amazon.com/ja_jp/elasticloadbalancing/latest/application/load-balancer-request-tracing.html

#### ・データポイント化

スパンが持つデータをデータポイントとして集計することにより、メトリクスを収集できる。
