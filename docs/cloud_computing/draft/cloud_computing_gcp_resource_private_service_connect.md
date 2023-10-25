---
title: 【IT技術の知見】PrivateServiceConnect＠Google Cloudリソース
description: PrivateServiceConnect＠Google Cloudリソースの知見を記録しています。
---

# PrivateServiceConnect＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. PrivateServiceConnect

グローバルプライベートIPアドレスを発行する。

このグローバルプライベートIPアドレスを指定することにより、Google Cloud側のプライベートネットワーク (VPC) とユーザー側のプライベートネットワークの間を接続できる。

注意点として、PrivateServiceConnectは、それ専用の中継VPC内に作成する。

> - https://cloud.google.com/vpc/docs/private-service-connect

<br>
