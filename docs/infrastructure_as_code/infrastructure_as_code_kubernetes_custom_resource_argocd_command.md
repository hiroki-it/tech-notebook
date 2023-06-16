---
title: 【IT技術の知見】コマンド＠ArgoCD
description: コマンド＠ArgoCDの知見を記録しています。
---

# コマンド＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️：https://hiroki-it.github.io/tech-notebook/

<br>

## 01. argocd appコマンド

### create

#### ▼ createとは

ArgoCDのアプリケーションを作成する。

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

> ↪️：https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

<br>

### delete

#### ▼ deleteとは

ArgoCDのApplicationを削除する。

#### ▼ --cascade

`--cascade`オプションを有効化すると、ArgoCDのApplication自体と、Application配下のKubernetesリソースの両方を連鎖的に削除できる。

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=true
```

反対に無効化すると、Applicationのみを単体で削除する。

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

> ↪️：
>
> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

代わりに、`kubectl`コマンドを使用して ArgoCDのApplicationを削除しても良い。

```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

> ↪️：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

<br>

### get

#### ▼ --hard-refresh

redis-server上に保管されたapplication-controllerのキャッシュを削除し、再作成する。

```bash
$ argocd app get --hard-refresh
```

<br>

### set

#### ▼ setとは

指定したApplicationで、オプションを有効化する。

```bash
$ argocd app set foo-application --sync-policy automated
```

<br>

### sync

#### ▼ syncとは

指定したAplicationで、Syncのドライランを実行する。

```bash
$ argocd app sync foo-application --project foo-project
```

> ↪️：https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_sync/

#### ▼ --dry-run

```bash
$ argocd app sync foo-application --dry-run --project foo-project
```

#### ▼ --local

指定したAplicationで、ローカルマシンのディレクトリをリポジトリとしてポーリングする。

```bash
$ argocd app sync foo-application --local=<ディレクトリへのパス> --project foo-project
```

> ↪️：https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

<br>

## 02. argocd repoコマンド

### repo

#### ▼ repoとは

ArgoCDがプライベートリポジトリをポーリングする場合に、リポジトリを操作する。

#### ▼ add

プライベートリポジトリをポーリングする場合に、ポーリング対象として追加する。

```bash
$ argocd repo add oci://<OCIレジストリ名> \
    --type helm \
    --name <OCIリポジトリ名> \
    --enable-oci \
    --username AWS \
    --password $(aws ecr get-login-password --region ap-northeast-1)
```

> ↪️：
>
> - https://medium.com/@Technorite
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd

<br>

## 03. argocd loginコマンド

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

SSOでログインする。

コールバックURL (認可レスポンスのリダイレクト先URL) でIDプロバイダーで公開するポート番号を指定する。

また、ダッシュボード上でSSOを実施する場合とは異なり、IDプロバイダー側でローカルマシン (`localhost`) からのアクセスを許可する必要がある。

```bash
$ argocd login <ArgoCDのドメイン名> --sso --sso-port 465
```

> ↪️：
>
> - https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_login/
> - https://github.com/argoproj/argo-cd/issues/4104#issuecomment-685454997

<br>

## 03. argocd-application-controllerコマンド

### argocd-application-controllerコマンドとは

application-controllerを操作するコマンドである。

application-controllerのコンテナの起動コマンドとしても使われている。

> ↪️：https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/argocd-application-controller/

<br>

### グローバルオプション

#### ▼ --namespace

application-controllerの処理対象のNamespaceを設定する。

設定しても効果がないため、存在意義がわからない...

```bash
$ argocd-application-controller --namespace foo-namespace ...
```

#### ▼ --application-namespaces

ArgoCDがClusterスコープモードの場合に、Applicationを作成できるNamespaceを設定する。

```bash
$ argocd-application-controller --application-namespaces "*"
```

<br>

## 04. argocd-serverコマンド

### argocd-serverコマンドとは

argocd-serverを操作するコマンドである。

argocd-serverのコンテナの起動コマンドとしても使われている。

> ↪️：https://argo-cd.readthedocs.io/en/stable/operator-manual/server-commands/argocd-server/

<br>

### グローバルオプション

#### ▼ --namespace

argocd-serverの処理対象のNamespaceを設定する。

設定しても効果がないため、存在意義がわからない...

```bash
$ argocd-server --namespace foo-namespace ...
```

<br>

### version

ArgoCDのargocd-serverに内蔵されているプラグインのバージョンを取得する。

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
