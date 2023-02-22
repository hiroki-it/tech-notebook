---
title: 【IT技術の知見】Kustomize＠マニフェスト管理
description: Kustomize＠マニフェスト管理の知見を記録しています。
---

# Kustomize＠マニフェスト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `bases`ディレクトリ

### `kustomize.yaml`ファイル

#### ▼ `kustomize.yaml`ファイルとは

`base`ディレクトリ配下にあるファイルの処理方法を設定する。

`kubectl`コマンドで`-k`オプションを有効化すると、`kustomize.yaml`ファイルを使用してマニフェストを生成できる。

```bash
$ kubectl diff -k kustomization.yaml

$ kubectl apply -k kustomization.yaml
```

> ↪️ 参考：https://github.com/kubernetes-sigs/kustomize#1-make-a-kustomization-file

#### ▼ resources

使用するリソース定義ファイルを設定する。

**＊実装例＊**

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ./applications/deployment.yaml
```

**＊実装例＊**


```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - application-crd.yaml
  - appproject-crd.yaml
  - applicationset-crd.yaml
```

> ↪️ 参考：https://github.com/argoproj/argo-cd/tree/master/manifests/crds

<br>

### `resources`ディレクトリ

#### ▼ `リソース定義ファイル`

後の`overlays`ディレクトリの元になるリソース定義を設定する。



**＊実装例＊**

元になるリソース定義を設定する。

ここでは、Deploymentを設定する。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app.kubernetes.io/app: foo-pod
  template:
    metadata:
      labels:
        app.kubernetes.io/app: foo-pod
    spec:
      containers:
        - name: foo-gin
          image: foo-gin:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: foo-gin
              mountPath: /go/src
```

> ↪️ 参考：https://github.com/kubernetes-sigs/kustomize#1-make-a-kustomization-file

<br>

## 02. overlaysディレクトリ

### `kustomize.yaml`ファイル

#### ▼ `kustomize.yaml`ファイルとは

`overlays`ディレクトリ配下にあるファイルの処理方法を設定する。

> ↪️ 参考：
>
> - https://github.com/kubernetes-sigs/kustomize#2-create-variants-using-overlays
> - https://qiita.com/Morix1500/items/d08a09b6c6e43efa191d

#### ▼ resources

使用するリソース定義ファイルを設定する。

**＊実装例＊**

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - ./patches/deployment.replicas.yaml
  - ./patches/deployment.cpu_count.yaml
```

<br>

### `patches`ディレクトリ

#### ▼ `差分リソース定義ファイル`

`base`ディレクトリ配下のリソース定義ファイルとの差分の実装を設定する。

**＊実装例＊**

ここでは、Deploymentの差分を設定する。

`.spec.replicas`キー以下は`base`ディレクトリ配下のリソース定義ファイルで宣言されていないため、追加処理が実行される。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  replicas: 3
```

ここでは、Deploymentの差分を設定する。

`.spec.template.spec.containers[].resources`キー以下は`base`ディレクトリ配下のリソース定義ファイルで宣言されていないため、追加処理が実行される。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: foo-deployment
spec:
  template:
    spec:
      containers:
        - name: foo-gin
          resources:
            limits:
              cpu: 7000m
```

<br>
