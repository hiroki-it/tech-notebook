---
title: 【IT技術の知見】OpenTelemetry＠テレメトリー収集ツール
description: OpenTelemetry＠テレメトリー収集ツールの知見を記録しています。
---

# OpenTelemetry＠テレメトリー収集ツール

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

## 01-02. テレメトリーソース

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

## 01-03. テレメトリーサブスクライバー (テレメトリーコンシューマー)

### opentelemetryコレクター

#### ▼ opentelemetryコレクターとは

『テレメトリーコンシューマー』ともいう。

opentelemetryコレクターは、レシーバー、プロセッサー、エクスポーター、といったコンポーネントから構成されている。

otelクライアントパッケージからのテレメトリーデータを、レシーバーで受け取り、最終的にテレメトリーデーターの可視化ツールにこれを渡す。

テレメトリーデータをotelクライアントパッケージからバックエンドに直接送信してもよいが、opentelemetryコレクターを使用した方が良い。

もし、サービスメッシュツール (例：Istio、Linkerd、など) のサイドカープロキシメッシュとOpenTelemetryの両方を採用する場合、otelクライアントパッケージの代わりに、サイドカーがopentelemetryコレクターにテレメトリーデータを送信する責務を持つ。

![open-telemetry_collector](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_collector.png)

> - https://www.logicmonitor.com/blog/what-is-an-otel-collector
> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

#### ▼ レシーバー

OTLP形式のテレメトリーを受信する。

HTTPSで受信する場合には、SSL証明書が必要である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md#server-configuration

#### ▼ プロセッサー

テレメトリーを監視バックエンドに送信する前に、事前処理を実行する。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md

#### ▼ エクスポーター

OTLP形式やいくつかのOSS形式 (例：Prometheus、Jaeger、など) のテレメトリーを監視バックエンドに送信する。

非対応の監視バックエンド (例：X-Ray) に関しては、その形式の監視バックエンドが提供するエクスポーター (例：AWS Distro for opentelemetryコレクターのエクスポーター) を使用する必要がある。

HTTPSで送信する場合には、クライアント証明書が必要である。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md
> - https://azukiazusa.dev/blog/instrumenting-Node-js-applications-with-open-telemetry/#exporters
> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/config/configtls/README.md#client-configuration

<br>

## 01-04. テレメトリースキーマ

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

![open-telemetry_schema.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_schema.png)

> - https://opentelemetry.io/docs/specs/otel/schemas/#full-schema-aware
> - https://github.com/open-telemetry/opentelemetry-go/blob/main/semconv/v1.20.0/schema.go

<br>

## 02. 計装

### 手動計装

OpenTelemetryのTraceProviderを手動でセットアップする。

> - https://opentelemetry.io/docs/instrumentation/

<br>

### 自動計装

#### ▼ 自動計装とは

OpenTelemetryのTraceProviderをアプリの実行時に動的にセットアップする。

ファイルの構造や環境変数名から、自動的に言語を検出してくれる。

なお、実行時にコンパイルするような言語 (インタプリタ言語) だと、OpenTelemetryによる自動計装が難しい。

一方で、実行前にコンパイルする言語 (コンパイル言語) だと、eBPFによる自動計装が適する。

eBPFによる自動計装の方が、リクエスト処理のパフォーマンスが高くなる。

一方で、自動計装だと手動計装より処理が増えるため、言語によっては起動パフォーマンスが悪くなることがある。

> - https://opentelemetry.io/docs/instrumentation/
> - https://odigos.io/blog/ebpf-instrumentation-faster-than-manual

#### ▼ 仕組み

| 言語    | 仕組み                                                             |
| ------- | ------------------------------------------------------------------ |
| Node.js | モンキーパッチを使用し、アプリケーションの起動時に計装を挿入する。 |
| Python  | モンキーパッチを使用し、アプリケーションの起動時に計装を挿入する。 |

> - https://blog.ojisan.io/otel-node-sdk/
> - https://opentelemetry.io/docs/languages/python/automatic/example/

<br>

### 比較

手動計装と自動計装には、それぞれメリット/デメリットがある。

> - https://www.elastic.co/blog/best-practices-instrumenting-opentelemetry
> - https://signoz.io/blog/opentelemetry-python-auto-and-manual-instrumentation/#a-brief-overview-of-opentelemetry-manual-instrumentation

<br>

## 03. テレメトリー間の紐付け

記入中...

> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html

<br>
