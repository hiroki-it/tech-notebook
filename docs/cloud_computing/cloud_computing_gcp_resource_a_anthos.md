---
title: 【IT技術の知見】Anthos＠GCP
description: Anthos＠GCPの知見を記録しています。
---

# Anthos＠GCP

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. Anthos

### Anthosの仕組み

#### ▼ 構造

Anthosは、Anthos GKE Cluster、Anthos Service Mesh、Anthos Config Management、から構成される。

> ℹ️ 参考：
>
> - https://www.fsi.co.jp/blog/5939/
> - https://cloud.google.com/anthos/clusters/docs/multi-cloud/aws/concepts/architecture

<br>

### Anthos GKE Cluster

#### ▼ Anthos GKE Clusterとは

GKE Cluster（コントロールプレーンNode、ワーカーNode、を含む）から構成される。

#### ▼ attached-cluster

![anthos_attached_cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_attached_cluster.png)

Anthos GKE Clusterの能力を外部のクラウドプロバイダーのClusterに委譲する。例えば、AWSで稼働するAnthos GKE Clusterの機能がEKS Clusterに委譲される。AnthosのKubernetesのバージョンは、各クラウドプロバイダーのClusterが対応するKubernetesのバージョンに依存する。

> ℹ️ 参考：
>
> - https://cloud.google.com/blog/ja/topics/anthos/getting-to-know-anthos-attached-clusters
> - https://cloud.google.com/anthos/clusters/docs/attached/how-to/attach-kubernetes-clusters
> - https://www.jetstack.io/blog/anthos-attached-clusters/

| Clusterの種類 | Kubernetesバージョン               |
| ------------ | --------------------------------- |
| Amazon EKS    | ```1.20```、```1.21```、```1.22```、... |
| Microsoft AKS | ```1.21```、```1.22```、```1.23```、... |

<br>

### Anthos Service Mesh

#### ▼ Anthos Service Meshとは

Istioから構成される。

> ℹ️ 参考：https://cloudsolutions.academy/how-to/anthos-in-a-nutshell/introducing-anthos/service-management/

![anthos_service_mesh](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_service_mesh.png)

<br>

### Anthos Config Management

#### ▼ Anthos Config Managementとは

一連のacm-operator（cluster-operator、など）から構成される。

> ℹ️ 参考：https://cloudsolutions.academy/how-to/anthos-in-a-nutshell/introducing-anthos/anthos-config-management-acm/

![anthos_config-management](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_config-management.png)

#### ▼ acm-operatorの仕組み

一連のacm-operator（cluster-operator、など）は、組み合わさって動作する。Gitリポジトリで管理されたACMカスタムリソースのGitOpsを実現する。

![anthos_config-management_gitops](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_config-management_gitops.png)

> ℹ️ 参考：
>
> - https://cloud.google.com/anthos-config-management/docs/concepts/best-practices-for-policy-management-with-anthos-config-management?hl=ja
> - https://cloud.google.com/architecture/modern-cicd-anthos-reference-architecture
> - https://github.com/GoogleCloudPlatform/acm-policy-controller-library


#### ▼ cluster-operator

cluster-operatorは、kube-apiserverを介して、etcdにwatchイベントを送信している。Anthos GKE Clusterのバインディング情報がetcdに永続化されたことを検知した場合に、kube-apiserverを介して、Anthos GKE Cluster上のkubeletにカスタムリソースの作成をコールする。Anthos GKE Clusterが、GCP以外（オンプレミス、ベアメタル、他クラウドプロバイダー）にある場合は、cluster-operatorは、これらのAPIを介してAnthos GKE Cluster上のkubeletをコールすることになる。またkube-controller-managerはcluster-operatorを反復的に実行する。これにより、Anthos GKE Clusterはカスタムリソース定義の宣言通りに定期的に修復される（reconciliationループ）。

> ℹ️ 参考：https://www.jetstack.io/blog/anthos-aws/

<br>

### その他

#### ▼ connect-gateway

GCP上で```kubectl```コマンドを実行して各クラウドプロバイダー上のAnthos GKE Clusterのkube-apiserverにリクエストを送信する時に、各クラウドプロバイダーごとのAPIの違いを吸収してくれる。

> ℹ️ 参考：https://www.topgate.co.jp/anthos-gke#connect-gateway

![anthos_connect-gateway](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_connect-gateway.png)

#### ▼ fleet-workload-identity

GCP側のアカウント情報と、各クラウドプロバイダーのAnthos Cluster内のServiceAccountを紐づける。これにより、クラウドプロバイダー側でアカウントを作成する必要がない。

> ℹ️ 参考：https://www.topgate.co.jp/anthos-gke#fleet-workload-identity

<br>

## 02. on-オンプレミス

### on-オンプレミスの仕組み

![anthos_on_on-premises_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_on-premises_architecture.png)

on-オンプレミスは、各Clusterを作成するワークステーション（Clusterの作成後に削除される）、コントロールプレーンNodeの属する管理Cluster、ワーカーNodeの属するユーザーCluster、から構成される。GCPのAPIを介して、オンプレミス（例：VMWare）のAPIをコールし、オンプレミス環境上にAnthos GKE Clusterを作成する。Anthos GKE ClusterのライフサイクルもGCPから管理できる。

> ℹ️ 参考：https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/minimal-infrastructure?hl=ja

<br>

## 02-02. on-ベアメタル

### on-ベアメタルの仕組み

#### ▼ マルチClusterタイプ

![anthos_on_bare-metal_multi-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_bare-metal_multi-cluster.png)

マルチClusterタイプのon-ベアメタルは、各Clusterを作成するKind製ワークステーション（Clusterの作成後に削除される）、コントロールプレーンNodeの属する管理Cluster、ワーカーNodeの属するユーザーCluster、```L4```（トランスポート層）のロードバランサーから構成される。GCPのAPIを介して、ベアメタルプロバイダーのAPIをコールし、ベアメタル環境上にAnthos GKE Clusterを作成する。Anthos GKE ClusterのライフサイクルもGCPから管理できる。

> ℹ️ 参考：
>
> - https://itnext.io/anthos-on-bare-metal-and-akri-managing-leaf-devices-on-edge-kubernetes-clusters-from-cloud-222ff17dd7b8
> - https://medium.com/google-cloud-jp/%E7%B0%A1%E5%8D%98%E6%A7%8B%E7%AF%89-nuc-%E3%81%A7%E3%81%8A%E3%81%86%E3%81%A1-anthos-%E3%82%92%E5%8B%95%E3%81%8B%E3%81%97%E3%81%A6%E3%81%BF%E3%82%88%E3%81%86-682e95112116

#### ▼ スタンドアローンClusterタイプ（ハイブリッドタイプ）

![anthos_on_bare-metal_standalone-cluster](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_bare-metal_standalone-cluster.png)

スタンドアローンClusterタイプ（ハイブリッドタイプ）のon-ベアメタルは、各Clusterを作成するKind製ワークステーション（Clusterの作成後に削除される）、コントロールプレーンNodeとワーカーNodeの両方が属するベアメタルCluster、から構成される。GCPのAPIを介して、ベアメタルプロバイダーのAPIをコールし、ベアメタル環境上にAnthos GKE Clusterを作成する。Anthos GKE ClusterのライフサイクルもGCPから管理できる。

> ℹ️ 参考：
>
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

![anthos_on_cloud-provider](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/anthos_on_cloud-provider.png)

<br>

## bmctlコマンド

### update

カスタムリソース定義の設定値を変更し、kube-apiserverに送信する。

https://cloud.google.com/anthos/clusters/docs/bare-metal/1.11/how-to/application-logging-monitoring#enabling_and_for_user_applications

```bash
$ bmctl update cluster -c <Cluster名> --admin-kubeconfig=<kubeconfigファイル>
```

<br>

## 04. アップグレード

### Kubernetesのアップグレード

#### ▼ オンプレミス環境の場合

> ℹ️ 参考：https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/upgrading

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

> ℹ️ 参考：https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support

| Anthos GKE Clusterのバージョン | Kubernetesのバージョン  |
|----------------------|-------------------|
| ``` 1.11```系         | ```v1.22.8-gke``` |
| ```1.12```系          | ```v1.23.5-gke``` |
| ...                  | ...               |

（２）```bmctl```コマンドを使用して、Anthos GKE Clusterをローリング方式でアップグレードする。また、ログの出力先が表示されるので、このログを```tail```コマンドで確認する。

> ℹ️ 参考：
> 
> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/how-to/upgrade
> - https://cloud.google.com/blog/topics/anthos/best-practices-for-upgrading-anthos-on-bare-metal

```bash
# コマンドをインストールする。
$ gsutil cp gs://anthos-baremetal-release/bmctl/1.12.1/linux-amd64/bmctl bmctl
$ chmod a+x bmctl

# アップグレードする。
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

（１）```asmcli```コマンドを使用して、新バージョンのIstiodコントロールプレーンをインストールする。

> ℹ️ 参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_with_optional_features

```bash
$ ./asmcli install \
    --project_id <プロジェクトID> \
    --cluster_name <Cluster名> \
    --cluster_location <リージョン> \
    --fleet_id <フリートのグループID> \
    --output_dir ./tmp \
    --enable_all \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェスト>
```

#### ▼ GCP環境以外（オンプレミス環境、ベアメタル環境、他のクラウドプロバイダー環境）の場合

（１）```asmcli```コマンドを使用して、新バージョンのIstiodコントロールプレーンをインストールする。

> ℹ️ 参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#outside-google-cloud

```bash
$ ./asmcli install \
    --kubeconfig <kubeconfigファイルの場所> \
    --platform multicloud \
    --fleet_id <フリートのグループID> \
    --output_dir ./tmp \
    --enable_all \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェスト>
```

#### ▼ 共通の事後処理

データプレーンが新バージョンのIstiodコントロールプレーンに紐づくようにする。

> ℹ️ 参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#switch_to_the_new_control_plane

（１）Istiodコントロールプレーンの新バージョンの```istio.io/rev```キーの値を取得する。

```bash
$ kubectl get pod -n istio-system -l istio.io/rev

NAME                       READY   STATUS    RESTARTS   AGE   REV
istiod-asm-1137-1-*****    1/1     Running   0          68m   asm-1137-0 # 旧バージョンのリビジョン番号
istiod-asm-1137-1-*****    1/1     Running   0          68m   asm-1137-0
istiod-asm-1141-1-*****    1/1     Running   0          27s   asm-1143-1 # 新バージョンのリビジョン番号
istiod-asm-1141-1-*****    1/1     Running   0          27s   asm-1143-1
```

（２）```istio.io/rev```キーが設定されている全てのNamespaceを確認する。

```bash
$ kubectl get namespace -L istio.io/rev
```

（３）Istioの```istio.io/rev```キーを使用して```istio-proxy```コンテナを注入するために、Namespaceの既存の```istio-injection```キーを上書きする。これらのキーはコンフリクトを発生させるため、どちらか一方しか使用できず、Anthosでは```istio.io/rev```キーを推奨している。

```bash
# 新バージョンのリビジョン番号：asm-1143-1
$ kubectl label namespace foo-namespace istio.io/rev=<新バージョンのリビジョン番号> istio-injection- --overwrite
```

（４）Podを再スケジューリングし、新バージョンの```istio-proxy```コンテナを自動的に注入する。

```bash
$ kubectl rollout restart deployment foo-deployment -n foo-namespace
```

（５）新バージョンの```istio-proxy```コンテナが注入されたことを、イメージタグから確認する。

```bash
# 新バージョンのリビジョン番号：asm-1143-1
$ kubectl get pod \
    -n foo-namespace \
    -o jsonpath={.items[*].spec.containers[*].image} | sed 's/ /\n/g' && echo

gcr.io/gke-release/asm/proxyv2:<新バージョンのリビジョン番号>-asm.1
```

（６）webhookサーバーにポートフォワーディングするためのServiceの設定を更新する。

```bash
$ kubectl apply -f ./asm/istio/istiod-service.yaml
```
```yaml
apiVersion: v1
kind: Service
metadata:
  name: istiod
  namespace: istio-system
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: asm-1143-1
    release: istio
spec:
  ports:
    - name: https-webhook
      port: 443
      protocol: TCP
      targetPort: 15017
    - name: grpc-xds 
      port: 15010
      protocol: TCP
      targetPort: 15010
    - name: https-dns 
      port: 15012
      protocol: TCP
      targetPort: 15012
    - name: http-monitoring
      port: 15014
      protocol: TCP
      targetPort: 15014
  selector:
    app: istiod
    istio.io/rev: asm-1143-1
```

（７）MutatingWebhookConfigurationの```metadata.labels```キーにあるエイリアスの実体が旧バージョンのままなので、新バージョンに変更する。


```bash
# 新バージョンのリビジョン番号：asm-1143-1
$ ./tmp/istioctl tag set default --revision <新バージョンのリビジョン番号>

$ ./tmp/istioctl tag list

TAG     REVISION   NAMESPACES
default asm-1143-1 
```

（８）旧バージョンのIstiodコントロールプレーン（実体は、Service、Deployment、HorizontalPodAutoscaler、PodDisruptionBudget）を削除する。


```bash
# 旧バージョンのリビジョン番号：asm-1137-0
$ kubectl delete Service,Deployment,HorizontalPodAutoscaler,PodDisruptionBudget istiod-<旧バージョンのリビジョン番号> -n istio-system --ignore-not-found=true
```

（９）旧バージョンのIstioOperatorを削除する。

```bash
# 旧バージョンのリビジョン番号：asm-1137-0
$ kubectl delete IstioOperator installed-state-<旧バージョンのリビジョン番号> -n istio-system
```

（１０）全てのPodが正常に稼働していることを確認する。

```bash
$ kubectl get pod -A -o wide
```

<br>
