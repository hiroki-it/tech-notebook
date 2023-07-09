---
title: 【IT技術の知見】Jaeger＠CNCFプロジェクト
description: Jaeger＠CNCFプロジェクトの知見を記録しています。
---

# Jaeger＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Jaegerの仕組み

### アーキテクチャ

Jaegerは、jaegerクライアントパッケージ (執筆時点2022/07/16で、OTelクライアントパッケージの使用が推奨) 、jaegerエージェント、jaegerコレクター、ローカルストレージまたはリモートストレージ、jaegerクエリ、ダッシュボード (UI) 、といったコンポーネントから構成されている。

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/jaeger_architecture.png)

> - https://www.jaegertracing.io/docs/latest/architecture/

<br>

### jaegerクライアントパッケージ (非推奨)

執筆時点 (2022/07/16) で、OTelクライアントパッケージを使用することが推奨されている。

参考程度に、jaegerクライアントパッケージの仕組みを記載する。

アプリケーションにて、jaegerクライアントパッケージはスパンを作成し、加えてリクエストにコンテキスト情報 (トレースID、スパンID、OpenTracingバゲージ) を付与する。

jaegerクライアントパッケージは、コンテナ内でデーモンとして常駐するjaegerエージェントにスパンを渡す。

> - https://www.jaegertracing.io/docs/latest/architecture/#jaeger-client-libraries-deprecated

<br>

### jaegerエージェント

jaegerエージェントは、Pod内でサイドカーとして常駐し、アプリコンテナからスパンの受信をリッスンする。

もし、サービスメッシュツール (例：Istio、Linkerd) のサイドカープロキシメッシュとJaegerの両方を採用する場合、jaegerエージェントの代わりにサイドカーを使用することになるため、jaegerエージェントは不要になる。

> - https://www.jaegertracing.io/docs/latest/architecture/#agent

<br>

### jaegerコレクター

jaegerコレクターは、プッシュ型でjaegerエージェントからコンテキスト情報を収集し、ローカルストレージに保存する。

もし、サービスメッシュツール (例：Istio、Linkerd) のサイドカープロキシメッシュとJaegerの両方を採用する場合、jaegerエージェントの代わりに、サイドカーがjaegerコレクターにスパンを送信する責務を持つ。

> - https://www.jaegertracing.io/docs/latest/architecture/#collector

<br>

### ローカルストレージまたはリモートストレージ

ローカルストレージまたはリモートストレージは、スパンを永続化する。

リモートストレージとして、Cassandra、Elasticsearch、Kafka、を使用できる。

> - https://www.jaegertracing.io/docs/latest/architecture/#query

<br>

### ダッシュボード

ダッシュボードは、jaegerクエリを使用して、ストレージ内のコンテキスト情報を分散トレースとして可視化する。

<br>
