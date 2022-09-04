---
title: 【IT技術の知見】Anthos＠GCP
description: Anthos＠GCPの知見を記録しています。
---

# Anthos＠GCP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html


<br>


## 01. Anthos

### Anthosの仕組み

#### ▼ 構造


Anthosは、クラスタ管理コンポーネント、サービス管理コンポーネント、ポリシー管理コンポーネント、から構成される。


> ℹ️ 参考：

> - https://future-architect.github.io/articles/20210319/
> - https://cloud.google.com/anthos/clusters/docs/multi-cloud/aws/concepts/architecture

#### ▼ クラスタ管理コンポーネント

GKEのコントロールプレーン、Nodeプール、から構成される。

#### ▼ サービス管理コンポーネント

Istioのサービスメッシュから構成される。サービスメッシュのコントロールプレーンはマネージドである。

#### ▼ ポリシー管理コンポーネント

Kubernetesの設定値を保持する。

<br>

### CI/CDパイプライン

> ℹ️ 参考：https://cloud.google.com/architecture/modern-cicd-anthos-reference-architecture

<br>

### アタッチCluster

Anthos GKE Clusterの機能を外部のクラウドプロバイダーのClusterに委譲する。例えば、AWSで稼働するAnthos GKE Cluster機能がEKS Clusterに委譲される。AnthosのKubernetesのバージョンは、各クラウドプロバイダーのClusterが対応するKubernetesのバージョンに依存する。

> ℹ️ 参考：

> - https://cloud.google.com/blog/ja/topics/anthos/getting-to-know-anthos-attached-clusters
> - https://cloud.google.com/anthos/clusters/docs/attached/how-to/attach-kubernetes-clusters

| Clusterの種類 | Kubernetesバージョン |
| :------------ | :------------------- |
| Amazon EKS    | 1.20, 1.21, 1.22     |
| Microsoft AKS | 1.21, 1.22, 1.23     |

<br>

### Connect Gateway

GCP上で```kubectl```コマンドを実行し、各クラウドプロバイダー上のAnthos内のkube-apiserverにリクエストを送信する時に、各クラウドプロバイダーごとのAPIの違いを吸収してくれる。

<br>

### Fleet workload identity

GCP側のアカウント情報と、各クラウドプロバイダーのAnthos Cluster内のサービスアカウントを紐づける。これにより、クラウドプロバイダー側でアカウントを作成する必要がない。

<br>

## 01-02. セットアップ

クラスタ、スケーリング、ノード修復、リージョン別クラスタ、柔軟なメンテナンス、セキュリティ、アップグレードの支援、バックアップ、ロードバランサー、セットアップ済み。


<br>

## 02. on-オンプレミス

### on-オンプレミスの仕組み

![anthos_on_on-premises_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_on-premises_architecture.png)

on-オンプレミスは、```kubectl```コマンドの実行環境となるワークステーション、マスターNodeの属する管理Cluster、ワーカーNodeの属するユーザーCluster、から構成される。GCPのAPIを介して、オンプレミス（例：VMWare）のAPIをコールし、オンプレミス環境上にAnthos GKE Clusterを作成する。Anthos GKE ClusterのライフサイクルもGCPから管理できる。

参考：https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/minimal-infrastructure?hl=ja

<br>

## 02-02. on-ベアメタル

### on-ベアメタルの仕組み

#### ▼ マルチClusterタイプ

![anthos_on_bare-metal_multi-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_bare-metal_multi-cluster.png)

マルチClusterタイプのon-ベアメタルは、```kubectl```コマンドの実行環境となるKind製ワークステーション、マスターNodeの属する管理Cluster、ワーカーNodeの属するユーザーCluster、```L4```のロードバランサーから構成される。GCPのAPIを介して、ベアメタルプロバイダーのAPIをコールし、ベアメタル環境上にAnthos GKE Clusterを作成する。Anthos GKE ClusterのライフサイクルもGCPから管理できる。

参考：

> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

#### ▼ スタンドアローンClusterタイプ

![anthos_on_bare-metal_standalone-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_bare-metal_standalone-cluster.png)

マルチClusterタイプのon-ベアメタルは、```kubectl```コマンドの実行環境となるKind製ワークステーション、マスターNodeとワーカーNodeの両方が属するベアメタルCluster、から構成される。GCPのAPIを介して、ベアメタルプロバイダーのAPIをコールし、ベアメタル環境上にAnthos GKE Clusterを作成する。Anthos GKE ClusterのライフサイクルもGCPから管理できる。

参考：

> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

<br>

## 02-03. on-GCP

### on-GCPの仕組み

GCP環境上にAnthos GKE Clusterを作成する。

<br>

## 02-04. on-クラウドプロバイダー

### on-クラウドプロバイダーの仕組み

GCPのAPIを介して、他のクラウドプロバイダー（例：AWS、Azure）のAPIをコールし、クラウドプロバイダー環境上にAnthos GKE Clusterを作成する。ただし他のクラウドプロバイダー環境では、専用Kubernetes実行環境（例：EKS、AKS）を使用すれば良いため、GCP環境、オンプレミス環境、ベアメタル環境、でAnthosを使用することが多い。

![anthos_on_aws_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_aws_architecture.png)


<br>

## 03. アップグレード

### Kubernetesのアップグレード

#### ▼ オンプレミス環境の場合

参考：https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/upgrading

#### ▼ ベアメタル環境の場合

（１）Anthos GKE Clusterの現在のバージョンを確認する。

```bash
$ kubectl get cluster -A -o yaml

apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-cluster
  namespace: foo
spec:
  anthosBareMetalVersion: 1.12.0 # 現在のバージョン
...
```

また、Anthos GKE ClusterのバージョンとKubernetesのバージョンの対応関係を確認する。

参考：https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support

| Anthos GKE Clusterのバージョン | Kubernetesのバージョン  |
|----------------------|-------------------|
| ``` 1.11```系         | ```v1.22.8-gke``` |
| ```1.12```系          | ```v1.23.5-gke``` |
| ...                  | ...               |

（２）```bmctl```コマンドを使用して、Anthos GKE Clusterをアップグレードする。

参考：https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/how-to/upgrade

```bash
$ gsutil cp gs://anthos-baremetal-release/bmctl/1.12.1/linux-amd64/bmctl bmctl
$ chmod a+x bmctl

$ bmctl upgrade cluster \
    -c <Cluster名> \
    --kubeconfig <kubeconfigファイルの場所>
```

（３）Anthos GKE Clusterのバージョンがアップグレードされたことを確認する。

```bash
$ kubectl get cluster -A -o yaml

apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-cluster
  namespace: foo
spec:
  anthosBareMetalVersion: 1.12.1 # 新バージョン
...
```

<br>

### Istioのアップグレード

#### ▼ GCP環境の場合

（１）```asmcli```コマンドを使用し、新バージョンのIstiodコントロールプレーンをインストールする。

参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_with_optional_features

```bash
$ ./asmcli install \
    --project_id <プロジェクトID> \
    --cluster_name <Cluster名> \
    --cluster_location <リージョン> \
    --fleet_id <フリートのグループID> \
    --output_dir ./tmp \
    --enable_all \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェストファイル>
```

#### ▼ GCP環境以外（オンプレミス環境、ベアメタル環境、他のクラウドプロバイダー環境）の場合

（１）```asmcli```コマンドを使用し、新バージョンのIstiodコントロールプレーンをインストールする。

参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#outside-google-cloud

```bash
$ ./asmcli install \
    --kubeconfig <kubeconfigファイルの場所> \
    --platform multicloud \
    --fleet_id <フリートのグループID> \
    --output_dir ./tmp \
    --enable_all \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェストファイル>
```

#### ▼ 共通の事後処理

データプレーンが新バージョンのIstiodコントロールプレーンに紐づくようにする。

参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#switch_to_the_new_control_plane

（１）Istiodコントロールプレーンの新バージョンのリビジョン値を取得する。

```bash
$ kubectl get pod -n istio-system -L istio.io/rev

NAME                       READY   STATUS    RESTARTS   AGE   REV
istiod-asm-1143-1-*****    1/1     Running   0          68m   asm-1137-0 # 旧バージョンのリビジョン番号
istiod-asm-1143-1-*****    1/1     Running   0          68m   asm-1137-0
istiod-1141-3-1-*****      1/1     Running   0          27s   asm-1143-1 # 新バージョンのリビジョン番号
istiod-1141-3-1-*****      1/1     Running   0          27s   asm-1143-1
```

（２）Istioの```istio.io/rev```ラベルを使用して```istio-proxy```コンテナを注入するために、Namespaceの既存の```istio-injection```ラベルを削除する。これらのラベルはコンフリクトを起こすため、どちらか一方しか使用できず、Anthosでは```istio.io/rev```ラベルを推奨している。

```bash
# 新バージョンのリビジョン番号：asm-1143-1
$ kubectl label namespace foo-namespace istio.io/rev=<新バージョンのリビジョン番号> istio-injection- --overwrite
```

（３）Podを再作成し、新バージョンの```istio-proxy```コンテナを自動的に注入する。

```bash
$ kubectl rollout restart deployment -n foo-namespace
```

（４）新バージョンの```istio-proxy```コンテナが注入されたことを、イメージタグから確認する。

```bash
# 新バージョンのリビジョン番号：asm-1143-1
$ kubectl get pod -n foo-namespace -o jsonpath={.items[*].spec.containers[*].image}

gcr.io/gke-release/asm/proxyv2:<新バージョンのリビジョン番号>-asm.1
```

（５）ValidatingWebhookConfigurationをアップグレードする。

```bash
$ kubectl apply -f ./asm/istio/istiod-service.yaml
```

（６）```default```というラベル値が旧バージョンのエイリアスのままなので、新バージョンのリビジョン番号のエイリアスに変更する。


```bash
# 新バージョンのリビジョン番号：asm-1143-1
$ ./tmp/istioctl tag set default --revision <新バージョンのリビジョン番号>
```

（７）旧バージョンのIstiodコントロールプレーン（実体は、Service、Deployment、HorizontalPodAutoscaler、PodDisruptionBudget）を削除する。


```bash
# 旧バージョンのリビジョン番号：asm-1137-0
$ kubectl delete Service,Deployment,HorizontalPodAutoscaler,PodDisruptionBudget istiod-<旧バージョンのリビジョン番号> -n istio-system --ignore-not-found=true
```

（８）旧バージョンのIstioOperatorを削除する。

```bash
# 旧バージョンのリビジョン番号：asm-1137-0
$ kubectl delete IstioOperator installed-state-<旧バージョンのリビジョン番号> -n istio-system
```

（９）全てのPodが正常に稼働していることを確認する。

```bash
$ kubectl get pod -A -o wide
```

<br>
