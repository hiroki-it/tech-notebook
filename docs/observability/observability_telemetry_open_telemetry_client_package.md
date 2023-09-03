---
title: 【IT技術の知見】クライアントパッケージ＠OpenTelemetry
description: クライアントパッケージ＠OpenTelemetryの知見を記録しています。
---

# クライアントパッケージ＠OpenTelemetry

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. TraceProvider

### TraceProviderとは

OpenTelemetryをセットアップし、スパンを作成する機能を提供する。

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=20
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=21

<br>

### TraceProviderの関数の要素

#### ▼ Resource

スパンにコンテキストを設定する。

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

#### ▼ SpanProcessor

スパンを処理する。

具体的には、`BatchSpanProcessor`関数を使用して、スパンをExporterで決めた宛先に送信できる。

> - https://opentelemetry-python.readthedocs.io/en/stable/sdk/trace.export.html?highlight=BatchSpanProcessor#opentelemetry.sdk.trace.export.BatchSpanProcessor
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=17

#### ▼ Exporter

スパンの宛先とするスパン収集ツール (例：AWS X-ray、Google CloudTrace、otelコレクター、など) を決める。

具体的には、`WithEndpoint`関数を使用して、宛先 (例：`localhost:4317`、`opentelemetry-collector.tracing.svc.cluster.local`、など) を設定できる。

> - https://zenn.dev/google_cloud_jp/articles/20230516-cloud-run-otel#%E3%82%A2%E3%83%97%E3%83%AA%E3%82%B1%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=18

#### ▼ Sampler

スパンのサンプリング率を設定する。

具体的には、`AlwaysOn` (`100`%) や`TraceIdRationBased` (任意の割合) でサンプリング率を設定できる。

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=19
> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=26

<br>

## 02. Goの場合

### 宛先が標準出力の場合

#### ▼ パッケージの初期化

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

otelクライアントパッケージを初期化する。

```go
package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.opentelemetry.io/otel"
  // スパンの宛先として、標準出力を設定する。
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func initTracer(shutdownTimeout time.Duration) (func(), error) {

	// 標準出力を宛先に設定する。
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

	// パッケージを定義する。
	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(attributes),
	)

	// パッケージをセットアップする。
	otel.SetTracerProvider(tracerProvider)

	// 最上流以外のマイクロサービスへのアウトバウンド通信がタイムアウトだった場合に、分散トレースを削除する。
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

> - https://speakerdeck.com/k6s4i53rx/fen-san-toresingutoopentelemetrynosusume?slide=12

#### ▼ 親スパンの作成

親スパンを作成し、下流マイクロサービスに親スパンのコンテキストを伝播する。

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

	// 定義したtracerパッケージ
	"github.com/hiroki-hasegawa/infrastructure/tracer"
)

func httpRequest(ctx context.Context) error {

	// 親スパンを作成する。
	var span trace.Span
	ctx, span = otel.Tracer("example.com/foo-service").Start(ctx, "foo")

	defer span.End()

	// アウトバウンド通信のリクエストヘッダーに、親スパンのコンテキストを伝播する。
	req, err := http.NewRequestWithContext(
		// 親スパンのコンテキスト
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
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/
> - https://zenn.dev/ww24/articles/beae98be198c94#%E8%A8%88%E8%A3%85
> - https://opentelemetry.io/docs/reference/specification/trace/sdk/#shutdown
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L42-L91

#### ▼ 子スパンの作成

子スパンを作成し、下流マイクロサービスに子スパンのコンテキストを伝播する。

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

	// 定義したtracerパッケージ
	"github.com/hiroki-hasegawa/foo/infrastructure/tracer"
)

func httpRequest(ctx context.Context) error {

	// 子スパンを作成する。親スパンからコンテキストを取得する必要はない。
	var span trace.Span

	ctx, span = otel.Tracer("example.com/bar-service").Start(ctx, "bar")

	defer span.End()

	// アウトバウンド通信のリクエストヘッダーに、子スパンのコンテキストを伝播する。
	req, err := http.NewRequestWithContext(
		// 子スパンのコンテキスト
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
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/#create-nested-spans
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L93-L101

#### ▼ アプリケーションの実行

```go
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

	// 下流マイクロサービスにリクエストを送信する。
	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```

<br>

### 宛先がotelコレクターの場合

#### ▼ パッケージの初期化

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

otelクライアントパッケージを初期化する。

```go
package main

import (
	"context"
	"fmt"

	"go.opentelemetry.io/otel"
  // スパンの宛先として、otelコレクターを設定する。
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.4.0"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var tracer = otel.Tracer("<マイクロサービス名>")

func initProvider() (func(context.Context) error, error) {

	ctx := context.Background()

	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceNameKey.String("<マイクロサービス名>"),
		),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create resource: %w", err)
	}

	var tracerProvider *sdktrace.TracerProvider

	conn, err := grpc.DialContext(
        ctx, "sample-collector.observability.svc.cluster.local:4317",
        grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock(),
    )

	if err != nil {
		return nil, fmt.Errorf("failed to create gRPC connection to collector: %w", err)
	}

	// Set up a trace exporter
	traceExporter, err := otlptracegrpc.New(ctx, otlptracegrpc.WithGRPCConn(conn))

	if err != nil {
		return nil, fmt.Errorf("failed to create trace exporter: %w", err)
	}

    var tracerProvider *sdktrace.TracerProvider

	bsp := sdktrace.NewBatchSpanProcessor(traceExporter)

	tracerProvider = sdktrace.NewTracerProvider(
		sdktrace.WithSampler(sdktrace.AlwaysSample()),
		sdktrace.WithResource(res),
		sdktrace.WithSpanProcessor(bsp),
	)

	otel.SetTracerProvider(tracerProvider)

	otel.SetTextMapPropagator(propagation.TraceContext{})

	return tracerProvider.Shutdown, nil
}
```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoBFF/app/controllers/otel.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoAPI/app/controllers/otel.go
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/controllers/otel.go

#### ▼ 親スパンの作成

親スパンを作成し、下流マイクロサービスに親スパンのコンテキストを伝播する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"text/template"
	"time"
	"todobff/app/SessionInfo"
	"todobff/config"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

// 親スパンを作成し、スパンとログにイベント名を記載する
func LoggerAndCreateSpan(c *gin.Context, msg string) trace.Span {

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

    ...

	return span
}
```

#### ▼ 子スパンの作成

子スパンを作成し、下流マイクロサービスに子スパンのコンテキストを伝播する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```go
package main

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"text/template"
	"time"
	"todobff/app/SessionInfo"
	"todobff/config"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
)

// 子スパンを作成し、スパンとログにイベント名を記載する
func LoggerAndCreateSpan(c *gin.Context, msg string) trace.Span {

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

    ...

	return span
}
```

#### ▼ アプリケーションの実行

```go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

// アプリケーションを実行する
func StartMainServer() {

    ...

    // otelコレクターへの接続を設定する
	shutdown, err := initProvider()

	if err != nil {
		log.Fatal(err)
	}

	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Fatal("failed to shutdown TracerProvider: %w", err)
		}
	}()

    // router 設定
	r := gin.New()

    ...

}

func checkSession() gin.HandlerFunc {

  return func(c *gin.Context) {

    defer LoggerAndCreateSpan(c, "セッションチェック開始").End()

    ...

		defer LoggerAndCreateSpan(c, "セッションチェック終了").End()
	}
}

func getIndex(c *gin.Context) {

	defer LoggerAndCreateSpan(c, "TODO画面取得").End()

	...

	defer LoggerAndCreateSpan(c, "UserAPI /getUserByEmail にポスト").End()

	...

	defer LoggerAndCreateSpan(c, "TodoAPI /getTodosByEmail にポスト").End()

	...

	defer LoggerAndCreateSpan(c, "TODO画面取得").End()

	...

	generateHTML(c, user, "index", "layout", "private_navbar", "index", "footer")
}
```

> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoBFF/app/controllers/utils.go#L60-L97
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/TodoAPI/app/utils/utils.go#L16-L53
> - https://github.com/cloudnativecheetsheet/opentelemetry/blob/main/02/app/UserAPI/app/utils/utils.go#L16-L53

<br>

## 03. Pythonの場合

### 宛先がGoogle CloudTraceの場合

#### ▼ パッケージの初期化

ここでは、FlaskというフレームワークでPythonのアプリケーションを作成したとする。

otelクライアントパッケージを初期化する。

```python
import time

from opentelemetry import trace
from opentelemetry.propagate import set_global_textmap
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor
# スパンの宛先として、Google CloudTraceを設定する。
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
# スパンの伝播方法として、Google CloudTraceを設定する。
from opentelemetry.propagators.cloud_trace_propagator import (CloudTraceFormatPropagator,)

# -------------------------------------
# cloud_trace_propagatorのセットアップ
# -------------------------------------
# X-Cloud-Trace-Contextを使用するように設定する
set_global_textmap(CloudTraceFormatPropagator())

# -------------------------------------
# cloud_trace_exporterのセットアップ
# -------------------------------------

# 任意のコンテキストを設定する
resource = Resource.create(
    {
        "service.name": "flask_e2e_client",
        "service.namespace": "examples",
        "service.instance.id": "instance554",
    }
)

tracer_provider = TracerProvider()

cloud_trace_exporter = CloudTraceSpanExporter()

tracer_provider.add_span_processor(
    BatchSpanProcessor(cloud_trace_exporter)
)

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

#### ▼ 親スパンの作成

親スパンを作成し、下流マイクロサービスに親スパンのコンテキストを伝播する。

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

    # 親スパンを作成する。
    with tracer.start_as_current_span("do_work"):
        time.sleep(0.1)

    ...
```

> - https://opentelemetry.io/docs/instrumentation/python/manual/
> - https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/flask/flask.html
> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L81-L97

#### ▼ 子スパンの作成

子スパンを作成し、下流マイクロサービスに子スパンのコンテキストを伝播する。

なお、親スパンであっても子スパンであっても、スパン作成の実装方法は同じである。

```python
# 実装例がないため未記載
```

#### ▼ アプリケーションの実行

```python
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from flask import Flask

tracer = trace.get_tracer(__name__)

app = Flask(__name__)

FlaskInstrumentor().instrument_app(app)

@app.route("/")
def hello_world():
    with tracer.start_as_current_span("do_work"):
        time.sleep(0.1)

    return "Hello, World!"
```

<br>
