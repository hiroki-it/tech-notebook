---
title: 【IT技術の知見】ArgoRollouts＠CNCF
description: ArgoRollouts＠CNCFの知見を記録しています。
---

# ArgoRollouts＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ArgoRolloutsの仕組み

### アーキテクチャ

argo-rollouts-controller、ダッシュボード、から構成される。

> - https://argo-rollouts.readthedocs.io/en/stable/architecture/

<br>

### argo-rollouts-controller

ArgoRolloutsのカスタムリソースのReconciliationを実行する。

<br>

### ArgoCDのダッシュボードの拡張

ArgoRolloutsとArgoCDは異なるCluster上に独立して存在できる。

ArgoCDのダッシュボードを拡張すると、ArgoCDからArgoRolloutsを操作できるようになる。

> - https://argo-rollouts.readthedocs.io/en/latest/FAQ/#how-does-argo-rollouts-integrate-with-argo-cd
> - https://github.com/argoproj-labs/rollout-extension

<br>
