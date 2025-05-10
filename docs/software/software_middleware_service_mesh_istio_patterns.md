---
title: 【IT技術の知見】設計パターン＠Istio
description: 設計パターン＠Istioの知見を記録しています。
---

# 設計パターン＠Istio

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 管理下のKubernetes Cluster数

### 単一Kubernetes Cluster

記入中...

<br>

### 複数Kubernetes Cluster

記入中...

<br>

## 02. Istiodコントロールプレーン数

Istiodコントロールプレーン数に関するパターンである。

<br>

## 02-02. 単一Istiodコントロールプレーン

### 単一Istiodコントロールプレーンとは

複数Kubernetes Clusterのネットワークを横断的に管理するIstiodコントロールプレーンを作成する。

Istiodコントロールプレーンを持つプライマリCluster、サービスメッシュに参加するClusterのリモートCluster、からなる。

> - https://istio.io/latest/docs/ops/deployment/deployment-models/#control-plane-models

<br>

## 02-03. 複数Istiodコントロールプレーン

### 複数Istiodコントロールプレーンとは

Kubernetes ClusterごとにIstiodコントロールプレーンを作成する。

> - https://istio.io/latest/docs/ops/deployment/deployment-models/#control-plane-models

<br>

### 異なるIstiodコントロールプレーン間のデータプレーン共有

#### ▼ 同じプライベートネットワーク内の場合

異なるClusterが同じプライベートネットワーク内に所属している場合、ClusterのコントロールプレーンNode間でデータプレーンを管理し合う。

これにより、この時、IngressGatewayを使用せずに、異なるClusterのコンテナが直接的に通信できる。

![istio_multi-service-mesh_cluster_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_cluster_same-network.png)

> - https://zenn.dev/kuchima/articles/asm-hybrid-mesh

#### ▼ 異なるプライベートネットワーク内の場合

異なるClusterが異なるプライベートネットワーク内に所属している場合、ClusterのコントロールプレーンNode間でデータプレーンを管理し合う。

これにより、この時、IngressGatewayを経由して、異なるClusterのコンテナが間接的に通信できる。

![istio_multi-service-mesh_cluster_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_cluster_difficult-network.png)

> - https://zenn.dev/kuchima/articles/asm-hybrid-mesh

<br>

## 03. 外部Istiodコントロールプレーン

### 外部Istiodコントロールプレーンとは

Istioコントロールプレーンとデータプレーンを異なる実行環境にデプロイする。

ただ、データプレーン側に仲介役のIstioコントロールプレーンをデプロイしておく必要がある。

<br>

### データプレーンがKubernetes Clusterの場合

記入中...

> - https://istio.io/latest/docs/setup/install/external-controlplane/
> - https://istio.io/latest/blog/2020/new-deployment-model/
> - https://github.com/istio/istio/wiki/External-Istiod-single-cluster-steps

<br>

### データプレーンが仮想サーバーの場合

#### ▼ 同じプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと同じプライベートネットワーク内に所属している場合、仮想サーバー上のコンテナをサービスメッシュに参加させる。

コントロールプレーン側ではWorkloadGroupの作成、仮想サーバー側ではistioデーモンプロセスの実行が必要である。

この時、IngressGatewayを使用せずに、Kubernetes上のコンテナと仮想サーバー上のコンテナが直接的に通信できる。

![istio_multi-service-mesh_vm_same-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_same-network.png)

> - https://istio.io/latest/docs/ops/deployment/vm-architecture/
> - https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine

#### ▼ 異なるプライベートネットワーク内の場合

仮想サーバーがコントロールプレーンNodeと異なるプライベートネットワーク内に所属している場合、仮想サーバー上のコンテナをサービスメッシュに参加させる。

コントロールプレーン側ではWorkloadGroupの作成、仮想サーバー側ではistioデーモンプロセスの実行が必要である。

この時、IngressGatewayを経由して、Kubernetes上のコンテナと仮想サーバー上のコンテナが間接的に通信できる。

![istio_multi-service-mesh_vm_difficult-network](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/istio_multi-service-mesh_vm_difficult-network.png)

> - https://istio.io/latest/docs/ops/deployment/vm-architecture/
> - https://istio.io/latest/docs/setup/install/virtual-machine/#start-istio-within-the-virtual-machine

<br>

### データプレーンが非Kubernetesのコンテナの場合

クラウド上のコンテナ (例：AWS ECS) がコントロールプレーンNodeと同じプライベートネットワーク内に所属している場合、クラウド上のコンテナをサービスメッシュに参加させる。

コントロールプレーン側では〇〇 (AWS ECSを認識するためのリソースが必要なはずだが、調査してもわからず...) の作成、クラウド上のコンテナのホストマシンではztunnelデーモンあるいはztunnelコンテナの実行が必要である。

> - https://aws.amazon.com/blogs/containers/transforming-istio-into-an-enterprise-ready-service-mesh-for-amazon-ecs/
> - https://github.com/solo-io/ecs-demo/blob/main/tf/ecs_eks_cluster.tf#L126-L151
> - https://github.com/solo-io/ecs-demo/blob/main/README.md#install-istio-in-ambient-mode-with-ecs-cluster-integration

<br>

## 04. 接続メッシュ数

### 単一メッシュ

記入中...

<br>

### 複数メッシュ

記入中...

<br>

## 05. テナント分離

### Namespaceテナント

Istioのサービスメッシュは、管理下の複数のNamespaceをテナントとして分離する。

Namespace as-a-Serviceとして提供する。

> - https://istio.io/latest/docs/ops/deployment/deployment-models/#namespace-tenancy

<br>

### Clusterテナント

Istioのサービスメッシュは、管理下の複数Kubernetes Clusterをテナントとして分離する。

Clusters as-a-Serviceとして提供する。

> - https://istio.io/latest/docs/ops/deployment/deployment-models/#cluster-tenancy

<br>

### メッシュテナント

Istioのサービスメッシュは、管理下の単一のKubernetes Clusterをテナントとして分離する。

各Kubernetes Clusterのサービスメッシュは独立しているが、互いに通信できる。

メッシュテナントを採用すると、複数メッシュパターンになる。

> - https://istio.io/latest/docs/ops/deployment/deployment-models/#mesh-tenancy
> - https://istio.io/latest/docs/ops/deployment/deployment-models/#multiple-meshes

<br>
