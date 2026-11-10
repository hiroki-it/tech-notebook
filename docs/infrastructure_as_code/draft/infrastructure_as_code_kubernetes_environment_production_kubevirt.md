---
title: 【IT技術の知見】Kubevirt
description: Kubevirtの知見を記録しています。
---

# Kubevirt

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Kubevirt の仕組み

Cluster 上に仮想 Node を作成し、またライフサイクルを管理する。

Kuberbetes オーケストレーションツール (例：Kubeadm) を組み合わせられる。

仮想サーバーの各コンポーネントを作成する QEMU、仮想サーバーのライフサイクルを管理する libvirt などを使用している。

> - [kubevirt/docs/vm-configuration.md at main · kubevirt/kubevirt · GitHub](https://github.com/kubevirt/kubevirt/blob/main/docs/vm-configuration.md#virtual-machine-configuration)
> - [libvirt - ArchWiki](https://wiki.archlinux.jp/index.php/Libvirt)
> - [QEMU \| 日経クロステック（xTECH）](https://xtech.nikkei.com/it/article/Keyword/20100709/350133/)

<br>
