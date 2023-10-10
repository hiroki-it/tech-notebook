---
title: 【IT技術の知見】cluster-proportional-autoscaler＠ハードウェアリソース管理
description: cluster-proportional-autoscaler＠ハードウェアリソース管理の知見を記録しています。
---

# cluster-proportional-autoscaler＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

# 01. 仕組み

NodeのCPUやNode数に応じて、Podを水平スケーリングする。

メトリクスをパラメーターとするHorizontalPodAutoscalerとは異なる。

> - https://github.com/kubernetes-sigs/cluster-proportional-autoscaler
> - https://creators-note.chatwork.com/entry/2020/12/23/100000#dns-autoscalercluster-proportional-autoscaler

<br>
