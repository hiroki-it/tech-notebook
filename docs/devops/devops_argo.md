---
title: 【知見を記録するサイト】Argo＠DevOps
description: Argo＠DevOpsの知見をまとめました．
---

# Argo＠DevOps

## はじめに

本サイトにつきまして，以下をご認識のほど宜しくお願いいたします．

参考：https://hiroki-it.github.io/tech-notebook-mkdocs/about.html

<br>

## 01. 仕組み

### 基本構造

指定したブランチのコードの状態を監視する．プッシュによってコードが変更された場合に，Kubernetesの状態をこれに同期する．

![argo](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argo.png)

参考：

- https://blog.vpantry.net/2021/01/cicd-2/
- https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
- https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd

<br>

### AWSで使う場合

参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

![argo_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argo_eks.png)

<br>

## 02. セットアップ

### インストール

#### ・コマンド経由

ローカルPCにアプリケーションをデプロイする．

参考：https://argo-cd.readthedocs.io/en/stable/getting_started/

（１）ArgoCDを動かすためリソースをKubernetes上にデプロイする．クラウドインフラ上にデプロイする場合も，コマンドが異なるだけで，同じ仕組みである．

```bash
$ kubectl create namespace argocd
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

（２）ArgoCDのコマンドをインストールする．

参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ chmod +x /usr/local/bin/argocd
```

（３）ダッシュボードを公開する．

```bash
$ kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

（４）ダッシュボードのパスワードを取得する．

```bash
$ kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

（５）ArgoCDにログインする．

```bash
$ argocd login 127.0.0.1:8080
```

（６）ArgoCD上に，監視対象のアプリケーションのGitリポジトリを登録する．

```bash
$ argocd app create guestbook --repo https://github.com/argoproj/argocd-example-apps.git --path guestbook --dest-server https://kubernetes.default.svc --dest-namespace default
```

（７）今回は，サンプルアプリをローカルPC上にデプロイする．ArgoCD上でアプリケーションの監視を実行する．監視対象のGitリポジトリの最新コミットが更新されると，これを自動的にプルしてくれる．アプリケーションのデプロイにはCircleCIが関与しておらず，Kubernetes上に存在するArgoCDがデプロイを行なっていることに注意する．

```bash
$ argocd app sync guestbook
```

（８）自動同期を有効化する．

```bash
$ argocd app set guestbook --sync-policy automated
```

<br>

## リポジトリの種類

GitOpsのベストプラクティスに則って，アプリケーションとマニフェストファイルのソースコードを別々のリポジトリで管理する．

参考：https://blog.argoproj.io/5-gitops-best-practices-d95cb0cbe9ff

例えば，以下の３つのリポジトリを用意する．

- バックエンド
- フロントエンド
- マニフェスト

## バックエンドリポジトリ

### 構成

マイクロサービスを管理する．

環境構築の方法は，アプリケーションチームに任せる（docker-composeでもよい）．

ただ，Kubernetes上でやることが少なくなるように，できるだけDockerfile内に全ての設定を実装してもらうことが望ましい．

バックエンドのリポジトリは，複数のマイクロサービスを管理するモノリポジトリとするか，またはマイクロサービスごとにリポジトリを分けるポリリポジトリを選ぶ．

ちなみに，Google，Facebook，Twitterはモノリポジトリで運用しているらしい

参考：https://www.fourtheorem.com/blog/monorepo

### CI

CircleCIやGitHubActionsでイメージのビルドからプッシュまでをマイクロサービスごとに行う．

また，EKS上のArgoCDコンテナのデプロイを発火させるために，マニフェストリポジトリでリリースブランチの作成とプルリクを作成する処理をCI上で行う．

具体的には，イメージのビルド&プッシュ以外に，以下を行う．

1. マニフェストリポジトリをクローンする．
2. CircleCIコンテナからリポジトリに接続できるように，CircleCIコンテナの公開鍵をマニフェストリポジトリに登録する．
3. Gitコマンドをセットアップする．
4. マニフェストリポジトリ上でリリースブランチを作成する．
5. yqコマンドを用いて，Kubernetesマニフェストファイル（ymlファイル）上のイメージタグを変更するようにコミットし，これをリリースのプルリクとする．

参考：

- https://circleci.com/ja/blog/gitops-argocd/
- https://github.com/tadashi0713/circleci-demo-gitops-app/blob/master/.circleci/config.yml

## マニフェストリポジトリ

### 構成

Kubernetes，Istio，ArgoCDのマニフェストファイルを管理する．

それぞれのマニフェストファイルは，実行環境タグの値が異なる（```dev```，```stg```，```prd```）以外にほとんど同じで問題ない．

実行環境ごとマニフェストファイルを量産すると，ymlファイルの管理が非常に大変になるため，共通化できるところは共通化した方が良い．

マニフェストファイルの共通化ツールとしては，以下がある．

- Helm：
  - https://github.com/helm/helm
  - https://uqichi.hatenablog.com/entry/helm-pros-cons/ 
- Kustomize
  - https://github.com/kubernetes-sigs/kustomize
  - https://atmarkit.itmedia.co.jp/ait/articles/2101/21/news004.html



### CI

必須ではないが，マニフェストファイルのテストを実行しても良い．

テストツール例

- kubeval：https://github.com/instrumenta/kubeval

### CD

バックエンドリポジトリのCIによって，リリースブランチとプルリク（イメージタグの変更）の作成が行われる．

マニフェストリポジトリ側では以下を行う．

1. リリースブランチ上のプルリクをmainブランチにマージする．
2. EKS上で稼働するArgoCDコンテナは，マニフェストリポジトリのmainブランチの状態変化を監視している．ArgoCDコンテナは，mainブランチへのリリースブランチのマージを検知する．これはKubernetesを操作し，ECRから新しいイメージをプルし，コンテナを構築させる．デプロイの方法は，Kubernetesのマニフェストファイル上でローリングアップデートやB/Gデプロイメントなどを定義できる．

参考：

- https://circleci.com/ja/blog/gitops-argocd/
- https://github.com/tadashi0713/circleci-demo-gitops-manifest

## AWS環境

EKS上にArgoCDコンテナを稼働させ，マニフェストリポジトリの状態を監視する．

ただ，初期構築時はEKS上にArgoCDコンテナがなく，GitOpsができないため，EKS上にArgoCDを手動でセットアップする必要がある．

参考：

- https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html
- https://www.eksworkshop.com/intermediate/290_argocd/install/

EKS上にArgoCDをセットアップする時には，```kubectl```コマンドを使用する必要があり，```awscli```コマンドを用いて，```kubectl```コマンドの向き先を変更する．

```bash
# kubectlコマンドがEKSに向くように，.kube/configファイルを新しく作成する．
$ aws eks --region ap-northeast-1 update-kubeconfig --name foo-cluster

# kubectlがEKSに向いていることを確認する．
$ kubectl config get-contexts

CURRENT   NAME                    CLUSTER                 AUTHINFO                  NAMESPACE
*         xxxxxxxxx/foo-cluster   xxxxxxxxx/foo-cluster   xxxxxxxxx/foo-cluster
```

一度インストールしてしまえば，ArgoCDの設定自体もマニフェストファイルの一つとしてマニフェストリポジトリで管理できる．

参考：https://tech.recruit-mp.co.jp/infrastructure/gitops-cd-by-using-argo-cd-at-eks/
