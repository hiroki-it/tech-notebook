---
title: 【IT技術の知見】Telepresence＠デバッグ系
description: Telepresence＠デバッグ系の知見を記録しています。
---

# Telepresence＠デバッグ系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Telepresenceとは

DeploymentをTelepresenceのプロキシに一時的に置き換え、そのDeploymentに対する通信をローカルに転送する。

ローカルPCをKubernetes Cluster内のPodのように使用できる。

Kubernetes Cluster内のPodに送信されたリクエストをローカルPCで確認できる。

![telepresence_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/telepresence_architecture.png)

> - https://qiita.com/yuzumikan15/items/5e5949f3058535f5e5ec#telepresence-%E3%82%92%E4%BD%BF%E3%81%86
> - https://blog.1q77.com/2022/01/telepresence-part-2/#%E5%9B%B3%E8%A7%A3

<br>

## 02. セットアップ

### brew

```bash
$ brew install telepresenceio/telepresence/telepresence-oss
```

> - https://www.telepresence.io/docs/install/client

<br>

## 03. コマンド

### connect

#### ▼ connectとは

Kubernetes Clusterに接続する。

#### ▼ -n

ローカルPCとつなぐPodをいずれのNamespaceにおくかを設定する。

```bash
$ telepresence connect -n <Namespace名>

connected to context <Kubernetes Clusterのコンテキスト>
```

> - https://www.telepresence.io/docs/reference/client

<br>

### config view

設定を確認する。

```bash
telepresence config view

clientConfig:
  routing:
    neverProxySubnets:
    - *.*.*.*/32

clientFile: ***/telepresence/config.yml
```

<br>
