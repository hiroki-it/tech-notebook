---
title: 【IT技術の知見】Secret系＠リソース定義
description: Secret系＠リソース定義の知見を記録しています。
---

# Secret系＠リソース定義

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. 専用Secret

ArgoCDの各種コンポーネントの機密な変数やファイルを管理する。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#atomic-configuration

<br>

## 02. argocd-initial-admin-secret

### 初期パスワードの設定

ArgoCDが`argocd-initial-admin-secret`というSecretを自動的に作成してくれる。

これに、初期パスワードが設定されている。

```yaml
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: argocd-initial-admin-secret
type: Opaque
data:
  password: *****
```

<br>

## 03. argocd-repo

### argocd-repoとは

ArgoCDがプライベートリポジトリを監視する時に必要な認証情報を設定する。

`argocd-repo-creds`とは異なり、`1`個の認証情報で`1`個のリポジトリにアクセスできるようにする。

パブリックリポジトリの場合は、不要である。

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-repositories.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories

<br>

### `.metadata.labels`キー

#### ▼ `argocd.argoproj.io/secret-type`キー (必須)

Secretタイプは`repository`とする。

監視対象のプライベートなマニフェストリポジトリ、チャートレジストリ、OCIレジストリの認証情報を設定する。

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repositories

<br>

### マニフェストリポジトリの場合

#### ▼ 注意点

プライベートなマニフェストリポジトリの認証情報を設定する。

プライベートなマニフェストレジストリごとに、異なるSecretで認証情報を設定する必要がある。

ただし、監視する複数のリポジトリが、全て`1`個のマニフェストレジストリ内にある場合は、Secretは`1`個でよい。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials
> - https://speakerdeck.com/satokota/2-argocdniyorugitopstodeployguan-li?slide=42

#### ▼ Bearer認証の場合

Bearer認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: foo-repository # マニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/foo-manifest.git
  type: git
  # Bearer認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: *****
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: bar-repository # マニフェストリポジトリ名
  url: https://github.com:hiroki-hasegawa/bar-manifest.git
  type: git
  # Bearer認証に必要なユーザー名とパスワードを設定する。
  username: hiroki-it
  password: *****
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/release-2.0/operator-manual/security/#authentication

#### ▼ SSH公開鍵認証の場合

SSH公開鍵認証に必要な秘密鍵を設定する。

ここでは、プライベートなマニフェストリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: foo-repository # マニフェストリポジトリ名
  url: git@github.com:hiroki-hasegawa/foo-manifest.git
  type: git
  # SSH公開鍵認証に必要な秘密鍵を設定する。
  sshPrivateKey: |
    MIIC2 ...
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: bar-repository # マニフェストリポジトリ名
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

ただし、監視する複数のプライベートなチャートリポジトリが、全て`1`個のチャートレジストリ内にある場合は、Secretは`1`個でよい。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ Bearer認証の場合

Bearer認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなチャートリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: foo-repository # チャートリポジトリ名
  url: https://github.com/hiroki.hasegawa/foo-charts # チャートリポジトリのURL
  type: helm
  username: foo
  password: bar
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: bar-repository # チャートリポジトリ名
  url: https://github.com/hiroki.hasegawa/bar-charts # チャートリポジトリのURL
  type: helm
  username: baz
  password: qux
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/release-2.0/operator-manual/security/#authentication

<br>

### OCIリポジトリの場合

#### ▼ 注意点

OCIプロトコルの有効化 (`enableOCI`キー) が必要であるが、内部的にOCIプロトコルが`repoURL`キーの最初に追記されるため、プロトコルの設定は不要である。

プライベートなチャートリポジトリの場合と同様にして、OCIリポジトリごとに異なるSecretで認証情報を設定する必要がある。

ただし、監視する複数のリポジトリが、全て`1`個のOCIレジストリ内にある場合は、Secretは`1`個でよい。

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/util/helm/cmd.go#L262
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories
> - https://github.com/argoproj/argo-cd/issues/7121#issuecomment-921165708

#### ▼ Bearer認証の場合

Bearer認証に必要なユーザー名とパスワードを設定する。

ここでは、プライベートなOCIリポジトリが異なるレジストリにあるとしており、複数のSecretが必要になる。

```yaml
# foo-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: foo-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: foo-oci-repository # OCIリポジトリ名
  url: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com # OCIリポジトリのURL
  type: helm
  username: foo
  password: bar
  enableOCI: true # OCIリポジトリを有効化する。
---
# bar-repositoryを監視するためのargocd-repo
apiVersion: v1
kind: Secret
metadata:
  namespace: argocd
  name: bar-argocd-repo
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
data:
  name: bar-oci-repository # OCIリポジトリ名
  url: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com # OCIリポジトリのURL
  type: helm
  username: baz
  password: qux
  enableOCI: true # OCIリポジトリを有効化する。
```

AWS ECRのように認証情報に有効期限がある場合は、認証情報を定期的に書き換えられるようにする。例えば、aws-ecr-credentialチャートを使用する。

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/release-2.0/operator-manual/security/#authentication
> - https://qiita.com/moriryota62/items/7d94027881d6fe9a478d
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd
> - https://artifacthub.io/packages/helm/architectminds/aws-ecr-credential

<br>

## 04. argocd-repo-creds

### argocd-repo-credsとは

ArgoCDがプライベートリポジトリを監視する時に必要な認証情報を設定する。

`argocd-repo`とは異なり、`1`個の認証情報で複数にリポジトリにアクセスできるようにする。

パブリックリポジトリの場合は、不要である。

> ↪️ 参考：
>
> - https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-repo-creds.yaml
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#repository-credentials

<br>

## 05. argo-secret (必須)

### argocd-secretとは

以下の認証情報やSSL証明書を設定する。

- クライアントが、任意の認証/認可方法でArgoCDにログインするためのユーザー名とパスワード
- ArgoCDがapiserverにリクエストを送信するためのSSL証明書と秘密鍵
- Webhookでリクエストを送信するためのSSL証明書

> ↪️ 参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/argocd-secret.yaml

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
  webhook.github.secret: shhhh! it's a github secret
  webhook.gitlab.secret: shhhh! it's a gitlab secret
  webhook.bitbucket.uuid: your-bitbucket-uuid
  webhook.bitbucketserver.secret: shhhh! it's a bitbucket server secret
  webhook.gogs.secret: shhhh! it's a gogs server secret
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
  oidc.config: |
    name: Auth0
    clientID: *****
    clientSecret: $argocd-secret:oidc.auth0.clientSecret

  ...

```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/#sensitive-data-and-sso-client-secrets

<br>

## 06. cluster-<エンドポイントURL>

### cluster-<エンドポイントURL>とは

ArgoCDのapplication-controllerが、デプロイ先と異なるClusterで稼働している場合に、デプロイ先のClusterのServiceAccountとapplication-controllerを紐づける必要がある。

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
      insecure: false
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
      insecure: false
      caData: <HTTPSに必要なSSL証明書>
  name: foo-cluster
  server: https://*****.gr7.ap-northeast-1.eks.amazonaws.com
```

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#clusters
> - https://github.com/mumoshu/decouple-apps-and-eks-clusters-with-tf-and-gitops#argocd-cluster-secret

<br>

### セットアップ

#### ▼ AWS EKS Clusterの場合

`【１】`

: ArgoCDの稼働するClusterをコンテキストとする。

```bash
$ kubectl config use-context <ArgoCDの稼働するClusterのARN>
```

`【２】`

: ArgoCDのパスワードを確認する。

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n argocd \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

`【３】`

: ArgoCDにログインする。

     この時、ユーザー名は`admin`でパスワードは先に確認したものとする。

```bash
$ argocd login <ArgoCDのドメイン名> --grpc-web
```

`【４】`

: ArgoCDに監視させたいClusterをコンテキストとする。

```bash
$ kubectl config use-context <ArgoCDに監視させたいClusterのARN>
```

`【５】`

: `argocd cluster add <デプロイ先のClusterのARN>`コマンドを実行すると、Secret、ServiceAccount (`argocd-manager`) 、ClusterRole (`argocd-manager-role`) 、ClusterRoleBinding (`argocd-manager-role-binding`) 、を作成できる。

```bash
$ argocd cluster add <ClusterのARN>

INFO[0011] ServiceAccount "argocd-manager" already exists in namespace "kube-system"
INFO[0011] ClusterRole "argocd-manager-role" updated
INFO[0011] ClusterRoleBinding "argocd-manager-role-binding" updated
Cluster 'https://*****.gr7.ap-northeast-1.eks.amazonaws.com' added
```

`【６】`

: もし手順がうまく行っていない場合、Applicationで指定するClusterのURLがArgoCDに登録されていないとして、以下のようなエラーになる。

```bash
cluster 'https://*****.gr7.ap-northeast-1.eks.amazonaws.com' has not been configured
```

執筆時点 (2022/01/30) では、`argocd cluster add`コマンドをマニフェストとして定義する方法はない。

もしタイムアウトになる場合、kube-apiserverのIPアドレスのアクセス制限に引っ掛かっていないかを確認する。

> ↪️ 参考：
>
> - https://dev.classmethod.jp/articles/argocd-for-external-cluster/
> - https://github.com/argoproj/argo-cd/issues/4651#issuecomment-1006960125

<br>
