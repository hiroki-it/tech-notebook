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

#### ・共通の手順

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

（３）ArgoCDダッシュボードを公開する．

```bash
$ kubectl patch svc argocd-server \
    -n argocd \
    -p '{"spec": {"type": "LoadBalancer"}}'
```
（４）ロードバランサーを構築する．IngressとIngressコントローラーを構築するか，または```minikube tunnel```コマンドや```kubectl port-forward```コマンドなど実行する．

```bash
$ minikube tunnel

$ kubectl port-forward svc/argocd-server -n argocd 8080:443
```

（５）Kubernetes上のArgoCDダッシュボードのパスワードを取得する．

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n argocd \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

#### ・argocdコマンド経由

（６）ArgoCDのコマンドをインストールする．

参考：https://argo-cd.readthedocs.io/en/stable/cli_installation/

```bash
$ curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
$ chmod +x /usr/local/bin/argocd
```

（７）ArgoCDにログインする．ユーザー名とパスワードを要求されるため，これらを入力する．

```bash
$ argocd login 127.0.0.1:8080

Username: admin
Password: *****
'admin:login' logged in successfully
```

（８）ArgoCD上に，監視対象のアプリケーションのリポジトリ（GitHub，Helm）を登録する．

参考：https://argo-cd.readthedocs.io/en/release-1.8/user-guide/commands/argocd_app_create/

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

（９）ArgoCD上でアプリケーションの監視を実行する．監視対象のリポジトリ（GitHub，Helm）の最新コミットが更新されると，これを自動的にプルしてくれる．アプリケーションのデプロイにはCircleCIが関与しておらず，Kubernetes上に存在するArgoCDがデプロイを行なっていることに注意する．

```bash
$ argocd app sync guestbook
```

（１０）自動同期を有効化する．

```bash
$ argocd app set guestbook --sync-policy automated
```

#### ・マニフェストファイル経由

（６）argocdコマンドの代わりに，マニフェストファイルでArgoCDを操作しても良い．

```bash
$ kubectl apply -f application.yml
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
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

#### ・argocdコマンド経由

ArgoCDを削除する．```--cascade```オプションを有効化すると，ArgoCDに登録されたアプリケーションの情報とApplicationリソースの両方を削除できる．

参考：

- https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-argocd
- https://argo-cd.readthedocs.io/en/stable/faq/

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

#### ・kubectlコマンド経由

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

```
$ kubectl delete app <ArgoCDのアプリケーション名>
```

<br>

## 03. spec（Applicationの場合）

### project

#### ・projectとは

アプリケーションのプロジェクト名を設定する．プロジェクト名は『```default```』とする必要がある．（理由は要調査）

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  project: default
```

<br>

### source

#### ・sourceとは

監視対象のリポジトリ（GitHub，Helm）と，これのターゲットを設定する．

#### ・directory

pathオプションで指定したディレクトリにサブディレクトリが存在している場合に，マニフェストファイルの再帰的検出を有効化する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    path: kubernetes
    directory:
      recurse: true
```

#### ・path

リポジトリで，マニフェストファイルが管理されているディレクトリを設定する．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    path: kubernetes
```

#### ・repoURL

リポジトリのURLを設定する．

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
```

#### ・targetRevision

リポジトリで，監視対象とするブランチやバージョンタグを設定する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    targetRevision: main
```

<br>

### destination

#### ・destinationとは

デプロイ先のKubernetesを設定する．

#### ・namespace

デプロイ先の名前空間を設定する．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  destination:
    namespace: foo
```

#### ・server

デプロイ先のKubernetesのクラスターのURLを設定する．URLの完全修飾ドメイン名は『```kubernetes.default.svc```』とする必要がある．（理由は要調査）

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  destination:
    server: https://kubernetes.default.svc
```

<br>

### syncPolicy

#### ・syncPolicyとは

GitOpsでのリポジトリ（GitHub，Helm）とKubernetesの間の自動同期を設定する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

#### ・automated

GitOpsでのリポジトリ（GitHub，Helm）とKubernetesの間の自動同期を有効化する．デフォルトでは，GtiHubリポジトリでマニフェストファイルが削除されても，ArgoCDはリソースの削除を自動同期しない．また，Kubernetes側のリソースを変更しても，リポジトリ（GitHub，Helm）の状態に戻すための自動同期は実行されない．これらは自動同期されるように設定しておいた方が良い．

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
      # Kubernetes側に変更があった場合，リポジトリ（GitHub，Helm）の状態に戻すようにする．
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

