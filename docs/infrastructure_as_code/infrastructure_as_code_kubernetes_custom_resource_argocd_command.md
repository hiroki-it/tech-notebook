---
title: 【IT技術の知見】コマンド＠ArgoCD
description: コマンド＠ArgoCDの知見を記録しています。
---

# コマンド＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。

> ↪️ 参考：https://hiroki-it.github.io/tech-notebook/

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

> ↪️ 参考：https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

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

> ↪️ 参考：
>
> - https://argo-cd.readthedocs.io/en/stable/faq/
> - https://hyoublog.com/2020/06/09/kubernetes-%E3%82%AB%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%89%E5%89%8A%E9%99%A4%E9%80%A3%E9%8E%96%E5%89%8A%E9%99%A4/

代わりに、`kubectl`コマンドを使用して ArgoCDのApplicationを削除してもよい。

```bash
$ kubectl delete app <ArgoCDのアプリケーション名>
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

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

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_sync/

#### ▼ --dry-run

```bash
$ argocd app sync foo-application --dry-run --project foo-project
```

#### ▼ --local

指定したAplicationで、ローカルマシンのディレクトリをリポジトリとしてwatchする。

```bash
$ argocd app sync foo-application --local=<ディレクトリへのパス> --project foo-project
```

> ↪️ 参考：https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

<br>

## 02. argocd repoコマンド

### repo

#### ▼ repoとは

ArgoCDがプライベートリポジトリをwatchする場合に、リポジトリを操作する。

#### ▼ add

プライベートリポジトリをwatchする場合に、watch対象として追加する。

```bash
$ argocd repo add oci://<OCIレジストリ名> \
    --type helm \
    --name <OCIリポジトリ名> \
    --enable-oci \
    --username AWS \
    --password $(aws ecr get-login-password --region ap-northeast-1)
```

> ↪️ 参考：
>
> - https://medium.com/@Technorite
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd

<br>

## 03. argocd loginコマンド

### login

#### ▼ loginとは

ダッシュボードにログインする。

```bash
$ argocd login <ArgoCDのドメイン名>

Username: admin
password: pass
'admin:login' logged in successfully
```

#### ▼ --sso、--sso-port

SSOでログインする。

コールバックURL先でIDプロバイダーで公開するポート番号を指定する。

```bash
$ argocd login <ArgoCDのドメイン名> --sso --sso-port 465
```

> ↪️ 参考：https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_login/

<br>
