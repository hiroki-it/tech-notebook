---
title: 【IT技術の知見】karpenter＠ハードウェアリソース管理
description: karpenter＠ハードウェアリソース管理の知見を記録しています。
---

# karpenter＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. karpenterの仕組み

### アーキテクチャ

karpenterはAWS EC2のグループ (例：AWS EC2フリート) に関するAPIをコールし、Nodeの自動水平スケーリングを実行する。

karpenterを使用しない場合、クラウドプロバイダーのNode数は固定である。

AWSの場合のみ、cluster-autoscalerの代わりにkarpenterを使用できる。

karpenterでは、作成されるNodeのスペックを事前に指定する必要がなく、またリソース効率も良い。

そのため、必要なスペックの上限がわかっている場合はもちろん、上限を決めきれないような要件 (例：負荷が激しく変化するようなシステム) でも合っている。

![karpenter_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_architecture.png)

> - https://sreake.com/blog/learn-about-karpenter/
> - https://blog.inductor.me/entry/2021/12/06/165743
> - https://vishnudeva.medium.com/scaling-kubernetes-with-karpenter-1dc785e79010
> - https://qiita.com/o2346/items/6277a7ff6b1826d8de11

<br>

### cluster-autoscalerとの違い

cluster-autoscalerはクラウドプロバイダーによらずに使用できるが、karpenterは執筆時点 (2023/02/26) では、AWS上でしか使用できない。

そのため、クラウドプロバイダーの自動スケーリング (例：AWS EC2AutoScaling) に関するAPIをコールすることになり、その機能が自動スケーリングに関するAPIに依存する。

一方でkarpenterは、EC2のグループ (例：AWS EC2フリート) に関するAPIをコールするため、より柔軟なNode数にスケーリングできる。

![karpenter_vs_cluster-autoscaler.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> - https://awstip.com/this-code-works-autoscaling-an-amazon-eks-cluster-with-karpenter-part-1-3-40c7bed26cfd
> - https://www.linkedin.com/pulse/karpenter-%D1%83%D0%BC%D0%BD%D0%BE%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-kubernetes-%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B0-victor-vedmich/?originalSubdomain=ru
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-fleet.html

<br>

### パラメーター

#### ▼ Pod上限数

karpenterは、インスタンスタイプのPod上限数をスケーリングのパラメーターとする。

> - https://karpenter.sh/docs/concepts/provisioners/#max-pods

<br>

### スケーリングの仕組み

#### ▼ 対応するスケーリング

Karpenterは、現在のハードウェアリソースの使用量に応じて、Nodeを水平/垂直スケーリングする。

なお、Karpeneterでは垂直スケーリングを代わりに『deprovisioning』という。

> - https://github.com/aws/karpenter/issues/1226

#### ▼ スケールアウトの場合

例えば、以下のような仕組みで、Nodeの水平/垂直スケーリングのスケールアウトを実行する。

`(1)`

: Podが、Nodeの`70`%にあたるリソースを要求する。

     しかし、Nodeが`1`台では足りない。`70 + 70 = 140%`になるため、既存のNodeの少なくとも`1.4`倍のスペックが必要となる。

`(2)`

: 新しく決定したスペックで、Nodeを新しく作成する。

`(3)`

: 新しく作成したNodeにPodをスケジューリングさせる。また、既存のNodeが不要であれば削除する。

`(4)`

: 結果として、`1`台で`2`個のPodをスケジューリングさせている。

#### ▼ スケールインの場合

記入中...

<br>

## 02. セットアップ

### AWS側

#### ▼ Terraformの公式モジュールの場合

Kapenterのセットアップのうち、AWS側で必要なものをまとめる。

ここでは、Terraformの公式モジュールを使用する。

コマンド (例：`eksctl`コマンド) を使用しても良い。

```terraform
module "iam_assumable_role_with_oidc_karpenter_controller" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<モジュールのバージョン>"

  # karpenterコントローラーのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-karpenter-controller"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = [
    "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  ]

  # karpenterコントローラーのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:karpenter:karpenter"
  ]
}

resource "aws_iam_policy" "karpenter_controller" {
  name   = "foo-karpenter-controller-policy"
  policy = data.aws_iam_policy_document.karpenter_controller_policy.json
}

data "aws_iam_policy_document" "karpenter_controller_policy" {

  statement {
    actions = [
      "ssm:GetParameter",
      "ec2:DescribeImages",
      "ec2:RunInstances",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeInstances",
      "ec2:DescribeInstanceTypes",
      "ec2:DescribeInstanceTypeOfferings",
      "ec2:DescribeAvailabilityZones",
      "ec2:DeleteLaunchTemplate",
      "ec2:CreateTags",
      "ec2:CreateLaunchTemplate",
      "ec2:CreateFleet",
      "ec2:DescribeSpotPriceHistory",
      "pricing:GetProducts"
    ]
    effect = "Allow"
    resources = [
      "*"
    ]
    sid = "Karpenter"
  }

  statement {
    actions = [
      "ec2:TerminateInstances"
    ]
    condition {
      test     = "StringLike"
      variable = "ec2:ResourceTag/karpenter.sh/provisioner-name"
      values = [
        "*"
      ]
    }
    effect = "Allow"
    resources = [
      "*"
    ]
    sid = "ConditionalEC2Termination"
  }

  statement {
    actions = [
      "iam:PassRole"
    ]
    effect = "Allow"
    resources = [
      module.eks_managed_node_group.iam_role_arn
    ]
    sid = "PassNodeIAMRole"
  }

  statement {
    actions = [
      "eks:DescribeCluster"
    ]
    effect = "Allow"
    resources = [
      module.eks.cluster_arn
    ]
    sid = "EKSClusterEndpointLookup"
  }
}
```

> - https://karpenter.sh/docs/getting-started/migrating-from-cas/#create-iam-roles

<br>
