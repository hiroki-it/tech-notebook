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

### amiSelector

NodeのAMIを設定する。

設定しない場合、Karpenterは最適化AMIを自動的に選択する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-template
spec:
  amiSelector: AL
```

> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

### securityGroupSelectorTerms

Nodeに紐づけるセキュリティグループを動的に検出するために、セキュリティグループのタグを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-template
spec:
  securityGroupSelectorTerms:
    - tags:
        Name: foo-private-sg
```

> - https://karpenter.sh/docs/concepts/node-templates/#specsecuritygroupselector

<br>

### subnetSelectorTerms

Nodeをプロビジョニングするサブネットを動的に検出するために、サブネットのタグを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-template
spec:
  subnetSelectorTerms:
    - tags:
        Name: foo-private-subnet
```

> - https://karpenter.sh/docs/concepts/node-templates/#specsubnetselector
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

### tags

全てのNodeやEBSボリュームに挿入するタグを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-template
spec:
  tags:
    karpenter.template: foo-node-template
```

> - https://karpenter.sh/docs/concepts/node-templates/#spectags
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

## 02. NodePool

### annotations

全てのNodeに挿入するアノテーションを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      annotations:
        example.com/owner: my-team
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### consolidation

コストを考慮するかどうかを設定する。

Nodeを削除できる状況では不要なNodeを削除し、また削除できない状況ではNodeのスペックをスケールインする。

`.spec.ttlSecondsAfterEmpty`キーとは競合し、どちらか一方しか設定できない。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      consolidation:
        enabled: true
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner
> - https://ec2spotworkshops.com/karpenter/050_karpenter/consolidation.html

<br>

### kubeletConfiguration

Kubeletの`KubeletConfiguration`オプションにパラメーターを渡す。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      kubeletConfiguration:
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

> - https://karpenter.sh/preview/concepts/nodepools/#speckubeletconfiguration
> - https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/#kubelet-config-k8s-io-v1beta1-KubeletConfiguration

<br>

### labels

Karpenterがハードウェアリソースを監視するNodeのラベルを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      labels:
        node.kubernetes.io/nodegroup: system
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner
> - https://speakerdeck.com/toshikish/autoscaling-gitlab-ci-cd-with-karpenter?slide=31

<br>

### limits

Karpenterがプロビジョニング可能なNodeをハードウェアリソース合計量で設定する。

Karpenter配下のNodeのハードウェアリソースがこれを超過した場合に、既存のNodeを削除しないと、新しいものをプロビジョニングできない。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      limits:
        resources:
          cpu: 1000
          memory: 1000Gi
```

> - https://www.eksworkshop.com/docs/autoscaling/compute/karpenter/setup-provisioner/
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21
> - https://karpenter.sh/preview/concepts/nodepools/#speclimitsresources

<br>

### providerRef

Provisionerで使用するNodeテンプレートを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-node-provisioner
spec:
  template:
    spec:
      providerRef:
        name: foo-template
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### requirements

#### ▼ requirementsとは

プロビジョニングするNodeのハードウェアリソースを設定する。

**＊実装例＊**

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
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
  name: foo-provisioner
spec:
  template:
    spec:
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values:
            - amd64
        - key: karpenter.k8s.aws/instance-family
          operator: In
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

<br>

### startupTaints

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
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
  name: foo-provisioner
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

### ttlSecondsAfterEmpty

NodeからPodが全て退避した後にNodeを削除するまでの待機時間を設定する。

`.spec.consolidation`キーとは競合し、どちらか一方しか設定できない。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      ttlSecondsAfterEmpty: 30
```

> - https://aws.amazon.com/jp/blogs/news/introducing-karpenter-an-open-source-high-performance-kubernetes-cluster-autoscaler/
> - https://ec2spotworkshops.com/karpenter/050_karpenter/consolidation.html

<br>

### ttlSecondsUntilExpired

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      ttlSecondsUntilExpired: 2592000
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### weight

複数のProvisionerがある場合に、このProvisionerの優先順位の高さを設定する。

デフォルトでは、重みが`0`である。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-provisioner
spec:
  template:
    spec:
      weight: 10
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

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

> - https://karpenter.sh/preview/concepts/disruption/#interruption
> - https://verifa.io/blog/how-to-create-nodeless-aws-eks-clusters-with-karpenter/index.html#enable-interruption-handling-optional
> - https://karpenter.sh/v0.31/concepts/settings/#configmap

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

> - https://karpenter.sh/v0.31/concepts/settings/#configmap

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

> - https://karpenter.sh/v0.31/concepts/settings/#configmap

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

> - https://karpenter.sh/v0.31/concepts/settings/#configmap

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

> - https://karpenter.sh/v0.31/concepts/settings/#configmap

<br>
