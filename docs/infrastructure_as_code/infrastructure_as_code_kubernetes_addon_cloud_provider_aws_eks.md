---
title: 【IT技術の知見】AWS EKSアドオン＠クラウドプロバイダーアドオン
description: AWS EKSアドオン＠クラウドプロバイダーアドオンの知見を記録しています。
---

# AWS EKSアドオン＠クラウドプロバイダーアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EKSアドオン

### AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。

マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。

一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。

> ↪️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/add-ons-configuration.html
> - https://qiita.com/masahata/items/ba88d0f9c26b1c2bf6f9

<br>

### セットアップ

#### ▼ コンソール画面から

| 設定項目               | 説明                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------- |
| バージョン             | AWS EKSアドオンのバージョンを設定する。                                             |
| オプション             | AWS EKSアドオンのパラメーターを設定する。                                           |
| 継承                   | AWS EKSのNodeのIAMロールをEKSアドオンにも適用するか否かを設定する。                 |
| コンフリクトの解決方法 | 既存のAWS EKSアドオンが存在している場合に、上書きするかそのままとするかを設定する。 |

#### ▼ Terraformの場合

Terraformを使用する。

```terraform
# aws-eks-corednsアドオン
resource "aws_eks_addon" "coredns" {
  cluster_name      = aws_eks_cluster.foo.name
  addon_version     = "<バージョン>"
  addon_name        = "coredns"
  resolve_conflicts = "PRESERVE"
}


# aws-kube-proxy
resource "aws_eks_addon" "kube_proxy" {
  cluster_name      = aws_eks_cluster.foo.name
  addon_version     = "<バージョン>"
  addon_name        = "kube-proxy"
  resolve_conflicts = "PRESERVE"
}


# aws-vpc-cniアドオン
resource "aws_eks_addon" "vpc_cni" {
  cluster_name      = aws_eks_cluster.foo.name
  addon_version     = "<バージョン>"
  addon_name        = "vpc-cni"
  resolve_conflicts = "PRESERVE"
}
```

#### ▼ Helmの場合

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts


# aws-eks-corednsアドオン
# 執筆時点 (2023/03/02) 時点でチャートなし


# aws-kube-proxy
# 執筆時点 (2023/03/02) 時点でチャートなし


# aws-vpc-cniアドオン
$ helm install <リリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/aws/eks-charts/tree/master/stable

<br>

## 02. aws-eks-codednsアドオン

### aws-eks-codednsアドオンとは

EKSの各Node上で、`kube-dns`という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

## 03. aws-eks-kube-proxy

### aws-eks-kube-proxyアドオンとは

EKSの各Node上で、`kube-proxy`という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

## 04. aws-eks-vpc-cniアドオン

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

### 仕組み

aws-eks-vpc-cniアドオンは、他のCNIアドオンにない独自モードを持ち、Podの仮想ネットワークインターフェース (`veth`) 、Nodeのネットワークインターフェース (`eth`) 、から構成される。

AWSでは、Node (EC2、Fargate) 上でスケジューリングするPodの数だけNodeにENIを紐づけ、さらにこのENIにVPC由来のプライマリーIPアドレスとセカンダリーIPアドレスの`2`つを付与できる。

NodeのENIとPodを紐づけることにより、PodをVPCのネットワークに参加させ、異なるNode上のPod間を接続する。

Nodeのインスタンスタイプごとに、紐づけられるENI数に制限があるため、Node上でスケジューリングするPod数がインスタンスタイプに依存する (2022/09/24時点で、Fargateではインスタンスタイプに限らず、Node当たり`1`個しかPodをスケジューリングできない) 。

![kubernetes_cni-addon_aws-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_aws-mode.png)

> ↪️ 参考：
>
> - https://itnext.io/kubernetes-is-hard-why-eks-makes-it-easier-for-network-and-security-architects-ea6d8b2ca965
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d
> - https://github.com/awslabs/amazon-eks-ami/blob/master/files/eni-max-pods.txt
