---
title: 【IT技術の知見】AWS EKSアドオン＠クラウドプロバイダーアドオン
description: AWS EKSアドオン＠クラウドプロバイダーアドオンの知見を記録しています。
---

# AWS EKSアドオン＠クラウドプロバイダーアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。

マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。

一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。



> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/add-ons-configuration.html
> - https://qiita.com/masahata/items/ba88d0f9c26b1c2bf6f9

<br>

## 02. aws-eks-codednsアドオン

### aws-eks-codednsアドオンとは

EKSの各Node上で、```kube-dns```という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

## 03. aws-eks-kube-proxy

### aws-eks-kube-proxyアドオンとは

EKSの各Node上で、```kube-proxy```という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

## 04. aws-eks-vpc-cniアドオン

### aws-eks-vpc-cniアドオンとは


EKSのNode上で、```aws-node```という名前のDaemonSetとして稼働する。

PodにAWS ENIを紐付け、Clusterネットワーク内のIPアドレスをPodのENIに割り当てる。

これにより、EKSのClusterネットワーク内にあるPodにインバウンド通信をルーティングできるようにする。

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_eks-vpc-cni.png)


> ℹ️ 参考：
>
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html

<br>

### セットアップ

#### ▼ マネージドな場合

コンソール画面から設定する。

#### ▼ セルフマネージドな場合

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts

$ helm install <リリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```


> ℹ️ 参考：https://github.com/aws/eks-charts/tree/master/stable/aws-vpc-cni

