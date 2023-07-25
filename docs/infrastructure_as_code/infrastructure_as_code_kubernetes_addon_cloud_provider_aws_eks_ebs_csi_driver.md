---
title: 【IT技術の知見】AWS EBS CSIドライバー＠AWS EKSアドオン
description: AWS EBS CSIドライバー＠AWS EKSアドオンの知見を記録しています。
---

# AWS EBS CSIドライバー＠AWS EKSアドオン

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. AWS EBS CSIドライバー

### アーキテクチャ

PersistentVolumeにAWS EBSを紐付け、PodがAWS EBSをPersistentVolumeとして使用できるようにする。

ステートレスなアプリケーションでは、AWS EBSにデータを永続化する必要はないため、AWS EBS CSIドライバーは不要である。

![storage_class.png](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/storage_class.png)

> - https://www.netone.co.jp/knowledge-center/netone-blog/20191206-1/

<br>

## 02. セットアップ

### EKSアドオンとして

#### ▼ Terraformの場合

Terraformを使用する。

Terraformの`aws_eks_addon`でEKSアドオンをインストールし、AWS EBS CSIドライバーに関するKubernetesリソースを作成する。

```terraform
# AWS EKSアドオンをインストールする。
resource "aws_eks_addon" "aws_ebs_csi_driver" {

  cluster_name             = data.aws_eks_cluster.cluster.name
  addon_name               = "aws-ebs-csi-driver"
  addon_version            = "<バージョン>"
  service_account_role_arn = module.iam_assumable_role_ebs_csi_driver[0].iam_role_arn
  resolve_conflicts        = "OVERWRITE"
}
```

> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eks_addon#example-usage
> - https://docs.aws.amazon.com/eks/latest/userguide/managing-ebs-csi.html

```terraform
module "iam_assumable_role_with_oidc_ebs_csi_driver" {

  source                        = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"

  version                       = "<モジュールのバージョン>"

  # AWS EBS CSIコントローラーのPodに紐付けるIAMロール
  create_role                   = true
  role_name                     = "foo-ebs-csi-driver"

  # AWS EKS ClusterのOIDCプロバイダーURLからhttpsプロトコルを除いたもの
  # ArgoCDは、デプロイ専用のAWS EKS Cluster上で稼働している
  provider_url                  = replace(module.eks.cluster_oidc_issuer_url, "https://", "")

  # AWS IAMロールに紐付けるIAMポリシー
  role_policy_arns              = [
    "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
  ]

  # AWS EBS CSIコントローラーのPodのServiceAccount名
  # Terraformではなく、マニフェストで定義した方が良い
  oidc_fully_qualified_subjects = [
    "system:serviceaccount:kube-system:foo-ebs-csi-controller"
  ]
}
```

> - https://registry.terraform.io/modules/terraform-aws-modules/iam/aws/latest#usage

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

  # AWS EBS CSIドライバーをプロビジョナーに設定する
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

> - https://kubernetes.io/docs/concepts/storage/storage-classes/
> - https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/storage_class#example-usage

別途、AWS EBS CSIドライバーのPodに紐付けるServiceAccountを作成し、IAMロールのARNを設定する。

ServiceAccountは、Terraformではなくマニフェストで定義した方が良い。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: <IAMロールのARN>
  name: foo-ebs-csi-controller
  namespace: kube-system
```

IRSAにより、ServiceAccountを介してPodとAWS IAMロールが紐づく。

#### ▼ Helmの場合

Helmを使用する。

KubernetesよりもAWSに依存している要素が多いため、Terraformによるセットアップの方が個人的にはおすすめである。

```bash
$ helm repo add <リポジトリ名> https://kubernetes-sigs.github.io/aws-ebs-csi-driver

$ helm repo update

$ helm install <リリース名> <リポジトリ名>/aws-ebs-csi-driver -n kube-system --version=<バージョンタグ>
```

> - https://github.com/kubernetes-sigs/aws-ebs-csi-driver/tree/master/charts/aws-ebs-csi-driver
> - https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/install.md#helm
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

## 02-02. マニフェスト

### マニフェストの種類

AWS EBS CSIドライバーは、Deployment (ebs-csi-controller) 、ServiceAccount、などのマニフェストから構成される。

<br>

### Deployment配下のPod

記入中...

<br>

### ServiceAccount

IRSAの仕組みで、PodとIAMロールを紐付ける。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: foo-foo-ebs-csi-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<アカウントID>:role/foo-ebs-csi-controller-role
secrets:
  - name: foo-ebs-csi-controller-token
```

<br>

## 03. プロビジョニング

### 静的プロビジョニング

#### ▼ AWS EBS

AWS EBSを手動で作成する必要がある。

#### ▼ PersistentVolume

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: foo-persistent-volume
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  csi:
    # AWS EBS CSIドライバーをプロビジョナーに設定する
    driver: ebs.csi.aws.com
    # 手動で作成したAWS EBSのIDを設定する。
    volumeHandle: vol-*****
```

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

#### ▼ PersistentVolumeClaim

PersistentVolumeClaimでVolumeを要求する。

PersistentVolumeClaimでVolumeを要求すると、AWS EBS CSIドライバーは、PersistentVolumeとそれに紐づくAWS EBSを自動的に作成する。

Podの`.spec.nodeSelector`も不要である。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  # デフォルトの動的プロビジョニングを確実に無効化する
  storageClassName: ""
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: foo
  template:
    metadata:
      labels:
        app: foo
    spec:
      containers:
        - name: foo
          image: busybox
          command:
            - /bin/bash
            - -c
            - sleep 10000
          volumeMounts:
            - mountPath: /app/data
              name: data
      nodeSelector:
        topology.ebs.csi.aws.com/zone: ap-northeast-1a
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: foo-persistent-volume-claim
```

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

### 動的プロビジョニング

#### ▼ AWS EBS

AWS EBSは、AWS EBS CSIドライバーが自動で作成するため、作成は不要である。

#### ▼ StorageClass

動的プロビジョニングの場合、StorageClassが必要である。

要求するAWS EBSのタイプをStorageClassで指定する。

`reclaimPolicy`が`Delete`になっているPersistentVolumeClaimを削除すれば、StorageClassがEBSもよしなに削除してくれる。

**＊実装例＊**

マニフェストまたはTerraformで定義する。

```yaml
# マニフェストで定義した場合
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: foo-storage-class
parameters:
  type: gp3
provisioner: ebs.csi.aws.com
# PersistentVolumeClaimが削除された時に、AWS EBSも自動的に削除できるようにする
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

```terraform
# Terraformで定義した場合
resource "kubernetes_storage_class" "gp3_encrypted" {

  metadata {
    name = "foo-storage-class"
  }

  # AWS EBS CSIドライバーをプロビジョナーに設定する
  storage_provisioner = "ebs.csi.aws.com"

  parameters = {
    encrypted = "true"
    fsType    = "ext4"
    type      = "gp3"
  }

  volume_binding_mode = "WaitForFirstConsumer"
}
```

> - https://github.com/kubernetes-sigs/aws-ebs-csi-driver/issues/1071
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

#### ▼ PersistentVolumeClaim

PersistentVolumeClaimでStorageClassを指定し、外部サービスが提供するVolumeを要求する。

StorageClassが指定されたPersistentVolumeClaimでVolumeを要求すると、AWS EBS CSIドライバーは、PersistentVolumeとそれに紐づくAWS EBSを自動的に作成する。

Podの`.spec.nodeSelector`も不要である。

**＊実装例＊**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: foo-persistent-volume-claim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  # AWS EBS CSIドライバーがプロビジョナーに指定されたStorageClassを要求する
  storageClassName: foo-storage-class
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo
spec:
  replicas: 2
  selector:
    matchLabels:
      app: foo
  template:
    metadata:
      labels:
        app: foo
    spec:
      containers:
        - name: foo
          image: busybox
          command:
            - /bin/bash
            - -c
            - sleep 10000
          volumeMounts:
            - mountPath: /app/data
              name: data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: foo-persistent-volume-claim
```

> - https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0

<br>
