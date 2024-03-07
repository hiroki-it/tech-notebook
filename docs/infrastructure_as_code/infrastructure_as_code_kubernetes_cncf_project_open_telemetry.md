---
title: 【IT技術の知見】OpenTelemetry＠CNCF
description: OpenTelemetry＠CNCFの知見を記録しています。
---

# OpenTelemetry＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OpenTelemetryの仕組み

### アーキテクチャ

OpenTelemetryは、テレメトリーソース (例：サードパーティパッケージ、otelクライアントパッケージ、など) 、テレメトリーサブスクライバー (例：opentelemetryコレクター、など) といったコンポーネントから構成されている。

OpenTelemetryを導入することにより、テレメトリーごとに異なるインスツルメント化ツール (テレメトリーを収集できる状態にするツール) を使用せずに、一括してインスツルメント化できるようになる。

![open-telemetry_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_architecture.png)

> - https://opentelemetry.io/docs/
> - https://dzone.com/refcardz/getting-started-with-opentelemetry

<br>

## 02. テレメトリーソース

### サードパーティパッケージ

サードパーティパッケージは、otelクライアントパッケージの`1`個であるAPIパッケージをコールし、テレメトリーデータを作成する。

<br>

### otelクライアントパッケージ

otelクライアントパッケージは、APIパッケージ、SDKパッケージ、セマンティック変換パッケージ、プラグイン、といったコンポーネントから構成されている。

アプリケーションをインスツルメント化する。

otelクライアントパッケージは、テレメトリーデータをAPIパッケージから受け取り、バックエンドやopentelemetryコレクターにこれを渡す。

もし、サービスメッシュツール (例：Istio、Linkerd、など) のサイドカープロキシメッシュとOpenTelemetryの両方を採用する場合、otelクライアントパッケージの代わりにサイドカーを使用することになるため、otelクライアントパッケージは不要になる。

![open-telemetry_client-package](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_client-package.png)

> - https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/library-guidelines.md#opentelemetry-client-generic-design

<br>

## 03. テレメトリーサブスクライバー (テレメトリーコンシューマー)

### opentelemetryコレクター

『テレメトリーコンシューマー』ともいう。

opentelemetryコレクターは、Receiver、Processor、Exporter、といったコンポーネントから構成されている。

otelクライアントパッケージからのテレメトリーデータを、Receiverで受け取り、最終的にテレメトリーデーターの可視化ツールにこれを渡す。

テレメトリーデータをotelクライアントパッケージからバックエンドに直接送信してもよいが、opentelemetryコレクターを使用した方が良い。

もし、サービスメッシュツール (例：Istio、Linkerd、など) のサイドカープロキシメッシュとOpenTelemetryの両方を採用する場合、otelクライアントパッケージの代わりに、サイドカーがopentelemetryコレクターにテレメトリーデータを送信する責務を持つ。

![open-telemetry_collector](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_collector.png)

> - https://www.logicmonitor.com/blog/what-is-an-otel-collector
> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

<br>

### Receiver

OTLP形式のテレメトリーを受信する。

HTTPSで受信する場合には、SSL証明書が必要である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md#server-configuration

<br>

### Processor

テレメトリーを監視バックエンドに送信する前に、事前処理を実行する。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md

<br>

### Exporter

OTLP形式やいくつかのOSS形式 (例：Prometheus、Jaeger、など) のテレメトリーを監視バックエンドに送信する。

非対応の監視バックエンド (例：X-Ray) に関しては、その形式の監視バックエンドが提供するExporter (例：AWS Distro for opentelemetryコレクターのExporter) を使用する必要がある。

HTTPSで送信する場合には、クライアント証明書が必要である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md
> - https://azukiazusa.dev/blog/instrumenting-Node-js-applications-with-open-telemetry/#exporters
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md#client-configuration

<br>

## 04. テレメトリースキーマ

### テレメトリースキーマとは

テレメトリーの構造やデータ型を定義したもの。

コンポーネント (テレメトリーソース、テレメトリーサブスクライバー) 間でテレメトリーを変換できる。

> - https://opentelemetry.io/docs/specs/otel/schemas/#how-schemas-work

<br>

### 仕組み

以下の仕組みでスキーマファイルを使用し、テレメトリーを収集できる。

それぞれのテレメトリーファイルのバージョンが異なっていても、それぞれのコンポーネントがテレメトリーを互換的に処理する。

1. テレメトリーソースは、スキーマURLにある自身のスキーマファイルを読み込む。
2. テレメトリーソースは、自身のスキーマファイルに応じてテレメトリーを作成する。
3. テレメトリーソースは、テレメトリーをバックエンドに送信する。
4. バックエンドは、スキーマURLにある自身のスキーマファイルを読み込む。
5. バックエンドは、自身のスキーマファイルに応じてテレメトリーをストレージに保管する。
6. バックエンドのダッシュボードは、自身のスキーマファイルに応じてストレージからテレメトリーを取得する。

![open-telemetry_schema](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_schema.png)

> - https://opentelemetry.io/docs/specs/otel/schemas/#full-schema-aware
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/semconv/v1.20.0/schema.go

<br>
