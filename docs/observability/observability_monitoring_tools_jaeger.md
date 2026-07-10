---
title: 【IT技術の知見】Jaeger＠監視ツール
description: Jaeger＠監視ツールの知見を記録しています。
---

# Jaeger＠監視ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Jaegerの仕組み

### アーキテクチャ

Jaeger は複数のコンポーネントから構成されている。

- jaeger クライアントパッケージ (執筆時点 2022/07/16 で、otel クライアントパッケージの使用が推奨)
- jaeger エージェント
- Jaeger Collector
- ローカルストレージまたはリモートストレージ
- jaeger クエリ
- ダッシュボード (UI)

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jaeger_architecture.png)

> - https://www.jaegertracing.io/docs/latest/architecture/

<br>

### jaegerクライアントパッケージ (非推奨)

執筆時点 (2022/07/16) で、otel クライアントパッケージを使用することが推奨である。

参考程度に、jaeger クライアントパッケージの仕組みを記載する。

アプリケーションにて、jaeger クライアントパッケージはスパンを作成し、加えてリクエストにコンテキスト (トレース ID、スパン ID、OpenTracing バゲージ) を付与する。

jaeger クライアントパッケージは、コンテナ内でデーモンとして常駐する jaeger エージェントにスパンを渡す。

> - https://www.jaegertracing.io/docs/latest/architecture/#jaeger-client-libraries-deprecated

<br>

### jaegerエージェント

jaeger エージェントは、Pod 内でサイドカーとして常駐し、アプリコンテナからスパンの受信をリッスンする。

もし、サービスメッシュツール (例：Istio、Linkerd) のサイドカーモデルと Jaeger の両方を採用する場合、jaeger エージェントの代わりにサイドカーを使用することになるため、jaeger エージェントは不要になる。

> - https://www.jaegertracing.io/docs/latest/architecture/#agent

<br>

### Jaeger Collector

Jaeger Collector は、プッシュ型で jaeger エージェントからコンテキストを収集し、ローカルストレージに保管する。

Jaeger のダッシュボードは、このローカルストレージからスパンを取得し、分散トレースとして可視化する。

もし、サービスメッシュツール (例：Istio、Linkerd) のサイドカーモデルと Jaeger の両方を採用する場合、jaeger エージェントの代わりに、サイドカーがプロキシ (例：Jaeger Collector) にスパンを送信する責務を持つ。

> - https://www.jaegertracing.io/docs/latest/architecture/#collector

<br>

### ローカルストレージまたはリモートストレージ

ローカルストレージまたはリモートストレージは、スパンを永続化する。

リモートストレージとして、Apache Cassandra、Elasticsearch などを使用できる。

> - https://www.jaegertracing.io/docs/latest/architecture/#query

<br>

### ダッシュボード

ダッシュボードは、jaeger クエリを使用して、ストレージ内のコンテキストを分散トレースとして可視化する。

<br>
