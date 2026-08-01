---
title: 【IT技術の知見】共通項目＠リソース定義
description: 共通項目＠リソース定義の知見を記録しています。
---

# 共通項目＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. apiVersion

### apiVersion とは

API グループのバージョンを設定する。

kube-apiserver をアップグレードすると、API グループの特定のバージョンが廃止されることもある。

もし、そのバージョンを指定したマニフェストを `kubectl apply` コマンドや client-go パッケージ経由で送信しようとすると、Kubernetes リソースを作成できず、エラーになってしまう。

```yaml
apiVersion: v1
```

> - https://kubernetes.io/docs/reference/using-api/#api-groups
> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.23/#-strong-api-groups-strong-

<br>

### API グループ

#### ▼ バージョンの段階

バージョンは、成熟度に応じて、`alpha`、`beta`、`stable`、の段階がある。

`alpha` のみデフォルトで無効化されており、`beta` や `stable` であれば、マニフェストで指定すればそのまま使用できる。

もしバージョンの `v2` に Kubernetes が対応していなければ、`v1beta1` や `v2beta2` で回避する方法がある。

> - https://atmarkit.itmedia.co.jp/ait/articles/2008/27/news057.html
> - https://qiita.com/tkusumi/items/cb2dc318875fbef19468

<br>

## 02. kind

作成される Kubernetes リソースの種類を設定する。

<br>

## 03. metadata.annotation

### annotation とは

任意のキーと値を設定する。

`.metadata.labels` キーとは異なり、設定できる情報に制約がない。

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata
> - https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d

<br>

### 任意の Kubernetes リソースの場合

#### ▼ kubectl.kubernetes.io/last-applied-configuration

kube-apiserver が、前回の `kubectl apply` コマンドで適用したマニフェストの設定値を JSON で割り当てる。

`kubectl apply` コマンドの削除処理時に、kube-apiserver は送信されたマニフェストと `.metadata.annotations.kubectl.kubernetes.io/last-applied-configuration` キーを比較し、削除すべき部分を決定する。

`kubectl edit` コマンドでマニフェストを変更してしまうと、`.metadata.annotations.kubectl.kubernetes.io/last-applied-configuration` キーが変更されない。

そのため、次回の `kubectl apply` コマンドが失敗することもある。

また、`kubectl apply` したいマニフェストが多すぎると、JSON が大きすぎて、`kubectl apply` に失敗することがある。

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"extensions/v1beta1","kind":"Deployment" ... }
```

> - https://qiita.com/tkusumi/items/0bf5417c865ef716b221#kubectl-apply-%E3%81%AE%E3%83%91%E3%83%83%E3%83%81%E3%81%AE%E8%A8%88%E7%AE%97

#### ▼ `kubernetes.io` キー

Kubernetes リソースに関する情報を設定する。

`.metadata.annotations` キー配下にも同じキーがあることに注意する。

| キー                      | 値の例                        | 説明                                            |
| ------------------------- | ----------------------------- | ----------------------------------------------- |
| `kubernetes.io/createdby` | `aws-ebs-dynamic-provisioner` | Kubernetes リソースを作成したツールを設定する。 |

<br>

### Ingress の場合

#### ▼ kubernetes.io/ingress.class

現在、非推奨である。

代わりに、`.spec.ingressClassName` キーを指定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: foo-ingress-class
```

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

#### ▼ ingressclass.kubernetes.io/is-default-class

Ingress が Cluster ネットワーク内に 1 つしか存在しない場合、IngressClass に設定することにより、デフォルトとする。

Ingress が新しく作成された場合、この IngressClass の設定値が使用されるようになる。

IngressClass を複数デフォルトとして設定しないようにする。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    ingressclass.kubernetes.io/is-default-class: true
```

> - https://kubernetes.io/docs/concepts/services-networking/ingress/#default-ingress-class
> - https://kubernetes.github.io/ingress-nginx/#i-have-only-one-ingress-controller-in-my-cluster-what-should-i-do

<br>

### PersistentVolume の場合

#### ▼ `pv.kubernetes.io` キー

PersistentVolume に関する情報を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

#### ▼ 種類

| キー                                   | 値の例                                                                       | 説明                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pv.kubernetes.io/bound-by-controller` | `yes`                                                                        | PersistentVolume の CSI ドライバーの Controller がプロビジョニングしたかどうかを設定する。 |
| `pv.kubernetes.io/provisioned-by`      | `ebs.csi.aws.com` (AWS EBS CSI ドライバー)、`kubernetes.io/aws-ebs` (非推奨) | その PersistVolume を作成したツールを設定する。                                            |

<br>

### PersistentVolumeClaim の場合

#### ▼ `volume.kubernetes.io` キーとは

PersistentVolumeClaim に関する情報を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

| キー                                       | 値の例                                                                                                              | 説明                                                                                                                                                                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `volume.kubernetes.io/storage-provisioner` | `ebs.csi.aws.com` (AWS EBS CSI ドライバー)、`kubernetes.io/aws-ebs` (非推奨)、`k8s.io/minikube-hostpath` (Minikube) | PersistentVolumeClaim に紐づく PersistentVolume を作成したツールを設定する。                                                                                                                                                                      |
| `volume.kubernetes.io/selected-node`       | `ip-*-*-*-*.ap-northeast-1.compute.internal`                                                                        | PersistentVolumeClaim に紐づく PersistentVolume が配置されている Node 名を設定する。正しい Node 名を指定しないと、`N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector` というエラーになってしまう。 |

<br>

## 03-02. metadata.finalizers

### finalizers とは

Kubernetes リソースに親子関係がある場合に、親リソースよりも先に子リソースを削除できるようにするため、親リソースの削除を防ぐ。

このとき、`.metadata.finalizers` キーの値で親名が定義されている。

関連する子リソースが削除されると、`.metadata.finalizers` キーが削除され、親リソースも削除されるようになる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  finalizers:
    - foo-finalizer
  deletionTimestamp: "2022-01-01T12:00:00Z"
```

> - https://zoetrope.github.io/kubebuilder-training/controller-runtime/deletion.html

<br>

## 03-03. metadata.generation

### generation

Kubernetes リソースが最初に作成されてから何回変更されたかの回数 (世代数) を設定する。

マニフェストのどこかの設定値を変更すると、世代数が増える。

kube-controller が設定してくれるため、開発者が設定する必要はない。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  generation: 3
```

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

## 03-04. metadata.labels

### labels とは

Kubernetes が、Kubernetes リソースの一意に識別するための情報を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/name: foo-deployment
```

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata
> - https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d

値は、string 型である必要がある。

int 型を割り当てようとするとエラーになり、これは Helm の `values` ファイル経由で『数字』を出力しようとする場合に起こる。

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set

<br>

### 予約 Label

キー名のプレフィクスとして、`kubernetes.io/` と `k8s.io/` は予約されている。

> - https://kubernetes.io/docs/reference/labels-annotations-taints/

<br>

### 任意の Kubernetes リソースの場合

#### ▼ `app.kubernetes.io` キー

Kubernetes 上で稼働するコンテナの情報を設定する。

| キー                           | 値の例                      | 説明                                                                       |
| ------------------------------ | --------------------------- | -------------------------------------------------------------------------- |
| `app.kubernetes.io/app`        | `foo`、`foo-service`        | マイクロサービス名を設定する。                                             |
| `app.kubernetes.io/component`  | `app`、`database`           | K8s リソースをシステムの要素と捉えたときに、その役割名を設定する。         |
| `app.kubernetes.io/created-by` | `kube-controller-manager`   | この Kubernetes リソースを作成したリソースやユーザーを設定する。           |
| `app.kubernetes.io/env`        | `prd`、`stg`、`tes`、`dev`  | アプリケーションの実行環境名を設定する。                                   |
| `app.kubernetes.io/instance`   | `mysql-12345`               | アプリケーションのインスタンス名を設定する。                               |
| `app.kubernetes.io/managed-by` | `helm`、`foo-operator`      | K8s リソースの管理ツール名を設定する。                                     |
| `app.kubernetes.io/name`       | `foo-service`、`prometheus` | アプリ側であればマイクロサービス名、インフラ側であればツール名を設定する。 |
| `app.kubernetes.io/part-of`    | `bar`                       | K8s リソースをシステムの要素と捉えたときに、その親のシステム名を設定する。 |
| `app.kubernetes.io/type`       | `host` (PV のマウント対象)  | リソースの設定方法の種類名を設定する。                                     |
| `app.kubernetes.io/version`    | `5.7.21`                    | K8s リソースのリリースバージョン名を設定する。                             |

> - https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

<br>

#### ▼ `kubernetes.io` キー

Kubernetes リソースに関する情報を設定する。

`.metadata.annotations` キー配下にも同じキーがあることに注意する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

| キー                     | 値の例                                                    | 説明                                   |
| ------------------------ | --------------------------------------------------------- | -------------------------------------- |
| `kubernetes.io/arch`     | `amd64`                                                   | Node の CPU アーキテクチャを設定する。 |
| `kubernetes.io/hostname` | `ip-*-*-*-*.ap-northeast-1.compute.internal` (AWS の場合) | Node のホスト名を設定する。            |
| `kubernetes.io/os`       | `linux`                                                   | Node の OS を設定する。                |

<br>

### Node の場合

#### ▼ ラベルの設定方法

kubelet の `--node-labels` オプションを使用すると、Node にラベルを設定できる。

```bash
--node-labels=nodetype=foo
```

> - https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/

#### ▼ `node.kubernetes.io` キー

Node の情報を設定する。

| キー                          | 値の例                       | 説明                                                                    |
| ----------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| `node.kubernetes.io/nodetype` | `batch`、`ingress`、`master` | コンテナを持つ Pod のスケジューリング先とする Node グループを設定する。 |

#### ▼ `node-role.kubernetes.io` キー

Node の taints を設定する。

| キー                             | 値の例                           | 説明                                       |
| -------------------------------- | -------------------------------- | ------------------------------------------ |
| `node-role.kubernetes.io/master` | `NoSchedule`、`PreferNoSchedule` | Pod のスケジューリングのルールを設定する。 |

#### ▼ `topology.kubernetes.io` キー

Node に関する情報を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

| キー                            | 値の例                         | 説明                                      |
| ------------------------------- | ------------------------------ | ----------------------------------------- |
| `topology.kubernetes.io/region` | `ap-northeast-1` (AWS の場合)  | Node が稼働しているリージョンを設定する。 |
| `topology.kubernetes.io/zone`   | `ap-northeast-1a` (AWS の場合) | Node が稼働している AZ を設定する。       |

<br>

### Role、ClusterRole、の場合

#### ▼ `rbac.authorization.k8s.io` キー

すべての Kubernetes リソースに対して、一括して認可スコープを定義する。

特定の Kubernetes リソースに関して認可スコープを狭くしたい場合、`.rules` キー配下でそれを定義する。

| キー                                           | 値の例 | 説明                                                                                     |
| ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `rbac.authorization.k8s.io/aggregate-to-admin` | `true` | Cluster 内のすべての Kubernetes リソースにすべての操作が可能な認可スコープを設定する。   |
| `rbac.authorization.k8s.io/aggregate-to-edit`  | `true` | Namespace 内のすべての Kubernetes リソースに変更操作が可能な認可スコープを設定する。     |
| `rbac.authorization.k8s.io/aggregate-to-view`  | `true` | Cluster 内のすべての Kubernetes リソースに対して閲覧操作が可能な認可スコープを設定する。 |

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  labels:
    rbac.authorization.k8s.io/aggregate-to-admin: true
    rbac.authorization.k8s.io/aggregate-to-edit: true
    rbac.authorization.k8s.io/aggregate-to-view: true
  name: foo
rules: ... # 特定の Kubernetes リソースの認可スコープを狭めたい場合は、.rules キーでそれを定義する
```

<br>

## 03-05. metadata.managedFields

### managedFields とは

特定のマネージャーが管理するマニフェストのキー部分が自動的に割り当てられており、ここにないキーは管理外である。

`kubectl apply` コマンドで `--server-side` オプションを有効化した場合に作成される。

`.metadata.managedFields[*].manager` キーで、kube-apiserver クライアント (`kubectl` クライアント、Kubernetes リソース) が管理している部分と、それ以外のマネージャーが管理している部分を区別できる。

`.metadata.managedFields[*].manager` キーにないマネージャーはマニフェストを変更できない。

`.metadata.managedFields` キー配下にマネージャーを新しく追加するためには、基本的には `--force-conflicts` オプションを使用する必要がある (他にも方法はあるが) 。

ただし、kube-controller や Operator では常に `--force-conflicts` オプションを実行するようになっている。

> - https://qiita.com/superbrothers/items/aeba9406691388b6a19e
> - https://speakerdeck.com/superbrothers/wakaru-metadata-dot-managedfields?slide=21
> - https://kubernetes.io/docs/reference/using-api/server-side-apply/#field-management
> - https://kubernetes.io/docs/reference/using-api/server-side-apply/#using-server-side-apply-in-a-controller

<br>

### 確認方法

`.metadata.managedFields` キーを確認する場合、`kubectl get` コマンドで `-o` オプションと `--show-managed-fields ` オプションを有効化する必要がある。

```bash
$ kubectl get deployment foo-deployment -o yaml --show-managed-fields
```

もし、特定のキーが管理下にあるか否かを調べる場合、`grep` コマンドと組み合わせる。

```yaml
$ kubectl get deployment foo-deployment -o yaml --show-managed-fields | grep -e manager -e f:<マニフェストのキー>
---
apiVersion: apps/v1
kind: Deployment
metadata:
  managedFields:
    # kubectl コマンドによる管理
    - manager: kubectl # デフォルト値
      apiVersion: apps/v1
      # kube-apiserver に対するリクエスト内容。ここでは、kubectl apply コマンドの実行履歴を確認できる。
      operation: Apply
      # kubectl コマンドが管理するマニフェストのキー部分
      fields: ...

    # kubectl コマンドによる管理
    - manager: kubectl # デフォルト値
      apiVersion: apps/v1
      # kube-apiserver に対するリクエスト内容。ここでは、kubectl edit コマンドの実行履歴を確認できる。
      operation: Edit
      # kubectl コマンドが管理するマニフェストのキー部分
      fields: ...

    # kube-controller-manager による管理 (後からの変更)
    - manager: kube-controller-manager
      apiVersion: apps/v1
      # kube-apiserver に対するリクエスト内容
      operation: Update
      time: "2022-01-01T16:00:00.000Z"
      # kube-controller-manager が管理するマニフェストのキー部分
      fields: ...

    # operator による管理 (後からの変更)
    - manager: operator
      apiVersion: apps/v1
      # kube-apiserver に対するリクエスト内容
      operation: Update
      time: "2022-01-01T16:00:00.000Z"
      # operator が管理するマニフェストのキー部分
      fields: ...

    # ArgoCD の application-controller による管理 (後からの変更)
    - manager: argocd-application-controller
      apiVersion: apps/v1
      # kube-apiserver に対するリクエスト内容
      operation: Update
      time: "2022-01-01T16:00:00.000Z"
      # ArgoCD の application-controller が管理するマニフェストのキー部分
      fields: ...
```

<br>

## 03-06. metadata.name

### name とは

Kubernetes リソースを一意に識別するための名前を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
```

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

### 名前は変更不可

Kubernetes にとって `.metadata.name` キーは ID であり、後から変更できない。

もし別の名前に変更したい場合は、再作成する必要がある。

> - https://stackoverflow.com/questions/39428409/rename-deployment-in-kubernetes

<br>

## 03-07. metadata.namespace

### namespace とは

Kubernetes リソースを作成する Namespace を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: foo-namespace
```

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

## 03-08. metadata.uid

### uid

その Kubernetes リソースを識別するユニーク ID を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

また仮に開発者が変更しても、kube-controller や Custom Controller が正しい値に自動的に修復する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  uid: *****
...
```

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

## 04. status

### status

#### ▼ status とは

Kubernetes リソースの現在の状態を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

また仮に開発者が変更しても、kube-controller や Custom Controller が正しい値に自動的に修復する。

Kubernetes リソースごとに、`.status` キー配下の構造は異なっており、

<br>

### conditions

#### ▼ conditions とは

`.status` キーの履歴を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

また仮に開発者が変更しても、kube-controller や Custom Controller が正しい値に自動的に修復する。

```yaml
apiVersion: apps/v1
kind: Deployment
spec: ...

status:
  conditions:
    - lastProbeTime: null
      lastTransitionTime: "2022-01-01T06:24:02Z"
      status: "True"
      type: Initialized
    - lastProbeTime: null
      lastTransitionTime: "2022-01-01T07:01:45Z"
      status: "True"
      type: Ready
    - lastProbeTime: null
      lastTransitionTime: "2022-01-01T07:01:45Z"
      status: "True"
      type: ContainersReady
    - lastProbeTime: null
      lastTransitionTime: "2022-01-01T06:24:02Z"
      status: "True"
      type: PodScheduled
```

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties

<br>

### observedGeneration

#### ▼ observedGeneration とは

kube-controller や Custom Controller が Kubernetes リソースの状態を管理している場合に、これらが検知した `.metadata.generation` キーの値を設定する。

kube-controller が設定してくれるため、開発者が設定する必要はない。

また仮に開発者が変更しても、kube-controller や Custom Controller が正しい値に自動的に修復する。

`.metadata.generation` キーよりも `.status.observedGeneration` キーの世代数が小さい場合、kube-controller や Custom Controller が Kubernetes リソースを検出できていない不具合を表す。

```yaml
apiVersion: apps/v1
kind: Deployment
spec:

---
status:
  observedGeneration: 3
  conditions: ...
```

> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties
> - https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L1480-L1485

<br>
