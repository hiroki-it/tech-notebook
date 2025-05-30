---
title: 【IT技術の知見】Go＠OpenTelemetryクライアントパッケージ
description: Go＠OpenTelemetryクライアントパッケージの知見を記録しています。
---

# Go＠OpenTelemetryクライアントパッケージ

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 概要

### otelクライアントパッケージ

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

パッケージを初期化し、トレースコンテキストを抽出する。

```go
package trace

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
	"go.opentelemetry.io/otel/trace"
)

func newTracerProvider(exporter sdktrace.SpanExporter) *sdktrace.TracerProvider {

	resourceWithAttirbutes, err := resource.Merge(
		resource.Default(),
		// アプリ内の全ての処理に共通する属性を設定する
		// 処理ごとに異なる属性はスパンの作成時に設定する
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("<マイクロサービス名>"),
			semconv.String("system.name", "<システム名>"),
			semconv.String("environment", "<実行環境名>"),
		),
	)

	if err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}

	return sdktrace.New(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(resourceWithAttirbutes),
	)
}
```

```go
package main

import (
	"context"
	"log"
)

func main() {

	ctx := context.Background()

	exporter, err := newExporter(ctx)

	if err != nil {
		log.Printf("Failed to initialize exporter: %v", err)
	}

	// TracerProviderのインターフェースを作成する
	tracerProvider := newTracerProvider(exporter

    // 事後処理
	defer func() {
		// TracerProviderを安全にシャットダウンする
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
		_ = tracerProvider.Shutdown(ctx)
		log.Print("Trace provider shutdown successfully")
    }()

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	log.Print("Tracer provider initialize successfully")

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
		// Composit Propagatorを設定する
		propagator
	)

	propagatorList := propagator.Fields()

	sort.Strings(propagatorList)

	// ログにpropagator名を出力しておく
	log.Printf("Propagator %v initialize successfully", propagatorList)

	...
}
```

> - https://opentelemetry.io/docs/languages/go/instrumentation/#getting-a-tracer
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/internal/global/state.go#L27-L39
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/internal/global/state.go#L57-L70

#### ▼ 親スパン作成 (クライアント側のみ)

親スパンを作成する。

```go
func parentFunction(ctx context.Context) {

    // Tracerを作成する
    // Tracer名はパッケージ名が推奨である
    // @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
    var tracer = otel.Tracer("計装パッケージ名")

	ctx, parentSpan := tracer.Start(
		ctx,
		"parent-service",
	)

	defer parentSpan.End()

	childFunction(ctx)
}
```

> - https://opentelemetry.io/docs/languages/go/instrumentation/#create-nested-spans

TracerProviderの作成時だけでなく、スパンの作成のタイミングでも属性を設定できる。

アプリ内の全ての処理に共通する属性は、TracerProviderで設定すると良い。

```go
func parentFunction(ctx context.Context) {

    // Tracerを作成する
    // Tracer名はパッケージ名が推奨である
    // @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
    var tracer = otel.Tracer("計装パッケージ名")

	ctx, parentSpan := tracer.Start(
		ctx,
		"parent-service",
		trace.WithAttributes(attribute.String("<キー名>", "<キー値>")),
    )

	defer parentSpan.End()

    ...
}
```

> - https://opentelemetry.io/docs/languages/go/instrumentation/#span-attributes
> - https://blog.cybozu.io/entry/2023/04/12/170000

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

```go
func childFunction(ctx context.Context) {

    tracer := otel.Tracer("<計装パッケージ名>")

	ctx, childSpan := tracer.Start(
		ctx,
		"child",
    )

	defer childSpan.End()

    ...
}
```

> - https://opentelemetry.io/docs/languages/go/instrumentation/#create-nested-spans
> - https://opentelemetry.io/docs/languages/go/instrumentation/#propagators-and-context

<br>

### 拡張otelクライアントパッケージ

#### ▼ 拡張otelクライアントパッケージ

標準のotelクライアントパッケージと外部ツールを連携しやすいようにしたパッケージを提供する。

#### ▼ Exporter

> - https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.18.0/exporters

#### ▼ Propagator

標準のotelクライアントパッケージが宛先として持たないスパン収集ツール (例：AWS Distro for OpenTelemetry Collector) を、使用できるようになる。

> - https://github.com/open-telemetry/opentelemetry-go-contrib/tree/v1.18.0/propagators

<br>

### 分散トレースSDK

#### ▼ 分散トレースSDK

分散トレース収集ツールが、独自のパッケージを提供している場合がある。

拡張otelクライアントパッケージとは異なり、対象のスパン収集ツールにスパンを送信するためだけのパッケージである。

#### ▼ AWS Distro for OpenTelemetry Collector

> - https://github.com/aws/aws-xray-sdk-go
> - https://github.com/aws-samples/aws-xray-sdk-go-sample

#### ▼ Google Cloud Trace

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go

<br>

## 02. 手動でスパンを開始/終了する場合

### 宛先が標準出力の場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

パッケージを初期化し、トレースコンテキストを抽出する。

```go
package trace

import (
	"context"
	"log"
	"os"
	"time"

	"go.opentelemetry.io/contrib/propagators/autoprop"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/resource"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func InitTracerProvider(shutdownTimeout time.Duration) (func(), error) {

	log.Print("Trace provider is initializing ...")

	// Exporter (スパンの宛先) として、標準出力を設定する。
	exporter := stdouttrace.New(
		// 見やすくなるように出力前に整形する
		stdouttrace.WithPrettyPrint(),
		// 標準出力または標準エラー出力を設定する
		stdouttrace.WithWriter(os.Stdout),
	)

	log.Print("Stdout exporter initialize successfully")

	// マイクロサービスの属性情報を設定する。
	resourceWithAttributes := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceName("<マイクロサービス名>"),
		semconv.String("system.name", "<システム名>"),
	    semconv.String("environment", "<実行環境名>"),
	)

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// TracerProviderを作成する
	tracerProvider := sdktrace.New(
	    // ExporterをTracerProviderに登録する
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

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
	log.Printf("Propagator %v initialize successfully", propagatorList)

	// 宛先マイクロサービスへのリクエストがタイムアウトだった場合に、処理をする。
	cleanUp := func() {

		// タイムアウト時間設定済みのトレースコンテキストを作成する
		ctx, cancel := context.WithTimeout(
            context.Background(),
            5 * time.Second,
        )

		// タイムアウト時間経過後に処理を中断する
        defer cancel()

		// TracerProviderを安全にシャットダウンする
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
        if err := tracerProvider.Shutdown(ctx); err != nil {
			log.Printf("Failed to shutdown tracer provider: %v", err)
			return
		}

		log.Print("Trace provider shutdown successfully")
	}

	log.Print("Tracer provider initialize successfully")

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

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=12
> - https://opentelemetry.io/docs/languages/go/instrumentation/#getting

#### ▼ 親スパン作成 (クライアント側のみ)

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

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	// 現在の処理からトレースコンテキストを取得する。
	ctx, span = tracer.Start(ctx, "parent-service")

	defer span.End()

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		"https://example.com",
		http.NoBody,
	)

	if err != nil {
		return err
	}

	// クライアント側マイクロサービスがわかるようにする。
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

    // 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		// 空のトレースコンテキストを作成する
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cleanUp, err := trace.InitTracerProvider(5 * time.Second)

	if err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}

	defer cleanUp()

	if err := httpRequest(ctx); err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}
}
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/
> - https://zenn.dev/ww24/articles/beae98be198c94#%E8%A8%88%E8%A3%85
> - https://opentelemetry.io/docs/reference/specification/trace/sdk/#shutdown
> - https://blog.cybozu.io/entry/2023/04/12/170000

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

Carrierにトレースコンテキストを注入し、また子スパンを作成する。

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

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	// Carrierにトレースコンテキストを注入する。
	ctx, span = tracer.Start(ctx, "child-service")

	defer span.End()

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet, "https://example.com",
		http.NoBody,
	)

	if err != nil {
		return err
	}

	// クライアント側マイクロサービスがわかるようにする。
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

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cleanUp, err := trace.InitTracerProvider(5 * time.Second)

	if err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}

	defer cleanUp()

	if err := httpRequest(ctx); err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}
}
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/#create-nested-spans

<br>

### 宛先がOpenTelemetry Collectorの場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

otelクライアントパッケージを初期化する。

初期化の段階で、トレースコンテキストを伝播する。

```go
package trace

import (
	"context"
	"fmt"

	"go.opentelemetry.io/contrib/propagators/autoprop"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
)

func NewTracerProvider() (func(context.Context) error, error) {

    // 空のトレースコンテキストを作成する
	ctx := context.Background()

	resourceWithAttributes, err := resource.New(
		ctx,
		// マイクロサービスの属性情報を設定する。
		resource.WithAttributes(semconv.ServiceName("<マイクロサービス名>")),
	)

	if err != nil {
		return nil, log.Printf("Failed to create resource: %w", err)
	}

	conn, err := grpc.DialContext(
        ctx,
        // OpenTelemetry Collectorの完全修飾ドメイン名
        "opentelemetry-collector.foo-namespace.svc.cluster.local:4317",
        grpc.WithTransportCredentials(insecure.NewCredentials()),
        grpc.WithBlock(),
    )

	if err != nil {
		return nil, log.Printf("Failed to create gRPC connection to collector: %w", err)
	}

	// Exporter (スパンの宛先) として、OpenTelemetry Collectorを設定する。
	exporter, err := otlptracegrpc.New(
		ctx,
		otlptracegrpc.WithGRPCConn(conn),
	)

	if err != nil {
		return nil, log.Printf("Failed to create trace exporter: %w", err)
	}

	log.Print("gRPC exporter initialize successfully")

	var tracerProvider *sdktrace.TracerProvider

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// TracerProviderを作成する
	tracerProvider = sdktrace.New(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

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
	log.Printf("Propagator %v initialize successfully", propagatorList)

	log.Print("Tracer provider initialize successfully")

	return tracerProvider.Shutdown, nil
}
```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoBFF/app/controllers/otel.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoAPI/app/controllers/otel.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/controllers/otel.go
> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.18.0/example/otel-collector/main.go#L43-L93

#### ▼ 親スパン作成 (クライアント側のみ)

親スパンを作成する

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"log"
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

func LoggerAndCreateSpan(ginCtx *gin.Context, msg string) trace.Span {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	// Carrierにトレースコンテキストを注入する。
	_, span := tracer.Start(ginCtx.Request.Context(), "parent-service")

	SpanId := span.SpanContext().SpanID().String()

	TraceId := span.SpanContext().TraceID().String()

	span.SetAttributes(
		attribute.Int("status", ginCtx.Writer.Status()),
		attribute.String("method", ginCtx.Request.Method),
		attribute.String("client_ip", ginCtx.ClientIP()),
		attribute.String("message", msg),
		attribute.String("span_id", SpanId),
		attribute.String("trace_id", TraceId),
	)

	start := time.Now()

	logger, err := zap.NewProduction()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
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
func getLogin(ginCtx *gin.Context) {

    // イベントごとに同階層スパンを作成する
	defer LoggerAndCreateSpan(c, "ログイン画面取得").End()
	generateHTML(c, nil, "login", "layout", "login", "public_navbar", "footer")
}


func StartMainServer() {

    ...

    shutdown, err := NewTracerProvider()

    if err != nil {
	  	log.Printf("Failed to do something: %v", err)
    }

    // 事後処理
    defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("Failed to shutdown tracer provider: %w", err)
			return
		}
    }()

    ...

    rTodos.Use(checkSession())

    ...
}

func checkSession() gin.HandlerFunc {

    return func(ginCtx *gin.Context) {

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

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

Carrierにトレースコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"log"
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
func LoggerAndCreateSpan(ginCtx *gin.Context, msg string) trace.Span {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	// Carrierにトレースコンテキストを注入する。
	_, span := tracer.Start(ginCtx.Request.Context(), "child-service")

	SpanId := span.SpanContext().SpanID().String()

	TraceId := span.SpanContext().TraceID().String()

	span.SetAttributes(
		attribute.Int("status", ginCtx.Writer.Status()),
		attribute.String("method", ginCtx.Request.Method),
		attribute.String("client_ip", ginCtx.ClientIP()),
		attribute.String("message", msg),
		attribute.String("span_id", SpanId),
		attribute.String("trace_id", TraceId),
	)

	start := time.Now()

	logger, err := zap.NewProduction()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
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
func createUser(ginCtx *gin.Context) {

	utils.LoggerAndCreateSpan(c, "ユーザ登録").End()

	var json signupRequest

	if err := ginCtx.BindJSON(&json); err != nil {
		ginCtx.JSON(
            http.StatusBadRequest,
            gin.H{"error": fmt.Sprintf("Failed to do something: %v", err.Error())},
        )
		return
	}

	utils.LoggerAndCreateSpan(c, json.Email+" のユーザ情報の取得").End()

	user, _ := models.GetUserByEmail(c, json.Email)

    if user.ID != 0 {

		ginCtx.JSON(
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
			log.Printf("Failed to do something: %v", err)
		}

		ginCtx.JSON(
            http.StatusOK,
            gin.H{"Name":  json.Name,"Email": json.Email},
        )
	}
}
```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/controllers/route.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/utils/utils.go

<br>

### 宛先がX-Rayの場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

パッケージを初期化し、トレースコンテキストを抽出する。

```go
package trace

import (
	"context"
	"log"

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


func NewTracerProvider() (func(context.Context) error, error) {

	// 空のトレースコンテキストを作成する
	ctx := context.Background()

	resourceWithAttributes, err := resource.New(
        ctx,
		// マイクロサービスの属性情報を設定する。
		resource.WithAttributes(semconv.ServiceName("sample")),
	)

	if err != nil {
		return nil, log.Printf("Failed to create resource: %w", err)
	}

	// AWS Distro for OpenTelemetry Collectorに接続する
	conn, err := grpc.DialContext(
		ctx,
		"sample-collector.sample.svc.cluster.local:4318",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)

	if err != nil {
		return nil, log.Printf("Failed to create gRPC connection to collector: %w", err)
	}

	// Exporter (スパンの宛先) として、AWS Distro for OpenTelemetry Collectorを設定する。
	exporter, err := otlptracegrpc.New(
		ctx,
		otlptracegrpc.WithGRPCConn(conn),
	)

	if err != nil {
		return nil, log.Printf("Failed to create trace exporter: %w", err)
	}

	log.Print("gRPC exporter initialize successfully")

	var tracerProvider *sdktrace.TracerProvider

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

    // TracerProviderを作成する
	tracerProvider = sdktrace.New(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

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
	log.Printf("Propagator %v initialize successfully", propagatorList)

	log.Print("Tracer provider initialize successfully")

	return tracerProvider.Shutdown, nil
}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L119-L154
> - https://aws.amazon.com/blogs/opensource/go-support-for-aws-x-ray-now-available-in-aws-distro-for-opentelemetry/
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/propagators/aws/xray/propagator.go
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/propagators/aws/xray/idgenerator.go#L67C1-L74

#### ▼ 親スパン作成

親スパンを作成する

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

...

func main() {

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)

	defer stop()

	shutdown, err := NewTracerProvider()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
	}

	// 事後処理
	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("Failed to shutdown tracer provider: %w", err)
			return
		}
	}()

	router := gin.New()

	router.Use(otelgin.Middleware("sample"))

	router.GET("/sample", sample1)

	router.Run(":8080")
}

func parent(ctx *gin.Context) {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	// Carrierにトレースコンテキストを注入する。
	_, span := tracer.Start(
		ctx.Request.Context(),
		// サービス名
		"parent-service",
	)

	defer span.End()

	time.Sleep(1 * time.Second)

	log.Println("sample1 done.")

	child(ctx)

}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/http_traces.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L93-L97

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

Carrierにトレースコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)


func main() {

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)

	defer stop()

	shutdown, err := NewTracerProvider()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
	}

	// 事後処理
	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("Failed to shutdown tracer provider: %w", err)
			return
		}
	}()

	router := gin.New()

	router.Use(otelgin.Middleware("sample"))

	router.GET("/sample", sample1)

	router.Run(":8080")
}

func child(ctx *gin.Context) {

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	// Carrierにトレースコンテキストを注入する。
	_, span := tracer.Start(
		ctx.Request.Context(),
		// サービス名
		"child-service",
	)

	defer span.End()

	time.Sleep(1 * time.Second)

	log.Println("sample2 done.")
}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/http_traces.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L93-L97

#### ▼ ログへのID出力

`trace.Span`から取得できるトレースIDはW3C Trace Context仕様である。

そのため、もしX-Ray形式の各種IDを使用したい場合 (例：ログにX-Ray形式IDを出力したい)、変換処理が必要である。

ここでは、元のW3C Trace Context仕様から指定した位置の文字列を抽出し、`1-***-***`というIDを作成している。

```go
func getXrayTraceID(span trace.Span) string {

	traceId := span.SpanContext().TraceID().String()

	return fmt.Sprintf("1-%s-%s", traceId[0:8], traceId[8:])
}
```

> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L156-L160
> - https://aws.github.io/copilot-cli/en/docs/developing/observability/#including-trace-logs

<br>

### 宛先がGoogle Cloud Traceの場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

パッケージを初期化し、トレースコンテキストを抽出する。

```go
package trace

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

func NewTracerProvider() (func(), error) {

	projectID := os.Getenv("PROJECT_ID")

	// Cloud Traceを宛先に設定する。
	exporter, err := cloudtrace.New(cloudtrace.WithProjectID(projectID))

	if err != nil {
		return nil, err
	}

	log.Print("Cloud Trace exporter initialize successfully")

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// TracerProviderを作成する
	tracerProvider := sdktrace.New(
		// ExporterをTracerProviderに登録する
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	log.Print("Tracer provider initialize successfully")

	return func() {
		// TracerProviderを安全にシャットダウンする
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
		err := tracerProvider.Shutdown(context.Background())
		if err != nil {
			log.Printf("error shutting down trace provider: %v", err)
		}
		log.Print("Trace provider shutdown successfully")
	}, nil
}

func installPropagators() {

	// 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
	otel.SetTextMapPropagator(
        // Composite Propagatorを設定する
		propagation.NewCompositeTextMapPropagator(
			// Cloud Trace形式のトレースコンテキストを伝播できるPropagatorを設定する
			gcppropagator.Cloud TraceOneWayPropagator{},
			// W3C Trace Context仕様のトレースコンテキストを伝播できるPropagatorを設定する
			propagation.TraceContext{},
			// W3C Baggage仕様のトレースコンテキストを伝播できるPropagatorを設定する
			propagation.Baggage{},
		),
	)
}
```

> - https://github.com/GoogleCloudPlatform/golang-samples/blob/HEAD/opentelemetry/trace/main.go#L35-L71
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/client/client.go#L39-L72
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/server/server.go#L37-L70

#### ▼ 親スパン作成 (クライアント側のみ)

```go
package main

import (
	"log"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	installPropagators()

	shutdown, err := InitTracerProvider()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
	}

	defer shutdown()

	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		span := trace.SpanFromContext(ctx)
		span.SetAttributes(attribute.String("server", "handling this..."))
		_, _ = io.WriteString(w, "Hello, world!\n")
	}

    // 計装ミドルウェア
	otelMiddleware := otelhttp.NewHandler(
        http.HandlerFunc(fn),
        // Operation名を設定する
        "parent-service",
    )

	http.Handle("/hello", otelMiddleware)

	err = http.ListenAndServe(":7777", nil)

	if err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}
}
```

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/client/client.go#L74-L119

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

Carrierにトレースコンテキストを注入し、また子スパンを作成する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"log"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	installPropagators()

	shutdown, err := InitTracerProvider()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
	}

	defer shutdown()

	fn := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		span := trace.SpanFromContext(ctx)
		span.SetAttributes(attribute.String("server", "handling this..."))
		_, _ = io.WriteString(w, "Hello, world!\n")
	}

	// 計装ミドルウェア
	otelMiddleware := otelhttp.NewHandler(
        http.HandlerFunc(fn),
        // Operation名を設定する
        "child-service",
    )

	http.Handle("/hello", otelMiddleware)

	err = http.ListenAndServe(":7777", nil)

	if err != nil {
		panic(fmt.Sprintf("Failed to do something: %v", err))
	}
}
```

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/client/client.go#L74-L119
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go/blob/main/example/trace/http/server/server.go#L72-L93
> - https://github.com/GoogleCloudPlatform/golang-samples/blob/HEAD/opentelemetry/trace/main.go#L73-L84
> - https://blog.cybozu.io/entry/2023/04/12/170000

<br>

## 03. 自動でスパンを開始/終了する場合

### 宛先が標準出力の場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

gRPCを使用しない場合と実装方法は同じである。

```go
package trace

import (
	"go.opentelemetry.io/contrib/propagators/autoprop"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"

	stdout "go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func NewTracerProvider() (*sdktrace.TracerProvider, error) {

	// 標準出力を宛先に設定する。
	exporter, err := stdout.New(stdout.WithPrettyPrint())

	if err != nil {
		return nil, err
	}

	log.Print("Stdout exporter initialize successfully")

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// TracerProviderを作成する
	tracerProvider := sdktrace.New(
		// ExporterをTracerProviderに登録する
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
	)

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
	log.Printf("Propagator %v initialize successfully", propagatorList)

	log.Print("Tracer provider initialize successfully")

	return tracerProvider, nil
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/instrumentation/google.golang.org/grpc/otelgrpc/example/config/config.go
> - https://opentelemetry.io/docs/concepts/components/#language-specific-api--sdk-implementations

#### ▼ 親スパン作成 (クライアント側のみ)

gRPCクライアント側では、gRPCサーバーとの接続を作成する必要がある。

クライアント側では、ClientInterceptorを使用し、スパンの開始/終了を自動化する。

```go
package main

import (
	"google.golang.org/grpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"

	// pb.goファイルを読み込む。
    pb "github.com/hiroki-hasegawa/foo/foo"
)

func main() {

    ...

    // gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
		ctx,
        ":7777",
		// クライアントのInterceptor
		grpc.WithChainUnaryInterceptor(otelgrpc.UnaryClientInterceptor()),
		grpc.WithChainStreamInterceptor(otelgrpc.StreamClientInterceptor()),
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

func (s *server) parent(ctx context.Context) {
	// スパンの作成は不要
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.19.0/instrumentation/google.golang.org/grpc/otelgrpc/example/client/main.go#L34-L72
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.19.0/instrumentation/google.golang.org/grpc/otelgrpc/example/server/main.go#L57-L63
> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v2.0.0/examples/client/main.go#L100-L112
> - https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry

注意点として、直近では`WithStatsHandler`関数の使用が推奨になっている。

```go
package main

import (
	"google.golang.org/grpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

func main() {

	...

	// gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
        ctx,
		":7777",
		// クライアント側を一括でセットアップする
		grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
	)

	...

}
```

> - https://zenn.dev/cloud_ace/articles/opentelemetry-go#grpc
> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc#UnaryClientInterceptor
> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc#StreamClientInterceptor

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

サーバー側では、ServerInterceptorを使用し、スパンの開始/終了を自動化する。

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
	tracerProvider, err := config.NewTracerProvider()

	if err != nil {
		log.Printf("Failed to do something: %v", err)
	}

	// 事後処理
	defer func() {
		// TracerProviderを安全にシャットダウンする
		// @see https://opentelemetry.io/docs/specs/otel/trace/sdk/#shutdown
		if err := tracerProvider.Shutdown(context.Background()); err != nil {
			log.Printf("Failed to shutdown tracer provider: %v", err)
		}
		log.Print("Trace provider shutdown successfully")
	}()

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		// 単項RPCのサーバーインターセプター処理
		grpc.ChainUnaryInterceptor(
		    otelgrpc.UnaryServerInterceptor(),
        ),
		// ストリーミングRPCのサーバーインターセプター処理
		grpc.ChainStreamInterceptor(
			otelgrpc.StreamServerInterceptor(),
        ),
	)

	// pb.goファイルで自動作成された関数を使用して、goサーバーをgRPCサーバーとして登録する。
	// goサーバーがリモートプロシージャーコールを受信できるようになる。
	pb.RegisterFooServiceServer(grpcServer, &Server{})

	// goサーバーで待ち受けるポート番号を設定する。
	listenPort, _ := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	if err != nil {
		log.Printf("Failed to listen: %v", err)
	}

	// gRPCサーバーとして、goサーバーでリクエストを受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Printf("Failed to serve: %v", err)
	}
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.19.0/instrumentation/google.golang.org/grpc/otelgrpc/example/server/main.go#L126-L151
> - https://christina04.hatenablog.com/entry/distributed-tracing-with-opentelemetry
> - https://blog.cybozu.io/entry/2023/04/12/170000

注意点として、直近では`WithStatsHandler`関数の使用が推奨になっている。

```go
package main

import (
	"google.golang.org/grpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

func main() {

	...

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler()),
	)

	...

}
```

> - https://zenn.dev/cloud_ace/articles/opentelemetry-go#grpc
> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc#StreamServerInterceptor
> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc#UnaryServerInterceptor

<br>

## 04. メッセージキューを経由する場合

### AWS SQSの場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

パッケージを初期化し、トレースコンテキストを抽出する。

```go
package trace

import (
	"flag"
	"fmt"

	// ここではv1を使用しているが、v2が推奨である
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

func NewTracerProvider() {

	// 空のトレースコンテキストを作成する
	ctx := context.Background()

	...

	// キュー名を取得する
	queue := flag.String("q", "", "The name of the queue")
	flag.Parse()

	if *queue == "" {
		fmt.Println("You must supply the name of a queue (-q QUEUE)")
		return
	}

	// 資格情報を読み込む
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	svc := sqs.New(sess)

	// キューURLを取得する
	urlResult, err := svc.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: queue,
	})

	queueURL := urlResult.QueueUrl

	// AWS SQSにメッセージを送信する
	_, err := svc.SendMessageWithContext(
		// 現在のトレースコンテキストを注入する
		ctx,
		&sqs.SendMessageInput{
			DelaySeconds: aws.Int64(10),
			MessageAttributes: map[string]*sqs.MessageAttributeValue{
				"Title": &sqs.MessageAttributeValue{
					DataType:    aws.String("String"),
					StringValue: aws.String("The Whistler"),
				},
				"Author": &sqs.MessageAttributeValue{
					DataType:    aws.String("String"),
					StringValue: aws.String("John Grisham"),
				},
				"WeeksOn": &sqs.MessageAttributeValue{
					DataType:    aws.String("Number"),
					StringValue: aws.String("6"),
				},
			},
			MessageBody: aws.String("Information about current NY Times fiction bestseller for week of 12/11/2016."),
			QueueUrl:    queueURL,
	})

	...

}
```

> - https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/sqs-example-receive-message.html#sqs-example-send-message
> - https://github.com/udhos/opentelemetry-trace-sqs

#### ▼ 親スパン作成 (クライアント側のみ)

記入中...

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

```go
package main

import (
	"flag"
	"fmt"
	"log"

	// ここではv1を使用しているが、v2が推奨である
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
)

func main() {

	...

	// キュー名を取得する
	queue := flag.String("q", "", "The name of the queue")
	timeout := flag.Int64("t", 5, "How long, in seconds, that the message is hidden from others")
	flag.Parse()

	if *queue == "" {
		fmt.Println("You must supply the name of a queue (-q QUEUE)")
		return
	}

	if *timeout < 0 {
		*timeout = 0
	}

	if *timeout > 12*60*60 {
		*timeout = 12 * 60 * 60
	}

	// 資格情報を読み込む
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	svc := sqs.New(sess)

	// キューURLを取得する
	urlResult, err := svc.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: queue,
	})

	if err != nil {
		log.Printf("Failed to get queue url: %s", err)
	}

	queueURL := urlResult.QueueUrl

	// AWS SQSからメッセージを受信する
	msgResult, err := svc.ReceiveMessageWithContext(
		// トレースコンテキストを抽出する
		ctx,
		&sqs.ReceiveMessageInput{
			AttributeNames: []*string{
				aws.String(sqs.MessageSystemAttributeNameSentTimestamp),
			},
			MessageAttributeNames: []*string{
				aws.String(sqs.QueueAttributeNameAll),
			},
			QueueUrl:            queueURL,
			MaxNumberOfMessages: aws.Int64(1),
			VisibilityTimeout:   timeout,
		},
    )

	fmt.Println("Message Handle: " + *msgResult.Messages[0].ReceiptHandle)

	...

}
```

> - https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/sqs-example-receive-message.html#sqs-example-receive-mesage
> - https://github.com/udhos/opentelemetry-trace-sqs

<br>

## 05. 分散トレースとログの紐付け

分散トレースとログを紐づけるために、ログのフィールドに`trace_id`キーや`span_id`キーを追加する。

監視バックエンドによっては、W3C Trace Context仕様以外の仕様でトレースコンテキストを表示する場合があるため、その場合はIDを事前に変換しておく。

```go
package log

import (
	"context"
	"encoding/hex"
	"fmt"
	"reflect"

	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

// CreateLoggerWithTrace ロガーの初期化時にログにトレースコンテキストを設定する
func CreateLoggerWithTrace(ctx context.Context, string traceType) *zap.SugaredLogger {

	spanCtx := trace.SpanContextFromContext(ctx)

	traceId := spanCtx.TraceID()
	spaceId := spanCtx.SpanID()

	logger, err := zap.NewProduction()

	if err != nil {
		log.Printf("Failed to initialize logger: %s", err)
	}

	defer logger.Sync()
	slogger := logger.Sugar()

	slogger = slogger.With("trace_id", formatTraceId(traceId, traceType))
	slogger = slogger.With("span_id", spaceId)

	return slogger
}

// トレースタイプに応じて、トレースIDを整形する
func formatTraceId(ctx context.Context, traceIdType string) string {

	traceId := trace.SpanContextFromContext(ctx).TraceID().String()

	switch traceType {
	case "xray":
		// X-RayのトレースIDの仕様に変換する
		return fmt.Sprintf("1-%s-%s", traceId[0:8], traceId[8:])
	case "cloudtrace":
		// Cloud Traceの場合は、トレースIDの仕様はそのままとする
		return traceId
	}

	return traceId
}
```

> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L156-L160
> - https://aws.github.io/copilot-cli/en/docs/developing/observability/#including-trace-logs

<br>
