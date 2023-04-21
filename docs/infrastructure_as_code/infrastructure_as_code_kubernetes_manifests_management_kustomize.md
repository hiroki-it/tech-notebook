---
title: 【IT技術の知見】Kustomize＠マニフェスト管理
description: Kustomize＠マニフェスト管理の知見を記録しています。
---

# Kustomize＠マニフェスト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `kustomize.yaml`ファイルの使用

### 使用方法

`kubectl`コマンドで`-k`オプションを有効化すると、`kustomize.yaml`ファイルを使用できる。

`kustomize.yaml`ファイルのあるディレクトリを指定する。

<br>

### -k

`kustomize.yaml`ファイルを使用して、`kubectl`コマンドを実行する。

ローカルマシンにある`kustomize.yaml`ファイルを使用する場合、`kustomize.yaml`ファイルのあるパスを指定する。

```bash
$ kubectl diff -k ./ > kustomize.diff

$ kubectl apply -k ./
```

> ↪️ 参考：https://github.com/kubernetes-sigs/kustomize#1-make-a-kustomization-file

リモートにある`kustomize.yaml`ファイルを使用する場合も、同じく`kustomize.yaml`ファイルのあるディレクトリのURLを指定する。

```bash
$ kubectl diff -k "<リポジトリのURL>/<kustomize.yamlファイルのあるディレクトリ>?ref=<タグ>" > kustomize.diff

$ kubectl apply -k "<リポジトリのURL>/<kustomize.yamlファイルのあるディレクトリ>?ref=<タグ>"
```

> ↪️ 参考：https://github.com/kubernetes-sigs/kustomize/blob/master/examples/remoteBuild.md#examples

**＊実行例＊**

例えば、argocd-cdチャートの`5.28.0`を使用する場合、これはArgoCDの`2.6.7`に対応しているため、以下の値で適用する。

```bash
$ kubectl diff -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.6.7"

$ kubectl apply -k "https://github.com/argoproj/argo-cd/manifests/crds?ref=v2.6.7"
```

例えば、aws-load-balancer-controllerチャートの`1.5.2`を使用する場合、これはaws-load-balancer-controllerの`2.5.1`に対応しているため、以下の値で適用する。

```bash
$ kubectl diff -k "https://github.com/kubernetes-sigs/aws-load-balancer-controller/helm/aws-load-balancer-controller/crds?ref=v2.5.1"

$ kubectl apply -k "https://github.com/kubernetes-sigs/aws-load-balancer-controller/helm/aws-load-balancer-controller/crds?ref=v2.5.1"
```

<br>

### kustomize

`kustomize.yaml`ファイルを使用して、テンプレートからマニフェストを作成する。

```bash
$ kubectl kustomize ./
```

> ↪️ 参考：https://note.com/shift_tech/n/nd7f17e51d592

<br>

## 01. `bases`ディレクトリ

### `kustomize.yaml`ファイル

#### ▼ `kustomize.yaml`ファイルとは

`base`ディレクトリ配下にあるファイルの処理方法を設定する。

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
