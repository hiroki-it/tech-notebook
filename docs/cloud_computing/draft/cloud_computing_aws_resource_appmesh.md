---
title: 【IT技術の知見】AppMesh＠AWS
description: AppMesh＠AWSの知見を記録しています。
---

# AppMesh＠AWS

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AppMeshとは

クラウドサービスメッシュとして機能する。

VirtualRouter、VirtualService、VirtualNode、One-Way TLS/mTLS、から構成される。

<br>

## 02. テレメトリーの収集

### 分散トレース

AppMesh上のEnvoyはX-rayデーモンにスパンを送信し、X-rayで分散トレースを監視できるようにする。

一方で、Istio上のEnvoyはこの機能を使えず、代わりにopentelemetryコレクターにスパンを送信しないといけず、AppMeshはAWSとの親和性が高い。

> - https://www.appmeshworkshop.com/x-ray/
> - https://nathanpeck.com/improving-observability-with-aws-app-mesh-amazon-ecs/

<br>
