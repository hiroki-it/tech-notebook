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

### セットアップ

#### ▼ マニフェストファイルとして

カスタムリソースのマニフェストファイルを用いて、```kubectl apply```コマンドを手動で実行し、カスタムリソースを作成する。

#### ▼ チャートとして

カスタムリソース自体のチャートをインストールし、カスタムリソースを作成する。

#### ▼ チャートとして（Operator制御）

Operatorのチャートをインストールし、Operatorにカスタムリソースを作成させる。

<br>

## 01-02. カスタムリソース定義

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

### Operatorの仕組み

#### ▼ アーキテクチャ

Operatorは、Operator-API、operator-controller、認可スコープ付与リソース、から構成されている。

ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

![kubernetes_operator_architecture](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator_architecture.png)

#### ▼ Opetator-API

operator-controllerにリクエストを送信するためのAPIを提供する。

![kubernetes_operator-api](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator-api.png)

ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

#### ▼ operator-controller

カスタムリソース定義のマニフェストファイルとKubernetes-APIを仲介し、マニフェストファイルの宣言通りにカスタムリソースを作成する。またkube-controller-managerは、operator-controllerを反復的に実行し、reconciliationループの仕組みによって、カスタムリソースを修復する。

ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

![kubernetes_operator-controller](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/kubernetes_operator-controller.png)

#### ▼ 認可スコープ付与リソース

Kubernetes-APIをコールできるように、operator-controllerに認可スコープを付与する。ClusterRoleBinding、ClusterRole、ServiceAccount、などから構成されている。

ℹ️ 参考：https://developers.redhat.com/articles/2021/06/22/kubernetes-operators-101-part-2-how-operators-work

<br>

### 一覧

ℹ️ 参考：https://operatorhub.io/

<br>

