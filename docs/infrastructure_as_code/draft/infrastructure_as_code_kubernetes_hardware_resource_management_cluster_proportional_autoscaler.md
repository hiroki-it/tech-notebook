---
title: 【IT技術の知見】cluster-proportional-autoscaler＠ハードウェアリソース管理系
description: cluster-proportional-autoscaler＠ハードウェアリソース管理系の知見を記録しています。
---

# cluster-proportional-autoscaler＠ハードウェアリソース管理系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

# 01. cluster-proportional-autoscaler の仕組み

Node の CPU や Node 数に応じて、Pod を水平スケーリングする。

メトリクスをパラメーターとする HorizontalPodAutoscaler とは異なる。

> - [GitHub - kubernetes-sigs/cluster-proportional-autoscaler: Kubernetes Cluster Proportional Autoscaler Container · GitHub](https://github.com/kubernetes-sigs/cluster-proportional-autoscaler)
> - [ChatworkのKubernetesを支えるツールたち(2020年版) - kubell Creator's Note](https://creators-note.chatwork.com/entry/2020/12/23/100000#dns-autoscalercluster-proportional-autoscaler)

<br>
