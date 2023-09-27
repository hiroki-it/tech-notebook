---
title: 【IT技術の知見】Anthos＠GCP GCPリソース
description: Anthos＠GCPリソースの知見を記録しています。
---

# Anthos＠GCPリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Anthos

### Anthosの仕組み

#### ▼ アーキテクチャ

Anthosは、Anthos GKE Cluster、Anthos Service Mesh、Anthos Config Management、といったコンポーネントから構成される。

> - https://www.fsi.co.jp/blog/5939/
> - https://cloud.google.com/anthos/clusters/docs/multi-cloud/aws/concepts/architecture

<br>

### Anthos GKE Cluster

#### ▼ Anthos GKE Clusterとは

GKE Cluster (コントロールプレーンNode、ワーカーNode、を含む) から構成される。

#### ▼ アタッチCluster

AnthosのGKE Cluster部分の能力を、Kubernetesの他の実行環境 (AWS EKS、Azure AKS、RKE、K3SやK3D) のClusterに委譲する。

AnthosのKubernetesのバージョンは、各実行環境のClusterが対応するKubernetesのバージョンに依存する。

![anthos_attached_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_attached_cluster.png)

> - https://cloud.google.com/anthos/clusters/docs/multi-cloud/attached/previous-generation/how-to/attach-kubernetes-clusters
> - https://cloud.google.com/blog/ja/topics/anthos/getting-to-know-anthos-attached-clusters
> - https://cloud.google.com/anthos/clusters/docs/attached/how-to/attach-kubernetes-clusters
> - https://www.jetstack.io/blog/anthos-attached-clusters/

#### ▼ Anthos、Kubernetesのバージョンの対応

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support#version-support

<br>

### Anthos Service Mesh

#### ▼ Anthos Service Meshとは

Traffic Director、Mesh CA、Managed backends、といったコンポーネントから構成される。

![anthos_service_mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_service_mesh.png)

> - https://cloudsolutions.academy/how-to/anthos-in-a-nutshell/introducing-anthos/service-management/
> - https://lp.cloudplatformonline.com/rs/808-GJW-314/images/App_Modernization_Session_06.pdf#page=20

#### ▼ Traffic Director

サービスディスカバリーとして、`istio-proxy`コンテナに他の宛先の情報を提供する。

> - https://lp.cloudplatformonline.com/rs/808-GJW-314/images/App_Modernization_Session_06.pdf#page=23

#### ▼ Mesh CA

中間認証局として、相互TLS認証のためのSSL証明書を`istio-proxy`コンテナに提供する。

また、SSL証明書が失効すれば更新する。

> - https://lp.cloudplatformonline.com/rs/808-GJW-314/images/App_Modernization_Session_06.pdf#page=27

<br>

### Anthos Config Management

#### ▼ Anthos Config Managementとは

一連のacm-operator (cluster-operator、など) から構成される。

![anthos_config-management](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_config-management.png)

> - https://cloudsolutions.academy/how-to/anthos-in-a-nutshell/introducing-anthos/anthos-config-management-acm/

#### ▼ acm-operatorの仕組み

一連のacm-operator (cluster-operator、など) は、組み合わさって動作する。Gitリポジトリで管理されたACMカスタムリソースのGitOpsを実装する。

![anthos_config-management_gitops](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_config-management_gitops.png)

> - https://cloud.google.com/anthos-config-management/docs/concepts/best-practices-for-policy-management-with-anthos-config-management
> - https://cloud.google.com/architecture/modern-cicd-anthos-reference-architecture
> - https://github.com/GoogleCloudPlatform/acm-policy-controller-library

#### ▼ cluster-operator

cluster-operatorは、kube-apiserverを介して、etcdにwatchイベントを送信している。

Anthos GKE Clusterのバインディング情報がetcdに永続化されたことを検知した場合に、kube-apiserverを介して、Anthos GKE Cluster上のkubeletにカスタムリソースの作成をコールする。

Anthos GKE Clusterが、GCP以外 (オンプレミス、ベアメタル、他クラウドプロバイダー) にある場合は、cluster-operatorは、これらのAPIを介してAnthos GKE Cluster上のkubeletをコールすることになる。

またkube-controller-managerはcluster-operatorを反復的に実行する。

これにより、Anthos GKE ClusterはCRDの宣言通りに定期的に修復される (reconciliationループ) 。

> - https://www.jetstack.io/blog/anthos-aws/

<br>

### その他

#### ▼ connect-gateway

GCP上で`kubectl`コマンドを実行して各クラウドプロバイダー上のAnthos GKE Clusterのkube-apiserverにリクエストを送信する時に、各クラウドプロバイダーごとのAPIの違いを吸収してくれる。

![anthos_connect-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_connect-gateway.png)

> - https://www.topgate.co.jp/anthos-gke#connect-gateway

#### ▼ fleet-workload-identity

GCP側のアカウント情報と、各クラウドプロバイダーのAnthos内のServiceAccountを紐付ける。

これにより、クラウドプロバイダー側でアカウントを作成する必要がない。

> - https://www.topgate.co.jp/anthos-gke#fleet-workload-identity

#### ▼ anetd

cniアドオンとして、Ciliumを使用してAnthos GKE Clusterのネットワークを作成する。

> - https://cloud.google.com/kubernetes-engine/docs/concepts/dataplane-v2#how_works

<br>

## 02. on-オンプレミス

### on-オンプレミスの仕組み

on-オンプレミスは、各Clusterを作成するワークステーション (Clusterの作成後に削除される) 、コントロールプレーンNodeの所属する管理Cluster、ワーカーNodeの所属するユーザーCluster、といったコンポーネントから構成される。

ワークステーションにて、GCPのAPIを介してオンプレミス (例：VMWare) のAPIをコールし、オンプレミス環境上にAnthos GKE Clusterを作成する。

Anthos GKE ClusterのライフサイクルもGCPから管理できる。

![anthos_on_on-premises_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_on-premises_architecture.png)

> - https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/minimal-infrastructure

<br>

## 02-02. on-ベアメタル

### on-ベアメタルの仕組み

#### ▼ マルチClusterタイプ

マルチClusterタイプのon-ベアメタルは、ワークステーション (仮想サーバー) 、コントロールプレーンNodeの所属する管理Cluster、ワーカーNodeの所属するユーザーCluster、`L4` (トランスポート層) のロードバランサーから構成される。

GCPのAPIを介して、ベアメタルプロバイダーのAPIをコールし、ベアメタル環境上にAnthos GKE Clusterを作成する。

Anthos GKE ClusterのライフサイクルもGCPから管理できる。

![anthos_on_bare-metal_multi-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_bare-metal_multi-cluster.png)

> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

#### ▼ スタンドアローンClusterタイプ (ハイブリッドタイプ)

スタンドアローンClusterタイプ (ハイブリッドタイプ) のon-ベアメタルは、ワークステーション (仮想サーバー) 、コントロールプレーンNodeとワーカーNodeの両方が所属するベアメタルCluster、といったコンポーネントから構成される。

ワークステーションにて、GCPのAPIを介してベアメタルプロバイダーのAPIをコールし、ベアメタル環境上にAnthos GKE Clusterを作成する。

Anthos GKE ClusterのライフサイクルもGCPから管理できる。

![anthos_on_bare-metal_standalone-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_bare-metal_standalone-cluster.png)

> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

<br>

### ワークステーション

#### ▼ ワークステーションとは

Anthos Clusterの作成時やアップグレード時に、`bmctl`コマンドはワークステーション (仮想サーバー) を構築し、ワークステーション上でKindを起動する。

ベアメタルであるため、自前で仮想サーバー (例：VMware) を作成する必要がある。

Kindはコンテナを構築し、そのコンテナ内でブートストラップClusterを作成できるか否かを検証することにより、Anthos Clusterの事前検証する。

Kindがコンテナを構築するために、Anthos Clusterの構築前に、`docker`プロセスを起動しておく必要がある。

```bash
$ systemctl start docker
```

#### ▼ ブートストラップCluster

Kindがコンテナ内で作成する仮想Anthos Clusterのこと。

VClusterを使用して、仮想Anthos Clusterを作成している。

`~/baremetal/bmctl-workspace/foo-anthos-cluster/.kindkubeconfig`ファイルを指定することにより、ブートストラップClusterのkube-apiserverにリクエストを送信できる。

```bash
$ kubectl get pod \
    -n foo-namespace \
    --kubeconfig ~/baremetal/bmctl-workspace/.kindkubeconfig
```

<br>

## 02-03. on-GCP

### on-GCPの仕組み

GCP環境上にAnthos GKE Clusterを作成する。

<br>

## 02-04. on-クラウドプロバイダー

### on-クラウドプロバイダーの仕組み

GCPのAPIを介して、他のクラウドプロバイダー (例：AWS、Azure) のAPIをコールし、クラウドプロバイダー上にAnthos GKE Clusterを作成する。

ただし他のクラウドプロバイダーでは、専用Kubernetes実行環境 (例：AWS EKS、GCP GKE、Azure AKS、など) を使用すれば良いため、GCP環境、オンプレミス環境、ベアメタル環境、でAnthosを使用することが多い。

![anthos_on_cloud-provider](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_cloud-provider.png)

<br>

## 03. bmctlコマンド

### check preflight

#### ▼ check preflightとは

`bmctl upgrade`コマンドの実行時に実施されるプリフライトチェックのみを実施する。

```bash
$ ~/baremetal/bmctl check preflight -c foo-anthos-cluster -n foo-namespace
```

### update

#### ▼ updateとは

CRDの設定値を変更し、kube-apiserverに送信する。

```bash
$ ~/baremetal/bmctl update cluster -c foo-anthos-cluster -n foo-namespace
```

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/1.11/how-to/application-logging-monitoring#enabling_and_for_user_applications

<br>

### upgrade

#### ▼ upgradeとは

AnthosのKubernetesのバージョンをプリフライトチェックで検証し、成功すればアップグレードする。

```bash
$ ~/baremetal/bmctl upgrade cluster -c foo-anthos-cluster -n foo-namespace
```

#### ▼ --reuse-bootstrap-cluster

既存のブートストラップClusterを再利用することにより、プリフライトチェックの一部をスキップし、成功すればアップグレードする。

```bash
$ ~/baremetal/bmctl upgrade cluster -c foo-anthos-cluster -n foo-namespace --reuse-bootstrap-cluster
```

<br>
