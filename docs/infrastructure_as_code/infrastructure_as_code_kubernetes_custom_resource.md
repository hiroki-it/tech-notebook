---
title: 【IT技術の知見】カスタムリソース＠Kubernetes
description: カスタムリソース＠Kubernetesの知見を記録しています。
---

# カスタムリソース＠Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. カスタムリソース

### カスタムリソースとは

Kubernetesに標準で備わっていないKubernetesリソースを提供する。

カスタムリソースのマニフェストで定義できるオプションやデータ型は、CRDのスキーマ定義に応じて決まる。

そのため、CRDのスキーマを変更すると、同じCluster内にある該当のカスタムリソースに影響が出る。

具体的には、以下のような問題が起こる可能性がある。

- CRDをアップグレードした場合に、スキーマに機能廃止があると、カスタムリソースで廃止されたその機能を使用できなくなる。
- CRD自体を誤って削除すると、これに対応するカスタムリソースも自動的に削除される。

> ↪️ 参考：
>
> - https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
> - https://www.amazon.co.jp/dp/B08FZX8PYW

<br>

### カスタムリソース固有の問題

#### ▼ 共通エラー

以下のようなエラーになる場合、カスタムリソース定義が存在していないか、カスタムリソース定義が古くて新しいカスタムリソースが対応していない可能性がある。

```bash
Failed to render chart: exit status 1: Error: unable to build kubernetes objects from release manifest: error validating ""
```

#### ▼ 個別

メモ程度に、カスタムリソースで起こった固有の問題を記載しておく。

| 問題                                                                                                                                                                   | 解決策                                                                                                                                                                                                       | 該当のカスタムリソース |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| `.spec.affinity`キーの変更を適用するために、Podを再スケジューリングした。`.spec.affinity`キーの設定が機能せず、変更前と同じNodeにPodが再スケジューリングされてしまう。 | PersistentVolumeが再作成されておらず、既存のPersistentVolumeに紐付けるために、同じNodeにPodが再スケジューリングされている可能性がある。Podを再スケジューリングした後に、すぐにPersistentVolumeも再作成する。 | Prometheus系           |

<br>

## 01-02.セットアップ

### ユーザーによる管理

#### ▼ 非チャートとして

カスタムリソース定義のマニフェストを送信し、その後にカスタムリソースのマニフェストを送信する。

もしカスタムリソース定義を送信する前にカスタムリソースを送信してしまうと、kube-apiserverはカスタムリソース定義を見つけられずに、以下のエラーレスポンスを返信する。

```log
the server could not find the requested resource
```

#### ▼ チャートとして

カスタムリソース定義とカスタムリソースを含むチャートをインストールする。

<br>

### カスタムコントローラーによる管理

#### ▼ 非チャートとして

カスタムコントローラーのマニフェストを送信し、後はカスタムコントローラーにカスタムリソースを作成させる。

#### ▼ チャートとして

カスタムコントローラーのチャートをインストールし、後はカスタムコントローラーにカスタムリソースを作成させる。

<br>

## 01-03. カスタムリソース定義

### カスタムリソース定義とは

カスタムリソースを宣言的に定義する。

ただし、kube-controllerはetcd内のカスタムリソースを検知できず、これを検知するためにはカスタムコントローラーを作成する必要がある。

<br>

### カスタムリソースの宣言値の決まり方

マニフェストの`.apiVersion`キーで、『`<.spec.groupキー名>/<.spec.versionキー名>`』と宣言し、カスタムリソースを使用する。

例えば『`example.com`』というグループと『`v1`』というバージョンを定義したとすると、カスタムリソースからは`example.com/v1`というAPIからコールできるようになる。

> ↪️ 参考：
>
> - https://hi1280.hatenablog.com/entry/2019/11/15/003101
> - https://www.takutakahashi.dev/lazy-custom-controller-for-kubernetes/

<br>

### .apiVersion

カスタムリソース定義自体のAPIグループの名前を設定する。

```yaml
apiVersion: apiextensions.k8s.io/v1
```

<br>

### .metadata

#### ▼ name

カスタムリソースのAPIグループの名前を設定する。

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

カスタムリソースが属するAPIグループの名前を設定する。

カスタムリソースを管理する組織の完全修飾ドメイン名にすると良い。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  group: example.com
```

> ↪️ 参考：
>
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

<br>

### .spec.scope

#### ▼ scopeとは

カスタムリソースが存在可能な領域の範囲を設定する。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Namespaced
```

> ↪️ 参考：
>
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

#### ▼ Clusterの場合

同じカスタムリソースがCluster内に`1`個のみ存在できるようにする。

Namespaceごとにカスタムリソースを作成できなくなる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Cluster
```

> ↪️ 参考：
>
> - https://uzimihsr.github.io/post/2021-07-12-kubernetes-crd-controller-practice/#crd%E3%81%AE%E4%BD%9C%E6%88%90
> - https://developer.ibm.com/tutorials/kubernetes-custom-resource-definitions/

#### ▼ Namespacedの場合

同じカスタムリソースがNamespace内に`1`個のみ存在できるようにする。

Namespaceごとにカスタムリソースを作成できるようになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Namespaced
```

> ↪️ 参考：
>
> - https://uzimihsr.github.io/post/2021-07-12-kubernetes-crd-controller-practice/#crd%E3%81%AE%E4%BD%9C%E6%88%90
> - https://developer.ibm.com/tutorials/kubernetes-custom-resource-definitions/

<br>

### .spec.names

#### ▼ namesとは

カスタムリソースの名前を設定する。

#### ▼ kind

カスタムリソースの`.kind`キー名を設定する。

例えば『`Foo`』という宣言名にすると、マニフェストの`.kind`キーで、`Foo`というカスタムリソース名で使用できるようになる。

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

> ↪️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ plural

`kubectl`コマンドで使用するカスタムリソースの複数形名を設定する。

例えば『`foos`』という宣言名にすると、`kubectl`コマンドで`foos`というカスタムリソース名で使用できるようになる。

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

> ↪️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ singular

`kubectl`コマンドで使用するカスタムリソースの単数形名を設定する。

例えば『`foo`』という宣言名にすると、`kubectl`コマンドで`foo`というカスタムリソース名で使用できるようになる。

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

> ↪️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ shortNames

`kubectl`コマンドで使用するカスタムリソースの省略名を設定する。

例えば『`fo`』という宣言名にすると、`kubectl`コマンドで`fo`というカスタムリソース名で使用できるようになる。

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

> ↪️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

<br>

### .spec.versions

#### ▼ versionsとは

カスタムリソース定義に対応するカスタムリソースに関して、APIグループのバージョンを設定する。

複数のバージョンのカスタムリソース定義をCluster内で同時に管理する場合、`.spec.versions[].name`キー配下に複数のスキーマを定義する。

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

> ↪️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/#specify-multiple-versions

#### ▼ name

APIグループのバージョン名を設定する。

例えば『`v1`』というstring型のキーを設定すると、マニフェストの`.apiVersion`で、`/v1`を最後につけてコールすることになる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - name: v1
```

> ↪️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

#### ▼ served

APIグループのバージョンを有効化するかを設定する。

もしカスタムリソースに複数のバージョンが存在する場合、旧バージョンを無効化し、マニフェストで使用できないようにできる。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - served: true
```

> ↪️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

#### ▼ schema

カスタムリソースの`.spec`キー以下に設定できるキーと、これのデータ型を設定する。

例えば『`message`』というstring型のキーを設定すると、カスタムリソースの`.spec.message`キーに任意のstring型を設定できるようになる。

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

> ↪️ 参考：
>
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#specifying-a-structural-schema
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

#### ▼ storage

APIグループのバージョンをetcdのストレージに保存してもよいどうかを設定する。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - storage: true
```

> ↪️ 参考：
>
> - https://stackoverflow.com/questions/69558910/what-does-storage-means-in-kubernetes-crd
> - https://speakerdeck.com/uesyn/k8s-storage-version-migration?slide=5

<br>
