---
title: 【IT技術の知見】Karpenter＠ハードウェアリソース管理
description: Karpenter＠ハードウェアリソース管理の知見を記録しています。
---

# Karpenter＠ハードウェアリソース管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Karpenterの仕組み

### アーキテクチャ

Karpenterは、karpenterコントローラーから構成される。

![karpenter_architecture.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_architecture.png)

> - https://karpenter.sh/preview/reference/threat-model/#karpenter-controller

<br>

### karpenterコントローラー

karpenterコントローラーは、Karpenterのカスタムコントローラーとして、カスタムリソースを作成/変更する。

また、カスタムリソースの設定値に応じて、API (例：起動テンプレート、EC2フリート) をコールし、AWSリソース (例：起動テンプレート、EC2) をプロビジョニングする。

![karpenter_controller.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_controller.png)

> - https://karpenter.sh/preview/reference/threat-model/#architecture--actors

<br>

## 02. スケーリング

### スケーリングの仕組み

Karpenterは、起動テンプレートを作成した上でAWS EC2フリートのAPIをコールし、Nodeの自動水平スケーリングを実行する。

そのため、Nodeグループは不要 (グループレス) であり、Karpenterで指定した条件のNodeをまとめてスケーリングできる。

Karpenterを使用しない場合、クラウドプロバイダーのNode数は固定である。

> - https://aws.github.io/aws-eks-best-practices/karpenter/#use-karpenter-for-workloads-with-changing-capacity-needs
> - https://aws.amazon.com/blogs/containers/managing-pod-scheduling-constraints-and-groupless-node-upgrades-with-karpenter-in-amazon-eks/
> - https://vishnudeva.medium.com/scaling-kubernetes-with-karpenter-1dc785e79010

<br>

### スケーリングパラメーター

#### ▼ Pod上限数

Karpenterは、インスタンスタイプのPod上限数をスケーリングのパラメーターとする。

> - https://karpenter.sh/docs/concepts/provisioners/#max-pods

#### ▼ コスト

記入中...

#### ▼ ハードウェアリソース消費量

記入中...

<br>

### AWSリソースとの連携

#### ▼ 起動テンプレート

Karpenterのkarpenterコントローラーは、起動テンプレートを作成し、管理する。

執筆時点 (2023/11/04) 時点では、karpenterコントローラーは自身以外 (例：Terraform、など) で作成した起動テンプレートを参照できない。

不都合があって廃止した経緯がある。

> - https://github.com/aws/karpenter/blob/main/designs/unmanaged-launch-template-removal.md
> - https://github.com/aws/karpenter/issues/3369#issuecomment-1460174547

#### ▼ EC2フリート

> - https://qiita.com/o2346/items/6277a7ff6b1826d8de11

#### ▼ マネージドNodeグループ (有無に関係ない)

Karpenterは、マネージドNodeグループの有無に関係なく、Nodeをスケーリングできる。

マネージドNodeグループは静的キャパシティであり、KarpenterはマネージドNodeグループ配下のEC2のEC2フリートを動的にコールする。

ただし、マネージドNodeグループで管理するNodeをKarpenterに置き換えるために、意図的にスケールインさせ、KarpenterにNodeをプロビジョニングさせる必要がある。

> - https://karpenter.sh/docs/faq/#how-does-karpenter-interact-with-aws-node-group-features
> - https://karpenter.sh/preview/getting-started/migrating-from-cas/#remove-cas

<br>

### Karpenterとcluster-autoscaler

#### ▼ Karpenterのいいところ

AWSの場合のみ、cluster-autoscalerの代わりにKarpenterを使用できる。

Karpenterでは、作成されるNodeのスペックを事前に指定する必要がなく、またリソース効率も良い。

そのため、必要なスペックの上限がわかっている場合はもちろん、上限を決めきれないような要件 (例：負荷が激しく変化するようなシステム) でも合っている。

![karpenter_vs_cluster-autoscaler.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

#### ▼ cluster-autoscalerのいいところ

cluster-autoscalerはクラウドプロバイダーによらずに使用できるが、Karpenterは執筆時点 (2023/02/26) では、AWS上でしか使用できない。

そのため、クラウドプロバイダーの自動スケーリング (例：AWS EC2AutoScaling) に関するAPIをコールすることになり、その機能が自動スケーリングに関するAPIに依存する。

一方でKarpenterは、EC2のグループ (例：AWS EC2フリート) に関するAPIをコールするため、より柔軟なNode数にスケーリングできる。

![karpenter_vs_cluster-autoscaler.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> - https://awstip.com/this-code-works-autoscaling-an-amazon-eks-cluster-with-karpenter-part-1-3-40c7bed26cfd
> - https://www.linkedin.com/pulse/karpenter-%D1%83%D0%BC%D0%BD%D0%BE%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-kubernetes-%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B0-victor-vedmich/?originalSubdomain=ru
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-fleet.html

<br>

### 水平/垂直スケーリング

#### ▼ 対応するスケーリング

Karpenterは、現在のハードウェアリソースの使用量に応じて、Nodeを水平/垂直スケーリングする。

なお、Karpeneterでは垂直スケーリングを代わりに『deprovisioning』という。

> - https://github.com/aws/karpenter/issues/1226

#### ▼ スケールアウトの場合

例えば、以下のような仕組みで、Nodeの水平/垂直スケーリングのスケールアウトを実行する。

Karpenterは、スケジューリングできない保留中Podが出現して始めて、スケールアウトを検討する。

`(1)`

: Podが、Nodeの`70`%にあたるハードウェアリソースを要求する。

     しかし、Nodeが`1`台では足りない。`70 + 70 = 140%`になるため、既存のNodeの少なくとも`1.4`倍のスペックが必要となる。

`(2)`

: 新しく決定したスペックで、Nodeを新しく作成する。

`(3)`

: 新しく作成したNodeにPodをスケジューリングさせる。また、既存のNodeが不要であれば削除する。

`(4)`

: 結果として、`1`台で`2`個のPodをスケジューリングさせている。

> - https://developer.mamezou-tech.com/blogs/2022/02/13/introduce-karpenter/#%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%AB%E3%82%A2%E3%82%A6%E3%83%88
> - https://github.com/aws/karpenter/issues/3995#issuecomment-1577137382

#### ▼ スケールインの場合

Expiration、Drift、Consolidation、の順にNodeを検証し、削除可能なNodeを選ぶ。

> - https://karpenter.sh/preview/concepts/disruption/
> - https://karpenter.sh/preview/concepts/disruption/#automated-methods

<br>

## 03. セットアップ

### AWS側

#### ▼ Terraformの公式モジュール (`terraform-aws-modules/iam-assumable-role-with-oidc`) の場合

Kapenterのセットアップのうち、AWS側で必要なものをまとめる。

ここでは、Terraformの公式モジュールを使用する。

コマンド (例：`eksctl`コマンド) を使用しても良い。

```terraform
module "iam_assumable_role_with_oidc_karpenter_controller" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # karpenterコントローラーのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-karpenter-controller"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = aws_iam_policy.karpenter_controller.arn

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

# karpenterコントローラーが操作できるEC2 Nodeを最小限にするために、特定のリソースタグのみを持つ起動テンプレートを指定できるようにする
# EC2NodeClassでユーザー定義のリソースタグを設定し、karpenterコントローラーが起動テンプレートを操作できるようにしておく
data "aws_iam_policy_document" "karpenter_controller_policy" {

  statement {
    actions = [
      "pricing:GetProducts",
      "ec2:DescribeSubnets",
      "ec2:DescribeSpotPriceHistory",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeLaunchTemplates",
      "ec2:DescribeInstances",
      "ec2:DescribeInstanceTypes",
      "ec2:DescribeInstanceTypeOfferings",
      "ec2:DescribeImages",
      "ec2:DescribeAvailabilityZones",
      "ec2:CreateTags",
      "ec2:CreateLaunchTemplate",
      "ec2:CreateFleet"
    ]
    effect = "Allow"
    resources = [
      "*"
    ]
    sid = ""
  }

  statement {
    actions = [
      "ec2:TerminateInstances",
      "ec2:DeleteLaunchTemplate"
    ]
    # 特定のリソースタグを持つ起動テンプレートしか指定できない
    condition {
      test     = "StringEquals"
      # KarpenterのEC2NodeClassで挿入した起動テンプレートのリソースタグを指定する
      variable = "ec2:ResourceTag/karpenter.sh/discovery"
      values = [
        module.eks.cluster_name
      ]
    }
    effect = "Allow"
    resources = [
      "*"
    ]
    sid = ""
  }

  statement {
    actions = [
      "ec2:RunInstances"
    ]
    # 特定のリソースタグを持つ起動テンプレートしか指定できない
    condition {
      test     = "StringEquals"
      # KarpenterのEC2NodeClassで挿入した起動テンプレートのリソースタグを指定する
      variable = "ec2:ResourceTag/karpenter.sh/discovery"
      values = [
        module.eks.cluster_name
      ]
    }
    effect = "Allow"
    # 起動テンプレートを指定してEC2 Nodeを起動する
    resources = [
      "arn:aws:ec2:*:<アカウントID>:launch-template/*"
    ]
    sid = ""
  }

  statement {
    actions = [
      "ec2:RunInstances"
    ]
    effect = "Allow"
    resources = [
      "arn:aws:ec2:*::snapshot/*",
      "arn:aws:ec2:*::image/*",
      "arn:aws:ec2:*:<アカウントID>:volume/*",
      "arn:aws:ec2:*:<アカウントID>:subnet/*",
      "arn:aws:ec2:*:<アカウントID>:spot-instances-request/*",
      "arn:aws:ec2:*:<アカウントID>:security-group/*",
      "arn:aws:ec2:*:<アカウントID>:network-interface/*",
      "arn:aws:ec2:*:<アカウントID>:instance/*"
    ]
    sid = ""
  }

  statement {
    actions = [
      "ssm:GetParameter"
    ]
    effect = "Allow"
    resources = [
      "arn:aws:ssm:*:*:parameter/aws/service/*"
    ]
    sid = ""
  }

  statement {
    actions = [
      "iam:PassRole"
    ]
    effect = "Allow"
    resources = [
      module.eks_managed_node_group.iam_role_arn
    ]
    sid = ""
  }

  statement {
    actions = [
      "eks:DescribeCluster"
    ]
    effect = "Allow"
    resources = [
      module.eks.cluster_arn
    ]
    sid = ""
  }

  statement {
    actions = [
      "iam:TagInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
      "iam:GetInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:CreateInstanceProfile",
      "iam:AddRoleToInstanceProfile"
    ]
    effect = "Allow"
    resources = [
      "*"
    ]
    sid = ""
  }
}
```

> - https://karpenter.sh/docs/getting-started/migrating-from-cas/#create-iam-roles
> - https://github.com/aws/karpenter/pull/1332#issue-1135967441
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-launch-template-permissions.html#policy-example-launch-template-ex1
> - https://github.com/aws/karpenter/issues/1919#issue-1267832624

#### ▼ Terraformの公式モジュール (`terraform-aws-modules/karpenter`) の場合

```terraform
module "eks_iam_karpenter_controller" {
  source  = "terraform-aws-modules/eks/aws//modules/karpenter"
  version = "~> 19.18.0"

  cluster_name = module.eks.cluster_name

  create_iam_role = false

  create_instance_profile = false

  enable_karpenter_instance_profile_creation = true

  enable_spot_termination = false

  queue_managed_sse_enabled = false

  irsa_oidc_provider_arn = module.eks.oidc_provider_arn

  irsa_name = "foo-karpenter-controller"

  irsa_use_name_prefix = false

  # karpenterコントローラーのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  irsa_namespace_service_accounts = [
    "karpenter:karpenter"
  ]

  # 特定のリソースタグを持つ起動テンプレートしか指定できない
  irsa_tag_key = "karpenter.sh/discovery"

  irsa_tag_values = [
    module.eks.cluster_name
  ]

  iam_role_additional_policies = {
    AmazonSSMManagedInstanceCore = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  }

  iam_role_arn = module.eks_managed_node_group.worker_iam_role_arn
}
```

> - https://karpenter.sh/docs/getting-started/migrating-from-cas/#create-iam-roles
> - https://github.com/aws/karpenter/pull/1332#issue-1135967441
> - https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-launch-template-permissions.html#policy-example-launch-template-ex1
> - https://github.com/aws/karpenter/issues/1919#issue-1267832624

<br>
