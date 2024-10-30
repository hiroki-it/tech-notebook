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

非推奨となり、AWS VPC Latticeへの移行が推奨である。

クラウドサービスメッシュとして機能する。

VirtualRouter、VirtualService、VirtualNode、One-Way TLS/mTLS、から構成される。

<br>

## 02. テレメトリーの収集

### 分散トレース

App Mesh上のEnvoyはX-Rayデーモンにスパンを送信し、X-Rayで分散トレースを監視できるようにする。

一方で、Istio上のEnvoyはこの機能を使えず、代わりにOpenTelemetry Collectorにスパンを送信しないといけず、App MeshはAWSとの親和性が高い。

> - https://www.App Meshworkshop.com/x-ray/
> - https://nathanpeck.com/improving-observability-with-aws-app-mesh-amazon-ecs/

<br>
