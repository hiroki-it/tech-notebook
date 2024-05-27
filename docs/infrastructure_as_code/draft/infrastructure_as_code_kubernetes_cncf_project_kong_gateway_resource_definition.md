---
title: 【IT技術の知見】Kong Gateway＠CNCF
description: Kong Gateway＠CNCFの知見を記録しています。
---

# Kong Gateway＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### チャートとして

```bash
$ helm repo add <チャートリポジトリ名> https://charts.konghq.com

$ helm repo update

$ kubectl create namespace kong

$ helm install <Helmリリース名> <チャートリポジトリ名>/kong -n kong --version <バージョンタグ>
```

> - https://docs.konghq.com/gateway/latest/install/kubernetes/proxy/#helm-setup

<br>
