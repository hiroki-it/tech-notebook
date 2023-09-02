---
title: 【IT技術の知見】クライアントパッケージ＠OpenTelemetry
description: クライアントパッケージ＠OpenTelemetryの知見を記録しています。
---

# クライアントパッケージ＠OpenTelemetry

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Go用パッケージ

### gRPCを使わない場合

#### ▼ 最上流のマイクロサービス

ここでは、フレームワークなしでGoアプリケーションを作成しているとする。

最上流のマイクロサービスでは、分散トレーシングをセットアップする

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

	// 分散トレースの宛先 (例：標準出力、Jaeger、Zipkin、など) を設定する。
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

	// 下流のマイクロサービスへのアウトバウンド通信がタイムアウトだった場合に、分散トレースを削除する。
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

親スパンを作成し、下流のマイクロサービスに親スパンのメタデータを伝播する。

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

	// 親スパンを作成する。
	var parentSpan trace.Span
	ctx, parentSpan = otel.Tracer("example.com/foo-service").Start(ctx, "parent")

	defer parentSpan.End()

	// アウトバウンド通信のリクエストヘッダーに、親スパンのメタデータを伝播する。
	req, err := http.NewRequestWithContext(
		// 親スパンのメタデータ
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

	// 下流のマイクロサービスにリクエストを送信する。
	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/
> - https://zenn.dev/ww24/articles/beae98be198c94#%E8%A8%88%E8%A3%85
> - https://opentelemetry.io/docs/reference/specification/trace/sdk/#shutdown
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L42-L91

#### ▼ 下流のマイクロサービス

下流のマイクロサービスでは、上流からのインバウンド通信からメタデータを取得する。

また、子スパンを作成し、下流のマイクロサービスに子スパンのメタデータを伝播する。

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
		// 子スパンのメタデータ
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

	// 下流のマイクロサービスにリクエストを送信する。
	if err := httpRequest(ctx); err != nil {
		panic(err)
	}
}
```

> - https://opentelemetry.io/docs/instrumentation/go/manual/#create-nested-spans
> - https://github.com/open-telemetry/opentelemetry-go/blob/e8023fab22dc1cf95b47dafcc8ac8110c6e72da1/example/jaeger/main.go#L93-L101

<br>

## 02. Python用パッケージ

### gRPCを使わない場合

#### ▼ 共通

ここでは、FlaskというフレームワークでPythonのアプリケーションを作成したとする。

監視バックエンドにスパンを送信できるようにする。

ここでは、Google Cloud Traceに送信するとする。

```python
import time

from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.propagate import set_global_textmap
from opentelemetry.propagators.cloud_trace_propagator import (CloudTraceFormatPropagator,)
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# -------------------------------------
# cloud_trace_propagatorのセットアップ
# -------------------------------------
# X-Cloud-Trace-Contextを使用するように設定する
set_global_textmap(CloudTraceFormatPropagator())

# -------------------------------------
# cloud_trace_exporterのセットアップ
# -------------------------------------
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

> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/client.py#L1-L65
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L1-L79

#### ▼ 最上流のマイクロサービス

最上流のマイクロサービスでは、分散トレーシングをセットアップする。

```python
import requests
from opentelemetry.instrumentation.requests import RequestsInstrumentor

RequestsInstrumentor().instrument()

res = requests.get("http://localhost:6000")
```

> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/client.py#L67-L69

#### ▼ 下流のマイクロサービス

下流のマイクロサービスでは、受信したインバウンド通信からメタデータを取得する。

また、子スパンを作成し、下流のマイクロサービスに子スパンのメタデータを伝播する。

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

> - https://cloud.google.com/trace/docs/setup/python-ot?hl=ja#export
> - https://github.com/GoogleCloudPlatform/opentelemetry-operations-python/blob/HEAD/docs/examples/flask_e2e/server.py#L81-L97

<br>
