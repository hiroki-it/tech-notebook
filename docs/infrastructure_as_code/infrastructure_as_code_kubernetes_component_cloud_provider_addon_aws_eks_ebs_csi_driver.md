---
title: 【IT技術の知見】AWS EBS CSIドライバー＠AWS EKSアドオン
description: AWS EBS CSIドライバー＠AWS EKSアドオンの知見を記録しています。
---

# AWS EBS CSIドライバー＠AWS EKSアドオン

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

```bash
$ helm repo add <リポジトリ名> https://kubernetes-sigs.github.io/aws-ebs-csi-driver

$ helm repo update

$ helm install <リリース名> <リポジトリ名>/aws-ebs-csi-driver -n kube-system --version=<バージョンタグ>
```

> ↪️ 参考：
>
> - https://github.com/kubernetes-sigs/aws-ebs-csi-driver/tree/master/charts/aws-ebs-csi-driver
> - https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/install.md#helm
> - https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

## 03. プロビジョニング

### 静的プロビジョニング

#### ▼ AWS EBS

AWS EBSを手動で作成する。

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
    driver: ebs.csi.aws.com
    # 手動で作成したAWS EBSのIDを設定する。
    volumeHandle: vol-*****
```

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

#### ▼ PersistentVolumeClaim

PersistentVolumeClaimでPersistentVolumeを指定する。

これにより、PodでPersistentVolumeClaimを指定すると、PersistentVolumeとそれに紐づくAWS EBSが自動的に作成される。

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
          command: [sh, -c, "sleep 10000"]
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

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

<br>

### 動的プロビジョニング

#### ▼ AWS EBS

AWS EBSは自動で作成されるため、作成不要である。

#### ▼ StorageClass

要求するAWS EBSのタイプをStorageClassで指定する。

**＊実装例＊**

```yaml
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: foo-storage-class
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp2
```

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#ebs-csi%E3%83%89%E3%83%A9%E3%82%A4%E3%83%90%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB

#### ▼ PersistentVolumeClaim

PersistentVolumeClaimでStorageClassを指定する。

これにより、PodでPersistentVolumeClaimを指定すると、PersistentVolumeとそれに紐づくAWS EBSが自動的に作成される。

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
          command: [sh, -c, "sleep 10000"]
          volumeMounts:
            - mountPath: /app/data
              name: data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: foo-persistent-volume-claim
```

> ↪️ 参考：https://developer.mamezou-tech.com/containers/k8s/tutorial/storage/ebs/#%E5%8B%95%E7%9A%84%E3%83%97%E3%83%AD%E3%83%93%E3%82%B8%E3%83%A7%E3%83%8B%E3%83%B3%E3%82%B0

<br>
