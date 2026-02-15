---
title: 【IT技術の知見】汎用ロジック＠マイクロサービス
description: 汎用ロジック＠マイクロサービスの知見を記録しています。
---

# 汎用ロジック＠マイクロサービス

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## Microservice chassis

### 汎用パッケージ

#### ▼ telemetryパッケージ

```yaml
telemetry/
├── README.md
├── go.mod
├── go.sum
├── logger.go # Goのロガーを使用したセットアップ処理を実装する
├── metrics.go # prometheusパッケージを使用したセットアップ処理を実行する
└── trace.go # opentelemetryパッケージを使用したセットアップ処理を実行する
```

#### ▼ logger.go

```go
package telemetry

import (
	"bytes"
	"context"
	"encoding/hex"
	"fmt"
	"log/slog"
	"os"

	"go.opentelemetry.io/otel/trace"
)

var (
	nilTraceID trace.TraceID
	nilSpanID  trace.SpanID
)

func init() {
	SetupSlog(os.Getenv("APP_VERSION"), os.Getenv("APP_SERVICE"))
}

// SetupSlog is configure slog.
func SetupSlog(version, revision, service string) {
	// 中略
}

type traceContext struct {
	traceID string
	spanID  string
}

func extractContext(ctx context.Context) traceContext {
	spanCtx := trace.SpanContextFromContext(ctx)

	// 中略

	return data
}

func convertToXRayTraceID(traceID trace.TraceID) string {
	if traceID.IsValid() {
		return fmt.Sprintf("1-%s-%s", hex.EncodeToString(traceID[:4]), hex.EncodeToString(traceID[4:]))
	}
	return ""
}
```

#### ▼ metrics.go

代わりにサービスメッシュツールを使用できる。

```go
// metrics.go
package telemetry

package telemetry

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// SetupMetrics is configure prometheus.
func SetupMetrics(ctx context.Context) func() {
	metricServerMux := http.NewServeMux()

	// Prometheusが収集の対象とするエンドポイント (/metrics) を起動する
	metricServerMux.Handle("/metrics", promhttp.Handler())
	metricServer := &http.Server{Addr: ":2112", Handler: metricServerMux, ReadHeaderTimeout: 20 * time.Second}
	doneCh := make(chan struct{})
	go func() {
		defer func() {
			close(doneCh)
		}()
		if err := metricServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Warn(fmt.Sprintf("failed to start metric server: %v", err))
		}
	}()

	return func() {
		tctx, cancel := context.WithTimeout(ctx, 10*time.Second)
		defer cancel()
		if err := metricServer.Shutdown(tctx); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Warn(fmt.Sprintf("failed to shutdown metric server: %v", err))
		}
		<-doneCh
	}
}
```

> - https://pkg.go.dev/github.com/prometheus/client_golang/prometheus

#### ▼ trace.go

```go
// trace.go
package telemetry

import (
	"cmp"
	"context"
	"fmt"
	"log/slog"
	"os"
	"strconv"

	"go.opentelemetry.io/contrib/propagators/aws/xray"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

const (
	TraceSamplingRatio = "TRACE_SAMPLING_RATIO"
	TraceCollectorEndpoint  = "TRACE_COLLECTOR_ENDPOINT"
)

type opentelemetryErrorHandler struct{}

func (opentelemetryErrorHandler) Handle(err error) {
	slog.Warn(fmt.Sprintf("failed to handle opentelemetry: %v", err))
}

// opentelemetryConfig is opentelemetry configuration.
type opentelemetryConfig struct {
	TraceSamplingRatio float64
	TraceCollectorEndpoint  string
}

// SetupOpentelemetry is configure opentelemetry.
func SetupOpentelemetry() func() {

	config := getConfig()

	// ローカルマシンではスパンの記録を無効化する
	if config.CollectorEndPoint == "http://localhost" {
		slog.Info("skip configure opentelemetry exporter.")
		return func() {
			slog.Info("opentelemetry exporter is not serving in local env.")
		}
	}

	exporters := make([]sdktrace.SpanExporter, 0)

	if exporter, err := getOtelExporter(otlptracegrpc.WithEndpoint(config.CollectorEndPoint)); err != nil {
		slog.Warn(fmt.Sprintf("failed to initialize opentelemetry exporter: %v", err))
	} else {
		exporters = append(exporters, exporter)
	}

	// 監視バックエンドとしてX-Rayを使用する
	idg := xray.NewIDGenerator()

	options := []sdktrace.TracerProviderOption{
		sdktrace.WithSampler(sdktrace.ParentBased(sdktrace.TraceIDRatioBased(config.TraceSamplingRatio))),
		sdktrace.WithIDGenerator(idg),
	}

	for _, exporter := range exporters {
		options = append(options, sdktrace.WithBatcher(exporter))
	}

	tracerProvider := sdktrace.NewTracerProvider(options...)
	otel.SetErrorHandler(opentelemetryErrorHandler{})
	otel.SetTracerProvider(tracerProvider)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	if len(exporters) == 0 {
		slog.Warn("opentelemetry exporter is not set")
	}

	shutdown := func() {
		for _, exporter := range exporters {
			if err := exporter.Shutdown(context.Background()); err != nil {
				slog.Error(fmt.Sprintf("failed to shutdown opentelemetry exporter: %v", err))
			}
		}
	}

	return shutdown
}

// SpanStart is start span with config.
func SpanStart(ctx context.Context, name string, kind trace.SpanKind, opts ...trace.SpanStartOption) (context.Context, trace.Span) {
	// 中略
}

// getConfig is get environment variable.
func getConfig() *opentelemetryConfig {
	// 中略
}

// getOtelExporter is get opentelemetry exporter.
func getOtelExporter(options ...otlptracegrpc.Option) (*otlptrace.Exporter, error) {
	// 中略
}
```

> - https://pkg.go.dev/go.opentelemetry.io/otel

<br>
