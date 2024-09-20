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

### EC2NodeClassとは

NodePool内のNodeに対して、AWS固有の仕様を設定する。

ClusterスコープなKubernetesリソースであるため、Namespaceは設定できない。

Terraformの`aws_launch_template`ブロックと競合する。

> - https://github.com/aws/karpenter/issues/3369#issuecomment-1432380048
> - https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/launch_template

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

EC2 NodeのAMIを設定する。

AMIのバージョンを固定したい場合に役立つ。

設定しない場合、Karpenterは最適化AMIを自動的に選択する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  amiSelectorTerms:
    - name: ami-*****
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#specamiselectorterms
> - https://pages.awscloud.com/rs/112-TZM-766/images/4_ECS_EKS_multiarch_deployment.pdf#page=21

<br>

### blockDeviceMappings

プロビジョニングするEC2 Nodeのブロックデバイスを設定する。

> - https://karpenter.sh/preview/concepts/nodeclasses/

<br>

### detailedMonitoring

EC2 NodeのCloudWatchによる監視を設定する。

> - https://karpenter.sh/preview/concepts/nodeclasses/

<br>

### metadataOptions

EC2 Nodeのメタデータへのアクセスを制御する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  metadataOptions:
    httpEndpoint: enabled
    httpProtocolIPv6: disabled
    httpPutResponseHopLimit: 2
    httpTokens: required
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#specmetadataoptions
> - https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-metadata.html

<br>

### instanceProfile

IAMロールの代わりに使用するIAMインスタンスプロファイル名を設定する。

プライベートなEKS Cluster (アウトバウンド通信を禁止している) の場合、IAMロールの代わりにIAMインスタンスプロファイルを使用する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  instanceProfile: foo-instance-profile
```

> - https://karpenter.sh/docs/concepts/nodeclasses/#specinstanceprofile

<br>

### role

IAMプロファイル名の代わりに使用するIAMロールを設定する。

プライベートなEKS Cluster (アウトバウンド通信を禁止している) の場合、IAMロールの代わりにIAMインスタンスプロファイルを使用する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  role: foo-node-role
```

<br>

### securityGroupSelectorTerms

EC2 Nodeに紐づけるセキュリティグループを動的に検出するために、クラスターセキュリティグループのリソースを設定する。

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

EC2 Nodeをプロビジョニングするサブネットを動的に検出するために、サブネットのリソースを設定する。

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

### status

karpenter-controllerがEC2 Nodeを作成するために取得した情報を自動的に設定する。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
status:
  amis:
    - id: ami-*****
      name: foo-ami
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values:
            - arm64
        - key: karpenter.k8s.aws/instance-gpu-count
          operator: DoesNotExist
        - key: karpenter.k8s.aws/instance-accelerator-count
          operator: DoesNotExist
  instanceProfile: foo-cluster-*****
  securityGroups:
    - id: sg-*****
      name: foo-cluster*****
  subnets:
    - id: subnet-*****
      zone: ap-northeast-1c
    - id: subnet-*****
      zone: ap-northeast-1d
    - id: subnet-*****
      zone: ap-northeast-1a
```

> - https://karpenter.sh/docs/concepts/nodeclasses/#statussubnets
> - https://karpenter.sh/docs/concepts/nodeclasses/#statussecuritygroups
> - https://karpenter.sh/docs/concepts/nodeclasses/#statusamis
> - https://karpenter.sh/docs/concepts/nodeclasses/#statusamis

<br>

### tags

#### ▼ tags

NodePool配下のEC2 Node、またこれに紐づくAWSリソース (例：EBSボリュームなど) に挿入するタグを設定する。

なお、NodePool配下のEC2 Nodeは起動テンプレートから作成するが、起動テンプレート自体はEC2 Nodeの作成後に削除するようになっている。

#### ▼ デフォルトのタグ

KarpenterがEC2 Nodeにデフォルトで挿入するタグは上書きしないように、設定しない。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  tags:
    # AWSはKarpenterがプロビジョニングしたAWSリソースにタグを挿入する
    aws:ec2:fleet-id: fleet-*****
    aws:ec2launchtemplate:id: lt-*****
    aws:ec2launchtemplate:version: 1
    aws:eks:cluster-name: foo-cluster
    # Karpenterは、カスタムリソースとEC2の状態を紐づけるためのタグを挿入する
    karpenter.sh/managed-by: foo-cluster
    karpenter.sh/nodeclaim: foo-claim-*****
    karpenter.sh/nodepool: foo-nodepool
    karpenter.k8s.aws/ec2nodeclass: foo-node-class
    karpenter.k8s.aws/cluster: foo-cluster
    # AWS EKSにとってはセルフマネージドNodeになるため、KarpenterはセルフマネージドNodeとして認識されるようにタグを挿入してくれる
    kubernetes.io/cluster/foo-cluster: owned
```

> - https://karpenter.sh/preview/concepts/nodeclasses/#spectags
> - https://karpenter.sh/docs/getting-started/getting-started-with-karpenter/#4-install-karpenter
> - https://docs.aws.amazon.com/eks/latest/userguide/worker.html

#### ▼ ユーザー定義のタグ

EC2 Nodeに挿入するユーザー定義のタグを設定できる。

```yaml
apiVersion: karpenter.k8s.aws/v1beta1
kind: EC2NodeClass
metadata:
  name: foo-node-class
spec:
  tags:
    Env: prd
    ManagedBy: https://github.com/hiroki-hasegawa/foo-karpenter.git
    # Karpenterが管理することがわかりやすいように、接尾辞は "karpenter" とする
    Name: bar-cluster-foo-karpenter
    karpenter.sh/discovery: foo-cluster
```

> - https://github.com/aws/karpenter/issues/1919#issue-1267832624

#### ▼ IRSA用IAMロールの条件と一致させる

ここで挿入するタグと、AWS IAMポリシーの条件で指定するタグと一致させる必要がある。

```yaml
{
  "Statement": [

        {
            "Action": "ec2:RunInstances",
            "Condition": {
                "StringEquals": {
                    # KarpenterのEC2NodeClassで挿入した起動テンプレートのタグを指定する
                    "ec2:ResourceTag/karpenter.sh/discovery": [
                        "foo-cluster",
                    ]
                }
            },
            "Effect": "Allow",
            "Resource": "arn:aws:ec2:*:<アカウントID>:launch-template/*",
            "Sid": ""
        },

  ...

  "Version": "2012-10-17"
  ]
}
```

もちろん、Karpenter以外の方法 (例：Terraformなど) で挿入したタグを使用しても良い。

> - https://github.com/aws/karpenter/issues/1488#issuecomment-1096972053

<br>

### userData

プロビジョニングするEC2 Nodeのユーザーデータを設定する。

> - https://karpenter.sh/preview/concepts/nodeclasses/

<br>

## 02. NodePool

### NodePoolとは

NodePool内のNodeに対して、クラウドプロバイダーに依らない仕様を設定する。

EC2 Nodeのグループ (例：AWS EKS Nodeグループ、Google Cloud Nodeプールなど) に合わせて、複数作成すると良い。

ClusterスコープなKubernetesリソースであるため、Namespaceは設定できない。

> - https://karpenter.sh/preview/concepts/nodepools/

<br>

### disruption

#### ▼ consolidationPolicy

Node統合の条件を設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  disruption:
    consolidationPolicy: WhenUnderutilized
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://karpenter.sh/preview/concepts/disruption/#automated-methods

#### ▼ consolidateAfter

EC2 NodeからPodが全て退避した後にEC2 Nodeを削除するまでの待機時間を設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  disruption:
    consolidateAfter: 30s
```

> - https://aws.amazon.com/jp/blogs/news/introducing-karpenter-an-open-source-high-performance-kubernetes-cluster-autoscaler/
> - https://karpenter.sh/preview/concepts/disruption/#automated-methods

#### ▼ expireAfter

EC2 Nodeを削除し、再作成するまでの期間を設定する。

EC2 Nodeを定期的に再作成することにより、最適なスペックを再設定するため、脆弱性抑制やコスト削減につながる。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  disruption:
    expireAfter: 720h
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://karpenter.sh/preview/concepts/disruption/#automated-methods

<br>

### limits

Karpenterがプロビジョニング可能なEC2 Nodeをハードウェアリソース合計量で設定する。

Karpenter配下のEC2 Nodeのハードウェアリソースがこれを超過した場合に、既存のNodeを削除しないと、新しいものをプロビジョニングできない。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  limits:
    cpu: 1000m
    memory: 1024Mi
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
  name: foo-nodepool
spec:
  weight: 10
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

## 02-02. .template.metadata

### annotations

EC2 Nodeに付与するアノテーションを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  template:
    metadata:
      annotations:
        example.com/owner: my-team
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

## 02-03. .template.spec

### kubelet

kubeletの`KubeletConfiguration`オプションにパラメーターを渡す。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
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
        cpuCFSQuota: "true"
        podsPerCore: 2
        maxPods: 20
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/#kubelet-config-k8s-io-v1beta1-KubeletConfiguration

<br>

#### ▼ labels

EC2 Nodeに付与するラベルを設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  template:
    metadata:
      labels:
        # Karpenterの管理するEC2 Nodeにラベルを挿入する
        node.kubernetes.io/nodetype: foo
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner
> - https://speakerdeck.com/toshikish/autoscaling-gitlab-ci-cd-with-karpenter?slide=31

<br>

### nodeClassRef

Provisionerで使用するEC2 NodeClass名を設定する。

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
spec:
  template:
    spec:
      nodeClassRef:
        name: foo-node-class
```

> - https://karpenter.sh/preview/concepts/nodepools/
> - https://github.com/aws/karpenter/tree/main/examples/provisioner

<br>

### requirements

#### ▼ requirementsとは

プロビジョニングするEC2 Nodeのハードウェアリソースを制限する。

制限しなかった項目は、Karpenterがよしなに設定値を選ぶ。

**＊実装例＊**

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: foo-nodepool
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
  name: foo-nodepool
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
          # オンデマンドなインスタンスを指定する
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
  name: foo-nodepool
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
  name: foo-nodepool
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

## 03. グローバル設定用ConfigMap

### aws.interruptionQueueName

割り込み処理を有効化する場合に、AWS SQSの名前を設定する。

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

## 04. ロギング設定用のConfigMap

### zap-logger-config

ロギングを設定する。

zapパッケージを使用しているため、設定値の種類はzapパッケージのものである。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: config-logging
data:
  zap-logger-config: |
    {
      "level": "debug",
      "development": "false",
      "disableStacktrace": "true",
      "disableCaller": "true",
      "sampling": {
        "initial": 100,
        "thereafter": 100
      },
      "outputPaths": ["stdout"],
      "errorOutputPaths": ["stderr"],
      # 見やすいログ形式にする
      "encoding": "console",
      "encoderConfig": {
        "timeKey": "time",
        "levelKey": "level",
        "nameKey": "logger",
        "callerKey": "caller",
        "messageKey": "message",
        "stacktraceKey": "stacktrace",
        "levelEncoder": "capital",
        "timeEncoder": "iso8601"
      }
    }
```

> - https://github.com/uber-go/zap/blob/aa3e73ec0896f8b066ddf668597a02f89628ee50/config.go#L58-L94

<br>

### loglevel.controller

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: config-logging
data:
  loglevel.controller: debug
```

<br>

### loglevel.webhook

記入中...

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: config-logging
data:
  loglevel.webhook: error
```

<br>
