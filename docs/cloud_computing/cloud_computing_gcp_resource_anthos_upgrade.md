---
title: 【IT技術の知見】アップグレード＠Anthos
description: アップグレード＠Anthosの知見を記録しています。
---

# アップグレード＠Anthos

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. Kubernetesのアップグレード (ベアメタル環境の場合)

### アップグレードの仕組み

Anthos Clusterのアップグレード時、データプレーンのワーカーNodeをローリングアップグレードする。

ベアメタルのため、ワーカーNodeを再作成することはなく、コントロールプレーンコンポーネント (例：kube-apiserverなど) とワーカーNodeコンポーネント (例：kubeletなど) をそのままアップグレードしていく。

<br>

### `bmctl`コマンドのセットアップ

`【１】`

: `bmctl`コマンドをインストールする。Anthos GKE Clusterと`bmctl`コマンドのバージョンには対応関係がある。

```bash
$ gsutil cp gs://anthos-baremetal-release/bmctl/1.13.2/linux-amd64/bmctl bmctl-1.12.0
$ chmod a+x bmctl-1.12.0
```

`【２】`

: Anthos GKE Clusterの現在のバージョンを確認する。

```bash
$ kubectl get cluster -A -o yaml
```

```yaml
apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-anthos-cluster
  namespace: foo-namespace
spec:
  anthosBareMetalVersion: 1.12.0 # 現在のバージョン
```

また、Anthos GKE ClusterのバージョンとKubernetesのバージョンの対応関係を確認する。

| Anthos GKE Clusterのバージョン | Kubernetesのバージョン |
| ------------------------------ | ---------------------- |
| ` 1.11`系                      | `v1.22.8-gke`          |
| `1.12`系                       | `v1.23.5-gke`          |
| ...                            | ...                    |

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support

`【３】`

: `docker`プロセスが起動しているかを確認する。Anthosのアップグレードの仕組みの中でKindが使われている。

     ワークステーション (仮想サーバー) 上でKindを起動し、Kindを使用してAnthos K8s in Dockerを検証する。

     Kindによる検証のために、dockerが必要である。dockerプロセスのデーモンが正常なことを確認する。

```bash
$ systemctl status docker
```

<br>

### アップグレードの実施

`【４】`

: `bmctl`コマンドを使用して、Anthos GKE Clusterをローリング方式でアップグレードする。

     また、ログの出力先が表示されるため、このログを`tail`コマンドで確認する。

```bash
# カレントディレクトリは、baremetalである必要がある。
$ pwd
baremetal

$ ~/baremetal/bmctl upgrade cluster \
    -c <Cluster名> \
    --kubeconfig <~/.kube/configファイルへのパス>
```

> ↪️：
>
> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/how-to/upgrade
> - https://cloud.google.com/blog/topics/anthos/best-practices-for-upgrading-anthos-on-bare-metal

`【５】`

: ログの出力先が表示されるので、`tail`コマンドで確認する。

```bash
$ tail -f ~/baremetal/<ログの出力先>
```

`【６】`

: アップグレードが開始する。

     コントロールプレーンコンポーネントやNodeコンポーネントからエラーが発生するため、アラートで確認する。

<br>

### アップグレードの動作確認

`【７】`

: アップグレードが終了する。

     Anthos GKE Clusterのバージョンがアップグレードされたことを確認する。

```bash
$ kubectl get cluster -A -o yaml
```

```yaml
apiVersion: baremetal.cluster.gke.io/v1
kind: Cluster
metadata:
  name: foo-anthos-cluster
  namespace: foo-namespace
spec:
  anthosBareMetalVersion: 1.12.1 # 新バージョン
```

`【８】`

: 各NodeのKubernetesのバージョンが新しくなったことを確認する

```bash
$ kubectl get node -o wide
```

> - https://cloud.google.com/anthos/clusters/docs/bare-metal/latest/getting-support#version-support

`【９】`

: Crash、Terminating、Error、などのPodがいないかを確認する。

     また、Podの作成が始まらないと、`kubectl get pod`コマンドにPod自体が表示されない。

     そのため、`kubectl get deployment`で、Podの管理リソース (例：Deployment) の全てのPodが`Ready`コンディションかどうかを確認しておく。

```bash
$ kubectl get pod -A -o wide

$ kubectl get deployment -A
```

<br>

## 02. Istioのアップグレード (オンプレミス環境、ベアメタル環境、他のクラウドプロバイダー環境の場合)

### 注意!!!!

Anthos Service Meshのドキュメントを確認すると、Istioをカナリア方式でアップグレードしている。

Istioのカナリア方式のアップグレードでは、新しい`istio-proxy`コンテナをインジェクションする方法として、`istio.io/rev`キーのリビジョン番号を書き換える方法と、MutatingWebhookConfigurationのエイリアスの紐付けを変更する方法がある。

Anthos Service Meshのアップグレードでは、何らかの事情でこれらの両方の手順が混じっており、Istioとは方法が若干異なっている。

<br>

### `asmcli`コマンドのセットアップ

`asmcli`コマンドでは、そのバージョンに応じて、アップグレード先のASMのバージョンがハードコーディングされている。

この時、ASMのマイナーバージョンを固定できず、`asmcli`コマンドのインストールのタイミングによってはより新しいパッチバージョンが指定されている。

そのため、各実行環境のアップグレードのたびに`asmcli`コマンドをインストールすると、より後に実施した実行環境の方で新しいパッチバージョンのASMをデプロイすることになってしまう。

そこで、`asmcli`コマンドはバージョン管理した方が良い。

`【１】`

: `asmcli`コマンドをインストールする。アップグレード先のバージョン系の指定するようにする。

```bash
$ curl https://storage.googleapis.com/csm-artifacts/asm/asmcli_1.15 > asmcli
$ chmod a+x asmcli
```

`【２】`

: `asmcli`コマンドが指定している`POINT`値と`REV`値を確認する。

```bash
$ grep -e 'MAJOR=' -e 'MINOR=' -e 'POINT=' -e 'REV=' asmcli

MAJOR="${MAJOR:=1}"; readonly MAJOR;
MINOR="${MINOR:=14}"; readonly MINOR;
POINT="${POINT:=0}"; readonly POINT; # POINT値
REV="${REV:=0}"; readonly REV;       # REV値
...
```

`【３】`

: バイナリファイルの名前を変更する。これをバージョン管理する。

```bash
# asmcliコマンドの名前を変える。
$ mv asmcli asmcli_1140-0
```

> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_anthos_service_mesh

<br>

### アップグレードの実施

#### ▼ 新しいIstiodコントロールプレーンをインストール

`【４】`

: 今、現在のIstioのリビジョン番号が`1130-0`だとする。

```bash
# Deployment
$ kubectl get pod -n istio-system -l istio.io/rev

NAME                READY   STATUS    RESTARTS   AGE
istiod-asm-1130-0   1/1     Running   0          1m  # 1130-0


# Service
$ kubectl get svc -n istio-system

NAME                  TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                                                AGE
istiod-asm-1130-0     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m


# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                   WEBHOOKS   AGE
istio-sidecar-injector-1130-0          1          7m56s # 1130-0
istio-revision-tag-default             1          3m18s # 現在のリビジョン番号 (1130-0) を定義するdefaultタグを持つ
```

`【５】`

: 新しいIstiodコントロールプレーンをインストールする。

     事前にバージョン管理している`asmcli`コマンドを使用して、`asmcli`コマンドを使用して、旧バージョンを残しつつ、新バージョンのIstiodコントロールプレーンをデプロイする。

```bash
$ ./repository/asmcli-1140-0 install \
    --kubeconfig <~/.kube/configファイルへのパス> \
    `# GCP以外 (オンプレ、AWS、Azure、など) で稼働させることを宣言する。` \
    --platform multicloud \
    --fleet_id <フリートのグループID> \
    --output_dir ./output \
    `# オプションを全て有効化する。` \
    --enable_all \
    `# Mesh CAを有効化する。` \
    --ca mesh_ca \
    --custom_overlay ./foo/<IstioOperatorのマニフェスト>
```

> ↪️：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/asmcli-overview#transitioning_from_install_asm
> - https://cloud.google.com/service-mesh/docs/unified-install/plan-upgrade#about_canary_upgrades
> - https://istio.io/latest/docs/setup/upgrade/canary/

#### ▼ 新しいIstiodコントロールプレーンを確認

`【６】`

: Istiodコントロールプレーンがデプロイされたことを確認する。

     補足として、`asmcli`コマンドでは、最新のパッチバージョンがインストールするため、狙ったバージョンをインストールできない可能性がある。

```bash
# Deployment
$ kubectl get deployment -n istio-system

NAME                READY   STATUS    RESTARTS   AGE
istiod-asm-1130-0         1/1     Running   0          1m  # 1130-0
istiod-asm-1140-0         1/1     Running   0          1m  # 1140-0 (今回のアップグレード先)


# Service
$ kubectl get svc -n istio-system
NAME                  TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                                                AGE
istiod-asm-1130-0     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m
istiod-asm-1140-0     ClusterIP   10.32.6.58    <none>        15010/TCP,15012/TCP,443/TCP,15014/TCP,53/UDP,853/TCP   12m # 新しい方


# MutatingWebhookConfiguration
$ kubectl get mutatingwebhookconfigurations

NAME                                   WEBHOOKS   AGE
istio-sidecar-injector-1130-0          1          7m56s # 1130-0
istio-sidecar-injector-1140-0          1          7m56s # 1140-0 (今回のアップグレード先)
istio-revision-tag-default             1          3m18s # 現在のリビジョン番号 (1130-0) を定義するdefaultタグを持つ
```

> ↪️：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_with_optional_features
> - https://cloud.google.com/service-mesh/docs/unified-install/asmcli-overview
> - https://istio.io/latest/docs/setup/upgrade/canary/#control-plane

#### ▼ Namespaceの`.metadata.labels`キーを付け替える。

`【７】`

: カナリア方式のため、Istiodコントロールプレーンの新バージョンの`istio.io/rev`キーの値を取得する。

```bash
$ kubectl get pod -n istio-system -l istio.io/rev

NAME                 READY   STATUS    RESTARTS   AGE   REV
istiod-asm-1130-0    1/1     Running   0          68m   asm-1130-0 # 旧バージョン
istiod-asm-1130-0    1/1     Running   0          68m   asm-1130-0
istiod-asm-1140-0    1/1     Running   0          27s   asm-1140-0 # 今回のアップグレード先
istiod-asm-1140-0    1/1     Running   0          27s   asm-1140-0
```

`【８】`

: `istio.io/rev`キーが設定されている全てのNamespaceを確認する。

```bash
$ kubectl get namespace ingress -L istio.io/rev
NAME       STATUS    AGE     REV
ingress    Active    2d18h   1130
```

```bash
$ kubectl get namespace app -o yaml
```

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: istio-ingress
  labels:
    istio.io/rev: default
```

```bash
$ kubectl get namespace app -L istio.io/rev

NAME   STATUS    AGE     REV
app    Active    2d18h   1130
```

```bash
$ kubectl get namespace app -o yaml
```

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: app
  labels:
    istio.io/rev: default
```

`【９】`

: Istioの`istio.io/rev`キーを使用して、特定のNamespaceの`istio-injection`キーを上書きする。

     多くの場合、`istio-proxy`コンテナはIngressGatewayとアプリケーションのPodのNamespaceにインジェクションしているはずである。そこで、それらのNamespaceを指定する。

     これらのキーはコンフリクトを発生させるため、どちらか一方しか使用できず、Anthosでは`istio.io/rev`キーを推奨している。

     もしGitOpsツール (例：ArgoCD) でNamespaceを管理している場合は、`kubectl label`コマンドの代わりに、GitHub上でリビジョン番号を変更することになる。

```bash
# IngressGatewayの特定のNamespace
$ kubectl label namespace ingress istio.io/rev=asm-1140-0 istio-injection- --overwrite

# アプリの特定のNamespace
$ kubectl label namespace app istio.io/rev=asm-1140-0 istio-injection- --overwriteNa
```

`【１０】`

: 新しいラベルに変更できたことに変更できたことを確認する。

```bash
$ kubectl get namespace -L istio.io/rev
```

> ↪️：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_gateways
> - https://cloud.google.com/service-mesh/docs/gateways#in-cluster_control_plane

#### ▼ IngressGatewayの`istio-proxy`コンテナをアップグレード

`【１１】`

: IngressGatewayのPodを再作成し、新バージョンの`istio-proxy`コンテナを自動的にインジェクションする。

     カナリア方式のため、webhook-serviceがそのままで新しい`istio-proxy`コンテナをインジェクションできる。

```bash
$ kubectl rollout restart deployment istio-ingressgateway -n istio-ingress
```

`【１２】`

: 新バージョンの`istio-proxy`コンテナがインジェクションされたことを、イメージタグから確認する。

     代わりに、`istioctl proxy-status`コマンドでも良い。

```bash
# 新バージョンのリビジョン番号：asm-1140-0
$ kubectl get pod \
    -n istio-ingress \
    -o jsonpath={.items[*].spec.containers[*].image} | sed 's/ /\n/g' && echo


gcr.io/gke-release/asm/proxyv2:1.14.0-asm.1


# 代わりに、istioctl proxy-statusコマンドでも良い。
$ istioctl proxy-status
```

#### ▼ アプリケーションの`istio-proxy`コンテナをアップグレード

`【１３】`

: アプリケーションのPodを再作成し、新バージョンの`istio-proxy`コンテナを自動的にインジェクションする。

     カナリア方式のため、webhook-serviceがそのままで新しい`istio-proxy`コンテナをインジェクションできる。

```bash
$ kubectl rollout restart deployment app-deployment -n app
```

`【１４】`

: 新バージョンの`istio-proxy`コンテナがインジェクションされたことを、イメージタグから確認する。

     代わりに、`istioctl proxy-status`コマンドでも良い。

```bash
# 新バージョンのリビジョン番号：asm-1140-0
$ kubectl get pod \
    -n app \
    -o jsonpath={.items[*].spec.containers[*].image} | sed 's/ /\n/g' && echo


gcr.io/gke-release/asm/proxyv2:1.14.0-asm.1

# 代わりに、istioctl proxy-statusコマンドでも良い。
$ istioctl proxy-status
```

> ↪️：
>
> - https://cloud.google.com/service-mesh/docs/unified-install/upgrade#upgrade_gateways
> - https://cloud.google.com/service-mesh/docs/gateways#in-cluster_control_plane
> - https://istio.io/latest/docs/setup/upgrade/canary/#data-plane

#### ▼ webhookの向き先を新しいIstiodコントロールプレーンに完全に変更

`【１５】`

: Istioのvalidating-admission時を経由するService更新する。

     ソースコードは、anthos-service-mesh-packagesリポジトリから拝借する。

```bash
$ kubectl diff -f ./asm/istio/istiod-service.yaml

$ kubectl apply -f ./asm/istio/istiod-service.yaml
```

```yaml
# https://github.com/GoogleCloudPlatform/anthos-service-mesh-packages/blob/main/asm/istio/istiod-service.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: istiod
    istio: pilot
    istio.io/rev: asm-1140-0 # リビジョン番号を更新する。
    release: istio
  name: istiod
  namespace: istio-system
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
    istio.io/rev: asm-1140-0 # リビジョン番号を更新する。
```

`【１６】`

: MutatingWebhookConfigurationの`.metadata.labels`キーにて、エイリアスに紐づく現在のリビジョン番号を確認する。

```bash
# アップグレード前に、istiocltコマンドで確認
$ ./output/asm-1.14/istioctl tag list

TAG     REVISION    NAMESPACES
default asm-1130-0


# アップグレード前に、マニフェストを確認してみる。
$ kubectl get mutatingwebhookconfiguration istio-revision-tag-default -o yaml \
    | grep -e istio.io/rev: -e istio.io/tag:

istio.io/rev: asm-1130-0
istio.io/tag: default
```

`【１７】`

: Istioのmutating-admissionを設定するMutatingWebhookConfigurationのラベル値を変更する。

     MutatingWebhookConfigurationの```.metadata.labels```キーにあるエイリアス (`istio.io/tag`キーの値) の実体 (`istio.io/rev`キーの値) が旧バージョンのままなため、新バージョンに変更する。

     `istioctl`コマンドは、`asmcli`コマンドの```output_dir```オプションで指定したディレクトリにある。

```bash
# asmcliコマンドのoutput_dirオプションで指定したディレクトリのistioctlコマンド
$ ./output/asm-1.14/istioctl tag set default --revision asm-1140-0 --overwrite
```

`【１８】`

: MutatingWebhookConfigurationの`.metadata.labels`キーにて、エイリアスに紐づくリビジョン番号を変更できたことを確認する。

```bash
# アップグレード前に、istiocltコマンドで確認してみる。
$ ./output/asm-1.14/istioctl tag list

TAG     REVISION    NAMESPACES
default asm-1140-0


# アップグレード前に、マニフェストを確認してみる。
$ kubectl get mutatingwebhookconfiguration istio-revision-tag-default -o yaml \
    | grep -e istio.io/rev: -e istio.io/tag:

istio.io/rev: asm-1140-0
istio.io/tag: default
```

#### ▼ 古いIstiodコントロールプレーンを削除

`【１９】`

: 旧バージョンのIstiodコントロールプレーン (実体は、Service、Deployment、HorizontalPodAutoscaler、PodDisruptionBudget) を削除する。

```bash
$ kubectl get all -n istio-system


# 旧バージョンのリビジョン番号：asm-1130-0
$ kubectl delete Service,Deployment,HorizontalPodAutoscaler,PodDisruptionBudget istiod-asm-1130-0 -n istio-system --ignore-not-found=true


$ kubectl get all -n istio-system
```

#### ▼ 古いIstiodコントロールプレーンを削除を削除

`【２０】`

: 旧バージョンのValidatingWebhookConfigurationを削除する。

```bash
$ kubectl get validatingwebhookconfiguration -n istio-system


$ kubectl delete validatingwebhookconfiguration istio-validator-asm-1140-0-istio-system -n istio-system --ignore-not-found=true


$ kubectl get validatingwebhookconfiguration -n istio-system
```

#### ▼ 古いIstioOperatorを削除を削除

`【２１】`

: 旧バージョンのIstioOperatorを削除する。

```bash
$ kubectl get IstioOperator -n istio-system


# 旧バージョンのリビジョン番号：asm-1130-0
$ kubectl delete IstioOperator installed-state-asm-1130-0 -n istio-system


$ kubectl get IstioOperator -n istio-system
```

<br>

### アップグレードの動作確認

`【２２】`

: 全てのPodが正常に稼働していることを確認する。

     また、Podの作成が始まらないと、`kubectl get pod`コマンドにPod自体が表示されない。

     そのため、`kubectl get deployment`で、Podの管理リソース (例：Deployment) の全てのPodが`Ready`コンディションかどうかを確認しておく。

```bash
$ kubectl get pod -A -o wide
```

<br>

## 03. NodeのOSのアップグレード (ベアメタル環境の場合)

ベアメタル環境の場合、GCPはNodeのOSのバージョンを管理してくれず、GCP外でアップグレードする必要がある。

<br>
