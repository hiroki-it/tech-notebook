---
title: 【IT技術の知見】クラウドプロバイダーアドオン＠Kubernetes
description: クラウドプロバイダーアドオン＠Kubernetesの知見を記録しています。
---

# クラウドプロバイダーアドオン＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. AWS EKSアドオン

### AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/add-ons-configuration.html
> - https://qiita.com/masahata/items/ba88d0f9c26b1c2bf6f9

<br>

### eks-code-dnsアドオン

#### ▼ eks-code-dnsアドオンとは

EKSの各Node上で、```kube-dns```という名前のDeploymentとして稼働する。同じCluster内の全てのPodの名前解決を行う。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

### eks-kube-proxy

#### ▼ eks-kube-proxyアドオンとは

EKSの各Node上で、```kube-proxy```という名前のDaemonSetとして稼働する。EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

> ℹ️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

### eks-vpc-cniアドオン

#### ▼ eks-vpc-cniアドオンとは

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/aws_eks-vpc-cni.png)

EKSのNode上で、```aws-node```という名前のDaemonSetとして稼働する。PodにAWS ENIを紐付け、Clusterネットワーク内のIPアドレスをPodのENIに割り当てる。これにより、EKSのClusterネットワーク内にあるPodにインバウンド通信をルーティングできるようにする。

> ℹ️ 参考：
>
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html

<br>


