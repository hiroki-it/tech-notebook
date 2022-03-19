---
title: 【知見を記録するサイト】ArgoCD＠DevOps
description: ArgoCD＠DevOpsの知見をまとめました．
---

# ArgoCD＠DevOps

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. ArgoCDの仕組み

### 構造

![argocd](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd.png)

指定したブランチのコードの状態を監視する．プッシュによってコードが変更された場合に，Kubernetesの状態をこれに同期する．

参考：

- https://blog.vpantry.net/2021/01/cicd-2/
- https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
- https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

<br>

## 01-02. ユースケース

### AWS EKSへのデプロイ

参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

![argocd_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_eks.png)

<br>

## 02. セットアップ

### インストール

#### ・マニフェストファイル経由

参考：https://argo-cd.readthedocs.io/en/stable/getting_started/

（１）ローカルPCから本番環境にArgoCDをインストールする場合，```kubetcl```コマンドのコンテキストを間違える可能性がある．そのため，kubectlコマンド専用の踏み台サーバーを用意してもよい．kubectlコマンドの宛先を，EKSのkube-apiserverに変更する．

```bash
# EKSにデプロイする場合
$ aws eks --region ap-northeast-1 update-kubeconfig --name foo-cluster
```

参考：

- https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/cluster-endpoint.html
- https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance
- http://linuxcommand2007.seesaa.net/article/476794217.html

（２）ArgoCDのマニフェストファイルを指定し，Kubernetes上にArgoCDをデプロイする．

```bash
$ kubectl create namespace argocd
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

<br>

### ArgoCDとGitHubリポジトリ間の同期

参考：https://argo-cd.readthedocs.io/en/stable/getting_started/

（１）ArgoCDダッシュボードを公開する．

```bash
$ kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

（２）Kubernetes上のArgoCDダッシュボードのパスワードを取得する．

```bash
$ kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

（３）ArgoCDのコマンドをインストールする．

参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ chmod +x /usr/local/bin/argocd
```

（４）ArgoCDにログインする．ユーザー名とパスワードを要求されるため，これらを入力する．

```bash
$ argocd login 127.0.0.1:8080

Username: admin
Password: *****
'admin:login' logged in successfully
```

（５）ArgoCD上に，監視対象のアプリケーションのGitHubリポジトリを登録する．

```bash
$ argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
```

（６）ArgoCD上でアプリケーションの監視を実行する．監視対象のGitHubリポジトリの最新コミットが更新されると，これを自動的にプルしてくれる．アプリケーションのデプロイにはCircleCIが関与しておらず，Kubernetes上に存在するArgoCDがデプロイを行なっていることに注意する．

```bash
$ argocd app sync guestbook
```

（７）自動同期を有効化する．

```bash
$ argocd app set guestbook --sync-policy automated
```

<br>

## 03. spec（Applicationの場合）

### project

#### ・projectとは

アプリケーションのプロジェクト名を設定する．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  project: foo-manifests
```

<br>

### source

#### ・sourceとは

監視するGitHubリポジトリと，これのターゲットを設定する．ターゲットには，ブランチ，バージョンタグを指定できる．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    repoURL: https://github.com/hiroki-it/foo-manifests.git
    targetRevision: main
```

<br>

### destination

#### ・destinationとは

Kubernetesの名前空間のURLと名前を設定する．この名前空間にマニフェストファイルがプルされる．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  destination:
    server: https://kubernetes.foo.svc
    namespace: foo
```

<br>

### syncPolicy

#### ・syncPolicyとは

GitOpsでのGitHubリポジトリとKubernetes間の自動同期を設定する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

#### ・automated

GitOpsでのGitHubリポジトリとKubernetes間の自動同期を有効化する．デフォルトでは，GtiHubリポジトリでマニフェストファイルが削除されても，ArgoCDはリソースの削除を自動同期しない．また，Kubernetes側のリソースを変更しても，GitHubリポジトリの状態に戻すための自動同期は実行されない．これらは自動同期されるように設定しておいた方が良い．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  syncPolicy:
    automated:
      # リソースの削除を自動同期する．
      prune: true
      # Kubernetes側に変更があった場合，GitHubリポジトリの状態に戻すようにする．
      selfHeal: true
```

#### ・syncOptions

ArgoCDのリソースの作成対象とする名前空間を自動的に作成する．ArgoCDのためだけの名前空間を用意する場合は，これを有効化しておいた方が良い．

参考：

- https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
- https://dev.classmethod.jp/articles/argocd-for-external-cluster/

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  syncPolicy:
    syncOptions:
      - CreateNamespace=true
```

