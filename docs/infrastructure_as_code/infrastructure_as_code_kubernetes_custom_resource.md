---
title: 【IT技術の知見】カスタムリソース@Kubernetes
description: カスタムリソース@Kubernetesの知見を記録しています。
---

# カスタムリソース@Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. カスタムリソース

### カスタムリソースとは

Kubernetesに標準で備わっていないKubernetesリソースを提供する。

ℹ️ 参考：

- https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/
- https://www.amazon.co.jp/dp/B08FZX8PYW

<br>

### チャートとして

#### ▼ クライアント管理

カスタムリソース自体のチャートをインストールし、クライアントがカスタムリソースを作成する。

#### ▼ Operator管理

Operatorのチャートをインストールし、後はOperatorにカスタムリソースを作成させる。

<br>

## 01-03. カスタムリソース定義

### カスタムリソース定義

カスタムリソースを宣言的に定義する。ただし、kube-controllerはetcd内のカスタムリソース定義を検知できず、これを検知するためにはカスタムコントローラーを作成する必要がある。

参考：https://hi1280.hatenablog.com/entry/2019/11/15/003101

### apiVersion

カスタムリソースを定義するためのAPIを設定する。

```yaml
apiVersion: apiextensions.k8s.io/v1
```

<br>

### kind

カスタムリソースの定義名を設定する。『```<pluralキー名>.<groupキー名>```』とする必要がある。

```yaml
metadata:
  name: foocrds.example.com
```

<br>

### spec.group

カスタムリソースが属するAPIグループを設定する。例えば『```example.com```』というグループに定義とすると、```example.com/v1```というAPIからコールできるようになる。カスタムリソースを管理する組織の完全修飾ドメイン名にすると良い。

ℹ️ 参考：

- https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
- https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  group: example.com
```

### spec.scope

カスタムリソースがNamespaceあるいはClusterのいずれかに属するかを設定する。

ℹ️ 参考：

- https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/
- https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foo.example.com
spec:
  scope: Namespaced
```

<br>

### spec.names

#### ▼ kind

カスタムリソースをAPIからコールする時の宣言名を設定する。例えば『```FooCrd```』という宣言名にすると、マニフェストファイルの```kind```キーで、```FooCrd```というカスタムリソース名で使用できるようになる。

ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  names:
    kind: FooCrd
```

#### ▼ plural

カスタムリソースをAPIからコールする時のURLで使用するリソースの複数形名を設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  names:
    plural: foocrds
```

#### ▼ singular

```kubectl```コマンドで使用するカスタムリソースの単数形名を設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  names:
    singular: foocrd
```

```bash
$ kubectl get foocrd
```

#### ▼ shortNames

```kubectl```コマンドで使用するカスタムリソースの省略名を設定する。

ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  names:
    shortNames:
      - fcrd
```

```bash
$ kubectl get fcrd
```

<br>

### versions

#### ▼ name

APIのバージョン名を設定する。例えば『```v1```』というstring型のキーを設定すると、マニフェストファイルの```apiVersion```で、```/v1```を最後につけてコールすることになる。

ℹ️ 参考：https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  versions:
    - name: v1
```

#### ▼ served

APIのバージョンを有効化するかを設定する。もしカスタムリソースに複数のバージョンが存在する場合、旧バージョンを無効化し、マニフェストファイルで使用できないようにできる。

ℹ️ 参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  versions:
    - served: true
```

#### ▼ schema

カスタムリソースの```spec```キー以下に設定できるキーを設定する。例えば『```message```』というstring型のキーを設定すると、カスタムリソースの```spec.message```キーに任意の文字列を設定できるようになる。カスタムリソース内部のPodのデプロイ戦略は、Deployment、StatefulSet、DaemonSet、の設定値によって決まることになる。

ℹ️ 参考：

- https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#specifying-a-structural-schema
- https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
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

ℹ️ 参考：

- https://stackoverflow.com/questions/69558910/what-does-storage-means-in-kubernetes-crd
- https://speakerdeck.com/uesyn/k8s-storage-version-migration?slide=5

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  versions:
    - storage: true
```

<br>

## 02. Operator

### Operatorとは

カスタムコントローラーの一種で、カスタムリソースのうちで名前付きカスタムリソース（CustomResourceDefinitionではない独自```kind```キー値）

参考：https://www.howtogeek.com/devops/what-are-kubernetes-controllers-and-operators/

<br>

### Operatorの仕組み

#### ▼ アーキテクチャ

Operatorは、operator-controller、認可スコープ付与リソース、から構成されている。

ℹ️ 参考：

- https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
- https://www.netone.co.jp/knowledge-center/netone-blog/20200629-1/


![kubernetes_operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator_architecture.png)

#### ▼ operator-controller

名前付きカスタムリソースのkube-controllerとして機能する（ただし、kube-controllerとは異なり、ワーカーNode上で稼働する）。kube-controllerと同様にして、kube-apiserverを介して、etcdにwatchイベントを送信する。名前付きカスタムリソースのバインディング情報がetcdに永続化されたことを検知した場合に、kube-apiserverを介して、kubeletに名前付きカスタムリソースの作成をコールする。またkube-controller-managerは、ワーカーNodeにあるoperator-controllerを反復的に実行する。これにより、名前付きカスタムリソースはマニフェストファイルの宣言通りに定期的に修復される（reconciliationループ）。

ℹ️ 参考：

- https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work
- https://stackoverflow.com/questions/47848258/what-is-the-difference-between-a-kubernetes-controller-and-a-kubernetes-operator

![kubernetes_operator-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator-controller.png)

#### ▼ 認可スコープ付与リソース

operator-controllerがkube-apiserverをコールできるように、operator-controllerに認可スコープを付与する。ClusterRoleBinding、ClusterRole、ServiceAccount、などから構成されている。

ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

<br>

### 一覧

ℹ️ 参考：https://operatorhub.io/

<br>

