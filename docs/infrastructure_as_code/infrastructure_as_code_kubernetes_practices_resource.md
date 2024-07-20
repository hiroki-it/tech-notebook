---
title: 【IT技術の知見】プラクティス集＠Kubernetesリソース
description: プラクティス集＠Kubernetesリソースの知見を記録しています。
---

# プラクティス集＠Kubernetesリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Pod

### 安全性

#### ▼ 認証/認可の実施

<br>

### 可用性

#### ▼ 冗長化

ReplicaSetでPodを冗長化し、可用性を担保する。

#### ▼ 水平スケーリング

HorizontalPodAutoscalerでPodを水平スケーリングし、可用性を担保する。

水平スケーリングは、Podの負荷が高くなると冗長化してくれ、高負荷でいずれかのPodで障害が起こっても正常なPodがこれを埋め合わせしてくれるため、システム全体として稼働時間を長くできる。

<br>
