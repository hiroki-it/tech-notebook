---
title: 【IT技術の知見】カスタムリソース＠Kubernetes
description: カスタムリソース＠Kubernetesの知見を記録しています。
---

# カスタムリソース＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. カスタムリソース

### カスタムリソースとは

Kubernetes に標準で備わっていない Kubernetes リソースを提供する。

<br>

### 管理方針

CRD は、Helm の管理外 (`kubectl` コマンド) で作成/変更したほうがよい。

理由としては以下の通りである。

- CRD の作成が衝突する可能性もある。また、CRD へ `meta.helm.sh` キーを付与したくない。
- Helm は CRD を作成できるが更新できないため、作成も Helm の管理外にしたい

カスタムリソースのマニフェストで定義できるオプションやデータ型は、CRD のスキーマ定義に応じて決まる。

そのため、CRD のスキーマを変更すると、同じ Cluster 内にある該当のカスタムリソースに影響が出る。

具体的には、以下のような問題が起こる。

- CRD をアップグレードした場合に、スキーマに機能廃止があると、カスタムリソースで廃止されたその機能を使用できなくなる。
- CRD 自体を誤って削除すると、これに対応するカスタムリソースも自動的に削除される。

> - https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
> - https://www.amazon.co.jp/dp/B08FZX8PYW

<br>

### カスタムリソース固有の問題

#### ▼ 共通エラー

以下のようなエラーになってしまう場合、CRD が存在していないか、CRD が古くて新しいカスタムリソースが対応していない可能性がある。

```bash
Failed to render chart: exit status 1: Error: unable to build kubernetes objects from release manifest: error validating ""
```

#### ▼ 個別

メモ程度に、カスタムリソースで起こった固有の問題を記載しておく。

| 問題                                                                                                                                                                       | 解決策                                                                                                                                                                                                         | 該当のカスタムリソース |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `.spec.affinity` キーの変更を適用するために、Podを再スケジューリングさせた。`.spec.affinity` キーの設定が機能せず、変更前と同じNodeにPodが再スケジューリングされてしまう。 | PersistentVolumeが再作成されておらず、既存のPersistentVolumeに紐付けるために、同じNodeにPodを再スケジューリングさせている可能性がある。Podを再スケジューリングさせた後に、すぐにPersistentVolumeも再作成する。 | Prometheus系           |

<br>

## 02.セットアップ

### ユーザーによる自前管理

#### ▼ 非チャートとして

CRD のマニフェストを送信し、その後にカスタムリソースのマニフェストを送信する。

もし CRD を送信する前にカスタムリソースを送信してしまうと、kube-apiserver は CRD を見つけられずに、以下のエラーレスポンスを返信する。

```bash
the server could not find the requested resource
```

#### ▼ チャートとして

CRD とカスタムリソースを含むチャートをインストールする。

<br>

### Custom Controllerによる管理

#### ▼ 非チャートとして

Custom Controller のマニフェストを送信し、後は Custom Controller にカスタムリソースを作成させる。

#### ▼ チャートとして

Custom Controller のチャートをインストールし、後は Custom Controller にカスタムリソースを作成させる。

<br>

## 03. CRD

### CRDとは

カスタムリソースを宣言的に定義する。

ただし、kube-controller は etcd 内のカスタムリソースを検知できず、これを検知するためには Custom Controller を作成する必要がある。

<br>

### カスタムリソースの宣言値の決まり方

マニフェストの `.apiVersion` キーで、『`<.spec.groupキー名>/<.spec.versionキー名>`』と宣言し、カスタムリソースを使用する。

例えば『`example.com`』というグループと『`v1`』というバージョンを定義したとすると、カスタムリソースからは `example.com/v1` という API からコールできるようになる。

> - https://hi1280.hatenablog.com/entry/2019/11/15/003101
> - https://www.takutakahashi.dev/lazy-custom-controller-for-kubernetes/

<br>

### .apiVersion

CRD 自体の API グループの名前を設定する。

```yaml
apiVersion: apiextensions.k8s.io/v1
```

<br>

### .metadata

#### ▼ name

カスタムリソースの API グループの名前を設定する。

名前は、『`<.spec.names.pluralキー名>.<spec.groupキー名>`』とする必要がある。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  # pluralキー名は、foos
  # groupキー名は、example.com
  name: foos.example.com
```

<br>

### .spec.group

#### ▼ groupとは

カスタムリソースが所属する API グループの名前を設定する。

カスタムリソースを管理する組織の完全修飾ドメイン名にするとよい。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  group: example.com
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

<br>

### .spec.scope

#### ▼ scopeとは

カスタムリソースを『Namespaced スコープ』あるいは『Cluster スコープ』な Kubernetes リソースとするかを設定する。

注意点として、CRD 自体は Cluster スコープな Kubernetes リソースである。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Namespaced
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

#### ▼ Clusterの場合

同じカスタムリソースが Cluster 内に `1` 個のみ存在できるようにする。

Namespace ごとにカスタムリソースを作成できなくなる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Cluster
```

> - https://uzimihsr.github.io/post/2021-07-12-kubernetes-crd-controller-practice/#crd%E3%81%AE%E4%BD%9C%E6%88%90
> - https://developer.ibm.com/tutorials/kubernetes-custom-resource-definitions/

#### ▼ Namespacedの場合

同じカスタムリソースが Namespace 内に `1` 個のみ存在できるようにする。

Namespace ごとにカスタムリソースを作成できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Namespaced
```

> - https://uzimihsr.github.io/post/2021-07-12-kubernetes-crd-controller-practice/#crd%E3%81%AE%E4%BD%9C%E6%88%90
> - https://developer.ibm.com/tutorials/kubernetes-custom-resource-definitions/

<br>

### .spec.names

#### ▼ namesとは

カスタムリソースの名前を設定する。

#### ▼ kind

カスタムリソースの `.kind` キー名を設定する。

例えば『`Foo`』という宣言名にすると、マニフェストの `.kind` キーで、`Foo` というカスタムリソース名で使用できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  names:
    kind: Foo
```

```yaml
# カスタムリソースの宣言
apiVersion: foo.example.com
kind: Foo
spec: ...
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ plural

`kubectl` コマンドで使用するカスタムリソースの複数形名を設定する。

例えば『`foos`』という宣言名にすると、`kubectl` コマンドで `foos` というカスタムリソース名で使用できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  names:
    plural: foos
```

```bash
$ kubectl get foos
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ singular

`kubectl` コマンドで使用するカスタムリソースの単数形名を設定する。

例えば『`foo`』という宣言名にすると、`kubectl` コマンドで `foo` というカスタムリソース名で使用できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  names:
    singular: foo
```

```bash
$ kubectl get foo
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ shortNames

`kubectl` コマンドで使用するカスタムリソースの省略名を設定する。

例えば『`fo`』という宣言名にすると、`kubectl` コマンドで `fo` というカスタムリソース名で使用できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  names:
    shortNames:
      - fo
```

```bash
$ kubectl get fo
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

<br>

### .spec.versions

#### ▼ versionsとは

CRD に対応するカスタムリソースに関して、API グループのバージョンを設定する。

複数のバージョンの CRD を Cluster 内で同時に管理する場合、`.spec.versions[*].name` キー配下に複数のスキーマを定義する。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - name: v1

  ...

    - name: v2

  ...
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/#specify-multiple-versions

#### ▼ name

API グループのバージョン名を設定する。

例えば『`v1`』という string 型のキーを設定すると、マニフェストの `.apiVersion` で、`/v1` を最後につけてコールすることになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - name: v1
```

> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

#### ▼ served

API グループのバージョンを有効化するかを設定する。

もしカスタムリソースに複数のバージョンが存在する場合、旧バージョンを無効化し、マニフェストで使用できないようにできる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - served: "true"
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ schema

カスタムリソースの `.spec` キー以下に設定できるキーと、これのデータ型を設定する。

例えば『`message`』という string 型のキーを設定すると、カスタムリソースの `.spec.message` キーに任意の string 型を設定できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                # カスタムリソースの.spec.messageキーに文字列を設定できるようになる。
                message:
                  # 説明文
                  description: Echo message
                  # string型
                  type: string
```

> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#specifying-a-structural-schema
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

#### ▼ storage

API グループのバージョンを etcd のストレージに保管してもよいどうかを設定する。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - storage: "true"
```

> - https://stackoverflow.com/questions/69558910/what-does-storage-means-in-kubernetes-crd
> - https://speakerdeck.com/uesyn/k8s-storage-version-migration?slide=5

<br>
