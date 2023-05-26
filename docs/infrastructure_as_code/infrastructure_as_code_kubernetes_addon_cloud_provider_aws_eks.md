---
title: 【IT技術の知見】AWS EKSアドオン＠クラウドプロバイダーアドオン
description: AWS EKSアドオン＠クラウドプロバイダーアドオンの知見を記録しています。
---

# AWS EKSアドオン＠クラウドプロバイダーアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EKSアドオン

### AWS EKSアドオンとは

EKSのコントロールプレーンとデータプレーン上でKubernetesを稼働させるために必要なアドオン。

マネージドタイプとセルフマネージドタイプがあり、マネージドタイプではアドオンの設定値をAWSが管理し、ユーザーの設定を強制的に上書きする。

一方で、セルフマネージドタイプではユーザーがアドオンの設定値を定義できる。

> ↪️：
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

> ↪️：https://github.com/aws/eks-charts/tree/master/stable

<br>

## 02. aws-eks-codednsアドオン

### aws-eks-codednsアドオンとは

EKSの各Node上で、`kube-dns`という名前のDeploymentとして稼働する。

同じCluster内の全てのPodの名前解決を行う。

aws-eks-corednsアドオンがAWS EKS Cluster内に無い場合、外部サービス (例：SSOのIDプロバイダーなど) の名前解決を実行できなくなるため、必須である。

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/managing-coredns.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> ↪️：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-coredns.html

<br>

## 03. aws-eks-distro-for-opentelemetry

テレメトリーの収集をマネージドにする。

メトリクスの場合、ストレージとアラートをマネージドにしたManaged Prometheusと組み合わせると、データの収集 (プル型のみ) から保管までをマネージドにできる。

> ↪️：https://speakerdeck.com/k6s4i53rx/opentelemetrywoyong-itaobservabilityji-pan-noshi-zhuang-with-aws-distro-for-opentelemetry?slide=13

<br>

## 04. aws-eks-kube-proxy

### aws-eks-kube-proxyアドオンとは

EKSの各Node上で、`kube-proxy`という名前のDaemonSetとして稼働する。

EKSのコントロールプレーン上のkube-apiserverが、Node外からPodにインバウンド通信をルーティングできるようにする。

aws-eks-kube-proxyアドオンがAWS EKS Cluster内に無い場合、Pod内のコンテナのライフサイクルを何も管理できなくなるため、必須である。

> ↪️：https://docs.aws.amazon.com/eks/latest/userguide/managing-kube-proxy.html

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> ↪️：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-kube-proxy.html

<br>

## 05. aws-eks-vpc-cniアドオン

### aws-eks-vpc-cniアドオンとは

EKSのNode上で、`aws-node`という名前のDaemonSetとして稼働する。

aws-eks-vpc-cniアドオンがAWS EKS Cluster内に無い場合、EC2ワーカーNodeにアタッチされるはずのAWS ENIを作成できずに、何も通信ができなくなるため、PodやServiceにIPアドレスが自動的に割り当てられないため、必須である。

![aws_eks-vpc-cni](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/aws_eks-vpc-cni.png)

> ↪️：
>
> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/
> - https://aws.amazon.com/jp/blogs/news/amazon-vpc-cni-increases-pods-per-node-limits/
> - https://docs.aws.amazon.com/eks/latest/userguide/pod-networking.html
> - https://medium.com/engineered-publicis-sapient/container-network-interface-cni-for-eks-4b1cbfff0f4e

<br>

## 05-02. aws-eks-vpc-cniアドオンの仕組み

### アーキテクチャ

aws-eks-vpc-cniアドオンは、L-IPAMデーモン (ipamd) 、CNIプラグイン、といったコンポーネントから構成されている。

> ↪️：https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/

<br>

### L-IPAM

### L-IPAMとは

`aws-node`のDaemonSet配下のコンテナ上で、デーモンとして稼働している。

他のCNIアドオンにない独自モードを持つ。

<br>

### IPアドレス割り当てモード

#### ▼ 通常モード

L-IPAMは、NodeのAWS ENIに紐づけられたセカンダリープライベートIPアドレスをPodに割り当てる。

この時、Nodeのインスタンスタイプごとに紐付けられるセカンダリープライベートIPアドレス数に制限があるため、Node上でスケジューリングするPod数がインスタンスタイプに依存する。

執筆時点 (2022/09/24) のFargateでは、インスタンスタイプに限らずNode当たり`1`個しかPodをスケジューリングできない。

![kubernetes_cni-addon_aws-mode](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/kubernetes_cni-addon_aws-mode.png)

> ↪️：
>
> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/
> - https://itnext.io/kubernetes-is-hard-why-eks-makes-it-easier-for-network-and-security-architects-ea6d8b2ca965
> - https://medium.com/elotl-blog/kubernetes-networking-on-aws-part-ii-47906de2921d
> - https://github.com/awslabs/amazon-eks-ami/blob/master/files/eni-max-pods.txt

#### ▼ Prefix Delegationモード

L-IPAMは、NodeのENIにCIDR (`/28`) を割り当て、これから取得したIPアドレスをPodに割り当てる。

Prefix Delegationモードを使用する場合、Nodeを置くAWSサブネットのCIDRを`/28`よりも大きくしておく必要がある。

> ↪️：https://aws.github.io/aws-eks-best-practices/networking/prefix-mode/

<br>

### 設定

#### ▼ バージョン

Kubernetesのバージョンに応じて、異なるアドオンのバージョンを使用する必要がある。

> ↪️：https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-vpc-cni.html#vpc-add-on-update

#### ▼ 環境変数

| 環境変数名                              | 説明                                                                                                 | 設定例                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `ADDITIONAL_ENI_TAGS`                   |                                                                                                      | `{}`                                                                             |
| `ANNOTATE_POD_IP`                       |                                                                                                      | `true`                                                                           |
| `AWS_VPC_CNI_NODE_PORT_SUPPORT`         |                                                                                                      | `true`                                                                           |
| `AWS_VPC_ENI_MTU`                       |                                                                                                      | `9001`                                                                           |
| `AWS_VPC_K8S_CNI_CONFIGURE_RPFILTER`    |                                                                                                      | `false`                                                                          |
| `AWS_VPC_K8S_CNI_CUSTOM_NETWORK_CFG`    |                                                                                                      | `false`                                                                          |
| `AWS_VPC_K8S_CNI_EXTERNALSNAT`          |                                                                                                      | `false`                                                                          |
| `AWS_VPC_K8S_CNI_LOGLEVEL`              | aws-eks-vpcアドオンのログレベルを設定する。                                                          | `DEBUG`                                                                          |
| `AWS_VPC_K8S_CNI_LOG_FILE`              | aws-eks-vpcアドオンのログファイルの保管先を設定する。                                                | `/host/var/log/aws-routed-eni/ipamd.log`                                         |
| `AWS_VPC_K8S_CNI_RANDOMIZESNAT`         |                                                                                                      | `prng`                                                                           |
| `AWS_VPC_K8S_CNI_VETHPREFIX`            |                                                                                                      | `eni`                                                                            |
| `AWS_VPC_K8S_PLUGIN_LOG_FILE`           | aws-eks-vpcアドオンのプラグインのログファイルの保管先を設定する。                                    | `/var/log/aws-routed-eni/plugin.log`                                             |
| `AWS_VPC_K8S_PLUGIN_LOG_LEVEL`          | aws-eks-vpcアドオンのプラグインのログレベルを設定する。                                              | `DEBUG`                                                                          |
| `CLUSTER_ENDPOINT`                      | AWS EKS ClusterのエンドポイントのURLを設定する。                                                     | `https://*****.sk1.ap-northeast-1.eks.amazonaws.com`                             |
| `CLUSTER_NAME`                          | AWS EKS Clusterの名前を設定する。                                                                    | `foo-cluster`                                                                    |
| `DISABLE_INTROSPECTION`                 |                                                                                                      | `false`                                                                          |
| `DISABLE_METRICS`                       |                                                                                                      | `false`                                                                          |
| `DISABLE_NETWORK_RESOURCE_PROVISIONING` |                                                                                                      | `false`                                                                          |
| `ENABLE_IPv4`                           |                                                                                                      | `true`                                                                           |
| `ENABLE_IPv6`                           |                                                                                                      | `false`                                                                          |
| `ENABLE_POD_ENI`                        |                                                                                                      | `false`                                                                          |
| `ENABLE_PREFIX_DELEGATION`              |                                                                                                      | `false`                                                                          |
| `MAX_ENI`                               | AWS EC2/FargateワーカーNodeが`1`個あたりで最大で紐づけるENI数を設定する。                            | `20`                                                                             |
| `MINIMUM_IP_TARGET`                     | AWS EC2/FargateワーカーNodeが`1`個あたりで最低限確保するIPアドレス数を設定する。                     | `20`                                                                             |
| `MY_NODE_NAME`                          | ワーカーNode名が設定されているマニフェストのキーを設定する。                                         | `"fieldRef": {"apiVersion": "v1","fieldPath": "spec.nodeName"}}`                 |
| `MY_POD_NAME`                           | Pod名が設定されているマニフェストのキーを設定する。                                                  | `"fieldRef": {"apiVersion": "v1","fieldPath": "metadata.name"}}`                 |
| `POD_SECURITY_GROUP_ENFORCING_MODE`     | Podのセキュリティグループの適用方法を設定する。注意点として、Podの送信元IPアドレスにも影響を与える。 | `standard` (`standard`の場合は、プライマリーENIのセキュリティグループを適用する) |
| `VPC_ID`                                | AWS VPCのIDを設定する。。                                                                            | `vpc-*****`                                                                      |
| `WARM_ENI_TARGET`                       | AWS EC2/FargateワーカーNodeが`1`個あたりで最低限確保するAWS ENI数を設定する。                        | `1`                                                                              |
| `WARM_PREFIX_TARGET`                    |                                                                                                      | `1`                                                                              |
| `WARM_IP_TARGET`                        | AWS EC2/FargateワーカーNodeが`1`個あたりで余分に確保するIPアドレス数を設定する。                     | `2`                                                                              |

> ↪️：
>
> - https://github.com/aws/amazon-vpc-cni-k8s#cni-configuration-variables
> - https://aws.github.io/aws-eks-best-practices/networking/vpc-cni/#configure-ip-and-eni-target-values-in-address-constrained-environments
> - https://repost.aws/ja/knowledge-center/eks-configure-cni-plugin-use-ip-address
> - https://dunkshoot.hatenablog.com/entry/eks_reduce_number_of_ipaddress
> - https://zenn.dev/nshmura/articles/fbb53aaf6fed8c

#### ▼ 確認方法

aws-eks-vpc-cniアドオンは、`aws-node`というDaemonSetとして稼働している。

これのコンテナの環境変数で、アドオンの設定が管理されている。

```bash
$ kubectl get daemonset aws-node \
    -n kube-system -o \
    jsonpath='{.spec.template.spec.containers[*].env}' \
    | jq .
```

<br>
