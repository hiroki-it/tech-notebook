---
title: 【IT技術の知見】分散トレース＠クライアントパッケージ
description: 分散トレース＠クライアントパッケージの知見を記録しています。
---

# 分散トレース＠クライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. TraceProvider

### TraceProviderとは

OpenTelemetryをセットアップし、スパンを作成する機能を提供する。

Goなら、`go.opentelemetry.io/otel/sdk`パッケージからコールできる。

> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace
> - https://christina04.hatenablog.com/entry/opentelemetry-in-go
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=20
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=21

<br>

### スパンの構造

#### ▼ ルートスパン

ルートスパンの構造である。

```yaml
{
  "name": "hello",
  "context": {
      # ルートスパンのトレースID
      "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
      # ルートスパンのスパンID
      "span_id": "0x051581bf3cb55c13",
    },
  # ルートスパンのため、親スパンのスパンIDがない
  "parent_id": null,
  "start_time": "2022-04-29T18:52:58.114201Z",
  "end_time": "2022-04-29T18:52:58.114687Z",
  "attributes": {"http.route": "some_route1"},
  "events":
    [
      {
        "name": "Guten Tag!",
        "timestamp": "2022-04-29T18:52:58.114561Z",
        "attributes": {"event_attributes": 1},
      },
    ],
}
```

> - https://opentelemetry.io/docs/concepts/signals/traces/

#### ▼ 親スパンX

１つ目の親スパンの構造である。

```yaml
{
  "name": "hello-greetings",
  "context": {
      # ルートスパンのトレースID
      "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
      # 親スパンXのスパンID
      "span_id": "0x5fb397be34d26b51",
    },
  # 親スパンXのスパンID (ルートスパンのスパンIDと一致する)
  "parent_id": "0x051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114304Z",
  "end_time": "2022-04-29T22:52:58.114561Z",
  "attributes": {"http.route": "some_route2"},
  "events":
    [
      {
        "name": "hey there!",
        "timestamp": "2022-04-29T18:52:58.114561Z",
        "attributes": {"event_attributes": 1},
      },
      {
        "name": "bye now!",
        "timestamp": "2022-04-29T18:52:58.114585Z",
        "attributes": {"event_attributes": 1},
      },
    ],
}
```

> - https://opentelemetry.io/docs/concepts/signals/traces/

#### ▼ 親スパンY

２つ目の親スパンの構造である。

```yaml
{
  "name": "hello-salutations",
  "context": {
      # ルートスパンのトレースID
      "trace_id": "0x5b8aa5a2d2c872e8321cf37308d69df2",
      # 親スパンYのスパンID
      "span_id": "0x93564f51e1abe1c2",
    },
  # 親スパンYのスパンID (ルートスパンのスパンIDと一致する)
  "parent_id": "0x051581bf3cb55c13",
  "start_time": "2022-04-29T18:52:58.114492Z",
  "end_time": "2022-04-29T18:52:58.114631Z",
  "attributes": {"http.route": "some_route3"},
  "events":
    [
      {
        "name": "hey there!",
        "timestamp": "2022-04-29T18:52:58.114561Z",
        "attributes": {"event_attributes": 1},
      },
    ],
}
```

> - https://opentelemetry.io/docs/concepts/signals/traces/

<br>

### エラー時の事後処理

#### ▼ 未送信スパンの処理

処理の失敗時にSpanProcessor内に未送信なスパンがある場合、これを送信し切ってしまう方が良い。

```go
func NewTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resource),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
    )

	...

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// SpanProcessor内の処理中スパンをExporterに送信する
		if err := traceProvider.ForceFlush(ctx); err != nil {
			log.Printf("failed to trace porvider force flush %v", err)
		}

		...
	}

	return traceProvider, cleanUp, nil
}
```

> - https://christina04.hatenablog.com/entry/opentelemetry-in-go
> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TracerProvider.ForceFlush

#### ▼ ハードウェアリソースの解放

処理の失敗時にハードウェアリソースを確保してしまっている場合、これを解放した方が良い。

```go
func NewTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resource),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
    )

	...

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// 処理に割り当てられていたハードウェアリソースを解放する
		if err := traceProvider.Shutdown(ctx); err != nil {
			log.Printf("failed to shutdown tracer provider %v", err)
		}

		...
	}

	return traceProvider, cleanUp, nil
}
```

> - https://christina04.hatenablog.com/entry/opentelemetry-in-go
> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TracerProvider.Shutdown

<br>

## 02. Exporter

### Exporterとは

スパンの宛先とするスパン収集ツール (例：AWS Distro for opentelemetryコレクター、Google CloudTrace、opentelemetryコレクター、など) を決める処理を持つ。

<br>

### パッケージ

スパンの収集ツールがそれぞれパッケージを提供している。

| 項目                        | 必要なパッケージ                                                                                                                                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goと標準出力                | `go.opentelemetry.io/otel/exporters/stdout/stdouttrace`パッケージからコールできる。otelクライアントはgRPCでopentelemetryコレクター接続する。`go.opentelemetry.io/otel/sdk/export/`パッケージは執筆時点 (2023/09/18時点) で非推奨である。 |
| Goとopentelemetryコレクター | `go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`パッケージからコールできる。                                                                                                                                            |
| GoとJaeger                  | `go.opentelemetry.io/otel/exporters/trace/jaeger`パッケージからコールできる。                                                                                                                                                            |
| GoとX-Ray                   | 一度、opentelemetryコレクター互換のAWS Distro for opentelemetryコレクターに送信する必要があるため、`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`が必要である。                                                       |
| GoとCloud Trace             | `github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace`パッケージからコールできる。                                                                                                                                  |

> - https://zenn.dev/google_cloud_jp/articles/20230516-cloud-run-otel#%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=18
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/CHANGELOG.md#0290---2022-04-11

<br>

### スパン宛先の設定

Goの場合、`WithEndpoint`関数を使用して、スパンの宛先 (例：`127.0.0.1:4317`、`opentelemetry-collector.foo-namespace.svc.cluster.local:4317`、など) を設定する。

<br>

### エラー時の事後処理

<br>

## 02-02. IDGenerator

### IDGeneratorとは

特定の監視バックエンドの形式で、トレースIDまたはスパンIDを作成する。

IDGeneratorを使用しない場合、IDGeneratorはW3C Trace Context仕様に沿ったランダムなIDを作成する。

もしW3C Trace Context仕様以外のランダムなIDがよければ、専用のIDGeneratorを使用する必要がある。

> - https://zenn.dev/avita_blog/articles/d1fb4afd200aa1#tracer-provider%E3%81%AE%E4%BD%9C%E6%88%90

<br>

### IDGeneratorが不要な場合

OpenTelemetryコレクターでExporterを使用する場合、クライアント側ではIDGeneratorを使用する必要はない。

W3C Trace Context仕様でOpenTelemetryコレクターにスパンを送信しさえすれば、OpenTelemetryコレクターはW3C Trace Context仕様からExporterの形式にIDを変換してくれる。

例えば、AWS製OpenTelemetryコレクターはW3C Trace Context仕様をX-Ray仕様に変換する。

> - https://docs.aws.amazon.com/xray/latest/devguide/xray-instrumenting-your-app.html#xray-instrumenting-opentel

<br>

## 02-03. SpanProcessor

### SpanProcessorとは

他の処理コンポーネントを操作する処理を持つ。

<br>

### パッケージ

| 項目 | 必要なパッケージ                                                 |
| ---- | ---------------------------------------------------------------- |
| Go   | `go.opentelemetry.io/otel/sdk/trace`パッケージからコールできる。 |

> - https://opentelemetry-python.readthedocs.io/en/stable/sdk/trace.export.html?highlight=BatchSpanProcessor#opentelemetry.sdk.trace.export.BatchSpanProcessor
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=17

<br>

### スパンの圧縮

Goの場合、`BatchSpanProcessor`関数を使用して、スパンを圧縮する。

<br>

## 02-04. Propagator

### Propagatorとは

![distributed-trace_propagated](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_propagated.png)

コンテキストをアップストリーム側マイクロサービスに伝播させる処理を持つ。

Carrierからコンテキストを注入する操作を『注入 (Inject)』、反対に取り出す操作を『抽出 (Extract) 』という。

<br>

### パッケージ

| 項目                        | 必要なパッケージ                                                                                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goとopentelemetryコレクター | `go.opentelemetry.io/otel/propagation`パッケージからコールできる。                                                                                                                 |
| GoとX-Ray                   | 一度、opentelemetryコレクター互換のAWS Distro for opentelemetryコレクターに送信する必要があるため、`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`が必要である。 |

<br>

### スパンの仕様の設定

Goの場合、`SetTextMapPropagator`関数を使用して、

```go
// クライアント側マイクロサービス
// 前のマイクロサービスにとってはサーバー側にもなる
func newTraceProvider() {

    // 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
    otel.SetTextMapPropagator(
      ...
    )
}
```

```go
// サーバー側マイクロサービス
// 後続のマイクロサービスにとってはクライアント側にもなる
func newTraceProvider() {

    // 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
	otel.SetTextMapPropagator(
      ...
	)
}
```

> - https://zenn.dev/k6s4i53rx/articles/2fa37a293cf228#%E2%96%A0-propagator-%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6
> - https://blog.cybozu.io/entry/2023/04/12/170000
> - https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry
> - https://www.lottohub.jp/posts/otelsql-grpc/
> - https://github.com/openzipkin/b3-propagation#overall-process

<br>

## 02-05. Resource

### Resourceとは

スパンに属性を設定する処理を持つ。

<br>

### パッケージ

| 項目 | 必要なパッケージ                                                |
| ---- | --------------------------------------------------------------- |
| Go   | `go.opentelemetry.io/otel/resource`パッケージからコールできる。 |

例えば、以下の属性を設定できる。

アプリはKubernetesリソースの情報を知らないはずなので、`service.name`、`service.version`、`telemetry.sdk.name`である。

```yaml
{
  "service.name": "foo-service",
  "service.namespace": "<Kubernetes Namespace名>",
  "service.instance.id": "<Kubernetes Pod名>",
  "service.version": "1.0.0",
  "telemetry.sdk.name": "otel",
}
```

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=16
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/semconv/v1.20.0/resource.go#L1772-L1824

<br>

## 02-06. Sampler

### Samplerとは

スパンのサンプリング方式やサンプリング率を設定する処理を持つ。

<br>

### パッケージ

| 項目 | 必要なパッケージ                                                 |
| ---- | ---------------------------------------------------------------- |
| Go   | `go.opentelemetry.io/otel/sdk/trace`パッケージからコールできる。 |

<br>

### サンプリング方式

#### ▼ 場所

サンプリングする場所によって、方式が異なる。

| 方式       | 説明                                                                                                                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Head-based | クライアント側で、スパンをサンプリングする。パフォーマンス (例：CPU、メモリ、スループット) に影響が低いが、エラーリクエストをサンプリングできない。                                                                          |
| Tail-based | サーバー側 (opentelemetryコレクター) で、収集したスパンからサンプリングする (実際は全てをサンプリングすることが多い) 。パフォーマンス (例：CPU、メモリ、スループット) に影響があるが、エラーリクエストもトレーシングできる。 |

> - https://christina04.hatenablog.com/entry/opentelemetry-sampling
> - https://opentelemetry.io/docs/concepts/sampling/

#### ▼ クライアント側のサンプリング率

クライアント側でのサンプリング率を設定する。

Tail-based方式の場合、前提としてアプリケーションで全てのスパンをサンプリングするため、`AlwaysOn`または`TraceIdRationBased=1.0`とする。

ただ、負荷を抑える目的で、一定割合のアプリケーションでサンプリングすることもある。

| 設定                 | 説明                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------- |
| `AlwaysOn`           | 全てのスパンをサンプリングする。本番環境で注意して使用する (非推奨というわけではない)。 |
| `AlwaysOff`          | スパンをサンプリングしない。                                                            |
| `TraceIdRationBased` | 指定した割合でスパンをランダムにサンプリングする。                                      |
| `ParentBased`        | 親スパンの設定を継承する。`TraceIdRationBased`と組み合わせて使用することが多い。        |

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=26
> - https://zenn.dev/ishii1648/articles/167e199bab5396
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.22.0/sdk/trace/sampling.go#L135-L141
> - https://opentelemetry.io/docs/concepts/sampling/#tail-sampling

#### ▼ サーバー側 (opentelemetryコレクター) のサンプリング率

Tail-based方式の場合、opentelemetryコレクターでアプリケーションからの全てのスパンを収集した上で、SpanProcessorでサンプリング率を決める。

```yaml
processors:
  attributes:
    actions:
      - key: collector
        value: otel-collector
        action: insert

  tail_sampling:
    decision_wait: 10s
    num_traces: 10
    policies: [{name: always-sample, type: always_sample}]
```

> - https://zenn.dev/ishii1648/articles/167e199bab5396#processors
> - https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor

<br>

### 環境変数

指定するSamplerやパラメーターを環境変数で設定できる。

| 環境変数名                 | 説明                                                                                                       |     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- | --- |
| `OTEL_SERVICE_NAME`        | Resourceの`service.name`を設定する。                                                                       |     |
| `OTEL_RESOURCE_ATTRIBUTES` | Resourceの任意の属性を設定する。キーバリュー式 (`key1=value1,key2=value2`) で設定できる。                  |     |
| `OTEL_TRACES_EXPORTER`     | Exporterの名前を設定する。執筆時点 (2024/02/06) では、`otlp`、`jaeger`、`zipkin`、`none`、から設定できる。 |     |
| `OTEL_TRACES_SAMPLER`      | 使用するSamplerを設定する。                                                                                |     |
| `OTEL_TRACES_SAMPLER_ARG`  | Samplerのパラメーター (例：サンプリング率) を設定する。                                                    |     |

> - https://opentelemetry.io/docs/languages/sdk-configuration/general/

<br>
