---
title: 【IT技術の知見】ストレージCSIドライバー＠ストレージ系
description: ストレージCSIドライバー＠ストレージ系の知見を記録しています。
---

# ストレージ CSI ドライバー＠ストレージ系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. ストレージ CSI ドライバーとは

StorageClass に合わせて PersistentVolume を自動的に作成する。

また、PersistentVolume と外部ストレージを紐づける。

<br>

## 02. ストレージ CSI ドライバーの種類

### HostPath CSI

`.spec.hostPath` キーの設定された PersistentVolume を自動的に作成する。

ストレージ CSI ドライバーといいながら外部ストレージを使用しておらず、基本的には開発環境のモックとして使用する。

> - [GitHub - kubernetes-csi/csi-driver-host-path: A sample (non-production) CSI Driver that creates a local directory as a volume on a single node · GitHub](https://github.com/kubernetes-csi/csi-driver-host-path)

<br>
