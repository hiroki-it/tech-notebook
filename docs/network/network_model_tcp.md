---
title: 【IT技術の知見】TCP階層モデル＠ネットワーク
description: TCP階層モデル＠ネットワークの知見を記録しています。
---

# TCP階層モデル＠ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. TCP階層モデル

### OSI参照モデルとは

ネットワークで使用されているプロトコルを`4`階層に分類したモデルこと。

<br>

### 種類

TCP階層モデルは、ネットワークインターフェース層、インターネット層、トランスポート層、アプリケーション層、から構成される。

TCP/IPモデルで使用されるプロトコルのうち、最も代表的な『TCP』と『IP』から名前をとって『TCP/IP』と名付けられた。

暗号化プロトコルを使用している場合は、各階層でそのプロトコルがパケットヘッダーを暗号化する。

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol.png)

<br>

## 02. OSI階層モデルへの移行

基本的に、OSI階層モデルに寄せて整理しているため、以下のノートを参照してください。

> - https://hiroki-it.github.io/tech-notebook/network/network_model_osi.html

<br>
