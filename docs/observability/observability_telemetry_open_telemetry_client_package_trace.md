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

### TraceProviderの処理の要素

#### ▼ Exporter

スパンの宛先とするスパン収集ツール (例：AWS Distro for otelコレクター、Google CloudTrace、otelコレクター、など) を決める処理を持つ。

具体的には、`WithEndpoint`関数を使用して、宛先 (例：`localhost:4317`、`opentelemetry-collector.tracing.svc.cluster.local`、など) を設定できる。

スパンの収集ツールがそれぞれパッケージを提供している。

| 項目               | 必要なパッケージ                                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goと標準出力       | `go.opentelemetry.io/otel/exporters/stdout/stdouttrace`パッケージからコールできる。otelクライアントはgRPCでotelコレクター接続する。`go.opentelemetry.io/otel/sdk/export/`パッケージは執筆時点 (2023/09/18時点) で非推奨である。 |
| Goとotelコレクター | `go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`パッケージからコールできる。                                                                                                                                   |
| GoとJaeger         | `go.opentelemetry.io/otel/exporters/trace/jaeger`パッケージからコールできる。                                                                                                                                                   |
| GoとX-ray          | 一度、otelコレクター互換のAWS Distro for otelコレクターに送信する必要があるため、`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`が必要である。                                                                |
| GoとCloud Trace    | `github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace`パッケージからコールできる。                                                                                                                         |

> - https://zenn.dev/google_cloud_jp/articles/20230516-cloud-run-otel#%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=18
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/CHANGELOG.md#0290---2022-04-11

#### ▼ IDGenerator

特定の監視バックエンドの形式で、トレースIDまたはスパンIDを作成する。

IDGeneratorを使用しない場合、IDGeneratorはotel形式のランダムなIDを作成する。

もしotel形式以外のランダムなIDがよければ、専用のIDGeneratorを使用する必要がある。

> - https://zenn.dev/avita_blog/articles/d1fb4afd200aa1#tracer-provider%E3%81%AE%E4%BD%9C%E6%88%90

#### ▼ SpanProcessor

他の処理コンポーネントを操作する処理を持つ。

具体的には、`BatchSpanProcessor`関数を使用して、スパンをExporterで決めた宛先に送信できる。

| 項目 | 必要なパッケージ                                                 |
| ---- | ---------------------------------------------------------------- |
| Go   | `go.opentelemetry.io/otel/sdk/trace`パッケージからコールできる。 |

> - https://opentelemetry-python.readthedocs.io/en/stable/sdk/trace.export.html?highlight=BatchSpanProcessor#opentelemetry.sdk.trace.export.BatchSpanProcessor
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=17

#### ▼ Propagator

![distributed-trace_propagated](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/distributed-trace_propagated.png)

コンテキストをアップストリーム側マイクロサービスに伝播させる処理を持つ。

Carrierからコンテキストを注入する操作を『注入 (Inject)』、反対に取り出す操作を『抽出 (Extract) 』という。

| 項目               | 必要なパッケージ                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Goとotelコレクター | `go.opentelemetry.io/otel/propagation`パッケージからコールできる。                                                                                               |
| GoとX-ray          | 一度、otelコレクター互換のAWS Distro for otelコレクターに送信する必要があるため、`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc`が必要である。 |

```go
// クライアント側マイクロサービス
// 前のマイクロサービスにとってはサーバー側にもなる
func initProvider() {

    // 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
    otel.SetTextMapPropagator(
      ...
    )
}
```

```go
// サーバー側マイクロサービス
// 後続のマイクロサービスにとってはクライアント側にもなる
func initProvider() {

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

#### ▼ Resource

スパンにコンテキストを設定する処理を持つ。

| 項目 | 必要なパッケージ                                                |
| ---- | --------------------------------------------------------------- |
| Go   | `go.opentelemetry.io/otel/resource`パッケージからコールできる。 |

```yaml
{
  "service.name": "foo-service",
  "service.namespace": "app",
  "service.instance.id": "<Pod名>",
  "service.version": "1.0.0",
  "telemetry.sdk.name": "otel",
}
```

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=16

#### ▼ Sampler

スパンのサンプリング率を設定する処理を持つ。

具体的には、`AlwaysOn` (`100`%) や`TraceIdRationBased` (任意の割合) でサンプリング率を設定できる。

| 項目 | 必要なパッケージ                                                 |
| ---- | ---------------------------------------------------------------- |
| Go   | `go.opentelemetry.io/otel/sdk/trace`パッケージからコールできる。 |

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=19
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=26

<br>

## 02. Goの場合

### otelクライアントパッケージ

#### ▼ Exporter

> - https://github.com/open-telemetry/opentelemetry-go/tree/v1.18.0/exporters

#### ▼ Propagator

> - https://github.com/open-telemetry/opentelemetry-go/tree/v1.18.0/propagation

<br>

### 拡張otelクライアントパッケージ

#### ▼ 拡張otelクライアントパッケージ

標準のotelクライアントパッケージと外部ツールを連携しやすいようにしたパッケージを提供する。

#### ▼ Exporter

> - https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.18.0/exporters

#### ▼ Propagator

標準のotelクライアントパッケージが宛先として持たないスパン収集ツール (例：AWS Distro for otelコレクター) を、使用できるようになる。

> - https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.18.0/propagators

<br>

### 分散トレースSDK

#### ▼ 分散トレースSDK

分散トレース収集ツールが、独自のパッケージを提供している場合がある。

拡張otelクライアントパッケージとは異なり、対象のスパン収集ツールにスパンを送信するためだけのパッケージである。

#### ▼ AWS Distro for otelコレクター

> - https://github.com/aws/aws-xray-sdk-go
> - https://github.com/aws-samples/aws-xray-sdk-go-sample

#### ▼ Google CloudTrace

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go

<br>

## 02-02. アプリでgRPCを使わない場合

### 宛先が標準出力の場合

#### ▼ パッケージの初期化

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

otelクライアントパッケージを初期化する。

初期化の段階で、コンテキストの伝播処理も実行する。

```go
package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(shutdownTimeout time.Duration) (func(), error) {

	// スパンの宛先として、標準出力を設定する。
	exporter := stdouttrace.New(
		stdouttrace.WithPrettyPrint(),
		stdouttrace.WithWriter(os.Stderr),
	)

	// マイクロサービスの属性情報を設定する。
	attributes := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceNameKey.String("foo-service"),
		semconv.ServiceVersionKey.String("1.0.0"),
	)

	// TraceProviderを作成する
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(attributes),
	)

	// パッケージをセットアップする。
	otel.SetTracerProvider(tracerProvider)

	// ダウンストリーム側マイクロサービスからコンテキストを抽出し、アップストリーム側マイクロサービスのリクエストにコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
		// W3C Trace Context仕様のコンテキストを伝播するためPropagatorを設定する
        propagation.TraceContext{},
    )

	// アップストリーム側マイクロサービスへのリクエストがタイムアウトだった場合に、分散トレースを削除する。
	cleanUp := func() {

		// タイムアウト時間設定済みのコンテキストを作成する
		ctx, cancel := context.WithTimeout(
            context.Background(),
            5 * time.Second,
        )

        defer cancel()

        if err := tracerProvider.Shutdown(ctx); err != nil {
			log.Printf("Failed to shutdown tracer provider: %v", err)
		}
	}

	return cleanUp, nil
}
```

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=12

#### ▼ 親スパン作成

親スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"github.com/hiroki-hasegawa/infrastructure/tracer"
)

func httpRequest(ctx context.Context) error {

	var span trace.Span
	// 現在の処理からコンテキストを取得する。
    // 変数にすでにコンテキストが注入されていないので、親スパンが作成される
	ctx, span = otel.Tracer("example.com/foo-service").Start(ctx, "foo")

	defer span.End()

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet, "https://example.com",
		http.NoBody,
	)

	if err != nil {
		return err
	}

	// リクエストの送信元マイクロサービスがわかるようにする。
	req.Header.Set("User-Agent", "foo-service/1.0.0")

	client := &http.Client{}

	res, err := client.Do(req)

	if err != nil {
		return err
	}

	defer res.Body.Close()

	return nil
}

func main() {

	ctx, stop := signal.NotifyContext(
		// 空のコンテキストを作成する
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cleanUp, err := tracer.initTracer(10 * time.Second)

	if err != nil {
		panic(err)
	}

	defer cleanUp()

	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/
> - https://zenn.dev/ww24/articles/beae98be198c94#%E8%A8%88%E8%A3%85
> - https://opentelemetry.io/docs/reference/specification/trace/sdk/#shutdown
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L42-L91
> - https://blog.cybozu.io/entry/2023/04/12/170000

#### ▼ コンテキスト注入と子スパン作成

現在の処理にコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"github.com/hiroki-hasegawa/foo/infrastructure/tracer"
)

func httpRequest(ctx context.Context) error {

	var span trace.Span
	// 現在の処理にコンテキストを注入する。
    // 変数にすでにコンテキストが注入されているので、子スパンが作成される。
	ctx, span = otel.Tracer("example.com/bar-service").Start(ctx, "bar")

	defer span.End()

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet, "https://example.com",
		http.NoBody,
	)

	if err != nil {
		return err
	}

	// リクエストの送信元マイクロサービスがわかるようにする。
	req.Header.Set("User-Agent", "bar-service/1.0.0")

	client := &http.Client{}

	res, err := client.Do(req)

	if err != nil {
		return err
	}

	defer res.Body.Close()

	return nil
}

func main() {

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cleanUp, err := tracer.initTracer(10 * time.Second)

	if err != nil {
		panic(err)
	}

	defer cleanUp()

	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/#create-nested-spans
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L93-L101

<br>

### 宛先がotelコレクターの場合

#### ▼ パッケージの初期化

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

otelクライアントパッケージを初期化する。

初期化の段階で、コンテキストの伝播処理も実行する。

```go
package main

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

var tracer = otel.Tracer("<マイクロサービス名>")

func initProvider() (func(context.Context) error, error) {

    // 空のコンテキストを作成する
	ctx := context.Background()

	resr, err := resource.New(
		ctx,
		// マイクロサービスの属性情報を設定する。
		resource.WithAttributes(semconv.ServiceNameKey.String("<マイクロサービス名>")),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	conn, err := grpc.DialContext(
        ctx, "sample-collector.observability.svc.cluster.local:4317",
        grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock(),
    )

	if err != nil {
		return nil, fmt.Errorf("failed to create gRPC connection to collector: %w", err)
	}

	// スパンの宛先として、otelコレクターを設定する。
	exporter, err := otlptracegrpc.New(
		ctx,
		otlptracegrpc.WithGRPCConn(conn),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

    var tracerProvider *sdktrace.TracerProvider

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// TraceProviderを作成する
	tracerProvider = sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(resr),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

	// パッケージをセットアップする。
	otel.SetTracerProvider(tracerProvider)

	// 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
	otel.SetTextMapPropagator(
		// W3C Trace Context仕様のコンテキストを伝播できるPropagatorを設定する
        propagation.TraceContext{},
    )

	return tracerProvider.Shutdown, nil
}
```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoBFF/app/controllers/otel.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoAPI/app/controllers/otel.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/controllers/otel.go
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.18.0/example/otel-collector/main.go#L43-L93

#### ▼ 親スパン作成

親スパンを作成する

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
    "context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"net/http"
	"regexp"
	"strconv"
	"text/template"
	"time"
	"todobff/app/SessionInfo"
	"todobff/config"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
    "go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

func LoggerAndCreateSpan(c *gin.Context, msg string) trace.Span {

	// 現在の処理にコンテキストを注入する。
    // 変数にすでにコンテキストが注入されていないので、親スパンが作成される。
	_, span := tracer.Start(c.Request.Context(), msg)

	SpanId := span.SpanContext().SpanID().String()

	TraceId := span.SpanContext().TraceID().String()

	span.SetAttributes(
		attribute.Int("status", c.Writer.Status()),
		attribute.String("method", c.Request.Method),
		attribute.String("client_ip", c.ClientIP()),
		attribute.String("message", msg),
		attribute.String("span_id", SpanId),
		attribute.String("trace_id", TraceId),
	)

	start := time.Now()

	logger, err := zap.NewProduction()
	if err != nil {
		log.Print(err)
	}

	defer logger.Sync()

    // 分散トレースとログを紐づける。
	logger.Info(
		"Logger",
        // スパンID
		zap.String("span_id", SpanId),
        // トレースID
		zap.String("trace_id", TraceId),
		// 実行時間
		zap.Duration("elapsed", time.Since(start)),
		...
	)

	return span
}

// ログイン画面を返却する
func getLogin(c *gin.Context) {

  // イベントごとに同階層スパンを作成する
	defer LoggerAndCreateSpan(c, "ログイン画面取得").End()
	generateHTML(c, nil, "login", "layout", "login", "public_navbar", "footer")
}


func StartMainServer() {

  ...

	shutdown, err := initProvider()

  if err != nil {
		log.Print(err)
	}

	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("failed to shutdown TracerProvider: %w", err)
		}
	}()

  ...

	rTodos.Use(checkSession())

  ...

}

func checkSession() gin.HandlerFunc {

  return func(c *gin.Context) {

    ...

    // イベントごとに同階層スパンを作成する
    defer LoggerAndCreateSpan(c, "セッションチェック開始").End()

    ...

    // イベントごとに同階層スパンを作成する
		defer LoggerAndCreateSpan(c, "セッションチェック終了").End()
	}
}

```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoBFF/app/controllers/route_auth.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoBFF/app/controllers/utils.go
> - https://blog.cybozu.io/entry/2023/04/12/170000
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.18.0/example/otel-collector/main.go#L122-L125

#### ▼ コンテキスト注入と子スパン作成

現在の処理にコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
    "context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"net/http"
	"regexp"
	"strconv"
	"text/template"
	"time"
	"todobff/app/SessionInfo"
	"todobff/config"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
    "go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

// 子スパンを作成し、スパンとログにイベント名を記載する
func LoggerAndCreateSpan(c *gin.Context, msg string) trace.Span {

	// 現在の処理にコンテキストを注入する。
    // 変数にすでにコンテキストが注入されているので、子スパンが作成される。
	_, span := tracer.Start(c.Request.Context(), msg)

	SpanId := span.SpanContext().SpanID().String()

	TraceId := span.SpanContext().TraceID().String()

	span.SetAttributes(
		attribute.Int("status", c.Writer.Status()),
		attribute.String("method", c.Request.Method),
		attribute.String("client_ip", c.ClientIP()),
		attribute.String("message", msg),
		attribute.String("span_id", SpanId),
		attribute.String("trace_id", TraceId),
	)

	start := time.Now()

	logger, err := zap.NewProduction()

	if err != nil {
		log.Print(err)
	}

	defer logger.Sync()

    // 分散トレースとログを紐づける。
	logger.Info(
		"Logger",
		// スパンID
		zap.String("span_id", SpanId),
		// トレースID
		zap.String("trace_id", TraceId),
		// 実行時間
		zap.Duration("elapsed", time.Since(start)),
		...
	)

	return span
}

// ユーザーを作成する
func createUser(c *gin.Context) {

	utils.LoggerAndCreateSpan(c, "ユーザ登録").End()

	var json signupRequest

	if err := c.BindJSON(&json); err != nil {
		c.JSON(
            http.StatusBadRequest,
            gin.H{"error": err.Error()},
        )
		return
	}

	utils.LoggerAndCreateSpan(c, json.Email+" のユーザ情報の取得").End()

	user, _ := models.GetUserByEmail(c, json.Email)

    if user.ID != 0 {

		c.JSON(
            http.StatusOK,
            gin.H{"error_code": "その Email はすでに存在しております"},
        )
	} else {

    user := models.User{
			Name:     json.Name,
			Email:    json.Email,
			PassWord: json.PassWord,
		}

		if err := user.CreateUser(c); err != nil {
			log.Println(err)
		}

		c.JSON(
            http.StatusOK,
            gin.H{"Name":  json.Name,"Email": json.Email},
        )
	}
}
```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/controllers/route.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/utils/utils.go

<br>

### 宛先がX-rayの場合

#### ▼ パッケージの初期化

```go
package collection

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"go.opentelemetry.io/contrib/propagators/aws/xray"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

...


func initProvider() (func(context.Context) error, error) {

	// 空のコンテキストを作成する
	ctx := context.Background()

	resr, err := resource.New(
        ctx,
		// マイクロサービスの属性情報を設定する。
		resource.WithAttributes(semconv.ServiceNameKey.String("sample")),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	// AWS Distro for otelコレクターに接続する
	conn, err := grpc.DialContext(
		ctx,
		"sample-collector.sample.svc.cluster.local:4318",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create gRPC connection to collector: %w", err)
	}

	// スパンの宛先として、AWS Distro for otelコレクターを設定する。
	exporter, err := otlptracegrpc.New(
		ctx,
		otlptracegrpc.WithGRPCConn(conn),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	var tracerProvider *sdktrace.TracerProvider

    // TraceProviderを作成する
	tracerProvider = sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(resr),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
		// X-ray形式の各種IDを新しく作成する
		sdktrace.WithIDGenerator(xray.NewIDGenerator()),
	)

	otel.SetTracerProvider(tracerProvider)

	// 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
	otel.SetTextMapPropagator(
		// X-ray形式のコンテキストを伝播できるPropagatorを設定する
        xray.Propagator{},
    )

	return tracerProvider.Shutdown, nil
}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L119-L154
> - https://aws.amazon.com/blogs/opensource/go-support-for-aws-x-ray-now-available-in-aws-distro-for-opentelemetry/
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/propagators/aws/xray/propagator.go
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/propagators/aws/xray/idgenerator.go#L67C1-L74

#### ▼ 親スパンの作成

親スパンを作成する

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

...

func main() {

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)

	defer stop()

	shutdown, err := initProvider()

	if err != nil {
		log.Print(err)
	}

	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("failed to shutdown TracerProvider: %w", err)
		}
	}()

	r := gin.New()

	r.Use(otelgin.Middleware("sample"))

	r.GET("/sample", sample1)

	r.Run(":8080")
}

func parent(ctx *gin.Context) {

	var tracer = otel.Tracer("sample")

	// スパンを作成する
	_, span := tracer.Start(
		ctx.Request.Context(),
		"sample1",
	)

	time.Sleep(time.Second * 1)

	log.Println("sample1 done.")

	child(ctx)

	span.End()
}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/http_traces.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L93-L97

#### ▼ コンテキスト注入と子スパン作成

現在の処理にコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)


func main() {

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)

	defer stop()

	shutdown, err := initProvider()

	if err != nil {
		log.Print(err)
	}

	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("failed to shutdown TracerProvider: %w", err)
		}
	}()

	r := gin.New()

	r.Use(otelgin.Middleware("sample"))

	r.GET("/sample", sample1)

	r.Run(":8080")
}

func child(ctx *gin.Context) {

	var tracer = otel.Tracer("sample")

	// スパンを作成する
	_, span := tracer.Start(
		ctx.Request.Context(),
		"sample1",
	)

	time.Sleep(time.Second * 1)

	log.Println("sample1 done.")

	span.End()
}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/http_traces.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L93-L97

#### ▼ ログへのID出力

`trace.Span`から取得できるトレースIDはotel形式である。

そのため、もしX-ray形式の各種IDを使用したい場合 (例：ログにX-ray形式IDを出力したい)、変換処理が必要である。

```go
func getXrayTraceID(span trace.Span) string {

	xrayTraceID := span.SpanContext().TraceID().String()

	return fmt.Sprintf(
		"1-%s-%s",
		xrayTraceID[0:8],
		xrayTraceID[8:]
	)
}
```

> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L156-L160
> - https://aws.github.io/copilot-cli/en/docs/developing/observability/#including-trace-logs

<br>

### 宛先がGoogle CloudTraceの場合

#### ▼ パッケージの初期化

```go
package main

import (
	"context"
	"log"
	"os"

	"go.opentelemetry.io/contrib/detectors/gcp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/sdk/resource"

	texporter "github.com/GoogleCloudPlatform/opentelemetry-operations-go/exporter/trace"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.7.0"
)

func initProvider() (func(), error) {
	projectID := os.Getenv("PROJECT_ID")

	// CloudTraceを宛先に設定する。
	exporter, err := cloudtrace.New(cloudtrace.WithProjectID(projectID))

	if err != nil {
		return nil, err
	}

	// TraceProviderを作成する
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithBatcher(exporter),
	)

	// パッケージをセットアップする。
	otel.SetTracerProvider(tracerProvider)

	return func() {
		err := tp.Shutdown(context.Background())
		if err != nil {
			fmt.Printf("error shutting down trace provider: %+v", err)
		}
	}, nil
}

func installPropagators() {

	// 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
	otel.SetTextMapPropagator(
        // 複数のPropagatorを動的に選べるようにする
		propagation.NewCompositeTextMapPropagator(
			// CloudTrace形式のコンテキストを伝播できるPropagatorを設定する
			gcppropagator.CloudTraceOneWayPropagator{},
			// W3C Trace Context仕様のコンテキストを伝播できるPropagatorを設定する
			propagation.TraceContext{},
			// W3C Baggage仕様のコンテキストを伝播できるPropagatorを設定する
			propagation.Baggage{},
		),
	)
}
```

> - https://github.com/GoogleCloudPlatform/golang-samples/blob/HEAD/opentelemetry/trace/main.go#L35-L71
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/client/client.go#L39-L72
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/server/server.go#L37-L70

#### ▼ 親スパン作成

```go
package main

import (
	"context"
	"log"
	"os"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	installPropagators()

	shutdown, err := initTracer()

	if err != nil {
		log.Print(err)
	}

	defer shutdown()

	helloHandler := func(w http.ResponseWriter, req *http.Request) {

		ctx := req.Context()
		span := trace.SpanFromContext(ctx)
		span.SetAttributes(attribute.String("server", "handling this..."))
		_, _ = io.WriteString(w, "Hello, world!\n")
	}

	otelHandler := otelhttp.NewHandler(http.HandlerFunc(helloHandler), "Hello")

	http.Handle("/hello", otelHandler)

	err = http.ListenAndServe(":7777", nil)

	if err != nil {
		panic(err)
	}
}
```

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/client/client.go#L74-L119

#### ▼ コンテキスト注入と子スパン作成

現在の処理にコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"log"
	"os"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	installPropagators()

	shutdown, err := initTracer()

	if err != nil {
		log.Print(err)
	}

	defer shutdown()

	helloHandler := func(w http.ResponseWriter, req *http.Request) {
		ctx := req.Context()
		span := trace.SpanFromContext(ctx)
		span.SetAttributes(attribute.String("server", "handling this..."))
		_, _ = io.WriteString(w, "Hello, world!\n")
	}

	otelHandler := otelhttp.NewHandler(
        http.HandlerFunc(helloHandler),
        "Hello",
    )

	http.Handle("/hello", otelHandler)

	err = http.ListenAndServe(":7777", nil)

	if err != nil {
		panic(err)
	}
}
```

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/client/client.go#L74-L119
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/server/server.go#L72-L93
> - https://github.com/GoogleCloudPlatform/golang-samples/blob/HEAD/opentelemetry/trace/main.go#L73-L84
> - https://blog.cybozu.io/entry/2023/04/12/170000

<br>

## 02-03. アプリでgRPCを使用する場合

### 宛先が標準出力の場合

#### ▼ パッケージの初期化

gRPCを使わない場合と実装方法は同じである。

```go
package main

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"

	stdout "go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func Init() (*sdktrace.TracerProvider, error) {

	// 標準出力を宛先に設定する。
	exporter, err := stdout.New(stdout.WithPrettyPrint())

	if err != nil {
		return nil, err
	}

	// TraceProviderを作成する
	traceProvider := sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithBatcher(exporter),
	)

	otel.SetTracerProvider(traceProvider)

	// 監視バックエンドが対応するコンテキストの仕様を設定する必要がある
	otel.SetTextMapPropagator(
		// 複数のPropagatorを動的に選べるようにする
		propagation.NewCompositeTextMapPropagator(
			    // W3C Trace Context仕様のコンテキストを伝播できるPropagatorを設定する
			    propagation.TraceContext{},
			    // W3C Baggage仕様のコンテキストを伝播できるPropagatorを設定する
			    propagation.Baggage{},
			),
		)

	return traceProvider, nil
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/instrumentation/google.golang.org/grpc/otelgrpc/example/config/config.go
> - https://opentelemetry.io/docs/concepts/components/#language-specific-api--sdk-implementations

#### ▼ 親スパンの作成 (gRPCクライアント)

```go
package main

import (
	"log"
	"net/http"

	"google.golang.org/grpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"

	// pb.goファイルを読み込む。
    pb "github.com/hiroki-hasegawa/foo/foo"
)

func main() {

	conn, err := grpc.Dial(
		    ":7777",
			grpc.WithTransportCredentials(insecure.NewCredentials()),
			grpc.WithUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
			grpc.WithStreamInterceptor(otelgrpc.StreamClientInterceptor()),
		)

	defer conn.Close()

	// gRPCクライアントを作成する
	client := pb.NewFooServiceClient(conn)

	// goサーバーをリモートプロシージャーコールする。
	response, err := client.SayHello(
        context.Background(),
        &pb.Message{Body: "Hello From Client!"},
    )

	...
}

func (s *server) workHard(ctx context.Context) {

	// スパンを作成する
	_, span := tracer.Start(
		ctx,
		"workHard",
		trace.WithAttributes(attribute.String("extra.key", "extra.value")),
	)

	defer span.End()

	time.Sleep(50 * time.Millisecond)
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.19.0/instrumentation/google.golang.org/grpc/otelgrpc/example/client/main.go#L34-L72
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.19.0/instrumentation/google.golang.org/grpc/otelgrpc/example/server/main.go#L57-L63
> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v2.0.0/examples/client/main.go#L100-L112
> - https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry

#### ▼ コンテキスト注入と子スパン作成 (gRPCサーバー)

```go
package main

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"

	// pb.goファイルを読み込む。
    pb "github.com/hiroki-hasegawa/foo/foo"
)

func main() {

	// otelパッケージを初期化する
	tp, err := config.Init()

	if err != nil {
		log.Print(err)
	}

	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		// 単項RPCの場合のインターセプター処理
		grpc.UnaryInterceptor(otelgrpc.UnaryServerInterceptor()),
		// ストリーミングRPCの場合のインターセプター処理
		grpc.StreamInterceptor(otelgrpc.StreamServerInterceptor()),
	)

	// pb.goファイルで自動作成された関数を使用して、goサーバーをgRPCサーバーとして登録する。
	// goサーバーがリモートプロシージャーコールを受信できるようになる。
	pb.RegisterFooServiceServer(grpcServer, &Server{})

	// goサーバーで待ち受けるポート番号を設定する。
	listenPort, _ := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// gRPCサーバーとして、goサーバーでリクエストを受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Fatalf("failed to serve: %s", err)
	}
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.19.0/instrumentation/google.golang.org/grpc/otelgrpc/example/server/main.go#L126-L151
> - https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry
> - https://blog.cybozu.io/entry/2023/04/12/170000

<br>

## 03. Pythonの場合

### otelクライアントパッケージ

記入中...

<br>

### 拡張otelクライアントパッケージ

記入中...

<br>

### 分散トレースSDK

記入中...

<br>

## 03-02. アプリでgRPCを使わない場合

### 宛先がGoogle CloudTraceの場合

#### ▼ パッケージの初期化

ここでは、FlaskというフレームワークでPythonのアプリケーションを作成したとする。

otelクライアントパッケージを初期化する。

初期化の段階で、コンテキストの伝播処理も実行する。

```python
import time

from opentelemetry import trace
from opentelemetry.propagate import set_global_textmap
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.propagators.cloud_trace_propagator import (CloudTraceFormatPropagator,)

# ダウンストリーム側マイクロサービスのリクエストからコンテキストを抽出する。
set_global_textmap(CloudTraceFormatPropagator())

# 任意のコンテキストを設定する
resource = Resource.create({
        "service.name": "flask_e2e_client",
        "service.namespace": "examples",
        "service.instance.id": "instance554",
    })

tracer_provider = TracerProvider()

# スパンの宛先として、Google CloudTraceを設定する。
cloud_trace_exporter = CloudTraceSpanExporter()

tracer_provider.add_span_processor(BatchSpanProcessor(cloud_trace_exporter))

trace.set_tracer_provider(tracer_provider)

tracer = trace.get_tracer(__name__)
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/client.py#L1-L65
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L1-L79
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=16

ここでは、`requests`パッケージでリクエストを送信するため、`RequestsInstrumentor`関数による初期化も必要である。

```python
import requests
from opentelemetry.instrumentation.requests import RequestsInstrumentor

RequestsInstrumentor().instrument()

response = requests.get("http://flask-app:6000")

print(response.text)
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://opentelemetry-python-kinvolk.readthedocs.io/en/latest/instrumentation/requests/requests.html
> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/client.py#L67-L69

#### ▼ 親スパン作成

親スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

ここでは、Flaskでリクエストを受信するため、`FlaskInstrumentor`関数でスパンを処理している。

```python
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from flask import Flask

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

FlaskInstrumentor().instrument_app(app)

@app.route("/")
def hello_world():

    ...

    # 現在の処理にコンテキストを注入する。
    # 変数にすでにコンテキストが注入されていないので、親スパンが作成される。
    with tracer.start_as_current_span("do_work"):
        time.sleep(0.1)

    ...
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/flask/flask.html
> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L81-L97

#### ▼ コンテキスト注入と子スパン作成

現在の処理にコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```python
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from flask import Flask

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

FlaskInstrumentor().instrument_app(app)

@app.route("/")
def hello_world():

    ...

    # 現在の処理にコンテキストを注入する。
    # 変数にすでにコンテキストが注入されているので、子スパンが作成される。
    with tracer.start_as_current_span("do_work"):
        time.sleep(0.1)

    ...
```

<br>
