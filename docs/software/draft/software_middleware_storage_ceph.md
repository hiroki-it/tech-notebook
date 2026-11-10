---
title: 【IT技術の知見】Ceph
description: Cephの知見を記録しています。
---

# Ceph

## はじめに

本サイトにつきまして、[【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/) をご認識のほど宜しくお願いいたします。

<br>

## 01. Ceph (セフ) とは

さまざまなストレージ (ブロックストレージ、ファイルストレージ、オブジェクトストレージ) として機能する。

> - [Welcome to Ceph — Ceph Documentation](https://docs.ceph.com/en/reef/)

<br>

## 02. Ceph の仕組み

### アーキテクチャ

Ceph は、RADOS という分散オブジェクトストアを基盤とし、Monitor、Manager、OSD、MDS といったデーモンから構成される。

> - [Architecture — Ceph Documentation](https://docs.ceph.com/en/reef/architecture/)

<br>

### ストレージタイプ

#### ▼ ブロックストレージ

RDB として使用できる。

#### ▼ ファイルストレージ

ファイルシステムとして使用できる。

#### ▼ オブジェクトストレージ

静的ファイルストレージとして使用できる。

<br>

### Rook (ルーク)

#### ▼ Rook とは

ストレージツール (例：Ceph) の操作を抽象化し、管理できるようにする。

#### ▼ 操作可能なストレージツール

- Ceph

<br>
