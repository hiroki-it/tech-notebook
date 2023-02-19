---
title: 【IT技術の知見】トレーサー＠OpenTelemetry
description: トレーサー＠OpenTelemetryの知見を記録しています。
---

# トレーサー＠OpenTelemetry

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Goトレーサー

### gRPCを使わない場合

#### ▼ 先頭のマイクロサービス

先頭のマイクロサービスでは、親スパンを作成する。

また、後続のマイクロサービスに親スパンのメタデータを伝播する。



```go
package tracer

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

	// 分散トレースの送信先 (例：標準出力、Jaeger、Zipkin、など) を設定する。
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

	// トレーサーを定義する。
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(attributes),
	)

	// トレーサーをセットアップする。
	otel.SetTracerProvider(tracerProvider)

	// 後続のマイクロサービスへのアウトバウンド通信がタイムアウトだった場合に、分散トレースを削除する。
	cleanUp := func() {
		ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		if err := tracerProvider.Shutdown(ctx); err != nil {
			log.Printf("Failed to shutdown tracer provider: %v", err)
		}
	}

	return cleanUp, nil
}
```

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
	
	// 定義したtracerパッケージ
    "github.com/hiroki-hasegawa/foo/infrastructure/tracer"
)

// httpRequest 親スパンを持つHTTPリクエストを作成する。
func httpRequest(ctx context.Context) error {

	// 親スパンを作成する。
	var parentSpan trace.Span
	ctx, parentSpan = otel.Tracer("example.com/foo-service").Start(ctx, "parent")

	defer parentSpan.End()

	// アウトバウンド通信のリクエストヘッダーに、親スパンのメタデータを伝播する。
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet, "https://example.com",
		http.NoBody,
	)

	if err != nil {
		return err
	}

	// リクエストの送信元になっているマイクロサービスがわかるようにする。
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

	// 後続のマイクロサービスにアウトバウンド通信を送信する。
	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```



> ↪️ 参考：
>
> - https://opentelemetry.io/docs/instrumentation/go/manual/
> - https://zenn.dev/ww24/articles/beae98be198c94#%E8%A8%88%E8%A3%85
> - https://opentelemetry.io/docs/reference/specification/trace/sdk/#shutdown
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L42-L91


#### ▼ 後続のマイクロサービス

後続のマイクロサービスでは、受信したインバウンド通信からメタデータを取得する。

また、子スパンを作成し、後続のマイクロサービスに子スパンのメタデータを伝播する。


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

	// 定義したtracerパッケージ
	"github.com/hiroki-hasegawa/foo/infrastructure/tracer"
)

func httpRequest(ctx context.Context) error {
	
	// 子スパンを作成する。親スパンからメタデータを取得する必要はない。
	var childSpan trace.Span
	ctx, childSpan = otel.Tracer("example.com/bar-service").Start(ctx, "child")

	defer childSpan.End()

	// アウトバウンド通信のリクエストヘッダーに、子スパンのメタデータを伝播する。
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet, "https://example.com",
		http.NoBody,
	)

	if err != nil {
		return err
	}

	// リクエストの送信元になっているマイクロサービスがわかるようにする。
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

	// 後続のマイクロサービスにアウトバウンド通信を送信する。
	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```



> ↪️ 参考：
>
> - https://opentelemetry.io/docs/instrumentation/go/manual/#create-nested-spans
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L93-L101



<br>
