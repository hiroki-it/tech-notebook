---
title: 【IT技術の知見】リソース定義＠Karpenter
description: リソース定義＠Karpenterの知見を記録しています。
---

# リソース定義＠Karpenter

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. EC2NodeClass

### EC2NodeClass

NodePool内の各Nodeの仕様を設定する。

<br>

### amiFamily

AWS AMIの種類を設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  # 最適化 Amazon Linux 2 を指定する
  amiFamily: AL2
```

<br>

### amiSelectorTerms

NodeのAMIを設定する。

設定しない場合、Karpenterは最適化AMIを自動的に選択する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  amiSelectorTerms:
    - tags:
        Name: ami-*****
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#specamiselectorterms
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

### securityGroupSelectorTerms

Nodeに紐づけるセキュリティグループを動的に検出するために、セキュリティグループのタグを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  securityGroupSelectorTerms:
    - tags:
        Name: foo-private-sg
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#specsecuritygroupselectorterms

<br>

### subnetSelectorTerms

Nodeをプロビジョニングするサブネットを動的に検出するために、サブネットのタグを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  subnetSelectorTerms:
    - tags:
        Name: foo-private-subnet
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#specsubnetselectorterms
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

### tags

全てのNodeやEBSボリュームに挿入するタグを設定する。

AWS IAMポリシーでは、ここで設定したタグに基づいて、操作の認可スコープを制御している。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  # デフォルトで挿入するタグ
  tags:
    Name: foo-node
    karpenter.sh/nodeclaim: foo-nodeclaim
    karpenter.sh/nodepool: foo-nodepool
    kubernetes.io/cluster/foo-cluster: owned
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#spectags
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

## 02. NodePool

### NodePoolとは

KapenterでプロビジョニングするNodeをグループ単位で設定する。

Nodeのグループ (例：AWS EKS Nodeグループ、Google Cloud Nodeプール、など) に合わせて、複数作成すると良い。

> - https://karpenter.sh/preview/concepts/nodepools/

<br>

### disruption

#### ▼ consolidationPolicy

コストを考慮するかどうかを設定する。

Nodeを削除できる状況では不要なNodeを削除し、また削除できない状況ではNodeのスペックをスケールインする。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  disruption:
    consolidationPolicy: WhenUnderutilized
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://ec2spotworkshops.com/karpenter/050_karpenter/consolidation.html

#### ▼ consolidateAfter

NodeからPodが全て退避した後にNodeを削除するまでの待機時間を設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  disruption:
    consolidateAfter: 30s
```

> - https://aws.amazon.com/jp/blogs/news/introducing-karpenter-an-open-source-high-performance-kubernetes-cluster-autoscaler/
> - https://ec2spotworkshops.com/karpenter/050_karpenter/consolidation.html

#### ▼ expireAfter

Nodeを削除し、再作成するまでの期間を設定する。

Nodeを定期的に再作成することにより、最適なスペックを再設定するため、脆弱性抑制やコスト削減につながる。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  disruption:
    expireAfter: 720h
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### limits

Karpenterがプロビジョニング可能なNodeをハードウェアリソース合計量で設定する。

Karpenter配下のNodeのハードウェアリソースがこれを超過した場合に、既存のNodeを削除しないと、新しいものをプロビジョニングできない。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  limits:
    cpu: 1000
    memory: 1000Gi
```

> - https://www.eksworkshop.com/docs/autoscaling/compute/karpenter/setup-provisioner/
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21
> - https://karpenter.sh/preview/concepts/nodepools/

<br>

### weight

複数のProvisionerがある場合に、このProvisionerの優先順位の高さを設定する。

デフォルトでは、重みが`0`である。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  weight: 10
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

## 02-02. template

### kubelet

Kubeletの`KubeletConfiguration`オプションにパラメーターを渡す。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    spec:
      kubelet:
        clusterDNS:
          - 10.0.1.100
        containerRuntime: containerd
        systemReserved:
          cpu: 100m
          memory: 100Mi
          ephemeral-storage: 1Gi
        kubeReserved:
          cpu: 200m
          memory: 100Mi
          ephemeral-storage: 3Gi
        evictionHard:
          memory.available: 5%
          nodefs.available: 10%
          nodefs.inodesFree: 10%
        evictionSoft:
          memory.available: 500Mi
          nodefs.available: 15%
          nodefs.inodesFree: 15%
        evictionSoftGracePeriod:
          memory.available: 1m
          nodefs.available: 1m30s
          nodefs.inodesFree: 2m
        evictionMaxPodGracePeriod: 60
        imageGCHighThresholdPercent: 85
        imageGCLowThresholdPercent: 80
        cpuCFSQuota: true
        podsPerCore: 2
        maxPods: 20
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/#kubelet-config-k8s-io-v1beta1-KubeletConfiguration

<br>

### metadata

#### ▼ annotations

Nodeに付与するアノテーションを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    metadata:
      annotations:
        example.com/owner: my-team
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

#### ▼ labels

Nodeに付与するラベルを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    metadata:
      labels:
        # マネージドNodeグループがNodeに挿入するラベルを、Karpenterも挿入する
        eks.amazonaws.com/nodegroup: app
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner
> - https://speakerdeck.com/toshikish/autoscaling-gitlab-ci-cd-with-karpenter?slide=31

<br>

### nodeClassRef

Provisionerで使用するNodeテンプレートを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-foo-nodegroup
spec:
  template:
    spec:
      nodeClassRef:
        apiVersion: karpenter.k8s.aws/v1beta1
        kind: EC2NodeClass
        name: foo-node-class
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### requirements

#### ▼ requirementsとは

プロビジョニングするNodeのハードウェアリソースを制限する。

制限しなかった項目は、Karpenterがよしなに設定値を選ぶ。

**＊実装例＊**

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    spec:
      requirements:
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values:
            - c
            - m
            - r
        - key: karpenter.k8s.aws/instance-cpu
          operator: In
          values:
            - 4
            - 8
            - 16
            - 32
        - key: karpenter.k8s.aws/instance-hypervisor
          operator: In
          values:
            - nitro
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values:
            - 2
        - key: topology.kubernetes.io/zone
          operator: In
          values:
            - us-west-2a
            - us-west-2b
        - key: kubernetes.io/arch
          operator: In
          values:
            - arm64
            - amd64
        - key: karpenter.sh/capacity-type
          operator: In
          values:
            - spot
            - on-demand
```

**＊実装例＊**

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    spec:
      requirements:
        - key: kubernetes.io/arch
          operator: In
          # ARM製よりAMD製に対応したベースイメージの方が多いので、AMD製を指定する
          values:
            - amd64
        - key: karpenter.k8s.aws/instance-family
          operator: In
          # ハードウェアリソース要求量が瞬間的に増える場合、T系を指定する
          values:
            - t3
        - key: karpenter.k8s.aws/instance-size
          operator: In
          values:
            - medium
            - large
            - xlarge
        - key: kubernetes.io/os
          operator: In
          values:
            - linux
        - key: karpenter.sh/capacity-type
          operator: In
          values:
            - on-demand
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner
> - https://developer.mamezou-tech.com/blogs/2022/02/13/introduce-karpenter/#provisioner%E4%BD%9C%E6%88%90

#### ▼ 指定できるキー名

> - https://karpenter.sh/preview/reference/instance-types/

<br>

### startupTaints

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    spec:
      startupTaints:
        - key: example.com/another-taint
          effect: NoSchedule
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### taints

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodegroup
spec:
  template:
    spec:
      taints:
        - key: example.com/special-taint
          effect: NoSchedule
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

<br>

## 03. 専用ConfigMap

### aws.interruptionQueueName

割り込み処理を有効にする場合に、AWS SQSの名前を設定する。

別途、AWS SQSを作成し、KarpenterにAWS SQSへの権限を付与しておく必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: karpenter-global-settings
  namespace: karpenter
data:
  aws.interruptionQueueName: foo-queue
```

> - https://karpenter.sh/preview/reference/settings/
> - https://verifa.io/blog/how-to-create-nodeless-aws-eks-clusters-with-karpenter/index.html#enable-interruption-handling-optional

<br>

### aws.clusterName

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: karpenter-global-settings
  namespace: karpenter
data:
  aws.clusterName: foo-cluster
```

> - https://karpenter.sh/preview/reference/settings/

<br>

### aws.clusterEndpoint

AWS EKS Clusterのkube-apiserverのURLを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: karpenter-global-settings
  namespace: karpenter
data:
  aws.clusterEndpoint: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

> - https://karpenter.sh/preview/reference/settings/

<br>

### batchMaxDuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: karpenter-global-settings
  namespace: karpenter
data:
  batchMaxDuration: 10s
```

> - https://karpenter.sh/preview/reference/settings/

<br>

### batchIdleDuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: karpenter-global-settings
  namespace: karpenter
data:
  batchIdleDuration: 1s
```

> - https://karpenter.sh/preview/reference/settings/

<br>
