---
title: 【IT技術の知見】Kind
description: Kindの知見を記録しています。
tags:
  - "K8sアプリ"
  - "開発環境"
  - "Kind"
---

# Kind

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Kind の仕組み

### アーキテクチャ

ホスト上にコンテナを作成する。

このコンテナ内に Kind 仮想サーバーを作成し、仮想サーバー上に Node を持つ Kubernetes Cluster を作成する。

なお、Minikube の Docker ドライバーも同じ仕組みである。

> - [kind – Initial design](https://kind.sigs.k8s.io/docs/design/initial)

<br>
