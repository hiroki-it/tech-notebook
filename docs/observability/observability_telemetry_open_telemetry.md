---
title: 【IT技術の知見】OpenTelemetry＠テレメトリー収集ツール
description: OpenTelemetry＠テレメトリー収集ツールの知見を記録しています。
---

# OpenTelemetry＠テレメトリー収集ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ↪️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. OpenTelemetryの仕組み

### アーキテクチャ


OpenTelemetryは、サードパーティパッケージ、OTelクライアントパッケージ、OTelコレクター、から構成されている。

OpenTelemetryを導入することにより、テレメトリーごとに異なるインスツルメント化ツール（テレメトリーを収集できる状態にするツール）を使用せずに、一括してインスツルメント化できるようになる。

![open-telemetry_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-telemetry_architecture.png)


> ↪️ 参考：
>
> - https://opentelemetry.io/docs/
> - https://dzone.com/refcardz/getting-started-with-opentelemetry

<br>

### サードパーティパッケージ

OpenTelemetry用パッケージは、OTelクライアントパッケージの```1```個であるAPIパッケージをコールし、テレメトリーデータを作成する。



<br>

### OTelクライアントパッケージ

OTelクライアントパッケージは、APIパッケージ、SDKパッケージ、セマンティック変換パッケージ、プラグイン、から構成されている。

アプリケーションをインスツルメント化する。

OpenTelemetry用パッケージからのテレメトリーデータを、APIパッケージで受け取り、最終的にOTelコレクターにこれを渡す。




![open-telemetry_client-package](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-telemetry_client-package.png)

> ↪️ 参考：https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/library-guidelines.md#opentelemetry-client-generic-design


<br>

### OTelコレクター

OTelコレクターは、レシーバー、プロセッサー、エクスポーター、から構成されている。

OTelクライアントパッケージからのテレメトリーデータを、レシーバーで受け取り、最終的にテレメトリーデーターの可視化ツールにこれを渡す。




![open-telemetry_collector](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/open-telemetry_collector.png)

> ↪️ 参考：https://www.logicmonitor.com/blog/what-is-an-otel-collector

<br>
