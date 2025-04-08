---
title: 【IT技術の知見】Cert Manager＠セキュリティ系ミドルウェア
description: Cert Manager＠セキュリティ系ミドルウェアの知見を記録しています。
---

# Cert Manager＠セキュリティ系ミドルウェア

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Cert Managerの仕組み

### アーキテクチャ

Cert Managerはを作成し、Secretに保管する。

このSecret上で、クライアント／SSL証明書と、これのペアとなる秘密鍵を管理する。

Pod内のコンテナにSecretをマウントし、Pod間の通信をTLS化する。

![cert-manager_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/cert-manager_architecture.png)

> - https://piotrminkowski.com/2022/12/02/renew-certificates-on-kubernetes-with-cert-manager-and-reloader/
> - https://youtu.be/rOe9UpHcnKk?t=301

<br>
