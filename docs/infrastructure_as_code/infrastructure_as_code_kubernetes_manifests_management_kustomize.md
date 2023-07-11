---
title: 【IT技術の知見】Kustomize＠マニフェスト管理
description: Kustomize＠マニフェスト管理の知見を記録しています。
---

# Kustomize＠マニフェスト管理

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. `bases`ディレクトリ

### `kustomize.yaml`ファイル

#### ▼ `kustomize.yaml`ファイルとは

`base`ディレクトリ配下にあるファイルの処理方法を設定する。

`kubectl`コマンドで`-k`オプションを有効化すると、`kustomize.yaml`ファイルを使用できる。

`kustomize.yaml`ファイルのあるディレクトリを指定する。

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

> - https://github.com/argoproj/argo-cd/tree/master/manifests/crds

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
        - name: app
          image: app:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          volumeMounts:
            - name: app
              mountPath: /go/src
```

> - https://github.com/kubernetes-sigs/kustomize#1-make-a-kustomization-file

<br>

## 02. overlaysディレクトリ

### `kustomize.yaml`ファイル

#### ▼ `kustomize.yaml`ファイルとは

`overlays`ディレクトリ配下にあるファイルの処理方法を設定する。

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
        - name: app
          resources:
            limits:
              cpu: 7000m
```

<br>

## 03. プラグイン

### プラグインとは

Kustomizeのプラグインには、GeneratorとTransformerの種類がある。

Generator (例：SecretGenerator、ConfigMapGenerator) のプラグインは、マニフェストを作成する。

一歩でTransformerは、マニフェストを部分的に書き換える。

> - https://github.com/kubernetes-sigs/kustomize/blob/master/examples/configureBuiltinPlugin.md
> - https://blog.wnotes.net/posts/howto-make-kustomize-plugin
> - https://www.techscore.com/blog/2019/08/01/change-kustomize-build-behavior/

<br>

### 設定

#### ▼ 環境変数

プラグインをおくディレクトリを環境変数で定義する必要がある。

```bash
$ export XDG_CONFIG_HOME=$HOME/.config
$ export KUSTOMIZE_PLUGIN_HOME=$XDG_CONFIG_HOME/kustomize/plugin
```

#### ▼ ディレクトリ

環境変数の値に応じて、ディレクトリは変わる。

デフォルトでは、`$XDG_CONFIG_HOME/kustomize/plugin`ディレクトリ配下にプラグインをおく必要がある。

```bash
$ ls $XDG_CONFIG_HOME/kustomize/plugin

viaduct.ai/v1/ksops/ksops
```

<br>

### KSOPS

#### ▼ KSOPSとは

SOPSを使用して、復号化したデータをSecretにデータを注入する。

SOPSで使用できる暗号化キー (例：AWS KMS、Google CKM、GPG、PGP、など) をKSOPSでも使用できる。

> - https://github.com/viaduct-ai/kustomize-sops/blob/v3.0.0/README.md#argo-cd-helm-chart-with-custom-tooling
> - https://github.com/viaduct-ai/kustomize-sops/issues/117#issuecomment-852174964
> - https://github.com/viaduct-ai/kustomize-sops/blob/master/Dockerfile

#### ▼ セットアップ

シェルスクリプトを使用して、KSOPSに関するバイナリーをインストールする。

SOPSは内蔵されており、不要である。

```bash
$ curl -s https://raw.githubusercontent.com/viaduct-ai/kustomize-sops/master/scripts/install-ksops-archive.sh | bash
```

> - https://github.com/viaduct-ai/kustomize-sops/tree/master#1-download-and-install-ksops

<br>
