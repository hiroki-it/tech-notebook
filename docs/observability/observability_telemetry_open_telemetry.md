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

OpenTelemetryは、サードパーティパッケージ、otelクライアントパッケージ、otelコレクター、といったコンポーネントから構成されている。

OpenTelemetryを導入することにより、テレメトリーごとに異なるインスツルメント化ツール (テレメトリーを収集できる状態にするツール) を使用せずに、一括してインスツルメント化できるようになる。

![open-telemetry_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_architecture.png)

> - https://opentelemetry.io/docs/
> - https://dzone.com/refcardz/getting-started-with-opentelemetry

<br>

### サードパーティパッケージ

サードパーティパッケージは、otelクライアントパッケージの`1`個であるAPIパッケージをコールし、テレメトリーデータを作成する。

<br>

### otelクライアントパッケージ

otelクライアントパッケージは、APIパッケージ、SDKパッケージ、セマンティック変換パッケージ、プラグイン、といったコンポーネントから構成されている。

アプリケーションをインスツルメント化する。

otelクライアントパッケージは、テレメトリーデータをAPIパッケージから受け取り、最終的にotelコレクターにこれを渡す。

もし、サービスメッシュツール (例：Istio、Linkerd、など) のサイドカープロキシメッシュとOpenTelemetryの両方を採用する場合、otelクライアントパッケージの代わりにサイドカーを使用することになるため、otelクライアントパッケージは不要になる。

![open-telemetry_client-package](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_client-package.png)

> - https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/library-guidelines.md#opentelemetry-client-generic-design

<br>

### otelコレクター

#### ▼ otelコレクターとは

otelコレクターは、レシーバー、プロセッサー、エクスポーター、といったコンポーネントから構成されている。

otelクライアントパッケージからのテレメトリーデータを、レシーバーで受け取り、最終的にテレメトリーデーターの可視化ツールにこれを渡す。

もし、サービスメッシュツール (例：Istio、Linkerd、など) のサイドカープロキシメッシュとOpenTelemetryの両方を採用する場合、otelクライアントパッケージの代わりに、サイドカーがotelコレクターにテレメトリーデータを送信する責務を持つ。

![open-telemetry_collector](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/open-telemetry_collector.png)

> - https://www.logicmonitor.com/blog/what-is-an-otel-collector
> - https://istio.io/latest/docs/tasks/observability/logs/otel-provider/

#### ▼ レシーバー

OTLP形式のテレメトリーを受信する。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/receiver/README.md

#### ▼ プロセッサー

テレメトリーを監視バックエンドに送信する前に、事前処理を実行する。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/processor/README.md

#### ▼ エクスポーター

OTLP形式やいくつかのOSS形式 (例：Prometheus、Jaeger、など) のテレメトリーを監視バックエンドに送信する。

非対応の監視バックエンド (例：X-ray) に関しては、その形式の監視バックエンドが提供するエクスポーター (例：AWS Distro for otelコレクターのエクスポーター) を使用する必要がある。

> - https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/README.md
> - https://azukiazusa.dev/blog/instrumenting-Node-js-applications-with-open-telemetry/#exporters

<br>

## 02. 計装

otelクライアントパッケージを使用して、アプリを自前/自動で計装する必要がある。

自動計装の場合、アプリの実行時に動的にセットアップを行う。

> - https://opentelemetry.io/docs/instrumentation/

<br>

## 03. テレメトリー間の紐付け

記入中...

> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html

<br>
