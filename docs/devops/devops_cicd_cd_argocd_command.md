---
title: 【IT技術の知見】コマンド＠ArgoCD
description: コマンド＠ArgoCDの知見を記録しています。
---

# コマンド＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> - https://hiroki-it.github.io/tech-notebook/

<br>

## 01. argocd appコマンド

### create

#### ▼ createとは

ArgoCD のアプリケーションを作成する。

```bash
$ argocd app create foo-application \
    --project default \
    --repo https://github.com/hiroki-hasegawa/foo-manifests.git \
    --revision main \
    --dest-server https://kubernetes.default.svc \
    --dest-namespace foo-namespace \
    --auto-prune \
    --self-heal \
    --sync-option CreateNamespace=false
```

> - https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

<br>

### delete

#### ▼ deleteとは

ArgoCD の Application を削除する。

#### ▼ --cascade

`--cascade` オプションを有効化すると、ArgoCD の Application 自体と、Application 配下の Kubernetes リソースの両方を連鎖的に削除できる。

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=true
```

反対に無効化すると、Application のみを単体で削除する。

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

代わりに、`kubectl` コマンドを使用して ArgoCD の Application を削除してもよい。

```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

<br>

### get

#### ▼ --hard-refresh

redis-server 上に保管した application-controller のキャッシュを削除し、再作成する。

```bash
$ argocd app get --hard-refresh
```

<br>

### set

#### ▼ setとは

指定した Application で、オプションを有効化する。

```bash
$ argocd app set foo-application --sync-policy automated
```

<br>

### sync

#### ▼ syncとは

指定した Application で、Sync のドライランを実行する。

```bash
$ argocd app sync foo-application --project foo-project
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_sync/

#### ▼ --dry-run

```bash
$ argocd app sync foo-application --dry-run --project foo-project
```

#### ▼ --local

指定した Application で、ローカルマシンのディレクトリをリポジトリとしてポーリングする。

```bash
$ argocd app sync foo-application --local=<ディレクトリへのパス> --project foo-project
```

> - https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

<br>

## 02. argocd adminコマンド

### cluster

application-controller のレプリカ当たるの情報を取得できる。

シャード数や Reconcile 中の Application 数を知れる。

```bash
$ argocd admin cluster stats

SERVER                          SHARD  CONNECTION  NAMESPACES COUNT  APPS COUNT  RESOURCES COUNT
https://*.*.*.*                 4      Successful  36                274         9307
https://*.*.*.*                 5      Successful  38                279         13726
https://*.*.*.*                 3      Successful  32                204         8872
https://*.*.*.*                 4      Successful  34                218         2185
https://*.*.*.*                 3      Successful  35                282         14265
https://kubernetes.default.svc  0      Successful  1                 10          3192
```

> - https://argo-cd.readthedocs.io/en/stable/

<br>

## 03. argocd clusterコマンド

### add

#### ▼ addとは

ArgoCD にポーリングさせたい Cluster を登録する。

```bash
$ argocd cluster add <デプロイ先のClusterのARN>
```

#### ▼ --name

ダッシュボードで Cluster 名を使用してフィルタリングするときに、その表示名を設定する。

```bash
$ argocd cluster add <デプロイ先のClusterのARN> --name <ダッシュボード上でのClusterの表示名>
```

#### ▼ --upsert

すでに Cluster を登録済みの場合、これを上書きする。

```bash
$ argocd cluster add <デプロイ先のClusterのARN> --name <ダッシュボード上でのClusterの表示名> --upsert
```

<br>

## 04. argocd repoコマンド

### repo

#### ▼ repoとは

ArgoCD がプライベートリポジトリをポーリングする場合、リポジトリを操作する。

#### ▼ add

プライベートリポジトリをポーリングする場合、ポーリング対象として追加する。

```bash
$ argocd repo add oci://<OCIレジストリ名> \
    --type helm \
    --name <OCIリポジトリ名> \
    --enable-oci \
    --username AWS \
    --password $(aws ecr get-login-password --region ap-northeast-1)
```

> - https://medium.com/@Technorite
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd

<br>

## 05. argocd loginコマンド

### login

#### ▼ loginとは

ダッシュボードにログインする。

```bash
$ argocd login <ArgoCDのドメイン名> \
    --username admin \
    --password <パスワード>

'admin:login' logged in successfully
```

#### ▼ --sso、--sso-port

SSO でログインする。

コールバック URL (認可レスポンスのリダイレクト先 URL) で ID プロバイダーで公開するポート番号を指定する。

また、ダッシュボード上で SSO を実施する場合とは異なり、ID プロバイダー側でローカルマシン (`localhost`) からのリクエストを許可する必要がある。

```bash
$ argocd login <ArgoCDのドメイン名> --sso --sso-port 465
```

> - https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_login/
> - https://github.com/argoproj/argo-cd/issues/4104#issuecomment-685454997

<br>

## 06. argocd-application-controllerコマンド

### argocd-application-controllerコマンドとは

application-controller を操作するコマンドである。

application-controller のコンテナの起動コマンドとしても使われている。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/argocd-application-controller/

<br>

### グローバルオプション

#### ▼ --namespace

application-controller の処理対象の Namespace を設定する。

設定しても効果がないため、存在意義がわからない...

```bash
$ argocd-application-controller --namespace foo-namespace ...
```

#### ▼ --application-namespaces

ArgoCD が Cluster スコープモードの場合、Application を作成できる Namespace を設定する。

```bash
$ argocd-application-controller --application-namespaces "*"
```

<br>

## 07. argocd-serverコマンド

### argocd-serverコマンドとは

argocd-server を操作するコマンドである。

argocd-server のコンテナの起動コマンドとしても使われている。

> - https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/argocd-server/

<br>

### グローバルオプション

#### ▼ --namespace

argocd-server の処理対象の Namespace を設定する。

設定しても効果がないため、存在意義がわからない...

```bash
$ argocd-server --namespace foo-namespace ...
```

#### ▼ --application-namespaces

ArgoCD が Cluster スコープモードの場合、Application を操作できる Namespace を設定する。

```bash
$ argocd-server --application-namespaces "*"
```

<br>

### version

ArgoCD の argocd-server に内蔵されているプラグインのバージョンを取得する。

```bash
$ argocd-server version

{
    "Version": "v2.6.7+5bcd846",
    "BuildDate": "2023-03-23T14:57:27Z",
    "GitCommit": "*****",
    "GitTreeState": "clean",
    "GoVersion": "go1.18.10",
    "Compiler": "gc",
    "Platform": "linux/amd64",
    "KustomizeVersion": "v4.5.7 2022-08-02T16:35:54Z",
    "HelmVersion": "v3.10.3+g835b733",
    "KubectlVersion": "v0.24.2",
    "JsonnetVersion": "v0.19.1"
}
```

<br>
