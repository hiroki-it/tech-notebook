---
title: 【IT技術の知見】コマンド＠ArgoCD
description: コマンド＠ArgoCDの知見を記録しています。
---

# コマンド＠ArgoCD

## はじめに

本サイトにつきまして、以下をご認識のほど宜しくお願いいたします。


> ℹ️ 参考：https://hiroki-it.github.io/tech-notebook-mkdocs/

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
    --sync-option CreateNamespace=true
```

> ℹ️ 参考：https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

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

#### ▼ --dry-run

```bash
$ argocd app sync foo-application --dry-run
```

#### ▼ --local

指定したAplicationで、ローカルマシンのディレクトリをリポジトリとして監視する。

```bash
$ argocd app sync foo-application --local=<ディレクトリへのパス>
```

> ℹ️ 参考：https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

<br>

## 02. argocd repoコマンド

### repo

#### ▼ repoとは

ArgoCDがプライベートリポジトリを監視する場合に、リポジトリを操作する。

#### ▼ add

プライベートリポジトリを監視する場合に、監視対象として追加する。

```bash
$ argocd repo add oci://<OCIレジストリ名> \
    --type helm \
    --name <OCIリポジトリ名> \
    --enable-oci \
    --username AWS \
    --password $(aws ecr get-login-password --region ap-northeast-1)
```

> ℹ️ 参考：
>
> - https://medium.com/@Technorite
> - https://stackoverflow.com/questions/66851895/how-to-deploy-helm-charts-which-are-stored-in-aws-ecr-using-argocd

<br>

## 03. argocd loginコマンド

### login

#### ▼ loginとは

ダッシュボードにログインする。

```bash
$ argocd login 127.0.0.1:8080

Username: admin
Password: *****
'admin:login' logged in successfully
```

<br>
