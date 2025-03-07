---
title: 【IT技術の知見】AWS EKSアドオン＠クラウドプロバイダー系
description: AWS EKSアドオン＠クラウドプロバイダー系の知見を記録しています。
---

# AWS EKSアドオン＠クラウドプロバイダー系

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
| オプション             | AWS EKSアドオンのオプションを設定する。                                             |
| 継承                   | AWS EKSのNodeのIAMロールをEKSアドオンにも適用するか否かを設定する。                 |
| コンフリクトの解決方法 | 既存のAWS EKSアドオンが存在している場合に、上書きするかそのままとするかを設定する。 |

#### ▼ Terraformの場合

Terraformを使用する。

```terraform
# AWS CoreDNS
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


# AWS kube-proxy
resource "aws_eks_addon" "kube_proxy" {
  cluster_name                = aws_eks_cluster.foo.name
  addon_version               = "<バージョン>"
  addon_name                  = "kube-proxy"
  # Terraformで設定を上書きできるようにする
  resolve_conflicts_on_update = "OVERWRITE"
}


# AWS VPC CNI
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


# AWS CoreDNS
# 執筆時点 (2023/03/02) 時点でチャートなし


# AWS kube-proxy
# 執筆時点 (2023/03/02) 時点でチャートなし


# AWS VPC CNI
$ helm install <Helmリリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```

> - https://github.com/aws/eks-charts/tree/master/stable

<br>

## 02. AWS CoreDNS

### AWS CoreDNSとは

EKSの各Node上で、`kube-dns`という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

AWS CoreDNSがAWS EKS Cluster内に無い場合、外部のツール (例：SSOのIDプロバイダーなど) を名前解決できなくなるため、必須である。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

## 03. AWS Distro for OpenTelemetry

テレメトリーの収集をマネージドにする。

メトリクスの場合、ストレージとアラートをマネージドにしたManaged Prometheusと組み合わせると、データの収集 (プル型のみ) から保管までをマネージドにできる。

> - https://speakerdeck.com/k6s4i53rx/opentelemetrywoyong-itaobservabilityji-pan-noshi-zhuang-with-aws-distro-for-opentelemetry?slide=13

<br>

## 04. AWS kube-proxy

### AWS kube-proxyとは

EKSの各Node上で、`kube-proxy`という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPod内へのリクエストをルーティングできるようにする。

AWS kube-proxyがAWS EKS Cluster内に無い場合、Pod内のコンテナのライフサイクルを何も管理できなくなるため、必須である。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> - https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

## 05. AWS Node monitoring agent

Nodeに関するヘルスチェック (例：AWS EC2内のkubeletの正常性) を実施する。

なお、AWS EC2に関するヘルスチェック (例：AWS EC2の正常性) は、AWS Auto Scalingグループで設定できる。

> - https://www.reddit.com/r/aws/comments/1hg998p/comment/m2hfdns/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
> - https://docs.aws.amazon.com/eks/latest/userguide/node-health.html

<br>

## 06. AWS Pod Identity agent

記入中...

<br>
