---
title: 【IT技術の知見】ConfigMap系＠リソース定義
description: ConfigMap系＠リソース定義の知見を記録しています。
---

# ConfigMap系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用ConfigMap

ArgoCDの各コンポーネントの機密でない変数やファイルを管理する。

ConfigMapでは、`.metadata.labels`キー配下に、必ず`app.kubernetes.io/part-of: argocd`キーを割り当てる必要がある。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#atomic-configuration

<br>

## 02. argocd-cm (必須)

### argocd-cmとは

ArgoCDの各コンポーネントで共通する値を設定する。

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cm.yaml

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

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-cm.yaml#L238

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
  globalProjects: |-
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

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/projects/#configuring-global-projects-v18

<br>

### oidc.config

#### ▼ oidc.configとは

OIDCを使用して、ArgoCDにログインできるようにする。

#### ▼ 委譲先Webサイトに直接的に接続する場合

ArgoCDから認証フェーズの委譲先のWebサイトに情報を直接的に接続する。

OIDCのIDプロバイダー (例：Auth0、KeyCloak、AWS Cognito、Google Auth) が発行したクライアントIDやクライアントシークレットを設定する。

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
        # 委譲先のWebサイトがOIDCのリクエストを待ち受けるURLを設定する。
        redirectURI: https://example.com/api/dex
  # ArgoCDのダッシュボードのNode外公開URLを設定する。
  # 開発環境では、https://localhost:8080
  url: <URL>
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#existing-oidc-provider
> - https://argo-cd.readthedocs.io/en/stable/user-guide/external-url/

#### ▼ Dexを介して委譲先Webサイトに接続する場合

ArgoCDから認証フェーズの委譲先のWebサイトに直接的に接続するのではなく、ハブとしてのDexを使用する。

Dexは`dex-server`コンテナとして稼働させる。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
data:
  admin.enabled: true
  # OIDCに必要なIDやトークンを設定する。
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub SSO
        config:
          clientID: *****
          clientSecret: *****
        # 委譲先のWebサイトがOIDCのリクエストを待ち受けるURLを設定する。
        redirectURI: https://example.com/api/dex
  # ArgoCDのダッシュボードのNode外公開URLを設定する。
  # 開発環境では、https://localhost:8080
  url: <URL>
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#oidc-configuration-with-dex
> - https://dexidp.io/docs/connectors/oidc/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/external-url/

<br>

### repositories

#### ▼ repositoriesとは

ConfigMapでリポジトリのURLを管理する方法は、将来的に廃止される予定である。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#legacy-behaviour

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

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#system-level-configuration

<br>

## 03. argocd-cmd-params-cm

### argocd-cmd-params-cmとは

ArgoCDの各コンポーネント (application-controller、dex-server、redis-server、repo-server) の起動コマンドに渡すオプションを設定する。

> ↪️ 参考：
>
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
  application.namespaces: "*" # 全てのNamespaceでApplicationを作成できるようにする
```

> ↪️ 参考：
>
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
  application.namespaces: "*" # 全てのNamespaceでApplicationを作成できるようにする
  controller.log.format: text
  controller.log.level: warn
  controller.operation.processors: "10"
  controller.repo.server.timeout.seconds: "60"
  controller.self.heal.timeout.seconds: "5"
  controller.status.processors: "20"
  otlp.address: ""
```

<br>

### argocd-redis

argocd-redisの起動コマンドのオプションを設定する。

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

### argocd-repo-server

argocd-repo-serverの起動コマンドのオプションを設定する。

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
  server.insecure: "false"
  server.log.format: text
  server.log.level: warn
  server.repo.server.strict.tls: "false"
  server.rootpath: ""
  server.staticassets: /shared/app
  server.x.frame.options: sameorigin
```

<br>

## 04. argocd-rbac-cm

ArgoCDを構成するKubernetesリソースにアクセスするための認可スコープを紐づける。

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-rbac-cm.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/

<br>

### 認可スコープの設定

#### ▼ 記法

Casbinの記法を使用して、ロールと認可スコープを定義しつつ、これをグループ名に紐づける。

| 記号 | 項目                                                                                                    | 説明                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `p`  | `p, <ロール名> <Kubernetesリソースの種類> <アクション名> <プロジェクト名>/<Kubernetesリソースの識別名>` | ロールと認可スコープを定義する。代わりに、RoleやClusterRoleでも定義できる。 |
| `g`  | `g, <グループ名> <ロール名>`                                                                            | グループにロールを紐付ける。                                                |

> ↪️ 参考：
>
> - https://stackoverflow.com/a/73784100
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#rbac-permission-structure
> - https://github.com/argoproj/argo-cd/blob/master/assets/model.conf
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv

<br>

### ArgoCDで認証する場合

ロールに付与するポリシーの認可スコープは、プロジェクト単位にするとよい。

**＊実装例＊**

管理チーム (`app`、`infra`) 単位でプロジェクトを作成した上で、プロジェクト配下のみ認可スコープを持つロールを定義する。

これにより、その管理チームに所属するエンジニアしかSyncできなくなる。

- `admin`ロールに、全ての認可スコープ
- `app`ロールに、`app`プロジェクト配下の全ての認可スコープ
- `infra`ロールに、`infra`プロジェクト配下の全ての認可スコープ

なお、実行環境名は`.metadata.labels`キーに設定しておく。

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
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow

    # グループにロールを紐づける。
    g, admin, role:admin
    g, app-team, role:app
    g, infra-team, role:infra
  scopes: "[groups]"
```

> ↪️ 参考：
>
> - https://krrrr.hatenablog.com/entry/2022/01/23/201700
> - https://qiita.com/dtn/items/9bcae313b8cb3583977e#argocd-cm-rbac-configmap-%E3%81%AE%E4%BD%9C%E6%88%90
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv
> - https://weseek.co.jp/tech/95/#SSO_RBAC

**＊実装例＊**

実行環境 (`dev`、`tes`、`prd`) 別にプロジェクトを作成した上で、プロジェクト配下のみ認可スコープを持つロールを定義する。

- `admin`ロールに、全ての認可スコープ
- `app`ロールに、プロジェクト配下の全ての認可スコープ
- `infra`ロールに、プロジェクト配下の全ての認可スコープ

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
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, *, allow
    p, role:infra, *, *, *, allow

    # グループにロールを紐づける。
    g, admin, role:admin
    g, app-team, role:app
    g, infra-team, role:infra
  scopes: "[groups]"
```

<br>

### ArgoCDの認証を外部Webサイトに委譲する場合 (SSOの場合)

#### ▼ 外部Webサイトのチームに紐づける場合

**＊実装例＊**

管理チーム (`app`、`infra`) 単位でプロジェクトを作成した上で、プロジェクト配下のみ認可スコープを持つロールを定義する。

これにより、その管理チームに所属するエンジニアしかSyncできなくなる。

- `admin`ロールに、全ての認可スコープ
- `app`ロールに、`app`プロジェクト配下の全ての認可スコープ
- `infra`ロールに、`infra`プロジェクト配下の全ての認可スコープ

なお、実行環境名は`.metadata.labels`キーに設定しておく。

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
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow

    # グループにロールを紐づける。
    g, example-org.github.com:admin, role:admin
    g, example-org.github.com:app-team, role:app
    g, example-org.github.com:infra-team, role:infra
  scopes: "[groups]"
```

> ↪️ 参考：
>
> - https://hatappi.blog/entry/2020/08/23/025033
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/#tying-it-all-together
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv

**＊実装例＊**

実行環境 (`dev`、`tes`、`prd`) 別にプロジェクトを作成した上で、プロジェクト配下のみ認可スコープを持つロールを定義する。

- `admin`ロールに、全ての認可スコープ
- `app`ロールに、プロジェクト配下の全ての認可スコープ
- `infra`ロールに、プロジェクト配下の全ての認可スコープ

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
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, *, allow
    p, role:infra, *, *, *, allow

    # グループにロールを紐づける。
    g, example-org.github.com:admin, role:admin
    g, example-org.github.com:app-team, role:app
    g, example-org.github.com:infra-team, role:infra
  scopes: "[groups]"
```

#### ▼ 外部Webサイトのメールアドレスに紐づける場合

以下のように、ロールと認可スコープを紐づける。

- `admin`ロールに、全ての認可スコープ
- `app`ロールに、`app`プロジェクト配下の全ての認可スコープ
- `infra`ロールに、`infra`プロジェクト配下の全ての認可スコープ

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
    # ロールに認可スコープを紐づける。
    p, role:admin, *, *, *, allow
    p, role:app, *, *, app/*, allow
    p, role:infra, *, *, infra/*, allow

    # グループにロールを紐づける。
    g, admin@gmail.com, role:admin
    g, app-team@gmail.com, role:app
    g, infra-team@gmail.com, role:infra
  scopes: "[email]"
```

> ↪️ 参考：
>
> - https://hatappi.blog/entry/2020/08/23/025033
> - https://github.com/argoproj/argo-cd/blob/master/assets/builtin-policy.csv

<br>

## 05. argocd-tls-cets-cm

リポジトリをHTTPSプロコトルで監視するために、argocd-serverで必要なSSL証明書を設定する。

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-tls-certs-cm.yaml

<br>

## 06. argocd-ssh-nown-hosts-cm

SSH公開鍵認証でリポジトリに接続して監視する場合に、argocd-serverで必要な`known_hosts`ファイルを設定する。

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

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-ssh-known-hosts-cm.yaml

<br>
