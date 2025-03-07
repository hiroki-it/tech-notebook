---
title: 【IT技術の知見】Karpenter＠ハードウェアリソース管理系
description: Karpenter＠ハードウェアリソース管理系の知見を記録しています。
---

# Karpenter＠ハードウェアリソース管理系

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Karpenterの仕組み

### アーキテクチャ

Karpenterは、Karpenter Controllerから構成される。

![karpenter_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_architecture.png)

> - https://karpenter.sh/preview/reference/threat-model/#karpenter-controller

<br>

### Karpenter Controller

#### ▼ Karpenter Controllerとは

Karpenter Controllerは、KarpenterのCustom Controllerとして、カスタムリソースを作成/変更する。

また、カスタムリソースの設定値に応じて、API (例：起動テンプレート、AWS EC2フリート) をコールし、AWSリソース (例：起動テンプレート、AWS EC2) をプロビジョニングする。

この時、AWS Load Balancer Controllerも使用していると、Clusterのサブネット内にAWS EC2 Nodeが増えたことを検知し、ターゲットグループにこれを登録してくれる。

なお、NodePool配下のAWS EC2 Nodeは起動テンプレートから作成するが、起動テンプレート自体はAWS EC2 Nodeの作成後に削除するようになっている。

![karpenter_controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_controller.png)

> - https://karpenter.sh/preview/reference/threat-model/#architecture--actors
> - https://github.com/aws/karpenter-provider-aws/issues/1381#issuecomment-1046299921

#### ▼ Podのバインド

Karpenterは、新しいNodeにPodをバインドし、kube-schedulerがNodeにPodをスケジューリングさせることを待つ。

kube-schedulerの代わりに、KarpenterがNodeを選定しているため、Podのスケジューリングが早い。

一方で、cluster-autoscalerであれば、Podをバインドしない。

cluster-autoscalerのNodeのスケールアウト後に、kube-schedulerがNode選定処理に基づいてPodをNodeにバインドするため、スケジューリングまでに時間がかかる。

> - https://karpenter.sh/preview/reference/threat-model/
> - https://sreake.com/blog/learn-about-karpenter/
> - https://blog.searce.com/karpenter-a-new-method-to-autoscale-kubernetes-cluster-5f6411914372
> - https://kubesandclouds.com/2022-01-04-karpenter/

<br>

### disruption-controller

Karpenterは、Nodeで特定のイベントを検知すると、これが実際に起こる前にNodeを自身で中断する。

- Nodeのスポット中断警告イベント
- Nodeのヘルスステータス
- Nodeのインスタンス終了イベント
- Nodeのインスタンス停止イベント

> - https://karpenter.sh/docs/concepts/disruption/#interruption
> - https://d1.awsstatic.com/events/Summits/reinvent2023/CON331_Harness-the-power-of-Karpenter-to-scale-optimize-and-upgrade-Kubernetes.pdf#page=42
> - https://medium.com/@gajaoncloud/karpeneters-drift-detection-maintaining-consistency-in-your-kubernetes-cluster-cabe2a34bb49

<br>

### termination-controller

AWS EC2ワーカーNodeの削除命令を検知し、AWS EC2ワーカーNodeのGraceful Shutdownから削除までを行う。

AWS EC2ワーカーNodeは、デフォルトではNodeのGraceful Shutdownを実施しない。

そのため、`kubelet-config.json`ファイル (KubeletConfiguration)の`--shutdown-grace-period`オプションを使用する必要がある。

一方で、Karpenterを使用すると、termination-controllerがGraceful Shutdownを実施してくれる。

> - https://karpenter.sh/docs/concepts/disruption/#termination-controller

<br>

## 02. スケーリング

### スケーリングの仕組み

Karpenterは、起動テンプレートを作成した上でAWS EC2フリートAPIをコールし、AWS EC2 Nodeをスケールアウト/スケールアップする。

また反対に、AWS EC2 Nodeをスケールイン/スケールダウンする。

Karpenterはバージョニングされてない独立した起動テンプレートを作成する。

そのため、残骸として残らないように、その都度起動テンプレートを削除する。

```bash
...

2023-11-30T08:28:56.735Z	INFO	controller.provisioner	found provisionable pod(s)	{...}
2023-11-30T08:28:56.735Z	INFO	controller.provisioner	computed new nodeclaim(s) to fit pod(s)	{...}
2023-11-30T08:28:56.748Z	INFO	controller.provisioner	created nodeclaim	{...}

# 起動テンプレート作成
2023-11-30T08:28:56.957Z	DEBUG	controller.nodeclaim.lifecycle	created launch template	{...}
2023-11-30T08:28:57.121Z	DEBUG	controller.nodeclaim.lifecycle	created launch template	{...}
2023-11-30T08:28:57.297Z	DEBUG	controller.nodeclaim.lifecycle	created launch template	{...}

# AWS EC2 Node作成
2023-11-30T08:28:59.211Z	INFO	controller.nodeclaim.lifecycle	launched nodeclaim	{...}
2023-11-30T08:29:14.009Z	DEBUG	controller.disruption	discovered subnets	{...}
2023-11-30T08:29:33.910Z	DEBUG	controller.nodeclaim.lifecycle	registered nodeclaim	{...}
2023-11-30T08:29:46.264Z	INFO	controller.nodeclaim.lifecycle	initialized nodeclaim	{...}
2023-11-30T08:30:15.505Z	DEBUG	controller.disruption	discovered subnets	{...}

# 起動テンプレート削除
2023-11-30T08:32:58.872Z	DEBUG	controller	deleted launch template	{...}
2023-11-30T08:32:59.027Z	DEBUG	controller	deleted launch template	{...}
2023-11-30T08:32:59.299Z	DEBUG	controller	deleted launch template	{...}

...
```

> - https://github.com/aws/karpenter/pull/1278

そのため、Nodeグループは不要 (グループレス) であり、Karpenterで指定した条件のNodeをまとめてスケーリングできる。

Karpenterを使用しない場合、クラウドプロバイダーのNode数は固定である。

> - https://aws.github.io/aws-eks-best-practices/karpenter/#use-karpenter-for-workloads-with-changing-capacity-needs
> - https://aws.amazon.com/blogs/containers/managing-pod-scheduling-constraints-and-groupless-node-upgrades-with-karpenter-in-amazon-eks/
> - https://vishnudeva.medium.com/scaling-kubernetes-with-karpenter-1dc785e79010

<br>

### スケーリングパラメーター

#### ▼ スケーリングパラメーターとは

Karpenterは、さまざまな情報に基づいて、Nodeをスケーリングするか否かを決定する。

鳥の群れの動きをモデリングしたBoidsアルゴリズムに似たような方法で、スケーリング対象のNodeを選定する。

> - https://github.com/aws/karpenter-provider-aws/blob/main/designs/consolidation.md#selecting-nodes-for-consolidation
> - https://tech-blog.cloud-config.jp/2022-04-07-boids-algorithm

#### ▼ Podのスケジューリングの可否

kube-schedulerから情報を取得し、新しいPodをNode上にスケジューリングできない状態 (`Pending`状態) を検知し、Nodeのスケジューリングを検討する。

新しいPodをスケジューリングできなくなる理由としては、Nodeの上限数超過やハードウェアリソース不足がある。

> - https://karpenter.sh/docs/concepts/#scheduling
> - https://karpenter.sh/docs/concepts/provisioners/#max-pods

#### ▼ コスト

より低コストになるようにAWS EC2 Nodeを統合する。

以下のような条件の場合に、統合を発動する。

- AWS EC2 NodeにPodがおらず、これを削除できる
- Podが特定のAWS EC2 Nodeに偏っており、Podが少ないNodeから多いNodeに再スケジューリングさせても、Podを問題なく動かせる。
- 現在のインスタンスタイプより低いインスタンスタイプにしても、問題なくPodを動かせる。

反対に、以下のような条件の場合には統合しない。

- Controllerが不明なPodがいる
- Podの退避を拒否するPodDisruptionBudget (例：`disruptionsAllowed=0`) があり、統合を実行してしまうとPodDisruptionBudgetに違反する。
- Podの`metadata.annotations`キー配下に`karpenter.sh/do-not-evict`キーがある。
- PodにAffinityがあり、統合を実行してしまうとAffinityに違反する。

> - https://karpenter.sh/preview/concepts/disruption/#automated-methods
> - https://github.com/aws/karpenter-provider-aws/blob/main/designs/consolidation.md#selecting-nodes-for-consolidation

<br>

### 削除対象のNode選定

#### ▼ Finalizer

Nodeの削除はKarpenterが管理する。

Karpenter外から削除操作 (例：`kubectl delete`コマンド) があったとして、Karpenterがこれを検知し、Nodeを削除する。

> - https://karpenter.sh/docs/concepts/#disrupting-nodes

#### ▼ Expiration

記入中...

> - https://karpenter.sh/docs/concepts/#disrupting-nodes

#### ▼ Consolidation

記入中...

> - https://karpenter.sh/docs/concepts/#disrupting-nodes

#### ▼ Drift

記入中...

> - https://karpenter.sh/docs/concepts/#disrupting-nodes

#### ▼ Interruption

記入中...

> - https://karpenter.sh/docs/concepts/#disrupting-nodes

<br>

### AWSリソースとの連携

#### ▼ 起動テンプレート

KarpenterのKarpenter Controllerは、起動テンプレートを作成した上で、AWS EC2フリートAPIからAWS EC2 Nodeを作成する。

執筆時点 (2023/11/04) 時点では、Karpenter Controllerは自身以外 (例：Terraformなど) で作成した起動テンプレートを参照できない。

不都合があって廃止した経緯がある。

> - https://github.com/aws/karpenter/blob/main/designs/unmanaged-launch-template-removal.md
> - https://github.com/aws/karpenter/issues/3369#issuecomment-1460174547

#### ▼ AWS EC2フリート

> - https://qiita.com/o2346/items/6277a7ff6b1826d8de11

#### ▼ マネージドNodeグループ (有無に関係ない)

Karpenterは、マネージドNodeグループの有無に関係なく、Nodeをスケーリングできる。

マネージドNodeグループは静的キャパシティであり、KarpenterはマネージドNodeグループ配下のAWS EC2のAWS EC2フリートAPIを動的にコールする。

ただし、マネージドNodeグループで管理するNodeをKarpenterに置き換えるために、マネージドNodeグループ管理下のNodeを意図的にスケールインさせ、KarpenterにNodeをプロビジョニングさせる必要がある。

> - https://karpenter.sh/docs/faq/#how-does-karpenter-interact-with-aws-node-group-features
> - https://karpenter.sh/preview/getting-started/migrating-from-cas/#remove-cas

<br>

### Karpenterとcluster-autoscaler

#### ▼ Karpenterのいいところ

AWSの場合のみ、cluster-autoscalerの代わりにKarpenterを使用できる。

Karpenterでは、作成されるNodeのスペックを事前に指定する必要がなく、またリソース効率も良い。

そのため、必要なスペックの上限がわかっている場合はもちろん、上限を決めきれないような要件 (例：負荷が激しく変化するようなシステム) でも合っている。

![karpenter_vs_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> - https://www.linkedin.com/pulse/karpenter-%D1%83%D0%BC%D0%BD%D0%BE%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-kubernetes-%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B0-victor-vedmich/?originalSubdomain=ru

#### ▼ cluster-autoscalerのいいところ

cluster-autoscalerはクラウドプロバイダーによらずに使用できるが、Karpenterは執筆時点 (2023/02/26) では、AWS上でしか使用できない。

そのため、クラウドプロバイダーのオートスケーリング (例：AWS EC2 Auto Scalingグループ) に関するAPIをコールすることになり、その機能がオートスケーリングに関するAPIに依存する。

一方でKarpenterは、AWS EC2のグループ (例：AWS EC2フリート) に関するAPIをコールする。

そのため、より柔軟なNode数にスケーリングでき、マネージドNodeグループを介さない分Nodeの起動が早い。

![karpenter_vs_cluster-autoscaler](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/karpenter_vs_cluster-autoscaler.png)

> - https://awstip.com/this-code-works-autoscaling-an-amazon-eks-cluster-with-karpenter-part-1-3-40c7bed26cfd
> - https://www.linkedin.com/pulse/karpenter-%D1%83%D0%BC%D0%BD%D0%BE%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-kubernetes-%D0%BA%D0%BB%D0%B0%D1%81%D1%82%D0%B5%D1%80%D0%B0-victor-vedmich/?originalSubdomain=ru
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-fleet.html

<br>

### 垂直/水平スケーリング

#### ▼ 対応するスケーリング

Karpenterは、現在のハードウェアリソースの使用量に応じて、Nodeを垂直/水平スケーリングする。

なお、Karpeneterでは垂直スケーリングを代わりに『deprovisioning』という。

> - https://github.com/aws/karpenter/issues/1226

#### ▼ スケールアウト/スケールアップの場合

例えば、以下のような仕組みで、Nodeの垂直/水平スケーリングのスケールアウト/スケールアップを実行する。

Karpenterは、スケジューリングできないPod (`Pending`状態) が出現すると、スケールアウト/スケールアップを検討する。

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

#### ▼ スケールイン/スケールダウンの場合

Expiration、Drift、Consolidationの順にNodeを検証し、削除可能なNodeを選ぶ。

> - https://karpenter.sh/preview/concepts/disruption/
> - https://karpenter.sh/preview/concepts/disruption/#automated-methods

<br>

### マルチAZ

Karpenterでは、Nodeを作成するAZを設定できない。

代わりに、PodのAZ指定を尊重し、Podのスケジューリング先のAZに合わせてNodeを作成する。

> - https://karpenter.sh/docs/concepts/scheduling/#topology-spread

<br>

## 03. セットアップ

### AWS側

#### ▼ Terraformの公式モジュール (1) の場合

`terraform-aws-modules/iam/.../iam-assumable-role-with-oidc`を使用する。

Kapenterのセットアップのうち、AWS側で必要なものをまとめる。

ここでは、Terraformの公式モジュールを使用する。

コマンド (例：`eksctl`コマンド) を使用しても良い。

```terraform
module "iam_assumable_role_with_oidc_karpenter_controller" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<バージョン>"

  # Karpenter ControllerのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-karpenter-controller"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = aws_iam_policy.karpenter_controller.arn

  # Karpenter ControllerのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:karpenter:karpenter"
  ]
}

resource "aws_iam_policy" "karpenter_controller" {
  name   = "foo-karpenter-controller-policy"
  policy = data.aws_iam_policy_document.karpenter_controller_policy.json
}

# Karpenter Controllerが操作できるAWS EC2 Nodeを最小限にするために、特定のタグのみを持つAWS EC2を指定できるようにする
# EC2NodeClassでユーザー定義のタグを設定し、Karpenter ControllerがAWS EC2を操作できるようにしておく
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
    # 特定のタグを持つAWS EC2しか指定できない
    condition {
      test     = "StringEquals"
      # KarpenterのEC2NodeClassで挿入したAWS EC2のタグを指定する
      variable = "ec2:ResourceTag/karpenter.sh/discovery"
      # 起動テンプレートからAWS EC2 Nodeを作成する
      values = [
        "${module.eks.cluster_name}-karpenter"
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
    # 特定のタグを持つAWS EC2しか指定できない
    condition {
      test     = "StringEquals"
      # KarpenterのEC2NodeClassで挿入したAWS EC2のタグを指定する
      variable = "ec2:ResourceTag/karpenter.sh/discovery"
      values = [
        "${module.eks.cluster_name}-karpenter"
      ]
    }
    effect = "Allow"
    # 起動テンプレートからAWS EC2 Nodeを作成する
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

#### ▼ Terraformの公式モジュール (2) の場合

`terraform-aws-modules/eks/.../karpenter`を使用する。

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

  # Karpenter ControllerのPodのServiceAccount名
  # ServiceAccountは、Terraformではなく、マニフェストで定義した方が良い
  irsa_namespace_service_accounts = [
    "karpenter:karpenter"
  ]

  # 特定のタグを持つAWS EC2しか指定できない
  irsa_tag_key = "karpenter.sh/discovery"

  irsa_tag_values = [
    "${module.eks.cluster_name}-karpenter"
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

## 04. トラブルシューティング

### メモリをGuaranteed QoSにする

Podの特に`resources`キーで、上限 (`.spec.containers[*].resources.limits`) が設定されていないと、使用量がバーストする。

その場合、Karpenterの作成したNodeのメモリ量を超え、NodeのSystemOOMイベントによって他のPodが終了してしまう。

Podのメモリで上限 (`.spec.containers[*].resources.limits`) = 下限 (`.spec.containers[*].resources.requests`) のように設定する (Guaranteed QoS) と、OOMキラーを避けられる。

> - https://docs.aws.amazon.com/eks/latest/best-practices/karpenter.html

### スポットインスタンスの場合はインスタンスタイプを幅広く設定する

スポットインスタンスの仕組みで選ばれたインスタンスタイプが補充されていない場合、KarpenterはNodeをプロビジョニングできない。

インスタンスタイプが補充されるまでNodeのプロビジョニングは待機となり、PodはPending状態のままになる可能性がある。

これを回避するために、インスタンスタイプを幅広く設定するとよい。

> - https://docs.aws.amazon.com/eks/latest/best-practices/karpenter.html

<br>
