---
title: 【IT技術の知見】ストレージCSIドライバー＠ストレージ系
description: ストレージCSIドライバー＠ストレージ系の知見を記録しています。
---

# ストレージCSIドライバー＠ストレージ系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. ストレージCSIドライバーとは

StorageClass に合わせて PersistentVolume を自動的に作成する。

また、PersistentVolume と外部ストレージを紐づける。

<br>

## 02. ストレージCSIドライバーの種類

### HostPath CSI

`.spec.hostPath` キーの設定された PersistentVolume を自動的に作成する。

ストレージ CSI ドライバーといいながら外部ストレージを使用しておらず、基本的には開発環境のモックとして使用する。

> - https://github.com/kubernetes-csi/csi-driver-host-path

<br>
