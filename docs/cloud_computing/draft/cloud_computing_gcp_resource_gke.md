---
title: 【IT技術の知見】GKE＠Google Cloudリソース
description: GKE＠Google Cloudリソースの知見を記録しています。
---

# GKE＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. GKE

### セットアップ

GKEではコントロールプレーンのみが、またGKE Autopilotでは、コントロールプレーンとワーカーNodeの両方がマネージドになる。

<br>

### アップグレード

#### ▼ ローリング方式 (サージ方式、ライブ方式)

> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#surge
> - https://www.slideshare.net/nttdata-tech/anthos-cluster-design-upgrade-strategy-cndt2021-nttdata/44

#### ▼ ブルー/グリーン方式

> - https://cloud.google.com/kubernetes-engine/docs/concepts/node-pool-upgrade-strategies#blue-green-upgrade-strategy

<br>
