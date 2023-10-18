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

## 02. スケーリングの仕組み

### スケールアウトの場合

例えば、以下のような仕組みで、Nodeの自動水平スケーリングのスケールアウトを実行する。

`(1)`

: Podが、Nodeの`70`%にあたるリソースを要求する。

     しかし、Nodeが`1`台では足りない。`70 + 70 = 140%`になるため、既存のNodeの少なくとも`1.4`倍のスペックが必要となる。

`(2)`

: 新しく決定したスペックで、Nodeを新しく作成する。

`(3)`

: 新しく作成したNodeにPodをスケジューリングする。また、既存のNodeが不要であれば削除する。

`(4)`

: 結果として、`1`台で`2`個のPodがスケジューリングされている。

<br>

### スケールインの場合

記入中...

<br>

## 03. Provisioner

### providerRef

Provisionerで使用するNodeテンプレートを設定する。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-node-provisioner
spec:
  providerRef:
    name: foo-template
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### taints

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  taints:
    - key: example.com/special-taint
      effect: NoSchedule
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### startupTaints

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  startupTaints:
    - key: example.com/another-taint
      effect: NoSchedule
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### labels

全てのNodeに挿入するラベルを設定する。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  labels:
    billing-team: my-team
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### annotations

全てのNodeに挿入するアノテーションを設定する。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  annotations:
    example.com/owner: "my-team"
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### requirements

プロビジョニングするNodeのハードウェアリソースを設定する。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  requirements:
    - key: "karpenter.k8s.aws/instance-category"
      operator: In
      values:
        - "c"
        - "m"
        - "r"
    - key: "karpenter.k8s.aws/instance-cpu"
      operator: In
      values:
        - "4"
        - "8"
        - "16"
        - "32"
    - key: "karpenter.k8s.aws/instance-hypervisor"
      operator: In
      values:
        - "nitro"
    - key: "karpenter.k8s.aws/instance-generation"
      operator: Gt
      values:
        - "2"
    - key: "topology.kubernetes.io/zone"
      operator: In
      values:
        - "us-west-2a", "us-west-2b"
    - key: "kubernetes.io/arch"
      operator: In
      values:
        - "arm64", "amd64"
    - key: "karpenter.sh/capacity-type" # If not included, the webhook for the AWS cloud provider will default to on-demand
      operator: In
      values:
        - "spot"
        - "on-demand"
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### kubeletConfiguration

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  kubeletConfiguration:
    clusterDNS: ["10.0.1.100"]
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

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### limits

ハードウェアリソースの合計使用量の上限値を設定する。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  limits:
    resources:
      cpu: "1000"
      memory: 1000Gi
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### consolidation

コスト削減のため、既存のNodeのスペックを下げるプロビジョニングを実行するかどうかを設定する。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  consolidation:
    enabled: true
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### ttlSecondsUntilExpired

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  ttlSecondsUntilExpired: 2592000 # 30 Days = 60 * 60 * 24 * 30 Seconds;
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### ttlSecondsAfterEmpty

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  ttlSecondsAfterEmpty: 30
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### weight

複数のProvisionerがある場合に、このProvisionerの優先順位の高さを設定する。

デフォルトでは、重みが`0`である。

```yaml
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: foo-provisioner
spec:
  weight: 10
```

> - https://karpenter.sh/docs/concepts/provisioners/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

## 04. AWSNodeTemplate

### subnetSelector

EC2ワーカーNodeがあるサブネットを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1alpha1
kind: AWSNodeTemplate
metadata:
  name: foo-node-template
spec:
  subnetSelector:
    Name: foo-private-subnet
```

> - https://karpenter.sh/docs/concepts/node-templates/#specsubnetselector

<br>

### tags

全てのEC2ワーカーNodeに挿入するタグを設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1alpha1
kind: AWSNodeTemplate
metadata:
  name: foo-node-template
spec:
  tags:
    karpenter.template: foo-node-template
```

> - https://karpenter.sh/docs/concepts/node-templates/#spectags

<br>
