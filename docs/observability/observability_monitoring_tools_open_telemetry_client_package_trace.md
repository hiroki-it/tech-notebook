---
title: 【IT技術の知見】分散トレース＠クライアントパッケージ
description: 分散トレース＠クライアントパッケージの知見を記録しています。
---

# 分散トレース＠クライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. TracerProvider

### TracerProviderとは

OpenTelemetryをセットアップし、スパンを作成する機能を提供する。

Goなら、`go.opentelemetry.io/otel/sdk`パッケージからコールできる。

`NewTracerProvider`関数に分散トレースのオプションを渡す。

```go
func InitTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

	tracerProvider := sdktrace.New(
		// Exporterを設定する
		sdktrace.WithBatcher(exporter),
		// Resourceを設定する
		sdktrace.WithResource(resourceWithAttributes),
		// Samplerを設定する
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		// Span Processorを設定する
		sdktrace.WithSpanProcessor(batchSpanProcessor),
    )

    tracerProvider := sdktrace.New(options...)

    ...

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
        // Composit Propagatorを設定する
        propagator
    )

    propagatorList := propagator.Fields()

    sort.Strings(propagatorList)

    // ログにpropagator名を出力しておく
    log.Printf("Info: Propagator %v initialize successfully", propagatorList)

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
            5 * time.Second,
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// Span Processor内の処理中スパンをExporterに送信する
        // @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#forceflush
		if err := tracerProvider.ForceFlush(ctx); err != nil {
			log.Printf("Failed to force flush trace provider %v", err)
			return
		}

		log.Print("Info: Trace provider shutdown successfully")
	}

    log.Print("Info: Tracer provider initialize successfully")

	return cleanUp, nil
}
```

```go
package main

func main()  {

    cleanUp, nil := InitTracerProvider()
    defer cleanUp()

    ...
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace
> - https://christina04.hatenablog.com/entry/opentelemetry-in-go
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=20
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=21

<br>

### TracerProviderOption

分散トレースのオプションを持つ`TracerProviderOption`構造体を別に作成し、TracerProviderに渡してもよい。

```go
func InitTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

	options := []trace.TracerProviderOption{
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	}

	tracerProvider := sdktrace.New(options...)

    ...

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
        // Composit Propagatorを設定する
        propagator
    )

    propagatorList := propagator.Fields()

    sort.Strings(propagatorList)

    // ログにpropagator名を出力しておく
    log.Printf("Info: Propagator %v initialize successfully", propagatorList)

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5 * time.Second
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// Span Processor内の処理中スパンをExporterに送信する
        // @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#forceflush
		if err := tracerProvider.ForceFlush(ctx); err != nil {
			log.Printf("Failed to force flush trace provider %v", err)
			return
		}

        log.Print("Info: Trace provider shutdown successfully")
	}

    log.Print("Info: Tracer provider initialize successfully")

	return cleanUp, nil
}
```

```go
package main

func main()  {

    cleanUp, nil := InitTracerProvider()
    defer cleanUp()

    ...
}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.24.0/sdk/trace/provider.go#L37-L56

<br>

### 分散トレースの無効化

#### ▼ TracerProviderを実行しない

一番単純な方法として、スパンを作成しない場合は、TracerProviderのセットアップをコールしないことである。

以下のように条件分岐を実装する。

```go
package main

import (
	"os"
)

func main() {

	...

	traceEnabled := os.Getenv("TRACE_ENABLED")

	// TRACE_ENABLEDが有効になっている場合に、分散トレースのスパンを作成する
	if traceEnabled {
        // TracerProviderに関する一連の処理
	}

	...

}
```

マイクロサービスで使用するConfigMapにて、分散トレースの有効化を実行環境別に切り替えられるようにするとよい。

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: foo-app
  env: tes
data:
  # テスト環境では分散トレースを無効化する
  TRACE_ENABLED: "false"
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: foo-app
  env: stg
data:
  # ステージング環境では分散トレースを無効化する
  TRACE_ENABLED: "true"
---
kind: ConfigMap
apiVersion: v1
metadata:
  name: foo-app
  env: prd
data:
  # 本番環境では分散トレースを無効化する
  TRACE_ENABLED: "true"
```

> - https://github.com/open-telemetry/opentelemetry-go/discussions/2659#discussioncomment-2307300

#### ▼ NoopTracerProviderを使用する

TracerProviderのデフォルト値である。

多くの言語で、TracerProviderのインターフェースの実装である。

また、TracerProviderを意図的に無効化したい場合 (分散トレースが不要な開発環境) にも役立つが、SDK固有の一部のメソッド (`ForceFlush`関数) がある場合は使用できない。

Go (`v1.20`) から`go.opentelemetry.io/otel/trace/noop`に移動したため、アップグレード時はパッケージを変更する必要がある。

```go
type TracerProvider interface {
	...
}

type noopTracerProvider struct{
	embedded.TracerProvider
}
```

> - https://github.com/open-telemetry/community/discussions/1048#discussioncomment-5052458
> - https://pkg.go.dev/go.opentelemetry.io/otel/trace@v1.24.0/noop#NewTracerProvider
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/trace/noop.go#L35

#### ▼ Samplerを無効化する

開発環境では、分散トレースを実施したくない。

`NeverSample`関数を使用し、スパンの作成を無効化するとよい。

TracerProviderの初期化処理はそのままで、スパンの作成のみを無効化できる。

```go
package trace

import (
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.20.0"
)

// newTracerProvider TracerProviderを作成する
func newTracerProvider(exporter sdktrace.SpanExporter) *sdktrace.TracerProvider {

	resourceWithAttributes := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName("<マイクロサービス名>"),
		semconv.String("system.name", "<システム名>"),
		semconv.String("environment", "<実行環境名>"),
	)

	// TRACE_ENABLEDが有効かどうかで、返却されるSamplerが切り替わる
	sampler := newSampler()

	// BatchSpanProcessorで複数のスパンを圧縮し、送信サイズを小さくする
	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// OpenTelemetry CollectorでW3C形式からX-Ray形式にIDを変換できるため、ここではW3C形式でIDを作成する
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSampler(sampler),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

	return tracerProvider
}

// newSampler Samplerを作成する
func newSampler() sdktrace.Sampler {

    // 開発環境では、TRACE_ENABLED=falseとする
	traceEnabled := os.Getenv("TRACE_ENABLED")

	// TRACE_ENABLEDを無効化している場合
	if !traceEnabled {
        // NeverSampleを実行し、スパンを作成しない
		return sdktrace.NeverSample()
	}

    // ParentBased Samplerを返却する
	// Tail-based方式のサンプリングを採用し、クライアント側のサンプリング率は推奨値の100%とする
	return sdktrace.ParentBased(sdktrace.TraceIDRatioBased(1.0))
}

```

> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#NeverSample
> - https://github.com/open-telemetry/community/discussions/1048#discussioncomment-2678508
> - https://stackoverflow.com/a/75901212

#### ▼ `OTEL_SDK_DISABLED`を有効化する

`OTEL_SDK_DISABLED`を有効化すると、実装をそのままで分散トレースを無効化できる。

ただし、言語 (例：Go) によってはサポートしていない場合がある。

> - https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#general-sdk-configuration
> - https://github.com/open-telemetry/opentelemetry-go/issues/3559
> - https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#environment-variables

<br>

## 01-02. スパンの作成

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

### Spanステータス

#### ▼ Spanステータスとは

Spanに紐づく処理の成否を表す。

#### ▼ Unset

スパンに対応する処理が成功したことを表す。

> - https://opentelemetry.io/docs/concepts/signals/traces/#span-status

#### ▼ Error

スパンに対応する処理が失敗したことを表す。

> - https://opentelemetry.io/docs/concepts/signals/traces/#span-status

#### ▼ Ok

スパンに対応する処理を成功したと強制的にみなすことを表す。

成功以外にしたくない場合に使用する。

> - https://opentelemetry.io/docs/concepts/signals/traces/#span-status

<br>

### Span種別

#### ▼ Span種別とは

スパンの作成場所の種類を表す。

#### ▼ Unspecified

種類がないことを表す。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	...

	foo()

	...
}

func foo()  {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
		trace.WithSpanKind(0),
	)

	defer span.End()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanKind

#### ▼ Internal

アプリケーションの内部処理に関する情報を持つ。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	...

	foo()

	...
}

func foo()  {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
		trace.WithSpanKind(1),
	)

	defer span.End()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanKind

#### ▼ Server

クライアントからのリクエストの受信処理に関する情報を持つ。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	...

	foo()

	...
}

func foo()  {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
		trace.WithSpanKind(2),
	)

	defer span.End()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanKind

#### ▼ Client

サーバーへのリクエストの送信処理に関する情報を持つ。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	...

	foo()

	...
}

func foo()  {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
		trace.WithSpanKind(3),
	)

	defer span.End()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanKind

#### ▼ Producer

パブリッシャー (プロデューサー) からのメッセージの受信処理に関する情報を持つ。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	...

	foo()

	...
}

func foo()  {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
		trace.WithSpanKind(4),
	)

	defer span.End()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanKind

#### ▼ Consumer

コンシューマー (サブスクライバー) からのメッセージの送信処理に関する情報を持つ。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	...

	foo()

	...
}

func foo()  {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
		trace.WithSpanKind(5),
	)

	defer span.End()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanKind

<br>

### Spanイベント

#### ▼ Spanイベントとは

スパンの処理時間中の特定時点のイベントを表す。

> - https://opentelemetry.io/docs/languages/go/instrumentation/#events
> - https://blog.cybozu.io/entry/2023/04/12/170000

<br>

## 01-03. エラー時の事後処理

### 自前のエラーの使用

TracerProviderがスローするエラーを自前のエラーに変更する。

```go
package main

import (
	"error"
	"fmt"

	"go.opentelemetry.io/otel"
)

type ErrorHandler interface {
  Handle(err error)
}

type IgnoreExporterErrorsHandler struct{}

func Handler() ErrorHandler

func (IgnoreExporterErrorsHandler) Handle(err error) {

	switch err.(type) {
	// SpanExporterのエラーの場合は何もしない
	case *SpanExporterError:

	default:
		fmt.Println(err)
	}
}

func main() {

	...

	otel.SetErrorHandler(IgnoreExporterErrorsHandler{})

	...
}
```

> - https://opentelemetry.io/docs/specs/otel/error-handling/#configuring-error-handlers

<br>

### 未送信スパンの送信

処理の失敗時にSpan Processor内に未送信なスパンがある場合、これを送信し切ってしまう方が良い。

```go
func InitTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

	tracerProvider := sdktrace.New(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
        sdktrace.WithSpanProcessor(batchSpanProcessor),
    )

    ...

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
        // Composit Propagatorを設定する
        propagator
    )

    propagatorList := propagator.Fields()

    sort.Strings(propagatorList)

    // ログにpropagator名を出力しておく
    log.Printf("Info: Propagator %v initialize successfully", propagatorList)

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5 * time.Second
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// Span Processor内の処理中スパンをExporterに送信する
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#forceflush
		if err := tracerProvider.ForceFlush(ctx); err != nil {
			log.Printf("Failed to force flush trace provider %v", err)
			return
		}

        log.Print("Info: Trace provider shutdown successfully")
    }

    log.Print("Info: Tracer provider initialize successfully")

	return cleanUp, nil
}
```

```go
package main

func main()  {

    cleanUp, nil := InitTracerProvider()
    defer cleanUp()

    ...
}
```

> - https://opentelemetry.io/docs/specs/otel/trace/sdk/#forceflush
> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TracerProvider.ForceFlush
> - https://christina04.hatenablog.com/entry/opentelemetry-in-go

<br>

### Graceful Shutdown処理

TracerProviderは、Graceful Shutdown処理を実行するための関数を持っている。

処理の失敗時にGraceful Shutdown処理を実行する。

これにより、例えば確保しているハードウェアリソースを解放できる。

なお、TracerProviderでGraceful Shutdown処理を実行すれば、ExporterやSpan Processorも連鎖的にGraceful Shutdownできる。

```go
func InitTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

	tracerProvider := sdktrace.New(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
    )

    ...

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
        // Composit Propagatorを設定する
        propagator
    )

    propagatorList := propagator.Fields()

    sort.Strings(propagatorList)

    // ログにpropagator名を出力しておく
    log.Printf("Info: Propagator %v initialize successfully", propagatorList)

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5 * time.Second
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// TracerProviderを安全にシャットダウンする
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
		if err := tracerProvider.Shutdown(ctx); err != nil {
			log.Printf("Failed to shutdown tracer provider %v", err)
			return
		}

        log.Print("Info: Trace provider shutdown successfully")
    }

    log.Print("Info: Tracer provider initialize successfully")

	return cleanUp, nil
}
```

```go
package main

func main()  {

    cleanUp, nil := InitTracerProvider()
    defer cleanUp()

    ...
}
```

> - https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#TracerProvider.Shutdown
> - https://christina04.hatenablog.com/entry/opentelemetry-collector

<br>

## 02. Exporter

### Exporterとは

スパンの宛先とするスパン収集ツール (例：AWS Distro for OpenTelemetry Collector、Google Cloud Trace、OpenTelemetry Collectorなど) を決める処理を持つ。

<br>

### Exporterの種類

#### ▼ Stdout Exporter

標準出力をスパンの宛先とする。

例えばGoの場合、`go.opentelemetry.io/otel/exporters/stdout/stdouttrace`パッケージからコールできる。

`go.opentelemetry.io/otel/sdk/export/`パッケージは執筆時点 (2023/09/18時点) で非推奨である。

#### ▼ OTLP HTTP Exporter

OpenTelemetry Collectorをスパンの宛先とし、HTTPでOpenTelemetry Collector接続する。

例えばGoの場合、`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`パッケージからコールできる。

#### ▼ OTLP gRPC Exporter

OpenTelemetry Collectorをスパンの宛先とし、gRPCでOpenTelemetry Collector接続する。

gRPCクライアントとして、gRPCサーバーに接続可能なアプリケーションで使用できる。

例えばGoの場合、`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`パッケージからコールできる。

#### ▼ Jaeger Exporter

Jaegerをスパンの宛先とする。

例えばGoの場合、`go.opentelemetry.io/otel/exporters/trace/jaeger`パッケージからコールできる。

#### ▼ AWS X-Ray Exporter

AWS X-Rayをスパンの宛先とする。

#### ▼ Google Cloud Trace Exporter

Google Cloud Traceをスパンの宛先とする。

例えばGoの場合、`github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace`パッケージからコールできる。

> - https://zenn.dev/google_cloud_jp/articles/20230516-cloud-run-otel#%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/CHANGELOG.md#0290---2022-04-11

<br>

### スパン宛先の設定

Goの場合、`WithEndpoint`関数を使用して、スパンの宛先 (例：`127.0.0.1:4317`、`opentelemetry-collector.foo-namespace.svc.cluster.local:4317`など) を設定する。

<br>

### エラー時の事後処理

#### ▼ 未送信スパンの送信

> - https://opentelemetry.io/docs/specs/otel/trace/sdk/#forceflush-2

#### ▼ Graceful Shutdown処理

Exporterは、Graceful Shutdown処理を実行するための関数を持っている。

なお、TracerProviderでGraceful Shutdown処理を実行すれば、Exporterも連鎖的にGraceful Shutdownできる。

```go
func InitTracerProvider(serviceName string) (*sdktrace.TracerProvider, func(), error) {

	...

    exporter, err := NewGrpcExporter(ctx)

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
        // Composit Propagatorを設定する
        propagator
    )

    propagatorList := propagator.Fields()

    sort.Strings(propagatorList)

    // ログにpropagator名を出力しておく
    log.Printf("Info: Propagator %v initialize successfully", propagatorList)

	cleanUp := func() {

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5 * time.Second
        )

		// タイムアウトの場合に処理を中断する
		defer cancel()

		// TracerProviderを安全にシャットダウンする
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
		if err := exporter.Shutdown(ctx); err != nil {
			log.Printf("Failed to shutdown exporter: %v", err)
			return
        }

        log.Print("Info: Trace provider shutdown successfully")
    }

    log.Print("Info: Tracer provider initialize successfully")

	return cleanUp, nil
}

func NewGrpcExporter(ctx context.Context) (*otlptrace.Exporter, error) {

	conn, err := grpc.DialContext(
		ctx,
		// gRPCでOpenTelemetry Collectorに接続する
		"foo-opentelemetry-collector.foo-namespace.svc.cluster.local:4317",
		// 通信は非TLSとする
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		// 接続を確立できるまで待機する
		grpc.WithBlock(),
	)

	if err != nil {
		log.Printf("Failed to create gRPC connection: %v", err)
		return nil, err
	}

	return otlptracegrpc.New(
		ctx,
		otlptracegrpc.WithGRPCConn(conn),
	)
}
```

```go
package main

func main()  {

    cleanUp, nil := InitTracerProvider()
    defer cleanUp()

    ...
}
```

> - https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown-2
> - https://christina04.hatenablog.com/entry/opentelemetry-collector

<br>

## 03. ID Generator

### ID Generatorとは

特定の監視バックエンドの形式で、トレースIDやスパンIDを作成する。

ID Generatorを使用しない場合、ID GeneratorはW3C Trace Context仕様に沿ったランダムなIDを作成する。

もしW3C Trace Context仕様以外のランダムなIDがよければ、専用のID Generatorを使用する必要がある。

> - https://zenn.dev/avita_blog/articles/d1fb4afd200aa1#tracer-provider%E3%81%AE%E4%BD%9C%E6%88%90

<br>

### X-Ray仕様

X-Ray仕様のトレースIDやスパンIDを作成する。

```go
package main

func main()  {

	...

	tp := sdkTrace.NewTracerProvider(
		sdktrace.WithIDGenerator(xray.NewIDGenerator()),
	)

	...

}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/propagators/aws/xray

<br>

## 04. Span Processor

### Span Processorとは

他の処理コンポーネントを操作する処理を持つ。

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=17

<br>

### Span Processorの種類

#### ▼ Batch Span Processor

テレメトリーファイルを圧縮するバッチ処理を実行し、送信サイズを小さくした上でExporterに渡す。

Exporterがまとめてスパンを送信できるようになるため、スパンの送信でスループットを高められる。

Goの場合、`BatchSpanProcessor`関数を使用する。

> - https://opentelemetry.io/docs/languages/java/instrumentation/#span-processor

#### ▼ Simple Span Processor

テレメトリーファイルをそのままExporterに渡す。

> - https://opentelemetry.io/docs/languages/java/instrumentation/#span-processor

<br>

### エラー時の事後処理

#### ▼ 未送信スパンの送信

> - https://opentelemetry.io/docs/specs/otel/trace/sdk/#forceflush-1

#### ▼ Graceful Shutdown処理

Span Processorは、Graceful Shutdown処理を実行するための関数を持っている。

なお、TracerProviderでGraceful Shutdown処理を実行すれば、Span Processorも連鎖的にGraceful Shutdownできる。

> - https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown-1
> - https://pkg.go.dev/go.opentelemetry.io/otel/sdk/trace#SpanProcessor
> - https://christina04.hatenablog.com/entry/opentelemetry-collector

<br>

## 05. Propagator

### Propagatorとは

トレースコンテキストを宛先マイクロサービスに伝播させる処理を持つ。

Carrierからトレースコンテキストを注入する操作を『注入 (Inject) 』、反対に取り出す操作を『抽出 (Extract) 』という。

![distributed-trace_propagated](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_propagated.png)

<br>

### Composite Propagator

複数のPropagatorを持ち、マイクロサービス上での要求に応じて、Propagatorを動的に切り替えられる。

> - https://opentelemetry.io/docs/specs/otel/context/api-propagators/#composite-propagator

<br>

### 注入/抽出

#### ▼ W3 Trace Contextの場合

```go
func (tc TraceContext) Inject(ctx context.Context, carrier TextMapCarrier) {

	sc := trace.SpanContextFromContext(ctx)
	if !sc.IsValid() {
		return
	}

	if ts := sc.TraceState().String(); ts != "" {
		carrier.Set(tracestateHeader, ts)
	}

	flags := sc.TraceFlags() & trace.FlagsSampled

	// 仕様に沿ったトレースコンテキストを作成する
	var sb strings.Builder
	sb.Grow(2 + 32 + 16 + 2 + 3)
	_, _ = sb.WriteString(versionPart)
	traceID := sc.TraceID()
	spanID := sc.SpanID()
	flagByte := [1]byte{byte(flags)}
	var buf [32]byte
	for _, src := range [][]byte{traceID[:], spanID[:], flagByte[:]} {
		_ = sb.WriteByte(delimiter[0])
		n := hex.Encode(buf[:], src)
		_, _ = sb.Write(buf[:n])
	}

	// Carrierにトレースコンテキストを設定する
	carrier.Set(traceparentHeader, sb.String())
}
```

```go
func (tc TraceContext) Extract(ctx context.Context, carrier TextMapCarrier) context.Context {

    // Carrierからトレースコンテキストを取得する
    sc := tc.extract(carrier)
	if !sc.IsValid() {
		return ctx
	}
	return trace.ContextWithRemoteSpanContext(ctx, sc)
}

func (tc TraceContext) extract(carrier TextMapCarrier) trace.SpanContext {
	h := carrier.Get(traceparentHeader)
	if h == "" {
		return trace.SpanContext{}
	}

	var ver [1]byte
	if !extractPart(ver[:], &h, 2) {
		return trace.SpanContext{}
	}
	version := int(ver[0])
	if version > maxVersion {
		return trace.SpanContext{}
	}

	var scc trace.SpanContextConfig
	if !extractPart(scc.TraceID[:], &h, 32) {
		return trace.SpanContext{}
	}
	if !extractPart(scc.SpanID[:], &h, 16) {
		return trace.SpanContext{}
	}

	var opts [1]byte
	if !extractPart(opts[:], &h, 2) {
		return trace.SpanContext{}
	}
	if version == 0 && (h != "" || opts[0] > 2) {
		return trace.SpanContext{}
	}

	scc.TraceFlags = trace.TraceFlags(opts[0]) & trace.FlagsSampled
	scc.TraceState, _ = trace.ParseTraceState(carrier.Get(tracestateHeader))
	scc.Remote = true

	sc := trace.NewSpanContext(scc)
	if !sc.IsValid() {
		return trace.SpanContext{}
	}

	return sc
}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/propagation/trace_context.go

<br>

## 05-02. トレースコンテキスト仕様

### トレースコンテキスト仕様の種類

#### ▼ OpenTelemetry

OpenTelemetryが定めるトレースコンテキスト仕様である。

例えばGoの場合、`go.opentelemetry.io/otel/propagation`パッケージからコールできる。

#### ▼ X-Ray

X-Rayが定めるトレースコンテキスト仕様である。

<br>

### トレースコンテキスト仕様の設定

いずれのトレースコンテキスト仕様を使用するかをクライアント側とサーバー側の両方で設定する必要がある。

例えばGoの場合、`SetTextMapPropagator`関数を使用してトレースコンテキスト仕様を設定する。

```go
// クライアント側マイクロサービス
// 前のマイクロサービスにとってはサーバー側にもなる
func NewTracerProvider() {

    // 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
    otel.SetTextMapPropagator(
      ...
    )
}
```

```go
// サーバー側マイクロサービス
// 宛先マイクロサービスにとってはクライアント側にもなる
func NewTracerProvider() {

    // 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
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

## 06. Resource

### Resourceとは

スパンに属性を設定する処理を持つ。

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=16

<br>

### Resourceの種類

#### ▼ HTTP/gRPCリクエストの場合

デフォルトで、さまざまな属性を持っている。

例えばGoであれば、`go.opentelemetry.io/otel/resource`パッケージからコールできる。

有益な属性として、以下がある。

分散トレースの監視バックエンド (例：X-Ray) 上では、キー名は`otel.resource.<属性名>`になる。

```yaml
{
  "service.name": "<マイクロサービス名>",
  "service.version": "<バージョンタグ>",
  "deployment.environment": "<実行環境名>",
  ...,
}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/semconv/v1.20.0/resource.go

#### ▼ DBクエリの場合

デフォルトで、さまざまな属性を持っている。

```yaml
{
  "db.rows_affected": "<処理したレコード数>"
  "db.sql.table": "<テーブル名>",
  ...
}
```

<br>

## 07. Sampler

### Samplerとは

スパンのサンプリング方式やサンプリング率を設定する処理を持つ。

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=19

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
| Tail-based | サーバー側 (OpenTelemetry Collector) で、収集したスパンからサンプリングする (実際は全てをサンプリングすることが多い) 。パフォーマンス (例：CPU、メモリ、スループット) に影響があるが、エラーリクエストもトレーシングできる。 |

> - https://christina04.hatenablog.com/entry/opentelemetry-sampling
> - https://opentelemetry.io/docs/concepts/sampling/

#### ▼ クライアント側のサンプリング率

クライアント側でのサンプリング率を設定する。

Tail-based方式の場合、前提としてアプリケーションで全てのスパンをサンプリングするため、サンプリング率は`100`% (`AlwaysOn`または`TraceIdRationBased=1.0`) が推奨である。

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

#### ▼ サーバー側 (OpenTelemetry Collector) のサンプリング率

Tail-based方式の場合、OpenTelemetry Collectorでアプリケーションからの全てのスパンを収集した上で、Span Processorでサンプリング率を決める。

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

## 08. 環境変数

### 一覧

OpenTelemetryの仕様では、あるべき環境変数が決まっている。

ただ、言語によって開発状況が異なり、使えない環境変数がある。

> - https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md#environment-variables

### 共通

指定するSamplerやパラメーターを環境変数で設定できる。

| 環境変数                   | 説明                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `OTEL_LOGS_EXPORTER`       | ログのExporter名を設定する。                                                                                                      |
| `OTEL_METRICS_EXPORTER`    | メトリクスのExporter名を設定する。執筆時点 (2024/02/06) では、`otlp` (HTTP/gRPC) 、`prometheus`、`none`、から設定できる。         |
| `OTEL_PROPAGATORS`         | トレースコンテキスト仕様を設定する。                                                                                              |
| `OTEL_SERVICE_NAME`        | Resourceの`service.name`を設定する。                                                                                              |
| `OTEL_RESOURCE_ATTRIBUTES` | Resourceの任意の属性を設定する。キーバリュー式 (`key1=value1,key2=value2`) で設定できる。                                         |
| `OTEL_TRACES_EXPORTER`     | 分散トレースのExporter名を設定する。執筆時点 (2024/02/06) では、`otlp` (HTTP/gRPC) 、`jaeger`、`zipkin`、`none`、から設定できる。 |
| `OTEL_TRACES_SAMPLER`      | 使用するSamplerを設定する。                                                                                                       |
| `OTEL_TRACES_SAMPLER_ARG`  | Samplerのパラメーター (例：サンプリング率) を設定する。                                                                           |

> - https://opentelemetry.io/docs/languages/sdk-configuration/general/

<br>

### Exporter

| 環境変数                              | 説明 |
| ------------------------------------- | ---- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`         |      |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`  |      |
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` |      |
| `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`    |      |
| `OTEL_EXPORTER_OTLP_HEADERS`          |      |
| `OTEL_EXPORTER_OTLP_TRACES_HEADERS`   |      |
| `OTEL_EXPORTER_OTLP_METRICS_HEADERS`  |      |
| `OTEL_EXPORTER_OTLP_LOGS_HEADERS`     |      |
| `OTEL_EXPORTER_OTLP_TIMEOUT`          |      |
| `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`   |      |
| `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`  |      |
| `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`     |      |
| `OTEL_EXPORTER_OTLP_PROTOCOL`         |      |
| `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`  |      |
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL` |      |

> - https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/

<br>
