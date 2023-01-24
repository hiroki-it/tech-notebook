---
title: 【IT技術の知見】アップグレード＠Anthos
description: アップグレード＠Anthosの知見を記録しています。
---

# アップグレード＠Anthos

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. Kubernetesのアップグレード

### 共通の手順


（１）```bmctl```コマンドをインストールする。Anthos GKE Clusterと```bmctl```コマンドのバージョンには対応関係がある。

```bash
$ gsutil cp gs://anthos-baremetal-release/bmctl/1.13.2/linux-amd64/bmctl bmctl-1.12.0
$ chmod a+x bmctl-1.12.0
```

<br>

### オンプレミス環境の場合

> ℹ️ 参考：https://cloud.google.com/anthos/clusters/docs/on-prem/latest/how-to/upgrading

<br>

### ベアメタル環境の場合

（１）共通の手順を参照。

（２）Anthos GKE Clusterの現在のバージョンを確認する。

```bash
$ kubectl get cluster -A -o yaml

apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-anthos-cluster
  namespace: foo-namespace
spec:
  anthosBareMetalVersion: 1.12.0 # 現在のバージョン
...
```

また、Anthos GKE ClusterのバージョンとKubernetesのバージョンの対応関係を確認する。




| Anthos GKE Clusterのバージョン | Kubernetesのバージョン  |
|--------------------------|-------------------|
| ``` 1.11```系            | ```v1.22.8-gke``` |
| ```1.12```系             | ```v1.23.5-gke``` |
| ...                      | ...               |

> ℹ️ 参考：https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support


（３）```docker```プロセスが起動しているかを確認する。Anthosのアップグレードの仕組みの中でKindが使われている。 ワークステーション（仮想サーバー）上でKindを起動し、Kindを使用してAnthos K8s in Dockerを検証する。Kindによる検証のために、dockerが必要である。dockerプロセスのデーモンが正常なことを確認する。

```bash
$ systemctl status docker
```

（４）```bmctl```コマンドを使用して、Anthos GKE Clusterをローリング方式でアップグレードする。また、ログの出力先が表示されるため、このログを```tail```コマンドで確認する。


```bash
# カレントディレクトリは、baremetalである必要がある。
$ pwd
baremetal

$ ~/baremetal/bmctl upgrade cluster \
    -c <Cluster名> \
    --kubeconfig <kubeconfigファイルへのパス>
```

> ℹ️ 参考：
>
> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/how-to/upgrade
> - https://cloud.google.com/blog/topics/anthos/best-practices-for-upgrading-anthos-on-bare-metal

（５）ログの出力先が表示されるので、```tail```コマンドで確認する。

```bash
$ tail -f ~/baremetal/<ログの出力先>
```

（６）アップグレードが始まる。コントロールプレーンコンポーネントやNodeコンポーネントからエラーが発生するため、アラートで確認する。

（７）アップグレードが終了する。Anthos GKE Clusterのバージョンがアップグレードされたことを確認する。

```bash
$ kubectl get cluster -A -o yaml

apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-anthos-cluster
  namespace: foo-namespace
spec:
  anthosBareMetalVersion: 1.12.1 # 新バージョン
...
```

（８）各NodeのKubernetesのバージョンが新しくなったことを確認する

```bash
$ kubectl get node -o wide
```

> ℹ️ 参考：https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support#version-support

（９）Crash、Terminating、Error、などのPodがいないかを確認する。

```bash
$ kubectlget pod -A -o wide
```

<br>

## 02. Istioのアップグレード

### 共通の事前手順

（１）```asmcli```コマンドをインストールする。アップグレード先のバージョン系の指定するようにする。

```bash
$ curl https://storage.googleapis.com/csm-artifacts/asm/asmcli_1.14 > asmcli-1.14
```

> ℹ️ 参考：https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_anthos_service_mesh

<br>

### GCP環境の場合

#### ▼ 新しいIstiodをインストール

（１）共通の事前手順を参照。


（２）新しいIstiodをインストールする。```asmcli```コマンドを使用して、旧バージョンを残しつつ、新バージョンのIstiodコントロールプレーンをデプロイする。ここでは、Istioの```v1.13```から```v1.14```にアップグレードするとする。


```bash
$ ./asmcli-1.14 install \
    --project_id <プロジェクトID> \
    --cluster_name <Cluster名> \
    --cluster_location <リージョン> \
    --fleet_id <フリートのグループID> \
    --output_dir ./output/asm-1.14 \
    `# オプションを全て有効化する。` \
    --enable_all \
    `# Mesh CAを有効化する。` \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェスト>
```

> ℹ️ 参考：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/asmcli-overview?hl=ja#transitioning_from_install_asm
> - https://cloud.google.com/service-mesh/docs/unified-install/plan-upgrade?hl=ja#about_canary_upgrades
> - https://istio.io/latest/docs/setup/upgrade/canary/



<br>

### GCP環境以外（オンプレミス環境、ベアメタル環境、他のクラウドプロバイダー環境）の場合

#### ▼ 新しいIstiodをインストール

（１）新しいIstiodをインストールする。```asmcli```コマンドを使用して、旧バージョンを残しつつ、新バージョンのIstiodコントロールプレーンをデプロイする。

```bash
$ ./asmcli-1.14 install \
    --kubeconfig <kubeconfigファイルへのパス> \
    `# GCP以外（オンプレ、AWS、Azure、など）で稼働させることを宣言する。` \
    --platform multicloud \
    --fleet_id <フリートのグループID> \
    --output_dir ./output \
    `# オプションを全て有効化する。` \
    --enable_all \
    `# Mesh CAを有効化する。` \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェスト>
```

> ℹ️ 参考：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/asmcli-overview?hl=ja#transitioning_from_install_asm
> - https://cloud.google.com/service-mesh/docs/unified-install/plan-upgrade?hl=ja#about_canary_upgrades
> - https://istio.io/latest/docs/setup/upgrade/canary/


<br>

### 共通の事後手順

#### ▼ 新しいIstiodを確認

（２）Istiodコントロールプレーンがデプロイされたことを確認する。なお、```asmcli```コマンドでは、最新のパッチバージョンがインストールするため、狙ったバージョンをインストールできない可能性がある。

```bash
$ kubectl get all -n istio-system

# Deployment
NAME                READY   STATUS    RESTARTS   AGE
istiod-1.13.0         1/1     Running   0          1m  # 1.13.0
istiod-1.14.0         1/1     Running   0          1m  # 1.14.0（今回のアップグレード先）

# Service
NAME            TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                                                AGE
istiod-1.13     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m
istiod-1.14     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m # 新しい方
```

```bash
# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                   WEBHOOKS   AGE
istio-sidecar-injector-1.13.0          1          7m56s # 1.13.0
istio-sidecar-injector-1.14.0          1          7m56s # 1.14.0（今回のアップグレード先）
istio-revision-tag-default             1          3m18s # 現在のリビジョン番号（1.13.0）を定義するdefaultタグを持つ
```


> ℹ️ 参考：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_with_optional_features
> - https://cloud.google.com/service-mesh/docs/unified-install/asmcli-overview?hl=ja
> - https://istio.io/latest/docs/setup/upgrade/canary/#control-plane


#### ▼ Namespaceの```.metadata.labels```キーを付け替える。


（１）カナリア方式のため、Istiodコントロールプレーンの新バージョンの```istio.io/rev```キーの値を取得する。

```bash
$ kubectl get pod -n istio-system -l istio.io/rev

NAME                    READY   STATUS    RESTARTS   AGE   REV
istiod-asm-1130-*****    1/1     Running   0          68m   asm-1130 # 旧バージョン
istiod-asm-1130-*****    1/1     Running   0          68m   asm-1130
istiod-asm-1140-*****    1/1     Running   0          27s   asm-1140 # 今回のアップグレード先
istiod-asm-1140-*****    1/1     Running   0          27s   asm-1140
```

（２）```istio.io/rev```キーが設定されている全てのNamespaceを確認する。

```bash
$ kubectl get namespace ingress -L istio.io/rev
NAME       STATUS    AGE     REV
ingress    Active    2d18h   1130


$ kubectl get namespace app -o yaml

apiVersion: v1
kind: Namespace
metadata:
  name: istio-ingress
  labels:
    istio.io/rev: <リビジョン番号>
```

```bash
$ kubectl get namespace app -L istio.io/rev

NAME   STATUS    AGE     REV
app    Active    2d18h   1130


$ kubectl get namespace app -o yaml

apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio.io/rev: <リビジョン番号>
```

（３） Istioの```istio.io/rev```キーを使用して、Namespaceの既存の```istio-injection```キーを上書きする。多くの場合、```istio-proxy```コンテナはIngressGatewayとアプリケーションのPodのNamespaceにインジェクションしているはずである。そこで、それらのNamespaceを指定する。これらのキーはコンフリクトを発生させるため、どちらか一方しか使用できず、Anthosでは```istio.io/rev```キーを推奨している。もしGitOpsツール（例：ArgoCD）でNamespaceを管理している場合は、```kubectl label```コマンドの代わりに、GitHub上でリビジョン番号を変更することになる。


```bash
# IngressGatewayのNamespace
$ kubectl label namespace ingress istio.io/rev=asm-1140 istio-injection- --overwrite

# マイクロサービスのNamespace
$ kubectl label namespace app istio.io/rev=asm-1140 istio-injection- --overwrite
```

（４）新しいラベルに変更できたことに変更できたことを確認する。

```bash
$ kubectl get namespace -L istio.io/rev
```

> ℹ️ 参考：
> 
> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_gateways
> - https://cloud.google.com/service-mesh/docs/gateways#in-cluster_control_plane

#### ▼ IngressGatewayの```istio-proxy```コンテナをアップグレード

（４）IngressGatewayのPodを再スケジューリングし、新バージョンの```istio-proxy```コンテナを自動的にインジェクションする。カナリア方式のため、webhook-serviceがそのままで新しい```istio-proxy```コンテナをインジェクションできる。

```bash
$ kubectl rollout restart deployment istio-ingressgateway -n istio-ingress
```

（５）新バージョンの```istio-proxy```コンテナがインジェクションされたことを、イメージタグから確認する。

```bash
# 新バージョンのリビジョン番号：asm-1140
$ kubectl get pod \
    -n istio-ingress \
    -o jsonpath={.items[*].spec.containers[*].image} | sed 's/ /\n/g' && echo


gcr.io/gke-release/asm/proxyv2:1.14.0-asm.1
```

#### ▼ アプリケーションの```istio-proxy```コンテナをアップグレード

（４）アプリケーションのPodを再スケジューリングし、新バージョンの```istio-proxy```コンテナを自動的にインジェクションする。カナリア方式のため、webhook-serviceがそのままで新しい```istio-proxy```コンテナをインジェクションできる。

```bash
$ kubectl rollout restart deployment app-deployment -n app
```

（５）新バージョンの```istio-proxy```コンテナがインジェクションされたことを、イメージタグから確認する。

```bash
# 新バージョンのリビジョン番号：asm-1140
$ kubectl get pod \
    -n app \
    -o jsonpath={.items[*].spec.containers[*].image} | sed 's/ /\n/g' && echo


gcr.io/gke-release/asm/proxyv2:1.14.0-asm.1
```


> ℹ️ 参考：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_gateways
> - https://cloud.google.com/service-mesh/docs/gateways#in-cluster_control_plane
> - https://istio.io/latest/docs/setup/upgrade/canary/#data-plane


#### ▼ webhookの向き先を新しいIstiodに完全に変更

（６）Istioのvalidating-admission時を経由するService更新する。ソースコードは、anthos-service-mesh-packagesリポジトリから拝借する。

```bash
$ kubectl diff -f ./asm/istio/istiod-service.yaml

$ kubectl apply -f ./asm/istio/istiod-service.yaml
```

```yaml
# https://github.com/GoogleCloudPlatform/anthos-service-mesh-packages/blob/main/asm/istio/istiod-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: istiod
  namespace: istio-system
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: asm-1140 # リビジョン番号を更新する。
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
    istio.io/rev: asm-1140 # リビジョン番号を更新する。
```


（７）MutatingWebhookConfigurationの```.metadata.labels```キーにて、エイリアスに紐づく現在のリビジョン番号を確認する。

```bash
# アップグレード前に、istiocltコマンドで確認
$ ./output/asm-1.14/istioctl tag list

TAG     REVISION    NAMESPACES
default asm-1130

# アップグレード前に、マニフェストを確認してみる。
$ kubectl get mutatingwebhookconfiguration istio-revision-tag-default -o yaml \
    | grep -e istio.io/rev: -e istio.io/tag:

istio.io/rev: asm-1130
istio.io/tag: default
```

（８）Istioのmutating-admissionを設定するMutatingWebhookConfigurationのラベル値を変更する。MutatingWebhookConfigurationの```.metadata.labels```キーにあるエイリアスの実体が旧バージョンのままなため、新バージョンに変更する。```istioctl```コマンドは、```asmcli```コマンドの```output_dir```オプションで指定したディレクトリにある。


```bash
# asmcliコマンドのoutput_dirオプションで指定したディレクトリのistioctlコマンド
$ ./output/asm-1.14/istioctl tag set default --revision asm-1140 --overwrite
```

（９）MutatingWebhookConfigurationの```.metadata.labels```キーにて、エイリアスに紐づくリビジョン番号を変更できたことを確認する。

```bash
# アップグレード前に、istiocltコマンドで確認してみる。
$ ./output/asm-1.14/istioctl tag list

TAG     REVISION    NAMESPACES
default asm-1140 

# アップグレード前に、マニフェストを確認してみる。
$ kubectl get mutatingwebhookconfiguration istio-revision-tag-default -o yaml \
    | grep -e istio.io/rev: -e istio.io/tag:

istio.io/rev: asm-1140
istio.io/tag: default
```

#### ▼ 古いIstiodを削除

（１０）旧バージョンのIstiodコントロールプレーン（実体は、Service、Deployment、HorizontalPodAutoscaler、PodDisruptionBudget）を削除する。


```bash
$ kubectl get all -n istio-system 

# 旧バージョンのリビジョン番号：asm-1130
$ kubectl delete Service,Deployment,HorizontalPodAutoscaler,PodDisruptionBudget istiod-asm-1130 -n istio-system --ignore-not-found=true

$ kubectl get all -n istio-system 
```

#### ▼ 古いIstiodを削除を削除

（１１）旧バージョンのValidatingWebhookConfigurationを削除する。

```bash
$ kubectl get validatingwebhookconfiguration -n istio-system 

$ kubectl delete validatingwebhookconfiguration istio-validator-asm-1140-istio-system -n istio-system --ignore-not-found=true

$ kubectl get validatingwebhookconfiguration -n istio-system 
```

#### ▼ 古いIstioOperatorを削除を削除


（１２）旧バージョンのIstioOperatorを削除する。

```bash
$ kubectl get IstioOperator -n istio-system 

# 旧バージョンのリビジョン番号：asm-1130
$ kubectl delete IstioOperator installed-state-asm-1130 -n istio-system

$ kubectl get IstioOperator -n istio-system 
```

#### ▼ さいごに

（１３）全てのPodが正常に稼働していることを確認する。

```bash
$ kubectl get pod -A -o wide
```

<br>
