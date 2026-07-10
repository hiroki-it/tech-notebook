---
title: 【IT技術の知見】Anthos＠Google Cloud Google Cloudリソース
description: Anthos＠Google Cloudリソースの知見を記録しています。
---

# Anthos＠Google Cloudリソース

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Anthos

### Anthosの仕組み

#### ▼ アーキテクチャ

Anthos は、Google Anthos GKE Cluster、Google Anthos Service Mesh、Google Anthos Config Management、といったコンポーネントから構成される。

> - https://www.fsi.co.jp/blog/5939/
> - https://cloud.google.com/anthos/clusters/docs/multi-cloud/aws/concepts/architecture

<br>

### Google Anthos GKE Cluster

#### ▼ Google Anthos GKE Clusterとは

Google GKE Cluster (コントロールプレーン Node、ワーカーNode を含む) から構成される。

#### ▼ アタッチCluster

Anthos の Google GKE Cluster 部分の能力を、Kubernetes のほかの実行環境 (Amazon EKS、Azure AKS、RKE、K3S や K3D) の Cluster に委譲する。

Anthos の Kubernetes のバージョンは、各実行環境の Cluster が対応する Kubernetes のバージョンに依存する。

![anthos_attached_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_attached_cluster.png)

> - https://cloud.google.com/anthos/clusters/docs/multi-cloud/attached/previous-generation/how-to/attach-kubernetes-clusters
> - https://cloud.google.com/blog/ja/topics/anthos/getting-to-know-anthos-attached-clusters
> - https://cloud.google.com/anthos/clusters/docs/attached/how-to/attach-kubernetes-clusters
> - https://www.jetstack.io/blog/anthos-attached-clusters/

#### ▼ Anthos、Kubernetesのバージョンの対応

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support#version-support

<br>

### Google Anthos Service Mesh

#### ▼ Google Anthos Service Meshとは

Traffic Director、Mesh CA、Managed backends、といったコンポーネントから構成される。

![anthos_service_mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_service_mesh.png)

> - https://cloudsolutions.academy/how-to/anthos-in-a-nutshell/introducing-anthos/service-management/
> - https://lp.cloudplatformonline.com/rs/808-GJW-314/images/App_Modernization_Session_06.pdf#page=20

#### ▼ Traffic Director

サービス検出として、istio-proxy に他の宛先の情報を提供する。

> - https://lp.cloudplatformonline.com/rs/808-GJW-314/images/App_Modernization_Session_06.pdf#page=23

#### ▼ Mesh CA

中間認証局として、相互 TLS 認証のためのサーバー証明書を istio-proxy に提供する。

また、サーバー証明書が失効すれば更新する。

> - https://lp.cloudplatformonline.com/rs/808-GJW-314/images/App_Modernization_Session_06.pdf#page=27

<br>

### Google Anthos Config Management

#### ▼ Google Anthos Config Managementとは

一連の acm-operator (cluster-operator など) から構成される。

![anthos_config-management](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_config-management.png)

> - https://cloudsolutions.academy/how-to/anthos-in-a-nutshell/introducing-anthos/anthos-config-management-acm/

#### ▼ acm-operatorの仕組み

一連の acm-operator (cluster-operator など) は、組み合わさって動作する。

Git リポジトリで管理された ACM カスタムリソースの GitOps を実装する。

注意点として、サポートしているのは ACM カスタムリソースのみで、通常の Kubernetes リソースをデプロイできない。

![anthos_config-management_gitops](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_config-management_gitops.png)

> - https://cloud.google.com/anthos-config-management/docs/concepts/best-practices-for-policy-management-with-anthos-config-management
> - https://cloud.google.com/architecture/modern-cicd-anthos-reference-architecture
> - https://github.com/GoogleCloudPlatform/acm-policy-controller-library

#### ▼ cluster-operator

cluster-operator は、kube-apiserver を経由して、etcd に watch イベントを送信している。

Google Anthos GKE Cluster のバインディング情報が etcd に永続化されたことを検知した場合に、kube-apiserver を経由して、Google Anthos GKE Cluster 上の kubelet にカスタムリソースの作成をコールする。

Google Anthos GKE Cluster が Google Cloud 以外 (オンプレミス、ベアメタル、他クラウドプロバイダー) にある場合は、cluster-operator がこれらの API を経由して、Google Anthos GKE Cluster 上の kubelet をコールすることになる。

また kube-controller-manager は cluster-operator を反復的に実行する。

これにより、Google Anthos GKE Cluster は CRD の宣言通りに定期的に修復される (reconciliation ループ) 。

> - https://www.jetstack.io/blog/anthos-aws/

<br>

### その他

#### ▼ connect-gateway

Google Cloud 上で `kubectl` コマンドを実行して各クラウドプロバイダー上の Google Anthos GKE Cluster の kube-apiserver にリクエストを送信するときに、各クラウドプロバイダーごとの API の違いを吸収してくれる。

![anthos_connect-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_connect-gateway.png)

> - https://www.topgate.co.jp/anthos-gke#connect-gateway

#### ▼ fleet-workload-identity

Google Cloud 側の資格情報と、各クラウドプロバイダーの Anthos 内の ServiceAccount を紐付ける。

これにより、クラウドプロバイダー側でアカウントを作成する必要がない。

> - https://www.topgate.co.jp/anthos-gke#fleet-workload-identity

#### ▼ anetd

cni として、Cilium を使用して Google Anthos GKE Cluster のネットワークを作成する。

> - https://cloud.google.com/kubernetes-engine/docs/concepts/dataplane-v2#how_works

<br>

## 02. on-オンプレミス

### on-オンプレミスの仕組み

on-オンプレミスは、各 Cluster を作成するワークステーション (Cluster の作成後に削除される) 、コントロールプレーン Node の所属する管理 Cluster、ワーカーNode の所属するユーザーCluster、といったコンポーネントから構成される。

ワークステーションにて、Google Cloud の API を経由してオンプレミス (例：VMWare) の API をコールし、オンプレミス環境上に Google Anthos GKE Cluster を作成する。

Google Anthos GKE Cluster のライフサイクルも Google Cloud から管理できる。

![anthos_on_on-premises_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_on-premises_architecture.png)

> - https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/minimal-infrastructure

<br>

## 02-02. on-ベアメタル

### on-ベアメタルの仕組み

#### ▼ 複数Kubernetes Clusterタイプ

複数 Kubernetes Cluster タイプの on-ベアメタルは、ワークステーション (仮想サーバー) 、コントロールプレーン Node の所属する管理 Cluster、ワーカーNode の所属するユーザーCluster、`L4` (トランスポート層) のロードバランサーから構成される。

Google Cloud の API を経由して、ベアメタルプロバイダーの API をコールし、ベアメタル環境上に Google Anthos GKE Cluster を作成する。

Google Anthos GKE Cluster のライフサイクルも Google Cloud から管理できる。

![anthos_on_bare-metal_multi-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_bare-metal_multi-cluster.png)

> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

#### ▼ スタンドアローンClusterタイプ (ハイブリッドタイプ)

スタンドアローン Cluster タイプ (ハイブリッドタイプ) の on-ベアメタルは、ワークステーション (仮想サーバー) 、コントロールプレーン Node とワーカーNode の両方が所属するベアメタル Cluster、といったコンポーネントから構成される。

ワークステーションにて、Google Cloud の API を経由してベアメタルプロバイダーの API をコールし、ベアメタル環境上に Google Anthos GKE Cluster を作成する。

Google Anthos GKE Cluster のライフサイクルも Google Cloud から管理できる。

![anthos_on_bare-metal_standalone-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_bare-metal_standalone-cluster.png)

> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

<br>

### ワークステーション

#### ▼ ワークステーションとは

Google Anthos Cluster の作成時やアップグレード時に、`bmctl` コマンドはワークステーション (仮想サーバー) を構築し、ワークステーション上で Kind を起動する。

ベアメタルであるため、自前で仮想サーバー (例：VMware) を作成する必要がある。

Kind はコンテナを構築し、そのコンテナ内でブートストラップ Cluster を作成できるか否かを検証することにより、Google Anthos Cluster の事前検証する。

Kind がコンテナを構築するために、Google Anthos Cluster の構築前に、`docker` プロセスを起動しておく必要がある。

```bash
$ systemctl start docker
```

#### ▼ ブートストラップCluster

Kind がコンテナ内で作成する仮想的な Google Anthos Cluster のこと。

VCluster を使用して、仮想的な Google Anthos Cluster を作成している。

`~/baremetal/bmctl-workspace/foo-anthos-cluster/.kindkubeconfig` ファイルを指定することにより、ブートストラップ Cluster の kube-apiserver にリクエストを送信できる。

```bash
$ kubectl get pod \
    -n foo-namespace \
    --kubeconfig ~/baremetal/bmctl-workspace/.kindkubeconfig
```

<br>

## 02-03. on-Google Cloud

### on-Google Cloudの仕組み

Google Cloud 環境上に Google Anthos GKE Cluster を作成する。

<br>

## 02-04. on-クラウドプロバイダー

### on-クラウドプロバイダーの仕組み

Google Cloud の API を経由して、他のクラウドプロバイダー (例：AWS、Azure) の API をコールし、クラウドプロバイダー上に Google Anthos GKE Cluster を作成する。

ただし他のクラウドプロバイダーでは、専用 Kubernetes 実行環境 (例：Amazon EKS、Google Cloud GKE、Azure AKS など) を使用すればよいため、Google Cloud 環境、オンプレミス環境、ベアメタル環境、で Anthos を使用することが多い。

![anthos_on_cloud-provider](https://raw.githubusercontent.com/hiroki-it/tech-notebook-images/master/images/anthos_on_cloud-provider.png)

<br>

## 03. bmctlコマンド

### check preflight

#### ▼ check preflightとは

`bmctl upgrade` コマンドの実行時に実施されるプリフライトチェックのみを実施する。

```bash
$ ~/baremetal/bmctl check preflight -c foo-anthos-cluster -n foo-namespace
```

### update

#### ▼ updateとは

CRD の設定値を変更し、kube-apiserver に送信する。

```bash
$ ~/baremetal/bmctl update cluster -c foo-anthos-cluster -n foo-namespace
```

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/1.11/how-to/application-logging-monitoring#enabling_and_for_user_applications

<br>

### upgrade

#### ▼ upgradeとは

Anthos の Kubernetes のバージョンをプリフライトチェックで検証し、成功すればアップグレードする。

```bash
$ ~/baremetal/bmctl upgrade cluster -c foo-anthos-cluster -n foo-namespace
```

#### ▼ --reuse-bootstrap-cluster

既存のブートストラップ Cluster を再利用することにより、プリフライトチェックの一部をスキップし、成功すればアップグレードする。

```bash
$ ~/baremetal/bmctl upgrade cluster -c foo-anthos-cluster -n foo-namespace --reuse-bootstrap-cluster
```

<br>
