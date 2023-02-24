---
title: 【IT技術の知見】AWS EBS CSIドライバー＠ドライバー
description: AWS EBS CSIドライバー＠ドライバーの知見を記録しています。
---

# AWS EBS CSIドライバー＠ドライバー

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EBS CSIドライバー

PersistentVolumeにAWS EBSを紐づけ、PodがAWS EBSをPersistentVolumeとして使用できるようにする。

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

> ↪️ 参考：https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

<br>

## 02. セットアップ

### EKSアドオンとして

#### ▼ Terraformの公式モジュールの場合

Terraformの公式モジュールを使用する。

Terraformの`aws_eks_addon`でEKSアドオンをインストールし、EBS CSIドライバーに関するKubernetesリソースを作成する。

```terraform
# AWS EKSアドオンをインストールする。
resource "aws_eks_addon" "aws_ebs_csi_driver" {

  cluster_name             = data.aws_eks_cluster.cluster.name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "v1.10.0"
  service_account_role_arn = module.iam_assumable_role_ebs_csi_driver[0].iam_role_arn
  resolve_conflicts        = "OVERWRITE"
}
```

> ↪️ 参考：
>
> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_addon#example-usage
> - https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/managing-ebs-csi.html

```terraform
module "iam_assumable_role_ebs_csi_driver_with_oidc" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version                       = "<モジュールのバージョン>"

  # EBS CSIコントローラーのPodに紐づけるIAMロール
  create_role                   = true
  role_name                     = "foo-ebs-csi-driver"

  # EKSのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # IAMロールに紐づけるIAMポリシー
  role_policy_arns              = ["arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"]

  # EBS CSIコントローラーのPodのサービスアカウント名
  oidc_fully_qualified_subjects = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
}
```

> ↪️ 参考：https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/latest#usage

また、StorageClassを定義する必要があるが、これはTerraformでもマニフェストでもどちらでもよい。

```terraform
# KubernetesのStorageClassをTerraformで作成する。
# マニフェストとして定義しても良い。
resource "kubernetes_storage_class" "gp3_encrypted" {

  metadata {
    name = "gp3-encrypted"
    annotations = {
      "storageclass.kubernetes.io/is-default-class" = "true"
    }
  }

  storage_provisioner = "ebs.csi.aws.com"

  parameters = {
    encrypted = "true"
    fsType    = "ext4"
    type      = "gp3"
  }

  reclaim_policy      = "Delete"
  volume_binding_mode = "WaitForFirstConsumer"
}
```

> ↪️ 参考：
>
> - https://kubernetes.io/ja/docs/concepts/storage/storage-classes/
> - https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/storage_class#example-usage

#### ▼ Helmの場合

記入中...

> ↪️ 参考：https://github.com/kubernetes-sigs/aws-ebs-csi-driver/tree/master/charts/aws-ebs-csi-driver

<br>
