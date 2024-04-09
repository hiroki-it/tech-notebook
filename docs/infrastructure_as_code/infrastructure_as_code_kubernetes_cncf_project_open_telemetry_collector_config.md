---
title: 【IT技術の知見】設定ファイル＠OpenTelemetry Collector
description: 設定ファイル＠OpenTelemetry Collectorの知見を記録しています。
---

# 設定ファイル＠OpenTelemetry Collector

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 共通

### タイプ

#### ▼ タイプとは

設定名のこと。

各コンポーネントで、`タイプ/<任意の文字列>`でテレメトリーの処理方法を設定する。

```yaml
receivers:
  <タイプ>/foo:
    ...
  <タイプ>/bar:
    ...

processors:
  <タイプ>/foo:
    ...
  <タイプ>/bar:
    ...

exporters:
  <タイプ>/foo:
    ...
  <タイプ>/bar:
    ...

service:
  pipelines:
    metrics:
      receivers:
        - <タイプ>/foo
        - <タイプ>/bar
      processors:
        - <タイプ>/foo
        - <タイプ>/bar
      exporters:
        - <タイプ>/foo
        - <タイプ>/bar
    ...
```

タイプは、コア機能と拡張機能から選べる。

> - https://github.com/open-telemetry/opentelemetry-collector
> - https://github.com/open-telemetry/opentelemetry-collector-contrib

#### ▼ 同じタイプの複数定義

タイプさえ正しければ問題なく、同じタイプを複数設定できる。

例えば、`exporters`の宛先が冗長化されている場合、同じタイプ名で複数の宛先を設定することになる。

```yaml
exporters:
  prometheusremotewrite/1:
    endpoint: <宛先>
  prometheusremotewrite/2:
    endpoint: <宛先>

service:
  pipelines:
    metrics:
      exporters:
        - prometheusremotewrite/1
        - prometheusremotewrite/2
```

> - https://opentelemetry.io/docs/collector/configuration/#basics

<br>

### tls

#### ▼ cert_file

SSL証明書やクライアント証明書を設定する。

```yaml
receivers:
  <タイプ>:
    tls:
      cert_file: server.crt

exporters:
  <タイプ>:
    tls:
      cert_file: client.crt
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md

#### ▼ insecure

TLSを有効化するかどうかを設定する。

```yaml
receivers:
  <タイプ>:
    tls:
      insecure: true

exporters:
  <タイプ>:
    tls:
      insecure: true
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md

#### ▼ key_file

SSL証明書やクライアント証明書に紐づく秘密鍵を設定する。

```yaml
receivers:
  <タイプ>:
    tls:
      key_file: server.key

exporters:
  <タイプ>:
    tls:
      key_file: client.key
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md

<br>

## 02. exporters

### exportersとは

Exporterを設定する。

OpenTelemetry Collectorは、設定した監視バックエンドにテレメトリーを送信する。

<br>

### debug

#### ▼ debugとは

標準エラー出力にテレメトリーを出力する。

#### ▼ verbosity

重要度レベルを設定する。

通常レベルは`basic`である。

```yaml
exporters:
  debug:
    verbosity: basic
```

```log
2024-03-26T04:41:52.163Z	info	TracesExporter	{"kind": "exporter", "data_type": "traces", "name": "debug", "resource spans": 1, "spans": <転送したスパン数>}
```

スパンを標準出力により詳細に出力したい場合、`detailed`とする。

```yaml
exporters:
  debug:
    verbosity: detailed
```

```yaml
# スパン一つあたりの内容
2024-03-26T04:19:41.450Z	info	ResourceSpans #0
Resource SchemaURL:
Resource attributes:
     -> service.name: Str(foo-service)
ScopeSpans #0
ScopeSpans SchemaURL:
InstrumentationScope "<トレースパッケージ名>"
Span #0
    Trace ID       : *****
    Parent ID      :
    ID             : *****
    Name           : "<スパン名>"
    Kind           : Server
    Start time     : 2024-03-26 04:19:41.041 +0000 UTC
    End time       : 2024-03-26 04:19:41.085 +0000 UTC
    Status code    : Unset
    Status message :
Attributes:
     -> http.method: Str(GET)
     -> http.target: Str("<スパン名>")
     -> http.route: Str(/)
     -> http.scheme: Str(http)
     -> http.flavor: Str(1.1)
     -> http.user_agent: Str(curl/7.79.1)
     -> http.request_content_length: Int(0)
     -> http.response_content_length: Int(905)
     -> http.status_code: Int(200)
     -> net.host.name: Str(_)
     -> net.host.port: Int("<ポート番号>")
     -> net.sock.peer.addr: Str(127.0.0.6)
     -> net.sock.peer.port: Int("<ポート番号>")
     -> env: Str("<実行環境名>")
     -> service: Str("<サービス名>")
	{"kind": "exporter", "data_type": "traces", "name": "debug"}
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/debugexporter/README.md

<br>

### logging

これは非推奨である。

代わりに、`debug`を使用すること。

```yaml
exporters:
  logging: {}
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/loggingexporter/README.md

<br>

### awsxray

#### ▼ awsxrayとは

X-Rayにテレメトリーを送信する。

ただし、OpenTelemetryにはAWS X-Ray exporterが含まれていない。

そのため、AWS製のコンテナイメージ (`public.ecr.aws/aws-observability/aws-otel-collector`) に差し替えておく必要がある。

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/ops/awsxray/#opentelemetry-collector%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

#### ▼ no_verify_ssl

X-Rayへの通信でTLSを有効化するか否かを設定する。

```yaml
exporters:
  awsxray:
    no_verify_ssl: true
```

> - https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/awsxrayexporter/README.md#exporter-configuration

#### ▼ region

X-Rayのあるリージョンを設定する。

```yaml
exporters:
  awsxray:
    region: ap-northeast-1
```

> - https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/awsxrayexporter/README.md#exporter-configuration

<br>

## 03. extensions

### extensionとは

記入中...

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/extension/README.md

<br>

### health_check

```yaml
extensions:
  health_check:
    endpoint: <PodのIPアドレス>:13133
```

<br>

## 04. processors

### processorsとは

Processorを設定する

<br>

### attribute

テレメトリーに付与する属性を設定する。

可読性が低くなるため、属性はアプリ側で実装した方が良い。

```yaml
processors:
  attributes:
    actions:
      - key: env
        value: prd
        action: insert
      - key: service
        value: foo
        action: insert
```

> - https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/attributesprocessor/README.md

<br>

### batch

#### ▼ batchとは

テレメトリーファイルを圧縮するバッチ処理を実行し、送信サイズを小さくした上でExporterに渡す。

推奨である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md

#### ▼ timeout

```yaml
processors:
  batch:
    timeout: 8192s
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md

#### ▼ send_batch_size

バッチ当たりの上限サイズを設定する。

`0`は上限なしを表す。

```yaml
processors:
  batch:
    send_batch_size: 0
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/batchprocessor/README.md

<br>

## 05. receivers

### receiversとは

Receiverを設定する。

OpenTelemetryのクライアントは、Receiverを指定し、テレメトリーを送信する。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/otlpreceiver/README.md

<br>

### otlp

#### ▼ otlpとは

OTLP形式でテレメトリーを受信する。

クライアントがHTTPクライアントかgRPCクライアントかによって、エンドポイントを使い分ける。

設定したエンドポイントに応じて、受信サーバーが起動する。

```bash
...

2024-03-14T03:06:00.860Z	info	otlpreceiver@v0.93.0/otlp.go:102	Starting GRPC server	{"kind": "receiver", "name": "otlp", "data_type": "traces", "endpoint": "<Pod (自分) のIPアドレス>:4317"}
2024-03-14T03:06:00.860Z	info	otlpreceiver@v0.93.0/otlp.go:152	Starting HTTP server	{"kind": "receiver", "name": "otlp", "data_type": "traces", "endpoint": "<Pod (自分) のIPアドレス>:4318"}

...

```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/otlpreceiver/README.md

#### ▼ http

HTTPで受信する。

テレメトリーごとにエンドポイント (`/v1/logs`、`/v1/metrics`、`/v1/traces`) が異なる。

```yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: <Pod (自分) のIPアドレス>:4318
```

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/otlpreceiver/README.md

#### ▼ grpc

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: <Pod (自分) のIPアドレス>:4317
```

<br>

## 06. service

### extensions

使用したい拡張を指定する。

```yaml
service:
  extensions:
    - health_check
```

> - https://opentelemetry.io/docs/collector/configuration/#service

<br>

### pipelines

使用したい設定 (Receiver、Processor、Exporter) を指定する。

```yaml
service:
  pipelines:
    traces:
      receivers:
        - otlp
      processors:
        - batch
      exporters:
        - awsxray
```

> - https://opentelemetry.io/docs/collector/configuration/#service

<br>

### telemetry

#### ▼ telemetryとは

OpenTelemetry Collector自体のテレメトリーの作成方法を設定する。

> - https://opentelemetry.io/docs/collector/configuration/#telemetry
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/service/README.md

#### ▼ logs

OpenTelemetry Collectorのログの作成方法を設定する。

```yaml
service:
  telemetry:
    logs:
      # 通常ログの出力
      output_paths:
        - stdout
      # エラーログの出力先
      error_output_paths:
        - stderr
      # ログレベル (debug、info、warn、error)
      level: debug
      # ログに追加するフィールド
      initial_fields:
        service: foo
```

> - https://opentelemetry.io/docs/collector/configuration/#telemetry
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/service/README.md
> - https://github.com/open-telemetry/opentelemetry-operator/issues/873#issuecomment-1127612505

ログレベルが`debug`の場合、例えば以下になる。

```log
2024-03-25T03:22:08.220Z	debug	awsxrayexporter@v0.96.0/awsxray.go:57	TracesExporter	{"kind": "exporter", "data_type": "traces", "name": "awsxray", "type": "awsxray", "name": "awsxray", "#spans": 1}
```

#### ▼ metrics

OpenTelemetry Collectorのメトリクスの作成方法を設定する。

```yaml
service:
  telemetry:
    metrics:
      level: detailed
      # メトリクスのエンドポイント
      address: <PodのIPアドレス>:8888
```

> - https://opentelemetry.io/docs/collector/configuration/#telemetry
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/service/README.md

<br>
