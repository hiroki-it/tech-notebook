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

自動計装だと手動計装より処理が増えるため、言語 (例：Java) によっては起動パフォーマンスが悪くなることがある。

> - https://opentelemetry.io/docs/instrumentation/
> - https://buildersbox.corp-sansan.com/entry/2023/05/15/110000

#### ▼ インタプリタ言語

インタプリタ言語 (実行時にコンパイルする言語) の場合、実行時に動的にパッチを組み込むツール (例：モンキーパッチ) を使用する。

実際、Node.jsやPythonでは、モンキーパッチで自動計装を実現している。

> - https://blog.ojisan.io/otel-node-sdk/
> - https://opentelemetry.io/docs/languages/python/automatic/example/

#### ▼ コンパイル言語

コンパイル言語 (実行前にコンパイルする言語) の場合、エージェント (例：Javaエージェント、eBPF、など) による自動計装が適する。

eBPFによるコンパイル言語の自動計装の方が、手動計装よりもリクエスト処理のパフォーマンスが高くなる。

実際、JavaではJavaエージェント、GoではeBPFで自動計装を実現している。

> - https://odigos.io/blog/ebpf-instrumentation-faster-than-manual

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
