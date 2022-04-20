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

指定したブランチのコードの状態を監視する．プッシュによってコードが変更された場合に，Kubernetesの状態をこれに同期する．ちなみに，ArgoCD自身のマニフェストファイルに変更も同期できる．

参考：

- https://blog.vpantry.net/2021/01/cicd-2/
- https://qiita.com/kanazawa1226/items/bb760bddf8bd594379cb
- https://blog.argoproj.io/introducing-argo-cd-declarative-continuous-delivery-for-kubernetes-da2a73a780cd
- https://speakerdeck.com/sshota0809/argocd-teshi-xian-suru-kubernetes-niokeruxuan-yan-de-risosuteriharifalseshi-jian?slide=49

<br>

## 01-02. ユースケース

### アプリケーションリポジトリ起点

#### ▼ テンプレート構成管理ツールを用いない場合

![argocd_eks](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_eks.png)

（１）アプリケーションリポジトリで，開発者がアプリケーションの変更をmainブランチにマージする．

（２）CIツールが，イメージをECRにプッシュする．

（３）CIツールは，マニフェストリポジトリをクローンし，マニフェストファイルのイメージのハッシュ値を変更する．このマニフェストファイルの変更は，```yq```コマンドなどで直接実行する．変更したマニフェストをマニフェストリポジトリにプッシュする．

（４）プルリクを自動作成する．

（５）マニフェストリポジトリで，リリース責任者がプルリクをmainブランチにマージする．

（６）ArgoCDがマニフェストファイルの変更を検知し，Kubernetesにプルする．

参考：https://www.ogis-ri.co.jp/otc/hiroba/technical/kubernetes_use/part1.html

#### ▼ テンプレート構成管理ツールを用いた場合

![argocd_eks_helm](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_eks_helm.png)

（１）同じ

（２）同じ

（３）CIツールは，マニフェストリポジトリをクローンし，チャート内のマニフェストファイルのイメージのハッシュ値を変更する．このマニフェストファイルの変更は，```yq```コマンドなどで直接実行する．

（４）同じ

（５）同じ

（６）ArgoCDがマニフェストファイルの変更を検知し，Kubernetesにプルする．

参考：

- https://medium.com/riskified-technology/how-to-build-a-ci-cd-process-that-deploys-on-kubernetes-and-focuses-on-developer-independence-7dc4c20984a
- https://docs.microsoft.com/ja-jp/azure/architecture/microservices/ci-cd-kubernetes

<br>

### マニフェストリポジトリ起点

![argocd_gcp](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_gcp.png)

参考：https://qiita.com/Nishi53454367/items/4a4716dfbeebd70295d1

（１）マニフェストリポジトリで，開発者がマニフェストファイルの変更をmainブランチにマージする．

（２）マニフェストリポジトリで，リリース責任者がマニフェストファイルやチャートの変更をmainブランチにマージする．

（３）ArgoCDがマニフェストファイルの変更を検知し，Kubernetesにプルする．

<br>

## 02. セットアップ

### インストール

#### ▼ 共通の手順

参考：

（１）ローカルPCから本番環境にArgoCDをインストールする場合，```kubetcl```コマンドのコンテキストを間違える可能性がある．そのため，kubectlコマンド専用の踏み台サーバーを用意してもよい．EKSのコンテキストを作成し，kubectlコマンドの宛先を，EKSのkube-apiserverに変更する．

```bash
$ aws eks update-kubeconfig --region ap-northeast-1 --name foo-eks-cluster
$ kubectl config use-context <クラスターARN>
```

参考：

- https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/getting-started-console.html
- https://docs.aws.amazon.com/ja_jp/eks/latest/userguide/cluster-endpoint.html
- https://zenn.dev/yoshinori_satoh/articles/eks-kubectl-instance
- http://linuxcommand2007.seesaa.net/article/476794217.html

（２）ArgoCDのマニフェストファイルを指定し，Kubernetes上にArgoCDをデプロイする．

https://argo-cd.readthedocs.io/en/stable/getting_started/

```bash
$ kubectl create namespace argocd
$ kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# デプロイされたことを確認する．
$ kubectl get all -n argocd
```

（３）ArgoCDダッシュボードを公開する．

```bash
$ kubectl patch svc argocd-server \
    -n argocd \
    -p '{"spec": {"type": "LoadBalancer"}}'
```
（４）```443```番ポートにルーティングできるロードバランサーを構築する．この時，IngressとIngressコントローラーを構築するか，```kubectl port-forward```コマンドなど実行する．```minikube tunnel```ではポート番号を指定できないことに注意する．

```bash
$ kubectl port-forward svc/argocd-server -n argocd 8080:443
```

（５）Kubernetes上のArgoCDダッシュボードのパスワードを取得する．

```bash
$ kubectl get secret argocd-initial-admin-secret \
    -n argocd \
    -o jsonpath="{.data.password}" | base64 -d; echo
```

#### ▼ Argocd経由

（６）argocdコマンドをインストールする．

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

（９）ArgoCD上でアプリケーションの監視を実行する．事前に```--dry-run```オプションで監視対象のリソースを確認すると良い．監視対象のリポジトリ（GitHub，Helm）の最新コミットが更新されると，これを自動的にプルしてくれる．アプリケーションのデプロイにはCircleCIが関与しておらず，Kubernetes上に存在するArgoCDがデプロイを行なっていることに注意する．

```bash
$ argocd app sync guestbook --dry-run
```

（１０）自動同期を有効化する．

```bash
$ argocd app set guestbook --sync-policy automated
```

#### ▼ マニフェストファイル経由

（６）argocdコマンドの代わりに，マニフェストファイルでArgoCDを操作しても良い．

```bash
$ kubectl apply -f application.yaml
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

#### ▼ Argocd経由

ArgoCDのApplicationを削除する．```--cascade```オプションを有効化すると，ArgoCDに登録されたアプリケーションの情報とApplicationの両方を削除できる．

参考：

- https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-argocd
- https://argo-cd.readthedocs.io/en/stable/faq/

```bash
$ argocd app delete <ArgoCDのアプリケーション名> --cascade=false
```

もし，Applicationが削除中のまま進行しない時は，Applicationのマニフェストファイルを```kubectl edit```コマンドで```metadata.finalizers```キーの値を空配列に変更する．

参考：https://stackoverflow.com/questions/67597403/argocd-stuck-at-deleting-but-resources-are-already-deleted

```bash
$ kubectl edit apps <ArgoCDのアプリケーション名> -n argocd
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  finalizers: [] # <--- 空配列に変更する．
spec:

# 〜 中略 〜
```

#### ▼ Kubectl経由

ArgoCDのApplicationを削除する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/app_deletion/#deletion-using-kubectl

```
$ kubectl delete app <ArgoCDのアプリケーション名>
```

<br>

### 開発環境での動作確認

#### ▼ 別のデプロイツールを用いる

実装が複雑になることを避けるため，開発環境に対するデプロイには，ArgoCD以外のツールを用いる．

（例）Skaffold

#### ▼ ローカルPCを監視

ローカルPCのディレクトリをリポジトリとして監視する．あらかじめ，リポジトリの自動プルの設定を無効化しておく必要がある．

参考：https://github.com/argoproj/argo-cd/issues/839#issuecomment-452270836

```bash
 $ argocd app sync <ArgoCDのアプリケーション名> --local=<ディレクトリへのパス>
```

<br>

## 03. spec（Applicationの場合）

### project

#### ▼ projectとは

アプリケーションのプロジェクト名を設定する．プロジェクト名は『```default```』とする必要がある．（理由は要調査）

参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

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

#### ▼ sourceとは

マニフェストリポジトリ（GitHub）やチャートリポジトリ（ArtifactHub，GitHub，ECR，ArtifactHub）を設定する．

参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

<br>

### source（マニフェストリポジトリの場合）

#### ▼ directory

監視対象として```path```オプションで指定したディレクトリの構造に合わせて，特定のマニフェストファイルを指定できるようにする．2022/04現在，Kubernetes以外のリソース（Istioなど）のAPIはコールできず，リソースをデプロイできないことに注意する．

参考：

- https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L78
- https://argo-cd.readthedocs.io/en/stable/user-guide/tool_detection/

| オプション    | 説明                                                         |
| ------------- | ------------------------------------------------------------ |
| ```include``` | ```path```オプションで指定したディレクトリ内で，特定のマニフェストファイルのみを指定する． |
| ```exclude``` | ```path```オプションで指定したディレクトリ内で，特定のマニフェストファイルを除外する． |
| ```recurse``` | ```path```オプションで指定したディレクトリにサブディレクトリが存在している場合に，全てのマニフェストファイルを指定できるように，ディレクトリ内の再帰的検出を有効化する． |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    path: ./kubernetes
    directory:
      recurse: true
```

#### ▼ path

GitHub上の監視対象のディレクトリを設定する．



```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    path: ./kubernetes
```

#### ▼ repoURL

マニフェストリポジトリのURLを設定する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/tracking_strategies/#git

マニフェストリポジトリとしてGitHubを指定する場合は，以下の通り．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-manifests.git
```

#### ▼ targetRevision

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

### source（チャートリポジトリの場合）

#### ▼ chart

用いるチャートを設定する．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    chart: foo-chart
```

#### ▼ helm

参考：

- https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L25
- https://mixi-developers.mixi.co.jp/argocd-with-helm-fee954d1003c

| 設定項目          | 説明                                                         | 補足                                                         |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| ```releaseName``` | デプロイするリリース名を設定する．                           |                                                              |
| ```values```      | デフォルト値を，```values```ファイルとしてではなく，ArgoCDのマニフェストファイルにハードコーディングして定義する． |                                                              |
| ```valueFiles```  | デプロイ時に用いる```values```ファイルを設定する．           | ```values```ファイルは，チャートと同じリポジトリにある必要がある． |

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    helm:
      releaseName: prd
      valueFiles:
        - prd-values.yaml
```

#### ▼ repoURL

チャートリポジトリのURLを設定する．

参考：https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#helm-chart-repositories

チャートリポジトリとして，GitHubを指定する場合に，リポジトリのURLを設定する．

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    repoURL: https://github.com/hiroki-hasegawa/foo-chart.git
```

チャートリポジトリとして，AWS ECRを指定する場合に，ECRのURLを設定する．別途，ECRへのログインが必要なことに注意する．

参考：https://docs.aws.amazon.com/ja_jp/AmazonECR/latest/userguide/ECR_on_EKS.html#using-helm-charts-eks

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    repoURL: oci://<アカウントID>.dkr.ecr.<リージョン>.amazonaws.com/foo-chart
```

#### ▼ targetRevision

チャートリポジトリとして，GitHubを指定する場合に，監視対象とするブランチやバージョンタグを設定する．

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

チャートリポジトリとして，AWS ECRを指定する場合に，チャートのバージョンを設定する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#declarative

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  source:
    targetRevision: 1.0.0
```

<br>

### destination

#### ▼ destinationとは

デプロイ先のKubernetesを設定する．

参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

#### ▼ namespace

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

#### ▼ server

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

#### ▼ syncPolicyとは

GitOpsでのリポジトリ（GitHub，Helm）とKubernetesの間の自動同期を設定する．

参考：

- https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy
- https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml#L113

#### ▼ automated

GitOpsでのリポジトリ（GitHub，Helm）とKubernetesの間の自動同期を有効化する．

参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automated-sync-policy

| オプション            | 説明                                                                                                                                                     |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| ```prune```      | リソースの削除を自動同期する．デフォルトでは，GtiHubリポジトリでマニフェストファイルが削除されても，ArgoCDはリソースの削除を自動同期しない．                                                                           |
| ```selfHeal```   | Kubernetes側に変更があった場合，リポジトリ（GitHub，Helm）の状態に戻すようにする．デフォルトでは，Kubernetes側のリソースを変更しても，リポジトリの状態に戻すための自動同期は実行されない．                                           |
| ```allowEmpty``` | 自動同期中のApplicationの削除（Applicationの空）を有効化する．<br>参考：https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/#automatic-pruning-with-allow-empty-v18 |



```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  namespace: argocd
  name: argocd-application
spec:
  syncPolicy:
    automated:
      allowEmpty: true
      prune: true
      selfHeal: true
```

#### ▼ syncOptions

GtiOpsでのマニフェストファイルの同期処理の詳細を設定する．

参考：

- https://argo-cd.readthedocs.io/en/stable/user-guide/sync-options/#sync-options
- https://dev.classmethod.jp/articles/argocd-for-external-cluster/

| オプション                   | 説明                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| ```CreateNamespace```        | Applicationの作成対象とする名前空間を自動的に作成する．ArgoCDがインストールされる名前空間と，Applicationを作成する名前空間が異なる場合に，これを有効化しておいた方が良い． |
| ```Validate```               |                                                              |
| ```PrunePropagationPolicy``` |                                                              |
| ```PruneLast```              |                                                              |



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

<br>

## 04. spec（Rolloutの場合）

### analysis

#### ▼ analysisとは

Progressive Deliveryを用いる場合に，詳細を設定する．

参考：https://github.com/argoproj/argo-cd/blob/master/docs/operator-manual/application.yaml

#### ▼ successfulRunHistoryLimit

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
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
  name: foo-rollout
spec:
  analysis:
    unsuccessfulRunHistoryLimit: 10
```

<br>

### strategy

#### ▼ strategyとは

デプロイ手法を設定する．

#### ▼ blueGreen

![argocd_blue-green-deployment](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_blue-green-deployment.png)

ブルーグリーンデプロイメントを用いて，新しいPodをリリースする．

参考：

- https://argoproj.github.io/argo-rollouts/features/bluegreen/
- https://korattablog.com/2020/06/19/argocd%E3%81%AB%E3%82%88%E3%82%8Bbluegreen%E3%83%87%E3%83%97%E3%83%AD%E3%82%A4%E3%82%92%E8%A9%A6%E3%81%99/

| オプション                       | 説明                                                                                       |
|-----------------------------|------------------------------------------------------------------------------------------|
| ```activeService```         | ブルー環境へのルーティングに用いるServiceを設定する．                                                           |
| ```autoPromotionEnabled```  | ブルー環境からグリーン環境への自動切り替えを有効化するかどうかを設定する．もし無効化した場合，```autoPromotionSeconds```の秒数だけ切り替えを待機する． |
| ```autoPromotionSeconds```  | ブルー環境からグリーン環境への切り替えを手動で行う場合に，切り替えを待機する最大秒数を設定する．最大秒数が経過すると，自動で切り替わってしまうことに注意する．          |
| ```previewReplicaCount```   | グリーン環境のPod数を設定する．                                                                        |
| ```previewService```        | グリーン環境へのルーティングに用いるServiceを設定する．                                                          |
| ```scaleDownDelaySeconds``` |                                                                                          |



```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: foo-blue-green-rollout
spec:
  strategy:
    blueGreen:
      activeService: foo-active-service
      previewService: foo-preview-service
      previewReplicaCount: 1
      autoPromotionEnabled: true
      scaleDownDelaySeconds: 30
```

#### ▼ canary

![argocd_canary-release](https://raw.githubusercontent.com/hiroki-it/tech-notebook/master/images/argocd_canary-release.png)

カナリアリリースを用いて，新しいPodをリリースする．

参考：

- https://argoproj.github.io/argo-rollouts/features/canary/
- https://korattablog.com/2020/06/19/argocd%E3%81%AEcanary-deployment%E3%82%92%E8%A9%A6%E3%81%99/

| オプション      | 説明                                                                                                  |
|------------|-----------------------------------------------------------------------------------------------------|
| ```step``` | カナリアリリースの手順を設定する．<br>・```setWeight```：新しいPodへの重み付けを設定する．<br>・```pause```：次の手順に移行せずに待機する．待機秒数を設定できる． |



```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: foo-canary-rollout
spec:
  strategy:
    canary:
      steps:
        - setWeight: 25
        - pause:
            duration: 10
```

<br>
