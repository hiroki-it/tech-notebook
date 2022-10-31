---
title: 【IT技術の知見】プラグイン＠リソース定義
description: プラグイン＠リソース定義の知見を記録しています。
---

# プラグイン＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>


## 01. プラグイン

### セットアップ

#### ▼ 連携先ツールのインストール

ArgoCDと任意のツールを連携するためには、```argocd-repo-server```コンテナが連携先ツールを使用できるように、以下の方法でツールをインストールする必要がある。なお、執筆時点（2022/10/31）では、いくつかのツール（例：Helm、Kustomize、Ks、Jsonnet、など）が```argocd-repo-server```コンテナのイメージにあらかじめインストールされている。

- 連携先ツールがすでにインストールされた```argocd-repo-server```コンテナのイメージを使用する。
- Podの```spec.initContainers.args```キーでInitContainerに連携先ツールをインストールし、```spec.initContainers.volumeMounts```キーでコンテナのボリュームに連携先ツールを配置する。これにより、Podのストレージに連携先ツールを配置できるため、```argocd-repo-server```コンテナでは自身のボリュームを介して、Podのストレージ上の連携先ツールを使用できる。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://kobtea.net/posts/2021/05/08/argo-cd-helmfile/#%E6%A6%82%E8%A6%81


#### ▼ プラグイン名の設定

ConfigMapの```data.configManagementPlugins```キーで、任意の名前でプラグイン名を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: foo-plugin
```

#### ▼ 必要なマニフェストの作成

ツールとの連携にはマニフェストを作成する必要がある。ConfigMapの```data.configManagementPlugins```キーでそれらの処理を定義する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/config-management-plugins/#installing-a-cmp

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: foo-plugin
      init:
        command: ["/bin/bash", "-c"]
        args:
          - |
            # マニフェストの作成前に実行したい処理を定義する。
      generate:
        command: ["/bin/bash", "-c"]
        args:
          - |
            # 必要なマニフェストを作成する。
```


#### ▼ プラグイン名の指定

Applicationの```spec.plugin.name```キーで、```data.configManagementPlugins```キーで設定した独自のプラグイン名を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  plugin:
    name: foo-plugin
```

<br>

## 02. Helmfileとの連携

### セットアップ

#### ▼ Helmfileのインストール

```argocd-repo-server```コンテナがHelmfileを使用できるように、Helmfileをインストールする。ArgoCDとHelmfileを連携すれば、```helmfile```コマンドを宣言的に実行しつつ、実行を自動化できる。```helm```コマンドを宣言的に実行するのであれば、```spec.source.helm```キーを使用すれば十分ではあるが、```helmfile```を使用すればHelmfileの機能（例：複数の```values```ファイルを参照する、など）も活用できる。

> ℹ️ 参考：
> 
> - https://github.com/travisghansen/argo-cd-helmfile#installation
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://lyz-code.github.io/blue-book/devops/helmfile/#installation

**＊実装例＊**

ここでは、InitContainerを使用して、Helmfileをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: argocd-repo-server
      
      ...
      
      # Podのボリュームを介して、argocd-repo-serverのコンテナ内でHelmfileを使用する。
      volumeMounts:
        - mountPath: /usr/local/bin/helmfile
          name: custom-tools
          subPath: helmfile
  volumes:
    - name: custom-tools
      emptyDir: {}
  initContainers:
    - name: install-vault
      image: alpine:3.8
      command: ["/bin/bash", "-c"]
      # InitContainerにHelmfileをインストールする。
      args:
        - |
          apk --update add wget
          wget https://github.com/roboll/helmfile/releases/download/v0.141.0/helmfile_linux_amd64 -O helmfile_linux_amd64 
          chmod +x helmfile_linux_amd64
          mv helmfile_linux_amd64 /custom-tools
      # PodのボリュームにHelmfileを配置する。
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools
```


#### ▼ プラグイン名の指定

プラグイン名は```helmfile```でなくとも問題ない。


```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: helmfile
```


#### ▼ 必要なマニフェストの作成

```helmfile template```コマンドを実行し、マニフェストファイルを作成する。

> ℹ️ 参考：https://github.com/travisghansen/argo-cd-helmfile#installation

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: helm-secrets
      generate:
        command: ["/bin/bash", "-c"]
        args:
          - |
            set -euo pipefail
            helmfile -f $HELMFILE_PATH -e $ENV $SELECTOR template"
```


#### ▼ プラグイン名の指定

Applicationでプラグイン名を指定する。

> ℹ️ 参考：https://github.com/travisghansen/argo-cd-helmfile#intro

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  plugin:
    name: helmfile
    env:
      - name: HELMFILE_PATH
        value: ./helmfile.yaml
      - name: ENV
        value: prd
```


<br>

## 03. helm-secretsとの連携

### セットアップ

#### ▼ helm-secretsのインストール

```argocd-repo-server```コンテナがhelm-secretsを使用できるように、helm-secretsをインストールする。


> ℹ️ 参考：
> 
> - https://github.com/jkroepke/helm-secrets/wiki/ArgoCD-Integration#installation-on-argo-cd
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling

#### ▼ プラグイン名の指定

プラグイン名は```helm-secrets```でなくとも問題ない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: helm-secrets
```

#### ▼ 必要なマニフェストの作成

```helm secrets template```コマンドを実行し、マニフェストファイルを作成する。

> ℹ️ 参考：https://hackernoon.com/how-to-handle-kubernetes-secrets-with-argocd-and-sops-r92d3wt1

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: helm-secrets
      generate:
        command: ["/bin/bash", "-c"]
        args:
          - |
            set -euo pipefail
            helm secrets template -f $SECRETS -f $VALUES --namespace $ARGOCD_APP_NAMESPACE $ARGOCD_APP_NAME .
```

#### ▼ プラグイン名の指定

Applicationでプラグイン名を指定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  plugin:
    name: helm-secrets
```

<br>

## 04. sopsとの連携

### セットアップ

#### ▼ sopsのインストール

```argocd-repo-server```コンテナがsopsを使用できるように、sopsをインストールする。

> ℹ️ 参考：https://argocd-vault-plugin.readthedocs.io/en/stable/installation/#installing-in-argo-cd

**＊実装例＊**

ここでは、InitContainerを使用して、Helmfileをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: argocd-repo-server
      
      ...
      
      # Podのボリュームを介して、argocd-repo-serverのコンテナ内でsopsを使用する。
      volumeMounts:
        - mountPath: /usr/local/bin/sops
          name: custom-tools
          subPath: sops
  volumes:
    - name: custom-tools
      emptyDir: {}
  initContainers:
    - name: install-vault
      image: alpine:3.8
      command: ["/bin/bash", "-c"]
      # InitContainerにsopsをインストールする。
      args:
        - |
          apk add wget
          wget https://github.com/mozilla/sops/releases/download/v3.7.1/sops-v3.7.1.linux -O sops.linux 
          chmod +x sops.linux
          mv sops.linux /custom-tools
      # Podのボリュームにsopsを配置する。
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools
```



<br>


## 05. Vaultとの連携

### セットアップ

#### ▼ Vaultのインストール

```argocd-repo-server```コンテナがVaultを使用できるように、Vaultをインストールする。

> ℹ️ 参考：
>
> - https://argocd-vault-plugin.readthedocs.io/en/stable/installation/#installing-in-argo-cd
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling

#### ▼ プラグイン名の設定

プラグイン名は```vault```でなくとも問題ない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: vault
```


#### ▼ 必要なマニフェストの作成

```helm template```コマンドを実行し、マニフェストファイルを作成する。

> ℹ️ 参考：https://argocd-vault-plugin.readthedocs.io/en/stable/usage/#with-helm

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  configManagementPlugins: |
    - name: vault
      init:
        command: ["/bin/bash", "-c"]
        args:
          - |
            set -euo pipefail
            helm dependency build
      generate:
        command: ["/bin/bash", "-c"]
        args:
          - |
            set -euo pipefail
            helm template $ARGOCD_APP_NAME . --include-crds | argocd-vault-plugin generate -
```


#### ▼ プラグイン名の指定

Applicationでプラグイン名を指定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argocd-vault-plugin#%E5%85%B7%E4%BD%93%E7%9A%84%E3%81%AA%E6%89%8B%E9%A0%86

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  plugin:
    name: vault
```

<br>
