---
title: 【IT技術の知見】Go＠クライアントパッケージ
description: Go＠クライアントパッケージの知見を記録しています。
---

# Go＠クライアントパッケージ

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

var tracer trace.Tracer

func newExporter(ctx context.Context)  {
}

func newTracerProvider(exporter sdktrace.SpanExporter) *sdktrace.TracerProvider {

	resourceWithAttirbute, err := resource.Merge(
		resource.Default(),
		// アプリ内の全ての処理に共通する属性を設定する
		// 処理ごとに異なる属性はスパンの作成時に設定する
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("ExampleService"),
		),
	)

	if err != nil {
		panic(err)
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
	"fmt"
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
        _ = tracerProvider.Shutdown(ctx)
    }()

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	...
}
```

> - https://opentelemetry.io/docs/languages/go/instrumentation/#getting-a-tracer
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/internal/global/state.go#L27-L39
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/internal/global/state.go#L57-L70

#### ▼ 親スパン作成 (クライアント側のみ)

親スパンを作成する。

```go
func parentFunction(ctx context.Context) {

	ctx, parentSpan := tracer.Start(
		ctx,
		"parent",
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

	ctx, parentSpan := tracer.Start(
		ctx,
		"parent",
		trace.WithAttributes(attribute.String("<キー名>", "<キー値>")),
    )

	defer parentSpan.End()

	childFunction(ctx)
}
```

> - https://opentelemetry.io/docs/languages/go/instrumentation/#span-attributes
> - https://blog.cybozu.io/entry/2023/04/12/170000

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

```go
func childFunction(ctx context.Context) {

	ctx, childSpan := tracer.Start(
		ctx,
		"child",
    )

	defer childSpan.End()
}

func main() {

	otel.SetTextMapPropagator(propagation.TraceContext{})
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

#### ▼ Google CloudTrace

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-go

<br>

## 02. アプリでgRPCを使わない場合

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

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
	"go.opentelemetry.io/otel/sdk/resource"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func InitTracerProvider(shutdownTimeout time.Duration) (func(), error) {

	// Exporter (スパンの宛先) として、標準出力を設定する。
	exporter := stdouttrace.New(
		// 見やすくなるように出力前に整形する
		stdouttrace.WithPrettyPrint(),
		// 標準出力または標準エラー出力を設定する
		stdouttrace.WithWriter(os.Stdout),
	)

	// マイクロサービスの属性情報を設定する。
	resourceWithAttributes := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.ServiceNameKey.String("foo-service"),
		semconv.ServiceVersionKey.String("1.0.0"),
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

	// ダウンストリーム側マイクロサービスからトレースコンテキストを抽出し、アップストリーム側マイクロサービスのリクエストにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
		// W3C Trace Context仕様のトレースコンテキストを伝播するためPropagatorを設定する
        propagation.TraceContext{},
    )

	// アップストリーム側マイクロサービスへのリクエストがタイムアウトだった場合に、処理をする。
	cleanUp := func() {

		// タイムアウト時間設定済みのトレースコンテキストを作成する
		ctx, cancel := context.WithTimeout(
            context.Background(),
            5 * time.Second,
        )

		// タイムアウトの場合に処理を中断する
        defer cancel()

        if err := tracerProvider.Shutdown(ctx); err != nil {
			log.Printf("Failed to shutdown tracer provider: %v", err)
		}
	}

	return cleanUp, nil
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

	// 現在の処理からトレースコンテキストを取得する。
	ctx, span = otel.Tracer("example.com/foo-service").Start(ctx, "foo")

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

    // 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		// 空のトレースコンテキストを作成する
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cleanUp, err := trace.InitTracerProvider(10 * time.Second)

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

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

現在の処理にトレースコンテキストを注入し、また子スパンを作成する。

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

	// 現在の処理にトレースコンテキストを注入する。
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

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)

	defer stop()

	cleanUp, err := trace.InitTracerProvider(10 * time.Second)

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

func NewTracerProvider() (func(context.Context) error, error) {

    // 空のトレースコンテキストを作成する
	ctx := context.Background()

	resourceWithAttributes, err := resource.New(
		ctx,
		// マイクロサービスの属性情報を設定する。
		resource.WithAttributes(semconv.ServiceNameKey.String("<マイクロサービス名>")),
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

	// 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
	otel.SetTextMapPropagator(
		// W3C Trace Context仕様のトレースコンテキストを伝播できるPropagatorを設定する
        propagation.TraceContext{},
    )

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

	// 現在の処理にトレースコンテキストを注入する。
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

    shutdown, err := NewTracerProvider()

    if err != nil {
	  	log.Print(err)
    }

    // 事後処理
    defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("Failed to shutdown tracer provider: %w", err)
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

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

現在の処理にトレースコンテキストを注入し、また子スパンを作成する。

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

	// 現在の処理にトレースコンテキストを注入する。
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

### 宛先がX-Rayの場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

パッケージを初期化し、トレースコンテキストを抽出する。

```go
package trace

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


func NewTracerProvider() (func(context.Context) error, error) {

	// 空のトレースコンテキストを作成する
	ctx := context.Background()

	resourceWithAttributes, err := resource.New(
        ctx,
		// マイクロサービスの属性情報を設定する。
		resource.WithAttributes(semconv.ServiceNameKey.String("sample")),
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

	var tracerProvider *sdktrace.TracerProvider

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

    // TracerProviderを作成する
	tracerProvider = sdktrace.New(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(resourceWithAttributes),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
		sdktrace.WithSpanProcessor(batchSpanProcessor),
		// X-Ray形式の各種IDを新しく作成する
		sdktrace.WithIDGenerator(xray.NewIDGenerator()),
	)

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	// 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
	otel.SetTextMapPropagator(
		// X-Ray形式のトレースコンテキストを伝播できるPropagatorを設定する
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

#### ▼ 親スパン作成

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

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)

	defer stop()

	shutdown, err := NewTracerProvider()

	if err != nil {
		log.Print(err)
	}

	// 事後処理
	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("Failed to shutdown tracer provider: %w", err)
		}
	}()

	r := gin.New()

	r.Use(otelgin.Middleware("sample"))

	r.GET("/sample", sample1)

	r.Run(":8080")
}

func parent(ctx *gin.Context) {

	var tracer = otel.Tracer("sample")

	// 現在の処理にトレースコンテキストを注入する。
	_, span := tracer.Start(
		ctx.Request.Context(),
		// サービス名
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

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

現在の処理にトレースコンテキストを注入し、また子スパンを作成する。

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

	// 割り込み処理を設定する
	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
	)

	defer stop()

	shutdown, err := NewTracerProvider()

	if err != nil {
		log.Print(err)
	}

	// 事後処理
	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Print("Failed to shutdown tracer provider: %w", err)
		}
	}()

	r := gin.New()

	r.Use(otelgin.Middleware("sample"))

	r.GET("/sample", sample1)

	r.Run(":8080")
}

func child(ctx *gin.Context) {

	var tracer = otel.Tracer("sample")

	// 現在の処理にトレースコンテキストを注入する。
	_, span := tracer.Start(
		ctx.Request.Context(),
		// サービス名
		"sample2",
	)

	time.Sleep(time.Second * 1)

	log.Println("sample2 done.")

	span.End()
}
```

> - https://zenn.dev/k6s4i53rx/articles/33d5aa4f6a124e#opentelemetry-go-%E3%82%92%E7%94%A8%E3%81%84%E3%81%9F%E3%82%A2%E3%83%97%E3%83%AA%E5%AE%9F%E8%A3%85%E3%81%A8-eks-%E3%81%B8%E3%81%AE%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/client.go
> - https://github.com/aws-observability/aws-otel-community/blob/master/sample-apps/go-sample-app/collection/http_traces.go
> - https://github.com/aws-observability/aws-otel-go/blob/main/sampleapp/main.go#L93-L97

#### ▼ ログへのID出力

`trace.Span`から取得できるトレースIDはW3C Trace Context仕様である。

そのため、もしX-Ray形式の各種IDを使用したい場合 (例：ログにX-Ray形式IDを出力したい)、変換処理が必要である。

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

	// CloudTraceを宛先に設定する。
	exporter, err := cloudtrace.New(cloudtrace.WithProjectID(projectID))

	if err != nil {
		return nil, err
	}

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

	return func() {
		err := tracerProvider.Shutdown(context.Background())
		if err != nil {
			log.Printf("error shutting down trace provider: %v", err)
		}
	}, nil
}

func installPropagators() {

	// 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
	otel.SetTextMapPropagator(
        // 複数のPropagatorを動的に選べるようにする
		propagation.NewCompositeTextMapPropagator(
			// CloudTrace形式のトレースコンテキストを伝播できるPropagatorを設定する
			gcppropagator.CloudTraceOneWayPropagator{},
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
	"context"
	"log"
	"os"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	installPropagators()

	shutdown, err := InitTracerProvider()

	if err != nil {
		log.Print(err)
	}

	defer shutdown()

	helloHandler := func(w http.ResponseWriter, r *http.Request) {

		ctx := r.Context()
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

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

現在の処理にトレースコンテキストを注入し、また子スパンを作成する。

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

	shutdown, err := InitTracerProvider()

	if err != nil {
		log.Print(err)
	}

	defer shutdown()

	helloHandler := func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
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

## 03. アプリでgRPCを使用する場合

### 宛先が標準出力の場合

#### ▼ パッケージ初期化とトレースコンテキスト抽出 (共通)

gRPCを使わない場合と実装方法は同じである。

```go
package trace

import (
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

	batchSpanProcessor := sdktrace.NewBatchSpanProcessor(exporter)

	// TracerProviderを作成する
	tracerProvider := sdktrace.New(
		// ExporterをTracerProviderに登録する
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
	)

	// TraceProviderインターフェースを実装する構造体を作成する
	otel.SetTracerProvider(tracerProvider)

	// 監視バックエンドが対応するトレースコンテキスト仕様を設定する必要がある
	otel.SetTextMapPropagator(
		// 複数のPropagatorを動的に選べるようにする
		propagation.NewCompositeTextMapPropagator(
			    // W3C Trace Context仕様のトレースコンテキストを伝播できるPropagatorを設定する
			    propagation.TraceContext{},
			    // W3C Baggage仕様のトレースコンテキストを伝播できるPropagatorを設定する
			    propagation.Baggage{},
			),
		)

	return tracerProvider, nil
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/v1.18.0/instrumentation/google.golang.org/grpc/otelgrpc/example/config/config.go
> - https://opentelemetry.io/docs/concepts/components/#language-specific-api--sdk-implementations

#### ▼ 親スパン作成 (クライアント側のみ)

gRPCクライアント側では、gRPCサーバーとのコネクションを作成する必要がある。

クライアント側では、ClientInterceptorを使用する。

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

    // gRPCサーバーとのコネクションを作成する
	conn, err := grpc.Dial(
		    ":7777",
            // クライアントのInterceptor
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
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

func main() {

	...

	// gRPCサーバーとのコネクションを作成する
	conn, err := grpc.Dial(
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

サーバー側では、ServerInterceptorを使用する。

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
		log.Print(err)
	}

	// 事後処理
	defer func() {
		if err := tracerProvider.Shutdown(context.Background()); err != nil {
			log.Printf("Failed to shutdown tracer provider: %v", err)
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
	"fmt"
	"log"
	"net"

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

## 04. メッセージキューを挟む場合

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

	// 認証情報を読み込む
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

#### ▼ 親スパン作成 (クライアント側のみ)

記入中...

#### ▼ トレースコンテキスト注入と子スパン作成 (サーバー側のみ)

```go
package main

import (
	"flag"
	"fmt"

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

	// 認証情報を読み込む
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))

	svc := sqs.New(sess)

	// キューURLを取得する
	urlResult, err := svc.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: queue,
	})

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

<br>
