---
title: 【IT技術の知見】OpenTelemetry＠テレメトリー収集ツール
description: OpenTelemetry＠テレメトリー収集ツールの知見を記録しています。
---

# OpenTelemetry＠テレメトリー収集ツール

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 分散トレースの計装

### 手動計装

OpenTelemetryのTracerProviderを手動でセットアップする。

> - https://opentelemetry.io/docs/instrumentation/

<br>

### 自動計装

#### ▼ 自動計装とは

OpenTelemetryのTracerProviderをアプリの実行時に動的にセットアップする。

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

## 02. ログの計装

<br>

## 03. メトリクスの計装

<br>

## 04. テレメトリー間の紐付け

記入中...

> - https://atmarkit.itmedia.co.jp/ait/articles/2303/07/news009.html

<br>
