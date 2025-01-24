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

Kubernetes Cluster内のPodで送受信するリクエストをローカルPCで確認できるようにする。

![telescope_usecase.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/telescope_usecase.png)

> - https://qiita.com/sheepland/items/68d3484f1dd02a306798#%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%81%A8kubernetes%E4%B8%8A%E3%81%AE%E3%82%B3%E3%83%B3%E3%83%86%E3%83%8A%E3%82%92%E5%85%A5%E3%82%8C%E6%9B%BF%E3%81%88%E3%82%8B
> - https://qiita.com/yuzumikan15/items/5e5949f3058535f5e5ec#telepresence-%E3%82%92%E4%BD%BF%E3%81%86

<br>

## 02. Telepresenceの仕組み

### アーキテクチャ

Pod内にtraffic-agentを挿入し、そのPodに対する通信をローカルに転送する。

![telepresence_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/telepresence_architecture.png)

> - https://blog.1q77.com/2022/01/telepresence-part-2/#%E5%9B%B3%E8%A7%A3

<br>

## 02. セットアップ

### brewリポジトリから

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
