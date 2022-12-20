---
title: 【IT技術の知見】リソース定義＠ArgoCD
description: リソース定義＠ArgoCDの知見を記録しています。
---

# リソース定義＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

<br>

## 01. セットアップ

### インストール

#### ▼ 共通の手順

> ℹ️ 参考：
>
（１）ローカルマシンから本番環境にArgoCDをインストールする場合、```kubectl```コマンドのコンテキストを間違える可能性がある。そのため、```kubectl```コマンド専用の踏み台サーバーを用意してもよい。EKSのコンテキストを作成し、```kubectl```コマンドの宛先を、EKSのkube-apiserverに変更する。

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
$ kubectl config use-context arn:aws:eks:ap-northeast-1:<アカウントID>:cluster/<Cluster名>
```

> ℹ️ 参考：
>
> - https://docs.aws.amazon.com/eks/latest/userguide/getting-started-console.html
> - https://docs.aws.amazon.com/eks/latest/userguide/cluster-endpoint.html
> - https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance
> - http://linuxcommand2007.seesaa.net/article/476794217.html

（２）ArgoCDが稼働するNamespaceを作成する。

```bash
$ kubectl create namespace argocd
```

（３）マニフェストを指定し、kube-apiserverに送信する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/getting_started/

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# applyされたことを確認する。
$ kubectl get all -n argocd
```

（４）LoadBalancer Serviceを使用して、ArgoCDダッシュボードを公開する。

```bash
$ kubectl patch service argocd-server \
    -n argocd \
    -p '{"spec": {"type": "LoadBalancer"}}'
```

#### ▼ ```argocd```コマンドを使用して

（７）```argocd```コマンドをインストールする。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ chmod +x /usr/local/bin/argocd
```

（８）ArgoCDにログインする。ユーザー名とパスワードを要求されるため、これらを入力する。

```bash
$ argocd login 127.0.0.1:8080

Username: admin
Password: *****
'admin:login' logged in successfully
```

（９）ArgoCDのアプリケーションを作成する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

```bash
$ argocd app create guestbook \
    --project default \
    --repo https://github.com/hiroki-hasegawa/foo-manifests.git \
    --revision main \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace foo \
    --auto-prune \
    --self-heal \
    --sync-option CreateNamespace=true
```

（１０）ArgoCD上でアプリケーションの監視を実行する。事前に```--dry-run```キーで監視対象のリソースを確認すると良い。監視対象リポジトリ（GitHub、Helm）の最新コミットが更新されると、これを自動的にプルしてくれる。アプリケーションのapplyにはCircleCIが関与しておらず、Kubernetes上に存在するArgoCDがapplyを行なっていることに注意する。

```bash
$ argocd app sync guestbook --dry-run
```

（１１）自動Syncを有効化する。

```bash
$ argocd app set guestbook --sync-policy automated
```

（１２）クラウドプロバイダーのコンテナイメージレジストリやチャートレジストリを採用している場合は、ログインが必要になる。

> ℹ️ 参考：
>
> - https://medium.com/@Technorite
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd

```bash
# ECRのチャートをプルする場合
$ argocd repo add oci://<チャートレジストリ名> \
    --type helm \
    --name <チャートリポジトリ名> \
    --enable-oci \
    --username AWS \
    --password $(aws ecr get-login-password --region ap-northeast-1)
```

#### ▼ マニフェスト経由

（７）```argocd```コマンドの代わりとして、マニフェストでArgoCDを操作しても良い。

```bash
$ kubectl apply -f application.yaml
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  project: default
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: foo
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```


<br>

### アンインストール

#### ▼ argocdコマンドを使用して

ArgoCDのApplicationを削除する。```--cascade```キーを有効化すると、ArgoCDのApplication自体と、Application配下のリソースの両方を連鎖的に削除できる。反対に無効化すると、Applicationのみを単体で削除する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

#### ▼ ```kubectl```コマンドを使用して

ArgoCDのApplicationを削除する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

<br>

### 開発環境での動作確認

#### ▼ 別のapplyツールを使用する

実装が複雑になることを避けるため、開発環境に対するapplyには、ArgoCD以外のツールを使用する。

（例）

- Skaffold

#### ▼ ローカルマシンを監視

ローカルマシンのディレクトリをリポジトリとして監視する。あらかじめ、リポジトリの自動プルの設定を無効化しておく必要がある。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

```bash
 $ argocd app sync <ArgoCDのアプリケーション名> --local=<ディレクトリへのパス>
```

<br>

## 01-02. リポジトリの認証認可

### Secret

#### ▼ argocd.argoproj.io/secret-type

設定値は```repository```とする。監視対象のマニフェストリポジトリ、チャートレジストリ、OCIレジストリの認証情報を設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/bea379b036708bc5035b2a25d70418350bf7dba9/util/db/repository_secrets.go#L60

<br>

### マニフェストリポジトリの場合

#### ▼ 注意点

マニフェストリポジトリの認証情報を設定する。マニフェストレジストリごとに、異なるSecretで認証情報を設定する必要がある。ただし、監視する複数のリポジトリが、全て```1```個のマニフェストレジストリ内にある場合は、Secretは```1```個でよい。

> ℹ️ 参考：
> 
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials
> - https://speakerdeck.com/satokota/2-argocdniyorugitopstodeployguan-li?slide=42

#### ▼ Basic認証の場合

Basic認証に必要なユーザー名とパスワードを設定する。ここでは、マニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# 他と異なるマニフェストリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-repository # 任意のマニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/foo-kubernetes-manifest.git
  type: git
  # Basic認証に必要なユーザー名とパスワードを設定する。
  username: foo
  password: bar
---
# 他と異なるマニフェストリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-repository # 任意のマニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/foo-istio-manifest.git
  type: git
  # Basic認証に必要なユーザー名とパスワードを設定する。
  username: foo
  password: bar
```

#### ▼ SSHの場合

SSHに必要な秘密鍵を設定する。ここでは、マニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# 他と異なるマニフェストリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-repository # 任意のマニフェストリポジトリ名
  url: git@github.com:hiroki-hasegawa/foo-kubernetes-manifest.git
  type: git
  # SSHに必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIC2DCCAcCgAwIBAgIBATANBgkqh ...
---
# 他と異なるマニフェストリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-repository # 任意のマニフェストリポジトリ名
  url: git@github.com:hiroki-hasegawa/foo-istio-manifest.git
  type: git
  # SSHに必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIEpgIBAAKCAQEA7yn3bRHQ5FHMQ ...
```

#### ▼ OIDCの場合

OIDCに必要なクライアントIDやクライアントシークレット（例：KeyCloakで発行されるもの、GitHubでOAuthAppを作成すると発行される）を設定する。ここでは、マニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#existing-oidc-provider

```yaml
# 他と異なるマニフェストリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-repository # 任意のマニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/foo-istio-manifest.git
  type: git
  # OIDCに必要なIDやトークンを設定する。
  oidc.config: |
    name: keycloak
    clientID: foo-oidc
    clientSecret: *****
    requestedScopes: ["openid", "profile", "email", "groups"]
    requestedIDTokenClaims: {"groups": {"essential": true}}
---
# 他と異なるマニフェストリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-repository # 任意のマニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/foo-istio-manifest.git
  type: git
  # OIDCに必要なIDやトークンを設定する。
  oidc.config: |
    name: keycloak
    clientID: foo-oidc
    clientSecret: *****
    requestedScopes: ["openid", "profile", "email", "groups"]
    requestedIDTokenClaims: {"groups": {"essential": true}}
```

<br>

### チャートリポジトリの場合

#### ▼ 注意点

チャートリポジトリごとに、異なるSecretで認証情報を設定する必要がある。ただし、監視する複数のリポジトリが、全て```1```個のチャートレジストリ内にある場合は、Secretは```1```個でよい。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ Basic認証の場合

Basic認証に必要なユーザー名とパスワードを設定する。ここでは、チャートリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# 他と異なるチャートリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-repository # 任意のチャートリポジトリ名
  url: https://storage.googleapis.com/foo-kubernetes # チャートリポジトリのURL
  type: helm
  username: foo
  password: bar
---
# 他と異なるチャートリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-repository # 任意のチャートリポジトリ名
  url: https://storage.googleapis.com/foo-istio # チャートリポジトリのURL
  type: helm
  username: baz
  password: qux
```

<br>

### OCIリポジトリの場合

#### ▼ 注意点

OCIプロトコルの有効化（```enableOCI```キー）が必要であるが、内部的にOCIプロトコルが```repoURL```キーの最初に追記されるため、プロトコルの設定は不要である。チャートリポジトリと同様にして、OCIリポジトリごとに異なるSecretで認証情報を設定する必要がある。ただし、監視する複数のリポジトリが、全て```1```個のOCIレジストリ内にある場合は、Secretは```1```個でよい。

> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/util/helm/cmd.go#L262
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ Basic認証の場合

Basic認証に必要なユーザー名とパスワードを設定する。ここでは、OCIリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# 他と異なるOCIリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-kubernetes-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-kubernetes-oci-repository # 他とは異なるOCIレジストリ内のリポジトリ名
  url: <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com # OCIリポジトリのURL
  type: helm
  username: foo
  password: bar
  enableOCI: "true" # OCIリポジトリを有効化する。
---
# 他と異なるOCIリポジトリ
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-istio-secret
  labels:
    argocd.argoproj.io/secret-type: repository
stringData:
  name: foo-istio-oci-repository # 他とは異なるOCIレジストリ内のリポジトリ名
  url: <アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com # OCIリポジトリのURL
  type: helm
  username: baz
  password: qux
  enableOCI: "true" # OCIリポジトリを有効化する。
```

AWS ECRのように認証情報に有効期限がある場合は、認証情報を定期的に書き換えられるようにする。例えば、aws-ecr-credentialチャートを使用する。

> ℹ️ 参考：
>
> - https://qiita.com/moriryota62/items/7d94027881d6fe9a478d
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd
> - https://artifacthub.io/packages/helm/architectminds/aws-ecr-credential

<br>


## 02. Application

### Applicationとは

#### ▼ Kuberneresリソースの監視

Kubernetesのカスタムリソースから定義される。監視対象のKubernetesリソースやカスタムリソースを設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/manifests/crds/application-crd.yaml

#### ▼ 自己監視

Application自体もカスタムリソースなため、ApplicationがApplication自身のソースの変更を監視し、Syncできる。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/latest/operator-manual/declarative-setup/#manage-argo-cd-using-argo-cd
> - https://github.com/argoproj/argo-cd/discussions/7908
> - https://speakerdeck.com/sshota0809/argocd-teshi-xian-suru-kubernetes-niokeruxuan-yan-de-risosuteriharifalseshi-jian?slide=49

#### ▼ 操作の種類

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/core_concepts/
> - https://github.com/argoproj/argo-cd/discussions/8260

| 操作名       | 説明                                                                                                                                                      |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| Sync         | 監視対象リポジトリとのマニフェストの差分を確認し、差分があれば```kubectl apply```コマンドを実行する。                                                                                  |
| Refresh      | 監視対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                                                           |
| Hard Refresh | redis-serverに保管されているキャッシュを削除する。また、監視対象リポジトリとのマニフェストの差分を確認する。差分を確認するのみで、applyは実行しない。                                                     |
| Restart      | すでにapply済みのKubernetesリソース内のコンテナを再デプロイする。コンテナを再起動するのみで、Kubernetesリソースを作成することはない。<br>ℹ️ 参考：https://twitter.com/reoring/status/1476046977599406087 |

#### ▼ ヘルスステータスの種類

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/health/#way-1-define-a-custom-health-check-in-argocd-cm-configmap

| ステータス名     | 説明                                                                                                            |
|-------------|---------------------------------------------------------------------------------------------------------------|
| Healthy     | 全てのKubernetesリソースは正常に稼働している。                                                                               |
| Progressing | 一部のKubernetesリソースは正常に稼働していないが、リソースの状態が変化中のため、正常になる可能性がある。この状態の場合は、ステータスが他のいずれかになるまで待機する。 |
| Degraded    | 一部のKubernetesリソースは正常に稼働していない。                                                                             |
| Suspended   | 一部のKubernetesリソースは、イベント（例：CronJobなど）が実行されることを待機している。                                                     |
| Missing     | 調査中...                                                                                                       |
| Unknown     | 調査中...                                                                                                       |

<br>

### spec.ignoreDifferences

#### ▼ ignoreDifferencesとは

特定のApplicationのSyncステータス（Synced、OutOfSync）の判定時に、特定のKubernetesリソースの特定の設定値の差分を無視し、OutOfSyncにならないようする。Sync後にKubernetesリソースが変化するような仕様（動的な設定値、Jobによる変更、mutating-admissionステップでのWebhook、マニフェストの自動整形、など）の場合に使用する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#application-level-configuration
> - https://blog.framinal.life/entry/2021/10/04/224722

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  ignoreDifferences:
    # KubernetesリソースのAPIグループの名前
    - group: apps
      kind: Deployment
      jsonPointers:
        # spec.replicas（インスタンス数）の設定値の変化を無視する。
        - /spec/replicas
    - group: autoscaling
      kind: HorizontalPodAutoscaler
      jqPathExpressions:
        # .spec.metrics（ターゲット対象のメトリクス）の自動整形を無視する。
        - /spec/metrics
```

注意点として、Syncステータスの判定時に無視されるのみで、内部的にSyncは実行されてしまうため、Syncのたびに設定値が元に戻ってしまう。そこで別途、```RespectIgnoreDifferences```オプションも有効にしておくと良い。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#respect-ignore-difference-configs
> - https://mixi-developers.mixi.co.jp/update-argocd-to-v2-3-0-d609bbf16662

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  ignoreDifferences:
  
    ...
  
  syncPolicy:
    syncOptions:
      - RespectIgnoreDifferences=true
```

<br>

### spec.project

#### ▼ projectとは

アプリケーションのプロジェクト名を設定する。プロジェクト名は『```default```』は必ず作成する必要がある。```default```以外のプロジェクトは、実行環境別に作成すると良い。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  project: default # その他、dev、stg、prd、などを作成する。
```

<br>

### spec.source

#### ▼ sourceとは

リポジトリ（マニフェストリポジトリ、チャートリポジトリ、OCIリポジトリ）の変更を監視し、これらからプルしたマニフェストで```kubectl apply```コマンドを実行。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

| リポジトリの種類                                      | 管理方法                      | マニフェストのapply方法                                                                                    |
|-----------------------------------------------|-------------------------------|---------------------------------------------------------------------------------------------------|
| マニフェストリポジトリ（例：GitHub内のリポジトリ）                  | マニフェストそのまま                    | ArgoCDで直接的に```kubectl apply```コマンドを実行する。                                                       |
| チャートリポジトリ（例：ArtifactHub、GitHub Pages、内のリポジトリ） | チャートアーカイブ（```.tgz```形式ファイル） | Helmを使用して、ArgoCDで間接的に```kubectl apply```コマンドを実行する。パラメーターに応じて、内部的に```helm```コマンドが実行される。 |
| OCIリポジトリ（例：ECR内のリポジトリ）                        | チャートアーカイブ（```.tgz```形式ファイル） | Helmを使用して、ArgoCDで間接的に```kubectl apply```コマンドを実行する。パラメーターに応じて、内部的に```helm```コマンドが実行される。 |

<br>

### spec.source（マニフェストリポジトリの場合）

#### ▼ directory

監視対象のマニフェストリポジトリのディレクトリ構造に関して設定する。また、リポジトリにチャートを配置しているがチャートリポジトリとして扱っていない場合、マニフェストリポジトリ内のローカルのチャートとして、監視することもできる。

> ℹ️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L78
> - https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/

| 設定項目      | 説明                                                                                                           |
|---------------|--------------------------------------------------------------------------------------------------------------|
| ```include``` | ```path```キーで指定したディレクトリ内で、特定のマニフェストのみを指定し、kube-apiserverに送信する                                         |
| ```exclude``` | ```path```キーで指定したディレクトリ内で、特定のマニフェストを除外し、kube-apiserverに送信する                                           |
| ```recurse``` | ```path```キーで指定したディレクトリにサブディレクトリが存在している場合、全てのマニフェストを指定できるように、ディレクトリ内の再帰的検出を有効化するか否かを設定する。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./manifests
    directory:
      recurse: true
```

#### ▼ path

監視対象のマニフェストリポジトリのディレクトリを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./manifests
```

マニフェストリポジトリ内のローカルのチャートも監視できる。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    path: ./charts
    helm:
      valueFiles:
        - ./values/values-prd.yaml
```

#### ▼ repoURL

監視対象のマニフェストリポジトリのURLを設定する。パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
```

#### ▼ targetRevision

監視対象のマニフェストリポジトリのブランチやバージョンタグを設定する。各実行環境に、実行環境に対応したブランチを指定するマニフェストを定義しておくと良い。これにより、各実行環境内のApplicationは特定のブランチのみを監視するようになる。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

```yaml
# 本番環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
  labels:
    app.kubernetes.io/env: prd
spec:
  source:
    targetRevision: main # 本番環境に対応するブランチ
```

```yaml
# ステージング環境のApplication
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
  labels:
    app.kubernetes.io/env: stg
spec:
  source:
    targetRevision: develop # ステージング環境に対応するブランチ
```

<br>

### spec.source（チャートレジストリ内リポジトリの場合）

#### ▼ chart

監視対象のチャートレジストリ内のリポジトリにあるチャート名を設定する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    chart: <チャート名>
```

#### ▼ helm

```helm```コマンドに渡すパラメーターを設定する。helmfileと同じように```helm```コマンドを宣言的に実行しつつ、実行を自動化できる。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-plugins
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L25
> - https://mixi-developers.mixi.co.jp/argocd-with-helm-fee954d1003c

| 設定項目          | 説明                                                                                                                               | 補足                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```releaseName``` | 作成するリリース名を設定する。                                                                                                               |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ```values```      | ```helm```コマンドに渡す```values```ファイルの値をハードコーディングする。                                                                                 | 執筆時点（2022/10/31）では、```values```ファイルは、同じチャートリポジトリ内にある必要がある。チャートと```values```ファイルが異なるリポジトリにある場合（例：チャートはOSSを参照し、```values```ファイルは独自で定義する）、```valueFiles```オプションの代わりに```values```オプションを使用する。<br>ℹ️ 参考：<br>・https://github.com/argoproj/argo-cd/issues/2789#issuecomment-624043936  <br>・https://github.com/argoproj/argo-cd/blob/428bf48734153fa1bcc340a975be8c7e3f34c163/docs/operator-manual/application.yaml#L48-L62 <br><br>ただし、Applicationに```values```ファイルをハードコーディングした場合に、共有```values```ファイルと差分```values```ファイルに切り分けて定義できなくなってしまう。そこで、```values```オプションの一部分をHelmのテンプレート機能で動的に出力するようにする。ただし、新機能として複数のリポジトリの```values```ファイルを参照する方法が提案されており、これを使用すれば異なるリポジトリに```values```ファイルがあっても```valueFiles```オプションで指定できるようになる。新機能のリリースあとはこちらを使用した方が良さそう。<br>ℹ️ 参考：<br>・https://github.com/argoproj/argo-cd/pull/10432 |
| ```valueFiles```  | ```helm```コマンドに渡す```values```ファイルを設定する。                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ```version```     | ```helm```コマンドのバージョンを設定する。デフォルトでは、```v3```になる。 ArgoCD自体をHelmでセットアップする場合は、インストールするHelmのバージョンを指定できるため、このオプションを使用する必要はない。 | ℹ️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-version <br>・https://github.com/argoproj/argo-helm/blob/main/charts/argo-cd/values.yaml#L720-L733                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |


```helm```コマンドに渡す```values```ファイルの値をハードコーディングする。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    helm:
      releaseName: foo
      values: |
        foo: foo
        bar: bar
        baz: baz
```

監視対象のリポジトリにある```values```ファイルを使用する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    helm:
      releaseName: foo
      valueFiles:
        - ./prd.yaml
```

暗号化された```values```ファイルを使用することもできる。

> ℹ️ 参考：https://github.com/camptocamp/argocd-helm-sops-example

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    helm:
      releaseName: foo
      valueFiles:
        # helm-secretsを使用して暗号化されたvaluesファイル
        - ./secrets.yaml
```

あらかじめ、sopsを使用して、```values```ファイルを暗号化し、キーバリュー型ストレージに設定しておく。監視対象のリポジトリに```.sops.yaml```ファイルと```secrets```ファイル（キーバリュー型ストレージ）を配置しておく必要がある。

```yaml
# secretsファイル

# キーバリュー型ストレージ
data:
  AWS_ACCESS_KEY: ENC[AES256...
  AWS_SECRET_ACCESS_KEY: ENC[AES256...

sops:
  ...
```

ArgoCDは暗号化された```values```ファイルを復号化し、チャートをインストールする。なおArgoCD上では、Secretのdataキーは```base64```方式でエンコードされる。

```yaml
# values.yamlファイルの暗号化された値を展開するテンプレートファイル
apiVersion: v1
kind: Secret
metadata:
  name: foo-aws-credentials
type: Opaque
data:
  AWS_ACCESS_KEY: {{ .Values.data.AWS_ACCESS_KEY | b64en }} # base64方式でエンコードされる。
  AWS_SECRET_ACCESS_KEY: {{ .Values.data.AWS_SECRET_ACCESS_KEY | b64en }}
```

ArgoCDはHelmの```v2```と```v3```の両方を保持している。リリースするチャートの```apiVersion```キーの値が```v1```であれば、ArgoCDはHelmの```v2```を使用して、一方で```apiVersion```キーの値が```v2```であれば、Helmの```v3```を使用するようになっている。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/2383#issuecomment-584441681

ArgoCDを介してHelmを実行する場合、内部的には```helm template```コマンドとetcd上のマニフェストを```kubectl diff```コマンドで比較し、生じた差分を```kubectl apply```コマンドを使用してデプロイしている。そのため、Helmを手動でマニフェストをリリースする場合とは異なり、カスタムリソースのマニフェストの設定値を変更できる。一方で、リリース履歴が存在しない。Helmのリリース履歴の代わりとして、```argocd app history```コマンドで確認できる。

```bash
$ helm template . | kubectl diff
```

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#random-data
> - https://qiita.com/kyohmizu/items/118bf654d0288da2294e
> - https://medium.com/@ch1aki/argocd%E3%81%A7helm%E3%82%92%E4%BD%BF%E3%81%86%E6%96%B9%E6%B3%95%E3%81%A8%E6%97%A2%E5%AD%98%E3%81%AErelease%E3%82%92argocd%E7%AE%A1%E7%90%86%E3%81%B8%E7%A7%BB%E8%A1%8C%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95-9108295887
> - https://github.com/argoproj/argo-cd/issues/4537#issuecomment-707997759

```bash
$ argocd app history <Application名>

ID  DATE                           REVISION
0   2020-04-12 10:22:57 +0900 JST  1.0.0
1   2020-04-12 10:49:14 +0900 JST  <バージョンタグ>
```

#### ▼ repoURL

監視対象のチャートレジストリ内のリポジトリのURLを設定する。パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。チャートリポジトリとして扱うために、リポジトリのルート直下に```index.yaml```ファイルと```.tgz```ファイルを配置して、チャートリポジトリとして扱えるようにしておく必要がある。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications
> - https://cloud.redhat.com/blog/continuous-delivery-with-helm-and-argo-cd

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    # 例えば、GitHub内のGitHub Pagesをチャートリポジトリとして扱う。
    repoURL: https://github.com/hiroki.hasegawa/helm-charts
```

#### ▼ targetRevision

監視対象のチャートレジストリ内のリポジトリのブランチ（GitHubをチャートリポジトリとしている場合のみ）やバージョンタグを設定する。チャートリポジトリとして、GitHubやArtifactHubを指定できる。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    targetRevision: <バージョンタグ>
```

<br>

### spec.source（OCIレジストリ内リポジトリの場合）

#### ▼ chart

チャートレジストリと同じ。

#### ▼ helm

チャートレジストリと同じ。

#### ▼ repoURL

監視対象のOCIレジストリ内のリポジトリのURLを設定する。パブリックリポジトリであれば認証が不要であるが、プライベートリポジトリであればこれが必要になる。

> ℹ️ 参考：https://stackoverflow.com/questions/68219458/connecting-an-app-in-argocd-to-use-a-helm-oci-repository

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  # 例えば、ECR内のリポジトリをOCIリポジトリとして扱う。
  repoURL: oci://<アカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/<チャート名>
```

#### ▼ targetRevision

監視対象のOCIレジストリ内のリポジトリのバージョンタグを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  source:
    targetRevision: <バージョンタグ>
```
<br>


### spec.destination

#### ▼ destinationとは

apply先のKubernetesを設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

#### ▼ namespace

apply先のNamespaceを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    namespace: foo
```

#### ▼ server

kube-apiserverのURLを設定する。Kubernetesの実行環境としてEKSやGKEを採用している場合、これのkube-apiserverのエンドポイントを指定する必要がある。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    server: https://kubernetes.default.svc
```

```yaml
# EKSの場合
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  destination:
    # EKSのkube-apiserverのエンドポイントを指定する。
    server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

<br>

### spec.syncPolicy

#### ▼ syncPolicyとは

GitOpsでのリポジトリ（GitHub、Helm）とKubernetesの間の自動Syncを設定する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L113

#### ▼ automated

GitOpsでのリポジトリ（例：GitHub、Helm、など）とKubernetesの間の自動Syncを有効化するか否かを設定する。開発者には参照権限のみの認可スコープを付与し、ArgoCDの自動Syncを有効化すれば、開発者がデプロイできなくなり、安全性が増す。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

| 設定項目         | 説明                                                                                                                                                                                | 補足                                                                                                                                                                                                                           |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```prune```      | リソースを作成しつつ、不要になったリソースを自動削除するか否かを設定する。デフォルトでは、GtiHubリポジトリでマニフェストが削除されても、ArgoCDはリソースを自動的に削除しない。開発者の気づかないうちに、残骸のKubernetesリソースが溜まる可能性があるため、有効化した方が良い。 | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning                                                                                                                                       |
| ```selfHeal```   | Kubernetes側に変更があった場合、リポジトリ（GitHub、Helm）の状態に戻すようにする。デフォルトでは、Kubernetes側のリソースを変更しても、リポジトリの状態に戻すための自動Syncは実行されない。                                                    | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-self-healing                                                                                                                                  |
| ```allowEmpty``` | Prune中に、Application配下にリソースを検出できなくなると、Pruneは失敗するようになっている。Applicationが空（配下にリソースがない）状態を許可するか否かを設定する。                                                                  | ℹ️ 参考：<br>・https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning-with-allow-empty-v18<br>・https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  syncPolicy:
    automated:
      allowEmpty: true
      prune: true
      selfHeal: true
```

#### ▼ syncOptions

GitOpsでのマニフェストのSync処理の詳細を設定する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/

| 設定項目                     | 説明                                                                                                                               | 補足                                                                                                                                                                                                                        |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```CreateNamespace```        | Applicationの作成対象のNamespaceを自動的に作成する。ArgoCDがインストールされるNamespaceと、Applicationを作成するNamespaceが異なる場合、これを有効化しておいた方が良い。 |                                                                                                                                                                                                                             |
| ```Validate```               |                                                                                                                                    |                                                                                                                                                                                                                             |
| ```PrunePropagationPolicy``` | Sync後に不要になったKubernetesリソースの削除方法を設定する。削除方法は、Kubernetesでのリソースの削除の仕組みと同様に、バックグラウンド、フォアグラウンド、オルファン、がある。             | ℹ️ 参考：<br>・https://www.devopsschool.com/blog/sync-options-in-argo-cd/<br>・https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/ |
| ```PruneLast```              | 通常のPruneでは、Syncしながら古いリソースを独立的に削除していく。PruneLastでは、一度全てのリソースをSyncしてしまい、正常に稼働した後に古いリソースをまとめて削除していく。                | ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#prune-last                                                                                                                                        |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: foo-application
spec:
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=background
```

<br>

## 03. ApplicationSet

### ApplicationSet

ArgoCDのApplicationは、```1```個のKubernetes Clusterにしかマニフェストを送信できない。そのため、二重管理になってしまうが、同じ設定値のApplicationをKubernetes Clusterに作成しなければならない。一方で、ApplicationSetであれば、対応するKubernetes ClusterごとにApplicationを自動作成してくれる。

> ℹ️ 参考：
> 
> - https://techstep.hatenablog.com/entry/2021/12/02/085034
> - https://blog.argoproj.io/introducing-the-applicationset-controller-for-argo-cd-982e28b62dc5

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: foo-eks-cluster
            url: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
          - cluster: foo-kubeadm-cluster
            url: https://kubernetes.default.svc
  template:
    metadata:
      # Cluster名を展開する。
      name: '{{cluster}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
        targetRevision: HEAD
        path: .
      destination:
        # ClusterのURLを展開する。
        server: '{{url}}'
        namespace: foo
```

<br>

## 04. AppProject

### AppProjectとは

Applicationの責務境界をProjectとして管理する。

### sourceRepos

プロジェクト内で監視可能なリポジトリを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  sourceRepos:
    - "*"
```

<br>

### description

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  description: This is application in prd environment
```

<br>

### destinations

プロジェクト内でデプロイ先として指定可能なスコープを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  destinations:
    - namespace: "*" # 全てのNamespaceにデプロイできる。
      server: https://kubernetes.default.svc
```

<br>

### clusterResourceWhitelist

プロジェクト内でデプロイ可能なリソースを設定する。

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: prd # その他、運用チーム名など
spec:
  clusterResourceWhitelist:
    - group: "*"
      kind: "*"
```


<br>

## 05. 専用ConfigMap

### data.resource.customizations

#### ▼ ignoreDifferences.all

ArgoCD全体で```spec.ignoreDifferences```キーと同じ機能を有効化する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/diffing/#system-level-configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/name: argocd-cm
    app.kubernetes.io/part-of: argocd
data:
  resource.customizations.ignoreDifferences.all: |
    jsonPointers:
        # spec.replicas（インスタンス数）の設定値の変化を無視する。
        - /spec/replicas
    jqPathExpressions:
        # .spec.metrics（ターゲット対象のメトリクス）の自動整形を無視する。
        - /spec/metrics
```

<br>

## 06. 専用Job

### metadata

#### ▼ generateName

```Sync```フェーズフック名を設定する。

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#generate-name

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  generateName: foo-hook
```

<br>

### metadata.annotations

#### ▼ argocd.argoproj.io/hook

フックを設定する```Sync```フェーズ（Sync前、Sync時、Syncスキップ時、Sync後、Sync失敗時）を設定する。

> ℹ️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#usage
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#sync-phases-and-waves

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail # Sync失敗時
```

#### ▼ argocd.argoproj.io/sync-wave

同じ```Sync```フェーズに実行するように設定したフックが複数ある場合、これらの実行の優先度付けを設定する。正負の数字を設定でき、数字が小さい方が優先される。優先度が同じ場合、ArgoCDがよしなに順番を決めてしまう。

> ℹ️ 参考：
>
> - https://weseek.co.jp/tech/95/
> - https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/#how-do-i-configure-waves

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: -1 # 優先度-1（3個の中で一番優先される。）
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 0 # 優先度0（デフォルトで0になる。）
```

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  namespace: argocd
  name: foo-job
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/sync-wave: 1 # 優先度1
```

<br>

## 07. Rollout

### spec.analysis

#### ▼ analysisとは

Progressive Deliveryを使用する場合、詳細を設定する。

> ℹ️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

#### ▼ successfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-rollout
spec:
  analysis:
    successfulRunHistoryLimit: 10
```

#### ▼ unsuccessfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-rollout
spec:
  analysis:
    unsuccessfulRunHistoryLimit: 10
```

<br>

### spec.strategy

#### ▼ strategyとは

デプロイ手法を設定する。大前提として、そもそもArgoCDは```kubectl apply```コマンドでリソースを作成しているだけなため、デプロイ手法は、Deploymentの```spec.strategy```キーや、DaemonSetとStatefulSetの```spec.updateStrategy```キーの設定値に依存する。ArgoCDのstrategyオプションを使用することにより、これらのKubernetesリソース自体を冗長化し、より安全にapplyを行える。

#### ▼ blueGreen

![argocd_blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_blue-green-deployment.png)

ブルー/グリーンデプロイメントを使用して、新しいPodをリリースする。

> ℹ️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/bluegreen/
> - https://argoproj.github.io/argo-rollouts/concepts/#blue-green
> - https://korattablog.com/2020/06/19/argocd%E3%81%AB%E3%82%88%E3%82%8Bbluegreen%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%82%92%E8%A9%A6%E3%81%99/

| 設定項目                    | 説明                                                                                                           |
|-----------------------------|----------------------------------------------------------------------------------------------------------------|
| ```activeService```         | 旧環境へのルーティングに使用するServiceを設定する。                                                                           |
| ```autoPromotionEnabled```  | 旧環境から新環境への自動切り替えを有効化するか否かを設定する。もし無効化した場合、```autoPromotionSeconds```の秒数だけ切り替えを待機する。  |
| ```autoPromotionSeconds```  | 旧環境から新環境への切り替えを手動で行う場合、切り替えを待機する最大秒数を設定する。最大秒数が経過すると、自動的に切り替わってしまうことに注意する。 |
| ```previewReplicaCount```   | 新環境のPod数を設定する。                                                                                           |
| ```previewService```        | 新環境へのルーティングに使用するServiceを設定する。                                                                           |
| ```scaleDownDelaySeconds``` |                                                                                                                |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-blue-green-rollout
spec:
  strategy:
    # ブルー/グリーンデプロイメイト
    blueGreen:
      activeService: foo-active-service
      previewService: foo-preview-service
      previewReplicaCount: 1
      autoPromotionEnabled: true
      scaleDownDelaySeconds: 30
```

#### ▼ canary

![argocd_canary-release](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_canary-release.png)

カナリアリリースを使用して、新しいPodをリリースする。

> ℹ️ 参考：
>
> - https://argoproj.github.io/argo-rollouts/features/canary/
> - https://argoproj.github.io/argo-rollouts/concepts/#canary
> - https://korattablog.com/2020/06/19/argocd%E3%81%AEcanary-deployment%E3%82%92%E8%A9%A6%E3%81%99/

| キー         | 説明                                                                                                                      |
|------------|-------------------------------------------------------------------------------------------------------------------------|
| ```step``` | カナリアリリースの手順を設定する。<br>・```setWeight```：新しいPodへの重み付けを設定する。<br>・```pause```：次の手順に移行せずに待機する。待機秒数を設定できる。 |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  namespace: argocd
  name: foo-canary-rollout
spec:
  strategy:
    # カナリアリリース
    canary:
      steps:
        - setWeight: 25
        - pause:
            duration: 10
```

<br>

## 08. Workflow

### spec.entrypoint

#### ▼ entrypointとは

一番最初に使用するテンプレート名を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: foo-workflow
spec:
  entrypoint: foo-template
```

<br>

### spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。WorkflowTemplateとして切り分けても良い。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: foo-workflow
spec:
  entrypoint: foo-template
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command: ["/bin/bash", "-c"]
          source: |
            echo "Hello World"
```

<br>

### spec.workflowTemplateRef

#### ▼ workflowTemplateRefとは

切り分けたWorkflowTemplateの名前を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: foo-workflow
spec:
  workflowTemplateRef:
    name: hello-world-workflow-template
```

<br>

## 09. WorkflowTemplate

### spec.templates

#### ▼ templatesとは

パイプラインの処理を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: hello-world-workflow-template
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          cource: |
            echo "Hello World"
```

#### ▼ script

コンテナをプルし、コンテナ内でスクリプトを実行する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: hello-world-workflow-template
spec:
  templates:
    - name: foo-template
      script:
        - image: alpline:1.0.0
          command: ["/bin/bash", "-c"]
          source: |
            echo "Hello World"
```

#### ▼ steps

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/argo-wf-20200220

<br>

## 10. ArgoCD Notification

### セットアップ

> ℹ️ 参考：https://argocd-notifications.readthedocs.io/en/stable/#getting-started

```bash
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-notifications/release-1.0/manifests/install.yaml
```

<br>

### ConfigMap

#### ▼ data.trigger

通知条件を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#triggers

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notification-cm
data:
  trigger.on-sync-status-unknown: |
    - when: app.status.sync.status == 'Unknown'
      send: [app-sync-status, github-commit-status]
  trigger.sync-operation-change: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [app-sync-failed, github-commit-status]
  trigger.on-deployed: |
    when: app.status.operationState.phase in ['Succeeded'] and app.status.health.status == 'Healthy'
    oncePer: app.status.sync.revision
    send: [app-sync-succeeded]
```

#### ▼ data.service

通知先のURLを設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#services

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
data:
  service.slack: |
    token: *****
```

#### ▼ data.template

通知内容を設定する。

> ℹ️ 参考：https://zenn.dev/nameless_gyoza/articles/introduction-argocd-notifications#templates

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
data:
  context: |
    env: prd

  template.a-slack-template-with-context: |
    message: "ArgoCD sync in {{ .context.env }}"
```

<br>

