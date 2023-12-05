---
title: 【IT技術の知見】AWS EKSアドオン＠クラウドプロバイダーアドオン
description: AWS EKSアドオン＠クラウドプロバイダーアドオンの知見を記録しています。
---

# AWS EKSアドオン＠クラウドプロバイダーアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EKSアドオン

### AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。

マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。

一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。

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
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "coredns"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
  # スケジューリングさせるNodeを設定する
  configuration_values = jsonencode(
    {
      nodeSelector = {
        "node.kubernetes.io/nodetype" = "system"
      }
    }
  )
}


# aws-kube-proxyアドオン
resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "kube-proxy"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
}


# aws-vpc-cniアドオン
resource "aws_eks_addon" "vpc_cni" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "vpc-cni"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
  # 環境変数を設定する
  configuration_values = jsonencode(
    {
      env = {
        # Podの上限数を変更する
        MINIMUM_IP_TARGET = "10"
        WARM_IP_TARGET    = "5"
      }
    }
  )
}
```

#### ▼ Helmの場合

チャートリポジトリからチャートをインストールし、Kubernetesリソースを作成する。

```bash
$ helm repo add <チャートリポジトリ名> https://aws.github.io/eks-charts


# aws-eks-corednsアドオン
# 執筆時点 (2023/03/02) 時点でチャートなし


# aws-kube-proxyアドオン
# 執筆時点 (2023/03/02) 時点でチャートなし


# aws-vpc-cniアドオン
$ helm install <Helmリリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```

> - https://github.com/aws/eks-charts/tree/master/stable

<br>

## 02. aws-eks-codednsアドオン

### aws-eks-codednsアドオンとは

EKSの各Node上で、`kube-dns`という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

aws-eks-corednsアドオンがAWS EKS Cluster内に無い場合、外部サービス (例：SSOのIDプロバイダーなど) の名前解決を実行できなくなるため、必須である。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

## 03. aws-eks-distro-for-opentelemetry

テレメトリーの収集をマネージドにする。

メトリクスの場合、ストレージとアラートをマネージドにしたManaged Prometheusと組み合わせると、データの収集 (プル型のみ) から保管までをマネージドにできる。

> - https://speakerdeck.com/k6s4i53rx/opentelemetrywoyong-itaobservabilityji-pan-noshi-zhuang-with-aws-distro-for-opentelemetry?slide=13

<br>

## 04. aws-eks-kube-proxy

### aws-eks-kube-proxyアドオンとは

EKSの各Node上で、`kube-proxy`という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

aws-eks-kube-proxyアドオンがAWS EKS Cluster内に無い場合、Pod内のコンテナのライフサイクルを何も管理できなくなるため、必須である。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>
