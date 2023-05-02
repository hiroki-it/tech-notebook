---
title: 【IT技術の知見】リソース定義＠FluentBit
description: リソース定義＠FluentBitの知見を記録しています。
---

# リソース定義＠FluentBit

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. セットアップ

### インストール

#### ▼ チャートとして

Node内でFluentBitをコンテナとして稼働させる場合、チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://fluent.github.io/helm-charts

$ helm repo update

$ kubectl create namespace fluent

$ helm install <リリース名> <リポジトリ名>/fluent-bit -n fluent --version <バージョンタグ>
```

> ↪️：https://github.com/fluent/helm-charts/tree/main/charts/fluent-bit

#### ▼ AWS EKS専用のチャートとして

AWS EKSでFluentBitを簡単にセットアップするために、それ専用のチャートを使用する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

$ helm repo update

$ helm install <リリース名> <リポジトリ名>/aws-for-fluent-bit -n kube-system --version <バージョンタグ>
```

> ↪️：https://github.com/aws/eks-charts/tree/master/stable/aws-for-fluent-bit

<br>
