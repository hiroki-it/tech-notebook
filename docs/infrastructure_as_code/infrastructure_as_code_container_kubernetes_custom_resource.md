---
title: 【知見を記録するサイト】カスタムリソース@Kubernetes
description: カスタムリソース@Kubernetesの知見をまとめました。
---

# カスタムリソース@Kubernetes

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. カスタムリソース定義

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

参考：

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

参考：

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

カスタムリソースをAPIからコールするときの宣言名を設定する。例えば『```FooCrd```』という宣言名にすると、マニフェストファイルの```kind```キーで、```FooCrd```というリソース名で使用できるようになる。

参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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

参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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

kubectlコマンドで使用するリソースの単数形名を設定する。

参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: foocrds.example.com
spec:
  names:
    singular: foocrd
```

#### ▼ shortNames

kubectlコマンドで使用するリソースの省略名を設定する。

参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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

<br>

### versions

#### ▼ name

APIのバージョン名を設定する。例えば『```v1```』というstring型のキーを設定すると、マニフェストファイルの```apiVersion```で、```/v1```を最後につけてコールすることになる。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

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

APIのバージョンを有効化するかを設定する。もしカスタムリソースに複数のバージョンが存在する場合に、古いバージョンを無効化し、マニフェストファイルで使用できないようにできる。

参考：https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/

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

カスタムリソースの```spec```キー以下に設定できるキーを設定する。例えば『```message```』というstring型のキーを設定すると、マニフェストファイルの```spec.message```キーに任意の文字列を設定できるようになる。

参考：https://atmarkit.itmedia.co.jp/ait/articles/2109/10/news013.html

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
                message:
                  type: string
```

#### ▼ storage

APIのバージョンをetcdのストレージに保存してもよいどうかを設定する。

参考：https://stackoverflow.com/questions/69558910/what-does-storage-means-in-kubernetes-crd

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

## 02. IngressClassParams

<br>

## 03. Istio

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/infrastructure_as_code/infrastructure_as_code_container_kubernetes_custom_resource_istio_manifest_yaml.html

<br>

## 04. SecretProviderClass

### spec.provider

#### ▼ spec.providerとは

参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
```

<br>

### spec.parameters

#### ▼ spec.parametersとは

プロバイダーに応じて、Secretにマウントする外部Secretのデータを設定する。

参考：https://secrets-store-csi-driver.sigs.k8s.io/concepts.html

#### ▼ objects

外部Sercretを識別する情報を設定する。

参考：https://docs.aws.amazon.com/ja_jp/secretsmanager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_SecretProviderClass

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWSのシークレットマネージャーから取得する。
    objects: |
      - objectName: "arn:aws:secretsmanager:ap-northeast-1:<アカウントID>:secret:<外部Secret名>"
        objectType: "secretsmanager"
```

参考：https://docs.aws.amazon.com/ja_jp/systems-manager/latest/userguide/integrating_csi_driver.html#integrating_csi_driver_mount

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: foo-aws-secret-provider-class
spec:
  provider: aws
  parameters:
    # AWSのシステムマネージャーから取得する。
    objects: |
      - objectName: "FOO"
        objectType: "ssmparameter"
```

<br>

