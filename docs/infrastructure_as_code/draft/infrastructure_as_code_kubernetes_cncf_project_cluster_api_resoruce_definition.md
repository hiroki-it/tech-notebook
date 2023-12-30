---
title: 【IT技術の知見】ClusterAPI＠CNCF
description: ClusterAPI＠CNCFの知見を記録しています。
---

# ClusterAPI＠CNCF

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Cluster

### Cluster

記入中...

```yaml
apiVersion: cluster.x-k8s.io/v1alpha3
kind: Cluster
metadata:
  name: foo-cluster
  namespace: foo-namespace
  annotations:
    link.argocd.argoproj.io/external-link: https://ap-northeast-1.console.aws.amazon.com/eks/home?region=ap-northeast-1#/clusters/foo-cluster
spec:
  controlPlaneRef:
    apiVersion: controlplane.cluster.x-k8s.io/v1alpha3
    kind: AWSManagedControlPlane
    name: foo-cluster-control-plane
  infrastructureRef:
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
    kind: AWSManagedCluster
    name: foo-cluster
```

> - https://qiita.com/Hiroyuki_OSAKI/items/d41a2c0da6853f62adb8#cluster%E6%96%B0%E8%A6%8F%E4%BD%9C%E6%88%90
> - https://qiita.com/taishin/items/de9a0d648fdc220ed93d#%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%81%AE%E4%BD%9C%E6%88%90

<br>

### Cluster (Google Cloud Anthos)

Anthos GKE Clusterを設定する。

```yaml
apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-anthos-cluster
  namespace: anthos
spec:
  type: hybrid # Clusterタイプ
  profile: default # Clusterプロファイル
  anthosBareMetalVersion: 1.0.0 # Anthos GKE Clusterのバージョン
  gkeConnect: # 内部のGKEへの接続情報
    ...

  controlPlane: # コントロールプレーンNode
    ...

  clusterNetwork: # Clusterネットワーク
    ...

  loadBalancer: # l4ロードバランサー
    ...

  clusterOperations: # Clusterの監視
    ...

  storage: #
    ...

  nodeConfig: # 全てのコントロールプレーンNodeとワーカーNodeへの適用値
    ...

  authentication: # コントロールプレーンNodeの認証方法
    ...

  nodeAccess: # コントロールプレーンNodeに認証されるユーザーの名前
    ...
```

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/quickstart#edit-config
> - https://cloud.google.com/anthos/clusters/docs/on-prem/latest/concepts/cluster-api#cluster

<br>

### AWSManagedCluster

記入中...

```yaml
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
kind: AWSManagedCluster
metadata:
  name: foo-cluster
  namespace: foo-namespace
```

<br>

### DockerCluster

記入中...

```yaml
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha2
kind: DockerCluster
metadata:
  name: capi-quickstart
```

> - https://qiita.com/Hiroyuki_OSAKI/items/d41a2c0da6853f62adb8#cluster%E6%96%B0%E8%A6%8F%E4%BD%9C%E6%88%90

<br>

## 02. ConfigTemplate

### EKSConfigTemplateとは

記入中...

```yaml
apiVersion: bootstrap.cluster.x-k8s.io/v1alpha3
kind: EKSConfigTemplate
metadata:
  name: foo-cluster-template
  namespace: foo-namespace
spec:
  template: {}
```

> - https://qiita.com/taishin/items/de9a0d648fdc220ed93d#%E3%83%9E%E3%83%8D%E3%83%BC%E3%82%B8%E3%83%89%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%82%92%E8%BF%BD%E5%8A%A0

<br>

## 03. ControlPlane

### AWSManagedControlPlane

記入中...

```yaml
apiVersion: controlplane.cluster.x-k8s.io/v1alpha3
kind: AWSManagedControlPlane
metadata:
  name: foo-cluster-control-plane
  namespace: foo-namespace
spec:
  eksClusterName: foo-cluster
  region: ap-northeast-1
  version: v1.19
  associateOIDCProvider: "true"
```

> - https://cluster-api-aws.sigs.k8s.io/topics/bring-your-own-aws-infrastructure.html?highlight=AWSManagedControlPlane#configuring-the-awscluster-specification

<br>

## 04. Machine

### Machine

記入中...

```yaml
apiVersion: cluster.x-k8s.io/v1alpha2
kind: Machine
metadata:
  name: capi-quickstart-controlplane-0
  labels:
    cluster.x-k8s.io/control-plane: "true"
    cluster.x-k8s.io/cluster-name: "capi-quickstart"
spec:
  version: v1.15.3
  bootstrap:
    configRef:
      apiVersion: bootstrap.cluster.x-k8s.io/v1alpha2
      kind: KubeadmConfig
      name: capi-quickstart-controlplane-0
  infrastructureRef:
    kind: DockerMachine
    apiVersion: infrastructure.cluster.x-k8s.io/v1alpha2
    name: capi-quickstart-controlplane-0
```

> - https://qiita.com/Hiroyuki_OSAKI/items/d41a2c0da6853f62adb8#machine%E3%82%92%E4%BD%9C%E3%82%8B

<br>

### DockerMachine

```yaml
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha2
kind: DockerMachine
metadata:
  name: capi-quickstart-controlplane-0
```

> - https://qiita.com/Hiroyuki_OSAKI/items/d41a2c0da6853f62adb8#machine%E3%82%92%E4%BD%9C%E3%82%8B

<br>

## 05. MachineClass

記入中...

<br>

## 06. MachineDeployment

記入中...

<br>

## 07. MachinePool

### MachinePoolとは

```yaml
apiVersion: exp.cluster.x-k8s.io/v1alpha3
kind: MachinePool
metadata:
  name: foo-cluster
  namespace: foo-namespace
spec:
  clusterName: foo-cluster
  replicas: 2
  template:
    metadata:
    spec:
      bootstrap:
        configRef:
          apiVersion: bootstrap.cluster.x-k8s.io/v1alpha3
          kind: EKSConfigTemplate
          name: foo-cluster-template
      clusterName: foo-cluster
      infrastructureRef:
        apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
        kind: AWSManagedMachinePool
        name: foo-cluster
      version: v1.19.0
```

> - https://qiita.com/taishin/items/de9a0d648fdc220ed93d#%E3%83%9E%E3%83%8D%E3%83%BC%E3%82%B8%E3%83%89%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%82%92%E8%BF%BD%E5%8A%A0

<br>

### AWSManagedMachinePool

記入中...

```yaml
apiVersion: infrastructure.cluster.x-k8s.io/v1alpha3
kind: AWSManagedMachinePool
metadata:
  name: foo-cluster
  namespace: foo-namespace
spec:
  eksNodegroupName: foo-node-group
  additionalTags:
    env: test
  roleName: nodes.cluster-api-provider-aws.sigs.k8s.io
  diskSize: 50
  instanceType: t2.medium
  scaling:
    minSize: 1
    maxSize: 3
```

> - https://qiita.com/taishin/items/de9a0d648fdc220ed93d#%E3%82%AF%E3%83%A9%E3%82%B9%E3%82%BF%E3%81%AE%E4%BD%9C%E6%88%90

<br>

### NodePool (Google Cloud Anthos)

Anthos GKE Cluster内のNodeに関して、Nodeグループを設定する。

Anthos in Baremetalの場合は、Nodeの固定IPアドレスを設定することにより、NodeグループにNodeを参加させられる。

```yaml
apiVersion: baremetal.cluster.gke.io/v1
kind: NodePool
metadata:
  name: foo-anthos-node-pool
  namespace: anthos
spec:
  clusterName: foo-anthos-cluster
  nodes:
    - address: *.*.*.*
    - address: *.*.*.*
```

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/quickstart#edit-config

<br>

## 08. MachineSet

記入中...

<br>
