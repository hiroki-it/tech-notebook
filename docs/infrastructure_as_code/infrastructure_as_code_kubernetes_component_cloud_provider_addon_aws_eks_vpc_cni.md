---
title: 【IT技術の知見】AWS VPC CNI＠AWS EKSアドオン
description: AWS VPC CNI＠AWS EKSアドオンの知見を記録しています。
---

# AWS VPC CNI＠AWS EKSアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. aws-eks-vpc-cniアドオン

### aws-eks-vpc-cniアドオンとは

EKSのNode上で、`aws-node`という名前のDaemonSetとして稼働する。

PodにAWS ENIを紐付け、Clusterネットワーク内のIPアドレスをPodのENIに割り当てる。

これにより、EKSのClusterネットワーク内にあるPodにインバウンド通信をルーティングできるようにする。

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eks-vpc-cni.png)

> ↪️ 参考：
>
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html

<br>

## 02. セットアップ

### マネージドな場合

コンソール画面から設定する。

<br>

### セルフマネージドな場合

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

$ helm install <リリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/aws/eks-charts/tree/master/stable/aws-vpc-cni

<br>
