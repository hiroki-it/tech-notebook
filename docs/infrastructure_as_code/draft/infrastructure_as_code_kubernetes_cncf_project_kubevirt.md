---
title: 【IT技術の知見】Kubevirt＠CNCFプロジェクト
description: Kubevirt＠CNCFプロジェクトの知見を記録しています。
---

# Kubevirt＠CNCFプロジェクト

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubevirtの仕組み

Cluster上に仮想Nodeを作成し、またライフサイクルを管理する。

Clusterを作成するツール (例：Kubeadm) を組み合わせられる。

仮想I/Oデバイスを作成するQEMU、仮想サーバーを管理するlibvirt、などを使用している。

<br>
