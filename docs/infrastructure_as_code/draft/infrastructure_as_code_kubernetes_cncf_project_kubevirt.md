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

Kuberbetesオーケストレーションツール (例：Kubeadm) を組み合わせられる。

仮想サーバーの各コンポーネントを作成するQEMU、仮想サーバーのライフサイクルを管理するlibvirt、などを使用している。

> - https://github.com/kubevirt/kubevirt/blob/main/docs/vm-configuration.md#virtual-machine-configuration
> - https://wiki.archlinux.jp/index.php/Libvirt
> - https://xtech.nikkei.com/it/article/Keyword/20100709/350133/

<br>
