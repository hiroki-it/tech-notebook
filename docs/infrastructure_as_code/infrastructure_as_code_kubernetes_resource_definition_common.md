---
title: 【IT技術の知見】共通部分＠リソース定義
description: 共通部分＠リソース定義の知見を記録しています。
---

# リソース定義の共通部分＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. apiVersion

### apiVersionとは

APIグループのバージョンを設定する。

kube-apiserverをアップグレードすると、APIグループの特定のバージョンが廃止されることがある。

もし、そのバージョンを指定したマニフェストを`kubectl apply`コマンドやclient-goパッケージで送信しようとすると、マニフェストのKubernetesリソースを作成できずにエラーになる。

```yaml
apiVersion: v1
```

> ↪️ 参考：
>
> - https://kubernetes.io/docs/reference/using-api/#api-groups
> - https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.19/#-strong-api-groups-strong-

<br>

### APIグループ

#### ▼ バージョンの段階

バージョンは、成熟度に応じて、`alpha`、`beta`、`stable`、の段階がある。

`alpha`のみデフォルトで無効化されており、`beta`や`stable`であれば、マニフェストで指定すればそのまま使用できる。

もしバージョンの`v2`にKubernetesが対応していなければ、`v1beta1`や`v2beta2`で回避する方法がある。

> ↪️ 参考：
>
> - https://atmarkit.itmedia.co.jp/ait/articles/2008/27/news057.html
> - https://qiita.com/tkusumi/items/cb2dc318875fbef19468

<br>

## 02. kind

作成されるKubernetesリソースの種類を設定する。

<br>

## 03. metadata

### annotation

#### ▼ annotationとは

任意のキーと値を設定する。

`.metadata.labels`キーとは異なり、設定できる情報に制約がない。

> ↪️ 参考：
>
> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata
> - https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d

#### ▼ kubectl.kubernetes.io/last-applied-configuration

kube-apiserverが、前回の`kubectl apply`コマンドで適用したマニフェストの設定値をJSONで割り当てる。

`kubectl apply`コマンドの削除処理時に、kube-apiserverは送信されたマニフェストと`.metadata.annotations.kubectl.kubernetes.io/last-applied-configuration`キーを比較し、削除すべき部分を決定する。

`kubectl edit`コマンドでマニフェストを変更してしまうと、`.metadata.annotations.kubectl.kubernetes.io/last-applied-configuration`キーが変更されない。

そのため、次回の`kubectl apply`コマンドが失敗することがある。

```yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"extensions/v1beta1","kind":"Deployment" ....
```

> ↪️ 参考：https://qiita.com/tkusumi/items/0bf5417c865ef716b221#kubectl-apply-%E3%81%AE%E3%83%91%E3%83%83%E3%83%81%E3%81%AE%E8%A8%88%E7%AE%97

<br>

#### ▼ kubernetes.io/ingress.class

現在、非推奨である。

代わりとして、`.spec.ingressClassname`キーを指定する。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    kubernetes.io/ingress.class: foo-ingress-class
```

> ↪️ 参考：https://kubernetes.io/docs/concepts/services-networking/ingress/#deprecated-annotation

#### ▼ ingressclass.kubernetes.io/is-default-class

IngressがClusterネットワーク内に1つしか存在しない場合、IngressClassに設定することにより、デフォルトとする。

Ingressが新しく作成された場合、このIngressClassの設定値が使用されるようになる。

複数のIngressClassをデフォルトに設定しないようにする。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
```

> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/services-networking/ingress/#default-ingress-class
> - https://kubernetes.github.io/ingress-nginx/#i-have-only-one-ingress-controller-in-my-cluster-what-should-i-do

<br>

### finalizers

#### ▼ finalizersとは

Kubernetesリソースに親子関係がある場合に、親リソースよりも先に子リソースを削除できるようにするため、親リソースの削除を防ぐ。

関連する子リソースが削除されると、`.metadata.finalizers`キーが削除され、親リソースも削除されるようになる。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  finalizers:
    - foo-finalizer
  deletionTimestamp: "2022-01-01T12:00:00Z"
```

> ↪️ 参考：https://zoetrope.github.io/kubebuilder-training/controller-runtime/deletion.html

<br>

### generation

#### ▼ generation

Kubernetesリソースが最初に作成されてから何回変更されたかの回数 (世代数) を設定する。

マニフェストのどこかの設定値を変更すると、世代数が増える。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  generation: 3
```

> ↪️ 参考：https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

### labels

#### ▼ labelsとは

Kubernetesが、Kubernetesリソースの一意に識別するための情報を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/app: foo-deployment
```

> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/
> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata
> - https://blog.getambassador.io/kubernetes-labels-vs-annotations-95fc47196b6d

#### ▼ 予約Label

キー名のプレフィクスとして、`kubernetes.io/`と`k8s.io/`は予約されている。

> ↪️ 参考：https://kubernetes.io/docs/reference/labels-annotations-taints/

#### ▼ データ型

string型である必要がある。

int型を割り当てようとするとエラーになり、これはHelmの`values`ファイル経由で『数字』を出力しようとする場合に起こる。

> ↪️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/#syntax-and-character-set

<br>

### managedFields

#### ▼ managedFieldsとは

特定のマネージャーが管理するマニフェストのキー部分が自動的に割り当てられており、ここにないキーは管理外である。

`kubectl apply`コマンドで`--server-side`オプションを有効化した場合に作成される。

`manager`キーで、クライアント (`kubectl`クライアント、Kubernetesリソース) が管理している部分と、それ以外のマネージャーが管理している部分を区別できる。

`manager`キーにないマネージャーはマニフェストを変更できない。

`managedFields`キー配下にマネージャーを新しく追加するためには、基本的には`--force-conflicts`オプションを使用する必要がある (他にも方法はあるが) 。

ただし、kube-controllerやOperatorでは常に`--force-conflicts`オプションを実行するようになっている。

> ↪️ 参考：
>
> - https://qiita.com/superbrothers/items/aeba9406691388b6a19e
> - https://speakerdeck.com/superbrothers/wakaru-metadata-dot-managedfields?slide=21
> - https://kubernetes.io/docs/reference/using-api/server-side-apply/#field-management
> - https://kubernetes.io/docs/reference/using-api/server-side-apply/#using-server-side-apply-in-a-controller

#### ▼ 確認方法

`managedFields`キーを確認する場合、`kubectl get`コマンドで`-o`オプションと`--show-managed-fields `オプションを有効化する必要がある。

```bash
$ kubectl get deployment foo-deployment -o yaml --show-managed-fields
```

もし、特定のキーが管理下にあるか否かを調べる場合、`grep`コマンドと組み合わせる。

```bash
$ kubectl get deployment foo-deployment -o yaml --show-managed-fields | grep -e manager -e f:<マニフェストのキー>
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  managedFields:
    # kubectlコマンドによる管理
    - manager: kubectl # デフォルト値
      apiVersion: apps/v1
      # kube-apiserverに対するリクエスト内容。ここでは、kubectl applyコマンドの実行履歴を確認できる。
      operation: Apply
      # kubectlコマンドが管理するマニフェストのキー部分
      fields: ...
    # kubectlコマンドによる管理
    - manager: kubectl # デフォルト値
      apiVersion: apps/v1
      # kube-apiserverに対するリクエスト内容。ここでは、kubectl editコマンドの実行履歴を確認できる。
      operation: Edit
      # kubectlコマンドが管理するマニフェストのキー部分
      fields: ...
    # kube-controller-managerによる管理 (後からの変更)
    - manager: kube-controller-manager
      apiVersion: apps/v1
      # kube-apiserverに対するリクエスト内容
      operation: Update
      time: "2022-01-01T16:00:00.000Z"
      # kube-controller-managerが管理するマニフェストのキー部分
      fields: ...
    # operatorによる管理 (後からの変更)
    - manager: operator
      apiVersion: apps/v1
      # kube-apiserverに対するリクエスト内容
      operation: Update
      time: "2022-01-01T16:00:00.000Z"
      # operatorが管理するマニフェストのキー部分
      fields: ...
```

<br>

### name

#### ▼ nameとは

Kubernetesリソースを一意に識別するための名前を設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
```

> ↪️ 参考：https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

#### ▼ 名前は変更不可

Kubernetesにとって`.metadata.name`キーはIDであり、後から変更できない。

もし別の名前に変更したい場合は、再作成する必要がある。

> ↪️ 参考：https://stackoverflow.com/questions/39428409/rename-deployment-in-kubernetes

<br>

### namespace

#### ▼ namespaceとは

Kubernetesリソースを作成するNamespaceを設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  namespace: foo-namespace
```

> ↪️ 参考：https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

### uid

#### ▼ uid

そのKubernetesリソースを識別するユニークIDを設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  uid: *****
...
```

> ↪️ 参考：https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#metadata

<br>

## 03-02. 色々な識別子

### .metadata.annotations

#### ▼ `kubernetes.io`キー

Kubernetesリソースに関する情報を設定する。

`.metadata.annotations`キー配下にも同じキーがあることに注意する。

**＊例＊**

| キー                      | 値の例                        | 説明                                           |
| ------------------------- | ----------------------------- | ---------------------------------------------- |
| `kubernetes.io/createdby` | `aws-ebs-dynamic-provisioner` | Kubernetesリソースを作成したツールを設定する。 |

#### ▼ `pv.kubernetes.io`キー

PersistentVolumeに関する情報を設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

**＊例＊**

| キー                                   | 値の例                  | 説明                                          |
| -------------------------------------- | ----------------------- | --------------------------------------------- |
| `pv.kubernetes.io/bound-by-controller` | `yes`                   |                                               |
| `pv.kubernetes.io/provisioned-by`      | `kubernetes.io/aws-ebs` | そのPersistVolumeを作成したツールを設定する。 |

#### ▼ `meta.helm.sh`キー

Helmの`helm install`コマンドを使用して作成したKubernetesリソースに付与される。

Helmの各リリースに紐づいており、別のリリースであれば、Kubernetesリソースを再作成することになる。

そのため、一部のKubernetesリソースを別のチャートでリリースし直したい場合、Kubernetesリソース、カスタムリソース、スタムリソース定義の`meta.helm.sh`キーを手動で書き換える必要がある。

```bash
# カスタムリソース定義の場合
$ kubectl annotate --overwrite crd <カスタムリソース定義名> meta.helm.sh/release-namespace="<新しいNamespace>"
$ kubectl annotate --overwrite crd <カスタムリソース定義名> meta.helm.sh/release-name="<新しいリリース名>"
```

また反対に、特定のKubernetesリソース (例：カスタムリソース定義) をHelmの管理外としたい場合、このキーを削除する必要がある。

```bash
$ kubectl annotate --overwrite crd <カスタムリソース定義名> meta.helm.sh/release-namespace-
$ kubectl annotate --overwrite crd <カスタムリソース定義名> meta.helm.sh/release-name-
```

補足として、ArgoCDを介してHelmを使用する場合、内部的には`kubectl apply`コマンドと同様の処理を実行しているため、この`meta.helm.sh`キーはない。

**＊例＊**

| キー                             | 値の例          | 説明                                                                                                                                                                                                                                                                                                                |
| -------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta.helm.sh/release-name`      | `foo-release`   | Helmのリリース名を設定する。                                                                                                                                                                                                                                                                                        |
| `meta.helm.sh/release-namespace` | `foo-namespace` | リリース時のNamespaceを設定する。                                                                                                                                                                                                                                                                                   |
| `meta.helm.sh/resource-policy`   | `keep`          | Kubernetesリソースに付与することで、 リリース時に再作成処理や削除処理されることを防ぐ。公式チャートのアップグレード時に、特定のチャート内のKubernetesリソースを別チャートに移行したい場合に役立つ。他に、Helmリリースのアンインストール時に特定のKubernetesリソース (例：PersistentVolume) を残したい場合に役立つ。 |

> ↪️ 参考：
>
> - https://helm.sh/docs/howto/charts_tips_and_tricks/#tell-helm-not-to-uninstall-a-resource
> - https://codersociety.com/blog/articles/helm-best-practices#9-opt-out-of-resource-deletion-with-resource-policies

#### ▼ `volume.kubernetes.io`キー

PersistentVolumeClaimに関する情報を設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

**＊例＊**

| キー                                       | 値の例                                       | 説明                                                                                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `volume.kubernetes.io/storage-provisioner` | `kubernetes.io/aws-ebs`                      | PersistentVolumeClaimに紐づくPersistentVolumeを作成したツールを設定する。                                                                                                                                                         |
| `volume.kubernetes.io/selected-node`       | `ip-*-*-*-*.ap-northeast-1.compute.internal` | PersistentVolumeClaimに紐づくPersistentVolumeが配置されているNode名を設定する。正しいNode名を指定しないと、`N node(s) had volume node affinity conflict, N node(s) didn't match Pod's node affinity/selector`というエラーになる。 |

<br>

### .metadata.labels

#### ▼ `app.kubernetes.io`キー

Kubernetes上で稼働するコンテナの情報を設定する。

**＊例＊**

| キー                           | 値の例                     | 説明                                                                |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------- |
| `app.kubernetes.io/app`        | `foo`、`foo-service`       | マイクロサービス名を設定する。                                      |
| `app.kubernetes.io/component`  | `database`                 | コンテナの役割名を設定する。                                        |
| `app.kubernetes.io/created-by` | `kube-controller-manager`  | このKubernetesリソースを作成したリソースやユーザーを設定する。      |
| `app.kubernetes.io/env`        | `prd`、`stg`、`dev`        | アプリケーションの実行環境名を設定する。                            |
| `app.kubernetes.io/instance`   | `mysql-12345`              | アプリコンテナのインスタンス名を設定する。                          |
| `app.kubernetes.io/managed-by` | `helm`、`foo-operator`     | アプリケーションの管理ツール名を設定する。                          |
| `app.kubernetes.io/name`       | `mysql`                    | マイクロサービスを構成するコンテナのベンダー名を設定する。          |
| `app.kubernetes.io/nodegrop`   | `batch`、`ingress`、`mesh` | コンテナを持つPodのスケジューリング先とするNodeグループを設定する。 |
| `app.kubernetes.io/part-of`    | `bar`                      | マイクロサービス全体のアプリケーション名を設定する。                |
| `app.kubernetes.io/type`       | `host` (PVのマウント対象)  | リソースの設定方法の種類名を設定する。                              |
| `app.kubernetes.io/version`    | `5.7.21`                   | マイクロサービスのリリースバージョン名を設定する。                  |

> ↪️ 参考：https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/

#### ▼ `argocd.argoproj.io`キー

ArgoCDを使用している場合に、ArgoCDの情報をを設定する。

ArgoCDが設定してくれるため、開発者が設定する必要はない。

**＊例＊**

| キー                          | 値の例            | 説明                                                          |
| ----------------------------- | ----------------- | ------------------------------------------------------------- |
| `argocd.argoproj.io/instance` | `foo-application` | Kubernetesリソースを管理するArgoCDのApplication名を設定する。 |

#### ▼ `helm.sh`キー

Helmを使用している場合に、Helmの情報を設定する。

Helmが設定してくれるため、開発者が設定する必要はない。

**＊例＊**

| キー            | 値の例      | 説明                               |
| --------------- | ----------- | ---------------------------------- |
| `helm.sh/chart` | `foo-chart` | 使用しているチャート名を設定する。 |

#### ▼ `kubernetes.io`キー

Kubernetesリソースに関する情報を設定する。

`.metadata.annotations`キー配下にも同じキーがあることに注意する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

**＊例＊**

| キー                     | 値の例                                                   | 説明                                |
| ------------------------ | -------------------------------------------------------- | ----------------------------------- |
| `kubernetes.io/arch`     | `amd64`                                                  | NodeのCPUアーキテクチャを設定する。 |
| `kubernetes.io/hostname` | `ip-*-*-*-*.ap-northeast-1.compute.internal` (AWSの場合) | Nodeのホスト名を設定する。          |
| `kubernetes.io/os`       | `linux`                                                  | NodeのOSを設定する。                |

#### ▼ `node-role.kubernetes.io`キー

Nodeのtaintを設定する。

**＊例＊**

| キー                             | 値の例                           | 説明                                      |
| -------------------------------- | -------------------------------- | ----------------------------------------- |
| `node-role.kubernetes.io/master` | `NoSchedule`、`PreferNoSchedule` | Podのスケジューリングのルールを設定する。 |

#### ▼ `topology.kubernetes.io`キー

Nodeに関する情報を設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

**＊例＊**

| キー                            | 値の例                        | 説明                                     |
| ------------------------------- | ----------------------------- | ---------------------------------------- |
| `topology.kubernetes.io/region` | `ap-northeast-1` (AWSの場合)  | Nodeが稼働しているリージョンを設定する。 |
| `topology.kubernetes.io/zone`   | `ap-northeast-1a` (AWSの場合) | Nodeが稼働しているAZを設定する。         |

<br>

## 04. status

### status

#### ▼ statusとは

Kubernetesリソースの現在の状態を設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

Kubernetesリソースごとに、`.status`キー配下の構造は異なっており、

<br>

### conditions

#### ▼ conditionsとは

`.status`キーの履歴を設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

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

> ↪️ 参考：https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties

<br>

### observedGeneration

#### ▼ observedGenerationとは

kube-controllerやカスタムコントローラーがKubernetesリソースの状態を管理している場合に、これらが検知した`.metadata.generation`キーの値を設定する。

Kubernetesが設定してくれるため、開発者が設定する必要はない。

`.metadata.generation`キーよりも`.status.observedGeneration`キーの方が世代数が小さい場合、kube-controllerやカスタムコントローラーがKubernetesリソースを検出できていない不具合を表す。

```yaml
apiVersion: apps/v1
kind: Deployment
spec: ...

status:
  observedGeneration: 3
  conditions: ...
```

> ↪️ 参考：
>
> - https://github.com/kubernetes/community/blob/master/contributors/devel/sig-architecture/api-conventions.md#typical-status-properties
> - https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L1480-L1485

<br>
