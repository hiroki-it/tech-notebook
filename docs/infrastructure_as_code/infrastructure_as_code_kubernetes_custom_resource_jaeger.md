---
title: 【IT技術の知見】Jaeger＠カスタムリソース
description: Jaeger＠カスタムリソースの知見を記録しています。
---

# Jaeger＠カスタムリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Jaegerの仕組み

### アーキテクチャ

Jaegerは、jaegerクライアントパッケージ（執筆時点2022/07/16で、OTelクライアントパッケージの使用が推奨）、jaegerエージェント、jaegerコレクター、ローカルストレージまたはリモートストレージ、jaegerクエリ、ダッシュボード（UI）、から構成されている。

> ℹ️ 参考：https://www.jaegertracing.io/docs/latest/architecture/

![jaeger_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/jaeger_architecture.png)

<br>

### jaegerクライアントパッケージ（非推奨）

執筆時点（2022/07/16）で、OTelクライアントパッケージを使用することが推奨されている。参考程度に、jaegerクライアントパッケージの仕組みを記載する。アプリケーションにて、jaegerクライアントパッケージはスパンを作成し、加えてリクエストにコンテキスト情報（トレースID、スパンID、OpenTracingバゲージ）を付与する。jaegerクライアントパッケージは、コンテナ内でデーモンとして常駐するjaegerエージェントにスパンを渡す。

> ℹ️ 参考：https://www.jaegertracing.io/docs/latest/architecture/#jaeger-client-libraries-deprecated

<br>

### jaegerエージェント

コンテナ内でデーモンとして常駐し、スパンの受信をリッスンする。



> ℹ️ 参考：https://www.jaegertracing.io/docs/latest/architecture/#agent

<br>

### jaegerコレクター

jaegerコレクターは、プッシュ型でjaegerエージェントからコンテキスト情報を収集し、ローカルストレージに保存する。



> ℹ️ 参考：https://www.jaegertracing.io/docs/latest/architecture/#collector

<br>

### ローカルストレージまたはリモートストレージ

リモートストレージとして、Cassandra、Elasticsearch、Kafka、を使用できる。



> ℹ️ 参考：https://www.jaegertracing.io/docs/latest/architecture/#query

<br>

### ダッシュボード

ダッシュボードは、jaegerクエリを使用して、ストレージ内のコンテキスト情報を分散トレースとして可視化する。



<br>
