---
title: 【IT技術の知見】Argo Rollouts＠CDツール
description: Argo Rollouts＠CDツールの知見を記録しています。
---

# Argo Rollouts＠CD ツール

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Argo Rollouts の仕組み

### アーキテクチャ

argo-rollouts-controller、ダッシュボードから構成される。

> - https://argo-rollouts.readthedocs.io/en/stable/architecture/

<br>

### argo-rollouts-controller

Argo Rollouts リソースの Reconciliation を実行する。

<br>

### ArgoCD のダッシュボードの拡張

Argo Rollouts と ArgoCD は異なる Cluster 上に独立して存在できる。

ArgoCD のダッシュボードを拡張すると、ArgoCD から Argo Rollouts を操作できるようになる。

> - https://argo-rollouts.readthedocs.io/en/latest/FAQ/#how-does-argo-rollouts-integrate-with-argo-cd
> - https://github.com/argoproj-labs/rollout-extension

<br>
