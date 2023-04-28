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
  resolve_conflicts = "OVERWRITE"
}


# aws-kube-proxyアドオン
resource "aws_eks_addon" "kube_proxy" {
  cluster_name      = aws_eks_cluster.foo.name
  addon_version     = "<バージョン>"
  addon_name        = "kube-proxy"
  resolve_conflicts = "OVERWRITE"
}


# aws-vpc-cniアドオン
resource "aws_eks_addon" "vpc_cni" {
  cluster_name      = aws_eks_cluster.foo.name
  addon_version     = "<バージョン>"
  addon_name        = "vpc-cni"
  resolve_conflicts = "OVERWRITE"
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
$ helm install <リリース名> <チャートリポジトリ名>/aws-vpc-cni -n kube-system --version <バージョンタグ>
```

> ↪️ 参考：https://github.com/aws/eks-charts/tree/master/stable

<br>

## 02. aws-eks-codednsアドオン

### aws-eks-codednsアドオンとは

EKSの各Node上で、`kube-dns`という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

aws-eks-corednsアドオンがEKS Cluster内に無い場合、外部サービス (例：SSOのIDプロバイダーなど) の名前解決を実行できなくなるため、必須である。

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

## 03. aws-eks-distro-for-opentelemetry

記入中...

<br>

## 04. aws-eks-kube-proxy

### aws-eks-kube-proxyアドオンとは

EKSの各Node上で、`kube-proxy`という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

aws-eks-kube-proxyアドオンがEKS Cluster内に無い場合、Pod内のコンテナのライフサイクルを一切管理できなくなるため、必須である。

> ↪️ 参考：https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

## 05. aws-eks-vpc-cniアドオン

### aws-eks-vpc-cniアドオンとは

EKSのNode上で、`aws-node`という名前のDaemonSetとして稼働する。

PodにAWS ENIを紐付け、Clusterネットワーク内のIPアドレスをPodのENIに割り当てる。

これにより、EKSのClusterネットワーク内にあるPodにインバウンド通信をルーティングできるようにする。

aws-eks-vpc-cniアドオンがEKS Cluster内に無い場合、EC2ワーカーNodeにアタッチされるはずのENIを作成できないため、PodやServiceにIPアドレスが自動的に割り当てられないため、必須である。

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eks-vpc-cni.png)

> ↪️ 参考：
>
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html

<br>

### 仕組み

aws-eks-vpc-cniアドオンは、他のCNIアドオンにない独自モードを持ち、Podの仮想ネットワークインターフェース (`veth`) 、Nodeのネットワークインターフェース (`eth`) 、といったコンポーネントから構成される。

AWSでは、Node (EC2、Fargate) 上でスケジューリングするPodの数だけNodeにENIを紐付け、さらにこのENIにVPC由来のプライマリーIPアドレスとセカンダリーIPアドレスの`2`つを付与できる。

NodeのENIとPodを紐付けることにより、PodをVPCのネットワークに参加させ、異なるNode上のPod間を接続する。

Nodeのインスタンスタイプごとに、紐付けられるENI数に制限があるため、Node上でスケジューリングするPod数がインスタンスタイプに依存する (2022/09/24時点で、Fargateではインスタンスタイプに限らず、Node当たり`1`個しかPodをスケジューリングできない) 。

![kubernetes_cni-addon_aws-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_aws-mode.png)

> ↪️ 参考：
>
> - https://itnext.io/kubernetes-is-hard-why-eks-makes-it-easier-for-network-and-security-architects-ea6d8b2ca965
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d
> - https://github.com/awslabs/amazon-eks-ami/blob/master/files/eni-max-pods.txt

<br>

### 設定

#### ▼ 確認方法

aws-eks-vpc-cniアドオンは、`aws-node`というDaemonSetとして稼働している。

これのコンテナの環境変数で、アドオンの設定が管理されている。

```bash
$ kubectl get daemonset aws-node \
    -n kube-system -o \
    jsonpath='{.spec.template.spec.containers[*].env}' \
    | jq .
```

| 環境変数名                              | 例                                                               |
| --------------------------------------- | ---------------------------------------------------------------- |
| `ADDITIONAL_ENI_TAGS`                   | `{}`                                                             |
| `AWS_VPC_CNI_NODE_PORT_SUPPORT`         | `true`                                                           |
| `AWS_VPC_ENI_MTU`                       | `9001`                                                           |
| `AWS_VPC_K8S_CNI_CONFIGURE_RPFILTER`    | `false`                                                          |
| `AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG`    | `false`                                                          |
| `AWS_VPC_K8S_CNI_EXTERNALSNAT`          | `false`                                                          |
| `AWS_VPC_K8S_CNI_LOGLEVEL`              | `DEBUG`                                                          |
| `AWS_VPC_K8S_CNI_LOG_FILE`              | `/host/var/log/aws-routed-eni/ipamd.log`                         |
| `AWS_VPC_K8S_CNI_RANDOMIZESNAT`         | `prng`                                                           |
| `AWS_VPC_K8S_CNI_VETHPREFIX`            | `eni`                                                            |
| `AWS_VPC_K8S_PLUGIN_LOG_FILE`           | `/var/log/aws-routed-eni/plugin.log`                             |
| `AWS_VPC_K8S_PLUGIN_LOG_LEVEL`          | `DEBUG`                                                          |
| `DISABLE_INTROSPECTION`                 | `false`                                                          |
| `DISABLE_METRICS`                       | `false`                                                          |
| `DISABLE_NETWORK_RESOURCE_PROVISIONING` | `false`                                                          |
| `ENABLE_IPv4`                           | `true`                                                           |
| `ENABLE_IPv6`                           | `false`                                                          |
| `ENABLE_POD_ENI`                        | `false`                                                          |
| `ENABLE_PREFIX_DELEGATION`              | `false`                                                          |
| `MY_NODE_NAME`                          | `"fieldRef": {"apiVersion": "v1","fieldPath": "spec.nodeName"}}` |
| `WARM_ENI_TARGET`                       | `1`                                                              |
| `WARM_PREFIX_TARGET`                    | `1`                                                              |

> ↪️ 参考：https://github.com/aws/amazon-vpc-cni-k8s#cni-configuration-variables

#### ▼ Podの使用するIPアドレス数の制御

以下の環境変数の値を変更することで、Podの使用するIPアドレス数を変更する。

| 環境変数            | 説明                                                    |
| ------------------- | ------------------------------------------------------- |
| `WARM_ENI_TARGET`   | AWS EC2/FargateワーカーNodeが最低限確保するENI数        |
| `WARM_IP_TARGET`    | AWS EC2/FargateワーカーNodeが余分に確保するIPアドレス数 |
| `MINIMUM_IP_TARGET` | AWS EC2/FargateワーカーNodeが最低限確保するIPアドレス数 |

> ↪️ 参考：
>
> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/#configure-ip-and-eni-target-values-in-address-constrained-environments
> - https://repost.aws/ja/knowledge-center/eks-configure-cni-plugin-use-ip-address
> - https://dunkshoot.hatenablog.com/entry/eks_reduce_number_of_ipaddress
> - https://zenn.dev/nshmura/articles/fbb53aaf6fed8c

<br>
