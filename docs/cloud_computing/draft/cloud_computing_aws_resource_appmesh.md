---
title: 【IT技術の知見】App Mesh＠AWS
description: App Mesh＠AWSの知見を記録しています。
---

# App Mesh＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. App Meshとは

非推奨となり、Amazon VPC Lattice や Amazon ECS Service Connect への移行が推奨である。

クラウドサービスメッシュとして機能する。

VirtualRouter、VirtualService、VirtualNode、One-Way TLS/mTLS、から構成される。

> - https://zenn.dev/cadp/articles/ecs-service-mesh-compare

<br>

## 02. テレメトリーの収集

### 分散トレース

App Mesh 上の Envoy は X-Ray デーモンにスパンを送信し、X-Ray で分散トレースを監視できるようにする。

一方で、Istio 上の Envoy はこの機能を使えない。

代わりに OpenTelemetry Collector へスパンを送信する必要がある。

この点で、App Mesh は AWS との親和性が高い。

> - https://www.appmeshworkshop.com/x-ray/
> - https://nathanpeck.com/improving-observability-with-aws-app-mesh-amazon-ecs/

<br>
