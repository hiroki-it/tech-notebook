---
title: 【IT技術の知見】リソース定義＠FluentBit
description: リソース定義＠FluentBitの知見を記録しています。
---

# リソース定義＠FluentBit

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - [【IT技術の知見】はじめに - 俺の技術ノート](https://hiroki-it.github.io/tech-notebook/)

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

チャートリポジトリからチャートをインストールし、Kubernetes リソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://fluent.github.io/helm-charts

$ helm repo update

$ kubectl create namespace fluent

$ helm install <Helmリリース名> <リポジトリ名>/fluent-bit -n fluent --version <バージョンタグ>
```

> - [helm-charts/charts/fluent-bit at main · fluent/helm-charts · GitHub](https://github.com/fluent/helm-charts/tree/main/charts/fluent-bit)

#### ▼ Amazon EKS 専用のチャートとして

Amazon EKS で FluentBit を簡単にセットアップするために、それ専用のチャートを使用する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

$ helm repo update

$ helm install <Helmリリース名> <リポジトリ名>/aws-for-fluent-bit -n kube-system --version <バージョンタグ>
```

> - [eks-charts/stable/aws-for-fluent-bit at master · aws/eks-charts · GitHub](https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit)

<br>
