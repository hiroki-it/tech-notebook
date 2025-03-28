---
title: 【IT技術の知見】クライアントパッケージ＠分散トレース
description: クライアントパッケージ＠分散トレースの知見を記録しています。
---

# クライアントパッケージ＠分散トレース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PHP用のクライアントパッケージ

### セットアップ

#### ▼ インストール (手動の場合)

採用しているミドルウェアごとに、インストール方法が異なる。

サーバーを冗長化している場合、全てのサーバーに共通した設定のエージェントを組み込めるという点で、IaCツールを使用した方が良い。

```bash
# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
$ curl -L https://github.com/DataDog/dd-trace-php/releases/download/0.63.0/datadog-php-tracer_0.63.0_amd64.deb

# クライアントパッケージをインストールをする。
$ dpkg -i datadog-php-tracer_0.69_amd64.deb

# 残骸ファイルを削除する。
$ rm datadog-php-tracer.deb
```

また、PHP-FPMに環境変数を渡せるように、`www`プールに関する設定ファイルを配置し、PHP-FPMを再起動する。

```ini
# /etc/php-fpm.d/dd-trace.confファイル
[www]
env[DD_SERVICE] = 'foo'
env[DD_SERVICE_MAPPING] = 'guzzle:foo-guzzle,pdo:foo-pdo'
env[DD_ENV] = 'prd'
env[DD_VERSION] = '<バージョンタグ>'
```

> - https://docs.datadoghq.com/tracing/setup/php/
> - https://app.datadoghq.com/apm/docs?architecture=host-based&framework=php-fpm&language=php

#### ▼ インストール (Ansibleの場合)

使用しているミドルウェアごとに、インストール方法が異なる。

```yaml
- tasks:
    - name: Install dd-trace-php
      ansible.builtin.shell: |
        curl -Lo https://github.com/DataDog/dd-trace-php/releases/download/${DD_TRACE_VERSION}/datadog-php-tracer_${DD_TRACE_VERSION}_amd64.deb
        dpkg -i datadog-php-tracer_0.69_amd64.deb
        rm datadog-php-tracer.deb
      environment:
        DD_TRACE_VERSION: 0.63.0
    - name: Upload dd-trace.conf
      ansible.builtin.template: src=dd-trace.conf dest=/etc/php-fpm.d/dd-trace.conf
      notify: restart php-fpm
```

#### ▼ インストール (コンテナの場合)

アプリコンテナのDockerfileにて、PHP用のクライアントパッケージをインストールする。

また、コンテナの環境変数として、`DD_SERVICE`、`DD_ENV`、`DD_VERSION`を渡す。

```dockerfile
ENV DD_TRACE_VERSION=0.63.0

# GitHubのバイナリファイルのリリースページから、テキストのURLを取得する。
RUN curl -Lo https://github.com/DataDog/dd-trace-php/releases/download/${DD_TRACE_VERSION}/datadog-php-tracer_${DD_TRACE_VERSION}_amd64.deb \
  `# クライアントパッケージをインストールする。` \
  && dpkg -i datadog-php-tracer.deb \
  `# 残骸ファイルを削除する。` \
  && rm datadog-php-tracer.deb
```

> - https://docs.datadoghq.com/tracing/setup_overview/setup/php/?tab=containers

#### ▼ インストールの動作確認

パッケージが正しく読み込まれているか否かは、`php --ri=ddtrace`コマンドまたは`phpinfo`メソッドの結果から確認できる。

```bash
# 成功の場合
$ php --ri=ddtrace

ddtrace


Datadog PHP tracer extension
For help, check out the documentation at https://docs.datadoghq.com/tracing/languages/php/
(c) Datadog 2020

...

```

```bash
# 失敗の場合
$ php --ri=ddtrace
Extension 'ddtrace' not present.
```

#### ▼ パラメーターの動作確認

パラメーターがパッケージに渡されたか否かは、`DATADOG TRACER CONFIGURATION`の項目で確認できる。

```bash
$ php --ri=ddtrace

Datadog tracing support => enabled
Version => 0.57.0
DATADOG TRACER CONFIGURATION => { ... } # ここに設定のJSONが得られる

# 得られたJSONを整形している
{
    "date": "2021-00-00T09:00:00Z",
    "os_name": "Linux ***** 5.10.25-linuxkit #1 SMP Tue Mar 23 09:27:39 UTC 2021 x86_64",
    "os_version": "5.10.25-linuxkit",
    "version": "0.64.1",
    "lang": "php",
    "lang_version": "8.0.8",
    "env": null,
    "enabled": "true",
    "service": null,
    "enabled_cli": "false",
    "agent_url": "http://localhost:8126", # datadogコンテナのアドレスポート
    "debug": "false",
    "analytics_enabled": "false",
    "sample_rate": 1.000000,
    "sampling_rules": null,
    "tags": {},
    "service_mapping": {},
    "distributed_tracing_enabled": "true",
    "priority_sampling_enabled": "true",
    "dd_version": null,
    "architecture": "x86_64",
    "sapi": "cli",
    "datadog.trace.request_init_hook": "/opt/datadog-php/dd-trace-sources/bridge/dd_wrap_autoloader.php",
    "open_basedir_configured": "false",
    "uri_fragment_regex": null,
    "uri_mapping_incoming": null,
    "uri_mapping_outgoing": null,
    "auto_flush_enabled": "false",
    "generate_root_span": "true",
    "http_client_split_by_domain": "false",
    "measure_compile_time": "true",
    "report_hostname_on_root_span": "false",
    "traced_internal_functions": null,
    "auto_prepend_file_configured": "false",
    "integrations_disabled": "default",
    "enabled_from_env": "true",
    "opcache.file_cache": null,
    "agent_error": "Failed to connect to localhost port 8126: Connection refused", # エラーメッセージ
    "DDTRACE_REQUEST_INIT_HOOK": "'DDTRACE_REQUEST_INIT_HOOK=/opt/datadog-php/dd-trace-sources/bridge/dd_wrap_autoloader.php' is deprecated, use DD_TRACE_REQUEST_INIT_HOOK instead."
}
```

> - https://docs.datadoghq.com/tracing/troubleshooting/tracer_startup_logs/

#### ▼ 受信ログの確認

datadogコンテナが分散トレースを受信している場合は、受信できていることを表すログを確認できる。

```bash
2022-01-01 12:00:00 UTC | TRACE | INFO | (pkg/trace/info/stats.go:111 in LogStats) | [lang:php lang_version:8.0.8 interpreter:fpm-fcgi tracer_version:0.64.1 endpoint_version:v0.4] -> traces received: 7, traces filtered: 0, traces amount: 25546 bytes, events extracted: 0, events sampled: 0
```

<br>

## 02. JavaScript用のクライアントパッケージ

### セットアップ

#### ▼ インストール

TypeScriptやモジュールバンドルを採用している場合、パッケージの読み出し処理が巻き上げられ、意図しない読み出しの順番になってしまうことがある。

対策として、`dd-trace`パッケージの`init`メソッドの実行を別ファイルに分割し、これをエントリーポイント (`nuxt.config.js`ファイル) の先頭で読み込むようにする。

また、フレームワークよりも先に読み込むことになるため、`.env`ファイル参照を使用できない。

そこで、環境変数はインフラ側で設定する。

```javascript
// datadogTracer.tsファイル
import tracer from "dd-trace";

tracer.init({
  // フレームワークの.envファイル参照を使用できない
  env: DD_ENV,
  service: DD_SERVICE + "-ssr",
  version: DD_VERSION,

  // 検証時のオプション
  debug: "true",
  startupLogs: "true",
});

export default datadogTracer;
```

```javascript
// nuxt.config.tsファイル
// 先頭で読み込む
import './datadogTracer'
import { Configuration } from '@nuxt/types'

...
```

> - https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#typescript-%E3%81%A8%E3%83%90%E3%83%B3%E3%83%89%E3%83%A9%E3%83%BC

#### ▼ 起動ログの確認

パッケージの起動ログは、`init`メソッドの`startupLogs`オプションを有効化すると確認できる。

```bash
DATADOG TRACER CONFIGURATION -
{
    "date": "2022-01-02T00:00:00.541Z",
    "os_name": "Darwin",
    "os_version": "20.6.0",
    "architecture": "arm64",
    "version": "2.0.1",
    "lang": "nodejs",
    "lang_version": "14.18.2",
    "env": "prd",
    "service": "foo",
    "agent_url": "http://127.0.0.1:8126",
    "agent_error": "Network error trying to reach the agent: socket hang up",
    "debug": "false",
    "sample_rate": 1,
    "sampling_rules": [],
    "tags": {
        "service": "foo",
        "env": "prd",
        "version": "<バージョンタグ>",
        "runtime-id": "*****"
    },
    "dd_version": "<バージョンタグ>",
    "log_injection_enabled": "false",
    "runtime_metrics_enabled": "false",
    "profiling_enabled": "false",
    "integrations_loaded": [
        "connect@3.7.0",
        "fs",
        "http",
        "https"
    ],
    "appsec_enabled": "false"
}

WARN  DATADOG TRACER DIAGNOSTIC - Agent Error: Network error trying to reach the agent: socket hang up
```

<br>

### 環境変数

初期化時に環境変数を設定できる。

APMのマイクロサービスのタグ名に反映される。

> - https://docs.datadoghq.com/tracing/setup_overview/setup/nodejs/?tab=%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A#%E3%82%B3%E3%83%B3%E3%83%95%E3%82%A3%E3%82%AE%E3%83%A5%E3%83%AC%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3

<br>

## 03. Go用のクライアントパッケージ

### HTTPを使用する場合

#### ▼ 送信元マイクロサービス

送信元マイクロサービスでは、親スパンを作成する。

```go
package main

import (
	"log"
	"net/http"

	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func InitTracerProvider(w http.ResponseWriter, req *http.Request) {

    // Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
	var tracer = otel.Tracer("計装パッケージ名")

	log.Print("Info: Trace provider is initializing ...")

	// 親スパンを作成する。
	span, ctx := tracer.StartSpanFromContext(
		req.Context(),
		"post.process",
	)

	defer span.Finish()

	req, err := http.NewRequest(
		"GET",
		"https://example.com",
		nil,
	)

	req = req.WithContext(ctx)

	err = tracer.Inject(
		// トレースコンテキストを持つ既存コンテキストを設定する
		span.Context(),
		// Carrierとして使用するメタデータを設定し、トレースコンテキストを注入する
		tracer.HTTPHeadersCarrier(req.Header),
	)

	if err != nil {
		log.Printf("Failed to inject context: %s", err)
	}

	http.DefaultClient.Do(req)
}
```

> - https://docs.datadoghq.com/tracing/trace_collection/custom_instrumentation/go/#distributed-tracing

#### ▼ 宛先マイクロサービス

宛先マイクロサービスでは、受信した通信からトレースコンテキストを取得する。

また、子スパンを作成する。

```go
package main

import (
	"log"
	"net/http"

	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"
)

func InitTracerProvider(w http.ResponseWriter, r *http.Request) {

	log.Print("Info: Trace provider is initializing ...")

	// Carrierからトレースコンテキストを取得する。
	tracectx, err := tracer.Extract(tracer.HTTPHeadersCarrier(r.Header))

	if err != nil {
		log.Printf("Failed to extract context: %s", err)
	}

	log.Print("Info: Tracer provider initialize successfully")

	// Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
    var tracer = otel.Tracer("計装パッケージ名")

	// 子スパンを作成する。
	span := tracer.StartSpan(
		"post.filter",
		tracer.ChildOf(tracectx),
	)

	defer span.Finish()
}

```

> - https://docs.datadoghq.com/tracing/trace_collection/custom_instrumentation/go/#distributed-tracing

<br>

### gRPCを使用する場合

#### ▼ Interceptorの実行

事前処理としてスパンの作成などを行うInterceptorを使用する。

`otelgrpc`パッケージのラッパーである`dd-trace-go.v1`パッケージが持っている。

各関数でスパンの作成を実行する必要がなくなる。

#### ▼ gRPCサーバー側

```go
package main

import (
	"fmt"
	"log"
	"net"

	"google.golang.org/grpc"
	"gopkg.in/DataDog/dd-trace-go.v1/ddtrace/tracer"

	grpctracer "gopkg.in/DataDog/dd-trace-go.v1/contrib/google.golang.org/grpc"
)

func main() {

    // Tracerを作成する
	// Tracer名はパッケージ名が推奨である
	// @see https://pkg.go.dev/go.opentelemetry.io/otel/trace#TracerProvider
    var tracer = otel.Tracer("計装パッケージ名")

	// パッケージをセットアップする。
	tracer.Start(tracer.WithEnv("prd"))

	defer tracer.Stop()

	// gRPCサーバーを作成する。
	grpcServer := grpc.NewServer(
		// 単項RPCのインターセプター処理
		grpc.UnaryInterceptor(
			grpctrace.UnaryServerInterceptor(datadogAPMServiceName, tracer.DefaultTracer),
        ),
		// ストリーミングRPCのインターセプター処理
		grpc.StreamInterceptor(
			grpctrace.StreamServerInterceptor(datadogAPMServiceName, tracer.DefaultTracer),
        ),
	)

	... // pb.goファイルに関する実装は省略している。

	listenPort, _ := net.Listen("tcp", fmt.Sprintf(":%d", 9000))

	if err != nil {
		log.Printf("Failed to listen: %v", err)
	}

	// gRPCサーバーでリクエストを受信する。
	if err := grpcServer.Serve(listenPort); err != nil {
		log.Printf("Failed to serve: %s", err)
	}

	if err != nil {
		log.Printf("Failed to serve: %v", err)
	}
}
```

> - https://github.com/spesnova/datadog-grpc-trace-example#datadog-grcp-tracing-example
> - https://github.com/muroon/datadog_sample/blob/master/grpcserver/main.go#L75-L127
> - https://qiita.com/lightstaff/items/28724d9dd8a6b30b236d
> - https://christina04.hatenablog.com/entry/grpc-unary-interceptor

#### ▼ gRPCクライアント側

gRPCクライアント側では、gRPCサーバーとの接続を作成する必要がある。

```go
package main

import (
	"log"

	"google.golang.org/grpc"

	grpctrace "gopkg.in/DataDog/dd-trace-go.v1/contrib/google.golang.org/grpc"
)

func main() {

    ...

	// gRPCサーバーとの接続を作成する
	conn, err := grpc.DialContext(
        ctx,
		":9000",
		grpc.WithInsecure(),
		grpc.WithBlock(),
		grpc.WithChainUnaryInterceptor(grpctrace.UnaryClientInterceptor(datadogAPMServiceName, tracer.DefaultTracer)),
		grpc.WithChainStreamInterceptor(grpctrace.UnaryStreamInterceptor(datadogAPMServiceName, tracer.DefaultTracer)),
	)

	if err != nil {
		log.Printf("Failed to create gRPC connection: %v", err)
	}

	defer conn.Close()

	... // pb.goファイルに関する実装は省略している。
}
```

> - https://github.com/spesnova/datadog-grpc-trace-example#datadog-grcp-tracing-example
> - https://github.com/muroon/datadog_sample/blob/master/httpserver/usecases/grpc.go#L23-L70
> - https://qiita.com/lightstaff/items/28724d9dd8a6b30b236d
> - https://christina04.hatenablog.com/entry/grpc-unary-interceptor

<br>
