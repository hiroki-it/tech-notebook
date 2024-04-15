---
title: 【IT技術の知見】ユーティリティパッケージ@Go
description: ユーティリティパッケージ@Goの知見を記録しています。
---

# ユーティリティパッケージ@Go

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## aws-lambda-go

### aws-lambda-goとは

以下のリンクを参考にせよ。

> - https://hiroki-it.github.io/tech-notebook/cloud_computing/cloud_computing_aws_resource_lambda_function.html

<br>

## aws-sdk-go-v2

### aws-sdk-go-v2とは

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2?tab=versions

<br>

### awsとは

汎用的な関数が同梱されている。

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws?tab=versions

ポインタ型からstring型に変換する`ToString`関数や、反対にstring型からポインタ型に変換する`String`関数をよく使用する。

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#String
> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#ToString

#### ▼ serviceパッケージ

記入中...

> - https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/service/amplify?tab=versions

<br>

## go-chi

### go-chiとは

ミドルウェア処理 (特にルーティング) のパッケージである。

```go
package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})

	http.ListenAndServe(":3000", r)
}
```

> - https://github.com/go-chi/chi

<br>

## go-grpc-middleware

gRPCに関するミドルウェア処理 (例：認証、ロギング、メトリクス、分散トレーシング、など) を持つ。

なお、gRPCはリモートプロシージャーコールであるため、ミドルウェア処理にルーティングは含まれない。

`v1`系と`v2`系があり、関数の引数の設定方法が異なる。

これを`Chain`関数に渡せば、gRPCで様々なインターセプターを簡単に実行できる。

> - https://github.com/grpc-ecosystem/go-grpc-middleware/tree/main#interceptors
> - https://github.com/grpc-ecosystem/go-grpc-middleware/blob/v2.0.0/examples/server/main.go#L136-L152

<br>

## gorm/plugin/opentelemetry

SQLの発行時に、SQLを属性に持つスパンを自動的に作成する。

> - https://github.com/go-gorm/opentelemetry

<br>

## grpc-gateway

HTTPで受信したリクエストをgRPCに変換してプロキシする。

> - https://github.com/grpc-ecosystem/grpc-gateway
> - https://grpc-ecosystem.github.io/grpc-gateway/

<br>

## grpc-go

### grpc-goとは

GoでgRPCを扱えるようにする。

> - https://github.com/grpc/grpc-go

<br>

### クライアント側

#### ▼ Dial

`DialContext`メソッドのラッパーであり、新しいコンテキストでgRPCサーバーとのコネクションを作成する。

執筆時点 (2024/04/06) で`Dial`メソッドは非推奨であり、`NewClient`メソッドが推奨である。

```go
func Dial(target string, opts ...DialOption) (*ClientConn, error) {
	return DialContext(context.Background(), target, opts...)
}
```

> - https://pkg.go.dev/google.golang.org/grpc#Dial

#### ▼ DialContext

既存コンテキストを使用して、gRPCサーバーとのコネクションを作成する。

執筆時点 (2024/04/06) で`DialContext`メソッドは非推奨であり、`NewClient`メソッドが推奨である。

```go
package main

import (
	"google.golang.org/grpc"
)

func main() {

	ctx := context.Background()

	...

	// gRPCサーバーとのコネクションを作成する
	conn, err := grpc.DialContext(
		ctx,
		":7777",
	)

	...
}
```

> - https://pkg.go.dev/google.golang.org/grpc#DialContext

#### ▼ NewClient

> - https://pkg.go.dev/google.golang.org/grpc#NewClient

#### ▼ WithBlock

コネクションを確立できるまで待機する。

```go
package main

import (
	"google.golang.org/grpc"
)

func main() {

	ctx := context.Background()

	...

	// gRPCサーバーとのコネクションを作成する
	conn, err := grpc.DialContext(
		ctx,
		":7777",
		grpc.WithBlock(),
	)

	...
}
```

#### ▼ WithTransportCredentials

gRPCサーバーへの通信をTLS化するかどうかを設定する。

```go
package main

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {

	ctx := context.Background()

	...

	// gRPCサーバーとのコネクションを作成する
	conn, err := grpc.DialContext(
		ctx,
		":7777",
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)

	...
}
```

<br>

### サーバー側

#### ▼ NewServer

既存コンテキストを使用して、gRPCサーバーとのコネクションを作成する。

```go
package main

import (
	"google.golang.org/grpc"
)

func main() {

	...

	// gRPCサーバーを作成する
	server := grpc.NewServer()

	...
}
```

<br>

## otel

### Tracer

#### ▼ Tracerとは

スパンを作成するためのTracerを作成する。

#### ▼ Start

通常、OpenTelemetryのミドルウェアを実行すると、アプリケーションの最初の関数 (主に`main`関数) で自動的にスパンを作成する。

Tracerの`Start`関数を使用すると、これの子スパンを手動で作成することができ、最初の関数の内部でコールされた別の関数の処理時間を計測できるようになる。

```go
package main

import (
	"go.opentelemetry.io/otel"
)

func main()  {

	// ここでOpenTelemetryのミドルウェアを使用すると仮定する
	// main関数のスパンを自動的に作成する

	...

	// main関数の子スパンとして、foo関数のスパンを手動的に作成する
	foo()

	...
}

func foo()  {

	// Tracerを作成する
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
	)

	defer span.End()
}
```

### GetTextMapPropagator

#### ▼ GetTextMapPropagatorとは

設定したPropagatorを取得する。

#### ▼ Extract

リクエストの受信側で、Carrierからトレースコンテキストを抽出する。

```go
package middleware

import (
	"net/http"

	"go.opentelemetry.io/otel/propagation"
)

func fooHandler(w http.ResponseWriter, r *http.Request) {

	...

	// Carrierのトレースコンテキストを抽出して、既存コンテキストに設定する
	ctx := otel.GetTextMapPropagator().Extract(
		// 抽出したトレースコンテキストの設定先とする既存コンテキストを設定する
		r.Context(),
		// Carrierとして使用するHTTPヘッダーを設定し、トレースコンテキストを抽出する
		propagation.HeaderCarrier(w.Header()),
	)

	...

}
```

> - https://zenn.dev/google_cloud_jp/articles/20230626-pubsub-trace#%E4%B8%80%E8%88%AC%E7%9A%84%E3%81%AA%E3%83%88%E3%83%AC%E3%83%BC%E3%82%B9%E6%83%85%E5%A0%B1%E3%81%AE%E4%BC%9D%E6%90%AC%E6%89%8B%E9%A0%86
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/instrumentation/net/http/otelhttp/v0.42.0/instrumentation/net/http/otelhttp/handler.go#L131
> - https://ymtdzzz.dev/post/opentelemetry-async-tracing-with-custom-propagator/

#### ▼ Inject

リクエストの送信側で、トレースコンテキストをCarrierに注入する。

```go
package middleware

import (
	"net/http"

	"go.opentelemetry.io/otel/propagation"
)

func fooHandler(w http.ResponseWriter, r *http.Request) {

	...

	otel.GetTextMapPropagator().Inject(
		// トレースコンテキストを持つ既存コンテキストを設定する
		r.Context(),
		// Carrierとして使用するHTTPヘッダーを設定し、トレースコンテキストを注入する
		propagation.HeaderCarrier(w.Header()),
	)

	...

}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/instrumentation/net/http/otelhttp/v0.42.0/instrumentation/net/http/otelhttp/transport.go#L114
> - https://uptrace.dev/opentelemetry/opentelemetry-traceparent.html
> - https://ymtdzzz.dev/post/opentelemetry-async-tracing-with-custom-propagator/

<br>

## otel/propagation

### otel/propagationとは

OpenTelemetryのPropagation

<br>

### HeaderCarrier

HTTPヘッダーをCarrierとして使用できるようにする。

`TextMapCarrier`インターフェースの実装である。

```go
type HeaderCarrier http.Header
```

`Header`関数を`HeaderCarrier`に変換することで、HTTPヘッダーをCarrierとして使用する。

```go
package middleware

import (
	"net/http"

	"go.opentelemetry.io/otel/propagation"
)

func fooHandler(w http.ResponseWriter, r *http.Request) {

	...

	// Carrierのトレースコンテキストを抽出して、既存コンテキストに設定する
	ctx := otel.GetTextMapPropagator().Extract(
	    // 抽出したトレースコンテキストの設定先とする既存コンテキストを設定する
		r.Context(),
		// Carrierとして使用するHTTPヘッダーを設定し、トレースコンテキストを抽出する
		propagation.HeaderCarrier(w.Header()),
	)

	...

}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/propagation#HeaderCarrier

Ginでも同様にして、HTTPヘッダーを`HeaderCarrier`に渡す。

```go
package middleware

import (
	"github.com/gin-gonic/gin"

	"go.opentelemetry.io/otel/propagation"
)

func fooHandler(ginCtx *gin.Context) {

	...

	// Carrierのトレースコンテキストを抽出して、既存コンテキストに設定する
	ctx := otel.GetTextMapPropagator().Extract(
		// 抽出したトレースコンテキストの設定先とする既存コンテキストを設定する
		ginCtx.Request.Context(),
		// Carrierとして使用するHTTPヘッダーを設定し、トレースコンテキストを抽出する
		propagation.HeaderCarrier(ginCtx.Request.Header),
	)

	...

}
```

<br>

### NewCompositeTextMapPropagator

渡された複数のPropagatorからなるComposite Propagatorを作成する。

> - https://pkg.go.dev/go.opentelemetry.io/otel/propagation#NewCompositeTextMapPropagator

<br>

### TextMapPropagator

複数のPropagatorを持つ。

`Fields`関数でPropagator名を取得できる。

```go
package main

import (
	"go.opentelemetry.io/contrib/propagators/autoprop"
	"go.opentelemetry.io/otel/propagation"
)

func main()  {

	...

	propagator := autoprop.NewTextMapPropagator()

	// 受信したリクエストのCarrierからトレースコンテキストを抽出し、送信するリクエストのCarrierにトレースコンテキストを注入できるようにする。
	otel.SetTextMapPropagator(
		// Composit Propagatorを設定する
		propagator
	)

	// TextMapPropagatorのFields関数でPropagator名を取得する
	propagatorList := propagator.Fields()

	sort.Strings(propagatorList)

	// ログにpropagator名を出力しておく
	log.Printf("Info: Propagator %v initialize successfully", propagatorList)

	...
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/propagation#TextMapPropagator

<br>

## otel/sdk

### otel/sdkとは

OpenTelemetryのTracerProviderを作成する。

<br>

## otel/trace

### otel/traceとは

記入中...

<br>

### ContextWithSpanContext

`SpanContext`を既存コンテキストに設定する。

コンテキストの持つデッドラインやキャンセルは不要で、`SpanContext`のみを引き継ぐ場合に使える。

```go
package server

import (
	"context"

	"github.com/gin-gonic/gin"
)

func fooHandler(ginCtx *gin.Context) {

	...

	ctx := trace.ContextWithSpanContext(
		// Ginコンテキストのデッドライン値やキャンセル関数を引き継ぎたくないため、新しくコンテキストを作成する
		context.Background(),
		// GinコンテキストのSpanContextを取得する
		trace.SpanContextFromContext(ginCtx.Request.Context()),
	)

	...

}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#ContextWithSpanContext

<br>

### IsRecording

現在のメソッドでスパンを作成した場合は、記録中として`true`になる。

現在のメソッドでスパンを作成していない場合は、`false`になる。

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
	var tracer = otel.Tracer("計装パッケージ名")

	ctx, span := tracer.Start(
		ctx,
		"foo",
	)

	// スパンを処理中の場合は true になる
	log.Printf("recording span: %v", span.IsRecording())

	defer span.End()
}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/sdk/trace/span.go#L167-L177

<br>

### RecordError

エラーのイベントを現在のスパンに設定する。

内部的には、`AddEvent`関数に`exception`イベントを渡している。

`IsRecording`関数が`false`の場合 (現在のメソッドでスパンを作成していない場合) は、使用できない。

```go
package server

import (
	"context"
	"net/http"

	"go.opentelemetry.io/otel/trace"
	"go.opentelemetry.io/otel/codes"
)

func fooHandler(ctx context.Context) {

    ...

	tracer := otel.Tracer("<計装パッケージ名>")

	ctx, span := tracer.Start(
		ctx,
		"foo-service",
	)

	req, err := http.NewRequest(
		"GET",
		"https://example.com",
		nil,
	)

	if err != nil {
		http.Error(w, err.Error(), 500)
		// エラーをスパンに設定する
		span.RecordError(err.Error())
		return
	}

	...

}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/sdk/trace/span.go#L421-L443

<br>

### SetStatus

ステータス (`Unset`、`OK`、`Error`) とエラーメッセージを現在のスパンに設定する。

`IsRecording`関数が`false`の場合 (現在のメソッドでスパンを作成していない場合) は、使用できない。

```go
package server

import (
	"context"
	"net/http"

	"go.opentelemetry.io/otel/trace"
	"go.opentelemetry.io/otel/codes"
)

func fooHandler(ctx context.Context) {

    ...

	tracer := otel.Tracer("<計装パッケージ名>")

	ctx, span := tracer.Start(
		ctx,
		"foo-service",
	)

	req, err := http.NewRequest(
		"GET",
		"https://example.com",
		nil,
	)

	if err != nil {
		http.Error(w, err.Error(), 500)
		// ステータスとエラーをスパンに設定する
		span.SetStatus(codes.Error, err.Error())
		return
	}

	...

}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/sdk/trace/span.go#L179-L199
> - https://opentelemetry.io/docs/languages/go/instrumentation/#set-span-status

<br>

### SpanContext

トレースコンテキストがもつスパン情報の実体である。

```go
type SpanContext struct {
	traceID    TraceID
	spanID     SpanID
	traceFlags TraceFlags
	traceState TraceState
	remote     bool
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanContext

<br>

### SpanContextFromContext

既存コンテキストから`SpanContext`のみを取得する。

現在のメソッドでスパンを作成していない場合は、上の階層のスパンを取得できる。

```go
package server

import (
	"context"

	"github.com/gin-gonic/gin"
)

func fooHandler(ctx context.Context) {

	...

	spanCtx := trace.SpanContextFromContext(ctx)

    // トレースIDを確認する
	log.Printf("traceid: %v", spanCtx.TraceID())

    // スパンIDを確認する
	log.Printf("spanid: %v", spanCtx.SpanID())

    // tracestate値を確認する
	log.Printf("tracestate: %v", spanCtx.TraceState())

	...

}
```

コンテキストの持つデッドラインやキャンセルは不要で、`SpanContext`のみを引き継ぐ場合に使える。

```go
package server

import (
	"context"

	"github.com/gin-gonic/gin"
)

func fooHandler(ginCtx *gin.Context) {

	...

	ctx := trace.ContextWithSpanContext(
		// Ginコンテキストのデッドライン値やキャンセル関数を引き継ぎたくないため、新しくコンテキストを作成する
		context.Background(),
		// GinコンテキストのSpanContextを取得する
		trace.SpanContextFromContext(ginCtx.Request.Context()),
	)

	...

}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel/trace#SpanContextFromContext

<br>

### SpanFromContext

スパンIDから既存コンテキストからスパンを取得する。

現在のメソッドでスパンを作成していない場合は、上の階層のスパンを取得できる。

```go
package server

import (
	"context"

	"github.com/gin-gonic/gin"
)

func fooHandler(ginCtx *gin.Context) {

	...

	tracer := otel.Tracer("<計装パッケージ名>")

	ctx, _ := tracer.Start(
		ctx,
		"foo-service",
	)

	...

	span := trace.SpanFromContext(ctx)

	...

}
```

> - https://github.com/open-telemetry/opentelemetry-go/blob/v1.25.0/trace/context.go#L45

<br>

## otelgin

### otelginとは

受信したリクエストのCarrier (HTTPヘッダー) からGinコンテキスト (`gin.Context`) を自動的に抽出 (Extract) しつつ、送信するリクエストのCarrier (HTTPヘッダー) にGinコンテキスト (`gin.Context`) を自動的に注入 (Inject) する。

また、事前のミドルウェア処理としてスパンを自動的に作成する (事後のミドルウェア処理には`otelhttp`パッケージを使う) 。

各メソッドで事前にスパンを作成する必要がなくなる。

`otelgin`パッケージを使用しない場合、これらを自前で実装する必要がある。

<br>

### Middleware

リクエスト受信時のミドルウェア処理として`otelgin`パッケージを設定する。

```go
package main

import (
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {

	...

	router := gin.New()

	router.Use(otelgin.Middleware("foo-service"))

	router.GET("/foo", fooHandler)

	router.Run(":8080")
}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin#Middleware

<br>

## otelgorm

### otelgormとは

クエリ実行前のミドルウェア処理としてスパンを自動的に作成し、事後にはこのスパンにSQLステートメント (`gorm.Create`、`gorm.Query`、`gorm.Delete`、`gorm.Update`、`gorm.Row`、`gorm.Raw`) を自動的に設定する。

各永続化メソッドでスパンを作成したり、SQLステートメントを設定する必要がなくなる。

`otelgorm`パッケージを使用しない場合、これらを自前で実装する必要がある。

```go
func (p *otelPlugin) before(spanName string) gormHookFunc {
	return func(tx *gorm.DB) {
		if tx.DryRun && !p.includeDryRunSpans {
			return
		}
		// 実行中のgormクエリからコンテキストを取得する
		ctx := tx.Statement.Context
		ctx = context.WithValue(ctx, parentCtxKey{}, ctx)
		// スパンを作成する
		ctx, _ = p.tracer.Start(ctx, spanName, trace.WithSpanKind(trace.SpanKindClient))
		tx.Statement.Context = ctx
	}
}

func (p *otelPlugin) after() gormHookFunc {
	return func(tx *gorm.DB) {
		if tx.DryRun && !p.includeDryRunSpans {
			return
		}
		span := trace.SpanFromContext(tx.Statement.Context)
        // スパンを処理していない場合は、処理を終える
		if !span.IsRecording() {
			return
		}
		defer span.End()

		attrs := make([]attribute.KeyValue, 0, len(p.attrs)+4)
		attrs = append(attrs, p.attrs...)

		if sys := dbSystem(tx); sys.Valid() {
			attrs = append(attrs, sys)
		}

		vars := tx.Statement.Vars
		if p.excludeQueryVars {
			vars = make([]interface{}, len(tx.Statement.Vars))

			for i := 0; i < len(vars); i++ {
				vars[i] = "?"
			}
		}

		// SQLステートメントを取得する
		query := tx.Dialector.Explain(tx.Statement.SQL.String(), vars...)

		// SQLステートメントをスパンの属性に設定する
		attrs = append(attrs, semconv.DBStatementKey.String(p.formatQuery(query)))
		if tx.Statement.Table != "" {
			attrs = append(attrs, semconv.DBSQLTableKey.String(tx.Statement.Table))
		}
		if tx.Statement.RowsAffected != -1 {
			attrs = append(attrs, dbRowsAffected.Int64(tx.Statement.RowsAffected))
		}

		span.SetAttributes(attrs...)
		switch tx.Error {
		case nil,
			gorm.ErrRecordNotFound,
			driver.ErrSkip,
			io.EOF,
			sql.ErrNoRows:
		default:
			span.RecordError(tx.Error)
			span.SetStatus(codes.Error, tx.Error.Error())
		}

		switch parentCtx := tx.Statement.Context.Value(parentCtxKey{}).(type) {
		case context.Context:
			tx.Statement.Context = parentCtx
		}
	}
}
```

> - https://github.com/uptrace/opentelemetry-go-extra/blob/v0.2.4/otelgorm/otelgorm.go#L101-L169

<br>

### NewPlugin

クエリ実行前のミドルウェア処理として`otelgin`パッケージを設定する。

```go
package db

import (
	"github.com/uptrace/opentelemetry-go-extra/otelgorm"
	"gorm.io/gorm"
)

func NewDb()  {

	db, err := gorm.Open(mysql.Open("<DBのURL>"), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	// ミドルウェアを設定する
	if err := db.Use(otelgorm.NewPlugin()); err != nil {
		panic(err)
	}

	...
}
```

> - https://github.com/uptrace/opentelemetry-go-extra/tree/main/otelgorm

<br>

## otelgrpc

### otelgrpcとは

受信したリクエストのCarrier (メタデータ) からコンテキストを自動的に抽出 (Extract) しつつ、送信するリクエストのCarrier (メタデータ) にコンテキストを自動的に注入 (Inject) する。

また、事前/事後のミドルウェア処理としてスパンを自動的に作成する。

各メソッドで事前/事後にスパンを作成する必要がなくなる。

`otelgrpc`パッケージを使用しない場合、これらを自前で実装する必要がある。

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc
> - https://blog.cybozu.io/entry/2023/04/12/170000
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/main/instrumentation/google.golang.org/grpc/otelgrpc/interceptor.go#L86-L91
> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/main/instrumentation/google.golang.org/grpc/otelgrpc/interceptor.go#L302-L307

<br>

### metadataSupplier

gRPCのメタデータをCarrierとして使用できるようにする。

`TextMapCarrier`インターフェースの実装である。

プライベートな構造体であり、クライアント側とサーバー側のインターセプター内で使用するようになっている。

```go
type metadataSupplier struct {
	metadata *metadata.MD
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/instrumentation/google.golang.org/grpc/otelgrpc/v0.50.0/instrumentation/google.golang.org/grpc/otelgrpc/metadata_supplier.go#L16-L18

<br>

### クライアント側

#### ▼ ClientInterceptor系メソッド

gRPCリクエスト送信時のインターセプター処理として`otelgrpc`パッケージを設定する。

抽出時のメタデータは、`mdOutgoingKey`キーと`rawMD{md: <メタデータ>}`で登録される。

そのため、ユーザー定義のメタデータは`mdOutgoingKey`キーで登録できるOutgoingContext系メソッドで設定する必要がある。

執筆時点 (2024/03/31) でClientInterceptor系メソッドは非推奨であり、`NewClientHandler`メソッドが推奨である。

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"
)

func main() {

	ctx := context.Background()

	...

	// gRPCサーバーとのコネクションを作成する
	conn, err := grpc.DialContext(
		ctx,
		":7777",
		// クライアント側のミドルウェア処理としてUnaryClientInterceptorを挿入する
		grpc.WithUnaryInterceptor(
			otelgrpc.UnaryClientInterceptor(),
		),
	)

	...
}
```

内部的には、リクエストの送信直前のミドルウェア処理として、注入処理を実行している。

```go
func inject(ctx context.Context, propagators propagation.TextMapPropagator) context.Context {

    // コンテキストにメタデータがあれば取得する
    md, ok := metadata.FromOutgoingContext(ctx)

    // メタデータがなければ作成する
	if !ok {
		md = metadata.MD{}
	}

	propagators.Inject(
	    // トレースコンテキストを持つ既存コンテキストを設定する
        ctx,
		// Carrierとして使用するメタデータを設定し、トレースコンテキストを注入する
	    &metadataSupplier{
		    metadata: &md,
    	},
    )

	// メタデータをコンテキストに設定する
	return metadata.NewOutgoingContext(ctx, md)
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/instrumentation/google.golang.org/grpc/otelgrpc/v0.49.0/instrumentation/google.golang.org/grpc/otelgrpc/metadata_supplier.go#L65-L74

#### ▼ NewClientHandler

執筆時点 (2024/03/31) でClientInterceptor系メソッドは非推奨になっており、これの移行先である。

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
	conn, err := grpc.DialContext(
        ctx,
		":7777",
		// クライアント側を一括でセットアップする
		grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
	)

	...

}
```

<br>

### サーバー側

#### ▼ ServerInterceptor系メソッド

gRPCリクエスト受信時のインターセプター処理として`otelgrpc`パッケージを設定する。

抽出時のメタデータは`mdIncomingKey`キーと`rawMD{md: <メタデータ>}`で登録される。

そのため、ユーザー定義のメタデータは`mdIncomingKey`キーで登録できるOutgoingContext系メソッドで設定する必要がある。

執筆時点 (2024/03/31) でServerInterceptor系メソッドは非推奨であり、`NewServerHandler`メソッドが推奨である。

```go
func extract(ctx context.Context, propagators propagation.TextMapPropagator) context.Context {

    // コンテキストにメタデータがあれば取得する
	md, ok := metadata.FromIncomingContext(ctx)

    // メタデータがなければ作成する
	if !ok {
		md = metadata.MD{}
	}

	return propagators.Extract(
    	// 抽出したトレースコンテキストの設定先とする既存コンテキストを設定する
	    ctx,
        // Carrierとして使用するメタデータを設定する
        &metadataSupplier{
            metadata: &md,
	    },
    )
}
```

> - https://github.com/open-telemetry/opentelemetry-go-contrib/blob/instrumentation/google.golang.org/grpc/otelgrpc/v0.49.0/instrumentation/google.golang.org/grpc/otelgrpc/metadata_supplier.go#L89-L98

#### ▼ NewServerHandler

執筆時点 (2024/03/31) でServerInterceptor系メソッドは非推奨になっており、これの移行先である。

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"
)

func main()  {

	...

    // gRPCサーバーを作成する
	conn, err := grpc.NewServer(
		grpc.StatsHandler(otelgrpc.NewServerHandler(
			    otelgrpc.WithFilter(filters.Not(filters.HealthCheck()),
			),
		),
	)

	defer conn.Close()
}
```

#### ▼ WithInterceptorFilter

サーバー側でスパンを作成しないリクエストを設定する。

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"
)

func main()  {

	...

    // gRPCサーバーを作成する
	conn, err := grpc.NewServer(
		// 単項RPCのサーバーインターセプターを設定する
		grpc.ChainUnaryInterceptor(
			otelgrpc.UnaryServerInterceptor(
				// ヘルスチェックパスではスパンを作成しない
			    otelgrpc.WithInterceptorFilter(filters.Not(filters.HealthCheck())),
			),
        ),
	)

	defer conn.Close()
}
```

> - https://logmi.jp/tech/articles/328568

#### ▼ filters.Not

スパンを作成しない条件を設定する。

```go
package main

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters"
	"google.golang.org/grpc"
)

func main()  {

	...

    // gRPCサーバーを作成する
	conn, err := grpc.NewServer(
		// 単項RPCのサーバーインターセプターを設定する
		grpc.ChainUnaryInterceptor(
			otelgrpc.UnaryServerInterceptor(
				// ヘルスチェックパスではスパンを作成しない
			    otelgrpc.WithInterceptorFilter(filters.Not(filters.HealthCheck())),
				// 指定したgRPCサービスではスパンを作成しない
				otelgrpc.WithInterceptorFilter(filters.Not(filters.ServiceName("<gRPCサービス名>"))),
				// 指定したgRPCメソッドではスパンを作成しない
				otelgrpc.WithInterceptorFilter(filters.Not(filters.MethodName("<gRPCメソッド名>"))),
			),
        ),
	)

	defer conn.Close()
}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc/filters#Not

<br>

### クライアント/サーバー共通

#### ▼ WithSpanOptions

スパンに付与するオプションを設定する。

```go
package grpc

import (
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.opentelemetry.io/otel/attribute"
)

func ChainUnaryServerInterceptor() grpc.UnaryServerInterceptor {

	// 共通のミドルウェア処理としてUnaryServerInterceptorを挿入する
	return otelgrpc.UnaryServerInterceptor(
		otelgrpc.WithSpanOptions(
			// 属性を設定する
			trace.WithAttributes(attribute.String("env", "<実行環境名>")),
        ),
	)
}
```

#### ▼ WithSpanNameFormatter (オプションなし)

gRPCにこのオプションはない。

gRPCの場合、リモートプロシージャーコールなため、スパン名はメソッド名とするとよい。

<br>

## otelhttp

### otelhttpとは

受信したリクエストのCarrier (HTTPヘッダー) からコンテキストを自動的に抽出 (Extract) しつつ、送信するリクエストのCarrier (HTTPヘッダー) にコンテキストを自動的に注入 (Inject) する。

また、事前/事後のミドルウェア処理としてスパンを自動的に作成する。

各メソッドで事前/事後にスパンを作成する必要がなくなる。

`otelhttp`パッケージを使用しない場合、これらを自前で実装する必要がある。

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp
> - https://blog.cybozu.io/entry/2023/04/12/170000
> - https://qiita.com/atsu_kg/items/c3ee8141e4638957a947#incoming-request
> - https://qiita.com/atsu_kg/items/c3ee8141e4638957a947#outgoing-request

<br>

### クライアント側

#### ▼ NewTransport

リクエスト送信時のミドルウェア処理として`otelhttp`パッケージを設定する。

```go
package main

import (
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	...

	// HTTPサーバーとのコネクションを作成する
	client := http.Client{
	    Transport: otelhttp.NewTransport(http.DefaultTransport)
	}

	...

}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp#NewTransport
> - https://qiita.com/atsu_kg/items/c3ee8141e4638957a947#outgoing-request

<br>

### サーバー側

#### ▼ NewHandler

リクエスト受信時のミドルウェア処理として`otelhttp`パッケージを設定する。

```go
package main

import (
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	// HttpHandlerを作成する
	fn := func(w http.ResponseWriter, r *http.Request) {
		...
	}

	// サーバー側のミドルウェア処理としてNewHandlerを挿入する
	otelMiddleware := otelhttp.NewHandler(
		fn,
        // Operation名を設定する
		"foo-service",
	)
}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp#NewHandler
> - https://qiita.com/atsu_kg/items/c3ee8141e4638957a947#incoming-request

#### ▼ WithFilter

サーバー側でスパンを作成しないリクエストを設定する。

```go
package main

import (
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	// HttpHandlerを作成する
	fn := func(w http.ResponseWriter, r *http.Request) {
		...
	}

	// サーバー側のミドルウェア処理としてNewHandlerを挿入する
	otelMiddleware := otelhttp.NewHandler(
		fn,
		// Operation名を設定する
		"foo-service",
		otelhttp.WithFilter(filters.All(filters.Not(filters.Path("ヘルスチェックパス")))),
	)
}
```

> - https://logmi.jp/tech/articles/328568

<br>

### クライアント/サーバー共通

#### ▼ WithSpanOptions

スパンに付与する属性を設定する。

```go
package http

import (
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func SetSpanOptions() otelhttp.Option {

	return otelhttp.WithSpanOptions(
		trace.WithAttributes(attribute.String("env", "<実行環境名>")),
	)
}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp#WithSpanOptions

#### ▼ WithSpanNameFormatter

スパン名を生成する関数を設定する。

HTTPの場合、スパン名はURLにするとよい。

```go
package http

import (
	"fmt"
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func SetSpanNameFormatter(next http.Handler) http.Handler {

	return otelhttp.WithSpanNameFormatter(func(operation string, r *http.Request) string {
		// URLパスをスパン名とする
		spanName := r.URL.Path
		if spanName == "" {
			spanName = fmt.Sprintf("HTTP %s route not found", r.Method)
		}
		return spanName
	})
}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp#WithSpanNameFormatter

<br>

## otlptracegrpc

### otlptracegrpcとは

OTLP形式でテレメトリーを送信するExporterを作成する。

これは、gRPCによるHTTPプロトコルで監視バックエンド (デフォルトでは` https://127.0.0.1:4317`) に送信する。

OpenTelemetry Collectorを使用している場合、ReceiverのgRPC用のエンドポイントに合わせる。

> - https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc

<br>

## otlptracehttp

### otlptracehttpとは

OTLP形式でテレメトリーを送信するExporterを作成する。

これは、HTTPプロトコルで監視バックエンド (デフォルトでは`https://127.0.0.1:4318/v1/traces`) に送信する。

OpenTelemetry Collectorを使用している場合、ReceiverのHTTP用のエンドポイントに合わせる。

> - https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp

<br>

## sqlcommenter

### sqlcommenterとは

gormで発行したSQLにスパンの情報をコメントアウトとして付与する。

コメントアウトであるため、SQLの動作には影響がない。

```go
import (
    "database/sql"

    gosql "github.com/google/sqlcommenter/go/database/sql"
    sqlcommentercore "github.com/google/sqlcommenter/go/core"
    _ "github.com/lib/pq" // or any other database driver
)

var (
  db *sql.DB
  err error
)

func NewDB(

	...

	db, err = gosql.Open("<driver>", "<connectionString>",
		// SQLに付与するコメント
		sqlcommentercore.CommenterOptions{
		    Config: sqlcommentercore.CommenterConfig{<flag>:bool}
		    Tags  : sqlcommentercore.StaticTags{<tag>: string}
		}
    )

    ...

)
```

> - https://google.github.io/sqlcommenter/go/database_sql/

<br>

### sqlmock

#### ▼ New

```go
func NewDbMock(t *testing.T) (*gorm.DB, sqlmock.Sqlmock, error) {

	sqlDB, sqlMock, err := sqlmock.New()

	assert.NilError(t, err)

	// モックDBを作成する
	mockDB, err := gorm.Open(
		mysql.New(mysql.Config{
			Conn:                      sqlDB,
			SkipInitializeWithVersion: true,
		}),
		&gorm.Config{}
    )

	return mockDB, sqlMock, err
}
```

<br>

## propagator

### TextMapCarrier

Carrierのインターフェースである。

様々な計装ツールのCarrierがこのインターフェースの実装になっている。

`otel/propagation`パッケージには、HTTPヘッダーをCarrierとして使用するための`TextMapCarrier`インターフェースの実装がある。

> - https://qiita.com/behiron/items/cc02e77ed41103f4a195
> - https://pkg.go.dev/go.opentelemetry.io/otel/propagation#HeaderCarrier

<br>

### TextMapPropagator

#### ▼ TextMapPropagatorとは

Propagatorを複数持つ。

<br>

## propagator/autoprop

### propagator/autopropとは

> - https://pkg.go.dev/go.opentelemetry.io/contrib/propagators/autoprop#example-NewTextMapPropagator-Environment

<br>

### NewTextMapPropagator

`ote/propagation`パッケージの`NewCompositeTextMapPropagator`のラッパーであり、Composite Propagatorを作成する。

デフォルトでは、W3C Trace ContextとBaggageのComposite Propagatorになる。

また、`OTEL_PROPAGATORS`変数 (`tracecontext`、`baggage`、`b3`、`b3multi`、`jaeger`、`xray`、`ottrace`、`none`) でPropagator名をリスト形式 (`tracecontext,baggage,xray`) で指定していれば、上書きできる。

```go
package main

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

func main()  {

	...

	// デフォルトでは、W3C Trace ContextとBaggageになる
	otel.SetTextMapPropagator(autoprop.NewTextMapPropagator())

	...
}
```

```go
package main

import (
	"go.opentelemetry.io/contrib/propagators/aws/xray"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/propagation"
)

func main()  {

	...

	// Propagatorを追加する場合は、明示的に指定する
	// 環境変数でも良い
	otel.SetTextMapPropagator(autoprop.NewTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
		xray.Propagator{},
	))

	...
}
```

> - https://pkg.go.dev/go.opentelemetry.io/contrib/propagators/autoprop#NewTextMapPropagator

<br>

## testify

### testifyとは

モック、スタブ、アサーションの関数を作成する。

Goではオブジェクトの概念がないため、モックオブジェクトとは言わない。

<br>

### mock、assert

#### ▼ モック化

| よく使用するメソッド | 説明                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| なし                 | データとして、構造体に`Mock`を設定すれば、その構造体はモック化される。 |

**＊実装例＊**

AWSクライアントをモック化する。

```go
package amplify

import (
	"github.com/stretchr/testify/mock"
)

/**
 * AWSクライアントをモック化します。


 */
type MockedAwsClient struct {
	mock.Mock
}
```

#### ▼ スタブ化

| よく使用するメソッド      | 説明                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Mock.Called`メソッド     | 関数の一部の処理をスタブ化する時に使用する。関数に値が渡されたことをモックに伝える。                                         |
| `Arguments.Get`メソッド   | 関数の一部の処理をスタブ化する時に使用する。引数として、返却値の順番を渡す。ユーザー定義のデータ型を返却する処理を定義する。 |
| `Arguments.Error`メソッド | 関数の一部の処理をスタブ化する時に使用する。引数として、返却値の順番を渡す。エラーを返却する処理を定義する。                 |

**＊実装例＊**

関数の一部の処理をスタブ化し、これをAWSクライアントのモックに紐付ける。

```go
package amplify

import (
	aws_amplify "github.com/aws/aws-sdk-go-v2/service/amplify"
	"github.com/stretchr/testify/mock"
)

type MockedAmplifyAPI struct {
	mock.Mock
}

/**
 * AmplifyのGetBranch関数の処理をスタブ化します。


 */
func (mock *MockedAmplifyAPI) GetBranch(ctx context.Context, params *aws_amplify.GetBranchInput, optFns ...func(*aws_amplify.Options)) (*aws_amplify.GetBranchOutput, error) {
	arguments := mock.Called(ctx, params, optFns)
	return arguments.Get(0).(*aws_amplify.GetBranchOutput), arguments.Error(1)
}
```

> - https://pkg.go.dev/github.com/stretchr/testify/mock?tab=versions

#### ▼ アサーションメソッドによる検証

| よく使用するメソッド              | 説明                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Mock.On`メソッド                 | 関数の検証時に使用する。関数内部のスタブに引数として渡される値と、その時の返却値を定義する。   |
| `Mock.AssertExpectations`メソッド | 関数の検証時に使用する。関数内部のスタブが正しく実行されたか否かを検証する。                   |
| `assert.Exactly`メソッド          | 関数の検証時に使用する。期待値と実際値の整合性を検証する。値のみでなく、データ型も検証できる。 |

> - https://pkg.go.dev/github.com/stretchr/testify/mock?tab=versions
> - https://pkg.go.dev/github.com/stretchr/testify/assert?tab=versions

#### ▼ 事前処理と事後処理

テスト関数を実行する直前に、事前処理を実行する。

モックの作成のために使用すると良い。

事前処理と事後処理については、以下のリンクを参考にせよ。

| よく使用する関数 | 実行タイミング | 説明                                                                                                                                              |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SetupSuite`     | 1              | テストスイート内の全てのテストの事前処理として、一回だけ実行する。                                                                                |
| `SetupTest`      | 2              | テストスイート内の各テストの事前処理として、テストの度に事前に実行する。`BeforeTest`関数よりも前に実行されることに注意する。                      |
| `BeforeTest`     | 3              | テストスイート内の各テストの直前の事前処理として、テストの度に事前に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `AfterTest`      | 4              | テストスイート内の各テストの直後の事後処理として、テストの度に事後に実行する。必ず、『`suiteName`』『`testName`』を引数として設定する必要がある。 |
| `TearDownTest`   | 5              | テストスイート内の各テストの事後処理として、テストの度に事後に実行する。`BeforeTest`関数よりも後に実行されることに注意する。                      |
| `TearDownSuite`  | 6              | テストスイート内の全てのテストの事後処理として、一回だけ実行する。                                                                                |

**＊実装例＊**

事前にモックを作成するために、`BeforeTest`関数を使用する。

```go
package foo

import (
	"testing"
)

/**
 * 単体テストのテストスイートを構成する。


 */
type FooSuite struct {
	suite.Suite
	fooMock *FooMock
}

/**
 * 単体テストの直前の事前処理を実行する。


 */
func (suite *FooSuite) BeforeTest(suiteName string, testName string) {

	// モックを作成する。
	suite.fooMock = &FooMock{}
}

/**
 * 単体テストのテストスイートを実行する。


 */
func TestFooSuite(t *testing.T) {
	suite.Run(t, &FooSuite{})
}
```

```go
package foo

import (
	"github.com/stretchr/testify/assert"
)

/**
 * Methodメソッドが成功することを検証する。


 */
func (suite *FooSuite) TestMethod() {

	suite.T().Helper()

	// 事前処理で作成したモックを使用する。
	fooMock := suite.fooMock

	// 以降にテスト処理
}
```

> - https://github.com/google/go-github/blob/master/github/github_test.go#L36-L66

<br>

## validator

### validatorとは

<br>

### バリデーションとエラーメッセージ

```go
package validators

import (
	"fmt"

	"github.com/go-playground/validator"
)

type FoobarbazValidator struct {
	Foo string `json:"foo" validate:"required"`
	Bar string `json:"bar" validate:"required"`
	Baz string `json:"baz" validate:"required"`
}

// NewValidator コンストラクタ
func NewValidator() *Validator {

	return &Validator{}
}

// Validate バリデーションを実行します。
func (v *FoobarbazValidator) Validate() map[string]string {

	err := validator.New().Struct(v)

	var errorMessages = make(map[string]string)

	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			switch err.Field() {
			// フィールドごとにマップ形式でバリデーションメッセージを構成します。
			case "foo":
				errorMessages["foo"] = v.stringValidation(err)
				errorMessages["foo"] = v.requiredValidation(err)
			case "bar":
				errorMessages["bar"] = v.stringValidation(err)
			case "baz":
				errorMessages["baz"] = v.stringValidation(err)
				errorMessages["baz"] = v.requiredValidation(err)
			}
		}
	}

	return errorMessages
}

// stringValidation string型指定のメッセージを返却します。
func (v *FoobarbazValidator) stringValidation(err validator.FieldError) string {
	return fmt.Sprintf("%s は文字列のみ有効です", err.Field())
}

// requiredValidation 必須メッセージを返却します。
func (v *FoobarbazValidator) requiredValidation(err validator.FieldError) string {
	return fmt.Sprintf("%s は必須です", err.Field())
}
```

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/foobarbaz-repository/validators"
)

func main() {
	v := NewFoobarbazValidator()

	// JSONを構造体にマッピングします。
	err := json.Unmarshal([]byte(`{"foo": "test", "bar": "test", "baz": "test"}`), v)

	if err != nil {
		log.Print(err)
		return
	}

	// バリデーションを実行します。
	errorMessages := v.Validate()

	if len(errorMessages) > 0 {
		// マップをJSONに変換します。
		byteJson, _ := json.Marshal(errorMessages)
		log.Printf("%v", byteJson)
	}

	// エンコード結果を出力します。
	fmt.Println("データに問題はありません。")
}
```

<br>
