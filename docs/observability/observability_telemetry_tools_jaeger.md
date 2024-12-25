---
title: 【IT技術の知見】Jaeger＠テレメトリー監視ツール
description: Jaeger＠テレメトリー監視ツールの知見を記録しています。
---

# Jaeger＠テレメトリー監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Jaegerの仕組み

### アーキテクチャ

Jaegerは、jaegerクライアントパッケージ (執筆時点2022/07/16で、otelクライアントパッケージの使用が推奨) 、jaegerエージェント、Jaeger Collector、ローカルストレージまたはリモートストレージ、jaegerクエリ、ダッシュボード (UI) 、といったコンポーネントから構成されている。

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jaeger_architecture.png)

> - https://www.jaegertracing.io/docs/latest/architecture/

<br>

### jaegerクライアントパッケージ (非推奨)

執筆時点 (2022/07/16) で、otelクライアントパッケージを使用することが推奨である。

参考程度に、jaegerクライアントパッケージの仕組みを記載する。

アプリケーションにて、jaegerクライアントパッケージはスパンを作成し、加えてリクエストにコンテキスト (トレースID、スパンID、OpenTracingバゲージ) を付与する。

jaegerクライアントパッケージは、コンテナ内でデーモンとして常駐するjaegerエージェントにスパンを渡す。

> - https://www.jaegertracing.io/docs/latest/architecture/#jaeger-client-libraries-deprecated

<br>

### jaegerエージェント

jaegerエージェントは、Pod内でサイドカーとして常駐し、アプリコンテナからスパンの受信をリッスンする。

もし、サービスメッシュツール (例：Istio、Linkerd) のサイドカーモデルとJaegerの両方を採用する場合、jaegerエージェントの代わりにサイドカーを使用することになるため、jaegerエージェントは不要になる。

> - https://www.jaegertracing.io/docs/latest/architecture/#agent

<br>

### Jaeger Collector

Jaeger Collectorは、プッシュ型でjaegerエージェントからコンテキストを収集し、ローカルストレージに保管する。

Jaegerのダッシュボードは、このローカルストレージからスパンを取得し、分散トレースとして可視化する。

もし、サービスメッシュツール (例：Istio、Linkerd) のサイドカーモデルとJaegerの両方を採用する場合、jaegerエージェントの代わりに、サイドカーがプロキシ (例：Jaeger Collector) にスパンを送信する責務を持つ。

> - https://www.jaegertracing.io/docs/latest/architecture/#collector

<br>

### ローカルストレージまたはリモートストレージ

ローカルストレージまたはリモートストレージは、スパンを永続化する。

リモートストレージとして、Apache Cassandra、Elasticsearchなどを使用できる。

> - https://www.jaegertracing.io/docs/latest/architecture/#query

<br>

### ダッシュボード

ダッシュボードは、jaegerクエリを使用して、ストレージ内のコンテキストを分散トレースとして可視化する。

<br>
