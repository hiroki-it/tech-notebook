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

ArgoCDと任意のツールを連携するためには、argocd-repo-serverが連携先ツールを使用できるようにセットアップする必要がある。

補足として、執筆時点 (2022/10/31) では、いくつかのツール (例：Helm、Kustomize、Ks、Jsonnet、など) がargocd-repo-serverのコンテナイメージにあらかじめインストールされている。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://kobtea.net/posts/2021/05/08/argo-cd-helmfile/#%E6%A6%82%E8%A6%81

#### ▼ プラグインのインストール

argocd-repo-serverのサイドカー (例：`spec.initContainers`キー、`spec.containers`キー) でプラグインを使用できるようにインストールする。

`var/run/argocd/argocd-cmp-server`ファイルをエントリポイントとする。

サイドカーのコンテナプロセスのユーザーIDは`999`とする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: repo-server
      image: quay.io/argoproj/argocd:latest
      command:
        - entrypoint.sh
      args:
        - argocd-repo-server
        - --port=8081
        - --metrics-port=8084
      volumeMounts:
        # ConfigManagementPluginのマニフェストをコンテナにマウントする
        - mountPath: /home/argocd/cmp-server/config/plugin.yaml
          name: foo-plugin
          subPath: plugin.yaml
    - name: cmp-server
      image: alpine:lastest
      command:
        - /var/run/argocd/argocd-cmp-server
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
      volumeMounts:
        - mountPath: /var/run/argocd
          name: var-files
        # cmp-serverとパケットを送受信するためのUnixドメインソケットファイルをコンテナにマウントする
        - mountPath: /home/argocd/cmp-server/plugins
          name: plugins
        # ConfigManagementPluginのマニフェストをコンテナにコンテナにマウントする
        - mountPath: /home/argocd/cmp-server/config/plugin.yaml
          subPath: plugin.yaml
          name: foo-plugin
        - mountPath: /tmp
          name: tmp-dir

    ...

  initContainers:
    # ConfigManagementPlugin用のサイドカーにargocdのバイナリをコピーするInitContainer
    - name: copyutil
      image: quay.io/argoproj/argocd:latest
      command:
        - cp
        - -n
        - /usr/local/bin/argocd
        - /var/run/argocd/argocd-cmp-server
      volumeMounts:
        - mountPath: /var/run/argocd
          name: var-files

  # Podの共有ボリューム
  volumes:
    - name: foo-plugin
      configMap:
        name: foo-plugin
    - name: plugins
      emptyDir: {}
    - name: var-files
      emptyDir: {}
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#register-the-plugin-sidecar
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/upgrading/2.3-2.4/#remove-the-shared-volume-from-any-sidecar-plugins
> - https://argo-cd.readthedocs.io/en/stable/proposals/config-management-plugin-v2/#installation
> - https://github.com/argoproj/argo-cd/discussions/8216#discussion-3808729

#### ▼ プラグインの処理の定義

ConfigManagementPluginで、プラグインの処理を設定する。

ConfigMapの`.data.configManagementPlugins`キーで設定することは非推奨である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-cm
  namespace: argocd
data:
  plugin.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      namespace: argocd
      name: foo-plugin
    spec:
      init:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            # マニフェストの作成前に実行したい処理を定義する。
      generate:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            # 必要なマニフェストを定義する。
```

これらの処理は、ArgoCDのリポジトリのwatch処理と同時に実行されるため、何らかのエラーがあると、watch処理のエラーとして扱われる。

Applicationの`.spec.source.plugin.env`キーで設定した環境変数が、`ARGOCD_ENV_<環境変数名>`で出力される。

なお、ConfigManagementPluginはカスタムリソースではないため、カスタムリソース定義は不要である。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#convert-the-configmap-entry-into-a-config-file

#### ▼ サイドカーの配置

argocd-repo-serverがプラグインを使用できるように、サイドカー (例：`spec.initContainers`キー、`spec.containers`キー) のVolumeを介して、ConfigMapの`plugin.yaml`キー配下で管理する。

#### ▼ プラグインの使用

Applicationの`.spec.plugin.name`キーで、`.data.configManagementPlugins`キーで設定した独自のプラグイン名を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
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

argocd-repo-serverがHelmfileを使用できるように、Helmfileをインストールする。

ArgoCDとHelmfileを連携すれば、`helmfile`コマンドを宣言的に実行しつつ、実行を自動化できる。

`helm`コマンドを宣言的に実行するのであれば、`.spec.source.helm`キーを使用すれば十分ではあるが、`helmfile`を使用すればHelmfileの機能 (例：複数の`values`ファイルを参照する、など) も活用できる。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にHelmfileをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: repo-server
      image: quay.io/argoproj/argocd:latest
      volumeMounts:
        # helmfileのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin/helmfile
          # Podの共有ボリュームを介して、argocd-repo-serverのコンテナ内でHelmfileを使用する。
          name: custom-tools
          subPath: helmfile

      ...


  initContainers:
    - name: install-helmfile
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerにHelmfileをインストールする。
      args:
        - |
          apk --update add wget
          wget -q -O /custom-tools/helmfile https://github.com/roboll/helmfile/releases/download/v0.141.0/helmfile_linux_amd64
          chmod +x /custom-tools/helmfile
      volumeMounts:
        # Podの共有ボリュームにHelmfileを配置する。
        - mountPath: /custom-tools
          name: custom-tools

  # Podの共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
```

> ↪️ 参考：
>
> - https://github.com/travisghansen/argo-cd-helmfile#installation
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://lyz-code.github.io/blue-book/devops/helmfile/#installation

#### ▼ helmfileの処理の定義

`helmfile template`コマンドを実行することにより、マニフェストを作成する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-cm
  namespace: argocd
data:
  helmfile.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      namespace: argocd
      name: helmfile
    spec:
      init:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            set -euo pipefail
            helm dependency build
      generate:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            set -euo pipefail
            helmfile -f $ARGOCD_ENV_HELMFILE -e $ARGOCD_ENV_RELEASE_ENV" template"
```

> ↪️ 参考：
>
> - https://github.com/travisghansen/argo-cd-helmfile#installation
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin

<br>

### プラグインの使用

Applicationでプラグイン名を指定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
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

> ↪️ 参考：https://github.com/travisghansen/argo-cd-helmfile#intro

<br>

## 03. helmプラグインとの連携

### セットアップ

#### ▼ helmプラグインのインストール

argocd-repo-serverがhelmプラグインを使用できるように、helmプラグインをインストールする。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にhelmプラグインのhelm-secretsをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: repo-server
      image: quay.io/argoproj/argocd:latest
      env:
        # helmプラグインの場所を指定する。
        - name: HELM_PLUGINS
          value: /helm-working-dir/plugins
      volumeMounts:
        # helm-secretsのバイナリファイルを置くパスを指定する。
        - mountPath: /helm-working-dir/plugins
          # Podの共有ボリュームを介して、argocd-repo-serverのコンテナ内でhelm-secretsを使用する。
          name: custom-tools
        # SOPSのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin/sops
          # Podの共有ボリュームを介して、argocd-repo-serverのコンテナ内でSOPSを使用する。
          name: custom-tools
          subPath: sops
      ...

  initContainers:
    - name: install-sops
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerに、SOPSをインストールする。
      args:
        - |
          apk --update add wget
          wget -q -O /custom-tools/sops https://github.com/mozilla/sops/releases/download/<バージョン>/sops-<バージョン>.linux
          chmod +x /custom-tools/sops
      volumeMounts:
        # Podの共有ボリュームに、SOPSを配置する。
        - mountPath: /custom-tools
          name: custom-tools
    - name: install-helm-plugins
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerに、helmプラグインをインストールする。
      args:
        - |
          apk --update add wget
          wget -q -O https://github.com/jkroepke/helm-secrets/releases/download/<バージョン>/helm-secrets.tar.gz | tar -C /helm-plugins -xzf-
          cp /helm-plugins/helm-secrets/scripts/wrapper/helm.sh /helm-working-dir/plugins
          chmod +x /helm-working-dir/plugins
      volumeMounts:
        # Podの共有ボリュームにhelmプラグインを配置する。
        - mountPath: /helm-working-dir/plugins
          name: custom-tools

  # Podの共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
```

> ↪️ 参考：
>
> - https://github.com/jkroepke/helm-secrets/wiki/ArgoCD-Integration#installation-on-argo-cd
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#using-initcontainers

<br>

### プラグインの使用

Applicationでプラグイン名を指定する。

また、必要な環境変数を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
  targetRevision: main
  path: .
  plugin:
    name: helmfile
```

<br>

## 03-02. `.spec.plugin`キー配下で使用する場合

### セットアップ

#### ▼ helmプラグインの処理の定義

helmプラグインの処理の定義する。

ここでは、`helm secrets template`コマンドでマニフェストを作成し、また変数を復号化する。

新しい`helm-secrets`はjkroepke製であり、古いものはzendesk製である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-cm
  namespace: argocd
data:
  helm-plugis.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      namespace: argocd
      name: helm-secrets
    spec:
      init:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            set -euo pipefail
            helm dependency build
      generate:
        command: 
          - /bin/bash
          - -c
        # jkroepke製のhelm-secretsの場合
        # 暗号化されたvaluesファイル (SOPSのsecretsファイル) 、平文のvaluesファイル、を使用してhelmコマンドを実行する。
        args:
          - >
            set -euo pipefail;
            if [ -z "$VALUES" ];then
              helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE;
            else              
              helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE -f $ARGOCD_ENV_VALUES_FILE;
            fi
```

特に、zendesk製のhelm-secretsでは、`helm secrets template`コマンドの出力内容の末尾に`decrypted`の文字が出力されるため、`| sed '$d'`が必要になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-cm
  namespace: argocd
data:
  helm-plugis.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      namespace: argocd
      name: helm-secrets
    spec:
      init:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            set -euo pipefail
            helm dependency build
      generate:
        command: 
          - /bin/bash
          - -c
        # zendesk製のhelm-secretsの場合
        # 暗号化されたvaluesファイル (SOPSのsecretsファイル) 、平文のvaluesファイル、を使用してhelmコマンドを実行する。
        args:
          - >
            set -euo pipefail;
            if [ -z "$VALUES" ];then
              helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE | sed '$d';
            else              
              helm secrets template $ARGOCD_ENV_HELM_RELEASE_NAME . -n $ARGOCD_APP_NAMESPACE -f $ARGOCD_ENV_SOPS_SECRETS_FILE -f $ARGOCD_ENV_VALUES_FILE | sed '$d';
            fi
```

> ↪️ 参考：
>
> - https://hackernoon.com/how-to-handle-kubernetes-secrets-with-argocd-and-sops-r92d3wt1
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin

<br>

### プラグインの使用

Applicationでプラグイン名を指定する。

また、必要な環境変数を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
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

`argocd-repo-server`コンテを持つPodに紐付けるServiceAccountを作成する。

ServiceAccountにはクラウドプロバイダーの認可スコープ (例：AWS IAMロール) を紐付け、暗号化キーを使用できるようにする。

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argocd-repo-server
  namespace: argocd
  annotations:
    # AWS KMSに認可スコープを持つIAMロールと紐付けられるようにする。
    eks.amazonaws.com/role-arn: <IAMロールのARN>
automountServiceAccountToken: true
```

> ↪️ 参考：https://github.com/jkroepke/helm-secrets/wiki/ArgoCD-Integration#external-key-location

#### ▼ helm-secretsの使用

watchしているリポジトリのルート直下に、以下のような`.sops.yaml`ファイルが配置されているとしている。

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

## 04. KSOPS

### セットアップ

#### ▼ KSOPSのインストール

argocd-repo-serverがKSOPSを使用できるように、KSOPSをインストールする。

KSOPSはコンテナイメージがあるため、軽量のInitContainerを用意するのではなく、KSOPSのコンテナイメージを使用する。

なお、KustomizeはArgoCDにデフォルトで組み込まれているため、インストールする必要はない。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にhelm-secretsをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: repo-server
      image: quay.io/argoproj/argocd:latest
      volumeMounts:
        # Kustomizeのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin/kustomize
          # Podの共有ボリュームを介して、argocd-repo-serverのコンテナ内でKustomizeを使用する。
          name: custom-tools
          subPath: kustomize
        # KSOPSのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin/ksops
          # Podの共有ボリュームを介して、argocd-repo-serverのコンテナ内でKSOPSを使用する。
          name: custom-tools
          subPath: ksops

      ...

  initContainers:
    - name: install-ksops
      image: viaductoss/ksops:v4.1.1
      command:
        - /bin/sh
        - -c
      # InitContainerにKustomizeをインストールする。
      args:
        - |
          mv ksops /custom-tools/
          mv $GOPATH/bin/kustomize /custom-tools/
      volumeMounts:
        # Podの共有ボリュームに、KSOPSを配置する。
        - mountPath: /custom-tools
          name: custom-tools

  # Podの共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
```

> ↪️ 参考：
>
> - https://github.com/viaduct-ai/kustomize-sops#argo-cd-integration-
> - https://blog.wnotes.net/posts/howto-make-kustomize-plugin
> - https://blog.devgenius.io/argocd-with-kustomize-and-ksops-2d43472e9d3b

<br>

### プラグインの使用

Applicationの`.spec.kustomize`キーで、使用するKustomizeのバージョンを指定する。

各Applicationで異なるバージョンのKustomizeを指定できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
  targetRevision: main
  path: .
  kustomize:
    version: v1.0.0
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/#custom-kustomize-versions

<br>

## 05. Vaultとの連携

### セットアップ

#### ▼ Vaultのインストール

argocd-repo-serverがVaultを使用できるように、Vaultをインストールする。

> ↪️ 参考：
>
> - https://argocd-vault-plugin.readthedocs.io/en/stable/installation/#installing-in-argo-cd
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling

#### ▼ vaultの処理の定義

`helm template`コマンドでマニフェストを作成し、またVaultで変数を復号化する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-cm
  namespace: argocd
data:
  vault.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      namespace: argocd
      name: vault
    spec:
      init:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            set -euo pipefail
            helm dependency build
      generate:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            set -euo pipefail
            helm template $ARGOCD_ENV_HELM_RELEASE_NAME . --include-crds | argocd-vault-plugin generate -
```

> ↪️ 参考：
>
> - https://argocd-vault-plugin.readthedocs.io/en/stable/usage/#with-helm
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin

<br>

### プラグインの使用

Applicationでプラグイン名を指定する。

また、必要な環境変数を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
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
