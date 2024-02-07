---
title: 【IT技術の知見】Secret系＠リソース定義
description: Secret系＠リソース定義の知見を記録しています。
---

# Secret系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Secret

ArgoCDの各種コンポーネントの機密な変数やファイルを管理する。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#atomic-configuration

<br>

## 02. argocd-initial-admin-secret

### password

ArgoCDが`argocd-initial-admin-secret`というSecretを自動的に作成してくれる。

これに、adminユーザーの初期パスワードが設定されている。

```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: argocd-initial-admin-secret
type: Opaque
data:
  password: <adminユーザーの初期パスワード>
```

<br>

## 03. argocd-repo

### argocd-repoとは

ArgoCDがプライベートリポジトリをポーリングする時に必要な認証情報を設定する。

argocd-repo-credsとは異なり、`1`個の認証情報で`1`個のリポジトリにリクエストを送信できるようにする。

なお、パブリックリポジトリの場合は、argocd-repo自体が不要である。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/argocd-repositories.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories

<br>

### 共通項目

#### ▼ `argocd.argoproj.io/secret-type`キー (必須)

Secretタイプは`repository`とする。

ポーリング対象のプライベートなマニフェストリポジトリ、チャートレジストリ、OCIレジストリの認証情報を設定する。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories

<br>

### マニフェストリポジトリの場合

#### ▼ 注意点

プライベートなマニフェストリポジトリの認証情報を設定する。

プライベートなマニフェストレジストリごとに、異なるSecretで認証情報を設定する必要がある。

#### ▼ アクセストークンの場合

アクセストークンをパスワードに設定する。

ユーザー名は、空文字以外の任意の文字列を設定できる。

```yaml
# foo-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # マニフェストリポジトリ名
  name: foo-repository
  url: https://github.com/hiroki-hasegawa/foo-manifest.git
  type: git
  # 空文字以外の任意の文字列を設定する
  username: personal-access-token
  # アクセストークンを設定する
  password: ******
---
# bar-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # マニフェストリポジトリ名
  name: bar-repository
  url: https://github.com/hiroki-hasegawa/bar-manifest.git
  type: git
  # 空文字以外の任意の文字列を設定する
  username: personal-access-token
  # アクセストークンを設定する
  password: ******
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/#access-token

#### ▼ HTTPS認証の場合

HTTPS認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # マニフェストリポジトリ名
  name: foo-repository
  url: https://github.com/hiroki-hasegawa/foo-manifest.git
  type: git
  # HTTPS認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: pass
---
# bar-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # マニフェストリポジトリ名
  name: bar-repository
  url: https://github.com/hiroki-hasegawa/bar-manifest.git
  type: git
  # HTTPS認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: pass
```

> - https://argo-cd.readthedocs.io/en/release-2.0/operator-manual/security/#authentication

#### ▼ SSH公開鍵認証の場合

SSH公開鍵認証に必要な秘密鍵を設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # マニフェストリポジトリ名
  name: foo-repository
  url: git@github.com:hiroki-hasegawa/foo-manifest.git
  type: git
  # SSH公開鍵認証に必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIC2 ...
---
# bar-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # マニフェストリポジトリ名
  name: bar-repository
  url: git@github.com:hiroki-hasegawa/bar-manifest.git
  type: git
  # SSH公開鍵認証に必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIEp ...
```

<br>

### チャートリポジトリの場合

#### ▼ 注意点

プライベートなチャートリポジトリごとに、異なるSecretで認証情報を設定する必要がある。

ただし、ポーリングする複数のプライベートなチャートリポジトリが、全て`1`個のチャートレジストリ内にある場合は、Secretは`1`個でよい。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ HTTPS認証の場合

HTTPS認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなチャートリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # チャートリポジトリ名
  name: foo-repository
  # チャートリポジトリのURL
  url: https://github.com/hiroki-hasegawa/foo-charts.git
  type: helm
  username: foo
  password: bar
---
# bar-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # チャートリポジトリ名
  name: bar-repository
  # チャートリポジトリのURL
  url: https://github.com/hiroki-hasegawa/bar-charts.git
  type: helm
  username: baz
  password: qux
```

> - https://argo-cd.readthedocs.io/en/release-2.0/operator-manual/security/#authentication

<br>

### OCIリポジトリの場合

#### ▼ 注意点

OCIプロトコルの有効化 (`.enableOCI`キー) が必要であるが、内部的にOCIプロトコルが`.repoURL`キーの最初に追記されるため、プロトコルの設定は不要である。

プライベートなチャートリポジトリの場合と同様にして、OCIリポジトリごとに異なるSecretで認証情報を設定する必要がある。

ただし、ポーリングする複数のリポジトリが、全て`1`個のOCIレジストリ内にある場合は、Secretは`1`個でよい。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/util/helm/cmd.go#L262
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ HTTPS認証の場合

HTTPS認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなOCIリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # OCIリポジトリ名
  name: foo-oci-repository
  # OCIリポジトリのURL
  url: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
  type: helm
  username: foo
  password: bar
  enableOCI: "true" # OCIリポジトリを有効化する。
---
# bar-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # OCIリポジトリ名
  name: bar-oci-repository
  # OCIリポジトリのURL
  url: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com
  type: helm
  username: baz
  password: qux
  # OCIリポジトリを有効化する。
  enableOCI: "true"
```

AWS ECRのように認証情報に有効期限がある場合は、認証情報を定期的に書き換えられるようにする。例えば、aws-ecr-credentialチャートを使用する。

> - https://argo-cd.readthedocs.io/en/release-2.0/operator-manual/security/#authentication
> - https://qiita.com/moriryota62/items/7d94027881d6fe9a478d
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd
> - https://artifacthub.io/packages/helm/architectminds/aws-ecr-credential

<br>

## 04. argocd-repo-creds

### argocd-repo-credsとは

ArgoCDがプライベートリポジトリをポーリングする時に必要な認証情報を設定する。

argocd-repoとは異なり、`1`個の認証情報で複数にリポジトリにリクエストを送信できるようにする。

ポーリングする複数のリポジトリが全て`1`個のマニフェストレジストリ内にある場合に、`1`個の認証情報で全てのマニフェストリポジトリをポーリングできる。

なお、パブリックリポジトリの場合は、argocd-repo-creds自体が不要である。

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/argocd-repo-creds.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials

<br>

### マニフェストリポジトリの場合

#### ▼ HTTPS認証の場合

設定できる項目は、argocd-repoと同じである。

argocd-repo-credsに、各argocd-repoで共有する項目を設定する。

argocd-repo-credsの`url`キーには、argocd-repoの`.url`キーの上層のパス (ここでは`https://github.com/hiroki-hasegawa`) を設定する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-repo-creds-github
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repo-creds
type: Opaque
data:
  type: git
  url: https://github.com/hiroki-hasegawa
  # HTTPS認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: pass
```

また、argocd-repoには認証情報 (`.username`キー、`.password`キー) を設定しないようにする。

```yaml
# foo-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # 認証情報は設定しない。
  # マニフェストリポジトリ名
  name: foo-repository
  # https://github.com/hiroki-hasegawa に最長一致する。
  url: https://github.com/hiroki-hasegawa/foo-manifest.git
---
# bar-repositoryをポーリングするためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  # 認証情報は設定しない。
  # マニフェストリポジトリ名
  name: bar-repository
  # https://github.com/hiroki-hasegawa に最長一致する。
  url: https://github.com/hiroki-hasegawa/bar-manifest.git
```

ArgoCDは、argocd-repo-credsの`.url`キーを使用して、argocd-repoの`.url`キーに対する最長一致を実施する。

最長一致したURLを持つ全てのargocd-repoで、argocd-repo-credsの認証情報 (`.username`キー、`.password`キー) が適用される。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials

<br>

## 05. argo-secret (必須)

### argocd-secretとは

以下の認証情報やSSL証明書を設定する。

- クライアントが、任意の認証/認可方法でArgoCDにログインするためのユーザー名とパスワード
- ArgoCDがapiserverにリクエストを送信するためのSSL証明書と秘密鍵
- Webhookを送信するためのSSL証明書

> - https://github.com/argoproj/argo-cd/blob/v2.6.0/docs/operator-manual/argocd-secret.yaml

<br>

### admin

記入中...

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-secret
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: argocd
type: Opaque
data:
  admin.password: ""
  admin.passwordMtime: ""
```

<br>

### tls

記入中...

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-secret
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: argocd
type: Opaque
data:
  tls.crt: ""
  tls.key: ""
```

<br>

### server

記入中...

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-secret
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: argocd
type: Opaque
data:
  server.secretkey: ""
```

<br>

### webhook

記入中...

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-secret
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: argocd
type: Opaque
data:
  webhook.github.secret: ""
  webhook.gitlab.secret: ""
  webhook.bitbucket.uuid: ""
  webhook.bitbucketserver.secret: ""
  webhook.gogs.secret: ""
```

<br>

### ユーザー定義のキー

#### ▼ OIDC

例えば、OIDCによる認証で使用する値を管理する。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argocd-secret
  namespace: argocd
  labels:
    app.kubernetes.io/part-of: argocd
type: Opaque
data:
  # base64方式でエンコードしたクライアントシークレット値
  oidc.auth0.clientSecret: *****
```

argocd-cmにて、`$<Secret名>:<キー名>`を指定して、定義したクライアントシークレット値を出力する。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: argocd
  name: argocd-cm
  labels:
    app.kubernetes.io/part-of: argocd
data:
  # OIDCに必要なIDやトークンを設定する
  oidc.config: |
    name: Auth0
    clientID: *****
    clientSecret: $argocd-secret:oidc.auth0.clientSecret

  ...

```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#sensitive-data-and-sso-client-secrets

<br>

## 06. cluster-<エンドポイントURL>

### cluster-<エンドポイントURL>とは

ArgoCDのapplication-controllerが、デプロイ先と異なるClusterで稼働している場合に、デプロイ先のClusterのServiceAccountとapplication-controllerを紐付ける必要がある。

ArgoCDのapplication-controllerは、`cluster-<エンドポイントURL>`というSecretを介して、デプロイ先のServiceAccountと紐づく。

**例**

デプロイ先のClusterがEKSの場合は、以下のようなSecretが作成される。

```yaml
apiVersion: v1
kind: Secret
metadata:
  annotations:
    managed-by: argocd.argoproj.io
  labels:
    argocd.argoproj.io/secret-type: cluster
  name: cluster-<エンドポイントURL>
  namespace: argocd
type: Opaque
data:
  config: |
    awsAuthConfig:
      clusterName: <デプロイ先のCluster名>
    tlsClientConfig:
      insecure: "false"
      caData: <HTTPSに必要なSSL証明書>
  name: foo-cluster
  server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  annotations:
    managed-by: argocd.argoproj.io
  labels:
    argocd.argoproj.io/secret-type: cluster
  name: cluster-<エンドポイントURL>
  namespace: argocd
type: Opaque
data:
  config: |
    awsAuthConfig: <ServiceAccountのトークン>
    tlsClientConfig:
      insecure: "false"
      caData: <HTTPSに必要なSSL証明書>
  name: foo-cluster
  server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#clusters
> - https://github.com/mumoshu/decouple-apps-and-eks-clusters-with-tf-and-gitops#argocd-cluster-secret

<br>

### セットアップ

#### ▼ AWS EKS Clusterの場合

ArgoCDがClusterをポーリングするためには、ArgoCDにClusterの認証情報を登録する必要がある。

これは、ローカルマシンで`kubectl`コマンドを実行する時に、`kubeconfig`ファイルにClusterの認証情報を登録することと同じである。

`(1)`

: ArgoCDの稼働するClusterをコンテキストとする。

```bash
$ kubectl config use-context <ArgoCDの稼働するClusterのARN>
```

`(2)`

: ArgoCDのパスワードを確認する。

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n foo \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

`(3)`

: ArgoCDにログインする。

     この時、ユーザー名は`admin`でパスワードは前の手順で取得したものとする。

```bash
# Bearer認証の場合
$ argocd login <ArgoCDのドメイン名> \
    --grpc-web \
    --skip-test-tls \
    --username admin \
    --password <前の手順で取得した文字列>

# SSOの場合
$ argocd login <ArgoCDのドメイン名> \
    --grpc-web \
    --skip-test-tls \
    --sso
```

> - https://github.com/argoproj/argo-cd/issues/9679#issuecomment-1254222366

`(4)`

: ArgoCDにポーリングさせたいClusterをコンテキストとする。

```bash
$ kubectl config use-context <ArgoCDにポーリングさせたいClusterのARN>
```

`(5)`

: `argocd cluster add <デプロイ先のClusterのARN>`コマンドを実行することにより、デプロイ先のClusterにArgoCDのエージェントを作成する。

    Secret、ServiceAccount (`argocd-manager`) 、ClusterRole (`argocd-manager-role`) 、ClusterRoleBinding (`argocd-manager-role-binding`) を作成できる。

```bash
# デフォルトでkube-systemに作成するため、nオプションは不要である
$ argocd cluster add <デプロイ先のClusterのARN> --name <デプロイ先のCluster名> -n kube-system

INFO[0011] ServiceAccount "argocd-manager" already exists in namespace "kube-system"
INFO[0011] ClusterRole "argocd-manager-role" updated
INFO[0011] ClusterRoleBinding "argocd-manager-role-binding" updated
Cluster 'https://*****.gr7.ap-northeast-1.eks.amazonaws.com' added
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_cluster_add/

`(6)`

: もし手順がうまく行っていない場合、Applicationで指定するClusterのURLがArgoCDに登録されていないとして、以下のようなエラーになってしまう。

```bash
cluster 'https://*****.gr7.ap-northeast-1.eks.amazonaws.com' has not been configured
```

執筆時点 (2022/01/30) では、`argocd cluster add`コマンドをマニフェストとして定義する方法はない。

もしタイムアウトになる場合、kube-apiserverのIPアドレスのアクセス制限に引っ掛かっていないかを確認する。

> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/
> - https://github.com/argoproj/argo-cd/issues/4651#issuecomment-1006960125

<br>
