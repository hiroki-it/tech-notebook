---
title: 【IT技術の知見】TCP階層モデル＠ネットワーク
description: TCP階層モデル＠ネットワークの知見を記録しています。
---

# TCP階層モデル＠ネットワーク

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. OSI階層モデルへの移行

基本的に、OSI階層モデルに寄せて整理しているため、以下のノートを参照すること。

> - https://hiroki-it.github.io/tech-notebook/network/network_model_osi.html

<br>

## 02. TCP階層モデル

### OSI参照モデルとは

ネットワークで使用されているプロトコルを`4`階層に分類したモデルこと。

<br>

### 種類

TCP階層モデルは、ネットワークインターフェース層、インターネット層、トランスポート層、アプリケーション層、から構成される。

TCP/IPモデルで使用されるプロトコルのうち、最も代表的な『TCP』と『IP』から名前をとって『TCP/IP』と名付けられた。

暗号化プロトコルを使用している場合は、`L6`にて`L7`のペイロードを暗号化/復号化する。

![encryption_protocol](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/encryption_protocol.png)

<br>

## 03. 通信機器との対応関係

送信元で作成されたパケットは、非カプセル化されながら、通信機器に認識される。

![tcp-ip_structure](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/tcp-ip_structure.png)

> - https://ja.wikipedia.org/wiki/%E3%83%AB%E3%83%BC%E3%82%BF%E3%83%BC

<br>
