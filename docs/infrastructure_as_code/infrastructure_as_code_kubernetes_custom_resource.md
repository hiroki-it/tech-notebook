---
title: 【IT技術の知見】カスタムリソース@Kubernetes
description: カスタムリソース@Kubernetesの知見を記録しています。
---

# カスタムリソース@Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。



> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. カスタムリソース

### カスタムリソースとは

Kubernetesに標準で備わっていないKubernetesリソースを提供する。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
> - https://www.amazon.co.jp/dp/B08FZX8PYW

<br>

### カスタムリソース固有の問題

メモ程度に、カスタムリソースで起こった固有の問題を記載しておく。



| 問題                                                                                                                         | 解決策                                                                                                                                              | 該当のカスタムリソース |
|----------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| ```spec.affinity```キーの変更を適用するために、Podを再スケジューリングした。```spec.affinity```キーの設定が機能せず、変更前と同じNodeにPodが再スケジューリングされてしまう。 | PersistentVolumeが再作成されておらず、既存のPersistentVolumeに紐づけるために、同じNodeにPodが再スケジューリングされている可能性がある。Podを再スケジューリングした後に、すぐにPersistentVolumeも再作成する。 | Prometheus系  |

<br>

## 01-02.セットアップ

### ユーザーによる管理

#### ▼ マニフェストとして

カスタムリソース定義のマニフェストを送信し、その後にカスタムリソースのマニフェストを送信する。

もしカスタムリソース定義を送信する前にカスタムリソースを送信してしまうと、kube-apiserverはカスタムリソース定義を見つけられずに、以下のエラーレスポンスを返信する。

```log
the server could not find the requested resource
```

#### ▼ チャートとして

カスタムリソース定義とカスタムリソースを含むチャートをインストールする。



<br>

### カスタムコントローラーによる管理

#### ▼ マニフェストとして

カスタムコントローラーのマニフェストを送信し、後はカスタムコントローラーにカスタムリソースを作成させる。



#### ▼ チャートとして

カスタムコントローラーのチャートをインストールし、後はカスタムコントローラーにカスタムリソースを作成させる。



<br>

## 01-03. カスタムリソース定義

### カスタムリソース定義とは

カスタムリソースを宣言的に定義する。

ただし、kube-controllerはetcd内のカスタムリソースを検知できず、これを検知するためにはカスタムコントローラーを作成する必要がある。

> ℹ️ 参考：
>
> - https://hi1280.hatenablog.com/entry/2019/11/15/003101
> - https://www.takutakahashi.dev/lazy-custom-controller-for-kubernetes/

### apiVersion

カスタムリソース定義自体のAPIグループの名前を設定する。



```yaml
apiVersion: apiextensions.k8s.io/v1
```

<br>

### metadata

#### ▼ name

カスタムリソースのAPIグループの名前を設定する。『```<pluralキー名>.<groupキー名>```』とする必要がある。

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
```

<br>

### spec.group

#### ▼ groupとは

カスタムリソースが属するAPIグループの名前を設定する。

例えば『```example.com```』というグループに定義とすると、```example.com/v1```というAPIからコールできるようになる。

カスタムリソースを管理する組織の完全修飾ドメイン名にすると良い。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  group: example.com
```

### spec.scope

#### ▼ scopeとは

カスタムリソースがNamespaceあるいはClusterのいずれかに属するかを設定する。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Namespaced
```

<br>

### spec.names

#### ▼ namesとは

カスタムリソースの様々な場面での名前を設定する。



#### ▼ kind

カスタムリソースの```kind```キー名を設定する。

例えば『```Foo```』という宣言名にすると、マニフェストの```kind```キーで、```Foo```というカスタムリソース名で使用できるようになる。



> ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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
spec:
  ...
```

#### ▼ plural

カスタムリソースをAPIからコールする時のURLで使用するリソースの複数形名を設定する。



> ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  names:
    plural: foo
```

#### ▼ singular

```kubectl```コマンドで使用するカスタムリソースの単数形名を設定する。



> ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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

#### ▼ shortNames

```kubectl```コマンドで使用するカスタムリソースの省略名を設定する。



> ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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

<br>

### versions

#### ▼ name

APIのバージョン名を設定する。

例えば『```v1```』というstring型のキーを設定すると、マニフェストの```apiVersion```で、```/v1```を最後につけてコールすることになる。



> ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - name: v1
```

#### ▼ served

APIのバージョンを有効化するかを設定する。

もしカスタムリソースに複数のバージョンが存在する場合、旧バージョンを無効化し、マニフェストで使用できないようにできる。



> ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - served: true
```

#### ▼ schema

カスタムリソースの```spec```キー以下に設定できるキーを設定する。

例えば『```message```』というstring型のキーを設定すると、カスタムリソースの```spec.message```キーに任意の文字列を設定できるようになる。

カスタムリソース内部のPodのデプロイ戦略は、Deployment、StatefulSet、DaemonSet、の設定値によって決まることになる。



> ℹ️ 参考：
>
> - https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#specifying-a-structural-schema
> - https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

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
                message: # カスタムリソースのspec.messageキーに文字列を設定できるようになる。
                  type: string
```

#### ▼ storage

APIのバージョンをetcdのストレージに保存してもよいどうかを設定する。



> ℹ️ 参考：
>
> - https://stackoverflow.com/questions/69558910/what-does-storage-means-in-kubernetes-crd
> - https://speakerdeck.com/uesyn/k8s-storage-version-migration?slide=5

```yaml
apiVersion: apiextensions.k8s.io/v1beta1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  versions:
    - storage: true
```

<br>

## 02. カスタムコントローラー

### カスタムコントローラーとは

カスタムリソースのためのkube-controllerに相当する。

ただし、kube-controllerとは異なり、Node上で稼働する。

カスタムコントローラーは、kube-apiserverを介して、etcdにwatchイベントを送信している。

カスタムリソースのバインディング情報がetcdに永続化されたことを検知した場合に、kube-apiserverを介して、kubeletにカスタムリソースの作成リクエストを送信する。

加えて、カスタムリソースのマニフェストの設定値をコマンド（例：```kubectl apply```コマンド、```kubectl edit```コマンド、など）で変更した場合に、etcd上でカスタムリソースのマニフェストを検知し、実際にカスタムリソースの設定値を都度変更してくれる。

これらのコマンドは、etcd上のマニフェストの設定値を変更しているのみで、実際のカスタムリソースの設定値を変更しないことに注意する。

また、カスタムコントローラーはカスタムリソースのKubernetesリソース以外を作成することもできる。

etcd上のカスタムリソースに応じて、外部サービスのAPI（例：証明書のFastly）をコールし、カスタムリソースと対になるもの（例：Fastlyの証明書）を作成することも可能である。

kube-controller-managerは、Nodeにあるoperator-controllerを反復的に実行する。

これにより、カスタムリソースはカスタムリソース定義の宣言通りに定期的に修復される（reconciliationループ）。

ただし、カスタムコントローラー自体は```kubectl```クライアントが作成する必要がある。

> ℹ️ 参考：https://youtu.be/pw8AVOJQ5uw?t=1372

<br>

### セットアップ

#### ▼ 既にあるものを使用する

> ℹ️ 参考：https://github.com/mercari/certificate-expiry-monitor-controller

#### ▼ 自前で実装する

カスタムコントローラーを自前で実装する。



> ℹ️ 参考：
>
> - https://zenn.dev/hhiroshell/articles/custom-controller-for-out-of-cluster-events
> - https://github.com/hhiroshell/storage-bucket-prober/blob/main/controllers/storagebucket_controller.go

<br>

## 03. Operatorパターン

### Operatorパターンとは

カスタムコントローラーを内蔵し、特定のカスタムリソースをセットアップする責務を持つ。



> ℹ️ 参考：https://zoetrope.github.io/kubebuilder-training/

<br>

### Operatorパターンの仕組み

#### ▼ アーキテクチャ

![kubernetes_operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator_architecture.png)

Operatorパターンは、カスタムリソース、カスタムコントローラーのoperator-controller、認可スコープ付与リソース、から構成されている。

> ℹ️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
> - https://www.netone.co.jp/knowledge-center/netone-blog/20200629-1/

#### ▼ operator-controller

![kubernetes_operator-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator-controller.png)

カスタムコントローラーとして動作する。operator-controllerが稼働している状況で、etcdにカスタムリソース定義を永続化したとする。operator-controllerは、NodeとPod間のバインディング情報に基づいて、kubeletにカスタムリソースを作成させる。operator-controllerに不具合があると、etcd上のカスタムリソース定義の通りにカスタムリソースが作成されない。

> ℹ️ 参考：
>
> - https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
> - https://stackoverflow.com/questions/47848258/what-is-the-difference-between-a-kubernetes-controller-and-a-kubernetes-operator
> - https://www.howtogeek.com/devops/what-are-kubernetes-controllers-and-operators/

#### ▼ 認可スコープ付与リソース

operator-controllerがkube-apiserverにリクエストを送信できるように、operator-controllerに認可スコープを付与する。ClusterRoleBinding、ClusterRole、ServiceAccount、などから構成されている。

> ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

<br>

## 04. Operatorの開発

### 既存のOperatorをカスタマイズする場合

#### ▼ client-goコンポーネント

調査中...

> ℹ️ 参考：
> 
> - https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md#client-go-components
> - https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22

#### ▼ custom-controller-componentsコンポーネント

調査中...

> ℹ️ 参考：
> 
> - https://github.com/kubernetes/sample-controller/blob/master/docs/controller-client-go.md#custom-controller-components
> - https://wqwq3215.medium.com/client-go-work-queue%E3%82%92%E7%90%86%E8%A7%A3%E3%81%99%E3%82%8B-6d42614c7c22

<br>

### 自前のOperatorを作成する場合

#### ▼ OperatorFrameworkとは

Operatorを開発するためのフレームワークのこと。

OperatorHubで公開されている。



> ℹ️ 参考：
> 
> - https://www.redhat.com/en/blog/introducing-operator-framework-building-apps-kubernetes
> - https://operatorhub.io/

#### ▼ Operator SDK

Operatorを、開発、テスト、リリース、ために必要なツールを提供する。



#### ▼ Operator Lifecycle Manager

Operatorの、作成、削除、を管理する。



#### ▼ Operator Metering

調査中...


<br>

