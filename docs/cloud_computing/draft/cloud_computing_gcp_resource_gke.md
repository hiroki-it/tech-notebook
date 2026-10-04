---
title: 【IT技術の知見】GKE＠Google Cloudリソース
description: GKE＠Google Cloudリソースの知見を記録しています。
---

# GKE＠Google Cloud リソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. GKE

### セットアップ

GKE ではコントロールプレーンのみが、また GKE Autopilot では、コントロールプレーンとワーカーNode の両方がマネージドになる。

<br>

### アップグレード

#### ▼ ローリング方式 (サージ方式、ライブ方式)

> - [Node upgrade strategies \| Google Kubernetes Engine (GKE) \| Google Cloud Documentation](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#surge)
> - https://www.slideshare.net/nttdata-tech/anthos-cluster-design-upgrade-strategy-cndt2021-nttdata#44

#### ▼ ブルー/グリーン方式

> - [Node upgrade strategies \| Google Kubernetes Engine (GKE) \| Google Cloud Documentation](https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#blue-green-upgrade-strategy)

<br>

## 02. Cloud Service Mesh

Google Cloud の提供するカスタムリソースを使用し、Kubernetes API の Gateway と Istio を組み合わせたサービスメッシュを実現する。

> - [Understand Cloud Service Mesh API Resources \| Google Cloud Documentation](https://cloud.google.com/service-mesh/docs/understand-api-resources)
