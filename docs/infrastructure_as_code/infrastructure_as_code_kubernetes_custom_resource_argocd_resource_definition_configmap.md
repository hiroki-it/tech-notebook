---
title: 【IT技術の知見】ConfigMap系＠リソース定義
description: ConfigMap系＠リソース定義の知見を記録しています。
---

# ConfigMap系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用ConfigMap

ArgoCDの各コンポーネントの機密でない変数やファイルを管理する。

ConfigMapでは、`.metadata.labels`キー配下に、必ず`app.kubernetes.io/part-of: argocd`キーを割り当てる必要がある。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#atomic-configuration

<br>

## 02. argocd-cm (必須)

### argocd-cmとは

ArgoCDの各コンポーネントで共通する値を設定する。

> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cm.yaml

<br>

### exec

#### ▼ exec.enabled

Exec機能を有効化する。

`kubectl exec`コマンドのようにして、ArgoCDのダッシュボード上からコンテナにログインできる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  exec.enabled: true
```

argocd-serverに紐づけるClusterRoleでは、Podの`exec`リソースと`create`アクションを許可する必要がある。

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  namespace: argocd
  name: argocd-server
  labels:
    app.kubernetes.io/part-of: argocd
rules:
  - apiGroups:
      - ""
    resources:
      - pods/exec
    verbs:
      - create
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/web_based_terminal/#enabling-the-terminal
> - https://qiita.com/tkusumi/items/300c566a74b6b64e7e89#rbac%E3%81%A7%E3%81%AE%E6%A8%A9%E9%99%90%E8%A8%AD%E5%AE%9A

#### ▼ exec.enabled

全てのコンテナにExecできるわけではなく、ArgoCDが対応しているシェルでログインできるコンテナにのみ、Execが可能である。

ログイン時に使用できるシェルを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  exec.shells: bash,sh,powershell,cmd
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/web_based_terminal/#changing-allowed-shells

<br>

### application.instanceLabelKey

#### ▼ application.instanceLabelKeyとは

Kubernetesリソースや子Applicationが親Applicationを識別するためのラベルのキー名を設定する。

デフォルトは`app.kubernetes.io/instance`キーであり、コンフリクトしやすいキー名なため、変更した方が良い。

ラベルのキー名は`1`個しか設定できない。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  application.instanceLabelKey: argocd.argoproj.io/instance
```

> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cm.yaml#L238

#### ▼ RootのApplication名の重複

単一のClusterでNamespaceスコープのArgoCDを構築している時、RootのApplicationを`default`というAppProjectに配置すると、この問題が起こる可能性がある。

`default`のAppProjectに所属したApplicationは、Namespaceスコープのapplication-controllerであって、他のNamespaceも見てしまうようである。

RootのApplication名が重複している場合、たとえNamespaceが異なっていても、Namespace間でRootのApplicationを共有してしまう。

ちなみに、ClusterスコープのArgoCDに限り、`spec.sourceNamespaces`キーを使用して、この重複を許可できる。

> - https://github.com/argoproj/argo-cd/issues/9420
> - https://github.com/argoproj/argo-cd/issues/2352
> - https://github.com/argoproj/argo-cd/issues/2785

<br>

### globalProjects

#### ▼ globalProjectsとは

グローバルスコープを持つ親AppProjectと、これの設定値を継承させる子AppProjectを指定する。

`labelSelector`キーで、子Projectの条件を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  globalProjects: |
    - projectName: foo-global-project
      labelSelector:
        matchExpressions:
          - key: opt
            operator: In
            values:
              - prd
```

```yaml
# グローバルスコープを持つ親AppProject
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: foo-global-project
spec: ...
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/projects/#configuring-global-projects-v18

<br>

### kustomize.buildOptions

#### ▼ kustomize.buildOptionsとは

Kustomizeの実行時に、コマンドに渡すパラメーターを設定する。

特に、Kustomizeのプラグイン (例：KSOPSなど) を使用する場合、`--enable-alpha-plugins`オプションと`--enable-exec`オプションを有効化する必要がある。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  kustomize.buildOptions: --enable-alpha-plugins --enable-exec
```

なお、`kustomize.path.<バージョン>`オプションを使用している場合、`kustomize.buildOptions.<バージョン>`オプションの使用が必須であり、バージョンごとにオプションを設定できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  kustomize.buildOptions.v1.0.0: --enable-alpha-plugins --enable-exec
  kustomize.buildOptions.v2.0.0: --enable-alpha-plugins --enable-exec
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/#kustomize-build-optionsparameters

<br>

### kustomize.path.<バージョン>

#### ▼ kustomize.path.<バージョン>とは

デフォルトのKustomizeのバージョン以外のものも使用したい場合に、そののバージョンと、バイナリファイルの置き場所を設定する。

ArgoCDで一つのバージョンのKustomizeしか使用しない場合、`kustomize.path.<バージョン>`で`/usr/local/bin/kustomize`を指定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  kustomize.path.v1.0.0: /usr/local/bin/kustomize
```

複数のバージョンのKustomizeを使用できる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  kustomize.path.v1.0.0: /usr/local/bin/kustomize_1_0_0
  kustomize.path.v2.0.0: /usr/local/bin/kustomize_2_0_0
```

#### ▼ 各ApplicationでKustomizeを使用する

Applicationの`.spec.kustomize.version`キーで、使用するKustomizeのバージョンを指定する。

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

### oidc.config

#### ▼ oidc.configとは

OIDCを使用して、ArgoCDにログインできるようにする。

#### ▼ 委譲先Webサイトに直接的に接続する場合

ArgoCDから認証フェーズの委譲先のIDプロバイダーに情報を直接的に接続する。

OIDCのIDプロバイダー (例：Auth0、GitHub、Keycloak、AWS Cognito、Google Auth) が発行したクライアントIDやクライアントシークレットを設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  admin.enabled: true

  # OIDCに必要なIDやトークンを設定する。
  oidc.config: |
    connectors:
      - type: github
        id: github
        name: GitHub SSO
        config:
          clientID: *****
          clientSecret: *****
        # dex-serverが認可レスポンスを受信するURLを設定する
        redirectURI: https://example.com/api/dex/callback

  # ArgoCDのダッシュボードのNode外公開URLを設定する。
  # 開発環境では、https://127.0.0.1:8080
  url: <URL>
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#existing-oidc-provider
> - https://argo-cd.readthedocs.io/en/stable/user-guide/external-url/
> - https://dexidp.io/docs/connectors/github/#configuration

#### ▼ Dexを介して委譲先Webサイトに接続する場合

ArgoCDから認証フェーズの委譲先のIDプロバイダーに直接的に接続するのではなく、ハブとしてのDexを使用する。

Dexは`dex-server`コンテナとして稼働させる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  admin.enabled: true

  # 必要なIDやトークンを設定する。
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub SSO
        config:
          clientID: *****
          clientSecret: *****
        # dex-serverが認可レスポンスを受信するURLを設定する
        redirectURI: https://example.com/api/dex/callback

  # ArgoCDのダッシュボードのNode外公開URLを設定する。
  # 開発環境では、https://127.0.0.1:8080
  url: <URL>
```

> - https://dexidp.io/docs/connectors/github/
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#oidc-configuration-with-dex
> - https://argo-cd.readthedocs.io/en/stable/user-guide/external-url/

<br>

### repositories

#### ▼ repositoriesとは

ConfigMapでリポジトリのURLを管理する方法は、将来的に廃止される予定である。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#legacy-behaviour

<br>

### resource.customizations.ignoreDifferences.all

#### ▼ resource.customizations.ignoreDifferences.allとは

ArgoCD全体で`.spec.ignoreDifferences`キーと同じ機能を有効化する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  resource.customizations.ignoreDifferences.all: |
    jsonPointers:
      # .spec.replicas (インスタンス数) の設定値の変化を無視する。
      - /spec/replicas
    jqPathExpressions:
      # .spec.metrics (ターゲット対象のメトリクス) の自動整形を無視する。
      - /spec/metrics
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#system-level-configuration

<br>

## 03. argocd-cmd-params-cm

### argocd-cmd-params-cmとは

ArgoCDの各コンポーネント (application-controller、dex-server、redis-server、repo-server) の起動コマンドに渡すオプションを設定する。

> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cmd-params-cm.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/additional-configuration-method/

<br>

### 複数コンポーネント

複数コンポーネントの起動コマンドのオプションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  # application-controllerとargocd-server
  application.namespaces: "<Applicationが属するNamespace>" # アクセス可能なNamespaceを設定する。AppProjectのspec.sourceNamespacesキーでも設定が必要になる。
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/#change-workload-startup-parameters
> - https://github.com/argoproj/argo-cd/issues/11638#issuecomment-1357963028

<br>

### application-controller

application-controllerの起動コマンドのオプションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  application.namespaces: "<Applicationが属するNamespace>" # アクセス可能なNamespaceを設定する。AppProjectのspec.sourceNamespacesキーでも設定が必要になる。
  controller.log.format: text
  controller.log.level: warn
  controller.operation.processors: "10"
  controller.repo.server.timeout.seconds: "60"
  controller.self.heal.timeout.seconds: "5"
  controller.status.processors: "20"
  otlp.address: ""
```

<br>

### redis-server

redis-serverの起動コマンドのオプションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  redis.server: argocd-redis:6379
```

<br>

### repo-server

repo-serverの起動コマンドのオプションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  repo.server: argocd-repo-server:8081
  reposerver.log.format: text
  reposerver.log.level: warn
  reposerver.parallelism.limit: "0"
```

<br>

### argocd-server

argocd-serverの起動コマンドのオプションを設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cmd-params-cm
  namespace: argocd
data:
  server.basehref: /
  server.dex.server: https://argocd-dex-server:5556
  server.dex.server.strict.tls: "false"
  server.disable.auth: "false"
  server.enable.gzip: "false"
  # ロードバランサーで、リクエストをHTTPで転送するように設定している場合に、argocd-serverでHTTPの受信を許可するようにする
  server.insecure: "true"
  server.log.format: text
  server.log.level: warn
  server.repo.server.strict.tls: "false"
  server.rootpath: ""
  server.staticassets: /shared/app
  server.x.frame.options: sameorigin
```

<br>

## 04. argocd-rbac-cm

ArgoCDを構成するKubernetesリソースにアクセスするための認可スコープを紐付ける。

> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-rbac-cm.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/

<br>

### 認可スコープの設定

#### ▼ 記法

Casbinの記法を使用して、ロールと認可スコープを定義しつつ、これをグループ名に紐付ける。

`readonly`と`admin`というロールは、デフォルトで定義済みである。

| 記号                 | 項目                                                                                                                | 説明                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `p` (パーミッション) | `p, <ロール名> <Kubernetesリソースの種類> <アクション名> <AppProject名>/<Namespace名>/<Kubernetesリソースの識別名>` | ロールとArgoCD系リソースの認可スコープを定義する。代わりに、RoleやClusterRoleでも定義できる。 |
| `g` (グループ)       | `g, <グループ名> <ロール名>`                                                                                        | グループにロールを紐付ける。                                                                  |

> - https://stackoverflow.com/a/73784100
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#rbac-permission-structure
> - https://github.com/argoproj/argo-cd/blob/master/assets/model.conf
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/app-any-namespace/#application-rbac

<br>

### ArgoCDで認証する場合

ロールに付与するポリシーの認可スコープは、AppProject単位にするとよい。

AppProjectに属するArgoCD系リソースのみへのアクセスを許可すれば、結果として特定のClusterへのデプロイのみを許可したことになる。

**＊実装例＊**

管理チーム (`app`、`infra`) 単位でAppProjectを作成した上で、AppProjectに属するArgoCD系リソースのみに認可スコープを持つロールを定義する。

これにより、その管理チームに所属するエンジニアしかSyncできなくなる。

- `app`ロールに、`app`のAppProjectに属するArgoCD系リソースのみを操作できる認可スコープ
- `infra`ロールに、`infra`のみを操作できる認可スコープ
- `maintainer`ロールに、`app`と`infra`の両方を操作できる認可スコープ
- 認証グループに該当する認可ロールがなければ、`readonly`になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールと認可スコープを定義する
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow
    p, role:maintainer, *, *, app/*, allow
    p, role:maintainer, *, *, infra/*, allow

    # グループにロールを紐付ける。
    g, app-team, role:app
    g, infra-team, role:infra
    g, admin, role:maintainer
  scopes: "[groups]"
```

> - https://krrrr.hatenablog.com/entry/2022/01/23/201700
> - https://qiita.com/dtn/items/9bcae313b8cb3583977e#argocd-cm-rbac-configmap-%E3%81%AE%E4%BD%9C%E6%88%90
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv
> - https://weseek.co.jp/tech/95/#SSO_RBAC
> - https://techblog.zozo.com/entry/mlops-argocd

**＊実装例＊**

実行環境 (`dev`、`prd`) 別にAppProjectを作成した上で、AppProjectに属するArgoCD系リソースのみに認可スコープを持つロールを定義する。

- `developer`ロールに、dev環境のAppProject内に属するArgoCD系リソースのみを操作できる認可スコープ
- `maintainer`ロールに、dev環境とprd環境の両方を操作できる認可スコープ
- 認証グループに該当する認可ロールがなければ、`readonly`になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールと認可スコープを定義する
    p, role:developer, *, *, dev/*, allow
    p, role:maintainer, *, *, dev/*, allow
    p, role:maintainer, *, *, prd/*, allow

    # グループにロールを紐付ける
    g, developers, role:developer
    g, maintainers, role:maintainer
  scopes: "[groups]"
```

<br>

### ArgoCDの認証をIDプロバイダーに委譲する場合 (SSOの場合)

#### ▼ IDプロバイダーのチームに紐付ける場合

IDプロバイダーに委譲する場合、グループ名はIDプロバイダーで認証されたものにする必要がある。

**＊実装例＊**

IDプロバイダー側で、チームによる認証グループがすでに存在しているとする。

以下のように、ロールと認可スコープを紐付ける。

- `app`ロールに、`app`のAppProjectに属するArgoCD系リソースのみを操作できる認可スコープ
- `infra`ロールに、`infra`のみを操作できる認可スコープ
- `maintainer`ロールに、`app`と`infra`の両方を操作できる認可スコープ
- 認証グループに該当する認可ロールがなければ、`readonly`になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールとArgoCD系リソースの認可スコープを定義する
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow
    p, role:maintainer, *, *, app/*, allow
    p, role:maintainer, *, *, infra/*, allow

    # IDプロバイダーで認証されたグループにロールを紐付ける
    g, example-org.github.com:app-team, role:app
    g, example-org.github.com:infra-team, role:infra
    g, example-org.github.com:maintainer, role:maintainer
  scopes: "[groups]"
```

**＊実装例＊**

IDプロバイダー側で、チームによる認証グループがすでに存在しているとする。

実行環境 (`dev-*`、`prd-*`) 別にAppProjectを作成した上で、AppProjectに属するArgoCD系リソースのみに認可スコープを持つロールを定義する。

以下のように、ロールと認可スコープを紐付ける。

- `app`ロールに、`dev-app`のAppProjectに属するArgoCD系リソースのみを操作できる認可スコープ
- `infra`ロールに、`dev-infra`のみを操作できる認可スコープ
- `maintainer`ロールに、`dev-app`と`dev-infra`の両方を操作できる認可スコープ
- 認証グループに該当する認可ロールがなければ、`readonly`になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールとArgoCD系リソースの認可スコープを定義する
    p, role:app, *, *, dev-app/*, allow
    p, role:infra, *, *, dev-infra/*, allow
    p, role:maintainer, *, *, dev-app/*, allow
    p, role:maintainer, *, *, dev-infra/*, allow

    # IDプロバイダーで認証されたグループにロールを紐付ける
    g, example-org.github.com:app-team, role:app
    g, example-org.github.com:infra-team, role:infra
    g, example-org.github.com:maintainer, role:maintainer
  scopes: "[groups]"
```

> - https://hatappi.blog/entry/2020/08/23/025033
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#tying-it-all-together
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv

#### ▼ IDプロバイダーのメールアドレスに紐付ける場合

IDプロバイダー側で、メールアドレスによる認証グループがすでに存在しているとする。

以下のように、ロールと認可スコープを紐付ける。

- `app`ロールに、`app`のAppProjectに属するArgoCD系リソースのみを操作できる認可スコープ
- `infra`ロールに、`infra`のみを操作できる認可スコープ
- `maintainer`ロールに、`app`と`infra`の両方を操作できる認可スコープ
- 認証グループに該当する認可ロールがなければ、`readonly`になる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  # デフォルトのロール
  policy.default: role:readonly
  policy.csv: |
    # ロールとArgoCD系リソースの認可スコープを定義する
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow
    p, role:maintainer, *, *, app/*, allow
    p, role:maintainer, *, *, infra/*, allow

    # IDプロバイダーで認証されたグループにロールを紐付ける
    g, app-team@gmail.com, role:app
    g, infra-team@gmail.com, role:infra
    g, maintainer@gmail.com, role:maintainer
  scopes: "[email]"
```

> - https://hatappi.blog/entry/2020/08/23/025033
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv

<br>

## 05. SSL証明書系ConfigMap

### SSL証明書系ConfigMapとは

argocd-server、repo-server、dex-server、はHTTPSリクエストを受信できる。

これらのコンポーネントにHTTPSリクエストを送信する場合、ConfigMap上のSSL証明書をクライアント側のコンテナにマウントする必要がある。

反対にHTTPリクエストを送信する場合は、このConfigMapが不要である。

ConfigMap上のSSL証明書の代わりに、ArgoCD外のSSL証明書 (例：CertManager) を使用しても良い。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/tls/#tls-configuration

<br>

### argocd-dex-server-tls

argocd-serverはdex-serverに対してHTTPSリクエストを送信する。

このConfigMapは、そのためのSSL証明書を管理する。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/tls/#configuring-inbound-tls-for-argocd-dex-server

<br>

### argocd-repo-server-tls

application-controller、argocd-server、はrepo-serverに対してHTTPSリクエストを送信する。

このConfigMapは、そのためのSSL証明書を管理する。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/tls/#configuring-tls-between-argo-cd-components

<br>

### argocd-server-tls

クライアントはargocd-serverに対してHTTPSリクエストを送信する。

このConfigMapは、そのためのSSL証明書を管理する。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/tls/#configuring-tls-for-argocd-server

<br>

### argocd-tls-certs-cm

ArgoCDは、ArgoCDの外 (特にリポジトリ) にHTTPSリクエストを送信する。

ArgoCDでは、コンテナイメージの`/etc/ssl`ディレクトリにデフォルトのSSL証明書が配置されているが、ユーザー定義のSSL証明書を使用したい場合がある。

このConfigMapは、そのためのユーザー定義のSSL証明書を管理する。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories-using-self-signed-tls-certificates-or-are-signed-by-custom-ca
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-tls-certs-cm.yaml

<br>

## 06. argocd-ssh-known-hosts-cm

SSH公開鍵認証でリポジトリに接続してポーリングする場合に、argocd-serverで必要な`known_hosts`ファイルを設定する。

`known_hosts`ファイルには、SSHプロコトルに必要なホスト名や秘密鍵を設定する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-ssh-known-hosts-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  ssh_known_hosts: |
    bitbucket.org ssh-rsa AAAAB ...
    github.com ecdsa-sha2-nistp256 AAAAE ...
    github.com ssh-ed25519 AAAAC ...
    github.com ssh-rsa AAAAB ...
    gitlab.com ecdsa-sha2-nistp256 AAAAE ...
    gitlab.com ssh-ed25519 AAAAC ...
    gitlab.com ssh-rsa AAAAB ...
    ssh.dev.azure.com ssh-rsa AAAAB ...
    vs-ssh.visualstudio.com ssh-rsa AAAAB ...
```

> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-ssh-known-hosts-cm.yaml

<br>
