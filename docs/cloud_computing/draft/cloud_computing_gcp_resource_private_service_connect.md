---
title: 【IT技術の知見】GCPリソース＠GCPリソース
description: GCPリソース＠GCPリソースの知見を記録しています。
---

# GCPリソース＠GCPリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PrivateServiceConnect

グローバルプライベートIPアドレスを発行する。

このグローバルプライベートIPアドレスを指定することにより、GCP側のプライベートネットワーク (VPC) とユーザー側のプライベートネットワークの間を接続できる。

注意点として、PrivateServiceConnectは、それ専用の中継VPC内に作成する。

> - https://cloud.google.com/vpc/docs/private-service-connect

<br>
