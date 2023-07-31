---
title: 【IT技術の知見】プラグイン＠リソース定義
description: プラグイン＠リソース定義の知見を記録しています。
---

# プラグイン＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. プラグイン

### プラグインとは

ArgoCDで任意のツールを使用する。

ArgoCDの仕様上、一部のツール (Helmfile、helmプラグイン、argocd-vault-plugin、など) はサイドカーでプラグインとして実行する必要がある。

そのため、これらのツールを使用せずにSecretにデータを注入する場合、プラグインは採用しなくとも良い。

<br>

### デフォルトツール

執筆時点 (2023/04/22) では、いくつかのツール (例：Helm、Kustomize、Ks、Jsonnet、など)
をApplicationのオプションとして実行できるようになっている。

すなわち、これらのrepo-serverはこれらのツールを実行できる。

`/usr/local/bin`ディレクトリ配下でバイナリを確認できる。

```bash
argocd@repo-server:/usr/local/bin] $ ls -la /usr/local/bin
total 193408
drwxr-xr-x 1 root root       224 Mar 23 15:11 .
drwxr-xr-x 1 root root        17 Mar  8 02:05 ..
-rwxr-xr-x 1 root root 138527528 Mar 23 15:11 argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-application-controller -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-applicationset-controller -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-cmp-server -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-dex -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-k8s-auth -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-notifications -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-repo-server -> /usr/local/bin/argocd
lrwxrwxrwx 1 root root        21 Mar 23 15:11 argocd-server -> /usr/local/bin/argocd
-rwxr-xr-x 1 root root       205 Mar 23 14:41 entrypoint.sh
-rwxr-xr-x 1 root root       934 Mar 23 14:41 git-verify-wrapper.sh
-rwxr-xr-x 1 root root       215 Mar 23 14:41 gpg-wrapper.sh
-rwxr-xr-x 1 root root  45125632 Mar 23 14:44 helm
-rwxr-xr-x 1 root root  14381056 Mar 23 14:44 kustomize
lrwxrwxrwx 1 root root        28 Mar 23 14:44 uid_entrypoint.sh -> /usr/local/bin/entrypoint.sh
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#custom-tooling
> - https://kobtea.net/posts/2021/05/08/argo-cd-helmfile/#%E6%A6%82%E8%A6%81
> - https://blog.devgenius.io/argocd-with-kustomize-and-ksops-2d43472e9d3b

各ツールの推奨バージョンは、以下のコマンドで取得できる。

```bash
$ curl -s https://raw.githubusercontent.com/argoproj/argo-cd/<タグ>/hack/tool-versions.sh \
    | grep version=
```

> - https://github.com/argoproj/argo-cd/blob/main/Dockerfile#L58-L62
> - https://github.com/argoproj/argo-cd/blob/main/hack/tool-versions.sh

`tool-version.sh`ファイルで定義した変数は、`install.sh`ファイルで出力されている。

Dockerfile上で`install.sh`ファイルを実行し、ツールをインストールしている。

> - https://github.com/argoproj/argo-cd/blob/master/Dockerfile#L31-L32
> - https://github.com/argoproj/argo-cd/blob/master/hack/install.sh#L26

<br>

### セットアップ

#### ▼ InitContainerで連携先ツールをインストール

連携先ツールをインストールするInitContainersを配置する。

代わりに、ユーザー定義のコンテナイメージをあらかじめ作成しておいてもよい。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server
  namespace: argocd
spec:
  containers:
    - name: argocd-repo-server
      image: quay.io/argoproj/argocd:latest


  ...

  initContainers:
    # お好きなツールをインストールするInitContainer
    # ツールごとにInitContainerを作成する
    # Helm
    - name: helm-installer
      image: alpine:3.17.3
      command:
        - /bin/sh
        - -c
      args:
        - |
          # ...
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools
    # Helmfile
    - name: helmfile-installer
      image: alpine:3.17.3
      command:
        - /bin/sh
        - -c
      args:
        - |
          # ...
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools
    # helm-secretsプラグイン
    - name: helm-secrets-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # ...
      volumeMounts:
        - name: helm-working-dir
          mountPath: /helm-working-dir/plugins
    # Kustomize
    - name: kustomize-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # ...
      volumeMounts:
        - mountPath: /custom-tools
          name: custom-tools
    # KSOPS
    - name: ksops-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # ...
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools
    # SOPS
    - name: sops-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      args:
        - |
          # ...
      volumeMounts:
        - name: custom-tools
          mountPath: /custom-tools

  # 共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
    - name: helm-working-dir
      emptyDir: {}
```

Volumeへのマウントが成功していれば、Pod内のサイドカーコンテナの`/usr/local/bin`ディレクトリで、バイナリファイルを確認できる。

```bash
# サイドカーのVolume
argocd@cmp-server:/usr/local/bin] $ ls -la

...

-rwxr-xr-x 1 root root    45125632 Mar 23 14:44 helm
-rwxr-xr-x 1 root argocd  62750720 Apr 23 10:58 helmfile
-rwxr-xr-x 1 root argocd  30818973 Apr 23 10:58 ksops
-rwxr-xr-x 1 root argocd  27399472 Apr 23 10:58 kustomize
-rwxr-xr-x 1 root argocd  29052413 May  9  2022 sops

...
```

#### ▼ サイドカーを配置

プラグインを実行するサイドカー (`cmp-server`コンテナ) を配置する。

argo-reposerverは、VolumeのUnixドメインソケットを介して、`cmp-server`コンテナのプラグインの実行をコールする。

ArgoCD公式ではサイドカーのベースイメージが用意されていない。

サイドカーで使用するベースイメージをArgoCDのコンテナイメージとするか、その他の軽量イメージ (例：alpine、busybox、ubuntu、など) とするかを選ぶことができ、いくつかのツール (
例：Helm、Kustomize、Ks、Jsonnet、など) が組み込まれていないため、インストールする必要がある。

このとき、事前準備として`argocd`コマンドをコピーするためのInitContainerが必要である。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: repo-server
      image: quay.io/argoproj/argocd:latest
      # コマンドのパラーメーターは、argocd-cmd-params-cmから渡す
      args:
        - /usr/local/bin/argocd-repo-server
        - --port=8081
        - --metrics-port=8084
      volumeMounts:
        # コンテナ間で通信するためのUnixドメインソケットファイルをコンテナにマウントする
        - mountPath: /home/argocd/cmp-server/plugins
          name: plugins
    # ConfigManagementPluginに定義した処理を実行するサイドカー
    # argocd-cmp-serverコマンドは "plugin.yaml" の名前しか指定できないため、ConfigManagementPluginごとにサイドカーを作成する
    - name: foo-plugin-cmp-server
      image: ubuntu:latest
      command:
        # エントリポイントは固定である
        - /var/run/argocd/argocd-cmp-server
      securityContext:
        runAsNonRoot: true
        # サイドカーのコンテナプロセスのユーザーIDは999とする。
        runAsUser: 999
      volumeMounts:
        - name: var-files
          mountPath: /var/run/argocd
        # コンテナ間で通信するためのUnixドメインソケットファイルをコンテナにマウントする
        - name: plugins
          mountPath: /home/argocd/cmp-server/plugins
        # リポジトリから取得したクローンを保管するディレクトリをコンテナにマウントする
        - name: tmp
          mountPath: /tmp
        # ConfigManagementPluginのマニフェスト (foo-plugin.yaml) を "plugin.yaml" の名前でコンテナにマウントする
        - name: argocd-cmp-cm
          mountPath: /home/argocd/cmp-server/config/plugin.yaml
          subPath: foo-plugin.yaml
        # 各ツールのバイナリをコンテナにマウントする
        - name: custom-tools
          mountPath: /usr/local/bin
    - name: bar-plugin-cmp-server
      image: ubuntu:latest
      command:
        - /var/run/argocd/argocd-cmp-server
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
      volumeMounts:
        - name: var-files
          mountPath: /var/run/argocd
        # コンテナ間で通信するためのUnixドメインソケットファイルをコンテナにマウントする
        - name: plugins
          mountPath: /home/argocd/cmp-server/plugins
        # リポジトリから取得したクローンを保管するディレクトリをコンテナにマウントする
        - name: tmp
          mountPath: /tmp
        - name: argocd-cmp-cm
          mountPath: /home/argocd/cmp-server/config/plugin.yaml
          subPath: bar-plugin.yaml

    ...

  initContainers:
    # ConfigManagementPlugin用のサイドカーにargocdのバイナリをコピーするInitContainer
    - name: copyutil
      image: quay.io/argoproj/argocd:latest
      command:
        - - /bin/cp
        - -n
        - /usr/local/bin/argocd
        - /var/run/argocd/argocd-cmp-server
      volumeMounts:
        - name: var-files
          mountPath: /var/run/argocd

  # Podの共有ボリューム
  volumes:
    - name: argocd-cmp-cm
      configMap:
        name: argocd-cmp-cm
    - name: plugins
      emptyDir: {}
    - name: var-files
      emptyDir: {}
    - name: tmp
      emptyDir: {}
```

`argocd-cmp-server`コマンドは、実行に成功するとVolumeにUnixドメインソケットファイルを作成する。

```bash
$ kubectl logs argocd-repo-server -c foo-plugin-cmp-server

time="2023-04-17T12:35:39Z" level=info msg="argocd-cmp-server v2.6.7+5bcd846 serving on /home/argocd/cmp-server/plugins/foo-plugin.sock"

$ kubectl exec -it argocd-repo-server -c foo-plugin-cmp-server \
    -- bash -c "ls /home/argocd/cmp-server/plugins/"

foo-plugin.sock
```

なお、`plugin.yaml`ファイルと別のディレクトリに配置したい場合は、`argocd-cmp-server`コマンドの`--config-dir-path`オプションを使用する (`plugin.yaml`
ファイルは、これ以外の名前を設定できない)。

```bash
$ kubectl exec -it argocd-repo-server -c foo-plugin-cmp-server \
    -- bash -c "argocd-cmp-server -h"

Usage:
  argocd-cmp-server [flags]

Flags:
      --config-dir-path string   Config management plugin configuration file location, Default is '/home/argocd/cmp-server/config/' (default "/home/argocd/cmp-server/config")
  -h, --help                     help for argocd-cmp-server
      --logformat string         Set the logging format. One of: text|json (default "text")
      --loglevel string          Set the logging level. One of: debug|info|warn|error (default "info")
      --otlp-address string      OpenTelemetry collector address to send traces to
```

> - https://thedatabaseme.de/2022/12/02/enhanced-with-plugins-make-argocd-more-powerful-with-plugins-running-as-sidecar/
> - https://github.com/argoproj/argo-cd/blob/master/manifests/install.yaml#L17305-L17567
> - https://argocd-operator.readthedocs.io/en/latest/usage/config_management_2.0/
> - https://github.com/argoproj/argo-cd/blob/master/examples/plugins/helm/argocd-repo-server-deployment-patch.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#register-the-plugin-sidecar
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/upgrading/2.3-2.4/#remove-the-shared-volume-from-any-sidecar-plugins
> - https://argo-cd.readthedocs.io/en/stable/proposals/config-management-plugin-v2/#installation

ArgoCDの公式の仕様で、サイドカーは単一のプラグインしか実行できない。

そのため、プラグインごとにサイドカーを作成する必要がある。

もし、部分的に重複するプラグイン (例：純粋なhelm-secrets、helm-secretsを使うHelmfile) をArgoCDが使用する場合、それぞれのサイドカーにバイナリ (
例：一方にはhelm-secrets、もう一方にはHelmfileとhelm-secrets) を用意する必要がある。

> - https://github.com/argoproj/argo-cd/discussions/12278#discussioncomment-5338514

#### ▼ argocd-cmp-cmでマニフェスト作成時の追加処理を定義

argocd-cmp-cm配下で、ConfigManagementPluginを`plugin.yaml`ファイルとして管理する。

ConfigManagementPluginで、マニフェスト作成時の追加処理を設定する。

argocd-cmp-cmの`.data.configManagementPlugins`キーで設定することは非推奨である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmp-cm
  namespace: argocd
data:
  foo-plugin.yaml: |
    apiVersion: argoproj.io/v1alpha1
    kind: ConfigManagementPlugin
    metadata:
      namespace: argocd
      name: foo-plugin
    spec:
      # マニフェストの作成前に必要なファイル (例：Chart.yamlなど) がリポジトリにあるかの確認処理を定義する
      discover:
        find:
          glob: "<正規表現>" 
      # マニフェストの作成前に実行したい処理を定義する
      init:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            # マニフェスト作成の事前処理
      # マニフェストの作成処理をプラグインの実行も含めて定義する
      generate:
        command: 
          - /bin/bash
          - -c
        args:
          - |
            # マニフェスト作成の作成処理
  bar-plugin.yaml: |
    ...
```

これらの処理は、ArgoCDのリポジトリのポーリング処理と同時に実行されるため、何らかのエラーがあると、ポーリング処理のエラーとして扱われる。

Applicationの`.spec.source.plugin.env`キーで設定した環境変数が、`ARGOCD_ENV_<環境変数名>`で出力される。

なお、ConfigManagementPluginはカスタムリソースではないため、CRDは不要である。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#sidecar-plugin
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/config-management-plugins/#convert-the-configmap-entry-into-a-config-file

#### ▼ Applicationでのプラグインを使用

Applicationの`.spec.plugin.name`キーで、`.data.configManagementPlugins`キーで設定した独自のプラグイン名を設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: foo-application
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main
    path: .
    plugin:
      name: foo-plugin
```

<br>

### 環境変数

ArgoCDと連携したツールでは、コマンドで以下の環境変数を使用できる。

| 環境変数                               |   例   | 説明                                           |
| -------------------------------------- | :----: | ---------------------------------------------- |
| `ARGOCD_RECONCILIATION_TIMEOUT`        | `180s` |                                                |
| `ARGOCD_REPO_SERVER_LOGFORMAT`         |        |                                                |
| `ARGOCD_REPO_SERVER_LOGLEVEL`          |        |                                                |
| `ARGOCD_REPO_SERVER_OTLP_ADDRESS`      |        |                                                |
| `ARGOCD_REPO_SERVER_PARALLELISM_LIMIT` |        |                                                |
| `ARGOCD_USER_ID`                       | `999`  | ArgoCDのプロセスの実行ユーザー番号を設定する。 |

> - https://argo-cd.readthedocs.io/en/stable/user-guide/build-environment/

<br>

## 02. Helmとの連携

repo-serverはHelmを実行できるため、これのサイドカーは不要である。

デフォルトでArgoCDにインストールされているHelmの推奨バージョン以外を使用したい場合、KustomizeをInitContainerでインストールする必要がある。

Helmを使用できるように、Helmをインストールする。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にHelmをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: argocd-repo-server
      image: quay.io/argoproj/argocd:latest
      volumeMounts:
        # Helmのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin/helm
          # Podの共有ボリュームを介して、コンテナ内でHelmを使用する。
          name: custom-tools

      ...

  initContainers:
    # Helm
    - name: helm-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerにHelmをインストールする。
      args:
        - |
          apk --update add wget
          wget -q https://get.helm.sh/helm-<バージョン>-linux-amd64.tar.gz
          tar -xvf helm-<バージョン>-linux-amd64.tar.gz
          cp ./linux-amd64/helm /custom-tools/
          chmod +x /custom-tools
      volumeMounts:
        # Podの共有ボリュームにHelmを配置する。
        - name: custom-tools
          mountPath: /custom-tools

  # Podの共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
```

<br>

## 03. Helmfileとの連携

### Helmfileの実行方法

repo-serverはHelmfileを実行できず、サイドカーが必要である。

<br>

### セットアップ

#### ▼ Helmfileのインストール

Helmfileを使用できるように、Helmfileをインストールする。

ArgoCDとHelmfileを連携すれば、`helmfile`コマンドを宣言的に実行しつつ、実行を自動化できる。

`helm`コマンドを宣言的に実行するのであれば、`.spec.source.helm`キーを使用すれば十分ではあるが、`helmfile`を使用すればHelmfileの機能 (例：複数の`values`
ファイルを参照する、など) も活用できる。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にHelmfileをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: helmfile-plugin-cmp-server
      image: ubuntu:latest
      command:
        - /var/run/argocd/argocd-cmp-server
      env:
        - name: HELM_CACHE_HOME
          value: /helm-working-dir
        - name: HELM_CONFIG_HOME
          value: /helm-working-dir
        - name: HELM_DATA_HOME
          value: /helm-working-dir
        - name: HELM_PLUGINS
          value: /helm-working-dir/plugins
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
      volumeMounts:
        - mountPath: /var/run/argocd
          name: var-files
        - mountPath: /home/argocd/cmp-server/plugins
          name: plugins
        - mountPath: /tmp
          name: tmp
        - mountPath: /home/argocd/cmp-server/config/plugin.yaml
          name: argocd-cmp-cm
          subPath: helmfile.yaml
        # Podの共有ボリュームを介して、コンテナ内でHelmfileを使用する。
        - mountPath: /usr/local/bin
          name: custom-tools
        - mountPath: /etc/ssl
          name: certificate
        - mountPath: /helm-working-dir
          name: helmfile-working-dir
        # Podの共有ボリュームを介して、コンテナ内でhelmプラグインを使用する。
        - mountPath: /helm-working-dir/plugins
          name: helm-working-dir


      ...


  initContainers:
    # Helmfile
    - name: helmfile-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerにHelmfileをインストールする。
      args:
        - |
          apk --update add wget
          wget -q https://github.com/helmfile/helmfile/releases/download/<バージョン>/helmfile_<バージョン>_linux_amd64.tar.gz
          tar -xvf helmfile_<バージョン>_linux_amd64.tar.gz
          cp helmfile /custom-tools/
          chmod +x /custom-tools/helmfile
          mkdir -p /helm-working-dir/plugins
          chown -R 999 /helm-working-dir
          chmod -R u+rwx /helm-working-dir
      volumeMounts:
        # Podの共有ボリュームにHelmfileを配置する。
        - name: custom-tools
          mountPath: /custom-tools
    # SOPS
    - name: sops-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerに、SOPSをインストールする。
      args:
        - |
          apk --update add wget
          wget -qO /custom-tools/sops https://github.com/mozilla/sops/releases/download/v3.7.3/sops-v3.7.3.linux
          chmod +x /custom-tools/sops
      volumeMounts:
        # Podの共有ボリュームに、SOPSを配置する。
        - name: custom-tools
          mountPath: /custom-tools
    - name: helm-plugins-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerに、helmプラグインをインストールする。
      args:
        - |
          apk --update add wget
          wget -q https://github.com/jkroepke/helm-secrets/releases/download/<バージョン>/helm-secrets.tar.gz
          tar -xvf helm-secrets.tar.gz
          cp -R helm-secrets /helm-working-dir/plugins/
          chown -R 999 /helm-working-dir/plugins/
          chmod -R u+rwx /helm-working-dir/plugins/
      volumeMounts:
        # Podの共有ボリュームにhelmプラグインを配置する。
        - name: helm-working-dir
          mountPath: /helm-working-dir/plugins

  # Podの共有ボリューム
  volumes:
    # SOPSなどを含む
    - name: custom-tools
      emptyDir: {}
    # helm-secretsを含む
    - name: helm-working-dir
      emptyDir: {}
```

> - https://github.com/travisghansen/argo-cd-helmfile#installation
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/custom_tools/#adding-tools-via-volume-mounts
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
            helmfile -f $ARGOCD_ENV_HELMFILE -e $ARGOCD_ENV_RELEASE_ENV template
```

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

> - https://github.com/travisghansen/argo-cd-helmfile#intro

<br>

## 04. helmプラグインとの連携

### helmプラグインの実行方法

repo-serverはhelmプラグインを実行できず、サイドカーが必要である。

<br>

### セットアップ

#### ▼ helmプラグインのインストール

helmプラグインを使用できるように、helmプラグインをインストールする。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にhelmプラグインのhelm-secretsをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: helm-plugin-cmp-server
      image: ubuntu:latest
      command:
        - /var/run/argocd/argocd-cmp-server
      env:
        - name: HELM_CACHE_HOME
          value: /helm-working-dir
        - name: HELM_CONFIG_HOME
          value: /helm-working-dir
        - name: HELM_DATA_HOME
          value: /helm-working-dir
        - name: HELM_PLUGINS
          value: /helm-working-dir/plugins
      securityContext:
        runAsNonRoot: true
        runAsUser: 999
      volumeMounts:
        - mountPath: /var/run/argocd
          name: var-files
        - mountPath: /home/argocd/cmp-server/plugins
          name: plugins
        - mountPath: /tmp
          name: tmp
        - mountPath: /home/argocd/cmp-server/config/plugin.yaml
          name: argocd-cmp-cm
          subPath: helm-secrets.yaml
        # SOPSのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin
          name: custom-tools
        - mountPath: /etc/ssl
          name: certificate
        # Podの共有ボリュームを介して、コンテナ内でhelm-secretsを使用する。
        - mountPath: /helm-working-dir/plugins
          name: helm-working-dir

      ...

  initContainers:
    # Helm
    - name: helm-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerにHelmをインストールする。
      args:
        - |
          apk --update add wget
          ARGOCD_VERSION=$(curl -s https://raw.githubusercontent.com/argoproj/argo-helm/argo-cd-<バージョン>/charts/argo-cd/Chart.yaml | grep appVersion | sed -e 's/^[^: ]*: //')
          HELM_RECOMMENDED_VERSION=$(curl -s https://raw.githubusercontent.com/argoproj/argo-cd/"${ARGOCD_VERSION}"/hack/tool-versions.sh | grep helm3_version | sed -e 's/^[^=]*=//')
          wget -q https://get.helm.sh/helm-v"${HELM_RECOMMENDED_VERSION}"-linux-amd64.tar.gz
          tar -xvf helm-<バージョン>-linux-amd64.tar.gz
          cp ./linux-amd64/helm /custom-tools/
          chmod +x /custom-tools
      volumeMounts:
        # Podの共有ボリュームにHelmを配置する。
        - name: custom-tools
          mountPath: /custom-tools
    # SOPS
    - name: sops-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerに、SOPSをインストールする。
      args:
        - |
          apk --update add wget
          wget -qO /custom-tools/sops https://github.com/mozilla/sops/releases/download/v3.7.3/sops-v3.7.3.linux
          chmod +x /custom-tools/sops
      volumeMounts:
        # Podの共有ボリュームに、SOPSを配置する。
        - name: custom-tools
          mountPath: /custom-tools
    - name: helm-plugins-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerに、helmプラグインをインストールする。
      args:
        - |
          apk --update add wget
          wget -q https://github.com/jkroepke/helm-secrets/releases/download/<バージョン>/helm-secrets.tar.gz
          tar -xvf helm-secrets.tar.gz
          cp -R helm-secrets /helm-working-dir/plugins/
          chown -R 999 /helm-working-dir/plugins/
          chmod -R u+rwx /helm-working-dir/plugins/
      volumeMounts:
        # Podの共有ボリュームにhelmプラグインを配置する。
        - name: helm-working-dir
          mountPath: /helm-working-dir/plugins

  # Podの共有ボリューム
  volumes:
    # SOPSなどを含む
    - name: custom-tools
      emptyDir: {}
    # helm-secretsを含む
    - name: helm-working-dir
      emptyDir: {}
```

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
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
    targetRevision: main
    path: .
    plugin:
      name: helmfile
```

<br>

## 05-02. `.spec.plugin`キー配下で使用する場合

### セットアップ

#### ▼ helmプラグインの処理の定義

helmプラグインの処理の定義する。

ここでは、`helm secrets template`コマンドでマニフェストを作成し、また変数を復号化する。

新しいhelm-secretsはjkroepke製であり、古いものはzendesk製である。

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
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
    targetRevision: main
    path: .
    plugin:
      name: helm-secrets
      env:
        - name: HELM_RELEASE_NAME
          value: foo
        - name: SOPS_SECRETS_FILE
          value: ./sops/secret.yaml
        - name: VALUES_FILE
          value: ./values/values.yaml
```

<br>

## 05-03. `.spec.source.helm`キー配下で使用する場合

### クラウドプロバイダー上の暗号化キーを使用する場合

#### ▼ ServiceAccountの作成

`repo-server`コンテを持つPodに紐付けるServiceAccountを作成する。

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

> - https://github.com/jkroepke/helm-secrets/wiki/ArgoCD-Integration#external-key-location

#### ▼ helm-secretsの使用

ポーリングしているリポジトリのルート直下に、以下のような`.sops.yaml`ファイルが配置されているとしている。

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
  namespace: argocd
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

> - https://medium.com/@samuelbagattin/partial-helm-values-encryption-using-aws-kms-with-argocd-aca1c0d36323

<br>

## 06. Kustomize

### Kustomizeの実行方法

repo-serverはKustomizeを実行できるため、これのサイドカーは不要である。

### セットアップ

#### ▼ Kustomizeのインストール

デフォルトでArgoCDにインストールされているKustomizeの推奨バージョン以外を使用したい場合、KustomizeをInitContainerでインストールする必要がある。

Kustomizeを使用できるように、Kustomizeをインストールする。

**＊実装例＊**

ここでは軽量のInitContainerを定義し、起動時にKustomizeをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: argocd-repo-server
      image: quay.io/argoproj/argocd:latest
      volumeMounts:
        # Kustomizeのバイナリファイルを置くパスを指定する。
        - mountPath: /usr/local/bin/kustomize
          # Podの共有ボリュームを介して、コンテナ内でKustomizeを使用する。
          name: custom-tools
          subPath: kustomize

      ...


  initContainers:
    # Kustomize
    # ArgoCDにデフォルトでインストールされているバージョン以外は、InitContainerでインストールする必要がある
    - name: kustomize-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerにKustomizeをインストールする。
      args:
        - |
          apk --update add wget
          wget -q https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F<バージョン>/kustomize_<バージョン>_linux_amd64.tar.gz
          tar -xvf kustomize_<バージョン>_linux_amd64.tar.gz
          cp kustomize /custom-tools/
          chmod +x /custom-tools/kustomize
      volumeMounts:
        # Podの共有ボリュームにKustomizeを配置する。
        - mountPath: /usr/local/bin/kustomize
          name: custom-tools
          subPath: kustomize

  # Podの共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
```

#### ▼ オプションの有効化

Kustomizeを使用するために、Kustomizeの起動時にオプションが必要である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  kustomize.path.<バージョン>: /usr/local/bin/kustomize
```

> - https://github.com/viaduct-ai/kustomize-sops#argo-cd-integration-

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
    # Kustomizeにデフォルトでインストールされていないバージョンを指定する
    version: v1.0.0
```

<br>

## 07. KSOPS

### KSOPSの実行方法

repo-serverはKSOPSを実行できる (`kustomize`コマンドで`--enable-alpha-plugins`オプションを有効化するだけのため) ため、これのサイドカーは不要である。

<br>

### セットアップ

#### ▼ KSOPSのインストール

KSOPSを使用できるように、KSOPSをインストールする。

KSOPSはコンテナイメージがあるため、軽量のInitContainerを用意するのではなく、KSOPSのコンテナイメージを使用する。

このコンテナイメージには、SOPSのGoバイナリが内蔵されている。

ArgoCDにデフォルトで組み込まれているKustomizeのバージョンの場合、Kustomizeをインストールする必要はない。

> - https://github.com/viaduct-ai/kustomize-sops/blob/v4.2.1/Makefile#L29-L30

**＊実装例＊**

ArgoCDのKustomize系オプションを活用するために、KSOPSはサイドカーで実行しない。

ここでは軽量のInitContainerを定義し、起動時にKSOPSをインストールする。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: argocd-repo-server
      image: quay.io/argoproj/argocd:latest
      env:
        - name: XDG_CONFIG_HOME
          value: /.config
      volumeMounts:
        # Podの共有ボリュームを介して、コンテナ内でKustomizeを使用する。
        - name: custom-tools
          # Kustomizeのバイナリファイルを置くパスを指定する。
          # ArgoCDにデフォルトでインストールされたKustomizeを上書きする
          mountPath: /usr/local/bin/kustomize
          subPath: kustomize
        # ArgoCDは、repo-server上でKustomizeを実行するための専用オプションが多く持っている
        # これを活かすためにKSOPSはサイドカーではなくrepo-serverで実行する
        - name: custom-tools
          subPath: ksops
          mountPath: /.config/kustomize/plugin/viaduct.ai/v1/ksops/ksops

      ...

  initContainers:
    # KSOPS
    # https://github.com/viaduct-ai/kustomize-sops#argo-cd-integration-
    - name: ksops-installer
      # Kustomizeのバージョンに合わせて、インストールするべきバージョンを決める
      # https://github.com/viaduct-ai/kustomize-sops/blob/master/scripts/install-kustomize.sh
      image: viaductoss/ksops:v4.1.1
      command:
        - /bin/sh
        - -c
      # InitContainerにKustomizeをインストールする。
      args:
        # Kustomizeは別のInitContainerでインストールしているため、ここではKSOPSのバイナリのみをコピーする
        - |
          cp ksops /custom-tools/
      volumeMounts:
        # Podの共有ボリュームに、KSOPSを配置する。
        - name: custom-tools
          mountPath: /custom-tools
    # Kustomize
    # ArgoCDにデフォルトでインストールされているバージョン以外は、InitContainerでインストールする必要がある
    - name: kustomize-installer
      image: alpine:latest
      command:
        - /bin/sh
        - -c
      # InitContainerにKustomizeをインストールする。
      args:
        - |
          apk --update add wget
          wget -q https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F<バージョン>/kustomize_<バージョン>_linux_amd64.tar.gz
          tar -xvf kustomize_<バージョン>_linux_amd64.tar.gz
          cp kustomize /custom-tools/
          chmod +x /custom-tools/kustomize
      volumeMounts:
        # Podの共有ボリュームにKustomizeを配置する。
        - mountPath: /usr/local/bin/kustomize
          name: custom-tools
          subPath: kustomize

  # Podの共有ボリューム
  volumes:
    - name: custom-tools
      emptyDir: {}
```

> - https://github.com/viaduct-ai/kustomize-sops#argo-cd-integration-
> - https://blog.wnotes.net/posts/howto-make-kustomize-plugin
> - https://blog.devgenius.io/argocd-with-kustomize-and-ksops-2d43472e9d3b

<br>

#### ▼ オプションの有効化

KSOPSを使用するために、Kustomizeの起動時にオプションが必要である。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  kustomize.buildOptions: --enable-alpha-plugins --enable-exec
  kustomize.path.<バージョン>: /usr/local/bin/kustomize
```

> - https://github.com/viaduct-ai/kustomize-sops#argo-cd-integration-

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

> - https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/#custom-kustomize-versions

<br>

## 08. Vaultとの連携

### Vaultの実行方法

repo-serverはVaultを実行できず、サイドカーが必要である。

<br>

### セットアップ

#### ▼ Vaultのインストール

Vaultを使用できるように、Vaultをインストールする。

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
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-charts.git
    targetRevision: main
    path: .
    plugin:
      name: vault
      env:
        - name: HELM_RELEASE_NAME
          value: foo
```

> - https://zenn.dev/nameless_gyoza/articles/argocd-vault-plugin#%E5%85%B7%E4%BD%93%E7%9A%84%E3%81%AA%E6%89%8B%E9%A0%86

<br>

## 09. 証明書

マニフェストを復号化するツールとクラウド暗号化キーを使用している場合、暗号化キーがHTTPSを要求することがある。

この時、SSL証明書をサイドカーに設定する必要がある。

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: argocd-repo-server-pod
spec:
  containers:
    - name: decrypt-plugin-cmp-server
      image: ubuntu:latest
      command:
        - /var/run/argocd/argocd-cmp-server
      volumeMounts:
        - mountPath: /etc/ssl
          name: certificate

  initContainers:
    - command:
        - /bin/sh
        - -c
      args:
        - |
          apt-get update -y
          apt-get install -y ca-certificates
          update-ca-certificates
          chown -R 999 /etc/ssl

      image: ubuntu:22.04
      name: utilities-installer
      volumeMounts:
        - mountPath: /etc/ssl
          name: certificate
```

<br>
