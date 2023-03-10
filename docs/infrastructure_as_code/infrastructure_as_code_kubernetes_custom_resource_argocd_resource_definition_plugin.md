---
title: 【IT技術の知見】プラグイン＠リソース定義
description: プラグイン＠リソース定義の知見を記録しています。
---

# プラグイン＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. プラグイン

### セットアップ

#### ▼ 連携先ツールのインストール

ArgoCDと任意のツールを連携するためには、`argocd-repo-server`コンテナが連携先ツールを使用できるように、以下の方法でツールをインストールする必要がある。

補足として、執筆時点 (2022/10/31) では、いくつかのツール (例：Helm、Kustomize、Ks、Jsonnet、など) が`argocd-repo-server`コンテナのイメージにあらかじめインストールされている。

- 連携先ツールがすでにインストールされた`argocd-repo-server`コンテナのイメージを使用する。
- Podの`.spec.initContainers.args`キーでInitContainerに連携先ツールをインストールし、`.spec.initContainers.volumeMounts`キーでコンテナのボリュームに連携先ツールを配置する。これにより、Podのストレージに連携先ツールを配置できるため、`argocd-repo-server`コンテナでは自身のボリュームを介して、Podのストレージ上の連携先ツールを使用できる。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://kobtea.net/posts/2021/05/08/argo-cd-helmfile/#%E6%A6%82%E8%A6%81

#### ▼ 必要なマニフェストの作成

ツールとの連携にはマニフェストを定義する必要がある。

ConfigManagementPluginsでそれらの処理を定義する。

ConfigMapの`.data.configManagementPlugins`キーで設定することは非推奨である。

これらの処理は、ArgoCDのリポジトリの監視処理と同時に実行されるため、何らかのエラーがあると、監視処理のエラーとして扱われる。

Applicationの`.spec.source.plugin.env`キーで設定した環境変数が、`ARGOCD_ENV_<環境変数名>`で出力される。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigManagementPlugin
metadata:
  namespace: argocd
  name: foo-plugin-argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
spec:
  init:
    command: ["/bin/bash", "-c"]
    args:
      - |
        # マニフェストの作成前に実行したい処理を定義する。
  generate:
    command: ["/bin/bash", "-c"]
    args:
      - |
        # 必要なマニフェストを定義する。
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#convert-the-configmap-entry-into-a-config-file

#### ▼ プラグイン名の指定

Applicationの`.spec.plugin.name`キーで、`.data.configManagementPlugins`キーで設定した独自のプラグイン名を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
  targetRevision: main
  path: .
  plugin:
    name: foo-plugin
```

<br>

### 環境変数

ArgoCDと連携したツールでは、コマンドで以下の環境変数を使用できる。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/build-environment/

<br>

## 02. Helmfileとの連携

### セットアップ

#### ▼ Helmfileのインストール

`argocd-repo-server`コンテナがHelmfileを使用できるように、Helmfileをインストールする。

ArgoCDとHelmfileを連携すれば、`helmfile`コマンドを宣言的に実行しつつ、実行を自動化できる。

`helm`コマンドを宣言的に実行するのであれば、`.spec.source.helm`キーを使用すれば十分ではあるが、`helmfile`を使用すればHelmfileの機能 (例：複数の`values`ファイルを参照する、など) も活用できる。

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
    - name: install-helmfile
      image: alpine:3.8
      command: ["/bin/bash", "-c"]
      # InitContainerにHelmfileをインストールする。
      args:
        - |
          apk --update add wget
          wget -q -O /custom-tools/helmfile https://github.com/roboll/helmfile/releases/download/v0.141.0/helmfile_linux_amd64
          chmod +x /custom-tools/*
      # PodのボリュームにHelmfileを配置する。
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools
```

> ↪️ 参考：
>
> - https://github.com/travisghansen/argo-cd-helmfile#installation
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://lyz-code.github.io/blue-book/devops/helmfile/#installation

#### ▼ 必要なマニフェストの作成

`helmfile template`コマンドを実行し、マニフェストファイルを作成する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigManagementPlugin
metadata:
  namespace: argocd
  name: helmfile-argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
spec:
  generate:
    command: ["/bin/bash", "-c"]
      args:
        - |
          set -euo pipefail
          helmfile -f $ARGOCD_ENV_HELMFILE -e $ARGOCD_ENV_RELEASE_ENV" template"
```

> ↪️ 参考：
>
> - https://github.com/travisghansen/argo-cd-helmfile#installation
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin

#### ▼ プラグイン名の指定

Applicationでプラグイン名を指定する。

> ↪️ 参考：https://github.com/travisghansen/argo-cd-helmfile#intro

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
  targetRevision: main
  path: .
  plugin:
    name: helmfile
    env:
      - name: HELMFILE
        value: ./helmfile.yaml
      - name: ENV
        value: prd
```

<br>

## 03. helm-secretsとの連携

### セットアップ (共通手順)

#### ▼ helm-secretsのインストール

`argocd-repo-server`コンテナがhelm-secretsを使用できるように、helm-secretsをインストールする。

**＊実装例＊**

ここでは、InitContainerを使用して、helm-secretsをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: argocd-repo-server

      ...

      # Podのボリュームを介して、argocd-repo-serverのコンテナ内でSOPSを使用する。
      volumeMounts:
        - mountPath: /usr/local/bin/sops
          name: custom-tools
          subPath: sops
  volumes:
    - name: custom-tools
      emptyDir: {}
  initContainers:
    - name: install-helm-secrets
      image: alpine:3.8
      command: ["/bin/bash", "-c"]
      # InitContainerに、sops、helm-secrets、をインストールする。
      args:
        - |
          apk --update add wget
          wget -q -O /custom-tools/sops https://github.com/mozilla/sops/releases/download/<sopsのバージョン>/sops-<sopsのバージョン>.linux
          wget -q -O /custom-tools/helm-secrets https://github.com/jkroepke/helm-secrets/releases/download/<Helmのバージョン>/helm-secrets.tar.gz | tar -C /custom-tools/helm-secrets -xzf-
          chmod +x /custom-tools/*
      # Podのボリュームに、sops、helm-secrets、を配置する。
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools
```

> ↪️ 参考：
>
> - https://github.com/jkroepke/helm-secrets/wiki/ArgoCD-Integration#installation-on-argo-cd
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling

<br>

## 03-02. `.spec.plugin`キー配下で使用する場合

### セットアップ

#### ▼ 必要なマニフェストの作成

`helm secrets template`コマンドを実行し、マニフェストファイルを作成する。

新しい`helm-secrets`はjkroepke製であり、古いものはzendesk製である。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigManagementPlugin
metadata:
  namespace: argocd
  name: helm-secrets-argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
spec:
  generate:
    command: ["/bin/bash", "-c"]
    # jkroepke製のhelm-secretsの場合
    # 暗号化されたvaluesファイル (sopsのsecretsファイル) 、平文のvaluesファイル、を使用してhelmコマンドを実行する。
    args:
      - >
        set -euo pipefail &&
        if [ -z "$VALUES" ];then
          helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE
        else              
          helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE -f $ARGOCD_ENV_VALUES_FILE
        fi
```

特に、zendesk製のhelm-secretsでは、helm secrets templateコマンドの出力内容の末尾に`decrypted`の文字が出力されるため、`| sed '$d'`が必要になる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigManagementPlugin
metadata:
  namespace: argocd
  name: helm-secrets-argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
spec:
  generate:
    command: ["/bin/bash", "-c"]
    # zendesk製のhelm-secretsの場合
    # 暗号化されたvaluesファイル (sopsのsecretsファイル) 、平文のvaluesファイル、を使用してhelmコマンドを実行する。
    args:
      - >
        set -euo pipefail &&
        if [ -z "$VALUES" ];then
          helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE | sed '$d'
        else              
          helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE -f $ARGOCD_ENV_VALUES_FILE | sed '$d'
        fi
```

> ↪️ 参考：
>
> - https://hackernoon.com/how-to-handle-kubernetes-secrets-with-argocd-and-sops-r92d3wt1
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin

#### ▼ プラグイン名の指定

Applicationでプラグイン名を指定する。

また、必要な環境変数を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
  targetRevision: main
  path: .
  plugin:
    name: helm-secrets
    env:
      - name: HELM_RELEASE_NAME
        value: foo
      - name: SOPS_SECRETS_FILE
        value: ./sops/secret.prd.yaml
      - name: VALUES_FILE
        value: ./values/values-prd.yaml
```

<br>

## 03-03. `.spec.source.helm`キー配下で使用する場合

### クラウドプロバイダー上の暗号化キーを使用する場合

#### ▼ ServiceAccountの作成

`argocd-repo-server`コンテを持つPodに紐づけるServiceAccountを作成する。

ServiceAccountにはクラウドプロバイダーの認可スコープ (例：AWS IAMロール) を紐付け、暗号化キーを使用できるようにする。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argocd-repo-server
  namespace: argocd
  annotations:
    # AWS KMSに認可スコープを持つIAMロールと紐づけられるようにする。
    eks.amazonaws.com/role-arn: <IAMロールのARN>
automountServiceAccountToken: true
```

> ↪️ 参考：https://github.com/jkroepke/helm-secrets/wiki/ArgoCD-Integration#external-key-location

#### ▼ helm-secretsの使用

監視しているリポジトリのルート直下に、以下のような`.sops.yaml`ファイルが配置されているとしている。

```yaml
---
creation_rules:
  - kms: <AWS KMSのARN>
    encrypted_regex: "^secureJsonData$"
```

helm-secretsプラグインを使用するために、`.spec.source.helm.valueFiles`キー配下で`secrets://<secretsファイル>`を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
    targetRevision: main
    path: .
    helm:
      valueFiles:
        - values.yaml
        - secrets://secrets.yaml
```

> ↪️ 参考：https://medium.com/@samuelbagattin/partial-helm-values-encryption-using-aws-kms-with-argocd-aca1c0d36323

<br>

## 04. Vaultとの連携

### セットアップ

#### ▼ Vaultのインストール

`argocd-repo-server`コンテナがVaultを使用できるように、Vaultをインストールする。

> ↪️ 参考：
>
> - https://argocd-vault-plugin.readthedocs.io/en/stable/installation/#installing-in-argo-cd
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling

#### ▼ 必要なマニフェストの作成

`helm template`コマンドを実行し、マニフェストファイルを作成する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigManagementPlugin
metadata:
  namespace: argocd
  name: vault-argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
spec:
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
        helm template $ARGOCD_ENV_HELM_RELEASE_NAME . --include-crds | argocd-vault-plugin generate -
```

> ↪️ 参考：
>
> - https://argocd-vault-plugin.readthedocs.io/en/stable/usage/#with-helm
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin

#### ▼ プラグイン名の指定

Applicationでプラグイン名を指定する。

また、必要な環境変数を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
  targetRevision: main
  path: .
  plugin:
    name: vault
    env:
      - name: HELM_RELEASE_NAME
        value: foo
```

> ↪️ 参考：https://zenn.dev/nameless_gyoza/articles/argocd-vault-plugin#%E5%85%B7%E4%BD%93%E7%9A%84%E3%81%AA%E6%89%8B%E9%A0%86

<br>
